// ================= HELPERS =================
function $(s, r) { return (r || document).querySelector(s); }
function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
function clamp(v, a, b) { return Math.max(a == null ? 0 : a, Math.min(b == null ? 1 : b, v)); }
function strip(h) { var d = document.createElement("div"); d.innerHTML = h; return d.textContent; }
function store(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } }

// ================= SOUND =================
var AC = null, master = null, soundOn = store("poweron.sound") !== "off", humNodes = null;
function audio() {
  if (!AC) { try { AC = new (window.AudioContext || window.webkitAudioContext)(); master = AC.createGain(); master.gain.value = soundOn ? 1 : 0; master.connect(AC.destination); } catch (e) { AC = null; } }
  if (AC && AC.state === "suspended") AC.resume();
  return AC;
}
function setSound(on) {
  soundOn = on; store("poweron.sound", on ? "on" : "off");
  var b = $("#sound"); b.setAttribute("aria-pressed", on); $("#soundLbl").textContent = on ? "Sound on" : "Sound off";
  if (master) master.gain.setTargetAtTime(on ? 1 : 0, AC.currentTime, .05);
}
function noiseBuf(ac, sec) { var b = ac.createBuffer(1, ac.sampleRate * sec, ac.sampleRate), d = b.getChannelData(0); for (var i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; return b; }
function tone(ac, f, t0, dur, gain, type, dest) { var o = ac.createOscillator(), g = ac.createGain(); o.type = type || "sine"; o.frequency.value = f; g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(gain, t0 + .01); g.gain.setValueAtTime(gain, t0 + dur - .02); g.gain.linearRampToValueAtTime(0, t0 + dur); o.connect(g); g.connect(dest || master); o.start(t0); o.stop(t0 + dur + .05); return o; }
function hum() {
  var ac = audio(); if (!ac) return; var t = ac.currentTime, out = ac.createGain(); out.gain.setValueAtTime(0, t); out.gain.linearRampToValueAtTime(1, t + .6); out.connect(master);
  var a = ac.createOscillator(); a.frequency.value = 60; var ga = ac.createGain(); ga.gain.value = .022; a.connect(ga); ga.connect(out); a.start();
  var b = ac.createOscillator(); b.frequency.value = 120; var gb = ac.createGain(); gb.gain.value = .01; b.connect(gb); gb.connect(out); b.start();
  var w = ac.createOscillator(); w.frequency.value = 15734; var gw = ac.createGain(); gw.gain.value = .0015; w.connect(gw); gw.connect(out); w.start(); // CRT flyback whine
  var n = ac.createBufferSource(); n.buffer = noiseBuf(ac, 2); n.loop = true; var lp = ac.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 380; var gn = ac.createGain(); gn.gain.value = .025; n.connect(lp); lp.connect(gn); gn.connect(out); n.start();
  // the "thunk" of the degauss coil
  var th = ac.createBufferSource(); th.buffer = noiseBuf(ac, .5); var tf = ac.createBiquadFilter(); tf.type = "lowpass"; tf.frequency.value = 140; var tg = ac.createGain(); tg.gain.setValueAtTime(.25, t); tg.gain.exponentialRampToValueAtTime(.001, t + .45); th.connect(tf); tf.connect(tg); tg.connect(master); th.start(t);
  [72, 76, 79, 84, 88].forEach(function (m, i) { tone(ac, 440 * Math.pow(2, (m - 69) / 12), t + 1.1 + i * .11, .35, .05, "triangle"); });   // cheerful start-up chime
  humNodes = { out: out, src: [a, b, w, n] };
}
function humFade(sec) { if (!humNodes || !AC) return; var t = AC.currentTime, h = humNodes; h.out.gain.setTargetAtTime(0, t, sec / 4); setTimeout(function () { h.src.forEach(function (s) { try { s.stop(); } catch (e) {} }); }, sec * 1000 + 300); humNodes = null; }
function blip(f) { var ac = audio(); if (!ac || !soundOn) return; tone(ac, f || 880, ac.currentTime, .06, .06, "square"); }
function modemSound(onStep) {
  var ac = audio(), t = ac ? ac.currentTime + .05 : 0, steps = [];
  function at(s, fn) { steps.push(setTimeout(fn, s * 1000)); }
  if (ac) {
    tone(ac, 350, t, 1.1, .08); tone(ac, 440, t, 1.1, .08);
    var dtmf = [[941, 1336], [770, 1336], [770, 1336], [941, 1336], [697, 1209], [697, 1336], [770, 1209]];
    dtmf.forEach(function (p, i) { var s = t + 1.25 + i * .14; tone(ac, p[0], s, .09, .07); tone(ac, p[1], s, .09, .07); });
    tone(ac, 440, t + 2.4, 1.0, .06); tone(ac, 480, t + 2.4, 1.0, .06);
    tone(ac, 2100, t + 3.6, 1.2, .07);
    var o = ac.createOscillator(), g = ac.createGain(); o.type = "square"; g.gain.setValueAtTime(0, t + 4.8); g.gain.linearRampToValueAtTime(.035, t + 4.85); g.gain.setValueAtTime(.035, t + 6.1); g.gain.linearRampToValueAtTime(0, t + 6.2);
    for (var k = 0; k < 26; k++) o.frequency.setValueAtTime(900 + Math.random() * 1500, t + 4.8 + k * .05); o.connect(g); g.connect(master); o.start(t + 4.8); o.stop(t + 6.3);
    var n = ac.createBufferSource(); n.buffer = noiseBuf(ac, 1.8); var bp = ac.createBiquadFilter(); bp.type = "bandpass"; bp.frequency.value = 1800; bp.Q.value = .7; var gn = ac.createGain();
    gn.gain.setValueAtTime(0, t + 6.2); gn.gain.linearRampToValueAtTime(.12, t + 6.3); gn.gain.setValueAtTime(.12, t + 7.6); gn.gain.linearRampToValueAtTime(0, t + 7.9); n.connect(bp); bp.connect(gn); gn.connect(master); n.start(t + 6.2);
  }
  [[0, "ATDT 555-0142", 1], [1.25, "DIALING...", 2], [2.4, "RINGING", 3], [3.6, "ANSWER TONE 2100 Hz", 4], [4.8, "TRAINING...  V.34", 5], [6.2, "PROTOCOL: LAP-M / V.42BIS", 6], [7.9, "CONNECT 28800", 7]].forEach(function (s) { at(s[0], function () { onStep(s[1], s[2]); }); });
  return steps;
}

// ================= PROPS =================
var FACE = '<svg viewBox="0 0 112 136" aria-hidden="true"><circle cx="56" cy="50" r="24" fill="currentColor" opacity=".55"/><path d="M14 136c4-30 22-44 42-44s38 14 42 44z" fill="currentColor" opacity=".45"/></svg>';
function personEl(id) {
  var p = PEOPLE[id], c = el("div", "card person");
  c.innerHTML = '<div class="bar"><span>Introducing</span><span>' + esc(p.yrs) + '</span></div><div class="body"><div class="face" style="color:var(--muted)">' + FACE + '<span>' + p.ini + '</span></div><div><div class="intro">Character</div><h3>' + esc(p.name) + '</h3><div class="role">' + esc(p.role) + '</div><ul style="margin-top:10px">' + p.facts.map(function (f) { return "<li>" + esc(f) + "</li>"; }).join("") + "</ul></div></div>";
  return glossifyEl(c);
}
function codeEl(id) { var k = CODE[id], c = el("div", "card " + (k.cls || "")); c.innerHTML = '<div class="bar"><span>' + esc(k.file) + '</span><span aria-hidden="true">● ● ●</span></div><div class="body"><pre>' + esc(k.src) + "</pre></div>"; return c; }
function diagramEl(n) {
  var w = el("div", "dgwrap"), tpl = document.getElementById("tpl-dg" + n); w.appendChild(tpl.content.cloneNode(true));
  var cap = el("div", "dgcap", '<span>Where it lived. Latencies are rough.</span>'); glossifyEl(cap), b = el("button", "btn", "▶ Send a request"); b.type = "button"; b.style.fontSize = ".8rem"; b.style.padding = "4px 10px"; cap.appendChild(b); w.appendChild(cap);
  b.addEventListener("click", function () { playDiagram($(".dg", w)); });
  w._show = function () { setTimeout(function () { playDiagram($(".dg", w)); }, 500); };
  var box = el("div"); box.style.width = "min(100%, 620px)"; box.appendChild(w); box._show = w._show; return box;
}
function playDiagram(svg) {
  if (!svg || svg._playing) return; var path = $(".route", svg), pk = $(".packet", svg); if (!path || !pk) return;
  if (REDUCE) { pk.classList.add("on"); var e = path.getPointAtLength(path.getTotalLength()); pk.setAttribute("cx", e.x); pk.setAttribute("cy", e.y); return; }
  var L = path.getTotalLength(), dur = +svg.dataset.dur || 2600, one = svg.dataset.mode === "oneway", t0 = performance.now(); svg._playing = true; pk.classList.add("on");
  (function step(now) { var t = Math.min(1, (now - t0) / dur), e = t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2, p = one ? e : (e < .5 ? e * 2 : 2 - e * 2);
    pk.classList.toggle("back", one ? t > .5 : e >= .5); var pt = path.getPointAtLength(p * L); pk.setAttribute("cx", pt.x); pk.setAttribute("cy", pt.y);
    if (t < 1) requestAnimationFrame(step); else svg._playing = false; })(t0);
}

var STATIC = {
  "ph-cern": function () { var c = el("div", "card"); c.style.width = "min(100%, 480px)";
    c.innerHTML = '<div class="bar"><span>MAP · CERN SITE · 1989</span><span>N ↑</span></div><div class="body"><svg viewBox="0 0 420 260" style="width:100%;color:var(--fg)" role="img" aria-label="Sketch of the CERN site straddling the French–Swiss border near Geneva, with the 27 km LEP ring and Tim Berners-Lee\'s office in Building 31.">' +
      '<path d="M40 30 C120 90 150 120 170 250" fill="none" stroke="currentColor" stroke-dasharray="6 6" opacity=".6"/><text x="44" y="22" fill="currentColor" font-size="14" font-family="VT323,monospace">FRANCE ¦ SWITZERLAND</text>' +
      '<ellipse cx="210" cy="140" rx="150" ry="92" fill="none" stroke="currentColor" stroke-width="3"/><text x="300" y="250" fill="currentColor" font-size="15" font-family="VT323,monospace">LEP ring · 27 km · switched on Aug 1989</text>' +
      '<rect x="318" y="44" width="70" height="26" fill="none" stroke="currentColor"/><text x="324" y="62" fill="currentColor" font-size="15" font-family="VT323,monospace">GENEVA →</text>' +
      '<circle cx="132" cy="196" r="7" fill="#ffd23d"/><text x="146" y="200" fill="#ffd23d" font-size="16" font-family="VT323,monospace">Building 31: Tim\'s office</text></svg></div>'; return c; },
  "ph-memo": function () { return el("div", "memo", '<span class="scrawl">Vague but exciting…</span><p>CERN · March 1989 · T. Berners-Lee</p><h4>Information Management: A Proposal</h4><p>This proposal concerns the management of general information about accelerators and experiments at CERN.</p><div class="boxes"><i></i><i></i><i></i><i></i><i></i><i></i></div><p style="margin-top:10px;font-size:.78rem">The note in red is from his manager, Mike Sendall.</p>'); },
  "ph-note": function () { return el("div", "note3d", "This machine is a server.<br>DO NOT POWER IT DOWN!!"); },
  "ph-usenet": function () { return el("div", "usenet", "From: timbl@info.cern.ch (Tim Berners-Lee)\nNewsgroups: alt.hypertext\nSubject: WorldWideWeb: Summary\nDate: 6 Aug 91\n\nThe WWW project merges the techniques of\ninformation retrieval and hypertext to make\nan easy but powerful global information\nsystem.\n\n...If you're interested in using the code,\nmail me.\n\n<b style='color:#ffd23d'>Reply  Followup  Next ▸</b>"); },
  "ph-pd": function () { return el("div", "stamp", "<div>CERN · 30 APRIL 1993<b>PUBLIC<br>DOMAIN</b>The W3 software is free for anyone to use.</div>"); },
  "ph-crash": function () { var c = el("div", "card crash"); c.style.width = "min(100%, 500px)";
    var pts = [[1995, 750], [1996, 1050], [1997, 1300], [1998, 1570], [1999, 2200], [1999.9, 4000], [2000.2, 5048], [2000.5, 3900], [2001, 2470], [2001.5, 2100], [2002, 1950], [2002.8, 1114]];
    var X = function (y) { return 40 + (y - 1995) / 8 * 400; }, Y = function (v) { return 210 - v / 5500 * 190; };
    var d = pts.map(function (p, i) { return (i ? "L" : "M") + X(p[0]).toFixed(1) + " " + Y(p[1]).toFixed(1); }).join(" ");
    c.innerHTML = '<div class="bar"><span>STOCKS.EXE · Tech index</span><span class="newbadge">CRASH!</span></div><div class="body"><svg viewBox="0 0 460 240" role="img" aria-label="Approximate tech stock index: about 750 in 1995, peaking near 5,048 in March 2000, falling to about 1,114 by October 2002.">' +
      [1000, 3000, 5000].map(function (v) { return '<line x1="40" x2="440" y1="' + Y(v) + '" y2="' + Y(v) + '" stroke="#888" stroke-dasharray="2 3"/><text x="4" y="' + (Y(v) + 4) + '" font-size="11" font-family="Courier New">' + v + "</text>"; }).join("") +
      [1995, 1997, 1999, 2001, 2003].map(function (y) { return '<text x="' + (X(y) - 14) + '" y="232" font-size="11" font-family="Courier New">' + y + "</text>"; }).join("") +
      '<path d="' + d + '" fill="none" stroke="#c00000" stroke-width="3"/><circle cx="' + X(2000.2) + '" cy="' + Y(5048) + '" r="5" fill="#c00000"/><text x="' + (X(2000.2) + 8) + '" y="' + (Y(5048) + 4) + '" font-size="12" font-weight="700" font-family="Courier New">Mar 2000: 5,048</text>' +
      '<text x="' + (X(2002.8) - 76) + '" y="' + (Y(1114) + 18) + '" font-size="12" font-family="Courier New">Oct 2002: 1,114</text></svg><small>Approximate closing values of the main tech-heavy US index.</small></div>'; return c; },
  "ph-inbox": function () { var c = el("div", "card inbox"); c.style.width = "min(100%, 500px)";
    c.innerHTML = '<div class="bar"><span>Webmail <sup>beta</sup></span><span>Inbox (3)</span></div><div class="body" style="gap:0">' +
      [["★", "Mom", "Is this the new email thing??", 1], ["", "Rails Weekly", "Ruby on Rails 0.13 released", 1], ["★", "PhotoShare", "Someone tagged your photo", 1], ["", "Me", "Draft: why I'm switching to Firefox", 0], ["", "Bank", "Your statement is ready", 0]].map(function (r) { return '<div class="row' + (r[3] ? " u" : "") + '"><span style="color:#ffb000">' + r[0] + "</span><span>" + r[1] + "</span><span>" + r[2] + "</span></div>"; }).join("") +
      '<div class="quota" style="margin-top:10px">You are currently using 2 MB (0%) of your <b>1000 MB</b>.</div></div>'; return c; },
  "ph-aws": function () { var c = el("div", "card"); c.style.width = "min(100%, 400px)";
    c.innerHTML = '<div class="bar"><span>Invoice · August 2006</span><span>PAID</span></div><div class="body" style="font-family:var(--f-mono);font-size:.85rem"><div style="display:flex;justify-content:space-between"><span>Virtual server, small</span><span>$0.10 / hr</span></div><div style="display:flex;justify-content:space-between"><span>Storage</span><span>$0.15 / GB-mo</span></div><div style="display:flex;justify-content:space-between"><span>Hardware you bought</span><span>$0.00</span></div><hr style="border:0;border-top:1px dashed currentColor;width:100%"><div style="display:flex;justify-content:space-between;font-weight:700"><span>Server room you need</span><span>none</span></div><small style="color:var(--muted)">2006 launch prices for rented compute and storage.</small></div>'; return c; },
  "ph-phone": function () { return el("div", "phone2007", '<div><b>Timelinr</b>The full desktop site, tiny. Double-tap to zoom. Pinch with two fingers. No Flash. Every page now has to work at 320 pixels wide.<br><br>Headlines · Weather · Your feeds · Photos · Sign in · Help · Terms · Privacy · Mobile version coming soon</div>'); },
  "ph-boxes": function () { return el("div", "boxes3", "<i>web</i><i>api</i><i>worker</i><i>db</i><i>cache</i><i>queue</i><i class='lam'>λ</i>"); },
  "ph-lineup": function () { var c = el("div", "lineup"), items = [["1990", "M8 10h34v28H8zM48 10h18v38H48zM14 44h22"], ["1995", "M6 8h40v32H6zM52 6h16v44H52zM10 46h32v6H10z"], ["2005", "M10 8h50v32H10zM4 42h62v6H4z"], ["2012", "M10 8h44v30H10zM4 40h56v5H4zM60 18h10v26H60z"], ["now", "M12 10h46v30H12zM6 42h58v3H6zM62 6a6 6 0 1 0 0.1 0"], ["next", "M6 34a9 9 0 1 0 18 0a9 9 0 1 0 -18 0M30 34a9 9 0 1 0 18 0a9 9 0 1 0 -18 0M24 34h6M58 18a8 8 0 1 0 0.1 0M50 18a12 4 0 1 0 0.1 0"]];
    c.innerHTML = items.map(function (it) { return '<div><svg viewBox="0 0 74 56" fill="none" stroke="currentColor" stroke-width="2" style="color:var(--fg)"><path d="' + it[1] + '"/></svg>' + it[0] + "</div>"; }).join(""); return c; }
};

var WIDGETS = {
  "w-term": function () {
    var PAGES = {
      home: "The World Wide Web project\n\nWORLD WIDE WEB\n\nThe WorldWideWeb (W3) is a wide-area hypermedia information retrieval initiative aiming to give universal access to a large universe of documents.\n\nWhat's out there?[1]  Help[2]  People[3]\nHistory[4]",
      1: "WHAT'S OUT THERE?\n\nAbout 50 web servers exist by January 1993.\n\nSLAC, Stanford[5]: first server outside Europe, December 1991.\nCERN phone book[6]",
      2: "HELP\n\nType the number of a link and press RETURN.\nB = back, H = home, Q = quit.",
      3: "PEOPLE\n\nTim Berners-Lee: proposal, first server and browser\nRobert Cailliau: co-wrote the 1990 proposal\nNicola Pellow: this line-mode browser\nJean-François Groff: libwww",
      4: "HISTORY\n\n1989 Mar  First proposal\n1990 Nov  Formal proposal, with Robert Cailliau\n1990 Dec  First server and browser running\n1991 Aug  Announced on alt.hypertext\n1993 Apr  Released into the public domain",
      5: "SLAC\n\nPaul Kunz saw the web at CERN, went home to California, and put SLAC's physics paper database on it.",
      6: "CERN PHONE BOOK\n\nOne of the web's first popular uses: looking up a colleague's phone number."
    };
    var w = el("div", "term"), out = el("div", "out"), f = el("form"), lab = el("label", "sr", "Command"), inp = el("input");
    inp.id = "termIn"; lab.htmlFor = "termIn"; inp.setAttribute("autocomplete", "off"); inp.setAttribute("inputmode", "text"); inp.placeholder = "1";
    f.appendChild(el("span", null, "&gt;")); f.appendChild(lab); f.appendChild(inp); w.appendChild(out); w.appendChild(f);
    w.appendChild(el("div", "kcue", '<span class="kbonly">Type a number. Press <kbd>⏎ Enter</kbd>.</span><span class="touchonly">Tap, type a number, press Go.</span>'));
    var hist = [];
    function show(k) { out.textContent += (out.textContent ? "\n\n" : "") + PAGES[k] + "\n\n[n], Back, Home, Quit: "; out.scrollTop = out.scrollHeight; }
    f.addEventListener("submit", function (e) { e.preventDefault(); var v = inp.value.trim().toLowerCase(); inp.value = ""; out.textContent += v; blip(660);
      if (PAGES[v]) { hist.push(v); show(v); } else if (v === "b" || v === "back") { hist.pop(); show(hist[hist.length - 1] || "home"); }
      else if (v === "h" || v === "home") { hist = []; show("home"); } else if (v === "q" || v === "quit") { out.textContent += "\n\nGoodbye. (Keep scrolling.)"; out.scrollTop = out.scrollHeight; }
      else { out.textContent += "\n?? Unknown command. Type a link number.\n[n], Back, Home, Quit: "; out.scrollTop = out.scrollHeight; } });
    show("home"); return w;
  },
  "w-modem": function () {
    var c = el("div", "card modem"); c.innerHTML = '<div class="bar"><span>Dial-Up Networking</span><span>28.8 kbps</span></div><div class="body"><div class="face" aria-hidden="true">' + "<i class='g'></i><i class='g'></i><i></i><i></i><i></i><i></i><i></i>" + '</div><div class="log" aria-live="polite">Ready. Click Connect.</div><div style="display:flex;gap:8px;justify-content:space-between;align-items:center"><button class="btn" type="button">Connect</button><small>Uses sound. Check the toggle bottom-right.</small></div></div>';
    var log = $(".log", c), btn = $("button", c), leds = c.querySelectorAll(".face i"), busy = false;
    btn.addEventListener("click", function () { if (busy) return; busy = true; btn.disabled = true; log.textContent = ""; leds.forEach(function (l) { l.classList.remove("on"); });
      modemSound(function (line, k) { log.textContent += line + "\n"; for (var i = 0; i < k && i < leds.length; i++) leds[i].classList.add("on");
        if (/^CONNECT/.test(line)) { busy = false; btn.disabled = false; btn.textContent = "Dial again"; log.textContent += "\nYou're online. Don't pick up the phone."; } }); });
    return c;
  },
  "w-slow": function () {
    var c = el("div", "card slow"); c.style.width = "min(100%, 440px)"; c.innerHTML = '<div class="bar"><span>sunset.jpg · 100 KB</span><span class="t">0.0 s</span></div><div class="body"><canvas width="160" height="100" aria-label="A pixel-art sunset loading line by line"></canvas><div class="meter"><b></b></div><div style="display:flex;justify-content:space-between;align-items:center;gap:8px"><small>Shown at 4× speed. Real time: 27.8 s.</small><button class="btn" type="button">Reload</button></div></div>';
    var cv = $("canvas", c), g = cv.getContext("2d"), bar = $(".meter b", c), tl = $(".t", c), raf = 0;
    var img = document.createElement("canvas"); img.width = 160; img.height = 100; var h = img.getContext("2d");
    var sky = h.createLinearGradient(0, 0, 0, 70); sky.addColorStop(0, "#2a1a6e"); sky.addColorStop(.6, "#ff5e7e"); sky.addColorStop(1, "#ffcf5a"); h.fillStyle = sky; h.fillRect(0, 0, 160, 70);
    h.fillStyle = "#ffef9a"; h.beginPath(); h.arc(80, 66, 18, 0, 7); h.fill(); h.fillStyle = "#1b1446"; h.beginPath(); h.moveTo(0, 70); for (var x = 0; x <= 160; x += 10) h.lineTo(x, 52 + Math.sin(x * .09) * 9 + (x % 30 ? 0 : -6)); h.lineTo(160, 70); h.fill();
    h.fillStyle = "#0e3a6e"; h.fillRect(0, 70, 160, 30); h.fillStyle = "#ffcf5a"; for (var y = 72; y < 100; y += 4) h.fillRect(80 - (y - 66) * .6, y, (y - 66) * 1.2, 1);
    function run() { cancelAnimationFrame(raf); g.fillStyle = "#c0c0c0"; g.fillRect(0, 0, 160, 100); var t0 = performance.now(), D = REDUCE ? 10 : 6950;
      (function step(now) { var k = Math.min(1, (now - t0) / D), rows = Math.floor(k * 100); g.drawImage(img, 0, 0, 160, rows, 0, 0, 160, rows); bar.style.width = (k * 100) + "%"; tl.textContent = (k * 27.8).toFixed(1) + " s"; if (k < 1) raf = requestAnimationFrame(step); })(t0); }
    $("button", c).addEventListener("click", run); c._show = run; return c;
  },
  "w-guest": function () {
    var c = el("div", "card gb"); c.style.width = "min(100%, 460px)";
    var visits = 4217 + (+(store("poweron.visits") || 0)); store("poweron.visits", String(visits - 4216));
    c.innerHTML = '<div class="bar"><span>~ My Guestbook ~</span><span class="newbadge">NEW!</span></div><div class="body"><div style="display:flex;align-items:center;gap:10px;justify-content:space-between;flex-wrap:wrap"><span>You are visitor</span><button type="button" class="counter" aria-label="Hit counter, click to add a visit"></button></div><div class="entries"></div><form><label class="sr" for="gbName">Name</label><input id="gbName" placeholder="Name" maxlength="40" required><label class="sr" for="gbFrom">Homepage</label><input id="gbFrom" placeholder="Homepage (optional)" maxlength="60"><label class="sr" for="gbMsg">Message</label><textarea id="gbMsg" placeholder="Kewl site!! Come visit mine" maxlength="140" required></textarea><button class="btn" type="submit" style="grid-column:1/-1">Sign guestbook</button></form></div>';
    var ctr = $(".counter", c), list = $(".entries", c);
    function drawCtr() { ctr.innerHTML = String(visits).padStart(6, "0").split("").map(function (d) { return "<i>" + d + "</i>"; }).join(""); }
    ctr.addEventListener("click", function () { visits++; drawCtr(); blip(1200); }); drawCtr();
    var seed = [{ n: "WebMasterDave (example)", f: "geocities-ish/~dave", m: "Awesome page!! Added u to my webring", d: "Sep 14 1997" }, { n: "xXSk8rGrrlXx (example)", f: "", m: "luv the midi music. sign mine back!!!", d: "Oct 2 1997" }], mine = [];
    try { mine = JSON.parse(store("poweron.guestbook") || "[]"); } catch (e) { mine = []; }
    function render() { list.innerHTML = mine.concat(seed).map(function (e) { return '<div class="e"><b>' + esc(e.n) + "</b> " + (e.f ? "<small>(" + esc(e.f) + ")</small>" : "") + "<br>" + esc(e.m) + " <small>· " + esc(e.d) + "</small></div>"; }).join(""); }
    $("form", c).addEventListener("submit", function (e) { e.preventDefault(); var n = $("#gbName", c).value.trim(), m = $("#gbMsg", c).value.trim(); if (!n || !m) return;
      mine.unshift({ n: n, f: $("#gbFrom", c).value.trim(), m: m, d: new Date().toDateString().slice(4) }); mine = mine.slice(0, 12); store("poweron.guestbook", JSON.stringify(mine)); e.target.reset(); render(); blip(990); });
    render(); return c;
  },
  "w-map": function () {
    var c = el("div", "card map"); c.innerHTML = '<div class="bar"><span>Maps <sup>beta</sup></span><span>Drag to pan</span></div><div class="tiles" role="img" aria-label="A draggable map of a made-up world"><div class="pin"></div></div>';
    var tiles = $(".tiles", c), cv = document.createElement("canvas"), W = 1200, H = 420; cv.width = W; cv.height = H; var g = cv.getContext("2d");
    g.fillStyle = "#a9d3f5"; g.fillRect(0, 0, W, H);
    function land(x, y) { return Math.sin(x * .011) * Math.cos(y * .017) + Math.sin(x * .023 + 1.3) * .6 + Math.cos(y * .009 + x * .004) * .7 + Math.sin((x + y) * .031) * .25; }
    for (var y = 0; y < H; y += 4) for (var x = 0; x < W; x += 4) { var v = land(x, y); if (v > .55) { g.fillStyle = v > 1.4 ? "#c9b98a" : v > 1.0 ? "#9cc47a" : "#b8d99a"; g.fillRect(x, y, 4, 4); } }
    g.strokeStyle = "rgba(255,255,255,.55)"; g.lineWidth = 1; for (var t = 0; t <= W; t += 150) { g.beginPath(); g.moveTo(t, 0); g.lineTo(t, H); g.stroke(); } for (t = 0; t <= H; t += 150) { g.beginPath(); g.moveTo(0, t); g.lineTo(W, t); g.stroke(); }
    g.strokeStyle = "#f2b84b"; g.lineWidth = 3; g.beginPath(); g.moveTo(80, 300); g.bezierCurveTo(300, 120, 600, 380, 1100, 160); g.stroke();
    tiles.style.backgroundImage = "url(" + cv.toDataURL() + ")"; var ox = -200, oy = -60, drag = null;
    function put() { oy = clamp(oy, -(H - tiles.clientHeight), 0); tiles.style.backgroundPosition = ox + "px " + oy + "px"; } put();
    tiles.addEventListener("pointerdown", function (e) { drag = { x: e.clientX, y: e.clientY, ox: ox, oy: oy }; tiles.setPointerCapture(e.pointerId); });
    tiles.addEventListener("pointermove", function (e) { if (!drag) return; ox = drag.ox + e.clientX - drag.x; oy = drag.oy + e.clientY - drag.y; put(); });
    tiles.addEventListener("pointerup", function () { drag = null; }); tiles.addEventListener("pointercancel", function () { drag = null; });
    return c;
  },
  "w-vote": function () {
    var c = el("div", "card vote"); c.style.width = "min(100%, 480px)";
    var items = [{ t: "Ajax: a new approach to web applications", s: "essay · 2005", v: 412 }, { t: "Ask Bumpr: I built a to-do app in a weekend with Rails", s: "rubyonrails · 2005", v: 377 },
      { t: "Ten reasons your site needs rounded corners", s: "design · 2006", v: 288 }, { t: "Why every startup needs a beta badge", s: "business · 2006", v: 141 }];
    c.innerHTML = '<div class="bar"><span>Bumpr <sup>beta</sup> · Top stories</span><span>$.ajax(…)</span></div><div class="body"><ol></ol><small style="color:var(--muted)">Each vote is an XMLHttpRequest. The page never reloads.</small></div>';
    var ol = $("ol", c);
    function render(hit) { items.sort(function (a, b) { return b.v - a.v; }); ol.innerHTML = items.map(function (it, i) { return '<li' + (it === hit ? ' class="hit"' : "") + '><div class="v"><button type="button" data-i="' + i + '" aria-label="Vote for ' + esc(it.t) + '">▲ bump</button>' + it.v + '</div><div class="t">' + esc(it.t) + "<small>" + esc(it.s) + "</small></div></li>"; }).join(""); }
    ol.addEventListener("click", function (e) { var b = e.target.closest("button"); if (!b) return; var it = items[+b.dataset.i]; it.v += 25 + Math.floor(Math.random() * 60); blip(1320); render(it); });
    render(); return c;
  },
  "w-npm": function () {
    var c = el("div", "card npm"); c.style.width = "min(100%, 500px)"; c.innerHTML = '<div class="bar"><span>Terminal · ~/my-app</span><button class="btn" type="button" style="padding:2px 10px;font-size:.75rem;color:#fff;border-color:#fff">Run again</button></div><div class="out" aria-live="off"></div>';
    var out = $(".out", c), timers = [];
    var pk = ["is-odd", "is-even", "is-number", "left-pad", "kind-of", "isarray", "inherits", "ms", "debug", "once", "wrappy", "minimist", "mkdirp", "glob", "rimraf", "semver", "chalk", "lodash.merge", "core-util-is", "string_decoder"];
    function run() { timers.forEach(clearTimeout); timers = []; out.innerHTML = "$ npm install\n"; var n = 0, sp = REDUCE ? 1 : 80;
      pk.forEach(function (p, i) { timers.push(setTimeout(function () { n += 37 + i * 13; out.innerHTML += "+ " + p + "@" + (1 + i % 4) + "." + (i % 9) + "." + i + "\n"; out.scrollTop = 1e6; }, i * sp)); });
      timers.push(setTimeout(function () { out.innerHTML += '<span class="ok">added 1,342 packages from 742 contributors in 41.8s</span>\n\n# 22 March 2016. left-pad is unpublished.\n$ npm install\n'; out.scrollTop = 1e6; }, pk.length * sp + 300));
      timers.push(setTimeout(function () { out.innerHTML += '<span class="err">npm ERR! 404 \'left-pad\' is not in the npm registry.\nnpm ERR! Build failed. So did thousands of others.</span>\n'; out.scrollTop = 1e6; }, pk.length * sp + (REDUCE ? 400 : 1600))); }
    $("button", c).addEventListener("click", run); c._show = run; return c;
  },
  "w-blank": function () {
    var c = el("div", "card mini"); c.innerHTML = '<div class="bar"><span>https://myapp.io/#!/dashboard</span><button class="btn" type="button" style="padding:2px 10px;font-size:.72rem;color:#ecf0f1;border-color:#ecf0f1">Reload</button></div><div class="view"></div><div class="src">&lt;body&gt;\n  &lt;div id="root"&gt;&lt;/div&gt;   &lt;!-- that is it --&gt;\n  &lt;script src="bundle.js"&gt;&lt;/script&gt;   &lt;!-- 1.4 MB --&gt;\n&lt;/body&gt;</div>';
    var v = $(".view", c), t = [];
    function run() { t.forEach(clearTimeout); v.innerHTML = '<small style="color:#bdc3c7">(blank page)</small>';
      t = [setTimeout(function () { v.innerHTML = '<div style="display:grid;justify-items:center;gap:10px"><div class="spin"></div><small style="color:#7f8c8d">Downloading bundle.js… parsing… executing…</small></div>'; }, REDUCE ? 0 : 700),
        setTimeout(function () { v.innerHTML = '<div class="tiles4">' + ["#e74c3c", "#3498db", "#1abc9c", "#f1c40f", "#9b59b6", "#e67e22"].map(function (col, i) { return '<i style="background:' + col + '">' + ["Inbox", "Stats", "Team", "Files", "Chat", "Tasks"][i] + "</i>"; }).join("") + "</div>"; }, REDUCE ? 50 : 2600)]; }
    $("button", c).addEventListener("click", run); c._show = run; return c;
  },
  "w-feed": function () {
    var c = el("div", "card feed"); c.style.width = "min(100%, 440px)"; c.innerHTML = '<div class="bar"><span><i style="display:inline-block;width:14px;height:2px;background:currentColor;box-shadow:0 -5px 0 currentColor,0 5px 0 currentColor;vertical-align:middle;margin-right:8px"></i>Feed</span><span class="n">0 posts</span></div><div class="list"></div>';
    var list = $(".list", c), n = 0, cols = ["#e74c3c", "#3498db", "#1abc9c", "#f1c40f", "#9b59b6", "#e67e22"],
      txt = ["Just deployed with git push. So easy.", "Is jQuery dead yet?", "My new app is mobile-first and responsive!", "Flat design > skeuomorphism. Fight me.", "Rewrote it in Angular. Now rewriting it in React.", "Our startup is Uber for parking spaces.", "Hamburger menus everywhere.", "Who else is learning Node this weekend?"];
    function more(k) { for (var i = 0; i < k && n < 80; i++, n++) { var p = el("div", "post"); p.innerHTML = '<span class="av" style="background:' + cols[n % 6] + '"></span><span>' + txt[n % txt.length] + '</span><button class="like" type="button" aria-pressed="false">♥ <span>' + (n * 7 % 23) + "</span></button>"; list.appendChild(p); }
      $(".n", c).textContent = n + (n >= 80 ? " posts · you reached the end (for once)" : " posts"); }
    list.addEventListener("scroll", function () { if (list.scrollTop + list.clientHeight > list.scrollHeight - 40) more(5); });
    list.addEventListener("click", function (e) { var b = e.target.closest(".like"); if (!b) return; var on = b.classList.toggle("on"); b.setAttribute("aria-pressed", on); var s = $("span", b); s.textContent = +s.textContent + (on ? 1 : -1); blip(1500); });
    more(8); return c;
  },
  "w-pend": function () {
    var c = el("div", "card pend"); c.style.width = "min(100%, 560px)";
    var marks = [[-30, "1991", "static files"], [-24, "1995", "CGI · PHP"], [-6, "2005", "Ajax"], [26, "2013", "SPAs"], [-14, "2016", "SSR"], [-26, "2023", "server components"]];
    var svg = '<svg viewBox="0 0 600 330" role="img" aria-label="A pendulum swinging between server rendering on the left and browser rendering on the right, with eras marked: static files 1991, CGI 1995, Ajax 2005, single-page apps 2013, server rendering 2016, server components 2023.">' +
      '<path d="M120 268 A260 260 0 0 0 480 268" fill="none" stroke="currentColor" stroke-opacity=".2" stroke-width="2"/>' +
      '<text x="40" y="318" fill="currentColor" font-size="15" font-family="Geist Mono,monospace">◀ SERVER renders</text><text x="560" y="318" text-anchor="end" fill="currentColor" font-size="15" font-family="Geist Mono,monospace">BROWSER renders ▶</text>' +
      marks.map(function (m) { var a = m[0] * Math.PI / 180, x = 300 + Math.sin(a) * 262, y = 30 + Math.cos(a) * 262; return '<circle cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="4" fill="#ff9a4d"/><text x="' + x.toFixed(1) + '" y="' + (y + 22).toFixed(1) + '" text-anchor="middle" fill="currentColor" font-size="11" font-family="Geist,sans-serif" opacity=".8">' + m[1] + " · " + m[2] + "</text>"; }).join("") +
      '<g class="arm"><line x1="300" y1="30" x2="300" y2="262" stroke="currentColor" stroke-width="2"/><circle cx="300" cy="262" r="20" fill="#ff9a4d"/></g><circle cx="300" cy="30" r="6" fill="currentColor"/></svg>';
    c.innerHTML = '<div class="bar"><span>where_does_html_get_made.svg</span><span>1991 → now</span></div><div class="body" style="color:var(--fg)">' + svg + "</div>"; return c;
  },
  "w-stream": function () {
    var c = el("div", "card stream"); c.style.width = "min(100%, 480px)"; c.innerHTML = '<div class="bar"><span>GET /dashboard · streaming</span><span class="clock">0 ms</span></div><div class="view"></div><div style="padding:0 14px 14px;display:flex;justify-content:space-between;align-items:center;gap:8px"><small style="color:var(--muted)">Timings are illustrative.</small><button class="btn" type="button">Request page</button></div>';
    var v = $(".view", c), clk = $(".clock", c), t = [], raf = 0;
    function run() { t.forEach(clearTimeout); cancelAnimationFrame(raf); v.innerHTML = ""; var t0 = performance.now(), k = REDUCE ? .02 : 1;
      (function tickc(now) { var ms = now - t0; clk.textContent = Math.round(ms / k) + " ms"; if (ms < 1650 * k) raf = requestAnimationFrame(tickc); })(t0);
      t = [setTimeout(function () { v.innerHTML = '<div class="chunk"><b>Dashboard</b> <small style="color:var(--muted)">shell · 40 ms</small></div><div class="sk"></div><div class="sk" style="width:80%"></div><div class="sk" style="width:60%"></div>'; }, 40 * k),
        setTimeout(function () { var s = v.querySelectorAll(".sk"); if (s[0]) s[0].outerHTML = '<div class="chunk">Revenue this week: $12,480 <small style="color:var(--muted)">· 620 ms</small></div>'; }, 620 * k),
        setTimeout(function () { var s = v.querySelectorAll(".sk"); if (s[0]) s[0].outerHTML = '<div class="chunk">3 deploys today, all green <small style="color:var(--muted)">· 900 ms</small></div>'; }, 900 * k),
        setTimeout(function () { var s = v.querySelectorAll(".sk"); if (s[0]) s[0].outerHTML = '<div class="chunk">Recommendations (slow query) <small style="color:var(--muted)">· 1,500 ms</small></div>'; }, 1500 * k)]; }
    $("button", c).addEventListener("click", run); c._show = run; return c;
  },
  "w-deploy": function () {
    var c = el("div", "card deploy"); c.style.width = "min(100%, 500px)";
    var cities = ["Sydney", "Tokyo", "Singapore", "Mumbai", "Dubai", "Frankfurt", "London", "Paris", "Stockholm", "São Paulo", "Virginia", "Ohio", "Montréal", "San Francisco", "Portland", "Seoul", "Hong Kong", "Cape Town"];
    c.innerHTML = '<div class="bar"><span>~/my-app (main)</span><span>edge deploy</span></div><div class="out" aria-live="polite">$ _</div><div class="cities">' + cities.map(function (x) { return "<span>" + x + "</span>"; }).join("") + '</div><div style="padding:0 14px 14px;display:flex;justify-content:flex-end"><button class="btn" type="button">git push</button></div>';
    var out = $(".out", c), btn = $("button", c), spans = c.querySelectorAll(".cities span"), t = [];
    btn.addEventListener("click", function () { t.forEach(clearTimeout); spans.forEach(function (s) { s.classList.remove("on"); }); var k = REDUCE ? .05 : 1;
      var lines = [[0, "$ git push origin main"], [350, "Enumerating objects: 12, done."], [700, "→ Build queued"], [1300, "→ Compiling… 41 routes"], [2300, "→ Generating static pages (18/18)"], [3000, "→ Deploying to the edge…"]];
      out.textContent = ""; lines.forEach(function (l) { t.push(setTimeout(function () { out.textContent += l[1] + "\n"; out.scrollTop = 1e6; blip(520 + l[0] / 10); }, l[0] * k)); });
      spans.forEach(function (s, i) { t.push(setTimeout(function () { s.classList.add("on"); }, (3100 + i * 110) * k)); });
      t.push(setTimeout(function () { out.innerHTML += "<b>✓ Ready. Live in " + spans.length + " regions in 41s.</b>\nhttps://my-app-git-main.example.app"; out.scrollTop = 1e6; blip(1760); }, (3200 + spans.length * 110) * k)); });
    return c;
  }
};
