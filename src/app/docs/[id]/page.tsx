'use client';

import { Suspense, useMemo, useEffect, useCallback, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { use } from 'react';
import {
  ArrowLeft,
  Edit2,
  Loader2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Star,
  Share2,
  Printer,
  Clock,
  Quote,
  GitFork,
  FileText,
  Check,
} from 'lucide-react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { useDocsData, type DocumentItem } from '@/hooks/useDocsData';
import { DeleteConfirmationModal } from '@/components/words/DeleteConfirmationModal';
import { printDocumentAsPdf } from '@/lib/pdfTemplate';

function DocViewerContent({ id }: { id: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { documents, isLoading, deleteDocument, toggleFavorite } = useDocsData();

  const filter = searchParams.get('filter') || 'all';
  const sub = searchParams.get('sub') || 'all';
  const customDate = searchParams.get('date') || '';

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // Filter list matching the list view filter
  const filteredList = useMemo(() => {
    let result = documents;

    if (filter === 'snippet') {
      result = result.filter(d => d.doc_type === 'snippet');
    } else if (filter === 'thread') {
      result = result.filter(d => d.doc_type === 'thread');
    } else if (filter === 'document') {
      result = result.filter(d => d.doc_type === 'document');
    } else if (filter === 'favorite') {
      result = result.filter(d => d.is_favorite);
      if (sub !== 'all') {
        result = result.filter(d => d.doc_type === sub);
      }
    } else if (filter === 'today') {
      const today = new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60 * 1000)
        .toISOString()
        .split('T')[0];
      result = result.filter(d => {
        const dDate = new Date(new Date(d.updated_at).getTime() - new Date(d.updated_at).getTimezoneOffset() * 60 * 1000)
          .toISOString()
          .split('T')[0];
        return dDate === today;
      });
    } else if (filter === 'yesterday') {
      const yesterday = new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60 * 1000 - 86400000)
        .toISOString()
        .split('T')[0];
      result = result.filter(d => {
        const dDate = new Date(new Date(d.updated_at).getTime() - new Date(d.updated_at).getTimezoneOffset() * 60 * 1000)
          .toISOString()
          .split('T')[0];
        return dDate === yesterday;
      });
    } else if (filter === 'custom' && customDate) {
      result = result.filter(d => {
        const dDate = new Date(new Date(d.updated_at).getTime() - new Date(d.updated_at).getTimezoneOffset() * 60 * 1000)
          .toISOString()
          .split('T')[0];
        return dDate === customDate;
      });
    }

    return result;
  }, [documents, filter, sub, customDate]);

  const currentIndex = useMemo(() => {
    return filteredList.findIndex(d => d.id === id);
  }, [filteredList, id]);

  const doc = useMemo(() => {
    if (currentIndex >= 0) return filteredList[currentIndex];
    return documents.find(d => d.id === id);
  }, [filteredList, currentIndex, documents, id]);

  const prevDoc = currentIndex > 0 ? filteredList[currentIndex - 1] : null;
  const nextDoc = currentIndex >= 0 && currentIndex < filteredList.length - 1 ? filteredList[currentIndex + 1] : null;

  const navigateToDoc = useCallback(
    (targetId: string) => {
      const params = new URLSearchParams();
      if (filter && filter !== 'all') params.set('filter', filter);
      if (filter === 'favorite' && sub !== 'all') params.set('sub', sub);
      if (filter === 'custom' && customDate) params.set('date', customDate);
      const q = params.toString();
      router.push(`/docs/${targetId}${q ? '?' + q : ''}`);
    },
    [filter, sub, customDate, router]
  );

  const goToPrev = useCallback(() => {
    if (prevDoc) navigateToDoc(prevDoc.id);
  }, [prevDoc, navigateToDoc]);

  const goToNext = useCallback(() => {
    if (nextDoc) navigateToDoc(nextDoc.id);
  }, [nextDoc, navigateToDoc]);

  // Keyboard navigation
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
    await deleteDocument(id);
    setIsDeleting(false);
    setShowDeleteModal(false);
    if (nextDoc) {
      navigateToDoc(nextDoc.id);
    } else if (prevDoc) {
      navigateToDoc(prevDoc.id);
    } else {
      router.push('/docs');
    }
  };

  const handleShareText = () => {
    if (!doc) return;
    const text = `${doc.title}\n\n${doc.content_markdown || doc.previewText || ''}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      showToast('Copied document text to clipboard!');
    }
  };

  const handlePrintPdf = () => {
    if (!doc) return;
    printDocumentAsPdf(doc);
  };

  // Parse Thread contents if doc_type === 'thread'
  const threadItems = useMemo(() => {
    if (!doc || doc.doc_type !== 'thread') return [];
    if (doc.content_json) {
      try {
        const parsed = typeof doc.content_json === 'string' ? JSON.parse(doc.content_json) : doc.content_json;
        if (Array.isArray(parsed)) {
          return parsed.map((item: any) => {
            if (typeof item === 'string') return item;
            if (Array.isArray(item)) {
              return item.map((op: any) => op.insert || '').join('');
            }
            if (item && item.ops && Array.isArray(item.ops)) {
              return item.ops.map((op: any) => op.insert || '').join('');
            }
            return JSON.stringify(item);
          });
        }
      } catch {}
    }
    if (doc.content_markdown) {
      return doc.content_markdown.split('\n\n---\n\n').map(s => s.trim()).filter(Boolean);
    }
    return [doc.previewText || ''];
  }, [doc]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full pt-20">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-4" />
      </div>
    );
  }

  if (!doc) {
    return (
      <div className="flex flex-col items-center justify-center h-full pt-20 text-center">
        <p className="text-muted text-lg mb-4">Document not found.</p>
        <button
          onClick={() => router.push('/docs')}
          className="px-6 py-2 bg-surface border border-border rounded-xl text-foreground hover:bg-surface-active transition-colors cursor-pointer"
        >
          Go Back to Docs
        </button>
      </div>
    );
  }

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'snippet':
        return { icon: Quote, color: 'text-blue-400', label: 'Quick Snippet', bg: 'bg-blue-500/10 border-blue-500/20' };
      case 'thread':
        return { icon: GitFork, color: 'text-purple-400', label: 'Thought Thread', bg: 'bg-purple-500/10 border-purple-500/20' };
      default:
        return { icon: FileText, color: 'text-amber-400', label: 'Comprehensive Document', bg: 'bg-amber-500/10 border-amber-500/20' };
    }
  };

  const badge = getTypeBadge(doc.doc_type);
  const BadgeIcon = badge.icon;
  const formattedDate = doc.updated_at ? format(new Date(doc.updated_at), 'MMMM d, yyyy') : '';

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto h-full flex flex-col relative pb-24 w-full select-none">
      
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 rounded-2xl glass-panel border border-border text-foreground font-medium text-sm shadow-2xl flex items-center gap-2"
          >
            <Check className="w-4 h-4 text-emerald-400" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Header Bar with navigation actions */}
      <div className="flex items-center justify-between pb-6 mb-4 border-b border-border/60">
        <button
          onClick={() => router.push('/docs')}
          className="p-2.5 rounded-2xl glass-card hover:border-border-hover transition-colors text-muted hover:text-foreground cursor-pointer flex items-center gap-2"
        >
          <ArrowLeft className="w-5 h-5 text-foreground" />
          <span className="text-sm font-semibold pr-1">Back</span>
        </button>

        <div className="flex items-center space-x-2">
          {/* Favorite Toggle */}
          <button
            onClick={() => toggleFavorite(doc.id, doc.is_favorite)}
            className="p-2.5 rounded-2xl glass-card hover:border-amber-500/40 transition-colors text-muted hover:text-amber-400 cursor-pointer"
            title={doc.is_favorite ? 'Unfavorite' : 'Favorite'}
          >
            <Star
              className={`w-5 h-5 ${
                doc.is_favorite ? 'fill-amber-400 text-amber-400' : 'text-muted'
              }`}
            />
          </button>

          {/* Share as Text */}
          <button
            onClick={handleShareText}
            className="p-2.5 rounded-2xl glass-card hover:border-purple-500/40 transition-colors text-muted hover:text-purple-400 cursor-pointer"
            title="Share as Text"
          >
            <Share2 className="w-5 h-5" />
          </button>

          {/* Print / PDF */}
          <button
            onClick={handlePrintPdf}
            className="p-2.5 rounded-2xl glass-card hover:border-emerald-500/40 transition-colors text-muted hover:text-emerald-400 cursor-pointer"
            title="Print / Export PDF"
          >
            <Printer className="w-5 h-5" />
          </button>

          {/* Edit Button */}
          <button
            onClick={() => router.push(`/docs/edit/${doc.id}`)}
            className="p-2.5 rounded-2xl glass-card hover:border-blue-500/40 transition-colors text-muted hover:text-blue-400 cursor-pointer"
            title="Edit Document"
          >
            <Edit2 className="w-5 h-5" />
          </button>

          {/* Delete Button */}
          <button
            onClick={() => setShowDeleteModal(true)}
            className="p-2.5 rounded-2xl glass-card hover:border-rose-500/40 hover:bg-rose-500/10 transition-colors text-rose-400 cursor-pointer"
            title="Delete Document"
          >
            <Trash2 className="w-5 h-5" />
          </button>

          {/* Divider */}
          <div className="h-6 w-px bg-border/60 mx-1" />

          {/* Previous Document */}
          <button
            onClick={goToPrev}
            disabled={!prevDoc}
            className="p-2.5 rounded-2xl glass-card hover:border-border-hover transition-colors text-muted hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1"
            title={prevDoc ? `Previous: ${prevDoc.title}` : 'No previous document'}
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="hidden sm:inline text-xs font-semibold pr-1">Prev</span>
          </button>

          {/* Next Document */}
          <button
            onClick={goToNext}
            disabled={!nextDoc}
            className="p-2.5 rounded-2xl glass-card hover:border-border-hover transition-colors text-muted hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1"
            title={nextDoc ? `Next: ${nextDoc.title}` : 'No next document'}
          >
            <span className="hidden sm:inline text-xs font-semibold pl-1">Next</span>
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Document Content */}
      <div className="flex-1 overflow-y-auto min-h-0 pt-2">
        <div className="w-full space-y-6">
          
          {/* Metadata Banner */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-border/40">
            <div className="flex items-center gap-2">
              <div className={`px-3 py-1 rounded-xl border ${badge.bg} flex items-center gap-1.5`}>
                <BadgeIcon className={`w-4 h-4 ${badge.color}`} />
                <span className={`text-xs font-bold uppercase tracking-wider ${badge.color}`}>
                  {badge.label}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs text-muted font-medium">
              <span>{formattedDate}</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-muted/60" />
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

          {/* Document Title */}
          {doc.doc_type !== 'snippet' && (
            <h1 className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight leading-tight">
              {doc.title}
            </h1>
          )}

          {/* Content Viewer Body */}
          {doc.doc_type === 'snippet' ? (
            /* Quick Snippet Quotation View */
            <div className="glass-card rounded-3xl p-8 md:p-12 relative overflow-hidden border border-border">
              <div className="absolute top-6 left-6 text-blue-500/10 pointer-events-none">
                <Quote className="w-24 h-24" />
              </div>
              <div className="relative z-10">
                <p className="text-foreground text-xl md:text-2xl font-serif italic leading-relaxed whitespace-pre-wrap">
                  &ldquo;{doc.content_markdown || doc.previewText || doc.title}&rdquo;
                </p>
              </div>
            </div>
          ) : doc.doc_type === 'thread' ? (
            /* Thought Thread Timeline View */
            <div className="space-y-4 pt-2">
              {threadItems.map((thought, idx) => {
                const isLast = idx === threadItems.length - 1;
                return (
                  <div key={idx} className="flex items-start gap-4">
                    {/* Node & Connector */}
                    <div className="flex flex-col items-center shrink-0 self-stretch pt-2">
                      <div className="w-7 h-7 rounded-full bg-purple-500/20 border-2 border-purple-400 flex items-center justify-center text-[11px] font-bold text-purple-300">
                        {idx + 1}
                      </div>
                      {!isLast && <div className="w-0.5 flex-1 bg-border/60 my-2" />}
                    </div>

                    {/* Thought Card */}
                    <div className="flex-1 glass-card rounded-2xl p-5 mb-2 border border-border">
                      <p className="text-foreground text-base leading-relaxed whitespace-pre-wrap">
                        {thought}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Comprehensive Document Article View */
            <div className="glass-card rounded-3xl p-8 md:p-10 border border-border">
              <div
                className="prose prose-invert max-w-none text-foreground/90 leading-relaxed text-base space-y-4"
                dangerouslySetInnerHTML={{
                  __html: (doc.content_markdown || doc.previewText || '')
                    .replace(/\n/g, '<br/>'),
                }}
              />
            </div>
          )}

        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        wordTitle={doc.title || 'this document'}
        isDeleting={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowDeleteModal(false)}
      />

    </div>
  );
}

export default function DocViewerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center h-full pt-20">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-4" />
        </div>
      }
    >
      <DocViewerContent id={id} />
    </Suspense>
  );
}
