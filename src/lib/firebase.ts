import { initializeApp, type FirebaseApp } from "firebase/app";
import {
  browserLocalPersistence,
  getAuth,
  setPersistence,
  type Auth,
} from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

// Helper function to get environment variables with multiple fallbacks
const getEnvVar = (key: string): string => {
  // In development, prefer direct environment variables
  if (import.meta.env.DEV) {
    const envValue = import.meta.env[key];
    if (envValue && envValue !== "") {
      return envValue;
    }
  }

  // 1. Try runtime config first (from config.js) for production
  if (typeof window !== "undefined") {
    const runtimeConfig = (
      window as { __FIREBASE_CONFIG__?: Record<string, string> }
    ).__FIREBASE_CONFIG__;
    if (runtimeConfig && runtimeConfig[key] && runtimeConfig[key] !== "") {
      return runtimeConfig[key];
    }
  }

  // 2. Fallback to Vite's import.meta.env
  const envValue = import.meta.env[key];
  if (envValue && envValue !== "") {
    return envValue;
  }

  return "";
};

// Validate Firebase configuration
const isValidConfig = (config: Record<string, string>) =>
  config.apiKey &&
  config.authDomain &&
  config.projectId &&
  config.apiKey !== "your_api_key_here" &&
  config.apiKey !== "" &&
  config.apiKey.length > 10;

// Firebase app state
let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let initializationPromise: Promise<{ auth: Auth; db: Firestore }> | null = null;

/**
 * Wait for runtime config to be available
 */
const waitForRuntimeConfig = (): Promise<void> => {
  return new Promise((resolve) => {
    // In development, skip config loading and use env vars directly
    if (import.meta.env.DEV) {
      resolve();
      return;
    }

    if (typeof window === "undefined") {
      resolve();
      return;
    }

    let attempts = 0;
    const maxAttempts = 40; // Maximum 2 seconds (40 * 50ms)

    const checkConfig = () => {
      attempts++;

      const runtimeConfig = (
        window as { __FIREBASE_CONFIG__?: Record<string, string> }
      ).__FIREBASE_CONFIG__;

      if (runtimeConfig && runtimeConfig.VITE_FIREBASE_API_KEY) {
        // Runtime config found
        resolve();
        return;
      }

      // If we've reached max attempts, resolve anyway and fallback to env vars
      if (attempts >= maxAttempts) {
        resolve();
        return;
      }

      // Check if we're in development mode
      if (
        window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1"
      ) {
        // In development, don't wait too long - use env vars after short delay
        if (attempts >= 6) {
          // 300ms max wait in development
          resolve();
          return;
        }
      }

      // Continue checking
      setTimeout(checkConfig, 50);
    };

    checkConfig();
  });
};

/**
 * Initialize Firebase with proper async handling and persistence
 */
const initializeFirebase = async (): Promise<{ auth: Auth; db: Firestore }> => {
  if (initializationPromise) {
    return initializationPromise;
  }

  initializationPromise = (async () => {
    try {
      // Wait for runtime config in production
      await waitForRuntimeConfig();

      // Get the configuration
      const firebaseConfig = {
        apiKey: getEnvVar("VITE_FIREBASE_API_KEY"),
        authDomain: getEnvVar("VITE_FIREBASE_AUTH_DOMAIN"),
        projectId: getEnvVar("VITE_FIREBASE_PROJECT_ID"),
        storageBucket: getEnvVar("VITE_FIREBASE_STORAGE_BUCKET"),
        messagingSenderId: getEnvVar("VITE_FIREBASE_MESSAGING_SENDER_ID"),
        appId: getEnvVar("VITE_FIREBASE_APP_ID"),
      };

      if (!isValidConfig(firebaseConfig)) {
        const missingKeys = Object.entries(firebaseConfig)
          .filter(([, value]) => !value || value === "")
          .map(([key]) => key);

        console.error(
          "❌ Firebase configuration is invalid. Missing:",
          missingKeys
        );

        // In production, configuration missing - throw error immediately
        if (
          typeof window !== "undefined" &&
          window.location.hostname !== "localhost" &&
          window.location.hostname !== "127.0.0.1" &&
          missingKeys.length > 0
        ) {
          throw new Error(
            `Firebase configuration is invalid. Missing: ${missingKeys.join(", ")}`
          );
        }

        if (!isValidConfig(firebaseConfig)) {
          throw new Error(
            `Firebase configuration is invalid. Missing: ${missingKeys.join(", ")}`
          );
        }
      }

      // Initialize Firebase app if not already initialized
      if (!app) {
        app = initializeApp(firebaseConfig);
        // Firebase app initialized
      }

      // Initialize Auth with persistence if not already initialized
      if (!auth) {
        auth = getAuth(app);

        try {
          // Set persistence to LOCAL (survives browser restarts)
          await setPersistence(auth, browserLocalPersistence);
          // Firebase Auth persistence set to LOCAL
        } catch {
          // If setting persistence fails, continue anyway (might already be set)
        }

        // Firebase Auth initialized
      }

      // Initialize Firestore if not already initialized
      if (!db) {
        db = getFirestore(app);
        // Firebase Firestore initialized
      }

      // Firebase fully initialized
      return { auth, db };
    } catch (error) {
      console.error("❌ Firebase initialization failed:", error);

      // Reset state so we can try again
      app = null;
      auth = null;
      db = null;
      initializationPromise = null;

      throw error;
    }
  })();

  return initializationPromise;
};

// Export function to get Firebase instances (with initialization check)
export const getFirebaseAuth = async (): Promise<Auth> => {
  const { auth } = await initializeFirebase();
  return auth;
};

export const getFirebaseDb = async (): Promise<Firestore> => {
  const { db } = await initializeFirebase();
  return db;
};

// Export the initialization function
export { initializeFirebase };

// Export synchronous instances (may be null initially - only use these if you're sure Firebase is initialized)
export { auth, db };

// Default export
export default {
  initializeFirebase,
  getFirebaseAuth,
  getFirebaseDb,
  auth,
  db,
};
