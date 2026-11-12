import type { HandLandmarker } from '@mediapipe/tasks-vision';
import type {
  DetectedHand,
  Handedness,
  HandLandmarks,
  HandTrackingResult,
} from '../types';
import { landmarkToScreen } from './coordinateMapping';
import { HAND_LANDMARK } from './gestureRecognition';
import { LandmarkSmoother } from './landmarkSmoothing';

export const HAND_CONNECTIONS: ReadonlyArray<readonly [number, number]> = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 4], // Thumb
  [0, 5],
  [5, 6],
  [6, 7],
  [7, 8], // Index
  [0, 9],
  [9, 10],
  [10, 11],
  [11, 12], // Middle
  [0, 13],
  [13, 14],
  [14, 15],
  [15, 16], // Ring
  [0, 17],
  [17, 18],
  [18, 19],
  [19, 20], // Pinky
  [5, 9],
  [9, 13],
  [13, 17], // Palm arch
];

export interface DrawLandmarksOptions {
  mirrorX?: boolean;
  showIndices?: boolean;
  accentColor?: string;
}

const KEY_LANDMARKS = new Set<number>([
  HAND_LANDMARK.WRIST,
  HAND_LANDMARK.THUMB_TIP,
  HAND_LANDMARK.INDEX_TIP,
  HAND_LANDMARK.MIDDLE_TIP,
  HAND_LANDMARK.RING_TIP,
  HAND_LANDMARK.PINKY_TIP,
]);

