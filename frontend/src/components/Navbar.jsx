import React, { useContext, useState, useEffect } from 'react';
import { AppContext } from '../context/AppContext';
import { Globe, ShieldCheck, Wifi } from 'lucide-react';

export const Navbar = () => {
  const { user, language, setLanguage, t } = useContext(AppContext);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date) =>
    date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });

  const formatDate = (date) =>
    date.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });

  return (
    <header className="nav-glass" style={{
      padding: '0 28px', height: '64px', display: 'flex', alignItems: 'center',
      justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 30, width: '100%'
    }}>

      {/* ── Left: Status indicators ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        {/* Live pulse */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
          <span style={{ position: 'relative', display: 'flex', width: '10px', height: '10px' }}>
            <span style={{
              position: 'absolute', display: 'inline-flex', width: '100%', height: '100%',
              borderRadius: '9999px', background: '#10b981', opacity: 0.6,
              animation: 'ping 1.5s cubic-bezier(0,0,0.2,1) infinite'
            }} />
            <span style={{ position: 'relative', display: 'inline-flex', borderRadius: '9999px', width: '10px', height: '10px', background: '#10b981' }} />
          </span>
          <span style={{ fontSize: '11px', fontWeight: 600, color: '#10b981', letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: 'monospace' }}>
            System Online
          </span>
        </div>

        <div style={{ display: 'none' }} className="md:flex" >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Wifi style={{ width: '13px', height: '13px', color: '#38bdf8' }} />
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>API Connected</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <ShieldCheck style={{ width: '13px', height: '13px', color: '#a78bfa' }} />
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>Secured</span>
        </div>
      </div>

      {/* ── Right: Time, Language, User ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>

        {/* DateTime */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
          <span style={{ fontSize: '13px', fontWeight: 700, color: '#ffffff', fontFamily: 'monospace', lineHeight: 1 }}>
            {formatTime(time)}
          </span>
          <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'monospace', marginTop: '2px' }}>
            {formatDate(time)}
          </span>
        </div>

        {/* Language Switcher */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '2px',
          background: 'rgba(16,185,129,0.05)', padding: '3px',
          borderRadius: '8px', border: '1px solid var(--border-subtle)'
        }}>
          {[
            { code: 'te', label: 'తెలుగు' },
            { code: 'en', label: 'EN' },
            { code: 'hi', label: 'हिंदी' }
          ].map((lang) => (
            <button
              key={lang.code}
              onClick={() => setLanguage(lang.code)}
              style={{
                padding: '4px 10px', fontSize: '11px', fontWeight: 600,
                borderRadius: '6px', border: 'none', cursor: 'pointer',
                transition: 'all 0.2s ease',
                background: language === lang.code ? 'rgba(16,185,129,0.2)' : 'transparent',
                color: language === lang.code ? '#10b981' : 'var(--text-muted)',
                outline: language === lang.code ? '1px solid rgba(16,185,129,0.3)' : 'none',
              }}
            >
              {lang.label}
            </button>
          ))}
        </div>

        {/* User Card */}
        {user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingLeft: '16px', borderLeft: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#ffffff' }}>
                {user.name || 'Farmer'}
              </span>
              <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                {user.village || user.phone}
              </span>
            </div>
            <div style={{
              width: '34px', height: '34px', borderRadius: '50%',
              background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '14px', fontWeight: 700, color: '#10b981',
              fontFamily: 'var(--font-heading)'
            }}>
              {(user.name || 'F').charAt(0).toUpperCase()}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
