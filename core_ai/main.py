import zmq
import json
import time
import threading
from ultralytics import YOLO
import numpy as np

context = zmq.Context()
pub_sock = context.socket(zmq.PUB)
pub_sock.bind("tcp://127.0.0.1:5555")
cmd_sock = context.socket(zmq.REP)
cmd_sock.bind("tcp://127.0.0.1:5556")

print("[CORE AI] System awake. Listening on port 5556...")

def run_inference(model_path, image_path):
    print(f"\n[CORE AI] INFERENCE STARTED! Loading YOLO model: {model_path}")
    try:
        model = YOLO(model_path)
        print("[CORE AI] YOLO weights (.pt) successfully loaded!")
    except Exception as e:
        print(f"[CORE AI ERROR] Failed to load YOLO: {e}")
        return
    
    try:
        print("[CORE AI] Processing image through YOLO...")
        results = model(image_path)
        
        vector_data = []
        
        # 1. DURUM: Model Nesne Tanıma (Object Detection) ise kutuları al
        if results[0].boxes is not None and len(results[0].boxes) > 0:
            for box in results[0].boxes.data:
                vector_data.extend(box.cpu().numpy().tolist())
                
        # 2. DURUM: Model Sınıflandırma (Classification) ise olasılıkları al
        elif results[0].probs is not None:
            vector_data.extend(results[0].probs.data.cpu().numpy().tolist())
            
        # Galaksinin çökmemesi için veriyi tam 128 boyuta tamamlıyoruz (Padding)
        if len(vector_data) < 128:
            vector_data.extend(np.random.uniform(-1, 1, 128 - len(vector_data)).tolist())
        vector_data = vector_data[:128]
        
        print("[CORE AI] Starting 3D stream...")
        for i, val in enumerate(vector_data):
            payload = {"motion_score": float(val), "latent_vector": vector_data[:i+1], "node_index": i}
            pub_sock.send_string(f"ALMP_DATA {json.dumps(payload)}")
            time.sleep(0.05) 
            
        print("[CORE AI] Stream completed.\n")
    except Exception as e:
        print(f"[CORE AI ERROR] Inference failed: {e}")

while True:
    message = cmd_sock.recv_string()
    request = json.loads(message)
    if request.get("command") == "PROCESS_INFERENCE":
        m_path = request.get("model_path")
        i_path = request.get("image_path")
        cmd_sock.send_string(json.dumps({"status": "python_started"}))
        threading.Thread(target=run_inference, args=(m_path, i_path)).start()