'use client';

import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  List,
  ListOrdered,
  Quote,
  Heading1,
  Heading2,
  AlignLeft,
  AlignCenter,
  AlignRight,
  RotateCcw,
  RotateCw,
} from 'lucide-react';

interface DocsToolbarProps {
  onCommand: (command: string, value?: string) => void;
  showListOptions?: boolean;
  showHeadings?: boolean;
}

export function DocsToolbar({
  onCommand,
  showListOptions = true,
  showHeadings = true,
}: DocsToolbarProps) {
  return (
    <div className="flex items-center flex-wrap gap-1 p-2 rounded-2xl glass-card border border-border/80 shadow-md">
      {/* History */}
      <button
        type="button"
        onClick={() => onCommand('undo')}
        className="p-2 rounded-xl text-muted hover:text-foreground hover:bg-white/[0.08] transition-colors cursor-pointer"
        title="Undo (Ctrl+Z)"
      >
        <RotateCcw className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => onCommand('redo')}
        className="p-2 rounded-xl text-muted hover:text-foreground hover:bg-white/[0.08] transition-colors cursor-pointer"
        title="Redo (Ctrl+Y)"
      >
        <RotateCw className="w-4 h-4" />
      </button>

      <div className="h-5 w-px bg-border/60 mx-1" />

      {/* Headings */}
      {showHeadings && (
        <>
          <button
            type="button"
            onClick={() => onCommand('formatBlock', '<h1>')}
            className="p-2 rounded-xl text-muted hover:text-foreground hover:bg-white/[0.08] transition-colors cursor-pointer"
            title="Heading 1"
          >
            <Heading1 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => onCommand('formatBlock', '<h2>')}
            className="p-2 rounded-xl text-muted hover:text-foreground hover:bg-white/[0.08] transition-colors cursor-pointer"
            title="Heading 2"
          >
            <Heading2 className="w-4 h-4" />
          </button>
          <div className="h-5 w-px bg-border/60 mx-1" />
        </>
      )}

      {/* Text Styles */}
      <button
        type="button"
        onClick={() => onCommand('bold')}
        className="p-2 rounded-xl text-muted hover:text-foreground hover:bg-white/[0.08] transition-colors cursor-pointer font-bold"
        title="Bold (Ctrl+B)"
      >
        <Bold className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => onCommand('italic')}
        className="p-2 rounded-xl text-muted hover:text-foreground hover:bg-white/[0.08] transition-colors cursor-pointer"
        title="Italic (Ctrl+I)"
      >
        <Italic className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => onCommand('underline')}
        className="p-2 rounded-xl text-muted hover:text-foreground hover:bg-white/[0.08] transition-colors cursor-pointer"
        title="Underline (Ctrl+U)"
      >
        <Underline className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => onCommand('strikeThrough')}
        className="p-2 rounded-xl text-muted hover:text-foreground hover:bg-white/[0.08] transition-colors cursor-pointer"
        title="Strikethrough"
      >
        <Strikethrough className="w-4 h-4" />
      </button>

      <div className="h-5 w-px bg-border/60 mx-1" />

      {/* Lists & Quotes */}
      {showListOptions && (
        <>
          <button
            type="button"
            onClick={() => onCommand('insertUnorderedList')}
            className="p-2 rounded-xl text-muted hover:text-foreground hover:bg-white/[0.08] transition-colors cursor-pointer"
            title="Bullet List"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => onCommand('insertOrderedList')}
            className="p-2 rounded-xl text-muted hover:text-foreground hover:bg-white/[0.08] transition-colors cursor-pointer"
            title="Numbered List"
          >
            <ListOrdered className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => onCommand('formatBlock', '<blockquote>')}
            className="p-2 rounded-xl text-muted hover:text-foreground hover:bg-white/[0.08] transition-colors cursor-pointer"
            title="Quote Block"
          >
            <Quote className="w-4 h-4" />
          </button>
          <div className="h-5 w-px bg-border/60 mx-1" />
        </>
      )}

      {/* Alignments */}
      <button
        type="button"
        onClick={() => onCommand('justifyLeft')}
        className="p-2 rounded-xl text-muted hover:text-foreground hover:bg-white/[0.08] transition-colors cursor-pointer"
        title="Align Left"
      >
        <AlignLeft className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => onCommand('justifyCenter')}
        className="p-2 rounded-xl text-muted hover:text-foreground hover:bg-white/[0.08] transition-colors cursor-pointer"
        title="Align Center"
      >
        <AlignCenter className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => onCommand('justifyRight')}
        className="p-2 rounded-xl text-muted hover:text-foreground hover:bg-white/[0.08] transition-colors cursor-pointer"
        title="Align Right"
      >
        <AlignRight className="w-4 h-4" />
      </button>
    </div>
  );
}
