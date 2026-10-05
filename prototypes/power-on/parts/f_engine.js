// ================= STORY ENGINE =================
var screenEl = $("#screen"), stage = $("#stage"), linesEl = $("#lines"), narrEl = $("#narr"), titleEl = $("#eratitle"), fxEl = $("#fx");
var SEG = [], TOTAL = 0, VH = innerHeight, BEATU = .72, TRANSU = 2.6, FINU = 1.9;
var curEra = -1, curBeat = null, curProp = null, propCache = {}, typeTimer = 0, lastOrder = -1;

function buildTrack() {
  SEG = []; var u = 0, order = 0;
  ERAS.forEach(function (e, ei) {
    for (var b = -1; b < e.beats.length; b++) { SEG.push({ k: "beat", e: ei, b: b, s: u, l: BEATU, o: order++ }); u += BEATU; }
    if (ei < ERAS.length - 1) { SEG.push({ k: "trans", e: ei, s: u, l: TRANSU }); u += TRANSU; } else { SEG.push({ k: "fin", e: ei, s: u, l: FINU }); u += FINU; }
  });
  TOTAL = u; $("#track").style.height = Math.ceil(TOTAL * VH + innerHeight) + "px";
}

var FX = {
  1: "",
  2: '<div class="marquee"><span>*** Welcome to the Information Superhighway!!! *** Best viewed in 800x600 with Netscape-ish Navigator *** Sign my guestbook *** This page is UNDER CONSTRUCTION ***</span></div><div class="uc"></div>',
  3: '<div class="gloss-top"><b>Timelinr</b></div><div class="starburst">Beta!</div>',
  4: '<div class="flatnav"><i></i>Flatly</div><div class="longshadow ls1">✓</div>',
  5: '<div class="mesh"></div>'
};
function setEra(ei) {
  if (ei === curEra) return; curEra = ei; var e = ERAS[ei];
  screenEl.dataset.era = String(e.n); fxEl.innerHTML = FX[e.n];
  titleEl.innerHTML = esc(e.title) + "<b>" + esc(e.name) + "</b>";
  if (typeof futureFx === "function") futureFx(e.n === 6);
  $("#adv").innerHTML = ADVTXT[e.n]; $("#hudYr").textContent = e.span; $("#hudName").textContent = e.name;
  document.querySelectorAll("#pips i").forEach(function (p, i) { p.classList.toggle("on", i <= ei); });
  curBeat = null;
}
function typeInto(node, html) {
  cancelAnimationFrame(typeTimer); var txt = strip(html);
  if (REDUCE) { node.innerHTML = html; glossifyEl(node); return; }
  if (screenEl.dataset.era === "6") {   // the future streams in word by word, like a model's output
    var words = txt.split(/(\s+)/), wt0 = performance.now(), wper = Math.min(70, 1500 / words.length);
    node.textContent = ""; node.classList.add("streaming");
    (function wstep(now) { var n = Math.min(words.length, Math.floor((now - wt0) / wper)); while (node.childNodes.length < n) { var s = el("span", "tok"); s.textContent = words[node.childNodes.length]; node.appendChild(s); }
      if (n < words.length) typeTimer = requestAnimationFrame(wstep); else { node.classList.remove("streaming"); node.innerHTML = html; glossifyEl(node); } })(wt0);
    return;
  }
  var per = Math.min(24, 1400 / txt.length), t0 = performance.now(), cur = el("span", "cur");
  (function step(now) { var n = Math.min(txt.length, Math.floor((now - t0) / per)); node.textContent = txt.slice(0, n); node.appendChild(cur);
    if (n < txt.length) typeTimer = requestAnimationFrame(step); else { node.innerHTML = html; glossifyEl(node); } })(t0);
}
function setBeat(ei, b, order) {
  var key = ei + ":" + b; if (key === curBeat) return; curBeat = key;
  var fwd = order == null || order > lastOrder; if (order != null) lastOrder = order;
  var beats = ERAS[ei].beats; narrEl.classList.toggle("title", b < 0);
  linesEl.innerHTML = "";
  if (b >= 0) {
    for (var i = Math.max(0, b - 2); i <= b; i++) { var ln = el("div", "line" + (i === b - 1 ? " old" : i === b - 2 ? " old2" : ""));
      if (i === b && fwd) typeInto(ln, beats[i].t); else { ln.innerHTML = beats[i].t; glossifyEl(ln); } linesEl.appendChild(ln); }
    if (beats[b].s) linesEl.insertBefore(el("div", "tstory", "True story"), linesEl.firstChild);
    if (ERAS[ei].n === 6) linesEl.insertAdjacentHTML("afterbegin", confHTML(ei, b));
    $("#srline").textContent = (beats[b].s ? "True story. " : "") + strip(beats[b].t);
  } else { cancelAnimationFrame(typeTimer); if (ERAS[ei].n === 6) linesEl.innerHTML = confHTML(ei, -1); $("#srline").textContent = ERAS[ei].title + ". " + ERAS[ei].name + ", " + ERAS[ei].span + "."; }
  showProp(b >= 0 ? beats[b].p : null);
}
function buildProp(id) {
  if (PEOPLE[id]) return personEl(id); if (CODE[id]) return codeEl(id);
  if (/^dg\d$/.test(id)) return dioOK() ? dioramaEl(+id.slice(2)) : diagramEl(+id.slice(2)); if (STATIC[id]) return glossifyEl(STATIC[id]()); var pa = id.split(":"); if (WIDGETS[pa[0]]) return WIDGETS[pa[0]](pa[1]);
  return el("div");
}
function showProp(id) {
  if (id === curProp) return; var old = stage.querySelector(".prop:not(.out)"); curProp = id;
  if (old && old._inner && old._inner._hide) old._inner._hide();
  if (old) { old.classList.add("out"); setTimeout(function () { if (old.classList.contains("out") && old.parentNode) old.parentNode.removeChild(old); }, 600); }
  if (!id) return;
  var w = propCache[id];
  if (!w) { w = el("div", "prop out"); if (/^(w-|dg)/.test(id)) w.dataset.interactive = "1"; var inner = buildProp(id); w.appendChild(inner); w._inner = inner; propCache[id] = w; }
  w.classList.add("out"); stage.appendChild(w); void w.offsetWidth; w.classList.remove("out");
  if (w._inner && w._inner._show) w._inner._show();
}

