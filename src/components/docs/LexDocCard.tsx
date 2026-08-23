'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Quote,
  GitFork,
  FileText,
  MoreVertical,
  Star,
  Edit2,
  Trash2,
  Share2,
  Printer,
  Clock,
} from 'lucide-react';
import { format } from 'date-fns';
import type { DocumentItem } from '@/hooks/useDocsData';

interface LexDocCardProps {
  doc: DocumentItem;
  onClick: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onToggleFavorite: () => void;
  onShareText: () => void;
  onPrintPdf: () => void;
}

export function LexDocCard({
  doc,
  onClick,
  onEdit,
  onDelete,
  onToggleFavorite,
  onShareText,
  onPrintPdf,
}: LexDocCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };
    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMenu]);

  const getTypeConfig = (type: string) => {
    switch (type) {
      case 'snippet':
        return {
          icon: Quote,
          color: 'text-blue-400',
          bg: 'bg-blue-500/10 border-blue-500/20',
          label: 'Snippet',
        };
      case 'thread':
        return {
          icon: GitFork,
          color: 'text-purple-400',
          bg: 'bg-purple-500/10 border-purple-500/20',
          label: 'Thread',
        };
      default:
        return {
          icon: FileText,
          color: 'text-amber-400',
          bg: 'bg-amber-500/10 border-amber-500/20',
          label: 'Document',
        };
    }
  };

  const typeConfig = getTypeConfig(doc.doc_type);
  const Icon = typeConfig.icon;

  const formattedDate = doc.updated_at
    ? format(new Date(doc.updated_at), 'MMM d, yyyy')
    : format(new Date(), 'MMM d, yyyy');

  return (
    <div className="relative group">
      <motion.div
        whileHover={{ scale: 1.006, y: -1 }}
        whileTap={{ scale: 0.995 }}
        onClick={onClick}
        className="glass-card-interactive rounded-2xl p-4 md:p-5 flex items-center gap-4 cursor-pointer transition-all border border-border hover:border-border-hover"
      >
        {/* Type Icon Badge */}
        <div
          className={`w-11 h-11 rounded-2xl ${typeConfig.bg} border flex items-center justify-center shrink-0 shadow-sm`}
        >
          <Icon className={`w-5 h-5 ${typeConfig.color}`} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 pr-2">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-foreground font-semibold text-base tracking-tight truncate">
              {doc.title || 'Untitled Document'}
            </h3>
            {doc.is_favorite && (
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 shrink-0" />
            )}
          </div>

          <p className="text-muted text-xs leading-relaxed line-clamp-1">
            {doc.previewText || 'No additional content'}
          </p>

          <div className="flex items-center gap-3 mt-2 text-[11px] text-muted/70 font-medium">
            <span>{formattedDate}</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-muted/60" />
              {doc.reading_time || 1} min read
            </span>
            {doc.word_count > 0 && (
              <>
                <span>•</span>
                <span>{doc.word_count} words</span>
              </>
            )}
          </div>
        </div>

        {/* 3-Dot Action Menu Button */}
        <div className="relative" ref={menuRef} onClick={e => e.stopPropagation()}>
          <button
            onClick={() => setShowMenu(prev => !prev)}
            className="p-2 rounded-xl text-muted hover:text-foreground hover:bg-white/[0.06] transition-colors cursor-pointer"
            title="More Options"
          >
            <MoreVertical className="w-4.5 h-4.5" />
          </button>

          <AnimatePresence>
            {showMenu && (
              <motion.div
                initial={{ opacity: 0, scale: 0.94, y: 4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.94, y: 4 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-full mt-1 w-48 glass-panel rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.5)] border border-border py-1.5 z-50 overflow-hidden"
              >
                <button
                  onClick={() => {
                    setShowMenu(false);
                    onToggleFavorite();
                  }}
                  className="w-full px-3.5 py-2 text-left text-xs font-medium text-foreground hover:bg-white/[0.08] flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <Star
                    className={`w-4 h-4 ${
                      doc.is_favorite
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-muted'
                    }`}
                  />
                  <span>{doc.is_favorite ? 'Unfavorite' : 'Favorite'}</span>
                </button>

                <button
                  onClick={() => {
                    setShowMenu(false);
                    onEdit();
                  }}
                  className="w-full px-3.5 py-2 text-left text-xs font-medium text-foreground hover:bg-white/[0.08] flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <Edit2 className="w-4 h-4 text-blue-400" />
                  <span>Edit</span>
                </button>

                <button
                  onClick={() => {
                    setShowMenu(false);
                    onShareText();
                  }}
                  className="w-full px-3.5 py-2 text-left text-xs font-medium text-foreground hover:bg-white/[0.08] flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <Share2 className="w-4 h-4 text-purple-400" />
                  <span>Share as Text</span>
                </button>

                <button
                  onClick={() => {
                    setShowMenu(false);
                    onPrintPdf();
                  }}
                  className="w-full px-3.5 py-2 text-left text-xs font-medium text-foreground hover:bg-white/[0.08] flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <Printer className="w-4 h-4 text-emerald-400" />
                  <span>Print / Export PDF</span>
                </button>

                <div className="h-px bg-border/50 my-1" />

                <button
                  onClick={() => {
                    setShowMenu(false);
                    onDelete();
                  }}
                  className="w-full px-3.5 py-2 text-left text-xs font-medium text-rose-400 hover:bg-rose-500/10 flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4 text-rose-400" />
                  <span>Delete</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
