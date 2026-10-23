/**
 * Pure business logic for LifeSkill game mechanics and calculators.
 */

export interface BudgetResult {
  valid: boolean;
  income: number;
  needsPercent: number;
  wantsPercent: number;
  savingsPercent: number;
  needsAmount: number;
  wantsAmount: number;
  savingsAmount: number;
  advice: string;
  isHighEssentials: boolean;
  error?: string;
}

export interface SafetyCushionResult {
  valid: boolean;
  essentialMonthlyExpenses: number;
  months: number;
  totalTarget: number;
  monthlyPace12Months: number;
  description: string;
  error?: string;
}

export interface PriceCompareResult {
  valid: boolean;
  pricePerKgA: number;
  pricePerKgB: number;
  cheaperItem: 'A' | 'B' | 'EQUAL';
  diffPercent: number;
  insight: string;
  error?: string;
}

export const RANKS = [
  { min: 0, max: 40, name: 'Птенец из гнезда', reward: 'Стартовый набор взрослости', icon: '🐣' },
  { min: 41, max: 100, name: 'Выживальщик в однушке', reward: 'Термокружка фокуса (+10 ЛайфКоинов)', icon: '📦' },
  { min: 101, max: 180, name: 'Укротитель квитанций ЖКХ', reward: 'Очки внимательности (+20 ЛайфКоинов)', icon: '🧾' },
  { min: 181, max: 280, name: 'Магистр планирования', reward: 'Кардиган фокуса (+35 ЛайфКоинов)', icon: '📅' },
  { min: 281, max: Infinity, name: 'Гуру осознанной взрослости', reward: 'Корона зрелости (+50 ЛайфКоинов)', icon: '👑' }
];

export function getRankByScore(score: number) {
  const val = typeof score === 'number' && Number.isFinite(score) ? Math.max(0, Math.floor(score)) : 0;
  for (let i = 0; i < RANKS.length; i++) {
    if (val >= RANKS[i].min && val <= RANKS[i].max) {
      return RANKS[i];
    }
  }
  return RANKS[RANKS.length - 1];
}

export function calculateTotalSkillScore(stats: { discipline: number; independence: number; planning: number; organization: number }): number {
  if (!stats) return 20;
  return Math.floor(
    Math.max(0, stats.discipline || 0) +
    Math.max(0, stats.independence || 0) +
    Math.max(0, stats.planning || 0) +
    Math.max(0, stats.organization || 0)
  );
}

export function getLevelByXP(xp: number): number {
  const val = Math.max(0, Number(xp) || 0);
  return Math.floor(val / 100) + 1;
}

export function getXPProgressInLevel(xp: number): { current: number; max: number; percent: number } {
  const val = Math.max(0, Number(xp) || 0);
  const current = val % 100;
  return {
    current,
    max: 100,
    percent: Math.min(100, Math.round((current / 100) * 100)),
  };
}

export function calculateBudget(
  income: number,
  needsPercent: number,
  wantsPercent: number,
  savingsPercent: number
): BudgetResult {
  const inc = Number(income);
  if (!Number.isFinite(inc) || inc <= 0) {
    return {
      valid: false,
      income: 0,
      needsPercent: 0,
      wantsPercent: 0,
      savingsPercent: 0,
      needsAmount: 0,
      wantsAmount: 0,
      savingsAmount: 0,
      advice: '',
      isHighEssentials: false,
      error: 'Доход должен быть положительным числом.',
    };
  }

  const np = Number(needsPercent);
  const wp = Number(wantsPercent);
  const sp = Number(savingsPercent);

  if (!Number.isFinite(np) || np < 0 || !Number.isFinite(wp) || wp < 0 || !Number.isFinite(sp) || sp < 0) {
    return {
      valid: false,
      income: inc,
      needsPercent: 0,
      wantsPercent: 0,
      savingsPercent: 0,
      needsAmount: 0,
      wantsAmount: 0,
      savingsAmount: 0,
      advice: '',
      isHighEssentials: false,
      error: 'Проценты должны быть неотрицательными числами.',
    };
  }

  const sum = Math.round(np + wp + sp);
  if (sum !== 100) {
    return {
      valid: false,
      income: inc,
      needsPercent: np,
      wantsPercent: wp,
      savingsPercent: sp,
      needsAmount: 0,
      wantsAmount: 0,
      savingsAmount: 0,
      advice: '',
      isHighEssentials: false,
      error: `Сумма долей должна быть 100% (сейчас ${sum}%).`,
    };
  }

  const needsAmount = Math.round((inc * np) / 100);
  const wantsAmount = Math.round((inc * wp) / 100);
  const savingsAmount = Math.round((inc * sp) / 100);
  const isHighEssentials = np > 65;

  let advice = 'Сбалансированное распределение по правилу 50/30/20. Главное — следовать ему стабильно.';
  if (isHighEssentials) {
    advice = 'Обязательные счета занимают больше 65% бюджета. Это нормально на старте карьеры или при аренде жилья. Рекомендуем временную формулу 70/20/10.';
  } else if (sp < 10) {
    advice = 'Накопления невелики, но даже 5–10% вырабатывают крепкую привычку инвестировать в своё спокойствие.';
  }

  return {
    valid: true,
    income: inc,
    needsPercent: np,
    wantsPercent: wp,
    savingsPercent: sp,
    needsAmount,
    wantsAmount,
    savingsAmount,
    advice,
    isHighEssentials,
  };
}

