import React, { useState, useMemo } from 'react';
import {
  HelpCircle,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Search,
  ChevronRight,
  MapPin,
  ExternalLink,
  MessageSquare,
  FileText,
  Bookmark,
  Share2,
  X,
  ShieldCheck,
  Check,
  Coins
} from 'lucide-react';
import { StatusChip } from '../components';

export default function GovSchemes() {
  const [activeTab, setActiveTab] = useState('telangana'); // 'telangana' | 'central' | 'applied' | 'saved'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedScheme, setSelectedScheme] = useState(null);
  const [savedSchemes, setSavedSchemes] = useState(['rythu-bandhu']);
  const [checkedDocs, setCheckedDocs] = useState({});

  // Schemes Database
  const schemesList = [
    {
      id: 'rythu-bandhu',
      type: 'telangana',
      nameTe: 'రైతు బంధు పథకం',
      nameEn: 'Rythu Bandhu Scheme',
      benefit: '₹10,000 / Acre / Year',
      descTe: 'తెలంగాణ రైతులకు పంట పెట్టుబడి సహాయం అందించే ప్రతిష్టాత్మక పథకం. ఎకరానికి ఏడాదికి ₹10,000 జమ.',
      descEn: 'Direct investment support by Telangana Govt to farmers. ₹10,000 provided per acre annually for purchase of seeds & inputs.',
      tags: ['Financial Aid', 'Telangana'],
      eligibility: 'eligible', // eligible | check | not-eligible
      deadline: '31 July 2026',
      applied: true,
      appliedStatus: 'approved', // review | approved | received
      docs: ['Pattadar Passbook', 'Aadhaar Card', 'Bank Passbook Details'],
      steps: [
        'సమీప వ్యవసాయ విస్తరణ అధికారిని (AEO) సంప్రదించండి.',
        'ధరణి పోర్టల్ లో భూమి వివరాలు సరిపోల్చండి.',
        'బ్యాంక్ ఖాతా వివరాలు మరియు పట్టాదార్ పాస్ బుక్ సమర్పించండి.'
      ]
    },
    {
      id: 'pm-kisan',
      type: 'central',
      nameTe: 'పీఎం కిసాన్ సమ్మాన్ నిధి',
      nameEn: 'PM-KISAN Samman Nidhi',
      benefit: '₹6,000 / Year',
      descTe: 'కేంద్ర ప్రభుత్వం నుండి ప్రతి సంవత్సరం మూడు విడతల్లో ₹2,000 చొప్పున బ్యాంక్ ఖాతాల్లోకి పెట్టుబడి సహాయం.',
      descEn: 'Central Government scheme providing financial benefit of ₹6,000 per year in three equal installments directly to farmer accounts.',
      tags: ['Financial Aid', 'Central'],
      eligibility: 'eligible',
      deadline: '30 June 2026',
      applied: true,
      appliedStatus: 'received',
      docs: ['Aadhaar Card', 'Land holding document (Patta)', 'Active Bank Account'],
      steps: [
        'పీఎం కిసాన్ అధికారిక పోర్టల్ లో ఆన్‌లైన్ రిజిస్ట్రేషన్ చేయండి.',
        'ఆధార్ ఈ-కేవైసీ (e-KYC) ప్రక్రియ పూర్తి చేయండి.',
        'భూమి రికార్డులను అప్లోడ్ చేసి ధ్రువీకరించండి.'
      ]
    },
    {
      id: 'pmfby',
      type: 'central',
      nameTe: 'ప్రధాన మంత్రి ఫసల్ బీమా యోజన',
      nameEn: 'Crop Insurance (PMFBY)',
      benefit: 'Premium Subsidy up to 90%',
      descTe: 'పంట నష్టపోయినప్పుడు రైతులకు ఆర్థిక రక్షణ కల్పించే పంటల బీమా పథకం. తక్కువ ప్రీమియంతో ఎక్కువ బీమా.',
      descEn: 'Government sponsored crop insurance scheme providing comprehensive risk cover against crop failure due to natural disasters.',
      tags: ['Insurance', 'Central'],
      eligibility: 'eligible',
      deadline: '15 July 2026',
      applied: false,
      docs: ['Crop sowing certificate', 'Land possession proof', 'Bank account details'],
      steps: [
        'బ్యాంక్ లేదా కామన్ సర్వీస్ సెంటర్ (CSC) ద్వారా నమోదు చేసుకోండి.',
        'సరిపడా పంట ప్రీమియం (2% to 5%) చెల్లించండి.',
        'పంట నాటిన పత్రం సమర్పించండి.'
      ]
    },
    {
      id: 'free-borewell',
      type: 'telangana',
      nameTe: 'ఉచిత బోరుబావి పథకం',
      nameEn: 'Telangana Free Borewell Scheme',
      benefit: '100% Drilling Subsidy',
      descTe: 'వెనుకబడిన మరియు గిరిజన ప్రాంతాలలోని అర్హులైన రైతుల పొలాల్లో ఉచితంగా బోరుబావులు తవ్వించే పథకం.',
      descEn: 'Telangana state initiative providing free borewell drilling facility to eligible small and marginal farmers.',
      tags: ['Equipment', 'Telangana'],
      eligibility: 'check',
      deadline: '15 August 2026',
      applied: false,
      docs: ['Caste certificate', 'Small/Marginal farmer certificate', 'Geo-tagged land photo'],
      steps: [
        'మీ గ్రామ పంచాయతీ లేదా ఎంపీడీవో కార్యాలయంలో దరఖాస్తు చేసుకోండి.',
        'భూగర్భ జలాల శాఖ అధికారుల నుండి సర్వే రిపోర్ట్ పొందండి.',
        'బోరుబావి తవ్వకానికి అనుమతి పత్రం సేకరించండి.'
      ]
    },
    {
      id: 'kcc',
      type: 'central',
      nameTe: 'కిసాన్ క్రెడిట్ కార్డ్ యోజన',
      nameEn: 'Kisan Credit Card (KCC)',
      benefit: 'Low Interest Loans (4%)',
      descTe: 'అత్యల్ప వడ్డీ రేటుతో (కేవలం 4% కే) వ్యవసాయ రుణాలను అందించే సులభమైన క్రెడిట్ కార్డ్ సదుపాయం.',
      descEn: 'Credit scheme designed to provide farmers with timely access to credit for crop cultivation and post-harvest expenses.',
      tags: ['Financial Aid', 'Central'],
      eligibility: 'eligible',
      deadline: 'Open Year-Round',
      applied: false,
      docs: ['Identity proof (Voter ID/Aadhaar)', 'Land revenue records', 'Declaration of crops sown'],
      steps: [
        'మీ స్థానిక సహకార లేదా జాతీయం చేయబడిన బ్యాంకును సంప్రదించండి.',
        'కేసీసీ దరఖాస్తు ఫారమ్ నింపండి.',
        'భూమి రికార్డు పత్రాలను సరిచూసి కార్డును యాక్టివేట్ చేయండి.'
      ]
    }
  ];

  // Saved Schemes toggle helper
  const toggleSaveScheme = (id, e) => {
    e.stopPropagation();
    if (savedSchemes.includes(id)) {
      setSavedSchemes(savedSchemes.filter(s => s !== id));
    } else {
      setSavedSchemes([...savedSchemes, id]);
    }
  };

  const handleDocCheckbox = (docName) => {
    setCheckedDocs({
      ...checkedDocs,
      [docName]: !checkedDocs[docName]
    });
  };

  // Filter and search schemes
  const filteredSchemes = useMemo(() => {
    return schemesList.filter(s => {
      // Tab matching
      if (activeTab === 'telangana' && s.type !== 'telangana') return false;
      if (activeTab === 'central' && s.type !== 'central') return false;
      if (activeTab === 'applied' && !s.applied) return false;
      if (activeTab === 'saved' && !savedSchemes.includes(s.id)) return false;

      // Search matching
      const query = searchQuery.toLowerCase();
      return (
        s.nameTe.toLowerCase().includes(query) ||
        s.nameEn.toLowerCase().includes(query) ||
        s.descTe.toLowerCase().includes(query) ||
        s.descEn.toLowerCase().includes(query)
      );
    });
  }, [activeTab, searchQuery, savedSchemes]);

  return (
    <div className="bg-krushi-bg min-h-screen py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8 animate-[fade-in_0.3s_ease-out] pb-24 md:pb-12 text-krushi-text">
      
      {/* 1. Page Header */}
      <div className="border-b border-gray-200 pb-4">
        <span className="px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-extrabold bg-[#185FA5]/10 text-[#185FA5] border border-[#185FA5]/15">
          🏛️ Government Schemes Portal
        </span>
        <h1 className="heading-farm text-2xl sm:text-3xl font-extrabold text-slate-800 mt-2">
          ప్రభుత్వ పథకాల సమాచార కేంద్రం <span className="text-[#185FA5]">/ Government Schemes</span>
        </h1>
        <p className="text-xs text-krushi-muted mt-1 font-telugu">
          కేంద్ర మరియు రాష్ట్ర ప్రభుత్వాలు రైతులకు అందించే తాజా సబ్సిడీలు, ఆర్థిక సహాయాలు మరియు పంట బీమా పథకాల వివరాలు.
        </p>
      </div>

      {/* 2. TOP ELIGIBILITY BANNER (Personalized) */}
      <section className="bg-gradient-to-r from-krushi-green to-krushi-green-dark text-white rounded-3xl p-5 shadow-sm border border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative overflow-hidden">
        <div className="absolute -bottom-16 -right-16 w-36 h-36 bg-white/5 rounded-full blur-xl pointer-events-none" />
        
        <div className="flex items-center gap-3">
          <span className="text-3xl p-2 bg-white/10 rounded-2xl block shrink-0 select-none">🏆</span>
          <div>
            <h3 className="text-sm sm:text-base font-extrabold text-white text-telugu leading-snug">
              మీ ప్రొఫైల్ ఆధారంగా మీకు 5 పథకాలు అర్హత ఉన్నాయి
            </h3>
            <span className="block text-[10px] text-krushi-green-pale font-bold -mt-0.5">
              (5 schemes match your Warangal plot and active paddy crops)
            </span>
          </div>
        </div>

        <button
          onClick={() => alert('Performing profile compatibility check... 5 matches validated.')}
          className="px-4 py-2 bg-white hover:bg-slate-50 text-krushi-green-dark text-xs font-black rounded-2xl shadow-sm hover:scale-[1.02] active:scale-98 transition-all shrink-0 cursor-pointer"
        >
          Check All Eligibility
        </button>
      </section>

      {/* 3. SEARCH BAR & FILTER TABS */}
      <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
        
        {/* Search bar */}
        <div className="relative flex-1 max-w-md">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-krushi-muted" />
          <input
            type="text"
            placeholder="పథకం పేరుతో వెతకండి (Search schemes in Telugu/English)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-2xl text-xs font-bold text-slate-800 outline-none focus:border-[#185FA5] transition-all shadow-inner"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex bg-white p-1 rounded-2xl border border-gray-200 shrink-0 overflow-x-auto scrollbar-none">
          {[
            { key: 'telangana', te: 'తెలంగాణ పథకాలు', en: 'Telangana' },
            { key: 'central', te: 'కేంద్ర పథకాలు', en: 'Central' },
            { key: 'applied', te: 'దరఖాస్తు చేసినవి', en: 'Applied' },
            { key: 'saved', te: 'భద్రపరిచినవి', en: 'Saved' }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-3.5 py-1.5 rounded-xl text-[10px] font-black cursor-pointer transition-all shrink-0 ${
                activeTab === tab.key
                  ? 'bg-[#185FA5] text-white shadow-xs'
                  : 'text-krushi-muted hover:text-slate-800'
              }`}
            >
              {tab.te}
            </button>
          ))}
        </div>

      </div>

      {/* 4. SCHEME CARDS (List View) */}
      <div className="space-y-4">
        {filteredCrops => filteredCrops} {/* Just a safety tag */}
        {filteredSchemes.length > 0 ? (
          filteredSchemes.map((s) => (
            <div
              key={s.id}
              onClick={() => setSelectedScheme(s)}
              className="bg-white p-5 rounded-3xl border border-gray-200/80 shadow-card flex flex-col md:flex-row justify-between items-start md:items-center gap-5 hover:border-[#185FA5] transition-all duration-200 cursor-pointer group"
            >
              
              <div className="flex gap-4 items-start flex-1">
                {/* Government Seal Icon */}
                <div className="w-12 h-12 rounded-2xl bg-[#185FA5]/5 text-[#185FA5] flex items-center justify-center shrink-0 shadow-inner group-hover:scale-105 transition-transform select-none font-bold text-lg">
                  🏛️
                </div>

                <div className="space-y-2 flex-1">
                  
                  {/* Title and tags */}
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm sm:text-base font-black text-slate-900 text-telugu leading-snug">
                      {s.nameTe} <span className="text-[10px] font-semibold text-krushi-muted block sm:inline font-sans ml-0.5">({s.nameEn})</span>
                    </h3>

                    {/* Eligibility Badge */}
                    <span className={`px-2.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider ${
                      s.eligibility === 'eligible'
                        ? 'bg-green-50 text-green-700 border border-green-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                      {s.eligibility === 'eligible' ? '✅ Eligible' : '⚠️ Check'}
                    </span>

                    {/* Deadline tag */}
                    <span className="bg-gray-100 text-krushi-muted border border-gray-150 px-2 py-0.5 rounded text-[8px] font-mono">
                      Last date: {s.deadline}
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-slate-800 text-[11.5px] font-semibold leading-relaxed text-telugu line-clamp-2 max-w-3xl">
                    {s.descTe}
                  </p>

                  {/* Category Tags */}
                  <div className="flex flex-wrap gap-1.5">
                    {s.tags.map((tag, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded-md bg-krushi-bg border border-gray-150/50 text-[8px] font-bold text-krushi-muted">
                        {tag}
                      </span>
                    ))}
                  </div>

                </div>
              </div>

              {/* Price value & actions */}
              <div className="flex md:flex-col justify-between items-end gap-3 w-full md:w-auto pt-4 md:pt-0 border-t md:border-t-0 border-gray-100 shrink-0">
                <div className="text-left md:text-right">
                  <span className="text-[8px] text-krushi-muted uppercase tracking-widest block font-bold">Benefit Amount</span>
                  <span className="text-base sm:text-lg font-black font-mono text-krushi-amber">
                    {s.benefit}
                  </span>
                </div>

                <div className="flex gap-2">
                  
                  {/* Save toggle */}
                  <button
                    onClick={(e) => toggleSaveScheme(s.id, e)}
                    className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                      savedSchemes.includes(s.id)
                        ? 'bg-[#185FA5]/10 border-[#185FA5] text-[#185FA5]'
                        : 'border-gray-200 text-krushi-muted hover:border-gray-300 bg-white'
                    }`}
                  >
                    <Bookmark size={13} fill={savedSchemes.includes(s.id) ? 'currentColor' : 'none'} />
                  </button>

                  <button
                    onClick={() => setSelectedScheme(s)}
                    className="px-4 py-2.5 bg-[#185FA5] hover:bg-[#185FA5]/90 text-white rounded-xl text-xs font-extrabold shadow-sm hover:scale-[1.02] active:scale-98 transition-all cursor-pointer flex items-center justify-center gap-1"
                  >
                    <span>వివరాలు చూడండి</span>
                    <ChevronRight size={13} />
                  </button>

                </div>
              </div>

            </div>
          ))
        ) : (
          <div className="py-12 bg-white rounded-3xl border border-gray-150 text-center space-y-2">
            <span className="text-4xl block select-none">📁</span>
            <h4 className="text-sm font-black text-slate-800">పథకాలు కనుగొనబడలేదు</h4>
            <p className="text-xs text-krushi-muted">మీ శోధనకు తగిన పథకాలు ఏవీ లభించలేదు. శోధన పదాన్ని మార్చండి.</p>
          </div>
        )}
      </div>

      {/* 5. APPLIED SCHEMES PROGRESS TIMELINE TRACKER */}
      {activeTab === 'applied' && (
        <section className="bg-white rounded-3xl p-6 border border-gray-150 shadow-card space-y-6">
          <div>
            <span className="text-[9px] uppercase tracking-widest font-black text-[#185FA5]">Applications Status</span>
            <h3 className="text-base sm:text-lg font-black text-slate-800 mt-0.5">
              దరఖాస్తుల పురోగతి <span className="text-xs font-semibold text-krushi-muted">/ Applied Schemes Progress Tracker</span>
            </h3>
          </div>

          <div className="space-y-6 divide-y divide-gray-100">
            {schemesList.filter(s => s.applied).map((s) => (
              <div key={s.id} className="pt-6 first:pt-0 space-y-4">
                
                <div className="flex justify-between items-center text-xs font-bold">
                  <div>
                    <span className="text-slate-900 text-telugu block text-sm font-black">{s.nameTe}</span>
                    <span className="text-[10px] text-krushi-muted font-mono">{s.benefit}</span>
                  </div>
                  
                  <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                    s.appliedStatus === 'received' ? 'bg-green-50 text-green-700' : 'bg-blue-50 text-[#185FA5]'
                  }`}>
                    {s.appliedStatus === 'received' ? 'Amount Received' : 'Approved'}
                  </span>
                </div>

                {/* Progress line */}
                <div className="relative py-4">
                  <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1 bg-gray-200 rounded" />
                  
                  {/* Dynamic fill line */}
                  <div
                    className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-krushi-green rounded transition-all duration-500"
                    style={{ width: s.appliedStatus === 'received' ? '100%' : '66%' }}
                  />

                  <div className="relative flex justify-between text-[8px] font-black uppercase text-krushi-muted tracking-wider">
                    
                    {/* Node 1 */}
                    <div className="flex flex-col items-center gap-1.5 text-krushi-green">
                      <span className="w-5 h-5 rounded-full bg-krushi-green text-white flex items-center justify-center font-bold">✓</span>
                      <span>Applied</span>
                    </div>

                    {/* Node 2 */}
                    <div className="flex flex-col items-center gap-1.5 text-krushi-green">
                      <span className="w-5 h-5 rounded-full bg-krushi-green text-white flex items-center justify-center font-bold">✓</span>
                      <span>Under Review</span>
                    </div>

                    {/* Node 3 */}
                    <div className="flex flex-col items-center gap-1.5 text-krushi-green">
                      <span className="w-5 h-5 rounded-full bg-krushi-green text-white flex items-center justify-center font-bold">✓</span>
                      <span>Approved</span>
                    </div>

                    {/* Node 4 */}
                    <div className={`flex flex-col items-center gap-1.5 ${s.appliedStatus === 'received' ? 'text-krushi-green' : 'text-gray-400'}`}>
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold border ${
                        s.appliedStatus === 'received' ? 'bg-krushi-green text-white border-transparent' : 'bg-white border-gray-200'
                      }`}>
                        {s.appliedStatus === 'received' ? '✓' : '4'}
                      </span>
                      <span>Received</span>
                    </div>

                  </div>
                </div>

              </div>
            ))}
          </div>
        </section>
      )}

      {/* --- SCHEME DETAIL DRAWER --- */}
      {selectedScheme && (
        <div className="fixed inset-0 flex justify-end bg-black/40 backdrop-blur-xs z-50 animate-[fade-in_0.2s_ease-out]">
          <div className="bg-white w-full max-w-md h-full shadow-modal flex flex-col justify-between animate-[slide-in-right_0.25s_ease-out] relative">
            
            {/* Drawer Header */}
            <div className="bg-[#185FA5] text-white p-4 flex justify-between items-center shadow-sm">
              <div className="flex items-center gap-2">
                <span className="text-2xl select-none">🏛️</span>
                <div>
                  <h3 className="font-extrabold text-sm text-telugu leading-snug">
                    పథకం పూర్తి వివరాలు
                  </h3>
                  <span className="text-[9px] text-[#185FA5]/30 block font-bold -mt-0.5">Scheme Details Checklist</span>
                </div>
              </div>
              <button
                onClick={() => {
                  setSelectedScheme(null);
                  setCheckedDocs({});
                }}
                className="p-1 hover:bg-white/10 rounded-full text-white cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Drawer Body content */}
            <div className="flex-grow overflow-y-auto p-5 space-y-6">
              
              {/* Titles */}
              <div className="space-y-1.5 border-b border-gray-100 pb-4">
                <h4 className="text-base font-black text-slate-900 text-telugu leading-snug">{selectedScheme.nameTe}</h4>
                <h5 className="text-xs font-bold text-krushi-muted">{selectedScheme.nameEn}</h5>
                <div className="text-base font-mono font-bold text-krushi-amber pt-2">{selectedScheme.benefit}</div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <span className="text-[9px] uppercase tracking-wider font-extrabold text-krushi-muted block">Description</span>
                <p className="text-slate-800 text-xs text-telugu font-bold leading-relaxed bg-krushi-bg p-3.5 rounded-2xl border border-gray-150/40">
                  {selectedScheme.descTe}
                </p>
                <p className="text-xs text-krushi-muted pl-1 italic leading-relaxed border-l-2 border-gray-200">
                  {selectedScheme.descEn}
                </p>
              </div>

              {/* Documents checklist */}
              <div className="space-y-3">
                <span className="text-[9px] uppercase tracking-wider font-extrabold text-krushi-muted block">Required Documents (కావలసిన పత్రాలు)</span>
                
                <div className="space-y-2 text-xs font-semibold">
                  {selectedScheme.docs.map((doc, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleDocCheckbox(doc)}
                      className="w-full p-3 bg-white hover:bg-slate-50 border border-gray-200 rounded-xl flex gap-3 items-center text-left cursor-pointer transition-all"
                    >
                      <span className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 ${
                        checkedDocs[doc] ? 'bg-[#185FA5] border-transparent text-white' : 'border-gray-300'
                      }`}>
                        <Check size={13} className="stroke-[3]" />
                      </span>
                      <span className="text-slate-800">{doc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Application Steps */}
              <div className="space-y-3">
                <span className="text-[9px] uppercase tracking-wider font-extrabold text-krushi-muted block">Application Steps (దరఖాస్తు విధానం)</span>
                
                <ol className="space-y-3">
                  {selectedScheme.steps.map((step, idx) => (
                    <li key={idx} className="flex gap-3 text-xs text-slate-800 text-telugu font-bold leading-relaxed items-start">
                      <span className="w-5 h-5 rounded-full bg-[#185FA5] text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span className="flex-1">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>

            </div>

            {/* Drawer Footer Actions */}
            <div className="p-4 border-t border-gray-250/50 bg-white space-y-2.5 z-10 shrink-0">
              <a
                href="https://pmkisan.gov.in/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 rounded-2xl bg-[#185FA5] hover:bg-[#185FA5]/95 text-white text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-sm hover:scale-[1.01] active:scale-98 transition-all"
              >
                <span>Apply Now (అధికారిక వెబ్‌సైట్)</span>
                <ExternalLink size={13} />
              </a>

              <a
                href={`https://wa.me/919876543210?text=Hi%20Krushi%20AI,%20please%20help%20me%20apply%20for%20${selectedScheme.nameEn}%20(${selectedScheme.nameTe})`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 rounded-2xl bg-krushi-green hover:bg-krushi-green-dark text-white text-xs font-black flex items-center justify-center gap-1.5 shadow-sm hover:scale-[1.01] active:scale-98 transition-all"
              >
                <MessageSquare size={14} />
                <span>WhatsApp సహాయం పొందండి</span>
              </a>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
