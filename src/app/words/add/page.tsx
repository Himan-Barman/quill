'use client';

import { useState, useEffect, Suspense, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Save, Loader2, ChevronDown, Check } from 'lucide-react';
import { useWordsData, WordData } from '@/hooks/useWordsData';
import { parsePastedText, WordImportResult } from '@/lib/wordParser';
import { useSettings } from '@/hooks/useSettings';

const POS_OPTIONS = ['Noun', 'Verb', 'Adjective', 'Adverb', 'Pronoun', 'Preposition', 'Conjunction', 'Interjection', 'Idiom'];
const DIFFICULTY_OPTIONS = ['Easy', 'Medium', 'Hard'];

function AutoResizeTextarea({ name, value, onChange, placeholder, required = false, isGlowing = false, minHeight = "50px" }: any) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [value]);

  const baseClass = "w-full bg-surface border border-border rounded-xl px-4 py-3 text-foreground placeholder-muted focus:outline-none focus:border-[#EAB308] focus:ring-1 focus:ring-[#EAB308] transition-all resize-none overflow-hidden";
  const glowClass = isGlowing ? 'ring-2 ring-[#EAB308] border-[#EAB308] shadow-[0_0_15px_rgba(234,179,8,0.5)]' : '';

  return (
    <textarea
      ref={textareaRef}
      required={required}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows={1}
      style={{ minHeight }}
      className={`${baseClass} ${glowClass}`}
    />
  );
}

