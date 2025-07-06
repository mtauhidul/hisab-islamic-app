import { useState, useEffect, Suspense } from 'react';
import { Toaster } from 'sonner';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { AuthProvider } from '@/contexts/AuthContext';
import { useAuth } from '@/hooks/useAuth';
import Dashboard from '@/components/Dashboard';
import Auth from '@/components/Auth';
import HomePage from '@/components/HomePage';
import { Loader2, AlertTriangle } from 'lucide-react';
import { ErrorBoundary } from 'react-error-boundary';

/**
 * Error fallback component for unhandled errors
 */
function ErrorFallback({ error }: { error: Error }) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="text-center space-y-4 max-w-md px-4">
        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto" />
        <h1 className="text-xl font-semibold text-foreground">Something went wrong</h1>
        <p className="text-sm text-muted-foreground">
          {error.message || 'An unexpected error occurred'}
        </p>
        <div className="space-y-2">
          <button
            onClick={() => window.location.reload()}
            className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Reload Page
          </button>
          <details className="text-xs text-left">
            <summary className="cursor-pointer text-muted-foreground">Technical Details</summary>
            <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto">{error.stack}</pre>
          </details>
        </div>
      </div>
    </div>
  );
}

/**
 * Loading fallback component
 */
function AppLoading() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="text-center space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground mx-auto" />
        <p className="text-sm text-muted-foreground">Loading application...</p>
      </div>
    </div>
  );
}

/**
 * Root App component with providers and error boundary
 */
function App() {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <Suspense fallback={<AppLoading />}>
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
      </Suspense>
    </ErrorBoundary>
  );
}

/**
 * Main App component wrapper - must be inside AuthProvider
 */
function AppContent() {
  const { user, loading, error } = useAuth();
  const [showAuth, setShowAuth] = useState(false);

  useEffect(() => {
    // Hide the initial loader when React is ready, with a small delay to prevent flash
    const timer = setTimeout(() => {
      const initialLoader = document.getElementById('initial-loader');
      if (initialLoader) {
        initialLoader.style.opacity = '0';
        initialLoader.style.transition = 'opacity 0.3s ease-out';
        setTimeout(() => {
          initialLoader.style.display = 'none';
        }, 300);
      }
    }, 200); // Small delay to ensure React is fully rendered

    return () => clearTimeout(timer);
  }, []);

  // Add debug logging
  useEffect(() => {
    console.log('🔍 AppContent render state:', { user: !!user, loading, error, showAuth });
  }, [user, loading, error, showAuth]);

  // Reset showAuth when user logs in successfully
  useEffect(() => {
    if (user) {
      setShowAuth(false);
    }
  }, [user]);

  // Show loading spinner while auth state is being determined
  if (loading) {
    console.log('⏳ AppContent: Showing loading state');
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
    console.log('❌ AppContent: Showing error state:', error);
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center space-y-4 max-w-md px-4">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto" />
          <h1 className="text-xl font-semibold text-foreground">Authentication Error</h1>
          <p className="text-sm text-muted-foreground">{error}</p>
          <div className="space-y-2">
            <button
              onClick={() => window.location.reload()}
              className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              Retry
            </button>
            <p className="text-xs text-muted-foreground">
              If this persists, check your Firebase configuration
            </p>
          </div>
        </div>
      </div>
    );
  }

  // If user is logged in, show dashboard
  if (user) {
    console.log('✅ AppContent: Showing dashboard for authenticated user');
    return <Dashboard />;
  }

  // If user wants to authenticate, show auth page
  if (showAuth) {
    console.log('🔐 AppContent: Showing auth page');
    return <Auth onBack={() => setShowAuth(false)} />;
  }

  // Otherwise show home page
  console.log('🏠 AppContent: Showing home page');
  return <HomePage onGetStarted={() => setShowAuth(true)} />;
}

export default App;
