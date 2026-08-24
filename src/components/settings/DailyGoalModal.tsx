import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Target } from 'lucide-react';

interface DailyGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentGoal: number;
  onSave: (goal: number) => void;
}

export function DailyGoalModal({ isOpen, onClose, currentGoal, onSave }: DailyGoalModalProps) {
  const [mounted, setMounted] = useState(false);
  const [tempGoal, setTempGoal] = useState(currentGoal);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setTempGoal(currentGoal);
    }
  }, [isOpen, currentGoal]);

  // Close on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/75 backdrop-blur-md z-[99998]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="relative bg-surface border border-border rounded-2xl overflow-hidden shadow-2xl w-full max-w-sm z-[99999]"
          >
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                <Target className="w-5 h-5 text-orange-500" />
                Daily Goal
              </h3>
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-foreground/5 hover:bg-foreground/10 text-muted hover:text-foreground transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 flex flex-col items-center">
              <div className="mb-8 text-center">
                <span className="text-6xl font-bold text-orange-500">{tempGoal}</span>
                <span className="block text-sm font-medium text-muted mt-2 uppercase tracking-widest">
                  Words / Day
                </span>
              </div>

              <input
                type="range"
                min="1"
                max="50"
                value={tempGoal}
                onChange={(e) => setTempGoal(Number(e.target.value))}
                className="w-full accent-orange-500 h-2 bg-surface-active rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between w-full mt-2 text-xs font-bold text-muted">
                <span>1</span>
                <span>50</span>
              </div>
            </div>

            <div className="p-4 border-t border-border bg-surface-active/30">
              <button
                onClick={() => {
                  onSave(tempGoal);
                  onClose();
                }}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl transition-colors"
              >
                Save Goal
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
