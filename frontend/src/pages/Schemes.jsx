import React, { useState, useEffect, useContext } from 'react';
import { FileText, Search, ShieldCheck, RefreshCw } from 'lucide-react';
import { toast } from 'react-toastify';
import { getSchemes } from '../services/api';
import { AppContext } from '../context/AppContext';

export const Schemes = () => {
  const { language } = useContext(AppContext);
  
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loadingSchemes, setLoadingSchemes] = useState(true);
  
  // Eligibility checker inputs
  const [landOwned, setLandOwned] = useState('');
  const [caste, setCaste] = useState('General');
  const [age, setAge] = useState('');
  const [checkedSchemes, setCheckedSchemes] = useState(null);

  // Local translations dictionary
  const localUI = {
    en: {
      title: "Agricultural Government Schemes",
      subtitle: "Explore state (Telangana) and central financial schemes, calculate eligibility criteria, and find application details.",
      allSchemes: "All Schemes",
      telangana: "Telangana",
      central: "Central",
      subsidies: "Subsidies",
      searchPlaceholder: "Search scheme name...",
      loading: "Loading schemes from database...",
      verifyTitle: "Verify Scheme Eligibility",
      landOwnedLabel: "Patta Land Owned (Acres) *",
      casteLabel: "Farmer Social Category *",
      ageLabel: "Age of Landholder *",
      calculateBtn: "Calculate Eligibility",
      general: "General / OBC",
      sc: "Scheduled Caste (SC)",
      st: "Scheduled Tribe (ST)",
      qual: "QUALIFIED",
      notQual: "NOT ELIGIBLE",
      benefitHeader: "SUBSIDY / BENEFIT",
      eligHeader: "ELIGIBILITY",
      docsHeader: "REQUIRED DOCUMENTS",
      landLabel: "Land",
      ageLabelShort: "Age",
      categoryLabel: "Category",
      limitNone: "No Limit",
      eligibleSuccess: "Eligibility calculation updated!"
    },
    te: {
      title: "వ్యవసాయ ప్రభుత్వ పథకాలు",
      subtitle: "రాష్ట్ర (తెలంగాణ) మరియు కేంద్ర ఆర్థిక పథకాలను అన్వేషించండి, అర్హత ప్రమాణాలను లెక్కించండి మరియు దరఖాస్తు వివరాలను కనుగొనండి.",
      allSchemes: "అన్ని పథకాలు",
      telangana: "తెలంగాణ",
      central: "కేంద్రం",
      subsidies: "సబ్సిడీలు",
      searchPlaceholder: "పథకం పేరుతో వెతకండి...",
      loading: "డేటాబేస్ నుండి పథకాలను లోడ్ చేస్తోంది...",
      verifyTitle: "పథకం అర్హతను ధృవీకరించండి",
      landOwnedLabel: "సొంత వ్యవసాయ భూమి (ఎకరాలలో) *",
      casteLabel: "రైతు సామాజిక వర్గం *",
      ageLabel: "భూమి యజమాని వయస్సు *",
      calculateBtn: "అర్హతను లెక్కించండి",
      general: "జనరల్ / OBC",
      sc: "షెడ్యూల్డ్ కులం (SC)",
      st: "షెడ్యూల్డ్ తెగ (ST)",
      qual: "అర్హత ఉంది",
      notQual: "అర్హత లేదు",
      benefitHeader: "సబ్సిడీ / ప్రయోజనం",
      eligHeader: "అర్హత ప్రమాణాలు",
      docsHeader: "కావలసిన పత్రాలు",
      landLabel: "భూమి",
      ageLabelShort: "వయస్సు",
      categoryLabel: "వర్గం",
      limitNone: "పరిమితి లేదు",
      eligibleSuccess: "అర్హత విజయవంతంగా లెక్కించబడింది!"
    },
    hi: {
      title: "कृषि सरकारी योजनाएं",
      subtitle: "राज्य (तेलंगाना) और केंद्रीय वित्तीय योजनाओं का पता लगाएं, पात्रता मानदंडों की गणना करें और आवेदन विवरण खोजें।",
      allSchemes: "सभी योजनाएं",
      telangana: "तेलंगाना",
      central: "केंद्रीय",
      subsidies: "सब्सिडी",
      searchPlaceholder: "योजना का नाम खोजें...",
      loading: "डेटाबेस से योजनाओं को लोड किया जा रहा है...",
      verifyTitle: "योजना पात्रता सत्यापित करें",
      landOwnedLabel: "स्वामित्व वाली भूमि (एकड़) *",
      casteLabel: "किसान सामाजिक श्रेणी *",
      ageLabel: "भूमिधारक की आयु *",
      calculateBtn: "पात्रता की गणना करें",
      general: "सामान्य / ओबीसी",
      sc: "अनुसूचित जाति (SC)",
      st: "अनुसूचित जनजाति (ST)",
      qual: "योग्य",
      notQual: "अपात्र",
      benefitHeader: "सब्सिडी / लाभ",
      eligHeader: "पात्रता",
      docsHeader: "आवश्यक दस्तावेज",
      landLabel: "भूमि",
      ageLabelShort: "आयु",
      categoryLabel: "वर्ग",
      limitNone: "कोई सीमा नहीं",
      eligibleSuccess: "पात्रता अद्यतन की गई!"
    }
  };

  const ui = localUI[language] || localUI['en'];

  // Static fallback schemes (shown when DB has no records yet)
  const staticSchemes = [
    {
      id: 1,
      title: "Rythu Bandhu (రైతుబంధు)",
      authority: "Telangana Government",
      scheme_type: "State",
      benefits: "Rs. 10,000 per acre per year",
      eligibility_criteria: "Must own agricultural land in Telangana. Land records must be updated in the Dharani portal. Both tenant and owner farmers are eligible.",
      documents: "Pattadar Dharani Passbook, Aadhaar Card, Bank Account Details linked with Aadhaar",
      description: "Investment support scheme providing financial assistance to farmers for crop cultivation. The government deposits money directly into farmer bank accounts before every crop season.",
      min_land_acres: 0.1,
      max_land_acres: 999.0,
      min_age: 18,
      max_age: 120,
      allowed_caste: "All"
    },
    {
      id: 2,
      title: "Rythu Bima (రైతుబీమా)",
      authority: "Telangana Government",
      scheme_type: "State",
      benefits: "Rs. 5,00,000 life insurance coverage. Premium paid entirely by the Telangana government.",
      eligibility_criteria: "Must be a farmer aged 18-59 years registered in Telangana. Enrolled Rythu Bandhu beneficiaries are automatically covered.",
      documents: "Aadhaar Card, Land Pattadar Passbook, Nominee Details & Age Proof",
      description: "Life insurance scheme for Telangana farmers. Provides Rs. 5 lakh insurance coverage to farmers aged 18-59 years in case of death due to any reason.",
      min_land_acres: 0.0,
      max_land_acres: 999.0,
      min_age: 18,
      max_age: 59,
      allowed_caste: "All"
    },
    {
      id: 3,
      title: "PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)",
      authority: "Central Government",
      scheme_type: "Central",
      benefits: "Rs. 6,000 per year in three equal installments of Rs. 2,000 each.",
      eligibility_criteria: "All landholding farmer families with cultivable land. Must have Aadhaar-linked bank account.",
      documents: "Aadhaar Card, Landholding Documents, Bank Passbook Photocopy",
      description: "Income support to all landholding farmer families across the country to supplement financial needs for crop cultivation.",
      min_land_acres: 0.1,
      max_land_acres: 5.0,
      min_age: 18,
      max_age: 120,
      allowed_caste: "All"
    },
    {
      id: 4,
      title: "Telangana Micro Irrigation Project",
      authority: "Telangana Government",
      scheme_type: "State",
      benefits: "Up to 90% subsidy on drip irrigation systems. Up to 75% subsidy on sprinkler systems.",
      eligibility_criteria: "Farmers with minimum 0.5 acres of agricultural land. Priority for SC/ST/small/marginal farmers.",
      documents: "Land Documents, Pattadar Passbook, Soil & Water Suitability Certificate",
      description: "Subsidized drip and sprinkler irrigation systems to promote water conservation and improve crop yields.",
      min_land_acres: 0.5,
      max_land_acres: 999.0,
      min_age: 18,
      max_age: 120,
      allowed_caste: "All"
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
          setSchemes(data);
        }
      } catch (err) {
        console.error("Failed to load schemes, using fallback", err);
      } finally {
        setLoadingSchemes(false);
      }
    };
    loadSchemes();
  }, []);

  const handleCheckEligibility = (e) => {
    e.preventDefault();
    if (!landOwned || !age) return;
    
    const landNum = parseFloat(landOwned);
    const ageNum = parseInt(age);
    
    const results = schemes.map(s => {
      let eligible = true;
      let reasons = [];

      // Check min land
      if (s.min_land_acres !== undefined && s.min_land_acres !== null) {
        const minL = parseFloat(s.min_land_acres);
        if (landNum < minL) {
          eligible = false;
          reasons.push(
            language === 'te' 
              ? `కనీస భూమి పరిమాణం ${minL} ఎకరాలు ఉండాలి.` 
              : language === 'hi'
                ? `न्यूनतम भूमि आकार ${minL} एकड़ होना चाहिए।`
                : `Minimum land size required is ${minL} acres.`
          );
        }
      }

      // Check max land
      if (s.max_land_acres !== undefined && s.max_land_acres !== null) {
        const maxL = parseFloat(s.max_land_acres);
        if (landNum > maxL) {
          eligible = false;
          reasons.push(
            language === 'te' 
              ? `గరిష్ట భూమి పరిమాణం ${maxL} ఎకరాలకు మించకూడదు.` 
              : language === 'hi'
                ? `अधिकतम भूमि आकार ${maxL} एकड़ से अधिक नहीं होना चाहिए।`
                : `Land size must not exceed ${maxL} acres.`
          );
        }
      }

      // Check min age
      if (s.min_age !== undefined && s.min_age !== null) {
        const minA = parseInt(s.min_age);
        if (ageNum < minA) {
          eligible = false;
          reasons.push(
            language === 'te' 
              ? `కనీస వయస్సు ${minA} సంవత్సరాలు ఉండాలి.` 
              : language === 'hi'
                ? `न्यूनतम आयु ${minA} वर्ष होनी चाहिए।`
                : `Minimum age required is ${minA} years.`
          );
        }
      }

      // Check max age
      if (s.max_age !== undefined && s.max_age !== null) {
        const maxA = parseInt(s.max_age);
        if (ageNum > maxA) {
          eligible = false;
          reasons.push(
            language === 'te' 
              ? `గరిష్ట వయస్సు ${maxA} సంవత్సరాలకు మించకూడదు.` 
              : language === 'hi'
                ? `अधिकतम आयु ${maxA} वर्ष से अधिक नहीं होना चाहिए।`
                : `Age must not exceed ${maxA} years.`
          );
        }
      }

      // Check caste
      if (s.allowed_caste && s.allowed_caste !== 'All') {
        const allowed = s.allowed_caste.trim().toUpperCase();
        const selected = caste.trim().toUpperCase();
        if (allowed !== 'ALL' && allowed !== selected) {
          eligible = false;
          reasons.push(
            language === 'te' 
              ? `ఈ పథకం కేవలం ${s.allowed_caste} వర్గానికి మాత్రమే వర్తిస్తుంది.` 
              : language === 'hi'
                ? `यह योजना केवल ${s.allowed_caste} वर्ग के लिए लागू है।`
                : `This scheme is restricted to ${s.allowed_caste} category.`
          );
        }
      }

      return { id: s.id, eligible, reason: reasons.join(" ") };
    });
    
    setCheckedSchemes(results);
    toast.success(ui.eligibleSuccess, { theme: "dark", toastId: "eligibility-success" });
  };

  const filteredSchemes = schemes.filter(s => {
    const name = language === 'te' ? (s.title_telugu || s.title) : (language === 'hi' ? (s.title_hindi || s.title) : s.title);
    const desc = language === 'te' ? (s.description_telugu || s.description) : (language === 'hi' ? (s.description_hindi || s.description) : s.description);
    const type = (s.scheme_type || '').toLowerCase();
    
    const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          desc.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filter === 'all' || type.includes(filter) || (filter === 'subsidy' && (s.benefits || s.benefits_telugu || s.benefits_hindi || '').toLowerCase().includes('subsidy'));
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
          <h2 className="text-2xl font-bold font-heading text-slate-100 glow-text-green">{ui.title}</h2>
          <p className="text-xs text-slate-400 mt-0.5">{ui.subtitle}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side: Filterable Schemes (7 columns) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Filter tags */}
            <div className="flex gap-2 bg-green-950/40 p-0.5 rounded-lg border border-green-500/10">
              {[
                { code: 'all', label: ui.allSchemes },
                { code: 'state', label: ui.telangana },
                { code: 'central', label: ui.central },
                { code: 'subsidy', label: ui.subsidies }
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
                placeholder={ui.searchPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-56 bg-slate-950/60 border border-green-500/20 focus:border-green-500/60 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white outline-none transition-all"
              />
            </div>
          </div>

          <div className="space-y-4">
            {loadingSchemes ? (
              <div className="flex items-center gap-2 text-slate-500 font-mono text-sm py-8">
                <RefreshCw className="w-4 h-4 animate-spin" /> {ui.loading}
              </div>
            ) : filteredSchemes.map((s) => {
              const eligCheck = checkedSchemes?.find(res => res.id === s.id);
              
              const sName = language === 'te' ? (s.title_telugu || s.title) : (language === 'hi' ? (s.title_hindi || s.title) : s.title);
              const sDesc = language === 'te' ? (s.description_telugu || s.description) : (language === 'hi' ? (s.description_hindi || s.description) : s.description);
              const sBenefit = language === 'te' ? (s.benefits_telugu || s.benefits) : (language === 'hi' ? (s.benefits_hindi || s.benefits) : s.benefits);
              const sElig = language === 'te' ? (s.eligibility_criteria_telugu || s.eligibility_criteria) : (language === 'hi' ? (s.eligibility_criteria_hindi || s.eligibility_criteria) : s.eligibility_criteria);
              const sAuthority = language === 'te' ? (s.authority_telugu || s.authority || s.scheme_type) : (language === 'hi' ? (s.authority_hindi || s.authority || s.scheme_type) : (s.authority || s.scheme_type));
              
              const rawDocs = language === 'te' ? (s.documents_telugu || s.documents) : (language === 'hi' ? (s.documents_hindi || s.documents) : s.documents);
              
              let parsedDocs = [];
              if (rawDocs) {
                if (Array.isArray(rawDocs)) {
                  parsedDocs = rawDocs;
                } else if (typeof rawDocs === 'string') {
                  parsedDocs = rawDocs.split(',').map(d => d.trim()).filter(Boolean);
                }
              }

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
                          {eligCheck.eligible ? ui.qual : ui.notQual}
                        </span>
                        {!eligCheck.eligible && eligCheck.reason && (
                          <span className="text-[9px] text-red-400 max-w-[200px] text-right font-mono leading-tight">{eligCheck.reason}</span>
                        )}
                      </div>
                    )}
                  </div>

                  <p className="text-xs text-slate-400 leading-normal mb-4">{sDesc}</p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
                    <div className="bg-slate-950/40 border border-green-500/5 p-3 rounded-xl flex flex-col justify-between">
                      <div>
                        <span className="block text-slate-500 text-[10px] mb-1">{ui.benefitHeader}</span>
                        <span className="text-green-300 font-bold">{sBenefit}</span>
                      </div>
                    </div>
                    
                    <div className="bg-slate-950/40 border border-green-500/5 p-3 rounded-xl">
                      <span className="block text-slate-500 text-[10px] mb-1">{ui.eligHeader}</span>
                      <p className="text-[10px] text-slate-400 leading-relaxed mb-2">{sElig}</p>
                      
                      {/* Dynamic Eligibility Badges */}
                      <div className="border-t border-green-500/10 pt-1.5 mt-1.5 flex flex-wrap gap-x-2 gap-y-1 text-[9px] text-green-400 font-bold">
                        <span>
                          {ui.landLabel}: {s.min_land_acres !== null && s.min_land_acres !== undefined ? s.min_land_acres : 0} - {s.max_land_acres !== null && s.max_land_acres !== undefined ? s.max_land_acres : ui.limitNone} ac
                        </span>
                        <span className="text-slate-700">|</span>
                        <span>
                          {ui.ageLabelShort}: {s.min_age !== null && s.min_age !== undefined ? s.min_age : 18} - {s.max_age !== null && s.max_age !== undefined ? s.max_age : 120} yrs
                        </span>
                        <span className="text-slate-700">|</span>
                        <span>
                          {ui.categoryLabel}: {s.allowed_caste === 'All' || !s.allowed_caste ? 'All' : s.allowed_caste}
                        </span>
                      </div>
                    </div>
                  </div>

                  {parsedDocs && parsedDocs.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-green-500/5 text-xs">
                      <span className="block text-slate-500 text-[10px] font-mono mb-1.5">{ui.docsHeader}</span>
                      <div className="flex flex-wrap gap-1.5">
                        {parsedDocs.map((doc, i) => (
                          <span key={i} className="px-2 py-0.5 rounded bg-slate-950/60 border border-green-500/10 text-[10px] text-slate-300 font-sans">
                            {doc}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
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
              <span>{ui.verifyTitle}</span>
            </h3>

            <form onSubmit={handleCheckEligibility} className="space-y-4 font-sans">
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1.5 uppercase tracking-widest">{ui.landOwnedLabel}</label>
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
                <label className="block text-xs font-mono text-slate-400 mb-1.5 uppercase tracking-widest">{ui.casteLabel}</label>
                <select
                  value={caste}
                  onChange={(e) => setCaste(e.target.value)}
                  className="w-full bg-slate-950/60 border border-green-500/20 focus:border-green-500/60 rounded-xl px-4 py-3 text-sm text-white outline-none transition-all"
                >
                  <option value="General" className="bg-slate-950">{ui.general}</option>
                  <option value="SC" className="bg-slate-950">{ui.sc}</option>
                  <option value="ST" className="bg-slate-950">{ui.st}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1.5 uppercase tracking-widest">{ui.ageLabel}</label>
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
                <span>{ui.calculateBtn}</span>
              </button>
            </form>
          </div>
        </div>

      </div>

    </div>
  );
};
