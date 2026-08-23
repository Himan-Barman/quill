'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, Loader2, BookOpen, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export function GlobalSearch() {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<{ id: string; title: string; type: string }[]>([]);
  const { user } = useAuth();
  const searchRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    // Click outside handler
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const searchDB = async () => {
      if (!query.trim() || !user || user.id === 'demo-123') {
        setResults([]);
        setIsSearching(false);
        return;
      }

      setIsSearching(true);

      try {
        // Search vocabularies
        const { data: words } = await supabase
          .from('vocabularies')
          .select('id, word')
          .eq('user_id', user.id)
          .ilike('word', `%${query}%`)
          .is('deleted_at', null)
          .limit(5);

        // Search documents
        const { data: docs } = await supabase
          .from('documents')
          .select('id, title, doc_type')
          .eq('user_id', user.id)
          .ilike('title', `%${query}%`)
          .is('deleted_at', null)
          .limit(5);

        const combined = [
          ...(words || []).map(w => ({ id: w.id, title: w.word, type: 'word' })),
          ...(docs || []).map(d => ({ id: d.id, title: d.title || 'Untitled', type: d.doc_type }))
        ];

        setResults(combined);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setIsSearching(false);
      }
    };

    const debounceTimer = setTimeout(() => {
      searchDB();
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [query, user]);

  return (
    <motion.div
      ref={searchRef}
      className="relative w-full mx-auto"
      initial={false}
      animate={{ maxWidth: isOpen ? '42rem' : '28rem' }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-[#64748B] group-focus-within:text-blue-400 transition-colors" />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          className="block w-full pl-12 pr-4 py-3.5 bg-surface/50 border border-border rounded-full text-foreground placeholder-muted/50 focus:ring-0 focus:border-blue-500 outline-none transition-all shadow-[0_4px_20px_rgba(0,0,0,0.3)] backdrop-blur-md text-[16px]"
          placeholder="Search words, snippets, documents..."
        />
        {isSearching && (
          <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
            <Loader2 className="h-4 w-4 text-blue-400 animate-spin" />
          </div>
        )}
      </div>

      <AnimatePresence>
        {isOpen && query.trim() !== '' && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            className="absolute top-full mt-3 w-full bg-surface/95 backdrop-blur-xl border border-border rounded-3xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] overflow-hidden z-50"
          >
            {results.length > 0 ? (
              <div className="py-2">
                {results.map((result) => (
                  <div
                    key={`${result.type}-${result.id}`}
                    onClick={() => {
                      setIsOpen(false);
                      setQuery('');
                      // Navigation logic would go here depending on type
                    }}
                    className="px-4 py-3 hover:bg-surface-active cursor-pointer transition-colors flex items-center space-x-3 group"
                  >
                    <div className="p-2 rounded-lg bg-surface border border-border group-hover:border-border-hover transition-colors">
                      {result.type === 'word' ? (
                        <BookOpen className="w-4 h-4 text-blue-400" />
                      ) : (
                        <FileText className="w-4 h-4 text-purple-400" />
                      )}
                    </div>
                    <div>
                      <p className="text-foreground font-medium text-sm">{result.title}</p>
                      <p className="text-xs text-muted capitalize">{result.type}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              !isSearching && (
                <div className="p-6 text-center">
                  <p className="text-muted text-sm">No results found for "{query}"</p>
                </div>
              )
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
