import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { WORLDS } from '../../data/curriculum';
import { Lesson, Unit } from '../../types';
import { GuidebookModal } from './GuidebookModal';
import { LessonModal } from './LessonModal';
import { DuoMascot } from '../mascot/DuoMascot';
import { sounds } from '../../utils/audio';
import { fireChestGems } from '../../utils/confetti';
import {
  BookOpen,
  Check,
  Star,
  Lock,
  Gift,
  Zap,
  Sparkles,
  Trophy,
  Crown
} from 'lucide-react';

export const LearningPath: React.FC = () => {
  const { state, claimChest } = useGame();
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [guidebookUnit, setGuidebookUnit] = useState<Unit | null>(null);

  const activeWorld = WORLDS.find((w) => w.id === state.activeWorldId) || WORLDS[0];

  // Alternating offsets to create the winding snake path
  const getOffsetClass = (index: number) => {
    const cycle = index % 6;
    if (cycle === 0) return 'translate-x-0';
    if (cycle === 1) return '-translate-x-10 sm:-translate-x-14';
    if (cycle === 2) return '-translate-x-14 sm:-translate-x-20';
    if (cycle === 3) return '-translate-x-6 sm:-translate-x-8';
    if (cycle === 4) return 'translate-x-8 sm:translate-x-12';
    if (cycle === 5) return 'translate-x-14 sm:translate-x-20';
    return 'translate-x-0';
  };

  return (
    <div className="max-w-xl mx-auto px-4 pb-28 pt-4 select-none">
      {activeWorld.units.map((unit) => {
        return (
          <section key={unit.id} className="mb-14">
            {/* Unit Header Banner */}
            <div
              className={`rounded-3xl p-5 mb-8 bg-gradient-to-r ${unit.bannerBg} text-white shadow-xl relative overflow-hidden`}
            >
              <div className="flex items-center justify-between gap-4 relative z-10">
                <div>
                  <div className="text-xs font-black uppercase tracking-wider text-white/80">
                    Раздел {unit.unitNumber}
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black mt-0.5">{unit.title}</h2>
                  <p className="text-xs sm:text-sm font-bold text-white/90 mt-1 max-w-sm">
                    {unit.description}
                  </p>
                </div>

                <button
                  onClick={() => {
                    sounds.playClick();
                    setGuidebookUnit(unit);
                  }}
                  className="px-4 py-2.5 rounded-2xl bg-white/20 hover:bg-white/30 backdrop-blur-md text-white font-black text-xs uppercase tracking-wider flex items-center gap-2 border border-white/30 shadow-sm transition-all active:scale-95 cursor-pointer flex-shrink-0"
                >
                  <BookOpen className="w-4 h-4" />
                  <span className="hidden sm:inline">Справочник</span>
                </button>
              </div>
            </div>

            {/* Path Nodes Stream */}
            <div className="flex flex-col items-center gap-7 relative">
              {unit.lessons.map((lesson, idx) => {
                const isPassed = !!state.passedLessons[lesson.id];
                const prevPassed = idx === 0 || !!state.passedLessons[unit.lessons[idx - 1].id];
                const isLocked = !isPassed && !prevPassed;
                const isCurrent = !isPassed && prevPassed;
                const stars = state.lessonStars[lesson.id] || 0;
                const offset = getOffsetClass(idx);

                return (
                  <div key={lesson.id} className={`relative flex flex-col items-center ${offset} transition-transform`}>
                    {/* Mascot standing beside the active node */}
                    {isCurrent && (
                      <div className="absolute -left-24 sm:-left-28 -top-4 hidden sm:block animate-bounce">
                        <DuoMascot mood="cheering" size="sm" speechBubble="Твой ход!" />
                      </div>
                    )}

                    {/* Progress Circle Ring for Current Node */}
                    {isCurrent && (
                      <div className="absolute -inset-2 rounded-full border-4 border-dashed border-emerald-400 animate-spin-slow pointer-events-none" />
                    )}

                    {/* 3D Duolingo Tactile Circle Button */}
                    <button
                      disabled={isLocked}
                      onClick={() => {
                        sounds.playClick();
                        setSelectedLesson(lesson);
                      }}
                      className={`w-20 h-20 rounded-full flex flex-col items-center justify-center transition-all cursor-pointer relative ${
                        lesson.isBoss
                          ? isPassed
                            ? 'bg-amber-400 hover:bg-amber-500 shadow-[0_6px_0_theme(colors.amber.600)] active:shadow-none active:translate-y-1.5 border-4 border-amber-300'
                            : isCurrent
                            ? 'bg-rose-500 hover:bg-rose-600 shadow-[0_6px_0_theme(colors.rose.700)] active:shadow-none active:translate-y-1.5 border-4 border-rose-300 animate-pulse'
                            : 'bg-slate-200 dark:bg-slate-800 shadow-[0_6px_0_theme(colors.slate.400)] active:shadow-none opacity-60 cursor-not-allowed border-4 border-slate-300 dark:border-slate-700'
                          : isPassed
                          ? 'bg-emerald-500 hover:bg-emerald-600 shadow-[0_6px_0_theme(colors.emerald.700)] active:shadow-none active:translate-y-1.5 text-white'
                          : isCurrent
                          ? 'bg-emerald-500 hover:bg-emerald-600 shadow-[0_6px_0_theme(colors.emerald.700)] active:shadow-none active:translate-y-1.5 text-white ring-4 ring-emerald-300/60 dark:ring-emerald-700/60'
                          : 'bg-slate-200 dark:bg-slate-800 shadow-[0_6px_0_theme(colors.slate.400)] active:shadow-none text-slate-400 opacity-60 cursor-not-allowed'
                      }`}
                      aria-label={`${lesson.title} (${isPassed ? 'Пройдено' : isLocked ? 'Заблокировано' : 'Доступно'})`}
                    >
                      {isPassed ? (
                        <Check className="w-9 h-9 stroke-[3.5] text-white" />
                      ) : isLocked ? (
                        <Lock className="w-7 h-7 text-slate-400 dark:text-slate-600 stroke-[2.5]" />
                      ) : lesson.isBoss ? (
                        <Crown className="w-9 h-9 text-white stroke-[2.5]" />
                      ) : (
                        <Star className="w-8 h-8 fill-white text-white stroke-[2.5]" />
                      )}
                    </button>

                    {/* Lesson Title Caption */}
                    <div className="mt-2 text-center max-w-[130px]">
                      <div className="text-xs font-black text-slate-800 dark:text-slate-200 leading-tight">
                        {lesson.title}
                      </div>
                      {isPassed && stars > 0 && (
                        <div className="flex justify-center gap-0.5 mt-1 text-amber-400">
                          {Array.from({ length: 3 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3 h-3 ${i < stars ? 'fill-amber-400 text-amber-500' : 'text-slate-300 dark:text-slate-700'}`}
                            />
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Milestone Treasure Chest on every 2nd lesson */}
                    {idx === 1 && (
                      <div className="my-3 flex flex-col items-center">
                        <button
                          onClick={() => {
                            const chestId = `chest_${unit.id}_${idx}`;
                            if (!state.claimedChests[chestId]) {
                              sounds.playChest();
                              fireChestGems();
                              claimChest(chestId, 25);
                            }
                          }}
                          disabled={!isPassed}
                          className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${
                            state.claimedChests[`chest_${unit.id}_${idx}`]
                              ? 'bg-amber-100 dark:bg-amber-950/40 text-amber-500 opacity-60 cursor-default'
                              : isPassed
                              ? 'bg-amber-400 hover:bg-amber-500 active:translate-y-1 shadow-[0_4px_0_theme(colors.amber.600)] text-white cursor-pointer animate-bounce'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-400 opacity-40 cursor-not-allowed'
                          }`}
                          title="Сундук с кристаллами (+25 💎)"
                        >
                          <Gift className="w-7 h-7" />
                        </button>
                        <span className="text-[11px] font-black text-amber-600 mt-1">
                          {state.claimedChests[`chest_${unit.id}_${idx}`] ? 'Открыто' : '+25 💎'}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}

      {/* Guidebook Modal */}
      {guidebookUnit && (
        <GuidebookModal unit={guidebookUnit} onClose={() => setGuidebookUnit(null)} />
      )}

      {/* Lesson Runner Modal */}
      {selectedLesson && (
        <LessonModal lesson={selectedLesson} onClose={() => setSelectedLesson(null)} />
      )}
    </div>
  );
};

