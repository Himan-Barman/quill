'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

export type DocType = 'snippet' | 'thread' | 'document';

export interface DocumentItem {
  id: string;
  user_id?: string;
  doc_type: DocType;
  title: string;
  content_json?: string | any;
  content_markdown?: string;
  word_count: number;
  reading_time: number;
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
  previewText?: string;
}

export function extractPreviewText(doc: Partial<DocumentItem>): string {
  if (doc.content_markdown && doc.content_markdown.trim()) {
    return doc.content_markdown.replace(/[#*`_~[\]]/g, '').trim();
  }

  if (doc.content_json) {
    try {
      const parsed = typeof doc.content_json === 'string' ? JSON.parse(doc.content_json) : doc.content_json;
      if (Array.isArray(parsed)) {
        // Thread delta list or Quill delta ops
        const textParts: string[] = [];
        parsed.forEach(item => {
          if (Array.isArray(item)) {
            // list of deltas
            item.forEach((op: any) => {
              if (op && typeof op.insert === 'string') textParts.push(op.insert);
            });
          } else if (item && typeof item.insert === 'string') {
            textParts.push(item.insert);
          } else if (typeof item === 'string') {
            textParts.push(item);
          }
        });
        return textParts.join(' ').replace(/\s+/g, ' ').trim();
      } else if (parsed && typeof parsed === 'object') {
        if (Array.isArray(parsed.ops)) {
          return parsed.ops
            .map((op: any) => (typeof op.insert === 'string' ? op.insert : ''))
            .join('')
            .replace(/\s+/g, ' ')
            .trim();
        }
      }
    } catch {
      // Fallback
    }
  }

  return '';
}

export function calculateWordCountAndReadingTime(text: string): { wordCount: number; readingTime: number } {
  const clean = text.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  if (!clean) return { wordCount: 0, readingTime: 0 };
  const words = clean.split(' ').filter(Boolean).length;
  const readingTime = Math.max(1, Math.ceil(words / 200));
  return { wordCount: words, readingTime };
}

export function useDocsData() {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDocuments = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    setError(null);

    try {
      if (user.id === 'demo-123') {
        setDocuments([]);
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('user_id', user.id)
        .is('deleted_at', null)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      const parsed: DocumentItem[] = (data || []).map(row => ({
        ...row,
        doc_type: (row.doc_type || 'document') as DocType,
        is_favorite: Boolean(row.is_favorite),
        word_count: row.word_count || 0,
        reading_time: row.reading_time || 0,
        previewText: extractPreviewText(row),
      }));

      setDocuments(parsed);
    } catch (err: any) {
      console.error('Error fetching documents:', err);
      setError(err.message || 'Failed to fetch documents');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const addDocument = async (doc: {
    doc_type: DocType;
    title: string;
    content_json?: any;
    content_markdown?: string;
  }) => {
    if (!user) return { success: false, error: 'User not logged in' };

    try {
      const preview = extractPreviewText(doc);
      const { wordCount, readingTime } = calculateWordCountAndReadingTime(
        doc.content_markdown || preview || doc.title
      );

      const jsonString =
        typeof doc.content_json === 'string'
          ? doc.content_json
          : doc.content_json
          ? JSON.stringify(doc.content_json)
          : null;

      const { data, error } = await supabase
        .from('documents')
        .insert({
          user_id: user.id,
          doc_type: doc.doc_type,
          title: doc.title || (doc.doc_type === 'snippet' ? preview.slice(0, 30) || 'Snippet' : 'Untitled Document'),
          content_json: jsonString,
          content_markdown: doc.content_markdown || preview,
          word_count: wordCount,
          reading_time: readingTime,
          is_favorite: false,
        })
        .select()
        .single();

      if (error) throw error;

      const formatted: DocumentItem = {
        ...data,
        doc_type: data.doc_type as DocType,
        is_favorite: Boolean(data.is_favorite),
        previewText: extractPreviewText(data),
      };

      setDocuments(prev => [formatted, ...prev]);
      return { success: true, data: formatted };
    } catch (err: any) {
      console.error('Error adding document:', err);
      return { success: false, error: err.message };
    }
  };

  const updateDocument = async (
    id: string,
    updates: {
      title?: string;
      doc_type?: DocType;
      content_json?: any;
      content_markdown?: string;
      is_favorite?: boolean;
    }
  ) => {
    if (!user) return { success: false, error: 'User not logged in' };

    try {
      const payload: any = { ...updates, updated_at: new Date().toISOString() };
      
      if (updates.content_json !== undefined) {
        payload.content_json =
          typeof updates.content_json === 'string'
            ? updates.content_json
            : updates.content_json
            ? JSON.stringify(updates.content_json)
            : null;
      }

      if (updates.content_markdown !== undefined || updates.content_json !== undefined) {
        const preview = extractPreviewText(updates);
        const { wordCount, readingTime } = calculateWordCountAndReadingTime(
          updates.content_markdown || preview || updates.title || ''
        );
        payload.word_count = wordCount;
        payload.reading_time = readingTime;
      }

      const { data, error } = await supabase
        .from('documents')
        .update(payload)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      const formatted: DocumentItem = {
        ...data,
        doc_type: data.doc_type as DocType,
        is_favorite: Boolean(data.is_favorite),
        previewText: extractPreviewText(data),
      };

      setDocuments(prev => prev.map(d => (d.id === id ? formatted : d)));
      return { success: true, data: formatted };
    } catch (err: any) {
      console.error('Error updating document:', err);
      return { success: false, error: err.message };
    }
  };

  const deleteDocument = async (id: string) => {
    if (!user) return { success: false, error: 'User not logged in' };

    try {
      // Soft delete
      const { error } = await supabase
        .from('documents')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setDocuments(prev => prev.filter(d => d.id !== id));
      return { success: true };
    } catch (err: any) {
      console.error('Error deleting document:', err);
      return { success: false, error: err.message };
    }
  };

  const toggleFavorite = async (id: string, currentFavorite: boolean) => {
    if (!user) return;
    const newStatus = !currentFavorite;

    // Optimistic UI update
    setDocuments(prev =>
      prev.map(d => (d.id === id ? { ...d, is_favorite: newStatus } : d))
    );

    try {
      const { error } = await supabase
        .from('documents')
        .update({ is_favorite: newStatus, updated_at: new Date().toISOString() })
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
    } catch (err) {
      console.error('Error toggling favorite:', err);
      // Revert on failure
      setDocuments(prev =>
        prev.map(d => (d.id === id ? { ...d, is_favorite: currentFavorite } : d))
      );
    }
  };

  return {
    documents,
    isLoading,
    error,
    refresh: fetchDocuments,
    addDocument,
    updateDocument,
    deleteDocument,
    toggleFavorite,
  };
}
