import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Polyfill for localStorage in restricted environments (like Apps Script iframes)
try {
  window.localStorage.setItem('__test', '1');
  window.localStorage.removeItem('__test');
} catch (e) {
  try {
    const memoryStorage = new Map<string, string>();
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: (key: string) => memoryStorage.get(key) || null,
        setItem: (key: string, value: string) => memoryStorage.set(key, String(value)),
        removeItem: (key: string) => memoryStorage.delete(key),
        clear: () => memoryStorage.clear(),
        get length() { return memoryStorage.size; },
        key: (index: number) => Array.from(memoryStorage.keys())[index] || null
      },
      writable: true,
      configurable: true,
    });
  } catch (innerError) {
    console.warn('Could not polyfill window.localStorage directly:', innerError);
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
