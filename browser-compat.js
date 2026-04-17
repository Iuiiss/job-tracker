// ─────────────────────────────────────────────────────────────────────────────
// browser-compat.js
//
// Cross-browser compatibility layer for Chrome and Safari extensions.
// Detects the browser and provides unified APIs for storage and tab operations.
// ─────────────────────────────────────────────────────────────────────────────

const BrowserCompat = (() => {
  // Detect which browser we're running in
  const getBrowser = () => {
    if (typeof chrome !== "undefined" && chrome.runtime) {
      return "chrome";
    } else if (typeof safari !== "undefined" && safari.extension) {
      return "safari";
    }
    return "unknown";
  };

  const browser = getBrowser();
  console.log("[JobBoard] Detected browser:", browser);

  return {
    /**
     * Get the current browser type: "chrome", "safari", or "unknown"
     */
    getBrowser: () => browser,

    /**
     * Read data from storage.
     * @param {string} key - The storage key
     * @param {function} callback - Called with (value) when done
     */
    storageGet: (key, callback) => {
      if (browser === "chrome") {
        // Chrome: use chrome.storage.local
        chrome.storage.local.get(key, (result) => {
          callback(result[key]);
        });
      } else if (browser === "safari") {
        // Safari: use localStorage
        const value = localStorage.getItem(key);
        callback(value ? JSON.parse(value) : undefined);
      } else {
        callback(undefined);
      }
    },

    /**
     * Write data to storage.
     * @param {string} key - The storage key
     * @param {any} value - The value to store
     * @param {function} callback - Optional callback when done
     */
    storageSet: (key, value, callback) => {
      if (browser === "chrome") {
        // Chrome: use chrome.storage.local
        chrome.storage.local.set({ [key]: value }, () => {
          if (callback) callback();
        });
      } else if (browser === "safari") {
        // Safari: use localStorage
        localStorage.setItem(key, JSON.stringify(value));
        if (callback) callback();
      }
    },

    /**
     * Open a URL in a new tab/window.
     * @param {string} url - The URL to open
     */
    openTab: (url) => {
      if (browser === "chrome") {
        // Chrome: use chrome.tabs.create
        chrome.tabs.create({ url: url });
      } else if (browser === "safari") {
        // Safari: use safari.application
        if (safari.application) {
          safari.application.activeBrowserWindow.openNewTab(true);
          // Note: Safari doesn't support setting the URL directly in openNewTab,
          // so we need to navigate to it. This is a limitation of Safari's API.
          // As a workaround, the app will need to handle navigation differently.
          // For now, we'll attempt to use a fallback.
          try {
            const newTab = safari.application.activeBrowserWindow.activeTab;
            if (newTab) {
              newTab.url = url;
            }
          } catch (e) {
            console.warn("[JobBoard] Could not set tab URL in Safari", e);
            // Fallback: prompt user to navigate manually
            alert("JobBoard Tracker:\n\n" + url);
          }
        }
      }
    },
  };
})();
