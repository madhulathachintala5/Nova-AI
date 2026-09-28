import React, { useState } from 'react';
import { X, Sparkles, User, Mail, Lock, ArrowRight, ShieldCheck } from 'lucide-react';
import { useApp } from '../context/AppContext.js';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { user, setUser, addToast } = useApp();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setUser((prev) => ({
      ...prev,
      email: email.trim(),
      displayName: name.trim() || email.split('@')[0] || 'Explorer',
      isGuest: false,
    }));

    addToast(`Signed in as ${name.trim() || email}`, 'success');
    onClose();
  };

  const handleDemoSignIn = (demoName: string, demoEmail: string) => {
    setUser((prev) => ({
      ...prev,
      displayName: demoName,
      email: demoEmail,
      isGuest: false,
    }));
    addToast(`Switched account to ${demoName}`, 'success');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
      <div
        className="w-full max-w-md rounded-3xl glass-panel-elevated p-8 border border-white/10 shadow-2xl space-y-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/50"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-cyan-400 p-[1px] mx-auto shadow-lg shadow-purple-500/20">
            <div className="w-full h-full bg-[#080B16] rounded-2xl flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-cyan-400" />
            </div>
          </div>
          <h2 className="text-xl font-bold text-white">
            {mode === 'signin' ? 'Welcome to NOVA AI' : 'Create NOVA Account'}
          </h2>
          <p className="text-xs text-slate-400 max-w-xs mx-auto">
            Access synchronized day plans, neural document brains, and Skill Quest progress.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Alex Vance"
                  className="w-full glass-input rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full glass-input rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full glass-input rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20 transition-all cursor-pointer"
          >
            <span>{mode === 'signin' ? 'Sign In to Workspace' : 'Initialize Account'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        {/* Demo Fast Logins */}
        <div className="pt-2 border-t border-white/[0.08] space-y-2">
          <span className="text-[11px] text-slate-500 block text-center">
            Or test with instant demo profiles:
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleDemoSignIn('Elena Rostova', 'elena.rostova@tech.edu')}
              className="p-2 rounded-xl bg-slate-900 border border-white/[0.06] hover:border-cyan-400/40 text-xs text-slate-300 hover:text-white transition-colors"
            >
              Elena (CS Senior)
            </button>
            <button
              onClick={() => handleDemoSignIn('Marcus Brody', 'marcus.brody@dev.io')}
              className="p-2 rounded-xl bg-slate-900 border border-white/[0.06] hover:border-indigo-400/40 text-xs text-slate-300 hover:text-white transition-colors"
            >
              Marcus (Systems Eng)
            </button>
          </div>
        </div>

        {/* Toggle mode */}
        <div className="text-center text-xs text-slate-400">
          {mode === 'signin' ? (
            <span>
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => setMode('signup')}
                className="text-cyan-400 hover:underline font-medium"
              >
                Sign Up
              </button>
            </span>
          ) : (
            <span>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => setMode('signin')}
                className="text-cyan-400 hover:underline font-medium"
              >
                Sign In
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
