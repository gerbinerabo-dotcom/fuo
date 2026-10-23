import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { getRankByScore, calculateTotalSkillScore, getLevelByXP, getXPProgressInLevel } from '../../utils/gameRules';
import { DuoMascot } from '../mascot/DuoMascot';
import {
  Trophy,
  Flame,
  Star,
  Shield,
  Palette,
  Volume2,
  VolumeX,
  ShieldCheck,
  Download,
  Upload,
  RotateCcw,
  User,
  Heart
} from 'lucide-react';
import { sounds } from '../../utils/audio';

export const ProfileView: React.FC = () => {
  const {
    state,
    updateProfile,
    setTheme,
    toggleSound,
    toggleNoPressureMode,
    resetProgress
  } = useGame();

  const [isEditing, setIsEditing] = useState(false);
  const [draftName, setDraftName] = useState(state.profile.name);
  const [draftBio, setDraftBio] = useState(state.profile.bio);
  const [draftMascot, setDraftMascot] = useState(state.profile.mascot);

  const totalScore = calculateTotalSkillScore(state.stats);
  const currentRank = getRankByScore(totalScore);
  const level = getLevelByXP(state.xp);
  const levelProgress = getXPProgressInLevel(state.xp);

  const themes = [
    { id: 'fresh-mint' as const, name: 'Свежая мята', color: '#10B981' },
    { id: 'ocean-blue' as const, name: 'Морская глубина', color: '#0284C7' },
    { id: 'midnight' as const, name: 'Полуночная темная', color: '#111827' },
    { id: 'sunset' as const, name: 'Теплый закат', color: '#EA580C' },
    { id: 'lavender' as const, name: 'Лавандовая мечта', color: '#7C3AED' }
  ];

  const handleExportBackup = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(state, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', 'lifeskill_backup.json');
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    sounds.playCorrect();
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-6 pb-28 select-none space-y-6">
      {/* Profile Hero Card */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border-2 border-slate-200 dark:border-slate-700 shadow-sm flex flex-col sm:flex-row items-center gap-6">
        <DuoMascot mood="happy" size="lg" speechBubble="Твой профиль!" />

        <div className="flex-1 text-center sm:text-left min-w-0">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-600 font-black text-xs mb-1">
            <Trophy className="w-3.5 h-3.5" /> {currentRank.name}
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white truncate">
            {state.profile.name}
          </h1>
          <p className="text-xs font-bold text-slate-400 mt-0.5 line-clamp-2">
            {state.profile.bio}
          </p>

          <button
            onClick={() => {
              sounds.playClick();
              setIsEditing(!isEditing);
            }}
            className="mt-3 px-4 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-black transition-all cursor-pointer"
          >
            {isEditing ? 'Закрыть редактор' : 'Редактировать профиль'}
          </button>
        </div>
      </div>

      {/* Profile Edit Drawer */}
      {isEditing && (
        <div className="p-5 bg-white dark:bg-slate-800 rounded-3xl border-2 border-emerald-500 shadow-md space-y-3 animate-in fade-in">
          <h3 className="text-sm font-black text-slate-900 dark:text-white">Редактирование профиля</h3>
          <div>
            <label className="text-xs font-bold text-slate-400">Имя исследователя</label>
            <input
              type="text"
              value={draftName}
              onChange={(e) => setDraftName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 text-sm font-bold outline-none"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-400">О себе</label>
            <textarea
              rows={2}
              value={draftBio}
              onChange={(e) => setDraftBio(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 text-xs font-bold outline-none"
            />
          </div>
          <button
            onClick={() => {
              sounds.playCorrect();
              updateProfile({ name: draftName.trim() || 'Исследователь', bio: draftBio });
              setIsEditing(false);
            }}
            className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-black text-xs shadow-sm cursor-pointer"
          >
            Сохранить изменения
          </button>
        </div>
      )}

      {/* Main Stats Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 bg-white dark:bg-slate-800 rounded-3xl border-2 border-slate-200 dark:border-slate-700 text-center shadow-sm">
          <Flame className="w-6 h-6 text-orange-500 fill-orange-500 mx-auto mb-1" />
          <div className="text-xl font-black text-slate-900 dark:text-white">{state.streak}</div>
          <div className="text-[11px] font-bold text-slate-400">Дней серии</div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-800 rounded-3xl border-2 border-slate-200 dark:border-slate-700 text-center shadow-sm">
          <Star className="w-6 h-6 text-amber-500 fill-amber-500 mx-auto mb-1" />
          <div className="text-xl font-black text-slate-900 dark:text-white">{state.xp}</div>
          <div className="text-[11px] font-bold text-slate-400">Всего XP</div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-800 rounded-3xl border-2 border-slate-200 dark:border-slate-700 text-center shadow-sm">
          <Trophy className="w-6 h-6 text-blue-500 fill-blue-500 mx-auto mb-1" />
          <div className="text-xl font-black text-slate-900 dark:text-white capitalize">{state.league}</div>
          <div className="text-[11px] font-bold text-slate-400">Текущая лига</div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-800 rounded-3xl border-2 border-slate-200 dark:border-slate-700 text-center shadow-sm">
          <Shield className="w-6 h-6 text-purple-500 fill-purple-500 mx-auto mb-1" />
          <div className="text-xl font-black text-slate-900 dark:text-white">{totalScore}</div>
          <div className="text-[11px] font-bold text-slate-400">Очки навыков</div>
        </div>
      </div>

      {/* 4 Adult Competencies Progress */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border-2 border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
        <h2 className="text-base font-black text-slate-900 dark:text-white">
          4 Ключевые характеристики взрослости
        </h2>
        <div className="space-y-3">
          {[
            { label: 'Планирование', value: state.stats.planning, color: 'bg-emerald-500', desc: 'Бюджет и инвестиции' },
            { label: 'Дисциплина', value: state.stats.discipline, color: 'bg-blue-500', desc: 'Фокус и тайм-менеджмент' },
            { label: 'Самостоятельность', value: state.stats.independence, color: 'bg-purple-500', desc: 'Быт, карьера и безопасность' },
            { label: 'Организованность', value: state.stats.organization, color: 'bg-amber-500', desc: 'Порядок в файлах и делах' }
          ].map((skill) => (
            <div key={skill.label}>
              <div className="flex justify-between text-xs font-black mb-1">
                <span className="text-slate-800 dark:text-slate-200">{skill.label}</span>
                <span className="text-slate-500">{skill.value} pts</span>
              </div>
              <div className="h-2.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className={`h-full ${skill.color} rounded-full transition-all`}
                  style={{ width: `${Math.min(100, (skill.value / 60) * 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Theme Picker */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border-2 border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
        <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
          <Palette className="w-5 h-5 text-emerald-500" /> Цветовая тема интерфейса
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
          {themes.map((t) => (
            <button
              key={t.id}
              onClick={() => {
                sounds.playClick();
                setTheme(t.id);
              }}
              className={`p-3 rounded-2xl border-2 text-left font-black text-xs transition-all flex items-center gap-2.5 cursor-pointer ${
                state.theme === t.id
                  ? 'theme-selected-theme'
                  : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
              }`}
            >
              <span className="w-4 h-4 rounded-full flex-shrink-0" style={{ backgroundColor: t.color }} />
              <span className="truncate">{t.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Settings & Stress-Free Learning */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border-2 border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
        <h2 className="text-base font-black text-slate-900 dark:text-white">Настройки обучения</h2>

        <div className="divide-y divide-slate-100 dark:divide-slate-700">
          <div className="py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-500" />
              <div>
                <div className="text-sm font-black text-slate-900 dark:text-white">
                  Режим «Без давления»
                </div>
                <div className="text-xs font-bold text-slate-400">
                  Сердечки не теряются при ошибках — учись в своём темпе
                </div>
              </div>
            </div>
            <input
              type="checkbox"
              checked={state.noPressureMode}
              onChange={toggleNoPressureMode}
              className="w-5 h-5 rounded accent-emerald-500 cursor-pointer"
            />
          </div>

          <div className="py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {state.soundEnabled ? <Volume2 className="w-5 h-5 text-blue-500" /> : <VolumeX className="w-5 h-5 text-slate-400" />}
              <div>
                <div className="text-sm font-black text-slate-900 dark:text-white">
                  Звуковые эффекты
                </div>
                <div className="text-xs font-bold text-slate-400">
                  Приятные щелчки и победный фанфарный перезвон
                </div>
              </div>
            </div>
            <input
              type="checkbox"
              checked={state.soundEnabled}
              onChange={toggleSound}
              className="w-5 h-5 rounded accent-emerald-500 cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Backup & Reset */}
      <div className="p-6 bg-slate-100 dark:bg-slate-800/40 rounded-3xl border border-slate-200 dark:border-slate-700 space-y-3">
        <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
          Управление прогрессом
        </h3>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleExportBackup}
            className="flex-1 py-2.5 bg-white dark:bg-slate-800 hover:bg-slate-50 border border-slate-300 dark:border-slate-600 rounded-xl text-xs font-black text-slate-700 dark:text-slate-200 flex items-center justify-center gap-2 cursor-pointer shadow-sm"
          >
            <Download className="w-4 h-4" /> Экспорт прогресса (JSON)
          </button>
          <button
            onClick={() => {
              if (confirm('ВНИМАНИЕ! Сбросить все уровни, опыт и кристаллы до нуля? Это действие необратимо.')) {
                resetProgress();
                sounds.playWrong();
              }
            }}
            className="py-2.5 px-4 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl text-xs font-black flex items-center justify-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" /> Сбросить
          </button>
        </div>
      </div>
    </div>
  );
};

