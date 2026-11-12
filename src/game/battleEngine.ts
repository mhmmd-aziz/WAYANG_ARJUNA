import type { PuppetPose, SingleHandGesture } from '../types';
import { clamp, distance2D } from '../utils/math';

export type BattleSide = 'left' | 'right';
export type BattleControlMode = 'two_hands' | 'vs_ai';

export interface FighterState {
  hp: number;
  maxHp: number;
  energy: number;
  maxEnergy: number;
  isDefending: boolean;
  hitFlashSec: number;
  attackCooldownSec: number;
  jurusCooldownSec: number;
  comboCount: number;
  statusText: string;
}

export type ProjectileKind = 'slash' | 'arrow' | 'jurus';

export interface BattleProjectile {
  id: number;
  owner: BattleSide;
  kind: ProjectileKind;
  x: number;
  y: number;
  vx: number;
  vy: number;
  damage: number;
  color: string;
}

export interface BattleVisualEffect {
  id: number;
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  lifeSec: number;
  maxLifeSec: number;
  color: string;
  label?: string;
}

export type BattleSoundEvent =
  | { type: 'whoosh'; intensity: number }
  | { type: 'slash' }
  | { type: 'jurus' }
  | { type: 'hit'; heavy: boolean }
  | { type: 'block' }
  | { type: 'victory' };

export interface BattleSnapshot {
  left: FighterState;
  right: FighterState;
  remainingSec: number;
  finished: boolean;
  winner: BattleSide | 'draw' | null;
  projectiles: BattleProjectile[];
  effects: BattleVisualEffect[];
  shakeIntensity: number;
}

const ROUND_DURATION_SEC = 90;
const MAX_HP = 100;
const MAX_ENERGY = 100;

function createFighter(statusText: string): FighterState {
  return {
    hp: MAX_HP,
    maxHp: MAX_HP,
    energy: 50,
    maxEnergy: MAX_ENERGY,
    isDefending: false,
    hitFlashSec: 0,
    attackCooldownSec: 0,
    jurusCooldownSec: 0,
    comboCount: 0,
    statusText,
  };
}

/**
 * Pure real-time battle state machine driving HP bars, energy, defense,
 * intuitive punch/swing slash waves, quick index-finger shots, and Pinch Jurus Pusaka.
 */
export class WayangBattleEngine {
  private left: FighterState;
  private right: FighterState;
  private remainingSec = ROUND_DURATION_SEC;
  private finished = false;
  private winner: BattleSide | 'draw' | null = null;
  private projectiles: BattleProjectile[] = [];
  private effects: BattleVisualEffect[] = [];
  private shakeIntensity = 0;
  private nextId = 1;

  constructor() {
    this.left = createFighter('Siap Bertanding');
    this.right = createFighter('Siap Bertanding');
  }

  reset(): void {
    this.left = createFighter('Siap Bertanding');
    this.right = createFighter('Siap Bertanding');
    this.remainingSec = ROUND_DURATION_SEC;
    this.finished = false;
    this.winner = null;
    this.projectiles = [];
    this.effects = [];
    this.shakeIntensity = 0;
  }

  getSnapshot(): BattleSnapshot {
    return {
      left: { ...this.left },
      right: { ...this.right },
      remainingSec: Math.max(0, Math.ceil(this.remainingSec)),
      finished: this.finished,
      winner: this.winner,
      projectiles: this.projectiles.map((p) => ({ ...p })),
      effects: this.effects.map((e) => ({ ...e })),
      shakeIntensity: this.shakeIntensity,
    };
  }

  private spawnEffect(
    x: number,
    y: number,
    color: string,
    maxRadius: number,
    label?: string
  ): void {
    this.effects.push({
      id: this.nextId++,
      x,
      y,
      radius: 8,
      maxRadius,
      lifeSec: 0.52,
      maxLifeSec: 0.52,
      color,
      label,
    });
  }

  private launchProjectile(
    owner: BattleSide,
    kind: ProjectileKind,
    fromPose: PuppetPose,
    toPose: PuppetPose,
    speed: number,
    damage: number,
    color: string
  ): void {
    const dx = toPose.x - fromPose.x;
    const dy = toPose.y - fromPose.y;
    const len = Math.max(0.05, Math.hypot(dx, dy));

    this.projectiles.push({
      id: this.nextId++,
      owner,
      kind,
      x: fromPose.x + (dx / len) * 0.06,
      y: fromPose.y - 0.07,
      vx: (dx / len) * speed,
      vy: (dy / len) * speed,
      damage,
      color,
    });
  }

