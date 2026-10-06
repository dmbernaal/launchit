import { h, show, smooth } from "../util.js";
// Everything the viewer juggles today, arriving faster and faster, out of focus, closing in. Then a hard cut: nothing.
// spec = { alerts: [[kind, app, text]], times: [t...], spots: [[x, y, depth 0 near..1 far]], cut, close: [from, dur, amount], focus: [x, y] }
const icon = {
  mail: ["#2f7cf6", "M4 7h16v10H4zM4 7l8 6 8-6"], chart: ["#30b65a", "M5 19V11M10 19V6M15 19v-5M20 19V9"],
  bell: ["#ff9500", "M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15zM10 20a2 2 0 0 0 4 0"], chat: ["#34c759", "M4 6h16v10H9l-5 4z"],
  cal: ["#ff3b30", "M5 6h14v13H5zM5 10h14M9 4v4M15 4v4"], cash: ["#0fb5a6", "M4 7h16v10H4zM12 9.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5"],
  box: ["#8e8e93", "M4 8l8-4 8 4v8l-8 4-8-4zM4 8l8 4 8-4M12 12v8"], play: ["#ff2d55", "M8 5v14l11-7z"],
};
export function createPings(spec) {
  const root = document.querySelector("#pings");
  const nodes = spec.alerts.map(([kind, app, text]) => {
    const [bg, path] = icon[kind];
    const node = h(`<div class="ping"><i style="background:${bg}"><svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="${path}"/></svg></i><div><b>${app}<span>now</span></b><p>${text}</p></div></div>`);
    root.append(node); return node;
  });
  const [cf, cd, amount] = spec.close ?? [0, 1, .2], [fx, fy] = spec.focus ?? [960, 480];
  return t => {
    const alive = t < spec.cut;
    nodes.forEach((node, i) => {
      const at = spec.times[i], [x, y, depth] = spec.spots[i % spec.spots.length];
      const a = alive ? smooth((t - at) / .2) : 0;
      show(node, a * (1 - depth * .3));
      if (a <= 0) return;
      const scale = (1.55 - depth) * (.88 + .12 * a) * (1 + Math.max(0, t - at) * .05);
      const close = smooth((t - cf) / cd) * amount;   // as they multiply, everything closes in
      node.style.transform = `translate3d(${x - 260 + (fx - x) * close}px,${y - 48 + (1 - a) * -26 + (fy - y) * close}px,0) scale(${scale})`;
      node.style.filter = `blur(${.8 + depth * 8}px)`;
    });
  };
}
