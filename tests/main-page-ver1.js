// main-page.js - Main JavaScript file for the frontend
class ChatShieldApp {
    constructor() {
        this.currentPage = 'home';
        this.init();
    }

    init() {
        // Wait for DOM to be fully loaded
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupEventListeners());
        } else {
            this.setupEventListeners();
        }
    }

    setupEventListeners() {
        console.log('ChatShield App: Setting up event listeners');

        // Action card clicks
        this.setupActionCards();
        
        // Navigation buttons
        this.setupNavigation();
        
        // Page-specific buttons
        this.setupPageButtons();
        
        // Bottom navigation
        this.setupBottomNav();
        
        // Chat functionality
        this.setupChatFeatures();
        
        // Load backend data
        this.loadBackendData();
    }

    setupActionCards() {
        const actionCards = document.querySelectorAll('.action-card');
        actionCards.forEach(card => {
            card.addEventListener('click', (e) => {
                const action = this.getActionFromCard(card);
                this.handleAction(action);
            });
        });
    }

    getActionFromCard(card) {
        if (card.classList.contains('instances')) return 'instances';
        if (card.classList.contains('resolve')) return 'resolve';
        if (card.classList.contains('report')) return 'report';
        if (card.classList.contains('monitor')) return 'monitor';
        return 'unknown';
    }

    setupNavigation() {
        // Back buttons
        const backButtons = document.querySelectorAll('.back-button');
        backButtons.forEach(button => {
            button.addEventListener('click', () => this.goBack());
        });

        // Header buttons
        const headerBtns = document.querySelectorAll('.header-btn');
        headerBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.handleHeaderButton(e.currentTarget);
            });
        });
    }

    setupPageButtons() {
        // Friendly Zone buttons
        const friendlyProfiles = document.querySelectorAll('.friendly-profile');
        friendlyProfiles.forEach(profile => {
            profile.addEventListener('click', (e) => {
                const profileId = this.getProfileId(profile);
                this.viewFriendlyProfile(profileId);
            });
        });

        // Resolve option buttons
        const resolveOptions = document.querySelectorAll('.resolve-option');
        resolveOptions.forEach(option => {
            option.addEventListener('click', (e) => {
                if (option.querySelector('h3').textContent.includes('Case Studies')) {
                    this.showCaseStudies();
                } else if (option.querySelector('h3').textContent.includes('AI Support')) {
                    this.showAIChat();
                }
            });
        });

        // Case study buttons
        const caseStudies = document.querySelectorAll('.case-study');
        caseStudies.forEach(study => {
            study.addEventListener('click', (e) => {
                const studyId = this.getCaseStudyId(study);
                this.viewCaseStudy(studyId);
            });
        });

        // Case item buttons
        const caseItems = document.querySelectorAll('.case-item');
        caseItems.forEach(item => {
            item.addEventListener('click', (e) => {
                const caseId = this.getCaseId(item);
                this.viewCase(caseId);
            });
        });

        // Friendly action buttons
        const friendlyBtns = document.querySelectorAll('.friendly-btn');
        friendlyBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent parent click
                const action = btn.textContent.trim();
                this.handleFriendlyAction(action, btn);
            });
        });

        // Case action buttons
        const caseBtns = document.querySelectorAll('.case-btn');
        caseBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent parent click
                const action = btn.textContent.trim();
                this.handleCaseAction(action, btn);
            });
        });
    }

    setupBottomNav() {
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                const tab = this.getTabFromNavItem(item);
                this.setActiveTab(item, tab);
            });
        });
    }

    setupChatFeatures() {
        // Chat input
        const chatInput = document.getElementById('chatInput');
        if (chatInput) {
            chatInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.sendMessage();
                }
            });
        }

        // Send button
        const sendButton = document.querySelector('.send-button');
        if (sendButton) {
            sendButton.addEventListener('click', () => this.sendMessage());
        }

        // Quick topic buttons
        const quickTopics = document.querySelectorAll('.quick-topic');
        quickTopics.forEach(topic => {
            topic.addEventListener('click', (e) => {
                const message = this.getQuickTopicMessage(topic);
                this.sendQuickMessage(message);
            });
        });
    }

    // Backend integration methods
    async loadBackendData() {
        try {
            // Load user detection history
            const response = await chrome.runtime.sendMessage({
                action: 'getDetectionHistory'
            });

            if (response && response.success) {
                this.updateUIWithBackendData(response.history);
            }
        } catch (error) {
            console.error('Error loading backend data:', error);
        }
    }

    updateUIWithBackendData(history) {
        // Update instances count
        const instancesDescription = document.querySelector('.action-card.instances .action-description');
        if (instancesDescription) {
            const count = history.length || 0;
            instancesDescription.textContent = `${count} total incidents documented`;
        }

        // Update protection status based on recent activity
        const recentIncidents = history.filter(item => {
            const itemDate = new Date(item.timestamp);
            const dayAgo = new Date();
            dayAgo.setDate(dayAgo.getDate() - 1);
            return itemDate > dayAgo;
        }).length;

        this.updateProtectionStatus(recentIncidents);
    }

    updateProtectionStatus(recentIncidents) {
        const protectionStatus = document.querySelector('.protection-status');
        if (protectionStatus) {
            if (recentIncidents > 0) {
                protectionStatus.innerHTML = `
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"/>
                    </svg>
                    <span>Recent Activity Detected</span>
                `;
                protectionStatus.style.background = 'linear-gradient(45deg, #ff4757, #ff3742)';
            } else {
                protectionStatus.innerHTML = `
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    <span>SafeGuard Active</span>
                `;
                protectionStatus.style.background = 'linear-gradient(45deg, #20b2aa, #45a049)';
            }
        }
    }

    // Navigation methods
    showPage(pageId) {
        // Hide all pages
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });
        
        // Show selected page
        const targetPage = document.getElementById(pageId + 'Page');
        if (targetPage) {
            targetPage.classList.add('active');
            this.currentPage = pageId;
        }
    }

    goBack() {
        this.addHapticFeedback();
        this.showPage('home');
        this.showNotification('Returning to home...');
    }

    async handleAction(action) {
        this.addHapticFeedback();

        switch (action) {
            case 'instances':
                await this.handleInstancesAction();
                break;
            case 'resolve':
                await this.handleResolveAction();
                break;
            case 'monitor':
                await this.handleMonitorAction();
                break;
            case 'report':
                await this.handleReportAction();
                break;
            default:
                this.showNotification('Unknown action');
        }
    }

    async handleInstancesAction() {
        this.showPage('instances');
        this.showNotification('Loading abuse instances...');

        // Load real data from backend
        try {
            const response = await chrome.runtime.sendMessage({
                action: 'getDetectionHistory'
            });

            if (response && response.success) {
                await this.populateInstancesPage(response.history);
            }
        } catch (error) {
            console.error('Error loading instances:', error);
        }
    }

    async populateInstancesPage(detectionHistory) {
        // Clear existing content and populate with real data
        const recentSection = document.querySelector('#instancesPage .section-card.recent');
        const historySection = document.querySelector('#instancesPage .section-card.history');
        
        if (!detectionHistory || detectionHistory.length === 0) {
            this.showNotification('No incidents found in history');
            return;
        }

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

        // Create case elements
        this.createCaseElements(recent, recentSection, true);
        this.createCaseElements(sortedHistory.slice(0, 10), historySection, false);
    }

    createCaseElements(cases, container, isRecent) {
        if (!container) return;

        // Find or create container for case items
        let caseContainer = container.querySelector('.case-items-container');
        if (!caseContainer) {
            caseContainer = document.createElement('div');
            caseContainer.className = 'case-items-container';
            container.appendChild(caseContainer);
        }

        caseContainer.innerHTML = '';

        cases.forEach(item => {
            const caseElement = this.createCaseElement(item, isRecent);
            caseContainer.appendChild(caseElement);
        });
    }

    createCaseElement(item, isRecent) {
        const div = document.createElement('div');
        const severity = this.getSeverityLevel(item.confidence || 0.5);
        const platform = this.extractPlatform(item.url);
        const timeAgo = this.getTimeAgo(item.timestamp);
        
        div.className = `case-item ${severity}`;
        div.innerHTML = `
            <div class="case-header">
                <div class="case-info">
                    <h3 class="case-title">${this.getTitleFromText(item.text)}</h3>
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
                <div class="case-severity ${severity}">${severity.toUpperCase()}</div>
            </div>
            <p class="case-description">${item.text.substring(0, 150)}${item.text.length > 150 ? '...' : ''}</p>
            <div class="case-actions">
                <button class="case-btn primary">View Details</button>
                <button class="case-btn secondary">Export</button>
            </div>
        `;
        
        // Add click handler for the new element
        div.addEventListener('click', () => this.viewCase(item.id || item.timestamp));
        
        // Add click handlers for buttons
        const buttons = div.querySelectorAll('.case-btn');
        buttons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const action = btn.textContent.trim();
                this.handleCaseAction(action, btn);
            });
        });
        
        return div;
    }

    async handleResolveAction() {
        this.showPage('resolve');
        this.showNotification('Loading self-help resources...');
        await this.initializeAIChat();
    }

    async handleMonitorAction() {
        this.showPage('friendlyZone');
        this.showNotification('Loading friendly zone...');
        await this.loadFriendlyZoneData();
    }

    async handleReportAction() {
        try {
            const response = await chrome.runtime.sendMessage({
                action: 'getDetectionHistory'
            });

            let recentHighSeverity = [];
            if (response && response.success) {
                recentHighSeverity = response.history.filter(item => 
                    item.confidence >= 0.8 && 
                    new Date(item.timestamp) > new Date(Date.now() - 24*60*60*1000)
                );
            }

            if (recentHighSeverity.length > 0) {
                chrome.tabs.create({ url: 'https://cybercrime.gov.in/' });
                this.showNotification(`Reporting ${recentHighSeverity.length} high-severity incidents...`);
            } else {
                chrome.tabs.create({ url: 'https://cybercrime.gov.in/' });
                this.showNotification('Opening incident reporting center...');
            }
        } catch (error) {
            console.error('Error handling report action:', error);
            this.showNotification('Opening report center...');
        }
    }

    // Chat methods
    async initializeAIChat() {
        const chatMessages = document.getElementById('chatMessages');
        if (!chatMessages) return;
        
        try {
            const response = await chrome.runtime.sendMessage({
                action: 'getDetectionHistory'
            });

            if (response && response.success && response.history.length > 0) {
                this.addContextualWelcomeMessage(response.history.length);
            }
        } catch (error) {
            console.error('Error initializing AI chat:', error);
        }
    }

    addContextualWelcomeMessage(historyCount) {
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
        
        chatMessages.appendChild(contextMessage);
    }

    sendQuickMessage(message) {
        this.addHapticFeedback();
        const chatInput = document.getElementById('chatInput');
        if (chatInput) {
            chatInput.value = message;
            this.sendMessage();
        }
    }

    sendMessage() {
        const chatInput = document.getElementById('chatInput');
        const message = chatInput.value.trim();
        
        if (!message) return;

        this.addHapticFeedback();
        
        // Add user message to chat
        this.addMessageToChat(message, 'user');
        
        // Clear input
        chatInput.value = '';
        
        // Generate AI response
        setTimeout(async () => {
            await this.generateContextualAIResponse(message);
        }, 1000);
    }

    addMessageToChat(message, sender) {
        const chatMessages = document.getElementById('chatMessages');
        if (!chatMessages) return;

        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message ${sender}-message`;
        
        messageDiv.innerHTML = `
            <div class="message-avatar">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                </svg>
            </div>
            <div class="message-content">
                <p>${message}</p>
            </div>
        `;
        
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    async generateContextualAIResponse(userMessage) {
        // Load user's history for context
        let userContext = { totalIncidents: 0, recentIncidents: 0, platforms: [], averageConfidence: 0 };
        
        try {
            const response = await chrome.runtime.sendMessage({
                action: 'getDetectionHistory'
            });

            if (response && response.success) {
                userContext = this.analyzeUserContext(response.history);
            }
        } catch (error) {
            console.error('Error getting user context:', error);
        }
        
        // Generate personalized response
        const response = this.generatePersonalizedResponse(userMessage, userContext);
        this.addMessageToChat(response, 'ai');
    }

    analyzeUserContext(detectionHistory) {
        const totalIncidents = detectionHistory.length;
        const recentIncidents = detectionHistory.filter(item => 
            new Date(item.timestamp) > new Date(Date.now() - 7*24*60*60*1000)
        ).length;
        
        const platforms = [...new Set(detectionHistory.map(item => this.extractPlatform(item.url)))];
        const averageConfidence = detectionHistory.length > 0 ? 
            detectionHistory.reduce((sum, item) => sum + (item.confidence || 0), 0) / detectionHistory.length : 0;
        
        return {
            totalIncidents,
            recentIncidents,
            platforms,
            averageConfidence,
            riskLevel: averageConfidence > 0.8 ? 'high' : averageConfidence > 0.6 ? 'medium' : 'low'
        };
    }

    generatePersonalizedResponse(message, context) {
        const baseResponse = this.getBaseResponse(message);
        
        if (context.totalIncidents > 0) {
            let personalizedResponse = baseResponse + `\n\nBased on your ${context.totalIncidents} documented incidents`;
            
            if (context.recentIncidents > 0) {
                personalizedResponse += ` (${context.recentIncidents} in the last week)`;
            }
            
            personalizedResponse += ', here are some specific recommendations:\n\n';
            
            if (context.riskLevel === 'high') {
                personalizedResponse += '🚨 **High Priority Actions:**\n';
                personalizedResponse += '• Consider involving authorities given the severity\n';
                personalizedResponse += '• Strengthen your privacy settings immediately\n';
            } else if (context.riskLevel === 'medium') {
                personalizedResponse += '⚠️ **Recommended Actions:**\n';
                personalizedResponse += '• Block the users immediately\n';
                personalizedResponse += '• Report through platform tools\n';
            }
            
            return personalizedResponse;
        }
        
        return baseResponse;
    }

    getBaseResponse(message) {
        const responses = {
            "I'm receiving threatening messages": "I understand this is very concerning and scary. Your safety is the top priority. Here's what I recommend:\n\n1. **Document everything** - Screenshot all messages with timestamps\n2. **Do not respond** - Any response may escalate the situation\n3. **Block the user** immediately on all platforms\n4. **Report to platform** - Use platform harassment reporting\n5. **Consider involving authorities** if threats mention specific harm",
            
            "Someone won't stop contacting me": "Persistent unwanted contact is harassment, and you have every right to stop it. Here's a step-by-step approach:\n\n1. **Send one clear message** stating you want no further contact\n2. **Block them immediately** after sending this message\n3. **Document the pattern** - save screenshots showing persistence\n4. **Use platform tools** - report for harassment\n5. **Don't engage further** - any response encourages them",
            
            "I'm feeling overwhelmed": "It's completely normal to feel overwhelmed when dealing with harassment. You're not alone, and these feelings are valid. Let's break this down:\n\n**Immediate steps:**\n- Take deep breaths - you're safe right now\n- Remember this is not your fault\n- You have support and options\n\n**Coping strategies:**\n- Talk to trusted friends/family\n- Take breaks from social media\n- Focus on activities that make you feel strong",
            
            "How do I document harassment?": "Proper documentation is crucial for effective action. Here's how to do it right:\n\n**What to document:**\n- Screenshots of messages, comments, posts\n- Usernames and profile information\n- Dates and times of incidents\n- Platform where it occurred\n- Any threats or escalation patterns\n\n**How to document:**\n- Use your phone's screenshot function\n- Save to a dedicated folder\n- Don't crop - show full context\n- Include the URL if possible\n- Write brief notes about how it made you feel"
        };
        
        return responses[message] || "Thank you for sharing that with me. Every situation is unique, and I want to give you the most relevant advice based on your specific circumstances. Could you tell me more details about what's happening?";
    }

    // Page-specific methods
    showCaseStudies() {
        this.addHapticFeedback();
        const caseStudiesSection = document.getElementById('caseStudiesSection');
        const aiChatSection = document.getElementById('aiChatSection');
        
        if (caseStudiesSection) caseStudiesSection.style.display = 'block';
        if (aiChatSection) aiChatSection.style.display = 'none';
        
        this.showNotification('Loading case studies...');
        if (caseStudiesSection) {
            caseStudiesSection.scrollIntoView({ behavior: 'smooth' });
        }
    }

    showAIChat() {
        this.addHapticFeedback();
        const caseStudiesSection = document.getElementById('caseStudiesSection');
        const aiChatSection = document.getElementById('aiChatSection');
        
        if (caseStudiesSection) caseStudiesSection.style.display = 'none';
        if (aiChatSection) aiChatSection.style.display = 'block';
        
        this.showNotification('AI assistant ready to help...');
        if (aiChatSection) {
            aiChatSection.scrollIntoView({ behavior: 'smooth' });
        }
    }

    async loadFriendlyZoneData() {
        try {
            const response = await chrome.runtime.sendMessage({
                action: 'getFriendlyProfiles'
            });

            if (response && response.success) {
                this.updateFriendlyZoneStats(response.profiles);
            }
        } catch (error) {
            console.error('Error loading friendly zone data:', error);
        }
    }

    updateFriendlyZoneStats(profiles) {
        // Update statistics in the friendly zone page
        const statsSection = document.querySelector('#friendlyZonePage .section-card.friendly-zone:last-child');
        if (statsSection) {
            const totalProfiles = profiles.length;
            const accuracyRate = totalProfiles > 0 ? 
                ((totalProfiles - profiles.filter(p => p.cleared).length) / totalProfiles * 100).toFixed(1) : 94.2;
            
            const accuracyDiv = statsSection.querySelector('div[style*="color: #26de81"]');
            if (accuracyDiv) accuracyDiv.textContent = `${accuracyRate}%`;
        }
    }

    // Utility methods
    getSeverityLevel(confidence) {
        if (confidence >= 0.8) return 'high';
        if (confidence >= 0.6) return 'medium';
        return 'low';
    }

    extractPlatform(url) {
        if (!url) return 'Unknown';
        if (url.includes('instagram.com')) return 'Instagram';
        if (url.includes('facebook.com')) return 'Facebook';
        if (url.includes('twitter.com')) return 'Twitter';
        if (url.includes('discord.com')) return 'Discord';
        return 'Web';
    }

    getTitleFromText(text) {
        if (!text) return 'No content';
        const words = text.split(' ').slice(0, 6).join(' ');
        return words.length > 40 ? words.substring(0, 40) + '...' : words;
    }

    getTimeAgo(timestamp) {
        const now = new Date();
        const time = new Date(timestamp);
        const diffMs = now - time;
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffHours / 24);
        
        if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
        if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        return 'Just now';
    }

    // Event handler helpers
    getProfileId(profile) {
        const username = profile.querySelector('.friendly-username');
        if (username) {
            const text = username.textContent.trim();
            return text.replace('@', '').replace(/\s+/g, '_').toLowerCase();
        }
        return 'unknown';
    }

    getCaseStudyId(study) {
        const title = study.querySelector('h3');
        if (title) {
            return title.textContent.toLowerCase().replace(/\s+/g, '-');
        }
        return 'unknown';
    }

    getCaseId(item) {
        const title = item.querySelector('.case-title');
        if (title) {
            return title.textContent.toLowerCase().replace(/\s+/g, '-');
        }
        return 'unknown';
    }

    getTabFromNavItem(item) {
        const span = item.querySelector('span');
        if (span) {
            return span.textContent.toLowerCase();
        }
        return 'home';
    }

    getQuickTopicMessage(topic) {
        return topic.textContent.trim();
    }

    handleHeaderButton(button) {
        this.addHapticFeedback(button);
        this.showNotification('Feature coming soon...');
    }

    handleFriendlyAction(action, button) {
        this.addHapticFeedback(button);
        if (action === 'Restore Trust') {
            this.showNotification('Trust restored successfully');
        } else if (action === 'View Details') {
            this.showNotification('Opening detailed view...');
        }
    }

    handleCaseAction(action, button) {
        this.addHapticFeedback(button);
        if (action === 'View Details') {
            this.showNotification('Opening case details...');
        } else if (action === 'Export') {
            this.showNotification('Exporting case data...');
        } else if (action === 'Take Action') {
            this.showNotification('Opening action options...');
        } else if (action === 'Report') {
            this.showNotification('Opening report interface...');
        }
    }

    viewFriendlyProfile(profileId) {
        this.addHapticFeedback();
        const profiles = {
            'alex_photographer': 'Viewing Alex\'s photography verification...',
            'maria_fitness_coach': 'Viewing Maria\'s fitness coaching credentials...',
            'david_pro_gamer': 'Viewing David\'s gaming community proof...',
            'dr_jennifer_med': 'Viewing Dr. Jennifer\'s medical license...'
        };
        this.showNotification(profiles[profileId] || 'Opening profile details...');
    }

    viewCaseStudy(studyId) {
        this.addHapticFeedback();
        const studies = {
            'persistent-messaging-after-blocking': 'Opening persistent messaging case study...',
            'professional-boundary-violations': 'Opening workplace harassment case study...',
            'threatening-messages-&-escalation': 'Opening threats escalation case study...'
        };
        this.showNotification(studies[studyId] || 'Opening case study...');
    }

    viewCase(caseId) {
        this.addHapticFeedback();
        this.showNotification(`Opening case ${caseId}...`);
    }

    setActiveTab(element, tab) {
        // Remove active class from all nav items
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        
        // Add active class to clicked item
        element.classList.add('active');
        
        this.addHapticFeedback(element);
        
        if (tab === 'home') {
            this.showPage('home');
        }
        
        const tabActions = {
            home: 'Home selected',
            alerts: 'Alerts opened',
            profile: 'Profile opened',
            settings: 'Settings opened'
        };
        
        this.showNotification(tabActions[tab] || 'Tab selected');
    }

    addHapticFeedback(element = null) {
        if (element) {
            element.classList.add('haptic-light');
            setTimeout(() => {
                element.classList.remove('haptic-light');
            }, 100);
        }
    }

    showNotification(message) {
        const toast = document.getElementById('notificationToast');
        if (toast) {
            toast.textContent = message;
            toast.classList.add('show');
            
            setTimeout(() => {
                toast.classList.remove('show');
            }, 2000);
        }
    }
}

// Initialize the app when the DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    window.chatShieldApp = new ChatShieldApp();
    
    // Prevent overscroll on mobile
    document.addEventListener('touchmove', function(e) {
        if (e.target === document.body) {
            e.preventDefault();
        }
    }, { passive: false });
});