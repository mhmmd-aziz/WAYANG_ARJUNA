import type {
  GestureState,
  HandArmSignal,
  HandLandmarks,
  HandTrackingResult,
  PuppetInputSignals,
  PuppetPose,
  PuppetSkeletonConfig,
  SingleHandGesture,
} from '../types';
import {
  computeHandTiltDegrees,
  mapCameraToStage,
} from '../computer-vision/coordinateMapping';
import { HAND_LANDMARK } from '../computer-vision/gestureRecognition';
import { clamp, radToDeg, solveTwoBoneIK } from '../utils/math';
import { clampPoseToLimits } from './PuppetSkeleton';

function buildArmSignal(
  landmarks: HandLandmarks,
  handGesture: SingleHandGesture
): HandArmSignal {
  const wrist = landmarks[HAND_LANDMARK.WRIST];
  const indexTip = landmarks[HAND_LANDMARK.INDEX_TIP];
  const stageWrist = mapCameraToStage(wrist.x, wrist.y);
  const stageIndex = mapCameraToStage(indexTip.x, indexTip.y);

  const avgCurl =
    (handGesture.fingerCurl.index +
      handGesture.fingerCurl.middle +
      handGesture.fingerCurl.ring +
      handGesture.fingerCurl.pinky) /
    4;

  return {
    wristX: stageWrist.x,
    wristY: stageWrist.y,
    indexTipX: stageIndex.x,
    indexTipY: stageIndex.y,
    handTiltDeg: clamp(
      computeHandTiltDegrees(landmarks, true),
      -34,
      34
    ),
    isOpenPalm: handGesture.isOpenPalm,
    isClosedFist: handGesture.isFist,
    isIndexUp: handGesture.isIndexUp,
    isPinching: handGesture.isPinching,
    fingerBendAvg: avgCurl,
    velocityX: handGesture.velocity.vx,
    velocityY: handGesture.velocity.vy,
  };
}

/**
 * Extracts normalized 1-hand or 2-hand puppet control signals from MediaPipe landmarks.
 */
export function extractPuppetSignals(
  tracking: HandTrackingResult,
  gesture: GestureState
): PuppetInputSignals {
  const hands = tracking.hands ?? [];

  // Fallback for legacy single-landmarks tests
  if (hands.length === 0 && (!tracking.landmarks || tracking.landmarks.length < 21)) {
    return {
      handDetected: false,
      handCount: 0,
      wristX: 0.5,
      wristY: 0.56,
      indexTipX: 0.5,
      indexTipY: 0.4,
      handTiltDeg: 0,
      isOpenPalm: false,
      isClosedFist: false,
      isIndexUp: false,
      isPinching: false,
      fingerBendAvg: 0,
      velocityX: 0,
      velocityY: 0,
      leftArm: null,
      rightArm: null,
    };
  }

  // Two-hand mode: hands[0] = left screen hand, hands[1] = right screen hand
  if (hands.length >= 2) {
    const leftSignal = buildArmSignal(
      hands[0].landmarks,
      gesture.leftHand ?? gesture
    );
    const rightSignal = buildArmSignal(
      hands[1].landmarks,
      gesture.rightHand ?? gesture
    );

    const midX = (leftSignal.wristX + rightSignal.wristX) / 2;
    const midY = (leftSignal.wristY + rightSignal.wristY) / 2;
    const spanDx = Math.max(0.08, rightSignal.wristX - leftSignal.wristX);
    const spanDy = rightSignal.wristY - leftSignal.wristY;
    const twoHandTilt = clamp(radToDeg(Math.atan2(spanDy, spanDx)) * 0.65, -28, 28);

    return {
      handDetected: true,
      handCount: 2,
      wristX: midX,
      wristY: midY,
      indexTipX: rightSignal.indexTipX,
      indexTipY: rightSignal.indexTipY,
      handTiltDeg: twoHandTilt,
      isOpenPalm: leftSignal.isOpenPalm || rightSignal.isOpenPalm,
      isClosedFist: leftSignal.isClosedFist && rightSignal.isClosedFist,
      isIndexUp: leftSignal.isIndexUp || rightSignal.isIndexUp,
      isPinching: leftSignal.isPinching || rightSignal.isPinching,
      fingerBendAvg: (leftSignal.fingerBendAvg + rightSignal.fingerBendAvg) / 2,
      velocityX: (leftSignal.velocityX + rightSignal.velocityX) / 2,
      velocityY: (leftSignal.velocityY + rightSignal.velocityY) / 2,
      leftArm: leftSignal,
      rightArm: rightSignal,
    };
  }

  // Single-hand mode
  const singleLm = hands[0]?.landmarks ?? tracking.landmarks!;
  const singleSignal = buildArmSignal(singleLm, gesture);

  return {
    handDetected: true,
    handCount: 1,
    wristX: singleSignal.wristX,
    wristY: singleSignal.wristY,
    indexTipX: singleSignal.indexTipX,
    indexTipY: singleSignal.indexTipY,
    handTiltDeg: singleSignal.handTiltDeg,
    isOpenPalm: singleSignal.isOpenPalm,
    isClosedFist: singleSignal.isClosedFist,
    isIndexUp: singleSignal.isIndexUp,
    isPinching: singleSignal.isPinching,
    fingerBendAvg: singleSignal.fingerBendAvg,
    velocityX: singleSignal.velocityX,
    velocityY: singleSignal.velocityY,
    leftArm: null,
    rightArm: singleSignal,
  };
}

