import { h, show, smooth, expo, sheen, lerp } from "../util.js";
// A market number, huge, counting up on the clock, with its source printed small (investors check every number).
// spec = { cls, at, end, from, to, fmt, countAt, countDur, label, pill, pillAt, source, sheenAt }
//   or steps: [[t0, dur, from, to], ...] for a number that moves more than once (67M today -> 107M by 2030).
export function createStat(spec) {
  const node = h(`<section class="stat ${spec.cls ?? ""}">${spec.label ? `<span class="eyebrow">${spec.label}</span>` : ""}
    <div class="stat-row"><span class="stat-num sheen"></span>${spec.pill ? `<span class="pill stat-pill">${spec.pill}</span>` : ""}</div>
    ${spec.note ? `<p class="stat-note">${spec.note}</p>` : ""}<p class="source">${spec.source}</p></section>`);
  document.querySelector("#cards").append(node);
  const num = node.querySelector(".stat-num"), pill = node.querySelector(".stat-pill"), note = node.querySelector(".stat-note"), src = node.querySelector(".source");
  const countAt = spec.countAt ?? spec.at, dur = spec.countDur ?? 1.1;
  return t => {
    const a = expo((t - spec.at) / .7), b = smooth((t - spec.end) / .4);
    show(node, Math.min(1, a * 2) * (1 - b));
    if (a <= 0 || b >= 1) return;
    node.style.transform = `translate3d(0,${(1 - a) * 26 - b * 14}px,0) scale(${.97 + .03 * a})`;
    node.style.filter = a < .99 || b > 0 ? `blur(${(1 - a) * 8 + b * 6}px)` : "none";
    const v = spec.steps ? spec.steps.reduce((acc, [t0, d, f, to]) => (t >= t0 ? lerp(f, to, smooth((t - t0) / d)) : acc), spec.steps[0][2])
      : lerp(spec.from, spec.to, smooth((t - countAt) / dur));
    num.textContent = spec.fmt(v);
    sheen(num, t, spec.sheenAt ?? countAt + dur - .1, 1.3);
    if (pill) show(pill, smooth((t - (spec.pillAt ?? countAt + dur - .1)) / .35));
    if (note) show(note, smooth((t - (spec.noteAt ?? countAt + .3)) / .4));
    show(src, smooth((t - spec.at - .5) / .5) * .9);
  };
}
