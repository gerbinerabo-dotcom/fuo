import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { SHOP_ITEMS } from '../../data/curriculum';
import { Gem, Snowflake, Heart, Zap, Briefcase, Shirt, Glasses, Cat, Bot, Check } from 'lucide-react';
import { sounds } from '../../utils/audio';

export const ShopView: React.FC = () => {
  const { state, buyShopItem } = useGame();
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Snowflake': return <Snowflake className="w-8 h-8 text-cyan-400" />;
      case 'Heart': return <Heart className="w-8 h-8 text-rose-500 fill-rose-500" />;
      case 'Zap': return <Zap className="w-8 h-8 text-amber-500 fill-amber-500" />;
      case 'Briefcase': return <Briefcase className="w-8 h-8 text-indigo-500" />;
      case 'Shirt': return <Shirt className="w-8 h-8 text-purple-500" />;
      case 'Glasses': return <Glasses className="w-8 h-8 text-sky-500" />;
      case 'Cat': return <Cat className="w-8 h-8 text-orange-500" />;
      case 'Bot': return <Bot className="w-8 h-8 text-emerald-500" />;
      default: return <Zap className="w-8 h-8 text-amber-500" />;
    }
  };

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2500);
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-6 pb-28 select-none space-y-6">
      {/* Toast Alert */}
      {toastMsg && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl bg-slate-900 text-white font-black text-sm shadow-2xl border-2 border-emerald-500 animate-in fade-in zoom-in-95">
          {toastMsg}
        </div>
      )}

      {/* Shop Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 rounded-3xl text-white shadow-xl flex items-center justify-between">
        <div>
          <div className="text-xs font-black uppercase tracking-wider text-blue-200">Магазин бонусов</div>
          <h1 className="text-2xl font-black mt-0.5">Магазин взрослости</h1>
          <p className="text-xs font-bold text-blue-100 mt-1">
            Трать заработанные кристаллы на защиту серии и прокачку уюта
          </p>
        </div>
        <div className="flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/30 text-white font-black text-lg">
          <Gem className="w-6 h-6 fill-blue-300 text-blue-200" />
          <span>{state.gems}</span>
        </div>
      </div>

      {/* Active Boosts Indicator */}
      {state.doubleXpUntil && state.doubleXpUntil > Date.now() && (
        <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-2xl border-2 border-amber-400 flex items-center gap-2 text-xs font-black text-amber-800 dark:text-amber-200 animate-pulse">
          ⚡ Активно зелье удвоения XP (осталось {Math.ceil((state.doubleXpUntil - Date.now()) / 60000)} мин)!
        </div>
      )}

      {/* Categories */}
      {['powerup', 'outfit', 'companion', 'flair'].map((cat) => {
        const items = SHOP_ITEMS.filter((item) => item.category === cat);
        const titles: Record<string, string> = {
          powerup: 'Усилители и спасение серии',
          outfit: 'Одежда для маскота',
          companion: 'Домашние питомцы и компаньоны',
          flair: 'Аксессуары'
        };

        return (
          <div key={cat} className="space-y-3">
            <h2 className="text-sm font-black uppercase tracking-wider text-slate-400">
              {titles[cat] || cat}
            </h2>
            <div className="space-y-3">
              {items.map((item) => {
                const isOwned = state.ownedItemIds.includes(item.id) && item.category !== 'powerup';

                return (
                  <div
                    key={item.id}
                    className="p-4 bg-white dark:bg-slate-800 rounded-3xl border-2 border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-between gap-4"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-center flex-shrink-0">
                      {getIcon(item.icon)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="font-black text-sm text-slate-900 dark:text-white">
                        {item.name}
                      </div>
                      <div className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-0.5">
                        {item.description}
                      </div>
                      {item.effect && (
                        <div className="text-[11px] font-black text-emerald-600 dark:text-emerald-400 mt-1">
                          ✨ {item.effect}
                        </div>
                      )}
                    </div>

                    {/* Buy Action */}
                    <div className="flex-shrink-0">
                      {isOwned ? (
                        <div className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-500 font-black text-xs flex items-center gap-1">
                          <Check className="w-4 h-4 text-emerald-500" /> Куплено
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            const res = buyShopItem(item.id, item.cost);
                            if (res.success) {
                              sounds.playChest();
                              showToast(`Приобретено: ${item.name}!`);
                            } else {
                              sounds.playWrong();
                              showToast(res.message);
                            }
                          }}
                          className="px-4 py-2.5 bg-blue-500 hover:bg-blue-600 active:translate-y-1 text-white font-black text-xs rounded-2xl shadow-[0_3px_0_theme(colors.blue.700)] active:shadow-none transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                          <Gem className="w-4 h-4 fill-white" /> {item.cost}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

