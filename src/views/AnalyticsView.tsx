import React from 'react';
import {
  BarChart3,
  TrendingUp,
  Clock,
  CheckCircle2,
  Award,
  Zap,
  Flame,
  Calendar,
  Layers,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { useApp } from '../context/AppContext.js';

export const AnalyticsView: React.FC = () => {
  const { tasks, focusRecords, learningProgress, productivityScore, user } = useApp();

  const completedTasks = tasks.filter((t) => t.completed);
  const totalTasks = tasks.length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks.length / totalTasks) * 100) : 0;

  const totalFocusMinutes = focusRecords
    .filter((f) => f.mode === 'focus')
    .reduce((sum, f) => sum + f.durationMinutes, 0);

  // Focus time by day (mock historical + today's real session data)
  const focusTimeHistory = [
    { day: 'Mon', minutes: 75 },
    { day: 'Tue', minutes: 90 },
    { day: 'Wed', minutes: 50 },
    { day: 'Thu', minutes: 80 },
    { day: 'Fri', minutes: 110 },
    { day: 'Sat', minutes: 60 },
    { day: 'Sun', minutes: totalFocusMinutes || 50 },
  ];

  // Learning XP breakdown by category from actual learningProgress
  const categoryColors: Record<string, string> = {
    Java: '#6366F1',
    Python: '#38BDF8',
    DSA: '#EC4899',
    DBMS: '#10B981',
    AI: '#F59E0B',
  };

  const xpData = Object.values(learningProgress).map((prog) => ({
    name: prog.category,
    xp: prog.xp,
    level: prog.level,
    accuracy:
      prog.totalQuestionsAnswered > 0
        ? Math.round((prog.correctAnswers / prog.totalQuestionsAnswered) * 100)
        : 80,
  }));

  // Tasks by category
  const taskCategoryCounts: Record<string, number> = {};
  tasks.forEach((t) => {
    taskCategoryCounts[t.category] = (taskCategoryCounts[t.category] || 0) + 1;
  });
  const taskDistribution = Object.entries(taskCategoryCounts).map(([cat, count]) => ({
    name: cat,
    value: count,
  }));

  const PIE_COLORS = ['#6366F1', '#06B6D4', '#8B5CF6', '#10B981', '#F59E0B'];

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 uppercase tracking-wider">
            <BarChart3 className="w-4 h-4" />
            <span>Telemetry & Cognitive Metrics</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mt-1">Analytics Dashboard</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
            Inspect your genuine productivity trends, focus hours, category mastery velocity, and completion rates.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-white/[0.08] text-xs font-mono text-cyan-400">
          <Zap className="w-3.5 h-3.5" />
          <span>Productivity Score: {productivityScore}/100</span>
        </div>
      </div>

      {/* Top 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl glass-panel border border-white/[0.08] space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Weekly Focus Time</span>
            <Clock className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-white font-mono">
            {focusTimeHistory.reduce((sum, d) => sum + d.minutes, 0)} <span className="text-xs font-normal text-slate-400">mins</span>
          </div>
          <div className="text-[11px] text-indigo-400 font-mono">
            Across 7 recorded days
          </div>
        </div>

        <div className="p-5 rounded-2xl glass-panel border border-white/[0.08] space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Goal Completion</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-white font-mono">
            {completionRate}%
          </div>
          <div className="text-[11px] text-emerald-400 font-mono">
            {completedTasks.length} of {totalTasks} objectives
          </div>
        </div>

        <div className="p-5 rounded-2xl glass-panel border border-white/[0.08] space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Active Streak</span>
            <Flame className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-white font-mono">
            5 <span className="text-xs font-normal text-slate-400">days</span>
          </div>
          <div className="text-[11px] text-amber-400 font-mono">
            Target: 7-day milestone
          </div>
        </div>

        <div className="p-5 rounded-2xl glass-panel border border-white/[0.08] space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Total Quest XP</span>
            <Award className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-white font-mono">
            {xpData.reduce((acc, curr) => acc + curr.xp, 0)} <span className="text-xs font-normal text-slate-400">XP</span>
          </div>
          <div className="text-[11px] text-cyan-400 font-mono">
            Across 5 technical tracks
          </div>
        </div>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Focus Time Area Chart */}
        <div className="p-6 rounded-2xl glass-panel border border-white/[0.08] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.07]">
            <div>
              <h3 className="text-sm font-semibold text-white">Daily Focus Session Minutes</h3>
              <p className="text-[11px] text-slate-400">Logged Pomodoro and deep work blocks</p>
            </div>
            <span className="text-xs font-mono text-indigo-400">Daily Target: {user.dailyFocusTargetMinutes}m</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={focusTimeHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="focusTimeGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.0} />
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
                <Area type="monotone" dataKey="minutes" stroke="#8B5CF6" strokeWidth={2.5} fill="url(#focusTimeGradient)" name="Minutes" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Skill Mastery Breakdown Bar Chart */}
        <div className="p-6 rounded-2xl glass-panel border border-white/[0.08] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.07]">
            <div>
              <h3 className="text-sm font-semibold text-white">Skill Quest XP by Track</h3>
              <p className="text-[11px] text-slate-400">Accumulated mastery points per category</p>
            </div>
            <span className="text-xs font-mono text-cyan-400">Continuous Growth</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={xpData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderColor: 'rgba(255,255,255,0.1)',
                    borderRadius: '0.75rem',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="xp" radius={[6, 6, 0, 0]} name="XP Points">
                  {xpData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={categoryColors[entry.name] || '#6366F1'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Task Distribution & Track Accuracy Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Task Category Distribution */}
        <div className="p-6 rounded-2xl glass-panel border border-white/[0.08] space-y-4">
          <h3 className="text-sm font-semibold text-white pb-3 border-b border-white/[0.07]">
            Task Distribution by Category
          </h3>

          <div className="h-48 w-full flex items-center justify-center">
            {taskDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={taskDistribution}
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {taskDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0F172A',
                      borderColor: 'rgba(255,255,255,0.1)',
                      borderRadius: '0.75rem',
                      fontSize: '12px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-xs text-slate-500">No task data available</div>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            {taskDistribution.map((item, idx) => (
              <div key={item.name} className="flex items-center gap-1.5 text-xs text-slate-400">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }}
                />
                <span>{item.name} ({item.value})</span>
              </div>
            ))}
          </div>
        </div>

        {/* Detailed Track Accuracy Table */}
        <div className="lg:col-span-2 p-6 rounded-2xl glass-panel border border-white/[0.08] space-y-4">
          <h3 className="text-sm font-semibold text-white pb-3 border-b border-white/[0.07]">
            Category Mastery Matrix
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/[0.06] text-slate-400 font-mono">
                  <th className="pb-2.5">Category</th>
                  <th className="pb-2.5">Level</th>
                  <th className="pb-2.5">XP Earned</th>
                  <th className="pb-2.5">Drills Answered</th>
                  <th className="pb-2.5">Accuracy</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {Object.values(learningProgress).map((p) => {
                  const accuracy =
                    p.totalQuestionsAnswered > 0
                      ? Math.round((p.correctAnswers / p.totalQuestionsAnswered) * 100)
                      : 0;
                  return (
                    <tr key={p.category} className="hover:bg-slate-900/30 transition-colors">
                      <td className="py-3 font-semibold text-white flex items-center gap-2">
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: categoryColors[p.category] || '#6366F1' }}
                        />
                        {p.category}
                      </td>
                      <td className="py-3 font-mono text-cyan-400">Lvl {p.level}</td>
                      <td className="py-3 font-mono text-slate-300">{p.xp} XP</td>
                      <td className="py-3 font-mono text-slate-400">
                        {p.correctAnswers} / {p.totalQuestionsAnswered}
                      </td>
                      <td className="py-3 font-mono font-bold text-emerald-400">{accuracy}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
