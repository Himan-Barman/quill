'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, MoreVertical, Edit2, Trash2 } from 'lucide-react';
import type { WordData } from '@/hooks/useWordsData';

interface LexWordBarCardProps {
  word: WordData;
  onEdit?: () => void;
  onDelete?: () => void;
  onClick?: () => void;
}

export function LexWordBarCard({ word, onEdit, onDelete, onClick }: LexWordBarCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div
      className="flex items-center p-4 bg-surface border border-border/50 rounded-2xl cursor-pointer hover:border-border-hover transition-colors relative"
      onClick={(e) => {
        // Prevent click if we are clicking on the menu
        if (menuRef.current?.contains(e.target as Node)) return;
        onClick?.();
      }}
    >
      <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
        <BookOpen className="w-5 h-5 text-blue-400" />
      </div>

      <div className="ml-4 flex-1 min-w-0">
        <h3 className="text-foreground font-bold text-[16px] truncate">
          {word.word}
        </h3>
        {word.meaning && (
          <p className="text-muted text-[12px] truncate mt-0.5">
            {word.meaning}
          </p>
        )}
      </div>

      <div className="ml-2 shrink-0 relative" ref={menuRef}>
        <button
          className="p-2 rounded-full hover:bg-foreground/5 transition-colors text-muted"
          onClick={(e) => {
            e.stopPropagation();
            setShowMenu(!showMenu);
          }}
        >
          <MoreVertical className="w-5 h-5" />
        </button>

        <AnimatePresence>
          {showMenu && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-full mt-2 w-40 bg-surface border border-border rounded-xl shadow-xl overflow-hidden z-20"
            >
              <button
                className="w-full text-left px-4 py-3 text-[14px] text-foreground hover:bg-foreground/5 flex items-center space-x-3 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMenu(false);
                  onEdit?.();
                }}
              >
                <Edit2 className="w-4 h-4 text-foreground" />
                <span>Edit</span>
              </button>
              <button
                className="w-full text-left px-4 py-3 text-[14px] text-red-500 hover:bg-red-500/10 flex items-center space-x-3 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMenu(false);
                  onDelete?.();
                }}
              >
                <Trash2 className="w-4 h-4 text-red-500" />
                <span>Delete</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
