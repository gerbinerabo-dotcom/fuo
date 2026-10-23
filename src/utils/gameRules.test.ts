import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getRankByScore,
  calculateTotalSkillScore,
  calculateBudget,
  calculateSafetyCushion,
  compareProductPrices,
  calculateDailyStreak,
  getLevelByXP
} from './gameRules';

test('Rank boundaries correctly map scores to ranks', () => {
  assert.equal(getRankByScore(0).name, 'Птенец из гнезда');
  assert.equal(getRankByScore(40).name, 'Птенец из гнезда');
  assert.equal(getRankByScore(41).name, 'Выживальщик в однушке');
  assert.equal(getRankByScore(100).name, 'Выживальщик в однушке');
  assert.equal(getRankByScore(101).name, 'Укротитель квитанций ЖКХ');
  assert.equal(getRankByScore(180).name, 'Укротитель квитанций ЖКХ');
  assert.equal(getRankByScore(181).name, 'Магистр планирования');
  assert.equal(getRankByScore(280).name, 'Магистр планирования');
  assert.equal(getRankByScore(281).name, 'Гуру осознанной взрослости');
  assert.equal(getRankByScore(500).name, 'Гуру осознанной взрослости');
});

test('calculateTotalSkillScore sums valid discipline, independence, planning and organization', () => {
  const stats = { discipline: 10, independence: 15, planning: 20, organization: 25 };
  assert.equal(calculateTotalSkillScore(stats), 70);
  assert.equal(calculateTotalSkillScore({ discipline: 0, independence: 0, planning: 0, organization: 0 }), 0);
});

test('getLevelByXP correctly calculates user level from XP', () => {
  assert.equal(getLevelByXP(0), 1);
  assert.equal(getLevelByXP(99), 1);
  assert.equal(getLevelByXP(100), 2);
  assert.equal(getLevelByXP(250), 3);
  assert.equal(getLevelByXP(1000), 11);
});

test('calculateBudget validates percentages and amounts', () => {
  // Invalid sum != 100
  const invalid = calculateBudget(200000, 50, 30, 10);
  assert.equal(invalid.valid, false);

  // Valid 50/30/20
  const valid = calculateBudget(300000, 50, 30, 20);
  assert.equal(valid.valid, true);
  assert.equal(valid.needsAmount, 150000);
  assert.equal(valid.wantsAmount, 90000);
  assert.equal(valid.savingsAmount, 60000);
  assert.equal(valid.isHighEssentials, false);

  // High essentials (>65%)
  const highNeeds = calculateBudget(200000, 70, 20, 10);
  assert.equal(highNeeds.valid, true);
  assert.equal(highNeeds.isHighEssentials, true);
});

test('calculateSafetyCushion bases calculation strictly on essential monthly expenses', () => {
  const res = calculateSafetyCushion(150000, 6);
  assert.equal(res.valid, true);
  assert.equal(res.totalTarget, 900000);
  assert.equal(res.months, 6);
  assert.ok(res.description.includes('900') && res.description.includes('тенге'));

  const invalid = calculateSafetyCushion(0, 3);
  assert.equal(invalid.valid, false);
});

test('compareProductPrices computes unit prices and finds cheaper item', () => {
  // 400g for 900 => 2250 / kg
  // 600g for 1260 => 2100 / kg
  const itemA = { name: 'Пакет 400г', weight: 400, price: 900 };
  const itemB = { name: 'Пакет 600г', weight: 600, price: 1260 };
  const res = compareProductPrices(itemA, itemB);
  assert.equal(res.valid, true);
  assert.equal(res.pricePerKgA, 2250);
  assert.equal(res.pricePerKgB, 2100);
  assert.equal(res.cheaperItem, 'B');
});

test('calculateDailyStreak handles consecutive days and streak freeze recovery', () => {
  // Same day
  assert.equal(calculateDailyStreak(5, '2026-10-21', '2026-10-21', false).newStreak, 5);

  // Next day consecutive
  assert.equal(calculateDailyStreak(5, '2026-10-20', '2026-10-21', false).newStreak, 6);

  // Missed 1 day with freeze
  const saved = calculateDailyStreak(5, '2026-10-19', '2026-10-21', true);
  assert.equal(saved.freezeUsed, true);
  assert.equal(saved.newStreak, 6);

  // Missed 1 day without freeze
  const lost = calculateDailyStreak(5, '2026-10-19', '2026-10-21', false);
  assert.equal(lost.isConsecutive, false);
  assert.equal(lost.newStreak, 1);
});

