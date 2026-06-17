import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Bell,
  Share2,
  MapPin,
  Calendar,
  AlertCircle,
  HelpCircle,
  ArrowUpDown,
  Compass,
  CheckCircle,
  ArrowUpRight,
  Info,
  ChevronRight,
  Sparkles,
  Search,
  MessageSquare
} from 'lucide-react';
import { PriceTag } from '../components';

export default function MarketIntelligence() {
  const [activeCropTab, setActiveCropTab] = useState('my'); // 'my' | 'all'
  const [selectedCrop, setSelectedCrop] = useState('rice');
  const [timeRange, setTimeRange] = useState('1M'); // '7D' | '1M' | '3M' | '6M'
  const [sortField, setSortField] = useState('price'); // 'price' | 'distance'
  const [sortAsc, setSortAsc] = useState(false);
  
  // Alert setup states
  const [alertCrop, setAlertCrop] = useState('rice');
  const [targetPrice, setTargetPrice] = useState('2300');
  const [alertType, setAlertType] = useState('whatsapp'); // 'whatsapp' | 'sms'
  const [alertSuccess, setAlertSuccess] = useState(false);

  // SVG Chart hover states
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  // Detailed crop database
  const cropData = {
    rice: {
      key: 'rice',
      nameTe: 'వరి',
      nameEn: 'Paddy (Grade A)',
      price: 2180,
      change: '+45',
      percent: '+2.1%',
      isGain: true,
      bestMandi: 'వరంగల్ మండి (Warangal)',
      myCrop: true,
      sparkline: [2130, 2140, 2155, 2145, 2160, 2175, 2180],
      history: {
        '7D': [2145, 2150, 2165, 2160, 2170, 2175, 2180],
        '1M': [2080, 2100, 2110, 2095, 2120, 2135, 2150, 2145, 2165, 2180],
        '3M': [2010, 2030, 2050, 2040, 2070, 2090, 2085, 2110, 2130, 2160, 2180],
        '6M': [1950, 1980, 2020, 2000, 2040, 2060, 2080, 2100, 2140, 2160, 2180]
      },
      dates: {
        '7D': ['11 Jun', '12 Jun', '13 Jun', '14 Jun', '15 Jun', '16 Jun', '17 Jun'],
        '1M': ['18 May', '21 May', '24 May', '27 May', '30 May', '02 Jun', '05 Jun', '08 Jun', '11 Jun', '17 Jun'],
        '3M': ['17 Mar', '26 Mar', '04 Apr', '13 Apr', '22 Apr', '01 May', '10 May', '19 May', '28 May', '06 Jun', '17 Jun'],
        '6M': ['17 Dec', '02 Jan', '18 Jan', '03 Feb', '19 Feb', '06 Mar', '22 Mar', '07 Apr', '23 Apr', '09 May', '17 Jun']
      }
    },
    cotton: {
      key: 'cotton',
      nameTe: 'పత్తి',
      nameEn: 'Cotton (Kapas)',
      price: 7420,
      change: '-120',
      percent: '-1.6%',
      isGain: false,
      bestMandi: 'ఖమ్మం మండి (Khammam)',
      myCrop: true,
      sparkline: [7600, 7550, 7520, 7490, 7460, 7440, 7420],
      history: {
        '7D': [7560, 7530, 7510, 7480, 7450, 7430, 7420],
        '1M': [7750, 7700, 7640, 7600, 7550, 7510, 7480, 7460, 7430, 7420],
        '3M': [7900, 7850, 7780, 7720, 7650, 7590, 7530, 7490, 7460, 7440, 7420],
        '6M': [8100, 8020, 7950, 7880, 7800, 7720, 7650, 7580, 7500, 7450, 7420]
      },
      dates: {
        '7D': ['11 Jun', '12 Jun', '13 Jun', '14 Jun', '15 Jun', '16 Jun', '17 Jun'],
        '1M': ['18 May', '21 May', '24 May', '27 May', '30 May', '02 Jun', '05 Jun', '08 Jun', '11 Jun', '17 Jun'],
        '3M': ['17 Mar', '26 Mar', '04 Apr', '13 Apr', '22 Apr', '01 May', '10 May', '19 May', '28 May', '06 Jun', '17 Jun'],
        '6M': ['17 Dec', '02 Jan', '18 Jan', '03 Feb', '19 Feb', '06 Mar', '22 Mar', '07 Apr', '23 Apr', '09 May', '17 Jun']
      }
    },
    maize: {
      key: 'maize',
      nameTe: 'మొక్కజొన్న',
      nameEn: 'Hybrid Maize',
      price: 2110,
      change: '+35',
      percent: '+1.7%',
      isGain: true,
      bestMandi: 'సూర్యాపేట మండి (Suryapet)',
      myCrop: false,
      sparkline: [2070, 2085, 2080, 2095, 2100, 2090, 2110],
      history: {
        '7D': [2075, 2080, 2090, 2095, 2100, 2095, 2110],
        '1M': [2030, 2045, 2060, 2055, 2070, 2080, 2090, 2085, 2100, 2110],
        '3M': [1980, 1995, 2010, 2005, 2030, 2050, 2045, 2070, 2085, 2100, 2110],
        '6M': [1920, 1940, 1970, 1960, 1990, 2010, 2030, 2050, 2080, 2095, 2110]
      },
      dates: {
        '7D': ['11 Jun', '12 Jun', '13 Jun', '14 Jun', '15 Jun', '16 Jun', '17 Jun'],
        '1M': ['18 May', '21 May', '24 May', '27 May', '30 May', '02 Jun', '05 Jun', '08 Jun', '11 Jun', '17 Jun'],
        '3M': ['17 Mar', '26 Mar', '04 Apr', '13 Apr', '22 Apr', '01 May', '10 May', '19 May', '28 May', '06 Jun', '17 Jun'],
        '6M': ['17 Dec', '02 Jan', '18 Jan', '03 Feb', '19 Feb', '06 Mar', '22 Mar', '07 Apr', '23 Apr', '09 May', '17 Jun']
      }
    },
    soya: {
      key: 'soya',
      nameTe: 'సోయాబీన్',
      nameEn: 'Soybean',
      price: 4350,
      change: '+80',
      percent: '+1.9%',
      isGain: true,
      bestMandi: 'నిజామాబాద్ మండి (Nizamabad)',
      myCrop: false,
      sparkline: [4220, 4240, 4270, 4285, 4310, 4330, 4350],
      history: {
        '7D': [4250, 4270, 4290, 4300, 4320, 4340, 4350],
        '1M': [4150, 4180, 4200, 4220, 4250, 4280, 4300, 4310, 4335, 4350],
        '3M': [4020, 4060, 4100, 4130, 4170, 4210, 4240, 4270, 4300, 4325, 4350],
        '6M': [3900, 3950, 4010, 4050, 4100, 4150, 4200, 4240, 4280, 4320, 4350]
      },
      dates: {
        '7D': ['11 Jun', '12 Jun', '13 Jun', '14 Jun', '15 Jun', '16 Jun', '17 Jun'],
        '1M': ['18 May', '21 May', '24 May', '27 May', '30 May', '02 Jun', '05 Jun', '08 Jun', '11 Jun', '17 Jun'],
        '3M': ['17 Mar', '26 Mar', '04 Apr', '13 Apr', '22 Apr', '01 May', '10 May', '19 May', '28 May', '06 Jun', '17 Jun'],
        '6M': ['17 Dec', '02 Jan', '18 Jan', '03 Feb', '19 Feb', '06 Mar', '22 Mar', '07 Apr', '23 Apr', '09 May', '17 Jun']
      }
    },
    chilli: {
      key: 'chilli',
      nameTe: 'మిర్చి',
      nameEn: 'Guntur Dry Chilli',
      price: 18200,
      change: '-450',
      percent: '-2.4%',
      isGain: false,
      bestMandi: 'గుంటూరు మిర్చి యార్డ్ (Guntur)',
      myCrop: false,
      sparkline: [18900, 18750, 18600, 18450, 18400, 18300, 18200],
      history: {
        '7D': [18700, 18600, 18500, 18400, 18350, 18250, 18200],
        '1M': [19500, 19300, 19100, 18900, 18700, 18600, 18450, 18380, 18260, 18200],
        '3M': [20500, 20200, 19900, 19600, 19300, 19000, 18750, 18550, 18400, 18300, 18200],
        '6M': [21800, 21400, 21000, 20600, 20100, 19700, 19300, 18900, 18600, 18350, 18200]
      },
      dates: {
        '7D': ['11 Jun', '12 Jun', '13 Jun', '14 Jun', '15 Jun', '16 Jun', '17 Jun'],
        '1M': ['18 May', '21 May', '24 May', '27 May', '30 May', '02 Jun', '05 Jun', '08 Jun', '11 Jun', '17 Jun'],
        '3M': ['17 Mar', '26 Mar', '04 Apr', '13 Apr', '22 Apr', '01 May', '10 May', '19 May', '28 May', '06 Jun', '17 Jun'],
        '6M': ['17 Dec', '02 Jan', '18 Jan', '03 Feb', '19 Feb', '06 Mar', '22 Mar', '07 Apr', '23 Apr', '09 May', '17 Jun']
      }
    },
    turmeric: {
      key: 'turmeric',
      nameTe: 'పసుపు',
      nameEn: 'Turmeric (Finger)',
      price: 12400,
      change: '+620',
      percent: '+5.3%',
      isGain: true,
      bestMandi: 'నిజామాబాద్ యార్డ్ (Nizamabad)',
      myCrop: false,
      sparkline: [11500, 11700, 11950, 12100, 12200, 12350, 12400],
      history: {
        '7D': [11600, 11750, 11900, 12100, 12250, 12380, 12400],
        '1M': [10800, 11050, 11200, 11450, 11600, 11800, 12050, 12180, 12300, 12400],
        '3M': [9900, 10150, 10400, 10700, 11000, 11250, 11500, 11800, 12055, 12250, 12400],
        '6M': [8900, 9200, 9550, 9900, 10250, 10600, 11000, 11400, 11750, 12100, 12400]
      },
      dates: {
        '7D': ['11 Jun', '12 Jun', '13 Jun', '14 Jun', '15 Jun', '16 Jun', '17 Jun'],
        '1M': ['18 May', '21 May', '24 May', '27 May', '30 May', '02 Jun', '05 Jun', '08 Jun', '11 Jun', '17 Jun'],
        '3M': ['17 Mar', '26 Mar', '04 Apr', '13 Apr', '22 Apr', '01 May', '10 May', '19 May', '28 May', '06 Jun', '17 Jun'],
        '6M': ['17 Dec', '02 Jan', '18 Jan', '03 Feb', '19 Feb', '06 Mar', '22 Mar', '07 Apr', '23 Apr', '09 May', '17 Jun']
      }
    }
  };

  // Mandi list details
  const initialMandis = [
    { name: 'వరంగల్ కాటన్ మార్కెట్', nameEn: 'Warangal Mandi', districtTe: 'వరంగల్', districtEn: 'Warangal', price: 2180, distance: 12, rating: 4.8, best: true },
    { name: 'ఖమ్మం అగ్రికల్చర్ యార్డ్', nameEn: 'Khammam Mandi', districtTe: 'ఖమ్మం', districtEn: 'Khammam', price: 2160, distance: 48, rating: 4.5, best: false },
    { name: 'సూర్యాపేట గంజ్', nameEn: 'Suryapet Mandi', districtTe: 'సూర్యాపేట', districtEn: 'Suryapet', price: 2145, distance: 34, rating: 4.2, best: false },
    { name: 'వరంగల్ లక్ష్మీపురం మార్కెట్', nameEn: 'Laxmipuram Mandi', districtTe: 'వరంగల్', districtEn: 'Warangal', price: 2150, distance: 14, rating: 4.6, best: false },
    { name: 'జనగాం మార్కెట్ యార్డ్', nameEn: 'Jangaon Mandi', districtTe: 'జనగాం', districtEn: 'Jangaon', price: 2120, distance: 55, rating: 4.0, best: false }
  ];

  // Mandi sorting logic
  const sortedMandis = useMemo(() => {
    const sorted = [...initialMandis];
    sorted.sort((a, b) => {
      let comparison = 0;
      if (sortField === 'price') {
        comparison = a.price - b.price;
      } else if (sortField === 'distance') {
        comparison = a.distance - b.distance;
      }
      return sortAsc ? comparison : -comparison;
    });
    return sorted;
  }, [sortField, sortAsc]);

  const handleSortToggle = (field) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  // Filter crops list based on active tab
  const filteredCrops = Object.values(cropData).filter((c) => {
    if (activeCropTab === 'my') return c.myCrop;
    return true;
  });

  // Calculate coordinates for full width trend chart
  const activeCrop = cropData[selectedCrop];
  const activeHistory = activeCrop.history[timeRange];
  const activeDates = activeCrop.dates[timeRange];

  const minPrice = Math.min(...activeHistory);
  const maxPrice = Math.max(...activeHistory);
  const range = maxPrice - minPrice || 1;

  // Render variables for SVG
  const chartWidth = 560;
  const chartHeight = 220;
  const paddingX = 40;
  const paddingY = 30;

  const points = activeHistory.map((val, idx) => {
    const x = paddingX + (idx * (chartWidth - paddingX * 2)) / (activeHistory.length - 1);
    const y = chartHeight - paddingY - ((val - minPrice) * (chartHeight - paddingY * 2)) / range;
    return { x, y, price: val, date: activeDates[idx], idx };
  });

  let linePath = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    linePath += ` L ${points[i].x} ${points[i].y}`;
  }

  const fillPath = `${linePath} L ${points[points.length - 1].x} ${chartHeight - paddingY} L ${points[0].x} ${chartHeight - paddingY} Z`;

  // SVG Mouse Interaction handler
  const handleMouseMove = (e) => {
    const svgRect = e.currentTarget.getBoundingClientRect();
    const mouseX = e.clientX - svgRect.left;
    
    // Scale target coordinate to matches
    const scaleFactor = chartWidth / svgRect.width;
    const scaledMouseX = mouseX * scaleFactor;

    // Find closest point on X coordinate
    let closest = points[0];
    let minDiff = Math.abs(points[0].x - scaledMouseX);
    
    for (let i = 1; i < points.length; i++) {
      const diff = Math.abs(points[i].x - scaledMouseX);
      if (diff < minDiff) {
        minDiff = diff;
        closest = points[i];
      }
    }

    setHoveredPoint(closest);
    
    // Position tooltip relative to actual DOM rectangle element
    const scaledTooltipX = (closest.x / chartWidth) * svgRect.width;
    const scaledTooltipY = (closest.y / chartHeight) * svgRect.height;
    setTooltipPos({ x: scaledTooltipX, y: scaledTooltipY - 10 });
  };

  const handleMouseLeave = () => {
    setHoveredPoint(null);
  };

  const handleAlertSubmit = (e) => {
    e.preventDefault();
    setAlertSuccess(true);
    setTimeout(() => {
      setAlertSuccess(false);
    }, 4000);
  };

  return (
    <div className="bg-krushi-bg min-h-screen py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8 animate-[fade-in_0.3s_ease-out] pb-24 md:pb-12 text-krushi-text">
      
      {/* 1. Header and navigation route indicator */}
      <div className="border-b border-gray-200 pb-4">
        <span className="px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-extrabold bg-krushi-amber-light text-krushi-amber-dark border border-krushi-amber/15">
          📈 Live Mandi Intelligence
        </span>
        <h1 className="heading-farm text-2xl sm:text-3xl font-extrabold text-slate-800 mt-2">
          మార్కెట్ ధరల విశ్లేషణ <span className="text-krushi-amber">/ Market Intelligence Dashboard</span>
        </h1>
        <p className="text-xs text-krushi-muted mt-1 font-telugu">
          తెలంగాణలోని వ్యవసాయ మార్కెట్ ధరలను ఎప్పటికప్పుడు సరిపోల్చండి. కచ్చితమైన వర్తక నిర్ణయాలు తీసుకోండి.
        </p>
      </div>

      {/* 2. TOP HERO HIGHLIGHT & AI ADVISORY GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Left Today's Highlight: 7 Cols */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-gray-150 shadow-card flex flex-col justify-between relative overflow-hidden">
          {/* Subtle amber ambient glow */}
          <div className="absolute -top-10 -right-10 w-28 h-28 bg-krushi-amber-light/35 rounded-full blur-2xl pointer-events-none" />
          
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[9px] uppercase tracking-widest font-black text-krushi-muted">Mandi Top Commodity</span>
                <h2 className="text-2xl font-black text-slate-900 flex items-center gap-1.5 mt-0.5">
                  వరి పంట <span className="text-base text-krushi-muted font-normal">/ Paddy Grade A</span>
                </h2>
              </div>
              <span className="bg-krushi-green-pale text-krushi-green-dark border border-krushi-green-light/10 text-[9px] font-extrabold uppercase px-2.5 py-1 rounded-xl flex items-center gap-1">
                <span>🟢</span> LIVE
              </span>
            </div>

            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-black font-mono text-krushi-amber">
                ₹2,180
              </span>
              <span className="text-xs text-krushi-muted font-bold">per Quintal</span>
              <span className="text-xs text-green-600 font-extrabold flex items-center gap-0.5 ml-2">
                <TrendingUp size={13} />
                +₹45 (+2.1%)
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-[10px] text-krushi-muted font-bold">
              <span className="flex items-center gap-1"><MapPin size={12} className="text-krushi-green" /> వరంగల్ మండి (Warangal Mandi)</span>
              <span className="flex items-center gap-1"><Calendar size={12} /> Last updated: 2 mins ago</span>
            </div>
          </div>

          <div className="flex gap-2.5 pt-6 border-t border-gray-100 mt-6">
            <button
              onClick={() => setSelectedCrop('rice')}
              className="flex-1 px-4 py-2.5 bg-krushi-amber hover:bg-krushi-amber-dark text-white rounded-2xl text-xs font-black shadow-md shadow-krushi-amber/20 hover:scale-[1.02] active:scale-98 transition-all flex items-center justify-center gap-1 cursor-pointer"
            >
              <TrendingUp size={13} />
              <span>View Trend</span>
            </button>
            <button
              onClick={() => {
                setAlertCrop('rice');
                document.getElementById('alert-form')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-4 py-2.5 bg-white border border-gray-200 text-slate-700 rounded-2xl text-xs font-bold hover:bg-gray-50 flex items-center justify-center gap-1 cursor-pointer"
            >
              <Bell size={13} />
              <span>Set Alert</span>
            </button>
            <button
              onClick={() => alert('Market report link copied to clipboard!')}
              className="p-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-krushi-muted rounded-2xl cursor-pointer"
              title="Share"
            >
              <Share2 size={14} />
            </button>
          </div>
        </div>

        {/* Right AI Market Insight: 5 Cols */}
        <div className="lg:col-span-5 bg-gradient-to-br from-krushi-green to-krushi-green-dark text-white rounded-3xl p-6 shadow-md border border-white/10 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute -bottom-20 -right-20 w-48 h-48 bg-white/5 rounded-full blur-2xl pointer-events-none" />
          
          <div className="space-y-3.5">
            <div className="flex justify-between items-center">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-krushi-amber/25 text-krushi-amber-light text-[9px] font-extrabold uppercase border border-krushi-amber/35 animate-pulse">
                <Sparkles size={10} />
                <span>AI మార్కెట్ సూచన / AI Prediction</span>
              </span>
              <span className="text-[10px] font-bold text-krushi-green-pale opacity-80">PROJ v2.0</span>
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-black text-white text-telugu leading-snug">
                "పత్తి ధరలు వచ్చే 2 వారాలలో పెరగవచ్చు. ఇప్పుడు అమ్మకండి!"
              </h3>
              <p className="text-xs text-krushi-green-pale leading-relaxed">
                (Cotton prices are projected to rise by 6-8% in next 2 weeks. Recommend to hold stock.)
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-white/10 mt-6 flex justify-between items-center text-xs">
            <div>
              <span className="text-[9px] text-krushi-green-pale uppercase tracking-widest block font-bold">Confidence Rate</span>
              <span className="text-base font-black font-mono text-krushi-amber-light">78% Confidence</span>
            </div>
            <div className="text-right">
              <span className="text-[9px] text-krushi-green-pale uppercase tracking-widest block font-bold">Based On</span>
              <span className="font-semibold text-white">Historical Demand Trends</span>
            </div>
          </div>
        </div>

      </div>

      {/* 3. TABS & CROP PRICES GRID */}
      <div className="space-y-4">
        
        <div className="flex justify-between items-center">
          <span className="text-xs uppercase tracking-widest font-extrabold text-krushi-amber">మార్కెట్ గ్రిడ్ / Live mandi rates</span>
          
          {/* Toggles tabs */}
          <div className="flex gap-1 bg-white p-1 rounded-xl border border-gray-200">
            <button
              onClick={() => setActiveCropTab('my')}
              className={`px-3.5 py-1.5 rounded-lg text-[10px] font-black cursor-pointer transition-all ${
                activeCropTab === 'my' ? 'bg-krushi-amber text-white shadow-xs' : 'text-krushi-muted hover:text-slate-800'
              }`}
            >
              నా పంటలు (My Crops)
            </button>
            <button
              onClick={() => setActiveCropTab('all')}
              className={`px-3.5 py-1.5 rounded-lg text-[10px] font-black cursor-pointer transition-all ${
                activeCropTab === 'all' ? 'bg-krushi-amber text-white shadow-xs' : 'text-krushi-muted hover:text-slate-800'
              }`}
            >
              అన్ని పంటలు (All Crops)
            </button>
          </div>
        </div>

        {/* Cards Grid layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCrops.map((c) => {
            const minS = Math.min(...c.sparkline);
            const maxS = Math.max(...c.sparkline);
            const rangeS = maxS - minS || 1;
            const pointsS = c.sparkline.map((val, idx) => {
              const x = 5 + (idx * 80) / 6;
              const y = 30 - ((val - minS) * 25) / rangeS;
              return `${x},${y}`;
            }).join(' ');

            return (
              <button
                key={c.key}
                onClick={() => setSelectedCrop(c.key)}
                className={`p-4 bg-white border rounded-2xl text-left transition-all duration-200 shadow-xs hover:-translate-y-1 hover:shadow-md cursor-pointer flex flex-col justify-between gap-4 ${
                  selectedCrop === c.key ? 'border-krushi-amber ring-2 ring-krushi-amber/25' : 'border-gray-200 hover:border-krushi-amber/50'
                }`}
              >
                <div className="flex justify-between items-start w-full">
                  <div>
                    <h3 className="font-extrabold text-sm sm:text-base text-slate-800 text-telugu leading-snug">
                      {c.nameTe} <span className="text-[10px] font-semibold text-krushi-muted block font-sans">{c.nameEn}</span>
                    </h3>
                  </div>
                  <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-md ${c.isGain ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
                    {c.isGain ? '▲' : '▼'} {c.percent}
                  </span>
                </div>

                <div className="flex justify-between items-end w-full">
                  <div>
                    <span className="price-display text-lg sm:text-xl font-bold text-krushi-amber">
                      ₹{c.price.toLocaleString('en-IN')}
                    </span>
                    <span className="block text-[8px] text-krushi-muted font-bold uppercase tracking-wider mt-0.5">
                      Best Mandi: {c.bestMandi.split(' ')[0]}
                    </span>
                  </div>

                  {/* Sparkline mini-chart (7 days) */}
                  <div className="w-24 h-10 shrink-0">
                    <svg viewBox="0 0 90 35" className="w-full h-full">
                      <path
                        d={`M ${pointsS}`}
                        fill="none"
                        stroke={c.isGain ? '#16a34a' : '#dc2626'}
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </div>

              </button>
            );
          })}
        </div>

      </div>

      {/* 4. FULL WIDTH PRICE TREND CHART */}
      <div className="bg-white rounded-3xl p-6 border border-gray-150 shadow-card space-y-6">
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3.5 border-b border-gray-100 pb-4">
          <div>
            <span className="text-[9px] uppercase tracking-widest font-black text-krushi-amber">Interactive Analytics</span>
            <h3 className="text-base sm:text-lg font-black text-slate-800 mt-0.5">
              ధరల చారిత్రక సరళి <span className="text-xs font-semibold text-krushi-muted">/ Mandi Price Trend Chart</span>
            </h3>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            {/* Crop Select */}
            <select
              value={selectedCrop}
              onChange={(e) => setSelectedCrop(e.target.value)}
              className="px-3 py-1.5 bg-krushi-bg border border-gray-200 rounded-xl text-xs font-bold text-slate-800 outline-none cursor-pointer focus:border-krushi-amber"
            >
              {Object.values(cropData).map((c) => (
                <option key={c.key} value={c.key}>
                  {c.nameTe} ({c.nameEn.split(' ')[0]})
                </option>
              ))}
            </select>

            {/* Time range buttons */}
            <div className="flex gap-0.5 bg-krushi-bg p-0.5 rounded-xl border border-gray-200">
              {['7D', '1M', '3M', '6M'].map((rangeStr) => (
                <button
                  key={rangeStr}
                  onClick={() => setTimeRange(rangeStr)}
                  className={`px-3 py-1 rounded-lg text-[9px] font-black cursor-pointer transition-all ${
                    timeRange === rangeStr ? 'bg-krushi-amber text-white shadow-xs' : 'text-krushi-muted hover:text-slate-800'
                  }`}
                >
                  {rangeStr}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* SVG CHART CONTAINER WITH HOVER TRACKING */}
        <div className="relative w-full overflow-hidden">
          
          <div
            className="w-full relative"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-auto">
              
              {/* Subtle grids */}
              <line x1={paddingX} y1={paddingY} x2={chartWidth - paddingX} y2={paddingY} stroke="#f3f4f6" strokeWidth="1" />
              <line x1={paddingX} y1={chartHeight / 2} x2={chartWidth - paddingX} y2={chartHeight / 2} stroke="#f3f4f6" strokeWidth="1" />
              <line x1={paddingX} y1={chartHeight - paddingY} x2={chartWidth - paddingX} y2={chartHeight - paddingY} stroke="#e5e7eb" strokeWidth="1" />

              {/* Glowing linear gradient backgrounds */}
              <defs>
                <linearGradient id="chart-glow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#BA7517" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#BA7517" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Area path */}
              <path d={fillPath} fill="url(#chart-glow)" />

              {/* Line path */}
              <path d={linePath} fill="none" stroke="#BA7517" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

              {/* Coordinate dots */}
              {points.map((p) => (
                <circle
                  key={p.idx}
                  cx={p.x}
                  cy={p.y}
                  r={hoveredPoint && hoveredPoint.idx === p.idx ? "6" : "3.5"}
                  fill={hoveredPoint && hoveredPoint.idx === p.idx ? "#BA7517" : "#FFFFFF"}
                  stroke="#BA7517"
                  strokeWidth="2"
                  className="transition-all duration-150"
                />
              ))}

              {/* Date Labels */}
              {points.map((p, idx) => {
                // Show alternate date labels for longer lists
                const interval = timeRange === '7D' ? 1 : timeRange === '1M' ? 2 : 3;
                if (idx % interval !== 0 && idx !== points.length - 1) return null;

                return (
                  <text
                    key={p.idx}
                    x={p.x}
                    y={chartHeight - 10}
                    textAnchor="middle"
                    className="text-[8px] sm:text-[9px] fill-krushi-muted font-bold"
                  >
                    {p.date}
                  </text>
                );
              })}

              {/* Left Price labels */}
              <text x={paddingX - 10} y={paddingY + 4} textAnchor="end" className="text-[8px] fill-krushi-muted font-bold">₹{maxPrice}</text>
              <text x={paddingX - 10} y={chartHeight - paddingY + 4} textAnchor="end" className="text-[8px] fill-krushi-muted font-bold">₹{minPrice}</text>

              {/* Hover vertical reference line */}
              {hoveredPoint && (
                <line
                  x1={hoveredPoint.x}
                  y1={paddingY}
                  x2={hoveredPoint.x}
                  y2={chartHeight - paddingY}
                  stroke="#BA7517"
                  strokeWidth="1.5"
                  strokeDasharray="4,4"
                  className="pointer-events-none"
                />
              )}

            </svg>

            {/* Hover Tooltip display box */}
            {hoveredPoint && (
              <div
                className="absolute bg-slate-900/90 text-white rounded-xl p-2.5 shadow-modal text-[10px] space-y-0.5 border border-slate-700 pointer-events-none z-10 transition-all duration-100 ease-out flex flex-col font-bold"
                style={{
                  top: `${tooltipPos.y}px`,
                  left: `${tooltipPos.x}px`,
                  transform: 'translate(-50%, -100%)'
                }}
              >
                <span className="text-krushi-amber-light font-mono text-xs">₹{hoveredPoint.price.toLocaleString('en-IN')}</span>
                <span className="text-[9px] text-gray-300 font-medium">{hoveredPoint.date}</span>
              </div>
            )}
          </div>

        </div>

      </div>

      {/* 5. MANDI COMPARISON TABLE */}
      <div className="bg-white rounded-3xl p-6 border border-gray-150 shadow-card space-y-4">
        
        <div>
          <span className="text-[9px] uppercase tracking-widest font-black text-krushi-amber">Local Mandis Comparison</span>
          <h3 className="text-base sm:text-lg font-black text-slate-800 mt-0.5">
            మండీల ధరల పోలిక పట్టిక <span className="text-xs font-semibold text-krushi-muted">/ Mandi Pricing Comparison Table</span>
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-krushi-bg border-b border-gray-200 text-krushi-muted font-extrabold uppercase tracking-wider text-[9px]">
                <th className="p-3.5">మండి పేరు (Mandi Name)</th>
                <th className="p-3.5">జిల్లా (District)</th>
                
                {/* Price sort trigger header */}
                <th
                  onClick={() => handleSortToggle('price')}
                  className="p-3.5 cursor-pointer hover:bg-gray-100 transition-colors inline-flex items-center gap-1"
                >
                  ధర (₹/qtl)
                  <ArrowUpDown size={11} className="text-krushi-amber" />
                </th>
                
                {/* Distance sort trigger header */}
                <th
                  onClick={() => handleSortToggle('distance')}
                  className="p-3.5 cursor-pointer hover:bg-gray-100 transition-colors"
                >
                  <span className="inline-flex items-center gap-1">
                    దూరం (Distance)
                    <ArrowUpDown size={11} className="text-krushi-amber" />
                  </span>
                </th>
                
                <th className="p-3.5">Rating</th>
                <th className="p-3.5 text-center">చర్య (Action)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-bold text-slate-800">
              {sortedMandis.map((m, idx) => (
                <tr key={idx} className={`hover:bg-slate-50 transition-colors ${m.best ? 'bg-krushi-amber-light/10' : ''}`}>
                  <td className="p-3.5">
                    <span className="text-telugu block text-xs font-black">{m.name}</span>
                    <span className="text-[9px] text-krushi-muted font-medium">{m.nameEn}</span>
                  </td>
                  <td className="p-3.5 text-telugu">{m.districtTe}</td>
                  <td className="p-3.5 text-base font-mono text-krushi-green-dark">
                    ₹{m.price.toLocaleString('en-IN')}
                    {m.best && (
                      <span className="ml-2 bg-krushi-amber text-white text-[8px] font-black uppercase px-2 py-0.5 rounded-lg shadow-sm">
                        Best Price
                      </span>
                    )}
                  </td>
                  <td className="p-3.5 text-krushi-muted">{m.distance} km</td>
                  <td className="p-3.5 text-krushi-amber">⭐ {m.rating}</td>
                  <td className="p-3.5 text-center">
                    <button
                      onClick={() => alert(`Simulating direction routing to ${m.nameEn}...`)}
                      className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-gray-200 hover:border-krushi-amber text-slate-700 text-[10px] font-extrabold flex items-center justify-center gap-1 mx-auto shadow-sm active:scale-95 transition-all cursor-pointer"
                    >
                      <Compass size={11} className="text-krushi-amber" />
                      <span>Get Directions</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>

      {/* 6. SET PRICE ALERTS FORM CARD */}
      <div id="alert-form" className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Info Left */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-gray-150 shadow-card flex flex-col justify-between">
          <div className="space-y-3">
            <h3 className="text-sm sm:text-base font-black text-slate-800">
              ధరల హెచ్చరికలు <span className="text-xs font-semibold text-krushi-muted block mt-0.5">/ WhatsApp & SMS Price Alerts</span>
            </h3>
            <p className="text-xs text-krushi-muted leading-relaxed">
              మీరు కోరుకున్న ధర మార్కెట్లో అందిన వెంటనే మీకు వాట్సాప్ లేదా ఎస్ఎంఎస్ ద్వారా నోటిఫికేషన్ లభిస్తుంది.
            </p>
          </div>

          <div className="bg-krushi-green-pale/40 border border-krushi-green-light/10 p-3 rounded-2xl flex items-start gap-2.5 mt-4 text-xs font-semibold">
            <AlertCircle size={15} className="text-krushi-green shrink-0 mt-0.5" />
            <span className="text-krushi-green-dark">ఈ సేవ తెలంగాణా రైతు సంఘాల కొరకు ఉచితంగా అందించబడుతుంది.</span>
          </div>
        </div>

        {/* Form Right */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-6 border border-gray-150 shadow-card">
          <form onSubmit={handleAlertSubmit} className="space-y-4">
            
            {alertSuccess && (
              <div className="p-3.5 bg-green-50 border border-green-200 text-green-800 rounded-2xl text-xs font-bold flex items-center gap-2 animate-[scale-up_0.15s_ease-out]">
                <CheckCircle size={16} className="text-green-600 shrink-0" />
                <span>ధర హెచ్చరిక విజయవంతంగా సెట్ చేయబడింది! (Price alert configured successfully via {alertType === 'whatsapp' ? 'WhatsApp' : 'SMS'}.)</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Select crop */}
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider font-extrabold text-krushi-muted block">Select Crop</label>
                <select
                  value={alertCrop}
                  onChange={(e) => setAlertCrop(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-krushi-bg border border-gray-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-krushi-amber"
                >
                  <option value="rice">వరి పంట (Rice Paddy)</option>
                  <option value="cotton">పత్తి పంట (Cotton Kapas)</option>
                  <option value="maize">మొక్కజొన్న (Hybrid Maize)</option>
                  <option value="soya">సోయాబీన్ (Soybean)</option>
                  <option value="chilli">మిర్చి (Guntur Chilli)</option>
                  <option value="turmeric">పసుపు (Turmeric Finger)</option>
                </select>
              </div>

              {/* Target Price */}
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider font-extrabold text-krushi-muted block">Target Price (₹/quintal)</label>
                <div className="relative flex items-center">
                  <span className="absolute left-3.5 text-xs text-krushi-muted font-bold">₹</span>
                  <input
                    type="number"
                    value={targetPrice}
                    onChange={(e) => setTargetPrice(e.target.value)}
                    className="w-full pl-7 pr-3.5 py-2.5 bg-krushi-bg border border-gray-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-krushi-amber"
                    placeholder="Enter target amount"
                    required
                  />
                </div>
              </div>

            </div>

            {/* Delivery method */}
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-wider font-extrabold text-krushi-muted block">Alert Delivery Channel</label>
              
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                  <input
                    type="radio"
                    name="delivery"
                    value="whatsapp"
                    checked={alertType === 'whatsapp'}
                    onChange={() => setAlertType('whatsapp')}
                    className="accent-krushi-amber"
                  />
                  <span>WhatsApp Alert</span>
                </label>
                <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                  <input
                    type="radio"
                    name="delivery"
                    value="sms"
                    checked={alertType === 'sms'}
                    onChange={() => setAlertType('sms')}
                    className="accent-krushi-amber"
                  />
                  <span>SMS Alert</span>
                </label>
              </div>
            </div>

            <button
              type="submit"
              className="px-5 py-2.5 bg-krushi-amber hover:bg-krushi-amber-dark text-white rounded-2xl text-xs font-black shadow-md shadow-krushi-amber/15 hover:scale-[1.02] active:scale-98 transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Bell size={13} />
              <span>సృష్టించండి / Set Alert Notification</span>
            </button>

          </form>
        </div>

      </div>

    </div>
  );
}
