# TC-CRE — Timer Creation

**Area:** Timer Creation
**Total:** 12 test cases — P0: 4 · P1: 6 · P2: 2

---

## Legend

| Column | Description |
|---|---|
| **Priority** | P0 = Blocker / P1 = High / P2 = Medium |
| **Automation** | `High` = fully scriptable / `Medium` = requires DOM interaction / `Low` = requires audio/visual/system-level inspection |

---

| Test ID | Test Title | Preconditions | Test Steps | Expected Results | Priority | Automation Notes |
|---|---|---|---|---|---|---|
| TC-CRE-001 | Create timer with valid duration | App loaded, no timers in list | 1. Click "New Timer".<br>2. Press `1`, `3`, `0`, `0`, `0`, `0` on numpad.<br>3. Click "Start Timer". | Timer card appears at top of list with label "1 hr 30 mins", immediately in `RUNNING` state, countdown active. | P0 | High — inject `onAdd` mock, assert `TimerCore.state === 'RUNNING'` and `totalDurationMs === 5400000`. |
| TC-CRE-002 | Input display formats as HH h MM m SS s | App loaded, form expanded | 1. Click "New Timer".<br>2. Press `0`, `1`, `3`, `0` on numpad. | Live preview shows `00 h 01 m 30 s`. | P1 | High — assert display text after each keypress. |
| TC-CRE-003 | Zero-duration timer is blocked | Form expanded | 1. Press only `0`s (or leave input empty).<br>2. Click "Start Timer". | "Start Timer" button is disabled (50% opacity); no timer is created; form remains open. | P0 | High — assert button has `pointer-events: none` or `opacity: 0.5`; assert `onAdd` not called. |
| TC-CRE-004 | Backspace (⌫) removes last digit | Form expanded, input = `123` | 1. Press ⌫ once. | Input becomes `12`; live display updates accordingly. | P1 | High — simulate click on ⌫, assert internal `input` state. |
| TC-CRE-005 | Clear (C) wipes all digits | Form expanded, input = `123456` | 1. Press C. | Input resets to empty; live display shows `00 h 00 m 00 s`. | P1 | High — simulate click on C, assert `input === ''`. |
| TC-CRE-006 | 7th digit is silently ignored | Form expanded | 1. Press digits `1` through `7`. | Input contains exactly 6 digits (`123456`); 7th press has no effect. | P1 | High — assert `input.length <= 6` after 7 presses. |
| TC-CRE-007 | Pressing `0` when input is already `'0'` is ignored | Form expanded | 1. Press `0` once (input = `'0'`).<br>2. Press `0` again. | Input remains `'0'` (a single zero); live display shows `00 h 00 m 00 s`. | P2 | High — assert `input === '0'` after second `0` press. |
| TC-CRE-008 | Pressing `0` as first digit is allowed | Form expanded, input = `''` | 1. Press `0`. | Input becomes `'0'`; live display updates (still `00 h 00 m 00 s`). | P2 | High — assert `input === '0'`. |
| TC-CRE-009 | Label is auto-generated from duration | Form expanded | 1. Enter `0`, `0`, `0`, `5`, `3`, `0` (5min 30sec).<br>2. Click "Start Timer". | New timer label is `"5 mins 30 secs"`. | P1 | High — assert newly created `TimerCore.label`. |
| TC-CRE-010 | "New Timer" form collapses on X (cancel) | Form expanded, input = `1230` | 1. Click the X button. | Form collapses to the "New Timer" pill; input is not preserved; no timer is created. | P1 | High — assert form collapses and `onAdd` not called. |
| TC-CRE-011 | New timer is prepended to list | Two existing timers in list | 1. Create a new timer. | New timer card appears at the **top** of the list (index 0). | P0 | High — assert `timers[0].id === newTimer.id`. |
| TC-CRE-012 | Timer starts immediately upon creation | Fresh app | 1. Create a timer with `00:01:00`.<br>2. Observe immediately. | Timer card is in `RUNNING` state; `targetEndTime` is set; countdown is ticking. | P0 | High — assert `state === 'RUNNING'` and `targetEndTime > Date.now()` right after `onAdd`. |
