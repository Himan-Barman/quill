import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

export interface WordData {
  id: string;
  word: string;
  ipa: string;
  part_of_speech?: string;
  meaning: string;
  simple_meaning?: string;
  advanced_meaning?: string;
  synonyms?: string[];
  antonyms?: string[];
  examples?: string[];
  common_collocations?: string[];
  memory_trick?: string;
  common_mistakes?: string;
  personal_notes?: string;
  difficulty: string; // Easy, Medium, Hard
  is_favorite?: boolean;
  is_mastered?: boolean;
  needs_review?: boolean;
  tags?: string[];
  created_at: string;
  last_reviewed?: string;
}

const mapRowToWordData = (row: any): WordData => ({
  ...row,
  meaning: row.simple_meaning || row.meaning || '',
  simple_meaning: row.simple_meaning || row.meaning || '',
  synonyms: Array.isArray(row.synonyms) ? row.synonyms : [],
  antonyms: Array.isArray(row.antonyms) ? row.antonyms : [],
  examples: Array.isArray(row.examples) ? row.examples : [],
  common_collocations: Array.isArray(row.common_collocations) ? row.common_collocations : [],
  tags: Array.isArray(row.tags) ? row.tags : [],
});

const mapWordDataToDbPayload = (word: Partial<WordData>) => {
  const { meaning, simple_meaning, tags, needs_review, ...rest } = word as any;
  const payload: any = { ...rest };
  
  // Supabase column is 'simple_meaning'
  payload.simple_meaning = simple_meaning || meaning || '';
  
  return payload;
};

export function useWordsData() {
  const { user } = useAuth();
  const [words, setWords] = useState<WordData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWords = async () => {
    if (!user) return;
    setIsLoading(true);
    setError(null);
    try {
      if (user.id === 'demo-123') {
        setWords([]);
        setIsLoading(false);
        return;
      }
      
      const { data, error } = await supabase
        .from('vocabularies')
        .select('*')
        .eq('user_id', user.id)
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const parsedData = (data || []).map(mapRowToWordData);
      setWords(parsedData);
    } catch (err: any) {
      console.error('Error fetching words:', err);
      setError(err.message || 'Failed to fetch words');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWords();
  }, [user]);

  const addWord = async (newWord: Partial<WordData>) => {
    if (!user) return;
    try {
      const dbPayload = mapWordDataToDbPayload(newWord);
      const { data, error } = await supabase
        .from('vocabularies')
        .insert({
          ...dbPayload,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      const formatted = mapRowToWordData(data);
      setWords(prev => [formatted, ...prev]);
      return { success: true, data: formatted };
    } catch (err: any) {
      console.error('Error adding word:', err);
      return { success: false, error: err.message };
    }
  };

  const updateWord = async (id: string, updates: Partial<WordData>) => {
    if (!user) return;
    try {
      const dbPayload = mapWordDataToDbPayload(updates);
      const { data, error } = await supabase
        .from('vocabularies')
        .update(dbPayload)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      const formatted = mapRowToWordData(data);
      setWords(prev => prev.map(w => w.id === id ? formatted : w));
      return { success: true, data: formatted };
    } catch (err: any) {
      console.error('Error updating word:', err);
      return { success: false, error: err.message };
    }
  };

  const deleteWord = async (id: string) => {
    if (!user) return;
    try {
      // Soft delete
      const { error } = await supabase
        .from('vocabularies')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
      setWords(prev => prev.filter(w => w.id !== id));
      return { success: true };
    } catch (err: any) {
      console.error('Error deleting word:', err);
      return { success: false, error: err.message };
    }
  };

  return {
    words,
    isLoading,
    error,
    refresh: fetchWords,
    addWord,
    updateWord,
    deleteWord
  };
}
