// Sound effects: the shared AudioContext + master bus, the CRT power-on hum, UI blips and the modem handshake.
import { KEYS, load, save } from "./storage";

type Ctor = typeof AudioContext;

export class AudioEngine {
  ac: AudioContext | null = null;
  master: GainNode | null = null;
  soundOn: boolean;
  private hum: { out: GainNode; src: AudioScheduledSourceNode[] } | null = null;
  private timers = new Set<number>();
  private disposed = false;
  private noiseCache = new Map<number, AudioBuffer>();
  /** called whenever soundOn changes (music listens to re-apply its level) */
  onChange: (() => void) | null = null;

  constructor() {
    this.soundOn = load(KEYS.sound) !== "off";
  }

  /** Create (or resume) the context. Safe to call from any user gesture. */
  ensure(): AudioContext | null {
    if (this.disposed) return null;
    if (!this.ac) {
      try {
        const C: Ctor | undefined = window.AudioContext ?? (window as unknown as { webkitAudioContext?: Ctor }).webkitAudioContext;
        if (!C) return null;
        this.ac = new C();
        this.master = this.ac.createGain();
        this.master.gain.value = this.soundOn ? 1 : 0;
        this.master.connect(this.ac.destination);
      } catch {
        this.ac = null;
        return null;
      }
    }
    this.resume();
    return this.ac;
  }

  get running(): boolean {
    return !!this.ac && this.ac.state === "running";
  }

  setSound(on: boolean) {
    this.soundOn = on;
    save(KEYS.sound, on ? "on" : "off");
    if (this.master && this.ac) this.master.gain.setTargetAtTime(on ? 1 : 0, this.ac.currentTime, 0.05);
    if (!on) this.humFade(0.2);
    this.onChange?.();
  }

  later(fn: () => void, ms: number): number {
    const id = window.setTimeout(() => {
      this.timers.delete(id);
      fn();
    }, ms);
    this.timers.add(id);
    return id;
  }

  noise(sec: number): AudioBuffer | null {
    const ac = this.ac;
    if (!ac) return null;
    const key = Math.round(sec * 100);
    let b = this.noiseCache.get(key);
    if (!b) {
      b = ac.createBuffer(1, Math.max(1, Math.floor(ac.sampleRate * sec)), ac.sampleRate);
      const d = b.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      this.noiseCache.set(key, b);
    }
    return b;
  }

  tone(f: number, t0: number, dur: number, gain: number, type: OscillatorType = "sine", dest?: AudioNode) {
    const ac = this.ac;
    if (!ac || !this.master) return;
    const o = ac.createOscillator(), g = ac.createGain();
    o.type = type;
    o.frequency.value = f;
    g.gain.setValueAtTime(0, t0);
    g.gain.linearRampToValueAtTime(gain, t0 + 0.01);
    g.gain.setValueAtTime(gain, t0 + dur - 0.02);
    g.gain.linearRampToValueAtTime(0, t0 + dur);
    o.connect(g);
    g.connect(dest ?? this.master);
    o.start(t0);
    o.stop(t0 + dur + 0.05);
  }

  blip(f = 880) {
    const ac = this.ensure();
    if (!ac || !this.soundOn) return;
    this.tone(f, ac.currentTime, 0.06, 0.06, "square");
  }

  /** CRT power-on: mains hum, flyback whine, degauss thunk and a cheerful start-up chime. */
  startHum() {
    const ac = this.ensure();
    if (!ac || !this.master || !this.soundOn) return;
    const t = ac.currentTime, out = ac.createGain();
    out.gain.setValueAtTime(0, t);
    out.gain.linearRampToValueAtTime(1, t + 0.6);
    out.connect(this.master);
    const osc = (f: number, g: number) => {
      const o = ac.createOscillator(), gg = ac.createGain();
      o.frequency.value = f;
      gg.gain.value = g;
      o.connect(gg);
      gg.connect(out);
      o.start();
      return o;
    };
    const a = osc(60, 0.022), b = osc(120, 0.01), w = osc(15734, 0.0015);
    const n = ac.createBufferSource();
    n.buffer = this.noise(2);
    n.loop = true;
    const lp = ac.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 380;
    const gn = ac.createGain();
    gn.gain.value = 0.025;
    n.connect(lp);
    lp.connect(gn);
    gn.connect(out);
    n.start();
    const th = ac.createBufferSource();
    th.buffer = this.noise(0.5);
    const tf = ac.createBiquadFilter();
    tf.type = "lowpass";
    tf.frequency.value = 140;
    const tg = ac.createGain();
    tg.gain.setValueAtTime(0.25, t);
    tg.gain.exponentialRampToValueAtTime(0.001, t + 0.45);
    th.connect(tf);
    tf.connect(tg);
    tg.connect(this.master);
    th.start(t);
    [72, 76, 79, 84, 88].forEach((m, i) => this.tone(440 * Math.pow(2, (m - 69) / 12), t + 1.1 + i * 0.11, 0.35, 0.05, "triangle"));
    this.hum = { out, src: [a, b, w, n] };
  }

