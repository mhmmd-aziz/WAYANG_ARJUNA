import type { BadgeDefinition, LevelId, PlayerProgressState } from '../types';

const STORAGE_KEY = 'dalang_cilik_progress_v1';

export const BADGES: BadgeDefinition[] = [
  {
    id: 'first_wayang',
    name: 'Lencana Wayang Pertama',
    description: 'Berhasil mengenalkan tangan ke kamera dan menggerakkan wayang pertamamu!',
    levelId: 1,
    color: '#D4A843',
  },
  {
    id: 'gesture_master',
    name: 'Lencana Ahli Gerak Tangan',
    description: 'Menguasai telapak terbuka, kepalan tangan, telunjuk atas, dan gerakan jepit!',
    levelId: 2,
    color: '#C65D3B',
  },
  {
    id: 'puppet_controller',
    name: 'Lencana Pengendali Wayang',
    description: 'Mampu mengarahkan wayang ke berbagai titik panggung dengan akurat!',
    levelId: 3,
    color: '#3D7A5A',
  },
  {
    id: 'storyteller',
    name: 'Lencana Juru Cerita',
    description: 'Berhasil memainkan adegan cerita rakyat Nusantara bersama wayang!',
    levelId: 4,
    color: '#6B422B',
  },
  {
    id: 'dalang_cilik',
    name: 'Piala Dalang Cilik',
    description: 'Penghargaan tertinggi! Kamu telah menjadi Dalang Cilik sejati!',
    levelId: 5,
    color: '#D4A843',
    isTrophy: true,
  },
];

export function getBadgeById(badgeId: string): BadgeDefinition | null {
  return BADGES.find((b) => b.id === badgeId) ?? null;
}

export function createInitialProgress(): PlayerProgressState {
  return {
    levels: {
      1: {
        levelId: 1,
        unlocked: true,
        completed: false,
        bestScore: 0,
        bestAccuracy: 0,
        stars: 0,
        attempts: 0,
      },
      2: {
        levelId: 2,
        unlocked: false,
        completed: false,
        bestScore: 0,
        bestAccuracy: 0,
        stars: 0,
        attempts: 0,
      },
      3: {
        levelId: 3,
        unlocked: false,
        completed: false,
        bestScore: 0,
        bestAccuracy: 0,
        stars: 0,
        attempts: 0,
      },
      4: {
        levelId: 4,
        unlocked: false,
        completed: false,
        bestScore: 0,
        bestAccuracy: 0,
        stars: 0,
        attempts: 0,
      },
      5: {
        levelId: 5,
        unlocked: false,
        completed: false,
        bestScore: 0,
        bestAccuracy: 0,
        stars: 0,
        attempts: 0,
      },
    },
    earnedBadgeIds: [],
    tutorialCompleted: false,
    selectedCharacterId: 'arjuna',
    totalScore: 0,
  };
}

export function loadPlayerProgress(): PlayerProgressState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createInitialProgress();
    const parsed = JSON.parse(raw) as Partial<PlayerProgressState>;
    const base = createInitialProgress();

    return {
      ...base,
      ...parsed,
      levels: {
        ...base.levels,
        ...(parsed.levels ?? {}),
      },
      earnedBadgeIds: Array.isArray(parsed.earnedBadgeIds)
        ? parsed.earnedBadgeIds
        : [],
    };
  } catch {
    return createInitialProgress();
  }
}

export function savePlayerProgress(state: PlayerProgressState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Ignore storage quota errors in restricted browser contexts
  }
}

export function recordLevelCompletion(
  current: PlayerProgressState,
  levelId: LevelId,
  score: number,
  accuracy: number,
  stars: 0 | 1 | 2 | 3,
  passed: boolean,
  badgeId: string | null
): { nextState: PlayerProgressState; newlyEarnedBadge: boolean } {
  const prevLevel = current.levels[levelId];
  const updatedLevel = {
    ...prevLevel,
    completed: prevLevel.completed || passed,
    bestScore: Math.max(prevLevel.bestScore, score),
    bestAccuracy: Math.max(prevLevel.bestAccuracy, accuracy),
    stars: Math.max(prevLevel.stars, stars) as 0 | 1 | 2 | 3,
    attempts: prevLevel.attempts + 1,
  };

  const nextLevels = {
    ...current.levels,
    [levelId]: updatedLevel,
  };

  if (passed && levelId < 5) {
    const nextId = (levelId + 1) as LevelId;
    nextLevels[nextId] = {
      ...nextLevels[nextId],
      unlocked: true,
    };
  }

  let newlyEarnedBadge = false;
  const nextBadges = [...current.earnedBadgeIds];
  if (passed && badgeId && !nextBadges.includes(badgeId)) {
    nextBadges.push(badgeId);
    newlyEarnedBadge = true;
  }

  const totalScore = (Object.values(nextLevels) as Array<{ bestScore: number }>)
    .reduce((sum, lvl) => sum + lvl.bestScore, 0);

  const nextState: PlayerProgressState = {
    ...current,
    levels: nextLevels,
    earnedBadgeIds: nextBadges,
    totalScore,
  };

  savePlayerProgress(nextState);
  return { nextState, newlyEarnedBadge };
}

