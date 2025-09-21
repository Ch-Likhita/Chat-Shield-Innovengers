// content.js - Enhanced content script with platform-specific detection
class ChatMonitor {
  constructor() {
    this.isInitialized = false;
    this.autoScanEnabled = false;
    this.scanInterval = null;
    this.lastScanTime = 0;
    this.processedMessages = new Set();
    this.ocrWorker = null;
    this.currentPlatform = this.detectPlatform();
    this.messageSelectors = this.getPlatformSelectors();
    
    this.init();
  }

  detectPlatform() {
    const hostname = window.location.hostname;
    if (hostname.includes('instagram.com')) return 'instagram';
    if (hostname.includes('facebook.com')) return 'facebook';
    if (hostname.includes('twitter.com')) return 'twitter';
    if (hostname.includes('discord.com')) return 'discord';
    if (hostname.includes('tiktok.com')) return 'tiktok';
    if (hostname.includes('snapchat.com')) return 'snapchat';
    return 'unknown';
  }

  getPlatformSelectors() {
    const selectors = {
      instagram: {
        messages: [
          'div[role="main"] div[dir="auto"]',
          '.x1n2onr6',
          '._ab8w._ab94._ab99._ab9f._ab9m._ab9p._ab9t._ab9u._aba8._abcm',
          'div[data-testid="message-text"]'
        ],
        chatContainer: [
          'div[role="main"]',
          '.x1qjc9v5',
          'section[role="main"]'
        ],
        messageInput: [
          'div[contenteditable="true"]',
          'textarea[placeholder*="Message"]',
          'div[aria-label*="Message"]'
        ]
      },
      facebook: {
        messages: [
          'div[data-testid="conversation_message"]',
          '.x1n2onr6 > div',
          'div[role="gridcell"] span'
        ],
        chatContainer: [
          'div[data-testid="messenger_desktop_chat_tab_root"]',
          'div[role="complementary"]'
        ]
      },
      twitter: {
        messages: [
          'div[data-testid="messageEntry"]',
          'div[data-testid="tweetText"]'
        ],
        chatContainer: [
          'div[data-testid="primaryColumn"]'
        ]
      },
      discord: {
        messages: [
          '.messageContent__21e69',
          'div[id^="message-content"]',
          '.markup__284d5'
        ],
        chatContainer: [
          '.messagesWrapper__90932',
          '.scrollerInner__059a5'
        ]
      },
      unknown: {
        messages: [
          'div[contenteditable="true"]',
          'textarea',
          'input[type="text"]',
          '.message',
          '.chat-message',
          '[data-message]'
        ],
        chatContainer: [
          'body'
        ]
      }
    };

    return selectors[this.currentPlatform] || selectors.unknown;
  }

  async init() {
    if (this.isInitialized) return;
    
    console.log(`Safety Monitor: Initializing for ${this.currentPlatform}`);
    
    // Initialize OCR if needed
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
    console.log(`Safety Monitor: Ready on ${this.currentPlatform}`);
  }

  async initializeOCR() {
    try {
      if (!window.Tesseract) {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/tesseract.js/4.1.1/tesseract.min.js';
        document.head.appendChild(script);
        
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
        return true;
        
      case 'toggleAutoScan':
        this.toggleAutoScan(message.enabled);
        sendResponse({ success: true });
        return true;
        
      case 'enableAutoScan':
        this.enableAutoScan(message.settings?.scanInterval || 30000);
        sendResponse({ success: true });
        return true;

      case 'performQuickScan':
        this.performQuickScan().then(sendResponse);
        return true;
        
      default:
        sendResponse({ success: false, error: 'Unknown action' });
        return true;
    }
  }

  async scanCurrentChat() {
    try {
      console.log(`Starting chat scan on ${this.currentPlatform}...`);
      
      let messagesToAnalyze = [];

      // Platform-specific message extraction
      const domMessages = this.extractMessagesFromDOM();
      if (domMessages.length > 0) {
        console.log(`Found ${domMessages.length} messages in DOM`);
        messagesToAnalyze = domMessages;
      } else {
        // Fallback to OCR
        console.log('No messages found in DOM. Trying OCR...');
        const ocrMessages = await this.extractMessagesWithOCR();
        messagesToAnalyze = ocrMessages;
      }
      
      if (messagesToAnalyze.length > 0) {
        // Analyze each message individually for better granularity
        const results = [];
        
        for (const message of messagesToAnalyze) {
          if (message.trim() && !this.processedMessages.has(message)) {
            try {
              const analysisResult = await chrome.runtime.sendMessage({
                action: 'analyze_text',
                text: message
              });

              if (analysisResult.success) {
                results.push({
                  text: message,
                  isAbusive: analysisResult.result?.isAbusive || false,
                  confidence: analysisResult.result?.confidence || 0,
                  platform: this.currentPlatform,
                  timestamp: new Date().toISOString()
                });
                
                // Mark as processed to avoid re-analyzing
                this.processedMessages.add(message);
              }
            } catch (error) {
              console.error('Error analyzing message:', error);
            }
          }
        }

        return { 
          success: true, 
          results: results,
          platform: this.currentPlatform,
          messageCount: messagesToAnalyze.length
        };
      } else {
        return { 
          success: true, 
          results: [],
          platform: this.currentPlatform,
          messageCount: 0
        };
      }
    } catch (error) {
      console.error('Error during chat scan:', error);
      return { success: false, error: error.message };
    }
  }

  extractMessagesFromDOM() {
    const messages = [];
    const selectors = this.messageSelectors.messages;
    
    for (const selector of selectors) {
      try {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
          const text = this.extractTextFromElement(element);
          if (text && text.trim().length > 0) {
            messages.push(text.trim());
          }
        });
        
        if (messages.length > 0) {
          console.log(`Found messages using selector: ${selector}`);
          break; // Use the first selector that works
        }
      } catch (error) {
        console.log(`Selector ${selector} failed:`, error);
      }
    }
    
