# Hisab (حساب) - Islamic Daily Tracker

A privacy-first Islamic web application built with React, TypeScript, and Firebase for tracking daily deeds and spiritual growth.

## Features

- **Privacy-First**: Only stores minimal data (uid, date, count) - no deed text or verdicts
- **Deed Verification**: Check if actions are permissible according to Islamic teachings
- **Daily Sin Counter**: Track daily count with automatic midnight reset
- **Trend Analysis**: View progress over 7, 30, 90, 180, or 365 days
- **Offline Support**: Works offline with automatic sync when reconnected
- **PWA Ready**: Installable as a Progressive Web App
- **Accessibility**: 100% accessible with screen reader support
- **Islamic Design**: Respectful color palette with Arabic typography
- **Dark Mode**: Full dark mode support

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **UI**: shadcn/ui, Tailwind CSS
- **Backend**: Firebase Auth & Firestore
- **Charts**: Recharts
- **Offline**: Service Worker with background sync
- **Testing**: Vitest, Testing Library
- **Code Quality**: ESLint, Prettier, Husky

## Quick Start

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm
- Firebase project

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd hisabdaily
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env
   ```

   Edit `.env` with your Firebase configuration:

   ```env
   VITE_FIREBASE_API_KEY=your_api_key_here
   VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   VITE_AI_API_URL=http://localhost:3001/api/ai/verifyDeed
   ```

4. **Set up Firebase**

   ```bash
   # Install Firebase CLI
   npm install -g firebase-tools

   # Login to Firebase
   firebase login

   # Initialize Firebase project
   firebase init
   ```

5. **Start development server**
   ```bash
   pnpm dev
   ```

## API Contract

### AI Deed Verification

**Endpoint**: `POST /api/ai/verifyDeed`

**Request**:

```json
{
  "query": "text of deed",
  "language": "en"
}
```

**Response**:

```json
{
  "verdict": "sin" | "not_sin",
  "evidence": [
    {
      "source": "Quran 17:32",
      "snippet": "Do not approach adultery…"
    },
    {
      "source": "Hadith Bukhari #6134",
      "snippet": "..."
    }
  ]
}
```

## Development

### Available Scripts

```bash
# Development
pnpm dev                 # Start development server
pnpm build              # Build for production
pnpm preview            # Preview production build

# Code Quality
pnpm lint               # Run ESLint
pnpm lint:fix           # Fix ESLint issues
pnpm format             # Format code with Prettier
pnpm format:check       # Check formatting

# Testing
pnpm test               # Run tests
pnpm test:ui            # Run tests with UI
pnpm test:coverage      # Run tests with coverage

# Firebase
pnpm firebase:emulators # Start Firebase emulators
```

## Deployment

### Deploy to Vercel

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "feat: ready for production deployment"
   git push origin main
   ```

2. **Deploy to Vercel**
   
   [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)
   
   Or manually:
   
   ```bash
   # Install Vercel CLI
   npm i -g vercel
   
   # Deploy
   vercel
   
   # Deploy to production
   vercel --prod
   ```

3. **Set Environment Variables in Vercel**
   
   Go to your Vercel project dashboard and add these environment variables:
   
   ```
   VITE_FIREBASE_API_KEY
   VITE_FIREBASE_AUTH_DOMAIN
   VITE_FIREBASE_PROJECT_ID
   VITE_FIREBASE_STORAGE_BUCKET
   VITE_FIREBASE_MESSAGING_SENDER_ID
   VITE_FIREBASE_APP_ID
   VITE_AI_API_URL
   ```

4. **Configure Custom Domain (Optional)**
   
   In Vercel dashboard, go to Settings > Domains to add your custom domain.

### Important Notes

- The app requires an AI API endpoint for deed verification (`VITE_AI_API_URL`)
- Ensure Firebase project is properly configured with authentication and Firestore
- The app works offline but requires initial online setup
```

---

**May Allah (سبحانه وتعالى) accept our efforts and guide us on the straight path. Ameen.**

_"And whoever fears Allah - He will make for him a way out."_ - Quran 65:2
