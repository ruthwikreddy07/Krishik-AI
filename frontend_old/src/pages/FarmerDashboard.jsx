import React, { useState } from 'react';
import {
  Bell,
  CloudSun,
  Camera,
  MessageSquare,
  Coins,
  HelpCircle,
  TrendingUp,
  TrendingDown,
  Calendar,
  CheckCircle2,
  X,
  Send,
  Search,
  Check,
  ChevronRight,
  ShieldAlert,
  ArrowRight,
  Info,
  Clock,
  Sparkles,
  Droplets,
  Wind
} from 'lucide-react';

import { CropCard, StatusChip, PriceTag, WeatherBadge } from '../components';

export default function FarmerDashboard({ onNavigateToScanner, onNavigateToChat, onNavigateToMarket, onNavigateToFarm, onNavigateToWeather, onNavigateToSchemes, onNavigateToNotifications }) {
  // --- Local states for modals/drawers ---
  const [showWeatherModal, setShowWeatherModal] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);
  const [showPricesModal, setShowPricesModal] = useState(false);
  const [showSchemesModal, setShowSchemesModal] = useState(false);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);

  // --- 1. Notification States ---
  const [notifications, setNotifications] = useState([
    { id: 1, type: 'danger', textTe: '🔴 తెగులు హెచ్చరిక: సరుపేట వద్ద బ్రౌన్ ప్లాంట్ హాపర్ తెగులు గుర్తించబడింది.', textEn: 'Pest Alert: Brown Plant Hopper detected nearby in Suryapet area.', read: false, time: '5 mins ago' },
    { id: 2, type: 'warning', textTe: '🟡 మార్కెట్ అప్‌డేట్: ఖమ్మం యార్డులో పత్తి ధర క్వింటాలుకు 8% పెరిగింది.', textEn: 'Market Alert: Cotton prices risen 8% in Khammam Mandi today.', read: false, time: '2 hours ago' },
    { id: 3, type: 'success', textTe: '🟢 రిమైండర్: రేపు వరి పంటకు యూరియా వేయవలసి ఉంది.', textEn: 'Reminder: Nitrogen fertilizer application due tomorrow for paddy.', read: false, time: '5 hours ago' }
  ]);

  // --- 2. Leaf Disease Scanner State ---
  // Managed externally in CropDiseaseScanner.jsx

  // --- 3. Live Price Chart State ---
  const [selectedCrop, setSelectedCrop] = useState('rice');

  // --- 4. Chat Assistant State ---
  const [chatMessages, setChatMessages] = useState([
    { sender: 'ai', te: 'నమస్కారం! నేను కృషి AI సహాయకుడిని. పంట తెగుళ్ళు, మార్కెట్ ధరలు లేదా వాతావరణం గురించి అడగండి.', en: 'Namaskaram! I am your Krushi AI agronomist. Ask me about crop health, prices, or fertilizing schedule.' },
    { sender: 'user', te: 'వరి నాట్లు వేసి 25 రోజులు అయింది. ఏ ఎరువు వేయాలి?', en: 'It has been 25 days since sowing rice. What fertilizer should I apply?' },
    { sender: 'ai', te: 'వరి నాటిన 25-30 రోజులకు మొదటి విడతగా ఎకరాకు 30-40 కిలోల యూరియా మరియు 10 కిలోల పొటాష్ ఎరువును వేయడం చాలా అవసరం.', en: 'For 25-30 days old paddy, apply 30-40 kg Urea and 10 kg MOP (Potash) per acre as the first top dressing.' }
  ]);
  const [userQuery, setUserQuery] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  // --- 5. Government Schemes State ---
  const [searchQuery, setSearchQuery] = useState('');
  const schemesList = [
    { titleTe: 'రైతు బంధు పథకం', titleEn: 'Rythu Bandhu Scheme', amount: '₹10,000 per year', bodyTe: 'తెలంగాణ రైతులకు పెట్టుబడి సహాయం అందించే ప్రభుత్వ పథకం. ప్రతి ఎకరానికి సంవత్సరానికి ₹10,000 నగదు జమ.', bodyEn: 'Investment support scheme by Telangana State Govt. ₹10,000 provided per acre annually for seeds and fertilizers.' },
    { titleTe: 'రైతు బీమా పథకం', titleEn: 'Rythu Bima Scheme', amount: '₹5,00,000 Insurance', bodyTe: 'రైతు కుటుంబానికి గ్రూప్ లైఫ్ ఇన్సూరెన్స్ సదుపాయం. రైతు మరణిస్తే కుటుంబానికి ₹5 లక్షల పరిహారం.', bodyEn: 'Group Life Insurance scheme for farmers. Provides ₹5 Lakh benefit to the nominee family in case of farmer demise.' },
    { titleTe: 'పీఎం కిసాన్ సమ్మాన్ నిధి', titleEn: 'PM-KISAN Samman Nidhi', amount: '₹6,000 per year', bodyTe: 'కేంద్ర ప్రభుత్వం నుండి ప్రతి సంవత్సరం మూడు విడతల్లో ₹2,000 చొప్పున మొత్తం ₹6,000 పెట్టుబడి సహాయం.', bodyEn: 'Central Government scheme providing financial benefit of ₹6,000 per year in three equal installments to farmer accounts.' },
    { titleTe: 'ఉచిత విద్యుత్ పథకం', titleEn: 'Free 24/7 Power Supply', amount: 'Free Electricity', bodyTe: 'వ్యవసాయ బావులకు మరియు బోరుబావులకు 24 గంటల ఉచిత నాణ్యమైన విద్యుత్ సరఫరా.', bodyEn: 'Free uninterrupted quality power supply provided to all agricultural pump-sets in Telangana.' }
  ];

  // --- 6. Timeline Checklist State ---
  const [tasks, setTasks] = useState([
    { id: 1, day: 'నేడు / Today', taskTe: 'వరి పంటకు యూరియా దరఖాస్తు', taskEn: 'Apply Urea fertilizer to Paddy field', done: false },
    { id: 2, day: 'రేపు / Tomorrow', taskTe: 'పత్తి చేను కలుపు తీయుట', taskEn: 'Manual weeding in Cotton plot', done: false },
    { id: 3, day: '19 Jun', taskTe: 'బోరుబావి వద్ద కరెంట్ టైమర్ తనిఖీ', taskEn: 'Inspect well water pump timer', done: false },
    { id: 4, day: '21 Jun', taskTe: 'వరంగల్ మార్కెట్లో వరి ధర పరిశీలన', taskEn: 'Compare Paddy mandi price trends', done: false }
  ]);

  const toggleTask = (id) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, done: !t.done } : t));
  };

  const completedCount = tasks.filter(t => t.done).length;
  const progressPercent = Math.round((completedCount / tasks.length) * 100);

  // Mock scanner logic removed as scanner is now a dedicated page

  // --- Price Chart coordinate calculator ---
  const cropPrices = {
    rice: { current: 2280, history: [2150, 2175, 2160, 2200, 2210, 2245, 2280], dates: ['11 Jun', '12 Jun', '13 Jun', '14 Jun', '15 Jun', '16 Jun', '17 Jun'] },
    cotton: { current: 7420, history: [7650, 7600, 7550, 7500, 7460, 7480, 7420], dates: ['11 Jun', '12 Jun', '13 Jun', '14 Jun', '15 Jun', '16 Jun', '17 Jun'] },
    maize: { current: 2110, history: [2080, 2075, 2090, 2085, 2100, 2095, 2110], dates: ['11 Jun', '12 Jun', '13 Jun', '14 Jun', '15 Jun', '16 Jun', '17 Jun'] },
    groundnut: { current: 6350, history: [6350, 6300, 6320, 6350, 6350, 6340, 6350], dates: ['11 Jun', '12 Jun', '13 Jun', '14 Jun', '15 Jun', '16 Jun', '17 Jun'] }
  };

  const activePriceData = cropPrices[selectedCrop];
  const minPrice = Math.min(...activePriceData.history);
  const maxPrice = Math.max(...activePriceData.history);
  const priceRange = maxPrice - minPrice || 1;
  const svgPoints = activePriceData.history.map((val, idx) => {
    const x = 40 + (idx * 320) / (activePriceData.history.length - 1);
    const y = 120 - ((val - minPrice) * 100) / priceRange;
    return { x, y };
  });
  let pathD = `M ${svgPoints[0].x} ${svgPoints[0].y}`;
  for (let i = 1; i < svgPoints.length; i++) {
    pathD += ` L ${svgPoints[i].x} ${svgPoints[i].y}`;
  }
  const areaD = `${pathD} L ${svgPoints[svgPoints.length - 1].x} 140 L ${svgPoints[0].x} 140 Z`;

  // --- Send Chat Message logic ---
  const handleSendChat = (e) => {
    e.preventDefault();
    if (!userQuery.trim()) return;

    const query = userQuery;
    setChatMessages(prev => [...prev, { sender: 'user', te: query, en: query }]);
    setUserQuery('');
    setChatLoading(true);

    setTimeout(() => {
      setChatLoading(false);
      setChatMessages(prev => [...prev, {
        sender: 'ai',
        te: 'మీ ప్రశ్నకు ధన్యవాదాలు! నేను దీనిని విశ్లేషిస్తున్నాను. పంట వివరాలు మరియు తాజా అప్‌డేట్‌లను బట్టి తదుపరి నివేదిక అందుతుంది.',
        en: 'Thank you for your question. I am analyzing this according to recent crop advisories and local parameters.'
      }]);
    }, 1500);
  };

  return (
    <div className="bg-krushi-bg min-h-screen text-krushi-text select-none pb-24 md:pb-12 animate-[fade-in_0.3s_ease-out]">

      {/* TOP GREETING BAR */}
      <div className="bg-white border-b border-gray-200/60 sticky top-16 md:top-0 z-30 px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between shadow-sm">
        
        {/* Welcome message */}
        <div className="flex items-center gap-2">
          <span className="text-xl sm:text-2xl animate-wave-hand">👋</span>
          <div>
            <h1 className="text-sm sm:text-base font-black text-krushi-green tracking-wide">
              నమస్కారం, రామయ్య గారు 🙏
            </h1>
            <span className="block text-[10px] text-krushi-muted font-bold -mt-0.5">
              Welcome back, Ramayya | ID: KR-9042
            </span>
          </div>
        </div>

        {/* Right widgets (Weather & Notification Bell) */}
        <div className="flex items-center gap-3">
          
          {/* Top Weather Widget Pill */}
          <button
            onClick={() => onNavigateToWeather && onNavigateToWeather()}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-krushi-green-pale hover:bg-krushi-green-pale/80 text-krushi-green-dark border border-krushi-green-light/10 text-xs font-bold cursor-pointer transition-colors shadow-xs"
          >
            <span>🌤️ 28°C</span>
            <span className="border-l border-krushi-green/20 pl-2 text-krushi-green font-medium">Warangal</span>
          </button>

          {/* Notification Bell with red dot */}
          <div className="relative">
            <button
              onClick={() => onNavigateToNotifications && onNavigateToNotifications()}
              className="p-2 rounded-xl hover:bg-gray-100 text-krushi-text transition-colors relative cursor-pointer"
            >
              <Bell size={19} />
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse" />
            </button>

            {/* Notification dropdown dialog */}
            {showNotifDropdown && (
              <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white border border-gray-200 rounded-2xl shadow-modal p-4 z-50 animate-[fade-in_0.15s_ease-out]">
                <div className="flex justify-between items-center border-b border-gray-100 pb-2 mb-2.5">
                  <span className="text-xs font-bold text-krushi-text">తాజా నోటిఫికేషన్లు (Alerts)</span>
                  <button
                    onClick={() => setShowNotifDropdown(false)}
                    className="p-0.5 hover:bg-gray-100 rounded-full text-krushi-muted"
                  >
                    <X size={14} />
                  </button>
                </div>
                <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                  {notifications.map((notif) => (
                    <div key={notif.id} className="p-2.5 bg-krushi-bg rounded-xl border border-gray-150/50 space-y-1">
                      <p className="text-telugu text-xs font-medium text-krushi-text leading-snug">
                        {notif.textTe}
                      </p>
                      <p className="text-[10px] text-krushi-muted">
                        {notif.textEn}
                      </p>
                      <span className="text-[8px] font-mono text-krushi-muted block text-right mt-1">
                        {notif.time}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* HERO WEATHER ADVISORY CARD */}
        <section className="bg-gradient-to-br from-krushi-green to-krushi-green-dark text-white rounded-3xl p-6 shadow-md border border-white/10 relative overflow-hidden">
          
          {/* Subtle geometric circles in hero background */}
          <div className="absolute -top-10 -left-10 w-40 h-40 bg-white/5 rounded-full border border-white/5 pointer-events-none" />
          <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-krushi-green-light/20 rounded-full blur-2xl pointer-events-none" />

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center z-10 relative">
            
            {/* Today weather details */}
            <div
              onClick={() => onNavigateToWeather && onNavigateToWeather()}
              className="md:col-span-4 flex items-center gap-4 border-b md:border-b-0 md:border-r border-white/10 pb-4 md:pb-0 md:pr-6 cursor-pointer hover:opacity-90 transition-opacity"
            >
              <span className="text-5xl animate-float-slow select-none">🌦️</span>
              <div>
                <span className="text-[10px] font-bold text-krushi-green-pale tracking-wider uppercase">Today's Weather Forecast</span>
                <h2 className="text-2xl font-black">28°C</h2>
                <p className="text-xs text-krushi-green-pale">పాక్షికంగా మేఘావృతం / Light Rainfall chances</p>
              </div>
            </div>

            {/* Daily advisory banner */}
            <div className="md:col-span-8 space-y-3.5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-krushi-amber/25 text-krushi-amber-light text-[10px] font-extrabold uppercase border border-krushi-amber/35">
                <Sparkles size={10} className="animate-spin-slow" />
                <span>కీలక సలహా / AI Daily Agronomy Tip</span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white tracking-wide text-telugu leading-snug">
                "వరి పంటకు నేడు నీరు పోయకండి — వర్షం అవకాశం 70%"
              </h3>
              <p className="text-xs text-krushi-green-pale">
                (Avoid rice irrigation today due to 70% rain probability. Postpone spraying fertilizers.)
              </p>

              {/* 5-day mini forecast strip */}
              <div className="pt-4 border-t border-white/10">
                <span className="text-[9px] text-krushi-green-pale font-bold uppercase tracking-wider block mb-2">5-Day Outlook</span>
                <div className="grid grid-cols-5 gap-2 text-center text-xs">
                  {[
                    { day: 'Wed', temp: '28°', icon: '🌤️' },
                    { day: 'Thu', temp: '26°', icon: '🌧️' },
                    { day: 'Fri', temp: '27°', icon: '⛈️' },
                    { day: 'Sat', temp: '29°', icon: '⛅' },
                    { day: 'Sun', temp: '30°', icon: '☀️' }
                  ].map((f, idx) => (
                    <div key={idx} className="bg-white/10 rounded-xl p-1.5 border border-white/5">
                      <span className="text-[9px] text-krushi-green-pale font-bold block">{f.day}</span>
                      <span className="text-base my-0.5 block">{f.icon}</span>
                      <span className="font-extrabold block">{f.temp}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* QUICK ACTION GRID */}
        <section className="space-y-3">
          <span className="text-xs uppercase tracking-widest font-extrabold text-krushi-amber">త్వరిత సేవలు / Quick Actions</span>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Action 1: Crop Scan */}
            <button
              onClick={() => onNavigateToScanner && onNavigateToScanner(null)}
              className="bg-white border border-krushi-green-light/25 hover:border-krushi-green p-4 rounded-2xl shadow-sm text-left group transition-all duration-250 cursor-pointer hover:-translate-y-1 hover:shadow-glow flex items-start gap-3"
            >
              <div className="w-10 h-10 rounded-xl bg-krushi-green-pale text-krushi-green flex items-center justify-center transition-transform group-hover:scale-110">
                <Camera size={20} />
              </div>
              <div>
                <span className="text-xs text-krushi-muted font-bold block">పంట తెగులు</span>
                <h3 className="text-sm font-extrabold text-krushi-text">Crop Scan</h3>
                <span className="text-[9px] text-krushi-green block mt-0.5 font-semibold">Diagnose Now →</span>
              </div>
            </button>

            {/* Action 2: AI Chat */}
            <button
              onClick={() => onNavigateToChat && onNavigateToChat()}
              className="bg-white border border-krushi-amber/25 hover:border-krushi-amber p-4 rounded-2xl shadow-sm text-left group transition-all duration-250 cursor-pointer hover:-translate-y-1 hover:shadow-md hover:shadow-krushi-amber/15 flex items-start gap-3"
            >
              <div className="w-10 h-10 rounded-xl bg-krushi-amber-light text-krushi-amber flex items-center justify-center transition-transform group-hover:scale-110">
                <MessageSquare size={20} />
              </div>
              <div>
                <span className="text-xs text-krushi-muted font-bold block">AI సలహాదారు</span>
                <h3 className="text-sm font-extrabold text-krushi-text">AI Chat</h3>
                <span className="text-[9px] text-krushi-amber block mt-0.5 font-semibold">Ask Assistant →</span>
              </div>
            </button>

            {/* Action 3: Prices */}
            <button
              onClick={() => onNavigateToMarket && onNavigateToMarket()}
              className="bg-white border-blue-200 hover:border-blue-500 p-4 rounded-2xl shadow-sm text-left group transition-all duration-250 cursor-pointer hover:-translate-y-1 hover:shadow-md hover:shadow-blue-500/15 flex items-start gap-3"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center transition-transform group-hover:scale-110">
                <Coins size={20} />
              </div>
              <div>
                <span className="text-xs text-krushi-muted font-bold block">మార్కెట్ ధరలు</span>
                <h3 className="text-sm font-extrabold text-krushi-text">Live Prices</h3>
                <span className="text-[9px] text-blue-600 block mt-0.5 font-semibold">View Mandis →</span>
              </div>
            </button>

            {/* Action 4: Schemes */}
            <button
              onClick={() => onNavigateToSchemes && onNavigateToSchemes()}
              className="bg-white border-purple-200 hover:border-purple-500 p-4 rounded-2xl shadow-sm text-left group transition-all duration-250 cursor-pointer hover:-translate-y-1 hover:shadow-md hover:shadow-purple-500/15 flex items-start gap-3"
            >
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center transition-transform group-hover:scale-110">
                <HelpCircle size={20} />
              </div>
              <div>
                <span className="text-xs text-krushi-muted font-bold block">పథకాలు</span>
                <h3 className="text-sm font-extrabold text-krushi-text">Schemes</h3>
                <span className="text-[9px] text-purple-600 block mt-0.5 font-semibold">Government →</span>
              </div>
            </button>

          </div>
        </section>

        {/* MIDDLE SECTION - CROPS & ALERTS SPLIT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* LEFT: MY CROPS (8 COLS) */}
          <section className="lg:col-span-8 space-y-3">
            <span className="text-xs uppercase tracking-widest font-extrabold text-krushi-amber">నా పంటలు / My Active Crops</span>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Crop 1 Card */}
              <div
                onClick={() => onNavigateToFarm && onNavigateToFarm()}
                className="bg-white p-5 rounded-2xl shadow-sm border border-krushi-green-light/20 flex flex-col justify-between space-y-4 group cursor-pointer hover:border-krushi-green transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div className="flex gap-3 items-center">
                    <span className="text-3xl p-2 bg-krushi-green-pale rounded-xl group-hover:scale-105 transition-transform">🌾</span>
                    <div>
                      <h3 className="font-extrabold text-krushi-text text-sm sm:text-base">వరి పంట</h3>
                      <span className="text-[10px] text-krushi-muted block">Rice Paddy | Grade A</span>
                    </div>
                  </div>
                  <span className="relative flex h-2.5 w-2.5" title="Healthy crop status">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-krushi-success opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-krushi-success" />
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-xs border-y border-gray-100 py-2.5">
                  <div>
                    <span className="text-[9px] text-krushi-muted block">Sown Date</span>
                    <strong className="text-krushi-text">15 June 2026</strong>
                  </div>
                  <div>
                    <span className="text-[9px] text-krushi-muted block">Days Left to Harvest</span>
                    <strong className="text-krushi-text">45 Days</strong>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-[10px] font-bold">
                    <span className="text-krushi-green">Stage: Tillering (పిలక దశ)</span>
                    <span className="text-krushi-muted">55% Complete</span>
                  </div>
                  <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-gradient-to-r from-krushi-amber to-krushi-green h-2 rounded-full" style={{ width: '55%' }}></div>
                  </div>
                </div>
              </div>

              {/* Crop 2 Card */}
              <div
                onClick={() => onNavigateToFarm && onNavigateToFarm()}
                className="bg-white p-5 rounded-2xl shadow-sm border border-krushi-green-light/20 flex flex-col justify-between space-y-4 group cursor-pointer hover:border-krushi-green transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div className="flex gap-3 items-center">
                    <span className="text-3xl p-2 bg-krushi-amber-light rounded-xl group-hover:scale-105 transition-transform">☁️</span>
                    <div>
                      <h3 className="font-extrabold text-krushi-text text-sm sm:text-base">పత్తి పంట</h3>
                      <span className="text-[10px] text-krushi-muted block">Cotton Crop | BG-II</span>
                    </div>
                  </div>
                  <span className="relative flex h-2.5 w-2.5" title="Monitoring needed">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-krushi-amber opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-krushi-amber" />
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-xs border-y border-gray-100 py-2.5">
                  <div>
                    <span className="text-[9px] text-krushi-muted block">Sown Date</span>
                    <strong className="text-krushi-text">01 June 2026</strong>
                  </div>
                  <div>
                    <span className="text-[9px] text-krushi-muted block">Days Left to Harvest</span>
                    <strong className="text-krushi-text">90 Days</strong>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-[10px] font-bold">
                    <span className="text-krushi-amber">Stage: Flowering (పూత దశ)</span>
                    <span className="text-krushi-muted">25% Complete</span>
                  </div>
                  <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-gradient-to-r from-krushi-amber to-krushi-green-light h-2 rounded-full" style={{ width: '25%' }}></div>
                  </div>
                </div>
              </div>

            </div>
          </section>

          {/* RIGHT: RECENT ALERTS (4 COLS) */}
          <section className="lg:col-span-4 space-y-3">
            <span className="text-xs uppercase tracking-widest font-extrabold text-krushi-amber">తాజా హెచ్చరికలు / Recent Alerts</span>
            
            <div className="space-y-3">
              
              {/* Alert 1 */}
              <div className="bg-white border border-red-200 p-3.5 rounded-2xl flex items-start gap-2.5 shadow-xs">
                <span className="text-xl shrink-0 mt-0.5">🔴</span>
                <div className="flex-1 space-y-1.5">
                  <div>
                    <h4 className="text-xs font-black text-red-800">Pest Warning (తెగులు భయం)</h4>
                    <p className="text-[11px] text-krushi-text leading-snug">Brown Plant Hopper detected in Siddipet.</p>
                  </div>
                  <button
                    onClick={() => onNavigateToScanner && onNavigateToScanner('bph')}
                    className="text-[9px] font-bold bg-red-50 text-red-700 px-2.5 py-1 rounded-md hover:bg-red-100 transition-colors cursor-pointer border border-red-100"
                  >
                    🔍 View Scan Details
                  </button>
                </div>
              </div>

              {/* Alert 2 */}
              <div className="bg-white border border-amber-200 p-3.5 rounded-2xl flex items-start gap-2.5 shadow-xs">
                <span className="text-xl shrink-0 mt-0.5">🟡</span>
                <div className="flex-1 space-y-1.5">
                  <div>
                    <h4 className="text-xs font-black text-krushi-amber-dark">Market Spike (ధరల పెంపు)</h4>
                    <p className="text-[11px] text-krushi-text leading-snug">Cotton prices have risen 8% today.</p>
                  </div>
                  <button
                    onClick={() => onNavigateToMarket && onNavigateToMarket()}
                    className="text-[9px] font-bold bg-amber-50 text-krushi-amber-dark px-2.5 py-1 rounded-md hover:bg-amber-100 transition-colors cursor-pointer border border-amber-100"
                  >
                    See Prices
                  </button>
                </div>
              </div>

              {/* Alert 3 */}
              <div className="bg-white border border-green-200 p-3.5 rounded-2xl flex items-start gap-2.5 shadow-xs">
                <span className="text-xl shrink-0 mt-0.5">🟢</span>
                <div className="flex-1 space-y-1.5">
                  <div>
                    <h4 className="text-xs font-black text-krushi-green-dark">Fertilizer Reminder (రిమైండర్)</h4>
                    <p className="text-[11px] text-krushi-text leading-snug">Fertilizer top dressing due tomorrow.</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => alert('Task marked as Done!')}
                      className="text-[9px] font-bold bg-krushi-green-pale text-krushi-green px-2.5 py-1 rounded-md hover:bg-krushi-green-pale/80 transition-colors cursor-pointer border border-krushi-green-light/10"
                    >
                      Done
                    </button>
                    <button
                      onClick={() => alert('Snoozed for 24 hours')}
                      className="text-[9px] font-semibold text-krushi-muted hover:text-krushi-text px-2 py-1 transition-colors cursor-pointer"
                    >
                      Snooze
                    </button>
                  </div>
                </div>
              </div>

            </div>
          </section>
        </div>

        {/* UPCOMING TASKS TIMELINE & COMPLETION RATE */}
        <section className="space-y-3 max-w-3xl">
          <div className="flex justify-between items-center">
            <span className="text-xs uppercase tracking-widest font-extrabold text-krushi-amber">వ్యవసాయ క్యాలెండర్ / 7-Day Tasks Timeline</span>
            
            {/* Task completion gauge */}
            <div className="flex items-center gap-2 bg-white px-3 py-1 rounded-full border border-gray-200 shadow-xs">
              <span className="text-[10px] font-bold text-krushi-green">{progressPercent}% Done Today</span>
              <div className="w-16 bg-gray-150 h-1.5 rounded-full overflow-hidden">
                <div className="bg-krushi-green h-1.5 rounded-full transition-all duration-300" style={{ width: `${progressPercent}%` }} />
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-krushi-green-light/10 shadow-sm relative">
            
            {/* Vertical timeline dashed link line */}
            <div className="absolute left-[38px] top-8 bottom-8 border-l-2 border-dashed border-krushi-green-light/20 z-0" />

            <div className="space-y-5 relative z-10">
              {tasks.map((task) => (
                <div key={task.id} className="flex gap-4 items-start">
                  
                  {/* Task checkbox */}
                  <button
                    onClick={() => toggleTask(task.id)}
                    className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 cursor-pointer transition-all duration-200 ${
                      task.done
                        ? 'bg-krushi-green border-transparent text-white shadow-sm'
                        : 'border-gray-300 hover:border-krushi-green bg-white text-transparent'
                    }`}
                  >
                    <Check size={18} className="stroke-[3]" />
                  </button>

                  <div className="flex-1 pt-1.5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <div>
                      <h4 className={`text-xs sm:text-sm font-bold text-krushi-text text-telugu leading-snug transition-all ${task.done ? 'line-through text-krushi-muted opacity-60' : ''}`}>
                        {task.taskTe}
                      </h4>
                      <p className={`text-[10px] text-krushi-muted transition-all ${task.done ? 'line-through opacity-60' : ''}`}>
                        {task.taskEn}
                      </p>
                    </div>
                    
                    <span className="px-2.5 py-0.5 rounded-full bg-krushi-bg text-krushi-muted border border-gray-150/40 text-[9px] font-bold uppercase tracking-wider shrink-0">
                      {task.day}
                    </span>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </section>

      </div>

      {/* --- WEATHER ADVISORY DETAILS MODAL --- */}
      {showWeatherModal && (
        <div className="fixed inset-0 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs z-50 animate-[fade-in_0.2s_ease-out]">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-modal border border-gray-150 animate-[scale-up_0.2s_ease-out] relative">
            <button
              onClick={() => setShowWeatherModal(false)}
              className="absolute top-4 right-4 p-1 hover:bg-gray-100 rounded-full text-krushi-muted cursor-pointer"
            >
              <X size={18} />
            </button>
            <div className="space-y-4 text-center">
              <span className="text-5xl my-2 block animate-bounce">🌤️</span>
              <div>
                <h3 className="text-lg font-extrabold text-krushi-green">వరంగల్ వ్యవసాయ వాతావరణ నివేదిక</h3>
                <span className="text-xs text-krushi-muted font-mono block">Warangal Agri-Weather Report</span>
              </div>

              <div className="bg-krushi-bg p-4 rounded-xl border border-gray-150 space-y-2 text-left text-xs font-semibold">
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span className="text-krushi-muted flex items-center gap-1"><Droplets size={12} /> Humidity (తేమ)</span>
                  <span className="text-krushi-text">65%</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span className="text-krushi-muted flex items-center gap-1"><Wind size={12} /> Wind Speed (గాలి వేగం)</span>
                  <span className="text-krushi-text">12 km/h</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-krushi-muted">Precipitation (వర్ష అవకాశం)</span>
                  <span className="text-krushi-text">10%</span>
                </div>
              </div>

              <div className="bg-krushi-green-pale text-krushi-green-dark p-3.5 rounded-xl text-left text-xs leading-relaxed text-telugu font-medium">
                📢 <strong>నేటి వ్యవసాయ సలహా:</strong> "నేడు వాతావరణం పొడిగా ఉంటుంది. పత్తి పంటకు రసాయన ఎరువులు వేయడానికి ఇది అనుకూల సమయం. వరి పొలాల్లో తగినంత తేమ నిల్వ ఉండేలా చూసుకోండి."
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CROP LEAF DISEASE SCANNER MODAL REMOVED (Redirection to dedicated CropDiseaseScanner page) */}

      {/* --- AI SPEECH ASSISTANT CHAT DRAWER --- */}
      {showChatModal && (
        <div className="fixed inset-0 flex justify-end bg-black/40 backdrop-blur-xs z-50 animate-[fade-in_0.2s_ease-out]">
          <div className="bg-white w-full max-w-md h-full shadow-modal flex flex-col justify-between animate-[slide-in-right_0.25s_ease-out] relative">
            
            {/* Drawer Header */}
            <div className="bg-krushi-green text-white p-4 flex justify-between items-center shadow-sm">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                  <MessageSquare size={16} />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm flex items-center gap-1">
                    కృషి AI సహాయకుడు <Sparkles size={12} className="text-krushi-amber-light animate-pulse" />
                  </h3>
                  <span className="text-[10px] text-krushi-green-pale block -mt-0.5">Agronomist Assistant (Online)</span>
                </div>
              </div>
              <button
                onClick={() => setShowChatModal(false)}
                className="p-1 hover:bg-white/10 rounded-full text-white cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-krushi-bg/40">
              {chatMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl p-3 shadow-xs text-xs space-y-1 ${
                      msg.sender === 'user'
                        ? 'bg-krushi-green text-white rounded-tr-none'
                        : 'bg-white text-krushi-text border border-gray-150 rounded-tl-none'
                    }`}
                  >
                    <p className="text-telugu leading-relaxed font-medium">{msg.te}</p>
                    <p className={`text-[9px] leading-tight ${msg.sender === 'user' ? 'text-krushi-green-pale' : 'text-krushi-muted'}`}>
                      {msg.en}
                    </p>
                  </div>
                </div>
              ))}
              {chatLoading && (
                <div className="flex justify-start">
                  <div className="bg-white border border-gray-150 rounded-2xl rounded-tl-none p-3 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-krushi-green rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                    <span className="w-1.5 h-1.5 bg-krushi-green rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                    <span className="w-1.5 h-1.5 bg-krushi-green rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                  </div>
                </div>
              )}
            </div>

            {/* Chat Input */}
            <form onSubmit={handleSendChat} className="p-3 border-t border-gray-200/80 bg-white flex gap-2">
              <input
                type="text"
                placeholder="పంట తెగులు లేదా ఎరువుల గురించి ఇక్కడ అడగండి..."
                value={userQuery}
                onChange={(e) => setUserQuery(e.target.value)}
                className="flex-1 px-3.5 py-2.5 bg-krushi-bg rounded-xl text-xs outline-none focus:ring-1 focus:ring-krushi-green/30 border border-gray-200/80"
                disabled={chatLoading}
              />
              <button
                type="submit"
                disabled={!userQuery.trim() || chatLoading}
                className="w-10 h-10 rounded-xl bg-krushi-green text-white flex items-center justify-center shadow-sm hover:bg-krushi-green-dark disabled:opacity-50 transition-colors cursor-pointer"
              >
                <Send size={15} />
              </button>
            </form>

          </div>
        </div>
      )}

      {/* --- LIVE MANDI PRICE CHART MODAL --- */}
      {showPricesModal && (
        <div className="fixed inset-0 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs z-50 animate-[fade-in_0.2s_ease-out]">
          <div className="bg-white w-full max-w-lg rounded-2xl p-6 shadow-modal border border-gray-150 animate-[scale-up_0.2s_ease-out] relative">
            <button
              onClick={() => setShowPricesModal(false)}
              className="absolute top-4 right-4 p-1 hover:bg-gray-100 rounded-full text-krushi-muted cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className="space-y-4">
              <div className="text-center">
                <span className="text-3xl">💰</span>
                <h3 className="text-lg font-extrabold text-krushi-text">మండీ మార్కెట్ లైవ్ ధరలు (Mandi Prices)</h3>
                <p className="text-xs text-krushi-muted">తెలంగాణ యార్డులలో పంటల క్రయవిక్రయ ధరల ట్రెండ్స్</p>
              </div>

              {/* Selector */}
              <div className="flex gap-1.5 justify-center">
                {Object.keys(cropPrices).map((c) => (
                  <button
                    key={c}
                    onClick={() => setSelectedCrop(c)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      selectedCrop === c ? 'bg-krushi-green text-white' : 'bg-krushi-bg text-krushi-muted hover:bg-gray-100'
                    }`}
                  >
                    {c === 'rice' ? 'వరి' : c === 'cotton' ? 'పత్తి' : c === 'maize' ? 'మొక్కజొన్న' : 'వేరుశనగ'}
                  </button>
                ))}
              </div>

              {/* Price Tag Info */}
              <div className="bg-krushi-bg p-3 rounded-xl border border-gray-150 flex justify-between items-center text-xs">
                <div>
                  <strong className="block text-krushi-text">
                    {selectedCrop === 'rice' ? 'వరి (Paddy Grade A)' : selectedCrop === 'cotton' ? 'పత్తి (Cotton Kapas)' : selectedCrop === 'maize' ? 'మొక్కజొన్న (Hybrid Maize)' : 'వేరుశనగ (Groundnut Shell)'}
                  </strong>
                  <span className="text-[10px] text-krushi-muted">Warangal / Khammam Market Yard</span>
                </div>
                <div className="text-right">
                  <span className="text-base font-mono font-bold text-krushi-green">₹{activePriceData.current}/Quintal</span>
                </div>
              </div>

              {/* SVG Price Chart */}
              <div className="bg-white border border-gray-150 p-4 rounded-xl shadow-xs">
                <svg viewBox="0 0 400 150" className="w-full h-auto">
                  <line x1="40" y1="20" x2="360" y2="20" stroke="#f3f4f6" strokeWidth="1" />
                  <line x1="40" y1="70" x2="360" y2="70" stroke="#f3f4f6" strokeWidth="1" />
                  <line x1="40" y1="120" x2="360" y2="120" stroke="#e5e7eb" strokeWidth="1" />

                  <path d={areaD} fill="url(#price-grad)" opacity="0.3" />
                  <path d={pathD} fill="none" stroke="#0F6E56" strokeWidth="2.5" />

                  {svgPoints.map((p, idx) => (
                    <circle
                      key={idx}
                      cx={p.x}
                      cy={p.y}
                      r="4"
                      fill="#FFFFFF"
                      stroke="#0f6e56"
                      strokeWidth="2"
                    />
                  ))}
                  
                  {activePriceData.dates.map((d, idx) => (
                    <text
                      key={idx}
                      x={40 + (idx * 320) / (activePriceData.dates.length - 1)}
                      y="140"
                      textAnchor="middle"
                      className="text-[9px] fill-krushi-muted font-bold"
                    >
                      {d}
                    </text>
                  ))}
                </svg>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* --- GOVERNMENT SCHEMES CATALOG MODAL --- */}
      {showSchemesModal && (
        <div className="fixed inset-0 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs z-50 animate-[fade-in_0.2s_ease-out]">
          <div className="bg-white w-full max-w-lg rounded-2xl p-6 shadow-modal border border-gray-150 animate-[scale-up_0.2s_ease-out] relative max-h-[85vh] overflow-y-auto">
            <button
              onClick={() => {
                setShowSchemesModal(false);
                setSearchQuery('');
              }}
              className="absolute top-4 right-4 p-1 hover:bg-gray-100 rounded-full text-krushi-muted cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className="space-y-4">
              <div className="text-center">
                <span className="text-3xl">🏛️</span>
                <h3 className="text-lg font-extrabold text-krushi-text">ప్రభుత్వ పథకాల వివరాలు (Govt Schemes)</h3>
                <p className="text-xs text-krushi-muted">వ్యవసాయదారులకు లభించే సబ్సిడీలు మరియు పెట్టుబడి సహాయ నిధులు</p>
              </div>

              {/* Search Box */}
              <div className="relative flex items-center rounded-xl bg-krushi-bg border border-gray-150 px-3 py-2 text-xs">
                <Search size={14} className="text-krushi-muted mr-2" />
                <input
                  type="text"
                  placeholder="పథకం పేరుతో శోధించండి (Search by name)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 bg-transparent outline-none text-krushi-text"
                />
              </div>

              {/* Schemes List */}
              <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {schemesList
                  .filter(s => s.titleEn.toLowerCase().includes(searchQuery.toLowerCase()) || s.titleTe.includes(searchQuery))
                  .map((scheme, idx) => (
                    <div key={idx} className="p-3.5 bg-krushi-bg/60 border border-gray-200/70 rounded-xl space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-extrabold text-xs sm:text-sm text-krushi-green-dark text-telugu leading-snug">
                            {scheme.titleTe}
                          </h4>
                          <span className="text-[10px] text-krushi-muted font-bold block">{scheme.titleEn}</span>
                        </div>
                        <span className="px-2 py-0.5 bg-purple-150 text-purple-700 text-[10px] font-bold rounded-full">
                          {scheme.amount}
                        </span>
                      </div>
                      <p className="text-[11px] text-krushi-text leading-relaxed text-telugu">
                        {scheme.bodyTe}
                      </p>
                      <button
                        onClick={() => alert(`Applied for ${scheme.titleEn} successfully!`)}
                        className="text-[9px] font-bold bg-krushi-green text-white px-3 py-1 rounded-md hover:bg-krushi-green-dark transition-colors cursor-pointer block text-center mt-2"
                      >
                        Apply Now (దరఖాస్తు చేసుకోండి)
                      </button>
                    </div>
                  ))}
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
