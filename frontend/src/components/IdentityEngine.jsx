import React, { useContext, useState } from 'react';
import { Fingerprint, Cpu, Copy, CheckCircle, Key } from 'lucide-react';
import { DataContext } from '../context/DataContext';

export default function IdentityEngine() {
  const { devices } = useContext(DataContext);
  const [copied, setCopied] = useState(null);
  
  const mainDevice = devices.find(d => d.deviceId === 'ESP32_01');
  const isSecured = mainDevice && mainDevice.registered;
  // Use Ethereum Address directly from contract extraction if available
  const ethAddress = mainDevice?.address || "0xUnassignedPublicIdentity";

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="glass-panel rounded-3xl p-7 reveal active" id="identity-card">
        <div className="flex items-center justify-between mb-7">
            <h2 className="text-xl font-bold flex items-center gap-3 text-slate-900 dark:text-white">
                <div className="p-2 bg-brand-500/10 rounded-lg">
                  <Fingerprint className="text-brand-500 w-5 h-5" />
                </div>
                Web3 Identity Engine
            </h2>
            <span className={`px-3 py-1.5 rounded-lg text-[10px] uppercase font-black tracking-widest border transition-colors ${isSecured ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' : 'bg-slate-500/10 text-slate-500 dark:text-slate-400 border-slate-500/20'}`}>
              {isSecured ? 'ECDSA Verified' : 'Awaiting Boot'}
            </span>
        </div>

        {!isSecured ? (
          <div className="w-full bg-slate-800 dark:bg-white text-white dark:text-slate-900 font-bold py-3.5 px-4 rounded-xl flex justify-center items-center gap-2 shadow-xl opacity-75 cursor-default">
            <Cpu className="h-5 w-5 animate-pulse" /> Awaiting Hardware Signing...
          </div>
        ) : (
          <div className="w-full bg-emerald-600 border border-emerald-500/50 text-white font-bold py-3.5 px-4 rounded-xl flex justify-center items-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.2)] cursor-default">
            <CheckCircle className="h-5 w-5" /> Smart Contract Secured
          </div>
        )}

        <div className={`mt-8 space-y-5 transition-opacity duration-500 ${isSecured ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
            <div className="relative group cursor-pointer" onClick={() => copyToClipboard('ESP32_01', 'uuid')}>
                <div className={`copy-tooltip ${copied === 'uuid' ? 'show' : ''}`}>Copied!</div>
                <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5 flex justify-between items-center">
                    Physical Hardware ID <Copy className="w-3.5 h-3.5 opacity-40 group-hover:opacity-100 transition-opacity" />
                </label>
                <div className="font-mono text-xs bg-slate-100/50 dark:bg-slate-800/50 p-3.5 rounded-xl border border-slate-200/50 dark:border-slate-700/50 text-slate-700 dark:text-slate-300 break-all transition-colors group-hover:bg-brand-50 dark:group-hover:bg-slate-800">
                  ESP32_01
                </div>
            </div>
            
            <div className="relative group cursor-pointer" onClick={() => copyToClipboard(ethAddress, 'eth')}>
                <div className={`copy-tooltip ${copied === 'eth' ? 'show' : ''}`}>Copied!</div>
                <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5 flex justify-between items-center">
                    Ethereum Public Address <Copy className="w-3.5 h-3.5 opacity-40 group-hover:opacity-100 transition-opacity" />
                </label>
                <div className="font-mono text-xs bg-brand-500/10 p-3.5 rounded-xl border border-brand-500/20 text-brand-700 dark:text-brand-300 break-all transition-colors group-hover:bg-brand-500/20">
                    {ethAddress}
                </div>
            </div>

            <div className="pt-2">
                <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">
                    Latest Cryptographic Payload
                </label>
                <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-400 flex items-center gap-2">
                        <Key className="w-4 h-4 text-emerald-500" /> secp256k1 Curve
                    </span>
                    <span className="text-[10px] font-black uppercase text-emerald-600 bg-emerald-500/20 px-2 py-1 rounded">Format Valid</span>
                </div>
            </div>
        </div>
    </div>
  );
}
