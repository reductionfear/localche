# 🏠 Local Engine Quick Start

**Get your own private Stockfish engine running in 5 minutes!**

## One-Line Setup

### Linux/macOS
```bash
cd examples && ./setup.sh
```

### Manual Setup

#### 1. Install Dependencies

**Python:**
```bash
pip install flask flask-cors python-chess
```

**Node.js:**
```bash
npm install express cors
```

#### 2. Download Stockfish

- **Linux**: `sudo apt-get install stockfish`
- **macOS**: `brew install stockfish`
- **Windows**: Download from [stockfishchess.org](https://stockfishchess.org/download/)

#### 3. Start Server

**Python:**
```bash
python examples/local_engine_server.py
```

**Node.js:**
```bash
node examples/local_engine_server.js
```

#### 4. Configure Extension

1. Open extension options
2. Go to "Engines" tab
3. Verify URL: `http://localhost:8080/analyze`
4. Save settings
5. Select "Local Engine" in the analyzer

## Test Your Setup

```bash
# Health check
curl http://localhost:8080/health

# Test analysis
curl "http://localhost:8080/analyze?fen=rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR%20w%20KQkq%20-%200%201&depth=15"
```

Expected response:
```json
{
  "bestmove": "e2e4",
  "evaluation": 0.3,
  "mate": null,
  "continuation": "e2e4 e7e5 g1f3"
}
```

## Why Local Engine?

✅ **Privacy**: Games never leave your computer  
✅ **Power**: Full Stockfish strength, unlimited depth  
✅ **Speed**: Zero network latency  
✅ **Control**: Configure engine parameters  

## Troubleshooting

### "Stockfish not found"
- Linux: `which stockfish`
- Update `STOCKFISH_PATH` in server file

### "Module not found"
- Python: `pip install flask flask-cors python-chess`
- Node.js: `npm install express cors`

### "Port already in use"
- Change `PORT` in server file to 8081
- Update extension URL accordingly

## Documentation

- **Full Guide**: [`examples/README.md`](README.md)
- **Engine Docs**: [`docs/ENGINES.md`](../docs/ENGINES.md)
- **Main README**: [`README.md`](../README.md)

## Need Help?

1. Check the documentation links above
2. Run the test script: `python examples/test_server_logic.py`
3. Check server console for errors
4. Open an issue on GitHub

---

**Happy analyzing with maximum privacy! ♟️🔒**
