'use client';

import { Document, PlanType } from '@prisma/client';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import {
  Sparkles,
  MessageSquare,
  ChevronRight,
  ChevronLeft,
  Loader2,
  Trash2,
  Send,
  Bold,
  Italic,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Code,
  SquareTerminal,
  StopCircle,
} from 'lucide-react';
import React, { useState, useEffect, useRef } from 'react';

import { useAutoSave } from '@/hooks/use-autosave';
import { cn } from '@/lib/utils';

interface EditorClientProps {
  document: Document;
  userPlan: PlanType;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

/**
 * Main interactive workspace interface. Orchestrates rich-text editing,
 * auto-saving, progressive drafting streams, floating context editors,
 * and collapsible assistant panels.
 */
export function EditorClient({ document, userPlan }: EditorClientProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isChatLoading, setIsChatLoading] = useState(false);

  // Agent 1 (Drafting) states
  const [draftPrompt, setDraftPrompt] = useState('');
  const [isDrafting, setIsDrafting] = useState(false);
  const draftAbortControllerRef = useRef<AbortController | null>(null);

  // Agent 2 (Rewrite) states
  const [isRewriting, setIsRewriting] = useState(false);
  const [rewritePosition, setRewritePosition] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [selectedText, setSelectedText] = useState('');

  // ─── Auto Save Hook ──────────────────────────────────────────────────────────
  const { isSaving, lastSaved, saveError, triggerAutoSave } = useAutoSave({
    documentId: document.id,
    initialTitle: document.title,
    initialContent: document.content,
  });

  const [documentTitle, setDocumentTitle] = useState(document.title);

  // ─── Initialize Tiptap Editor ────────────────────────────────────────────────
  const editor = useEditor({
    extensions: [StarterKit],
    content: document.content,
    editorProps: {
      attributes: {
        class:
          'prose prose-invert max-w-none focus:outline-none min-h-[500px] text-neutral-200 text-sm leading-relaxed p-6 bg-neutral-900/10 rounded-xl border border-neutral-900/60 backdrop-blur-sm',
      },
    },
    onUpdate: ({ editor }) => {
      triggerAutoSave(documentTitle, editor.getHTML());
    },
  });

  // Track selection for Agent 2 Rewrite Toolbar
  useEffect(() => {
    const handleSelectionUpdate = () => {
      const { from, to } = editor.state.selection;
      if (from === to) {
        setRewritePosition(null);
        setSelectedText('');
        return;
      }

      const selected = editor.state.doc.textBetween(from, to, ' ');
      setSelectedText(selected);

      // Position toolbar above the current cursor selection
      const view = editor.view;
      const startCoords = view.coordsAtPos(from);
      const endCoords = view.coordsAtPos(to);

      // Find editor container boundaries to align floating box
      const editorElement = view.dom;
      const rect = editorElement.getBoundingClientRect();

      // Place toolbar above selection coords
      const x = (startCoords.left + endCoords.right) / 2 - rect.left;
      const y = startCoords.top - rect.top - 50; // offset above text

      setRewritePosition({ x: Math.max(10, x), y: Math.max(10, y) });
    };

    editor.on('selectionUpdate', handleSelectionUpdate);
    return () => {
      editor.off('selectionUpdate', handleSelectionUpdate);
    };
  }, [editor]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setDocumentTitle(val);
    triggerAutoSave(val, editor.getHTML());
  };

