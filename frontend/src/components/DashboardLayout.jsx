import React, { useEffect, useState } from 'react';
import { useData } from '../context/DataContext';
import { Hexagon, Moon, Sun, ArrowDown, Activity, Shield, Hash, Thermometer, Droplets, Package } from 'lucide-react';
import InteractiveBackground from './InteractiveBackground';
import ZeroTrustPipeline from './ZeroTrustPipeline';
import TrendAnalysis from './TrendAnalysis';
import IdentityEngine from './IdentityEngine';
import CybersecurityEngine from './CybersecurityEngine';
import TrustMeter from './TrustMeter';
import ActivityLedger from './ActivityLedger';

export default function DashboardLayout() {
  const [isDark, setIsDark] = useState(
    localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)
  );

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

    const { 
        industryData, transportData, activeDeviceId, 
        events, globalThreatLevel, lastHash 
    } = useData();

    return (
    <>
      <InteractiveBackground isDark={isDark} />

      {/* Navigation */}
      <nav className="fixed w-full z-50 glass-nav transition-all duration-500 py-4" id="navbar">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-12">
            <div className="flex justify-between items-center h-16">
                <div className="flex items-center gap-4 cursor-pointer group">
                    <div className="relative">
                        <div className="w-10 h-10 rounded-xl bg-brand-500/20 flex items-center justify-center border border-brand-500/30 group-hover:rotate-90 transition-transform duration-700">
                             <Hexagon className="text-brand-500 h-6 w-6" />
                        </div>
                        <div className="absolute inset-0 bg-brand-500 blur-xl opacity-0 group-hover:opacity-40 transition-opacity duration-300"></div>
                    </div>
                    <div>
                        <span className="font-black text-2xl tracking-tighter text-white">NEXIUM</span>
                        <div className="h-[2px] w-0 group-hover:w-full bg-brand-500 transition-all duration-500" />
                    </div>
                </div>
                <div className="flex items-center gap-6">
                    <div className="hidden md:flex items-center gap-6 text-[10px] font-bold text-gray-500 uppercase tracking-widest mr-8">
                        <span className="hover:text-white cursor-pointer transition-colors">Nodes</span>
                        <span className="hover:text-white cursor-pointer transition-colors">Security</span>
                        <span className="hover:text-white cursor-pointer transition-colors">Ledger</span>
                    </div>
                    <button onClick={() => setIsDark(!isDark)} className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300">
                        {isDark ? <Sun className="h-4 w-4 text-brand-400" /> : <Moon className="h-4 w-4 text-gray-400" />}
                    </button>
                    <div className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        <span className="text-[9px] font-black text-emerald-400 tracking-widest uppercase">System Online</span>
                    </div>
                </div>
            </div>
        </div>
      </nav>

      <main className="relative z-10 pt-40 pb-20 px-4 sm:px-6 lg:px-8 max-w-[1400px] mx-auto">
        
        {/* Centered Hero Header per User Image */}
        <header className="relative text-center mb-24 reveal active">
            <div className="relative z-10">
                <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full glass-panel text-brand-300 text-[10px] font-semibold mb-8 animate-float cursor-default">
                    <span className="relative flex h-2 w-2 mr-1">
                        <span className="animate-ping absolute h-full w-full rounded-full bg-brand-400 opacity-75"></span>
                        <span className="relative rounded-full h-2 w-2 bg-brand-500"></span>
                    </span>
                    Nexium Trust Engine v3.0 Live
                </div>
                <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 text-white leading-tight">
                    Blockchain-Enabled <br className="hidden md:block"/>
                    <span className="text-gradient">Identity & Trust Management System</span>
                </h1>
                <p className="mt-8 max-w-3xl mx-auto text-lg md:text-xl text-slate-400 font-light leading-relaxed">
                    An interactive full-stack simulation demonstrating real-time cryptographic identity provisioning, behavioral anomaly detection, and automated threat mitigation.
                </p>
                <div className="mt-12 flex justify-center gap-4">
                    <button onClick={() => window.scrollTo({top: 1500, behavior: 'smooth'})} className="bg-brand-600 hover:bg-brand-500 text-white font-bold py-4 px-10 rounded-full shadow-[0_0_30px_rgba(37,99,235,0.4)] transition-all hover:scale-105 active:scale-95 flex items-center gap-3">
                        Launch Live Demo <ArrowDown className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </header>

        {/* Overview Overview Stats Section per 3rd Screenshot */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16 relative z-20">
            <div className="glass-panel p-6 rounded-3xl border border-white/5 flex items-center gap-6">
                <div className="w-14 h-14 rounded-2xl bg-brand-500/10 flex items-center justify-center border border-brand-500/20">
                    <Activity className="text-brand-500 w-6 h-6" />
                </div>
                <div>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Total Requests</p>
                    <p className="text-3xl font-black text-white">{events?.length || 0}</p>
                </div>
            </div>
            <div className="glass-panel p-6 rounded-3xl border border-white/5 flex items-center gap-6">
                <div className="w-14 h-14 rounded-2xl bg-brand-500/10 flex items-center justify-center border border-brand-500/20">
                    <Shield className="text-brand-500 w-6 h-6" />
                </div>
                <div>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Threat Level</p>
                    <p className="text-3xl font-black text-white capitalize">{globalThreatLevel || 'Low'}</p>
                </div>
            </div>
            <div className="glass-panel p-6 rounded-3xl border border-white/5 flex items-center gap-6">
                <div className="w-14 h-14 rounded-2xl bg-brand-500/10 flex items-center justify-center border border-brand-500/20">
                    <Hash className="text-brand-500 w-6 h-6" />
                </div>
                <div>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Last Transaction Hash</p>
                    <p className="text-xs font-mono text-gray-400 mt-1 truncate max-w-[200px]">{lastHash || 'Awaiting system initialization...'}</p>
                </div>
            </div>
        </div>

        {/* Supply Chain Logistics Section header */}
        <div className="flex items-center gap-4 mb-8">
            <div className="w-10 h-10 rounded-xl bg-brand-500/20 flex items-center justify-center border border-brand-500/30">
                <Package className="text-brand-500 h-5 w-5" />
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight">Supply Chain Logistics</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-20">
            {/* Left: Clusters */}
            <div className="lg:col-span-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="glass-panel p-8 rounded-[2rem] border border-white/5 relative overflow-hidden group">
                    <div className="flex justify-between items-center mb-10">
                        <h4 className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em]">Industry Cluster</h4>
                        <Activity className="text-brand-500 w-4 h-4" />
                    </div>
                    <div className="flex flex-col gap-2">
                        {industryData ? (
                            <div className="space-y-4">
                                <div className="space-y-1">
                                    <p className="text-2xl font-black text-white tracking-tight uppercase">PKG_{industryData.package_id || '001'}</p>
                                    <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">STATE: {industryData.state || 'MANUFACTURED'}</p>
                                </div>
                                <div className="inline-flex px-3 py-1 rounded-lg bg-brand-500/10 border border-brand-500/20 text-[9px] font-black text-brand-400 uppercase tracking-widest">
                                    VERIFIED
                                </div>
                            </div>
                        ) : (
                            <p className="text-gray-600 text-sm font-medium italic">Waiting for industry signal...</p>
                        )}
                    </div>
                </div>

                <div className="glass-panel p-8 rounded-[2rem] border border-white/5 relative overflow-hidden group">
                    <div className="flex justify-between items-center mb-10">
                        <h4 className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em]">Transport Cluster</h4>
                        <Activity className="text-orange-500 w-4 h-4" />
                    </div>
                    <div className="space-y-4">
                        <div className="space-y-1">
                            <p className="text-2xl font-black text-white tracking-tight uppercase">
                                {transportData?.device_id ? `TRK_${transportData.device_id.split('_')[1] || '001'}` : 'PKG_001'}
                            </p>
                            <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">
                                ID: {transportData?.device_id || 'ESP32_TRANSPORT'}
                            </p>
                        </div>
                        <div className="inline-flex px-3 py-1 rounded-lg bg-orange-500/10 border border-orange-500/20 text-[9px] font-black text-orange-500 uppercase tracking-widest">
                            {transportData ? 'In Transit' : 'Scanning...'}
                        </div>
                    </div>
                </div>
            </div>

            {/* Right: Telemetry Widgets */}
            <div className="lg:col-span-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="glass-panel p-8 rounded-[2rem] border border-white/5">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center border border-brand-500/20">
                            <Thermometer className="text-brand-500 w-5 h-5" />
                        </div>
                        <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest">Temperature</p>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <p className="text-4xl font-black text-white">
                            {transportData?.temperature?.toFixed(1) || '0.0'}°C
                        </p>
                        <span className="text-[9px] font-bold text-emerald-500 uppercase">Stable</span>
                    </div>
                </div>

                <div className="glass-panel p-8 rounded-[2rem] border border-white/5">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center border border-brand-500/20">
                            <Droplets className="text-brand-500 w-5 h-5" />
                        </div>
                        <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest">Humidity</p>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <p className="text-4xl font-black text-white">
                            {transportData?.humidity?.toFixed(1) || '0.0'}%
                        </p>
                        <span className="text-[9px] font-bold text-emerald-500 uppercase">Optimal</span>
                    </div>
                </div>

                <div className="md:col-span-2">
                    <TrendAnalysis />
                </div>
            </div>
        </div>

        {/* Pipeline Control - Horizontal centerpiece again */}
        <ZeroTrustPipeline />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mt-20">
            {/* Sidebar Controls */}
            <div className="lg:col-span-4 space-y-12">
                <IdentityEngine />
                <CybersecurityEngine />
            </div>

            {/* Main Analytics Section */}
            <div className="lg:col-span-8 space-y-12">
                <div className="glass-panel bg-white/5 border border-white/10 p-8 rounded-[2.5rem]">
                    <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-6">
                        <div>
                             <h3 className="text-xl font-black text-white uppercase tracking-[0.2em]">Global Trust Index</h3>
                             <div className="flex items-center gap-2 mt-1">
                                <div className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse"></div>
                                <p className="text-[10px] text-brand-400 font-bold uppercase tracking-widest">Neural network confidence mapping active</p>
                             </div>
                        </div>
                        <div className="px-4 py-1.5 rounded-lg bg-white/5 border border-white/10">
                            <span className="text-[10px] font-mono text-gray-400">STATUS: PROBABILISTIC_VERIFICATION</span>
                        </div>
                    </div>
                    <TrustMeter />
                </div>
                <ActivityLedger />
            </div>
        </div>

        {/* Floating Scroll Indicator */}
        <div className="mt-24 flex justify-center">
            <button className="flex flex-col items-center gap-4 text-gray-600 hover:text-orange-500 transition-colors group">
                <span className="text-[8px] font-black uppercase tracking-[0.5em]">Scroll to Explore</span>
                <div className="w-px h-12 bg-gradient-to-b from-orange-500/50 to-transparent group-hover:h-16 transition-all duration-700" />
            </button>
        </div>
      </main>
    </>
  );
}