  humFade(sec: number) {
    const h = this.hum, ac = this.ac;
    if (!h || !ac) return;
    h.out.gain.setTargetAtTime(0, ac.currentTime, sec / 4);
    this.later(() => h.src.forEach((s) => { try { s.stop(); } catch { /* already stopped */ } }), sec * 1000 + 300);
    this.hum = null;
  }

  get humming(): boolean {
    return !!this.hum;
  }

  /** Dial tone, DTMF, ring, answer tone, training noise. Calls onStep(lineIndex) as the log advances. */
  modem(steps: [number, string, number][], onStep: (i: number) => void): () => void {
    const ac = this.ensure();
    const ids: number[] = [];
    if (ac && this.master) {
      const t = ac.currentTime + 0.05, master = this.master;
      this.tone(350, t, 1.1, 0.08);
      this.tone(440, t, 1.1, 0.08);
      const dtmf = [[941, 1336], [770, 1336], [770, 1336], [941, 1336], [697, 1209], [697, 1336], [770, 1209]];
      dtmf.forEach((p, i) => { const s = t + 1.25 + i * 0.14; this.tone(p[0], s, 0.09, 0.07); this.tone(p[1], s, 0.09, 0.07); });
      this.tone(440, t + 2.4, 1.0, 0.06);
      this.tone(480, t + 2.4, 1.0, 0.06);
      this.tone(2100, t + 3.6, 1.2, 0.07);
      const o = ac.createOscillator(), g = ac.createGain();
      o.type = "square";
      g.gain.setValueAtTime(0, t + 4.8);
      g.gain.linearRampToValueAtTime(0.035, t + 4.85);
      g.gain.setValueAtTime(0.035, t + 6.1);
      g.gain.linearRampToValueAtTime(0, t + 6.2);
      for (let k = 0; k < 26; k++) o.frequency.setValueAtTime(900 + Math.random() * 1500, t + 4.8 + k * 0.05);
      o.connect(g);
      g.connect(master);
      o.start(t + 4.8);
      o.stop(t + 6.3);
      const n = ac.createBufferSource();
      n.buffer = this.noise(1.8);
      const bp = ac.createBiquadFilter();
      bp.type = "bandpass";
      bp.frequency.value = 1800;
      bp.Q.value = 0.7;
      const gn = ac.createGain();
      gn.gain.setValueAtTime(0, t + 6.2);
      gn.gain.linearRampToValueAtTime(0.12, t + 6.3);
      gn.gain.setValueAtTime(0.12, t + 7.6);
      gn.gain.linearRampToValueAtTime(0, t + 7.9);
      n.connect(bp);
      bp.connect(gn);
      gn.connect(master);
      n.start(t + 6.2);
    }
    steps.forEach((s, i) => ids.push(this.later(() => onStep(i), s[0] * 1000)));
    return () => ids.forEach((id) => { clearTimeout(id); this.timers.delete(id); });
  }

  /** allow use again after dispose() (StrictMode mounts, unmounts and remounts effects) */
  revive() {
    this.disposed = false;
  }

  suspend() {
    this.ac?.suspend().catch(() => {});
  }

  /** Wake the context. iOS Safari parks it as "interrupted" (not "suspended") after the app is backgrounded,
   *  so anything short of running or closed gets a resume; browsers may still want a gesture for it to stick. */
  resume() {
    const st = this.ac?.state as string | undefined;
    if (this.ac && st !== "running" && st !== "closed") this.ac.resume().catch(() => {});
  }

  dispose() {
    this.disposed = true;
    this.timers.forEach((id) => clearTimeout(id));
    this.timers.clear();
    if (this.hum) this.hum.src.forEach((s) => { try { s.stop(); } catch { /* noop */ } });
    this.hum = null;
    const ac = this.ac;
    this.ac = null;
    this.master = null;
    if (ac) ac.close().catch(() => {});
  }
}
