P='parts/'
r=lambda f: open(P+f).read()
head='''<script>
"use strict";
(function () {
  var REDUCE = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var seg = function (p, a, b) { return clamp((p - a) / (b - a), 0, 1); };
  var ease = function (t) { return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
  var mode = "play", hero = null;
'''
html = r('a_head.html') + r('css_dive.css') + r('c_tail.css') + r('b_body.html') + r('html_dive.html') + '\n<div class="cap" aria-live="polite"><p id="cap" class="out"></p></div>\n\n' + head + \
  r('d_app.js') + '\n' + r('js_timeline.js') + '\n' + r('js_dive.js') + '\n' + r('e_ctrl.js') + '})();\n</script>\n'
open('index.html','w').write(html)
open('check.js','w').write(html.split('<script>\n',1)[1].rsplit('</script>',1)[0])
open('test/test.html','w').write('<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><style>:root{color-scheme:light}body{margin:0;font:14px system-ui}img{max-width:100%}[hidden]{display:none!important}</style></head><body>'+html+'</body></html>')
print(len(html))
