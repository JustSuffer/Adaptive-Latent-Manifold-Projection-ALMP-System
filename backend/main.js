const zmq = require("zeromq");
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();
app.use(cors());
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

// Yüklenen dosyaların kaydedileceği klasörü oluştur (yoksa çöker)
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer (Dosya Yükleme) Ayarları
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage: storage });

// ZMQ İstemcisi (Python'a "İşe başla" emri vermek için)
const cmdSock = new zmq.Request();
cmdSock.connect("tcp://127.0.0.1:5556");

// ==========================================
// EKSİK OLAN ROTA BURASIYDI: DOSYA KARŞILAMA
// ==========================================
app.post(
  "/api/upload",
  upload.fields([
    { name: "model", maxCount: 1 },
    { name: "image", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      if (!req.files || !req.files.model || !req.files.image) {
        return res
          .status(400)
          .json({ error: "Missing files! Both model and image are required." });
      }

      const modelPath = req.files.model[0].path;
      const imagePath = req.files.image[0].path;

      console.log(`[NODE] Files received. Processing inference...`);

      // Python tarafına (core_ai/main.py) modeli ve fotoğrafı işleme almasını söylüyoruz
      const payload = {
        command: "PROCESS_INFERENCE",
        model_path: modelPath,
        image_path: imagePath,
      };

      await cmdSock.send(JSON.stringify(payload));
      const [result] = await cmdSock.receive();

      res.json({
        success: true,
        message: "Inference initialized successfully.",
        details: JSON.parse(result.toString()),
      });
    } catch (error) {
      console.error("[NODE] Upload error:", error);
      res.status(500).json({ error: "Internal server error during upload." });
    }
  },
);

async function runZmqSubscriber() {
  const sock = new zmq.Subscriber();

  sock.connect("tcp://127.0.0.1:5555");
  sock.subscribe("ALMP_DATA");

  console.log("ZMQ Subscriber Started: Waiting for Python (PyTorch)...");

  for await (const [topic, message] of sock) {
    const dataString = message.toString();

    try {
      // Python'dan gelen stringin başındaki "ALMP_DATA " etiketini temizleyip JSON yapıyoruz
      const jsonStr = dataString.replace("ALMP_DATA ", "");
      const dataObj = JSON.parse(jsonStr);

      // React (Frontend) tarafına veriyi şelale gibi gönder
      io.emit("latent_stream", dataObj);

      console.log(
        `[ZMQ] Data -> Motion: ${dataObj.motion_score.toFixed(4)} | Nodes: ${dataObj.latent_vector.length}`,
      );
    } catch (e) {
      console.error("[NODE] JSON Parse Error:", e);
    }
  }
}

const PORT = process.env.PORT || 7860;

server.listen(PORT, () => {
  console.log(`Node.js WebSocket Server is running on port ${PORT}.`);
  runZmqSubscriber();
});
