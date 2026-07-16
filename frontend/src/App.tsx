import { useState, useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { Routes, Route } from "react-router-dom";
import Canvas3D from "./components/Canvas3D";
import HeaderPanel from "./components/HeaderPanel";
import DataTablePanel, { type DataRow } from "./components/DataTablePanel";
import MetricsPanel from "./components/MetricsPanel";
import UploadPanel from "./components/UploadPanel";
import HubMenu from "./components/HubMenu";
import DiagnosticsPanel from "./components/DiagnosticsPanel";
import { Home } from "lucide-react";

const BACKEND_URL = "https://nagumo21-almp-core.hf.space";

function App() {
  const [connected, setConnected] = useState(false);
  const [latency, setLatency] = useState(0);
  const [motionScore, setMotionScore] = useState(0.0);
  const [latentVector, setLatentVector] = useState<number[]>([]);
  const [recentData, setRecentData] = useState<DataRow[]>([]);
  const fullDataLog = useRef<DataRow[]>([]);
  const [activeNodesCount, setActiveNodesCount] = useState(0);

  useEffect(() => {
    // Yerel makineye doğrudan, engelsiz bağlantı kuruluyor
    const socket: Socket = io(BACKEND_URL);

    socket.on("connect", () => {
      console.log("Connected to ALMP Core AI");
      setConnected(true);
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from ALMP Core AI");
      setConnected(false);
    });

    socket.on(
      "latent_stream",
      (dataObj: {
        motion_score: number;
        latent_vector: number[];
        node_index: number;
      }) => {
        setMotionScore(dataObj.motion_score);
        setLatentVector(dataObj.latent_vector);
        setActiveNodesCount(dataObj.node_index);

        setRecentData((prev) => {
          const newRow: DataRow = {
            id: `VAR-${dataObj.node_index.toString().padStart(4, "0")}`,
            value: dataObj.motion_score,
            timestamp: new Date().toLocaleTimeString(),
            status: dataObj.motion_score > 0.5 ? "critical" : "stable",
          };
          fullDataLog.current.push(newRow);
          return [newRow, ...prev].slice(0, 10);
        });

        setLatency(Math.floor(Math.random() * 20) + 12);
      },
    );

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleExportLog = () => {
    if (fullDataLog.current.length === 0) {
      console.warn("Dışa aktarılacak veri yok!");
      return;
    }

    const exportPayload = {
      exportDate: new Date().toISOString(),
      modelUsed: "best.pt",
      totalNodes: fullDataLog.current.length,
      data: fullDataLog.current
    };

    const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.href = url;
    link.download = `ALMP_Fingerprint_${new Date().getTime()}.json`;
    document.body.appendChild(link);
    link.click();
    
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-cyber-black text-slate-200 font-sans selection:bg-cyber-neon/30">
      
      {/* Global Top-Right Navigation Icons */}
      <div className="absolute top-6 right-8 z-[100] flex items-center gap-6">
        <a href="https://github.com/JustSuffer" target="_blank" rel="noreferrer" className="text-slate-400 hover:text-white hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.8)] transition-all duration-300 transform hover:scale-110">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>
        </a>
        <a href="https://izzetportfolio.netlify.app/" target="_blank" rel="noreferrer" className="text-slate-400 hover:text-cyber-neon hover:drop-shadow-[0_0_8px_rgba(0,229,255,0.8)] transition-all duration-300 transform hover:scale-110">
          <Home size={24} />
        </a>
      </div>

      <Canvas3D motionScore={motionScore} latentVector={latentVector} />

      <Routes>
        <Route path="/" element={<HubMenu />} />
        
        <Route path="/projection" element={
          <div className="absolute inset-0 pointer-events-none z-10">
            <div className="pointer-events-auto">
              <HeaderPanel connected={connected} />

              <MetricsPanel
                latency={latency}
                motionScore={motionScore}
                activeNodes={activeNodesCount}
              />

              <DataTablePanel data={recentData} onExport={handleExportLog} />

              <UploadPanel />
            </div>
          </div>
        } />

        <Route path="/diagnostics" element={<DiagnosticsPanel />} />
      </Routes>
    </div>
  );
}

export default App;
