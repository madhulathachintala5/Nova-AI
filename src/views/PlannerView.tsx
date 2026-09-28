import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  Plus,
  Sparkles,
  CheckCircle2,
  Circle,
  Clock,
  Trash2,
  Edit2,
  AlertTriangle,
  ArrowRight,
  Filter,
  Check,
  RotateCcw,
  Zap,
} from 'lucide-react';
import { useApp } from '../context/AppContext.js';
import { Task, Priority } from '../types/index.js';

export const PlannerView: React.FC = () => {
  const {
    tasks,
    addTask,
    updateTask,
    deleteTask,
    moveUnfinishedTasksToTomorrow,
    addToast,
  } = useApp();

  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [viewMode, setViewMode] = useState<'day' | 'week'>('day');

  // New task modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<'Study' | 'Code' | 'Life' | 'Work' | 'Revision'>('Study');
  const [newPriority, setNewPriority] = useState<Priority>('medium');
  const [newDuration, setNewDuration] = useState<number>(45);
  const [newTimeSlot, setNewTimeSlot] = useState<string>('09:00 - 10:00');

  // AI schedule generator state
  const [isGeneratingSchedule, setIsGeneratingSchedule] = useState(false);
  const [aiScheduleProposal, setAiScheduleProposal] = useState<{
    scheduleSummary: string;
    timeBlocks: Array<{ time: string; taskTitle: string; category: string; durationMinutes: number; type: string }>;
    productivityTip: string;
  } | null>(null);

  const completedCount = tasks.filter((t) => t.completed).length;
  const progressPercent = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    addTask({
      title: newTitle.trim(),
      category: newCategory,
      priority: newPriority,
      estimatedMinutes: Number(newDuration) || 30,
      completed: false,
      dueDate: selectedDate,
      timeSlot: newTimeSlot.trim() || undefined,
    });

    setNewTitle('');
    setShowAddModal(false);
  };

  const handleGenerateAiSchedule = async () => {
    setIsGeneratingSchedule(true);
    setAiScheduleProposal(null);
    try {
      const res = await fetch('/api/planner/generate-schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tasks: tasks.filter((t) => !t.completed),
          date: selectedDate,
          availableHours: 8,
        }),
      });

      if (!res.ok) throw new Error('Schedule generation failed');
      const data = await res.json();
      setAiScheduleProposal(data);
    } catch (err: any) {
      console.error(err);
      addToast('Error generating AI schedule: ' + err.message, 'error');
    } finally {
      setIsGeneratingSchedule(false);
    }
  };

  const applyAiSchedule = () => {
    if (!aiScheduleProposal) return;
    // For each block that is focus/review, if task exists or create new
    for (const block of aiScheduleProposal.timeBlocks) {
      if (block.type !== 'break') {
        const existing = tasks.find((t) => t.title.toLowerCase() === block.taskTitle.toLowerCase());
        if (existing) {
          updateTask(existing.id, { timeSlot: block.time, estimatedMinutes: block.durationMinutes });
        } else {
          addTask({
            title: block.taskTitle,
            category: (block.category as any) || 'Study',
            priority: 'high',
            estimatedMinutes: block.durationMinutes,
            completed: false,
            dueDate: selectedDate,
            timeSlot: block.time,
          });
        }
      }
    }
    setAiScheduleProposal(null);
    addToast('AI Schedule applied to your Day Planner!', 'success');
  };

  const filteredTasks = tasks.filter((t) => {
    if (activeFilter !== 'all' && t.category.toLowerCase() !== activeFilter.toLowerCase()) {
      return false;
    }
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 uppercase tracking-wider">
            <CalendarIcon className="w-4 h-4" />
            <span>Time-Blocked Schedule</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mt-1">
            AI Day Planner
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
            Prioritize objectives, automatically sequence high cognitive load blocks, and reschedule unfinished work seamlessly.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Unfinished tasks reschedule */}
          <button
            onClick={moveUnfinishedTasksToTomorrow}
            className="px-3.5 py-2 rounded-xl bg-slate-900 border border-white/[0.08] hover:border-amber-500/40 text-slate-300 hover:text-white text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
            <span>Move Incomplete to Tomorrow</span>
          </button>

          {/* AI Schedule Generator */}
          <button
            onClick={handleGenerateAiSchedule}
            disabled={isGeneratingSchedule}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600 text-white font-medium text-xs flex items-center gap-1.5 shadow-lg shadow-indigo-500/20 disabled:opacity-50 transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
            <span>{isGeneratingSchedule ? 'Generating AI Blocks...' : 'Generate AI Schedule'}</span>
          </button>

          {/* Add Task Button */}
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs flex items-center gap-1.5 shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Task</span>
          </button>
        </div>
      </div>

      {/* Progress & Category Filters Bar */}
      <div className="p-5 rounded-2xl glass-panel border border-white/[0.08] flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Progress */}
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="text-2xl font-bold text-white font-mono">{progressPercent}%</div>
          <div className="flex-1 md:w-48 space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
              <span>Day Completion</span>
              <span>{completedCount}/{tasks.length} Done</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-900/80 rounded-xl border border-white/[0.06]">
          {['all', 'study', 'code', 'revision', 'life', 'work'].map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${
                activeFilter === f
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* AI Schedule Proposal Modal / Banner if generated */}
      {aiScheduleProposal && (
        <div className="p-6 rounded-2xl glass-panel-elevated border border-indigo-500/40 shadow-2xl space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-semibold text-white">AI-Proposed Daily Schedule</h3>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setAiScheduleProposal(null)}
                className="text-xs text-slate-400 hover:text-white px-2 py-1"
              >
                Dismiss
              </button>
              <button
                onClick={applyAiSchedule}
                className="px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs transition-colors flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Save to Planner</span>
              </button>
            </div>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            {aiScheduleProposal.scheduleSummary}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {aiScheduleProposal.timeBlocks.map((block, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-xl border text-xs space-y-1 ${
                  block.type === 'break'
                    ? 'bg-slate-900/30 border-white/[0.04] text-slate-500'
                    : 'bg-indigo-950/20 border-indigo-500/20 text-slate-200'
                }`}
              >
                <div className="flex items-center justify-between font-mono text-[11px] text-cyan-400">
                  <span>{block.time}</span>
                  <span className="capitalize">{block.type}</span>
                </div>
                <div className="font-semibold truncate text-white">{block.taskTitle}</div>
                <div className="text-[10px] text-slate-400">
                  {block.category} · {block.durationMinutes} mins
                </div>
              </div>
            ))}
          </div>

          <div className="text-[11px] text-slate-400 italic">
            💡 Tip: {aiScheduleProposal.productivityTip}
          </div>
        </div>
      )}

      {/* Task List */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="p-12 rounded-2xl glass-panel border border-white/[0.08] text-center space-y-3">
            <div className="w-10 h-10 rounded-xl bg-slate-800 text-slate-400 mx-auto flex items-center justify-center">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-semibold text-white">No tasks in this view</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Add your first task or use AI to generate an exam preparation schedule.
            </p>
          </div>
        ) : (
          filteredTasks.map((task) => (
            <div
              key={task.id}
              className={`p-4 rounded-2xl glass-panel border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                task.completed
                  ? 'border-white/[0.04] bg-slate-900/20 opacity-60'
                  : 'border-white/[0.08] hover:border-indigo-500/40 bg-slate-900/50'
              }`}
            >
              <div className="flex items-start sm:items-center gap-3.5">
                <button
                  onClick={() => updateTask(task.id, { completed: !task.completed })}
                  className="mt-0.5 sm:mt-0 text-slate-500 hover:text-cyan-400 transition-colors"
                >
                  {task.completed ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <Circle className="w-5 h-5" />
                  )}
                </button>

                <div className="space-y-1">
                  <div className={`text-sm font-semibold ${task.completed ? 'line-through text-slate-400' : 'text-white'}`}>
                    {task.title}
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                    <span className="font-medium text-indigo-300">{task.category}</span>
                    <span>·</span>
                    <span className="flex items-center gap-1 font-mono text-[11px]">
                      <Clock className="w-3 h-3 text-slate-500" /> {task.estimatedMinutes}m
                    </span>
                    {task.timeSlot && (
                      <>
                        <span>·</span>
                        <span className="font-mono text-cyan-400 text-[11px]">{task.timeSlot}</span>
                      </>
                    )}
                    <span>·</span>
                    <span>Due {task.dueDate}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/[0.05]">
                {/* Priority */}
                <span
                  className={`text-[11px] font-mono uppercase tracking-wider ${
                    task.priority === 'high'
                      ? 'text-rose-400 font-bold'
                      : task.priority === 'medium'
                      ? 'text-amber-400 font-medium'
                      : 'text-slate-400'
                  }`}
                >
                  {task.priority} Priority
                </span>

                <button
                  onClick={() => deleteTask(task.id)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                  title="Delete task"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Task Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-150">
          <div
            className="w-full max-w-lg rounded-2xl glass-panel-elevated p-6 border border-white/10 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <h3 className="text-base font-semibold text-white">Create New Task</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white text-xs"
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Task Title
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Master Normalization & B+ Trees"
                  className="w-full glass-input rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e: any) => setNewCategory(e.target.value)}
                    className="w-full glass-input rounded-xl px-3 py-2 text-xs text-white"
                  >
                    <option value="Study" className="bg-[#080B16]">Study</option>
                    <option value="Code" className="bg-[#080B16]">Code</option>
                    <option value="Revision" className="bg-[#080B16]">Revision</option>
                    <option value="Life" className="bg-[#080B16]">Life</option>
                    <option value="Work" className="bg-[#080B16]">Work</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Priority</label>
                  <select
                    value={newPriority}
                    onChange={(e: any) => setNewPriority(e.target.value)}
                    className="w-full glass-input rounded-xl px-3 py-2 text-xs text-white"
                  >
                    <option value="high" className="bg-[#080B16]">High Priority</option>
                    <option value="medium" className="bg-[#080B16]">Medium Priority</option>
                    <option value="low" className="bg-[#080B16]">Low Priority</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Duration (Mins)</label>
                  <input
                    type="number"
                    value={newDuration}
                    onChange={(e) => setNewDuration(Number(e.target.value))}
                    min={5}
                    max={240}
                    className="w-full glass-input rounded-xl px-3 py-2 text-xs text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Time Block</label>
                  <input
                    type="text"
                    value={newTimeSlot}
                    onChange={(e) => setNewTimeSlot(e.target.value)}
                    placeholder="e.g. 10:00 - 11:30"
                    className="w-full glass-input rounded-xl px-3 py-2 text-xs text-white font-mono"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs shadow-lg shadow-indigo-900/30"
                >
                  Add Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
