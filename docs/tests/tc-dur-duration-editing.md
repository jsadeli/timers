# TC-DUR — Duration Editing

**Area:** Duration Editing
**Total:** 6 test cases — P0: 0 · P1: 4 · P2: 2

---

## Legend

| Column | Description |
|---|---|
| **Priority** | P0 = Blocker / P1 = High / P2 = Medium |
| **Automation** | `High` = fully scriptable / `Medium` = requires DOM interaction / `Low` = requires audio/visual/system-level inspection |

---

| Test ID | Test Title | Preconditions | Test Steps | Expected Results | Priority | Automation Notes |
|---|---|---|---|---|---|---|
| TC-DUR-001 | Edit duration in IDLE state | One timer `IDLE` with 5:00 remaining | 1. Click on the timer display.<br>2. Enter `00:10:00`.<br>3. Save (blur or Enter). | Timer's `totalDurationMs` updates to 600000; display shows `00:10:00`; `state` remains `IDLE`. | P1 | High — assert `totalDurationMs === 600000` and `state === 'IDLE'`. |
| TC-DUR-002 | Edit duration while RUNNING | One timer `RUNNING` at ~30s elapsed out of 60s | 1. Click on the timer display.<br>2. Enter `00:02:00`.<br>3. Save. | `targetEndTime` is recalculated as `Date.now() + max(0, 120000 - elapsedMs)`; timer continues running with adjusted time. | P1 | High — assert `targetEndTime` recomputed correctly. |
| TC-DUR-003 | Edit duration while PAUSED | One timer `PAUSED` at 20s remaining | 1. Click on the timer display.<br>2. Enter `00:05:00`.<br>3. Save. | `remainingTimeOnPause` is set to the new full duration (300000ms); on resume, countdown starts from 5:00 (not 20s). | P1 | High — assert `remainingTimeOnPause === 300000`. |
| TC-DUR-004 | Duration edit to zero is no-op | One timer `IDLE` | 1. Click on timer display.<br>2. Enter `00:00:00`.<br>3. Save. | Timer duration is unchanged; no state change. | P1 | High — assert `totalDurationMs` unchanged. |
| TC-DUR-005 | Malformed duration input is no-op | One timer `IDLE` | 1. Click on timer display.<br>2. Enter `abc`.<br>3. Save. | Timer duration is unchanged; no error or crash. | P1 | High — assert no state mutation on invalid parse. |
| TC-DUR-006 | New duration shorter than elapsed time (RUNNING) | Timer `RUNNING` with 2:00 remaining out of 3:00 | 1. Click on timer display.<br>2. Enter `00:00:30` (less than 1:00 already elapsed). | `max(0, newMs - elapsed)` clamps to 0; on next tick `tick()` returns `true`; timer instantly finishes. | P2 | High — mock elapsed, assert `tick()` immediately finishes timer. |
