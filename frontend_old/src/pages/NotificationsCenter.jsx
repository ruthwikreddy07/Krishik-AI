import React, { useState, useMemo } from 'react';
import {
  Bell,
  CheckCheck,
  X,
  CloudSun,
  Bug,
  TrendingUp,
  Calendar,
  HelpCircle,
  Settings,
  ShieldCheck,
  MessageSquare,
  Smartphone,
  CheckCircle,
  Eye,
  FileText
} from 'lucide-react';
import { ToggleSwitch, StatusChip } from '../components';

export default function NotificationsCenter() {
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'weather' | 'pest' | 'market' | 'reminder'
  
  // Dynamic notifications list state
  const [notifications, setNotifications] = useState([
    // Today
    {
      id: 1,
      timeframe: 'today',
      type: 'pest',
      unread: true,
      titleTe: 'మీ పత్తి పంటలో బూడిద తెగులు వ్యాప్తి ప్రమాదం',
      titleEn: 'Pest Warning: Powdery Mildew danger in Cotton plot',
      descTe: 'వాతావరణ మార్పుల వల్ల మీ ప్రాంతంలో పత్తికి బూడిద తెగులు ఆశించే అవకాశం ఉంది. వెంటనే తగిన చర్య తీసుకోండి.',
      descEn: 'Due to temperature drops, high risk of Powdery Mildew. Monitor leaves carefully.',
      time: '2 గంటల క్రితం (2h ago)',
      actionTe: 'సమీక్షించండి (Scan Now)',
      actionLink: 'scanner'
    },
    {
      id: 2,
      timeframe: 'today',
      type: 'weather',
      unread: true,
      titleTe: 'రేపు సాయంత్రం భారీ వర్షం పడే అవకాశం (70%)',
      titleEn: 'Rain Warning: 70% Precipitation tomorrow evening',
      descTe: 'రేపు వరంగల్ జిల్లా పరిధిలో వర్ష సూచన ఉంది. ఎరువుల దరఖాస్తును ఈరోజే ముగించండి లేదా వాయిదా వేయండి.',
      descEn: 'Heavy downpour expected tomorrow. Complete top dressings today or delay.',
      time: '5 గంటల క్రితం (5h ago)',
      actionTe: 'వాతావరణం చూడండి (Weather)',
      actionLink: 'weather'
    },
    // Yesterday
    {
      id: 3,
      timeframe: 'yesterday',
      type: 'market',
      unread: false,
      titleTe: 'వరి ధర క్వింటాలుకు ₹180 పెరిగింది',
      titleEn: 'Market Alert: Paddy prices risen ₹180/qtl',
      descTe: 'వరంగల్ మార్కెట్ యార్డులో వరి గ్రేడ్-A ధర విపరీతంగా పెరిగింది. పంటను అమ్ముకోవడానికి ఇది అనుకూల సమయం.',
      descEn: 'Grade A paddy prices reached peak today at Warangal mandi. Good time to sell.',
      time: 'ನಿನ್ನೆ (Yesterday)',
      actionTe: 'ధరలు సరిపోల్చండి (See Prices)',
      actionLink: 'market'
    },
    {
      id: 4,
      timeframe: 'yesterday',
      type: 'reminder',
      unread: false,
      titleTe: 'ఈ రోజు వరి పంటకు మొదటి యూరియా మోతాదు వేయాలి',
      titleEn: 'Crop Reminder: Apply Urea fertilizer to Paddy field',
      descTe: 'వరి నాటిన 25వ రోజు పూర్తి అయినందున, మొదటి విడతగా ఎకరాకు 30 కిలోల యూరియా పిచికారీ అవసరం.',
      descEn: 'Paddy is 25 days old. First top dressing of 30kg Urea per acre due.',
      time: 'ನಿನ್ನೆ (Yesterday)',
      actionTe: 'పూర్తి చేసాను (Mark Done)',
      actionType: 'done'
    },
    // Older
    {
      id: 5,
      timeframe: 'older',
      type: 'scheme',
      unread: false,
      titleTe: 'రైతు బంధు దరఖాస్తుల నమోదుకు చివరి తేదీ పొడిగింపు',
      titleEn: 'Scheme Alert: Rythu Bandhu deadline extended',
      descTe: 'రైతు బంధు సహాయం కొరకు బ్యాంక్ వివరాల సమర్పణ గడువును మరో 5 రోజులు పొడిగించారు. వెంటనే అప్లై చేసుకోండి.',
      descEn: 'Rythu Bandhu bank details submission extended. 5 days remaining to apply.',
      time: '3 రోజుల క్రితం (3d ago)',
      actionTe: 'అప్లై చేసుకోండి (Apply Now)',
      actionLink: 'schemes'
    }
  ]);

  // Preferences States
  const [prefPest, setPrefPest] = useState(true);
  const [prefWeather, setPrefWeather] = useState(true);
  const [prefPrices, setPrefPrices] = useState(true);
  const [prefReminders, setPrefReminders] = useState(true);
  const [prefWhatsApp, setPrefWhatsApp] = useState(true);
  const [prefSMS, setPrefSMS] = useState(false);

  // Mark all as read
  const handleMarkAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, unread: false })));
  };

  // Mark single as read
  const handleMarkSingleRead = (id) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, unread: false } : n));
  };

  // Dismiss single notification
  const handleDismiss = (id, e) => {
    e.stopPropagation();
    setNotifications(notifications.filter(n => n.id !== id));
  };

  // Filtered Notifications list
  const filteredNotifications = useMemo(() => {
    return notifications.filter((n) => {
      if (activeFilter === 'all') return true;
      return n.type === activeFilter;
    });
  }, [notifications, activeFilter]);

  // Group notifications by timeframe
  const groupedNotifications = useMemo(() => {
    const groups = { today: [], yesterday: [], older: [] };
    filteredNotifications.forEach((n) => {
      if (groups[n.timeframe]) {
        groups[n.timeframe].push(n);
      }
    });
    return groups;
  }, [filteredNotifications]);

  const totalUnreadCount = notifications.filter(n => n.unread).length;

  return (
    <div className="bg-krushi-bg min-h-screen py-8 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-8 animate-[fade-in_0.3s_ease-out] pb-24 md:pb-12 text-krushi-text">
      
      {/* 1. Page Header */}
      <div className="border-b border-gray-200 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-extrabold bg-green-50 text-krushi-green border border-krushi-green-light/10">
            🔔 Notification Alerts Feed
          </span>
          <h1 className="heading-farm text-2xl sm:text-3xl font-extrabold text-slate-800 mt-2">
            అప్రమత్తాలు <span className="text-krushi-green">/ Notifications Center</span>
          </h1>
          <p className="text-xs text-krushi-muted mt-1 font-telugu">
            మీ పంటల సంరక్షణకు అవసరమైన తెగులు హెచ్చరికలు, మార్కెట్ ధర మార్పులు మరియు సేద్య పనుల రిమైండర్లు.
          </p>
        </div>

        {totalUnreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="px-3.5 py-2 bg-krushi-bg hover:bg-krushi-green-pale border border-gray-200 hover:border-krushi-green text-slate-700 hover:text-krushi-green-dark text-xs font-black rounded-2xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
          >
            <CheckCheck size={14} />
            <span>అన్నీ చదివినట్టు గుర్తించు (Mark all read)</span>
          </button>
        )}
      </div>

      {/* 2. FILTER CHIPS */}
      <div className="flex gap-1.5 overflow-x-auto scrollbar-none pb-1">
        {[
          { key: 'all', te: 'అన్నీ (All)' },
          { key: 'weather', te: 'వాతావరణం (Weather)' },
          { key: 'pest', te: 'తెగులు హెచ్చరిక (Pest)' },
          { key: 'market', te: 'మార్కెట్ (Market)' },
          { key: 'reminder', te: 'రిమైండర్ (Reminder)' }
        ].map((chip) => (
          <button
            key={chip.key}
            onClick={() => setActiveFilter(chip.key)}
            className={`px-3.5 py-1.5 rounded-xl text-[10px] font-black cursor-pointer transition-all shrink-0 ${
              activeFilter === chip.key
                ? 'bg-krushi-green text-white shadow-xs'
                : 'text-krushi-muted hover:text-slate-800 bg-white border border-gray-200'
            }`}
          >
            {chip.te}
          </button>
        ))}
      </div>

      {/* 3. TIMELINE FEEDS */}
      <div className="space-y-6">
        {notifications.length > 0 ? (
          ['today', 'yesterday', 'older'].map((timeKey) => {
            const list = groupedNotifications[timeKey];
            if (!list || list.length === 0) return null;

            return (
              <div key={timeKey} className="space-y-3">
                <span className="text-[10px] uppercase tracking-widest font-extrabold text-krushi-amber block pl-1.5">
                  {timeKey === 'today' ? 'నేడు / Today' : timeKey === 'yesterday' ? 'నిన్న / Yesterday' : 'గతంలో / Older'}
                </span>

                <div className="space-y-3 relative">
                  {list.map((n) => {
                    const isUnread = n.unread;
                    return (
                      <div
                        key={n.id}
                        onClick={() => handleMarkSingleRead(n.id)}
                        className={`p-4 bg-white border border-gray-250/60 rounded-3xl flex items-start gap-4 hover:border-krushi-green/60 shadow-xs relative overflow-hidden transition-all duration-200 animate-[scale-up_0.15s_ease-out] ${
                          isUnread
                            ? 'border-l-4 border-l-krushi-green bg-emerald-50/20'
                            : 'border-l-4 border-l-gray-300'
                        }`}
                      >
                        {/* Dismiss action */}
                        <button
                          onClick={(e) => handleDismiss(n.id, e)}
                          className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-red-50 text-krushi-muted hover:text-red-500 cursor-pointer transition-all"
                          title="Dismiss alert"
                        >
                          <X size={12} />
                        </button>

                        {/* Icon by type */}
                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-inner select-none font-bold text-base ${
                          n.type === 'pest'
                            ? 'bg-red-50 text-red-600'
                            : n.type === 'weather'
                            ? 'bg-blue-50 text-blue-600'
                            : n.type === 'market'
                            ? 'bg-amber-50 text-amber-600'
                            : n.type === 'reminder'
                            ? 'bg-green-50 text-green-600'
                            : 'bg-purple-50 text-purple-600'
                        }`}>
                          {n.type === 'pest' && <Bug size={16} />}
                          {n.type === 'weather' && <CloudSun size={16} />}
                          {n.type === 'market' && <TrendingUp size={16} />}
                          {n.type === 'reminder' && <Calendar size={16} />}
                          {n.type === 'scheme' && <ShieldCheck size={16} />}
                        </div>

                        <div className="space-y-2 flex-1 pr-6">
                          <div>
                            <h4 className="text-xs sm:text-sm font-black text-slate-900 text-telugu leading-snug">
                              {n.titleTe}
                            </h4>
                            <span className="block text-[9px] text-krushi-muted font-bold -mt-0.5">{n.titleEn}</span>
                          </div>

                          <p className="text-slate-800 text-[11.5px] font-semibold leading-relaxed text-telugu line-clamp-2">
                            {n.descTe}
                          </p>

                          {/* Quick action buttons */}
                          {n.actionTe && (
                            <div className="pt-2 flex items-center justify-between gap-4">
                              <button
                                onClick={() => {
                                  if (n.actionType === 'done') {
                                    alert('Activity marked as completed on your Farm Calendar!');
                                    setNotifications(notifications.filter(item => item.id !== n.id));
                                  } else {
                                    alert(`Routing to page: ${n.actionLink}...`);
                                  }
                                }}
                                className={`px-4 py-2 rounded-xl text-[10px] font-extrabold shadow-sm active:scale-95 transition-all cursor-pointer ${
                                  n.actionType === 'done'
                                    ? 'bg-krushi-green text-white hover:bg-krushi-green-dark'
                                    : 'bg-krushi-amber text-white hover:bg-krushi-amber-dark shadow-md shadow-krushi-amber/10'
                                }`}
                              >
                                {n.actionTe}
                              </button>

                              <span className="text-[8px] text-krushi-muted font-bold font-mono uppercase tracking-wider block text-right">
                                {n.time}
                              </span>
                            </div>
                          )}

                          {!n.actionTe && (
                            <span className="text-[8px] text-krushi-muted font-bold font-mono uppercase tracking-wider block text-right mt-1">
                              {n.time}
                            </span>
                          )}

                        </div>

                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        ) : (
          /* Empty state illustrated message */
          <div className="py-16 bg-white rounded-3xl border border-gray-150 text-center space-y-3 shadow-inner">
            <span className="text-5xl block select-none animate-bounce">🌾</span>
            <h4 className="text-sm font-black text-slate-800 text-telugu leading-snug">
              అన్నీ బాగున్నాయి! కొత్త అప్రమత్తాలు లేవు
            </h4>
            <p className="text-xs text-krushi-muted font-bold">All caught up! No active warnings at this moment.</p>
          </div>
        )}
      </div>

      {/* 4. NOTIFICATION DELIVERY PREFERENCES */}
      <section className="bg-white rounded-3xl p-6 border border-gray-150 shadow-card space-y-6">
        
        <div className="border-b border-gray-100 pb-3 flex items-center gap-2">
          <Settings size={18} className="text-krushi-green" />
          <div>
            <h3 className="text-sm sm:text-base font-black text-slate-800">
              అప్రమత్తాల కాన్ఫిగరేషన్ <span className="text-xs font-semibold text-krushi-muted block mt-0.5">/ Notification Delivery Preferences</span>
            </h3>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs font-semibold text-slate-800">
          
          {/* Notification Categories toggles */}
          <div className="space-y-4">
            <span className="text-[9px] uppercase tracking-wider font-extrabold text-krushi-muted block">Alert Categories</span>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center bg-krushi-bg p-3.5 rounded-2xl border border-gray-150/40">
                <div>
                  <span className="block text-slate-800">Pest & Disease Warnings</span>
                  <span className="text-[9px] text-krushi-muted font-bold block -mt-0.5">తెగులు హెచ్చరికలు</span>
                </div>
                <ToggleSwitch active={prefPest} onChange={() => setPrefPest(!prefPest)} />
              </div>

              <div className="flex justify-between items-center bg-krushi-bg p-3.5 rounded-2xl border border-gray-150/40">
                <div>
                  <span className="block text-slate-800">Weather Forecasts</span>
                  <span className="text-[9px] text-krushi-muted font-bold block -mt-0.5">వాతావరణ నివేదికలు</span>
                </div>
                <ToggleSwitch active={prefWeather} onChange={() => setPrefWeather(!prefWeather)} />
              </div>

              <div className="flex justify-between items-center bg-krushi-bg p-3.5 rounded-2xl border border-gray-150/40">
                <div>
                  <span className="block text-slate-800">Mandi Market Prices</span>
                  <span className="text-[9px] text-krushi-muted font-bold block -mt-0.5">లైవ్ మార్కెట్ ధరలు</span>
                </div>
                <ToggleSwitch active={prefPrices} onChange={() => setPrefPrices(!prefPrices)} />
              </div>

              <div className="flex justify-between items-center bg-krushi-bg p-3.5 rounded-2xl border border-gray-150/40">
                <div>
                  <span className="block text-slate-800">Calendar Task Reminders</span>
                  <span className="text-[9px] text-krushi-muted font-bold block -mt-0.5">వ్యవసాయ క్యాలెండర్ పనులు</span>
                </div>
                <ToggleSwitch active={prefReminders} onChange={() => setPrefReminders(!prefReminders)} />
              </div>
            </div>
          </div>

          {/* Delivery Channels toggles */}
          <div className="space-y-4">
            <span className="text-[9px] uppercase tracking-wider font-extrabold text-krushi-muted block">Alert Channels</span>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center bg-krushi-bg p-3.5 rounded-2xl border border-gray-150/40">
                <div className="flex gap-2.5 items-center">
                  <span className="p-2 bg-krushi-green-pale text-krushi-green rounded-xl shrink-0"><MessageSquare size={16} /></span>
                  <div>
                    <span className="block text-slate-800">WhatsApp Alert Delivery</span>
                    <span className="text-[9px] text-krushi-muted font-bold block -mt-0.5">వాట్సాప్ సందేశాలు</span>
                  </div>
                </div>
                <ToggleSwitch active={prefWhatsApp} onChange={() => setPrefWhatsApp(!prefWhatsApp)} />
              </div>

              <div className="flex justify-between items-center bg-krushi-bg p-3.5 rounded-2xl border border-gray-150/40">
                <div className="flex gap-2.5 items-center">
                  <span className="p-2 bg-blue-50 text-blue-600 rounded-xl shrink-0"><Smartphone size={16} /></span>
                  <div>
                    <span className="block text-slate-800">SMS Backup Delivery</span>
                    <span className="text-[9px] text-krushi-muted font-bold block -mt-0.5">మొబైల్ టెక్స్ట్ మెసేజ్</span>
                  </div>
                </div>
                <ToggleSwitch active={prefSMS} onChange={() => setPrefSMS(!prefSMS)} />
              </div>
            </div>

            <div className="bg-krushi-green-pale/40 border border-krushi-green-light/10 p-3.5 rounded-2xl flex items-start gap-2 text-xs font-semibold">
              <Info size={14} className="text-krushi-green shrink-0 mt-0.5" />
              <span className="text-krushi-green-dark">ఛానెల్ మార్పుల సెట్టింగులు నేరుగా మీ రిజిస్టర్డ్ మొబైల్ నంబర్ కి మ్యాప్ చేయబడతాయి.</span>
            </div>
          </div>

        </div>

      </section>

    </div>
  );
}