function setScreen(o) {
  screenEl.style.opacity = o; screenEl.classList.toggle("live", o > .005);
  screenEl.style.pointerEvents = o > .6 ? "auto" : "none";
  S.glNeeded = o < .999 || S.mode !== "story";
}
function update() {
  if (S.mode !== "story") return;
  var y = scrollY / VH, seg = SEG[SEG.length - 1];
  for (var i = 0; i < SEG.length; i++) if (y < SEG[i].s + SEG[i].l) { seg = SEG[i]; break; }
  var p = clamp((y - seg.s) / seg.l), R = GL && GL.rigs, transO = 0, finO = 0;
  $("#adv").classList.toggle("on", seg.k === "beat" && seg.b < 2);
  if (seg.k === "beat") {
    S.rigA = seg.e; S.rigB = -1; S.swapQ = 0; if (R) S.pose = R[seg.e].inPose;
    setEra(seg.e); setBeat(seg.e, seg.b, seg.o); setScreen(1);
  } else if (seg.k === "trans") {
    var a = seg.e, b = a + 1, so = p < .15 ? 1 - p / .15 : p > .85 ? (p - .85) / .15 : 0;
    if (p < .5) { setEra(a); setBeat(a, ERAS[a].beats.length - 1); } else { setEra(b); setBeat(b, -1); }
    setScreen(so);
    S.rigA = a; S.rigB = b; S.swapQ = ease((p - .38) / .24);
    if (R) { var A = R[a], B = R[b];
      S.pose = p < .15 ? A.inPose : p < .4 ? lerpPose(A.inPose, A.out, ease((p - .15) / .25)) : p < .6 ? lerpPose(A.out, B.out, ease((p - .4) / .2)) : p < .85 ? lerpPose(B.out, B.inPose, ease((p - .6) / .25)) : B.inPose; }
    transO = clamp(1 - Math.abs(p - .5) / .26);
    $("#transYrs").innerHTML = esc(TRANS[a].from) + " <span>→</span> " + esc(TRANS[a].to); $("#transCap").textContent = TRANS[a].cap;
  } else {
    S.rigA = seg.e; S.rigB = -1; S.swapQ = 0; setEra(seg.e); setBeat(seg.e, ERAS[seg.e].beats.length - 1);
    setScreen(clamp(1 - p / .2)); if (R) S.pose = lerpPose(R[seg.e].inPose, R[seg.e].out, ease(p / .6));
    finO = clamp((p - .45) / .3);
  }
  $("#trans").style.opacity = transO; $("#fin").style.opacity = finO; $("#fin").classList.toggle("on", finO > .5);
  $("#nogl").classList.toggle("on", !GL && (S.mode !== "story" || transO > 0 || finO > 0));
}

