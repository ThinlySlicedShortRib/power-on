// ================= 3D DIORAMAS ("where it lived") =================
// One shared WebGL renderer; its canvas moves into whichever diorama is on stage. Renders only while visible.
var DIO = { r: null, failed: false, scenes: {}, active: 0, raf: 0, last: 0 };
var DIO_CAP = {
  1: "The whole web: one machine at CERN. Latencies are rough.",
  2: "A 100 KB page at 28.8 kbit/s took about 30 s. Latencies are rough.",
  3: "2004: you own the boxes. 2006: you rent them. Latencies are rough.",
  4: "Step 1 downloads the app. Step 2 asks the API for data.",
  5: "Code runs near you. The data usually doesn't.",
  6: "Packets carry intents, not pages. The gate checks the agent's signature first."
};
function dioOK() { return !!(window.THREE && GL && !REDUCE && !DIO.failed && dioRenderer()); }
function dioRenderer() {
  if (DIO.r || DIO.failed) return DIO.r;
  try { var c = document.createElement("canvas"); c.className = "dio-cv"; var r = new THREE.WebGLRenderer({ canvas: c, antialias: true });
    if (!r.getContext()) throw new Error("no ctx"); r.outputEncoding = THREE.sRGBEncoding; DIO.r = r; }
  catch (e) { DIO.failed = true; DIO.r = null; }
  return DIO.r;
}
var DIO_PAL = {
  1: { bg: 0x020602, line: 0x3dff72, fill: 0x03200b, out: 0xb6ffca, back: 0xffd23d },
  2: { bg: 0x000030, tile: 0x2f8a3a, building: 0xc0c0c0, device: 0xd9cfb3, server: 0x8a8a8a, db: 0xffd400, accent: 0xff00ff, net: 0x00ffff, roof: 0xb22222, house: 0xff8a65, out: 0xff00ff, back: 0x00ffff },
  3: { bg: 0xe9f3fb, tile: 0xffffff, building: 0xdbe9f6, device: 0xf4f4f2, server: 0x9cc9f0, db: 0xff7a1a, accent: 0xff6a00, net: 0x2a7cc8, roof: 0x7cc242, house: 0xffffff, out: 0xff6a00, back: 0x2a7cc8 },
  4: { bg: 0xecf0f1, tile: 0xffffff, building: 0x3498db, device: 0x2c3e50, server: 0x9b59b6, db: 0xe67e22, accent: 0xe74c3c, net: 0x1abc9c, roof: 0x2980b9, house: 0x34495e, out: 0xe74c3c, back: 0x1abc9c },
  6: { bg: 0xeef2ef, tile: 0xffffff, building: 0xdfe7e2, device: 0x2a3330, server: 0xcfd9d3, db: 0xff5a36, accent: 0x0fa3a3, net: 0x0fa3a3, roof: 0xdfe7e2, house: 0xffffff, out: 0x0fa3a3, back: 0xff5a36 },
  5: { bg: 0x0b0b0d, tile: 0x141418, building: 0x22232a, device: 0x2a2b33, server: 0x22232a, db: 0xff9a4d, accent: 0xff9a4d, net: 0x7dd3c0, roof: 0x22232a, house: 0x22232a, out: 0xff9a4d, back: 0x7dd3c0 }
};

