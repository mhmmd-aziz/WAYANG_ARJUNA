export interface Landmark {
  x: number;
  y: number;
  z: number;
  visibility?: number;
}

export type HandLandmarks = Landmark[];

export type Handedness = 'Left' | 'Right';

export interface DetectedHand {
  landmarks: HandLandmarks;
  rawLandmarks: HandLandmarks;
  worldLandmarks: HandLandmarks | null;
  handedness: Handedness | null;
  confidence: number;
  /** Mirrored screen-space wrist X (0 = left side of screen, 1 = right side) */
  screenWristX: number;
}

export interface HandTrackingResult {
  /** Primary hand landmarks (for backward compatibility & single-hand mode) */
  landmarks: HandLandmarks | null;
  rawLandmarks: HandLandmarks | null;
  worldLandmarks: HandLandmarks | null;
  handedness: Handedness | null;
  confidence: number;
  /** All detected hands (up to 2 hands, sorted left-to-right on mirrored screen) */
  hands: DetectedHand[];
  timestamp: number;
  fps: number;
}

export type StaticGestureType =
  | 'none'
  | 'open_palm'
  | 'closed_fist'
  | 'index_up'
  | 'pinch';

export type MotionGestureType =
  | 'none'
  | 'move_left'
  | 'move_right'
  | 'move_down'
  | 'move_up';

export type GestureType = StaticGestureType | MotionGestureType;

export interface FingerCurlState {
  thumb: number; // 0 = extended, 1 = curled
  index: number;
  middle: number;
  ring: number;
  pinky: number;
}

export interface SingleHandGesture {
  primary: GestureType;
  staticGesture: StaticGestureType;
  motionGesture: MotionGestureType;
  isPinching: boolean;
  isFist: boolean;
  isOpenPalm: boolean;
  isIndexUp: boolean;
  pinchDistance: number;
  handRollAngle: number;
  velocity: { vx: number; vy: number };
  confidence: number;
  label: string;
  description: string;
  fingerCurl: FingerCurlState;
}

export interface GestureState extends SingleHandGesture {
  /** Number of hands currently tracked (0, 1, or 2) */
  handCount: number;
  /** Left-side hand on screen (controls puppet's trailing/left arm in 2-hand mode) */
  leftHand: SingleHandGesture | null;
  /** Right-side hand on screen (controls puppet's leading/right arm in 2-hand mode) */
  rightHand: SingleHandGesture | null;
}

export interface ScreenCoordinate {
  x: number;
  y: number;
}
