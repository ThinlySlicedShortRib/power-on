  /* ================= murmur: the playable app ================= */
  var appw = $("#appw"), view = $("#view"), toastEl = $("#toast");
  var KEY = "murmur-v2";
  var U = {
    ana: { name: "Ana L.", handle: "ana", color: "#0ca678" },
    mika: { name: "Mika K.", handle: "mika", color: "#ff7a59" },
    jo: { name: "Jo O.", handle: "jo", color: "#4b5bff" },
    sam: { name: "Sam R.", handle: "sam", color: "#e64980" },
    lee: { name: "Lee C.", handle: "lee", color: "#f08c00" },
    ravi: { name: "Ravi P.", handle: "ravi", color: "#7048e8" }
  };
  var ORDER = ["ana", "mika", "jo", "sam", "lee", "ravi"];
  var STORIES = {
    ana: [["linear-gradient(160deg,#0ca678,#0b7285)", "Coffee ☕ + View Source"], ["linear-gradient(160deg,#20c997,#4dabf7)", "The first website still loads. 1991!"]],
    mika: [["linear-gradient(160deg,#ff7a59,#ff3d6e)", "Launch day 🚀"], ["linear-gradient(160deg,#ffb341,#ff7a59)", "42 users. 41 are my mum."]],
    jo: [["linear-gradient(160deg,#4b5bff,#15aabf)", "Lighthouse score: 100 💯"]],
    sam: [["linear-gradient(160deg,#e64980,#7048e8)", "npm install…"], ["linear-gradient(160deg,#7048e8,#1c1f2a)", "…still installing 🫠"]],
    lee: [["linear-gradient(160deg,#f59f00,#e8590c)", "Dial-up remix out now 📞"]],
    ravi: [["linear-gradient(160deg,#7048e8,#4b5bff)", "GeoCities never dies ✨"]]
  };
  var EMO = ["😀", "😂", "🤯", "🔥", "❤️", "🎉", "👀", "🚀", "☕", "💯", "🫠", "👍", "🙌", "😎", "🤔", "✨"];
  var POOL = [
    ["jo", "TIL the <blink> tag never worked in Internet Explorer. #WebHistory"],
    ["sam", "Hydration error is my villain origin story. #React"],
    ["lee", "Rebuilt my portfolio in plain HTML and CSS. Loads in 40ms. #TinyWebsites"],
    ["ana", "A coffee pot at Cambridge was one of the first webcams. Priorities. ☕ #WebHistory"],
    ["ravi", "Remember when Web 2.0 meant glossy buttons and a BETA badge? #Web20"],
    ["mika", "CSS grid made me cry happy tears today. #CSS"],
    ["sam", "Every framework is a fancier way to make a <div>. #JavaScript"],
    ["lee", "My modem made that noise so you didn't have to. #DialUpSounds"],
    ["ana", "JavaScript was written in about 10 days. It shows. It works. #JavaScript"],
    ["ravi", "Edge functions: your code runs in a city near you. Wild. #WebPerf"],
    ["mika", "View Source is still the best teacher on the web. #ViewSource"],
    ["jo", "Measure first. Then optimise. Then measure again. #WebPerf"]
  ];
  var REPLIES = {
    ana: ["haha yes", "wait, really?", "ok but have you seen the coffee pot cam?", "sending you a link 👀"],
    mika: ["thank you!! 🎉", "it's just HTML, CSS and a bit of React", "you should ship one too", "deploys in 30 seconds now. wild."],
    jo: ["fair", "measure it first 😄", "TTFB or it didn't happen", "agree. ship it."]
  };
  var TAGBASE = { ViewSource: 12402, WebHistory: 8115, DialUpSounds: 3021, JavaScript: 21480, ShipIt: 5410, WebPerf: 4203, CSS: 9876, React: 15102, TinyWebsites: 2604, Web20: 911 };
  var ICONS = {
    home: '<path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/>',
    bell: '<path d="M6 16v-5a6 6 0 0 1 12 0v5l2 2H4z"/><path d="M10 21a2 2 0 0 0 4 0"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
    heart: '<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/>',
    reply: '<path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1.1-4.4A8 8 0 1 1 21 12z"/>',
    repost: '<path d="M17 2l3 3-3 3"/><path d="M4 11V9a4 4 0 0 1 4-4h12"/><path d="M7 22l-3-3 3-3"/><path d="M20 13v2a4 4 0 0 1-4 4H4"/>',
    bookmark: '<path d="M6 3h12v18l-6-4-6 4z"/>',
    share: '<path d="M12 3v13"/><path d="M7 8l5-5 5 5"/><path d="M5 14v6h14v-6"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    moon: '<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>',
    smile: '<circle cx="12" cy="12" r="9"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><path d="M9 9.5h.01M15 9.5h.01"/>',
    back: '<path d="M15 18l-6-6 6-6"/>',
    close: '<path d="M18 6L6 18M6 6l12 12"/>'
  };
  function ic(n) { return '<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + ICONS[n] + '</svg>'; }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function fmt(n) { return n.toLocaleString("en-US"); }
  function rnd(a, b) { return a + Math.floor(Math.random() * (b - a + 1)); }
  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
  function ago(ts) { var s = (Date.now() - ts) / 1000; return s < 45 ? "now" : s < 3600 ? Math.round(s / 60) + "m" : s < 86400 ? Math.round(s / 3600) + "h" : Math.round(s / 86400) + "d"; }
  function first(n) { return n.split(" ")[0]; }

  var NOW = Date.now(), seq = 0;
  var A = {
    tab: "home", theme: "light", me: { name: "You", handle: "you", color: "#141822" },
    posts: [
      { id: "p1", u: "mika", text: "Shipped my first side project tonight. It's a website. It's live. Strangers are using it. 🤯 #ShipIt", ts: NOW - 2 * 60e3, likes: 1284, reposts: 41, rbase: 94, pic: 1,
        replies: [{ u: "ana", text: "Congrats!! Link?" }, { u: "jo", text: "Best feeling in the world." }] },
      { id: "p2", u: "jo", text: "Hot take: the best feature is the one that loads instantly. #WebPerf", ts: NOW - 9 * 60e3, likes: 312, reposts: 7, rbase: 18, replies: [] },
      { id: "p3", u: "ana", text: "TIL the first website is still online. Plain HTML from 1991. Still loads. #ViewSource", ts: NOW - 25 * 60e3, likes: 876, reposts: 120, rbase: 33, replies: [] },
      { id: "p4", u: "sam", text: "Me: I'll just add one npm package.\nnode_modules: 🫠 #JavaScript", ts: NOW - 62 * 60e3, likes: 540, reposts: 64, rbase: 21, replies: [] },
      { id: "p5", u: "ravi", text: "Who else learned HTML by hitting View Source on someone's GeoCities page? #ViewSource", ts: NOW - 130 * 60e3, likes: 698, reposts: 88, rbase: 52, pic: 2, replies: [] },
      { id: "p6", u: "lee", text: "Dial-up sound is an ASMR genre and I won't be taking questions. #DialUpSounds", ts: NOW - 200 * 60e3, likes: 221, reposts: 12, rbase: 9, replies: [] }
    ],
    open: {}, follows: {}, followBacks: 0, seen: {}, pending: [], pool: 0, loading: false, scroll: {},
    notifs: [
      { i: "user", t: "Sam R. started following you", ts: NOW - 30 * 60e3 },
      { i: "reply", t: "Ana L. mentioned you: “have you seen this?”", ts: NOW - 50 * 60e3 }
    ],
    unread: 2,
    chats: {
      ana: [{ f: "ana", t: "did you know the first website is still online?" }],
      mika: [{ f: "mika", t: "thanks for the likes on my launch post!!" }],
      jo: [{ f: "jo", t: "hot take incoming" }, { f: "me", t: "go on" }, { f: "jo", t: "speed is a feature" }]
    },
    chatUnread: { ana: 1, mika: 1, jo: 0 }, chat: null, chatTyping: null,
    q: "", draft: "", typing: false, lastLike: null, editing: false, editColor: null
  };

  /* ----- persistence (your posts, profile, follows, theme) ----- */
  function load() {
    try {
      var d = JSON.parse(localStorage.getItem(KEY) || "null");
      if (!d) return;
      if (d.me && d.me.name) A.me = d.me;
      if (d.theme) A.theme = d.theme;
      if (d.follows) A.follows = d.follows;
      if (d.mine && d.mine.length) A.posts = d.mine.map(function (p) { p.u = "me"; p.mine = true; p.replies = p.replies || []; return p; }).concat(A.posts);
    } catch (e) {}
  }
  function save() {
    try {
      localStorage.setItem(KEY, JSON.stringify({ me: A.me, theme: A.theme, follows: A.follows,
        mine: A.posts.filter(function (p) { return p.mine; }).slice(0, 30).map(function (p) {
          return { id: p.id, text: p.text, ts: p.ts, likes: p.likes, reposts: p.reposts, rbase: 0, replies: p.replies };
        }) }));
    } catch (e) {}
  }

  function who(k) { return k === "me" ? A.me : U[k]; }
  function byId(id) { for (var i = 0; i < A.posts.length; i++) if (A.posts[i].id === id) return A.posts[i]; return null; }
  function avatar(u, cls) { return '<div class="av' + (cls ? " " + cls : "") + '" style="background:' + u.color + '" aria-hidden="true">' + esc(u.name.charAt(0).toUpperCase()) + "</div>"; }
  function escText(s) { return String(s).replace(/[&<>]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]; }); }
  function richText(t) { return escText(t).replace(/\n/g, "<br>").replace(/(^|[^&\w])#(\w+)/g, '$1<button type="button" class="tagl" data-act="tag" data-tag="#$2">#$2</button>'); }

  /* ----- templates ----- */
  function postHTML(p, extra) {
    var u = who(p.u), open = !!A.open[p.id];
    return '<article class="post' + (extra || "") + '" data-id="' + p.id + '">' +
      '<div class="who">' + avatar(u) + '<div class="wn"><b>' + esc(u.name) + '</b><small>@' + esc(u.handle) + " · " + ago(p.ts) + "</small></div></div>" +
      '<p class="txt">' + richText(p.text) + "</p>" +
      (p.pic ? '<div class="pic pic' + p.pic + '"></div>' : "") +
      '<div class="acts">' +
        '<button type="button" class="act rep' + (open ? " on" : "") + '" data-act="reply" aria-expanded="' + open + '" aria-label="Reply">' + ic("reply") + '<span class="n">' + fmt((p.rbase || 0) + p.replies.length) + "</span></button>" +
        '<button type="button" class="act rp' + (p.rp ? " on" : "") + '" data-act="repost" aria-pressed="' + !!p.rp + '" aria-label="Repost">' + ic("repost") + '<span class="n">' + fmt(p.reposts) + "</span></button>" +
        '<button type="button" class="act like' + (p.liked ? " on" : "") + '" data-act="like" aria-pressed="' + !!p.liked + '" aria-label="Like">' + ic("heart") + '<span class="n">' + fmt(p.likes) + "</span></button>" +
        '<button type="button" class="act bm' + (p.bm ? " on" : "") + '" data-act="bookmark" aria-pressed="' + !!p.bm + '" aria-label="Bookmark">' + ic("bookmark") + "</button>" +
        '<button type="button" class="act" data-act="share" aria-label="Share">' + ic("share") + "</button>" +
      "</div>" + (open ? threadHTML(p) : "") + "</article>";
  }
  function threadHTML(p) {
    return '<div class="thread">' + p.replies.map(function (r) { var u = who(r.u); return '<div class="reply">' + avatar(u, "sm") + "<div><b>" + esc(u.name) + "</b>" + esc(r.text) + "</div></div>"; }).join("") +
      '<form class="rform" data-form="reply"><input class="field rin" maxlength="200" placeholder="Write a reply…" aria-label="Write a reply" autocomplete="off"><button class="pill solid" type="submit">Reply</button></form></div>';
  }
  function storiesHTML() {
    return '<div class="stories">' + ORDER.map(function (h, i) {
      var u = U[h];
      return '<button type="button" class="story" data-act="story" data-i="' + i + '" aria-label="Open ' + esc(u.name) + '’s story"><span class="ring' + (A.seen[h] ? " seen" : "") + '"><span style="background:' + u.color + '">' + u.name.charAt(0) + "</span></span>" + first(u.name) + "</button>";
    }).join("") + "</div>";
  }
  function composeHTML() {
    return '<div class="compose">' + avatar(A.me) + '<div class="cbox"><textarea id="cmp" rows="2" maxlength="320" placeholder="What’s happening on the web?" aria-label="Write a post"></textarea>' +
      '<div class="crow"><button type="button" class="iconbtn" data-act="emoji" aria-label="Add emoji" aria-expanded="false">' + ic("smile") + "</button>" +
      '<div class="emo" id="emo" hidden>' + EMO.map(function (e) { return '<button type="button" data-act="emo" data-e="' + e + '" aria-label="Insert ' + e + '">' + e + "</button>"; }).join("") + "</div>" +
      '<span class="cnt" id="cnt">280</span><button type="button" class="pill solid" data-act="post" id="postbtn" disabled>Post</button></div></div></div>';
  }
  function skelHTML() { return '<div class="skel" aria-hidden="true"><i style="width:40%"></i><i></i><i style="width:75%"></i></div>'; }
  function homeHTML() {
    return '<div class="vhead"><h2>Home</h2></div>' + storiesHTML() + composeHTML() +
      '<button type="button" class="newpill" data-act="newpill" id="newpill"' + (A.pending.length ? "" : " hidden") + ">↑ " + A.pending.length + " new post" + (A.pending.length === 1 ? "" : "s") + "</button>" +
      '<div class="ptr" id="ptr">Pull to refresh</div>' +
      '<div id="list">' + A.posts.map(function (p) { return postHTML(p); }).join("") + '</div><div id="more"></div>';
  }
  function trending() {
    var c = {}; Object.keys(TAGBASE).forEach(function (k) { c[k] = TAGBASE[k]; });
    A.posts.forEach(function (p) { (p.text.match(/#(\w+)/g) || []).forEach(function (t) { t = t.slice(1); c[t] = (c[t] || 0) + 1 + (p.mine ? 0 : 0); }); });
    return Object.keys(c).map(function (k) { return [k, c[k]]; }).sort(function (a, b) { return b[1] - a[1]; }).slice(0, 6);
  }
  function followHTML(h) {
    var u = U[h], on = !!A.follows[h];
    return '<div class="wtf">' + avatar(u) + '<div class="wn"><b>' + esc(u.name) + "</b><small>@" + h + '</small></div><button type="button" class="pill' + (on ? "" : " solid") + '" data-act="follow" data-h="' + h + '" aria-pressed="' + on + '">' + (on ? "Following" : "Follow") + "</button></div>";
  }
  function resultsHTML() {
    var q = A.q.trim().toLowerCase(), list;
    if (!q) list = A.posts.slice().sort(function (a, b) { return b.likes - a.likes; }).slice(0, 4);
    else list = A.posts.filter(function (p) { return p.text.toLowerCase().indexOf(q) >= 0 || who(p.u).name.toLowerCase().indexOf(q) >= 0; });
    var head = '<div class="pad" style="padding-bottom:0"><h3 class="sub">' + (q ? list.length + " result" + (list.length === 1 ? "" : "s") : "Popular") + "</h3></div>";
    return head + (list.length ? list.map(function (p) { return postHTML(p); }).join("") : '<p class="empty">No posts match “' + esc(A.q) + "”.</p>");
  }
  function chipsHTML() {
    return trending().map(function (t) { var tag = "#" + t[0]; return '<button type="button" class="chip' + (A.q.toLowerCase() === tag.toLowerCase() ? " on" : "") + '" data-act="tag" data-tag="' + tag + '">' + tag + "</button>"; }).join("");
  }
  function exploreHTML() {
    return '<div class="vhead"><h2>Explore</h2></div><div class="pad"><input id="q" class="field" type="search" placeholder="Search murmur" aria-label="Search posts" autocomplete="off" value="' + esc(A.q) + '"></div>' +
      '<div class="chips" id="chips">' + chipsHTML() + '</div><div id="results">' + resultsHTML() + '</div>' +
      '<div class="sect"><h3>Who to follow</h3>' + ["lee", "ravi", "sam"].map(followHTML).join("") + "</div>";
  }
  function notifsHTML() {
    return '<div class="vhead"><h2>Notifications</h2></div>' + (A.notifs.length ? A.notifs.map(function (n, i) {
      return '<div class="notif' + (n.fresh ? " fresh" : "") + '"><span class="ni ni-' + n.i + '">' + ic(n.i) + "</span><div><p>" + esc(n.t) + "</p><small>" + ago(n.ts) + "</small></div></div>";
    }).join("") : '<p class="empty">Nothing yet. Post, reply or follow someone.</p>');
  }
  function bubblesHTML(h) {
    return A.chats[h].map(function (m) { return '<div class="bub' + (m.f === "me" ? " me" : "") + '">' + esc(m.t) + "</div>"; }).join("") +
      (A.chatTyping === h ? '<div class="bub" aria-label="' + esc(first(U[h].name)) + ' is typing"><span class="typing"><i></i><i></i><i></i></span></div>' : "");
  }
  function msgsHTML() {
    if (!A.chat) {
      return '<div class="vhead"><h2>Messages</h2></div>' + Object.keys(A.chats).map(function (h) {
        var u = U[h], last = A.chats[h][A.chats[h].length - 1];
        return '<button type="button" class="chatrow" data-act="chat" data-h="' + h + '">' + avatar(u) + '<span class="wn"><b>' + esc(u.name) + "</b><small>" + (last.f === "me" ? "You: " : "") + esc(last.t) + "</small></span>" + (A.chatUnread[h] ? '<span class="dot" aria-label="unread"></span>' : "") + "</button>";
      }).join("");
    }
    var u = U[A.chat];
    return '<div class="chat"><div class="chead"><button type="button" class="iconbtn" data-act="chat-back" aria-label="Back to messages" style="color:inherit">' + ic("back") + "</button>" + avatar(u) + "<b>" + esc(u.name) + "</b></div>" +
      '<div class="bubbles" id="bubbles">' + bubblesHTML(A.chat) + "</div>" +
      '<form class="mform" data-form="msg"><input class="field" id="min" maxlength="200" placeholder="Message ' + esc(first(u.name)) + '…" aria-label="Message" autocomplete="off"><button class="pill solid" type="submit">Send</button></form></div>';
  }
  var SWATCH = ["#141822", "#ff3d6e", "#4b5bff", "#0ca678", "#f08c00", "#7048e8"];
  function profileHTML() {
    var mine = A.posts.filter(function (p) { return p.mine; });
    var following = 87 + Object.keys(A.follows).filter(function (k) { return A.follows[k]; }).length;
    var me = A.editing ? { name: A.me.name, color: A.editColor } : A.me;
    return '<div class="cover"></div><div class="prof"><div class="top"><span id="pav">' + avatar(me, "xl") + "</span>" +
      (A.editing ? "" : '<button type="button" class="pill" data-act="edit">Edit profile</button>') + "</div>" +
      "<h3>" + esc(A.me.name) + '</h3><div class="hd">@' + esc(A.me.handle) + "</div>" +
      '<div class="stats"><span><b>' + mine.length + "</b> post" + (mine.length === 1 ? "" : "s") + "</span><span><b>" + following + "</b> following</span><span><b>" + (128 + A.followBacks) + "</b> followers</span></div>" +
      (A.editing ? '<div class="edit"><label for="pname">Display name</label><input id="pname" class="field" maxlength="24" value="' + esc(A.me.name) + '" autocomplete="off">' +
        '<label>Avatar colour</label><div class="swatches">' + SWATCH.map(function (c) { return '<button type="button" class="sw' + (c === A.editColor ? " on" : "") + '" data-act="swatch" data-c="' + c + '" style="background:' + c + '" aria-label="Colour ' + c + '"></button>'; }).join("") + "</div>" +
        '<div class="row"><button type="button" class="pill" data-act="cancel-edit">Cancel</button><button type="button" class="pill solid" data-act="save-profile">Save</button></div></div>' : "") +
      "</div>" + (mine.length ? mine.map(function (p) { return postHTML(p); }).join("") : '<p class="empty">No posts yet. Say hi on Home.</p>');
  }
  var TABS = [["home", "home", "Home"], ["explore", "search", "Explore"], ["notifs", "bell", "Notifications"], ["messages", "mail", "Messages"], ["profile", "user", "Profile"]];
  function navHTML(withLabels) {
    return TABS.map(function (t) {
      return '<button type="button" class="navb" data-act="tab" data-tab="' + t[0] + '" aria-label="' + t[2] + '">' + ic(t[1]) + (withLabels ? "<span>" + t[2] + "</span>" : "") +
        (t[0] === "notifs" ? '<span class="bdg" data-badge="notifs" hidden></span>' : t[0] === "messages" ? '<span class="bdg" data-badge="msgs" hidden></span>' : "") + "</button>";
    }).join("");
  }
  function themeBtn(lbl) { var d = A.theme === "dark"; return '<button type="button" class="' + (lbl ? "navb" : "iconbtn") + '" data-act="theme" aria-label="' + (d ? "Switch to light mode" : "Switch to dark mode") + '">' + ic(d ? "sun" : "moon") + (lbl ? "<span>" + (d ? "Light mode" : "Dark mode") + "</span>" : "") + "</button>"; }
  function renderChrome() {
    $("#side").innerHTML = '<div class="logo">murm<b>u</b>r</div>' + navHTML(true) + '<button type="button" class="bigpost" data-act="compose-focus">Post</button><div class="spacer"></div>' + themeBtn(true);
    $("#mtop").innerHTML = '<div class="logo">murm<b>u</b>r</div>' + themeBtn(false);
    $("#tabbar").innerHTML = navHTML(false);
    appw.dataset.theme = A.theme;
    updateNav();
  }
  function renderRail() {
    $("#rail").innerHTML = "<h3>Trending</h3>" + trending().slice(0, 4).map(function (t) { return '<button type="button" class="trend" data-act="tag" data-tag="#' + t[0] + '"><b>#' + t[0] + "</b><small>" + fmt(t[1]) + " posts</small></button>"; }).join("") +
      "<h3>Who to follow</h3>" + ["lee", "ravi", "sam"].map(followHTML).join("");
  }
  function updateNav() {
    [].forEach.call(document.querySelectorAll("[data-tab]"), function (b) { var on = b.dataset.tab === A.tab; b.classList.toggle("on", on); if (on) b.setAttribute("aria-current", "page"); else b.removeAttribute("aria-current"); });
    var m = 0; Object.keys(A.chatUnread).forEach(function (k) { m += A.chatUnread[k]; });
    [].forEach.call(document.querySelectorAll("[data-badge]"), function (b) { var v = b.dataset.badge === "notifs" ? A.unread : m; b.textContent = v; b.hidden = !v; });
    $("#urlpath").textContent = "murmur.app/" + (A.tab === "notifs" ? "notifications" : A.tab === "messages" && A.chat ? "messages/" + A.chat : A.tab);
  }
  function renderView() {
    var html = A.tab === "home" ? homeHTML() : A.tab === "explore" ? exploreHTML() : A.tab === "notifs" ? notifsHTML() : A.tab === "messages" ? msgsHTML() : profileHTML();
    view.classList.toggle("chatmode", A.tab === "messages" && !!A.chat);
    view.innerHTML = html;
    view.scrollTop = A.scroll[A.tab] || 0;
    if (A.tab === "home") { var c = $("#cmp"); c.value = A.draft; counter(); }
    if (A.tab === "messages" && A.chat) { var bb = $("#bubbles"); bb.scrollTop = bb.scrollHeight; }
    A.notifs.forEach(function (n) { n.fresh = false; });
    updateNav();
  }
  function goTab(t) {
    A.scroll[A.tab] = view.scrollTop;
    if (t === A.tab && t === "home") { A.scroll.home = 0; view.scrollTo({ top: 0, behavior: REDUCE ? "auto" : "smooth" }); return; }
    A.tab = t; A.editing = false;
    if (t === "notifs") A.unread = 0;
    if (t !== "messages") A.chat = null;
    renderView();
  }

  /* ----- small feedback helpers ----- */
  function toast(t) { toastEl.textContent = t; toastEl.classList.add("show"); clearTimeout(toast.h); toast.h = setTimeout(function () { toastEl.classList.remove("show"); }, 2100); }
  function bumpEl(el, v) { if (!el) return; el.textContent = fmt(v); el.classList.remove("tick"); void el.offsetWidth; el.classList.add("tick"); }
  function syncCounts(p) {
    [].forEach.call(document.querySelectorAll('.post[data-id="' + p.id + '"]'), function (card) {
      var l = $(".like", card), r = $(".rp", card), b = $(".bm", card);
      l.classList.toggle("on", !!p.liked); l.setAttribute("aria-pressed", !!p.liked); bumpEl($(".n", l), p.likes);
      r.classList.toggle("on", !!p.rp); r.setAttribute("aria-pressed", !!p.rp); $(".n", r).textContent = fmt(p.reposts);
      b.classList.toggle("on", !!p.bm); b.setAttribute("aria-pressed", !!p.bm);
    });
  }
  function burst(btn) {
    if (REDUCE) return;
    btn.classList.remove("pop"); void btn.offsetWidth; btn.classList.add("pop");
    for (var i = 0; i < 7; i++) { var s = document.createElement("i"); s.className = "spark"; s.style.setProperty("--r", (i * 360 / 7) + "deg"); btn.appendChild(s); }
    setTimeout(function () { [].forEach.call(btn.querySelectorAll(".spark"), function (s) { s.remove(); }); }, 650);
  }
  function notify(t, i) {
    A.notifs.unshift({ i: i, t: t, ts: Date.now(), fresh: true });
    if (A.notifs.length > 40) A.notifs.pop();
    if (A.tab === "notifs" && mode === "play") renderView(); else A.unread++;
    updateNav();
    if (!A.typing && mode === "play") toast(t);
  }
  function rerenderPost(id) {
    var p = byId(id);
    [].forEach.call(view.querySelectorAll('.post[data-id="' + id + '"]'), function (el) { el.outerHTML = postHTML(p); });
  }
  function counter() {
    var c = $("#cmp"); if (!c) return;
    var left = 280 - c.value.length, cnt = $("#cnt");
    cnt.textContent = left; cnt.classList.toggle("warn", left < 20 && left >= 0); cnt.classList.toggle("over", left < 0);
    $("#postbtn").disabled = !c.value.trim() || left < 0;
  }

  /* ----- actions ----- */
  function submitPost() {
    var c = $("#cmp"), text = c.value.trim();
    if (!text || text.length > 280) return;
    var p = { id: "m" + Date.now() + (seq++), u: "me", mine: true, text: text, ts: Date.now(), likes: 0, reposts: 0, rbase: 0, replies: [] };
    A.posts.unshift(p); A.draft = ""; c.value = ""; counter();
    $("#emo").hidden = true;
    $("#list").insertAdjacentHTML("afterbegin", postHTML(p, " new pending"));
    save(); renderRail();
    setTimeout(function () {
      var el = view.querySelector('.post[data-id="' + p.id + '"]'); if (el) el.classList.remove("pending");
      toast("Posted ✓");
    }, 550);
    setTimeout(function () { var f = pick(["ana", "mika", "jo"]); p.likes += rnd(1, 3); syncCounts(p); save(); notify(U[f].name + " liked your post", "heart"); }, 2600);
  }
  function sendMsg(input) {
    var h = A.chat, t = input.value.trim(); if (!t) return;
    A.chats[h].push({ f: "me", t: t }); input.value = "";
    var bb = $("#bubbles"); bb.innerHTML = bubblesHTML(h); bb.scrollTop = bb.scrollHeight;
    setTimeout(function () { A.chatTyping = h; refreshChat(h); }, 450);
    setTimeout(function () {
      A.chatTyping = null; A.chats[h].push({ f: h, t: pick(REPLIES[h]) });
      if (A.tab === "messages" && A.chat === h && mode === "play") refreshChat(h);
      else { A.chatUnread[h] = 1; updateNav(); toast(first(U[h].name) + " sent you a message"); }
    }, 1700);
  }
  function refreshChat(h) { if (A.tab === "messages" && A.chat === h) { var bb = $("#bubbles"); bb.innerHTML = bubblesHTML(h); bb.scrollTop = bb.scrollHeight; } }
  function makePoolPost() {
    var x = POOL[A.pool++ % POOL.length];
    return { id: "q" + Date.now() + (seq++), u: x[0], text: x[1], ts: Date.now(), likes: rnd(3, 240), reposts: rnd(0, 30), rbase: rnd(0, 20), replies: [] };
  }
  function updatePill() {
    var pl = $("#newpill"); if (!pl) return;
    var n = A.pending.length; pl.hidden = !n; pl.textContent = "↑ " + n + " new post" + (n === 1 ? "" : "s");
  }
  function showPending() {
    if (!A.pending.length) return;
    var add = A.pending.slice().reverse(); A.pending = [];
    A.posts = add.concat(A.posts);
    if (A.tab === "home") { $("#list").insertAdjacentHTML("afterbegin", add.map(function (p) { return postHTML(p, " new"); }).join("")); view.scrollTo({ top: 0, behavior: REDUCE ? "auto" : "smooth" }); }
    updatePill(); renderRail();
  }
  function loadMore() {
    var more = $("#more"); if (!more || A.loading) return;
    if (A.posts.length >= 40) { more.innerHTML = '<p class="end">You’re all caught up ✓</p>'; return; }
    A.loading = true; more.innerHTML = skelHTML() + skelHTML();
    setTimeout(function () {
      var add = [makePoolPost(), makePoolPost(), makePoolPost()];
      add.forEach(function (p, i) { p.ts = Date.now() - (300 + A.posts.length * 40 + i * 20) * 60e3; });
      A.posts = A.posts.concat(add);
      if (A.tab === "home" && $("#list")) { $("#list").insertAdjacentHTML("beforeend", add.map(function (p) { return postHTML(p); }).join("")); $("#more").innerHTML = ""; }
      A.loading = false;
    }, REDUCE ? 150 : 750);
  }

  /* ----- stories ----- */
  var SV = null;
  function openStory(i) {
    closeStory();
    var el = document.createElement("div"); el.className = "sv"; el.setAttribute("role", "dialog"); el.setAttribute("aria-label", "Story");
    appw.appendChild(el);
    SV = { i: i, s: 0, t0: performance.now(), el: el, raf: 0 };
    drawStory(); SV.raf = requestAnimationFrame(storyLoop);
  }
  function drawStory() {
    var h = ORDER[SV.i], u = U[h], sl = STORIES[h];
    A.seen[h] = true;
    SV.el.innerHTML = '<div class="card"><div class="slide" style="background:' + sl[SV.s][0] + '">' + esc(sl[SV.s][1]) + "</div>" +
      '<div class="bars">' + sl.map(function (_, k) { return "<span><i" + (k < SV.s ? ' style="width:100%"' : "") + "></i></span>"; }).join("") + "</div>" +
      '<div class="head">' + avatar(u, "sm") + "<b>" + esc(u.name) + '</b><button type="button" class="x" data-act="story-close" aria-label="Close story">' + ic("close") + "</button></div>" +
      '<button type="button" class="zone zl" data-act="story-prev" aria-label="Previous"></button><button type="button" class="zone zr" data-act="story-next" aria-label="Next"></button>' +
      '<div class="tip">Tap left or right · Esc to close</div></div>';
    SV.bar = SV.el.querySelectorAll(".bars i")[SV.s];
  }
  function storyLoop(now) {
    if (!SV) return;
    var t = (now - SV.t0) / 3800;
    SV.bar.style.width = Math.min(100, t * 100) + "%";
    if (t >= 1) storyStep(1);
    if (SV) SV.raf = requestAnimationFrame(storyLoop);
  }
  function storyStep(d) {
    var sl = STORIES[ORDER[SV.i]];
    SV.s += d;
    if (SV.s >= sl.length) { SV.i++; SV.s = 0; if (SV.i >= ORDER.length) { closeStory(); return; } }
    if (SV.s < 0) { if (SV.i > 0) { SV.i--; SV.s = 0; } else SV.s = 0; }
    SV.t0 = performance.now(); drawStory();
  }
  function closeStory() {
    if (!SV) return;
    cancelAnimationFrame(SV.raf); SV.el.remove(); SV = null;
    if (A.tab === "home") { var st = $(".stories", view); if (st) st.outerHTML = storiesHTML(); }
  }

  /* ----- events ----- */
  appw.addEventListener("click", function (e) {
    var b = e.target.closest("[data-act]"); if (!b || !appw.contains(b)) return;
    var act = b.dataset.act, card = b.closest(".post"), p = card ? byId(card.dataset.id) : null;
    switch (act) {
      case "tab": goTab(b.dataset.tab); break;
      case "like":
        p.liked = !p.liked; p.likes += p.liked ? 1 : -1; A.lastLike = p.id;
        syncCounts(p); if (p.liked) burst(b);
        if (p.mine) save();
        break;
      case "reply":
        A.open[p.id] = !A.open[p.id]; rerenderPost(p.id);
        if (A.open[p.id]) { var inp = view.querySelector('.post[data-id="' + p.id + '"] .rin'); if (inp) inp.focus(); }
        break;
      case "repost": p.rp = !p.rp; p.reposts += p.rp ? 1 : -1; syncCounts(p); toast(p.rp ? "Reposted" : "Repost removed"); break;
      case "bookmark": p.bm = !p.bm; syncCounts(p); toast(p.bm ? "Saved to bookmarks" : "Removed from bookmarks"); break;
      case "share":
        var link = "https://murmur.app/p/" + p.id;
        try { navigator.clipboard.writeText(link).then(function () { toast("Link copied"); }, function () { toast("Link: murmur.app/p/" + p.id); }); }
        catch (err) { toast("Link: murmur.app/p/" + p.id); }
        break;
      case "tag": A.q = b.dataset.tag; if (A.tab !== "explore") goTab("explore"); else { $("#q").value = A.q; $("#results").innerHTML = resultsHTML(); $("#chips").innerHTML = chipsHTML(); } break;
      case "story": openStory(+b.dataset.i); break;
      case "story-next": storyStep(1); break;
      case "story-prev": storyStep(-1); break;
      case "story-close": closeStory(); break;
      case "follow":
        var h = b.dataset.h; A.follows[h] = !A.follows[h]; save();
        [].forEach.call(document.querySelectorAll('[data-act="follow"][data-h="' + h + '"]'), function (x) { var on = A.follows[h]; x.textContent = on ? "Following" : "Follow"; x.classList.toggle("solid", !on); x.setAttribute("aria-pressed", on); });
        if (A.follows[h]) { toast("Following " + U[h].name); setTimeout(function () { if (A.follows[h]) { A.followBacks++; notify(U[h].name + " followed you back", "user"); } }, 1800); }
        break;
      case "theme": A.theme = A.theme === "dark" ? "light" : "dark"; save(); renderChrome(); break;
      case "emoji": var em = $("#emo"); em.hidden = !em.hidden; b.setAttribute("aria-expanded", !em.hidden); break;
      case "emo":
        var c = $("#cmp"), s0 = c.selectionStart == null ? c.value.length : c.selectionStart, s1 = c.selectionEnd == null ? s0 : c.selectionEnd;
        c.value = c.value.slice(0, s0) + b.dataset.e + c.value.slice(s1); A.draft = c.value; counter();
        c.focus(); c.selectionStart = c.selectionEnd = s0 + b.dataset.e.length;
        break;
      case "post": submitPost(); break;
      case "newpill": showPending(); break;
      case "compose-focus": if (A.tab !== "home") goTab("home"); view.scrollTop = 0; $("#cmp").focus(); break;
      case "chat": A.chat = b.dataset.h; A.chatUnread[A.chat] = 0; renderView(); $("#min").focus(); break;
      case "chat-back": A.chat = null; renderView(); break;
      case "edit": A.editing = true; A.editColor = A.me.color; renderView(); $("#pname").focus(); break;
      case "swatch":
        A.editColor = b.dataset.c;
        [].forEach.call(view.querySelectorAll(".sw"), function (x) { x.classList.toggle("on", x === b); });
        $("#pav").innerHTML = avatar({ name: $("#pname").value || A.me.name, color: A.editColor }, "xl");
        break;
      case "cancel-edit": A.editing = false; renderView(); break;
      case "save-profile":
        A.me.name = ($("#pname").value.trim() || "You").slice(0, 24); A.me.color = A.editColor; A.editing = false;
        save(); renderView(); toast("Profile saved");
        break;
    }
  });
  appw.addEventListener("submit", function (e) {
    e.preventDefault();
    var f = e.target;
    if (f.dataset.form === "reply") {
      var card = f.closest(".post"), p = byId(card.dataset.id), inp = $(".rin", f), t = inp.value.trim();
      if (!t) return;
      p.replies.push({ u: "me", text: t }); if (p.mine) save();
      rerenderPost(p.id);
      var ni = view.querySelector('.post[data-id="' + p.id + '"] .rin'); if (ni) ni.focus();
      toast("Reply sent");
      if (!p.mine) setTimeout(function () { notify(who(p.u).name + " liked your reply", "heart"); }, 2200);
    } else if (f.dataset.form === "msg") sendMsg($("#min"));
  });
  appw.addEventListener("input", function (e) {
    var t = e.target;
    if (t.id === "cmp") { A.draft = t.value; counter(); }
    else if (t.id === "q") { A.q = t.value; $("#results").innerHTML = resultsHTML(); $("#chips").innerHTML = chipsHTML(); }
    else if (t.id === "pname") $("#pav").innerHTML = avatar({ name: t.value || A.me.name, color: A.editColor }, "xl");
  });
  appw.addEventListener("keydown", function (e) {
    if (e.target.id === "cmp" && e.key === "Enter" && (e.metaKey || e.ctrlKey)) { e.preventDefault(); submitPost(); }
  });
  appw.addEventListener("focusin", function (e) { if (e.target.matches("input, textarea")) A.typing = true; });
  appw.addEventListener("focusout", function (e) { if (e.target.matches("input, textarea")) A.typing = false; });
  view.addEventListener("scroll", function () {
    if (A.tab === "home" && view.scrollTop + view.clientHeight > view.scrollHeight - 180) loadMore();
  }, { passive: true });
  // pull-to-refresh on touch
  var ptrY = null, ptrD = 0;
  view.addEventListener("touchstart", function (e) { ptrY = A.tab === "home" && view.scrollTop <= 0 ? e.touches[0].clientY : null; ptrD = 0; }, { passive: true });
  view.addEventListener("touchmove", function (e) {
    if (ptrY == null) return;
    ptrD = e.touches[0].clientY - ptrY; var el = $("#ptr"); if (!el) return;
    el.style.height = clamp(ptrD * .5, 0, 56) + "px"; el.textContent = ptrD > 90 ? "Release to refresh" : "Pull to refresh";
  }, { passive: true });
  view.addEventListener("touchend", function () {
    var el = $("#ptr"); if (el) el.style.height = "0";
    if (ptrY != null && ptrD > 90) { if (!A.pending.length) A.pending.push(makePoolPost()); showPending(); toast("Feed refreshed"); }
    ptrY = null; ptrD = 0;
  });
  document.addEventListener("click", function (e) {
    var em = $("#emo"); if (em && !em.hidden && !e.target.closest("#emo,[data-act=emoji]")) em.hidden = true;
  });

  /* ----- ambient life (paused while typing, during the dive, or in a hidden tab) ----- */
  var tickN = 0;
  setInterval(function () {
    if (mode !== "play" || A.typing || document.hidden) return;
    tickN++;
    var cards = [].filter.call(view.querySelectorAll(".post"), function (c) { var p = byId(c.dataset.id); return p && !p.mine; });
    if (cards.length) { var p = byId(pick(cards).dataset.id); p.likes += rnd(1, 3); bumpEl($('.post[data-id="' + p.id + '"] .like .n', view), p.likes); }
    if (tickN % 10 === 0 && A.pending.length < 9) { A.pending.push(makePoolPost()); updatePill(); }
    if (tickN % 17 === 0) {
      var mine = A.posts.filter(function (x) { return x.mine; });
      if (mine.length) { var m = pick(mine); m.likes += 1; syncCounts(m); save(); notify(pick([U.lee, U.ravi, U.sam]).name + " liked your post", "heart"); }
      else if (tickN % 34 === 0) notify(pick([U.lee, U.ravi]).name + " reposted Mika’s launch", "repost");
    }
  }, 1000);

  load();
  renderChrome(); renderRail(); renderView();
