// ================= GLOSSARY =================
// Order matters: longer / more specific terms first so "Server Components" wins over "server".
var GLOSS = [
  // --- v4: the future era
  ["a2a", "Agent2Agent (A2A)", "2025", "Google's open protocol for AI agents to find and message each other. Introduced April 2025, now at the Linux Foundation.", "agents haggling with agents|agent ↔ agent"],
  ["signedoffer", "Signed offer", "", "An offer both sides sign with keys, so the promise can be proved later. Illustrative; no standard yet.", "Signed offer"],
  ["pKarpathy", "Andrej Karpathy", "", "AI researcher, an OpenAI founding member and former head of AI at Tesla, who coined “vibe coding” in February 2025.", "Andrej Karpathy", "p"],
  ["pHoward", "Jeremy Howard", "", "Co-founder of fast.ai and Answer.AI, who proposed llms.txt in September 2024.", "Jeremy Howard", "p"],
  ["computeruse", "Computer use", "2024", "An AI model operating a computer: reading the screen, clicking, typing. Anthropic, public beta, October 2024.", "computer use|use a computer"],
  ["operator", "Operator", "2025", "OpenAI's browser-using agent, launched as a research preview on 23 January 2025.", "Operator"],
  ["webmcp", "WebMCP", "2026", "Proposed standard letting a page hand agents named tools to call. Early preview in Chrome 146, origin trial in 149.", "WebMCP"],
  ["mcp", "MCP", "2024", "Model Context Protocol: Anthropic's open standard (Nov 2024) for plugging AI models into tools and data.", "MCP|Model Context Protocol"],
  ["llmstxt", "llms.txt", "2024", "A markdown map of a site for AI models, at /llms.txt. Proposed 2024; big AI firms haven\'t committed to it.", "llms\\.txt"],
  ["aiov", "AI Overviews", "2024", "AI-written summaries at the top of Google results, rolled out to everyone in the US from 14 May 2024.", "AI Overviews|AI summary|AI summaries"],
  ["zeroclick", "Zero-click search", "", "A search that ends on the results page because the answer is already there, so no site gets a visit.", "zero-click|answers"],
  ["acp", "Agentic Commerce Protocol", "2025", "Agentic Commerce Protocol, from OpenAI and Stripe: lets an AI agent check out for you. Powers Instant Checkout.", "Agentic Commerce Protocol|ACP"],
  ["ap2", "AP2", "2025", "Agent Payments Protocol, Google, September 2025. Signed “mandates” prove what you let an agent buy.", "AP2"],
  ["x402", "x402", "2025", "Coinbase's protocol (May 2025) that revives HTTP 402 so agents can pay per request.", "x402"],
  ["h402", "HTTP 402", "1997", "“Payment Required”: an HTTP status code reserved since the 1990s and barely used, until now.", "402(?: Payment Required)?"],
  ["webbotauth", "Web Bot Auth", "2025", "Bots sign their requests with a published key, so sites can check who's really knocking.", "Web Bot Auth|signed requests?|signed agents?"],
  ["payperCrawl", "Pay per crawl", "2025", "Cloudflare's private beta (1 July 2025) letting sites allow, block or charge AI crawlers, using HTTP 402 responses.", "pay per crawl|charge them per crawl"],
  ["robots", "robots.txt", "1994", "A text file telling crawlers what they may fetch. A 1994 convention, an official standard since 2022.", "robots\\.txt|Robots\\.txt"],
  ["aicrawler", "AI crawler", "", "A bot that downloads pages to train or feed AI models, not to send you visitors.", "AI crawlers?"],
  ["ondevice", "On-device model", "", "An AI model running on your own machine, so your data never leaves it.", "on-device(?: AI| models?)?|small model"],
  ["nano", "Gemini Nano", "", "Google's smallest Gemini model, downloaded by Chrome to run its built-in AI APIs locally.", "Gemini Nano"],
  ["builtinai", "Built-in AI APIs", "2025", "Chrome APIs such as Summarizer, Translator and Language Detector, available in stable Chrome from version 138 (mid-2025).", "Summarizer|Translator|on-device AI APIs"],
  ["genui", "Generative UI", "", "Screens assembled by a model on the fly, for one person and one task.", "generated per visitor|generative UI|Interfaces might be generated"],
  ["vibecoding", "Vibe coding", "2025", "Describing an app and letting AI write the code, mostly unread. Named by Andrej Karpathy, February 2025.", "vibe coding"],
  ["agent", "AI agent", "", "An AI that takes actions, not just answers: it plans, uses tools or a browser, and keeps going.", "agents?"],
  ["llm", "LLM", "", "Large language model: a neural network trained on huge amounts of text. The engine inside chatbots and agents.", "LLMs?|language models?|AI model"],
  ["aibrowser", "AI browser", "2025", "A browser built around an assistant that can read the open tabs and act on pages for you.", "AI browsers?"],
  ["promptinj", "Prompt injection", "", "Hidden text on a page that tries to give an AI agent new orders. Why agents ask before risky steps.", "prompt injection"],
  ["a11ytree", "Accessibility tree", "", "The browser's structured view of a page (roles, names, states) built for screen readers. Agents often read it too.", "accessibility tree"],
  ["origintrial", "Origin trial", "", "A way for sites to try an experimental Chrome feature in production for a limited time.", "origin trial"],
  ["instantcheckout", "Instant Checkout", "2025", "Buying inside ChatGPT, launched 29 September 2025 for US users, starting with Etsy sellers. Built on the Agentic Commerce Protocol.", "Instant Checkout"],
  ["comet", "Comet", "2025", "Perplexity's AI browser, released 9 July 2025 for top-tier subscribers and made free for everyone on 2 October 2025.", "Comet"],
  ["atlas", "ChatGPT Atlas", "2025", "OpenAI's AI browser, launched for macOS on 21 October 2025.", "ChatGPT Atlas|Atlas"],
  ["dia", "Dia", "2025", "An AI browser from The Browser Company, early access from June 2025. Atlassian bought the company.", "Dia"],
  ["autobrowse", "Auto browse", "2026", "Gemini in Chrome's agent mode (2026). It clicks through sites in its own tab and pauses before buying.", "auto browse"],
  ["claudechrome", "Claude in Chrome", "2025", "Anthropic's extension that lets Claude read and act on web pages. Generally available since August 2026.", "Claude in Chrome"],
  ["anthropic", "Anthropic", "2021", "An AI company that makes the Claude models; it introduced computer use and MCP.", "Anthropic"],
  ["openai", "OpenAI", "2015", "The AI company behind ChatGPT; it launched Operator and Instant Checkout.", "OpenAI"],
  ["perplexity", "Perplexity", "2022", "An AI answer-engine company; it makes the Comet browser.", "Perplexity"],
  ["cloudflare", "Cloudflare", "2009", "A huge network in front of millions of sites, so its defaults decide how bots get treated.", "Cloudflare"],
  ["stripe", "Stripe", "2010", "A payments company; it co-developed the Agentic Commerce Protocol with OpenAI.", "Stripe"],
  ["coinbase", "Coinbase", "2012", "A cryptocurrency exchange; it published the x402 payment protocol in May 2025.", "Coinbase"],
  ["pew", "Pew Research Center", "", "A nonpartisan US research organisation. Its July 2025 study tracked 68,879 real Google searches by 900 adults.", "Pew"],
  // --- people (6th field "p" = person)
  ["pTBL", "Tim Berners-Lee", "", "British computer scientist who invented the web at CERN in 1989–90 and founded the W3C in 1994.", "Tim Berners-Lee", "p"],
  ["pSendall", "Mike Sendall", "", "Tim's manager at CERN. He wrote “vague but exciting” on the proposal and let Tim build it anyway.", "Mike Sendall", "p"],
  ["pCailliau", "Robert Cailliau", "", "Belgian engineer at CERN who co-wrote the 1990 web proposal and championed it inside the lab.", "Robert Cailliau", "p"],
  ["pPellow", "Nicola Pellow", "", "Maths student on placement at CERN who wrote the line-mode browser in 1990–91.", "Nicola Pellow", "p"],
  ["pKunz", "Paul Kunz", "", "SLAC physicist who set up the first web server in North America, in December 1991.", "Paul Kunz", "p"],
  ["pAndreessen", "Marc Andreessen", "", "Co-wrote Mosaic at NCSA as a student, then co-founded Netscape. Later a venture capitalist.", "Marc Andreessen", "p"],
  ["pBina", "Eric Bina", "", "NCSA programmer who co-wrote Mosaic with Marc Andreessen and then co-founded Netscape.", "Eric Bina", "p"],
  ["pLerdorf", "Rasmus Lerdorf", "", "Danish-Canadian programmer who created PHP in 1995.", "Rasmus Lerdorf", "p"],
  ["pEich", "Brendan Eich", "", "Created JavaScript at Netscape in 1995. Later co-founded Mozilla and Brave.", "Brendan Eich", "p"],
  ["pLie", "Håkon Wium Lie", "", "Norwegian web pioneer who proposed CSS at CERN in 1994, later CTO of the Opera browser.", "Håkon Wium Lie", "p"],
  ["pGarrett", "Jesse James Garrett", "", "User-experience designer at Adaptive Path who named Ajax in a February 2005 essay.", "Jesse James Garrett", "p"],
  ["pResig", "John Resig", "", "Created jQuery in 2006, then worked at Mozilla and Khan Academy.", "John Resig", "p"],
  ["pDHH", "David Heinemeier Hansson", "", "Danish programmer, known as DHH, who created Ruby on Rails at 37signals.", "David Heinemeier Hansson|DHH", "p"],
  ["pDahl", "Ryan Dahl", "", "Created Node.js in 2009, then Deno in 2018 to fix what he regretted about Node.", "Ryan Dahl", "p"],
  ["pWalke", "Jordan Walke", "", "Facebook engineer who created React.", "Jordan Walke", "p"],
  ["pYou", "Evan You", "", "Independent developer who created Vue (2014) and the Vite build tool (2020).", "Evan You", "p"],
  ["pRauch", "Guillermo Rauch", "", "Created Socket.IO and founded Vercel, the company behind Next.js.", "Guillermo Rauch", "p"],
  ["pHarris", "Rich Harris", "", "Created Svelte and the Rollup bundler while building interactive news graphics.", "Rich Harris", "p"],
  ["pQSF", "Quentin Stafford-Fraser", "", "Cambridge computer scientist who, with Paul Jardetzky, wired up the Trojan Room coffee-pot camera in 1991.", "Quentin Stafford-Fraser", "p"],
  // --- names, places and things
  ["homepage", "Homepage", "", "A personal website, usually a few hand-written HTML pages about you, your pets and your favourite links.", "homepages?"],
  ["sharedhost", "Shared hosting", "", "One server shared by hundreds of sites, each in a folder. Cheap, and home to most 90s pages.", "shared box|shared hosting"],
  ["crawler", "Search crawler", "", "A search engine's program that downloads pages to index them. Early crawlers didn't run JavaScript, so client-rendered pages looked empty.", "search engines?"],
  ["infinite", "Infinite scroll", "", "Loading more items automatically as you near the bottom, so the page never ends. Everywhere from about 2010.", "the feed never ends"],
  ["production", "Production", "", "The live environment real users hit, as opposed to a staging or preview deployment.", "production"],
  ["trojan", "Trojan Room coffee pot", "1991", "A coffee pot at Cambridge University's Computer Lab. On camera from 1991, on the web 1993–2001.", "Trojan Room"],
  ["webcam", "Webcam", "", "A camera that publishes images to the web. The Trojan Room coffee pot is usually called the first famous one.", "webcams?"],
  ["nextstep", "NeXTSTEP", "1989", "The operating system on NeXT computers. It later became the core of Mac OS X.", "NeXTSTEP"],
  ["nextcube", "NeXTcube", "1990", "A black workstation from NeXT, Steve Jobs' company after Apple. The first web server ran on one.", "NeXTcube|NeXT cube|NeXT"],
  ["wwwapp", "WorldWideWeb (the app)", "1990", "The first browser, which could also edit pages. Written by Tim Berners-Lee in 1990.", "WorldWideWeb"],
  ["linemode", "Line-mode browser", "1991", "A text-only browser by Nicola Pellow that ran on any terminal. Links were numbers you typed.", "line-mode browser"],
  ["terminal", "Terminal", "", "A screen and keyboard with no real computer inside. It showed text from a shared machine.", "dumb terminal|terminals?"],
  ["cern", "CERN", "1954", "The European Organization for Nuclear Research, the particle physics lab near Geneva where the web was invented.", "CERN"],
  ["slac", "SLAC", "", "Stanford Linear Accelerator Center in California. It ran the first web server outside Europe, from December 1991.", "SLAC"],
  ["w3c", "W3C", "1994", "The World Wide Web Consortium, founded by Tim Berners-Lee to write the web's standards.", "W3C"],
  ["arpanet", "ARPANET", "1969", "The US research network that grew into the internet. It sent its first message in 1969.", "ARPANET"],
  ["httpd", "httpd", "1990", "HTTP daemon: the web server program. CERN httpd came first; NCSA HTTPd followed and Apache grew out of it.", "httpd|HTTPd"],
  ["ncsa", "NCSA", "", "National Center for Supercomputing Applications at the University of Illinois. It built Mosaic and the NCSA HTTPd server.", "NCSA"],
  ["netscape", "Netscape Navigator", "1994", "The browser that ruled the mid-90s. Netscape's 1995 IPO kicked off the dot-com boom.", "Netscape Navigator|Netscape|Navigator"],
  ["ie", "Internet Explorer", "1995", "Microsoft's browser. Bundled with Windows, it won the first browser war, then stood still for years. Retired in 2022.", "Internet Explorer"],
  ["browserwars", "Browser wars", "1995", "Netscape against Internet Explorer, roughly 1995–2001. Both raced to add incompatible features; IE won by shipping with Windows.", "browser wars"],
  ["sun", "Sun Microsystems", "", "Sun Microsystems, maker of Java. The JavaScript name came from a deal with Sun.", "Sun"],
  ["geocities", "GeoCities", "1994", "Free homepages sorted into themed “neighbourhoods”. Yahoo bought it in 1999 and shut it down in 2009.", "GeoCities|Geocities"],
  ["webring", "Webring", "", "A loop of sites on one topic, linked by prev and next buttons. 90s discovery, before good search.", "webrings?"],
  ["guestbook", "Guestbook", "", "A page where visitors left a public message, usually run by a CGI script.", "guestbooks?"],
  ["hitcounter", "Hit counter", "", "A CGI script that counted page loads and showed the total as odometer digits.", "hit counters?|You are visitor"],
  ["y2k", "Y2K", "2000", "The fear that two-digit years would break software on 1 January 2000. Years of fixes meant little did.", "Y2K"],
  ["dotcom", "Dot-com bubble", "2000", "The late-90s internet investment frenzy. Tech stocks peaked in March 2000, then lost about 78%.", "dot-com bubble|dot-com"],
  ["flash", "Flash", "1996", "A browser plug-in for animation, games and video, huge in the 2000s. Adobe ended support at the end of 2020.", "Flash"],
  ["gmail", "Gmail", "2004", "Google's webmail, launched 1 April 2004 with 1 GB of storage and a no-reload interface.", "Gmail"],
  ["gmaps", "Google Maps", "2005", "Google's 2005 map you could drag smoothly, loading tiles in the background with Ajax.", "Google Maps"],
  ["web20", "Web 2.0", "2004", "A label, popularised by Tim O'Reilly's 2004 conference, for sites built on user content, sharing and rich in-browser interaction.", "Web 2\\.0"],
  ["beta", "Perpetual beta", "", "In the 2000s products stayed labelled “beta” for years. Gmail only dropped the badge in July 2009.", "beta"],
  ["blog", "Blog", "1999", "Short for weblog: a personal site of dated posts, newest first.", "blogs?"],
  ["rss", "RSS", "1999", "An XML feed of a site's latest posts that readers could subscribe to in a feed reader.", "RSS"],
  ["django", "Django", "2005", "A Python web framework built at the Lawrence Journal-World newspaper in Kansas.", "Django"],
  ["aws", "AWS", "2006", "Amazon Web Services: renting Amazon's infrastructure by the hour. S3 and EC2 launched in 2006.", "AWS|Amazon"],
  ["useast", "us-east-1", "", "AWS's oldest, busiest region, in Virginia. When it has a bad day, the internet notices.", "us-east-1|US East|us-east"],
  ["iphone", "iPhone", "2007", "Apple's 2007 phone with a full web browser. It made the mobile web mainstream, and never supported Flash.", "iPhone"],
  ["heroku", "Heroku", "2007", "A platform where deploying meant running git push heroku master. It made PaaS popular.", "Heroku"],
  ["backbone", "Backbone.js", "2010", "A small library by Jeremy Ashkenas that gave browser apps models, views and a router.", "Backbone"],
  ["angularjs", "AngularJS", "2010", "Google's framework with two-way data binding and templates full of {{ }}. Rewritten from scratch as Angular in 2016.", "AngularJS|Angular"],
  ["jsconf", "JSConf", "2009", "A community-run series of JavaScript conferences, where Node.js and React were both first shown.", "JSConf(?: US| EU)?"],
  ["jsx", "JSX", "2013", "React's syntax for writing HTML-like tags inside JavaScript. It compiles to plain function calls.", "JSX|HTML inside JavaScript"],
  ["leftpad", "left-pad", "2016", "An 11-line npm package. Unpublished in March 2016, it broke thousands of builds.", "left-pad"],
  ["responsive", "Responsive design", "2010", "One layout that adapts to any screen with CSS media queries. Named by Ethan Marcotte in 2010.", "responsive|mobile-first"],
  ["flat", "Flat design", "", "The early-2010s move from glossy, realistic textures to plain shapes and colour. Google's Material Design (2014) added paper-like shadows back.", "flat design|goes flat|Material"],
  ["kubernetes", "Kubernetes", "2014", "Google's open-source system for running containers across a cluster: scheduling, restarts and scaling.", "Kubernetes"],
  ["deno", "Deno", "2018", "A JavaScript and TypeScript runtime by Ryan Dahl: secure by default, with TypeScript built in.", "Deno"],
  ["vue", "Vue", "2014", "A front-end framework by Evan You: HTML templates plus reactive data, adoptable one page at a time.", "Vue"],
  ["nextjs", "Next.js", "2016", "Vercel's React framework for server rendering, routing and static generation.", "Next\\.js"],
  ["svelte", "Svelte", "2016", "A framework by Rich Harris that compiles components to plain JavaScript at build time, with no runtime library.", "Svelte"],
  ["socketio", "Socket.IO", "2010", "A library by Guillermo Rauch for real-time two-way messages between browser and server.", "Socket\\.IO"],
  ["rollup", "Rollup", "2015", "A JavaScript module bundler by Rich Harris, known for tree-shaking unused code.", "Rollup"],
  ["vite", "Vite", "2020", "Evan You's build tool (2020) with a near-instant dev server.", "Vite"],
  ["typescript", "TypeScript", "2012", "Microsoft's typed superset of JavaScript. It compiles to plain JS and became the default for large front-end codebases.", "TypeScript"],
  ["monorepo", "Monorepo", "", "One repository holding many apps and packages, so they share code and change together.", "monorepos?"],
  ["jamstack", "JAMstack", "2015", "JavaScript, APIs and Markup: pre-built pages on a CDN, with dynamic parts handled by APIs. Coined at Netlify.", "JAMstack|Jamstack"],
  ["postgres", "Postgres", "1996", "PostgreSQL, an open-source relational database descended from Berkeley's POSTGRES project.", "Postgres(?:QL)?"],
  ["edgefn", "Edge function", "", "A small serverless function deployed to many locations at once, run in whichever one is closest to the user.", "edge functions?"],
  ["rsc", "Server Components", "2020s", "React components that run only on the server and ship none of their own code to the browser.", "Server Components|Components that run only on the server"],
  ["xhr", "XMLHttpRequest", "1999", "The browser API behind Ajax. Microsoft shipped it in Internet Explorer 5; the other browsers copied it.", "XMLHttpRequest"],
  ["tcpip", "TCP/IP", "1983", "The internet's base protocols: IP moves packets, TCP makes them a reliable stream. Standard since 1983.", "TCP/IP"],
  ["lamp", "LAMP", "1998", "Linux, Apache, MySQL and PHP (or Perl, or Python). The free default stack for 2000s websites.", "LAMP"],
  ["node", "Node.js", "2009", "JavaScript outside the browser, on Chrome's V8 engine, with non-blocking I/O. One language on both sides of the wire.", "Node\\.js|Node"],
  ["rails", "Ruby on Rails", "2004", "A full-stack MVC framework in Ruby. Made “convention over configuration” and database migrations mainstream.", "Ruby on Rails|Rails"],
  ["jquery", "jQuery", "2006", "A library that hid browser differences behind one $() function for selecting elements, events, animation and Ajax.", "jQuery"],
  ["js", "JavaScript", "1995", "The browser's scripting language, written by Brendan Eich at Netscape. Standardised as ECMAScript in 1997.", "JavaScript"],
  ["ajax", "Ajax", "2005", "Asynchronous JavaScript and XML: fetch data in the background and update part of the page without a full reload.", "Ajax|AJAX"],
  ["json", "JSON", "~2001", "A small text format for data, popularised by Douglas Crockford. It replaced XML for most APIs.", "JSON"],
  ["rest", "REST", "2000", "A style for APIs: resources live at URLs, and you act on them with GET, POST and DELETE.", "REST"],
  ["http", "HTTP", "1991", "HyperText Transfer Protocol. How browsers and servers talk: GET a URL, get back a status code, headers and a body.", "HTTP"],
  ["html", "HTML", "1991", "HyperText Markup Language. Plain text with tags like <h1> and <a> that give a page its structure and its links.", "HTML"],
  ["url", "URL", "1990", "Uniform Resource Locator. An address like https://example.com/page: the protocol, the host, then the path.", "URLs?"],
  ["hypertext", "Hypertext", "1965", "Text with links you can follow to other text. Ted Nelson coined the word; the web made it global.", "hypertext"],
  ["newsgroup", "Newsgroup", "1980", "A Usenet discussion group, the internet's message boards since 1980. alt.hypertext was one of thousands.", "Usenet|newsgroups?"],
  ["mosaic", "Mosaic", "1993", "The 1993 NCSA browser that put images inline with text and made the web popular.", "Mosaic"],
  ["cgi", "CGI", "1993", "Common Gateway Interface. The web server starts a program for each request and sends back whatever it prints.", "CGI"],
  ["perl", "Perl", "1987", "Larry Wall's text-processing language, the default choice for CGI scripts in the 90s.", "Perl"],
  ["php", "PHP", "1995", "Rasmus Lerdorf's 1995 language: code mixed into HTML, run by the server on every request.", "PHP|Personal Home Page Tools"],
  ["isp", "ISP", "", "Internet service provider. The company whose modems you dialled into to get online.", "ISPs?"],
  ["dialup", "Dial-up", "", "Getting online with a phone call. Nobody could use the phone while you surfed.", "dial-up|Dial-Up"],
  ["baud", "kbps / baud", "", "Kilobits per second. A 28.8k modem moved about 3.6 KB a second, on a good day.", "kbps|kbit/s|28\\.8k|56k|baud"],
  ["modem", "Modem", "", "Modulator-demodulator. Turns digital data into audio tones that travel down a phone line, and back again.", "modems?"],
  ["colo", "Colocation", "", "Renting rack space, power and bandwidth in someone else's data center for servers you bought and own.", "colocation|colo"],
  ["apache", "Apache", "1995", "Grew out of patches to the NCSA web server and was the most-used web server from 1996 into the 2010s.", "Apache"],
  ["mysql", "MySQL", "1995", "A fast, free relational database. The M in LAMP.", "MySQL"],
  ["memcached", "memcached", "2003", "An in-memory key-value cache written for LiveJournal. It saves the database from answering the same query again and again.", "memcached"],
  ["lb", "Load balancer", "", "A box or program that spreads incoming requests across several identical servers.", "load balancer"],
  ["css", "CSS", "1996", "Cascading Style Sheets: rules for how HTML should look, kept apart from the content. Proposed in 1994, CSS1 in 1996.", "CSS1?|style sheets"],
  ["mvc", "MVC", "1979", "Model–View–Controller. Split an app into data, display, and the code connecting them. From Smalltalk.", "MVC"],
  ["vps", "VPS", "", "Virtual private server. One physical machine split into several virtual ones, each with its own OS and root access.", "VPS"],
  ["ec2", "EC2", "2006", "Amazon's rentable virtual servers, started with an API call. Launched 2006.", "EC2|renting out its servers by the hour"],
  ["s3", "S3", "2006", "Amazon Simple Storage Service. Put any file at a URL and pay per gigabyte. Launched March 2006.", "S3"],
  ["paas", "PaaS", "", "Platform as a service: you push code, the platform runs it. Heroku made it famous.", "PaaS|a platform you deploy to"],
  ["cdn", "CDN", "", "Content delivery network: copies of your files around the world, served from the closest one.", "CDNs?"],
  ["spa", "SPA", "", "Single-page app: one HTML page whose JavaScript draws every screen and fetches its own data.", "SPAs?|single-page apps?"],
  ["csr", "CSR", "", "Client-side rendering: the browser builds the page with JavaScript. Fast later, slow to start.", "CSR|builds everything else"],
  ["ssr", "SSR", "", "Server-side rendering: the server sends finished HTML. Fast first paint, easy for search engines.", "SSR|render React on the server"],
  ["ssg", "SSG", "", "Static site generation. Pages are rendered to HTML files at build time and served from a CDN.", "SSG|pre-built|static pages"],
  ["isr", "ISR", "2020", "Incremental static regeneration. Static pages rebuilt in the background after a time limit or on demand, without a full redeploy.", "ISR"],
  ["hydration", "Hydration", "", "Running a server-rendered page's JavaScript in the browser so it attaches event handlers and becomes interactive.", "hydrat(?:ed|ion|e)"],
  ["bundle", "Bundle", "", "All of an app's JavaScript squashed into a few files by a build tool.", "bundle\\.js|bundles?"],
  ["npm", "npm", "2010", "The Node package manager and registry. One command installs a package and everything it depends on.", "npm"],
  ["v8", "V8", "2008", "Chrome's JavaScript engine. It compiles JS to machine code, which made JavaScript fast enough for big apps and servers.", "V8"],
  ["react", "React", "2013", "A UI library from Facebook. Describe the UI for a given state and React works out the DOM changes.", "React"],
  ["docker", "Containers / Docker", "2013", "Packages an app with its whole environment into an image that runs the same on any machine.", "Docker|containers?"],
  ["serverless", "Serverless / Lambda", "2014", "Upload a function; the platform runs it per request and bills per call. Servers still exist, unseen.", "Lambda|serverless"],
  ["git", "git push / CI", "2005", "Sending commits to a shared repository. Platforms hook in so every push triggers a build, tests and a deploy.", "git push"],
  ["api", "API", "", "A defined way for one program to ask another for data or actions. On the web, usually HTTP.", "APIs?"],
  ["dns", "DNS", "1983", "Domain Name System. Turns names like example.com into IP addresses via a worldwide hierarchy of servers.", "DNS"],
  ["ttfb", "TTFB", "", "Time to first byte: how long after the request the first byte of the response arrives.", "TTFB|first byte"],
  ["latency", "Latency", "", "How long a round trip takes. Light in fibre covers about 200 km per millisecond, so distance always costs something.", "latenc(?:y|ies)|Light only travels so fast"],
  ["streaming", "Streaming", "", "Sending a response in pieces as they're ready, so the browser can show the first parts early.", "stream(?:s|ing|ed)?"],
  ["edge", "Edge", "", "Running code in data centers close to users, instead of in one central region.", "edge"],
  ["browser", "Browser", "1990", "The program that fetches pages over HTTP and draws them. The first one, WorldWideWeb, was also an editor.", "browsers?"],
  ["server", "Server", "1990", "A program, and the machine running it, that answers requests. The first web server was CERN httpd.", "servers?"]
];
var GL_BY = {}, GL_RE = GLOSS.map(function (g) { GL_BY[g[0]] = g; return [g[0], new RegExp("(^|[^\\w./-])(" + g[4] + ")(?![\\w])", g[0] === "hypertext" || g[0] === "computeruse" || g[0] === "zeroclick" || g[0] === "webbotauth" || g[0] === "payperCrawl" || g[0] === "aicrawler" || g[0] === "ondevice" || g[0] === "genui" || g[0] === "vibecoding" || g[0] === "agent" || g[0] === "llm" || g[0] === "aibrowser" || g[0] === "promptinj" || g[0] === "a11ytree" || g[0] === "origintrial" || g[0] === "autobrowse" || g[0] === "homepage" || g[0] === "crawler" || g[0] === "terminal" || g[0] === "webring" || g[0] === "guestbook" || g[0] === "webcam" || g[0] === "blog" || g[0] === "monorepo" || g[0] === "responsive" || g[0] === "flat" || g[0] === "edgefn" || g[0] === "hitcounter" || g[0] === "browserwars" || g[0] === "dotcom" || g[0] === "linemode" || g[0] === "browser" || g[0] === "server" || g[0] === "edge" || g[0] === "streaming" || g[0] === "modem" || g[0] === "docker" || g[0] === "spa" || g[0] === "dialup" || g[0] === "latency" || g[0] === "colo" || g[0] === "newsgroup" || g[0] === "bundle" || g[0] === "css" ? "i" : "")]; });
var SKIP_SEL = ".gl-term, pre, code, button, input, textarea, select, script, style, svg, .tip, .counter, .src";

