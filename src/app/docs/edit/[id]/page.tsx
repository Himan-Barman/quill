'use client';

import { Suspense, useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { use } from 'react';
import { ArrowLeft, Save, Loader2, Plus, Trash2, Quote, GitFork, FileText } from 'lucide-react';
import { useDocsData, type DocType } from '@/hooks/useDocsData';
import { DocsToolbar } from '@/components/docs/DocsToolbar';
import { useToast } from '@/contexts/ToastContext';

function EditDocContent({ id }: { id: string }) {
  const router = useRouter();
  const { documents, isLoading, updateDocument } = useDocsData();

  const existingDoc = useMemo(() => documents.find(d => d.id === id), [documents, id]);

  const [title, setTitle] = useState('');
  const [docType, setDocType] = useState<DocType>('document');
  const [isSaving, setIsSaving] = useState(false);
  const { error, success } = useToast();

  // Snippet content
  const [snippetContent, setSnippetContent] = useState('');

  // Thread thoughts
  const [threadThoughts, setThreadThoughts] = useState<string[]>(['']);

  // Comprehensive Document HTML / Markdown
  const [docContent, setDocContent] = useState('');
  const [initializedContent, setInitializedContent] = useState(false);

  useEffect(() => {
    if (existingDoc) {
      setTitle(existingDoc.title || '');
      setDocType(existingDoc.doc_type || 'document');

      if (existingDoc.doc_type === 'snippet') {
        setSnippetContent(existingDoc.content_markdown || existingDoc.previewText || '');
      } else if (existingDoc.doc_type === 'thread') {
        if (existingDoc.content_json) {
          try {
            const parsed =
              typeof existingDoc.content_json === 'string'
                ? JSON.parse(existingDoc.content_json)
                : existingDoc.content_json;
            if (Array.isArray(parsed) && parsed.length > 0) {
              setThreadThoughts(
                parsed.map((item: any) => {
                  if (typeof item === 'string') return item;
                  if (Array.isArray(item)) return item.map((op: any) => op.insert || '').join('');
                  if (item && item.ops && Array.isArray(item.ops)) {
                    return item.ops.map((op: any) => op.insert || '').join('');
                  }
                  return JSON.stringify(item);
                })
              );
            }
          } catch {}
        } else if (existingDoc.content_markdown) {
          setThreadThoughts(existingDoc.content_markdown.split('\n\n---\n\n').filter(Boolean));
        }
      } else {
        const rawContent = existingDoc.content_markdown || existingDoc.previewText || '';
        setDocContent(rawContent);
      }
    }
  }, [existingDoc]);

  useEffect(() => {
    if (existingDoc && existingDoc.doc_type === 'document' && !initializedContent) {
      const editorElement = document.getElementById('comprehensive-editor');
      if (editorElement) {
        editorElement.innerHTML = existingDoc.content_markdown || existingDoc.previewText || '';
        setInitializedContent(true);
      }
    }
  }, [existingDoc, initializedContent]);

  const handleCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
  };

  const handleAddThought = () => {
    setThreadThoughts(prev => [...prev, '']);
  };

  const handleUpdateThought = (index: number, val: string) => {
    setThreadThoughts(prev => {
      const copy = [...prev];
      copy[index] = val;
      return copy;
    });
  };

  const handleRemoveThought = (index: number) => {
    if (threadThoughts.length <= 1) return;
    setThreadThoughts(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    let finalTitle = title.trim();
    let finalMarkdown = '';
    let finalJson: any = null;

    if (docType === 'snippet') {
      if (!snippetContent.trim()) {
        error('Please enter your snippet or quotation.');
        return;
      }
      finalTitle = snippetContent.trim().split('\n')[0].slice(0, 40) || 'Snippet';
      finalMarkdown = snippetContent.trim();
    } else if (docType === 'thread') {
      const validThoughts = threadThoughts.map(t => t.trim()).filter(Boolean);
      if (!finalTitle) {
        error('Please enter a thread title.');
        return;
      }
      if (validThoughts.length === 0) {
        error('Please write at least one thought in your thread.');
        return;
      }
      finalMarkdown = validThoughts.join('\n\n---\n\n');
      finalJson = validThoughts;
    } else {
      const editorElement = document.getElementById('comprehensive-editor');
      const html = editorElement ? editorElement.innerHTML : docContent;
      const text = editorElement ? editorElement.innerText : '';

      if (!finalTitle) {
        error('Please enter a document title.');
        return;
      }
      if (!text.trim()) {
        error('Please write some content in your document.');
        return;
      }
      finalMarkdown = html;
      finalJson = { html, text };
    }

    setIsSaving(true);
    const result = await updateDocument(id, {
      title: finalTitle,
      content_markdown: finalMarkdown,
      content_json: finalJson,
    });
    setIsSaving(false);

    if (result.success) {
      success('Document updated successfully!');
      router.push(`/docs/${id}`);
    } else {
      error(result.error || 'Failed to update document');
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full pt-20">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-4" />
      </div>
    );
  }

  if (!existingDoc) {
    return (
      <div className="flex flex-col items-center justify-center h-full pt-20 text-center">
        <p className="text-muted text-lg mb-4">Document not found.</p>
        <button
          onClick={() => router.push('/docs')}
          className="px-6 py-2 bg-surface border border-border rounded-xl text-foreground hover:bg-surface-active transition-colors cursor-pointer"
        >
          Go Back to Docs
        </button>
      </div>
    );
  }

  const getTypeHeader = () => {
    switch (docType) {
      case 'snippet':
        return { label: 'Quick Snippet', icon: Quote, color: 'text-blue-400' };
      case 'thread':
        return { label: 'Thought Thread', icon: GitFork, color: 'text-purple-400' };
      default:
        return { label: 'Comprehensive Document', icon: FileText, color: 'text-amber-400' };
    }
  };

  const headerInfo = getTypeHeader();
  const HeaderIcon = headerInfo.icon;

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto h-full flex flex-col relative pb-24 w-full select-none">
      
      {/* Top Header Bar */}
      <div className="flex items-center justify-between pb-6 mb-4 border-b border-border/60">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2.5 rounded-2xl glass-card hover:border-border-hover transition-colors text-muted hover:text-foreground cursor-pointer flex items-center gap-2"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
            <span className="text-sm font-semibold pr-1">Back</span>
          </button>
          <div className="flex items-center gap-2 pl-2">
            <HeaderIcon className={`w-5 h-5 ${headerInfo.color}`} />
            <h1 className="text-xl font-bold text-foreground">
              Edit {headerInfo.label}
            </h1>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2.5 px-6 rounded-xl shadow-[0_4px_14px_rgba(59,130,246,0.4)] transition-all cursor-pointer disabled:opacity-50"
        >
          {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          <span>Save Changes</span>
        </button>
      </div>

      {/* Editor Content Area */}
      <div className="flex-1 overflow-y-auto min-h-0 pt-2">
        <div className="w-full space-y-6">

          {/* Quick Snippet Editor */}
          {docType === 'snippet' && (
            <div className="space-y-4">
              <div className="glass-card rounded-3xl p-6 md:p-8 relative border border-border min-h-[300px]">
                <textarea
                  value={snippetContent}
                  onChange={e => setSnippetContent(e.target.value)}
                  placeholder="Type or paste your quote, snippet, or thought here..."
                  rows={10}
                  className="w-full bg-transparent text-foreground placeholder-muted/50 outline-none resize-none text-xl font-serif italic leading-relaxed"
                />
              </div>
            </div>
          )}

          {/* Thought Thread Editor */}
          {docType === 'thread' && (
            <div className="space-y-6">
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Thread Title *"
                className="w-full bg-surface/40 border border-border rounded-2xl px-5 py-3.5 text-foreground placeholder-muted/50 focus:border-purple-500 outline-none transition-all text-xl font-bold"
              />

              <div className="space-y-4">
                {threadThoughts.map((thought, idx) => {
                  const isLast = idx === threadThoughts.length - 1;
                  return (
                    <div key={idx} className="flex items-start gap-4">
                      {/* Node & Connector */}
                      <div className="flex flex-col items-center shrink-0 self-stretch pt-2">
                        <div className="w-7 h-7 rounded-full bg-purple-500/20 border-2 border-purple-400 flex items-center justify-center text-[11px] font-bold text-purple-300">
                          {idx + 1}
                        </div>
                        {!isLast && <div className="w-0.5 flex-1 bg-border/60 my-2" />}
                      </div>

                      {/* Thought Card */}
                      <div className="flex-1 glass-card rounded-2xl p-4 border border-border relative group">
                        <textarea
                          value={thought}
                          onChange={e => handleUpdateThought(idx, e.target.value)}
                          placeholder="Write a connected thought..."
                          rows={3}
                          className="w-full bg-transparent text-foreground placeholder-muted/50 outline-none resize-none text-base leading-relaxed"
                        />
                        {threadThoughts.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveThought(idx)}
                            className="absolute top-3 right-3 p-1.5 rounded-lg text-muted hover:text-rose-400 hover:bg-rose-500/10 opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                            title="Remove thought"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={handleAddThought}
                className="flex items-center gap-2 px-5 py-3 rounded-2xl glass-card hover:border-purple-500/40 text-purple-400 font-semibold text-sm transition-all cursor-pointer ml-11"
              >
                <Plus className="w-4 h-4" />
                <span>Add another thought</span>
              </button>
            </div>
          )}

          {/* Comprehensive Document Editor */}
          {docType === 'document' && (
            <div className="space-y-4">
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Document Title *"
                className="w-full bg-surface/40 border border-border rounded-2xl px-5 py-3.5 text-foreground placeholder-muted/50 focus:border-amber-500 outline-none transition-all text-2xl font-extrabold"
              />

              {/* Formatting Toolbar */}
              <DocsToolbar onCommand={handleCommand} />

              {/* Editable Document Canvas */}
              <div className="glass-card rounded-3xl p-6 md:p-8 min-h-[400px] border border-border focus-within:border-amber-500/40 transition-colors">
                <div
                  id="comprehensive-editor"
                  contentEditable
                  onInput={e => setDocContent((e.target as HTMLElement).innerHTML)}
                  className="outline-none min-h-[350px] text-foreground leading-relaxed text-base prose prose-invert max-w-none"
                  data-placeholder="Start writing your long-form document here..."
                />
              </div>
            </div>
          )}

        </div>
      </div>

    </div>
  );
}

export default function EditDocPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center h-full pt-20">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-4" />
        </div>
      }
    >
      <EditDocContent id={id} />
    </Suspense>
  );
}
