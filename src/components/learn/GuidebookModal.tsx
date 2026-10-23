import React from 'react';
import { Unit } from '../../types';
import { BookOpen, X, Sparkles, CheckCircle2 } from 'lucide-react';
import { sounds } from '../../utils/audio';

interface GuidebookModalProps {
  unit: Unit;
  onClose: () => void;
}

export const GuidebookModal: React.FC<GuidebookModalProps> = ({ unit, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-xl w-full max-h-[85vh] overflow-y-auto shadow-2xl border-2 border-slate-200 dark:border-slate-800 flex flex-col">
        {/* Modal Header */}
        <div className={`p-6 bg-gradient-to-r ${unit.bannerBg} text-white flex items-center justify-between sticky top-0 z-10 rounded-t-3xl shadow-sm`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-xs font-black uppercase tracking-wider text-white/80">
                Справочник · Раздел {unit.unitNumber}
              </div>
              <h2 className="text-xl font-black">{unit.title}</h2>
            </div>
          </div>
          <button
            onClick={() => {
              sounds.playClick();
              onClose();
            }}
            className="w-9 h-9 rounded-2xl bg-black/20 hover:bg-black/30 flex items-center justify-center text-white transition-colors"
            aria-label="Закрыть справочник"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6 text-slate-800 dark:text-slate-100">
          {/* Overview */}
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-2">Обзор темы</h3>
            <p className="text-base font-bold text-slate-600 dark:text-slate-300 leading-relaxed">
              {unit.guidebook.overview}
            </p>
          </div>

          {/* Golden Rule Card */}
          <div className="p-4 bg-amber-50 dark:bg-amber-950/40 rounded-2xl border-2 border-amber-300 dark:border-amber-700/50 flex gap-3.5 items-start">
            <Sparkles className="w-6 h-6 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-black uppercase tracking-wider text-amber-800 dark:text-amber-300">
                Золотое правило раздела
              </div>
              <div className="text-sm font-black text-amber-900 dark:text-amber-100 mt-0.5">
                {unit.guidebook.goldenRule}
              </div>
            </div>
          </div>

          {/* Key Takeaways */}
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-3">Главные выводы</h3>
            <div className="space-y-2.5">
              {unit.guidebook.keyTakeaways.map((takeaway, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{takeaway}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Cheat Sheet Vocabulary */}
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-3">Шпаргалка понятий</h3>
            <div className="grid gap-2">
              {unit.guidebook.cheatSheet.map((item, idx) => (
                <div key={idx} className="p-3.5 rounded-2xl bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700">
                  <div className="text-sm font-black text-emerald-600 dark:text-emerald-400 mb-0.5">{item.term}</div>
                  <div className="text-xs font-bold text-slate-500 dark:text-slate-300">{item.definition}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Done Button */}
          <button
            onClick={() => {
              sounds.playClick();
              onClose();
            }}
            className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 active:translate-y-1 text-white font-black text-sm rounded-2xl shadow-[0_4px_0_theme(colors.emerald.700)] active:shadow-none transition-all cursor-pointer"
          >
            Понятно, к урокам!
          </button>
        </div>
      </div>
    </div>
  );
};

