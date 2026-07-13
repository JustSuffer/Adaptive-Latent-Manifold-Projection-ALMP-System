import React, { useState } from "react";
import { motion } from "framer-motion";
import { UploadCloud, Cpu, ImageIcon, Loader2 } from "lucide-react";

// Tamamen senin bilgisayarındaki çalışan yerel porta çekildi
const BACKEND_URL = "http://localhost:7860";

const UploadPanel: React.FC = () => {
  const [modelFile, setModelFile] = useState<File | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<
    "idle" | "success" | "error"
  >("idle");

  const handleModelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setModelFile(e.target.files[0]);
      setUploadStatus("idle");
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setImageFile(e.target.files[0]);
      setUploadStatus("idle");
    }
  };

  const handleUpload = async () => {
    if (!modelFile || !imageFile) return;
    setIsUploading(true);
    setUploadStatus("idle");

    const formData = new FormData();
    formData.append("model", modelFile);
    formData.append("image", imageFile);

    try {
      const response = await fetch(`${BACKEND_URL}/api/upload`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Upload failed");

      const result = await response.json();
      console.log("Upload Success:", result);
      setUploadStatus("success");
    } catch (error) {
      console.error("Upload Error:", error);
      setUploadStatus("error");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
      className="absolute bottom-6 right-6 w-80 glass-panel rounded-2xl p-6 z-10 flex flex-col gap-4"
    >
      <div className="flex items-center gap-2 mb-2">
        <UploadCloud size={16} className="text-slate-400" />
        <h3 className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">
          Initialization Protocol
        </h3>
      </div>

      <div className="flex flex-col gap-3">
        <label className="flex flex-col gap-1 cursor-pointer group">
          <span className="text-[10px] text-slate-500 uppercase tracking-widest ml-1">
            Model Weights (.pt)
          </span>
          <div
            className={`flex items-center gap-3 p-3 rounded-xl border transition-all duration-300 ${modelFile ? "bg-cyber-neon/10 border-cyber-neon/30 text-cyber-neon" : "bg-white/5 border-white/10 text-slate-300 group-hover:bg-white/10 group-hover:border-white/20"}`}
          >
            <Cpu size={18} />
            <span className="text-xs font-mono truncate flex-1">
              {modelFile ? modelFile.name : "Select Model File..."}
            </span>
          </div>
          <input
            type="file"
            accept=".pt,.safetensors"
            className="hidden"
            onChange={handleModelChange}
          />
        </label>

        <label className="flex flex-col gap-1 cursor-pointer group">
          <span className="text-[10px] text-slate-500 uppercase tracking-widest ml-1">
            Inference Target (.jpg/.png)
          </span>
          <div
            className={`flex items-center gap-3 p-3 rounded-xl border transition-all duration-300 ${imageFile ? "bg-cyber-blue/10 border-cyber-blue/30 text-cyber-blue" : "bg-white/5 border-white/10 text-slate-300 group-hover:bg-white/10 group-hover:border-white/20"}`}
          >
            <ImageIcon size={18} />
            <span className="text-xs font-mono truncate flex-1">
              {imageFile ? imageFile.name : "Select Image File..."}
            </span>
          </div>
          <input
            type="file"
            accept=".jpg,.jpeg,.png"
            className="hidden"
            onChange={handleImageChange}
          />
        </label>
      </div>

      <button
        onClick={handleUpload}
        disabled={!modelFile || !imageFile || isUploading}
        className={`mt-2 flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-mono uppercase tracking-widest transition-all duration-300 ${
          isUploading
            ? "bg-slate-800/50 border-white/5 text-slate-500 cursor-not-allowed"
            : !modelFile || !imageFile
              ? "bg-white/5 border-white/10 text-slate-500 cursor-not-allowed"
              : "bg-cyber-magenta/10 border-cyber-magenta/30 text-cyber-magenta hover:bg-cyber-magenta/20 hover:border-cyber-magenta/50 hover:text-white shadow-[0_0_15px_rgba(255,0,85,0.2)] hover:shadow-[0_0_25px_rgba(255,0,85,0.4)]"
        }`}
      >
        {isUploading ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            <span>Transmitting...</span>
          </>
        ) : (
          <span>Initialize Inference</span>
        )}
      </button>

      {uploadStatus === "success" && (
        <div className="text-[10px] text-cyber-neon font-mono text-center animate-pulse-fast mt-1">
          Upload Successful. Awaiting Data Stream.
        </div>
      )}
      {uploadStatus === "error" && (
        <div className="text-[10px] text-red-500 font-mono text-center mt-1">
          Upload Failed. Check connection.
        </div>
      )}
    </motion.div>
  );
};

export default UploadPanel;
