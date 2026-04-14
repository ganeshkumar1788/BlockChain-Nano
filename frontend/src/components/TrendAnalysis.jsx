import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Activity } from "lucide-react";
import { useData } from "../context/DataContext";

export default function TrendAnalysis() {
  const { transportData } = useData();
  const [data, setData] = useState([20, 15, 10, 8, 12, 25, 35, 45, 60, 75, 80, 85, 70, 65, 55, 50, 60, 75, 80, 90, 85, 75, 60, 50]);

  useEffect(() => {
    const interval = setInterval(() => {
      setData(prev => {
        const next = [...prev.slice(1), Math.floor(Math.random() * (95 - 10 + 1) + 10)];
        return next;
      });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const temp = transportData?.temperature?.toFixed(1) || "24.2";
  const hum = transportData?.humidity?.toFixed(1) || "48.5";
  const move = transportData?.movement?.toFixed(1) || "1.2";
  const sig = transportData?.signature ? `${transportData.signature.slice(0, 8)}...` : "0x7F2...9C1";

  return (
    <div className="w-full relative rounded-3xl overflow-hidden bg-white/5 backdrop-blur-xl border border-white/10 p-6 group transition-all duration-500 h-full flex flex-col justify-between">
      {/* Depth Layers */}
      <div className="absolute inset-0 bg-gradient-to-br from-brand-500/10 via-transparent to-transparent pointer-events-none" />
      <div className="absolute inset-0 rounded-2xl border border-white/5 pointer-events-none" />

      {/* Header */}
      <div className="flex justify-between items-start mb-4 relative z-10">
        <div>
          <p className="text-[10px] text-brand-400 font-black tracking-[0.3em] uppercase mb-1 flex items-center gap-2">
            <Activity className="w-3 h-3" /> LIVE TELEMETRY
          </p>
          <h2 className="text-xl font-black text-white tracking-tight">
            Trend Analysis
          </h2>
          <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mt-1">Movement: {move} G</p>
        </div>
        <span className="text-[9px] font-mono text-gray-400 bg-white/5 px-2 py-1 rounded border border-white/5">
          SIG: {sig}
        </span>
      </div>

      {/* Micro Chart */}
      <div className="relative h-24 flex items-end gap-[3px] z-10 mt-4">
        {data.map((v, i) => (
          <motion.div
            key={i}
            initial={{ height: 0 }}
            animate={{ height: `${v}%` }}
            transition={{ duration: 0.5 }}
            className="flex-1 min-w-[4px] rounded-full bg-gradient-to-t from-brand-600 to-brand-400 shadow-[0_0_8px_rgba(59,130,246,0.3)]"
          />
        ))}
      </div>

      {/* Baseline Glow */}
      <div className="h-[2px] mt-4 bg-gradient-to-r from-transparent via-brand-500/60 to-transparent blur-[1px]" />
    </div>
  );
}
