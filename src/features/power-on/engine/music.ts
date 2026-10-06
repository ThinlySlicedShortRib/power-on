// Live background music: one small, cheerful generative track per era (major keys, 110–132 BPM).
// A lookahead scheduler (25 ms timer, 150 ms horizon) queues 16th-note steps against AudioContext time;
// era changes crossfade over ~2 s. All patterns are original.
import type { AudioEngine } from "./sfx";
import { clamp } from "./env";
import { KEYS, load, save } from "./storage";

interface Track { n: number; gain: GainNode; out: GainNode; next: number; step: number; bar: number; dying: number }
interface NoteOpts { type?: OscillatorType; g?: number; a?: number; r?: number; sus?: number; detune?: number; slide?: number; lp?: number; lpEnv?: number; q?: number; rev?: number; len?: number; root?: number }
interface NoiseOpts { ft?: BiquadFilterType; f?: number; q?: number; g?: number; rev?: number }
type Chord = [number, number, number];
type Mel = (number | null)[];
interface TrackDef { bpm: number; step(m: Music, tr: Track, s: number, t: number, bar: number, sd: number): void }

const _ = null;
const mtof = (m: number) => 440 * Math.pow(2, (m - 69) / 12);
const chordAt = (prog: Chord[], bar: number) => prog[Math.floor(bar / 2) % prog.length];

function mel8(m: Music, tr: Track, arr: Mel, s: number, t: number, sd: number, o: NoteOpts & { root: number }) {
  if (s % 2) return;
  const v = arr[s / 2];
  if (v != null) m.note(tr, mtof(o.root + v), t, sd * (o.len ?? 1.6), o);
}

