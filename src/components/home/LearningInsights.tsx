'use client';

import { motion } from 'framer-motion';
import { Lightbulb } from 'lucide-react';

export interface Insight {
  id: string;
  title: string;
  description: string;
}

interface LearningInsightsProps {
  insights: Insight[];
}

export function LearningInsights({ insights }: LearningInsightsProps) {
  if (insights.length === 0) return null;

  return (
    <div className="mb-8">
      <h2 className="text-xl font-bold text-foreground mb-4 px-2">Learning Insights</h2>

      <div className="space-y-4">
        {insights.map((insight, index) => (
          <motion.div
            key={insight.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="p-5 rounded-2xl bg-surface border border-border flex items-start space-x-4"
          >
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 shrink-0">
              <Lightbulb className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <h4 className="text-foreground font-bold mb-1">{insight.title}</h4>
              <p className="text-sm text-muted leading-relaxed">{insight.description}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
