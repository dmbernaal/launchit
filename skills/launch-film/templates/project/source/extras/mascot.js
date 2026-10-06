import { AgXToneMapping, SRGBColorSpace, WebGLRenderer } from "three";
import { win, track, show } from "../util.js";
// A 3D mascot (three.js) driven by film time. Every frame re-derives the pose from absolute time (emote start +
// elapsed), so seeks and parallel render workers agree. Bring your own scene: `factory(renderer)` must return
//   { scene, camera, resize(w, h), models: [{ playEmote(name, startSeconds), stopEmote(), update(t, dt, gaze, live) }] }
// (the shape of the Kaiyros landing-page ghost). If your character has no emote system, return a model whose methods
// pose it from `t` directly, or use extras/orb.js instead.
// spec = { factory, windows: [[a, b, fadeIn, fadeOut]], pose: [[t, x, y, scale]], emotes: [[t, name]], size: [600, 750] }
// HTML: <div id="mascot-stage"></div> (left 660, top 30, 600×750 by default; see extras.css)
export function createMascot(spec) {
  const [w, h] = spec.size ?? [600, 750];
  const renderer = new WebGLRenderer({ alpha: true, antialias: true, preserveDrawingBuffer: true });
  renderer.setPixelRatio(2); renderer.setSize(w, h, false);
  renderer.outputColorSpace = SRGBColorSpace; renderer.toneMapping = AgXToneMapping; renderer.toneMappingExposure = 1; renderer.setClearColor(0, 0);
  const host = document.querySelector("#mascot-stage"); host.appendChild(renderer.domElement);
  const stage = spec.factory(renderer); stage.resize(w, h); renderer.compile(stage.scene, stage.camera);
  const model = stage.models[0];
  return t => {
    const alpha = Math.max(0, ...spec.windows.map(([a, b, fi, fo]) => win(t, a, b, fi, fo)));
    show(host, alpha);
    if (alpha <= .001) return;
    const [x, y, s] = track(t, spec.pose);
    host.style.transform = `translate3d(${x}px,${y}px,0) scale(${s})`;
    const emote = [...(spec.emotes ?? [])].reverse().find(([at]) => t >= at);
    model.stopEmote?.();
    if (emote) model.playEmote?.(emote[1], emote[0]);
    model.update(t, 10, { x: Math.sin(t * .5) * .03, y: 0 }, false);
    renderer.render(stage.scene, stage.camera);
  };
}
