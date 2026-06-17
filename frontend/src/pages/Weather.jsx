import React from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, Legend 
} from 'recharts';
import { CloudSun, Sun, CloudRain, Thermometer, Droplet, Wind, AlertCircle } from 'lucide-react';

export const Weather = () => {
  // Simulated weather trend data for Recharts
  const chartData = [
    { day: "Mon", temp: 31, humidity: 65, rainProb: 15 },
    { day: "Tue", temp: 33, humidity: 60, rainProb: 10 },
    { day: "Wed", temp: 32, humidity: 62, rainProb: 20 },
    { day: "Thu", temp: 29, humidity: 78, rainProb: 85 },
    { day: "Fri", temp: 28, humidity: 82, rainProb: 90 },
    { day: "Sat", temp: 30, humidity: 70, rainProb: 40 },
    { day: "Sun", temp: 32, humidity: 65, rainProb: 10 }
  ];

  // 7-Day Forecast Cards
  const forecast = [
    { day: "Mon", temp: "31°C", label: "Partly Cloudy", icon: CloudSun, color: "text-blue-400" },
    { day: "Tue", temp: "33°C", label: "Sunny", icon: Sun, color: "text-amber-400" },
    { day: "Wed", temp: "32°C", label: "Hazy Sun", icon: Sun, color: "text-amber-400" },
    { day: "Thu", temp: "29°C", label: "Heavy Rain", icon: CloudRain, color: "text-blue-400" },
    { day: "Fri", temp: "28°C", label: "Thunderstorms", icon: CloudRain, color: "text-blue-400" },
    { day: "Sat", temp: "30°C", label: "Scattered Rain", icon: CloudSun, color: "text-blue-300" },
    { day: "Sun", temp: "32°C", label: "Clearing Sky", icon: Sun, color: "text-amber-400" }
  ];

  return (
    <div className="space-y-8 page-fade-in">
      
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/40 flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.3)]">
          <CloudSun className="w-5 h-5 text-blue-400" />
        </div>
        <div>
          <h2 className="text-2xl font-bold font-heading text-slate-100 glow-text-blue">Hyperlocal Weather Analytics</h2>
          <p className="text-xs text-slate-400 mt-0.5">Real-time IMD-linked meteorological metrics for precise crop irrigation and sowing scheduling.</p>
        </div>
      </div>

      {/* Warning Box */}
      <div className="border border-red-500/30 bg-red-950/20 text-red-400 p-4 rounded-2xl flex gap-3 items-center glass-panel">
        <AlertCircle className="w-6 h-6 flex-shrink-0 text-red-500 animate-pulse" />
        <div className="text-xs">
          <span className="font-bold">HEAVY PRECIPITATION ADVISORY:</span> Sowing and chemical fertilizing activities should be put on hold for Thursday & Friday due to an approaching cyclonic weather front over Telangana.
        </div>
      </div>

      {/* Main Grid: Live Details & Recharts (AreaChart) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Weekly Area Trend Chart (8 columns) */}
        <div className="lg:col-span-8 glass-panel-blue p-6 rounded-2xl border border-blue-500/20 card-3d-blue flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold font-heading text-slate-200 mb-6 flex items-center gap-2">
              <LineChart className="w-4 h-4 text-blue-400" />
              <span>7-Day Meteorological Outlook</span>
            </h3>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorRain" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="day" stroke="rgba(255,255,255,0.3)" style={{ fontSize: '11px', fontFamily: 'monospace' }} />
                  <YAxis stroke="rgba(255,255,255,0.3)" style={{ fontSize: '11px', fontFamily: 'monospace' }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'rgba(5, 11, 7, 0.95)', borderColor: 'rgba(34, 197, 94, 0.3)', borderRadius: '12px' }}
                    labelStyle={{ color: '#22c55e', fontFamily: 'monospace', fontWeight: 'bold' }}
                    itemStyle={{ color: '#fff', fontSize: '12px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Area type="monotone" dataKey="temp" name="Temp (°C)" stroke="#f59e0b" fillOpacity={1} fill="url(#colorTemp)" strokeWidth={2} />
                  <Area type="monotone" dataKey="rainProb" name="Rain Probability (%)" stroke="#3b82f6" fillOpacity={1} fill="url(#colorRain)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Current Core Indicators (4 columns) */}
        <div className="lg:col-span-4 grid grid-cols-1 gap-4">
          
          <div className="glass-panel p-5 rounded-xl border border-green-500/10 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-green-500/10 border border-green-500/30 flex items-center justify-center">
              <Thermometer className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <span className="block text-[10px] font-mono text-slate-500">MAX TEMPERATURE</span>
              <span className="text-xl font-bold font-heading text-slate-200">32.4 °C</span>
            </div>
          </div>

          <div className="glass-panel p-5 rounded-xl border border-green-500/10 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-green-500/10 border border-green-500/30 flex items-center justify-center">
              <Droplet className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <span className="block text-[10px] font-mono text-slate-500">REL. HUMIDITY</span>
              <span className="text-xl font-bold font-heading text-slate-200">62.8%</span>
            </div>
          </div>

          <div className="glass-panel p-5 rounded-xl border border-green-500/10 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-green-500/10 border border-green-500/30 flex items-center justify-center">
              <Wind className="w-5 h-5 text-teal-400 animate-spin" style={{ animationDuration: '6s' }} />
            </div>
            <div>
              <span className="block text-[10px] font-mono text-slate-500">WIND SPEED & DIRECTION</span>
              <span className="text-xl font-bold font-heading text-slate-200">14.6 km/h WNW</span>
            </div>
          </div>

        </div>

      </div>

      {/* 7-Day Forecast Cards Scrollable */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold font-heading text-slate-200">7-Day Local Forecast</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4">
          {forecast.map((f, idx) => {
            const Icon = f.icon;
            return (
              <div key={idx} className="glass-panel p-4 rounded-xl text-center border border-green-500/5 card-3d flex flex-col items-center justify-center gap-2">
                <span className="font-mono text-slate-500 text-xs uppercase">{f.day}</span>
                <Icon className={`w-8 h-8 ${f.color} my-1 animate-pulse`} />
                <span className="font-bold text-slate-200 font-heading">{f.temp}</span>
                <span className="text-[10px] text-slate-400 leading-none">{f.label}</span>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
