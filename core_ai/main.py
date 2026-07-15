import os
os.environ["YOLO_CONFIG_DIR"] = "/tmp/Ultralytics"

import zmq
import json
import time
import threading
from ultralytics import YOLO
import numpy as np
import onnx

context = zmq.Context()

pub_sock = context.socket(zmq.PUB)
pub_sock.bind("tcp://127.0.0.1:5555")

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
        
        if hasattr(results[0], 'boxes') and results[0].boxes is not None and len(results[0].boxes) > 0:
            # DYNAMIC PAYLOAD NORMALIZATION
            # Convert raw pixel coordinates into a synthetic [-0.5, 0.5] latent space
            h, w = results[0].orig_shape if hasattr(results[0], 'orig_shape') else (640, 640)
            
            for box in results[0].boxes.data:
                box_data = box.cpu().numpy()
                # Format: [x1, y1, x2, y2, conf, cls]
                if len(box_data) >= 6:
                    x1, y1, x2, y2, conf, cls = box_data[:6]
                    
                    # Normalize to [0, 1] then shift to [-0.5, 0.5] for 3D center alignment
                    nx1, nx2 = x1 / w, x2 / w
                    ny1, ny2 = y1 / h, y2 / h
                    
                    cx = (nx1 + nx2) / 2.0 - 0.5
                    cy = (ny1 + ny2) / 2.0 - 0.5
                    
                    area = (nx2 - nx1) * (ny2 - ny1)
                    
                    # Construct normalized synthetic latent array for 3D Engine
                    vector_data.extend([float(cx), float(cy), float(area), float(conf), float(cls / 80.0)])
                else:
                    # Fallback for weird shapes
                    vector_data.extend((box_data / w).tolist())
                
        elif hasattr(results[0], 'probs') and results[0].probs is not None:
            vector_data.extend(results[0].probs.data.cpu().numpy().tolist())
            
        # =================================================================
        # DETERMINISTIC FRACTAL PROJECTION (Replaced random noise)
        # =================================================================
        if len(vector_data) > 0 and len(vector_data) < 128:
            base_data = np.array(vector_data)
            base_len = len(base_data)
            extended_vector = []
            
            for i in range(128):
                val = base_data[i % base_len]
                freq = base_data[(i + 1) % base_len] + 0.1 
                
                wave = np.sin(i * freq) * np.cos(i * val)
                extended_vector.append(float(val + wave))
                
            vector_data = extended_vector
        elif len(vector_data) == 0:
            vector_data = np.zeros(128).tolist()
            
        vector_data = vector_data[:128]
        # =================================================================
        
        print("[CORE AI] -> DATA STREAM STARTING!")
        for i, val in enumerate(vector_data):
            payload = {"motion_score": float(val), "latent_vector": vector_data[:i+1], "node_index": i}
            pub_sock.send_string(f"ALMP_DATA {json.dumps(payload)}")
            time.sleep(0.05) 
            
        print("[CORE AI] -> Data stream successfully completed.\n")
    except Exception as e:
        print(f"[CORE AI ERROR] Inference failure: {e}")

def parse_model_blueprint(model_path):
    print(f"\n[CORE AI] -> Diagnostics requested for: {model_path}")
    try:
        # Step 1: Export to ONNX if it's a PT file
        target_path = model_path
        if model_path.endswith(".pt"):
            print("[CORE AI] -> Translating .pt to .onnx...")
            model = YOLO(model_path)
            # Ultralytics native export
            export_result = model.export(format="onnx", simplify=True)
            # export_result typically returns the path to the exported onnx file
            target_path = export_result if isinstance(export_result, str) else model_path.replace('.pt', '.onnx')
            
        print(f"[CORE AI] -> Parsing ONNX Blueprint: {target_path}")
        onnx_model = onnx.load(target_path)
        
        # Step 2: Extract Architecture
        blueprint = []
        for i, node in enumerate(onnx_model.graph.node):
            # We don't want to overwhelm with 1000s of layers, limit to 200 for UI safety or just parse them all
            # For diagnostics, we capture type and basic params
            params = {}
            for attr in node.attribute:
                if attr.type == 1: # FLOAT
                    params[attr.name] = round(attr.f, 4)
                elif attr.type == 2: # INT
                    params[attr.name] = attr.i
                elif attr.type == 3: # STRING
                    params[attr.name] = attr.s.decode('utf-8')
                elif attr.type == 7: # INTS
                    params[attr.name] = list(attr.ints)
                elif attr.type == 6: # FLOATS
                    params[attr.name] = [round(x, 4) for x in attr.floats]
            
            # Extract weights if available (this is complex in ONNX without mapping initializers, 
            # but we can do a simplified mock for weight shapes based on initializers if needed, 
            # or just skip weights if too complex and rely on params).
            # Let's extract weight shapes by matching node inputs with graph initializers
            weights_info = None
            for input_name in node.input:
                for init in onnx_model.graph.initializer:
                    if init.name == input_name:
                        shape = list(init.dims)
                        total = np.prod(shape) if len(shape) > 0 else 0
                        # Usually the first initializer is the main weight matrix
                        if not weights_info and total > 0:
                            weights_info = {"shape": shape, "total": int(total)}

            blueprint.append({
                "name": f"Layer {i}: {node.op_type}",
                "type": node.op_type,
                "params": params,
                "weights": weights_info
            })
            
            # Hard limit for UI performance just in case of massive models (e.g. YOLOv8 has ~400 nodes)
            if i > 500:
                break
                
        print(f"[CORE AI] -> Successfully parsed {len(blueprint)} layers.")
        return {"status": "success", "blueprint": blueprint}
    except Exception as e:
        print(f"[CORE AI ERROR] Model Parsing failed: {e}")
        return {"status": "error", "error": str(e)}

while True:
    message = cmd_sock.recv_string()
    request = json.loads(message)
    cmd = request.get("command")
    
    if cmd == "PROCESS_INFERENCE":
        m_path = request.get("model_path")
        i_path = request.get("image_path")
        
        cmd_sock.send_string(json.dumps({"status": "python_started", "message": "YOLO inference initializing"}))
        threading.Thread(target=run_inference, args=(m_path, i_path)).start()
        
    elif cmd == "PARSE_MODEL":
        m_path = request.get("model_path")
        # Run parsing synchronously and return the result
        result = parse_model_blueprint(m_path)
        cmd_sock.send_string(json.dumps(result))