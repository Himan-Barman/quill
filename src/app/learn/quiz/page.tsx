'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Sparkles,
} from 'lucide-react';
import { useWordsData, type WordData } from '@/hooks/useWordsData';
import { useQuizHistory } from '@/hooks/useQuizHistory';
import { QuizResultsModal } from '@/components/learn/QuizResultsModal';

interface QuizQuestion {
  word: WordData;
  options: string[];
  correctAnswer: string;
  selectedAnswer?: string;
}

function QuizContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { words, isLoading: isWordsLoading } = useWordsData();
  const { saveQuizAttempt } = useQuizHistory();

  const mode = (searchParams.get('mode') || 'meaning') as 'meaning' | 'synonym' | 'antonym';
  const countParam = parseInt(searchParams.get('count') || '10', 10);
  const contextLabel = searchParams.get('context') || 'All Time';

  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showResultsModal, setShowResultsModal] = useState(false);

  const initializeQuiz = () => {
    if (words.length < 4) return;

    // Check if there is a specific word pool stored in sessionStorage
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

    // Filter valid words based on mode
    let validPool = sourcePool;
    if (mode === 'synonym') {
      validPool = sourcePool.filter((w) => w.synonyms && w.synonyms.length > 0);
    } else if (mode === 'antonym') {
      validPool = sourcePool.filter((w) => w.antonyms && w.antonyms.length > 0);
    }

    if (validPool.length === 0) return;

    const actualCount = Math.min(countParam, validPool.length);
    const shuffledSource = [...validPool].sort(() => Math.random() - 0.5).slice(0, actualCount);

    const generatedQuestions: QuizQuestion[] = shuffledSource.map((word) => {
      let correctAnswer = '';
      if (mode === 'synonym' && word.synonyms && word.synonyms.length > 0) {
        correctAnswer = word.synonyms[Math.floor(Math.random() * word.synonyms.length)];
      } else if (mode === 'antonym' && word.antonyms && word.antonyms.length > 0) {
        correctAnswer = word.antonyms[Math.floor(Math.random() * word.antonyms.length)];
      } else {
        correctAnswer = word.simple_meaning || word.meaning;
      }

      const optionSet = new Set<string>([correctAnswer]);
      let attempts = 0;

      while (optionSet.size < 4 && attempts < 150) {
        const randWord = words[Math.floor(Math.random() * words.length)];
        let distractor = '';

        if (mode === 'synonym' && randWord.synonyms && randWord.synonyms.length > 0) {
          distractor = randWord.synonyms[Math.floor(Math.random() * randWord.synonyms.length)];
        } else if (mode === 'antonym' && randWord.antonyms && randWord.antonyms.length > 0) {
          distractor = randWord.antonyms[Math.floor(Math.random() * randWord.antonyms.length)];
        } else {
          distractor = randWord.simple_meaning || randWord.meaning;
        }

        if (distractor && distractor.trim().length > 0) {
          optionSet.add(distractor);
        }
        attempts++;
      }

      while (optionSet.size < 4) {
        optionSet.add(`Option ${optionSet.size + 1}`);
      }

      const options = Array.from(optionSet).sort(() => Math.random() - 0.5);

      return {
        word,
        options,
        correctAnswer,
      };
    });

    setQuestions(generatedQuestions);
    setCurrentIndex(0);
    setIsCompleted(false);
    setShowResultsModal(false);
  };

  useEffect(() => {
    if (!isWordsLoading && words.length >= 4) {
      initializeQuiz();
    }
  }, [isWordsLoading, words, mode, countParam]);

  const currentQ = questions.length > 0 && currentIndex < questions.length ? questions[currentIndex] : null;

  const handleSelectOption = (option: string) => {
    if (!currentQ || currentQ.selectedAnswer !== undefined) return;

    setQuestions((prev) => {
      const updated = [...prev];
      updated[currentIndex] = {
        ...updated[currentIndex],
        selectedAnswer: option,
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

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      if (['1', '2', '3', '4'].includes(e.key)) {
        const optIndex = parseInt(e.key) - 1;
        if (currentQ && currentQ.options[optIndex]) {
          handleSelectOption(currentQ.options[optIndex]);
        }
      } else if (e.key === 'ArrowRight' || e.key === 'Enter') {
        if (currentQ?.selectedAnswer) {
          handleNext();
        }
      } else if (e.key === 'ArrowLeft') {
        handlePrevious();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentQ, currentIndex, questions]);

  const correctCount = useMemo(() => {
    return questions.filter((q) => q.selectedAnswer === q.correctAnswer).length;
  }, [questions]);

  const finishQuiz = async () => {
    setIsCompleted(true);
    setShowResultsModal(true);

    const quizTypeTitle =
      mode === 'synonym'
        ? 'Synonyms Quiz'
        : mode === 'antonym'
        ? 'Antonyms Quiz'
        : 'Mastery Challenge';

    await saveQuizAttempt({
      quizType: quizTypeTitle,
      quizContext: contextLabel,
      totalExpected: correctCount,
      totalSelected: questions.length,
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
        <h2 className="text-2xl font-bold text-foreground mb-2">Not Enough Words</h2>
        <p className="text-sm text-foreground-variant max-w-sm mb-6">
          You need more words matching this filter to generate a full challenge.
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

  const promptTitle =
    mode === 'synonym'
      ? 'Find the synonym for:'
      : mode === 'antonym'
      ? 'Find the antonym for:'
      : 'What is the meaning of:';

  const accentGradient =
    mode === 'synonym'
      ? 'from-purple-600 to-indigo-600'
      : mode === 'antonym'
      ? 'from-teal-500 to-emerald-500'
      : 'from-pink-500 to-rose-500';

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
            {contextLabel}
          </span>
        </div>

        <div className="px-3.5 py-1.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-bold shadow-sm">
          {currentIndex + 1} / {questions.length}
        </div>
      </div>

      {/* Main Question Area */}
      {currentQ && (
        <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 flex flex-col justify-between">
          <div className="space-y-6 w-full">
            {/* Word Header Pod */}
            <div className="p-6 sm:p-8 rounded-3xl bg-surface border border-border/60 shadow-xl">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
                  {promptTitle}
                </span>
                {currentQ.word.part_of_speech && (
                  <span className="text-[11px] font-semibold italic text-muted bg-surface/80 px-2 py-0.5 rounded-md border border-border/40">
                    {currentQ.word.part_of_speech}
                  </span>
                )}
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
                {currentQ.word.word}
              </h1>
              {currentQ.word.ipa && (
                <span className="text-sm font-mono text-muted mt-1 block">
                  /{currentQ.word.ipa}/
                </span>
              )}
            </div>

            {/* Multiple Choice Options */}
            <div className="space-y-3">
              {currentQ.options.map((option, idx) => {
                const isSelected = currentQ.selectedAnswer === option;
                const isCorrect = option === currentQ.correctAnswer;
                const isAnswered = currentQ.selectedAnswer !== undefined;

                let cardStyle =
                  'bg-surface border-border/60 hover:border-blue-500/40 text-foreground';
                let indicatorStyle =
                  'bg-surface text-muted border-border';

                if (isAnswered) {
                  if (isCorrect) {
                    cardStyle =
                      'bg-emerald-500/15 border-emerald-500 text-emerald-400 font-semibold shadow-md shadow-emerald-500/10';
                    indicatorStyle = 'bg-emerald-500 text-white border-emerald-500';
                  } else if (isSelected && !isCorrect) {
                    cardStyle =
                      'bg-rose-500/15 border-rose-500 text-rose-400 font-semibold';
                    indicatorStyle = 'bg-rose-500 text-white border-rose-500';
                  } else {
                    cardStyle =
                      'opacity-40 border-border/20 bg-surface/40 text-muted';
                  }
                }

                return (
                  <button
                    key={idx}
                    type="button"
                    disabled={isAnswered}
                    onClick={() => handleSelectOption(option)}
                    className={`w-full p-5 sm:p-5.5 min-h-[66px] rounded-2xl border text-left flex items-center justify-between gap-4 transition-all duration-200 cursor-pointer ${cardStyle}`}
                  >
                    <div className="flex items-center gap-3.5 flex-1 min-w-0">
                      <div
                        className={`w-8 h-8 rounded-xl border flex items-center justify-center text-xs font-bold flex-shrink-0 transition-colors ${indicatorStyle}`}
                      >
                        {idx + 1}
                      </div>
                      <span className="text-[15px] leading-snug flex-1">{option}</span>
                    </div>

                    {isAnswered && (
                      <div className="flex-shrink-0">
                        {isCorrect ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                        ) : isSelected ? (
                          <XCircle className="w-5 h-5 text-rose-400" />
                        ) : null}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Bottom Bar Controls */}
          <div className="w-full pt-6 pb-4 flex items-center justify-between gap-4">
            <button
              type="button"
              disabled={currentIndex === 0}
              onClick={handlePrevious}
              className="px-5 py-2.5 rounded-2xl bg-surface border border-border hover:bg-surface/80 text-muted hover:text-foreground text-sm font-semibold disabled:opacity-30 disabled:pointer-events-none transition-colors flex items-center gap-1 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            <button
              type="button"
              disabled={!currentQ.selectedAnswer}
              onClick={handleNext}
              className={`px-6 py-3 rounded-2xl bg-gradient-to-r ${accentGradient} text-white text-sm font-bold shadow-lg hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none transition-all flex items-center gap-2 cursor-pointer`}
            >
              <span>{currentIndex === questions.length - 1 ? 'Finish Challenge' : 'Next'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Results Modal */}
      <QuizResultsModal
        isOpen={showResultsModal}
        correctAnswers={correctCount}
        totalQuestions={questions.length}
        onDone={() => router.push('/learn')}
        onRetake={initializeQuiz}
      />
    </div>
  );
}

export default function QuizPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        </div>
      }
    >
      <QuizContent />
    </Suspense>
  );
}
