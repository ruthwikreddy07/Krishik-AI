import React, { useState, useEffect } from 'react';
import { FileText, Search, ShieldCheck, RefreshCw } from 'lucide-react';
import { toast } from 'react-toastify';
import { getSchemes } from '../services/api';

export const Schemes = () => {
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loadingSchemes, setLoadingSchemes] = useState(true);
  
  // Eligibility checker inputs
  const [landOwned, setLandOwned] = useState('');
  const [caste, setCaste] = useState('General');
  const [age, setAge] = useState('');
  const [checkedSchemes, setCheckedSchemes] = useState(null);

  // Static fallback schemes (shown when DB has no records yet)
  const staticSchemes = [
    {
      id: 1,
      title: "Rythu Bandhu (Investment Support Scheme)",
      authority: "Telangana Government",
      scheme_type: "State",
      benefits: "₹10,000 per acre per year",
      eligibility_criteria: "All land-owning farmers in Telangana (patta land owners). No restriction on land size.",
      documents: ["Pattadar Dharani Passbook", "Aadhaar Card", "Bank Account Details linked with Aadhaar"],
      description: "Provides investment support for agriculture and horticulture crops at the rate of ₹5,000 per acre per season (Kharif & Rabi) to cover seed, fertilizer, and labour costs."
    },
    {
      id: 2,
      title: "Rythu Bima (Group Life Insurance)",
      authority: "Telangana Government",
      scheme_type: "State",
      benefits: "₹5.00 Lakh Life Insurance Cover",
      eligibility_criteria: "Farmers aged between 18 and 59 years holding pattadar passbooks in Telangana.",
      documents: ["Aadhaar Card", "Land Pattadar Passbook", "Nominee details & Age proof"],
      description: "Provides financial relief to the bereaved family members in case of the death of a registered farmer due to any cause."
    },
    {
      id: 3,
      title: "PM-KISAN Samman Nidhi",
      authority: "Central Government",
      scheme_type: "Central",
      benefits: "₹6,000 per year (₹2,000 in 3 installments)",
      eligibility_criteria: "Land-holding farmer families across India (subject to specific exclusion categories).",
      documents: ["Aadhaar Card", "Landholding documents", "Bank passbook photocopy"],
      description: "Provides income support of up to ₹6,000 per year to all landholding farmer families to buy inputs."
    },
    {
      id: 4,
      title: "Subsidized Micro-Irrigation (Drip/Sprinkler)",
      authority: "Telangana Government & Central",
      scheme_type: "State",
      benefits: "80% to 100% subsidy on installation cost",
      eligibility_criteria: "All category farmers holding agricultural land. Priority to SC/ST and small/marginal farmers.",
      documents: ["Soil & Water suitability certificate", "Land documents", "Pattadar passbook"],
      description: "Promotes water conservation by installing drip or sprinkler irrigation pipes with high financial subsidy coverage."
    }
  ];

  const [schemes, setSchemes] = useState(staticSchemes);

  // Fetch real schemes from backend
  useEffect(() => {
    const loadSchemes = async () => {
      setLoadingSchemes(true);
      try {
        const data = await getSchemes();
        if (data && data.length > 0) {
          // Backend scheme shape: { id, title, description, eligibility_criteria, benefits, scheme_type }
          setSchemes(data);
        }
        // else keep static fallback
      } catch {
        // Keep static fallback silently
      } finally {
        setLoadingSchemes(false);
      }
    };
    loadSchemes();
  }, []);

  const handleCheckEligibility = (e) => {
    e.preventDefault();
    if (!landOwned) return;
    const landNum = parseFloat(landOwned);
    const ageNum = parseInt(age) || 35;
    
    const results = schemes.map(s => {
      let eligible = true;
      let reason = "";
      
      const title = (s.title || "").toLowerCase();

      if (title.includes("bandhu")) {
        if (landNum <= 0) {
          eligible = false;
          reason = "Requires owning cultivable agricultural land.";
        }
      }
      else if (title.includes("bima")) {
        if (ageNum < 18 || ageNum > 59) {
          eligible = false;
          reason = "Age must be between 18 and 59 years.";
        }
        if (landNum <= 0) {
          eligible = false;
          reason = "Must hold a pattadar passbook (own land).";
        }
      }
      else if (title.includes("kisan") || title.includes("pm-kisan")) {
        if (landNum <= 0) {
          eligible = false;
          reason = "Requires holding cultivable agricultural land.";
        }
        if (landNum > 5) {
          eligible = false;
          reason = "Exceeds targeted land ceiling of 5 acres for small-scale category.";
        }
      }
      else if (title.includes("irrigation") || title.includes("drip")) {
        if (landNum <= 0) {
          eligible = false;
          reason = "Requires holding agricultural land.";
        }
      }
      
      return { id: s.id, eligible, reason };
    });
    
    setCheckedSchemes(results);
    toast.success("Eligibility calculation updated!", { theme: "dark", toastId: "eligibility-success" });
  };

  const filteredSchemes = schemes.filter(s => {
    const name = s.title || s.name || '';
    const desc = s.description || s.desc || '';
    const type = (s.scheme_type || s.type || '').toLowerCase();
    const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          desc.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || type.includes(filter);
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
            {loadingSchemes ? (
              <div className="flex items-center gap-2 text-slate-500 font-mono text-sm py-8">
                <RefreshCw className="w-4 h-4 animate-spin" /> Loading schemes from database...
              </div>
            ) : filteredSchemes.map((s) => {
              const eligCheck = checkedSchemes?.find(res => res.id === s.id);
              const sName = s.title || s.name;
              const sDesc = s.description || s.desc;
              const sBenefit = s.benefits || s.subsidy;
              const sElig = s.eligibility_criteria || s.eligibility;
              const sDocs = s.documents || [];
              const sAuthority = s.authority || s.scheme_type;
              return (
                <div key={s.id} className="glass-panel p-6 rounded-2xl border border-green-500/15 card-3d relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 rounded-full blur-3xl pointer-events-none"></div>
                  
                  <div className="flex justify-between items-start gap-4 mb-3 border-b border-green-500/10 pb-3">
                    <div>
                      <h4 className="text-base font-bold text-slate-200">{sName}</h4>
                      <span className="text-[10px] font-mono text-green-400 font-semibold uppercase">{sAuthority}</span>
                    </div>
                    
                    {eligCheck && (
                      <div className="flex flex-col items-end gap-1">
                        <span className={`px-2.5 py-0.5 rounded text-[10px] font-mono font-bold border ${eligCheck.eligible ? 'border-green-500/30 bg-green-950/20 text-green-400' : 'border-red-500/30 bg-red-950/20 text-red-400'}`}>
                          {eligCheck.eligible ? 'QUALIFIED' : 'NOT ELIGIBLE'}
                        </span>
                        {!eligCheck.eligible && eligCheck.reason && (
                          <span className="text-[9px] text-red-400 max-w-[200px] text-right font-mono">{eligCheck.reason}</span>
                        )}
                      </div>
                    )}
                  </div>

                  <p className="text-xs text-slate-400 leading-normal mb-4">{sDesc}</p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
                    <div className="bg-slate-950/40 border border-green-500/5 p-3 rounded-xl">
                      <span className="block text-slate-500 text-[10px] mb-1">SUBSIDY / BENEFIT</span>
                      <span className="text-green-300 font-bold">{sBenefit}</span>
                    </div>
                    
                    <div className="bg-slate-950/40 border border-green-500/5 p-3 rounded-xl">
                      <span className="block text-slate-500 text-[10px] mb-1">ELIGIBILITY</span>
                      <p className="text-[10px] text-slate-400 leading-relaxed">{sElig}</p>
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
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="w-full bg-slate-950/60 border border-green-500/20 focus:border-green-500/60 rounded-xl px-4 py-3 text-sm text-white outline-none transition-all"
                  required
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
