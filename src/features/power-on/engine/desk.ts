// The 3D desk: a dark room, a lamp, and one rig of hardware per era. The camera frames the desk on the intro,
// dives into the monitor on power-on, and pulls back between eras while the hardware swaps.
// Ported from the r128 prototype: colours are interpreted as linear (as r128 did) so the room keeps its look,
// and light intensities are rescaled for physically based lighting.
import {
  ACESFilmicToneMapping, AdditiveBlending, BoxGeometry, BufferAttribute, BufferGeometry, CanvasTexture, CircleGeometry, Color,
  ConeGeometry, CylinderGeometry, DirectionalLight, DoubleSide, EdgesGeometry, Fog, Group, HemisphereLight, IcosahedronGeometry,
  LineBasicMaterial, LineSegments, LinearSRGBColorSpace, MathUtils, Mesh, MeshBasicMaterial, MeshPhysicalMaterial, MeshStandardMaterial,
  type MeshStandardMaterialParameters, type Object3D, PCFShadowMap, PerspectiveCamera, PlaneGeometry, PointLight, Points, PointsMaterial,
  Raycaster, RepeatWrapping, SRGBColorSpace, Scene, SphereGeometry, SpotLight, TorusGeometry, Vector2, Vector3, WebGLRenderer, WireframeGeometry,
  type Material, type Texture,
} from "three";
import { ease } from "./env";
import type { FontStacks } from "./fonts";

/** Every string painted onto the 3D screens. Comes from story.desk.* messages. */
export interface DeskText {
  boot: string[]; sticky: string[]; e1: string[];
  e2Marquee: string; e2Title1: string; e2Title2: string; e2Links: string; e2Link1: string; e2Link2: string; e2Link3: string;
  e3Logo: string; e3Beta: string; e3Head: string; e3Sub1: string; e3Sub2: string; e3Cta: string; e3Tags: string[]; e3Badge: string;
  e4Logo: string; e4Head: string; e5Head: string; e5Sub: string; e5Phone: string; e6Intent: string; e6Head1: string; e6Head2: string;
}

interface Pose { p: Vector3; t: Vector3 }
interface ScreenTex { mesh: Mesh; c: HTMLCanvasElement; ctx: CanvasRenderingContext2D; tex: CanvasTexture; w: number; h: number; bulge: number }
interface Rig {
  g: Group; screen: ScreenTex; extra?: ScreenTex; light: number;
  power?: Mesh<CylinderGeometry, MeshStandardMaterial>; led?: Mesh<SphereGeometry, MeshBasicMaterial>;
  leds?: Mesh<SphereGeometry, MeshBasicMaterial>[]; globe?: Group; orb?: Mesh; halo?: Mesh;
  inPose: Pose; out: Pose; screenCenter: Vector3; noteTex?: { c: HTMLCanvasElement; ctx: CanvasRenderingContext2D; tex: CanvasTexture };
}

export type DeskMode = "intro" | "booting" | "story";

/** r128 treated hex colours as linear values; keep that so the palette matches the prototype. */
const lin = (hex: number) => new Color().setHex(hex, LinearSRGBColorSpace);
const PI = Math.PI;

export class Desk {
  readonly canvas: HTMLCanvasElement;
  private renderer: WebGLRenderer;
  private scene = new Scene();
  private camera: PerspectiveCamera;
  private rigs: Rig[] = [];
  private screenLight: PointLight;
  private dust: Points;
  private dpos: Float32Array;
  private dseed: Float32Array;
  private DN: number;
  private ray = new Raycaster();
  private ptr = new Vector2();
  private raf = 0;
  private lastNow = 0;
  private disposed = false;
  private lost = false;
  private textures: Texture[] = [];
  private tmp = new Vector3();

  mode: DeskMode = "intro";
  rigA = 0;
  rigB = -1;
  swapQ = 0;
  pose: Pose | null = null;
  /** render only while the DOM screen isn't fully covering the canvas */
  glNeeded = true;
  private powerT0 = 0;
  private bootFrom: Pose | null = null;
  private handed = false;
  onHandOver: (() => void) | null = null;
  onContextLost: (() => void) | null = null;

