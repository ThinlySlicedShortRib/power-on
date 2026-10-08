/**
 * Tiny WebAudio synth for the dive: a filtered-noise whoosh and a triangle blip.
 * The AudioContext is only created after a user gesture (ensure()) and closed on dispose().
 */
type AudioCtor = typeof AudioContext;

export class DiveAudio {
  private ac: AudioContext | null = null;
  enabled = false;

  ensure() {
    if (!this.ac) {
      try {
        const w = window as Window & { webkitAudioContext?: AudioCtor };
        const Ctor: AudioCtor | undefined = window.AudioContext ?? w.webkitAudioContext;
        this.ac = Ctor ? new Ctor() : null;
      } catch {
        this.ac = null;
      }
    }
    // iOS Safari reports "interrupted" after backgrounding; resume anything that isn't running or closed
    const st = this.ac?.state as string | undefined;
    if (this.ac && st !== "running" && st !== "closed") void this.ac.resume().catch(() => {});
  }

  whoosh(dur: number, f0: number, f1: number) {
    const ac = this.ac;
    if (!this.enabled || !ac) return;
    const n = Math.floor(ac.sampleRate * dur);
    const buf = ac.createBuffer(1, n, ac.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
    const src = ac.createBufferSource();
    src.buffer = buf;
    const bp = ac.createBiquadFilter();
    bp.type = "bandpass";
    bp.Q.value = 1.4;
    const g = ac.createGain();
    const t = ac.currentTime;
    bp.frequency.setValueAtTime(f0, t);
    bp.frequency.exponentialRampToValueAtTime(f1, t + dur);
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.22, t + dur * 0.35);
    g.gain.linearRampToValueAtTime(0, t + dur);
    src.connect(bp);
    bp.connect(g);
    g.connect(ac.destination);
    src.start(t);
    src.stop(t + dur);
  }

  blip(f: number) {
    const ac = this.ac;
    if (!this.enabled || !ac) return;
    const o = ac.createOscillator();
    const g = ac.createGain();
    const t = ac.currentTime;
    o.type = "triangle";
    o.frequency.setValueAtTime(f, t);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.12, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.25);
    o.connect(g);
    g.connect(ac.destination);
    o.start(t);
    o.stop(t + 0.3);
  }

  dispose() {
    const ac = this.ac;
    this.ac = null;
    if (ac) void ac.close().catch(() => {});
  }
}
