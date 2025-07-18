const fs = require("fs");
const path = require("path");

// Generating runtime config.js...

const distPath = path.join(__dirname, "..", "dist");
const configPath = path.join(distPath, "config.js");

// Ensure dist directory exists
if (!fs.existsSync(distPath)) {
  fs.mkdirSync(distPath, { recursive: true });
}

// Get environment variables
const envVars = {
  VITE_FIREBASE_API_KEY: process.env.VITE_FIREBASE_API_KEY || "",
  VITE_FIREBASE_AUTH_DOMAIN: process.env.VITE_FIREBASE_AUTH_DOMAIN || "",
  VITE_FIREBASE_PROJECT_ID: process.env.VITE_FIREBASE_PROJECT_ID || "",
  VITE_FIREBASE_STORAGE_BUCKET: process.env.VITE_FIREBASE_STORAGE_BUCKET || "",
  VITE_FIREBASE_MESSAGING_SENDER_ID:
    process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  VITE_FIREBASE_APP_ID: process.env.VITE_FIREBASE_APP_ID || "",
};

// Generate the config.js content
const configContent = `// Runtime configuration for production
// Generated at build time: ${new Date().toISOString()}

(function() {
  if (typeof window !== 'undefined') {
    window.__FIREBASE_CONFIG__ = {
      VITE_FIREBASE_API_KEY: "${envVars.VITE_FIREBASE_API_KEY}",
      VITE_FIREBASE_AUTH_DOMAIN: "${envVars.VITE_FIREBASE_AUTH_DOMAIN}",
      VITE_FIREBASE_PROJECT_ID: "${envVars.VITE_FIREBASE_PROJECT_ID}",
      VITE_FIREBASE_STORAGE_BUCKET: "${envVars.VITE_FIREBASE_STORAGE_BUCKET}",
      VITE_FIREBASE_MESSAGING_SENDER_ID: "${envVars.VITE_FIREBASE_MESSAGING_SENDER_ID}",
      VITE_FIREBASE_APP_ID: "${envVars.VITE_FIREBASE_APP_ID}",
    };
  }
})();`;

// Write the config file
fs.writeFileSync(configPath, configContent);

// Runtime config.js generated successfully
// Build completed successfully!
