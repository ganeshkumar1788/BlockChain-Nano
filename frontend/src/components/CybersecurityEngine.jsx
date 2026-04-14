import React, { useState } from 'react';
import { Swords, ShieldCheck, FileWarning, History, Siren } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CybersecurityEngine() {
  const [breachActive, setBreachActive] = useState(false);

  const simulateNodeAction = async (endpoint, duration) => {
    if (breachActive) return;
    if (duration > 0) {
      setBreachActive(true);
      document.body.style.boxShadow = 'inset 0 0 150px rgba(244, 63, 94, 0.4)';
    }

    try {
      await fetch(`http://localhost:5000/api/actions/${endpoint}`, { method: 'POST' });
    } catch(e) {}

    if (duration > 0) {
      setTimeout(() => {
        setBreachActive(false);
        document.body.style.boxShadow = 'none';
      }, duration);
    }
  };

  return (
    <div className="relative group reveal active" style={{ transitionDelay: '100ms' }}>
      {/* GOATED Animated Border Glow */}
      <div className={`absolute -inset-[1px] rounded-[2.5rem] opacity-30 group-hover:opacity-70 transition-all duration-1000 blur-[2px] ${breachActive ? 'bg-rose-500' : 'bg-gradient-to-br from-rose-500/50 via-purple-500/50 to-blue-500/50'}`} />
      
      <div className="glass-panel bg-slate-900/60 dark:bg-[#020617]/70 backdrop-blur-3xl rounded-[2.5rem] p-10 relative overflow-hidden border border-white/5 shadow-2xl flex flex-col">
        
        {/* Breach Alert Overlay */}
        <AnimatePresence>
          {breachActive && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-rose-500/5 pointer-events-none z-0"
              style={{ boxShadow: 'inset 0 0 100px rgba(244, 63, 94, 0.2)' }}
            />
          )}
        </AnimatePresence>

        {/* Top accent line */}
        <div className={`absolute top-0 left-0 w-full h-[2px] transition-colors duration-500 ${breachActive ? 'bg-rose-500' : 'bg-gradient-to-r from-transparent via-rose-500/50 to-transparent'}`} />
        
        <h2 className="text-sm font-black flex items-center gap-4 text-slate-400 mb-10 relative z-10 tracking-[0.2em] uppercase">
            <div className={`p-2 rounded-xl transition-colors ${breachActive ? 'bg-rose-500/20' : 'bg-rose-500/10'}`}>
              <Swords className={`w-5 h-5 ${breachActive ? 'text-rose-400' : 'text-rose-500'}`} />
            </div>
            Attack Surfaces
        </h2>
        
        <div className="space-y-4 relative z-10 flex-1">
            <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6">Target Validation Protocols</div>
            
            <button 
              onClick={() => simulateNodeAction('validate', 0)}
              className="w-full group/btn relative bg-emerald-500/5 hover:bg-emerald-500/10 border border-emerald-500/20 hover:border-emerald-500/50 text-emerald-400/80 hover:text-emerald-400 font-bold py-5 px-6 rounded-2xl transition-all duration-300 flex items-center gap-4 overflow-hidden"
            >
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-emerald-500/5 to-emerald-500/0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000" />
                <ShieldCheck className="h-5 w-5 shrink-0 opacity-70 group-hover/btn:opacity-100" />
                <span className="text-xs uppercase tracking-widest">Verify Secure Key</span>
            </button>
            
            <button 
              onClick={() => simulateNodeAction('tamper', 0)}
              className="w-full group/btn relative bg-amber-500/5 hover:bg-amber-500/10 border border-amber-500/20 hover:border-amber-500/50 text-amber-400/80 hover:text-amber-400 font-bold py-5 px-6 rounded-2xl transition-all duration-300 flex items-center gap-4 overflow-hidden"
            >
                <div className="absolute inset-0 bg-gradient-to-r from-amber-500/0 via-amber-500/5 to-amber-500/0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000" />
                <FileWarning className="h-5 w-5 shrink-0 opacity-70 group-hover/btn:opacity-100" />
                <span className="text-xs uppercase tracking-widest">Inject Falsified ID</span>
            </button>

            <button 
              onClick={() => simulateNodeAction('replay', 0)}
              className="w-full group/btn relative bg-blue-500/5 hover:bg-blue-500/10 border border-blue-500/20 hover:border-blue-500/50 text-blue-400/80 hover:text-blue-400 font-bold py-5 px-6 rounded-2xl transition-all duration-300 flex items-center gap-4 overflow-hidden"
            >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/5 to-blue-500/0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000" />
                <History className="h-5 w-5 shrink-0 opacity-70 group-hover/btn:opacity-100" />
                <span className="text-xs uppercase tracking-widest">Epoch Replay Attack</span>
            </button>

            <div className="pt-8 border-t border-white/5 mt-auto">
                <div className="text-[10px] font-black text-rose-500 uppercase tracking-[0.2em] mb-6 flex justify-between items-center px-1">
                    Threat Simulator
                    <span className="animate-pulse bg-rose-500/10 text-rose-400 border border-rose-500/20 px-3 py-1 rounded-full text-[9px] font-black">ACTIVE NODE DROP</span>
                </div>
                <button 
                  onClick={() => simulateNodeAction('simulate-attack', 5000)}
                  disabled={breachActive}
                  className={`w-full group/breach relative text-white font-black py-6 px-4 rounded-2xl transition-all duration-500 flex justify-center items-center gap-4 active:scale-[0.97] overflow-hidden shadow-2xl ${
                    breachActive 
                      ? 'bg-rose-950/50 border border-rose-500/20 text-rose-400/50 cursor-not-allowed shadow-none' 
                      : 'bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 shadow-rose-500/20 border border-rose-400/30'
                  }`}
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/breach:translate-x-full transition-transform duration-1000" />
                    <Siren className={`h-5 w-5 shrink-0 ${breachActive ? 'animate-spin' : 'animate-bounce'}`} />
                    <span className="text-xs uppercase tracking-[0.2em] font-black">{breachActive ? 'System Lockdown Active...' : 'Simulate Global Breach'}</span>
                </button>
            </div>
        </div>
      </div>
    </div>
  );
}