  constructor(host: HTMLElement, private text: DeskText, private fonts: FontStacks, private reduce: boolean) {
    const canvas = document.createElement("canvas");
    canvas.className = "po-gl";
    canvas.setAttribute("aria-hidden", "true");
    host.appendChild(canvas);
    this.canvas = canvas;
    const phone = innerWidth < 760;
    let renderer: WebGLRenderer;
    try {
      renderer = new WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" });
    } catch (e) {
      canvas.remove();
      throw e;
    }
    if (!renderer.getContext()) { renderer.dispose(); canvas.remove(); throw new Error("no webgl"); }
    this.renderer = renderer;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, phone ? 1.5 : 2));
    renderer.setSize(innerWidth, innerHeight, false);
    renderer.outputColorSpace = SRGBColorSpace;
    renderer.toneMapping = ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    renderer.shadowMap.enabled = !phone;
    renderer.shadowMap.type = PCFShadowMap;
    canvas.addEventListener("webglcontextlost", this.handleLost);

    const scene = this.scene;
    scene.background = new Color(0x0d0b09);
    scene.fog = new Fog(lin(0x0d0b09), 9, 20);
    this.camera = new PerspectiveCamera(38, innerWidth / innerHeight, 0.01, 60);

    const M = (c: number, r = 0.6, m = 0, extra: MeshStandardMaterialParameters = {}) =>
      new MeshStandardMaterial({ color: lin(c), roughness: r, metalness: m, ...extra });
    const box = (w: number, h: number, d: number, mat: Material, x: number, y: number, z: number, parent: Object3D = scene) => {
      const me = new Mesh(new BoxGeometry(w, h, d), mat);
      me.position.set(x, y, z);
      me.castShadow = me.receiveShadow = true;
      parent.add(me);
      return me;
    };
    const canvasTex = (w: number, h: number, draw?: (g: CanvasRenderingContext2D, w: number, h: number) => void) => {
      const c = document.createElement("canvas");
      c.width = w; c.height = h;
      const ctx = c.getContext("2d")!;
      draw?.(ctx, w, h);
      const tex = new CanvasTexture(c);
      tex.colorSpace = SRGBColorSpace;
      tex.anisotropy = 4;
      this.textures.push(tex);
      return { c, ctx, tex };
    };

    // --- room + desk
    const wood = canvasTex(1024, 256, (g, w, h) => {
      g.fillStyle = "#4a3120"; g.fillRect(0, 0, w, h);
      for (let i = 0; i < 160; i++) {
        g.strokeStyle = "rgba(" + (i % 2 ? "30,18,10" : "110,74,44") + "," + (0.08 + Math.random() * 0.12) + ")";
        g.lineWidth = 1 + Math.random() * 3;
        g.beginPath();
        const y = Math.random() * h;
        g.moveTo(0, y);
        for (let x = 0; x <= w; x += 32) g.lineTo(x, y + Math.sin(x / 90 + i) * 4);
        g.stroke();
      }
    });
    wood.tex.wrapS = wood.tex.wrapT = RepeatWrapping;
    wood.tex.repeat.set(2, 1);
    const deskMat = M(0xffffff, 0.62, 0, { map: wood.tex });
    box(7.2, 0.14, 3.3, deskMat, 0, -0.07, 0.1);
    box(7.2, 0.8, 0.1, deskMat, 0, -0.47, 1.72);
    const wall = new Mesh(new PlaneGeometry(40, 16), M(0x211a13, 0.95));
    wall.position.set(0, 4, -3.2); wall.receiveShadow = true; scene.add(wall);
    const floor = new Mesh(new PlaneGeometry(40, 40), M(0x120e0a, 1));
    floor.rotation.x = -PI / 2; floor.position.y = -1.7; scene.add(floor);

    // --- lamp
    const lampMat = M(0x2b2f2a, 0.45, 0.5), brass = M(0xb8873a, 0.35, 0.8);
    const rod = (a: Vector3, b: Vector3, r: number, mat: Material) => {
      const d = new Vector3().subVectors(b, a), me = new Mesh(new CylinderGeometry(r, r, d.length(), 12), mat);
      me.position.copy(a).add(b).multiplyScalar(0.5);
      me.quaternion.setFromUnitVectors(new Vector3(0, 1, 0), d.normalize());
      me.castShadow = true; scene.add(me);
    };
    const lb = new Vector3(-2.75, 0.04, -0.85), le = new Vector3(-2.45, 1.45, -0.9), lh = new Vector3(-1.75, 1.95, -0.55);
    const base = new Mesh(new CylinderGeometry(0.3, 0.34, 0.08, 32), lampMat);
    base.position.copy(lb); base.castShadow = true; scene.add(base);
    rod(lb, le, 0.03, brass); rod(le, lh, 0.03, brass);
    const shade = new Mesh(new ConeGeometry(0.32, 0.42, 32, 1, true), M(0x2f4a3a, 0.5, 0.3, { side: DoubleSide }));
    shade.position.copy(lh); shade.lookAt(-0.2, -0.6, 0.4); shade.rotateX(-PI / 2); scene.add(shade);
    const bulb = new Mesh(new SphereGeometry(0.09, 16, 12), new MeshBasicMaterial({ color: lin(0xffe3a8) }));
    bulb.position.copy(lh).add(new Vector3(0.04, -0.12, 0.04)); scene.add(bulb);
    // physically based falloff (1/d^decay) is steeper than r128's legacy curve: intensities retuned to match the old frames
    const spot = new SpotLight(lin(0xffd29a), 2.4 * PI * 2.2, 14, 0.78, 0.65, 1.4);
    spot.position.copy(bulb.position); spot.target.position.set(-0.1, 0, 0.35);
    spot.castShadow = !phone; spot.shadow.mapSize.set(1024, 1024); spot.shadow.bias = -0.0004; spot.shadow.radius = 3;
    scene.add(spot); scene.add(spot.target);
    scene.add(new HemisphereLight(lin(0x5c6890), lin(0x1a120a), 0.45 * PI));
    const rim = new DirectionalLight(lin(0x6f86ff), 0.35 * PI); rim.position.set(4, 4, -4); scene.add(rim);
    this.screenLight = new PointLight(lin(0x3dff72), 0, 5, 2); scene.add(this.screenLight);

    // mug (always on the desk)
    const mugMat = M(0xd8d2c4, 0.4);
    const mug = new Mesh(new CylinderGeometry(0.14, 0.13, 0.28, 24), mugMat); mug.position.set(-1.95, 0.14, 0.95); mug.castShadow = true; scene.add(mug);
    const handle = new Mesh(new TorusGeometry(0.08, 0.022, 8, 20), mugMat); handle.position.set(-1.79, 0.15, 0.95); scene.add(handle);
    const coffee = new Mesh(new CircleGeometry(0.125, 24), M(0x2a160a, 0.2)); coffee.rotation.x = -PI / 2; coffee.position.set(-1.95, 0.26, 0.95); scene.add(coffee);

    // --- screens
    const bulgePlane = (w: number, h: number, b: number) => {
      const g = new PlaneGeometry(w, h, 24, 18), p = g.attributes.position;
      for (let i = 0; i < p.count; i++) { const x = p.getX(i) / (w / 2), y = p.getY(i) / (h / 2); p.setZ(i, b * (1 - x * x * 0.6) * (1 - y * y * 0.6)); }
      g.computeVertexNormals();
      return g;
    };
    const makeScreen = (parent: Object3D, w: number, h: number, cw: number, ch: number, x: number, y: number, z: number, bulge = 0): ScreenTex => {
      const ct = canvasTex(cw, ch);
      const me = new Mesh(bulge ? bulgePlane(w, h, bulge) : new PlaneGeometry(w, h), new MeshBasicMaterial({ map: ct.tex, toneMapped: false }));
      me.position.set(x, y, z); parent.add(me);
      if (bulge) {
        const gl = canvasTex(256, 256, (g, W, H) => {
          const gr = g.createRadialGradient(W * 0.3, H * 0.25, 4, W * 0.35, H * 0.3, W * 0.7);
          gr.addColorStop(0, "rgba(255,255,255,.16)"); gr.addColorStop(1, "rgba(255,255,255,0)");
          g.fillStyle = gr; g.fillRect(0, 0, W, H);
        });
        const glare = new Mesh(bulgePlane(w, h, bulge + 0.004), new MeshBasicMaterial({ map: gl.tex, transparent: true, depthWrite: false }));
        glare.position.copy(me.position); glare.position.z += 0.002; parent.add(glare);
      }
      return { mesh: me, c: ct.c, ctx: ct.ctx, tex: ct.tex, w, h, bulge };
    };
    const keysTex = (bg: string, key: string) => canvasTex(512, 160, (g) => {
      g.fillStyle = bg; g.fillRect(0, 0, 512, 160); g.fillStyle = key;
      for (let r = 0; r < 5; r++) for (let c = 0; c < 15; c++) { if (r === 4 && c > 3 && c < 11) continue; g.fillRect(8 + c * 33.4, 8 + r * 30, 28, 24); }
      g.fillRect(8 + 4 * 33.4, 128, 33.4 * 7 - 6, 24);
    }).tex;
    const keyboard = (parent: Object3D, w: number, d: number, x: number, z: number, bodyC: number, keyC: string, bg: string) => {
      box(w, 0.05, d, M(bodyC, 0.6), x, 0.025, z, parent);
      const top = new Mesh(new PlaneGeometry(w * 0.94, d * 0.86), M(0xffffff, 0.7, 0, { map: keysTex(bg, keyC) }));
      top.rotation.x = -PI / 2; top.position.set(x, 0.052, z); parent.add(top);
    };
    interface LaptopOpts { w: number; t: number; d: number; baseMat: Material; lidMat?: Material; kbBg: string; kbKey: string; padC: number; tilt: number; lh: number; bezel: number; sw: number; sh: number }
    const laptop = (parent: Object3D, o: LaptopOpts) => {
      box(o.w, o.t, o.d, o.baseMat, 0, o.t / 2, 0.25, parent);
      const kt = new Mesh(new PlaneGeometry(o.w * 0.86, o.d * 0.5), M(0xffffff, 0.6, 0, { map: keysTex(o.kbBg, o.kbKey) }));
      kt.rotation.x = -PI / 2; kt.position.set(0, o.t + 0.002, 0.12); parent.add(kt);
      const pad = new Mesh(new PlaneGeometry(o.w * 0.28, o.d * 0.22), M(o.padC, 0.4));
      pad.rotation.x = -PI / 2; pad.position.set(0, o.t + 0.002, 0.62); parent.add(pad);
      const hinge = new Group(); hinge.position.set(0, o.t, 0.25 - o.d / 2 + 0.02); parent.add(hinge);
      hinge.rotation.x = -o.tilt;
      box(o.w, o.lh, 0.035, o.lidMat ?? o.baseMat, 0, o.lh / 2, 0, hinge);
      const bez = new Mesh(new PlaneGeometry(o.w * 0.98, o.lh * 0.97), M(o.bezel, 0.3, 0.1)); bez.position.set(0, o.lh / 2, 0.019); hinge.add(bez);
      return makeScreen(hinge, o.sw, o.sh, 640, 400, 0, o.lh / 2 + 0.01, 0.021, 0);
    };
    const blank: Pose = { p: new Vector3(), t: new Vector3() };
    const rig = (r: Omit<Rig, "inPose" | "out" | "screenCenter">): Rig => ({ ...r, inPose: blank, out: blank, screenCenter: new Vector3() });

    // 1 · 1989 NeXT-style cube + display
    {
      const g = new Group(); scene.add(g);
      const blk = M(0x1b1b1e, 0.5, 0.35), blk2 = M(0x101012, 0.45, 0.3);
      box(0.95, 0.95, 0.95, blk, 1.5, 0.475, -0.15, g);
      const nt = canvasTex(256, 256, (ctx, w, h) => this.drawStickyNote(ctx, w, h));
      const note = new Mesh(new PlaneGeometry(0.34, 0.34), new MeshStandardMaterial({ map: nt.tex, roughness: 0.9 }));
      note.position.set(1.42, 0.7, 0.33); note.rotation.z = 0.07; g.add(note);
      box(0.5, 0.06, 0.42, blk2, -0.1, 0.03, 0, g); box(0.16, 0.26, 0.16, blk2, -0.1, 0.19, -0.05, g);
      box(1.58, 1.26, 0.24, blk, -0.1, 0.96, 0, g); box(1.12, 0.94, 0.72, blk2, -0.1, 0.96, -0.46, g);
      const sc = makeScreen(g, 1.26, 0.95, 640, 480, -0.1, 1.0, 0.121, 0.03);
      const pw = new Mesh(new CylinderGeometry(0.045, 0.045, 0.03, 24), M(0x2a2a2e, 0.3, 0.5, { emissive: lin(0xffc874), emissiveIntensity: 0.25 }));
      pw.rotation.x = PI / 2; pw.position.set(0.5, 0.42, 0.125); g.add(pw);
      const led = new Mesh(new SphereGeometry(0.015, 10, 8), new MeshBasicMaterial({ color: lin(0x1a2a1a) })); led.position.set(0.4, 0.42, 0.125); g.add(led);
      keyboard(g, 1.45, 0.46, -0.1, 0.9, 0x1b1b1e, "#2c2c31", "#141416");
      this.rigs.push(rig({ g, screen: sc, power: pw, led, light: 0x3dff72, noteTex: nt }));
    }
    // 2 · 1995 beige PC + modem
    {
      const g = new Group(); scene.add(g);
      const beige = M(0xd9cfb3, 0.62), beige2 = M(0xc9bea0, 0.7), dark = M(0x222222, 0.5);
      box(0.6, 1.4, 1.15, beige, 1.55, 0.7, -0.15, g);
      box(0.38, 0.035, 0.01, dark, 1.55, 1.12, 0.43, g); box(0.46, 0.1, 0.01, beige2, 1.55, 1.28, 0.43, g);
      const tled = new Mesh(new SphereGeometry(0.018, 8, 6), new MeshBasicMaterial({ color: lin(0x30ff50) })); tled.position.set(1.4, 0.3, 0.43); g.add(tled);
      const st = new Mesh(new CylinderGeometry(0.34, 0.38, 0.07, 32), beige2); st.position.set(-0.05, 0.035, 0); g.add(st);
      box(0.2, 0.26, 0.2, beige2, -0.05, 0.2, -0.05, g);
      box(1.48, 1.22, 0.3, beige, -0.05, 0.99, 0, g); box(1.1, 0.95, 0.85, beige2, -0.05, 0.99, -0.55, g);
      const sc = makeScreen(g, 1.16, 0.88, 640, 480, -0.05, 1.02, 0.151, 0.035);
      box(0.2, 0.03, 0.02, beige2, 0.45, 0.45, 0.15, g);
      box(0.56, 0.12, 0.38, M(0x2b2b2b, 0.5), -1.35, 0.06, 0.62, g);
      const leds: Mesh<SphereGeometry, MeshBasicMaterial>[] = [];
      for (let i = 0; i < 6; i++) { const l = new Mesh(new SphereGeometry(0.016, 8, 6), new MeshBasicMaterial({ color: lin(0x401010) })); l.position.set(-1.55 + i * 0.08, 0.07, 0.815); g.add(l); leds.push(l); }
      keyboard(g, 1.5, 0.5, -0.05, 0.95, 0xd9cfb3, "#e8e0c8", "#bfb393");
      box(0.13, 0.05, 0.21, beige, 1.0, 0.025, 0.95, g);
      this.rigs.push(rig({ g, screen: sc, leds, light: 0xffff66 }));
    }
    // 3 · 2004 glossy white laptop
    {
      const g = new Group(); scene.add(g);
      const gloss = new MeshPhysicalMaterial({ color: lin(0xf4f4f2), roughness: 0.18, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.08 });
      const sc = laptop(g, { w: 1.75, t: 0.075, d: 1.15, baseMat: gloss, kbBg: "#f2f2f0", kbKey: "#ffffff", padC: 0xe8e8e6, tilt: 0.26, lh: 1.12, bezel: 0xf0f0ee, sw: 1.52, sh: 0.95 });
      const s1 = new Mesh(new SphereGeometry(0.12, 24, 16), new MeshPhysicalMaterial({ color: lin(0xff7a1a), roughness: 0.1, clearcoat: 1 })); s1.position.set(1.45, 0.12, 0.7); g.add(s1);
      const s2 = new Mesh(new SphereGeometry(0.08, 24, 16), new MeshPhysicalMaterial({ color: lin(0x7cc242), roughness: 0.1, clearcoat: 1 })); s2.position.set(1.7, 0.08, 0.45); g.add(s2);
      this.rigs.push(rig({ g, screen: sc, light: 0x9fd0ff }));
    }
    // 4 · 2010 aluminium laptop + phone
    {
      const g = new Group(); scene.add(g);
      const alu = M(0xc8ccd2, 0.32, 0.75);
      const sc = laptop(g, { w: 1.7, t: 0.055, d: 1.12, baseMat: alu, kbBg: "#b9bdc3", kbKey: "#1c1c1e", padC: 0xbfc3c9, tilt: 0.22, lh: 1.08, bezel: 0x0c0c0e, sw: 1.5, sh: 0.94 });
      const ph = new Group(); ph.position.set(1.55, 0.02, 0.35); ph.rotation.set(-0.28, -0.35, 0); g.add(ph);
      box(0.38, 0.76, 0.04, M(0x0d0d0f, 0.25, 0.4), 0, 0.38, 0, ph);
      const psc = makeScreen(ph, 0.33, 0.6, 200, 360, 0, 0.39, 0.021, 0);
      box(0.3, 0.1, 0.2, M(0x2c3e50, 0.5), 1.55, 0.05, 0.25, g);
      this.rigs.push(rig({ g, screen: sc, extra: psc, light: 0xdfe8ec }));
    }
    // 5 · today: thin laptop, phone, edge globe
    {
      const g = new Group(); scene.add(g);
      const sg = M(0x3a3d42, 0.35, 0.7);
      const sc = laptop(g, { w: 1.8, t: 0.035, d: 1.15, baseMat: sg, kbBg: "#2c2f33", kbKey: "#111214", padC: 0x34373c, tilt: 0.2, lh: 1.12, bezel: 0x050506, sw: 1.7, sh: 1.04 });
      const ph = new Group(); ph.position.set(-1.35, 0.012, 0.75); ph.rotation.y = 0.35; g.add(ph);
      box(0.38, 0.02, 0.78, M(0x1a1b1e, 0.3, 0.5), 0, 0, 0, ph);
      const psc = makeScreen(ph, 0.34, 0.72, 200, 420, 0, 0.011, 0, 0); psc.mesh.rotation.x = -PI / 2;
      const globe = new Group(); globe.position.set(1.6, 1.25, -0.25); g.add(globe);
      globe.add(new LineSegments(new WireframeGeometry(new IcosahedronGeometry(0.48, 2)), new LineBasicMaterial({ color: lin(0xff9a4d), transparent: true, opacity: 0.32 })));
      const nodeMat = new MeshBasicMaterial({ color: lin(0x7dd3c0) });
      for (let i = 0; i < 22; i++) {
        const u = Math.random() * 2 - 1, th = Math.random() * PI * 2, r = Math.sqrt(1 - u * u);
        const n = new Mesh(new SphereGeometry(0.022, 8, 6), nodeMat); n.position.set(r * Math.cos(th) * 0.49, u * 0.49, r * Math.sin(th) * 0.49); globe.add(n);
      }
      const ring = new Mesh(new TorusGeometry(0.66, 0.004, 6, 80), new MeshBasicMaterial({ color: lin(0x7dd3c0), transparent: true, opacity: 0.5 })); ring.rotation.x = 1.2; globe.add(ring);
      this.rigs.push(rig({ g, screen: sc, extra: psc, globe, light: 0xffb877 }));
    }
    // 6 · future: glasses, phone, an agent orb and a floating generated panel
    {
      const g = new Group(); scene.add(g);
      const frame = M(0x1a1c1e, 0.35, 0.5), lens = new MeshPhysicalMaterial({ color: lin(0x88ccc4), roughness: 0.05, transparent: true, opacity: 0.35, clearcoat: 1 });
      const gls = new Group(); gls.position.set(-1.25, 0.03, 0.8); gls.rotation.y = 0.4; g.add(gls);
      [-0.17, 0.17].forEach((x) => {
        const r = new Mesh(new TorusGeometry(0.12, 0.014, 10, 32), frame); r.position.set(x, 0.12, 0); gls.add(r);
        const l = new Mesh(new CircleGeometry(0.11, 24), lens); l.position.set(x, 0.12, 0); gls.add(l);
      });
      box(0.1, 0.014, 0.014, frame, 0, 0.15, 0, gls); box(0.014, 0.014, 0.42, frame, -0.29, 0.12, -0.21, gls); box(0.014, 0.014, 0.42, frame, 0.29, 0.12, -0.21, gls);
      const ph = new Group(); ph.position.set(1.15, 0.012, 0.9); ph.rotation.y = -0.3; g.add(ph); box(0.36, 0.02, 0.74, M(0xe8e8e6, 0.3, 0.2), 0, 0, 0, ph);
      const orb = new Mesh(new SphereGeometry(0.26, 48, 32), new MeshPhysicalMaterial({ color: lin(0x0fa3a3), emissive: lin(0x0b6f6f), emissiveIntensity: 0.9, roughness: 0.15, clearcoat: 1 }));
      orb.position.set(1.45, 1.15, -0.1); g.add(orb);
      const halo = new Mesh(new TorusGeometry(0.42, 0.006, 6, 90), new MeshBasicMaterial({ color: lin(0xff5a36), transparent: true, opacity: 0.7 })); halo.position.copy(orb.position); halo.rotation.x = 1.3; g.add(halo);
      const sc = makeScreen(g, 1.6, 1.0, 640, 400, -0.2, 1.05, 0, 0);
      const scm = sc.mesh.material as MeshBasicMaterial; scm.transparent = true; scm.opacity = 0.95;
      const rimL = new LineSegments(new EdgesGeometry(new PlaneGeometry(1.64, 1.04)), new LineBasicMaterial({ color: lin(0x0fa3a3) })); rimL.position.set(-0.2, 1.05, -0.002); g.add(rimL);
      this.rigs.push(rig({ g, screen: sc, orb, halo, light: 0x7fe0d6 }));
    }

    this.rigs.forEach((r, i) => { this.paintRig(i); r.g.visible = i === 0; });
    this.blankFirstScreen();

    // dust in the lamp light
    const DN = phone ? 140 : 420;
    this.DN = DN;
    this.dpos = new Float32Array(DN * 3);
    this.dseed = new Float32Array(DN);
    for (let i = 0; i < DN; i++) { this.dpos[i * 3] = -3.2 + Math.random() * 5.5; this.dpos[i * 3 + 1] = Math.random() * 3; this.dpos[i * 3 + 2] = -1.5 + Math.random() * 3.6; this.dseed[i] = Math.random() * 100; }
    const dg = new BufferGeometry(); dg.setAttribute("position", new BufferAttribute(this.dpos, 3));
    const dotT = canvasTex(32, 32, (g) => { const gr = g.createRadialGradient(16, 16, 0, 16, 16, 16); gr.addColorStop(0, "rgba(255,240,210,1)"); gr.addColorStop(1, "rgba(255,240,210,0)"); g.fillStyle = gr; g.fillRect(0, 0, 32, 32); });
    this.dust = new Points(dg, new PointsMaterial({ size: 0.022, map: dotT.tex, transparent: true, opacity: 0.55, depthWrite: false, blending: AdditiveBlending, color: lin(0xffe1b0) }));
    scene.add(this.dust);

    this.computePoses();
    this.raf = requestAnimationFrame(this.tick);
  }

  private handleLost = (e: Event) => {
    e.preventDefault();
    this.lost = true;
    this.onContextLost?.();
  };

  get contextLost() { return this.lost; }

  // ---------- canvas painting (texts come from messages) ----------
  private drawStickyNote(g: CanvasRenderingContext2D, w: number, h: number) {
    g.fillStyle = "#ffe86b"; g.fillRect(0, 0, w, h); g.fillStyle = "rgba(0,0,0,.06)"; g.fillRect(0, 0, w, 26);
    g.fillStyle = "#c0262d"; g.textAlign = "center"; g.font = `600 30px ${this.fonts.hand}`;
    this.text.sticky.slice(0, 4).forEach((s, i) => fitText(g, s, w / 2, 72 + i * 44, w - 16));
  }

  private paintRig(i: number) {
    const r = this.rigs[i];
    drawEraScreen(i + 1, r.screen.ctx, r.screen.c.width, r.screen.c.height, this.text, this.fonts);
    r.screen.tex.needsUpdate = true;
    if (r.extra) { drawPhoneScreen(i + 1, r.extra.ctx, r.extra.c.width, r.extra.c.height, this.text, this.fonts); r.extra.tex.needsUpdate = true; }
  }

  private blankFirstScreen() {
    const s = this.rigs[0].screen;
    s.ctx.fillStyle = "#050806"; s.ctx.fillRect(0, 0, s.c.width, s.c.height); s.tex.needsUpdate = true;
  }

  /** Repaint every texture (after fonts load or the locale's text changes). */
  repaint(text?: DeskText, fonts?: FontStacks) {
    if (text) this.text = text;
    if (fonts) this.fonts = fonts;
    this.rigs.forEach((r, i) => { if (i === 0 && this.mode !== "story") return; this.paintRig(i); });
    const nt = this.rigs[0].noteTex;
    if (nt) { this.drawStickyNote(nt.ctx, 256, 256); nt.tex.needsUpdate = true; }
  }

  private drawBoot(t: number) {
    const s = this.rigs[0].screen, g = s.ctx, w = s.c.width, h = s.c.height;
    g.fillStyle = "#040a05"; g.fillRect(0, 0, w, h);
    if (t < 0.45) { const k = t / 0.45, lw = w * Math.min(1, k * 1.6), lh = 2 + k * 6; g.fillStyle = "rgba(200,255,215," + (0.5 + k * 0.5) + ")"; g.fillRect((w - lw) / 2, h / 2 - lh / 2, lw, lh); }
    else if (t < 0.8) { const f = 1 - (t - 0.45) / 0.35; g.fillStyle = "rgba(170,255,195," + f * 0.55 + ")"; g.fillRect(0, h / 2 - (h * (1 - f)) / 2, w, h * (1 - f) + 6); }
    else {
      g.fillStyle = "#3dff72"; g.font = `30px ${this.fonts.term}`; g.textAlign = "left";
      let shown = (t - 0.8) * 34;
      const BOOT = this.text.boot;
      for (let i = 0; i < BOOT.length; i++) {
        const L = BOOT[i], c = Math.max(0, Math.min(L.length, shown)); shown -= L.length + 4;
        if (c <= 0 && i) break;
        g.fillText(L.slice(0, Math.floor(c)) + (c < L.length && c > 0 ? "▌" : ""), 30, 60 + i * 34);
      }
    }
    scan(g, w, h, 0.3); s.tex.needsUpdate = true;
  }

  // ---------- camera ----------
  private outPose(i: number): Pose {
    if (innerWidth / innerHeight < 0.9) return { p: new Vector3(1.0, 2.9, 7.6), t: new Vector3(0.15, 0.85, 0) };
    return { p: new Vector3(2.1 - i * 0.05, 2.05, 5.2), t: new Vector3(0.05, 0.78, 0) };
  }

  computePoses() {
    const cam = this.camera;
    cam.aspect = innerWidth / innerHeight; cam.updateProjectionMatrix();
    this.rigs.forEach((r, i) => {
      const y0 = r.g.position.y; r.g.position.y = 0; r.g.updateMatrixWorld(true);
      const s = r.screen, c = new Vector3(); s.mesh.getWorldPosition(c);
      const n = new Vector3(0, 0, 1).transformDirection(s.mesh.matrixWorld);
      const tv = Math.tan(MathUtils.degToRad(cam.fov) / 2), dH = s.h / 2 / tv, dW = s.w / 2 / (tv * cam.aspect);
      const d = Math.min(dH, dW) * 0.96 + s.bulge;
      r.inPose = { p: c.clone().add(n.multiplyScalar(d)), t: c.clone() };
      r.out = this.outPose(i); r.screenCenter = c;
      r.g.position.y = y0;
    });
  }

  rigPoses(i: number) { const r = this.rigs[i]; return { inPose: r.inPose, out: r.out }; }

  resize() {
    if (this.disposed) return;
    this.renderer.setSize(innerWidth, innerHeight, false);
    this.computePoses();
  }

  private applyPose(p: Pose) { this.camera.position.copy(p.p); this.camera.lookAt(p.t); }

  // ---------- story control ----------
  startBoot() {
    if (this.mode !== "intro") return;
    const r0 = this.rigs[0];
    this.mode = "booting"; this.handed = false; this.powerT0 = performance.now();
    r0.led!.material.color.copy(lin(0x30ff50)); r0.power!.material.emissiveIntensity = 0;
    this.bootFrom = { p: this.camera.position.clone(), t: r0.out.t.clone() };
  }

  /** Jump straight into the story (used when resuming after a locale switch). */
  enterStory() {
    const r0 = this.rigs[0];
    r0.led!.material.color.copy(lin(0x30ff50)); r0.power!.material.emissiveIntensity = 0;
    this.mode = "story"; this.handed = true;
    this.paintRig(0);
  }

  handOverDone() {
    this.mode = "story";
    this.paintRig(0);
  }

  powerOff() {
    this.mode = "intro"; this.glNeeded = true;
    this.rigA = 0; this.rigB = -1; this.swapQ = 0; this.pose = null;
    this.blankFirstScreen();
    this.rigs[0].led!.material.color.copy(lin(0x1a2a1a));
  }

  hitPower(clientX: number, clientY: number): boolean {
    if (this.mode !== "intro") return false;
    const r = this.canvas.getBoundingClientRect();
    this.ptr.set(((clientX - r.left) / r.width) * 2 - 1, (-(clientY - r.top) / r.height) * 2 + 1);
    this.ray.setFromCamera(this.ptr, this.camera);
    return this.ray.intersectObject(this.rigs[0].power!, false).length > 0 || this.ray.intersectObject(this.rigs[0].g, true).length > 0;
  }

  private tick = (now: number) => {
    if (this.disposed) return;
    this.raf = requestAnimationFrame(this.tick);
    if (this.lost) return;
    const t = now / 1000, dt = Math.min(0.05, (now - this.lastNow) / 1000 || 0.016); this.lastNow = now;
    const r0 = this.rigs[0];
    if (this.mode === "intro") {
      const o = r0.out, sway = this.reduce ? 0 : Math.sin(t * 0.25) * 0.18;
      this.applyPose({ p: o.p.clone().add(this.tmp.set(sway, Math.sin(t * 0.2) * 0.05, 0)), t: o.t });
      r0.power!.material.emissiveIntensity = 0.25 + (this.reduce ? 0 : (Math.sin(t * 3) * 0.5 + 0.5) * 0.9);
    } else if (this.mode === "booting") {
      const bt = ((now - this.powerT0) / 1000) * (this.reduce ? 2.2 : 1);
      this.drawBoot(bt);
      this.screenLight.intensity = Math.min(1.1, bt * 1.2) * PI * 0.65;
      const camK = ease((bt - 2.9) / 1.9);
      this.applyPose(lerpPose(this.bootFrom!, r0.inPose, this.reduce ? (bt > 2.9 ? 1 : 0) : camK));
      if (bt > 4.5 && !this.handed) { this.handed = true; this.onHandOver?.(); }
    } else if (this.pose) {
      this.applyPose(this.pose);
    }
    this.rigs.forEach((r, i) => {
      const vis = (i === this.rigA && !(this.rigB >= 0 && this.swapQ >= 1)) || (i === this.rigB && this.swapQ > 0);
      r.g.visible = vis;
      if (!vis) return;
      const q = this.swapQ; let y = 0, ry = 0;
      if (this.rigB >= 0 && i === this.rigA) { y = -q * 2.6; ry = -q * 0.5; }
      if (i === this.rigB) { y = -(1 - q) * 2.6; ry = (1 - q) * 0.6; }
      r.g.position.y = y; r.g.rotation.y = ry;
      if (r.leds) r.leds.forEach((l, j) => { const on = Math.sin(t * (6 + j * 2.3) + j) > 0.2; l.material.color.copy(lin(on ? (j < 2 ? 0x30ff50 : 0xff3030) : 0x301010)); });
      if (r.globe) r.globe.rotation.y += dt * 0.35;
      if (r.orb && r.halo) { r.orb.position.y = 1.15 + Math.sin(t * 1.4) * 0.05; r.halo.position.y = r.orb.position.y; r.halo.rotation.z += dt * 0.6; }
    });
    const lr = this.rigs[this.rigA];
    if (lr) { this.screenLight.position.copy(lr.screenCenter).add(this.tmp.set(0, 0, 0.7)); this.screenLight.color.copy(lin(lr.light)); }
    if (this.mode !== "booting") this.screenLight.intensity = this.mode === "intro" ? 0 : 0.9 * PI * 0.65;
    if (!this.reduce) {
      const P = this.dpos;
      for (let i = 0; i < this.DN; i++) {
        const s = this.dseed[i];
        P[i * 3] += Math.sin(t * 0.2 + s) * 0.0009; P[i * 3 + 1] += Math.cos(t * 0.17 + s * 1.3) * 0.0007 + 0.0002;
        if (P[i * 3 + 1] > 3) P[i * 3 + 1] = 0;
      }
      (this.dust.geometry.attributes.position as BufferAttribute).needsUpdate = true;
    }
    if (this.glNeeded) this.renderer.render(this.scene, this.camera);
  };

  dispose() {
    this.disposed = true;
    cancelAnimationFrame(this.raf);
    this.canvas.removeEventListener("webglcontextlost", this.handleLost);
    this.scene.traverse((o) => {
      const m = o as Mesh;
      if (m.geometry) m.geometry.dispose();
      const mat = m.material as Material | Material[] | undefined;
      if (Array.isArray(mat)) mat.forEach((x) => x.dispose()); else mat?.dispose();
    });
    this.textures.forEach((t) => t.dispose());
    this.renderer.dispose();
    this.renderer.forceContextLoss();
    this.canvas.remove();
  }
}

