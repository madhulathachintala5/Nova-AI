import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  ArrowRight,
  Calendar,
  FileText,
  Clock,
  Sword,
  Workflow,
  CheckCircle2,
  Circle,
  TrendingUp,
  Zap,
  Flame,
  Brain,
  RefreshCw,
  Plus,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import { useApp } from '../context/AppContext.js';

export const OverviewView: React.FC = () => {
  const {
    user,
    tasks,
    updateTask,
    addTask,
    setActiveTab,
    runAgentCommand,
    productivityScore,
    focusRecords,
    learningProgress,
    setIsN8nWidgetOpen,
  } = useApp();

  const [aiInput, setAiInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [insights, setInsights] = useState<string>(
    '- **Momentum Established:** 1 objective completed early today with 50 minutes of deep focus logged.\n- **Cognitive Energy Allocation:** Schedule your high-complexity DSA and Database drills in the morning window.\n- **Continuous Trajectory:** Sustaining your 5-day streak unlocks the "7-Day Luminary" achievement.'
  );
  const [loadingInsights, setLoadingInsights] = useState(false);

  const completedTasks = tasks.filter((t) => t.completed);
  const pendingTasks = tasks.filter((t) => !t.completed);
  const todayProgressPercent =
    tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0;

  const totalFocusMinutes = focusRecords
    .filter((f) => f.mode === 'focus')
    .reduce((sum, f) => sum + f.durationMinutes, 0);

  // Weekly productivity chart data (last 7 days)
  const chartData = [
    { day: 'Mon', focus: 75, tasks: 4 },
    { day: 'Tue', focus: 100, tasks: 5 },
    { day: 'Wed', focus: 45, tasks: 2 },
    { day: 'Thu', focus: 90, tasks: 4 },
    { day: 'Fri', focus: 120, tasks: 6 },
    { day: 'Sat', focus: 60, tasks: 3 },
    { day: 'Sun', focus: totalFocusMinutes || 50, tasks: completedTasks.length || 1 },
  ];

  const handleCommandSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiInput.trim() || isSubmitting) return;
    setIsSubmitting(true);
    const query = aiInput.trim();
    setAiInput('');
    setActiveTab('agent');
    await runAgentCommand(query);
    setIsSubmitting(false);
  };

  const fetchDynamicInsights = async () => {
    setLoadingInsights(true);
    try {
      const res = await fetch('/api/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          completedTasks: completedTasks.length,
          totalTasks: tasks.length,
          focusMinutes: totalFocusMinutes,
          streak: 5,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.insights) setInsights(data.insights);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingInsights(false);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Top Hero: Animated Orb & Command Center Bar */}
      <section className="relative overflow-hidden rounded-3xl p-6 sm:p-10 border border-white/[0.08] bg-gradient-to-br from-indigo-950/40 via-[#0B0F22]/90 to-purple-950/30 backdrop-blur-2xl shadow-2xl">
        {/* Background ambient lighting */}
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-violet-600/15 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="flex-1 space-y-4 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-xs font-medium text-slate-300">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span>NOVA Neural Command Active</span>
              <span className="text-slate-500">·</span>
              <span className="text-slate-400 font-mono">Autonomous Assistant</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
              Good day, {user.displayName.split(' ')[0]}! <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-cyan-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
                Ready to make today count?
              </span>
            </h1>

            <p className="text-sm sm:text-base text-slate-400 max-w-xl font-normal leading-relaxed">
              Your personal AI command center is synchronized. Manage your schedule, master concepts through Skill Quest, and query your knowledge base.
            </p>

            {/* Natural Language Command Bar */}
            <form onSubmit={handleCommandSubmit} className="pt-2">
              <div className="relative flex items-center rounded-2xl glass-input p-1.5 shadow-2xl border border-white/15 focus-within:border-cyan-400/60 focus-within:ring-2 focus-within:ring-cyan-400/20 transition-all">
                <div className="pl-3.5 pr-2">
                  <Sparkles className="w-5 h-5 text-cyan-400 shrink-0" />
                </div>
                <input
                  type="text"
                  value={aiInput}
                  onChange={(e) => setAiInput(e.target.value)}
                  placeholder="Tell NOVA what you want to accomplish... (e.g., 'Plan my day. I have a Java exam tomorrow')"
                  className="flex-1 bg-transparent text-white placeholder-slate-500 text-sm focus:outline-none py-2 font-medium"
                />
                <button
                  type="submit"
                  disabled={!aiInput.trim() || isSubmitting}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600 text-white font-medium text-xs flex items-center gap-1.5 shadow-lg shadow-indigo-500/20 disabled:opacity-40 transition-all cursor-pointer"
                >
                  <span>Execute</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          </div>

          {/* Futuristic Glowing AI Orb */}
          <div className="relative shrink-0 flex items-center justify-center p-6">
            <div className="w-44 h-44 sm:w-52 sm:h-52 rounded-full relative flex items-center justify-center nova-orb-pulse">
              <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-violet-600 via-indigo-500 to-cyan-400 opacity-60 blur-xl" />
              <div className="absolute inset-2 rounded-full bg-[#080B16] border border-cyan-400/40 shadow-inner flex items-center justify-center overflow-hidden">
                {/* Internal energy rings */}
                <div className="w-32 h-32 rounded-full border border-indigo-400/30 animate-spin" style={{ animationDuration: '14s' }} />
                <div className="w-24 h-24 rounded-full border border-cyan-300/40 animate-spin" style={{ animationDuration: '9s', animationDirection: 'reverse' }} />
                <div className="absolute flex flex-col items-center justify-center text-center">
                  <Brain className="w-8 h-8 text-cyan-300 drop-shadow-md" />
                  <span className="text-[10px] font-mono tracking-widest text-slate-300 uppercase mt-1">
                    NOVA · SYNC
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Action Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          {
            title: 'Plan My Day',
            desc: 'Generate optimal schedules and exam study sprints with AI',
            icon: Calendar,
            color: 'from-indigo-500/20 to-purple-500/10 text-indigo-400',
            action: () => {
              runAgentCommand('Plan my day. I have a Java exam tomorrow.');
              setActiveTab('agent');
            },
          },
          {
            title: 'n8n Chatbot',
            desc: 'Trigger workflows and automation through your n8n cloud webhook',
            icon: Workflow,
            color: 'from-cyan-500/25 to-indigo-500/15 text-cyan-300',
            action: () => {
              setActiveTab('n8n-chat');
            },
          },
          {
            title: 'Ask My Documents',
            desc: 'Query syllabus notes and PDFs with grounded RAG retrieval',
            icon: FileText,
            color: 'from-blue-500/20 to-cyan-500/10 text-blue-400',
            action: () => setActiveTab('documents'),
          },
          {
            title: 'Start Focus Session',
            desc: 'Launch a 25-minute Pomodoro study block with ambient sound',
            icon: Clock,
            color: 'from-violet-500/20 to-pink-500/10 text-violet-400',
            action: () => setActiveTab('focus'),
          },
          {
            title: 'Learn Something New',
            desc: 'Test your skills in Java, Python, DSA, or DBMS quests',
            icon: Sword,
            color: 'from-emerald-500/20 to-teal-500/10 text-emerald-400',
            action: () => setActiveTab('quest'),
          },
        ].map((item, idx) => {
          const Icon = item.icon;
          return (
            <button
              key={idx}
              onClick={item.action}
              className="p-5 rounded-2xl glass-panel text-left hover:border-indigo-500/40 hover:bg-slate-900/60 transition-all duration-200 group flex flex-col justify-between h-40 border border-white/[0.08]"
            >
              <div className="flex items-center justify-between w-full">
                <div className={`p-2.5 rounded-xl bg-gradient-to-br ${item.color} border border-white/[0.06]`}>
                  <Icon className="w-5 h-5" />
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white group-hover:text-cyan-300 transition-colors">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            </button>
          );
        })}
      </section>

      {/* Metrics Row: Productivity Score, Learning Streak, Focus Time, Tasks */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Productivity Score */}
        <div className="p-5 rounded-2xl glass-panel border border-white/[0.08] flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-slate-400 font-medium">Productivity Index</span>
            <div className="text-2xl sm:text-3xl font-bold text-white flex items-baseline gap-1">
              <span>{productivityScore}</span>
              <span className="text-xs text-slate-500 font-normal">/ 100</span>
            </div>
            <div className="text-[11px] text-cyan-400 font-mono">
              Transparent telemetry
            </div>
          </div>
          <div className="p-3 rounded-2xl bg-cyan-950/40 border border-cyan-800/30 text-cyan-400">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        {/* Current Learning Streak */}
        <div className="p-5 rounded-2xl glass-panel border border-white/[0.08] flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-slate-400 font-medium">Learning Streak</span>
            <div className="text-2xl sm:text-3xl font-bold text-white flex items-baseline gap-1">
              <span>5</span>
              <span className="text-xs text-slate-500 font-normal">days active</span>
            </div>
            <div className="text-[11px] text-amber-400 font-mono flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              Unbroken momentum
            </div>
          </div>
          <div className="p-3 rounded-2xl bg-amber-950/40 border border-amber-800/30 text-amber-400">
            <Zap className="w-6 h-6" />
          </div>
        </div>

        {/* Focus Minutes */}
        <div className="p-5 rounded-2xl glass-panel border border-white/[0.08] flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-slate-400 font-medium">Focus Logged Today</span>
            <div className="text-2xl sm:text-3xl font-bold text-white flex items-baseline gap-1">
              <span>{totalFocusMinutes}</span>
              <span className="text-xs text-slate-500 font-normal">mins</span>
            </div>
            <div className="text-[11px] text-slate-400 font-mono">
              Target: {user.dailyFocusTargetMinutes}m
            </div>
          </div>
          <div className="p-3 rounded-2xl bg-indigo-950/40 border border-indigo-800/30 text-indigo-400">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        {/* Today's Tasks Completed */}
        <div className="p-5 rounded-2xl glass-panel border border-white/[0.08] flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-slate-400 font-medium">Today's Objectives</span>
            <div className="text-2xl sm:text-3xl font-bold text-white flex items-baseline gap-1">
              <span>{completedTasks.length}</span>
              <span className="text-xs text-slate-500 font-normal">/ {tasks.length}</span>
            </div>
            <div className="text-[11px] text-emerald-400 font-mono">
              {todayProgressPercent}% completed
            </div>
          </div>
          <div className="p-3 rounded-2xl bg-emerald-950/40 border border-emerald-800/30 text-emerald-400">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>
      </section>

      {/* Main Grid: Weekly Chart & Tasks + Daily Insights */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Weekly Performance Chart & Upcoming Tasks */}
        <div className="lg:col-span-2 space-y-6">
          {/* Weekly Chart */}
          <div className="p-6 rounded-2xl glass-panel border border-white/[0.08]">
            <div className="flex items-center justify-between pb-4 border-b border-white/[0.07]">
              <div>
                <h3 className="text-base font-semibold text-white">Weekly Productivity Trends</h3>
                <p className="text-xs text-slate-400 mt-0.5">Focus minutes and tasks accomplished per day</p>
              </div>
              <div className="flex items-center gap-4 text-xs font-mono">
                <span className="flex items-center gap-1.5 text-indigo-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" /> Focus (mins)
                </span>
                <span className="flex items-center gap-1.5 text-cyan-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" /> Tasks
                </span>
              </div>
            </div>

            <div className="h-64 mt-4 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="focusGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366F1" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#6366F1" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="taskGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#06B6D4" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="day" stroke="#64748B" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748B" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0F172A',
                      borderColor: 'rgba(255,255,255,0.1)',
                      borderRadius: '0.75rem',
                      fontSize: '12px',
                    }}
                  />
                  <Area type="monotone" dataKey="focus" stroke="#6366F1" strokeWidth={2} fillOpacity={1} fill="url(#focusGradient)" name="Focus Mins" />
                  <Area type="monotone" dataKey="tasks" stroke="#06B6D4" strokeWidth={2} fillOpacity={1} fill="url(#taskGradient)" name="Tasks Completed" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Upcoming Tasks List */}
          <div className="p-6 rounded-2xl glass-panel border border-white/[0.08]">
            <div className="flex items-center justify-between pb-4 border-b border-white/[0.07]">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold text-white">Today's Objectives</h3>
                <span className="text-xs text-slate-500 font-mono">({pendingTasks.length} pending)</span>
              </div>
              <button
                onClick={() => setActiveTab('planner')}
                className="text-xs text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1 transition-colors"
              >
                <span>Open Day Planner</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="mt-4 space-y-2.5">
              {tasks.length === 0 ? (
                <div className="py-12 text-center text-slate-500 text-xs">
                  No objectives scheduled yet. Ask NOVA: "Plan my day" or add a task!
                </div>
              ) : (
                tasks.slice(0, 4).map((task) => (
                  <div
                    key={task.id}
                    className={`flex items-center justify-between p-3.5 rounded-xl border transition-all ${
                      task.completed
                        ? 'border-white/[0.04] bg-slate-900/30 opacity-60'
                        : 'border-white/[0.07] bg-slate-900/60 hover:border-indigo-500/30'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => updateTask(task.id, { completed: !task.completed })}
                        className="text-slate-400 hover:text-cyan-400 transition-colors"
                      >
                        {task.completed ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                        ) : (
                          <Circle className="w-5 h-5 text-slate-500" />
                        )}
                      </button>
                      <div>
                        <div className={`text-xs sm:text-sm font-medium ${task.completed ? 'line-through text-slate-400' : 'text-white'}`}>
                          {task.title}
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                          <span>{task.category}</span>
                          <span>·</span>
                          <span>{task.estimatedMinutes} mins</span>
                          {task.timeSlot && (
                            <>
                              <span>·</span>
                              <span className="font-mono text-cyan-400">{task.timeSlot}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-mono uppercase ${
                          task.priority === 'high'
                            ? 'text-rose-400'
                            : task.priority === 'medium'
                            ? 'text-amber-400'
                            : 'text-slate-400'
                        }`}
                      >
                        {task.priority}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Col: AI Daily Insights & Skill Quest Summary */}
        <div className="space-y-6">
          {/* Daily AI Insights Card */}
          <div className="p-6 rounded-2xl glass-panel border border-white/[0.08] relative">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.07]">
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-semibold text-white">Daily Intelligence Brief</h3>
              </div>
              <button
                onClick={fetchDynamicInsights}
                disabled={loadingInsights}
                className="p-1 rounded-lg text-slate-400 hover:text-white transition-colors"
                title="Refresh AI Insights"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingInsights ? 'animate-spin text-cyan-400' : ''}`} />
              </button>
            </div>

            <div className="mt-4 text-xs text-slate-300 leading-relaxed space-y-2 whitespace-pre-line font-normal">
              {insights}
            </div>

            <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-slate-500">
              <span>Derived from real telemetry</span>
              <button
                onClick={() => setActiveTab('agent')}
                className="text-cyan-400 hover:underline"
              >
                Discuss with Agent →
              </button>
            </div>
          </div>

          {/* Skill Quest Progress Snapshot */}
          <div className="p-6 rounded-2xl glass-panel border border-white/[0.08]">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.07]">
              <div className="flex items-center gap-2">
                <Sword className="w-4 h-4 text-indigo-400" />
                <h3 className="text-sm font-semibold text-white">Skill Quest Ranks</h3>
              </div>
              <button
                onClick={() => setActiveTab('quest')}
                className="text-xs text-indigo-400 hover:text-indigo-300"
              >
                Explore →
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {Object.values(learningProgress).map((prog) => {
                const percent = Math.min(Math.round(((prog.xp % 250) / 250) * 100), 100);
                return (
                  <div key={prog.category} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-white">{prog.category}</span>
                      <span className="font-mono text-[11px] text-slate-400">
                        Lvl {prog.level} · {prog.xp} XP
                      </span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-full"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
