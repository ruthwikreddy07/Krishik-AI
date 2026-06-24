import React, { useState, useEffect, useContext } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { adminGetAllDiseaseRecords, adminVerifyDiseaseRecord } from '../services/api';
import { toast } from 'react-toastify';
import { 
  ScanLine, CheckCircle2, AlertCircle, Wrench, ShieldCheck, 
  LogOut, Eye, ClipboardCheck, MessageSquare, Leaf
} from 'lucide-react';

export const ExpertDashboard = () => {
  const { logout, user } = useContext(AppContext);
  const navigate = useNavigate();

  const [diseaseRecords, setDiseaseRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedScan, setSelectedScan] = useState(null);
  const [comments, setComments] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [imageError, setImageError] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const recordsData = await adminGetAllDiseaseRecords();
      setDiseaseRecords(recordsData);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load system records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedScan) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    setImageError(false);
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [selectedScan]);

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!comments.trim()) {
      toast.error('Please input expert recommendation comments');
      return;
    }
    setVerifying(true);
    try {
      await adminVerifyDiseaseRecord(selectedScan.id, comments);
      toast.success('Diagnosis verified & recommendation saved! 🌿');
      setSelectedScan(null);
      setComments('');
      // Reload records to refresh table
      const updatedRecords = await adminGetAllDiseaseRecords();
      setDiseaseRecords(updatedRecords);
    } catch (err) {
      console.error(err);
      toast.error('Failed to verify disease record.');
    } finally {
      setVerifying(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  // Stats calculation
  const totalScans = diseaseRecords.length;
  const pendingScans = diseaseRecords.filter(r => !r.verified_by_expert).length;
  const verifiedScans = diseaseRecords.filter(r => r.verified_by_expert).length;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4" style={{ fontFamily: 'var(--font-body)' }}>
        <div className="w-16 h-16 rounded-2xl bg-green-500/10 border border-green-500/30 flex items-center justify-center animate-pulse">
          <ShieldCheck className="w-8 h-8 text-green-400" />
        </div>
        <p className="text-slate-400 font-mono text-sm">Loading Expert Workspace...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 page-fade-in" style={{ fontFamily: 'var(--font-body)' }}>
      
      {/* Expert Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-green-950/40 to-slate-950/40 p-6 rounded-2xl border border-green-500/20 glass-panel">
        <div>
          <h2 className="text-2xl font-bold font-heading text-slate-100 glow-text-green">Agronomist Console — {user?.name || 'Expert'}</h2>
          <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5 font-mono">
            <ShieldCheck className="w-3.5 h-3.5 text-green-400" />
            <span>EXPERT REVIEW WORKSPACE • role: {user?.role || 'expert'}</span>
          </p>
        </div>
        <button 
          onClick={handleLogout}
          className="py-2.5 px-4 bg-red-950/20 hover:bg-red-950/40 text-red-400 hover:text-red-300 border border-red-500/20 rounded-xl transition-all text-xs font-semibold flex items-center gap-2"
        >
          <LogOut className="w-4 h-4" />
          <span>Exit System</span>
        </button>
      </div>

      {/* Overview Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* Total Scans */}
        <div className="glass-panel p-5 rounded-2xl border border-green-500/10 flex items-center gap-4 card-3d">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center">
            <ScanLine className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <span className="block text-[10px] font-mono text-slate-500 uppercase tracking-wider">Total Scans Submitted</span>
            <span className="text-2xl font-bold font-heading text-slate-200">{totalScans}</span>
          </div>
        </div>

        {/* Pending Verifications */}
        <div className="glass-panel p-5 rounded-2xl border border-green-500/10 flex items-center gap-4 card-3d">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
            <AlertCircle className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <span className="block text-[10px] font-mono text-slate-500 uppercase tracking-wider">Scans Awaiting Review</span>
            <span className="text-2xl font-bold font-heading text-amber-400">{pendingScans}</span>
          </div>
        </div>

        {/* Verified Scans */}
        <div className="glass-panel p-5 rounded-2xl border border-green-500/10 flex items-center gap-4 card-3d">
          <div className="w-12 h-12 rounded-xl bg-green-500/10 border border-green-500/30 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5 text-green-400" />
          </div>
          <div>
            <span className="block text-[10px] font-mono text-slate-500 uppercase tracking-wider">Scans Verified by You</span>
            <span className="text-2xl font-bold font-heading text-slate-200">{verifiedScans}</span>
          </div>
        </div>

      </div>

      {/* Disease Scans Board */}
      <h3 className="text-lg font-bold font-heading text-slate-200 border-b border-green-500/10 pb-3 flex items-center gap-2">
        <ScanLine className="w-5 h-5 text-green-400" />
        <span>Leaf Pathology Review Queue</span>
      </h3>

      <div className="glass-panel rounded-2xl border border-green-500/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-950/60 border-b border-green-500/15 font-mono text-slate-400 uppercase text-[10px] tracking-wider">
                <th className="p-4">Date</th>
                <th className="p-4">Farmer ID</th>
                <th className="p-4">Diagnosis</th>
                <th className="p-4">Confidence</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-green-500/5">
              {diseaseRecords.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-slate-500 font-mono">No leaf scans recorded in database.</td>
                </tr>
              ) : diseaseRecords.map((record) => {
                const dateStr = new Date(record.created_at).toLocaleDateString('en-IN', { hour: '2-digit', minute: '2-digit' });
                return (
                  <tr key={record.id} className="hover:bg-slate-950/20 transition-all">
                    <td className="p-4 font-mono text-slate-400">{dateStr}</td>
                    <td className="p-4 font-mono text-slate-300">Farmer #{record.farmer_id}</td>
                    <td className="p-4 font-semibold text-slate-200">{record.detected_disease}</td>
                    <td className="p-4 font-mono text-slate-300">{record.confidence}%</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                        record.verified_by_expert 
                          ? 'border-green-500/30 bg-green-950/20 text-green-400' 
                          : 'border-amber-500/30 bg-amber-950/20 text-amber-500'
                      }`}>
                        {record.verified_by_expert ? 'VERIFIED' : 'PENDING REVIEW'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => setSelectedScan(record)}
                        className="py-1.5 px-3 bg-slate-900 hover:bg-slate-850 border border-green-500/20 text-green-400 hover:text-green-300 rounded-lg transition-all flex items-center gap-1.5 inline-flex align-middle"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Review</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: EXPERT PATHOLOGY REVIEW & COMMENTS */}
      {selectedScan && createPortal(
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="glass-panel border border-green-500/30 max-w-3xl w-full rounded-3xl p-5 relative overflow-hidden flex flex-col max-h-[90vh]">
            <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/5 rounded-full blur-2xl pointer-events-none"></div>

            {/* Modal Header */}
            <div className="flex justify-between items-start border-b border-green-500/10 pb-3 mb-3">
              <div>
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">Expert Verification Workflow</span>
                <h3 className="text-base font-bold font-heading text-slate-200 mt-0.5">Review Report #{selectedScan.id}</h3>
              </div>
              <button 
                onClick={() => { setSelectedScan(null); setComments(''); }}
                className="text-slate-400 hover:text-slate-200 font-mono text-sm"
              >
                ✕
              </button>
            </div>

            {/* Modal Content Scroll Area */}
            <div className="space-y-4 overflow-y-auto pr-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Left side: Uploaded leaf image */}
                <div className="relative rounded-xl overflow-hidden border border-green-500/20 h-40 flex items-center justify-center bg-slate-950/40">
                  {!imageError ? (
                    <img 
                      src={selectedScan.image_url.startsWith('http') ? selectedScan.image_url : `https://krishik-ai-backend.onrender.com${selectedScan.image_url}`} 
                      alt="Uploaded crop leaf pathology" 
                      className="h-full object-contain w-full"
                      onError={(e) => {
                        if (e.target.src.includes('krishik-ai-backend.onrender.com')) {
                          e.target.src = `/api${selectedScan.image_url}`;
                        } else {
                          setImageError(true);
                        }
                      }}
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-slate-500 font-mono text-[10px] gap-2 p-4 text-center">
                      <Leaf className="w-8 h-8 text-slate-600 animate-pulse" />
                      <span>Original Leaf Image Unavailable<br/>(Ephemeral Server Storage)</span>
                    </div>
                  )}
                </div>

                {/* Right side: Parameters */}
                <div className="space-y-3 flex flex-col justify-between">
                  
                  {/* Info Panel */}
                  <div className="bg-slate-950/40 p-3 rounded-xl border border-green-500/5 font-mono text-[11px] space-y-1">
                    <div><span className="text-slate-500">DIAGNOSTIC LAB:</span> <span className="text-slate-200">{selectedScan.detected_disease}</span></div>
                    <div><span className="text-slate-500">CONFIDENCE:</span> <span className="text-green-400 font-semibold">{selectedScan.confidence}%</span></div>
                    <div><span className="text-slate-500">FARMER:</span> <span className="text-slate-200">Farmer ID #{selectedScan.farmer_id}</span></div>
                    <div><span className="text-slate-500">SUBMITTED ON:</span> <span className="text-slate-200">{new Date(selectedScan.created_at).toLocaleString('en-IN')}</span></div>
                  </div>

                  {/* Recommendations */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                      <Wrench className="w-3.5 h-3.5 text-green-400" />
                      <span>Immediate Chemical/Biological Treatment</span>
                    </span>
                    <p className="text-[11px] text-slate-400 leading-normal">{selectedScan.treatment_recommendation || 'Follow standard treatment protocols.'}</p>
                  </div>

                  {/* Verified Details */}
                  {selectedScan.verified_by_expert && (
                    <div className="border border-green-500/20 bg-green-950/20 p-2.5 rounded-xl flex gap-2 items-start">
                      <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="text-[10px] font-bold text-green-400 uppercase tracking-wider block">Already Verified</span>
                        <p className="text-[11px] text-slate-300 mt-0.5 italic font-sans">"{selectedScan.expert_comments}"</p>
                      </div>
                    </div>
                  )}

                </div>
              </div>

              {/* Input Form */}
              {!selectedScan.verified_by_expert && (
                <form onSubmit={handleVerify} className="space-y-3 border-t border-green-500/10 pt-3">
                  <div>
                    <label className="block text-[10px] font-mono text-slate-400 mb-1.5 uppercase tracking-widest">
                      Expert Advice & Action Verification Comments
                    </label>
                    <textarea
                      rows="2"
                      value={comments}
                      onChange={(e) => setComments(e.target.value)}
                      placeholder="e.g. Confirmed early blight pattern. Apply Chlorothalonil or Mancozeb fungicide spray immediately."
                      className="w-full bg-slate-950/60 border border-green-500/20 focus:border-green-500/60 rounded-xl px-3 py-2 text-xs font-sans text-white outline-none transition-all focus:shadow-[0_0_15px_rgba(34,197,94,0.15)]"
                    ></textarea>
                  </div>
                  
                  <div className="flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => { setSelectedScan(null); setComments(''); }}
                      className="py-2 px-4 bg-slate-950 border border-green-500/10 hover:bg-slate-900 text-slate-400 text-xs font-bold rounded-xl transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={verifying}
                      className="py-2 px-5 bg-green-600 hover:bg-green-500 text-slate-900 font-bold rounded-xl transition-all duration-305 flex items-center justify-center gap-2 border border-green-400 shadow-[0_4px_15px_rgba(34,197,94,0.2)]"
                    >
                      <ClipboardCheck className="w-4 h-4" />
                      <span>{verifying ? 'Submitting...' : 'Verify Diagnosis'}</span>
                    </button>
                  </div>
                </form>
              )}

            </div>
          </div>
        </div>,
        document.body
      )}

    </div>
  );
};