  private applyDamage(
    attackerSide: BattleSide,
    defenderSide: BattleSide,
    baseDamage: number,
    impactX: number,
    impactY: number,
    isHeavy: boolean,
    sounds: BattleSoundEvent[]
  ): void {
    const attacker = attackerSide === 'left' ? this.left : this.right;
    const defender = defenderSide === 'left' ? this.left : this.right;

    if (defender.isDefending) {
      const reduced = Math.max(2, Math.round(baseDamage * 0.25));
      defender.hp = Math.max(0, defender.hp - reduced);
      defender.hitFlashSec = 0.16;
      defender.statusText = 'Tangkis Perisai!';
      sounds.push({ type: 'block' });
      this.spawnEffect(impactX, impactY, '#D4A843', 44, `TANGKIS -${reduced}`);
    } else {
      defender.hp = Math.max(0, defender.hp - baseDamage);
      defender.hitFlashSec = 0.26;
      defender.statusText = 'Terkena Serangan!';
      attacker.comboCount += 1;
      sounds.push({ type: 'hit', heavy: isHeavy });
      this.shakeIntensity = Math.max(this.shakeIntensity, isHeavy ? 8 : 4.5);
      this.spawnEffect(
        impactX,
        impactY,
        isHeavy ? '#D4A843' : '#C65D3B',
        isHeavy ? 62 : 46,
        `-${baseDamage}`
      );
    }

    if (defender.hp <= 0 && !this.finished) {
      this.finished = true;
      this.winner = attackerSide;
      sounds.push({ type: 'victory' });
    }
  }

  private processFighterInput(
    side: BattleSide,
    pose: PuppetPose,
    opponentPose: PuppetPose,
    gesture: SingleHandGesture | null,
    handActive: boolean,
    dtSec: number,
    sounds: BattleSoundEvent[]
  ): void {
    const fighter = side === 'left' ? this.left : this.right;
    const opponentSide: BattleSide = side === 'left' ? 'right' : 'left';
    const sideColor = side === 'left' ? '#16A34A' : '#DC2626';

    fighter.attackCooldownSec = Math.max(0, fighter.attackCooldownSec - dtSec);
    fighter.jurusCooldownSec = Math.max(0, fighter.jurusCooldownSec - dtSec);
    fighter.hitFlashSec = Math.max(0, fighter.hitFlashSec - dtSec);

    if (!handActive || !gesture) {
      fighter.energy = clamp(fighter.energy + dtSec * 8, 0, MAX_ENERGY);
      fighter.statusText = 'Menunggu Tangan';
      return;
    }

    const speed = Math.hypot(gesture.velocity.vx, gesture.velocity.vy);
    fighter.energy = clamp(
      fighter.energy + dtSec * (11 + speed * 8),
      0,
      MAX_ENERGY
    );

    // 1. Hold Fist Still -> Defense Shield (Perisai Tangkis)
    if (fighter.isDefending) {
      fighter.statusText = 'Perisai Tangkis!';
      return;
    }

    // 2. Pinch -> Jurus Pusaka (Heavy golden projectile)
    if (
      gesture.isPinching &&
      fighter.jurusCooldownSec <= 0 &&
      fighter.energy >= 22
    ) {
      fighter.energy -= 22;
      fighter.jurusCooldownSec = 1.0;
      fighter.statusText = 'Jurus Pusaka!';
      sounds.push({ type: 'jurus' });
      this.launchProjectile(
        side,
        'jurus',
        pose,
        opponentPose,
        0.92,
        18,
        '#D4A843'
      );
      return;
    }

    // 3. Fast Hand Swing / Punch Motion -> Melee strike if close, OR flying Slash Wave if far!
    if (speed > 0.45) {
      sounds.push({
        type: 'whoosh',
        intensity: clamp((speed - 0.35) / 1.4, 0.35, 1),
      });

      if (fighter.attackCooldownSec <= 0) {
        fighter.attackCooldownSec = 0.52;
        fighter.statusText = 'Pukulan Sabetan!';
        sounds.push({ type: 'slash' });

        const dist = distance2D(pose.x, pose.y, opponentPose.x, opponentPose.y);
        if (dist < 0.34) {
          const midX = (pose.x + opponentPose.x) / 2;
          const midY = (pose.y + opponentPose.y) / 2 - 0.05;
          this.applyDamage(side, opponentSide, 12, midX, midY, false, sounds);
        } else {
          // Send a visible punch/slash wave across the kelir so swings from either side land!
          this.launchProjectile(
            side,
            'slash',
            pose,
            opponentPose,
            1.15,
            10,
            sideColor
          );
        }
        return;
      }
    }

    // 4. Index Finger Up -> Quick Arrow / Energy Shot (easy & intuitive for kids!)
    if (gesture.isIndexUp && fighter.attackCooldownSec <= 0) {
      fighter.attackCooldownSec = 0.65;
      fighter.statusText = 'Serangan Telunjuk!';
      sounds.push({ type: 'slash' });
      this.launchProjectile(
        side,
        'arrow',
        pose,
        opponentPose,
        1.0,
        9,
        '#C65D3B'
      );
      return;
    }

    if (fighter.attackCooldownSec <= 0.15) {
      fighter.statusText = gesture.isOpenPalm
        ? 'Siap Memukul (Ayunkan!)'
        : 'Siaga Bertarung';
    }
  }

