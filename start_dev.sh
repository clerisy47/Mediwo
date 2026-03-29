#!/bin/bash

# ===================================================================
# MEDIWO - Complete MongoDB + Frontend Integration Setup
# ===================================================================
# Run this script to start both backend and frontend in development mode

set -e

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$SCRIPT_DIR"

echo "=================================================="
echo "Mediwo - Full Stack Development Server Startup"
echo "=================================================="
echo ""

# Check if .venv exists
if [ ! -d ".venv" ]; then
    echo "❌ Virtual environment not found"
    echo "Please run: python3 -m venv .venv"
    exit 1
fi

# Check if node_modules exists
if [ ! -d "frontend/node_modules" ]; then
    echo "⚠️  Frontend dependencies not installed"
    echo "Please run: cd frontend && npm install && cd .."
    echo ""
fi

echo "✓ Starting Backend Server..."
echo "  Backend will run on: http://localhost:8000"
echo "  API Documentation: http://localhost:8000/docs"
echo ""

# Start backend in background
(
    cd backend
    source ../.venv/bin/activate
    python main.py
) &
BACKEND_PID=$!

echo "✓ Starting Frontend Server..."
echo "  Frontend will run on: http://localhost:5173"
echo ""

sleep 2

# Start frontend
(
    cd frontend
    npm run dev
) &
FRONTEND_PID=$!

echo "=================================================="
echo "✓ Both servers are starting!"
echo "=================================================="
echo ""
echo "BACKEND:  http://localhost:8000"
echo "FRONTEND: http://localhost:5173"
echo ""
echo "Press Ctrl+C to stop both servers"
echo ""

# Wait for both processes
wait
