const fs = require('fs');
const path = require('path');

console.log('🔄 Generating runtime config.js...');

const distPath = path.join(__dirname, '..', 'dist');
const configPath = path.join(distPath, 'config.js');

// Ensure dist directory exists
if (!fs.existsSync(distPath)) {
  fs.mkdirSync(distPath, { recursive: true });
}

// Get environment variables
const envVars = {
  'VITE_FIREBASE_API_KEY': process.env.VITE_FIREBASE_API_KEY || '',
  'VITE_FIREBASE_AUTH_DOMAIN': process.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  'VITE_FIREBASE_PROJECT_ID': process.env.VITE_FIREBASE_PROJECT_ID || '',
  'VITE_FIREBASE_STORAGE_BUCKET': process.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  'VITE_FIREBASE_MESSAGING_SENDER_ID': process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  'VITE_FIREBASE_APP_ID': process.env.VITE_FIREBASE_APP_ID || '',
};

// Generate build timestamp for cache busting
const buildTimestamp = Date.now();

// Generate the config.js content
const configContent = `// Runtime configuration for production
// Generated at build time: ${new Date().toISOString()}
// Build timestamp: ${buildTimestamp}

(function() {
  if (typeof window !== 'undefined') {
    // Always set/update the config with current build timestamp
    window.__FIREBASE_CONFIG__ = {
      VITE_FIREBASE_API_KEY: "${envVars.VITE_FIREBASE_API_KEY}",
      VITE_FIREBASE_AUTH_DOMAIN: "${envVars.VITE_FIREBASE_AUTH_DOMAIN}",
      VITE_FIREBASE_PROJECT_ID: "${envVars.VITE_FIREBASE_PROJECT_ID}",
      VITE_FIREBASE_STORAGE_BUCKET: "${envVars.VITE_FIREBASE_STORAGE_BUCKET}",
      VITE_FIREBASE_MESSAGING_SENDER_ID: "${envVars.VITE_FIREBASE_MESSAGING_SENDER_ID}",
      VITE_FIREBASE_APP_ID: "${envVars.VITE_FIREBASE_APP_ID}",
    };

    // Mark the config as loaded with timestamp
    window.__FIREBASE_CONFIG_LOADED__ = ${buildTimestamp};

    // Debug logging for development
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      console.log('🔧 Firebase config loaded:', {
        timestamp: ${buildTimestamp},
        apiKey: window.__FIREBASE_CONFIG__.VITE_FIREBASE_API_KEY ? 'Set' : 'Missing',
        projectId: window.__FIREBASE_CONFIG__.VITE_FIREBASE_PROJECT_ID || 'Missing'
      });
    }
  }
})();`;

// Write the config file
fs.writeFileSync(configPath, configContent);

console.log('✅ Runtime config.js generated successfully');

// Log which variables were set (without revealing values)
Object.entries(envVars).forEach(([key, value]) => {
  console.log(`  - ${key}: ${value ? 'Set' : 'Missing'}`);
});

console.log('🚀 Build completed successfully!');
