#!/usr/bin/env node
/**
 * Local Chess Engine Server (Node.js/Express)
 * 
 * This server provides a local chess analysis API using Stockfish.
 * It's designed to work with the Chess Smart Analyzer Pro browser extension.
 * 
 * Requirements:
 *     npm install express cors
 * 
 * Usage:
 *     1. Update STOCKFISH_PATH below
 *     2. Run: node local_engine_server.js
 *     3. Server will start on http://localhost:8080
 * 
 * Author: Chess Smart Analyzer Pro
 * License: MIT
 */

const express = require('express');
const cors = require('cors');
const { spawn } = require('child_process');
const fs = require('fs');

// ============================================
// CONFIGURATION
// ============================================

// Path to your Stockfish binary
// Update this to match your system!
const STOCKFISH_PATH = 'stockfish'; // or '/usr/local/bin/stockfish', 'C:\\stockfish\\stockfish.exe', etc.

// Server configuration
const HOST = '127.0.0.1';  // Use '0.0.0.0' to allow external connections (NOT recommended)
const PORT = process.env.PORT || 8080;

// Engine configuration
const MAX_DEPTH = 30;
const DEFAULT_DEPTH = 20;
const THREADS = 4;  // Number of CPU cores to use
const HASH_SIZE = 256;  // MB of hash table

// ============================================
// APPLICATION SETUP
// ============================================

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ============================================
// STOCKFISH ENGINE WRAPPER
// ============================================

/**
 * Analyze a chess position using Stockfish
 * @param {string} fen - FEN string of the position
 * @param {number} depth - Analysis depth
 * @returns {Promise<object>} Analysis result
 */
async function analyzePosition(fen, depth = DEFAULT_DEPTH) {
    return new Promise((resolve, reject) => {
        const stockfish = spawn(STOCKFISH_PATH);
        let output = '';
        let errorOutput = '';
        
        // Collect stdout
        stockfish.stdout.on('data', (data) => {
            output += data.toString();
        });
        
        // Collect stderr
        stockfish.stderr.on('data', (data) => {
            errorOutput += data.toString();
        });
        
        // Handle process completion
        stockfish.on('close', (code) => {
            if (code !== 0 && errorOutput) {
                reject(new Error(`Stockfish error: ${errorOutput}`));
                return;
            }
            
            // Parse Stockfish output
            const lines = output.split('\n');
            let bestMove = null;
            let evaluation = 0;
            let mate = null;
            let pv = [];
            let actualDepth = depth;
            
            // Find best move and evaluation from output
            for (const line of lines) {
                // Best move
                if (line.startsWith('bestmove')) {
                    const parts = line.split(' ');
                    bestMove = parts[1];
                }
                
                // Principal variation (PV) - the best line
                if (line.includes(' pv ')) {
                    const pvIndex = line.indexOf(' pv ');
                    if (pvIndex !== -1) {
                        const pvLine = line.substring(pvIndex + 4).trim();
                        pv = pvLine.split(' ').filter(m => m && m.length > 0).slice(0, 10);
                    }
                }
                
                // Evaluation score (centipawns)
                if (line.includes('score cp')) {
                    const cpMatch = line.match(/score cp (-?\d+)/);
                    if (cpMatch) {
                        evaluation = parseInt(cpMatch[1]) / 100.0;
                    }
                }
                
                // Mate score
                if (line.includes('score mate')) {
                    const mateMatch = line.match(/score mate (-?\d+)/);
                    if (mateMatch) {
                        mate = parseInt(mateMatch[1]);
                        evaluation = null;
                    }
                }
                
                // Actual depth reached
                if (line.includes(' depth ')) {
                    const depthMatch = line.match(/depth (\d+)/);
                    if (depthMatch) {
                        actualDepth = Math.max(actualDepth, parseInt(depthMatch[1]));
                    }
                }
            }
            
            // Build response
            resolve({
                bestmove: bestMove,
                evaluation: evaluation,
                mate: mate,
                continuation: pv.join(' '),
                depth: actualDepth
            });
        });
        
        // Handle errors
        stockfish.on('error', (error) => {
            reject(new Error(`Failed to spawn Stockfish: ${error.message}`));
        });
        
        // Send commands to Stockfish
        try {
            stockfish.stdin.write('uci\n');
            stockfish.stdin.write(`setoption name Threads value ${THREADS}\n`);
            stockfish.stdin.write(`setoption name Hash value ${HASH_SIZE}\n`);
            stockfish.stdin.write(`position fen ${fen}\n`);
            stockfish.stdin.write(`go depth ${depth}\n`);
            stockfish.stdin.write('quit\n');
            stockfish.stdin.end();
        } catch (error) {
            reject(error);
        }
    });
}

