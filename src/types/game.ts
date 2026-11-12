import type { GestureType } from './hand';

export type AppPage =
  | 'landing'
  | 'characters'
  | 'dashboard'
  | 'studio'
  | 'tutorial'
  | 'challenge'
  | 'result';

export type LevelId = 1 | 2 | 3 | 4 | 5;

export type LevelDifficulty =
  | 'Pemula'
  | 'Mudah'
  | 'Sedang'
  | 'Lanjutan'
  | 'Tantangan';

export type StageIconType =
  | 'left'
  | 'right'
  | 'up'
  | 'down'
  | 'lantern'
  | 'sparkles'
  | 'target'
  | 'bow'
  | 'gate'
  | 'stage'
  | 'star'
  | 'lightning';

export interface TargetZone {
  /** Normalized 0..1 coordinates on the puppet stage */
  x: number;
  y: number;
  radius: number;
  label: string;
  icon?: StageIconType;
}

export interface InteractiveStoryObject {
  id: string;
  label: string;
  icon: StageIconType;
  x: number;
  y: number;
}

export type ChallengeTaskType =
  | 'detect_hand'
  | 'move_zone'
  | 'perform_gesture'
  | 'story_beat'
  | 'combo_sequence';

export interface ChallengeStep {
  id: string;
  type: ChallengeTaskType;
  title: string;
  instruction: string;
  encouragement: string;
  requiredGesture?: GestureType;
  targetZone?: TargetZone;
  holdDurationMs: number;
  storySpeaker?: string;
  storyNarration?: string;
  storyObject?: InteractiveStoryObject;
}

export interface LevelDefinition {
  id: LevelId;
  title: string;
  subtitle: string;
  difficulty: LevelDifficulty;
  description: string;
  badgeId: string;
  timeLimitSec: number;
  steps: ChallengeStep[];
}

export interface BadgeDefinition {
  id: string;
  name: string;
  description: string;
  levelId: LevelId;
  color: string;
  isTrophy?: boolean;
}

export interface LevelProgress {
  levelId: LevelId;
  unlocked: boolean;
  completed: boolean;
  bestScore: number;
  bestAccuracy: number;
  stars: 0 | 1 | 2 | 3;
  attempts: number;
}

export interface ChallengeResult {
  levelId: LevelId;
  levelTitle: string;
  score: number;
  maxScore: number;
  accuracy: number;
  completedSteps: number;
  totalSteps: number;
  durationSec: number;
  stars: 0 | 1 | 2 | 3;
  passed: boolean;
  earnedBadge: BadgeDefinition | null;
  newlyEarned: boolean;
  feedbackSummary: string;
}

export interface PlayerProgressState {
  levels: Record<LevelId, LevelProgress>;
  earnedBadgeIds: string[];
  tutorialCompleted: boolean;
  selectedCharacterId: 'arjuna' | 'gatotkaca' | 'srikandi' | 'semar';
  totalScore: number;
}

