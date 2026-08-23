'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Quote, GitFork, FileText, MoreVertical, Edit2, Trash2, Star, Share2, Printer } from 'lucide-react';
import type { DocumentItem } from '@/hooks/useDocsData';

interface LexDocBarCardProps {
  doc: DocumentItem;
  onEdit?: () => void;
  onDelete?: () => void;
  onToggleFavorite?: () => void;
  onShareText?: () => void;
  onPrintPdf?: () => void;
  onClick?: () => void;
}

export function LexDocBarCard({
  doc,
  onEdit,
  onDelete,
  onToggleFavorite,
  onShareText,
  onPrintPdf,
  onClick,
}: LexDocBarCardProps) {
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

  const getTypeIcon = () => {
    switch (doc.doc_type) {
      case 'snippet':
        return <Quote className="w-5 h-5 text-blue-400" />;
      case 'thread':
        return <GitFork className="w-5 h-5 text-purple-400" />;
      default:
        return <FileText className="w-5 h-5 text-amber-400" />;
    }
  };

  const getIconBg = () => {
    switch (doc.doc_type) {
      case 'snippet':
        return 'bg-blue-500/10';
      case 'thread':
        return 'bg-purple-500/10';
      default:
        return 'bg-amber-500/10';
    }
  };

  return (
    <div
      className="flex items-center p-4 bg-surface border border-border/50 rounded-2xl cursor-pointer hover:border-border-hover transition-colors relative select-none"
      onClick={e => {
        if (menuRef.current?.contains(e.target as Node)) return;
        onClick?.();
      }}
    >
      {/* Icon Badge matching words bar design */}
      <div className={`w-10 h-10 rounded-full ${getIconBg()} flex items-center justify-center shrink-0`}>
        {getTypeIcon()}
      </div>

      {/* Text Info */}
      <div className="ml-4 flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <h3 className="text-foreground font-bold text-[16px] truncate">
            {doc.title || 'Untitled Document'}
          </h3>
          {doc.is_favorite && (
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 shrink-0" />
          )}
        </div>
        <p className="text-muted text-[12px] truncate mt-0.5">
          {doc.previewText || `${doc.reading_time || 1} min read • ${doc.doc_type}`}
        </p>
      </div>

      {/* 3-Dot Action Menu */}
      <div className="ml-2 shrink-0 relative" ref={menuRef}>
        <button
          className="p-2 rounded-full hover:bg-foreground/5 transition-colors text-muted cursor-pointer"
          onClick={e => {
            e.stopPropagation();
            setShowMenu(!showMenu);
          }}
          title="More options"
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
              className="absolute right-0 top-full mt-2 w-48 bg-surface border border-border rounded-xl shadow-xl overflow-hidden z-20"
            >
              <button
                className="w-full text-left px-4 py-2.5 text-[14px] text-foreground hover:bg-foreground/5 flex items-center space-x-3 transition-colors cursor-pointer"
                onClick={e => {
                  e.stopPropagation();
                  setShowMenu(false);
                  onToggleFavorite?.();
                }}
              >
                <Star
                  className={`w-4 h-4 ${
                    doc.is_favorite ? 'fill-amber-400 text-amber-400' : 'text-foreground'
                  }`}
                />
                <span>{doc.is_favorite ? 'Unfavorite' : 'Favorite'}</span>
              </button>

              <button
                className="w-full text-left px-4 py-2.5 text-[14px] text-foreground hover:bg-foreground/5 flex items-center space-x-3 transition-colors cursor-pointer"
                onClick={e => {
                  e.stopPropagation();
                  setShowMenu(false);
                  onEdit?.();
                }}
              >
                <Edit2 className="w-4 h-4 text-foreground" />
                <span>Edit</span>
              </button>

              <button
                className="w-full text-left px-4 py-2.5 text-[14px] text-foreground hover:bg-foreground/5 flex items-center space-x-3 transition-colors cursor-pointer"
                onClick={e => {
                  e.stopPropagation();
                  setShowMenu(false);
                  onShareText?.();
                }}
              >
                <Share2 className="w-4 h-4 text-foreground" />
                <span>Share as Text</span>
              </button>

              <button
                className="w-full text-left px-4 py-2.5 text-[14px] text-foreground hover:bg-foreground/5 flex items-center space-x-3 transition-colors cursor-pointer"
                onClick={e => {
                  e.stopPropagation();
                  setShowMenu(false);
                  onPrintPdf?.();
                }}
              >
                <Printer className="w-4 h-4 text-foreground" />
                <span>Print / PDF</span>
              </button>

              <div className="h-px bg-border/50 my-0.5" />

              <button
                className="w-full text-left px-4 py-2.5 text-[14px] text-red-500 hover:bg-red-500/10 flex items-center space-x-3 transition-colors cursor-pointer"
                onClick={e => {
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
