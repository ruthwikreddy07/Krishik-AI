import React, { useContext, useState, useEffect } from 'react';
import { AppContext } from '../context/AppContext';
import { Globe, User, ShieldAlert, Cpu } from 'lucide-react';

export const Navbar = () => {
  const { user, language, setLanguage, t } = useContext(AppContext);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString([], { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <header className="glass-panel border-b border-green-500/20 px-8 py-4 flex items-center justify-between sticky top-0 z-30 w-full">
      {/* System Status Indicators */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
          </span>
          <span className="text-xs font-mono text-green-400/90 glow-text-green uppercase tracking-wider">System: Online</span>
        </div>
        
        <div className="hidden md:flex items-center gap-2 text-xs font-mono text-slate-500">
          <Cpu className="w-3.5 h-3.5 text-blue-400" />
          <span>API: Connected</span>
        </div>

        <div className="hidden lg:flex items-center gap-2 text-xs font-mono text-slate-500">
          <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
          <span>Security: Active</span>
        </div>
      </div>

      {/* Date, Language Selector & Profile */}
      <div className="flex items-center gap-6">
        {/* DateTime Display */}
        <div className="hidden sm:flex flex-col items-end text-xs font-mono">
          <span className="text-slate-300 font-semibold">{formatTime(time)}</span>
          <span className="text-slate-500 text-[10px]">{formatDate(time)}</span>
        </div>

        {/* Language Toggles */}
        <div className="flex items-center gap-1 bg-green-950/40 p-0.5 rounded-lg border border-green-500/20">
          {[
            { code: 'te', label: 'తెలుగు' },
            { code: 'en', label: 'EN' },
            { code: 'hi', label: 'हिंदी' }
          ].map((lang) => (
            <button
              key={lang.code}
              onClick={() => setLanguage(lang.code)}
              className={`
                px-2.5 py-1 text-xs font-semibold rounded-md transition-all duration-300
                ${language === lang.code 
                  ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
                  : 'text-slate-500 hover:text-slate-300'
                }
              `}
            >
              {lang.label}
            </button>
          ))}
        </div>

        {/* User Card */}
        {user && (
          <div className="flex items-center gap-3 pl-4 border-l border-green-500/10">
            <div className="flex flex-col items-end">
              <span className="text-sm font-semibold text-slate-200">{user.name || "Telangana Farmer"}</span>
              <span className="text-[10px] text-green-500/70 font-mono">{user.phone}</span>
            </div>
            <div className="w-9 h-9 rounded-full bg-green-500/15 border border-green-500/30 flex items-center justify-center shadow-[0_0_10px_rgba(34,197,94,0.15)]">
              <User className="w-5 h-5 text-green-400" />
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
