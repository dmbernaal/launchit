import { show, smooth, win, clamp } from "../util.js";
// Every creator, one point of light. They appear as the number grows, then each one finds its agent:
// a spectral dot lights beside it, spreading out from the centre.
// spec = { window: [a, b], fill: [t0, t1], light: [t0, t1], count }
function rng(seed) { return () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; }; }
const SPEC = ["#ffb26b", "#ff70ac", "#b48aff", "#6aa6ff", "#5fe3d3"];
export function createSky(spec) {
  const canvas = document.querySelector("#sky"), ctx = canvas.getContext("2d");
  canvas.width = 3840; canvas.height = 2160; ctx.scale(2, 2);
  const r = rng(4242), N = spec.count ?? 2400;
  const pts = Array.from({ length: N }, () => { const x = r() * 1920, y = r() * 1080, d = Math.hypot((x - 960) / 960, (y - 540) / 540);
    return { x, y, d, born: r(), size: .8 + r() * 1.8, col: SPEC[Math.floor(r() * SPEC.length)], tw: r() * 6.28 }; });
  return t => {
    const a = win(t, spec.window[0], spec.window[1], .6, .8);
    show(canvas, a);
    if (a <= 0) return;
    ctx.clearRect(0, 0, 1920, 1080);
    const fill = smooth((t - spec.fill[0]) / (spec.fill[1] - spec.fill[0])), lit = (t - spec.light[0]) / (spec.light[1] - spec.light[0]);
    for (const p of pts) {
      if (p.born > fill) continue;
      const tw = .65 + .35 * Math.sin(t * 1.3 + p.tw), on = smooth(clamp((lit - p.d * .75) / .25));
      ctx.globalAlpha = tw * .75 * (1 - on * .25); ctx.fillStyle = "#e9e9f0";
      ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
      if (on > 0) { ctx.globalAlpha = on * tw; ctx.fillStyle = p.col; ctx.beginPath(); ctx.arc(p.x + 3.2, p.y - 3.2, p.size * .9, 0, 6.283); ctx.fill(); }
    }
    ctx.globalAlpha = 1;
    const v = ctx.createRadialGradient(960, 520, 60, 960, 520, 560);   // keep the middle dark for the agent
    v.addColorStop(0, "rgba(0,0,0,.85)"); v.addColorStop(1, "rgba(0,0,0,0)"); ctx.fillStyle = v; ctx.fillRect(0, 0, 1920, 1080);
  };
}
