'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { useWordsData, type WordData } from '@/hooks/useWordsData';
import { useQuizHistory } from '@/hooks/useQuizHistory';
import { QuizResultsModal } from '@/components/learn/QuizResultsModal';

interface GridQuestion {
  word: WordData;
  correctAnswers: string[];
  gridWords: string[];
  selectedWords: Set<string>;
  isAnswered: boolean;
}

function GridQuizContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { words, isLoading: isWordsLoading } = useWordsData();
  const { saveQuizAttempt } = useQuizHistory();

  const mode = (searchParams.get('mode') || 'synonym') as 'synonym' | 'antonym';
  const contextLabel = searchParams.get('context') || 'All Words';

  const [questions, setQuestions] = useState<GridQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showResultsModal, setShowResultsModal] = useState(false);

  const initializeQuiz = () => {
    if (words.length < 4) return;

    let sourcePool: WordData[] = words;
    try {
      const storedPool = sessionStorage.getItem('lexora_quiz_pool');
      if (storedPool) {
        const ids: string[] = JSON.parse(storedPool);
        const matched = words.filter((w) => ids.includes(w.id));
        if (matched.length > 0) {
          sourcePool = matched;
        }
      }
    } catch {}

    const validPool = sourcePool.filter((w) => {
      if (mode === 'synonym') return w.synonyms && w.synonyms.length > 0;
      return w.antonyms && w.antonyms.length > 0;
    });

    if (validPool.length === 0) return;

    const generatedQuestions: GridQuestion[] = validPool.map((word) => {
      const correctAnswers: string[] =
        mode === 'synonym' ? [...(word.synonyms || [])] : [...(word.antonyms || [])];

      const options = new Set<string>(correctAnswers);

      let attempts = 0;
      while (options.size < 30 && attempts < 350) {
        const randWord = words[Math.floor(Math.random() * words.length)];
        if (mode === 'synonym' && randWord.synonyms && randWord.synonyms.length > 0) {
          options.add(randWord.synonyms[Math.floor(Math.random() * randWord.synonyms.length)]);
        } else if (mode === 'antonym' && randWord.antonyms && randWord.antonyms.length > 0) {
          options.add(randWord.antonyms[Math.floor(Math.random() * randWord.antonyms.length)]);
        } else if (randWord.word) {
          options.add(randWord.word);
        }
        attempts++;
      }

      while (options.size < 30) {
        const randWord = words[Math.floor(Math.random() * words.length)];
        options.add(randWord.word || `Word ${options.size + 1}`);
      }

      const gridWords = Array.from(options).sort(() => Math.random() - 0.5);

      return {
        word,
        correctAnswers,
        gridWords,
        selectedWords: new Set<string>(),
        isAnswered: false,
      };
    });

    const shuffled = generatedQuestions.sort(() => Math.random() - 0.5);
    setQuestions(shuffled);
    setCurrentIndex(0);
    setIsCompleted(false);
    setShowResultsModal(false);
  };

  useEffect(() => {
    if (!isWordsLoading && words.length >= 4) {
      initializeQuiz();
    }
  }, [isWordsLoading, words, mode]);

  const currentQ = questions.length > 0 && currentIndex < questions.length ? questions[currentIndex] : null;

  const handleSelectWord = (wordStr: string) => {
    if (!currentQ || currentQ.isAnswered) return;

    setQuestions((prev) => {
      const updated = [...prev];
      const q = updated[currentIndex];
      const newSelected = new Set(q.selectedWords);
      newSelected.add(wordStr);

      // Check if all correct answers found
      const correctSelected = q.correctAnswers.filter((ans) => newSelected.has(ans)).length;
      const isAnswered = correctSelected === q.correctAnswers.length;

      updated[currentIndex] = {
        ...q,
        selectedWords: newSelected,
        isAnswered,
      };
      return updated;
    });
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      finishQuiz();
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  // Remaining count for current question
  const remainingCount = useMemo(() => {
    if (!currentQ) return 0;
    const found = currentQ.correctAnswers.filter((a) => currentQ.selectedWords.has(a)).length;
    return Math.max(0, currentQ.correctAnswers.length - found);
  }, [currentQ]);

  // Overall stats: count of correct matches, total expected targets, and total selected words across all questions
  const totalStats = useMemo(() => {
    let totalExpected = 0;
    let totalSelected = 0;
    let totalCorrectSelected = 0;

    questions.forEach((q) => {
      totalExpected += q.correctAnswers.length;
      totalSelected += q.selectedWords.size;
      totalCorrectSelected += q.correctAnswers.filter((a) => q.selectedWords.has(a)).length;
    });

    const effectiveTotal = Math.max(totalSelected, totalExpected, 1);
    const scorePercentage = Math.round((totalCorrectSelected / effectiveTotal) * 100);

    return {
      totalExpected,
      totalSelected,
      totalCorrectSelected,
      scorePercentage,
    };
  }, [questions]);

  const finishQuiz = async () => {
    setIsCompleted(true);
    setShowResultsModal(true);

    const quizTypeTitle = mode === 'synonym' ? 'Synonyms Matrix' : 'Antonyms Matrix';

    await saveQuizAttempt({
      quizType: quizTypeTitle,
      quizContext: contextLabel,
      totalExpected: totalStats.totalCorrectSelected,
      totalSelected: Math.max(totalStats.totalSelected, totalStats.totalExpected, 1),
    });
  };

  if (isWordsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background text-center">
        <div className="w-16 h-16 rounded-3xl bg-primary/10 text-primary flex items-center justify-center mb-4">
          <Sparkles className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">No Matching Words</h2>
        <p className="text-sm text-foreground-variant max-w-sm mb-6">
          You need more words with registered {mode}s to play the Matrix Grid challenge.
        </p>
        <Link
          href="/learn"
          className="px-6 py-3 rounded-2xl bg-primary text-white font-bold text-sm shadow-lg shadow-primary/20 hover:scale-105 transition-all"
        >
          Back to Learn
        </Link>
      </div>
    );
  }

  const progressPercent = ((currentIndex + 1) / questions.length) * 100;
  const accentGradient =
    mode === 'synonym'
      ? 'from-purple-600 to-indigo-600'
      : 'from-teal-500 to-emerald-500';

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Top Linear Progress Bar */}
      <div className="w-full h-1.5 bg-surface-container/60 dark:bg-white/[0.06] overflow-hidden">
        <div
          className={`h-full bg-gradient-to-r ${accentGradient} transition-all duration-300 ease-out`}
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Top Navigation Bar */}
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
        <button
          onClick={() => router.push('/learn')}
          className="w-10 h-10 rounded-full bg-surface/50 border border-border flex items-center justify-center text-muted hover:text-foreground transition-all shadow-[0_4px_20px_rgba(0,0,0,0.3)] backdrop-blur-md cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="text-center">
          <span className="text-xs font-bold uppercase tracking-wider text-muted">
            {mode === 'synonym' ? 'Synonyms Matrix' : 'Antonyms Matrix'}
          </span>
        </div>

        <div className="px-3.5 py-1.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-bold shadow-sm">
          {currentIndex + 1} / {questions.length}
        </div>
      </div>

      {/* Main Question Area */}
      {currentQ && (
        <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-4 flex flex-col justify-between">
          <div className="space-y-6">
            {/* Target Word Pod */}
            <div className="p-6 rounded-3xl bg-surface border border-border/60 shadow-xl flex items-center justify-between flex-wrap gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
                  Find all {mode}s for:
                </span>
                <h1 className="text-3xl font-extrabold text-foreground tracking-tight mt-0.5">
                  {currentQ.word.word}
                </h1>
              </div>

              <div className="flex items-center gap-2">
                {remainingCount === 0 ? (
                  <div className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-bold text-sm">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>All {currentQ.correctAnswers.length} Found!</span>
                  </div>
                ) : (
                  <div className="px-4 py-2 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 font-bold text-sm">
                    {remainingCount} {remainingCount === 1 ? mode : `${mode}s`} Remaining
                  </div>
                )}
              </div>
            </div>

            {/* 30-Word Matrix Grid (5 Rows x 6 Columns) */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-3">
              {currentQ.gridWords.map((wordStr, idx) => {
                const isSelected = currentQ.selectedWords.has(wordStr);
                const isCorrectMatch = currentQ.correctAnswers.includes(wordStr);

                let tileStyle =
                  'bg-surface border-border/60 hover:border-blue-500/40 hover:scale-[1.02] text-foreground cursor-pointer';

                if (isSelected) {
                  if (isCorrectMatch) {
                    tileStyle =
                      'bg-emerald-500/20 border-emerald-500 text-emerald-400 font-bold shadow-md shadow-emerald-500/15 scale-105 pointer-events-none';
                  } else {
                    tileStyle =
                      'bg-rose-500/20 border-rose-500 text-rose-400 font-medium opacity-60 pointer-events-none';
                  }
                } else if (currentQ.isAnswered && isCorrectMatch) {
                  tileStyle =
                    'border-emerald-500/50 bg-emerald-500/10 text-emerald-400 font-semibold';
                }

                return (
                  <button
                    key={idx}
                    type="button"
                    disabled={isSelected || currentQ.isAnswered}
                    onClick={() => handleSelectWord(wordStr)}
                    className={`p-4 rounded-2xl border text-center text-[13.5px] font-semibold tracking-tight transition-all duration-200 flex items-center justify-center min-h-[72px] sm:min-h-[76px] ${tileStyle}`}
                  >
                    <span className="truncate">{wordStr}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Bottom Bar Controls */}
          <div className="pt-6 pb-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                disabled={currentIndex === 0}
                onClick={handlePrevious}
                className="px-5 py-2.5 rounded-2xl bg-surface border border-border hover:bg-surface/80 text-muted hover:text-foreground text-sm font-semibold disabled:opacity-30 disabled:pointer-events-none transition-colors flex items-center gap-1 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>

              <span className="text-xs font-bold text-muted hidden sm:inline-block">
                {currentQ.isAnswered ? (
                  <span className="text-emerald-400">All found!</span>
                ) : (
                  <span>{remainingCount} more...</span>
                )}
              </span>
            </div>

            <div className="flex items-center gap-4">
              {/* Live Accuracy Percentage Badge */}
              {currentQ.selectedWords.size > 0 && (() => {
                const totalSelected = currentQ.selectedWords.size;
                const correctSelected = currentQ.correctAnswers.filter((a) =>
                  currentQ.selectedWords.has(a)
                ).length;
                const percentage = Math.round((correctSelected / totalSelected) * 100);

                let pctColor = 'text-amber-400 bg-amber-500/10 border-amber-500/20';
                if (percentage === 100) {
                  pctColor = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
                } else if (percentage < 50) {
                  pctColor = 'text-rose-400 bg-rose-500/10 border-rose-500/20';
                }

                return (
                  <div
                    className={`px-3 py-1.5 rounded-xl border text-sm font-extrabold tracking-tight ${pctColor} shadow-sm`}
                  >
                    {percentage}%
                  </div>
                );
              })()}

              <button
                type="button"
                disabled={!currentQ.isAnswered && currentQ.selectedWords.size === 0}
                onClick={handleNext}
                className={`px-6 py-3 rounded-2xl bg-gradient-to-r ${accentGradient} text-white text-sm font-bold shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2 cursor-pointer`}
              >
                <span>{currentIndex === questions.length - 1 ? 'Finish Matrix' : 'Next Word'}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Results Modal */}
      <QuizResultsModal
        isOpen={showResultsModal}
        correctAnswers={totalStats.totalCorrectSelected}
        totalQuestions={Math.max(totalStats.totalSelected, totalStats.totalExpected, 1)}
        onDone={() => router.push('/learn')}
        onRetake={initializeQuiz}
      />
    </div>
  );
}

export default function GridQuizPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        </div>
      }
    >
      <GridQuizContent />
    </Suspense>
  );
}
