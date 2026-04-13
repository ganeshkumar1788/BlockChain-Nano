import React, { useContext, useEffect, useState } from 'react';
import { LineChart } from 'lucide-react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Filler, Legend } from 'chart.js';
import { DataContext } from '../context/DataContext';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Filler, Legend);

export default function BehavioralAnalytics({ isDark }) {
  const { devices } = useContext(DataContext);
  const mainDevice = devices.find(d => d.deviceId === 'ESP32_01');
  const score = mainDevice ? mainDevice.trustScore : 50;

  const [history, setHistory] = useState(Array(15).fill(50));

  useEffect(() => {
    setHistory(prev => {
        const h = [...prev, score];
        if (h.length > 15) h.shift();
        return h;
    });
  }, [score]);

  const gridColor = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';
  const textColor = isDark ? '#94a3b8' : '#64748b';

  let bgFill = score >= 80 ? 'rgba(16, 185, 129, 0.3)' : score <= 30 ? 'rgba(244, 63, 94, 0.3)' : 'rgba(59, 130, 246, 0.3)';
  let borderColor = score >= 80 ? '#10b981' : score <= 30 ? '#f43f5e' : '#3b82f6';

  const data = {
      labels: Array(15).fill(''),
      datasets: [{
          label: 'Trust Score',
          data: history,
          borderColor: borderColor,
          backgroundColor: bgFill,
          borderWidth: 3,
          tension: 0.4,
          fill: true,
          pointRadius: 3,
          pointBackgroundColor: '#fff',
          pointBorderColor: borderColor,
          pointBorderWidth: 2,
          pointHoverRadius: 6
      }]
  };

  const options = {
      responsive: true, maintainAspectRatio: false,
      animation: { duration: 400, easing: 'easeOutQuart' },
      scales: {
          y: { 
              min: 0, max: 100, 
              grid: { color: gridColor, drawBorder: false },
              ticks: { font: { family: 'JetBrains Mono', size: 11, weight: '500' }, color: textColor, padding: 10 }
          },
          x: { grid: { display: false, drawBorder: false } }
      },
      plugins: { legend: { display: false }, tooltip: { enabled: false } },
      interaction: { intersect: false, mode: 'index' }
  };

  return (
    <div className="glass-panel rounded-3xl p-7 reveal active flex flex-col" style={{ transitionDelay: '300ms' }}>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2 flex justify-between items-center">
            Behavioral Analytics
            <LineChart className="text-slate-400 h-5 w-5" />
        </h2>
        <div className="text-xs text-slate-500 dark:text-slate-400 mb-6 font-medium leading-relaxed">
            Real-time trust degradation and recovery tracking over the last 15 epochs.
        </div>
        <div className="flex-1 w-full relative min-h-[180px]">
            <Line options={options} data={data} />
        </div>
    </div>
  );
}
