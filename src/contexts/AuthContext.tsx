import { getFirebaseAuth } from '@/lib/firebase';
import type { User } from 'firebase/auth';
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import type { ReactNode } from 'react';
import { createContext, useEffect, useState } from 'react';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export { AuthContext };

/**
 * Provides authentication context to child components
 */
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    let isMounted = true;
    let timeoutId: NodeJS.Timeout;
    const startTime = Date.now();
    const MIN_LOADING_TIME = 500; // Minimum loading time to prevent flash

    const setupAuth = async () => {
      try {
        // Set a safety timeout to prevent infinite loading
        timeoutId = setTimeout(() => {
          if (isMounted) {
            setError('Authentication initialization timed out. Please refresh the page.');
            setLoading(false);
          }
        }, 10000); // 10 second timeout

        // Initialize Firebase and get auth instance
        const auth = await getFirebaseAuth();

        // Clear timeout if initialization succeeds
        if (timeoutId) clearTimeout(timeoutId);

        // If component was unmounted during async operation, don't proceed
        if (!isMounted) return;

        // Set up auth state listener with proper error handling
        unsubscribe = onAuthStateChanged(
          auth,
          (user) => {
            if (!isMounted) return;

            // Ensure minimum loading time to prevent flash
            const elapsedTime = Date.now() - startTime;
            const remainingTime = Math.max(0, MIN_LOADING_TIME - elapsedTime);

            setTimeout(() => {
              if (isMounted) {
                setUser(user);
                setLoading(false);
                setError(null);
              }
            }, remainingTime);
          },
          (authError) => {
            if (!isMounted) return;
            console.error('❌ AuthProvider: Auth state listener error:', authError);

            // Ensure minimum loading time even for errors
            const elapsedTime = Date.now() - startTime;
            const remainingTime = Math.max(0, MIN_LOADING_TIME - elapsedTime);

            setTimeout(() => {
              if (isMounted) {
                setError(`Authentication error: ${authError.message}`);
                setLoading(false);
              }
            }, remainingTime);
          }
        );
      } catch (initError: unknown) {
        if (!isMounted) return;
        const errorMessage = initError instanceof Error ? initError.message : 'Unknown error';
        console.error('❌ AuthProvider: Firebase Auth initialization failed:', initError);

        // Ensure minimum loading time even for errors
        const elapsedTime = Date.now() - startTime;
        const remainingTime = Math.max(0, MIN_LOADING_TIME - elapsedTime);

        setTimeout(() => {
          if (isMounted) {
            setError(`Failed to initialize authentication: ${errorMessage}`);
            setLoading(false);
          }
        }, remainingTime);
      }
    };

    setupAuth();

    return () => {
      isMounted = false;
      if (timeoutId) clearTimeout(timeoutId);
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  /**
   * Sign in with email and password
   */
  const signIn = async (email: string, password: string) => {
    const auth = await getFirebaseAuth();
    await signInWithEmailAndPassword(auth, email, password);
  };

  /**
   * Create new account with email and password
   */
  const signUp = async (email: string, password: string) => {
    const auth = await getFirebaseAuth();
    await createUserWithEmailAndPassword(auth, email, password);
  };

  /**
   * Sign out current user
   */
  const logout = async () => {
    const auth = await getFirebaseAuth();
    await signOut(auth);
  };

  const value = {
    user,
    loading,
    error,
    signIn,
    signUp,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