function glossifyEl(root) {
  if (!root) return root; var used = {};
  root.querySelectorAll && root.querySelectorAll(".gl-term").forEach(function (t) { used[t.dataset.term] = 1; });
  GL_RE.forEach(function (pair) {
    var key = pair[0], re = pair[1]; if (used[key]) return;
    var w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, { acceptNode: function (n) { var p = n.parentElement; return p && !p.closest(SKIP_SEL) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT; } }), node;
    while ((node = w.nextNode())) {
      var m = re.exec(node.nodeValue); if (!m) continue;
      var start = m.index + m[1].length, word = m[2], after = node.splitText(start); after.nodeValue = after.nodeValue.slice(word.length);
      var span = document.createElement("span"); span.className = "gl-term"; span.tabIndex = 0; span.dataset.term = key; span.textContent = word;
      after.parentNode.insertBefore(span, after); used[key] = 1; break;
    }
  });
  return root;
}

// one shared tooltip, skinned per era via #screen[data-era]
var tipEl = null, tipFor = null, tipPinned = false;
function tipShow(term, pin) {
  var g = GL_BY[term.dataset.term]; if (!g) return;
  if (!tipEl) { tipEl = el("div", "tip"); tipEl.id = "tip"; tipEl.setAttribute("role", "tooltip"); $("#screen").appendChild(tipEl); }
  if (tipFor && tipFor !== term) tipFor.removeAttribute("aria-describedby");
  tipFor = term; tipPinned = !!pin; term.setAttribute("aria-describedby", "tip");
  tipEl.innerHTML = "<b>" + esc(g[1]) + (g[5] === "p" ? ' <span class="yr">person</span>' : g[2] ? ' <span class="yr">' + esc(g[2]) + "</span>" : "") + "</b>" + esc(g[3]);
  tipEl.classList.add("on");
  var r = term.getBoundingClientRect(), tw = tipEl.offsetWidth, th = tipEl.offsetHeight, vw = document.documentElement.clientWidth, vh = innerHeight;
  var x = clamp(r.left + r.width / 2 - tw / 2, 12, Math.max(12, vw - tw - 12)), y = r.top - th - 10;
  if (y < 12) y = Math.min(r.bottom + 10, vh - th - 12);
  tipEl.style.left = x + "px"; tipEl.style.top = Math.max(12, y) + "px";
}
function tipHide(force) { if (!tipEl || (tipPinned && !force)) return; tipEl.classList.remove("on"); if (tipFor) tipFor.removeAttribute("aria-describedby"); tipFor = null; tipPinned = false; }
document.addEventListener("pointerover", function (e) { if (e.pointerType === "touch") return; var t = e.target.closest && e.target.closest(".gl-term"); if (t && !tipPinned) tipShow(t, false); });
document.addEventListener("pointerout", function (e) { if (e.pointerType === "touch") return; var t = e.target.closest && e.target.closest(".gl-term"); if (t && t === tipFor && !(e.relatedTarget && t.contains(e.relatedTarget))) tipHide(false); });
document.addEventListener("focusin", function (e) { var t = e.target.closest && e.target.closest(".gl-term"); if (t) tipShow(t, false); });
document.addEventListener("focusout", function (e) { if (e.target.closest && e.target.closest(".gl-term")) tipHide(true); });
document.addEventListener("click", function (e) {
  var t = e.target.closest && e.target.closest(".gl-term");
  if (t) { if (tipFor === t && tipPinned) tipHide(true); else tipShow(t, true); return; }
  if (tipPinned) tipHide(true);
}, true);
document.addEventListener("keydown", function (e) { if (e.key === "Escape") tipHide(true); });
window.addEventListener("scroll", function () { tipHide(true); }, { passive: true });
