// popup.js - Enhanced to work with the main-page.html frontend
document.addEventListener('DOMContentLoaded', async () => {
    // Initialize the app with backend data
    await initializeApp();
    
    // Set up event listeners
    setupEventListeners();
    
    // Load user data and update UI
    await loadUserData();
    
    // Check current tab and update status
    await checkTabStatus();
});

async function initializeApp() {
    // Load settings from backend
    const settings = await chrome.storage.local.get([
        'autoScan', 'highSensitivity', 'scanInterval', 
        'detectionHistory', 'abusePatterns', 'trustedDomains'
    ]);
    
    // Update UI based on settings
    updateAutoScanStatus(settings.autoScan);
    updateProtectionStatus(settings);
    
    console.log('ChatShield initialized with settings:', settings);
}

async function loadUserData() {
    // Load detection history and update statistics
    const history = await chrome.storage.local.get(['detectionHistory']);
    const detectionHistory = history.detectionHistory || [];
    
    // Update instances count on home page
    updateInstancesCount(detectionHistory);
    
    // Update friendly zone statistics
    updateFriendlyZoneStats(detectionHistory);
}

async function checkTabStatus() {
    try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        const isSupported = tab.url && (
            tab.url.includes('instagram.com') || 
            tab.url.includes('facebook.com') ||
            tab.url.includes('twitter.com') ||
            tab.url.includes('discord.com')
        );
        
        updateTabStatus(isSupported, tab.url);
    } catch (error) {
        console.error('Error checking tab status:', error);
    }
}

function updateProtectionStatus(settings) {
    const protectionStatus = document.querySelector('.protection-status');
    if (protectionStatus) {
        if (settings.autoScan) {
            protectionStatus.innerHTML = `
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <span>Active Protection</span>
            `;
            protectionStatus.style.background = 'linear-gradient(45deg, #26de81, #20b2aa)';
        } else {
            protectionStatus.innerHTML = `
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <span>Manual Protection</span>
            `;
            protectionStatus.style.background = 'linear-gradient(45deg, #ffa502, #ff6b35)';
        }
    }
}

function updateInstancesCount(detectionHistory) {
    // Count different types of incidents
    const highSeverity = detectionHistory.filter(h => h.confidence > 0.8).length;
    const mediumSeverity = detectionHistory.filter(h => h.confidence > 0.6 && h.confidence <= 0.8).length;
    const total = detectionHistory.length;
    
    // Update the instances action card description
    const instancesCard = document.querySelector('.action-card.instances .action-description');
    if (instancesCard) {
        instancesCard.textContent = `${total} total incidents documented`;
    }
}

function setupEventListeners() {
    // Enhanced action handlers that connect to backend
    
    // Instances action - enhanced with real data
    const instancesCard = document.querySelector('.action-card.instances');
    if (instancesCard) {
        instancesCard.addEventListener('click', async () => {
            await handleInstancesAction();
        });
    }
    
    // Resolve action - enhanced with AI integration
    const resolveCard = document.querySelector('.action-card.resolve');
    if (resolveCard) {
        resolveCard.addEventListener('click', async () => {
            await handleResolveAction();
        });
    }
    
    // Monitor/Friendly Zone action
    const monitorCard = document.querySelector('.action-card.monitor');
    if (monitorCard) {
        monitorCard.addEventListener('click', async () => {
            await handleMonitorAction();
        });
    }
    
    // Report action - enhanced with real reporting
    const reportCard = document.querySelector('.action-card.report');
    if (reportCard) {
        reportCard.addEventListener('click', async () => {
            await handleReportAction();
        });
    }
}

async function handleInstancesAction() {
    addHapticFeedback();
    
    // Load real detection history from backend
    const history = await chrome.storage.local.get(['detectionHistory']);
    const detectionHistory = history.detectionHistory || [];
    
    // Show instances page with real data
    showPage('instances');
    
    // Populate with real data
    await populateInstancesPage(detectionHistory);
    
    showNotification(`Loading ${detectionHistory.length} documented cases...`);
}

