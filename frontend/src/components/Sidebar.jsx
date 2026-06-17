import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { 
  LayoutDashboard, 
  Map, 
  Sprout, 
  ScanLine, 
  CloudSun, 
  TrendingUp, 
  FileText, 
  MessageSquare, 
  Bell, 
  User, 
  LogOut 
} from 'lucide-react';

export const Sidebar = () => {
  const { logout, t } = useContext(AppContext);

  const menuItems = [
    { path: '/dashboard', label: t('dashboard'), icon: LayoutDashboard },
    { path: '/farm', label: t('myFarm'), icon: Map },
    { path: '/crops', label: t('cropManagement'), icon: Sprout },
    { path: '/disease-scanner', label: t('diseaseScanner'), icon: ScanLine },
    { path: '/weather', label: t('weather'), icon: CloudSun },
    { path: '/market', label: t('marketIntelligence'), icon: TrendingUp },
    { path: '/schemes', label: t('govSchemes'), icon: FileText },
    { path: '/chat', label: t('aiChatbot'), icon: MessageSquare },
    { path: '/notifications', label: t('notifications'), icon: Bell },
    { path: '/profile', label: t('profile'), icon: User },
  ];

  return (
    <aside className="w-64 glass-panel h-screen sticky top-0 flex flex-col justify-between p-4 border-r border-green-500/20 z-40">
      <div>
        {/* Brand/Logo */}
        <div className="flex items-center gap-3 px-2 py-4 mb-6">
          <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center border border-green-500/40 shadow-[0_0_15px_rgba(34,197,94,0.3)] card-3d">
            <Sprout className="w-6 h-6 text-green-400 animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl font-bold font-heading tracking-wide text-green-400 glow-text-green">{t('appName')}</h1>
            <p className="text-[10px] text-green-500/70 font-mono">v1.2.0-secure</p>
          </div>
        </div>

        {/* Menu Items */}
        <nav className="space-y-1.5">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => `
                  flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all duration-300 font-medium text-sm border
                  ${isActive 
                    ? 'bg-green-500/15 border-green-500/40 text-green-300 shadow-[0_0_15px_rgba(34,197,94,0.15)] font-semibold' 
                    : 'bg-transparent border-transparent text-slate-400 hover:text-green-300 hover:bg-green-500/5 hover:border-green-500/10 hover:shadow-[0_0_10px_rgba(34,197,94,0.05)]'
                  }
                `}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Logout / User Info */}
      <div className="pt-4 border-t border-green-500/10">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/5 hover:border-red-500/10 transition-all duration-300 text-sm font-medium border border-transparent"
        >
          <LogOut className="w-5 h-5" />
          <span>{t('logout')}</span>
        </button>
      </div>
    </aside>
  );
};
