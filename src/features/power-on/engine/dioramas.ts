// "Where it lived" 3D dioramas. One shared WebGL renderer; its canvas moves into whichever diorama is on stage,
// and it renders only while that diorama is active and the screen layer is visible.
import {
  BoxGeometry, BufferGeometry, CatmullRomCurve3, Color, ConeGeometry, CylinderGeometry, DirectionalLight, EdgesGeometry, Group,
  HemisphereLight, IcosahedronGeometry, LineBasicMaterial, LineSegments, LinearSRGBColorSpace, type Material, Mesh, MeshBasicMaterial,
  MeshLambertMaterial, MeshPhongMaterial, MeshPhysicalMaterial, MeshStandardMaterial, type Object3D, PerspectiveCamera, SRGBColorSpace, Scene,
  SphereGeometry, TorusGeometry, TubeGeometry, Vector3, WebGLRenderer, WireframeGeometry,
} from "three";
import { clamp } from "./env";

export type DioN = 1 | 2 | 3 | 4 | 5 | 6;
/** A floating HTML label; text lives at story.dio.d<n>.<title> (+ <sub>). */
export interface DioLabel { title: string; sub?: string; lat?: boolean }
interface LabelSpot extends DioLabel { p: Vector3; globe?: Vector3; dy: number }
interface Leg { path: string[]; back: boolean; dur: number; cube?: boolean }
interface Ambient { c: CatmullRomCurve3; off: number; sp: number; big?: boolean; m?: Mesh<SphereGeometry, MeshBasicMaterial> }
interface DioScene {
  n: DioN; scene: Scene; root: Group; cam: PerspectiveCamera; nodes: Record<string, Vector3>; links: Record<string, CatmullRomCurve3>;
  labels: LabelSpot[]; ambient: Ambient[]; req: Leg[]; pr: number; yaw: number; uyaw: number; pitch: number; base: number; w: number; h: number;
  extra: ((t: number) => void)[]; pk: Mesh<SphereGeometry, MeshBasicMaterial>; cube: Mesh<BoxGeometry, MeshBasicMaterial>;
  run: { leg: number; t0: number; curves: { c: CatmullRomCurve3 | null; l: Leg }[] } | null; nextAuto: number; idle: number; drag: boolean;
  view: HTMLElement | null; labelEls: (HTMLElement | null)[];
}

const lin = (hex: number) => new Color().setHex(hex, LinearSRGBColorSpace);
type Pal = Record<string, number>;
const PAL: Record<DioN, Pal> = {
  1: { bg: 0x020602, line: 0x3dff72, fill: 0x03200b, out: 0xb6ffca, back: 0xffd23d },
  2: { bg: 0x000030, tile: 0x2f8a3a, building: 0xc0c0c0, device: 0xd9cfb3, server: 0x8a8a8a, db: 0xffd400, accent: 0xff00ff, net: 0x00ffff, roof: 0xb22222, house: 0xff8a65, out: 0xff00ff, back: 0x00ffff },
  3: { bg: 0xe9f3fb, tile: 0xffffff, building: 0xdbe9f6, device: 0xf4f4f2, server: 0x9cc9f0, db: 0xff7a1a, accent: 0xff6a00, net: 0x2a7cc8, roof: 0x7cc242, house: 0xffffff, out: 0xff6a00, back: 0x2a7cc8 },
  4: { bg: 0xecf0f1, tile: 0xffffff, building: 0x3498db, device: 0x2c3e50, server: 0x9b59b6, db: 0xe67e22, accent: 0xe74c3c, net: 0x1abc9c, roof: 0x2980b9, house: 0x34495e, out: 0xe74c3c, back: 0x1abc9c },
  5: { bg: 0x0b0b0d, tile: 0x141418, building: 0x22232a, device: 0x2a2b33, server: 0x22232a, db: 0xff9a4d, accent: 0xff9a4d, net: 0x7dd3c0, roof: 0x22232a, house: 0x22232a, out: 0xff9a4d, back: 0x7dd3c0 },
  6: { bg: 0xeef2ef, tile: 0xffffff, building: 0xdfe7e2, device: 0x2a3330, server: 0xcfd9d3, db: 0xff5a36, accent: 0x0fa3a3, net: 0x0fa3a3, roof: 0xdfe7e2, house: 0xffffff, out: 0x0fa3a3, back: 0xff5a36 },
};
const PI = Math.PI;

