import React, { useState, useContext } from "react";
import { useForm } from "react-hook-form";
import {
  Workflow, Wand2, RefreshCw, CheckCircle,
  Sprout, Scale, TrendingUp, MapPin, ChevronRight,
  Compass, Banknote, Navigation, Info,
} from "lucide-react";
import { toast } from "react-toastify";
import { AppContext } from "../context/AppContext";
import { runPipeline, getWeatherByFarmer, getWeatherByLocation } from "../services/api";

const SOIL_TYPES = ["Red", "Black", "Alluvial", "Clay", "Sandy", "Loamy"];
const CROP_OVERRIDES = [
  "", "Rice", "Cotton", "Maize", "Wheat", "Sugarcane",
  "Groundnut", "Soybean", "Jowar", "Bajra", "Turmeric", "Chilli", "Onion", "Tomato",
];

const STAGE_META = [
  { label: "Crop Recommendation", Icon: Sprout,     color: "#22c55e" },
  { label: "Yield Prediction",    Icon: Scale,      color: "#34d399" },
  { label: "Price Forecasting",   Icon: TrendingUp, color: "#a3e635" },
  { label: "Mandi Optimization",  Icon: MapPin,     color: "#86efac" },
];

const statusBadge = (status) => {
  const map = {
    success: "bg-green-500/15 text-green-400 border-green-500/30",
    fallback: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    skipped:  "bg-slate-700/40 text-slate-400 border-slate-500/20",
    error:    "bg-red-500/15 text-red-400 border-red-500/30",
  };
  return `inline-flex items-center px-2 py-0.5 rounded-md border text-[9px] font-mono font-bold uppercase tracking-widest ${map[status] || map.error}`;
};

