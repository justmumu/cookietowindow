// CookieToWindow Extension - Background Script
// Monitors all cookies and injects them into window.__ALL_COOKIES__

// Global state
let extensionEnabled = true;

// Initialize extension state
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({ enabled: true });
  extensionEnabled = true;
  console.log('[CookieToWindow] Extension installed and enabled');
});

// Listen for storage changes
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'local' && changes.enabled) {
    extensionEnabled = changes.enabled.newValue;
    console.log('[CookieToWindow] Extension', extensionEnabled ? 'enabled' : 'disabled');
  }
});

// Initialize state on startup
chrome.storage.local.get(['enabled'], (result) => {
  extensionEnabled = result.enabled !== false;
});

// Helper function to check if URL is valid for injection
function isValidUrl(url) {
  if (!url) return false;
  
  // Block internal browser pages
  const invalidProtocols = [
    'chrome://',
    'chrome-extension://',
    'edge://',
    'about:',
    'file://',
    'view-source:',
    'data:',
    'blob:'
  ];
  
  return !invalidProtocols.some(protocol => url.startsWith(protocol));
}

// Function to get all cookies for a specific URL
async function getCookiesForUrl(url) {
  try {
    const urlObj = new URL(url);
    const domain = urlObj.hostname;
    
    // Get all cookies for this domain (including subdomains)
    const cookies = await chrome.cookies.getAll({ domain: domain });
    
    // Also get cookies for parent domains
    const domainParts = domain.split('.');
    const allCookies = [...cookies];
    
    // Try parent domains
    for (let i = 1; i < domainParts.length - 1; i++) {
      const parentDomain = domainParts.slice(i).join('.');
      const parentCookies = await chrome.cookies.getAll({ domain: parentDomain });
      allCookies.push(...parentCookies);
    }
    
    // Remove duplicates based on name and domain
    const uniqueCookies = Array.from(
      new Map(allCookies.map(c => [`${c.name}_${c.domain}`, c])).values()
    );
    
    return uniqueCookies;
  } catch (error) {
    console.error('[CookieToWindow] Error getting cookies:', error);
    return [];
  }
}

// Function to inject cookies into page
async function injectCookiesIntoPage(tabId, url) {
  if (!extensionEnabled) return;
  
  // Skip invalid URLs (chrome://, chrome-extension://, etc.)
  if (!isValidUrl(url)) {
    console.log(`[CookieToWindow] Skipping invalid URL: ${url}`);
    return;
  }
  
  try {
    // Validate tab still exists before attempting injection
    try {
      await chrome.tabs.get(tabId);
    } catch (tabError) {
      // Tab was closed or doesn't exist - this is expected, silently return
      return;
    }
    
    const cookies = await getCookiesForUrl(url);
    
    await chrome.scripting.executeScript({
      target: { tabId: tabId },
      func: (cookieData) => {
        window.__ALL_COOKIES__ = cookieData;
        window.__COOKIES_UPDATED__ = Date.now();
        
        // Dispatch custom event for listeners
        window.dispatchEvent(new CustomEvent('cookiesUpdated', { 
          detail: { cookies: cookieData, timestamp: Date.now() }
        }));
      },
      args: [cookies],
      world: 'MAIN'
    });
    
    console.log(`[CookieToWindow] Injected ${cookies.length} cookies into tab ${tabId}`);
  } catch (error) {
    // Check if this is a "tab not found" error (race condition)
    if (error.message && error.message.includes('No tab with id')) {
      // Tab was closed during injection - expected, silently ignore
      return;
    }
    // Log only unexpected errors
    console.error('[CookieToWindow] Error injecting cookies:', error);
  }
}

// Listen for tab updates (page loads)
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url && extensionEnabled && isValidUrl(tab.url)) {
    await injectCookiesIntoPage(tabId, tab.url);
  }
});

// Listen for cookie changes
chrome.cookies.onChanged.addListener(async (changeInfo) => {
  if (!extensionEnabled) return;
  
  const { cookie, removed, cause } = changeInfo;
  console.log(`[CookieToWindow] Cookie ${removed ? 'removed' : 'changed'}:`, cookie.name, 'Cause:', cause);
  
  // Get all tabs and update the ones that match this cookie's domain
  const tabs = await chrome.tabs.query({});
  
  for (const tab of tabs) {
    if (tab.url && isValidUrl(tab.url) && tab.url.includes(cookie.domain.replace(/^\./, ''))) {
      await injectCookiesIntoPage(tab.id, tab.url);
    }
  }
});

// Listen for messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getCookies' && sender.tab) {
    getCookiesForUrl(sender.tab.url).then(cookies => {
      sendResponse({ cookies: cookies });
    });
    return true; // Will respond asynchronously
  }
  
  if (request.action === 'refreshCookies' && sender.tab) {
    injectCookiesIntoPage(sender.tab.id, sender.tab.url).then(() => {
      sendResponse({ success: true });
    });
    return true;
  }
});

console.log('[CookieToWindow] Background script loaded');
