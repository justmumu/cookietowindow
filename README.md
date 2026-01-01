# CookieToWindow - Chrome Extension

[![GitHub release](https://img.shields.io/github/v/release/justmumu/cookietowindow)](https://github.com/justmumu/cookietowindow/releases)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A Chrome extension (Manifest V3) that monitors all cookies (including HttpOnly and Secure) and makes them accessible via JavaScript for automation and testing purposes.

**Repository:** https://github.com/justmumu/cookietowindow

⚠️ **WARNING**: This extension exposes HttpOnly cookies to JavaScript, which bypasses security protections. Only use for testing, development, and automation in controlled environments. Never use on production sites or sites with sensitive information.

## Features

- ✅ Monitors ALL cookies including HttpOnly and Secure flags
- ✅ Real-time cookie updates via `chrome.cookies.onChanged`
- ✅ Automatically injects cookies into `window.__ALL_COOKIES__`
- ✅ Perfect for headless Chrome automation
- ✅ No manual interaction required
- ✅ Works with Puppeteer, Selenium, Playwright
- ✅ Simple toggle UI to enable/disable monitoring

## How It Works

The extension uses Chrome's `cookies` permission to:

1. **Monitor Cookie Changes**: Listens to `chrome.cookies.onChanged` for real-time updates
2. **Read All Cookies**: Uses `chrome.cookies.getAll()` to read ALL cookies (including HttpOnly)
3. **Inject into Page**: Uses `chrome.scripting.executeScript()` to inject cookies into `window.__ALL_COOKIES__`
4. **Auto-Update**: Automatically updates the variable whenever cookies change

## Installation

### From GitHub Releases (Recommended)

1. Go to [Releases](https://github.com/justmumu/cookietowindow/releases)
2. Download the latest `CookieToWindow-vX.X.X.zip`
3. Extract the ZIP file
4. Follow the manual installation steps below

### Manual Installation (Developer Mode)

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" in the top right corner
3. Click "Load unpacked"
4. Select the extracted `CookieToWindow` directory
5. The extension should now appear in your extensions list

### Verify Installation

1. Navigate to any website
2. Open Developer Console (F12)
3. Type `window.__ALL_COOKIES__` and press Enter
4. You should see an array of all cookies (including HttpOnly ones)

## Usage

### Access Cookies in Browser Console

```javascript
// View all cookies
console.table(window.__ALL_COOKIES__);

// Get specific cookie
const sessionCookie = window.__ALL_COOKIES__.find(c => c.name === 'session');

// Manually refresh cookies
window.__REFRESH_COOKIES__();

// Listen for cookie updates
window.addEventListener('cookiesUpdated', (event) => {
  console.log('Cookies updated:', event.detail.cookies);
});
```

### Use with Puppeteer (Headless Chrome)

```javascript
const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      `--disable-extensions-except=/path/to/CookieToWindow`,
      `--load-extension=/path/to/CookieToWindow`
    ]
  });
  
  const page = await browser.newPage();
  await page.goto('https://example.com');
  
  // Wait a moment for extension to inject cookies
  await page.waitForTimeout(1000);
  
  // Get all cookies including HttpOnly
  const cookies = await page.evaluate(() => window.__ALL_COOKIES__);
  
  console.log('All cookies:', cookies);
  
  // Filter HttpOnly cookies
  const httpOnlyCookies = cookies.filter(c => c.httpOnly);
  console.log('HttpOnly cookies:', httpOnlyCookies);
  
  await browser.close();
})();
```

### Use with Selenium

```python
from selenium import webdriver
from selenium.webdriver.chrome.options import Options

# Configure Chrome options
chrome_options = Options()
chrome_options.add_argument('--load-extension=/path/to/CookieToWindow')

driver = webdriver.Chrome(options=chrome_options)
driver.get('https://example.com')

# Get all cookies including HttpOnly
cookies = driver.execute_script('return window.__ALL_COOKIES__')
print(f'Found {len(cookies)} cookies')

# Access HttpOnly cookies
httponly_cookies = [c for c in cookies if c.get('httpOnly')]
print(f'HttpOnly cookies: {httponly_cookies}')

driver.quit()
```

### Use with Playwright

```javascript
const { chromium } = require('playwright');

(async () => {
  const context = await chromium.launchPersistentContext('/path/to/user-data', {
    headless: false,
    args: [
      `--disable-extensions-except=/path/to/CookieToWindow`,
      `--load-extension=/path/to/CookieToWindow`
    ]
  });
  
  const page = await context.newPage();
  await page.goto('https://example.com');
  
  // Get all cookies
  const cookies = await page.evaluate(() => window.__ALL_COOKIES__);
  console.log('All cookies:', cookies);
  
  await context.close();
})();
```

## Cookie Object Structure

Each cookie in `window.__ALL_COOKIES__` contains:

```javascript
{
  "name": "session_id",
  "value": "abc123xyz",
  "domain": ".example.com",
  "path": "/",
  "secure": true,
  "httpOnly": true,
  "sameSite": "lax",
  "expirationDate": 1234567890,
  "hostOnly": false,
  "session": false,
  "storeId": "0"
}
```

## Popup UI

The extension includes a simple popup with:
- Toggle to enable/disable monitoring
- Status indicator
- Button to copy all cookies to clipboard (JSON format)
- Button to view cookies in console
- Usage instructions

## File Structure

```
cookietowindow/
├── .github/
│   └── workflows/
│       └── release.yml        # Automated release workflow
├── icons/                     # Extension icons
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
├── manifest.json              # Extension configuration
├── background.js              # Service worker for cookie monitoring
├── content.js                 # Content script for page communication
├── popup.html                 # Popup UI structure
├── popup.css                  # Popup styling
├── popup.js                   # Popup logic
├── build-distribution.sh      # Build script for local packaging
├── README.md                  # This file
├── LICENSE                    # MIT License
└── .gitignore                 # Git ignore rules
```

## API Reference

### Global Variables

- `window.__ALL_COOKIES__` - Array of all cookies (auto-updated)
- `window.__COOKIES_UPDATED__` - Timestamp of last update
- `window.__REFRESH_COOKIES__()` - Function to manually refresh cookies

### Events

- `cookiesUpdated` - Custom event fired when cookies are updated
  ```javascript
  window.addEventListener('cookiesUpdated', (event) => {
    console.log(event.detail.cookies);
    console.log(event.detail.timestamp);
  });
  ```

## Security Implications

This extension:

1. **Exposes HttpOnly cookies** to JavaScript, bypassing XSS protection
2. **Makes all cookies readable** in the page context
3. **Should NEVER be used on production sites**
4. **Is intended for testing and automation ONLY**

## Use Cases

- Automated testing with headless Chrome
- Cookie debugging and inspection
- Security research in controlled environments
- Browser automation workflows
- Testing authentication flows

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request to the [GitHub repository](https://github.com/justmumu/cookietowindow).

## Troubleshooting

### Cookies not appearing in `window.__ALL_COOKIES__`

1. Check that the extension is enabled (green indicator in popup)
2. Reload the page after enabling the extension
3. Check browser console for any error messages
4. Ensure the site has cookies to read

### Extension not working in headless mode

1. Verify extension path is correct in launch arguments
2. Use `--disable-extensions-except` and `--load-extension` flags
3. Add a small delay after page load for extension to initialize

### Cookies not updating automatically

1. Check that monitoring is enabled in the popup
2. Verify `chrome.cookies.onChanged` listener is active (check background console)
3. Try manually calling `window.__REFRESH_COOKIES__()`

## Development

To modify the extension:

1. Make changes to source files
2. Go to `chrome://extensions/`
3. Click reload button for the extension
4. Refresh any open tabs to see changes

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Disclaimer

This extension intentionally bypasses cookie security protections. Only use it in controlled testing environments. The developers are not responsible for any security issues that arise from using this extension.

## Links

- **GitHub Repository:** https://github.com/justmumu/cookietowindow
- **Issues:** https://github.com/justmumu/cookietowindow/issues
- **Releases:** https://github.com/justmumu/cookietowindow/releases
