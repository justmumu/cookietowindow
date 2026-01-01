// CookieToWindow Extension - Content Script
// Facilitates communication between page and extension

// Initialize window.__ALL_COOKIES__ if not already set
if (typeof window.__ALL_COOKIES__ === 'undefined') {
  window.__ALL_COOKIES__ = [];
}

// Function to request cookie update from background
function requestCookieUpdate() {
  chrome.runtime.sendMessage({ action: 'refreshCookies' }, (response) => {
    if (chrome.runtime.lastError) {
      console.error('[CookieToWindow] Error requesting cookies:', chrome.runtime.lastError);
    }
  });
}

// Request initial cookies when script loads
requestCookieUpdate();

// Also request cookies on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', requestCookieUpdate);
} else {
  requestCookieUpdate();
}

// Expose a function for the page to manually request cookie refresh
window.__REFRESH_COOKIES__ = requestCookieUpdate;

console.log('[CookieToWindow] Content script loaded - Cookies accessible via window.__ALL_COOKIES__');

