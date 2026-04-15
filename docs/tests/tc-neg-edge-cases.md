# TC-NEG — Edge Cases & Negative Scenarios

**Area:** Edge Cases & Negative Scenarios
**Total:** 14 test cases — P0: 3 · P1: 9 · P2: 2

---

## Legend

| Column | Description |
|---|---|
| **Priority** | P0 = Blocker / P1 = High / P2 = Medium |
| **Automation** | `High` = fully scriptable / `Medium` = requires DOM interaction / `Low` = requires audio/visual/system-level inspection |

---

| Test ID | Test Title | Preconditions | Test Steps | Expected Results | Priority | Automation Notes |
|---|---|---|---|---|---|---|
| TC-NEG-001 | `formatTime` uses ceiling — 1ms remaining shows `00:00:01` | Timer `RUNNING` | 1. Call `formatTime(1)`. | Returns `'00:00:01'`, not `'00:00:00'`. | P1 | High — unit test `formatTime(1) === '00:00:01'`. |
| TC-NEG-002 | `formatTime` returns `'00:00:00'` for zero or negative | — | 1. Call `formatTime(0)`.<br>2. Call `formatTime(-500)`. | Both return `'00:00:00'`. | P1 | High — unit test both cases. |
| TC-NEG-003 | `getRemainingTimeMs` never returns negative | Timer `RUNNING`, `Date.now() > targetEndTime` | 1. Advance clock past `targetEndTime`.<br>2. Call `getRemainingTimeMs()`. | Returns `0`, not a negative number. | P1 | High — unit test with mocked `Date.now`. |
| TC-NEG-004 | `start()` is a no-op when `totalDurationMs === 0` | Timer `IDLE` with duration 0 | 1. Call `timerCore.start()`. | State remains `IDLE`; `targetEndTime` is not set. | P1 | High — unit test `TimerCore.start()` with `totalDurationMs = 0`. |
| TC-NEG-005 | `pause()` is a no-op when not RUNNING | Timer in `IDLE` or `FINISHED` state | 1. Call `timerCore.pause()`. | No state change; no error thrown. | P0 | High — unit test `pause()` on `IDLE` and `FINISHED` states. |
| TC-NEG-006 | `start()` no-op when already RUNNING | Timer `RUNNING` | 1. Call `timerCore.start()` again. | `targetEndTime` is not reset; countdown is not restarted from full duration. | P0 | High — assert `targetEndTime` unchanged. |
| TC-NEG-007 | Wall-clock timing is accurate under tab throttling | Browser tab backgrounded during timer | 1. Start a timer.<br>2. Background the tab for several seconds.<br>3. Foreground the tab. | Remaining time reflects actual elapsed wall-clock time (not setInterval drift); countdown is correct. | P0 | Low — requires browser environment; verify `targetEndTime - Date.now()` yields accurate remaining time after background. |
| TC-NEG-008 | `localStorage` quota exceeded — graceful degradation | Storage near quota limit | 1. Fill `localStorage` close to limit.<br>2. Save a new timer. | Error is logged to console; app does not crash; in-memory state is unaffected. | P1 | Medium — mock `localStorage.setItem` to throw `QuotaExceededError`; assert error logged and no exception propagated. |
| TC-NEG-009 | `AudioContext` suspended — resumes on `playChime` | `AudioContext` in `suspended` state | 1. Trigger `AlarmCoordinator.playChime()` with `audioCtx.state === 'suspended'`. | `audioCtx.resume()` is called before oscillator nodes are created; chime plays successfully. | P1 | Medium — mock `AudioContext.state = 'suspended'`; assert `resume()` called. |
| TC-NEG-010 | Service worker registration failure does not crash app | Service worker script unavailable | 1. Block `sw.js` from loading.<br>2. Load the app. | App loads and functions normally; only a console warning is emitted. | P1 | Medium — intercept SW registration; assert no uncaught error and app renders. |
| TC-NEG-011 | `#root` element missing does not crash | `<div id="root">` removed from HTML | 1. Remove `#root` from DOM.<br>2. Execute `app.js`. | Null-check guard prevents crash; no uncaught exception. | P2 | High — assert `createRoot` not called when `document.getElementById('root')` is null. |
| TC-NEG-012 | `AlarmCoordinator.startAlarm` no-op for already active alarm | Alarm already active for `timerId` | 1. Call `startAlarm(id)` twice for the same timer ID. | Second call is ignored; only one interval and one timeout are registered in `activeAlerts`. | P1 | High — assert `activeAlerts.get(id)` entry count is 1 after two calls. |
| TC-NEG-013 | `ThemeManager` and `StorageProvider` settings key stays compatible | User sets theme and mute independently | 1. Set theme to "dark" via `ThemeManager.setTheme()`.<br>2. Toggle mute via `StorageProvider.saveSettings()`.<br>3. Reload. | Both values are independently preserved; neither write overwrites the other's field. | P1 | High — assert both `theme` and `isMuted` keys survive after both operations. |
| TC-NEG-014 | `generateId` fallback path avoids collision risk on repeat call | `crypto.randomUUID` unavailable | 1. Stub `crypto.randomUUID = undefined`.<br>2. Call `generateId()` 1000 times. | All generated IDs are unique strings (no duplicates in the sample). | P2 | High — unit test with `Math.random` entropy check over large N. |
