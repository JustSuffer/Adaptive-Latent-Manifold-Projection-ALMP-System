# Temel imaj olarak Python kullanalım
FROM python:3.10-slim

# İçeriye Node.js ve temel kütüphaneleri kuralım
RUN apt-get update && apt-get install -y \
    curl \
    libgl1 \
    libglib2.0-0 \
    libsm6 \
    libxrender1 \
    libxext6

RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
RUN apt-get install -y nodejs

WORKDIR /app

# Önce Core AI (Python) gereksinimlerini kur
COPY core_ai/requirements.txt ./core_ai/
RUN pip install --no-cache-dir -r core_ai/requirements.txt

# ALTIN VURUŞ: Masaüstü OpenCV'yi silip, ekransız (Headless) sunucu sürümünü kuruyoruz!
RUN pip uninstall -y opencv-python opencv-python-headless && pip install opencv-python-headless

# Sonra Backend (Node.js) paketlerini kur
COPY backend/package*.json ./backend/
RUN cd backend && npm install

# Tüm proje dosyalarını içeri kopyala
COPY . .

# Başlatma betiğine çalışma izni ver
RUN chmod +x start.sh

# Hugging Face'in dış dünyaya açtığı tek port
EXPOSE 7860

# CACHE BUST 2
CMD ["./start.sh"]