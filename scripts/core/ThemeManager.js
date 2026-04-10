export class ThemeManager {
  static init() {
    this.applyTheme(this.getTheme());
    
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
      if (this.getTheme() === 'auto') {
        this.applyTheme('auto');
      }
    });
  }

  static getTheme() {
    try {
      const settings = JSON.parse(localStorage.getItem('timer_settings') || '{}');
      return settings.theme || 'auto';
    } catch {
      return 'auto';
    }
  }

  static setTheme(theme) {
    try {
      const settings = JSON.parse(localStorage.getItem('timer_settings') || '{}');
      settings.theme = theme;
      localStorage.setItem('timer_settings', JSON.stringify(settings));
    } catch (e) {
      console.error('Failed to save theme', e);
    }
    this.applyTheme(theme);
  }

  static applyTheme(theme) {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else if (theme === 'light') {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.remove('light', 'dark');
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.add('light');
      }
    }
  }
}
