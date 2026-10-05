// ================= v3: TRUE STORIES + extra props =================
function stamp() { return '<span class="story-stamp">True story</span>'; }
STATIC["ph-wars"] = function () {
  var c = el("div", "card wars"); c.style.width = "min(100%, 500px)";
  c.innerHTML = '<div class="bar"><span>Best viewed in…</span><span>1996</span></div><div class="body"><div class="wars-grid">' +
    '<div><b>Netscape Navigator</b><code>&lt;blink&gt;</code><p class="blinky">I blink. Forever.</p></div>' +
    '<div><b>Internet Explorer</b><code>&lt;marquee&gt;</code><p class="marq"><span>I scroll. Forever.</span></p></div></div>' +
    '<small>Each browser had its own tags. Pages picked a side.</small></div>';
  return c;
};
STATIC["ph-flat"] = function () {
  var c = el("div", "card flatdemo"); c.style.width = "min(100%, 500px)";
  c.innerHTML = '<div class="bar"><span>2007 → 2013</span><span>flat design</span></div><div class="body"><div class="fd-row"><button type="button" class="fd-gloss" tabindex="-1">Sign up</button><span aria-hidden="true">→</span><button type="button" class="fd-flat" tabindex="-1">Sign up</button></div>' +
    '<div class="fd-devices" aria-label="One responsive layout reflowing from phone to tablet to desktop"><div class="d d1"><i></i><i></i><i></i></div><div class="d d2"><i></i><i></i><i></i></div><div class="d d3"><i></i><i></i><i></i></div></div><small>One layout: three columns on desktop, one on a phone.</small></div>';
  return c;
};
STATIC["ph-jam"] = function () {
  var c = el("div", "card"); c.style.width = "min(100%, 500px)";
  c.innerHTML = '<div class="bar"><span>build once, serve everywhere</span><span>2015+</span></div><div class="body"><div class="flow"><span>git push</span><i>→</i><span>build</span><i>→</i><span>HTML files</span><i>→</i><span>CDN</span><i>→</i><span>reader</span></div><small>Built at deploy time. Dynamic bits call an API.</small></div>';
  return c;
};
STATIC["ph-stack"] = function () {
  var c = el("div", "card"); c.style.width = "min(100%, 460px)";
  c.innerHTML = '<div class="bar"><span>~/my-app</span><span>one monorepo</span></div><div class="body tree">' +
    ["my-app/", "├─ apps/web/        React + TypeScript, server components", "├─ apps/api/        TypeScript on Node.js", "├─ packages/ui/     shared components, built with Vite", "├─ tsconfig.json", "└─ one git push deploys all of it"].map(function (l) { return "<div>" + esc(l) + "</div>"; }).join("") + "</div>";
  return c;
};

