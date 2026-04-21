#!/bin/bash
cd "$(dirname "$0")/../backend"
if [ ! -d "venv" ]; then
  echo "Creating virtualenv..."
  python3 -m venv venv
fi
source venv/bin/activate
pip install -r requirements.txt -q
cp -n .env.example .env 2>/dev/null || true
uvicorn app.main:app --reload --port 8000
