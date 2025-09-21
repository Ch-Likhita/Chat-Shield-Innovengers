// main-page.js - Complete JavaScript functionality for ChatShield
class ChatShieldApp {
    constructor() {
        this.currentPage = 'home';
        this.detectionHistory = [];
        this.caseStudies = this.getDefaultCaseStudies();
        this.friendlyProfiles = this.getDefaultFriendlyProfiles();
        this.init();
    }

    init() {
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
        
        // Resolve page specific listeners
        this.setupResolvePageListeners();
        
        // Chat functionality
        this.setupChatFeatures();
        
        // Bottom navigation
        this.setupBottomNav();
        
        // Load backend data
        this.loadBackendData();
    }

    setupActionCards() {
        const actionCards = document.querySelectorAll('.action-card');
        actionCards.forEach(card => {
            card.addEventListener('click', (e) => {
                const action = card.dataset.action || this.getActionFromCard(card);
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
                const action = btn.dataset.action;
                this.handleHeaderButton(action);
            });
        });
    }

    setupResolvePageListeners() {
        // Resolve option buttons
        const resolveOptions = document.querySelectorAll('.resolve-option');
        resolveOptions.forEach(option => {
            option.addEventListener('click', (e) => {
                const action = option.dataset.resolveAction;
                if (action === 'case-studies') {
                    this.showCaseStudies();
                } else if (action === 'ai-chat') {
                    this.showAIChat();
                }
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
        const sendButton = document.getElementById('sendButton');
        if (sendButton) {
            sendButton.addEventListener('click', () => this.sendMessage());
        }

        // Quick topic buttons
        const quickTopics = document.querySelectorAll('.quick-topic');
        quickTopics.forEach(topic => {
            topic.addEventListener('click', (e) => {
                const message = topic.dataset.message || this.getQuickTopicMessage(topic);
                this.sendQuickMessage(message);
            });
        });
    }

    setupBottomNav() {
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                const tab = item.dataset.tab || this.getTabFromNavItem(item);
                this.setActiveTab(item, tab);
            });
        });
    }

    // Backend integration methods
    async loadBackendData() {
        try {
            if (typeof chrome !== 'undefined' && chrome.runtime) {
                const response = await chrome.runtime.sendMessage({
                    action: 'getDetectionHistory'
                });

                if (response && response.success) {
                    this.detectionHistory = response.history;
                    this.updateUIWithBackendData(response.history);
                } else {
                    this.loadDemoData();
                }
            } else {
                console.log('Chrome extension API not available - using demo data');
                this.loadDemoData();
            }
        } catch (error) {
            console.error('Error loading backend data:', error);
            this.loadDemoData();
        }
    }

    loadDemoData() {
        // Demo data for testing
        const demoHistory = [
            {
                id: 'demo1',
                timestamp: new Date().toISOString(),
                text: "You're such an idiot, nobody likes you",
                confidence: 0.95,
                platform: 'Instagram',
                url: 'https://instagram.com',
                resolved: false
            },
            {
                id: 'demo2',
                timestamp: new Date(Date.now() - 86400000).toISOString(),
                text: "Stop posting stupid stuff",
                confidence: 0.75,
                platform: 'Twitter',
                url: 'https://twitter.com',
                resolved: false
            },
            {
                id: 'demo3',
                timestamp: new Date(Date.now() - 172800000).toISOString(),
                text: "Persistent messaging after blocking",
                confidence: 0.85,
                platform: 'Instagram',
                url: 'https://instagram.com',
                resolved: true
            }
        ];
        this.detectionHistory = demoHistory;
        this.updateUIWithBackendData(demoHistory);
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
        await this.populateInstancesPage();
    }

