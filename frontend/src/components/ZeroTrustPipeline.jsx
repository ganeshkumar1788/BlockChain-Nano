import React, { useEffect, useState, useRef, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { io } from 'socket.io-client';
import {
  CheckCircle, XCircle, Shield, Key, Fingerprint,
  Activity, Server, Play, RotateCcw, ChevronRight, Cpu, Lock, Zap
} from 'lucide-react';
import { DataContext } from '../context/DataContext';

const socket = io('http://localhost:5000');

const PIPELINE_STEPS = [
  { id: 1, label: 'Request',    icon: Activity,    desc: 'Device sends auth request' },
  { id: 2, label: 'Identity',   icon: Fingerprint, desc: 'Registry lookup' },
  { id: 3, label: 'Signature',  icon: Key,         desc: 'ECDSA verification' },
  { id: 4, label: 'Blockchain', icon: Server,      desc: 'Smart contract query' },
  { id: 5, label: 'Decision',   icon: Shield,      desc: 'Trust evaluation & access' },
];

const DEVICES = [
  { id: 'ESP32_01', type: 'Trusted',   colorKey: 'emerald' },
  { id: 'ESP32_02', type: 'Untrusted', colorKey: 'rose'    },
];

const freshStepStates = () => PIPELINE_STEPS.map(() => ({ status: 'idle', reason: null }));

const DEVICE_COLORS = {
  emerald: {
    selected:  'bg-emerald-500/15 border-emerald-500/50 text-emerald-700 dark:text-emerald-400',
    badge:     'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400',
    idle:      'bg-slate-100/60 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/50 text-slate-400',
  },
  rose: {
    selected:  'bg-rose-500/15 border-rose-500/50 text-rose-700 dark:text-rose-400',
    badge:     'bg-rose-500/20 text-rose-600 dark:text-rose-400',
    idle:      'bg-slate-100/60 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/50 text-slate-400',
  },
};

export default function ZeroTrustPipeline() {
  const { activeDeviceId, setActiveDeviceId } = useContext(DataContext);
  const [stepStates, setStepStates]       = useState(freshStepStates());
  const [isRunning, setIsRunning]         = useState(false);
  const selectedDevice = activeDeviceId;
  const setSelectedDevice = setActiveDeviceId;
  const [finalDecision, setFinalDecision] = useState(null);
  const [pipelineLogs, setPipelineLogs]   = useState([]);
  const logRef                            = useRef(null);
  const runningDeviceRef                  = useRef(selectedDevice);

  useEffect(() => { runningDeviceRef.current = selectedDevice; }, [selectedDevice]);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [pipelineLogs]);

  useEffect(() => {
    const handleAuthFlow = (data) => {
      if (data.source !== 'pipeline') return;

      const idx = data.step - 1;

      setStepStates(prev => {
        const next = [...prev];
        next[idx] = { status: data.status, reason: data.reason ?? null };
        return next;
      });

      if (data.message) {
        setPipelineLogs(prev => [
          ...prev,
          { status: data.status, message: data.message, time: new Date() },
        ].slice(-50)); // Keep only recent logs for performance
      }

      const isDone = data.status === 'rejected' || (data.step === 5 && data.status === 'success');

      if (isDone) {
        setFinalDecision({
          status: data.status === 'success' ? 'AUTHORIZED' : 'REJECTED',
          reason: data.reason,
          device: runningDeviceRef.current,
        });
        setIsRunning(false);

        setTimeout(() => {
          setFinalDecision(null);
          setStepStates(freshStepStates());
          setPipelineLogs([]);
        }, 15000); // 15s display for investor view
      }
    };

    socket.on('auth_flow', handleAuthFlow);
    return () => socket.off('auth_flow', handleAuthFlow);
  }, []);

  const runPipeline = async () => {
    if (isRunning) return;
    setIsRunning(true);
    setFinalDecision(null);
    setStepStates(freshStepStates());
    setPipelineLogs([]);

    try {
      await fetch('http://localhost:5000/api/pipeline/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ device_id: selectedDevice }),
      });
    } catch {
      setIsRunning(false);
    }
  };

  const reset = () => {
    if (isRunning) return;
    setFinalDecision(null);
    setStepStates(freshStepStates());
    setPipelineLogs([]);
  };

  const activeIdx   = stepStates.findIndex(s => s.status === 'active');
  const successCount = stepStates.filter(s => s.status === 'success').length;
  const hasFailure   = stepStates.some(s => s.status === 'rejected');
  const fillPct     = successCount / (PIPELINE_STEPS.length - 1);

  return (
    <div className="w-full relative group mb-8 mt-4 reveal active">
      {/* Animated glowing border effect */}
      <div className="absolute -inset-[1px] bg-gradient-to-r from-brand-500/0 via-brand-500/50 to-brand-500/0 rounded-[2.5rem] opacity-30 group-hover:opacity-70 transition-opacity duration-1000 blur-[2px]" />
      
      <div className="w-full glass-panel bg-slate-900/60 dark:bg-[#020617]/70 backdrop-blur-3xl rounded-[2.5rem] p-10 relative overflow-hidden border border-white/5 shadow-2xl">

        {/* Global Energy Aura */}
        <div className={`absolute -top-24 -right-24 w-64 h-64 rounded-full blur-[100px] transition-colors duration-1000 ${isRunning ? 'bg-brand-500/20' : 'bg-transparent'}`} />

        {/* Top accent line */}
        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-brand-500/70 to-transparent" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-[1px] bg-brand-400 blur-[2px]" />

        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-4">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-brand-500"></span>
            </span>
            Neural Trust Pipeline Protocol
          </h2>
          <div className="flex gap-3">
            <AnimatePresence>
              {finalDecision && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className={`text-[10px] px-4 py-2 rounded-xl font-black tracking-widest border uppercase ${finalDecision.status === 'AUTHORIZED' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-rose-500/10 border-rose-500/30 text-rose-400 animate-pulse'}`}>
                  {finalDecision.status}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-10">
          <div className="flex-1 min-w-0">
            {/* Device Controls */}
            <div className="flex items-center gap-4 mb-12">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Select Node:</span>
              <div className="flex gap-3">
                {DEVICES.map(d => (
                  <button key={d.id} onClick={() => !isRunning && setSelectedDevice(d.id)} className={`px-5 py-3 rounded-2xl border text-xs font-bold transition-all duration-300 ${activeDeviceId === d.id ? 'bg-brand-500/10 border-brand-500/50 text-brand-400 shadow-[0_0_20px_rgba(59,130,246,0.2)]' : 'bg-white/5 border-white/5 text-slate-500 hover:border-white/10'}`}>
                    {d.id}
                  </button>
                ))}
              </div>
              <div className="flex-1" />
              <button onClick={runPipeline} disabled={isRunning} className={`px-8 py-3 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all duration-300 shadow-xl ${isRunning ? 'bg-slate-800 text-slate-600' : 'bg-brand-600 hover:bg-brand-500 text-white shadow-brand-500/40 hover:scale-105 active:scale-95'}`}>
                {isRunning ? 'Encrypting...' : 'Initiate Secure Auth'}
              </button>
            </div>

            {/* Pipeline Visualization */}
            <div className="relative flex justify-between px-6 py-4 mb-16">
              {/* Connector Rails */}
              <div className="absolute top-[50%] left-0 w-full h-[3px] bg-slate-800/50 -translate-y-1/2">
                <motion.div 
                  className={`h-full origin-left ${hasFailure ? 'bg-rose-500' : 'bg-brand-500'}`} 
                  animate={{ scaleX: fillPct }} 
                  initial={{ scaleX: 0 }}
                  transition={{ duration: 0.5 }}
                />
                {/* Energy Pulse Pulse */}
                {isRunning && (
                  <motion.div 
                    className="absolute top-1/2 -translate-y-1/2 w-24 h-full bg-gradient-to-r from-transparent via-white/40 to-transparent"
                    animate={{ left: ['-20%', '120%'] }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
                  />
                )}
              </div>

              {PIPELINE_STEPS.map((step, idx) => {
                const state = stepStates[idx];
                const isActive = state.status === 'active';
                const isSuccess = state.status === 'success';
                const isFailed = state.status === 'rejected';
                
                const Icon = isFailed ? XCircle : isSuccess ? CheckCircle : step.icon;
                
                return (
                  <div key={step.id} className="relative z-10 flex flex-col items-center">
                    <motion.div 
                      animate={isActive ? { scale: 1.25, y: -10 } : { scale: 1, y: 0 }}
                      className={`w-16 h-16 rounded-3xl flex items-center justify-center border-2 transition-all duration-500 ${
                        isActive ? 'bg-brand-500/20 border-brand-500 shadow-[0_0_30px_rgba(59,130,246,0.3)]' :
                        isSuccess ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400' :
                        isFailed ? 'bg-rose-500/10 border-rose-500/50 text-rose-400' :
                        'bg-slate-900 border-white/5 text-slate-600'
                      }`}
                    >
                      <Icon className={`w-7 h-7 ${isActive ? 'text-brand-400' : ''}`} />
                      {isActive && (
                        <motion.div className="absolute inset-0 rounded-3xl border-2 border-brand-400" animate={{ scale: [1, 1.4], opacity: [0.5, 0] }} transition={{ repeat: Infinity, duration: 1 }} />
                      )}
                    </motion.div>
                    <span className={`mt-5 text-[9px] font-black uppercase tracking-[0.2em] ${isActive ? 'text-brand-400' : 'text-slate-500'}`}>{step.label}</span>
                  </div>
                );
              })}
            </div>

            {/* Status Prompt */}
            <div className="h-12 flex items-center justify-center border-t border-white/5">
                <AnimatePresence mode="wait">
                  {!isRunning && !finalDecision ? (
                    <motion.p key="p1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-[10px] text-slate-600 font-bold italic tracking-widest">AWAITING SECURE LINK INITIATION...</motion.p>
                  ) : finalDecision ? (
                    <motion.p key="p2" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className={`text-[11px] font-black tracking-[3px] uppercase ${finalDecision.status === 'AUTHORIZED' ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {finalDecision.status}: {finalDecision.reason || 'Verification Result Ready'}
                    </motion.p>
                  ) : null}
                </AnimatePresence>
            </div>
          </div>

          {/* Terminal Sidebar */}
          <div className="lg:w-80 shrink-0">
            <div className="h-full min-h-[300px] bg-black/60 rounded-[2rem] border border-white/5 overflow-hidden flex flex-col shadow-inner">
              <div className="px-6 py-4 border-b border-white/5 flex items-center gap-3">
                <div className="flex gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-rose-500/50" />
                  <div className="w-2 h-2 rounded-full bg-amber-500/50" />
                  <div className="w-2 h-2 rounded-full bg-emerald-500/50" />
                </div>
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Secure Terminal</span>
              </div>
              <div ref={logRef} className="flex-1 p-6 font-mono text-[10px] space-y-2.5 relative overflow-hidden">
                {/* Cinematic Scanlines */}
                <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />
                
                <div className="relative z-10 space-y-2.5 overflow-y-auto h-full max-h-[350px]">
                  {pipelineLogs.map((l, i) => (
                    <motion.div key={i} initial={{ opacity: 0, x: -5 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.2 }} className="flex gap-3">
                      <span className="opacity-30">[{new Date(l.time).toLocaleTimeString([], { hour12: false, fractionalSecondDigits: 3 })}]</span>
                      <span className={l.status === 'rejected' ? 'text-rose-400' : l.status === 'success' ? 'text-emerald-400' : 'text-brand-400'}>
                        {l.message}
                      </span>
                    </motion.div>
                  ))}
                  {isRunning && <motion.div animate={{ opacity: [1, 0] }} transition={{ repeat: Infinity, duration: 0.5 }} className="w-2 h-4 bg-brand-500 inline-block align-middle" />}
                  {pipelineLogs.length === 0 && !isRunning && <span className="text-slate-800 italic">SYSTEM IDLE...</span>}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
