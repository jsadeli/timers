export class StorageProvider {
  static getSettings() {
    try {
      return JSON.parse(
        localStorage.getItem("timer_settings") || '{"theme":"auto","alarmDuration":5000}',
      );
    } catch {
      return { theme: "auto", alarmDuration: 5000 };
    }
  }

  static saveSettings(settings) {
    try {
      localStorage.setItem("timer_settings", JSON.stringify(settings));
    } catch (e) {
      console.error("Failed to save settings", e);
    }
  }

  static getTimers() {
    try {
      return JSON.parse(localStorage.getItem("timers_state") || "[]");
    } catch {
      return [];
    }
  }

  static saveTimers(timers) {
    try {
      localStorage.setItem("timers_state", JSON.stringify(timers));
    } catch (e) {
      console.error("Failed to save timers", e);
    }
  }
}