function makeTracks(): Record<number, TrackDef> {
  const t1 = { root: 72, prog: [[48, 4, 7], [53, 4, 7], [55, 4, 7], [48, 4, 7]] as Chord[],
    call: [[0, 4, 7, _, 12, _, 7, _], [_, _, _, _, 9, 7, 4, 2], [5, 9, 12, _, 14, _, 12, _], [11, 7, 4, 7, 12, _, _, _]] as Mel[],
    fill: [12, 11, 9, 7, 5, 4, 2, _] as Mel };
  const t2 = { root: 67, prog: [[55, 4, 7], [48, 4, 7], [50, 4, 7], [55, 4, 7], [52, 3, 7], [48, 4, 7], [50, 4, 7], [50, 4, 7]] as Chord[],
    lead: [[7, _, 4, 7, 12, _, 11, 9], [7, _, 4, 2, 0, _, 2, 4], [2, _, 6, 9, 14, 12, 9, 6], [7, 4, 0, 4, 7, _, _, _],
      [11, _, 7, 4, 11, 12, 11, 7], [9, _, 4, 9, 12, _, 9, 7], [6, 9, 14, 9, 6, 2, 6, 9], [12, 11, 9, 7, 6, 4, 2, _]] as Mel[] };
  const t3 = { root: 74, prog: [[50, 4, 7], [57, 4, 7], [59, 3, 7], [55, 4, 7]] as Chord[],
    hookA: [9, _, 7, 9, _, 4, _, 2] as Mel, hookB: [4, _, 2, 4, 7, _, 9, _] as Mel, fill: [14, 12, 9, 7, 4, 2, 0, _] as Mel };
  const t4 = { root: 77, prog: [[53, 4, 7], [57, 3, 7], [58, 4, 7], [60, 4, 7]] as Chord[],
    tune: [[12, _, _, 14, 16, _, 12, _], [9, _, _, _, 7, 9, 12, _], [10, _, 9, 7, 5, _, 7, _], [9, _, _, _, _, _, 4, 7]] as Mel[] };
  const t5 = { root: 69, prog: [[57, 4, 7], [52, 4, 7], [54, 3, 7], [50, 4, 7]] as Chord[], plk: [0, 3, 6, 8, 11, 14] };
  const t6 = { root: 76, pent: [0, 2, 4, 7, 9], deg: 5, prog: [[52, 4, 7], [57, 4, 7], [52, 4, 7], [59, 4, 7]] as Chord[] };
  return {
    // C F G C · bright "computer lab" bleeps
    1: { bpm: 124, step(m, tr, s, t, bar, sd) {
      const c = chordAt(t1.prog, bar), r = c[0], mm = bar % 8 === 7 ? t1.fill : t1.call[bar % 4];
      mel8(m, tr, mm, s, t, sd, { root: t1.root, type: "square", g: 0.028, r: 0.03, len: 1.2 });
      m.note(tr, mtof(r + 24 + [0, c[1], c[2], 12][s % 4]), t, sd * 0.7, { type: "square", g: 0.011, r: 0.02 });
      if (s % 4 === 0) m.note(tr, mtof(r - 12 + (s % 8 ? 7 : 0)), t, sd * 1.5, { type: "square", g: 0.05, lp: 900, r: 0.03 });
      if (s % 4 === 2) m.noise(tr, t, 0.025, { f: 9000, g: 0.02 });
      if (s === 0 || s === 8) m.kick(tr, t, 0.25, "square");
    } },
    // G C D G | Em C D D · chiptune homepage
    2: { bpm: 132, step(m, tr, s, t, bar, sd) {
      const c = t2.prog[bar % 8], r = c[0];
      mel8(m, tr, t2.lead[bar % 8], s, t, sd, { root: t2.root, type: "square", g: 0.03, r: 0.04, len: 1.5 });
      if (s % 2 === 0) m.note(tr, mtof(r - 12 + [0, 7, 12, 7][(s / 2) % 4]), t, sd * 1.6, { type: "triangle", g: 0.13, r: 0.02 });
      if (s === 0 || s === 6 || s === 8) m.kick(tr, t, 0.3, "square");
      if (s === 4 || s === 12 || (bar % 8 === 7 && s >= 12)) m.noise(tr, t, 0.1, { ft: "bandpass", f: 2600, g: 0.08 });
      if (s % 2 === 0) m.noise(tr, t, 0.025, { f: 9500, g: 0.02 });
    } },
    // D A Bm G · bubblegum pop
    3: { bpm: 120, step(m, tr, s, t, bar, sd) {
      const c = chordAt(t3.prog, bar), r = c[0], b4 = bar % 4, mm = bar % 8 === 7 ? t3.fill : (b4 % 2 ? t3.hookB : t3.hookA);
      mel8(m, tr, mm, s, t, sd, { root: t3.root, type: "triangle", g: 0.05, r: 0.12, len: 1.3, rev: 0.2 });
      if (s % 4 === 2) [0, c[1], c[2]].forEach((iv) => m.note(tr, mtof(r + 12 + iv), t, sd * 0.8, { type: "sawtooth", g: 0.012, lp: 4000, lpEnv: 0.25, r: 0.03 }));
      if (s % 2 === 0) m.note(tr, mtof(r - 12 + (s % 4 ? 12 : 0)), t, sd * 1.4, { type: "sawtooth", g: 0.05, lp: 900, lpEnv: 0.5 });
      if (s % 4 === 0) m.kick(tr, t, 0.45);
      if (s === 4 || s === 12) { m.noise(tr, t, 0.12, { ft: "bandpass", f: 1600, g: 0.1, rev: 0.3 }); m.noise(tr, t + 0.012, 0.1, { ft: "bandpass", f: 1900, g: 0.07 }); }
      if (s % 4 === 2) m.noise(tr, t, 0.05, { f: 8500, g: 0.03 });
    } },
    // F Am Bb C · indie-electro with a whistle
    4: { bpm: 118, step(m, tr, s, t, bar, sd) {
      const c = chordAt(t4.prog, bar), r = c[0];
      if (bar % 8 < 4) mel8(m, tr, t4.tune[bar % 4], s, t, sd, { root: t4.root, type: "sine", g: 0.045, a: 0.03, r: 0.1, len: 1.8, slide: -40, rev: 0.3 });
      else if (s % 2 === 0) m.note(tr, mtof(r + 24 + [0, c[1], c[2], c[1]][(s / 2) % 4]), t, sd, { type: "square", g: 0.014, r: 0.03 });
      if (s % 4 === 0) m.kick(tr, t, 0.38);
      if (s === 4 || s === 12) m.noise(tr, t, 0.14, { ft: "bandpass", f: 1400, g: 0.09, rev: 0.35 });
      if (s % 2 === 1) m.noise(tr, t, 0.02, { f: 10000, g: 0.012 });
      if (s === 0 || s === 3 || s === 8 || s === 11) m.note(tr, mtof(r - 12), t, sd * 1.8, { type: "sine", g: 0.15, r: 0.05 });
    } },
    // A E F#m D · bright modern pop
    5: { bpm: 124, step(m, tr, s, t, bar, sd) {
      const c = chordAt(t5.prog, bar), r = c[0], i = t5.plk.indexOf(s);
      if (i >= 0) m.note(tr, mtof(r + 12 + [12, c[2], c[1] + 12, 19, c[2] + 12, 12][i] + (bar % 4 === 3 && i > 3 ? 2 : 0)), t, 0.14, { type: "triangle", g: 0.045, r: 0.18, rev: 0.35 });
      if (s === 0 || s === 6 || s === 8 || s === 14) m.note(tr, mtof(r - 12), t, sd * 1.5, { type: "sine", g: 0.18, r: 0.05 });
      if (s % 4 === 0) m.kick(tr, t, 0.35);
      if (s === 4 || s === 12) m.noise(tr, t, 0.12, { ft: "bandpass", f: 1700, g: 0.08, rev: 0.25 });
      m.noise(tr, t, 0.015, { f: 11000, g: s % 2 ? 0.008 : 0.014 });
    } },
    // E A E B · sparkly, curious
    6: { bpm: 110, step(m, tr, s, t, bar, sd) {
      const c = chordAt(t6.prog, bar), r = c[0];
      if (s % 2 === 0 && Math.random() < 0.78) {
        t6.deg = clamp(t6.deg + [-1, -1, 1, 1, 2, -2, 0][Math.floor(Math.random() * 7)], 0, 12);
        const n = t6.root + Math.floor(t6.deg / 5) * 12 + t6.pent[t6.deg % 5] - 12;
        m.note(tr, mtof(n), t, 0.25, { type: "sine", g: 0.05, r: 0.35, rev: 0.45 });
        m.note(tr, mtof(n + 12), t, 0.12, { type: "sine", g: 0.012, r: 0.25 });
      }
      if (bar % 4 === 3 && s >= 8 && s % 2 === 0) m.note(tr, mtof(t6.root + 12 + t6.pent[(s - 8) / 2 + 1]), t, 0.1, { type: "triangle", g: 0.025, r: 0.2, rev: 0.6 });
      if (s === 0 || s === 8) m.note(tr, mtof(r - 12), t, sd * 6, { type: "triangle", g: 0.09, r: 0.2 });
      if (s === 0) m.kick(tr, t, 0.22);
      if (s % 2 === 1) m.noise(tr, t, 0.03, { f: 7000, g: 0.008 });
    } },
  };
}