export const Pipeline = () => {
  const { user } = useContext(AppContext);
  const [result, setResult]     = useState(null);
  const [running, setRunning]   = useState(false);
  const [expanded, setExpanded] = useState(null);
  const [weatherFilling, setWeatherFilling] = useState(false);

  const { register, handleSubmit, setValue } = useForm({
    defaultValues: {
      nitrogen: 60, phosphorus: 45, potassium: 40,
      temperature: 28, humidity: 65, rainfall: 200,
      ph: 6.5, soil_type: "Red", area_acres: 2.0,
      farmer_lat: 17.9784, farmer_lon: 79.5941,
      crop_override: "", days_ahead: 7, top_mandis: 10,
    },
  });

  React.useEffect(() => {
    if (user) {
      if (user.soil_n != null) setValue("nitrogen", Number(user.soil_n));
      if (user.soil_p != null) setValue("phosphorus", Number(user.soil_p));
      if (user.soil_k != null) setValue("potassium", Number(user.soil_k));
      if (user.soil_ph != null) setValue("ph", Number(user.soil_ph));
      if (user.soilType) {
        const matched = SOIL_TYPES.find((s) => s.toLowerCase() === String(user.soilType).toLowerCase()) || user.soilType;
        setValue("soil_type", matched);
      }
      if (user.landSize) setValue("area_acres", Number(user.landSize));
      if (user.latitude) setValue("farmer_lat", Number(user.latitude));
      if (user.longitude) setValue("farmer_lon", Number(user.longitude));
    }
  }, [user, setValue]);

  const autofillWeather = async () => {
    setWeatherFilling(true);
    try {
      let wx;
      if (user?.id && user.id !== 99999) {
        wx = await getWeatherByFarmer(user.id);
      } else {
        const pos = await new Promise((res, rej) =>
          navigator.geolocation.getCurrentPosition(res, rej, { timeout: 6000 })
        );
        wx = await getWeatherByLocation(pos.coords.latitude, pos.coords.longitude);
        setValue("farmer_lat", +pos.coords.latitude.toFixed(6));
        setValue("farmer_lon", +pos.coords.longitude.toFixed(6));
      }
      if (wx?.current) {
        setValue("temperature", +(wx.current.temperature ?? 28).toFixed(1));
        setValue("humidity",    +(wx.current.humidity    ?? 65).toFixed(0));
        setValue("rainfall",    +(wx.current.rainfall    ?? 200).toFixed(0));
      }
      if (user?.latitude)  setValue("farmer_lat", user.latitude);
      if (user?.longitude) setValue("farmer_lon", user.longitude);
      toast.success("Weather data auto-filled from your location!");
    } catch {
      toast.warn("Could not fetch live weather — please enter values manually.");
    } finally {
      setWeatherFilling(false);
    }
  };

  const onSubmit = async (data) => {
    setRunning(true);
    setResult(null);
    setExpanded(null);
    try {
      const payload = {
        nitrogen:    +data.nitrogen,  phosphorus: +data.phosphorus,
        potassium:   +data.potassium, temperature: +data.temperature,
        humidity:    +data.humidity,  rainfall:   +data.rainfall,
        ph:          +data.ph,        soil_type:  data.soil_type,
        area_acres:  +data.area_acres,
        farmer_lat:  +data.farmer_lat, farmer_lon: +data.farmer_lon,
        days_ahead:  +data.days_ahead, top_mandis: +data.top_mandis,
        ...(data.crop_override ? { crop_override: data.crop_override } : {}),
      };
      const res = await runPipeline(payload);
      setResult(res);
      toast.success("Pipeline completed! Check your results below.");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Pipeline run failed. Please check inputs.");
    } finally {
      setRunning(false);
    }
  };

  const fmt = (n, dec = 0) =>
    (n ?? 0).toLocaleString("en-IN", { minimumFractionDigits: dec, maximumFractionDigits: dec });

  const inputCls =
    "w-full bg-slate-950/60 border border-green-500/20 rounded-xl px-3 py-2.5 text-white text-xs font-mono focus:outline-none focus:border-green-500/50 transition-colors";
  const labelCls = "block text-slate-400 mb-1.5 uppercase text-[10px] font-mono";

  return (
    <div className="space-y-8 page-fade-in">

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-green-500/10 border border-green-500/40 flex items-center justify-center shadow-[0_0_15px_rgba(34,197,94,0.3)]">
          <Workflow className="w-5 h-5 text-green-400" />
        </div>
        <div>
          <h2 className="text-2xl font-bold font-heading text-slate-100 glow-text-green">
            Crop-to-Market Pipeline
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            4-stage AI pipeline: Crop Recommendation &rarr; Yield Prediction &rarr; Price Forecasting &rarr; Mandi Optimization.
          </p>
        </div>
      </div>

      {/* Stage pills */}
      <div className="flex flex-wrap gap-2">
        {STAGE_META.map(({ label, Icon, color }, i) => (
          <div key={i} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-green-500/10 bg-slate-950/40 text-xs font-mono text-slate-400">
            <span className="text-[10px] font-bold text-slate-500">0{i + 1}</span>
            <Icon className="w-3.5 h-3.5" style={{ color }} />
            <span>{label}</span>
          </div>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* ── Form ── */}
        <div className="lg:col-span-7 glass-panel p-6 rounded-2xl border border-green-500/20 card-3d">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-base font-bold font-heading text-slate-200 flex items-center gap-2">
              <Wand2 className="w-4 h-4 text-green-400" />
              Pipeline Inputs
            </h3>
            <button
              type="button" onClick={autofillWeather} disabled={weatherFilling}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-green-500/20 bg-green-500/5 text-green-400 text-[10px] font-mono font-semibold hover:bg-green-500/10 transition-all disabled:opacity-50"
            >
              {weatherFilling ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Compass className="w-3 h-3" />}
              Autofill Weather
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 text-xs font-mono">

            {/* NPK */}
            <div>
              <p className="text-[10px] uppercase text-green-400/70 tracking-widest mb-3 font-bold">Soil Composition (mg/kg)</p>
              <div className="grid grid-cols-3 gap-4">
                {[["nitrogen","Nitrogen (N)"],["phosphorus","Phosphorus (P)"],["potassium","Potassium (K)"]].map(([k,l]) => (
                  <div key={k}>
                    <label className={labelCls}>{l}</label>
                    <input type="number" step="1" {...register(k, { required: true })} className={inputCls} />
                  </div>
                ))}
              </div>
            </div>

            {/* Weather */}
            <div>
              <p className="text-[10px] uppercase text-green-400/70 tracking-widest mb-3 font-bold">Weather Conditions</p>
              <div className="grid grid-cols-3 gap-4">
                {[["temperature","Temp (°C)","0.1"],["humidity","Humidity (%)","1"],["rainfall","Rainfall (mm)","1"]].map(([k,l,s]) => (
                  <div key={k}>
                    <label className={labelCls}>{l}</label>
                    <input type="number" step={s} {...register(k, { required: true })} className={inputCls} />
                  </div>
                ))}
              </div>
            </div>

            {/* Soil & Land */}
            <div>
              <p className="text-[10px] uppercase text-green-400/70 tracking-widest mb-3 font-bold">Soil &amp; Land</p>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className={labelCls}>Soil pH</label>
                  <input type="number" step="0.1" {...register("ph", { required: true })} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Soil Type</label>
                  <select {...register("soil_type")} className={inputCls + " cursor-pointer"}>
                    {SOIL_TYPES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Area (Acres)</label>
                  <input type="number" step="0.1" {...register("area_acres", { required: true, min: 0.1 })} className={inputCls} />
                </div>
              </div>
            </div>

            {/* GPS */}
            <div>
              <p className="text-[10px] uppercase text-green-400/70 tracking-widest mb-3 font-bold">Farm GPS Coordinates</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Latitude</label>
                  <input type="number" step="0.0001" {...register("farmer_lat", { required: true })} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Longitude</label>
                  <input type="number" step="0.0001" {...register("farmer_lon", { required: true })} className={inputCls} />
                </div>
              </div>
            </div>

            {/* Advanced */}
            <div>
              <p className="text-[10px] uppercase text-green-400/70 tracking-widest mb-3 font-bold">Advanced Options</p>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className={labelCls}>Crop Override</label>
                  <select {...register("crop_override")} className={inputCls + " cursor-pointer"}>
                    {CROP_OVERRIDES.map(c => <option key={c} value={c}>{c || "— Auto (Stage 1) —"}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Forecast Days</label>
                  <input type="number" step="1" min="1" max="30" {...register("days_ahead")} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Top Mandis (n)</label>
                  <input type="number" step="1" min="1" max="50" {...register("top_mandis")} className={inputCls} />
                </div>
              </div>
            </div>

            <button
              type="submit" disabled={running}
              className="w-full mt-2 py-3 bg-green-600 hover:bg-green-500 text-slate-900 font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 border border-green-400 shadow-[0_4px_20px_rgba(34,197,94,0.25)] glow-btn disabled:opacity-50"
            >
              {running
                ? <><RefreshCw className="w-4 h-4 animate-spin" /><span>Running Pipeline...</span></>
                : <><Workflow className="w-4 h-4" /><span>Run Full Pipeline</span></>}
            </button>
          </form>
        </div>

        {/* ── Results ── */}
        <div className="lg:col-span-5 space-y-6">

          {!result && !running && (
            <div className="glass-panel p-8 rounded-2xl border border-green-500/10 flex flex-col items-center justify-center text-center min-h-[320px]">
              <Workflow className="w-12 h-12 text-green-500/20 mb-4" />
              <p className="text-slate-400 text-sm font-mono">
                Fill in your farm details and click <strong className="text-green-400">Run Full Pipeline</strong> to get your personalised Crop-to-Market recommendation.
              </p>
            </div>
          )}

          {running && (
            <div className="glass-panel p-8 rounded-2xl border border-green-500/20 card-3d flex flex-col items-center justify-center text-center min-h-[320px]">
              <RefreshCw className="w-10 h-10 text-green-400 animate-spin mb-4" />
              <p className="text-slate-300 font-mono text-sm mb-1">Executing 4-stage pipeline...</p>
              <p className="text-slate-500 text-[11px] font-mono">This may take up to 30 seconds</p>
              <div className="flex gap-2 mt-6">
                {STAGE_META.map(({ Icon, color }, i) => (
                  <div key={i} className="flex flex-col items-center gap-1 opacity-40">
                    <div className="w-7 h-7 rounded-lg border border-green-500/20 bg-green-500/5 flex items-center justify-center animate-pulse">
                      <Icon className="w-3.5 h-3.5" style={{ color }} />
                    </div>
                    <span className="text-[8px] text-slate-500 font-mono">0{i + 1}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {result && (
            <>
              {/* Summary Card */}
              <div className="glass-panel p-5 rounded-2xl border border-green-500/20 card-3d relative overflow-hidden">
                <div className="absolute top-0 right-0 w-28 h-28 bg-green-500/5 rounded-full blur-3xl pointer-events-none" />

                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle className="w-5 h-5 text-green-400 shrink-0" />
                  <span className="text-sm font-bold font-heading text-slate-200">Pipeline Result</span>
                  <span className={statusBadge(result.pipeline_status)}>{result.pipeline_status}</span>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-slate-950/50 border border-green-500/10 rounded-xl p-3 text-center">
                    <Sprout className="w-4 h-4 text-green-400 mx-auto mb-1" />
                    <span className="text-[9px] font-mono text-slate-500 uppercase block">Best Crop</span>
                    <span className="text-lg font-extrabold text-white font-heading leading-tight block mt-0.5">
                      {result.recommended_crop}
                    </span>
                  </div>
                  <div className="bg-slate-950/50 border border-green-500/10 rounded-xl p-3 text-center">
                    <Scale className="w-4 h-4 text-green-400 mx-auto mb-1" />
                    <span className="text-[9px] font-mono text-slate-500 uppercase block">Est. Yield</span>
                    <span className="text-lg font-extrabold text-white font-heading leading-tight block mt-0.5">
                      {fmt(result.predicted_yield_quintals, 1)}<span className="text-xs text-slate-400 font-mono"> qtl</span>
                    </span>
                  </div>
                  <div className="bg-slate-950/50 border border-green-500/10 rounded-xl p-3 text-center">
                    <TrendingUp className="w-4 h-4 text-green-400 mx-auto mb-1" />
                    <span className="text-[9px] font-mono text-slate-500 uppercase block">Forecast Price</span>
                    <span className="text-lg font-extrabold text-white font-heading leading-tight block mt-0.5">
                      Rs.{fmt(result.predicted_price_per_quintal)}<span className="text-xs text-slate-400 font-mono">/qtl</span>
                    </span>
                  </div>
                  <div className="bg-slate-950/50 border border-green-500/10 rounded-xl p-3 text-center">
                    <Banknote className="w-4 h-4 text-green-400 mx-auto mb-1" />
                    <span className="text-[9px] font-mono text-slate-500 uppercase block">Net Return</span>
                    <span className="text-lg font-extrabold text-green-400 font-heading leading-tight block mt-0.5">
                      {result.net_return_inr != null ? "Rs." + fmt(result.net_return_inr) : "—"}
                    </span>
                  </div>
                </div>

                {result.best_mandi && (
                  <div className="bg-green-500/8 border border-green-500/20 rounded-xl p-3 mb-4">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-bold text-green-300">{result.best_mandi.mandi_name}</p>
                        <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                          {result.best_mandi.district} &middot; {result.best_mandi.distance_km} km away &middot; Rs.{fmt(result.best_mandi.freight_cost_inr)} freight
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="bg-slate-950/40 border border-green-500/8 rounded-xl p-3">
                  <div className="flex gap-2 items-start">
                    <Info className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <p className="text-[11px] text-slate-400 leading-relaxed font-mono">{result.summary}</p>
                  </div>
                </div>
              </div>

              {/* Stage Accordion */}
              <div className="space-y-2">
                <p className="text-[10px] uppercase text-slate-500 tracking-widest font-mono font-bold px-1">Stage-by-Stage Breakdown</p>
                {result.stages.map((stage, i) => {
                  const { Icon, color } = STAGE_META[i] || STAGE_META[0];
                  const isOpen = expanded === i;
                  return (
                    <div key={i} className="glass-panel rounded-xl border border-green-500/10 overflow-hidden">
                      <button
                        type="button"
                        onClick={() => setExpanded(isOpen ? null : i)}
                        className="w-full flex items-center gap-3 p-3.5 text-left hover:bg-green-500/5 transition-all"
                      >
                        <div className="w-7 h-7 rounded-lg border border-green-500/15 bg-green-500/5 flex items-center justify-center shrink-0">
                          <Icon className="w-3.5 h-3.5" style={{ color }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-slate-200 font-mono">
                            <span className="text-slate-500 mr-1.5">0{stage.stage}</span>{stage.name}
                          </p>
                        </div>
                        <span className={statusBadge(stage.status)}>{stage.status}</span>
                        <ChevronRight className={"w-3.5 h-3.5 text-slate-500 shrink-0 transition-transform" + (isOpen ? " rotate-90" : "")} />
                      </button>
                      {isOpen && (
                        <div className="border-t border-green-500/10 bg-slate-950/30 px-4 py-3">
                          <pre className="text-[10px] font-mono text-slate-400 whitespace-pre-wrap break-words leading-relaxed max-h-48 overflow-y-auto">
                            {JSON.stringify(stage.data, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Ranked Mandis Table */}
              {result.stages?.[3]?.data?.ranked_mandis?.length > 0 && (
                <div className="glass-panel p-5 rounded-2xl border border-green-500/15 card-3d">
                  <h4 className="text-sm font-bold font-heading text-slate-200 flex items-center gap-2 mb-4">
                    <Navigation className="w-4 h-4 text-green-400" />
                    Top Mandis by Net Return
                  </h4>
                  <div className="bg-slate-950/60 rounded-xl border border-green-500/10 overflow-hidden">
                    <table className="w-full text-left border-collapse text-[11px]">
                      <thead>
                        <tr className="border-b border-green-500/10 bg-slate-900/50 text-[9px] uppercase font-mono text-slate-400">
                          <th className="px-3 py-2 w-8">#</th>
                          <th className="px-3 py-2">Mandi</th>
                          <th className="px-3 py-2 text-right">Dist</th>
                          <th className="px-3 py-2 text-right">Net Return</th>
                        </tr>
                      </thead>
                      <tbody>
                        {result.stages[3].data.ranked_mandis.slice(0, 8).map((m, idx) => (
                          <tr
                            key={idx}
                            className={"border-b border-green-500/5 last:border-0 hover:bg-green-500/5 transition-all " + (idx === 0 ? "text-green-400 font-bold" : "text-slate-300")}
                          >
                            <td className="px-3 py-2 text-center font-mono text-slate-500">{idx + 1}</td>
                            <td className="px-3 py-2">
                              <span className="block">{m.mandi_name}</span>
                              <span className="text-[9px] text-slate-500">{m.district}</span>
                            </td>
                            <td className="px-3 py-2 text-right font-mono">{m.distance_km} km</td>
                            <td className="px-3 py-2 text-right font-mono">Rs.{fmt(m.net_return_inr)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
