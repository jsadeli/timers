import { useState } from 'react';
import { html, generateId } from '../utils.js';
import { TimerCore } from '../core/TimerCore.js';
import { Play } from '../icons.js';

export function AddTimer({ onAdd }) {
  const [input, setInput] = useState('');
  
  const handleDigit = (d) => {
    if (input === '0' && d === '0') return;
    if (input.length < 6) {
      setInput(input + d);
    }
  };
  
  const handleClear = () => {
    setInput('');
  };
  
  const handleBackspace = () => {
    setInput(input.slice(0, -1));
  };
  
  const parseMs = (val) => {
    if (!val) return 0;
    const padded = val.padStart(6, '0');
    const h = parseInt(padded.slice(0, 2), 10);
    const m = parseInt(padded.slice(2, 4), 10);
    const s = parseInt(padded.slice(4, 6), 10);
    return (h * 3600 + m * 60 + s) * 1000;
  };
  
  const handleStart = () => {
    const ms = parseMs(input);
    if (ms > 0) {
      const newTimer = new TimerCore({
        id: generateId(),
        label: 'Timer',
        totalDurationMs: ms
      });
      newTimer.start();
      onAdd(newTimer);
      setInput('');
    }
  };

  const formattedDisplay = () => {
    const padded = input.padStart(6, '0');
    return html`
      ${padded.slice(0, 2)}<span className="time-unit">h</span>
      ${padded.slice(2, 4)}<span className="time-unit">m</span>
      ${padded.slice(4, 6)}<span className="time-unit">s</span>
    `;
  };

  return html`
    <div className="add-timer-section">
      <div className="glass-card add-timer-card">
        <div className="keypad-display-wrapper">
          <div className="keypad-display">
            ${formattedDisplay()}
          </div>
        </div>
        
        <div className="keypad-grid">
          ${[1, 2, 3, 4, 5, 6, 7, 8, 9].map(d => html`
            <button key=${d} className="keypad-btn" onClick=${() => handleDigit(d.toString())}>${d}</button>
          `)}
          <button className="keypad-btn action" onClick=${handleClear}>C</button>
          <button className="keypad-btn" onClick=${() => handleDigit('0')}>0</button>
          <button className="keypad-btn action" onClick=${handleBackspace}>⌫</button>
        </div>
        
        <button 
          className="btn-primary" 
          style=${{ width: '100%', justifyContent: 'center', opacity: (input.length === 0 || parseMs(input) === 0) ? 0.5 : 1 }}
          onClick=${handleStart}
          disabled=${input.length === 0 || parseMs(input) === 0}
        >
          <${Play} size=${20} />
          <span>Start Timer</span>
        </button>
      </div>
    </div>
  `;
}
