import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { staffLogin } from '../services/api';
import { toast } from 'react-toastify';
import { ShieldCheck, Mail, Lock, RefreshCw, Sprout } from 'lucide-react';

export const AdminLogin = () => {
  const { login } = useContext(AppContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter both email and password');
      return;
    }
    setLoading(true);
    try {
      const data = await staffLogin(email, password);
      // data: { access_token, token_type, staff_id, role, name }
      login(
        {
          id: data.staff_id,
          name: data.name,
          role: data.role,
          email: email,
        },
        data.access_token
      );
      toast.success(`Welcome back, ${data.name}! 🌾`);
      if (data.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/expert/dashboard');
      }
    } catch (err) {
      const detail = err.response?.data?.detail || 'Authentication failed. Please check your credentials.';
      toast.error(detail);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden" style={{ background: 'var(--bg-primary)', fontFamily: 'var(--font-body)' }}>
      {/* Ambient background glows */}
      <div className="glow-blob-green" style={{ width: '400px', height: '400px', top: '-100px', left: '-100px', opacity: 0.4 }} />
      <div className="glow-blob-blue" style={{ width: '400px', height: '400px', bottom: '-100px', right: '-100px', opacity: 0.4 }} />

      <div className="max-w-md w-full mx-4 relative z-10">
        
        {/* Logo / Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4" style={{ background: 'linear-gradient(135deg, #059669, #10b981)', boxShadow: '0 0 20px rgba(16,185,129,0.4)' }}>
            <Sprout className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-3xl font-extrabold font-heading text-slate-100 glow-text-green">Krishik AI</h2>
          <p className="text-xs text-slate-400 mt-2 font-mono uppercase tracking-widest">Administrative Staff Portal</p>
        </div>

        {/* Login Card */}
        <div className="glass-panel p-8 rounded-3xl border border-green-500/20 card-3d relative">
          <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/5 rounded-full blur-2xl pointer-events-none"></div>

          <h3 className="text-lg font-bold font-heading text-slate-200 mb-6 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-green-400" />
            <span>Staff Sign In</span>
          </h3>

          <form onSubmit={handleLogin} className="space-y-6">
            
            {/* Email Address */}
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-2 uppercase tracking-widest">Email Address</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@gmail.com"
                  className="w-full bg-slate-950/60 border border-green-500/20 focus:border-green-500/60 rounded-xl pl-11 pr-4 py-3 text-sm font-sans text-white outline-none transition-all focus:shadow-[0_0_15px_rgba(34,197,94,0.15)]"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-2 uppercase tracking-widest">Security Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-950/60 border border-green-500/20 focus:border-green-500/60 rounded-xl pl-11 pr-4 py-3 text-sm font-sans text-white outline-none transition-all focus:shadow-[0_0_15px_rgba(34,197,94,0.15)]"
                />
              </div>
            </div>

            {/* Login Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-green-600 hover:bg-green-500 text-slate-900 font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 border border-green-400 shadow-[0_4px_20px_rgba(34,197,94,0.25)] hover:shadow-[0_4px_25px_rgba(34,197,94,0.4)] glow-btn"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Verifying Credentials...</span>
                  </>
                ) : (
                  <span>Verify and Login</span>
                )}
              </button>
            </div>

          </form>

          {/* Footer Info */}
          <div className="mt-6 text-center text-[10px] text-slate-500 font-mono">
            This is a secure system. Access restricted to authorized agronomy experts and portal administrators only.
          </div>

        </div>

      </div>
    </div>
  );
};
