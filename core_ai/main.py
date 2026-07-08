import zmq
import json
import time
import torch
import torch.nn as nn
import torch.nn.functional as F
import torch.optim as optim

# --- 1. CORE AI DEFINITIONS ---

class ConvBlock(nn.Module):
    def __init__(self, in_channels, out_channels, kernel_size=3, stride=1, padding=1):
        super(ConvBlock, self).__init__()
        self.conv = nn.Conv2d(in_channels, out_channels, kernel_size, stride, padding, bias=False)
        self.bn = nn.BatchNorm2d(out_channels)
        self.silu = nn.SiLU()

    def forward(self, x):
        return self.silu(self.bn(self.conv(x)))

class ALMP_Encoder(nn.Module):
    def __init__(self, latent_dim=128):
        super(ALMP_Encoder, self).__init__()
        self.layer1 = ConvBlock(3, 32, stride=2)
        self.layer2 = ConvBlock(32, 64, stride=2)
        self.layer3 = ConvBlock(64, 128, stride=2)
        self.layer4 = ConvBlock(128, 256, stride=2)
        self.pool = nn.AdaptiveAvgPool2d((1, 1))
        self.projector = nn.Sequential(
            nn.Linear(256, 256),
            nn.SiLU(),
            nn.Linear(256, latent_dim)
        )

    def forward(self, x):
        x = self.layer1(x)
        x = self.layer2(x)
        x = self.layer3(x)
        x = self.layer4(x)
        x = self.pool(x)
        x = torch.flatten(x, 1)
        z = self.projector(x)
        return z

class DEPLoss(nn.Module):
    def __init__(self, target_variance=1.0, lambda_base=1.0):
        super(DEPLoss, self).__init__()
        self.target_variance = target_variance
        self.lambda_base = lambda_base

    def forward(self, z1, z2, motion_score):
        sim_loss = F.mse_loss(z1, z2)
        var_z1 = torch.var(z1, dim=0).mean()
        var_z2 = torch.var(z2, dim=0).mean()
        var_loss = F.relu(self.target_variance - var_z1) + F.relu(self.target_variance - var_z2)
        lambda_dynamic = self.lambda_base * motion_score
        total_loss = sim_loss + (lambda_dynamic * var_loss)
        return total_loss

def compute_motion_score(frame1, frame2, threshold=0.05):
    mae_diff = torch.abs(frame1 - frame2).mean()
    motion_score = torch.sigmoid((mae_diff - threshold) * 50) 
    return motion_score.item()


# --- 2. INITIALIZATION & DUMMY DATA ---

model = ALMP_Encoder(latent_dim=128)
criterion = DEPLoss(target_variance=1.0, lambda_base=2.0)
optimizer = optim.Adam(model.parameters(), lr=0.001)

# Simulating a batch of 4 RGB images (224x224)
frame_t1 = torch.randn(4, 3, 224, 224) 
frame_t2 = torch.randn(4, 3, 224, 224) 
frame_static_1 = torch.randn(4, 3, 224, 224)
frame_static_2 = frame_static_1.clone() 


# --- 3. ZMQ PUBLISHER SETUP ---

context = zmq.Context()
socket = context.socket(zmq.PUB)
socket.bind("tcp://0.0.0.0:5555") 
print("ZMQ Publisher Started: Ready to send data to Node.js.")

def train_step_and_publish(f1, f2, scenario_name):
    optimizer.zero_grad()
    
    # Model Outputs and Loss Calculation
    z1 = model(f1)
    z2 = model(f2)
    m_score = compute_motion_score(f1, f2)
    loss = criterion(z1, z2, motion_score=m_score)
    loss.backward()
    optimizer.step()
    
    # Decouple semantic payload
    latent_list = z1[0].detach().numpy().tolist() 
    
    # Prepare payload
    payload = {
        "scenario": scenario_name,
        "motion_score": m_score,
        "loss": float(loss.item()) if not torch.isnan(loss) else 0.0,
        "latent_vector": latent_list 
    }
    
    # Publish via ZMQ
    socket.send_multipart([b"ALMP_DATA", json.dumps(payload).encode('utf-8')])
    print(f"[{scenario_name}] Shot to Node.js.")


# --- 4. RUN SIMULATION ---

print("--- ALMP System Test Starting ---")
for i in range(5):
    train_step_and_publish(frame_t1, frame_t2, "Motion Scenario")
    time.sleep(0.5) 
    train_step_and_publish(frame_static_1, frame_static_2, "Static Scenario")
    time.sleep(0.5)