function drawSingleHand(
  ctx: CanvasRenderingContext2D,
  landmarks: HandLandmarks,
  width: number,
  height: number,
  mirrorX: boolean,
  showIndices: boolean,
  boneColor: string,
  tipColor: string,
  wristColor: string,
  handLabel?: string
): void {
  const screenPoints = landmarks.map((lm) =>
    landmarkToScreen(lm, width, height, mirrorX)
  );

  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.strokeStyle = boneColor;
  ctx.lineWidth = Math.max(2.5, width * 0.0052);

  for (const [startIdx, endIdx] of HAND_CONNECTIONS) {
    const p1 = screenPoints[startIdx];
    const p2 = screenPoints[endIdx];
    if (!p1 || !p2) continue;
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.stroke();
  }

  screenPoints.forEach((pt, idx) => {
    const isWrist = idx === HAND_LANDMARK.WRIST;
    const isIndexTip = idx === HAND_LANDMARK.INDEX_TIP;
    const isThumbTip = idx === HAND_LANDMARK.THUMB_TIP;
    const isKey = KEY_LANDMARKS.has(idx);

    const radius = isWrist || isIndexTip ? 7 : isKey ? 5.5 : 4;

    ctx.beginPath();
    ctx.arc(pt.x, pt.y, radius + 2, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(43, 33, 26, 0.72)';
    ctx.fill();

    ctx.beginPath();
    ctx.arc(pt.x, pt.y, radius, 0, Math.PI * 2);
    if (isIndexTip) {
      ctx.fillStyle = tipColor;
    } else if (isThumbTip || isWrist) {
      ctx.fillStyle = wristColor;
    } else {
      ctx.fillStyle = '#FDF8EE';
    }
    ctx.fill();

    if (showIndices) {
      ctx.font = 'bold 10px sans-serif';
      ctx.fillStyle = '#FDF8EE';
      ctx.fillText(String(idx), pt.x + 8, pt.y - 4);
    }
  });

  if (handLabel && screenPoints[0]) {
    const wristPt = screenPoints[0];
    ctx.font = 'bold 11px "Fredoka", sans-serif';
    ctx.textAlign = 'center';
    const textW = ctx.measureText(handLabel).width + 14;
    const bx = Math.min(Math.max(wristPt.x, textW / 2 + 4), width - textW / 2 - 4);
    const by = Math.min(wristPt.y + 22, height - 10);
    ctx.fillStyle = 'rgba(43, 33, 26, 0.78)';
    ctx.beginPath();
    ctx.roundRect(bx - textW / 2, by - 11, textW, 18, 9);
    ctx.fill();
    ctx.fillStyle = '#FDF8EE';
    ctx.fillText(handLabel, bx, by + 2);
  }

  ctx.restore();
}

/**
 * Draws up to 2 detected hands (up to 42 landmarks) and bone connections onto a 2D canvas overlay.
 */
export function drawHandLandmarks(
  ctx: CanvasRenderingContext2D,
  handsOrLandmarks: DetectedHand[] | HandLandmarks | null,
  width: number,
  height: number,
  options: DrawLandmarksOptions = {}
): void {
  ctx.clearRect(0, 0, width, height);
  if (!handsOrLandmarks) return;

  const mirrorX = options.mirrorX ?? true;
  const showIndices = options.showIndices ?? false;

  // Backward-compatible single landmark array support
  if (
    Array.isArray(handsOrLandmarks) &&
    handsOrLandmarks.length > 0 &&
    'x' in handsOrLandmarks[0]
  ) {
    drawSingleHand(
      ctx,
      handsOrLandmarks as HandLandmarks,
      width,
      height,
      mirrorX,
      showIndices,
      'rgba(243, 227, 182, 0.9)',
      '#C65D3B',
      options.accentColor ?? '#D4A843'
    );
    return;
  }

  const hands = handsOrLandmarks as DetectedHand[];
  if (hands.length === 0) return;

  hands.forEach((hand, idx) => {
    const isLeftSide = hands.length === 2 && idx === 0;
    const label =
      hands.length === 2
        ? isLeftSide
          ? 'Tangan Kiri Wayang'
          : 'Tangan Kanan Wayang'
        : undefined;

    drawSingleHand(
      ctx,
      hand.landmarks,
      width,
      height,
      mirrorX,
      showIndices,
      isLeftSide ? 'rgba(182, 232, 205, 0.92)' : 'rgba(243, 227, 182, 0.92)',
      isLeftSide ? '#3D7A5A' : '#C65D3B',
      isLeftSide ? '#78C6A3' : options.accentColor ?? '#D4A843',
      label
    );
  });
}

/**
 * Stateful frame processor supporting up to 2 hands with independent EMA smoothing
 * sorted left-to-right in mirrored screen space.
 */
export class HandDetectionProcessor {
  private smoothers = [new LandmarkSmoother(), new LandmarkSmoother()];
  private lastVideoTime = -1;
  private lastDetectTimestampMs = 0;
  private fpsSamples: number[] = [];
  private lastFrameTimestamp = 0;
  private cachedHands: DetectedHand[] = [];

  reset(): void {
    this.smoothers.forEach((s) => s.reset());
    this.lastVideoTime = -1;
    this.fpsSamples = [];
    this.lastFrameTimestamp = 0;
    this.cachedHands = [];
  }

  processVideoFrame(
    landmarker: HandLandmarker,
    video: HTMLVideoElement,
    nowMs: number
  ): HandTrackingResult {
    if (video.readyState < 2 || video.videoWidth === 0) {
      return this.emptyResult(nowMs);
    }

    if (video.currentTime === this.lastVideoTime && this.cachedHands.length > 0) {
      return this.buildResult(this.cachedHands, nowMs);
    }
    this.lastVideoTime = video.currentTime;

    if (this.lastFrameTimestamp > 0) {
      const dt = nowMs - this.lastFrameTimestamp;
      if (dt > 0) {
        this.fpsSamples.push(1000 / dt);
        if (this.fpsSamples.length > 20) {
          this.fpsSamples.shift();
        }
      }
    }
    this.lastFrameTimestamp = nowMs;

    const safeTimestampMs = Math.max(
      this.lastDetectTimestampMs + 1,
      Math.round(nowMs)
    );
    this.lastDetectTimestampMs = safeTimestampMs;

    const detection = landmarker.detectForVideo(video, safeTimestampMs);
    const rawHands = detection.landmarks ?? [];

    if (rawHands.length === 0) {
      this.smoothers.forEach((s) => s.reset());
      this.cachedHands = [];
      return this.emptyResult(nowMs);
    }

    // Collect valid hands and sort left-to-right on mirrored screen so slot 0 = left, slot 1 = right
    const unsorted: Array<{
      raw: HandLandmarks;
      world: HandLandmarks | null;
      handedness: Handedness | null;
      confidence: number;
      screenWristX: number;
    }> = [];

    rawHands.forEach((raw, idx) => {
      if (!raw || raw.length < 21) return;
      const category = detection.handednesses?.[idx]?.[0];
      unsorted.push({
        raw,
        world: detection.worldLandmarks?.[idx] ?? null,
        handedness: (category?.categoryName as Handedness | undefined) ?? null,
        confidence: category?.score ?? 0.9,
        screenWristX: 1 - raw[HAND_LANDMARK.WRIST].x,
      });
    });

    unsorted.sort((a, b) => a.screenWristX - b.screenWristX);

    if (unsorted.length < 2) {
      this.smoothers[1].reset();
    }

    const detectedHands: DetectedHand[] = unsorted
      .slice(0, 2)
      .map((item, slotIdx) => {
        const smoothed = this.smoothers[slotIdx].update(item.raw, nowMs);
        return {
          landmarks: smoothed,
          rawLandmarks: item.raw,
          worldLandmarks: item.world,
          handedness: item.handedness,
          confidence: item.confidence,
          screenWristX: 1 - smoothed[HAND_LANDMARK.WRIST].x,
        };
      });

    this.cachedHands = detectedHands;
    return this.buildResult(detectedHands, nowMs);
  }

  private buildResult(
    hands: DetectedHand[],
    nowMs: number
  ): HandTrackingResult {
    // Primary hand is the rightmost hand (or sole hand) for single-hand compatibility
    const primary = hands[hands.length - 1] ?? null;
    return {
      landmarks: primary?.landmarks ?? null,
      rawLandmarks: primary?.rawLandmarks ?? null,
      worldLandmarks: primary?.worldLandmarks ?? null,
      handedness: primary?.handedness ?? null,
      confidence: primary?.confidence ?? 0,
      hands,
      timestamp: nowMs,
      fps: this.getAverageFps(),
    };
  }

  private emptyResult(nowMs: number): HandTrackingResult {
    return {
      landmarks: null,
      rawLandmarks: null,
      worldLandmarks: null,
      handedness: null,
      confidence: 0,
      hands: [],
      timestamp: nowMs,
      fps: this.getAverageFps(),
    };
  }

  private getAverageFps(): number {
    if (this.fpsSamples.length === 0) return 0;
    const sum = this.fpsSamples.reduce((acc, v) => acc + v, 0);
    return Math.round(sum / this.fpsSamples.length);
  }
}
