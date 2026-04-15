import React from 'react';
import { createRoot } from 'react-dom/client';
import { html, printDeveloperCredit } from './scripts/utils.js';
import { ThemeManager } from './scripts/core/ThemeManager.js';
import { FontManager } from './scripts/core/FontManager.js';
import { TimerApp } from './scripts/components/TimerApp.js';

// Initialize Theme & Font
ThemeManager.init();
FontManager.init();

// Developer Easter Egg
printDeveloperCredit();

// Render Root
const rootElement = document.getElementById('root');
if (rootElement) {
  const root = createRoot(rootElement);
  root.render(html`<${TimerApp} />`);
}

// Register Service Worker for PWA offline capabilities
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .then(registration => {
        console.log('ServiceWorker registration successful with scope: ', registration.scope);
      })
      .catch(err => {
        console.warn('ServiceWorker registration failed: ', err);
      });
  });
}
