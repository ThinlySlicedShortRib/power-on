// ================= 3D DESK =================
var REDUCE = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
function phoneish() { return innerWidth < 760; }
var S = { mode: "intro", powerT0: 0, rigA: 0, rigB: -1, swapQ: 0, pose: null, glNeeded: true, screenOn: 0 };
var GL = null;

function initGL() {
  if (!window.THREE) return null;
  var T = THREE, canvas = document.getElementById("gl"), renderer;
  try { renderer = new T.WebGLRenderer({ canvas: canvas, antialias: true, powerPreference: "high-performance" }); }
  catch (e) { return null; }
  if (!renderer.getContext()) return null;
  var phone = phoneish();
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, phone ? 1.5 : 2));
  renderer.setSize(innerWidth, innerHeight, false);
  renderer.outputEncoding = T.sRGBEncoding;
  renderer.toneMapping = T.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
  renderer.shadowMap.enabled = !phone;
  renderer.shadowMap.type = T.PCFSoftShadowMap;

  var scene = new T.Scene();
  scene.background = new T.Color(0x0d0b09);
  scene.fog = new T.Fog(0x0d0b09, 9, 20);
  var camera = new T.PerspectiveCamera(38, innerWidth / innerHeight, 0.01, 60);

  function M(c, r, m, extra) { var o = { color: c, roughness: r == null ? .6 : r, metalness: m || 0 }; for (var k in extra || {}) o[k] = extra[k]; return new T.MeshStandardMaterial(o); }
  function box(w, h, d, mat, x, y, z, parent) { var me = new T.Mesh(new T.BoxGeometry(w, h, d), mat); me.position.set(x, y, z); me.castShadow = me.receiveShadow = true; (parent || scene).add(me); return me; }
  function canvasTex(w, h, draw) { var c = document.createElement("canvas"); c.width = w; c.height = h; var ctx = c.getContext("2d"); draw && draw(ctx, w, h); var t = new T.CanvasTexture(c); t.encoding = T.sRGBEncoding; t.anisotropy = 4; return { c: c, ctx: ctx, tex: t }; }

  // --- room + desk
  var wood = canvasTex(1024, 256, function (g, w, h) {
    g.fillStyle = "#4a3120"; g.fillRect(0, 0, w, h);
    for (var i = 0; i < 160; i++) { g.strokeStyle = "rgba(" + (i % 2 ? "30,18,10" : "110,74,44") + "," + (0.08 + Math.random() * .12) + ")"; g.lineWidth = 1 + Math.random() * 3;
      g.beginPath(); var y = Math.random() * h; g.moveTo(0, y); for (var x = 0; x <= w; x += 32) g.lineTo(x, y + Math.sin(x / 90 + i) * 4); g.stroke(); }
  });
  wood.tex.wrapS = wood.tex.wrapT = T.RepeatWrapping; wood.tex.repeat.set(2, 1);
  var deskMat = M(0xffffff, .62, 0, { map: wood.tex });
  box(7.2, .14, 3.3, deskMat, 0, -.07, .1);
  box(7.2, .8, .1, deskMat, 0, -.47, 1.72);
  var wall = new T.Mesh(new T.PlaneGeometry(40, 16), M(0x211a13, .95)); wall.position.set(0, 4, -3.2); wall.receiveShadow = true; scene.add(wall);
  var floor = new T.Mesh(new T.PlaneGeometry(40, 40), M(0x120e0a, 1)); floor.rotation.x = -Math.PI / 2; floor.position.y = -1.7; scene.add(floor);

  // --- lamp
  var lampMat = M(0x2b2f2a, .45, .5), brass = M(0xb8873a, .35, .8);
  function rod(a, b, r, mat) { var d = new T.Vector3().subVectors(b, a), me = new T.Mesh(new T.CylinderGeometry(r, r, d.length(), 12), mat);
    me.position.copy(a).add(b).multiplyScalar(.5); me.quaternion.setFromUnitVectors(new T.Vector3(0, 1, 0), d.normalize()); me.castShadow = true; scene.add(me); return me; }
  var lb = new T.Vector3(-2.75, .04, -.85), le = new T.Vector3(-2.45, 1.45, -.9), lh = new T.Vector3(-1.75, 1.95, -.55);
  var base = new T.Mesh(new T.CylinderGeometry(.3, .34, .08, 32), lampMat); base.position.copy(lb); base.castShadow = true; scene.add(base);
  rod(lb, le, .03, brass); rod(le, lh, .03, brass);
  var shade = new T.Mesh(new T.ConeGeometry(.32, .42, 32, 1, true), M(0x2f4a3a, .5, .3, { side: T.DoubleSide }));
  shade.position.copy(lh); shade.lookAt(-.2, -.6, .4); shade.rotateX(-Math.PI / 2); scene.add(shade);
  var bulb = new T.Mesh(new T.SphereGeometry(.09, 16, 12), new T.MeshBasicMaterial({ color: 0xffe3a8 })); bulb.position.copy(lh).add(new T.Vector3(.04, -.12, .04)); scene.add(bulb);
  var spot = new T.SpotLight(0xffd29a, 2.4, 14, .78, .65, 1.4); spot.position.copy(bulb.position); spot.target.position.set(-.1, 0, .35);
  spot.castShadow = !phone; spot.shadow.mapSize.set(1024, 1024); spot.shadow.bias = -.0004; scene.add(spot); scene.add(spot.target);
  scene.add(new T.HemisphereLight(0x5c6890, 0x1a120a, .45));
  var rim = new T.DirectionalLight(0x6f86ff, .35); rim.position.set(4, 4, -4); scene.add(rim);
  var screenLight = new T.PointLight(0x3dff72, 0, 5, 2); scene.add(screenLight);

  // mug (always on the desk)
  var mugMat = M(0xd8d2c4, .4);
  var mug = new T.Mesh(new T.CylinderGeometry(.14, .13, .28, 24), mugMat); mug.position.set(-1.95, .14, .95); mug.castShadow = true; scene.add(mug);
  var handle = new T.Mesh(new T.TorusGeometry(.08, .022, 8, 20), mugMat); handle.position.set(-1.79, .15, .95); scene.add(handle);
  var coffee = new T.Mesh(new T.CircleGeometry(.125, 24), M(0x2a160a, .2)); coffee.rotation.x = -Math.PI / 2; coffee.position.set(-1.95, .26, .95); scene.add(coffee);

  // --- screens
  function bulgePlane(w, h, b) {
    var g = new T.PlaneGeometry(w, h, 24, 18), p = g.attributes.position;
    for (var i = 0; i < p.count; i++) { var x = p.getX(i) / (w / 2), y = p.getY(i) / (h / 2); p.setZ(i, b * (1 - x * x * .6) * (1 - y * y * .6)); }
    g.computeVertexNormals(); return g;
  }
  function makeScreen(parent, w, h, cw, ch, x, y, z, bulge) {
    var ct = canvasTex(cw, ch);
    var me = new T.Mesh(bulge ? bulgePlane(w, h, bulge) : new T.PlaneGeometry(w, h), new T.MeshBasicMaterial({ map: ct.tex, toneMapped: false }));
    me.position.set(x, y, z); parent.add(me);
    if (bulge) { var gl = canvasTex(256, 256, function (g, W, H) { var gr = g.createRadialGradient(W * .3, H * .25, 4, W * .35, H * .3, W * .7); gr.addColorStop(0, "rgba(255,255,255,.16)"); gr.addColorStop(1, "rgba(255,255,255,0)"); g.fillStyle = gr; g.fillRect(0, 0, W, H); });
      var glare = new T.Mesh(bulgePlane(w, h, bulge + .004), new T.MeshBasicMaterial({ map: gl.tex, transparent: true, depthWrite: false })); glare.position.copy(me.position); glare.position.z += .002; parent.add(glare); }
    return { mesh: me, c: ct.c, ctx: ct.ctx, tex: ct.tex, w: w, h: h, bulge: bulge || 0 };
  }
  function keysTex(bg, key) { return canvasTex(512, 160, function (g, w, h) { g.fillStyle = bg; g.fillRect(0, 0, w, h); g.fillStyle = key;
    for (var r = 0; r < 5; r++) for (var c = 0; c < 15; c++) { if (r == 4 && c > 3 && c < 11) continue; g.fillRect(8 + c * 33.4, 8 + r * 30, 28, 24); } g.fillRect(8 + 4 * 33.4, 128, 33.4 * 7 - 6, 24); }).tex; }
  function keyboard(parent, w, d, x, z, bodyC, keyC, bg) { var kb = box(w, .05, d, M(bodyC, .6), x, .025, z, parent);
    var top = new T.Mesh(new T.PlaneGeometry(w * .94, d * .86), M(0xffffff, .7, 0, { map: keysTex(bg, keyC) })); top.rotation.x = -Math.PI / 2; top.position.set(x, .052, z); parent.add(top); return kb; }
  function laptop(parent, o) {
    var baseM = o.baseMat, b = box(o.w, o.t, o.d, baseM, 0, o.t / 2, .25, parent);
    var kt = new T.Mesh(new T.PlaneGeometry(o.w * .86, o.d * .5), M(0xffffff, .6, 0, { map: keysTex(o.kbBg, o.kbKey) })); kt.rotation.x = -Math.PI / 2; kt.position.set(0, o.t + .002, .12); parent.add(kt);
    var pad = new T.Mesh(new T.PlaneGeometry(o.w * .28, o.d * .22), M(o.padC, .4)); pad.rotation.x = -Math.PI / 2; pad.position.set(0, o.t + .002, .62); parent.add(pad);
    var hinge = new T.Group(); hinge.position.set(0, o.t, .25 - o.d / 2 + .02); parent.add(hinge);
    hinge.rotation.x = -o.tilt;
    var lid = box(o.w, o.lh, .035, o.lidMat || baseM, 0, o.lh / 2, 0, hinge);
    var bez = new T.Mesh(new T.PlaneGeometry(o.w * .98, o.lh * .97), M(o.bezel, .3, .1)); bez.position.set(0, o.lh / 2, .019); hinge.add(bez);
    var sc = makeScreen(hinge, o.sw, o.sh, 640, 400, 0, o.lh / 2 + .01, .021, 0);
    return sc;
  }

  var rigs = [];
  // 1 · 1989 NeXT-style cube + display
  (function () {
    var g = new T.Group(); scene.add(g); var blk = M(0x1b1b1e, .5, .35), blk2 = M(0x101012, .45, .3);
    box(.95, .95, .95, blk, 1.5, .475, -.15, g);
    var nt = canvasTex(256, 256, drawStickyNote); var note = new T.Mesh(new T.PlaneGeometry(.34, .34), new T.MeshStandardMaterial({ map: nt.tex, roughness: .9 }));
    note.position.set(1.42, .7, .33); note.rotation.z = .07; g.add(note); g.userData.noteTex = nt;
    box(.5, .06, .42, blk2, -.1, .03, 0, g); box(.16, .26, .16, blk2, -.1, .19, -.05, g);
    box(1.58, 1.26, .24, blk, -.1, .96, 0, g); box(1.12, .94, .72, blk2, -.1, .96, -.46, g);
    var sc = makeScreen(g, 1.26, .95, 640, 480, -.1, 1.0, .121, .03);
    var pw = new T.Mesh(new T.CylinderGeometry(.045, .045, .03, 24), M(0x2a2a2e, .3, .5, { emissive: 0xffc874, emissiveIntensity: .25 }));
    pw.rotation.x = Math.PI / 2; pw.position.set(.5, .42, .125); pw.userData.power = true; g.add(pw);
    var led = new T.Mesh(new T.SphereGeometry(.015, 10, 8), new T.MeshBasicMaterial({ color: 0x1a2a1a })); led.position.set(.4, .42, .125); g.add(led);
    keyboard(g, 1.45, .46, -.1, .9, 0x1b1b1e, "#2c2c31", "#141416");
    rigs.push({ g: g, screen: sc, power: pw, led: led, light: 0x3dff72 });
  })();
  // 2 · 1995 beige PC + modem
  (function () {
    var g = new T.Group(); scene.add(g); var beige = M(0xd9cfb3, .62), beige2 = M(0xc9bea0, .7), dark = M(0x222222, .5);
    box(.6, 1.4, 1.15, beige, 1.55, .7, -.15, g);
    box(.38, .035, .01, dark, 1.55, 1.12, .43, g); box(.46, .1, .01, beige2, 1.55, 1.28, .43, g);
    var tled = new T.Mesh(new T.SphereGeometry(.018, 8, 6), new T.MeshBasicMaterial({ color: 0x30ff50 })); tled.position.set(1.4, .3, .43); g.add(tled);
    var st = new T.Mesh(new T.CylinderGeometry(.34, .38, .07, 32), beige2); st.position.set(-.05, .035, 0); g.add(st);
    box(.2, .26, .2, beige2, -.05, .2, -.05, g);
    box(1.48, 1.22, .3, beige, -.05, .99, 0, g); box(1.1, .95, .85, beige2, -.05, .99, -.55, g);
    var sc = makeScreen(g, 1.16, .88, 640, 480, -.05, 1.02, .151, .035);
    box(.2, .03, .02, beige2, .45, .45, .15, g);
    box(.56, .12, .38, M(0x2b2b2b, .5), -1.35, .06, .62, g);
    var leds = []; for (var i = 0; i < 6; i++) { var l = new T.Mesh(new T.SphereGeometry(.016, 8, 6), new T.MeshBasicMaterial({ color: 0x401010 })); l.position.set(-1.55 + i * .08, .07, .815); g.add(l); leds.push(l); }
    keyboard(g, 1.5, .5, -.05, .95, 0xd9cfb3, "#e8e0c8", "#bfb393");
    box(.13, .05, .21, beige, 1.0, .025, .95, g);
    rigs.push({ g: g, screen: sc, leds: leds, light: 0xffff66 });
  })();
  // 3 · 2004 glossy white laptop
  (function () {
    var g = new T.Group(); scene.add(g);
    var gloss = new T.MeshPhysicalMaterial({ color: 0xf4f4f2, roughness: .18, metalness: 0, clearcoat: 1, clearcoatRoughness: .08 });
    var sc = laptop(g, { w: 1.75, t: .075, d: 1.15, baseMat: gloss, kbBg: "#f2f2f0", kbKey: "#ffffff", padC: 0xe8e8e6, tilt: .26, lh: 1.12, bezel: 0xf0f0ee, sw: 1.52, sh: .95 });
    var bub = new T.MeshPhysicalMaterial({ color: 0xff7a1a, roughness: .1, clearcoat: 1 });
    var s1 = new T.Mesh(new T.SphereGeometry(.12, 24, 16), bub); s1.position.set(1.45, .12, .7); g.add(s1);
    var s2 = new T.Mesh(new T.SphereGeometry(.08, 24, 16), new T.MeshPhysicalMaterial({ color: 0x7cc242, roughness: .1, clearcoat: 1 })); s2.position.set(1.7, .08, .45); g.add(s2);
    rigs.push({ g: g, screen: sc, light: 0x9fd0ff });
  })();
  // 4 · 2010 aluminium laptop + phone
  (function () {
    var g = new T.Group(); scene.add(g); var alu = M(0xc8ccd2, .32, .75);
    var sc = laptop(g, { w: 1.7, t: .055, d: 1.12, baseMat: alu, kbBg: "#b9bdc3", kbKey: "#1c1c1e", padC: 0xbfc3c9, tilt: .22, lh: 1.08, bezel: 0x0c0c0e, sw: 1.5, sh: .94 });
    var ph = new T.Group(); ph.position.set(1.55, .02, .35); ph.rotation.set(-.28, -.35, 0); g.add(ph);
    box(.38, .76, .04, M(0x0d0d0f, .25, .4), 0, .38, 0, ph);
    var psc = makeScreen(ph, .33, .6, 200, 360, 0, .39, .021, 0);
    box(.3, .1, .2, M(0x2c3e50, .5), 1.55, .05, .25, g);
    rigs.push({ g: g, screen: sc, extra: psc, light: 0xdfe8ec });
  })();
  // 5 · today: thin laptop, phone, edge globe
  (function () {
    var g = new T.Group(); scene.add(g); var sg = M(0x3a3d42, .35, .7);
    var sc = laptop(g, { w: 1.8, t: .035, d: 1.15, baseMat: sg, kbBg: "#2c2f33", kbKey: "#111214", padC: 0x34373c, tilt: .2, lh: 1.12, bezel: 0x050506, sw: 1.7, sh: 1.04 });
    var ph = new T.Group(); ph.position.set(-1.35, .012, .75); ph.rotation.y = .35; g.add(ph);
    box(.38, .02, .78, M(0x1a1b1e, .3, .5), 0, 0, 0, ph);
    var psc = makeScreen(ph, .34, .72, 200, 420, 0, .011, 0, 0); psc.mesh.rotation.x = -Math.PI / 2;
    var globe = new T.Group(); globe.position.set(1.6, 1.25, -.25); g.add(globe);
    var wf = new T.LineSegments(new T.WireframeGeometry(new T.IcosahedronGeometry(.48, 2)), new T.LineBasicMaterial({ color: 0xff9a4d, transparent: true, opacity: .32 })); globe.add(wf);
    var nodeMat = new T.MeshBasicMaterial({ color: 0x7dd3c0 });
    for (var i = 0; i < 22; i++) { var u = Math.random() * 2 - 1, th = Math.random() * Math.PI * 2, r = Math.sqrt(1 - u * u);
      var n = new T.Mesh(new T.SphereGeometry(.022, 8, 6), nodeMat); n.position.set(r * Math.cos(th) * .49, u * .49, r * Math.sin(th) * .49); globe.add(n); }
    var ring = new T.Mesh(new T.TorusGeometry(.66, .004, 6, 80), new T.MeshBasicMaterial({ color: 0x7dd3c0, transparent: true, opacity: .5 })); ring.rotation.x = 1.2; globe.add(ring);
    rigs.push({ g: g, screen: sc, extra: psc, globe: globe, light: 0xffb877 });
  })();

  // 6 · future: glasses, phone, an agent orb and a floating generated panel
  (function () {
    var g = new T.Group(); scene.add(g);
    var frame = M(0x1a1c1e, .35, .5), lens = new T.MeshPhysicalMaterial({ color: 0x88ccc4, roughness: .05, transparent: true, opacity: .35, clearcoat: 1 });
    var gls = new T.Group(); gls.position.set(-1.25, .03, .8); gls.rotation.y = .4; g.add(gls);
    [-.17, .17].forEach(function (x) { var r = new T.Mesh(new T.TorusGeometry(.12, .014, 10, 32), frame); r.position.set(x, .12, 0); gls.add(r); var l = new T.Mesh(new T.CircleGeometry(.11, 24), lens); l.position.set(x, .12, 0); gls.add(l); });
    box(.1, .014, .014, frame, 0, .15, 0, gls); box(.014, .014, .42, frame, -.29, .12, -.21, gls); box(.014, .014, .42, frame, .29, .12, -.21, gls);
    var ph = new T.Group(); ph.position.set(1.15, .012, .9); ph.rotation.y = -.3; g.add(ph); box(.36, .02, .74, M(0xe8e8e6, .3, .2), 0, 0, 0, ph);
    var orb = new T.Mesh(new T.SphereGeometry(.26, 48, 32), new T.MeshPhysicalMaterial({ color: 0x0fa3a3, emissive: 0x0b6f6f, emissiveIntensity: .9, roughness: .15, clearcoat: 1 }));
    orb.position.set(1.45, 1.15, -.1); g.add(orb);
    var halo = new T.Mesh(new T.TorusGeometry(.42, .006, 6, 90), new T.MeshBasicMaterial({ color: 0xff5a36, transparent: true, opacity: .7 })); halo.position.copy(orb.position); halo.rotation.x = 1.3; g.add(halo);
    var sc = makeScreen(g, 1.6, 1.0, 640, 400, -.2, 1.05, 0, 0); sc.mesh.material.transparent = true; sc.mesh.material.opacity = .95;
    var rim = new T.LineSegments(new T.EdgesGeometry(new T.PlaneGeometry(1.64, 1.04)), new T.LineBasicMaterial({ color: 0x0fa3a3 })); rim.position.set(-.2, 1.05, -.002); g.add(rim);
    rigs.push({ g: g, screen: sc, orb: orb, halo: halo, light: 0x7fe0d6 });
  })();

  rigs.forEach(function (r, i) { drawEraScreen(i + 1, r.screen.ctx, r.screen.c.width, r.screen.c.height); r.screen.tex.needsUpdate = true;
    if (r.extra) { drawPhoneScreen(i + 1, r.extra.ctx, r.extra.c.width, r.extra.c.height); r.extra.tex.needsUpdate = true; }
    r.g.visible = i === 0; });
  // the 1989 screen starts dark until power-on
  (function () { var s = rigs[0].screen; s.ctx.fillStyle = "#050806"; s.ctx.fillRect(0, 0, s.c.width, s.c.height); s.tex.needsUpdate = true; })();

  // dust in the lamp light
  var DN = phone ? 140 : 420, dpos = new Float32Array(DN * 3), dseed = new Float32Array(DN);
  for (var i = 0; i < DN; i++) { dpos[i * 3] = -3.2 + Math.random() * 5.5; dpos[i * 3 + 1] = Math.random() * 3; dpos[i * 3 + 2] = -1.5 + Math.random() * 3.6; dseed[i] = Math.random() * 100; }
  var dg = new T.BufferGeometry(); dg.setAttribute("position", new T.BufferAttribute(dpos, 3));
  var dotT = canvasTex(32, 32, function (g) { var gr = g.createRadialGradient(16, 16, 0, 16, 16, 16); gr.addColorStop(0, "rgba(255,240,210,1)"); gr.addColorStop(1, "rgba(255,240,210,0)"); g.fillStyle = gr; g.fillRect(0, 0, 32, 32); });
  var dust = new T.Points(dg, new T.PointsMaterial({ size: .022, map: dotT.tex, transparent: true, opacity: .55, depthWrite: false, blending: T.AdditiveBlending, color: 0xffe1b0 }));
  scene.add(dust);

  GL = { T: T, renderer: renderer, scene: scene, camera: camera, rigs: rigs, screenLight: screenLight, dust: dust, dpos: dpos, dseed: dseed, DN: DN, ray: new T.Raycaster(), ptr: new T.Vector2() };
  computePoses();
  return GL;
}