function solveArmFromSignal(
  armSignal: HandArmSignal,
  centerX: number,
  centerY: number,
  isLeftLocalSide: boolean,
  facing: 1 | -1,
  config: PuppetSkeletonConfig
): { shoulderAngle: number; elbowAngle: number; handAngle: number } {
  const reachScale = config.upperArmLength + config.lowerArmLength;
  const pointerDx = armSignal.indexTipX - armSignal.wristX;
  const pointerDy = armSignal.indexTipY - armSignal.wristY;

  // Combine hand offset from body midpoint + index pointer direction
  const relHandX = (armSignal.wristX - centerX) * facing;
  const relHandY = armSignal.wristY - centerY;

  const signedX = isLeftLocalSide ? -relHandX - pointerDx * facing * 0.8 : relHandX + pointerDx * facing * 0.8;
  const targetX = clamp(signedX * 260 + 55, 22, reachScale * 0.96);
  const targetY = clamp((relHandY + pointerDy * 1.15) * 320 - 14, -reachScale * 0.92, reachScale * 0.72);

  const ik = solveTwoBoneIK(
    0,
    0,
    targetX,
    targetY,
    config.upperArmLength,
    config.lowerArmLength,
    1
  );

  const curlOffset = armSignal.fingerBendAvg * 26;
  const specialLift = armSignal.isPinching ? -18 : armSignal.isIndexUp ? -24 : 0;

  return {
    shoulderAngle: ik.angle1 + specialLift,
    elbowAngle: ik.angle2,
    handAngle: clamp(10 - curlOffset * 0.65 + (armSignal.isPinching ? 16 : 0), -46, 46),
  };
}

/**
 * Translates 1-hand or 2-hand signals into a full skeletal target pose.
 */
