import React, { useEffect } from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, X, ChevronRight, Smartphone } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const ToastBanner: React.FC = () => {
  const { toastBanner, setToastBanner } = useApp();

  useEffect(() => {
    if (!toastBanner) return;
    // Auto dismiss after 7 seconds
    const timer = setTimeout(() => {
      setToastBanner(null);
    }, 7000);
    return () => clearTimeout(timer);
  }, [toastBanner, setToastBanner]);

  if (!toastBanner) return null;

  const isSuccess = toastBanner.type === 'success';
  const isWarning = toastBanner.type === 'warning';
  const isError = toastBanner.type === 'error';

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-lg px-4 pointer-events-none animate-in fade-in slide-in-from-top-4 duration-300">
      <div
        className={`pointer-events-auto rounded-2xl p-3.5 shadow-2xl backdrop-blur-xl border flex items-center justify-between gap-3 text-xs font-medium transition-all ${
          isSuccess
            ? 'bg-emerald-900/90 text-white border-emerald-500/30 shadow-emerald-950/20'
            : isWarning
            ? 'bg-slate-900/95 text-white border-amber-400/30 shadow-black/30'
            : 'bg-rose-950/95 text-white border-rose-500/30 shadow-rose-950/20'
        }`}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${
              isSuccess
                ? 'bg-[#00B900] text-white shadow-xs'
                : isWarning
                ? 'bg-amber-500 text-slate-900 shadow-xs'
                : 'bg-rose-500 text-white shadow-xs'
            }`}
          >
            {isSuccess && <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />}
            {isWarning && <Smartphone className="w-4 h-4" />}
            {isError && <AlertCircle className="w-4 h-4" />}
          </div>

          <div className="min-w-0 leading-tight">
            <div className="font-bold text-[11px] uppercase tracking-wider opacity-80 flex items-center gap-1.5">
              <span>{isSuccess ? 'LINE Official Account' : isWarning ? 'LINE Simulator Notification' : 'ข้อผิดพลาด LINE'}</span>
            </div>
            <div className="text-xs text-white/95 mt-0.5 font-sans break-words">
              {toastBanner.message}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {toastBanner.actionText && toastBanner.onAction && (
            <button
              onClick={() => {
                toastBanner.onAction?.();
                setToastBanner(null);
              }}
              className="px-2.5 py-1 bg-white/20 hover:bg-white/30 text-white font-bold rounded-lg text-xs transition-colors flex items-center gap-1 cursor-pointer whitespace-nowrap active:scale-95"
            >
              <span>{toastBanner.actionText}</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          )}

          <button
            onClick={() => setToastBanner(null)}
            className="p-1 hover:bg-white/20 rounded-lg text-white/70 hover:text-white transition-colors cursor-pointer"
            title="ปิดการแจ้งเตือน"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
