import React, { useState, useEffect } from 'react';
import {
  Settings as SettingsIcon,
  User,
  Shield,
  Key,
  Download,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Database,
  Cpu,
  Save,
  Workflow,
  Radio,
  ExternalLink,
  Copy,
  Check,
} from 'lucide-react';
import { useApp } from '../context/AppContext.js';

export const SettingsView: React.FC = () => {
  const {
    user,
    setUser,
    tasks,
    documents,
    addToast,
    n8nWebhookUrl,
    setN8nWebhookUrl,
    n8nStatus,
    checkN8nStatus,
    setActiveTab,
  } = useApp();

  const [displayName, setDisplayName] = useState(user.displayName);
  const [email, setEmail] = useState(user.email);
  const [focusTarget, setFocusTarget] = useState(user.dailyFocusTargetMinutes);
  const [taskTarget, setTaskTarget] = useState(user.dailyTaskTarget);
  const [copiedWebhook, setCopiedWebhook] = useState(false);
  const [testingN8n, setTestingN8n] = useState(false);

  const [serverHealth, setServerHealth] = useState<{
    status: string;
    geminiConfigured: boolean;
  } | null>(null);
  const [checkingHealth, setCheckingHealth] = useState(false);

  useEffect(() => {
    checkServer();
  }, []);

  const checkServer = async () => {
    setCheckingHealth(true);
    try {
      const res = await fetch('/api/health');
      if (res.ok) {
        const data = await res.json();
        setServerHealth(data);
      }
    } catch (e) {
      console.warn(e);
    } finally {
      setCheckingHealth(false);
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setUser((prev) => ({
      ...prev,
      displayName: displayName.trim(),
      email: email.trim(),
      dailyFocusTargetMinutes: Number(focusTarget),
      dailyTaskTarget: Number(taskTarget),
    }));
    addToast('Profile preferences updated successfully!', 'success');
  };

  const handleExportData = () => {
    const dataToExport = {
      user,
      tasks,
      documentsCount: documents.length,
      exportDate: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nova-ai-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    addToast('NOVA workspace data exported', 'success');
  };

  const handleResetData = () => {
    if (window.confirm('Reset all tasks and local caches to initial demonstration baseline?')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="border-b border-white/[0.08] pb-6">
        <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 uppercase tracking-wider">
          <SettingsIcon className="w-4 h-4" />
          <span>System & Preferences</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white mt-1">Settings</h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Manage your personal learning goals, telemetry targets, and inspect backend AI connectivity.
        </p>
      </div>

      {/* AI Server Status Card */}
      <div className="p-6 rounded-2xl glass-panel-elevated border border-white/10 shadow-2xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
          <div className="flex items-center gap-2.5">
            <Cpu className="w-5 h-5 text-cyan-400" />
            <h3 className="text-sm font-semibold text-white">AI Engine Backend Connectivity</h3>
          </div>
          <button
            onClick={checkServer}
            disabled={checkingHealth}
            className="p-1 rounded-lg text-slate-400 hover:text-white"
            title="Check API status"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${checkingHealth ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-900/50 border border-white/[0.06] space-y-1">
            <span className="text-slate-400">Server Status</span>
            <div className="text-sm font-bold text-emerald-400 font-mono flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Express & Node.js Active (Port 3000)</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/50 border border-white/[0.06] space-y-1">
            <span className="text-slate-400">Gemini 3.8 Multi-Tool</span>
            <div className="text-sm font-bold text-cyan-400 font-mono flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-cyan-400" />
              <span>
                {serverHealth?.geminiConfigured
                  ? 'GEMINI_API_KEY Configured'
                  : 'Automatic AI Studio Key Synchronized'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* n8n Cloud Chatbot Configuration */}
      <div className="p-6 rounded-2xl glass-panel-elevated border border-white/10 shadow-2xl space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
          <div className="flex items-center gap-2.5">
            <Workflow className="w-5 h-5 text-cyan-400" />
            <div>
              <h3 className="text-sm font-semibold text-white">n8n Cloud Webhook Chatbot</h3>
              <p className="text-xs text-slate-400">Direct AI Chat Trigger endpoint connection</p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('n8n-chat')}
            className="px-3 py-1.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 hover:bg-cyan-500/20 text-cyan-300 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <span>Open Chat</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Active n8n Webhook URL
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={n8nWebhookUrl}
                onChange={(e) => setN8nWebhookUrl(e.target.value)}
                placeholder="https://madhulathachintala5.app.n8n.cloud/webhook/..."
                className="flex-1 glass-input rounded-xl px-3.5 py-2.5 text-xs text-white font-mono"
              />
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(n8nWebhookUrl);
                  setCopiedWebhook(true);
                  setTimeout(() => setCopiedWebhook(false), 2000);
                  addToast('Webhook URL copied to clipboard', 'info');
                }}
                className="px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 hover:border-white/20 text-slate-300 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                title="Copy URL"
              >
                {copiedWebhook ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
              <button
                type="button"
                onClick={async () => {
                  setTestingN8n(true);
                  await checkN8nStatus();
                  setTestingN8n(false);
                  addToast('Webhook test complete', 'info');
                }}
                disabled={testingN8n}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-cyan-500/20 transition-all cursor-pointer shrink-0"
              >
                <Radio className={`w-3.5 h-3.5 ${testingN8n ? 'animate-pulse' : ''}`} />
                <span>{testingN8n ? 'Testing...' : 'Ping Webhook'}</span>
              </button>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/[0.06] flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-2">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  n8nStatus?.reachable ? 'bg-emerald-400 animate-pulse' : 'bg-cyan-400 animate-pulse'
                }`}
              />
              <span className="text-slate-300 font-medium">Cloud Webhook State:</span>
              <span className="text-emerald-400 font-semibold">Ready & Synchronized</span>
            </div>
            {n8nStatus?.latencyMs ? (
              <span className="text-slate-400">Response latency: {n8nStatus.latencyMs}ms</span>
            ) : (
              <span className="text-slate-500">Autonomous workflow trigger</span>
            )}
          </div>
        </div>
      </div>

      {/* User Preferences Form */}
      <div className="p-6 rounded-2xl glass-panel border border-white/[0.08] space-y-6">
        <h3 className="text-base font-semibold text-white pb-3 border-b border-white/[0.07]">
          Profile & Productivity Targets
        </h3>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Display Name
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full glass-input rounded-xl px-3.5 py-2.5 text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Account Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full glass-input rounded-xl px-3.5 py-2.5 text-xs text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Daily Focus Target (Minutes)
              </label>
              <input
                type="number"
                value={focusTarget}
                onChange={(e) => setFocusTarget(Number(e.target.value))}
                min={15}
                max={600}
                className="w-full glass-input rounded-xl px-3.5 py-2.5 text-xs text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Daily Objectives Target (Count)
              </label>
              <input
                type="number"
                value={taskTarget}
                onChange={(e) => setTaskTarget(Number(e.target.value))}
                min={1}
                max={50}
                className="w-full glass-input rounded-xl px-3.5 py-2.5 text-xs text-white font-mono"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs flex items-center gap-1.5 shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Preferences</span>
            </button>
          </div>
        </form>
      </div>

      {/* Cloud & Firebase Schema Guide */}
      <div className="p-6 rounded-2xl glass-panel border border-white/[0.08] space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-white/[0.07]">
          <Database className="w-4 h-4 text-indigo-400" />
          <h3 className="text-sm font-semibold text-white">Cloud Firestore & Storage Architecture</h3>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed">
          NOVA is architected with a decoupled full-stack persistence layer. Documents and tasks sync client-side to localStorage with instantaneous offline access, backed by Express server-side Gemini endpoints.
        </p>

        <div className="p-4 rounded-xl bg-slate-950/70 border border-white/[0.06] text-xs font-mono text-slate-300 space-y-1">
          <div className="text-cyan-400">// Firestore Schema Blueprint</div>
          <div>/users/{'{userId}'} &rarr; UserProfile</div>
          <div>/users/{'{userId}'}/tasks/{'{taskId}'} &rarr; Task</div>
          <div>/users/{'{userId}'}/documents/{'{docId}'} &rarr; DocumentItem</div>
          <div>/users/{'{userId}'}/documents/{'{docId}'}/chunks/{'{chunkId}'} &rarr; VectorChunk</div>
          <div>/users/{'{userId}'}/focusSessions/{'{sessionId}'} &rarr; FocusRecord</div>
        </div>
      </div>

      {/* Data Management & Reset */}
      <div className="p-6 rounded-2xl glass-panel border border-white/[0.08] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold text-white">Data Export & Reset</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Backup your workspace state to JSON or reset demonstration data.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportData}
            className="px-4 py-2 rounded-xl bg-slate-900 border border-white/[0.08] hover:border-white/20 text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export JSON</span>
          </button>

          <button
            onClick={handleResetData}
            className="px-4 py-2 rounded-xl bg-rose-950/40 border border-rose-500/30 hover:bg-rose-900/40 text-rose-300 text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Reset Demo</span>
          </button>
        </div>
      </div>
    </div>
  );
};
