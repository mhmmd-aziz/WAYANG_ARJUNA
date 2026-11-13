import type {
  DetectedHand,
  FingerCurlState,
  GestureState,
  GestureType,
  HandLandmarks,
  MotionGestureType,
  SingleHandGesture,
  StaticGestureType,
} from '../types';
import { clamp, distance2D, lerp } from '../utils/math';
import { computeHandTiltDegrees } from './coordinateMapping';

/**
 * Landmark indices for MediaPipe Hand Landmarker (21 points).
 */
export const HAND_LANDMARK = {
  WRIST: 0,
  THUMB_CMC: 1,
  THUMB_MCP: 2,
  THUMB_IP: 3,
  THUMB_TIP: 4,
  INDEX_MCP: 5,
  INDEX_PIP: 6,
  INDEX_DIP: 7,
  INDEX_TIP: 8,
  MIDDLE_MCP: 9,
  MIDDLE_PIP: 10,
  MIDDLE_DIP: 11,
  MIDDLE_TIP: 12,
  RING_MCP: 13,
  RING_PIP: 14,
  RING_DIP: 15,
  RING_TIP: 16,
  PINKY_MCP: 17,
  PINKY_PIP: 18,
  PINKY_DIP: 19,
  PINKY_TIP: 20,
} as const;

export interface GestureRuleContext {
  landmarks: HandLandmarks;
  palmSize: number;
  curl: FingerCurlState;
  pinchRatio: number;
  velocity: { vx: number; vy: number };
  handRollDeg: number;
}

export interface GestureRule {
  id: StaticGestureType;
  label: string;
  description: string;
  priority: number;
  evaluate: (ctx: GestureRuleContext) => number;
}

function computeFingerCurl(
  landmarks: HandLandmarks,
  mcpIdx: number,
  pipIdx: number,
  tipIdx: number,
  palmSize: number
): number {
  const wrist = landmarks[HAND_LANDMARK.WRIST];
  const mcp = landmarks[mcpIdx];
  const pip = landmarks[pipIdx];
  const tip = landmarks[tipIdx];

  const wristToTip = distance2D(wrist.x, wrist.y, tip.x, tip.y);
  const wristToPip = distance2D(wrist.x, wrist.y, pip.x, pip.y);
  const mcpToTip = distance2D(mcp.x, mcp.y, tip.x, tip.y);

  const ratio =
    (wristToTip - wristToPip * 0.85) / Math.max(0.02, palmSize * 0.9);
  const mcpRatio = mcpToTip / Math.max(0.02, palmSize * 0.85);
  const extensionScore = clamp(ratio * 0.6 + mcpRatio * 0.4, 0, 1);

  return clamp(1 - extensionScore, 0, 1);
}

function computeThumbCurl(landmarks: HandLandmarks, palmSize: number): number {
  const pinkyMcp = landmarks[HAND_LANDMARK.PINKY_MCP];
  const indexMcp = landmarks[HAND_LANDMARK.INDEX_MCP];
  const thumbTip = landmarks[HAND_LANDMARK.THUMB_TIP];
  const thumbIp = landmarks[HAND_LANDMARK.THUMB_IP];

  const tipToPinky = distance2D(
    thumbTip.x,
    thumbTip.y,
    pinkyMcp.x,
    pinkyMcp.y
  );
  const tipToIndex = distance2D(
    thumbTip.x,
    thumbTip.y,
    indexMcp.x,
    indexMcp.y
  );
  const ipToPinky = distance2D(thumbIp.x, thumbIp.y, pinkyMcp.x, pinkyMcp.y);

  const openSpread =
    (tipToPinky + tipToIndex * 0.5) / Math.max(0.02, palmSize * 1.45);
  const tucked = tipToPinky < ipToPinky * 0.95 ? 0.35 : 0;

  return clamp(1 - openSpread + tucked, 0, 1);
}

