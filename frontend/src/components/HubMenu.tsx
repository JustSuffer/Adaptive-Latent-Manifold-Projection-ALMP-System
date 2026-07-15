import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Box, Fingerprint } from 'lucide-react';

const HubMenu: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="absolute inset-0 pointer-events-auto flex items-center justify-center z-50 bg-cyber-black/40 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-12">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.0 }}
          className="text-center"
        >
          <h1 className="text-5xl font-bold tracking-[0.3em] text-slate-100 uppercase mb-4 shadow-cyber-neon drop-shadow-[0_0_15px_rgba(0,229,255,0.5)]">
            ALMP<span className="text-cyber-neon font-light">SYS</span>
          </h1>
          <p className="text-xs text-slate-400 uppercase tracking-[0.4em]">
            Adaptive Latent Manifold Projection
          </p>
        </motion.div>

        <div className="flex flex-col md:flex-row gap-8 w-full max-w-4xl px-8">
          
          {/* Module 1: Topological Projection */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            onClick={() => navigate('/projection')}
            className="flex-1 group cursor-pointer"
          >
            <div className="h-64 glass-panel rounded-2xl p-8 border border-white/10 hover:border-cyber-neon/50 hover:bg-cyber-neon/5 transition-all duration-500 flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-cyber-neon/10 rounded-full blur-3xl group-hover:bg-cyber-neon/20 transition-all duration-700"></div>
              
              <div>
                <div className="p-3 bg-white/5 rounded-xl w-fit mb-4 group-hover:scale-110 group-hover:text-cyber-neon transition-all duration-300">
                  <Box size={28} />
                </div>
                <h2 className="text-xl font-bold uppercase tracking-widest text-slate-200 group-hover:text-white mb-2">
                  Topological Projection
                </h2>
                <p className="text-xs text-slate-500 font-mono">
                  Live 3D Canvas / ZMQ Data Stream / Real-time Latent Inference
                </p>
              </div>
              
              <div className="text-[10px] text-cyber-neon font-mono uppercase tracking-widest flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <span className="w-8 h-[1px] bg-cyber-neon"></span>
                Initialize Module
              </div>
            </div>
          </motion.div>

          {/* Module 2: Neural Blueprint (Diagnostics) */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            onClick={() => navigate('/diagnostics')}
            className="flex-1 group cursor-pointer"
          >
            <div className="h-64 glass-panel rounded-2xl p-8 border border-white/10 hover:border-cyber-magenta/50 hover:bg-cyber-magenta/5 transition-all duration-500 flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 left-0 w-32 h-32 bg-cyber-magenta/10 rounded-full blur-3xl group-hover:bg-cyber-magenta/20 transition-all duration-700"></div>
              
              <div>
                <div className="p-3 bg-white/5 rounded-xl w-fit mb-4 group-hover:scale-110 group-hover:text-cyber-magenta transition-all duration-300">
                  <Fingerprint size={28} />
                </div>
                <h2 className="text-xl font-bold uppercase tracking-widest text-slate-200 group-hover:text-white mb-2">
                  Neural Blueprint
                </h2>
                <p className="text-xs text-slate-500 font-mono">
                  Anatomical X-Ray / Model Architecture Diagnostics / Semantic Weight Inspection
                </p>
              </div>
              
              <div className="text-[10px] text-cyber-magenta font-mono uppercase tracking-widest flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <span className="w-8 h-[1px] bg-cyber-magenta"></span>
                Initialize Module
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
};

export default HubMenu;
