FROM node:18

# Install Python + venv
RUN apt-get update && apt-get install -y python3 python3-pip python3-venv

WORKDIR /app

COPY . .

# Create virtual environment
RUN python3 -m venv venv

# Activate venv and install backend dependencies
RUN . venv/bin/activate && pip install -r backend/requirements.txt

# Build frontend
WORKDIR /app/frontend
RUN npm install
RUN npm run build

# Install serve
RUN npm install -g serve

# Go back to root
WORKDIR /app

# Start app using venv python
CMD bash -c ". venv/bin/activate && python backend/app.py & serve -s frontend/build"