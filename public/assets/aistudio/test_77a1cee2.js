// LifeSkill Comprehensive Test Suite
// Verifying all Acceptance Criteria from Section 14 of Technical Specification

const assert = require('assert');
const Core = require('./lifeskill-core.js');

let passedTests = 0;
let totalTests = 0;

function it(name, fn) {
  totalTests++;
  try {
    fn();
    passedTests++;
    console.log(`  [PASS] ${name}`);
  } catch (err) {
    console.error(`  [FAIL] ${name}`);
    console.error(err);
    process.exitCode = 1;
  }
}

console.log('=== LifeSkill Test Suite Running ===\n');

// 1. Расчёт рангов на границах 40/41, 100/101, 180/181 и 280/281
it('Criteria 1: Rank boundaries 40/41, 100/101, 180/181, 280/281', () => {
  assert.strictEqual(Core.getRankByScore(0).name, 'Птенец из гнезда');
  assert.strictEqual(Core.getRankByScore(40).name, 'Птенец из гнезда');
  assert.strictEqual(Core.getRankByScore(41).name, 'Выживальщик в однушке');
  assert.strictEqual(Core.getRankByScore(100).name, 'Выживальщик в однушке');
  assert.strictEqual(Core.getRankByScore(101).name, 'Укротитель квитанций ЖКХ');
  assert.strictEqual(Core.getRankByScore(180).name, 'Укротитель квитанций ЖКХ');
  assert.strictEqual(Core.getRankByScore(181).name, 'Магистр планирования');
  assert.strictEqual(Core.getRankByScore(280).name, 'Магистр планирования');
  assert.strictEqual(Core.getRankByScore(281).name, 'Гуру осознанной взрослости');
  assert.strictEqual(Core.getRankByScore(350).name, 'Гуру осознанной взрослости');
});

// 2 & 3. Начисление XP, монет и защита от повторной выдачи наград
it('Criteria 2 & 3: XP, coins award & protection against repeated farming', () => {
  const state = Core.getInitialState();
  const initialXP = state.xp;
  const initialCoins = state.coins;

  // First completion
  const res1 = Core.awardLessonCompletion(state, 'lesson_1', { discipline: 5, independence: 5, planning: 5, organization: 5 }, true);
  assert.strictEqual(res1.firstTime, true);
  assert.strictEqual(state.xp, initialXP + 25);
  assert.strictEqual(state.coins, initialCoins + 10);
  assert.strictEqual(state.passedLessons['lesson_1'], true);
  assert.strictEqual(state.stats.discipline, 10);

  // Repeated completion of same lesson
  const coinsAfterFirst = state.coins;
  const xpAfterFirst = state.xp;
  const res2 = Core.awardLessonCompletion(state, 'lesson_1', { discipline: 5, independence: 5, planning: 5, organization: 5 }, false);
  assert.strictEqual(res2.firstTime, false);
  assert.strictEqual(state.coins, coinsAfterFirst, 'Coins must not increase on repeat pass');
  assert.strictEqual(state.xp, xpAfterFirst + 5, 'Only modest +5 XP practice reward on repeat');
  assert.strictEqual(state.stats.discipline, 10, 'Stats must not farm on repeat');
});

// 4. Недопустимые значения финансового калькулятора
it('Criteria 4: Validation of financial calculator inputs', () => {
  // Invalid incomes
  assert.strictEqual(Core.calculateBudget(0, 50, 30, 20).valid, false);
  assert.strictEqual(Core.calculateBudget(-5000, 50, 30, 20).valid, false);
  assert.strictEqual(Core.calculateBudget('abc', 50, 30, 20).valid, false);

  // Invalid percentages summing != 100
  assert.strictEqual(Core.calculateBudget(200000, 50, 30, 30).valid, false);
  assert.strictEqual(Core.calculateBudget(200000, -10, 60, 50).valid, false);

  // Valid budget
  const validRes = Core.calculateBudget(300000, 50, 30, 20);
  assert.strictEqual(validRes.valid, true);
  assert.strictEqual(validRes.needsAmount, 150000);
  assert.strictEqual(validRes.wantsAmount, 90000);
  assert.strictEqual(validRes.savingsAmount, 60000);

  // Alternative advice when needs > 65%
  const tightRes = Core.calculateBudget(200000, 70, 20, 10);
  assert.strictEqual(tightRes.valid, true);
  assert.ok(tightRes.alternative, 'Must offer alternative advice for high essentials');
});

