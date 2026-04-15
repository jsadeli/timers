# TC-PER — Persistence

**Area:** Persistence
**Total:** 7 test cases — P0: 4 · P1: 3 · P2: 0

---

## Legend

| Column | Description |
|---|---|
| **Priority** | P0 = Blocker / P1 = High / P2 = Medium |
| **Automation** | `High` = fully scriptable / `Medium` = requires DOM interaction / `Low` = requires audio/visual/system-level inspection |

---

| Test ID | Test Title | Preconditions | Test Steps | Expected Results | Priority | Automation Notes |
|---|---|---|---|---|---|---|
| TC-PER-001 | Timers persist on page reload | Two timers exist (one running, one paused) | 1. Reload the page. | Both timer cards reappear with correct labels, states, and remaining times. | P0 | High — assert `StorageProvider.getTimers()` contains correct serialized data; assert rehydrated `TimerCore` instances. |
| TC-PER-002 | Running timer with past `targetEndTime` auto-finishes on reload | One timer running, close tab for > its remaining duration, reopen | 1. Start a timer with 5 seconds.<br>2. Close and reopen tab after 10 seconds. | Timer is rehydrated; first `tick()` call detects `Date.now() >= targetEndTime`; timer immediately transitions to `FINISHED`; alarm fires. | P0 | High — mock `Date.now()` past `targetEndTime`; assert `tick()` returns `true` and `state === 'FINISHED'`. |
| TC-PER-003 | Paused timer restored with correct remaining time | One timer paused at 45s remaining | 1. Reload the page. | Timer is re-created in `PAUSED` state; `remainingTimeOnPause === 45000`. | P0 | High — assert `state === 'PAUSED'` and `remainingTimeOnPause` matches pre-reload value. |
| TC-PER-004 | Finished timer state persists across reload | One timer in `FINISHED` state | 1. Reload the page. | Timer card shows `FINISHED` state with Restart + Dismiss controls. | P1 | High — assert `state === 'FINISHED'` post-rehydration. |
| TC-PER-005 | Empty timer list on first load | Clean localStorage | 1. Load app with no stored timers. | Empty state placeholder is shown (BellRing icon + prompt); no timer cards. | P1 | High — assert `timers.length === 0`; assert empty-state UI rendered. |
| TC-PER-006 | Corrupted `timers_state` JSON falls back to empty list | Manually inject invalid JSON into `timers_state` | 1. Set `localStorage['timers_state'] = '!!invalid!!'`.<br>2. Load the app. | App loads without crash; timer list is empty. | P0 | High — seed bad localStorage value; assert `getTimers()` returns `[]` and no JS error thrown. |
| TC-PER-007 | Corrupted `timer_settings` JSON falls back to defaults | Manually inject invalid settings JSON | 1. Set `localStorage['timer_settings'] = '{'`.<br>2. Load the app. | App loads with default settings (`theme: 'auto'`, `isMuted: false`). | P1 | High — assert `getSettings()` returns default object. |