export function extractFingerCurl(
  landmarks: HandLandmarks,
  palmSize: number
): FingerCurlState {
  return {
    thumb: computeThumbCurl(landmarks, palmSize),
    index: computeFingerCurl(
      landmarks,
      HAND_LANDMARK.INDEX_MCP,
      HAND_LANDMARK.INDEX_PIP,
      HAND_LANDMARK.INDEX_TIP,
      palmSize
    ),
    middle: computeFingerCurl(
      landmarks,
      HAND_LANDMARK.MIDDLE_MCP,
      HAND_LANDMARK.MIDDLE_PIP,
      HAND_LANDMARK.MIDDLE_TIP,
      palmSize
    ),
    ring: computeFingerCurl(
      landmarks,
      HAND_LANDMARK.RING_MCP,
      HAND_LANDMARK.RING_PIP,
      HAND_LANDMARK.RING_TIP,
      palmSize
    ),
    pinky: computeFingerCurl(
      landmarks,
      HAND_LANDMARK.PINKY_MCP,
      HAND_LANDMARK.PINKY_PIP,
      HAND_LANDMARK.PINKY_TIP,
      palmSize
    ),
  };
}

const DEFAULT_STATIC_RULES: GestureRule[] = [
  {
    id: 'pinch',
    label: 'Jepit / Cubit (Pinch)',
    description: 'Mengaktifkan gerakan khusus atau memegang pusaka wayang.',
    priority: 4,
    evaluate: ({ pinchRatio, curl }) => {
      const relaxedFingers = curl.middle < 0.72 || curl.ring < 0.72;
      const tightTipTouch = pinchRatio < 0.28 && curl.index < 0.72;
      if (pinchRatio < 0.36 && (relaxedFingers || tightTipTouch)) {
        return clamp(1 - pinchRatio / 0.4, 0.7, 1);
      }
      return 0;
    },
  },
  {
    id: 'closed_fist',
    label: 'Kepalan Tangan (Istirahat)',
    description: 'Menghentikan gerakan wayang agar diam tenang.',
    priority: 3,
    evaluate: ({ curl }) => {
      const avgFinger =
        (curl.index + curl.middle + curl.ring + curl.pinky) / 4;
      if (
        curl.index > 0.56 &&
        curl.middle > 0.56 &&
        curl.ring > 0.56 &&
        curl.pinky > 0.56
      ) {
        return clamp(avgFinger, 0.72, 1);
      }
      return 0;
    },
  },
  {
    id: 'index_up',
    label: 'Jari Telunjuk ke Atas',
    description: 'Menggerakkan wayang naik ke atas atau menunjuk arah.',
    priority: 2,
    evaluate: ({ curl, landmarks }) => {
      const indexExtended = curl.index < 0.44;
      const othersCurled =
        curl.middle > 0.48 && curl.ring > 0.48 && curl.pinky > 0.48;
      const indexPointingUp =
        landmarks[HAND_LANDMARK.INDEX_TIP].y <
        landmarks[HAND_LANDMARK.INDEX_MCP].y;

      if (indexExtended && othersCurled && indexPointingUp) {
        return clamp(
          (1 - curl.index) * 0.5 +
            ((curl.middle + curl.ring + curl.pinky) / 3) * 0.5,
          0.7,
          1
        );
      }
      return 0;
    },
  },
  {
    id: 'open_palm',
    label: 'Telapak Tangan Terbuka',
    description: 'Mengaktifkan dan mengendalikan wayang dengan bebas.',
    priority: 1,
    evaluate: ({ curl, pinchRatio }) => {
      const fingersOpen =
        curl.index < 0.5 &&
        curl.middle < 0.5 &&
        curl.ring < 0.52 &&
        curl.pinky < 0.55;
      if (fingersOpen && pinchRatio >= 0.32) {
        const openness =
          1 - (curl.index + curl.middle + curl.ring + curl.pinky) / 4;
        return clamp(openness, 0.72, 1);
      }
      return 0;
    },
  },
];

export const GESTURE_LABELS: Record<GestureType, string> = {
  none: 'Belum Terdeteksi',
  open_palm: 'Telapak Terbuka',
  closed_fist: 'Tangan Mengepal',
  index_up: 'Telunjuk ke Atas',
  pinch: 'Gerakan Jepit (Pinch)',
  move_left: 'Tangan ke Kiri',
  move_right: 'Tangan ke Kanan',
  move_down: 'Tangan ke Bawah',
  move_up: 'Tangan ke Atas',
};

function getEmptySingleHandGesture(): SingleHandGesture {
  return {
    primary: 'none',
    staticGesture: 'none',
    motionGesture: 'none',
    isPinching: false,
    isFist: false,
    isOpenPalm: false,
    isIndexUp: false,
    pinchDistance: 1,
    handRollAngle: 0,
    velocity: { vx: 0, vy: 0 },
    confidence: 0,
    label: GESTURE_LABELS.none,
    description: 'Tunjukkan satu atau dua telapak tanganmu ke kamera.',
    fingerCurl: { thumb: 0, index: 0, middle: 0, ring: 0, pinky: 0 },
  };
}

