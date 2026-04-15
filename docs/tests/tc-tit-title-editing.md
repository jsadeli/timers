# TC-TIT — Title Editing

**Area:** Title Editing
**Total:** 4 test cases — P0: 0 · P1: 4 · P2: 0

---

## Legend

| Column | Description |
|---|---|
| **Priority** | P0 = Blocker / P1 = High / P2 = Medium |
| **Automation** | `High` = fully scriptable / `Medium` = requires DOM interaction / `Low` = requires audio/visual/system-level inspection |

---

| Test ID | Test Title | Preconditions | Test Steps | Expected Results | Priority | Automation Notes |
|---|---|---|---|---|---|---|
| TC-TIT-001 | Click title to enter edit mode | One timer exists | 1. Click on the timer label `<h3>`. | Label text is replaced by a text `<input>` pre-filled with current title. | P1 | High — assert `isEditingTitle === true` in component state. |
| TC-TIT-002 | Save title on blur | Timer in title-edit mode, input = `"My Timer"` | 1. Click away from the title input (blur). | Timer label updates to `"My Timer"`. | P1 | High — simulate blur event, assert `timerCore.label === 'My Timer'`. |
| TC-TIT-003 | Save title on Enter key | Timer in title-edit mode, input = `"Sprint"` | 1. Press Enter. | Timer label updates to `"Sprint"`; input reverts to display mode. | P1 | High — simulate keydown `Enter`, assert label change. |
| TC-TIT-004 | Blank title falls back to "Timer" | Timer in title-edit mode | 1. Clear all text from input.<br>2. Press Enter. | Timer label becomes `"Timer"` (default). | P1 | High — assert `timerCore.label === 'Timer'` when saved with empty string. |
