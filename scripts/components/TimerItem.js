import { useState, useEffect } from "react";
import { html, formatTime, formatTimeFull } from "../utils.js";
import { Play, Pause, Trash2, RotateCcw, X, GripVertical, Square, Maximize2 } from "../icons.js";
import { AlarmCoordinator } from "../core/AlarmCoordinator.js";

export function TimerItem({
  timerCore,
  onUpdate,
  onDelete,
  onDismiss,
  onPresent,
  isDragged,
  isFocused,
  onFocus,
  onDragStart,
  onDragEnter,
  onDragEnd,
}) {
  const [now, setNow] = useState(Date.now());
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState(timerCore.label);

  const [isEditingDuration, setIsEditingDuration] = useState(false);
  const [durationInput, setDurationInput] = useState(formatTimeFull(timerCore.totalDurationMs));

  useEffect(() => {
    let animationFrameId;

    // Smooth update of time
    const tick = () => {
      setNow(Date.now());
      animationFrameId = requestAnimationFrame(tick);
    };

    if (timerCore.state === "RUNNING") {
      animationFrameId = requestAnimationFrame(tick);
    }

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [timerCore.state]);

  const handlePauseResume = () => {
    if (timerCore.state === "RUNNING") {
      timerCore.pause();
    } else if (timerCore.state === "PAUSED" || timerCore.state === "IDLE") {
      timerCore.start();
    }
    onUpdate();
  };

  const handleRestart = () => {
    AlarmCoordinator.stopAlarm(timerCore.id);
    timerCore.reset();
    timerCore.start();
    onUpdate();
  };

  const remainingMs = timerCore.getRemainingTimeMs();
  const progressPercent = Math.min(
    100,
    Math.max(0, 100 - (remainingMs / timerCore.totalDurationMs) * 100),
  );

  const saveTitle = () => {
    const newTitle = titleInput.trim() || "Timer";
    timerCore.label = newTitle;
    setTitleInput(newTitle);
    setIsEditingTitle(false);
    onUpdate();
  };

  const startDurationEdit = () => {
    // Only allow editing when paused or idle to easily input
    setDurationInput(formatTimeFull(timerCore.totalDurationMs));
    setIsEditingDuration(true);
  };

  const saveDuration = () => {
    const parts = durationInput.split(":").map((n) => parseInt(n, 10) || 0);
    if (parts.length === 3) {
      const ms = (parts[0] * 3600 + parts[1] * 60 + parts[2]) * 1000;
      if (ms > 0) {
        timerCore.totalDurationMs = ms;
        // if running, we recalculate targetEndTime
        if (timerCore.state === "RUNNING") {
          const elapsed = timerCore.totalDurationMs - timerCore.getRemainingTimeMs();
          timerCore.targetEndTime = Date.now() + Math.max(0, ms - elapsed);
        } else if (timerCore.state === "PAUSED") {
          // Keep the same ratio or just update remaining time proportionally? or simple:
          timerCore.remainingTimeOnPause = ms;
        }
      }
    }
    setIsEditingDuration(false);
    onUpdate();
  };

  return html`
    <div
      className=${`glass-card timer-item state-${timerCore.state} ${isDragged ? "dragging" : ""} ${isFocused ? "kbd-focused" : ""}`}
      draggable="true"
      onClick=${onFocus}
      tabindex="0"
      onDragStart=${(e) => {
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("text/plain", timerCore.id);
        setTimeout(() => onDragStart(), 0);
      }}
      onDragEnter=${(e) => {
        e.preventDefault();
        onDragEnter();
      }}
      onDragOver=${(e) => e.preventDefault()}
      onDragEnd=${onDragEnd}
    >
      <div className="timer-header">
        <div className="drag-handle" title="Drag to reorder">
          <${GripVertical} size=${20} />
        </div>
        ${isEditingTitle
          ? html`
              <input
                className="timer-title-input"
                value=${titleInput}
                onChange=${(e) => setTitleInput(e.target.value)}
                onBlur=${saveTitle}
                onKeyDown=${(e) => e.key === "Enter" && saveTitle()}
                autofocus
              />
            `
          : html`
              <h3
                className="timer-title"
                onClick=${() => setIsEditingTitle(true)}
                title="Click to edit name"
                style=${{ cursor: "text" }}
              >
                ${timerCore.label}
              </h3>
            `}
        <button
          className="btn-icon"
          onClick=${(e) => {
            e.stopPropagation();
            onPresent(timerCore.id);
          }}
          aria-label="Presentation Mode"
          title="Presentation Mode"
        >
          <${Maximize2} size=${16} />
        </button>
        <button
          className="btn-icon danger"
          onClick=${onDelete}
          aria-label="Delete Timer"
          title="Delete"
        >
          <${Trash2} size=${18} />
        </button>
      </div>

      <div
        className="timer-display"
        onClick=${() => !isEditingDuration && startDurationEdit()}
        title="Click to edit duration"
        style=${{ cursor: "text" }}
      >
        ${isEditingDuration
          ? html`
              <input
                className="timer-title-input"
                style=${{
                  fontFamily: "var(--font-mono)",
                  fontSize: "3rem",
                  textAlign: "center",
                  width: "100%",
                }}
                value=${durationInput}
                onChange=${(e) => setDurationInput(e.target.value)}
                onBlur=${saveDuration}
                onKeyDown=${(e) => e.key === "Enter" && saveDuration()}
                autofocus
              />
            `
          : formatTime(remainingMs)}
      </div>

      <div className="timer-progress-container">
        <div className="timer-progress-bar" style=${{ width: `${progressPercent}%` }}></div>
      </div>

      <div className="timer-controls">
        ${timerCore.state === "RUNNING" || timerCore.state === "PAUSED"
          ? html`
              <button
                className="btn-icon-large"
                onClick=${handlePauseResume}
                title=${timerCore.state === "RUNNING" ? "Pause" : "Resume"}
              >
                ${timerCore.state === "RUNNING"
                  ? html`<${Pause} size=${24} />`
                  : html`<${Play} size=${24} />`}
              </button>
              <button
                className="btn-icon-large"
                onClick=${() => {
                  AlarmCoordinator.stopAlarm(timerCore.id);
                  timerCore.reset();
                  onUpdate();
                }}
                title="Cancel"
              >
                <${Square} size=${22} />
              </button>
            `
          : timerCore.state === "FINISHED"
            ? html`
                <button className="btn-icon-large" onClick=${handleRestart} title="Restart">
                  <${RotateCcw} size=${24} />
                </button>
                <button
                  className="btn-icon-large"
                  onClick=${() => onDismiss(timerCore.id)}
                  title="Dismiss"
                >
                  <${X} size=${24} />
                </button>
              `
            : html`
                <button className="btn-icon-large" onClick=${handlePauseResume} title="Start">
                  <${Play} size=${24} />
                </button>
              `}
      </div>
    </div>
  `;
}
