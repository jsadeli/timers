# TC-MUT — Mute

**Area:** Mute
**Total:** 4 test cases — P0: 1 · P1: 3 · P2: 0

---

## Legend

| Column | Description |
|---|---|
| **Priority** | P0 = Blocker / P1 = High / P2 = Medium |
| **Automation** | `High` = fully scriptable / `Medium` = requires DOM interaction / `Low` = requires audio/visual/system-level inspection |

---

| Test ID | Test Title | Preconditions | Test Steps | Expected Results | Priority | Automation Notes |
|---|---|---|---|---|---|---|
| TC-MUT-001 | Mute toggle suppresses chime audio | App loaded, timer finishes | 1. Click mute button to enable mute.<br>2. Let a timer finish. | `AlarmCoordinator.isMuted === true`; `playChime()` is a no-op; no audio output. | P0 | Medium — assert `isMuted === true`; assert `playChime` does not create oscillator nodes. |
| TC-MUT-002 | Visual finished state still applies when muted | `isMuted = true`, timer finishes | 1. Let a timer finish while muted. | Timer card still shows `FINISHED` state with Restart + Dismiss controls; alarm entry still in `activeAlerts`. | P1 | High — assert `state === 'FINISHED'` and `activeAlerts.has(id) === true` even when muted. |
| TC-MUT-003 | Mute state persists across reload | User enables mute | 1. Toggle mute on.<br>2. Reload the page. | Mute toggle is still on after reload; `StorageProvider.getSettings().isMuted === true`. | P1 | High — assert localStorage `timer_settings.isMuted` persisted and correctly rehydrated. |
| TC-MUT-004 | Unmuting allows chime on next alarm | App muted, timer `IDLE` | 1. Toggle mute off.<br>2. Start a short timer and let it finish. | Chime plays upon timer finish. | P1 | Medium — assert `isMuted === false`; audio context active. |
