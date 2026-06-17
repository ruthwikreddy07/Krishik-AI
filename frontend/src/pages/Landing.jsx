import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { Sprout, Phone, ShieldCheck, ArrowRight, Sparkles, MessageSquareCode, Leaf, Cpu } from 'lucide-react';

export const Landing = () => {
  const { login, t, language } = useContext(AppContext);
  const navigate = useNavigate();
  
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1); // 1 = Phone, 2 = OTP
  const [loading, setLoading] = useState(false);

  const handleSendOtp = (e) => {
    e.preventDefault();
    if (!phone || phone.length < 10) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep(2);
    }, 1200);
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    if (!otp || otp.length < 4) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      // Simulate successful login
      login(
        { name: "Mallaiah Raju", phone: phone, village: "Nalgonda Rural", landSize: "4.5", soilType: "Red Sandy", waterSource: "Borewell" },
        "simulated-firebase-token-xyz123"
      );
      navigate('/dashboard');
    }, 1500);
  };

  const features = [
    { title: "Smart Weather Advisory", desc: "Hyperlocal weather forecasts, rainfall predictions, and drought warning alerts.", icon: Leaf, color: "text-green-400" },
    { title: "AI Pest & Disease Detection", desc: "Upload crop leaf pictures to identify diseases and get precise treatment options.", icon: Cpu, color: "text-blue-400" },
    { title: "Market Intelligence", desc: "Daily market mandi price analysis, price trends, and selling time advice.", icon: Sparkles, color: "text-amber-400" },
    { title: "Telangana & Central Schemes", desc: "Search eligibility criteria and easily apply for state and national agricultural aids.", icon: MessageSquareCode, color: "text-purple-400" }
  ];

  return (
    <div className="min-h-screen bg-[#050b07] crt-screen crt-flicker flex flex-col text-slate-100 font-sans">
      
      {/* Background ambient glowing shapes */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-green-500/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12 flex-grow flex flex-col justify-center relative z-10">
        
        {/* Navigation Bar Header */}
        <div className="flex justify-between items-center mb-16">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-500/15 border border-green-500/40 flex items-center justify-center shadow-[0_0_15px_rgba(34,197,94,0.3)]">
              <Sprout className="w-6 h-6 text-green-400" />
            </div>
            <span className="text-2xl font-bold font-heading text-green-400 glow-text-green">{t('appName')}</span>
          </div>
        </div>

        {/* Hero split layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Hero text section */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-green-950/40 border border-green-500/30 text-xs font-mono text-green-400 tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>COMMITTED TO TELANGANA FARMERS</span>
            </div>
            
            <h1 className="text-4xl sm:text-6xl font-bold font-heading leading-tight tracking-tight text-white glow-text-green">
              {t('tagline')}
            </h1>
            
            <p className="text-lg text-slate-400 max-w-xl font-light leading-relaxed">
              Accelerate your crop yields and protect your crops from pests. Get localized weather data, live mandi prices, and smart guidance in Telugu.
            </p>

            {/* Bento details overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6">
              {features.map((f, i) => {
                const Icon = f.icon;
                return (
                  <div key={i} className="glass-panel p-5 rounded-2xl card-3d border border-green-500/10 hover:border-green-500/30">
                    <Icon className={`w-8 h-8 ${f.color} mb-3`} />
                    <h3 className="font-heading font-semibold text-slate-200 mb-1">{f.title}</h3>
                    <p className="text-xs text-slate-400 leading-normal">{f.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Authentication section */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="w-full max-w-md glass-panel p-8 rounded-3xl border border-green-500/30 shadow-[0_20px_50px_rgba(0,0,0,0.6)] card-3d relative">
              <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/5 rounded-full blur-2xl"></div>
              
              <div className="flex flex-col items-center text-center mb-6">
                <div className="w-12 h-12 rounded-full bg-green-500/10 border border-green-500/40 flex items-center justify-center mb-3">
                  <Phone className="w-6 h-6 text-green-400 animate-pulse" />
                </div>
                <h2 className="text-xl font-bold font-heading text-slate-100">{t('loginTitle')}</h2>
                <p className="text-xs text-slate-400 mt-1">Secured by Firebase Mobile Verification</p>
              </div>

              {step === 1 ? (
                /* STEP 1: Enter Phone */
                <form onSubmit={handleSendOtp} className="space-y-5">
                  <div>
                    <label className="block text-xs font-mono text-slate-400 mb-2 uppercase tracking-widest">{t('enterMobile')}</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 font-mono text-sm border-r border-green-500/20 pr-2">+91</span>
                      <input
                        type="tel"
                        maxLength="10"
                        pattern="[0-9]{10}"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                        className="w-full bg-slate-950/60 border border-green-500/20 focus:border-green-500/60 rounded-xl pl-16 pr-4 py-3 text-sm font-mono text-white outline-none tracking-widest placeholder-slate-600 transition-all focus:shadow-[0_0_15px_rgba(34,197,94,0.15)]"
                        placeholder="9876543210"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={phone.length < 10 || loading}
                    className="w-full py-3.5 px-4 bg-green-600 hover:bg-green-500 disabled:bg-green-950/40 disabled:text-slate-600 disabled:border-transparent text-slate-900 font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 border border-green-400 shadow-[0_4px_20px_rgba(34,197,94,0.3)] hover:shadow-[0_4px_25px_rgba(34,197,94,0.5)] glow-btn"
                  >
                    <span>{loading ? t('loading') : t('sendOtp')}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              ) : (
                /* STEP 2: Verify OTP */
                <form onSubmit={handleVerifyOtp} className="space-y-5">
                  <div className="bg-green-950/20 border border-green-500/10 p-3.5 rounded-xl text-center">
                    <p className="text-xs text-green-400 font-mono">OTP Sent to +91 {phone}</p>
                    <button type="button" onClick={() => setStep(1)} className="text-[10px] text-blue-400 underline mt-1 font-mono hover:text-blue-300">Change number</button>
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-slate-400 mb-2 uppercase tracking-widest">{t('enterOtp')}</label>
                    <input
                      type="text"
                      maxLength="6"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                      className="w-full bg-slate-950/60 border border-green-500/20 focus:border-green-500/60 rounded-xl px-4 py-3 text-center text-lg font-mono text-white outline-none tracking-[0.5em] placeholder-slate-600 transition-all focus:shadow-[0_0_15px_rgba(34,197,94,0.15)]"
                      placeholder="123456"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={otp.length < 4 || loading}
                    className="w-full py-3.5 px-4 bg-green-600 hover:bg-green-500 disabled:bg-green-950/40 disabled:text-slate-600 disabled:border-transparent text-slate-900 font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 border border-green-400 shadow-[0_4px_20px_rgba(34,197,94,0.3)] hover:shadow-[0_4px_25px_rgba(34,197,94,0.5)] glow-btn"
                  >
                    <span>{loading ? t('loading') : t('verifyOtp')}</span>
                    <ShieldCheck className="w-5 h-5" />
                  </button>
                </form>
              )}

              {/* Languages switch inside login */}
              <div className="mt-8 pt-6 border-t border-green-500/10 flex justify-center items-center gap-4 text-xs font-mono text-slate-400">
                <span>Language / భాష:</span>
                <div className="flex gap-2">
                  <button onClick={() => { login({ name: "Demo Farmer", phone: "9999999999" }, "demo-token"); navigate('/dashboard'); }} className="text-green-400 hover:text-green-300 underline font-semibold">Demo Access (Skip OTP)</button>
                </div>
              </div>

            </div>
          </div>

        </div>

      </div>

      {/* Footer */}
      <footer className="border-t border-green-500/10 py-6 text-center text-xs font-mono text-slate-500 relative z-10 bg-[#020503]/80">
        <p>© 2026 Krishi AI (Agricultural Advisor Project). Engineered for Telangana Farmers.</p>
      </footer>
    </div>
  );
};