export function getEmptyGestureState(): GestureState {
  return {
    ...getEmptySingleHandGesture(),
    handCount: 0,
    leftHand: null,
    rightHand: null,
  };
}

class SingleHandVelocityTracker {
  private prevWrist: { x: number; y: number; timestamp: number } | null = null;
  private smoothedVx = 0;
  private smoothedVy = 0;

  reset(): void {
    this.prevWrist = null;
    this.smoothedVx = 0;
    this.smoothedVy = 0;
  }

  update(
    wx: number,
    wy: number,
    timestampMs: number
  ): { vx: number; vy: number } {
    if (this.prevWrist) {
      const dt = Math.max(0.016, (timestampMs - this.prevWrist.timestamp) / 1000);
      const rawVx = (wx - this.prevWrist.x) / dt;
      const rawVy = (wy - this.prevWrist.y) / dt;
      this.smoothedVx = lerp(this.smoothedVx, rawVx, 0.35);
      this.smoothedVy = lerp(this.smoothedVy, rawVy, 0.35);
    }
    this.prevWrist = { x: wx, y: wy, timestamp: timestampMs };
    return { vx: this.smoothedVx, vy: this.smoothedVy };
  }
}

/**
 * Modular, landmark-based gesture recognizer supporting both single-hand
 * and dual-hand dalang control.
 */
export class GestureRecognizer {
  private rules: GestureRule[];
  private trackers = [
    new SingleHandVelocityTracker(),
    new SingleHandVelocityTracker(),
  ];
  private mirrorX: boolean;

  constructor(options?: { rules?: GestureRule[]; mirrorX?: boolean }) {
    this.rules = [...(options?.rules ?? DEFAULT_STATIC_RULES)].sort(
      (a, b) => b.priority - a.priority
    );
    this.mirrorX = options?.mirrorX ?? true;
  }

  registerRule(rule: GestureRule): void {
    this.rules = [...this.rules.filter((r) => r.id !== rule.id), rule].sort(
      (a, b) => b.priority - a.priority
    );
  }

  reset(): void {
    this.trackers.forEach((t) => t.reset());
  }

  private evaluateSingleHand(
    landmarks: HandLandmarks,
    timestampMs: number,
    trackerIdx: number
  ): SingleHandGesture {
    const wrist = landmarks[HAND_LANDMARK.WRIST];
    const middleMcp = landmarks[HAND_LANDMARK.MIDDLE_MCP];
    const thumbTip = landmarks[HAND_LANDMARK.THUMB_TIP];
    const indexTip = landmarks[HAND_LANDMARK.INDEX_TIP];

    const palmSize = Math.max(
      0.04,
      distance2D(wrist.x, wrist.y, middleMcp.x, middleMcp.y)
    );
    const pinchDist = distance2D(
      thumbTip.x,
      thumbTip.y,
      indexTip.x,
      indexTip.y
    );
    const pinchRatio = pinchDist / palmSize;

    const wx = this.mirrorX ? 1 - wrist.x : wrist.x;
    const wy = wrist.y;
    const velocity = this.trackers[trackerIdx].update(wx, wy, timestampMs);

    const curl = extractFingerCurl(landmarks, palmSize);
    const handRollDeg = computeHandTiltDegrees(landmarks, this.mirrorX);

    const ctx: GestureRuleContext = {
      landmarks,
      palmSize,
      curl,
      pinchRatio,
      velocity,
      handRollDeg,
    };

    let staticGesture: StaticGestureType = 'none';
    let bestConfidence = 0;
    let bestRule: GestureRule | null = null;

    for (const rule of this.rules) {
      const score = rule.evaluate(ctx);
      if (score > 0.55 && score > bestConfidence) {
        bestConfidence = score;
        staticGesture = rule.id;
        bestRule = rule;
      }
    }

    const speedThreshold = 0.24;
    let motionGesture: MotionGestureType = 'none';
    if (Math.abs(velocity.vx) > Math.abs(velocity.vy)) {
      if (velocity.vx < -speedThreshold) motionGesture = 'move_left';
      else if (velocity.vx > speedThreshold) motionGesture = 'move_right';
    } else {
      if (velocity.vy > speedThreshold) motionGesture = 'move_down';
      else if (velocity.vy < -speedThreshold) motionGesture = 'move_up';
    }

    const primary: GestureType =
      staticGesture !== 'none'
        ? staticGesture
        : motionGesture !== 'none'
          ? motionGesture
          : 'none';

    const label =
      motionGesture !== 'none' && staticGesture === 'open_palm'
        ? `${GESTURE_LABELS.open_palm} • ${GESTURE_LABELS[motionGesture]}`
        : GESTURE_LABELS[primary];

    const description =
      bestRule?.description ??
      (motionGesture !== 'none'
        ? 'Mengikuti arah gerakan tanganmu.'
        : 'Coba buka telapak tangan atau kepalkan jari.');

    return {
      primary,
      staticGesture,
      motionGesture,
      isPinching: staticGesture === 'pinch',
      isFist: staticGesture === 'closed_fist',
      isOpenPalm: staticGesture === 'open_palm',
      isIndexUp: staticGesture === 'index_up',
      pinchDistance: pinchRatio,
      handRollAngle: (handRollDeg * Math.PI) / 180,
      velocity,
      confidence: bestConfidence || (motionGesture !== 'none' ? 0.75 : 0.4),
      label,
      description,
      fingerCurl: curl,
    };
  }