export class Music {
  on: boolean;
  vol: number;
  started = false;
  private tracks: Track[] = [];
  private cur = 0;
  private timer = 0;
  private bus: GainNode | null = null;
  private duckG: GainNode | null = null;
  private rev: ConvolverNode | null = null;
  private noiseBuf: AudioBuffer | null = null;
  private defs = makeTracks();
  private stopTimer = 0;

  constructor(private audio: AudioEngine) {
    this.on = load(KEYS.music) !== "off";
    this.vol = clamp(Number(load(KEYS.mvol) ?? 30) / 100);
    if (Number.isNaN(this.vol)) this.vol = 0.3;
  }

  private graph(): AudioContext | null {
    const ac = this.audio.ensure();
    if (!ac || !this.audio.master) return null;
    if (this.bus) return ac;
    this.bus = ac.createGain();
    this.bus.gain.value = 0;
    this.duckG = ac.createGain();
    this.duckG.gain.value = 1;
    const comp = ac.createDynamicsCompressor();
    comp.threshold.value = -18;
    comp.ratio.value = 4;
    comp.attack.value = 0.01;
    comp.release.value = 0.25;
    this.rev = ac.createConvolver();
    const len = Math.floor(ac.sampleRate * 2.4), ir = ac.createBuffer(2, len, ac.sampleRate);
    for (let ch = 0; ch < 2; ch++) { const d = ir.getChannelData(ch); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.6); }
    this.rev.buffer = ir;
    const revOut = ac.createGain();
    revOut.gain.value = 0.35;
    this.bus.connect(this.duckG);
    this.duckG.connect(comp);
    this.rev.connect(revOut);
    revOut.connect(this.duckG);
    comp.connect(this.audio.master);
    this.noiseBuf = this.audio.noise(1);
    return ac;
  }

  note(tr: Track, f: number, t: number, dur: number, o: NoteOpts = {}) {
    const ac = this.audio.ac;
    if (!ac) return;
    const osc = ac.createOscillator(), g = ac.createGain();
    osc.type = o.type ?? "sine";
    osc.frequency.setValueAtTime(f, t);
    if (o.detune) osc.detune.value = o.detune;
    if (o.slide) { osc.detune.setValueAtTime(o.slide, t); osc.detune.linearRampToValueAtTime(0, t + 0.07); }
    const a = o.a ?? 0.005, r = o.r ?? 0.08, pk = o.g ?? 0.1;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(pk, t + a);
    g.gain.setTargetAtTime(o.sus != null ? pk * o.sus : 0, t + a, Math.max(0.01, dur / 3));
    g.gain.setTargetAtTime(0, t + dur, r);
    if (o.lp) {
      const lp = ac.createBiquadFilter();
      lp.type = "lowpass";
      lp.frequency.setValueAtTime(o.lp, t);
      if (o.lpEnv) lp.frequency.exponentialRampToValueAtTime(Math.max(80, o.lp * o.lpEnv), t + dur);
      lp.Q.value = o.q ?? 0.8;
      osc.connect(lp);
      lp.connect(g);
    } else osc.connect(g);
    g.connect(tr.out);
    if (o.rev && this.rev) { const s = ac.createGain(); s.gain.value = o.rev; g.connect(s); s.connect(this.rev); }
    osc.start(t);
    osc.stop(t + dur + r * 6 + 0.05);
  }

  noise(tr: Track, t: number, dur: number, o: NoiseOpts) {
    const ac = this.audio.ac;
    if (!ac || !this.noiseBuf) return;
    const src = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain();
    src.buffer = this.noiseBuf;
    f.type = o.ft ?? "highpass";
    f.frequency.value = o.f ?? 7000;
    f.Q.value = o.q ?? 0.7;
    g.gain.setValueAtTime(o.g ?? 0.05, t);
    g.gain.exponentialRampToValueAtTime(0.0008, t + dur);
    src.connect(f);
    f.connect(g);
    g.connect(tr.out);
    if (o.rev && this.rev) { const s = ac.createGain(); s.gain.value = o.rev; g.connect(s); s.connect(this.rev); }
    src.start(t, Math.random() * 0.5);
    src.stop(t + dur + 0.02);
  }

  kick(tr: Track, t: number, g = 0.5, type: OscillatorType = "sine") {
    const ac = this.audio.ac;
    if (!ac) return;
    const o = ac.createOscillator(), e = ac.createGain();
    o.type = type;
    o.frequency.setValueAtTime(type === "square" ? 220 : 140, t);
    o.frequency.exponentialRampToValueAtTime(type === "square" ? 55 : 42, t + 0.12);
    e.gain.setValueAtTime(g, t);
    e.gain.exponentialRampToValueAtTime(0.001, t + (type === "square" ? 0.1 : 0.32));
    o.connect(e);
    e.connect(tr.out);
    o.start(t);
    o.stop(t + 0.4);
  }

  private track(n: number): Track {
    const ac = this.audio.ac!;
    const g = ac.createGain(), out = ac.createGain();
    g.gain.value = 0;
    out.connect(g);
    g.connect(this.bus!);
    g.gain.setValueAtTime(0, ac.currentTime);
    g.gain.linearRampToValueAtTime(1, ac.currentTime + 2);
    return { n, gain: g, out, next: ac.currentTime + 0.1, step: 0, bar: 0, dying: 0 };
  }

  private tick = () => {
    const ac = this.audio.ac;
    if (!ac || ac.state !== "running") return;
    const horizon = ac.currentTime + 0.15;
    this.tracks = this.tracks.filter((tr) => {
      if (tr.dying && ac.currentTime > tr.dying) { tr.gain.disconnect(); return false; }
      return true;
    });
    for (const tr of this.tracks) {
      const def = this.defs[tr.n], sd = 60 / def.bpm / 4;
      while (tr.next < horizon) {
        def.step(this, tr, tr.step, tr.next, tr.bar, sd);
        tr.next += sd;
        tr.step = (tr.step + 1) % 16;
        if (!tr.step) tr.bar++;
      }
    }
  };

  applyLevel(sec = 0.25) {
    const ac = this.audio.ac;
    if (!this.bus || !ac) return;
    const on = this.on && this.audio.soundOn && this.started;
    this.bus.gain.setTargetAtTime(on ? this.vol * 0.9 : 0, ac.currentTime, sec);
  }

  era(n: number) {
    if (!this.started || !this.graph() || this.cur === n) return;
    const ac = this.audio.ac!, now = ac.currentTime;
    for (const tr of this.tracks) {
      if (tr.dying) continue;
      tr.gain.gain.cancelScheduledValues(now);
      tr.gain.gain.setValueAtTime(tr.gain.gain.value, now);
      tr.gain.gain.linearRampToValueAtTime(0, now + 2);
      tr.dying = now + 2.2;
    }
    this.tracks.push(this.track(n));
    this.cur = n;
  }

  start(n: number) {
    if (!this.graph()) return;
    clearTimeout(this.stopTimer);
    this.started = true;
    this.applyLevel(1.5);
    if (!this.timer) this.timer = window.setInterval(this.tick, 25);
    this.era(n || 1);
  }

  stop() {
    if (!this.bus || !this.audio.ac) return;
    this.started = false;
    this.applyLevel(0.3);
    clearInterval(this.timer);
    this.timer = 0;
    const now = this.audio.ac.currentTime;
    for (const tr of this.tracks) { tr.gain.gain.setTargetAtTime(0, now, 0.2); tr.dying = now + 0.8; }
    this.cur = 0;
    const dying = this.tracks;
    this.tracks = [];
    this.stopTimer = window.setTimeout(() => dying.forEach((tr) => tr.gain.disconnect()), 900);
  }

  /** dip the music (e.g. under the modem handshake) */
  duck(sec: number) {
    const ac = this.audio.ac;
    if (!this.duckG || !ac) return;
    const now = ac.currentTime;
    this.duckG.gain.cancelScheduledValues(now);
    this.duckG.gain.setTargetAtTime(0.5, now, 0.15);
    this.duckG.gain.setTargetAtTime(1, now + sec, 0.6);
  }

  setOn(on: boolean) {
    this.on = on;
    save(KEYS.music, on ? "on" : "off");
  }

  setVolume(v: number) {
    this.vol = clamp(v / 100);
    save(KEYS.mvol, String(v));
    this.applyLevel(0.08);
  }

  dispose() {
    clearInterval(this.timer);
    clearTimeout(this.stopTimer);
    this.timer = 0;
    this.tracks.forEach((tr) => { try { tr.gain.disconnect(); } catch { /* noop */ } });
    this.tracks = [];
  }
}