function buildDio(n) {
  var T = THREE, P = DIO_PAL[n], scene = new T.Scene(), root = new T.Group(); scene.add(root);
  scene.background = new T.Color(P.bg);
  scene.add(new T.HemisphereLight(0xffffff, n === 5 ? 0x111118 : 0x8899aa, n === 4 ? .95 : .75));
  var dl = new T.DirectionalLight(0xffffff, n === 4 ? .45 : .8); dl.position.set(3, 6, 4); scene.add(dl);
  var cam = new T.PerspectiveCamera(n === 5 ? 34 : 32, 1.6, .1, 80);
  if (n === 5) { cam.position.set(0, 2.4, 7.4); cam.lookAt(0, 1.25, 0); } else { cam.position.set(0, 4.4, 8.4); cam.lookAt(0, .5, 0); }
  var sc = { n: n, scene: scene, root: root, cam: cam, nodes: {}, links: {}, labels: [], ambient: [], req: [], pr: n === 2 ? .38 : Math.min(window.devicePixelRatio || 1, 2), yaw: 0, uyaw: 0, pitch: 0, w: 0, h: 0, extra: [] };

  function mat(role) {
    if (n === 1) return new T.MeshBasicMaterial({ color: P.fill, transparent: true, opacity: .55 });
    var c = P[role] != null ? P[role] : P.building;
    if (n === 2) return new T.MeshPhongMaterial({ color: c, flatShading: true, shininess: 0 });
    if (n === 3) return new T.MeshPhysicalMaterial({ color: c, roughness: .16, clearcoat: 1, clearcoatRoughness: .1 });
    if (n === 4) return new T.MeshLambertMaterial({ color: c });
    if (n === 6) return role === "accent" ? new T.MeshPhysicalMaterial({ color: 0x0fa3a3, emissive: 0x0b6f6f, emissiveIntensity: .8, roughness: .15, clearcoat: 1 }) : new T.MeshStandardMaterial({ color: c, roughness: .45 });
    return new T.MeshPhysicalMaterial({ color: c, roughness: .3, metalness: .2, transparent: true, opacity: role === "db" || role === "accent" ? .95 : .6 });
  }
  function add(geo, role, x, y, z, parent) {
    var m = new T.Mesh(geo, mat(role)); m.position.set(x, y, z); (parent || root).add(m);
    if (n === 1 || n === 5) { var e = new T.LineSegments(new T.EdgesGeometry(geo, 25), new T.LineBasicMaterial({ color: n === 1 ? P.line : 0xffffff, transparent: n === 5, opacity: n === 5 ? .28 : 1 })); m.add(e); }
    return m;
  }
  function B(w, h, d, x, y, z, role, parent) { return add(new T.BoxGeometry(w, h, d), role, x, y + h / 2, z, parent); }
  function C(r, h, x, y, z, role, seg) { return add(new T.CylinderGeometry(r, r, h, seg || (n === 2 ? 8 : 24)), role, x, y + h / 2, z); }
  function house(x, z, w, d, h) { B(w, h, d, x, 0, z, "house"); var roof = add(new T.ConeGeometry(Math.max(w, d) * .78, h * .7, 4), "roof", x, h + h * .35, z); roof.rotation.y = Math.PI / 4; }
  function node(k, x, y, z) { sc.nodes[k] = new T.Vector3(x, y, z); }
  function label(at, title, sub, opts) { sc.labels.push({ p: at instanceof T.Vector3 ? at : sc.nodes[at], html: "<b>" + title + "</b>" + (sub ? "<small>" + sub + "</small>" : ""), lat: opts && opts.lat, globe: opts && opts.globe, dy: (opts && opts.dy) || .28 }); }
  function curvePts(a, b, lift, sag) {
    var pa = sc.nodes[a], pb = sc.nodes[b], pts = [];
    for (var i = 0; i <= 24; i++) { var t = i / 24, p = pa.clone().lerp(pb, t); p.y += Math.sin(Math.PI * t) * (lift || 0) - (sag ? Math.sin(Math.PI * t) * sag : 0); pts.push(p); }
    return pts;
  }
  function link(a, b, o) {
    o = o || {}; var pts = o.pts || curvePts(a, b, o.lift == null ? .4 : o.lift, o.sag), curve = new T.CatmullRomCurve3(pts);
    var r = o.r || (n === 2 ? .035 : .022), tm;
    if (n === 1) tm = new T.MeshBasicMaterial({ color: P.line, wireframe: true });
    else if (n === 5) tm = new T.MeshBasicMaterial({ color: o.color || P.net, transparent: true, opacity: .55 });
    else if (n === 3) tm = new T.MeshPhysicalMaterial({ color: o.color || P.net, roughness: .2, clearcoat: 1 });
    else tm = new (n === 4 || n === 6 ? T.MeshBasicMaterial : T.MeshLambertMaterial)({ color: o.color || P.net });
    var tube = new T.Mesh(new T.TubeGeometry(curve, 48, r, n === 2 ? 4 : 8, false), tm); root.add(tube);
    sc.links[a + ">" + b] = curve;
    if (o.lat) label(curve.getPoint(.5), o.lat, o.latSub || "", { lat: true, dy: .12, globe: o.globe });
    if (o.amb) sc.ambient.push({ c: curve, off: Math.random(), sp: o.amb });
    return curve;
  }
  function pathCurve(keys) {
    var pts = [];
    for (var i = 0; i < keys.length - 1; i++) {
      var f = sc.links[keys[i] + ">" + keys[i + 1]], rev = false;
      if (!f) { f = sc.links[keys[i + 1] + ">" + keys[i]]; rev = true; }
      var p = f.getPoints(30); if (rev) p.reverse(); if (i) p.shift(); pts = pts.concat(p);
    }
    return new T.CatmullRomCurve3(pts);
  }
  function tile(w, d) { var t = B(w, .3, d, 0, -.3, 0, "tile"); if (n === 2) { for (var i = 0; i < 40; i++) { var g = add(new T.BoxGeometry(.08, .08, .08), "tile", -w / 2 + Math.random() * w, .04, -d / 2 + Math.random() * d); g.material = new T.MeshPhongMaterial({ color: 0x3faa48, flatShading: true, shininess: 0 }); } } return t; }

  if (n === 1) {
    tile(7, 4.4);
    B(2.9, 1.2, 2.5, -1.35, 0, .15, "building");
    B(.8, .38, .5, -1.75, 0, .2, "device"); B(.3, .3, .3, -1.75, .38, .2, "device"); node("cube", -1.75, .55, .2);
    [[-0.55, -.55, "t1"], [-0.5, .65, "t2"], [-1.3, 1.05, "t3"]].forEach(function (t) { B(.26, .22, .22, t[0], 0, t[1], "device"); node(t[2], t[0], .24, t[1]); });
    B(.9, .7, .7, 2.45, 0, -1.2, "building"); node("slac", 2.45, .72, -1.2);
    [[2.0, 1.25], [2.45, 1.45], [2.85, 1.15]].forEach(function (p) { B(.32, .32, .32, p[0], 0, p[1], "building"); }); node("labs", 2.45, .34, 1.3);
    link("t1", "cube", { lift: .12, lat: "Ethernet · ~1 ms" }); link("t2", "cube", { lift: .12, amb: .35 }); link("t3", "cube", { lift: .12, amb: .3 });
    link("slac", "cube", { lift: 1.7, lat: "leased line · ~0.5 s" }); link("labs", "cube", { lift: 1.0, amb: .18 });
    label("cube", "NeXTcube", "Tim's desk · httpd", { dy: .95 }); label(new T.Vector3(-2.6, 1.25, -1.0), "CERN · Geneva", "");
    label("t3", "terminals", "line-mode browser", { dy: .2 }); label("slac", "SLAC · Stanford", "1st US server, Dec 1991"); label("labs", "Labs &amp; universities", "~50 servers by Jan 1993");
    sc.req = [{ path: ["slac", "cube"], back: true, dur: 2600 }, { path: ["t1", "cube"], back: true, dur: 900 }];
  } else if (n === 2) {
    tile(7.2, 4.4);
    house(-2.65, -.4, 1.0, .9, .7);
    B(.42, .34, .34, -2.75, 0, .75, "device"); B(.36, .3, .06, -2.75, .34, .72, "device"); node("pc", -2.75, .62, .78);
    var mo = B(.3, .08, .22, -2.2, 0, .85, "server"); node("modem", -2.2, .14, .85);
    [-1.55, -.85].forEach(function (x, i) { C(.04, 1.1, x, 0, .45, "server", 6); B(.5, .05, .05, x, 1.02, .45, "server"); node("p" + (i + 1), x, 1.08, .45); });
    B(1.1, 1.0, 1.0, .25, 0, -.4, "building"); for (var i = 0; i < 5; i++) { B(.6, .1, .3, .25, .05 + i * .13, .35, "server"); B(.05, .05, .02, .45, .1 + i * .13, .51, "accent"); }
    node("isp", .25, .7, .4);
    B(1.2, 1.5, 1.0, 2.5, 0, -.55, "building"); B(.32, .62, .5, 2.45, 0, .55, "device"); node("srv", 2.45, .66, .55);
    link("pc", "modem", { lift: .05 }); link("modem", "p1", { lift: .2 }); link("p1", "p2", { lift: 0, sag: .18, lat: "phone line · ~150 ms", latSub: "dial tone, screech" }); link("p2", "isp", { lift: .1 });
    link("isp", "srv", { lift: 1.0, r: .07, color: P.accent, lat: "internet backbone · ~80 ms" });
    label("pc", "your PC", "28.8k → 56k modem"); label("isp", "ISP", "dial-up modem pool", { dy: .7 }); label("srv", "office closet", "Apache · Perl/PHP · MySQL");
    sc.req = [{ path: ["pc", "modem", "p1", "p2", "isp", "srv"], back: true, dur: 3400 }];
  } else if (n === 3) {
    tile(7.4, 4.6);
    house(-2.75, -.6, 1.0, .9, .7);
    B(.6, .04, .4, -2.75, 0, .7, "device"); var lid = B(.6, .4, .03, -2.75, .04, .5, "device"); lid.rotation.x = -.25; node("lap", -2.75, .3, .62);
    B(.22, .1, .16, -2.15, 0, .85, "server"); node("dsl", -2.15, .12, .85);
    B(3.5, .04, 2.7, 1.05, 0, 0, "building");
    B(.62, .16, .42, -.35, .04, .55, "accent"); node("lb", -.35, .26, .55);
    [[.45, -.55, "s1"], [.95, .1, "s2"], [1.45, .75, "s3"]].forEach(function (s) { B(.38, 1.0, .5, s[0], .04, s[1], "server"); node(s[2], s[0], .9, s[1]); });
    B(.42, .55, .42, 2.1, .04, -.75, "roof"); node("mc", 2.1, .62, -.75);
    C(.3, .7, 2.5, .04, .45, "db"); node("db", 2.5, .78, .45);
    link("lap", "dsl", { lift: .05 }); link("dsl", "lb", { lift: .6, lat: "DSL · ~40 ms" });
    link("lb", "s1", { lift: .25, amb: .45 }); link("lb", "s2", { lift: .25, lat: "<1 ms" }); link("lb", "s3", { lift: .25, amb: .4 });
    link("s2", "mc", { lift: .3, lat: "~0.2 ms" }); link("mc", "db", { lift: .2 }); link("s1", "db", { lift: .5, amb: .3 }); link("s3", "db", { lift: .2, amb: .38 });
    var cloud = new T.Group(); cloud.position.set(.6, 2.55, -1.2); root.add(cloud);
    [[0, 0, 0, .55], [.6, -.05, .1, .42], [-.6, -.08, .05, .45], [.25, .3, -.1, .4], [-.3, .25, .1, .38]].forEach(function (b) { add(new T.IcosahedronGeometry(b[3], 1), "house", b[0], b[1], b[2], cloud); });
    [-.45, 0, .45].forEach(function (x) { var e2 = B(.26, .2, .26, x, -.75, .35, "server", cloud); }); var s3b = add(new T.CylinderGeometry(.16, .12, .26, 16), "db", .85, -.62, .3, cloud);
    sc.extra.push(function (t) { cloud.position.y = 2.55 + Math.sin(t * 1.1) * .08; });
    label("lap", "laptop", "DSL · ~3 Mbit/s"); label("lb", "load balancer", ""); label("s2", "LAMP ×3", "", { dy: .2 }); label("mc", "memcached", ""); label("db", "MySQL", "");
    label(new T.Vector3(1.05, .05, 1.45), "2004 · colocation", "you own the boxes", { dy: 0 });
    label(new T.Vector3(.6, 3.15, -1.2), "EC2 · S3", "2006 → rent servers by the hour", { dy: 0 });
    sc.req = [{ path: ["lap", "dsl", "lb", "s2", "mc", "db"], back: true, dur: 2800 }];
  } else if (n === 4) {
    tile(7.4, 4.6);
    var ph = B(.26, .5, .04, -2.55, 0, .75, "device"); ph.rotation.x = -.15; node("ph", -2.55, .55, .75);
    B(.7, .04, .46, -2.6, 0, -.25, "device"); var lid4 = B(.7, .44, .03, -2.6, .04, -.48, "device"); lid4.rotation.x = -.2; node("lap", -2.6, .4, -.3);
    B(1.7, .7, 1.1, -.3, 0, -1.2, "building"); var gab = add(new T.CylinderGeometry(.62, .62, 1.1, 3), "roof", -.3, 1.01, -1.2); gab.rotation.x = -Math.PI / 2; gab.scale.set(1.6, 1, 1);
    node("cdn", -.3, 1.25, -1.0);
    B(1.4, .06, 1.1, 1.35, 0, .55, "tile"); [[.95, "a1"], [1.35, "a2"], [1.75, "a3"]].forEach(function (a) { B(.28, .4, .28, a[0], .06, .55, "server"); node(a[1], a[0], .5, .55); });
    C(.32, .7, 2.65, 0, -.55, "db"); node("db", 2.65, .74, -.55);
    link("lap", "cdn", { lift: .6, amb: .25 }); link("cdn", "ph", { lift: .9, lat: "1 · ~30 ms", latSub: "bundle.js · ~1 MB" });
    link("ph", "a2", { lift: 1.0, lat: "2 · ~120 ms", latSub: "JSON over HTTP" }); link("a2", "db", { lift: .45, lat: "~5 ms" }); link("a1", "db", { lift: .6, amb: .3 }); link("a3", "db", { lift: .35, amb: .36 });
    label("ph", "phone + laptop", "the app runs here", { dy: .36 }); label("cdn", "CDN", "React · bundle.js", { dy: .3 }); label("a2", "JSON API", "PaaS dynos", { dy: .3 }); label("db", "Postgres", "managed DB");
    sc.req = [{ path: ["cdn", "ph"], back: false, dur: 1800, cube: true }, { path: ["ph", "a2", "db"], back: true, dur: 2200 }];
  } else if (n === 6) {
    tile(7.4, 4.6);
    C(.16, .5, -2.8, 0, .4, "device"); add(new T.SphereGeometry(.16, 24, 16), "device", -2.8, .68, .4); node("you", -2.8, .72, .4);
    var orb6 = add(new T.SphereGeometry(.32, 32, 24), "accent", -1.5, 1.0, .2); node("orb", -1.5, 1.0, .2);
    sc.extra.push(function (t) { orb6.position.y = 1.0 + Math.sin(t * 1.6) * .06; });
    var sites = [["shop", .9, 1.35, "shop", "WebMCP tools"], ["news", 1.5, -1.1, "news site", "llms.txt"], ["bank", 2.6, .85, "bank", "payment token"], ["maps", .4, -1.45, "maps", "MCP server"]];
    sites.forEach(function (s) { B(.7, .6, .6, s[1], 0, s[2], "building"); node(s[0], s[1], .66, s[2]); });
    var gx = -.35, gz = 1.0; B(.07, .9, .07, gx - .32, 0, gz, "db"); B(.07, .9, .07, gx + .32, 0, gz, "db"); B(.8, .08, .1, gx, .9, gz, "db"); node("gate", gx, .5, gz);
    link("you", "orb", { lift: .3, lat: "intent" });
    link("orb", "gate", { lift: .5 }); link("gate", "shop", { lift: .2 });
    link("orb", "news", { lift: .9, amb: .3 }); link("orb", "bank", { lift: .6 }); link("orb", "maps", { lift: .4, amb: .35 });
    label("you", "you", ""); label("orb", "your agent", "", { dy: .5 }); label("gate", "bot gate", "signed request check", { dy: .58 });
    sites.forEach(function (s) { label(s[0], s[3], s[4]); });
    sc.req = [{ path: ["you", "orb"], back: false, dur: 900 }, { path: ["orb", "gate", "shop"], back: true, dur: 1900 }, { path: ["orb", "bank"], back: true, dur: 1400, cube: true }];
  } else {
    var R = 1.25, G = new T.Vector3(0, 1.3, 0), globe = new T.Group(); globe.position.copy(G); root.add(globe);
    var disc = add(new T.CylinderGeometry(2.6, 2.7, .12, 64), "tile", 0, -.06, 0);
    globe.add(new T.Mesh(new T.SphereGeometry(R * .985, 48, 32), new T.MeshPhysicalMaterial({ color: 0x101116, roughness: .5, transparent: true, opacity: .92 })));
    globe.add(new T.LineSegments(new T.WireframeGeometry(new T.IcosahedronGeometry(R, 3)), new T.LineBasicMaterial({ color: P.net, transparent: true, opacity: .14 })));
    function ll(lat, lon, r) { var ph2 = (90 - lat) * Math.PI / 180, th = (lon + 180) * Math.PI / 180; return new T.Vector3(-r * Math.sin(ph2) * Math.cos(th), r * Math.cos(ph2), r * Math.sin(ph2) * Math.sin(th)).add(G); }
    var cities = [["San Francisco", 37.8, -122.4], ["São Paulo", -23.5, -46.6], ["London", 51.5, -.1], ["Lagos", 6.5, 3.4], ["Cape Town", -33.9, 18.4], ["Mumbai", 19.1, 72.9], ["Tokyo", 35.7, 139.7], ["Sydney", -33.9, 151.2], ["Frankfurt", 50.1, 8.7]];
    var pinM = new T.MeshBasicMaterial({ color: P.net }), pins = [];
    cities.forEach(function (c) { var p = ll(c[1], c[2], R * 1.01), m = new T.Mesh(new T.SphereGeometry(.035, 12, 8), pinM); m.position.copy(p); root.add(m); pins.push(m); label(ll(c[1], c[2], R * 1.04), c[0], "", { globe: G, dy: .1 }); });
    var big = function (lat, lon, col, k) { var m = new T.Mesh(new T.SphereGeometry(.06, 16, 12), new T.MeshBasicMaterial({ color: col })); m.position.copy(ll(lat, lon, R * 1.02)); root.add(m); node(k, m.position.x, m.position.y, m.position.z); };
    big(-6.2, 106.8, 0xffffff, "jak"); big(1.35, 103.8, P.net, "sgp"); big(38.9, -77.4, P.accent, "use");
    function arc(a, b, h) { var A = sc.nodes[a].clone().sub(G).normalize(), Bv = sc.nodes[b].clone().sub(G).normalize(), pts = [], ang = A.angleTo(Bv), ax = new T.Vector3().crossVectors(A, Bv).normalize();
      for (var i = 0; i <= 40; i++) { var t = i / 40, v = A.clone().applyAxisAngle(ax, ang * t).multiplyScalar(R * 1.02 + Math.sin(Math.PI * t) * h).add(G); pts.push(v); } return pts; }
    link("jak", "sgp", { pts: arc("jak", "sgp", .12), lat: "~10 ms", globe: G }); link("sgp", "use", { pts: arc("sgp", "use", .95), lat: "~220 ms round trip to the data", globe: G, color: P.accent });
    label("jak", "you, Jakarta", "", { globe: G, dy: .16 }); label("sgp", "edge function", "Singapore", { globe: G, dy: .16 }); label("use", "database", "US East", { globe: G, dy: .16 });
    var ring = new T.Mesh(new T.TorusGeometry(2.15, .015, 8, 120), new T.MeshBasicMaterial({ color: P.accent, transparent: true, opacity: .6 })); ring.rotation.x = Math.PI / 2; ring.position.y = .12; root.add(ring);
    var rpts = []; for (var i = 0; i <= 64; i++) { var a = i / 64 * Math.PI * 2; rpts.push(new T.Vector3(Math.cos(a) * 2.15, .12, Math.sin(a) * 2.15)); }
    sc.ambient.push({ c: new T.CatmullRomCurve3(rpts, true), off: 0, sp: .12, big: true });
    [["git push", ""], ["build", "~1 min"], ["deploy everywhere", ""], ["preview URL", ""]].forEach(function (s, i) { var a = i / 4 * Math.PI * 2 + .4, p = new T.Vector3(Math.cos(a) * 2.15, .12, Math.sin(a) * 2.15);
      var m = new T.Mesh(new T.SphereGeometry(.06, 12, 8), new T.MeshBasicMaterial({ color: P.accent })); m.position.copy(p); root.add(m); label(p, s[0], s[1], { dy: .14 }); });
    sc.extra.push(function (t) { pins.forEach(function (m, i) { var k = 1 + Math.max(0, Math.sin(t * 2 - i * .7)) * .8; m.scale.set(k, k, k); }); });
    var jk = sc.nodes.jak.clone().sub(G); sc.yaw = -Math.atan2(jk.x, jk.z) + .35; sc.pitch = .05;
    sc.req = [{ path: ["jak", "sgp", "use"], back: true, dur: 3000 }];
  }
  if (n !== 5) sc.pitch = 0;
  sc.base = sc.yaw;
  // packets
  var pg = new T.SphereGeometry(n === 2 ? .09 : .07, n === 2 ? 6 : 16, n === 2 ? 4 : 12);
  sc.pk = new T.Mesh(pg, new T.MeshBasicMaterial({ color: P.out })); sc.pk.visible = false; root.add(sc.pk);
  sc.cube = new T.Mesh(new T.BoxGeometry(.2, .2, .2), new T.MeshBasicMaterial({ color: n === 4 ? 0xf1c40f : n === 6 ? 0xffc94d : P.out })); sc.cube.visible = false; root.add(sc.cube);
  sc.ambient.forEach(function (a) { a.m = new T.Mesh(new T.SphereGeometry(a.big ? .06 : .035, 8, 6), new T.MeshBasicMaterial({ color: a.big ? P.out : (P.net || P.line), transparent: true, opacity: .8 })); root.add(a.m); });
  return sc;
}

