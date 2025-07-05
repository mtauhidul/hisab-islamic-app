import { useState } from 'react';
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
  const { user, loading } = useAuth();
  const [showAuth, setShowAuth] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
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
