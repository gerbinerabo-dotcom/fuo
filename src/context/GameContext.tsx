import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserState, Lesson } from '../types';
import { INITIAL_DAILY_QUESTS } from '../data/curriculum';
import { sounds } from '../utils/audio';
import { calculateDailyStreak } from '../utils/gameRules';

const STORAGE_KEY = 'lifeskill_duo_v4';

const DEFAULT_STATE: UserState = {
  version: 4,
  profile: {
    name: 'Исследователь',
    title: 'Птенец взрослой жизни',
    bio: 'Учусь управлять бюджетом, временем и бытом без стресса.',
    mascot: 'owl', // 'owl' | 'cat' | 'fox' | 'robot'
    avatarColor: '#10B981',
    equippedOutfit: 'casual',
    equippedAccessory: 'none'
  },
  xp: 45,
  gems: 60,
  hearts: 5,
  maxHearts: 5,
  noPressureMode: false,
  streak: 3,
  lastActiveDate: new Date().toISOString().split('T')[0],
  streakFreezes: 1,
  doubleXpUntil: null,
  activeWorldId: 0,
  passedLessons: {},
  lessonStars: {},
  claimedChests: {},
  claimedMilestones: {},
  stats: {
    discipline: 8,
    independence: 8,
    planning: 10,
    organization: 6
  },
  ownedItemIds: ['freeze'],
  equippedItems: {
    outfit: 'casual',
    accessory: 'none',
    companion: 'none'
  },
  weeklyXP: 145,
  league: 'silver',
  soundEnabled: true,
  theme: 'fresh-mint',
  dailyQuests: INITIAL_DAILY_QUESTS,
  lastQuestsDate: new Date().toISOString().split('T')[0]
};

