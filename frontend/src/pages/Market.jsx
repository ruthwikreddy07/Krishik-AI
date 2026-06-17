import React, { useState } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { TrendingUp, ArrowUpRight, Search, MapPin, AlertCircle, ShoppingBag } from 'lucide-react';

export const Market = () => {
  const [searchTerm, setSearchTerm] = useState('');

  // Simulated mandi price dataset
  const mandiPrices = [
    { crop: "Paddy (Rice)", variety: "Common Long Grain", mandi: "Nalgonda Mandi", currentPrice: "2,350", change: "+45", distance: "8", bestBuy: true },
    { crop: "Paddy (Rice)", variety: "Sona Masuri", mandi: "Suryapet Mandi", currentPrice: "2,550", change: "+80", distance: "24", bestBuy: false },
    { crop: "Cotton", variety: "BG-II Premium", mandi: "Warangal Mandi", currentPrice: "7,800", change: "-120", distance: "52", bestBuy: true },
    { crop: "Red Gram (Pappu)", variety: "Desi Ginned", mandi: "Khammam Mandi", currentPrice: "6,900", change: "+15", distance: "64", bestBuy: false },
    { crop: "Chilli", variety: "Teja Guntur", mandi: "Khammam Mandi", currentPrice: "18,400", change: "+350", distance: "64", bestBuy: true }
  ];

  // Recharts price trend data (past 6 months)
  const priceTrends = [
    { month: "Jan", paddy: 2100, cotton: 7200, chilli: 16500 },
    { month: "Feb", paddy: 2150, cotton: 7400, chilli: 17000 },
    { month: "Mar", paddy: 2200, cotton: 7900, chilli: 17200 },
    { month: "Apr", paddy: 2280, cotton: 8100, chilli: 17800 },
    { month: "May", paddy: 2320, cotton: 7950, chilli: 18100 },
    { month: "Jun", paddy: 2350, cotton: 7800, chilli: 18400 }
  ];

  const filteredMandi = mandiPrices.filter(item => 
    item.crop.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.mandi.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 page-fade-in">
      
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-green-500/10 border border-green-500/40 flex items-center justify-center shadow-[0_0_15px_rgba(34,197,94,0.3)]">
          <TrendingUp className="w-5 h-5 text-green-400 animate-pulse" />
        </div>
        <div>
          <h2 className="text-2xl font-bold font-heading text-slate-100 glow-text-green">Market Price Intelligence</h2>
          <p className="text-xs text-slate-400 mt-0.5">Real-time agricultural commodity prices, regional mandi comparison, and predictive sale timing analysis.</p>
        </div>
      </div>

      {/* Grid: Mandi Rates & Recharts Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Recharts Price Trends (7 columns) */}
        <div className="lg:col-span-7 glass-panel p-6 rounded-2xl border border-green-500/20 card-3d flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold font-heading text-slate-200 mb-6 flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-green-400" />
              <span>H-1 Commodity Price Trends (INR/Quintal)</span>
            </h3>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={priceTrends} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="month" stroke="rgba(255,255,255,0.3)" style={{ fontSize: '11px', fontFamily: 'monospace' }} />
                  <YAxis stroke="rgba(255,255,255,0.3)" style={{ fontSize: '11px', fontFamily: 'monospace' }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'rgba(5, 11, 7, 0.95)', borderColor: 'rgba(34, 197, 94, 0.3)', borderRadius: '12px' }}
                    labelStyle={{ color: '#22c55e', fontFamily: 'monospace', fontWeight: 'bold' }}
                    itemStyle={{ color: '#fff', fontSize: '12px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Line type="monotone" dataKey="paddy" name="Paddy (Rice)" stroke="#22c55e" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 8 }} />
                  <Line type="monotone" dataKey="cotton" name="Cotton" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="chilli" name="Chilli" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Selling Time Recommendation Advisory (5 columns) */}
        <div className="lg:col-span-5 glass-panel p-6 rounded-2xl border border-green-500/20 card-3d flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-lg font-bold font-heading text-slate-200 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-400" />
              <span>Smart Market Advisory</span>
            </h3>
            
            <div className="bg-green-950/20 border border-green-500/10 p-4 rounded-xl space-y-2">
              <h4 className="font-semibold text-green-400 font-mono text-xs">PADDY RECOMMENDED HOLD</h4>
              <p className="text-xs text-slate-400 leading-normal">
                Paddy demand is expected to peak late July due to restricted harvesting output forecasts. Current rates (₹2,350/Qtl) will likely climb to ₹2,480. Holding stock is advised.
              </p>
            </div>

            <div className="bg-amber-950/20 border border-amber-500/10 p-4 rounded-xl space-y-2">
              <h4 className="font-semibold text-amber-400 font-mono text-xs">COTTON HARVEST SELL</h4>
              <p className="text-xs text-slate-400 leading-normal">
                Cotton arrivals in Warangal market are projected to double next week. Sell stock immediately at the current price of ₹7,800/Qtl before price adjustments.
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* Mandi Price Comparison Ticker */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h3 className="text-lg font-bold font-heading text-slate-200">Local Mandi Pricing Board</h3>
          
          {/* Search bar */}
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
        </div>

        <div className="glass-panel rounded-2xl border border-green-500/15 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs border-collapse">
              <thead>
                <tr className="bg-green-950/40 border-b border-green-500/20 text-slate-400 uppercase tracking-widest text-[10px]">
                  <th className="p-4">Crop Name</th>
                  <th className="p-4">Variety</th>
                  <th className="p-4">Mandi (Market)</th>
                  <th className="p-4">Price (₹/Quintal)</th>
                  <th className="p-4">24h Shift</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-green-500/5 text-slate-300">
                {filteredMandi.map((item, idx) => (
                  <tr key={idx} className="hover:bg-green-500/5 transition-all">
                    <td className="p-4 font-sans font-semibold text-slate-200">{item.crop}</td>
                    <td className="p-4 text-green-400/80">{item.variety}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-500" />
                        <span>{item.mandi} ({item.distance}km)</span>
                      </div>
                    </td>
                    <td className="p-4 text-slate-100 font-bold">₹{item.currentPrice}</td>
                    <td className={`p-4 ${item.change.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
                      {item.change}
                    </td>
                    <td className="p-4 text-right">
                      {item.bestBuy && (
                        <span className="inline-block text-[9px] font-bold text-green-300 bg-green-500/20 border border-green-500/40 px-2 py-0.5 rounded uppercase">Best Rate</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

    </div>
  );
};
