'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, Loader2, FileText, Quote, GitFork, Star, Check } from 'lucide-react';
import { useDocsData, type DocumentItem } from '@/hooks/useDocsData';
import { LexDocBarCard } from '@/components/docs/LexDocBarCard';
import { DocsFilterMenu, type DocsFilterMode } from '@/components/docs/DocsFilterMenu';
import { NewDocTypeModal } from '@/components/docs/NewDocTypeModal';
import { DeleteConfirmationModal } from '@/components/words/DeleteConfirmationModal';
import { printDocumentAsPdf } from '@/lib/pdfTemplate';

type FavSubFilter = 'all' | 'snippet' | 'thread' | 'document';

export default function DocsPage() {
  const router = useRouter();
  const { documents, isLoading, error, deleteDocument, toggleFavorite, refresh } = useDocsData();

  const [filterMode, setFilterMode] = useState<DocsFilterMode>('all');
  const [favSubFilter, setFavSubFilter] = useState<FavSubFilter>('all');
  const [customDate, setCustomDate] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [docToDelete, setDocToDelete] = useState<DocumentItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // Available dates for calendar
  const availableDates = useMemo(() => {
    const dates = new Set<string>();
    documents.forEach(d => {
      if (d.updated_at) {
        const local = new Date(d.updated_at);
        const offset = local.getTimezoneOffset();
        const localDate = new Date(local.getTime() - offset * 60 * 1000);
        dates.add(localDate.toISOString().split('T')[0]);
      }
    });
    return Array.from(dates);
  }, [documents]);

  // Filtered documents
  const filteredDocs = useMemo(() => {
    let result = documents;

    // Filter Mode
    if (filterMode === 'snippet') {
      result = result.filter(d => d.doc_type === 'snippet');
    } else if (filterMode === 'thread') {
      result = result.filter(d => d.doc_type === 'thread');
    } else if (filterMode === 'document') {
      result = result.filter(d => d.doc_type === 'document');
    } else if (filterMode === 'favorite') {
      result = result.filter(d => d.is_favorite);
      if (favSubFilter !== 'all') {
        result = result.filter(d => d.doc_type === favSubFilter);
      }
    } else if (filterMode === 'today') {
      const today = new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60 * 1000)
        .toISOString()
        .split('T')[0];
      result = result.filter(d => {
        const dDate = new Date(new Date(d.updated_at).getTime() - new Date(d.updated_at).getTimezoneOffset() * 60 * 1000)
          .toISOString()
          .split('T')[0];
        return dDate === today;
      });
    } else if (filterMode === 'yesterday') {
      const yesterday = new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60 * 1000 - 86400000)
        .toISOString()
        .split('T')[0];
      result = result.filter(d => {
        const dDate = new Date(new Date(d.updated_at).getTime() - new Date(d.updated_at).getTimezoneOffset() * 60 * 1000)
          .toISOString()
          .split('T')[0];
        return dDate === yesterday;
      });
    } else if (filterMode === 'custom' && customDate) {
      result = result.filter(d => {
        const dDate = new Date(new Date(d.updated_at).getTime() - new Date(d.updated_at).getTimezoneOffset() * 60 * 1000)
          .toISOString()
          .split('T')[0];
        return dDate === customDate;
      });
    }

    // Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        d =>
          d.title.toLowerCase().includes(q) ||
          (d.previewText && d.previewText.toLowerCase().includes(q))
      );
    }

    return result;
  }, [documents, filterMode, favSubFilter, customDate, searchQuery]);

  const buildDocViewUrl = (docId: string) => {
    const params = new URLSearchParams();
    if (filterMode !== 'all') params.set('filter', filterMode);
    if (filterMode === 'favorite' && favSubFilter !== 'all') params.set('sub', favSubFilter);
    if (filterMode === 'custom' && customDate) params.set('date', customDate);
    const q = params.toString();
    return `/docs/${docId}${q ? '?' + q : ''}`;
  };

  const handleConfirmDelete = async () => {
    if (!docToDelete) return;
    setIsDeleting(true);
    await deleteDocument(docToDelete.id);
    setIsDeleting(false);
    setDocToDelete(null);
    showToast('Document deleted');
  };

  const handleShareText = (doc: DocumentItem) => {
    const text = `${doc.title}\n\n${doc.previewText || ''}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      showToast('Copied document text to clipboard!');
    }
  };

  const handlePrintPdf = (doc: DocumentItem) => {
    printDocumentAsPdf(doc);
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto h-full flex flex-col relative pt-24 md:pt-28 pb-24 w-full select-none">
      
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
                  onChange={e => setSearchQuery(e.target.value)}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  className="block w-full pl-12 pr-4 py-3.5 bg-surface/50 border border-border rounded-full text-foreground placeholder-muted/50 focus:ring-0 focus:border-blue-500 outline-none transition-all shadow-[0_4px_20px_rgba(0,0,0,0.3)] backdrop-blur-md text-[16px]"
                  placeholder="Search your documents..."
                />
              </div>
            </motion.div>
          </div>

          {/* Filter Menu on Top Right (Exact words page style) */}
          <div className="shrink-0 pointer-events-auto min-w-[7rem] flex justify-end">
            <DocsFilterMenu
              filterMode={filterMode}
              customDate={customDate}
              availableDates={availableDates}
              onFilterModeChange={setFilterMode}
              onCustomDateChange={setCustomDate}
            />
          </div>
        </div>
      </div>

      {/* Horizontal Sub-Filter Options for Favorite Mode */}
      {filterMode === 'favorite' && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          className="flex items-center gap-2 mb-6 overflow-x-auto pb-1 no-scrollbar"
        >
          {[
            { id: 'all', label: 'All' },
            { id: 'snippet', label: 'Snippet' },
            { id: 'thread', label: 'Thread' },
            { id: 'document', label: 'Document' },
          ].map(opt => {
            const isSelected = favSubFilter === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => setFavSubFilter(opt.id as FavSubFilter)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-foreground text-background shadow-sm'
                    : 'bg-surface/50 border border-border text-muted hover:text-foreground hover:border-border-hover'
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </motion.div>
      )}

      {/* Main Document Bar List Area */}
      <div className="flex-1 overflow-y-auto min-h-0 w-full pt-1">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-48">
            <Loader2 className="w-8 h-8 text-blue-400 animate-spin mb-4" />
            <p className="text-muted text-sm font-medium">Loading documents...</p>
          </div>
        ) : error ? (
          <div className="text-center p-8 glass-card rounded-3xl border-rose-500/30">
            <p className="text-rose-400 text-sm font-medium">Failed to load documents: {error}</p>
            <button
              onClick={refresh}
              className="mt-4 px-4 py-2 glass-btn-primary rounded-xl text-xs font-semibold cursor-pointer"
            >
              Retry
            </button>
          </div>
        ) : filteredDocs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[50vh]">
            <div className="w-16 h-16 rounded-3xl glass-card flex items-center justify-center mb-4 text-muted">
              {filterMode === 'snippet' && <Quote className="w-8 h-8 text-blue-400" />}
              {filterMode === 'thread' && <GitFork className="w-8 h-8 text-purple-400" />}
              {filterMode === 'document' && <FileText className="w-8 h-8 text-amber-400" />}
              {filterMode === 'favorite' && <Star className="w-8 h-8 text-amber-400" />}
              {['all', 'today', 'yesterday', 'custom'].includes(filterMode) && (
                <FileText className="w-8 h-8 text-blue-400" />
              )}
            </div>
            <p className="text-muted text-sm font-medium">
              {searchQuery
                ? 'No documents found matching your search.'
                : filterMode === 'favorite'
                ? `No favorite ${favSubFilter === 'all' ? 'documents' : favSubFilter + 's'} found.`
                : `No documents found for this filter.`}
            </p>
          </div>
        ) : (
          <div className="space-y-3 pb-8">
            <AnimatePresence>
              {filteredDocs.map(doc => (
                <motion.div
                  key={doc.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  <LexDocBarCard
                    doc={doc}
                    onClick={() => router.push(buildDocViewUrl(doc.id))}
                    onEdit={() => router.push(`/docs/edit/${doc.id}`)}
                    onDelete={() => setDocToDelete(doc)}
                    onToggleFavorite={() => toggleFavorite(doc.id, doc.is_favorite)}
                    onShareText={() => handleShareText(doc)}
                    onPrintPdf={() => handlePrintPdf(doc)}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Floating Action Button (Exact same 115px right offset as words page) */}
      <div className="fixed bottom-8 inset-x-0 pointer-events-none z-50">
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex justify-end">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsCreateModalOpen(true)}
            className="pointer-events-auto w-12 h-12 md:w-13 md:h-13 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-xl shadow-[0_4px_14px_rgba(59,130,246,0.4)] flex items-center justify-center cursor-pointer transition-all disabled:opacity-50 translate-x-[115px]"
            title="Create New Document"
          >
            <Plus className="w-6 h-6 text-white stroke-[2.5]" />
          </motion.button>
        </div>
      </div>

      {/* Create New Document Type Modal */}
      <NewDocTypeModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={docToDelete !== null}
        wordTitle={docToDelete?.title || 'this document'}
        isDeleting={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDocToDelete(null)}
      />

    </div>
  );
}