function drawStickyNote(g, w, h) {
  g.fillStyle = "#ffe86b"; g.fillRect(0, 0, w, h); g.fillStyle = "rgba(0,0,0,.06)"; g.fillRect(0, 0, w, 26);
  g.fillStyle = "#c0262d"; g.textAlign = "center"; g.font = "600 30px Caveat, 'Marker Felt', cursive";
  ["This machine", "is a server.", "DO NOT POWER", "IT DOWN!!"].forEach(function (s, i) { g.fillText(s, w / 2, 72 + i * 44); });
}

function outPose(i) {
  var T = GL.T, ph = innerWidth / innerHeight < .9;
  if (ph) return { p: new T.Vector3(1.0, 2.9, 7.6), t: new T.Vector3(.15, .85, 0) };
  return { p: new T.Vector3(2.1 - i * .05, 2.05, 5.2), t: new T.Vector3(.05, .78, 0) };
}
function computePoses() {
  if (!GL) return; var T = GL.T, cam = GL.camera;
  cam.aspect = innerWidth / innerHeight; cam.updateProjectionMatrix();
  GL.rigs.forEach(function (r, i) {
    var y0 = r.g.position.y; r.g.position.y = 0; r.g.updateMatrixWorld(true);
    var s = r.screen, c = new T.Vector3(); s.mesh.getWorldPosition(c);
    var n = new T.Vector3(0, 0, 1).transformDirection(s.mesh.matrixWorld);
    var tv = Math.tan(T.MathUtils.degToRad(cam.fov) / 2), dH = (s.h / 2) / tv, dW = (s.w / 2) / (tv * cam.aspect);
    var d = Math.min(dH, dW) * .96 + s.bulge;
    r.inPose = { p: c.clone().add(n.multiplyScalar(d)), t: c.clone() };
    r.out = outPose(i); r.screenCenter = c;
    r.g.position.y = y0;
  });
}

