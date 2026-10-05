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
