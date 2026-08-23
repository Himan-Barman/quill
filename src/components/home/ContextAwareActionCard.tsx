'use client';

import { motion } from 'framer-motion';
import { BookOpen, Sparkles } from 'lucide-react';

interface ContextAwareActionCardProps {
  reviewDueCount: number;
  onActionPressed: () => void;
}

export function ContextAwareActionCard({ reviewDueCount, onActionPressed }: ContextAwareActionCardProps) {
  const hasReviews = reviewDueCount > 0;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`p-6 rounded-2xl border transition-all ${hasReviews
          ? 'bg-blue-500/10 border-blue-500/30'
          : 'bg-surface border-border'
        }`}
    >
      <div className="flex items-center">
        <div className={`p-4 rounded-full mr-5 ${hasReviews ? 'bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)]' : 'bg-surface-active text-foreground'
          }`}>
          {hasReviews ? <BookOpen className="w-7 h-7" /> : <Sparkles className="w-7 h-7" />}
        </div>

        <div className="flex-1">
          <h3 className="text-xl font-bold text-foreground mb-1">
            {hasReviews ? `${reviewDueCount} Words Ready to Review` : 'Learn 5 New Words Today'}
          </h3>
          <p className="text-muted text-sm">
            {hasReviews ? `Estimated time: ${Math.ceil(reviewDueCount * 0.5)} min` : 'Continue building your vocabulary.'}
          </p>
        </div>

        <button
          onClick={onActionPressed}
          className={`px-6 py-2.5 rounded-full font-medium transition-all ${hasReviews
              ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_15px_rgba(37,99,235,0.3)]'
              : 'bg-foreground hover:bg-foreground/80 text-background'
            }`}
        >
          {hasReviews ? 'Start' : 'Learn'}
        </button>
      </div>
    </motion.div>
  );
}
