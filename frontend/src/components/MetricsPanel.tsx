import React from 'react';
import { motion } from 'framer-motion';
import { Activity, Zap, Cpu } from 'lucide-react';

interface MetricsPanelProps {
  latency: number;
  motionScore: number;
  activeNodes: number;
}

const MetricsPanel: React.FC<MetricsPanelProps> = ({ latency, motionScore, activeNodes }) => {
  const isStatic = motionScore < 0.1;

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
      className="absolute top-6 right-6 w-80 glass-panel rounded-2xl p-6 z-10 flex flex-col gap-6"
    >
      <div>
        <h3 className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold mb-4">
          System Metrics
        </h3>
        <div className="flex flex-col gap-5">
          
          {/* Active Nodes */}
          <div className="flex items-center justify-between group">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/5 rounded-lg group-hover:bg-cyber-blue/10 transition-colors">
                <Cpu size={16} className="text-cyber-blue" />
              </div>
              <span className="text-sm font-medium text-slate-300">Cluster Size</span>
            </div>
            <span className="text-lg font-mono text-slate-100">{activeNodes.toLocaleString()}</span>
          </div>

          {/* Latency */}
          <div className="flex items-center justify-between group">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/5 rounded-lg group-hover:bg-cyber-gold/10 transition-colors">
                <Zap size={16} className="text-cyber-gold" />
              </div>
              <span className="text-sm font-medium text-slate-300">Network Latency</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-mono text-slate-100">{latency}</span>
              <span className="text-[10px] font-mono text-slate-500">ms</span>
            </div>
          </div>

          {/* Motion Score */}
          <div className="flex flex-col gap-3 group">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/5 rounded-lg group-hover:bg-cyber-neon/10 transition-colors">
                  <Activity size={16} className={isStatic ? 'text-cyber-magenta' : 'text-cyber-neon'} />
                </div>
                <span className="text-sm font-medium text-slate-300">Manifold Variance</span>
              </div>
              <span className="text-lg font-mono text-slate-100">{motionScore.toFixed(3)}</span>
            </div>
            
            <div className="h-1.5 w-full bg-slate-800/50 rounded-full overflow-hidden relative">
              <div 
                className={`absolute top-0 left-0 h-full transition-all duration-500 ease-out shadow-[0_0_10px_currentColor] ${isStatic ? 'bg-cyber-magenta text-cyber-magenta' : 'bg-cyber-neon text-cyber-neon'}`}
                style={{ width: `${Math.min(100, Math.max(0, motionScore * 100))}%` }}
              ></div>
            </div>
            
            {isStatic && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-1 text-[10px] text-cyber-magenta font-mono text-center bg-cyber-magenta/10 py-1.5 rounded border border-cyber-magenta/30 uppercase tracking-widest animate-pulse-fast text-glow"
              >
                Static Regime / Intervention
              </motion.div>
            )}
          </div>

        </div>
      </div>
    </motion.div>
  );
};

export default MetricsPanel;
