import React, { useContext } from 'react';
import { useForm } from 'react-hook-form';
import { AppContext } from '../context/AppContext';
import { Map, Landmark, Ruler, Droplets, Grid3X3, Save } from 'lucide-react';
import { toast } from 'react-toastify';

export const MyFarm = () => {
  const { user, login, t } = useContext(AppContext);
  
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      name: user?.name || "Mallaiah Raju",
      farmName: user?.farmName || "Mallaiah Farms",
      village: user?.village || "Nalgonda Rural",
      landSize: user?.landSize || "4.5",
      soilType: user?.soilType || "Red Sandy",
      waterSource: user?.waterSource || "Borewell"
    }
  });

  const onSubmit = (data) => {
    // Save to AppContext & LocalStorage
    login({ ...user, ...data }, localStorage.getItem('farmer_token') || 'demo-token');
    toast.success("Farm profile updated successfully!", {
      theme: "dark",
      toastId: "farm-profile-update"
    });
  };

  return (
    <div className="max-w-3xl mx-auto page-fade-in space-y-6">
      
      {/* Page Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-green-500/10 border border-green-500/40 flex items-center justify-center shadow-[0_0_15px_rgba(34,197,94,0.3)]">
          <Map className="w-5 h-5 text-green-400" />
        </div>
        <div>
          <h2 className="text-2xl font-bold font-heading text-slate-100 glow-text-green">{t('myFarm')}</h2>
          <p className="text-xs text-slate-400 mt-0.5">Define your soil composition and land details to get personalized AI farming recommendations.</p>
        </div>
      </div>

      {/* Main Profile Form */}
      <div className="glass-panel p-8 rounded-3xl border border-green-500/20 card-3d relative">
        <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/5 rounded-full blur-2xl pointer-events-none"></div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Farmer Name */}
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-2 uppercase tracking-widest">Farmer Name</label>
              <div className="relative">
                <input
                  type="text"
                  {...register("name", { required: true })}
                  className="w-full bg-slate-950/60 border border-green-500/20 focus:border-green-500/60 rounded-xl px-4 py-3 text-sm font-sans text-white outline-none transition-all focus:shadow-[0_0_15px_rgba(34,197,94,0.15)]"
                />
              </div>
            </div>

            {/* Farm Name */}
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-2 uppercase tracking-widest">Farm Name</label>
              <div className="relative">
                <input
                  type="text"
                  {...register("farmName", { required: true })}
                  className="w-full bg-slate-950/60 border border-green-500/20 focus:border-green-500/60 rounded-xl px-4 py-3 text-sm font-sans text-white outline-none transition-all focus:shadow-[0_0_15px_rgba(34,197,94,0.15)]"
                />
              </div>
            </div>

            {/* Village Name */}
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-2 uppercase tracking-widest">Village / Mandal</label>
              <div className="relative">
                <input
                  type="text"
                  {...register("village", { required: true })}
                  className="w-full bg-slate-950/60 border border-green-500/20 focus:border-green-500/60 rounded-xl px-4 py-3 text-sm font-sans text-white outline-none transition-all focus:shadow-[0_0_15px_rgba(34,197,94,0.15)]"
                />
              </div>
            </div>

            {/* Land Size */}
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-2 uppercase tracking-widest">Land Size (Acres)</label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  {...register("landSize", { required: true })}
                  className="w-full bg-slate-950/60 border border-green-500/20 focus:border-green-500/60 rounded-xl px-4 py-3 text-sm font-sans text-white outline-none transition-all focus:shadow-[0_0_15px_rgba(34,197,94,0.15)]"
                />
              </div>
            </div>

            {/* Soil Type */}
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-2 uppercase tracking-widest">Soil Type</label>
              <select
                {...register("soilType", { required: true })}
                className="w-full bg-slate-950/60 border border-green-500/20 focus:border-green-500/60 rounded-xl px-4 py-3 text-sm font-sans text-white outline-none transition-all focus:shadow-[0_0_15px_rgba(34,197,94,0.15)]"
              >
                <option value="Red Sandy" className="bg-slate-950">Red Sandy Soil (Erra Nelalu)</option>
                <option value="Black Clayey" className="bg-slate-950">Black Clayey Soil (Nalla Regadi)</option>
                <option value="Alluvial" className="bg-slate-950">Alluvial Soil (Odugu Nelalu)</option>
                <option value="Loamy" className="bg-slate-950">Loamy / Red Earth</option>
              </select>
            </div>

            {/* Water Irrigation Source */}
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-2 uppercase tracking-widest">Water Source</label>
              <select
                {...register("waterSource", { required: true })}
                className="w-full bg-slate-950/60 border border-green-500/20 focus:border-green-500/60 rounded-xl px-4 py-3 text-sm font-sans text-white outline-none transition-all focus:shadow-[0_0_15px_rgba(34,197,94,0.15)]"
              >
                <option value="Borewell" className="bg-slate-950">Borewell (Bavi)</option>
                <option value="Canal" className="bg-slate-950">Canal Irrigation (Kaluva)</option>
                <option value="Well" className="bg-slate-950">Open Well</option>
                <option value="Rainfed" className="bg-slate-950">Rainfed (Aadhaara Varsham)</option>
              </select>
            </div>

          </div>

          <div className="pt-6 border-t border-green-500/10 flex justify-end">
            <button
              type="submit"
              className="py-3 px-6 bg-green-600 hover:bg-green-500 text-slate-900 font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 border border-green-400 shadow-[0_4px_20px_rgba(34,197,94,0.25)] hover:shadow-[0_4px_25px_rgba(34,197,94,0.4)] glow-btn"
            >
              <Save className="w-4 h-4" />
              <span>Save Farm Profile</span>
            </button>
          </div>
        </form>

      </div>

    </div>
  );
};
