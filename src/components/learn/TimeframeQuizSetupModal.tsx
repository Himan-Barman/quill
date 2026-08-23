'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Sparkles,
  History,
  Calendar,
  CalendarDays,
  CalendarRange,
} from 'lucide-react';
import { DateRange } from 'react-day-picker';
import { LexoraCalendar } from '@/components/common/LexoraCalendar';
import type { WordData } from '@/hooks/useWordsData';

interface TimeframeQuizSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  allWords: WordData[];
}

type TimeframeType =
  | 'allTime'
  | 'yesterday'
  | 'particularDay'
  | 'thisWeek'
  | 'thisMonth'
  | 'customRange';

export function TimeframeQuizSetupModal({
  isOpen,
  onClose,
  allWords,
}: TimeframeQuizSetupModalProps) {
  const router = useRouter();

  const [timeframe, setTimeframe] = useState<TimeframeType>('allTime');
  const [selectedSingleDate, setSelectedSingleDate] = useState<Date | undefined>(undefined);
  const [dateRange, setDateRange] = useState<DateRange>({ from: undefined, to: undefined });
  const [selectedQuestionCount, setSelectedQuestionCount] = useState<number | null>(null);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Set of dates where words were added
  const availableDatesSet = useMemo(() => {
    const set = new Set<string>();
    allWords.forEach((w) => {
      if (w.created_at) {
        const d = new Date(w.created_at);
        set.add(`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`);
      }
    });
    return set;
  }, [allWords]);

  // Filter words by selected timeframe
  const filteredWords = useMemo(() => {
    const now = new Date();
    let start: Date;
    let end: Date;

    switch (timeframe) {
      case 'allTime':
        return allWords;

      case 'yesterday': {
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 0, 0, 0);
        end = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 23, 59, 59, 999);
        break;
      }

      case 'particularDay': {
        if (!selectedSingleDate) return [];
        start = new Date(
          selectedSingleDate.getFullYear(),
          selectedSingleDate.getMonth(),
          selectedSingleDate.getDate(),
          0,
          0,
          0
        );
        end = new Date(
          selectedSingleDate.getFullYear(),
          selectedSingleDate.getMonth(),
          selectedSingleDate.getDate(),
          23,
          59,
          59,
          999
        );
        break;
      }

      case 'thisWeek': {
        const dayOfWeek = now.getDay();
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - dayOfWeek, 0, 0, 0);
        end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
        break;
      }

      case 'thisMonth': {
        start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
        end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
        break;
      }

      case 'customRange': {
        if (!dateRange.from) return [];
        start = new Date(
          dateRange.from.getFullYear(),
          dateRange.from.getMonth(),
          dateRange.from.getDate(),
          0,
          0,
          0
        );
        const toDate = dateRange.to || dateRange.from;
        end = new Date(
          toDate.getFullYear(),
          toDate.getMonth(),
          toDate.getDate(),
          23,
          59,
          59,
          999
        );
        break;
      }
    }

    return allWords.filter((w) => {
      if (!w.created_at) return false;
      const d = new Date(w.created_at);
      return d >= start && d <= end;
    });
  }, [allWords, timeframe, selectedSingleDate, dateRange]);

  // Question count options
  const countOptions = useMemo(() => {
    const total = filteredWords.length;
    if (total === 0) return [];
    if (total <= 10) return [total];
    const opts = [10];
    if (total >= 20) opts.push(20);
    if (total >= 50) opts.push(50);
    if (!opts.includes(total)) opts.push(total);
    return opts;
  }, [filteredWords.length]);

  const effectiveCount =
    selectedQuestionCount !== null && countOptions.includes(selectedQuestionCount)
      ? selectedQuestionCount
      : countOptions.length > 0
      ? countOptions[0]
      : 0;

  const handleStartQuiz = () => {
    if (filteredWords.length < 4) return;

    let contextLabel = 'All Time';
    if (timeframe === 'yesterday') contextLabel = 'Yesterday';
    else if (timeframe === 'particularDay' && selectedSingleDate) {
      contextLabel = selectedSingleDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
    } else if (timeframe === 'thisWeek') contextLabel = 'This Week';
    else if (timeframe === 'thisMonth') contextLabel = 'This Month';
    else if (timeframe === 'customRange') contextLabel = 'Custom Range';

    const wordIds = filteredWords.map((w) => w.id);
    sessionStorage.setItem('lexora_quiz_pool', JSON.stringify(wordIds));

    onClose();
    router.push(
      `/learn/quiz?mode=meaning&count=${effectiveCount}&context=${encodeURIComponent(
        contextLabel
      )}`
    );
  };

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
            className="relative w-full max-w-xl bg-surface border border-border rounded-2xl shadow-2xl z-10 flex flex-col max-h-[90vh] overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-border/50">
              <div>
                <h2 className="text-lg font-bold text-foreground">
                  Mastery Challenge
                </h2>
                <p className="text-xs text-muted mt-0.5">
                  Select a timeframe to test your recall
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
              {/* Timeframe Grid Selection */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-2.5">
                  Choose Timeframe
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setTimeframe('allTime')}
                    className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-colors cursor-pointer ${
                      timeframe === 'allTime'
                        ? 'border-blue-500 bg-blue-500/10 text-blue-400 font-semibold'
                        : 'border-border/60 bg-surface hover:bg-surface-hover text-foreground'
                    }`}
                  >
                    <Sparkles className="w-4 h-4 mb-2 text-blue-400" />
                    <div>
                      <div className="text-[13px] font-bold">All Time</div>
                      <div className="text-[11px] text-muted">Entire vocabulary</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTimeframe('yesterday')}
                    className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-colors cursor-pointer ${
                      timeframe === 'yesterday'
                        ? 'border-blue-500 bg-blue-500/10 text-blue-400 font-semibold'
                        : 'border-border/60 bg-surface hover:bg-surface-hover text-foreground'
                    }`}
                  >
                    <History className="w-4 h-4 mb-2 text-blue-400" />
                    <div>
                      <div className="text-[13px] font-bold">Yesterday</div>
                      <div className="text-[11px] text-muted">Yesterday&apos;s words</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTimeframe('particularDay')}
                    className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-colors cursor-pointer ${
                      timeframe === 'particularDay'
                        ? 'border-blue-500 bg-blue-500/10 text-blue-400 font-semibold'
                        : 'border-border/60 bg-surface hover:bg-surface-hover text-foreground'
                    }`}
                  >
                    <Calendar className="w-4 h-4 mb-2 text-blue-400" />
                    <div>
                      <div className="text-[13px] font-bold">Single Day</div>
                      <div className="text-[11px] text-muted">Pick a date</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTimeframe('thisWeek')}
                    className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-colors cursor-pointer ${
                      timeframe === 'thisWeek'
                        ? 'border-blue-500 bg-blue-500/10 text-blue-400 font-semibold'
                        : 'border-border/60 bg-surface hover:bg-surface-hover text-foreground'
                    }`}
                  >
                    <CalendarDays className="w-4 h-4 mb-2 text-blue-400" />
                    <div>
                      <div className="text-[13px] font-bold">This Week</div>
                      <div className="text-[11px] text-muted">Last 7 days</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTimeframe('thisMonth')}
                    className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-colors cursor-pointer ${
                      timeframe === 'thisMonth'
                        ? 'border-blue-500 bg-blue-500/10 text-blue-400 font-semibold'
                        : 'border-border/60 bg-surface hover:bg-surface-hover text-foreground'
                    }`}
                  >
                    <CalendarRange className="w-4 h-4 mb-2 text-blue-400" />
                    <div>
                      <div className="text-[13px] font-bold">This Month</div>
                      <div className="text-[11px] text-muted">Current month</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTimeframe('customRange')}
                    className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-colors cursor-pointer ${
                      timeframe === 'customRange'
                        ? 'border-blue-500 bg-blue-500/10 text-blue-400 font-semibold'
                        : 'border-border/60 bg-surface hover:bg-surface-hover text-foreground'
                    }`}
                  >
                    <CalendarRange className="w-4 h-4 mb-2 text-blue-400" />
                    <div>
                      <div className="text-[13px] font-bold">Custom Range</div>
                      <div className="text-[11px] text-muted">Select date span</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Day Picker */}
              {timeframe === 'particularDay' && (
                <div className="p-4 bg-surface border border-border/60 rounded-xl flex flex-col items-center">
                  <span className="text-xs font-semibold text-muted mb-2">
                    Select a date:
                  </span>
                  <LexoraCalendar
                    mode="single"
                    selectedDate={selectedSingleDate}
                    onSelectDate={setSelectedSingleDate}
                    availableDates={Array.from(availableDatesSet)}
                    accentColor="#3B82F6"
                  />
                </div>
              )}

              {/* Custom Date Range Picker */}
              {timeframe === 'customRange' && (
                <div className="p-4 bg-surface border border-border/60 rounded-xl flex flex-col items-center">
                  <span className="text-xs font-semibold text-muted mb-2">
                    Select start and end dates:
                  </span>
                  <LexoraCalendar
                    mode="range"
                    selectedRange={dateRange}
                    onSelectRange={(range) => setDateRange(range || { from: undefined, to: undefined })}
                    availableDates={Array.from(availableDatesSet)}
                    accentColor="#3B82F6"
                  />
                </div>
              )}

              {/* Available Words Counter */}
              <div className="p-4 rounded-xl bg-surface border border-border/60 flex items-center justify-between">
                <div>
                  <span className="text-xs text-muted font-medium">Available Words</span>
                  <div className="text-sm font-bold text-foreground">
                    {filteredWords.length} Words in Pool
                  </div>
                </div>
                {filteredWords.length < 4 ? (
                  <span className="text-xs font-semibold text-rose-500 bg-rose-500/10 px-2.5 py-1 rounded-full border border-rose-500/20">
                    Min 4 required
                  </span>
                ) : (
                  <span className="text-xs font-semibold text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                    Ready
                  </span>
                )}
              </div>

              {/* Question Count Selector */}
              {countOptions.length > 0 && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">
                    Question Count
                  </label>
                  <div className="flex items-center gap-2">
                    {countOptions.map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setSelectedQuestionCount(opt)}
                        className={`flex-1 py-2 rounded-lg border text-xs font-bold transition-colors cursor-pointer ${
                          effectiveCount === opt
                            ? 'border-blue-500 bg-blue-500/15 text-blue-400'
                            : 'border-border/60 bg-surface text-muted hover:text-foreground'
                        }`}
                      >
                        {opt} {opt === filteredWords.length ? '(All)' : 'Q'}
                      </button>
                    ))}
                  </div>
                </div>
              )}
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
                disabled={filteredWords.length < 4}
                onClick={handleStartQuiz}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer"
              >
                Start Challenge
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
