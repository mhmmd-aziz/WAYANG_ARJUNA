import type {
  PuppetCharacter,
  PuppetPose,
  PuppetSkeletonConfig,
} from '../types';
import { clamp, degToRad, lerp, lerpAngleDeg } from '../utils/math';

/**
 * Smoothly interpolates the puppet pose each frame and layers gentle
 * organic idle breathing / swaying on top.
 */
export function stepPuppetAnimation(
  current: PuppetPose,
  target: PuppetPose,
  dtSec: number,
  celebrationTimerSec = 0
): PuppetPose {
  const smoothFactor = clamp(dtSec * 12, 0.08, 0.55);
  const jointFactor = clamp(dtSec * 14, 0.1, 0.62);
  const nextIdlePhase = (current.idlePhase + dtSec * 2.4) % (Math.PI * 2);

  const breath = Math.sin(nextIdlePhase);
  const celebrateBounce =
    celebrationTimerSec > 0 ? Math.sin(celebrationTimerSec * 16) * 0.025 : 0;

  return {
    x: lerp(current.x, target.x, smoothFactor),
    y: clamp(
      lerp(current.y, target.y, smoothFactor) + celebrateBounce,
      0.12,
      0.88
    ),
    rotation: lerpAngleDeg(
      current.rotation,
      target.rotation + breath * (target.isActive ? 1.2 : 2.0),
      jointFactor
    ),
    scale: lerp(current.scale, target.scale, smoothFactor),
    facing: target.facing,
    headAngle: lerpAngleDeg(
      current.headAngle,
      target.headAngle + breath * 1.5,
      jointFactor
    ),
    torsoAngle: lerpAngleDeg(
      current.torsoAngle,
      target.torsoAngle + breath * 1.1,
      jointFactor
    ),
    leftShoulderAngle: lerpAngleDeg(
      current.leftShoulderAngle,
      target.leftShoulderAngle + breath * 3.0,
      jointFactor
    ),
    leftElbowAngle: lerpAngleDeg(
      current.leftElbowAngle,
      target.leftElbowAngle - breath * 2.2,
      jointFactor
    ),
    leftHandAngle: lerpAngleDeg(
      current.leftHandAngle,
      target.leftHandAngle + breath * 3.5,
      jointFactor
    ),
    rightShoulderAngle: lerpAngleDeg(
      current.rightShoulderAngle,
      target.rightShoulderAngle - breath * 3.0,
      jointFactor
    ),
    rightElbowAngle: lerpAngleDeg(
      current.rightElbowAngle,
      target.rightElbowAngle + breath * 2.0,
      jointFactor
    ),
    rightHandAngle: lerpAngleDeg(
      current.rightHandAngle,
      target.rightHandAngle - breath * 3.5,
      jointFactor
    ),
    leftHipAngle: lerpAngleDeg(
      current.leftHipAngle,
      target.leftHipAngle + breath * 1.3,
      jointFactor
    ),
    leftKneeAngle: lerpAngleDeg(
      current.leftKneeAngle,
      target.leftKneeAngle,
      jointFactor
    ),
    rightHipAngle: lerpAngleDeg(
      current.rightHipAngle,
      target.rightHipAngle - breath * 1.3,
      jointFactor
    ),
    rightKneeAngle: lerpAngleDeg(
      current.rightKneeAngle,
      target.rightKneeAngle,
      jointFactor
    ),
    isActive: target.isActive,
    isGrabbing: target.isGrabbing,
    isLeftGrabbing: target.isLeftGrabbing,
    isRightGrabbing: target.isRightGrabbing,
    isTwoHandControl: target.isTwoHandControl,
    isPointingUp: target.isPointingUp,
    energy: lerp(current.energy, target.energy, smoothFactor),
    idlePhase: nextIdlePhase,
  };
}

/**
 * Draws an elongated, carved Wayang Kulit limb segment with tapered profile.
 */
function drawWayangLimb(
  ctx: CanvasRenderingContext2D,
  length: number,
  wStart: number,
  wEnd: number,
  fill: string,
  shade: string,
  stroke: string
): void {
  const grad = ctx.createLinearGradient(0, -wStart / 2, 0, wStart / 2);
  grad.addColorStop(0, fill);
  grad.addColorStop(1, shade);

  ctx.beginPath();
  ctx.moveTo(0, -wStart * 0.5);
  ctx.quadraticCurveTo(length * 0.45, -wStart * 0.42, length, -wEnd * 0.5);
  ctx.arc(length, 0, wEnd * 0.5, -Math.PI / 2, Math.PI / 2);
  ctx.quadraticCurveTo(length * 0.45, wStart * 0.42, 0, wStart * 0.5);
  ctx.arc(0, 0, wStart * 0.5, Math.PI / 2, -Math.PI / 2);
  ctx.closePath();
  ctx.fillStyle = grad;
  ctx.fill();
  ctx.lineWidth = 1.8;
  ctx.strokeStyle = stroke;
  ctx.stroke();
}

