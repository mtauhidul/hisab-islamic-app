import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';

// Add error handling for the root element
const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Failed to find the root element');
}

// Hide initial loader when React starts
const initialLoader = document.getElementById('initial-loader');
if (initialLoader) {
  // Delay hiding to prevent flash
  setTimeout(() => {
    initialLoader.style.display = 'none';
  }, 100);
}

// Create React root with error handling
try {
  const root = createRoot(rootElement);

  root.render(
    <StrictMode>
      <App />
    </StrictMode>
  );
} catch (error) {
  console.error('Failed to render React app:', error);

  // Fallback UI if React fails to mount
  if (rootElement) {
    rootElement.innerHTML = `
      <div style="
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: #ffffff;
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      ">
        <div style="text-align: center; max-width: 400px; padding: 20px;">
          <h1 style="color: #dc2626; margin-bottom: 16px;">App Failed to Load</h1>
          <p style="color: #6b7280; margin-bottom: 20px;">
            There was an error starting the application. Please try refreshing the page.
          </p>
          <button 
            onclick="window.location.reload()" 
            style="
              background: #3b82f6;
              color: white;
              border: none;
              padding: 10px 20px;
              border-radius: 6px;
              cursor: pointer;
              font-size: 14px;
            "
          >
            Refresh Page
          </button>
          <details style="margin-top: 20px; text-align: left;">
            <summary style="cursor: pointer; color: #6b7280;">Technical Details</summary>
            <pre style="
              background: #f3f4f6;
              padding: 10px;
              border-radius: 4px;
              font-size: 12px;
              overflow: auto;
              margin-top: 10px;
            ">${error}</pre>
          </details>
        </div>
      </div>
    `;
  }
}
