import { show, win, track } from "../util.js";
// A presence for products without a mascot: a soft orb of the brand's light that breathes, and brightens on cues.
// Same spec shape as mascot.js so you can swap one for the other.
// spec = { windows: [[a, b, fadeIn, fadeOut]], pose: [[t, x, y, scale]], swells: [t, ...], colors: [5 colours] }
// HTML: <canvas id="orb-stage" width="1200" height="1200"></canvas> (600×600 CSS px, centred at x 960 by default)
export function createOrb(spec) {
  const canvas = document.querySelector("#orb-stage"), ctx = canvas.getContext("2d");
  const css = getComputedStyle(document.documentElement);
  const cols = spec.colors ?? [1, 2, 3, 4, 5].map(i => css.getPropertyValue(`--spec-${i}`).trim() || "#b48aff");
  return t => {
    const alpha = Math.max(0, ...spec.windows.map(([a, b, fi, fo]) => win(t, a, b, fi, fo)));
    show(canvas, alpha);
    if (alpha <= .001) return;
    const [x, y, s] = track(t, spec.pose);
    canvas.style.transform = `translate3d(${x}px,${y}px,0) scale(${s})`;
    const swell = (spec.swells ?? []).reduce((sum, at) => sum + Math.max(0, 1 - Math.abs(t - at) / .6), 0);
    const breath = .92 + .06 * Math.sin(t * 1.6) + .12 * Math.min(1, swell);
    ctx.clearRect(0, 0, 1200, 1200);
    ctx.globalCompositeOperation = "lighter";
    cols.forEach((c, i) => {   // five lobes of colour circling slowly inside a white core
      const a = t * (.35 + i * .07) + i * 1.257, r = 150 * breath, cx = 600 + Math.cos(a) * 60, cy = 600 + Math.sin(a) * 60;
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r * 2.2);
      g.addColorStop(0, c); g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.globalAlpha = .55; ctx.fillStyle = g; ctx.fillRect(0, 0, 1200, 1200);
    });
    const core = ctx.createRadialGradient(600, 600, 0, 600, 600, 120 * breath);
    core.addColorStop(0, "rgba(255,255,255,.95)"); core.addColorStop(1, "rgba(255,255,255,0)");
    ctx.globalAlpha = 1; ctx.fillStyle = core; ctx.fillRect(0, 0, 1200, 1200);
    ctx.globalCompositeOperation = "source-over";
  };
}
