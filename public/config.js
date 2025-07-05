// Runtime configuration for production
// This script ensures environment variables are always available,
// even when the main bundle is cached by the browser

(function() {
  // Force cache-busting for config by checking build timestamp
  const buildTime = Date.now();
  
  if (typeof window !== 'undefined') {
    // Always set/update the config, even if it exists
    window.__FIREBASE_CONFIG__ = {
      // Use environment variables embedded at build time as primary source
      VITE_FIREBASE_API_KEY: '%VITE_FIREBASE_API_KEY%',
      VITE_FIREBASE_AUTH_DOMAIN: '%VITE_FIREBASE_AUTH_DOMAIN%',
      VITE_FIREBASE_PROJECT_ID: '%VITE_FIREBASE_PROJECT_ID%',
      VITE_FIREBASE_STORAGE_BUCKET: '%VITE_FIREBASE_STORAGE_BUCKET%',
      VITE_FIREBASE_MESSAGING_SENDER_ID: '%VITE_FIREBASE_MESSAGING_SENDER_ID%',
      VITE_FIREBASE_APP_ID: '%VITE_FIREBASE_APP_ID%',
    };

    // Fallback to meta tags if placeholders weren't replaced
    const getMetaContent = (name) => {
      const meta = document.querySelector(`meta[name="${name}"]`);
      return meta ? meta.getAttribute('content') : null;
    };

    // Replace any unreplaced placeholders with meta tag values
    Object.keys(window.__FIREBASE_CONFIG__).forEach(key => {
      const value = window.__FIREBASE_CONFIG__[key];
      if (value.startsWith('%') && value.endsWith('%')) {
        const metaKey = key.toLowerCase().replace('vite_', '').replace(/_/g, '-');
        window.__FIREBASE_CONFIG__[key] = getMetaContent(`firebase-${metaKey}`) || '';
      }
    });

    // Debug logging for development
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      console.log('🔧 Firebase config loaded:', {
        timestamp: buildTime,
        apiKey: window.__FIREBASE_CONFIG__.VITE_FIREBASE_API_KEY ? 'Set' : 'Missing',
        projectId: window.__FIREBASE_CONFIG__.VITE_FIREBASE_PROJECT_ID || 'Missing'
      });
    }
  }
})();
