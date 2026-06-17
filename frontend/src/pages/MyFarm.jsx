import React, { useContext, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { AppContext } from '../context/AppContext';
import { Map, Landmark, Ruler, Droplets, Grid3X3, Save, Compass } from 'lucide-react';
import { toast } from 'react-toastify';
import { getFarmerProfile, updateFarmerProfile } from '../services/api';

export const MyFarm = () => {
  const { user, login, t } = useContext(AppContext);
  const [capturingGPS, setCapturingGPS] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const { register, handleSubmit, reset, getValues, formState: { errors } } = useForm({
    defaultValues: {
      name: user?.name || "",
      farmName: user?.farmName || "",
      village: user?.village || "",
      mandal: user?.mandal || "",
      district: user?.district || "",
      landSize: user?.landSize || "",
      soilType: user?.soilType || "Red Sandy",
      waterSource: user?.waterSource || "Borewell",
      latitude: user?.latitude || "",
      longitude: user?.longitude || ""
    }
  });

  // Load latest farmer profile from backend on mount
  useEffect(() => {
    if (user?.id && user.id !== 0) {
      setLoading(true);
      getFarmerProfile(user.id)
        .then((profile) => {
          const loadedData = {
            name: profile.name || "",
            farmName: user?.farmName || (profile.name ? `${profile.name} Farms` : ""),
            village: profile.village || "",
            mandal: profile.mandal || "",
            district: profile.district || "",
            landSize: profile.land_size_acres ? String(profile.land_size_acres) : "",
            soilType: profile.soil_type || "Red Sandy",
            waterSource: profile.water_source || "Borewell",
            latitude: profile.latitude ? String(profile.latitude) : "",
            longitude: profile.longitude ? String(profile.longitude) : ""
          };
          reset(loadedData);
          
          // Sync with AppContext as well
          const token = localStorage.getItem('farmer_token');
          login({
            ...user,
            name: profile.name,
            village: profile.village,
            mandal: profile.mandal,
            district: profile.district,
            landSize: String(profile.land_size_acres),
            soilType: profile.soil_type,
            waterSource: profile.water_source,
            latitude: profile.latitude,
            longitude: profile.longitude,
            farmName: loadedData.farmName
          }, token);
        })
        .catch((err) => {
          console.error("Failed to fetch fresh farmer profile:", err);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      reset({
        name: user?.name || "",
        farmName: user?.farmName || "",
        village: user?.village || "",
        mandal: user?.mandal || "",
        district: user?.district || "",
        landSize: user?.landSize || "",
        soilType: user?.soilType || "Red Sandy",
        waterSource: user?.waterSource || "Borewell",
        latitude: user?.latitude || "",
        longitude: user?.longitude || ""
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, reset]);

  const captureGPS = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }
    setCapturingGPS(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const currentValues = getValues();
        reset({
          ...currentValues,
          latitude: position.coords.latitude.toFixed(6),
          longitude: position.coords.longitude.toFixed(6),
        });
        toast.success("GPS location captured successfully! 📍");
        setCapturingGPS(false);
      },
      (error) => {
        console.error(error);
        toast.error("Failed to capture GPS. Please input coordinates manually.");
        setCapturingGPS(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const onSubmit = async (data) => {
    if (!user?.id || user.id === 0) {
      login({ ...user, ...data }, localStorage.getItem('farmer_token') || 'demo-token');
      toast.success("Farm profile updated (Demo mode)!");
      return;
    }

    try {
      const payload = {
        name: data.name,
        village: data.village,
        mandal: data.mandal,
        district: data.district,
        latitude: data.latitude ? parseFloat(data.latitude) : null,
        longitude: data.longitude ? parseFloat(data.longitude) : null,
        land_size_acres: data.landSize ? parseFloat(data.landSize) : 0,
        soil_type: data.soilType,
        water_source: data.waterSource
      };

      const updatedProfile = await updateFarmerProfile(user.id, payload);
      const token = localStorage.getItem('farmer_token');
      
      const enriched = {
        ...user,
        name: updatedProfile.name,
        village: updatedProfile.village,
        mandal: updatedProfile.mandal,
        district: updatedProfile.district,
        landSize: String(updatedProfile.land_size_acres),
        soilType: updatedProfile.soil_type,
        waterSource: updatedProfile.water_source,
        latitude: updatedProfile.latitude,
        longitude: updatedProfile.longitude,
        farmName: data.farmName, 
      };
      
      login(enriched, token);
      toast.success("Farm profile saved to database successfully! 🚜");
    } catch (err) {
      console.error(err);
      toast.error("Failed to save farm profile to database.");
    }
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

        {loading && (
          <div className="absolute inset-0 bg-slate-950/60 rounded-3xl flex items-center justify-center z-10 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-2">
              <div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-xs text-slate-400 font-mono">Syncing farm data...</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Farmer Name */}
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-2 uppercase tracking-widest">Farmer Name</label>
              <input
                type="text"
                {...register("name", { required: true })}
                className="w-full bg-slate-950/60 border border-green-500/20 focus:border-green-500/60 rounded-xl px-4 py-3 text-sm font-sans text-white outline-none transition-all focus:shadow-[0_0_15px_rgba(34,197,94,0.15)]"
              />
            </div>

            {/* Farm Name */}
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-2 uppercase tracking-widest">Farm Name</label>
              <input
                type="text"
                {...register("farmName", { required: true })}
                className="w-full bg-slate-950/60 border border-green-500/20 focus:border-green-500/60 rounded-xl px-4 py-3 text-sm font-sans text-white outline-none transition-all focus:shadow-[0_0_15px_rgba(34,197,94,0.15)]"
              />
            </div>

            {/* Village Name */}
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-2 uppercase tracking-widest">Village</label>
              <input
                type="text"
                {...register("village", { required: true })}
                className="w-full bg-slate-950/60 border border-green-500/20 focus:border-green-500/60 rounded-xl px-4 py-3 text-sm font-sans text-white outline-none transition-all focus:shadow-[0_0_15px_rgba(34,197,94,0.15)]"
              />
            </div>

            {/* Mandal Name */}
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-2 uppercase tracking-widest">Mandal</label>
              <input
                type="text"
                {...register("mandal", { required: true })}
                className="w-full bg-slate-950/60 border border-green-500/20 focus:border-green-500/60 rounded-xl px-4 py-3 text-sm font-sans text-white outline-none transition-all focus:shadow-[0_0_15px_rgba(34,197,94,0.15)]"
              />
            </div>

            {/* District Name */}
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-2 uppercase tracking-widest">District</label>
              <input
                type="text"
                {...register("district", { required: true })}
                className="w-full bg-slate-950/60 border border-green-500/20 focus:border-green-500/60 rounded-xl px-4 py-3 text-sm font-sans text-white outline-none transition-all focus:shadow-[0_0_15px_rgba(34,197,94,0.15)]"
              />
            </div>

            {/* Land Size */}
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-2 uppercase tracking-widest">Land Size (Acres)</label>
              <input
                type="number"
                step="0.1"
                {...register("landSize", { required: true })}
                className="w-full bg-slate-950/60 border border-green-500/20 focus:border-green-500/60 rounded-xl px-4 py-3 text-sm font-sans text-white outline-none transition-all focus:shadow-[0_0_15px_rgba(34,197,94,0.15)]"
              />
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

            {/* GPS Coordinates */}
            <div className="md:col-span-2 space-y-2">
              <label className="block text-xs font-mono text-slate-400 mb-2 uppercase tracking-widest">GPS Coordinates</label>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-grow grid grid-cols-2 gap-3">
                  <input
                    type="number"
                    step="0.000001"
                    placeholder="Latitude"
                    {...register("latitude")}
                    className="w-full bg-slate-950/60 border border-green-500/20 focus:border-green-500/60 rounded-xl px-4 py-3 text-sm font-sans text-white outline-none transition-all focus:shadow-[0_0_15px_rgba(34,197,94,0.15)]"
                  />
                  <input
                    type="number"
                    step="0.000001"
                    placeholder="Longitude"
                    {...register("longitude")}
                    className="w-full bg-slate-950/60 border border-green-500/20 focus:border-green-500/60 rounded-xl px-4 py-3 text-sm font-sans text-white outline-none transition-all focus:shadow-[0_0_15px_rgba(34,197,94,0.15)]"
                  />
                </div>
                <button
                  type="button"
                  onClick={captureGPS}
                  disabled={capturingGPS}
                  className="py-3 px-5 bg-blue-600/20 hover:bg-blue-600/30 disabled:bg-blue-950/10 text-blue-300 border border-blue-500/30 rounded-xl transition-all font-semibold text-xs flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(59,130,246,0.1)] focus:outline-none"
                >
                  <Compass className={`w-4 h-4 ${capturingGPS ? 'animate-spin' : ''}`} />
                  <span>{capturingGPS ? 'Locating...' : 'Capture GPS'}</span>
                </button>
              </div>
              <p className="text-[10px] text-slate-500 font-mono">Hyperlocal weather diagnostics require valid GPS coordinates. Enable geolocation permissions or input them manually.</p>
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
