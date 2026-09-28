import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  RotateCcw,
  Maximize2,
  Minimize2,
  Workflow,
  Radio,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Bot,
  User,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { useApp } from '../context/AppContext.js';

export const N8nChatWidget: React.FC = () => {
  const {
    n8nMessages,
    sendN8nMessage,
    isN8nLoading,
    clearN8nChat,
    isN8nWidgetOpen,
    setIsN8nWidgetOpen,
    setActiveTab,
    n8nWebhookUrl,
    n8nStatus,
    checkN8nStatus,
    addToast,
  } = useApp();

  const [input, setInput] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when messages update
  useEffect(() => {
    if (isN8nWidgetOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [n8nMessages, isN8nWidgetOpen, isN8nLoading]);

  // Focus input when opened
  useEffect(() => {
    if (isN8nWidgetOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
      if (!n8nStatus) {
        checkN8nStatus();
      }
    }
  }, [isN8nWidgetOpen]);

  // Gentle audio chime on incoming assistant reply
  const prevMsgCountRef = useRef(n8nMessages.length);
  useEffect(() => {
    if (n8nMessages.length > prevMsgCountRef.current) {
      const lastMsg = n8nMessages[n8nMessages.length - 1];
      if (lastMsg.role === 'assistant' && soundEnabled) {
        try {
          const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
          osc.frequency.exponentialRampToValueAtTime(659.25, ctx.currentTime + 0.15); // E5
          gain.gain.setValueAtTime(0.08, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.35);
        } catch (e) {}
      }
    }
    prevMsgCountRef.current = n8nMessages.length;
  }, [n8nMessages.length, soundEnabled]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isN8nLoading) return;
    const textToSend = input.trim();
    setInput('');
    await sendN8nMessage(textToSend);
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    addToast('Copied to clipboard', 'info');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const quickPrompts = [
    'What workflow actions can you perform?',
    'Summarize my active tasks for today',
    'Help me prepare a focused study sprint',
    'How is this n8n webhook configured?',
  ];

  return (
    <>
      {/* Floating Launcher Button */}
      <div className="fixed bottom-6 right-6 z-40 flex items-center gap-3">
        {!isN8nWidgetOpen && (
          <button
            onClick={() => setIsN8nWidgetOpen(true)}
            className="group relative flex items-center gap-3 px-4 py-3 rounded-2xl bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 text-white shadow-2xl shadow-indigo-600/40 hover:shadow-cyan-500/50 transition-all duration-300 transform hover:scale-[1.03] cursor-pointer border border-white/20"
          >
            <div className="relative flex items-center justify-center">
              <Workflow className="w-5 h-5 text-white animate-pulse" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-[#080B16]" />
            </div>

            <div className="text-left hidden sm:block">
              <div className="text-xs font-bold tracking-wide flex items-center gap-1.5">
                <span>n8n Chatbot</span>
                <span className="px-1.5 py-0.2 rounded-full bg-black/30 text-[9px] text-cyan-300 font-mono">
                  LIVE
                </span>
              </div>
              <div className="text-[10px] text-slate-200 opacity-90 truncate max-w-[140px]">
                Ask workflow agent
              </div>
            </div>

            {/* Ambient halo effect */}
            <div className="absolute inset-0 rounded-2xl bg-cyan-400/20 blur-md -z-10 group-hover:opacity-100 opacity-0 transition-opacity" />
          </button>
        )}
      </div>

      {/* Floating Chat Modal / Drawer */}
      {isN8nWidgetOpen && (
        <div className="fixed bottom-6 right-4 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-[420px] h-[580px] max-h-[85vh] rounded-3xl glass-panel-elevated border border-white/15 shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
          {/* Header */}
          <div className="px-4 py-3.5 border-b border-white/[0.08] bg-gradient-to-r from-slate-900/90 via-indigo-950/40 to-slate-900/90 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="relative w-8 h-8 rounded-xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-cyan-400 p-[1px] shadow-md shadow-purple-500/25 shrink-0">
                <div className="w-full h-full bg-[#080B16] rounded-xl flex items-center justify-center">
                  <Workflow className="w-4 h-4 text-cyan-400" />
                </div>
              </div>
              <div className="truncate">
                <div className="flex items-center gap-1.5">
                  <h3 className="text-xs font-bold text-white tracking-wide truncate">
                    n8n AI Chatbot
                  </h3>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-emerald-400/20 animate-pulse" />
                </div>
                <div className="text-[10px] text-slate-400 font-mono truncate flex items-center gap-1">
                  <span>madhulathachintala5.app.n8n.cloud</span>
                  {n8nStatus?.latencyMs ? <span>· {n8nStatus.latencyMs}ms</span> : null}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/50 transition-colors"
                title={soundEnabled ? 'Mute chimes' : 'Enable chimes'}
              >
                {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-cyan-400" /> : <VolumeX className="w-3.5 h-3.5" />}
              </button>

              <button
                type="button"
                onClick={clearN8nChat}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/50 transition-colors"
                title="Clear chat history"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('n8n-chat');
                  setIsN8nWidgetOpen(false);
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/50 transition-colors"
                title="Expand to Full View"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => setIsN8nWidgetOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/50 transition-colors"
                title="Minimize widget"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Webhook Status Bar */}
          <div className="px-4 py-1.5 bg-slate-950/60 border-b border-white/[0.05] flex items-center justify-between text-[10px] text-slate-400 font-mono">
            <span className="flex items-center gap-1.5">
              <Radio className="w-3 h-3 text-cyan-400 animate-pulse" />
              <span className="text-slate-300">Webhook:</span>
              <span className="text-cyan-400 truncate max-w-[170px]">/95eec8f3.../chat</span>
            </span>
            <button
              onClick={checkN8nStatus}
              className="text-indigo-400 hover:text-indigo-300 hover:underline"
            >
              Test Ping
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
            {n8nMessages.map((msg) => {
              const isUser = msg.role === 'user';
              const isError = msg.status === 'error';

              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-2.5 text-xs ${
                    isUser ? 'flex-row-reverse' : 'flex-row'
                  }`}
                >
                  {/* Avatar */}
                  <div
                    className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                      isUser
                        ? 'bg-gradient-to-tr from-cyan-500 to-blue-600 text-white'
                        : isError
                        ? 'bg-rose-950 text-rose-300 border border-rose-500/30'
                        : 'bg-gradient-to-tr from-violet-600 to-indigo-600 text-white'
                    }`}
                  >
                    {isUser ? <User className="w-3.5 h-3.5" /> : <Workflow className="w-3.5 h-3.5" />}
                  </div>

                  {/* Bubble */}
                  <div
                    className={`group relative max-w-[82%] rounded-2xl p-3 leading-relaxed transition-all ${
                      isUser
                        ? 'bg-gradient-to-r from-indigo-600 to-cyan-600 text-white rounded-tr-sm shadow-md'
                        : isError
                        ? 'bg-rose-950/40 border border-rose-500/30 text-rose-200 rounded-tl-sm'
                        : 'bg-slate-900/80 border border-white/[0.08] text-slate-200 rounded-tl-sm shadow-sm'
                    }`}
                  >
                    <div className="whitespace-pre-wrap font-sans text-xs leading-relaxed">
                      {msg.content}
                    </div>

                    {/* Metadata & Copy action */}
                    <div className="mt-1.5 flex items-center justify-between gap-3 text-[10px] text-slate-400 opacity-75">
                      <span>{msg.timestamp}</span>
                      <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        {msg.latencyMs && (
                          <span className="font-mono text-cyan-400">{msg.latencyMs}ms</span>
                        )}
                        <button
                          onClick={() => handleCopy(msg.content, msg.id)}
                          className="hover:text-white"
                          title="Copy text"
                        >
                          {copiedId === msg.id ? (
                            <Check className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Typing / Waiting Indicator */}
            {isN8nLoading && (
              <div className="flex items-center gap-2.5 text-xs">
                <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-violet-600 to-indigo-600 text-white flex items-center justify-center shrink-0">
                  <Workflow className="w-3.5 h-3.5" />
                </div>
                <div className="p-3 rounded-2xl bg-slate-900/80 border border-white/[0.08] rounded-tl-sm flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                  <span className="text-[11px] text-slate-400 ml-1.5 font-mono">
                    n8n workflow executing...
                  </span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestions Chips */}
          {n8nMessages.length <= 2 && !isN8nLoading && (
            <div className="px-3 pb-2 pt-1 border-t border-white/[0.04] bg-slate-950/30 flex flex-wrap gap-1.5">
              {quickPrompts.map((p, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => sendN8nMessage(p)}
                  className="px-2.5 py-1 rounded-lg bg-slate-900/70 border border-white/[0.06] hover:border-cyan-400/40 hover:bg-slate-800/80 text-[11px] text-slate-300 transition-colors"
                >
                  {p}
                </button>
              ))}
            </div>
          )}

          {/* Input Footer */}
          <div className="p-3 border-t border-white/[0.08] bg-[#080B16]">
            <form onSubmit={handleSend} className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask n8n workflow chatbot..."
                disabled={isN8nLoading}
                className="flex-1 glass-input rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400/60"
              />
              <button
                type="submit"
                disabled={!input.trim() || isN8nLoading}
                className="p-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600 text-white shadow-md shadow-indigo-500/20 disabled:opacity-40 transition-all cursor-pointer shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
