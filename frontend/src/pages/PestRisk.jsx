import React, { useState, useEffect, useContext } from 'react';
import { ShieldAlert, AlertTriangle, ShieldCheck, Thermometer, Droplet, CloudRain, RefreshCw, AlertCircle, CheckCircle, Wrench, Shield } from 'lucide-react';
import { toast } from 'react-toastify';
import { AppContext } from '../context/AppContext';
import axios from 'axios';

export const PestRisk = () => {
  const { user } = useContext(AppContext);
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPestRisk = async () => {
    setLoading(true);
    setError(null);
    try {
      if (user?.id && user.id !== 0) {
        const token = localStorage.getItem('farmer_token');
        const res = await axios.get(`/api/pest/predict/${user.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setPredictions(res.data);
      } else {
        // Demo fallback simulation
        setTimeout(() => {
          setPredictions([
            {
              crop_name: 'Paddy (Rice)',
              predicted_pest: 'Yellow Stem Borer (వరి కాండం తొలిచే పురుగు)',
              risk_level: 'High',
              confidence: 84.5,
              prevention: [
                'నాట్లు వేసేటప్పుడు పిలకల చివరలను కత్తిరించండి. Clip seedling tips before transplanting.',
                'కాంతి ఉచ్చులను (Light traps) అమర్చండి. Install light traps to monitor adult moths.'
              ],
              chemical_treatment: 'కార్టాప్ హైడ్రోక్లోరైడ్ 4G గుళికలు ఎకరానికి 8 కిలోలు వేయండి. Apply Cartap Hydrochloride 4G granules @ 8 kg/acre.',
              biological_treatment: 'ట్రైకోగ్రామా జపోనికమ్ కార్డులను వాడండి. Release Trichogramma japonicum parasitoids @ 40,000/acre.',
              weather_context: { temperature: 24.5, humidity: 82.0, rainfall: 35.0 }
            },
            {
              crop_name: 'Cotton',
              predicted_pest: 'Pink Bollworm (గులాబీ రంగు కాయ తొలిచే పురుగు)',
              risk_level: 'Medium',
              confidence: 72.0,
              prevention: [
                'లింగాకర్షక బుట్టలు (Pheromone traps) ఎకరానికి 5 చొప్పున అమర్చండి. Install pheromone traps.',
                "నాణ్యమైన ధృవీకరించబడిన విత్తనాలను వాడండి. Use certified seed varieties."
              ],
              chemical_treatment: 'ప్రొఫెనోఫాస్ 50% EC @ 2 ml/లీటర్. Spray Profenofos 50% EC @ 2 ml/liter of water.',
              biological_treatment: 'ట్రైకోగ్రామా పరాన్నజీవులను విడుదల చేయండి. Release Trichogramma egg parasitoids @ 60,000/acre.',
              weather_context: { temperature: 28.0, humidity: 75.0, rainfall: 12.0 }
            }
          ]);
          setLoading(false);
        }, 1000);
        return;
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to query pest prediction API.');
    } finally {
      if (user?.id && user.id !== 0) setLoading(false);
    }
  };

  useEffect(() => {
    fetchPestRisk();
  }, [user?.id]);

  const getRiskStyles = (level) => {
    switch (level) {
      case 'High':
        return {
          cardBorder: 'border-red-500/30',
          badge: 'border-red-500/30 bg-red-950/20 text-red-400',
          icon: <AlertTriangle className="w-5 h-5 text-red-400" />
        };
      case 'Medium':
        return {
          cardBorder: 'border-amber-500/30',
          badge: 'border-amber-500/30 bg-amber-950/20 text-amber-400',
          icon: <AlertCircle className="w-5 h-5 text-amber-400" />
        };
      default:
        return {
          cardBorder: 'border-green-500/30',
          badge: 'border-green-500/30 bg-green-950/20 text-green-400',
          icon: <ShieldCheck className="w-5 h-5 text-green-400" />
        };
    }
  };

  return (
    <div className="space-y-8 page-fade-in">
      
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-green-500/10 border border-green-500/40 flex items-center justify-center shadow-[0_0_15px_rgba(34,197,94,0.3)]">
            <ShieldAlert className="w-5 h-5 text-green-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold font-heading text-slate-100 glow-text-green">Pest Outbreak Risk Predictor</h2>
            <p className="text-xs text-slate-400 mt-0.5">Real-time agricultural pest risk warnings based on local weather humidity indexes.</p>
          </div>
        </div>
        <button onClick={fetchPestRisk} className="flex items-center gap-2 text-xs text-slate-400 hover:text-green-400 transition-colors glass-panel px-3 py-2 rounded-lg border border-green-500/10">
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
          <div className="w-16 h-16 rounded-2xl bg-green-500/10 border border-green-500/30 flex items-center justify-center animate-pulse">
            <ShieldAlert className="w-8 h-8 text-green-400 animate-spin" />
          </div>
          <p className="text-slate-400 font-mono text-sm">Evaluating regional pest outbreak indexes...</p>
        </div>
      ) : error ? (
        <div className="glass-panel p-8 rounded-2xl border border-red-500/20 text-center space-y-4">
          <AlertTriangle className="w-12 h-12 text-red-400 mx-auto" />
          <div>
            <h3 className="font-heading font-bold text-slate-200">Outbreak Evaluation Failed</h3>
            <p className="text-xs text-slate-400 mt-1">{error}</p>
          </div>
          <button onClick={fetchPestRisk} className="py-2.5 px-4 bg-green-600 hover:bg-green-500 text-slate-900 font-bold rounded-xl text-xs">
            Try Again
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {predictions.map((p, idx) => {
            const styles = getRiskStyles(p.risk_level);
            return (
              <div key={idx} className={`glass-panel p-6 rounded-2xl border ${styles.cardBorder} card-3d space-y-6 relative overflow-hidden`}>
                <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 rounded-full blur-3xl pointer-events-none"></div>

                {/* Card header */}
                <div className="flex justify-between items-start border-b border-green-500/10 pb-4">
                  <div>
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">Crop Log</span>
                    <h3 className="text-lg font-bold font-heading text-slate-200 mt-0.5">{p.crop_name}</h3>
                  </div>
                  <div className={`px-2.5 py-1 rounded-md text-xs font-mono font-bold border flex items-center gap-1.5 ${styles.badge}`}>
                    {styles.icon}
                    <span className="uppercase">{p.risk_level} RISK</span>
                  </div>
                </div>

                {/* Disease description */}
                <div className="space-y-1">
                  <span className="text-[9px] font-mono text-slate-500 uppercase">PREDICTED OUTBREAK PATHOGEN</span>
                  <h4 className="text-sm font-bold text-slate-200 font-sans">{p.predicted_pest}</h4>
                  <p className="text-[10px] text-slate-400 font-mono">Outbreak Probability: {p.confidence}%</p>
                </div>

                {/* Weather environment triggers */}
                <div className="grid grid-cols-3 gap-3 bg-slate-950/40 p-3 rounded-xl border border-green-500/5 text-center font-mono text-xs">
                  <div>
                    <span className="block text-[9px] text-slate-500 uppercase flex justify-center items-center gap-1"><Thermometer className="w-3 h-3 text-amber-500" /> Temp</span>
                    <span className="text-slate-200 font-bold text-sm">{p.weather_context.temperature}°C</span>
                  </div>
                  <div>
                    <span className="block text-[9px] text-slate-500 uppercase flex justify-center items-center gap-1"><Droplet className="w-3 h-3 text-blue-400" /> Humidity</span>
                    <span className="text-slate-200 font-bold text-sm">{p.weather_context.humidity}%</span>
                  </div>
                  <div>
                    <span className="block text-[9px] text-slate-500 uppercase flex justify-center items-center gap-1"><CloudRain className="w-3 h-3 text-teal-400" /> Rain Sum</span>
                    <span className="text-slate-200 font-bold text-sm">{p.weather_context.rainfall} mm</span>
                  </div>
                </div>

                {/* Prevention measures */}
                <div className="space-y-2">
                  <h5 className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <Shield className="w-4 h-4 text-green-400" />
                    <span>Agronomist Prevention Protocol</span>
                  </h5>
                  <ul className="list-disc pl-4 space-y-1 text-xs text-slate-400 leading-relaxed font-sans">
                    {p.prevention.map((item, i) => <li key={i}>{item}</li>)}
                  </ul>
                </div>

                {/* Actions Chemical & Biological */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-green-500/10 pt-4">
                  <div className="space-y-1">
                    <span className="text-[9px] font-mono text-slate-500 uppercase flex items-center gap-1"><Wrench className="w-3.5 h-3.5 text-blue-400" /> Chemical Response</span>
                    <p className="text-[11px] text-slate-400 leading-normal font-sans">{p.chemical_treatment}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[9px] font-mono text-slate-500 uppercase flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5 text-green-400" /> Biological Response</span>
                    <p className="text-[11px] text-slate-400 leading-normal font-sans">{p.biological_treatment}</p>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
