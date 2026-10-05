// ================= v11: KEY CUES + SHORTCUTS PANEL =================
var TOUCH = !!(window.matchMedia && matchMedia("(hover: none) and (pointer: coarse)").matches);
document.documentElement.classList.toggle("touch", TOUCH);
function kb(k, label) { return '<kbd data-k="' + k + '">' + label + "</kbd>"; }
function advHTML(n) {
  if (TOUCH) return n === 1 ? "TAP TO CONTINUE · SCROLL TO MOVE <span class=\"cur\"></span>" : n === 2 ? "&gt;&gt; Tap here! &lt;&lt;" : "Tap to continue · scroll to move";
  if (n === 1) return kb("next", "&lt;SPACE&gt;") + " " + kb("right", "&lt;→&gt;") + " NEXT · " + kb("back", "&lt;←&gt;") + ' BACK <span class="cur"></span>';
  return kb("next", "Space") + " " + kb("right", "→") + " next · " + kb("back", "←") + " back · " + kb("help", "?") + " keys";
}
for (var _n = 1; _n <= 6; _n++) ADVTXT[_n] = advHTML(_n);
var KEYMAP = { " ": "next", Spacebar: "next", ArrowRight: "right", ArrowDown: "next", PageDown: "next", Enter: "next", ArrowLeft: "back", ArrowUp: "back", PageUp: "back", "?": "help" };
function flashKey(k) {
  var adv = $("#adv"); if (!adv) return; var node = adv.querySelector('kbd[data-k="' + k + '"]') || (k === "next" ? adv.querySelector('kbd[data-k="right"]') : null);
  adv.classList.add("peek"); clearTimeout(flashKey.t); flashKey.t = setTimeout(function () { adv.classList.remove("peek"); }, 900);
  if (node) { node.classList.remove("hit"); void node.offsetWidth; node.classList.add("hit"); }
}
function keysPanel() {
  var rows = TOUCH ? [["Tap", "next line"], ["Scroll / swipe", "move through the story"], ["Tap a dotted term", "show its definition (tap again to close)"], ["♪ and speaker buttons", "music and sound"]]
    : [[kb("enter", "⏎ Enter"), "power on (intro) · next line"], [kb("next", "Space") + kb("right", "→") + kb("down", "↓") + kb("pgdn", "PgDn"), "next line"], [kb("back", "←") + kb("up", "↑") + kb("pgup", "PgUp"), "previous line"],
       [kb("tab", "Tab"), "move between glossary terms, buttons and widgets"], [kb("esc", "Esc"), "close a tooltip or this panel"], [kb("m", "M"), "music on/off"], [kb("s", "S"), "sound on/off"], [kb("help", "?"), "this panel"],
       ['<span class="kn">1989 browser</span>', "type a link number, " + kb("enter", "⏎ Enter") + "; " + kb("b", "b") + " back, " + kb("h", "h") + " home, " + kb("q", "q") + " quit"], ['<span class="kn">Agent errand</span>', "type an errand, " + kb("enter", "⏎ Enter")]];
  return '<dl>' + rows.map(function (r) { return "<dt>" + r[0] + "</dt><dd>" + r[1] + "</dd>"; }).join("") + "</dl>";
}
var keysLast = null;
function keysOpen() { var k = $("#keys"); k.dataset.era = screenEl.dataset.era || "1"; k.classList.toggle("intro", S.mode !== "story"); $("#keysTitle").textContent = TOUCH ? "Gestures" : "Keyboard shortcuts";
  $(".kbody", k).innerHTML = keysPanel(); keysLast = document.activeElement; k.hidden = false; $("#keysClose").focus(); }
function keysClose() { var k = $("#keys"); if (k.hidden) return; k.hidden = true; if (keysLast && keysLast.focus) keysLast.focus(); }
$("#keysBtn").addEventListener("click", function () { if ($("#keys").hidden) keysOpen(); else keysClose(); });
$("#keysClose").addEventListener("click", keysClose);
$("#keys").addEventListener("click", function (e) { if (e.target.id === "keys") keysClose(); });
window.addEventListener("keydown", function (e) {
  var open = !$("#keys").hidden, t = e.target, tag = (t.tagName || "").toLowerCase(), typing = tag === "input" || tag === "textarea" || tag === "select" || t.isContentEditable;
  if (open) { if (e.key === "Escape") { e.preventDefault(); keysClose(); } else if (e.key !== "Tab") { e.stopImmediatePropagation(); if (e.key !== "Enter" || tag !== "button") e.preventDefault(); } return; }
  if (typing || e.altKey || e.ctrlKey || e.metaKey) return;
  if (e.key === "?") { e.preventDefault(); e.stopImmediatePropagation(); keysOpen(); return; }
  if (e.key === "m" || e.key === "M") { $("#music").click(); return; }
  if (e.key === "s" || e.key === "S") { $("#sound").click(); return; }
  if (S.mode === "story" && KEYMAP[e.key] && !((e.key === " " || e.key === "Enter") && (tag === "button" || tag === "a" || (t.classList && t.classList.contains("gl-term"))))) flashKey(KEYMAP[e.key]);
}, true);
