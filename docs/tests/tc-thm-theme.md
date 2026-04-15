# TC-THM — Theme

**Area:** Theme
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
| TC-THM-001 | Switch to dark theme | App in light or auto mode | 1. Open theme selector.<br>2. Select "Dark". | `<html>` gains `.dark` class and loses `.light`; UI renders dark palette. | P1 | High — assert `document.documentElement.classList.contains('dark')`. |
| TC-THM-002 | Switch to light theme | App in dark or auto mode | 1. Select "Light" from theme selector. | `<html>` gains `.light` class and loses `.dark`. | P1 | High — assert `document.documentElement.classList.contains('light')`. |
| TC-THM-003 | Auto theme applies system dark preference | System set to dark, app in auto mode | 1. Set theme to "Auto".<br>2. Ensure system is in dark mode. | `<html>` has `.dark` class; neither `.light` is present. | P1 | Medium — mock `matchMedia` returning `matches: true`; assert class. |
| TC-THM-004 | Auto theme applies system light preference | System set to light, app in auto mode | 1. Set theme to "Auto".<br>2. Ensure system is in light mode. | `<html>` has no `.dark` or `.light` class added by ThemeManager (defaults to CSS base). | P2 | Medium — mock `matchMedia`, assert no `.dark` class. |
| TC-THM-005 | System preference change while on Auto updates theme | App in auto mode | 1. Simulate `prefers-color-scheme` change from light to dark. | `ThemeManager` listener fires; `<html>` class updates to `.dark` without page reload. | P1 | Medium — programmatically fire `matchMedia` change event; assert class update. |
| TC-THM-006 | Theme persists across reload | Theme set to "Dark" | 1. Reload the page. | Dark theme is still active; `ThemeManager.init()` reads and re-applies saved theme before first render. | P1 | High — assert `localStorage['timer_settings'].theme === 'dark'`; assert `.dark` class on load. |
