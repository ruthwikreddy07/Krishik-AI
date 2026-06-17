import React, { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { 
  Sprout, 
  CloudSun, 
  MapPin, 
  AlertTriangle, 
  CalendarDays, 
  Droplet, 
  LineChart, 
  Thermometer, 
  ArrowUpRight 
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const Dashboard = () => {
  const { user, t } = useContext(AppContext);

  // Simulated metrics
  const activeCrops = [
    { name: "Paddy (Rice)", stage: "Vegetative Phase", progress: 65, sown: "May 10, 2026", color: "bg-green-500" },
    { name: "Cotton", stage: "Flowering Phase", progress: 40, sown: "June 02, 2026", color: "bg-emerald-400" }
  ];

  const alerts = [
    { type: "weather", message: "Heavy rainfall predicted in Nalgonda within next 48 hours.", severity: "high", color: "border-red-500/30 bg-red-950/20 text-red-400" },
    { type: "disease", message: "Leaf Blast advisory active for neighboring farms.", severity: "medium", color: "border-amber-500/30 bg-amber-950/20 text-amber-400" }
  ];

  const tasks = [
    { task: "Apply Potassium Nitrogen Fertilizer to Paddy", due: "Today", completed: false },
    { task: "Initiate Irrigation cycles due to rising dry heat", due: "Tomorrow", completed: false },
    { task: "Inspect cotton leaves for whitefly activity", due: "June 20", completed: false }
  ];

  return (
    <div className="space-y-6 page-fade-in">
      {/* Upper Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-green-950/40 to-slate-950/40 p-6 rounded-2xl border border-green-500/20 glass-panel">
        <div>
          <h2 className="text-2xl font-bold font-heading text-slate-100 glow-text-green">{t('welcomeBack')}</h2>
          <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5 font-mono">
            <MapPin className="w-3.5 h-3.5 text-green-400" />
            <span>Farm Location: {user?.village || "Nalgonda, Telangana"} | Soil: {user?.soilType || "Red Sandy"}</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-right font-mono text-xs text-slate-400">
            <div>FARM SIZE: <span className="text-green-400 font-semibold">{user?.landSize || "4.5"} Acres</span></div>
            <div>WATER: <span className="text-blue-400 font-semibold">{user?.waterSource || "Borewell"}</span></div>
          </div>
        </div>
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Item 1: Active Crops Tracker (6 columns) */}
        <div className="md:col-span-8 glass-panel p-6 rounded-2xl border border-green-500/20 card-3d flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold font-heading text-slate-100 flex items-center gap-2">
                <Sprout className="w-5 h-5 text-green-400" />
                <span>Active Crop Tracks</span>
              </h3>
              <Link to="/crops" className="text-xs font-mono text-green-400 hover:underline flex items-center gap-1">
                <span>Manage Crops</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            
            <div className="space-y-4">
              {activeCrops.map((crop, idx) => (
                <div key={idx} className="bg-slate-950/40 border border-green-500/10 rounded-xl p-4">
                  <div className="flex justify-between items-center mb-2">
                    <div>
                      <h4 className="font-semibold text-slate-200">{crop.name}</h4>
                      <p className="text-xs text-slate-400">{crop.stage} • Sown {crop.sown}</p>
                    </div>
                    <span className="text-xs font-mono text-green-400 font-bold bg-green-500/10 px-2 py-1 rounded-md border border-green-500/20">{crop.progress}% Progress</span>
                  </div>
                  {/* Progress bar */}
                  <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                    <div className={`${crop.color} h-full rounded-full shadow-[0_0_10px_rgba(34,197,94,0.4)]`} style={{ width: `${crop.progress}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Item 2: Quick Weather Panel (4 columns) */}
        <div className="md:col-span-4 glass-panel-blue p-6 rounded-2xl border border-blue-500/20 card-3d-blue flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold font-heading text-slate-100 flex items-center gap-2">
                <CloudSun className="w-5 h-5 text-blue-400" />
                <span>Live Weather</span>
              </h3>
              <Link to="/weather" className="text-xs font-mono text-blue-400 hover:underline flex items-center gap-1">
                <span>View Analytics</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            
            <div className="text-center py-4 space-y-2">
              <div className="flex justify-center items-center gap-2 text-5xl font-extrabold text-blue-100 glow-text-blue font-heading">
                <Thermometer className="w-10 h-10 text-amber-500" />
                <span>32°C</span>
              </div>
              <p className="text-sm font-semibold text-slate-200">Partly Cloudy • Humidity 62%</p>
              <p className="text-xs text-slate-400">Wind: 14 km/h West | Rainfall Prob: 20%</p>
            </div>
          </div>

          <div className="border-t border-blue-500/10 pt-3 flex items-center justify-between text-xs font-mono text-slate-400">
            <span>Tomorrow: 34°C / Rain</span>
            <span className="text-blue-400 font-bold bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">Dry Sowing Alert</span>
          </div>
        </div>

        {/* Item 3: Alerts Ticker (6 columns) */}
        <div className="md:col-span-6 glass-panel p-6 rounded-2xl border border-green-500/20 card-3d flex flex-col">
          <h3 className="text-lg font-bold font-heading text-slate-100 flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            <span>Critical Farm Alerts</span>
          </h3>

          <div className="space-y-3 flex-grow justify-start">
            {alerts.map((alert, idx) => (
              <div key={idx} className={`border p-3.5 rounded-xl text-xs leading-relaxed flex gap-3 items-start ${alert.color}`}>
                <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                <span>{alert.message}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Item 4: Upcoming Reminders (6 columns) */}
        <div className="md:col-span-6 glass-panel p-6 rounded-2xl border border-green-500/20 card-3d flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold font-heading text-slate-100 flex items-center gap-2 mb-4">
              <CalendarDays className="w-5 h-5 text-green-400" />
              <span>Upcoming Farm Activities</span>
            </h3>

            <div className="space-y-3">
              {tasks.map((t, idx) => (
                <div key={idx} className="flex items-center justify-between bg-slate-950/20 border border-green-500/5 rounded-xl p-3.5">
                  <div className="flex items-center gap-3">
                    <input type="checkbox" className="w-4 h-4 rounded border-green-500/30 text-green-600 bg-slate-950 focus:ring-green-500" readOnly checked={t.completed} />
                    <span className="text-xs text-slate-200">{t.task}</span>
                  </div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-green-400 bg-green-500/10 border border-green-500/20 px-2 py-0.5 rounded-md">{t.due}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Item 5: Smart Irrigation Status (12 columns full width) */}
        <div className="md:col-span-12 glass-panel p-6 rounded-2xl border border-green-500/20 card-3d flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/40 flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.2)]">
              <Droplet className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h4 className="font-heading font-bold text-slate-200 text-base">Smart Irrigation Assistant</h4>
              <p className="text-xs text-slate-400 mt-0.5">Automated water requirement forecasting based on current soil parameters and evaporation speeds.</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="font-mono text-xs">
              <div className="text-slate-400">EST. SOIL WATER LEVEL:</div>
              <div className="text-blue-400 font-bold text-lg">58% (OPTIMAL)</div>
            </div>
            <div className="font-mono text-xs">
              <div className="text-slate-400">NEXT WATERING SCHEDULE:</div>
              <div className="text-amber-400 font-bold text-lg">IN 18 HOURS</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
