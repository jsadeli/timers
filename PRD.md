## Problem Statement

Users often need to track multiple overlapping tasks (e.g., cooking multiple dishes, laundry, and a work sprint) but find existing timer apps either too cluttered, visually unappealing, or unreliable when the browser tab is backgrounded. There is a need for a "just works," beautiful, and high-performance timer utility that feels native to the web and mobile devices.

## Solution

A high-fidelity, offline-first React web app built with a "no-build" TypeScript architecture. It features a clean, animated interface that supports multiple concurrent timers. The app ensures timing accuracy by using system timestamps rather than simple counters, and it manages a "Symphony of Alarms" by coordinating multiple expiring timers into a single, cohesive audio experience.

## User Stories

1. As a user, I want to create a new timer with a custom name so that I can keep track of specific tasks.
2. As a user, I want to input time via a numeric keypad (HH:MM:SS) so that I can quickly set durations.
3. As a user, I want to see a smooth, animated countdown for each timer so that the app feels responsive and alive.
4. As a user, I want to pause a running timer so that I can handle interruptions.
5. As a user, I want to resume a paused timer without losing the remaining time.
6. As a user, I want to restart a timer from its original duration with a single click.
7. As a user, I want to edit a timer's name or duration even while it is active or paused.
8. As a user, I want to delete a timer to clear my workspace.
9. As a user, I want my timers to persist after a page refresh so that I don't lose track of my tasks.
10. As a user, I want a single audible chime to play when one or more timers expire, rather than a cacophony of overlapping sounds.
11. As a user, I want the alarm to loop for a configurable duration (default 5s) so it isn't intrusive but is noticeable.
12. As a user, I want a visual alert for each finished timer so I know exactly which task requires my attention.
13. As a user, I want to dismiss individual finished timers to stop the visual alert and the global alarm.
14. As a user, I want the interface to adapt to my system's light or dark mode automatically.
15. As a user, I want to manually toggle between Light, Dark, and Auto themes.
16. As a user, I want to use the app on my iPhone with touch-friendly buttons and inputs.
17. As a user, I want to use keyboard shortcuts (e.g., Space for pause/resume) for faster interaction on desktop.

## Implementation Decisions

### Modules

- **TimerCore (Deep Module):** A pure TypeScript class/logic layer that handles all time calculations. It stores `startTime`, `duration`, and `pauseOffset`. It uses `Date.now()` to calculate "remaining time" on every tick, ensuring accuracy even if the browser throttles the main thread.
- **AlarmCoordinator (Deep Module):** A singleton service that manages the `AudioContext` or `HTMLAudioElement`. It maintains a set of `activeAlertIds`. The audio plays if `activeAlertIds.size > 0` and stops only when the set is empty. It manages the 5-second loop logic internally.
- **StorageProvider:** A wrapper around `localStorage` that serializes the state of the `TimerCore` instances.
- **ThemeManager:** Utilizes CSS Variables and `matchMedia('(prefers-color-scheme: dark)')` to handle visual states without re-rendering the entire component tree.

### Technical Clarifications

- **No-Build React:** We will use `htm` (Hyperscript Tagged Markup) or standard `React.createElement` via ESM modules from a CDN like `esm.sh`. This avoids the need for Webpack/Vite.
- **TypeScript:** We will use JSDoc with TypeScript type checking or a browser-based transpiler logic if preferred, but for a "no-build" ESM approach, standard ES2022+ is the target.
- **Animation:** Use **CSS Transitions** for simple state changes and **requestAnimationFrame** inside the React loop for the high-precision countdown display.

### Schema Changes (LocalStorage)

```json
{
  "settings": { "theme": "auto", "alarmDuration": 5000 },
  "timers": [
    {
      "id": "uuid",
      "label": "Pasta",
      "totalDurationMs": 600000,
      "state": "RUNNING",
      "targetEndTime": 1712784000000,
      "remainingTimeOnPause": null
    }
  ]
}
```