// 5. Расчёт подушки безопасности
it('Criteria 5: Safety cushion calculation separated from total income', () => {
  // Invalid inputs
  assert.strictEqual(Core.calculateSafetyCushion(-100, 3).valid, false);
  assert.strictEqual(Core.calculateSafetyCushion(100000, 0).valid, false);
  assert.strictEqual(Core.calculateSafetyCushion(100000, 45).valid, false);

  // Valid inputs: 150,000 monthly essentials for 6 months = 900,000
  const cushion = Core.calculateSafetyCushion(150000, 6);
  assert.strictEqual(cushion.valid, true);
  assert.strictEqual(cushion.totalTarget, 900000);
  assert.strictEqual(cushion.months, 6);
  assert.strictEqual(cushion.essentialMonthlyExpenses, 150000);
});

// 6. Матрица Эйзенхауэра
it('Criteria 6: Eisenhower Matrix CRUD and quadrant management', () => {
  const state = Core.getInitialState();
  const initialLen = state.eisenhowerTasks.length;

  // Add task
  const task = Core.addEisenhowerTask(state, 'Подать показания счётчиков', 1);
  assert.ok(task);
  assert.strictEqual(task.text, 'Подать показания счётчиков');
  assert.strictEqual(task.quadrant, 1);
  assert.strictEqual(task.done, false);
  assert.strictEqual(state.eisenhowerTasks.length, initialLen + 1);

  // Move task to quadrant 2
  const moved = Core.moveEisenhowerTask(state, task.id, 2);
  assert.strictEqual(moved, true);
  assert.strictEqual(task.quadrant, 2);

  // Toggle done
  Core.toggleEisenhowerTask(state, task.id);
  assert.strictEqual(task.done, true);

  // Delete task
  const deleted = Core.deleteEisenhowerTask(state, task.id);
  assert.strictEqual(deleted, true);
  assert.strictEqual(state.eisenhowerTasks.length, initialLen);
});

// 7. Покупка и повторная покупка предметов гардероба
it('Criteria 7: Wardrobe item purchase & double-purchase protection', () => {
  const state = Core.getInitialState();
  state.coins = 50;

  const item = { id: 'focus_glasses', name: 'Очки внимательности', cost: 40 };

  // First purchase
  const p1 = Core.purchaseShopItem(state, item);
  assert.strictEqual(p1.success, true);
  assert.strictEqual(state.coins, 10);
  assert.ok(state.ownedItems.includes('focus_glasses'));

  // Repeat purchase attempt
  const p2 = Core.purchaseShopItem(state, item);
  assert.strictEqual(p2.success, false);
  assert.strictEqual(state.coins, 10, 'Must not deduct coins again');

  // Insufficient funds attempt
  const expensiveItem = { id: 'gold_crown', name: 'Корона', cost: 100 };
  const p3 = Core.purchaseShopItem(state, expensiveItem);
  assert.strictEqual(p3.success, false);
  assert.strictEqual(state.coins, 10, 'Coins must not go negative');
});

// 8 & 10. Сохранение, валидация и восстановление после повреждения
it('Criteria 8 & 10: State validation, recovery from corrupted data', () => {
  assert.strictEqual(Core.validateSaveState(null), false);
  assert.strictEqual(Core.validateSaveState({}), false);
  assert.strictEqual(Core.validateSaveState({ v: 3, xp: -10 }), false);
  assert.strictEqual(Core.validateSaveState({ v: 3, xp: 50, coins: 10, hearts: 5, passedLessons: {} }), true);

  // Corrupted data migration fallback
  const corrupted = { junk: 'data', corrupted: true };
  const recovered = Core.migrateSaveState(corrupted);
  assert.strictEqual(recovered.v, 3);
  assert.strictEqual(recovered.xp, 0);
  assert.strictEqual(recovered.coins, 30);
  assert.strictEqual(recovered.hearts, 5);

  // v2 migration to v3
  const v2data = {
    v: 2,
    xp: 120,
    coins: 45,
    hearts: 4,
    streak: 3,
    passed: { '0': true, '1': true },
    notes: ['My star note']
  };
  const migrated = Core.migrateSaveState(v2data);
  assert.strictEqual(migrated.v, 3);
  assert.strictEqual(migrated.xp, 120);
  assert.strictEqual(migrated.coins, 45);
  assert.ok(migrated.passedLessons['0']);
});

