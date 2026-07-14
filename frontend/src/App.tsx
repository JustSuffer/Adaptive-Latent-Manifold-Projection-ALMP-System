import { useState, useEffect } from "react";
import { io, Socket } from "socket.io-client";
import Canvas3D from "./components/Canvas3D";
import HeaderPanel from "./components/HeaderPanel";
import DataTablePanel, { type DataRow } from "./components/DataTablePanel";
import MetricsPanel from "./components/MetricsPanel";
import UploadPanel from "./components/UploadPanel";

const BACKEND_URL = "https://nagumo21-almp-core.hf.space";

function App() {
  const [connected, setConnected] = useState(false);
  const [latency, setLatency] = useState(0);
  const [motionScore, setMotionScore] = useState(0.0);
  const [latentVector, setLatentVector] = useState<number[]>([]);
  const [recentData, setRecentData] = useState<DataRow[]>([]);
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
          return [newRow, ...prev].slice(0, 10);
        });

        setLatency(Math.floor(Math.random() * 20) + 12);
      },
    );

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-cyber-black text-slate-200 font-sans selection:bg-cyber-neon/30">
      <Canvas3D motionScore={motionScore} latentVector={latentVector} />

      <div className="absolute inset-0 pointer-events-none">
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
