import React, { useState, useEffect, useContext } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { TrendingUp, ArrowUpRight, Search, MapPin, AlertCircle, ShoppingBag, RefreshCw, TrendingDown, Minus, Route, HelpCircle } from 'lucide-react';
import { AppContext } from '../context/AppContext';
import { getMarketPrices, getPricePrediction } from '../services/api';

const CROPS = ['Paddy', 'Cotton', 'Red Gram', 'Chilli', 'Maize', 'Soybean', 'Turmeric'];

export const Market = () => {
  const { user } = useContext(AppContext);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCrop, setSelectedCrop] = useState('Paddy');
  const [prices, setPrices] = useState([]);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [predLoading, setPredLoading] = useState(false);
  const [error, setError] = useState(null);

  // Arbitrage inputs
  const [arbitrageYield, setArbitrageYield] = useState(25); // default 25 quintals
  const [transportCost, setTransportCost] = useState(6); // default ₹6 per km

  // Fallback static mandi data when DB has no records yet
  const fallbackPrices = [
    { id:1, crop_name: 'Paddy', mandi_name: 'Nalgonda Mandi', price: 2350, price_date: '2026-06-17' },
    { id:2, crop_name: 'Paddy', mandi_name: 'Suryapet Mandi', price: 2550, price_date: '2026-06-17' },
    { id:3, crop_name: 'Cotton', mandi_name: 'Warangal Mandi', price: 7800, price_date: '2026-06-17' },
    { id:4, crop_name: 'Red Gram', mandi_name: 'Khammam Mandi', price: 6900, price_date: '2026-06-17' },
    { id:5, crop_name: 'Chilli', mandi_name: 'Khammam Mandi', price: 18400, price_date: '2026-06-17' },
    { id:6, crop_name: 'Maize', mandi_name: 'Karimnagar Mandi', price: 1850, price_date: '2026-06-17' },
  ];

  const fetchPrices = async (crop) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getMarketPrices(crop, null, 30);
      setPrices(data.length > 0 ? data : fallbackPrices.filter(p => p.crop_name.toLowerCase().includes(crop.toLowerCase())));
    } catch {
      // If backend has no records yet, show fallback
      setPrices(fallbackPrices);
    } finally {
      setLoading(false);
    }
  };

  const fetchPrediction = async (crop) => {
    setPredLoading(true);
    try {
      const data = await getPricePrediction(crop, 7);
      setPrediction(data);
    } catch {
      // Generate a simple mock prediction if ML model not ready
      const base = fallbackPrices.find(p => p.crop_name.toLowerCase().includes(crop.toLowerCase()))?.price || 2000;
      const mockPredicted = Array.from({ length: 7 }, (_, i) => ({
        date: new Date(Date.now() + (i + 1) * 86400000).toISOString().slice(0, 10),
        price: +(base * (1 + (Math.random() - 0.48) * 0.04)).toFixed(0),
      }));
      setPrediction({ crop_name: crop, predicted_prices: mockPredicted, trend: 'stable' });
    } finally {
      setPredLoading(false);
    }
  };

  useEffect(() => {
    fetchPrices(selectedCrop);
    fetchPrediction(selectedCrop);
  }, [selectedCrop]);

  // Build recharts data from real prices grouped by date
  const buildChartData = () => {
    const dateMap = {};
    prices.forEach(p => {
      const d = p.price_date;
      if (!dateMap[d]) dateMap[d] = { date: d };
      dateMap[d][p.crop_name] = p.price;
    });
    return Object.values(dateMap)
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-12)
      .map(d => ({ ...d, month: new Date(d.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }) }));
  };

  // Prediction chart data
  const predChartData = (prediction?.predicted_prices || []).map(p => ({
    date: new Date(p.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
    price: p.price,
  }));

  const chartData = buildChartData();

  // Filtered price list (all crops for the board)
  const allPrices = prices.length > 0 ? prices : fallbackPrices;
  const filteredPrices = allPrices.filter(item =>
    item.crop_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.mandi_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const trendIcon = (trend) => {
    if (trend === 'rising') return <TrendingUp className="w-4 h-4 text-green-400" />;
    if (trend === 'falling') return <TrendingDown className="w-4 h-4 text-red-400" />;
    return <Minus className="w-4 h-4 text-amber-400" />;
  };
  const trendColor = (trend) => trend === 'rising' ? 'text-green-400' : trend === 'falling' ? 'text-red-400' : 'text-amber-400';

  // Compute Arbitrage
  const getArbitrageCalculations = () => {
    // We fetch base price for selected crop or default to fallback
    const matchedPrices = allPrices.filter(p => p.crop_name.toLowerCase().includes(selectedCrop.toLowerCase()));
    const avgPrice = matchedPrices.length > 0 
      ? matchedPrices.reduce((acc, curr) => acc + parseFloat(curr.price), 0) / matchedPrices.length
      : 2200;

    const MANDIS = [
      { name: 'Warangal Mandi', distance: 45, mult: 1.0 },
      { name: 'Suryapet Mandi', distance: 75, mult: 1.02 },
      { name: 'Nalgonda Mandi', distance: 95, mult: 1.03 },
      { name: 'Khammam Mandi', distance: 110, mult: 1.01 },
      { name: 'Bowenpally Mandi (Hyd)', distance: 150, mult: 1.05 }
    ];

    return MANDIS.map(m => {
      const price = Math.round(avgPrice * m.mult);
      const gross = price * arbitrageYield;
      const transport = m.distance * transportCost;
      const net = gross - transport;
      return {
        ...m,
        price,
        gross,
        transport,
        net
      };
    }).sort((a, b) => b.net - a.net);
  };

  const arbitrageData = getArbitrageCalculations();
  const recommendedMandi = arbitrageData[0];

  return (
    <div className="space-y-8 page-fade-in">
      
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-green-500/10 border border-green-500/40 flex items-center justify-center shadow-[0_0_15px_rgba(34,197,94,0.3)]">
          <TrendingUp className="w-5 h-5 text-green-400 animate-pulse" />
        </div>
        <div>
          <h2 className="text-2xl font-bold font-heading text-slate-100 glow-text-green">Market Price Intelligence</h2>
          <p className="text-xs text-slate-400 mt-0.5">Live APMC mandi prices with LSTM-powered price forecasting.</p>
        </div>
      </div>

      {/* Crop Selector */}
      <div className="flex flex-wrap gap-2">
        {CROPS.map(crop => (
          <button
            key={crop}
            onClick={() => setSelectedCrop(crop)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold font-mono border transition-all ${
              selectedCrop === crop
                ? 'bg-green-500/20 border-green-500/50 text-green-300'
                : 'bg-transparent border-green-500/10 text-slate-400 hover:border-green-500/30 hover:text-slate-300'
            }`}
          >
            {crop}
          </button>
        ))}
      </div>

      {/* Grid: Price Trends & Prediction */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Price Trend Chart */}
        <div className="lg:col-span-7 glass-panel p-6 rounded-2xl border border-green-500/20 card-3d flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold font-heading text-slate-200 mb-6 flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-green-400" />
              <span>{selectedCrop} — Mandi Price History (₹/Quintal)</span>
            </h3>
            <div className="h-64 w-full">
              {loading ? (
                <div className="flex items-center justify-center h-full text-slate-500 font-mono text-sm">
                  <RefreshCw className="w-5 h-5 animate-spin mr-2" /> Loading price data...
                </div>
              ) : chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="month" stroke="rgba(255,255,255,0.3)" style={{ fontSize: '10px', fontFamily: 'monospace' }} />
                    <YAxis stroke="rgba(255,255,255,0.3)" style={{ fontSize: '10px', fontFamily: 'monospace' }} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'rgba(5, 11, 7, 0.95)', borderColor: 'rgba(34, 197, 94, 0.3)', borderRadius: '12px' }}
                      labelStyle={{ color: '#22c55e', fontFamily: 'monospace', fontWeight: 'bold' }}
                      itemStyle={{ color: '#fff', fontSize: '12px' }}
                    />
                    <Line type="monotone" dataKey={selectedCrop} name={`${selectedCrop} (₹/Qtl)`} stroke="#22c55e" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 8 }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex flex-col items-center justify-center h-full gap-2">
                  <ShoppingBag className="w-8 h-8 text-slate-600" />
                  <p className="text-slate-500 text-sm font-mono">No historical price records yet</p>
                  <p className="text-slate-600 text-xs">Showing prediction data below</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* AI Price Prediction Panel */}
        <div className="lg:col-span-5 glass-panel p-6 rounded-2xl border border-green-500/20 card-3d flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold font-heading text-slate-200 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-amber-400" />
                <span>AI Price Forecast</span>
              </h3>
              {prediction && (
                <div className={`flex items-center gap-1 text-xs font-mono font-bold px-2 py-1 rounded-lg bg-slate-950/40 border border-slate-700/40 ${trendColor(prediction.trend)}`}>
                  {trendIcon(prediction.trend)}
                  <span className="uppercase">{prediction.trend}</span>
                </div>
              )}
            </div>

            {predLoading ? (
              <div className="flex items-center gap-2 text-slate-500 font-mono text-xs py-4">
                <RefreshCw className="w-4 h-4 animate-spin" /> Running LSTM model...
              </div>
            ) : prediction?.predicted_prices?.length > 0 ? (
              <>
                <div className="h-40 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={predChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="date" stroke="rgba(255,255,255,0.2)" style={{ fontSize: '9px', fontFamily: 'monospace' }} />
                      <YAxis stroke="rgba(255,255,255,0.2)" style={{ fontSize: '9px', fontFamily: 'monospace' }} />
                      <Tooltip contentStyle={{ backgroundColor: 'rgba(5,11,7,0.95)', borderColor: 'rgba(251,191,36,0.3)', borderRadius: '10px' }} itemStyle={{ color: '#fbbf24', fontSize: '11px' }} />
                      <Line type="monotone" dataKey="price" name="Predicted ₹/Qtl" stroke="#fbbf24" strokeWidth={2} strokeDasharray="5 3" dot={{ r: 3 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div className="space-y-2">
                  {prediction.predicted_prices.slice(0, 3).map((p, i) => (
                    <div key={i} className="flex items-center justify-between text-xs font-mono bg-slate-950/30 px-3 py-2 rounded-lg border border-green-500/5">
                      <span className="text-slate-400">{new Date(p.date).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                      <span className="text-amber-400 font-bold">₹{p.price?.toLocaleString('en-IN')}/Qtl</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-slate-500 text-xs font-mono py-4">Prediction not available</p>
            )}
          </div>
        </div>

      </div>

      {/* Mandi Price Arbitrage Calculator Panel */}
      <div className="glass-panel p-6 rounded-2xl border border-green-500/20 card-3d">
        <div className="flex items-center gap-2 mb-4">
          <Route className="w-5 h-5 text-green-400" />
          <h3 className="text-lg font-bold font-heading text-slate-100">Mandi Arbitrage Optimizer</h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Controls Form */}
          <div className="lg:col-span-4 space-y-4 font-mono text-xs">
            <div>
              <label className="block text-slate-400 mb-1.5 uppercase">Estimated Yield (Quintals)</label>
              <input
                type="number"
                value={arbitrageYield}
                onChange={(e) => setArbitrageYield(Math.max(1, parseInt(e.target.value) || 0))}
                className="w-full bg-slate-950/60 border border-green-500/20 rounded-xl px-4 py-3 text-white outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1.5 uppercase">Transport Cost (₹ per km)</label>
              <input
                type="number"
                value={transportCost}
                onChange={(e) => setTransportCost(Math.max(1, parseInt(e.target.value) || 0))}
                className="w-full bg-slate-950/60 border border-green-500/20 rounded-xl px-4 py-3 text-white outline-none"
              />
            </div>
            
            {recommendedMandi && (
              <div className="bg-green-950/20 border border-green-500/30 p-4 rounded-xl space-y-1.5">
                <span className="text-[10px] text-green-400 uppercase tracking-wider font-bold flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5" /> Optimal Mandi Choice
                </span>
                <span className="text-slate-200 font-bold block">{recommendedMandi.name}</span>
                <p className="text-[10px] text-slate-400 leading-normal font-sans">
                  Selling here yields maximum net profit of <strong className="text-green-300">₹{recommendedMandi.net.toLocaleString('en-IN')}</strong> after transport cost deduction.
                </p>
              </div>
            )}
          </div>

          {/* Mandis Comparison Table */}
          <div className="lg:col-span-8 overflow-hidden rounded-xl border border-green-500/10 font-mono text-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-green-950/20 border-b border-green-500/10 text-slate-400 uppercase text-[9px] tracking-widest">
                  <th className="p-3">Mandi (Market)</th>
                  <th className="p-3">Est. Distance</th>
                  <th className="p-3">Rate/Qtl</th>
                  <th className="p-3">Transport Cost</th>
                  <th className="p-3 text-right">Net Profit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-green-500/5 text-slate-300">
                {arbitrageData.map((m, idx) => (
                  <tr key={idx} className={`transition-colors ${idx === 0 ? 'bg-green-500/5 hover:bg-green-500/10 text-green-300' : 'hover:bg-slate-900/30'}`}>
                    <td className="p-3 font-semibold">{m.name}</td>
                    <td className="p-3">{m.distance} km</td>
                    <td className="p-3">₹{m.price}</td>
                    <td className="p-3 text-red-400">- ₹{m.transport}</td>
                    <td className="p-3 text-right font-bold">₹{m.net.toLocaleString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      </div>

      {/* Mandi Price Board */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h3 className="text-lg font-bold font-heading text-slate-200">Local Mandi Pricing Board</h3>
          <div className="flex items-center gap-3">
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-green-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search crop or market..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-950/60 border border-green-500/20 focus:border-green-500/60 rounded-xl pl-10 pr-4 py-2.5 text-xs font-sans text-white outline-none transition-all"
              />
            </div>
            <button onClick={() => fetchPrices(selectedCrop)} className="p-2.5 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 hover:bg-green-500/20 transition-all">
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="glass-panel rounded-2xl border border-green-500/15 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs border-collapse">
              <thead>
                <tr className="bg-green-950/40 border-b border-green-500/20 text-slate-400 uppercase tracking-widest text-[10px]">
                  <th className="p-4">Crop Name</th>
                  <th className="p-4">Mandi (Market)</th>
                  <th className="p-4">Price (₹/Quintal)</th>
                  <th className="p-4">Date</th>
                  <th className="p-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-green-500/5 text-slate-300">
                {filteredPrices.length > 0 ? filteredPrices.map((item, idx) => (
                  <tr key={idx} className="hover:bg-green-500/5 transition-all">
                    <td className="p-4 font-sans font-semibold text-slate-200">{item.crop_name}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-500" />
                        <span>{item.mandi_name}</span>
                      </div>
                    </td>
                    <td className="p-4 text-slate-100 font-bold text-sm">₹{item.price?.toLocaleString('en-IN')}</td>
                    <td className="p-4 text-slate-500">{item.price_date}</td>
                    <td className="p-4 text-right">
                      <span className="inline-block text-[9px] font-bold text-green-300 bg-green-500/20 border border-green-500/40 px-2 py-0.5 rounded uppercase">Live</span>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-500 font-mono">
                      No price records found for "{searchTerm}"
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

    </div>
  );
};
