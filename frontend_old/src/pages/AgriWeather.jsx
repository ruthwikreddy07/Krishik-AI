import React, { useState } from 'react';
import {
  CloudSun,
  Droplets,
  Wind,
  Calendar,
  Clock,
  AlertTriangle,
  Info,
  ChevronRight,
  TrendingUp,
  MapPin,
  Compass,
  Zap,
  TrendingDown,
  Sparkles,
  CloudRain
} from 'lucide-react';
import { StatusChip } from '../components';

export default function AgriWeather() {
  const [conditionTab, setConditionTab] = useState('rainy'); // 'sunny' | 'cloudy' | 'rainy'
  const [hoveredBar, setHoveredBar] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  // Weather states database
  const weatherStates = {
    sunny: {
      temp: 36,
      bg: 'from-amber-400 via-orange-400 to-yellow-500 text-white',
      advisoryTe: 'ఎండ తీవ్రత ఎక్కువగా ఉంది. మధ్యాహ్నం వేళలో పత్తి పంటకు రసాయన పిచికారీ నిలిపివేయండి.',
      advisoryEn: 'High heat intensity. Avoid spraying pesticides on cotton during noon hours.',
      feelsLike: 40,
      humidity: 35,
      wind: 16,
      conditionTe: 'ఎండగా ఉంది / Sunny Day',
      tipTe: 'పత్తి పంటకు ఈరోజు నీరు పోయడం అవసరం లేదు'
    },
    cloudy: {
      temp: 30,
      bg: 'from-slate-400 via-gray-400 to-slate-500 text-white',
      advisoryTe: 'మేఘావృతమై ఉంది. గాలి వేగం సాధారణం కంటే తక్కువగా ఉంది. కలుపు తీసే పనులకు అనుకూలం.',
      advisoryEn: 'Overcast skies. Wind speeds are below normal. Favorable for manual weeding.',
      feelsLike: 33,
      humidity: 65,
      wind: 8,
      conditionTe: 'మేఘావృతం / Cloudy Sky',
      tipTe: 'సాయంత్రం వేళల్లో వరి పంటను పర్యవేక్షించండి'
    },
    rainy: {
      temp: 27,
      bg: 'from-blue-600 via-indigo-700 to-slate-800 text-white',
      advisoryTe: 'భారీ వర్షం పడే అవకాశం ఉంది. వరి మడుల గట్లు బలోపేతం చేయండి. సాగు నీటి మోటార్లు నిలిపివేయండి.',
      advisoryEn: 'Heavy precipitation forecast. Strengthen rice field bunds. Turn off all borewell pumps.',
      feelsLike: 29,
      humidity: 85,
      wind: 24,
      conditionTe: 'భారీ వర్షం / Heavy Rainfall',
      tipTe: 'పత్తి పంటకు ఈరోజు నీరు పోయడం అవసరం లేదు'
    }
  };

  const activeWeather = weatherStates[conditionTab];

  // 14 Days History + 7 Days Prediction rainfall database
  const rainfallData = [
    { day: '04 Jun', amount: 5, type: 'past' },
    { day: '05 Jun', amount: 12, type: 'past' },
    { day: '06 Jun', amount: 8, type: 'past' },
    { day: '07 Jun', amount: 22, type: 'past' },
    { day: '08 Jun', amount: 0, type: 'past' },
    { day: '09 Jun', amount: 2, type: 'past' },
    { day: '10 Jun', amount: 14, type: 'past' },
    { day: '11 Jun', amount: 35, type: 'past' },
    { day: '12 Jun', amount: 4, type: 'past' },
    { day: '13 Jun', amount: 0, type: 'past' },
    { day: '14 Jun', amount: 15, type: 'past' },
    { day: '15 Jun', amount: 25, type: 'past' },
    { day: '16 Jun', amount: 48, type: 'past' },
    { day: '17 Jun (Today)', amount: 18, type: 'past' },
    { day: '18 Jun (Proj)', amount: 30, type: 'predicted' },
    { day: '19 Jun (Proj)', amount: 25, type: 'predicted' },
    { day: '20 Jun (Proj)', amount: 10, type: 'predicted' },
    { day: '21 Jun (Proj)', amount: 5, type: 'predicted' },
    { day: '22 Jun (Proj)', amount: 0, type: 'predicted' },
    { day: '23 Jun (Proj)', amount: 12, type: 'predicted' },
    { day: '24 Jun (Proj)', amount: 8, type: 'predicted' }
  ];

  // 7-Day Outlook List
  const forecast7Days = [
    { day: 'బుధవారం / Today', tempMax: 28, tempMin: 23, prob: 85, condition: 'rainy', textTe: 'భారీ వర్షం' },
    { day: 'గురువారం / Thu', tempMax: 27, tempMin: 22, prob: 70, condition: 'rainy', textTe: 'చిరుజల్లులు' },
    { day: 'శుక్రవారం / Fri', tempMax: 29, tempMin: 23, prob: 50, condition: 'cloudy', textTe: 'మేఘావృతం' },
    { day: 'శనివారం / Sat', tempMax: 32, tempMin: 24, prob: 10, condition: 'sunny', textTe: 'ఎండగా ఉంది' },
    { day: 'ఆదివారం / Sun', tempMax: 33, tempMin: 25, prob: 5, condition: 'sunny', textTe: 'ఎండగా ఉంది' },
    { day: 'సోమవారం / Mon', tempMax: 31, tempMin: 24, prob: 20, condition: 'cloudy', textTe: 'పాక్షిక మేఘాలు' },
    { day: 'మంగళవారం / Tue', tempMax: 30, tempMin: 23, prob: 45, condition: 'cloudy', textTe: 'చినుకులు' }
  ];

  // 24 Hour timeline forecast
  const hourlyForecast = [
    { time: '12 PM', temp: 28, prob: 80, condition: 'rainy' },
    { time: '02 PM', temp: 28, prob: 85, condition: 'rainy' },
    { time: '04 PM', temp: 27, prob: 70, condition: 'rainy' },
    { time: '06 PM', temp: 26, prob: 60, condition: 'cloudy' },
    { time: '08 PM', temp: 25, prob: 45, condition: 'cloudy' },
    { time: '10 PM', temp: 25, prob: 30, condition: 'cloudy' },
    { time: '12 AM', temp: 24, prob: 15, condition: 'cloudy' },
    { time: '02 AM', temp: 23, prob: 10, condition: 'sunny' },
    { time: '04 AM', temp: 23, prob: 5, condition: 'sunny' },
    { time: '06 AM', temp: 24, prob: 5, condition: 'sunny' },
    { time: '08 AM', temp: 26, prob: 15, condition: 'cloudy' },
    { time: '10 AM', temp: 28, prob: 30, condition: 'cloudy' }
  ];

  // SVG Bar Chart Dimensions
  const chartWidth = 750;
  const chartHeight = 240;
  const paddingX = 40;
  const paddingY = 30;
  const requiredRainThreshold = 20; // horizontal line

  const maxVal = Math.max(...rainfallData.map((d) => d.amount), requiredRainThreshold);

  // Bar rendering calculations
  const bars = rainfallData.map((d, idx) => {
    const barWidth = 18;
    const xSpace = (chartWidth - paddingX * 2) / (rainfallData.length - 1 || 1);
    const x = paddingX + idx * xSpace - barWidth / 2;
    const barHeight = ((d.amount) / maxVal) * (chartHeight - paddingY * 2);
    const y = chartHeight - paddingY - barHeight;

    return {
      x,
      y,
      w: barWidth,
      h: barHeight,
      amount: d.amount,
      day: d.day,
      type: d.type,
      idx
    };
  });

  const thresholdY = chartHeight - paddingY - (requiredRainThreshold / maxVal) * (chartHeight - paddingY * 2);

  const handleBarMouseMove = (e, bar) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setHoveredBar(bar);
    
    // Position coordinates
    const tooltipX = (bar.x / chartWidth) * rect.width;
    const tooltipY = (bar.y / chartHeight) * rect.height;
    setTooltipPos({ x: tooltipX + bar.w / 2, y: tooltipY - 10 });
  };

  const handleBarMouseLeave = () => {
    setHoveredBar(null);
  };

  return (
    <div className="bg-krushi-bg min-h-screen py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8 animate-[fade-in_0.3s_ease-out] pb-24 md:pb-12 text-krushi-text">
      
      {/* 1. Page Header */}
      <div className="border-b border-gray-200 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-extrabold bg-blue-50 text-blue-700 border border-blue-100">
            🌤️ Dynamic Weather Center
          </span>
          <h1 className="heading-farm text-2xl sm:text-3xl font-extrabold text-slate-800 mt-2">
            వ్యవసాయ వాతావరణ విభాగం <span className="text-krushi-green">/ Agri Weather Dashboard</span>
          </h1>
          <p className="text-xs text-krushi-muted mt-1 font-telugu">
            నిజ-సమయ వాతావరణ హెచ్చరికలు, అవపాతం (వర్షపాత) విశ్లేషణ మరియు పంట సాగు నీటి సిఫార్సుల నివేదిక.
          </p>
        </div>

        {/* Dynamic preview state switchers */}
        <div className="flex gap-1.5 bg-white p-1 rounded-xl border border-gray-200 shrink-0">
          <button
            onClick={() => setConditionTab('sunny')}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-black cursor-pointer transition-all ${
              conditionTab === 'sunny' ? 'bg-amber-500 text-white shadow-xs' : 'text-krushi-muted hover:text-slate-800'
            }`}
          >
            ☀️ Sunny Day
          </button>
          <button
            onClick={() => setConditionTab('cloudy')}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-black cursor-pointer transition-all ${
              conditionTab === 'cloudy' ? 'bg-slate-500 text-white shadow-xs' : 'text-krushi-muted hover:text-slate-800'
            }`}
          >
            ⛅ Cloudy Sky
          </button>
          <button
            onClick={() => setConditionTab('rainy')}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-black cursor-pointer transition-all ${
              conditionTab === 'rainy' ? 'bg-blue-600 text-white shadow-xs' : 'text-krushi-muted hover:text-slate-800'
            }`}
          >
            🌧️ Rainy Day
          </button>
        </div>
      </div>

      {/* 2. HERO WEATHER CARD (Dynamic background & Animated icons) */}
      <section className={`bg-gradient-to-br ${activeWeather.bg} rounded-3xl p-6 shadow-md relative overflow-hidden transition-all duration-500`}>
        
        {/* Animated ambient backgrounds */}
        <div className="absolute -top-10 -left-10 w-48 h-48 bg-white/5 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center z-10 relative">
          
          {/* Animated SVG Weather Icons (4 Columns) */}
          <div className="md:col-span-4 flex justify-center py-4">
            <div className="w-40 h-40 flex items-center justify-center relative">
              {conditionTab === 'sunny' && (
                <svg viewBox="0 0 100 100" className="w-full h-full text-amber-200 fill-current animate-[spin_20s_linear_infinite]">
                  <circle cx="50" cy="50" r="22" />
                  {/* Sun Rays */}
                  {[...Array(12)].map((_, i) => (
                    <line
                      key={i}
                      x1="50"
                      y1="10"
                      x2="50"
                      y2="2"
                      stroke="currentColor"
                      strokeWidth="4"
                      strokeLinecap="round"
                      transform={`rotate(${i * 30} 50 50)`}
                    />
                  ))}
                </svg>
              )}

              {conditionTab === 'cloudy' && (
                <svg viewBox="0 0 100 100" className="w-full h-full text-slate-200 fill-current relative">
                  {/* Floating Drifting Clouds */}
                  <path d="M25 65 A 15 15 0 0 1 40 50 A 20 20 0 0 1 75 55 A 15 15 0 0 1 70 80 L 30 80 A 15 15 0 0 1 25 65 Z" className="animate-[bounce_6s_ease-in-out_infinite]" />
                  <path d="M10 50 A 10 10 0 0 1 20 40 A 15 15 0 0 1 45 42 A 12 12 0 0 1 42 60 L 15 60 A 10 10 0 0 1 10 50 Z" className="opacity-70 animate-[bounce_8s_ease-in-out_infinite]" style={{ animationDelay: '1s' }} />
                </svg>
              )}

              {conditionTab === 'rainy' && (
                <svg viewBox="0 0 100 100" className="w-full h-full text-sky-200 fill-current relative">
                  {/* Clouds */}
                  <path d="M25 55 A 15 15 0 0 1 40 40 A 20 20 0 0 1 75 45 A 15 15 0 0 1 70 70 L 30 70 A 15 15 0 0 1 25 55 Z" />
                  {/* Rain Droplets falling */}
                  {[...Array(4)].map((_, i) => (
                    <line
                      key={i}
                      x1={35 + i * 12}
                      y1="75"
                      x2={31 + i * 12}
                      y2="88"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      className="animate-[pulse_1.2s_ease-in-out_infinite]"
                      style={{ animationDelay: `${i * 0.2}s` }}
                    />
                  ))}
                </svg>
              )}
            </div>
          </div>

          {/* Temperature & Location Info (8 Columns) */}
          <div className="md:col-span-8 space-y-4">
            <div>
              <span className="text-[10px] uppercase tracking-widest font-black text-white/80 block">Current Observations</span>
              <div className="flex items-baseline gap-4 mt-1">
                <h2 className="text-5xl sm:text-6xl font-black tracking-tight">{activeWeather.temp}°C</h2>
                <span className="text-base sm:text-lg font-bold text-white/90 text-telugu">{activeWeather.conditionTe}</span>
              </div>
              <h3 className="text-sm sm:text-base font-extrabold flex items-center gap-1 mt-1 opacity-95">
                <MapPin size={16} /> వరంగల్ జిల్లా, తెలంగాణ (Warangal District)
              </h3>
            </div>

            {/* Feels like | Humidity | Wind pills */}
            <div className="flex flex-wrap gap-2.5">
              <span className="px-3.5 py-1.5 rounded-full bg-white/10 text-xs font-bold border border-white/10">
                🌡️ Feels like: {activeWeather.feelsLike}°C
              </span>
              <span className="px-3.5 py-1.5 rounded-full bg-white/10 text-xs font-bold border border-white/10">
                💧 Humidity: {activeWeather.humidity}%
              </span>
              <span className="px-3.5 py-1.5 rounded-full bg-white/10 text-xs font-bold border border-white/10">
                💨 Wind: {activeWeather.wind} km/h
              </span>
            </div>

            {/* Farm Tip Green Banner */}
            <div className="bg-emerald-600/35 backdrop-blur-xs text-white border border-emerald-500/20 p-3.5 rounded-2xl text-xs font-semibold leading-relaxed text-telugu w-full">
              📢 <strong>కీలక రైతు సలహా:</strong> "{activeWeather.tipTe} — తేమ శాతం ఎక్కువగా ఉండే అవకాశం ఉంది."
            </div>

          </div>

        </div>

      </section>

      {/* 3. 7-DAY FORECAST STRIP */}
      <section className="space-y-3">
        <span className="text-xs uppercase tracking-widest font-extrabold text-krushi-amber">వారంతపు వాతావరణ అంచనా / 7-Day Outlook Forecast</span>
        
        {/* Horizontal scrollable box */}
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
          {forecast7Days.map((f, idx) => {
            const isToday = idx === 0;
            return (
              <div
                key={idx}
                className={`bg-white p-4 rounded-2xl border flex flex-col justify-between items-center text-center gap-3 min-w-[125px] shrink-0 shadow-sm ${
                  isToday ? 'border-krushi-green ring-2 ring-krushi-green/20' : 'border-gray-200'
                }`}
              >
                <span className="text-[10px] font-black text-slate-800 truncate block w-full">{f.day}</span>
                
                {/* Weather icon indicator */}
                <span className="text-3xl select-none">
                  {f.condition === 'rainy' ? '🌧️' : f.condition === 'cloudy' ? '⛅' : '☀️'}
                </span>

                <div>
                  <span className="text-xs font-bold text-krushi-muted block text-telugu">{f.textTe}</span>
                  <div className="flex gap-2 text-xs font-mono font-bold mt-1">
                    <span className="text-slate-800">{f.tempMax}°</span>
                    <span className="text-krushi-muted">{f.tempMin}°</span>
                  </div>
                </div>

                {/* Rain probability fill bar */}
                <div className="w-full space-y-1">
                  <div className="flex justify-between text-[8px] font-extrabold text-krushi-muted uppercase">
                    <span>Rain</span>
                    <span>{f.prob}%</span>
                  </div>
                  <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${f.prob}%` }} />
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      </section>

      {/* 4. FULL WIDTH RAINFALL CHART */}
      <section className="bg-white rounded-3xl p-6 border border-gray-150 shadow-card space-y-6">
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3.5 border-b border-gray-100 pb-4">
          <div>
            <span className="text-[9px] uppercase tracking-widest font-black text-krushi-amber">Daily Precipitation</span>
            <h3 className="text-base sm:text-lg font-black text-slate-800 mt-0.5">
              వర్షపాత విశ్లేషణ పట్టిక <span className="text-xs font-semibold text-krushi-muted">/ Rainfall History & Projections</span>
            </h3>
          </div>

          {/* Color legends */}
          <div className="flex gap-4 text-[10px] font-extrabold text-krushi-muted uppercase shrink-0">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-blue-500 rounded" /> Past Rainfall (గత వర్షం)</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 border-2 border-dashed border-blue-400 bg-blue-100 rounded" /> Projections (అంచనా)</span>
          </div>
        </div>

        {/* INTERACTIVE SVG BAR CHART */}
        <div className="relative w-full overflow-hidden">
          <div className="w-full relative">
            
            <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-auto">
              
              {/* Grids */}
              <line x1={paddingX} y1={paddingY} x2={chartWidth - paddingX} y2={paddingY} stroke="#f3f4f6" strokeWidth="1" />
              <line x1={paddingX} y1={chartHeight / 2} x2={chartWidth - paddingX} y2={chartHeight / 2} stroke="#f3f4f6" strokeWidth="1" />
              <line x1={paddingX} y1={chartHeight - paddingY} x2={chartWidth - paddingX} y2={chartHeight - paddingY} stroke="#e5e7eb" strokeWidth="1" />

              {/* Required rainfall threshold line */}
              <line
                x1={paddingX}
                y1={thresholdY}
                x2={chartWidth - paddingX}
                y2={thresholdY}
                stroke="#dc2626"
                strokeWidth="1.5"
                strokeDasharray="4,4"
              />
              <text x={chartWidth - paddingX - 10} y={thresholdY - 6} textAnchor="end" className="text-[8px] fill-red-600 font-bold uppercase tracking-wider">
                పంటకు అవసరమైన వర్షం (Required threshold: 20mm)
              </text>

              {/* Renders Bars */}
              {bars.map((b) => (
                <rect
                  key={b.idx}
                  x={b.x}
                  y={b.y}
                  width={b.w}
                  height={b.h}
                  rx="3.5"
                  onMouseMove={(e) => handleBarMouseMove(e, b)}
                  onMouseLeave={handleBarMouseLeave}
                  className={`cursor-pointer transition-all duration-200 hover:opacity-85 ${
                    b.type === 'predicted'
                      ? 'fill-blue-100 stroke-blue-400 stroke-2 stroke-dasharray-[3,3]'
                      : 'fill-blue-500'
                  }`}
                />
              ))}

              {/* X Axis Day Labels */}
              {bars.map((b, idx) => {
                if (idx % 2 !== 0 && idx !== bars.length - 1) return null;
                return (
                  <text
                    key={b.idx}
                    x={b.x + b.w / 2}
                    y={chartHeight - 10}
                    textAnchor="middle"
                    className="text-[8px] fill-krushi-muted font-bold"
                  >
                    {b.day.split(' ')[0]}
                  </text>
                );
              })}

              {/* Y Axis Labels */}
              <text x={paddingX - 10} y={paddingY + 4} textAnchor="end" className="text-[8px] fill-krushi-muted font-bold">{Math.round(maxVal)}mm</text>
              <text x={paddingX - 10} y={chartHeight - paddingY + 4} textAnchor="end" className="text-[8px] fill-krushi-muted font-bold">0mm</text>

            </svg>

            {/* Hover Tooltip Box */}
            {hoveredBar && (
              <div
                className="absolute bg-slate-900/95 text-white rounded-xl p-2.5 shadow-modal text-[10px] space-y-0.5 border border-slate-700 pointer-events-none z-10 transition-all duration-100 ease-out flex flex-col font-bold"
                style={{
                  top: `${tooltipPos.y}px`,
                  left: `${tooltipPos.x}px`,
                  transform: 'translate(-50%, -100%)'
                }}
              >
                <span className="text-sky-300 font-mono text-xs">{hoveredBar.amount} mm</span>
                <span className="text-[9px] text-gray-300 font-medium">{hoveredBar.day}</span>
              </div>
            )}

          </div>
        </div>

      </section>

      {/* 5. HOURLY TIMELINE FORECAST */}
      <section className="space-y-3">
        <span className="text-xs uppercase tracking-widest font-extrabold text-krushi-amber">గంటవారీ వాతావరణం / 24-Hour Timeline outlook</span>
        
        {/* Horizontal scrollable box */}
        <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-thin bg-white p-4.5 rounded-3xl border border-gray-150 shadow-sm">
          {hourlyForecast.map((h, idx) => {
            const isCurrent = idx === 0;
            return (
              <div
                key={idx}
                className={`py-3.5 px-4 rounded-2xl flex flex-col items-center justify-between text-center gap-2.5 min-w-[90px] shrink-0 border transition-all ${
                  isCurrent ? 'bg-blue-50 border-blue-200 text-blue-800' : 'bg-white border-transparent text-slate-800 hover:bg-slate-50'
                }`}
              >
                <span className="text-[9px] font-black uppercase tracking-wider block font-mono">{h.time}</span>
                <span className="text-2xl select-none">
                  {h.condition === 'rainy' ? '🌧️' : h.condition === 'cloudy' ? '⛅' : '☀️'}
                </span>
                <span className="text-xs font-black font-mono">{h.temp}°C</span>
                <span className="text-[8px] font-bold text-blue-600 font-mono block">☔ {h.prob}%</span>
              </div>
            );
          })}
        </div>
      </section>

      {/* 6. BOTTOM GRID: ALERTS & IRRIGATION RECS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left column: Agri Weather Alerts (7 Columns) */}
        <div className="lg:col-span-7 space-y-4">
          <span className="text-xs uppercase tracking-widest font-extrabold text-krushi-amber">వ్యవసాయ హెచ్చరికలు / Weather Alerts</span>
          
          <div className="space-y-3">
            {/* Alert 1 */}
            <div className="bg-white border-l-8 border-l-red-500 border-y border-r border-gray-200 p-4 rounded-3xl flex gap-3 items-start shadow-xs">
              <span className="text-xl shrink-0 mt-0.5">🔴</span>
              <div className="space-y-1">
                <h4 className="text-xs font-black text-red-800">Severe Heatwave Warning (తీవ్ర ఎండల హెచ్చరిక)</h4>
                <p className="text-[12.5px] text-slate-800 text-telugu font-bold leading-normal">
                  "వచ్చే 3 రోజులు గరిష్ట ఉష్ణోగ్రతలు 40°C పైగా నమోదవుతాయి. పశువులకు సరైన నీడ మరియు నీరు కల్పించండి."
                </p>
                <p className="text-[10px] text-krushi-muted">
                  (High temperatures exceeding 40°C expected in next 3 days. Ensure proper shade for livestock.)
                </p>
              </div>
            </div>

            {/* Alert 2 */}
            <div className="bg-white border-l-8 border-l-amber-500 border-y border-r border-gray-200 p-4 rounded-3xl flex gap-3 items-start shadow-xs">
              <span className="text-xl shrink-0 mt-0.5">🟡</span>
              <div className="space-y-1">
                <h4 className="text-xs font-black text-krushi-amber-dark">Moderate Wind Alert (ఈదురు గాలులు)</h4>
                <p className="text-[12.5px] text-slate-800 text-telugu font-bold leading-normal">
                  "రాగల 24 గంటల్లో గాలుల తీవ్రత ఎక్కువగా ఉండడం వల్ల పురుగు మందుల పిచికారీ పనులను నిలిపివేయండి."
                </p>
                <p className="text-[10px] text-krushi-muted">
                  (Windy conditions active. Suspend crop pesticide spraying today to avoid drift.)
                </p>
              </div>
            </div>

            {/* Alert 3 */}
            <div className="bg-white border-l-8 border-l-green-600 border-y border-r border-gray-200 p-4 rounded-3xl flex gap-3 items-start shadow-xs">
              <span className="text-xl shrink-0 mt-0.5">🟢</span>
              <div className="space-y-1">
                <h4 className="text-xs font-black text-krushi-green-dark">Good Sowing Window (విత్తన అనుకూలం)</h4>
                <p className="text-[12.5px] text-slate-800 text-telugu font-bold leading-normal">
                  "మట్టి తేమ శాతం అత్యుత్తమంగా ఉంది. రేపటి నుండి 2 రోజులు మొక్కజొన్న విత్తనం వేయడానికి అనుకూల సమయం."
                </p>
                <p className="text-[10px] text-krushi-muted">
                  (Soil moisture is optimal. Favorable sowing window for Hybrid Maize starts tomorrow.)
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right column: Irrigation Recommendation Box (5 Columns) */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-gray-150 shadow-card space-y-6">
          <div>
            <span className="text-[9px] uppercase tracking-widest font-black text-krushi-amber">Smart Water Advisory</span>
            <h3 className="text-sm sm:text-base font-black text-slate-800 mt-0.5">
              నీటి యాజమాన్య సిఫార్సు <span className="text-xs font-semibold text-krushi-muted block mt-0.5">/ Irrigation Recommendation Box</span>
            </h3>
          </div>

          <div className="bg-blue-50/80 border border-blue-200 p-4 rounded-2xl space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <span className="text-[10px] text-blue-700 uppercase tracking-wider font-extrabold block">Recommended Action</span>
                <span className="text-sm font-black text-slate-800 text-telugu block mt-0.5">
                  వరి పంటకు: 2 రోజుల తర్వాత నీరు పోయండి
                </span>
              </div>
              <span className="text-3xl shrink-0">💧</span>
            </div>

            <div className="space-y-1.5 border-t border-blue-200/50 pt-3 text-xs font-bold text-blue-800">
              <div className="flex justify-between">
                <span>Soil Moisture Level</span>
                <span className="font-mono">75% (Adequate)</span>
              </div>
              <div className="flex justify-between">
                <span>Rain Forecast Contribution</span>
                <span className="font-mono">18 mm expected</span>
              </div>
            </div>

            {/* Countdown timer */}
            <div className="p-3 bg-white border border-blue-200 rounded-xl text-center">
              <span className="text-[9px] text-krushi-muted uppercase tracking-widest block font-bold">Countdown to Irrigation</span>
              <span className="text-xl font-mono font-black text-blue-600 block mt-0.5">48 Hours left</span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
