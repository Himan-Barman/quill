'use client';

import { Suspense, useMemo, useEffect, useCallback, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { use } from 'react';
import { ArrowLeft, Edit2, Loader2, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useWordsData } from '@/hooks/useWordsData';
import { LexWordDetailView } from '@/components/words/LexWordDetailView';
import { DeleteConfirmationModal } from '@/components/words/DeleteConfirmationModal';

function WordDetailContent({ id }: { id: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { words, isLoading, deleteWord } = useWordsData();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const filter = searchParams.get('filter') || 'all';
  const customDate = searchParams.get('date') || '';

  // Filter words according to the active filter from words page
  const filteredWords = useMemo(() => {
    return words.filter(word => {
      const wordDate = new Date(word.created_at);
      const now = new Date();
      
      if (filter === 'today') {
        if (wordDate.toDateString() !== now.toDateString()) return false;
      } else if (filter === 'yesterday') {
        const yesterday = new Date(now);
        yesterday.setDate(now.getDate() - 1);
        if (wordDate.toDateString() !== yesterday.toDateString()) return false;
      } else if (filter === 'custom' && customDate) {
        if (wordDate.toISOString().split('T')[0] !== customDate) return false;
      }
      return true;
    });
  }, [words, filter, customDate]);

  const currentIndex = useMemo(() => {
    return filteredWords.findIndex(w => w.id === id);
  }, [filteredWords, id]);

  const word = useMemo(() => {
    if (currentIndex >= 0) return filteredWords[currentIndex];
    return words.find(w => w.id === id);
  }, [filteredWords, currentIndex, words, id]);

  const prevWord = currentIndex > 0 ? filteredWords[currentIndex - 1] : null;
  const nextWord = currentIndex >= 0 && currentIndex < filteredWords.length - 1 ? filteredWords[currentIndex + 1] : null;

  const navigateToWord = useCallback((targetWordId: string) => {
    const params = new URLSearchParams();
    if (filter && filter !== 'all') params.set('filter', filter);
    if (customDate) params.set('date', customDate);
    const q = params.toString();
    router.push(`/words/${targetWordId}${q ? '?' + q : ''}`);
  }, [filter, customDate, router]);

  const goToPrev = useCallback(() => {
    if (prevWord) navigateToWord(prevWord.id);
  }, [prevWord, navigateToWord]);

  const goToNext = useCallback(() => {
    if (nextWord) navigateToWord(nextWord.id);
  }, [nextWord, navigateToWord]);

  // Keyboard navigation (Left/Right arrows)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;
      if (e.key === 'ArrowLeft') {
        goToPrev();
      } else if (e.key === 'ArrowRight') {
        goToNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToPrev, goToNext]);

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    await deleteWord(id);
    setIsDeleting(false);
    setShowDeleteModal(false);
    if (nextWord) {
      navigateToWord(nextWord.id);
    } else if (prevWord) {
      navigateToWord(prevWord.id);
    } else {
      router.push('/words');
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full pt-20">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-4" />
      </div>
    );
  }

  if (!word) {
    return (
      <div className="flex flex-col items-center justify-center h-full pt-20 text-center">
        <p className="text-muted text-lg mb-4">Word not found.</p>
        <button 
          onClick={() => router.push('/words')}
          className="px-6 py-2 bg-surface border border-border rounded-xl text-foreground hover:bg-surface-active transition-colors cursor-pointer"
        >
          Go Back to Words
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto h-full flex flex-col relative pb-24 w-full select-none">
      
      {/* Top App Bar with back, edit, delete, and previous/next navigation buttons */}
      <div className="flex items-center justify-between pb-6 mb-2 border-b border-border/60">
        <button 
          onClick={() => router.push('/words')}
          className="p-2.5 rounded-2xl glass-card hover:border-border-hover transition-colors text-muted hover:text-foreground cursor-pointer flex items-center gap-2"
        >
          <ArrowLeft className="w-5 h-5 text-foreground" />
          <span className="text-sm font-semibold pr-1">Back</span>
        </button>
        
        <div className="flex items-center space-x-2">
          {/* Edit Button */}
          <button 
            onClick={() => router.push(`/words/add?edit=${word.id}`)}
            className="p-2.5 rounded-2xl glass-card hover:border-blue-500/40 transition-colors text-muted hover:text-blue-400 cursor-pointer"
            title="Edit Word"
          >
            <Edit2 className="w-5 h-5" />
          </button>

          {/* Delete Button */}
          <button 
            onClick={() => setShowDeleteModal(true)}
            className="p-2.5 rounded-2xl glass-card hover:border-rose-500/40 hover:bg-rose-500/10 transition-colors text-rose-400 cursor-pointer"
            title="Delete Word"
          >
            <Trash2 className="w-5 h-5" />
          </button>

          {/* Divider */}
          <div className="h-6 w-px bg-border/60 mx-1" />

          {/* Previous Word Button */}
          <button 
            onClick={goToPrev}
            disabled={!prevWord}
            className="p-2.5 rounded-2xl glass-card hover:border-border-hover transition-colors text-muted hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1"
            title={prevWord ? `Previous Word: ${prevWord.word}` : 'No previous word'}
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="hidden sm:inline text-xs font-semibold pr-1">Prev</span>
          </button>

          {/* Next Word Button */}
          <button 
            onClick={goToNext}
            disabled={!nextWord}
            className="p-2.5 rounded-2xl glass-card hover:border-border-hover transition-colors text-muted hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1"
            title={nextWord ? `Next Word: ${nextWord.word}` : 'No next word'}
          >
            <span className="hidden sm:inline text-xs font-semibold pl-1">Next</span>
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Content scrollable area */}
      <div className="flex-1 overflow-y-auto min-h-0 pt-4">
        <LexWordDetailView word={word} />
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        wordTitle={word.word}
        isDeleting={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowDeleteModal(false)}
      />

    </div>
  );
}

export default function WordDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center h-full pt-20">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-4" />
      </div>
    }>
      <WordDetailContent id={id} />
    </Suspense>
  );
}
