import React from 'react';
import {
  GraduationCap,
  Trophy,
  Target,
  ShoppingBag,
  Wrench,
  User,
  Sparkles
} from 'lucide-react';
import { sounds } from '../utils/audio';

export type TabType = 'learn' | 'leagues' | 'quests' | 'shop' | 'toolbox' | 'profile';

interface NavigationProps {
  activeTab: TabType;
  onChangeTab: (tab: TabType) => void;
  unclaimedQuestsCount?: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onChangeTab,
  unclaimedQuestsCount = 0
}) => {
  const navItems = [
    { id: 'learn' as TabType, label: 'Учёба', icon: GraduationCap },
    { id: 'leagues' as TabType, label: 'Лиги', icon: Trophy },
    { id: 'quests' as TabType, label: 'Квесты', icon: Target, badge: unclaimedQuestsCount > 0 ? unclaimedQuestsCount : undefined },
    { id: 'shop' as TabType, label: 'Магазин', icon: ShoppingBag },
    { id: 'toolbox' as TabType, label: 'Тулбокс', icon: Wrench },
    { id: 'profile' as TabType, label: 'Профиль', icon: User }
  ];

  const handleSelect = (tab: TabType) => {
    sounds.playClick();
    onChangeTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      {/* Desktop Left Sidebar */}
      <aside className="hidden lg:flex flex-col fixed top-0 left-0 bottom-0 w-64 bg-white dark:bg-slate-900 border-r-2 border-slate-200 dark:border-slate-800 p-4 z-50 select-none">
        {/* Brand Logo */}
        <div className="h-16 flex items-center gap-3 px-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500 flex items-center justify-center text-white shadow-[0_3px_0_theme(colors.emerald.700)]">
            <Sparkles className="w-6 h-6 fill-white" />
          </div>
          <div>
            <div className="font-black text-2xl tracking-tight text-emerald-500">LifeSkill</div>
            <div className="text-[11px] font-black uppercase tracking-wider text-slate-400">Школа взрослости</div>
          </div>
        </div>

        {/* Navigation Buttons */}
        <nav className="space-y-1.5 flex-1" aria-label="Основная навигация">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelect(item.id)}
                className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl font-black text-sm uppercase tracking-wider transition-all duration-150 cursor-pointer ${
                  isActive
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-2 border-emerald-500/40 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border-2 border-transparent'
                }`}
              >
                <Icon className={`w-6 h-6 flex-shrink-0 ${isActive ? 'stroke-[2.5]' : ''}`} />
                <span className="flex-1 text-left">{item.label}</span>
                {item.badge && (
                  <span className="px-2 py-0.5 text-xs font-black bg-rose-500 text-white rounded-full animate-bounce">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Motivational Adult Quote at bottom of sidebar */}
        <div className="p-3 bg-emerald-50 dark:bg-slate-800/60 rounded-2xl border border-emerald-200 dark:border-slate-700 text-xs font-extrabold text-slate-600 dark:text-slate-300">
          🌱 <span className="text-emerald-600 dark:text-emerald-400">Совет дня:</span> 15 минут спокойной практики в день меняют взрослую жизнь за год.
        </div>
      </aside>

      {/* Mobile Bottom Navigation Bar */}
      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t-2 border-slate-200 dark:border-slate-800 px-2 py-1.5 z-40 flex justify-around items-center select-none"
        aria-label="Мобильная навигация"
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleSelect(item.id)}
              className={`flex flex-col items-center justify-center p-2 rounded-2xl transition-all relative ${
                isActive
                  ? 'text-emerald-500 font-black'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold'
              }`}
            >
              <Icon className={`w-6 h-6 ${isActive ? 'stroke-[2.5] scale-110' : ''} transition-transform`} />
              <span className="text-[10px] mt-0.5 tracking-tight font-extrabold">{item.label}</span>
              {item.badge && (
                <span className="absolute top-1 right-2 w-2 h-2 bg-rose-500 rounded-full" />
              )}
            </button>
          );
        })}
      </nav>
    </>
  );
};

