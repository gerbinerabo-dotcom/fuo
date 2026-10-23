import React from 'react';
import { useGame } from '../../context/GameContext';
import { Target, Award, Gem, Zap, CheckCircle2, Gift } from 'lucide-react';
import { sounds } from '../../utils/audio';
import { fireChestGems } from '../../utils/confetti';

export const QuestsView: React.FC = () => {
  const { state, claimQuest } = useGame();

  const completedQuestsCount = state.dailyQuests.filter((q) => q.claimed).length;

  return (
    <div className="max-w-xl mx-auto px-4 py-6 pb-28 select-none space-y-6">
      {/* Monthly Challenge Banner */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-700 rounded-3xl p-6 text-white shadow-xl flex items-center justify-between gap-4">
        <div>
          <div className="text-xs font-black uppercase tracking-wider text-purple-200">
            Месячный марафон
          </div>
          <h2 className="text-xl sm:text-2xl font-black mt-0.5">Осознанный взрослый</h2>
          <p className="text-xs sm:text-sm font-bold text-purple-100 mt-1">
            Выполняй ежедневные квесты, чтобы забрать эксклюзивную медаль месяца!
          </p>
          <div className="mt-3 flex items-center gap-2">
            <div className="h-2.5 w-36 bg-black/30 rounded-full overflow-hidden p-0.5">
              <div
                className="h-full bg-amber-400 rounded-full transition-all"
                style={{ width: `${Math.min(100, (completedQuestsCount / 3) * 100)}%` }}
              />
            </div>
            <span className="text-xs font-black">{completedQuestsCount} / 30</span>
          </div>
        </div>

        <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center flex-shrink-0 border-2 border-white/30 shadow-md">
          <Award className="w-10 h-10 text-amber-300" />
        </div>
      </div>

      {/* Daily Quests Header */}
      <div>
        <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
          <Target className="w-5 h-5 text-emerald-500" /> Ежедневные квесты
        </h2>
        <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-0.5">
          Обновляются каждые 24 часа. Забирай кристаллы и опыт!
        </p>
      </div>

      {/* Quests List */}
      <div className="space-y-3">
        {state.dailyQuests.map((quest) => {
          const isDone = quest.current >= quest.target;
          const percent = Math.min(100, Math.round((quest.current / quest.target) * 100));

          return (
            <div
              key={quest.id}
              className={`p-4 rounded-3xl border-2 transition-all ${
                quest.claimed
                  ? 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 opacity-60'
                  : isDone
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 shadow-md'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm'
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="font-black text-sm text-slate-900 dark:text-white truncate">
                    {quest.title}
                  </div>
                  <div className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                    {quest.description}
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-2.5 flex items-center gap-2">
                    <div className="flex-1 h-2.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden p-0.5">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <span className="text-[11px] font-black text-slate-400">
                      {quest.current}/{quest.target}
                    </span>
                  </div>
                </div>

                {/* Reward / Claim Action */}
                <div className="flex-shrink-0">
                  {quest.claimed ? (
                    <div className="flex items-center gap-1 text-emerald-600 font-black text-xs">
                      <CheckCircle2 className="w-5 h-5" /> Забрано
                    </div>
                  ) : isDone ? (
                    <button
                      onClick={() => {
                        sounds.playChest();
                        fireChestGems();
                        claimQuest(quest.id);
                      }}
                      className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 active:translate-y-1 text-white font-black text-xs rounded-xl shadow-[0_3px_0_theme(colors.emerald.700)] active:shadow-none transition-all flex items-center gap-1.5 cursor-pointer animate-bounce"
                    >
                      <Gift className="w-4 h-4" /> Забрать
                    </button>
                  ) : (
                    <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-700/60 px-3 py-1.5 rounded-xl text-xs font-black text-slate-600 dark:text-slate-300">
                      <span className="flex items-center gap-0.5 text-amber-500">
                        <Zap className="w-3.5 h-3.5 fill-amber-500" /> +{quest.xpReward}
                      </span>
                      <span className="flex items-center gap-0.5 text-blue-500">
                        <Gem className="w-3.5 h-3.5 fill-blue-500" /> +{quest.gemReward}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

