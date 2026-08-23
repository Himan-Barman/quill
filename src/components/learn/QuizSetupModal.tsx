'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Layers,
  Sparkles,
  Calendar,
  History,
  LayoutGrid,
  CheckCircle2,
} from 'lucide-react';
import { LexoraCalendar } from '@/components/common/LexoraCalendar';
import type { WordData } from '@/hooks/useWordsData';

interface QuizSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  mode: 'synonym' | 'antonym';
  allWords: WordData[];
}

export function QuizSetupModal({
  isOpen,
  onClose,
  title,
  mode,
  allWords,
}: QuizSetupModalProps) {
  const router = useRouter();

  const [filterType, setFilterType] = useState<'all' | 'today' | 'yesterday' | 'date'>('all');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [quizFormat, setQuizFormat] = useState<'grid' | 'standard'>('grid');

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Set of dates where words exist
  const availableDateStrings = useMemo(() => {
    const set = new Set<string>();
    allWords.forEach((w) => {
      if (w.created_at) {
        const d = new Date(w.created_at);
        set.add(`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`);
      }
    });
    return set;
  }, [allWords]);

  // Target words matching date filter and valid mode lists
  const targetWords = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);

    let dateFiltered: WordData[] = allWords;

    if (filterType === 'today') {
      dateFiltered = allWords.filter((w) => {
        if (!w.created_at) return false;
        const d = new Date(w.created_at);
        return (
          d.getFullYear() === today.getFullYear() &&
          d.getMonth() === today.getMonth() &&
          d.getDate() === today.getDate()
        );
      });
    } else if (filterType === 'yesterday') {
      dateFiltered = allWords.filter((w) => {
        if (!w.created_at) return false;
        const d = new Date(w.created_at);
        return (
          d.getFullYear() === yesterday.getFullYear() &&
          d.getMonth() === yesterday.getMonth() &&
          d.getDate() === yesterday.getDate()
        );
      });
    } else if (filterType === 'date' && selectedDate) {
      dateFiltered = allWords.filter((w) => {
        if (!w.created_at) return false;
        const d = new Date(w.created_at);
        return (
          d.getFullYear() === selectedDate.getFullYear() &&
          d.getMonth() === selectedDate.getMonth() &&
          d.getDate() === selectedDate.getDate()
        );
      });
    }

    return dateFiltered.filter((w) => {
      if (mode === 'synonym') {
        return w.synonyms && w.synonyms.length > 0;
      }
      return w.antonyms && w.antonyms.length > 0;
    });
  }, [allWords, filterType, selectedDate, mode]);

  const handleStart = () => {
    if (targetWords.length === 0) return;

    let contextLabel = 'All Words';
    if (filterType === 'today') contextLabel = 'Today';
    else if (filterType === 'yesterday') contextLabel = 'Yesterday';
    else if (filterType === 'date' && selectedDate) {
      contextLabel = selectedDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
    }

    const wordIds = targetWords.map((w) => w.id);
    sessionStorage.setItem('lexora_quiz_pool', JSON.stringify(wordIds));

    onClose();

    if (quizFormat === 'grid') {
      router.push(
        `/learn/grid-quiz?mode=${mode}&context=${encodeURIComponent(contextLabel)}`
      );
    } else {
      router.push(
        `/learn/quiz?mode=${mode}&count=${Math.min(
          targetWords.length,
          10
        )}&context=${encodeURIComponent(contextLabel)}`
      );
    }
  };

  const accentColor = mode === 'synonym' ? 'text-purple-400' : 'text-teal-400';
  const borderActive = mode === 'synonym' ? 'border-purple-500 bg-purple-500/10 text-purple-400' : 'border-teal-500 bg-teal-500/10 text-teal-400';
  const btnColor = mode === 'synonym' ? 'bg-purple-600 hover:bg-purple-500' : 'bg-teal-600 hover:bg-teal-500';

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="relative w-full max-w-lg bg-surface border border-border rounded-2xl shadow-2xl z-10 flex flex-col max-h-[90vh] overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-border/50">
              <div>
                <h2 className="text-lg font-bold text-foreground">
                  {title}
                </h2>
                <p className="text-xs text-muted mt-0.5">
                  Customize your challenge format and words
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-full hover:bg-surface-hover text-muted hover:text-foreground transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Quiz Format Switcher */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-2.5">
                  Quiz Format
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setQuizFormat('grid')}
                    className={`p-3.5 rounded-xl border text-left flex flex-col justify-between transition-colors cursor-pointer ${
                      quizFormat === 'grid'
                        ? `${borderActive} font-bold`
                        : 'border-border/60 bg-surface hover:bg-surface-hover text-foreground'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <LayoutGrid className={`w-4 h-4 ${accentColor}`} />
                      {quizFormat === 'grid' && (
                        <CheckCircle2 className={`w-4 h-4 ${accentColor}`} />
                      )}
                    </div>
                    <div>
                      <div className="text-[13px] font-bold">30-Word Matrix (5×6)</div>
                      <div className="text-[11px] text-muted">
                        Find matching {mode}s in grid
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setQuizFormat('standard')}
                    className={`p-3.5 rounded-xl border text-left flex flex-col justify-between transition-colors cursor-pointer ${
                      quizFormat === 'standard'
                        ? `${borderActive} font-bold`
                        : 'border-border/60 bg-surface hover:bg-surface-hover text-foreground'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Layers className={`w-4 h-4 ${accentColor}`} />
                      {quizFormat === 'standard' && (
                        <CheckCircle2 className={`w-4 h-4 ${accentColor}`} />
                      )}
                    </div>
                    <div>
                      <div className="text-[13px] font-bold">4-Choice Quiz</div>
                      <div className="text-[11px] text-muted">
                        Classic multiple-choice
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Date Filter */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-2.5">
                  Filter by Date
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setFilterType('all')}
                    className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-colors cursor-pointer ${
                      filterType === 'all'
                        ? `${borderActive} font-bold`
                        : 'border-border/60 bg-surface hover:bg-surface-hover text-foreground'
                    }`}
                  >
                    <Sparkles className={`w-4 h-4 mb-2 ${accentColor}`} />
                    <span className="text-xs font-semibold">All Words</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFilterType('today')}
                    className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-colors cursor-pointer ${
                      filterType === 'today'
                        ? `${borderActive} font-bold`
                        : 'border-border/60 bg-surface hover:bg-surface-hover text-foreground'
                    }`}
                  >
                    <Calendar className={`w-4 h-4 mb-2 ${accentColor}`} />
                    <span className="text-xs font-semibold">Today</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFilterType('yesterday')}
                    className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-colors cursor-pointer ${
                      filterType === 'yesterday'
                        ? `${borderActive} font-bold`
                        : 'border-border/60 bg-surface hover:bg-surface-hover text-foreground'
                    }`}
                  >
                    <History className={`w-4 h-4 mb-2 ${accentColor}`} />
                    <span className="text-xs font-semibold">Yesterday</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFilterType('date')}
                    className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-colors cursor-pointer ${
                      filterType === 'date'
                        ? `${borderActive} font-bold`
                        : 'border-border/60 bg-surface hover:bg-surface-hover text-foreground'
                    }`}
                  >
                    <Calendar className={`w-4 h-4 mb-2 ${accentColor}`} />
                    <span className="text-xs font-semibold">Pick Date</span>
                  </button>
                </div>
              </div>

              {/* Day Picker */}
              {filterType === 'date' && (
                <div className="p-4 bg-surface border border-border/60 rounded-xl flex flex-col items-center">
                  <span className="text-xs font-semibold text-muted mb-2">
                    Choose date:
                  </span>
                  <LexoraCalendar
                    mode="single"
                    selectedDate={selectedDate}
                    onSelectDate={setSelectedDate}
                    availableDates={Array.from(availableDateStrings)}
                    accentColor={mode === 'synonym' ? '#A855F7' : '#14B8A6'}
                  />
                </div>
              )}

              {/* Words Available Card */}
              <div className="p-4 rounded-xl bg-surface border border-border/60 flex items-center justify-between">
                <div>
                  <span className="text-xs text-muted font-medium">Matching Words</span>
                  <div className="text-sm font-bold text-foreground">
                    {targetWords.length} Available
                  </div>
                </div>
                {targetWords.length === 0 ? (
                  <span className="text-xs font-semibold text-rose-500 bg-rose-500/10 px-2.5 py-1 rounded-full border border-rose-500/20">
                    No words with {mode}s
                  </span>
                ) : (
                  <span className="text-xs font-semibold text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                    Ready
                  </span>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="p-5 border-t border-border/50 flex items-center justify-between">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-sm font-semibold text-muted hover:text-foreground hover:bg-surface-hover transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={targetWords.length === 0}
                onClick={handleStart}
                className={`px-5 py-2.5 rounded-xl ${btnColor} text-white text-sm font-bold disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer`}
              >
                Start Quiz
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
