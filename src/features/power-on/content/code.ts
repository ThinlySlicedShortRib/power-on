// Code samples shown in code windows. Deliberately untranslated: they are period source code.
import type { CodeId } from "./eras";

export const CODE: Record<CodeId, { src: string; next?: true }> = {
  html: { next: true, src:
`<TITLE>The World Wide Web project</TITLE>
<NEXTID N="55">
<H1>World Wide Web</H1>
The WorldWideWeb (W3) is a wide-area
<A NAME=0 HREF="WhatIs.html">hypermedia</A>
information retrieval initiative aiming
to give universal access to a large
universe of documents.

<A HREF="Summary.html">Executive summary</A>
<A HREF="People.html">People</A>` },
  cgi: { src:
`#!/usr/bin/perl
# runs once for EVERY request
print "Content-type: text/html\\n\\n";

open(LOG, "visitors.txt");
@lines = <LOG>;
$count = scalar(@lines) + 1;

print "<html><body bgcolor=#000033>";
print "<font color=yellow>";
print "You are visitor #$count!";
print "</font></body></html>";` },
  font: { src:
`<!-- what we wrote -->
<table width=600 border=0><tr><td>
<center><font face="Comic Sans MS"
  color="#FF00FF" size=5>
  <b>Welcome 2 my page!!</b>
</font></center>
</td></tr></table>

/* what CSS1 hoped for (1996) */
h1 { color: fuchsia; text-align: center }` },
  xhr: { src:
`var xhr = window.XMLHttpRequest
  ? new XMLHttpRequest()
  : new ActiveXObject("Microsoft.XMLHTTP");

xhr.open("GET", "/mail/inbox?since=" + last, true);
xhr.onreadystatechange = function () {
  if (xhr.readyState == 4 && xhr.status == 200) {
    document.getElementById("inbox")
      .innerHTML = xhr.responseText;   // no reload!
  }
};
xhr.send(null);` },
  rsc: { src:
`// Runs on the server. Ships zero JS for this part.
export default async function Page() {
  const posts = await db.post.findMany({ take: 10 });

  return (
    <main>
      <h1>Latest posts</h1>
      <Suspense fallback={<Skeleton />}>
        <Comments />   {/* streams in when ready */}
      </Suspense>
      {posts.map(p => <Post key={p.id} {...p} />)}
    </main>
  );
}` },
};

export const JSX_SAMPLE = `var CommentBox = React.createClass({
  render: function() {
    return (
      <div className="commentBox">
        Hello, world! I am a CommentBox.
      </div>
    );
  }
});`;

export const BLANK_SRC = `<body>
  <div id="root"></div>   <!-- that is it -->
  <script src="bundle.js"></script>   <!-- 1.4 MB -->
</body>`;

export const GATE_RESPONSE = `HTTP/1.1 402 Payment Required
crawler-price: USD 0.01

# or, the old way, in robots.txt:
User-agent: SomeAIBot
Disallow: /`;

export const VIEWS_A11Y = `main
  heading "Fern & Kettle" level 1
  searchbox "Search teas"
  link "Cart, 0 items"
  list "Teas"
    listitem
      text "Sencha" · text "$12.00"
      button "Add to cart"
    listitem
      text "Assam" · text "$10.00"
      button "Add to cart"`;

export const VIEWS_TOOLS = `// registered by the page (WebMCP-style, simplified)
tools: [
  { name: "searchTeas",
    input: { query: "string", maxPrice: "number?" } },
  { name: "addToCart",
    input: { sku: "string", qty: "integer" } },
  { name: "checkout",
    note: "browser asks the user to confirm" }
]`;

export const VIEWS_LLMS = `# Fern & Kettle

> Small-batch loose-leaf tea shop. Ships in the EU and US.

## Docs
- [Catalog](/teas.md): every tea, price, stock
- [Shipping](/shipping.md): rates and times
- [Returns](/returns.md): 30 days, unopened`;

export const GENUI_DATA = `{ flight: "TP 1351", to: "LIS", dep: "07:40", gate: "B12", rain: 0.8 }`;

export const NPM_PACKAGES = ["is-odd", "is-even", "is-number", "left-pad", "kind-of", "isarray", "inherits", "ms", "debug", "once", "wrappy", "minimist", "mkdirp", "glob", "rimraf", "semver", "chalk", "lodash.merge", "core-util-is", "string_decoder"];

export const OUTAGE_CMD = "remove-capacity --subsystem s3-billing --servers ";
export const OUTAGE_TYPO = "a much bigger set";

export const MODEM_STEPS: [number, string, number][] = [
  [0, "ATDT 555-0142", 1], [1.25, "DIALING...", 2], [2.4, "RINGING", 3], [3.6, "ANSWER TONE 2100 Hz", 4],
  [4.8, "TRAINING...  V.34", 5], [6.2, "PROTOCOL: LAP-M / V.42BIS", 6], [7.9, "CONNECT 28800", 7],
];

export const DEPLOY_GIT = ["$ git push origin main", "Enumerating objects: 12, done."];
export const DEPLOY_URL = "https://my-app-git-main.example.app";

/** Haggle message metadata; text at story.widgets.haggle.m1..m8. Chips are machine payloads, kept verbatim. */
export const HAGGLE: { w: "you" | "shop" | "signed" | "notify"; ms?: number; chip?: string }[] = [
  { w: "you", ms: 0, chip: '{ party: 2, day: "Fri", budget: "€90", noise: "low" }' },
  { w: "shop", ms: 9, chip: '{ slot: "19:30", menu: "set", total: "€96" }' },
  { w: "you", ms: 14, chip: '{ visits: 7, competitor: "€84", proof: "signed" }' },
  { w: "shop", ms: 11 },
  { w: "you", ms: 8 },
  { w: "shop", ms: 12, chip: '{ offer: ["-10% before 18:00", "free dessert"] }' },
  { w: "you", ms: 6, chip: '{ pick: "-10%", total: "€86.40", window: true }' },
  { w: "shop", ms: 7 },
  { w: "signed" },
  { w: "notify" },
];
