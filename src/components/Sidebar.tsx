import React, { useState } from 'react';
import {
  LayoutDashboard,
  Bot,
  FileText,
  Calendar,
  Sword,
  Clock,
  BarChart3,
  Globe,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Zap,
} from 'lucide-react';
import { useApp } from '../context/AppContext.js';

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, setCollapsed }) => {
  const { activeTab, setActiveTab, tasks, learningProgress } = useApp();

  const totalXP = Object.values(learningProgress).reduce((acc, curr) => acc + curr.xp, 0);
  const pendingTasksCount = tasks.filter((t) => !t.completed).length;

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard, badge: null },
    { id: 'agent', label: 'AI Agent', icon: Bot, badge: 'Pro' },
    { id: 'documents', label: 'My Documents', icon: FileText, badge: null },
    {
      id: 'planner',
      label: 'Day Planner',
      icon: Calendar,
      badge: pendingTasksCount > 0 ? `${pendingTasksCount}` : null,
    },
    { id: 'quest', label: 'Skill Quest', icon: Sword, badge: `${totalXP} XP` },
    { id: 'focus', label: 'Focus Mode', icon: Clock, badge: null },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, badge: null },
    { id: 'live-intel', label: 'Live Intel', icon: Globe, badge: null },
    { id: 'settings', label: 'Settings', icon: Settings, badge: null },
  ];

  return (
    <aside
      className={`relative z-30 flex flex-col border-r border-white/[0.07] bg-[#080B16] transition-all duration-300 select-none ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-white/[0.07]">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="relative w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-cyan-400 p-[1px] shadow-lg shadow-purple-500/25 shrink-0">
            <div className="w-full h-full bg-[#080B16] rounded-xl flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-cyan-400" />
            </div>
          </div>
          {!collapsed && (
            <div className="flex flex-col truncate">
              <span className="font-extrabold tracking-wider text-white text-base leading-none">
                NOVA <span className="text-cyan-400 font-normal">AI</span>
              </span>
              <span className="text-[10px] text-slate-500 tracking-widest uppercase mt-0.5">
                Life & Quest Core
              </span>
            </div>
          )}
        </div>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/50 transition-colors"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative ${
                isActive
                  ? 'text-white bg-gradient-to-r from-indigo-500/20 to-purple-500/10 border border-indigo-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40 border border-transparent'
              }`}
            >
              <Icon
                className={`w-4 h-4 shrink-0 transition-colors ${
                  isActive ? 'text-cyan-400' : 'text-slate-400 group-hover:text-slate-200'
                }`}
              />

              {!collapsed && (
                <div className="flex-1 flex items-center justify-between text-left truncate">
                  <span className="truncate">{item.label}</span>
                  {item.badge && (
                    <span className="text-[10px] text-slate-400 font-mono tracking-tight">
                      {item.badge}
                    </span>
                  )}
                </div>
              )}

              {/* Active glow pip on left */}
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r bg-cyan-400" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom Profile / Status Widget */}
      <div className="p-3 border-t border-white/[0.07]">
        {!collapsed ? (
          <div className="p-3 rounded-xl bg-slate-900/50 border border-white/[0.06] space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium">Neural Engine</span>
              <span className="text-emerald-400 font-mono text-[10px] flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Gemini 3.8
              </span>
            </div>
            <div className="flex items-center justify-between text-xs pt-1 border-t border-white/[0.05]">
              <span className="text-slate-400">Total Mastery</span>
              <span className="text-indigo-400 font-mono font-semibold flex items-center gap-1">
                <Zap className="w-3 h-3 text-cyan-400" /> {totalXP} XP
              </span>
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <div
              className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50 animate-pulse"
              title="Gemini Engine Online"
            />
          </div>
        )}
      </div>
    </aside>
  );
};
