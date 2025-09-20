// content.js - Content script for chat monitoring on any social media platform
class ChatMonitor {
  constructor() {
    this.isInitialized = false;
    this.autoScanEnabled = false;
    this.scanInterval = null;
    this.lastScanTime = 0;
    this.processedMessages = new Set();
    this.ocrWorker = null;
    
    this.init();
  }

  async init() {
    if (this.isInitialized) return;
    
    console.log('Safety Monitor: Initializing content script');
    
    // Check if we're on a supported social media site (optional: customize this check)
    // if (!window.location.hostname.includes('instagram.com')) {
    //   return;
    // }
    
    // Initialize Tesseract.js for OCR
    await this.initializeOCR();
    
    // Listen for messages from popup and background
    chrome.runtime.onMessage.addListener(this.handleMessage.bind(this));
    
    // Set up mutation observer for dynamic content
    this.setupMutationObserver();
    
    // Check auto-scan settings
    const settings = await chrome.storage.local.get(['autoScan', 'scanInterval']);
    if (settings.autoScan) {
      this.enableAutoScan(settings.scanInterval || 30000);
    }
    
    this.isInitialized = true;
    console.log('Safety Monitor: Content script ready');
  }

  async initializeOCR() {
    try {
      // Load Tesseract.js from CDN
      if (!window.Tesseract) {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/tesseract.js/4.1.1/tesseract.min.js';
        document.head.appendChild(script);
        
        // Wait for Tesseract to load
        await new Promise((resolve) => {
          script.onload = resolve;
        });
      }
      
      console.log('OCR engine loaded successfully');
    } catch (error) {
      console.error('Failed to load OCR engine:', error);
    }
  }

  handleMessage(message, sender, sendResponse) {
    switch (message.action) {
      case 'scanChat':
        this.scanCurrentChat().then(sendResponse);
        return true; // Keep message channel open for async response
        
      case 'toggleAutoScan':
        this.toggleAutoScan(message.enabled);
        sendResponse({ success: true });
        return true;
        
      case 'enableAutoScan':
        this.enableAutoScan();
        sendResponse({ success: true });
        return true;
        
      default:
        sendResponse({ success: false, error: 'Unknown action' });
        return true;
    }
  }

  async scanCurrentChat() {
    try {
      console.log('Starting chat scan...');
      
      // First, try to extract text directly from DOM
      const domMessages = this.extractMessagesFromDOM();
      
      if (domMessages.length > 0) {
        console.log(`Found ${domMessages.length} messages in DOM`);
        const flaggedMessages = await this.analyzeMessages(domMessages);
        this.reportFlaggedMessages(flaggedMessages);
        return { success: true, flaggedMessages };
      } else {
        // Fallback: Use OCR if no messages found in DOM
        const ocrMessages = await this.extractMessagesWithOCR();
        if (ocrMessages.length > 0) {
          const flaggedMessages = await this.analyzeMessages(ocrMessages);
          this.reportFlaggedMessages(flaggedMessages);
          return { success: true, flaggedMessages };
        } else {
          return { success: true, flaggedMessages: [] };
        }
      }
    } catch (error) {
      console.error('Error during chat scan:', error);
      return { success: false, error: error.message };
    }
  }

  // Placeholder methods for demonstration
  extractMessagesFromDOM() {
    // Implement logic to extract messages from the DOM for any social media platform
    return [];
  }

  async analyzeMessages(messages) {
    // Implement logic to analyze messages
    return [];
  }

  reportFlaggedMessages(flaggedMessages) {
    // Implement logic to report flagged messages
  }

  async extractMessagesWithOCR() {
    // Implement logic to extract messages using OCR
    return [];
  }

  setupMutationObserver() {
    // Implement logic to observe DOM changes for new messages
  }

  toggleAutoScan(enabled) {
    this.autoScanEnabled = enabled;
    if (enabled) {
      this.enableAutoScan();
    } else {
      if (this.scanInterval) clearInterval(this.scanInterval);
      this.scanInterval = null;
    }
  }

  enableAutoScan(interval = 30000) {
    if (this.scanInterval) clearInterval(this.scanInterval);
    this.autoScanEnabled = true;
    this.scanInterval = setInterval(() => {
      this.scanCurrentChat();
    }, interval);
  }
}

new ChatMonitor();