// era screens painted onto the 3D monitors (they match the DOM costume they hand over to)
function drawEraScreen(n, g, w, h) {
  g.save(); g.textAlign = "left"; g.textBaseline = "alphabetic";
  if (n === 1) {
    g.fillStyle = "#040a05"; g.fillRect(0, 0, w, h); g.fillStyle = "#3dff72"; g.font = "28px VT323, 'Courier New', monospace";
    ["                 The World Wide Web project", "", "WORLD WIDE WEB", "", "The WorldWideWeb (W3) is a wide-area hypermedia", "information retrieval initiative aiming to give", "universal access to a large universe of documents.", "",
      "Everything there is online about W3 is linked", "directly or indirectly to this document.", "", "What's out there?[1]   Help[2]   People[3]", "History[4]   Bibliography[5]", "", "1-5, Back, Quit, or Help: _"].forEach(function (s, i) { g.fillText(s, 24, 44 + i * 28); });
    scan(g, w, h, .3);
  } else if (n === 2) {
    g.fillStyle = "#000030"; g.fillRect(0, 0, w, h); for (var i = 0; i < 140; i++) { g.fillStyle = i % 5 ? "#fff" : "#9ad6ff"; g.fillRect((i * 97) % w, (i * 53) % h, 2, 2); }
    g.fillStyle = "#000"; g.fillRect(0, 0, w, 34); g.fillStyle = "#39ffd9"; g.font = "bold 20px 'Comic Neue', 'Comic Sans MS', cursive"; g.fillText("*** Welcome to my homepage!!! *** Sign my guestbook ***", 12, 24);
    g.textAlign = "center"; g.fillStyle = "#ffff66"; g.font = "bold 46px 'Comic Neue', 'Comic Sans MS', cursive"; g.fillText("Welcome to My", w / 2, 110); g.fillText("Home Page!!!", w / 2, 160);
    var cols = ["#ff3b3b", "#ffb000", "#fff200", "#3bff6e", "#39d0ff", "#b45cff"]; cols.forEach(function (c, i) { g.fillStyle = c; g.fillRect(70 + i * 83, 186, 83, 6); });
    g.fillStyle = "#c0c0c0"; g.fillRect(150, 220, 340, 120); g.fillStyle = "#000080"; g.fillRect(154, 224, 332, 22); g.fillStyle = "#fff"; g.font = "bold 15px Arial"; g.fillText("Cool Links", w / 2, 241);
    g.fillStyle = "#0000ee"; g.font = "18px 'Times New Roman', serif"; ["My Pets", "Star Trek Fan Page", "Webring  << prev | next >>"].forEach(function (s, i) { g.fillText(s, w / 2, 272 + i * 24); });
    g.fillStyle = "#000"; g.fillRect(250, 360, 140, 30); g.fillStyle = "#39ff6a"; g.font = "16px 'Press Start 2P', monospace"; g.fillText("004217", w / 2, 383);
    for (var x = 0; x < w; x += 28) { g.fillStyle = (x / 28) % 2 ? "#111" : "#ffd400"; g.beginPath(); g.moveTo(x, h); g.lineTo(x + 14, h - 30); g.lineTo(x + 28, h - 30); g.lineTo(x + 14, h); g.fill(); }
    g.fillStyle = "#ffd400"; g.fillRect(0, h - 70, w, 6);
  } else if (n === 3) {
    for (var y = -h; y < w + h; y += 28) { g.fillStyle = (y / 28) % 2 ? "#e2eef9" : "#eef6fc"; g.beginPath(); g.moveTo(y, 0); g.lineTo(y + 14, 0); g.lineTo(y + 14 - h, h); g.lineTo(y - h, h); g.fill(); }
    var gr = g.createLinearGradient(0, 0, 0, 60); gr.addColorStop(0, "#6fb3ec"); gr.addColorStop(.5, "#2a7cc8"); gr.addColorStop(.51, "#1d6db8"); gr.addColorStop(1, "#3a8ad6"); g.fillStyle = gr; g.fillRect(0, 0, w, 60);
    g.fillStyle = "#fff"; g.font = "bold 30px 'Lucida Grande', Verdana, sans-serif"; g.fillText("Timelinr", 24, 41); g.font = "bold 13px Verdana"; g.fillStyle = "#ffe0b8"; g.fillText("beta", 160, 26);
    rr(g, 30, 90, 360, 260, 18, "#fff", "#a9c4dd"); rr(g, 410, 90, 200, 120, 18, "#fff", "#a9c4dd");
    g.fillStyle = "#17324d"; g.font = "bold 22px Verdana"; g.fillText("Share your world.", 54, 130); g.font = "15px Verdana"; g.fillStyle = "#5a7591";
    ["Tag it. Blog it. Subscribe.", "Now with 100% more Ajax."].forEach(function (s, i) { g.fillText(s, 54, 162 + i * 24); });
    var bg2 = g.createLinearGradient(0, 230, 0, 270); bg2.addColorStop(0, "#ffb15c"); bg2.addColorStop(.5, "#ff7a00"); bg2.addColorStop(.51, "#f06400"); bg2.addColorStop(1, "#ff9a2e");
    rr(g, 54, 230, 200, 44, 22, bg2, "#c75200"); g.fillStyle = "#fff"; g.font = "bold 18px Verdana"; g.fillText("Sign up free!", 90, 259);
    g.fillStyle = "#2a7cc8"; g.font = "bold 13px Verdana"; ["ajax", "mashup", "folksonomy", "rss"].forEach(function (s, i) { g.font = "bold " + (12 + (i % 3) * 5) + "px Verdana"; g.fillText(s, 428 + (i % 2) * 80, 130 + Math.floor(i / 2) * 40); });
    g.fillStyle = "#ff6a00"; g.beginPath(); g.arc(560, 330, 46, 0, 7); g.fill(); g.fillStyle = "#fff"; g.font = "bold 20px Verdana"; g.textAlign = "center"; g.fillText("BETA", 560, 337);
  } else if (n === 4) {
    g.fillStyle = "#ecf0f1"; g.fillRect(0, 0, w, h); g.fillStyle = "#2c3e50"; g.fillRect(0, 0, w, 50);
    g.fillStyle = "#ecf0f1"; [16, 24, 32].forEach(function (y) { g.fillRect(w - 50, y, 26, 3); }); g.font = "600 20px 'Open Sans', Arial"; g.fillText("Flatly", 24, 32);
    g.fillStyle = "#1abc9c"; g.fillRect(0, 50, w, 120); g.fillStyle = "#fff"; g.font = "300 34px 'Open Sans', Arial"; g.fillText("Build something.", 24, 122);
    var cs = ["#e74c3c", "#3498db", "#9b59b6", "#f1c40f", "#e67e22", "#2ecc71"]; cs.forEach(function (c, i) { g.fillStyle = c; g.fillRect(24 + (i % 3) * 200, 190 + Math.floor(i / 3) * 104, 186, 92); });
  } else if (n === 6) {
    g.fillStyle = "#eef2ef"; g.fillRect(0, 0, w, h);
    g.setLineDash([8, 6]); g.strokeStyle = "rgba(20,26,23,.25)"; g.lineWidth = 2; [[40, 150, 250, 120], [310, 150, 290, 60], [310, 225, 140, 120], [465, 225, 135, 120]].forEach(function (b) { g.strokeRect(b[0], b[1], b[2], b[3]); }); g.setLineDash([]);
    rr(g, 120, 40, 400, 54, 27, "#ffffff", "rgba(20,26,23,.15)"); g.fillStyle = "#ff5a36"; g.font = "26px Geist, sans-serif"; g.fillText("✦", 140, 77); g.fillStyle = "#6b7671"; g.font = "20px Geist, sans-serif"; g.fillText("Ask the web to do something…", 176, 74);
    g.fillStyle = "#141a17"; g.font = "italic 40px 'Instrument Serif', Georgia, serif"; g.fillText("What should the web", 52, 200); g.fillText("do for you?", 52, 244);
    g.fillStyle = "#0fa3a3"; g.beginPath(); g.moveTo(520, 300); g.lineTo(548, 318); g.lineTo(534, 321); g.lineTo(528, 336); g.closePath(); g.fill();
  } else {
    g.fillStyle = "#0b0b0d"; g.fillRect(0, 0, w, h);
    var r1 = g.createRadialGradient(w * .75, h * .3, 0, w * .75, h * .3, w * .5); r1.addColorStop(0, "rgba(255,154,77,.35)"); r1.addColorStop(1, "rgba(255,154,77,0)"); g.fillStyle = r1; g.fillRect(0, 0, w, h);
    g.fillStyle = "#ededed"; g.font = "600 44px Geist, system-ui, sans-serif"; g.fillText("Ship it.", 40, 120); g.fillStyle = "#8a8a93"; g.font = "18px Geist, system-ui, sans-serif"; g.fillText("Rendered at the edge, streamed to you.", 40, 156);
    [[40, 200, 260, 150], [316, 200, 284, 70], [316, 280, 284, 70]].forEach(function (b) { rr(g, b[0], b[1], b[2], b[3], 14, "rgba(255,255,255,.05)", "rgba(255,255,255,.12)"); });
  }
  g.restore();
}
function drawPhoneScreen(n, g, w, h) {
  if (n === 4) { g.fillStyle = "#ecf0f1"; g.fillRect(0, 0, w, h); g.fillStyle = "#2c3e50"; g.fillRect(0, 0, w, 40); var cs = ["#e74c3c", "#3498db", "#1abc9c", "#f1c40f", "#9b59b6", "#e67e22"];
    cs.forEach(function (c, i) { g.fillStyle = c; g.fillRect(14 + (i % 2) * 90, 56 + Math.floor(i / 2) * 96, 82, 86); }); }
  else { g.fillStyle = "#0b0b0d"; g.fillRect(0, 0, w, h); for (var i = 0; i < 4; i++) rr(g, 14, 60 + i * 74, w - 28, 62, 12, "rgba(255,255,255,.07)", "rgba(255,255,255,.1)");
    g.fillStyle = "#ededed"; g.font = "600 40px Geist, sans-serif"; g.fillText("9:41", 50, 40); g.fillStyle = "#7dd3c0"; g.font = "13px Geist, sans-serif"; g.fillText("✓ Deployed to production", 26, 96); }
}
function rr(g, x, y, w, h, r, fill, stroke) { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); g.fillStyle = fill; g.fill(); if (stroke) { g.strokeStyle = stroke; g.lineWidth = 2; g.stroke(); } }
function scan(g, w, h, a) { g.fillStyle = "rgba(0,0,0," + a + ")"; for (var y = 0; y < h; y += 3) g.fillRect(0, y, w, 1); }

