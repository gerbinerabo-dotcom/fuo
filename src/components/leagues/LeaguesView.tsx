import React from 'react';
import { useGame } from '../../context/GameContext';
import { LEAGUE_USERS_SEED } from '../../data/curriculum';
import { LeaderboardUser } from '../../types';
import { Crown, Flame, Medal, Trophy } from 'lucide-react';

const leagueNames: Record<string, string> = {
  bronze: '\u0411\u0440\u043e\u043d\u0437\u043e\u0432\u0430\u044f',
  silver: '\u0421\u0435\u0440\u0435\u0431\u0440\u044f\u043d\u0430\u044f',
  gold: '\u0417\u043e\u043b\u043e\u0442\u0430\u044f',
  sapphire: '\u0421\u0430\u043f\u0444\u0438\u0440\u043e\u0432\u0430\u044f',
  ruby: '\u0420\u0443\u0431\u0438\u043d\u043e\u0432\u0430\u044f',
  emerald: '\u0418\u0437\u0443\u043c\u0440\u0443\u0434\u043d\u0430\u044f',
  diamond: '\u0411\u0440\u0438\u043b\u043b\u0438\u0430\u043d\u0442\u043e\u0432\u0430\u044f'
};

const seedNames: Record<string, string> = {
  u1: '\u0410\u043b\u0438\u043d\u0430 \u0421\u0430\u043f\u0430\u0440\u043e\u0432\u0430',
  u2: '\u0414\u0430\u043d\u0438\u044f\u0440 \u0410\u0445\u043c\u0435\u0442\u043e\u0432',
  u3: '\u041a\u0430\u043c\u0438\u043b\u0430 \u041e\u043c\u0430\u0440\u043e\u0432\u0430',
  u4: '\u0415\u0440\u043d\u0430\u0440 \u0411\u0435\u043a',
  u5: '\u0410\u0439\u0437\u0435\u0440\u0435 \u041a.',
  u6: '\u041d\u0443\u0440\u0441\u0443\u043b\u0442\u0430\u043d \u041c.',
  u7: '\u0414\u0438\u0430\u043d\u0430 \u0412.',
  u8: '\u0422\u0438\u043c\u0443\u0440 \u0416.'
};

