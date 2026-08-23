'use client';

import { useState, useEffect } from 'react';
import { Volume2, VolumeX, BookOpen, Book, AlignLeft, ArrowRightLeft, MessageSquare, Link as LinkIcon, Lightbulb, AlertTriangle, FileText } from 'lucide-react';
import type { WordData } from '@/hooks/useWordsData';
import { TTSService } from '@/lib/tts';

interface LexWordDetailViewProps {
  word: WordData;
}

export function LexWordDetailView({ word }: LexWordDetailViewProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const unsubscribe = TTSService.subscribe((currentlySpeakingWord) => {
      setIsPlaying(currentlySpeakingWord === word.word);
    });
    // Check initial state
    setIsPlaying(TTSService.getCurrentlySpeaking() === word.word);
    return unsubscribe;
  }, [word.word]);

  const handleSpeak = () => {
    if (isPlaying) {
      TTSService.stop();
    } else {
      TTSService.speak(word.word);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return 'text-green-500 border-green-500/20 bg-green-500/10';
      case 'medium': return 'text-orange-500 border-orange-500/20 bg-orange-500/10';
      case 'hard': return 'text-red-500 border-red-500/20 bg-red-500/10';
      default: return 'text-blue-500 border-blue-500/20 bg-blue-500/10';
    }
  };

  const Section = ({ title, content, icon: Icon }: { title: string, content: string, icon: any }) => (
    <div className="mb-6">
      <div className="flex items-center space-x-2 mb-2">
        <Icon className="w-5 h-5 text-blue-500" />
        <h4 className="text-blue-500 font-bold text-[12px] uppercase tracking-wider">{title}</h4>
      </div>
      <div className="p-5 rounded-2xl bg-surface border border-border/50">
        <p className="text-muted leading-relaxed text-[15px]">{content}</p>
      </div>
    </div>
  );

  const ListSection = ({ title, items, icon: Icon }: { title: string, items: string[], icon: any }) => {
    if (!items || items.length === 0) return null;
    return (
      <div className="mb-6">
        <div className="flex items-center space-x-2 mb-2">
          <Icon className="w-5 h-5 text-blue-500" />
          <h4 className="text-blue-500 font-bold text-[12px] uppercase tracking-wider">{title}</h4>
        </div>
        <div className="p-5 rounded-2xl bg-surface border border-border/50">
          <ul className="space-y-2">
            {items.map((item, idx) => (
              <li key={idx} className="flex items-start">
                <span className="text-blue-500 font-bold text-lg mr-3 leading-none">•</span>
                <span className="text-muted leading-relaxed text-[15px]">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col text-left">
      {/* Header */}
      <div className="flex items-baseline mb-2">
        <h2 className="text-2xl font-bold text-foreground mr-3">{word.word}</h2>
        {word.part_of_speech && (
          <span className="text-blue-400 font-bold text-[11px] italic tracking-wide">{word.part_of_speech}</span>
        )}
        <div className="flex-grow"></div>
        <div className={`px-2 py-0.5 rounded-lg border ${getDifficultyColor(word.difficulty)} text-[10px] font-bold uppercase`}>
          {word.difficulty || 'MEDIUM'}
        </div>
      </div>

      {/* IPA and Audio */}
      {word.ipa && (
        <div className="flex items-center space-x-2 mb-8">
          <button onClick={handleSpeak} className="hover:opacity-80 transition-opacity">
            {isPlaying ? (
              <VolumeX className="w-5 h-5 text-blue-500" />
            ) : (
              <Volume2 className="w-5 h-5 text-blue-500/80" />
            )}
          </button>
          <span className="text-muted font-mono text-[15px]">{word.ipa}</span>
        </div>
      )}

      {!word.ipa && <div className="mb-8" />}

      {/* Main Details */}
      {word.meaning && <Section title="Meaning" content={word.meaning} icon={BookOpen} />}
      {word.advanced_meaning && <Section title="Advanced Meaning" content={word.advanced_meaning} icon={Book} />}

      <ListSection title="Synonyms" items={word.synonyms || []} icon={AlignLeft} />
      <ListSection title="Antonyms" items={word.antonyms || []} icon={ArrowRightLeft} />
      <ListSection title="Examples" items={word.examples || []} icon={MessageSquare} />
      <ListSection title="Collocations" items={word.common_collocations || []} icon={LinkIcon} />

      {word.memory_trick && <Section title="Memory Trick" content={word.memory_trick} icon={Lightbulb} />}
      {word.common_mistakes && <Section title="Common Mistakes" content={word.common_mistakes} icon={AlertTriangle} />}
      {word.personal_notes && <Section title="Personal Notes" content={word.personal_notes} icon={FileText} />}

      <div className="h-8"></div>
    </div>
  );
}
