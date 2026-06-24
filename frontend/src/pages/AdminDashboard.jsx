import React, { useState, useEffect, useContext } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { 
  adminGetAllDiseaseRecords, 
  adminVerifyDiseaseRecord, 
  adminGetAllFarmers,
  getSchemes,
  adminCreateScheme,
  adminUpdateScheme,
  adminDeleteScheme
} from '../services/api';
import { toast } from 'react-toastify';
import { 
  Users, ScanLine, CheckCircle2, AlertCircle, Wrench, ShieldCheck, 
  MapPin, LogOut, Eye, MessageSquare, ClipboardCheck, ArrowRight, Table,
  Plus, Edit, Trash2, FileText
} from 'lucide-react';

export const AdminDashboard = () => {
  const { logout, user } = useContext(AppContext);
  const navigate = useNavigate();

  const [farmers, setFarmers] = useState([]);
  const [diseaseRecords, setDiseaseRecords] = useState([]);
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('scans'); // 'scans' | 'farmers' | 'schemes'
  
  // Scan review state
  const [selectedScan, setSelectedScan] = useState(null);
  const [comments, setComments] = useState('');
  const [verifying, setVerifying] = useState(false);

  // Scheme modal state
  const [selectedScheme, setSelectedScheme] = useState(null); // 'new' | scheme object | null
  const [schemeForm, setSchemeForm] = useState({
    title: '',
    description: '',
    eligibility_criteria: '',
    benefits: '',
    scheme_type: 'State',
    authority: 'Telangana Government',
    documents: '',
    min_land_acres: '',
    max_land_acres: '',
    min_age: '',
    max_age: '',
    allowed_caste: 'All'
  });
  const [submittingScheme, setSubmittingScheme] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [farmersData, recordsData, schemesData] = await Promise.all([
        adminGetAllFarmers(),
        adminGetAllDiseaseRecords(),
        getSchemes()
      ]);
      setFarmers(farmersData);
      setDiseaseRecords(recordsData);
      setSchemes(schemesData);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load system data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedScan || selectedScheme) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [selectedScan, selectedScheme]);

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!comments.trim()) {
      toast.error('Please input expert recommendation comments');
      return;
    }
    setVerifying(true);
    try {
      await adminVerifyDiseaseRecord(selectedScan.id, comments);
      toast.success('Disease diagnosis verified successfully! 🌿');
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

  // Scheme Handlers
  const handleOpenAddScheme = () => {
    setSelectedScheme('new');
    setSchemeForm({
      title: '',
      description: '',
      eligibility_criteria: '',
      benefits: '',
      scheme_type: 'State',
      authority: 'Telangana Government',
      documents: '',
      min_land_acres: '',
      max_land_acres: '',
      min_age: '',
      max_age: '',
      allowed_caste: 'All'
    });
  };

  const handleOpenEditScheme = (scheme) => {
    setSelectedScheme(scheme);
    setSchemeForm({
      title: scheme.title || '',
      description: scheme.description || '',
      eligibility_criteria: scheme.eligibility_criteria || '',
      benefits: scheme.benefits || '',
      scheme_type: scheme.scheme_type || 'State',
      authority: scheme.authority || '',
      documents: scheme.documents || '',
      min_land_acres: scheme.min_land_acres !== null && scheme.min_land_acres !== undefined ? scheme.min_land_acres : '',
      max_land_acres: scheme.max_land_acres !== null && scheme.max_land_acres !== undefined ? scheme.max_land_acres : '',
      min_age: scheme.min_age !== null && scheme.min_age !== undefined ? scheme.min_age : '',
      max_age: scheme.max_age !== null && scheme.max_age !== undefined ? scheme.max_age : '',
      allowed_caste: scheme.allowed_caste || 'All'
    });
  };

  const handleSchemeSubmit = async (e) => {
    e.preventDefault();
    if (!schemeForm.title.trim() || !schemeForm.description.trim()) {
      toast.error('Please fill in title and description');
      return;
    }
    setSubmittingScheme(true);
    
    // Parse numeric fields and caste for backend validation
    const payload = {
      ...schemeForm,
      min_land_acres: schemeForm.min_land_acres === '' ? null : parseFloat(schemeForm.min_land_acres),
      max_land_acres: schemeForm.max_land_acres === '' ? null : parseFloat(schemeForm.max_land_acres),
      min_age: schemeForm.min_age === '' ? null : parseInt(schemeForm.min_age),
      max_age: schemeForm.max_age === '' ? null : parseInt(schemeForm.max_age),
    };

    try {
      if (selectedScheme === 'new') {
        await adminCreateScheme(payload);
        toast.success('Government scheme created successfully! 🌾');
      } else {
        await adminUpdateScheme(selectedScheme.id, payload);
        toast.success('Government scheme updated successfully! 🌿');
      }
      setSelectedScheme(null);
      // Reload schemes
      const schemesData = await getSchemes();
      setSchemes(schemesData);
    } catch (err) {
      console.error(err);
      toast.error('Failed to save government scheme.');
    } finally {
      setSubmittingScheme(false);
    }
  };

  const handleDeleteScheme = async (schemeId) => {
    if (!window.confirm('Are you sure you want to delete this government scheme?')) return;
    try {
      await adminDeleteScheme(schemeId);
      toast.success('Government scheme deleted successfully.');
      // Reload schemes
      const schemesData = await getSchemes();
      setSchemes(schemesData);
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete government scheme.');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  // Stats calculation
  const totalFarmers = farmers.length;
  const totalScans = diseaseRecords.length;
  const pendingScans = diseaseRecords.filter(r => !r.verified_by_expert).length;
  const verifiedScans = diseaseRecords.filter(r => r.verified_by_expert).length;
  const verificationRate = totalScans > 0 ? ((verifiedScans / totalScans) * 100).toFixed(0) : '0';

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4" style={{ fontFamily: 'var(--font-body)' }}>
        <div className="w-16 h-16 rounded-2xl bg-green-500/10 border border-green-500/30 flex items-center justify-center animate-pulse">
          <ShieldCheck className="w-8 h-8 text-green-400" />
        </div>
        <p className="text-slate-400 font-mono text-sm">Synchronizing Admin Panel...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 page-fade-in" style={{ fontFamily: 'var(--font-body)' }}>
      
      {/* Admin Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-green-950/40 to-slate-950/40 p-6 rounded-2xl border border-green-500/20 glass-panel">
        <div>
          <h2 className="text-2xl font-bold font-heading text-slate-100 glow-text-green">Admin Portal — {user?.name || 'Administrator'}</h2>
          <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5 font-mono">
            <ShieldCheck className="w-3.5 h-3.5 text-green-400" />
            <span>SYSTEM CONSOLE • role: {user?.role || 'admin'}</span>
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Farmers */}
        <div className="glass-panel p-5 rounded-2xl border border-green-500/10 flex items-center gap-4 card-3d">
          <div className="w-12 h-12 rounded-xl bg-green-500/10 border border-green-500/30 flex items-center justify-center">
            <Users className="w-5 h-5 text-green-400" />
          </div>
          <div>
            <span className="block text-[10px] font-mono text-slate-500 uppercase tracking-wider">Total Farmers</span>
            <span className="text-2xl font-bold font-heading text-slate-200">{totalFarmers}</span>
          </div>
        </div>

        {/* Total Scans */}
        <div className="glass-panel p-5 rounded-2xl border border-green-500/10 flex items-center gap-4 card-3d">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center">
            <ScanLine className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <span className="block text-[10px] font-mono text-slate-500 uppercase tracking-wider">Total Scans</span>
            <span className="text-2xl font-bold font-heading text-slate-200">{totalScans}</span>
          </div>
        </div>

        {/* Pending Verifications */}
        <div className="glass-panel p-5 rounded-2xl border border-green-500/10 flex items-center gap-4 card-3d">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
            <AlertCircle className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <span className="block text-[10px] font-mono text-slate-500 uppercase tracking-wider">Pending Review</span>
            <span className="text-2xl font-bold font-heading text-amber-400">{pendingScans}</span>
          </div>
        </div>

        {/* Verification Rate */}
        <div className="glass-panel p-5 rounded-2xl border border-green-500/10 flex items-center gap-4 card-3d">
          <div className="w-12 h-12 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5 text-teal-400" />
          </div>
          <div>
            <span className="block text-[10px] font-mono text-slate-500 uppercase tracking-wider">Verification Rate</span>
            <span className="text-2xl font-bold font-heading text-slate-200">{verificationRate}%</span>
          </div>
        </div>

      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-green-500/10 gap-6">
        <button 
          onClick={() => setActiveTab('scans')}
          className={`pb-3 text-sm font-semibold font-heading transition-all ${
            activeTab === 'scans' ? 'text-green-400 border-b-2 border-green-400' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Leaf Disease Reports ({totalScans})
        </button>
        <button 
          onClick={() => setActiveTab('farmers')}
          className={`pb-3 text-sm font-semibold font-heading transition-all ${
            activeTab === 'farmers' ? 'text-green-400 border-b-2 border-green-400' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Registered Farmers Directory ({totalFarmers})
        </button>
        <button 
          onClick={() => setActiveTab('schemes')}
          className={`pb-3 text-sm font-semibold font-heading transition-all ${
            activeTab === 'schemes' ? 'text-green-400 border-b-2 border-green-400' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Government Schemes ({schemes.length})
        </button>
      </div>

      {/* Tab Panels */}
      {activeTab === 'scans' && (
        /* TABLE: DISEASE SCANS */
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
      )}

      {activeTab === 'farmers' && (
        /* TABLE: REGISTERED FARMERS */
        <div className="glass-panel rounded-2xl border border-green-500/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-950/60 border-b border-green-500/15 font-mono text-slate-400 uppercase text-[10px] tracking-wider">
                  <th className="p-4">ID</th>
                  <th className="p-4">Name</th>
                  <th className="p-4">Phone</th>
                  <th className="p-4">Village</th>
                  <th className="p-4">Land Size</th>
                  <th className="p-4">Soil Type</th>
                  <th className="p-4">Water Source</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-green-500/5">
                {farmers.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="p-8 text-center text-slate-500 font-mono">No farmers registered in database.</td>
                  </tr>
                ) : farmers.map((f) => (
                  <tr key={f.id} className="hover:bg-slate-950/20 transition-all">
                    <td className="p-4 font-mono text-slate-500">#{f.id}</td>
                    <td className="p-4 font-bold text-slate-200">{f.name}</td>
                    <td className="p-4 font-mono text-slate-300">{f.mobile_number}</td>
                    <td className="p-4 text-slate-300">{f.village}, {f.district}</td>
                    <td className="p-4 text-green-400 font-mono font-semibold">{f.land_size_acres} Acres</td>
                    <td className="p-4 text-slate-400 font-mono">{f.soil_type}</td>
                    <td className="p-4 text-blue-400 font-mono">{f.water_source}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'schemes' && (
        /* PANEL: GOVERNMENT SCHEMES */
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-slate-950/20 p-4 rounded-xl border border-green-500/10">
            <div>
              <h3 className="text-base font-bold font-heading text-slate-200">Manage Schemes</h3>
              <p className="text-xs text-slate-400 mt-0.5">Add, edit, or delete dynamic agricultural benefits database entries.</p>
            </div>
            <button
              onClick={handleOpenAddScheme}
              className="py-2 px-4 bg-green-600 hover:bg-green-500 text-slate-900 font-bold rounded-xl text-xs transition-all flex items-center gap-1.5 border border-green-400 shadow-[0_4px_15px_rgba(34,197,94,0.2)]"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Scheme</span>
            </button>
          </div>
          
          <div className="glass-panel rounded-2xl border border-green-500/10 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-950/60 border-b border-green-500/15 font-mono text-slate-400 uppercase text-[10px] tracking-wider">
                    <th className="p-4">Title</th>
                    <th className="p-4">Authority</th>
                    <th className="p-4">Type</th>
                    <th className="p-4">Benefits</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-green-500/5">
                  {schemes.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="p-8 text-center text-slate-500 font-mono">No schemes registered in database.</td>
                    </tr>
                  ) : schemes.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-950/20 transition-all">
                      <td className="p-4 font-bold text-slate-200">{s.title}</td>
                      <td className="p-4 text-slate-300 font-mono">{s.authority || 'N/A'}</td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                          s.scheme_type === 'State' 
                            ? 'border-green-500/30 bg-green-950/20 text-green-400' 
                            : 'border-blue-500/30 bg-blue-950/20 text-blue-400'
                        }`}>
                          {s.scheme_type.toUpperCase()}
                        </span>
                      </td>
                      <td className="p-4 text-slate-300 font-mono">{s.benefits}</td>
                      <td className="p-4 text-right space-x-2">
                        <button
                          onClick={() => handleOpenEditScheme(s)}
                          className="py-1.5 px-3 bg-slate-900 hover:bg-slate-850 border border-green-500/20 text-green-400 hover:text-green-300 rounded-lg transition-all inline-flex align-middle gap-1 items-center"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => handleDeleteScheme(s.id)}
                          className="py-1.5 px-3 bg-slate-900 hover:bg-red-950/40 border border-red-500/20 text-red-400 hover:text-red-300 rounded-lg transition-all inline-flex align-middle gap-1 items-center"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: SCAN EXPERT REVIEW & VERIFICATION */}
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

            {/* Modal Content Area */}
            <div className="space-y-4 overflow-y-auto pr-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Left side: Uploaded leaf image */}
                <div className="relative rounded-xl overflow-hidden border border-green-500/20 h-40 flex items-center justify-center bg-slate-950/40">
                  <img 
                    src={selectedScan.image_url.startsWith('http') ? selectedScan.image_url : `https://krishik-ai-backend.onrender.com${selectedScan.image_url}`} 
                    alt="Uploaded crop leaf pathology" 
                    className="h-full object-contain w-full"
                    onError={(e) => {
                      e.target.src = `/api${selectedScan.image_url}`;
                    }}
                  />
                </div>

                {/* Right side: Diagnosis parameters */}
                <div className="space-y-3 flex flex-col justify-between">
                  
                  {/* Diagnosis Details */}
                  <div className="bg-slate-950/40 p-3 rounded-xl border border-green-500/5 font-mono text-[11px] space-y-1">
                    <div><span className="text-slate-500">DIAGNOSTIC LAB:</span> <span className="text-slate-200">{selectedScan.detected_disease}</span></div>
                    <div><span className="text-slate-500">CONFIDENCE:</span> <span className="text-green-400 font-semibold">{selectedScan.confidence}%</span></div>
                    <div><span className="text-slate-500">FARMER:</span> <span className="text-slate-200">Farmer ID #{selectedScan.farmer_id}</span></div>
                    <div><span className="text-slate-500">SUBMITTED ON:</span> <span className="text-slate-200">{new Date(selectedScan.created_at).toLocaleString('en-IN')}</span></div>
                  </div>

                  {/* Recommendation details */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                      <Wrench className="w-3.5 h-3.5 text-green-400" />
                      <span>Immediate Chemical/Biological Treatment</span>
                    </span>
                    <p className="text-[11px] text-slate-400 leading-normal">{selectedScan.treatment_recommendation || 'Follow standard treatment protocols.'}</p>
                  </div>

                  {/* Expert Verification Status */}
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

              {/* Verification Form (only if not verified or admin wants to update) */}
              {(!selectedScan.verified_by_expert || user?.role === 'admin') && (
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

      {/* MODAL: ADD/EDIT SCHEME */}
      {selectedScheme && createPortal(
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="glass-panel border border-green-500/30 max-w-2xl w-full rounded-3xl p-6 relative overflow-hidden flex flex-col max-h-[90vh]">
            <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/5 rounded-full blur-2xl pointer-events-none"></div>

            {/* Modal Header */}
            <div className="flex justify-between items-start border-b border-green-500/10 pb-4 mb-4">
              <div>
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">Government Schemes Management</span>
                <h3 className="text-lg font-bold font-heading text-slate-200 mt-1">
                  {selectedScheme === 'new' ? 'Add New Government Scheme' : `Edit Scheme`}
                </h3>
              </div>
              <button 
                onClick={() => setSelectedScheme(null)}
                className="text-slate-400 hover:text-slate-200 font-mono text-sm"
              >
                ✕
              </button>
            </div>

            {/* Modal Content Form */}
            <form onSubmit={handleSchemeSubmit} className="space-y-4 overflow-y-auto pr-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1.5 uppercase tracking-widest">Scheme Title</label>
                  <input
                    type="text"
                    required
                    value={schemeForm.title}
                    onChange={(e) => setSchemeForm({...schemeForm, title: e.target.value})}
                    placeholder="e.g. Rythu Bandhu"
                    className="w-full bg-slate-950/60 border border-green-500/20 focus:border-green-500/60 rounded-xl px-4 py-2.5 text-xs text-white outline-none transition-all focus:shadow-[0_0_15px_rgba(34,197,94,0.15)]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1.5 uppercase tracking-widest">Authority</label>
                  <input
                    type="text"
                    required
                    value={schemeForm.authority}
                    onChange={(e) => setSchemeForm({...schemeForm, authority: e.target.value})}
                    placeholder="e.g. Telangana Government"
                    className="w-full bg-slate-950/60 border border-green-500/20 focus:border-green-500/60 rounded-xl px-4 py-2.5 text-xs text-white outline-none transition-all focus:shadow-[0_0_15px_rgba(34,197,94,0.15)]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1.5 uppercase tracking-widest">Scheme Type</label>
                  <select
                    value={schemeForm.scheme_type}
                    onChange={(e) => setSchemeForm({...schemeForm, scheme_type: e.target.value})}
                    className="w-full bg-slate-950/60 border border-green-500/20 focus:border-green-500/60 rounded-xl px-4 py-2.5 text-xs text-white outline-none transition-all focus:shadow-[0_0_15px_rgba(34,197,94,0.15)]"
                  >
                    <option value="State" className="bg-slate-950">State (Telangana)</option>
                    <option value="Central" className="bg-slate-950">Central</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1.5 uppercase tracking-widest">Subsidy / Benefits</label>
                  <input
                    type="text"
                    required
                    value={schemeForm.benefits}
                    onChange={(e) => setSchemeForm({...schemeForm, benefits: e.target.value})}
                    placeholder="e.g. Rs. 10,000 per acre per year"
                    className="w-full bg-slate-950/60 border border-green-500/20 focus:border-green-500/60 rounded-xl px-4 py-2.5 text-xs text-white outline-none transition-all focus:shadow-[0_0_15px_rgba(34,197,94,0.15)]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1.5 uppercase tracking-widest">Description</label>
                <textarea
                  rows="3"
                  required
                  value={schemeForm.description}
                  onChange={(e) => setSchemeForm({...schemeForm, description: e.target.value})}
                  placeholder="Summarize the core purpose and details of the investment support..."
                  className="w-full bg-slate-950/60 border border-green-500/20 focus:border-green-500/60 rounded-xl px-4 py-2.5 text-xs text-white outline-none transition-all focus:shadow-[0_0_15px_rgba(34,197,94,0.15)]"
                ></textarea>
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1.5 uppercase tracking-widest">Eligibility Criteria</label>
                <textarea
                  rows="2"
                  required
                  value={schemeForm.eligibility_criteria}
                  onChange={(e) => setSchemeForm({...schemeForm, eligibility_criteria: e.target.value})}
                  placeholder="e.g. Must own agricultural land in Telangana. Land records must be updated..."
                  className="w-full bg-slate-950/60 border border-green-500/20 focus:border-green-500/60 rounded-xl px-4 py-2.5 text-xs text-white outline-none transition-all focus:shadow-[0_0_15px_rgba(34,197,94,0.15)]"
                ></textarea>
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1.5 uppercase tracking-widest">Required Documents (Comma-separated)</label>
                <textarea
                  rows="2"
                  value={schemeForm.documents}
                  onChange={(e) => setSchemeForm({...schemeForm, documents: e.target.value})}
                  placeholder="e.g. Pattadar Dharani Passbook, Aadhaar Card, Bank Account Details"
                  className="w-full bg-slate-950/60 border border-green-500/20 focus:border-green-500/60 rounded-xl px-4 py-2.5 text-xs text-white outline-none transition-all focus:shadow-[0_0_15px_rgba(34,197,94,0.15)]"
                ></textarea>
              </div>

              {/* Dynamic Eligibility Rules Section */}
              <div className="border-t border-green-500/10 pt-4 space-y-4">
                <h4 className="text-xs font-mono font-bold text-green-400 uppercase tracking-widest">
                  Dynamic Eligibility Rules
                </h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono text-slate-400 mb-1.5 uppercase tracking-widest">Min Land size (Acres)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={schemeForm.min_land_acres}
                      onChange={(e) => setSchemeForm({...schemeForm, min_land_acres: e.target.value})}
                      placeholder="e.g. 0.1 (Leave blank if none)"
                      className="w-full bg-slate-950/60 border border-green-500/20 focus:border-green-500/60 rounded-xl px-4 py-2.5 text-xs text-white outline-none transition-all focus:shadow-[0_0_15px_rgba(34,197,94,0.15)]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono text-slate-400 mb-1.5 uppercase tracking-widest">Max Land size (Acres)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={schemeForm.max_land_acres}
                      onChange={(e) => setSchemeForm({...schemeForm, max_land_acres: e.target.value})}
                      placeholder="e.g. 5.0 (Leave blank if none)"
                      className="w-full bg-slate-950/60 border border-green-500/20 focus:border-green-500/60 rounded-xl px-4 py-2.5 text-xs text-white outline-none transition-all focus:shadow-[0_0_15px_rgba(34,197,94,0.15)]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-mono text-slate-400 mb-1.5 uppercase tracking-widest">Min Age</label>
                    <input
                      type="number"
                      value={schemeForm.min_age}
                      onChange={(e) => setSchemeForm({...schemeForm, min_age: e.target.value})}
                      placeholder="e.g. 18"
                      className="w-full bg-slate-950/60 border border-green-500/20 focus:border-green-500/60 rounded-xl px-4 py-2.5 text-xs text-white outline-none transition-all focus:shadow-[0_0_15px_rgba(34,197,94,0.15)]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono text-slate-400 mb-1.5 uppercase tracking-widest">Max Age</label>
                    <input
                      type="number"
                      value={schemeForm.max_age}
                      onChange={(e) => setSchemeForm({...schemeForm, max_age: e.target.value})}
                      placeholder="e.g. 59"
                      className="w-full bg-slate-950/60 border border-green-500/20 focus:border-green-500/60 rounded-xl px-4 py-2.5 text-xs text-white outline-none transition-all focus:shadow-[0_0_15px_rgba(34,197,94,0.15)]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono text-slate-400 mb-1.5 uppercase tracking-widest">Allowed Social Category</label>
                    <select
                      value={schemeForm.allowed_caste}
                      onChange={(e) => setSchemeForm({...schemeForm, allowed_caste: e.target.value})}
                      className="w-full bg-slate-950/60 border border-green-500/20 focus:border-green-500/60 rounded-xl px-4 py-2.5 text-xs text-white outline-none transition-all focus:shadow-[0_0_15px_rgba(34,197,94,0.15)]"
                    >
                      <option value="All" className="bg-slate-950">All Categories</option>
                      <option value="General" className="bg-slate-950">General / OBC</option>
                      <option value="SC" className="bg-slate-950">Scheduled Caste (SC)</option>
                      <option value="ST" className="bg-slate-950">Scheduled Tribe (ST)</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-green-500/10">
                <button
                  type="button"
                  onClick={() => setSelectedScheme(null)}
                  className="py-2 px-4 bg-slate-950 border border-green-500/10 hover:bg-slate-900 text-slate-400 text-xs font-bold rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingScheme}
                  className="py-2 px-6 bg-green-600 hover:bg-green-500 text-slate-900 font-bold rounded-xl transition-all duration-305 flex items-center justify-center gap-2 border border-green-400 shadow-[0_4px_15px_rgba(34,197,94,0.2)]"
                >
                  <span>{submittingScheme ? 'Saving...' : 'Save Scheme'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

    </div>
  );
};
