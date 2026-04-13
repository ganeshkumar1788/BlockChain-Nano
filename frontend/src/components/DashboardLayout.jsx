import React, { useEffect, useState } from 'react';
import { DataProvider } from '../context/DataContext';
import { Hexagon, Moon, Sun, ArrowDown } from 'lucide-react';
import InteractiveBackground from './InteractiveBackground';
import ZeroTrustPipeline from './ZeroTrustPipeline';
import MetricsGrid from './MetricsGrid';
import IdentityEngine from './IdentityEngine';
import CybersecurityEngine from './CybersecurityEngine';
import TrustMeter from './TrustMeter';
import ActivityLedger from './ActivityLedger';
import LogisticsTelemetry from './LogisticsTelemetry';

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

  return (
    <DataProvider>
      <InteractiveBackground isDark={isDark} />

      {/* Navigation */}
      <nav className="fixed w-full z-50 glass-nav transition-all duration-300" id="navbar">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
                <div className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative">
                        <Hexagon className="text-brand-600 dark:text-brand-400 h-8 w-8 relative z-10 transition-transform group-hover:rotate-90 duration-500" />
                        <div className="absolute inset-0 bg-brand-500 blur-lg opacity-0 group-hover:opacity-50 transition-opacity duration-300"></div>
                    </div>
                    <span className="font-bold text-2xl tracking-tight text-slate-900 dark:text-white">Nexium</span>
                </div>
                <div className="flex items-center gap-5">
                    <button onClick={() => setIsDark(!isDark)} className="p-2 rounded-full hover:bg-slate-200/50 dark:hover:bg-slate-800/50 transition-colors focus:outline-none">
                        {isDark ? <Sun className="h-5 w-5 text-amber-500" /> : <Moon className="h-5 w-5 text-slate-600" />}
                    </button>
                    <div id="nav-system-status" className="hidden sm:flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 transition-all">
                        <span className="relative flex h-2.5 w-2.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                        </span>
                        <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 tracking-wide uppercase">System Online</span>
                    </div>
                </div>
            </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative z-10 pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        
        {/* Hero: Investor Pitch */}
        <header className="text-center mt-4 mb-24 reveal active">
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full glass-panel text-brand-700 dark:text-brand-300 text-sm font-semibold mb-8 animate-float cursor-default">
                <span className="relative flex h-2 w-2 mr-1">
                    <span className="animate-ping absolute h-full w-full rounded-full bg-brand-400 opacity-75"></span>
                    <span className="relative rounded-full h-2 w-2 bg-brand-500"></span>
                </span>
                Nexium Trust Engine v3.0 Live
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 text-slate-900 dark:text-white leading-tight">
                BlockChain-Enabled <br className="hidden md:block"/>
                <span className="text-gradient">Identity & Trust Management System</span>
            </h1>
            <p className="mt-6 max-w-3xl mx-auto text-lg md:text-xl text-slate-600 dark:text-slate-400 font-light leading-relaxed">
                An interactive full-stack simulation demonstrating real-time cryptographic identity provisioning, behavioral anomaly detection, and automated threat mitigation.
            </p>
            <div className="mt-12 flex justify-center gap-4">
                <button onClick={() => document.getElementById('demo-section')?.scrollIntoView({behavior: 'smooth', block: 'start'})} className="bg-brand-600 hover:bg-brand-500 text-white font-bold py-4 px-10 rounded-full shadow-[0_0_20px_rgba(37,99,235,0.3)] transition-all hover:scale-105 active:scale-95 flex items-center gap-3">
                    Launch Live Demo <ArrowDown className="w-5 h-5" />
                </button>
            </div>
        </header>

        {/* Live Trust Evaluation Pipeline */}
        <ZeroTrustPipeline />

        {/* System Monitor Bar */}
        <MetricsGrid />

        {/* Supply Chain Section */}
        <LogisticsTelemetry />

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Identity & Security Controls */}
            <div className="lg:col-span-1 space-y-8">
                <IdentityEngine />
                <CybersecurityEngine />
            </div>

            {/* Middle/Right Column: Analytics & Ledger */}
            <div className="lg:col-span-2 space-y-8">
                <div className="grid grid-cols-1 gap-8">
                    <TrustMeter />
                </div>
                <ActivityLedger />
            </div>
        </div>
      </main>

    </DataProvider>
  );
}
