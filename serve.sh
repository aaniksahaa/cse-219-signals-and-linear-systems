#!/usr/bin/env bash
# Serve the course demos over localhost (needed for microphone recording).
cd "$(dirname "$0")"
PORT="${1:-8000}"
echo "CSE 219 demos → http://localhost:$PORT"
python3 -m http.server "$PORT"
