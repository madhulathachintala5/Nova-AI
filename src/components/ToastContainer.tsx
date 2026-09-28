import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { useApp } from '../context/AppContext.js';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success';
        const isError = toast.type === 'error';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl border backdrop-blur-xl shadow-2xl transition-all animate-in fade-in slide-in-from-bottom-3 duration-200 ${
              isSuccess
                ? 'bg-emerald-950/80 border-emerald-500/30 text-emerald-200'
                : isError
                ? 'bg-rose-950/80 border-rose-500/30 text-rose-200'
                : 'bg-slate-900/90 border-indigo-500/30 text-slate-200'
            }`}
          >
            <div className="mt-0.5 shrink-0">
              {isSuccess && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
              {isError && <AlertCircle className="w-4 h-4 text-rose-400" />}
              {!isSuccess && !isError && <Info className="w-4 h-4 text-cyan-400" />}
            </div>

            <div className="flex-1 text-xs font-medium leading-relaxed">{toast.message}</div>

            <button
              onClick={() => removeToast(toast.id)}
              className="p-1 -mr-1 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