function dioSend(n) {
  var sc = DIO.scenes[n]; if (!sc) return;
  sc.run = { leg: 0, t0: performance.now(), curves: sc.req.map(function (l) { return { c: l.path.length > 1 ? sc_path(sc, l.path) : null, l: l }; }) };
}
function sc_path(sc, keys) {
  var T = THREE, pts = [];
  for (var i = 0; i < keys.length - 1; i++) { var f = sc.links[keys[i] + ">" + keys[i + 1]], rev = false; if (!f) { f = sc.links[keys[i + 1] + ">" + keys[i]]; rev = true; }
    var p = f.getPoints(30); if (rev) p.reverse(); if (i) p.shift(); pts = pts.concat(p); }
  return new T.CatmullRomCurve3(pts);
}
function dioActivate(n, view, labelsBox) {
  var r = dioRenderer(); if (!r) return;
  if (!DIO.scenes[n]) DIO.scenes[n] = buildDio(n);
  var sc = DIO.scenes[n]; sc.view = view; sc.w = 0;
  view.insertBefore(r.domElement, view.firstChild); r.domElement.style.imageRendering = n === 2 ? "pixelated" : "";
  if (!sc.lbEls) { sc.lbEls = sc.labels.map(function (L) { var d = el("div", "dl" + (L.lat ? " lat" : ""), L.html); glossifyEl(d); labelsBox.appendChild(d); return d; }); }
  DIO.active = n; if (!DIO.raf) { DIO.last = performance.now(); DIO.raf = requestAnimationFrame(dioLoop); }
}
function dioDeactivate(n) { if (DIO.active === n) DIO.active = 0; }
var _v = null, _w = null;
function dioLoop(now) {
  var sc = DIO.scenes[DIO.active]; if (!sc) { DIO.raf = 0; return; }
  DIO.raf = requestAnimationFrame(dioLoop);
  var dt = Math.min(.05, (now - DIO.last) / 1000); DIO.last = now; var t = now / 1000;
  if (!screenEl.classList.contains("live") || +screenEl.style.opacity < .05) return;
  var v = sc.view, w = v.clientWidth, h = v.clientHeight; if (!w || !h) return;
  if (sc.w !== w || sc.h !== h || DIO.r.domElement.parentNode !== v) { if (DIO.r.domElement.parentNode !== v) v.insertBefore(DIO.r.domElement, v.firstChild);
    DIO.r.setPixelRatio(sc.pr); DIO.r.setSize(w, h, false); sc.cam.aspect = w / h; sc.cam.updateProjectionMatrix(); sc.w = w; sc.h = h; }
  if (!sc.drag) sc.idle = (sc.idle || 0) + dt;
  sc.root.rotation.y = sc.base + sc.uyaw + Math.sin((sc.idle || 0) * .25) * .3; sc.root.rotation.x = sc.pitch;
  sc.extra.forEach(function (f) { f(t); });
  sc.ambient.forEach(function (a) { var k = (t * a.sp + a.off) % 1; a.m.position.copy(a.c.getPointAt(k)); });
  // main request
  var run = sc.run; sc.pk.visible = sc.cube.visible = false;
  if (run) {
    var leg = run.curves[run.leg], L = leg.l, el2 = now - run.t0, D = L.dur || 2400, total = L.back ? D * 2 : D;
    if (el2 > total + 250) { run.leg++; run.t0 = now; if (run.leg >= run.curves.length) { sc.run = null; sc.nextAuto = now + 5200; } }
    else { var k = Math.min(1, el2 / D), back = L.back && el2 > D; if (back) k = 1 - Math.min(1, (el2 - D) / D);
      var e = k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2, m = L.cube ? sc.cube : sc.pk;
      m.visible = true; m.position.copy(leg.c.getPointAt(clamp(e))); m.material.color.setHex(back ? DIO_PAL[sc.n].back : (L.cube ? m.material.color.getHex() : DIO_PAL[sc.n].out)); if (L.cube) { m.rotation.x += dt * 2; m.rotation.y += dt * 3; } }
  } else if (sc.nextAuto && now > sc.nextAuto) { sc.nextAuto = 0; dioSend(sc.n); }
  DIO.r.render(sc.scene, sc.cam);
  // labels
  if (!_v) { _v = new THREE.Vector3(); _w = new THREE.Vector3(); }
  sc.root.updateMatrixWorld();
  sc.labels.forEach(function (L, i) {
    var d = sc.lbEls[i]; _v.copy(L.p); _v.y += L.dy; sc.root.localToWorld(_v);
    var hide = false;
    if (L.globe) { _w.copy(L.globe); sc.root.localToWorld(_w); var nrm = _v.clone().sub(_w), toCam = sc.cam.position.clone().sub(_w); hide = nrm.dot(toCam) < .05 * nrm.length() * toCam.length(); }
    _v.project(sc.cam); if (_v.z > 1) hide = true;
    d.classList.toggle("hide", hide);
    d.style.transform = "translate(" + ((_v.x * .5 + .5) * w).toFixed(1) + "px," + ((-_v.y * .5 + .5) * h).toFixed(1) + "px) translate(-50%,-100%)";
  });
}

