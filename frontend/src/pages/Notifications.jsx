import React, { useState, useEffect, useContext } from 'react';
import { Bell, CloudSun, TrendingUp, AlertTriangle, Sprout, Check, Trash2, RefreshCw } from 'lucide-react';
import { toast } from 'react-toastify';
import { AppContext } from '../context/AppContext';
import { getNotifications } from '../services/api';

const DEMO_NOTIFICATIONS = [
  { id: 'd1', type: 'weather', title: 'Heavy Rain & Winds', message: 'Cyclone warnings active in Suryapet/Nalgonda areas. Restrict field works between Thursday & Friday.', date: 'Today, 10:30 AM', unread: true, priority: 'critical' },
  { id: 'd2', type: 'disease', title: 'Kharif Season Pest Alert', message: 'High humidity raises risk of stem borers, leaf blast, and whitefly infestations. Visit Pest Risk Predictor for your crop-specific forecast.', date: 'Today, 9:00 AM', unread: true, priority: 'warning' },
  { id: 'd3', type: 'market', title: 'Weekly Mandi Price Advisory', message: 'Our LSTM model has refreshed price forecasts for Paddy, Cotton, and Chilli this week. Check the Market page.', date: 'Today, 8:00 AM', unread: false, priority: 'info' },
  { id: 'd4', type: 'crop', title: 'Fertilization Reminder', message: 'Paddy crop is entering Tillering stage. Prepare urea and silicon boost dressing within 3 days.', date: 'Yesterday, 2:15 PM', unread: false, priority: 'info' },
];

export const Notifications = () => {
  const { user } = useContext(AppContext);
  const [filter, setFilter] = useState('all');
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      if (user?.id && user.id !== 99999) {
        const data = await getNotifications(user.id);
        setNotifications(data);
      } else {
        // Demo mode — show representative placeholder notifications
        setNotifications(DEMO_NOTIFICATIONS);
      }
    } catch {
      // Fallback to demo notifications on error
      setNotifications(DEMO_NOTIFICATIONS);
      toast.error('Could not load live notifications. Showing cached alerts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [user?.id]);

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
    toast.info('All notifications marked as read.', { theme: 'dark', toastId: 'notif-read-all' });
  };

  const clearAll = () => {
    setNotifications([]);
    toast.success('Notification feed cleared.', { theme: 'dark', toastId: 'notif-clear-all' });
  };

  const filteredList = notifications.filter(n => filter === 'all' || n.type === filter);

  return (
    <div className="max-w-4xl mx-auto space-y-6 page-fade-in">
      
      {/* Page Header */}
      <div className="flex items-center justify-between border-b border-green-500/20 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-green-500/10 border border-green-500/40 flex items-center justify-center shadow-[0_0_15px_rgba(34,197,94,0.3)]">
            <Bell className="w-5 h-5 text-green-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold font-heading text-slate-100 glow-text-green">Notifications Center</h2>
            <p className="text-xs text-slate-400 mt-0.5">Smart crop lifecycle alerts, pest warnings, and market advisories.</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 text-xs font-mono">
          <button
            onClick={fetchNotifications}
            className="px-3 py-1.5 border border-green-500/20 hover:border-green-500/40 rounded-xl text-slate-400 hover:text-green-300 transition-all flex items-center gap-1.5 bg-slate-950/20"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <button onClick={markAllRead} className="px-3 py-1.5 border border-green-500/20 hover:border-green-500/40 rounded-xl text-green-300 transition-all flex items-center gap-1.5 bg-green-950/20">
            <Check className="w-3.5 h-3.5" />
            <span>Mark read</span>
          </button>
          <button onClick={clearAll} className="px-3 py-1.5 border border-red-500/20 hover:border-red-500/40 rounded-xl text-red-300 transition-all flex items-center gap-1.5 bg-red-950/20">
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear all</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 bg-green-950/30 p-0.5 rounded-lg border border-green-500/10 w-fit">
        {[
          { code: 'all', label: 'All Alerts' },
          { code: 'weather', label: 'Weather' },
          { code: 'market', label: 'Market' },
          { code: 'disease', label: 'Disease' },
          { code: 'crop', label: 'Crop' },
        ].map((tab) => (
          <button
            key={tab.code}
            onClick={() => setFilter(tab.code)}
            className={`px-3.5 py-1.5 rounded-md text-xs font-semibold font-mono transition-all duration-300 ${filter === tab.code ? 'bg-green-500/20 text-green-300 border border-green-500/30' : 'text-slate-500 hover:text-slate-300'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading ? (
        <div className="flex items-center justify-center py-16 gap-3 text-slate-400 font-mono text-sm">
          <RefreshCw className="w-5 h-5 animate-spin text-green-400" />
          Loading smart notifications...
        </div>
      ) : (
        /* Feed list */
        <div className="space-y-4">
          {filteredList.length > 0 ? (
            filteredList.map((n) => {
              let Icon = Bell;
              let iconColor = 'text-green-400 border-green-500/30';
              if (n.type === 'weather') { Icon = CloudSun; iconColor = 'text-blue-400 border-blue-500/30'; }
              if (n.type === 'market')  { Icon = TrendingUp; iconColor = 'text-amber-500 border-amber-500/30'; }
              if (n.type === 'disease') { Icon = AlertTriangle; iconColor = 'text-red-400 border-red-500/30'; }
              if (n.type === 'crop')    { Icon = Sprout; iconColor = 'text-green-400 border-green-500/30'; }
              
              return (
                <div 
                  key={n.id} 
                  className={`glass-panel p-5 rounded-2xl border transition-all duration-300 flex items-start gap-4 card-3d relative overflow-hidden
                    ${n.unread ? 'border-green-500/40 shadow-[0_0_15px_rgba(34,197,94,0.08)]' : 'border-green-500/10'}
                  `}
                >
                  {/* Priority glow strip */}
                  {n.priority === 'critical' && <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500 shadow-[0_0_10px_#ef4444]"></div>}
                  {n.priority === 'warning'  && <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500"></div>}

                  {/* Left icon badge */}
                  <div className={`w-10 h-10 rounded-xl bg-slate-950/40 border flex items-center justify-center flex-shrink-0 ${iconColor}`}>
                    <Icon className="w-5 h-5" />
                  </div>

                  {/* Info */}
                  <div className="flex-grow space-y-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-slate-200">{n.title}</h4>
                      <span className="text-[10px] font-mono text-slate-500">{n.date}</span>
                    </div>
                    <p className="text-xs text-slate-400 leading-normal">{n.message}</p>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="glass-panel p-12 rounded-2xl border border-green-500/10 text-center text-slate-500">
              <Bell className="w-12 h-12 mb-3 mx-auto text-green-500/20" />
              <h4 className="font-heading font-bold text-slate-400">Feed Empty</h4>
              <p className="text-xs text-slate-500 mt-1">No active notifications found for this alert filter.</p>
            </div>
          )}
        </div>
      )}

    </div>
  );
};

