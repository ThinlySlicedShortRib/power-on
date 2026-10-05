  /* ---------- scroll-driven dive ----------
     Page scroll (0..1) is remapped onto the timeline (0..1) with "holds": around each beat the timeline
     moves slowly, so captions, code layers and tunnel panels stay readable for a comfortable distance. */
  var track = $("#track"), progEl = $("#prog"), fillEl = $(".fill", progEl), cueEl = $("#cue");
  var HOLDS = [.06, .12, .2, .253, .314, .375, .436, .496, .57, .614, .676, .737, .799, .861, 1];   // hook ×2, zoom, 5 code layers, wire, 5 tunnel eras, desk
  var HOLD_W = .75, HOLD_HALF = .007, TRAVEL = 7.5;     // screens per hold, half-width in p, screens per unit of p
  var SEGS = [], TOTAL = 0;
  (function build() {
    var p = 0;
    HOLDS.forEach(function (h) {
      var a = h === 1 ? 1 : h - HOLD_HALF, b = h === 1 ? 1 : h + HOLD_HALF;
      SEGS.push({ s: TOTAL, len: (a - p) * TRAVEL, p0: p, p1: a }); TOTAL += (a - p) * TRAVEL;
      SEGS.push({ s: TOTAL, len: h === 1 ? .6 : HOLD_W, p0: a, p1: b, hold: h }); TOTAL += h === 1 ? .6 : HOLD_W;
      p = b;
    });
  })();
  function toP(screens) {
    for (var i = 0; i < SEGS.length; i++) { var g = SEGS[i]; if (screens <= g.s + g.len) return lerp(g.p0, g.p1, g.len ? clamp((screens - g.s) / g.len, 0, 1) : 1); }
    return 1;
  }
  var holdAt = SEGS.filter(function (g) { return g.hold; }).map(function (g) { return g.s + g.len / 2; });   // in screens
  holdAt[holdAt.length - 1] = TOTAL;
  progEl.insertAdjacentHTML("beforeend", holdAt.map(function (sc) { return '<i class="tk" style="left:' + (sc / TOTAL * 100) + '%"></i>'; }).join(""));
  var ticks = [].slice.call(progEl.querySelectorAll(".tk"));

  function sizeTrack() { track.style.height = Math.round((TOTAL + 1) * innerHeight) + "px"; }
  function screensNow() { return scrollY / innerHeight; }
  function scrollToScreens(sc, smooth) { scrollTo({ top: Math.round(sc * innerHeight), behavior: smooth && !REDUCE ? "smooth" : "auto" }); }

  /* lock the target like button when the dive starts; release it back at the top */
  var lock = null;
  function inViewport(btn) {
    var vr = view.getBoundingClientRect(), r = btn.getBoundingClientRect();
    return btn.getClientRects().length && r.top >= vr.top + 8 && r.bottom <= vr.bottom - 8;
  }
  function lockTarget() {
    lock = { tab: A.tab, chat: A.chat, scroll: view.scrollTop };
    var sel = function (id) { return view.querySelector('.post[data-id="' + id + '"] .like'); };
    var btn = A.lastLike ? sel(A.lastLike) : null;
    if (!btn || !inViewport(btn)) {
      var vis = [].filter.call(view.querySelectorAll(".post .like"), inViewport);
      btn = btn && btn.getClientRects().length ? btn : vis[0] || null;
    }
    if (!btn) { goTab("home"); btn = (A.lastLike && sel(A.lastLike)) || sel("p1") || view.querySelector(".post .like"); }
    if (!inViewport(btn)) {
      var post = btn.closest(".post"), vr = view.getBoundingClientRect(), pr = post.getBoundingClientRect();
      view.scrollTop += pr.top - vr.top - Math.max(0, (view.clientHeight - pr.height) / 2);
    }
    hero = btn; browser._ox = 0;
    closeStory(); var em = $("#emo"); if (em) em.hidden = true;
    if (document.activeElement && appw.contains(document.activeElement)) document.activeElement.blur();
  }
  function releaseTarget() {
    if (hero) hero.classList.remove("aim");
    browser.style.transform = ""; browser._ox = 0;
    if (lock) {
      if (lock.tab !== A.tab || lock.chat !== A.chat) { A.scroll[A.tab] = view.scrollTop; A.tab = lock.tab; A.chat = lock.chat; renderView(); }
      view.scrollTop = lock.scroll;
    }
    lock = null;
  }

  var lastS = -1;
  function frame() {
    var sc = clamp(screensNow(), 0, TOTAL), s = sc / TOTAL;
    var diving = sc > .004;
    if (diving && mode === "play") { mode = "dive"; lockTarget(); document.documentElement.classList.remove("play"); document.body.classList.add("diving"); }
    else if (!diving && mode === "dive") { mode = "play"; render(0); releaseTarget(); document.documentElement.classList.add("play"); document.body.classList.remove("diving"); }
    render(toP(sc));
    fillEl.style.width = (s * 100) + "%";
    ticks.forEach(function (t, i) { t.classList.toggle("done", sc >= holdAt[i] - .05); });
    hint.style.opacity = sc > .004 && sc < 1.2 ? 1 : 0;
    lastS = s;
  }
  var raf = 0;
  function onScroll() { if (!raf) raf = requestAnimationFrame(function () { raf = 0; frame(); }); }
  addEventListener("scroll", onScroll, { passive: true });
  var lastMax = 0;
  addEventListener("resize", function () {
    var frac = lastMax > 0 ? scrollY / lastMax : 0;
    sizeTrack(); lastMax = track.offsetHeight - innerHeight;
    scrollTo(0, Math.round(frac * lastMax)); browser._ox = 0; onScroll();
  });

  /* step between beats (keyboard, Show me) */
  function stepBeat(dir) {
    var sc = screensNow(), target;
    if (dir > 0) { target = TOTAL; for (var i = 0; i < holdAt.length; i++) if (holdAt[i] > sc + .05) { target = holdAt[i]; break; } }
    else { target = 0; for (var j = holdAt.length - 1; j >= 0; j--) if (holdAt[j] < sc - .05) { target = holdAt[j]; break; } }
    scrollToScreens(target, true);
  }

  /* optional hands-free play: glides through the whole track */
  var auto = 0;
  function play() {
    ensureAC();
    if (auto) { stop(); return; }
    var startSc = screensNow() >= TOTAL - .01 ? 0 : screensNow();
    if (startSc === 0) scrollTo(0, 0);
    var t0 = performance.now(), dur = (TOTAL - startSc) * (REDUCE ? 700 : 1700);
    $("#autoplay").textContent = "❚❚ Pause"; $("#autoplay").setAttribute("aria-pressed", "true");
    auto = 1;
    (function step(now) {
      var t = clamp((now - t0) / dur, 0, 1);
      scrollTo(0, Math.round(lerp(startSc, TOTAL, t) * innerHeight));
      if (t < 1 && auto) auto = requestAnimationFrame(step); else if (auto) stop();
    })(t0);
  }
  function stop() { if (auto && auto !== 1) cancelAnimationFrame(auto); auto = 0; $("#autoplay").textContent = "▶ Play"; $("#autoplay").setAttribute("aria-pressed", "false"); }
  addEventListener("wheel", function () { if (auto) stop(); }, { passive: true });
  addEventListener("touchstart", function () { if (auto) stop(); }, { passive: true });
  $("#autoplay").addEventListener("click", play);

  addEventListener("keydown", function (e) {
    if (SV) {   // story viewer owns the keys while open
      if (e.key === "Escape") { closeStory(); e.preventDefault(); }
      else if (e.key === "ArrowRight") { storyStep(1); e.preventDefault(); }
      else if (e.key === "ArrowLeft") { storyStep(-1); e.preventDefault(); }
      return;
    }
    if (e.key === "Escape") { var em = $("#emo"); if (em && !em.hidden) { em.hidden = true; return; } }
    var t = e.target;
    if (t.closest && (t.closest("#appw") || t.closest("input, textarea, select, [contenteditable]"))) return;   // keys inside the app stay in the app
    var fwd = (e.key === " " && !e.shiftKey) || e.key === "PageDown" || e.key === "ArrowDown";
    var back = (e.key === " " && e.shiftKey) || e.key === "PageUp" || e.key === "ArrowUp";
    if (t.closest && t.closest("a, button") && (e.key === " " || e.key === "Enter")) return;
    if (fwd || back) { e.preventDefault(); if (auto) stop(); stepBeat(fwd ? 1 : -1); }
    else if (e.key === "Home") { e.preventDefault(); scrollToScreens(0, true); }
    else if (e.key === "End") { e.preventDefault(); scrollToScreens(TOTAL, true); }
  });
  $("#show").addEventListener("click", function () { ensureAC(); scrollToScreens(holdAt[0], true); });
  $("#replay").addEventListener("click", function () { stop(); scrollToScreens(0, true); });

  if (matchMedia("(hover: none)").matches) { hint.innerHTML = "<span>Swipe outside the app to move</span>"; $(".kb").hidden = true; }
  hero = view.querySelector('.post[data-id="p1"] .like') || view.querySelector(".post .like");
  window.__dive = { holdAt: holdAt, total: TOTAL };   // read-only hook for tests
  document.documentElement.classList.add("play");
  sizeTrack(); lastMax = track.offsetHeight - innerHeight;
  if (screensNow() > .004) frame(); else render(0);
