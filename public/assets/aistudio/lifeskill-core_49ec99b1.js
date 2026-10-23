// LifeSkill Core Logic Engine
// Pure business logic, calculations, game mechanics, and state management

(function(root, factory) {
  if (typeof exports === 'object' && typeof module !== 'undefined') {
    module.exports = factory();
  } else {
    root.LifeSkillCore = factory();
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function() {
  'use strict';

  var STORAGE_KEY = 'lifeskill-v3';
  var BACKUP_KEY = 'lifeskill-v3-backup';
  var lessonRunSequence = 0;
  var THEME_IDS = ['fresh-mint', 'light-classic', 'midnight', 'ocean-blue', 'lavender-dream', 'sunset'];
  var PROFILE_ITEMS = {
    clothes: ['suit_interview', 'cardigan_focus'],
    accessory: ['glasses_vision', 'thermo_cup', 'crown_maturity'],
    companion: ['cat_barsik', 'robot_vacuum', 'plant_monstera']
  };

  function normalizeTheme(theme) {
    if (theme === 'dark') return 'midnight';
    if (theme === 'light' || theme === 'system') return 'fresh-mint';
    return THEME_IDS.indexOf(theme) !== -1 ? theme : 'fresh-mint';
  }

  var RANKS = [
    { min: 0, max: 40, name: 'Птенец из гнезда', reward: 'Стартовый набор самостоятельности', icon: '🐣' },
    { min: 41, max: 100, name: 'Выживальщик в однушке', reward: 'Термокружка фокуса (+10 ЛайфКоинов)', icon: '📦' },
    { min: 101, max: 180, name: 'Укротитель квитанций ЖКХ', reward: 'Очки внимательности (+20 ЛайфКоинов)', icon: '🧾' },
    { min: 181, max: 280, name: 'Магистр планирования', reward: 'Кардиган фокуса (+35 ЛайфКоинов)', icon: '📅' },
    { min: 281, max: Infinity, name: 'Гуру осознанной взрослости', reward: 'Корона зрелости (+50 ЛайфКоинов)', icon: '👑' }
  ];

  function getRankByScore(score) {
    var val = typeof score === 'number' && Number.isFinite(score) ? Math.max(0, Math.floor(score)) : 0;
    for (var i = 0; i < RANKS.length; i++) {
      if (val >= RANKS[i].min && val <= RANKS[i].max) {
        return RANKS[i];
      }
    }
    return RANKS[RANKS.length - 1];
  }

  function getLevelByXP(xp) {
    var val = typeof xp === 'number' && Number.isFinite(xp) ? Math.max(0, Math.floor(xp)) : 0;
    return Math.floor(val / 100) + 1;
  }

  function getXPToNextLevel(xp) {
    var val = typeof xp === 'number' && Number.isFinite(xp) ? Math.max(0, Math.floor(xp)) : 0;
    return val % 100;
  }

  function getInitialState() {
    return {
      v: 3,
      theme: 'fresh-mint',
      page: 'home',    // 'home' | 'learn' | 'tools' | 'character' | 'profile'
      name: 'Новый исследователь',
      profileDescription: '',
      profileCardStyle: 'standard',
      reducedMotion: false,
      avatar: {
        base: '🧑',
        hair: 'short',
        clothes: 'casual',
        accessory: 'none',
        companion: 'none',
        color: '#A78BFA'
      },
      xp: 0,
      coins: 30,
      hearts: 5,
      maxHearts: 5,
      streak: 0,
      lastActiveDate: '',
      noPressure: false,
      soundEnabled: true,
      remindersEnabled: true,
      stats: {
        discipline: 5,
        independence: 5,
        planning: 5,
        organization: 5
      },
      statsHistory: [],
      passedLessons: {},
      lessonRuns: {},
      activeLessonRuns: {},
      rewardedRuns: {},
      repeatRewardClaimed: {},
      reviewMistakes: {}, // { [lessonId]: { mistakeCount: number, lastAttemptDate: string } }
      dailyMissions: {
        date: '',
        lessonDone: false,
        toolUsed: false,
        weekDone: false,
        claimed: false
      },
      firstWeek: {
        currentDay: 1,
        completedDays: {}
      },
      monthSimulation: {
        day: 1,
        maxDays: 30,
        money: 180000,
        energy: 100,
        stress: 20,
        completed: false,
        history: []
      },
      eisenhowerTasks: [
        { id: 1, text: 'Оплатить счета за интернет и свет', quadrant: 1, done: false, date: '' },
        { id: 2, text: 'Составить меню и список покупок на неделю', quadrant: 2, done: false, date: '' },
        { id: 3, text: 'Ответить на несрочное сообщение в соцсетях', quadrant: 3, done: false, date: '' },
        { id: 4, text: 'Бесцельный просмотр ленты перед сном', quadrant: 4, done: false, date: '' }
      ],
      shoppingList: [
        { id: 1, name: 'Овсяные хлопья (1 кг)', qty: 1, unitPrice: 650, done: false },
        { id: 2, name: 'Яйца (10 шт)', qty: 1, unitPrice: 750, done: false },
        { id: 3, name: 'Молоко (1 л)', qty: 2, unitPrice: 480, done: false }
      ],
      shoppingBudget: 5000,
      budgetPlan: {
        income: 250000,
        needsPercent: 50,
        wantsPercent: 30,
        savingsPercent: 20
      },
      starNotes: [],
      ownedItems: ['item_basic_badge'],
      equippedItems: {
        clothes: 'casual',
        accessory: 'none',
        companion: 'none'
      },
      achievements: {},
      chatMessages: []
    };
  }

  function validateSaveState(data) {
    if (!data || typeof data !== 'object') return false;
    if (data.v !== 3 && data.v !== 2) return false;
    if (typeof data.xp !== 'number' || !Number.isFinite(data.xp) || data.xp < 0) return false;
    if (typeof data.coins !== 'number' || !Number.isFinite(data.coins) || data.coins < 0) return false;
    if (typeof data.hearts !== 'number' || !Number.isFinite(data.hearts)) return false;
    if (!data.passedLessons && !data.passed) return false;
    return true;
  }

  function migrateSaveState(raw) {
    var initial = getInitialState();
    if (!raw || typeof raw !== 'object') return initial;

    // Migrate from v2
    if (raw.v === 2) {
      var migrated = Object.assign({}, initial, {
        name: typeof raw.name === 'string' && raw.name ? raw.name : initial.name,
        xp: typeof raw.xp === 'number' ? Math.max(0, raw.xp) : 0,
        coins: typeof raw.coins === 'number' ? Math.max(0, raw.coins) : 30,
        hearts: typeof raw.hearts === 'number' ? Math.max(0, Math.min(5, raw.hearts)) : 5,
        streak: typeof raw.streak === 'number' ? Math.max(0, raw.streak) : 0,
        theme: normalizeTheme(raw.theme),
        passedLessons: raw.passed || {},
        ownedItems: Array.isArray(raw.owned) ? raw.owned.slice() : ['item_basic_badge'],
        starNotes: Array.isArray(raw.notes) ? raw.notes.map(function(n) {
          return typeof n === 'string' ? { situation: n, task: '', action: '', result: '', combined: n, date: '' } : n;
        }) : []
      });
      // Give initial stats based on lessons
      var passedCount = Object.keys(migrated.passedLessons).filter(function(k) { return migrated.passedLessons[k]; }).length;
      migrated.stats = {
        discipline: 5 + Math.floor(passedCount * 2),
        independence: 5 + Math.floor(passedCount * 2.5),
        planning: 5 + Math.floor(passedCount * 2),
        organization: 5 + Math.floor(passedCount * 1.5)
      };
      migrated.v = 3;
      return migrated;
    }

    // Merge v3 cleanly
    var merged = Object.assign({}, initial, raw);
    merged.theme = normalizeTheme(raw.theme);
    merged.name = typeof raw.name === 'string' && raw.name.trim() ? raw.name.trim().slice(0, 30) : initial.name;
    merged.profileDescription = typeof raw.profileDescription === 'string' ? raw.profileDescription.slice(0, 160) : '';
    merged.profileCardStyle = ['standard', 'soft', 'outlined'].indexOf(raw.profileCardStyle) !== -1 ? raw.profileCardStyle : 'standard';
    merged.reducedMotion = raw.reducedMotion === true;
    merged.stats = Object.assign({}, initial.stats, raw.stats || {});
    merged.avatar = Object.assign({}, initial.avatar, raw.avatar || {});
    if (!/^#[0-9A-Fa-f]{6}$/.test(merged.avatar.color || '')) merged.avatar.color = initial.avatar.color;
    merged.budgetPlan = Object.assign({}, initial.budgetPlan, raw.budgetPlan || {});
    merged.firstWeek = Object.assign({}, initial.firstWeek, raw.firstWeek || {});
    merged.monthSimulation = Object.assign({}, initial.monthSimulation, raw.monthSimulation || {});
    merged.dailyMissions = Object.assign({}, initial.dailyMissions, raw.dailyMissions || {});
    merged.equippedItems = Object.assign({}, initial.equippedItems, raw.equippedItems || {});
    merged.eisenhowerTasks = Array.isArray(raw.eisenhowerTasks) ? raw.eisenhowerTasks : initial.eisenhowerTasks;
    merged.shoppingList = Array.isArray(raw.shoppingList) ? raw.shoppingList : initial.shoppingList;
    merged.ownedItems = Array.isArray(raw.ownedItems) ? raw.ownedItems : initial.ownedItems;
    merged.starNotes = Array.isArray(raw.starNotes) ? raw.starNotes : initial.starNotes;
    merged.reviewMistakes = raw.reviewMistakes && typeof raw.reviewMistakes === 'object' ? raw.reviewMistakes : {};
    merged.lessonRuns = raw.lessonRuns && typeof raw.lessonRuns === 'object' ? raw.lessonRuns : {};
    merged.activeLessonRuns = raw.activeLessonRuns && typeof raw.activeLessonRuns === 'object' ? raw.activeLessonRuns : {};
    merged.rewardedRuns = raw.rewardedRuns && typeof raw.rewardedRuns === 'object' ? raw.rewardedRuns : {};
    merged.repeatRewardClaimed = raw.repeatRewardClaimed && typeof raw.repeatRewardClaimed === 'object' ? raw.repeatRewardClaimed : {};
    return merged;
  }

  function applyProfileSettings(state, profile) {
    if (!state || !profile || typeof profile !== 'object') {
      return { success: false, error: 'Не удалось прочитать данные профиля.' };
    }
    var name = typeof profile.name === 'string' ? profile.name.trim() : '';
    var description = typeof profile.description === 'string' ? profile.description.trim() : '';
    if (!name) return { success: false, error: 'Укажи имя или игровой псевдоним.' };
    if (name.length > 30) return { success: false, error: 'Имя должно быть не длиннее 30 символов.' };
    if (description.length > 160) return { success: false, error: 'Описание должно быть не длиннее 160 символов.' };

    var avatar = profile.avatar && typeof profile.avatar === 'object' ? profile.avatar : {};
    var bases = ['🧑', '👩', '👨', '🧑‍🎓', '🧑‍💻'];
    if (bases.indexOf(avatar.base) === -1) return { success: false, error: 'Выбран неизвестный вариант аватара.' };
    if (!/^#[0-9A-Fa-f]{6}$/.test(avatar.color || '')) return { success: false, error: 'Выбери цвет из доступной палитры.' };
    if (['standard', 'soft', 'outlined'].indexOf(profile.cardStyle) === -1) {
      return { success: false, error: 'Выбран неизвестный стиль карточки.' };
    }

    var equipped = profile.equippedItems && typeof profile.equippedItems === 'object' ? profile.equippedItems : {};
    var nextEquipped = Object.assign({}, state.equippedItems);
    var owned = Array.isArray(state.ownedItems) ? state.ownedItems : [];
    var types = ['clothes', 'accessory', 'companion'];
    for (var i = 0; i < types.length; i++) {
      var type = types[i];
      var itemId = equipped[type];
      if (type === 'clothes' && itemId === 'casual') {
        nextEquipped[type] = itemId;
      } else if ((type !== 'clothes' && itemId === 'none') || (PROFILE_ITEMS[type].indexOf(itemId) !== -1 && owned.indexOf(itemId) !== -1)) {
        nextEquipped[type] = itemId;
      } else {
        return { success: false, error: 'Предмет «' + String(itemId || '') + '» не куплен или недоступен.' };
      }
    }

    state.name = name;
    state.profileDescription = description;
    state.profileCardStyle = profile.cardStyle;
    state.avatar = Object.assign({}, state.avatar, { base: avatar.base, color: avatar.color });
    state.equippedItems = nextEquipped;
    state.theme = normalizeTheme(profile.theme);
    return { success: true };
  }

  function calculateTotalSkillScore(stats) {
    if (!stats || typeof stats !== 'object') return 20;
    var d = Math.max(0, stats.discipline || 0);
    var i = Math.max(0, stats.independence || 0);
    var p = Math.max(0, stats.planning || 0);
    var o = Math.max(0, stats.organization || 0);
    return Math.floor(d + i + p + o);
  }

  function evaluateAnswer(question, selectedOptionId) {
    if (!question || typeof question !== 'object') {
      return { status: 'error', isCorrect: false, error: 'Структура вопроса повреждена.' };
    }
    if (!question.correctOptionId || typeof question.correctOptionId !== 'string') {
      return { status: 'error', isCorrect: false, error: 'Отсутствует correctOptionId в вопросе.' };
    }
    if (!Array.isArray(question.options) || question.options.length === 0) {
      return { status: 'error', isCorrect: false, error: 'Отсутствуют варианты ответов в вопросе.' };
    }
    var correctOptionExists = question.options.some(function(opt) { return opt && opt.id === question.correctOptionId; });
    if (!correctOptionExists) {
      return { status: 'error', isCorrect: false, error: 'Правильный вариант не найден в вопросе.' };
    }
    if (!selectedOptionId || typeof selectedOptionId !== 'string') {
      return { status: 'unanswered', isCorrect: false, error: 'Ответ не выбран.' };
    }
    var exists = question.options.some(function(opt) { return opt && opt.id === selectedOptionId; });
    if (!exists) {
      return { status: 'error', isCorrect: false, error: 'Выбранный вариант не найден в вопросе.' };
    }
    var isCorrect = (selectedOptionId === question.correctOptionId);
    return {
      status: isCorrect ? 'correct' : 'incorrect',
      isCorrect: isCorrect,
      selectedOptionId: selectedOptionId,
      correctOptionId: question.correctOptionId,
      explanation: question.explanation || question.tip || ''
    };
  }

  function createLessonRun(state, lessonId, questionId) {
    if (!state || !lessonId || !questionId) return null;
    state.lessonRuns = state.lessonRuns || {};
    state.activeLessonRuns = state.activeLessonRuns || {};
    var activeId = state.activeLessonRuns[lessonId];
    var activeRun = activeId && state.lessonRuns[activeId];
    if (activeRun && activeRun.status !== 'completed') return activeRun;

    var runId;
    do {
      lessonRunSequence++;
      runId = 'run_' + Date.now().toString(36) + '_' + lessonRunSequence.toString(36);
    } while (state.lessonRuns[runId]);
    var run = {
      id: runId,
      lessonId: lessonId,
      questionId: questionId,
      selectedOptionId: null,
      attemptsUsed: 0,
      status: 'unanswered',
      result: null,
      hintLevel: 0,
      completed: false,
      eligibleForReward: false,
      rewardClaimed: false,
      createdAt: new Date().toISOString()
    };
    state.lessonRuns[runId] = run;
    state.activeLessonRuns[lessonId] = runId;
    return run;
  }

  function restartLessonRun(state, lessonId, questionId) {
    if (!state) return null;
    state.activeLessonRuns = state.activeLessonRuns || {};
    delete state.activeLessonRuns[lessonId];
    return createLessonRun(state, lessonId, questionId);
  }

  function submitLessonAnswer(run, question, selectedOptionId) {
    if (!run || (run.status !== 'unanswered' && run.status !== 'incorrect') || run.attemptsUsed >= 3) {
      return { accepted: false, reason: 'Попытка уже проверена или завершена.' };
    }
    if (!question || run.questionId !== question.id) {
      return { accepted: false, reason: 'ID вопроса не соответствует текущему прохождению.' };
    }
    var evaluation = evaluateAnswer(question, selectedOptionId);
    if (evaluation.status === 'unanswered' || evaluation.status === 'error') {
      return { accepted: false, reason: evaluation.error, evaluation: evaluation };
    }

    run.attemptsUsed++;
    run.selectedOptionId = selectedOptionId;
    run.hintLevel = Math.max(run.hintLevel || 0, Math.min(run.attemptsUsed, 3));
    run.result = { isCorrect: evaluation.isCorrect, status: evaluation.status };
    run.status = evaluation.isCorrect ? 'correct' : run.attemptsUsed >= 3 ? 'exhausted' : 'incorrect';
    run.completed = false;
    run.eligibleForReward = false;
    return {
      accepted: true,
      isCorrect: evaluation.isCorrect,
      status: run.status,
      attemptsUsed: run.attemptsUsed,
      attemptsRemaining: 3 - run.attemptsUsed,
      hintLevel: run.hintLevel,
      explanation: evaluation.isCorrect ? evaluation.explanation : ''
    };
  }

  function getAttemptHint(lesson, level) {
    if (!lesson || (level !== 1 && level !== 2)) return '';
    var candidate = Array.isArray(lesson.hints) ? lesson.hints[level - 1] : '';
    var correctOption = Array.isArray(lesson.options) && lesson.options.find(function(opt) {
      return opt && opt.id === lesson.correctOptionId;
    });
    if (candidate && correctOption && correctOption.text) {
      var hintText = String(candidate).toLocaleLowerCase('ru-RU');
      var answerText = String(correctOption.text).toLocaleLowerCase('ru-RU').trim();
      if (answerText && (hintText.indexOf(answerText) !== -1 || answerText.indexOf(hintText.replace(/^подсказка:\s*/i, '').trim()) !== -1)) {
        candidate = '';
      }
    }
    if (candidate) return candidate;
    return level === 1
      ? 'Вернись к теории и выдели принцип, который помогает решить ситуацию. Сравни последствия вариантов, не торопясь выбирать.'
      : 'Мини-урок: сначала определи цель и ограничения ситуации, затем оцени долгосрочные последствия каждого решения. Ищи устойчивый принцип, а не самый быстрый выход.';
  }

  function awardLessonReward(run, state) {
    if (!run || typeof run !== 'object') {
      return { success: false, reason: 'Неверные данные прохода урока.' };
    }
    if (!run.completed || !run.eligibleForReward) {
      return { success: false, reason: 'Нет условий для выдачи награды (урок не завершён или пройден с ошибками).' };
    }
    if (run.id && (run.status !== 'correct' || !run.result || run.result.isCorrect !== true)) {
      return { success: false, reason: 'Проход не завершён правильным ответом.' };
    }
    state.rewardedRuns = state.rewardedRuns || {};
    state.repeatRewardClaimed = state.repeatRewardClaimed || {};
    if (run.rewardClaimed || (run.id && state.rewardedRuns[run.id])) {
      return { success: false, reason: 'Награда за этот проход уже получена.' };
    }
    if (!state) return { success: false, reason: 'Отсутствует состояние игрока.' };

    run.rewardClaimed = true;
    if (run.id) state.rewardedRuns[run.id] = true;

    var isFirstTime = !state.passedLessons[run.lessonId];
    var repeatXP = !run.id || !state.repeatRewardClaimed[run.lessonId] ? 5 : 0;
    if (!isFirstTime && repeatXP) state.repeatRewardClaimed[run.lessonId] = true;
    var res = {
      success: true,
      firstTime: isFirstTime,
      xpGained: isFirstTime ? (run.rewardXP || 25) : repeatXP,
      coinsGained: isFirstTime ? (run.rewardCoins || 10) : 0,
      skillsGained: {},
      oldRank: getRankByScore(calculateTotalSkillScore(state.stats)),
      newRank: null,
      rankUp: false
    };

    state.xp += res.xpGained;
    state.coins += res.coinsGained;

    if (isFirstTime) {
      state.passedLessons[run.lessonId] = true;
      var pts = run.skillPoints || { discipline: 2, independence: 2, planning: 2, organization: 2 };
      for (var k in pts) {
        if (Object.prototype.hasOwnProperty.call(pts, k)) {
          var val = Math.max(0, pts[k] || 0);
          state.stats[k] = (state.stats[k] || 0) + val;
          res.skillsGained[k] = val;
        }
      }
      state.statsHistory = state.statsHistory || [];
      state.statsHistory.push({
        date: new Date().toISOString(),
        lessonId: run.lessonId,
        gained: res.skillsGained
      });
      if (state.statsHistory.length > 50) state.statsHistory.shift();

      var newTotalScore = calculateTotalSkillScore(state.stats);
      res.newRank = getRankByScore(newTotalScore);
      if (res.newRank.name !== res.oldRank.name && newTotalScore >= res.newRank.min) {
        res.rankUp = true;
      }
    }

    return res;
  }

  function awardLessonCompletion(state, lessonId, skillPoints, isFirstTime, isCorrect) {
    if (!state) return { success: false };
    if (isCorrect === false) {
      return { success: false, reason: 'Неправильный ответ: награда не выдается.' };
    }
    var run = {
      lessonId: lessonId,
      completed: true,
      eligibleForReward: true,
      rewardClaimed: false,
      isFirstTime: isFirstTime,
      skillPoints: skillPoints,
      rewardXP: 25,
      rewardCoins: 10
    };
    return awardLessonReward(run, state);
  }

  function recordLessonMistake(state, lessonId) {
    if (!state) return;
    state.reviewMistakes = state.reviewMistakes || {};
    if (!state.reviewMistakes[lessonId]) {
      state.reviewMistakes[lessonId] = { mistakeCount: 1, lastAttemptDate: new Date().toISOString() };
    } else {
      state.reviewMistakes[lessonId].mistakeCount++;
      state.reviewMistakes[lessonId].lastAttemptDate = new Date().toISOString();
    }
  }

  function clearLessonMistake(state, lessonId) {
    if (!state || !state.reviewMistakes) return;
    delete state.reviewMistakes[lessonId];
  }

  function applyHeartLoss(state) {
    if (!state) return 0;
    if (state.noPressure) return state.hearts;
    state.hearts = Math.max(0, state.hearts - 1);
    return state.hearts;
  }

  function restoreHeart(state, amount) {
    if (!state) return 5;
    var add = typeof amount === 'number' ? amount : 1;
    state.hearts = Math.min(state.maxHearts || 5, state.hearts + add);
    return state.hearts;
  }

  // Financial Calculator logic
  function calculateBudget(income, needsPercent, wantsPercent, savingsPercent) {
    var inc = Number(income);
    if (!Number.isFinite(inc) || inc <= 0) {
      return { valid: false, error: 'Доход должен быть положительным числом.' };
    }

    var np = Number(needsPercent);
    var wp = Number(wantsPercent);
    var sp = Number(savingsPercent);

    if (!Number.isFinite(np) || np < 0 || !Number.isFinite(wp) || wp < 0 || !Number.isFinite(sp) || sp < 0) {
      return { valid: false, error: 'Проценты должны быть неотрицательными числами.' };
    }

    var sum = Math.round(np + wp + sp);
    if (sum !== 100) {
      return { valid: false, error: 'Сумма долей должна составлять ровно 100% (сейчас ' + sum + '%).' };
    }

    var needsAmount = Math.round((inc * np) / 100);
    var wantsAmount = Math.round((inc * wp) / 100);
    var savingsAmount = Math.round((inc * sp) / 100);

    var advice = '';
    var alternative = null;

    if (np > 65) {
      advice = 'Обязательные расходы занимают большую часть бюджета. Это частая ситуация на старте карьеры или при съёме жилья. Не кори себя — ориентир 50/30/20 гибкий.';
      alternative = {
        title: 'Реалистичный бюджет для высокой базы обязательных счетов',
        needsPercent: 70,
        wantsPercent: 20,
        savingsPercent: 10,
        needsAmount: Math.round(inc * 0.7),
        wantsAmount: Math.round(inc * 0.2),
        savingsAmount: Math.round(inc * 0.1)
      };
    } else if (sp < 10) {
      advice = 'Накопления пока невелики, но даже 5% позволяют создать привычку регулярного откладывания.';
    } else {
      advice = 'Сбалансированное распределение. Главное — следовать ему стабильно.';
    }

    return {
      valid: true,
      income: inc,
      needsPercent: np,
      wantsPercent: wp,
      savingsPercent: sp,
      needsAmount: needsAmount,
      wantsAmount: wantsAmount,
      savingsAmount: savingsAmount,
      advice: advice,
      alternative: alternative
    };
  }

  // Safety Cushion Calculation (based strictly on essential monthly expenses, NOT total income)
  function calculateSafetyCushion(essentialMonthlyExpenses, months) {
    var exp = Number(essentialMonthlyExpenses);
    if (!Number.isFinite(exp) || exp <= 0) {
      return { valid: false, error: 'Обязательные расходы за месяц должны быть положительным числом.' };
    }

    var m = Number(months);
    if (!Number.isInteger(m) || m < 1 || m > 36) {
      return { valid: false, error: 'Количество месяцев должно быть целым числом от 1 до 36.' };
    }

    var totalTarget = Math.round(exp * m);
    var monthlyContribution = Math.round(totalTarget / 12); // example 1-year pace

    return {
      valid: true,
      essentialMonthlyExpenses: exp,
      months: m,
      totalTarget: totalTarget,
      monthlyPace12Months: monthlyContribution,
      description: 'Подушка на ' + m + ' мес. обязательных расходов (' + exp.toLocaleString('ru-RU') + ' ₸/мес) составляет ' + totalTarget.toLocaleString('ru-RU') + ' ₸.'
    };
  }

  // Price comparison for Smart Shopping (e.g., 400g for 900 vs 600g for 1260)
  function compareProductPrices(itemA, itemB) {
    // itemA: { name, gramsOrMl, price, shelfLifeDays }
    var priceA = Number(itemA.price);
    var weightA = Number(itemA.weight); // in grams or ml
    var priceB = Number(itemB.price);
    var weightB = Number(itemB.weight);

    if (priceA <= 0 || weightA <= 0 || priceB <= 0 || weightB <= 0) {
      return { valid: false, error: 'Вес и цена обоих товаров должны быть положительными.' };
    }

    var pricePerKgA = (priceA / weightA) * 1000;
    var pricePerKgB = (priceB / weightB) * 1000;

    var cheaperItem = pricePerKgA < pricePerKgB ? 'A' : pricePerKgB < pricePerKgA ? 'B' : 'EQUAL';
    var diffPercent = Math.abs(Math.round(((pricePerKgA - pricePerKgB) / Math.max(pricePerKgA, pricePerKgB)) * 100));

    return {
      valid: true,
      pricePerKgA: Math.round(pricePerKgA),
      pricePerKgB: Math.round(pricePerKgB),
      cheaperItem: cheaperItem,
      diffPercent: diffPercent,
      insight: cheaperItem === 'A'
        ? itemA.name + ' выгоднее на ' + diffPercent + '% в пересчёте за 1 кг/л.'
        : cheaperItem === 'B'
        ? itemB.name + ' выгоднее на ' + diffPercent + '% в пересчёте за 1 кг/л.'
        : 'Оба варианта одинаковы по цене за килограмм.'
    };
  }

  // Shop item purchasing
  function purchaseShopItem(state, item) {
    if (!state || !item) return { success: false, reason: 'Неверные параметры.' };
    state.ownedItems = state.ownedItems || [];

    if (state.ownedItems.indexOf(item.id) !== -1) {
      return { success: false, reason: 'Предмет уже приобретён. Повторная покупка не требуется.' };
    }

    if (state.coins < item.cost) {
      return { success: false, reason: 'Недостаточно ЛайфКоинов. Требуется: ' + item.cost + ', у вас: ' + state.coins + '.' };
    }

    state.coins -= item.cost;
    state.ownedItems.push(item.id);

    return {
      success: true,
      coinsLeft: state.coins,
      item: item,
      message: 'Успешно приобретено: ' + item.name + '!'
    };
  }

  // Eisenhower Matrix Task Management
  function addEisenhowerTask(state, text, quadrant) {
    if (!state || !text || typeof text !== 'string') return null;
    var cleanText = text.trim();
    if (cleanText.length === 0) return null;

    var q = Number(quadrant);
    if (![1, 2, 3, 4].includes(q)) q = 2; // Default to Important / Not Urgent

    var nextId = 1;
    if (Array.isArray(state.eisenhowerTasks) && state.eisenhowerTasks.length > 0) {
      nextId = Math.max.apply(null, state.eisenhowerTasks.map(function(t) { return t.id || 0; })) + 1;
    } else {
      state.eisenhowerTasks = [];
    }

    var task = {
      id: nextId,
      text: cleanText.slice(0, 150),
      quadrant: q,
      done: false,
      date: new Date().toLocaleDateString('sv-SE')
    };

    state.eisenhowerTasks.push(task);
    return task;
  }

  function moveEisenhowerTask(state, taskId, newQuadrant) {
    if (!state || !Array.isArray(state.eisenhowerTasks)) return false;
    var q = Number(newQuadrant);
    if (![1, 2, 3, 4].includes(q)) return false;

    var task = state.eisenhowerTasks.find(function(t) { return t.id === taskId; });
    if (!task) return false;

    task.quadrant = q;
    return true;
  }

  function toggleEisenhowerTask(state, taskId, forcedValue) {
    if (!state || !Array.isArray(state.eisenhowerTasks)) return false;
    var task = state.eisenhowerTasks.find(function(t) { return t.id === taskId; });
    if (!task) return false;

    task.done = typeof forcedValue === 'boolean' ? forcedValue : !task.done;
    return task.done;
  }

  function deleteEisenhowerTask(state, taskId) {
    if (!state || !Array.isArray(state.eisenhowerTasks)) return false;
    var initialLen = state.eisenhowerTasks.length;
    state.eisenhowerTasks = state.eisenhowerTasks.filter(function(t) { return t.id !== taskId; });
    return state.eisenhowerTasks.length < initialLen;
  }

  // Shopping List helpers
  function calculateShoppingTotals(items, budgetLimit) {
    if (!Array.isArray(items)) return { total: 0, boughtTotal: 0, isOverBudget: false, diff: 0 };
    var total = 0;
    var boughtTotal = 0;

    for (var i = 0; i < items.length; i++) {
      var item = items[i];
      var qty = Math.max(0, Number(item.qty) || 1);
      var price = Math.max(0, Number(item.unitPrice) || 0);
      var itemTotal = qty * price;
      total += itemTotal;
      if (item.done) boughtTotal += itemTotal;
    }

    var limit = Number(budgetLimit) || 0;
    var isOverBudget = limit > 0 && total > limit;
    var diff = total - limit;

    return {
      total: total,
      boughtTotal: boughtTotal,
      budgetLimit: limit,
      isOverBudget: isOverBudget,
      diff: diff
    };
  }

  // STAR Constructor helper
  function formatStarStory(s, t, a, r) {
    var sit = String(s || '').trim();
    var tsk = String(t || '').trim();
    var act = String(a || '').trim();
    var res = String(r || '').trim();

    if (!sit && !tsk && !act && !res) return '';

    var parts = [];
    if (sit) parts.push('【Ситуация】: ' + sit);
    if (tsk) parts.push('【Задача】: ' + tsk);
    if (act) parts.push('【Действия】: ' + act);
    if (res) parts.push('【Результат】: ' + res);

    return parts.join('\n\n');
  }

  // Month Simulation step engine
  function advanceMonthSimulation(simState, choiceEffect) {
    if (!simState || simState.completed) return simState;

    if (choiceEffect) {
      if (typeof choiceEffect.moneyDelta === 'number') {
        simState.money += choiceEffect.moneyDelta;
      }
      if (typeof choiceEffect.energyDelta === 'number') {
        simState.energy = Math.max(0, Math.min(100, simState.energy + choiceEffect.energyDelta));
      }
      if (typeof choiceEffect.stressDelta === 'number') {
        simState.stress = Math.max(0, Math.min(100, simState.stress + choiceEffect.stressDelta));
      }
      if (choiceEffect.note) {
        simState.history.push({
          day: simState.day,
          note: choiceEffect.note,
          money: simState.money,
          stress: simState.stress
        });
      }
    }

    simState.day++;
    if (simState.day > (simState.maxDays || 30)) {
      simState.completed = true;
    }

    return simState;
  }

  return {
    STORAGE_KEY: STORAGE_KEY,
    BACKUP_KEY: BACKUP_KEY,
    RANKS: RANKS,
    getRankByScore: getRankByScore,
    getLevelByXP: getLevelByXP,
    getXPToNextLevel: getXPToNextLevel,
    getInitialState: getInitialState,
    THEME_IDS: THEME_IDS.slice(),
    normalizeTheme: normalizeTheme,
    applyProfileSettings: applyProfileSettings,
    validateSaveState: validateSaveState,
    migrateSaveState: migrateSaveState,
    calculateTotalSkillScore: calculateTotalSkillScore,
    evaluateAnswer: evaluateAnswer,
    createLessonRun: createLessonRun,
    restartLessonRun: restartLessonRun,
    submitLessonAnswer: submitLessonAnswer,
    getAttemptHint: getAttemptHint,
    awardLessonReward: awardLessonReward,
    awardLessonCompletion: awardLessonCompletion,
    recordLessonMistake: recordLessonMistake,
    clearLessonMistake: clearLessonMistake,
    applyHeartLoss: applyHeartLoss,
    restoreHeart: restoreHeart,
    calculateBudget: calculateBudget,
    calculateSafetyCushion: calculateSafetyCushion,
    compareProductPrices: compareProductPrices,
    purchaseShopItem: purchaseShopItem,
    addEisenhowerTask: addEisenhowerTask,
    moveEisenhowerTask: moveEisenhowerTask,
    toggleEisenhowerTask: toggleEisenhowerTask,
    deleteEisenhowerTask: deleteEisenhowerTask,
    calculateShoppingTotals: calculateShoppingTotals,
    formatStarStory: formatStarStory,
    advanceMonthSimulation: advanceMonthSimulation
  };
});


