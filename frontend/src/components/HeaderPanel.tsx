import React from 'react';
import { motion } from 'framer-motion';
import { Network, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface HeaderPanelProps {
  connected: boolean;
}

const HeaderPanel: React.FC<HeaderPanelProps> = ({ connected }) => {
  const navigate = useNavigate();

  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="absolute top-4 left-4 right-4 md:top-6 md:left-6 md:right-auto md:w-96 glass-panel rounded-2xl p-4 md:p-6 z-10"
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold tracking-widest text-slate-100 uppercase">
              ALMP<span className="text-cyber-neon font-light">SYS</span>
            </h1>
            <div className="px-2 py-0.5 rounded text-[10px] font-mono border border-cyber-magenta/30 bg-cyber-magenta/10 text-cyber-magenta uppercase tracking-widest">
              Live Build
            </div>
          </div>
          <h2 className="text-xs text-slate-400 uppercase tracking-[0.3em]">
            Topological Latent Projection
          </h2>
        </div>
        
        <div className="flex flex-col items-end gap-1">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full shadow-[0_0_8px_currentColor] ${connected ? 'bg-cyber-neon text-cyber-neon animate-pulse-fast' : 'bg-red-500 text-red-500'}`}></span>
            <span className={`text-[10px] font-mono tracking-widest uppercase ${connected ? 'text-cyber-neon' : 'text-red-400'}`}>
              {connected ? 'Sync Active' : 'Offline'}
            </span>
          </div>
          <div className="flex items-center gap-1 text-slate-500">
            <Network size={12} />
            <span className="text-[10px] font-mono">WSS://CORE</span>
          </div>
        </div>
      </div>
      
      <div className="mt-6 pt-4 border-t border-white/5 flex gap-4">
        <button 
          onClick={() => navigate('/')}
          className="glass-button text-xs font-mono uppercase tracking-widest px-4 py-2 rounded text-slate-400 hover:text-white flex items-center gap-2"
        >
          <ChevronLeft size={14} /> Hub
        </button>
        <button className="glass-button text-xs font-mono uppercase tracking-widest px-4 py-2 rounded text-slate-300">
          Target Cluster
        </button>
        <button className="glass-button text-xs font-mono uppercase tracking-widest px-4 py-2 rounded text-cyber-neon border-cyber-neon/30 bg-cyber-neon/5">
          Run Diagnostic
        </button>
      </div>
    </motion.div>
  );
};

export default HeaderPanel;
