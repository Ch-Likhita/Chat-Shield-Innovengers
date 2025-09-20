// background.js - Service Worker for Chrome Extension
class InstagramSafetyMonitor {
  constructor() {
    this.isScanning = false;
    this.scanInterval = null;
    this.init();
  }

  init() {
    // Listen for extension installation
    chrome.runtime.onInstalled.addListener(this.handleInstall.bind(this));
    
    // Listen for messages from popup and content scripts
    chrome.runtime.onMessage.addListener(this.handleMessage.bind(this));
    
    // Listen for tab updates to inject content script
    chrome.tabs.onUpdated.addListener(this.handleTabUpdate.bind(this));
    
    // Initialize storage with default settings
    this.initializeStorage();
  }

  async handleInstall(details) {
    if (details.reason === 'install') {
      console.log('Instagram Safety Monitor installed');
      
      // Set default settings
      await chrome.storage.local.set({
        autoScan: false,
        highSensitivity: true,
        scanInterval: 30000, // 30 seconds
        detectionHistory: []
      });
      
      // Open welcome/setup page
      chrome.tabs.create({
        url: chrome.runtime.getURL('welcome.html')
      });
    }
  }

  async initializeStorage() {
    const defaultSettings = {
      autoScan: false,
      highSensitivity: true,
      scanInterval: 30000,
      detectionHistory: [],
      abusePatterns: [
        // Basic abuse patterns - can be expanded
        'kill yourself', 'kys', 'die', 'hate you', 'stupid',
        'idiot', 'loser', 'ugly', 'fat', 'worthless',
        'bitch', 'slut', 'whore', 'bastard'
      ],
      trustedDomains: ['instagram.com']
    };

    const current = await chrome.storage.local.get(Object.keys(defaultSettings));
    
    // Set defaults for any missing settings
    const updates = {};
    for (const [key, value] of Object.entries(defaultSettings)) {
      if (current[key] === undefined) {
        updates[key] = value;
      }
    }
    
    if (Object.keys(updates).length > 0) {
      await chrome.storage.local.set(updates);
    }
  }

  async handleMessage(message, sender, sendResponse) {
    try {
      switch (message.action) {
        case 'captureScreenshot':
          return this.captureScreenshot(sender.tab.id);
          
        case 'analyzeText':
          return this.analyzeTextForAbuse(message.text, message.options);
          
        case 'saveDetection':
          return this.saveDetectionResult(message.data);
          
        case 'getSettings':
          return chrome.storage.local.get();
          
        case 'updateSettings':
          return chrome.storage.local.set(message.settings);
          
        default:
          throw new Error(`Unknown action: ${message.action}`);
      }
    } catch (error) {
      console.error('Background script error:', error);
      return { success: false, error: error.message };
    }
  }

  async handleTabUpdate(tabId, changeInfo, tab) {
    if (changeInfo.status === 'complete' && 
        tab.url && 
        tab.url.includes('instagram.com')) {
      
      // Check if auto-scan is enabled
      const settings = await chrome.storage.local.get(['autoScan']);
      if (settings.autoScan) {
        // Inject content script and enable auto-scanning
        try {
          await chrome.scripting.executeScript({
            target: { tabId: tabId },
            files: ['content.js']
          });
          
          // Enable auto-scan on the page
          chrome.tabs.sendMessage(tabId, {
            action: 'enableAutoScan'
          }).catch(() => {
            // Ignore errors if content script isn't ready
          });
        } catch (error) {
          console.log('Could not inject content script:', error);
        }
      }
    }
  }

  async captureScreenshot(tabId) {
    try {
      const dataUrl = await chrome.tabs.captureVisibleTab(null, {
        format: 'png',
        quality: 90
      });
      
      return { success: true, dataUrl };
    } catch (error) {
      console.error('Screenshot capture failed:', error);
      return { success: false, error: error.message };
    }
  }

  async analyzeTextForAbuse(text, options = {}) {
    const settings = await chrome.storage.local.get(['abusePatterns', 'highSensitivity']);
    const patterns = settings.abusePatterns || [];
    const highSensitivity = settings.highSensitivity !== false;
    
    // Normalize text for analysis
    const normalizedText = text.toLowerCase().trim();
    
    if (!normalizedText) {
      return { success: true, isAbusive: false, confidence: 0 };
    }

    // Basic pattern matching
    let abuseScore = 0;
    let matchedPatterns = [];
    
    for (const pattern of patterns) {
      if (normalizedText.includes(pattern.toLowerCase())) {
        abuseScore += 1;
        matchedPatterns.push(pattern);
      }
    }

    // Advanced analysis (simplified NLP)
    const abuseIndicators = this.getAbuseIndicators();
    const sentimentScore = this.analyzeSentiment(normalizedText, abuseIndicators);
    
    // Combine scores
    const finalScore = (abuseScore * 0.6) + (sentimentScore * 0.4);
    const threshold = highSensitivity ? 0.3 : 0.6;
    const isAbusive = finalScore > threshold;
    
    return {
      success: true,
      isAbusive,
      confidence: Math.min(finalScore, 1.0),
      matchedPatterns,
      details: {
        patternScore: abuseScore,
        sentimentScore,
        finalScore,
        threshold
      }
    };
  }

  getAbuseIndicators() {
    return {
      threats: ['kill', 'die', 'hurt', 'harm', 'destroy'],
      insults: ['stupid', 'idiot', 'loser', 'ugly', 'fat', 'worthless'],
      profanity: ['damn', 'shit', 'fuck', 'bitch', 'bastard'],
      harassment: ['hate', 'disgusting', 'pathetic', 'failure'],
      cyberbullying: ['everyone hates', 'nobody likes', 'kill yourself', 'end it all']
    };
  }

  analyzeSentiment(text, indicators) {
    let negativeScore = 0;
    let totalWords = text.split(/\s+/).length;
    
    for (const [category, words] of Object.entries(indicators)) {
      for (const word of words) {
        if (text.includes(word)) {
          // Weight different categories
          const weight = category === 'threats' || category === 'cyberbullying' ? 2 : 1;
          negativeScore += weight;
        }
      }
    }
    
    // Normalize by text length
    return totalWords > 0 ? Math.min(negativeScore / totalWords, 1.0) : 0;
  }

  async saveDetectionResult(data) {
    try {
      const history = await chrome.storage.local.get(['detectionHistory']);
      const historyArray = history.detectionHistory || [];
      
      historyArray.push({
        ...data,
        timestamp: new Date().toISOString(),
        id: Date.now()
      });
      
      // Keep only last 1000 entries
      if (historyArray.length > 1000) {
        historyArray.splice(0, historyArray.length - 1000);
      }
      
      await chrome.storage.local.set({ detectionHistory: historyArray });
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Utility method to check if current tab is Instagram
  async isInstagramTab(tabId) {
    try {
      const tab = await chrome.tabs.get(tabId);
      return tab.url && tab.url.includes('instagram.com');
    } catch {
      return false;
    }
  }
}

// Initialize the background service
const safetyMonitor = new InstagramSafetyMonitor();

// Handle extension lifecycle
chrome.runtime.onSuspend.addListener(() => {
  console.log('Instagram Safety Monitor suspending...');
});

chrome.runtime.onStartup.addListener(() => {
  console.log('Instagram Safety Monitor starting up...');
});