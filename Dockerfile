# Temel imaj olarak Python kullanalım
FROM python:3.10-slim

# İçeriye Node.js (v18) kuralım
RUN apt-get update && apt-get install -y curl
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
RUN apt-get install -y nodejs

# Çalışma dizinini ayarla
WORKDIR /app

# Önce Core AI (Python) gereksinimlerini kur
# Not: core_ai klasöründe requirements.txt olduğunu varsayıyorum.
COPY core_ai/requirements.txt ./core_ai/
RUN pip install --no-cache-dir -r core_ai/requirements.txt

# Sonra Backend (Node.js) paketlerini kur
COPY backend/package*.json ./backend/
RUN cd backend && npm install

# Tüm proje dosyalarını içeri kopyala
COPY . .

# Başlatma betiğine çalışma izni ver
RUN chmod +x start.sh

# Hugging Face'in dış dünyaya açtığı tek port
EXPOSE 7860

# Konteyner ayağa kalktığında betiği çalıştır
CMD ["./start.sh"]