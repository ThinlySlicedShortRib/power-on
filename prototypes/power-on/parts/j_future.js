// ================= v4: ERA 6 · FUTURE (speculative) =================
// c = confidence stage: 0 observed · 1 emerging · 2 plausible · 3 wild guess
var CONF = ["Observed", "Emerging", "Plausible", "Wild guess"];
ERAS.push({ n: 6, yr: "2026 →", span: "2026 → ?", name: "Future · speculative", title: "Chapter 6 · What's next",
  beats: [
    { c: 0, t: "The next reader of your website might not be a person.", p: "ph-agents" },
    { c: 0, t: "AI agents can now use a browser. Give one an errand. It asks before paying.", p: "w-agent" },
    { c: 0, s: 1, t: "29 September 2025. US shoppers buy from Etsy sellers without leaving a chat.", p: "ph-checkout" },
    { c: 0, t: "Search becomes answers. With an AI summary, people click a result <em>8%</em> of the time, not 15%.", p: "ph-zero" },
    { c: 0, t: "Sites push back. Cloudflare blocks AI crawlers by default, or charges them.", p: "ph-gate" },
    { c: 1, t: "Next: WebMCP hands agents real tools, not buttons to guess at. Flip the views.", p: "w-views:tools" },
    { c: 1, t: "Agents get ID cards and wallets: x402, AP2, ACP. None has won yet.", p: "dg6" },
    { c: 2, t: "Speculation from here. Every site gets <em>two audiences</em>: people and their agents.", p: "w-genui" },
    { c: 2, t: "The pendulum gets a third pole. Not where it renders, but <em>who's reading</em>.", p: "w-pend3" },
    { c: 3, t: "Wild guesses: agents haggling with agents, throwaway apps, a robots.txt war. Rate them.", p: "w-predict" },
    { c: 3, t: "Six eras. Six desks. The same three ideas from 1990. Agents speak them too.", p: "ph-lineup" }
  ] });
TRANS.push({ from: "2026", to: "?", cap: "The next reader might not be human" });

CODE["c-builtin"] = { file: "summarise.js · runs on-device", src:
'// Chrome built-in AI (stable since Chrome 138).\n// The model (Gemini Nano) runs locally.\nif ("Summarizer" in self) {\n  const s = await Summarizer.create({ type: "tldr", length: "short" });\n  const tldr = await s.summarize(article.textContent);\n}\n\nconst t = await Translator.create({\n  sourceLanguage: "en", targetLanguage: "pt"\n});\nawait t.translate("Is the coffee pot empty?");' };

function tl(rows) { return '<div class="tl">' + rows.map(function (r) { return '<div class="tlr"><span class="d">' + r[0] + '</span><span class="w"><b>' + r[1] + "</b>" + (r[2] ? "<small>" + r[2] + "</small>" : "") + "</span></div>"; }).join("") + "</div>"; }
function card(title, right, body, w) { var c = el("div", "card"); c.style.width = "min(100%, " + (w || 500) + "px)"; c.innerHTML = '<div class="bar"><span>' + title + "</span><span>" + (right || "") + '</span></div><div class="body">' + body + "</div>"; return c; }
STATIC["ph-agents"] = function () { return card("agents.log", "observed", tl([["22 Oct 2024", "Anthropic: computer use", "public beta, via the API"], ["25 Nov 2024", "Anthropic: Model Context Protocol", "open standard for tools; later adopted widely"], ["23 Jan 2025", "OpenAI: Operator", "browser agent, research preview"], ["Jan 2026", "Gemini in Chrome: auto browse", "US, paid tiers; pauses before purchases"], ["26 Aug 2026", "Claude in Chrome", "generally available on paid plans"]])); };
STATIC["ph-browsers"] = function () { return card("AI browsers", "2025 – 2026", tl([["Jun 2025", "Dia", "early access; maker bought by Atlassian (Oct 2025)"], ["9 Jul 2025", "Comet", "free for everyone from 2 Oct 2025"], ["21 Oct 2025", "ChatGPT Atlas", "macOS; retired Aug 2026, folded into the app"], ["2026", "Chrome, Edge and friends", "agents built into the browsers people already use"]]) + "<small>Names only, no endorsement. Dates as reported at launch.</small>"); };
STATIC["ph-checkout"] = function () { var c = card("chat · Instant Checkout", '<span class="story-stamp">True story</span>',
  '<div class="chat"><p class="u">Find me a handmade ceramic mug under $40</p><p class="a">Here are three from independent sellers. The speckled one ships in 2 days.</p><div class="buy"><span>Speckled stoneware mug · $34</span><button class="btn" type="button" tabindex="-1">Buy</button></div><p class="a">Ordered. The seller handles shipping and returns.</p></div><small>US launch, 29 Sep 2025, Etsy sellers first. Chat is illustrative.</small>', 460); return c; };
