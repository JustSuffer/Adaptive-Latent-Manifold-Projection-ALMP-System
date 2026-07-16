import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Box, Fingerprint, FileText, X } from 'lucide-react';

const HubMenu: React.FC = () => {
  const navigate = useNavigate();
  const [showManifesto, setShowManifesto] = useState(false);

  return (
    <div className="absolute inset-0 pointer-events-auto flex items-center justify-center z-50 bg-cyber-black/40 backdrop-blur-sm overflow-hidden">
      
      <div className="flex flex-col items-center gap-12 w-full max-w-5xl px-8 z-10 h-full overflow-y-auto py-12 custom-scrollbar">
        
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.0 }}
          className="text-center mt-12 shrink-0"
        >
          <h1 className="text-5xl font-bold tracking-[0.3em] text-slate-100 uppercase mb-4 shadow-cyber-neon drop-shadow-[0_0_15px_rgba(0,229,255,0.5)]">
            ALMP<span className="text-cyber-neon font-light">SYS</span>
          </h1>
          <p className="text-xs text-slate-400 uppercase tracking-[0.4em]">
            Adaptive Latent Manifold Projection
          </p>
        </motion.div>

        <div className="flex flex-col gap-8 w-full shrink-0 mb-20">
          
          <div className="flex flex-col md:flex-row gap-8 w-full">
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

          {/* Module 3: System Manifesto (About) */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            onClick={() => setShowManifesto(true)}
            className="w-full group cursor-pointer"
          >
            <div className="h-32 glass-panel rounded-2xl p-6 border border-white/10 hover:border-cyber-gold/50 hover:bg-cyber-gold/5 transition-all duration-500 flex items-center justify-between relative overflow-hidden">
              <div className="absolute inset-0 bg-cyber-gold/5 rounded-full blur-3xl group-hover:bg-cyber-gold/10 transition-all duration-700 opacity-0 group-hover:opacity-100"></div>
              
              <div className="flex items-center gap-6 relative z-10">
                <div className="p-3 bg-white/5 rounded-xl w-fit group-hover:scale-110 group-hover:text-cyber-gold transition-all duration-300">
                  <FileText size={28} />
                </div>
                <div>
                  <h2 className="text-xl font-bold uppercase tracking-widest text-slate-200 group-hover:text-white mb-1">
                    System Manifesto
                  </h2>
                  <p className="text-xs text-slate-500 font-mono">
                    Demystifying High-Dimensional Neural Architectures
                  </p>
                </div>
              </div>
              
              <div className="text-[10px] text-cyber-gold font-mono uppercase tracking-widest flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 relative z-10">
                <span className="w-8 h-[1px] bg-cyber-gold"></span>
                Read Documentation
              </div>
            </div>
          </motion.div>

        </div>
      </div>

      {/* MANIFESTO MODAL */}
      <AnimatePresence>
        {showManifesto && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 md:p-8"
          >
            <motion.div 
              initial={{ y: 50, opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 50, opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="w-full max-w-4xl max-h-[90vh] glass-panel border border-cyber-gold/30 rounded-2xl flex flex-col shadow-[0_0_50px_rgba(251,191,36,0.1)] overflow-hidden"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-white/10 bg-black/40 shrink-0">
                <div>
                  <h2 className="text-xl font-bold tracking-widest uppercase text-cyber-gold text-glow mb-1">
                    The ALMP Ecosystem
                  </h2>
                  <p className="text-xs font-mono text-slate-400 tracking-widest uppercase">
                    System Architecture & Philosophy
                  </p>
                </div>
                <button 
                  onClick={() => setShowManifesto(false)}
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-transparent hover:border-white/20 transition-all"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-8 overflow-y-auto custom-scrollbar text-sm leading-relaxed text-slate-300 space-y-8">
                
                {/* Abstract */}
                <section>
                  <h3 className="text-lg font-bold text-white uppercase tracking-widest mb-3 flex items-center gap-3">
                    <span className="w-4 h-[2px] bg-cyber-gold"></span> Abstract
                  </h3>
                  <p className="text-slate-400 font-mono text-xs leading-6">
                    As Deep Learning (DL) models and Convolutional Neural Networks (CNNs) scale in complexity, their internal decision-making processes have become increasingly opaque. This "black box" phenomenon poses a critical bottleneck, particularly in high-stakes domains such as medical image analysis (e.g., Alzheimer's classification, brain tumor localization), where architectural transparency is as vital as predictive accuracy. The <strong className="text-cyber-gold font-sans font-bold">Adaptive Latent Manifold Projection (ALMP)</strong> system is an advanced diagnostic ecosystem engineered to resolve this interpretability crisis. By unifying real-time behavioral observation with universal structural dissection, ALMP transforms abstract tensor operations and multi-dimensional latent spaces into observable, geometric realities.
                  </p>
                </section>

                <hr className="border-white/5" />

                {/* Section 1 */}
                <section>
                  <h3 className="text-lg font-bold text-white uppercase tracking-widest mb-3 flex items-center gap-3">
                    <span className="text-cyber-gold font-mono">1.</span> The Interpretability Crisis
                  </h3>
                  <p className="mb-3">
                    Modern computer vision architectures, from sequential classifiers to advanced object detection frameworks like YOLO, operate by mapping high-dimensional inputs into complex latent spaces. While these mathematical manifolds excel at extracting hierarchical features, they offer zero intrinsic visibility to the developer. When a model misclassifies a critical anomaly, traditional terminal logs provide insufficient diagnostic context.
                  </p>
                  <p className="p-4 bg-white/5 rounded-lg border border-white/10 font-mono text-xs text-slate-400">
                    ALMP was conceptualized to bridge the gap between raw computational mathematics and human cognitive intuition. It achieves this through a dual-engine architecture designed to analyze both the <span className="text-cyber-neon">behavior</span> of the data stream and the <span className="text-cyber-magenta">anatomy</span> of the network itself.
                  </p>
                </section>

                {/* Section 2 */}
                <section>
                  <h3 className="text-lg font-bold text-white uppercase tracking-widest mb-3 flex items-center gap-3">
                    <span className="text-cyber-gold font-mono">2.</span> Behavioral Observation: Topological Projection
                  </h3>
                  <p className="mb-4">
                    The first pillar of the ALMP ecosystem addresses the dynamic execution of the model. During live inference, data propagates through the network, generating highly abstract multidimensional tensors.
                  </p>
                  <p className="mb-4">
                    The ALMP projection engine acts as a real-time visualization bridge. It captures these high-dimensional latent vectors (<span className="font-mono text-cyber-neon">v ∈ ℝⁿ</span>) and projects them into a navigable 3D topological space (<span className="font-mono text-cyber-neon">f: ℝⁿ → ℝ³</span>).
                  </p>
                  <ul className="list-disc pl-5 space-y-3 text-slate-400 font-mono text-xs">
                    <li><strong className="text-slate-200 font-sans uppercase">Dynamic Metric Tracking:</strong> The system continuously monitors network latency, manifold variance, and topological cluster sizes.</li>
                    <li><strong className="text-slate-200 font-sans uppercase">Paradigm Adaptability:</strong> The rendering engine is strictly engineered to handle structural deviations in outputs. While standard classification models yield flat arrays, Object Detection models return complex matrices. ALMP normalizes these disparate data shapes, seamlessly converting spatial detection bounds into active photon bursts within the 3D topology.</li>
                  </ul>
                </section>

                <hr className="border-white/5" />

                {/* Section 3 */}
                <section>
                  <h3 className="text-lg font-bold text-white uppercase tracking-widest mb-3 flex items-center gap-3">
                    <span className="text-cyber-gold font-mono">3.</span> Structural Dissection: ONNX Parsing Protocol
                  </h3>
                  <p className="mb-4">
                    Observing the output is insufficient if the underlying architecture remains obscured. The <strong className="text-cyber-magenta">Neural Blueprint Diagnostics</strong> module serves as the anatomical X-ray of the ALMP system.
                  </p>
                  <p className="mb-4">
                    The primary engineering challenge in structural analysis is framework fragmentation. To achieve universal compatibility without introducing computational bloat, ALMP utilizes the <strong className="text-white">Open Neural Network Exchange (ONNX)</strong> protocol as its foundational parsing engine.
                  </p>
                  <ul className="list-disc pl-5 space-y-3 text-slate-400 font-mono text-xs">
                    <li><strong className="text-slate-200 font-sans uppercase">Headless Translation:</strong> When a proprietary architecture file (.pt, .h5) is ingested, the backend dynamically exports and parses the computational graph.</li>
                    <li><strong className="text-slate-200 font-sans uppercase">Node-Level Granularity:</strong> The system extracts the absolute truth of the network's topology, rendering every operation (e.g., <span className="text-cyber-blue">Conv2d</span>, <span className="text-cyber-magenta">SiLU</span>) into a structured JSON payload.</li>
                  </ul>
                </section>

                {/* Section 4 */}
                <section>
                  <h3 className="text-lg font-bold text-white uppercase tracking-widest mb-3 flex items-center gap-3">
                    <span className="text-cyber-gold font-mono">4.</span> Cognitive Ergonomics in Diagnostic UI
                  </h3>
                  <p className="mb-4">
                    To prevent information overload, ALMP introduces a specialized UI/UX architecture tailored for scientific visualization.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
                      <h4 className="font-bold text-white mb-2 text-xs uppercase tracking-wider">Progressive Disclosure</h4>
                      <p className="text-xs text-slate-400 font-mono">Deep technical parameters are encapsulated. Hyper-specific structural parameters are accessed via fluid, on-demand accordion expansions.</p>
                    </div>
                    <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
                      <h4 className="font-bold text-white mb-2 text-xs uppercase tracking-wider">Semantic Rendering</h4>
                      <p className="text-xs text-slate-400 font-mono">Network layers are categorically color-coded, allowing engineers to "read" the structural integrity of a model instantaneously.</p>
                    </div>
                    <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
                      <h4 className="font-bold text-white mb-2 text-xs uppercase tracking-wider">Holographic HUD</h4>
                      <p className="text-xs text-slate-400 font-mono">The interface abandons sterile backgrounds in favor of an immersive glassmorphism HUD, maintaining spatial awareness.</p>
                    </div>
                  </div>
                </section>

                {/* Section 5 */}
                <section className="p-6 bg-cyber-gold/10 border border-cyber-gold/30 rounded-xl text-center">
                  <h3 className="text-xl font-bold text-cyber-gold uppercase tracking-widest mb-4">
                    5. Conclusion
                  </h3>
                  <p className="text-slate-300 font-medium">
                    The ALMP ecosystem represents a fundamental paradigm shift in MLOps and Model Debugging. It rejects the premise that neural networks must remain impenetrable black boxes.
                  </p>
                  <p className="mt-4 text-white font-bold uppercase tracking-widest text-glow shadow-cyber-gold">
                    The laboratory is online.
                  </p>
                </section>

              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default HubMenu;
