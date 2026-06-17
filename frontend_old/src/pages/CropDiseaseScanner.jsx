import React, { useState, useEffect, useRef } from 'react';
import {
  Upload,
  Camera,
  Check,
  X,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  AlertTriangle,
  Info,
  Calendar,
  ArrowRight,
  Shield,
  FileText,
  Activity,
  UserCheck,
  Sparkles,
  Bug,
  HeartPulse,
  TrendingUp
} from 'lucide-react';
import { StatusChip } from '../components';

export default function CropDiseaseScanner({ preload, clearPreload }) {
  const [file, setFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [step, setStep] = useState(0); // 0 = Idle, 1 = Uploaded, 2 = Processing, 3 = Detecting, 4 = Ready
  const [selectedDisease, setSelectedDisease] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  // Accordion toggle states
  const [accordions, setAccordions] = useState({
    cause: true,
    treatment: false,
    prevention: false,
    expert: false
  });

  const toggleAccordion = (section) => {
    setAccordions({ ...accordions, [section]: !accordions[section] });
  };

  // Preloaded disease database
  const diseaseData = {
    bph: {
      id: 'bph',
      nameEn: 'Brown Plant Hopper (BPH)',
      nameTe: 'గోధుమ మొక్కపేను',
      severity: 'SEVERE',
      severityColor: 'bg-red-600 text-white shadow-md shadow-red-200 ring-2 ring-red-400 animate-pulse',
      severityBorder: 'border-red-500',
      textColor: 'text-red-600',
      bgColor: 'bg-red-50',
      accuracy: 95,
      cropTe: 'వరి పంట (Rice Paddy)',
      sownDate: '15 May 2026',
      svgColor: '#78350f',
      bbox: { x: '35%', y: '42%', w: '40%', h: '38%', label: 'BPH Colony (Severe)' },
      leafType: 'stem',
      causeTe: 'ఇది నిలకడగా ఉండే గోధుమ రంగు దోమల వల్ల వ్యాపిస్తుంది. ఇవి పిలకల వద్ద రసాన్ని పీల్చి పంటను నష్టపరుస్తాయి.',
      causeEn: 'Spread by Nilaparvata lugens (hopper insect). Clustered at leaf sheath bases, sucking sap and causing "hopper burn" patches.',
      treatmentTe: [
        'వెంటనే పొలంలో నీటిని తీసివేసి బురద పదునుగా ఉంచాలి (పొలాన్ని ఆరబెట్టాలి).',
        'ఎకరాకు బ్యూప్రోఫెజిన్ 25% ఎస్.సి. (Buprofezin 25 SC) మందును 320 మి.లీ. లేదా ఇమిడాక్లోప్రిడ్ 17.8% ఎస్.ఎల్. (Imidacloprid 17.8 SL) 40 మి.లీ. 200 లీటర్ల నీటిలో కలిపి పిచికారీ చేయాలి.',
        'మొక్కల మొదళ్ల వద్ద బాగా తగిలేలా మందును స్ప్రే చేయండి.',
        'నత్రజని (యూరియా) ఎరువుల వాడకాన్ని తాత్కాలికంగా తగ్గించండి.'
      ],
      treatmentEn: [
        'Drain water completely from fields for 3-4 days to arrest hopper multiplication.',
        'Spray Buprofezin 25 SC @ 1.6 ml/L or Imidacloprid 17.8 SL @ 0.2 ml/L directed at crop base.',
        'Avoid excess nitrogenous top dressing which increases foliage canopy.',
        'Maintain alleyways (paths) of 20 cm for proper ventilation and light penetration.'
      ],
      preventionTe: [
        'ప్రతి 2 మీటర్ల వరి నాట్లకు 20 సె.మీ. బాటలు (కాలిబాటలు) వదలాలి.',
        'ఈ తెగులును తట్టుకునే రకాలను ఎంపిక చేసుకోవాలి.',
        'మితిమీరిన యూరియా వాడకాన్ని తగ్గించి పొటాష్ ఎరువులను తగిన మోతాదులో వాడాలి.'
      ],
      preventionEn: [
        'Adopt wider spacing and keep alleyways for sun exposure and aeration.',
        'Grow hopper-resistant rice varieties recommended by PJTSAU university.',
        'Encourage natural predators like spiders, mirid bugs, and ladybird beetles.'
      ]
    },
    blast: {
      id: 'blast',
      nameEn: 'Rice Blast (Magnaporthe oryzae)',
      nameTe: 'వరి అగ్గి తెగులు',
      severity: 'MODERATE',
      severityColor: 'bg-amber-500 text-white shadow-md shadow-amber-100 ring-2 ring-amber-300',
      severityBorder: 'border-amber-500',
      textColor: 'text-amber-700',
      bgColor: 'bg-amber-50',
      accuracy: 91,
      cropTe: 'వరి పంట (Rice Paddy)',
      sownDate: '12 May 2026',
      svgColor: '#a3e635',
      bbox: { x: '25%', y: '30%', w: '50%', h: '40%', label: 'Blast Lesions (Spindle)' },
      leafType: 'rice',
      causeTe: 'ఇది ఒక శిలీంద్రం (ఫంగస్) వల్ల సంభవిస్తుంది. ఆకులపై నూలు కండె ఆకారపు (స్పిండిల్) నిలువు మచ్చలు ఏర్పడతాయి.',
      causeEn: 'Fungal infection causing spindle-shaped lesions with ash-colored centers and brown borders on foliage.',
      treatmentTe: [
        'ట్రైసైక్లాజోల్ 75 WP (Tricyclazole 75 WP) శిలీంద్ర నాశినిని ఎకరాకు 120 గ్రా చొప్పున 200 లీటర్ల నీటిలో కలిపి పిచికారీ చేయండి.',
        'వాతావరణం మేఘావృతమై ఉన్నప్పుడు కసుగామైసిన్ (Kasugamycin) 2.5 మి.లీ. లీటరు నీటిలో కలిపి వాడవచ్చు.',
        'మొక్కలకు సరైన నీటి సదుపాయం కల్పించి తేమను నిలకడగా ఉంచండి.',
        'నత్రజని దరఖాస్తును తాత్కాలికంగా ఆపండి.'
      ],
      treatmentEn: [
        'Apply Tricyclazole 75 WP @ 0.6 g/L or Kasugamycin 2% L @ 2.5 ml/L of water.',
        'Keep fields flooded during leaf blast outbreaks to reduce infection rate.',
        'Skip immediately scheduled urea top-dressings until symptoms subside.'
      ],
      preventionTe: [
        'రోగ రహిత విత్తనాలను ఉపయోగించండి మరియు విత్తన శుద్ధి తప్పనిసరిగా చేయాలి.',
        'కార్బెండజిమ్ (Carbendazim) 2 గ్రా చొప్పున కిలో విత్తనానికి కలిపి విత్తన శుద్ధి చేయండి.',
        'పొలం గట్లపై కలుపు మొక్కలను మరియు ఎండిన ఆకులను తొలగించి శుభ్రంగా ఉంచండి.'
      ],
      preventionEn: [
        'Practice clean bund cultivation (remove wild grass hosts).',
        'Use certified disease-free seed stocks and seed treat with Carbendazim.',
        'Avoid overhead sprinkler irrigation in nursery nurseries.'
      ]
    },
    curl: {
      id: 'curl',
      nameEn: 'Cotton Leaf Curl Virus (CLCuV)',
      nameTe: 'పత్తి ఆకు ముడుత తెగులు',
      severity: 'MODERATE',
      severityColor: 'bg-amber-500 text-white shadow-md shadow-amber-100 ring-2 ring-amber-300',
      severityBorder: 'border-amber-500',
      textColor: 'text-amber-700',
      bgColor: 'bg-amber-50',
      accuracy: 94,
      cropTe: 'పత్తి పంట (Cotton)',
      sownDate: '01 June 2026',
      svgColor: '#22c55e',
      bbox: { x: '20%', y: '25%', w: '60%', h: '50%', label: 'Curl Vector Curling' },
      leafType: 'cotton',
      causeTe: 'ఇది తెల్లదోమ (వైట్‌ఫ్లై) ద్వారా వ్యాపించే వైరస్ తెగులు. ఆకులు పైకి లేదా క్రిందికి ముడుచుకుని నరాలు దళసరిగా మారుతాయి.',
      causeEn: 'Viral pathogen transmitted by Bemisia tabaci (whitefly vector). Leaf margins curl upward with thickened veins and stunted growth.',
      treatmentTe: [
        'తెల్లదోమల నివారణకు ఎకరాకు డయాఫెంథియురాన్ 50 WP (Diafenthiuron 50 WP) 250 గ్రా చొప్పున స్ప్రే చేయండి.',
        'లేదా పైరిప్రాక్సిఫెన్ 10 EC (Pyriproxyfen 10 EC) 400 మి.లీ. ఒక ఎకరాకు చొప్పున స్ప్రే చేయవచ్చు.',
        'బాధిత గిడసబారిన మొక్కలను వెంటనే పీకి పొలానికి దూరంగా తగులబెట్టండి.',
        'పసుపు రంగు జిగురు పూసిన అట్టలను (Yellow Sticky Traps) ఎకరానికి 10-15 అమర్చండి.'
      ],
      treatmentEn: [
        'Control whitefly vectors using Diafenthiuron 50 WP @ 200 g/acre or Pyriproxyfen 10 EC @ 400 ml/acre.',
        'Uproot and burn virus-affected plants early in the season to prevent spreading.',
        'Install yellow sticky traps (10-15 per acre) to monitor vector insect activity.'
      ],
      preventionTe: [
        'పొలం గట్ల వద్ద తెల్లదోమలు ఆశ్రయించే గడ్డి జాతి కలుపు మొక్కలను పెరగకుండా చూడండి.',
        'వైరస్‌ను తట్టుకునే నిరోధక పత్తి వంగడాలను (CLCuV Resistant Hybrid Bt Strains) మాత్రమే నాటండి.',
        'పంట మార్పిడి పద్ధతులను పాటించండి.'
      ],
      preventionEn: [
        'Eradicate weed hosts like Abutilon indicum from field borders.',
        'Maintain crop-free period and plant virus-tolerant Bt hybrid strains.',
        'Avoid growing collateral hosts like tomato or tobacco adjacent to cotton.'
      ]
    }
  };

  // Handle preload trigger from App.jsx
  useEffect(() => {
    if (preload && diseaseData[preload]) {
      handleSelectPreset(preload);
      // Clear preload back in App
      if (clearPreload) clearPreload();
    }
  }, [preload]);

  // Simulate scanning pipeline
  const startScanningTimeline = (presetKey, uploadedImage = null) => {
    setScanning(true);
    setStep(1);

    // Dynamic steps with timeouts
    const timer1 = setTimeout(() => setStep(2), 650);
    const timer2 = setTimeout(() => setStep(3), 1300);
    const timer3 = setTimeout(() => {
      setStep(4);
      setScanning(false);
      setSelectedDisease(diseaseData[presetKey] || diseaseData.bph);
    }, 2400);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  };

  const handleSelectPreset = (key) => {
    if (scanning) return;
    setFile(null);
    setImagePreview(null);
    setSelectedDisease(null);
    startScanningTimeline(key);
  };

  // Drag and drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (scanning) return;

    const droppedFile = e.dataTransfer.files[0];
    processUploadedFile(droppedFile);
  };

  // Upload custom file
  const handleFileUpload = (e) => {
    if (scanning) return;
    const uploadedFile = e.target.files[0];
    processUploadedFile(uploadedFile);
  };

  const processUploadedFile = (uploadedFile) => {
    if (uploadedFile && uploadedFile.type.startsWith('image/')) {
      setFile(uploadedFile);
      setSelectedDisease(null);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        // Trigger scan simulation and default to BPH for custom uploads
        startScanningTimeline('bph');
      };
      reader.readAsDataURL(uploadedFile);
    }
  };

  const handleReset = () => {
    setFile(null);
    setImagePreview(null);
    setScanning(false);
    setStep(0);
    setSelectedDisease(null);
  };

  // Trigger file inputs
  const triggerFilePicker = () => {
    fileInputRef.current?.click();
  };

  const triggerCamera = (e) => {
    e.stopPropagation(); // Avoid double triggers with label click
    cameraInputRef.current?.click();
  };

  // Scan History records
  const historyRecords = [
    { key: 'blast', nameEn: 'Rice Blast', nameTe: 'వరి అగ్గి తెగులు', date: '12 Jun 2026', status: 'Resolved', chipVariant: 'success' },
    { key: 'curl', nameEn: 'Cotton Leaf Curl', nameTe: 'ఆకు ముడుత తెగులు', date: '08 Jun 2026', status: 'Treated', chipVariant: 'primary' },
    { key: 'bph', nameEn: 'Brown Plant Hopper', nameTe: 'గోధుమ మొక్కపేను', date: '28 May 2026', status: 'Monitoring', chipVariant: 'warning' }
  ];

  return (
    <div className="bg-krushi-bg min-h-screen py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8 animate-[fade-in_0.3s_ease-out]">
      
      {/* Header Info */}
      <div className="border-b border-gray-200/80 pb-5">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-extrabold bg-krushi-green-pale text-krushi-green border border-krushi-green-light/10">
            🤖 AI-Powered Diagnosis
          </span>
          <span className="text-[10px] font-bold text-krushi-amber font-mono">MODEL v4.2</span>
        </div>
        <h1 className="heading-farm text-2xl sm:text-3xl font-extrabold text-krushi-text mt-1.5 flex items-center gap-2">
          <span>📷</span> పంట తెగుళ్ల నిర్ధారణ కేంద్రం <span className="text-krushi-green">/ Crop Disease Scanner</span>
        </h1>
        <p className="text-xs sm:text-sm text-krushi-muted mt-1 font-telugu">
          మీ పంట ఆకు లేదా కాండం ఫోటోను ఇక్కడ అప్‌లోడ్ చేయండి. కృత్రిమ మేధస్సు వెంటనే తెగులును గుర్తించి తగిన మందులు, చికిత్సలను సూచిస్తుంది.
        </p>
      </div>

      {/* Main Two-Column Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: SCANNER VIEWPORT & ADVISORY DETAILS (8 COLS) */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* UPLOAD & ANALYSIS VIEWPORT CARD */}
          <div className="bg-white rounded-3xl p-6 border border-gray-150 shadow-card relative overflow-hidden flex flex-col justify-between min-h-[380px] transition-all duration-300">
            
            {/* Ambient background glows */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-krushi-green-pale/40 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-krushi-amber-light/30 rounded-full blur-xl pointer-events-none" />

            {/* SCANNING ACTIVE SCREEN */}
            {scanning || imagePreview || selectedDisease ? (
              <div className="space-y-6 flex-1 flex flex-col">
                
                {/* Visual Viewport Wrapper */}
                <div className="relative w-full aspect-[16/10] max-w-lg mx-auto bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 flex items-center justify-center shadow-lg group">
                  
                  {/* Local image file preview */}
                  {imagePreview && (
                    <img src={imagePreview} className="w-full h-full object-cover opacity-90 transition-all duration-300" alt="Farmer crop upload" />
                  )}

                  {/* Preset SVG vector drawings (when no real custom image exists) */}
                  {!imagePreview && selectedDisease && (
                    <div className="absolute inset-0 flex items-center justify-center bg-slate-900">
                      <div className="relative w-36 h-36 flex items-center justify-center">
                        {selectedDisease.leafType === 'rice' && (
                          <svg viewBox="0 0 100 100" className="w-full h-full fill-current text-emerald-500/80 animate-float-slow">
                            <path d="M50 5 C 20 25, 20 75, 50 95 C 80 75, 80 25, 50 5 Z" />
                            <path d="M50 5 L 50 95" stroke="#047857" strokeWidth="2.5" opacity="0.8" />
                          </svg>
                        )}
                        {selectedDisease.leafType === 'cotton' && (
                          <svg viewBox="0 0 100 100" className="w-full h-full fill-current text-green-500/80 animate-float-slow">
                            <path d="M50 10 C 10 30, 20 80, 50 95 C 80 80, 90 30, 50 10 Z" />
                            <path d="M50 10 L 50 95" stroke="#15803d" strokeWidth="2.5" opacity="0.8" />
                          </svg>
                        )}
                        {selectedDisease.leafType === 'stem' && (
                          <svg viewBox="0 0 100 100" className="w-24 h-full text-amber-800/80 fill-current opacity-80 animate-float-slow">
                            <rect x="42" y="5" width="16" height="90" rx="4" />
                            <path d="M42 30 L 25 15" stroke="#78350f" strokeWidth="3" />
                            <path d="M58 50 L 75 35" stroke="#78350f" strokeWidth="3" />
                          </svg>
                        )}

                        {/* Vector lesion spots overlay */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <span className="w-4 h-2 bg-amber-950/80 rounded-full rotate-45 translate-x-3 -translate-y-5 border border-yellow-600 animate-pulse" />
                          <span className="w-5 h-2.5 bg-amber-950/80 rounded-full -rotate-12 -translate-x-5 translate-y-3 border border-yellow-600 animate-pulse" />
                          <span className="w-3.5 h-2 bg-amber-950/80 rounded-full rotate-20 translate-y-6 translate-x-2 border border-yellow-600 animate-pulse" />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Laser Scan Sweep overlay line */}
                  {scanning && (
                    <div className="absolute inset-x-0 h-1.5 bg-gradient-to-r from-transparent via-green-400 to-transparent shadow-[0_0_20px_rgba(74,222,128,1)] animate-laser-scan z-10" />
                  )}

                  {/* Bounding Box overlay highlighting infected segment */}
                  {selectedDisease && !scanning && (
                    <div
                      className="absolute border-2 border-red-500 border-dashed rounded-lg animate-pulse z-20 flex items-start"
                      style={{
                        top: selectedDisease.bbox.y,
                        left: selectedDisease.bbox.x,
                        width: selectedDisease.bbox.w,
                        height: selectedDisease.bbox.h
                      }}
                    >
                      {/* Label badge */}
                      <span className="bg-red-600 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded shadow-md -mt-5 ml-1 uppercase tracking-wider flex items-center gap-1">
                        <Bug size={10} />
                        {selectedDisease.bbox.label}
                      </span>
                    </div>
                  )}

                  {/* Grid layout scan scanner overlay background */}
                  {scanning && (
                    <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#22c55e_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
                  )}

                  {/* Scanning banner */}
                  {scanning && (
                    <div className="absolute bottom-4 left-4 right-4 bg-slate-900/80 backdrop-blur-md px-4 py-2.5 rounded-xl border border-slate-700 text-center flex items-center justify-center gap-2 shadow-xl z-20">
                      <span className="w-4 h-4 border-2 border-green-400 border-t-transparent rounded-full animate-spin" />
                      <span className="text-xs text-green-400 font-extrabold uppercase tracking-widest animate-pulse font-telugu">
                        AI విశ్లేషిస్తోంది... <span className="text-[10px] font-sans font-medium opacity-80">(AI is analyzing leaf health...)</span>
                      </span>
                    </div>
                  )}
                </div>

                {/* Progress Steps Status bar */}
                <div className="pt-4 border-t border-gray-100 max-w-lg mx-auto w-full">
                  <div className="flex justify-between items-center text-[10px] font-extrabold uppercase tracking-wider text-krushi-muted">
                    
                    {/* Step 1 */}
                    <div className="flex flex-col items-center gap-1.5 text-krushi-green">
                      <span className="w-5 h-5 rounded-full bg-krushi-green-pale flex items-center justify-center text-[9px] border border-krushi-green-light/20 font-black">✓</span>
                      <span className="font-bold">Upload</span>
                    </div>

                    <div className={`flex-1 h-0.5 mx-2 -mt-4 transition-all duration-300 ${step >= 2 ? 'bg-krushi-green' : 'bg-gray-200'}`} />

                    {/* Step 2 */}
                    <div className={`flex flex-col items-center gap-1.5 ${step >= 2 ? 'text-krushi-green' : 'text-gray-400'}`}>
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] border transition-all ${step >= 2 ? 'bg-krushi-green-pale border-krushi-green-light/20 text-krushi-green font-black' : 'border-gray-200 bg-white font-bold'}`}>
                        {step >= 2 ? '✓' : '2'}
                      </span>
                      <span className="font-bold">Processing</span>
                    </div>

                    <div className={`flex-1 h-0.5 mx-2 -mt-4 transition-all duration-300 ${step >= 3 ? 'bg-krushi-green' : 'bg-gray-200'}`} />

                    {/* Step 3 */}
                    <div className={`flex flex-col items-center gap-1.5 ${step >= 3 ? 'text-krushi-green' : 'text-gray-400'}`}>
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] border transition-all ${step >= 3 ? 'bg-krushi-green-pale border-krushi-green-light/20 text-krushi-green font-black' : 'border-gray-200 bg-white font-bold'}`}>
                        {step >= 3 ? '✓' : '3'}
                      </span>
                      <span className="font-bold">Detecting</span>
                    </div>

                    <div className={`flex-1 h-0.5 mx-2 -mt-4 transition-all duration-300 ${step >= 4 ? 'bg-krushi-green' : 'bg-gray-200'}`} />

                    {/* Step 4 */}
                    <div className={`flex flex-col items-center gap-1.5 ${step >= 4 ? 'text-krushi-green' : 'text-gray-400'}`}>
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] border transition-all ${step >= 4 ? 'bg-krushi-green-pale border-krushi-green-light/20 text-krushi-green font-black' : 'border-gray-200 bg-white font-bold'}`}>
                        {step >= 4 ? '✓' : '4'}
                      </span>
                      <span className="font-bold">Report Ready</span>
                    </div>
                  </div>
                </div>

                {/* Reset button wrapper */}
                <div className="flex justify-center pt-2">
                  <button
                    onClick={handleReset}
                    className="flex items-center gap-1.5 text-xs font-bold text-krushi-muted hover:text-krushi-danger transition-colors cursor-pointer border border-gray-200 bg-gray-50 px-3.5 py-1.5 rounded-xl hover:bg-red-50 hover:border-red-200"
                  >
                    <X size={13} /> Reset & Crop Photo (కొత్త ఫోటో)
                  </button>
                </div>

              </div>
            ) : (
              /* IDLE UPLOAD ZONE SCREEN (Hero-Sized, Centered) */
              <div className="flex-1 flex flex-col justify-center items-center py-8">
                
                {/* Hidden Inputs */}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="sr-only"
                  ref={fileInputRef}
                />
                
                {/* Input for direct camera captures (mobile environment camera) */}
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleFileUpload}
                  className="sr-only"
                  ref={cameraInputRef}
                />

                {/* Large dashed upload area */}
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={triggerFilePicker}
                  className={`w-full max-w-xl aspect-[16/9] border-2 border-dashed rounded-3xl transition-all duration-300 flex flex-col justify-center items-center gap-4 cursor-pointer group shadow-inner relative ${
                    isDragging
                      ? 'border-krushi-green bg-krushi-green-pale/30 scale-[1.01] shadow-glow'
                      : 'border-krushi-green-light/35 bg-krushi-green-pale/10 hover:border-krushi-green hover:bg-krushi-green-pale/20'
                  }`}
                >
                  
                  {/* Animating crop leaf SVG in center */}
                  <div className="p-4.5 rounded-full bg-white text-krushi-green shadow-card border border-krushi-green-light/10 transition-all duration-300 group-hover:scale-110 group-hover:rotate-12 group-hover:text-krushi-green-light">
                    <svg className="w-12 h-12 text-krushi-green animate-float-slow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M12 2C6.5 2 2 6.5 2 12c0 5.5 10 10 10 10s10-4.5 10-10C22 6.5 17.5 2 12 2z" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M12 2v20" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M12 8c3-1.5 5 1.5 5 1.5" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M12 14c-3-1.5-5 1.5-5 1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>

                  <div className="text-center space-y-1 px-4">
                    <h3 className="text-sm sm:text-base font-extrabold text-krushi-text text-telugu leading-snug">
                      పంట ఆకు ఫోటోను అప్లోడ్ చేయండి
                    </h3>
                    <p className="text-xs text-krushi-muted font-bold tracking-wide">
                      Upload or drag your crop photo here
                    </p>
                  </div>

                  {/* Direct Camera Button (For mobile layout display) */}
                  <button
                    onClick={triggerCamera}
                    className="px-4 py-2 rounded-xl bg-krushi-green hover:bg-krushi-green-dark text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-all duration-200 hover:scale-105 active:scale-95"
                  >
                    <Camera size={14} />
                    <span>Direct Camera Capture</span>
                  </button>

                  <span className="text-[9px] text-krushi-muted/65 font-mono absolute bottom-4 uppercase tracking-wider font-semibold bg-white border border-gray-150 px-2 py-0.5 rounded">
                    Supported Formats: JPG, PNG, HEIC
                  </span>
                </div>

                {/* Preset templates selector trigger box */}
                <div className="w-full max-w-xl mt-6 pt-5 border-t border-gray-100 space-y-3">
                  <span className="text-[10px] text-krushi-muted font-black uppercase tracking-wider block text-center flex items-center justify-center gap-1">
                    <Sparkles size={11} className="text-krushi-amber" />
                    లేదా నమూనా తెగులు స్కాన్ డెమో ఎంచుకోండి (Demo presets)
                  </span>
                  
                  <div className="grid grid-cols-3 gap-2.5">
                    <button
                      onClick={() => handleSelectPreset('bph')}
                      className="px-3 py-2.5 rounded-2xl bg-white border border-gray-200 text-xs hover:bg-gray-50 active:scale-98 cursor-pointer font-bold text-center block transition-all hover:border-red-200 hover:text-red-700 shadow-sm"
                    >
                      🐛 మొక్కపేను (BPH)
                    </button>
                    <button
                      onClick={() => handleSelectPreset('blast')}
                      className="px-3 py-2.5 rounded-2xl bg-white border border-gray-200 text-xs hover:bg-gray-50 active:scale-98 cursor-pointer font-bold text-center block transition-all hover:border-amber-200 hover:text-amber-700 shadow-sm"
                    >
                      🌾 వరి అగ్గి తెగులు
                    </button>
                    <button
                      onClick={() => handleSelectPreset('curl')}
                      className="px-3 py-2.5 rounded-2xl bg-white border border-gray-200 text-xs hover:bg-gray-50 active:scale-98 cursor-pointer font-bold text-center block transition-all hover:border-green-200 hover:text-green-700 shadow-sm"
                    >
                      ☁️ ఆకు ముడుత
                    </button>
                  </div>
                </div>

              </div>
            )}

          </div>

          {/* DRAMATIC RESULT CARD & ACCORDION PREVIEW */}
          {selectedDisease && !scanning && (
            <div className="space-y-6 animate-[slide-up_0.35s_cubic-bezier(0.22,1,0.36,1)_both]">
              
              {/* RESULT SHEETS OVERVIEW */}
              <div className={`bg-white rounded-3xl p-6 border-l-8 border-t border-b border-r border-gray-150/80 ${selectedDisease.severityBorder} shadow-card flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 relative overflow-hidden`}>
                
                {/* Background warning gradient splash */}
                <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-red-500/5 rounded-full blur-2xl pointer-events-none" />

                <div className="space-y-3 flex-1">
                  
                  {/* Severity level & Crop name */}
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider shadow-sm ${selectedDisease.severityColor}`}>
                      {selectedDisease.severity}
                    </span>
                    <span className="text-[10px] text-krushi-text font-black bg-krushi-bg px-2.5 py-1 rounded-xl border border-gray-150">
                      🌾 {selectedDisease.cropTe}
                    </span>
                  </div>

                  {/* Disease name headings */}
                  <div className="space-y-1">
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
                      {selectedDisease.nameEn}
                    </h2>
                    <h3 className="text-sm sm:text-base font-extrabold text-krushi-muted text-telugu leading-snug">
                      తెగులు పేరు: <span className="text-slate-800 underline decoration-wavy decoration-krushi-amber">{selectedDisease.nameTe}</span>
                    </h3>
                  </div>

                  <div className="flex items-center gap-2 text-[10px] text-krushi-muted font-semibold">
                    <Calendar size={12} />
                    <span>Scanned on: {new Date().toLocaleDateString('en-GB')} | Ref ID: KR-SCAN-9042</span>
                  </div>
                </div>

                {/* SVG circular confidence gauge (WOW factor progress meter) */}
                <div className="flex items-center gap-3 bg-white p-4.5 rounded-2xl border border-gray-150 shadow-sm shrink-0 self-center">
                  <div className="relative w-16 h-16 flex items-center justify-center">
                    
                    {/* Circle drawing */}
                    <svg className="w-full h-full transform -rotate-90">
                      <circle
                        cx="32"
                        cy="32"
                        r="28"
                        fill="transparent"
                        stroke="#f3f4f6"
                        strokeWidth="5"
                      />
                      <circle
                        cx="32"
                        cy="32"
                        r="28"
                        fill="transparent"
                        stroke="#0F6E56"
                        strokeWidth="5.5"
                        strokeDasharray="175"
                        strokeDashoffset={175 - (175 * selectedDisease.accuracy) / 100}
                        strokeLinecap="round"
                        className="transition-all duration-1000 ease-out"
                      />
                    </svg>
                    
                    <span className="absolute text-xs font-black font-mono text-krushi-green-dark">
                      {selectedDisease.accuracy}%
                    </span>
                  </div>
                  <div>
                    <span className="text-xs font-black text-slate-800 block">{selectedDisease.accuracy}% నిర్ధారణ</span>
                    <span className="text-[9px] text-krushi-muted block font-bold uppercase tracking-wider">AI Confidence</span>
                  </div>
                </div>

              </div>

              {/* DETAILS ACCORDIONS */}
              <div className="bg-white rounded-3xl border border-gray-200/80 shadow-card overflow-hidden divide-y divide-gray-100">
                
                {/* 1. CAUSE ACCORDION */}
                <div className="group">
                  <button
                    onClick={() => toggleAccordion('cause')}
                    className="w-full px-6 py-4.5 flex justify-between items-center text-left hover:bg-gray-50/80 cursor-pointer transition-colors"
                  >
                    <span className="text-xs sm:text-sm font-extrabold text-slate-800 flex items-center gap-2">
                      <Info size={16} className="text-krushi-green shrink-0" />
                      <span>కారణం <span className="text-gray-400 font-normal">/ Cause & Pathogen</span></span>
                    </span>
                    {accordions.cause ? <ChevronUp size={16} className="text-krushi-muted" /> : <ChevronDown size={16} className="text-krushi-muted" />}
                  </button>

                  {accordions.cause && (
                    <div className="px-6 pb-5 pt-1.5 space-y-2.5 animate-[slide-down_0.2s_ease-out]">
                      <p className="text-telugu text-[14px] font-bold text-slate-800 leading-relaxed bg-krushi-green-pale/20 p-3.5 rounded-2xl border border-krushi-green-light/5">
                        {selectedDisease.causeTe}
                      </p>
                      <p className="text-xs text-krushi-muted italic pl-1 leading-relaxed border-l-2 border-gray-200">
                        {selectedDisease.causeEn}
                      </p>
                    </div>
                  )}
                </div>

                {/* 2. TREATMENT ACCORDION */}
                <div className="group">
                  <button
                    onClick={() => toggleAccordion('treatment')}
                    className="w-full px-6 py-4.5 flex justify-between items-center text-left hover:bg-gray-50/80 cursor-pointer transition-colors"
                  >
                    <span className="text-xs sm:text-sm font-extrabold text-slate-800 flex items-center gap-2">
                      <HeartPulse size={16} className="text-krushi-green shrink-0" />
                      <span>చికిత్స మార్గాలు <span className="text-gray-400 font-normal">/ Step-by-Step Treatment</span></span>
                    </span>
                    {accordions.treatment ? <ChevronUp size={16} className="text-krushi-muted" /> : <ChevronDown size={16} className="text-krushi-muted" />}
                  </button>

                  {accordions.treatment && (
                    <div className="px-6 pb-6 pt-2 space-y-4 animate-[slide-down_0.2s_ease-out]">
                      
                      {/* Telugu Treatment list */}
                      <div className="space-y-2.5">
                        <span className="text-[10px] text-krushi-green font-extrabold uppercase tracking-widest block bg-krushi-green-pale/40 px-2.5 py-1 rounded w-fit">
                          రసాయన పిచికారీ సిఫార్సులు (Mandi Guide)
                        </span>
                        
                        <ol className="space-y-2.5">
                          {selectedDisease.treatmentTe.map((item, i) => (
                            <li key={i} className="flex gap-3 text-telugu text-[13.5px] font-bold text-slate-800 leading-relaxed items-start">
                              <span className="w-5 h-5 rounded-full bg-krushi-green text-white flex items-center justify-center shrink-0 text-[10px] font-bold mt-0.5">{i + 1}</span>
                              <span className="flex-1">{item}</span>
                            </li>
                          ))}
                        </ol>
                      </div>

                      {/* English Guidelines */}
                      <div className="space-y-2.5 border-t border-gray-100 pt-4">
                        <span className="text-[9px] text-krushi-muted font-extrabold uppercase tracking-wider block">
                          Agronomist Chemical Guidelines (English)
                        </span>
                        
                        <ol className="space-y-1.5 pl-1.5">
                          {selectedDisease.treatmentEn.map((item, i) => (
                            <li key={i} className="flex gap-2 text-xs text-krushi-muted leading-relaxed items-start">
                              <span className="text-krushi-green font-black font-mono shrink-0">{i + 1}.</span>
                              <span className="flex-1">{item}</span>
                            </li>
                          ))}
                        </ol>
                      </div>

                    </div>
                  )}
                </div>

                {/* 3. PREVENTION ACCORDION */}
                <div className="group">
                  <button
                    onClick={() => toggleAccordion('prevention')}
                    className="w-full px-6 py-4.5 flex justify-between items-center text-left hover:bg-gray-50/80 cursor-pointer transition-colors"
                  >
                    <span className="text-xs sm:text-sm font-extrabold text-slate-800 flex items-center gap-2">
                      <Shield size={16} className="text-krushi-green shrink-0" />
                      <span>নিవారణ చర్యలు <span className="text-gray-400 font-normal">/ Long-Term Prevention</span></span>
                    </span>
                    {accordions.prevention ? <ChevronUp size={16} className="text-krushi-muted" /> : <ChevronDown size={16} className="text-krushi-muted" />}
                  </button>

                  {accordions.prevention && (
                    <div className="px-6 pb-5 pt-2 space-y-4 animate-[slide-down_0.2s_ease-out]">
                      
                      {/* Telugu Bullet Points */}
                      <div className="space-y-2">
                        <ul className="space-y-2">
                          {selectedDisease.preventionTe.map((item, i) => (
                            <li key={i} className="flex gap-2.5 text-telugu text-[13.5px] font-bold text-slate-800 leading-relaxed items-start">
                              <span className="text-krushi-amber text-lg shrink-0 mt-[-2px]">•</span>
                              <span className="flex-1">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* English Bullet Points */}
                      <ul className="space-y-1.5 pl-1.5 border-t border-gray-100 pt-3">
                        {selectedDisease.preventionEn.map((item, i) => (
                          <li key={i} className="flex gap-2 text-xs text-krushi-muted leading-relaxed items-start">
                            <span className="text-krushi-green shrink-0">•</span>
                            <span className="flex-1">{item}</span>
                          </li>
                        ))}
                      </ul>

                    </div>
                  )}
                </div>

                {/* 4. CONSULT EXPERT */}
                <div className="group">
                  <button
                    onClick={() => toggleAccordion('expert')}
                    className="w-full px-6 py-4.5 flex justify-between items-center text-left hover:bg-gray-50/80 cursor-pointer transition-colors"
                  >
                    <span className="text-xs sm:text-sm font-extrabold text-slate-800 flex items-center gap-2">
                      <UserCheck size={16} className="text-krushi-green shrink-0" />
                      <span>నిపుణుని సంప్రదించండి <span className="text-gray-400 font-normal">/ Consult Expert Advisor</span></span>
                    </span>
                    {accordions.expert ? <ChevronUp size={16} className="text-krushi-muted" /> : <ChevronDown size={16} className="text-krushi-muted" />}
                  </button>

                  {accordions.expert && (
                    <div className="px-6 pb-6 pt-2 space-y-4 animate-[slide-down_0.2s_ease-out]">
                      <p className="text-xs sm:text-sm text-krushi-muted leading-relaxed">
                        వ్యవసాయ తెగులు నిర్ధారణ అధికంగా ఉన్నట్లయితే లేదా నివారణ చర్యలు పనిచేయనట్లయితే, జిల్లా వ్యవసాయ విస్తరణ అధికారికి ఈ నివేదిక పంపి ఉచిత సలహా పొందవచ్చు.
                      </p>
                      
                      <div className="flex flex-col sm:flex-row gap-3">
                        <a
                          href={`https://wa.me/919876543210?text=Hi%20Krushi%20AI,%20I%20detected%20${selectedDisease.nameEn}%20(${selectedDisease.nameTe})%20on%20my%20crop%20using%20the%20disease%20scanner.%20Please%20guide%20me.`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-5 py-3 rounded-2xl bg-krushi-green text-white text-xs font-extrabold hover:bg-krushi-green-dark transition-all duration-200 flex items-center justify-center gap-2 shadow-md shadow-krushi-green/20 hover:scale-[1.02] active:scale-98"
                        >
                          <MessageSquare size={15} />
                          <span className="text-telugu font-semibold">వాట్సాప్ ద్వారా నిపుణుడితో మాట్లాడండి</span>
                        </a>

                        <button
                          onClick={() => alert('Agronomist call back has been requested! You will receive a call within 3 hours.')}
                          className="px-5 py-3 rounded-2xl border border-gray-300 text-slate-700 text-xs font-black hover:bg-gray-50 transition-all cursor-pointer hover:border-gray-400 active:scale-98"
                        >
                          📞 Advisory Call Back (ఫోన్ కాల్)
                        </button>
                      </div>
                    </div>
                  )}
                </div>

              </div>

            </div>
          )}

        </div>

        {/* RIGHT COLUMN: COMMON DISEASES & REGIONAL TIPS (4 COLS) */}
        <div className="lg:col-span-4 space-y-8 select-none">
          
          {/* REGIONAL SEASONAL DISEASES TIPS BOX */}
          <div className="bg-white rounded-3xl p-5 border border-gray-150 shadow-card space-y-4">
            <div>
              <span className="text-[10px] text-krushi-amber font-extrabold uppercase tracking-widest block">Regional Threats</span>
              <h3 className="font-extrabold text-sm sm:text-base text-slate-800 text-telugu leading-snug">సాధారణ వ్యాధులు <span className="font-sans text-xs text-krushi-muted block">/ Common Seasonal Diseases</span></h3>
              <p className="text-[10px] text-krushi-muted mt-0.5">ఈ వారంలో మీ చుట్టుపక్కల మండలాల్లో గుర్తించిన తెగుళ్లు</p>
            </div>

            <div className="space-y-3">
              {/* Mini Card 1 */}
              <div
                onClick={() => handleSelectPreset('blast')}
                className="bg-krushi-bg p-3.5 rounded-2xl border border-gray-150/40 flex items-center gap-3 shadow-sm hover:border-krushi-green hover:bg-krushi-green-pale/10 transition-all cursor-pointer group"
              >
                <span className="text-2xl p-1.5 bg-red-50 text-red-500 rounded-xl shrink-0 group-hover:scale-110 transition-transform">🌾</span>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-slate-800 text-telugu truncate leading-tight">వరి అగ్గి తెగులు (Rice Blast)</h4>
                  <span className="text-[9px] text-red-600 font-extrabold block mt-0.5">🔥 High Risk (తీవ్రత ఎక్కువ)</span>
                </div>
              </div>

              {/* Mini Card 2 */}
              <div
                onClick={() => handleSelectPreset('curl')}
                className="bg-krushi-bg p-3.5 rounded-2xl border border-gray-150/40 flex items-center gap-3 shadow-sm hover:border-krushi-green hover:bg-krushi-green-pale/10 transition-all cursor-pointer group"
              >
                <span className="text-2xl p-1.5 bg-amber-50 text-krushi-amber rounded-xl shrink-0 group-hover:scale-110 transition-transform">☁️</span>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-slate-800 text-telugu truncate leading-tight">పత్తి ఆకు ముడుత తెగులు</h4>
                  <span className="text-[9px] text-krushi-amber-dark font-extrabold block mt-0.5">⚠️ Moderate Risk</span>
                </div>
              </div>

              {/* Mini Card 3 */}
              <div
                onClick={() => handleSelectPreset('bph')}
                className="bg-krushi-bg p-3.5 rounded-2xl border border-gray-150/40 flex items-center gap-3 shadow-sm hover:border-krushi-green hover:bg-krushi-green-pale/10 transition-all cursor-pointer group"
              >
                <span className="text-2xl p-1.5 bg-red-50 text-red-500 rounded-xl shrink-0 group-hover:scale-110 transition-transform">🐛</span>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-slate-800 text-telugu truncate leading-tight">గోధుమ మొక్కపేను (BPH)</h4>
                  <span className="text-[9px] text-red-600 font-extrabold block mt-0.5">🔥 High Risk (తీవ్రత ఎక్కువ)</span>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* HISTORY SECTION BELOW (Full Width) */}
      <div className="border-t border-gray-200/60 pt-8 space-y-4">
        <div>
          <span className="px-2.5 py-0.5 rounded-full text-[9px] uppercase tracking-wider font-extrabold bg-gray-100 text-krushi-muted">
            Diagnosed Records
          </span>
          <h2 className="text-lg sm:text-xl font-extrabold text-slate-800 text-telugu leading-snug mt-1">
            గత తెగుళ్ల నిర్ధారణ చరిత్ర <span className="font-sans text-xs text-krushi-muted font-normal block sm:inline sm:ml-1">/ Scans History</span>
          </h2>
          <p className="text-xs text-krushi-muted mt-0.5">గతంలో మీరు చేసిన స్కాన్లు మరియు వాటి చికిత్స స్థితిగతులు</p>
        </div>

        {/* Scan history cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {historyRecords.map((record) => (
            <div
              key={record.key}
              onClick={() => handleSelectPreset(record.key)}
              className="bg-white p-5 rounded-2xl border border-gray-150 hover:border-krushi-green shadow-sm hover:shadow-card hover:-translate-y-0.5 transition-all duration-200 cursor-pointer flex flex-col justify-between space-y-4 group relative overflow-hidden"
            >
              {/* Top info and status */}
              <div className="flex justify-between items-start gap-2">
                <div className="flex items-center gap-3 min-w-0">
                  {/* Mock Image thumbnail / SVG Icon */}
                  <div className="w-11 h-11 rounded-xl bg-krushi-bg flex items-center justify-center shrink-0 text-2xl group-hover:scale-110 transition-transform border border-gray-100 shadow-inner">
                    {record.key === 'blast' ? '🌾' : record.key === 'curl' ? '☁️' : '🐛'}
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm font-black text-slate-800 truncate text-telugu leading-tight">
                      {record.nameTe}
                    </h4>
                    <span className="text-[10px] font-mono text-krushi-muted block mt-0.5">
                      {record.nameEn}
                    </span>
                  </div>
                </div>

                <StatusChip label={record.status} variant={record.chipVariant} pulseDot={record.status === 'Monitoring'} />
              </div>

              {/* Card Footer details */}
              <div className="flex justify-between items-center text-[10px] text-krushi-muted border-t border-gray-50 pt-3.5 font-bold uppercase tracking-wider">
                <span>Date: {record.date}</span>
                <span className="text-krushi-green hover:underline flex items-center gap-1">
                  View Report <ArrowRight size={10} className="group-hover:translate-x-0.5 transition-transform" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
