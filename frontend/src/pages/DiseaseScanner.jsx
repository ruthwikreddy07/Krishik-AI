import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { ScanLine, Upload, Leaf, ShieldCheck, AlertCircle, Wrench, RefreshCw, Eye } from 'lucide-react';
import { toast } from 'react-toastify';

export const DiseaseScanner = () => {
  const [filePreview, setFilePreview] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);
  
  // Previous scans history
  const [history, setHistory] = useState([
    { date: "2026-05-18", crop: "Paddy (Rice)", disease: "Rice Blast", status: "Treated", severity: "High" },
    { date: "2026-06-01", crop: "Cotton", disease: "Healthy Leaf", status: "Normal", severity: "None" }
  ]);

  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      setFilePreview(URL.createObjectURL(file));
      setScanning(true);
      setResult(null);

      // Simulate a premium laser scan for 3.5 seconds
      setTimeout(() => {
        setScanning(false);
        const isBlast = file.name.toLowerCase().includes('blast') || Math.random() > 0.4;
        
        if (isBlast) {
          setResult({
            disease: "Rice Blast (Pyricularia oryzae)",
            cause: "Fungal pathogen aggravated by warm humid weather conditions and excess nitrogen fertilizer.",
            severity: "High (Potential 30% yield loss)",
            treatments: [
              "Foliar spray of Tricyclazole @ 0.6 grams per liter of water.",
              "Avoid top dressing of nitrogenous fertilizers during cloudy, high humidity periods.",
              "Apply silicon-based fertilizer boosters to strengthen plant cell walls."
            ],
            prevention: [
              "Use certified disease-resistant seeds (e.g. Telangana Sona).",
              "Maintain optimal field drainage to prevent stagnant moisture pooling.",
              "Ensure field residues from previous harvest are burnt or thoroughly ploughed."
            ]
          });
          toast.error("Rice Blast pathogen detected!", { theme: "dark", toastId: "disease-blast" });
        } else {
          setResult({
            disease: "Healthy Leaf",
            cause: "No detectable fungal, viral, or bacterial pathogens found. Nutrient balance looks optimal.",
            severity: "None",
            treatments: ["Continue regular weeding and moisture monitoring cycles."],
            prevention: ["Maintain current balanced NPK fertilization schedule."]
          });
          toast.success("Crop leaf diagnosed as healthy!", { theme: "dark", toastId: "disease-healthy" });
        }

        // Add to history
        setHistory(prev => [
          {
            date: new Date().toISOString().split('T')[0],
            crop: "Paddy (Rice)",
            disease: isBlast ? "Rice Blast" : "Healthy Leaf",
            status: isBlast ? "Active" : "Normal",
            severity: isBlast ? "High" : "None"
          },
          ...prev
        ]);

      }, 3500);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    multiple: false
  });

  const resetScanner = () => {
    setFilePreview(null);
    setResult(null);
    setScanning(false);
  };

  return (
    <div className="space-y-8 page-fade-in">
      
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-green-500/10 border border-green-500/40 flex items-center justify-center shadow-[0_0_15px_rgba(34,197,94,0.3)]">
          <ScanLine className="w-5 h-5 text-green-400" />
        </div>
        <div>
          <h2 className="text-2xl font-bold font-heading text-slate-100 glow-text-green">AI Crop Disease Diagnosis</h2>
          <p className="text-xs text-slate-400 mt-0.5">Upload high-resolution leaf photos to perform instant computer vision diagnosis and treatment estimation.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side: Upload & Scan Animation (6 columns) */}
        <div className="lg:col-span-6 space-y-6">
          <div className="glass-panel p-6 rounded-2xl border border-green-500/20 card-3d flex flex-col items-center justify-center min-h-[350px] relative overflow-hidden">
            
            {/* Background grids */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f2a17_1px,transparent_1px),linear-gradient(to_bottom,#0f2a17_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-30 pointer-events-none"></div>

            {!filePreview ? (
              /* Drag & Drop Zone */
              <div {...getRootProps()} className={`w-full h-full flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-8 cursor-pointer transition-all duration-300 ${isDragActive ? 'border-green-400 bg-green-500/5 shadow-[0_0_15px_rgba(34,197,94,0.1)]' : 'border-green-500/20 hover:border-green-500/40 hover:bg-green-500/5'}`}>
                <input {...getInputProps()} />
                <Upload className="w-12 h-12 text-green-400/70 mb-4 animate-bounce" />
                <h3 className="font-heading font-bold text-slate-200 text-lg">Drag & Drop Leaf Photo</h3>
                <p className="text-xs text-slate-400 mt-1 text-center max-w-xs leading-normal">
                  Drop high-quality agricultural photos or click to browse. Max size 5MB.
                </p>
                <div className="flex gap-4 mt-6">
                  <span className="text-[10px] font-mono text-green-400 bg-green-500/10 px-2 py-0.5 rounded border border-green-500/20">Supports PNG, JPG</span>
                </div>
              </div>
            ) : (
              /* Image display and laser scan animation */
              <div className="w-full relative flex flex-col items-center justify-center">
                <div className="relative rounded-xl overflow-hidden border border-green-500/30 max-h-[300px]">
                  <img src={filePreview} alt="Leaf preview" className="w-full object-contain max-h-[300px]" />
                  {scanning && (
                    <>
                      {/* Laser Line */}
                      <div className="scanner-laser"></div>
                      {/* Glow overlay */}
                      <div className="absolute inset-0 bg-green-500/10 animate-pulse"></div>
                    </>
                  )}
                </div>

                {scanning && (
                  <div className="mt-4 flex items-center gap-2 text-xs font-mono text-green-400">
                    <RefreshCw className="w-4 h-4 animate-spin text-green-400" />
                    <span className="glow-text-green uppercase tracking-widest font-bold">ANALYZING CELL PATHOLOGY...</span>
                  </div>
                )}

                {!scanning && (
                  <button
                    onClick={resetScanner}
                    className="mt-4 py-2 px-4 bg-slate-950/80 hover:bg-slate-900 border border-green-500/30 text-green-300 hover:text-green-200 text-xs font-mono rounded-xl transition-all"
                  >
                    Diagnose another leaf
                  </button>
                )}
              </div>
            )}

          </div>

          {/* Previous Scan Logs */}
          <div className="glass-panel p-6 rounded-2xl border border-green-500/20 card-3d">
            <h3 className="text-md font-bold font-heading text-slate-200 mb-4 flex items-center gap-2">
              <Eye className="w-4 h-4 text-green-400" />
              <span>Diagnostic Logs History</span>
            </h3>

            <div className="space-y-3 font-mono text-xs">
              {history.map((h, i) => (
                <div key={i} className="flex justify-between items-center bg-slate-950/30 border border-green-500/5 p-3 rounded-xl">
                  <div>
                    <span className="text-slate-500 block text-[10px]">{h.date}</span>
                    <span className="text-slate-300 font-semibold">{h.crop} — {h.disease}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${h.severity === 'High' ? 'border-red-500/30 bg-red-950/20 text-red-400' : 'border-green-500/30 bg-green-950/20 text-green-400'}`}>
                      {h.severity}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Side: Diagnosis Findings (6 columns) */}
        <div className="lg:col-span-6">
          {result ? (
            <div className="glass-panel p-6 rounded-2xl border border-green-500/20 card-3d space-y-6">
              
              {/* Diagnosis header */}
              <div className="flex justify-between items-start border-b border-green-500/10 pb-4">
                <div>
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">DIAGNOSTIC REPORT</span>
                  <h3 className="text-lg font-bold font-heading text-red-400 glow-text-green mt-1">{result.disease}</h3>
                </div>
                <div className="px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-red-500/15 border border-red-500/30 text-red-400">
                  {result.severity} SEVERITY
                </div>
              </div>

              {/* Cause */}
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400" />
                  <span>Pathogen Identification & Cause</span>
                </h4>
                <p className="text-xs text-slate-400 leading-normal">{result.cause}</p>
              </div>

              {/* Immediate actions */}
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-green-400" />
                  <span>Immediate Chemical/Biological Treatment</span>
                </h4>
                <ul className="space-y-1.5 pl-4 list-disc text-xs text-slate-400 leading-normal">
                  {result.treatments.map((t, idx) => (
                    <li key={idx}>{t}</li>
                  ))}
                </ul>
              </div>

              {/* Preventive actions */}
              <div className="space-y-2 border-t border-green-500/10 pt-4">
                <h4 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-blue-400" />
                  <span>Preventive Farming Measures</span>
                </h4>
                <ul className="space-y-1.5 pl-4 list-disc text-xs text-slate-400 leading-normal">
                  {result.prevention.map((p, idx) => (
                    <li key={idx}>{p}</li>
                  ))}
                </ul>
              </div>

            </div>
          ) : (
            <div className="glass-panel p-8 rounded-2xl border border-green-500/10 flex flex-col items-center justify-center min-h-[400px] text-center text-slate-500">
              <Leaf className="w-16 h-16 mb-4 text-green-500/20" />
              <h3 className="font-heading font-bold text-slate-400 text-lg">No Active Diagnosis</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-xs leading-normal">
                Please drag and drop or upload a crop leaf picture in the scanner terminal to generate a detailed report.
              </p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
