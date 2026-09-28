import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Sparkles,
  Calendar,
  FileText,
  Clock,
  Sword,
  BarChart2,
  X,
  ArrowRight,
  Zap,
} from 'lucide-react';
import { useApp } from '../context/AppContext.js';

export const CommandPalette: React.FC = () => {
  const {
    isCommandPaletteOpen,
    setIsCommandPaletteOpen,
    setActiveTab,
    runAgentCommand,
    tasks,
    documents,
    moveUnfinishedTasksToTomorrow,
  } = useApp();

  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(!isCommandPaletteOpen);
      } else if (e.key === 'Escape' && isCommandPaletteOpen) {
        setIsCommandPaletteOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCommandPaletteOpen, setIsCommandPaletteOpen]);

  useEffect(() => {
    if (isCommandPaletteOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSelectedIndex(0);
    }
  }, [isCommandPaletteOpen]);

  if (!isCommandPaletteOpen) return null;

  const actions = [
    {
      id: 'agent-ask',
      title: query ? `Ask Agent: "${query}"` : 'Ask NOVA Agent anything...',
      category: 'Agent',
      icon: Sparkles,
      action: () => {
        if (query.trim()) {
          runAgentCommand(query.trim());
          setActiveTab('agent');
        } else {
          setActiveTab('agent');
        }
      },
    },
    {
      id: 'plan-day',
      title: 'Plan my day with high priority exam schedule',
      category: 'Agent Quick Action',
      icon: Calendar,
      action: () => {
        runAgentCommand('Plan my day. I have a Java exam tomorrow.');
        setActiveTab('agent');
      },
    },
    {
      id: 'dbms-tasks',
      title: 'Create five tasks for my DBMS revision',
      category: 'Agent Quick Action',
      icon: Zap,
      action: () => {
        runAgentCommand('Create five tasks for my DBMS revision.');
        setActiveTab('agent');
      },
    },
    {
      id: 'move-tasks',
      title: 'Move all unfinished tasks to tomorrow',
      category: 'Planner',
      icon: Calendar,
      action: () => {
        moveUnfinishedTasksToTomorrow();
        setActiveTab('planner');
      },
    },
    {
      id: 'start-focus',
      title: 'Start 25-minute Pomodoro focus session',
      category: 'Focus',
      icon: Clock,
      action: () => setActiveTab('focus'),
    },
    {
      id: 'ask-docs',
      title: 'Search uploaded notes in Smart Document Brain',
      category: 'Documents',
      icon: FileText,
      action: () => setActiveTab('documents'),
    },
    {
      id: 'take-quiz',
      title: 'Launch Skill Quest coding quiz',
      category: 'Learning',
      icon: Sword,
      action: () => setActiveTab('quest'),
    },
    {
      id: 'view-analytics',
      title: 'Inspect productivity & streak telemetry',
      category: 'Analytics',
      icon: BarChart2,
      action: () => setActiveTab('analytics'),
    },
  ];

  const filteredActions = query.trim()
    ? actions.filter(
        (a) =>
          a.title.toLowerCase().includes(query.toLowerCase()) ||
          a.category.toLowerCase().includes(query.toLowerCase())
      )
    : actions;

  const handleSelect = (action: () => void) => {
    action();
    setIsCommandPaletteOpen(false);
    setQuery('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-150">
      <div
        className="w-full max-w-2xl rounded-2xl glass-panel-elevated shadow-2xl border border-white/10 overflow-hidden flex flex-col max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search header */}
        <div className="flex items-center px-4 py-3.5 border-b border-white/[0.08] gap-3">
          <Search className="w-5 h-5 text-cyan-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && filteredActions.length > 0) {
                handleSelect(filteredActions[selectedIndex]?.action || filteredActions[0].action);
              } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelectedIndex((prev) => (prev + 1) % filteredActions.length);
              } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelectedIndex((prev) => (prev - 1 + filteredActions.length) % filteredActions.length);
              }
            }}
            placeholder="Type a natural command or search NOVA..."
            className="flex-1 bg-transparent text-white placeholder-slate-500 text-sm focus:outline-none font-medium"
          />
          <button
            onClick={() => setIsCommandPaletteOpen(false)}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/50 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {filteredActions.map((item, index) => {
            const Icon = item.icon;
            const isSelected = index === selectedIndex;
            return (
              <button
                key={item.id}
                onClick={() => handleSelect(item.action)}
                onMouseEnter={() => setSelectedIndex(index)}
                className={`w-full flex items-center justify-between p-3 rounded-xl text-left transition-all ${
                  isSelected
                    ? 'bg-gradient-to-r from-indigo-500/20 to-purple-500/15 border border-indigo-500/30 text-white'
                    : 'text-slate-300 hover:bg-slate-800/40 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-lg ${
                      isSelected ? 'bg-indigo-500/30 text-cyan-300' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-sm font-medium">{item.title}</div>
                    <div className="text-[11px] text-slate-500">{item.category}</div>
                  </div>
                </div>
                <ArrowRight
                  className={`w-4 h-4 transition-transform ${
                    isSelected ? 'text-cyan-400 translate-x-0.5' : 'text-slate-600'
                  }`}
                />
              </button>
            );
          })}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2.5 border-t border-white/[0.08] bg-slate-950/40 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-3">
            <span>Use <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px]">↑</kbd> <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px]">↓</kbd> to navigate</span>
            <span><kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px]">↵</kbd> to execute</span>
          </div>
          <span>NOVA Multi-Tool Engine</span>
        </div>
      </div>
    </div>
  );
};
