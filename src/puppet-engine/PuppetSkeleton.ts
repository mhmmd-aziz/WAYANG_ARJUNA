import type {
  PuppetCharacterId,
  PuppetPose,
  PuppetSkeletonConfig,
} from '../types';
import { clamp } from '../utils/math';

const BASE_SKELETON: PuppetSkeletonConfig = {
  headSize: 44,
  torsoLength: 96,
  upperArmLength: 68,
  lowerArmLength: 64,
  handLength: 32,
  thighLength: 50,
  calfLength: 48,
  limits: {
    rotation: { min: -28, max: 28 },
    head: { min: -22, max: 22 },
    torso: { min: -18, max: 18 },
    shoulder: { min: -160, max: 105 },
    elbow: { min: -135, max: 120 },
    hand: { min: -50, max: 50 },
    hip: { min: -35, max: 45 },
    knee: { min: -15, max: 55 },
  },
};

const CHARACTER_SKELETONS: Record<PuppetCharacterId, PuppetSkeletonConfig> = {
  arjuna: BASE_SKELETON,
  gatotkaca: {
    ...BASE_SKELETON,
    headSize: 46,
    torsoLength: 100,
    upperArmLength: 72,
    lowerArmLength: 66,
  },
  srikandi: {
    ...BASE_SKELETON,
    headSize: 42,
    torsoLength: 92,
    upperArmLength: 64,
    lowerArmLength: 60,
  },
  semar: {
    ...BASE_SKELETON,
    headSize: 48,
    torsoLength: 94,
    upperArmLength: 56,
    lowerArmLength: 50,
    thighLength: 40,
    calfLength: 38,
  },
};

export function getSkeletonConfig(
  characterId: PuppetCharacterId
): PuppetSkeletonConfig {
  return CHARACTER_SKELETONS[characterId] ?? BASE_SKELETON;
}

export function createDefaultPose(): PuppetPose {
  return {
    x: 0.5,
    y: 0.56,
    rotation: 0,
    scale: 1,
    facing: 1,
    headAngle: 0,
    torsoAngle: 0,
    leftShoulderAngle: -32,
    leftElbowAngle: -55,
    leftHandAngle: -10,
    rightShoulderAngle: -48,
    rightElbowAngle: -65,
    rightHandAngle: 12,
    leftHipAngle: 10,
    leftKneeAngle: 12,
    rightHipAngle: -12,
    rightKneeAngle: 16,
    isActive: false,
    isGrabbing: false,
    isLeftGrabbing: false,
    isRightGrabbing: false,
    isTwoHandControl: false,
    isPointingUp: false,
    energy: 0.2,
    idlePhase: 0,
  };
}

/**
 * Enforces configured anatomical / wayang rod limits on every joint angle.
 */
export function clampPoseToLimits(
  pose: PuppetPose,
  config: PuppetSkeletonConfig
): PuppetPose {
  const { limits } = config;
  return {
    ...pose,
    x: clamp(pose.x, 0.1, 0.9),
    y: clamp(pose.y, 0.16, 0.86),
    rotation: clamp(pose.rotation, limits.rotation.min, limits.rotation.max),
    headAngle: clamp(pose.headAngle, limits.head.min, limits.head.max),
    torsoAngle: clamp(pose.torsoAngle, limits.torso.min, limits.torso.max),
    leftShoulderAngle: clamp(
      pose.leftShoulderAngle,
      limits.shoulder.min,
      limits.shoulder.max
    ),
    leftElbowAngle: clamp(
      pose.leftElbowAngle,
      limits.elbow.min,
      limits.elbow.max
    ),
    leftHandAngle: clamp(pose.leftHandAngle, limits.hand.min, limits.hand.max),
    rightShoulderAngle: clamp(
      pose.rightShoulderAngle,
      limits.shoulder.min,
      limits.shoulder.max
    ),
    rightElbowAngle: clamp(
      pose.rightElbowAngle,
      limits.elbow.min,
      limits.elbow.max
    ),
    rightHandAngle: clamp(
      pose.rightHandAngle,
      limits.hand.min,
      limits.hand.max
    ),
    leftHipAngle: clamp(pose.leftHipAngle, limits.hip.min, limits.hip.max),
    leftKneeAngle: clamp(pose.leftKneeAngle, limits.knee.min, limits.knee.max),
    rightHipAngle: clamp(pose.rightHipAngle, limits.hip.min, limits.hip.max),
    rightKneeAngle: clamp(
      pose.rightKneeAngle,
      limits.knee.min,
      limits.knee.max
    ),
  };
}