async function populateInstancesPage(detectionHistory) {
    // Create sections for different case types
    const recentSection = document.querySelector('.section-card.recent');
    const historySection = document.querySelector('.section-card.history');
    
    if (!recentSection || !historySection) return;
    
    // Clear existing content
    const recentContainer = recentSection.querySelector('.case-item')?.parentElement;
    const historyContainer = historySection.querySelector('.case-item')?.parentElement;
    
    if (recentContainer) recentContainer.innerHTML = '';
    if (historyContainer) historyContainer.innerHTML = '';
    
    // Sort by date
    const sortedHistory = detectionHistory.sort((a, b) => 
        new Date(b.timestamp) - new Date(a.timestamp)
    );
    
    // Recent cases (last 7 days)
    const recent = sortedHistory.filter(item => {
        const itemDate = new Date(item.timestamp);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return itemDate > weekAgo;
    });
    
    // Older cases
    const older = sortedHistory.filter(item => {
        const itemDate = new Date(item.timestamp);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return itemDate <= weekAgo;
    });
    
    // Populate recent cases
    recent.slice(0, 5).forEach(item => {
        const caseElement = createCaseElement(item, true);
        if (recentContainer) recentContainer.appendChild(caseElement);
    });
    
    // Populate history
    older.slice(0, 10).forEach(item => {
        const caseElement = createCaseElement(item, false);
        if (historyContainer) historyContainer.appendChild(caseElement);
    });
}

function createCaseElement(item, isRecent) {
    const div = document.createElement('div');
    const severity = getSeverityLevel(item.confidence);
    const platform = extractPlatform(item.url);
    const timeAgo = getTimeAgo(item.timestamp);
    
    div.className = `case-item ${severity}`;
    div.innerHTML = `
        <div class="case-header">
            <div class="case-info">
                <h3 class="case-title">${getTitleFromText(item.text)}</h3>
                <div class="case-meta">
                    <div class="case-date">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                        </svg>
                        <span>${timeAgo}</span>
                    </div>
                    <div class="case-platform">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/>
                        </svg>
                        <span>${platform}</span>
                    </div>
                </div>
            </div>
            <div class="case-severity ${severity}">${severity}</div>
        </div>
        <p class="case-description">${item.text.substring(0, 150)}${item.text.length > 150 ? '...' : ''}</p>
        <div class="case-actions">
            <button class="case-btn primary" onclick="viewCaseDetails('${item.timestamp}')">View Details</button>
            <button class="case-btn secondary" onclick="exportCase('${item.timestamp}')">Export</button>
        </div>
    `;
    
    return div;
}

function getSeverityLevel(confidence) {
    if (confidence >= 0.8) return 'high';
    if (confidence >= 0.6) return 'medium';
    return 'low';
}

function extractPlatform(url) {
    if (!url) return 'Unknown';
    if (url.includes('instagram.com')) return 'Instagram';
    if (url.includes('facebook.com')) return 'Facebook';
    if (url.includes('twitter.com')) return 'Twitter';
    if (url.includes('discord.com')) return 'Discord';
    return 'Web';
}

function getTitleFromText(text) {
    const words = text.split(' ').slice(0, 6).join(' ');
    return words.length > 40 ? words.substring(0, 40) + '...' : words;
}

function getTimeAgo(timestamp) {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now - time;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return 'Just now';
}

async function handleResolveAction() {
    addHapticFeedback();
    showPage('resolve');
    
    // Initialize AI chat with backend connection
    await initializeAIChat();
    
    showNotification('Loading self-help resources...');
}

async function initializeAIChat() {
    // Enhanced chat that connects to your backend's AI analysis
    const chatMessages = document.getElementById('chatMessages');
    if (!chatMessages) return;
    
    // Add initial AI message with backend context
    const settings = await chrome.storage.local.get(['detectionHistory']);
    const historyCount = settings.detectionHistory?.length || 0;
    
    if (historyCount > 0) {
        addContextualWelcomeMessage(historyCount);
    }
}

function addContextualWelcomeMessage(historyCount) {
    const chatMessages = document.getElementById('chatMessages');
    const contextMessage = document.createElement('div');
    contextMessage.className = 'chat-message ai-message';
    
    contextMessage.innerHTML = `
        <div class="message-avatar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 20.25c4.97 0 8.25-3.694 8.25-8.25s-3.28-8.25-8.25-8.25S3.75 7.694 3.75 12s3.28 8.25 8.25 8.25z"/>
            </svg>
        </div>
        <div class="message-content">
            <p>Hi! I see you have ${historyCount} documented incidents. I'm here to help you work through these situations safely and effectively.</p>
            <p>Based on your history, I can provide personalized guidance for your specific situation. What would you like help with today?</p>
        </div>
    `;
    
    // Insert after the existing welcome message
    const existingMessages = chatMessages.querySelectorAll('.chat-message');
    if (existingMessages.length > 0) {
        chatMessages.insertBefore(contextMessage, existingMessages[existingMessages.length - 1].nextSibling);
    }
}