    // Remove duplicates and filter out system messages
    const uniqueMessages = [...new Set(messages)]
      .filter(msg => this.isUserMessage(msg))
      .slice(-20); // Get last 20 messages
    
    return uniqueMessages;
  }

  extractTextFromElement(element) {
    // Try different text extraction methods
    let text = element.textContent || element.innerText || '';
    
    // For Instagram, try specific patterns
    if (this.currentPlatform === 'instagram') {
      // Check for message spans
      const messageSpans = element.querySelectorAll('span');
      if (messageSpans.length > 0) {
        text = Array.from(messageSpans)
          .map(span => span.textContent)
          .join(' ');
      }
    }
    
    return text;
  }

  isUserMessage(text) {
    // Filter out system messages, timestamps, etc.
    const systemPatterns = [
      /^\d+:\d+/,  // Timestamps
      /^(Mon|Tue|Wed|Thu|Fri|Sat|Sun)/,  // Day names
      /^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)/,  // Month names
      /^(Active|Online|Offline)/i,  // Status messages
      /^(Sent|Delivered|Read)/i,  // Message status
      /^(You|They|This person)/i,  // Generic pronouns
      /^[\d\s]+$/,  // Only numbers and spaces
      /^[^\w\s]*$/  // Only symbols
    ];
    
    return text.length > 3 && 
           text.length < 5000 && 
           !systemPatterns.some(pattern => pattern.test(text));
  }

  async extractMessagesWithOCR() {
    if (!window.Tesseract) {
      console.log('OCR not available');
      return [];
    }

    try {
      // Take screenshot of chat area
      const chatContainer = this.findChatContainer();
      if (!chatContainer) {
        console.log('Chat container not found for OCR');
        return [];
      }

      // Use html2canvas or similar to capture the chat area
      // For now, we'll return empty array as OCR implementation
      // would require additional libraries
      console.log('OCR extraction would happen here');
      return [];
    } catch (error) {
      console.error('OCR extraction failed:', error);
      return [];
    }
  }

  findChatContainer() {
    const selectors = this.messageSelectors.chatContainer;
    
    for (const selector of selectors) {
      const element = document.querySelector(selector);
      if (element) {
        return element;
      }
    }
    
    return null;
  }

  async performQuickScan() {
    // Quick scan for auto-scanning - only scan new messages
    try {
      const newMessages = this.extractMessagesFromDOM()
        .filter(msg => !this.processedMessages.has(msg));
      
      if (newMessages.length > 0) {
        console.log(`Quick scan found ${newMessages.length} new messages`);
        
        for (const message of newMessages.slice(0, 5)) { // Limit to 5 for quick scan
          const result = await chrome.runtime.sendMessage({
            action: 'analyze_text',
            text: message
          });
          
          if (result.success && result.result?.isAbusive) {
            // Show notification for abusive content
            this.showAbuseNotification(message, result.result.confidence);
          }
          
          this.processedMessages.add(message);
        }
      }
      
      return { success: true, newMessages: newMessages.length };
    } catch (error) {
      console.error('Quick scan error:', error);
      return { success: false, error: error.message };
    }
  }

  showAbuseNotification(message, confidence) {
    // Create and show notification
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: linear-gradient(135deg, #ff4757, #ff3742);
      color: white;
      padding: 12px 16px;
      border-radius: 8px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      z-index: 10000;
      max-width: 300px;
      animation: slideIn 0.3s ease-out;
    `;
    
    notification.innerHTML = `
      <div style="display: flex; align-items: center; gap: 8px;">
        <div style="font-weight: bold;">⚠️ Abusive Content Detected</div>
        <button onclick="this.parentElement.parentElement.remove()" style="
          background: none; 
          border: none; 
          color: white; 
          cursor: pointer; 
          font-size: 18px;
          padding: 0;
          margin-left: auto;
        ">×</button>
      </div>
      <div style="font-size: 12px; opacity: 0.9; margin-top: 4px;">
        Confidence: ${Math.round(confidence * 100)}%
      </div>
    `;
    
    // Add animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(notification);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      if (notification.parentElement) {
        notification.remove();
      }
    }, 5000);
  }
  
  setupMutationObserver() {
    // Set up observer to watch for new messages
    const chatContainer = this.findChatContainer();
    if (!chatContainer) {
      console.log('No chat container found for mutation observer');
      return;
    }

    const observer = new MutationObserver((mutations) => {
      let hasNewMessages = false;
      
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          hasNewMessages = true;
        }
      });
      
      if (hasNewMessages && this.autoScanEnabled) {
        // Debounce the scan to avoid too many requests
        clearTimeout(this.scanTimeout);
        this.scanTimeout = setTimeout(() => {
          this.performQuickScan();
        }, 2000);
      }
    });

    observer.observe(chatContainer, {
      childList: true,
      subtree: true
    });
    
    this.mutationObserver = observer;
    console.log('Mutation observer set up for new messages');
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
    
    // Set up periodic scanning
    this.scanInterval = setInterval(() => {
      if (document.body && document.hasFocus()) {
        this.performQuickScan();
      }
    }, interval);
    
    console.log(`Auto-scan enabled with ${interval}ms interval`);
  }

  cleanup() {
    if (this.scanInterval) clearInterval(this.scanInterval);
    if (this.mutationObserver) this.mutationObserver.disconnect();
    if (this.scanTimeout) clearTimeout(this.scanTimeout);
  }
}

// Initialize the monitor
const chatMonitor = new ChatMonitor();

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  if (chatMonitor) {
    chatMonitor.cleanup();
  }
});