#!/bin/bash
# Quick Setup Script for Local Chess Engine Server

set -e

echo "============================================================"
echo "🏠 Local Chess Engine Server - Quick Setup"
echo "============================================================"
echo ""

# Detect OS
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    OS="linux"
    echo "🐧 Detected OS: Linux"
elif [[ "$OSTYPE" == "darwin"* ]]; then
    OS="mac"
    echo "🍎 Detected OS: macOS"
else
    echo "⚠️  Windows detected - Please run setup-windows.ps1 instead"
    exit 1
fi

echo ""

# Check Python or Node.js preference
echo "Choose your preferred implementation:"
echo "  1) Python (recommended for beginners)"
echo "  2) Node.js (recommended for developers)"
echo -n "Enter choice [1-2]: "
read choice

if [ "$choice" == "1" ]; then
    IMPL="python"
    echo "✅ Selected: Python"
elif [ "$choice" == "2" ]; then
    IMPL="nodejs"
    echo "✅ Selected: Node.js"
else
    echo "❌ Invalid choice"
    exit 1
fi

echo ""
echo "============================================================"
echo "📦 Step 1: Installing Dependencies"
echo "============================================================"
echo ""

if [ "$IMPL" == "python" ]; then
    # Check Python
    if ! command -v python3 &> /dev/null; then
        echo "❌ Python 3 not found. Please install Python 3 first."
        exit 1
    fi
    
    echo "✅ Python found: $(python3 --version)"
    
    # Install Python packages
    echo "Installing Python packages..."
    pip3 install flask flask-cors python-chess || {
        echo "❌ Failed to install Python packages"
        exit 1
    }
    
    echo "✅ Python packages installed"
else
    # Check Node.js
    if ! command -v node &> /dev/null; then
        echo "❌ Node.js not found. Please install Node.js first."
        exit 1
    fi
    
    echo "✅ Node.js found: $(node --version)"
    
    # Install Node.js packages
    echo "Installing Node.js packages..."
    npm install express cors || {
        echo "❌ Failed to install Node.js packages"
        exit 1
    }
    
    echo "✅ Node.js packages installed"
fi

echo ""
echo "============================================================"
echo "♟️  Step 2: Checking for Stockfish"
echo "============================================================"
echo ""

if command -v stockfish &> /dev/null; then
    STOCKFISH_PATH=$(which stockfish)
    echo "✅ Stockfish found at: $STOCKFISH_PATH"
else
    echo "⚠️  Stockfish not found in PATH"
    echo ""
    echo "Please install Stockfish:"
    if [ "$OS" == "linux" ]; then
        echo "  Ubuntu/Debian: sudo apt-get install stockfish"
        echo "  Fedora: sudo dnf install stockfish"
    elif [ "$OS" == "mac" ]; then
        echo "  Homebrew: brew install stockfish"
    fi
    echo "  Or download from: https://stockfishchess.org/download/"
    echo ""
    echo -n "Enter path to Stockfish binary (or press Enter to skip): "
    read STOCKFISH_PATH
    
    if [ -z "$STOCKFISH_PATH" ]; then
        echo "⚠️  Skipping Stockfish configuration"
        echo "⚠️  You'll need to update the path in the server file manually"
    else
        if [ ! -f "$STOCKFISH_PATH" ]; then
            echo "❌ File not found: $STOCKFISH_PATH"
            exit 1
        fi
        echo "✅ Using Stockfish at: $STOCKFISH_PATH"
    fi
fi

echo ""
echo "============================================================"
echo "⚙️  Step 3: Configuring Server"
echo "============================================================"
echo ""

if [ -n "$STOCKFISH_PATH" ]; then
    if [ "$IMPL" == "python" ]; then
        # Update Python server
        sed -i.bak "s|STOCKFISH_PATH = \"stockfish\"|STOCKFISH_PATH = \"$STOCKFISH_PATH\"|" local_engine_server.py
        echo "✅ Updated local_engine_server.py"
    else
        # Update Node.js server
        sed -i.bak "s|const STOCKFISH_PATH = 'stockfish'|const STOCKFISH_PATH = '$STOCKFISH_PATH'|" local_engine_server.js
        echo "✅ Updated local_engine_server.js"
    fi
fi

echo ""
echo "============================================================"
echo "✅ Setup Complete!"
echo "============================================================"
echo ""
echo "To start the server:"
if [ "$IMPL" == "python" ]; then
    echo "  python3 local_engine_server.py"
else
    echo "  node local_engine_server.js"
fi
echo ""
echo "Server will run on: http://localhost:8080"
echo ""
echo "Next steps:"
echo "  1. Start the server using the command above"
echo "  2. Open the browser extension options"
echo "  3. Go to Engines tab"
echo "  4. Verify Local Engine URL: http://localhost:8080/analyze"
echo "  5. Save and select 'Local Engine'"
echo ""
echo "For more information, see README.md"
echo ""
