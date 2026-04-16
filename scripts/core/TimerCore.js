export class TimerCore {
  constructor(data) {
    this.id = data.id;
    this.label = data.label;
    this.totalDurationMs = data.totalDurationMs;
    this.state = data.state || "IDLE"; // IDLE, RUNNING, PAUSED, FINISHED
    this.targetEndTime = data.targetEndTime || null;
    this.remainingTimeOnPause = data.remainingTimeOnPause || null;
    this.createdAt = data.createdAt || Date.now();
  }

  start() {
    if (this.state === "RUNNING" || this.totalDurationMs <= 0) return;

    const now = Date.now();
    if (this.state === "PAUSED" && this.remainingTimeOnPause !== null) {
      this.targetEndTime = now + this.remainingTimeOnPause;
      this.remainingTimeOnPause = null;
    } else {
      this.targetEndTime = now + this.totalDurationMs;
    }

    this.state = "RUNNING";
  }

  pause() {
    if (this.state !== "RUNNING") return;

    this.remainingTimeOnPause = Math.max(0, this.targetEndTime - Date.now());
    this.targetEndTime = null;
    this.state = "PAUSED";
  }

  reset() {
    this.state = "IDLE";
    this.targetEndTime = null;
    this.remainingTimeOnPause = null;
  }

  finish() {
    this.state = "FINISHED";
    this.targetEndTime = null;
    this.remainingTimeOnPause = 0;
  }

  getRemainingTimeMs() {
    if (this.state === "IDLE") return this.totalDurationMs;
    if (this.state === "FINISHED") return 0;
    if (this.state === "PAUSED") return this.remainingTimeOnPause || 0;
    if (this.state === "RUNNING") {
      const remaining = this.targetEndTime - Date.now();
      return Math.max(0, remaining);
    }
    return 0;
  }

  tick() {
    if (this.state === "RUNNING" && Date.now() >= this.targetEndTime) {
      this.finish();
      return true;
    }
    return false;
  }

  toJSON() {
    return {
      id: this.id,
      label: this.label,
      totalDurationMs: this.totalDurationMs,
      state: this.state,
      targetEndTime: this.targetEndTime,
      remainingTimeOnPause: this.remainingTimeOnPause,
      createdAt: this.createdAt,
    };
  }

  static fromJSON(data) {
    return new TimerCore(data);
  }
}
