import { gsap } from "gsap";
import timeline from "./timeline.json";
import { track } from "./util.js";
import { createScenes } from "./scenes.js";
// The film clock. HyperFrames seeks window.__timelines[ID]; a paused GSAP timeline drives one number, and every
// frame redraws the whole picture from it (draw(t) for every part, in layer order). No CSS animations, no
// transitions, no requestAnimationFrame: only pure functions of t, so any frame renders identically on any worker.
async function main() {
  if (document.readyState === "loading") await new Promise(r => document.addEventListener("DOMContentLoaded", r, { once: true }));
  const ID = document.querySelector("[data-composition-id]").dataset.compositionId;   // read after the DOM exists
  const { parts, push, ready } = await createScenes(timeline);
  await document.fonts.ready;
  await Promise.all([...document.images].map(img => img.decode().catch(() => {})));
  if (ready) await ready;
  // Nothing in these films is ever quite still: a slow push on the whole stage, reset at every hard cut.
  const cam = document.querySelector("#cam");
  // Optional warp: picture authored on one clock, voice re-timed later. anchors = [[film, authored], ...].
  const A = timeline.anchors;
  const warp = A ? f => { for (let n = 1; n < A.length; n++) if (f <= A[n][0]) { const [a0, c0] = A[n - 1], [a1, c1] = A[n]; return c0 + (c1 - c0) * (f - a0) / (a1 - a0); } return A[A.length - 1][1]; } : f => f;
  const draw = f => { const t = warp(f); parts.forEach(p => p(t)); if (push) cam.style.transform = `scale(${track(t, push, x => x)[0]})`; };
  let time = 0;
  const clock = Object.defineProperty({}, "time", { get: () => time, set: v => { time = Number(v); draw(time); } });
  const tl = gsap.timeline({ paused: true });
  tl.to(clock, { time: timeline.duration, duration: timeline.duration, ease: "none" }, 0);
  window.__timelines[ID] = tl;
  tl.totalTime(.001, true); tl.totalTime(0, true); draw(0);
  document.documentElement.dataset.launchReady = "true";
}
main().catch(error => { console.error("film:", error); });
