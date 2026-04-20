export class AlarmCoordinator {
  static activeAlerts = new Map(); // timerId -> { intervalId, timeoutId }
  static audioCtx = null;
  static loopDurationMs = 30000; // Total duration to sound the alarm
  static chimeIntervalMs = 3000; // Interval between chimes

  static isMuted = false;
  static alarmSound = "default";

  static setAlarmSound(sound) {
    this.alarmSound = sound;
  }

  static initAudio() {
    if (!this.audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.audioCtx = new AudioContext();
      }
    }
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission().catch(console.error);
    }
  }

  static setLoopDuration(ms) {
    this.loopDurationMs = ms;
  }

  static setIsMuted(muted) {
    this.isMuted = muted;
  }

  static playChime() {
    if (this.isMuted || !this.audioCtx) return;

    if (this.audioCtx.state === "suspended") {
      this.audioCtx.resume();
    }

    const now = this.audioCtx.currentTime;

    if (this.alarmSound === "high-pitch") {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.frequency.value = 2500;
      osc.type = "square";
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      gain.gain.setValueAtTime(0, now);
      for (let i = 0; i < 4; i++) {
        gain.gain.setValueAtTime(0.2, now + i * 0.2);
        gain.gain.setValueAtTime(0, now + i * 0.2 + 0.1);
      }
      osc.start(now);
      osc.stop(now + 0.8);
    } else if (this.alarmSound === "rooster") {
      const osc1 = this.audioCtx.createOscillator();
      const osc2 = this.audioCtx.createOscillator();
      const gainNode = this.audioCtx.createGain();

      const notes = [
        { f: 392, start: 0, duration: 0.15 },
        { f: 523, start: 0.2, duration: 0.15 },
        { f: 659, start: 0.4, duration: 0.15 },
        { f: 523, start: 0.6, duration: 0.6 },
      ];

      gainNode.connect(this.audioCtx.destination);
      osc1.type = "sawtooth";
      osc1.connect(gainNode);
      osc1.start(now);

      osc2.type = "square";
      osc2.connect(gainNode);
      osc2.start(now);

      gainNode.gain.setValueAtTime(0, now);

      notes.forEach((note) => {
        osc1.frequency.setValueAtTime(note.f, now + note.start);
        osc2.frequency.setValueAtTime(note.f * 1.01, now + note.start);
        gainNode.gain.setValueAtTime(0, Math.max(0, now + note.start - 0.01));
        gainNode.gain.linearRampToValueAtTime(0.15, now + note.start + 0.02);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + note.start + note.duration);
      });

      osc1.stop(now + 1.2);
      osc2.stop(now + 1.2);
    } else {
      // Create a smooth dual-tone chime
      const osc1 = this.audioCtx.createOscillator();
      const osc2 = this.audioCtx.createOscillator();
      const gainNode = this.audioCtx.createGain();

      osc1.frequency.value = 523.25; // C5
      osc2.frequency.value = 659.25; // E5

      osc1.type = "sine";
      osc2.type = "sine";

      osc1.connect(gainNode);
      osc2.connect(gainNode);
      gainNode.connect(this.audioCtx.destination);

      // Envelope
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(0.4, now + 0.1);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 1.5);

      osc1.start(now);
      osc2.start(now);

      osc1.stop(now + 1.6);
      osc2.stop(now + 1.6);
    }
  }

  static startAlarm(timerId, title = "Timer Finished", body = "Time is up!") {
    this.initAudio();

    if (this.activeAlerts.has(timerId)) return;

    let notificationObj = null;
    if ("Notification" in window && Notification.permission === "granted") {
      try {
        notificationObj = new Notification(title, {
          body,
          icon: "assets/icon.svg",
          requireInteraction: true
        });
        
        notificationObj.onclick = () => {
          window.focus();
          notificationObj.close();
        };
      } catch (e) {
        console.error("Failed to show notification", e);
      }
    }

    // Play immediately
    this.playChime();

    const intervalId = setInterval(() => {
      this.playChime();
    }, this.chimeIntervalMs);

    const timeoutId = setTimeout(() => {
      this.stopAlarm(timerId);
    }, this.loopDurationMs);

    this.activeAlerts.set(timerId, { intervalId, timeoutId, notification: notificationObj });
  }

  static stopAlarm(timerId) {
    if (this.activeAlerts.has(timerId)) {
      const { intervalId, timeoutId, notification } = this.activeAlerts.get(timerId);
      clearInterval(intervalId);
      clearTimeout(timeoutId);
      if (notification) {
        notification.close();
      }
      this.activeAlerts.delete(timerId);
    }
  }

  static stopGlobalAlarm() {
    for (const timerId of this.activeAlerts.keys()) {
      this.stopAlarm(timerId);
    }
  }
}

// Sync CSS with truth from JS
document.documentElement.style.setProperty(
  "--chime-interval",
  `${AlarmCoordinator.chimeIntervalMs}ms`,
);
