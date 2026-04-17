#!/usr/bin/env node

/**
 * Build script for JobBoard extension + website
 * Replaces Firebase config placeholders with real values from environment variables
 * and copies all files to the dist/ folder for deployment.
 */

const fs = require('fs');
const path = require('path');

// Load .env file if it exists (for local development)
try {
  const envFile = fs.readFileSync(path.join(__dirname, '..', '.env'), 'utf-8');
  envFile.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length) {
      const value = valueParts.join('=').trim();
      if (value) process.env[key.trim()] = value;
    }
  });
  console.log('[Build] Loaded .env file');
} catch (e) {
  console.log('[Build] No .env file found, using environment variables only');
}

// Files that need token replacement (relative paths)
const FILES_TO_PROCESS = [
  'index.html',
  'browser-compat.js'
];

// Token mapping
const tokens = {
  '{{FIREBASE_API_KEY}}': process.env.FIREBASE_API_KEY,
  '{{FIREBASE_AUTH_DOMAIN}}': process.env.FIREBASE_AUTH_DOMAIN,
  '{{FIREBASE_PROJECT_ID}}': process.env.FIREBASE_PROJECT_ID,
  '{{FIREBASE_STORAGE_BUCKET}}': process.env.FIREBASE_STORAGE_BUCKET,
  '{{FIREBASE_MESSAGING_SENDER_ID}}': process.env.FIREBASE_MESSAGING_SENDER_ID,
  '{{FIREBASE_APP_ID}}': process.env.FIREBASE_APP_ID
};

// Validate all required env vars are present
const missing = Object.entries(tokens).filter(([_, value]) => !value).map(([key]) => key);
if (missing.length > 0) {
  console.error('[Build] Missing required environment variables:', missing.join(', '));
  console.error('[Build] Set them in .env file or GitHub Secrets');
  process.exit(1);
}

// Source and dist directories
const srcDir = path.join(__dirname, '..');
const distDir = path.join(__dirname, '..', 'dist');

// Clean dist folder
if (fs.existsSync(distDir)) {
  fs.rmSync(distDir, { recursive: true });
}
fs.mkdirSync(distDir);

console.log('[Build] Building with Firebase config for project:', tokens['{{FIREBASE_PROJECT_ID}}']);

// Process files
function copyAndReplace(srcPath, destPath) {
  const relative = path.relative(srcDir, srcPath);
  const dest = path.join(distDir, relative);

  // Ensure directory exists
  fs.mkdirSync(path.dirname(dest), { recursive: true });

  let content = fs.readFileSync(srcPath, 'utf-8');

  // Replace tokens
  Object.entries(tokens).forEach(([token, value]) => {
    if (content.includes(token)) {
      content = content.split(token).join(value);
    }
  });

  fs.writeFileSync(dest, content);
  console.log('[Build] Processed:', relative);
}

// Walk source directory and copy all files
function walkDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relative = path.relative(srcDir, fullPath);

    // Skip dist, .git, node_modules, .github, scripts (we don't need build scripts in dist)
    if (relative.startsWith('.git') || relative.startsWith('dist/') ||
        relative.startsWith('node_modules/') || relative.startsWith('.github/') ||
        relative.startsWith('scripts/') ||
        entry.name === 'build.js' ||
        entry.name === 'firebase-config.template.js' ||
        entry.name === '.env.example') {
      continue;
    }

    if (entry.isDirectory()) {
      walkDir(fullPath);
    } else {
      const destPath = path.join(distDir, relative);
      fs.mkdirSync(path.dirname(destPath), { recursive: true });

      if (FILES_TO_PROCESS.includes(entry.name)) {
        copyAndReplace(fullPath, destPath);
      } else {
        fs.copyFileSync(fullPath, destPath);
        console.log('[Build] Copied:', relative);
      }
    }
  }
}

walkDir(srcDir);

console.log('[Build] ✅ Build complete! Files are in dist/');
console.log('[Build] Next: push dist/ to GitHub Pages or load extension from dist/');
