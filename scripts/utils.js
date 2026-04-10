import React from 'react';
import htm from 'htm';

// Create a bound html tag for JSX-like syntax without build steps
export const html = htm.bind(React.createElement);

// Utility for formatting time (ms) to HH:MM:SS
export function formatTime(ms) {
  if (ms <= 0) return '00:00:00';
  const totalSeconds = Math.ceil(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const h = hours.toString().padStart(2, '0');
  const m = minutes.toString().padStart(2, '0');
  const s = seconds.toString().padStart(2, '0');

  return `${h}:${m}:${s}`;
}

// Generate a random UUID
export function generateId() {
  return crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15);
}