/**
 * Draws stylized articulated Wayang fingers (driji) with tapered curves.
 */
function drawWayangHand(
  ctx: CanvasRenderingContext2D,
  handLen: number,
  fill: string,
  gold: string,
  stroke: string
): void {
  // Gelang (carved wrist bangle)
  ctx.fillStyle = gold;
  ctx.strokeStyle = stroke;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(-2, -6.5, 7, 13, 2);
  ctx.fill();
  ctx.stroke();

  // Palm + elongated stylized wayang fingers
  ctx.beginPath();
  ctx.moveTo(4, -5);
  ctx.quadraticCurveTo(handLen * 0.45, -7, handLen * 0.95, -4.5);
  ctx.quadraticCurveTo(handLen * 1.15, -2.5, handLen * 0.85, -0.5);
  ctx.lineTo(handLen * 1.08, 1.5);
  ctx.quadraticCurveTo(handLen * 0.9, 3.5, handLen * 0.58, 3);
  ctx.lineTo(handLen * 0.72, 5.5);
  ctx.quadraticCurveTo(handLen * 0.35, 6.5, 4, 4.5);
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.stroke();
}

/**
 * Draws the traditional bamboo/horn Tuding rod hanging vertically from the hand joint.
 */
function drawTudingRod(
  ctx: CanvasRenderingContext2D,
  rodLength: number,
  gold: string,
  outline: string
): void {
  ctx.save();
  // Horn/bamboo shaft
  ctx.beginPath();
  ctx.moveTo(0, 2);
  ctx.lineTo(0, rodLength);
  ctx.strokeStyle = '#6A4423';
  ctx.lineWidth = 3.2;
  ctx.lineCap = 'round';
  ctx.stroke();

  // Highlight edge
  ctx.beginPath();
  ctx.moveTo(-0.8, 4);
  ctx.lineTo(-0.8, rodLength - 4);
  ctx.strokeStyle = 'rgba(243, 227, 182, 0.35)';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Joint brass rivet
  ctx.beginPath();
  ctx.arc(0, 0, 3.2, 0, Math.PI * 2);
  ctx.fillStyle = gold;
  ctx.fill();
  ctx.lineWidth = 1.2;
  ctx.strokeStyle = outline;
  ctx.stroke();
  ctx.restore();
}

/**
 * Draws delicate tatahan filigree dot perforations along crowns & praba ornaments.
 */
