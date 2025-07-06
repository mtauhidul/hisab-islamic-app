#!/bin/bash

echo "🔍 Diagnosing White Screen Issues..."
echo ""

echo "1. Checking if dev server is running..."
if curl -s http://localhost:5173 >/dev/null; then
    echo "✅ Dev server is responding"
else
    echo "❌ Dev server not responding"
    echo "   Run: pnpm dev"
    exit 1
fi

echo ""
echo "2. Checking for JavaScript errors in the build..."
if pnpm build >/dev/null 2>&1; then
    echo "✅ Build successful"
else
    echo "❌ Build failed - check for TypeScript/ESLint errors"
    echo "   Run: pnpm build"
fi

echo ""
echo "3. Checking for missing environment variables..."

if [ -f ".env" ]; then
    echo "✅ .env file exists"
    
    if grep -q "VITE_FIREBASE_API_KEY=AIzaSy" .env; then
        echo "✅ Firebase API key configured"
    else
        echo "❌ Firebase API key missing or invalid"
    fi
    
    if grep -q "VITE_FIREBASE_PROJECT_ID=hisab-islamic-app" .env; then
        echo "✅ Firebase project ID configured"
    else
        echo "❌ Firebase project ID missing"
    fi
else
    echo "❌ .env file not found"
fi

echo ""
echo "4. Checking Firebase connectivity..."
if curl -s https://hisab-islamic-app-default-rtdb.firebaseio.com/.json >/dev/null; then
    echo "✅ Firebase reachable"
else
    echo "⚠️  Firebase connectivity issue (might be normal)"
fi

echo ""
echo "5. Checking critical files..."

files=("src/main.tsx" "src/App.tsx" "src/contexts/AuthContext.tsx" "src/lib/firebase.ts")
for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file exists"
    else
        echo "❌ $file missing"
    fi
done

echo ""
echo "🔍 To debug further:"
echo "1. Open browser console at http://localhost:5173"
echo "2. Look for red error messages"
echo "3. Check Network tab for failed requests"
echo "4. Check the console logs added to App.tsx"
echo ""
echo "Common fixes:"
echo "- Clear browser cache (Cmd/Ctrl + Shift + R)"
echo "- Check Firebase configuration"
echo "- Verify all dependencies: pnpm install"
echo "- Try in incognito mode"
