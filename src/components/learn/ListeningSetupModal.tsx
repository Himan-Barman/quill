'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Sparkles, History, Headphones } from 'lucide-react';
import { LexoraCalendar } from '@/components/common/LexoraCalendar';
import type { WordData } from '@/hooks/useWordsData';

interface ListeningSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  allWords: WordData[];
}

export function ListeningSetupModal({
  isOpen,
  onClose,
  allWords,
}: ListeningSetupModalProps) {
  const router = useRouter();
  const [filterType, setFilterType] = useState<'all' | 'today' | 'yesterday' | 'date'>('all');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Available dates where words exist
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

  // Target words count
  const targetWords = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);

    if (filterType === 'all') return allWords;

    if (filterType === 'today') {
      return allWords.filter((w) => {
        if (!w.created_at) return false;
        const d = new Date(w.created_at);
        return (
          d.getFullYear() === today.getFullYear() &&
          d.getMonth() === today.getMonth() &&
          d.getDate() === today.getDate()
        );
      });
    }

    if (filterType === 'yesterday') {
      return allWords.filter((w) => {
        if (!w.created_at) return false;
        const d = new Date(w.created_at);
        return (
          d.getFullYear() === yesterday.getFullYear() &&
          d.getMonth() === yesterday.getMonth() &&
          d.getDate() === yesterday.getDate()
        );
      });
    }

    if (filterType === 'date' && selectedDate) {
      return allWords.filter((w) => {
        if (!w.created_at) return false;
        const d = new Date(w.created_at);
        return (
          d.getFullYear() === selectedDate.getFullYear() &&
          d.getMonth() === selectedDate.getMonth() &&
          d.getDate() === selectedDate.getDate()
        );
      });
    }

    return [];
  }, [allWords, filterType, selectedDate]);

  const handleStart = () => {
    if (targetWords.length === 0) return;

    let dateParam = 'all';
    if (filterType === 'today') dateParam = 'today';
    else if (filterType === 'yesterday') dateParam = 'yesterday';
    else if (filterType === 'date' && selectedDate) {
      dateParam = selectedDate.toISOString();
    }

    onClose();
    router.push(`/learn/listening?filter=${encodeURIComponent(dateParam)}`);
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
            className="relative w-full max-w-md bg-surface border border-border rounded-2xl shadow-2xl z-10 flex flex-col max-h-[90vh] overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-border/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                  <Headphones className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-foreground">
                    Listening Mode
                  </h2>
                  <p className="text-xs text-muted mt-0.5">
                    Hands-free audio vocabulary
                  </p>
                </div>
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
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-2.5">
                  Select Playlist Words
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setFilterType('all')}
                    className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-colors cursor-pointer ${
                      filterType === 'all'
                        ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400 font-bold'
                        : 'border-border/60 bg-surface hover:bg-surface-hover text-foreground'
                    }`}
                  >
                    <Sparkles className="w-4 h-4 mb-2 text-emerald-400" />
                    <span className="text-xs font-semibold">All Words ({allWords.length})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFilterType('today')}
                    className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-colors cursor-pointer ${
                      filterType === 'today'
                        ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400 font-bold'
                        : 'border-border/60 bg-surface hover:bg-surface-hover text-foreground'
                    }`}
                  >
                    <Calendar className="w-4 h-4 mb-2 text-emerald-400" />
                    <span className="text-xs font-semibold">Today</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFilterType('yesterday')}
                    className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-colors cursor-pointer ${
                      filterType === 'yesterday'
                        ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400 font-bold'
                        : 'border-border/60 bg-surface hover:bg-surface-hover text-foreground'
                    }`}
                  >
                    <History className="w-4 h-4 mb-2 text-emerald-400" />
                    <span className="text-xs font-semibold">Yesterday</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFilterType('date')}
                    className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-colors cursor-pointer ${
                      filterType === 'date'
                        ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400 font-bold'
                        : 'border-border/60 bg-surface hover:bg-surface-hover text-foreground'
                    }`}
                  >
                    <Calendar className="w-4 h-4 mb-2 text-emerald-400" />
                    <span className="text-xs font-semibold">Select Date</span>
                  </button>
                </div>
              </div>

              {/* Calendar */}
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
                    accentColor="#10B981"
                  />
                </div>
              )}

              {/* Words Count */}
              <div className="p-4 rounded-xl bg-surface border border-border/60 flex items-center justify-between">
                <div>
                  <span className="text-xs text-muted font-medium">Selected Playlist</span>
                  <div className="text-sm font-bold text-foreground">
                    {targetWords.length} Words to Play
                  </div>
                </div>
                {targetWords.length === 0 ? (
                  <span className="text-xs font-semibold text-rose-500 bg-rose-500/10 px-2.5 py-1 rounded-full border border-rose-500/20">
                    No words
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
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer"
              >
                Start Listening
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
