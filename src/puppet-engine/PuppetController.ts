import type {
  DetectedHand,
  GestureState,
  HandTrackingResult,
  PuppetCharacter,
  PuppetCharacterId,
  PuppetPose,
  PuppetSkeletonConfig,
  SingleHandGesture,
} from '../types';
import { getCharacterById } from '../assets/wayangCharacters';
import {
  renderWayangPuppet,
  stepPuppetAnimation,
} from './PuppetAnimation';
import {
  computeTargetPose,
  extractPuppetSignals,
} from './PuppetMovement';
import { createDefaultPose, getSkeletonConfig } from './PuppetSkeleton';

/**
 * Coordinates skeletal configuration, gesture-to-pose mapping, smooth frame animation,
 * and Canvas 2D rendering without coupling to React render cycles.
 */
export class PuppetController {
  private character: PuppetCharacter;
  private skeleton: PuppetSkeletonConfig;
  private currentPose: PuppetPose;
  private targetPose: PuppetPose;
  private celebrationSec = 0;

  constructor(
    characterId: PuppetCharacterId = 'arjuna',
    initialPose?: Partial<PuppetPose>
  ) {
    this.character = getCharacterById(characterId);
    this.skeleton = getSkeletonConfig(characterId);
    this.currentPose = { ...createDefaultPose(), ...initialPose };
    this.targetPose = { ...this.currentPose };
  }

  setCharacter(characterId: PuppetCharacterId): void {
    this.character = getCharacterById(characterId);
    this.skeleton = getSkeletonConfig(characterId);
  }

  getCharacter(): PuppetCharacter {
    return this.character;
  }

  getPose(): PuppetPose {
    return this.currentPose;
  }

  triggerCelebration(durationSec = 1.2): void {
    this.celebrationSec = durationSec;
  }

  updateFromTracking(
    tracking: HandTrackingResult,
    gesture: GestureState,
    dtSec: number
  ): PuppetPose {
    const signals = extractPuppetSignals(tracking, gesture);
    this.targetPose = computeTargetPose(
      signals,
      this.currentPose,
      this.skeleton
    );

    if (this.celebrationSec > 0) {
      this.celebrationSec = Math.max(0, this.celebrationSec - dtSec);
    }

    this.currentPose = stepPuppetAnimation(
      this.currentPose,
      this.targetPose,
      dtSec,
      this.celebrationSec
    );
    return this.currentPose;
  }

  /**
   * Drives this puppet from one specific detected hand (used in 2-puppet mode
   * where Left Hand controls Puppet 1 and Right Hand controls Puppet 2).
   */
  updateFromSingleHand(
    hand: DetectedHand,
    singleGesture: SingleHandGesture,
    dtSec: number,
    forcedFacing?: 1 | -1
  ): PuppetPose {
    const singleTracking: HandTrackingResult = {
      landmarks: hand.landmarks,
      rawLandmarks: hand.rawLandmarks,
      worldLandmarks: hand.worldLandmarks,
      handedness: hand.handedness,
      confidence: hand.confidence,
      hands: [hand],
      timestamp: performance.now(),
      fps: 30,
    };

    const fullGesture: GestureState = {
      ...singleGesture,
      handCount: 1,
      leftHand: null,
      rightHand: singleGesture,
    };

    const signals = extractPuppetSignals(singleTracking, fullGesture);
    const nextTarget = computeTargetPose(
      signals,
      this.currentPose,
      this.skeleton
    );

    this.targetPose = forcedFacing
      ? { ...nextTarget, facing: forcedFacing }
      : nextTarget;

    if (this.celebrationSec > 0) {
      this.celebrationSec = Math.max(0, this.celebrationSec - dtSec);
    }

    this.currentPose = stepPuppetAnimation(
      this.currentPose,
      this.targetPose,
      dtSec,
      this.celebrationSec
    );
    return this.currentPose;
  }

  /**
   * Advances idle animation when no hand is driving this puppet.
   */
  updateIdle(
    dtSec: number,
    idleX = 0.5,
    idleY = 0.56,
    facing: 1 | -1 = 1
  ): PuppetPose {
    this.targetPose = {
      ...createDefaultPose(),
      x: idleX,
      y: idleY,
      facing,
      isActive: false,
    };
    this.currentPose = stepPuppetAnimation(
      this.currentPose,
      this.targetPose,
      dtSec,
      this.celebrationSec
    );
    return this.currentPose;
  }

  render(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number
  ): void {
    renderWayangPuppet(
      ctx,
      this.currentPose,
      this.character,
      this.skeleton,
      width,
      height,
      this.celebrationSec
    );
  }
}
