# Local Chess Engine Server Examples

This directory contains example implementations of local chess engine servers that work with the Chess Smart Analyzer Pro browser extension.

## Available Implementations

### 1. Python/Flask (`local_engine_server.py`)

**Requirements:**
```bash
pip install flask flask-cors python-chess
```

**Features:**
- Easy to set up and modify
- Excellent python-chess library for chess logic
- Clean, readable code
- Good error handling

**Usage:**
```bash
# Install dependencies
pip install flask flask-cors python-chess

# Download Stockfish
# Visit: https://stockfishchess.org/download/

# Update STOCKFISH_PATH in the script
# Then run:
python local_engine_server.py
```

### 2. Node.js/Express (`local_engine_server.js`)

**Requirements:**
```bash
npm install express cors
```

**Features:**
- Fast and lightweight
- Easy to deploy
- Popular ecosystem
- Good for production

**Usage:**
```bash
# Install dependencies
npm install express cors

# Download Stockfish
# Visit: https://stockfishchess.org/download/

# Update STOCKFISH_PATH in the script
# Then run:
node local_engine_server.js
```

## Configuration

Both implementations have the following configurable options at the top of the file:

### Stockfish Path
```python
STOCKFISH_PATH = "stockfish"  # or full path
```

Common paths:
- **Linux**: `/usr/bin/stockfish` or `/usr/local/bin/stockfish`
- **macOS**: `/usr/local/bin/stockfish` or `/opt/homebrew/bin/stockfish`
- **Windows**: `C:\stockfish\stockfish.exe`

### Server Settings
```python
HOST = '127.0.0.1'  # Only localhost (recommended)
PORT = 8080         # Server port
```

### Engine Settings
```python
MAX_DEPTH = 30      # Maximum analysis depth
DEFAULT_DEPTH = 20  # Default depth if not specified
THREADS = 4         # Number of CPU cores to use
HASH_SIZE = 256     # MB of hash table
```

## API Endpoints

Both servers provide the same REST API:

### Health Check
```bash
GET http://localhost:8080/health
```

Response:
```json
{
  "status": "ok",
  "engine": "stockfish",
  "version": "1.0.0",
  "max_depth": 30
}
```

### Analyze Position (GET)
```bash
GET http://localhost:8080/analyze?fen=POSITION&depth=20
```

Example:
```bash
curl "http://localhost:8080/analyze?fen=rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR%20w%20KQkq%20-%200%201&depth=15"
```

### Analyze Position (POST)
```bash
POST http://localhost:8080/analyze
Content-Type: application/json

{
  "fen": "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
  "depth": 20
}
```

Example:
```bash
curl -X POST http://localhost:8080/analyze \
  -H "Content-Type: application/json" \
  -d '{"fen":"rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1","depth":15}'
```

### Response Format

All analysis endpoints return:
```json
{
  "bestmove": "e2e4",
  "evaluation": 0.3,
  "mate": null,
  "continuation": "e2e4 e7e5 g1f3 b8c6 f1b5",
  "depth": 15
}
```

Fields:
- `bestmove`: Best move in UCI notation (e.g., "e2e4", "e7e8q" for promotion)
- `evaluation`: Position evaluation in pawns (e.g., 0.3 = white is +0.3 pawns)
- `mate`: Mate in N moves (positive = white mates, negative = black mates), or null
- `continuation`: Best line continuation (space-separated UCI moves)
- `depth`: Actual analysis depth reached

## Installation Guide

### Step 1: Download Stockfish

