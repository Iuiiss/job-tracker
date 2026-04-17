# JobBoard Chrome Extension

Adds a "Save to JobBoard" button on LinkedIn and Indeed job pages.
Saved jobs appear instantly in your index.html Kanban tracker.

**Now supports both Chrome and Safari!** 🎉

## Installation

### Chrome (2 minutes)

1. Open Chrome and go to: chrome://extensions
2. Turn on "Developer mode" (toggle in the top right)
3. Click "Load unpacked"
4. Select this folder (job_tracker_extension)
5. The JobBoard icon will appear in your Chrome toolbar

### Safari (requires macOS)

1. Open Safari
2. Go to **Safari menu → Settings → Extensions** (or Preferences on older macOS)
3. Click the **+** button and select "Add Extension"
4. Navigate to this folder and select it
5. Grant the required permissions when prompted
6. The JobBoard extension will appear in your Safari toolbar

## Setup

The extension is ready to use! Follow these steps to deploy the tracker to GitHub Pages:

### Deploy to GitHub Pages (Recommended)

1. **Create a GitHub repository:**
   - Go to https://github.com/new
   - Name it `job-tracker` (or whatever you prefer)
   - Click "Create repository"

2. **Push this folder to GitHub:**
   ```bash
   cd /Users/luisleis/vsCode/jobTracker
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/luiiss/job-tracker.git
   git push -u origin main
   ```

3. **Enable GitHub Pages:**
   - Go to your repo settings
   - Scroll to "Pages" section
   - Under "Build and deployment", set Source to "Deploy from a branch"
   - Select `main` branch
   - Click Save

4. **Update popup.js:**
   - Already configured! The URL is set to:
   ```javascript
   const trackerUrl = "https://luiiss.github.io/job-tracker/index.html";
   ```

5. **Reload the extension:**
   - Chrome: Go to `chrome://extensions` and click the refresh icon
   - Safari: Settings → Extensions → reload

## How to use

1. Go to any LinkedIn or Indeed job listing
2. Look for the "⭐ Save to JobBoard" button near the job title
3. Click it — the job is saved with status "Wishlist"
4. Open your index.html tracker to see it on the Kanban board
5. Drag it to the right column (Applied, Interview, etc.)

## Cross-browser support

This extension now uses a **browser compatibility layer** (`browser-compat.js`) that automatically detects whether you're using Chrome or Safari and uses the appropriate APIs. No configuration needed—it just works on both!

The compatibility layer handles:
- **Storage**: Chrome uses `chrome.storage.local`, Safari uses `localStorage`
- **Tab opening**: Each browser has its own mechanism
- **Browser detection**: Automatic detection with console logging for debugging

## Files

- `manifest.json`  — tells the browser about the extension and its permissions
- `browser-compat.js` — cross-browser compatibility layer (detects Chrome vs Safari)
- `content.js`     — injected into LinkedIn/Indeed, reads job data + adds button
- `popup.html`     — the UI shown when you click the extension icon
- `popup.js`       — logic for the popup (reads saved jobs, opens tracker)
- `index.html`     — Kanban board for tracking jobs
- `icon.png`       — extension icon
