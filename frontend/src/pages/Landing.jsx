import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { sendOtp, verifyOtp, registerFarmer } from '../services/api';
import { toast } from 'react-toastify';
import {
  Sprout, Phone, ShieldCheck, ArrowRight, Sparkles,
  CloudSun, ScanLine, TrendingUp, FileText, MessageSquare,
  ChevronRight, Star, ExternalLink, UserPlus, CheckCircle2, AlertCircle,
  Volume2
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
    alreadyUsing: "Already Using Krishik AI",
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
    sandboxTitle: "Interactive AI Playgrounds",
    sandboxDesc: "Interact directly with our model simulations. Test crop disease detection, live mandi price charts, and weather voice advisories instantly.",
    sandboxTabDisease: "AI Disease Scan",
    sandboxTabMarket: "Mandi Price Chart",
    sandboxTabWeather: "Weather Voice Broadcast",
    sandboxDiseaseSub: "Select a sample leaf to run our visual classifier model:",
    sandboxDiseaseBtn: "Run AI Diagnosis",
    sandboxDiseaseScan: "Scanning plant leaf...",
    sandboxDiseaseResult: "Diagnostic Result",
    sandboxDiseaseConf: "Match Confidence",
    sandboxDiseaseRemedy: "Remedy & Action Guidelines",
    sandboxMarketSub: "Select a crop to visualize daily market prices & forecasts:",
    sandboxMarketMandi: "Warangal Mandi Yard",
    sandboxMarketPrice: "Spot Price",
    sandboxMarketTrend: "7-Day Price Curve",
    sandboxMarketAdvice: "ML Forecast Action",
    sandboxWeatherSub: "Hyperlocal weather broadcast simulation for Nalgonda district:",
    sandboxWeatherAlert: "Rain Alert: Postpone fertilizing and prepare drainage lines.",
    sandboxWeatherPlay: "Play Voice Advisory",
    sandboxWeatherPlaying: "Playing Telugu Broadcast Advisory...",
    sandboxWeatherReady: "Ready to Broadcast"
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
    sandboxTitle: "ఇంటరాక్టివ్ AI ప్లేగ్రౌండ్స్",
    sandboxDesc: "మా AI మోడల్స్ పనితీరును నేరుగా ఇక్కడ పరీక్షించండి. ఆకు తెగుళ్ళ గుర్తింపు, మార్కెట్ ధరల గ్రాఫ్‌లు మరియు వాతావరణ వాయిస్ హెచ్చరికలను ఉపయోగించండి.",
    sandboxTabDisease: "తెగుళ్ళ గుర్తింపు",
    sandboxTabMarket: "ధరల విశ్లేషణ",
    sandboxTabWeather: "వాతావరణ వాయిస్ హెచ్చరిక",
    sandboxDiseaseSub: "స్మార్ట్ క్లాసిఫైయర్ పరీక్షించుటకు పంట ఆకును ఎంపిక చేయండి:",
    sandboxDiseaseBtn: "AI నిర్ధారణ రన్ చేయండి",
    sandboxDiseaseScan: "ఆకును స్కాన్ చేస్తోంది...",
    sandboxDiseaseResult: "పంట తెగులు నిర్ధారణ",
    sandboxDiseaseConf: "ఖచ్చితత్వ శాతం",
    sandboxDiseaseRemedy: "నివారణ మరియు నివారణ మార్గదర్శకాలు",
    sandboxMarketSub: "ధరల ట్రెండ్‌లు కనుగొనుటకు పంటను ఎంపిక చేయండి:",
    sandboxMarketMandi: "వరంగల్ మార్కెట్ యార్డ్",
    sandboxMarketPrice: "ప్రస్తుత క్వింటాల్ ధర",
    sandboxMarketTrend: "7 రోజుల ధరల వ్యత్యాసం",
    sandboxMarketAdvice: "ML విక్రయ సలహా",
    sandboxWeatherSub: "నల్గొండ జిల్లాకు సంబంధించిన వాతావరణ సలహా బ్రాడ్‌కాస్ట్:",
    sandboxWeatherAlert: "వర్షం సూచన ఉంది: ఎరువులు చల్లడం వాయిదా వేయండి మరియు కాలువలు సిద్ధం చేయండి.",
    sandboxWeatherPlay: "వాయిస్ సలహా వినండి",
    sandboxWeatherPlaying: "తెలుగు వాయిస్ బ్రాడ్‌కాస్ట్ నడుస్తోంది...",
    sandboxWeatherReady: "బ్రాడ్‌కాస్ట్ సిద్ధంగా ఉంది"
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

  // Sandbox state variables
  const [sandboxTab, setSandboxTab] = useState('disease'); // 'disease' | 'market' | 'weather'

  // Disease Classifier Sandbox states
  const [selectedSandboxLeaf, setSelectedSandboxLeaf] = useState('paddy'); // 'paddy' | 'cotton' | 'chilli'
  const [isSandboxScanning, setIsSandboxScanning] = useState(false);
  const [sandboxScanDone, setSandboxScanDone] = useState(false);

  // Market Sandbox states
  const [selectedSandboxCrop, setSelectedSandboxCrop] = useState('rice'); // 'rice' | 'cotton' | 'turmeric'

  // Weather Sandbox states
  const [isSandboxAudioPlaying, setIsSandboxAudioPlaying] = useState(false);

  // Weather voice broadcast using Web Speech API (window.speechSynthesis)
  const handlePlayVoice = () => {
    if (isSandboxAudioPlaying) {
      window.speechSynthesis.cancel();
      setIsSandboxAudioPlaying(false);
    } else {
      setIsSandboxAudioPlaying(true);

      const textToSpeak = language === 'te'
        ? "నల్గొండ జిల్లా వాతావరణ హెచ్చరిక. రాబోయే రెండు రోజుల్లో భారీ వర్షాలు కురిసే అవకాశం ఉంది. దయచేసి ఎరువులు చల్లడం వాయిదా వేయండి మరియు పంట కాలువలు సిద్ధం చేసుకోండి."
        : "Nalgonda district weather warning: Heavy rainfall is expected in the next two days. Please postpone fertilizer application and prepare crop drainage lines.";

      const utterance = new SpeechSynthesisUtterance(textToSpeak);

      // Select language code
      utterance.lang = language === 'te' ? 'te-IN' : 'en-IN';

      utterance.onend = () => {
        setIsSandboxAudioPlaying(false);
      };

      utterance.onerror = () => {
        setIsSandboxAudioPlaying(false);
      };

      window.speechSynthesis.cancel(); // Stop any currently playing speech
      window.speechSynthesis.speak(utterance);
    }
  };

  // Clean up speech synthesis on component unmount
  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  const handleSandboxScan = () => {
    setIsSandboxScanning(true);
    setSandboxScanDone(false);
    setTimeout(() => {
      setIsSandboxScanning(false);
      setSandboxScanDone(true);
    }, 2000);
  };

  const handleSandboxLeafChange = (leaf) => {
    setSelectedSandboxLeaf(leaf);
    setSandboxScanDone(false);
    setIsSandboxScanning(false);
  };

  // Fresh visual data for the leaf classifier sandbox
  const sandboxLeafInfo = {
    paddy: {
      nameEn: "Rice Blast (Paddy)",
      nameTe: "వరి అగ్గి తెగులు",
      confidence: "98.7%",
      remedyEn: "Apply Tricyclazole 75 WP @ 0.6 grams per liter of water. Ensure proper field drainage.",
      remedyTe: "లీటరు నీటికి ట్రైసైక్లాజోల్ 75 WP @ 0.6 గ్రా చొప్పున పిచికారీ చేయండి. సరైన నీటి పారుదల సౌకర్యం కల్పించండి.",
      color: "#10b981", // Emerald
      spots: [
        { cx: 40, cy: 30, rx: 8, ry: 4, rot: 15 },
        { cx: 60, cy: 55, rx: 12, ry: 5, rot: -20 },
        { cx: 45, cy: 75, rx: 9, ry: 4, rot: 10 }
      ]
    },
    cotton: {
      nameEn: "Cotton Leaf Curl Virus",
      nameTe: "పత్తి ఆకు ముడుత తెగులు",
      confidence: "96.4%",
      remedyEn: "Spray Diafenthiuron 50 WP @ 1.2 grams per liter. Control sucking pests like whiteflies.",
      remedyTe: "లీటరు నీటికి డయాఫెంథియురాన్ 50 WP @ 1.2 గ్రా పిచికారీ చేయండి. తెల్ల దోమల నివారణకు చర్యలు తీసుకోండి.",
      color: "#0ea5e9", // Sky
      spots: [
        { cx: 35, cy: 45, rx: 10, ry: 6, rot: -30 },
        { cx: 65, cy: 35, rx: 8, ry: 5, rot: 45 },
        { cx: 50, cy: 70, rx: 11, ry: 7, rot: 10 }
      ]
    },
    chilli: {
      nameEn: "Chilli Powdery Mildew",
      nameTe: "మిరప బూడిద తెగులు",
      confidence: "95.2%",
      remedyEn: "Spray Wettable Sulphur @ 3 grams per liter or Hexaconazole 5 EC @ 2 ml per liter.",
      remedyTe: "లీటరు నీటికి వెటబుల్ సల్ఫర్ @ 3 గ్రా లేదా హెక్సాకోనాజోల్ 5 EC @ 2 ml చొప్పున పిచికారీ చేయండి.",
      color: "#f43f5e", // Rose
      spots: [
        { cx: 50, cy: 25, rx: 5, ry: 5, rot: 0 },
        { cx: 35, cy: 50, rx: 7, ry: 7, rot: 15 },
        { cx: 60, cy: 65, rx: 6, ry: 6, rot: -10 }
      ]
    }
  };

  // Fresh data for Mandi Price trend graph
  const sandboxMarketInfo = {
    rice: {
      nameEn: "Paddy (Grade A)",
      nameTe: "వరి (గ్రేడ్ A)",
      price: 2320,
      change: "+₹85 (3.8%)",
      trend: "up",
      forecastEn: "Hold stocks. Prices expected to rise further due to high export demands.",
      forecastTe: "నిల్వ ఉంచుకోగలరు. ఎగుమతుల గిరాకీ కారణంగా ధరలు మరింత పెరిగే అవకాశం ఉంది.",
      history: [2150, 2180, 2210, 2200, 2240, 2270, 2320]
    },
    cotton: {
      nameEn: "Cotton (J-34)",
      nameTe: "పత్తి (J-34)",
      price: 7560,
      change: "-₹140 (-1.8%)",
      trend: "down",
      forecastEn: "Sell soon. High arrivals in neighboring mandis may lower local prices.",
      forecastTe: "వెంటనే విక్రయించండి. పొరుగు మార్కెట్లకు పంట రాక ఎక్కువగా ఉండటంతో ధరలు తగ్గే అవకాశం ఉంది.",
      history: [7800, 7750, 7710, 7680, 7640, 7600, 7560]
    },
    turmeric: {
      nameEn: "Turmeric (Guntur)",
      nameTe: "పసుపు (గుంటూరు)",
      price: 11800,
      change: "+₹450 (3.9%)",
      trend: "up",
      forecastEn: "Hold for 5 days. Price peak approaching before stabilizing.",
      forecastTe: "5 రోజులు వేచి ఉండండి. స్థిరపడే ముందు గరిష్ట ధర లభించే అవకాశం ఉంది.",
      history: [10800, 11000, 11150, 11400, 11300, 11550, 11800]
    }
  };


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
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
          toast.success(`OTP sent! (Dev mode: ${data.otp_dev_only})`, { autoClose: 10000 });
        } else {
          toast.success('OTP sent successfully to your mobile number!');
        }
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
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
          toast.success(`OTP sent! (Dev mode: ${otpData.otp_dev_only})`, { autoClose: 10000 });
        }
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
      tag: "ask_Krishik_ai"
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
            <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '18px', color: '#ffffff' }}>Krishik AI</span>
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

      {/* ===================== LIVE INTERACTIVE PLAYGROUNDS ===================== */}
      <section style={{ padding: '100px 0', borderTop: '1px solid var(--border-subtle)', background: 'var(--bg-primary)' }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-12">

          {/* Section header */}
          <div className="text-center space-y-4 mb-12">
            <div className="flex justify-center">
              <span className="pill-section" style={{ borderColor: 'rgba(16,185,129,0.4)', background: 'rgba(16,185,129,0.1)', color: '#10b981' }}>
                💡 {lt.sandboxTitle}
              </span>
            </div>
            <h2 className="section-heading text-center" style={{ fontSize: 'clamp(32px, 5vw, 44px)' }}>
              {lt.sandboxTitle}
            </h2>
            <p className="section-subtext text-center mx-auto" style={{ maxWidth: '650px' }}>
              {lt.sandboxDesc}
            </p>
          </div>

          {/* Tab switches */}
          <div className="flex flex-wrap justify-center gap-3 mb-10">
            {[
              { id: 'disease', label: lt.sandboxTabDisease, icon: ScanLine },
              { id: 'market', label: lt.sandboxTabMarket, icon: TrendingUp },
              { id: 'weather', label: lt.sandboxTabWeather, icon: CloudSun }
            ].map(tab => {
              const TabIcon = tab.icon;
              const isActive = sandboxTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setSandboxTab(tab.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '12px 24px',
                    borderRadius: '12px',
                    fontSize: '14px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    background: isActive ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255,255,255,0.02)',
                    border: isActive ? '1px solid #10b981' : '1px solid var(--border-card)',
                    color: isActive ? '#10b981' : 'var(--text-secondary)'
                  }}
                  onMouseEnter={e => {
                    if (!isActive) {
                      e.target.style.borderColor = 'rgba(16, 185, 129, 0.4)';
                      e.target.style.color = '#ffffff';
                    }
                  }}
                  onMouseLeave={e => {
                    if (!isActive) {
                      e.target.style.borderColor = 'var(--border-card)';
                      e.target.style.color = 'var(--text-secondary)';
                    }
                  }}
                >
                  <TabIcon style={{ width: '16px', height: '16px' }} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Sandbox content area */}
          <div className="glass-card" style={{ padding: '40px', background: 'var(--bg-card)' }}>
            {sandboxTab === 'disease' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                {/* Left: Interactive Controls */}
                <div className="space-y-6">
                  <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 850, fontSize: '24px', color: '#ffffff' }}>
                    {lt.sandboxTabDisease}
                  </h3>
                  <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    {lt.sandboxDiseaseSub}
                  </p>

                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { id: 'paddy', label: language === 'te' ? 'వరి (Paddy)' : 'Paddy Leaf', emoji: '🌾' },
                      { id: 'cotton', label: language === 'te' ? 'పత్తి (Cotton)' : 'Cotton Leaf', emoji: '☁️' },
                      { id: 'chilli', label: language === 'te' ? 'మిరప (Chilli)' : 'Chilli Leaf', emoji: '🌶️' }
                    ].map(leaf => (
                      <button
                        key={leaf.id}
                        onClick={() => handleSandboxLeafChange(leaf.id)}
                        disabled={isSandboxScanning}
                        style={{
                          padding: '16px 12px',
                          borderRadius: '12px',
                          border: selectedSandboxLeaf === leaf.id ? '2px solid #10b981' : '1px solid var(--border-card)',
                          background: selectedSandboxLeaf === leaf.id ? 'rgba(16, 185, 129, 0.08)' : 'rgba(255,255,255,0.02)',
                          color: selectedSandboxLeaf === leaf.id ? '#10b981' : 'var(--text-secondary)',
                          cursor: isSandboxScanning ? 'not-allowed' : 'pointer',
                          transition: 'all 0.2s',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '6px',
                          fontWeight: 700,
                          fontSize: '13px'
                        }}
                      >
                        <span style={{ fontSize: '24px' }}>{leaf.emoji}</span>
                        <span>{leaf.label}</span>
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={handleSandboxScan}
                    disabled={isSandboxScanning}
                    className="btn-primary w-full justify-center"
                    style={{ marginTop: '12px' }}
                  >
                    {isSandboxScanning ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>{lt.sandboxDiseaseScan}</span>
                      </>
                    ) : (
                      <>
                        <ScanLine className="w-4 h-4" />
                        <span>{lt.sandboxDiseaseBtn}</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Right: Diagnostic Monitor Viewport */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div
                    style={{
                      aspectRatio: '1.8 / 1',
                      borderRadius: '16px',
                      background: '#040d06',
                      border: '1px solid rgba(16,185,129,0.15)',
                      position: 'relative',
                      overflow: 'hidden',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    {/* Simulated leaf SVG view */}
                    <div style={{ position: 'relative', width: '100px', height: '100px' }}>
                      <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%', fill: sandboxLeafInfo[selectedSandboxLeaf].color, opacity: 0.35, transition: 'all 0.3s' }}>
                        <path d="M50 0 C 15 25, 20 75, 50 100 C 80 75, 85 25, 50 0 Z" />
                      </svg>
                      {/* Leaf spots */}
                      <svg viewBox="0 0 100 100" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', fill: '#7c2d12', opacity: 0.75 }}>
                        {sandboxLeafInfo[selectedSandboxLeaf].spots.map((spot, i) => (
                          <ellipse
                            key={i}
                            cx={spot.cx}
                            cy={spot.cy}
                            rx={spot.rx * 0.7}
                            ry={spot.ry * 0.7}
                            transform={`rotate(${spot.rot} ${spot.cx} ${spot.cy})`}
                          />
                        ))}
                      </svg>
                    </div>

                    {/* Laser scan animation overlay */}
                    {isSandboxScanning && (
                      <div
                        className="animate-laser"
                        style={{
                          position: 'absolute',
                          left: 0,
                          right: 0,
                          height: '2px',
                          background: '#10b981',
                          boxShadow: '0 0 12px 3px rgba(16,185,129,0.85)',
                          pointerEvents: 'none'
                        }}
                      />
                    )}

                    {/* Initial status indicator */}
                    {!isSandboxScanning && !sandboxScanDone && (
                      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                          Sensor Offline — Awaiting Scan
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Diagnosis Report Card */}
                  {sandboxScanDone && !isSandboxScanning && (
                    <div
                      style={{
                        background: 'rgba(255,255,255,0.02)',
                        border: '1px solid var(--border-card)',
                        borderRadius: '12px',
                        padding: '20px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                        <div>
                          <span style={{ display: 'block', fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            {lt.sandboxDiseaseResult}:
                          </span>
                          <h4 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '18px', color: '#10b981', marginTop: '4px' }}>
                            {language === 'te' ? sandboxLeafInfo[selectedSandboxLeaf].nameTe : sandboxLeafInfo[selectedSandboxLeaf].nameEn}
                          </h4>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <span style={{ display: 'block', fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            {lt.sandboxDiseaseConf}:
                          </span>
                          <span style={{ fontFamily: 'monospace', fontWeight: 800, fontSize: '18px', color: '#10b981', display: 'block', marginTop: '4px' }}>
                            {sandboxLeafInfo[selectedSandboxLeaf].confidence}
                          </span>
                        </div>
                      </div>

                      <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '10px' }}>
                        <span style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#fbbf24', marginBottom: '4px' }}>
                          🛡️ {lt.sandboxDiseaseRemedy}:
                        </span>
                        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                          {language === 'te' ? sandboxLeafInfo[selectedSandboxLeaf].remedyTe : sandboxLeafInfo[selectedSandboxLeaf].remedyEn}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {sandboxTab === 'market' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                {/* Left Controls */}
                <div className="space-y-6">
                  <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 850, fontSize: '24px', color: '#ffffff' }}>
                    {lt.sandboxTabMarket}
                  </h3>
                  <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    {lt.sandboxMarketSub}
                  </p>

                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { id: 'rice', label: language === 'te' ? 'వరి (Rice)' : 'Paddy', emoji: '🌾' },
                      { id: 'cotton', label: language === 'te' ? 'పత్తి (Cotton)' : 'Cotton', emoji: '☁️' },
                      { id: 'turmeric', label: language === 'te' ? 'పసుపు (Turmeric)' : 'Turmeric', emoji: '🌿' }
                    ].map(crop => (
                      <button
                        key={crop.id}
                        onClick={() => setSelectedSandboxCrop(crop.id)}
                        style={{
                          padding: '16px 12px',
                          borderRadius: '12px',
                          border: selectedSandboxCrop === crop.id ? '2px solid #fbbf24' : '1px solid var(--border-card)',
                          background: selectedSandboxCrop === crop.id ? 'rgba(251, 191, 36, 0.08)' : 'rgba(255,255,255,0.02)',
                          color: selectedSandboxCrop === crop.id ? '#fbbf24' : 'var(--text-secondary)',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '6px',
                          fontWeight: 700,
                          fontSize: '13px'
                        }}
                      >
                        <span style={{ fontSize: '24px' }}>{crop.emoji}</span>
                        <span>{crop.label}</span>
                      </button>
                    ))}
                  </div>

                  <div style={{ background: 'rgba(251, 191, 36, 0.05)', border: '1px solid rgba(251, 191, 36, 0.25)', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#fbbf24' }}>
                      📈 {lt.sandboxMarketAdvice}:
                    </span>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                      {language === 'te' ? sandboxMarketInfo[selectedSandboxCrop].forecastTe : sandboxMarketInfo[selectedSandboxCrop].forecastEn}
                    </p>
                  </div>
                </div>

                {/* Right Visualizer */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {/* Prices Banner */}
                  <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-card)', borderRadius: '12px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span style={{ display: 'block', fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        {lt.sandboxMarketMandi}
                      </span>
                      <h4 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '18px', color: '#ffffff', marginTop: '4px' }}>
                        {language === 'te' ? sandboxMarketInfo[selectedSandboxCrop].nameTe : sandboxMarketInfo[selectedSandboxCrop].nameEn}
                      </h4>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ display: 'block', fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        {lt.sandboxMarketPrice}:
                      </span>
                      <span style={{ display: 'block', fontFamily: 'monospace', fontWeight: 900, fontSize: '20px', color: '#ffffff', marginTop: '4px' }}>
                        ₹{sandboxMarketInfo[selectedSandboxCrop].price.toLocaleString()}/q
                      </span>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: sandboxMarketInfo[selectedSandboxCrop].trend === 'up' ? '#10b981' : '#f43f5e', marginTop: '2px', display: 'block' }}>
                        {sandboxMarketInfo[selectedSandboxCrop].change}
                      </span>
                    </div>
                  </div>

                  {/* SVG Chart */}
                  <div style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-card)', borderRadius: '16px', padding: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                        {lt.sandboxMarketTrend}
                      </span>
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                        11 Jun – 17 Jun
                      </span>
                    </div>

                    {/* SVG Curve drawing */}
                    <div style={{ width: '100%', overflow: 'visible' }}>
                      <svg viewBox="0 0 320 100" style={{ width: '100%', height: 'auto', overflow: 'visible' }}>
                        <defs>
                          <linearGradient id="chart-glow-grad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.25" />
                            <stop offset="100%" stopColor="#fbbf24" stopOpacity="0.0" />
                          </linearGradient>
                        </defs>

                        {/* Grid lines */}
                        <line x1="0" y1="20" x2="320" y2="20" stroke="rgba(255,255,255,0.03)" strokeWidth="1" strokeDasharray="3 3" />
                        <line x1="0" y1="50" x2="320" y2="50" stroke="rgba(255,255,255,0.03)" strokeWidth="1" strokeDasharray="3 3" />
                        <line x1="0" y1="80" x2="320" y2="80" stroke="rgba(255,255,255,0.07)" strokeWidth="1" />

                        {/* Graph Path */}
                        {(() => {
                          const history = sandboxMarketInfo[selectedSandboxCrop].history;
                          const min = Math.min(...history);
                          const max = Math.max(...history);
                          const range = max - min || 1;

                          const points = history.map((val, idx) => {
                            const x = (idx * 320) / (history.length - 1);
                            const y = 80 - ((val - min) * 60) / range;
                            return { x, y };
                          });

                          let d = `M ${points[0].x} ${points[0].y}`;
                          for (let i = 1; i < points.length; i++) {
                            d += ` L ${points[i].x} ${points[i].y}`;
                          }

                          let areaD = `${d} L ${points[points.length - 1].x} 80 L ${points[0].x} 80 Z`;

                          return (
                            <>
                              <path d={areaD} fill="url(#chart-glow-grad)" style={{ transition: 'all 0.3s' }} />
                              <path d={d} fill="none" stroke="#fbbf24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transition: 'all 0.3s' }} />
                              {points.map((p, idx) => (
                                <circle
                                  key={idx}
                                  cx={p.x}
                                  cy={p.y}
                                  r="3.5"
                                  fill="#071209"
                                  stroke="#fbbf24"
                                  strokeWidth="1.5"
                                  style={{ transition: 'all 0.3s' }}
                                />
                              ))}
                            </>
                          );
                        })()}
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {sandboxTab === 'weather' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                {/* Left Controls */}
                <div className="space-y-6">
                  <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 850, fontSize: '24px', color: '#ffffff' }}>
                    {lt.sandboxTabWeather}
                  </h3>
                  <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    {lt.sandboxWeatherSub}
                  </p>

                  <button
                    onClick={handlePlayVoice}
                    className="btn-primary w-full justify-center"
                    style={{
                      background: isSandboxAudioPlaying ? 'linear-gradient(135deg, #f43f5e, #e11d48)' : 'linear-gradient(135deg, #0284c7, #0369a1)',
                      boxShadow: isSandboxAudioPlaying ? '0 4px 20px rgba(244,63,94,0.35)' : '0 4px 20px rgba(2,132,199,0.35)'
                    }}
                  >
                    {isSandboxAudioPlaying ? (
                      <>
                        <div className="w-2.5 h-2.5 bg-white rounded-full animate-ping" />
                        <span>Stop Broadcast</span>
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-4 h-4" />
                        <span>{lt.sandboxWeatherPlay}</span>
                      </>
                    )}
                  </button>

                  <div style={{ background: 'rgba(56, 189, 248, 0.05)', border: '1px solid rgba(56, 189, 248, 0.25)', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#38bdf8' }}>
                      📢 Broadcast Status:
                    </span>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#ffffff' }}>
                      {isSandboxAudioPlaying ? lt.sandboxWeatherPlaying : lt.sandboxWeatherReady}
                    </span>
                  </div>
                </div>

                {/* Right Visualizer */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {/* Localized message card */}
                  <div
                    style={{
                      background: 'rgba(255,255,255,0.02)',
                      border: '1px solid var(--border-card)',
                      borderRadius: '16px',
                      padding: '24px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      textAlign: 'center',
                      gap: '16px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className="relative flex h-2.5 w-2.5">
                        <span className={`absolute inline-flex h-full w-full rounded-full bg-sky-500 opacity-75 ${isSandboxAudioPlaying ? 'animate-ping' : ''}`} />
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-sky-500" />
                      </span>
                      <span style={{ fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                        Hyperlocal Meteorological Center
                      </span>
                    </div>

                    <div style={{ fontSize: '42px' }}>🌦️</div>

                    <p style={{ fontSize: '14px', color: 'var(--text-secondary)', fontWeight: 600, lineHeight: 1.6 }}>
                      {lt.sandboxWeatherAlert}
                    </p>

                    {/* Soundwave equalizer */}
                    {isSandboxAudioPlaying && (
                      <div style={{ display: 'flex', alignItems: 'end', gap: '3px', height: '32px', padding: '0 10px', marginTop: '10px' }}>
                        {[...Array(6)].map((_, i) => (
                          <div
                            key={i}
                            className="animate-audio-bar"
                            style={{
                              width: '3px',
                              background: '#38bdf8',
                              borderRadius: '2px',
                              height: '100%',
                              animationDelay: `${i * 0.12}s`,
                              animationDuration: `${[0.7, 0.9, 0.6, 0.8, 0.5, 0.75][i]}s`
                            }}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
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
                          {['Nalgonda', 'Warangal', 'Khammam', 'Karimnagar', 'Nizamabad', 'Medak', 'Rangareddy', 'Adilabad'].map(d => (
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
                          {['Red Sandy', 'Black Clayey', 'Loamy', 'Laterite', 'Alluvial'].map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '6px' }}>Water Source</label>
                      <select value={regForm.water_source} onChange={e => setRegForm(p => ({ ...p, water_source: e.target.value }))}
                        style={{ width: '100%', background: '#0d1f10', border: '1px solid var(--border-card)', borderRadius: '10px', padding: '11px 14px', color: '#fff', fontSize: '13px', outline: 'none' }}>
                        {['Borewell', 'Canal', 'Rain-fed', 'River', 'Tank', 'Drip Irrigation'].map(w => <option key={w} value={w}>{w}</option>)}
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

                    {devOtp && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') && (
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
            <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '15px', color: '#ffffff' }}>Krishik AI</span>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            © 2026 Krishik AI — Engineered for Telangana Farmers. Built with 🌿 and AI.
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
