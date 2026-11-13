import { describe, expect, it } from 'vitest';
import { getEmptyGestureState } from '../../computer-vision/gestureRecognition';
import { createDefaultPose } from '../../puppet-engine/PuppetSkeleton';
import {
  createInitialProgress,
  recordLevelCompletion,
  switchCommercialPlan,
} from '../achievementManager';
import { WayangBattleEngine } from '../battleEngine';
import { ChallengeEvaluator } from '../challengeManager';
import { GAME_LEVELS, getLevelById } from '../levelManager';
import { buildChallengeResult } from '../scoreManager';

describe('Gamification Engine', () => {
  it('defines 10 progressive levels with unique badges', () => {
    expect(GAME_LEVELS).toHaveLength(10);
    const badgeIds = new Set(GAME_LEVELS.map((l) => l.badgeId));
    expect(badgeIds.size).toBe(10);
  });

  it('advances steps and passes Level 1 when objectives are held', () => {
    const level1 = getLevelById(1);
    const evaluator = new ChallengeEvaluator(level1);
    const pose = createDefaultPose();
    const gesture = {
      ...getEmptyGestureState(),
      primary: 'open_palm' as const,
      staticGesture: 'open_palm' as const,
      isOpenPalm: true,
    };

    // Step 1: detect_hand
    let update = evaluator.update(1200, true, pose, gesture);
    expect(update.stepJustCompleted).toBe(true);
    expect(update.stepIndex).toBe(1);

    // Step 2: move left zone
    const leftPose = { ...pose, x: 0.24, y: 0.55 };
    update = evaluator.update(800, true, leftPose, gesture);
    expect(update.stepJustCompleted).toBe(true);

    // Step 3: move right zone
    const rightPose = { ...pose, x: 0.76, y: 0.55 };
    update = evaluator.update(800, true, rightPose, gesture);
    expect(update.stepJustCompleted).toBe(true);

    // Step 4: move up zone
    const upPose = { ...pose, x: 0.5, y: 0.28 };
    update = evaluator.update(800, true, upPose, gesture);
    expect(update.levelFinished).toBe(true);
    expect(update.passed).toBe(true);

    const result = buildChallengeResult({
      level: level1,
      completedSteps: evaluator.getCompletedSteps(),
      activeMatchTimeMs: evaluator.getActiveMatchMs(),
      totalElapsedMs: evaluator.getElapsedMs(),
      newlyEarned: true,
    });
    expect(result.passed).toBe(true);
    expect(result.stars).toBeGreaterThanOrEqual(2);
    expect(result.earnedBadge?.id).toBe('first_wayang');
  });

  it('unlocks next level and awards badge upon completion', () => {
    const initial = createInitialProgress();
    expect(initial.levels[2].unlocked).toBe(false);

    const { nextState, newlyEarnedBadge } = recordLevelCompletion(
      initial,
      1,
      950,
      92,
      3,
      true,
      'first_wayang'
    );

    expect(newlyEarnedBadge).toBe(true);
    expect(nextState.levels[1].completed).toBe(true);
    expect(nextState.levels[2].unlocked).toBe(true);
    expect(nextState.earnedBadgeIds).toContain('first_wayang');
  });

  it('unlocks commercial pack levels via switchCommercialPlan frontend simulator', () => {
    const base = createInitialProgress();
    expect(base.levels[6].unlocked).toBe(false);
    expect(base.levels[9].unlocked).toBe(false);

    const withLakon = switchCommercialPlan(base, 'lakon_pack');
    expect(withLakon.activePlan).toBe('lakon_pack');
    expect(withLakon.levels[6].unlocked).toBe(true);
    expect(withLakon.levels[8].unlocked).toBe(true);
    expect(withLakon.levels[9].unlocked).toBe(false);

    const withSchool = switchCommercialPlan(withLakon, 'institutional');
    expect(withSchool.levels[9].unlocked).toBe(true);
    expect(withSchool.levels[10].unlocked).toBe(true);
  });

  it('handles battle strikes, defense blocking, and jurus projectiles', () => {
    const engine = new WayangBattleEngine();
    const baseGesture = getEmptyGestureState();
    const leftPose = { ...createDefaultPose(), x: 0.42, y: 0.55 };
    const rightPose = { ...createDefaultPose(), x: 0.58, y: 0.55 };

    // Fast swing by left wayang deals melee damage + whoosh/slash/hit sounds
    const { snapshot: snap1, sounds: sounds1 } = engine.update({
      dtSec: 0.05,
      leftPose,
      rightPose,
      leftGesture: {
        ...baseGesture,
        primary: 'open_palm',
        isOpenPalm: true,
        velocity: { vx: 1.1, vy: 0 },
      },
      rightGesture: {
        ...baseGesture,
        primary: 'open_palm',
        isOpenPalm: true,
      },
      leftActive: true,
      rightActive: true,
    });

    expect(snap1.right.hp).toBeLessThan(100);
    expect(sounds1.some((s) => s.type === 'slash')).toBe(true);
    expect(sounds1.some((s) => s.type === 'hit')).toBe(true);

    // Right wayang closes fist to defend and triggers block clang
    const { snapshot: snap2, sounds: sounds2 } = engine.update({
      dtSec: 0.75,
      leftPose,
      rightPose,
      leftGesture: {
        ...baseGesture,
        primary: 'open_palm',
        isOpenPalm: true,
        velocity: { vx: 1.2, vy: 0 },
      },
      rightGesture: {
        ...baseGesture,
        primary: 'closed_fist',
        isFist: true,
      },
      leftActive: true,
      rightActive: true,
    });

    expect(snap2.right.isDefending).toBe(true);
    expect(sounds2.some((s) => s.type === 'block')).toBe(true);

    // Pinch from a distance launches a Jurus projectile in flight
    const farLeft = { ...createDefaultPose(), x: 0.2, y: 0.55 };
    const farRight = { ...createDefaultPose(), x: 0.8, y: 0.55 };
    const { snapshot: snap3, sounds: sounds3 } = engine.update({
      dtSec: 0.05,
      leftPose: farLeft,
      rightPose: farRight,
      leftGesture: {
        ...baseGesture,
        primary: 'pinch',
        isPinching: true,
      },
      rightGesture: {
        ...baseGesture,
        primary: 'open_palm',
        isOpenPalm: true,
      },
      leftActive: true,
      rightActive: true,
    });

    expect(snap3.projectiles.length).toBe(1);
    expect(snap3.projectiles[0].kind).toBe('jurus');
    expect(sounds3.some((s) => s.type === 'jurus')).toBe(true);

    // Advance cooldown cleanly before testing ranged slash & arrow projectiles
    engine.update({
      dtSec: 0.75,
      leftPose: farLeft,
      rightPose: farRight,
      leftGesture: { ...baseGesture, primary: 'open_palm', isOpenPalm: true },
      rightGesture: { ...baseGesture, primary: 'open_palm', isOpenPalm: true },
      leftActive: true,
      rightActive: true,
    });

    // Fast swing from a distance launches a ranged 'slash' wave
    const { snapshot: snap4, sounds: sounds4 } = engine.update({
      dtSec: 0.05,
      leftPose: farLeft,
      rightPose: farRight,
      leftGesture: {
        ...baseGesture,
        primary: 'open_palm',
        isOpenPalm: true,
        velocity: { vx: 1.0, vy: 0 },
      },
      rightGesture: {
        ...baseGesture,
        primary: 'open_palm',
        isOpenPalm: true,
      },
      leftActive: true,
      rightActive: true,
    });

    expect(snap4.projectiles.some((p) => p.kind === 'slash')).toBe(true);
    expect(sounds4.some((s) => s.type === 'slash')).toBe(true);

    // Pointing index finger up fires a quick 'arrow' shot
    const { snapshot: snap5 } = engine.update({
      dtSec: 0.05,
      leftPose: farLeft,
      rightPose: farRight,
      leftGesture: {
        ...baseGesture,
        primary: 'open_palm',
        isOpenPalm: true,
      },
      rightGesture: {
        ...baseGesture,
        primary: 'index_up',
        isIndexUp: true,
      },
      leftActive: true,
      rightActive: true,
    });

    expect(snap5.projectiles.some((p) => p.kind === 'arrow')).toBe(true);
  });

  it('completes move_zone when puppet torso overlaps zone even with lower waist Y', () => {
    const level1 = getLevelById(1);
    const evaluator = new ChallengeEvaluator(level1);
    const gesture = {
      ...getEmptyGestureState(),
      primary: 'open_palm' as const,
      staticGesture: 'open_palm' as const,
      isOpenPalm: true,
    };

    // Complete step 1 (detect_hand)
    evaluator.update(1200, true, createDefaultPose(), gesture);

    // Step 2 (l1-left: x 0.24, y 0.55, r 0.16) — waist Y at 0.68 means chest sits right inside 0.55
    const lowerWaistLeftPose = { ...createDefaultPose(), x: 0.24, y: 0.68 };
    const step2Update = evaluator.update(800, true, lowerWaistLeftPose, gesture);
    expect(step2Update.stepJustCompleted).toBe(true);
    expect(step2Update.stepIndex).toBe(2);
  });
});

