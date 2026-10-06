import { readFileSync, writeFileSync } from "node:fs";
import { config, path, arg } from "./lib.mjs";
// Animatic clock: a timeline from the SCRIPT alone, before any voice exists (no cost, no audio).
// Lets you block out and snapshot the whole picture while the script is still changing; when the real take arrives,
// run scripts/timeline.mjs and the same cue names land on the real voice.
//   node scripts/draft-timeline.mjs [--wps=2.2]
// Pace: words per second while speaking (eleven_v4 at speed 0.72 ≈ 2.2), plus pauses for [short pause] .35 s,
// [long pause] 1.2 s, "..." .45 s, sentence ends .3 s, commas .15 s. phrases.json filmTime/minGap are honoured.
const spec = JSON.parse(readFileSync(path("docs/phrases.json"), "utf8"));
const text = readFileSync(path(config.voice.script), "utf8");
const wps = Number(arg("wps", 2.2)), norm = v => (v ?? "").toLowerCase().replace(/[^a-z0-9']/g, "");
const words = []; let t = .3;
for (const tok of text.replace(/\[(long pause)\]/gi, " ⟨L⟩ ").replace(/\[(short pause|pause)\]/gi, " ⟨S⟩ ").replace(/\[[^\]]*\]/g, " ").split(/\s+/).filter(Boolean)) {
  if (tok === "⟨L⟩") { t += 1.2; continue; } if (tok === "⟨S⟩") { t += .35; continue; }
  if (!norm(tok)) continue;
  const d = (.18 + norm(tok).length * .045) * (2.2 / wps);
  words.push({ w: tok, t: +t.toFixed(3), e: +(t + d).toFixed(3) }); t += d;
  t += /\.\.\.$|…$/.test(tok) ? .45 : /[.!?]$/.test(tok) ? .3 : /[,;:]$/.test(tok) ? .15 : .04;
}
const find = (phrase, from) => { const p = phrase.split(" ").map(norm).filter(Boolean);
  for (let k = from; k < words.length; k++) if (p.every((x, j) => norm(words[k + j]?.w) === x)) return k; throw Error(`draft: "${phrase}" not in the script`); };
// Place phrases like timeline.mjs does: each phrase starts at its filmTime, or after its minimum gap; later words follow.
const segs = []; let from = 0, prevEnd = 0;
spec.phrases.forEach(([id, , phrase, want, gap = .4], n) => {
  const k = find(phrase, from), next = spec.phrases[n + 1] ? find(spec.phrases[n + 1][2], k + 1) : words.length;
  const natural = words[k].t, lead = Math.max(want ?? natural, prevEnd + gap), delta = lead - natural;
  for (let i = k; i < words.length; i++) { words[i].t += delta; words[i].e += delta; }
  for (let i = k; i < next; i++) words[i].seg = id;
  prevEnd = words[next - 1].e; from = next;
  segs.push({ id, src: "draft", lead: +lead.toFixed(3), filmStart: +lead.toFixed(3), speechEnd: +prevEnd.toFixed(3) });
});
const cues = Object.fromEntries(segs.map(s => [s.id, s.lead]));
for (const [name, value] of Object.entries(spec.cues ?? {})) {
  const [phrase, after] = Array.isArray(value) ? value : [value, null];
  const p = phrase.split(" ").map(norm).filter(Boolean), at = after ? cues[after] : 0;
  const k = words.findIndex((w, i) => w.t >= at && p.every((x, j) => norm(words[i + j]?.w) === x));
  if (k < 0) throw Error(`draft cue "${name}" not found`);
  cues[name] = +words[k].t.toFixed(3); cues[`${name}End`] = +words[k + p.length - 1].e.toFixed(3);
}
const duration = +(prevEnd + (spec.tail ?? 4.5)).toFixed(2);
writeFileSync(path("source/timeline.json"), JSON.stringify({ draft: true, duration, sources: {}, segments: segs, cues, words: words.map(w => ({ ...w, t: +w.t.toFixed(3), e: +w.e.toFixed(3) })) }, null, 1) + "\n");
console.log(segs.map(s => `${s.id.padEnd(12)} ${s.lead.toFixed(2)}–${s.speechEnd.toFixed(2)}`).join("\n"));
console.log("draft duration", duration, "(no audio: scripts/mix.py needs a real take)");