  const startDraftingStream = async () => {
    if (!draftPrompt.trim()) return;

    setIsDrafting(true);
    editor.chain().focus().run();

    const abortController = new AbortController();
    draftAbortControllerRef.current = abortController;

    try {
      const response = await fetch('/api/ai/draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: documentTitle,
          instructions: draftPrompt,
          plan: userPlan,
        }),
        signal: abortController.signal,
      });

      if (!response.ok) {
        const errorText = await response.text();
        alert(`Draft creation failed: ${errorText}`);
        setIsDrafting(false);
        return;
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('ReadableStream not supported on draft reader.');
      }

      setDraftPrompt(''); // Clear instructions form

      // Progressively inject streams directly into Tiptap active selection
      for (;;) {
        const { value, done } = await reader.read();
        if (done) {
          break;
        }

        const chunk = decoder.decode(value, { stream: true });
        editor.commands.insertContent(chunk);
      }
    } catch (err: unknown) {
      const errorObj = err as { name?: string };
      if (errorObj.name === 'AbortError') {
        console.log('[Draft Agent] Stream drafting aborted cleanly by user.');
      } else {
        console.error('[Draft Agent] Stream error:', err);
      }
    } finally {
      setIsDrafting(false);
      draftAbortControllerRef.current = null;
      // Trigger auto-save immediately to register final streamed text
      triggerAutoSave(documentTitle, editor.getHTML());
    }
  };

  const stopDraftingStream = () => {
    if (draftAbortControllerRef.current) {
      draftAbortControllerRef.current.abort();
    }
  };

  const executeSelectionRewrite = async (tone: string) => {
    if (!selectedText.trim() || isRewriting) return;

    setIsRewriting(true);

    try {
      const response = await fetch('/api/ai/rewrite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          selectedText,
          tone,
          plan: userPlan,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        alert(`Rewrite failed: ${errorText}`);
        return;
      }

      const data = await response.json();
      const rewritten = data.rewritten;

      if (rewritten) {
        // Swap selection precisely
        editor.chain().focus().deleteSelection().insertContent(rewritten).run();
      }
    } catch (err) {
      console.error('[Rewrite Agent] Error:', err);
    } finally {
      setIsRewriting(false);
      setRewritePosition(null);
      // Trigger save
      triggerAutoSave(documentTitle, editor.getHTML());
    }
  };

  const sendChatMessage = async () => {
    if (!chatInput.trim() || isChatLoading) return;

    const userMsg: ChatMessage = { role: 'user', content: chatInput };
    const updatedMessages = [...chatMessages, userMsg];
    setChatMessages(updatedMessages);
    setChatInput('');
    setIsChatLoading(true);

    // Context windows trim rules: last 20 messages & first 3000 chars of doc
    const trimmedHistory = updatedMessages.slice(-20);
    const documentContext = editor.getText().slice(0, 3000);

    // Initialise empty placeholder response for assistant
    const assistantMsgIndex = updatedMessages.length;
    setChatMessages((prev) => [...prev, { role: 'assistant', content: '' }]);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: trimmedHistory,
          documentContent: documentContext,
          plan: userPlan,
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        setChatMessages((prev) => {
          const list = [...prev];
          list[assistantMsgIndex] = {
            role: 'assistant',
            content: `Error: Failed to fetch assistant stream. ${errText}`,
          };
          return list;
        });
        setIsChatLoading(false);
        return;
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('ReadableStream not supported on assistant reader.');
      }

      let completeAssistantText = '';

      for (;;) {
        const { value, done } = await reader.read();
        if (done) {
          break;
        }

        const chunk = decoder.decode(value, { stream: true });
        completeAssistantText += chunk;

        // Progressive state updates for chat bubbles
        setChatMessages((prev) => {
          const list = [...prev];
          list[assistantMsgIndex] = {
            role: 'assistant',
            content: completeAssistantText,
          };
          return list;
        });
      }
    } catch (err) {
      console.error('[Chat Agent] Stream error:', err);
    } finally {
      setIsChatLoading(false);
    }
  };

  return (
    <div className="flex flex-1 overflow-hidden">
      {/* ── Left panel: Main Workspace Editor ── */}
      <div className="flex flex-1 flex-col overflow-y-auto p-6 md:p-8">
        <div className="mx-auto w-full max-w-4xl space-y-6">
          {/* Header controls & Save statuses */}
          <div className="flex flex-col gap-4 border-b border-neutral-900 pb-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex-1">
              <input
                type="text"
                value={documentTitle}
                onChange={handleTitleChange}
                placeholder="Untitled Document"
                className="w-full bg-transparent text-2xl font-bold text-white outline-none placeholder:text-neutral-600 focus:ring-0"
              />
            </div>

            {/* Save indicator & plan details */}
            <div className="flex items-center space-x-3 text-xs text-neutral-500">
              <span className="rounded bg-neutral-900 px-2.5 py-1 font-mono text-neutral-400 uppercase">
                Plan: {userPlan}
              </span>
              <div className="flex items-center space-x-2">
                {isSaving ? (
                  <>
                    <Loader2 className="h-3 w-3 animate-spin text-indigo-400" />
                    <span className="text-indigo-400">Saving changes...</span>
                  </>
                ) : saveError ? (
                  <span className="text-rose-400">{saveError}</span>
                ) : lastSaved ? (
                  <span>
                    Saved at{' '}
                    {lastSaved.toLocaleTimeString(undefined, {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    })}
                  </span>
                ) : (
                  <span>Ready to write</span>
                )}
              </div>
            </div>
          </div>

          {/* Agent 1 Content Draft Action block */}
          <div className="rounded-xl border border-neutral-900 bg-neutral-950/40 p-5 backdrop-blur-sm">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-white">
              <Sparkles className="h-4 w-4 animate-pulse text-indigo-400" />
              Content Draft Generator
            </h3>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="What would you like to generate? (e.g. 'A professional intro paragraph on SaaS metrics')"
                value={draftPrompt}
                onChange={(e) => setDraftPrompt(e.target.value)}
                disabled={isDrafting}
                onKeyDown={(e) => e.key === 'Enter' && startDraftingStream()}
                className="flex-1 rounded-lg border border-neutral-900 bg-neutral-900/40 px-4 py-2.5 text-sm text-white placeholder:text-neutral-500 focus:border-indigo-500 focus:outline-none"
              />
              {isDrafting ? (
                <button
                  onClick={stopDraftingStream}
                  className="flex items-center gap-2 rounded-lg bg-rose-600 px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-rose-500"
                >
                  <StopCircle className="h-4 w-4" /> Stop
                </button>
              ) : (
                <button
                  onClick={startDraftingStream}
                  disabled={!draftPrompt.trim()}
                  className="flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-indigo-500 disabled:opacity-50"
                >
                  Generate
                </button>
              )}
            </div>
          </div>

          {/* Formatting Controls bar */}
          <div className="flex flex-wrap gap-1 rounded-lg border border-neutral-900 bg-neutral-950/60 p-2 backdrop-blur-sm">
            <button
              onClick={() => editor.chain().focus().toggleBold().run()}
              className={cn(
                'rounded p-1.5 text-neutral-400 hover:bg-neutral-900 hover:text-white',
                editor.isActive('bold') && 'bg-indigo-600/10 text-indigo-400'
              )}
              title="Bold"
            >
              <Bold className="h-4 w-4" />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className={cn(
                'rounded p-1.5 text-neutral-400 hover:bg-neutral-900 hover:text-white',
                editor.isActive('italic') && 'bg-indigo-600/10 text-indigo-400'
              )}
              title="Italic"
            >
              <Italic className="h-4 w-4" />
            </button>
            <div className="mx-1 h-6 w-[1px] self-center bg-neutral-900" />
            <button
              onClick={() =>
                editor.chain().focus().toggleHeading({ level: 1 }).run()
              }
              className={cn(
                'rounded p-1.5 text-neutral-400 hover:bg-neutral-900 hover:text-white',
                editor.isActive('heading', { level: 1 }) &&
                  'bg-indigo-600/10 text-indigo-400'
              )}
              title="Heading 1"
            >
              <Heading1 className="h-4 w-4" />
            </button>
            <button
              onClick={() =>
                editor.chain().focus().toggleHeading({ level: 2 }).run()
              }
              className={cn(
                'rounded p-1.5 text-neutral-400 hover:bg-neutral-900 hover:text-white',
                editor.isActive('heading', { level: 2 }) &&
                  'bg-indigo-600/10 text-indigo-400'
              )}
              title="Heading 2"
            >
              <Heading2 className="h-4 w-4" />
            </button>
            <div className="mx-1 h-6 w-[1px] self-center bg-neutral-900" />
            <button
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              className={cn(
                'rounded p-1.5 text-neutral-400 hover:bg-neutral-900 hover:text-white',
                editor.isActive('bulletList') &&
                  'bg-indigo-600/10 text-indigo-400'
              )}
              title="Bullet List"
            >
              <List className="h-4 w-4" />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              className={cn(
                'rounded p-1.5 text-neutral-400 hover:bg-neutral-900 hover:text-white',
                editor.isActive('orderedList') &&
                  'bg-indigo-600/10 text-indigo-400'
              )}
              title="Ordered List"
            >
              <ListOrdered className="h-4 w-4" />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleCodeBlock().run()}
              className={cn(
                'rounded p-1.5 text-neutral-400 hover:bg-neutral-900 hover:text-white',
                editor.isActive('codeBlock') &&
                  'bg-indigo-600/10 text-indigo-400'
              )}
              title="Code Block"
            >
              <Code className="h-4 w-4" />
            </button>
          </div>

          {/* Tiptap editor canvas container */}
          <div className="relative">
            <EditorContent editor={editor} />

            {/* Agent 2 Floating Selection Toolbar */}
            {!!rewritePosition && (
              <div
                style={{
                  position: 'absolute',
                  left: `${rewritePosition.x}px`,
                  top: `${rewritePosition.y}px`,
                }}
                className="animate-fade-in z-30 flex items-center space-x-1.5 rounded-lg border border-neutral-800 bg-neutral-950 p-1.5 shadow-2xl backdrop-blur-md"
              >
                {isRewriting ? (
                  <div className="flex items-center space-x-2 px-3 py-1 text-xs text-indigo-400">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    <span>Rewriting selection...</span>
                  </div>
                ) : (
                  <>
                    <span className="px-2 text-[10px] font-bold tracking-wider text-neutral-500 uppercase">
                      Tone:
                    </span>
                    <button
                      onClick={() => executeSelectionRewrite('Professional')}
                      className="rounded px-2.5 py-1 text-xs text-neutral-300 hover:bg-neutral-900 hover:text-white"
                    >
                      Professional
                    </button>
                    <button
                      onClick={() => executeSelectionRewrite('Persuasive')}
                      className="rounded px-2.5 py-1 text-xs text-neutral-300 hover:bg-neutral-900 hover:text-white"
                    >
                      Persuasive
                    </button>
                    <button
                      onClick={() => executeSelectionRewrite('Casual')}
                      className="rounded px-2.5 py-1 text-xs text-neutral-300 hover:bg-neutral-900 hover:text-white"
                    >
                      Casual
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Right panel: Collapsible Chat Assistant (Agent 3) ── */}
      <div
        className={cn(
          'relative flex h-full flex-col border-l border-neutral-900 bg-neutral-950/80 backdrop-blur-md transition-all duration-300 ease-in-out',
          isSidebarOpen ? 'w-80 md:w-96' : 'w-0 overflow-hidden border-l-0'
        )}
      >
        <div className="flex h-full flex-col p-5">
          {/* Header */}
          <div className="mb-4 flex items-center justify-between border-b border-neutral-900 pb-3">
            <h3 className="flex items-center gap-2 font-semibold text-white">
              <MessageSquare className="h-4 w-4 text-indigo-400" />
              Chat Assistant
            </h3>
            <button
              onClick={() => setChatMessages([])}
              disabled={chatMessages.length === 0}
              className="rounded p-1 text-neutral-500 transition-colors hover:bg-neutral-900 hover:text-rose-400 disabled:opacity-30"
              title="Clear Chat History"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>

          {/* Messages Grid */}
          <div className="flex-1 space-y-4 overflow-y-auto pr-1 text-xs leading-relaxed">
            {chatMessages.length === 0 && (
              <div className="flex h-full flex-col items-center justify-center space-y-2 text-center text-neutral-600">
                <SquareTerminal className="h-8 w-8 text-indigo-500 opacity-40" />
                <p>Have questions about your document?</p>
                <p className="max-w-[200px] text-[10px]">
                  Ask questions, outline structures, or improve phrasing right
                  here.
                </p>
              </div>
            )}

            {chatMessages.map((msg, index) => (
              <div
                key={index}
                className={cn(
                  'max-w-[85%] rounded-xl border p-4.5',
                  msg.role === 'user'
                    ? 'ml-auto border-indigo-500/20 bg-indigo-600/10 text-neutral-200'
                    : 'border-neutral-900/60 bg-neutral-900/40 text-neutral-300'
                )}
              >
                <p className="mb-1 text-[9px] font-bold tracking-wider text-neutral-500 uppercase">
                  {msg.role === 'user' ? 'You' : 'Assistant'}
                </p>
                <div className="whitespace-pre-wrap">{msg.content}</div>
              </div>
            ))}
            {isChatLoading &&
              chatMessages[chatMessages.length - 1]?.content === '' && (
                <div className="flex items-center space-x-2 p-2 text-neutral-500">
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-indigo-500" />
                  <span>Thinking...</span>
                </div>
              )}
          </div>

          {/* Chat dispatch bar */}
          <div className="mt-4 flex gap-2">
            <input
              type="text"
              placeholder="Ask anything..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              disabled={isChatLoading}
              onKeyDown={(e) => e.key === 'Enter' && sendChatMessage()}
              className="flex-1 rounded-lg border border-neutral-900 bg-neutral-900/40 px-3 py-2 text-xs text-white placeholder:text-neutral-500 focus:border-indigo-500 focus:outline-none"
            />
            <button
              onClick={sendChatMessage}
              disabled={!chatInput.trim() || isChatLoading}
              className="rounded-lg bg-indigo-600 p-2 text-white transition-colors hover:bg-indigo-500 disabled:opacity-40"
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Drawer Toggle button ── */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="absolute right-6 bottom-6 z-40 flex h-10 w-10 items-center justify-center rounded-full border border-neutral-800 bg-neutral-950 text-indigo-400 shadow-2xl backdrop-blur-md transition-colors hover:bg-neutral-900 hover:text-white"
        title={isSidebarOpen ? 'Hide Assistant' : 'Show Assistant'}
      >
        {isSidebarOpen ? (
          <ChevronRight className="h-4 w-4" />
        ) : (
          <ChevronLeft className="h-4 w-4" />
        )}
      </button>
    </div>
  );
}
