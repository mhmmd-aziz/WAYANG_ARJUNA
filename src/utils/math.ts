export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function lerp(start: number, end: number, factor: number): number {
  return start + (end - start) * clamp(factor, 0, 1);
}

export function distance2D(
  x1: number,
  y1: number,
  x2: number,
  y2: number
): number {
  return Math.hypot(x2 - x1, y2 - y1);
}

export function distance3D(
  x1: number,
  y1: number,
  z1: number,
  x2: number,
  y2: number,
  z2: number
): number {
  return Math.hypot(x2 - x1, y2 - y1, z2 - z1);
}

export function radToDeg(rad: number): number {
  return (rad * 180) / Math.PI;
}

export function degToRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

/**
 * Computes shortest angular interpolation in degrees.
 */
export function lerpAngleDeg(start: number, end: number, factor: number): number {
  const diff = ((((end - start) % 360) + 540) % 360) - 180;
  return start + diff * clamp(factor, 0, 1);
}

/**
 * Simple 2-bone analytical inverse kinematics solver.
 * Returns shoulder/hip offset angle and elbow/knee bend angle in degrees.
 */
export function solveTwoBoneIK(
  rootX: number,
  rootY: number,
  targetX: number,
  targetY: number,
  length1: number,
  length2: number,
  bendDirection: 1 | -1 = 1
): { angle1: number; angle2: number } {
  const dx = targetX - rootX;
  const dy = targetY - rootY;
  const maxReach = Math.max(0.001, length1 + length2 - 0.001);
  const minReach = Math.abs(length1 - length2) + 0.001;
  const dist = clamp(Math.hypot(dx, dy), minReach, maxReach);

  const baseAngle = Math.atan2(dy, dx);
  const cosAngle1 = clamp(
    (length1 * length1 + dist * dist - length2 * length2) / (2 * length1 * dist),
    -1,
    1
  );
  const cosAngle2 = clamp(
    (length1 * length1 + length2 * length2 - dist * dist) / (2 * length1 * length2),
    -1,
    1
  );

  const offset1 = Math.acos(cosAngle1) * bendDirection;
  const interior2 = Math.acos(cosAngle2);

  const angle1Deg = radToDeg(baseAngle + offset1);
  const angle2Deg = radToDeg((Math.PI - interior2) * -bendDirection);

  return { angle1: angle1Deg, angle2: angle2Deg };
}

