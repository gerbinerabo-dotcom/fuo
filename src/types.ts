export type ExerciseType = 'multiple_choice' | 'match_pairs' | 'order_steps' | 'dilemma';

export interface BaseExercise {
  id: string;
  type: ExerciseType;
  prompt: string;
  theorySnippet?: string;
  exampleSnippet?: string;
  explanation: string;
}

export interface MultipleChoiceExercise extends BaseExercise {
  type: 'multiple_choice';
  options: { id: string; text: string; icon?: string }[];
  correctOptionId: string;
}

export interface MatchPairsExercise extends BaseExercise {
  type: 'match_pairs';
  pairs: { left: string; right: string; id: string }[];
}

export interface OrderStepsExercise extends BaseExercise {
  type: 'order_steps';
  items: { id: string; text: string; correctIndex: number }[];
}

export interface DilemmaExercise extends BaseExercise {
  type: 'dilemma';
  scenario: string;
  choiceA: { text: string; isOptimal: boolean; feedback: string };
  choiceB: { text: string; isOptimal: boolean; feedback: string };
}

export type Exercise = MultipleChoiceExercise | MatchPairsExercise | OrderStepsExercise | DilemmaExercise;

export interface Lesson {
  id: string;
  unitId: string;
  worldId: number;
  title: string;
  subtitle: string;
  icon: string;
  isBoss?: boolean;
  xpReward: number;
  gemsReward: number;
  skillPoints: {
    discipline?: number;
    independence?: number;
    planning?: number;
    organization?: number;
  };
  exercises: Exercise[];
}

export interface Unit {
  id: string;
  worldId: number;
  unitNumber: number;
  title: string;
  description: string;
  bannerColor: string;
  bannerBg: string;
  guidebook: {
    overview: string;
    keyTakeaways: string[];
    goldenRule: string;
    cheatSheet: { term: string; definition: string }[];
  };
  lessons: Lesson[];
}

export interface World {
  id: number;
  title: string;
  shortTitle: string;
  description: string;
  icon: string;
  themeColor: string;
  skillFocus: 'planning' | 'discipline' | 'organization' | 'independence';
  units: Unit[];
}

export type LeagueTier = 'bronze' | 'silver' | 'gold' | 'sapphire' | 'ruby' | 'emerald' | 'diamond';

export interface LeaderboardUser {
  id: string;
  name: string;
  avatar: string;
  xp: number;
  isCurrentUser?: boolean;
  streak: number;
  badge?: string;
}

export interface DailyQuest {
  id: string;
  title: string;
  description: string;
  icon: string;
  current: number;
  target: number;
  xpReward: number;
  gemReward: number;
  claimed: boolean;
}

export interface ShopItem {
  id: string;
  name: string;
  category: 'powerup' | 'outfit' | 'companion' | 'flair';
  icon: string;
  cost: number;
  description: string;
  effect?: string;
  equipped?: boolean;
  owned?: boolean;
}

export interface UserStats {
  discipline: number;
  independence: number;
  planning: number;
  organization: number;
}

export interface UserProfile {
  name: string;
  title: string;
  bio: string;
  mascot: string; // 'owl' | 'cat' | 'fox' | 'robot'
  avatarColor: string;
  equippedOutfit?: string;
  equippedAccessory?: string;
}

export interface UserState {
  version: number;
  profile: UserProfile;
  xp: number;
  gems: number;
  hearts: number;
  maxHearts: number;
  noPressureMode: boolean;
  streak: number;
  lastActiveDate: string;
  streakFreezes: number;
  doubleXpUntil: number | null; // timestamp
  activeWorldId: number;
  passedLessons: Record<string, boolean>;
  lessonStars: Record<string, number>; // 1 to 3
  claimedChests: Record<string, boolean>;
  claimedMilestones: Record<string, boolean>;
  stats: UserStats;
  ownedItemIds: string[];
  equippedItems: {
    outfit: string;
    accessory: string;
    companion: string;
  };
  weeklyXP: number;
  league: LeagueTier;
  soundEnabled: boolean;
  theme: 'fresh-mint' | 'ocean-blue' | 'midnight' | 'sunset' | 'lavender';
  dailyQuests: DailyQuest[];
  lastQuestsDate: string;
}