function drawTatahanDots(
  ctx: CanvasRenderingContext2D,
  points: ReadonlyArray<readonly [number, number]>,
  radius = 1.5
): void {
  ctx.save();
  ctx.fillStyle = '#2B170C';
  for (const [x, y] of points) {
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

/**
 * Renders an authentic traditional Wayang Kulit Purwa head profile (Sirah).
 */
function drawAuthenticWayangHead(
  ctx: CanvasRenderingContext2D,
  character: PuppetCharacter,
  h: number
): void {
  const { palette } = character;
  ctx.save();

  if (character.id === 'semar') {
    // Authentic Ki Lurah Semar Punakawan profile
    // Hair back & traditional black skull
    ctx.beginPath();
    ctx.moveTo(-h * 0.42, 0);
    ctx.bezierCurveTo(-h * 0.62, -h * 0.35, -h * 0.55, -h * 0.92, -h * 0.1, -h * 1.0);
    ctx.bezierCurveTo(h * 0.25, -h * 1.02, h * 0.48, -h * 0.8, h * 0.46, -h * 0.45);
    ctx.lineTo(h * 0.62, -h * 0.34); // distinctive rounded Punakawan nose
    ctx.quadraticCurveTo(h * 0.56, -h * 0.22, h * 0.42, -h * 0.22);
    ctx.quadraticCurveTo(h * 0.5, -h * 0.08, h * 0.34, 0); // smiling chin
    ctx.closePath();
    ctx.fillStyle = palette.skin;
    ctx.fill();
    ctx.lineWidth = 2.2;
    ctx.strokeStyle = palette.outline;
    ctx.stroke();

    // White face patch (authentic Javanese Semar sunggingan)
    ctx.beginPath();
    ctx.moveTo(-h * 0.02, -h * 0.1);
    ctx.quadraticCurveTo(h * 0.02, -h * 0.64, h * 0.38, -h * 0.56);
    ctx.lineTo(h * 0.43, -h * 0.42);
    ctx.lineTo(h * 0.56, -h * 0.33);
    ctx.lineTo(h * 0.38, -h * 0.22);
    ctx.quadraticCurveTo(h * 0.35, -h * 0.06, -h * 0.02, -h * 0.1);
    ctx.closePath();
    ctx.fillStyle = '#EFE7D6';
    ctx.fill();
    ctx.lineWidth = 1.4;
    ctx.stroke();

    // Kuncung (iconic upright white hair tuft)
    ctx.beginPath();
    ctx.moveTo(h * 0.08, -h * 0.95);
    ctx.bezierCurveTo(h * 0.24, -h * 1.38, h * 0.58, -h * 1.25, h * 0.38, -h * 0.92);
    ctx.closePath();
    ctx.fillStyle = '#F7F1E3';
    ctx.fill();
    ctx.stroke();

    // Ear ornament (Suweng)
    ctx.beginPath();
    ctx.arc(-h * 0.12, -h * 0.42, h * 0.11, 0, Math.PI * 2);
    ctx.fillStyle = palette.gold;
    ctx.fill();
    ctx.stroke();

    // Mripat kriyipan (narrow expressive smiling eye)
    ctx.beginPath();
    ctx.moveTo(h * 0.16, -h * 0.46);
    ctx.quadraticCurveTo(h * 0.28, -h * 0.54, h * 0.38, -h * 0.45);
    ctx.quadraticCurveTo(h * 0.28, -h * 0.41, h * 0.16, -h * 0.46);
    ctx.fillStyle = '#1B1410';
    ctx.fill();
    ctx.restore();
    return;
  }

  const isWarrior = character.id === 'gatotkaca';

  // Neck + Sharp Classical Javanese Wayang Facial Profile
  const faceGrad = ctx.createLinearGradient(-h * 0.3, -h * 0.7, h * 0.6, 0);
  faceGrad.addColorStop(0, palette.skinShade);
  faceGrad.addColorStop(0.55, palette.skin);
  faceGrad.addColorStop(1, palette.goldHighlight);

  ctx.beginPath();
  ctx.moveTo(-h * 0.28, h * 0.16);
  ctx.lineTo(-h * 0.32, -h * 0.62);
  ctx.lineTo(h * 0.36, -h * 0.68);
  // Concave forehead bridge into long slender pointed wayang nose
  ctx.quadraticCurveTo(h * 0.48, -h * 0.5, h * 0.54, -h * 0.36);
  ctx.lineTo(isWarrior ? h * 0.8 : h * 0.76, -h * 0.26); // sharp nose tip
  ctx.lineTo(h * 0.52, -h * 0.21); // under-nose
  ctx.lineTo(h * 0.56, -h * 0.15); // upper lip
  ctx.lineTo(h * 0.48, -h * 0.11); // lower lip
  ctx.lineTo(h * 0.5, -h * 0.05); // sharp chin
  ctx.quadraticCurveTo(h * 0.26, h * 0.04, h * 0.22, h * 0.16);
  ctx.closePath();
  ctx.fillStyle = faceGrad;
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = palette.outline;
  ctx.stroke();

  // Jambang / Hair & Sideburn detail
  ctx.beginPath();
  ctx.moveTo(-h * 0.3, -h * 0.56);
  ctx.quadraticCurveTo(-h * 0.05, -h * 0.52, h * 0.12, -h * 0.32);
  ctx.quadraticCurveTo(-h * 0.02, -h * 0.12, -h * 0.22, -h * 0.06);
  ctx.lineTo(-h * 0.32, -h * 0.56);
  ctx.closePath();
  ctx.fillStyle = '#1E140E';
  ctx.fill();

  // Gelung / Mahkota (Ornate Crown)
  const crownGrad = ctx.createLinearGradient(-h * 0.8, -h * 1.5, h * 0.4, -h * 0.5);
  crownGrad.addColorStop(0, palette.gold);
  crownGrad.addColorStop(0.5, palette.goldHighlight);
  crownGrad.addColorStop(1, '#A4751D');

  ctx.beginPath();
  if (character.id === 'arjuna') {
    // Classic Gelung Supit Urang (curved lobster-claw noble headdress)
    ctx.moveTo(-h * 0.34, -h * 0.52);
    ctx.bezierCurveTo(-h * 1.05, -h * 0.92, -h * 0.92, -h * 1.65, -h * 0.15, -h * 1.48);
    ctx.bezierCurveTo(-h * 0.42, -h * 1.25, -h * 0.48, -h * 0.92, -h * 0.1, -h * 0.85);
    ctx.lineTo(h * 0.42, -h * 0.68);
    ctx.lineTo(h * 0.34, -h * 0.56);
    ctx.closePath();
    ctx.fillStyle = '#1A1412'; // black carved hair inside gelung
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = palette.outline;
    ctx.stroke();

    // Gold Jamang forehead crown plate
    ctx.beginPath();
    ctx.moveTo(-h * 0.28, -h * 0.56);
    ctx.lineTo(-h * 0.38, -h * 0.82);
    ctx.lineTo(h * 0.04, -h * 0.88);
    ctx.lineTo(h * 0.43, -h * 0.67);
    ctx.lineTo(h * 0.33, -h * 0.54);
    ctx.closePath();
    ctx.fillStyle = crownGrad;
    ctx.fill();
    ctx.stroke();

    drawTatahanDots(ctx, [
      [-h * 0.24, -h * 0.72],
      [-h * 0.08, -h * 0.76],
      [h * 0.1, -h * 0.72],
      [h * 0.26, -h * 0.64],
    ]);
  } else if (character.id === 'srikandi') {
    // Dewi Srikandi: Graceful Gelung + Cunduk Mentul + Jamang
    ctx.moveTo(-h * 0.34, -h * 0.5);
    ctx.bezierCurveTo(-h * 0.95, -h * 0.68, -h * 0.85, -h * 1.38, -h * 0.24, -h * 1.28);
    ctx.bezierCurveTo(-h * 0.02, -h * 1.22, h * 0.05, -h * 0.9, h * 0.38, -h * 0.66);
    ctx.lineTo(h * 0.32, -h * 0.54);
    ctx.closePath();
    ctx.fillStyle = '#1E130E';
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = palette.outline;
    ctx.stroke();

    // Gold Jamang + Hairpin ornament
    ctx.beginPath();
    ctx.moveTo(-h * 0.3, -h * 0.56);
    ctx.lineTo(-h * 0.42, -h * 0.86);
    ctx.lineTo(-h * 0.08, -h * 0.95);
    ctx.lineTo(h * 0.4, -h * 0.67);
    ctx.lineTo(h * 0.32, -h * 0.54);
    ctx.closePath();
    ctx.fillStyle = crownGrad;
    ctx.fill();
    ctx.stroke();

    // Cunduk bunga emas
    ctx.beginPath();
    ctx.moveTo(-h * 0.38, -h * 1.05);
    ctx.lineTo(-h * 0.58, -h * 1.42);
    ctx.strokeStyle = palette.goldHighlight;
    ctx.lineWidth = 2.2;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(-h * 0.58, -h * 1.42, 4.5, 0, Math.PI * 2);
    ctx.fillStyle = palette.accent;
    ctx.fill();
    ctx.strokeStyle = palette.outline;
    ctx.lineWidth = 1.4;
    ctx.stroke();
  } else {
    // Gatotkaca: Grand Makuta Ketopong tiered warrior crown + Garuda Mungkur
    ctx.moveTo(-h * 0.4, -h * 0.52);
    ctx.lineTo(-h * 0.68, -h * 0.95);
    ctx.lineTo(-h * 0.42, -h * 1.02);
    ctx.lineTo(-h * 0.46, -h * 1.38);
    ctx.lineTo(-h * 0.16, -h * 1.24);
    ctx.lineTo(h * 0.02, -h * 1.56);
    ctx.lineTo(h * 0.18, -h * 1.18);
    ctx.lineTo(h * 0.45, -h * 0.95);
    ctx.lineTo(h * 0.4, -h * 0.62);
    ctx.closePath();
    ctx.fillStyle = crownGrad;
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = palette.outline;
    ctx.stroke();

    drawTatahanDots(ctx, [
      [-h * 0.42, -h * 0.88],
      [-h * 0.25, -h * 1.05],
      [-h * 0.02, -h * 1.22],
      [h * 0.14, -h * 0.96],
      [h * 0.28, -h * 0.74],
    ]);
  }

  // Sumping (Ornate ear winglet)
  ctx.beginPath();
  ctx.moveTo(-h * 0.14, -h * 0.44);
  ctx.bezierCurveTo(-h * 0.46, -h * 0.62, -h * 0.42, -h * 0.14, -h * 0.06, -h * 0.22);
  ctx.closePath();
  ctx.fillStyle = crownGrad;
  ctx.fill();
  ctx.lineWidth = 1.6;
  ctx.strokeStyle = palette.outline;
  ctx.stroke();

  // Traditional Wayang Eye (Mripat)
  ctx.beginPath();
  if (isWarrior) {
    // Mripat Thelengan (round fierce warrior eye)
    ctx.ellipse(h * 0.28, -h * 0.41, h * 0.12, h * 0.085, -0.08, 0, Math.PI * 2);
  } else {
    // Mripat Liyepan (slender calm noble almond eye)
    ctx.moveTo(h * 0.14, -h * 0.42);
    ctx.quadraticCurveTo(h * 0.29, -h * 0.49, h * 0.43, -h * 0.4);
    ctx.quadraticCurveTo(h * 0.29, -h * 0.35, h * 0.14, -h * 0.42);
  }
  ctx.fillStyle = '#FFF9EC';
  ctx.fill();
  ctx.lineWidth = 1.4;
  ctx.strokeStyle = palette.outline;
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(h * 0.3, -h * 0.41, isWarrior ? 3.2 : 2.3, 0, Math.PI * 2);
  ctx.fillStyle = '#1B110B';
  ctx.fill();

  // Stylized curved eyebrow
  ctx.beginPath();
  ctx.moveTo(h * 0.12, -h * 0.5);
  ctx.quadraticCurveTo(h * 0.28, -h * 0.56, h * 0.44, -h * 0.47);
  ctx.strokeStyle = '#1B110B';
  ctx.lineWidth = 1.8;
  ctx.stroke();

  ctx.restore();
}

function drawArmChain(
  ctx: CanvasRenderingContext2D,
  shoulderX: number,
  shoulderY: number,
  shoulderAngleDeg: number,
  elbowAngleDeg: number,
  handAngleDeg: number,
  upperLen: number,
  lowerLen: number,
  handLen: number,
  character: PuppetCharacter,
  isGrabbing: boolean
): void {
  const { palette } = character;

  ctx.save();
  ctx.translate(shoulderX, shoulderY);
  ctx.rotate(degToRad(shoulderAngleDeg));

  // Upper arm + Kelat Bahu (winged gold armlet)
  drawWayangLimb(
    ctx,
    upperLen,
    13,
    9.5,
    palette.skin,
    palette.skinShade,
    palette.outline
  );
  ctx.beginPath();
  ctx.moveTo(upperLen * 0.18, -7);
  ctx.lineTo(upperLen * 0.36, -9);
  ctx.lineTo(upperLen * 0.4, 9);
  ctx.lineTo(upperLen * 0.18, 7);
  ctx.closePath();
  ctx.fillStyle = palette.gold;
  ctx.fill();
  ctx.lineWidth = 1.4;
  ctx.strokeStyle = palette.outline;
  ctx.stroke();

  // Elbow joint rivet
  ctx.translate(upperLen, 0);
  ctx.beginPath();
  ctx.arc(0, 0, 3.2, 0, Math.PI * 2);
  ctx.fillStyle = palette.goldHighlight;
  ctx.fill();
  ctx.stroke();

  ctx.rotate(degToRad(elbowAngleDeg));
  drawWayangLimb(
    ctx,
    lowerLen,
    9.5,
    6.8,
    palette.skin,
    palette.skinShade,
    palette.outline
  );

  // Hand joint
  ctx.translate(lowerLen, 0);
  ctx.rotate(degToRad(handAngleDeg));
  drawWayangHand(ctx, handLen, palette.skin, palette.gold, palette.outline);

  // Signature Pusaka when hand performs Pinch gesture
  if (isGrabbing) {
    ctx.save();
    ctx.translate(handLen * 0.72, 0);
    if (character.id === 'arjuna' || character.id === 'srikandi') {
      // Ornate Golden Busur & Panah Pasopati
      ctx.strokeStyle = palette.goldHighlight;
      ctx.lineWidth = 3.2;
      ctx.beginPath();
      ctx.arc(-4, 0, 32, -Math.PI * 0.44, Math.PI * 0.44);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, -30);
      ctx.lineTo(0, 30);
      ctx.strokeStyle = 'rgba(255, 248, 225, 0.75)';
      ctx.lineWidth = 1.2;
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-14, 0);
      ctx.lineTo(44, 0);
      ctx.strokeStyle = palette.gold;
      ctx.lineWidth = 2.6;
      ctx.stroke();
      // Arrowhead
      ctx.beginPath();
      ctx.moveTo(48, 0);
      ctx.lineTo(38, -5);
      ctx.lineTo(38, 5);
      ctx.closePath();
      ctx.fillStyle = palette.accent;
      ctx.fill();
    } else {
      // Golden Pusaka / Antakusuma Aura Spark
      const aura = ctx.createRadialGradient(8, 0, 2, 8, 0, 22);
      aura.addColorStop(0, 'rgba(255, 240, 179, 0.95)');
      aura.addColorStop(1, 'rgba(212, 168, 67, 0)');
      ctx.fillStyle = aura;
      ctx.beginPath();
      ctx.arc(8, 0, 22, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  // Hang vertical Tuding control rod pinned at the palm/base of fingers
  const transform = ctx.getTransform();
  ctx.restore();

  ctx.save();
  ctx.setTransform(transform);
  ctx.translate(handLen * 0.55, 0);
  const angle = Math.atan2(transform.b, transform.a);
  ctx.rotate(-angle);
  drawTudingRod(ctx, 130, palette.goldHighlight, palette.outline);
  ctx.restore();
}

function drawLegChain(
  ctx: CanvasRenderingContext2D,
  hipX: number,
  hipY: number,
  hipAngleDeg: number,
  kneeAngleDeg: number,
  thighLen: number,
  calfLen: number,
  character: PuppetCharacter
): void {
  const { palette } = character;

  ctx.save();
  ctx.translate(hipX, hipY);
  ctx.rotate(degToRad(hipAngleDeg + 90));
  drawWayangLimb(
    ctx,
    thighLen,
    18,
    12,
    palette.fabricSecondary,
    palette.fabricPrimary,
    palette.outline
  );

  ctx.translate(thighLen, 0);
  ctx.rotate(degToRad(kneeAngleDeg));
  drawWayangLimb(
    ctx,
    calfLen,
    11,
    7.5,
    palette.skin,
    palette.skinShade,
    palette.outline
  );

  // Kroncong anklet & pointed wayang foot
  ctx.translate(calfLen, 0);
  ctx.beginPath();
  ctx.moveTo(-2, -5);
  ctx.lineTo(14, 0);
  ctx.quadraticCurveTo(18, 5, 8, 7);
  ctx.lineTo(-2, 4);
  ctx.closePath();
  ctx.fillStyle = palette.gold;
  ctx.fill();
  ctx.lineWidth = 1.6;
  ctx.strokeStyle = palette.outline;
  ctx.stroke();

  ctx.restore();
}

/**
 * Draws traditional geometric Batik Parang / Kawung lines onto the kain dodot skirt.
 */
function drawBatikPattern(
  ctx: CanvasRenderingContext2D,
  wHip: number,
  gold: string
): void {
  ctx.save();
  ctx.strokeStyle = 'rgba(247, 223, 141, 0.48)';
  ctx.lineWidth = 1.2;

  for (let row = -6; row <= 32; row += 10) {
    ctx.beginPath();
    ctx.moveTo(-wHip * 0.55, row);
    ctx.lineTo(wHip * 0.55, row + 8);
    ctx.stroke();
  }

  // Gold Uncal hanging sash diamonds
  ctx.fillStyle = gold;
  for (let i = -1; i <= 1; i += 2) {
    ctx.beginPath();
    ctx.moveTo(i * 10, 4);
    ctx.lineTo(i * 16, 22);
    ctx.lineTo(i * 10, 38);
    ctx.lineTo(i * 4, 22);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}

/**
 * Renders an authentic traditional Javanese Wayang Kulit puppet with
 * kelir shadow projection, gapit/cempurit spine, tuding rods, tatahan filigree,
 * and dual-arm articulation.
 */
export function renderWayangPuppet(
  ctx: CanvasRenderingContext2D,
  pose: PuppetPose,
  character: PuppetCharacter,
  skeleton: PuppetSkeletonConfig,
  canvasWidth: number,
  canvasHeight: number,
  celebrationSec = 0
): void {
  const { palette } = character;
  const centerX = pose.x * canvasWidth;
  const centerY = pose.y * canvasHeight;
  const responsiveScale =
    (Math.min(canvasWidth, canvasHeight) / 450) * pose.scale;

  ctx.save();
  ctx.translate(centerX, centerY);
  ctx.scale(pose.facing * responsiveScale, responsiveScale);
  ctx.rotate(degToRad(pose.rotation));

  // Warm Blencong oil-lamp kelir glow behind puppet
  const glowRadius = 155 + pose.energy * 35;
  const grad = ctx.createRadialGradient(0, -40, 20, 0, -40, glowRadius);
  if (pose.isGrabbing) {
    grad.addColorStop(0, 'rgba(247, 223, 141, 0.55)');
    grad.addColorStop(1, 'rgba(247, 223, 141, 0)');
  } else if (pose.isActive) {
    grad.addColorStop(0, 'rgba(212, 168, 67, 0.34)');
    grad.addColorStop(1, 'rgba(212, 168, 67, 0)');
  } else {
    grad.addColorStop(0, 'rgba(198, 93, 59, 0.14)');
    grad.addColorStop(1, 'rgba(198, 93, 59, 0)');
  }
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(0, -40, glowRadius, 0, Math.PI * 2);
  ctx.fill();

  // Traditional Gapit / Cempurit horn spine rising behind body and extending down as handle
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(-4, -skeleton.torsoLength - skeleton.headSize * 0.8);
  ctx.quadraticCurveTo(-8, -skeleton.torsoLength * 0.4, 0, 18);
  ctx.lineTo(0, 220);
  ctx.strokeStyle = '#4E2F16';
  ctx.lineWidth = 5.5;
  ctx.lineCap = 'round';
  ctx.stroke();
  ctx.restore();

  // Legs (Jangkah stance)
  drawLegChain(
    ctx,
    -13,
    20,
    pose.leftHipAngle,
    pose.leftKneeAngle,
    skeleton.thighLength,
    skeleton.calfLength,
    character
  );
  drawLegChain(
    ctx,
    13,
    20,
    pose.rightHipAngle,
    pose.rightKneeAngle,
    skeleton.thighLength,
    skeleton.calfLength,
    character
  );

  // Flowing pleated Sampur (traditional dancer/knight sash)
  const sway = Math.sin(pose.idlePhase * 1.5) * 10 + pose.energy * 16;
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(-14, -46);
  ctx.bezierCurveTo(-56 - sway, -8, -48 - sway, 46, -34 - sway * 1.15, 96);
  ctx.lineTo(-14 - sway * 0.7, 92);
  ctx.bezierCurveTo(-24 - sway * 0.3, 42, -20, 6, -6, -34);
  ctx.closePath();
  ctx.fillStyle = palette.accent;
  ctx.fill();
  ctx.lineWidth = 1.8;
  ctx.strokeStyle = palette.outline;
  ctx.stroke();
  // Gold fringe at sampur tip
  ctx.fillStyle = palette.gold;
  ctx.fillRect(-35 - sway * 1.05, 90, 21, 5);
  ctx.restore();

  // Rotate torso & upper body assembly
  const shoulderY = -skeleton.torsoLength * 0.78;
  ctx.save();
  ctx.rotate(degToRad(pose.torsoAngle));

  // Trailing (left) arm behind torso
  drawArmChain(
    ctx,
    -18,
    shoulderY,
    pose.leftShoulderAngle + 180,
    -pose.leftElbowAngle,
    pose.leftHandAngle,
    skeleton.upperArmLength,
    skeleton.lowerArmLength,
    skeleton.handLength,
    character,
    pose.isLeftGrabbing
  );

  // Authentic Praba (carved pierced-leather back ornament)
  if (character.id !== 'semar') {
    ctx.save();
    ctx.translate(-14, shoulderY + 6);
    ctx.beginPath();
    if (character.id === 'gatotkaca') {
      // Grand Gatotkaca winged Praba Antakusuma
      ctx.moveTo(0, -18);
      ctx.bezierCurveTo(-72, -56, -86, -4, -56, 36);
      ctx.quadraticCurveTo(-28, 30, 0, 24);
    } else {
      // Refined noble Praba winglet
      ctx.moveTo(0, -8);
      ctx.bezierCurveTo(-48, -32, -52, 8, -32, 28);
      ctx.quadraticCurveTo(-15, 24, 0, 18);
    }
    ctx.closePath();
    ctx.fillStyle = palette.gold;
    ctx.fill();
    ctx.lineWidth = 1.8;
    ctx.strokeStyle = palette.outline;
    ctx.stroke();
    drawTatahanDots(ctx, [
      [-22, -6],
      [-32, 6],
      [-20, 14],
    ]);
    ctx.restore();
  }

  // Torso (Awak): tapered waist for knights, iconic round silhouette for Semar
  const wTop = character.id === 'semar' ? 38 : 35;
  const wWaist = character.id === 'semar' ? 54 : 21;
  const wHip = character.id === 'semar' ? 58 : 34;

  const torsoGrad = ctx.createLinearGradient(-wTop / 2, -skeleton.torsoLength, wTop / 2, 16);
  torsoGrad.addColorStop(
    0,
    character.id === 'semar' ? palette.skin : palette.skinShade
  );
  torsoGrad.addColorStop(
    0.5,
    character.id === 'semar' ? palette.skin : palette.skin
  );
  torsoGrad.addColorStop(1, palette.fabricPrimary);

  ctx.beginPath();
  ctx.moveTo(-wTop * 0.55, -skeleton.torsoLength);
  ctx.lineTo(wTop * 0.55, -skeleton.torsoLength);
  ctx.quadraticCurveTo(wWaist * 0.65, -skeleton.torsoLength * 0.35, wHip * 0.5, 16);
  ctx.lineTo(-wHip * 0.5, 16);
  ctx.quadraticCurveTo(-wWaist * 0.65, -skeleton.torsoLength * 0.35, -wTop * 0.55, -skeleton.torsoLength);
  ctx.closePath();
  ctx.fillStyle = torsoGrad;
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = palette.outline;
  ctx.stroke();

  // Head (Sirah) drawn before Kalung so the neck tucks cleanly inside the golden collar
  ctx.save();
  ctx.translate(0, -skeleton.torsoLength - 2);
  ctx.rotate(degToRad(pose.headAngle));
  drawAuthenticWayangHead(ctx, character, skeleton.headSize);
  ctx.restore();

  // Kalung Penanggalan / Ulur-ulur (layered ornate gold chest necklace)
  ctx.beginPath();
  ctx.moveTo(-wTop * 0.52, -skeleton.torsoLength + 2);
  ctx.quadraticCurveTo(0, -skeleton.torsoLength + 38, wTop * 0.52, -skeleton.torsoLength + 2);
  ctx.lineTo(wTop * 0.34, -skeleton.torsoLength);
  ctx.lineTo(-wTop * 0.34, -skeleton.torsoLength);
  ctx.closePath();
  ctx.fillStyle = palette.gold;
  ctx.fill();
  ctx.stroke();

  // Gatotkaca Antakusuma Star Crest
  if (character.id === 'gatotkaca') {
    ctx.save();
    ctx.translate(0, -skeleton.torsoLength * 0.52);
    ctx.beginPath();
    for (let i = 0; i < 8; i++) {
      const r = i % 2 === 0 ? 11 : 4.5;
      const a = (Math.PI * i) / 4;
      if (i === 0) ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r);
      else ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
    }
    ctx.closePath();
    ctx.fillStyle = palette.goldHighlight;
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  // Kain Dodot / Jarit / Poleng Waist Wrap
  ctx.beginPath();
  ctx.moveTo(-wHip * 0.58, -14);
  ctx.lineTo(wHip * 0.58, -14);
  ctx.lineTo(wHip * 0.85, 38);
  ctx.lineTo(0, 44);
  ctx.lineTo(-wHip * 0.85, 38);
  ctx.closePath();
  ctx.fillStyle =
    character.id === 'semar' ? palette.fabricPrimary : palette.fabricSecondary;
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = palette.outline;
  ctx.stroke();

  if (character.id === 'semar') {
    // Classic Poleng black-and-white checkered sarong motif for Semar
    ctx.fillStyle = palette.fabricSecondary;
    ctx.fillRect(-20, -10, 14, 16);
    ctx.fillRect(6, -10, 14, 16);
    ctx.fillRect(-7, 6, 14, 18);
    ctx.fillRect(-28, 20, 14, 16);
    ctx.fillRect(14, 20, 14, 16);
  } else {
    drawBatikPattern(ctx, wHip, palette.gold);
  }

  // Pending (Ornate gold waist belt & buckle)
  ctx.beginPath();
  ctx.roundRect(-wHip * 0.6, -17, wHip * 1.2, 10, 3);
  ctx.fillStyle = palette.gold;
  ctx.fill();
  ctx.stroke();

  // Leading (right) arm in front of torso
  drawArmChain(
    ctx,
    18,
    shoulderY,
    pose.rightShoulderAngle,
    pose.rightElbowAngle,
    pose.rightHandAngle,
    skeleton.upperArmLength,
    skeleton.lowerArmLength,
    skeleton.handLength,
    character,
    pose.isRightGrabbing || pose.isGrabbing
  );

  ctx.restore(); // torso rotation

  // Golden celebration sparkles when a challenge step is completed
  if (celebrationSec > 0) {
    const sparkleCount = 8;
    const burst = (1.2 - Math.min(1.2, celebrationSec)) * 75;
    for (let i = 0; i < sparkleCount; i++) {
      const theta = (Math.PI * 2 * i) / sparkleCount + celebrationSec * 2.5;
      const sx = Math.cos(theta) * (58 + burst);
      const sy = -48 + Math.sin(theta) * (58 + burst);
      ctx.beginPath();
      ctx.arc(sx, sy, 4.5, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(247, 223, 141, ${Math.min(1, celebrationSec * 1.4)})`;
      ctx.fill();
    }
  }

  ctx.restore(); // root transform
}
