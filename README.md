# JobBoard Chrome Extension

Adds a "Save to JobBoard" button on LinkedIn and Indeed job pages.
Saved jobs appear instantly in your index.html Kanban tracker.

**Now supports both Chrome and Safari!** 🎉

## 🔐 Firebase Setup (Required)

This extension uses Firebase Firestore to sync jobs across devices. You need to:

1. **Create a Firebase project**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Click "Add project" → enter a name → disable Analytics (optional) → Create

2. **Enable Firestore**
   - In the sidebar: Build → Firestore Database
   - Click "Create database"
   - Pick a location, select **Test mode** → Create

3. **Register a Web App**
   - In project settings, click the `</>` Web icon
   - Nickname: "jobtracker-web"
   - Copy the `firebaseConfig` object

4. **Add your Firebase config to the project:**

   **Local development:**
   ```bash
   cp .env.example .env
   # Edit .env and paste your firebaseConfig values
   ```

   **GitHub deployment (keep secrets out of repo):**
   - Go to your GitHub repo → Settings → Secrets and variables → Actions
   - Add these secrets (values from your firebaseConfig):
     - `FIREBASE_API_KEY`
     - `FIREBASE_AUTH_DOMAIN`
     - `FIREBASE_PROJECT_ID`
     - `FIREBASE_STORAGE_BUCKET`
     - `FIREBASE_MESSAGING_SENDER_ID`
     - `FIREBASE_APP_ID`

5. **Set Firestore Security Rules** (allow read/write for now)
   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /{document=**} {
         allow read, write: if true;
       }
     }
   }
   ```

6. **Set Firestore location** (must match your project's location)
   - In your Firebase config from step 3, check `projectId` and other values.
   - Use those exact values in your secrets.

5. **Build and deploy locally**
   ```bash
   node scripts/build.js
   ```
   This generates a `dist/` folder with your secrets injected.

   - **Load extension from `dist/`** (Chrome: chrome://extensions → Load unpacked → select `dist/`)
   - **Open tracker**: open `dist/index.html` in browser, or push `dist/` to GitHub Pages

## 🚀 Deployment

### Automatic (GitHub Actions)
Push to `main` branch → GitHub Actions builds and deploys to GitHub Pages automatically.

### Manual
```bash
node scripts/build.js
# dist/ folder is ready
# Upload dist/ contents to your GitHub Pages hosting (gh-pages branch or /docs folder)
```

## 🔧 Development

- **Source files** (with `{{FIREBASE_...}}` placeholders) are in the root
- Built files (with real secrets) are in `dist/` (gitignored)
- Run `node scripts/build.js` after changing source files to test locally
- Load the extension from `dist/` folder to test in browser

## 🛠️ Firestore Rules Warning

If you see `BooleanExpression` warnings in console, your Firestore rules are too restrictive. Set them to:
```javascript
allow read, write: if true;
```
(For production, you'll want proper auth rules.)

## 📦 Files

- `manifest.json` — extension manifest
- `browser-compat.js` — unified Chrome/Safari API + Firebase Firestore wrapper
- `content.js` — injected into LinkedIn/Indeed to extract job data and add save button
- `popup.html/js` — extension popup UI (stats, export, clear local storage)
- `index.html` — main Kanban tracker (reads from Firestore)
- `scripts/build.js` — build script that injects Firebase secrets
- `firebase-app-compat.js` — Firebase SDK (local copy for extension)
- `firebase-firestore-compat.js` — Firestore SDK (local copy)

## 🎯 Usage

1. Visit a LinkedIn orIndeed job page
2. Click **⭐ Save to JobBoard**
3. Open your tracker (index.html) — job appears in **Wishlist**
4. Drag job to **Applied**, **Interview**, **Offer**, or **Rejected**

The popup shows stats and lets you export/clear local storage.
