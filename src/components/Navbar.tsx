import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Bell,
  Sparkles,
  CheckCircle2,
  Clock,
  Compass,
  X,
  User,
  Shield,
  Zap,
} from 'lucide-react';
import { useApp } from '../context/AppContext.js';

export const Navbar: React.FC<{ onOpenAuth: () => void }> = ({ onOpenAuth }) => {
  const {
    user,
    notifications,
    markNotificationRead,
    clearNotifications,
    setIsCommandPaletteOpen,
    setActiveTab,
    productivityScore,
  } = useApp();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Close menus on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setShowProfileMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const todayStr = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

  return (
    <header className="sticky top-0 z-40 h-16 border-b border-white/[0.07] bg-[#080B16]/80 backdrop-blur-xl px-4 md:px-8 flex items-center justify-between gap-4">
      {/* Left: Mobile branding / Greeting */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 md:hidden">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 via-purple-500 to-cyan-400 p-[1px] shadow-lg shadow-purple-500/20">
            <div className="w-full h-full bg-[#080B16] rounded-lg flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-cyan-400" />
            </div>
          </div>
          <span className="font-extrabold tracking-tight text-white text-base">NOVA</span>
        </div>

        <div className="hidden sm:flex flex-col">
          <div className="text-xs text-slate-400 flex items-center gap-1.5 font-medium">
            <span>{todayStr}</span>
            <span className="text-slate-600">·</span>
            <span className="text-cyan-400 flex items-center gap-1">
              <Zap className="w-3 h-3" /> Score {productivityScore}%
            </span>
          </div>
          <h2 className="text-sm font-semibold text-slate-200">
            Good day, {user.displayName.split(' ')[0]}
          </h2>
        </div>
      </div>

      {/* Center: Global Search Bar */}
      <div className="flex-1 max-w-md mx-2">
        <button
          type="button"
          onClick={() => setIsCommandPaletteOpen(true)}
          className="w-full flex items-center justify-between px-3.5 py-1.5 rounded-xl bg-slate-900/60 border border-white/[0.08] hover:border-indigo-500/40 text-slate-400 text-xs transition-all duration-200 group shadow-inner"
        >
          <div className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-cyan-400 transition-colors" />
            <span className="truncate">Search tasks, docs, topics or ask NOVA...</span>
          </div>
          <div className="hidden md:flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-slate-800/80 border border-white/10 text-[10px] text-slate-400 font-mono">
            <span>⌘</span>
            <span>K</span>
          </div>
        </button>
      </div>

      {/* Right: Actions, Notifications, Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Quick Launch Agent */}
        <button
          onClick={() => setActiveTab('agent')}
          className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-cyan-300 bg-cyan-950/40 border border-cyan-800/40 hover:bg-cyan-900/40 transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>Ask Agent</span>
        </button>

        {/* Notifications Popover */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            aria-label="Notifications"
            className="relative p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-cyan-400 ring-2 ring-[#080B16] animate-pulse" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl glass-panel-elevated p-4 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-white">Notifications</span>
                  {unreadCount > 0 && (
                    <span className="text-[10px] text-cyan-300 font-mono">
                      {unreadCount} unread
                    </span>
                  )}
                </div>
                {notifications.length > 0 && (
                  <button
                    onClick={clearNotifications}
                    className="text-[11px] text-slate-400 hover:text-slate-200 transition-colors"
                  >
                    Clear all
                  </button>
                )}
              </div>

              <div className="mt-3 space-y-2 max-h-72 overflow-y-auto pr-1">
                {notifications.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-500">
                    No new notifications. Everything is on schedule.
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => markNotificationRead(notif.id)}
                      className={`p-2.5 rounded-xl border text-left transition-colors cursor-pointer ${
                        notif.read
                          ? 'border-transparent bg-slate-900/30 text-slate-400'
                          : 'border-indigo-500/20 bg-indigo-950/20 text-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs font-medium">
                        <span className="text-white">{notif.title}</span>
                        <span className="text-[10px] text-slate-500">{notif.timestamp}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">{notif.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Avatar & Menu */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 p-1 pl-1.5 rounded-full border border-white/10 bg-slate-900/60 hover:border-purple-500/40 transition-colors"
          >
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-violet-600 via-indigo-600 to-cyan-500 flex items-center justify-center text-xs font-bold text-white shadow-sm">
              {user.displayName.charAt(0)}
            </div>
            <span className="hidden sm:inline text-xs font-medium text-slate-300 pr-1">
              {user.displayName.split(' ')[0]}
            </span>
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-64 rounded-2xl glass-panel-elevated p-3 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="p-2 border-b border-white/[0.08]">
                <div className="text-xs font-semibold text-white">{user.displayName}</div>
                <div className="text-[11px] text-slate-400 truncate">{user.email}</div>
                <div className="mt-2 flex items-center gap-2 text-[10px] text-cyan-400 font-mono">
                  <span>Target: {user.dailyFocusTargetMinutes}m focus / day</span>
                </div>
              </div>

              <div className="mt-2 space-y-1">
                <button
                  onClick={() => {
                    setActiveTab('settings');
                    setShowProfileMenu(false);
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-slate-300 hover:bg-slate-800/60 hover:text-white transition-colors"
                >
                  Account & AI Preferences
                </button>
                <button
                  onClick={() => {
                    setActiveTab('analytics');
                    setShowProfileMenu(false);
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-slate-300 hover:bg-slate-800/60 hover:text-white transition-colors"
                >
                  Personal Performance
                </button>
                <button
                  onClick={() => {
                    onOpenAuth();
                    setShowProfileMenu(false);
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-indigo-300 hover:bg-indigo-950/40 transition-colors"
                >
                  Switch Account / Sign In
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
