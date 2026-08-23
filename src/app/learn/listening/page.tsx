'use client';

import React, { useState, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ArrowLeft,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  Volume2,
  Filter,
  Sparkles,
  Gauge,
} from 'lucide-react';
import { useWordsData, type WordData } from '@/hooks/useWordsData';
import { useListeningPlayer, type ListeningContentType } from '@/hooks/useListeningPlayer';
import { ListeningSetupModal } from '@/components/learn/ListeningSetupModal';

function ListeningContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { words: allWords, isLoading: isWordsLoading } = useWordsData();

  const filterParam = searchParams.get('filter') || 'all';
  const [isSetupModalOpen, setIsSetupModalOpen] = useState(false);
  const [showVoiceMenu, setShowVoiceMenu] = useState(false);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);

  // Filter playlist words
  const playlistWords = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);

    if (filterParam === 'today') {
      return allWords.filter((w) => {
        if (!w.created_at) return false;
        const d = new Date(w.created_at);
        return (
          d.getFullYear() === today.getFullYear() &&
          d.getMonth() === today.getMonth() &&
          d.getDate() === today.getDate()
        );
      });
    }

    if (filterParam === 'yesterday') {
      return allWords.filter((w) => {
        if (!w.created_at) return false;
        const d = new Date(w.created_at);
        return (
          d.getFullYear() === yesterday.getFullYear() &&
          d.getMonth() === yesterday.getMonth() &&
          d.getDate() === yesterday.getDate()
        );
      });
    }

    if (filterParam !== 'all' && filterParam.includes('T')) {
      const selectedDate = new Date(filterParam);
      return allWords.filter((w) => {
        if (!w.created_at) return false;
        const d = new Date(w.created_at);
        return (
          d.getFullYear() === selectedDate.getFullYear() &&
          d.getMonth() === selectedDate.getMonth() &&
          d.getDate() === selectedDate.getDate()
        );
      });
    }

    return allWords;
  }, [allWords, filterParam]);

  const player = useListeningPlayer(playlistWords);

  const filterLabel = useMemo(() => {
    if (filterParam === 'today') return 'Today';
    if (filterParam === 'yesterday') return 'Yesterday';
    if (filterParam !== 'all' && filterParam.includes('T')) {
      return new Date(filterParam).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
    }
    return 'All Words';
  }, [filterParam]);

  if (isWordsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (playlistWords.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background text-center">
        <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center mb-4">
          <Sparkles className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">No Words in Playlist</h2>
        <p className="text-sm text-foreground-variant max-w-sm mb-6">
          No words found matching the selected timeframe.
        </p>
        <button
          onClick={() => setIsSetupModalOpen(true)}
          className="px-6 py-3 rounded-2xl bg-emerald-600 text-white font-bold text-sm shadow-lg shadow-emerald-600/20 hover:scale-105 transition-all"
        >
          Change Filter
        </button>
      </div>
    );
  }

  const contentTypes: { id: ListeningContentType; label: string }[] = [
    { id: 'simple', label: 'Simple' },
    { id: 'advanced', label: 'Advanced' },
    { id: 'synonyms', label: 'Synonyms' },
    { id: 'antonyms', label: 'Antonyms' },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between">
      {/* Top Header */}
      <div>
        <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => {
              player.pause();
              router.push('/learn');
            }}
            className="w-10 h-10 rounded-full bg-surface/50 border border-border flex items-center justify-center text-muted hover:text-foreground transition-all shadow-[0_4px_20px_rgba(0,0,0,0.3)] backdrop-blur-md cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="text-center">
            <h2 className="text-sm font-bold text-foreground">Listening Mode</h2>
          </div>

          {/* Filter Pill */}
          <button
            onClick={() => setIsSetupModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-surface/50 border border-border hover:border-emerald-500/40 text-xs font-semibold text-foreground transition-all shadow-sm cursor-pointer"
          >
            <Filter className="w-3.5 h-3.5 text-emerald-400" />
            <span>{filterLabel}</span>
          </button>
        </div>

        {/* Content Type Filter Chips */}
        <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 py-2 flex items-center justify-center gap-2 overflow-x-auto">
          {contentTypes.map((type) => {
            const isSelected = player.selectedTypes.has(type.id);
            return (
              <button
                key={type.id}
                onClick={() => player.toggleContentType(type.id)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20 scale-105'
                    : 'bg-surface border border-border/50 text-muted hover:text-foreground'
                }`}
              >
                {type.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Single Box Center Stage */}
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 flex flex-col items-center justify-center flex-1">
        {player.currentWord && (
          <div className="w-full max-w-4xl bg-surface border border-border/80 rounded-3xl p-8 sm:p-10 shadow-2xl flex flex-col items-center text-center space-y-6">
            {/* Animated Sound Waves */}
            <div className="flex items-center justify-center gap-1.5 h-6">
              {[1, 2, 3, 4, 5, 6, 7].map((bar) => (
                <div
                  key={bar}
                  className={`w-1.5 rounded-full bg-emerald-500 transition-all duration-300 ${
                    player.isPlaying ? 'animate-pulse' : 'h-1.5 opacity-30'
                  }`}
                  style={{
                    height: player.isPlaying ? `${Math.max(8, (bar * 7) % 28)}px` : '4px',
                    animationDelay: `${bar * 120}ms`,
                  }}
                />
              ))}
            </div>

            {/* Word Header */}
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                Word {player.currentIndex + 1} of {player.totalWords}
              </span>
              <h1 className="text-4xl sm:text-5xl font-extrabold text-foreground tracking-tight mt-1">
                {player.currentWord.word}
              </h1>
              {player.currentWord.ipa && (
                <span className="text-base font-mono text-muted mt-1 block">
                  /{player.currentWord.ipa}/
                </span>
              )}
            </div>

            <div className="w-full h-px bg-border/50 max-w-lg my-2" />

            {/* 3-Row Scrolling Lyrics Window */}
            {(() => {
              const lyrics = player.lyrics;
              const activeIdx = Math.max(0, player.activeLyricIndex);
              const prevLine = activeIdx > 0 && lyrics.length > 1 ? lyrics[activeIdx - 1] : null;
              const currLine = lyrics.length > 0 ? lyrics[activeIdx] : null;
              const nextLine = activeIdx < lyrics.length - 1 ? lyrics[activeIdx + 1] : null;

              return (
                <div className="w-full max-w-2xl mx-auto flex flex-col justify-center items-center h-[210px] overflow-hidden select-none">
                  {/* Upper Dimmed Line */}
                  <div className="h-[56px] flex items-center justify-center text-center opacity-30 text-muted transition-all duration-300 transform scale-95 px-4">
                    {prevLine ? (
                      <p className="text-sm sm:text-base font-medium truncate max-w-xl">
                        <span className="text-xs uppercase font-bold text-muted mr-2">
                          {prevLine.label}:
                        </span>
                        {prevLine.text}
                      </p>
                    ) : (
                      <div className="h-4" />
                    )}
                  </div>

                  {/* Middle Playing Line (Active) */}
                  <div className="min-h-[78px] w-full flex items-center justify-center text-center transition-all duration-300 px-6 py-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 shadow-md shadow-emerald-500/5">
                    {currLine ? (
                      <div className="max-w-xl">
                        <span className="text-[11px] font-bold uppercase tracking-wider block text-emerald-400 mb-0.5">
                          {currLine.label}
                        </span>
                        <p className="text-base sm:text-xl font-bold text-foreground leading-snug line-clamp-2">
                          {currLine.text}
                        </p>
                      </div>
                    ) : (
                      <span className="text-sm font-semibold text-emerald-400">Pronouncing word...</span>
                    )}
                  </div>

                  {/* Lower Dimmed Line */}
                  <div className="h-[56px] flex items-center justify-center text-center opacity-30 text-muted transition-all duration-300 transform scale-95 px-4">
                    {nextLine ? (
                      <p className="text-sm sm:text-base font-medium truncate max-w-xl">
                        <span className="text-xs uppercase font-bold text-muted mr-2">
                          {nextLine.label}:
                        </span>
                        {nextLine.text}
                      </p>
                    ) : (
                      <div className="h-4" />
                    )}
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </div>

      {/* Bottom Player Controls */}
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 pb-8 pt-4">
        {/* Controls Bar */}
        <div className="p-4 rounded-3xl bg-surface border border-border shadow-2xl flex items-center justify-between">
          {/* Replay */}
          <button
            onClick={player.replay}
            className="w-10 h-10 rounded-full bg-surface-hover border border-border/60 hover:bg-surface-hover/80 flex items-center justify-center text-muted hover:text-foreground transition-colors cursor-pointer"
            title="Replay word"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Previous */}
          <button
            onClick={player.previous}
            className="w-11 h-11 rounded-full bg-surface-hover border border-border/60 hover:bg-surface-hover/80 flex items-center justify-center text-muted hover:text-foreground transition-colors cursor-pointer"
            title="Previous word"
          >
            <SkipBack className="w-5 h-5" />
          </button>

          {/* Play / Pause Primary Button */}
          <button
            onClick={player.togglePlayPause}
            className="w-16 h-16 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 text-white flex items-center justify-center shadow-xl shadow-emerald-500/30 hover:scale-105 active:scale-95 transition-all cursor-pointer"
            title={player.isPlaying ? 'Pause' : 'Play'}
          >
            {player.isPlaying ? (
              <Pause className="w-7 h-7 fill-white" />
            ) : (
              <Play className="w-7 h-7 fill-white translate-x-0.5" />
            )}
          </button>

          {/* Next */}
          <button
            onClick={player.next}
            className="w-11 h-11 rounded-full bg-surface-hover border border-border/60 hover:bg-surface-hover/80 flex items-center justify-center text-muted hover:text-foreground transition-colors cursor-pointer"
            title="Next word"
          >
            <SkipForward className="w-5 h-5" />
          </button>

          {/* Speed Selector */}
          <div className="relative">
            <button
              onClick={() => setShowSpeedMenu(!showSpeedMenu)}
              className="px-3 py-1.5 rounded-xl bg-surface-hover border border-border/60 hover:bg-surface-hover/80 text-xs font-bold text-foreground transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Gauge className="w-3.5 h-3.5 text-emerald-500" />
              <span>{player.playbackSpeed}x</span>
            </button>

            {showSpeedMenu && (
              <div className="absolute bottom-12 right-0 bg-surface border border-border rounded-2xl p-2 shadow-2xl z-50 flex flex-col gap-1 min-w-[90px]">
                {[0.75, 1.0, 1.25, 1.5, 2.0].map((s) => (
                  <button
                    key={s}
                    onClick={() => {
                      player.setSpeed(s);
                      setShowSpeedMenu(false);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold text-left transition-colors cursor-pointer ${
                      player.playbackSpeed === s
                        ? 'bg-emerald-500 text-white'
                        : 'text-foreground hover:bg-surface-hover'
                    }`}
                  >
                    {s}x
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Playlist Setup Modal */}
      <ListeningSetupModal
        isOpen={isSetupModalOpen}
        onClose={() => setIsSetupModalOpen(false)}
        allWords={allWords}
      />
    </div>
  );
}

export default function ListeningPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        </div>
      }
    >
      <ListeningContent />
    </Suspense>
  );
}
