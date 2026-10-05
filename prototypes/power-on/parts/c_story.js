// ================= STORY =================
var ERAS = [
  { n: 1, yr: "1989", span: "1989 – 1993", name: "The document web", title: "Chapter 1 · CERN",
    beats: [
      { t: "March 1989. A physics lab under the Swiss–French border.", p: "ph-cern" },
      { t: "Thousands of scientists. Their documents sit on machines that can't talk.", p: "ph-cern" },
      { t: "<em>Tim Berners-Lee</em> writes a memo: “Information Management: A Proposal”.", p: "p-tbl" },
      { t: "His boss, Mike Sendall, scribbles on it: <em>“Vague but exciting…”</em>", p: "ph-memo" },
      { t: "Christmas 1990. A server and a browser called WorldWideWeb are running.", p: "c-html" },
      { t: "Three ideas: <em>HTML</em> to write pages, <em>HTTP</em> to fetch them, <em>URLs</em> to find them.", p: "c-html" },
      { t: "The whole web lives on one NeXTcube, on Tim's desk.", p: "dg1" },
      { s: 1, t: "Taped to the front: a warning. Go on, peel it back.", p: "w-sticker" },
      { t: "Few can run that browser. <em>Nicola Pellow</em> writes a line-mode browser for any terminal.", p: "p-pellow" },
      { t: "Try it. Type a number. Press Enter.", p: "w-term" },
      { t: "6 August 1991. Tim posts it to the alt.hypertext newsgroup. Anyone can join.", p: "ph-usenet" },
      { s: 1, t: "Cambridge, 1991. The Trojan Room coffee pot is a long walk away. So they point a camera at it.", p: "w-coffee" },
      { s: 1, t: "Not video. A tiny grey photo, about three times a minute. Empty? Stay put.", p: "w-coffee" },
      { t: "30 April 1993. CERN makes the web free for all. <em>No fees. No patents.</em>", p: "ph-pd" },
      { s: 1, t: "1993: the pot goes on the web. Reload to see the latest photo.", p: "w-coffee" }
    ] },
  { n: 2, yr: "1995", span: "1993 – 2000", name: "The homepage web", title: "Chapter 2 · Homepages",
    beats: [
      { t: "1993, NCSA. <em>Marc Andreessen</em> and Eric Bina release Mosaic. Pictures appear inline.", p: "p-andreessen" },
      { t: "Everybody wants a homepage. First, get online.", p: "w-modem" },
      { t: "That screech is two modems shaking hands. At 28.8k, 100 KB takes <em>28 seconds</em>.", p: "w-slow" },
      { t: "Pages are files. To answer you, the server runs a program: <em>CGI</em>.", p: "c-cgi" },
      { t: "Every click: a new process, a full reload. Nobody minds. It's magic.", p: "c-cgi" },
      { t: "1995. <em>Rasmus Lerdorf</em> writes PHP to see who reads his résumé.", p: "p-lerdorf" },
      { t: "Spring 1995. Netscape hires <em>Brendan Eich</em> to build a browser language. Fast.", p: "p-eich" },
      { s: 1, t: "He writes it in about <em>ten days</em>. Mocha, then LiveScript, then JavaScript.", p: "w-tenday" },
      { t: "Netscape versus Internet Explorer. The browser wars begin. Each invents its own tags.", p: "ph-wars" },
      { t: "1996. <em>Håkon Wium Lie</em>'s CSS arrives. We keep using &lt;table&gt; and &lt;font&gt;.", p: "c-font" },
      { t: "Where does a site live? A beige tower in the office closet.", p: "dg2" },
      { t: "A GeoCities page, a webring, a hit counter. Sign the guestbook.", p: "w-guest" },
      { t: "Y2K passes quietly. Then the dot-com bubble pops. Many companies don't survive.", p: "ph-crash" }
    ] },
  { n: 3, yr: "2005", span: "2004 – 2009", name: "Web 2.0", title: "Chapter 3 · Web 2.0",
    beats: [
      { s: 1, t: "1 April 2004. Gmail launches with <em>1 GB</em> free. Rivals offer a few MB. A joke?", p: "w-gmail" },
      { t: "Mail opens without reloading, thanks to <em>XMLHttpRequest</em>. Microsoft added it in 1999.", p: "c-xhr" },
      { t: "2005. <em>Jesse James Garrett</em> names the trick Ajax. It powers Web 2.0.", p: "p-garrett" },
      { t: "Google Maps lets you drag the planet around. Go on, grab it.", p: "w-map" },
      { t: "Browsers disagree on everything. 2006: <em>John Resig</em>'s jQuery hides the mess.", p: "p-resig" },
      { t: "Everyone has a blog. Vote on a story: it re-sorts, no reload.", p: "w-vote" },
      { t: "<em>Ruby on Rails</em> and Django make a database-backed site a weekend project.", p: "p-dhh" },
      { t: "Sites live in rented racks: a load balancer, some servers, one big MySQL.", p: "dg3" },
      { t: "2006. AWS rents servers by the hour. <em>Stop buying hardware.</em>", p: "ph-aws" },
      { t: "2007. The iPhone ships a real browser. No Flash. Screens get small.", p: "ph-phone" }
    ] },
  { n: 4, yr: "2013", span: "2009 – 2016", name: "The app web", title: "Chapter 4 · Apps in the browser",
    beats: [
      { t: "2009. <em>Ryan Dahl</em> puts V8 on the server: Node.js. JavaScript runs everywhere.", p: "p-dahl" },
      { s: 1, t: "2016. An 11-line npm package, <em>left-pad</em>, is unpublished. Builds break worldwide.", p: "w-npm" },
      { t: "Apps move into the browser: Backbone, AngularJS, then React.", p: "p-walke" },
      { s: 1, t: "JSConf US, 2013. React debuts and lots of developers hate it. HTML inside JavaScript?", p: "w-jsx" },
      { t: "The server sends a nearly empty page. The browser builds the rest.", p: "w-blank" },
      { t: "Fast once running. <em>Slow to start.</em> Hard for search engines to read.", p: "w-blank" },
      { t: "2014. <em>Evan You</em> releases Vue, a lighter take on the idea.", p: "p-you" },
      { t: "Code sits on a CDN. The API sits on Heroku. Deploy with <em>git push</em>.", p: "dg4" },
      { t: "Design goes flat and responsive. One layout, phone to desktop.", p: "ph-flat" },
      { t: "Everything is a feed, and the feed never ends. Try it.", p: "w-feed" },
      { t: "2013: Docker makes servers disposable. 2014: Lambda makes them <em>invisible</em>.", p: "ph-boxes" }
    ] },
  { n: 5, yr: "today", span: "2016 – today", name: "The edge web", title: "Chapter 5 · Everywhere",
    beats: [
      { t: "2016. <em>Guillermo Rauch</em>'s team releases Next.js. React renders on the server again.", p: "p-rauch" },
      { t: "The pendulum swings back between <em>server</em> and <em>browser</em>.", p: "w-pend" },
      { t: "Static sites return too, pre-built on a CDN. Call it the JAMstack.", p: "ph-jam" },
      { t: "<em>Rich Harris</em> asks: what if the framework compiled itself away? Svelte.", p: "p-harris" },
      { s: 1, t: "28 February 2017. An engineer debugging S3 in us-east-1 mistypes one command.", p: "w-outage" },
      { s: 1, t: "For four hours much of the web can't load files. The status page can't even show red.", p: "w-outage" },
      { t: "Now the server sends the shell first and streams the rest <em>as it's ready</em>.", p: "w-stream" },
      { t: "Some components run only on the server, talking straight to the database.", p: "c-rsc" },
      { t: "Where does it live? Everywhere. Edge functions run milliseconds from you…", p: "dg5" },
      { t: "…but the data still lives in one place. Light only travels so fast.", p: "dg5" },
      { t: "Today's stack: TypeScript, Vite, and often one monorepo for everything.", p: "ph-stack" },
      { t: "Shipping is one command. Go on, push to production.", p: "w-deploy" }
    ] }
];
var TRANS = [
  { from: "1993", to: "1995", cap: "Meanwhile, the web leaves the lab" },
  { from: "2000", to: "2004", cap: "After the crash, the comeback" },
  { from: "2007", to: "2010", cap: "The browser becomes the app" },
  { from: "2016", to: "now", cap: "Back to the server, but everywhere" }
];

