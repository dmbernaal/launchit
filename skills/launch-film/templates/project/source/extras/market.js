import { h, show, smooth, out, win, lerp } from "../util.js";
// The bridge: creators on the left, brands on the right, every match flowing THROUGH the agent in the middle. Soft
// beams (brighter where they meet her) carry small pulses from creators into her and from her out to brands. On
// "close the deal" one creator's path and one brand's path light up as a single spectral line, and a bright pulse
// travels the whole way through her. The layer sits behind the mascot (z-index below #mascot-stage). Names are fictional.
// spec = { hub: [x, y], window: [a, b], drawFrom, closeAt, creators: [[initials, handle]], brands: [name], pair: [ci, bi], deal }
const NS = "http://www.w3.org/2000/svg";
export function createMarket(spec) {
  const [hx, hy] = spec.hub, C = spec.creators, Bd = spec.brands, [pc, pb] = spec.pair;
  const cy = i => 540 + (i - (C.length - 1) / 2) * 118, by = i => 540 + (i - (Bd.length - 1) / 2) * 118;
  const curve = (x0, y0, x1, y1) => `C${lerp(x0, x1, .55)},${y0} ${lerp(x0, x1, .45)},${y1} ${x1},${y1}`;
  const inPath = i => `M470,${cy(i)} ${curve(470, cy(i), hx, hy)}`, outPath = i => `M${hx},${hy} ${curve(hx, hy, 1450, by(i))}`;
  const paths = [...C.map((_, i) => inPath(i)), ...Bd.map((_, i) => outPath(i))];
  const hotD = `${inPath(pc)} ${curve(hx, hy, 1450, by(pb))}`;
  const node = h(`<section class="market"><svg class="links" viewBox="0 0 1920 1080"><defs>
      <linearGradient id="m-in" gradientUnits="userSpaceOnUse" x1="470" y1="0" x2="${hx}" y2="0"><stop offset="0" stop-color="#ffffff" stop-opacity=".16"/><stop offset="1" stop-color="#c7b0ff" stop-opacity=".75"/></linearGradient>
      <linearGradient id="m-out" gradientUnits="userSpaceOnUse" x1="${hx}" y1="0" x2="1450" y2="0"><stop offset="0" stop-color="#c7b0ff" stop-opacity=".75"/><stop offset="1" stop-color="#ffffff" stop-opacity=".16"/></linearGradient>
      <linearGradient id="m-hot" gradientUnits="userSpaceOnUse" x1="470" y1="0" x2="1450" y2="0"><stop offset="0" stop-color="#ffb26b"/><stop offset=".3" stop-color="#ff70ac"/><stop offset=".5" stop-color="#b48aff"/><stop offset=".7" stop-color="#6aa6ff"/><stop offset="1" stop-color="#5fe3d3"/></linearGradient>
      <filter id="m-glow" x="-10%" y="-30%" width="120%" height="160%"><feGaussianBlur stdDeviation="5"/></filter>
      <filter id="m-pglow" x="-200%" y="-200%" width="500%" height="500%"><feGaussianBlur stdDeviation="4"/></filter></defs>
      ${paths.map((d, i) => `<path class="ml" d="${d}" stroke="url(#${i < C.length ? "m-in" : "m-out"})" pathLength="1"/>`).join("")}
      <path class="ml-hot-glow" d="${hotD}" stroke="url(#m-hot)" filter="url(#m-glow)" pathLength="1"/><path class="ml-hot" d="${hotD}" stroke="url(#m-hot)" pathLength="1"/>
      <g class="pulses"></g></svg>
    ${C.map(([ini, handle], i) => `<div class="m-creator" style="top:${cy(i)}px"><i>${ini}</i><span>${handle}</span></div>`).join("")}
    ${Bd.map((b, i) => `<div class="m-brand" style="top:${by(i)}px"><i>${b.split(" ").map(w => w[0]).join("")}</i><span>${b}</span></div>`).join("")}
    <div class="deal"><i>✓</i><div><b>Deal closed</b><span>${spec.deal}</span></div></div></section>`);
  document.querySelector("#cam").append(node);
  const lines = [...node.querySelectorAll(".ml")], creators = [...node.querySelectorAll(".m-creator")], brands = [...node.querySelectorAll(".m-brand")];
  const hot = node.querySelector(".ml-hot"), hotGlow = node.querySelector(".ml-hot-glow"), deal = node.querySelector(".deal"), layer = node.querySelector(".pulses");
  const dot = (cls, r, glow) => { const c = document.createElementNS(NS, "circle"); c.setAttribute("r", r); c.setAttribute("class", cls); if (glow) c.setAttribute("filter", "url(#m-pglow)"); layer.append(c); return c; };
  // Ambient pulses: two per beam, creators flowing in, brands flowing out.
  const ambient = lines.map((ln, i) => [0, 1].map(j => ({ ln, i, j, halo: dot("m-pulse-halo", 8, true), core: dot("m-pulse", 3) })));
  const star = { halo: dot("m-star-halo", 16, true), core: dot("m-star", 5) };
  const hotLen = hot.getTotalLength(), lens = lines.map(ln => ln.getTotalLength());
  const place = (p, x, y, o) => { for (const el of [p.halo, p.core]) { el.setAttribute("cx", x.toFixed(1)); el.setAttribute("cy", y.toFixed(1)); el.style.opacity = String(o); } };
  return t => {
    const a = win(t, spec.window[0], spec.window[1], .45, .5);
    show(node, a);
    if (a <= 0) return;
    creators.forEach((n, i) => { const k = smooth((t - spec.window[0] - .1 - i * .08) / .4); show(n, k); n.style.transform = `translate3d(${(1 - k) * -40}px,-50%,0)`; });
    brands.forEach((n, i) => { const k = smooth((t - spec.window[0] - .3 - i * .08) / .4); show(n, k); n.style.transform = `translate3d(${(1 - k) * 40}px,-50%,0)`; });
    const close = smooth((t - spec.closeAt) / .4);
    lines.forEach((ln, i) => {
      const start = spec.drawFrom + (i % C.length) * .12 + (i >= C.length ? .5 : 0), k = out((t - start) / .7);
      ln.style.strokeDashoffset = String(1 - k); ln.style.opacity = String(1 - close * .55);
      ambient[i].forEach(p => {
        const run = (t - start - .7) / 1.6 + p.j / 2, f = ((run % 1) + 1) % 1, on = t > start + .7 ? Math.sin(Math.PI * f) * (1 - close * .7) : 0;
        const pt = ln.getPointAtLength(f * lens[i]); place(p, pt.x, pt.y, on * .9);
      });
    });
    // The deal: the matched creator's path and the brand's path become one line of light through her.
    const draw = out((t - spec.closeAt) / .9);
    hot.style.strokeDashoffset = hotGlow.style.strokeDashoffset = String(1 - draw);
    show(hot, close); show(hotGlow, close * .9);
    const f = smooth((t - spec.closeAt - .1) / 1.3), sp = hot.getPointAtLength(f * hotLen);
    place(star, sp.x, sp.y, t > spec.closeAt + .05 ? Math.sin(Math.PI * Math.min(1, f * 1.05)) : 0);
    creators[pc].dataset.hot = brands[pb].dataset.hot = String(close > .3);
    show(deal, smooth((t - spec.closeAt - .2) / .4)); deal.style.transform = `translate(-50%,0) translateY(${(1 - smooth((t - spec.closeAt - .2) / .4)) * 16}px)`;
  };
}
