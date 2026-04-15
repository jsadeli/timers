export const TIMER_FONTS = [
  { id: 'jetbrains', label: 'JetBrains Mono', family: "'JetBrains Mono', monospace" },
  { id: 'dmsans',   label: 'DM Sans',           family: "'DM Sans', sans-serif" },
  { id: 'caveat',    label: 'Caveat',            family: "'Caveat', cursive" },
];

export class FontManager {
  static init() {
    this.applyFont(this.getFont());
  }

  static getFont() {
    try {
      const settings = JSON.parse(localStorage.getItem('timer_settings') || '{}');
      return settings.timerFont || 'jetbrains';
    } catch {
      return 'jetbrains';
    }
  }

  static setFont(fontId) {
    try {
      const settings = JSON.parse(localStorage.getItem('timer_settings') || '{}');
      settings.timerFont = fontId;
      localStorage.setItem('timer_settings', JSON.stringify(settings));
    } catch (e) {
      console.error('Failed to save timer font', e);
    }
    this.applyFont(fontId);
  }

  static applyFont(fontId) {
    document.documentElement.setAttribute('data-timer-font', fontId);
  }
}
