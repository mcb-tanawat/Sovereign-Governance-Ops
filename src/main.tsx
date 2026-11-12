import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Guard against third-party browser extension errors (e.g. MetaMask iframe connection blocks)
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason?.message || String(event.reason || '');
    if (
      reason.includes('Failed to connect to MetaMask') ||
      reason.includes('chrome-extension') ||
      reason.includes('inpage.js') ||
      reason.includes('MetaMask')
    ) {
      event.preventDefault();
      console.warn('[Extension Guard] Handled MetaMask iframe connection rejection:', reason);
    }
  });

  window.addEventListener('error', (event) => {
    const msg = event.message || '';
    const filename = event.filename || '';
    if (
      msg.includes('Failed to connect to MetaMask') ||
      filename.includes('chrome-extension') ||
      filename.includes('inpage.js')
    ) {
      event.preventDefault();
      console.warn('[Extension Guard] Handled MetaMask extension error:', msg);
    }
  });
}

createRoot(document.getElementById('root')!).render(<App />);
