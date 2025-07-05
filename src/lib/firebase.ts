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
  
  return '';
};

// Wait for config to be loaded if we're in browser and it's not ready yet
const waitForConfig = (): Promise<void> => {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve();
      return;
    }

    const checkConfig = () => {
      const hasRuntimeConfig = (window as { __FIREBASE_CONFIG__?: Record<string, string> }).__FIREBASE_CONFIG__;
      if (hasRuntimeConfig) {
        resolve();
        return;
      }

      // Wait a bit more for config.js to load
      setTimeout(checkConfig, 50);
    };

    // Check immediately, or wait briefly if script is still loading
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', checkConfig);
    } else {
      setTimeout(checkConfig, 10); // Small delay to allow script execution
    }
  });
};

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

const initializeFirebaseAsync = async () => {
  // Wait for config to be available
  await waitForConfig();

  const firebaseConfig = {
    apiKey: getEnvVar('VITE_FIREBASE_API_KEY'),
    authDomain: getEnvVar('VITE_FIREBASE_AUTH_DOMAIN'),
    projectId: getEnvVar('VITE_FIREBASE_PROJECT_ID'),
    storageBucket: getEnvVar('VITE_FIREBASE_STORAGE_BUCKET'),
    messagingSenderId: getEnvVar('VITE_FIREBASE_MESSAGING_SENDER_ID'),
    appId: getEnvVar('VITE_FIREBASE_APP_ID'),
  };

  // Validate Firebase configuration with better error checking
  const isValidConfig =
    firebaseConfig.apiKey &&
    firebaseConfig.authDomain &&
    firebaseConfig.projectId &&
    firebaseConfig.apiKey !== 'your_api_key_here' &&
    firebaseConfig.apiKey !== '' &&
    firebaseConfig.apiKey.length > 10; // Basic validation

  if (!isValidConfig) {
    console.warn(
      '⚠️ Firebase configuration is incomplete. Please check your environment variables.'
    );
    console.log('Current config status:', {
      apiKey: firebaseConfig.apiKey ? `${firebaseConfig.apiKey.substring(0, 10)}...` : 'missing',
      authDomain: firebaseConfig.authDomain || 'missing',
      projectId: firebaseConfig.projectId || 'missing',
      hasRuntimeConfig: typeof window !== 'undefined' && !!(window as { __FIREBASE_CONFIG__?: Record<string, string> }).__FIREBASE_CONFIG__,
      configTimestamp: typeof window !== 'undefined' ? (window as { __FIREBASE_CONFIG_LOADED__?: number }).__FIREBASE_CONFIG_LOADED__ : 'N/A',
    });
    
    // Don't initialize Firebase if config is invalid - this prevents auth/invalid-api-key errors
    console.log('🔄 Skipping Firebase initialization due to missing configuration');
    return;
  }

  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    console.log('✅ Firebase initialized successfully');
  } catch (error) {
    console.error('❌ Firebase initialization failed:', error);
    console.log('📋 Please check FIREBASE_SETUP_GUIDE.md for setup instructions');
  }
};

// Initialize Firebase (async)
initializeFirebaseAsync();

export { auth, db };
