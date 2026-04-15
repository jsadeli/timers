import { useState, useEffect } from 'react';
import { html, formatTime } from '../utils.js';
import { Play, Pause, RotateCcw, X, Square } from '../icons.js';
import { AlarmCoordinator } from '../core/AlarmCoordinator.js';

/**
 * Full-screen presentation overlay for a single timer.
 * Shows a large time display suitable for presentations.
 * Includes a pleasant visual alert when the timer reaches 0.
 *
 * @param {{ timerCore: import('../core/TimerCore.js').TimerCore, onUpdate: () => void, onDismiss: (id: string) => void, onClose: () => void }} props
 * @returns {import('react').ReactElement}
 */
export function PresentationOverlay({ timerCore, onUpdate, onDismiss, onClose }) {
  // Drive smooth re-renders via RAF
  const [, setNow] = useState(Date.now());

  useEffect(() => {
    let animationFrameId;
    const tick = () => {
      setNow(Date.now());
      animationFrameId = requestAnimationFrame(tick);
    };
    animationFrameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  // Close on Escape
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') {
        e.stopImmediatePropagation();
        onClose();
      }
    };
    window.addEventListener('keydown', handler, true); // capture phase, runs before TimerApp handler
    return () => window.removeEventListener('keydown', handler, true);
  }, [onClose]);

  const remainingMs = timerCore.getRemainingTimeMs();
  const progressPercent = Math.min(100, Math.max(0, 100 - (remainingMs / timerCore.totalDurationMs) * 100));
  const isFinished = timerCore.state === 'FINISHED';

  const handlePauseResume = (e) => {
    e.stopPropagation();
    if (timerCore.state === 'RUNNING') {
      timerCore.pause();
    } else if (timerCore.state === 'PAUSED' || timerCore.state === 'IDLE') {
      timerCore.start();
    }
    onUpdate();
  };

  const handleCancel = (e) => {
    e.stopPropagation();
    AlarmCoordinator.stopAlarm(timerCore.id);
    timerCore.reset();
    onUpdate();
  };

  const handleRestart = (e) => {
    e.stopPropagation();
    AlarmCoordinator.stopAlarm(timerCore.id);
    timerCore.reset();
    timerCore.start();
    onUpdate();
  };

  const handleDismiss = (e) => {
    e.stopPropagation();
    onDismiss(timerCore.id);
  };

  return html`
    <div
      className=${`presentation-overlay state-${timerCore.state}`}
      onClick=${(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <button className="presentation-close" onClick=${onClose} title="Exit Presentation (Esc)">
        <${X} size=${22} />
      </button>

      ${isFinished ? html`
        <div className="presentation-ripple"></div>
        <div className="presentation-ripple presentation-ripple--2"></div>
        <div className="presentation-ripple presentation-ripple--3"></div>
      ` : null}

      <div className="presentation-content">
        <h2 className="presentation-title">${timerCore.label}</h2>

        <div className=${`presentation-time${isFinished ? ' presentation-time--finished' : ''}`}>
          ${formatTime(remainingMs)}
        </div>

        <div className="presentation-progress-container">
          <div
            className="presentation-progress-bar"
            style=${{ width: `${progressPercent}%` }}
          ></div>
        </div>

        <div className="presentation-controls">
          ${isFinished ? html`
            <button className="presentation-btn" onClick=${handleRestart} title="Restart">
              <${RotateCcw} size=${28} />
            </button>
            <button className="presentation-btn presentation-btn--dismiss" onClick=${handleDismiss} title="Dismiss">
              <${X} size=${28} />
              <span>Dismiss</span>
            </button>
          ` : html`
            <button
              className="presentation-btn"
              onClick=${handlePauseResume}
              title=${timerCore.state === 'RUNNING' ? 'Pause' : 'Resume'}
            >
              ${timerCore.state === 'RUNNING'
                ? html`<${Pause} size=${28} />`
                : html`<${Play} size=${28} />`
              }
            </button>
            <button className="presentation-btn" onClick=${handleCancel} title="Cancel">
              <${Square} size=${24} />
            </button>
          `}
        </div>
      </div>
    </div>
  `;
}
