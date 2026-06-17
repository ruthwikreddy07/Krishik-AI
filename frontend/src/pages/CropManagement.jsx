import React, { useState, useEffect, useContext } from 'react';
import { useForm } from 'react-hook-form';
import { Sprout, Calendar, Plus, RefreshCw, ChevronDown } from 'lucide-react';
import { toast } from 'react-toastify';
import { AppContext } from '../context/AppContext';
import { getCrops, addCrop, updateCropStage } from '../services/api';

export const CropManagement = () => {
  const { user } = useContext(AppContext);
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addingCrop, setAddingCrop] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

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
      const updated = await updateCropStage(cropId, newStage);
      setCrops(prev => prev.map(c => c.id === cropId ? { ...c, crop_stage: updated.crop_stage } : c));
      toast.success(`Stage updated to ${newStage}`);
    } catch {
      toast.error('Failed to update stage.');
    }
  };

  return (
    <div className="space-y-8 page-fade-in">
      
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-green-500/10 border border-green-500/40 flex items-center justify-center shadow-[0_0_15px_rgba(34,197,94,0.3)]">
          <Sprout className="w-5 h-5 text-green-400 animate-bounce" />
        </div>
        <div>
          <h2 className="text-2xl font-bold font-heading text-slate-100 glow-text-green">Crop Management Trackers</h2>
          <p className="text-xs text-slate-400 mt-0.5">Add and track crop lifecycles with customized growth markers and warning advisory notifications.</p>
        </div>
      </div>

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
                    {user?.id && user.id !== 0 && (
                      <div className="relative">
                        <select
                          value={cropStage}
                          onChange={e => handleStageUpdate(crop.id, e.target.value)}
                          className="text-[10px] font-mono font-bold uppercase tracking-wider text-green-400 bg-green-500/10 border border-green-500/20 px-2.5 py-1 rounded-md cursor-pointer outline-none"
                        >
                          {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                    )}
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
              {/* Crop Type Input */}
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1.5 uppercase tracking-widest">Crop Name</label>
                <input
                  type="text"
                  placeholder="e.g. Maize, Chilli, Groundnut"
                  {...register("name", { required: true })}
                  className="w-full bg-slate-950/60 border border-green-500/20 focus:border-green-500/60 rounded-xl px-4 py-3 text-sm font-sans text-white outline-none transition-all"
                />
              </div>

              {/* Seed Variety */}
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1.5 uppercase tracking-widest">Seed Variety</label>
                <input
                  type="text"
                  placeholder="e.g. Hybrid Premium R-22"
                  {...register("variety")}
                  className="w-full bg-slate-950/60 border border-green-500/20 focus:border-green-500/60 rounded-xl px-4 py-3 text-sm font-sans text-white outline-none transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Sown Date */}
                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1.5 uppercase tracking-widest">Sown Date</label>
                  <input
                    type="date"
                    {...register("sownDate", { required: true })}
                    className="w-full bg-slate-950/60 border border-green-500/20 focus:border-green-500/60 rounded-xl px-3 py-3 text-sm font-sans text-white outline-none transition-all"
                  />
                </div>

                {/* Duration */}
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
                className="w-full mt-4 py-3.5 px-4 bg-green-600 hover:bg-green-500 text-slate-900 font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 border border-green-400 shadow-[0_4px_20px_rgba(34,197,94,0.25)] glow-btn disabled:opacity-50"
              >
                {addingCrop ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                <span>{addingCrop ? 'Adding...' : 'Initiate Lifecycle Tracker'}</span>
              </button>
            </form>
          </div>
        </div>

      </div>

    </div>
  );
};
