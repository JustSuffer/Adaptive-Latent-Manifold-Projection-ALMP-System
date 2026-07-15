import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface DataRow {
  id: string;
  value: number;
  timestamp: string;
  status: 'critical' | 'stable';
}

interface DataTablePanelProps {
  data: DataRow[];
  onExport?: () => void;
}

const DataTablePanel: React.FC<DataTablePanelProps> = ({ data, onExport }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
      className="hidden lg:block absolute bottom-6 left-6 w-[450px] glass-panel rounded-2xl overflow-hidden z-10"
    >
      <div className="px-6 py-4 border-b border-white/5 bg-white/5 backdrop-blur-md">
        <h3 className="text-xs text-slate-300 uppercase tracking-[0.2em] font-semibold">
          Live Inference Feed
        </h3>
      </div>
      
      <div className="p-2">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-[9px] text-slate-500 uppercase tracking-widest border-b border-white/5">
              <th className="font-normal px-4 py-3">Timestamp</th>
              <th className="font-normal px-4 py-3">Vector ID</th>
              <th className="font-normal px-4 py-3 text-right">Motion Value</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {data.map((row) => (
                <motion.tr 
                  initial={{ opacity: 0, y: -10, backgroundColor: "rgba(255,255,255,0.05)" }}
                  animate={{ opacity: 1, y: 0, backgroundColor: "rgba(255,255,255,0.0)" }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  whileHover={{ backgroundColor: "rgba(255,255,255,0.05)" }}
                  transition={{ duration: 0.3 }}
                  key={row.id + row.timestamp} 
                  className="text-xs font-mono border-b border-white/5 last:border-0 cursor-crosshair"
                >
                  <td className="px-4 py-3 text-slate-400">{row.timestamp}</td>
                  <td className="px-4 py-3">
                    <span className="text-cyber-blue">▸ {row.id}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className={`${row.status === 'critical' ? 'text-cyber-magenta text-glow' : 'text-cyber-neon text-glow'}`}>
                      {row.value.toFixed(4)}
                    </span>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
      
      <div className="px-6 py-3 border-t border-white/5 flex justify-between items-center bg-black/20">
        <span className="text-[10px] text-slate-500 font-mono">Updating continuously via WSS</span>
        <button 
          onClick={onExport}
          className="text-[10px] text-cyber-magenta hover:text-white transition-colors uppercase tracking-widest font-mono"
        >
          Export Log
        </button>
      </div>
    </motion.div>
  );
};

export default DataTablePanel;
