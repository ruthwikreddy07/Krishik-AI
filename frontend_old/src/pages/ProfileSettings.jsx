import React, { useState } from 'react';
import {
  User,
  MapPin,
  Sprout,
  Bell,
  Globe,
  Phone,
  Shield,
  Info,
  LogOut,
  Camera,
  Save,
  Check,
  AlertCircle,
  X,
  Droplet,
  Smartphone,
  Database,
  Lock,
  Server,
  Key
} from 'lucide-react';
import { TeluguInput, ToggleSwitch } from '../components';

export default function ProfileSettings() {
  // --- Personal & Location Details ---
  const [nameEnglish, setNameEnglish] = useState('Ravi Kumar');
  const [nameTelugu, setNameTelugu] = useState('రవి కుమార్');
  const [village, setVillage] = useState('Gagillapur');
  const [mandal, setMandal] = useState('Kutbullapur');
  const [district, setDistrict] = useState('Medchal-Malkajgiri');
  const [phone] = useState('+91 XXXXXX7890'); // Masked as per requirement

  // --- Farm Details ---
  const [landSize, setLandSize] = useState('5.5');
  const [soilType, setSoilType] = useState('Red soil (ఎర్ర నేలలు)');
  const [waterSource, setWaterSource] = useState('Borewell (బోరుబావి)');
  const [farmSaved, setFarmSaved] = useState(false);
  const [savingFarm, setSavingFarm] = useState(false);

  // --- Notification Preferences ---
  const [notifs, setNotifs] = useState({
    whatsapp: true,
    sms: true,
    disease: true,
    market: true,
    weather: true,
    scheme: true,
  });

  // --- Language Preferences ---
  const [language, setLanguage] = useState('both'); // telugu | english | both

  // --- WhatsApp Change Management ---
  const [whatsAppNum, setWhatsAppNum] = useState('9876543210');
  const [editingWhatsApp, setEditingWhatsApp] = useState(false);
  const [newWhatsApp, setNewWhatsApp] = useState('');
  const [whatsAppSuccess, setWhatsAppSuccess] = useState(false);

  // --- Modal & General States ---
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggedOut, setIsLoggedOut] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [dataDeleted, setDataDeleted] = useState(false);
  const [avatarColor, setAvatarColor] = useState('bg-krushi-green'); // Interactive avatar background colors

  // --- Active Tab (Mobile View Sidebar navigation) ---
  const [activeTab, setActiveTab] = useState('profile'); // profile | farm | alerts | language | safety | about

  // Avatar choices
  const colors = [
    { name: 'Krushi Green', value: 'bg-krushi-green' },
    { name: 'Krushi Light', value: 'bg-krushi-green-light' },
    { name: 'Warm Amber', value: 'bg-krushi-amber' },
    { name: 'Earth Brown', value: 'bg-krushi-earth' }
  ];

  const soilOptions = [
    { value: 'Red soil (ఎర్ర నేలలు)', labelEn: 'Red Soil', labelTe: 'ఎర్ర నేలలు', emoji: '🧱', descTe: 'సారవంతమైనది, త్వరగా నీరు గుంజుకుంటుంది', descEn: 'Rich in iron, high permeability' },
    { value: 'Black clay soil (నల్ల రేగడి నేలలు)', labelEn: 'Black Clay', labelTe: 'నల్ల రేగడి నేలలు', emoji: '⬛', descTe: 'తేమను ఎక్కువ కాలం నిల్వ ఉంచుతుంది', descEn: 'High moisture retention, perfect for cotton' },
    { value: 'Alluvial soil (ఒండ్రు నేలలు)', labelEn: 'Alluvial Soil', labelTe: 'ఒండ్రు నేలలు', emoji: '🌾', descTe: 'నదీ తీర సారవంతమైన నేలలు', descEn: 'Rich organic content, ideal for rice' },
    { value: 'Sandy loam (ఇసుక లోమ్ నేలలు)', labelEn: 'Sandy Loam', labelTe: 'ఇసుక లోమ్ నేలలు', emoji: '🏖️', descTe: 'తేలికపాటి పొడి మరియు ఇసుక నేలలు', descEn: 'Well-draining loam, good for groundnuts' },
    { value: 'Laterite soil (లేటరైట్ నేలలు)', labelEn: 'Laterite Soil', labelTe: 'లేటరైట్ నేలలు', emoji: '🧱', descTe: 'అసిడిక్ స్వభావం కల ఎర్ర మట్టి', descEn: 'Leached red soil, rich in aluminum' }
  ];

  const waterOptions = [
    { value: 'Borewell (బోరుబావి)', labelEn: 'Borewell', labelTe: 'బోరుబావి', icon: '🚰', descTe: 'మోటార్ బోర్ మరియు భూగర్భ నీరు', descEn: 'Groundwater tube-well system' },
    { value: 'Canal irrigation (కాలువ నీటి పారుదల)', labelEn: 'Canal Supply', labelTe: 'కాలువ', icon: '🌊', descTe: 'ప్రభుత్వ ప్రాజెక్ట్ కాలువల నీరు', descEn: 'Government surface canals' },
    { value: 'Rainfed / Natural (వర్షాధారం)', labelEn: 'Rainfed', labelTe: 'వర్షాధారం', icon: '🌧️', descTe: 'కేవలం వర్షాకాలపు నీటి పై ఆధారం', descEn: 'Monsoon-dependent cultivation' },
    { value: 'Open well / Pond (బావి లేదా చెరువు)', labelEn: 'Open Well / Pond', labelTe: 'బావి / చెరువు', icon: '⛲', descTe: 'వ్యవసాయ కుంట లేదా సంప్రదాయ బావి', descEn: 'Traditional open wells & farm ponds' },
    { value: 'Drip irrigation (బిందు సేద్యం)', labelEn: 'Drip Irrigation', labelTe: 'బిందు సేద్యం', icon: '💧', descTe: 'సూక్ష్మ నీటి పొదుపు డ్రిప్ లైన్', descEn: 'Micro-emitter drip irrigation' }
  ];

  const handleSaveFarm = (e) => {
    e.preventDefault();
    setSavingFarm(true);
    setTimeout(() => {
      setSavingFarm(false);
      setFarmSaved(true);
      setTimeout(() => setFarmSaved(false), 3000);
    }, 800);
  };

  const handleWhatsAppChange = (e) => {
    e.preventDefault();
    if (newWhatsApp.length === 10) {
      setWhatsAppNum(newWhatsApp);
      setEditingWhatsApp(false);
      setNewWhatsApp('');
      setWhatsAppSuccess(true);
      setTimeout(() => setWhatsAppSuccess(false), 3000);
    }
  };

  const handleDeleteData = () => {
    const confirmDelete = window.confirm(
      'మీరు నిజంగా మీ డేటాను తొలగించాలనుకుంటున్నారా? ఈ చర్యను వెనక్కి తీసుకోలేము. (Are you sure you want to delete your data? This action is irreversible.)'
    );
    if (confirmDelete) {
      setDataDeleted(true);
      setTimeout(() => setDataDeleted(false), 4000);
    }
  };

  if (isLoggedOut) {
    return (
      <div className="min-h-screen bg-krushi-bg flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-krushi-card rounded-2xl shadow-card p-8 text-center border border-gray-100 animate-[fade-in_0.3s_ease-out]">
          <div className="w-16 h-16 bg-krushi-green-pale text-krushi-green rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
            👋
          </div>
          <h2 className="heading-farm text-2xl text-krushi-green font-bold mb-2">ధన్యవాదాలు!</h2>
          <p className="text-krushi-muted text-sm mb-6">
            మీరు విజయవంతంగా లాగ్ అవుట్ అయ్యారు. తిరిగి మమ్మల్ని కలవడానికి స్వాగతం.
            <br />
            <span className="text-xs">(You have successfully logged out. Welcome back any time!)</span>
          </p>
          <button
            onClick={() => setIsLoggedOut(false)}
            className="w-full bg-krushi-green text-white py-2.5 rounded-lg font-medium hover:bg-krushi-green-dark transition-all duration-200"
          >
            తిరిగి లాగిన్ చేయండి (Login Again)
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-krushi-bg py-6 px-4 sm:px-6 lg:px-8">
      {/* Toast Notifications */}
      {farmSaved && (
        <div className="fixed bottom-5 right-5 bg-krushi-success text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 z-50 animate-[slide-in_0.25s_ease-out]">
          <Check size={18} />
          <span className="text-sm font-medium">వ్యవసాయ వివరాలు భద్రపరచబడ్డాయి! (Farm details saved!)</span>
        </div>
      )}
      {whatsAppSuccess && (
        <div className="fixed bottom-5 right-5 bg-krushi-success text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 z-50 animate-[slide-in_0.25s_ease-out]">
          <Check size={18} />
          <span className="text-sm font-medium">వాట్సాప్ నంబర్ నవీకరించబడింది! (WhatsApp number updated!)</span>
        </div>
      )}
      {dataDeleted && (
        <div className="fixed bottom-5 right-5 bg-krushi-danger text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 z-50 animate-[slide-in_0.25s_ease-out]">
          <AlertCircle size={18} />
          <span className="text-sm font-medium">మీ డేటా విజయవంతంగా తొలగించబడింది. (Data deleted successfully.)</span>
        </div>
      )}

      <div className="max-w-5xl mx-auto">
        <h1 className="heading-farm text-3xl font-extrabold text-krushi-green mb-8 flex items-center gap-2.5">
          <span>⚙️</span> ప్రొఫైల్ సెట్టింగులు <span className="text-xl font-normal text-krushi-muted">/ Settings</span>
        </h1>

        {/* Main Settings Wrapper: Sidebar + Content pane */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Navigation Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Farmer Profile Card Summary */}
            <div className="bg-krushi-card rounded-2xl p-6 shadow-card border border-gray-100 flex flex-col items-center text-center">
              
              {/* Large Avatar with camera button */}
              <div className="relative group mb-4">
                <div className={`w-28 h-28 ${avatarColor} text-white rounded-full flex items-center justify-center text-3xl font-bold shadow-md transition-all duration-300`}>
                  {nameEnglish.split(' ').map(n => n[0]).join('') || 'K'}
                </div>
                <div className="absolute bottom-0 right-0 w-8 h-8 bg-white border border-gray-200 rounded-full flex items-center justify-center text-krushi-text shadow-sm cursor-pointer hover:bg-gray-50 transition-colors">
                  <Camera size={16} />
                </div>
              </div>

              {/* Avatar Background Selector (Interactive micro-feature) */}
              <div className="flex gap-2 mb-4 justify-center">
                {colors.map((c) => (
                  <button
                    key={c.value}
                    onClick={() => setAvatarColor(c.value)}
                    className={`w-4 h-4 rounded-full ${c.value} ring-offset-2 ${
                      avatarColor === c.value ? 'ring-2 ring-krushi-green' : 'opacity-70 hover:opacity-100'
                    }`}
                    title={c.name}
                  />
                ))}
              </div>

              {/* Name Display */}
              <h2 className="text-lg font-bold text-krushi-text">{nameEnglish}</h2>
              <p className="text-telugu text-md text-krushi-green font-medium -mt-1">{nameTelugu}</p>
              
              {/* Phone Display */}
              <p className="text-xs text-krushi-muted mt-1 flex items-center gap-1">
                <Phone size={12} /> {phone}
              </p>

              {/* Location Badge */}
              <div className="mt-3 flex items-center gap-1 bg-krushi-green-pale text-krushi-green px-3 py-1 rounded-full text-xs font-semibold">
                <MapPin size={12} />
                <span>{village}, {district}</span>
              </div>
            </div>

            {/* Nav Menu */}
            <div className="bg-krushi-card rounded-2xl shadow-card border border-gray-100 overflow-hidden divide-y divide-gray-100">
              <button
                onClick={() => setActiveTab('profile')}
                className={`w-full text-left px-5 py-4 flex items-center gap-3 transition-colors ${
                  activeTab === 'profile' ? 'bg-krushi-green-pale text-krushi-green font-semibold' : 'text-krushi-text hover:bg-gray-50'
                }`}
              >
                <User size={18} />
                <div className="flex-1">
                  <span>ప్రొఫైల్ వివరాలు</span>
                  <span className="block text-[10px] text-krushi-muted font-normal">Farmer Info</span>
                </div>
              </button>

              <button
                onClick={() => setActiveTab('farm')}
                className={`w-full text-left px-5 py-4 flex items-center gap-3 transition-colors ${
                  activeTab === 'farm' ? 'bg-krushi-green-pale text-krushi-green font-semibold' : 'text-krushi-text hover:bg-gray-50'
                }`}
              >
                <Sprout size={18} />
                <div className="flex-1">
                  <span>వ్యవసాయ వివరాలు</span>
                  <span className="block text-[10px] text-krushi-muted font-normal">Farm Details</span>
                </div>
              </button>

              <button
                onClick={() => setActiveTab('alerts')}
                className={`w-full text-left px-5 py-4 flex items-center gap-3 transition-colors ${
                  activeTab === 'alerts' ? 'bg-krushi-green-pale text-krushi-green font-semibold' : 'text-krushi-text hover:bg-gray-50'
                }`}
              >
                <Bell size={18} />
                <div className="flex-1">
                  <span>నోటిఫికేషన్లు</span>
                  <span className="block text-[10px] text-krushi-muted font-normal">Alert Preferences</span>
                </div>
              </button>

              <button
                onClick={() => setActiveTab('language')}
                className={`w-full text-left px-5 py-4 flex items-center gap-3 transition-colors ${
                  activeTab === 'language' ? 'bg-krushi-green-pale text-krushi-green font-semibold' : 'text-krushi-text hover:bg-gray-50'
                }`}
              >
                <Globe size={18} />
                <div className="flex-1">
                  <span>భాష ఎంపిక</span>
                  <span className="block text-[10px] text-krushi-muted font-normal">Language Preferences</span>
                </div>
              </button>

              <button
                onClick={() => setActiveTab('safety')}
                className={`w-full text-left px-5 py-4 flex items-center gap-3 transition-colors ${
                  activeTab === 'safety' ? 'bg-krushi-green-pale text-krushi-green font-semibold' : 'text-krushi-text hover:bg-gray-50'
                }`}
              >
                <Shield size={18} />
                <div className="flex-1">
                  <span>డేటా & భద్రత</span>
                  <span className="block text-[10px] text-krushi-muted font-normal">Privacy & Data</span>
                </div>
              </button>

              <button
                onClick={() => setActiveTab('about')}
                className={`w-full text-left px-5 py-4 flex items-center gap-3 transition-colors ${
                  activeTab === 'about' ? 'bg-krushi-green-pale text-krushi-green font-semibold' : 'text-krushi-text hover:bg-gray-50'
                }`}
              >
                <Info size={18} />
                <div className="flex-1">
                  <span>యాప్ సమాచారం</span>
                  <span className="block text-[10px] text-krushi-muted font-normal">About App</span>
                </div>
              </button>

              <button
                onClick={() => setShowLogoutModal(true)}
                className="w-full text-left px-5 py-4 flex items-center gap-3 text-krushi-danger hover:bg-red-50 transition-colors"
              >
                <LogOut size={18} />
                <div className="flex-1">
                  <span className="font-semibold">లాగ్ అవుట్</span>
                  <span className="block text-[10px] text-krushi-danger/80 font-normal">Logout</span>
                </div>
              </button>
            </div>
          </div>

          {/* Right Pane Details Content */}
          <div className="lg:col-span-8 bg-krushi-card rounded-2xl shadow-card border border-gray-100 p-6 sm:p-8 min-h-[500px]">
            
            {/* 1. PROFILE DETAILS TAB */}
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-krushi-text flex items-center gap-2">
                    <User className="text-krushi-green" size={20} />
                    వ్యక్తిగత వివరాలు / Personal Info
                  </h3>
                  <p className="text-xs text-krushi-muted mt-1">మీ ప్రొఫైల్ వివరాలు మరియు చిరునామాను సవరించండి</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <TeluguInput
                    label="Name in English"
                    labelTelugu="ఇంగ్లీష్ పేరు"
                    placeholder="Enter your name"
                    value={nameEnglish}
                    onChange={(e) => setNameEnglish(e.target.value)}
                  />
                  <TeluguInput
                    label="Name in Telugu"
                    labelTelugu="తెలుగు పేరు"
                    placeholder="తెలుగులో పేరు నమోదు చేయండి"
                    telugu
                    value={nameTelugu}
                    onChange={(e) => setNameTelugu(e.target.value)}
                  />
                </div>

                <div className="border-t border-gray-100 pt-6 space-y-4">
                  <h4 className="text-sm font-semibold text-krushi-text flex items-center gap-1.5">
                    <MapPin className="text-krushi-green-light" size={16} />
                    చిరునామా / Address Details
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <TeluguInput
                      label="Village"
                      labelTelugu="గ్రామం"
                      placeholder="Village name"
                      value={village}
                      onChange={(e) => setVillage(e.target.value)}
                    />
                    <TeluguInput
                      label="Mandal"
                      labelTelugu="మండలం"
                      placeholder="Mandal name"
                      value={mandal}
                      onChange={(e) => setMandal(e.target.value)}
                    />
                    <TeluguInput
                      label="District"
                      labelTelugu="జిల్లా"
                      placeholder="District name"
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 2. FARM DETAILS TAB */}
            {activeTab === 'farm' && (
              <form onSubmit={handleSaveFarm} className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-krushi-text flex items-center gap-2">
                    <Sprout className="text-krushi-green" size={20} />
                    వ్యవసాయ వివరాలు / Farm Details
                  </h3>
                  <p className="text-xs text-krushi-muted mt-1">మెరుగైన పంట సిఫార్సులు పొందేందుకు మీ భూమి రకాన్ని మరియు నీటి వనరును ఎంపిక చేయండి</p>
                </div>

                <div className="space-y-6">
                  {/* Land Size */}
                  <div className="max-w-xs">
                    <TeluguInput
                      label="Land Size (Acres)"
                      labelTelugu="భూమి విస్తీర్ణం (ఎకరాలు)"
                      type="number"
                      placeholder="e.g. 5.5"
                      value={landSize}
                      onChange={(e) => setLandSize(e.target.value)}
                    />
                  </div>

                  {/* Soil Type Selector (Visual Grid Cards) */}
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-krushi-text flex items-center gap-2">
                      Soil Type Selection
                      <span className="text-telugu text-xs text-krushi-muted">(నేల రకం ఎంపిక)</span>
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {soilOptions.map((soil) => (
                        <div
                          key={soil.value}
                          onClick={() => setSoilType(soil.value)}
                          className={`p-4 rounded-xl border-2 text-left cursor-pointer transition-all duration-200 relative hover:border-krushi-green-light/60 flex gap-3 items-start ${
                            soilType === soil.value
                              ? 'border-krushi-green bg-krushi-green-pale/30 ring-2 ring-krushi-green/10'
                              : 'border-gray-200 bg-white'
                          }`}
                        >
                          <span className="text-2xl mt-0.5">{soil.emoji}</span>
                          <div className="space-y-0.5">
                            <span className="text-xs font-bold text-krushi-text block">
                              {soil.labelEn} <span className="text-telugu font-semibold">({soil.labelTe})</span>
                            </span>
                            <span className="text-[10px] text-krushi-muted block leading-snug">
                              {soil.descTe}
                            </span>
                          </div>
                          {soilType === soil.value && (
                            <span className="absolute top-2 right-2 w-4 h-4 bg-krushi-green rounded-full flex items-center justify-center text-white text-[9px] font-bold">✓</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Water Source Selector (Visual Grid Cards) */}
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-krushi-text flex items-center gap-2">
                      Water Source Selection
                      <span className="text-telugu text-xs text-krushi-muted">(నీటి వనరు ఎంపిక)</span>
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {waterOptions.map((water) => (
                        <div
                          key={water.value}
                          onClick={() => setWaterSource(water.value)}
                          className={`p-4 rounded-xl border-2 text-left cursor-pointer transition-all duration-200 relative hover:border-krushi-green-light/60 flex gap-3 items-start ${
                            waterSource === water.value
                              ? 'border-krushi-green bg-krushi-green-pale/30 ring-2 ring-krushi-green/10'
                              : 'border-gray-200 bg-white'
                          }`}
                        >
                          <span className="text-xl mt-0.5">{water.icon}</span>
                          <div className="space-y-0.5">
                            <span className="text-xs font-bold text-krushi-text block">
                              {water.labelEn} <span className="text-telugu font-semibold">({water.labelTe})</span>
                            </span>
                            <span className="text-[10px] text-krushi-muted block leading-snug">
                              {water.descTe}
                            </span>
                          </div>
                          {waterSource === water.value && (
                            <span className="absolute top-2 right-2 w-4 h-4 bg-krushi-green rounded-full flex items-center justify-center text-white text-[9px] font-bold">✓</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-6 flex justify-end">
                  <button
                    type="submit"
                    disabled={savingFarm}
                    className="bg-krushi-green text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-krushi-green-dark focus:ring-4 focus:ring-krushi-green/10 transition-all duration-200 flex items-center gap-2 cursor-pointer shadow-sm"
                  >
                    {savingFarm ? (
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Save size={16} />
                    )}
                    భద్రపరచు (Save Farm Details)
                  </button>
                </div>
              </form>
            )}

            {/* 3. ALERTS & NOTIFICATIONS TAB */}
            {activeTab === 'alerts' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-krushi-text flex items-center gap-2">
                    <Bell className="text-krushi-green" size={20} />
                    నోటిఫికేషన్లు / Notification Alerts
                  </h3>
                  <p className="text-xs text-krushi-muted mt-1">మీ వాట్సాప్ మరియు మొబైల్ కు పంపే హెచ్చరికలను ఎంపిక చేసుకోండి</p>
                </div>

                {/* Notification List with iOS switches */}
                <div className="bg-krushi-bg rounded-xl p-4 divide-y divide-gray-100 border border-gray-100">
                  <ToggleSwitch
                    id="whats-alerts"
                    label="WhatsApp Alerts"
                    sublabel="వాట్సాప్ సందేశాలు మరియు సలహాలు"
                    checked={notifs.whatsapp}
                    onChange={() => setNotifs({ ...notifs, whatsapp: !notifs.whatsapp })}
                    icon="💬"
                  />
                  <ToggleSwitch
                    id="sms-alerts"
                    label="SMS Alerts"
                    sublabel="ముఖ్యమైన సమాచార ఎస్ఎంఎస్"
                    checked={notifs.sms}
                    onChange={() => setNotifs({ ...notifs, sms: !notifs.sms })}
                    icon="📱"
                  />
                  <ToggleSwitch
                    id="dis-alerts"
                    label="Disease Alerts"
                    sublabel="పంట తెగుళ్ళ నివారణ హెచ్చరికలు"
                    checked={notifs.disease}
                    onChange={() => setNotifs({ ...notifs, disease: !notifs.disease })}
                    icon="🦠"
                  />
                  <ToggleSwitch
                    id="price-alerts"
                    label="Market Price Alerts"
                    sublabel="మార్కెట్ ధరలు మరియు ట్రెండ్స్ అప్డేట్స్"
                    checked={notifs.market}
                    onChange={() => setNotifs({ ...notifs, market: !notifs.market })}
                    icon="📊"
                  />
                  <ToggleSwitch
                    id="weath-alerts"
                    label="Weather Alerts"
                    sublabel="వాతావరణ మార్పులు మరియు వర్ష సూచన"
                    checked={notifs.weather}
                    onChange={() => setNotifs({ ...notifs, weather: !notifs.weather })}
                    icon="🌦️"
                  />
                  <ToggleSwitch
                    id="scheme-alerts"
                    label="Scheme Reminders"
                    sublabel="ప్రభుత్వ పథకాలు మరియు దరఖాస్తు గుర్తుచేసేవి"
                    checked={notifs.scheme}
                    onChange={() => setNotifs({ ...notifs, scheme: !notifs.scheme })}
                    icon="📋"
                  />
                </div>

                {/* WhatsApp Number Edit Widget */}
                <div className="bg-krushi-card border border-gray-200 rounded-xl p-5 mt-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-semibold text-krushi-text flex items-center gap-1.5">
                        <Smartphone className="text-krushi-green-light" size={16} />
                        WhatsApp Number
                      </h4>
                      <p className="text-xs text-krushi-muted mt-0.5">హెచ్చరికలు పంపే క్రియాశీల మొబైల్ నంబర్</p>
                    </div>
                    <span className="text-sm font-bold text-krushi-green">
                      +91 {whatsAppNum}
                    </span>
                  </div>

                  {!editingWhatsApp ? (
                    <button
                      onClick={() => setEditingWhatsApp(true)}
                      className="text-xs font-semibold text-krushi-green hover:text-krushi-green-dark underline"
                    >
                      నంబర్ మార్చండి (Change WhatsApp Number)
                    </button>
                  ) : (
                    <form onSubmit={handleWhatsAppChange} className="pt-3 border-t border-gray-100 flex items-end gap-3">
                      <div className="flex-1">
                        <TeluguInput
                          label="New WhatsApp Number"
                          labelTelugu="కొత్త వాట్సాప్ నంబర్"
                          type="tel"
                          placeholder="10 digit mobile number"
                          value={newWhatsApp}
                          onChange={(e) => setNewWhatsApp(e.target.value.replace(/\D/g, '').slice(0, 10))}
                          error={newWhatsApp && newWhatsApp.length !== 10 ? 'Enter exactly 10 digits' : ''}
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingWhatsApp(false);
                            setNewWhatsApp('');
                          }}
                          className="px-3 py-2.5 rounded-lg border border-gray-200 text-xs text-krushi-muted hover:bg-gray-50"
                        >
                          రద్దు (Cancel)
                        </button>
                        <button
                          type="submit"
                          disabled={newWhatsApp.length !== 10}
                          className="px-4 py-2.5 bg-krushi-green text-white text-xs font-semibold rounded-lg hover:bg-krushi-green-dark disabled:opacity-50 transition-colors"
                        >
                          స్థిరపరచు (Confirm)
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            )}

            {/* 4. LANGUAGE PREFERENCES TAB */}
            {activeTab === 'language' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-krushi-text flex items-center gap-2">
                    <Globe className="text-krushi-green" size={20} />
                    యాప్ భాష ఎంపిక / Language Preferences
                  </h3>
                  <p className="text-xs text-krushi-muted mt-1">యాప్ ప్రదర్శన మరియు వాయిస్ సిఫార్సుల కోసం ప్రాధాన్యత భాషను ఎంచుకోండి</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <label
                    className={`flex flex-col p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 relative ${
                      language === 'telugu'
                        ? 'border-krushi-green bg-krushi-green-pale/30'
                        : 'border-gray-200 hover:border-krushi-green-light/50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="language"
                      value="telugu"
                      checked={language === 'telugu'}
                      onChange={() => setLanguage('telugu')}
                      className="sr-only"
                    />
                    <span className="text-lg font-bold text-krushi-text">తెలుగు</span>
                    <span className="text-xs text-krushi-muted mt-1">Telugu script only. (మొత్తం తెలుగు సంభాషణలు)</span>
                    {language === 'telugu' && (
                      <span className="absolute top-3 right-3 w-5 h-5 bg-krushi-green rounded-full flex items-center justify-center text-white text-[10px] font-bold">✓</span>
                    )}
                  </label>

                  <label
                    className={`flex flex-col p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 relative ${
                      language === 'english'
                        ? 'border-krushi-green bg-krushi-green-pale/30'
                        : 'border-gray-200 hover:border-krushi-green-light/50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="language"
                      value="english"
                      checked={language === 'english'}
                      onChange={() => setLanguage('english')}
                      className="sr-only"
                    />
                    <span className="text-lg font-bold text-krushi-text">English</span>
                    <span className="text-xs text-krushi-muted mt-1">English UI & communication.</span>
                    {language === 'english' && (
                      <span className="absolute top-3 right-3 w-5 h-5 bg-krushi-green rounded-full flex items-center justify-center text-white text-[10px] font-bold">✓</span>
                    )}
                  </label>

                  <label
                    className={`flex flex-col p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 relative ${
                      language === 'both'
                        ? 'border-krushi-green bg-krushi-green-pale/30'
                        : 'border-gray-200 hover:border-krushi-green-light/50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="language"
                      value="both"
                      checked={language === 'both'}
                      onChange={() => setLanguage('both')}
                      className="sr-only"
                    />
                    <span className="text-lg font-bold text-krushi-text">రెండు భాషలు / Both</span>
                    <span className="text-xs text-krushi-muted mt-1">Bilingual assistance. (తెలుగు మరియు English)</span>
                    {language === 'both' && (
                      <span className="absolute top-3 right-3 w-5 h-5 bg-krushi-green rounded-full flex items-center justify-center text-white text-[10px] font-bold">✓</span>
                    )}
                  </label>
                </div>
              </div>
            )}

            {/* 5. PRIVACY & DATA SAFETY TAB */}
            {activeTab === 'safety' && (
              <div className="space-y-6 animate-[fade-in_0.25s_ease-out]">
                <div>
                  <h3 className="text-lg font-bold text-krushi-text flex items-center gap-2">
                    <Shield className="text-krushi-green" size={20} />
                    డేటా & గోప్యత / Privacy & Data Safety
                  </h3>
                  <p className="text-xs text-krushi-muted mt-1">మీ వ్యక్తిగత మరియు వ్యవసాయ డేటా భద్రత నియంత్రణలను ఇక్కడ నిర్వహించండి</p>
                </div>

                {/* Data Security Dashboard Indicators */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-krushi-bg p-4 rounded-xl border border-gray-150 space-y-2 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-center text-[10px] text-krushi-muted font-bold uppercase">
                        <span>Profile Data</span>
                        <span className="text-krushi-success flex items-center gap-0.5"><Lock size={8} /> Protected</span>
                      </div>
                      <span className="text-sm font-extrabold text-krushi-text block mt-1">వ్యక్తిగత ప్రొఫైల్</span>
                    </div>
                    <div className="space-y-1">
                      <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                        <div className="bg-krushi-success h-1.5 rounded-full" style={{ width: '100%' }}></div>
                      </div>
                      <span className="text-[9px] text-krushi-muted block">AES-256 Bit Encryption Active</span>
                    </div>
                  </div>

                  <div className="bg-krushi-bg p-4 rounded-xl border border-gray-150 space-y-2 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-center text-[10px] text-krushi-muted font-bold uppercase">
                        <span>Farm Details</span>
                        <span className="text-krushi-sky flex items-center gap-0.5"><Database size={8} /> Localized</span>
                      </div>
                      <span className="text-sm font-extrabold text-krushi-text block mt-1">భూమి వివరాలు</span>
                    </div>
                    <div className="space-y-1">
                      <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                        <div className="bg-krushi-sky h-1.5 rounded-full" style={{ width: '85%' }}></div>
                      </div>
                      <span className="text-[9px] text-krushi-muted block">Used solely for crop recommendation</span>
                    </div>
                  </div>

                  <div className="bg-krushi-bg p-4 rounded-xl border border-gray-150 space-y-2 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-center text-[10px] text-krushi-muted font-bold uppercase">
                        <span>WhatsApp Logs</span>
                        <span className="text-krushi-amber flex items-center gap-0.5"><Server size={8} /> Opt-In</span>
                      </div>
                      <span className="text-sm font-extrabold text-krushi-text block mt-1">వాట్సాప్ సందేశాలు</span>
                    </div>
                    <div className="space-y-1">
                      <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                        <div className="bg-krushi-amber h-1.5 rounded-full" style={{ width: '100%' }}></div>
                      </div>
                      <span className="text-[9px] text-krushi-muted block">End-to-End Chat Encryption verified</span>
                    </div>
                  </div>
                </div>

                {/* Encryption pipeline drawing */}
                <div className="bg-white border border-gray-150 p-5 rounded-2xl space-y-3">
                  <span className="text-[10px] text-krushi-muted font-bold uppercase tracking-wider block">
                    డేటా రక్షణ విధానం / Encryption Pipeline Flow
                  </span>
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-krushi-bg/60 p-4 rounded-xl text-xs font-semibold">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-lg border border-gray-200 shadow-xs">
                      <span>👤</span>
                      <span>రైతు సమాచారం</span>
                    </div>
                    <span className="text-krushi-muted hidden sm:inline">➔</span>
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-krushi-green text-white rounded-lg border border-transparent shadow-xs animate-pulse-glow">
                      <span>🔒 AES-256</span>
                      <span>సురక్షిత ఎన్‌క్రిప్షన్</span>
                    </div>
                    <span className="text-krushi-muted hidden sm:inline">➔</span>
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-lg border border-gray-200 shadow-xs">
                      <span>🗄️ MySQL DB</span>
                      <span>భద్రపరచిన సర్వర్</span>
                    </div>
                  </div>
                </div>

                <div className="bg-krushi-bg rounded-2xl p-5 border border-gray-150 space-y-4">
                  <div className="flex items-start gap-3">
                    <span className="text-xl">🔒</span>
                    <div>
                      <h4 className="text-sm font-bold text-krushi-text">డేటా రక్షణ పాలసీ (Data Protection Policy)</h4>
                      <p className="text-xs text-krushi-muted mt-1 leading-relaxed">
                        Krushi AI మీ వ్యక్తిగత వివరాలను కేవలం వాతావరణ మరియు పంట తెగుళ్ళ సిఫార్సుల కోసమే వాడుతుంది. మీ డేటా ఇతర ప్రైవేటు సంస్థలకు లీక్ కాదని మరియు ఎల్లప్పుడూ సురక్షితంగా ఉంటుందని హామీ ఇస్తున్నాము.
                      </p>
                    </div>
                  </div>
                  <div className="pt-3 border-t border-gray-200/50 flex flex-wrap gap-3 justify-between">
                    <button
                      onClick={() => setShowPrivacyModal(true)}
                      className="bg-white border border-gray-200 text-xs font-semibold px-4 py-2.5 rounded-lg text-krushi-text hover:bg-gray-50 transition-colors cursor-pointer shadow-xs"
                    >
                      డేటా నిబంధనలు చదవండి (Read Policy)
                    </button>
                    <button
                      onClick={handleDeleteData}
                      className="bg-red-50 text-krushi-danger hover:bg-red-100 border border-red-100 text-xs font-semibold px-4 py-2.5 rounded-lg transition-colors cursor-pointer"
                    >
                      నా డేటా మొత్తం తొలగించండి (Delete My Data)
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 6. ABOUT APP TAB */}
            {activeTab === 'about' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-krushi-text flex items-center gap-2">
                    <Info className="text-krushi-green" size={20} />
                    యాప్ సమాచారం / About Krushi AI
                  </h3>
                  <p className="text-xs text-krushi-muted mt-1">వ్యవసాయదారులకు అండగా ఉండే కృత్రిమ మేధస్సు వేదిక</p>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between py-3 border-b border-gray-100">
                    <span className="text-sm text-krushi-muted">Version</span>
                    <span className="text-sm font-bold text-krushi-text">1.2.0-beta (Telangana Crop Special)</span>
                  </div>
                  <div className="flex justify-between py-3 border-b border-gray-100">
                    <span className="text-sm text-krushi-muted">Region Coverage</span>
                    <span className="text-sm font-bold text-krushi-text">Telangana Districts (ఆదిలాబాద్ నుండి ఖమ్మం వరకు)</span>
                  </div>
                  <div className="flex justify-between py-3 border-b border-gray-100">
                    <span className="text-sm text-krushi-muted">Supported Crops</span>
                    <span className="text-sm font-bold text-krushi-text">Rice, Cotton, Maize, Groundnut, Red Gram</span>
                  </div>
                  <div className="flex justify-between py-3 border-b border-gray-100">
                    <span className="text-sm text-krushi-muted">Developed By</span>
                    <span className="text-sm font-bold text-krushi-text">Advanced Agritech Solutions Group</span>
                  </div>
                  <div className="bg-krushi-green-pale text-krushi-green text-xs p-4 rounded-xl leading-relaxed mt-4">
                    📢 <strong>వచన హెచ్చరిక:</strong> Krushi AI వ్యవసాయ విశ్వవిద్యాలయాల సిఫార్సుల ఆధారంగా పనిచేస్తుంది. తుది నిర్ణయం తీసుకునే ముందు స్థానిక వ్యవసాయ అధికారి సహాయం తీసుకోగలరు.
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* --- CONFIRMATION LOGOUT MODAL --- */}
      {showLogoutModal && (
        <div className="fixed inset-0 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm z-50 animate-[fade-in_0.2s_ease-out]">
          <div className="bg-krushi-card w-full max-w-md rounded-2xl p-6 shadow-modal border border-gray-100 animate-[scale-up_0.2s_ease-out]">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-full bg-krushi-danger-light text-krushi-danger flex items-center justify-center text-lg">
                ⚠️
              </div>
              <button
                onClick={() => setShowLogoutModal(false)}
                className="p-1 hover:bg-gray-100 rounded-full text-krushi-muted transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-bold text-krushi-text">
                బయటకు వెళ్ళాలా? <span className="text-xs text-krushi-muted">/ Confirm Logout</span>
              </h3>
              <p className="text-telugu text-md text-krushi-text font-medium leading-[1.8]">
                మీరు నిజంగా బయటకు వెళ్ళాలనుకుంటున్నారా?
              </p>
              <p className="text-xs text-krushi-muted">
                Are you sure you want to log out of the Krushi AI portal?
              </p>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowLogoutModal(false)}
                className="px-4 py-2.5 text-sm font-medium border border-gray-200 rounded-lg text-krushi-text hover:bg-gray-50 transition-colors"
              >
                వద్దు, ఉండండి (No, stay)
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowLogoutModal(false);
                  setIsLoggedOut(true);
                }}
                className="px-4 py-2.5 text-sm font-semibold rounded-lg bg-krushi-danger text-white hover:bg-krushi-danger/90 transition-colors"
              >
                అవును, లాగ్ అవుట్ (Yes, log out)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- PRIVACY STATEMENT MODAL --- */}
      {showPrivacyModal && (
        <div className="fixed inset-0 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm z-50 animate-[fade-in_0.2s_ease-out]">
          <div className="bg-krushi-card w-full max-w-lg rounded-2xl p-6 shadow-modal border border-gray-100 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-3">
              <h3 className="text-md font-bold text-krushi-text">
                Krushi AI డేటా విధానం (Data Policy)
              </h3>
              <button
                onClick={() => setShowPrivacyModal(false)}
                className="p-1 hover:bg-gray-100 rounded-full text-krushi-muted transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            
            <div className="space-y-4 text-xs text-krushi-text leading-relaxed">
              <p>
                <strong>1. మేము ఏ సమాచారాన్ని సేకరిస్తాము?</strong><br />
                మీ పేరు, వాట్సాప్ నంబర్, పంట రకం, మండలం, భూమి విస్తీర్ణం మరియు నేల స్వభావం.
              </p>
              <p>
                <strong>2. ఈ సమాచారం ఎలా ఉపయోగించబడుతుంది?</strong><br />
                - మీ ఊరుకు సరిపోయే వాతావరణ హెచ్చరికల కోసం.<br />
                - మీ నేలకు సరిపోయే ఎరువుల డోసేజ్ సిఫార్సుల కోసం.<br />
                - కొత్త గిట్టుబాటు ధరల నోటిఫికేషన్ల కోసం.
              </p>
              <p>
                <strong>3. మీ నియంత్రణ:</strong><br />
                సెట్టింగుల లోని "డేటా & భద్రత" విభాగం ద్వారా మీ డేటాను ఎప్పుడైనా పూర్తిగా తొలగించుకోవచ్చు.
              </p>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowPrivacyModal(false)}
                className="px-4 py-2 bg-krushi-green text-white text-xs font-semibold rounded-lg hover:bg-krushi-green-dark"
              >
                మూసివేయండి (Close)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
