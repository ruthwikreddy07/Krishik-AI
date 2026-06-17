import React, { useContext, useState, useEffect } from 'react';
import { AppContext } from '../context/AppContext';
import { User, MessageSquareCode, Globe, Check, ShieldCheck } from 'lucide-react';
import { toast } from 'react-toastify';

export const Profile = () => {
  const { user, language, setLanguage, login, t } = useContext(AppContext);
  const [whatsappEnabled, setWhatsappEnabled] = useState(true);
  const [whatsappNumber, setWhatsappNumber] = useState(user?.phone || user?.mobile_number || '');

  useEffect(() => {
    if (user) {
      setWhatsappNumber(user.phone || user.mobile_number || '');
    }
  }, [user]);

  const handleSaveSettings = (e) => {
    e.preventDefault();
    login({ ...user, phone: whatsappNumber }, localStorage.getItem('farmer_token') || 'demo-token');
    toast.success("Profile configurations saved!", { theme: "dark", toastId: "profile-success" });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 page-fade-in">
      
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-green-500/20 pb-4">
        <div className="w-10 h-10 rounded-xl bg-green-500/10 border border-green-500/40 flex items-center justify-center shadow-[0_0_15px_rgba(34,197,94,0.3)]">
          <User className="w-5 h-5 text-green-400" />
        </div>
        <div>
          <h2 className="text-2xl font-bold font-heading text-slate-100 glow-text-green">{t('profile')}</h2>
          <p className="text-xs text-slate-400 mt-0.5">Manage localization preferences, agricultural notifications, and WhatsApp sync logs.</p>
        </div>
      </div>

      <div className="glass-panel p-6 rounded-3xl border border-green-500/15 card-3d relative overflow-hidden space-y-6">
        
        {/* Language block */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold font-mono text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <Globe className="w-4 h-4 text-green-400" />
            <span>Preferred Interface Language</span>
          </h3>
          
          <div className="grid grid-cols-3 gap-4 font-heading font-semibold text-sm">
            {[
              { code: 'te', title: 'తెలుగు (Telugu)', desc: 'ప్రాంతీయ భాష' },
              { code: 'en', title: 'English (US)', desc: 'Standard Interface' },
              { code: 'hi', title: 'हिंदी (Hindi)', desc: 'उत्तरी क्षेत्रीय' }
            ].map((lang) => (
              <button
                key={lang.code}
                onClick={() => setLanguage(lang.code)}
                className={`
                  p-4 rounded-2xl border text-left flex flex-col justify-between transition-all duration-300 card-3d
                  ${language === lang.code 
                    ? 'bg-green-500/15 border-green-500/50 text-green-300 shadow-[0_0_15px_rgba(34,197,94,0.1)]' 
                    : 'bg-slate-950/40 border-green-500/10 text-slate-400 hover:border-green-500/20'
                  }
                `}
              >
                <span>{lang.title}</span>
                <span className="text-[10px] font-mono text-slate-500 font-normal mt-1">{lang.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* WhatsApp sync block */}
        <form onSubmit={handleSaveSettings} className="space-y-6 border-t border-green-500/10 pt-6">
          <div className="space-y-4">
            <h3 className="text-sm font-bold font-mono text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <MessageSquareCode className="w-4 h-4 text-blue-400" />
              <span>WhatsApp Integration Sync</span>
            </h3>

            <div className="flex items-center justify-between bg-slate-950/40 border border-green-500/5 p-4 rounded-2xl">
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-slate-200">Send advisories on WhatsApp</h4>
                <p className="text-[10px] text-slate-500 leading-normal max-w-sm">Automatically forwards critical rain, crop disease warnings, and market intelligence alerts to your WhatsApp phone number.</p>
              </div>

              {/* Toggle switch */}
              <button
                type="button"
                onClick={() => setWhatsappEnabled(!whatsappEnabled)}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none
                  ${whatsappEnabled ? 'bg-green-600' : 'bg-slate-800'}
                `}
              >
                <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out
                  ${whatsappEnabled ? 'translate-x-5' : 'translate-x-0'}
                `}></span>
              </button>
            </div>

            {whatsappEnabled && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-slate-500 mb-1.5 uppercase">WhatsApp Phone Number</label>
                  <input
                    type="tel"
                    maxLength="10"
                    value={whatsappNumber}
                    onChange={(e) => setWhatsappNumber(e.target.value.replace(/\D/g, ''))}
                    className="w-full bg-slate-950/60 border border-green-500/20 focus:border-green-500/60 rounded-xl px-4 py-2.5 text-xs text-white outline-none transition-all"
                    required
                  />
                </div>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-green-500/5 flex justify-end">
            <button
              type="submit"
              className="py-2.5 px-5 bg-green-600 hover:bg-green-500 text-slate-900 font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 border border-green-400 shadow-[0_4px_20px_rgba(34,197,94,0.2)] glow-btn"
            >
              <Check className="w-4 h-4" />
              <span className="text-xs">Save Configurations</span>
            </button>
          </div>
        </form>

      </div>

    </div>
  );
};
