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
      
      let messagesToAnalyze = [];

      // First, try to extract text directly from the DOM
      const domMessages = this.extractMessagesFromDOM();
      if (domMessages.length > 0) {
        console.log(`Found ${domMessages.length} messages in DOM`);
        messagesToAnalyze = messagesToAnalyze.concat(domMessages);
      } else {
        // Fallback: Use OCR if no messages found in DOM
        console.log('No messages found in DOM. Falling back to OCR.');
        const ocrMessages = await this.extractMessagesWithOCR();
        messagesToAnalyze = messagesToAnalyze.concat(ocrMessages);
      }
      
      if (messagesToAnalyze.length > 0) {
        console.log('Sending messages to background script for analysis.');
        
        const analysisResult = await chrome.runtime.sendMessage({
          action: 'analyze_text',
          text: messagesToAnalyze.join('\n')
        });

        if (analysisResult.success) {
          console.log('Analysis completed. Flagged messages:', analysisResult.flaggedMessages);
        }
        return { success: true };
      } else {
        console.log('No messages to analyze.');
        return { success: true, flaggedMessages: [] };
      }
    } catch (error) {
      console.error('Error during chat scan:', error);
      return { success: false, error: error.message };
    }
  }

  extractMessagesFromDOM() {
    // This is the part that will need to be customized for each app.
    console.warn("Warning: extractMessagesFromDOM() is not customized for this site and will likely fail.");
    return [];
  }

  async extractMessagesWithOCR() {
    // This is a placeholder for OCR functionality.
    console.log('Performing OCR to extract messages...');
    return [];
  }
  
  setupMutationObserver() {
    // This is a placeholder for setting up an observer to watch for new messages.
    console.log('Setting up mutation observer...');
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
      // A generic, non-specific check
      if (document.body) {
        this.scanCurrentChat();
      }
    }, interval);
  }
}

new ChatMonitor();