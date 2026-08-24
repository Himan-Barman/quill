'use client';

import { useToast } from '@/contexts/ToastContext';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { createPortal } from 'react-dom';
import { useEffect, useState } from 'react';

export function ToastContainer() {
  const { toasts, removeToast } = useToast();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return createPortal(
    <div className="fixed bottom-6 right-1/2 translate-x-1/2 md:translate-x-0 md:right-6 md:left-auto z-[99999] flex flex-col gap-3 w-[calc(100%-2rem)] md:w-96 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => {
          let Icon = Info;
          let iconColor = 'text-blue-500';
          let bgColor = 'bg-blue-500/10';
          let borderColor = 'border-blue-500/20';

          if (toast.type === 'success') {
            Icon = CheckCircle2;
            iconColor = 'text-green-500';
            bgColor = 'bg-green-500/10';
            borderColor = 'border-green-500/20';
          } else if (toast.type === 'error') {
            Icon = AlertCircle;
            iconColor = 'text-red-500';
            bgColor = 'bg-red-500/10';
            borderColor = 'border-red-500/20';
          }

          return (
            <motion.div
              layout
              key={toast.id}
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className={`w-full pointer-events-auto rounded-2xl border p-4 shadow-2xl backdrop-blur-md flex items-start gap-3 bg-surface/90 ${borderColor}`}
            >
              <div className={`mt-0.5 shrink-0 ${iconColor} ${bgColor} p-1.5 rounded-full`}>
                <Icon className="w-4 h-4" />
              </div>
              <p className="flex-1 text-sm font-medium text-foreground leading-snug pt-0.5">
                {toast.message}
              </p>
              <button
                onClick={() => removeToast(toast.id)}
                className="shrink-0 p-1 text-muted hover:text-foreground transition-colors rounded-lg hover:bg-surface-active"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>,
    document.body
  );
}
