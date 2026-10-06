import { show, smooth, out, sheen } from "./util.js";
// The name, once. Optionally one letter grows into the word on cue (Kairos -> Kai·y·ros): the film's idea
// resolving into the brand. spec = { parts: [["Kai"], ["y", "grow"], ["ros"]], tag, url, at, growAt, end }
export function createSignoff(spec) {
  const root = document.querySelector("#signoff");
  root.innerHTML = `<h1 class="mark">${spec.parts.map(([text, kind]) => `<span${kind === "grow" ? ' class="grow sheen"' : ""}>${text}</span>`).join("")}</h1>
    ${spec.tag ? `<p class="tag">${spec.tag}</p>` : ""}${spec.url ? `<p class="url">${spec.url}</p>` : ""}`;
  const mark = root.querySelector(".mark"), grow = root.querySelector(".grow"), tag = root.querySelector(".tag"), url = root.querySelector(".url");
  const growAt = spec.growAt ?? spec.at + 1;
  return t => {
    const a = smooth((t - spec.at - .1) / .7) * (1 - smooth((t - spec.end) / 1.1));
    show(root, a);
    if (a <= 0) return;
    mark.style.transform = `translateY(${(1 - smooth((t - spec.at - .1) / .9)) * 16}px)`;
    mark.style.filter = t < spec.at + .8 ? `blur(${(1 - smooth((t - spec.at - .1) / .7)) * 8}px)` : "none";
    if (grow) {
      const g = out((t - (growAt - .25)) / .8);
      grow.style.maxWidth = `${g * .62}em`; grow.style.opacity = String(smooth((t - growAt) / .5));
      grow.style.transform = `translateY(${(1 - g) * -38}px)`; sheen(grow, t, growAt + .2, 1.4);
    }
    if (tag) show(tag, smooth((t - growAt - .1) / .6));
    if (url) show(url, smooth((t - (growAt + 2.4)) / .7));
  };
}
