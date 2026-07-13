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

const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage: storage });

// ZMQ Request soketi
const cmdSock = new zmq.Request();
cmdSock.connect("tcp://127.0.0.1:5556");

app.post(
  "/api/upload",
  upload.fields([
    { name: "model", maxCount: 1 },
    { name: "image", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      if (!req.files || !req.files.model || !req.files.image) {
        return res.status(400).json({ error: "Missing files" });
      }

      const payload = {
        command: "PROCESS_INFERENCE",
        model_path: path.resolve(req.files.model[0].path),
        image_path: path.resolve(req.files.image[0].path),
      };

      console.log(`[NODE] Sending command to Python...`);

      // Python'a gönder ve cevabı bekle
      await cmdSock.send(JSON.stringify(payload));
      const [result] = await cmdSock.receive();
      const resultObj = JSON.parse(result.toString());

      res.json({ success: true, ...resultObj });
    } catch (error) {
      console.error("[NODE CRITICAL ERROR]:", error);
      res.status(500).json({ error: error.message });
    }
  },
);

async function runZmqSubscriber() {
  const sock = new zmq.Subscriber();
  sock.connect("tcp://127.0.0.1:5555");
  sock.subscribe("ALMP_DATA");

  console.log("ZMQ Subscriber Started.");

  for await (const [topic, message] of sock) {
    try {
      const jsonStr = message.toString().replace("ALMP_DATA ", "");
      const dataObj = JSON.parse(jsonStr);
      io.emit("latent_stream", dataObj);
    } catch (e) {
      // Hataları sessizce geç
    }
  }
}

const PORT = process.env.PORT || 7860;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  runZmqSubscriber();
});