    async populateInstancesPage() {
        const recentContainer = document.getElementById('recentCases');
        const historyContainer = document.getElementById('historyCases');
        
        if (!recentContainer || !historyContainer) return;

        // Clear existing content
        recentContainer.innerHTML = '';
        historyContainer.innerHTML = '';

        // Sort by date
        const sortedHistory = [...this.detectionHistory].sort((a, b) => 
            new Date(b.timestamp) - new Date(a.timestamp)
        );

        // Recent cases (last 7 days)
        const recent = sortedHistory.filter(item => {
            const itemDate = new Date(item.timestamp);
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            return itemDate > weekAgo && !item.resolved;
        });

        // History cases
        const history = sortedHistory.filter(item => {
            const itemDate = new Date(item.timestamp);
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            return itemDate <= weekAgo || item.resolved;
        });

        // Populate recent cases
        recent.forEach(item => {
            const caseElement = this.createCaseElement(item);
            recentContainer.appendChild(caseElement);
        });

        // Populate history
        history.slice(0, 10).forEach(item => {
            const caseElement = this.createCaseElement(item);
            historyContainer.appendChild(caseElement);
        });

        if (recent.length === 0) {
            recentContainer.innerHTML = '<p style="color: #8a8a8a; text-align: center; padding: 20px;">No recent cases found</p>';
        }

        if (history.length === 0) {
            historyContainer.innerHTML = '<p style="color: #8a8a8a; text-align: center; padding: 20px;">No historical cases found</p>';
        }
    }