export const LeaguesView: React.FC = () => {
  const { state } = useGame();
  const allUsers: LeaderboardUser[] = [
    ...LEAGUE_USERS_SEED.map((user) => ({ ...user, name: seedNames[user.id] || user.name })),
    {
      id: 'current_user',
      name: state.profile.name,
      avatar: '\u{1F431}',
      xp: state.weeklyXP,
      streak: state.streak,
      isCurrentUser: true
    }
  ].sort((a, b) => b.xp - a.xp);

  const currentRank = allUsers.findIndex((user) => user.isCurrentUser) + 1;
  const leagueName = leagueNames[state.league] || leagueNames.silver;

  return (
    <div className="max-w-3xl mx-auto px-4 py-7 sm:py-10 pb-28 space-y-6 sm:space-y-8">
      <header className="space-y-1">
        <div className="text-xs font-black uppercase tracking-[0.18em] text-emerald-600 dark:text-emerald-400">
          {"\u0422\u0432\u043e\u044f \u043b\u0438\u0433\u0430"}
        </div>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white">{leagueName} {"\u043b\u0438\u0433\u0430"}</h1>
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mt-1">{"\u0415\u0436\u0435\u043d\u0435\u0434\u0435\u043b\u044c\u043d\u044b\u0439 \u0440\u0435\u0439\u0442\u0438\u043d\u0433 \u043f\u043e \u043e\u043f\u044b\u0442\u0443"}</p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 px-4 py-2 text-emerald-700 dark:text-emerald-300">
            <Trophy className="w-5 h-5" />
            <span className="text-sm font-black">{currentRank} <span className="font-bold text-emerald-700/70 dark:text-emerald-300/70">/ {allUsers.length}</span></span>
          </div>
        </div>
      </header>

      <section className="overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm">
        <div className="flex items-center justify-between gap-4 px-5 sm:px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="font-black text-slate-900 dark:text-white">{"\u0422\u0430\u0431\u043b\u0438\u0446\u0430 \u043b\u0438\u0434\u0435\u0440\u043e\u0432"}</div>
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">{"\u041e\u0447\u043a\u0438 \u0437\u0430 \u0442\u0435\u043a\u0443\u0449\u0443\u044e \u043d\u0435\u0434\u0435\u043b\u044e"}</div>
          </div>
          <div className="text-[11px] font-black uppercase tracking-wider text-slate-400">XP</div>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {allUsers.map((user, index) => {
            const rank = index + 1;
            const isCurrentUser = Boolean(user.isCurrentUser);

            return (
              <div
                key={user.id}
                className={`flex items-center gap-3 sm:gap-4 px-4 sm:px-6 py-3.5 transition-colors ${
                  isCurrentUser ? 'bg-emerald-50/80 dark:bg-emerald-950/40' : 'hover:bg-slate-50 dark:hover:bg-slate-800/60'
                }`}
              >
                <div className="w-8 shrink-0 text-center">
                  {rank <= 3 ? (
                    <Medal className={`w-5 h-5 mx-auto ${rank === 1 ? 'text-amber-500' : rank === 2 ? 'text-slate-400' : 'text-orange-700'}`} />
                  ) : (
                    <span className="text-sm font-black text-slate-400">{rank}</span>
                  )}
                </div>

                <div className={`w-11 h-11 shrink-0 rounded-2xl flex items-center justify-center text-2xl ${isCurrentUser ? 'bg-white dark:bg-slate-800' : 'bg-slate-100 dark:bg-slate-800'}`}>
                  {isCurrentUser ? <span aria-label="\u041a\u043e\u0442" role="img">{user.avatar}</span> : <span aria-hidden="true">{rank <= 3 ? '\u{1F464}' : '\u{1F9D1}'}</span>}
                </div>

                <div className="flex-1 min-w-0">
                  <div className={`truncate text-sm font-black ${isCurrentUser ? 'text-emerald-700 dark:text-emerald-300' : 'text-slate-800 dark:text-slate-100'}`}>
                    {user.name}{isCurrentUser && <span className="ml-2 text-[10px] uppercase tracking-wide text-emerald-600 dark:text-emerald-400">{"\u0422\u044b"}</span>}
                  </div>
                  <div className="mt-0.5 flex items-center gap-1 text-[11px] font-bold text-slate-400">
                    <Flame className="w-3 h-3 text-orange-500 fill-orange-500" /> {user.streak} {"\u0434\u043d. \u0441\u0435\u0440\u0438\u0438"}
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-sm sm:text-base font-black tabular-nums text-slate-900 dark:text-white">{user.xp}</div>
                  <div className="text-[10px] font-bold text-slate-400">XP</div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <div className="flex items-start gap-3 rounded-2xl bg-slate-100 dark:bg-slate-800/70 px-4 py-3 text-xs font-semibold leading-relaxed text-slate-500 dark:text-slate-400">
        <Crown className="w-4 h-4 shrink-0 text-amber-500 mt-0.5" />
        <span>{"\u0417\u0430\u0432\u0435\u0440\u0448\u0430\u0439 \u0443\u0440\u043e\u043a\u0438, \u0447\u0442\u043e\u0431\u044b \u0437\u0430\u0440\u0430\u0431\u0430\u0442\u044b\u0432\u0430\u0442\u044c XP \u0438 \u043f\u043e\u0434\u043d\u0438\u043c\u0430\u0442\u044c\u0441\u044f \u0432 \u0440\u0435\u0439\u0442\u0438\u043d\u0433\u0435."}</span>
      </div>
    </div>
  );
};

