import React, { useContext, useEffect, useState } from 'react';
import { ShieldCheck, ShieldAlert, Shield } from 'lucide-react';
import { motion, animate } from 'framer-motion';
import { DataContext } from '../context/DataContext';

export default function TrustMeter() {
  const { activeDeviceId, globalTrustScore } = useContext(DataContext);
  
  const getBaseScore = (id) => {
    if (id === 'ESP32_01' || id === 'ESP32_02') return 100;
    if (id === 'ESP32_03') return 40;
    return 50;
  };

  // Use the globalTrustScore if it's set by the pipeline (e.g., > 0), otherwise use the baseline for the active device
  const targetScore = globalTrustScore > 0 ? globalTrustScore : getBaseScore(activeDeviceId);
  
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

  let color = '#3b82f6'; let statusText = 'Analyzing'; let statusClass = 'text-brand-500';
  let iconClass = 'text-brand-500'; let IconType = Shield;

  if (displayScore >= 80) {
      color = '#34d399'; 
      statusText = 'Verified'; 
      statusClass = 'text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]'; 
      iconClass = 'text-emerald-400'; 
      IconType = ShieldCheck;
  } else if (displayScore < 50) {
      color = '#fb7185'; 
      statusText = 'Untrusted'; 
      statusClass = 'text-rose-400 drop-shadow-[0_0_8px_rgba(244,63,94,0.5)]'; 
      iconClass = 'text-rose-400'; 
      IconType = ShieldAlert;
  }

  return (
    <div className={`relative flex flex-col items-center justify-center transition-all duration-700 ${isPulsing ? 'scale-[1.02]' : ''}`}>
        <div className="absolute -top-4 -right-4 p-4 opacity-[0.03] pointer-events-none">
            <Shield className="w-48 h-48 text-white" />
        </div>
        
        <div className="relative w-56 h-56 flex items-center justify-center z-10 mt-2">
            <svg className="w-full h-full transform -rotate-90 absolute top-0 left-0 drop-shadow-2xl" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="54" fill="none" stroke="currentColor" className="text-white/10" strokeWidth="8" />
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
            
            <div className="text-center z-10 flex flex-col items-center relative">
                <motion.div 
                    animate={{ scale: isPulsing ? [1, 1.1, 1] : 1 }}
                    className="flex flex-col items-center"
                >
                    <IconType className={`h-8 w-8 mb-2 transition-colors duration-500 ${iconClass} ${isPulsing ? 'animate-bounce' : ''}`} />
                    <span className="text-7xl font-black text-white tracking-tighter transition-all">
                        {displayScore}
                    </span>
                 </motion.div>
                <span className={`text-sm font-black uppercase tracking-[0.2em] mt-2 transition-colors duration-500 ${statusClass}`}>
                    {statusText}
                </span>
            </div>
            
            {/* Visual pulse background */}
            {isPulsing && (
                <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1.5, opacity: [0.2, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className={`absolute inset-0 rounded-full border-2 ${iconClass} opacity-20`}
                />
            )}
        </div>
    </div>
  );
}
