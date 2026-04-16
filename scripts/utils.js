import React from "react";
import htm from "htm";

// Create a bound html tag for JSX-like syntax without build steps
export const html = htm.bind(React.createElement);

// Utility for formatting time (ms) to hh:mm:ss — always full format (used for edit inputs)
export function formatTimeFull(ms) {
  if (ms <= 0) return "00:00:00";
  const totalSeconds = Math.ceil(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const h = hours.toString().padStart(2, "0");
  const m = minutes.toString().padStart(2, "0");
  const s = seconds.toString().padStart(2, "0");

  return `${h}:${m}:${s}`;
}

// Utility for formatting time (ms) to the most significant non-zero unit
// hh:mm:ss when hours > 0, mm:ss when minutes > 0, ss otherwise
export function formatTime(ms) {
  if (ms <= 0) return "0";
  const totalSeconds = Math.ceil(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const m = minutes.toString().padStart(2, "0");
  const s = seconds.toString().padStart(2, "0");

  if (hours > 0) {
    const h = hours.toString().padStart(2, "0");
    return `${h}:${m}:${s}`;
  }
  if (minutes > 0) {
    return `${m}:${s}`;
  }
  return seconds.toString();
}

// Generate a random UUID
export function generateId() {
  return crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15);
}

export function printDeveloperCredit() {
  const art = [
    "  ████████╗██╗███╗   ███╗███████╗██████╗ ███████╗",
    "  ╚══██╔══╝██║████╗ ████║██╔════╝██╔══██╗██╔════╝",
    "     ██║   ██║██╔████╔██║█████╗  ██████╔╝███████╗",
    "     ██║   ██║██║╚██╔╝██║██╔══╝  ██╔══██╗╚════██║",
    "     ██║   ██║██║ ╚═╝ ██║███████╗██║  ██║███████║",
    "     ╚═╝   ╚═╝╚═╝     ╚═╝╚══════╝╚═╝  ╚═╝╚══════╝",
  ].join("\n");
  console.log("%c" + art, "color: #3b82f6; font-family: monospace; font-weight: bold;");
  console.log(
    "%c Looking under the hood? %c This high-performance timer was crafted by Jeffrey Sadeli with the assistance of Gemini 3.1 Pro. ",
    "color: #fff; background: #171717; padding: 6px; border-radius: 4px 0 0 4px; font-weight: bold; font-family: system-ui, sans-serif;",
    "color: #171717; background: #3b82f6; padding: 6px; border-radius: 0 4px 4px 0; font-weight: bold; font-family: system-ui, sans-serif;",
  );
}
