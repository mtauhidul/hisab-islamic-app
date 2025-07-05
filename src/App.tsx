import { Toaster } from 'sonner';
import { AuthProvider } from '@/contexts/AuthContext';
import { useAuth } from '@/hooks/useAuth';
import Dashboard from '@/components/Dashboard';
import Auth from '@/components/Auth';
import { Loader2 } from 'lucide-react';

/**
 * Main App component wrapper
 */
function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return user ? <Dashboard /> : <Auth />;
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
    </AuthProvider>
  );
}

export default App;
