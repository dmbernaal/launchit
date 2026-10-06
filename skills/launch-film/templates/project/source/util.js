// Motion vocabulary. Every value is a pure function of film time t, so seeks and parallel render workers agree.
export const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
export const smooth = v => { const t = clamp(v); return t * t * t * (t * (t * 6 - 15) + 10); };
export const out = v => 1 - Math.pow(1 - clamp(v), 3);
export const expo = v => { const t = clamp(v); return t === 1 ? 1 : 1 - Math.pow(2, -10 * t); };
export const inOut = v => { const t = clamp(v); return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
export const lerp = (a, b, p) => a + (b - a) * p;
export const prog = (t, start, dur) => clamp((t - start) / dur);
// Visible between a and b with fade-in fi and fade-out fo (seconds).
export const win = (t, a, b, fi = .4, fo = fi) => smooth((t - a) / fi) * (1 - smooth((t - (b - fo)) / fo));
// Keyframes: [[time, ...values]], eased between neighbours.
export function track(t, frames, curve = smooth) {
  if (t <= frames[0][0]) return frames[0].slice(1);
  for (let i = 0; i < frames.length - 1; i++) {
    const a = frames[i], b = frames[i + 1];
    if (t < b[0]) { const p = curve((t - a[0]) / (b[0] - a[0])); return a.slice(1).map((v, k) => v + (b[k + 1] - v) * p); }
  }
  return frames[frames.length - 1].slice(1);
}
export function show(node, alpha) { node.style.opacity = String(alpha); node.style.visibility = alpha > .001 ? "visible" : "hidden"; }
export const h = html => { const t = document.createElement("template"); t.innerHTML = html.trim(); return t.content.firstElementChild; };
// Word-by-word entrance on spoken times: blur 7px -> 0, rise 14px, .34 s each.
export function revealWords(spans, time, dur = .34) {
  for (const s of spans) {
    const a = smooth((time - s.t + .04) / dur);
    s.node.style.opacity = String(a);
    s.node.style.filter = a < .999 ? `blur(${(1 - a) * 7}px)` : "none";
    s.node.style.transform = `translateY(${(1 - a) * 14}px)`;
  }
}
// One pass of the spectral sheen through a .sheen element, between t0 and t0 + dur.
export function sheen(node, time, t0, dur = 1.1) { node.style.setProperty("--sheen", `${100 - inOut((time - t0) / dur) * 100}%`); }
// A card arriving in space: slides in from the right with a slight tilt, settles, then lifts away.
export function enter(t, node, at, end, from = 140) {
  const a = expo((t - at) / .7), b = smooth((t - end) / .35);
  show(node, Math.min(1, a * 2.5) * (1 - b));
  node.style.transform = `translate3d(${(1 - a) * from}px,${(1 - a) * 24 - b * 18}px,0) rotateX(${7 - 3 * a}deg) rotateY(${(1 - a) * -9 - 3}deg) scale(${.95 + .05 * a})`;
  return a;
}
// Count a number up on the clock (for money, percentages, market sizes).
export function count(node, t, at, dur, from, to, fmt = v => String(Math.round(v))) { node.textContent = fmt(lerp(from, to, smooth((t - at) / dur))); }
// Find spoken words on the film clock. Returns [{w, t, e}] for the first match at or after `after`.
const norm = w => (w ?? "").toLowerCase().replace(/[^a-z0-9']/g, "");
export function spoken(timeline, phrase, after = 0) {
  const list = timeline.words, p = phrase.split(" ").map(norm).filter(Boolean);
  for (let k = 0; k < list.length; k++) if (list[k].t >= after - .01 && p.every((x, j) => norm(list[k + j]?.w) === x)) return list.slice(k, k + p.length);
  throw Error(`spoken words not found: "${phrase}" after ${after}`);
}
