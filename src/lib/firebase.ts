import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

// Helper function to get environment variables with multiple fallbacks
const getEnvVar = (key: string): string => {
  // 1. Try runtime config first (from config.js)
  if (typeof window !== 'undefined') {
    const runtimeConfig = (window as { __FIREBASE_CONFIG__?: Record<string, string> }).__FIREBASE_CONFIG__;
    if (runtimeConfig && runtimeConfig[key] && runtimeConfig[key] !== '') {
      return runtimeConfig[key];
    }
  }
  
  // 2. Fallback to Vite's import.meta.env
  const envValue = import.meta.env[key];
  if (envValue && envValue !== '') {
    return envValue;
  }
  
  // 3. Last resort: try to get from any global config
  if (typeof window !== 'undefined') {
    const globalWindow = window as { __VITE_ENV__?: Record<string, string> };
    if (globalWindow.__VITE_ENV__) {
      const globalEnv = globalWindow.__VITE_ENV__[key];
      if (globalEnv && globalEnv !== '') {
        return globalEnv;
      }
    }
  }
  
  return '';
};

const firebaseConfig = {
  apiKey: getEnvVar('VITE_FIREBASE_API_KEY'),
  authDomain: getEnvVar('VITE_FIREBASE_AUTH_DOMAIN'),
  projectId: getEnvVar('VITE_FIREBASE_PROJECT_ID'),
  storageBucket: getEnvVar('VITE_FIREBASE_STORAGE_BUCKET'),
  messagingSenderId: getEnvVar('VITE_FIREBASE_MESSAGING_SENDER_ID'),
  appId: getEnvVar('VITE_FIREBASE_APP_ID'),
};

// Validate Firebase configuration
const isValidConfig =
  firebaseConfig.apiKey &&
  firebaseConfig.authDomain &&
  firebaseConfig.projectId &&
  firebaseConfig.apiKey !== 'your_api_key_here' &&
  firebaseConfig.apiKey.length > 10; // Basic validation

if (!isValidConfig) {
  console.warn(
    '⚠️ Firebase configuration is incomplete. Please check your environment variables.'
  );
  console.log('Current config:', {
    apiKey: firebaseConfig.apiKey ? `${firebaseConfig.apiKey.substring(0, 10)}...` : 'missing',
    authDomain: firebaseConfig.authDomain || 'missing',
    projectId: firebaseConfig.projectId || 'missing',
  });
}

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  console.log('✅ Firebase initialized successfully');
} catch (error) {
  console.error('❌ Firebase initialization failed:', error);
  console.log('📋 Please check FIREBASE_SETUP_GUIDE.md for setup instructions');
}

export { auth, db };
