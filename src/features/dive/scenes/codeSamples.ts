/**
 * Code shown in the dive's code layers. Deliberately untranslated (it's code), pre-highlighted as
 * static HTML. These are authored constants, never user input, so injecting them is safe.
 */
export type LayerId = "jsx" | "js" | "dom" | "css" | "http";

export const CODE: Record<LayerId, string> = {
  jsx: `<span class="k">export function</span> <span class="f">LikeButton</span>({ count }) {
  <span class="k">const</span> [liked, setLiked] = <span class="f">useState</span>(<span class="n">false</span>);
  <span class="k">return</span> (
    &lt;<span class="t">button</span> <span class="a">onClick</span>={() =&gt; <span class="f">setLiked</span>(!liked)}&gt;
      ♥ {count + (liked ? <span class="n">1</span> : <span class="n">0</span>)}
    &lt;/<span class="t">button</span>&gt;
  );
}`,
  js: `<span class="k">function</span> <span class="f">LikeButton</span>(e){<span class="k">var</span> t=<span class="f">useState</span>(<span class="n">!1</span>),
n=t[<span class="n">0</span>],r=t[<span class="n">1</span>];<span class="k">return</span> <span class="f">jsx</span>(<span class="s">"button"</span>,
{onClick:<span class="k">function</span>(){<span class="f">r</span>(!n)},
children:[<span class="s">"♥ "</span>,e.count+(n?<span class="n">1</span>:<span class="n">0</span>)]})}
<span class="c">// minified, bundled, shipped to your browser</span>`,
  dom: `&lt;<span class="t">article</span> <span class="a">class</span>=<span class="s">"post"</span>&gt;
  &lt;<span class="t">p</span>&gt;Shipped my first side project…&lt;/<span class="t">p</span>&gt;
  &lt;<span class="t">button</span> <span class="a">class</span>=<span class="s">"like on"</span>&gt;
    ♥ <span class="n">1,285</span>
  &lt;/<span class="t">button</span>&gt;
&lt;/<span class="t">article</span>&gt;`,
  css: `.<span class="f">like</span> {
  <span class="a">border-radius</span>: <span class="n">99px</span>;
  <span class="a">transition</span>: transform <span class="n">.25s</span>;
}
.<span class="f">like</span>.<span class="f">on</span> { <span class="a">color</span>: <span class="s">#ff3d6e</span>; }`,
  http: `POST /api/posts/8812/like HTTP/1.1
Host: murmur.app
Content-Type: application/json

{ "liked": true }

<span class="c">→ 200 OK  ·  38 ms</span>`,
};

export const LAYER_IDS: LayerId[] = ["jsx", "js", "dom", "css", "http"];
