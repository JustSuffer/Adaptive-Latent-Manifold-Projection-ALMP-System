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

// Upload directory for incoming .pt and image files
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Multer Config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname),
    );
  },
});
const upload = multer({ storage: storage });

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

// ZMQ Sockets
const cmdSock = new zmq.Request();

async function runZmqSubscriber() {
  const sock = new zmq.Subscriber();
  sock.connect("tcp://127.0.0.1:5555");
  sock.subscribe("ALMP_DATA");

  console.log(
    "[ZMQ SUB] Listening: Waiting for streaming data from Python (PyTorch)...",
  );

  for await (const [topic, message] of sock) {
    const dataObj = JSON.parse(message.toString());
    io.emit("latent_stream", dataObj);
    console.log(
      `[ZMQ SUB] Stream Data -> Motion Score: ${dataObj.motion_score.toFixed(4)}`,
    );
  }
}

// File Upload REST API Endpoint
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
          .json({
            error:
              "Missing files! You must upload both a .pt model and an image.",
          });
      }

      const modelPath = req.files.model[0].path;
      const imagePath = req.files.image[0].path;
      console.log(`[API] Files received. Processing inference...`);

      // Command Python to start inference
      await cmdSock.send(
        JSON.stringify({
          command: "PROCESS_INFERENCE",
          model_path: modelPath,
          image_path: imagePath,
        }),
      );

      const [reply] = await cmdSock.receive();
      const replyObj = JSON.parse(reply.toString());

      return res.json({
        status: "success",
        message: "Inference started successfully!",
        details: replyObj,
      });
    } catch (err) {
      console.error("[API ERROR]", err);
      return res.status(500).json({ error: "Internal server error occurred." });
    }
  },
);

// VERY IMPORTANT: Hugging Face port and 0.0.0.0 IP binding
const PORT = process.env.PORT || 7860;

server.listen(PORT, "0.0.0.0", async () => {
  console.log(`Node.js WebSocket & API Server is running on port ${PORT}.`);
  cmdSock.connect("tcp://127.0.0.1:5556");
  runZmqSubscriber();
});
