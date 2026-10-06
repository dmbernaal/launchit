import { createHeadlines } from "./headlines.js";
import { createPhone } from "./phone.js";
import { createSignoff } from "./signoff.js";
import { typing } from "./events.js";
// The film's own scenes: this is the file each film rewrites. Everything it imports is reusable.
// Build every node once, then return draw functions of t. Cues come from source/timeline.json.
// The example is a 25-second film for a fictional note app ("Acme"): two spoken lines, a text exchange, the name.
// Optional components (market numbers, a feed of posters, a network, a marketplace, a 3D mascot or a light orb) live
// in source/extras/ with their styles in source/extras/extras.css.
export async function createScenes(timeline) {
  const c = timeline.cues, END = timeline.duration, T = typing(c);
  const parts = [];
  // Words: the lines that matter, word by word as she says them; the spectrum only on the word that carries the idea.
  parts.push(createHeadlines(timeline, [
    { cls: "hl-mid", at: c.open, end: c.listens - .4, lines: [["You have a hundred ideas a day.", "you have a hundred ideas a day", { sheen: ["hundred"] }],
      ["You keep almost none.", "and you keep almost none", { muted: ["you", "keep"] }]] },
    { cls: "hl-big", at: c.listens, end: T[0].start - .5, scale: true, lines: [["Acme remembers.", "acme listens and remembers", { spectrum: true }]] },
  ]));
  // The phone: a question typed, the answer already there.
  parts.push(createPhone({
    contact: { name: "Acme", avatar: "assets/avatar.svg" }, day: "Today 9:41 AM",
    pose: [[0, 0, 60, .9, 0, 0], [T[0].start - .7, 0, 60, .9, 0, 0], [T[0].start - .2, 0, 0, 1, 1, 0], [c.name - .9, 0, 0, 1, 1, 0], [c.name - .3, 0, 30, .92, 0, 0]],
    messages: [
      { at: 0, from: "them", text: "Saved: “A novel told through receipts.” 📚" },
      { at: T[0].send, from: "me", text: T[0].text },
      { at: c.there, from: "them", text: "Here it is, from March 3:", preview: { img: "assets/preview.svg", host: "acme.example", title: "A novel told through receipts", sub: "Voice note · 0:42 · March 3" } },
    ],
    typing: T, dots: [[T[0].send + .15, c.there]], glow: [[T[0].start - .3, c.name - .4]], flares: [c.there + .1],
  }));
  // The name.
  parts.push(createSignoff({ parts: [["Acme"]], tag: "Your second memory.", url: "acme.example", at: c.name, growAt: c.memory - .2, end: END + 5 }));
  // A slow push on the whole stage: nothing is ever quite still. Reset to 1 right after a hard cut.
  const push = [[0, 1], [END, 1.04]];
  return { parts, push, ready: null };
}
