import React, { useState } from 'react';
import {
  Calculator,
  Grid,
  Scale,
  ShoppingCart,
  Award,
  Sparkles,
  AlertTriangle,
  Calendar,
  Check,
  Copy,
  Plus,
  Trash2,
  Search
} from 'lucide-react';
import { calculateBudget, calculateSafetyCushion, compareProductPrices } from '../../utils/gameRules';
import { LAUNDRY_SYMBOLS, EMERGENCY_SCENARIOS, MONTH_SIM_EVENTS } from '../../data/toolboxData';
import { sounds } from '../../utils/audio';

type ToolTab = 'budget' | 'matrix' | 'compare' | 'shopping' | 'star' | 'laundry' | 'emergency' | 'sim';

export const ToolboxView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ToolTab>('budget');

  // Budget state
  const [income, setIncome] = useState<number>(250000);
  const [needsPct, setNeedsPct] = useState<number>(50);
  const [wantsPct, setWantsPct] = useState<number>(30);
  const [savingsPct, setSavingsPct] = useState<number>(20);
  const [cushionExpenses, setCushionExpenses] = useState<number>(140000);
  const [cushionMonths, setCushionMonths] = useState<number>(6);

  // Matrix state
  const [matrixTasks, setMatrixTasks] = useState([
    { id: 1, text: 'Оплатить квитанции за свет и интернет', q: 1, done: false },
    { id: 2, text: 'Составить меню и список продуктов на неделю', q: 2, done: false },
    { id: 3, text: 'Ответить на несрочное сообщение в соцсетях', q: 3, done: false },
    { id: 4, text: 'Бесцельный просмотр ленты перед сном', q: 4, done: true }
  ]);
  const [newTaskText, setNewTaskText] = useState('');
  const [newTaskQ, setNewTaskQ] = useState(2);

  // Price Compare state
  const [weightA, setWeightA] = useState(400);
  const [priceA, setPriceA] = useState(900);
  const [weightB, setWeightB] = useState(600);
  const [priceB, setPriceB] = useState(1260);

  // Shopping state
  const [cartItems, setCartItems] = useState([
    { id: 1, name: 'Овсяные хлопья (1 кг)', price: 650, qty: 1, done: true },
    { id: 2, name: 'Яйца (10 шт)', price: 750, qty: 1, done: false },
    { id: 3, name: 'Молоко (1 л)', price: 480, qty: 2, done: false }
  ]);
  const [cartBudget, setCartBudget] = useState(5000);
  const [newCartName, setNewCartName] = useState('');
  const [newCartPrice, setNewCartPrice] = useState<number | ''>('');

  // STAR state
  const [starS, setStarS] = useState('');
  const [starT, setStarT] = useState('');
  const [starA, setStarA] = useState('');
  const [starR, setStarR] = useState('');
  const [copied, setCopied] = useState(false);

  // Laundry search
  const [laundryQuery, setLaundryQuery] = useState('');

  // Month Simulation state
  const [simStep, setSimStep] = useState(0);
  const [simMoney, setSimMoney] = useState(180000);
  const [simEnergy, setSimEnergy] = useState(100);
  const [simStress, setSimStress] = useState(20);
  const [simHistory, setSimHistory] = useState<string[]>([]);

  const budgetResult = calculateBudget(income, needsPct, wantsPct, savingsPct);
  const cushionResult = calculateSafetyCushion(cushionExpenses, cushionMonths);
  const compareResult = compareProductPrices(
    { name: 'Товар А (малый)', weight: weightA, price: priceA },
    { name: 'Товар Б (большой)', weight: weightB, price: priceB }
  );

  const cartTotal = cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);

  const tabs = [
    { id: 'budget' as ToolTab, label: '💰 Бюджет 50/30/20' },
    { id: 'matrix' as ToolTab, label: '🎯 Матрица дел' },
    { id: 'compare' as ToolTab, label: '⚖️ Цена за 1 кг' },
    { id: 'shopping' as ToolTab, label: '🛒 Корзина' },
    { id: 'star' as ToolTab, label: '💼 Метод STAR' },
    { id: 'laundry' as ToolTab, label: '🧺 Значки стирки' },
    { id: 'emergency' as ToolTab, label: '🚨 ЧП-Гайд' },
    { id: 'sim' as ToolTab, label: '🏙️ Симулятор месяца' }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 pb-28 select-none">
      {/* Page Title */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3">
          Взрослый Тулбокс <span className="text-xs px-2.5 py-1 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 rounded-full font-black uppercase tracking-wider">Инструменты</span>
        </h1>
        <p className="text-sm font-bold text-slate-500 dark:text-slate-400 mt-1">
          Практические интерактивные калькуляторы и алгоритмы на каждый день
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-3 mb-6 no-scrollbar">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              sounds.playClick();
              setActiveTab(tab.id);
            }}
            className={`px-4 py-2.5 rounded-2xl font-black text-xs sm:text-sm whitespace-nowrap transition-all cursor-pointer ${
              activeTab === tab.id
                ? 'bg-emerald-500 text-white shadow-[0_3px_0_theme(colors.emerald.700)]'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-2 border-slate-200 dark:border-slate-700 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 1. BUDGET 50/30/20 & CUSHION */}
      {activeTab === 'budget' && (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border-2 border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
            <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Calculator className="w-5 h-5 text-emerald-500" /> Калькулятор бюджета
            </h2>
            <div>
              <label className="text-xs font-black uppercase text-slate-400 block mb-1">
                Ежемесячный доход (тенге)
              </label>
              <input
                type="number"
                value={income}
                onChange={(e) => setIncome(Math.max(0, Number(e.target.value)))}
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 font-black text-base focus:border-emerald-500 outline-none"
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-xs font-black text-slate-400">Нужды %</label>
                <input
                  type="number"
                  value={needsPct}
                  onChange={(e) => setNeedsPct(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 font-black text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-black text-slate-400">Желания %</label>
                <input
                  type="number"
                  value={wantsPct}
                  onChange={(e) => setWantsPct(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 font-black text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-black text-slate-400">Сбережения %</label>
                <input
                  type="number"
                  value={savingsPct}
                  onChange={(e) => setSavingsPct(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 font-black text-sm"
                />
              </div>
            </div>

            {budgetResult.valid ? (
              <div className="space-y-3 pt-2">
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-800">
                  <div className="text-xs font-black text-emerald-700 dark:text-emerald-400">
                    🏠 Обязательные нужды ({budgetResult.needsPercent}%):
                  </div>
                  <div className="text-lg font-black text-emerald-800 dark:text-emerald-100">
                    {budgetResult.needsAmount.toLocaleString('ru-RU')} тенге
                  </div>
                </div>

                <div className="p-3 bg-blue-50 dark:bg-blue-950/40 rounded-2xl border border-blue-200 dark:border-blue-800">
                  <div className="text-xs font-black text-blue-700 dark:text-blue-400">
                    ☕ Личные желания и отдых ({budgetResult.wantsPercent}%):
                  </div>
                  <div className="text-lg font-black text-blue-800 dark:text-blue-100">
                    {budgetResult.wantsAmount.toLocaleString('ru-RU')} тенге
                  </div>
                </div>

                <div className="p-3 bg-purple-50 dark:bg-purple-950/40 rounded-2xl border border-purple-200 dark:border-purple-800">
                  <div className="text-xs font-black text-purple-700 dark:text-purple-400">
                    🎯 Цели и накопления ({budgetResult.savingsPercent}%):
                  </div>
                  <div className="text-lg font-black text-purple-800 dark:text-purple-100">
                    {budgetResult.savingsAmount.toLocaleString('ru-RU')} тенге
                  </div>
                </div>

                <div className="text-xs font-bold text-slate-500 dark:text-slate-400 p-2 bg-slate-50 dark:bg-slate-900 rounded-xl">
                  💡 {budgetResult.advice}
                </div>
              </div>
            ) : (
              <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl text-xs font-black">
                {budgetResult.error}
              </div>
            )}
          </div>

          {/* Safety Cushion */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border-2 border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
            <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              🛡️ Подушка безопасности
            </h2>
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
              Считается строго от обязательных ежемесячных расходов, а не от общего дохода!
            </p>

            <div>
              <label className="text-xs font-black uppercase text-slate-400 block mb-1">
                Обязательные расходы в месяц (тенге)
              </label>
              <input
                type="number"
                value={cushionExpenses}
                onChange={(e) => setCushionExpenses(Math.max(0, Number(e.target.value)))}
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 font-black text-base outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-xs font-black uppercase text-slate-400 block mb-1">
                Срок резерва (месяцев)
              </label>
              <select
                value={cushionMonths}
                onChange={(e) => setCushionMonths(Number(e.target.value))}
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 font-black text-base outline-none cursor-pointer"
              >
                <option value={3}>3 месяца (для стабильного найма)</option>
                <option value={6}>6 месяцев (рекомендовано экспертами)</option>
                <option value={12}>12 месяцев (для фрилансеров и бизнеса)</option>
              </select>
            </div>

            {cushionResult.valid && (
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border-2 border-emerald-400 space-y-2">
                <div className="text-xs font-black uppercase text-emerald-600">
                  Целевой размер подушки:
                </div>
                <div className="text-3xl font-black text-emerald-700 dark:text-emerald-300">
                  {cushionResult.totalTarget.toLocaleString('ru-RU')} тенге
                </div>
                <div className="text-xs font-bold text-slate-600 dark:text-slate-400">
                  Темп накопления за 1 год: ~{cushionResult.monthlyPace12Months.toLocaleString('ru-RU')} тенге/мес.
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. EISENHOWER MATRIX */}
      {activeTab === 'matrix' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-800 p-4 rounded-3xl border-2 border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="Добавить новую задачу..."
              value={newTaskText}
              onChange={(e) => setNewTaskText(e.target.value)}
              className="flex-1 px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 text-sm font-bold outline-none"
            />
            <select
              value={newTaskQ}
              onChange={(e) => setNewTaskQ(Number(e.target.value))}
              className="px-3 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 text-xs font-black"
            >
              <option value={1}>🔴 Q1: Срочно и Важно</option>
              <option value={2}>🟢 Q2: Важно, не срочно</option>
              <option value={3}>🟡 Q3: Срочно, не важно</option>
              <option value={4}>⚪ Q4: Не важно, не срочно</option>
            </select>
            <button
              onClick={() => {
                if (!newTaskText.trim()) return;
                sounds.playClick();
                setMatrixTasks([
                  ...matrixTasks,
                  { id: Date.now(), text: newTaskText.trim(), q: newTaskQ, done: false }
                ]);
                setNewTaskText('');
              }}
              className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-sm rounded-2xl shadow-[0_3px_0_theme(colors.emerald.700)] active:shadow-none transition-all flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" /> Добавить
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {[
              { q: 1, title: '🔴 Q1: Важно и Срочно', subtitle: 'Авралы, здоровье, горящие дедлайны', border: 'border-rose-400', bg: 'bg-rose-50/50 dark:bg-rose-950/20' },
              { q: 2, title: '🟢 Q2: Важно, но Не срочно', subtitle: 'Стратегия, спорт, цели, учёба', border: 'border-emerald-400', bg: 'bg-emerald-50/50 dark:bg-emerald-950/20' },
              { q: 3, title: '🟡 Q3: Срочно, но Не важно', subtitle: 'Чужие просьбы, звонки, уведомления', border: 'border-amber-400', bg: 'bg-amber-50/50 dark:bg-amber-950/20' },
              { q: 4, title: '⚪ Q4: Не важно и Не срочно', subtitle: 'Бесцельный скроллинг, шум, прокрастинация', border: 'border-slate-400', bg: 'bg-slate-50 dark:bg-slate-900/40' }
            ].map((quad) => {
              const tasks = matrixTasks.filter((t) => t.q === quad.q);
              return (
                <div
                  key={quad.q}
                  className={`p-4 rounded-3xl border-2 ${quad.border} ${quad.bg} flex flex-col justify-between min-h-52`}
                >
                  <div>
                    <div className="font-black text-sm text-slate-900 dark:text-white">{quad.title}</div>
                    <div className="text-[11px] font-bold text-slate-400 mb-3">{quad.subtitle}</div>

                    <div className="space-y-1.5">
                      {tasks.length === 0 ? (
                        <div className="text-xs font-bold text-slate-400 py-4 text-center">Задач нет</div>
                      ) : (
                        tasks.map((task) => (
                          <div
                            key={task.id}
                            className="p-2.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-2 shadow-sm"
                          >
                            <label className="flex items-center gap-2.5 cursor-pointer flex-1 min-w-0">
                              <input
                                type="checkbox"
                                checked={task.done}
                                onChange={() => {
                                  sounds.playClick();
                                  setMatrixTasks(
                                    matrixTasks.map((t) => (t.id === task.id ? { ...t, done: !t.done } : t))
                                  );
                                }}
                                className="w-4 h-4 rounded text-emerald-500 accent-emerald-500"
                              />
                              <span
                                className={`text-xs font-black truncate ${
                                  task.done ? 'line-through text-slate-400' : 'text-slate-700 dark:text-slate-200'
                                }`}
                              >
                                {task.text}
                              </span>
                            </label>
                            <button
                              onClick={() => {
                                sounds.playClick();
                                setMatrixTasks(matrixTasks.filter((t) => t.id !== task.id));
                              }}
                              className="text-slate-400 hover:text-rose-500 p-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. PRICE COMPARE 1 KG */}
      {activeTab === 'compare' && (
        <div className="max-w-2xl mx-auto bg-white dark:bg-slate-800 p-6 rounded-3xl border-2 border-slate-200 dark:border-slate-700 shadow-sm space-y-6">
          <div>
            <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Scale className="w-5 h-5 text-amber-500" /> Разоблачитель шринкфляции
            </h2>
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-0.5">
              Сравнивает реальную стоимость двух товаров за 1 кг или 1 литр при разной граммовке.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border-2 border-slate-200 dark:border-slate-700 space-y-3">
              <div className="font-black text-xs uppercase text-slate-400">Товар А (малая пачка)</div>
              <div>
                <label className="text-xs font-bold text-slate-500">Вес (граммы / мл)</label>
                <input
                  type="number"
                  value={weightA}
                  onChange={(e) => setWeightA(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 font-black text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500">Цена (тенге)</label>
                <input
                  type="number"
                  value={priceA}
                  onChange={(e) => setPriceA(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 font-black text-sm"
                />
              </div>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border-2 border-slate-200 dark:border-slate-700 space-y-3">
              <div className="font-black text-xs uppercase text-slate-400">Товар Б (большая пачка)</div>
              <div>
                <label className="text-xs font-bold text-slate-500">Вес (граммы / мл)</label>
                <input
                  type="number"
                  value={weightB}
                  onChange={(e) => setWeightB(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 font-black text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500">Цена (тенге)</label>
                <input
                  type="number"
                  value={priceB}
                  onChange={(e) => setPriceB(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 font-black text-sm"
                />
              </div>
            </div>
          </div>

          {compareResult.valid && (
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border-2 border-emerald-500 space-y-2">
              <div className="text-sm font-black text-emerald-800 dark:text-emerald-200">
                {compareResult.insight}
              </div>
              <div className="text-xs font-bold text-slate-600 dark:text-slate-300">
                Товар А: <b>{compareResult.pricePerKgA.toLocaleString('ru-RU')} тенге / кг</b> | Товар Б: <b>{compareResult.pricePerKgB.toLocaleString('ru-RU')} тенге / кг</b>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 4. SHOPPING CART */}
      {activeTab === 'shopping' && (
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-3xl border-2 border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-emerald-500" /> Список покупок
              </h2>
              <span className="text-xs font-black px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                Всего: {cartTotal.toLocaleString('ru-RU')} тенге
              </span>
            </div>

            {cartTotal > cartBudget && (
              <div className="p-3 bg-rose-50 border-2 border-rose-300 rounded-2xl text-xs font-black text-rose-700 flex items-center gap-2">
                ⚠️ Превышение лимита корзины на {(cartTotal - cartBudget).toLocaleString('ru-RU')} тенге!
              </div>
            )}

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Название (напр. Гречка)"
                value={newCartName}
                onChange={(e) => setNewCartName(e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 text-sm font-bold outline-none"
              />
              <input
                type="number"
                placeholder="Цена, тенге"
                value={newCartPrice}
                onChange={(e) => setNewCartPrice(e.target.value ? Number(e.target.value) : '')}
                className="w-24 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 text-sm font-bold outline-none"
              />
              <button
                onClick={() => {
                  if (!newCartName.trim()) return;
                  sounds.playClick();
                  setCartItems([
                    ...cartItems,
                    {
                      id: Date.now(),
                      name: newCartName.trim(),
                      price: Number(newCartPrice) || 0,
                      qty: 1,
                      done: false
                    }
                  ]);
                  setNewCartName('');
                  setNewCartPrice('');
                }}
                className="px-4 py-2 bg-emerald-500 text-white rounded-xl font-black text-xs"
              >
                +
              </button>
            </div>

            <div className="space-y-2">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="p-3 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3"
                >
                  <label className="flex items-center gap-3 cursor-pointer flex-1">
                    <input
                      type="checkbox"
                      checked={item.done}
                      onChange={() => {
                        sounds.playClick();
                        setCartItems(
                          cartItems.map((i) => (i.id === item.id ? { ...i, done: !i.done } : i))
                        );
                      }}
                      className="w-4 h-4 rounded text-emerald-500 accent-emerald-500"
                    />
                    <span className={`text-sm font-black ${item.done ? 'line-through text-slate-400' : 'text-slate-800 dark:text-slate-200'}`}>
                      {item.name}
                    </span>
                  </label>
                  <div className="text-xs font-black text-slate-600 dark:text-slate-300">
                    {(item.price * item.qty).toLocaleString('ru-RU')} тенге
                  </div>
                  <button
                    onClick={() => {
                      sounds.playClick();
                      setCartItems(cartItems.filter((i) => i.id !== item.id));
                    }}
                    className="text-slate-400 hover:text-rose-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border-2 border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
            <h3 className="text-base font-black text-slate-900 dark:text-white">Лимит на поход</h3>
            <div>
              <label className="text-xs font-bold text-slate-400">Бюджет корзины (тенге)</label>
              <input
                type="number"
                value={cartBudget}
                onChange={(e) => setCartBudget(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 font-black text-sm"
              />
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-2xl text-xs font-bold text-slate-500 space-y-1">
              <div>Остаток лимита: <b>{(cartBudget - cartTotal).toLocaleString('ru-RU')} тенге</b></div>
              <div>Куплено: <b>{cartItems.filter(i => i.done).reduce((a, b) => a + b.price * b.qty, 0).toLocaleString('ru-RU')} тенге</b></div>
            </div>
          </div>
        </div>
      )}

      {/* 5. STAR BUILDER */}
      {activeTab === 'star' && (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border-2 border-slate-200 dark:border-slate-700 shadow-sm space-y-4 max-w-2xl mx-auto">
          <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-sky-500" /> Конструктор ответов по методу STAR
          </h2>
          <p className="text-xs font-bold text-slate-400">
            Собери сильный структурированный ответ для собеседования и скопируй его в резюме или шпаргалку.
          </p>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-black text-emerald-600 block mb-1">
                S — Situation (Какова была ситуация/проблема?)
              </label>
              <textarea
                rows={2}
                value={starS}
                onChange={(e) => setStarS(e.target.value)}
                placeholder="Например: В командном учебном проекте за 3 дня до сдачи сломалась база данных..."
                className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 text-xs font-bold outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-black text-blue-600 block mb-1">
                T — Task (Какая конкретная задача стояла перед тобой?)
              </label>
              <textarea
                rows={2}
                value={starT}
                onChange={(e) => setStarT(e.target.value)}
                placeholder="Например: Моей задачей было восстановить бэкап и защитить данные..."
                className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 text-xs font-bold outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-black text-purple-600 block mb-1">
                A — Action (Какие действия предпринял(а) именно ТЫ?)
              </label>
              <textarea
                rows={2}
                value={starA}
                onChange={(e) => setStarA(e.target.value)}
                placeholder="Например: Я написал скрипт миграции, распределил задачи в чате и тестировал запросы..."
                className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 text-xs font-bold outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-black text-amber-600 block mb-1">
                R — Result (Какой измеримый итог был достигнут?)
              </label>
              <textarea
                rows={2}
                value={starR}
                onChange={(e) => setStarR(e.target.value)}
                placeholder="Например: Мы сдали проект вовремя, получили оценку 95 баллов и внедрили автобэкапы..."
                className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 text-xs font-bold outline-none"
              />
            </div>
          </div>

          <button
            onClick={() => {
              const fullText = `【S - Ситуация】: ${starS}\n\n【T - Задача】: ${starT}\n\n【A - Действия】: ${starA}\n\n【R - Результат】: ${starR}`;
              navigator.clipboard?.writeText(fullText);
              setCopied(true);
              sounds.playCorrect();
              setTimeout(() => setCopied(false), 2000);
            }}
            className="w-full py-3 bg-sky-500 hover:bg-sky-600 text-white rounded-2xl font-black text-sm shadow-[0_3px_0_theme(colors.sky.700)] active:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Скопировано в буфер обмена!' : 'Скопировать историю по STAR'}
          </button>
        </div>
      )}

      {/* 6. LAUNDRY SYMBOLS */}
      {activeTab === 'laundry' && (
        <div className="space-y-4">
          <div className="relative max-w-md mx-auto">
            <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Поиск по названию (стирка, утюг, отбеливание)..."
              value={laundryQuery}
              onChange={(e) => setLaundryQuery(e.target.value.toLowerCase())}
              className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-sm font-bold outline-none focus:border-emerald-500"
            />
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
            {LAUNDRY_SYMBOLS.filter(
              (s) =>
                s.name.toLowerCase().includes(laundryQuery) ||
                s.meaning.toLowerCase().includes(laundryQuery)
            ).map((s, idx) => (
              <div
                key={idx}
                className="p-4 bg-white dark:bg-slate-800 rounded-2xl border-2 border-slate-200 dark:border-slate-700 space-y-1 shadow-sm"
              >
                <div className="text-2xl font-black mb-1">{s.icon}</div>
                <div className="font-black text-sm text-slate-900 dark:text-white">{s.name}</div>
                <div className="text-xs font-bold text-slate-600 dark:text-slate-300">{s.meaning}</div>
                <div className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 pt-1">
                  💡 {s.advice}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 7. EMERGENCY GUIDES */}
      {activeTab === 'emergency' && (
        <div className="grid sm:grid-cols-2 gap-4">
          {EMERGENCY_SCENARIOS.map((scen) => (
            <div
              key={scen.id}
              className="p-5 bg-white dark:bg-slate-800 rounded-3xl border-2 border-slate-200 dark:border-slate-700 shadow-sm space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full ${scen.badgeColor}`}>
                  {scen.dangerBadge}
                </span>
              </div>
              <h3 className="text-base font-black text-slate-900 dark:text-white leading-snug">
                {scen.title}
              </h3>
              <div className="p-2.5 bg-slate-50 dark:bg-slate-900 rounded-xl text-xs font-black text-slate-700 dark:text-slate-300">
                🚨 {scen.priorityRule}
              </div>
              <div className="space-y-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 leading-relaxed">
                {scen.steps.map((st, i) => (
                  <div key={i}>{st}</div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 8. 30-DAY MONTH SIMULATION */}
      {activeTab === 'sim' && (
        <div className="max-w-2xl mx-auto bg-white dark:bg-slate-800 p-6 rounded-3xl border-2 border-slate-200 dark:border-slate-700 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b pb-4 border-slate-100 dark:border-slate-700">
            <div>
              <div className="text-xs font-black uppercase text-emerald-600">Интерактивный симулятор</div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white">Месяц самостоятельной жизни</h2>
            </div>
            <button
              onClick={() => {
                setSimStep(0);
                setSimMoney(180000);
                setSimEnergy(100);
                setSimStress(20);
                setSimHistory([]);
              }}
              className="text-xs font-black text-slate-400 hover:text-slate-600 flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Сбросить
            </button>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 text-center">
              <div className="text-xs font-bold text-slate-400">Деньги</div>
              <div className="text-lg font-black text-emerald-700 dark:text-emerald-300">
                {simMoney.toLocaleString('ru-RU')} тенге
              </div>
            </div>
            <div className="p-3 bg-blue-50 dark:bg-blue-950/40 rounded-2xl border border-blue-200 text-center">
              <div className="text-xs font-bold text-slate-400">Энергия</div>
              <div className="text-lg font-black text-blue-700 dark:text-blue-300">⚡ {simEnergy}%</div>
            </div>
            <div className="p-3 bg-purple-50 dark:bg-purple-950/40 rounded-2xl border border-purple-200 text-center">
              <div className="text-xs font-bold text-slate-400">Стресс</div>
              <div className="text-lg font-black text-purple-700 dark:text-purple-300">🧠 {simStress}%</div>
            </div>
          </div>

          {simStep < MONTH_SIM_EVENTS.length ? (
            <div className="p-5 bg-slate-50 dark:bg-slate-900 rounded-3xl border-2 border-slate-200 dark:border-slate-700 space-y-4">
              <div className="text-xs font-black text-slate-400 uppercase">
                Событие {simStep + 1} из {MONTH_SIM_EVENTS.length}
              </div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                {MONTH_SIM_EVENTS[simStep].title}
              </h3>
              <p className="text-sm font-bold text-slate-600 dark:text-slate-300">
                {MONTH_SIM_EVENTS[simStep].description}
              </p>

              <div className="space-y-2.5 pt-2">
                {MONTH_SIM_EVENTS[simStep].choices.map((c, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      sounds.playClick();
                      setSimMoney((m) => m + c.moneyChange);
                      setSimEnergy((e) => Math.max(0, Math.min(100, e + c.energyChange)));
                      setSimStress((s) => Math.max(0, Math.min(100, s + c.stressChange)));
                      setSimHistory([...simHistory, `День ${MONTH_SIM_EVENTS[simStep].day}: ${c.resultText}`]);
                      setSimStep((s) => s + 1);
                    }}
                    className="w-full p-3.5 rounded-2xl text-left bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 hover:border-emerald-500 font-black text-xs sm:text-sm text-slate-800 dark:text-slate-100 shadow-sm transition-all"
                  >
                    👉 {c.text}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-6 bg-emerald-50 dark:bg-emerald-950/40 rounded-3xl border-2 border-emerald-500 text-center space-y-3">
              <h3 className="text-2xl font-black text-emerald-800 dark:text-emerald-200">
                🎉 Месяц успешно завершён!
              </h3>
              <p className="text-sm font-bold text-slate-600 dark:text-slate-300">
                Итоговый баланс: {simMoney.toLocaleString('ru-RU')} тенге. Твоя взрослая готовность на высоте!
              </p>
            </div>
          )}

          {simHistory.length > 0 && (
            <div className="space-y-1.5 pt-2">
              <div className="text-xs font-black uppercase text-slate-400">История принятых решений:</div>
              {simHistory.map((h, i) => (
                <div key={i} className="text-xs font-bold text-slate-600 dark:text-slate-400">
                  • {h}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

function RotateCcw(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
    </svg>
  );
}