STATIC["ph-vibe"] = function () { return card("prompt → app", "2025", '<div class="chat"><p class="u">make me a tip calculator, big buttons, dark mode</p><p class="a">Done. Here it is.</p></div><div class="mini-app"><b>$48.00</b><div><span>15%</span><span class="on">20%</span><span>25%</span></div><em>Tip $9.60 · Total $57.60</em></div><small>Vibe coding: you judge the app, not the code.</small>', 420); };
STATIC["ph-zero"] = function () { return card("Pew Research Center · July 2025", "68,879 searches", '<div class="bars"><div><span>No AI summary</span><b style="--v:15"></b><em>15%</em></div><div><span>With AI summary</span><b style="--v:8"></b><em>8%</em></div><div><span>Clicked a cited source</span><b style="--v:1"></b><em>1%</em></div></div><small>Share of searches where people clicked a result. US adults, March 2025.</small>', 480); };
STATIC["ph-gate"] = function () { return card("GET /article · user-agent: SomeAIBot", "1 July 2025", '<pre class="resp">HTTP/1.1 402 Payment Required\ncrawler-price: USD 0.01\n\n# or, the old way, in robots.txt:\nUser-agent: SomeAIBot\nDisallow: /</pre><small>Default block for AI crawlers, plus a pay-per-crawl beta. Header is illustrative.</small>', 480); };
STATIC["ph-pay"] = function () { return card("agent wallets", "emerging", tl([["6 May 2025", "x402 (Coinbase)", "HTTP 402 + stablecoins, pay per request"], ["16 Sep 2025", "AP2 (Google)", "signed mandates: what you allowed the agent to buy"], ["29 Sep 2025", "Agentic Commerce Protocol", "OpenAI + Stripe; powers Instant Checkout"]]) + "<small>Competing approaches. Which one sticks is still open.</small>"); };
STATIC["ph-pageapi"] = function () { return card("page = data + tools + design system", "plausible", '<div class="stack3"><span>data<small>products, prices, stock</small></span><span>tools<small>search, add to cart, checkout</small></span><span>design system<small>tokens, components, voice</small></span></div><div class="flow"><span>person</span><i>→</i><span>rendered UI</span></div><div class="flow"><span>agent</span><i>→</i><span>tool calls</span></div>', 460); };
STATIC["ph-econ"] = function () { return card("who pays for the web?", "plausible", '<div class="flow"><span>search</span><i>→</i><span>click</span><i>→</i><span>page</span><i>→</i><span>ad or subscription</span></div><div class="flow"><span>question</span><i>→</i><span>answer</span><i>→</i><span>?</span></div><small>Pay per crawl? Licensing? Micropayments? Unknown.</small>', 460); };

