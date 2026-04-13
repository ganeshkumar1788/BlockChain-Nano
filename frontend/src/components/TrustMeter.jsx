import React, { useContext, useEffect, useState, useRef } from 'react';
import { ShieldCheck, ShieldAlert, Shield } from 'lucide-react';
import { motion, useSpring, useTransform, animate } from 'framer-motion';
import { DataContext } from '../context/DataContext';

export default function TrustMeter() {
  const { devices, activeDeviceId } = useContext(DataContext);
  const mainDevice = devices.find(d => d.deviceId === activeDeviceId);
  const targetScore = mainDevice ? mainDevice.trustScore : 50;
  
  const [displayScore, setDisplayScore] = useState(targetScore);
  const [isPulsing, setIsPulsing] = useState(false);

  // Smooth number animation
  useEffect(() => {
    const controls = animate(displayScore, targetScore, {
      duration: 1.5,
      ease: "easeOut",
      onUpdate: (value) => setDisplayScore(Math.round(value))
    });
    
    // Trigger pulse on significant change
    if (Math.abs(displayScore - targetScore) > 10) {
        setIsPulsing(true);
        setTimeout(() => setIsPulsing(false), 2000);
    }

    return () => controls.stop();
  }, [targetScore]);

  const circumference = 339.292;
  const offset = circumference - (displayScore / 100) * circumference;

  let color = '#3b82f6'; let statusText = 'Neutral'; let statusClass = 'text-brand-500';
  let iconClass = 'text-brand-500'; let IconType = Shield;

  if (displayScore >= 80) {
      color = '#10b981'; statusText = 'Trusted'; statusClass = 'text-emerald-500'; iconClass = 'text-emerald-500'; IconType = ShieldCheck;
  } else if (displayScore <= 30) {
      color = '#f43f5e'; statusText = 'Untrusted'; statusClass = 'text-rose-500'; iconClass = 'text-rose-500'; IconType = ShieldAlert;
  }

  return (
    <div className={`glass-panel rounded-3xl p-7 flex flex-col items-center justify-center reveal active relative overflow-hidden transition-all duration-700 ${isPulsing ? 'scale-[1.02] shadow-[0_0_40px_rgba(59,130,246,0.2)]' : ''}`}>
        <div className="absolute -top-4 -right-4 p-4 opacity-[0.03] dark:opacity-[0.05] pointer-events-none">
            <Shield className="w-48 h-48 text-slate-900 dark:text-white" />
        </div>
        
        <h2 className="text-lg font-black text-slate-900 dark:text-white w-full mb-4 flex justify-between items-center z-10 tracking-tight">
            Dynamic Trust Score
            <IconType className={`h-6 w-6 transition-colors duration-500 ${iconClass} ${isPulsing ? 'animate-bounce' : ''}`} />
        </h2>
        
        <div className="relative w-56 h-56 flex items-center justify-center z-10 mt-2">
            <svg className="w-full h-full transform -rotate-90 absolute top-0 left-0 drop-shadow-lg" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="54" fill="none" stroke="currentColor" className="text-slate-200/50 dark:text-slate-700/50" strokeWidth="8" />
                <motion.circle 
                    cx="60" cy="60" r="54" 
                    fill="none" 
                    stroke={color} 
                    strokeWidth="8" 
                    strokeLinecap="round" 
                    strokeDasharray="339.292" 
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset: offset }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                />
            </svg>
            
            <div className="text-center z-10 flex flex-col items-center">
                <motion.span 
                    animate={{ scale: isPulsing ? [1, 1.1, 1] : 1 }}
                    className="text-7xl font-black text-slate-900 dark:text-white tracking-tighter transition-all"
                >
                    {displayScore}
                </motion.span>
                <span className={`text-sm font-black uppercase tracking-[0.2em] mt-2 transition-colors duration-500 animate-pulse ${statusClass}`}>
                    {statusText}
                </span>
            </div>
            
            {/* Visual pulse background */}
            {isPulsing && (
                <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1.5, opacity: [0.2, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className={`absolute inset-0 rounded-full border-2 ${statusClass} border-current opacity-20`}
                />
            )}
        </div>
        
        <div className="mt-8 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest text-center">
            Blockchain Verified Analysis
        </div>
    </div>
  );
}
