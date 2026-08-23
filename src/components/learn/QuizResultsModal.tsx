'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, ThumbsUp, TrendingUp, RotateCcw } from 'lucide-react';

interface QuizResultsModalProps {
  isOpen: boolean;
  correctAnswers: number;
  totalQuestions: number;
  onDone: () => void;
  onRetake?: () => void;
}

export function QuizResultsModal({
  isOpen,
  correctAnswers,
  totalQuestions,
  onDone,
  onRetake,
}: QuizResultsModalProps) {
  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onDone();
    };
    if (isOpen) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onDone]);

  const percentage = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;

  let title = 'Keep Practicing!';
  let subtitle = 'Every mistake is an opportunity to learn and grow.';
  let highlightColor = '#F59E0B'; // Amber
  let Icon = RotateCcw;

  if (percentage >= 90) {
    title = 'Outstanding!';
    subtitle = 'You have truly mastered these words!';
    highlightColor = '#EAB308'; // Gold
    Icon = Trophy;
  } else if (percentage >= 70) {
    title = 'Great Job!';
    subtitle = 'You are making excellent learning progress.';
    highlightColor = '#10B981'; // Emerald
    Icon = ThumbsUp;
  } else if (percentage >= 50) {
    title = 'Good Effort!';
    subtitle = 'Keep practicing, you are getting closer to mastery.';
    highlightColor = '#3B82F6'; // Blue
    Icon = TrendingUp;
  }

  // SVG Circular progress radius
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onDone}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="relative w-full max-w-md bg-surface border border-border rounded-2xl p-7 shadow-2xl z-10 flex flex-col items-center text-center"
          >
            {/* Radial Score Gauge */}
            <div className="relative w-36 h-36 flex items-center justify-center mb-6">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="72"
                  cy="72"
                  r={radius}
                  stroke="currentColor"
                  strokeWidth="8"
                  className="text-surface-hover"
                  fill="transparent"
                />
                <circle
                  cx="72"
                  cy="72"
                  r={radius}
                  stroke={highlightColor}
                  strokeWidth="8"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  fill="transparent"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>

              {/* Inner Content */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-foreground tracking-tight">
                  {percentage}%
                </span>
                <span className="text-xs font-semibold text-muted">
                  {correctAnswers} / {totalQuestions}
                </span>
              </div>
            </div>

            {/* Motivational Icon Pod */}
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center mb-3"
              style={{ backgroundColor: `${highlightColor}15`, color: highlightColor }}
            >
              <Icon className="w-6 h-6" />
            </div>

            {/* Title & Subtitle */}
            <h2 className="text-xl font-bold text-foreground tracking-tight mb-1">
              {title}
            </h2>
            <p className="text-sm text-muted max-w-xs leading-relaxed mb-6">
              {subtitle}
            </p>

            {/* Actions */}
            <div className="w-full space-y-2.5">
              <button
                type="button"
                onClick={onDone}
                className="w-full py-3 px-6 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm transition-colors flex items-center justify-center cursor-pointer"
              >
                Done
              </button>

              {onRetake && (
                <button
                  type="button"
                  onClick={onRetake}
                  className="w-full py-2.5 px-6 rounded-xl bg-surface hover:bg-surface-hover border border-border text-foreground font-semibold text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Retake Quiz</span>
                </button>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
