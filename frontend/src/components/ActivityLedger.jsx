import React, { useContext } from 'react';
import { Terminal, Satellite } from 'lucide-react';
import { DataContext } from '../context/DataContext';

export default function ActivityLedger() {
  const { logs } = useContext(DataContext);

  return (
    <div className="glass-panel rounded-3xl p-7 reveal active flex flex-col h-[380px]" style={{ transitionDelay: '400ms' }}>
        <div className="flex justify-between items-center border-b border-slate-200/50 dark:border-slate-700/50 pb-5 mb-5">
            <h2 className="text-lg font-bold flex items-center gap-3 text-slate-900 dark:text-white">
                <div className="p-2 bg-slate-500/10 rounded-lg"><Terminal className="text-slate-600 dark:text-slate-400 w-5 h-5" /></div>
                Activity Ledger
            </h2>
            <span className="flex items-center gap-2 px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full">
                <span className="animate-pulse h-2 w-2 bg-emerald-500 rounded-full"></span>
                <span className="text-xs font-mono font-semibold text-slate-600 dark:text-slate-400">Live Stream</span>
            </span>
        </div>
        
        <div className="flex-1 overflow-y-auto pr-3 space-y-3 scroll-smooth font-mono text-sm relative">
            {logs.length === 0 ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 opacity-80" id="empty-log">
                    <Satellite className="w-10 h-10 mb-3 animate-pulse opacity-50" />
                    <span className="font-sans font-medium text-sm">Awaiting cryptographic events...</span>
                </div>
            ) : (
                logs.map((L, i) => {
                    const isSuccess = L.type === 'success';
                    const isError = L.type === 'error';
                    const isWarn = L.type === 'warning';

                    const bg = isSuccess ? 'bg-emerald-500/5 dark:bg-emerald-500/10' : isError ? 'bg-rose-500/5 dark:bg-rose-500/10' : isWarn ? 'bg-amber-500/5 dark:bg-amber-500/10' : 'bg-white/50 dark:bg-slate-800/50';
                    const border = isSuccess ? 'border-emerald-500/20' : isError ? 'border-rose-500/30' : isWarn ? 'border-amber-500/30' : 'border-slate-200/50 dark:border-slate-700/50';
                    const dot = isSuccess ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]' : isError ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)] animate-pulse' : isWarn ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]' : 'bg-brand-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]';
                    const text = isSuccess ? 'text-emerald-700 dark:text-emerald-400 font-bold' : isError ? 'text-rose-700 dark:text-rose-400 font-bold' : isWarn ? 'text-amber-700 dark:text-amber-400 font-bold' : 'text-slate-700 dark:text-slate-300';

                    const messageParts = L.message.split('->');
                    
                    return (
                        <div key={i} className={`p-3.5 rounded-xl border text-sm flex flex-col gap-1.5 transition-all duration-300 ${bg} ${border}`}>
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-3">
                                    <div className={`w-2 h-2 rounded-full shrink-0 ${dot}`}></div>
                                    <div className="font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider text-[11px]">{messageParts[0]}</div>
                                </div>
                                <div className="text-[10px] text-slate-500 font-sans tracking-wide shrink-0">
                                    {new Date(L.timestamp).toLocaleTimeString()}
                                </div>
                            </div>
                            {messageParts.length > 1 && (
                                <div className={`pl-5 font-semibold text-[11px] transition-colors ${text}`}>
                                    {messageParts.slice(1).join('->').trim()}
                                </div>
                            )}
                        </div>
                    );
                })
            )}
        </div>
    </div>
  );
}
