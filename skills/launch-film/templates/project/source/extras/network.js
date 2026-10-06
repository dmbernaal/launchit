import { h, show, smooth, out, win } from "../util.js";
// Where it goes. The agent sits at the centre; each platform appears on its spoken word and a beam of light grows out
// of her to reach it. Then small pulses keep travelling outward along every connected beam, so the network reads as
// alive and as coming from her. The layer sits BEHIND the mascot (z-index below #mascot-stage): beams emerge from her.
// spec = { hub: [x, y], window: [a, b], nodes: [{ label, at, pos: [x, y], state: "live" | "next" }] }
const NS = "http://www.w3.org/2000/svg";
export function createNetwork(spec) {
  const [hx, hy] = spec.hub;
  const node = h(`<section class="net-layer"><svg class="links" viewBox="0 0 1920 1080"><defs>
      <filter id="beam-glow" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="6"/></filter>
      <filter id="pulse-glow" x="-200%" y="-200%" width="500%" height="500%"><feGaussianBlur stdDeviation="4"/></filter>
      ${spec.nodes.map((n, i) => `<linearGradient id="beam-${i}" gradientUnits="userSpaceOnUse" x1="${hx}" y1="${hy}" x2="${n.pos[0]}" y2="${n.pos[1]}">
        <stop offset="0" stop-color="${n.state === "live" ? "#7ff0a4" : "#d2bcff"}" stop-opacity=".95"/><stop offset=".55" stop-color="${n.state === "live" ? "#3ccf68" : "#b48aff"}" stop-opacity=".7"/>
        <stop offset="1" stop-color="${n.state === "live" ? "#3ccf68" : "#6aa6ff"}" stop-opacity=".35"/></linearGradient>`).join("")}</defs>
      ${spec.nodes.map((_, i) => `<path class="beam-glow" filter="url(#beam-glow)" stroke="url(#beam-${i})" pathLength="1"/><path class="beam" stroke="url(#beam-${i})" pathLength="1"/>`).join("")}
      <g class="pulses"></g></svg>
    ${spec.nodes.map(n => `<span class="tool ${n.state ?? "next"}"><b>${n.label}</b>${n.state === "live" ? `<em class="live-pill">Live</em>` : ""}</span>`).join("")}</section>`);
  document.querySelector("#cam").append(node);
  const glows = [...node.querySelectorAll(".beam-glow")], beams = [...node.querySelectorAll(".beam")], chips = [...node.querySelectorAll(".tool")];
  const pulseLayer = node.querySelector(".pulses");
  const PER = 2;   // pulses in flight per beam
  const pulses = spec.nodes.map((n, i) => Array.from({ length: PER }, () => {
    const c = document.createElementNS(NS, "circle"); c.setAttribute("r", "3.4"); c.setAttribute("class", `pulse${n.state === "live" ? " live" : ""}`);
    const g = document.createElementNS(NS, "circle"); g.setAttribute("r", "9"); g.setAttribute("class", `pulse-halo${n.state === "live" ? " live" : ""}`); g.setAttribute("filter", "url(#pulse-glow)");
    pulseLayer.append(g, c); return { c, g, i };
  }));
  spec.nodes.forEach((n, i) => { const d = `M${hx},${hy} L${n.pos[0]},${n.pos[1]}`; beams[i].setAttribute("d", d); glows[i].setAttribute("d", d);
    chips[i].style.left = `${n.pos[0]}px`; chips[i].style.top = `${n.pos[1]}px`; });
  return t => {
    const a = win(t, spec.window[0], spec.window[1], .4, .5);
    show(node, a);
    if (a <= 0) return;
    spec.nodes.forEach((n, i) => {
      const k = out((t - n.at) / .5), c = smooth((t - n.at - .12) / .3);
      beams[i].style.strokeDashoffset = glows[i].style.strokeDashoffset = String(1 - k);
      show(chips[i], c); chips[i].style.transform = `translate(-50%,-50%) scale(${.9 + .1 * c})`;
      chips[i].dataset.on = String(c > .6);
      // Pulses start once the beam has reached its platform; each travels from her to it in 1.4 s.
      pulses[i].forEach((p, j) => {
        const run = (t - n.at - .55) / 1.4 + j / PER;
        const on = run > 0 && t > n.at + .55 ? 1 : 0, f = ((run % 1) + 1) % 1;
        const x = hx + (n.pos[0] - hx) * f, y = hy + (n.pos[1] - hy) * f, fade = Math.sin(Math.PI * f) * on;
        for (const el of [p.c, p.g]) { el.setAttribute("cx", x.toFixed(1)); el.setAttribute("cy", y.toFixed(1)); el.style.opacity = String(fade); }
      });
    });
  };
}
