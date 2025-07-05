# Firebase Authentication Setup Guide

## The Issue
You're getting `auth/invalid-api-key` error because Firebase Authentication is not enabled in your project.

## Quick Fix Steps

### 1. Open Firebase Console
Go to: https://console.firebase.google.com/project/hisab-islamic-app

### 2. Enable Authentication
1. Click on "Authentication" in the left sidebar
2. Click "Get started"
3. Go to the "Sign-in method" tab
4. Enable "Email/Password" provider:
   - Click on "Email/Password"
   - Toggle "Enable" to ON
   - Click "Save"

### 3. Register Web App (if not done)
1. Go to Project Settings (gear icon)
2. Scroll down to "Your apps"
3. If no web app exists, click "Add app" > Web icon
4. Register app with name: "Hisab Web App"
5. Copy the configuration (should match your .env file)

### 4. API Key Restrictions (if any)
1. Go to Google Cloud Console: https://console.cloud.google.com/
2. Select project: hisab-islamic-app
3. Go to APIs & Services > Credentials
4. Find your API key and ensure it's not restricted for Firebase

### 5. Verify Setup
After enabling Authentication, restart the dev server:
```bash
pnpm dev
```

## Alternative: Create New Web App Config
If the current config doesn't work, you can generate a new one:

1. In Firebase Console > Project Settings
2. Scroll to "Your apps" section
3. Click "Add app" > Web
4. Register new app: "Hisab Islamic App"
5. Copy the new config to your .env file

## Current Config in .env
```
VITE_FIREBASE_API_KEY=your_firebase_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

This should resolve the Firebase Auth invalid-api-key error.
