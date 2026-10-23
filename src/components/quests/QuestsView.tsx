import React from 'react';
import { useGame } from '../../context/GameContext';
import { BookOpen, Calculator, Check, CheckCircle2, Gift, Gem, Target, Zap } from 'lucide-react';
import { sounds } from '../../utils/audio';
import { fireChestGems } from '../../utils/confetti';

const questIcons = {
  Target,
  Calculator,
  Zap
} as const;

export const QuestsView: React.FC = () => {
  const { state, claimQuest } = useGame();
  const quests = state.dailyQuests;
  const claimedCount = quests.filter((quest) => quest.claimed).length;
  const readyCount = quests.filter((quest) => !quest.claimed && quest.current >= quest.target).length;
  const progress = quests.length ? Math.round((claimedCount / quests.length) * 100) : 0;

  return (
    <div className="max-w-3xl mx-auto px-4 py-7 sm:py-10 pb-28 space-y-6 sm:space-y-8">
      <header className="space-y-1">
        <div className="text-xs font-black uppercase tracking-[0.18em] text-emerald-600 dark:text-emerald-400">
          {"\u041f\u043b\u0430\u043d \u043d\u0430 \u0441\u0435\u0433\u043e\u0434\u043d\u044f"}
        </div>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
          {"\u041a\u0432\u0435\u0441\u0442\u044b"}
        </h1>
        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
          {"\u041d\u0435\u0431\u043e\u043b\u044c\u0448\u0438\u0435 \u0448\u0430\u0433\u0438 \u0434\u043b\u044f \u0431\u043e\u043b\u044c\u0448\u043e\u0433\u043e \u043f\u0440\u043e\u0433\u0440\u0435\u0441\u0441\u0430."}
        </p>
      </header>

      <section className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 sm:p-7 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-300 flex items-center justify-center">
              <BookOpen className="w-7 h-7" />
            </div>
            <div>
              <div className="text-sm font-bold text-slate-500 dark:text-slate-400">
                {"\u0417\u0430\u0434\u0430\u043d\u0438\u044f \u0432\u044b\u043f\u043e\u043b\u043d\u0435\u043d\u044b"}
              </div>
              <div className="text-2xl font-black text-slate-900 dark:text-white">
                {claimedCount} <span className="text-slate-400">/ {quests.length}</span>
              </div>
            </div>
          </div>
          <div className="sm:w-56">
            <div className="flex items-center justify-between text-xs font-black mb-2">
              <span className="text-slate-500 dark:text-slate-400">{"\u041f\u0440\u043e\u0433\u0440\u0435\u0441\u0441 \u0434\u043d\u044f"}</span>
              <span className="text-emerald-600 dark:text-emerald-400">{progress}%</span>
            </div>
            <div className="h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden" role="progressbar" aria-valuenow={claimedCount} aria-valuemin={0} aria-valuemax={quests.length}>
              <div className="h-full rounded-full bg-emerald-500 transition-all duration-500" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-6 pt-5 border-t border-slate-100 dark:border-slate-800">
          <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/70 px-4 py-3">
            <div className="text-xl font-black text-slate-900 dark:text-white">{readyCount}</div>
            <div className="text-xs font-bold text-slate-500 dark:text-slate-400">{"\u041c\u043e\u0436\u043d\u043e \u0437\u0430\u0431\u0440\u0430\u0442\u044c"}</div>
          </div>
          <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/70 px-4 py-3">
            <div className="flex items-center gap-1.5 text-xl font-black text-slate-900 dark:text-white">
              <Gem className="w-5 h-5 text-sky-500" /> {quests.reduce((sum, quest) => sum + (quest.claimed ? 0 : quest.gemReward), 0)}
            </div>
            <div className="text-xs font-bold text-slate-500 dark:text-slate-400">{"\u041a\u0440\u0438\u0441\u0442\u0430\u043b\u043b\u043e\u0432 \u0432 \u043d\u0430\u0433\u0440\u0430\u0434\u0430\u0445"}</div>
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-black text-slate-900 dark:text-white">{"\u0421\u043f\u0438\u0441\u043e\u043a \u043a\u0432\u0435\u0441\u0442\u043e\u0432"}</h2>
          {readyCount > 0 && (
            <span className="px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-black">
              {readyCount} {"\u0433\u043e\u0442\u043e\u0432\u043e"}
            </span>
          )}
        </div>

        {quests.map((quest, index) => {
          const isDone = quest.current >= quest.target;
          const percent = quest.target > 0 ? Math.min(100, Math.round((quest.current / quest.target) * 100)) : 0;
          const Icon = questIcons[quest.icon as keyof typeof questIcons] || Target;

          return (
            <article
              key={quest.id}
              className={`rounded-3xl border bg-white dark:bg-slate-900 p-4 sm:p-5 transition-colors ${
                quest.claimed
                  ? 'border-slate-200 dark:border-slate-800'
                  : isDone
                  ? 'border-emerald-300 dark:border-emerald-700 shadow-sm'
                  : 'border-slate-200 dark:border-slate-700'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 shrink-0 rounded-2xl flex items-center justify-center ${isDone || quest.claimed ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-300' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'}`}>
                  {quest.claimed ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="font-black text-sm sm:text-base text-slate-900 dark:text-white">{quest.title}</div>
                  <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">{quest.description}</p>
                  <div className="mt-4 flex items-center gap-3">
                    <div className="flex-1 h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden" role="progressbar" aria-valuenow={Math.min(quest.current, quest.target)} aria-valuemin={0} aria-valuemax={quest.target}>
                      <div className="h-full rounded-full bg-emerald-500 transition-all duration-500" style={{ width: `${percent}%` }} />
                    </div>
                    <span className="text-xs font-black tabular-nums text-slate-400">{Math.min(quest.current, quest.target)}/{quest.target}</span>
                  </div>
                </div>

                <div className="shrink-0 flex flex-col items-end gap-2">
                  {quest.claimed ? (
                    <span className="inline-flex items-center gap-1 text-xs font-black text-emerald-600 dark:text-emerald-400"><CheckCircle2 className="w-4 h-4" /> {"\u0413\u043e\u0442\u043e\u0432\u043e"}</span>
                  ) : isDone ? (
                    <button
                      onClick={() => {
                        sounds.playChest();
                        fireChestGems();
                        claimQuest(quest.id);
                      }}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 px-3.5 py-2 text-xs font-black text-white shadow-sm transition-colors"
                    >
                      <Gift className="w-4 h-4" /> {"\u0417\u0430\u0431\u0440\u0430\u0442\u044c"}
                    </button>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-black text-amber-600 dark:text-amber-400">
                      <Zap className="w-3.5 h-3.5 fill-current" /> +{quest.xpReward} XP
                    </span>
                  )}
                  {!quest.claimed && <span className="inline-flex items-center gap-1 text-xs font-bold text-sky-600 dark:text-sky-400"><Gem className="w-3.5 h-3.5 fill-current" /> +{quest.gemReward}</span>}
                  {quest.claimed && <span className="text-[11px] font-bold text-slate-400">{"\u041d\u0430\u0433\u0440\u0430\u0434\u0430 \u043f\u043e\u043b\u0443\u0447\u0435\u043d\u0430"}</span>}
                </div>
              </div>
            </article>
          );
        })}
      </section>
    </div>
  );
};

