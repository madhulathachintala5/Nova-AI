import React, { useState, useEffect, useRef } from 'react';
import {
  Clock,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Sparkles,
  CheckCircle2,
  Circle,
  Coffee,
  Brain,
  Zap,
} from 'lucide-react';
import { useApp } from '../context/AppContext.js';

export const FocusView: React.FC = () => {
  const { tasks, updateTask, addFocusRecord, addToast } = useApp();

  const [mode, setMode] = useState<'focus' | 'short_break' | 'long_break'>('focus');
  const [durationMinutes, setDurationMinutes] = useState(25);
  const [secondsRemaining, setSecondsRemaining] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string>('');
  const [ambientAudioActive, setAmbientAudioActive] = useState(false);

  // Web Audio Context reference for ambient cosmic drone & completion bell
  const audioCtxRef = useRef<AudioContext | null>(null);
  const ambientOscillatorRef = useRef<OscillatorNode | null>(null);
  const ambientGainRef = useRef<GainNode | null>(null);

  // Initialize seconds on mode or duration change
  useEffect(() => {
    let minutes = durationMinutes;
    if (mode === 'short_break') minutes = 5;
    else if (mode === 'long_break') minutes = 15;
    setSecondsRemaining(minutes * 60);
    setIsActive(false);
  }, [mode, durationMinutes]);

  // Timer interval
  useEffect(() => {
    let interval: any = null;
    if (isActive && secondsRemaining > 0) {
      interval = setInterval(() => {
        setSecondsRemaining((prev) => prev - 1);
      }, 1000);
    } else if (secondsRemaining === 0 && isActive) {
      setIsActive(false);
      handleSessionComplete();
    }
    return () => clearInterval(interval);
  }, [isActive, secondsRemaining]);

  // Web Audio chime generator
  const playChime = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.3); // A5
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 1.2);
    } catch (e) {
      console.warn('Audio synthesis not supported');
    }
  };

  // Toggle ambient white noise / gentle binaural hum
  const toggleAmbientSound = () => {
    if (ambientAudioActive) {
      if (ambientOscillatorRef.current) {
        try {
          ambientOscillatorRef.current.stop();
        } catch (e) {}
      }
      setAmbientAudioActive(false);
    } else {
      try {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        audioCtxRef.current = ctx;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        // 174 Hz Solfeggio soothing frequency
        osc.type = 'sine';
        osc.frequency.setValueAtTime(174, ctx.currentTime);

        gain.gain.setValueAtTime(0.03, ctx.currentTime);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();

        ambientOscillatorRef.current = osc;
        ambientGainRef.current = gain;
        setAmbientAudioActive(true);
      } catch (err) {
        console.warn('Could not start ambient oscillator', err);
      }
    }
  };

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (ambientOscillatorRef.current) {
        try {
          ambientOscillatorRef.current.stop();
        } catch (e) {}
      }
    };
  }, []);

  const handleSessionComplete = () => {
    playChime();
    const task = tasks.find((t) => t.id === selectedTaskId);
    const sessionMinutes = mode === 'focus' ? durationMinutes : mode === 'short_break' ? 5 : 15;

    addFocusRecord({
      durationMinutes: sessionMinutes,
      mode,
      completedAt: new Date().toISOString(),
      associatedTaskTitle: task?.title,
    });

    if (task && mode === 'focus') {
      updateTask(task.id, { completed: true });
    }
    addToast(
      mode === 'focus'
        ? `Focus block finished! Logged ${sessionMinutes}m productive focus.`
        : 'Break completed! Ready to dive back in.',
      'success'
    );
  };

  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const currentDurationTotal =
    (mode === 'focus' ? durationMinutes : mode === 'short_break' ? 5 : 15) * 60;
  const progressRatio = (currentDurationTotal - secondsRemaining) / currentDurationTotal;
  const strokeDashoffset = 440 - 440 * progressRatio;

  const incompleteTasks = tasks.filter((t) => !t.completed);

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 uppercase tracking-wider">
            <Clock className="w-4 h-4" />
            <span>Deep Cognitive Immersion</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mt-1">Focus Mode</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
            Eliminate cognitive friction. Choose an objective, configure your focus interval, and enter a state of continuous flow.
          </p>
        </div>

        {/* Ambient Sound Toggle */}
        <button
          onClick={toggleAmbientSound}
          className={`px-4 py-2 rounded-xl border text-xs font-medium flex items-center gap-2 transition-all ${
            ambientAudioActive
              ? 'bg-cyan-950/60 border-cyan-400/40 text-cyan-300 shadow-md shadow-cyan-500/10'
              : 'bg-slate-900 border-white/[0.08] text-slate-400 hover:text-white'
          }`}
        >
          {ambientAudioActive ? <Volume2 className="w-4 h-4 text-cyan-400 animate-pulse" /> : <VolumeX className="w-4 h-4" />}
          <span>{ambientAudioActive ? 'Ambient Cosmic Hum Active' : 'Sound Generator Off'}</span>
        </button>
      </div>

      {/* Main Container */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left 2 Cols: Timer Dial & Controls */}
        <div className="lg:col-span-2 p-8 rounded-3xl glass-panel-elevated border border-white/10 shadow-2xl flex flex-col items-center justify-center space-y-8 relative overflow-hidden">
          {/* Ambient Glow */}
          <div className="absolute -top-32 -left-32 w-80 h-80 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-32 -right-32 w-80 h-80 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />

          {/* Mode Switcher */}
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-900/80 border border-white/[0.08] z-10">
            <button
              onClick={() => setMode('focus')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                mode === 'focus' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              Focus Session
            </button>
            <button
              onClick={() => setMode('short_break')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                mode === 'short_break' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              Short Break (5m)
            </button>
            <button
              onClick={() => setMode('long_break')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                mode === 'long_break' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              Long Break (15m)
            </button>
          </div>

          {/* Duration Presets when in Focus Mode */}
          {mode === 'focus' && (
            <div className="flex items-center gap-2 text-xs z-10">
              <span className="text-slate-500">Duration:</span>
              {[15, 25, 45, 60].map((mins) => (
                <button
                  key={mins}
                  onClick={() => {
                    setDurationMinutes(mins);
                    setIsActive(false);
                  }}
                  className={`px-2.5 py-1 rounded-lg border text-xs font-mono transition-colors ${
                    durationMinutes === mins
                      ? 'border-cyan-400/60 bg-cyan-950/40 text-cyan-300'
                      : 'border-white/[0.06] bg-slate-900/60 text-slate-400 hover:text-white'
                  }`}
                >
                  {mins}m
                </button>
              ))}
            </div>
          )}

          {/* Circular Countdown Display */}
          <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center z-10">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
              {/* Background Track */}
              <circle
                cx="80"
                cy="80"
                r="70"
                stroke="rgba(255,255,255,0.06)"
                strokeWidth="6"
                fill="none"
              />
              {/* Animated Progress Ring */}
              <circle
                cx="80"
                cy="80"
                r="70"
                stroke="url(#focusGradientRing)"
                strokeWidth="7"
                strokeDasharray="440"
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="none"
                className="transition-all duration-1000 ease-linear"
              />
              <defs>
                <linearGradient id="focusGradientRing" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#6366F1" />
                  <stop offset="50%" stopColor="#8B5CF6" />
                  <stop offset="100%" stopColor="#06B6D4" />
                </linearGradient>
              </defs>
            </svg>

            {/* Inner Content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-4xl sm:text-5xl font-extrabold text-white font-mono tracking-tight">
                {formattedTime}
              </span>
              <span className="text-xs uppercase tracking-widest text-slate-400 font-mono mt-2">
                {mode === 'focus' ? 'Deep Flow' : 'Recovery Window'}
              </span>
            </div>
          </div>

          {/* Controls: Play, Pause, Reset */}
          <div className="flex items-center gap-4 z-10">
            <button
              onClick={() => setIsActive(!isActive)}
              className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600 text-white font-bold text-sm shadow-xl shadow-indigo-500/25 flex items-center gap-2 cursor-pointer transition-all"
            >
              {isActive ? (
                <>
                  <Pause className="w-4 h-4" />
                  <span>Pause Timer</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  <span>{secondsRemaining === currentDurationTotal ? 'Start Flow' : 'Resume'}</span>
                </>
              )}
            </button>

            <button
              onClick={() => {
                setIsActive(false);
                setSecondsRemaining(currentDurationTotal);
              }}
              className="p-3.5 rounded-2xl bg-slate-900 border border-white/[0.08] text-slate-400 hover:text-white transition-colors"
              title="Reset Timer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right Col: Objective Selection */}
        <div className="p-6 rounded-2xl glass-panel border border-white/[0.08] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.07]">
            <div className="flex items-center gap-2">
              <Brain className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-semibold text-white">Focus Objective</h3>
            </div>
            <span className="text-[11px] text-slate-500 font-mono">1 Target Task</span>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            Attach a specific task to this session. When the timer finishes, it can automatically be marked complete.
          </p>

          <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
            {incompleteTasks.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500">
                All scheduled tasks completed. You are free to enter open study mode!
              </div>
            ) : (
              incompleteTasks.map((t) => {
                const isSelected = selectedTaskId === t.id;
                return (
                  <div
                    key={t.id}
                    onClick={() => setSelectedTaskId(isSelected ? '' : t.id)}
                    className={`p-3 rounded-xl border cursor-pointer text-left transition-all flex items-start gap-3 ${
                      isSelected
                        ? 'bg-cyan-950/40 border-cyan-400/50 text-white'
                        : 'bg-slate-900/40 border-white/[0.06] text-slate-300 hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="mt-0.5">
                      {isSelected ? (
                        <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                      ) : (
                        <Circle className="w-4 h-4 text-slate-600" />
                      )}
                    </div>
                    <div>
                      <div className="text-xs font-semibold leading-tight">{t.title}</div>
                      <div className="text-[10px] text-slate-400 font-mono mt-1">
                        {t.category} · {t.estimatedMinutes}m · {t.priority}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
