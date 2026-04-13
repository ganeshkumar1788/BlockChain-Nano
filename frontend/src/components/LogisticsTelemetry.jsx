import React from 'react';
import { useData } from '../context/DataContext';
import { Package, Thermometer, Droplets, Move, Activity, Truck } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const LogisticsTelemetry = () => {
    const { industryData, transportData, history } = useData();

    const chartData = {
        labels: history.labels,
        datasets: [
            {
                label: 'Temperature (°C)',
                data: history.temp,
                borderColor: '#f87171',
                backgroundColor: 'rgba(248, 113, 113, 0.1)',
                fill: true,
                tension: 0.4,
                pointRadius: 0
            },
            {
                label: 'Humidity (%)',
                data: history.hum,
                borderColor: '#60a5fa',
                backgroundColor: 'rgba(96, 165, 250, 0.1)',
                fill: true,
                tension: 0.4,
                pointRadius: 0
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: { mode: 'index', intersect: false }
        },
        scales: {
            x: { display: false },
            y: { 
                grid: { color: 'rgba(255,255,255,0.05)' },
                ticks: { color: '#64748b', font: { size: 10 } }
            },
        },
    };

    return (
        <section className="mb-12 reveal active">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-brand-500/10 rounded-lg">
                    <Package className="text-brand-500 w-6 h-6" />
                </div>
                <h2 className="text-2xl font-bold dark:text-white">Supply Chain Logistics</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Industry Cluster Card */}
                <div className="glass-panel p-6 rounded-3xl border-l-4 border-l-blue-500">
                    <div className="flex justify-between items-start mb-4">
                        <span className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Industry Cluster</span>
                        <Activity className="w-5 h-5 text-blue-400" />
                    </div>
                    {industryData ? (
                         <div>
                            <div className="text-2xl font-bold dark:text-white mb-1">{industryData.package_id}</div>
                            <div className="text-xs text-slate-500 truncate mb-3">ID: {industryData.device_id}</div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 text-emerald-500 rounded-full text-xs font-bold">
                                MANUFACTURED
                            </div>
                         </div>
                    ) : (
                        <div className="text-slate-500 text-sm animate-pulse">Waiting for industry signal...</div>
                    )}
                </div>

                {/* Transport Cluster Card */}
                <div className="glass-panel p-6 rounded-3xl border-l-4 border-l-amber-500">
                    <div className="flex justify-between items-start mb-4">
                        <span className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Transport Cluster</span>
                        <Truck className="w-5 h-5 text-amber-500" />
                    </div>
                    {transportData ? (
                         <div>
                            <div className="text-2xl font-bold dark:text-white mb-1">{transportData.package_id}</div>
                            <div className="text-xs text-slate-500 truncate mb-3">ID: {transportData.device_id}</div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 text-amber-500 rounded-full text-xs font-bold">
                                IN TRANSIT
                            </div>
                         </div>
                    ) : (
                        <div className="text-slate-500 text-sm animate-pulse">Waiting for transport signal...</div>
                    )}
                </div>

                {/* Transport Sensors Grid - Col Span 2 */}
                <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <SensorCard 
                        icon={<Thermometer className="text-red-400" />}
                        label="Temperature"
                        value={transportData ? `${transportData.temperature.toFixed(1)}°C` : '--'}
                        status={transportData ? 'STABLE' : 'OFFLINE'}
                    />
                    <SensorCard 
                        icon={<Droplets className="text-blue-400" />}
                        label="Humidity"
                        value={transportData ? `${transportData.humidity.toFixed(1)}%` : '--'}
                        status={transportData ? 'OPTIMAL' : 'OFFLINE'}
                    />
                    
                    {/* Charts taking up bottom row span */}
                    <div className="glass-panel p-5 rounded-3xl md:col-span-2 min-h-[100px] relative overflow-hidden">
                        <div className="absolute inset-0 opacity-40">
                             <Line data={chartData} options={chartOptions} />
                        </div>
                        <div className="relative z-10 flex justify-between items-center">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <Move className="w-4 h-4 text-amber-400" />
                                    <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Live Telemetry</span>
                                </div>
                                <div className="text-lg font-bold dark:text-white">Trend Analysis</div>
                                <div className="text-[10px] text-slate-500">Movement: {transportData ? `${transportData.movement.toFixed(1)} G` : '0.0 G'}</div>
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono">
                                SIG: {transportData ? transportData.signature.substring(0, 12) + '...' : 'SEC_NULL'}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

const SensorCard = ({ icon, label, value, status }) => (
    <div className="glass-panel p-6 rounded-3xl hover-scale transition-all">
        <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
                {icon}
            </div>
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">{label}</span>
        </div>
        <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold dark:text-white">{value}</span>
            <span className="text-[9px] font-bold text-emerald-500">{status}</span>
        </div>
    </div>
);

export default LogisticsTelemetry;
