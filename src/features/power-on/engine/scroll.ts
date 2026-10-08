// A tall invisible scroll track drives the story: one segment per narration line (plus the era title card),
// a long transition segment between eras, and a closing segment. Clicks, keys and scroll all move window.scrollY.
import { clamp, ease2 } from "./env";

export const BEATU = 0.72, TRANSU = 2.6, FINU = 1.9;

export type Seg =
  | { k: "beat"; e: number; b: number; s: number; l: number; o: number }
  | { k: "trans"; e: number; s: number; l: number }
  | { k: "fin"; e: number; s: number; l: number };

export class ScrollTrack {
  segs: Seg[] = [];
  total = 0;
  vh = 1;
  private anim: { idx: number; raf: number } | null = null;

  constructor(private eraLineCounts: number[]) {}

  build(vh: number): number {
    this.vh = vh;
    this.segs = [];
    let u = 0, order = 0;
    this.eraLineCounts.forEach((count, ei) => {
      for (let b = -1; b < count; b++) { this.segs.push({ k: "beat", e: ei, b, s: u, l: BEATU, o: order++ }); u += BEATU; }
      if (ei < this.eraLineCounts.length - 1) { this.segs.push({ k: "trans", e: ei, s: u, l: TRANSU }); u += TRANSU; }
      else { this.segs.push({ k: "fin", e: ei, s: u, l: FINU }); u += FINU; }
    });
    this.total = u;
    return Math.ceil(this.total * vh + innerHeight);
  }

  /** current segment + progress through it */
  at(scrollY: number): { seg: Seg; p: number; i: number } {
    const y = scrollY / this.vh;
    let i = this.segs.length - 1;
    for (let j = 0; j < this.segs.length; j++) if (y < this.segs[j].s + this.segs[j].l) { i = j; break; }
    const seg = this.segs[i];
    return { seg, p: clamp((y - seg.s) / seg.l), i };
  }

  /** scroll position that shows a given beat */
  yFor(era: number, beat: number): number {
    const s = this.segs.find((x) => x.k === "beat" && x.e === era && x.b === beat);
    return s ? (s.s + s.l * 0.35) * this.vh : 0;
  }

  cancel() {
    if (this.anim) { cancelAnimationFrame(this.anim.raf); this.anim = null; }
  }

  private animate(target: number, dur: number, idx: number) {
    this.cancel();
    if (!dur) { window.scrollTo(0, target); return; }
    const from = window.scrollY, t0 = performance.now(), a = { idx, raf: 0 };
    this.anim = a;
    const step = (now: number) => {
      if (this.anim !== a) return;
      const k = Math.min(1, (now - t0) / dur);
      window.scrollTo(0, from + (target - from) * ease2(k));
      if (k < 1) a.raf = requestAnimationFrame(step); else this.anim = null;
    };
    a.raf = requestAnimationFrame(step);
  }

  /**
   * Go to an era's title card from anywhere. Gliding there would replay every line and transition in between,
   * so cut into the middle of the transition that leads into the era (its year card) and glide the rest of the way.
   * Era 1 has no transition before it, and reduced motion cuts straight to the card.
   */
  jump(era: number, reduce: boolean): boolean {
    const j = this.segs.findIndex((x) => x.k === "beat" && x.e === era && x.b === -1);
    if (j < 0 || (!this.anim && this.at(window.scrollY).i === j)) return false;
    const into = this.segs[j - 1], target = this.yFor(era, -1);
    const glide = !reduce && into?.k === "trans";
    this.cancel();
    if (glide) window.scrollTo(0, (into.s + into.l * 0.52) * this.vh);
    this.animate(target, glide ? 1900 : 0, j);
    return true;
  }

  /** Move one line forward/back, skipping over transitions (which then play as a long glide). */
  advance(dir: 1 | -1, reduce: boolean): boolean {
    if (!this.segs.length) return false;
    const i = this.anim ? this.anim.idx : this.at(window.scrollY).i;
    let j = i + dir;
    while (this.segs[j] && this.segs[j].k === "trans") j += dir;
    const sj = this.segs[j];
    if (!sj) return false;
    const target = (sj.k === "fin" ? sj.s + sj.l * 0.95 : sj.s + sj.l * 0.35) * this.vh;
    const far = Math.abs(j - i) > 1 || sj.k === "fin" || this.segs[i].k === "trans";
    this.animate(target, reduce ? 0 : far ? 2800 : 420, j);
    return true;
  }
}
