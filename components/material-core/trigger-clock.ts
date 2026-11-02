import { clamp, TOTAL_MS, WINDUP_MS, ACTIVE_MS, type MaterialPhase } from "./types";

export function phaseAt(ms: number): MaterialPhase {
  if (ms <= 0) return "IDLE";
  if (ms < WINDUP_MS) return "WINDUP";
  if (ms < WINDUP_MS + ACTIVE_MS) return "ACTIVE";
  if (ms < TOTAL_MS) return "SETTLING";
  return "COMPLETE";
}

/** Scroll has authority to START a run only. Time has authority to advance it. */
export class TriggerClock {
  elapsedMs = 0;
  runId = 0;
  paused = false;
  private armed = true;
  private started = false;
  private previousScroll = 0;
  get phase() { return phaseAt(this.elapsedMs); }
  get running() { return this.started && this.elapsedMs < TOTAL_MS; }
  trigger() {
    if (!this.armed || this.running || this.phase === "COMPLETE") return false;
    this.runId++;
    this.started = true;
    this.elapsedMs = 0.001;
    this.armed = false;
    this.paused = false;
    return true;
  }
  scroll(progress: number) {
    // Rearm only on a new EXIT after completion, never one observed during playback.
    if (this.phase === "COMPLETE" && progress < 0.2 && this.previousScroll >= 0.2) this.reset();
    const crossed = progress >= 0.62 && this.previousScroll < 0.62;
    this.previousScroll = progress;
    return crossed && this.trigger();
  }
  tick(deltaMs: number) {
    if (this.running && !this.paused) this.elapsedMs = Math.min(TOTAL_MS, this.elapsedMs + clamp(deltaMs, 0, 40));
  }
  reset() {
    this.elapsedMs = 0;
    this.started = false;
    this.paused = false;
    this.armed = true;
  }
  /** Lab inspection only: deliberately pauses and does not seed another run. */
  seek(ms: number) {
    this.elapsedMs = clamp(ms, 0, TOTAL_MS);
    this.started = ms > 0;
    this.paused = true;
    this.armed = false;
  }
}
