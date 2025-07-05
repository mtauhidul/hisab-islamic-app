# Vercel Deployment Guide for Hisab Islamic App

## Prerequisites

1. **GitHub Repository**: Push your code to GitHub
2. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
3. **Firebase Project**: Ensure your Firebase project is configured with:
   - Authentication (Email/Password enabled)
   - Firestore database
   - Security rules deployed

## Deployment Steps

### Method 1: Deploy via GitHub (Recommended)

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "feat: ready for vercel deployment"
   git push origin main
   ```

2. **Connect to Vercel**:
   - Go to [vercel.com/new](https://vercel.com/new)
   - Import your GitHub repository
   - Vercel will automatically detect it's a Vite project

3. **Configure Environment Variables**:
   Add these in Vercel Dashboard > Settings > Environment Variables:
   ```
   VITE_FIREBASE_API_KEY=AIzaSyCZK71OV1lwcV9Ma4r-o3V3A0UuAcwHfxY
   VITE_FIREBASE_AUTH_DOMAIN=hisab-islamic-app.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=hisab-islamic-app
   VITE_FIREBASE_STORAGE_BUCKET=hisab-islamic-app.firebasestorage.app
   VITE_FIREBASE_MESSAGING_SENDER_ID=931613743919
   VITE_FIREBASE_APP_ID=1:931613743919:web:36c9359144aaadadee5fda
   VITE_AI_API_URL=http://localhost:3001/api/ai/verifyDeed
   ```

4. **Deploy**: Click "Deploy" - Vercel will build and deploy automatically

### Method 2: Deploy via CLI

1. **Install Vercel CLI** (already done):
   ```bash
   pnpm add -D vercel
   ```

2. **Login to Vercel**:
   ```bash
   npx vercel login
   ```

3. **Deploy Preview**:
   ```bash
   pnpm deploy:preview
   ```

4. **Deploy to Production**:
   ```bash
   pnpm deploy
   ```

## Configuration Files

- `vercel.json`: Project configuration for Vercel
- `.vercelignore`: Files to exclude from deployment
- Package.json scripts:
  - `pnpm deploy:preview`: Deploy preview version
  - `pnpm deploy`: Deploy to production

## Important Notes

1. **AI API**: Update `VITE_AI_API_URL` to your actual API endpoint
2. **Custom Domain**: Configure in Vercel Dashboard > Settings > Domains
3. **Analytics**: Enable Vercel Analytics for performance monitoring
4. **PWA**: The app will work as a PWA once deployed

## Firebase Setup Reminder

Since you're using Vercel for hosting but Firebase for backend:

1. **Enable Authentication** in Firebase Console:
   - Go to Authentication > Sign-in method
   - Enable "Email/Password"

2. **Firestore Database**:
   - Already configured with security rules
   - Database created and indexes deployed

3. **Security Rules**: Already deployed with the command:
   ```bash
   firebase deploy --only firestore:rules
   firebase deploy --only firestore:indexes
   ```

## Post-Deployment

1. **Test the deployed app** thoroughly
2. **Check PWA installation** on mobile/desktop
3. **Verify offline functionality**
4. **Test authentication flow**
5. **Confirm data sync with Firestore**

Your app should now be live on Vercel with a URL like: `https://your-app-name.vercel.app`