var PEOPLE = {
  "p-tbl": { name: "Tim Berners-Lee", role: "Software engineer, CERN", yrs: "b. 1955", ini: "TB",
    facts: ["Built the first browser, server and HTML in 1990.", "Fun fact: he never patented any of it."] },
  "p-pellow": { name: "Nicola Pellow", role: "Maths student on placement at CERN", yrs: "1990 – 1991", ini: "NP",
    facts: ["Wrote the line-mode browser that ran on any terminal.", "Fun fact: she was a maths student on placement."] },
  "p-andreessen": { name: "Marc Andreessen", role: "Student programmer, NCSA", yrs: "Mosaic, 1993", ini: "MA",
    facts: ["Co-wrote Mosaic, then co-founded Netscape.", "Fun fact: he was 22 at Netscape's launch."] },
  "p-lerdorf": { name: "Rasmus Lerdorf", role: "Danish-Canadian programmer", yrs: "PHP, 1995", ini: "RL",
    facts: ["Released Personal Home Page Tools in 1995.", "Fun fact: he says he never meant to make a language."] },
  "p-eich": { name: "Brendan Eich", role: "Engineer, Netscape", yrs: "JavaScript, 1995", ini: "BE",
    facts: ["Wrote JavaScript's first version in about ten days.", "Fun fact: it was called Mocha first."] },
  "p-garrett": { name: "Jesse James Garrett", role: "User-experience designer", yrs: "“Ajax”, 2005", ini: "JG",
    facts: ["Named Ajax in a February 2005 essay.", "Fun fact: the technique was older. The name made it spread."] },
  "p-resig": { name: "John Resig", role: "Developer", yrs: "jQuery, 2006", ini: "JR",
    facts: ["Released jQuery in January 2006.", "Fun fact: motto, “write less, do more”."] },
  "p-dhh": { name: "David Heinemeier Hansson", role: "Programmer, Denmark", yrs: "Rails, 2004", ini: "DH",
    facts: ["Created Ruby on Rails.", "Fun fact: his 2005 “blog in 15 minutes” video went viral."] },
  "p-dahl": { name: "Ryan Dahl", role: "Programmer", yrs: "Node.js, 2009", ini: "RD",
    facts: ["Presented Node.js at JSConf EU, 2009.", "Fun fact: he later made Deno to fix his regrets."] },
  "p-walke": { name: "Jordan Walke", role: "Engineer, Facebook", yrs: "React, 2013", ini: "JW",
    facts: ["Built React's first prototype.", "Fun fact: its early name was FaxJS."] },
  "p-you": { name: "Evan You", role: "Independent developer", yrs: "Vue, 2014", ini: "EY",
    facts: ["Released Vue in February 2014.", "Fun fact: he later made Vite too."] },
  "p-rauch": { name: "Guillermo Rauch", role: "Founder", yrs: "Next.js, 2016", ini: "GR",
    facts: ["His team released Next.js in October 2016.", "Fun fact: he also created Socket.IO."] },
  "p-harris": { name: "Rich Harris", role: "Graphics editor, newsroom", yrs: "Svelte, 2016", ini: "RH",
    facts: ["Created Svelte in 2016.", "Fun fact: he built it for newsroom graphics."] }
};

