# Timers

## About

A high-fidelity, offline-first React web application built entirely on a "no-build" architecture. It provides a clean, elegantly animated interface that supports tracking multiple concurrent timers. The application manages precise time tracking to provide accuracy without browser throttling and avoids the need for advanced bundling tools, delivering a premium user experience straight out of the box.

## Features

- **Concurrent Timers:** Track multiple tasks such as cooking, work sprints, and laundry side-by-side.
- **High-Precision Timing:** Uses system timestamps (`Date.now()`) on every tick rather than simple incremental counters, ensuring precise accuracy even if the browser backgrounds the tab.
- **Drag-and-Drop Reordering:** Easily organize your active and paused timers.
- **Audio Controls:** Dedicated mute toggle for a completely silent, visually-reliant tracking mode.
- **Premium Interface:** Luxuriously refined UI leveraging smooth css-animations, high-quality typography, and atmospheric glassmorphism backgrounds.
- **Zero Configuration:** Entirely "no-build." Uses native ES Modules and `importmap`, making source code readable right in the browser.
- **Persistence:** All timers and settings auto-save to `localStorage`.
- **Dynamic Theming:** Seamless switching between Light, Dark, and System Auto modes.

## Usage Instructions

No `npm install`, Webpack, or Vite is required. Simply spin up a local development server to start the project.

1. Clone or download the repository.
2. Run your preferred local HTTP server from the root directory. For example, using Python:
   ```bash
   python3 -m http.server 8000
   ```
3. Open your web browser and navigate to `http://localhost:8000`.

## How it works

The architecture relies entirely on native browser features in combination with local ESM React bundles.

- **No-Build React:** React 19.2 ESM files are kept locally in the `scripts/lib` directory. `<script type="importmap">` is used inside `index.html` to direct the browser's module resolver.
- **TimerCore:** A pure logic layer class that stores `startTime`, `duration`, and offsets. It ensures the UI represents accurate durations regardless of device performance or tab state.
- **AlarmCoordinator:** A deep module singleton that maintains the HTML audio execution and active alert queue, implementing a unified 5-second recurring chime loop.
- **Type-safe:** Uses comprehensive JSDoc structures combined with TypeScript configuration in the editor (`jsconfig.json` / `tsconfig.json`) to provide a fully type-checked experience over raw `.js` files.

## Customization

- **Timer Attributes:** Use the intuitive numeric keypad to set or edit hours, minutes, and seconds. Each timer label can be renamed on-the-fly.
- **Thematic Elements:** Swap between Dark, Light, and Auto themes using the interface's top right icon.
- **Visuals:** Advanced customization of the application's look, feel, and colors can be handled by adjusting the CSS custom properties (variables) defined at the top of `index.css`.
- **Audio Overrides:** The muted state and sound properties can be extended or deactivated right from the UI, or custom audio elements can be appended to the `assets` folder.
