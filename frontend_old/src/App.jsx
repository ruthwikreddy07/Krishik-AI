import React, { useState } from 'react';
import LandingPage from './pages/LandingPage';
import ProfileSettings from './pages/ProfileSettings';
import FarmerDashboard from './pages/FarmerDashboard';
import CropDiseaseScanner from './pages/CropDiseaseScanner';
import AIChatbot from './pages/AIChatbot';
import MarketIntelligence from './pages/MarketIntelligence';
import FarmManagement from './pages/FarmManagement';
import AgriWeather from './pages/AgriWeather';
import GovSchemes from './pages/GovSchemes';
import NotificationsCenter from './pages/NotificationsCenter';
import {
  CropCard,
  StatusChip,
  PriceTag,
  WeatherBadge,
  TeluguInput
} from './components';
import {
  Sprout,
  LayoutGrid,
  Settings,
  ShieldAlert,
  BadgeAlert,
  ShieldCheck,
  Home,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  Camera,
  TrendingUp as TrendingUpIcon
} from 'lucide-react';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState('home'); // home | dashboard | settings | showcase | scanner | chat | market | farm | weather | schemes | notifications
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [testTeluguText, setTestTeluguText] = useState('నా పేరు రవి కుమార్. నేల వివరాలు ఎర్ర నేలలు.');
  const [scannerPreload, setScannerPreload] = useState(null);

  // Mock crops for the showcase
  const showcaseCrops = [
    { name: 'వరి (Rice)', stage: 'Vegetative', sowingDate: '12 May 2026', emoji: '🌾' },
    { name: 'పత్తి (Cotton)', stage: 'Flowering', sowingDate: '01 June 2026', emoji: '☁️' },
    { name: 'మొక్కజొన్న (Maize)', stage: 'Harvesting', sowingDate: '15 Feb 2026', emoji: '🌽' },
    { name: 'వేరుశనగ (Groundnut)', stage: 'Sowing', sowingDate: '14 June 2026', emoji: '🥜' }
  ];

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    setActiveTab('dashboard');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setActiveTab('home');
  };

  // ──── LOGGED OUT VIEW ───────────────────────────────────────
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-krushi-bg font-sans flex flex-col antialiased selection:bg-krushi-green-pale selection:text-krushi-green">
        
        {/* Simple Header for Logged-Out Users (Only shown on Showcase page) */}
        {activeTab === 'showcase' && (
          <header className="sticky top-0 z-40 bg-krushi-card/85 backdrop-blur-md border-b border-gray-150 shadow-xs">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
              {/* Logo */}
              <div
                onClick={() => setActiveTab('home')}
                className="flex items-center gap-2.5 cursor-pointer"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-krushi-green to-krushi-green-light flex items-center justify-center text-white shadow-glow">
                  <Sprout size={22} className="animate-pulse" />
                </div>
                <div>
                  <span className="text-lg font-black tracking-wider text-krushi-green">KRUSHI <span className="text-krushi-amber">AI</span></span>
                  <span className="block text-[10px] text-krushi-muted -mt-1 font-semibold">వ్యవసాయ సహాయకుడు / Farming Assistant</span>
                </div>
              </div>

              {/* Showcase link toggle for design verification */}
              <div className="flex gap-2.5">
                <button
                  onClick={() => setActiveTab('home')}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-gray-100 hover:bg-gray-200 text-krushi-green transition-all duration-200"
                >
                  <LayoutGrid size={13} />
                  <span>లాగిన్ పేజీ / Login</span>
                </button>
              </div>
            </div>
          </header>
        )}

        {/* Content routing */}
        <main className="flex-grow">
          {activeTab === 'showcase' ? (
            <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-12 animate-[fade-in_0.3s_ease-out]">
              {/* Header info */}
              <div>
                <h1 className="heading-farm text-3xl font-extrabold text-krushi-green">
                  Krushi AI డిజైన్ సిస్టమ్ & విడ్జెట్లు
                </h1>
                <p className="text-sm text-krushi-muted mt-1.5">
                  Krushi AI అప్లికేషన్ లో ఉపయోగించే ప్రధాన కలర్ టోకెన్లు, టైపోగ్రఫీ మరియు విడ్జెట్ల లైబ్రరీ.
                </p>
              </div>

              {/* Showcase Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* CropCard Showcase */}
                <section className="bg-krushi-card p-6 rounded-2xl shadow-card border border-gray-100 space-y-4">
                  <h2 className="text-sm font-extrabold text-krushi-text uppercase tracking-wider">🌱 పంట కార్డులు / Crop Cards</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {showcaseCrops.map((c, i) => (
                      <CropCard key={i} cropName={c.name} stage={c.stage} sowingDate={c.sowingDate} emoji={c.emoji} />
                    ))}
                  </div>
                </section>
                {/* Status Chips */}
                <section className="bg-krushi-card p-6 rounded-2xl shadow-card border border-gray-100 space-y-4">
                  <h2 className="text-sm font-extrabold text-krushi-text uppercase tracking-wider">🏷️ రంగుల చిప్స్ / Status Chips</h2>
                  <div className="flex flex-wrap gap-2.5">
                    <StatusChip label="పంట సిఫార్సు (Success)" variant="success" pulseDot />
                    <StatusChip label="తేమ హెచ్చరిక (Warning)" variant="warning" />
                    <StatusChip label="తెగుళ్లు ఉన్నాయి (Danger)" variant="danger" pulseDot />
                    <StatusChip label="వాతావరణం (Info)" variant="info" />
                    <StatusChip label="నేల రకం (Earth)" variant="earth" />
                  </div>
                </section>
              </div>
            </div>
          ) : (
            <LandingPage onLoginSuccess={handleLoginSuccess} onShowcaseToggle={() => setActiveTab('showcase')} />
          )}
        </main>
        
        {activeTab === 'showcase' && (
          <footer className="bg-white border-t border-gray-200/50 py-6 text-center text-xs text-krushi-muted">
            <p>© 2026 Krushi AI Farming Assistant app. Designed with premium HSL green tokens. All rights reserved.</p>
          </footer>
        )}
      </div>
    );
  }

  // ──── LOGGED IN VIEW WITH COLLAPSIBLE SIDEBAR & BOTTOM NAV ─────────────────────────
  return (
    <div className="min-h-screen bg-white font-sans flex antialiased selection:bg-krushi-green-pale selection:text-krushi-green relative">
      
      {/* 1. LEFT COLLAPSIBLE SIDEBAR (DESKTOP) */}
      <aside
        className={`hidden md:flex flex-col bg-krushi-green text-white fixed top-0 bottom-0 left-0 z-40 transition-all duration-300 ${
          sidebarCollapsed ? 'w-20' : 'w-64'
        } shadow-lg py-6 justify-between select-none`}
      >
        <div className="space-y-8">
          {/* Logo Section */}
          <div className={`flex items-center gap-2.5 px-4 transition-all ${sidebarCollapsed ? 'justify-center' : ''}`}>
            <div className="w-10 h-10 rounded-xl bg-white text-krushi-green flex items-center justify-center shadow-md shrink-0">
              <Sprout size={22} className="animate-pulse" />
            </div>
            {!sidebarCollapsed && (
              <div>
                <span className="text-sm font-black tracking-wider text-white">KRUSHI <span className="text-krushi-amber">AI</span></span>
                <span className="block text-[8px] text-krushi-green-pale font-bold -mt-1">Telangana Farmer Portal</span>
              </div>
            )}
          </div>

          {/* Navigation Link list */}
          <nav className="flex flex-col gap-2">
            
            {/* Dashboard Link */}
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-3 px-4 py-3.5 mx-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-white text-krushi-green shadow-sm'
                  : 'text-krushi-green-pale hover:bg-white/10 hover:text-white'
              }`}
            >
              <Home size={16} />
              {!sidebarCollapsed && <span className="text-telugu font-semibold">పంట డ్యాష్‌బోర్డ్ / Dashboard</span>}
            </button>

            {/* Crop Scanner Link */}
            <button
              onClick={() => setActiveTab('scanner')}
              className={`flex items-center gap-3 px-4 py-3.5 mx-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                activeTab === 'scanner'
                  ? 'bg-white text-krushi-green shadow-sm'
                  : 'text-krushi-green-pale hover:bg-white/10 hover:text-white'
              }`}
            >
              <Camera size={16} />
              {!sidebarCollapsed && <span className="text-telugu font-semibold">తెగుళ్ల నిర్ధారణ / Crop Scanner</span>}
            </button>

            {/* Farm Management Link */}
            <button
              onClick={() => setActiveTab('farm')}
              className={`flex items-center gap-3 px-4 py-3.5 mx-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                activeTab === 'farm'
                  ? 'bg-white text-krushi-green shadow-sm'
                  : 'text-krushi-green-pale hover:bg-white/10 hover:text-white'
              }`}
            >
              <Sprout size={16} />
              {!sidebarCollapsed && <span className="text-telugu font-semibold">నా పొలం / Farm Management</span>}
            </button>

            {/* Weather Link */}
            <button
              onClick={() => setActiveTab('weather')}
              className={`flex items-center gap-3 px-4 py-3.5 mx-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                activeTab === 'weather'
                  ? 'bg-white text-krushi-green shadow-sm'
                  : 'text-krushi-green-pale hover:bg-white/10 hover:text-white'
              }`}
            >
              <CloudSun size={16} />
              {!sidebarCollapsed && <span className="text-telugu font-semibold">వాతావరణం / Weather</span>}
            </button>

            {/* Government Schemes Link */}
            <button
              onClick={() => setActiveTab('schemes')}
              className={`flex items-center gap-3 px-4 py-3.5 mx-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                activeTab === 'schemes'
                  ? 'bg-white text-krushi-green shadow-sm'
                  : 'text-krushi-green-pale hover:bg-white/10 hover:text-white'
              }`}
            >
              <ShieldCheck size={16} />
              {!sidebarCollapsed && <span className="text-telugu font-semibold">ప్రభుత్వ పథకాలు / Schemes</span>}
            </button>

            {/* Notifications Center Link */}
            <button
              onClick={() => setActiveTab('notifications')}
              className={`flex items-center gap-3 px-4 py-3.5 mx-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                activeTab === 'notifications'
                  ? 'bg-white text-krushi-green shadow-sm'
                  : 'text-krushi-green-pale hover:bg-white/10 hover:text-white'
              }`}
            >
              <Bell size={16} />
              {!sidebarCollapsed && <span className="text-telugu font-semibold">నోటిఫికేషన్లు / Notifications</span>}
            </button>

            {/* AI Chatbot Link */}
            <button
              onClick={() => setActiveTab('chat')}
              className={`flex items-center gap-3 px-4 py-3.5 mx-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                activeTab === 'chat'
                  ? 'bg-white text-krushi-green shadow-sm'
                  : 'text-krushi-green-pale hover:bg-white/10 hover:text-white'
              }`}
            >
              <MessageSquare size={16} />
              {!sidebarCollapsed && <span className="text-telugu font-semibold">AI సహాయకుడు / AI Chatbot</span>}
            </button>

            {/* Market Prices Link */}
            <button
              onClick={() => setActiveTab('market')}
              className={`flex items-center gap-3 px-4 py-3.5 mx-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                activeTab === 'market'
                  ? 'bg-white text-krushi-green shadow-sm'
                  : 'text-krushi-green-pale hover:bg-white/10 hover:text-white'
              }`}
            >
              <TrendingUpIcon size={16} />
              {!sidebarCollapsed && <span className="text-telugu font-semibold">మార్కెట్ ధరలు / Market Intelligence</span>}
            </button>

            {/* Profile Settings Link */}
            <button
              onClick={() => setActiveTab('settings')}
              className={`flex items-center gap-3 px-4 py-3.5 mx-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                activeTab === 'settings'
                  ? 'bg-white text-krushi-green shadow-sm'
                  : 'text-krushi-green-pale hover:bg-white/10 hover:text-white'
              }`}
            >
              <Settings size={16} />
              {!sidebarCollapsed && <span className="text-telugu font-semibold">ప్రొఫైల్ సెట్టింగులు / Settings</span>}
            </button>

            {/* Component Showcase Link */}
            <button
              onClick={() => setActiveTab('showcase')}
              className={`flex items-center gap-3 px-4 py-3.5 mx-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                activeTab === 'showcase'
                  ? 'bg-white text-krushi-green shadow-sm'
                  : 'text-krushi-green-pale hover:bg-white/10 hover:text-white'
              }`}
            >
              <LayoutGrid size={16} />
              {!sidebarCollapsed && <span className="text-telugu font-semibold">డిజైన్ సిస్టమ్ / UI Library</span>}
            </button>

          </nav>
        </div>

        {/* Footer actions of Sidebar */}
        <div className="space-y-4">
          
          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className={`flex items-center gap-3 px-4 py-3 mx-2 rounded-xl text-xs font-bold text-red-200 hover:bg-white/10 hover:text-white transition-all cursor-pointer ${
              sidebarCollapsed ? 'justify-center' : ''
            }`}
          >
            <LogOut size={16} />
            {!sidebarCollapsed && <span className="text-telugu font-semibold">లాగ్ అవుట్ / Logout</span>}
          </button>

          {/* Sidebar Collapse Toggle Trigger */}
          <div className="border-t border-white/10 pt-4 px-3 flex justify-center">
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white cursor-pointer transition-colors"
            >
              {sidebarCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
            </button>
          </div>

        </div>
      </aside>

      {/* 2. FIXED BOTTOM NAV (MOBILE DEVICES) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 h-16 flex items-center justify-around shadow-lg px-2 select-none">
        
        {/* Dashboard Link */}
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center justify-center flex-1 h-full text-[10px] font-bold cursor-pointer ${
            activeTab === 'dashboard' ? 'text-krushi-green' : 'text-krushi-muted'
          }`}
        >
          <Home size={18} />
          <span className="mt-1 font-semibold text-telugu">డ్యాష్‌బోర్డ్ / Home</span>
        </button>

        {/* Crop Scanner Link */}
        <button
          onClick={() => setActiveTab('scanner')}
          className={`flex flex-col items-center justify-center flex-1 h-full text-[10px] font-bold cursor-pointer ${
            activeTab === 'scanner' ? 'text-krushi-green' : 'text-krushi-muted'
          }`}
        >
          <Camera size={18} />
          <span className="mt-1 font-semibold text-telugu">స్కానర్ / Scanner</span>
        </button>

        {/* Farm Management Link */}
        <button
          onClick={() => setActiveTab('farm')}
          className={`flex flex-col items-center justify-center flex-1 h-full text-[10px] font-bold cursor-pointer ${
            activeTab === 'farm' ? 'text-krushi-green' : 'text-krushi-muted'
          }`}
        >
          <Sprout size={18} />
          <span className="mt-1 font-semibold text-telugu">పొలం / Farm</span>
        </button>

        {/* Weather Link */}
        <button
          onClick={() => setActiveTab('weather')}
          className={`flex flex-col items-center justify-center flex-1 h-full text-[10px] font-bold cursor-pointer ${
            activeTab === 'weather' ? 'text-krushi-green' : 'text-krushi-muted'
          }`}
        >
          <CloudSun size={18} />
          <span className="mt-1 font-semibold text-telugu">వాతావరణం / Weather</span>
        </button>

        {/* Government Schemes Link */}
        <button
          onClick={() => setActiveTab('schemes')}
          className={`flex flex-col items-center justify-center flex-1 h-full text-[10px] font-bold cursor-pointer ${
            activeTab === 'schemes' ? 'text-krushi-green' : 'text-krushi-muted'
          }`}
        >
          <ShieldCheck size={18} />
          <span className="mt-1 font-semibold text-telugu">పథకాలు / Schemes</span>
        </button>

        {/* Notifications Center Link */}
        <button
          onClick={() => setActiveTab('notifications')}
          className={`flex flex-col items-center justify-center flex-1 h-full text-[10px] font-bold cursor-pointer ${
            activeTab === 'notifications' ? 'text-krushi-green' : 'text-krushi-muted'
          }`}
        >
          <Bell size={18} />
          <span className="mt-1 font-semibold text-telugu">నోటిఫికేషన్లు / Alerts</span>
        </button>

        {/* AI Chatbot Link */}
        <button
          onClick={() => setActiveTab('chat')}
          className={`flex flex-col items-center justify-center flex-1 h-full text-[10px] font-bold cursor-pointer ${
            activeTab === 'chat' ? 'text-krushi-green' : 'text-krushi-muted'
          }`}
        >
          <MessageSquare size={18} />
          <span className="mt-1 font-semibold text-telugu">సహాయకుడు / Chatbot</span>
        </button>

        {/* Market Prices Link */}
        <button
          onClick={() => setActiveTab('market')}
          className={`flex flex-col items-center justify-center flex-1 h-full text-[10px] font-bold cursor-pointer ${
            activeTab === 'market' ? 'text-krushi-green' : 'text-krushi-muted'
          }`}
        >
          <TrendingUpIcon size={18} />
          <span className="mt-1 font-semibold text-telugu">ధరలు / Prices</span>
        </button>

        {/* Settings Link */}
        <button
          onClick={() => setActiveTab('settings')}
          className={`flex flex-col items-center justify-center flex-1 h-full text-[10px] font-bold cursor-pointer ${
            activeTab === 'settings' ? 'text-krushi-green' : 'text-krushi-muted'
          }`}
        >
          <Settings size={18} />
          <span className="mt-1 font-semibold text-telugu">సెట్టింగ్స్ / Settings</span>
        </button>

        {/* Component Showcase Link */}
        <button
          onClick={() => setActiveTab('showcase')}
          className={`flex flex-col items-center justify-center flex-1 h-full text-[10px] font-bold cursor-pointer ${
            activeTab === 'showcase' ? 'text-krushi-green' : 'text-krushi-muted'
          }`}
        >
          <LayoutGrid size={18} />
          <span className="mt-1 font-semibold text-telugu">లైబ్రరీ / Showcase</span>
        </button>

        {/* Logout Link */}
        <button
          onClick={handleLogout}
          className="flex flex-col items-center justify-center flex-1 h-full text-[10px] font-bold text-krushi-danger cursor-pointer"
        >
          <LogOut size={18} />
          <span className="mt-1 font-semibold text-telugu">లాగౌట్ / Logout</span>
        </button>

      </nav>

      {/* 3. MAIN DASHBOARD CONTENT AREA */}
      <div
        className={`flex flex-col flex-1 min-h-screen bg-white transition-all duration-300 ${
          sidebarCollapsed ? 'md:pl-20' : 'md:pl-64'
        } pb-16 md:pb-0`}
      >
        <main className="flex-grow">
          {activeTab === 'dashboard' && (
            <FarmerDashboard
              onNavigateToScanner={(presetKey) => {
                if (presetKey) setScannerPreload(presetKey);
                setActiveTab('scanner');
              }}
              onNavigateToChat={() => setActiveTab('chat')}
              onNavigateToMarket={() => setActiveTab('market')}
              onNavigateToFarm={() => setActiveTab('farm')}
              onNavigateToWeather={() => setActiveTab('weather')}
              onNavigateToSchemes={() => setActiveTab('schemes')}
              onNavigateToNotifications={() => setActiveTab('notifications')}
            />
          )}

          {activeTab === 'scanner' && (
            <CropDiseaseScanner
              preload={scannerPreload}
              clearPreload={() => setScannerPreload(null)}
            />
          )}

          {activeTab === 'chat' && (
            <AIChatbot />
          )}

          {activeTab === 'market' && (
            <MarketIntelligence />
          )}

          {activeTab === 'farm' && (
            <FarmManagement />
          )}

          {activeTab === 'weather' && (
            <AgriWeather />
          )}

          {activeTab === 'schemes' && (
            <GovSchemes />
          )}

          {activeTab === 'notifications' && (
            <NotificationsCenter />
          )}

          {activeTab === 'settings' && (
            <ProfileSettings />
          )}

          {activeTab === 'showcase' && (
            <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-12 animate-[fade-in_0.3s_ease-out]">
              
              {/* Header info */}
              <div>
                <h1 className="heading-farm text-3xl font-extrabold text-krushi-green">
                  Krushi AI డిజైన్ సిస్టమ్ & విడ్జెట్లు
                </h1>
                <p className="text-sm text-krushi-muted mt-1.5">
                  Krushi AI అప్లికేషన్ లో ఉపయోగించే ప్రధాన కలర్ టోకెన్లు, టైపోగ్రఫీ మరియు విడ్జెట్ల లైబ్రరీ.
                  <br />
                  <span className="text-xs font-medium">(Design Token System & Shared UI Component Library preview)</span>
                </p>
              </div>

              {/* Design Tokens Color Palette Grid */}
              <section className="bg-krushi-card p-6 rounded-2xl shadow-card border border-gray-100 space-y-4">
                <h2 className="text-sm font-extrabold text-krushi-text uppercase tracking-wider">
                  🎨 కలర్ టోకెన్లు / Color Palette Tokens
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
                  <div className="p-3 bg-[#0F6E56] rounded-xl text-white shadow-sm flex flex-col justify-end min-h-[90px]">
                    <span className="text-[10px] font-bold opacity-80">--krushi-green</span>
                    <span className="text-xs font-mono font-semibold">#0F6E56</span>
                  </div>
                  <div className="p-3 bg-[#1D9E75] rounded-xl text-white shadow-sm flex flex-col justify-end min-h-[90px]">
                    <span className="text-[10px] font-bold opacity-80">--krushi-green-light</span>
                    <span className="text-xs font-mono font-semibold">#1D9E75</span>
                  </div>
                  <div className="p-3 bg-[#E1F5EE] rounded-xl text-krushi-green-dark border border-krushi-green-light/20 shadow-sm flex flex-col justify-end min-h-[90px]">
                    <span className="text-[10px] font-bold opacity-80">--krushi-green-pale</span>
                    <span className="text-xs font-mono font-semibold">#E1F5EE</span>
                  </div>
                  <div className="p-3 bg-[#BA7517] rounded-xl text-white shadow-sm flex flex-col justify-end min-h-[90px]">
                    <span className="text-[10px] font-bold opacity-80">--krushi-amber</span>
                    <span className="text-xs font-mono font-semibold">#BA7517</span>
                  </div>
                  <div className="p-3 bg-[#FAEEDA] rounded-xl text-krushi-amber-dark border border-krushi-amber/20 shadow-sm flex flex-col justify-end min-h-[90px]">
                    <span className="text-[10px] font-bold opacity-80">--krushi-amber-light</span>
                    <span className="text-xs font-mono font-semibold">#FAEEDA</span>
                  </div>
                  <div className="p-3 bg-[#7C5C3A] rounded-xl text-white shadow-sm flex flex-col justify-end min-h-[90px]">
                    <span className="text-[10px] font-bold opacity-80">--krushi-earth</span>
                    <span className="text-xs font-mono font-semibold">#7C5C3A</span>
                  </div>
                  <div className="p-3 bg-[#185FA5] rounded-xl text-white shadow-sm flex flex-col justify-end min-h-[90px]">
                    <span className="text-[10px] font-bold opacity-80">--krushi-sky</span>
                    <span className="text-xs font-mono font-semibold">#185FA5</span>
                  </div>
                  <div className="p-3 bg-white border border-gray-200 rounded-xl text-krushi-text shadow-sm flex flex-col justify-end min-h-[90px]">
                    <span className="text-[10px] font-bold text-krushi-muted">--krushi-card</span>
                    <span className="text-xs font-mono font-semibold">#FFFFFF</span>
                  </div>
                </div>
              </section>

              {/* Typography & Custom classes showcase */}
              <section className="bg-krushi-card p-6 rounded-2xl shadow-card border border-gray-100 space-y-4">
                <h2 className="text-sm font-extrabold text-krushi-text uppercase tracking-wider">
                  📝 టైపోగ్రఫీ తరగతులు / Typography & Fonts
                </h2>
                <div className="space-y-4 divide-y divide-gray-100">
                  <div className="py-2.5">
                    <span className="text-xs font-mono text-krushi-muted block mb-1">.heading-farm (Display Heading)</span>
                    <h1 className="heading-farm text-3xl font-extrabold text-krushi-green">రైతు సేద్య విభాగం (Krushi Hero Display)</h1>
                  </div>
                  <div className="pt-4 pb-2.5">
                    <span className="text-xs font-mono text-krushi-muted block mb-1">.text-telugu (Telugu script reader font)</span>
                    <p className="text-telugu text-md text-krushi-text">
                      మొక్కలకు కావలసిన ఖనిజ లవణాలు మరియు ఎరువుల డోసేజ్ గురించి పూర్తి వివరాలు ఇక్కడ తెలుసుకోగలరు.
                    </p>
                  </div>
                  <div className="pt-4 pb-2.5">
                    <span className="text-xs font-mono text-krushi-muted block mb-1">.price-display (Market Monospace price tag)</span>
                    <span className="price-display text-2xl font-bold text-krushi-amber">₹2,850.50</span>
                  </div>
                </div>
              </section>

              {/* Widget Components Showcase */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* CropCard Showcase */}
                <section className="bg-krushi-card p-6 rounded-2xl shadow-card border border-gray-100 space-y-4">
                  <h2 className="text-sm font-extrabold text-krushi-text uppercase tracking-wider">
                    🌱 పంట కార్డులు / Crop Cards
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {showcaseCrops.map((c, i) => (
                      <CropCard
                        key={i}
                        cropName={c.name}
                        stage={c.stage}
                        sowingDate={c.sowingDate}
                        emoji={c.emoji}
                        onClick={() => alert(`${c.name} card clicked!`)}
                      />
                    ))}
                  </div>
                </section>

                {/* Status Chip Showcase */}
                <section className="bg-krushi-card p-6 rounded-2xl shadow-card border border-gray-100 space-y-4">
                  <h2 className="text-sm font-extrabold text-krushi-text uppercase tracking-wider">
                    🏷️ రంగుల చిప్స్ / Status Chips
                  </h2>
                  <div className="flex flex-wrap gap-2.5 items-center">
                    <StatusChip label="పంట సిఫార్సు (Success)" variant="success" pulseDot />
                    <StatusChip label="తేమ హెచ్చరిక (Warning)" variant="warning" />
                    <StatusChip label="తెగుళ్లు ఉన్నాయి (Danger)" variant="danger" pulseDot />
                    <StatusChip label="వాతావరణం (Info)" variant="info" />
                    <StatusChip label="మార్కెట్ ట్రెండ్ (Primary)" variant="primary" />
                    <StatusChip label="నేల రకం (Earth)" variant="earth" />
                    <StatusChip label="తటస్థ (Neutral)" variant="neutral" />
                  </div>
                </section>

                {/* PriceTag Showcase */}
                <section className="bg-krushi-card p-6 rounded-2xl shadow-card border border-gray-100 space-y-4">
                  <h2 className="text-sm font-extrabold text-krushi-text uppercase tracking-wider">
                    📊 మార్కెట్ ధరలు / Price Tags
                  </h2>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center bg-krushi-bg p-3.5 rounded-xl border border-gray-100">
                      <span className="text-sm font-medium text-krushi-text">వరి (Rice) - Warangal Mandi</span>
                      <PriceTag price={2183} trend="up" change="+45" />
                    </div>
                    <div className="flex justify-between items-center bg-krushi-bg p-3.5 rounded-xl border border-gray-100">
                      <span className="text-sm font-medium text-krushi-text">పత్తి (Cotton) - Khammam Mandi</span>
                      <PriceTag price={7450} trend="down" change="-120" />
                    </div>
                    <div className="flex justify-between items-center bg-krushi-bg p-3.5 rounded-xl border border-gray-100">
                      <span className="text-sm font-medium text-krushi-text">వేరుశనగ (Groundnut) - Suryapet</span>
                      <PriceTag price={6300} trend="stable" change="0" />
                    </div>
                  </div>
                </section>

                {/* WeatherBadge Showcase */}
                <section className="bg-krushi-card p-6 rounded-2xl shadow-card border border-gray-100 space-y-4">
                  <h2 className="text-sm font-extrabold text-krushi-text uppercase tracking-wider">
                    🌦️ వాతావరణం బ్యాడ్జీలు / Weather Badges
                  </h2>
                  <div className="flex flex-wrap gap-3">
                    <WeatherBadge condition="sunny" temp={36} label="ఎండగా ఉంది" humidity={42} wind={14} />
                    <WeatherBadge condition="rainy" temp={27} label="భారీ వర్షం" humidity={90} wind={22} />
                    <WeatherBadge condition="cloudy" temp={30} label="మేఘావృతం" humidity={65} wind={8} />
                  </div>
                </section>

                {/* TeluguInput Showcase */}
                <section className="bg-krushi-card p-6 rounded-2xl shadow-card border border-gray-100 space-y-4 md:col-span-2">
                  <h2 className="text-sm font-extrabold text-krushi-text uppercase tracking-wider">
                    ⌨️ తెలుగు ఇన్పుట్ టెస్టింగ్ / Interactive Telugu Input Demo
                  </h2>
                  <TeluguInput
                    label="Test Interactive Telugu Input"
                    labelTelugu="కీబోర్డు లో తెలుగు పదాలను టైప్ చేసి చూడండి"
                    placeholder="మీ అభిప్రాయాన్ని ఇక్కడ తెలుగులో నమోదు చేయండి..."
                    telugu
                    value={testTeluguText}
                    onChange={(e) => setTestTeluguText(e.target.value)}
                  />
                  <div className="bg-krushi-green-pale/40 border border-krushi-green-light/10 p-3 rounded-lg text-xs text-krushi-text">
                    <strong>Live Preview Render Output:</strong>
                    <p className="text-telugu mt-1.5 text-md font-medium text-krushi-green-dark bg-white p-2 rounded border border-gray-200/50">
                      {testTeluguText || <em className="text-krushi-muted font-normal">(ఇంకా ఏమి నమోదు చేయలేదు)</em>}
                    </p>
                  </div>
                </section>

              </div>
            </div>
          )}
        </main>
      </div>

    </div>
  );
}