var CODE = {
  "c-html": { file: "WorldWideWeb · hypertext.html", cls: "next", src:
'<TITLE>The World Wide Web project</TITLE>\n<NEXTID N="55">\n<H1>World Wide Web</H1>\nThe WorldWideWeb (W3) is a wide-area\n<A NAME=0 HREF="WhatIs.html">hypermedia</A>\ninformation retrieval initiative aiming\nto give universal access to a large\nuniverse of documents.\n\n<A HREF="Summary.html">Executive summary</A>\n<A HREF="People.html">People</A>' },
  "c-cgi": { file: "guestbook.cgi", src:
'#!/usr/bin/perl\n# runs once for EVERY request\nprint "Content-type: text/html\\n\\n";\n\nopen(LOG, "visitors.txt");\n@lines = <LOG>;\n$count = scalar(@lines) + 1;\n\nprint "<html><body bgcolor=#000033>";\nprint "<font color=yellow>";\nprint "You are visitor #$count!";\nprint "</font></body></html>";' },
  "c-font": { file: "index.htm  vs  style.css", src:
'<!-- what we wrote -->\n<table width=600 border=0><tr><td>\n<center><font face="Comic Sans MS"\n  color="#FF00FF" size=5>\n  <b>Welcome 2 my page!!</b>\n</font></center>\n</td></tr></table>\n\n/* what CSS1 hoped for (1996) */\nh1 { color: fuchsia; text-align: center }' },
  "c-xhr": { file: "inbox.js", src:
'var xhr = window.XMLHttpRequest\n  ? new XMLHttpRequest()\n  : new ActiveXObject("Microsoft.XMLHTTP");\n\nxhr.open("GET", "/mail/inbox?since=" + last, true);\nxhr.onreadystatechange = function () {\n  if (xhr.readyState == 4 && xhr.status == 200) {\n    document.getElementById("inbox")\n      .innerHTML = xhr.responseText;   // no reload!\n  }\n};\nxhr.send(null);' },
  "c-rsc": { file: "app/page.tsx", src:
'// Runs on the server. Ships zero JS for this part.\nexport default async function Page() {\n  const posts = await db.post.findMany({ take: 10 });\n\n  return (\n    <main>\n      <h1>Latest posts</h1>\n      <Suspense fallback={<Skeleton />}>\n        <Comments />   {/* streams in when ready */}\n      </Suspense>\n      {posts.map(p => <Post key={p.id} {...p} />)}\n    </main>\n  );\n}' }
};
