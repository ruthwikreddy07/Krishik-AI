import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  Send,
  Mic,
  Image as ImageIcon,
  X,
  Volume2,
  Trash2,
  Calendar,
  AlertTriangle,
  Info,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Droplets,
  Wind,
  CloudSun,
  ShieldCheck,
  Check
} from 'lucide-react';
import { StatusChip } from '../components';

export default function AIChatbot() {
  const [lang, setLang] = useState('te'); // 'te' = Telugu, 'en' = English
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      te: 'నమస్కారం! నేను కృషి AI సహాయకుడిని. పంట తెగుళ్ళు, మార్కెట్ ధరలు, వాతావరణం లేదా వ్యవసాయ పథకాల గురించి నన్ను ఏదైనా అడగండి.',
      en: 'Namaskaram! I am your Krushi AI Assistant. Ask me anything about crop diseases, market prices, weather forecasts, or government schemes.',
      time: '11:20 AM',
      type: 'text'
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [attachedImage, setAttachedImage] = useState(null);
  const [isBotTyping, setIsBotTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const recordingTimerRef = useRef(null);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isBotTyping]);

  // Voice recording timer simulation
  useEffect(() => {
    if (isRecording) {
      setRecordingSeconds(0);
      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => {
          if (prev >= 6) {
            // Auto finish after 6 seconds
            handleStopRecording(true);
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
    } else {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    }
    return () => clearInterval(recordingTimerRef.current);
  }, [isRecording]);

  // Handle starter suggestions
  const suggestions = [
    {
      te: 'నా వరి ఆకులు పసుపు అవుతున్నాయి',
      en: 'My rice leaves are turning yellow'
    },
    {
      te: 'నేడు వాతావరణం ఎలా ఉంది?',
      en: 'How is the weather today?'
    },
    {
      te: 'పత్తి ధర ఎంత?',
      en: 'What is the price of cotton?'
    },
    {
      te: 'ఎరువు ఎప్పుడు వేయాలి?',
      en: 'When should I apply fertilizer?'
    },
    {
      te: 'ప్రభుత్వ పథకాలు ఏమున్నాయి?',
      en: 'What government schemes are available?'
    },
    {
      te: 'సాగు నీరు ఆపాలా?',
      en: 'Should I stop irrigation?'
    }
  ];

  const handleSuggestionClick = (sug) => {
    if (isBotTyping) return;
    const textToSend = lang === 'te' ? sug.te : sug.en;
    sendMessage(textToSend);
  };

  // Trigger File Input
  const triggerImageSelector = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAttachedImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeAttachedImage = () => {
    setAttachedImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Start/Cancel Voice Recording
  const handleStartRecording = () => {
    if (isBotTyping) return;
    setIsRecording(true);
  };

  const handleCancelRecording = () => {
    setIsRecording(false);
  };

  const handleStopRecording = (shouldSubmit = true) => {
    setIsRecording(false);
    if (shouldSubmit) {
      const simulatedVoiceTextTe = 'వరి పంట తెగులు నివారణ పద్ధతులు ఏమిటి?';
      const simulatedVoiceTextEn = 'What are the pest control methods for paddy crops?';
      sendMessage(lang === 'te' ? simulatedVoiceTextTe : simulatedVoiceTextEn);
    }
  };

  // Send message handler
  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!inputText.trim() && !attachedImage) return;
    sendMessage(inputText);
  };

  const sendMessage = (text) => {
    const userMsg = {
      id: Date.now(),
      sender: 'user',
      te: text || (attachedImage ? '📷 ఫోటో అప్లోడ్ చేయబడింది (Photo Uploaded)' : ''),
      en: text || (attachedImage ? '📷 Photo uploaded' : ''),
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      type: 'text',
      image: attachedImage
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setAttachedImage(null);
    setIsBotTyping(true);

    // Simulated Bot Responses
    setTimeout(() => {
      setIsBotTyping(false);
      const queryLower = userMsg.en.toLowerCase();
      let botResponse = {};

      // Match query words
      if (queryLower.includes('yellow') || queryLower.includes('పసుపు') || queryLower.includes('ఆకులు')) {
        botResponse = {
          id: Date.now() + 1,
          sender: 'bot',
          te: 'మీ వరి ఆకులు పసుపు రంగులోకి మారడం అనేది నత్రజని (Nitrogen) లోపం లేదా గోధుమ మొక్కపేను (BPH) తెగులు ప్రారంభ సూచిక కావచ్చు. తెగులు హెచ్చరిక నివేదిక క్రింద జతచేస్తున్నాను, గమనించగలరు.',
          en: 'Yellowing of rice leaves can indicate nitrogen deficiency or the early onset of Brown Plant Hopper (BPH) infestation. Here is a detailed disease analysis alert for your reference.',
          time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          type: 'disease',
          diseaseData: {
            nameEn: 'Brown Plant Hopper (BPH)',
            nameTe: 'గోధుమ మొక్కపేను',
            severity: 'SEVERE',
            accuracy: 95,
            descTe: 'పిలకల నుండి రసాన్ని పీల్చడం వల్ల ఆకులు పసుపు రంగులోకి మారి ఎండిపోతాయి.',
            descEn: 'Sap-sucking pest infestation causing yellowing of leaves and hopper burn patches.',
            recommendationTe: 'ఆరబెట్టడం మరియు బ్యూప్రోఫెజిన్ 25% ఎస్.సి. మందును స్ప్రే చేయండి.',
            recommendationEn: 'Drain the field and apply Buprofezin 25 SC directed at the base.'
          }
        };
      } else if (queryLower.includes('weather') || queryLower.includes('వాతావరణం') || queryLower.includes('వాన') || queryLower.includes('వర్షం')) {
        botResponse = {
          id: Date.now() + 1,
          sender: 'bot',
          te: 'ఈరోజు వరంగల్ మరియు పరిసర ప్రాంతాలలో వాతావరణ నివేదిక ఇలా ఉంది. 70% వర్షం పడే అవకాశం ఉంది కాబట్టి ఎరువులు చల్లడం వాయిదా వేయండి.',
          en: 'Here is the current weather forecast for Warangal district. There is a 70% chance of precipitation, so it is recommended to postpone fertilizer application.',
          time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          type: 'weather',
          weatherData: {
            temp: 28,
            humidity: 85,
            wind: 12,
            condition: 'rainy',
            advisoryTe: '🌧️ వర్షం సూచన ఉంది. సాగు నీటి సరఫరా మరియు పిచికారీ పనులను నిలిపివేయండి.',
            advisoryEn: 'Rain forecast active. Suspend irrigation activities and pesticide sprayings.'
          }
        };
      } else if (queryLower.includes('price') || queryLower.includes('ధర') || queryLower.includes('పత్తి') || queryLower.includes('రేటు')) {
        botResponse = {
          id: Date.now() + 1,
          sender: 'bot',
          te: 'ఈరోజు తెలంగాణలోని ప్రముఖ మార్కెట్ యార్డుల తాజా క్వింటాల్ ధరల వివరాలు క్రింద ఇవ్వబడ్డాయి. పత్తి ధర నిన్నటికంటే ₹120 పెరిగింది.',
          en: 'Here are today\'s market price trends across major Mandis in Telangana. Cotton prices have spiked by ₹120 per quintal compared to yesterday.',
          time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          type: 'prices',
          pricesData: [
            { cropTe: 'పత్తి (Cotton)', cropEn: 'Cotton (Kapas)', mandi: 'Warangal Mandi', price: 7450, trend: 'up' },
            { cropTe: 'వరి (Rice)', cropEn: 'Paddy Grade A', mandi: 'Khammam Mandi', price: 2280, trend: 'stable' },
            { cropTe: 'మొక్కజొన్న (Maize)', cropEn: 'Hybrid Maize', mandi: 'Suryapet Mandi', price: 2110, trend: 'down' }
          ]
        };
      } else if (queryLower.includes('scheme') || queryLower.includes('పథకాలు') || queryLower.includes('ప్రభుత్వ')) {
        botResponse = {
          id: Date.now() + 1,
          sender: 'bot',
          te: 'రైతు పెట్టుబడి సహాయం కొరకు తెలంగాణ ప్రభుత్వం అందిస్తున్న రైతు బంధు పథకం దరఖాస్తులు ప్రారంభమయ్యాయి. క్రింద లింక్ ద్వారా అప్లై చేసుకోగలరు.',
          en: 'Applications are now open for the Rythu Bandhu investment support scheme by the Government of Telangana. You can apply directly using the action button below.',
          time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          type: 'scheme',
          schemeData: {
            titleTe: 'రైతు బంధు పథకం',
            titleEn: 'Rythu Bandhu Scheme',
            benefitTe: 'ప్రతి ఎకరానికి సంవత్సరానికి ₹10,000 పెట్టుబడి సహాయం.',
            benefitEn: '₹10,000 financial support per acre annually.',
            statusTe: 'దరఖాస్తులు నడుస్తున్నాయి (Open)',
            statusEn: 'Applications active'
          }
        };
      } else if (queryLower.includes('irrigation') || queryLower.includes('నీరు') || queryLower.includes('ఆపాలా')) {
        botResponse = {
          id: Date.now() + 1,
          sender: 'bot',
          te: 'రాబోయే 24 గంటల్లో భారీ వర్షపాతం నమోదయ్యే అవకాశం ఉన్నందున, వరి మరియు పత్తి పంటలకు నీటి పారుదలని (Irrigation) నిలిపివేయడం శ్రేయస్కరం.',
          en: 'Due to expected heavy rainfall in the next 24 hours, it is highly advisable to turn off well/borewell water supply and stop irrigation to prevent flooding.',
          time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          type: 'text'
        };
      } else {
        botResponse = {
          id: Date.now() + 1,
          sender: 'bot',
          te: 'మీ ప్రశ్నకు ధన్యవాదాలు. వరి, పత్తి పంటల సాగు మరియు తెగుళ్ల నివారణ గురించి మరిన్ని తాజా వివరాలు కనుగొనడానికి క్రింది సూచనలను ఉపయోగించవచ్చు.',
          en: 'Thank you for writing. You can use the quick suggestion chips below to explore more specific guidelines regarding fertilizer doses, market prices, and pest control.',
          time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          type: 'text'
        };
      }

      setMessages((prev) => [...prev, botResponse]);
    }, 1200);
  };

  return (
    <div className="bg-krushi-bg min-h-[calc(100vh-4rem)] md:min-h-screen flex flex-col justify-between max-w-5xl mx-auto shadow-card border-x border-gray-200/50 bg-white relative overflow-hidden animate-[fade-in_0.3s_ease-out]">
      
      {/* 1. GREEN HEADER BAR */}
      <header className="bg-krushi-green text-white px-4 py-3 flex items-center justify-between sticky top-16 md:top-0 z-30 shadow-md">
        
        {/* Left: Avatar + Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center border border-white/20 shadow-inner shrink-0 relative">
            <svg className="w-6 h-6 text-white animate-pulse" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2C6.5 2 2 6.5 2 12c0 5.5 10 10 10 10s10-4.5 10-10C22 6.5 17.5 2 12 2z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-krushi-green animate-ping" />
          </div>
          <div>
            <h1 className="text-sm sm:text-base font-extrabold tracking-wide text-telugu leading-snug">
              కృషి AI సహాయకుడు
            </h1>
            <span className="block text-[9px] text-krushi-green-pale font-bold uppercase tracking-wider -mt-0.5">
              🟢 24/7 అందుబాటులో ఉంది (Online)
            </span>
          </div>
        </div>

        {/* Right: Language switch toggler */}
        <div className="flex items-center gap-1.5 bg-black/15 p-1 rounded-xl border border-white/10">
          <button
            onClick={() => setLang('te')}
            className={`px-3 py-1 rounded-lg text-[10px] font-black tracking-wide transition-all cursor-pointer ${
              lang === 'te' ? 'bg-white text-krushi-green shadow-xs' : 'text-krushi-green-pale hover:text-white'
            }`}
          >
            తెలుగు
          </button>
          <button
            onClick={() => setLang('en')}
            className={`px-3 py-1 rounded-lg text-[10px] font-black tracking-wide transition-all cursor-pointer ${
              lang === 'en' ? 'bg-white text-krushi-green shadow-xs' : 'text-krushi-green-pale hover:text-white'
            }`}
          >
            English
          </button>
        </div>
      </header>

      {/* 2. CHAT STREAM CONTAINER */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6 bg-krushi-bg/35 max-h-[calc(100vh-14rem)] min-h-[400px]">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-2.5 ${isUser ? 'justify-end' : 'justify-start'} animate-[slide-up_0.25s_cubic-bezier(0.22,1,0.36,1)]`}
            >
              {/* Bot Avatar beside message bubble */}
              {!isUser && (
                <div className="w-7 h-7 rounded-full bg-krushi-green-pale border border-krushi-green-light/10 text-krushi-green flex items-center justify-center shrink-0 shadow-xs mt-1">
                  <svg className="w-4.5 h-4.5 text-krushi-green" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2C6.5 2 2 6.5 2 12c0 5.5 10 10 10 10s10-4.5 10-10C22 6.5 17.5 2 12 2z" />
                  </svg>
                </div>
              )}

              <div className="max-w-[85%] sm:max-w-[70%] space-y-1">
                
                {/* Visual bubble rendering */}
                <div
                  className={`rounded-2xl p-3.5 shadow-xs relative ${
                    isUser
                      ? 'bg-krushi-green text-white rounded-tr-none'
                      : 'bg-white text-krushi-text border-l-4 border-l-krushi-green border-y border-r border-gray-150 rounded-tl-none'
                  }`}
                >
                  {/* User attached photo */}
                  {msg.image && (
                    <div className="mb-2.5 max-w-xs rounded-lg overflow-hidden border border-white/20 shadow-md">
                      <img src={msg.image} className="w-full h-auto object-cover max-h-48" alt="Crop attached upload" />
                    </div>
                  )}

                  {/* Text message content */}
                  <p className="text-telugu text-[13.5px] font-bold leading-relaxed whitespace-pre-line">
                    {lang === 'te' ? msg.te : msg.en}
                  </p>

                  {/* SPECIAL WIDGET 1: WEATHER CARD */}
                  {msg.type === 'weather' && msg.weatherData && (
                    <div className="mt-3.5 bg-krushi-bg p-3.5 rounded-2xl border border-gray-150 space-y-3 text-xs font-semibold text-krushi-text animate-[scale-up_0.2s_ease-out]">
                      <div className="flex items-center gap-3">
                        <span className="text-4xl animate-bounce">🌧️</span>
                        <div>
                          <span className="text-[9px] uppercase tracking-wider font-extrabold text-krushi-green">Live Outlook</span>
                          <h4 className="text-sm font-black text-slate-800">{msg.weatherData.temp}°C - Light Rain</h4>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 border-t border-gray-150 pt-2 text-[11px]">
                        <div className="flex items-center gap-1 text-krushi-muted"><Droplets size={12} /> Humidity: {msg.weatherData.humidity}%</div>
                        <div className="flex items-center gap-1 text-krushi-muted"><Wind size={12} /> Wind: {msg.weatherData.wind} km/h</div>
                      </div>
                      <div className="bg-krushi-amber-light text-krushi-amber-dark p-2.5 rounded-xl text-[11px] leading-snug border border-krushi-amber/15 font-bold">
                        {lang === 'te' ? msg.weatherData.advisoryTe : msg.weatherData.advisoryEn}
                      </div>
                    </div>
                  )}

                  {/* SPECIAL WIDGET 2: MARKET PRICES TABLE */}
                  {msg.type === 'prices' && msg.pricesData && (
                    <div className="mt-3.5 overflow-hidden border border-gray-150 rounded-2xl bg-white shadow-sm text-xs animate-[scale-up_0.2s_ease-out]">
                      <table className="w-full border-collapse text-left">
                        <thead>
                          <tr className="bg-krushi-bg text-krushi-muted font-bold text-[9px] uppercase tracking-wider border-b border-gray-150">
                            <th className="p-2.5">Crop Name</th>
                            <th className="p-2.5">Mandi Yard</th>
                            <th className="p-2.5 text-right">Price/Qntl</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 font-bold">
                          {msg.pricesData.map((row, idx) => (
                            <tr key={idx} className="hover:bg-slate-50 transition-colors">
                              <td className="p-2.5 text-slate-800 text-telugu">{lang === 'te' ? row.cropTe : row.cropEn}</td>
                              <td className="p-2.5 text-krushi-muted text-[10px]">{row.mandi}</td>
                              <td className="p-2.5 text-right font-mono text-krushi-green-dark">
                                ₹{row.price}
                                {row.trend === 'up' && <span className="text-[9px] text-green-600 ml-1">▲</span>}
                                {row.trend === 'down' && <span className="text-[9px] text-red-500 ml-1">▼</span>}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* SPECIAL WIDGET 3: DISEASE ALERT CARD */}
                  {msg.type === 'disease' && msg.diseaseData && (
                    <div className="mt-3.5 bg-red-50/80 border-2 border-red-200 p-4 rounded-2xl space-y-3 text-xs animate-[scale-up_0.2s_ease-out]">
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <span className="px-2 py-0.5 rounded bg-red-600 text-white font-extrabold text-[8px] uppercase tracking-wider block w-fit animate-pulse mb-1">
                            {msg.diseaseData.severity}
                          </span>
                          <h4 className="text-sm font-black text-slate-900 leading-tight">
                            {msg.diseaseData.nameEn}
                          </h4>
                          <h5 className="text-xs font-bold text-red-800 text-telugu">
                            ({msg.diseaseData.nameTe})
                          </h5>
                        </div>
                        <span className="text-3xl shrink-0">🐛</span>
                      </div>
                      
                      <p className="text-slate-800 text-[11px] font-semibold leading-relaxed border-t border-red-200/50 pt-2">
                        {lang === 'te' ? msg.diseaseData.descTe : msg.diseaseData.descEn}
                      </p>

                      <div className="bg-white border border-red-200 p-2.5 rounded-xl text-[10px] text-red-800 font-bold leading-normal">
                        🚨 {lang === 'te' ? msg.diseaseData.recommendationTe : msg.diseaseData.recommendationEn}
                      </div>
                    </div>
                  )}

                  {/* SPECIAL WIDGET 4: SCHEME INFO CARD */}
                  {msg.type === 'scheme' && msg.schemeData && (
                    <div className="mt-3.5 bg-amber-50/80 border border-krushi-amber/25 p-4 rounded-2xl space-y-3 text-xs animate-[scale-up_0.2s_ease-out]">
                      <div className="flex justify-between items-center">
                        <h4 className="text-sm font-black text-krushi-amber-dark text-telugu">
                          🏛️ {lang === 'te' ? msg.schemeData.titleTe : msg.schemeData.titleEn}
                        </h4>
                        <span className="px-2 py-0.5 rounded bg-amber-200 text-krushi-amber-dark font-extrabold text-[8px] uppercase tracking-wider">
                          {lang === 'te' ? msg.schemeData.statusTe : msg.schemeData.statusEn}
                        </span>
                      </div>
                      
                      <p className="text-slate-800 text-[11px] font-semibold">
                        {lang === 'te' ? msg.schemeData.benefitTe : msg.schemeData.benefitEn}
                      </p>

                      <button
                        onClick={() => alert('Redirecting to Telangana Scheme Portal for Krushi benefits...')}
                        className="w-full py-2.5 rounded-xl bg-krushi-amber text-white font-extrabold hover:bg-krushi-amber-dark transition-all duration-200 text-xs shadow-sm hover:scale-[1.02] active:scale-98 cursor-pointer flex items-center justify-center gap-1"
                      >
                        Apply Now <ChevronRight size={13} />
                      </button>
                    </div>
                  )}

                </div>

                {/* Timestamp */}
                <span className={`block text-[9px] text-krushi-muted font-bold ${isUser ? 'text-right pr-1' : 'pl-1'}`}>
                  {msg.time}
                </span>

              </div>
            </div>
          );
        })}

        {/* Bot typing loader dots */}
        {isBotTyping && (
          <div className="flex items-start gap-2.5 justify-start animate-pulse">
            <div className="w-7 h-7 rounded-full bg-krushi-green-pale border border-krushi-green-light/10 text-krushi-green flex items-center justify-center shrink-0">
              <svg className="w-4.5 h-4.5 text-krushi-green" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2C6.5 2 2 6.5 2 12c0 5.5 10 10 10 10s10-4.5 10-10C22 6.5 17.5 2 12 2z" />
              </svg>
            </div>
            <div className="bg-white border border-gray-150 rounded-2xl rounded-tl-none p-3.5 flex items-center gap-1.5">
              <span className="w-2 h-2 bg-krushi-green rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
              <span className="w-2 h-2 bg-krushi-green rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
              <span className="w-2 h-2 bg-krushi-green rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
            </div>
          </div>
        )}

        {/* Empty state Starter suggestions */}
        {messages.length === 1 && !isBotTyping && (
          <div className="py-8 space-y-4 max-w-md mx-auto animate-[fade-in_0.4s_ease-out]">
            <span className="text-[10px] text-krushi-muted font-black uppercase tracking-wider block text-center flex items-center justify-center gap-1.5">
              <MessageSquare size={12} className="text-krushi-green" />
              వ్యవసాయ సందేహాలు (Starter suggestions)
            </span>
            
            <div className="grid grid-cols-2 gap-2.5">
              {suggestions.map((sug, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSuggestionClick(sug)}
                  className="p-3 bg-white hover:bg-slate-50 border border-gray-200 rounded-2xl text-left text-xs font-bold text-slate-800 shadow-sm active:scale-98 transition-all hover:border-krushi-green hover:text-krushi-green-dark cursor-pointer text-telugu leading-snug"
                >
                  {lang === 'te' ? sug.te : sug.en}
                </button>
              ))}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 3. INPUT BAR (BOTTOM, STICKY) */}
      <footer className="border-t border-gray-200/80 bg-white p-3.5 z-30">
        
        {/* Hidden inputs */}
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleImageChange}
          className="sr-only"
        />

        {/* Image Attachment Preview Ribbon */}
        {attachedImage && (
          <div className="mb-3 p-2.5 bg-krushi-bg rounded-2xl border border-gray-150 flex items-center justify-between gap-3 animate-[slide-up_0.15s_ease-out]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg overflow-hidden border border-gray-200 bg-slate-900 shrink-0">
                <img src={attachedImage} className="w-full h-full object-cover" alt="Thumb to upload" />
              </div>
              <span className="text-[10px] font-bold text-krushi-muted">
                📷 ఫోటో జతచేయబడింది (Photo ready to send)
              </span>
            </div>
            <button
              onClick={removeAttachedImage}
              className="p-1 rounded-full hover:bg-gray-100 text-krushi-danger cursor-pointer"
            >
              <X size={15} />
            </button>
          </div>
        )}

        {/* VOICE RECORDING MODE PANEL */}
        {isRecording ? (
          <div className="flex items-center justify-between bg-red-50/80 border border-red-200 px-4 py-3 rounded-2xl animate-[slide-up_0.15s_ease-out]">
            <div className="flex items-center gap-3">
              {/* Pulsing red mic ring */}
              <div className="relative flex h-3 w-3 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
              </div>
              
              <span className="text-xs text-red-700 font-extrabold uppercase tracking-widest animate-pulse font-telugu">
                వింటోంది... <span className="font-mono">({recordingSeconds}s)</span>
              </span>

              {/* Simulated Waveform visualizations */}
              <div className="flex items-end gap-0.5 h-4 px-2">
                {[...Array(6)].map((_, i) => (
                  <span
                    key={i}
                    className="w-0.75 bg-red-500 rounded-full animate-wave-bar"
                    style={{
                      height: `${[35, 75, 45, 85, 50, 60][i]}%`,
                      animationDelay: `${i * 0.1}s`,
                      animationDuration: '0.6s'
                    }}
                  />
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCancelRecording}
                className="px-3 py-1.5 text-[10px] font-bold text-krushi-muted hover:text-krushi-danger hover:bg-red-100/30 rounded-xl transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleStopRecording(true)}
                className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-[10px] font-extrabold shadow-sm transition-all cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          /* REGULAR CHAT INPUT FORM */
          <form onSubmit={handleFormSubmit} className="flex items-center gap-2">
            
            {/* Image attachment icon trigger */}
            <button
              type="button"
              onClick={triggerImageSelector}
              className="p-3 bg-krushi-bg hover:bg-gray-100 rounded-2xl text-krushi-muted hover:text-krushi-green transition-all cursor-pointer shrink-0"
              title="Attach photo"
            >
              <ImageIcon size={18} />
            </button>

            {/* Input fields */}
            <input
              type="text"
              placeholder={lang === 'te' ? 'వ్యవసాయ సందేహం అడగండి...' : 'Ask your farming question...'}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 px-4 py-3 bg-krushi-bg rounded-2xl text-xs outline-none border border-gray-200 focus:border-krushi-green/40 text-slate-800 placeholder-krushi-muted font-medium transition-all"
            />

            {/* Voice microphone button trigger */}
            <button
              type="button"
              onClick={handleStartRecording}
              className="p-3 bg-krushi-bg hover:bg-gray-100 rounded-2xl text-krushi-muted hover:text-krushi-danger transition-all cursor-pointer shrink-0"
              title="Voice query"
            >
              <Mic size={18} />
            </button>

            {/* Send action trigger button */}
            <button
              type="submit"
              disabled={(!inputText.trim() && !attachedImage) || isBotTyping}
              className="p-3 bg-krushi-green disabled:opacity-50 text-white hover:bg-krushi-green-dark rounded-2xl transition-all duration-200 hover:scale-105 active:scale-95 shadow-md shadow-krushi-green/10 shrink-0 cursor-pointer"
            >
              <Send size={16} />
            </button>

          </form>
        )}

      </footer>

    </div>
  );
}
