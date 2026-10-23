import React from 'react';
import { useGame } from '../../context/GameContext';
import { LEAGUE_USERS_SEED } from '../../data/curriculum';
import { Trophy, Flame, ArrowUp, ArrowDown, Clock, ShieldAlert } from 'lucide-react';

export const LeaguesView: React.FC = () => {
  const { state } = useGame();

  // Combine user into leaderboard and sort
  const allUsers = [
    ...LEAGUE_USERS_SEED,
    {
      id: 'current_user',
      name: `${state.profile.name} (Ты)`,
      avatar: state.profile.mascot === 'cat' ? '🐱' : state.profile.mascot === 'fox' ? '🦊' : '🦉',
      xp: state.weeklyXP,
      streak: state.streak,
      isCurrentUser: true
    }
  ].sort((a, b) => b.xp - a.xp);

  const leagueNames = {
    bronze: 'Бронзовая лига',
    silver: 'Серебряная лига',
    gold: 'Золотая лига',
    sapphire: 'Сапфировая лига',
    ruby: 'Рубиновая лига',
    emerald: 'Изумрудная лига',
    diamond: 'Бриллиантовая лига'
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-6 pb-28 select-none">
      {/* League Header */}
      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-gradient-to-tr from-slate-300 via-slate-100 to-slate-400 dark:from-slate-700 dark:to-slate-600 rounded-3xl mx-auto mb-3 flex items-center justify-center shadow-lg border-4 border-white dark:border-slate-800">
          <Trophy className="w-10 h-10 text-amber-500 fill-amber-400" />
        </div>
        <div className="text-xs font-black uppercase tracking-wider text-slate-400">Еженедельный турнир</div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
          {leagueNames[state.league] || 'Серебряная лига'}
        </h1>
        <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400 mt-1">
          <Clock className="w-3.5 h-3.5" /> До завершения недели: 2 дня 14 часов
        </div>
      </div>

      {/* Promotion rules alert */}
      <div className="mb-4 p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-800 flex items-center gap-2 text-xs font-black text-emerald-700 dark:text-emerald-300">
        <ArrowUp className="w-4 h-4 text-emerald-500" /> Топ-3 переходят в Золотую лигу!
      </div>

      {/* Leaderboard Table */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl border-2 border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden divide-y divide-slate-100 dark:divide-slate-700/60">
        {allUsers.map((user, idx) => {
          const rank = idx + 1;
          const isPromotionZone = rank <= 3;
          const isDemotionZone = rank >= allUsers.length - 1;

          return (
            <div
              key={user.id}
              className={`p-3.5 sm:p-4 flex items-center gap-3 sm:gap-4 transition-colors ${
                user.isCurrentUser
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 font-black'
                  : 'hover:bg-slate-50 dark:hover:bg-slate-700/30'
              }`}
            >
              {/* Rank Position Number */}
              <div
                className={`w-7 text-center font-black text-sm sm:text-base ${
                  rank === 1
                    ? 'text-amber-500'
                    : rank === 2
                    ? 'text-slate-400'
                    : rank === 3
                    ? 'text-amber-700'
                    : isDemotionZone
                    ? 'text-rose-500'
                    : 'text-slate-400'
                }`}
              >
                {rank}
              </div>

              {/* Avatar */}
              <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-xl shadow-sm flex-shrink-0">
                {user.avatar}
              </div>

              {/* User Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`text-sm truncate ${user.isCurrentUser ? 'text-emerald-700 dark:text-emerald-300 font-black' : 'text-slate-800 dark:text-slate-200 font-bold'}`}>
                    {user.name}
                  </span>
                  {user.badge && (
                    <span className="text-[10px] font-black px-1.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-600 hidden sm:inline">
                      {user.badge}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1 text-[11px] font-bold text-slate-400">
                  <Flame className="w-3 h-3 text-orange-500 fill-orange-500" /> {user.streak} дн.
                </div>
              </div>

              {/* Weekly XP */}
              <div className="text-right flex-shrink-0">
                <span className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                  {user.xp}
                </span>
                <span className="text-[10px] font-bold text-slate-400 ml-1">XP</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

