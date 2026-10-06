import { show, clamp, win, lerp, track } from "../util.js";
// Two waves on one canvas. The feed: thousands of real video posters (a 20×13 atlas of 260 posters) flying past.
// The agents: streaks of spectral light that move with intent. On cue both flow into one point and fuse.
// spec = {
//   atlas, point: [x, y],
//   feed: [[a, b, fadeIn, fadeOut], ...], light: [[a, b, fadeIn, fadeOut], ...],   when each wave is visible
//   speed: [[t, z-units/s], ...]     travel through the feed (integrated, so a warp eases into a drift)
//   frame: [[t, centreX, spread], ...]  where the feed sits (960/1 = full frame; 560/.55 = the left half)
//   fuse: [[t, 0..1], ...]           0 = apart, 1 = everything gathered into the point
// }
function rng(seed) { return () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; }; }
const SPEC = ["#ffb26b", "#ff70ac", "#b48aff", "#6aa6ff", "#5fe3d3"];
const lin = x => x;
export function createField(spec) {
  const canvas = document.querySelector("#field"), ctx = canvas.getContext("2d");
  canvas.width = 3840; canvas.height = 2160; ctx.scale(2, 2);
  const atlas = new Image(); atlas.src = spec.atlas;
  const r = rng(90210), N = 2600;
  const tiles = Array.from({ length: N }, (_, i) => ({ x: (r() - .5) * 5200, y: (r() - .5) * 3000, z: 120 + r() * 3880, cell: i % 260, tint: r() }));
  const streaks = Array.from({ length: 150 }, () => ({ y: (r() - .5), speed: .55 + r() * .9, len: 120 + r() * 420, phase: r(), col: SPEC[Math.floor(r() * SPEC.length)], w: .8 + r() * 2.2 }));
  const [px, py] = spec.point;
  const travel = t => { let d = 0; for (let s = 0; s < t; s += 1 / 120) d += track(s, spec.speed, lin)[0] / 120; return d; };
  const draw = t => {
    const feedA = Math.max(0, ...spec.feed.map(([a, b, fi, fo]) => win(t, a, b, fi, fo)));
    const lightA = Math.max(0, ...spec.light.map(([a, b, fi, fo]) => win(t, a, b, fi, fo)));
    show(canvas, Math.max(feedA, lightA));
    if (feedA <= 0 && lightA <= 0) return;
    ctx.clearRect(0, 0, 1920, 1080);
    const [fuse] = track(t, spec.fuse), [cx, spread] = track(t, spec.frame);
    if (feedA > 0) {
      const tr = travel(t), f = 760, cy = 540;
      for (const tile of tiles) {
        let z = tile.z - tr; z = ((z % 4000) + 4000) % 4000 + 40;
        let x = cx + tile.x / z * f * spread, y = cy + tile.y / z * f * lerp(1, .8, 1 - spread);
        const pull = clamp(fuse * (1.15 - tile.tint * .3));
        x = lerp(x, px, pull); y = lerp(y, py, pull);
        const hgt = 230 / z * f * .22 * (1 - pull * .85);
        if (x < -200 || x > 2120 || y < -300 || y > 1380) continue;
        const w = hgt * 9 / 16, depth = clamp(1 - z / 4000);
        // In the left half, the feed fades out before the centre line so the light owns the right.
        const half = spread < .99 ? clamp(1.25 - (x - cx) / (900 * spread + 1)) : 1;
        const alpha = Math.pow(depth, 2.6) * (z < 160 ? (z - 40) / 120 : 1) * feedA * Math.max(half, pull);
        if (alpha <= .002) continue;
        if (hgt > 34 && atlas.complete) {
          ctx.globalAlpha = Math.min(1, alpha * 1.3);
          ctx.drawImage(atlas, (tile.cell % 20) * 120, Math.floor(tile.cell / 20) * 213, 120, 213, x - w / 2, y - hgt / 2, w, hgt);
        } else if (hgt > 14) {
          ctx.globalAlpha = alpha * .55; ctx.fillStyle = tile.tint > .97 ? "#c6a8ff" : tile.tint > .94 ? "#8fb8ff" : "#d9d9e0"; ctx.fillRect(x - w / 2, y - hgt / 2, w, hgt);
        } else {
          ctx.globalAlpha = Math.min(1, alpha * 1.4 + .08); ctx.fillStyle = tile.tint > .95 ? "#c6a8ff" : "#ffffff";
          const d = Math.max(.8, hgt * .16); ctx.fillRect(x - d / 2, y - d / 2, d, d);
        }
      }
    }
    if (lightA > 0) {   // agents: light moving right to left with intent, then into the point
      ctx.globalCompositeOperation = "lighter";
      for (const s of streaks) {
        const run = ((t * s.speed * .32 + s.phase) % 1 + 1) % 1;
        let x = lerp(2080, 1010, run), y = 540 + s.y * 860 * (1 - run * .3);
        x = lerp(x, px, fuse); y = lerp(y, py, fuse);
        const len = s.len * (1 - fuse * .92), g = ctx.createLinearGradient(x, y, x + len, y);
        g.addColorStop(0, s.col); g.addColorStop(1, "rgba(0,0,0,0)");
        ctx.globalAlpha = lightA * (.2 + .6 * Math.sin(run * Math.PI)); ctx.strokeStyle = g; ctx.lineWidth = s.w;
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + len, y); ctx.stroke();
      }
      ctx.globalCompositeOperation = "source-over";
    }
    ctx.globalAlpha = 1;
    const v = ctx.createRadialGradient(cx, 540, 120, cx, 540, 760);   // darkness in the middle so words sit in space
    v.addColorStop(0, `rgba(0,0,0,${.6 * (1 - fuse)})`); v.addColorStop(1, "rgba(0,0,0,0)"); ctx.fillStyle = v; ctx.fillRect(0, 0, 1920, 1080);
    if (fuse > 0) {   // the meeting point: a white core with a spectral halo
      const k = Math.min(1, fuse * 1.3), g = ctx.createRadialGradient(px, py, 0, px, py, 60 + 200 * k);
      g.addColorStop(0, "rgba(255,255,255,.95)"); g.addColorStop(.16, "rgba(205,175,255,.6)"); g.addColorStop(.5, "rgba(255,112,172,.14)"); g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.globalAlpha = k; ctx.fillStyle = g; ctx.fillRect(px - 280, py - 280, 560, 560); ctx.globalAlpha = 1;
    }
  };
  draw.ready = atlas.decode().catch(() => {});
  return draw;
}
