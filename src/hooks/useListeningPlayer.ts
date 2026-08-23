import { useState, useEffect, useRef, useCallback } from 'react';
import type { WordData } from '@/hooks/useWordsData';

export type ListeningContentType = 'simple' | 'advanced' | 'synonyms' | 'antonyms';
export type ListeningPhase = 'idle' | 'speakingWord' | 'speakingMeaning';

export interface LyricLine {
  label: string;
  text: string;
  type: 'word' | ListeningContentType;
}

export function useListeningPlayer(words: WordData[]) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [selectedTypes, setSelectedTypes] = useState<Set<ListeningContentType>>(
    new Set(['simple'])
  );
  const [currentPhase, setCurrentPhase] = useState<ListeningPhase>('idle');
  const [activeLyricIndex, setActiveLyricIndex] = useState<number>(-1);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);

  const loopIdRef = useRef<number>(0);
  const isPlayingRef = useRef<boolean>(false);
  const currentIndexRef = useRef<number>(0);
  const playbackSpeedRef = useRef<number>(1.0);
  const selectedVoiceRef = useRef<SpeechSynthesisVoice | null>(null);
  const selectedTypesRef = useRef<Set<ListeningContentType>>(new Set(['simple']));

  // Keep refs in sync with state for async loop
  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    currentIndexRef.current = currentIndex;
  }, [currentIndex]);

  useEffect(() => {
    playbackSpeedRef.current = playbackSpeed;
  }, [playbackSpeed]);

  useEffect(() => {
    selectedVoiceRef.current = selectedVoice;
  }, [selectedVoice]);

  useEffect(() => {
    selectedTypesRef.current = selectedTypes;
  }, [selectedTypes]);

  // Load SpeechSynthesis voices
  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    const updateVoices = () => {
      const available = window.speechSynthesis.getVoices();
      if (available.length > 0) {
        setVoices(available);
        const englishVoice =
          available.find((v) => v.lang.startsWith('en-') && (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Premium'))) ||
          available.find((v) => v.lang.startsWith('en-')) ||
          available.find((v) => v.lang.startsWith('en')) ||
          available[0];
        if (englishVoice && !selectedVoiceRef.current) {
          setSelectedVoice(englishVoice);
          selectedVoiceRef.current = englishVoice;
        }
      }
    };

    updateVoices();
    window.speechSynthesis.onvoiceschanged = updateVoices;
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, []);

  const currentWord = words.length > 0 && currentIndex >= 0 && currentIndex < words.length ? words[currentIndex] : null;

  // Generate structured lyrics for the current word (only meanings, synonyms, antonyms)
  const getLyricsForWord = useCallback(
    (word: WordData): LyricLine[] => {
      const lines: LyricLine[] = [];

      if (selectedTypes.has('simple') && (word.simple_meaning || word.meaning)) {
        lines.push({
          label: 'Simple Meaning',
          text: word.simple_meaning || word.meaning,
          type: 'simple',
        });
      }

      if (selectedTypes.has('advanced') && word.advanced_meaning) {
        lines.push({
          label: 'Advanced Meaning',
          text: word.advanced_meaning,
          type: 'advanced',
        });
      }

      if (selectedTypes.has('synonyms') && word.synonyms && word.synonyms.length > 0) {
        lines.push({
          label: 'Synonyms',
          text: word.synonyms.join(', '),
          type: 'synonyms',
        });
      }

      if (selectedTypes.has('antonyms') && word.antonyms && word.antonyms.length > 0) {
        lines.push({
          label: 'Antonyms',
          text: word.antonyms.join(', '),
          type: 'antonyms',
        });
      }

      return lines;
    },
    [selectedTypes]
  );

  const speakText = (text: string): Promise<boolean> => {
    return new Promise((resolve) => {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
        resolve(false);
        return;
      }

      if (!text || text.trim().length === 0) {
        resolve(true);
        return;
      }

      // Resume synthesis if paused
      try {
        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        }
      } catch {}

      const utterance = new SpeechSynthesisUtterance(text);
      (window as unknown as { _lexoraUtterance?: SpeechSynthesisUtterance })._lexoraUtterance = utterance;

      utterance.lang = 'en-US';
      utterance.volume = 1.0;
      utterance.pitch = 1.0;
      utterance.rate = playbackSpeedRef.current || 1.0;

      // Assign voice if available
      if (selectedVoiceRef.current) {
        utterance.voice = selectedVoiceRef.current;
      } else {
        const available = window.speechSynthesis.getVoices();
        const enVoice =
          available.find((v) => v.lang.startsWith('en-') && v.name.includes('Google')) ||
          available.find((v) => v.lang.startsWith('en-')) ||
          available.find((v) => v.lang.startsWith('en')) ||
          available[0];
        if (enVoice) {
          utterance.voice = enVoice;
        }
      }

      let isFinished = false;
      const finish = (result: boolean) => {
        if (isFinished) return;
        isFinished = true;
        clearTimeout(safetyTimer);
        resolve(result);
      };

      utterance.onstart = () => {
        // Keep synthesis active
        try {
          if (window.speechSynthesis.paused) {
            window.speechSynthesis.resume();
          }
        } catch {}
      };

      utterance.onend = () => finish(true);
      utterance.onerror = (e) => {
        if (e.error === 'interrupted' || e.error === 'canceled') {
          finish(false);
        } else {
          console.warn('TTS playback error:', e);
          finish(true);
        }
      };

      // Generous safety timer
      const estimatedMs = Math.max(3000, (text.length / 3) * 600);
      const safetyTimer = setTimeout(() => {
        finish(true);
      }, estimatedMs);

      try {
        window.speechSynthesis.speak(utterance);
      } catch (err) {
        console.error('SpeechSynthesis.speak failed:', err);
        finish(false);
      }
    });
  };

  const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  const startPlaybackLoop = async (currentLoopId: number) => {
    while (isPlayingRef.current && currentLoopId === loopIdRef.current) {
      const wordList = words;
      const idx = currentIndexRef.current;
      if (idx >= wordList.length) {
        // End of playlist
        setIsPlaying(false);
        setCurrentPhase('idle');
        setActiveLyricIndex(-1);
        break;
      }

      const word = wordList[idx];
      const lyrics = getLyricsForWord(word);

      // Speak word title first
      setCurrentPhase('speakingWord');
      setActiveLyricIndex(-1);
      const wordSuccess = await speakText(word.word);
      if (!wordSuccess && (!isPlayingRef.current || currentLoopId !== loopIdRef.current)) break;

      await delay(450);

      // Speak each lyric detail
      for (let lIdx = 0; lIdx < lyrics.length; lIdx++) {
        if (!isPlayingRef.current || currentLoopId !== loopIdRef.current) break;

        const line = lyrics[lIdx];
        setActiveLyricIndex(lIdx);
        setCurrentPhase('speakingMeaning');

        const success = await speakText(line.text);
        if (!success && (!isPlayingRef.current || currentLoopId !== loopIdRef.current)) break;

        // Subtle pause between phrases
        await delay(500);
      }

      if (!isPlayingRef.current || currentLoopId !== loopIdRef.current) break;

      // Pause before moving to next word
      await delay(900);

      if (!isPlayingRef.current || currentLoopId !== loopIdRef.current) break;

      // Auto advance to next word
      if (idx + 1 < wordList.length) {
        setCurrentIndex((prev) => prev + 1);
        currentIndexRef.current = idx + 1;
      } else {
        // Loop around or finish
        setCurrentIndex(0);
        currentIndexRef.current = 0;
      }
    }
  };

  const play = () => {
    if (words.length === 0) return;
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }
    }
    setIsPlaying(true);
    loopIdRef.current++;
    startPlaybackLoop(loopIdRef.current);
  };

  const pause = () => {
    setIsPlaying(false);
    loopIdRef.current++;
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setCurrentPhase('idle');
  };

  const togglePlayPause = () => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  };

  const next = () => {
    if (words.length === 0) return;
    pause();
    setCurrentIndex((prev) => (prev + 1 < words.length ? prev + 1 : 0));
    setActiveLyricIndex(0);
  };

  const previous = () => {
    if (words.length === 0) return;
    pause();
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : words.length - 1));
    setActiveLyricIndex(0);
  };

  const replay = () => {
    pause();
    setActiveLyricIndex(0);
    setTimeout(() => {
      play();
    }, 150);
  };

  const setSpeed = (speed: number) => {
    setPlaybackSpeed(speed);
    playbackSpeedRef.current = speed;
  };

  const setVoice = (voice: SpeechSynthesisVoice) => {
    setSelectedVoice(voice);
    selectedVoiceRef.current = voice;
  };

  const toggleContentType = (type: ListeningContentType) => {
    setSelectedTypes((prev) => {
      const nextSet = new Set(prev);
      if (nextSet.has(type)) {
        if (nextSet.size > 1) {
          nextSet.delete(type);
        }
      } else {
        nextSet.add(type);
      }
      return nextSet;
    });
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      loopIdRef.current++;
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  return {
    currentWord,
    currentIndex,
    totalWords: words.length,
    isPlaying,
    currentPhase,
    activeLyricIndex,
    lyrics: currentWord ? getLyricsForWord(currentWord) : [],
    selectedTypes,
    playbackSpeed,
    voices,
    selectedVoice,
    play,
    pause,
    togglePlayPause,
    next,
    previous,
    replay,
    setSpeed,
    setVoice,
    toggleContentType,
    setCurrentIndex: (index: number) => {
      pause();
      setCurrentIndex(index);
    },
  };
}
