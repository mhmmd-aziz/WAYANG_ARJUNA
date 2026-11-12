import { describe, expect, it } from 'vitest';
import { getEmptyGestureState } from '../../computer-vision/gestureRecognition';
import { createDefaultPose } from '../../puppet-engine/PuppetSkeleton';
import {
  createInitialProgress,
  recordLevelCompletion,
} from '../achievementManager';
import { ChallengeEvaluator } from '../challengeManager';
import { GAME_LEVELS, getLevelById } from '../levelManager';
import { buildChallengeResult } from '../scoreManager';

describe('Gamification Engine', () => {
  it('defines 5 progressive levels with unique badges', () => {
    expect(GAME_LEVELS).toHaveLength(5);
    const badgeIds = new Set(GAME_LEVELS.map((l) => l.badgeId));
    expect(badgeIds.size).toBe(5);
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
});

