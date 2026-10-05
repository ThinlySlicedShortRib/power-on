  /* ---------- scene 3: build the tunnel ---------- */
  var world = $("#world");
  var SIDE = innerWidth < 600 ? 230 : 330;   // how far era panels sit from the tunnel axis
  var DEPTH = 9000;                 // total tunnel length in px
  var R = 520;                      // ring radius
  var ERAS = [
    { y: 2016, cls: "p2016", tag: "React (2013)", html: '<div class="bar"><span>☰ tasks</span><span>●</span></div><div class="tiles"><div style="background:#3498db"></div><div style="background:#e74c3c"></div><div style="background:#f1c40f"></div><div style="background:#9b59b6"></div><div style="background:#1abc9c"></div><div style="background:#e67e22"></div></div>' },
    { y: 2010, cls: "p2010", tag: "Bootstrap · mobile web", html: '<div class="nav"><b>Brand</b><span>Home</span><span>About</span><span>Contact</span></div><div class="jumbo"><h3>Hello, world!</h3><p style="margin:0 0 8px;font-size:12px">A responsive template for a simple marketing site.</p><span class="btn">Learn more »</span></div>' },
    { y: 2006, cls: "p2006", tag: "jQuery · Ajax", html: '<div class="hd">Timelinr<div class="beta">BETA</div></div><span class="gel">Sign up free!</span><div class="cloud"><span style="font-size:15px">ajax</span><span>web2.0</span><span style="font-size:13px">rss</span><span>tags</span><span style="font-size:16px">social</span></div>' },
    { y: 1997, cls: "p1997", tag: "JavaScript (1995) · CSS (1996)", html: '<h3>~*~ Welcome 2 My Homepage ~*~</h3><div class="blink">NEW!!</div><div class="uc"></div><div style="font-size:12px">Sign my guestbook!</div><div class="ctr"><b>0</b><b>0</b><b>4</b><b>2</b><b>7</b></div>' },
    { y: 1991, cls: "p1991", tag: "HTML · HTTP", html: '<h3>World Wide Web</h3>The WorldWideWeb (W3) is a wide-area <a>hypermedia</a> information retrieval initiative aiming to give universal access to a large universe of documents.<p style="margin:8px 0 0">Everything there is online about W3 is linked directly or indirectly to this document.</p>' }
  ];
  var RINGS = 26, ringEls = [], panels = [];
  for (var i = 0; i < RINGS; i++) {
    var r = document.createElement("div"); r.className = "ringz";
    var z = -i * (DEPTH / RINGS);
    var hue = lerp(220, 35, i / RINGS);
    r.style.width = r.style.height = (R * 2) + "px";
    r.style.borderColor = "hsla(" + hue + ",80%,70%,.35)";
    r.style.boxShadow = "0 0 30px hsla(" + hue + ",80%,60%,.18), inset 0 0 30px hsla(" + hue + ",80%,60%,.12)";
    r.style.transform = "translate3d(-50%,-50%," + z + "px)";
    world.appendChild(r); ringEls.push(r);
  }
  ERAS.forEach(function (e, k) {
    var z = -(k + .7) * (DEPTH / (ERAS.length + .4));
    var side = k % 2 ? 1 : -1;
    var p = document.createElement("div"); p.className = "panel " + e.cls; p.innerHTML = e.html;
    p.style.transform = "translate3d(" + (side * SIDE - 170) + "px,-150px," + z + "px) rotateY(" + (-side * 28) + "deg)";
    world.appendChild(p);
    var t = document.createElement("div"); t.className = "tag"; t.textContent = e.y + " · " + e.tag;
    t.style.transform = "translate3d(" + (side * SIDE - 150) + "px,100px," + z + "px) rotateY(" + (-side * 28) + "deg)";
    world.appendChild(t);
    panels.push({ el: p, tag: t, z: z, y: e.y });
  });

  /* ---------- audio (only after a gesture) ---------- */
  var ac = null, soundOn = false, lastWhoosh = -1;
  try { soundOn = localStorage.getItem("dive-sound") === "1"; } catch (e) {}
  function setSnd(v) { soundOn = v; $("#snd").textContent = v ? "Sound on" : "Sound off"; $("#snd").setAttribute("aria-pressed", v); try { localStorage.setItem("dive-sound", v ? "1" : "0"); } catch (e) {} if (v) ensureAC(); }
  function ensureAC() { if (!ac) { try { ac = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { ac = null; } } if (ac && ac.state === "suspended") ac.resume(); }
  function whoosh(dur, f0, f1) {
    if (!soundOn || !ac) return;
    var n = Math.floor(ac.sampleRate * dur), buf = ac.createBuffer(1, n, ac.sampleRate), d = buf.getChannelData(0);
    for (var i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
    var src = ac.createBufferSource(); src.buffer = buf;
    var bp = ac.createBiquadFilter(); bp.type = "bandpass"; bp.Q.value = 1.4;
    var g = ac.createGain(), t = ac.currentTime;
    bp.frequency.setValueAtTime(f0, t); bp.frequency.exponentialRampToValueAtTime(f1, t + dur);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.22, t + dur * .35); g.gain.linearRampToValueAtTime(0, t + dur);
    src.connect(bp); bp.connect(g); g.connect(ac.destination); src.start(t); src.stop(t + dur);
  }
  function blip(f) {
    if (!soundOn || !ac) return;
    var o = ac.createOscillator(), g = ac.createGain(), t = ac.currentTime;
    o.type = "triangle"; o.frequency.setValueAtTime(f, t);
    g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(.12, t + .01); g.gain.exponentialRampToValueAtTime(.0001, t + .25);
    o.connect(g); g.connect(ac.destination); o.start(t); o.stop(t + .3);
  }
  $("#snd").addEventListener("click", function () { setSnd(!soundOn); });
  setSnd(soundOn);

  /* ---------- render ---------- */
  var sApp = $("#s-app"), sLay = $("#s-layers"), sTun = $("#s-tunnel"), sDesk = $("#s-desk");
  var browser = $("#browser"), layers = [].slice.call(document.querySelectorAll(".layer")), wire = $("#wire");
  var yearEl = $("#year"), capEl = $("#cap"), prog = $("#prog"), hint = $("#hint");
  var lastCap = null, lastPanel = -1;
  function vis(el, o) { el.style.opacity = o; el.style.visibility = o <= .001 ? "hidden" : "visible"; }

  function render(p) {

    // captions
    var c = ""; for (var i = 0; i < CAPS.length; i++) if (p >= CAPS[i][0] && p < CAPS[i][1]) { c = CAPS[i][2]; break; }
    if (c !== lastCap) {
      lastCap = c; capEl.classList.add("out");
      clearTimeout(render.ct);
      render.ct = setTimeout(function () { capEl.innerHTML = c; if (c) capEl.classList.remove("out"); }, REDUCE ? 0 : 180);
    }

    // scene 1 → zoom into the like button
    hero.classList.toggle("aim", p > T.aim && p < T.zoomB);
    var z = ease(seg(p, T.zoomA, T.zoomB));
    if (REDUCE) { vis(sApp, 1 - seg(p, T.zoomA, T.zoomB)); browser.style.transform = ""; }
    else {
      var br = browser.getBoundingClientRect(), hr = hero.getBoundingClientRect();
      if (!browser._ox || z < .001) {   // measure the origin with the zoom removed
        var keep = browser.style.transform; browser.style.transform = "none";
        br = browser.getBoundingClientRect(); hr = hero.getBoundingClientRect();
        browser._ox = (hr.left + hr.width * .3 - br.left) / br.width * 100;
        browser._oy = (hr.top + hr.height / 2 - br.top) / br.height * 100;
        browser.style.transform = keep;
      }
      browser.style.transformOrigin = browser._ox + "% " + browser._oy + "%";
      browser.style.transform = "scale(" + lerp(1, 40, z * z) + ")";
      vis(sApp, 1 - seg(p, T.zoomB - .03, T.zoomB));
    }
    if (z > .15 && lastWhoosh < 1) { whoosh(1.1, 300, 2400); lastWhoosh = 1; }
    if (p < T.zoomA) lastWhoosh = 0;

    // scene 2: fly through code layers
    var lp = seg(p, T.layA, T.layB);
    vis(sLay, p > T.layA - .01 && p < T.wireB + .01 ? 1 : 0);
    var nL = layers.length;
    layers.forEach(function (el, k) {
      var u = lp * (nL + .6) - k - .55;   // -1 far, 0 centred, +1 passed
      var o = u < -.6 ? 0 : u < -.2 ? (u + .6) / .4 : u < .35 ? 1 : u < .6 ? 1 - (u - .35) / .25 : 0;
      el.style.opacity = o;
      el.style.zIndex = 100 + Math.round(u * 50);
      el.style.transform = REDUCE ? "none" : "translateZ(" + (u * 700) + "px) rotateX(" + (-u * 8) + "deg)";
    });
    var wp = seg(p, T.wireA, T.wireB);
    wire.style.opacity = wp > 0 ? Math.min(1, wp * 3) * (1 - seg(p, T.wireB - .02, T.wireB + .02)) : 0;
    if (wp > 0) {
      var path = $("#wpath"), L = path.getTotalLength(), pt = path.getPointAtLength((1 - wp) * L);
      var pk = $("#pkt"); pk.setAttribute("cx", pt.x); pk.setAttribute("cy", pt.y);
      wire.style.transform = REDUCE ? "" : "scale(" + lerp(1, 3.2, ease(seg(p, T.wireB - .05, T.wireB))) + ")";
    }

    // scene 3: tunnel
    var tp = seg(p, T.tunA, T.tunB);
    var tO = Math.min(seg(p, T.tunA, T.tunA + .04), 1 - seg(p, T.deskA, T.deskA + .03));
    vis(sTun, tO);
    var scale = Math.min(1, innerWidth / 760) * .82 + .18;
    var camZ = tp * DEPTH * 1.02;
    if (!REDUCE) world.style.transform = "scale(" + scale + ") translateZ(" + camZ + "px) rotateZ(" + (tp * 40) + "deg)";
    else world.style.transform = "scale(" + scale + ")";
    // panels: in reduced motion show the nearest one flat
    panels.forEach(function (pn, k) {
      var dz = pn.z + camZ;        // >0 means behind the camera
      var o = REDUCE ? (Math.abs(k - tp * (panels.length - .01)) < .5 ? 1 : 0) : dz > 120 ? 0 : dz < -5200 ? 0 : 1;
      pn.el.style.opacity = o; pn.tag.style.opacity = o;
      if (REDUCE) pn.el.style.transform = "translate3d(-170px,-150px,0)";
      if (REDUCE) pn.tag.style.transform = "translate3d(-150px,100px,0)";
    });
    ringEls.forEach(function (r, k) { var dz = -k * (DEPTH / RINGS) + camZ; r.style.opacity = dz > 200 ? 0 : 1; });
    // year counter: 2026 → 1989
    var YK = [[0, 2026]].concat(panels.map(function (pn) { return [((-pn.z) - 250) / (DEPTH * 1.02), pn.y]; })).concat([[1, 1989]]), yr = 1989;
    for (var yk = 1; yk < YK.length; yk++) if (tp <= YK[yk][0]) { yr = Math.round(lerp(YK[yk - 1][1], YK[yk][1], (tp - YK[yk - 1][0]) / (YK[yk][0] - YK[yk - 1][0]))); break; }
    yearEl.textContent = yr;
    yearEl.style.opacity = tO > 0 ? tO * .7 : 0;
    var pi = Math.floor(tp * panels.length);
    if (tp > 0 && tp < 1 && pi !== lastPanel) { lastPanel = pi; blip(lerp(880, 330, tp)); }
    if (tp > .02 && lastWhoosh < 2) { whoosh(2.2, 2400, 200); lastWhoosh = 2; }

    // scene 4: the desk
    var dO = seg(p, T.deskA, T.deskA + .05);
    vis(sDesk, dO);
    sDesk.style.transform = REDUCE ? "" : "scale(" + lerp(1.25, 1, ease(dO)) + ")";
    sDesk.style.pointerEvents = dO > .6 ? "auto" : "none";
    sApp.style.pointerEvents = mode === "play" ? "auto" : "none";
  }

