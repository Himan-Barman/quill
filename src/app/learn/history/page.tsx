'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Trophy,
  History,
  Trash2,
  Calendar,
  Clock,
  Search,
} from 'lucide-react';
import { useQuizHistory } from '@/hooks/useQuizHistory';

export default function QuizHistoryPage() {
  const router = useRouter();
  const { history, isLoading, clearHistory, deleteAttempt } = useQuizHistory();
  const [searchQuery, setSearchQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const filteredHistory = useMemo(() => {
    if (!searchQuery.trim()) return history;
    const q = searchQuery.toLowerCase();
    return history.filter(
      (record) =>
        record.quizType.toLowerCase().includes(q) ||
        (record.quizContext && record.quizContext.toLowerCase().includes(q))
    );
  }, [history, searchQuery]);

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto h-full flex flex-col relative pb-24 w-full select-none">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between gap-4 mb-6 relative z-40 pt-2">
        {/* Back Button */}
        <button
          onClick={() => router.push('/learn')}
          className="w-12 h-12 rounded-full bg-surface/50 border border-border flex items-center justify-center text-muted hover:text-foreground transition-all shadow-[0_4px_20px_rgba(0,0,0,0.3)] backdrop-blur-md cursor-pointer shrink-0"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        {/* Liquid Glass Search Bar Capsule */}
        <div className="flex-1 max-w-2xl mx-auto w-full">
          <motion.div
            className="relative w-full mx-auto"
            initial={false}
            animate={{ maxWidth: isFocused || searchQuery ? '42rem' : '32rem' }}
            transition={{ type: 'spring', stiffness: 350, damping: 32 }}
          >
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4.5 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-muted group-focus-within:text-blue-400 transition-colors" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                className="block w-full pl-12 pr-4 py-3.5 bg-surface/50 border border-border rounded-full text-foreground placeholder-muted/50 focus:ring-0 focus:border-blue-500 outline-none transition-all shadow-[0_4px_20px_rgba(0,0,0,0.3)] backdrop-blur-md text-[16px]"
                placeholder="Search quiz attempts..."
              />
            </div>
          </motion.div>
        </div>

        {/* Top-Right Clear Action */}
        <div className="shrink-0">
          {history.length > 0 ? (
            <button
              onClick={clearHistory}
              className="flex items-center gap-2 px-4 py-3 bg-surface/50 border border-border rounded-full text-muted hover:text-rose-400 hover:border-rose-500/40 transition-all shadow-[0_4px_20px_rgba(0,0,0,0.3)] backdrop-blur-md text-[14px] font-semibold cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>Clear</span>
            </button>
          ) : (
            <div className="w-20" />
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto min-h-0 w-full">
        {isLoading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-8 h-8 rounded-full border-2 border-blue-400 border-t-transparent animate-spin" />
          </div>
        ) : filteredHistory.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[50vh]">
            <div className="w-16 h-16 rounded-3xl glass-card flex items-center justify-center mb-4 text-muted">
              <History className="w-8 h-8 text-muted" />
            </div>
            <p className="text-muted text-sm font-medium">
              {searchQuery ? 'No quiz attempts matching search.' : 'No quiz attempts recorded yet.'}
            </p>
          </div>
        ) : (
          <div className="space-y-3 pb-8">
            {filteredHistory.map((record) => {
              const percentage =
                record.totalSelected > 0
                  ? Math.round((record.totalExpected / record.totalSelected) * 100)
                  : 0;

              let iconBg = 'bg-orange-500/10';
              let iconColor = 'text-orange-400';
              if (percentage === 100) {
                iconBg = 'bg-emerald-500/10';
                iconColor = 'text-emerald-400';
              } else if (percentage < 50) {
                iconBg = 'bg-rose-500/10';
                iconColor = 'text-rose-400';
              }

              const dateObj = new Date(record.completedAt);
              const dateFormatted = dateObj.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              });
              const timeFormatted = dateObj.toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true,
              });

              return (
                <div
                  key={record.id}
                  className="flex items-center p-4 bg-surface border border-border/50 rounded-2xl relative select-none hover:border-border-hover transition-colors"
                >
                  {/* Icon Badge */}
                  <div
                    className={`w-10 h-10 rounded-full ${iconBg} flex items-center justify-center shrink-0`}
                  >
                    {percentage === 100 ? (
                      <Trophy className={`w-5 h-5 ${iconColor}`} />
                    ) : (
                      <History className={`w-5 h-5 ${iconColor}`} />
                    )}
                  </div>

                  {/* Info */}
                  <div className="ml-4 flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-foreground font-bold text-[16px] truncate">
                        {record.quizType}
                      </h3>
                      {record.quizContext && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 uppercase tracking-wider">
                          {record.quizContext}
                        </span>
                      )}
                    </div>
                    <p className="text-muted text-[12px] truncate mt-0.5 flex items-center gap-2">
                      <span>{dateFormatted}</span>
                      <span>•</span>
                      <span>{timeFormatted}</span>
                    </p>
                  </div>

                  {/* Score & Actions */}
                  <div className="ml-2 shrink-0 flex items-center gap-4">
                    <div className="text-right">
                      <div className={`text-lg font-extrabold ${iconColor}`}>
                        {percentage}%
                      </div>
                      <div className="text-[11px] font-semibold text-muted">
                        {record.totalExpected} / {record.totalSelected}
                      </div>
                    </div>

                    <button
                      onClick={() => deleteAttempt(record.id)}
                      className="p-2 rounded-full hover:bg-rose-500/10 text-muted hover:text-rose-400 transition-colors cursor-pointer"
                      title="Delete attempt"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