export function calculateSafetyCushion(essentialMonthlyExpenses: number, months: number): SafetyCushionResult {
  const exp = Number(essentialMonthlyExpenses);
  if (!Number.isFinite(exp) || exp <= 0) {
    return {
      valid: false,
      essentialMonthlyExpenses: 0,
      months: 0,
      totalTarget: 0,
      monthlyPace12Months: 0,
      description: '',
      error: 'Обязательные ежемесячные расходы должны быть больше 0.',
    };
  }

  const m = Number(months);
  if (!Number.isInteger(m) || m < 1 || m > 36) {
    return {
      valid: false,
      essentialMonthlyExpenses: exp,
      months: 0,
      totalTarget: 0,
      monthlyPace12Months: 0,
      description: '',
      error: 'Срок должен быть целым числом от 1 до 36 месяцев.',
    };
  }

  const totalTarget = Math.round(exp * m);
  const monthlyPace12Months = Math.round(totalTarget / 12);

  return {
    valid: true,
    essentialMonthlyExpenses: exp,
    months: m,
    totalTarget,
    monthlyPace12Months,
    description: `Подушка на ${m} мес. обязательных расходов (${exp.toLocaleString('ru-RU')} тенге/мес) составляет ${totalTarget.toLocaleString('ru-RU')} тенге.`,
  };
}

export function compareProductPrices(
  itemA: { name: string; weight: number; price: number },
  itemB: { name: string; weight: number; price: number }
): PriceCompareResult {
  const priceA = Number(itemA.price);
  const weightA = Number(itemA.weight);
  const priceB = Number(itemB.price);
  const weightB = Number(itemB.weight);

  if (priceA <= 0 || weightA <= 0 || priceB <= 0 || weightB <= 0) {
    return {
      valid: false,
      pricePerKgA: 0,
      pricePerKgB: 0,
      cheaperItem: 'EQUAL',
      diffPercent: 0,
      insight: '',
      error: 'Вес и цена обоих товаров должны быть положительными.',
    };
  }

  const pricePerKgA = (priceA / weightA) * 1000;
  const pricePerKgB = (priceB / weightB) * 1000;
  const cheaperItem = pricePerKgA < pricePerKgB ? 'A' : pricePerKgB < pricePerKgA ? 'B' : 'EQUAL';
  const diffPercent = Math.abs(Math.round(((pricePerKgA - pricePerKgB) / Math.max(pricePerKgA, pricePerKgB)) * 100));

  const insight =
    cheaperItem === 'A'
      ? `${itemA.name} выгоднее на ${diffPercent}% в пересчёте за 1 кг/л.`
      : cheaperItem === 'B'
      ? `${itemB.name} выгоднее на ${diffPercent}% в пересчёте за 1 кг/л.`
      : 'Оба варианта одинаковы по цене за килограмм/литр.';

  return {
    valid: true,
    pricePerKgA: Math.round(pricePerKgA),
    pricePerKgB: Math.round(pricePerKgB),
    cheaperItem,
    diffPercent,
    insight,
  };
}

export function calculateDailyStreak(
  currentStreak: number,
  lastActiveDate: string,
  todayDate: string,
  hasStreakFreeze: boolean
): { newStreak: number; freezeUsed: boolean; isConsecutive: boolean } {
  if (!lastActiveDate) {
    return { newStreak: 1, freezeUsed: false, isConsecutive: true };
  }
  if (lastActiveDate === todayDate) {
    return { newStreak: currentStreak, freezeUsed: false, isConsecutive: true };
  }

  const last = new Date(lastActiveDate);
  const today = new Date(todayDate);
  const diffDays = Math.round((today.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 1) {
    return { newStreak: currentStreak + 1, freezeUsed: false, isConsecutive: true };
  } else if (diffDays === 2 && hasStreakFreeze) {
    // Protected by streak freeze
    return { newStreak: currentStreak + 1, freezeUsed: true, isConsecutive: true };
  } else {
    // Streak reset
    return { newStreak: 1, freezeUsed: false, isConsecutive: false };
  }
}

