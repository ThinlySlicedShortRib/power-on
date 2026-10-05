P='parts/'
tpl=''.join('<template id="tpl-dg%d">%s</template>\n'%(i,open(P+'dg%d.svg'%i).read()) for i in range(1,7))
html=open(P+'a_head.html').read()+open(P+'a2_extra.html').read()+open(P+'a3_extra.html').read()+open(P+'a4_future.html').read()+open(P+'a5_keys.html').read()+open(P+'b_body.html').read()+tpl+ \
 '<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>\n<script>\n"use strict";\n'+ \
 ''.join(open(P+x).read()+'\n' for x in ['c_story.js','d_gl.js','e_story.js','g_gloss.js','h_dio.js','i_stories.js','f_engine.js','j_future.js','k_music.js','l_keys.js'])+'</script>\n'
open('index.html','w').write(html)
open('check.js','w').write(html.split('<script>\n',1)[1].rsplit('</script>',1)[0])
open('test/test.html','w').write('<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><style>:root{color-scheme:light}body{margin:0;font:14px system-ui}img{max-width:100%}[hidden]{display:none!important}</style></head><body>'+html+'</body></html>')
print(len(html))
