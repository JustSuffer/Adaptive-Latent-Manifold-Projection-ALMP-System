import os
# Suppress YOLO configuration warning
os.environ["YOLO_CONFIG_DIR"] = "/tmp/Ultralytics"

import zmq
import json
import time
import threading
from ultralytics import YOLO
import numpy as np

context = zmq.Context()

# PUB socket for data streaming
pub_sock = context.socket(zmq.PUB)
pub_sock.bind("tcp://127.0.0.1:5555")

# REP socket for receiving commands from Node.js
cmd_sock = context.socket(zmq.REP)
cmd_sock.bind("tcp://127.0.0.1:5556")

print("[CORE AI] System awake. Waiting for commands from Node.js...")

def run_inference(model_path, image_path):
    print(f"\n[CORE AI] -> Command received. Loading model: {model_path}")
    try:
        model = YOLO(model_path)
        print(f"[CORE AI] -> Model ready. Running inference on: {image_path}")
    except Exception as e:
        print(f"[CORE AI ERROR] Failed to load model: {e}")
        return
    
    try:
        results = model(image_path)
        print("[CORE AI] -> Inference complete. Extracting features...")
        
        vector_data = []
        
        # Scenario 1: Object Detection (Extract box coordinates)
        if results[0].boxes is not None and len(results[0].boxes) > 0:
            for box in results[0].boxes.data:
                vector_data.extend(box.cpu().numpy().tolist())
                
        # Scenario 2: Classification (Extract class probabilities)
        elif results[0].probs is not None:
            vector_data.extend(results[0].probs.data.cpu().numpy().tolist())
            
        # Padding to 128 dimensions for stability
        if len(vector_data) < 128:
            vector_data.extend(np.random.uniform(-1, 1, 128 - len(vector_data)).tolist())
        vector_data = vector_data[:128]
        
        print("[CORE AI] -> DATA STREAM STARTING!")
        for i, val in enumerate(vector_data):
            payload = {"motion_score": float(val), "latent_vector": vector_data[:i+1], "node_index": i}
            pub_sock.send_string(f"ALMP_DATA {json.dumps(payload)}")
            time.sleep(0.05) 
            
        print("[CORE AI] -> Data stream successfully completed.\n")
    except Exception as e:
        print(f"[CORE AI ERROR] Inference failure: {e}")

while True:
    message = cmd_sock.recv_string()
    request = json.loads(message)
    if request.get("command") == "PROCESS_INFERENCE":
        m_path = request.get("model_path")
        i_path = request.get("image_path")
        
        # Immediate acknowledgement to Node.js
        cmd_sock.send_string(json.dumps({"status": "python_started", "message": "YOLO inference initializing"}))
        
        # Run inference in a separate thread to avoid blocking ZMQ
        threading.Thread(target=run_inference, args=(m_path, i_path)).start()