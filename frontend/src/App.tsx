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
    // 1. Zırhlı Socket Bağlantısı (Hugging Face Proxy'lerini aşmak için)
    const socket: Socket = io(BACKEND_URL, {
      transports: ["websocket"], // Sadece saf WebSocket kullan, bağlantı kopmasını engeller
      secure: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socket.on("connect", () => {
      console.log("[ALMP SYSTEM] Connected to ALMP Core AI");
      setConnected(true);
    });

    socket.on("disconnect", (reason) => {
      console.warn(
        `[ALMP SYSTEM] Disconnected from ALMP Core AI. Reason: ${reason}`,
      );
      setConnected(false);
    });

    // 2. Canlı Veri Akışını Dinle
    socket.on(
      "latent_stream",
      (dataObj: {
        motion_score: number;
        latent_vector: number[];
        node_index: number;
      }) => {
        // Çekirdek Metrikleri Güncelle
        setMotionScore(dataObj.motion_score);
        setLatentVector(dataObj.latent_vector);
        setActiveNodesCount(dataObj.node_index);

        // Veri Tablosunu Güncelle
        setRecentData((prev) => {
          const newRow: DataRow = {
            id: `VAR-${dataObj.node_index.toString().padStart(4, "0")}`,
            value: dataObj.motion_score,
            timestamp: new Date().toLocaleTimeString(),
            status: dataObj.motion_score > 0.5 ? "critical" : "stable",
          };
          return [newRow, ...prev].slice(0, 10); // Sadece son 10 satırı tut
        });

        // Görsel estetik için sahte bir gecikme (ping) değeri
        setLatency(Math.floor(Math.random() * 20) + 12);
      },
    );

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-cyber-black text-slate-200 font-sans selection:bg-cyber-neon/30">
      {/* 3B Arka Plan - Veriyi buraya gönderiyoruz ve o efsane morphing efekti başlıyor! */}
      <Canvas3D motionScore={motionScore} latentVector={latentVector} />

      {/* Arayüz (UI Overlay) */}
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