export function lerpPose(a: Pose, b: Pose, k: number): Pose {
  return { p: a.p.clone().lerp(b.p, k), t: a.t.clone().lerp(b.t, k) };
}
export type { Pose };

// ---------- era screens (they match the DOM costume they hand over to) ----------
function fitText(g: CanvasRenderingContext2D, s: string, x: number, y: number, maxW: number) {
  g.fillText(s, x, y, maxW);
}
function rr(g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number, fill: string | CanvasGradient, stroke?: string) {
  g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath();
  g.fillStyle = fill; g.fill(); if (stroke) { g.strokeStyle = stroke; g.lineWidth = 2; g.stroke(); }
}
function scan(g: CanvasRenderingContext2D, w: number, h: number, a: number) {
  g.fillStyle = "rgba(0,0,0," + a + ")"; for (let y = 0; y < h; y += 3) g.fillRect(0, y, w, 1);
}

function drawEraScreen(n: number, g: CanvasRenderingContext2D, w: number, h: number, T: DeskText, F: FontStacks) {
  g.save(); g.textAlign = "left"; g.textBaseline = "alphabetic";
  if (n === 1) {
    g.fillStyle = "#040a05"; g.fillRect(0, 0, w, h); g.fillStyle = "#3dff72"; g.font = `28px ${F.term}`;
    T.e1.forEach((s, i) => g.fillText(s, 24, 44 + i * 28, w - 40));
    scan(g, w, h, 0.3);
  } else if (n === 2) {
    g.fillStyle = "#000030"; g.fillRect(0, 0, w, h); for (let i = 0; i < 140; i++) { g.fillStyle = i % 5 ? "#fff" : "#9ad6ff"; g.fillRect((i * 97) % w, (i * 53) % h, 2, 2); }
    g.fillStyle = "#000"; g.fillRect(0, 0, w, 34); g.fillStyle = "#39ffd9"; g.font = `bold 20px ${F.comic}`; g.fillText(T.e2Marquee, 12, 24, w - 24);
    g.textAlign = "center"; g.fillStyle = "#ffff66"; g.font = `bold 46px ${F.comic}`; g.fillText(T.e2Title1, w / 2, 110, w - 40); g.fillText(T.e2Title2, w / 2, 160, w - 40);
    ["#ff3b3b", "#ffb000", "#fff200", "#3bff6e", "#39d0ff", "#b45cff"].forEach((c, i) => { g.fillStyle = c; g.fillRect(70 + i * 83, 186, 83, 6); });
    g.fillStyle = "#c0c0c0"; g.fillRect(150, 220, 340, 120); g.fillStyle = "#000080"; g.fillRect(154, 224, 332, 22); g.fillStyle = "#fff"; g.font = "bold 15px Arial"; g.fillText(T.e2Links, w / 2, 241, 320);
    g.fillStyle = "#0000ee"; g.font = `18px 'Times New Roman', serif`; [T.e2Link1, T.e2Link2, T.e2Link3].forEach((s, i) => g.fillText(s, w / 2, 272 + i * 24, 320));
    g.fillStyle = "#000"; g.fillRect(250, 360, 140, 30); g.fillStyle = "#39ff6a"; g.font = `16px ${F.pixel}`; g.fillText("004217", w / 2, 383);
    for (let x = 0; x < w; x += 28) { g.fillStyle = (x / 28) % 2 ? "#111" : "#ffd400"; g.beginPath(); g.moveTo(x, h); g.lineTo(x + 14, h - 30); g.lineTo(x + 28, h - 30); g.lineTo(x + 14, h); g.fill(); }
    g.fillStyle = "#ffd400"; g.fillRect(0, h - 70, w, 6);
  } else if (n === 3) {
    for (let y = -h; y < w + h; y += 28) { g.fillStyle = (y / 28) % 2 ? "#e2eef9" : "#eef6fc"; g.beginPath(); g.moveTo(y, 0); g.lineTo(y + 14, 0); g.lineTo(y + 14 - h, h); g.lineTo(y - h, h); g.fill(); }
    const gr = g.createLinearGradient(0, 0, 0, 60); gr.addColorStop(0, "#6fb3ec"); gr.addColorStop(0.5, "#2a7cc8"); gr.addColorStop(0.51, "#1d6db8"); gr.addColorStop(1, "#3a8ad6"); g.fillStyle = gr; g.fillRect(0, 0, w, 60);
    g.fillStyle = "#fff"; g.font = `bold 30px ${F.aqua}`; g.fillText(T.e3Logo, 24, 41); const lw = g.measureText(T.e3Logo).width;
    g.font = `bold 13px ${F.aqua}`; g.fillStyle = "#ffe0b8"; g.fillText(T.e3Beta, 24 + lw + 6, 26);
    rr(g, 30, 90, 360, 260, 18, "#fff", "#a9c4dd"); rr(g, 410, 90, 200, 120, 18, "#fff", "#a9c4dd");
    g.fillStyle = "#17324d"; g.font = `bold 22px ${F.aqua}`; g.fillText(T.e3Head, 54, 130, 320); g.font = `15px ${F.aqua}`; g.fillStyle = "#5a7591";
    [T.e3Sub1, T.e3Sub2].forEach((s, i) => g.fillText(s, 54, 162 + i * 24, 320));
    const bg2 = g.createLinearGradient(0, 230, 0, 270); bg2.addColorStop(0, "#ffb15c"); bg2.addColorStop(0.5, "#ff7a00"); bg2.addColorStop(0.51, "#f06400"); bg2.addColorStop(1, "#ff9a2e");
    rr(g, 54, 230, 200, 44, 22, bg2, "#c75200"); g.fillStyle = "#fff"; g.font = `bold 18px ${F.aqua}`; g.textAlign = "center"; g.fillText(T.e3Cta, 154, 259, 180); g.textAlign = "left";
    g.fillStyle = "#2a7cc8"; T.e3Tags.slice(0, 4).forEach((s, i) => { g.font = `bold ${12 + (i % 3) * 5}px ${F.aqua}`; g.fillText(s, 428 + (i % 2) * 80, 130 + Math.floor(i / 2) * 40, 90); });
    g.fillStyle = "#ff6a00"; g.beginPath(); g.arc(560, 330, 46, 0, 7); g.fill(); g.fillStyle = "#fff"; g.font = `bold 20px ${F.aqua}`; g.textAlign = "center"; g.fillText(T.e3Badge, 560, 337, 80);
  } else if (n === 4) {
    g.fillStyle = "#ecf0f1"; g.fillRect(0, 0, w, h); g.fillStyle = "#2c3e50"; g.fillRect(0, 0, w, 50);
    g.fillStyle = "#ecf0f1"; [16, 24, 32].forEach((y) => g.fillRect(w - 50, y, 26, 3)); g.font = `600 20px ${F.flat}`; g.fillText(T.e4Logo, 24, 32);
    g.fillStyle = "#1abc9c"; g.fillRect(0, 50, w, 120); g.fillStyle = "#fff"; g.font = `300 34px ${F.flat}`; g.fillText(T.e4Head, 24, 122, w - 48);
    ["#e74c3c", "#3498db", "#9b59b6", "#f1c40f", "#e67e22", "#2ecc71"].forEach((c, i) => { g.fillStyle = c; g.fillRect(24 + (i % 3) * 200, 190 + Math.floor(i / 3) * 104, 186, 92); });
  } else if (n === 6) {
    g.fillStyle = "#eef2ef"; g.fillRect(0, 0, w, h);
    g.setLineDash([8, 6]); g.strokeStyle = "rgba(20,26,23,.25)"; g.lineWidth = 2;
    [[40, 150, 250, 120], [310, 150, 290, 60], [310, 225, 140, 120], [465, 225, 135, 120]].forEach((b) => g.strokeRect(b[0], b[1], b[2], b[3])); g.setLineDash([]);
    rr(g, 120, 40, 400, 54, 27, "#ffffff", "rgba(20,26,23,.15)"); g.fillStyle = "#ff5a36"; g.font = `26px ${F.sans}`; g.fillText("✦", 140, 77);
    g.fillStyle = "#6b7671"; g.font = `20px ${F.sans}`; g.fillText(T.e6Intent, 176, 74, 330);
    g.fillStyle = "#141a17"; g.font = `italic 40px ${F.serif}`; g.fillText(T.e6Head1, 52, 200, w - 80); g.fillText(T.e6Head2, 52, 244, w - 80);
    g.fillStyle = "#0fa3a3"; g.beginPath(); g.moveTo(520, 300); g.lineTo(548, 318); g.lineTo(534, 321); g.lineTo(528, 336); g.closePath(); g.fill();
  } else {
    g.fillStyle = "#0b0b0d"; g.fillRect(0, 0, w, h);
    const r1 = g.createRadialGradient(w * 0.75, h * 0.3, 0, w * 0.75, h * 0.3, w * 0.5); r1.addColorStop(0, "rgba(255,154,77,.35)"); r1.addColorStop(1, "rgba(255,154,77,0)"); g.fillStyle = r1; g.fillRect(0, 0, w, h);
    g.fillStyle = "#ededed"; g.font = `600 44px ${F.sans}`; g.fillText(T.e5Head, 40, 120, w - 80); g.fillStyle = "#8a8a93"; g.font = `18px ${F.sans}`; g.fillText(T.e5Sub, 40, 156, w - 80);
    [[40, 200, 260, 150], [316, 200, 284, 70], [316, 280, 284, 70]].forEach((b) => rr(g, b[0], b[1], b[2], b[3], 14, "rgba(255,255,255,.05)", "rgba(255,255,255,.12)"));
  }
  g.restore();
}

function drawPhoneScreen(n: number, g: CanvasRenderingContext2D, w: number, h: number, T: DeskText, F: FontStacks) {
  if (n === 4) {
    g.fillStyle = "#ecf0f1"; g.fillRect(0, 0, w, h); g.fillStyle = "#2c3e50"; g.fillRect(0, 0, w, 40);
    ["#e74c3c", "#3498db", "#1abc9c", "#f1c40f", "#9b59b6", "#e67e22"].forEach((c, i) => { g.fillStyle = c; g.fillRect(14 + (i % 2) * 90, 56 + Math.floor(i / 2) * 96, 82, 86); });
  } else {
    g.fillStyle = "#0b0b0d"; g.fillRect(0, 0, w, h); for (let i = 0; i < 4; i++) rr(g, 14, 60 + i * 74, w - 28, 62, 12, "rgba(255,255,255,.07)", "rgba(255,255,255,.1)");
    g.fillStyle = "#ededed"; g.font = `600 40px ${F.sans}`; g.fillText("9:41", 50, 40); g.fillStyle = "#7dd3c0"; g.font = `13px ${F.sans}`; g.fillText(T.e5Phone, 26, 96, w - 40);
  }
}

