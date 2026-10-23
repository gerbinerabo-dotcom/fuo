import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { WORLDS } from '../data/curriculum';
import {
  Flame,
  Gem,
  Heart,
  Volume2,
  VolumeX,
  ShieldCheck,
  ChevronDown,
  Sparkles,
  Trophy
} from 'lucide-react';
import { sounds } from '../utils/audio';

interface HeaderProps {
  onOpenShop: () => void;
  onOpenLeagues: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenShop, onOpenLeagues }) => {
  const { state, toggleSound, setActiveWorld, refillHearts, toggleNoPressureMode } = useGame();
  const [showWorldDropdown, setShowWorldDropdown] = useState(false);
  const [showHeartModal, setShowHeartModal] = useState(false);

  const activeWorld = WORLDS.find((w) => w.id === state.activeWorldId) || WORLDS[0];

  return (
    <>
      <header className="sticky top-0 z-40 h-16 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b-2 border-slate-200 dark:border-slate-800 px-4 sm:px-8 flex items-center justify-between transition-colors">
        {/* Left: World Switcher */}
        <div className="relative">
          <button
            onClick={() => {
              sounds.playClick();
              setShowWorldDropdown(!showWorldDropdown);
            }}
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 font-black text-sm tracking-wide text-slate-800 dark:text-slate-100 transition-all border-2 border-transparent hover:border-slate-200 dark:hover:border-slate-700"
            aria-label="Выбрать раздел обучения"
          >
            <span
              className="w-8 h-8 rounded-xl flex items-center justify-center text-white shadow-sm font-bold text-sm"
              style={{ backgroundColor: activeWorld.themeColor }}
            >
              {activeWorld.id + 1}
            </span>
            <span className="hidden md:inline font-black text-base">{activeWorld.shortTitle}</span>
            <ChevronDown className="w-4 h-4 text-slate-400" />
          </button>

          {/* World Selection Dropdown */}
          {showWorldDropdown && (
            <div className="absolute top-12 left-0 w-72 bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border-2 border-slate-200 dark:border-slate-700 p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-3 py-2 text-xs font-black uppercase tracking-wider text-slate-400">
                Направления школы
              </div>
              <div className="space-y-1">
                {WORLDS.map((w) => {
                  const isCurrent = w.id === state.activeWorldId;
                  return (
                    <button
                      key={w.id}
                      onClick={() => {
                        sounds.playClick();
                        setActiveWorld(w.id);
                        setShowWorldDropdown(false);
                      }}
                      className={`w-full flex items-center gap-3 p-2.5 rounded-2xl text-left transition-all ${
                        isCurrent
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 font-black border-2 border-emerald-500/30'
                          : 'hover:bg-slate-100 dark:hover:bg-slate-700/50 text-slate-700 dark:text-slate-200 font-bold'
                      }`}
                    >
                      <span
                        className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-sm font-black flex-shrink-0"
                        style={{ backgroundColor: w.themeColor }}
                      >
                        {w.id + 1}
                      </span>
                      <div className="min-w-0">
                        <div className="text-sm font-black truncate">{w.title}</div>
                        <div className="text-xs text-slate-400 truncate">{w.shortTitle}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right: Stats Counter HUD (Streak, Gems, Hearts) */}
        <div className="flex items-center gap-1 sm:gap-4">
          {/* Streak Flame */}
          <div
            title={`Серия обучения: ${state.streak} дн.`}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-2xl hover:bg-orange-50 dark:hover:bg-orange-950/30 text-orange-500 font-black text-sm cursor-pointer transition-colors"
          >
            <Flame className="w-5 h-5 fill-orange-500 animate-pulse text-orange-600" />
            <span className="font-black text-base">{state.streak}</span>
          </div>

          {/* Gems Counter */}
          <button
            onClick={() => {
              sounds.playClick();
              onOpenShop();
            }}
            title="Кристаллы для покупок и заморозки"
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-2xl hover:bg-blue-50 dark:hover:bg-blue-950/30 text-blue-500 font-black text-sm transition-colors cursor-pointer"
          >
            <Gem className="w-5 h-5 fill-blue-500 text-blue-600" />
            <span className="font-black text-base">{state.gems}</span>
          </button>

          {/* Hearts Energy */}
          <button
            onClick={() => {
              sounds.playClick();
              setShowHeartModal(true);
            }}
            title={state.noPressureMode ? 'Режим «Без давления» (сердечки бесконечны)' : `Энергия: ${state.hearts} из ${state.maxHearts}`}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-2xl font-black text-sm transition-colors cursor-pointer ${
              state.noPressureMode
                ? 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400'
                : state.hearts <= 1
                ? 'bg-rose-100 dark:bg-rose-950/50 text-rose-600 animate-bounce'
                : 'hover:bg-rose-50 dark:hover:bg-rose-950/30 text-rose-500'
            }`}
          >
            {state.noPressureMode ? (
              <>
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <span className="text-xs font-black hidden sm:inline">∞ Чип</span>
              </>
            ) : (
              <>
                <Heart className="w-5 h-5 fill-rose-500 text-rose-600" />
                <span className="font-black text-base">{state.hearts}</span>
              </>
            )}
          </button>

          {/* League Button */}
          <button
            onClick={() => {
              sounds.playClick();
              onOpenLeagues();
            }}
            title="Лига лидеров"
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-2xl hover:bg-amber-50 dark:hover:bg-amber-950/30 text-amber-500 font-black text-sm transition-colors"
          >
            <Trophy className="w-5 h-5 fill-amber-400 text-amber-600" />
          </button>

          {/* Sound Toggle */}
          <button
            onClick={() => {
              toggleSound();
              sounds.playClick();
            }}
            className="p-2 rounded-2xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title={state.soundEnabled ? 'Выключить звук' : 'Включить звук'}
            aria-label="Переключить звук"
          >
            {state.soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Heart Refill & No-Pressure Modal */}
      {showHeartModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-sm w-full p-6 text-center shadow-2xl border-2 border-slate-200 dark:border-slate-800">
            <div className="w-16 h-16 bg-rose-100 dark:bg-rose-950/50 rounded-3xl flex items-center justify-center mx-auto mb-4 text-rose-500">
              <Heart className="w-9 h-9 fill-rose-500" />
            </div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">
              Твои сердечки
            </h3>
            <p className="text-sm font-bold text-slate-500 dark:text-slate-400 mb-6">
              Сердечки берегут от невнимательности при ответах. Ошибки отнимают 1 сердечко.
            </p>

            <div className="space-y-3">
              <button
                onClick={() => {
                  refillHearts();
                  sounds.playCorrect();
                  setShowHeartModal(false);
                }}
                className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 active:translate-y-1 text-white font-black text-sm rounded-2xl shadow-[0_4px_0_theme(colors.emerald.700)] active:shadow-none transition-all flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" /> Восстановить все 5 сердечек
              </button>

              <button
                onClick={() => {
                  toggleNoPressureMode();
                  sounds.playClick();
                  setShowHeartModal(false);
                }}
                className="w-full py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-black text-sm rounded-2xl transition-all"
              >
                {state.noPressureMode
                  ? 'Выключить режим «Без давления»'
                  : 'Включить режим «Без давления» (∞)'}
              </button>

              <button
                onClick={() => setShowHeartModal(false)}
                className="w-full py-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-extrabold text-xs transition-colors"
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