function dioramaEl(n) {
  var tpl = document.getElementById("tpl-dg" + n), svg = tpl && tpl.content.querySelector("svg"), aria = svg ? svg.getAttribute("aria-label") : "3D diagram";
  var box = el("div", "dio"); box.dataset.interactive = "1";
  box.innerHTML = '<div class="dio-view" role="img"><div class="dio-labels"></div><div class="dio-hint" aria-hidden="true">drag to orbit</div></div><div class="dgcap"><span></span><button class="btn" type="button">▶ Send a request</button></div>';
  var view = $(".dio-view", box); view.setAttribute("aria-label", aria);
  $(".dgcap span", box).textContent = DIO_CAP[n]; glossifyEl($(".dgcap span", box));
  $("button", box).addEventListener("click", function () { dioSend(n); });
  var drag = null;
  view.addEventListener("pointerdown", function (e) { if (e.target.closest(".gl-term")) return; var sc = DIO.scenes[n]; if (!sc) return; drag = { x: e.clientX, y: e.clientY, yaw: sc.uyaw, pitch: sc.pitch, id: e.pointerId }; sc.drag = true; if (e.pointerType !== "touch") view.setPointerCapture(e.pointerId); });
  view.addEventListener("pointermove", function (e) { if (!drag) return; var sc = DIO.scenes[n], dx = e.clientX - drag.x, dy = e.clientY - drag.y;
    if (e.pointerType === "touch" && Math.abs(dy) > Math.abs(dx) * 1.2 && Math.abs(dx) < 8) return;
    sc.uyaw = drag.yaw + dx * .008; if (e.pointerType !== "touch") sc.pitch = clamp(drag.pitch + dy * .003, -.2, .35); $(".dio-hint", box).style.opacity = 0; });
  function up() { if (!drag) return; var sc = DIO.scenes[n]; if (sc) sc.drag = false; drag = null; }
  view.addEventListener("pointerup", up); view.addEventListener("pointercancel", up); view.addEventListener("pointerleave", up);
  box._show = function () { var labels = $(".dio-labels", box); dioActivate(n, view, labels); setTimeout(function () { if (DIO.active === n) dioSend(n); }, 650); };
  box._hide = function () { dioDeactivate(n); };
  return box;
}
