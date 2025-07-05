#!/bin/bash

# Build script for Vercel deployment
# This script replaces placeholders in config.js with actual environment variables

echo "🔧 Starting build process..."

# Run the normal build
npm run build

# Replace environment variables using Node.js script
node scripts/replace-env.cjs