    createCaseElement(item) {
        const div = document.createElement('div');
        const severity = this.getSeverityLevel(item.confidence);
        const platform = this.extractPlatform(item.url);
        const timeAgo = this.getTimeAgo(item.timestamp);
        
        div.className = `case-item ${item.resolved ? 'resolved' : severity}`;
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
                <div class="case-severity ${item.resolved ? 'resolved' : severity}">${item.resolved ? 'resolved' : severity.toUpperCase()}</div>
            </div>
            <p class="case-description">${item.text.substring(0, 150)}${item.text.length > 150 ? '...' : ''}</p>
            <div class="case-actions">
                <button class="case-btn primary" data-case-action="details" data-case-id="${item.id}">View Details</button>
                <button class="case-btn secondary" data-case-action="export" data-case-id="${item.id}">Export</button>
            </div>
        `;
        
        // Add event listeners for case action buttons
        const actionButtons = div.querySelectorAll('.case-btn');
        actionButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const action = btn.dataset.caseAction;
                const caseId = btn.dataset.caseId;
                this.handleCaseAction(action, caseId);
            });
        });
        
        return div;
    }

    async handleResolveAction() {
        this.showPage('resolve');
        this.showNotification('Loading self-help resources...');
        await this.populateResolvePage();
    }

    async populateResolvePage() {
        await this.populateCaseStudies();
        await this.initializeAIChat();
    }

    async populateCaseStudies() {
        const caseStudiesList = document.getElementById('caseStudiesList');
        if (!caseStudiesList) return;

        caseStudiesList.innerHTML = '';

        this.caseStudies.forEach(study => {
            const studyElement = this.createCaseStudyElement(study);
            caseStudiesList.appendChild(studyElement);
        });
    }

    createCaseStudyElement(study) {
        const div = document.createElement('div');
        div.className = 'case-study';
        div.innerHTML = `
            <div class="case-study-header">
                <div class="case-study-type">${study.type}</div>
                <div class="case-study-success">✓ ${study.success ? 'Resolved' : 'In Progress'}</div>
            </div>
            <h3>${study.title}</h3>
            <p class="case-study-summary">${study.summary}</p>
            <div class="case-study-tags">
                ${study.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
            </div>
            <div class="case-study-steps">
                <div class="step-preview">${study.steps[0]}</div>
                <div class="view-more">+${study.steps.length - 1} more steps</div>
            </div>
        `;

        div.addEventListener('click', () => {
            this.viewCaseStudy(study.id);
        });

        return div;
    }

    async handleMonitorAction() {
        this.showPage('friendlyZone');
        this.showNotification('Loading friendly zone...');
        await this.populateFriendlyZone();
    }

    async populateFriendlyZone() {
        const friendlyProfilesContainer = document.getElementById('friendlyProfiles');
        if (!friendlyProfilesContainer) return;

        friendlyProfilesContainer.innerHTML = '';

        // Create section card for profiles
        const sectionCard = document.createElement('div');
        sectionCard.className = 'section-card friendly-zone fade-in-up stagger-1';
        sectionCard.innerHTML = `
            <div class="section-header">
                <div class="section-icon">
                    <svg viewBox="0 0 24 24" fill="none">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z"/>
                    </svg>
                </div>
                <div>
                    <h2 class="section-title">Cleared Profiles</h2>
                    <p class="section-subtitle">Users proven innocent with verified evidence</p>
                </div>
            </div>
            <div id="profilesList"></div>
        `;

        const profilesList = sectionCard.querySelector('#profilesList');
        this.friendlyProfiles.forEach(profile => {
            const profileElement = this.createFriendlyProfileElement(profile);
            profilesList.appendChild(profileElement);
        });

        friendlyProfilesContainer.appendChild(sectionCard);

        // Add statistics section
        const statsCard = this.createStatsSection();
        friendlyProfilesContainer.appendChild(statsCard);
    }

    createFriendlyProfileElement(profile) {
        const div = document.createElement('div');
        div.className = 'friendly-profile';
        div.innerHTML = `
            <div class="friendly-profile-header">
                <div class="friendly-avatar">
                    <svg viewBox="0 0 24 24" fill="none">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                        <circle cx="12" cy="7" r="4"/>
                    </svg>
                </div>
                <div class="friendly-profile-info">
                    <div class="friendly-username">
                        ${profile.username}
                        <div class="verified-badge">
                            <svg viewBox="0 0 24 24" fill="none">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
                            </svg>
                        </div>
                    </div>
                    <div class="friendly-platform">${profile.platform}</div>
                    <div class="friendly-status">
                        <div class="status-badge status-cleared">Cleared</div>
                    </div>
                </div>
            </div>
            <p class="false-positive-reason">${profile.reason}</p>
            
            <div class="proof-section">
                <div class="proof-header">
                    <div class="proof-icon">
                        <svg viewBox="0 0 24 24" fill="none">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"/>
                        </svg>
                    </div>
                    <div class="proof-title">${profile.evidence}</div>
                </div>
                <div class="proof-details">${profile.details}</div>
            </div>

            <div class="proof-tags">
                ${profile.tags.map(tag => `<div class="proof-tag">${tag}</div>`).join('')}
            </div>

            <div class="friendly-actions">
                <button class="friendly-btn primary" data-profile-action="restore" data-profile-id="${profile.id}">Restore Trust</button>
                <button class="friendly-btn secondary" data-profile-action="details" data-profile-id="${profile.id}">View Details</button>
            </div>
        `;

        // Add event listeners
        const actionButtons = div.querySelectorAll('.friendly-btn');
        actionButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const action = btn.dataset.profileAction;
                const profileId = btn.dataset.profileId;
                this.handleProfileAction(action, profileId);
            });
        });

        return div;
    }

    createStatsSection() {
        const div = document.createElement('div');
        div.className = 'section-card friendly-zone fade-in-up stagger-2';
        div.innerHTML = `
            <div class="section-header">
                <div class="section-icon">
                    <svg viewBox="0 0 24 24" fill="none">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z"/>
                        <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0013.5 3v7.5z"/>
                    </svg>
                </div>
                <div>
                    <h2 class="section-title">AI Detection Statistics</h2>
                    <p class="section-subtitle">False positive insights and improvements</p>
                </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px;">
                <div style="background: rgba(38, 222, 129, 0.1); border-radius: 12px; padding: 16px; text-align: center;">
                    <div style="font-size: 24px; font-weight: 700; color: #26de81; margin-bottom: 4px;">94.2%</div>
                    <div style="font-size: 12px; color: #d0d0d0;">Accuracy Rate</div>
                </div>
                <div style="background: rgba(255, 165, 2, 0.1); border-radius: 12px; padding: 16px; text-align: center;">
                    <div style="font-size: 24px; font-weight: 700; color: #ffa502; margin-bottom: 4px;">5.8%</div>
                    <div style="font-size: 12px; color: #d0d0d0;">False Positives</div>
                </div>
            </div>

            <div style="background: rgba(0, 0, 0, 0.2); border-radius: 12px; padding: 16px;">
                <h4 style="font-size: 14px; font-weight: 600; color: #20b2aa; margin-bottom: 12px;">Common False Positive Triggers:</h4>
                <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                    <div style="font-size: 11px; padding: 6px 10px; background: rgba(255, 165, 2, 0.2); color: #ffa502; border-radius: 12px;">Professional Terminology</div>
                    <div style="font-size: 11px; padding: 6px 10px; background: rgba(255, 165, 2, 0.2); color: #ffa502; border-radius: 12px;">Gaming Language</div>
                    <div style="font-size: 11px; padding: 6px 10px; background: rgba(255, 165, 2, 0.2); color: #ffa502; border-radius: 12px;">Medical Context</div>
                    <div style="font-size: 11px; padding: 6px 10px; background: rgba(255, 165, 2, 0.2); color: #ffa502; border-radius: 12px;">Motivational Speech</div>
                </div>
            </div>
        `;

        return div;
    }

    async handleReportAction() {
        this.addHapticFeedback();
        
        // Get recent high-severity incidents
        const recentHighSeverity = this.detectionHistory.filter(item => 
            item.confidence >= 0.8 && 
            new Date(item.timestamp) > new Date(Date.now() - 24*60*60*1000)
        );
        
        if (recentHighSeverity.length > 0) {
            if (typeof chrome !== 'undefined' && chrome.tabs) {
                chrome.tabs.create({ url: 'https://cybercrime.gov.in/' });
                this.showNotification(`Reporting ${recentHighSeverity.length} high-severity incidents...`);
            } else {
                window.open('https://cybercrime.gov.in/', '_blank');
                this.showNotification(`Reporting ${recentHighSeverity.length} high-severity incidents...`);
            }
        } else {
            if (typeof chrome !== 'undefined' && chrome.tabs) {
                chrome.tabs.create({ url: 'https://cybercrime.gov.in/' });
            } else {
                window.open('https://cybercrime.gov.in/', '_blank');
            }
            this.showNotification('Opening incident reporting center...');
        }
    }

    // Chat methods
    async initializeAIChat() {
        const chatMessages = document.getElementById('chatMessages');
        if (!chatMessages) return;
        
        if (this.detectionHistory.length > 0) {
            this.addContextualWelcomeMessage(this.detectionHistory.length);
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
        
        if (this.detectionHistory.length > 0) {
            userContext = this.analyzeUserContext(this.detectionHistory);
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

    // Data methods
    getDefaultCaseStudies() {
        return [
            {
                id: 'persistent-messaging-after-blocking',
                type: 'Stalking',
                title: 'Persistent Messaging After Blocking',
                summary: 'A user continued creating new accounts to message after being blocked. Resolved through platform escalation and documentation.',
                success: true,
                tags: ['Instagram', 'Multiple Accounts', 'Blocking', 'Platform Escalation'],
                steps: [
                    'Document all new accounts and messages with timestamps',
                    'Report each new account immediately to platform',
                    'Contact platform support with pattern evidence',
                    'Consider involving authorities for persistent harassment',
                    'Strengthen privacy settings across all platforms'
                ]
            },
            {
                id: 'professional-boundary-violations',
                type: 'Workplace',
                title: 'Professional Boundary Violations',
                summary: 'Colleague making inappropriate comments and advances. Successfully resolved through HR documentation and clear boundaries.',
                success: true,
                tags: ['Workplace', 'HR Documentation', 'Professional Boundaries'],
                steps: [
                    'Document all inappropriate interactions with dates',
                    'Set clear professional boundaries in writing',
                    'Report to HR with comprehensive evidence',
                    'Request different work arrangements if needed',
                    'Follow up to ensure policy enforcement'
                ]
            },
            {
                id: 'threatening-messages-escalation',
                type: 'Threats',
                title: 'Threatening Messages & Escalation',
                summary: 'Received threatening messages that escalated to mentions of physical harm. Resolved through law enforcement involvement.',
                success: true,
                tags: ['Threats', 'Law Enforcement', 'Safety Planning', 'Documentation'],
                steps: [
                    'Immediately screenshot all threatening messages',
                    'Do not respond or engage with the threatening party',
                    'Report to platform and local law enforcement',
                    'Create a safety plan for personal security',
                    'Follow up with authorities on investigation progress'
                ]
            }
        ];
    }

    getDefaultFriendlyProfiles() {
        return [
            {
                id: 'alex-photographer',
                username: '@alex_photographer',
                platform: 'Instagram',
                reason: 'AI flagged professional photography critique as harassment due to keywords like "terrible lighting" and "needs improvement".',
                evidence: 'Professional Photography License',
                details: 'Licensed photographer providing constructive feedback on submitted work. Comments contained technical terminology that triggered false positive.',
                tags: ['Professional Context', 'Technical Language', 'Industry Expert'],
                cleared: true
            },
            {
                id: 'maria-fitness-coach',
                username: '@maria_fitness_coach',
                platform: 'TikTok',
                reason: 'Motivational fitness content flagged as "body shaming" when discussing workout intensity and physical challenges.',
                evidence: 'Certified Personal Trainer License',
                details: 'Certified fitness professional using motivational language common in fitness industry. Context shows encouragement, not harassment.',
                tags: ['Fitness Professional', 'Motivational Context', 'Industry Standard'],
                cleared: true
            },
            {
                id: 'david-pro-gamer',
                username: '@david_pro_gamer',
                platform: 'Discord',
                reason: 'Gaming strategy discussions flagged due to competitive language and terms like "destroy" and "crush the competition".',
                evidence: 'Professional Gaming Team Contract',
                details: 'Professional esports player using standard competitive gaming terminology in strategy discussions with team members.',
                tags: ['Gaming Context', 'Professional Sports', 'Team Communication'],
                cleared: true
            },
            {
                id: 'dr-jennifer-med',
                username: '@dr_jennifer_med',
                platform: 'Twitter',
                reason: 'Medical advice flagged as threats when discussing serious health conditions and urgent treatment needs.',
                evidence: 'Medical License & Hospital ID',
                details: 'Licensed physician providing medical information. Clinical terminology about serious conditions misinterpreted as threatening language.',
                tags: ['Medical Professional', 'Clinical Context', 'Health Information'],
                cleared: true
            }
        ];
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
        if (url.includes('twitter.com') || url.includes('x.com')) return 'Twitter';
        if (url.includes('discord.com')) return 'Discord';
        if (url.includes('tiktok.com')) return 'TikTok';
        if (url.includes('linkedin.com')) return 'LinkedIn';
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

    handleHeaderButton(action) {
        this.addHapticFeedback();
        this.showNotification('Feature coming soon...');
    }

    handleProfileAction(action, profileId) {
        this.addHapticFeedback();
        if (action === 'restore') {
            this.showNotification('Trust restored successfully');
        } else if (action === 'details') {
            this.showNotification('Opening detailed view...');
        }
    }

    handleCaseAction(action, caseId) {
        this.addHapticFeedback();
        if (action === 'details') {
            this.showNotification('Opening case details...');
        } else if (action === 'export') {
            this.showNotification('Exporting case data...');
        }
    }

    viewCaseStudy(studyId) {
        this.addHapticFeedback();
        this.showNotification(`Opening case study: ${studyId}...`);
    }

    setActiveTab(element, tab) {
        // Remove active class from all nav items
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        
        // Add active class to clicked item
        element.classList.add('active');
        
        this.addHapticFeedback();
        
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
        } else {
            console.log('Notification:', message);
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