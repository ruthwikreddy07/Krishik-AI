import React, { useState, useEffect, useRef } from 'react';
import {
  Smartphone,
  MessageSquare,
  CloudSun,
  Camera,
  Coins,
  ArrowRight,
  Shield,
  Volume2,
  Play,
  Pause,
  HelpCircle,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  X,
  VolumeX,
  Volume1,
  Sprout,
  Upload,
  ChevronRight,
  Mic,
  Sun,
  CloudRain,
  Wind,
  Droplets,
  Leaf,
  Users,
  Award,
  Zap,
  Info,
  LayoutGrid,
  TrendingUp as TrendIcon
} from 'lucide-react';

export default function LandingPage({ onLoginSuccess, onShowcaseToggle }) {
  const [lang, setLang] = useState('te'); // 'te' = Telugu, 'en' = English
  const [phone, setPhone] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(60);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // --- 1. Disease Scanner State ---
  const [selectedLeaf, setSelectedLeaf] = useState(null); // 'rice', 'cotton', 'maize'
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);

  // --- 2. Mandi Price Chart State ---
  const [selectedCrop, setSelectedCrop] = useState('rice');

  // --- 3. Weather Voice Advisor State ---
  const [voicePlaying, setVoicePlaying] = useState(false);

  // --- 4. Screenshot Carousel State ---
  const [activeScreenshot, setActiveScreenshot] = useState(0);

  const loginSectionRef = useRef(null);
  const featuresRef = useRef(null);
  const howItWorksRef = useRef(null);
  const screenshotsRef = useRef(null);
  const testimonialsRef = useRef(null);
  const otpInputsRef = useRef([]);

  // Scroll reveal IntersectionObserver hook
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -50px 0px' }
    );

    const elements = document.querySelectorAll('.reveal');
    elements.forEach((el) => observer.observe(el));

    return () => {
      elements.forEach((el) => observer.unobserve(el));
    };
  }, []);

  const scrollToSection = (ref) => {
    ref.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Timer for OTP
  useEffect(() => {
    let interval = null;
    if (otpSent && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [otpSent, timer]);
  const handleSendOTP = (e) => {
    e.preventDefault();
    if (phone.length !== 10) {
      setError(lang === 'te' ? 'దయచేసి సరైన 10 అంకెల మొబైల్ నంబర్ నమోదు చేయండి' : 'Please enter a valid 10-digit mobile number');
      return;
    }
    setError('');
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      setOtpSent(true);
      setTimer(60);
      setTimeout(() => {
        otpInputsRef.current[0]?.focus();
      }, 100);
    }, 1000);
  };

  const handleOtpChange = (value, index) => {
    const cleanVal = value.replace(/\D/g, '');
    const newOtp = [...otp];
    newOtp[index] = cleanVal.slice(-1);
    setOtp(newOtp);

    if (cleanVal && index < 5) {
      otpInputsRef.current[index + 1]?.focus();
    }

    if (newOtp.every(val => val !== '')) {
      verifyOTP(newOtp.join(''));
    }
  };

  const handleOtpKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const newOtp = [...otp];
      newOtp[index - 1] = '';
      setOtp(newOtp);
      otpInputsRef.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pastedData.length === 6) {
      const newOtp = pastedData.split('');
      setOtp(newOtp);
      verifyOTP(pastedData);
    }
  };

  const verifyOTP = (code) => {
    if (code !== '123456') {
      setError(lang === 'te' ? 'తప్పు ఓటిపి కోడ్. దయచేసి మళ్ళీ ప్రయత్నించండి. (డెమో కోడ్: 123456)' : 'Invalid OTP code. Please try again. (Demo code: 123456)');
      return;
    }
    setError('');
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      setTimeout(() => {
        onLoginSuccess();
      }, 1200);
    }, 1000);
  };

  const handleResendOTP = () => {
    if (timer === 0) {
      setTimer(60);
      setOtp(['', '', '', '', '', '']);
      setError('');
      otpInputsRef.current[0]?.focus();
    }
  };

  // Leaf Diagnostics Data
  const leafData = {
    rice: {
      nameEn: 'Rice Blast',
      nameTe: 'వరి అగ్గి తెగులు',
      accuracy: '98.4%',
      remedyEn: 'Spray Tricyclazole 75 WP @ 0.6g/L.',
      remedyTe: 'ట్రైసైక్లాజోల్ 75 WP 0.6g/L పిచికారీ చేయండి.',
      svgColor: '#22c55e',
      spots: [
        { cx: 80, cy: 90, rx: 12, ry: 6, rot: -30 },
        { cx: 120, cy: 140, rx: 16, ry: 7, rot: 15 },
        { cx: 95, cy: 190, rx: 10, ry: 5, rot: -45 }
      ]
    },
    cotton: {
      nameEn: 'Cotton Leaf Curl',
      nameTe: 'పత్తి ఆకు ముడుత తెగులు',
      accuracy: '96.1%',
      remedyEn: 'Spray Diafenthiuron 50 WP @ 1.2g/L.',
      remedyTe: 'డయాఫెంథియురాన్ 50 WP 1.2g/L పిచికారీ చేయండి.',
      svgColor: '#16a34a',
      spots: [
        { cx: 70, cy: 120, rx: 18, ry: 10, rot: 40 },
        { cx: 130, cy: 90, rx: 14, ry: 8, rot: -20 },
        { cx: 110, cy: 170, rx: 20, ry: 12, rot: 10 }
      ]
    },
    maize: {
      nameEn: 'Maize Rust',
      nameTe: 'మొక్కజొన్న తుప్పు తెగులు',
      accuracy: '97.8%',
      remedyEn: 'Spray Mancozeb 75 WP @ 2.5g/L.',
      remedyTe: 'మాంకోజెబ్ 75 WP 2.5g/L పిచికారీ చేయండి.',
      svgColor: '#eab308',
      spots: [
        { cx: 100, cy: 70, rx: 8, ry: 8, rot: 0 },
        { cx: 85, cy: 130, rx: 6, ry: 6, rot: 10 },
        { cx: 120, cy: 160, rx: 9, ry: 9, rot: -10 },
        { cx: 90, cy: 210, rx: 7, ry: 7, rot: 25 }
      ]
    }
  };

  const handleSelectLeaf = (type) => {
    if (scanning) return;
    setSelectedLeaf(type);
    setScanning(true);
    setScanResult(null);

    setTimeout(() => {
      setScanning(false);
      setScanResult(leafData[type]);
    }, 1800);
  };

  const cropPrices = {
    rice: {
      nameTe: 'వరి (Rice)',
      nameEn: 'Rice (Grade A)',
      mandi: 'Warangal Mandi',
      current: 2280,
      change: '+₹65 (2.9%)',
      trend: 'up',
      history: [2150, 2175, 2160, 2200, 2210, 2245, 2280],
      dates: ['11 Jun', '12 Jun', '13 Jun', '14 Jun', '15 Jun', '16 Jun', '17 Jun']
    },
    cotton: {
      nameTe: 'పత్తి (Cotton)',
      nameEn: 'Cotton (Kapya)',
      mandi: 'Khammam Mandi',
      current: 7420,
      change: '-₹110 (-1.5%)',
      trend: 'down',
      history: [7650, 7600, 7550, 7500, 7460, 7480, 7420],
      dates: ['11 Jun', '12 Jun', '13 Jun', '14 Jun', '15 Jun', '16 Jun', '17 Jun']
    },
    maize: {
      nameTe: 'మొక్కజొన్న (Maize)',
      nameEn: 'Maize (Hybrid)',
      mandi: 'Nizamabad Mandi',
      current: 2110,
      change: '+₹15 (0.7%)',
      trend: 'up',
      history: [2080, 2075, 2090, 2085, 2100, 2095, 2110],
      dates: ['11 Jun', '12 Jun', '13 Jun', '14 Jun', '15 Jun', '16 Jun', '17 Jun']
    },
    groundnut: {
      nameTe: 'వేరుశనగ (Groundnut)',
      nameEn: 'Groundnut (Shell)',
      mandi: 'Suryapet Mandi',
      current: 6350,
      change: '₹0 (Stable)',
      trend: 'stable',
      history: [6350, 6300, 6320, 6350, 6350, 6340, 6350],
      dates: ['11 Jun', '12 Jun', '13 Jun', '14 Jun', '15 Jun', '16 Jun', '17 Jun']
    }
  };

  const getSvgPath = (history) => {
    const min = Math.min(...history);
    const max = Math.max(...history);
    const range = max - min || 1;
    const points = history.map((val, idx) => {
      const x = 40 + (idx * 320) / (history.length - 1);
      const y = 120 - ((val - min) * 100) / range;
      return { x, y };
    });

    let pathD = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      pathD += ` L ${points[i].x} ${points[i].y}`;
    }

    let areaD = `${pathD} L ${points[points.length - 1].x} 135 L ${points[0].x} 135 Z`;
    return { pathD, areaD, points };
  };

  const activeCropData = cropPrices[selectedCrop];
  const { pathD, areaD, points } = getSvgPath(activeCropData.history);

  const screenshotData = [
    {
      titleEn: 'AI Crop disease diagnostics',
      titleTe: 'తెగుళ్ల నిర్ధారణ స్కానర్',
      descEn: 'Scan and identify crop leaf problems in 2 seconds with recommended chemical and biological countermeasures.',
      descTe: 'కేవలం 2 సెకన్లలో ఆకు తెగులును గుర్తించి వాటి నివారణకు సరైన మందులను సూచించే కృత్రిమ మేధస్సు స్కానర్.',
      icon: <Camera className="text-krushi-green-light" size={24} />
    },
    {
      titleEn: 'Mandi intelligence & price analytics',
      titleTe: 'మార్కెట్ ధరలు & ధరల విశ్లేషణ',
      descEn: 'View historical commodity valuation curves, daily highs, lows, and machine-learning price trend alerts.',
      descTe: 'తెలంగాణలోని వివిధ మార్కెట్ల పంట ధరల విశ్లేషణ, 7 రోజుల ట్రెండ్‌లు మరియు ధరల మార్పు అంచనాలు.',
      icon: <Coins className="text-krushi-green-light" size={24} />
    },
    {
      titleEn: 'Agri-Weather voice advising',
      titleTe: 'వాతావరణ వాయిస్ అడ్వైజర్',
      descEn: 'Listen to location-targeted agricultural instructions in Noto Telugu. Dynamic audio advisory prevents loss.',
      descTe: 'మీ గ్రామానికి సరిపోయే వాతావరణ హెచ్చరికలు మరియు పంట సలహాలను తెలుగులో శ్రవణ రూపంలో వినండి.',
      icon: <Volume2 className="text-krushi-green-light" size={24} />
    },
    {
      titleEn: 'Comprehensive farmer dashboard',
      titleTe: 'సమగ్ర రైతు డాష్‌బోర్డ్',
      descEn: 'Consolidated overview of soil health data, recent scans, active government program eligibility status.',
      descTe: 'నేల సారం, పంటల స్కాన్లు, క్రియాశీల ప్రభుత్వ పథకాల అర్హత వివరాలు ఒకే చోట చూపించే డాష్‌బోర్డ్.',
      icon: <Smartphone className="text-krushi-green-light" size={24} />
    }
  ];

  return (
    <div className="min-h-screen text-slate-800 font-sans overflow-x-hidden relative selection:bg-krushi-green selection:text-white bg-[#F8FAFC] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(15,110,86,0.06),rgba(255,255,255,0))] grain-overlay">
      
      {/* Glowing Ambient Blobs for Premium SaaS look */}
      <div className="absolute top-[-5%] left-[-10%] w-[60vw] h-[60vw] max-w-[600px] bg-krushi-green-pale/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-[20%] right-[-10%] w-[50vw] h-[50vw] max-w-[500px] bg-krushi-amber-light/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute top-[50%] left-[-5%] w-[40vw] h-[40vw] max-w-[400px] bg-sky-500/5 rounded-full blur-[100px] pointer-events-none" />

      {/* 1. NAVBAR */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-slate-200/50 transition-all duration-300 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between h-14">
            {/* Logo */}
            <div className="flex items-center gap-2.5 cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-transform duration-200">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-krushi-green to-krushi-green-light flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
                <Sprout size={18} className="animate-[pulse-glow_3s_infinite]" />
              </div>
              <div className="flex flex-col">
                <span className="text-base font-extrabold tracking-wider text-slate-900 flex items-center gap-1 leading-none">
                  కృషి <span className="text-krushi-green-light">AI</span>
                </span>
                <span className="text-[8px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
                  Farmer Assistant
                </span>
              </div>
            </div>

            {/* Links */}
            <div className="hidden lg:flex items-center gap-6 font-semibold text-sm text-slate-500">
              <button onClick={() => scrollToSection(featuresRef)} className="hover:text-krushi-green-light hover:scale-105 active:scale-95 transition-all cursor-pointer">Demos</button>
              <button onClick={() => scrollToSection(howItWorksRef)} className="hover:text-krushi-green-light hover:scale-105 active:scale-95 transition-all cursor-pointer">How it Works</button>
              <button onClick={() => scrollToSection(screenshotsRef)} className="hover:text-krushi-green-light hover:scale-105 active:scale-95 transition-all cursor-pointer">Screenshots</button>
              <button onClick={() => scrollToSection(testimonialsRef)} className="hover:text-krushi-green-light hover:scale-105 active:scale-95 transition-all cursor-pointer">Testimonials</button>
              {onShowcaseToggle && (
                <button
                  onClick={onShowcaseToggle}
                  className="flex items-center gap-1 px-3.5 py-1.5 rounded-lg border border-slate-200 hover:border-krushi-green-light text-krushi-green-light hover:bg-krushi-green-pale/10 text-xs font-bold transition-all hover:scale-105 active:scale-95 cursor-pointer"
                >
                  <LayoutGrid size={13} />
                  <span>UI Showcase</span>
                </button>
              )}
            </div>

            {/* Right controls */}
            <div className="flex items-center gap-3">
              <div className="flex bg-slate-100/80 backdrop-blur-md p-0.5 rounded-full border border-slate-200/60 shadow-inner">
                <button
                  onClick={() => setLang('te')}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition-all duration-200 hover:scale-105 cursor-pointer ${
                    lang === 'te' ? 'bg-krushi-green text-white shadow-md' : 'text-slate-600 hover:text-slate-800'
                  }`}
                >
                  తెలుగు
                </button>
                <button
                  onClick={() => setLang('en')}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition-all duration-200 hover:scale-105 cursor-pointer ${
                    lang === 'en' ? 'bg-krushi-green text-white shadow-md' : 'text-slate-600 hover:text-slate-800'
                  }`}
                >
                  EN
                </button>
              </div>

              <button
                onClick={() => scrollToSection(loginSectionRef)}
                className="bg-krushi-green text-white text-xs px-4 py-2 rounded-lg font-bold hover:bg-krushi-green-dark hover:scale-105 active:scale-95 transition-all duration-300 shadow-md shadow-emerald-500/10 border border-krushi-green/25 cursor-pointer"
              >
                {lang === 'te' ? 'లాగిన్' : 'OTP Portal'}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* 2. HERO SECTION */}
      <section className="relative py-10 lg:py-16 px-4 lg:px-8 max-w-7xl mx-auto overflow-hidden reveal">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
          
          {/* Hero Left */}
          <div className="lg:col-span-7 space-y-5 text-left z-10">
            {/* Faint Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-krushi-green-pale/10 via-transparent to-transparent pointer-events-none -z-10 animate-pulse-glow" />

            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-krushi-green-pale border border-krushi-green-light/20 text-krushi-green text-[11px] font-extrabold tracking-wider uppercase shadow-sm animate-pulse-glow">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-krushi-green-light opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-krushi-green-light" />
              </span>
              <span>
                {lang === 'te' ? 'తెలంగాణ అగ్రిటెక్ ప్లాట్‌ఫార్మ్' : 'Telangana Agritech Platform'}
              </span>
            </div>

            <div className="space-y-3">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-[1.1] font-telugu">
                {lang === 'te' ? (
                  <>
                    రైతుకు <span className="text-krushi-green font-bold">వర ప్రసాదం</span>
                    <br />కృషి AI అసిస్టెంట్
                  </>
                ) : (
                  <>
                    Autonomous <span className="text-krushi-green font-bold">AI Assistant</span>
                    <br />for Modern Farmers
                  </>
                )}
              </h1>
              <p className="text-sm sm:text-base text-slate-500 leading-relaxed font-medium max-w-xl font-telugu">
                {lang === 'te' 
                  ? 'మొబైల్ ఫోటో ద్వారా పంట తెగుళ్ల గుర్తింపు, మండల వ్యాప్త మార్కెట్ ధరల విశ్లేషణ, తెలుగు వాతావరణ సలహాలు అందించే స్మార్ట్ వ్యవసాయ వేదిక.'
                  : 'Empowering regional farming ecosystems with instant crop disease detection, live market valuations, and voice-assisted agricultural intelligence.'
                }
              </p>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
              <button
                onClick={() => scrollToSection(loginSectionRef)}
                className="bg-krushi-green text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-krushi-green-dark transition-all duration-300 shadow-[0_8px_20px_rgba(15,110,86,0.15)] flex items-center justify-center gap-2 cursor-pointer group hover:scale-105 active:scale-95"
              >
                <Smartphone size={18} />
                <span className="font-telugu">
                  {lang === 'te' ? 'వెంటనే లాగిన్ అవ్వండి' : 'Secure OTP Login'}
                </span>
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </button>

              <button
                onClick={() => scrollToSection(featuresRef)}
                className="bg-white/70 border border-slate-200/80 backdrop-blur-md text-slate-600 px-6 py-3 rounded-xl font-bold text-sm hover:bg-slate-50/90 transition-all duration-300 flex items-center justify-center gap-2 shadow-sm cursor-pointer hover:scale-105 active:scale-95"
              >
                <span className="font-telugu text-sm">{lang === 'te' ? 'లైవ్ టూల్స్ పరీక్షించండి' : 'Try Live Demos'}</span>
              </button>
            </div>

            {/* Grid stats with vertical line separators */}
            <div className="grid grid-cols-3 gap-4 pt-5 border-t border-slate-200/80 max-w-sm">
              <div className="space-y-0.5">
                <div className="text-2xl font-black text-krushi-green">98.4%</div>
                <div className="text-[9px] text-slate-400 font-extrabold uppercase tracking-widest">
                  {lang === 'te' ? 'ఖచ్చితత్వం' : 'Accuracy'}
                </div>
              </div>
              <div className="border-l border-slate-200 pl-4 space-y-0.5">
                <div className="text-2xl font-black text-slate-800">50K+</div>
                <div className="text-[9px] text-slate-400 font-extrabold uppercase tracking-widest">
                  {lang === 'te' ? 'రైతులు' : 'Farmers'}
                </div>
              </div>
              <div className="border-l border-slate-200 pl-4 space-y-0.5">
                <div className="text-2xl font-black text-slate-800">100+</div>
                <div className="text-[9px] text-slate-400 font-extrabold uppercase tracking-widest">
                  {lang === 'te' ? 'మార్కెట్లు' : 'Mandis'}
                </div>
              </div>
            </div>
          </div>

          {/* Hero Right: Modern SaaS style dashboard mockup */}
          <div className="lg:col-span-5 relative flex justify-center items-center z-10">
            {/* Backdrop light green shadow circle */}
            <div className="absolute w-56 h-56 bg-krushi-green-light/10 rounded-full blur-3xl" />
            
            {/* Dashboard Mockup card wrapper */}
            <div className="relative z-10 w-full max-w-[380px] glass-panel rounded-2xl p-4 border-white/60 shadow-[0_16px_40px_rgba(0,0,0,0.08)] space-y-4 animate-float-1">
              
              {/* Window Controls header */}
              <div className="flex justify-between items-center border-b border-slate-150/40 pb-3">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-red-400" />
                  <span className="w-3 h-3 rounded-full bg-yellow-400" />
                  <span className="w-3 h-3 rounded-full bg-green-400" />
                </div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Krushi AI Diagnostics</span>
                <span className="w-2.5 h-2.5 rounded bg-krushi-green" />
              </div>

              {/* Crop Scanner Card inside screen */}
              <div className="bg-white/50 backdrop-blur-md border border-white/60 rounded-2xl p-4 space-y-4 shadow-sm">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-600 font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <Camera size={14} className="text-krushi-green-light" /> Scan ID: #87920
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-krushi-green-pale text-krushi-green font-extrabold text-[10px]">DIAGNOSED</span>
                </div>
                
                {/* Simulated diagnostic scan image (Plant Leaf) */}
                <div className="relative aspect-video rounded-xl bg-slate-100/50 border border-slate-200/50 overflow-hidden flex items-center justify-center">
                  {/* Glowing diagnostic overlay */}
                  <div className="absolute inset-0 border-2 border-krushi-green-light/20 rounded-xl" />
                  <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-krushi-green shadow-[0_0_10px_rgba(15,110,86,1)] animate-laser-scan" />
                  <svg viewBox="0 0 100 100" className="w-16 h-16 fill-krushi-green/25 text-krushi-green">
                    <path d="M50 0 C 15 25, 20 75, 50 100 C 80 75, 85 25, 50 0 Z" stroke="currentColor" strokeWidth="2.5" />
                  </svg>
                </div>
                
                <div className="space-y-1">
                  <div className="text-xs text-slate-400 font-extrabold uppercase tracking-wide">Analysis Result:</div>
                  <div className="text-sm font-extrabold text-slate-800 font-telugu">Rice Blast / వరి అగ్గి తెగులు (98% Match)</div>
                </div>
              </div>

              {/* Floating Mandi Price Ticker Widget */}
              <div className="absolute left-0 -bottom-8 z-20 glass-panel border-white/85 p-3 rounded-xl shadow-xl flex items-center gap-2.5 animate-float-2 max-w-[180px] hover:scale-105 transition-transform duration-300">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-krushi-amber/20 to-krushi-amber-dark/5 text-krushi-amber flex items-center justify-center shadow-inner border border-krushi-amber/10">
                  <Coins size={18} />
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 font-extrabold uppercase block leading-none">WARANGAL MARKET</span>
                  <span className="text-xs font-bold text-slate-800 block mt-0.5 leading-none">Rice: ₹2,280/q</span>
                  <span className="text-[9px] text-emerald-600 font-bold mt-0.5 block leading-none">▲ +2.9%</span>
                </div>
              </div>

              {/* Floating Voice Advisory Widget */}
              <div className="absolute right-0 top-8 z-20 glass-panel border-white/85 p-3 rounded-xl shadow-xl flex items-center gap-2.5 animate-float-3 max-w-[180px] hover:scale-105 transition-transform duration-300">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-500/20 to-blue-600/5 text-sky-600 flex items-center justify-center shadow-inner border border-sky-500/10">
                  <Volume2 size={18} />
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 font-extrabold uppercase block leading-none">TELUGU ADVISORY</span>
                  <span className="text-xs font-bold text-slate-800 block mt-0.5 leading-none font-telugu">వాయిస్ బ్రాడ్‌కాస్ట్</span>
                  <span className="text-[9px] text-[#16A34A] font-bold mt-0.5 block leading-none">Ready to Play</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. LIVE INTERACTIVE DEMOS */}
      <section ref={featuresRef} className="py-14 bg-white border-y border-slate-200/50 relative z-10 reveal">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 space-y-10">
          <div className="text-center space-y-4">
            <span className="text-xs uppercase tracking-[0.25em] font-black text-[#16A34A] block">
              లైవ్ వ్యవసాయ పరికరాలు / Interactive Sandbox
            </span>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 leading-relaxed font-telugu">
              {lang === 'te' ? 'కృషి AI టూల్స్ పనితీరు' : 'Experience Our AI Core Live'}
            </h2>
            <p className="text-base text-slate-500 max-w-2xl mx-auto font-medium font-telugu">
              {lang === 'te'
                ? 'కింది మా టూల్స్ సహాయంతో పంట నివారణ, ధరల అంచనా మరియు వాతావరణ సమాచారాన్ని ఇంటరాక్టివ్‌గా పరీక్షించండి.'
                : 'Interact directly with functional simulations of our agricultural models, charts, and voice advisor.'
              }
            </p>
          </div>

          {/* Demos grid wrapper with larger gap and clean styling */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* DEMO 1: Computer Vision Leaf scanner */}
            <div className="glass-panel border-white/60 rounded-2xl p-5 sm:p-6 flex flex-col justify-between shadow-lg hover:shadow-xl hover:scale-[1.01] hover:border-emerald-500/20 transition-all duration-300">
              <div className="space-y-5">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#16A34A]/20 to-emerald-600/5 text-[#16A34A] flex items-center justify-center shadow-inner border border-emerald-500/10">
                      <Camera size={24} />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-slate-900 text-base leading-tight font-telugu">
                        {lang === 'te' ? 'ఆకు తెగులు గుర్తింపు స్కానర్' : 'AI Disease Classifier'}
                      </h3>
                      <p className="text-[10px] text-[#16A34A] font-bold tracking-wider uppercase mt-0.5">Real-time Computer Vision</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded bg-[#16A34A]/10 text-[#15803D] text-[9px] font-extrabold uppercase tracking-wide">
                    TEST BENCH
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-medium font-telugu">
                  {lang === 'te'
                    ? 'క్రింద పేర్కొన్న ఒక పంట ఆకును ఎంపిక చేయండి. స్కాన్ చేయడం ద్వారా AI రోగనిర్ధారణ సలహా ఇస్తుంది.'
                    : 'Select an infected crop type below to run our diagnostic vision analyzer.'
                  }
                </p>

                {/* Simulated scanner camera viewport */}
                <div className="relative aspect-video rounded-2xl bg-slate-50/50 border border-slate-200/60 backdrop-blur-md overflow-hidden flex flex-col items-center justify-center shadow-inner min-h-[220px]">
                  {selectedLeaf ? (
                    <>
                      <div className="relative w-24 h-24 flex items-center justify-center">
                        <svg viewBox="0 0 100 100" className="w-full h-full fill-current transition-all duration-300 animate-scale-in" style={{ color: leafData[selectedLeaf].svgColor }}>
                          <path d="M50 0 C 15 25, 20 75, 50 100 C 80 75, 85 25, 50 0 Z" />
                          <path d="M50 0 L 50 100" stroke="#15803d" strokeWidth="2.5" opacity="0.3" />
                        </svg>
                        {/* Leaf spots */}
                        <div className="absolute inset-0">
                          <svg viewBox="0 0 200 200" className="w-full h-full fill-amber-800 opacity-80">
                            {leafData[selectedLeaf].spots.map((spot, i) => (
                              <ellipse
                                key={i}
                                cx={spot.cx}
                                cy={spot.cy}
                                rx={spot.rx}
                                ry={spot.ry}
                                transform={`rotate(${spot.rot} ${spot.cx} ${spot.cy})`}
                                stroke="#78350f"
                                strokeWidth="1.5"
                              />
                            ))}
                          </svg>
                        </div>
                      </div>

                      {scanning && (
                        <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-[#16A34A] to-transparent shadow-[0_0_15px_rgba(22,163,74,1)] animate-laser-scan z-10" />
                      )}

                      {scanning && (
                        <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center flex-col gap-2.5">
                          <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin" />
                          <span className="text-[10px] text-white font-bold tracking-widest uppercase">
                            Analyzing...
                          </span>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center p-6 space-y-2 text-slate-400">
                      <Upload size={32} className="mx-auto text-slate-300 animate-bounce" />
                      <p className="text-[11px] font-bold tracking-wider uppercase font-telugu">
                        {lang === 'te' ? 'పరీక్షించుటకు ఆకును ఎంపిక చేయండి' : 'Choose Leaf to Diagnose'}
                      </p>
                    </div>
                  )}
                </div>

                {/* Diagnostics analysis card */}
                {scanResult && !scanning && (
                  <div className="bg-white/70 backdrop-blur-md border border-slate-200/60 p-4.5 rounded-2xl animate-[fade-in_0.3s_ease-out] space-y-2 shadow-sm">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wide block">DIAGNOSED:</span>
                        <h4 className="text-base font-extrabold text-[#15803D] font-telugu leading-snug">
                          {scanResult.nameEn} <span className="text-xs font-semibold text-slate-500">({scanResult.nameTe})</span>
                        </h4>
                      </div>
                      <div className="text-right">
                        <span className="text-[9px] text-slate-400 font-extrabold block">CONFIDENCE:</span>
                        <span className="text-base font-mono font-black text-[#16A34A]">{scanResult.accuracy}</span>
                      </div>
                    </div>
                    <div className="border-t border-slate-100 pt-2 text-xs leading-relaxed text-slate-600 font-telugu">
                      <strong className="text-slate-800">💊 Recommended Action:</strong> {lang === 'te' ? scanResult.remedyTe : scanResult.remedyEn}
                    </div>
                  </div>
                )}
              </div>

              {/* Selector options */}
              <div className="space-y-2 pt-5 border-t border-slate-200/60 mt-6">
                <span className="text-[11px] text-slate-400 font-extrabold uppercase tracking-wide block font-telugu">
                  Select sample crops:
                </span>
                <div className="grid grid-cols-3 gap-2.5">
                  <button
                    onClick={() => handleSelectLeaf('rice')}
                    disabled={scanning}
                    className={`py-2 px-1 rounded-xl border text-center transition-all duration-300 cursor-pointer flex flex-col items-center gap-0.5 ${
                      selectedLeaf === 'rice'
                        ? 'border-[#16A34A] bg-gradient-to-b from-emerald-500/10 to-emerald-500/5 shadow-md font-bold scale-105 ring-2 ring-emerald-500/20'
                        : 'border-slate-200/80 bg-white/60 hover:bg-white hover:scale-102 hover:shadow-sm'
                    }`}
                  >
                    <span className="text-base">🌾</span>
                    <span className="text-[10px] font-bold text-slate-700 font-telugu">వరి (Rice)</span>
                  </button>
                  <button
                    onClick={() => handleSelectLeaf('cotton')}
                    disabled={scanning}
                    className={`py-2 px-1 rounded-xl border text-center transition-all duration-300 cursor-pointer flex flex-col items-center gap-0.5 ${
                      selectedLeaf === 'cotton'
                        ? 'border-[#16A34A] bg-gradient-to-b from-emerald-500/10 to-emerald-500/5 shadow-md font-bold scale-105 ring-2 ring-emerald-500/20'
                        : 'border-slate-200/80 bg-white/60 hover:bg-white hover:scale-102 hover:shadow-sm'
                    }`}
                  >
                    <span className="text-base">☁️</span>
                    <span className="text-[10px] font-bold text-slate-700 font-telugu">పత్తి (Cotton)</span>
                  </button>
                  <button
                    onClick={() => handleSelectLeaf('maize')}
                    disabled={scanning}
                    className={`py-2 px-1 rounded-xl border text-center transition-all duration-300 cursor-pointer flex flex-col items-center gap-0.5 ${
                      selectedLeaf === 'maize'
                        ? 'border-[#16A34A] bg-gradient-to-b from-emerald-500/10 to-emerald-500/5 shadow-md font-bold scale-105 ring-2 ring-emerald-500/20'
                        : 'border-slate-200/80 bg-white/60 hover:bg-white hover:scale-102 hover:shadow-sm'
                    }`}
                  >
                    <span className="text-base">🌽</span>
                    <span className="text-[10px] font-bold text-slate-700 font-telugu">మొక్కజొన్న</span>
                  </button>
                </div>
              </div>
            </div>

            {/* DEMO 2: Live Mandi Pricing */}
            <div className="glass-panel border-white/60 rounded-2xl p-5 sm:p-6 flex flex-col justify-between shadow-lg hover:shadow-xl hover:scale-[1.01] hover:border-amber-500/20 transition-all duration-300">
              <div className="space-y-5">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-600/5 text-amber-600 flex items-center justify-center shadow-inner border border-amber-500/10">
                      <Coins size={24} />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-slate-900 text-base leading-tight font-telugu">
                        {lang === 'te' ? 'మార్కెట్ ధరల విశ్లేషణ' : 'Mandi Valuations'}
                      </h3>
                      <p className="text-[10px] text-amber-600 font-bold tracking-wider uppercase mt-0.5">Commodity price trends</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded bg-amber-500/10 text-amber-700 text-[9px] font-extrabold uppercase tracking-wide">
                    LIVE DATA
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-medium font-telugu">
                  {lang === 'te'
                    ? 'వివిధ పంటల ధరల వ్యత్యాసాలను మరియు మార్కెట్ ట్రెండ్స్ క్రింద పరీక్షించండి.'
                    : 'Track agricultural commodity valuations. Select a crop to chart historic mandi prices.'
                  }
                </p>

                {/* Price Details banner */}
                <div className="bg-white/70 backdrop-blur-md border border-slate-200/60 p-4 rounded-xl flex justify-between items-center shadow-inner">
                  <div>
                    <span className="text-[9px] text-slate-400 block font-bold uppercase tracking-wider mb-0.5">{activeCropData.mandi}</span>
                    <h4 className="text-sm font-extrabold text-slate-800 font-telugu leading-tight">{activeCropData.nameEn} <span className="text-xs font-normal text-slate-500">({activeCropData.nameTe.split(' ')[0]})</span></h4>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-black font-mono text-slate-900 leading-none">₹{activeCropData.current.toLocaleString()}</span>
                    <span className={`text-[10px] font-bold block mt-0.5 leading-none ${activeCropData.trend === 'up' ? 'text-emerald-600' : activeCropData.trend === 'down' ? 'text-red-600' : 'text-amber-600'}`}>
                      {activeCropData.trend === 'up' ? '▲' : activeCropData.trend === 'down' ? '▼' : '◆'} {activeCropData.change}
                    </span>
                  </div>
                </div>

                {/* SVG Trend Graph */}
                <div className="relative bg-white/70 backdrop-blur-md rounded-xl p-4 border border-slate-200/60 shadow-inner">
                  <svg viewBox="0 0 400 140" className="w-full h-auto overflow-visible">
                    <defs>
                      <linearGradient id="price-grad-light-2" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#16A34A" stopOpacity="0.2" />
                        <stop offset="100%" stopColor="#16A34A" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    
                    <line x1="40" y1="15" x2="360" y2="15" stroke="rgba(0,0,0,0.03)" strokeWidth="1" strokeDasharray="3 3" />
                    <line x1="40" y1="65" x2="360" y2="65" stroke="rgba(0,0,0,0.03)" strokeWidth="1" strokeDasharray="3 3" />
                    <line x1="40" y1="115" x2="360" y2="115" stroke="rgba(0,0,0,0.08)" strokeWidth="1" />

                    <path d={areaD} fill="url(#price-grad-light-2)" className="transition-all duration-300" />
                    <path d={pathD} fill="none" stroke="#16A34A" strokeWidth="3" strokeLinecap="round" className="transition-all duration-300" />

                    {points.map((p, idx) => (
                      <circle
                        key={idx}
                        cx={p.x}
                        cy={p.y}
                        r="3.5"
                        fill="#FFFFFF"
                        stroke="#16A34A"
                        strokeWidth="2"
                      />
                    ))}

                    {activeCropData.dates.map((d, idx) => (
                      <text
                        key={idx}
                        x={40 + (idx * 320) / (activeCropData.dates.length - 1)}
                        y="134"
                        textAnchor="middle"
                        className="text-[8px] fill-slate-400 font-bold"
                      >
                        {d}
                      </text>
                    ))}
                  </svg>
                </div>
              </div>

              {/* Crop selectors */}
              <div className="space-y-2 pt-5 border-t border-slate-200/60 mt-6">
                <span className="text-[11px] text-slate-400 font-extrabold uppercase tracking-wide block font-telugu">
                  Select crop commodity:
                </span>
                <div className="grid grid-cols-4 gap-2">
                  {Object.keys(cropPrices).map((crop) => (
                    <button
                      key={crop}
                      onClick={() => setSelectedCrop(crop)}
                      className={`py-2 px-0.5 rounded-xl border text-center text-[10px] sm:text-[11px] font-bold border-slate-200 transition-all duration-300 cursor-pointer font-telugu ${
                        selectedCrop === crop
                          ? 'bg-[#16A34A] border-[#16A34A] text-white shadow-md scale-105'
                          : 'bg-white/60 hover:bg-white text-slate-700 hover:scale-102 hover:shadow-xs'
                      }`}
                    >
                      {cropPrices[crop].nameTe.split(' ')[0]}
                    </button>
                  ))}
                </div>
              </div>
            </div>

          </div>

          {/* DEMO 3: Localized Speech Forecast */}
          <div className="glass-panel border-white/60 rounded-2xl p-5 sm:p-6 max-w-4xl mx-auto space-y-5 shadow-lg hover:shadow-xl hover:scale-[1.01] hover:border-sky-500/20 transition-all duration-300">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-200/60 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500/20 to-blue-600/5 text-sky-600 flex items-center justify-center shadow-inner border border-sky-500/10">
                  <CloudSun size={20} />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base leading-tight font-telugu">
                    {lang === 'te' ? 'గ్రామ స్థాయి వాతావరణ సమాచార సేవ' : 'Voice-Assisted Speech Advisory'}
                  </h3>
                  <p className="text-[10px] text-sky-600 font-bold tracking-wider uppercase mt-0.5">Village Level Broadcasts</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded bg-sky-500/10 text-sky-700 text-[9px] font-extrabold uppercase tracking-wide">
                BROADCAST UNIT
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
              {/* Climate stats */}
              <div className="md:col-span-5 bg-gradient-to-br from-sky-500/10 to-blue-500/5 border border-slate-200/60 p-6 rounded-2xl flex flex-col items-center text-center space-y-2 shadow-inner">
                <span className="text-4xl">🌦️</span>
                <div>
                  <h4 className="text-sm font-extrabold text-slate-800 font-telugu">గజ్వేల్, సిద్దిపేట జిల్లా</h4>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Gazwel siddipet advisory</p>
                </div>
                <div className="text-3xl font-black text-slate-900 font-mono">28.4°C</div>
                <div className="flex gap-4 text-[11px] font-semibold text-slate-500">
                  <span className="flex items-center gap-1.5"><Droplets size={12} className="text-sky-500" /> 82%</span>
                  <span className="flex items-center gap-1.5"><Wind size={12} className="text-sky-500" /> 16 km/h</span>
                </div>
              </div>

              {/* Player UI */}
              <div className="md:col-span-7 space-y-4">
                <div className="bg-white/60 backdrop-blur-md p-4.5 rounded-2xl border border-slate-200/60 space-y-2.5 shadow-inner">
                  <span className="text-[9px] text-[#16A34A] font-extrabold uppercase tracking-widest flex items-center gap-1">
                    <Mic size={12} /> AI Speech advisory (Noto Telugu)
                  </span>
                  <p className="text-sm font-bold text-slate-800 font-telugu leading-relaxed">
                    "రాబోవు 2 రోజుల్లో గజ్వేల్ పరిసర ప్రాంతాల్లో తేలికపాటి నుండి మోస్తరు వర్ష సూచన ఉంది. వరి పంట వేసిన రైతులు ఎరువుల దరఖాస్తును వాయిదా వేసుకోవాలి."
                  </p>
                  <p className="text-[11px] text-slate-400 italic">
                    "Light rain forecasted in 2 days. Paddy farmers are advised to delay chemical fertilizer application until dry conditions return."
                  </p>
                </div>

                <div className="flex items-center gap-4 bg-white/70 backdrop-blur-md p-2.5 rounded-full border border-slate-200/60 shadow-md">
                  <button
                    onClick={() => setVoicePlaying(!voicePlaying)}
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-white cursor-pointer transition-all duration-200 shrink-0 hover:scale-105 active:scale-95 ${
                      voicePlaying ? 'bg-amber-500 shadow-md shadow-amber-500/20' : 'bg-[#16A34A] shadow-md shadow-emerald-500/20'
                    }`}
                  >
                    {voicePlaying ? <Pause size={16} /> : <Play size={16} className="ml-0.5" />}
                  </button>

                  <div className="flex-1 flex items-center gap-1 h-8 overflow-hidden">
                    {[10, 20, 14, 28, 18, 9, 24, 12, 20, 6, 26, 16, 10, 18, 8].map((h, i) => (
                      <div
                        key={i}
                        className={`bg-[#16A34A] rounded-full w-full transition-all duration-150 ${voicePlaying ? 'animate-wave-bar' : 'h-1 opacity-30'}`}
                        style={{
                          height: voicePlaying ? `${h}px` : '2px',
                          animationDelay: `${i * 0.05}s`,
                        }}
                      />
                    ))}
                  </div>

                  <span className="text-[10px] font-bold font-mono text-[#16A34A] pr-3 shrink-0">
                    {voicePlaying ? '0:12' : '0:00'} / 0:24
                  </span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 4. HOW IT WORKS */}
      <section ref={howItWorksRef} className="py-14 bg-white relative z-10 reveal">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 space-y-10">
          <div className="text-center space-y-4">
            <span className="text-xs uppercase tracking-[0.25em] font-black text-[#16A34A] block">
              సులువైన మూడు దశలు / Process Flow
            </span>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 leading-relaxed font-telugu">
              {lang === 'te' ? 'కృషి AI ఎలా ఉపయోగించాలి?' : 'How It Operates'}
            </h2>
            <p className="text-base text-slate-500 max-w-2xl mx-auto font-medium font-telugu">
              {lang === 'te'
                ? 'కేవలం మూడు దశల్లో మీ మొబైల్ ద్వారా పూర్తి వ్యవసాయ వివరాలను తెలుసుకోండి.'
                : 'Follow our intuitive three-step workflow to unlock precise agronomy analytics.'
              }
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Step 1 */}
            <div className="glass-panel border-white/60 p-6 rounded-2xl space-y-4 shadow-md hover:shadow-xl hover:scale-105 transition-all duration-300">
              <div className="w-10 h-10 rounded-xl bg-[#16A34A]/10 border border-[#16A34A]/20 flex items-center justify-center text-sm font-black text-[#16A34A] font-mono">
                01
              </div>
              <h3 className="text-lg font-bold text-slate-900 font-telugu leading-snug">
                {lang === 'te' ? '1. ఫోన్ వెరిఫికేషన్' : '1. Verify Mobile'}
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-medium font-telugu">
                {lang === 'te'
                  ? 'మీ 10 అంకెల మొబైల్ నంబర్ ఉపయోగించి సురక్షితమైన OTP ద్వారా తక్షణమే లాగిన్ అవ్వండి.'
                  : 'Enter your 10-digit number to receive a secure OTP code for instant account creation.'
                }
              </p>
            </div>

            {/* Step 2 */}
            <div className="glass-panel border-white/60 p-6 rounded-2xl space-y-4 shadow-md hover:shadow-xl hover:scale-105 transition-all duration-300">
              <div className="w-10 h-10 rounded-xl bg-[#16A34A]/10 border border-[#16A34A]/20 flex items-center justify-center text-sm font-black text-[#16A34A] font-mono">
                02
              </div>
              <h3 className="text-lg font-bold text-slate-900 font-telugu leading-snug">
                {lang === 'te' ? '2. ఆకు ఫోటో అప్‌లోడ్ / ధరల శోధన' : '2. Scan Leaf / Search Mandi'}
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-medium font-telugu">
                {lang === 'te'
                  ? 'ఆకు ఫోటోను క్యాప్చర్ చేసి అప్‌లోడ్ చేయండి లేదా మీ మార్కెట్ పంట రకాన్ని శోధించండి.'
                  : 'Snap a picture of the infected leaf or inspect daily historical commodity curves.'
                }
              </p>
            </div>

            {/* Step 3 */}
            <div className="glass-panel border-white/60 p-6 rounded-2xl space-y-4 shadow-md hover:shadow-xl hover:scale-105 transition-all duration-300">
              <div className="w-10 h-10 rounded-xl bg-[#16A34A]/10 border border-[#16A34A]/20 flex items-center justify-center text-sm font-black text-[#16A34A] font-mono">
                03
              </div>
              <h3 className="text-lg font-bold text-slate-900 font-telugu leading-snug">
                {lang === 'te' ? '3. నివారణ సలహా పొందండి' : '3. Follow AI Advisories'}
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-medium font-telugu">
                {lang === 'te'
                  ? 'నిజ సమయ కృత్రిమ సలహాలను శ్రవణ రూపంలో వినండి లేదా పిడిఎఫ్ లను డౌన్‌లోడ్ చేసుకోండి.'
                  : 'Follow generated recipes or chemical and organic instructions. Review weather predictions.'
                }
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* 5. SCREENSHOTS GALLERY */}
      <section ref={screenshotsRef} className="py-14 bg-slate-50 border-t border-slate-200/50 relative z-10 reveal">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 space-y-10">
          <div className="text-center space-y-4">
            <span className="text-xs uppercase tracking-[0.25em] font-black text-[#16A34A] block">
              రైతు సదుపాయాలు / Application Previews
            </span>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 leading-relaxed font-telugu">
              {lang === 'te' ? 'అప్లికేషన్ స్క్రీన్‌షాట్లు' : 'Platform Capabilities'}
            </h2>
            <p className="text-base text-slate-500 max-w-2xl mx-auto font-medium font-telugu">
              {lang === 'te'
                ? 'వ్యవసాయ సేవల సమగ్ర అప్లికేషన్ స్క్రీన్‌ల ప్రివ్యూలను కింది కరౌసెల్‌లో చూడండి.'
                : 'Preview the primary dashboard views and agronomist interfaces built into the system.'
              }
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Nav list left side */}
            <div className="lg:col-span-5 flex flex-col gap-3">
              {screenshotData.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveScreenshot(idx)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all duration-300 cursor-pointer flex gap-4 items-center ${
                    activeScreenshot === idx
                      ? 'border-[#16A34A] bg-white shadow-xl scale-[1.02] ring-2 ring-emerald-500/10'
                      : 'border-transparent bg-transparent hover:bg-slate-200/40 text-slate-700 hover:scale-[1.02]'
                  }`}
                >
                  <div className="p-2.5 rounded-xl bg-slate-100 shrink-0">
                    {item.icon}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-950 text-sm font-telugu leading-tight">
                      {lang === 'te' ? item.titleTe : item.titleEn}
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-1.5 font-medium leading-relaxed font-telugu">
                      {lang === 'te' ? item.descTe : item.descEn}
                    </p>
                  </div>
                </button>
              ))}
            </div>

            {/* Screen mockup tablet window right side */}
            <div className="lg:col-span-7 glass-panel rounded-3xl p-5 border-white/60 shadow-2xl flex flex-col justify-between overflow-hidden">
              <div className="relative w-full h-full flex flex-col justify-between p-4 bg-white/50 backdrop-blur-md rounded-2xl border border-slate-200/40 min-h-[300px]">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-red-400" />
                    <span className="w-3 h-3 rounded-full bg-yellow-400" />
                    <span className="w-3 h-3 rounded-full bg-green-400" />
                  </div>
                  <span className="text-[9px] text-slate-400 font-extrabold font-mono tracking-wider">SECURE DASHBOARD</span>
                  <span className="w-3.5 h-3.5 rounded bg-[#16A34A]" />
                </div>

                {/* Screenshot layout display */}
                <div className="flex-grow flex flex-col justify-center items-center p-6 text-center space-y-4 animate-[fade-in_0.4s_ease-out]">
                  <div className="p-4 bg-[#16A34A]/10 rounded-full text-[#16A34A]">
                    {screenshotData[activeScreenshot].icon}
                  </div>
                  <div>
                    <h4 className="text-lg font-black text-slate-900 font-telugu leading-snug">
                      {lang === 'te' ? screenshotData[activeScreenshot].titleTe : screenshotData[activeScreenshot].titleEn}
                    </h4>
                    <p className="text-xs sm:text-sm text-slate-500 font-medium max-w-sm mx-auto mt-2 font-telugu leading-relaxed">
                      {lang === 'te' ? screenshotData[activeScreenshot].descTe : screenshotData[activeScreenshot].descEn}
                    </p>
                  </div>
                </div>

                <div className="bg-slate-100/80 backdrop-blur-sm p-3 rounded-xl border border-slate-200/60 text-center text-xs font-black text-[#15803D] uppercase tracking-widest cursor-pointer hover:bg-slate-250/90 hover:scale-[1.02] active:scale-[0.98] transition-all font-telugu">
                  {lang === 'te' ? 'పోర్టల్ ప్రవేశించి ఉపయోగించండి' : 'Launch Feature Inside Dashboard'}
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 6. TESTIMONIALS SECTION */}
      <section ref={testimonialsRef} className="py-14 bg-white relative z-10 reveal">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 space-y-10">
          <div className="text-center space-y-4">
            <span className="text-xs uppercase tracking-[0.25em] font-black text-[#16A34A] block">
              రైతు అనుభవాలు / Verified Farmer Feedback
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 leading-relaxed font-telugu">
              {lang === 'te' ? 'రైతుల నుండి సంతోషకరమైన సలహాలు' : 'Farmers’ Success Stories'}
            </h2>
            <p className="text-base text-slate-500 max-w-2xl mx-auto font-medium font-telugu">
              {lang === 'te'
                ? 'తెలంగాణవ్యాప్తంగా కృషి AI అసిస్టెంట్‌తో పంట దిగుబడి పెంచుకున్న కొందరు రైతుల మాటల్లో.'
                : 'Read testimonials from regional crop producers utilizing our agricultural system.'
              }
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Testimonial 1 */}
            <div className="glass-panel border-white/60 p-6 sm:p-8 rounded-3xl flex flex-col justify-between shadow-lg hover:scale-105 hover:shadow-2xl hover:border-emerald-500/20 transition-all duration-300">
              <div className="space-y-4">
                <div className="flex text-amber-500 gap-1 text-sm">
                  <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
                </div>
                <p className="text-xs sm:text-sm font-semibold text-slate-600 leading-relaxed font-telugu text-telugu">
                  "నా వరి పంటకు అగ్గి తెగులు సోకినప్పుడు ఈ యాప్ ద్వారా ఫోటో తీసి అప్‌లోడ్ చేశాను. వెంటనే మందుల మోతాదును తెలుగు వాయిస్ సలహా ద్వారా విన్నాను. పంటను కాపాడుకోగలిగాను."
                </p>
              </div>
              <div className="pt-5 border-t border-slate-200 mt-6 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#16A34A]/15 text-[#15803D] font-bold flex items-center justify-center font-mono text-sm">M</div>
                <div>
                  <h4 className="font-extrabold text-slate-900 text-sm font-telugu leading-none">ఎం. మల్లయ్య</h4>
                  <p className="text-[10px] text-[#16A34A] font-bold font-telugu mt-1">గజ్వేల్, వరి రైతు</p>
                </div>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="glass-panel border-white/60 p-6 sm:p-8 rounded-3xl flex flex-col justify-between shadow-lg hover:scale-105 hover:shadow-2xl hover:border-emerald-500/20 transition-all duration-300">
              <div className="space-y-4">
                <div className="flex text-amber-500 gap-1 text-sm">
                  <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
                </div>
                <p className="text-xs sm:text-sm font-semibold text-slate-600 leading-relaxed font-telugu text-telugu">
                  "పత్తి పంట రేట్లు ఎప్పుడు పెరుగుతాయో తెలియక సందిగ్ధంలో ఉండేవాడిని. ఇందులో ఖమ్మం మార్కెట్ రేట్ల 7 రోజుల మార్పు అంచనా చూసి సరైన సమయంలో పంటను అమ్మి లాభపడ్డాను."
                </p>
              </div>
              <div className="pt-5 border-t border-slate-200 mt-6 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#16A34A]/15 text-[#15803D] font-bold flex items-center justify-center font-mono text-sm">K</div>
                <div>
                  <h4 className="font-extrabold text-slate-900 text-sm font-telugu leading-none">కె. వెంకటయ్య</h4>
                  <p className="text-[10px] text-[#16A34A] font-bold font-telugu mt-1">ఖమ్మం, పత్తి రైతు</p>
                </div>
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="glass-panel border-white/60 p-6 sm:p-8 rounded-3xl flex flex-col justify-between shadow-lg hover:scale-105 hover:shadow-2xl hover:border-emerald-500/20 transition-all duration-300">
              <div className="space-y-4">
                <div className="flex text-amber-500 gap-1 text-sm">
                  <span>★</span><span>★</span><span>★</span><span>★</span><span>☆</span>
                </div>
                <p className="text-xs sm:text-sm font-semibold text-slate-600 leading-relaxed font-telugu text-telugu">
                  "ఈ యాప్‌లో రోజూ వాతావరణ సలహాలు వాయిస్ రూపంలో వినొచ్చు. ఇది చాలా ఉపయోగపడుతుంది. చదువుకోలేని మా లాంటి రైతులకు ఈ సదుపాయం ఒక వరం."
                </p>
              </div>
              <div className="pt-5 border-t border-slate-200 mt-6 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#16A34A]/15 text-[#15803D] font-bold flex items-center justify-center font-mono text-sm">R</div>
                <div>
                  <h4 className="font-extrabold text-slate-900 text-sm font-telugu leading-none">ఆర్. రాములమ్మ</h4>
                  <p className="text-[10px] text-[#16A34A] font-bold font-telugu mt-1">సిద్దిపేట, కూరగాయల రైతు</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 7. SECURE OTP LOGIN SECTION (WHITE/GREEN SLICK PALETTE) */}
      <section
        ref={loginSectionRef}
        className="py-14 px-4 lg:px-8 max-w-md mx-auto z-10 relative scroll-mt-16 reveal"
      >
        <div className="glass-panel rounded-2xl p-6 sm:p-8 border-white/60 shadow-[0_16px_40px_rgba(0,0,0,0.08)] space-y-6 relative overflow-hidden">
          
          <div className="text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-[#16A34A]/10 flex items-center justify-center mx-auto text-[#16A34A]">
              <Shield size={28} />
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 leading-normal font-telugu">
              {lang === 'te' ? 'రైతు పోర్టల్ లాగిన్' : 'Portal Login'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium font-telugu">
              {lang === 'te' 
                ? 'తక్షణ వాతావరణ మరియు పంట సేవలను పొందండి'
                : 'Enter your mobile number to retrieve farmer metrics'
              }
            </p>
          </div>

          {error && (
            <div className="bg-red-500/10 text-red-700 border border-red-500/20 px-4 py-3 rounded-xl text-xs sm:text-sm flex items-center gap-2.5 font-bold font-telugu">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="bg-[#16A34A]/10 text-[#15803D] border border-[#16A34A]/20 px-4 py-3 rounded-xl text-xs sm:text-sm flex items-center gap-2.5 font-bold animate-[fade-in_0.2s_ease-out] font-telugu">
              <CheckCircle2 size={18} />
              <span>
                {lang === 'te' ? 'లాగిన్ విజయవంతమైంది! ప్రవేశిస్తున్నాము...' : 'Redirecting to your dashboard...'}
              </span>
            </div>
          )}

          {!otpSent ? (
            <form onSubmit={handleSendOTP} className="space-y-6">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  Mobile Number
                  <span className="text-telugu text-[10px] text-[#16A34A] normal-case tracking-normal">(మొబైల్ నంబర్)</span>
                </label>
                <div className="relative flex items-center rounded-2xl border border-slate-200 bg-white/60 backdrop-blur-md focus-within:border-[#16A34A] focus-within:bg-white focus-within:ring-4 focus-within:ring-[#16A34A]/10 px-4 py-3.5 transition-all">
                  <span className="text-sm font-bold text-slate-500 border-r border-slate-200 pr-3 mr-3 shrink-0">
                    🇮🇳 +91
                  </span>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder={lang === 'te' ? 'మొబైల్ నంబర్ నమోదు చేయండి' : 'Enter 10-digit number'}
                    className="flex-grow bg-transparent outline-none text-base text-slate-800 placeholder:text-slate-400 font-semibold"
                    disabled={loading}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || phone.length !== 10}
                className="w-full bg-[#16A34A] hover:bg-[#15803D] text-white py-4 rounded-xl font-bold text-base transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3 shadow-[0_10px_20px_rgba(22,163,74,0.2)] cursor-pointer"
              >
                {loading ? (
                  <span className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin" />
                ) : null}
                <span className="font-telugu">{lang === 'te' ? 'లాగిన్ ఓటిపి పంపండి' : 'Send One-Time OTP'}</span>
              </button>
            </form>
          ) : (
            <div className="space-y-6 animate-[fade-in_0.4s_ease-out]">
              <div className="bg-[#16A34A]/10 border border-[#16A34A]/20 p-4 rounded-xl text-center text-xs sm:text-sm text-[#15803D]">
                <span className="font-telugu">{lang === 'te' ? 'ఓటిపి కోడ్ మొబైల్ కు పంపబడింది:' : 'OTP code dispatched to:'} <strong className="text-slate-900">+91 {phone}</strong></span>
                <button
                  type="button"
                  onClick={() => {
                    setOtpSent(false);
                    setOtp(['', '', '', '', '', '']);
                    setError('');
                  }}
                  className="block mx-auto text-xs font-bold underline mt-2 text-[#16A34A] cursor-pointer"
                >
                  {lang === 'te' ? 'నంబర్ మార్చండి' : 'Edit Number'}
                </button>
              </div>

              <div className="flex flex-col gap-3">
                <label className="text-xs font-extrabold text-slate-400 uppercase tracking-widest flex items-center justify-center gap-2">
                  Enter 6-Digit Code
                  <span className="text-telugu text-[10px] text-[#16A34A] normal-case tracking-normal">(ఓటిపి నమోదు చేయండి)</span>
                </label>
                
                <div className="flex gap-2 justify-center py-1" onPaste={handleOtpPaste}>
                  {otp.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => (otpInputsRef.current[idx] = el)}
                      type="text"
                      maxLength="1"
                      value={digit}
                      onChange={(e) => handleOtpChange(e.target.value, idx)}
                      onKeyDown={(e) => handleOtpKeyDown(e, idx)}
                      className="w-12 h-14 text-center text-2xl font-black font-mono border border-slate-200 rounded-xl focus:border-[#16A34A] focus:bg-[#16A34A]/10 focus:ring-4 focus:ring-[#16A34A]/10 outline-none bg-white/70 backdrop-blur-md text-slate-800 transition-all hover:scale-105"
                      disabled={loading || success}
                    />
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-center text-xs font-bold text-slate-400">
                {timer > 0 ? (
                  <span>Resend in {timer}s</span>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendOTP}
                    className="text-[#16A34A] underline cursor-pointer"
                  >
                    Resend OTP
                  </button>
                )}
                <span className="font-mono text-[#15803D] bg-[#16A34A]/10 px-2.5 py-0.5 rounded-full text-[10px]">Demo Code: 123456</span>
              </div>
            </div>
          )}

        </div>
      </section>

      {/* 8. FOOTER WITH ACCESSIBLE CONTACTS & DISCLAIMERS */}
      <footer className="bg-slate-950 backdrop-blur-xl border-t border-slate-800 text-slate-400 py-12 px-4 lg:px-8 relative z-10 reveal">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 border-b border-slate-800 pb-10">
          
          <div className="md:col-span-6 space-y-4">
            <div className="flex items-center gap-2">
              <Leaf className="text-[#16A34A]" size={28} />
              <span className="text-2xl font-black text-white tracking-widest leading-none">కృషి <span className="text-[#16A34A]">AI</span></span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed font-medium max-w-md font-telugu">
              తెలంగాణ రైతుల కోసం అభివృద్ధి చేయబడిన అత్యున్నత కృత్రిమ మేధస్సు సహాయక వ్యవస్థ. సమాచార సలహాలు, తెగుళ్ల నిర్ధారణ సేవల సమాహారం.
            </p>
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 p-3 rounded-xl max-w-sm">
              <Info className="text-amber-500 shrink-0" size={18} />
              <span className="text-[11px] text-slate-300 font-medium">
                Official Department database schema indices and commodity pricing APIs integrated.
              </span>
            </div>
          </div>

          <div className="md:col-span-3 space-y-4">
            <h4 className="text-white font-extrabold text-sm uppercase tracking-wider">Quick Navigation</h4>
            <ul className="space-y-2.5 text-sm font-semibold">
              <li><button onClick={() => scrollToSection(featuresRef)} className="hover:text-white transition-colors cursor-pointer text-left">Live Demo Utilities</button></li>
              <li><button onClick={() => scrollToSection(howItWorksRef)} className="hover:text-white transition-colors cursor-pointer text-left">Process Flow</button></li>
              <li><button onClick={() => scrollToSection(screenshotsRef)} className="hover:text-white transition-colors cursor-pointer text-left">Dashboard Screen Gallery</button></li>
              <li><button onClick={() => scrollToSection(testimonialsRef)} className="hover:text-white transition-colors cursor-pointer text-left">Success Stories</button></li>
            </ul>
          </div>

          <div className="md:col-span-3 space-y-4">
            <h4 className="text-white font-extrabold text-sm uppercase tracking-wider">Support Connect</h4>
            <a
              href="https://wa.me/919876543210"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-[#25D366] hover:bg-[#20ba59] hover:scale-105 active:scale-95 text-white text-sm font-black transition-all shadow-lg shadow-[#25D366]/20"
            >
              <MessageSquare size={18} />
              <span>WhatsApp Integration</span>
            </a>
            <div className="text-xs text-slate-500 font-bold mt-2">
              Assistance hours: 24/7 Helpline Access
            </div>
          </div>

        </div>

        <div className="max-w-7xl mx-auto pt-8 flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-slate-500 font-medium">
          <span className="font-telugu leading-loose text-center sm:text-left text-slate-500">© 2026 Krushi AI — Telangana State Agricultural Data Advisory Initiative.</span>
          <div className="flex gap-6">
            <a href="#" className="hover:text-slate-300 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-slate-300 transition-colors">Terms of Use</a>
          </div>
        </div>
      </footer>

    </div>
  );
}