// ================= CLICK / KEY TO ADVANCE =================
var ADVTXT = { 1: 'PRESS RETURN OR CLICK <span class="cur"></span>', 2: "&gt;&gt; Click here! &lt;&lt;", 3: "Continue »", 4: "Tap to continue", 5: "Click, tap or press <kbd>→</kbd>" };
var advUsed = store("poweron.adv") === "1", scrollAnim = null;
function segAt(y) { for (var i = 0; i < SEG.length; i++) if (y < SEG[i].s + SEG[i].l) return i; return SEG.length - 1; }
function cancelScrollAnim() { if (scrollAnim) { cancelAnimationFrame(scrollAnim.raf); scrollAnim = null; } }
function animScroll(target, dur, idx) {
  cancelScrollAnim(); if (!dur) { window.scrollTo(0, target); return; }
  var from = scrollY, t0 = performance.now(), a = { idx: idx, raf: 0 }; scrollAnim = a;
  (function step(now) { if (scrollAnim !== a) return; var k = Math.min(1, (now - t0) / dur), e = k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
    window.scrollTo(0, from + (target - from) * e); if (k < 1) a.raf = requestAnimationFrame(step); else scrollAnim = null; })(t0);
}
function advance(dir) {
  if (S.mode !== "story" || !SEG.length) return;
  var i = scrollAnim ? scrollAnim.idx : segAt(scrollY / VH), j = i + dir;
  while (SEG[j] && SEG[j].k === "trans") j += dir;
  if (!SEG[j]) return;
  var target = (SEG[j].k === "fin" ? SEG[j].s + SEG[j].l * .95 : SEG[j].s + SEG[j].l * .35) * VH;
  var far = Math.abs(j - i) > 1 || SEG[j].k === "fin" || SEG[i].k === "trans";
  animScroll(target, REDUCE ? 0 : far ? 2800 : 420, j);
  if (!advUsed) { advUsed = true; store("poweron.adv", "1"); $("#adv").classList.remove("on"); }
}
["wheel", "touchstart"].forEach(function (ev) { window.addEventListener(ev, function () { cancelScrollAnim(); }, { passive: true }); });
screenEl.addEventListener("click", function (e) {
  if (S.mode !== "story") return;
  if (e.target.closest("a, button, input, textarea, select, label, .gl-term, .tip, [data-interactive]")) return;
  var sel = window.getSelection && String(window.getSelection()); if (sel) return;
  advance(1);
});
window.addEventListener("keydown", function (e) {
  if (S.mode !== "story" || e.altKey || e.ctrlKey || e.metaKey) return;
  var t = e.target, tag = (t.tagName || "").toLowerCase();
  if (tag === "input" || tag === "textarea" || tag === "select" || t.isContentEditable) return;
  var fwd = { " ": 1, ArrowRight: 1, ArrowDown: 1, Enter: 1, PageDown: 1 }, back = { ArrowLeft: 1, ArrowUp: 1, PageUp: 1 };
  if ((e.key === " " || e.key === "Enter") && (tag === "button" || tag === "a" || (t.classList && t.classList.contains("gl-term")))) return;
  if (fwd[e.key]) { e.preventDefault(); advance(1); } else if (back[e.key]) { e.preventDefault(); advance(-1); }
});

