import type {
  ChallengeStep,
  GestureState,
  LevelDefinition,
  PuppetPose,
} from '../types';
import { clamp, distance2D } from '../utils/math';

export interface ChallengeFrameUpdate {
  stepIndex: number;
  currentStep: ChallengeStep | null;
  holdProgress: number; // 0..1
  stepJustCompleted: boolean;
  completedBannerText: string | null;
  levelFinished: boolean;
  passed: boolean;
  remainingSec: number;
}

function matchesGestureRequirement(
  step: ChallengeStep,
  gesture: GestureState
): boolean {
  if (!step.requiredGesture) return true;
  if (gesture.primary === step.requiredGesture) return true;
  if (gesture.staticGesture === step.requiredGesture) return true;
  if (gesture.motionGesture === step.requiredGesture) return true;
  return false;
}

function matchesZoneRequirement(
  step: ChallengeStep,
  pose: PuppetPose
): boolean {
  if (!step.targetZone) return true;
  const dist = distance2D(
    pose.x,
    pose.y,
    step.targetZone.x,
    step.targetZone.y
  );
  return dist <= step.targetZone.radius;
}

export class ChallengeEvaluator {
  private level: LevelDefinition;
  private stepIndex = 0;
  private holdAccumulatedMs = 0;
  private elapsedMs = 0;
  private activeMatchMs = 0;
  private finished = false;
  private passed = false;

  constructor(level: LevelDefinition) {
    this.level = level;
  }

  reset(level?: LevelDefinition): void {
    if (level) this.level = level;
    this.stepIndex = 0;
    this.holdAccumulatedMs = 0;
    this.elapsedMs = 0;
    this.activeMatchMs = 0;
    this.finished = false;
    this.passed = false;
  }

  getElapsedMs(): number {
    return this.elapsedMs;
  }

  getActiveMatchMs(): number {
    return this.activeMatchMs;
  }

  getCompletedSteps(): number {
    return this.stepIndex;
  }

  update(
    dtMs: number,
    handDetected: boolean,
    pose: PuppetPose,
    gesture: GestureState
  ): ChallengeFrameUpdate {
    if (this.finished) {
      return {
        stepIndex: this.stepIndex,
        currentStep: null,
        holdProgress: 1,
        stepJustCompleted: false,
        completedBannerText: null,
        levelFinished: true,
        passed: this.passed,
        remainingSec: Math.max(
          0,
          Math.ceil((this.level.timeLimitSec * 1000 - this.elapsedMs) / 1000)
        ),
      };
    }

    this.elapsedMs += dtMs;
    const remainingMs = this.level.timeLimitSec * 1000 - this.elapsedMs;

    if (remainingMs <= 0) {
      this.finished = true;
      this.passed = false;
      return {
        stepIndex: this.stepIndex,
        currentStep: this.level.steps[this.stepIndex] ?? null,
        holdProgress: 0,
        stepJustCompleted: false,
        completedBannerText: null,
        levelFinished: true,
        passed: false,
        remainingSec: 0,
      };
    }

    const step = this.level.steps[this.stepIndex];
    if (!step) {
      this.finished = true;
      this.passed = true;
      return {
        stepIndex: this.stepIndex,
        currentStep: null,
        holdProgress: 1,
        stepJustCompleted: false,
        completedBannerText: null,
        levelFinished: true,
        passed: true,
        remainingSec: Math.ceil(remainingMs / 1000),
      };
    }

    let conditionMet = false;
    if (handDetected) {
      if (step.type === 'detect_hand') {
        conditionMet = true;
      } else {
        const gestureOk = matchesGestureRequirement(step, gesture);
        const zoneOk = matchesZoneRequirement(step, pose);
        conditionMet = gestureOk && zoneOk;
      }
    }

    if (conditionMet) {
      this.holdAccumulatedMs += dtMs;
      this.activeMatchMs += dtMs;
    } else {
      // Gentle decay rather than instant reset so child micro-pauses don't feel punishing
      this.holdAccumulatedMs = Math.max(0, this.holdAccumulatedMs - dtMs * 0.45);
    }

    const holdProgress = clamp(
      this.holdAccumulatedMs / Math.max(200, step.holdDurationMs),
      0,
      1
    );

    if (holdProgress >= 1) {
      const completedBannerText = step.encouragement;
      this.stepIndex += 1;
      this.holdAccumulatedMs = 0;

      const allDone = this.stepIndex >= this.level.steps.length;
      if (allDone) {
        this.finished = true;
        this.passed = true;
      }

      return {
        stepIndex: this.stepIndex,
        currentStep: this.level.steps[this.stepIndex] ?? null,
        holdProgress: 0,
        stepJustCompleted: true,
        completedBannerText,
        levelFinished: allDone,
        passed: allDone,
        remainingSec: Math.ceil(remainingMs / 1000),
      };
    }

    return {
      stepIndex: this.stepIndex,
      currentStep: step,
      holdProgress,
      stepJustCompleted: false,
      completedBannerText: null,
      levelFinished: false,
      passed: false,
      remainingSec: Math.ceil(remainingMs / 1000),
    };
  }
}

