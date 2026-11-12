export type PuppetCharacterId = 'arjuna' | 'gatotkaca' | 'srikandi' | 'semar';

export interface CharacterPalette {
  skin: string;
  skinShade: string;
  gold: string;
  goldHighlight: string;
  accent: string;
  fabricPrimary: string;
  fabricSecondary: string;
  outline: string;
}

export interface PuppetCharacter {
  id: PuppetCharacterId;
  name: string;
  title: string;
  origin: string;
  shortDesc: string;
  culturalBackground: string;
  funFact: string;
  specialMoveName: string;
  signatureItem: string;
  palette: CharacterPalette;
}

export interface JointLimits {
  min: number;
  max: number;
}

export interface PuppetSkeletonConfig {
  headSize: number;
  torsoLength: number;
  upperArmLength: number;
  lowerArmLength: number;
  handLength: number;
  thighLength: number;
  calfLength: number;
  limits: {
    rotation: JointLimits;
    head: JointLimits;
    torso: JointLimits;
    shoulder: JointLimits;
    elbow: JointLimits;
    hand: JointLimits;
    hip: JointLimits;
    knee: JointLimits;
  };
}

export interface PuppetPose {
  /** Normalized stage coordinates (0 = left/top, 1 = right/bottom) */
  x: number;
  y: number;
  /** Overall puppet tilt in degrees */
  rotation: number;
  scale: number;
  /** Facing direction: 1 = right, -1 = left */
  facing: 1 | -1;
  /** Joint angles in degrees relative to parent segment */
  headAngle: number;
  torsoAngle: number;
  leftShoulderAngle: number;
  leftElbowAngle: number;
  leftHandAngle: number;
  rightShoulderAngle: number;
  rightElbowAngle: number;
  rightHandAngle: number;
  leftHipAngle: number;
  leftKneeAngle: number;
  rightHipAngle: number;
  rightKneeAngle: number;
  /** Special interaction flags */
  isActive: boolean;
  isGrabbing: boolean;
  isLeftGrabbing: boolean;
  isRightGrabbing: boolean;
  isTwoHandControl: boolean;
  isPointingUp: boolean;
  /** Smooth 0..1 energy indicator for sashes / special aura */
  energy: number;
  /** Idle breathing phase in radians */
  idlePhase: number;
}

export interface HandArmSignal {
  wristX: number;
  wristY: number;
  indexTipX: number;
  indexTipY: number;
  handTiltDeg: number;
  isOpenPalm: boolean;
  isClosedFist: boolean;
  isIndexUp: boolean;
  isPinching: boolean;
  fingerBendAvg: number;
  velocityX: number;
  velocityY: number;
}

export interface PuppetInputSignals {
  handDetected: boolean;
  handCount: number;
  /** Normalized 0..1 mirrored main pivot coordinates */
  wristX: number;
  wristY: number;
  indexTipX: number;
  indexTipY: number;
  /** Hand rotation angle in degrees */
  handTiltDeg: number;
  isOpenPalm: boolean;
  isClosedFist: boolean;
  isIndexUp: boolean;
  isPinching: boolean;
  fingerBendAvg: number;
  velocityX: number;
  velocityY: number;
  /** Dual-hand signals (null when only 0 or 1 hand is detected) */
  leftArm: HandArmSignal | null;
  rightArm: HandArmSignal | null;
}
