import { useState, useEffect } from 'react';
import { Toaster } from 'sonner';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { AuthProvider } from '@/contexts/AuthContext';
import { useAuth } from '@/hooks/useAuth';
import Dashboard from '@/components/Dashboard';
import Auth from '@/components/Auth';
import HomePage from '@/components/HomePage';
import { Loader2 } from 'lucide-react';

/**
 * Main App component wrapper
 */
function AppContent() {
  const { user, loading, error } = useAuth();
  const [showAuth, setShowAuth] = useState(false);

  // Reset showAuth when user logs in successfully
  useEffect(() => {
    if (user) {
      setShowAuth(false);
    }
  }, [user]);

  // Show loading spinner while auth state is being determined
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground mx-auto" />
          <p className="text-sm text-muted-foreground">Initializing...</p>
        </div>
      </div>
    );
  }

  // Show error if Firebase initialization failed
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center space-y-4 max-w-md">
          <div className="text-red-500 text-xl">⚠️</div>
          <p className="text-sm text-muted-foreground">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // If user is logged in, show dashboard
  if (user) {
    return <Dashboard />;
  }

  // If user wants to authenticate, show auth page
  if (showAuth) {
    return <Auth onBack={() => setShowAuth(false)} />;
  }

  // Otherwise show home page
  return <HomePage onGetStarted={() => setShowAuth(true)} />;
}

/**
 * Root App component with providers
 */
function App() {
  return (
    <AuthProvider>
      <AppContent />
      <Toaster
        position="top-center"
        richColors
        theme="system"
        toastOptions={{
          style: {
            fontSize: '14px',
          },
        }}
      />
      <Analytics />
      <SpeedInsights />
    </AuthProvider>
  );
}

export default App;
