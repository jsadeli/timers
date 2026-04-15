import { useState, useEffect, Fragment } from 'react';
import { html } from '../utils.js';

/**
 * A small floating "?" button that shows a keyboard shortcuts overlay when clicked.
 * @returns {import('react').ReactElement}
 */
export function KeyboardHelp() {
  const [isOpen, setIsOpen] = useState(false);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen]);

  /** @type {Array<{keys: string[], desc: string}>} */
  const shortcuts = [
    { keys: ['N'], desc: 'Open new timer panel' },
    { keys: ['Esc'], desc: 'Close panel / dismiss finished timers' },
    { keys: ['0–9'], desc: 'Type duration digits' },
    { keys: ['⌫'], desc: 'Delete last digit' },
    { keys: ['C'], desc: 'Clear all digits' },
    { keys: ['Enter'], desc: 'Start timer' },
    { keys: ['Space'], desc: 'Play / pause focused timer' },
    { keys: ['S'], desc: 'Stop all running timers' },
    { keys: ['M'], desc: 'Toggle mute' },
    { keys: ['←', '↑', '↓', '→'], desc: 'Navigate between timers' },
    { keys: ['P'], desc: 'Play / pause focused timer' },
    { keys: ['F'], desc: 'Presentation mode for focused timer' },
    { keys: ['Del'], desc: 'Delete focused timer' },
    { keys: ['?'], desc: 'Show this help' },
  ];

  return html`
    <${Fragment}>
      <button
        className="kbd-help-btn"
        onClick=${() => setIsOpen(v => !v)}
        title="Keyboard shortcuts (?)"
        aria-label="Keyboard shortcuts"
      >?</button>

      ${isOpen && html`
        <div className="kbd-overlay-backdrop" onClick=${() => setIsOpen(false)}>
          <div className="kbd-overlay-panel" onClick=${e => e.stopPropagation()}>
            <div className="kbd-overlay-header">
              <h2>Keyboard Shortcuts</h2>
              <button className="btn-icon" onClick=${() => setIsOpen(false)} aria-label="Close">✕</button>
            </div>
            <ul className="kbd-shortcut-list">
              ${shortcuts.map(({ keys, desc }, i) => html`
                <li key=${i} className="kbd-shortcut-row">
                  <span className="kbd-keys">
                    ${keys.map((k, ki) => html`
                      <kbd key=${ki} className="kbd-key">${k}</kbd>
                    `)}
                  </span>
                  <span className="kbd-desc">${desc}</span>
                </li>
              `)}
            </ul>
          </div>
        </div>
      `}
    </${Fragment}>
  `;
}