/**
 * Validate FEN string (basic validation)
 * @param {string} fen - FEN string to validate
 * @returns {boolean} True if valid
 */
function validateFen(fen) {
    if (!fen || typeof fen !== 'string') return false;
    
    // Basic FEN validation: should have 6 parts separated by spaces
    const parts = fen.trim().split(/\s+/);
    if (parts.length < 4) return false;
    
    // Check piece placement (first part)
    const ranks = parts[0].split('/');
    if (ranks.length !== 8) return false;
    
    return true;
}

// ============================================
// API ENDPOINTS
// ============================================

/**
 * Health check endpoint
 */
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        engine: 'stockfish',
        version: '1.0.0',
        max_depth: MAX_DEPTH
    });
});

/**
 * Analyze position endpoint (GET)
 */
app.get('/analyze', async (req, res) => {
    try {
        const fen = req.query.fen;
        let depth = parseInt(req.query.depth) || DEFAULT_DEPTH;
        
        // Validate inputs
        if (!fen) {
            return res.status(400).json({ error: 'No FEN provided' });
        }
        
        if (!validateFen(fen)) {
            return res.status(400).json({ error: 'Invalid FEN string' });
        }
        
        // Clamp depth
        if (depth < 1) depth = DEFAULT_DEPTH;
        if (depth > MAX_DEPTH) depth = MAX_DEPTH;
        
        // Analyze
        const result = await analyzePosition(fen, depth);
        res.json(result);
        
    } catch (error) {
        console.error('❌ Analysis error:', error.message);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Analyze position endpoint (POST)
 */
app.post('/analyze', async (req, res) => {
    try {
        const { fen, depth = DEFAULT_DEPTH } = req.body;
        
        // Validate inputs
        if (!fen) {
            return res.status(400).json({ error: 'No FEN provided' });
        }
        
        if (!validateFen(fen)) {
            return res.status(400).json({ error: 'Invalid FEN string' });
        }
        
        // Clamp depth
        let analysisDepth = parseInt(depth) || DEFAULT_DEPTH;
        if (analysisDepth < 1) analysisDepth = DEFAULT_DEPTH;
        if (analysisDepth > MAX_DEPTH) analysisDepth = MAX_DEPTH;
        
        // Analyze
        const result = await analyzePosition(fen, analysisDepth);
        res.json(result);
        
    } catch (error) {
        console.error('❌ Analysis error:', error.message);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Root endpoint with API documentation
 */
app.get('/', (req, res) => {
    res.json({
        name: 'Chess Engine API',
        version: '1.0.0',
        endpoints: {
            '/health': 'GET - Health check',
            '/analyze': 'GET/POST - Analyze position (params: fen, depth)',
        },
        documentation: 'https://github.com/your-repo/docs/ENGINES.md'
    });
});

// ============================================
// ERROR HANDLERS
// ============================================

app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
});

app.use((error, req, res, next) => {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Internal server error' });
});

// ============================================
// STARTUP
// ============================================

/**
 * Check if Stockfish is available
 */
function checkStockfish() {
    return new Promise((resolve, reject) => {
        const test = spawn(STOCKFISH_PATH, ['--help']);
        
        test.on('error', (error) => {
            reject(new Error(`Stockfish not found at: ${STOCKFISH_PATH}\n` +
                           `Please download from: https://stockfishchess.org/download/\n` +
                           `Then update STOCKFISH_PATH in this script`));
        });
        
        test.on('close', (code) => {
            resolve();
        });
    });
}

/**
 * Main entry point
 */
async function main() {
    console.log('='.repeat(60));
    console.log('🏠 Chess Engine Local Server (Node.js)');
    console.log('='.repeat(60));
    console.log();
    
    // Check Stockfish
    try {
        await checkStockfish();
        console.log(`✅ Stockfish engine found: ${STOCKFISH_PATH}`);
        console.log(`   Threads: ${THREADS}`);
        console.log(`   Hash: ${HASH_SIZE}MB`);
    } catch (error) {
        console.error(`❌ ${error.message}`);
        process.exit(1);
    }
    
    console.log();
    
    // Start server
    app.listen(PORT, HOST, () => {
        console.log(`🚀 Server running on http://${HOST}:${PORT}`);
        console.log();
        console.log('Available endpoints:');
        console.log(`  - http://${HOST}:${PORT}/health`);
        console.log(`  - http://${HOST}:${PORT}/analyze?fen=...&depth=20`);
        console.log();
        console.log('Press Ctrl+C to stop');
        console.log('='.repeat(60));
        console.log();
    });
}

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\n\n✅ Server stopped');
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\n\n✅ Server stopped');
    process.exit(0);
});

// Start the server
main().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
});
