import type { ChallengeResult, LevelDefinition } from '../types';
import { clamp } from '../utils/math';
import { getBadgeById } from './achievementManager';

export function calculateStarRating(
  completedSteps: number,
  totalSteps: number,
  accuracy: number
): 0 | 1 | 2 | 3 {
  if (completedSteps < totalSteps) {
    return completedSteps >= Math.ceil(totalSteps / 2) ? 1 : 0;
  }
  if (accuracy >= 82) return 3;
  if (accuracy >= 62) return 2;
  return 1;
}

export function buildChallengeResult(params: {
  level: LevelDefinition;
  completedSteps: number;
  activeMatchTimeMs: number;
  totalElapsedMs: number;
  newlyEarned: boolean;
}): ChallengeResult {
  const { level, completedSteps, activeMatchTimeMs, totalElapsedMs, newlyEarned } =
    params;
  const totalSteps = level.steps.length;
  const passed = completedSteps >= totalSteps;

  const durationSec = Math.max(1, Math.round(totalElapsedMs / 1000));
  const stepPoints = completedSteps * 200;
  const maxStepPoints = totalSteps * 200;

  // Time bonus when completed before time limit
  const remainingSec = Math.max(0, level.timeLimitSec - durationSec);
  const timeBonus = passed ? Math.round(remainingSec * 3) : 0;

  // Accuracy blends completion rate and how cleanly target gestures/zones were held
  const completionRatio = completedSteps / Math.max(1, totalSteps);
  const requiredHoldMs = level.steps
    .slice(0, completedSteps)
    .reduce((acc, s) => acc + s.holdDurationMs, 0);
  const speedEfficiency = passed
    ? clamp(
        (requiredHoldMs + 4000) / Math.max(requiredHoldMs + 4000, totalElapsedMs * 0.45),
        0.55,
        1
      )
    : clamp(activeMatchTimeMs / Math.max(1000, totalElapsedMs), 0.25, 0.85);

  const accuracy = Math.round(
    clamp((completionRatio * 0.65 + speedEfficiency * 0.35) * 100, 15, 100)
  );

  const score = stepPoints + timeBonus;
  const maxScore = maxStepPoints + level.timeLimitSec * 2;
  const stars = calculateStarRating(completedSteps, totalSteps, accuracy);

  const badge = passed ? getBadgeById(level.badgeId) : null;

  let feedbackSummary =
    'Ayo coba lagi! Kamu pasti bisa menyelesaikan tantangan ini.';
  if (passed && stars === 3) {
    feedbackSummary =
      'Luar biasa! Gerakanmu sangat akurat dan halus seperti dalang sungguhan!';
  } else if (passed && stars === 2) {
    feedbackSummary =
      'Hebat sekali! Kamu berhasil menaklukkan tantangan dengan sangat baik.';
  } else if (passed) {
    feedbackSummary =
      'Bagus! Kamu berhasil menyelesaikan semua langkah tantangan ini.';
  }

  return {
    levelId: level.id,
    levelTitle: level.title,
    score,
    maxScore,
    accuracy,
    completedSteps,
    totalSteps,
    durationSec,
    stars,
    passed,
    earnedBadge: badge,
    newlyEarned,
    feedbackSummary,
  };
}

