#!/usr/bin/env python3
"""
Local Chess Engine Server (Python/Flask)

This server provides a local chess analysis API using Stockfish.
It's designed to work with the Chess Smart Analyzer Pro browser extension.

Requirements:
    pip install flask flask-cors python-chess

Usage:
    1. Update STOCKFISH_PATH below
    2. Run: python local_engine_server.py
    3. Server will start on http://localhost:8080

Author: Chess Smart Analyzer Pro
License: MIT
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import chess
import chess.engine
import sys
import os

# ============================================
# CONFIGURATION
# ============================================

# Path to your Stockfish binary
# Update this to match your system!
STOCKFISH_PATH = "stockfish"  # or "/usr/local/bin/stockfish", "C:\\stockfish\\stockfish.exe", etc.

# Server configuration
HOST = '127.0.0.1'  # Use '0.0.0.0' to allow external connections (NOT recommended)
PORT = 8080
DEBUG = False

# Engine configuration
MAX_DEPTH = 30
DEFAULT_DEPTH = 20
THREADS = 4  # Number of CPU cores to use
HASH_SIZE = 256  # MB of hash table

# ============================================
# APPLICATION SETUP
# ============================================

app = Flask(__name__)
CORS(app)  # Enable CORS for browser access

# Initialize Stockfish engine (global singleton)
engine = None

def init_engine():
    """Initialize the Stockfish engine"""
    global engine
    try:
        engine = chess.engine.SimpleEngine.popen_uci(STOCKFISH_PATH)
        
        # Configure engine
        engine.configure({
            "Threads": THREADS,
            "Hash": HASH_SIZE,
        })
        
        print(f"✅ Stockfish engine initialized successfully")
        print(f"   Path: {STOCKFISH_PATH}")
        print(f"   Threads: {THREADS}")
        print(f"   Hash: {HASH_SIZE}MB")
        
    except FileNotFoundError:
        print(f"❌ ERROR: Stockfish binary not found at: {STOCKFISH_PATH}")
        print(f"   Please download Stockfish from: https://stockfishchess.org/download/")
        print(f"   Then update STOCKFISH_PATH in this script")
        sys.exit(1)
    except Exception as e:
        print(f"❌ ERROR: Failed to initialize Stockfish: {e}")
        sys.exit(1)

# ============================================
# API ENDPOINTS
# ============================================

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({
        'status': 'ok',
        'engine': 'stockfish',
        'version': '1.0.0',
        'max_depth': MAX_DEPTH
    })

@app.route('/analyze', methods=['GET', 'POST'])
def analyze():
    """
    Analyze a chess position
    
    GET parameters:
        fen (required): FEN string of the position
        depth (optional): Analysis depth (default: 20, max: 30)
    
    POST body (JSON):
        {
            "fen": "...",
            "depth": 20
        }
    
    Returns:
        {
            "bestmove": "e2e4",
            "evaluation": 0.5,
            "mate": null,
            "continuation": "e2e4 e7e5 g1f3",
            "depth": 20
        }
    """
    
    # Get FEN from query params or JSON body
    if request.method == 'GET':
        fen = request.args.get('fen')
        depth = int(request.args.get('depth', DEFAULT_DEPTH))
    else:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No JSON body provided'}), 400
        fen = data.get('fen')
        depth = data.get('depth', DEFAULT_DEPTH)
    
    # Validate inputs
    if not fen:
        return jsonify({'error': 'No FEN provided'}), 400
    
    try:
        depth = int(depth)
        if depth < 1:
            depth = DEFAULT_DEPTH
        if depth > MAX_DEPTH:
            depth = MAX_DEPTH
    except (ValueError, TypeError):
        depth = DEFAULT_DEPTH
    
    # Analyze position
    try:
        # Parse FEN
        board = chess.Board(fen)
        
        # Run analysis
        result = engine.analyse(board, chess.engine.Limit(depth=depth))
        
        # Extract best move
        best_move = result['pv'][0].uci() if result.get('pv') else None
        
        # Extract evaluation
        score = result['score'].relative
        evaluation = None
        mate = None
        
        if score.is_mate():
            mate = score.mate()
        else:
            evaluation = score.score() / 100.0  # Convert centipawns to pawns
        
        # Extract continuation (principal variation)
        continuation = ' '.join([move.uci() for move in result.get('pv', [])[:10]])
        
        # Build response
        response = {
            'bestmove': best_move,
            'evaluation': evaluation,
            'mate': mate,
            'continuation': continuation,
            'depth': depth
        }
        
        return jsonify(response)
    
    except chess.InvalidFenError:
        return jsonify({'error': 'Invalid FEN string'}), 400
    except Exception as e:
        print(f"❌ Analysis error: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/', methods=['GET'])
def index():
    """Root endpoint with API documentation"""
    return jsonify({
        'name': 'Chess Engine API',
        'version': '1.0.0',
        'endpoints': {
            '/health': 'GET - Health check',
            '/analyze': 'GET/POST - Analyze position (params: fen, depth)',
        },
        'documentation': 'https://github.com/your-repo/docs/ENGINES.md'
    })

# ============================================
# ERROR HANDLERS
# ============================================

@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Endpoint not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error'}), 500

# ============================================
# MAIN
# ============================================

def main():
    """Main entry point"""
    print("="*60)
    print("🏠 Chess Engine Local Server")
    print("="*60)
    print()
    
    # Initialize engine
    init_engine()
    print()
    
    # Start server
    print(f"🚀 Starting server on http://{HOST}:{PORT}")
    print()
    print("Available endpoints:")
    print(f"  - http://{HOST}:{PORT}/health")
    print(f"  - http://{HOST}:{PORT}/analyze?fen=...&depth=20")
    print()
    print("Press Ctrl+C to stop")
    print("="*60)
    print()
    
    try:
        app.run(host=HOST, port=PORT, debug=DEBUG)
    except KeyboardInterrupt:
        print("\n\n✅ Server stopped")
    finally:
        if engine:
            engine.quit()
            print("✅ Engine closed")

if __name__ == '__main__':
    main()