interface GameContextType {
  state: UserState;
  completeLesson: (lesson: Lesson, stars: number) => void;
  loseHeart: () => boolean; // returns true if hearts left, false if 0
  refillHearts: () => void;
  claimChest: (chestId: string, gems: number) => void;
  claimQuest: (questId: string) => void;
  buyShopItem: (itemId: string, cost: number) => { success: boolean; message: string };
  toggleNoPressureMode: () => void;
  toggleSound: () => void;
  setTheme: (theme: UserState['theme']) => void;
  setActiveWorld: (worldId: number) => void;
  updateProfile: (profile: Partial<UserState['profile']>) => void;
  resetProgress: () => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<UserState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.version === 4) {
          return parsed;
        }
      }
    } catch {
      // fallback to default
    }
    return DEFAULT_STATE;
  });

  // Sync audio enabled state
  useEffect(() => {
    sounds.enabled = state.soundEnabled;
  }, [state.soundEnabled]);

  // Sync theme attribute to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', state.theme);
    document.documentElement.classList.toggle('dark', state.theme === 'midnight');
  }, [state.theme]);

  // Save to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // ignore storage quota error
    }
  }, [state]);

  const updateStreakOnActivity = (prev: UserState): { streak: number; lastActiveDate: string; freezes: number } => {
    const today = new Date().toISOString().split('T')[0];
    const streakResult = calculateDailyStreak(prev.streak, prev.lastActiveDate, today, prev.streakFreezes > 0);
    return {
      streak: streakResult.newStreak,
      lastActiveDate: today,
      freezes: streakResult.freezeUsed ? Math.max(0, prev.streakFreezes - 1) : prev.streakFreezes
    };
  };

  const completeLesson = (lesson: Lesson, stars: number) => {
    setState((prev) => {
      const isDouble = prev.doubleXpUntil && prev.doubleXpUntil > Date.now();
      const earnedXp = isDouble ? lesson.xpReward * 2 : lesson.xpReward;
      const earnedGems = lesson.gemsReward;

      const streakData = updateStreakOnActivity(prev);

      // Update skill points
      const nextStats = { ...prev.stats };
      if (lesson.skillPoints) {
        if (lesson.skillPoints.discipline) nextStats.discipline += lesson.skillPoints.discipline;
        if (lesson.skillPoints.independence) nextStats.independence += lesson.skillPoints.independence;
        if (lesson.skillPoints.planning) nextStats.planning += lesson.skillPoints.planning;
        if (lesson.skillPoints.organization) nextStats.organization += lesson.skillPoints.organization;
      }

      // Update daily quests
      const nextQuests = prev.dailyQuests.map((q) => {
        if (q.id === 'q1' && stars >= 3) {
          return { ...q, current: Math.min(q.target, q.current + 1) };
        }
        if (q.id === 'q3') {
          return { ...q, current: Math.min(q.target, q.current + earnedXp) };
        }
        return q;
      });

      return {
        ...prev,
        xp: prev.xp + earnedXp,
        weeklyXP: prev.weeklyXP + earnedXp,
        gems: prev.gems + earnedGems,
        streak: streakData.streak,
        lastActiveDate: streakData.lastActiveDate,
        streakFreezes: streakData.freezes,
        passedLessons: {
          ...prev.passedLessons,
          [lesson.id]: true
        },
        lessonStars: {
          ...prev.lessonStars,
          [lesson.id]: Math.max(prev.lessonStars[lesson.id] || 0, stars)
        },
        stats: nextStats,
        dailyQuests: nextQuests
      };
    });
  };

  const loseHeart = (): boolean => {
    if (state.noPressureMode) return true;
    let hasHeartsRemaining = true;
    setState((prev) => {
      if (prev.noPressureMode) return prev;
      const nextHearts = Math.max(0, prev.hearts - 1);
      hasHeartsRemaining = nextHearts > 0;
      return {
        ...prev,
        hearts: nextHearts
      };
    });
    return hasHeartsRemaining;
  };

  const refillHearts = () => {
    setState((prev) => ({
      ...prev,
      hearts: prev.maxHearts
    }));
  };

  const claimChest = (chestId: string, gemsReward: number) => {
    setState((prev) => ({
      ...prev,
      gems: prev.gems + gemsReward,
      claimedChests: {
        ...prev.claimedChests,
        [chestId]: true
      }
    }));
  };

  const claimQuest = (questId: string) => {
    setState((prev) => {
      const quest = prev.dailyQuests.find((q) => q.id === questId);
      if (!quest || quest.claimed || quest.current < quest.target) return prev;
      return {
        ...prev,
        xp: prev.xp + quest.xpReward,
        gems: prev.gems + quest.gemReward,
        dailyQuests: prev.dailyQuests.map((q) => (q.id === questId ? { ...q, claimed: true } : q))
      };
    });
  };

  const buyShopItem = (itemId: string, cost: number): { success: boolean; message: string } => {
    if (state.gems < cost) {
      return { success: false, message: 'Недостаточно кристаллов 💎!' };
    }

    setState((prev) => {
      const nextGems = prev.gems - cost;
      let nextFreezes = prev.streakFreezes;
      let nextHearts = prev.hearts;
      let nextDoubleXp = prev.doubleXpUntil;
      const nextOwned = prev.ownedItemIds.includes(itemId) ? prev.ownedItemIds : [...prev.ownedItemIds, itemId];

      if (itemId === 'freeze') {
        nextFreezes += 1;
      } else if (itemId === 'refill_hearts') {
        nextHearts = prev.maxHearts;
      } else if (itemId === 'double_xp') {
        nextDoubleXp = Date.now() + 15 * 60 * 1000; // 15 minutes
      }

      return {
        ...prev,
        gems: nextGems,
        streakFreezes: nextFreezes,
        hearts: nextHearts,
        doubleXpUntil: nextDoubleXp,
        ownedItemIds: nextOwned
      };
    });

    return { success: true, message: 'Успешно приобретено!' };
  };

  const toggleNoPressureMode = () => {
    setState((prev) => ({
      ...prev,
      noPressureMode: !prev.noPressureMode
    }));
  };

  const toggleSound = () => {
    setState((prev) => ({
      ...prev,
      soundEnabled: !prev.soundEnabled
    }));
  };

  const setTheme = (theme: UserState['theme']) => {
    setState((prev) => ({
      ...prev,
      theme
    }));
  };

  const setActiveWorld = (worldId: number) => {
    setState((prev) => ({
      ...prev,
      activeWorldId: worldId
    }));
  };

  const updateProfile = (profileUpdate: Partial<UserState['profile']>) => {
    setState((prev) => ({
      ...prev,
      profile: {
        ...prev.profile,
        ...profileUpdate
      }
    }));
  };

  const resetProgress = () => {
    localStorage.removeItem(STORAGE_KEY);
    setState(DEFAULT_STATE);
  };

  return (
    <GameContext.Provider
      value={{
        state,
        completeLesson,
        loseHeart,
        refillHearts,
        claimChest,
        claimQuest,
        buyShopItem,
        toggleNoPressureMode,
        toggleSound,
        setTheme,
        setActiveWorld,
        updateProfile,
        resetProgress
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};