function buildDio(n: DioN): DioScene {
  const P = PAL[n], scene = new Scene(), root = new Group(); scene.add(root);
  scene.background = new Color(P.bg);
  // r128 legacy lighting → physically based: non-punctual intensities × π
  scene.add(new HemisphereLight(lin(0xffffff), lin(n === 5 ? 0x111118 : 0x8899aa), (n === 4 ? 0.95 : 0.75) * PI));
  const dl = new DirectionalLight(lin(0xffffff), (n === 4 ? 0.45 : 0.8) * PI); dl.position.set(3, 6, 4); scene.add(dl);
  const cam = new PerspectiveCamera(n === 5 ? 34 : 32, 1.6, 0.1, 80);
  if (n === 5) { cam.position.set(0, 2.4, 7.4); cam.lookAt(0, 1.25, 0); } else { cam.position.set(0, 4.4, 8.4); cam.lookAt(0, 0.5, 0); }
  const sc = {
    n, scene, root, cam, nodes: {}, links: {}, labels: [], ambient: [], req: [], pr: n === 2 ? 0.38 : Math.min(window.devicePixelRatio || 1, 2),
    yaw: 0, uyaw: 0, pitch: 0, base: 0, w: 0, h: 0, extra: [], run: null, nextAuto: 0, idle: 0, drag: false, view: null, labelEls: [],
  } as unknown as DioScene;

  const mat = (role: string): Material => {
    if (n === 1) return new MeshBasicMaterial({ color: lin(P.fill), transparent: true, opacity: 0.55 });
    const c = lin(P[role] != null ? P[role] : P.building);
    if (n === 2) return new MeshPhongMaterial({ color: c, flatShading: true, shininess: 0 });
    if (n === 3) return new MeshPhysicalMaterial({ color: c, roughness: 0.16, clearcoat: 1, clearcoatRoughness: 0.1 });
    if (n === 4) return new MeshLambertMaterial({ color: c });
    if (n === 6) return role === "accent" ? new MeshPhysicalMaterial({ color: lin(0x0fa3a3), emissive: lin(0x0b6f6f), emissiveIntensity: 0.8, roughness: 0.15, clearcoat: 1 }) : new MeshStandardMaterial({ color: c, roughness: 0.45 });
    return new MeshPhysicalMaterial({ color: c, roughness: 0.3, metalness: 0.2, transparent: true, opacity: role === "db" || role === "accent" ? 0.95 : 0.6 });
  };
  const add = (geo: BufferGeometry, role: string, x: number, y: number, z: number, parent: Object3D = root) => {
    const m = new Mesh(geo, mat(role)); m.position.set(x, y, z); parent.add(m);
    if (n === 1 || n === 5) m.add(new LineSegments(new EdgesGeometry(geo, 25), new LineBasicMaterial({ color: lin(n === 1 ? P.line : 0xffffff), transparent: n === 5, opacity: n === 5 ? 0.28 : 1 })));
    return m;
  };
  const B = (w: number, h: number, d: number, x: number, y: number, z: number, role: string, parent?: Object3D) => add(new BoxGeometry(w, h, d), role, x, y + h / 2, z, parent);
  const C = (r: number, h: number, x: number, y: number, z: number, role: string, seg?: number) => add(new CylinderGeometry(r, r, h, seg || (n === 2 ? 8 : 24)), role, x, y + h / 2, z);
  const house = (x: number, z: number, w: number, d: number, h: number) => { B(w, h, d, x, 0, z, "house"); const roof = add(new ConeGeometry(Math.max(w, d) * 0.78, h * 0.7, 4), "roof", x, h + h * 0.35, z); roof.rotation.y = PI / 4; };
  const node = (k: string, x: number, y: number, z: number) => { sc.nodes[k] = new Vector3(x, y, z); };
  const label = (at: string | Vector3, title: string, sub?: string, o: { lat?: boolean; globe?: Vector3; dy?: number } = {}) =>
    sc.labels.push({ p: at instanceof Vector3 ? at : sc.nodes[at], title, sub, lat: o.lat, globe: o.globe, dy: o.dy ?? 0.28 });
  const curvePts = (a: string, b: string, lift = 0, sag = 0) => {
    const pa = sc.nodes[a], pb = sc.nodes[b], pts: Vector3[] = [];
    for (let i = 0; i <= 24; i++) { const t = i / 24, p = pa.clone().lerp(pb, t); p.y += Math.sin(PI * t) * lift - Math.sin(PI * t) * sag; pts.push(p); }
    return pts;
  };
  const link = (a: string, b: string, o: { pts?: Vector3[]; lift?: number; sag?: number; r?: number; color?: number; lat?: string; latSub?: string; amb?: number; globe?: Vector3 } = {}) => {
    const pts = o.pts || curvePts(a, b, o.lift == null ? 0.4 : o.lift, o.sag), curve = new CatmullRomCurve3(pts);
    const r = o.r || (n === 2 ? 0.035 : 0.022);
    let tm: Material;
    if (n === 1) tm = new MeshBasicMaterial({ color: lin(P.line), wireframe: true });
    else if (n === 5) tm = new MeshBasicMaterial({ color: lin(o.color || P.net), transparent: true, opacity: 0.55 });
    else if (n === 3) tm = new MeshPhysicalMaterial({ color: lin(o.color || P.net), roughness: 0.2, clearcoat: 1 });
    else if (n === 4 || n === 6) tm = new MeshBasicMaterial({ color: lin(o.color || P.net) });
    else tm = new MeshLambertMaterial({ color: lin(o.color || P.net) });
    root.add(new Mesh(new TubeGeometry(curve, 48, r, n === 2 ? 4 : 8, false), tm));
    sc.links[a + ">" + b] = curve;
    if (o.lat) label(curve.getPoint(0.5), o.lat, o.latSub, { lat: true, dy: 0.12, globe: o.globe });
    if (o.amb) sc.ambient.push({ c: curve, off: Math.random(), sp: o.amb });
    return curve;
  };
  const tile = (w: number, d: number) => {
    B(w, 0.3, d, 0, -0.3, 0, "tile");
    if (n === 2) for (let i = 0; i < 40; i++) { const g = add(new BoxGeometry(0.08, 0.08, 0.08), "tile", -w / 2 + Math.random() * w, 0.04, -d / 2 + Math.random() * d); (g.material as Material).dispose(); g.material = new MeshPhongMaterial({ color: lin(0x3faa48), flatShading: true, shininess: 0 }); }
  };

  if (n === 1) {
    tile(7, 4.4);
    B(2.9, 1.2, 2.5, -1.35, 0, 0.15, "building");
    B(0.8, 0.38, 0.5, -1.75, 0, 0.2, "device"); B(0.3, 0.3, 0.3, -1.75, 0.38, 0.2, "device"); node("cube", -1.75, 0.55, 0.2);
    ([[-0.55, -0.55, "t1"], [-0.5, 0.65, "t2"], [-1.3, 1.05, "t3"]] as [number, number, string][]).forEach((t) => { B(0.26, 0.22, 0.22, t[0], 0, t[1], "device"); node(t[2], t[0], 0.24, t[1]); });
    B(0.9, 0.7, 0.7, 2.45, 0, -1.2, "building"); node("slac", 2.45, 0.72, -1.2);
    [[2.0, 1.25], [2.45, 1.45], [2.85, 1.15]].forEach((p) => B(0.32, 0.32, 0.32, p[0], 0, p[1], "building")); node("labs", 2.45, 0.34, 1.3);
    link("t1", "cube", { lift: 0.12, lat: "eth" }); link("t2", "cube", { lift: 0.12, amb: 0.35 }); link("t3", "cube", { lift: 0.12, amb: 0.3 });
    link("slac", "cube", { lift: 1.7, lat: "leased" }); link("labs", "cube", { lift: 1.0, amb: 0.18 });
    label("cube", "cube", "cubeSub", { dy: 0.95 }); label(new Vector3(-2.6, 1.25, -1.0), "cern");
    label("t3", "term", "termSub", { dy: 0.2 }); label("slac", "slac", "slacSub"); label("labs", "labs", "labsSub");
    sc.req = [{ path: ["slac", "cube"], back: true, dur: 2600 }, { path: ["t1", "cube"], back: true, dur: 900 }];
  } else if (n === 2) {
    tile(7.2, 4.4);
    house(-2.65, -0.4, 1.0, 0.9, 0.7);
    B(0.42, 0.34, 0.34, -2.75, 0, 0.75, "device"); B(0.36, 0.3, 0.06, -2.75, 0.34, 0.72, "device"); node("pc", -2.75, 0.62, 0.78);
    B(0.3, 0.08, 0.22, -2.2, 0, 0.85, "server"); node("modem", -2.2, 0.14, 0.85);
    [-1.55, -0.85].forEach((x, i) => { C(0.04, 1.1, x, 0, 0.45, "server", 6); B(0.5, 0.05, 0.05, x, 1.02, 0.45, "server"); node("p" + (i + 1), x, 1.08, 0.45); });
    B(1.1, 1.0, 1.0, 0.25, 0, -0.4, "building"); for (let i = 0; i < 5; i++) { B(0.6, 0.1, 0.3, 0.25, 0.05 + i * 0.13, 0.35, "server"); B(0.05, 0.05, 0.02, 0.45, 0.1 + i * 0.13, 0.51, "accent"); }
    node("isp", 0.25, 0.7, 0.4);
    B(1.2, 1.5, 1.0, 2.5, 0, -0.55, "building"); B(0.32, 0.62, 0.5, 2.45, 0, 0.55, "device"); node("srv", 2.45, 0.66, 0.55);
    link("pc", "modem", { lift: 0.05 }); link("modem", "p1", { lift: 0.2 }); link("p1", "p2", { lift: 0, sag: 0.18, lat: "phone", latSub: "phoneSub" }); link("p2", "isp", { lift: 0.1 });
    link("isp", "srv", { lift: 1.0, r: 0.07, color: P.accent, lat: "backbone" });
    label("pc", "pc", "pcSub"); label("isp", "isp", "ispSub", { dy: 0.7 }); label("srv", "closet", "closetSub");
    sc.req = [{ path: ["pc", "modem", "p1", "p2", "isp", "srv"], back: true, dur: 3400 }];
  } else if (n === 3) {
    tile(7.4, 4.6);
    house(-2.75, -0.6, 1.0, 0.9, 0.7);
    B(0.6, 0.04, 0.4, -2.75, 0, 0.7, "device"); const lid = B(0.6, 0.4, 0.03, -2.75, 0.04, 0.5, "device"); lid.rotation.x = -0.25; node("lap", -2.75, 0.3, 0.62);
    B(0.22, 0.1, 0.16, -2.15, 0, 0.85, "server"); node("dsl", -2.15, 0.12, 0.85);
    B(3.5, 0.04, 2.7, 1.05, 0, 0, "building");
    B(0.62, 0.16, 0.42, -0.35, 0.04, 0.55, "accent"); node("lb", -0.35, 0.26, 0.55);
    ([[0.45, -0.55, "s1"], [0.95, 0.1, "s2"], [1.45, 0.75, "s3"]] as [number, number, string][]).forEach((s) => { B(0.38, 1.0, 0.5, s[0], 0.04, s[1], "server"); node(s[2], s[0], 0.9, s[1]); });
    B(0.42, 0.55, 0.42, 2.1, 0.04, -0.75, "roof"); node("mc", 2.1, 0.62, -0.75);
    C(0.3, 0.7, 2.5, 0.04, 0.45, "db"); node("db", 2.5, 0.78, 0.45);
    link("lap", "dsl", { lift: 0.05 }); link("dsl", "lb", { lift: 0.6, lat: "dsl" });
    link("lb", "s1", { lift: 0.25, amb: 0.45 }); link("lb", "s2", { lift: 0.25, lat: "lbLat" }); link("lb", "s3", { lift: 0.25, amb: 0.4 });
    link("s2", "mc", { lift: 0.3, lat: "mcLat" }); link("mc", "db", { lift: 0.2 }); link("s1", "db", { lift: 0.5, amb: 0.3 }); link("s3", "db", { lift: 0.2, amb: 0.38 });
    const cloud = new Group(); cloud.position.set(0.6, 2.55, -1.2); root.add(cloud);
    [[0, 0, 0, 0.55], [0.6, -0.05, 0.1, 0.42], [-0.6, -0.08, 0.05, 0.45], [0.25, 0.3, -0.1, 0.4], [-0.3, 0.25, 0.1, 0.38]].forEach((b) => add(new IcosahedronGeometry(b[3], 1), "house", b[0], b[1], b[2], cloud));
    [-0.45, 0, 0.45].forEach((x) => B(0.26, 0.2, 0.26, x, -0.75, 0.35, "server", cloud)); add(new CylinderGeometry(0.16, 0.12, 0.26, 16), "db", 0.85, -0.62, 0.3, cloud);
    sc.extra.push((t) => { cloud.position.y = 2.55 + Math.sin(t * 1.1) * 0.08; });
    label("lap", "lap", "lapSub"); label("lb", "lb"); label("s2", "lamp", undefined, { dy: 0.2 }); label("mc", "mc"); label("db", "db");
    label(new Vector3(1.05, 0.05, 1.45), "colo", "coloSub", { dy: 0 });
    label(new Vector3(0.6, 3.15, -1.2), "cloud", "cloudSub", { dy: 0 });
    sc.req = [{ path: ["lap", "dsl", "lb", "s2", "mc", "db"], back: true, dur: 2800 }];
  } else if (n === 4) {
    tile(7.4, 4.6);
    const ph = B(0.26, 0.5, 0.04, -2.55, 0, 0.75, "device"); ph.rotation.x = -0.15; node("ph", -2.55, 0.55, 0.75);
    B(0.7, 0.04, 0.46, -2.6, 0, -0.25, "device"); const lid4 = B(0.7, 0.44, 0.03, -2.6, 0.04, -0.48, "device"); lid4.rotation.x = -0.2; node("lap", -2.6, 0.4, -0.3);
    B(1.7, 0.7, 1.1, -0.3, 0, -1.2, "building"); const gab = add(new CylinderGeometry(0.62, 0.62, 1.1, 3), "roof", -0.3, 1.01, -1.2); gab.rotation.x = -PI / 2; gab.scale.set(1.6, 1, 1);
    node("cdn", -0.3, 1.25, -1.0);
    B(1.4, 0.06, 1.1, 1.35, 0, 0.55, "tile"); ([[0.95, "a1"], [1.35, "a2"], [1.75, "a3"]] as [number, string][]).forEach((a) => { B(0.28, 0.4, 0.28, a[0], 0.06, 0.55, "server"); node(a[1], a[0], 0.5, 0.55); });
    C(0.32, 0.7, 2.65, 0, -0.55, "db"); node("db", 2.65, 0.74, -0.55);
    link("lap", "cdn", { lift: 0.6, amb: 0.25 }); link("cdn", "ph", { lift: 0.9, lat: "l1", latSub: "l1Sub" });
    link("ph", "a2", { lift: 1.0, lat: "l2", latSub: "l2Sub" }); link("a2", "db", { lift: 0.45, lat: "dbLat" }); link("a1", "db", { lift: 0.6, amb: 0.3 }); link("a3", "db", { lift: 0.35, amb: 0.36 });
    label("ph", "ph", "phSub", { dy: 0.36 }); label("cdn", "cdn", "cdnSub", { dy: 0.3 }); label("a2", "api", "apiSub", { dy: 0.3 }); label("db", "db", "dbSub");
    sc.req = [{ path: ["cdn", "ph"], back: false, dur: 1800, cube: true }, { path: ["ph", "a2", "db"], back: true, dur: 2200 }];
  } else if (n === 6) {
    tile(7.4, 4.6);
    C(0.16, 0.5, -2.8, 0, 0.4, "device"); add(new SphereGeometry(0.16, 24, 16), "device", -2.8, 0.68, 0.4); node("you", -2.8, 0.72, 0.4);
    const orb6 = add(new SphereGeometry(0.32, 32, 24), "accent", -1.5, 1.0, 0.2); node("orb", -1.5, 1.0, 0.2);
    sc.extra.push((t) => { orb6.position.y = 1.0 + Math.sin(t * 1.6) * 0.06; });
    const sites: [string, number, number][] = [["shop", 0.9, 1.35], ["news", 1.5, -1.1], ["bank", 2.6, 0.85], ["maps", 0.4, -1.45]];
    sites.forEach((s) => { B(0.7, 0.6, 0.6, s[1], 0, s[2], "building"); node(s[0], s[1], 0.66, s[2]); });
    const gx = -0.35, gz = 1.0; B(0.07, 0.9, 0.07, gx - 0.32, 0, gz, "db"); B(0.07, 0.9, 0.07, gx + 0.32, 0, gz, "db"); B(0.8, 0.08, 0.1, gx, 0.9, gz, "db"); node("gate", gx, 0.5, gz);
    link("you", "orb", { lift: 0.3, lat: "intent" });
    link("orb", "gate", { lift: 0.5 }); link("gate", "shop", { lift: 0.2 });
    link("orb", "news", { lift: 0.9, amb: 0.3 }); link("orb", "bank", { lift: 0.6 }); link("orb", "maps", { lift: 0.4, amb: 0.35 });
    label("you", "you"); label("orb", "agent", undefined, { dy: 0.5 }); label("gate", "gate", "gateSub", { dy: 0.58 });
    sites.forEach((s) => label(s[0], s[0], s[0] + "Sub"));
    sc.req = [{ path: ["you", "orb"], back: false, dur: 900 }, { path: ["orb", "gate", "shop"], back: true, dur: 1900 }, { path: ["orb", "bank"], back: true, dur: 1400, cube: true }];
  } else {
    const R = 1.25, G = new Vector3(0, 1.3, 0), globe = new Group(); globe.position.copy(G); root.add(globe);
    add(new CylinderGeometry(2.6, 2.7, 0.12, 64), "tile", 0, -0.06, 0);
    globe.add(new Mesh(new SphereGeometry(R * 0.985, 48, 32), new MeshPhysicalMaterial({ color: lin(0x101116), roughness: 0.5, transparent: true, opacity: 0.92 })));
    globe.add(new LineSegments(new WireframeGeometry(new IcosahedronGeometry(R, 3)), new LineBasicMaterial({ color: lin(P.net), transparent: true, opacity: 0.14 })));
    const ll = (lat: number, lon: number, r: number) => { const ph2 = ((90 - lat) * PI) / 180, th = ((lon + 180) * PI) / 180; return new Vector3(-r * Math.sin(ph2) * Math.cos(th), r * Math.cos(ph2), r * Math.sin(ph2) * Math.sin(th)).add(G); };
    const cities: [string, number, number][] = [["c1", 37.8, -122.4], ["c2", -23.5, -46.6], ["c3", 51.5, -0.1], ["c4", 6.5, 3.4], ["c5", -33.9, 18.4], ["c6", 19.1, 72.9], ["c7", 35.7, 139.7], ["c8", -33.9, 151.2], ["c9", 50.1, 8.7]];
    const pinM = new MeshBasicMaterial({ color: lin(P.net) }), pins: Mesh[] = [];
    cities.forEach((c) => { const m = new Mesh(new SphereGeometry(0.035, 12, 8), pinM); m.position.copy(ll(c[1], c[2], R * 1.01)); root.add(m); pins.push(m); label(ll(c[1], c[2], R * 1.04), c[0], undefined, { globe: G, dy: 0.1 }); });
    const big = (lat: number, lon: number, col: number, k: string) => { const m = new Mesh(new SphereGeometry(0.06, 16, 12), new MeshBasicMaterial({ color: lin(col) })); m.position.copy(ll(lat, lon, R * 1.02)); root.add(m); node(k, m.position.x, m.position.y, m.position.z); };
    big(-6.2, 106.8, 0xffffff, "jak"); big(1.35, 103.8, P.net, "sgp"); big(38.9, -77.4, P.accent, "use");
    const arc = (a: string, b: string, h: number) => {
      const A = sc.nodes[a].clone().sub(G).normalize(), Bv = sc.nodes[b].clone().sub(G).normalize(), pts: Vector3[] = [], ang = A.angleTo(Bv), ax = new Vector3().crossVectors(A, Bv).normalize();
      for (let i = 0; i <= 40; i++) { const t = i / 40; pts.push(A.clone().applyAxisAngle(ax, ang * t).multiplyScalar(R * 1.02 + Math.sin(PI * t) * h).add(G)); }
      return pts;
    };
    link("jak", "sgp", { pts: arc("jak", "sgp", 0.12), lat: "near", globe: G }); link("sgp", "use", { pts: arc("sgp", "use", 0.95), lat: "far", globe: G, color: P.accent });
    label("jak", "you", undefined, { globe: G, dy: 0.16 }); label("sgp", "edge", "edgeSub", { globe: G, dy: 0.16 }); label("use", "db", "dbSub", { globe: G, dy: 0.16 });
    const ring = new Mesh(new TorusGeometry(2.15, 0.015, 8, 120), new MeshBasicMaterial({ color: lin(P.accent), transparent: true, opacity: 0.6 })); ring.rotation.x = PI / 2; ring.position.y = 0.12; root.add(ring);
    const rpts: Vector3[] = []; for (let i = 0; i <= 64; i++) { const a = (i / 64) * PI * 2; rpts.push(new Vector3(Math.cos(a) * 2.15, 0.12, Math.sin(a) * 2.15)); }
    sc.ambient.push({ c: new CatmullRomCurve3(rpts, true), off: 0, sp: 0.12, big: true });
    ([["push"], ["build", "buildSub"], ["deploy"], ["preview"]] as [string, string?][]).forEach((s, i) => {
      const a = (i / 4) * PI * 2 + 0.4, p = new Vector3(Math.cos(a) * 2.15, 0.12, Math.sin(a) * 2.15);
      const m = new Mesh(new SphereGeometry(0.06, 12, 8), new MeshBasicMaterial({ color: lin(P.accent) })); m.position.copy(p); root.add(m); label(p, s[0], s[1], { dy: 0.14 });
    });
    sc.extra.push((t) => pins.forEach((m, i) => { const k = 1 + Math.max(0, Math.sin(t * 2 - i * 0.7)) * 0.8; m.scale.set(k, k, k); }));
    const jk = sc.nodes.jak.clone().sub(G); sc.yaw = -Math.atan2(jk.x, jk.z) + 0.35; sc.pitch = 0.05;
    sc.req = [{ path: ["jak", "sgp", "use"], back: true, dur: 3000 }];
  }
  if (n !== 5) sc.pitch = 0;
  sc.base = sc.yaw;
  sc.pk = new Mesh(new SphereGeometry(n === 2 ? 0.09 : 0.07, n === 2 ? 6 : 16, n === 2 ? 4 : 12), new MeshBasicMaterial({ color: lin(P.out) })); sc.pk.visible = false; root.add(sc.pk);
  sc.cube = new Mesh(new BoxGeometry(0.2, 0.2, 0.2), new MeshBasicMaterial({ color: lin(n === 4 ? 0xf1c40f : n === 6 ? 0xffc94d : P.out) })); sc.cube.visible = false; root.add(sc.cube);
  sc.ambient.forEach((a) => { a.m = new Mesh(new SphereGeometry(a.big ? 0.06 : 0.035, 8, 6), new MeshBasicMaterial({ color: lin(a.big ? P.out : P.net || P.line), transparent: true, opacity: 0.8 })); root.add(a.m); });
  sc.labelEls = sc.labels.map(() => null);
  return sc;
}

