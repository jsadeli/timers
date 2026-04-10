export class AlarmCoordinator {
  static activeAlerts = new Map(); // timerId -> { intervalId, timeoutId }
  static audioCtx = null;
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
    
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    
    const now = this.audioCtx.currentTime;
    
    // Create a smooth dual-tone chime
    const osc1 = this.audioCtx.createOscillator();
    const osc2 = this.audioCtx.createOscillator();
    const gainNode = this.audioCtx.createGain();
    
    osc1.frequency.value = 523.25; // C5
    osc2.frequency.value = 659.25; // E5
    
    osc1.type = 'sine';
    osc2.type = 'sine';
    
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
    
    if (this.activeAlerts.has(timerId)) return;
    
    // Play immediately
    this.playChime();
    
    const intervalId = setInterval(() => {
      this.playChime();
    }, this.chimeIntervalMs);
    
    const timeoutId = setTimeout(() => {
      this.stopAlarm(timerId);
    }, this.loopDurationMs);

    this.activeAlerts.set(timerId, { intervalId, timeoutId });
  }

  static stopAlarm(timerId) {
    if (this.activeAlerts.has(timerId)) {
      const { intervalId, timeoutId } = this.activeAlerts.get(timerId);
      clearInterval(intervalId);
      clearTimeout(timeoutId);
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
