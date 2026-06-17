import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { sendOtp, verifyOtp, registerFarmer } from '../services/api';
import { toast } from 'react-toastify';
import {
  Sprout, Phone, ShieldCheck, ArrowRight, Sparkles,
  CloudSun, ScanLine, TrendingUp, FileText, MessageSquare,
  ChevronRight, Star, ExternalLink, UserPlus, CheckCircle2, AlertCircle
} from 'lucide-react';
import heroVisual from '../assets/hero-visual.png';

const localT = {
  en: {
    heroSub: "Smart Farming for",
    heroTitle: "Telangana Farmers",
    heroDesc: "An AI-powered 24/7 personal agronomist. Get hyperlocal weather alerts, instant crop disease diagnosis, live mandi prices, and government scheme guidance — all in Telugu and English.",
    startFree: "Start for Free",
    loginOtp: "Login with OTP",
    howItWorks: "How It Works",
    howItWorksSub: "From Registration to Maximum Yield",
    howItWorksDesc: "Four simple steps to unlock AI-powered farming intelligence tailored for your land, soil, and crops.",
    coreCapabilities: "Core Capabilities",
    featuresTitle: "Enterprise-Grade AI Features",
    featuresDesc: "Six powerful AI modules working together to give every Telangana farmer a personalized, data-driven agricultural advisor.",
    joinFarmers: "Join 50,000+ Farmers",
    alreadyUsing: "Already Using Krishi AI",
    joinDesc: "No app download needed. No subscription fees. Verified by Rythu Bandhu. Works in Telugu, Hindi, and English on any mobile browser.",
    openDashboard: "Open Dashboard",
    farmerReg: "Farmer Registration",
    securedBy: "Secured by Firebase OTP Verification",
    mobileNum: "Mobile Number (India)",
    sendCode: "Send Verification Code",
    enterOtp: "Enter 6-Digit Code",
    verifyCode: "Verify & Enter Dashboard",
    launchDemo: "Launch Demo Dashboard (No OTP needed)",
    changeNumber: "Change number",
    wantToExplore: "Want to explore first?",
    sending: "Sending OTP...",
    verifying: "Verifying...",
  },
  te: {
    heroSub: "స్మార్ట్ వ్యవసాయం",
    heroTitle: "తెలంగాణ రైతుల కోసం",
    heroDesc: "24/7 పనిచేసే AI-వ్యవసాయ సహాయకుడు. వాతావరణ హెచ్చరికలు, పంట తెగుళ్ళ నిర్ధారణ, లైవ్ మార్కెట్ ధరలు మరియు ప్రభుత్వ పథకాల సమాచారం — అన్నీ తెలుగులో పొందండి.",
    startFree: "ఉచితంగా ప్రారంభించండి",
    loginOtp: "OTPతో లాగిన్ చేయండి",
    howItWorks: "పనిచేసే విధానం",
    howItWorksSub: "నమోదు నుండి గరిష్ట దిగుబడి వరకు",
    howItWorksDesc: "మీ భూమి, నేల మరియు పంటలకు తగినట్లుగా AI-వ్యవసాయ సమాచారాన్ని పొందేందుకు నాలుగు సులభమైన దశలు.",
    coreCapabilities: "ప్రధాన సేవలు",
    featuresTitle: "అత్యుత్తమ AI ఫీచర్లు",
    featuresDesc: "తెలంగాణ రైతులకు వ్యక్తిగతీకరించిన, డేటా ఆధారిత వ్యవసాయ సలహాలను అందించే ఆరు శక్తివంతమైన AI సేవలు.",
    joinFarmers: "కృషి AI ఉపయోగిస్తున్న 50,000+",
    alreadyUsing: "మంది రైతులతో చేరండి",
    joinDesc: "యాప్ డౌన్‌లోడ్ అవసరం లేదు. ఎలాంటి రుసుములు లేవు. రైతు బంధు ద్వారా ధృవీకరించబడింది. మొబైల్ బ్రౌజర్‌లో తెలుగు, హిందీ మరియు ఇంగ్లీష్ భాషలలో పని చేస్తుంది.",
    openDashboard: "డ్యాష్‌బోర్డ్ తెరవండి",
    farmerReg: "రైతు నమోదు",
    securedBy: "ఫైర్‌బేస్ OTP ధృవీకరణ ద్వారా రక్షించబడింది",
    mobileNum: "మొబైల్ నంబర్ (భారతదేశం)",
    sendCode: "ధృవీకరణ కోడ్ పంపండి",
    enterOtp: "6-అంకెల కోడ్‌ను నమోదు చేయండి",
    verifyCode: "ధృవీకరించి ప్రవేశించండి",
    launchDemo: "డెమో డ్యాష్‌బోర్డ్ ప్రారంభించండి (OTP అవసరం లేదు)",
    changeNumber: "నంబర్ మార్చండి",
    wantToExplore: "ముందుగా పరిశీలించాలనుకుంటున్నారా?",
    sending: "OTP పంపుతోంది...",
    verifying: "ధృవీకరిస్తోంది...",
  }
};

