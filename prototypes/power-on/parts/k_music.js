// ================= v8: LIVE BACKGROUND MUSIC (WebAudio, original patterns) =================
// Each era is a small, cheerful generative track (major keys, 110–132 BPM). A lookahead scheduler (25 ms timer, 150 ms horizon)
// queues 16th-note steps against AudioContext time; era changes crossfade over ~2 s.
var MUS = { on: store("poweron.music") !== "off", vol: clamp(+(store("poweron.mvol") || 30) / 100), started: false, tracks: [], cur: 0, timer: 0, notes: 0, log: [] };
function mtof(m) { return 440 * Math.pow(2, (m - 69) / 12); }
function musGraph() {
  var ac = audio(); if (!ac) return null; if (MUS.bus) return ac;
  MUS.bus = ac.createGain(); MUS.bus.gain.value = 0;
  MUS.duck = ac.createGain(); MUS.duck.gain.value = 1;
  MUS.comp = ac.createDynamicsCompressor(); MUS.comp.threshold.value = -18; MUS.comp.ratio.value = 4; MUS.comp.attack.value = .01; MUS.comp.release.value = .25;
  MUS.rev = ac.createConvolver(); var len = ac.sampleRate * 2.4, ir = ac.createBuffer(2, len, ac.sampleRate);
  for (var ch = 0; ch < 2; ch++) { var d = ir.getChannelData(ch); for (var i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.6); }
  MUS.rev.buffer = ir; MUS.revOut = ac.createGain(); MUS.revOut.gain.value = .35;
  MUS.bus.connect(MUS.duck); MUS.duck.connect(MUS.comp); MUS.rev.connect(MUS.revOut); MUS.revOut.connect(MUS.duck); MUS.comp.connect(master);
  MUS.noise = noiseBuf(ac, 1);
  return ac;
}
// --- voices (each creates a few short-lived nodes; cheap)
function vNote(tr, f, t, dur, o) {
  o = o || {}; var ac = AC, osc = ac.createOscillator(), g = ac.createGain(), out = g;
  osc.type = o.type || "sine"; osc.frequency.setValueAtTime(f, t); if (o.detune) osc.detune.value = o.detune;
  if (o.slide) { osc.detune.setValueAtTime(o.slide, t); osc.detune.linearRampToValueAtTime(0, t + .07); }
  var a = o.a || .005, r = o.r || .08, pk = o.g || .1;
  g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(pk, t + a); g.gain.setTargetAtTime(o.sus != null ? pk * o.sus : 0, t + a, Math.max(.01, dur / 3)); g.gain.setTargetAtTime(0, t + dur, r);
  if (o.lp) { var lp = ac.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.setValueAtTime(o.lp, t); if (o.lpEnv) lp.frequency.exponentialRampToValueAtTime(Math.max(80, o.lp * o.lpEnv), t + dur); lp.Q.value = o.q || .8; osc.connect(lp); lp.connect(g); } else osc.connect(g);
  g.connect(tr.out); if (o.rev) { var s = ac.createGain(); s.gain.value = o.rev; g.connect(s); s.connect(MUS.rev); }
  osc.start(t); osc.stop(t + dur + r * 6 + .05); MUS.notes++;
}
function vNoise(tr, t, dur, o) {
  var ac = AC, src = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain();
  src.buffer = MUS.noise; f.type = o.ft || "highpass"; f.frequency.value = o.f || 7000; f.Q.value = o.q || .7;
  g.gain.setValueAtTime(o.g || .05, t); g.gain.exponentialRampToValueAtTime(.0008, t + dur);
  src.connect(f); f.connect(g); g.connect(tr.out); if (o.rev) { var s = ac.createGain(); s.gain.value = o.rev; g.connect(s); s.connect(MUS.rev); }
  src.start(t, Math.random() * .5); src.stop(t + dur + .02); MUS.notes++;
}
function vKick(tr, t, g, type) {
  var ac = AC, o = ac.createOscillator(), e = ac.createGain(); o.type = type || "sine";
  o.frequency.setValueAtTime(type === "square" ? 220 : 140, t); o.frequency.exponentialRampToValueAtTime(type === "square" ? 55 : 42, t + .12);
  e.gain.setValueAtTime(g || .5, t); e.gain.exponentialRampToValueAtTime(.001, t + (type === "square" ? .1 : .32));
  o.connect(e); e.connect(tr.out); o.start(t); o.stop(t + .4); MUS.notes++;
}
// chord tables: [root midi, minor/major third offset, fifth, seventh]
function chordAt(prog, bar) { return prog[Math.floor(bar / 2) % prog.length]; }
// chords: [root midi, third, fifth] (+ optional extra). Melodies: 8 eighth-notes per bar, null = rest,
// values are semitones above the track's key root. All patterns are original.
var _ = null;
function mel8(tr, arr, s, t, sd, o) { if (s % 2) return; var v = arr[s / 2]; if (v != null) vNote(tr, mtof(o.root + v), t, sd * (o.len || 1.6), o); }
var TRACKS = {
  1: { bpm: 124, root: 72, prog: [[48, 4, 7], [53, 4, 7], [55, 4, 7], [48, 4, 7]],   // C  F  G  C · bright "computer lab" bleeps
    call: [[0, 4, 7, _, 12, _, 7, _], [_, _, _, _, 9, 7, 4, 2], [5, 9, 12, _, 14, _, 12, _], [11, 7, 4, 7, 12, _, _, _]],
    fill: [12, 11, 9, 7, 5, 4, 2, _],
    step: function (tr, s, t, bar, sd) { var c = chordAt(this.prog, bar), r = c[0], m = bar % 8 === 7 ? this.fill : this.call[bar % 4];
      mel8(tr, m, s, t, sd, { root: this.root, type: "square", g: .028, r: .03, len: 1.2 });
      vNote(tr, mtof(r + 24 + [0, c[1], c[2], 12][s % 4]), t, sd * .7, { type: "square", g: .011, r: .02 });      // sparkly 16th arp
      if (s % 4 === 0) vNote(tr, mtof(r - 12 + (s % 8 ? 7 : 0)), t, sd * 1.5, { type: "square", g: .05, lp: 900, r: .03 });
      if (s % 4 === 2) vNoise(tr, t, .025, { f: 9000, g: .02 });
      if (s === 0 || s === 8) vKick(tr, t, .25, "square"); } },
  2: { bpm: 132, root: 67, prog: [[55, 4, 7], [48, 4, 7], [50, 4, 7], [55, 4, 7], [52, 3, 7], [48, 4, 7], [50, 4, 7], [50, 4, 7]],   // G C D G | Em C D D
    lead: [[7, _, 4, 7, 12, _, 11, 9], [7, _, 4, 2, 0, _, 2, 4], [2, _, 6, 9, 14, 12, 9, 6], [7, 4, 0, 4, 7, _, _, _],
           [11, _, 7, 4, 11, 12, 11, 7], [9, _, 4, 9, 12, _, 9, 7], [6, 9, 14, 9, 6, 2, 6, 9], [12, 11, 9, 7, 6, 4, 2, _]],
    step: function (tr, s, t, bar, sd) { var c = this.prog[bar % 8], r = c[0];
      mel8(tr, this.lead[bar % 8], s, t, sd, { root: this.root, type: "square", g: .03, r: .04, len: 1.5 });
      if (s % 2 === 0) vNote(tr, mtof(r - 12 + [0, 7, 12, 7][(s / 2) % 4]), t, sd * 1.6, { type: "triangle", g: .13, r: .02 });
      if (s === 0 || s === 6 || s === 8) vKick(tr, t, .3, "square");
      if (s === 4 || s === 12 || (bar % 8 === 7 && s >= 12)) vNoise(tr, t, .1, { ft: "bandpass", f: 2600, g: .08 });
      if (s % 2 === 0) vNoise(tr, t, .025, { f: 9500, g: .02 }); } },
  3: { bpm: 120, root: 74, prog: [[50, 4, 7], [57, 4, 7], [59, 3, 7], [55, 4, 7]],   // D  A  Bm  G · bubblegum pop
    hookA: [9, _, 7, 9, _, 4, _, 2], hookB: [4, _, 2, 4, 7, _, 9, _], fill: [14, 12, 9, 7, 4, 2, 0, _],
    step: function (tr, s, t, bar, sd) { var c = chordAt(this.prog, bar), r = c[0], b4 = bar % 4, m = bar % 8 === 7 ? this.fill : (b4 % 2 ? this.hookB : this.hookA);
      mel8(tr, m, s, t, sd, { root: this.root, type: "triangle", g: .05, r: .12, len: 1.3, rev: .2 });
      if (s % 4 === 2) [0, c[1], c[2]].forEach(function (iv) { vNote(tr, mtof(r + 12 + iv), t, sd * .8, { type: "sawtooth", g: .012, lp: 4000, lpEnv: .25, r: .03 }); });   // off-beat stabs
      if (s % 2 === 0) vNote(tr, mtof(r - 12 + (s % 4 ? 12 : 0)), t, sd * 1.4, { type: "sawtooth", g: .05, lp: 900, lpEnv: .5 });
      if (s % 4 === 0) vKick(tr, t, .45);
      if (s === 4 || s === 12) { vNoise(tr, t, .12, { ft: "bandpass", f: 1600, g: .1, rev: .3 }); vNoise(tr, t + .012, .1, { ft: "bandpass", f: 1900, g: .07 }); }   // handclap
      if (s % 4 === 2) vNoise(tr, t, .05, { f: 8500, g: .03 }); } },
  4: { bpm: 118, root: 77, prog: [[53, 4, 7], [57, 3, 7], [58, 4, 7], [60, 4, 7]],   // F  Am  Bb  C · indie-electro with a whistle
    tune: [[12, _, _, 14, 16, _, 12, _], [9, _, _, _, 7, 9, 12, _], [10, _, 9, 7, 5, _, 7, _], [9, _, _, _, _, _, 4, 7]],
    step: function (tr, s, t, bar, sd) { var c = chordAt(this.prog, bar), r = c[0];
      if (bar % 8 < 4) mel8(tr, this.tune[bar % 4], s, t, sd, { root: this.root, type: "sine", g: .045, a: .03, r: .1, len: 1.8, slide: -40, rev: .3 });   // whistle
      else if (s % 2 === 0) vNote(tr, mtof(r + 24 + [0, c[1], c[2], c[1]][(s / 2) % 4]), t, sd, { type: "square", g: .014, r: .03 });                       // chip-pop answer
      if (s % 4 === 0) vKick(tr, t, .38);
      if (s === 4 || s === 12) vNoise(tr, t, .14, { ft: "bandpass", f: 1400, g: .09, rev: .35 });
      if (s % 2 === 1) vNoise(tr, t, .02, { f: 10000, g: .012 });
      if (s === 0 || s === 3 || s === 8 || s === 11) vNote(tr, mtof(r - 12), t, sd * 1.8, { type: "sine", g: .15, r: .05 }); } },
  5: { bpm: 124, root: 69, prog: [[57, 4, 7], [52, 4, 7], [54, 3, 7], [50, 4, 7]],   // A  E  F#m  D · bright modern pop
    plk: [0, 3, 6, 8, 11, 14],
    step: function (tr, s, t, bar, sd) { var c = chordAt(this.prog, bar), r = c[0], i = this.plk.indexOf(s);
      if (i >= 0) vNote(tr, mtof(r + 12 + [12, c[2], c[1] + 12, 19, c[2] + 12, 12][i] + (bar % 4 === 3 && i > 3 ? 2 : 0)), t, .14, { type: "triangle", g: .045, r: .18, rev: .35 });
      if (s === 0 || s === 6 || s === 8 || s === 14) vNote(tr, mtof(r - 12), t, sd * 1.5, { type: "sine", g: .18, r: .05 });
      if (s % 4 === 0) vKick(tr, t, .35);
      if (s === 4 || s === 12) vNoise(tr, t, .12, { ft: "bandpass", f: 1700, g: .08, rev: .25 });
      vNoise(tr, t, .015, { f: 11000, g: s % 2 ? .008 : .014 }); } },
  6: { bpm: 110, root: 76, pent: [0, 2, 4, 7, 9], deg: 5, prog: [[52, 4, 7], [57, 4, 7], [52, 4, 7], [59, 4, 7]],   // E  A  E  B · sparkly, curious
    step: function (tr, s, t, bar, sd) { var self = this, c = chordAt(this.prog, bar), r = c[0];
      if (s % 2 === 0 && Math.random() < .78) {
        self.deg = clamp(self.deg + [-1, -1, 1, 1, 2, -2, 0][Math.floor(Math.random() * 7)], 0, 12);
        var m = self.root + Math.floor(self.deg / 5) * 12 + self.pent[self.deg % 5] - 12;
        vNote(tr, mtof(m), t, .25, { type: "sine", g: .05, r: .35, rev: .45 }); vNote(tr, mtof(m + 12), t, .12, { type: "sine", g: .012, r: .25 });   // bell + partial
      }
      if (bar % 4 === 3 && s >= 8 && s % 2 === 0) vNote(tr, mtof(self.root + 12 + self.pent[(s - 8) / 2 + 1]), t, .1, { type: "triangle", g: .025, r: .2, rev: .6 });   // little upward flourish
      if (s === 0 || s === 8) vNote(tr, mtof(r - 12), t, sd * 6, { type: "triangle", g: .09, r: .2 });
      if (s === 0) vKick(tr, t, .22);
      if (s % 2 === 1) vNoise(tr, t, .03, { f: 7000, g: .008 }); } }
};
function musTrack(n) {
  var ac = AC, g = ac.createGain(), out = ac.createGain(); g.gain.value = 0; out.connect(g); g.connect(MUS.bus);
  var tr = { n: n, gain: g, out: out, level: 1, next: ac.currentTime + .1, step: 0, bar: 0, dying: 0 };
  g.gain.setValueAtTime(0, ac.currentTime); g.gain.linearRampToValueAtTime(1, ac.currentTime + 2);
  return tr;
}
function musTick() {
  var ac = AC; if (!ac || ac.state !== "running") return;
  var horizon = ac.currentTime + .15;
  MUS.tracks = MUS.tracks.filter(function (tr) { if (tr.dying && ac.currentTime > tr.dying) { tr.gain.disconnect(); return false; } return true; });
  MUS.tracks.forEach(function (tr) { var def = TRACKS[tr.n], sd = 60 / def.bpm / 4;
    while (tr.next < horizon) { def.step(tr, tr.step, tr.next, tr.bar, sd); tr.next += sd; tr.step = (tr.step + 1) % 16; if (!tr.step) tr.bar++; } });
}
function musApplyLevel(sec) { if (!MUS.bus) return; var on = MUS.on && soundOn && MUS.started; MUS.bus.gain.setTargetAtTime(on ? MUS.vol * .9 : 0, AC.currentTime, sec || .25); }
function musEra(n) {
  if (!MUS.started || !musGraph()) return; if (MUS.cur === n) return;
  var ac = AC, now = ac.currentTime;
  MUS.tracks.forEach(function (tr) { if (!tr.dying) { tr.gain.gain.cancelScheduledValues(now); tr.gain.gain.setValueAtTime(tr.gain.gain.value, now); tr.gain.gain.linearRampToValueAtTime(0, now + 2); tr.dying = now + 2.2; } });
  MUS.tracks.push(musTrack(n)); MUS.cur = n; MUS.log.push("era " + n + " @" + now.toFixed(2));
}
function musStart(n) {
  if (!musGraph()) return; MUS.started = true; musApplyLevel(1.5);
  if (!MUS.timer) MUS.timer = setInterval(musTick, 25);
  musEra(n || 1);
}
function musStop() {
  if (!MUS.bus) return; MUS.started = false; musApplyLevel(.3); clearInterval(MUS.timer); MUS.timer = 0;
  var now = AC.currentTime; MUS.tracks.forEach(function (tr) { tr.gain.gain.setTargetAtTime(0, now, .2); tr.dying = now + .8; }); MUS.cur = 0;
  setTimeout(function () { MUS.tracks.forEach(function (tr) { tr.gain.disconnect(); }); MUS.tracks = []; }, 900);
}
function musDuck(sec) { if (!MUS.duck) return; var now = AC.currentTime; MUS.duck.gain.cancelScheduledValues(now); MUS.duck.gain.setTargetAtTime(.5, now, .15); MUS.duck.gain.setTargetAtTime(1, now + sec, .6); }

