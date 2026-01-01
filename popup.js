// Get references to DOM elements
const toggleEnabled = document.getElementById('toggleEnabled');
const statusIndicator = document.getElementById('statusIndicator');
const statusText = document.getElementById('statusText');
const copyCookiesBtn = document.getElementById('copyCookies');
const viewCookiesBtn = document.getElementById('viewCookies');

// Load initial state from storage
chrome.storage.local.get(['enabled'], (result) => {
  const enabled = result.enabled !== false; // Default to true
  toggleEnabled.checked = enabled;
  updateStatus(enabled);
});

// Listen for toggle changes
toggleEnabled.addEventListener('change', async () => {
  const enabled = toggleEnabled.checked;
  
  // Save state to storage
  await chrome.storage.local.set({ enabled });
  
  // Update UI
  updateStatus(enabled);
});

// Update status UI
function updateStatus(enabled) {
  if (enabled) {
    statusIndicator.classList.add('active');
    statusText.textContent = 'Monitoring Active';
  } else {
    statusIndicator.classList.remove('active');
    statusText.textContent = 'Monitoring Paused';
  }
}

// Copy cookies to clipboard
copyCookiesBtn.addEventListener('click', async () => {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    const result = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => window.__ALL_COOKIES__ || [],
      world: 'MAIN'
    });
    
    const cookies = result[0].result;
    const cookieJson = JSON.stringify(cookies, null, 2);
    
    await navigator.clipboard.writeText(cookieJson);
    
    // Visual feedback
    copyCookiesBtn.textContent = '✓ Copied!';
    setTimeout(() => {
      copyCookiesBtn.textContent = 'Copy Cookies to Clipboard';
    }, 2000);
  } catch (error) {
    console.error('Error copying cookies:', error);
    copyCookiesBtn.textContent = '✗ Error';
    setTimeout(() => {
      copyCookiesBtn.textContent = 'Copy Cookies to Clipboard';
    }, 2000);
  }
});

// View cookies in console
viewCookiesBtn.addEventListener('click', async () => {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        console.log('=== ALL COOKIES (including HttpOnly) ===');
        console.table(window.__ALL_COOKIES__);
        console.log('Total cookies:', window.__ALL_COOKIES__?.length || 0);
        console.log('Last updated:', new Date(window.__COOKIES_UPDATED__));
      },
      world: 'MAIN'
    });
    
    // Visual feedback
    viewCookiesBtn.textContent = '✓ Check Console';
    setTimeout(() => {
      viewCookiesBtn.textContent = 'View Current Cookies';
    }, 2000);
  } catch (error) {
    console.error('Error viewing cookies:', error);
    viewCookiesBtn.textContent = '✗ Error';
    setTimeout(() => {
      viewCookiesBtn.textContent = 'View Current Cookies';
    }, 2000);
  }
});
