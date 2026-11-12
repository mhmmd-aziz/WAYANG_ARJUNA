import { describe, expect, it } from 'vitest';
import type { HandLandmarks } from '../../types';
import {
  computeHandTiltDegrees,
  mapCameraToStage,
} from '../coordinateMapping';
import { GestureRecognizer } from '../gestureRecognition';
import { LandmarkSmoother } from '../landmarkSmoothing';

function createBaseHand(): HandLandmarks {
  // Upright open palm centered around (0.5, 0.6)
  return [
    { x: 0.5, y: 0.72, z: 0 }, // 0 wrist
    { x: 0.44, y: 0.68, z: 0 }, // 1 thumb cmc
    { x: 0.4, y: 0.62, z: 0 }, // 2 thumb mcp
    { x: 0.37, y: 0.57, z: 0 }, // 3 thumb ip
    { x: 0.34, y: 0.52, z: 0 }, // 4 thumb tip
    { x: 0.46, y: 0.56, z: 0 }, // 5 index mcp
    { x: 0.46, y: 0.48, z: 0 }, // 6 index pip
    { x: 0.46, y: 0.42, z: 0 }, // 7 index dip
    { x: 0.46, y: 0.36, z: 0 }, // 8 index tip
    { x: 0.5, y: 0.55, z: 0 }, // 9 middle mcp
    { x: 0.5, y: 0.46, z: 0 }, // 10 middle pip
    { x: 0.5, y: 0.39, z: 0 }, // 11 middle dip
    { x: 0.5, y: 0.33, z: 0 }, // 12 middle tip
    { x: 0.54, y: 0.56, z: 0 }, // 13 ring mcp
    { x: 0.54, y: 0.48, z: 0 }, // 14 ring pip
    { x: 0.54, y: 0.42, z: 0 }, // 15 ring dip
    { x: 0.54, y: 0.36, z: 0 }, // 16 ring tip
    { x: 0.58, y: 0.58, z: 0 }, // 17 pinky mcp
    { x: 0.58, y: 0.51, z: 0 }, // 18 pinky pip
    { x: 0.58, y: 0.46, z: 0 }, // 19 pinky dip
    { x: 0.58, y: 0.41, z: 0 }, // 20 pinky tip
  ];
}

function curlFinger(
  hand: HandLandmarks,
  mcp: number,
  pip: number,
  dip: number,
  tip: number
): void {
  const mcpPt = hand[mcp];
  hand[pip] = { x: mcpPt.x, y: mcpPt.y - 0.02, z: 0 };
  hand[dip] = { x: mcpPt.x, y: mcpPt.y + 0.03, z: 0 };
  hand[tip] = { x: mcpPt.x, y: mcpPt.y + 0.06, z: 0 };
}

describe('GestureRecognizer & Smoothing', () => {
  it('recognizes open_palm from extended landmarks', () => {
    const recognizer = new GestureRecognizer();
    const hand = createBaseHand();
    const result = recognizer.recognize(hand, 1000);
    expect(result.staticGesture).toBe('open_palm');
    expect(result.isOpenPalm).toBe(true);
  });

  it('recognizes closed_fist when all fingers are curled', () => {
    const recognizer = new GestureRecognizer();
    const hand = createBaseHand();
    hand[4] = { x: 0.5, y: 0.58, z: 0 };
    curlFinger(hand, 5, 6, 7, 8);
    curlFinger(hand, 9, 10, 11, 12);
    curlFinger(hand, 13, 14, 15, 16);
    curlFinger(hand, 17, 18, 19, 20);

    const result = recognizer.recognize(hand, 1000);
    expect(result.staticGesture).toBe('closed_fist');
    expect(result.isFist).toBe(true);
  });

  it('recognizes index_up when only index finger is extended upward', () => {
    const recognizer = new GestureRecognizer();
    const hand = createBaseHand();
    hand[4] = { x: 0.48, y: 0.58, z: 0 };
    curlFinger(hand, 9, 10, 11, 12);
    curlFinger(hand, 13, 14, 15, 16);
    curlFinger(hand, 17, 18, 19, 20);

    const result = recognizer.recognize(hand, 1000);
    expect(result.staticGesture).toBe('index_up');
    expect(result.isIndexUp).toBe(true);
  });

  it('recognizes pinch when thumb tip meets index tip', () => {
    const recognizer = new GestureRecognizer();
    const hand = createBaseHand();
    hand[4] = { x: 0.46, y: 0.44, z: 0 };
    hand[8] = { x: 0.465, y: 0.445, z: 0 };

    const result = recognizer.recognize(hand, 1000);
    expect(result.staticGesture).toBe('pinch');
    expect(result.isPinching).toBe(true);
  });

  it('detects mirrored horizontal hand movement velocity', () => {
    const recognizer = new GestureRecognizer({ mirrorX: true });
    const hand1 = createBaseHand();
    recognizer.recognize(hand1, 1000);

    // Moving raw X smaller means mirrored X moves right
    const hand2 = hand1.map((lm) => ({ ...lm, x: lm.x - 0.18 }));
    const resRight = recognizer.recognize(hand2, 1100);
    expect(resRight.motionGesture).toBe('move_right');
  });

  it('suppresses micro-jitter via LandmarkSmoother threshold', () => {
    const smoother = new LandmarkSmoother({ movementThreshold: 0.005 });
    const hand1 = createBaseHand();
    const first = smoother.update(hand1, 100);
    const tinyJitter = hand1.map((lm) => ({ ...lm, x: lm.x + 0.001 }));
    const second = smoother.update(tinyJitter, 133);
    expect(second[0].x).toBe(first[0].x);
  });

  it('maps camera coordinates into bounded stage coordinates', () => {
    const stageCenter = mapCameraToStage(0.5, 0.5);
    expect(stageCenter.x).toBeCloseTo(0.5, 2);
    expect(stageCenter.y).toBeCloseTo(0.51, 2);

    const uprightTilt = computeHandTiltDegrees(createBaseHand());
    expect(Math.abs(uprightTilt)).toBeLessThan(2);
  });

  it('evaluates two-hand input cleanly with leftHand and rightHand states', () => {
    const recognizer = new GestureRecognizer();
    const leftLm = createBaseHand().map((lm) => ({ ...lm, x: lm.x + 0.2 }));
    const rightLm = createBaseHand().map((lm) => ({ ...lm, x: lm.x - 0.2 }));
    rightLm[4] = { x: rightLm[8].x, y: rightLm[8].y, z: 0 };

    const res = recognizer.recognize(
      [
        {
          landmarks: leftLm,
          rawLandmarks: leftLm,
          worldLandmarks: null,
          handedness: 'Left',
          confidence: 0.9,
          screenWristX: 0.3,
        },
        {
          landmarks: rightLm,
          rawLandmarks: rightLm,
          worldLandmarks: null,
          handedness: 'Right',
          confidence: 0.9,
          screenWristX: 0.7,
        },
      ],
      1000
    );

    expect(res.handCount).toBe(2);
    expect(res.leftHand?.isOpenPalm).toBe(true);
    expect(res.rightHand?.isPinching).toBe(true);
    expect(res.isPinching).toBe(true);
  });
});