// 9 & 12. Режим без давления и управление энергией/сердечками
it('Criteria 9 & 12: No-pressure mode & heart loss prevention', () => {
  const state = Core.getInitialState();
  state.hearts = 5;

  // Standard mode: mistakes cost 1 heart
  state.noPressure = false;
  Core.applyHeartLoss(state);
  assert.strictEqual(state.hearts, 4);

  // No-pressure mode: mistakes do NOT cost hearts
  state.noPressure = true;
  Core.applyHeartLoss(state);
  assert.strictEqual(state.hearts, 4, 'Hearts must not decrease in no-pressure mode');

  // Heart cannot go negative
  state.noPressure = false;
  state.hearts = 0;
  Core.applyHeartLoss(state);
  assert.strictEqual(state.hearts, 0);
});

// 11. Умные покупки: сравнение цены за кг (400 г за 900 vs 600 г за 1260)
it('Criteria 11: Price comparison calculation per 1 kg', () => {
  const itemA = { name: 'Пачка 400 г', weight: 400, price: 900 };
  const itemB = { name: 'Пачка 600 г', weight: 600, price: 1260 };

  const comp = Core.compareProductPrices(itemA, itemB);
  assert.strictEqual(comp.valid, true);
  // 900 / 400 * 1000 = 2250 ₸ / kg
  // 1260 / 600 * 1000 = 2100 ₸ / kg -> item B is cheaper
  assert.strictEqual(comp.pricePerKgA, 2250);
  assert.strictEqual(comp.pricePerKgB, 2100);
  assert.strictEqual(comp.cheaperItem, 'B');
});

// 12. Shopping List calculations
it('Criteria 12: Shopping list budget calculation and over-budget alert', () => {
  const items = [
    { name: 'Товар 1', qty: 2, unitPrice: 1000, done: true },  // 2000
    { name: 'Товар 2', qty: 1, unitPrice: 3500, done: false } // 3500
  ];
  // Total = 5500, budgetLimit = 5000 -> Over budget by 500
  const totals = Core.calculateShoppingTotals(items, 5000);
  assert.strictEqual(totals.total, 5500);
  assert.strictEqual(totals.boughtTotal, 2000);
  assert.strictEqual(totals.isOverBudget, true);
  assert.strictEqual(totals.diff, 500);
});

// 13. Прохождение всех 6 направлений обучения
it('Criteria 13: Full completion of all 6 learning tracks and Guru rank', () => {
  const Data = require('./lifeskill-data.js');
  assert.strictEqual(Data.WORLDS.length, 6, 'Must have exactly 6 learning tracks');
  assert.strictEqual(Data.LESSONS.length, 54, 'Must have 54 structured lessons (8 per track + 1 boss test each)');

  const state = Core.getInitialState();

  // Complete each track
  for (let w = 0; w < 6; w++) {
    const trackLessons = Data.LESSONS.filter(l => l.w === w);
    assert.strictEqual(trackLessons.length, 9, `Track ${w} must have 9 lessons`);
    trackLessons.forEach(l => {
      assert.ok(l.t, 'Lesson must have title');
      assert.ok(l.theory, 'Lesson must have theory');
      assert.ok(l.example, 'Lesson must have example');
      assert.ok(l.q, 'Lesson must have question');
      assert.ok(Array.isArray(l.a) && l.a.length >= 3, 'Lesson must have at least 3 choices');
      assert.ok(Array.isArray(l.hints) && l.hints.length === 3, 'Lesson must have 3-level hints');
      assert.strictEqual(typeof l.c, 'number', 'Lesson must have correct answer index');

      // Complete lesson
      Core.awardLessonCompletion(state, l.id, l.skills, true);
    });
  }

  // Check that all 54 lessons are marked passed
  assert.strictEqual(Object.keys(state.passedLessons).length, 54);

  // Check stats and final rank
  const totalScore = Core.calculateTotalSkillScore(state.stats);
  assert.ok(totalScore >= 281, `Total skill score must exceed 281 (got ${totalScore})`);
  const finalRank = Core.getRankByScore(totalScore);
  assert.strictEqual(finalRank.name, 'Гуру осознанной взрослости');
});