export const Landing = () => {
  const { login, t, language, setLanguage } = useContext(AppContext);
  const navigate = useNavigate();
  const lt = localT[language] || localT['en'];

  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1); // 1=phone, 2=otp, 3=register
  const [loading, setLoading] = useState(false);
  const [devOtp, setDevOtp] = useState(''); // Show OTP in dev mode
  const [isNewFarmer, setIsNewFarmer] = useState(false);

  // Registration form state
  const [regForm, setRegForm] = useState({
    name: '', village: '', mandal: 'Nalgonda', district: 'Nalgonda',
    land_size_acres: '', soil_type: 'Red Sandy', water_source: 'Borewell',
  });

  const handleSendOtp = async (e) => {
    e.preventDefault();
    const cleaned = phone.replace(/\s/g, '');
    if (!cleaned || cleaned.length < 10) {
      toast.error('Please enter a valid 10-digit mobile number');
      return;
    }
    setLoading(true);
    try {
      // Try sending OTP — if farmer not found, we show register form
      const data = await sendOtp(cleaned);
      if (data.otp_dev_only) {
        setDevOtp(data.otp_dev_only);
        toast.success(`OTP sent! (Dev mode: ${data.otp_dev_only})`, { autoClose: 10000 });
      } else {
        toast.success('OTP sent to your mobile number!');
      }
      setIsNewFarmer(false);
      setStep(2);
    } catch (err) {
      const detail = err.response?.data?.detail || '';
      if (err.response?.status === 404 || detail.toLowerCase().includes('not registered')) {
        // New farmer — show registration first
        setIsNewFarmer(true);
        setStep(3);
        toast.info('Mobile not registered. Please fill in your farm details first.');
      } else {
        toast.error(detail || 'Failed to send OTP. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const cleaned = phone.replace(/\s/g, '');
    if (!regForm.name || !regForm.village || !regForm.land_size_acres) {
      toast.error('Please fill all required fields');
      return;
    }
    setLoading(true);
    try {
      await registerFarmer({
        name: regForm.name,
        mobile_number: cleaned,
        village: regForm.village,
        mandal: regForm.mandal,
        district: regForm.district,
        land_size_acres: parseFloat(regForm.land_size_acres),
        soil_type: regForm.soil_type,
        water_source: regForm.water_source,
      });
      toast.success('Registration successful! Sending OTP...');
      // Now send OTP
      const otpData = await sendOtp(cleaned);
      if (otpData.otp_dev_only) {
        setDevOtp(otpData.otp_dev_only);
        toast.success(`OTP sent! (Dev mode: ${otpData.otp_dev_only})`, { autoClose: 10000 });
      }
      setStep(2);
    } catch (err) {
      const detail = err.response?.data?.detail || 'Registration failed';
      toast.error(detail);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const cleaned = phone.replace(/\s/g, '');
    if (!otp || otp.length < 4) {
      toast.error('Please enter the 6-digit OTP');
      return;
    }
    setLoading(true);
    try {
      const data = await verifyOtp(cleaned, otp);
      // data: { access_token, token_type, farmer_id, name }
      login(
        {
          id: data.farmer_id,
          name: data.name,
          phone: cleaned,
          // These will be enriched later from the profile API
          village: regForm.village || 'Telangana',
          landSize: regForm.land_size_acres || '—',
          soilType: regForm.soil_type || '—',
          waterSource: regForm.water_source || '—',
        },
        data.access_token
      );
      toast.success(`Welcome, ${data.name}! 🌾`);
      navigate('/dashboard');
    } catch (err) {
      const detail = err.response?.data?.detail || 'OTP verification failed';
      toast.error(detail);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoAccess = () => {
    login(
      { id: 0, name: 'Demo Farmer', phone: '9999999999', village: 'Warangal', landSize: '3.0', soilType: 'Black Clayey', waterSource: 'Canal' },
      'demo-token'
    );
    navigate('/dashboard');
  };

  // Stats for hero section
  const stats = [
    { number: "50K+", label: "Farmers Served" },
    { number: "120+", label: "Crop Varieties" },
    { number: "99.8%", label: "Uptime" },
    { number: "3", label: "Languages" },
  ];

  // Marquee items (scrolling ticker)
  const marqueeItems = [
    "🌦️ OpenWeatherMap API", "🔥 Firebase Auth", "🤖 Google Gemini AI",
    "📡 AgriStack India", "🌾 APMC Market Data", "🧪 PlantVillage Dataset",
    "📱 WhatsApp Business API", "🏦 PM-KISAN Database", "🌍 IMD Weather",
    "🔬 Disease Detection AI", "📊 Recharts Analytics", "🚀 FastAPI Backend",
  ];

  // How it works steps
  const steps = [
    { icon: "📱", title: "Register Phone", desc: "Login securely with OTP in seconds" },
    { icon: "🌾", title: "Set Up Your Farm", desc: "Enter soil type, land & water details" },
    { icon: "🤖", title: "AI Analyses", desc: "Get smart crop & weather advisory" },
    { icon: "💰", title: "Maximize Yield", desc: "Sell at right time, right market" },
  ];

  // Feature cards with unique colors
  const features = [
    {
      icon: CloudSun, title: "Smart Weather Advisory", color: "var(--color-weather)",
      bg: "rgba(56,189,248,0.08)", border: "rgba(56,189,248,0.2)",
      desc: "Hyperlocal IMD-linked forecasts with 7-day outlook, crop-specific irrigation recommendations, and drought/flood early warnings.",
      tag: "weather_advisory"
    },
    {
      icon: ScanLine, title: "AI Disease Detection", color: "var(--color-disease)",
      bg: "rgba(248,113,113,0.08)", border: "rgba(248,113,113,0.2)",
      desc: "Upload a leaf photo to get instant pathogen diagnosis with treatment and prevention protocols. Supports 38 disease types.",
      tag: "scan_leaf_image"
    },
    {
      icon: TrendingUp, title: "Market Intelligence", color: "var(--color-market)",
      bg: "rgba(251,191,36,0.08)", border: "rgba(251,191,36,0.2)",
      desc: "Live APMC mandi prices, commodity trend charts, and AI-generated best-time-to-sell alerts for your specific crops.",
      tag: "get_mandi_prices"
    },
    {
      icon: FileText, title: "Government Schemes", color: "var(--color-schemes)",
      bg: "rgba(167,139,250,0.08)", border: "rgba(167,139,250,0.2)",
      desc: "Browse Rythu Bandhu, PM-KISAN, and 20+ state/central schemes. Verify eligibility and get document checklists.",
      tag: "check_eligibility"
    },
    {
      icon: Sprout, title: "Crop Lifecycle Tracker", color: "var(--color-crop)",
      bg: "rgba(52,211,153,0.08)", border: "rgba(52,211,153,0.2)",
      desc: "Monitor growth milestones from sowing to harvest. Get stage-wise fertilization reminders and yield estimations.",
      tag: "track_crop_stage"
    },
    {
      icon: MessageSquare, title: "Telugu AI Chatbot", color: "var(--color-chat)",
      bg: "rgba(251,146,60,0.08)", border: "rgba(251,146,60,0.2)",
      desc: "Ask farming questions in Telugu, Hindi, or English. Get voice-enabled responses and expert crop advisory 24/7.",
      tag: "ask_krishi_ai"
    },
  ];

  return (
    <div className="min-h-screen particle-bg" style={{ background: 'var(--bg-primary)', fontFamily: 'var(--font-body)' }}>

      {/* ===================== NAVBAR ===================== */}
      <nav className="nav-glass fixed top-0 left-0 right-0 z-50 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto flex items-center justify-between h-16">

          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #059669, #10b981)', boxShadow: '0 0 16px rgba(16,185,129,0.4)' }}>
              <Sprout className="w-5 h-5 text-white" />
            </div>
            <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '18px', color: '#ffffff' }}>Krishi AI</span>
          </div>

          {/* Nav Links — Desktop */}
          <div className="hidden md:flex items-center gap-8">
            {['Features', 'How It Works', 'Schemes', 'Market Prices'].map(link => (
              <a key={link} href="#" style={{ fontSize: '14px', color: 'var(--text-secondary)', fontWeight: 500, transition: 'color 0.2s' }}
                onMouseEnter={e => e.target.style.color = '#ffffff'}
                onMouseLeave={e => e.target.style.color = 'var(--text-secondary)'}
              >
                {link}
              </a>
            ))}
          </div>

          {/* Right CTA & Language Selector */}
          <div className="flex items-center gap-3">
            {/* Language Selector Toggle */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '2px',
              background: 'rgba(16, 185, 129, 0.05)',
              padding: '3px',
              borderRadius: '8px',
              border: '1px solid var(--border-subtle)'
            }}>
              {[
                { code: 'te', label: 'తెలుగు' },
                { code: 'en', label: 'EN' }
              ].map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => setLanguage(lang.code)}
                  style={{
                    padding: '4px 8px',
                    fontSize: '11px',
                    fontWeight: 600,
                    borderRadius: '6px',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    background: language === lang.code ? 'rgba(16, 185, 129, 0.2)' : 'transparent',
                    color: language === lang.code ? '#10b981' : 'var(--text-muted)',
                    outline: language === lang.code ? '1px solid rgba(16, 185, 129, 0.3)' : 'none',
                  }}
                >
                  {lang.label}
                </button>
              ))}
            </div>

            <button onClick={handleDemoAccess} className="btn-primary" style={{ fontSize: '13px', padding: '10px 20px' }}>
              <ExternalLink className="w-4 h-4" />
              <span>{lt.openDashboard}</span>
            </button>
          </div>
        </div>
      </nav>

      {/* ===================== HERO SECTION ===================== */}
      <section className="relative min-h-screen flex items-center pt-16 overflow-hidden">

        {/* Ambient glow blobs */}
        <div className="glow-blob-green" style={{ width: '500px', height: '500px', top: '-100px', left: '-100px', opacity: 0.6 }} />
        <div className="glow-blob-blue" style={{ width: '400px', height: '400px', bottom: '50px', right: '200px', opacity: 0.5 }} />

        <div className="max-w-7xl mx-auto px-6 lg:px-12 w-full relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">

            {/* Left: Text Content */}
            <div className="lg:col-span-6 space-y-8">

              {/* Pill badge */}
              <div>
                <span className="pill-badge">
                  <span style={{ width: '6px', height: '6px', borderRadius: '9999px', background: '#10b981', display: 'inline-block', animation: 'pulse 2s infinite' }} />
                  Powered by Google Gemini AI & FastAPI
                </span>
              </div>

              {/* Headline */}
              <div>
                <h1 style={{ fontFamily: 'var(--font-heading)', fontWeight: 900, fontSize: 'clamp(40px, 6vw, 68px)', lineHeight: 1.05, letterSpacing: '-0.03em', color: '#ffffff', marginBottom: '8px' }}>
                  {lt.heroSub}
                </h1>
                <h1 className="gradient-text" style={{ fontFamily: 'var(--font-heading)', fontWeight: 900, fontSize: 'clamp(40px, 6vw, 68px)', lineHeight: 1.05, letterSpacing: '-0.03em', marginBottom: 0 }}>
                  {lt.heroTitle}
                </h1>
              </div>

              {/* Description */}
              <p style={{ fontSize: '17px', color: 'var(--text-secondary)', lineHeight: 1.75, maxWidth: '480px' }}>
                {lt.heroDesc}
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-wrap gap-4">
                <button onClick={handleDemoAccess} className="btn-primary">
                  <span>{lt.startFree}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => document.getElementById('login-card').scrollIntoView({ behavior: 'smooth' })}
                  className="btn-secondary"
                >
                  <Phone className="w-4 h-4" />
                  <span>{lt.loginOtp}</span>
                </button>
              </div>

              {/* Stats Row */}
              <div className="flex flex-wrap gap-8 pt-4" style={{ borderTop: '1px solid var(--border-subtle)' }}>
                {stats.map((stat, i) => (
                  <div key={i}>
                    <div className="stat-number">{stat.number}</div>
                    <div className="stat-label">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Hero Visual */}
            <div className="lg:col-span-6 flex justify-center relative">
              <div className="relative w-full max-w-[580px]">
                {/* Glow behind image */}
                <div style={{ position: 'absolute', inset: '-30px', background: 'radial-gradient(ellipse at center, rgba(16,185,129,0.15) 0%, transparent 70%)', borderRadius: '9999px', zIndex: 0 }} />
                <img
                  src={heroVisual}
                  alt="AI-powered smart farming visualization"
                  className="relative z-10 w-full rounded-2xl"
                  style={{ boxShadow: '0 30px 80px rgba(0,0,0,0.6)', border: '1px solid rgba(16,185,129,0.15)' }}
                />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ===================== MARQUEE TICKER ===================== */}
      <div className="marquee-strip" style={{ position: 'relative', zIndex: 10 }}>
        <div style={{ display: 'flex', overflow: 'hidden' }}>
          <div className="marquee-track">
            {[...marqueeItems, ...marqueeItems].map((item, i) => (
              <span key={i} className="marquee-item">
                {item}
                <span className="marquee-dot">◆</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ===================== HOW IT WORKS ===================== */}
      <section style={{ padding: '100px 0', background: 'var(--bg-secondary)' }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-12">

          {/* Section header */}
          <div className="text-center space-y-4 mb-16">
            <div className="flex justify-center">
              <span className="pill-section">{lt.howItWorks}</span>
            </div>
            <h2 className="section-heading text-center" style={{ fontSize: 'clamp(32px, 5vw, 48px)' }}>
              {lt.howItWorksSub}
            </h2>
            <p className="section-subtext text-center mx-auto">
              {lt.howItWorksDesc}
            </p>
          </div>

          {/* Steps */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 md:gap-4">
            {steps.map((step, i) => (
              <React.Fragment key={i}>
                <div className="flex flex-col items-center text-center max-w-[180px] mx-auto md:mx-0 space-y-3">
                  <div style={{
                    width: '64px', height: '64px', borderRadius: '16px',
                    background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px'
                  }}>
                    {step.icon}
                  </div>
                  <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, color: '#ffffff', fontSize: '15px' }}>{step.title}</h3>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{step.desc}</p>
                </div>
                {i < steps.length - 1 && (
                  <div className="step-arrow hidden md:block text-2xl">→</div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== FEATURES SECTION ===================== */}
      <section id="features" style={{ padding: '100px 0' }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-12">

          {/* Section header */}
          <div className="text-center space-y-4 mb-16">
            <div className="flex justify-center">
              <span className="pill-section">{lt.coreCapabilities}</span>
            </div>
            <h2 className="section-heading" style={{ textAlign: 'center', fontSize: 'clamp(32px, 5vw, 48px)' }}>
              {lt.featuresTitle}
            </h2>
            <p className="section-subtext text-center mx-auto">
              {lt.featuresDesc}
            </p>
          </div>

          {/* 3-Column Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feat, i) => {
              const Icon = feat.icon;
              return (
                <div key={i} className="glass-card" style={{ padding: '28px', background: 'var(--bg-card)', position: 'relative', overflow: 'hidden' }}>
                  {/* Subtle glow in top-right corner */}
                  <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '100px', height: '100px', background: `radial-gradient(circle, ${feat.bg.replace('0.08', '0.15')} 0%, transparent 70%)`, pointerEvents: 'none' }} />

                  {/* Icon Badge */}
                  <div className="icon-badge" style={{ background: feat.bg, border: `1px solid ${feat.border}` }}>
                    <Icon style={{ width: '22px', height: '22px', color: feat.color }} />
                  </div>

                  <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '17px', color: '#ffffff', marginBottom: '10px' }}>{feat.title}</h3>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.65, marginBottom: '16px' }}>{feat.desc}</p>

                  {/* Code tag */}
                  <span style={{
                    display: 'inline-block', fontSize: '10px', fontFamily: 'monospace',
                    padding: '4px 10px', borderRadius: '6px',
                    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                    color: feat.color, letterSpacing: '0.05em'
                  }}>
                    {feat.tag}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===================== OTP LOGIN SECTION ===================== */}
      <section id="login-card" style={{ padding: '100px 0', background: 'var(--bg-secondary)' }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

            {/* Left: Value proposition */}
            <div className="space-y-8">
              <div>
                <span className="pill-badge">{language === 'te' ? 'తెలంగాణ రైతులకు ఉచితం' : 'FREE FOR TELANGANA FARMERS'}</span>
              </div>
              <h2 className="section-heading" style={{ fontSize: 'clamp(32px, 4vw, 46px)' }}>
                {lt.joinFarmers}<br /><span className="gradient-text">{lt.alreadyUsing}</span>
              </h2>
              <p className="section-subtext">
                {lt.joinDesc}
              </p>
              {/* Trust badges */}
              <div className="flex flex-wrap gap-4">
                {["🏛️ Govt. Verified Data", "🔒 Firebase Secured", "🌐 Works Offline", "🌾 46 Crop Types"].map((b, i) => (
                  <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '8px 14px' }}>
                    {b}
                  </span>
                ))}
              </div>
            </div>

            {/* Right: OTP Login Card */}
            <div>
              <div className="glass-card" style={{ padding: '40px', maxWidth: '440px', margin: '0 auto', background: 'var(--bg-card)' }}>
                {/* Card header */}
                <div className="flex flex-col items-center text-center mb-8">
                  <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px' }}>
                    <Phone style={{ width: '24px', height: '24px', color: '#10b981' }} />
                  </div>
                  <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '22px', color: '#ffffff', marginBottom: '6px' }}>{lt.farmerReg}</h3>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{lt.securedBy}</p>
                </div>
                {step === 1 ? (
                  <form onSubmit={handleSendOtp} className="space-y-5">
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>
                        {lt.mobileNum}
                      </label>
                      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                        <span style={{ position: 'absolute', left: '14px', fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)', fontFamily: 'monospace', borderRight: '1px solid var(--border-subtle)', paddingRight: '12px' }}>+91</span>
                        <input
                          type="tel" maxLength="10" value={phone}
                          onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                          placeholder="9876543210"
                          style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-card)', borderRadius: '10px', padding: '13px 14px 13px 70px', color: '#ffffff', fontSize: '15px', fontFamily: 'monospace', letterSpacing: '0.1em', outline: 'none', transition: 'border-color 0.2s' }}
                          onFocus={e => e.target.style.borderColor = 'rgba(16,185,129,0.5)'}
                          onBlur={e => e.target.style.borderColor = 'var(--border-card)'}
                          required
                        />
                      </div>
                    </div>

                    <button type="submit" disabled={phone.length < 10 || loading} className="btn-primary w-full" style={{ width: '100%', justifyContent: 'center', opacity: phone.length < 10 ? 0.5 : 1 }}>
                      <span>{loading ? lt.sending : lt.sendCode}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </form>
                ) : step === 3 ? (
                  /* ── Registration Form (new farmer) ── */
                  <form onSubmit={handleRegister} className="space-y-4">
                    <div style={{ background: 'rgba(251,191,36,0.07)', border: '1px solid rgba(251,191,36,0.25)', borderRadius: '10px', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <UserPlus style={{ width: '16px', height: '16px', color: '#fbbf24', flexShrink: 0 }} />
                      <p style={{ fontSize: '12px', color: '#fbbf24' }}>New farmer — fill your farm details to register.</p>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '6px' }}>Full Name *</label>
                      <input type="text" value={regForm.name} onChange={e => setRegForm(p => ({ ...p, name: e.target.value }))} placeholder="Mallaiah Raju"
                        style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-card)', borderRadius: '10px', padding: '11px 14px', color: '#fff', fontSize: '14px', outline: 'none' }}
                        onFocus={e => e.target.style.borderColor = 'rgba(16,185,129,0.5)'} onBlur={e => e.target.style.borderColor = 'var(--border-card)'} required />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '6px' }}>Village *</label>
                        <input type="text" value={regForm.village} onChange={e => setRegForm(p => ({ ...p, village: e.target.value }))} placeholder="Village"
                          style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-card)', borderRadius: '10px', padding: '11px 14px', color: '#fff', fontSize: '13px', outline: 'none' }}
                          onFocus={e => e.target.style.borderColor = 'rgba(16,185,129,0.5)'} onBlur={e => e.target.style.borderColor = 'var(--border-card)'} required />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '6px' }}>District *</label>
                        <select value={regForm.district} onChange={e => setRegForm(p => ({ ...p, district: e.target.value }))}
                          style={{ width: '100%', background: '#0d1f10', border: '1px solid var(--border-card)', borderRadius: '10px', padding: '11px 14px', color: '#fff', fontSize: '13px', outline: 'none' }}>
                          {['Nalgonda','Warangal','Khammam','Karimnagar','Nizamabad','Medak','Rangareddy','Adilabad'].map(d => (
                            <option key={d} value={d}>{d}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '6px' }}>Land (Acres) *</label>
                        <input type="number" step="0.1" min="0.1" value={regForm.land_size_acres} onChange={e => setRegForm(p => ({ ...p, land_size_acres: e.target.value }))} placeholder="4.5"
                          style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-card)', borderRadius: '10px', padding: '11px 14px', color: '#fff', fontSize: '13px', outline: 'none' }}
                          onFocus={e => e.target.style.borderColor = 'rgba(16,185,129,0.5)'} onBlur={e => e.target.style.borderColor = 'var(--border-card)'} required />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '6px' }}>Soil Type</label>
                        <select value={regForm.soil_type} onChange={e => setRegForm(p => ({ ...p, soil_type: e.target.value }))}
                          style={{ width: '100%', background: '#0d1f10', border: '1px solid var(--border-card)', borderRadius: '10px', padding: '11px 14px', color: '#fff', fontSize: '13px', outline: 'none' }}>
                          {['Red Sandy','Black Clayey','Loamy','Laterite','Alluvial'].map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '6px' }}>Water Source</label>
                      <select value={regForm.water_source} onChange={e => setRegForm(p => ({ ...p, water_source: e.target.value }))}
                        style={{ width: '100%', background: '#0d1f10', border: '1px solid var(--border-card)', borderRadius: '10px', padding: '11px 14px', color: '#fff', fontSize: '13px', outline: 'none' }}>
                        {['Borewell','Canal','Rain-fed','River','Tank','Drip Irrigation'].map(w => <option key={w} value={w}>{w}</option>)}
                      </select>
                    </div>

                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button type="button" onClick={() => setStep(1)} style={{ flex: '0 0 auto', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-card)', borderRadius: '10px', padding: '12px 16px', color: 'var(--text-secondary)', fontSize: '13px', cursor: 'pointer' }}>← Back</button>
                      <button type="submit" disabled={loading} className="btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
                        <UserPlus className="w-4 h-4" />
                        <span>{loading ? 'Registering...' : 'Register & Get OTP'}</span>
                      </button>
                    </div>
                  </form>
                ) : (
                  <form onSubmit={handleVerifyOtp} className="space-y-5">
                    <div style={{ background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.15)', borderRadius: '10px', padding: '12px 16px', textAlign: 'center' }}>
                      <p style={{ fontSize: '12px', color: '#10b981', fontFamily: 'monospace' }}>OTP sent to +91 {phone}</p>
                      <button type="button" onClick={() => setStep(1)} style={{ fontSize: '11px', color: '#38bdf8', textDecoration: 'underline', marginTop: '4px', background: 'none', border: 'none', cursor: 'pointer' }}>{lt.changeNumber}</button>
                    </div>

                    {devOtp && (
                      <div style={{ background: 'rgba(251,191,36,0.07)', border: '1px dashed rgba(251,191,36,0.4)', borderRadius: '10px', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <AlertCircle style={{ width: '14px', height: '14px', color: '#fbbf24', flexShrink: 0 }} />
                        <p style={{ fontSize: '12px', color: '#fbbf24', fontFamily: 'monospace' }}>Dev OTP: <strong style={{ fontSize: '15px', letterSpacing: '0.15em' }}>{devOtp}</strong></p>
                      </div>
                    )}

                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>
                        {lt.enterOtp}
                      </label>
                      <input
                        type="text" maxLength="6" value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                        placeholder="• • • • • •"
                        style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-card)', borderRadius: '10px', padding: '14px', color: '#ffffff', fontSize: '22px', fontFamily: 'monospace', letterSpacing: '0.4em', textAlign: 'center', outline: 'none', transition: 'border-color 0.2s' }}
                        onFocus={e => e.target.style.borderColor = 'rgba(16,185,129,0.5)'}
                        onBlur={e => e.target.style.borderColor = 'var(--border-card)'}
                        required
                      />
                    </div>

                    <button type="submit" disabled={otp.length < 4 || loading} className="btn-primary" style={{ width: '100%', justifyContent: 'center', opacity: otp.length < 4 ? 0.5 : 1 }}>
                      <ShieldCheck className="w-4 h-4" />
                      <span>{loading ? lt.verifying : lt.verifyCode}</span>
                    </button>
                  </form>
                )}

                {/* Demo access link */}
                <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid var(--border-subtle)', textAlign: 'center' }}>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '10px' }}>{lt.wantToExplore}</p>
                  <button onClick={handleDemoAccess} style={{ fontSize: '13px', fontWeight: 700, color: '#10b981', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: '3px' }}>
                    → {lt.launchDemo}
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ===================== FOOTER ===================== */}
      <footer style={{ padding: '32px 24px', borderTop: '1px solid var(--border-subtle)', textAlign: 'center' }}>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'linear-gradient(135deg,#059669,#10b981)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Sprout style={{ width: '16px', height: '16px', color: '#fff' }} />
            </div>
            <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '15px', color: '#ffffff' }}>Krishi AI</span>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            © 2026 Krishi AI — Engineered for Telangana Farmers. Built with 🌿 and AI.
          </p>
          <div className="flex gap-6">
            {['Privacy', 'Terms', 'Contact'].map(link => (
              <a key={link} href="#" style={{ fontSize: '12px', color: 'var(--text-muted)', transition: 'color 0.2s' }}
                onMouseEnter={e => e.target.style.color = '#10b981'}
                onMouseLeave={e => e.target.style.color = 'var(--text-muted)'}
              >
                {link}
              </a>
            ))}
          </div>
        </div>
      </footer>

    </div>
  );
};
