import React, { useState } from 'react';
import { FileText, Search, ShieldCheck, HelpCircle, CheckCircle, Info } from 'lucide-react';
import { toast } from 'react-toastify';

export const Schemes = () => {
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Eligibility checker inputs
  const [landOwned, setLandOwned] = useState('');
  const [caste, setCaste] = useState('General');
  const [checkedSchemes, setCheckedSchemes] = useState(null);

  const schemes = [
    {
      id: 1,
      name: "Rythu Bandhu (Investment Support Scheme)",
      authority: "Telangana Government",
      type: "state",
      subsidy: "₹10,000 per acre per year",
      eligibility: "All land-owning farmers in Telangana (patta land owners). No restriction on land size.",
      documents: ["Pattadar Dharani Passbook", "Aadhaar Card", "Bank Account Details linked with Aadhaar"],
      desc: "Provides investment support for agriculture and horticulture crops at the rate of ₹5,000 per acre per season (Kharif & Rabi) to cover seed, fertilizer, and labour costs."
    },
    {
      id: 2,
      name: "Rythu Bima (Group Life Insurance)",
      authority: "Telangana Government",
      type: "state",
      subsidy: "₹5.00 Lakh Life Insurance Cover",
      eligibility: "Farmers aged between 18 and 59 years holding pattadar passbooks in Telangana.",
      documents: ["Aadhaar Card", "Land Pattadar Passbook", "Nominee details & Age proof"],
      desc: "Provides financial relief to the bereaved family members in case of the death of a registered farmer due to any cause, ensuring financial security."
    },
    {
      id: 3,
      name: "PM-KISAN Samman Nidhi",
      authority: "Central Government",
      type: "central",
      subsidy: "₹6,000 per year (₹2,000 in 3 installments)",
      eligibility: "Land-holding farmer families across India (subject to specific exclusion categories).",
      documents: ["Aadhaar Card", "Landholding documents", "Bank passbook photocopy"],
      desc: "An initiative by the Government of India to provide income support of up to ₹6,000 per year to all landholding farmer families to buy inputs."
    },
    {
      id: 4,
      name: "Subsidized Micro-Irrigation (Drip/Sprinkler)",
      authority: "Telangana Government & Central",
      type: "subsidy",
      subsidy: "80% to 100% subsidy on installation cost",
      eligibility: "All category farmers holding agricultural land. Priority to SC/ST and small/marginal farmers.",
      documents: ["Soil & Water suitability certificate", "Land documents", "Pattadar passbook"],
      desc: "Promotes water conservation by installing drip or sprinkler irrigation pipes with high financial subsidy coverage for marginal farmers."
    }
  ];

  const handleCheckEligibility = (e) => {
    e.preventDefault();
    if (!landOwned) return;
    const landNum = parseFloat(landOwned);
    
    // Simple mock logic
    const results = schemes.map(s => {
      let eligible = true;
      if (s.id === 2 && landNum > 20) eligible = false; // Just a mock check
      return { id: s.id, eligible };
    });
    
    setCheckedSchemes(results);
    toast.success("Eligibility calculation updated!", { theme: "dark", toastId: "eligibility-success" });
  };

  const filteredSchemes = schemes.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          s.desc.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || s.type === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-8 page-fade-in">
      
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-green-500/10 border border-green-500/40 flex items-center justify-center shadow-[0_0_15px_rgba(34,197,94,0.3)]">
          <FileText className="w-5 h-5 text-green-400" />
        </div>
        <div>
          <h2 className="text-2xl font-bold font-heading text-slate-100 glow-text-green">Agricultural Government Schemes</h2>
          <p className="text-xs text-slate-400 mt-0.5">Explore state (Telangana) and central financial schemes, calculate eligibility criteria, and find application details.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side: Filterable Schemes (7 columns) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Filter tags */}
            <div className="flex gap-2 bg-green-950/40 p-0.5 rounded-lg border border-green-500/10">
              {[
                { code: 'all', label: 'All Schemes' },
                { code: 'state', label: 'Telangana' },
                { code: 'central', label: 'Central' },
                { code: 'subsidy', label: 'Subsidies' }
              ].map((tab) => (
                <button
                  key={tab.code}
                  onClick={() => setFilter(tab.code)}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold font-mono transition-all duration-300 ${filter === tab.code ? 'bg-green-500/20 text-green-300 border border-green-500/30' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-green-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search scheme name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-56 bg-slate-950/60 border border-green-500/20 focus:border-green-500/60 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white outline-none transition-all"
              />
            </div>
          </div>

          <div className="space-y-4">
            {filteredSchemes.map((s) => {
              const eligCheck = checkedSchemes?.find(res => res.id === s.id);
              return (
                <div key={s.id} className="glass-panel p-6 rounded-2xl border border-green-500/15 card-3d relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 rounded-full blur-3xl pointer-events-none"></div>
                  
                  <div className="flex justify-between items-start gap-4 mb-3 border-b border-green-500/10 pb-3">
                    <div>
                      <h4 className="text-base font-bold text-slate-200">{s.name}</h4>
                      <span className="text-[10px] font-mono text-green-400 font-semibold uppercase">{s.authority}</span>
                    </div>
                    
                    {eligCheck && (
                      <span className={`px-2.5 py-0.5 rounded text-[10px] font-mono font-bold border ${eligCheck.eligible ? 'border-green-500/30 bg-green-950/20 text-green-400' : 'border-red-500/30 bg-red-950/20 text-red-400'}`}>
                        {eligCheck.eligible ? 'QUALIFIED' : 'NOT ELIGIBLE'}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-400 leading-normal mb-4">{s.desc}</p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
                    <div className="bg-slate-950/40 border border-green-500/5 p-3 rounded-xl">
                      <span className="block text-slate-500 text-[10px] mb-1">SUBSIDY BENEFIT</span>
                      <span className="text-green-300 font-bold">{s.subsidy}</span>
                    </div>
                    
                    <div className="bg-slate-950/40 border border-green-500/5 p-3 rounded-xl">
                      <span className="block text-slate-500 text-[10px] mb-1">REQUIRED DOCUMENTS</span>
                      <ul className="text-[10px] text-slate-400 list-disc pl-3">
                        {s.documents.map((doc, idx) => (
                          <li key={idx}>{doc}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Eligibility Form Calculator (5 columns) */}
        <div className="lg:col-span-5">
          <div className="glass-panel p-6 rounded-2xl border border-green-500/20 card-3d">
            <h3 className="text-lg font-bold font-heading text-slate-200 flex items-center gap-2 mb-4">
              <ShieldCheck className="w-5 h-5 text-green-400" />
              <span>Verify Scheme Eligibility</span>
            </h3>

            <form onSubmit={handleCheckEligibility} className="space-y-4 font-sans">
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1.5 uppercase tracking-widest">Patta Land Owned (Acres)</label>
                <input
                  type="number"
                  step="0.1"
                  value={landOwned}
                  onChange={(e) => setLandOwned(e.target.value)}
                  placeholder="e.g. 4.5"
                  className="w-full bg-slate-950/60 border border-green-500/20 focus:border-green-500/60 rounded-xl px-4 py-3 text-sm text-white outline-none transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1.5 uppercase tracking-widest">Farmer Social Category</label>
                <select
                  value={caste}
                  onChange={(e) => setCaste(e.target.value)}
                  className="w-full bg-slate-950/60 border border-green-500/20 focus:border-green-500/60 rounded-xl px-4 py-3 text-sm text-white outline-none transition-all"
                >
                  <option value="General" className="bg-slate-950">General / OBC</option>
                  <option value="SC" className="bg-slate-950">Scheduled Caste (SC)</option>
                  <option value="ST" className="bg-slate-950">Scheduled Tribe (ST)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1.5 uppercase tracking-widest">Age of Landholder</label>
                <input
                  type="number"
                  placeholder="e.g. 45"
                  className="w-full bg-slate-950/60 border border-green-500/20 focus:border-green-500/60 rounded-xl px-4 py-3 text-sm text-white outline-none transition-all"
                />
              </div>

              <button
                type="submit"
                className="w-full mt-4 py-3.5 px-4 bg-green-600 hover:bg-green-500 text-slate-900 font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 border border-green-400 shadow-[0_4px_20px_rgba(34,197,94,0.25)] glow-btn"
              >
                <span>Calculate Eligibility</span>
              </button>
            </form>
          </div>
        </div>

      </div>

    </div>
  );
};
