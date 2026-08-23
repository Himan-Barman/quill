'use client';

import { motion } from 'framer-motion';
import { BookOpen, FileText, ChevronRight } from 'lucide-react';

export interface RecentItem {
  id: string;
  title: string;
  type: 'Word' | 'Document' | 'Thread';
  date: string;
  status: 'Mastered' | 'Review Due' | 'Learning';
}

interface RecentItemsListProps {
  title: string;
  items: RecentItem[];
  onViewAll: () => void;
}

export function RecentItemsList({ title, items, onViewAll }: RecentItemsListProps) {
  if (items.length === 0) return null;

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4 px-2">
        <h2 className="text-xl font-bold text-foreground">{title}</h2>
        <button
          onClick={onViewAll}
          className="text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors flex items-center"
        >
          See All <ChevronRight className="w-4 h-4 ml-1" />
        </button>
      </div>

      <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-lg">
        <div className="divide-y divide-border">
          {items.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="group flex items-center justify-between p-4 bg-surface hover:bg-surface-active transition-all cursor-pointer"
            >
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 rounded-xl bg-background flex items-center justify-center border border-border group-hover:border-blue-500/50 transition-colors">
                  {item.type === 'Word' ? (
                    <BookOpen className="w-5 h-5 text-blue-400" />
                  ) : (
                    <FileText className="w-5 h-5 text-purple-400" />
                  )}
                </div>
                <div>
                  <h4 className="text-foreground font-medium mb-1">{item.title}</h4>
                  <div className="flex items-center space-x-2 text-xs text-muted">
                    <span>{item.type}</span>
                    <span>•</span>
                    <span>{item.date}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center">
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${item.status === 'Mastered' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                    item.status === 'Review Due' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' :
                      'bg-blue-500/10 text-blue-400 border-blue-500/20'
                  }`}>
                  {item.status}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
