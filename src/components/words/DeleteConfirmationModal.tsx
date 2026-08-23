'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Loader2 } from 'lucide-react';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  wordTitle: string;
  isDeleting?: boolean;
  itemType?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteConfirmationModal({
  isOpen,
  wordTitle,
  isDeleting = false,
  itemType = 'word',
  onConfirm,
  onCancel,
}: DeleteConfirmationModalProps) {
  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isDeleting) {
        onCancel();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isDeleting, onCancel]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={!isDeleting ? onCancel : undefined}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="relative w-full max-w-md bg-surface border border-border rounded-2xl p-6 shadow-2xl z-10"
          >
            <div className="flex flex-col items-center text-center">
              {/* Static Color Icon Pod */}
              <div className="w-12 h-12 rounded-full bg-rose-500/10 flex items-center justify-center mb-4 text-rose-500 shrink-0">
                <Trash2 className="w-6 h-6" />
              </div>

              {/* Title */}
              <h3 className="text-lg font-bold text-foreground mb-1">
                Delete {itemType.charAt(0).toUpperCase() + itemType.slice(1)}?
              </h3>

              {/* Highlighted Item Name */}
              <p className="text-sm font-semibold text-foreground my-1.5 px-3 py-1 bg-surface-hover rounded-lg border border-border/50 max-w-full truncate">
                &ldquo;{wordTitle}&rdquo;
              </p>

              {/* Warning Text */}
              <p className="text-muted text-xs leading-relaxed max-w-xs mx-auto mb-6">
                Are you sure you want to delete this {itemType}? This action cannot be undone.
              </p>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 w-full">
                <button
                  type="button"
                  onClick={onCancel}
                  disabled={isDeleting}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-surface hover:bg-surface-hover border border-border text-foreground font-semibold text-sm transition-colors cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={onConfirm}
                  disabled={isDeleting}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-semibold text-sm transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Deleting...</span>
                    </>
                  ) : (
                    <span>Delete</span>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