function pathCurve(sc: DioScene, keys: string[]) {
  let pts: Vector3[] = [];
  for (let i = 0; i < keys.length - 1; i++) {
    let f = sc.links[keys[i] + ">" + keys[i + 1]], rev = false;
    if (!f) { f = sc.links[keys[i + 1] + ">" + keys[i]]; rev = true; }
    const p = f.getPoints(30); if (rev) p.reverse(); if (i) p.shift(); pts = pts.concat(p);
  }
  return new CatmullRomCurve3(pts);
}

/** Owns the shared renderer and every built diorama. One instance per mounted story. */
export class Dioramas {
  private r: WebGLRenderer | null = null;
  private failed = false;
  private scenes = new Map<DioN, DioScene>();
  private active: DioN | 0 = 0;
  private raf = 0;
  private last = 0;
  private v = new Vector3();
  private w = new Vector3();

  /** set by the story: render only while the screen layer is showing */
  private isVisible: () => boolean = () => true;
  setVisibility(fn: () => boolean) { this.isVisible = fn; }

  /** false when WebGL can't be had: callers fall back to the SVG diagrams. */
  ok(): boolean {
    return !this.failed && !!this.renderer();
  }

  private renderer(): WebGLRenderer | null {
    if (this.r || this.failed) return this.r;
    try {
      const c = document.createElement("canvas");
      c.className = "po-dio-cv";
      const gl = c.getContext("webgl2", { antialias: true }); // quiet failure when WebGL is blocked
      if (!gl) throw new Error("no webgl");
      const r = new WebGLRenderer({ canvas: c, context: gl, antialias: true });
      if (!r.getContext()) throw new Error("no ctx");
      r.outputColorSpace = SRGBColorSpace;
      c.addEventListener("webglcontextlost", (e) => { e.preventDefault(); this.failed = true; });
      this.r = r;
    } catch {
      this.failed = true;
      this.r = null;
    }
    return this.r;
  }

