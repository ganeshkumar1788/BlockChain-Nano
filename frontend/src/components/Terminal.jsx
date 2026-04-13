import React, { useEffect, useRef } from 'react';
import { useData } from '../context/DataContext';
import { motion, AnimatePresence } from 'framer-motion';
import { TerminalSquare } from 'lucide-react';

export default function Terminal() {
  const { logs } = useData();
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="glass-panel flex-1 flex flex-col min-h-[300px]"
    >
      <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between bg-zinc-950/50">
        <h2 className="text-sm font-mono text-zinc-400 flex items-center gap-2">
          <TerminalSquare size={16}/> system.log
        </h2>
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-danger/50"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500/50"></div>
          <div className="w-3 h-3 rounded-full bg-success/50"></div>
        </div>
      </div>
      
      <div className="p-6 font-mono text-sm overflow-y-auto flex-1 flex flex-col gap-2 relative">
        <AnimatePresence>
          {logs.map((log, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className={`flex gap-3 leading-relaxed ${
                log.type === 'error' ? 'text-danger' : 
                log.type === 'success' ? 'text-success' : 
                log.type === 'warning' ? 'text-yellow-400' : 'text-zinc-300'
              }`}
            >
              <span className="text-zinc-600 shrink-0">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
              <span className="break-all">{log.message}</span>
            </motion.div>
          ))}
          <div ref={endRef} />
        </AnimatePresence>

        {logs.length === 0 && (
          <div className="w-full h-full flex items-center justify-center text-zinc-600 animate-pulse">
            Waiting for activity...
          </div>
        )}
      </div>
    </motion.div>
  );
}
