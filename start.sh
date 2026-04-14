#!/bin/bash

echo "Starting backend..."
cd backend || cd .

pip install -r requirements.txt
python app.py &

echo "Starting frontend..."
cd ../frontend

npm install
npm run build
npm install -g serve
serve -s build