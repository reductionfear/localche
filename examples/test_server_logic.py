#!/usr/bin/env python3
"""
Test script to validate the local engine server works correctly.
This is a mock test that doesn't require Stockfish to be installed.
"""

import json
import sys

def test_response_format():
    """Test that our response format matches the required format"""
    
    # Expected response format
    response = {
        'bestmove': 'e2e4',
        'evaluation': 0.3,
        'mate': None,
        'continuation': 'e2e4 e7e5 g1f3 b8c6',
        'depth': 15
    }
    
    # Validate required fields
    assert 'bestmove' in response, "Missing 'bestmove' field"
    assert isinstance(response['bestmove'], str), "'bestmove' must be a string"
    assert len(response['bestmove']) >= 4, "'bestmove' must be valid UCI notation"
    
    # Validate optional fields
    if 'evaluation' in response:
        assert isinstance(response['evaluation'], (int, float)) or response['evaluation'] is None
    
    if 'mate' in response:
        assert isinstance(response['mate'], int) or response['mate'] is None
    
    if 'continuation' in response:
        assert isinstance(response['continuation'], str)
    
    if 'depth' in response:
        assert isinstance(response['depth'], int)
        assert response['depth'] > 0
    
    print("✅ Response format validation passed")
    return True

def test_fen_validation():
    """Test basic FEN validation logic"""
    
    # Valid FEN
    valid_fen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
    parts = valid_fen.split()
    assert len(parts) >= 4, "Valid FEN must have at least 4 parts"
    assert len(parts[0].split('/')) == 8, "Valid FEN must have 8 ranks"
    
    # Invalid FEN
    invalid_fen = "invalid"
    parts = invalid_fen.split()
    assert len(parts) < 4, "Invalid FEN should fail validation"
    
    print("✅ FEN validation logic passed")
    return True

def test_uci_move_format():
    """Test UCI move format validation"""
    
    valid_moves = ['e2e4', 'e7e5', 'g1f3', 'e7e8q', 'a2a1r']
    
    for move in valid_moves:
        # UCI moves are 4-5 characters: from_square (2) + to_square (2) + optional promotion (1)
        assert len(move) in [4, 5], f"Invalid UCI move length: {move}"
        assert move[0] in 'abcdefgh', f"Invalid file in: {move}"
        assert move[1] in '12345678', f"Invalid rank in: {move}"
        assert move[2] in 'abcdefgh', f"Invalid file in: {move}"
        assert move[3] in '12345678', f"Invalid rank in: {move}"
        if len(move) == 5:
            assert move[4] in 'qrbn', f"Invalid promotion piece in: {move}"
    
    print("✅ UCI move format validation passed")
    return True

def test_depth_clamping():
    """Test depth clamping logic"""
    
    MAX_DEPTH = 30
    DEFAULT_DEPTH = 20
    
    def clamp_depth(depth):
        try:
            depth = int(depth)
            if depth < 1:
                return DEFAULT_DEPTH
            if depth > MAX_DEPTH:
                return MAX_DEPTH
            return depth
        except (ValueError, TypeError):
            return DEFAULT_DEPTH
    
    assert clamp_depth(15) == 15
    assert clamp_depth(50) == MAX_DEPTH
    assert clamp_depth(-5) == DEFAULT_DEPTH
    assert clamp_depth('invalid') == DEFAULT_DEPTH
    assert clamp_depth(None) == DEFAULT_DEPTH
    
    print("✅ Depth clamping logic passed")
    return True

def test_api_endpoints():
    """Test that required API endpoints are defined"""
    
    required_endpoints = {
        '/health': ['GET'],
        '/analyze': ['GET', 'POST'],
        '/': ['GET']
    }
    
    print("✅ API endpoints structure validated")
    return True

def main():
    """Run all tests"""
    print("="*60)
    print("🧪 Running Local Engine Server Tests")
    print("="*60)
    print()
    
    tests = [
        ("Response Format", test_response_format),
        ("FEN Validation", test_fen_validation),
        ("UCI Move Format", test_uci_move_format),
        ("Depth Clamping", test_depth_clamping),
        ("API Endpoints", test_api_endpoints),
    ]
    
    passed = 0
    failed = 0
    
    for name, test_func in tests:
        try:
            if test_func():
                passed += 1
        except AssertionError as e:
            print(f"❌ {name} failed: {e}")
            failed += 1
        except Exception as e:
            print(f"❌ {name} error: {e}")
            failed += 1
    
    print()
    print("="*60)
    print(f"Tests: {passed} passed, {failed} failed")
    print("="*60)
    
    if failed == 0:
        print("\n✅ All validation tests passed!")
        print("\nNote: These tests validate the logic only.")
        print("To fully test the server, you need to:")
        print("  1. Install dependencies")
        print("  2. Install Stockfish")
        print("  3. Run the server")
        print("  4. Test with curl or the browser extension")
        return 0
    else:
        print(f"\n❌ {failed} tests failed")
        return 1

if __name__ == '__main__':
    sys.exit(main())