WIDGETS["w-views"] = function (tab) {
  var c = el("div", "card views"); c.style.width = "min(100%, 520px)";
  var T = {
    human: '<div class="shop"><div class="sh"><b>Fern &amp; Kettle</b><span>Search teas…</span><span>Cart (0)</span></div><div class="pr"><div><i style="background:#9bc49a"></i>Sencha<em>$12.00</em><button type="button" tabindex="-1">Add to cart</button></div><div><i style="background:#c9a36b"></i>Assam<em>$10.00</em><button type="button" tabindex="-1">Add to cart</button></div><div><i style="background:#b28fc4"></i>Earl Grey<em>$11.00</em><button type="button" tabindex="-1">Add to cart</button></div></div></div>',
    a11y: '<pre>main\n  heading "Fern &amp; Kettle" level 1\n  searchbox "Search teas"\n  link "Cart, 0 items"\n  list "Teas"\n    listitem\n      text "Sencha" · text "$12.00"\n      button "Add to cart"\n    listitem\n      text "Assam" · text "$10.00"\n      button "Add to cart"</pre>',
    tools: '<pre>// registered by the page (WebMCP-style, simplified)\ntools: [\n  { name: "searchTeas",\n    input: { query: "string", maxPrice: "number?" } },\n  { name: "addToCart",\n    input: { sku: "string", qty: "integer" } },\n  { name: "checkout",\n    note: "browser asks the user to confirm" }\n]</pre>',
    llms: '<pre># Fern &amp; Kettle\n\n&gt; Small-batch loose-leaf tea shop. Ships in the EU and US.\n\n## Docs\n- [Catalog](/teas.md): every tea, price, stock\n- [Shipping](/shipping.md): rates and times\n- [Returns](/returns.md): 30 days, unopened</pre>'
  };
  c.innerHTML = '<div class="bar"><span>fernandkettle.example</span><span class="who">viewing as: person</span></div><div class="vt" role="tablist"><button type="button" role="tab" data-t="human">Person</button><button type="button" role="tab" data-t="a11y">Agent: accessibility tree</button><button type="button" role="tab" data-t="tools">Agent: tools</button><button type="button" role="tab" data-t="llms">llms.txt</button></div><div class="body vbody"></div>';
  function show(k) { $(".vbody", c).innerHTML = T[k]; c.querySelectorAll(".vt button").forEach(function (b) { b.setAttribute("aria-selected", b.dataset.t === k); }); $(".who", c).textContent = "viewing as: " + (k === "human" ? "person" : "agent"); }
  c.querySelector(".vt").addEventListener("click", function (e) { var b = e.target.closest("button"); if (b) { show(b.dataset.t); blip(900); } });
  show(tab || "human"); return c;
};
WIDGETS["w-agent"] = function () {
  var FLOWS = [
    { intent: "Book a table for 2 on Friday", site: "Osteria Nove", q: "dinner friday 2 people", pick: "19:30 · table for 2", fields: [["Name", "A. Reader"], ["Party", "2"], ["Time", "Fri 19:30"]], confirm: "Book a table for 2, Friday 19:30?", done: "Booked. Confirmation sent." },
    { intent: "Find trail shoes, size 9, under $120", site: "Ridge Outfitters", q: "trail shoe size 9 < $120", pick: "Ridgeline 4 · $109", fields: [["Size", "9"], ["Colour", "Slate"], ["Ship to", "Home"]], confirm: "Pay $109.00 with your saved card?", done: "Ordered. Arrives Thursday." },
    { intent: "Renew my library books", site: "City Library", q: "my loans", pick: "3 items due Monday", fields: [["Card", "•••• 4417"], ["Items", "3"], ["New due date", "+21 days"]], confirm: "Renew 3 items until 26 Oct?", done: "Renewed. No fees." }
  ];
  var c = el("div", "card agentw"); c.style.width = "min(100%, 520px)";
  c.innerHTML = '<div class="bar"><span>agent · errand</span><span class="st">idle</span></div><div class="body"><div class="intents">' + FLOWS.map(function (f, i) { return '<button type="button" class="chip" data-i="' + i + '">' + esc(f.intent) + "</button>"; }).join("") +
    '</div><form class="ask"><label class="sr" for="agentAsk">Your errand</label><input id="agentAsk" placeholder="…or type an errand" maxlength="80"><button class="btn" type="submit">Go</button></form><div class="kcue"><span class="kbonly">Type an errand. Press <kbd>⏎ Enter</kbd>.</span><span class="touchonly">Or type one. Tap Go.</span></div><div class="site"><div class="url">—</div><div class="pane"></div><svg class="ghost" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 2l15 9-7 1.5L9 20z"/></svg></div><p class="log" aria-live="polite">Pick an errand.</p></div>';
  var pane = $(".pane", c), ghost = $(".ghost", c), site = $(".site", c), log = $(".log", c), st = $(".st", c), t = [], running = false;
  function moveTo(node) { var r = node.getBoundingClientRect(), s = site.getBoundingClientRect(); ghost.style.transform = "translate(" + (r.left - s.left + r.width * .6) + "px," + (r.top - s.top + r.height * .55) + "px)"; }
  function run(f, typed) {
    t.forEach(clearTimeout); t = []; var k = REDUCE ? 0 : 1; running = true;
    c.querySelectorAll(".chip").forEach(function (b) { b.classList.toggle("sel", FLOWS[+b.dataset.i] === f && !typed); });
    function at(ms, fn) { t.push(setTimeout(fn, ms * k)); }
    st.textContent = "working"; $(".url", c).textContent = f.site.toLowerCase().replace(/\s+/g, "") + ".example";
    pane.innerHTML = '<div class="srch"><span class="q"></span></div><div class="res"></div>'; ghost.style.opacity = 1; ghost.style.transform = "translate(12px,12px)";
    log.textContent = "Intent: " + (typed || f.intent);
    at(400, function () { moveTo($(".srch", pane)); });
    f.q.split("").forEach(function (ch, i) { at(900 + i * 45, function () { $(".q", pane).textContent += ch; }); });
    var t1 = 900 + f.q.length * 45 + 300;
    at(t1, function () { $(".res", pane).innerHTML = ["Option A", f.pick, "Option C"].map(function (x, i) { return '<div class="r' + (i === 1 ? " hit" : "") + '">' + esc(x) + "</div>"; }).join(""); log.textContent = "Reading results…"; });
    at(t1 + 700, function () { moveTo($(".r.hit", pane)); });
    at(t1 + 1300, function () { pane.innerHTML = '<div class="form">' + f.fields.map(function (fl) { return '<label>' + esc(fl[0]) + '<span class="fv"></span></label>'; }).join("") + "</div>"; log.textContent = "Filling in the form…"; });
    f.fields.forEach(function (fl, i) { at(t1 + 1700 + i * 700, function () { var fv = pane.querySelectorAll(".fv")[i]; if (!fv) return; moveTo(fv); fv.textContent = fl[1]; }); });
    var t2 = t1 + 1700 + f.fields.length * 700 + 300;
    at(t2, function () { running = false; st.textContent = "waiting for you"; ghost.style.opacity = .35; log.innerHTML = ""; var q = el("div", "confirm", "<b>" + esc(f.confirm) + '</b><div><button class="btn" type="button" data-a="y">Approve</button> <button class="btn ghostbtn" type="button" data-a="n">Cancel</button></div><small>Agents pause before money or anything irreversible.</small>'); pane.appendChild(q); var cc = c; if (cc.scrollHeight > cc.clientHeight) cc.scrollTop = cc.scrollHeight;
      q.addEventListener("click", function (e) { var b = e.target.closest("button"); if (!b) return; q.innerHTML = b.dataset.a === "y" ? "<b>✓ " + esc(f.done) + "</b>" : "<b>Cancelled. Nothing was sent.</b>"; st.textContent = "idle"; ghost.style.opacity = 0; blip(b.dataset.a === "y" ? 1400 : 300); }); blip(880); });
  }
  // auto-play the first errand each time this line comes on stage (never restarts mid-run)
  c._show = function () {
    if (running) return; var f = FLOWS[0], inp = $("#agentAsk", c); t.forEach(clearTimeout); t = []; inp.value = "";
    if (REDUCE) { inp.value = f.intent; run(f); return; }
    running = true; c.querySelectorAll(".chip").forEach(function (b, i) { b.classList.toggle("sel", i === 0); });
    st.textContent = "typing"; log.textContent = "Auto-playing the first errand. Pick another any time.";
    f.intent.split("").forEach(function (ch, i) { t.push(setTimeout(function () { inp.value += ch; }, 350 + i * 38)); });
    t.push(setTimeout(function () { run(f); }, 350 + f.intent.length * 38 + 350));
  };
  c.querySelector(".intents").addEventListener("click", function (e) { var b = e.target.closest(".chip"); if (b) run(FLOWS[+b.dataset.i]); });
  $(".ask", c).addEventListener("submit", function (e) { e.preventDefault(); var v = $("#agentAsk", c).value.trim(); if (!v) return; var low = v.toLowerCase(), f = /shoe|buy|order|size/.test(low) ? FLOWS[1] : /book|library|renew/.test(low) && !/table|dinner/.test(low) ? FLOWS[2] : FLOWS[0]; run(f, v); });
  return c;
};
WIDGETS["w-genui"] = function () {
  var c = el("div", "card genui"); c.style.width = "min(100%, 500px)";
  var V = {
    sr: '<div class="g-sr"><p class="say">“Heading level 1: Your flight tomorrow. Lisbon. Departs 7:40 AM from gate B12. Rain expected, 80 percent. Leave home by 5:30.” </p><ol><li>Departure 07:40, gate B12</li><li>Weather in Lisbon: rain, 80%</li><li>Leave by 05:30</li></ol></div>',
    kid: '<div class="g-kid"><b>You’re flying to Lisbon!</b><p>Wake up when it’s still dark (5:30). Pack your raincoat, it’s going to rain there.</p><div class="big">✈ 7:40</div></div>',
    exec: '<div class="g-exec"><b>LIS · 07:40 · B12 · leave 05:30</b><div><button class="btn" type="button" tabindex="-1">Book car</button> <button class="btn ghostbtn" type="button" tabindex="-1">Check in</button></div></div>'
  };
  c.innerHTML = '<div class="bar"><span>same data · generated per visitor</span><span class="gst">ready</span></div><div class="vt" role="tablist"><button type="button" role="tab" data-v="sr">Screen-reader user</button><button type="button" role="tab" data-v="kid">Kid</button><button type="button" role="tab" data-v="exec">Busy exec</button></div><div class="body gbody"></div><div class="data"><code>{ flight: "TP 1351", to: "LIS", dep: "07:40", gate: "B12", rain: 0.8 }</code> <small>illustrative</small></div>';
  var body = $(".gbody", c), gst = $(".gst", c), tm = 0;
  function gen(k) { c.querySelectorAll(".vt button").forEach(function (b) { b.setAttribute("aria-selected", b.dataset.v === k); }); body.innerHTML = '<div class="sk"></div><div class="sk" style="width:70%"></div>'; gst.textContent = "generating…"; clearTimeout(tm);
    tm = setTimeout(function () { body.innerHTML = V[k]; gst.textContent = "ready"; }, REDUCE ? 0 : 700); }
  c.querySelector(".vt").addEventListener("click", function (e) { var b = e.target.closest("button"); if (b) { gen(b.dataset.v); blip(1000); } });
  c._show = function () { gen("sr"); }; return c;
};
WIDGETS["w-pend3"] = function () {
  var c = el("div", "card pend3"); c.style.width = "min(100%, 520px)";
  c.innerHTML = '<div class="bar"><span>who renders, who reads</span><span>1991 → ?</span></div><div class="body"><svg viewBox="0 0 520 300" role="img" aria-label="A triangle with three poles: server, browser and agent. A dot travels from server to browser to the edge, then towards the agent pole.">' +
    '<path d="M70 250 L450 250 L260 40 Z" fill="none" stroke="currentColor" stroke-opacity=".25" stroke-width="2" stroke-dasharray="4 6"/>' +
    '<circle cx="70" cy="250" r="9" fill="currentColor"/><text x="70" y="282" text-anchor="middle" fill="currentColor" font-size="15">SERVER</text><text x="70" y="232" text-anchor="middle" fill="currentColor" font-size="11" opacity=".6">1991 · 2016 · edge</text>' +
    '<circle cx="450" cy="250" r="9" fill="currentColor"/><text x="450" y="282" text-anchor="middle" fill="currentColor" font-size="15">BROWSER</text><text x="450" y="232" text-anchor="middle" fill="currentColor" font-size="11" opacity=".6">2005 · 2013</text>' +
    '<circle cx="260" cy="40" r="11" fill="#ff5a36"/><text x="260" y="22" text-anchor="middle" fill="#ff5a36" font-size="15">AGENT ?</text>' +
    '<circle class="p3dot" r="8" fill="#0fa3a3"><animateMotion dur="7s" repeatCount="indefinite" path="M70 250 L450 250 L120 250 L260 40" keyPoints="0;0.42;0.79;1" keyTimes="0;0.35;0.65;1" calcMode="linear"/></circle></svg></div>';
  return c;
};
WIDGETS["w-predict"] = function () {
  var G = [["haggle", "Personal agents negotiate with shop agents"], ["throwaway", "Apps generated for one task, then deleted"], ["agentos", "The browser becomes an agent operating system"], ["robots2", "A robots.txt war 2.0 over who may read what"], ["m2m", "Most web traffic is machines talking to machines"]];
  var saved = {}; try { saved = JSON.parse(store("poweron.predict") || "{}"); } catch (e) { saved = {}; }
  var c = el("div", "card predict"); c.style.width = "min(100%, 500px)";
  c.innerHTML = '<div class="bar"><span>Your predictions · by 2035</span><span class="avg"></span></div><div class="body">' + G.map(function (g) { var v = saved[g[0]] != null ? saved[g[0]] : 50; return '<label class="pr" for="pr-' + g[0] + '"><span>' + esc(g[1]) + '</span><input type="range" min="0" max="100" step="5" id="pr-' + g[0] + '" data-k="' + g[0] + '" value="' + v + '"><em>' + v + "%</em></label>"; }).join("") + '<small>Saved in this browser only. Just guesses.</small></div>';
  function avg() { var a = 0, n = 0; c.querySelectorAll("input").forEach(function (i) { a += +i.value; n++; }); var m = Math.round(a / n); $(".avg", c).textContent = "you: " + (m >= 70 ? "optimist" : m <= 30 ? "skeptic" : "hedging") + " · " + m + "%"; }
  c.addEventListener("input", function (e) { var i = e.target; if (!i.dataset.k) return; i.nextElementSibling.textContent = i.value + "%"; saved[i.dataset.k] = +i.value; store("poweron.predict", JSON.stringify(saved)); avg(); });
  avg(); return c;
};