// 14. Проверка логики ответов и защита от ложного начисления
it('Criteria 14: Answer evaluation and reward eligibility protection', () => {
  const sampleQuestion = {
    id: 'test-q1',
    question: 'Как снизить риск импульсивной покупки?',
    options: [
      { id: 'opt_wait', text: 'Отложить покупку на 48 часов' },
      { id: 'opt_buy', text: 'Купить немедленно из-за скидки' },
      { id: 'opt_borrow', text: 'Занять деньги ради покупки' }
    ],
    correctOptionId: 'opt_wait',
    explanation: 'Пауза помогает оценить реальную необходимость.'
  };

  // Correct answer recognized
  const resCorrect = Core.evaluateAnswer(sampleQuestion, 'opt_wait');
  assert.strictEqual(resCorrect.status, 'correct');
  assert.strictEqual(resCorrect.isCorrect, true);

  // Incorrect answer NOT counted as correct
  const resIncorrect = Core.evaluateAnswer(sampleQuestion, 'opt_buy');
  assert.strictEqual(resIncorrect.status, 'incorrect');
  assert.strictEqual(resIncorrect.isCorrect, false);

  // Empty answer fails
  const resEmpty = Core.evaluateAnswer(sampleQuestion, '');
  assert.strictEqual(resEmpty.status, 'unanswered');
  assert.strictEqual(resEmpty.isCorrect, false);

  // Non-existent option ID fails
  const resNonExistent = Core.evaluateAnswer(sampleQuestion, 'opt_ghost');
  assert.strictEqual(resNonExistent.status, 'error');
  assert.strictEqual(resNonExistent.isCorrect, false);

  // Missing correctOptionId raises diagnostic error
  const brokenQuestion = { id: 'broken', options: [{ id: 'a', text: 'A' }] };
  const resBroken = Core.evaluateAnswer(brokenQuestion, 'a');
  assert.strictEqual(resBroken.status, 'error');
  assert.strictEqual(resBroken.isCorrect, false);
});

// 15. Защита начисления наград: незавершенный урок, ошибки, защита от двойного клика
it('Criteria 15: Reward protection on incomplete run, incorrect answers and double click', () => {
  const state = Core.getInitialState();
  const startXP = state.xp;
  const startCoins = state.coins;

  // 1. Incomplete run must NOT award
  const incompleteRun = {
    lessonId: 'lesson_test',
    completed: false,
    eligibleForReward: true,
    rewardClaimed: false
  };
  const resIncomplete = Core.awardLessonReward(incompleteRun, state);
  assert.strictEqual(resIncomplete.success, false);
  assert.strictEqual(state.xp, startXP);
  assert.strictEqual(state.coins, startCoins);
  assert.strictEqual(state.passedLessons['lesson_test'], undefined);

  // 2. Incorrect answers (not eligible) must NOT award
  const incorrectRun = {
    lessonId: 'lesson_test',
    completed: true,
    eligibleForReward: false,
    rewardClaimed: false
  };
  const resIncorrect = Core.awardLessonReward(incorrectRun, state);
  assert.strictEqual(resIncorrect.success, false);
  assert.strictEqual(state.xp, startXP);
  assert.strictEqual(state.coins, startCoins);
  assert.strictEqual(state.passedLessons['lesson_test'], undefined);

  // 3. Valid first completion awards properly
  const validRun = {
    lessonId: 'lesson_test',
    completed: true,
    eligibleForReward: true,
    rewardClaimed: false,
    skillPoints: { discipline: 3, planning: 2 },
    rewardXP: 25,
    rewardCoins: 10
  };
  const resValid = Core.awardLessonReward(validRun, state);
  assert.strictEqual(resValid.success, true);
  assert.strictEqual(validRun.rewardClaimed, true);
  assert.strictEqual(state.xp, startXP + 25);
  assert.strictEqual(state.coins, startCoins + 10);
  assert.strictEqual(state.passedLessons['lesson_test'], true);

  // 4. Double-click / repeat claim on same run must NOT award again
  const resDoubleClick = Core.awardLessonReward(validRun, state);
  assert.strictEqual(resDoubleClick.success, false);
  assert.strictEqual(state.xp, startXP + 25);
  assert.strictEqual(state.coins, startCoins + 10);
});