  labels(n: DioN): DioLabel[] {
    return this.scene(n).labels.map(({ title, sub, lat }) => ({ title, sub, lat }));
  }

  private scene(n: DioN): DioScene {
    let sc = this.scenes.get(n);
    if (!sc) { sc = buildDio(n); this.scenes.set(n, sc); }
    return sc;
  }

  activate(n: DioN, view: HTMLElement, labelEls: (HTMLElement | null)[]) {
    const r = this.renderer();
    if (!r) return;
    const sc = this.scene(n);
    sc.view = view; sc.w = 0; sc.labelEls = labelEls;
    view.insertBefore(r.domElement, view.firstChild);
    r.domElement.style.imageRendering = n === 2 ? "pixelated" : "";
    this.active = n;
    if (!this.raf) { this.last = performance.now(); this.raf = requestAnimationFrame(this.loop); }
  }

  deactivate(n: DioN) {
    if (this.active === n) this.active = 0;
  }

  send(n: DioN) {
    const sc = this.scenes.get(n);
    if (!sc) return;
    sc.run = { leg: 0, t0: performance.now(), curves: sc.req.map((l) => ({ c: l.path.length > 1 ? pathCurve(sc, l.path) : null, l })) };
  }

  isActive(n: DioN) { return this.active === n; }

