'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Sparkles,
  CalendarRange,
  Layers,
  ArrowLeftRight,
  Headphones,
  History,
  Check,
  AlertCircle,
} from 'lucide-react';
import { useWordsData } from '@/hooks/useWordsData';
import { LexLearnBarCard } from '@/components/learn/LexLearnBarCard';
import { TimeframeQuizSetupModal } from '@/components/learn/TimeframeQuizSetupModal';
import { QuizSetupModal } from '@/components/learn/QuizSetupModal';
import { ListeningSetupModal } from '@/components/learn/ListeningSetupModal';

export default function LearnPage() {
  const router = useRouter();
  const { words, isLoading } = useWordsData();

  const [searchQuery, setSearchQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  // Modals state
  const [isTimeframeModalOpen, setIsTimeframeModalOpen] = useState(false);
  const [synonymModalOpen, setSynonymModalOpen] = useState(false);
  const [antonymModalOpen, setAntonymModalOpen] = useState(false);
  const [listeningModalOpen, setListeningModalOpen] = useState(false);

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // Words added today for Daily Revision check
  const now = new Date();
  const todayWords = useMemo(() => {
    return words.filter((w) => {
      if (!w.created_at) return false;
      const d = new Date(w.created_at);
      return (
        d.getFullYear() === now.getFullYear() &&
        d.getMonth() === now.getMonth() &&
        d.getDate() === now.getDate()
      );
    });
  }, [words, now]);

  const handleDailyRevisionClick = () => {
    if (words.length < 4) {
      showToast('You need at least 4 saved words in total to start a quiz.');
      return;
    }
    if (todayWords.length === 0) {
      showToast("You haven't added any words today! Add some new words to review them here.");
      return;
    }
    router.push('/learn/daily-revision');
  };

  // Learning items for search filtering
  const practiceItems = [
    {
      id: 'daily-revision',
      title: 'Daily Revision',
      subtitle: 'Review the words you added today with instant feedback.',
      icon: Sparkles,
      iconColor: 'text-blue-400',
      iconBg: 'bg-blue-500/10',
      badge: todayWords.length > 0 ? `${todayWords.length} Today` : undefined,
      onClick: handleDailyRevisionClick,
    },
    {
      id: 'mastery-challenge',
      title: 'Mastery Challenge',
      subtitle: 'Test your knowledge on specific days or your entire vocabulary.',
      icon: CalendarRange,
      iconColor: 'text-pink-400',
      iconBg: 'bg-pink-500/10',
      onClick: () => setIsTimeframeModalOpen(true),
    },
  ];

  const advancedItems = [
    {
      id: 'synonyms-quiz',
      title: 'Synonyms Quiz',
      subtitle: 'Test your knowledge on word synonyms in matrix or quiz format.',
      icon: Layers,
      iconColor: 'text-purple-400',
      iconBg: 'bg-purple-500/10',
      onClick: () => setSynonymModalOpen(true),
    },
    {
      id: 'antonyms-quiz',
      title: 'Antonyms Quiz',
      subtitle: 'Test your knowledge on word antonyms with interactive challenges.',
      icon: ArrowLeftRight,
      iconColor: 'text-teal-400',
      iconBg: 'bg-teal-500/10',
      onClick: () => setAntonymModalOpen(true),
    },
  ];

  const audioItems = [
    {
      id: 'listening-mode',
      title: 'Listening Mode',
      subtitle: 'Listen to your words and their meanings hands-free with auto-speech.',
      icon: Headphones,
      iconColor: 'text-emerald-400',
      iconBg: 'bg-emerald-500/10',
      onClick: () => setListeningModalOpen(true),
    },
  ];

  const filterItems = (items: typeof practiceItems) => {
    if (!searchQuery.trim()) return items;
    const q = searchQuery.toLowerCase();
    return items.filter(
      (item) => item.title.toLowerCase().includes(q) || item.subtitle.toLowerCase().includes(q)
    );
  };

  const filteredPractice = filterItems(practiceItems);
  const filteredAdvanced = filterItems(advancedItems);
  const filteredAudio = filterItems(audioItems);
  const hasAnyResults =
    filteredPractice.length > 0 || filteredAdvanced.length > 0 || filteredAudio.length > 0;

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
            <AlertCircle className="w-4 h-4 text-blue-400" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Header Bar: Fixed Floating Search Capsule + Quiz History Action */}
      <div className="fixed top-3 left-0 right-0 md:left-64 z-50 pointer-events-none">
        <div className="max-w-7xl mx-auto w-full px-4 md:px-8 flex items-center justify-between gap-4">
          {/* Balanced spacer for desktop centering */}
          <div className="w-36 hidden lg:block shrink-0 pointer-events-none" />

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
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  className="block w-full pl-12 pr-4 py-3.5 bg-surface/50 border border-border rounded-full text-foreground placeholder-muted/50 focus:ring-0 focus:border-blue-500 outline-none transition-all shadow-[0_4px_20px_rgba(0,0,0,0.3)] backdrop-blur-md text-[16px]"
                  placeholder="Search learning modes or quizzes..."
                />
              </div>
            </motion.div>
          </div>

          {/* Top-Right Action Pill: Quiz History */}
          <div className="shrink-0 pointer-events-auto w-36 flex justify-end">
            <Link
              href="/learn/history"
              className="flex items-center gap-2 px-4 py-3 bg-surface/50 border border-border rounded-full text-foreground hover:border-blue-500/40 transition-all shadow-[0_4px_20px_rgba(0,0,0,0.3)] backdrop-blur-md text-[14px] font-semibold cursor-pointer group"
            >
              <History className="w-4 h-4 text-blue-400 group-hover:rotate-[-20deg] transition-transform" />
              <span>Quiz History</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Learn Sections List */}
      <div className="flex-1 overflow-y-auto min-h-0 w-full space-y-6">
        {!hasAnyResults ? (
          <div className="flex flex-col items-center justify-center h-[50vh]">
            <div className="w-16 h-16 rounded-3xl glass-card flex items-center justify-center mb-4 text-muted">
              <Search className="w-8 h-8 text-muted" />
            </div>
            <p className="text-muted text-sm font-medium">
              No learning modes found matching &ldquo;{searchQuery}&rdquo;.
            </p>
          </div>
        ) : (
          <>
            {/* PRACTICE & QUIZZES */}
            {filteredPractice.length > 0 && (
              <div className="space-y-3">
                <div className="px-1 text-[11.5px] font-extrabold tracking-wider uppercase text-blue-400">
                  Practice & Quizzes
                </div>
                <div className="space-y-3">
                  {filteredPractice.map((item) => (
                    <LexLearnBarCard
                      key={item.id}
                      title={item.title}
                      subtitle={item.subtitle}
                      icon={item.icon}
                      iconColor={item.iconColor}
                      iconBg={item.iconBg}
                      badge={item.badge}
                      onClick={item.onClick}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* ADVANCED QUIZZES */}
            {filteredAdvanced.length > 0 && (
              <div className="space-y-3">
                <div className="px-1 text-[11.5px] font-extrabold tracking-wider uppercase text-blue-400">
                  Advanced Quizzes
                </div>
                <div className="space-y-3">
                  {filteredAdvanced.map((item) => (
                    <LexLearnBarCard
                      key={item.id}
                      title={item.title}
                      subtitle={item.subtitle}
                      icon={item.icon}
                      iconColor={item.iconColor}
                      iconBg={item.iconBg}
                      onClick={item.onClick}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* AUDIO LEARNING */}
            {filteredAudio.length > 0 && (
              <div className="space-y-3">
                <div className="px-1 text-[11.5px] font-extrabold tracking-wider uppercase text-blue-400">
                  Audio Learning
                </div>
                <div className="space-y-3">
                  {filteredAudio.map((item) => (
                    <LexLearnBarCard
                      key={item.id}
                      title={item.title}
                      subtitle={item.subtitle}
                      icon={item.icon}
                      iconColor={item.iconColor}
                      iconBg={item.iconBg}
                      onClick={item.onClick}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Setup Modals */}
      <TimeframeQuizSetupModal
        isOpen={isTimeframeModalOpen}
        onClose={() => setIsTimeframeModalOpen(false)}
        allWords={words}
      />

      <QuizSetupModal
        isOpen={synonymModalOpen}
        onClose={() => setSynonymModalOpen(false)}
        title="Synonyms Quiz"
        mode="synonym"
        allWords={words}
      />

      <QuizSetupModal
        isOpen={antonymModalOpen}
        onClose={() => setAntonymModalOpen(false)}
        title="Antonyms Quiz"
        mode="antonym"
        allWords={words}
      />

      <ListeningSetupModal
        isOpen={listeningModalOpen}
        onClose={() => setListeningModalOpen(false)}
        allWords={words}
      />
    </div>
  );
}