WIDGETS["w-sticker"] = function () {
  var c = el("div", "sticker"); c.innerHTML = '<div class="cubeface"><div class="under">The cube, sticker and all,<br>is still kept at CERN.</div><button type="button" class="note3d peel" aria-pressed="false" aria-label="Peel the sticker">This machine is a server.<br>DO NOT POWER IT DOWN!!</button></div><div class="story-cap">' + stamp() + ' Tap the sticker to peel it.</div>';
  var n = $(".peel", c); n.addEventListener("click", function () { var on = n.classList.toggle("off"); n.setAttribute("aria-pressed", on); blip(on ? 300 : 500); });
  return c;
};
WIDGETS["w-coffee"] = function () {
  var c = el("div", "card coffee"); c.style.width = "min(100%, 400px)";
  c.innerHTML = '<div class="bar"><span>XCoffee · Trojan Room</span><span class="ts">--:--:--</span></div><div class="body"><canvas width="128" height="128" aria-label="A grainy greyscale camera image of a glass coffee pot on a hotplate"></canvas>' +
    '<div style="display:flex;justify-content:space-between;align-items:center;gap:8px"><span class="lvl">Pot: checking…</span><button class="btn" type="button">Refresh image</button></div><div class="story-cap">' + stamp() + ' Grey stills, about 3 a minute (sped up). Pot sold in 2001 for £3,350.</div></div>';
  var cv = $("canvas", c), g = cv.getContext("2d"), level = .7, timer = 0;
  function frame() {
    level = Math.random() < .25 ? 0 : clamp(level + (Math.random() - .6) * .35, .05, .95);
    var img = g.createImageData(128, 128), d = img.data;
    for (var y = 0; y < 128; y++) for (var x = 0; x < 128; x++) {
      var v = 70 + y * .35;                                                     // wall
      if (y > 100) v = 45;                                                      // counter
      if (y > 92 && y < 102 && x > 30 && x < 98) v = 25;                        // hotplate
      var cx = 64, top = 34, bot = 94, half = 18 + (y - top) * .28;             // jug outline
      if (y >= top && y <= bot && Math.abs(x - cx) < half) { v = 150; var lvlY = bot - (bot - top) * level; if (y > lvlY) v = 30; if (Math.abs(Math.abs(x - cx) - half) < 1.5) v = 210; }
      if (y > 24 && y < 34 && Math.abs(x - cx) < 14) v = 60;                    // lid
      if (x > 84 + (y - 40) * .05 && x < 92 && y > 44 && y < 80 && (x < 86 || y < 47 || y > 77)) v = 55; // handle
      v += (Math.random() - .5) * 46; var i = (y * 128 + x) * 4; d[i] = d[i + 1] = d[i + 2] = clamp(v, 0, 255); d[i + 3] = 255;
    }
    g.putImageData(img, 0, 0);
    $(".ts", c).textContent = new Date().toTimeString().slice(0, 8);
    $(".lvl", c).textContent = level === 0 ? "Pot: EMPTY. Don't bother." : level < .3 ? "Pot: nearly empty. Run." : "Pot: " + Math.round(level * 100) + "% full. Worth the walk.";
  }
  $("button", c).addEventListener("click", function () { frame(); blip(740); });
  c._show = function () { frame(); clearInterval(timer); if (!REDUCE) timer = setInterval(function () { if (curProp === "w-coffee") frame(); else clearInterval(timer); }, 3500); };
  return c;
};
WIDGETS["w-tenday"] = function () {
  var c = el("div", "card tenday"); c.style.width = "min(100%, 470px)";
  c.innerHTML = '<div class="bar"><span>May 1995 · Mountain View</span><span class="dn">Day 0</span></div><div class="body"><div class="days">' +
    Array.apply(null, Array(10)).map(function (_, i) { return "<i>" + (i + 1) + "</i>"; }).join("") + '</div><p class="msg">A new language, from nothing.</p>' +
    '<div class="names"><span data-k="0">Mocha<small>May 1995</small></span><span data-k="1">LiveScript<small>Sep 1995</small></span><span data-k="2">JavaScript<small>Dec 1995</small></span></div>' +
    '<div style="display:flex;justify-content:space-between;align-items:center;gap:8px"><span class="story-cap">' + stamp() + "</span><button class=\"btn\" type=\"button\">Replay</button></div></div>";
  var days = c.querySelectorAll(".days i"), names = c.querySelectorAll(".names span"), t = [];
  function run() { t.forEach(clearTimeout); t = []; days.forEach(function (d) { d.classList.remove("on"); }); names.forEach(function (n) { n.classList.remove("on"); }); $(".msg", c).textContent = "A new language, from nothing.";
    var sp = REDUCE ? 0 : 330;
    days.forEach(function (d, i) { t.push(setTimeout(function () { d.classList.add("on"); $(".dn", c).textContent = "Day " + (i + 1); blip(600 + i * 40); }, i * sp)); });
    t.push(setTimeout(function () { $(".msg", c).textContent = "Day 10: the prototype runs in the browser."; }, 10 * sp));
    names.forEach(function (n, i) { t.push(setTimeout(function () { n.classList.add("on"); }, 10 * sp + 500 * (i + 1) * (sp ? 1 : 0))); }); }
  $("button", c).addEventListener("click", run); c._show = run; return c;
};
WIDGETS["w-gmail"] = function () {
  var c = el("div", "card gmail"); c.style.width = "min(100%, 480px)";
  c.innerHTML = '<div class="bar"><span>Webmail <sup>beta</sup> · Invite only</span><span>1 April 2004</span></div><div class="body"><div class="meters">' +
    '<div><span>A typical rival</span><b style="--w:.4%"></b><em>2–4 MB</em></div><div class="big"><span>Gmail</span><b class="grow"></b><em class="mb">0 MB</em></div></div>' +
    '<div class="joke"><span>Launched on April Fools\' Day. Hmm.</span><button class="btn" type="button">Is it a joke?</button></div><p class="ans" aria-live="polite"></p><div class="story-cap">' + stamp() + "</div></div>";
  var grow = $(".grow", c), mb = $(".mb", c), raf = 0;
  function run() { cancelAnimationFrame(raf); var t0 = performance.now(), D = REDUCE ? 1 : 2400; $(".ans", c).textContent = "";
    (function step(now) { var k = Math.min(1, (now - t0) / D), e = 1 - Math.pow(1 - k, 3), v = Math.round(e * 1000); grow.style.width = (e * 100) + "%"; mb.textContent = v.toLocaleString("en") + " MB"; if (k < 1) raf = requestAnimationFrame(step); })(t0); }
  $(".joke button", c).addEventListener("click", function () { $(".ans", c).textContent = "Real. 1 GB, searchable, no page reloads."; blip(1100); });
  glossifyEl($(".ans", c).parentNode.querySelector(".joke span"));
  c._show = run; return c;
};
WIDGETS["w-jsx"] = function () {
  var c = el("div", "card jsx"); c.style.width = "min(100%, 480px)";
  c.innerHTML = '<div class="bar"><span>CommentBox.js · JSConf US 2013</span><span>JSX</span></div><div class="body"><pre>' + esc('var CommentBox = React.createClass({\n  render: function() {\n    return (\n      <div className="commentBox">\n        Hello, world! I am a CommentBox.\n      </div>\n    );\n  }\n});') + '</pre><div class="bubbles" aria-live="polite"></div><div style="display:flex;justify-content:space-between;align-items:center;gap:8px"><span class="story-cap">' + stamp() + ' Reactions paraphrased.</span><button class="btn" type="button">Hear the room</button></div></div>';
  var lines = ["HTML in my JavaScript?!", "This breaks separation of concerns.", "We left inline templates behind years ago.", "Re-render everything on every change? That can't be fast.", "…wait, the virtual DOM diff is actually fast.", "By 2015 it was everywhere."], t = [];
  $("button", c).addEventListener("click", function () { t.forEach(clearTimeout); var b = $(".bubbles", c); b.innerHTML = "";
    lines.forEach(function (l, i) { t.push(setTimeout(function () { var s = el("span", i >= 4 ? "pos" : "", esc(l)); b.appendChild(s); blip(i >= 4 ? 1200 : 420); }, (REDUCE ? 0 : 520) * i)); }); });
  return c;
};
WIDGETS["w-outage"] = function () {
  var c = el("div", "card outage"); c.style.width = "min(100%, 500px)";
  var sites = ["photos", "shop", "chat", "news", "docs", "music", "tasks", "video", "maps", "games", "blog", "status"];
  c.innerHTML = '<div class="bar"><span>ops@us-east-1 · 09:37 PST</span><span>28 Feb 2017</span></div><div class="out"></div><div class="sites">' + sites.map(function (s) { return '<span data-s="' + s + '">' + s + "</span>"; }).join("") +
    '</div><div style="display:flex;justify-content:space-between;align-items:center;gap:8px;padding:0 14px 14px"><span class="story-cap">' + stamp() + ' Command is illustrative.</span><button class="btn" type="button">Run command</button></div>';
  var out = $(".out", c), btn = $("button", c), tiles = c.querySelectorAll(".sites span"), t = [], down = false;
  function reset() { t.forEach(clearTimeout); t = []; tiles.forEach(function (s) { s.className = ""; }); out.innerHTML = '$ <span class="cmd"></span>'; btn.textContent = "Run command"; down = false; }
  btn.addEventListener("click", function () {
    if (down) { reset(); return; } reset(); var cmd = "remove-capacity --subsystem s3-billing --servers ", typo = "a much bigger set", k = REDUCE ? 0 : 1, sp = $(".cmd", c);
    for (var i = 0; i <= cmd.length; i++) (function (i) { t.push(setTimeout(function () { sp.textContent = cmd.slice(0, i); }, i * 28 * k)); })(i);
    t.push(setTimeout(function () { sp.innerHTML = esc(cmd) + '<mark>' + typo + "</mark>"; out.innerHTML += "\n<b>removing capacity…</b> index and placement subsystems going down"; blip(220); }, (cmd.length * 28 + 300) * k));
    tiles.forEach(function (s, i) { t.push(setTimeout(function () { s.className = s.dataset.s === "status" ? "lie" : "dead"; blip(160 + i * 10); }, (cmd.length * 28 + 900 + i * 170) * k)); });
    t.push(setTimeout(function () { out.innerHTML += '\n<i>…the status page still says everything is fine.</i>\n<b class="ok">~4 hours later: restarted, all green.</b>'; btn.textContent = "Restore"; down = true; }, (cmd.length * 28 + 900 + tiles.length * 170 + 300) * k));
  });
  c._show = reset; return c;
};
