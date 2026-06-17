import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { 
  Sprout, CloudSun, MapPin, AlertTriangle, CalendarDays, 
  Droplet, LineChart, Thermometer, ArrowUpRight, RefreshCw
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { getCrops, getWeatherByFarmer, getWeatherByLocation } from '../services/api';

export const Dashboard = () => {
  const { user, t } = useContext(AppContext);
  const [crops, setCrops] = useState([]);
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch real data on mount
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Fetch crops if user is registered (not demo)
        if (user?.id && user.id !== 0) {
          const [cropsData] = await Promise.allSettled([
            getCrops(user.id),
            // Try fetching weather (requires GPS coords in profile)
            getWeatherByFarmer(user.id).then(setWeather).catch(() => null),
          ]);
          if (cropsData.status === 'fulfilled') setCrops(cropsData.value);
        } else {
          // Demo mode: fetch weather for Nalgonda
          try {
            const wd = await getWeatherByLocation(17.0575, 79.2671);
            setWeather(wd);
          } catch { /* ignore */ }
        }
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [user?.id]);

  // Build display crops: merge real data with fallback display
  const getStageProgress = (stage) => {
    const map = { 'Sowing': 10, 'Germination': 25, 'Vegetative': 50, 'Flowering': 65, 'Grain Filling': 80, 'Harvesting': 95, 'Harvested': 100 };
    return map[stage] || 30;
  };

  const displayCrops = crops.length > 0 ? crops.map(c => ({
    name: c.crop_name,
    stage: c.crop_stage,
    progress: getStageProgress(c.crop_stage),
    sown: new Date(c.sowing_date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }),
    color: 'bg-green-500',
  })) : [
    { name: "Paddy (Rice)", stage: "Vegetative Phase", progress: 65, sown: "May 10, 2026", color: "bg-green-500" },
    { name: "Cotton", stage: "Flowering Phase", progress: 40, sown: "June 02, 2026", color: "bg-emerald-400" },
  ];

  // Weather display values
  const getWeatherDisplay = () => {
    if (!weather) return { temp: '--', humidity: '--', windSpeed: '--', rainProb: '--', desc: 'Loading...' };
    const current = weather.current;
    const forecast = weather.forecast || weather.forecast_days || [];
    const tomorrow = forecast[1];
    return {
      temp: current?.temperature?.toFixed(0) || '--',
      humidity: current?.humidity?.toFixed(0) || '--',
      windSpeed: current?.wind_speed?.toFixed(0) || '--',
      rainProb: forecast[0]?.rain_probability || forecast[0]?.rain_probability_pct || '--',
      desc: current?.description || 'N/A',
      tomorrowTemp: tomorrow ? `${tomorrow.temp_max?.toFixed(0) || tomorrow.temp_max_c?.toFixed(0) || '--'}°C` : '--',
      location: weather.location || 'Telangana',
    };
  };

  const wx = getWeatherDisplay();

  // Smart alerts: generate based on real weather
  const alerts = [];
  if (weather) {
    const forecast = weather.forecast || weather.forecast_days || [];
    const rainDays = forecast.filter(d => (d.rain_probability || d.rain_probability_pct || 0) > 70);
    if (rainDays.length > 0) {
      alerts.push({ type: "weather", message: `Heavy rainfall expected on ${rainDays.map(d => new Date(d.date).toLocaleDateString('en-IN', { weekday: 'short' })).join(', ')}. Hold chemical spraying.`, severity: "high", color: "border-red-500/30 bg-red-950/20 text-red-400" });
    }
    if (weather.irrigation_advisory) {
      alerts.push({ type: "irrigation", message: weather.irrigation_advisory.replace(/\n/g, ' ').split('(')[0].trim(), severity: "medium", color: "border-blue-500/30 bg-blue-950/20 text-blue-400" });
    }
  }
  if (alerts.length === 0) {
    alerts.push({ type: "system", message: "All farm conditions are nominal. No critical alerts at this time.", severity: "low", color: "border-green-500/30 bg-green-950/20 text-green-400" });
  }

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
          <h2 className="text-2xl font-bold font-heading text-slate-100 glow-text-green">{t('welcomeBack')}, {user?.name || 'Farmer'}!</h2>
          <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5 font-mono">
            <MapPin className="w-3.5 h-3.5 text-green-400" />
            <span>
              {user?.village ? `${user.village}, Telangana` : 'Telangana'} 
              {user?.soilType && user.soilType !== '—' ? ` | Soil: ${user.soilType}` : ''}
              {user?.id === 0 && ' | (Demo Mode)'}
            </span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-right font-mono text-xs text-slate-400">
            {user?.landSize && user.landSize !== '—' && (
              <div>FARM SIZE: <span className="text-green-400 font-semibold">{user.landSize} Acres</span></div>
            )}
            {user?.waterSource && user.waterSource !== '—' && (
              <div>WATER: <span className="text-blue-400 font-semibold">{user.waterSource}</span></div>
            )}
          </div>
        </div>
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Item 1: Active Crops Tracker */}
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
            
            {loading ? (
              <div className="flex items-center gap-2 text-slate-500 font-mono text-sm py-4">
                <RefreshCw className="w-4 h-4 animate-spin" /> Loading your crops...
              </div>
            ) : (
              <div className="space-y-4">
                {displayCrops.map((crop, idx) => (
                  <div key={idx} className="bg-slate-950/40 border border-green-500/10 rounded-xl p-4">
                    <div className="flex justify-between items-center mb-2">
                      <div>
                        <h4 className="font-semibold text-slate-200">{crop.name}</h4>
                        <p className="text-xs text-slate-400">{crop.stage} • Sown {crop.sown}</p>
                      </div>
                      <span className="text-xs font-mono text-green-400 font-bold bg-green-500/10 px-2 py-1 rounded-md border border-green-500/20">{crop.progress}% Progress</span>
                    </div>
                    <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                      <div className={`${crop.color} h-full rounded-full shadow-[0_0_10px_rgba(34,197,94,0.4)]`} style={{ width: `${crop.progress}%`, transition: 'width 1s ease' }}></div>
                    </div>
                  </div>
                ))}
                {displayCrops.length === 0 && (
                  <div className="text-center py-8 text-slate-500 font-mono text-sm">
                    No active crops. <Link to="/crops" className="text-green-400 underline">Add your first crop →</Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Item 2: Live Weather Panel */}
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
                <span>{wx.temp}°C</span>
              </div>
              <p className="text-sm font-semibold text-slate-200">{wx.desc} • {wx.humidity}% Humidity</p>
              <p className="text-xs text-slate-400">Wind: {wx.windSpeed} km/h | Rain: {wx.rainProb}%</p>
              <p className="text-xs text-slate-500 font-mono">{wx.location}</p>
            </div>
          </div>

          <div className="border-t border-blue-500/10 pt-3 flex items-center justify-between text-xs font-mono text-slate-400">
            <span>Tomorrow: {wx.tomorrowTemp}</span>
            {weather?.irrigation_advisory && (
              <span className="text-blue-400 font-bold bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">Advisory Active</span>
            )}
          </div>
        </div>

        {/* Item 3: Alerts */}
        <div className="md:col-span-6 glass-panel p-6 rounded-2xl border border-green-500/20 card-3d flex flex-col">
          <h3 className="text-lg font-bold font-heading text-slate-100 flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            <span>Critical Farm Alerts</span>
          </h3>
          <div className="space-y-3 flex-grow">
            {alerts.map((alert, idx) => (
              <div key={idx} className={`border p-3.5 rounded-xl text-xs leading-relaxed flex gap-3 items-start ${alert.color}`}>
                <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                <span>{alert.message}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Item 4: Farm Activities */}
        <div className="md:col-span-6 glass-panel p-6 rounded-2xl border border-green-500/20 card-3d flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold font-heading text-slate-100 flex items-center gap-2 mb-4">
              <CalendarDays className="w-5 h-5 text-green-400" />
              <span>Upcoming Farm Activities</span>
            </h3>
            <div className="space-y-3">
              {tasks.map((task, idx) => (
                <div key={idx} className="flex items-center justify-between bg-slate-950/20 border border-green-500/5 rounded-xl p-3.5">
                  <div className="flex items-center gap-3">
                    <input type="checkbox" className="w-4 h-4 rounded border-green-500/30 text-green-600 bg-slate-950 focus:ring-green-500" readOnly checked={task.completed} />
                    <span className="text-xs text-slate-200">{task.task}</span>
                  </div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-green-400 bg-green-500/10 border border-green-500/20 px-2 py-0.5 rounded-md">{task.due}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Item 5: Smart Irrigation */}
        <div className="md:col-span-12 glass-panel p-6 rounded-2xl border border-green-500/20 card-3d flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/40 flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.2)]">
              <Droplet className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h4 className="font-heading font-bold text-slate-200 text-base">Smart Irrigation Assistant</h4>
              {weather?.irrigation_advisory ? (
                <p className="text-xs text-slate-400 mt-0.5 max-w-2xl">{weather.irrigation_advisory.split('\n')[0]}</p>
              ) : (
                <p className="text-xs text-slate-400 mt-0.5">Automated water requirement forecasting based on soil moisture and evaporation rates.</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="font-mono text-xs">
              <div className="text-slate-400">SOIL MOISTURE:</div>
              <div className="text-blue-400 font-bold text-lg">
                {weather?.current?.soil_moisture != null
                  ? `${(weather.current.soil_moisture * 100).toFixed(0)}%`
                  : '-- %'}
              </div>
            </div>
            <div className="font-mono text-xs">
              <div className="text-slate-400">SOIL TEMP:</div>
              <div className="text-amber-400 font-bold text-lg">
                {weather?.current?.soil_temperature != null
                  ? `${weather.current.soil_temperature.toFixed(1)}°C`
                  : '--°C'}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
