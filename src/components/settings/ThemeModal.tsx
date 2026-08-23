import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { SettingsTile } from './SettingsTile';
import { Monitor, Sun, Moon, X } from 'lucide-react';

export type ThemeType = 'System' | 'Light' | 'Dark';

interface ThemeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTheme: ThemeType;
  onSelectTheme: (theme: ThemeType) => void;
}

export function ThemeModal({ isOpen, onClose, currentTheme, onSelectTheme }: ThemeModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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
            className="relative bg-surface/98 border border-border rounded-2xl overflow-hidden shadow-2xl w-full max-w-sm z-[99999]"
          >
              <div className="flex items-center justify-between p-4 border-b border-border">
                <h3 className="text-lg font-bold text-foreground">Choose Theme</h3>
                <button 
                  onClick={onClose}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-foreground/5 hover:bg-foreground/10 text-muted hover:text-foreground transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="flex flex-col">
                <SettingsTile
                  title="System"
                  icon={Monitor}
                  iconColor={currentTheme === 'System' ? 'text-[#EAB308]' : 'text-muted'}
                  textColor={currentTheme === 'System' ? 'text-[#EAB308]' : 'text-foreground'}
                  onClick={() => onSelectTheme('System')}
                  trailing={currentTheme === 'System' ? <div className="w-2 h-2 rounded-full bg-[#EAB308]" /> : <div />}
                />
                <SettingsTile
                  title="Light"
                  icon={Sun}
                  iconColor={currentTheme === 'Light' ? 'text-[#EAB308]' : 'text-muted'}
                  textColor={currentTheme === 'Light' ? 'text-[#EAB308]' : 'text-foreground'}
                  onClick={() => onSelectTheme('Light')}
                  trailing={currentTheme === 'Light' ? <div className="w-2 h-2 rounded-full bg-[#EAB308]" /> : <div />}
                />
                <SettingsTile
                  title="Dark"
                  icon={Moon}
                  iconColor={currentTheme === 'Dark' ? 'text-[#EAB308]' : 'text-muted'}
                  textColor={currentTheme === 'Dark' ? 'text-[#EAB308]' : 'text-foreground'}
                  onClick={() => onSelectTheme('Dark')}
                  trailing={currentTheme === 'Dark' ? <div className="w-2 h-2 rounded-full bg-[#EAB308]" /> : <div />}
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>,
      document.body
    );
}
