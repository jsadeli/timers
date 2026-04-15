# TC-DND — Drag and Drop

**Area:** Drag and Drop
**Total:** 3 test cases — P0: 0 · P1: 2 · P2: 1

---

## Legend

| Column | Description |
|---|---|
| **Priority** | P0 = Blocker / P1 = High / P2 = Medium |
| **Automation** | `High` = fully scriptable / `Medium` = requires DOM interaction / `Low` = requires audio/visual/system-level inspection |

---

| Test ID | Test Title | Preconditions | Test Steps | Expected Results | Priority | Automation Notes |
|---|---|---|---|---|---|---|
| TC-DND-001 | Drag timer to new position (happy path) | Three timers A, B, C in order | 1. Start dragging timer A.<br>2. Drag over timer C. | List reorders to C, B, A (live preview during drag). | P1 | Medium — simulate `dragstart` / `dragenter` events; assert array order in state. |
| TC-DND-002 | Reorder persists to localStorage after drop | Three timers reordered via drag | 1. Drop timer after dragging to new position. | `draggedTimerId` is cleared; new order is saved to `localStorage` via `StorageProvider.saveTimers()`. | P1 | High — assert `StorageProvider.saveTimers` called with correct order on `dragend`. |
| TC-DND-003 | Dragged card has visual `.dragging` class | One timer being dragged | 1. Start dragging a timer card. | Card that is being dragged receives the `.dragging` CSS class. | P2 | High — assert `isDragged === true` for the dragged timer's props. |
