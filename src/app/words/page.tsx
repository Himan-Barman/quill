'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, Loader2, BookOpen, X } from 'lucide-react';
import { useWordsData } from '@/hooks/useWordsData';
import { LexWordBarCard } from '@/components/words/LexWordBarCard';
import { LexWordDetailView } from '@/components/words/LexWordDetailView';
import { WordsFilterMenu, type ViewMode } from '@/components/words/WordsFilterMenu';
import { DeleteConfirmationModal } from '@/components/words/DeleteConfirmationModal';

export default function WordsPage() {
  const router = useRouter();
  const { words, isLoading, error, deleteWord, refresh } = useWordsData();
  const [searchQuery, setSearchQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [expandedSearchWordId, setExpandedSearchWordId] = useState<string | null>(null);
  
  const [viewMode, setViewMode] = useState<ViewMode>('all');
  const [customDate, setCustomDate] = useState<string>('');

  const [wordToDelete, setWordToDelete] = useState<{ id: string; word: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const availableDates = Array.from(new Set(words.map(w => w.created_at.split('T')[0])));

  const filteredWords = words.filter(word => {
    const wordDate = new Date(word.created_at);
    const now = new Date();
    
    // View Mode Filtering
    if (viewMode === 'today') {
      if (wordDate.toDateString() !== now.toDateString()) return false;
    } else if (viewMode === 'yesterday') {
      const yesterday = new Date(now);
      yesterday.setDate(now.getDate() - 1);
      if (wordDate.toDateString() !== yesterday.toDateString()) return false;
    } else if (viewMode === 'custom' && customDate) {
      if (wordDate.toISOString().split('T')[0] !== customDate) return false;
    }

    // Search Query Filtering
    if (searchQuery.trim() !== '') {
      if (!word.word.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !word.meaning.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
    }
    
    return true;
  });

  const buildWordViewUrl = (wordId: string) => {
    const params = new URLSearchParams();
    if (viewMode && viewMode !== 'all') params.set('filter', viewMode);
    if (customDate) params.set('date', customDate);
    const q = params.toString();
    return `/words/${wordId}${q ? '?' + q : ''}`;
  };

  const handleConfirmDelete = async () => {
    if (!wordToDelete) return;
    setIsDeleting(true);
    await deleteWord(wordToDelete.id);
    setIsDeleting(false);
    setWordToDelete(null);
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto h-full flex flex-col relative pt-24 md:pt-28 pb-24 w-full select-none">
      
      {/* Top Header Bar: Fixed Floating Search Capsule + Filter Menu */}
      <div className="fixed top-3 left-0 right-0 md:left-64 z-50 pointer-events-none">
        <div className="max-w-7xl mx-auto w-full px-4 md:px-8 flex items-center justify-between gap-4">
          {/* Balanced spacer for desktop centering */}
          <div className="w-32 hidden lg:block shrink-0 pointer-events-none" />

          {/* Liquid Glass Search Bar Capsule */}
          <div className="flex-1 max-w-2xl mx-auto w-full pointer-events-auto flex justify-center">
            <motion.div 
              className="relative w-full mx-auto"
              initial={false}
              animate={{ maxWidth: isFocused || searchQuery ? '42rem' : '28rem' }}
              transition={{ type: 'spring', stiffness: 350, damping: 32 }}
            >
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4.5 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-muted group-focus-within:text-blue-400 transition-colors" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setExpandedSearchWordId(null);
                  }}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  className="block w-full pl-12 pr-4 py-3.5 bg-surface/50 border border-border rounded-full text-foreground placeholder-muted/50 focus:ring-0 focus:border-blue-500 outline-none transition-all shadow-[0_4px_20px_rgba(0,0,0,0.3)] backdrop-blur-md text-[16px]"
                  placeholder="Search your words..."
                />
              </div>
            </motion.div>
          </div>

          {/* Filter Menu on Top Right */}
          <div className="shrink-0 pointer-events-auto min-w-[7rem] flex justify-end">
            <WordsFilterMenu 
              viewMode={viewMode}
              customDate={customDate}
              availableDates={availableDates}
              onViewModeChange={setViewMode}
              onCustomDateChange={setCustomDate}
            />
          </div>
        </div>
      </div>

      {/* Main Words List (Positioned below Search Bar) */}
      <div className="flex-1 min-h-0 w-full">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-48">
            <Loader2 className="w-8 h-8 text-blue-400 animate-spin mb-4" />
            <p className="text-muted text-sm font-medium">Loading words...</p>
          </div>
        ) : error ? (
          <div className="text-center p-8 glass-card rounded-3xl border-rose-500/30">
            <p className="text-rose-400 text-sm font-medium">Failed to load words: {error}</p>
            <button onClick={refresh} className="mt-4 px-4 py-2 glass-btn-primary rounded-xl text-xs font-semibold cursor-pointer">Retry</button>
          </div>
        ) : filteredWords.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[50vh]">
            <div className="w-16 h-16 rounded-3xl glass-card flex items-center justify-center mb-4 text-muted">
              <BookOpen className="w-8 h-8 text-muted" />
            </div>
            <p className="text-muted text-sm font-medium">
              {searchQuery ? 'No words found matching your search.' : 'No words found. Add your first word!'}
            </p>
          </div>
        ) : (
          <div className="space-y-3 pb-8">
            <AnimatePresence>
              {filteredWords.map((word) => {
                const isSearchMode = searchQuery.trim() !== '';
                
                if (isSearchMode) {
                  if (expandedSearchWordId === word.id) {
                    return (
                      <motion.div
                        key={word.id}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="glass-panel rounded-3xl p-6 overflow-hidden relative"
                      >
                        <div className="flex justify-end mb-2">
                          <button 
                            onClick={() => setExpandedSearchWordId(null)}
                            className="p-1.5 rounded-full hover:bg-white/[0.08] transition-colors text-muted hover:text-foreground cursor-pointer"
                          >
                            <X className="w-4.5 h-4.5" />
                          </button>
                        </div>
                        <LexWordDetailView word={word} />
                      </motion.div>
                    );
                  } else {
                    return (
                      <motion.div
                        key={word.id}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="cursor-pointer px-4 py-3 rounded-2xl glass-card-interactive transition-colors"
                        onClick={() => setExpandedSearchWordId(word.id)}
                      >
                        <span className="text-foreground font-semibold text-base tracking-tight">{word.word}</span>
                      </motion.div>
                    );
                  }
                }

                return (
                  <motion.div
                    key={word.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                  >
                    <LexWordBarCard
                      word={word}
                      onClick={() => router.push(buildWordViewUrl(word.id))}
                      onEdit={() => router.push(`/words/add?edit=${word.id}`)}
                      onDelete={() => setWordToDelete({ id: word.id, word: word.word })}
                    />
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Floating Action Button (Offset 115px to the right) */}
      <div className="fixed bottom-8 inset-x-0 pointer-events-none z-50">
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex justify-end">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push('/words/add')}
            className="pointer-events-auto w-12 h-12 md:w-13 md:h-13 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-xl shadow-[0_4px_14px_rgba(59,130,246,0.4)] flex items-center justify-center cursor-pointer transition-all disabled:opacity-50 translate-x-[115px]"
            title="Add Word"
          >
            <Plus className="w-6 h-6 text-white stroke-[2.5]" />
          </motion.button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={wordToDelete !== null}
        wordTitle={wordToDelete?.word || ''}
        isDeleting={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setWordToDelete(null)}
      />

    </div>
  );
}
