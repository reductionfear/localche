// content.js - MUST HAVE THIS CODE
// Content Script - Injects analyzer into page
(function() {
  'use strict';

  console.log('🎯 Content script loaded');

  if (window.chessAnalyzerInjected) {
    console.log('⚠️ Already injected');
    return;
  }
  window.chessAnalyzerInjected = true;

  chrome.storage.sync.get({
    enabled: true,
    autoStart: true,
    defaultEngine: 'chessdb',
    defaultMode: 'blitz',
    customEngineUrl: '',
    customEngineFormat: 'stockfish',
    customEngineDepth: 20,
    localEngineUrl: 'http://localhost:8080/analyze'
  }, (settings) => {
    console.log('📋 Settings:', settings);

    const script = document.createElement('script');
    script.src = chrome.runtime.getURL('analyzer.js');
    script.onload = function() {
      console.log('✅ Analyzer injected');
      
      // Configure custom engine if URL is provided
      if (window.chessSmartAnalyzer && settings.customEngineUrl) {
        window.chessSmartAnalyzer.setCustomEngine(
          settings.customEngineUrl,
          settings.customEngineFormat,
          settings.customEngineDepth
        );
        console.log('⚙️ Custom engine configured:', settings.customEngineUrl);
      }
      
      // Configure local engine if URL is different from default
      if (window.chessSmartAnalyzer && settings.localEngineUrl && 
          settings.localEngineUrl !== 'http://localhost:8080/analyze') {
        // Update local engine config in analyzer
        setTimeout(() => {
          if (window.chessSmartAnalyzer.config && window.chessSmartAnalyzer.config.engines) {
            window.chessSmartAnalyzer.config.engines.local.endpoint = settings.localEngineUrl;
            console.log('🏠 Local engine URL updated:', settings.localEngineUrl);
          }
        }, 100);
      }
      
      // Set default engine
      if (window.chessSmartAnalyzer && settings.defaultEngine) {
        setTimeout(() => window.chessSmartAnalyzer.setEngine(settings.defaultEngine), 500);
      }
      
      // Set default mode
      if (window.chessSmartAnalyzer && settings.defaultMode !== 'blitz') {
        setTimeout(() => window.chessSmartAnalyzer.setMode(settings.defaultMode), 700);
      }
      
      this.remove();
    };
    (document.head || document.documentElement).appendChild(script);
  });

  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'ping') {
      sendResponse({ status: 'ready', injected: !!window.chessSmartAnalyzer });
      return true;
    }

    if (request.action === 'settingsUpdated') {
      // Reload settings when they change
      chrome.storage.sync.get(null, (settings) => {
        if (window.chessSmartAnalyzer) {
          // Update custom engine if configured
          if (settings.customEngineUrl) {
            window.chessSmartAnalyzer.setCustomEngine(
              settings.customEngineUrl,
              settings.customEngineFormat || 'stockfish',
              settings.customEngineDepth || 20
            );
          }
          // Update local engine URL if changed
          if (settings.localEngineUrl && window.chessSmartAnalyzer.config?.engines?.local) {
            window.chessSmartAnalyzer.config.engines.local.endpoint = settings.localEngineUrl;
          }
          console.log('✅ Settings updated');
        }
      });
      sendResponse({ success: true });
      return true;
    }

    if (!window.chessSmartAnalyzer) {
      sendResponse({ error: 'Not loaded' });
      return true;
    }

    try {
      switch (request.action) {
        case 'analyze':
          window.chessSmartAnalyzer.analyze();
          sendResponse({ success: true });
          break;
        case 'setMode':
          window.chessSmartAnalyzer.setMode(request.mode);
          sendResponse({ success: true });
          break;
        case 'setEngine':
          window.chessSmartAnalyzer.setEngine(request.engine);
          sendResponse({ success: true });
          break;
        case 'setMoveSpeed':
          window.chessSmartAnalyzer.setMoveSpeed(request.speed);
          sendResponse({ success: true });
          break;
        case 'enableAutoMove':
          window.chessSmartAnalyzer.enableAutoMove();
          sendResponse({ success: true });
          break;
        case 'disableAutoMove':
          window.chessSmartAnalyzer.disableAutoMove();
          sendResponse({ success: true });
          break;
        case 'moveNow':
          window.chessSmartAnalyzer.moveNow();
          sendResponse({ success: true });
          break;
        case 'getStatus':
          sendResponse({ success: true, data: window.chessSmartAnalyzer.status() });
          break;
        default:
          sendResponse({ error: 'Unknown action' });
      }
    } catch (error) {
      sendResponse({ error: error.message });
    }

    return true;
  });

  console.log('✅ Content script ready');
})();
