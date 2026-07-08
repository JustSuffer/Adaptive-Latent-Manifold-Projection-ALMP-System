import { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import Canvas3D from './components/Canvas3D';
import HeaderPanel from './components/HeaderPanel';
import DataTablePanel, { type DataRow } from './components/DataTablePanel';
import MetricsPanel from './components/MetricsPanel';
import UploadPanel from './components/UploadPanel';

const BACKEND_URL = "https://nagumo21-almp-core.hf.space";

function App() {
  const [connected, setConnected] = useState(false);
  const [latency, setLatency] = useState(0); // Optional: Could implement a real ping/pong here
  const [motionScore, setMotionScore] = useState(0.0);
  const [latentVector, setLatentVector] = useState<number[]>([]);
  const [recentData, setRecentData] = useState<DataRow[]>([]);
  const [activeNodesCount, setActiveNodesCount] = useState(0);

  useEffect(() => {
    // 1. Establish Socket Connection
    const socket: Socket = io(BACKEND_URL);

    socket.on("connect", () => {
      console.log("Connected to ALMP Core AI");
      setConnected(true);
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from ALMP Core AI");
      setConnected(false);
    });

    // 2. Listen to the Real-Time Stream
    socket.on("latent_stream", (dataObj: { motion_score: number, latent_vector: number[], node_index: number }) => {
      // Update Core Metrics
      setMotionScore(dataObj.motion_score);
      setLatentVector(dataObj.latent_vector);
      setActiveNodesCount(dataObj.node_index); // For visual scale, tracking how many nodes processed

      // Update Data Table
      setRecentData(prev => {
        const newRow: DataRow = {
          id: `VAR-${dataObj.node_index.toString().padStart(4, '0')}`,
          value: dataObj.motion_score,
          timestamp: new Date().toLocaleTimeString(),
          status: dataObj.motion_score > 0.5 ? 'critical' : 'stable'
        };
        return [newRow, ...prev].slice(0, 10); // Keep max 10 rows
      });

      // Simulate a small random network latency purely for visual aesthetics 
      // (Could be replaced with real socket pinging later)
      setLatency(Math.floor(Math.random() * 20) + 12);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-cyber-black text-slate-200 font-sans selection:bg-cyber-neon/30">
      
      {/* 3D Background */}
      <Canvas3D motionScore={motionScore} latentVector={latentVector} />
      
      {/* UI Overlay */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Child components with pointer-events-auto can be interacted with */}
        <div className="pointer-events-auto">
          <HeaderPanel connected={connected} />
          
          <MetricsPanel 
            latency={latency} 
            motionScore={motionScore} 
            activeNodes={activeNodesCount} 
          />
          
          <DataTablePanel data={recentData} />
          
          <UploadPanel />
        </div>
      </div>
      
    </div>
  );
}

export default App;
