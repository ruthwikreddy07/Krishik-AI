import React, { useState, useEffect, useContext } from 'react';
import { useForm } from 'react-hook-form';
import { Sprout, Calendar, Plus, RefreshCw, ChevronDown, Wand2, Compass, AlertCircle, CheckCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import { AppContext } from '../context/AppContext';
import { 
  getCrops, addCrop, updateCropStage, 
  getCropRecommendation, predictYield, recommendFertilizer,
  getWeatherByFarmer, getWeatherByLocation 
} from '../services/api';

export const CropManagement = () => {
  const { user } = useContext(AppContext);
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addingCrop, setAddingCrop] = useState(false);
  const [activeTab, setActiveTab] = useState('tracker'); // tracker, recommender, yield, fertilizer

  // Recommendation states
  const [recomLoading, setRecomLoading] = useState(false);
  const [recomResult, setRecomResult] = useState(null);
  
  const [yieldLoading, setYieldLoading] = useState(false);
  const [yieldResult, setYieldResult] = useState(null);

  const [fertLoading, setFertLoading] = useState(false);
  const [fertResult, setFertResult] = useState(null);

  // Forms
  const { register, handleSubmit, reset } = useForm();
  
  const recomForm = useForm({
    defaultValues: { nitrogen: 60, phosphorus: 45, potassium: 40, temperature: 28, humidity: 65, ph: 6.5, rainfall: 200 }
  });
  
  const yieldForm = useForm({
    defaultValues: { crop_name: 'Rice', area_acres: 2.0, soil_type: 'Red', nitrogen: 60, phosphorus: 45, potassium: 40, temperature: 28, humidity: 65, rainfall: 200 }
  });

  const fertForm = useForm({
    defaultValues: { crop_name: 'Rice', soil_type: 'Red', nitrogen: 60, phosphorus: 45, potassium: 40, crop_stage: 'Vegetative' }
  });

  const STAGES = ['Sowing', 'Germination', 'Vegetative', 'Flowering', 'Grain Filling', 'Harvesting', 'Harvested'];

  const stageProgress = (stage) => {
    const idx = STAGES.indexOf(stage);
    return idx >= 0 ? Math.round(((idx + 1) / STAGES.length) * 100) : 10;
  };

  const getDaysElapsed = (dateStr) => {
    const sown = new Date(dateStr);
    const diffMs = Date.now() - sown.getTime();
    return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
  };

  const loadCrops = async () => {
    setLoading(true);
    try {
      if (user?.id && user.id !== 0) {
        const data = await getCrops(user.id);
        setCrops(data);
      } else {
        // Demo fallback
        setCrops([
          { id: 1, crop_name: 'Paddy (Rice)', crop_stage: 'Vegetative', sowing_date: '2026-05-10', duration_days: 120 },
          { id: 2, crop_name: 'Cotton', crop_stage: 'Flowering', sowing_date: '2026-06-02', duration_days: 160 },
        ]);
      }
    } catch {
      toast.error('Could not load crops from server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadCrops(); }, [user?.id]);

  const onAddCrop = async (data) => {
    setAddingCrop(true);
    try {
      if (user?.id && user.id !== 0) {
        const newCrop = await addCrop({
          farmer_id: user.id,
          crop_name: data.name,
          sowing_date: data.sownDate,
          crop_stage: 'Sowing',
          duration_days: parseInt(data.durationDays) || 120,
        });
        setCrops(prev => [...prev, newCrop]);
        toast.success(`${data.name} crop track added!`);
      } else {
        // Demo mode — just add locally
        setCrops(prev => [...prev, {
          id: prev.length + 10,
          crop_name: data.name,
          crop_stage: 'Sowing',
          sowing_date: data.sownDate,
          duration_days: parseInt(data.durationDays) || 120,
        }]);
        toast.success(`${data.name} track started (demo mode).`);
      }
      reset();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to add crop.');
    } finally {
      setAddingCrop(false);
    }
  };

  const handleStageUpdate = async (cropId, newStage) => {
    try {
      if (user?.id && user.id !== 0) {
        const updated = await updateCropStage(cropId, newStage);
        setCrops(prev => prev.map(c => c.id === cropId ? { ...c, crop_stage: updated.crop_stage } : c));
      } else {
        setCrops(prev => prev.map(c => c.id === cropId ? { ...c, crop_stage: newStage } : c));
      }
      toast.success(`Stage updated to ${newStage}`);
    } catch {
      toast.error('Failed to update stage.');
    }
  };

  // Weather Autofilling logic
  const autofillWeather = async (targetForm) => {
    try {
      let lat = 17.0575, lon = 79.2671;
      if (user?.latitude && user?.longitude) {
        lat = parseFloat(user.latitude);
        lon = parseFloat(user.longitude);
      }
      const data = await getWeatherByLocation(lat, lon);
      const today = data.forecast_days?.[0] || {};
      const avgTemp = ((today.temp_max || 30) + (today.temp_min || 22)) / 2;
      const avgHumid = today.avg_humidity_pct || 65;
      const rain = today.rain_sum_mm || today.rain_sum || 150;

      if (targetForm === 'recommender') {
        recomForm.setValue('temperature', Math.round(avgTemp));
        recomForm.setValue('humidity', Math.round(avgHumid));
        recomForm.setValue('rainfall', Math.round(rain));
      } else if (targetForm === 'yield') {
        yieldForm.setValue('temperature', Math.round(avgTemp));
        yieldForm.setValue('humidity', Math.round(avgHumid));
        yieldForm.setValue('rainfall', Math.round(rain));
      }
      toast.success('Localized weather conditions loaded automatically! 🌤️');
    } catch (err) {
      toast.error('Failed to autofill weather metrics.');
    }
  };

  // Crop Recommendation ML execution
  const onRunRecom = async (data) => {
    setRecomLoading(true);
    setRecomResult(null);
    try {
      const payload = {
        nitrogen: parseFloat(data.nitrogen),
        phosphorus: parseFloat(data.phosphorus),
        potassium: parseFloat(data.potassium),
        temperature: parseFloat(data.temperature),
        humidity: parseFloat(data.humidity),
        ph: parseFloat(data.ph),
        rainfall: parseFloat(data.rainfall)
      };
      const res = await getCropRecommendation(payload);
      setRecomResult(res);
      toast.success('Crop recommendation model run completed!');
    } catch (err) {
      toast.error('Model inference failed. Displaying fallback recommendation.');
      // Local fallback
      setRecomResult({ recommended_crop: 'Paddy (Rice)', confidence: 78.5 });
    } finally {
      setRecomLoading(false);
    }
  };

  // Yield Prediction ML execution
  const onRunYield = async (data) => {
    setYieldLoading(true);
    setYieldResult(null);
    try {
      const payload = {
        crop_name: data.crop_name,
        area_acres: parseFloat(data.area_acres),
        soil_type: data.soil_type,
        nitrogen: parseFloat(data.nitrogen),
        phosphorus: parseFloat(data.phosphorus),
        potassium: parseFloat(data.potassium),
        temperature: parseFloat(data.temperature),
        humidity: parseFloat(data.humidity),
        rainfall: parseFloat(data.rainfall)
      };
      const res = await predictYield(payload);
      setYieldResult(res);
      toast.success('Yield prediction model run completed!');
    } catch (err) {
      toast.error('Model inference failed. Displaying fallback projection.');
      setYieldResult({ crop_name: data.crop_name, predicted_yield_quintals: data.area_acres * 18.0, yield_per_acre: 18.0 });
    } finally {
      setYieldLoading(false);
    }
  };

  // Fertilizer Recommendation ML execution
  const onRunFert = async (data) => {
    setFertLoading(true);
    setFertResult(null);
    try {
      const payload = {
        crop_name: data.crop_name,
        soil_type: data.soil_type,
        nitrogen: parseFloat(data.nitrogen),
        phosphorus: parseFloat(data.phosphorus),
        potassium: parseFloat(data.potassium),
        crop_stage: data.crop_stage
      };
      const res = await recommendFertilizer(payload);
      setFertResult(res);
      toast.success('Fertilizer advisor model run completed!');
    } catch (err) {
      toast.error('Model inference failed. Displaying fallback guide.');
      setFertResult({ fertilizer: 'Urea + DAP', dosage_kg_per_acre: 50.0, instructions: 'Apply balanced Urea and DAP dressing with adequate soil moisture.' });
    } finally {
      setFertLoading(false);
    }
  };

  return (
    <div className="space-y-8 page-fade-in">
      
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-green-500/10 border border-green-500/40 flex items-center justify-center shadow-[0_0_15px_rgba(34,197,94,0.3)]">
          <Sprout className="w-5 h-5 text-green-400" />
        </div>
        <div>
          <h2 className="text-2xl font-bold font-heading text-slate-100 glow-text-green">AI Crop Management</h2>
          <p className="text-xs text-slate-400 mt-0.5">Track your crop lifecycles and use specialized Random Forest, XGBoost, and Decision Tree models for expert advisory.</p>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="flex flex-wrap gap-2 bg-slate-950/40 p-1 rounded-xl border border-green-500/10 max-w-2xl">
        {[
          { id: 'tracker', label: 'Active Trackers' },
          { id: 'recommender', label: 'AI Crop Recommendation' },
          { id: 'yield', label: 'AI Yield Predictor' },
          { id: 'fertilizer', label: 'AI Fertilizer Advisor' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`py-2 px-4 rounded-lg text-xs font-semibold font-mono transition-all duration-300 ${activeTab === tab.id ? 'bg-green-500/20 text-green-300 border border-green-500/30' : 'text-slate-500 hover:text-slate-300'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── ACTIVE TRACKERS TAB ──────────────────────────────────── */}
      {activeTab === 'tracker' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Col: Crops List (7 columns) */}
          <div className="lg:col-span-7 space-y-6">
            <h3 className="text-lg font-bold font-heading text-slate-200">Active Crop Logs</h3>
            {loading ? (
              <div className="flex items-center gap-2 text-slate-500 font-mono text-sm py-8">
                <RefreshCw className="w-4 h-4 animate-spin" /> Loading your crops...
              </div>
            ) : crops.length === 0 ? (
              <div className="glass-panel p-8 rounded-2xl border border-green-500/10 text-center">
                <Sprout className="w-10 h-10 text-green-500/30 mx-auto mb-3" />
                <p className="text-slate-400 text-sm">No crops added yet. Use the form to start your first crop track.</p>
              </div>
            ) : crops.map((crop) => {
              const cropName = crop.crop_name || crop.name;
              const cropStage = crop.crop_stage || crop.stage || 'Sowing';
              const sowingDate = crop.sowing_date || crop.sownDate;
              const days = getDaysElapsed(sowingDate);
              const durationDays = crop.duration_days || crop.durationDays || 120;
              const remaining = Math.max(0, durationDays - days);
              const progress = stageProgress(cropStage);
              return (
                <div key={crop.id} className="glass-panel p-6 rounded-2xl border border-green-500/10 card-3d relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 rounded-full blur-3xl pointer-events-none"></div>
                  
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="text-lg font-bold text-slate-200">{cropName}</h4>
                      <p className="text-xs text-green-400/90 font-mono mt-0.5">{cropStage}</p>
                    </div>
                    {/* Stage updater */}
                    <div className="relative">
                      <select
                        value={cropStage}
                        onChange={e => handleStageUpdate(crop.id, e.target.value)}
                        className="text-[10px] font-mono font-bold uppercase tracking-wider text-green-400 bg-green-500/10 border border-green-500/20 px-2.5 py-1 rounded-md cursor-pointer outline-none"
                      >
                        {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-4 text-xs font-mono">
                    <div className="bg-slate-950/40 border border-green-500/5 p-2 rounded-xl text-center">
                      <span className="block text-slate-500 text-[10px]">SOWN DATE</span>
                      <span className="text-slate-300 font-bold">{sowingDate}</span>
                    </div>
                    <div className="bg-slate-950/40 border border-green-500/5 p-2 rounded-xl text-center">
                      <span className="block text-slate-500 text-[10px]">AGE (DAYS)</span>
                      <span className="text-green-400 font-bold">{days} Days</span>
                    </div>
                    <div className="bg-slate-950/40 border border-green-500/5 p-2 rounded-xl text-center">
                      <span className="block text-slate-500 text-[10px]">EST. HARVEST</span>
                      <span className="text-amber-400 font-bold">In {remaining} Days</span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-slate-500">GROWTH MILESTONE</span>
                      <span className="text-green-400 font-semibold">{progress}% complete</span>
                    </div>
                    <div className="w-full bg-slate-900 rounded-full h-3 overflow-hidden border border-slate-800">
                      <div className="bg-gradient-to-r from-green-600 to-emerald-400 h-full rounded-full shadow-[0_0_12px_rgba(34,197,94,0.4)]" style={{ width: `${progress}%`, transition: 'width 0.8s ease' }}></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Col: Add Crop Form (5 columns) */}
          <div className="lg:col-span-5">
            <div className="glass-panel p-6 rounded-2xl border border-green-500/20 card-3d flex flex-col">
              <h3 className="text-lg font-bold font-heading text-slate-200 flex items-center gap-2 mb-4">
                <Plus className="w-5 h-5 text-green-400" />
                <span>Sow New Crop Track</span>
              </h3>

              <form onSubmit={handleSubmit(onAddCrop)} className="space-y-4">
                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1.5 uppercase tracking-widest">Crop Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Rice, Cotton, Chilli"
                    {...register("name", { required: true })}
                    className="w-full bg-slate-950/60 border border-green-500/20 focus:border-green-500/60 rounded-xl px-4 py-3 text-sm font-sans text-white outline-none transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono text-slate-400 mb-1.5 uppercase tracking-widest">Sown Date</label>
                    <input
                      type="date"
                      {...register("sownDate", { required: true })}
                      className="w-full bg-slate-950/60 border border-green-500/20 focus:border-green-500/60 rounded-xl px-3 py-3 text-sm font-sans text-white outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-slate-400 mb-1.5 uppercase tracking-widest">Duration (Days)</label>
                    <input
                      type="number"
                      defaultValue="120"
                      {...register("durationDays", { required: true })}
                      className="w-full bg-slate-950/60 border border-green-500/20 focus:border-green-500/60 rounded-xl px-3 py-3 text-sm font-sans text-white outline-none transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={addingCrop}
                  className="w-full mt-4 py-3.5 px-4 bg-green-600 hover:bg-green-500 text-slate-900 font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 border border-green-400 shadow-[0_4px_20px_rgba(34,197,94,0.25)] glow-btn"
                >
                  {addingCrop ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  <span>{addingCrop ? 'Adding...' : 'Initiate Lifecycle Tracker'}</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ── CROP RECOMMENDATION TAB ──────────────────────────────── */}
      {activeTab === 'recommender' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Form */}
          <div className="lg:col-span-7">
            <div className="glass-panel p-6 rounded-2xl border border-green-500/20 card-3d">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold font-heading text-slate-200 flex items-center gap-2">
                  <Wand2 className="w-5 h-5 text-green-400" />
                  <span>Crop Recommendation Engine</span>
                </h3>
                <button
                  type="button"
                  onClick={() => autofillWeather('recommender')}
                  className="py-1.5 px-3 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/20 rounded-lg text-xs font-mono flex items-center gap-1.5 transition-all"
                >
                  <Compass className="w-3.5 h-3.5" />
                  <span>Autofill Weather</span>
                </button>
              </div>

              <form onSubmit={recomForm.handleSubmit(onRunRecom)} className="space-y-4 text-xs font-mono">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-slate-400 mb-1.5 uppercase">Nitrogen (N)</label>
                    <input type="number" step="1" {...recomForm.register("nitrogen", { required: true })} className="w-full bg-slate-950/60 border border-green-500/20 rounded-xl px-3 py-2.5 text-white" />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1.5 uppercase">Phosphorus (P)</label>
                    <input type="number" step="1" {...recomForm.register("phosphorus", { required: true })} className="w-full bg-slate-950/60 border border-green-500/20 rounded-xl px-3 py-2.5 text-white" />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1.5 uppercase">Potassium (K)</label>
                    <input type="number" step="1" {...recomForm.register("potassium", { required: true })} className="w-full bg-slate-950/60 border border-green-500/20 rounded-xl px-3 py-2.5 text-white" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-400 mb-1.5 uppercase">Temperature (°C)</label>
                    <input type="number" step="0.1" {...recomForm.register("temperature", { required: true })} className="w-full bg-slate-950/60 border border-green-500/20 rounded-xl px-3 py-2.5 text-white" />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1.5 uppercase">Humidity (%)</label>
                    <input type="number" step="1" {...recomForm.register("humidity", { required: true })} className="w-full bg-slate-950/60 border border-green-500/20 rounded-xl px-3 py-2.5 text-white" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-400 mb-1.5 uppercase">Soil pH</label>
                    <input type="number" step="0.1" {...recomForm.register("ph", { required: true })} className="w-full bg-slate-950/60 border border-green-500/20 rounded-xl px-3 py-2.5 text-white" />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1.5 uppercase">Rainfall (mm)</label>
                    <input type="number" step="1" {...recomForm.register("rainfall", { required: true })} className="w-full bg-slate-950/60 border border-green-500/20 rounded-xl px-3 py-2.5 text-white" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={recomLoading}
                  className="w-full mt-4 py-3 bg-green-600 hover:bg-green-500 text-slate-900 font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 border border-green-400 shadow-[0_4px_20px_rgba(34,197,94,0.25)] glow-btn"
                >
                  {recomLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
                  <span>Evaluate Best Crop</span>
                </button>
              </form>
            </div>
          </div>

          {/* Results Output */}
          <div className="lg:col-span-5">
            {recomResult ? (
              <div className="glass-panel p-6 rounded-2xl border border-green-500/20 card-3d flex flex-col justify-between min-h-[350px]">
                <div className="space-y-4">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block">Model Output</span>
                  <div className="flex items-center gap-3 text-green-400">
                    <CheckCircle className="w-6 h-6" />
                    <h4 className="text-xl font-bold font-heading">Recommended Crop</h4>
                  </div>
                  <div className="bg-slate-950/40 p-4 rounded-xl border border-green-500/10 text-center space-y-1">
                    <span className="text-4xl font-extrabold text-white block font-heading">{recomResult.recommended_crop}</span>
                    <span className="text-xs text-green-400 font-bold font-mono">Prediction Confidence: {recomResult.confidence}%</span>
                  </div>

                  {recomResult.recommendations && recomResult.recommendations.length > 0 && (
                    <div className="space-y-3 pt-2">
                      <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block">Ranked Recommendations</span>
                      <div className="bg-slate-950/60 rounded-xl border border-green-500/10 overflow-hidden">
                        <table className="w-full text-left border-collapse text-[11px]">
                          <thead>
                            <tr className="border-b border-green-500/10 bg-slate-900/50 text-[9px] uppercase font-mono text-slate-400">
                              <th className="px-3 py-2 text-center w-12">Rank</th>
                              <th className="px-3 py-2">Crop</th>
                              <th className="px-3 py-2 text-right">Confidence</th>
                            </tr>
                          </thead>
                          <tbody>
                            {recomResult.recommendations.map((rec, index) => (
                              <tr key={index} className={`border-b border-green-500/5 last:border-0 hover:bg-green-500/5 transition-all ${index === 0 ? 'text-green-400 font-bold' : 'text-slate-300'}`}>
                                <td className="px-3 py-2 text-center font-mono">{index + 1}</td>
                                <td className="px-3 py-2">{rec.crop_name}</td>
                                <td className="px-3 py-2 text-right font-mono">{rec.confidence}%</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {recomResult.confidence < 50 && (
                    <div className="bg-amber-500/10 border border-amber-500/25 text-amber-300 rounded-xl p-3 text-[11px] leading-relaxed flex gap-2">
                      <span className="text-sm select-none">⚠️</span>
                      <div>
                        <strong>Low confidence prediction ({recomResult.confidence}%).</strong> Consider the top 3 recommendations or provide additional field information for a more reliable result.
                      </div>
                    </div>
                  )}

                  <p className="text-[10px] text-slate-400 leading-relaxed font-sans">
                    This selection is generated by the Random Forest classifier trained on the soil profile indicators N, P, and K combined with local environmental trends.
                  </p>
                </div>
              </div>
            ) : (
              <div className="glass-panel p-8 rounded-2xl border border-green-500/10 flex flex-col items-center justify-center min-h-[350px] text-center text-slate-500">
                <Wand2 className="w-12 h-12 mb-4 text-green-500/25" />
                <h4 className="font-heading font-bold text-slate-400 text-base">Awaiting Inputs</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-xs leading-normal">
                  Provide your soil NPK composition parameters and environment metrics to evaluate the optimal crop.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── AI YIELD PREDICTOR TAB ───────────────────────────────── */}
      {activeTab === 'yield' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Form */}
          <div className="lg:col-span-7">
            <div className="glass-panel p-6 rounded-2xl border border-green-500/20 card-3d">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold font-heading text-slate-200 flex items-center gap-2">
                  <Wand2 className="w-5 h-5 text-green-400" />
                  <span>XGBoost Yield Predictor</span>
                </h3>
                <button
                  type="button"
                  onClick={() => autofillWeather('yield')}
                  className="py-1.5 px-3 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/20 rounded-lg text-xs font-mono flex items-center gap-1.5 transition-all"
                >
                  <Compass className="w-3.5 h-3.5" />
                  <span>Autofill Weather</span>
                </button>
              </div>

              <form onSubmit={yieldForm.handleSubmit(onRunYield)} className="space-y-4 text-xs font-mono">
                <div className="grid grid-cols-2 gap-4 font-sans">
                  <div>
                    <label className="block text-[10px] font-mono text-slate-400 mb-1.5 uppercase">Crop Name</label>
                    <select {...yieldForm.register("crop_name", { required: true })} className="w-full bg-slate-950/60 border border-green-500/20 rounded-xl px-3 py-2.5 text-white">
                      <option value="Rice">Rice (Paddy)</option>
                      <option value="Cotton">Cotton</option>
                      <option value="Maize">Maize</option>
                      <option value="Chickpea">Chickpea</option>
                      <option value="Pigeon Peas">Pigeon Peas (Kandulu)</option>
                      <option value="Groundnut">Groundnut</option>
                      <option value="Soybean">Soybean</option>
                      <option value="Sugarcane">Sugarcane</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono text-slate-400 mb-1.5 uppercase">Soil Type</label>
                    <select {...yieldForm.register("soil_type", { required: true })} className="w-full bg-slate-950/60 border border-green-500/20 rounded-xl px-3 py-2.5 text-white">
                      <option value="Red">Red Soil</option>
                      <option value="Black">Black Soil</option>
                      <option value="Alluvial">Alluvial Soil</option>
                      <option value="Clay">Clay Soil</option>
                      <option value="Sandy">Sandy Soil</option>
                      <option value="Loamy">Loamy Soil</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-400 mb-1.5 uppercase">Cultivation Area (Acres)</label>
                    <input type="number" step="0.1" {...yieldForm.register("area_acres", { required: true })} className="w-full bg-slate-950/60 border border-green-500/20 rounded-xl px-3 py-2.5 text-white" />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1.5 uppercase">Soil pH</label>
                    <input type="number" step="0.1" defaultValue="6.5" {...yieldForm.register("ph")} className="w-full bg-slate-950/60 border border-green-500/20 rounded-xl px-3 py-2.5 text-white" />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-slate-400 mb-1.5 uppercase">N (Nitrogen)</label>
                    <input type="number" step="1" {...yieldForm.register("nitrogen", { required: true })} className="w-full bg-slate-950/60 border border-green-500/20 rounded-xl px-3 py-2.5 text-white" />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1.5 uppercase">P (Phosphorus)</label>
                    <input type="number" step="1" {...yieldForm.register("phosphorus", { required: true })} className="w-full bg-slate-950/60 border border-green-500/20 rounded-xl px-3 py-2.5 text-white" />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1.5 uppercase">K (Potassium)</label>
                    <input type="number" step="1" {...yieldForm.register("potassium", { required: true })} className="w-full bg-slate-950/60 border border-green-500/20 rounded-xl px-3 py-2.5 text-white" />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-slate-400 mb-1.5 uppercase">Temp (°C)</label>
                    <input type="number" step="0.1" {...yieldForm.register("temperature", { required: true })} className="w-full bg-slate-950/60 border border-green-500/20 rounded-xl px-3 py-2.5 text-white" />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1.5 uppercase">Humid (%)</label>
                    <input type="number" step="1" {...yieldForm.register("humidity", { required: true })} className="w-full bg-slate-950/60 border border-green-500/20 rounded-xl px-3 py-2.5 text-white" />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1.5 uppercase">Rainfall (mm)</label>
                    <input type="number" step="1" {...yieldForm.register("rainfall", { required: true })} className="w-full bg-slate-950/60 border border-green-500/20 rounded-xl px-3 py-2.5 text-white" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={yieldLoading}
                  className="w-full mt-4 py-3 bg-green-600 hover:bg-green-500 text-slate-900 font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 border border-green-400 shadow-[0_4px_20px_rgba(34,197,94,0.25)] glow-btn"
                >
                  {yieldLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
                  <span>Calculate Predicted Yield</span>
                </button>
              </form>
            </div>
          </div>

          {/* Results Output */}
          <div className="lg:col-span-5">
            {yieldResult ? (
              <div className="glass-panel p-6 rounded-2xl border border-green-500/20 card-3d flex flex-col justify-between min-h-[350px]">
                <div className="space-y-4">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block">Yield Projection Report</span>
                  <div className="flex items-center gap-3 text-green-400">
                    <CheckCircle className="w-6 h-6" />
                    <h4 className="text-xl font-bold font-heading">Estimated Output</h4>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-950/40 p-4 rounded-xl border border-green-500/10 text-center">
                      <span className="text-3xl font-extrabold text-white block font-heading">{yieldResult.predicted_yield_quintals}</span>
                      <span className="text-[9px] text-slate-400 font-mono uppercase">TOTAL QUINTALS</span>
                    </div>
                    <div className="bg-slate-950/40 p-4 rounded-xl border border-green-500/10 text-center">
                      <span className="text-3xl font-extrabold text-green-400 block font-heading">{yieldResult.yield_per_acre}</span>
                      <span className="text-[9px] text-slate-400 font-mono uppercase">QUINTALS / ACRE</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed font-sans">
                    Yield estimation generated via XGBoost regressor factoring in regional historical output trends across Telangana districts.
                  </p>
                </div>
              </div>
            ) : (
              <div className="glass-panel p-8 rounded-2xl border border-green-500/10 flex flex-col items-center justify-center min-h-[350px] text-center text-slate-500">
                <Wand2 className="w-12 h-12 mb-4 text-green-500/25" />
                <h4 className="font-heading font-bold text-slate-400 text-base">Awaiting Inputs</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-xs leading-normal">
                  Provide your crop type, acreage, soil data, and location-based climate forecasts to compute estimated yields.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── AI FERTILIZER ADVISOR TAB ────────────────────────────── */}
      {activeTab === 'fertilizer' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Form */}
          <div className="lg:col-span-7">
            <div className="glass-panel p-6 rounded-2xl border border-green-500/20 card-3d">
              <h3 className="text-lg font-bold font-heading text-slate-200 flex items-center gap-2 mb-6">
                <Wand2 className="w-5 h-5 text-green-400" />
                <span>Decision Tree Fertilizer Advisor</span>
              </h3>

              <form onSubmit={fertForm.handleSubmit(onRunFert)} className="space-y-4 text-xs font-mono">
                <div className="grid grid-cols-2 gap-4 font-sans">
                  <div>
                    <label className="block text-[10px] font-mono text-slate-400 mb-1.5 uppercase">Crop Type</label>
                    <select {...fertForm.register("crop_name", { required: true })} className="w-full bg-slate-950/60 border border-green-500/20 rounded-xl px-3 py-2.5 text-white">
                      <option value="Rice">Rice (Paddy)</option>
                      <option value="Cotton">Cotton</option>
                      <option value="Maize">Maize</option>
                      <option value="Chickpea">Chickpea</option>
                      <option value="Pigeon Peas">Pigeon Peas</option>
                      <option value="Groundnut">Groundnut</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono text-slate-400 mb-1.5 uppercase">Soil Type</label>
                    <select {...fertForm.register("soil_type", { required: true })} className="w-full bg-slate-950/60 border border-green-500/20 rounded-xl px-3 py-2.5 text-white">
                      <option value="Red">Red Soil</option>
                      <option value="Black">Black Soil</option>
                      <option value="Alluvial">Alluvial Soil</option>
                      <option value="Clay">Clay Soil</option>
                      <option value="Sandy">Sandy Soil</option>
                      <option value="Loamy">Loamy Soil</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-slate-400 mb-1.5 uppercase">N (Nitrogen)</label>
                    <input type="number" step="1" {...fertForm.register("nitrogen", { required: true })} className="w-full bg-slate-950/60 border border-green-500/20 rounded-xl px-3 py-2.5 text-white" />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1.5 uppercase">P (Phosphorus)</label>
                    <input type="number" step="1" {...fertForm.register("phosphorus", { required: true })} className="w-full bg-slate-950/60 border border-green-500/20 rounded-xl px-3 py-2.5 text-white" />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1.5 uppercase">K (Potassium)</label>
                    <input type="number" step="1" {...fertForm.register("potassium", { required: true })} className="w-full bg-slate-950/60 border border-green-500/20 rounded-xl px-3 py-2.5 text-white" />
                  </div>
                </div>

                <div className="font-sans">
                  <label className="block text-[10px] font-mono text-slate-400 mb-1.5 uppercase">Current Growth Stage</label>
                  <select {...fertForm.register("crop_stage", { required: true })} className="w-full bg-slate-950/60 border border-green-500/20 rounded-xl px-3 py-2.5 text-white">
                    <option value="Sowing">Sowing (విత్తే సమయం)</option>
                    <option value="Vegetative">Vegetative (పిలక దశ)</option>
                    <option value="Flowering">Flowering (పూత దశ)</option>
                    <option value="Harvesting">Harvesting (కోత దశ)</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={fertLoading}
                  className="w-full mt-4 py-3 bg-green-600 hover:bg-green-500 text-slate-900 font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 border border-green-400 shadow-[0_4px_20px_rgba(34,197,94,0.25)] glow-btn"
                >
                  {fertLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
                  <span>Get Fertilizer Advisory</span>
                </button>
              </form>
            </div>
          </div>

          {/* Results Output */}
          <div className="lg:col-span-5">
            {fertResult ? (
              <div className="glass-panel p-6 rounded-2xl border border-green-500/20 card-3d flex flex-col justify-between min-h-[350px]">
                <div className="space-y-4">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block">AI Fertilizer Guide</span>
                  <div className="flex items-center gap-3 text-green-400">
                    <CheckCircle className="w-6 h-6" />
                    <h4 className="text-xl font-bold font-heading">Recommended Application</h4>
                  </div>
                  
                  <div className="bg-slate-950/40 p-4 rounded-xl border border-green-500/10 text-center space-y-1">
                    <span className="text-2xl font-extrabold text-white block font-heading">{fertResult.fertilizer}</span>
                    <span className="text-xs text-green-400 font-bold font-mono">Dosage: {fertResult.dosage_kg_per_acre} kg/Acre</span>
                  </div>

                  <div className="space-y-1.5 border-t border-green-500/10 pt-3">
                    <span className="text-[9px] font-mono text-slate-500 block">APPLICATION INSTRUCTIONS</span>
                    <p className="text-xs text-slate-300 leading-normal font-sans">{fertResult.instructions}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="glass-panel p-8 rounded-2xl border border-green-500/10 flex flex-col items-center justify-center min-h-[350px] text-center text-slate-500">
                <Wand2 className="w-12 h-12 mb-4 text-green-500/25" />
                <h4 className="font-heading font-bold text-slate-400 text-base">Awaiting Inputs</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-xs leading-normal">
                  Provide your crop type, soil type, NPK readings, and current crop growth phase to retrieve customized fertilizer rates.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
