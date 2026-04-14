FROM node:18

RUN apt-get update && apt-get install -y python3 python3-pip python3-venv nginx

WORKDIR /app
COPY . .

# Python setup
RUN python3 -m venv venv
RUN . venv/bin/activate && pip install -r backend/requirements.txt

# Build frontend
WORKDIR /app/frontend
RUN npm install && npm run build

WORKDIR /app

# Nginx config
RUN echo '
server {
    listen 3000;

    location /api/ {
        proxy_pass http://localhost:8000/;
    }

    location / {
        root /app/frontend/build;
        index index.html;
        try_files $uri /index.html;
    }
}
' > /etc/nginx/sites-available/default

CMD bash -c "\
. venv/bin/activate && \
uvicorn backend.app:app --host 0.0.0.0 --port 8000 & \
nginx -g 'daemon off;'"
