import React, { useEffect, useState, useRef, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { io } from 'socket.io-client';
import {
  CheckCircle, XCircle, Shield, Key, Fingerprint,
  Activity, Server, Play, RotateCcw, Lock, Zap, Terminal
} from 'lucide-react';
import { DataContext } from '../context/DataContext';

const socket = io(`http://${window.location.hostname}:5000`);

const PIPELINE_STEPS = [
  { 
    id: 1, 
    key: 'request',
    label: 'Incoming Request',   
    icon: Activity,    
    statusText: 'Analyzing'
  },
  { 
    id: 2, 
    key: 'identity',
    label: 'Biometric Validation',  
    icon: Fingerprint, 
    statusText: 'Validating'
  },
  { 
    id: 3, 
    key: 'signature',
    label: 'Digital Signature Check', 
    icon: Key,         
    statusText: 'Verifying'
  },
  { 
    id: 4, 
    key: 'blockchain',
    label: 'Ledger Verification',
    icon: Server,      
    statusText: 'Synchronizing'
  },
  { 
    id: 5, 
    key: 'decision',
    label: 'Access Decision',  
    icon: Shield,      
    statusText: 'Authorizing'
  },
];

const DEVICES = [
  { id: 'ESP32_01', type: 'Industry Node',   colorKey: 'emerald' },
  { id: 'ESP32_02', type: 'Transport Node',  colorKey: 'emerald' },
  { id: 'ESP32_03', type: 'Untrusted Node', colorKey: 'rose'    },
];

const freshStepStates = () => PIPELINE_STEPS.map(() => ({ 
    status: 'idle', 
    signature: null, 
    trustScore: null,
}));

export default function ZeroTrustPipeline() {
  const { activeDeviceId, setActiveDeviceId, updatePipelineMonitor } = useContext(DataContext);
  const [stepStates, setStepStates]           = useState(freshStepStates());
  const [isRunning, setIsRunning]             = useState(false);
  const [activeStep, setActiveStep]           = useState(0);
  const [finalDecision, setFinalDecision]     = useState(null);
  const [logs, setLogs]                       = useState([]);
  const terminalRef                           = useRef(null);
  
  const runningDeviceRef                      = useRef(activeDeviceId);
  useEffect(() => { runningDeviceRef.current = activeDeviceId; }, [activeDeviceId]);

  // Auto-scroll terminal
  useEffect(() => {
    if (terminalRef.current) {
        terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [logs]);

  useEffect(() => {
    const handleAuthFlow = (data) => {
      if (data.source !== 'pipeline') return;

      const idx = data.step - 1;
      setActiveStep(idx);

      setStepStates(prev => {
        const next = [...prev];
        next[idx] = { 
            ...next[idx],
            status: data.status, 
            signature: data.signature ?? prev[idx].signature,
            trustScore: data.trustScore ?? prev[idx].trustScore
        };
        return next;
      });

      // Terminal Logs logic
      const stepName = PIPELINE_STEPS[idx].label;
      const time = new Date().toISOString().split('T')[1].replace('Z', '');
      let logMsg = '';
      let logType = 'info';

      if (data.status === 'processing') {
          logMsg = `[${stepName}] Initializing verification sequence...`;
      } else if (data.status === 'success') {
          logMsg = `[${stepName}] SUCCESS.`;
          logType = 'success';
          if (data.signature) {
             const shortSig = `${data.signature.substring(0, 8)}...${data.signature.substring(data.signature.length - 8)}`;
             logMsg += ` Signature verified: 0x${shortSig}`;
          }
      } else if (data.status === 'rejected') {
          logMsg = `[${stepName}] FAILED/REJECTED. Authentication halted.`;
          logType = 'error';
      }

      if (logMsg) {
          setLogs(prev => [...prev, { time, text: logMsg, type: logType }]);
      }

      if (data.trustScore !== undefined && data.trustScore !== null) {
        updatePipelineMonitor({ trustScore: data.trustScore });
      }

      const isDone = data.isFinal || data.status === 'rejected' || (data.step === 5 && data.status === 'success');

      if (isDone) {
        const isTrusted = ['ESP32_01', 'ESP32_02'].includes(runningDeviceRef.current);
        const stText = (data.status === 'success' && data.message !== 'ACCESS DENIED') ? 'ACCESS GRANTED' : 'ACCESS DENIED';
        
        setFinalDecision({
          status: stText,
          message: isTrusted ? 'TRUSTED DEVICE VERIFIED' : 'DEVICE NOT TRUSTED',
          type: stText === 'ACCESS GRANTED' ? 'success' : 'error'
        });
        
        setLogs(prev => [...prev, { 
            time: new Date().toISOString().split('T')[1].replace('Z', ''), 
            text: `[SYSTEM] ${stText}. Connection ${stText === 'ACCESS GRANTED' ? 'established' : 'terminated'}.`, 
            type: stText === 'ACCESS GRANTED' ? 'success' : 'error' 
        }]);

        setIsRunning(false);

        setTimeout(() => {
          setFinalDecision(null);
          setStepStates(freshStepStates());
          setActiveStep(0);
          setLogs([]);
        }, 3000); 
      }
    };

    socket.on('auth_flow', handleAuthFlow);
    return () => socket.off('auth_flow', handleAuthFlow);
  }, [updatePipelineMonitor]);

  const runPipeline = async () => {
    if (isRunning) return;
    setIsRunning(true);
    setFinalDecision(null);
    setStepStates(freshStepStates());
    setActiveStep(0);
    setLogs([{
        time: new Date().toISOString().split('T')[1].replace('Z', ''),
        text: `[SYSTEM] Beginning target validation for Node [${activeDeviceId}]...`,
        type: 'info'
    }]);

    try {
      await fetch(`http://${window.location.hostname}:5000/api/pipeline/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ device_id: activeDeviceId }),
      });
    } catch {
      setIsRunning(false);
      setLogs(prev => [...prev, {
        time: new Date().toISOString().split('T')[1].replace('Z', ''),
        text: `[SYSTEM] ERROR: Failed to connect to verification server.`,
        type: 'error'
      }]);
    }
  };

  return (
    <div className="w-full relative mb-16 mt-8">
        <div className="w-full glass-panel bg-white/5 backdrop-blur-3xl rounded-[2.5rem] p-8 lg:p-12 relative overflow-hidden border border-white/10 shadow-2xl">
            
            {/* Header section */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-16 relative z-20">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-brand-500/20 flex items-center justify-center border border-brand-500/30">
                        <Zap className="text-brand-500 h-5 w-5 animate-pulse" />
                    </div>
                    <div>
                        <h2 className="text-sm font-black text-white uppercase tracking-[0.3em]">Neural Trust Pipeline</h2>
                        <p className="text-[10px] text-gray-400 font-medium">Real-time cryptographic audit flow</p>
                    </div>
                </div>

                <div className="flex flex-wrap justify-center gap-3">
                    {DEVICES.map(d => (
                        <button 
                            key={d.id} 
                            onClick={() => !isRunning && setActiveDeviceId(d.id)} 
                            className={`px-5 py-2 rounded-xl border text-[10px] font-bold tracking-wider transition-all duration-500 flex items-center gap-2 ${activeDeviceId === d.id ? (d.colorKey === 'emerald' ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]' : 'bg-rose-500/10 border-rose-500/50 text-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.2)]') : 'bg-white/5 border-white/5 text-gray-500 hover:border-white/20'}`}
                        >
                            <div className={`w-1.5 h-1.5 rounded-full ${activeDeviceId === d.id ? 'animate-pulse bg-current' : 'bg-gray-600'}`} />
                            {d.id}
                        </button>
                    ))}
                    <button 
                      onClick={runPipeline} 
                      disabled={isRunning} 
                      className={`ml-2 px-6 py-2 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all duration-500 flex items-center gap-2 ${isRunning ? 'bg-gray-800 text-gray-600 cursor-not-allowed' : 'bg-brand-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:scale-105 active:scale-95'}`}
                    >
                      {isRunning ? <RotateCcw className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
                      {isRunning ? 'Processing' : 'Initiate Secure Auth'}
                    </button>
                </div>
            </div>

            {/* Pipeline Container */}
            <div className="relative z-10 py-12 px-4">
                
                {/* Central Flow Line (Desktop) */}
                <div className="hidden lg:block absolute top-1/2 left-[10%] right-[10%] -translate-y-1/2 h-[2px] bg-white/5 overflow-hidden">
                    <motion.div 
                        className="h-full bg-gradient-to-r from-transparent via-brand-500 to-transparent"
                        animate={{ opacity: isRunning ? [0.1, 0.6, 0.1] : 0.1 }}
                        transition={{ repeat: Infinity, duration: 2 }}
                    />
                    {/* Moving Data Particle */}
                    {isRunning && (
                        <motion.div 
                            className="absolute top-0 w-3 h-3 rounded-full bg-brand-400 blur-sm"
                            animate={{ left: ["0%", "100%"] }}
                            transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
                        />
                    )}
                </div>

                {/* Nodes Layout */}
                <div className="flex flex-col lg:flex-row justify-between items-center relative z-20 gap-16 lg:gap-0">
                    {PIPELINE_STEPS.map((step, idx) => {
                        const state = stepStates[idx];
                        const isActive = isRunning && activeStep === idx;
                        const isSuccess = state.status === 'success';
                        const isFailed = state.status === 'rejected';
                        const isIdle = state.status === 'idle';
                        
                        const Icon = isFailed ? XCircle : isSuccess ? CheckCircle : step.icon;

                        return (
                            <div key={step.id} className="relative flex flex-col items-center group/node">
                                {idx < PIPELINE_STEPS.length - 1 && (
                                    <div className="lg:hidden absolute top-[70px] left-1/2 -translate-x-1/2 w-[2px] h-[64px] bg-white/5" />
                                )}

                                <motion.div 
                                    whileHover={{ scale: 1.05 }}
                                    className={`relative w-16 h-16 rounded-full flex items-center justify-center border backdrop-blur-lg transition-all duration-500 ${
                                        isActive ? 'bg-brand-500/20 border-brand-500 shadow-[0_0_30px_rgba(37,99,235,0.6)] scale-110 z-30' :
                                        isSuccess ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.4)]' :
                                        isFailed ? 'bg-rose-500/10 border-rose-500 text-rose-400 shadow-[0_0_20px_rgba(244,63,94,0.5)]' :
                                        'bg-white/5 border-white/10 text-gray-600'
                                    }`}
                                >
                                    <Icon className={`w-7 h-7 ${isActive ? 'text-brand-400 animate-pulse' : ''}`} />
                                    
                                    {/* Pulse effect for active node */}
                                    {isActive && (
                                        <motion.div 
                                            className="absolute inset-0 rounded-full border border-brand-500"
                                            animate={{ scale: [1, 1.4], opacity: [0.5, 0] }}
                                            transition={{ repeat: Infinity, duration: 1.5 }}
                                        />
                                    )}
                                </motion.div>

                                <div className="mt-5 flex flex-col items-center gap-1">
                                    <span className={`text-[9px] font-bold uppercase tracking-widest transition-colors duration-500 ${isActive ? 'text-orange-400' : isSuccess ? 'text-emerald-400' : isFailed ? 'text-rose-400' : 'text-gray-500'}`}>
                                        {step.label}
                                    </span>
                                    {isActive && (
                                        <motion.span 
                                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} 
                                            className="text-[8px] text-gray-400 font-medium uppercase tracking-tighter"
                                        >
                                            {step.statusText}...
                                        </motion.span>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Live Audit Terminal */}
            <div className="mt-12 max-w-4xl mx-auto relative z-20">
                <div className="bg-black/60 rounded-2xl border border-white/10 backdrop-blur-md overflow-hidden">
                    <div className="px-4 py-2 bg-white/5 border-b border-white/10 flex items-center justify-between">
                         <div className="flex items-center gap-2">
                             <Terminal className="w-4 h-4 text-gray-400" />
                             <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">Live Audit Terminal</span>
                         </div>
                         <div className="flex gap-1.5">
                             <div className="w-2 h-2 rounded-full bg-rose-500/50" />
                             <div className="w-2 h-2 rounded-full bg-amber-500/50" />
                             <div className="w-2 h-2 rounded-full bg-emerald-500/50" />
                         </div>
                    </div>
                    <div ref={terminalRef} className="p-4 h-48 overflow-y-auto font-mono text-[11px] leading-relaxed space-y-2">
                        {logs.length === 0 ? (
                            <div className="text-gray-600 italic">// Awaiting connection sequence...</div>
                        ) : (
                            logs.map((log, i) => (
                                <motion.div 
                                    initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} 
                                    key={i} 
                                    className="flex gap-4"
                                >
                                    <span className="text-gray-500 shrink-0">[{log.time}]</span>
                                    <span className={`${
                                        log.type === 'success' ? 'text-emerald-400' : 
                                        log.type === 'error' ? 'text-rose-400' : 
                                        'text-brand-400'
                                    }`}>
                                        {log.text}
                                    </span>
                                </motion.div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Final Decision Overlay */}
            <AnimatePresence>
                {finalDecision && (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
                        className="mt-8 flex justify-center relative z-20"
                    >
                        <div className={`px-10 py-4 rounded-2xl border-2 glass-panel flex flex-col items-center gap-1 shadow-2xl ${finalDecision.type === 'success' ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-rose-500/50 bg-rose-500/5'}`}>
                            <div className={`text-[10px] font-black tracking-[0.5em] uppercase ${finalDecision.type === 'success' ? 'text-emerald-400' : 'text-rose-400'}`}>
                                {finalDecision.status}
                            </div>
                            <div className="text-[9px] text-gray-400 font-medium uppercase tracking-widest">
                                {finalDecision.message}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    </div>
  );
}
