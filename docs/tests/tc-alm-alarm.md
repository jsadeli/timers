# TC-ALM — Alarm

**Area:** Alarm
**Total:** 7 test cases — P0: 3 · P1: 3 · P2: 1

---

## Legend

| Column | Description |
|---|---|
| **Priority** | P0 = Blocker / P1 = High / P2 = Medium |
| **Automation** | `High` = fully scriptable / `Medium` = requires DOM interaction / `Low` = requires audio/visual/system-level inspection |

---

| Test ID | Test Title | Preconditions | Test Steps | Expected Results | Priority | Automation Notes |
|---|---|---|---|---|---|---|
| TC-ALM-001 | Alarm triggers when timer finishes | One timer running with short duration | 1. Let timer reach zero. | `AlarmCoordinator.startAlarm(timerId)` is called; chime plays (if unmuted); visual "finished" state applied. | P0 | Medium — assert `AlarmCoordinator.activeAlerts.has(timerId)` after finish. Chime audio requires browser env. |
| TC-ALM-002 | Alarm auto-stops after 30 seconds | Alarm active for a finished timer | 1. Let alarm play for 30 seconds without user interaction. | Alarm stops automatically; `activeAlerts` entry for that timer is cleared. | P1 | Medium — mock `setTimeout` to fast-forward 30s; assert `stopAlarm` called. |
| TC-ALM-003 | Multiple timers finishing simultaneously get independent alarms | Two timers both finishing at the same time | 1. Set up two timers with identical short durations.<br>2. Wait for both to finish. | Both appear in `AlarmCoordinator.activeAlerts`; alarms are independent; stopping one does not affect the other. | P1 | High — assert separate `Map` entries, stop one and confirm the other remains. |
| TC-ALM-004 | Dismiss stops alarm for that timer only | Two alarms active | 1. Click Dismiss on timer A. | Alarm for timer A stops; alarm for timer B continues. | P0 | High — assert `activeAlerts.has(timerA.id) === false` and `activeAlerts.has(timerB.id) === true`. |
| TC-ALM-005 | Restart stops alarm then restarts timer | Timer `FINISHED` with alarm active | 1. Click Restart. | Alarm stops; timer resets to `RUNNING` from full duration. | P0 | High — assert `AlarmCoordinator.stopAlarm` called before `timerCore.start()`. |
| TC-ALM-006 | Cancel from FINISHED state stops alarm | Timer `FINISHED` with alarm active | 1. Click Cancel (⬛). | Alarm stops; timer resets to `IDLE`. | P0 | High — assert `AlarmCoordinator.stopAlarm` called; `state === 'IDLE'`. |
| TC-ALM-007 | Chime repeats every 3 seconds while alarm active | Alarm active | 1. Start alarm.<br>2. Wait 6 seconds. | Chime plays at t=0s, t=3s, t=6s. | P2 | Medium — mock `setInterval`, assert playChime called at correct intervals. |
