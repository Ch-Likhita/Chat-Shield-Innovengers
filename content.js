// content.js - Content script for Instagram chat monitoring
class InstagramChatMonitor {
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
    
    console.log('Instagram Safety Monitor: Initializing content script');
    
    // Check if we're on Instagram
    if (!window.location.hostname.includes('instagram.com')) {
      return;
    }
    
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
    console.log('Instagram Safety Monitor: Content script ready');
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
        break;
        
      case 'enableAutoScan':
        this.enableAutoScan();
        sendResponse({ success: true });
        break;
        
      default:
        sendResponse({ success: false, error: 'Unknown action' });
    }
  }

  async scanCurrentChat() {
    try {
      console.log('Starting chat scan...');
      
      // First, try to extract text directly from DOM
      const domMessages = this.extractMessagesFromDOM();
      
      if (domMessages.length > 0) {
        console.log(`Found ${domMessages.length} messages in