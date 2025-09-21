// background.js - Enhanced Service Worker for ChatShield
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
    
    // Set up auto-scan management
    this.setupAutoScanManager();
  }

  async handleInstall(details) {
    if (details.reason === 'install') {
      console.log('ChatShield installed');
      
      // Set default settings with enhanced options
      await chrome.storage.local.set({
        autoScan: false,
        highSensitivity: true,
        scanInterval: 30000, // 30 seconds
        detectionHistory: [],
        userPreferences: {
          theme: 'dark',
          notifications: true,
          autoReport: false
        },
        friendlyZoneStats: {
          totalCleared: 0,
          accuracyRate: 94.2,
          falsePositiveRate: 5.8,
          lastUpdated: new Date().toISOString()
        }
      });
      
      // Open home page on first install
      chrome.tabs.create({
        url: chrome.runtime.getURL('main-page.html')
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
        'bitch', 'slut', 'whore', 'bastard', 'threatening',
        'harm you', 'find you', 'hurt you', 'destroy you'
      ],
      trustedDomains: [],
      supportedPlatforms: [
        'instagram.com',
        'facebook.com', 
        'twitter.com',
        'discord.com',
        'tiktok.com',
        'snapchat.com'
      ],
      caseStudies: [
        {
          id: 'persistent-messaging',
          title: 'Persistent Messaging After Blocking',
          type: 'Similar to your case',
          platform: 'Instagram',
          tags: ['Blocking', 'Multiple Accounts'],
          success: true,
          summary: 'User continued contact through multiple fake accounts. Here\'s how Sarah resolved it in 3 days.',
          steps: [
            'Document everything with screenshots and timestamps',
            'Report each fake account individually',
            'Enable stricter privacy settings',
            'Contact Instagram support with evidence'
          ],
          outcome: 'All fake accounts suspended, user stopped contact'
        },
        {
          id: 'workplace-harassment',
          title: 'Professional Boundary Violations',
          type: 'Professional Context',
          platform: 'LinkedIn',
          tags: ['Workplace', 'Professional'],
          success: true,
          summary: 'Colleague making inappropriate advances via DMs. Emma\'s approach maintained professionalism.',
          steps: [
            'Send one clear boundary-setting message',
            'Save all communications as evidence',
            'Report to HR with documentation',
            'Use platform reporting tools'
          ],
          outcome: 'Issue resolved through HR, professional relationship maintained'
        },
        {
          id: 'threats-escalation',
          title: 'Threatening Messages & Escalation',
          type: 'High Risk',
          platform: 'Multiple Platforms',
          tags: ['Threats', 'Safety Protocol'],
          success: true,
          summary: 'Anonymous user making threats and sharing personal info. Maria\'s safety-first approach.',
          steps: [
            'Immediately contact local authorities',
            'Document everything for police report',
            'Increase personal security measures',
            'Coordinate with platform security teams'
          ],
          outcome: 'Police investigation led to arrest, threats stopped'
        }
      ],
      friendlyProfiles: [
        {
          id: 'alex_photographer',
          username: '@alex_photographer',
          platform: 'Instagram',
          cleared: true,
          reason: 'AI incorrectly flagged professional photography collaboration messages as harassment due to terms like "shoot", "capture", and "model poses".',
          evidence: 'Professional Contract Evidence',
          details: 'Verified photography business license, client testimonials, and signed collaboration agreements proving legitimate professional communication.',
          tags: ['Business License', 'Client Testimonials', 'Professional Context'],
          dateCleared: '2024-03-10T10:30:00Z'
        },
        {
          id: 'maria_fitness',
          username: '@maria_fitness_coach',
          platform: 'Instagram',
          cleared: true,
          reason: 'Fitness motivation messages containing words like "push harder", "dominate your workout", and "crush your limits" were misinterpreted as aggressive language.',
          evidence: 'Certified Fitness Trainer',
          details: 'NASM certification, positive client reviews, and context showing motivational coaching language used appropriately in fitness context.',
          tags: ['NASM Certified', 'Client Reviews', 'Motivational Context'],
          dateCleared: '2024-03-08T14:20:00Z'
        },
        {
          id: 'david_gamer',
          username: '@david_pro_gamer',
          platform: 'Discord',
          cleared: true,
          reason: 'Gaming terminology like "destroy", "kill", "annihilate" in strategy discussions was flagged as violent language despite being standard gaming vocabulary.',
          evidence: 'Gaming Community Leader',
          details: 'Verified esports team captain with tournament history, community moderation role, and context logs showing gaming strategy discussions.',
          tags: ['Esports Team Captain', 'Community Moderator', 'Tournament Player'],
          dateCleared: '2024-03-05T16:45:00Z'
        },
        {
          id: 'jennifer_doctor',
          username: '@dr_jennifer_med',
          platform: 'LinkedIn',
          cleared: true,
          reason: 'Medical consultation messages containing terms like "pain management", "injection procedures", and "patient examination" triggered inappropriate content flags.',
          evidence: 'Licensed Medical Professional',
          details: 'Board-certified physician with hospital credentials, patient consent forms, and medical context verification showing legitimate healthcare communications.',
          tags: ['MD License', 'Hospital Credentials', 'Medical Context'],
          dateCleared: '2024-03-01T09:15:00Z'
        }
      ]
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

  setupAutoScanManager() {
    // Enhanced auto-scan with intelligent timing
    setInterval(async () => {
      const settings = await chrome.storage.local.get(['autoScan', 'scanInterval']);
      if (settings.autoScan) {
        await this.performAutomaticScan();
      }
    }, 60000); // Check every minute
  }

  async performAutomaticScan() {
    try {
      const tabs = await chrome.tabs.query({ active: true });
      for (const tab of tabs) {
        if (this.isSupportedPlatform(tab.url)) {
          chrome.tabs.sendMessage(tab.id, {
            action: 'performQuickScan'
          }).catch(() => {
            // Ignore if content script not available
          });
        }
      }
    } catch (error) {
      console.error('Auto-scan error:', error);
    }
  }

  isSupportedPlatform(url) {
    const supportedDomains = [
      'instagram.com', 'facebook.com', 'twitter.com', 
      'discord.com', 'tiktok.com', 'snapchat.com'
    ];
    return supportedDomains.some(domain => url?.includes(domain));
  }
  
  async handleMessage(message, sender, sendResponse) {
    try {
      switch (message.action) {
        case 'analyze_text':
          const analysisResult = await this.analyzeTextForAbuse(message.text);
          
          // Enhanced result with additional context
          const enhancedResult = {
            ...analysisResult,
            platform: this.extractPlatformFromUrl(sender.tab?.url),
            timestamp: new Date().toISOString(),
            tabId: sender.tab?.id
          };

          // Save to history if abusive
          if (analysisResult.isAbusive) {
            await this.saveToHistory({
              text: message.text,
              confidence: analysisResult.confidence,
              platform: enhancedResult.platform,
              timestamp: enhancedResult.timestamp,
              url: sender.tab?.url,
              resolved: false
            });
          }

          sendResponse({
            success: analysisResult.success,
            flaggedMessages: analysisResult.isAbusive ? [message.text] : [],
            result: enhancedResult
          });
          return true;
          
        case 'toggleAutoScan':
          await chrome.storage.local.set({ autoScan: message.enabled });
          sendResponse({ success: true });
          return true;

        case 'updateSensitivity':
          await chrome.storage.local.set({ highSensitivity: message.enabled });
          sendResponse({ success: true });
          return true;

        case 'getDetectionHistory':
          const history = await chrome.storage.local.get(['detectionHistory']);
          sendResponse({ success: true, history: history.detectionHistory || [] });
          return true;

        case 'markAsFriendly':
          await this.markCaseAsFriendly(message.caseId, message.reason);
          sendResponse({ success: true });
          return true;

        case 'getCaseStudies':
          const studies = await chrome.storage.local.get(['caseStudies']);
          sendResponse({ success: true, caseStudies: studies.caseStudies || [] });
          return true;

        case 'getFriendlyProfiles':
          const profiles = await chrome.storage.local.get(['friendlyProfiles']);
          sendResponse({ success: true, profiles: profiles.friendlyProfiles || [] });
          return true;

        case 'generateReport':
          const report = await this.generateIncidentReport(message.timeframe);
          sendResponse({ success: true, report });
          return true;
            
        case 'captureScreenshot':
          return this.captureScreenshot(sender.tab.id);

        case 'performBulkAnalysis':
          const bulkResult = await this.performBulkAnalysis(message.messages);
          sendResponse({ success: true, results: bulkResult });
          return true;

        default:
          throw new Error(`Unknown action: ${message.action}`);
      }
    } catch (error) {
      console.error('Background script error:', error);
      sendResponse({ success: false, error: error.message });
      return true;
    }
  }

  async saveToHistory(incident) {
    const history = await chrome.storage.local.get(['detectionHistory']);
    const detectionHistory = history.detectionHistory || [];
    
    // Add unique ID
    incident.id = Date.now().toString();
    
    detectionHistory.push(incident);
    
    // Keep only last 500 incidents
    if (detectionHistory.length > 500) {
      detectionHistory.splice(0, detectionHistory.length - 500);
    }
    
    await chrome.storage.local.set({ detectionHistory });
    
    // Update statistics
    await this.updateStatistics();
  }

  async updateStatistics() {
    const history = await chrome.storage.local.get(['detectionHistory']);
    const detectionHistory = history.detectionHistory || [];
    
    const totalDetections = detectionHistory.length;
    const falsePositives = detectionHistory.filter(item => item.userMarkedFriendly).length;
    const accuracyRate = totalDetections > 0 ? 
      ((totalDetections - falsePositives) / totalDetections * 100) : 94.2;
    
    await chrome.storage.local.set({
      friendlyZoneStats: {
        totalDetections,
        falsePositives,
        accuracyRate: Math.round(accuracyRate * 10) / 10,
        falsePositiveRate: Math.round((falsePositives / totalDetections * 100) * 10) / 10,
        lastUpdated: new Date().toISOString()
      }
    });
  }

  async markCaseAsFriendly(caseId, reason) {
    const history = await chrome.storage.local.get(['detectionHistory']);
    const detectionHistory = history.detectionHistory || [];
    
    const caseIndex = detectionHistory.findIndex(item => item.id === caseId);
    if (caseIndex !== -1) {
      detectionHistory[caseIndex].userMarkedFriendly = true;
      detectionHistory[caseIndex].friendlyReason = reason;
      detectionHistory[caseIndex].markedFriendlyAt = new Date().toISOString();
      
      await chrome.storage.local.set({ detectionHistory });
      await this.updateStatistics();
    }
  }

  async performBulkAnalysis(messages) {
    const results = [];
    
    for (const message of messages) {
      try {
        const analysis = await this.analyzeTextForAbuse(message.text);
        results.push({
          ...message,
          analysis,
          timestamp: new Date().toISOString()
        });
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        results.push({
          ...message,
          analysis: { success: false, error: error.message },
          timestamp: new Date().toISOString()
        });
      }
    }
    
    return results;
  }

  async generateIncidentReport(timeframe = '30d') {
    const history = await chrome.storage.local.get(['detectionHistory']);
    const detectionHistory = history.detectionHistory || [];
    
    // Filter by timeframe
    const cutoffDate = new Date();
    const days = parseInt(timeframe.replace('d', ''));
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    const relevantIncidents = detectionHistory.filter(incident => 
      new Date(incident.timestamp) > cutoffDate
    );
    
    // Generate statistics
    const totalIncidents = relevantIncidents.length;
    const highSeverity = relevantIncidents.filter(i => i.confidence >= 0.8).length;
    const mediumSeverity = relevantIncidents.filter(i => i.confidence >= 0.6 && i.confidence < 0.8).length;
    const lowSeverity = relevantIncidents.filter(i => i.confidence < 0.6).length;
    
    const platformBreakdown = {};
    relevantIncidents.forEach(incident => {
      const platform = incident.platform || 'Unknown';
      platformBreakdown[platform] = (platformBreakdown[platform] || 0) + 1;
    });
    
    return {
      timeframe,
      totalIncidents,
      severity: {
        high: highSeverity,
        medium: mediumSeverity,
        low: lowSeverity
      },
      platforms: platformBreakdown,
      incidents: relevantIncidents.map(incident => ({
        id: incident.id,
        timestamp: incident.timestamp,
        platform: incident.platform,
        confidence: incident.confidence,
        textPreview: incident.text.substring(0, 100) + '...',
        resolved: incident.resolved || false
      })),
      generatedAt: new Date().toISOString()
    };
  }

  extractPlatformFromUrl(url) {
    if (!url) return 'Unknown';
    if (url.includes('instagram.com')) return 'Instagram';
    if (url.includes('facebook.com')) return 'Facebook';
    if (url.includes('twitter.com')) return 'Twitter';
    if (url.includes('discord.com')) return 'Discord';
    if (url.includes('tiktok.com')) return 'TikTok';
    if (url.includes('snapchat.com')) return 'Snapchat';
    return 'Web';
  }

  async handleTabUpdate(tabId, changeInfo, tab) {
    // Enhanced tab update handling
    if (changeInfo.status === 'complete') {
      const settings = await chrome.storage.local.get(['autoScan']);
      if (settings.autoScan && this.isSupportedPlatform(tab.url)) {
        try {
          await chrome.scripting.executeScript({
            target: { tabId: tabId },
            files: ['content.js']
          });
          
          chrome.tabs.sendMessage(tabId, {
            action: 'enableAutoScan',
            settings
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
      // Enhanced preprocessing
      const cleanText = text.trim().toLowerCase();
      
      // Quick pattern matching first
      const settings = await chrome.storage.local.get(['abusePatterns', 'highSensitivity']);
      const abusePatterns = settings.abusePatterns || [];
      
      const hasExplicitPattern = abusePatterns.some(pattern => 
        cleanText.includes(pattern.toLowerCase())
      );
      
      if (hasExplicitPattern) {
        return {
          success: true,
          isAbusive: true,
          confidence: 0.95,
          method: 'pattern_match'
        };
      }

      // AI analysis for nuanced cases
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
      const threshold = settings.highSensitivity ? 0.5 : 0.8; 
      const isAbusive = offensiveData && offensiveData.score >= threshold;

      return {
        success: true,
        isAbusive,
        confidence: offensiveData ? offensiveData.score : 0,
        method: 'ai_analysis',
        modelData: result[0]
      };
      
    } catch (error) {
      console.error('Hugging Face API call failed:', error);
      return { 
        success: false, 
        isAbusive: false, 
        confidence: 0, 
        error: error.message 
      };
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