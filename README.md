# HisabDaily (حساب) - Islamic Daily Tracker

> **🌟 Live Demo**: [https://hisabdaily.vercel.app](https://hisabdaily.vercel.app)

A privacy-first Islamic web application built with React, TypeScript, and Firebase for daily self-accountability and spiritual awareness.

**"Track. Regret. Repent."** - A modern approach to traditional Islamic *Muhasabah* (self-accountability).

## Features

- **🏠 Modern Homepage**: Inspirational landing page with Islamic values and clear features
- **🔒 Privacy-First**: Only stores minimal data (uid, date, count) - no deed text or verdicts
- **🛡️ Deed Verification**: Check if actions are permissible according to Islamic teachings via Fanar API
- **📊 Daily Self-Accountability**: Track daily count with automatic midnight reset
- **📈 Trend Analysis**: View progress over 7, 30, 90, 180, or 365 days with beautiful charts
- **📱 Offline Support**: Works offline with automatic sync when reconnected
- **⚡ PWA Ready**: Installable as a Progressive Web App with custom icons
- **♿ Accessibility**: 100% accessible with screen reader support
- **🎨 Islamic Design**: Respectful color palette with Arabic typography (Noto Naskh)
- **🌙 Dark Mode**: Full dark mode support with smooth transitions
- **🔐 Secure Authentication**: Firebase Auth with email/password
- **🌍 Responsive**: Mobile-first design that works on all devices

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **UI**: shadcn/ui, Tailwind CSS, Lucide Icons
- **Backend**: Firebase Auth & Firestore
- **API**: Fanar Islamic API for deed verification
- **Charts**: Recharts for trend visualization
- **Fonts**: Inter, Cairo, Noto Naskh Arabic
- **Offline**: Service Worker with background sync
- **Testing**: Vitest, Testing Library
- **Code Quality**: ESLint, Prettier, Husky
- **Deployment**: Vercel

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

   Edit `.env` with your Firebase and Fanar API configuration:

   ```env
   # Firebase Configuration
   VITE_FIREBASE_API_KEY=your_api_key_here
   VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   
   # Fanar API for Islamic deed verification
   VITE_FANAR_API_KEY=your_fanar_api_key_here
   ```

4. **Get Fanar API Access**

   1. Visit [https://api.fanar.qa/request](https://api.fanar.qa/request)
   2. Request API access for Islamic deed verification
   3. Once approved, get your API key from the dashboard
   4. Add the API key to your `.env` file as `VITE_FANAR_API_KEY`

   **Note**: The app uses Fanar's Islamic-RAG model which provides authentic Islamic rulings based on Quran, Hadith, and scholarly consensus.

5. **Set up Firebase**

   ```bash
   # Install Firebase CLI
   npm install -g firebase-tools

   # Login to Firebase
   firebase login

   # Initialize Firebase project
   firebase init
   ```

6. **Start development server**
   ```bash
   pnpm dev
   ```

## API Integration

### Islamic Deed Verification APIs

The app uses a hybrid approach for authentic Islamic deed verification:

#### Primary API: Reminder.dev (Free)
**Features**:
- Free API with no authentication required
- LLM-powered Islamic Q&A with Quran and Hadith references
- Works immediately without setup
- JSON responses with citations

**Endpoint**: `https://reminder.dev/api/search`

**Request**:
```json
{
  "q": "Is listening to music permissible (halal) or forbidden (haram) in Islam?"
}
```

**Response**:
```json
{
  "q": "Is listening to music permissible in Islam?",
  "answer": "The permissibility of music is debated among scholars...",
  "references": [
    {
      "source": "quran",
      "text": "And there are others who hurt the Prophet...",
      "metadata": {
        "chapter": "9",
        "verse": "61"
      }
    }
  ]
}
```

#### Secondary API: Fanar API (Premium)
**Features**:
- Professional Islamic-RAG model trained on authentic sources
- Provides rulings based on Quran, Hadith, and scholarly consensus
- More comprehensive source coverage
- Requires API key (free tier available)

**Endpoint**: `https://api.fanar.qa/v1/chat/completions`

**Setup**: Get your API key from [api.fanar.qa/request](https://api.fanar.qa/request)

### API Rate Limits

- **Reminder.dev**: No authentication required (reasonable usage)
- **Fanar Islamic-RAG**: 50 requests/minute
- **Fanar Models**: 50 requests/minute

## Legacy API Contract (Deprecated)

**Note**: The following API contract is deprecated. The app now uses Fanar API.

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

> **✅ Already Deployed!** HisabDaily is live at: [https://hisabdaily.vercel.app](https://hisabdaily.vercel.app)

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
   VITE_FANAR_API_KEY
   ```

4. **Configure Custom Domain (Optional)**
   
   In Vercel dashboard, go to Settings > Domains to add your custom domain.

### Important Notes

- **✅ Production Ready**: The app is live and fully functional at [hisabdaily.vercel.app](https://hisabdaily.vercel.app)
- The app requires Fanar API access for deed verification (`VITE_FANAR_API_KEY`)
- Ensure Firebase project is properly configured with authentication and Firestore
- The app works offline but requires initial online setup
- Responsive design works perfectly on mobile, tablet, and desktop
- PWA installation available for mobile users

## Screenshots

### 🏠 Homepage
Beautiful, motivational landing page with Islamic values and clear call-to-action.

### 🔐 Authentication
Clean, accessible sign-in/sign-up with privacy promise.

### 📊 Dashboard
- **Counter Tab**: Daily tracking with percentage changes
- **Checker Tab**: Islamic deed verification with sources
- **Trends Tab**: Beautiful charts showing progress over time

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contact

- **Developer**: Mir Tauhidul Islam
- **Email**: mislam.tauhidul@gmail.com
- **GitHub**: [@mtauhidul](https://github.com/mtauhidul)

## Islamic Guidance

This app is developed with the utmost respect for Islamic principles and values. All Islamic content and rulings are sourced from authentic Islamic texts and scholarly consensus through the Fanar API.

*If you find any content that may not align with Islamic teachings, please contact us immediately for correction.*
```

---

**May Allah (سبحانه وتعالى) accept our efforts and guide us on the straight path. Ameen.**

_"And whoever fears Allah - He will make for him a way out."_ - Quran 65:2