  /**
   * Accepts either 1 hand landmarks (legacy/test signature) or an array of DetectedHands (1 or 2 hands).
   */
  recognize(
    input: HandLandmarks | DetectedHand[] | null,
    timestampMs: number
  ): GestureState {
    if (!input) {
      this.reset();
      return getEmptyGestureState();
    }

    // Legacy single-hand array overload
    if (Array.isArray(input) && input.length > 0 && 'x' in input[0]) {
      const lm = input as HandLandmarks;
      if (lm.length < 21) {
        this.reset();
        return getEmptyGestureState();
      }
      this.trackers[1].reset();
      const single = this.evaluateSingleHand(lm, timestampMs, 0);
      return {
        ...single,
        handCount: 1,
        leftHand: null,
        rightHand: single,
      };
    }

    const hands = input as DetectedHand[];
    if (hands.length === 0) {
      this.reset();
      return getEmptyGestureState();
    }

    if (hands.length === 1) {
      this.trackers[1].reset();
      const single = this.evaluateSingleHand(
        hands[0].landmarks,
        timestampMs,
        0
      );
      return {
        ...single,
        handCount: 1,
        leftHand: null,
        rightHand: single,
      };
    }

    // Dual-hand mode: hands[0] = left screen hand, hands[1] = right screen hand
    const leftGesture = this.evaluateSingleHand(
      hands[0].landmarks,
      timestampMs,
      0
    );
    const rightGesture = this.evaluateSingleHand(
      hands[1].landmarks,
      timestampMs,
      1
    );

    const anyPinch = leftGesture.isPinching || rightGesture.isPinching;
    const bothFist = leftGesture.isFist && rightGesture.isFist;
    const anyIndexUp = leftGesture.isIndexUp || rightGesture.isIndexUp;
    const anyOpen = leftGesture.isOpenPalm || rightGesture.isOpenPalm;

    const primary: GestureType = anyPinch
      ? 'pinch'
      : bothFist
        ? 'closed_fist'
        : anyIndexUp
          ? 'index_up'
          : anyOpen
            ? 'open_palm'
            : rightGesture.primary !== 'none'
              ? rightGesture.primary
              : leftGesture.primary;

    const staticGesture: StaticGestureType = anyPinch
      ? 'pinch'
      : bothFist
        ? 'closed_fist'
        : anyIndexUp
          ? 'index_up'
          : anyOpen
            ? 'open_palm'
            : 'none';

    return {
      ...rightGesture,
      primary,
      staticGesture,
      isPinching: anyPinch,
      isFist: bothFist,
      isOpenPalm: anyOpen,
      isIndexUp: anyIndexUp,
      confidence: Math.max(leftGesture.confidence, rightGesture.confidence),
      label: `2 Tangan • ${GESTURE_LABELS[primary]}`,
      description:
        'Mode Dalang 2 Tangan: Tangan kiri & kanan menggerakkan kedua lengan wayang!',
      handCount: 2,
      leftHand: leftGesture,
      rightHand: rightGesture,
    };
  }
}
