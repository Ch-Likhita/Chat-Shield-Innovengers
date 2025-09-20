// popup.js - Main popup interface logic
document.addEventListener('DOMContentLoaded', async () => {
  const scanBtn = document.getElementById('scanBtn');
  const autoScanBtn = document.getElementById('autoScanBtn');
  const viewHistoryBtn = document.getElementById('viewHistoryBtn');
  const status = document.getElementById('status');
  const results = document.getElementById('results');
  const resultsList = document.getElementById('resultsList');
  const loading = document.getElementById('loading');
  const autoScanToggle = document.getElementById('autoScanToggle');
  const sensitivityToggle = document.getElementById('sensitivityToggle');

  // Load settings
  const settings = await chrome.storage.local.get(['autoScan', 'highSensitivity']);
  if (settings.autoScan) autoScanToggle.classList.add('active');
  if (settings.highSensitivity !== false) sensitivityToggle.classList.add('active');

  // Check if we're on Instagram
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const isInstagram = tab.url && tab.url.includes('instagram.com');
  
  if (!isInstagram) {
    status.textContent = '⚠️ Please navigate to Instagram web first';
    scanBtn.disabled = true;
    return;
  }

  // Update status to show we're ready
  status.textContent = '✅ Ready to scan Instagram chats';

  // Scan button click handler
  scanBtn.addEventListener('click', async () => {
    await startScan();
  });

  // Auto-scan toggle
  autoScanBtn.addEventListener('click', async () => {
    const currentState = await chrome.storage.local.get(['autoScan']);
    const newState = !currentState.autoScan;
    
    await chrome.storage.local.set({ autoScan: newState });
    autoScanToggle.classList.toggle('active', newState);
    
    // Send message to content script to enable/disable auto-scan
    try {
      await chrome.tabs.sendMessage(tab.id, {
        action: 'toggleAutoScan',
        enabled: newState
      });
    } catch (error) {
      console.log('Content script not ready, will activate on next page load');
    }
    
    status.textContent = newState ? '⚡ Auto-scan enabled' : '⚡ Auto-scan disabled';
  });

  // View history button
  viewHistoryBtn.addEventListener('click', async () => {
    const history = await chrome.storage.local.get(['detectionHistory']);
    const historyData = history.detectionHistory || [];
    
    if (historyData.length === 0) {
      showResults([{ text: 'No detection history yet', type: 'safe', timestamp: new Date() }]);
    } else {
      showResults(historyData.slice(-10)); // Show last 10 results
    }
  });

  // Settings toggles
  autoScanToggle.addEventListener('click', async () => {
    const isActive = autoScanToggle.classList.contains('active');
    autoScanToggle.classList.toggle('active');
    await chrome.storage.local.set({ autoScan: !isActive });
  });

  sensitivityToggle.addEventListener('click', async () => {
    const isActive = sensitivityToggle.classList.contains('active');
    sensitivityToggle.classList.toggle('active');
    await chrome.storage.local.set({ highSensitivity: !isActive });
  });

  async function startScan() {
    showLoading(true);
    scanBtn.disabled = true;
    status.textContent = '🔄 Scanning chat messages...';

    try {
      // Inject content script if not already present
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['content.js']
      });

      // Send scan request to content script
      const response = await chrome.tabs.sendMessage(tab.id, {
        action: 'scanChat'
      });

      if (response && response.success) {
        const analysisResults = response.results || [];
        showResults(analysisResults);
        
        if (analysisResults.some(r => r.isAbusive)) {
          status.textContent = '⚠️ Abusive content detected!';
        } else {
          status.textContent = '✅ No abusive content found';
        }
      } else {
        throw new Error(response?.error || 'Failed to scan chat');
      }
    } catch (error) {
      console.error('Scan error:', error);
      status.textContent = '❌ Scan failed. Make sure you\'re in a chat.';
    } finally {
      showLoading(false);
      scanBtn.disabled = false;
    }
  }

  function showLoading(show) {
    loading.style.display = show ? 'block' : 'none';
    results.style.display = show ? 'none' : (results.style.display === 'block' ? 'block' : 'none');
  }

  function showResults(analysisResults) {
    results.style.display = 'block';
    resultsList.innerHTML = '';

    if (!analysisResults || analysisResults.length === 0) {
      resultsList.innerHTML = '<div class="result-item safe">No messages to analyze</div>';
      return;
    }

    analysisResults.forEach((result, index) => {
      const resultDiv = document.createElement('div');
      resultDiv.className = `result-item ${result.isAbusive ? '' : 'safe'}`;
      
      const confidence = result.confidence ? ` (${Math.round(result.confidence * 100)}%)` : '';
      const timestamp = result.timestamp ? new Date(result.timestamp).toLocaleTimeString() : '';
      
      resultDiv.innerHTML = `
        <div><strong>${result.isAbusive ? '⚠️ Abusive' : '✅ Safe'}</strong>${confidence}</div>
        <div style="font-size: 12px; opacity: 0.8; margin: 4px 0;">${timestamp}</div>
        <div style="font-size: 12px; background: rgba(255,255,255,0.1); padding: 4px; border-radius: 3px; margin: 4px 0;">
          "${result.text.substring(0, 100)}${result.text.length > 100 ? '...' : ''}"
        </div>
        ${result.isAbusive ? `
          <div class="result-actions">
            <button class="resolve-btn" onclick="handleResolve(${index})">🤝 Self-resolve</button>
            <button class="dismiss-btn" onclick="handleDismiss(${index})">👍 It's friendly</button>
            <button class="report-btn" onclick="handleReport('${result.text}')">🚨 Report to police</button>
          </div>
        ` : ''}
      `;
      
      resultsList.appendChild(resultDiv);
    });

    // Save to history
    saveToHistory(analysisResults);
  }

  async function saveToHistory(results) {
    const history = await chrome.storage.local.get(['detectionHistory']);
    const historyData = history.detectionHistory || [];
    
    const newEntries = results.map(result => ({
      ...result,
      timestamp: new Date().toISOString(),
      url: tab.url
    }));
    
    historyData.push(...newEntries);
    
    // Keep only last 100 entries
    if (historyData.length > 100) {
      historyData.splice(0, historyData.length - 100);
    }
    
    await chrome.storage.local.set({ detectionHistory: historyData });
  }

  // Global functions for result actions
  window.handleResolve = async (index) => {
    // Show self-resolution tips
    const tipText = `
      Self-Resolution Tips:
      • Block or mute the user
      • Don't engage with abusive messages
      • Take screenshots as evidence
      • Talk to trusted friends/family
      • Consider reporting if it continues
    `;
    
    alert(tipText);
    
    // Log the resolution choice
    await chrome.storage.local.set({
      [`resolution_${Date.now()}`]: {
        type: 'self_resolve',
        timestamp: new Date().toISOString()
      }
    });
  };

  window.handleDismiss = async (index) => {
    // Log the dismissal silently
    await chrome.storage.local.set({
      [`dismissal_${Date.now()}`]: {
        type: 'false_positive',
        timestamp: new Date().toISOString()
      }
    });
    
    // Remove the result item from display
    const resultItems = document.querySelectorAll('.result-item');
    if (resultItems[index]) {
      resultItems[index].style.opacity = '0.5';
      resultItems[index].innerHTML += '<div style="margin-top: 8px; color: #4CAF50;">✅ Marked as friendly</div>';
    }
  };

  window.handleReport = async (text) => {
    // Open India's cybercrime reporting portal
    const reportUrl = 'https://cybercrime.gov.in/';
    await chrome.tabs.create({ url: reportUrl });
    
    // Log the report
    await chrome.storage.local.set({
      [`report_${Date.now()}`]: {
        type: 'police_report',
        timestamp: new Date().toISOString(),
        text: text.substring(0, 100) // Store only first 100 chars for privacy
      }
    });
  };
});