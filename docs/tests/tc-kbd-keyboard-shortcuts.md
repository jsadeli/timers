# TC-KBD — Keyboard Shortcuts

**Area:** Keyboard Shortcuts
**Total:** 6 test cases — P0: 0 · P1: 5 · P2: 1

---

## Legend

| Column | Description |
|---|---|
| **Priority** | P0 = Blocker / P1 = High / P2 = Medium |
| **Automation** | `High` = fully scriptable / `Medium` = requires DOM interaction / `Low` = requires audio/visual/system-level inspection |

---

| Test ID | Test Title | Preconditions | Test Steps | Expected Results | Priority | Automation Notes |
|---|---|---|---|---|---|---|
| TC-KBD-001 | Space pauses all running timers | Two timers both `RUNNING` | 1. Press Space (focus not on input). | Both timers transition to `PAUSED`. | P1 | High — dispatch `keydown` Space on `window`; assert all `state === 'PAUSED'`. |
| TC-KBD-002 | Space starts all idle timers | Two timers both `IDLE` (with duration > 0) | 1. Press Space. | Both timers transition to `RUNNING`. | P1 | High — dispatch `keydown` Space; assert all `state === 'RUNNING'`. |
| TC-KBD-003 | Space starts all paused timers | Two timers both `PAUSED` | 1. Press Space. | Both timers resume (`RUNNING`). | P1 | High — assert all `state === 'RUNNING'`. |
| TC-KBD-004 | Space does not trigger shortcut when focus is in an input | Active `<input>` element focused (e.g., title edit) | 1. Click on a timer title to open edit input.<br>2. Press Space. | Space character is typed into the input; no timers are started or paused. | P1 | High — assert no timer state change when `event.target.tagName === 'INPUT'`. |
| TC-KBD-005 | Space does not trigger shortcut in textarea | Active `<textarea>` focused | 1. Focus a textarea.<br>2. Press Space. | Shortcut does not fire. | P2 | High — same guard for `TEXTAREA` tag. |
| TC-KBD-006 | Space with mixed RUNNING and IDLE timers | Timer A `RUNNING`, Timer B `IDLE` | 1. Press Space. | All `RUNNING` timers are paused; `IDLE` timers are left unchanged (since at least one is running). | P1 | High — assert Timer A `PAUSED`, Timer B still `IDLE`. |
