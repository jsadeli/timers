import { useState, useEffect, useRef, useCallback } from 'react';
import { html } from '../utils.js';
import { TimerCore } from '../core/TimerCore.js';
import { AlarmCoordinator } from '../core/AlarmCoordinator.js';
import { StorageProvider } from '../core/StorageProvider.js';
import { ThemeManager } from '../core/ThemeManager.js';
import { AddTimer } from './AddTimer.js';
import { TimerItem } from './TimerItem.js';
import { KeyboardHelp } from './KeyboardHelp.js';
import { PresentationOverlay } from './PresentationOverlay.js';
import { Moon, Sun, Monitor, BellRing, BellOff } from '../icons.js';

/**
 * Root application component.
 * Manages global timer state, drag-and-drop ordering, theme, mute,
 * and all keyboard shortcuts.
 *
 * @returns {import('react').ReactElement}
 */
export function TimerApp() {
  const [timers, setTimers] = useState([]);
  const [theme, setTheme] = useState(ThemeManager.getTheme());
  const tickIntervalRef = useRef(null);
  const [draggedTimerId, setDraggedTimerId] = useState(null);
  const [isMuted, setIsMuted] = useState(() => StorageProvider.getSettings().isMuted || false);
  const [presentingTimerId, setPresentingTimerId] = useState(null);

  /** Ref to the AddTimer component's imperative API */
  const addTimerRef = useRef(null);

  /**
   * Index of the keyboard-focused timer in the list (-1 = none).
   * We use a ref so the keydown handler always sees the latest value
   * without needing to be re-registered on every render.
   */
  const focusedIndexRef = useRef(-1);
  const [focusedTimerId, setFocusedTimerId] = useState(null);

  // ─── Initial Load ─────────────────────────────────────────────────────────

  useEffect(() => {
    AlarmCoordinator.setIsMuted(isMuted);
    const saved = StorageProvider.getTimers();
    const loadedTimers = saved.map(t => TimerCore.fromJSON(t));
    setTimers(loadedTimers);

    startTickLoop();

    // Unlock audio context on first user interaction
    const unlockAudio = () => {
      AlarmCoordinator.initAudio();
      window.removeEventListener('click', unlockAudio);
      window.removeEventListener('touchstart', unlockAudio);
      window.removeEventListener('keydown', unlockAudio);
    };
    window.addEventListener('click', unlockAudio);
    window.addEventListener('touchstart', unlockAudio);
    window.addEventListener('keydown', unlockAudio);

    return () => {
      stopTickLoop();
      window.removeEventListener('click', unlockAudio);
      window.removeEventListener('touchstart', unlockAudio);
      window.removeEventListener('keydown', unlockAudio);
    };
  }, []);

  // ─── Timer State Helpers ───────────────────────────────────────────────────

  const saveTimers = (currentTimers) => {
    setTimers(currentTimers);
    StorageProvider.saveTimers(currentTimers.map(t => t.toJSON()));
  };

  const startTickLoop = () => {
    if (tickIntervalRef.current) return;
    tickIntervalRef.current = setInterval(() => {
      setTimers(prevTimers => {
        let hasChanges = false;
        const nextTimers = prevTimers.map(t => {
          if (t.state === 'RUNNING') {
            const justFinished = t.tick();
            if (justFinished) {
              hasChanges = true;
              AlarmCoordinator.startAlarm(t.id);
            }
          }
          return t;
        });

        if (hasChanges) {
          StorageProvider.saveTimers(nextTimers.map(t => t.toJSON()));
          return [...nextTimers];
        }
        return prevTimers;
      });
    }, 100);
  };

  const stopTickLoop = () => {
    if (tickIntervalRef.current) {
      clearInterval(tickIntervalRef.current);
      tickIntervalRef.current = null;
    }
  };

  // ─── Drag & Drop ──────────────────────────────────────────────────────────

  const handleDragStart = (id) => setDraggedTimerId(id);

  const handleDragEnter = (targetId) => {
    if (!draggedTimerId || draggedTimerId === targetId) return;
    setTimers(prevTimers => {
      const draggedIndex = prevTimers.findIndex(t => t.id === draggedTimerId);
      const targetIndex = prevTimers.findIndex(t => t.id === targetId);
      if (draggedIndex < 0 || targetIndex < 0) return prevTimers;
      const newTimers = [...prevTimers];
      const [draggedItem] = newTimers.splice(draggedIndex, 1);
      newTimers.splice(targetIndex, 0, draggedItem);
      return newTimers;
    });
  };

  const handleDragEnd = () => {
    setDraggedTimerId(null);
    setTimers(prevTimers => {
      StorageProvider.saveTimers(prevTimers.map(t => t.toJSON()));
      return prevTimers;
    });
  };

  // ─── Timer CRUD ───────────────────────────────────────────────────────────

  const handleAddTimer = (newTimer) => {
    setTimers(prev => {
      const next = [newTimer, ...prev];
      StorageProvider.saveTimers(next.map(t => t.toJSON()));
      return next;
    });
  };

  const handleDeleteTimer = useCallback((id) => {
    AlarmCoordinator.stopAlarm(id);
    setTimers(prev => {
      const next = prev.filter(t => t.id !== id);
      // Adjust focused index
      const oldIdx = prev.findIndex(t => t.id === id);
      if (oldIdx !== -1) {
        const newIdx = Math.min(oldIdx, next.length - 1);
        focusedIndexRef.current = newIdx;
        setFocusedTimerId(next[newIdx]?.id ?? null);
      }
      StorageProvider.saveTimers(next.map(t => t.toJSON()));
      return next;
    });
  }, []);

  const handleUpdateTimer = useCallback(() => {
    setTimers(prev => {
      StorageProvider.saveTimers(prev.map(t => t.toJSON()));
      return [...prev];
    });
  }, []);

  const handleDismissTimer = useCallback((id) => {
    AlarmCoordinator.stopAlarm(id);
    setTimers(prevTimers => {
      const nextTimers = prevTimers.map(t => {
        if (t.id === id) t.reset();
        return t;
      });
      StorageProvider.saveTimers(nextTimers.map(t => t.toJSON()));
      return [...nextTimers];
    });
  }, []);

  const handlePresentTimer = useCallback((id) => {
    setPresentingTimerId(id);
  }, []);

  // ─── Theme & Mute ─────────────────────────────────────────────────────────

  const toggleTheme = (newTheme) => {
    ThemeManager.setTheme(newTheme);
    setTheme(newTheme);
  };

  const toggleMute = useCallback(() => {
    setIsMuted(prev => {
      const newMuted = !prev;
      AlarmCoordinator.setIsMuted(newMuted);
      const settings = StorageProvider.getSettings();
      StorageProvider.saveSettings({ ...settings, isMuted: newMuted });
      return newMuted;
    });
  }, []);

  // ─── Keyboard Shortcuts ────────────────────────────────────────────────────

  useEffect(() => {
    const handleKeyDown = (e) => {
      const tag = e.target.tagName;
      const inInput = tag === 'INPUT' || tag === 'TEXTAREA' || e.target.isContentEditable;

      const addPanel = addTimerRef.current;
      const panelOpen = addPanel?.isExpanded?.() ?? false;

      // ── When the add-timer panel is open, route digit / control keys to it ──
      if (panelOpen) {
        // Digits
        if (!e.ctrlKey && !e.metaKey && !e.altKey && /^[0-9]$/.test(e.key)) {
          e.preventDefault();
          addPanel.appendDigit(e.key);
          return;
        }
        if (e.key === 'Backspace' && !inInput) {
          e.preventDefault();
          addPanel.backspace();
          return;
        }
        if ((e.key === 'c' || e.key === 'C') && !e.ctrlKey && !e.metaKey && !inInput) {
          e.preventDefault();
          addPanel.clear();
          return;
        }
        if (e.key === 'Enter' && !inInput) {
          e.preventDefault();
          addPanel.submit();
          return;
        }
        if (e.key === 'Escape') {
          e.preventDefault();
          addPanel.close();
          return;
        }
        // Let other keys fall through
        if (!inInput) return;
      }

      // ── Global shortcuts (panel closed, not inside an input) ──
      if (inInput) return;

      const key = e.key;
      const ctrl = e.ctrlKey || e.metaKey;

      switch (key) {
        // Open new timer panel
        case 'n':
        case 'N': {
          e.preventDefault();
          addPanel?.open?.();
          break;
        }

        // Toggle mute
        case 'm':
        case 'M': {
          e.preventDefault();
          toggleMute();
          break;
        }

        // Play / pause the FOCUSED timer (space)
        case ' ': {
          e.preventDefault();
          setTimers(prev => {
            const idx = focusedIndexRef.current;
            if (idx < 0 || idx >= prev.length) return prev;
            const t = prev[idx];
            if (t.state === 'RUNNING') t.pause();
            else if (t.state === 'PAUSED' || (t.state === 'IDLE' && t.totalDurationMs > 0)) t.start();
            StorageProvider.saveTimers(prev.map(t => t.toJSON()));
            return [...prev];
          });
          break;
        }

        // F — present the focused timer
        case 'f':
        case 'F': {
          e.preventDefault();
          setTimers(prev => {
            const idx = focusedIndexRef.current;
            if (idx >= 0 && idx < prev.length) {
              setPresentingTimerId(prev[idx].id);
            }
            return prev;
          });
          break;
        }



        // Stop / cancel ALL running timers
        case 's':
        case 'S': {
          e.preventDefault();
          setTimers(prev => {
            prev.forEach(t => {
              if (t.state === 'RUNNING' || t.state === 'PAUSED') {
                AlarmCoordinator.stopAlarm(t.id);
                t.reset();
              }
            });
            StorageProvider.saveTimers(prev.map(t => t.toJSON()));
            return [...prev];
          });
          break;
        }

        // Escape — dismiss all finished timers
        case 'Escape': {
          setTimers(prev => {
            const hasFinished = prev.some(t => t.state === 'FINISHED');
            if (!hasFinished) return prev;
            prev.forEach(t => {
              if (t.state === 'FINISHED') {
                AlarmCoordinator.stopAlarm(t.id);
                t.reset();
              }
            });
            StorageProvider.saveTimers(prev.map(t => t.toJSON()));
            return [...prev];
          });
          break;
        }

        // Arrow keys — navigate focused timer
        case 'ArrowUp':
        case 'ArrowLeft':
        case 'ArrowDown':
        case 'ArrowRight': {
          e.preventDefault();
          setTimers(prev => {
            if (prev.length === 0) return prev;
            const delta = (key === 'ArrowDown' || key === 'ArrowRight') ? 1 : -1;
            const current = focusedIndexRef.current;
            const next = current < 0
              ? (delta > 0 ? 0 : prev.length - 1)
              : Math.max(0, Math.min(prev.length - 1, current + delta));
            focusedIndexRef.current = next;
            setFocusedTimerId(prev[next]?.id ?? null);
            return prev;
          });
          break;
        }

        // P — play/pause the focused timer
        case 'p':
        case 'P': {
          e.preventDefault();
          setTimers(prev => {
            const idx = focusedIndexRef.current;
            if (idx < 0 || idx >= prev.length) return prev;
            const t = prev[idx];
            if (t.state === 'RUNNING') t.pause();
            else if (t.state === 'PAUSED' || (t.state === 'IDLE' && t.totalDurationMs > 0)) t.start();
            StorageProvider.saveTimers(prev.map(t => t.toJSON()));
            return [...prev];
          });
          break;
        }

        // Delete — delete the focused timer
        case 'Delete': {
          e.preventDefault();
          setTimers(prev => {
            const idx = focusedIndexRef.current;
            if (idx < 0 || idx >= prev.length) return prev;
            const id = prev[idx].id;
            AlarmCoordinator.stopAlarm(id);
            const next = prev.filter(t => t.id !== id);
            const newIdx = Math.min(idx, next.length - 1);
            focusedIndexRef.current = next.length > 0 ? newIdx : -1;
            setFocusedTimerId(next[newIdx]?.id ?? null);
            StorageProvider.saveTimers(next.map(t => t.toJSON()));
            return next;
          });
          break;
        }

        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
    // toggleMute is stable (useCallback), handleDeleteTimer etc. not used here
  }, [toggleMute]);

  // Clear focus when clicking outside a timer card
  const handleAppClick = (e) => {
    if (!e.target.closest('.timer-item')) {
      focusedIndexRef.current = -1;
      setFocusedTimerId(null);
    }
  };

  // ─── Render ───────────────────────────────────────────────────────────────

  return html`
    <div className="app-container" onClick=${handleAppClick}>
      <header>
        <h1>Timers</h1>

        <div style=${{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <div className="theme-toggle">
            <button
              className="theme-btn"
              onClick=${toggleMute}
              title=${isMuted ? 'Unmute Alarms (M)' : 'Mute Alarms (M)'}
            >
              ${isMuted ? html`<${BellOff} size=${16} />` : html`<${BellRing} size=${16} />`}
            </button>
          </div>

          <div className="theme-toggle">
            <button
              className=${`theme-btn ${theme === 'light' ? 'active' : ''}`}
              onClick=${() => toggleTheme('light')}
              title="Light Mode"
            ><${Sun} size=${16}/></button>

            <button
              className=${`theme-btn ${theme === 'auto' ? 'active' : ''}`}
              onClick=${() => toggleTheme('auto')}
              title="System Auto"
            ><${Monitor} size=${16}/></button>

            <button
              className=${`theme-btn ${theme === 'dark' ? 'active' : ''}`}
              onClick=${() => toggleTheme('dark')}
              title="Dark Mode"
            ><${Moon} size=${16}/></button>
          </div>

          <${KeyboardHelp} />
        </div>
      </header>

      <${AddTimer} ref=${addTimerRef} onAdd=${handleAddTimer} />

      ${timers.length > 0 ? html`
        <div className="timer-list">
          ${timers.map((timer, idx) => html`
            <${TimerItem}
              key=${timer.id}
              timerCore=${timer}
              onUpdate=${handleUpdateTimer}
              onDelete=${() => handleDeleteTimer(timer.id)}
              onDismiss=${handleDismissTimer}
              onPresent=${handlePresentTimer}
              isDragged=${draggedTimerId === timer.id}
              isFocused=${focusedTimerId === timer.id}
              onFocus=${() => {
                focusedIndexRef.current = idx;
                setFocusedTimerId(timer.id);
              }}
              onDragStart=${() => handleDragStart(timer.id)}
              onDragEnter=${() => handleDragEnter(timer.id)}
              onDragEnd=${handleDragEnd}
            />
          `)}
        </div>
      ` : html`
        <div className="empty-state">
          <${BellRing} size=${48} />
          <h2>No Active Timers</h2>
          <p>Press <kbd class="kbd-key-inline">N</kbd> or tap the button above to start a new timer.</p>
        </div>
      `}
    </div>

    ${presentingTimerId ? (() => {
      const presentingTimer = timers.find(t => t.id === presentingTimerId);
      return presentingTimer ? html`
        <${PresentationOverlay}
          timerCore=${presentingTimer}
          onUpdate=${handleUpdateTimer}
          onDismiss=${(id) => { handleDismissTimer(id); setPresentingTimerId(null); }}
          onClose=${() => setPresentingTimerId(null)}
        />
      ` : null;
    })() : null}
  `;
}
