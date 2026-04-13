import React from 'react';
import { useData } from '../context/DataContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Link2, Clock } from 'lucide-react';

export default function BlockchainLedger() {
  const { events } = useData();

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel flex flex-col"
    >
      <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-zinc-100 flex items-center gap-2">
          <Link2 size={20} className="text-zinc-400"/> Immutable Ledger <span className="text-xs ml-2 text-zinc-600 bg-zinc-900 px-2 py-0.5 rounded border border-white/5">Auto-updating</span>
        </h2>
      </div>

      <div className="p-6 overflow-x-auto flex gap-4 pb-8 custom-scrollbar">
        <AnimatePresence>
          {events.map((ev, i) => (
            <motion.div
              layout
              initial={{ opacity: 0, rotateY: -90, x: 20 }}
              animate={{ opacity: 1, rotateY: 0, x: 0 }}
              transition={{ delay: i * 0.05 }}
              key={ev._id}
              className="shrink-0 w-64 bg-surface border border-white/10 rounded-xl p-4 flex flex-col gap-3 relative overflow-hidden group shadow-lg"
            >
              {/* Subtle tech background element */}
              <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-primary/10 to-transparent rounded-bl-full -z-[0]" />
              
              <div className="flex justify-between items-start z-10 w-full relative">
                <span className={`text-[10px] font-bold tracking-wider px-2 py-0.5 rounded uppercase ${
                  ev.status === 'Verified' ? 'bg-success/20 text-success' : 'bg-danger/20 text-danger'
                }`}>
                  {ev.action}
                </span>
                <span className="text-zinc-500 text-xs flex items-center gap-1 font-mono">
                  <Clock size={12}/> {new Date(ev.createdAt).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute:'2-digit', second:'2-digit' })}
                </span>
              </div>
              
              <div className="z-10 mt-1">
                <p className="text-zinc-400 text-xs mb-1">Target ID</p>
                <p className="text-sm font-mono text-zinc-200">{ev.deviceId}</p>
              </div>

              <div className="z-10 bg-black/30 rounded p-2 border border-white/5 mt-auto">
                <p className="text-zinc-500 text-[10px] mb-0.5">SHA-256 Hash</p>
                <p className="text-xs font-mono text-primary/80 truncate" title={ev.hash}>
                  {ev.hash.substring(0, 16)}...
                </p>
              </div>
              
            </motion.div>
          ))}
          {events.length === 0 && (
            <div className="text-zinc-500 flex items-center w-full justify-center min-h-[120px]">
              Ledger is currently empty.
            </div>
          )}
        </AnimatePresence>
      </div>

    </motion.div>
  );
}