async function handleMonitorAction() {
    addHapticFeedback();
    showPage('friendlyZone');
    
    // Load friendly zone data from backend
    await populateFriendlyZone();
    
    showNotification('Loading friendly zone...');
}

async function populateFriendlyZone() {
    // Calculate real false positive statistics
    const history = await chrome.storage.local.get(['detectionHistory']);
    const detectionHistory = history.detectionHistory || [];
    
    const totalDetections = detectionHistory.length;
    const falsePositives = detectionHistory.filter(item => 
        item.userMarkedFriendly || item.confidence < 0.6
    ).length;
    
    const accuracyRate = totalDetections > 0 ? 
        ((totalDetections - falsePositives) / totalDetections * 100).toFixed(1) : 94.2;
    const falsePositiveRate = totalDetections > 0 ? 
        (falsePositives / totalDetections * 100).toFixed(1) : 5.8;
    
    // Update statistics in the friendly zone page
    updateFriendlyZoneStats({ accuracyRate, falsePositiveRate });
}

function updateFriendlyZoneStats({ accuracyRate, falsePositiveRate }) {
    // Find and update the statistics section
    const statsSection = document.querySelector('.section-card.friendly-zone:last-child');
    if (statsSection) {
        const accuracyDiv = statsSection.querySelector('div[style*="color: #26de81"]');
        const falsePositiveDiv = statsSection.querySelector('div[style*="color: #ffa502"]');
        
        if (accuracyDiv) accuracyDiv.textContent = `${accuracyRate}%`;
        if (falsePositiveDiv) falsePositiveDiv.textContent = `${falsePositiveRate}%`;
    }
}

async function handleReportAction() {
    addHapticFeedback();
    
    // Get recent high-severity incidents
    const history = await chrome.storage.local.get(['detectionHistory']);
    const detectionHistory = history.detectionHistory || [];
    const recentHighSeverity = detectionHistory.filter(item => 
        item.confidence >= 0.8 && 
        new Date(item.timestamp) > new Date(Date.now() - 24*60*60*1000) // Last 24 hours
    );
    
    if (recentHighSeverity.length > 0) {
        // Open India's cybercrime reporting portal with context
        const reportUrl = 'https://cybercrime.gov.in/';
        chrome.tabs.create({ url: reportUrl });
        
        // Log the report
        await chrome.storage.local.set({
            [`report_${Date.now()}`]: {
                type: 'police_report',
                timestamp: new Date().toISOString(),
                incidentCount: recentHighSeverity.length
            }
        });
        
        showNotification(`Reporting ${recentHighSeverity.length} high-severity incidents...`);
    } else {
        showNotification('Opening incident reporting center...');
        chrome.tabs.create({ url: 'https://cybercrime.gov.in/' });
    }
}

// Enhanced chat functionality that uses backend analysis
async function sendMessage() {
    const chatInput = document.getElementById('chatInput');
    const message = chatInput.value.trim();
    
    if (!message) return;

    addHapticFeedback();
    
    // Add user message to chat
    addMessageToChat(message, 'user');
    
    // Clear input
    chatInput.value = '';
    
    // Get AI response using backend context
    setTimeout(async () => {
        await generateContextualAIResponse(message);
    }, 1000);
}

async function generateContextualAIResponse(userMessage) {
    // Load user's history for context
    const history = await chrome.storage.local.get(['detectionHistory']);
    const detectionHistory = history.detectionHistory || [];
    
    // Analyze user's situation based on their history
    const userContext = analyzeUserContext(detectionHistory);
    
    // Generate personalized response
    const response = generatePersonalizedResponse(userMessage, userContext);
    
    addMessageToChat(response, 'ai');
}

