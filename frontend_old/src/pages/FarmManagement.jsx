import React, { useState } from 'react';
import {
  Sprout,
  MapPin,
  Edit2,
  Calendar as CalendarIcon,
  Plus,
  Trash2,
  Compass,
  CheckCircle,
  AlertTriangle,
  ChevronRight,
  TrendingUp,
  Droplets,
  Calendar,
  X,
  Sliders,
  Award,
  ListPlus
} from 'lucide-react';
import { StatusChip } from '../components';

export default function FarmManagement() {
  // Farm Profile State
  const [farmProfile, setFarmProfile] = useState({
    nameTe: 'రాముల పంట పొలం',
    nameEn: 'Ramulu\'s Farm Plot',
    acres: 4.5,
    location: 'వరంగల్ (Warangal)',
    soil: 'ఎర్ర నేల (Red Soil)',
    water: 'బోరుబావి (Borewell)'
  });
  const [showEditProfile, setShowEditProfile] = useState(false);

  // Active Crops State
  const [activeCrops, setActiveCrops] = useState([
    {
      id: 'rice',
      key: 'rice',
      nameTe: 'వరి పంట',
      nameEn: 'Rice Paddy',
      emoji: '🌾',
      bgColor: 'bg-emerald-50 border-emerald-200',
      textColor: 'text-emerald-700',
      stage: 'Vegetative (పిలక దశ)',
      daysCompleted: 25,
      totalDays: 120,
      nextActionTe: 'ఈరోజు నీరు పోయండి',
      nextActionEn: 'Water Today',
      health: 'healthy', // healthy | monitor | action
      area: 2.5
    },
    {
      id: 'cotton',
      key: 'cotton',
      nameTe: 'పత్తి పంట',
      nameEn: 'Cotton Crop',
      emoji: '🌿',
      bgColor: 'bg-amber-50 border-amber-200',
      textColor: 'text-amber-700',
      stage: 'Flowering (పూత దశ)',
      daysCompleted: 18,
      totalDays: 160,
      nextActionTe: 'రేపు కలుపు తీయాలి',
      nextActionEn: 'Weeding Tomorrow',
      health: 'monitor',
      area: 2.0
    }
  ]);

  // Crop Wizard States
  const [showAddWizard, setShowAddWizard] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [selectedCropKey, setSelectedCropKey] = useState(null);
  const [wizardDetails, setWizardDetails] = useState({
    sowingDate: '2026-06-17',
    area: 1.5,
    soilType: 'red',
    waterSource: 'borewell'
  });

  // Calendar States
  const [selectedDate, setSelectedDate] = useState(17);
  const [tasks, setTasks] = useState({
    12: [{ type: 'fertilizer', te: 'పత్తికి పొటాష్ వేయడం', en: 'Apply Potash to Cotton', color: 'bg-amber-500' }],
    15: [{ type: 'water', te: 'వరి చేనుకు నీరు పెట్టడం', en: 'Paddy irrigation', color: 'bg-blue-500' }],
    17: [
      { type: 'water', te: 'వరి చేనుకు నీరు పెట్టడం', en: 'Paddy irrigation', color: 'bg-blue-500' },
      { type: 'spray', te: 'ఎన్.పి.కె మట్టి పరీక్ష రిపోర్ట్', en: 'NPK Soil Inspection', color: 'bg-red-500' }
    ],
    18: [{ type: 'spray', te: 'పత్తి కలుపు తీయుట', en: 'Manual weeding', color: 'bg-red-500' }],
    21: [{ type: 'harvest', te: 'వరికి యూరియా వేయుట', en: 'Top dress Paddy with Urea', color: 'bg-green-500' }]
  });
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTaskTextTe, setNewTaskTextTe] = useState('');
  const [newTaskTextEn, setNewTaskTextEn] = useState('');
  const [newTaskType, setNewTaskType] = useState('water');

  // Soil NPK health levels
  const npkLevels = {
    n: { val: 35, label: 'Nitrogen (నత్రజని)', status: 'Low (తక్కువ)', color: 'stroke-red-500', bg: 'text-red-500' },
    p: { val: 65, label: 'Phosphorus (భాస్వరం)', status: 'Medium (సగటు)', color: 'stroke-amber-500', bg: 'text-amber-500' },
    k: { val: 78, label: 'Potassium (పొటాషియం)', status: 'Optimal (సరిపడా)', color: 'stroke-green-600', bg: 'text-green-600' }
  };

  const cropWizardPresets = [
    { key: 'rice', nameTe: 'వరి', nameEn: 'Rice Paddy', emoji: '🌾' },
    { key: 'cotton', nameTe: 'పత్తి', nameEn: 'Cotton Kapas', emoji: '🌿' },
    { key: 'maize', nameTe: 'మొక్కజొన్న', nameEn: 'Hybrid Maize', emoji: '🌽' },
    { key: 'soya', nameTe: 'సోయాబీన్', nameEn: 'Soybean', emoji: '🌱' },
    { key: 'chilli', nameTe: 'మిర్చి', nameEn: 'Dry Chilli', emoji: '🌶️' },
    { key: 'turmeric', nameTe: 'పసుపు', nameEn: 'Turmeric', emoji: '🍠' }
  ];

  const handleEditProfileSubmit = (e) => {
    e.preventDefault();
    setShowEditProfile(false);
  };

  // Wizard transitions
  const handleWizardCropSelect = (key) => {
    setSelectedCropKey(key);
    setWizardStep(2);
  };

  const handleWizardSubmit = () => {
    const preset = cropWizardPresets.find(c => c.key === selectedCropKey);
    const newCrop = {
      id: `${selectedCropKey}-${Date.now()}`,
      key: selectedCropKey,
      nameTe: `${preset.nameTe} పంట`,
      nameEn: preset.nameEn,
      emoji: preset.emoji,
      bgColor: selectedCropKey === 'rice' ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200',
      textColor: selectedCropKey === 'rice' ? 'text-emerald-700' : 'text-amber-700',
      stage: 'Germination (మొలక దశ)',
      daysCompleted: 1,
      totalDays: selectedCropKey === 'rice' ? 120 : 160,
      nextActionTe: 'నేల పదును తనిఖీ చేయండి',
      nextActionEn: 'Inspect Soil Moisture',
      health: 'healthy',
      area: parseFloat(wizardDetails.area)
    };

    setActiveCrops([...activeCrops, newCrop]);
    setShowAddWizard(false);
    setWizardStep(1);
    setSelectedCropKey(null);
  };

  const handleRemoveCrop = (id) => {
    setActiveCrops(activeCrops.filter(c => c.id !== id));
  };

  // Calendar dynamic task addition
  const handleAddTaskSubmit = (e) => {
    e.preventDefault();
    if (!newTaskTextTe) return;

    const newTask = {
      type: newTaskType,
      te: newTaskTextTe,
      en: newTaskTextEn || newTaskTextTe,
      color: newTaskType === 'water' ? 'bg-blue-500' : newTaskType === 'fertilizer' ? 'bg-amber-500' : newTaskType === 'spray' ? 'bg-red-500' : 'bg-green-500'
    };

    setTasks({
      ...tasks,
      [selectedDate]: [...(tasks[selectedDate] || []), newTask]
    });
    setNewTaskTextTe('');
    setNewTaskTextEn('');
    setShowAddTask(false);
  };

  return (
    <div className="bg-krushi-bg min-h-screen py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8 animate-[fade-in_0.3s_ease-out] pb-24 md:pb-12 text-krushi-text">
      
      {/* 1. Header Section */}
      <div className="border-b border-gray-200 pb-4">
        <span className="px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-extrabold bg-krushi-green-pale text-krushi-green border border-krushi-green-light/10">
          🚜 Farm Profile & Crop Manager
        </span>
        <h1 className="heading-farm text-2xl sm:text-3xl font-extrabold text-slate-800 mt-2">
          నా వ్యవసాయ క్షేత్రం <span className="text-krushi-green">/ Farm Management Portal</span>
        </h1>
        <p className="text-xs text-krushi-muted mt-1 font-telugu">
          మీ సాగు భూమి వివరాలు, యాక్టివ్ పంట దశలు, ఎన్.పి.కె నేల విశ్లేషణ మరియు వ్యవసాయ షెడ్యూల్‌ను ఇక్కడ నిర్వహించండి.
        </p>
      </div>

      {/* 2. FARM PROFILE CARD (top, full width) */}
      <section className="bg-white rounded-3xl border border-gray-150 shadow-card overflow-hidden grid grid-cols-1 md:grid-cols-12">
        
        {/* Farm details info (8 columns) */}
        <div className="md:col-span-8 p-6 flex flex-col justify-between relative">
          <div className="absolute -top-10 -left-10 w-28 h-28 bg-krushi-green-pale/40 rounded-full blur-2xl pointer-events-none" />
          
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[9px] uppercase tracking-widest font-black text-krushi-muted">Active Profile</span>
                <h2 className="text-2xl font-black text-slate-900 leading-tight">
                  {farmProfile.nameTe} <span className="text-sm font-semibold text-krushi-muted block md:inline font-sans ml-0.5">({farmProfile.nameEn})</span>
                </h2>
              </div>
              
              <button
                onClick={() => setShowEditProfile(true)}
                className="p-2.5 rounded-2xl bg-krushi-bg border border-gray-200 hover:border-krushi-green hover:bg-krushi-green-pale/30 text-krushi-muted hover:text-krushi-green cursor-pointer transition-all duration-200"
                title="Edit profile"
              >
                <Edit2 size={14} />
              </button>
            </div>

            {/* Farm parameters specs grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-gray-100">
              <div className="bg-krushi-bg/60 p-3 rounded-2xl border border-gray-150/40 text-center">
                <span className="text-lg block">🌾</span>
                <span className="text-[9px] font-bold text-krushi-muted block uppercase">Land Size</span>
                <strong className="text-xs font-mono text-slate-800">{farmProfile.acres} Acres</strong>
              </div>
              <div className="bg-krushi-bg/60 p-3 rounded-2xl border border-gray-150/40 text-center">
                <span className="text-lg block">📍</span>
                <span className="text-[9px] font-bold text-krushi-muted block uppercase">Location</span>
                <strong className="text-xs text-slate-800">{farmProfile.location.split(' ')[0]}</strong>
              </div>
              <div className="bg-krushi-bg/60 p-3 rounded-2xl border border-gray-150/40 text-center">
                <span className="text-lg block">🪨</span>
                <span className="text-[9px] font-bold text-krushi-muted block uppercase">Soil Type</span>
                <strong className="text-xs text-slate-800 text-telugu">{farmProfile.soil.split(' ')[0]}</strong>
              </div>
              <div className="bg-krushi-bg/60 p-3 rounded-2xl border border-gray-150/40 text-center">
                <span className="text-lg block">💧</span>
                <span className="text-[9px] font-bold text-krushi-muted block uppercase">Water Source</span>
                <strong className="text-xs text-slate-800 text-telugu">{farmProfile.water.split(' ')[0]}</strong>
              </div>
            </div>

          </div>

          <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between text-xs font-bold">
            <span className="text-krushi-muted">Farmer ID: KR-9042 | Registration active</span>
            <span className="text-krushi-green flex items-center gap-0.5">🟢 Verified Plot</span>
          </div>

        </div>

        {/* GPS Location Map placeholder (4 columns) */}
        <div className="md:col-span-4 bg-slate-900 border-l border-gray-100 min-h-[160px] relative flex items-center justify-center p-4">
          {/* Static map overlay visual */}
          <div className="absolute inset-0 opacity-25 bg-[radial-gradient(#BA7517_1.5px,transparent_1.5px)] [background-size:16px_16px] pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1">
            <MapPin size={24} className="text-red-500 animate-bounce" />
            <span className="bg-slate-800/90 text-white border border-slate-700 text-[8px] font-black uppercase px-2 py-0.5 rounded tracking-widest font-mono">
              GPS Lat: 18.001 / Lon: 79.588
            </span>
          </div>
          <div className="absolute bottom-3 left-3 bg-slate-850 border border-slate-700/80 rounded px-2 py-1 text-[8px] text-gray-300 font-bold">
            🗺️ Satellite Map View
          </div>
        </div>

      </section>

      {/* 3. MIDDLE LAYOUT SPLIT: ACTIVE CROPS & SOIL HEALTH */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left column: Active Crops List (8 Columns) */}
        <div className="lg:col-span-8 space-y-4">
          
          <div className="flex justify-between items-center">
            <span className="text-xs uppercase tracking-widest font-extrabold text-krushi-amber">సాగులో ఉన్న పంటలు / Active Crops</span>
            
            {/* Add Crop wizard trigger */}
            <button
              onClick={() => setShowAddWizard(true)}
              className="px-3.5 py-2 rounded-2xl bg-krushi-green hover:bg-krushi-green-dark text-white text-xs font-black shadow-md shadow-krushi-green/20 hover:scale-[1.02] active:scale-98 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus size={14} />
              <span>Add New Crop (పంట చేర్చండి)</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {activeCrops.map((c) => (
              <div
                key={c.id}
                className="bg-white p-5 rounded-3xl border border-gray-150 shadow-card flex flex-col justify-between space-y-5 relative"
              >
                {/* Remove Crop Action */}
                <button
                  onClick={() => handleRemoveCrop(c.id)}
                  className="absolute top-4 right-4 p-1.5 rounded-xl hover:bg-red-50 hover:text-red-600 text-krushi-muted cursor-pointer transition-all"
                  title="Remove Crop"
                >
                  <Trash2 size={13} />
                </button>

                <div className="flex gap-3.5 items-start">
                  {/* Illustrated Emoji Thumbnail */}
                  <span className="text-4xl p-3 bg-krushi-bg rounded-2xl border border-gray-150/50 block select-none">
                    {c.emoji}
                  </span>
                  <div>
                    <h3 className="text-sm sm:text-base font-extrabold text-slate-900 text-telugu leading-snug">
                      {c.nameTe}
                    </h3>
                    <span className="text-[10px] text-krushi-muted font-bold block">{c.nameEn} | {c.area} Acres</span>
                  </div>
                </div>

                <div className="space-y-2 border-t border-gray-100 pt-4">
                  <div className="flex justify-between text-[10px] font-bold">
                    <span className="text-krushi-green font-extrabold">{c.stage}</span>
                    <span className="text-krushi-muted">{Math.round((c.daysCompleted / c.totalDays) * 100)}% Complete</span>
                  </div>
                  
                  {/* Days progress bar */}
                  <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-krushi-amber to-krushi-green h-2 rounded-full transition-all duration-500"
                      style={{ width: `${(c.daysCompleted / c.totalDays) * 100}%` }}
                    />
                  </div>

                  <span className="block text-[8px] text-krushi-muted font-bold font-mono uppercase tracking-wider">
                    {c.daysCompleted} days completed / {c.totalDays} days total cycle
                  </span>
                </div>

                {/* Status chips and details */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-t border-gray-100 pt-4 w-full text-xs font-bold">
                  {/* Health status dot indicator */}
                  <div className="flex items-center gap-1">
                    <span className={`w-2 h-2 rounded-full ${c.health === 'healthy' ? 'bg-green-500' : c.health === 'monitor' ? 'bg-amber-500' : 'bg-red-500'}`} />
                    <span className="text-[9px] uppercase tracking-wider font-extrabold text-slate-800">
                      {c.health === 'healthy' ? 'Healthy (బాగుంది)' : c.health === 'monitor' ? 'Monitor (నిఘా)' : 'Action Needed'}
                    </span>
                  </div>

                  <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 text-[9px] font-black uppercase text-telugu">
                    🔔 {c.nextActionTe}
                  </span>
                </div>

              </div>
            ))}
          </div>

        </div>

        {/* Right column: Soil NPK gauge indicators (4 Columns) */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-gray-150 shadow-card space-y-6">
          
          <div>
            <span className="text-[9px] uppercase tracking-widest font-black text-krushi-amber">Lab Soil Analysis</span>
            <h3 className="text-sm sm:text-base font-black text-slate-800 mt-0.5">
              మట్టి ఆరోగ్య రిపోర్ట్ <span className="text-xs font-semibold text-krushi-muted block mt-0.5">/ NPK Soil Health Card</span>
            </h3>
          </div>

          {/* NPK Circular charts grid */}
          <div className="grid grid-cols-3 gap-2 py-2 border-y border-gray-100">
            {Object.entries(npkLevels).map(([key, item]) => (
              <div key={key} className="flex flex-col items-center gap-1.5 text-center">
                <div className="relative w-14 h-14 flex items-center justify-center">
                  
                  {/* SVG circular progress */}
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="28"
                      cy="28"
                      r="24"
                      fill="transparent"
                      stroke="#f3f4f6"
                      strokeWidth="3.5"
                    />
                    <circle
                      cx="28"
                      cy="28"
                      r="24"
                      fill="transparent"
                      className={`${item.color} transition-all duration-700`}
                      strokeWidth="4"
                      strokeDasharray="150"
                      strokeDashoffset={150 - (150 * item.val) / 100}
                      strokeLinecap="round"
                    />
                  </svg>
                  
                  <span className="absolute text-[10px] font-bold font-mono text-slate-850">{item.val}%</span>
                </div>
                <div>
                  <span className="text-[11px] font-black block">{key.toUpperCase()}</span>
                  <span className={`text-[8px] font-extrabold uppercase ${item.bg}`}>{item.status.split(' ')[0]}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Diagnostic recommendations box */}
          <div className="bg-red-50/80 border border-red-200 p-3.5 rounded-2xl flex items-start gap-2.5 text-xs font-semibold">
            <AlertTriangle size={15} className="text-red-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="text-red-900 text-[13px] font-bold text-telugu block">
                "నత్రజని (N) తక్కువగా ఉంది — యూరియా ఎరువును వేయండి"
              </span>
              <p className="text-[10px] text-red-700 leading-snug">
                (Nitrogen level is low. Apply 30kg Urea per acre during irrigation top dressing.)
              </p>
            </div>
          </div>

        </div>

      </div>

      {/* 4. FARM ACTIVITY CALENDAR (full width) */}
      <section className="bg-white rounded-3xl p-6 border border-gray-150 shadow-card space-y-6">
        
        <div className="flex justify-between items-center border-b border-gray-100 pb-4">
          <div>
            <span className="text-[9px] uppercase tracking-widest font-black text-krushi-amber">Monthly Schedule</span>
            <h3 className="text-base sm:text-lg font-black text-slate-800 mt-0.5">
              వ్యవసాయ షెడ్యూల్ క్యాలెండర్ <span className="text-xs font-semibold text-krushi-muted">/ Farm Activity Calendar</span>
            </h3>
          </div>

          <button
            onClick={() => setShowAddTask(true)}
            className="px-3 py-1.5 rounded-xl border border-gray-200 hover:border-krushi-amber hover:bg-krushi-bg text-slate-700 text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
          >
            <Plus size={13} />
            <span>Add Task</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Calendar Grid (8 Columns) */}
          <div className="lg:col-span-8 space-y-4">
            <div className="flex justify-between items-center text-xs font-extrabold text-krushi-muted">
              <span>◄ May 2026</span>
              <span className="text-sm font-black text-slate-800">June 2026</span>
              <span>July 2026 ►</span>
            </div>

            {/* 7 column grid header */}
            <div className="grid grid-cols-7 gap-1.5 text-center text-[9px] font-black uppercase text-krushi-muted tracking-wider border-b border-gray-100 pb-2">
              <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-1.5 text-xs">
              {/* Offset empty boxes for start day */}
              {[...Array(4)].map((_, i) => (
                <div key={`offset-${i}`} className="aspect-square bg-slate-50/50 rounded-xl" />
              ))}
              
              {/* Day values 1-30 */}
              {[...Array(30)].map((_, idx) => {
                const dayNum = idx + 1;
                const hasTasks = tasks[dayNum];
                const isSelected = selectedDate === dayNum;

                return (
                  <button
                    key={dayNum}
                    onClick={() => setSelectedDate(dayNum)}
                    className={`aspect-square rounded-2xl flex flex-col justify-between p-1.5 border transition-all cursor-pointer hover:border-krushi-amber ${
                      isSelected
                        ? 'bg-krushi-amber border-transparent text-white shadow-sm shadow-krushi-amber/25'
                        : 'bg-white border-gray-100 text-slate-800 hover:bg-slate-50'
                    }`}
                  >
                    <span className="font-mono font-bold block">{dayNum}</span>
                    
                    {/* Color coded dots */}
                    {hasTasks && (
                      <div className="flex gap-0.5 justify-center w-full">
                        {hasTasks.slice(0, 3).map((t, tIdx) => (
                          <span key={tIdx} className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : t.color}`} />
                        ))}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Task detail side panel (4 Columns) */}
          <div className="lg:col-span-4 bg-krushi-bg/60 p-4.5 rounded-3xl border border-gray-150/50 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="border-b border-gray-200/50 pb-2.5">
                <span className="text-[9px] uppercase tracking-wider font-extrabold text-krushi-muted">Tasks Scheduled</span>
                <h4 className="text-sm font-black text-slate-800">
                  📅 June {selectedDate}, 2026
                </h4>
              </div>

              {/* Day Tasks List */}
              <div className="space-y-2.5">
                {tasks[selectedDate] && tasks[selectedDate].length > 0 ? (
                  tasks[selectedDate].map((t, idx) => (
                    <div key={idx} className="p-3 bg-white border border-gray-150 rounded-2xl flex gap-3 items-start shadow-xs animate-[fade-in_0.2s_ease-out]">
                      <span className={`w-2.5 h-2.5 rounded-full shrink-0 mt-1.5 ${t.color}`} />
                      <div>
                        <h5 className="text-[12.5px] font-black text-slate-800 text-telugu leading-snug">{t.te}</h5>
                        <p className="text-[9px] text-krushi-muted mt-0.5">{t.en}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-8 text-center text-xs text-krushi-muted font-bold">
                    ఈ తేదీకి పనులేవీ లేవు (No tasks scheduled today)
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={() => setShowAddTask(true)}
              className="w-full mt-6 py-2.5 rounded-2xl bg-krushi-green text-white font-extrabold hover:bg-krushi-green-dark text-xs flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Plus size={13} />
              <span>Add New Activity</span>
            </button>
          </div>

        </div>

      </section>

      {/* --- ADD CROP WIZARD DRAWER/MODAL --- */}
      {showAddWizard && (
        <div className="fixed inset-0 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs z-50 animate-[fade-in_0.2s_ease-out]">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 shadow-modal border border-gray-150 animate-[scale-up_0.2s_ease-out] relative max-h-[90vh] overflow-y-auto">
            
            <button
              onClick={() => {
                setShowAddWizard(false);
                setWizardStep(1);
              }}
              className="absolute top-5 right-5 p-1 hover:bg-gray-100 rounded-full text-krushi-muted cursor-pointer"
            >
              <X size={18} />
            </button>

            {/* Stepper indicator bar */}
            <div className="flex gap-2.5 items-center mb-6 max-w-xs mx-auto">
              {[1, 2, 3].map((s) => (
                <div key={s} className="flex-1 flex items-center gap-2">
                  <span className={`w-5 h-5 rounded-full text-[9px] font-black flex items-center justify-center border transition-all ${
                    wizardStep === s ? 'bg-krushi-green text-white border-transparent shadow-xs' : wizardStep > s ? 'bg-krushi-green-pale text-krushi-green border-transparent' : 'bg-white border-gray-200 text-gray-400'
                  }`}>
                    {wizardStep > s ? '✓' : s}
                  </span>
                  {s < 3 && <div className={`flex-1 h-0.5 ${wizardStep > s ? 'bg-krushi-green' : 'bg-gray-200'}`} />}
                </div>
              ))}
            </div>

            {/* STEP 1: CROP SELECTION GRID */}
            {wizardStep === 1 && (
              <div className="space-y-4">
                <div className="text-center">
                  <h3 className="text-base sm:text-lg font-black text-slate-800 text-telugu leading-snug">పంట రకాన్ని ఎంచుకోండి</h3>
                  <p className="text-xs text-krushi-muted">Step 1: Select crop to cultivate from grid</p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {cropWizardPresets.map((crop) => (
                    <button
                      key={crop.key}
                      onClick={() => handleWizardCropSelect(crop.key)}
                      className="p-4 bg-white border border-gray-200 rounded-2xl text-center hover:border-krushi-green hover:bg-gray-50 active:scale-98 transition-all flex flex-col items-center justify-center gap-2 cursor-pointer shadow-sm shadow-black/[0.02]"
                    >
                      <span className="text-4xl block select-none">{crop.emoji}</span>
                      <span className="text-xs font-black text-slate-800 text-telugu block leading-snug">{crop.nameTe}</span>
                      <span className="text-[8px] text-krushi-muted block font-semibold">{crop.nameEn}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 2: DETAILS FORM */}
            {wizardStep === 2 && (
              <div className="space-y-5">
                <div className="text-center">
                  <h3 className="text-base sm:text-lg font-black text-slate-800 text-telugu leading-snug">వివరాలు నమోదు చేయండి</h3>
                  <p className="text-xs text-krushi-muted">Step 2: Enter crop area, dates, parameters</p>
                </div>

                <div className="space-y-4 text-xs font-semibold">
                  
                  {/* Sowing Date */}
                  <div className="space-y-1">
                    <label className="text-[10px] text-krushi-muted uppercase tracking-wider block">Sowing Date</label>
                    <input
                      type="date"
                      value={wizardDetails.sowingDate}
                      onChange={(e) => setWizardDetails({ ...wizardDetails, sowingDate: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-krushi-bg border border-gray-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-krushi-green"
                    />
                  </div>

                  {/* Area Slider */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-[10px] text-krushi-muted uppercase tracking-wider">
                      <span>Area (Acres)</span>
                      <span className="font-mono font-black text-krushi-green">{wizardDetails.area} Acres</span>
                    </div>
                    <input
                      type="range"
                      min="0.5"
                      max="10"
                      step="0.5"
                      value={wizardDetails.area}
                      onChange={(e) => setWizardDetails({ ...wizardDetails, area: e.target.value })}
                      className="w-full accent-krushi-green cursor-pointer"
                    />
                  </div>

                  {/* Soil Type */}
                  <div className="space-y-1">
                    <label className="text-[10px] text-krushi-muted uppercase tracking-wider block">Soil Type</label>
                    <select
                      value={wizardDetails.soilType}
                      onChange={(e) => setWizardDetails({ ...wizardDetails, soilType: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-krushi-bg border border-gray-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-krushi-green"
                    >
                      <option value="red">ఎర్ర నేల (Red Soil)</option>
                      <option value="black">నల్ల రేగడి నేల (Black Soil)</option>
                      <option value="sandy">ఇసుక నేల (Sandy Soil)</option>
                      <option value="alluvial">ఒండ్రు నేల (Alluvial Soil)</option>
                    </select>
                  </div>

                  {/* Water Source */}
                  <div className="space-y-2">
                    <label className="text-[10px] text-krushi-muted uppercase tracking-wider block">Water Source</label>
                    
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 cursor-pointer text-slate-700">
                        <input
                          type="radio"
                          name="water"
                          value="borewell"
                          checked={wizardDetails.waterSource === 'borewell'}
                          onChange={() => setWizardDetails({ ...wizardDetails, waterSource: 'borewell' })}
                          className="accent-krushi-green"
                        />
                        <span>Borewell</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer text-slate-700">
                        <input
                          type="radio"
                          name="water"
                          value="canal"
                          checked={wizardDetails.waterSource === 'canal'}
                          onChange={() => setWizardDetails({ ...wizardDetails, waterSource: 'canal' })}
                          className="accent-krushi-green"
                        />
                        <span>Canal</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer text-slate-700">
                        <input
                          type="radio"
                          name="water"
                          value="rain"
                          checked={wizardDetails.waterSource === 'rain'}
                          onChange={() => setWizardDetails({ ...wizardDetails, waterSource: 'rain' })}
                          className="accent-krushi-green"
                        />
                        <span>Rainfed</span>
                      </label>
                    </div>
                  </div>

                </div>

                <div className="flex gap-2.5 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => setWizardStep(1)}
                    className="flex-1 py-2.5 border border-gray-200 text-slate-700 rounded-2xl text-xs font-bold hover:bg-gray-50 cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => setWizardStep(3)}
                    className="flex-1 py-2.5 bg-krushi-green hover:bg-krushi-green-dark text-white rounded-2xl text-xs font-extrabold shadow-sm cursor-pointer"
                  >
                    Continue
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: CONFIRM & PLAN GENERATION */}
            {wizardStep === 3 && (
              <div className="space-y-5">
                <div className="text-center">
                  <h3 className="text-base sm:text-lg font-black text-slate-800 text-telugu leading-snug">AI సాగు కార్యాచరణ ప్రణాళిక సిద్ధం</h3>
                  <p className="text-xs text-krushi-muted">Step 3: Confirm and get generated AI Farm Plan</p>
                </div>

                <div className="bg-krushi-green-pale/40 border border-krushi-green-light/10 p-4 rounded-2xl space-y-3 text-xs font-semibold">
                  <span className="text-[10px] text-krushi-green uppercase tracking-widest font-black block">AI Schedule Generated</span>
                  
                  <div className="space-y-2.5">
                    <div className="flex gap-2 items-start text-[12.5px] text-slate-800 text-telugu leading-relaxed">
                      <span className="w-1.5 h-1.5 rounded-full bg-krushi-green mt-2 shrink-0" />
                      <span>మొదటి 10 రోజులు: మొలక దశ పర్యవేక్షణ మరియు తేలికపాటి తడి అందించాలి.</span>
                    </div>
                    <div className="flex gap-2 items-start text-[12.5px] text-slate-800 text-telugu leading-relaxed">
                      <span className="w-1.5 h-1.5 rounded-full bg-krushi-green mt-2 shrink-0" />
                      <span>20వ రోజు: మొదటి విడత కలుపు నివారణ చర్యలు మరియు నత్రజని లోపం తనిఖీ.</span>
                    </div>
                    <div className="flex gap-2 items-start text-[12.5px] text-slate-800 text-telugu leading-relaxed">
                      <span className="w-1.5 h-1.5 rounded-full bg-krushi-green mt-2 shrink-0" />
                      <span>40వ రోజు: సూక్ష్మపోషకాల పిచికారీ మరియు నీటి యాజమాన్యం.</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2.5 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => setWizardStep(2)}
                    className="flex-1 py-2.5 border border-gray-200 text-slate-700 rounded-2xl text-xs font-bold hover:bg-gray-50 cursor-pointer"
                  >
                    Modify details
                  </button>
                  <button
                    onClick={handleWizardSubmit}
                    className="flex-1 py-2.5 bg-krushi-green hover:bg-krushi-green-dark text-white rounded-2xl text-xs font-black shadow-md shadow-krushi-green/20 cursor-pointer"
                  >
                    Confirm & Save (ప్రారంభించండి)
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* --- EDIT PROFILE MODAL --- */}
      {showEditProfile && (
        <div className="fixed inset-0 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs z-50 animate-[fade-in_0.2s_ease-out]">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-modal border border-gray-150 animate-[scale-up_0.2s_ease-out] relative">
            
            <button
              onClick={() => setShowEditProfile(false)}
              className="absolute top-5 right-5 p-1 hover:bg-gray-100 rounded-full text-krushi-muted cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-base sm:text-lg font-black text-slate-800 text-telugu leading-snug">వ్యవసాయ క్షేత్ర వివరాలు సవరించండి</h3>
                <span className="text-xs text-krushi-muted font-mono block">Edit Farm Profile Parameters</span>
              </div>

              <form onSubmit={handleEditProfileSubmit} className="space-y-4 text-xs font-semibold">
                <div className="space-y-1">
                  <label className="text-[10px] text-krushi-muted uppercase tracking-wider block">Farm Name (Telugu)</label>
                  <input
                    type="text"
                    value={farmProfile.nameTe}
                    onChange={(e) => setFarmProfile({ ...farmProfile, nameTe: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-krushi-bg border border-gray-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-krushi-green"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-krushi-muted uppercase tracking-wider block">Plot Area (Acres)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={farmProfile.acres}
                    onChange={(e) => setFarmProfile({ ...farmProfile, acres: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-krushi-bg border border-gray-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-krushi-green"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] text-krushi-muted uppercase tracking-wider block">Soil Composition</label>
                    <input
                      type="text"
                      value={farmProfile.soil}
                      onChange={(e) => setFarmProfile({ ...farmProfile, soil: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-krushi-bg border border-gray-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-krushi-green"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-krushi-muted uppercase tracking-wider block">Water Source</label>
                    <input
                      type="text"
                      value={farmProfile.water}
                      onChange={(e) => setFarmProfile({ ...farmProfile, water: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-krushi-bg border border-gray-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-krushi-green"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-2xl bg-krushi-green text-white font-extrabold hover:bg-krushi-green-dark text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
                >
                  <CheckCircle size={14} />
                  <span>మ్యాప్ అప్డేట్ చేయండి / Save Parameters</span>
                </button>
              </form>
            </div>

          </div>
        </div>
      )}

      {/* --- ADD ACTIVITY TASK CALENDAR MODAL --- */}
      {showAddTask && (
        <div className="fixed inset-0 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs z-50 animate-[fade-in_0.2s_ease-out]">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-modal border border-gray-150 animate-[scale-up_0.2s_ease-out] relative">
            
            <button
              onClick={() => setShowAddTask(false)}
              className="absolute top-5 right-5 p-1 hover:bg-gray-100 rounded-full text-krushi-muted cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-base sm:text-lg font-black text-slate-800 text-telugu leading-snug">క్యాలెండర్ పనిని జోడించండి</h3>
                <span className="text-xs text-krushi-muted font-mono block">Schedule New Activity for June {selectedDate}</span>
              </div>

              <form onSubmit={handleAddTaskSubmit} className="space-y-4 text-xs font-semibold">
                
                <div className="space-y-1">
                  <label className="text-[10px] text-krushi-muted uppercase tracking-wider block">Activity Details (Telugu)</label>
                  <input
                    type="text"
                    placeholder="ఉదా: వరికి మొదటి దఫా ఎరువు"
                    value={newTaskTextTe}
                    onChange={(e) => setNewTaskTextTe(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-krushi-bg border border-gray-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-krushi-green"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-krushi-muted uppercase tracking-wider block">Activity Details (English)</label>
                  <input
                    type="text"
                    placeholder="e.g. Paddy top dressing"
                    value={newTaskTextEn}
                    onChange={(e) => setNewTaskTextEn(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-krushi-bg border border-gray-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-krushi-green"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-krushi-muted uppercase tracking-wider block">Activity Type Category</label>
                  <select
                    value={newTaskType}
                    onChange={(e) => setNewTaskType(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-krushi-bg border border-gray-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-krushi-green"
                  >
                    <option value="water">సాగు నీటి సరఫరా (Watering)</option>
                    <option value="fertilizer">ఎరువు దరఖాస్తు (Fertilizer)</option>
                    <option value="spray">మందు పిచికారీ (Chemical Spray)</option>
                    <option value="harvest">పంట కోత / ఇతర పనులు (Harvest/Other)</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-2xl bg-krushi-green text-white font-extrabold hover:bg-krushi-green-dark text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
                >
                  <Plus size={13} />
                  <span>జోడించండి / Add Activity</span>
                </button>
              </form>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
