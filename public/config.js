// Runtime configuration for development
// Generated for local development

(function() {
  if (typeof window !== 'undefined') {
    // Set the config with local development values
    window.__FIREBASE_CONFIG__ = {
      VITE_FIREBASE_API_KEY: "AIzaSyCZK71OV1lwcV9Ma4r-o3V3A0UuAcwHfxY",
      VITE_FIREBASE_AUTH_DOMAIN: "hisab-islamic-app.firebaseapp.com",
      VITE_FIREBASE_PROJECT_ID: "hisab-islamic-app",
      VITE_FIREBASE_STORAGE_BUCKET: "hisab-islamic-app.firebasestorage.app",
      VITE_FIREBASE_MESSAGING_SENDER_ID: "931613743919",
      VITE_FIREBASE_APP_ID: "1:931613743919:web:bfd1aee4ad854676ee5fda",
    };

    // Mark the config as loaded
    window.__FIREBASE_CONFIG_LOADED__ = Date.now();

    // Debug logging for development
    console.log('🔧 Firebase config loaded for development:', {
      apiKey: window.__FIREBASE_CONFIG__.VITE_FIREBASE_API_KEY ? 'Set' : 'Missing',
      projectId: window.__FIREBASE_CONFIG__.VITE_FIREBASE_PROJECT_ID || 'Missing'
    });
  }
})();