  drag(n: DioN, on: boolean) { const sc = this.scenes.get(n); if (sc) sc.drag = on; }
  orbit(n: DioN): { uyaw: number; pitch: number } { const sc = this.scenes.get(n); return { uyaw: sc?.uyaw ?? 0, pitch: sc?.pitch ?? 0 }; }
  setOrbit(n: DioN, uyaw: number, pitch?: number) {
    const sc = this.scenes.get(n); if (!sc) return;
    sc.uyaw = uyaw; if (pitch != null) sc.pitch = clamp(pitch, -0.2, 0.35);
  }

  private loop = (now: number) => {
    const sc = this.active ? this.scenes.get(this.active) : undefined;
    if (!sc || !this.r) { this.raf = 0; return; }
    this.raf = requestAnimationFrame(this.loop);
    const dt = Math.min(0.05, (now - this.last) / 1000); this.last = now; const t = now / 1000;
    if (!this.isVisible()) return;
    const v = sc.view; if (!v) return;
    const w = v.clientWidth, h = v.clientHeight; if (!w || !h) return;
    const r = this.r;
    if (sc.w !== w || sc.h !== h || r.domElement.parentNode !== v) {
      if (r.domElement.parentNode !== v) v.insertBefore(r.domElement, v.firstChild);
      r.setPixelRatio(sc.pr); r.setSize(w, h, false); sc.cam.aspect = w / h; sc.cam.updateProjectionMatrix(); sc.w = w; sc.h = h;
    }
    if (!sc.drag) sc.idle += dt;
    sc.root.rotation.y = sc.base + sc.uyaw + Math.sin(sc.idle * 0.25) * 0.3; sc.root.rotation.x = sc.pitch;
    sc.extra.forEach((f) => f(t));
    sc.ambient.forEach((a) => { const k = (t * a.sp + a.off) % 1; a.m!.position.copy(a.c.getPointAt(k)); });
    const run = sc.run; sc.pk.visible = sc.cube.visible = false;
    if (run) {
      const leg = run.curves[run.leg], L = leg.l, el = now - run.t0, D = L.dur || 2400, total = L.back ? D * 2 : D;
      if (el > total + 250) { run.leg++; run.t0 = now; if (run.leg >= run.curves.length) { sc.run = null; sc.nextAuto = now + 5200; } }
      else if (leg.c) {
        let k = Math.min(1, el / D); const back = L.back && el > D; if (back) k = 1 - Math.min(1, (el - D) / D);
        const e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2, m = L.cube ? sc.cube : sc.pk;
        m.visible = true; m.position.copy(leg.c.getPointAt(clamp(e)));
        if (back) m.material.color.copy(lin(PAL[sc.n].back)); else if (!L.cube) m.material.color.copy(lin(PAL[sc.n].out));
        if (L.cube) { m.rotation.x += dt * 2; m.rotation.y += dt * 3; }
      }
    } else if (sc.nextAuto && now > sc.nextAuto) { sc.nextAuto = 0; this.send(sc.n); }
    r.render(sc.scene, sc.cam);
    sc.root.updateMatrixWorld();
    sc.labels.forEach((L, i) => {
      const d = sc.labelEls[i]; if (!d) return;
      const pv = this.v.copy(L.p); pv.y += L.dy; sc.root.localToWorld(pv);
      let hide = false;
      if (L.globe) {
        const gw = this.w.copy(L.globe); sc.root.localToWorld(gw);
        const nrm = pv.clone().sub(gw), toCam = sc.cam.position.clone().sub(gw);
        hide = nrm.dot(toCam) < 0.05 * nrm.length() * toCam.length();
      }
      pv.project(sc.cam); if (pv.z > 1) hide = true;
      d.classList.toggle("po-hide", hide);
      d.style.transform = "translate(" + ((pv.x * 0.5 + 0.5) * w).toFixed(1) + "px," + ((-pv.y * 0.5 + 0.5) * h).toFixed(1) + "px) translate(-50%,-100%)";
    });
  };

  /** Frees everything; the instance can lazily rebuild if used again (StrictMode remounts). */
  dispose() {
    this.active = 0;
    cancelAnimationFrame(this.raf); this.raf = 0;
    this.scenes.forEach((sc) => sc.scene.traverse((o) => {
      const m = o as Mesh;
      m.geometry?.dispose();
      const mat = m.material as Material | Material[] | undefined;
      if (Array.isArray(mat)) mat.forEach((x) => x.dispose()); else mat?.dispose();
    }));
    this.scenes.clear();
    if (this.r) { this.r.dispose(); this.r.forceContextLoss(); this.r.domElement.remove(); this.r = null; }
  }
}
