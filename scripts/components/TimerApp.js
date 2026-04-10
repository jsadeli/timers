import { useState, useEffect, useRef } from 'react';
import { html } from '../utils.js';
import { TimerCore } from '../core/TimerCore.js';
import { AlarmCoordinator } from '../core/AlarmCoordinator.js';
import { StorageProvider } from '../core/StorageProvider.js';
import { ThemeManager } from '../core/ThemeManager.js';
import { AddTimer } from './AddTimer.js';
import { TimerItem } from './TimerItem.js';
import { Moon, Sun, Monitor, BellRing } from '../icons.js';

export function TimerApp() {
  const [timers, setTimers] = useState([]);
  const [theme, setTheme] = useState(ThemeManager.getTheme());
  const tickIntervalRef = useRef(null);
  const [draggedTimerId, setDraggedTimerId] = useState(null);

  // Initial load
  useEffect(() => {
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

  const handleDragStart = (id) => {
    setDraggedTimerId(id);
  };

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

  const handleAddTimer = (newTimer) => {
    saveTimers([newTimer, ...timers]);
  };

  const handleDeleteTimer = (id) => {
    AlarmCoordinator.stopAlarm(id);
    saveTimers(timers.filter(t => t.id !== id));
  };

  const handleUpdateTimer = () => {
    saveTimers([...timers]);
  };

  const handleDismissTimer = (id) => {
    AlarmCoordinator.stopAlarm(id);
    setTimers(prevTimers => {
      const nextTimers = prevTimers.map(t => {
        if (t.id === id) {
          t.reset();
        }
        return t;
      });
      StorageProvider.saveTimers(nextTimers.map(t => t.toJSON()));
      return [...nextTimers];
    });
  };

  const toggleTheme = (newTheme) => {
    ThemeManager.setTheme(newTheme);
    setTheme(newTheme);
  };
  
  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      
      if (e.code === 'Space') {
        e.preventDefault();
        let changed = false;
        const runningTimers = timers.filter(t => t.state === 'RUNNING');
        if (runningTimers.length > 0) {
          runningTimers.forEach(t => t.pause());
          changed = true;
        } else {
          timers.forEach(t => {
            if (t.state === 'PAUSED' || (t.state === 'IDLE' && t.totalDurationMs > 0)) {
               t.start();
               changed = true;
            }
          });
        }
        if (changed) handleUpdateTimer();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [timers]);

  return html`
    <div className="app-container">
      <header>
        <h1>Timers</h1>
        
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
      </header>
      
      <${AddTimer} onAdd=${handleAddTimer} />
      
      ${timers.length > 0 ? html`
        <div className="timer-list">
          ${timers.map(timer => html`
            <${TimerItem}
              key=${timer.id}
              timerCore=${timer}
              onUpdate=${handleUpdateTimer}
              onDelete=${() => handleDeleteTimer(timer.id)}
              onDismiss=${handleDismissTimer}
              isDragged=${draggedTimerId === timer.id}
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
          <p>Set a duration above and start a new timer.</p>
        </div>
      `}
    </div>
  `;
}
