# Chess Engine Configuration Guide

This guide explains how to configure and use different chess engines with the Chess Smart Analyzer Pro extension.

## Table of Contents

- [Built-in Engines](#built-in-engines)
- [Custom Engine Setup](#custom-engine-setup)
- [Local Engine Setup](#local-engine-setup)
- [Example Implementations](#example-implementations)
- [Engine Response Formats](#engine-response-formats)
- [Troubleshooting](#troubleshooting)

## Built-in Engines

### 🐟 Stockfish Online
- **Max Depth**: 15
- **Move Limit**: Unlimited
- **Best For**: Fast, reliable analysis

### ♟️ Lichess Cloud
- **Max Depth**: 20
- **Move Limit**: 40 moves
- **Best For**: Mid-game analysis

### 📚 ChessDB
- **Max Depth**: 20
- **Move Limit**: Unlimited
- **Best For**: Opening book

### 🦆 Chess-API.com
- **Max Depth**: 20
- **Move Limit**: 20 moves
- **Best For**: Early game

## Custom Engine Setup

### Configuration Steps

1. Open Extension Settings → Engines tab
2. Enter your API endpoint URL
3. Select response format
4. Set max analysis depth (typically 20-25)
5. Click "Save All Settings"

### Requirements

Your custom engine API must:
1. Be accessible via HTTP/HTTPS
2. Accept FEN positions as input
3. Return moves in a supported format
4. Have CORS headers configured

## Local Engine Setup

**Quick Start:**

1. Install dependencies (Python or Node.js)
2. Download Stockfish from stockfishchess.org
3. Run the server (see examples below)
4. Configure extension to use http://localhost:8080/analyze

## Example Implementations

See the `/examples` directory for complete server implementations:
- `local_engine_server.py` - Python/Flask implementation
- `local_engine_server.js` - Node.js/Express implementation

## Engine Response Formats

### Stockfish Format
```json
{
  "bestmove": "e2e4",
  "evaluation": 0.5,
  "mate": null,
  "continuation": "e2e4 e7e5"
}
```

### Lichess Format
```json
{
  "pvs": [{
    "moves": "e2e4 e7e5",
    "cp": 50
  }]
}
```

### ChessDB Format
```
score:50,depth:20,pv:e2e4|e7e5
```

## Troubleshooting

### CORS Errors
Add these headers to your API:
```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, OPTIONS
```

### Testing
```bash
curl http://localhost:8080/health
curl "http://localhost:8080/analyze?fen=START_FEN&depth=15"
```

---
For complete documentation, visit the repository.
