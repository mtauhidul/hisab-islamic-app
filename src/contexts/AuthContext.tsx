import { createContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import type { User } from 'firebase/auth';
import { auth } from '@/lib/firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
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

  useEffect(() => {
    if (!auth) {
      console.warn('Firebase Auth not available');
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  /**
   * Sign in with email and password
   */
  const signIn = async (email: string, password: string) => {
    if (!auth) {
      throw new Error('Firebase Auth not available. Please check your Firebase configuration.');
    }
    await signInWithEmailAndPassword(auth, email, password);
  };

  /**
   * Create new account with email and password
   */
  const signUp = async (email: string, password: string) => {
    if (!auth) {
      throw new Error('Firebase Auth not available. Please check your Firebase configuration.');
    }
    await createUserWithEmailAndPassword(auth, email, password);
  };

  /**
   * Sign out current user
   */
  const logout = async () => {
    if (!auth) {
      throw new Error('Firebase Auth not available. Please check your Firebase configuration.');
    }
    await signOut(auth);
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