// confidence meter (era 6 only)
function confHTML(ei, b) {
  if (ERAS[ei].n !== 6) return "";
  var beats = ERAS[ei].beats, idx = Math.max(0, b), cur = beats[idx], same = beats.filter(function (x) { return x.c === cur.c; }), k = same.indexOf(cur);
  var pos = b < 0 ? 0 : (cur.c + (k + .5) / same.length) / 4 * 100;
  return '<div class="conf" aria-label="Confidence: ' + (b < 0 ? CONF[0] : CONF[cur.c]) + '"><div class="ct">' + CONF.map(function (n, i) { return '<span class="' + (b >= 0 && i === cur.c ? "on" : "") + '">' + n + "</span>"; }).join("") + '</div><div class="cb"><i style="left:' + pos.toFixed(1) + '%"></i></div></div>';
}

// era 6 ambient FX: agent ghost cursor + regenerating layout blocks
var FUT = { timer: 0 };
function futureFx(on) {
  clearInterval(FUT.timer); FUT.timer = 0; if (!on || REDUCE) return;
  function step() { var g = $("#fx .agentcur"), blocks = document.querySelectorAll("#fx .gblk"); if (!g) return;
    g.style.transform = "translate(" + (10 + Math.random() * 75) + "vw," + (15 + Math.random() * 65) + "vh)";
    blocks.forEach(function (b) { b.style.left = (Math.random() * 80) + "%"; b.style.top = (Math.random() * 80) + "%"; b.style.width = (8 + Math.random() * 18) + "%"; b.style.height = (6 + Math.random() * 14) + "%"; }); }
  step(); FUT.timer = setInterval(step, 3200);
}
FX[6] = '<div class="gblk"></div><div class="gblk"></div><div class="gblk"></div><div class="gblk"></div><div class="gblk"></div><div class="intentbar"><span class="spark">✦</span><span class="ph">Ask the web to do something…</span></div><div class="think"></div><div class="agentcur"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 2l15 9-7 1.5L9 20z"/></svg><span>agent</span></div>';
ADVTXT[6] = "Tap to continue · or ask the agent";

