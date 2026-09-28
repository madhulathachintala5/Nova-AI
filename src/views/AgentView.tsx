import React, { useState } from 'react';
import {
  Sparkles,
  Send,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ExternalLink,
  ArrowRight,
  ShieldCheck,
  Bot,
  Zap,
  ListTodo,
  FileSearch,
  Globe,
  Loader2,
} from 'lucide-react';
import { useApp } from '../context/AppContext.js';
import { AgentExecution, AgentStep } from '../types/index.js';

export const AgentView: React.FC = () => {
  const {
    currentExecution,
    agentHistory,
    runAgentCommand,
    confirmStepExecution,
    tasks,
    setActiveTab,
  } = useApp();

  const [inputQuery, setInputQuery] = useState('');
  const [isRunning, setIsRunning] = useState(false);

  const samplePrompts = [
    'Plan my day. I have a Java exam tomorrow.',
    'Create five tasks for my DBMS revision.',
    'Summarize my uploaded notes.',
    'Make a seven-day Java learning plan.',
    'Find recent developments in AI agents.',
    'Move my unfinished tasks to tomorrow.',
  ];

  const handleExecute = async (queryText: string) => {
    if (!queryText.trim() || isRunning) return;
    setIsRunning(true);
    setInputQuery('');
    try {
      await runAgentCommand(queryText.trim());
    } finally {
      setIsRunning(false);
    }
  };

  const activeExecution = currentExecution || (agentHistory.length > 0 ? agentHistory[0] : null);

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 uppercase tracking-wider">
            <Bot className="w-4 h-4" />
            <span>Autonomous Multi-Tool Agent</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mt-1">
            Agent Command Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            Give NOVA natural language goals. NOVA analyzes intent, orchestrates planning sequences, selects verified tools, and asks for confirmation for consequential actions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-white/[0.08] text-xs font-mono text-slate-300 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Gemini Tools Ready</span>
          </div>
        </div>
      </div>

      {/* Input Console */}
      <div className="rounded-2xl glass-panel-elevated p-4 sm:p-5 border border-white/10 shadow-2xl relative">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleExecute(inputQuery);
          }}
          className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3"
        >
          <div className="relative flex-1 flex items-center">
            <Sparkles className="w-5 h-5 text-cyan-400 absolute left-3.5 pointer-events-none" />
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="Give NOVA an instruction (e.g., 'Plan my day. I have a Java exam tomorrow.')"
              className="w-full glass-input rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400/60"
            />
          </div>

          <button
            type="submit"
            disabled={!inputQuery.trim() || isRunning}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600 text-white font-medium text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/25 disabled:opacity-40 transition-all shrink-0 cursor-pointer"
          >
            {isRunning ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Executing Plan...</span>
              </>
            ) : (
              <>
                <span>Run Command</span>
                <Send className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

        {/* Suggested Prompts */}
        <div className="mt-4 pt-4 border-t border-white/[0.06] flex flex-wrap items-center gap-2">
          <span className="text-[11px] text-slate-500 font-medium mr-1">Quick Prompts:</span>
          {samplePrompts.map((prompt, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleExecute(prompt)}
              disabled={isRunning}
              className="px-2.5 py-1 rounded-lg bg-slate-900/60 border border-white/[0.06] hover:border-cyan-400/40 hover:bg-slate-800/60 text-slate-300 text-xs transition-colors flex items-center gap-1.5"
            >
              <span>{prompt}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Active Execution & Timeline Display */}
      {activeExecution ? (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl glass-panel border border-white/[0.08] space-y-6">
            {/* Execution Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-white/[0.08]">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-slate-400">COMMAND INTENT</span>
                  <span className="text-slate-600">·</span>
                  <span className="text-xs font-mono text-cyan-400 uppercase">
                    {activeExecution.intent}
                  </span>
                </div>
                <h2 className="text-lg font-semibold text-white mt-1">
                  "{activeExecution.query}"
                </h2>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-mono uppercase tracking-wider ${
                    activeExecution.status === 'completed'
                      ? 'bg-emerald-950/60 border border-emerald-500/30 text-emerald-300'
                      : activeExecution.status === 'awaiting_confirmation'
                      ? 'bg-amber-950/60 border border-amber-500/30 text-amber-300'
                      : activeExecution.status === 'running'
                      ? 'bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 animate-pulse'
                      : 'bg-rose-950/60 border border-rose-500/30 text-rose-300'
                  }`}
                >
                  {activeExecution.status.replace('_', ' ')}
                </span>
              </div>
            </div>

            {/* Execution Steps Timeline */}
            <div className="space-y-4">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Execution Sequence & Tool Invocations
              </h3>

              <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[2px] before:bg-white/[0.08]">
                {activeExecution.steps.map((step, idx) => {
                  const isCompleted = step.status === 'completed';
                  const isRunningStep = step.status === 'running';
                  const needsConfirmation = step.status === 'needs_confirmation';
                  const isFailed = step.status === 'failed';

                  return (
                    <div key={step.id || idx} className="relative group">
                      {/* Timeline Node Icon */}
                      <div
                        className={`absolute -left-6 top-0 w-4 h-4 rounded-full border-2 flex items-center justify-center bg-[#080B16] transition-all ${
                          isCompleted
                            ? 'border-emerald-400 text-emerald-400'
                            : needsConfirmation
                            ? 'border-amber-400 text-amber-400'
                            : isRunningStep
                            ? 'border-cyan-400 text-cyan-400 animate-ping'
                            : 'border-slate-600 text-slate-600'
                        }`}
                      >
                        <div
                          className={`w-1.5 h-1.5 rounded-full ${
                            isCompleted
                              ? 'bg-emerald-400'
                              : needsConfirmation
                              ? 'bg-amber-400'
                              : isRunningStep
                              ? 'bg-cyan-400'
                              : 'bg-slate-600'
                          }`}
                        />
                      </div>

                      <div className="p-4 rounded-xl bg-slate-900/40 border border-white/[0.06] hover:border-white/[0.1] transition-all space-y-2">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
                          <span className="font-semibold text-white">{step.title}</span>
                          <div className="flex items-center gap-2 font-mono text-[11px]">
                            {step.tool && (
                              <span className="px-2 py-0.5 rounded bg-slate-800 text-indigo-300">
                                Tool: {step.tool}
                              </span>
                            )}
                            <span
                              className={`uppercase ${
                                isCompleted
                                  ? 'text-emerald-400'
                                  : needsConfirmation
                                  ? 'text-amber-400 font-bold'
                                  : isRunningStep
                                  ? 'text-cyan-400'
                                  : 'text-slate-500'
                              }`}
                            >
                              {step.status}
                            </span>
                          </div>
                        </div>

                        <p className="text-xs text-slate-400 leading-relaxed">
                          {step.description}
                        </p>

                        {/* Confirmation Prompt Button */}
                        {needsConfirmation && (
                          <div className="mt-3 p-3 rounded-lg bg-amber-950/30 border border-amber-500/30 flex items-center justify-between gap-4">
                            <div className="flex items-center gap-2 text-xs text-amber-200">
                              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                              <span>{step.confirmationPrompt || 'This action modifies existing tasks. Confirm execution?'}</span>
                            </div>
                            <button
                              onClick={() => confirmStepExecution(activeExecution.id, step.id)}
                              className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs transition-colors shrink-0"
                            >
                              Approve & Execute
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Final Response Markdown Card */}
            {activeExecution.finalResponse && (
              <div className="p-5 rounded-xl bg-indigo-950/20 border border-indigo-500/20 space-y-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-cyan-300 uppercase tracking-wider">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Agent Synthesis</span>
                </div>
                <div className="text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-line prose-invert">
                  {activeExecution.finalResponse}
                </div>
              </div>
            )}

            {/* Sources & Citations if present */}
            {activeExecution.sources && activeExecution.sources.length > 0 && (
              <div className="pt-2">
                <h4 className="text-xs font-semibold text-slate-400 mb-2 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Live Grounded Sources</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {activeExecution.sources.map((src, i) => (
                    <a
                      key={i}
                      href={src.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 rounded-lg bg-slate-900/60 border border-white/[0.06] hover:border-cyan-400/40 text-left transition-colors flex items-center justify-between text-xs"
                    >
                      <div className="truncate mr-2">
                        <div className="text-slate-200 font-medium truncate">{src.title}</div>
                        <div className="text-[10px] text-slate-500 truncate">{src.url}</div>
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="p-12 rounded-2xl glass-panel border border-white/[0.08] text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 mx-auto flex items-center justify-center text-indigo-400">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-white">No active command sequence</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Select one of the quick prompts above or type an instruction to inspect step-by-step agent execution.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
