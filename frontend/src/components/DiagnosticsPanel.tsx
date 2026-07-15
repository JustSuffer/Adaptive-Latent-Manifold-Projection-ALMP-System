import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronDown, Activity, Terminal, UploadCloud, Cpu, Database } from 'lucide-react';

// Semantic Color Engine logic
const getLayerTheme = (type: string) => {
  const t = type.toLowerCase();
  if (t.includes('conv') || t.includes('linear') || t.includes('pool')) {
    return {
      border: 'border-cyber-blue/40',
      bg: 'bg-cyber-blue/10',
      text: 'text-cyber-blue',
      hover: 'hover:border-cyber-blue',
      badge: 'bg-cyber-blue/20 text-cyber-blue border-cyber-blue/50'
    };
  }
  if (t.includes('batchnorm') || t.includes('dropout')) {
    return {
      border: 'border-cyber-neon/40',
      bg: 'bg-cyber-neon/10',
      text: 'text-cyber-neon',
      hover: 'hover:border-cyber-neon',
      badge: 'bg-cyber-neon/20 text-cyber-neon border-cyber-neon/50'
    };
  }
  if (t.includes('relu') || t.includes('silu') || t.includes('sigmoid')) {
    return {
      border: 'border-cyber-magenta/40',
      bg: 'bg-cyber-magenta/10',
      text: 'text-cyber-magenta',
      hover: 'hover:border-cyber-magenta',
      badge: 'bg-cyber-magenta/20 text-cyber-magenta border-cyber-magenta/50'
    };
  }
  // Default
  return {
    border: 'border-slate-500/40',
    bg: 'bg-slate-500/10',
    text: 'text-slate-300',
    hover: 'hover:border-slate-400',
    badge: 'bg-slate-500/20 text-slate-300 border-slate-500/50'
  };
};

