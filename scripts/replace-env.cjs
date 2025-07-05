const fs = require('fs');
const path = require('path');

console.log('🔄 Replacing environment variables in config.js...');

const configPath = path.join(__dirname, '..', 'dist', 'config.js');

if (fs.existsSync(configPath)) {
  let configContent = fs.readFileSync(configPath, 'utf8');
  
  // Replace placeholders with actual environment variables
  const envVars = {
    'VITE_FIREBASE_API_KEY': process.env.VITE_FIREBASE_API_KEY || '',
    'VITE_FIREBASE_AUTH_DOMAIN': process.env.VITE_FIREBASE_AUTH_DOMAIN || '',
    'VITE_FIREBASE_PROJECT_ID': process.env.VITE_FIREBASE_PROJECT_ID || '',
    'VITE_FIREBASE_STORAGE_BUCKET': process.env.VITE_FIREBASE_STORAGE_BUCKET || '',
    'VITE_FIREBASE_MESSAGING_SENDER_ID': process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
    'VITE_FIREBASE_APP_ID': process.env.VITE_FIREBASE_APP_ID || '',
  };
  
  Object.entries(envVars).forEach(([key, value]) => {
    const placeholder = `%${key}%`;
    configContent = configContent.replace(new RegExp(placeholder, 'g'), value);
  });
  
  fs.writeFileSync(configPath, configContent);
  
  console.log('✅ Environment variables replaced in config.js');
  
  // Log which variables were set (without revealing values)
  Object.entries(envVars).forEach(([key, value]) => {
    console.log(`  - ${key}: ${value ? 'Set' : 'Missing'}`);
  });
} else {
  console.log('⚠️ config.js not found in dist folder');
  process.exit(1);
}

console.log('🚀 Build completed successfully!');
