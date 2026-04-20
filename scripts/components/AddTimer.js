import { useState, useEffect, useImperativeHandle, forwardRef } from "react";
import { html, generateId } from "../utils.js";
import { TimerCore } from "../core/TimerCore.js";
import { Play, Plus, X } from "../icons.js";

/**
 * AddTimer component — supports both click and keyboard entry.
 * Exposes an imperative handle with `open()`, `close()`, `isExpanded()`,
 * `appendDigit(d)`, `backspace()`, `clear()`, and `submit()`.
 *
 * @param {{ onAdd: (timer: TimerCore) => void }} props
 * @param {import('react').Ref<*>} ref
 * @returns {import('react').ReactElement}
 */
export const AddTimer = forwardRef(function AddTimer({ onAdd }, ref) {
  const [input, setInput] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);

  /** Parse the digit-string into total milliseconds. */
  const parseMs = (val) => {
    if (!val) return 0;
    const padded = val.padStart(6, "0");
    const h = parseInt(padded.slice(0, 2), 10);
    const m = parseInt(padded.slice(2, 4), 10);
    const s = parseInt(padded.slice(4, 6), 10);
    return (h * 3600 + m * 60 + s) * 1000;
  };

  /** Build a human-readable label from the digit-string. */
  const formatTimerLabel = (val) => {
    if (!val) return "Timer";
    const padded = val.padStart(6, "0");
    const h = parseInt(padded.slice(0, 2), 10);
    const m = parseInt(padded.slice(2, 4), 10);
    const s = parseInt(padded.slice(4, 6), 10);
    const parts = [];
    if (h > 0) parts.push(`${h} hr${h > 1 ? "s" : ""}`);
    if (m > 0) parts.push(`${m} min${m > 1 ? "s" : ""}`);
    if (s > 0) parts.push(`${s} sec${s > 1 ? "s" : ""}`);
    return parts.length > 0 ? parts.join(" ") : "Timer";
  };

  const handleDigit = (d) => {
    if (input === "0" && d === "0") return;
    if (input.length < 6) setInput((prev) => prev + d);
  };

  const handleClear = () => setInput("");
  const handleBackspace = () => setInput((prev) => prev.slice(0, -1));

  const handleStart = () => {
    const ms = parseMs(input);
    if (ms > 0) {
      const newTimer = new TimerCore({
        id: generateId(),
        label: formatTimerLabel(input),
        totalDurationMs: ms,
      });
      newTimer.start();
      onAdd(newTimer);
      setInput("");
      setIsExpanded(false);
    }
  };

  // Expose imperative API so TimerApp can drive the panel from keyboard events
  useImperativeHandle(ref, () => ({
    open() {
      setIsExpanded(true);
    },
    close() {
      setIsExpanded(false);
      setInput("");
    },
    isExpanded() {
      return isExpanded;
    },
    appendDigit(d) {
      if (!isExpanded) return;
      handleDigit(d);
    },
    backspace() {
      if (!isExpanded) return;
      handleBackspace();
    },
    clear() {
      if (!isExpanded) return;
      handleClear();
    },
    submit() {
      if (!isExpanded) return;
      handleStart();
    },
  }));

  const formattedDisplay = () => {
    const padded = input.padStart(6, "0");
    return html`
      ${padded.slice(0, 2)}<span className="time-unit">h</span>
      ${padded.slice(2, 4)}<span className="time-unit">m</span>
      ${padded.slice(4, 6)}<span className="time-unit">s</span>
    `;
  };

  if (!isExpanded) {
    return html`
      <div className="add-timer-section" style=${{ marginBottom: "2rem" }}>
        <button
          className="btn-primary"
          style=${{
            padding: "1rem 2rem",
            fontSize: "1.25rem",
            borderRadius: "9999px",
            boxShadow: "var(--card-shadow)",
          }}
          onClick=${() => setIsExpanded(true)}
          title="New Timer (N)"
        >
          <${Plus} size=${24} />
          <span>New Timer</span>
        </button>
      </div>
    `;
  }

  return html`
    <div className="add-timer-section">
      <div className="glass-card add-timer-card" style=${{ position: "relative" }}>
        <button
          className="btn-icon"
          style=${{ position: "absolute", top: "1rem", right: "1rem" }}
          onClick=${() => {
            setIsExpanded(false);
            setInput("");
          }}
          aria-label="Close"
          title="Cancel (Esc)"
        >
          <${X} size=${20} />
        </button>

        <div className="keypad-display-wrapper" style=${{ marginTop: "1.5rem" }}>
          <div className="keypad-display">${formattedDisplay()}</div>
        </div>

        <div className="keypad-grid">
          ${[1, 2, 3, 4, 5, 6, 7, 8, 9].map(
            (d) => html`
              <button key=${d} className="keypad-btn" onClick=${() => handleDigit(d.toString())}>
                ${d}
              </button>
            `,
          )}
          <button className="keypad-btn action" onClick=${handleClear} title="Clear (C)">C</button>
          <button className="keypad-btn" onClick=${() => handleDigit("0")}>0</button>
          <button className="keypad-btn action" onClick=${handleBackspace} title="Backspace (⌫)">
            ⌫
          </button>
        </div>

        <button
          className="btn-primary"
          style=${{
            width: "100%",
            justifyContent: "center",
            opacity: input.length === 0 || parseMs(input) === 0 ? 0.5 : 1,
          }}
          onClick=${handleStart}
          disabled=${input.length === 0 || parseMs(input) === 0}
          title="Start Timer (Enter)"
        >
          <${Play} size=${20} />
          <span>Start Timer</span>
        </button>
      </div>
    </div>
  `;
});
