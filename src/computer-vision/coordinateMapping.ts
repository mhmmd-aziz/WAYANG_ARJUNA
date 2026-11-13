import type { HandLandmarks, Landmark, ScreenCoordinate } from '../types';
import { clamp, radToDeg } from '../utils/math';

export interface StageMappingOptions {
  /** Mirror X axis so child's right hand moves puppet right on screen */
  mirrorX: boolean;
  /** Active camera inset margin to avoid requiring extreme edge reaches */
  inputMargin: number;
  /** Output stage bounds */
  outputMinX: number;
  outputMaxX: number;
  outputMinY: number;
  outputMaxY: number;
}

const DEFAULT_STAGE_OPTIONS: StageMappingOptions = {
  mirrorX: true,
  inputMargin: 0.18,
  outputMinX: 0.12,
  outputMaxX: 0.88,
  outputMinY: 0.16,
  outputMaxY: 0.86,
};

/**
 * Converts a normalized landmark (0..1) into pixel coordinates on a canvas.
 */
export function landmarkToScreen(
  landmark: Landmark,
  width: number,
  height: number,
  mirrorX = true
): ScreenCoordinate {
  const nx = mirrorX ? 1 - landmark.x : landmark.x;
  return {
    x: nx * width,
    y: landmark.y * height,
  };
}

/**
 * Maps a normalized camera coordinate into comfortable puppet stage space (0..1).
 */
export function mapCameraToStage(
  rawX: number,
  rawY: number,
  options: Partial<StageMappingOptions> = {}
): { x: number; y: number } {
  const opts = { ...DEFAULT_STAGE_OPTIONS, ...options };
  const mirroredX = opts.mirrorX ? 1 - rawX : rawX;

  const span = Math.max(0.1, 1 - opts.inputMargin * 2);
  const normX = clamp((mirroredX - opts.inputMargin) / span, 0, 1);
  const normY = clamp((rawY - opts.inputMargin) / span, 0, 1);

  return {
    x: opts.outputMinX + normX * (opts.outputMaxX - opts.outputMinX),
    y: opts.outputMinY + normY * (opts.outputMaxY - opts.outputMinY),
  };
}

/**
 * Computes hand roll tilt angle in degrees from Wrist (0) to Middle MCP (9).
 * 0 deg means hand is pointing straight up.
 */
export function computeHandTiltDegrees(
  landmarks: HandLandmarks,
  mirrorX = true
): number {
  const wrist = landmarks[0];
  const middleMcp = landmarks[9];
  if (!wrist || !middleMcp) return 0;

  const wx = mirrorX ? 1 - wrist.x : wrist.x;
  const mx = mirrorX ? 1 - middleMcp.x : middleMcp.x;
  const dx = mx - wx;
  const dy = middleMcp.y - wrist.y;

  // atan2(dx, -dy) gives 0 when pointing straight up (-Y in screen space)
  return radToDeg(Math.atan2(dx, -dy));
}

