#!/bin/bash

echo "Sistem başlatılıyor..."

# 1. Python (Core AI) sürecini arka planda başlat (& işareti arka plana atar)
cd core_ai
# Not: Eğer Python dosyanın adı farklıysa (örn: app.py) burayı düzelt
python main.py &
cd ..

# 2. Node.js sürecini ön planda başlat (Konteyneri ayakta tutacak olan bu)
cd backend
node main.js