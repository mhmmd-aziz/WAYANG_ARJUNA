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
  hintText: string | null;
}

const GESTURE_SHORT_NAMES: Record<string, string> = {
  open_palm: 'Telapak Terbuka',
  closed_fist: 'Kepalan Tangan',
  index_up: 'Telunjuk Atas',
  pinch: 'Gerakan Jepit (Pinch)',
};

function matchesGestureRequirement(
  step: ChallengeStep,
  gesture: GestureState
): boolean {
  if (!step.requiredGesture) return true;
  if (gesture.primary === step.requiredGesture) return true;
  if (gesture.staticGesture === step.requiredGesture) return true;
  if (gesture.motionGesture === step.requiredGesture) return true;
  if (step.requiredGesture === 'open_palm' && gesture.isOpenPalm) return true;
  if (step.requiredGesture === 'closed_fist' && gesture.isFist) return true;
  if (step.requiredGesture === 'index_up' && gesture.isIndexUp) return true;
  if (step.requiredGesture === 'pinch' && gesture.isPinching) return true;
  return false;
}

function getZoneDistance(step: ChallengeStep, pose: PuppetPose): {
  dist: number;
  dx: number;
  dy: number;
  inZone: boolean;
} {
  if (!step.targetZone) {
    return { dist: 0, dx: 0, dy: 0, inZone: true };
  }
  // Compare against the puppet's vertical visual body span (hip at pose.y up to chest at pose.y - 0.14)
  // so any part of the wayang's torso touching the target circle registers naturally.
  const closestY = clamp(step.targetZone.y, pose.y - 0.14, pose.y);
  const dx = step.targetZone.x - pose.x;
  const dy = step.targetZone.y - closestY;
  const dist = distance2D(pose.x, closestY, step.targetZone.x, step.targetZone.y);
  return {
    dist,
    dx,
    dy,
    inZone: dist <= step.targetZone.radius * 1.12,
  };
}

function buildStepHint(
  step: ChallengeStep,
  handDetected: boolean,
  gestureOk: boolean,
  zoneCheck: { dx: number; dy: number; inZone: boolean },
  holdProgress: number
): string | null {
  if (!handDetected) {
    return 'Arahkan tanganmu ke depan kamera terlebih dahulu.';
  }
  if (zoneCheck.inZone && gestureOk) {
    return holdProgress > 0.15
      ? 'Bagus! Pertahankan sebentar...'
      : 'Tepat! Tahan posisi ini...';
  }
  if (step.targetZone && !zoneCheck.inZone) {
    if (Math.abs(zoneCheck.dx) >= Math.abs(zoneCheck.dy)) {
      return zoneCheck.dx < 0
        ? 'Geser tangan lebih ke KIRI menuju lingkaran target'
        : 'Geser tangan lebih ke KANAN menuju lingkaran target';
    }
    return zoneCheck.dy < 0
      ? 'Angkat tangan lebih ke ATAS menuju lingkaran target'
      : 'Turunkan tangan lebih ke BAWAH menuju lingkaran target';
  }
  if (step.requiredGesture && !gestureOk) {
    const reqName =
      GESTURE_SHORT_NAMES[step.requiredGesture] ?? step.requiredGesture;
    return step.targetZone
      ? `Sudah di posisi! Sekarang lakukan gestur ${reqName}`
      : `Bentuk gestur ${reqName} di depan kamera`;
  }
  return null;
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
        hintText: null,
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
        hintText: null,
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
        hintText: null,
      };
    }

    let conditionMet = false;
    let gestureOk = false;
    let zoneCheck = { dist: 0, dx: 0, dy: 0, inZone: true };

    if (handDetected) {
      if (step.type === 'detect_hand') {
        conditionMet = true;
        gestureOk = true;
      } else {
        gestureOk = matchesGestureRequirement(step, gesture);
        zoneCheck = getZoneDistance(step, pose);
        conditionMet = gestureOk && zoneCheck.inZone;
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
        hintText: null,
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
      hintText: buildStepHint(
        step,
        handDetected,
        gestureOk,
        zoneCheck,
        holdProgress
      ),
    };
  }
}