// CRT warm-up + boot text on the 1989 monitor
var BOOT = ["ROM Monitor v2.0", "Testing system ... ok", "Loading kernel ... ok", "Mounting /  (OD 256MB)", "Starting httpd on port 80", "", "> WorldWideWeb.app", "  Welcome to the World Wide Web"];
function drawBoot(t) {
  var s = GL.rigs[0].screen, g = s.ctx, w = s.c.width, h = s.c.height;
  g.fillStyle = "#040a05"; g.fillRect(0, 0, w, h);
  if (t < .45) { var k = t / .45, lw = w * Math.min(1, k * 1.6), lh = 2 + k * 6; g.fillStyle = "rgba(200,255,215," + (0.5 + k * .5) + ")"; g.fillRect((w - lw) / 2, h / 2 - lh / 2, lw, lh); }
  else if (t < .8) { var f = 1 - (t - .45) / .35; g.fillStyle = "rgba(170,255,195," + (f * .55) + ")"; g.fillRect(0, h / 2 - h * (1 - f) / 2, w, h * (1 - f) + 6); }
  else { g.fillStyle = "#3dff72"; g.font = "30px VT323, 'Courier New', monospace"; var shown = (t - .8) * 34;
    for (var i = 0; i < BOOT.length; i++) { var L = BOOT[i], c = Math.max(0, Math.min(L.length, shown)); shown -= L.length + 4; if (c <= 0 && i) break; g.fillText(L.slice(0, c) + (c < L.length && c > 0 ? "▌" : ""), 30, 60 + i * 34); } }
  scan(g, w, h, .3); s.tex.needsUpdate = true;
}

