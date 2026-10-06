// Moments that picture and sound share. Pure data and functions only (scripts/events.mjs imports this in Node).
// Typed replies: the keyboard, the draft text, every key sound and the send all come from these numbers.
// c = timeline cues (phrase ids and named word cues from docs/phrases.json).
export const typing = c => [
  { id: "ask", text: "that book idea?", start: c.moment - 1.6, end: c.moment - .55, send: c.moment - .35, predictions: ["idea", "ideas"] },
];
export function keyTimes(pass) {
  return [...pass.text].map((key, i) => ({ key, time: +(pass.start + (pass.end - pass.start) * (i + .3) / pass.text.length).toFixed(3) }));
}
// Every sound effect, on the film clock. Gains are dB after each file is peak-normalized to -1 dBFS.
// Typical: UI sounds -14 to -20, ticks -15 to -20, keys -21, shimmer -15 to -19. "until" cuts a sound dead; "pan" -1..1.
export function soundEvents(c) {
  const e = [
    { sound: "shimmer", at: .3, gain: -18 },
    { sound: "tick", at: c.hundred, gain: -19 },
    { sound: "bloom", at: c.listens - .3, gain: -20 },
    ...typing(c).flatMap(p => [...keyTimes(p).map(k => ({ sound: "key", at: k.time, gain: -21 })), { sound: "send", at: p.send, gain: -17 }]),
    { sound: "receive", at: c.there, gain: -15 },
    { sound: "shimmer", at: c.name - .4, gain: -17 },
  ];
  return e.sort((a, b) => a.at - b.at);
}
