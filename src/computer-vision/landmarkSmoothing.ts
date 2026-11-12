import type { HandLandmarks, Landmark } from '../types';
import { clamp, distance2D, lerp } from '../utils/math';

export interface SmoothingConfig {
  /** EMA smoothing factor (0..1). Higher = faster response, lower = smoother. */
  alpha: number;
  /** Minimum normalized delta below which micro-jitter is suppressed. */
  movementThreshold: number;
  /** Adaptive boost factor when moving quickly to reduce visual lag. */
  velocityBoost: number;
}

const DEFAULT_CONFIG: SmoothingConfig = {
  alpha: 0.38,
  movementThreshold: 0.0035,
  velocityBoost: 1.6,
};

export function interpolateLandmarks(
  from: HandLandmarks,
  to: HandLandmarks,
  t: number
): HandLandmarks {
  if (from.length !== to.length) return to;
  return to.map((target, idx) => {
    const prev = from[idx];
    return {
      x: lerp(prev.x, target.x, t),
      y: lerp(prev.y, target.y, t),
      z: lerp(prev.z, target.z, t),
      visibility: target.visibility ?? prev.visibility,
    };
  });
}

export class LandmarkSmoother {
  private config: SmoothingConfig;
  private smoothed: HandLandmarks | null = null;
  private lastTimestamp = 0;

  constructor(config: Partial<SmoothingConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  reset(): void {
    this.smoothed = null;
    this.lastTimestamp = 0;
  }

  update(rawLandmarks: HandLandmarks, timestampMs: number): HandLandmarks {
    if (!this.smoothed || this.smoothed.length !== rawLandmarks.length) {
      this.smoothed = rawLandmarks.map((lm) => ({ ...lm }));
      this.lastTimestamp = timestampMs;
      return this.smoothed;
    }

    const dtSec = Math.max(0.001, (timestampMs - this.lastTimestamp) / 1000);
    this.lastTimestamp = timestampMs;

    // Normalize alpha around 30 FPS so smoothing feels consistent across 25-60 FPS
    const frameScale = clamp(dtSec * 30, 0.5, 2.0);

    const next: Landmark[] = rawLandmarks.map((raw, idx) => {
      const prev = this.smoothed![idx];
      const delta = distance2D(prev.x, prev.y, raw.x, raw.y);

      if (delta < this.config.movementThreshold) {
        return { ...prev };
      }

      const speedBoost = clamp(delta * 12 * this.config.velocityBoost, 0, 0.45);
      const effectiveAlpha = clamp(
        (this.config.alpha + speedBoost) * frameScale,
        0.15,
        0.88
      );

      return {
        x: lerp(prev.x, raw.x, effectiveAlpha),
        y: lerp(prev.y, raw.y, effectiveAlpha),
        z: lerp(prev.z, raw.z, effectiveAlpha),
        visibility: raw.visibility ?? prev.visibility,
      };
    });

    this.smoothed = next;
    return next;
  }

  getCurrent(): HandLandmarks | null {
    return this.smoothed;
  }
}