const AccordionLayer = ({ layer, index }: { layer: any, index: number }) => {
  const [isOpen, setIsOpen] = useState(false);
  const theme = getLayerTheme(layer.type);

  return (
    <div className={`mb-3 border ${theme.border} rounded-xl overflow-hidden transition-colors duration-300 ${theme.hover} bg-black/40 backdrop-blur-md`}>
      {/* Macro View (Header) */}
      <div 
        className="px-5 py-4 cursor-pointer flex items-center justify-between"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center font-mono text-xs text-slate-400">
            {index.toString().padStart(2, '0')}
          </div>
          <div>
            <h3 className="font-bold text-xs tracking-wide text-slate-200 uppercase">
              {layer.name}
            </h3>
            <div className="flex gap-2 mt-1">
              <span className={`text-[9px] uppercase tracking-widest px-2 py-0.5 border rounded-full font-mono ${theme.badge}`}>
                {layer.type}
              </span>
            </div>
          </div>
        </div>
        <div className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''} ${theme.text}`}>
          <ChevronDown size={18} />
        </div>
      </div>

      {/* Micro View (Internal Details) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="border-t border-white/5 bg-black/60"
          >
            <div className="p-5 font-mono text-xs text-slate-400 flex flex-col gap-3">
              {layer.params && Object.entries(layer.params).map(([key, value]) => (
                <div key={key} className="flex justify-between items-center border-b border-white/5 pb-2 last:border-0 last:pb-0">
                  <span className="text-slate-500">{key}:</span>
                  <span className={`text-glow ${theme.text}`}>{String(value)}</span>
                </div>
              ))}
              
              {layer.weights && (
                <div className="mt-2 p-3 bg-black/80 rounded-lg border border-white/5">
                  <div className="flex items-center gap-2 mb-2">
                    <Terminal size={12} className="text-slate-500" />
                    <span className="text-[10px] text-slate-500 uppercase tracking-widest">Weight Tensor Matrix</span>
                  </div>
                  <div className={`text-glow ${theme.text} text-[10px]`}>
                    ⟨ {layer.weights.shape.join(' × ')} ⟩ 
                    <span className="text-slate-600 ml-2">({layer.weights.total.toLocaleString()} p)</span>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const DiagnosticsPanel: React.FC = () => {
  const navigate = useNavigate();
  // 0: Awaiting Matrix (Idle/Upload), 1: Parsing Protocol (Processing), 2: Anatomical Render (Active Diagnostics)
  const [diagnosticState, setDiagnosticState] = useState<0 | 1 | 2>(0);
  const [loadingText, setLoadingText] = useState("Initializing ONNX Protocol...");
  const [isDragging, setIsDragging] = useState(false);

  // Mock data removed, using real ONNX parser data

  const [diagnosticData, setDiagnosticData] = useState<any[]>([]);

  const triggerUpload = async (file?: File) => {
    if (!file) return;

    setDiagnosticState(1);
    setLoadingText("Uploading Matrix...");

    const formData = new FormData();
    formData.append("model", file);

    try {
      setLoadingText("Extracting Tensors & Translating to ONNX Blueprint...");
      const response = await fetch("https://nagumo21-almp-core.hf.space/api/diagnostics/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Backend connection failed");
      }

      setLoadingText("Parsing Neural Architecture...");
      const result = await response.json();

      if (result.status === "success" && result.blueprint) {
        setDiagnosticData(result.blueprint);
      } else {
        throw new Error(result.error || "Unknown parsing error");
      }

      setDiagnosticState(2);
    } catch (err) {
      console.error(err);
      alert("Diagnostic Failed: " + (err as Error).message);
      setDiagnosticState(0);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      triggerUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      triggerUpload(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  return (
    <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden">
      
      {/* Absolute Back Button (Always accessible) */}
      <div className="absolute top-8 left-8 pointer-events-auto">
        <button 
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-slate-400 hover:text-white transition-colors bg-black/40 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 hover:border-white/30"
        >
          <ChevronLeft size={16} /> Return to Hub
        </button>
      </div>

      <AnimatePresence mode="wait">
        
        {/* STATE 0: Awaiting Matrix (Upload) */}
        {diagnosticState === 0 && (
          <motion.div 
            key="state0"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.5 }}
            className="w-full h-full flex flex-col items-center justify-center pointer-events-auto"
          >
            <div className="mb-10 text-center">
              <h2 className="text-3xl font-bold tracking-[0.3em] uppercase text-white shadow-cyber-magenta drop-shadow-[0_0_15px_rgba(255,0,85,0.6)] mb-4">
                Neural Blueprint Diagnostics
              </h2>
              <p className="text-sm font-mono text-slate-400 tracking-widest uppercase">
                Awaiting Model Tensor Matrix (.pt, .onnx, .h5)
              </p>
            </div>

            <div 
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => document.getElementById("diagnostic-file-input")?.click()}
              className={`w-[600px] h-[300px] border-2 border-dashed rounded-3xl flex flex-col items-center justify-center cursor-pointer transition-all duration-500 bg-black/40 backdrop-blur-xl
                ${isDragging ? 'border-cyber-neon bg-cyber-neon/10' : 'border-slate-700 hover:border-cyber-neon/50 hover:bg-white/5'}
              `}
            >
              <div className={`p-4 rounded-full mb-6 transition-colors duration-500 ${isDragging ? 'bg-cyber-neon text-black' : 'bg-white/5 text-slate-400'}`}>
                <UploadCloud size={48} />
              </div>
              <h3 className="text-lg text-slate-200 font-mono tracking-widest uppercase mb-2">Drop Architecture File</h3>
              <p className="text-xs text-slate-500 font-mono">or click to browse local matrix</p>
              
              <input 
                id="diagnostic-file-input"
                type="file" 
                className="hidden"
                accept=".pt,.onnx,.h5"
                onChange={handleFileInput}
              />
            </div>
          </motion.div>
        )}

        {/* STATE 1: Parsing Protocol (Processing) */}
        {diagnosticState === 1 && (
          <motion.div 
            key="state1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full h-full flex flex-col items-center justify-center pointer-events-auto"
          >
            <div className="relative flex items-center justify-center mb-8">
              {/* Glowing Rings */}
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                className="absolute w-32 h-32 rounded-full border-t-2 border-cyber-neon opacity-50"
              />
              <motion.div 
                animate={{ rotate: -360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                className="absolute w-24 h-24 rounded-full border-b-2 border-cyber-magenta opacity-80"
              />
              <Cpu size={32} className="text-white animate-pulse" />
            </div>
            
            <div className="font-mono text-sm tracking-widest uppercase text-cyber-neon text-glow flex items-center gap-3">
              <Terminal size={16} />
              {loadingText}
              <motion.span 
                animate={{ opacity: [0, 1, 0] }} 
                transition={{ duration: 0.8, repeat: Infinity }}
              >_</motion.span>
            </div>
          </motion.div>
        )}

        {/* STATE 2: Anatomical Render (HUD Sidebar) */}
        {diagnosticState === 2 && (
          <motion.div 
            key="state2"
            initial={{ x: 400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="absolute top-0 right-0 h-full w-[450px] bg-black/60 backdrop-blur-2xl border-l border-white/10 pointer-events-auto flex flex-col shadow-[-10px_0_30px_rgba(0,229,255,0.1)]"
          >
            {/* Sidebar Header */}
            <div className="px-8 py-8 border-b border-white/10 bg-gradient-to-b from-white/5 to-transparent">
              <div className="flex items-center gap-3 mb-6">
                <Database size={18} className="text-cyber-neon text-glow" />
                <span className="text-xs font-mono uppercase tracking-widest text-cyber-neon">Anatomical X-Ray Active</span>
              </div>
              <h2 className="text-2xl font-bold tracking-widest uppercase text-white shadow-cyber-magenta drop-shadow-[0_0_10px_rgba(255,0,85,0.4)] mb-3">
                Neural Blueprint
              </h2>
              <div className="flex items-center gap-4 text-[10px] font-mono text-slate-500 uppercase tracking-widest">
                <span>Model: <span className="text-slate-300">Uploaded Matrix</span></span>
                <span>•</span>
                <span>Layers: <span className="text-slate-300">{diagnosticData.length}</span></span>
              </div>
            </div>

            {/* Sidebar Content (Scrollable) */}
            <div className="flex-1 overflow-y-auto px-6 py-6 custom-scrollbar">
              {diagnosticData.map((layer, idx) => (
                <AccordionLayer key={idx} layer={layer} index={idx} />
              ))}
              
              <div className="mt-8 text-center text-[10px] text-slate-600 font-mono uppercase tracking-widest flex items-center justify-center gap-2">
                <Activity size={12} />
                End of Architecture Stream
              </div>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
};

export default DiagnosticsPanel;