// ================= POWER ON / OFF =================
function startPower() {
  if (S.mode !== "intro") return;
  audio(); if (soundOn) hum();
  $("#intro").classList.add("gone"); $("#power").classList.remove("pulse");
  S.mode = "booting"; S.handed = false; S.powerT0 = performance.now();
  if (GL) { var r0 = GL.rigs[0]; r0.led.material.color.setHex(0x30ff50); r0.power.material.emissiveIntensity = 0;
    S.bootFrom = { p: GL.camera.position.clone(), t: r0.out.t.clone() }; }
  else setTimeout(handOver, REDUCE ? 200 : 1600);
}
function handOver() {
  S.mode = "story"; VH = innerHeight; buildTrack(); window.scrollTo(0, 0);
  document.body.classList.remove("locked"); $("#intro").style.visibility = "hidden";
  curEra = -1; curBeat = null; lastOrder = -1;
  screenEl.style.transition = "opacity .8s"; update(); setTimeout(function () { screenEl.style.transition = ""; S.glNeeded = false; }, 900);
  $("#hudEra").classList.add("on"); humFade(5);
}
function powerOff() {
  humFade(.5); S.mode = "intro"; window.scrollTo(0, 0); document.body.classList.add("locked");
  setScreen(0); S.glNeeded = true; $("#fin").style.opacity = 0; $("#fin").classList.remove("on"); $("#trans").style.opacity = 0; $("#adv").classList.remove("on"); cancelScrollAnim(); tipHide(true);
  $("#hudEra").classList.remove("on"); var it = $("#intro"); it.style.visibility = ""; it.classList.remove("gone"); $("#power").classList.add("pulse"); $("#track").style.height = "0px";
  S.rigA = 0; S.rigB = -1; S.swapQ = 0; S.pose = null;
  if (GL) { var r0 = GL.rigs[0], s = r0.screen; s.ctx.fillStyle = "#050806"; s.ctx.fillRect(0, 0, s.c.width, s.c.height); s.tex.needsUpdate = true; r0.led.material.color.setHex(0x1a2a1a); }
}
// after boot, the 1989 screen keeps the green page (redrawn on hand-over so it matches the DOM)
var _ho = handOver; handOver = function () { _ho(); if (GL) { var s = GL.rigs[0].screen; drawEraScreen(1, s.ctx, s.c.width, s.c.height); s.tex.needsUpdate = true; } };

// ================= BOOT =================
(function boot() {
  document.body.classList.add("locked");
  setSound(soundOn);
  try { GL = initGL(); } catch (e) { GL = null; if (window.console) console.warn("3D scene unavailable:", e); }
  if (!GL) { $("#nogl").classList.add("on"); $("#gl").style.display = "none"; }
  requestAnimationFrame(tick);

  $("#power").addEventListener("click", startPower);
  $("#again").addEventListener("click", powerOff);
  $("#sound").addEventListener("click", function () { audio(); setSound(!soundOn); if (!soundOn) humFade(.2); });
  var canvas = $("#gl");
  function hitPower(e) { if (!GL || S.mode !== "intro") return false; var r = canvas.getBoundingClientRect(); GL.ptr.set((e.clientX - r.left) / r.width * 2 - 1, -(e.clientY - r.top) / r.height * 2 + 1);
    GL.ray.setFromCamera(GL.ptr, GL.camera); return GL.ray.intersectObject(GL.rigs[0].power, false).length > 0 || GL.ray.intersectObject(GL.rigs[0].g, true).length > 0; }
  canvas.addEventListener("pointermove", function (e) { canvas.style.cursor = hitPower(e) ? "pointer" : ""; });
  canvas.addEventListener("click", function (e) { if (S.mode === "story") { advance(1); return; } if (hitPower(e)) startPower(); });
  window.addEventListener("scroll", function () { requestAnimationFrame(update); }, { passive: true });
  var lastW = innerWidth;
  window.addEventListener("resize", function () {
    if (GL) { GL.renderer.setSize(innerWidth, innerHeight, false); computePoses(); }
    if (S.mode === "story" && (innerWidth !== lastW || Math.abs(innerHeight - VH) > 140)) { var ratio = scrollY / VH; VH = innerHeight; buildTrack(); window.scrollTo(0, ratio * VH); }
    lastW = innerWidth; update();
  });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { if (!GL) return;
    GL.rigs.forEach(function (r, i) { if (i === 0 && S.mode === "intro") return; drawEraScreen(i + 1, r.screen.ctx, r.screen.c.width, r.screen.c.height); r.screen.tex.needsUpdate = true; });
    var nt = GL.rigs[0].g.userData.noteTex; if (nt) { drawStickyNote(nt.ctx, 256, 256); nt.tex.needsUpdate = true; } });
  // keyboard: Enter/space on the page before power-on presses power
  window.addEventListener("keydown", function (e) { if (S.mode === "intro" && (e.key === "Enter" || e.key === " ") && document.activeElement === document.body) { e.preventDefault(); startPower(); } });
})();
