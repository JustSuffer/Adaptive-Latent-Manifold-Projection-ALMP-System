const zmq = require("zeromq");
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

async function runZmqSubscriber() {
  const sock = new zmq.Subscriber();

  // DİKKAT: Artık aynı konteynerde oldukları için localhost (127.0.0.1) kullanıyoruz.
  sock.connect("tcp://127.0.0.1:5555");
  sock.subscribe("ALMP_DATA");

  console.log("ZMQ Subscriber Started: Waiting for Python (PyTorch)...");

  for await (const [topic, message] of sock) {
    const dataString = message.toString();
    const dataObj = JSON.parse(dataString);

    io.emit("latent_stream", dataObj);

    console.log(
      `[ZMQ] Data Received -> Motion Score: ${dataObj.motion_score.toFixed(4)} | Nodes: ${dataObj.latent_vector.length}`,
    );
  }
}

// DİKKAT: Hugging Face'in zorunlu kıldığı port numarası.
const PORT = process.env.PORT || 7860;

server.listen(PORT, () => {
  console.log(`Node.js WebSocket Server is running on port ${PORT}.`);
  runZmqSubscriber();
});
