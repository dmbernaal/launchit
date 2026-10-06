import { h, show, smooth, win, expo, lerp, inOut } from "./util.js";
// "It all happens in one conversation": the product's real screens gather behind the phone, angled toward it,
// fully in frame. Then, one at a time, the thread makes room and each screen lifts out of the gallery and lands
// in the thread as a message (phone.js shows that message as the screen settles: messages[].screen = true).
// An earlier version, where everything shrank into the phone and vanished, was called "cheap" in review.
//
// spec = { screens: ["assets/app-a.png", ...], arrive: [t, ...] (same times as the screen messages),
//          enter: t (gallery starts gathering), slot: [x, y, scale] (newest message's image, offset from frame centre) }
// Measure slot on a snapshot of the phone with the last screen message in place: image centre minus (960, 540),
// image width / 1920. Standalone phone at scale 1, 300 px previews: about [-41, 182, .162].
export function createGallery(spec) {
  const cam = document.querySelector("#cam");
  const back = h(`<section class="gallery">${spec.screens.map(s => `<img src="${s}" alt="">`).join("")}</section>`);
  const front = h(`<section class="gallery front"></section>`);
  cam.append(back, front);
  const shots = [...back.querySelectorAll("img")], A = spec.arrive, [sx, sy, ss] = spec.slot ?? [-41, 182, .162];
  return t => {
    const ra = win(t, spec.enter, A[A.length - 1] + .45, .3, .05); show(back, ra); show(front, ra);
    if (ra <= 0) return;
    shots.forEach((img, i) => {
      const side = i % 2 ? 1 : -1, row = Math.floor(i / 2), rows = Math.ceil(shots.length / 2);
      const gx = side * (590 + (row === 1 ? 40 : 0)), gy = (row - (rows - 1) / 2) * 290 + Math.sin(t * 1.1 + i * 1.3) * 5;
      const e = expo((t - (spec.enter + i * .09)) / .8), land = A[i] + .36, f = inOut((t - (land - .55)) / .55);
      const parent = f > 0 ? front : back; if (img.parentNode !== parent) parent.append(img);   // in flight it passes in front of the phone
      const x = lerp(gx + side * (1 - e) * 160, sx, f), y = lerp(gy, sy, f) - 40 * Math.sin(Math.PI * f), z = -(1 - e) * 400;
      img.style.transform = `translate(-50%,-50%) translate3d(${x}px,${y}px,${z}px) rotateY(${-side * 20 * (1 - f)}deg) scale(${lerp(.2, ss, f)})`;
      img.style.opacity = String(Math.min(1, e * 1.6) * (1 - smooth((t - (A[i] + .3)) / .14)));
    });
  };
}
