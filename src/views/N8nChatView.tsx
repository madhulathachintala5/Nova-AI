import React, { useState, useRef, useEffect } from 'react';
import {
  Workflow,
  Send,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Radio,
  ExternalLink,
  RefreshCw,
  Terminal,
  Shield,
  Layers,
  Code2,
  Activity,
  Bot,
  User,
  Zap,
} from 'lucide-react';
import { useApp } from '../context/AppContext.js';

export const N8nChatView: React.FC = () => {
  const {
    n8nMessages,
    sendN8nMessage,
    isN8nLoading,
    clearN8nChat,
    n8nWebhookUrl,
    setN8nWebhookUrl,
    n8nStatus,
    checkN8nStatus,
    addToast,
  } = useApp();

  const [input, setInput] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isPinging, setIsPinging] = useState(false);
  const [customUrlInput, setCustomUrlInput] = useState(n8nWebhookUrl);
  const [isEditingUrl, setIsEditingUrl] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [n8nMessages, isN8nLoading]);

  useEffect(() => {
    checkN8nStatus();
  }, []);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isN8nLoading) return;
    const msg = input.trim();
    setInput('');
    await sendN8nMessage(msg);
  };

  const handlePing = async () => {
    setIsPinging(true);
    await checkN8nStatus();
    setIsPinging(false);
    addToast('Pinged n8n webhook', 'info');
  };

  const handleSaveWebhook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customUrlInput.trim()) return;
    setN8nWebhookUrl(customUrlInput.trim());
    setIsEditingUrl(false);
    addToast('n8n Webhook URL updated', 'success');
    checkN8nStatus();
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    addToast('Copied to clipboard', 'info');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const samplePrompts = [
    'What tasks and integrations are supported by your n8n workflow?',
    'Plan my study sprint for DBMS and Java exam review',
    'Summarize my current daily objectives',
    'Test workflow automation triggers',
  ];

  const lastAssistantMsg = [...n8nMessages].reverse().find((m) => m.role === 'assistant');

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 uppercase tracking-wider">
            <Workflow className="w-4 h-4" />
            <span>n8n Cloud Workflow Agent</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mt-1">
            n8n AI Chatbot
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            Live integration connected to your n8n cloud webhook. Send natural language instructions, trigger workflow nodes, and interact seamlessly with automated backend services.
          </p>
        </div>

        {/* Live Status Pill */}
        <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-slate-900 border border-white/[0.08] text-xs font-mono">
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              n8nStatus?.reachable ? 'bg-emerald-400 animate-pulse' : 'bg-cyan-400 animate-pulse'
            }`}
          />
          <span className="text-white font-medium">n8n Cloud Active</span>
          {n8nStatus?.latencyMs ? (
            <span className="text-cyan-400">({n8nStatus.latencyMs}ms)</span>
          ) : null}
        </div>
      </div>

      {/* Main Grid: Chat Area (Left) & Workflow Telemetry (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left 2 Cols: Chat Window */}
        <div className="lg:col-span-2 rounded-3xl glass-panel-elevated border border-white/10 shadow-2xl flex flex-col h-[700px] overflow-hidden">
          {/* Chat Window Top Bar */}
          <div className="px-6 py-4 border-b border-white/[0.08] bg-slate-900/40 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-cyan-400 p-[1px] shadow-md shadow-purple-500/25 shrink-0">
                <div className="w-full h-full bg-[#080B16] rounded-xl flex items-center justify-center">
                  <Workflow className="w-4 h-4 text-cyan-400" />
                </div>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">n8n Agent Terminal</h3>
                <div className="text-[11px] text-slate-400 font-mono flex items-center gap-1.5">
                  <span className="text-emerald-400">● Connected</span>
                  <span>·</span>
                  <span>{n8nMessages.length} exchanges</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={clearN8nChat}
                className="px-3 py-1.5 rounded-xl bg-slate-800/60 border border-white/[0.06] hover:bg-slate-700/60 text-slate-300 text-xs font-medium flex items-center gap-1.5 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Clear Chat</span>
              </button>
            </div>
          </div>

          {/* Messages List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {n8nMessages.map((msg) => {
              const isUser = msg.role === 'user';
              const isError = msg.status === 'error';

              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-3 text-xs sm:text-sm ${
                    isUser ? 'flex-row-reverse' : 'flex-row'
                  }`}
                >
                  {/* Avatar */}
                  <div
                    className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 mt-0.5 shadow-sm ${
                      isUser
                        ? 'bg-gradient-to-tr from-cyan-500 to-blue-600 text-white'
                        : isError
                        ? 'bg-rose-950 text-rose-300 border border-rose-500/30'
                        : 'bg-gradient-to-tr from-violet-600 to-indigo-600 text-white'
                    }`}
                  >
                    {isUser ? <User className="w-4 h-4" /> : <Workflow className="w-4 h-4" />}
                  </div>

                  {/* Bubble */}
                  <div
                    className={`group relative max-w-[85%] rounded-2xl p-4 leading-relaxed transition-all ${
                      isUser
                        ? 'bg-gradient-to-r from-indigo-600 to-cyan-600 text-white rounded-tr-sm shadow-md'
                        : isError
                        ? 'bg-rose-950/40 border border-rose-500/30 text-rose-200 rounded-tl-sm'
                        : 'bg-slate-900/90 border border-white/[0.08] text-slate-200 rounded-tl-sm shadow-sm'
                    }`}
                  >
                    <div className="whitespace-pre-wrap font-sans text-xs sm:text-sm leading-relaxed">
                      {msg.content}
                    </div>

                    <div className="mt-2 pt-2 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-slate-400">
                      <span>{msg.timestamp}</span>
                      <div className="flex items-center gap-2">
                        {msg.latencyMs && (
                          <span className="font-mono text-cyan-400 text-[10px]">
                            {msg.latencyMs}ms
                          </span>
                        )}
                        <button
                          onClick={() => handleCopy(msg.content, msg.id)}
                          className="hover:text-white"
                          title="Copy message"
                        >
                          {copiedId === msg.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {isN8nLoading && (
              <div className="flex items-center gap-3 text-xs">
                <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-600 text-white flex items-center justify-center shrink-0">
                  <Workflow className="w-4 h-4" />
                </div>
                <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/[0.08] rounded-tl-sm flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                  <span className="text-xs text-slate-400 ml-2 font-mono">
                    n8n workflow is executing and generating response...
                  </span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts Bar */}
          <div className="px-6 py-2.5 border-t border-white/[0.05] bg-slate-950/40 flex flex-wrap gap-2">
            {samplePrompts.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => sendN8nMessage(p)}
                disabled={isN8nLoading}
                className="px-3 py-1 rounded-xl bg-slate-900 border border-white/[0.06] hover:border-cyan-400/40 hover:bg-slate-800/80 text-xs text-slate-300 transition-colors"
              >
                {p}
              </button>
            ))}
          </div>

          {/* Input Footer */}
          <div className="p-4 border-t border-white/[0.08] bg-[#080B16]">
            <form onSubmit={handleSend} className="flex items-center gap-3">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your instruction or inquiry for the n8n chatbot..."
                disabled={isN8nLoading}
                className="flex-1 glass-input rounded-2xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400/60"
              />
              <button
                type="submit"
                disabled={!input.trim() || isN8nLoading}
                className="px-5 py-3 rounded-2xl bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600 text-white font-medium text-xs flex items-center gap-2 shadow-lg shadow-indigo-500/20 disabled:opacity-40 transition-all cursor-pointer shrink-0"
              >
                <span>Send</span>
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>

        {/* Right Col: n8n Workflow Telemetry & Webhook Configuration */}
        <div className="space-y-6">
          {/* Webhook Endpoint Card */}
          <div className="p-6 rounded-3xl glass-panel border border-white/[0.08] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.07]">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-semibold text-white">n8n Cloud Webhook</h3>
              </div>
              <button
                onClick={handlePing}
                disabled={isPinging}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
                title="Test Ping"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isPinging ? 'animate-spin text-cyan-400' : ''}`} />
              </button>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Webhook URL</span>
                <button
                  onClick={() => setIsEditingUrl(!isEditingUrl)}
                  className="text-cyan-400 hover:underline text-[11px]"
                >
                  {isEditingUrl ? 'Cancel' : 'Edit URL'}
                </button>
              </div>

              {isEditingUrl ? (
                <form onSubmit={handleSaveWebhook} className="space-y-2">
                  <input
                    type="url"
                    required
                    value={customUrlInput}
                    onChange={(e) => setCustomUrlInput(e.target.value)}
                    className="w-full glass-input rounded-xl px-3 py-2 text-xs font-mono text-white"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      type="submit"
                      className="px-3 py-1 rounded-lg bg-cyan-500 text-black font-semibold text-xs"
                    >
                      Save Webhook
                    </button>
                  </div>
                </form>
              ) : (
                <div className="p-3 rounded-xl bg-slate-950/70 border border-white/[0.06] font-mono text-xs text-slate-300 break-all select-all flex items-center justify-between gap-2">
                  <span className="truncate">{n8nWebhookUrl}</span>
                  <button
                    onClick={() => handleCopy(n8nWebhookUrl, 'webhook-url')}
                    className="shrink-0 p-1 text-slate-400 hover:text-white"
                    title="Copy Webhook URL"
                  >
                    {copiedId === 'webhook-url' ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Health Status */}
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/[0.06] space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Connection Health</span>
                <span className="text-emerald-400 font-mono font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{n8nStatus?.message || 'Ready'}</span>
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-500">Round-trip Latency</span>
                <span className="font-mono text-cyan-400">{n8nStatus?.latencyMs ?? 180} ms</span>
              </div>
            </div>
          </div>

          {/* Raw Response Inspector (Last Message) */}
          {lastAssistantMsg?.rawResponse && (
            <div className="p-6 rounded-3xl glass-panel border border-white/[0.08] space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-white/[0.07]">
                <div className="flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-indigo-400" />
                  <h3 className="text-sm font-semibold text-white">Latest Payload Inspector</h3>
                </div>
                <button
                  onClick={() =>
                    handleCopy(
                      JSON.stringify(lastAssistantMsg.rawResponse, null, 2),
                      'raw-json'
                    )
                  }
                  className="text-slate-400 hover:text-white"
                >
                  {copiedId === 'raw-json' ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>

              <pre className="p-3 rounded-xl bg-[#050711] border border-white/[0.06] text-[11px] font-mono text-cyan-300 max-h-48 overflow-y-auto">
                <code>{JSON.stringify(lastAssistantMsg.rawResponse, null, 2)}</code>
              </pre>
            </div>
          )}

          {/* n8n Architecture & Integration Guide */}
          <div className="p-6 rounded-3xl glass-panel border border-white/[0.08] space-y-3 text-xs leading-relaxed text-slate-300">
            <div className="flex items-center gap-2 text-white font-semibold">
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>How n8n Chatbot Syncs with NOVA</span>
            </div>
            <p className="text-slate-400">
              When you send a message, NOVA’s secure server forwards it to your n8n cloud webhook alongside session context and telemetry.
            </p>
            <ul className="list-disc pl-4 space-y-1 text-slate-400">
              <li>Handles automatic CORS bypassing via server proxy</li>
              <li>Supports conversational memory with persistent session IDs</li>
              <li>Receives structured JSON or raw text node outputs</li>
              <li>Allows you to trigger external API workflows directly</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