export function computeTargetPose(
  signals: PuppetInputSignals,
  currentPose: PuppetPose,
  config: PuppetSkeletonConfig
): PuppetPose {
  if (!signals.handDetected || signals.isClosedFist) {
    return clampPoseToLimits(
      {
        ...currentPose,
        rotation: 0,
        headAngle: signals.isClosedFist ? 6 : 0,
        torsoAngle: 0,
        leftShoulderAngle: -26,
        leftElbowAngle: -52,
        leftHandAngle: -8,
        rightShoulderAngle: -38,
        rightElbowAngle: -64,
        rightHandAngle: 10,
        leftHipAngle: 8,
        leftKneeAngle: 10,
        rightHipAngle: -10,
        rightKneeAngle: 12,
        isActive: false,
        isGrabbing: false,
        isLeftGrabbing: false,
        isRightGrabbing: false,
        isTwoHandControl: false,
        isPointingUp: false,
        energy: signals.isClosedFist ? 0.1 : 0.18,
      },
      config
    );
  }

  let facing = currentPose.facing;
  if (signals.velocityX > 0.16) facing = 1;
  else if (signals.velocityX < -0.16) facing = -1;

  const speedMomentum = clamp(
    Math.hypot(signals.velocityX, signals.velocityY),
    0,
    1.4
  );

  // Two-Hand Dalang Mode: independent IK for BOTH left and right arms
  if (signals.handCount >= 2 && signals.leftArm && signals.rightArm) {
    const leftScreenArm = signals.leftArm;
    const rightScreenArm = signals.rightArm;

    // Assign screen-left hand & screen-right hand to the puppet's trailing/leading arms consistently
    const trailingSignal = facing === 1 ? leftScreenArm : rightScreenArm;
    const leadingSignal = facing === 1 ? rightScreenArm : leftScreenArm;

    const leadingIK = solveArmFromSignal(
      leadingSignal,
      signals.wristX,
      signals.wristY,
      false,
      facing,
      config
    );
    const trailingIK = solveArmFromSignal(
      trailingSignal,
      signals.wristX,
      signals.wristY,
      true,
      facing,
      config
    );

    const yLift = signals.isIndexUp ? -0.04 : 0;

    return clampPoseToLimits(
      {
        x: signals.wristX,
        y: clamp(signals.wristY + yLift, 0.16, 0.85),
        rotation: signals.handTiltDeg * 0.8,
        scale: signals.isPinching ? 1.04 : 1,
        facing,
        headAngle: clamp(-signals.handTiltDeg * 0.4, -20, 20),
        torsoAngle: clamp(
          signals.velocityX * facing * 7 + signals.handTiltDeg * 0.25,
          -16,
          16
        ),
        // Trailing arm (drawn behind torso using +180 in renderer)
        leftShoulderAngle: trailingIK.shoulderAngle,
        leftElbowAngle: -trailingIK.elbowAngle,
        leftHandAngle: trailingIK.handAngle,
        // Leading arm (drawn in front of torso)
        rightShoulderAngle: leadingIK.shoulderAngle,
        rightElbowAngle: leadingIK.elbowAngle,
        rightHandAngle: leadingIK.handAngle,
        leftHipAngle: 14 + signals.velocityX * facing * 14,
        leftKneeAngle: 14 + speedMomentum * 15,
        rightHipAngle: -14 - signals.velocityX * facing * 14,
        rightKneeAngle: 18 + speedMomentum * 14,
        isActive: true,
        isGrabbing: signals.isPinching,
        isLeftGrabbing: trailingSignal.isPinching,
        isRightGrabbing: leadingSignal.isPinching,
        isTwoHandControl: true,
        isPointingUp: signals.isIndexUp,
        energy: clamp(
          0.55 + speedMomentum * 0.35 + (signals.isPinching ? 0.2 : 0),
          0,
          1
        ),
        idlePhase: currentPose.idlePhase,
      },
      config
    );
  }

  // Single-Hand Mode: leading arm driven by IK, trailing arm balances gracefully
  const pointerDx = (signals.indexTipX - signals.wristX) * facing;
  const pointerDy = signals.indexTipY - signals.wristY;
  const reachScale = config.upperArmLength + config.lowerArmLength;
  const targetArmX = clamp(pointerDx * 320 + 52, 25, reachScale * 0.96);
  const targetArmY = clamp(
    pointerDy * 320 - 12,
    -reachScale * 0.92,
    reachScale * 0.65
  );

  const ikRight = solveTwoBoneIK(
    0,
    0,
    targetArmX,
    targetArmY,
    config.upperArmLength,
    config.lowerArmLength,
    1
  );

  const curlOffset = signals.fingerBendAvg * 28;
  const yLift = signals.isIndexUp ? -0.06 : 0;
  const specialArmRaise = signals.isPinching ? -24 : signals.isIndexUp ? -30 : 0;

  return clampPoseToLimits(
    {
      x: signals.wristX,
      y: clamp(signals.wristY + yLift, 0.16, 0.85),
      rotation: signals.handTiltDeg * 0.72,
      scale: signals.isPinching ? 1.04 : 1,
      facing,
      headAngle: clamp(-signals.handTiltDeg * 0.35 + pointerDy * 25, -20, 20),
      torsoAngle: clamp(
        signals.velocityX * facing * 8 + signals.handTiltDeg * 0.2,
        -16,
        16
      ),
      leftShoulderAngle: -34 - speedMomentum * 20 - (signals.isPinching ? 22 : 0),
      leftElbowAngle: -56 - curlOffset * 0.6,
      leftHandAngle: -14 + curlOffset * 0.5,
      rightShoulderAngle: ikRight.angle1 + specialArmRaise,
      rightElbowAngle: ikRight.angle2,
      rightHandAngle: clamp(
        12 - curlOffset * 0.7 + (signals.isPinching ? 18 : 0),
        -42,
        42
      ),
      leftHipAngle: 12 + signals.velocityX * facing * 14,
      leftKneeAngle: 14 + speedMomentum * 16,
      rightHipAngle: -14 - signals.velocityX * facing * 14,
      rightKneeAngle: 18 + speedMomentum * 14,
      isActive: true,
      isGrabbing: signals.isPinching,
      isLeftGrabbing: false,
      isRightGrabbing: signals.isPinching,
      isTwoHandControl: false,
      isPointingUp: signals.isIndexUp,
      energy: clamp(
        0.45 + speedMomentum * 0.4 + (signals.isPinching ? 0.2 : 0),
        0,
        1
      ),
      idlePhase: currentPose.idlePhase,
    },
    config
  );
}
