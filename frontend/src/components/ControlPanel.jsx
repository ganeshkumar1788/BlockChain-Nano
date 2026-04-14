import React from 'react';
import { useData } from '../context/DataContext';
import { motion } from 'framer-motion';
import { Fingerprint, Zap } from 'lucide-react';

export default function ControlPanel() {
  const { devices, authenticate } = useData();

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel"
    >
      <div className="px-6 py-5 border-b border-white/5 flex items-center gap-2">
        <Fingerprint size={20} className="text-zinc-400"/> 
        <h2 className="text-lg font-semibold text-zinc-100">Access Control</h2>
      </div>
      <div className="p-6 flex flex-col gap-4">
        
        <button 
          onClick={async () => {
            await fetch(`http://${window.location.hostname}:5000/api/authenticate/all`, { method: 'POST' });
          }}
          className="w-full relative group overflow-hidden bg-white/5 hover:bg-white/10 text-zinc-100 font-medium py-3 px-4 rounded-xl border border-white/10 transition-all flex items-center justify-center gap-2"
        >
          <Zap size={18} className="text-yellow-400 group-hover:scale-110 transition-transform" />
          <span>Authenticate All Devices</span>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
        </button>

        <div className="h-px bg-white/5 my-2" />

        <div className="grid grid-cols-2 gap-3">
          {devices.map(device => (
             <motion.button 
              key={device.deviceId}
              whileTap={{ scale: 0.95 }}
              onClick={() => authenticate(device.deviceId)}
              className="bg-surface hover:bg-zinc-800 text-zinc-300 text-sm font-medium py-3 px-4 rounded-xl border border-white/5 transition-colors flex flex-col items-center gap-1"
             >
               <span className="text-xs text-zinc-500">Send Request</span>
               <span className="font-mono text-zinc-100">{device.deviceId}</span>
             </motion.button>
          ))}
        </div>

      </div>
    </motion.div>
  );
}
