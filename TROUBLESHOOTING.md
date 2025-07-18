# 🔧 Troubleshooting Guide - HisabDaily Islamic App

## ✅ Issues Fixed

### 1. WebSocket Connection Errors

**Problem**: Browser trying to connect to wrong port (5174 vs 5173)
**Solution**: Updated `vite.config.ts` with proper server configuration

### 2. PWA Icons Missing

**Problem**: Browser couldn't find icon files
**Solution**: Created SVG icons and updated manifest.json

### 3. Deprecated Meta Tags

**Problem**: `apple-mobile-web-app-capable` deprecated warning
**Solution**: Added proper `mobile-web-app-capable` meta tag

## 🔄 Firebase Authentication Setup Required

### The Issue

You're getting `auth/invalid-api-key` error because:

- Firebase Authentication is not enabled in your project console
- OR the web app is not properly registered

### Quick Fix Steps

#### Step 1: Open Firebase Console

Go to: https://console.firebase.google.com/project/hisab-islamic-app

#### Step 2: Enable Authentication

1. Click "Authentication" in left sidebar
2. Click "Get started"
3. Go to "Sign-in method" tab
4. Enable "Email/Password":
   - Click on "Email/Password"
   - Toggle "Enable" to ON
   - Click "Save"

#### Step 3: Verify Web App Registration

1. Go to Project Settings (gear icon)
2. Scroll to "Your apps" section
3. Ensure you have a web app registered
4. If not, click "Add app" > Web icon
5. Register with name: "HisabDaily Islamic App"

#### Step 4: Test

After enabling authentication, refresh your browser at:
http://localhost:5173

## 🚀 Current Status

### ✅ Working:

- Vite dev server on port 5173
- WebSocket HMR connections
- PWA icons and manifest
- Service worker registration
- Error handling for Firebase issues

### 🔄 Needs Setup:

- Firebase Authentication (manual setup required)
- AI API endpoint (when ready)

## 🌐 Access Your App

**Local Development**: http://localhost:5173
**Network Access**: http://192.168.0.103:5173

## 📝 Next Steps

1. **Enable Firebase Auth** (see steps above)
2. **Test authentication flow**
3. **Set up AI API endpoint** (for deed verification)
4. **Deploy to Vercel** when ready

## 🆘 Still Having Issues?

### Clear Browser Cache

1. Open DevTools (F12)
2. Right-click refresh button
3. Select "Empty Cache and Hard Reload"

### Restart Dev Server

```bash
pnpm dev
```

### Check Console Logs

Look for Firebase initialization messages:

- ✅ "Firebase initialized successfully" = Good
- ❌ "Firebase initialization failed" = Check Firebase Console

Your app should now be working properly! 🎉