// v7: wild guess, agents haggling with agents (illustrative chat) + the prediction sliders below
WIDGETS["w-haggle"] = function () {
  var MSG = [
    { w: "you", ms: 0, t: "Hi. Quiet table for 2, Friday evening. Budget €90 all-in.", chip: '{ party: 2, day: "Fri", budget: "€90", noise: "low" }' },
    { w: "shop", ms: 9, t: "Friday is busy. 19:30 by the window, set menu, €48 each.", chip: '{ slot: "19:30", menu: "set", total: "€96" }' },
    { w: "you", ms: 14, t: "That's €6 over. My human has eaten here 7 times, and two streets away offers €84.", chip: '{ visits: 7, competitor: "€84", proof: "signed" }' },
    { w: "shop", ms: 11, t: "Two streets away doesn't have our tiramisu." },
    { w: "you", ms: 8, t: "Tiramisu doesn't pay rent. Neither does €96." },
    { w: "shop", ms: 12, t: "Fine. 10% off if you book before 18:00, or a free dessert. Not both.", chip: '{ offer: ["-10% before 18:00", "free dessert"] }' },
    { w: "you", ms: 6, t: "10% off, booked now. Window seat?", chip: '{ pick: "-10%", total: "€86.40", window: true }' },
    { w: "shop", ms: 7, t: "Window seat confirmed. Pleasure doing business, fellow algorithm." },
    { w: "signed" },
    { w: "notify" }
  ];
  var c = el("div", "card haggle"); c.style.width = "min(100%, 520px)";
  c.innerHTML = '<div class="bar"><span>agent ↔ agent · <b class="wg">wild guess · illustrative</b></span><span class="spd" role="group" aria-label="Playback speed"><button type="button" data-s="human" aria-pressed="true">human speed</button><button type="button" data-s="agent" aria-pressed="false">agent speed</button></span></div>' +
    '<div class="hg-heads"><span class="hd you"><i>Y</i>Your agent</span><span class="clock">0 ms</span><span class="hd shop">Shop\'s agent<i>S</i></span></div><div class="hg-log" aria-live="polite"></div>' +
    '<div class="hg-foot"><button class="btn ghostbtn" type="button" data-a="replay">↺ Replay</button></div><div class="hg-pred"></div>';
  var log = $(".hg-log", c), clock = $(".clock", c), speed = "human", t = [], running = false, total = 0;
  var pred = WIDGETS["w-predict"](); pred.classList.remove("card"); pred.style.width = "100%"; $(".hg-pred", c).appendChild(pred);
  function down() { log.scrollTop = log.scrollHeight; }
  function bubble(m) {
    if (m.w === "signed") return el("div", "hg-signed", "<b>Signed offer ✓</b>Osteria Nove · 2 people · Fri 19:30 · €86.40 · book by 18:00<small>both agents signed; your human hasn't yet</small>");
    if (m.w === "notify") { var n = el("div", "hg-notify", '<span class="bell">●</span><div><b>Deal found: 2 people, Fri 19:30, −10%. Approve?</b><div class="acts"><button class="btn" type="button" data-a="yes">Approve</button> <button class="btn ghostbtn" type="button" data-a="no">Decline</button></div><p class="res"></p></div>'); return n; }
    total += m.ms;
    var b = el("div", "hg-msg " + m.w, '<span class="av">' + (m.w === "you" ? "Y" : "S") + '</span><div class="bub">' + esc(m.t) + (m.chip ? '<code>' + esc(m.chip) + "</code>" : "") + '<small>+' + m.ms + " ms</small></div>");
    clock.textContent = total + " ms"; return b;
  }
  function add(node) { log.appendChild(node); glossifyEl(node.querySelector("b") ? node : el("div")); down(); }
  function play() {
    t.forEach(clearTimeout); t = []; log.innerHTML = ""; total = 0; clock.textContent = "0 ms";
    if (REDUCE) { MSG.forEach(function (m) { add(bubble(m)); }); running = false; return; }
    running = true; var i = 0;
    (function next() {
      if (i >= MSG.length) { running = false; return; }
      var m = MSG[i++], fast = speed === "agent", typing = null;
      if (m.w === "you" || m.w === "shop") { typing = el("div", "hg-msg typing " + m.w, '<span class="av">' + (m.w === "you" ? "Y" : "S") + '</span><div class="bub"><i></i><i></i><i></i></div>'); log.appendChild(typing); down(); }
      t.push(setTimeout(function () { if (typing) typing.remove(); add(bubble(m)); blip(m.w === "you" ? 980 : m.w === "shop" ? 740 : 1300);
        t.push(setTimeout(next, fast ? 60 : (m.w === "signed" ? 900 : 650))); }, fast ? 40 : (typing ? 750 + Math.min(900, (m.t || "").length * 12) : 500)));
    })();
  }
  c.addEventListener("click", function (e) {
    var b = e.target.closest("button"); if (!b) return;
    if (b.dataset.s) { speed = b.dataset.s; c.querySelectorAll(".spd button").forEach(function (x) { x.setAttribute("aria-pressed", x === b); }); blip(900); return; }
    if (b.dataset.a === "replay") { play(); return; }
    if (b.dataset.a === "yes" || b.dataset.a === "no") { var r = b.closest(".hg-notify").querySelector(".res"); r.textContent = b.dataset.a === "yes" ? "Approved. Your human will now pretend they found this themselves." : "Declined. Both agents are disappointed, for about 4 ms."; b.parentNode.remove(); blip(b.dataset.a === "yes" ? 1400 : 300); down(); }
  });
  c._show = function () { if (!running) play(); };
  return c;
};
(function () { var b = ERAS[5].beats; b[9].p = "w-haggle"; b[9].t = "Wild guesses: agents haggling with agents, throwaway apps, a robots.txt war. Rate them."; })();
