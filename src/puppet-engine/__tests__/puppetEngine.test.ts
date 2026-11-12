import { describe, expect, it } from 'vitest';
import { getEmptyGestureState } from '../../computer-vision/gestureRecognition';
import type { GestureState, HandTrackingResult } from '../../types';
import { PuppetController } from '../PuppetController';
import { getSkeletonConfig } from '../PuppetSkeleton';

function makeHandLandmarks(wristX: number, wristY: number) {
  const landmarks = Array.from({ length: 21 }, (_, idx) => ({
    x: wristX,
    y: wristY - (idx === 8 ? 0.25 : 0.05),
    z: 0,
  }));
  landmarks[0] = { x: wristX, y: wristY, z: 0 };
  landmarks[9] = { x: wristX, y: wristY - 0.15, z: 0 };
  return landmarks;
}

function makeTracking(wristX: number, wristY: number): HandTrackingResult {
  const landmarks = makeHandLandmarks(wristX, wristY);

  return {
    landmarks,
    rawLandmarks: landmarks,
    worldLandmarks: null,
    handedness: 'Right',
    confidence: 0.95,
    hands: [
      {
        landmarks,
        rawLandmarks: landmarks,
        worldLandmarks: null,
        handedness: 'Right',
        confidence: 0.95,
        screenWristX: 1 - wristX,
      },
    ],
    timestamp: 1000,
    fps: 30,
  };
}

describe('PuppetController & Skeletal Limits', () => {
  it('moves puppet toward mirrored wrist position and activates grabbing on pinch', () => {
    const controller = new PuppetController('arjuna');
    const tracking = makeTracking(0.25, 0.4); // mirrored X = 0.75 (right side)
    const gesture: GestureState = {
      ...getEmptyGestureState(),
      primary: 'pinch',
      staticGesture: 'pinch',
      isPinching: true,
      confidence: 0.9,
    };

    let pose = controller.getPose();
    for (let i = 0; i < 20; i++) {
      pose = controller.updateFromTracking(tracking, gesture, 0.033);
    }

    expect(pose.x).toBeGreaterThan(0.65);
    expect(pose.y).toBeLessThan(0.5);
    expect(pose.isActive).toBe(true);
    expect(pose.isGrabbing).toBe(true);
  });

  it('clamps joint angles within configured skeleton limits', () => {
    const controller = new PuppetController('gatotkaca');
    const limits = getSkeletonConfig('gatotkaca').limits;
    const tracking = makeTracking(0.05, 0.1);
    const gesture: GestureState = {
      ...getEmptyGestureState(),
      primary: 'open_palm',
      staticGesture: 'open_palm',
      isOpenPalm: true,
      handRollAngle: 1.5, // extreme roll
      velocity: { vx: 4, vy: -3 },
    };

    const pose = controller.updateFromTracking(tracking, gesture, 0.05);
    expect(pose.rotation).toBeLessThanOrEqual(limits.rotation.max);
    expect(pose.rotation).toBeGreaterThanOrEqual(limits.rotation.min);
    expect(pose.rightShoulderAngle).toBeLessThanOrEqual(limits.shoulder.max);
    expect(pose.rightShoulderAngle).toBeGreaterThanOrEqual(limits.shoulder.min);
  });

  it('activates two-hand dalang mode and independent left/right arm grabbing', () => {
    const controller = new PuppetController('srikandi');
    const leftLm = makeHandLandmarks(0.75, 0.5); // mirrored X = 0.25
    const rightLm = makeHandLandmarks(0.25, 0.45); // mirrored X = 0.75

    const tracking: HandTrackingResult = {
      landmarks: rightLm,
      rawLandmarks: rightLm,
      worldLandmarks: null,
      handedness: 'Right',
      confidence: 0.95,
      hands: [
        {
          landmarks: leftLm,
          rawLandmarks: leftLm,
          worldLandmarks: null,
          handedness: 'Left',
          confidence: 0.92,
          screenWristX: 0.25,
        },
        {
          landmarks: rightLm,
          rawLandmarks: rightLm,
          worldLandmarks: null,
          handedness: 'Right',
          confidence: 0.95,
          screenWristX: 0.75,
        },
      ],
      timestamp: 1000,
      fps: 30,
    };

    const baseSingle = getEmptyGestureState();
    const gesture: GestureState = {
      ...baseSingle,
      primary: 'pinch',
      staticGesture: 'pinch',
      isPinching: true,
      handCount: 2,
      leftHand: { ...baseSingle, isOpenPalm: true, primary: 'open_palm' },
      rightHand: { ...baseSingle, isPinching: true, primary: 'pinch' },
    };

    let pose = controller.getPose();
    for (let i = 0; i < 15; i++) {
      pose = controller.updateFromTracking(tracking, gesture, 0.033);
    }

    expect(pose.isTwoHandControl).toBe(true);
    expect(pose.isLeftGrabbing).toBe(false);
    expect(pose.isRightGrabbing).toBe(true);
    expect(pose.x).toBeGreaterThan(0.45);
    expect(pose.x).toBeLessThan(0.55);
  });

  it('controls two independent wayang puppets via updateFromSingleHand', () => {
    const leftPuppet = new PuppetController('gatotkaca', {
      x: 0.28,
      y: 0.57,
      facing: 1,
    });
    const rightPuppet = new PuppetController('arjuna', {
      x: 0.72,
      y: 0.57,
      facing: -1,
    });

    const leftLm = makeHandLandmarks(0.75, 0.45); // mirrored X = 0.25
    const rightLm = makeHandLandmarks(0.25, 0.45); // mirrored X = 0.75
    const base = getEmptyGestureState();

    let leftPose = leftPuppet.getPose();
    let rightPose = rightPuppet.getPose();
    for (let i = 0; i < 15; i++) {
      leftPose = leftPuppet.updateFromSingleHand(
        {
          landmarks: leftLm,
          rawLandmarks: leftLm,
          worldLandmarks: null,
          handedness: 'Left',
          confidence: 0.9,
          screenWristX: 0.25,
        },
        { ...base, primary: 'open_palm', isOpenPalm: true },
        0.033,
        1
      );
      rightPose = rightPuppet.updateFromSingleHand(
        {
          landmarks: rightLm,
          rawLandmarks: rightLm,
          worldLandmarks: null,
          handedness: 'Right',
          confidence: 0.9,
          screenWristX: 0.75,
        },
        { ...base, primary: 'pinch', isPinching: true },
        0.033,
        -1
      );
    }

    expect(leftPose.facing).toBe(1);
    expect(rightPose.facing).toBe(-1);
    expect(leftPose.x).toBeLessThan(0.35);
    expect(rightPose.x).toBeGreaterThan(0.65);
    expect(leftPose.isGrabbing).toBe(false);
    expect(rightPose.isGrabbing).toBe(true);
  });
});

