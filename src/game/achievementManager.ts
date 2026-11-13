import type {
  BadgeDefinition,
  CommercialPlanId,
  LevelAccessTier,
  LevelId,
  LevelProgress,
  PlayerProgressState,
} from '../types';

const STORAGE_KEY = 'dalang_cilik_progress_v1';

export const BADGES: BadgeDefinition[] = [
  {
    id: 'first_wayang',
    name: 'Lencana Wayang Pertama',
    description:
      'Berhasil mengenalkan tangan ke kamera dan menggerakkan wayang pertamamu.',
    levelId: 1,
    color: '#D4A843',
  },
  {
    id: 'gesture_master',
    name: 'Lencana Ahli Gerak Tangan',
    description:
      'Menguasai telapak terbuka, kepalan tangan, telunjuk atas, dan gerakan jepit.',
    levelId: 2,
    color: '#C65D3B',
  },
  {
    id: 'puppet_controller',
    name: 'Lencana Pengendali Wayang',
    description:
      'Mampu mengarahkan wayang ke berbagai titik panggung dengan akurat.',
    levelId: 3,
    color: '#3D7A5A',
  },
  {
    id: 'storyteller',
    name: 'Lencana Juru Cerita',
    description:
      'Berhasil memainkan adegan cerita rakyat Nusantara bersama wayang.',
    levelId: 4,
    color: '#6B422B',
  },
  {
    id: 'dalang_cilik',
    name: 'Lencana Dalang Pemula',
    description:
      'Menuntaskan 5 level dasar ARJUNA dengan keterampilan sabetan awal.',
    levelId: 5,
    color: '#D4A843',
  },
  {
    id: 'timun_mas_hero',
    name: 'Lencana Keberanian Timun Mas',
    description:
      'Menaklukkan lakon cerita rakyat Timun Mas & Raksasa dari Jawa Tengah.',
    levelId: 6,
    color: '#3D7A5A',
  },
  {
    id: 'minang_navigator',
    name: 'Lencana Bakti Nusantara',
    description:
      'Menyelesaikan lakon Malin Kundang & memahami nilai bakti kepada orang tua.',
    levelId: 7,
    color: '#C65D3B',
  },
  {
    id: 'prambanan_builder',
    name: 'Lencana Candi Prambanan',
    description:
      'Menyusun candi seribu dengan ketepatan sabetan kiri, tengah, dan timur.',
    levelId: 8,
    color: '#8B5A2B',
  },
  {
    id: 'pasopati_master',
    name: 'Lencana Pemanah Pasopati',
    description:
      'Menguasai latihan fokus tingkat lanjut bersama Raden Arjuna.',
    levelId: 9,
    color: '#9E3124',
  },
  {
    id: 'mahaguru_dalang',
    name: 'Piala Agung Dalang Nusantara',
    description:
      'Penghargaan tertinggi ARJUNA! Menuntaskan seluruh 10 level pembelajaran wayang & cerita rakyat.',
    levelId: 10,
    color: '#D4A843',
    isTrophy: true,
  },
];

export function getBadgeById(badgeId: string): BadgeDefinition | null {
  return BADGES.find((b) => b.id === badgeId) ?? null;
}

export function isTierIncludedInPlan(
  tier: LevelAccessTier,
  plan: CommercialPlanId = 'freemium'
): boolean {
  if (tier === 'free') return true;
  if (tier === 'episode_pack') {
    return plan === 'lakon_pack' || plan === 'institutional';
  }
  return plan === 'institutional';
}

function makeEmptyLevel(levelId: LevelId, unlocked: boolean): LevelProgress {
  return {
    levelId,
    unlocked,
    completed: false,
    bestScore: 0,
    bestAccuracy: 0,
    stars: 0,
    attempts: 0,
  };
}

export function createInitialProgress(): PlayerProgressState {
  return {
    levels: {
      1: makeEmptyLevel(1, true),
      2: makeEmptyLevel(2, false),
      3: makeEmptyLevel(3, false),
      4: makeEmptyLevel(4, false),
      5: makeEmptyLevel(5, false),
      6: makeEmptyLevel(6, false),
      7: makeEmptyLevel(7, false),
      8: makeEmptyLevel(8, false),
      9: makeEmptyLevel(9, false),
      10: makeEmptyLevel(10, false),
    },
    earnedBadgeIds: [],
    tutorialCompleted: false,
    selectedCharacterId: 'arjuna',
    totalScore: 0,
    activePlan: 'freemium',
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
      activePlan: parsed.activePlan ?? 'freemium',
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

export function switchCommercialPlan(
  current: PlayerProgressState,
  planId: CommercialPlanId
): PlayerProgressState {
  const nextLevels = { ...current.levels };
  // Unlock preview access for the selected commercial package in frontend simulation
  if (planId === 'lakon_pack' || planId === 'institutional') {
    ([6, 7, 8] as LevelId[]).forEach((id) => {
      nextLevels[id] = { ...nextLevels[id], unlocked: true };
    });
  }
  if (planId === 'institutional') {
    ([9, 10] as LevelId[]).forEach((id) => {
      nextLevels[id] = { ...nextLevels[id], unlocked: true };
    });
  }

  const nextState: PlayerProgressState = {
    ...current,
    activePlan: planId,
    levels: nextLevels,
  };
  savePlayerProgress(nextState);
  return nextState;
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
  const prevLevel = current.levels[levelId] ?? makeEmptyLevel(levelId, true);
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

  if (passed && levelId < 10) {
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

