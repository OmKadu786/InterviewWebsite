#!/bin/bash

echo "==================================================="
echo "      STARTING HIREBYTE INTERVIEW PLATFORM"
echo "==================================================="

# Kill previous processes if needed (optional, can be dangerous if not careful)
# pkill -f "python main.py"
# pkill -f "vite"

echo "1. Launching Backend Server..."
# Open a new terminal tab for backend
osascript -e 'tell app "Terminal" to do script "cd \"'$(pwd)'/backend\" && source venv/bin/activate && python main.py"'

echo "2. Launching Frontend Server..."
# Open a new terminal tab for frontend
osascript -e 'tell app "Terminal" to do script "cd \"'$(pwd)'/frontend\" && npm run dev"'

echo "3. Waiting for servers to initialize..."
sleep 5

echo "4. Opening Website..."
open http://localhost:5173

echo "==================================================="
echo "      WEBSITE LAUNCHED!"
echo "==================================================="