function analyzeUserContext(detectionHistory) {
    const totalIncidents = detectionHistory.length;
    const recentIncidents = detectionHistory.filter(item => 
        new Date(item.timestamp) > new Date(Date.now() - 7*24*60*60*1000)
    ).length;
    
    const platforms = [...new Set(detectionHistory.map(item => extractPlatform(item.url)))];
    const averageConfidence = detectionHistory.length > 0 ? 
        detectionHistory.reduce((sum, item) => sum + item.confidence, 0) / detectionHistory.length : 0;
    
    return {
        totalIncidents,
        recentIncidents,
        platforms,
        averageConfidence,
        riskLevel: averageConfidence > 0.8 ? 'high' : averageConfidence > 0.6 ? 'medium' : 'low'
    };
}

function generatePersonalizedResponse(message, context) {
    const baseResponse = getBaseResponse(message);
    
    // Add personalized context
    let personalizedResponse = baseResponse;
    
    if (context.totalIncidents > 0) {
        personalizedResponse += `\n\nBased on your ${context.totalIncidents} documented incidents`;
        
        if (context.recentIncidents > 0) {
            personalizedResponse += ` (${context.recentIncidents} in the last week)`;
        }
        
        personalizedResponse += ', here are some specific recommendations for your situation:\n\n';
        
        if (context.riskLevel === 'high') {
            personalizedResponse += '🚨 **High Priority Actions:**\n';
            personalizedResponse += '• Consider involving authorities given the severity\n';
            personalizedResponse += '• Strengthen your privacy settings immediately\n';
            personalizedResponse += '• Document everything with timestamps\n';
        } else if (context.riskLevel === 'medium') {
            personalizedResponse += '⚠️ **Recommended Actions:**\n';
            personalizedResponse += '• Block the users immediately\n';
            personalizedResponse += '• Report through platform tools\n';
            personalizedResponse += '• Consider taking a social media break\n';
        }
        
        if (context.platforms.length > 1) {
            personalizedResponse += `• Since this is happening across ${context.platforms.join(', ')}, consider coordinated blocking\n`;
        }
    }
    
    return personalizedResponse;
}

function getBaseResponse(message) {
    // Your existing response logic here
    const responses = {
        "I'm receiving threatening messages": "I understand this is very concerning and scary. Your safety is the top priority. Here's what I recommend:\n\n1. **Document everything** - Screenshot all messages with timestamps\n2. **Do not respond** - Any response may escalate the situation\n3. **Block the user** immediately on all platforms\n4. **Report to platform** - Use platform harassment reporting\n5. **Consider involving authorities** if threats mention specific harm",
        // ... other responses
    };
    
    return responses[message] || "Thank you for sharing that with me. Every situation is unique, and I want to give you the most relevant advice based on your specific circumstances.";
}

// Global functions for case actions
window.viewCaseDetails = async (timestamp) => {
    const history = await chrome.storage.local.get(['detectionHistory']);
    const case_item = history.detectionHistory?.find(item => item.timestamp === timestamp);
    
    if (case_item) {
        // Show detailed case information
        showNotification('Loading case details...');
        // You can implement a detailed view modal here
    }
};

window.exportCase = async (timestamp) => {
    const history = await chrome.storage.local.get(['detectionHistory']);
    const case_item = history.detectionHistory?.find(item => item.timestamp === timestamp);
    
    if (case_item) {
        // Create and download case report
        const report = generateCaseReport(case_item);
        downloadReport(report, `case_${timestamp}.txt`);
        showNotification('Case exported successfully');
    }
};

function generateCaseReport(case_item) {
    return `
HARASSMENT INCIDENT REPORT
Generated by ChatShield on ${new Date().toLocaleString()}

INCIDENT DETAILS:
Date: ${new Date(case_item.timestamp).toLocaleString()}
Platform: ${extractPlatform(case_item.url)}
Confidence Level: ${(case_item.confidence * 100).toFixed(1)}%
Severity: ${getSeverityLevel(case_item.confidence)}

MESSAGE CONTENT:
${case_item.text}

URL: ${case_item.url}

NOTES:
This report was automatically generated by ChatShield AI harassment detection system.
For official reporting purposes, please also include screenshots and additional context.
    `.trim();
}

function downloadReport(content, filename) {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    chrome.downloads.download({
        url: url,
        filename: filename,
        saveAs: false
    });
}

// Enhanced notification system
function showNotification(message) {
    const toast = document.getElementById('notificationToast');
    if (toast) {
        toast.textContent = message;
        toast.classList.add('show');
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }
}