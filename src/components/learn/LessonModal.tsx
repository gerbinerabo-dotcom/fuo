import React, { useState } from 'react';
import { Lesson, Exercise, MultipleChoiceExercise, MatchPairsExercise, OrderStepsExercise, DilemmaExercise } from '../../types';
import { useGame } from '../../context/GameContext';
import { DuoMascot, MascotMood } from '../mascot/DuoMascot';
import { sounds } from '../../utils/audio';
import { fireVictoryConfetti } from '../../utils/confetti';
import { X, Heart, Sparkles, CheckCircle2, XCircle, ArrowRight, Lightbulb, RotateCcw } from 'lucide-react';

interface LessonModalProps {
  lesson: Lesson;
  onClose: () => void;
}

export const LessonModal: React.FC<LessonModalProps> = ({ lesson, onClose }) => {
  const { completeLesson, loseHeart, state } = useGame();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);

  // Match pairs state
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [matchedIds, setMatchedIds] = useState<string[]>([]);
  const [failedPair, setFailedPair] = useState<boolean>(false);

  // Order steps state
  const [orderedStepIds, setOrderedStepIds] = useState<string[]>([]);

  // Dilemma state
  const [selectedDilemmaChoice, setSelectedDilemmaChoice] = useState<'A' | 'B' | null>(null);

  // Status state
  const [checkState, setCheckState] = useState<'idle' | 'correct' | 'incorrect'>('idle');
  const [explanation, setExplanation] = useState<string>('');
  const [mascotMood, setMascotMood] = useState<MascotMood>('thinking');
  const [speechBubble, setSpeechBubble] = useState<string | undefined>('Подумай над принципом!');

  // Lesson completion state
  const [isFinished, setIsFinished] = useState(false);
  const [mistakesCount, setMistakesCount] = useState(0);
  const [missedExerciseIndexes, setMissedExerciseIndexes] = useState<number[]>([]);
  const [isReviewingMistakes, setIsReviewingMistakes] = useState(false);
  const [reviewCursor, setReviewCursor] = useState(0);

  const currentExercise: Exercise = lesson.exercises[currentIndex];
  // The review phase has its own progress bar for the questions being retried.
  const progressTotal = isReviewingMistakes ? missedExerciseIndexes.length : lesson.exercises.length;
  const completedExercises = isReviewingMistakes
    ? reviewCursor + (checkState === 'idle' ? 0 : 1)
    : currentIndex + (checkState === 'idle' ? 0 : 1);
  const progressPercent = progressTotal > 0 ? Math.round((completedExercises / progressTotal) * 100) : 0;

  // Handlers for Check button
  const handleCheck = () => {
    sounds.playClick();

    if (currentExercise.type === 'multiple_choice') {
      const mc = currentExercise as MultipleChoiceExercise;
      const isCorrect = selectedOptionId === mc.correctOptionId;
      processResult(isCorrect, mc.explanation);
    } else if (currentExercise.type === 'match_pairs') {
      const mp = currentExercise as MatchPairsExercise;
      const allMatched = matchedIds.length === mp.pairs.length;
      processResult(allMatched, mp.explanation);
    } else if (currentExercise.type === 'order_steps') {
      const os = currentExercise as OrderStepsExercise;
      let isCorrect = orderedStepIds.length === os.items.length;
      if (isCorrect) {
        for (let i = 0; i < os.items.length; i++) {
          const item = os.items.find((it) => it.id === orderedStepIds[i]);
          if (!item || item.correctIndex !== i) {
            isCorrect = false;
            break;
          }
        }
      }
      processResult(isCorrect, os.explanation);
    } else if (currentExercise.type === 'dilemma') {
      const de = currentExercise as DilemmaExercise;
      const choice = selectedDilemmaChoice === 'A' ? de.choiceA : de.choiceB;
      const isOptimal = choice ? choice.isOptimal : false;
      const feedback = choice ? choice.feedback : de.explanation;
      processResult(isOptimal, feedback);
    }
  };

  const processResult = (isCorrect: boolean, expl: string) => {
    setExplanation(expl);
    if (isCorrect) {
      sounds.playCorrect();
      setCheckState('correct');
      setMascotMood('cheering');
      setSpeechBubble('Идеально! Так держать! 🎉');
    } else {
      sounds.playWrong();
      setCheckState('incorrect');
      setMascotMood('worried');
      setSpeechBubble('Ничего страшного, учимся на ошибках!');
      setMistakesCount((c) => c + 1);
      if (!isReviewingMistakes) {
        setMissedExerciseIndexes((indexes) => indexes.includes(currentIndex) ? indexes : [...indexes, currentIndex]);
      }
      loseHeart();
    }
  };

  const resetExerciseState = (reviewingMistakes = isReviewingMistakes) => {
    setSelectedOptionId(null);
    setSelectedLeft(null);
    setMatchedIds([]);
    setFailedPair(false);
    setOrderedStepIds([]);
    setSelectedDilemmaChoice(null);
    setCheckState('idle');
    setExplanation('');
    setMascotMood('thinking');
    setSpeechBubble(reviewingMistakes ? '\u041f\u043e\u043f\u0440\u043e\u0431\u0443\u0439 \u0435\u0449\u0451 \u0440\u0430\u0437 — \u0442\u044b \u0441\u043f\u0440\u0430\u0432\u0438\u0448\u044c\u0441\u044f!' : 'РЎР»РµРґСѓСЋС‰РёР№ РІРѕРїСЂРѕСЃ!');
  };

  const finishLesson = () => {
    sounds.playFanfare();
    fireVictoryConfetti();
    setIsFinished(true);
    const stars = mistakesCount === 0 ? 3 : mistakesCount === 1 ? 2 : 1;
    completeLesson(lesson, stars);
  };

  const handleNext = () => {
    sounds.playClick();

    if (isReviewingMistakes) {
      const nextCursor = reviewCursor + 1;
      if (nextCursor < missedExerciseIndexes.length) {
        setReviewCursor(nextCursor);
        setCurrentIndex(missedExerciseIndexes[nextCursor]);
        resetExerciseState();
      } else {
        finishLesson();
      }
      return;
    }

    if (currentIndex + 1 < lesson.exercises.length) {
      setCurrentIndex(currentIndex + 1);
      resetExerciseState();
    } else if (missedExerciseIndexes.length > 0) {
      setIsReviewingMistakes(true);
      setReviewCursor(0);
      setCurrentIndex(missedExerciseIndexes[0]);
      resetExerciseState(true);
    } else {
      finishLesson();
    }
  };
  const canCheck = (): boolean => {
    if (checkState !== 'idle') return false;
    if (currentExercise.type === 'multiple_choice') return selectedOptionId !== null;
    if (currentExercise.type === 'match_pairs') {
      const mp = currentExercise as MatchPairsExercise;
      return matchedIds.length === mp.pairs.length;
    }
    if (currentExercise.type === 'order_steps') {
      const os = currentExercise as OrderStepsExercise;
      return orderedStepIds.length === os.items.length;
    }
    if (currentExercise.type === 'dilemma') return selectedDilemmaChoice !== null;
    return false;
  };

  // Victory Screen
  if (isFinished) {
    const accuracy = Math.max(0, Math.round(((lesson.exercises.length - mistakesCount) / lesson.exercises.length) * 100));
    return (
      <div className="fixed inset-0 z-50 bg-white dark:bg-slate-900 flex flex-col justify-between p-6 sm:p-12 animate-in fade-in select-none">
        <div className="max-w-md w-full mx-auto flex-1 flex flex-col items-center justify-center text-center">
          <DuoMascot mood="celebrating" size="xl" speechBubble="Урок завершён! Ты великолепен(на)!" />

          <h2 className="text-3xl font-black text-amber-500 mt-6 mb-2">
            Урок завершён!
          </h2>
          <p className="text-base font-extrabold text-slate-500 dark:text-slate-400 mb-8">
            {lesson.title}
          </p>

          {/* Stats Badges */}
          <div className="grid grid-cols-3 gap-3 w-full mb-8">
            <div className="bg-amber-50 dark:bg-amber-950/40 p-4 rounded-3xl border-2 border-amber-300 dark:border-amber-700/40 text-center">
              <div className="text-xs font-black uppercase tracking-wider text-amber-600">Опыт</div>
              <div className="text-2xl font-black text-amber-600 mt-1">+{lesson.xpReward} XP</div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-950/40 p-4 rounded-3xl border-2 border-blue-300 dark:border-blue-700/40 text-center">
              <div className="text-xs font-black uppercase tracking-wider text-blue-600">Кристаллы</div>
              <div className="text-2xl font-black text-blue-600 mt-1">+{lesson.gemsReward} 💎</div>
            </div>

            <div className="bg-emerald-50 dark:bg-emerald-950/40 p-4 rounded-3xl border-2 border-emerald-300 dark:border-emerald-700/40 text-center">
              <div className="text-xs font-black uppercase tracking-wider text-emerald-600">Точность</div>
              <div className="text-2xl font-black text-emerald-600 mt-1">{accuracy}%</div>
            </div>
          </div>

          <div className="p-4 bg-orange-50 dark:bg-orange-950/30 rounded-2xl border border-orange-200 dark:border-orange-800 text-sm font-black text-orange-600 flex items-center gap-2">
            🔥 Твоя серия дней продлена: {state.streak} дня подряд!
          </div>
        </div>

        <div className="max-w-md w-full mx-auto">
          <button
            onClick={() => {
              sounds.playClick();
              onClose();
            }}
            className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 active:translate-y-1 text-white font-black text-base rounded-2xl shadow-[0_4px_0_theme(colors.emerald.700)] active:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            Продолжить путь <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-white dark:bg-slate-900 flex flex-col justify-between animate-in fade-in select-none">
      {/* Top Header */}
      <div className="max-w-2xl w-full mx-auto px-4 py-4 flex items-center gap-4">
        <button
          onClick={() => {
            sounds.playClick();
            if (confirm('Прервать урок? Прогресс не сохранится.')) {
              onClose();
            }
          }}
          className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          aria-label="Закрыть урок"
        >
          <X className="w-6 h-6 stroke-[2.5]" />
        </button>

        {/* Top Progress Bar */}
        <div
          className="flex-1 h-3.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden p-0.5"
          role="progressbar"
          aria-label="Прогресс урока"
          aria-valuemin={0}
          aria-valuemax={progressTotal}
          aria-valuenow={completedExercises}
        >
          <div
            className="h-full bg-emerald-500 rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Hearts Remaining */}
        <div className="flex items-center gap-1.5 text-rose-500 font-black text-base">
          <Heart className="w-6 h-6 fill-rose-500" />
          <span>{state.noPressureMode ? '∞' : state.hearts}</span>
        </div>
      </div>

      {/* Main Question Scroll Area */}
      <div className="flex-1 overflow-y-auto px-4 py-2 flex flex-col items-center justify-center max-w-2xl w-full mx-auto">
        {/* Mascot & Prompt */}
        <div className="w-full flex items-center gap-4 mb-6">
          <DuoMascot mood={mascotMood} size="md" speechBubble={speechBubble} />
          <div className="flex-1">
            {isReviewingMistakes && (
              <div className="text-xs font-black uppercase tracking-wider text-amber-600 dark:text-amber-400">
              {"\u041f\u043e\u0432\u0442\u043e\u0440 \u043e\u0448\u0438\u0431\u043e\u043a " + (reviewCursor + 1) + " \u0438\u0437 " + missedExerciseIndexes.length}
              </div>
            )}
            <div className="text-xs font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Вопрос {currentIndex + 1} из {lesson.exercises.length}
            </div>
            <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white leading-snug">
              {currentExercise.prompt}
            </h3>
          </div>
        </div>

        {/* Optional Theory & Example Snippets */}
        {currentExercise.theorySnippet && checkState === 'idle' && (
          <div className="w-full mb-4 p-3.5 bg-emerald-50/70 dark:bg-emerald-950/30 rounded-2xl border-l-4 border-emerald-500 text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300">
            <span className="font-black text-emerald-700 dark:text-emerald-400">Короткая теория: </span>
            {currentExercise.theorySnippet}
          </div>
        )}

        {currentExercise.exampleSnippet && checkState === 'idle' && (
          <div className="w-full mb-4 p-3.5 bg-amber-50/70 dark:bg-amber-950/30 rounded-2xl border border-amber-200 dark:border-amber-800/40 text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300">
            <span className="font-black text-amber-700 dark:text-amber-400">Пример из жизни: </span>
            {currentExercise.exampleSnippet}
          </div>
        )}

        {/* EXERCISE TYPE 1: MULTIPLE CHOICE */}
        {currentExercise.type === 'multiple_choice' && (
          <div className="w-full space-y-3">
            {(currentExercise as MultipleChoiceExercise).options.map((option, idx) => {
              const isSelected = selectedOptionId === option.id;
              const isCorrectOpt = option.id === (currentExercise as MultipleChoiceExercise).correctOptionId;

              let btnStyle = 'bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 shadow-[0_3px_0_theme(colors.slate.200)] dark:shadow-[0_3px_0_theme(colors.slate.700)]';

              if (checkState === 'idle' && isSelected) {
                btnStyle = 'bg-emerald-50 dark:bg-emerald-950/40 border-2 border-emerald-500 text-emerald-700 dark:text-emerald-300 shadow-[0_3px_0_theme(colors.emerald.600)]';
              } else if (checkState === 'correct' && isSelected) {
                btnStyle = 'bg-emerald-100 dark:bg-emerald-950/60 border-2 border-emerald-500 text-emerald-800 dark:text-emerald-200 shadow-none';
              } else if (checkState === 'incorrect') {
                if (isSelected) {
                  btnStyle = 'bg-rose-100 dark:bg-rose-950/60 border-2 border-rose-500 text-rose-800 dark:text-rose-200 shadow-none';
                } else if (isCorrectOpt) {
                  btnStyle = 'bg-emerald-50 dark:bg-emerald-950/40 border-2 border-emerald-500 text-emerald-700 dark:text-emerald-300';
                }
              }

              return (
                <button
                  key={option.id}
                  disabled={checkState !== 'idle'}
                  onClick={() => {
                    sounds.playClick();
                    setSelectedOptionId(option.id);
                  }}
                  className={`w-full p-4 rounded-2xl text-left font-black text-sm sm:text-base flex items-center justify-between gap-3 transition-all duration-150 active:translate-y-0.5 cursor-pointer ${btnStyle}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-xl bg-slate-100 dark:bg-slate-700/80 flex items-center justify-center text-xs font-black text-slate-500 dark:text-slate-300">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span>{option.text}</span>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* EXERCISE TYPE 2: MATCH PAIRS */}
        {currentExercise.type === 'match_pairs' && (
          <div className="w-full">
            <p className="text-xs font-bold text-slate-400 mb-3 text-center">
              Выбери понятие слева, затем его значение справа:
            </p>
            <div className="grid grid-cols-2 gap-3">
              {/* Left Column */}
              <div className="space-y-2.5">
                {(currentExercise as MatchPairsExercise).pairs.map((pair) => {
                  const isMatched = matchedIds.includes(pair.id);
                  const isSelected = selectedLeft === pair.id;
                  return (
                    <button
                      key={`left_${pair.id}`}
                      disabled={isMatched || checkState !== 'idle'}
                      onClick={() => {
                        sounds.playClick();
                        setSelectedLeft(pair.id);
                      }}
                      className={`w-full p-3 rounded-2xl font-black text-xs sm:text-sm text-left transition-all ${
                        isMatched
                          ? 'opacity-40 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 cursor-not-allowed line-through'
                          : isSelected
                          ? 'bg-blue-100 dark:bg-blue-950/50 border-2 border-blue-500 text-blue-700 shadow-sm'
                          : 'bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {pair.left}
                    </button>
                  );
                })}
              </div>

              {/* Right Column */}
              <div className="space-y-2.5">
                {(currentExercise as MatchPairsExercise).pairs
                  .slice()
                  .reverse()
                  .map((pair) => {
                    const isMatched = matchedIds.includes(pair.id);
                    return (
                      <button
                        key={`right_${pair.id}`}
                        disabled={isMatched || checkState !== 'idle'}
                        onClick={() => {
                          if (!selectedLeft) return;
                          if (selectedLeft === pair.id) {
                            sounds.playCorrect();
                            setMatchedIds([...matchedIds, pair.id]);
                            setSelectedLeft(null);
                          } else {
                            sounds.playWrong();
                            setFailedPair(true);
                            setTimeout(() => {
                              setFailedPair(false);
                              setSelectedLeft(null);
                            }, 400);
                          }
                        }}
                        className={`w-full p-3 rounded-2xl font-bold text-xs sm:text-sm text-left transition-all ${
                          isMatched
                            ? 'opacity-40 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 cursor-not-allowed line-through'
                            : failedPair && selectedLeft
                            ? 'bg-rose-100 border-2 border-rose-500 text-rose-700 animate-shake'
                            : 'bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {pair.right}
                      </button>
                    );
                  })}
              </div>
            </div>
          </div>
        )}

        {/* EXERCISE TYPE 3: ORDER STEPS */}
        {currentExercise.type === 'order_steps' && (
          <div className="w-full space-y-4">
            <p className="text-xs font-bold text-slate-400 text-center">
              Нажимай на шаги по очереди, чтобы выстроить правильную последовательность:
            </p>

            {/* Selected Sequence Slots */}
            <div className="min-h-24 p-3 bg-slate-100 dark:bg-slate-800/50 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 space-y-2">
              {orderedStepIds.length === 0 ? (
                <div className="h-16 flex items-center justify-center text-xs font-black text-slate-400">
                  Выбирай блоки снизу
                </div>
              ) : (
                orderedStepIds.map((id, index) => {
                  const item = (currentExercise as OrderStepsExercise).items.find((it) => it.id === id);
                  return (
                    <div
                      key={id}
                      onClick={() => {
                        if (checkState !== 'idle') return;
                        sounds.playClick();
                        setOrderedStepIds(orderedStepIds.filter((stepId) => stepId !== id));
                      }}
                      className="p-2.5 bg-emerald-500 text-white rounded-xl font-black text-xs sm:text-sm flex items-center justify-between cursor-pointer hover:bg-emerald-600 transition-colors shadow-sm"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-md bg-white/20 flex items-center justify-center text-[10px]">
                          {index + 1}
                        </span>
                        <span>{item?.text}</span>
                      </div>
                      <X className="w-4 h-4 opacity-70" />
                    </div>
                  );
                })
              )}
            </div>

            {/* Available options below */}
            <div className="flex flex-wrap gap-2 justify-center">
              {(currentExercise as OrderStepsExercise).items.map((item) => {
                const isPicked = orderedStepIds.includes(item.id);
                return (
                  <button
                    key={item.id}
                    disabled={isPicked || checkState !== 'idle'}
                    onClick={() => {
                      sounds.playClick();
                      setOrderedStepIds([...orderedStepIds, item.id]);
                    }}
                    className={`p-3 rounded-2xl font-black text-xs sm:text-sm border-2 transition-all ${
                      isPicked
                        ? 'opacity-30 bg-slate-200 dark:bg-slate-700 text-slate-400 border-transparent cursor-not-allowed'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-emerald-500 hover:bg-emerald-50 text-slate-800 dark:text-slate-100 shadow-[0_3px_0_theme(colors.slate.200)]'
                    }`}
                  >
                    {item.text}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* EXERCISE TYPE 4: DILEMMA A/B */}
        {currentExercise.type === 'dilemma' && (
          <div className="w-full space-y-4">
            <div className="p-4 bg-purple-50 dark:bg-purple-950/40 rounded-2xl border-2 border-purple-200 dark:border-purple-800/40 text-sm font-black text-purple-900 dark:text-purple-200">
              {(currentExercise as DilemmaExercise).scenario}
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              <button
                disabled={checkState !== 'idle'}
                onClick={() => {
                  sounds.playClick();
                  setSelectedDilemmaChoice('A');
                }}
                className={`p-4 rounded-2xl text-left font-black text-sm border-2 transition-all ${
                  selectedDilemmaChoice === 'A'
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 shadow-[0_3px_0_theme(colors.emerald.600)]'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 hover:bg-slate-50'
                }`}
              >
                <div className="text-xs font-black uppercase text-emerald-600 mb-1">Вариант А</div>
                {(currentExercise as DilemmaExercise).choiceA.text}
              </button>

              <button
                disabled={checkState !== 'idle'}
                onClick={() => {
                  sounds.playClick();
                  setSelectedDilemmaChoice('B');
                }}
                className={`p-4 rounded-2xl text-left font-black text-sm border-2 transition-all ${
                  selectedDilemmaChoice === 'B'
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 shadow-[0_3px_0_theme(colors.emerald.600)]'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 hover:bg-slate-50'
                }`}
              >
                <div className="text-xs font-black uppercase text-emerald-600 mb-1">Вариант Б</div>
                {(currentExercise as DilemmaExercise).choiceB.text}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Drawer Bar */}
      <div
        className={`border-t-2 p-4 sm:p-6 transition-colors ${
          checkState === 'correct'
            ? 'bg-emerald-100 dark:bg-emerald-950 border-emerald-300 dark:border-emerald-800'
            : checkState === 'incorrect'
            ? 'bg-rose-100 dark:bg-rose-950 border-rose-300 dark:border-rose-800'
            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
        }`}
      >
        <div className="max-w-2xl w-full mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Feedback Info Box */}
          <div className="min-w-0 flex-1">
            {checkState === 'correct' && (
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 flex-shrink-0" />
                <div>
                  <div className="text-lg font-black text-emerald-800 dark:text-emerald-200">
                    Верно! Принцип применён правильно.
                  </div>
                  <div className="text-xs sm:text-sm font-bold text-emerald-700 dark:text-emerald-300 mt-0.5">
                    {explanation}
                  </div>
                </div>
              </div>
            )}

            {checkState === 'incorrect' && (
              <div className="flex items-start gap-3">
                <XCircle className="w-8 h-8 text-rose-600 flex-shrink-0" />
                <div>
                  <div className="text-lg font-black text-rose-800 dark:text-rose-200">
                    Не совсем так...
                  </div>
                  <div className="text-xs sm:text-sm font-bold text-rose-700 dark:text-rose-300 mt-0.5">
                    {explanation}
                  </div>
                </div>
              </div>
            )}

            {checkState === 'idle' && (
              <div className="hidden sm:flex items-center gap-2 text-xs font-bold text-slate-400">
                <Lightbulb className="w-4 h-4 text-amber-500" /> Выбери ответ и нажми «Проверить»
              </div>
            )}
          </div>

          {/* Action Button */}
          <div className="w-full sm:w-auto">
            {checkState === 'idle' ? (
              <button
                disabled={!canCheck()}
                onClick={handleCheck}
                className={`w-full sm:w-48 py-3.5 font-black text-sm uppercase tracking-wider rounded-2xl transition-all cursor-pointer ${
                  canCheck()
                    ? 'bg-emerald-500 hover:bg-emerald-600 active:translate-y-1 text-white shadow-[0_4px_0_theme(colors.emerald.700)] active:shadow-none'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed shadow-none'
                }`}
              >
                Проверить
              </button>
            ) : checkState === 'correct' ? (
              <button
                onClick={handleNext}
                className="w-full sm:w-48 py-3.5 bg-emerald-600 hover:bg-emerald-700 active:translate-y-1 text-white font-black text-sm uppercase tracking-wider rounded-2xl shadow-[0_4px_0_theme(colors.emerald.800)] active:shadow-none transition-all cursor-pointer"
              >
                Продолжить
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="w-full sm:w-48 py-3.5 bg-rose-600 hover:bg-rose-700 active:translate-y-1 text-white font-black text-sm uppercase tracking-wider rounded-2xl shadow-[0_4px_0_theme(colors.rose.800)] active:shadow-none transition-all cursor-pointer"
              >
                Понятно
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

