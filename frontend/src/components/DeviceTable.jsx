import React from 'react';
import { useData } from '../context/DataContext';
import { motion } from 'framer-motion';
import { Cpu } from 'lucide-react';

export default function DeviceTable() {
  const { devices } = useData();

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-panel flex-1 flex flex-col"
    >
      <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-zinc-100 flex items-center gap-2">
          <Cpu size={20} className="text-zinc-400"/> Device Authentication 
        </h2>
      </div>
      <div className="p-6 overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-zinc-500 text-sm border-b border-white/5">
              <th className="pb-3 font-medium">Device ID</th>
              <th className="pb-3 font-medium">Type</th>
              <th className="pb-3 font-medium">Registration</th>
              <th className="pb-3 font-medium">Trust Score</th>
              <th className="pb-3 font-medium text-right">Status</th>
            </tr>
          </thead>
          <tbody>
            {devices.map((device, i) => (
              <motion.tr 
                key={device.deviceId} 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="border-b border-white/5 hover:bg-white/[0.02] transition-colors"
              >
                <td className="py-4 font-mono text-zinc-200">{device.deviceId}</td>
                <td className="py-4 text-zinc-400">{device.type}</td>
                <td className="py-4">
                  {device.registered ? 
                    <span className="px-2.5 py-1 text-xs rounded-md bg-success/10 text-success border border-success/20">Verified Identity</span> : 
                    <span className="px-2.5 py-1 text-xs rounded-md bg-danger/10 text-danger border border-danger/20">Not Found</span>
                  }
                </td>
                <td className="py-4">
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-zinc-800 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${device.trustScore}%` }}
                        className={`h-full ${device.trustScore > 50 ? 'bg-success' : 'bg-danger'}`}
                      />
                    </div>
                    <span className="text-xs text-zinc-500">{device.trustScore}</span>
                  </div>
                </td>
                <td className="py-4 text-right">
                  {device.trustScore > 50 ? 
                    <span className="text-success flex items-center justify-end gap-1"><div className="w-1.5 h-1.5 rounded-full bg-success"></div>Trusted</span> :
                    <span className="text-danger flex items-center justify-end gap-1"><div className="w-1.5 h-1.5 rounded-full bg-danger"></div>Rejected</span>
                  }
                </td>
              </motion.tr>
            ))}
            {devices.length === 0 && (
              <tr>
                <td colSpan="5" className="py-8 text-center text-zinc-500">No devices found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
