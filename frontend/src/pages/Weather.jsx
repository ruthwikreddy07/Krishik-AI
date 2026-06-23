import React, { useState, useEffect, useContext } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, Legend 
} from 'recharts';
import { CloudSun, Sun, CloudRain, Thermometer, Droplet, Wind, AlertCircle, RefreshCw, MapPin, Leaf } from 'lucide-react';
import { AppContext } from '../context/AppContext';
import { getWeatherByFarmer, getWeatherByLocation } from '../services/api';

export const Weather = () => {
  const { user } = useContext(AppContext);
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchWeather = async () => {
    setLoading(true);
    setError(null);
    try {
      if (user?.id && user.id !== 99999) {
        // Registered farmer — use their stored GPS coords
        const data = await getWeatherByFarmer(user.id);
        setWeather(data);
      } else {
        // Demo mode — use browser geolocation or Hyderabad coords
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            async (pos) => {
              const data = await getWeatherByLocation(pos.coords.latitude, pos.coords.longitude);
              // Wrap into same shape
              setWeather({ ...data, farmer_id: 99999, location: 'Your Location', forecast: data.forecast_days, current: buildCurrentFromForecast(data.forecast_days), irrigation_advisory: '⚠️ Register for personalized irrigation advisory.', crop_advisory: '⚠️ Register for crop-specific recommendations.' });
              setLoading(false);
            },
            async () => {
              // Geolocation denied — use Nalgonda as default
              const data = await getWeatherByLocation(17.0575, 79.2671);
              setWeather({ forecast_days: data.forecast_days, location: 'Nalgonda, Telangana', current: buildCurrentFromForecast(data.forecast_days), irrigation_advisory: 'Register to get personalized advisory.', crop_advisory: 'Register to get crop-specific recommendations.' });
              setLoading(false);
            }
          );
          return;
        } else {
          const data = await getWeatherByLocation(17.0575, 79.2671);
          setWeather({ forecast_days: data.forecast_days, location: 'Nalgonda, Telangana', current: buildCurrentFromForecast(data.forecast_days), irrigation_advisory: 'Register to get personalized advisory.', crop_advisory: 'Register to get crop-specific recommendations.' });
        }
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load weather data.');
    } finally {
      setLoading(false);
    }
  };

  // Build a fake "current" from first forecast day if needed
  const buildCurrentFromForecast = (forecastDays) => {
    if (!forecastDays?.length) return { temperature: 30, humidity: 65, wind_speed: 15, soil_temperature: 28, soil_moisture: 0.2, description: 'Loading...' };
    const today = forecastDays[0];
    return {
      temperature: ((today.temp_max || today.temp_max_c || 30) + (today.temp_min || today.temp_min_c || 22)) / 2,
      humidity: today.avg_humidity_pct || today.avg_humidity || 65,
      wind_speed: today.wind_speed_max_kmh || today.wind_speed_max || 15,
      soil_temperature: today.avg_soil_temp_c || today.avg_soil_temperature || 28,
      soil_moisture: today.avg_soil_moisture_m3m3 || today.avg_soil_moisture || 0.2,
      description: 'Current conditions',
      rain_mm: today.rain_sum_mm || today.rain_sum || 0,
    };
  };

  useEffect(() => { fetchWeather(); }, [user?.id]);

  // Normalize forecast array across both endpoint shapes
  const getForecastDays = () => {
    if (!weather) return [];
    const days = weather.forecast || weather.forecast_days || [];
    return days.slice(0, 7).map((d, i) => ({
      day: new Date(d.date || Date.now() + i * 86400000).toLocaleDateString('en-IN', { weekday: 'short' }),
      temp_min: d.temp_min ?? d.temp_min_c ?? 22,
      temp_max: d.temp_max ?? d.temp_max_c ?? 32,
      rain_sum: d.rain_sum ?? d.rain_sum_mm ?? 0,
      rain_probability: d.rain_probability ?? d.rain_probability_pct ?? 0,
      wind_speed_max: d.wind_speed_max ?? d.wind_speed_max_kmh ?? 15,
      avg_humidity: d.avg_humidity ?? d.avg_humidity_pct ?? 60,
    }));
  };

  const forecastDays = getForecastDays();

  // Chart data
  const chartData = forecastDays.map(d => ({
    day: d.day,
    temp: Math.round((d.temp_max + d.temp_min) / 2),
    rainProb: Math.round(d.rain_probability),
    humidity: Math.round(d.avg_humidity),
  }));

  // Forecast card icon helper
  const getWeatherIcon = (rainProb, tempMax) => {
    if (rainProb > 70) return { Icon: CloudRain, color: 'text-blue-400', label: 'Heavy Rain' };
    if (rainProb > 40) return { Icon: CloudSun, color: 'text-blue-300', label: 'Scattered Rain' };
    if (tempMax > 38) return { Icon: Sun, color: 'text-orange-400', label: 'Hot & Sunny' };
    return { Icon: Sun, color: 'text-amber-400', label: 'Sunny' };
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center animate-pulse">
          <CloudSun className="w-8 h-8 text-blue-400" />
        </div>
        <p className="text-slate-400 font-mono text-sm">Fetching live weather data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-panel p-8 rounded-2xl border border-red-500/20 flex flex-col items-center gap-4 text-center">
        <AlertCircle className="w-10 h-10 text-red-400" />
        <div>
          <p className="text-slate-200 font-semibold">Could not load weather data</p>
          <p className="text-xs text-slate-400 mt-1">{error}</p>
          <p className="text-xs text-slate-500 mt-1">GPS coordinates might not be set in your profile.</p>
        </div>
        <button onClick={fetchWeather} className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors">
          <RefreshCw className="w-4 h-4" /> Try Again
        </button>
      </div>
    );
  }

  const current = weather?.current || {};

  return (
    <div className="space-y-8 page-fade-in">
      
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/40 flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.3)]">
            <CloudSun className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold font-heading text-slate-100 glow-text-blue">Hyperlocal Weather Analytics</h2>
            <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {weather?.location || 'Telangana, India'} — Powered by Open-Meteo API
            </p>
          </div>
        </div>
        <button onClick={fetchWeather} className="flex items-center gap-2 text-xs text-slate-400 hover:text-blue-400 transition-colors glass-panel px-3 py-2 rounded-lg border border-green-500/10">
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </button>
      </div>

      {/* Irrigation & Crop Advisory */}
      {(weather?.irrigation_advisory || weather?.crop_advisory) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {weather?.irrigation_advisory && (
            <div className="border border-blue-500/30 bg-blue-950/20 p-4 rounded-2xl flex gap-3 items-start glass-panel">
              <Droplet className="w-5 h-5 flex-shrink-0 text-blue-400 mt-0.5" />
              <div>
                <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">Irrigation Advisory</span>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">{weather.irrigation_advisory}</p>
              </div>
            </div>
          )}
          {weather?.crop_advisory && (
            <div className="border border-green-500/30 bg-green-950/20 p-4 rounded-2xl flex gap-3 items-start glass-panel">
              <Leaf className="w-5 h-5 flex-shrink-0 text-green-400 mt-0.5" />
              <div>
                <span className="text-xs font-bold text-green-400 uppercase tracking-wider">Crop Advisory</span>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">{weather.crop_advisory}</p>
              </div>
            </div>
          )}
        </div>
      )}

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
                  <Area type="monotone" dataKey="temp" name="Avg Temp (°C)" stroke="#f59e0b" fillOpacity={1} fill="url(#colorTemp)" strokeWidth={2} />
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
              <span className="block text-[10px] font-mono text-slate-500">TEMPERATURE</span>
              <span className="text-xl font-bold font-heading text-slate-200">{current.temperature?.toFixed(1) || '--'} °C</span>
              <span className="block text-[10px] text-slate-500">{current.description || ''}</span>
            </div>
          </div>

          <div className="glass-panel p-5 rounded-xl border border-green-500/10 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-green-500/10 border border-green-500/30 flex items-center justify-center">
              <Droplet className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <span className="block text-[10px] font-mono text-slate-500">REL. HUMIDITY</span>
              <span className="text-xl font-bold font-heading text-slate-200">{current.humidity?.toFixed(1) || '--'}%</span>
              <span className="block text-[10px] text-slate-500">Soil Moisture: {(current.soil_moisture * 100)?.toFixed(1) || '--'}%</span>
            </div>
          </div>

          <div className="glass-panel p-5 rounded-xl border border-green-500/10 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-green-500/10 border border-green-500/30 flex items-center justify-center">
              <Wind className="w-5 h-5 text-teal-400 animate-spin" style={{ animationDuration: '6s' }} />
            </div>
            <div>
              <span className="block text-[10px] font-mono text-slate-500">WIND SPEED</span>
              <span className="text-xl font-bold font-heading text-slate-200">{current.wind_speed?.toFixed(1) || '--'} km/h</span>
              <span className="block text-[10px] text-slate-500">Soil Temp: {current.soil_temperature?.toFixed(1) || '--'}°C</span>
            </div>
          </div>

        </div>

      </div>

      {/* 7-Day Forecast Cards */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold font-heading text-slate-200">7-Day Local Forecast</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4">
          {forecastDays.map((f, idx) => {
            const { Icon, color, label } = getWeatherIcon(f.rain_probability, f.temp_max);
            return (
              <div key={idx} className="glass-panel p-4 rounded-xl text-center border border-green-500/5 card-3d flex flex-col items-center justify-center gap-2">
                <span className="font-mono text-slate-500 text-xs uppercase">{f.day}</span>
                <Icon className={`w-8 h-8 ${color} my-1`} />
                <span className="font-bold text-slate-200 font-heading">{Math.round(f.temp_max)}°C</span>
                <span className="text-[10px] text-blue-400 font-mono">{Math.round(f.rain_probability)}% rain</span>
                <span className="text-[10px] text-slate-400 leading-none">{label}</span>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
