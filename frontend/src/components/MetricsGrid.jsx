import React, { useContext } from 'react';
import { Activity, ShieldAlert, Hash } from 'lucide-react';
import { DataContext } from '../context/DataContext';

export default function MetricsGrid() {
  const { events, lastHash, globalThreatLevel } = useContext(DataContext);
  const reqCount = events.length;
  const threatLevel = globalThreatLevel;
  const lastTx = lastHash;

  return (
    <div id="demo-section" className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-8 reveal active pt-10">
        <div className="glass-panel p-5 rounded-2xl flex items-center gap-4">
            <div className="p-3.5 bg-brand-500/10 text-brand-600 dark:text-brand-400 rounded-xl">
              <Activity />
            </div>
            <div>
                <div className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mb-0.5">Total Requests</div>
                <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">{reqCount}</div>
            </div>
        </div>
        
        <div className={`glass-panel p-5 rounded-2xl flex items-center gap-4 transition-all duration-300 ${threatLevel === 'Critical' ? 'threat-glow' : ''}`}>
            <div className={`p-3.5 rounded-xl transition-colors duration-300 ${
              threatLevel === 'Critical' ? 'bg-rose-500/20 text-rose-600 dark:text-rose-400' :
              threatLevel === 'Elevated' ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400' :
              'bg-slate-500/10 text-slate-600 dark:text-slate-400'
            }`}>
                <ShieldAlert />
            </div>
            <div>
                <div className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mb-0.5">Threat Level</div>
                <div className="text-2xl font-black text-slate-900 dark:text-white transition-colors">{threatLevel}</div>
            </div>
        </div>
        
        <div className="glass-panel p-5 rounded-2xl flex items-center gap-4 col-span-2">
            <div className="p-3.5 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-xl shrink-0"><Hash /></div>
            <div className="overflow-hidden w-full">
                <div className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mb-0.5">Last Transaction Hash</div>
                <div className="text-sm font-bold text-slate-900 dark:text-white font-mono truncate">{lastTx}</div>
            </div>
        </div>
    </div>
  );
}
