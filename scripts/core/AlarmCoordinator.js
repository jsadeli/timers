export class AlarmCoordinator {
  static activeAlertIds = new Set();
  static audioCtx = null;
  static isPlaying = false;
  static loopInterval = null;
  static alarmTimeout = null;
  static loopDurationMs = 30000; // Total duration to sound the alarm
  static chimeIntervalMs = 3000; // Interval between chimes

  static isMuted = false;

  static initAudio() {
    if (!this.audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.audioCtx = new AudioContext();
      }
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

  static startAlarm(timerId) {
    this.initAudio();
    this.activeAlertIds.add(timerId);

    // Automatically stop this alarm session after loopDurationMs
    if (this.alarmTimeout) {
      clearTimeout(this.alarmTimeout);
    }
    this.alarmTimeout = setTimeout(() => {
      this.stopGlobalAlarm();
    }, this.loopDurationMs);

    if (!this.isPlaying && this.activeAlertIds.size > 0) {
      this.isPlaying = true;
      this.playChime(); // Play immediately

      this.loopInterval = setInterval(() => {
        if (this.activeAlertIds.size > 0) {
          this.playChime();
        } else {
          this.stopGlobalAlarm();
        }
      }, this.chimeIntervalMs);
    }
  }

  static stopAlarm(timerId) {
    this.activeAlertIds.delete(timerId);
    if (this.activeAlertIds.size === 0) {
      this.stopGlobalAlarm();
    }
  }

  static stopGlobalAlarm() {
    this.isPlaying = false;
    if (this.loopInterval) {
      clearInterval(this.loopInterval);
      this.loopInterval = null;
    }
    if (this.alarmTimeout) {
      clearTimeout(this.alarmTimeout);
      this.alarmTimeout = null;
    }
    this.activeAlertIds.clear();
  }
}

// Sync CSS with truth from JS
document.documentElement.style.setProperty(
  "--chime-interval",
  `${AlarmCoordinator.chimeIntervalMs}ms`,
);