// 16. Защита после перезагрузки и повторное прохождение урока
it('Criteria 16: Persistence after reload and repeat completion rules', () => {
  const state = Core.getInitialState();
  const run1 = {
    lessonId: 'lesson_repeat',
    completed: true,
    eligibleForReward: true,
    rewardClaimed: false,
    rewardXP: 25,
    rewardCoins: 10
  };
  Core.awardLessonReward(run1, state);
  assert.strictEqual(state.xp, 25);
  assert.strictEqual(state.coins, 40);
  assert.strictEqual(state.passedLessons['lesson_repeat'], true);

  // Simulate serialization to localStorage and reload
  const serialized = JSON.stringify(state);
  const reloadedState = Core.migrateSaveState(JSON.parse(serialized));
  assert.strictEqual(reloadedState.xp, 25);
  assert.strictEqual(reloadedState.coins, 40);
  assert.strictEqual(reloadedState.passedLessons['lesson_repeat'], true);

  // Second run on already passed lesson after reload
  const run2 = {
    lessonId: 'lesson_repeat',
    completed: true,
    eligibleForReward: true,
    rewardClaimed: false,
    rewardXP: 25,
    rewardCoins: 10
  };
  const resRepeat = Core.awardLessonReward(run2, reloadedState);
  assert.strictEqual(resRepeat.success, true);
  assert.strictEqual(resRepeat.firstTime, false);
  assert.strictEqual(resRepeat.xpGained, 5, 'Repeat completion grants only modest +5 XP');
  assert.strictEqual(resRepeat.coinsGained, 0, 'Repeat completion grants 0 coins');
  assert.strictEqual(reloadedState.xp, 30);
  assert.strictEqual(reloadedState.coins, 40, 'Coins must not farm on repeat pass');
});