  update(params: {
    dtSec: number;
    leftPose: PuppetPose;
    rightPose: PuppetPose;
    leftGesture: SingleHandGesture | null;
    rightGesture: SingleHandGesture | null;
    leftActive: boolean;
    rightActive: boolean;
  }): { snapshot: BattleSnapshot; sounds: BattleSoundEvent[] } {
    const {
      dtSec,
      leftPose,
      rightPose,
      leftGesture,
      rightGesture,
      leftActive,
      rightActive,
    } = params;
    const sounds: BattleSoundEvent[] = [];

    this.shakeIntensity = Math.max(0, this.shakeIntensity - dtSec * 24);
    this.effects = this.effects
      .map((ef) => {
        const nextLife = ef.lifeSec - dtSec;
        const t = 1 - Math.max(0, nextLife) / ef.maxLifeSec;
        return {
          ...ef,
          lifeSec: nextLife,
          radius: 10 + (ef.maxRadius - 10) * t,
        };
      })
      .filter((ef) => ef.lifeSec > 0);

    if (this.finished) {
      return { snapshot: this.getSnapshot(), sounds };
    }

    this.remainingSec = Math.max(0, this.remainingSec - dtSec);

    // Only a STILL closed fist activates Perisai Tangkis; a fast-moving fist punches!
    const leftSpeed = leftGesture
      ? Math.hypot(leftGesture.velocity.vx, leftGesture.velocity.vy)
      : 0;
    const rightSpeed = rightGesture
      ? Math.hypot(rightGesture.velocity.vx, rightGesture.velocity.vy)
      : 0;

    this.left.isDefending = Boolean(
      leftActive && leftGesture?.isFist && leftSpeed < 0.45
    );
    this.right.isDefending = Boolean(
      rightActive && rightGesture?.isFist && rightSpeed < 0.45
    );

    this.processFighterInput(
      'left',
      leftPose,
      rightPose,
      leftGesture,
      leftActive,
      dtSec,
      sounds
    );
    this.processFighterInput(
      'right',
      rightPose,
      leftPose,
      rightGesture,
      rightActive,
      dtSec,
      sounds
    );

    // Advance projectiles and check collisions
    const surviving: BattleProjectile[] = [];
    for (const proj of this.projectiles) {
      const nextX = proj.x + proj.vx * dtSec;
      const nextY = proj.y + proj.vy * dtSec;
      if (nextX < -0.1 || nextX > 1.1 || nextY < -0.1 || nextY > 1.1) {
        continue;
      }

      const targetSide: BattleSide = proj.owner === 'left' ? 'right' : 'left';
      const targetPose = targetSide === 'left' ? leftPose : rightPose;
      const hitDist = distance2D(nextX, nextY, targetPose.x, targetPose.y - 0.06);

      if (hitDist < 0.14) {
        this.applyDamage(
          proj.owner,
          targetSide,
          proj.damage,
          nextX,
          nextY,
          proj.kind === 'jurus',
          sounds
        );
      } else {
        surviving.push({ ...proj, x: nextX, y: nextY });
      }
    }
    this.projectiles = surviving;

    if (this.remainingSec <= 0 && !this.finished) {
      this.finished = true;
      if (this.left.hp > this.right.hp) this.winner = 'left';
      else if (this.right.hp > this.left.hp) this.winner = 'right';
      else this.winner = 'draw';
      sounds.push({ type: 'victory' });
    }

    return { snapshot: this.getSnapshot(), sounds };
  }
}
