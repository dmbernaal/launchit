import { h, show, smooth, win, revealWords, sheen, spoken } from "./util.js";
// Lines that matter, in white, revealed word by word exactly as she says them. The spectrum passes once through
// the word that carries the idea (sheen), or flows through a whole line (spectrum) for the single biggest claim.
// spec: { cls, at, end, lines: [[display, spokenPhrase, { sheen: [words], muted: [words], spectrum: true }]], scale: true }
//   display may differ from what is spoken (clean punctuation, a numeral for a spelled-out number).
const norm = w => w.toLowerCase().replace(/[^a-z0-9'$%.]/g, "");
export function createHeadlines(timeline, specs) {
  const root = document.querySelector("#headlines");
  const built = specs.map(spec => {
    const node = h(`<div class="hl ${spec.cls}"></div>`), spans = [], shines = [];
    for (const [display, phrase, opts = {}] of spec.lines) {
      const words = spoken(timeline, phrase, spec.at - .3), line = h(`<p class="hl-line"></p>`);
      display.split(" ").forEach((text, i) => {
        const bare = norm(text), lit = opts.sheen?.map(norm).includes(bare);
        const span = h(`<span class="w${lit ? " sheen" : ""}${opts.muted?.map(norm).includes(bare) ? " muted" : ""}${opts.spectrum ? " spectrum" : ""}">${text}</span>`);
        line.append(span, " ");
        const t = words[Math.min(i, words.length - 1)].t;
        spans.push({ node: span, t });
        if (lit) shines.push({ node: span, t: t + .15 });
      });
      node.append(line);
    }
    root.append(node);
    return { node, spans, shines, spec, flow: [...node.querySelectorAll(".spectrum")] };
  });
  return t => {
    for (const b of built) {
      const a = win(t, b.spec.at - .1, b.spec.end, .25, b.spec.fadeOut ?? .35);
      show(b.node, a);
      if (a <= 0) continue;
      revealWords(b.spans, t);
      b.shines.forEach(x => sheen(x.node, t, x.t, 1.3));
      if (b.spec.scale) b.node.style.transform = `scale(${1.06 - .06 * smooth((t - b.spec.at) / .5)})`;   // a held claim settles into place
      b.flow.forEach((n, i) => n.style.setProperty("--flow", `${((t - b.spec.at) * 40 + i * 18) % 300}%`));
    }
  };
}