it('Three-attempt runs persist, exhaust honestly, and cannot farm rewards', () => {
  const state = Core.getInitialState();
  const question = {
    id: 'attempt-q1',
    options: [{ id: 'right', text: 'Correct option' }, { id: 'wrong', text: 'Wrong option' }],
    correctOptionId: 'right',
    explanation: 'Principle explanation'
  };
  const run = Core.createLessonRun(state, 'attempt-lesson', question.id);

  const first = Core.submitLessonAnswer(run, question, 'wrong');
  assert.strictEqual(first.status, 'incorrect');
  assert.strictEqual(first.attemptsUsed, 1);
  assert.strictEqual(run.result.correctOptionId, undefined);
  assert.ok(Core.getAttemptHint({ hints: ['First principle', 'Mini lesson'], options: question.options, correctOptionId: 'right' }, 1));

  const reloaded = Core.migrateSaveState(JSON.parse(JSON.stringify(state)));
  const resumed = Core.createLessonRun(reloaded, 'attempt-lesson', question.id);
  assert.strictEqual(resumed.id, run.id);
  assert.strictEqual(resumed.attemptsUsed, 1);

  const second = Core.submitLessonAnswer(resumed, question, 'wrong');
  assert.strictEqual(second.status, 'incorrect');
  assert.strictEqual(second.attemptsUsed, 2);
  const third = Core.submitLessonAnswer(resumed, question, 'wrong');
  assert.strictEqual(third.status, 'exhausted');
  assert.strictEqual(third.attemptsRemaining, 0);
  assert.strictEqual(Core.submitLessonAnswer(resumed, question, 'right').accepted, false);

  resumed.completed = true;
  resumed.eligibleForReward = true;
  assert.strictEqual(Core.awardLessonReward(resumed, reloaded).success, false);
  assert.strictEqual(reloaded.xp, 0);

  const retry = Core.restartLessonRun(reloaded, 'attempt-lesson', question.id);
  assert.strictEqual(Core.submitLessonAnswer(retry, question, 'right').status, 'correct');
  retry.completed = true;
  retry.eligibleForReward = true;
  assert.strictEqual(Core.awardLessonReward(retry, reloaded).success, true);
  assert.strictEqual(Core.awardLessonReward(retry, reloaded).success, false);

  const repeat = Core.restartLessonRun(reloaded, 'attempt-lesson', question.id);
  Core.submitLessonAnswer(repeat, question, 'right');
  repeat.completed = true;
  repeat.eligibleForReward = true;
  assert.strictEqual(Core.awardLessonReward(repeat, reloaded).xpGained, 5);
  const laterRepeat = Core.restartLessonRun(reloaded, 'attempt-lesson', question.id);
  Core.submitLessonAnswer(laterRepeat, question, 'right');
  laterRepeat.completed = true;
  laterRepeat.eligibleForReward = true;
  assert.strictEqual(Core.awardLessonReward(laterRepeat, reloaded).xpGained, 0);
});

it('Profile settings validate safely without changing game progress', () => {
  const state = Core.getInitialState();
  state.xp = 240;
  state.coins = 81;
  state.hearts = 2;
  state.passedLessons.lesson_a = true;
  state.achievements.first_lesson = true;
  const progress = JSON.stringify({ xp: state.xp, coins: state.coins, hearts: state.hearts, passed: state.passedLessons, achievements: state.achievements });
  const profile = {
    name: '  Мой ник  ',
    description: 'Учусь планировать',
    cardStyle: 'soft',
    theme: 'ocean-blue',
    avatar: { base: '🧑‍🎓', color: '#0284C7' },
    equippedItems: { clothes: 'casual', accessory: 'none', companion: 'none' }
  };

  assert.strictEqual(Core.applyProfileSettings(state, profile).success, true);
  assert.strictEqual(state.name, 'Мой ник');
  assert.strictEqual(state.theme, 'ocean-blue');
  assert.strictEqual(JSON.stringify({ xp: state.xp, coins: state.coins, hearts: state.hearts, passed: state.passedLessons, achievements: state.achievements }), progress);
  assert.strictEqual(Core.applyProfileSettings(state, Object.assign({}, profile, { name: '   ' })).success, false);
  assert.strictEqual(Core.applyProfileSettings(state, Object.assign({}, profile, { equippedItems: { clothes: 'suit_interview', accessory: 'none', companion: 'none' } })).success, false);

  state.ownedItems.push('suit_interview');
  assert.strictEqual(Core.applyProfileSettings(state, Object.assign({}, profile, { equippedItems: { clothes: 'suit_interview', accessory: 'none', companion: 'none' } })).success, true);
  assert.strictEqual(Core.normalizeTheme('dark'), 'midnight');
  assert.strictEqual(Core.normalizeTheme('system'), 'fresh-mint');
  assert.strictEqual(Core.normalizeTheme('unrecognized'), 'fresh-mint');
  Core.THEME_IDS.forEach(theme => assert.strictEqual(Core.normalizeTheme(theme), theme));

  const reloaded = Core.migrateSaveState(JSON.parse(JSON.stringify(state)));
  assert.strictEqual(reloaded.avatar.base, '🧑‍🎓');
  assert.strictEqual(reloaded.theme, 'ocean-blue');
  assert.strictEqual(reloaded.coins, 81);
});

console.log(`\n=== All ${passedTests}/${totalTests} Tests Passed Successfully! ===`);

