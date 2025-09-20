// background.js - Service Worker for ChatShield
class ChatShieldBackground {
  constructor() {
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
      console.log('ChatShield installed');
      
      // Set default settings
      await chrome.storage.local.set({
        autoScan: false,
        highSensitivity: true,
        scanInterval: 30000, // 30 seconds
        detectionHistory: []
      });
      
      // Open home page on first install
      chrome.tabs.create({
        url: chrome.runtime.getURL('home-page.html')
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
        'kill yourself', 'kys', 'die', 'hate you', 'stupid',
        'idiot', 'loser', 'ugly', 'fat', 'worthless',
        'bitch', 'slut', 'whore', 'bastard'
      ],
      trustedDomains: [] // Removed Instagram specific domain
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
        case 'analyze_text':
          const analysisResult = await this.analyzeTextForAbuse(message.text);
          sendResponse({
            success: analysisResult.success,
            flaggedMessages: analysisResult.isAbusive ? [message.text] : []
          });
          return true;
          
        case 'toggleAutoScan':
            await chrome.storage.local.set({ autoScan: message.enabled });
            sendResponse({ success: true });
            return;
            
        case 'captureScreenshot':
          return this.captureScreenshot(sender.tab.id);

        default:
          throw new Error(`Unknown action: ${message.action}`);
      }
    } catch (error) {
      console.error('Background script error:', error);
      sendResponse({ success: false, error: error.message });
      return true;
    }
  }

  async handleTabUpdate(tabId, changeInfo, tab) {
    // Check if auto-scan is enabled and the tab has finished loading
    if (changeInfo.status === 'complete') {
      const settings = await chrome.storage.local.get(['autoScan']);
      if (settings.autoScan) {
        try {
          // This will execute the content script on any page that updates
          await chrome.scripting.executeScript({
            target: { tabId: tabId },
            files: ['content.js']
          });
          
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

  async analyzeTextForAbuse(text) {
    const HUGGING_FACE_TOKEN = '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';
    const MODEL_API_URL = 'https://api-inference.huggingface.co/models/cardiffnlp/twitter-roberta-base-offensive';

    if (!text) {
      return { success: true, isAbusive: false, confidence: 0 };
    }

    try {
      const response = await fetch(MODEL_API_URL, {
        headers: {
          'Authorization': `Bearer ${HUGGING_FACE_TOKEN}`,
          'Content-Type': 'application/json'
        },
        method: 'POST',
        body: JSON.stringify({ inputs: text })
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      
      const offensiveData = result[0].find(item => item.label === 'OFF');

      const settings = await chrome.storage.local.get(['highSensitivity']);
      const threshold = settings.highSensitivity ? 0.5 : 0.8; 

      const isAbusive = offensiveData && offensiveData.score >= threshold;

      return {
        success: true,
        isAbusive,
        confidence: offensiveData ? offensiveData.score : 0
      };
      
    } catch (error) {
      console.error('Hugging Face API call failed:', error);
      return { success: false, isAbusive: false, confidence: 0, error: error.message };
    }
  }
}

// Initialize the background service
const safetyMonitor = new ChatShieldBackground();

// Handle extension lifecycle
chrome.runtime.onSuspend.addListener(() => {
  console.log('ChatShield suspending...');
});

chrome.runtime.onStartup.addListener(() => {
  console.log('ChatShield starting up...');
});