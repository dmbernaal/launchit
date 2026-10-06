import { h, show, smooth, win, track, out } from "./util.js";
import { keyTimes } from "./events.js";
// A standalone iPhone running Messages, driven entirely by film time: lock screen + notification, the thread,
// typing on a real keyboard (keys light, the pop shows, predictions change), the send tap, typing dots, link
// previews, and the product's light around the glass. Styles: styles/phone.css.
//
// spec = {
//   contact: { name, avatar },                     avatar: image path (square, transparent PNG reads best)
//   pose: [[t, x, y, scale, alpha, dim], ...],     where the phone is; dim 0..1 darkens and blurs it
//   lock: { until, date, time, note: { at, tapAt, title, text } } | null
//   day: "Today 9:41 AM",
//   messages: [{ at, from: "them" | "me", text?, preview?: { img, host, title, sub, wide }, screen? }],
//        at 0 = already in the thread when it first appears; screen: true = a gallery screen lands here (gallery.js)
//   typing: [{ text, start, end, send, predictions: [a, b] }],   a reply typed on the keyboard (events.js keyTimes)
//   dots: [[from, to], ...],                       the typing indicator
//   glow: [[from, to], ...], flares: [t, ...]      the product's light around the glass, and its brief swells
//   glowColors: [7 colours]                        the light's palette (default: a soft "intelligence" spectrum)
// }
const icon = d => `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="${d}"/></svg>`;
const keyboard = () => {
  const row = s => `<div class="kb-row">${[...s].map(c => `<span class="key" data-key="${c.toLowerCase()}">${c}</span>`).join("")}</div>`;
  return `<div class="kb"><div class="kb-predict"><span></span><span></span><span></span></div>${row("QWERTYUIOP")}${row("ASDFGHJKL")}
    <div class="kb-row"><span class="key mod">⇧</span>${[..."ZXCVBNM"].map(c => `<span class="key" data-key="${c.toLowerCase()}">${c}</span>`).join("")}<span class="key mod">⌫</span></div>
    <div class="kb-row space"><span class="key mod">123</span><span class="key" data-key=" ">space</span><span class="key mod">return</span></div>
    <div class="kb-bottom"><span>☺</span>${icon("M9 4a3 3 0 0 1 6 0v8a3 3 0 0 1-6 0ZM5 10v2a7 7 0 0 0 14 0v-2M12 19v3")}</div><span class="kb-pop"></span></div>`;
};
const tail = `<svg class="tail" viewBox="0 0 24 24"><path d="M2 24c5 0 10-2 12-7V4h10v20Z" fill="currentColor"/></svg>`;
export function createPhone(spec) {
  const host = document.querySelector("#phone-stage");
  const avatar = `<span class="avatar"><img src="${spec.contact.avatar}" alt=""></span>`;
  host.innerHTML = `<div class="device"><i class="hw silent"></i><i class="hw volume"></i><i class="hw power"></i><div class="screen">
    <div class="status"><span>9:41</span><i class="island"></i><span class="sys"><svg viewBox="0 0 18 12" width="18" height="12"><rect x="0" y="8" width="3" height="4" rx="1" fill="currentColor"/><rect x="5" y="5.5" width="3" height="6.5" rx="1" fill="currentColor"/><rect x="10" y="3" width="3" height="9" rx="1" fill="currentColor"/><rect x="15" y="0" width="3" height="12" rx="1" fill="currentColor"/></svg>
      <svg viewBox="0 0 16 12" width="16" height="12"><path d="M8 11.5 5.6 9a3.4 3.4 0 0 1 4.8 0ZM3.4 6.8a6.6 6.6 0 0 1 9.2 0l-1.4 1.4a4.6 4.6 0 0 0-6.4 0ZM1 4.4a10 10 0 0 1 14 0l-1.4 1.4a8 8 0 0 0-11.2 0Z" fill="currentColor"/></svg><i class="battery"></i></span></div>
    <div class="scene"><header class="contact">${icon("M15 5l-7 7 7 7")}<div>${avatar}<strong>${spec.contact.name} ›</strong></div><span class="spacer"></span></header>
      <div class="conversation"><div class="thread"><p class="msg-day">${spec.day ?? "Today 9:41 AM"}</p></div></div>
      <div class="composer"><span class="plus">${icon("M12 5v14M5 12h14")}</span><span class="input"><span class="draft"></span><i class="caret"></i><span class="send">${icon("M12 19V5M6 11l6-6 6 6")}</span></span></div></div>
    ${keyboard()}<span class="touch"></span><div class="glow"></div><i class="home"></i></div></div>`;
  const screen = host.querySelector(".screen"), thread = host.querySelector(".thread"), conversation = host.querySelector(".conversation");
  const msg = m => {
    const n = h(`<div class="msg ${m.from === "me" ? "me" : "them"}${m.screen ? " screen-msg" : ""}"></div>`);
    if (m.text) n.append(h(`<div class="bubble"><span>${m.text}</span>${tail}</div>`));
    if (m.preview) n.append(h(`<div class="preview${m.preview.wide ? " wide" : ""}"><img src="${m.preview.img}" alt=""><div><span class="host">${m.preview.host ?? ""}</span><strong>${m.preview.title}</strong><span>${m.preview.sub ?? ""}</span></div></div>`));
    return { ...m, node: n };
  };
  const msgs = spec.messages.map(msg), dots = (spec.dots ?? []).map(([a, b]) => ({ a, b, node: h(`<div class="msg them dots"><div class="bubble"><i></i><i></i><i></i></div></div>`) }));
  // Thread order is time order; typing dots sit where their reply will land.
  [...msgs.map(m => ({ t: m.at, node: m.node })), ...dots.map(d => ({ t: d.a + 1e-3, node: d.node }))].sort((a, b) => a.t - b.t).forEach(x => thread.append(x.node));
  let lock = null, note = null;
  if (spec.lock) {
    const L = spec.lock;
    lock = h(`<div class="lock"><div class="wall"></div><div class="lock-date">${L.date}</div><strong class="lock-time">${L.time ?? "9:41"}</strong>
      ${L.note ? `<div class="note"><div class="note-icon">${avatar}</div><div><div class="note-title"><strong>${L.note.title}</strong><span>now</span></div><p>${L.note.text}</p></div></div>` : ""}</div>`);
    screen.insertBefore(lock, screen.querySelector(".kb")); note = lock.querySelector(".note");
  }
  const draft = host.querySelector(".draft"), caret = host.querySelector(".caret"), send = host.querySelector(".send"), composer = host.querySelector(".composer");
  const board = host.querySelector(".kb"), pop = host.querySelector(".kb-pop"), touch = host.querySelector(".touch"), predict = board.querySelector(".kb-predict");
  const keys = [...board.querySelectorAll("[data-key]")], glow = host.querySelector(".glow");
  const typing = spec.typing ?? [], cols = spec.glowColors ?? ["#BC82F3", "#F5B9EA", "#8D9FFF", "#AA6EEE", "#FF6778", "#FFBA71", "#C686FF"];   // 7 colours; use the brand's
  return t => {
    const [x, y, s, a, dim] = track(t, spec.pose);
    show(host, a);
    if (a <= .001) return;
    host.style.transform = `translate3d(${x}px,${y}px,0) scale(${s})`;
    host.style.filter = dim > .01 ? `brightness(${1 - dim}) blur(${dim * 4}px)` : "none";
    if (lock) { // the lock screen, its notification, the tap that opens the thread
      const L = spec.lock, open = smooth((t - L.until) / .4);
      show(lock, 1 - open); lock.style.filter = open > 0 ? `blur(${open * 10}px)` : "none"; lock.style.transform = `scale(${1 + open * .1})`;
      if (note) { const n = out((t - L.note.at) / .5); note.style.opacity = String(n);
        note.style.transform = `translateY(${(1 - n) * -30}px) scale(${1 - .03 * smooth((t - L.note.tapAt) / .12) + .03 * smooth((t - L.note.tapAt - .15) / .15)})`; }
    }
    for (const m of msgs) { // arrivals: rise 12 px and settle; a gallery screen's message shows as the screen lands in it
      const e = m.at === 0 ? 1 : smooth((t - m.at) / .36), o = m.screen ? smooth((t - m.at - .28) / .14) : e;
      m.node.style.display = t >= m.at ? "" : "none";
      m.node.style.opacity = String(o); m.node.style.transform = `translateY(${(1 - e) * 12}px) scale(${.97 + .03 * e})`;
    }
    for (const d of dots) {
      d.node.style.display = t >= d.a && t < d.b ? "" : "none";
      d.node.querySelectorAll("i").forEach((dot, i) => { const p = .5 + .5 * Math.sin((t - d.a) * 9 - i * .9); dot.style.opacity = String(.45 + .55 * p); dot.style.transform = `translateY(${-2.5 * p}px)`; });
    }
    // The keyboard rises for whichever reply is being typed.
    const pass = typing.find(p => t < p.send + .6) ?? typing[typing.length - 1];
    if (pass) {
      const kt = keyTimes(pass), done = kt.filter(k => t >= k.time).length, up = win(t, pass.start - .4, pass.send + .55, .3, .3);
      board.style.transform = `translateY(${(1 - up) * 305}px)`; board.style.opacity = String(up);
      composer.style.bottom = `${42 + up * 265}px`; conversation.style.height = `${720 - up * 265}px`;
      const writing = t >= pass.start - .4 && t < pass.send;
      draft.textContent = writing && done ? pass.text.slice(0, done) : "iMessage"; draft.style.color = writing && done ? "#fff" : "#8e8e93";
      caret.style.opacity = writing ? String(Math.sin(t * 9) > -.2 ? 1 : 0) : "0";
      send.style.opacity = writing && done ? "1" : "0"; send.style.transform = `scale(${t >= pass.send - .1 && t < pass.send + .05 ? .85 : 1})`;
      const word = pass.text.slice(0, done).split(" ").pop(), [p1, p2] = pass.predictions ?? ["", ""];
      predict.innerHTML = word ? `<span>“${word}”</span><span>${p1}</span><span>${p2}</span>` : "<span>I</span><span>The</span><span>Did</span>";
      const recent = [...kt].reverse().find(k => t >= k.time && t - k.time < .11);
      keys.forEach(k => { k.dataset.down = String(!!recent && recent.key.toLowerCase() === k.dataset.key); });
      const kNode = recent && /[a-z']/i.test(recent.key) && keys.find(n => n.dataset.key === recent.key.toLowerCase());
      if (kNode) { pop.textContent = recent.key; pop.style.opacity = "1"; pop.style.left = `${kNode.offsetLeft - 5}px`; pop.style.top = `${kNode.offsetTop - 46}px`; } else pop.style.opacity = "0";
    } else { board.style.opacity = "0"; draft.textContent = "iMessage"; draft.style.color = "#8e8e93"; caret.style.opacity = "0"; send.style.opacity = "0"; }
    // A fingertip on the notification and on each send.
    const taps = [...(spec.lock?.note ? [[spec.lock.note.tapAt, 230, 360]] : []), ...typing.map(p => [p.send, 392, 652])];
    const tap = taps.find(([at]) => t >= at - .05 && t < at + .45);
    if (tap) { const p = smooth((t - tap[0] + .05) / .45); show(touch, Math.sin(p * Math.PI)); touch.style.left = `${tap[1]}px`; touch.style.top = `${tap[2]}px`; touch.style.transform = `scale(${.6 + p})`; } else show(touch, 0);
    // New messages push the thread up as they arrive instead of jumping.
    const max = conversation.scrollHeight - conversation.clientHeight;
    conversation.scrollTop = max - msgs.reduce((sum, m) => sum + (m.at > 0 && t >= m.at ? (1 - smooth((t - m.at) / .36)) * m.node.offsetHeight : 0), 0);
    // The light: a thin bright edge and a soft inward bloom, seven colours whose stops wander so it flows, never spins.
    const on = Math.max(0, ...(spec.glow ?? []).map(([g0, g1]) => win(t, g0, g1, .5, .6)));
    show(glow, on);
    if (on > 0) {
      const flare = Math.min(1.2, (spec.flares ?? []).reduce((sum, f) => sum + Math.max(0, 1 - Math.abs(t - f) / .4), 0));
      const stops = cols.map((_, i) => (i / 7 + .045 * Math.sin(t * (.9 + i * .37) + i * 1.7) + .03 * Math.sin(t * (1.7 + i * .21) + i)) * 100);
      glow.style.setProperty("--flare", String(flare));
      glow.style.setProperty("--spectrum", `conic-gradient(from ${(t * 38 + 20 * Math.sin(t * .7)) % 360}deg, ${cols.map((c, i) => `${c} ${stops[i].toFixed(1)}%`).join(",")}, ${cols[0]} 100%)`);
    }
  };
}