// --- controls: sound / music / volume
(function () {
  var mb = $("#music"), vol = $("#mvol");
  function paint() { mb.setAttribute("aria-pressed", MUS.on); $("#musicLbl").textContent = MUS.on ? "Music on" : "Music off"; mb.classList.toggle("off", !MUS.on || !soundOn); vol.disabled = !soundOn || !MUS.on; }
  vol.value = Math.round(MUS.vol * 100); paint();
  mb.addEventListener("click", function () { audio(); MUS.on = !MUS.on; store("poweron.music", MUS.on ? "on" : "off");
    if (MUS.on && S.mode === "story" && !MUS.started) musStart(ERAS[Math.max(0, curEra)].n); musApplyLevel(); paint(); });
  vol.addEventListener("input", function () { MUS.vol = clamp(vol.value / 100); store("poweron.mvol", String(vol.value)); musApplyLevel(.08); });
  $("#sound").addEventListener("click", function () { setTimeout(function () { musApplyLevel(); paint(); }, 0); });
  document.addEventListener("visibilitychange", function () { if (!AC) return; if (document.hidden) AC.suspend(); else if (S.mode !== "intro" || humNodes) AC.resume(); });
})();
// hook music into the story: start after the boot sounds, follow the era, stop on power-off, duck under the modem
(function () {
  var _hand = handOver; handOver = function () { _hand(); setTimeout(function () { if (S.mode === "story") musStart(ERAS[Math.max(0, curEra)].n); }, 1800); };
  $("#again").addEventListener("click", musStop);
  var _setEra = setEra; setEra = function (ei) { _setEra(ei); if (MUS.started) musEra(ERAS[ei].n); };
  var _modem = modemSound; modemSound = function (cb) { musDuck(8.5); return _modem(cb); };
})();
