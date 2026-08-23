'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Quote, GitFork, FileText, ChevronRight, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { DocType } from '@/hooks/useDocsData';

interface NewDocTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NewDocTypeModal({ isOpen, onClose }: NewDocTypeModalProps) {
  const router = useRouter();

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleSelect = (type: DocType) => {
    onClose();
    router.push(`/docs/new?type=${type}`);
  };

  const options = [
    {
      type: 'snippet' as DocType,
      title: 'Quick Snippet',
      subtitle: 'Capture a single quote, highlight, or bite-sized idea',
      icon: Quote,
      iconColor: 'text-blue-400',
      iconBg: 'bg-blue-500/10',
    },
    {
      type: 'thread' as DocType,
      title: 'Thought Thread',
      subtitle: 'Chain connected ideas, notes, or quotes on a timeline',
      icon: GitFork,
      iconColor: 'text-purple-400',
      iconBg: 'bg-purple-500/10',
    },
    {
      type: 'document' as DocType,
      title: 'Comprehensive Document',
      subtitle: 'Rich text article with headings, lists, code, and links',
      icon: FileText,
      iconColor: 'text-amber-400',
      iconBg: 'bg-amber-500/10',
    },
  ];

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
            className="relative w-full max-w-lg bg-surface border border-border rounded-2xl p-6 shadow-2xl z-10"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-lg font-bold text-foreground">Create New</h3>
                <p className="text-muted text-xs mt-0.5">Select a document format to get started</p>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-full hover:bg-surface-hover text-muted hover:text-foreground transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Options List */}
            <div className="space-y-3">
              {options.map((opt) => {
                const Icon = opt.icon;
                return (
                  <button
                    key={opt.type}
                    onClick={() => handleSelect(opt.type)}
                    className="w-full p-4 rounded-xl bg-surface hover:bg-surface-hover border border-border/60 hover:border-border flex items-center gap-4 text-left cursor-pointer transition-colors group"
                  >
                    <div
                      className={`w-10 h-10 rounded-full ${opt.iconBg} flex items-center justify-center shrink-0`}
                    >
                      <Icon className={`w-5 h-5 ${opt.iconColor}`} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="text-foreground font-bold text-sm group-hover:text-blue-400 transition-colors">
                        {opt.title}
                      </h4>
                      <p className="text-muted text-xs truncate mt-0.5">
                        {opt.subtitle}
                      </p>
                    </div>

                    <ChevronRight className="w-4 h-4 text-muted group-hover:text-foreground transition-colors shrink-0" />
                  </button>
                );
              })}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
