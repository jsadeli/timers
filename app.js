import React from 'react';
import { createRoot } from 'react-dom/client';
import { html } from './scripts/utils.js';
import { ThemeManager } from './scripts/core/ThemeManager.js';
import { TimerApp } from './scripts/components/TimerApp.js';

// Initialize Theme
ThemeManager.init();

// Render Root
const rootElement = document.getElementById('root');
if (rootElement) {
  const root = createRoot(rootElement);
  root.render(html`<${TimerApp} />`);
}
