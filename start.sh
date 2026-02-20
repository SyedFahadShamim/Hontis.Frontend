#!/bin/bash

echo "========================================"
echo "  Hontis HSAC - Quick Start"
echo "========================================"
echo ""
echo "Starting backend server..."
echo ""

npm run server &
SERVER_PID=$!

sleep 2

echo ""
echo "========================================"
echo "✓ Backend is running on http://localhost:5000"
echo ""
echo "Now open a NEW terminal and run:"
echo "  npm run dev"
echo ""
echo "Then open http://localhost:5173 in your browser"
echo ""
echo "Login with:"
echo "  Username: admin"
echo "  Password: Admin@123"
echo ""
echo "Press Ctrl+C to stop the backend server"
echo "========================================"
echo ""

wait $SERVER_PID