function LexDropdown({
  label,
  value,
  options,
  onChange
}: {
  label: string,
  value: string,
  options: string[],
  onChange: (val: string) => void
}) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative w-full" ref={ref}>
      <label className="block text-sm font-bold text-muted uppercase tracking-wider mb-2">{label}</label>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full bg-surface border ${isOpen ? 'border-[#EAB308]' : 'border-border'} rounded-xl px-4 py-3 text-foreground flex justify-between items-center focus:outline-none focus:ring-1 focus:ring-[#EAB308] transition-all`}
      >
        <span>{value}</span>
        <ChevronDown className={`w-4 h-4 text-muted transition-transform ${isOpen ? 'rotate-180 text-[#EAB308]' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 top-full mt-2 w-full bg-surface border border-border rounded-2xl shadow-2xl overflow-hidden z-50 flex flex-col py-2 max-h-64 overflow-y-auto"
          >
            {options.map((opt) => {
              const active = opt === value;
              return (
                <div key={opt} className="px-2 py-1">
                  <button
                    type="button"
                    className={`w-full text-left px-4 py-2.5 flex items-center justify-between text-sm transition-all rounded-xl ${active ? 'bg-[#EAB308]/15 text-[#EAB308] font-bold shadow-[0_0_12px_rgba(234,179,8,0.15)]' : 'text-muted hover:text-foreground hover:bg-foreground/10'
                      }`}
                    onClick={() => {
                      onChange(opt);
                      setIsOpen(false);
                    }}
                  >
                    <span>{opt}</span>
                    {active && <Check className="w-4 h-4 text-[#EAB308]" />}
                  </button>
                </div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function AddWordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('edit');
  const { addWord, updateWord, words, isLoading: isWordsLoading } = useWordsData();
  const { dailyGoal } = useSettings();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    word: '',
    ipa: '',
    part_of_speech: 'Noun',
    difficulty: 'Medium',
    meaning: '',
    advanced_meaning: '',
    synonyms: '',
    antonyms: '',
    examples: '',
    common_collocations: '',
    memory_trick: '',
    common_mistakes: '',
    personal_notes: ''
  });

  // State to trigger the yellow glow when parsing succeeds
  const [isGlowing, setIsGlowing] = useState(false);

  useEffect(() => {
    if (editId && !isWordsLoading) {
      const wordToEdit = words.find(w => w.id === editId);
      if (wordToEdit) {
        setFormData({
          word: wordToEdit.word || '',
          ipa: wordToEdit.ipa || '',
          part_of_speech: wordToEdit.part_of_speech || 'Noun',
          difficulty: wordToEdit.difficulty || 'Medium',
          meaning: wordToEdit.meaning || '',
          advanced_meaning: wordToEdit.advanced_meaning || '',
          synonyms: wordToEdit.synonyms?.join('\n') || '',
          antonyms: wordToEdit.antonyms?.join('\n') || '',
          examples: wordToEdit.examples?.join('\n\n') || '',
          common_collocations: wordToEdit.common_collocations?.join('\n') || '',
          memory_trick: wordToEdit.memory_trick || '',
          common_mistakes: wordToEdit.common_mistakes || '',
          personal_notes: wordToEdit.personal_notes || ''
        });
      }
    }
  }, [editId, words, isWordsLoading]);

  const staggeredPopulate = async (result: WordImportResult) => {
    const delay = (ms: number) => new Promise(res => setTimeout(res, ms));
    const step = 40; // ms per field

    if (result.ipa) { await delay(step); setFormData(p => ({ ...p, ipa: result.ipa! })); }
    if (result.partOfSpeech) { await delay(step); setFormData(p => ({ ...p, part_of_speech: result.partOfSpeech!.charAt(0).toUpperCase() + result.partOfSpeech!.slice(1).toLowerCase() })); }
    if (result.difficulty) { await delay(step); setFormData(p => ({ ...p, difficulty: result.difficulty!.charAt(0).toUpperCase() + result.difficulty!.slice(1).toLowerCase() })); }
    if (result.simpleMeaning) { await delay(step); setFormData(p => ({ ...p, meaning: result.simpleMeaning! })); }
    if (result.advancedMeaning) { await delay(step); setFormData(p => ({ ...p, advanced_meaning: result.advancedMeaning! })); }
    if (result.synonyms?.length) { await delay(step); setFormData(p => ({ ...p, synonyms: result.synonyms.join('\n') })); }
    if (result.antonyms?.length) { await delay(step); setFormData(p => ({ ...p, antonyms: result.antonyms.join('\n') })); }
    if (result.examples?.length) { await delay(step); setFormData(p => ({ ...p, examples: result.examples.join('\n\n') })); }
    if (result.commonCollocations?.length) { await delay(step); setFormData(p => ({ ...p, common_collocations: result.commonCollocations.join('\n') })); }
    if (result.memoryTrick) { await delay(step); setFormData(p => ({ ...p, memory_trick: result.memoryTrick! })); }
    if (result.commonMistakes) { await delay(step); setFormData(p => ({ ...p, common_mistakes: result.commonMistakes! })); }
  };

  const handleWordChange = async (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;

    // Auto parser logic
    if (text.includes('\n')) {
      const result = parsePastedText(text);
      if (result.isSuccess && result.word) {
        setFormData(prev => ({ ...prev, word: result.word! }));
        setIsGlowing(true);
        setTimeout(() => setIsGlowing(false), 800);

        setSuccessMsg('Vocabulary imported successfully!');
        setTimeout(() => setSuccessMsg(null), 3000);
        setError(null);

        await staggeredPopulate(result);
        return;
      } else {
        setError('Unable to detect a structured vocabulary entry.');
        setTimeout(() => setError(null), 3000);
        // Clean the text to a single line if parsing failed but they pasted a block
        setFormData(prev => ({ ...prev, word: text.split('\n')[0].trim() }));
        return;
      }
    }

    setFormData(prev => ({ ...prev, word: text }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.word.trim() || !formData.meaning.trim()) {
      setError('Word and Simple Meaning are required.');
      return;
    }

    setIsLoading(true);
    setError(null);

    const payload: Partial<WordData> = {
      word: formData.word.trim(),
      ipa: formData.ipa.trim(),
      part_of_speech: formData.part_of_speech,
      difficulty: formData.difficulty,
      meaning: formData.meaning.trim(),
      advanced_meaning: formData.advanced_meaning.trim() || undefined,
      synonyms: formData.synonyms.split('\n').map(s => s.trim()).filter(Boolean),
      antonyms: formData.antonyms.split('\n').map(s => s.trim()).filter(Boolean),
      examples: formData.examples.split('\n\n').map(s => s.trim()).filter(Boolean),
      common_collocations: formData.common_collocations.split('\n').map(s => s.trim()).filter(Boolean),
      memory_trick: formData.memory_trick.trim() || undefined,
      common_mistakes: formData.common_mistakes.trim() || undefined,
      personal_notes: formData.personal_notes.trim() || undefined,
    };

    let result;
    if (editId) {
      result = await updateWord(editId, payload);
      setIsLoading(false);
      if (result?.success) {
        router.push('/words');
      } else {
        setError(result?.error || 'Failed to save word');
      }
    } else {
      result = await addWord(payload);
      setIsLoading(false);
      
      if (result?.success) {
        // Calculate daily goal logic
        const now = new Date();
        let wordsAddedToday = words.filter(w => {
          const createdAt = new Date(w.created_at);
          return createdAt.getFullYear() === now.getFullYear() &&
                 createdAt.getMonth() === now.getMonth() &&
                 createdAt.getDate() === now.getDate();
        }).length;
        
        // Include the newly added word
        wordsAddedToday += 1;

        if (wordsAddedToday >= dailyGoal) {
          setSuccessMsg(`Daily goal reached! (${dailyGoal} words)`);
          setTimeout(() => {
            router.push('/words');
          }, 1500); // Briefly show message before navigating back
        } else {
          setSuccessMsg(`Word saved! ${dailyGoal - wordsAddedToday} words left today.`);
          setTimeout(() => setSuccessMsg(null), 3000);
          
          // Clear fields to allow adding another word
          setFormData({
            word: '',
            ipa: '',
            part_of_speech: 'Noun',
            difficulty: 'Medium',
            meaning: '',
            advanced_meaning: '',
            synonyms: '',
            antonyms: '',
            examples: '',
            common_collocations: '',
            memory_trick: '',
            common_mistakes: '',
            personal_notes: ''
          });
          
          // Scroll to top
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      } else {
        setError(result?.error || 'Failed to save word');
      }
    }
  };

  const labelClass = "block text-sm font-bold text-[#EAB308] uppercase tracking-widest mb-2";

  if (editId && isWordsLoading) {
    return (
      <div className="flex flex-1 items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 text-[#EAB308] animate-spin" />
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between mb-8 px-4 md:px-0">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 bg-background border border-border rounded-xl flex items-center justify-center text-muted hover:text-foreground hover:border-[#EAB308] transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold text-foreground">
            {editId ? 'Edit Word' : 'Add New Word'}
          </h1>
        </div>

        <button
          onClick={handleSubmit}
          disabled={isLoading}
          className="flex items-center gap-2 bg-[#EAB308] hover:bg-[#CA8A04] text-[#1A1A1A] font-bold py-2.5 px-6 rounded-xl shadow-[0_4px_14px_rgba(234,179,8,0.4)] transition-all disabled:opacity-50"
        >
          {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          <span>Save</span>
        </button>
      </div>

      <AnimatePresence>
        {error && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mx-4 md:mx-0 mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
            <p className="text-red-400 font-medium">{error}</p>
          </motion.div>
        )}
        {successMsg && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mx-4 md:mx-0 mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
            <p className="text-green-400 font-medium">{successMsg}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit} className="px-4 md:px-0 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* Left Column */}
          <div className="space-y-6">

            <div className="bg-background border border-border rounded-2xl p-6 space-y-6 shadow-xl">
              <h2 className={labelClass}>Basic Information</h2>

              <div className="relative">
                <label className="block text-sm font-bold text-[#94A3B8] uppercase tracking-wider mb-2">Word *</label>
                <AutoResizeTextarea
                  required
                  name="word"
                  value={formData.word}
                  onChange={handleWordChange}
                  isGlowing={isGlowing}
                  placeholder="e.g. Ephemeral"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-[#94A3B8] uppercase tracking-wider mb-2">Pronunciation (IPA)</label>
                <AutoResizeTextarea
                  name="ipa"
                  value={formData.ipa}
                  onChange={handleChange}
                  placeholder="e.g. /ɪˈfem(ə)rəl/"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <LexDropdown
                  label="Part of Speech"
                  value={formData.part_of_speech}
                  options={POS_OPTIONS}
                  onChange={(val) => handleSelectChange('part_of_speech', val)}
                />
                <LexDropdown
                  label="Difficulty"
                  value={formData.difficulty}
                  options={DIFFICULTY_OPTIONS}
                  onChange={(val) => handleSelectChange('difficulty', val)}
                />
              </div>
            </div>

            <div className="bg-background border border-border rounded-2xl p-6 space-y-6 shadow-xl">
              <h2 className={labelClass}>Meanings</h2>

              <div>
                <label className="block text-sm font-bold text-[#94A3B8] uppercase tracking-wider mb-2">Simple Meaning *</label>
                <AutoResizeTextarea
                  required
                  name="meaning"
                  value={formData.meaning}
                  onChange={handleChange}
                  minHeight="80px"
                  placeholder="e.g. Lasting for a very short time."
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-[#94A3B8] uppercase tracking-wider mb-2">Advanced Meaning</label>
                <AutoResizeTextarea
                  name="advanced_meaning"
                  value={formData.advanced_meaning}
                  onChange={handleChange}
                  minHeight="80px"
                  placeholder="e.g. Often used to describe temporary art or nature."
                />
              </div>
            </div>

            <div className="bg-background border border-border rounded-2xl p-6 space-y-6 shadow-xl">
              <h2 className={labelClass}>Relationships</h2>

              <div>
                <label className="block text-sm font-bold text-[#94A3B8] uppercase tracking-wider mb-2">Synonyms</label>
                <AutoResizeTextarea
                  name="synonyms"
                  value={formData.synonyms}
                  onChange={handleChange}
                  minHeight="80px"
                  placeholder="e.g. temporary, fleeting, short-lived"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-[#94A3B8] uppercase tracking-wider mb-2">Antonyms</label>
                <AutoResizeTextarea
                  name="antonyms"
                  value={formData.antonyms}
                  onChange={handleChange}
                  minHeight="80px"
                  placeholder="e.g. permanent, eternal, lasting"
                />
              </div>
            </div>

          </div>

          {/* Right Column */}
          <div className="space-y-6">

            <div className="bg-background border border-border rounded-2xl p-6 space-y-6 shadow-xl">
              <h2 className={labelClass}>Context</h2>

              <div>
                <label className="block text-sm font-bold text-[#94A3B8] uppercase tracking-wider mb-2">Examples</label>
                <AutoResizeTextarea
                  name="examples"
                  value={formData.examples}
                  onChange={handleChange}
                  minHeight="120px"
                  placeholder="e.g. Fashions are inherently ephemeral."
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-[#94A3B8] uppercase tracking-wider mb-2">Common Collocations</label>
                <AutoResizeTextarea
                  name="common_collocations"
                  value={formData.common_collocations}
                  onChange={handleChange}
                  minHeight="80px"
                  placeholder="e.g. ephemeral nature, ephemeral art"
                />
              </div>
            </div>

            <div className="bg-background border border-border rounded-2xl p-6 space-y-6 shadow-xl">
              <h2 className={labelClass}>Personalization</h2>

              <div>
                <label className="block text-sm font-bold text-[#94A3B8] uppercase tracking-wider mb-2">Memory Trick</label>
                <AutoResizeTextarea
                  name="memory_trick"
                  value={formData.memory_trick}
                  onChange={handleChange}
                  minHeight="80px"
                  placeholder="e.g. Sounds like 'a phantom', here then gone."
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-[#94A3B8] uppercase tracking-wider mb-2">Common Mistakes</label>
                <AutoResizeTextarea
                  name="common_mistakes"
                  value={formData.common_mistakes}
                  onChange={handleChange}
                  minHeight="80px"
                  placeholder="e.g. Don't confuse with ethereal."
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-[#94A3B8] uppercase tracking-wider mb-2">Personal Notes</label>
                <AutoResizeTextarea
                  name="personal_notes"
                  value={formData.personal_notes}
                  onChange={handleChange}
                  minHeight="80px"
                  placeholder="e.g. Saw this word in Harry Potter."
                />
              </div>
            </div>

          </div>

        </div>
      </form>
    </>
  );
}

export default function AddWordPage() {
  return (
    <div className="md:p-8 max-w-7xl mx-auto h-full flex flex-col pb-24 pt-24 w-full">
      <Suspense fallback={
        <div className="flex flex-1 items-center justify-center min-h-[50vh]">
          <Loader2 className="w-8 h-8 text-[#EAB308] animate-spin" />
        </div>
      }>
        <AddWordForm />
      </Suspense>
    </div>
  );
}
