import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import {
  LayoutDashboard, Map, Sprout, ScanLine,
  CloudSun, TrendingUp, FileText, MessageSquare,
  Bell, User, LogOut, ChevronRight
} from 'lucide-react';

export const Sidebar = () => {
  const { user, logout, t } = useContext(AppContext);

  const menuItems = [
    { path: '/dashboard', label: t('dashboard'), icon: LayoutDashboard, color: 'var(--accent-primary)' },
    { path: '/farm', label: t('myFarm'), icon: Map, color: 'var(--accent-primary)' },
    { path: '/crops', label: t('cropManagement'), icon: Sprout, color: '#34d399' },
    { path: '/disease-scanner', label: t('diseaseScanner'), icon: ScanLine, color: 'var(--color-disease)' },
    { path: '/weather', label: t('weather'), icon: CloudSun, color: 'var(--color-weather)' },
    { path: '/market', label: t('marketIntelligence'), icon: TrendingUp, color: 'var(--color-market)' },
    { path: '/schemes', label: t('govSchemes'), icon: FileText, color: 'var(--color-schemes)' },
    { path: '/chat', label: t('aiChatbot'), icon: MessageSquare, color: 'var(--color-chat)' },
    { path: '/notifications', label: t('notifications'), icon: Bell, color: '#38bdf8' },
    { path: '/profile', label: t('profile'), icon: User, color: '#94a3b8' },
  ];

  return (
    <aside className="sidebar-glass" style={{
      width: '248px', height: '100vh', position: 'sticky', top: 0,
      display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
      padding: '20px 12px', zIndex: 40, flexShrink: 0
    }}>
      {/* ── Brand Logo ── */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 12px 24px 12px' }}>
          <div style={{
            width: '38px', height: '38px', borderRadius: '12px', flexShrink: 0,
            background: 'linear-gradient(135deg, #059669, #10b981)',
            boxShadow: '0 0 16px rgba(16,185,129,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Sprout style={{ width: '20px', height: '20px', color: '#fff' }} />
          </div>
          <div>
            <h1 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '17px', color: '#ffffff', lineHeight: 1 }}>
              {t('appName')}
            </h1>
            <p style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'monospace', marginTop: '2px', letterSpacing: '0.05em' }}>
              v1.2 · Beta
            </p>
          </div>
        </div>

        {/* ── User chip ── */}
        {user && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px',
            marginBottom: '16px', borderRadius: '12px',
            background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)'
          }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0,
              background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <User style={{ width: '16px', height: '16px', color: '#10b981' }} />
            </div>
            <div style={{ overflow: 'hidden' }}>
              <p style={{ fontSize: '12px', fontWeight: 600, color: '#ffffff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user.name || 'Farmer'}
              </p>
              <p style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                {user.village || user.phone}
              </p>
            </div>
          </div>
        )}

        {/* ── Nav Links ── */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                style={({ isActive }) => ({
                  display: 'flex', alignItems: 'center', gap: '11px',
                  padding: '10px 12px', borderRadius: '10px',
                  fontSize: '13px', fontWeight: isActive ? 600 : 500,
                  textDecoration: 'none', transition: 'all 0.2s ease',
                  color: isActive ? item.color : 'var(--text-secondary)',
                  background: isActive ? `rgba(16,185,129,0.08)` : 'transparent',
                  border: isActive ? `1px solid rgba(16,185,129,0.2)` : '1px solid transparent',
                })}
                onMouseEnter={(e) => {
                  if (!e.currentTarget.classList.contains('active')) {
                    e.currentTarget.style.color = '#ffffff';
                    e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!e.currentTarget.dataset.active) {
                    e.currentTarget.style.color = 'var(--text-secondary)';
                    e.currentTarget.style.background = 'transparent';
                  }
                }}
              >
                <Icon style={{ width: '17px', height: '17px', flexShrink: 0 }} />
                <span style={{ flex: 1 }}>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* ── Logout ── */}
      <div style={{ paddingTop: '12px', borderTop: '1px solid var(--border-subtle)' }}>
        <button
          onClick={logout}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: '11px',
            padding: '10px 12px', borderRadius: '10px', border: '1px solid transparent',
            background: 'transparent', cursor: 'pointer', fontSize: '13px',
            fontWeight: 500, color: 'var(--text-muted)', transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#f87171';
            e.currentTarget.style.background = 'rgba(248,113,113,0.06)';
            e.currentTarget.style.borderColor = 'rgba(248,113,113,0.15)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'var(--text-muted)';
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.borderColor = 'transparent';
          }}
        >
          <LogOut style={{ width: '17px', height: '17px' }} />
          <span>{t('logout')}</span>
        </button>
      </div>
    </aside>
  );
};
