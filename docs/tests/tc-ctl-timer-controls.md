# TC-CTL — Timer Controls

**Area:** Timer Controls
**Total:** 10 test cases — P0: 8 · P1: 2 · P2: 0

---

## Legend

| Column | Description |
|---|---|
| **Priority** | P0 = Blocker / P1 = High / P2 = Medium |
| **Automation** | `High` = fully scriptable / `Medium` = requires DOM interaction / `Low` = requires audio/visual/system-level inspection |

---

| Test ID | Test Title | Preconditions | Test Steps | Expected Results | Priority | Automation Notes |
|---|---|---|---|---|---|---|
| TC-CTL-001 | Start an idle timer | One timer in `IDLE` state | 1. Click the Play (▶) button. | Timer transitions to `RUNNING`; countdown begins; progress bar starts filling. | P0 | High — assert `state === 'RUNNING'` and `targetEndTime` is set. |
| TC-CTL-002 | Pause a running timer | One timer in `RUNNING` state | 1. Click the Pause (⏸) button. | Timer transitions to `PAUSED`; countdown freezes; `remainingTimeOnPause` is recorded; Pause + Cancel buttons replaced by Resume + Cancel. | P0 | High — assert `state === 'PAUSED'`, `remainingTimeOnPause > 0`, `targetEndTime === null`. |
| TC-CTL-003 | Resume a paused timer from correct remaining time | One timer paused at ~30s remaining (started with 60s) | 1. Pause at ~30s remaining.<br>2. Wait 5 seconds.<br>3. Click Resume (▶). | Timer resumes from ~30s, not from ~25s; `targetEndTime ≈ Date.now() + remainingTimeOnPause`. | P0 | High — assert `targetEndTime` computed correctly from `remainingTimeOnPause`. |
| TC-CTL-004 | Cancel a running timer | One timer `RUNNING` | 1. Click the Cancel (⬛) button. | Timer resets to `IDLE`; alarm stops if active; display shows full original duration. | P0 | High — assert `state === 'IDLE'`, `AlarmCoordinator.stopAlarm` called. |
| TC-CTL-005 | Cancel a paused timer | One timer `PAUSED` | 1. Click the Cancel (⬛) button. | Timer resets to `IDLE`; display shows full original duration. | P0 | High — assert `state === 'IDLE'`. |
| TC-CTL-006 | Timer finishes automatically | One timer running with 2s duration | 1. Wait for the timer to reach 0. | Timer transitions to `FINISHED`; display shows `00:00:00`; progress bar is full; alarm triggers; controls change to Restart + Dismiss. | P0 | High — mock `Date.now`, advance tick loop, assert `state === 'FINISHED'` and `AlarmCoordinator.startAlarm` called. |
| TC-CTL-007 | Restart a finished timer | One timer in `FINISHED` state | 1. Click the Restart (↺) button. | Timer resets and immediately enters `RUNNING`; progress bar resets; alarm stops; countdown restarts from full duration. | P0 | High — assert `state === 'RUNNING'`, `AlarmCoordinator.stopAlarm` called before restart. |
| TC-CTL-008 | Dismiss a finished timer | One timer in `FINISHED` state | 1. Click the Dismiss (✕) button. | Timer resets to `IDLE`; alarm stops; display shows full original duration; controls revert to Play only. | P0 | High — assert `state === 'IDLE'`, `AlarmCoordinator.stopAlarm` called. |
| TC-CTL-009 | Delete a timer | One timer in any state | 1. Click the Delete (🗑) button. | Timer card is removed from the list; alarm for that timer stops; change persists to localStorage. | P0 | High — assert timer removed from `timers` array, `AlarmCoordinator.stopAlarm` called. |
| TC-CTL-010 | Controls reflect correct state at each stage | One timer cycling through states | 1. Observe controls in `IDLE`.<br>2. Start → observe `RUNNING`.<br>3. Pause → observe `PAUSED`.<br>4. Let finish → observe `FINISHED`. | `IDLE`: Play only. `RUNNING`: Pause + Cancel. `PAUSED`: Play + Cancel. `FINISHED`: Restart + Dismiss. | P0 | High — snapshot control visibility at each state. |
