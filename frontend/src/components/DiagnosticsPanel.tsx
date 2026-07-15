import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronDown, Activity, Terminal } from 'lucide-react';

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
            <h3 className="font-bold text-sm tracking-wide text-slate-200 uppercase">
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
                  <div className={`text-glow ${theme.text}`}>
                    ⟨ {layer.weights.shape.join(' × ')} ⟩ 
                    <span className="text-slate-600 ml-2">({layer.weights.total.toLocaleString()} params)</span>
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

  // Mock YOLO Blueprint JSON for UI perfection
  const mockBlueprint = [
    { name: "Input Layer", type: "Conv2d", params: { in_channels: 3, out_channels: 32, kernel_size: 3, stride: 1 }, weights: { shape: [32, 3, 3, 3], total: 864 } },
    { name: "Stabilizer", type: "BatchNorm2d", params: { num_features: 32, eps: "1e-05", momentum: 0.1 } },
    { name: "Activation Core", type: "SiLU", params: { inplace: true } },
    { name: "Feature Extractor 1", type: "Conv2d", params: { in_channels: 32, out_channels: 64, kernel_size: 3, stride: 2 }, weights: { shape: [64, 32, 3, 3], total: 18432 } },
    { name: "Stabilizer", type: "BatchNorm2d", params: { num_features: 64, eps: "1e-05", momentum: 0.1 } },
    { name: "Bottleneck Process", type: "Conv2d", params: { in_channels: 64, out_channels: 64, kernel_size: 1, stride: 1 }, weights: { shape: [64, 64, 1, 1], total: 4096 } },
    { name: "Activation Core", type: "SiLU", params: { inplace: true } },
    { name: "Detection Head", type: "Linear", params: { in_features: 64, out_features: 10, bias: true }, weights: { shape: [10, 64], total: 640 } },
  ];

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col p-4 md:p-8 z-20">
      <div className="pointer-events-auto">
        
        {/* Navigation & Header */}
        <div className="flex items-center justify-between mb-8">
          <button 
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-slate-400 hover:text-white transition-colors bg-black/40 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 hover:border-white/30"
          >
            <ChevronLeft size={16} /> Return to Hub
          </button>
          
          <div className="flex items-center gap-3 bg-black/40 backdrop-blur-md px-5 py-2 rounded-xl border border-white/5">
            <Activity size={14} className="text-cyber-neon" />
            <span className="text-[10px] font-mono uppercase tracking-widest text-cyber-neon">Anatomical X-Ray Active</span>
          </div>
        </div>

        {/* Diagnostics Workspace */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full max-w-2xl mx-auto"
        >
          <div className="mb-6 flex flex-col gap-2">
            <h2 className="text-3xl font-bold tracking-widest uppercase text-white shadow-cyber-magenta drop-shadow-[0_0_10px_rgba(255,0,85,0.4)]">
              Neural Blueprint
            </h2>
            <div className="flex items-center gap-4 text-xs font-mono text-slate-500 uppercase tracking-widest">
              <span>Model: <span className="text-slate-300">best.pt</span></span>
              <span>•</span>
              <span>Architecture: <span className="text-slate-300">YOLOv8-Custom</span></span>
            </div>
          </div>

          <div className="h-[65vh] overflow-y-auto pr-2 custom-scrollbar">
            {mockBlueprint.map((layer, idx) => (
              <AccordionLayer key={idx} layer={layer} index={idx} />
            ))}
          </div>
        </motion.div>

      </div>
    </div>
  );
};

export default DiagnosticsPanel;