function applyPose(p) { GL.camera.position.copy(p.p); GL.camera.lookAt(p.t); }
function lerpPose(a, b, k) { return { p: a.p.clone().lerp(b.p, k), t: a.t.clone().lerp(b.t, k) }; }
function ease(k) { k = Math.max(0, Math.min(1, k)); return k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2; }

var lastNow = 0;
function tick(now) {
  requestAnimationFrame(tick);
  if (!GL) return;
  var t = now / 1000, dt = Math.min(.05, (now - lastNow) / 1000 || .016); lastNow = now;
  var r0 = GL.rigs[0];
  if (S.mode === "intro") {
    var o = r0.out, sway = REDUCE ? 0 : Math.sin(t * .25) * .18;
    applyPose({ p: o.p.clone().add(new GL.T.Vector3(sway, Math.sin(t * .2) * .05, 0)), t: o.t });
    r0.power.material.emissiveIntensity = .25 + (REDUCE ? 0 : (Math.sin(t * 3) * .5 + .5) * .9);
  } else if (S.mode === "booting") {
    var bt = (now - S.powerT0) / 1000 * (REDUCE ? 2.2 : 1);
    drawBoot(bt);
    GL.screenLight.intensity = Math.min(1.1, bt * 1.2);
    var camK = ease((bt - 2.9) / 1.9);
    applyPose(lerpPose(S.bootFrom, r0.inPose, REDUCE ? (bt > 2.9 ? 1 : 0) : camK));
    if (bt > 4.5 && !S.handed) { S.handed = true; handOver(); }
  } else if (S.pose) {
    applyPose(S.pose);
  }
  // rigs
  GL.rigs.forEach(function (r, i) {
    var vis = (i === S.rigA && !(S.rigB >= 0 && S.swapQ >= 1)) || (i === S.rigB && S.swapQ > 0);
    r.g.visible = vis;
    if (!vis) return;
    var q = S.swapQ, y = 0, ry = 0;
    if (S.rigB >= 0 && i === S.rigA) { y = -q * 2.6; ry = -q * .5; }
    if (i === S.rigB) { y = -(1 - q) * 2.6; ry = (1 - q) * .6; }
    r.g.position.y = y; r.g.rotation.y = ry;
    if (r.leds) r.leds.forEach(function (l, j) { var on = (Math.sin(t * (6 + j * 2.3) + j) > .2); l.material.color.setHex(on ? (j < 2 ? 0x30ff50 : 0xff3030) : 0x301010); });
    if (r.globe) r.globe.rotation.y += dt * .35;
    if (r.orb) { r.orb.position.y = 1.15 + Math.sin(t * 1.4) * .05; r.halo.position.y = r.orb.position.y; r.halo.rotation.z += dt * .6; }
  });
  var lr = GL.rigs[S.rigA]; if (lr && lr.screenCenter) { GL.screenLight.position.copy(lr.screenCenter).add(new GL.T.Vector3(0, 0, .7)); GL.screenLight.color.setHex(lr.light); }
  if (S.mode !== "booting") GL.screenLight.intensity = S.mode === "intro" ? 0 : .9;
  // dust
  if (!REDUCE) { var P = GL.dpos; for (var i = 0; i < GL.DN; i++) { var s = GL.dseed[i]; P[i * 3] += Math.sin(t * .2 + s) * .0009; P[i * 3 + 1] += Math.cos(t * .17 + s * 1.3) * .0007 + .0002; if (P[i * 3 + 1] > 3) P[i * 3 + 1] = 0; }
    GL.dust.geometry.attributes.position.needsUpdate = true; }
  if (S.glNeeded) GL.renderer.render(GL.scene, GL.camera);
}