Visit [https://stockfishchess.org/download/](https://stockfishchess.org/download/) and download the appropriate version for your operating system.

**Linux:**
```bash
# Ubuntu/Debian
sudo apt-get install stockfish

# Or download latest binary
wget https://stockfishchess.org/files/stockfish_15_linux_x64.zip
unzip stockfish_15_linux_x64.zip
sudo mv stockfish_*/stockfish /usr/local/bin/
sudo chmod +x /usr/local/bin/stockfish
```

**macOS:**
```bash
# Using Homebrew
brew install stockfish

# Or download from website
```

**Windows:**
```powershell
# Download from website, extract to C:\stockfish\
# Add to PATH or use full path in script
```

### Step 2: Install Dependencies

**Python:**
```bash
pip install flask flask-cors python-chess
```

**Node.js:**
```bash
npm install express cors
```

### Step 3: Configure Script

Edit the server file and update `STOCKFISH_PATH`:

**Python:**
```python
STOCKFISH_PATH = "/usr/local/bin/stockfish"  # Linux/macOS
# or
STOCKFISH_PATH = "C:\\stockfish\\stockfish.exe"  # Windows
```

**Node.js:**
```javascript
const STOCKFISH_PATH = '/usr/local/bin/stockfish';  // Linux/macOS
// or
const STOCKFISH_PATH = 'C:\\stockfish\\stockfish.exe';  // Windows
```

### Step 4: Run Server

**Python:**
```bash
python local_engine_server.py
```

**Node.js:**
```bash
node local_engine_server.js
```

You should see:
```
============================================================
🏠 Chess Engine Local Server
============================================================

✅ Stockfish engine found: /usr/local/bin/stockfish
   Threads: 4
   Hash: 256MB

🚀 Server running on http://127.0.0.1:8080

Available endpoints:
  - http://127.0.0.1:8080/health
  - http://127.0.0.1:8080/analyze?fen=...&depth=20

Press Ctrl+C to stop
============================================================
```

### Step 5: Test Server

```bash
# Test health endpoint
curl http://localhost:8080/health

# Test analysis
curl "http://localhost:8080/analyze?fen=rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR%20w%20KQkq%20-%200%201&depth=15"
```

### Step 6: Configure Extension

1. Open the browser extension options
2. Go to "Engines" tab
3. Verify "Local Engine URL" is set to `http://localhost:8080/analyze`
4. Save settings
5. Select "Local Engine" in the analyzer overlay

## Troubleshooting

### "Stockfish not found" Error

**Problem:** Server can't find the Stockfish binary

**Solutions:**
1. Verify Stockfish is installed: `which stockfish` (Linux/macOS) or `where stockfish` (Windows)
2. Update `STOCKFISH_PATH` in the script with the correct path
3. Make sure the binary is executable: `chmod +x /path/to/stockfish`

### "Module not found" Error (Python)

**Problem:** Python dependencies not installed

**Solution:**
```bash
pip install flask flask-cors python-chess
# or
pip3 install flask flask-cors python-chess
```

### "Module not found" Error (Node.js)

**Problem:** Node.js dependencies not installed

**Solution:**
```bash
npm install express cors
```

### CORS Errors in Browser

**Problem:** Browser blocks requests due to CORS

**Solution:** Both servers have CORS enabled by default. If issues persist:
1. Make sure server is running
2. Check browser console for exact error
3. Verify URL is exactly `http://localhost:8080/analyze`

### Port Already in Use

**Problem:** Port 8080 is already in use

**Solution:** Change `PORT` in the script:
```python
PORT = 8081  # or any free port
```

Then update the extension settings to use the new port.

### Slow Analysis

**Problem:** Analysis takes too long

**Solutions:**
1. Reduce depth: Use 12-15 instead of 20
2. Increase threads: Set `THREADS = 8` (if you have 8 cores)
3. Increase hash: Set `HASH_SIZE = 512` (if you have RAM)

## Advanced Configuration

### Custom Engine Options

**Python:**
```python
engine.configure({
    "Threads": 8,
    "Hash": 512,
    "Contempt": 0,
    "Ponder": False,
    "MultiPV": 1,
})
```

**Node.js:**
```javascript
stockfish.stdin.write('setoption name Threads value 8\n');
stockfish.stdin.write('setoption name Hash value 512\n');
stockfish.stdin.write('setoption name Contempt value 0\n');
```

### Multiple Engine Support

You can run multiple engines on different ports:
```bash
# Engine 1 (Stockfish 15)
python local_engine_server.py  # Port 8080

# Engine 2 (Stockfish 16) - modify PORT in script
python local_engine_server_16.py  # Port 8081
```

### Running as Background Service

**Linux (systemd):**
```bash
# Create service file
sudo nano /etc/systemd/system/chess-engine.service
```

```ini
[Unit]
Description=Chess Engine Local Server
After=network.target

[Service]
Type=simple
User=youruser
WorkingDirectory=/home/youruser/chess-engine
ExecStart=/usr/bin/python3 /home/youruser/chess-engine/local_engine_server.py
Restart=always

[Install]
WantedBy=multi-user.target
```

```bash
# Start service
sudo systemctl start chess-engine
sudo systemctl enable chess-engine
```

**macOS (launchd):**
Create `~/Library/LaunchAgents/com.chess.engine.plist`:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.chess.engine</string>
    <key>ProgramArguments</key>
    <array>
        <string>/usr/bin/python3</string>
        <string>/path/to/local_engine_server.py</string>
    </array>
    <key>RunAtLoad</key>
    <true/>
</dict>
</plist>
```

```bash
launchctl load ~/Library/LaunchAgents/com.chess.engine.plist
```

## Security Notes

⚠️ **Important:**

1. **Never bind to 0.0.0.0 on a public network** - Only use `127.0.0.1` (localhost)
2. **Don't expose to the internet** - This is for local use only
3. **No authentication** - The servers don't have authentication
4. **Validate inputs** - Both servers validate FEN, but be cautious
5. **Rate limiting** - Consider adding rate limiting if needed

## Performance Benchmarks

Typical analysis times on modern hardware:

| Depth | Bullet | Blitz | Rapid | Classical |
|-------|--------|-------|-------|-----------|
| 10    | 0.1s   | 0.1s  | 0.1s  | 0.1s      |
| 15    | 0.5s   | 0.5s  | 0.5s  | 0.5s      |
| 20    | 2-3s   | 2-3s  | 2-3s  | 2-3s      |
| 25    | 8-10s  | 8-10s | 8-10s | 8-10s     |
| 30    | 30-60s | 30-60s| 30-60s| 30-60s    |

Recommended depth by time control:
- **Bullet**: 10-12
- **Blitz**: 12-15
- **Rapid**: 15-18
- **Classical**: 18-22

## Support

For issues or questions:
1. Check this README
2. Review the main ENGINES.md documentation
3. Check server console output for errors
4. Test endpoints with curl
5. Open an issue on GitHub

---

**Happy analyzing! ♟️**
