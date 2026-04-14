FROM node:18

# Install Python
RUN apt-get update && apt-get install -y python3 python3-pip

WORKDIR /app

COPY . .

# Install backend dependencies
RUN pip3 install -r backend/requirements.txt

# Build frontend
WORKDIR /app/frontend
RUN npm install
RUN npm run build

# Install serve
RUN npm install -g serve

# Go back to root
WORKDIR /app

# Start both backend and frontend
CMD bash -c "python3 backend/app.py & serve -s frontend/build"