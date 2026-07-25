#!/usr/bin/env bash
set -e

# Change directory to the script's directory
cd "$(dirname "$0")"

echo "======================================"
echo "      ASTI Website Launcher          "
echo "======================================"

# Check if Node.js is installed
if ! command -v node >/dev/null 2>&1; then
    echo "Error: Node.js is not installed."
    echo "Please install Node.js (v20+) from https://nodejs.org/"
    exit 1
fi

# Install dependencies if node_modules missing
if [ ! -d "node_modules" ]; then
    echo "Installing project dependencies..."
    npm install
fi

# Create .env from .env.example if missing
if [ ! -f ".env" ] && [ -f ".env.example" ]; then
    echo "Creating .env configuration file..."
    cp .env.example .env
fi

# Detect PORT from .env if present
PORT=3000
if [ -f ".env" ]; then
    ENV_PORT=$(grep -E '^PORT=' .env | cut -d '=' -f2 | tr -d '\r')
    if [ -n "$ENV_PORT" ]; then
        PORT=$ENV_PORT
    fi
fi

URL="http://localhost:${PORT}"
echo "Starting server at ${URL}..."

# Open browser automatically after server starts
(
    sleep 2
    if command -v xdg-open >/dev/null 2>&1; then
        xdg-open "$URL" >/dev/null 2>&1 || true
    elif command -v open >/dev/null 2>&1; then
        open "$URL" >/dev/null 2>&1 || true
    fi
) &

# Run server
npm start
