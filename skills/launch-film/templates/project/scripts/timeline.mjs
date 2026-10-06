import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { path } from "./lib.mjs";
// The film clock. Places each narrated phrase on film time, cutting the take only inside its own measured
// silences, and writes source/timeline.json (segments, word times, cues) for picture, sound and mix.
// docs/phrases.json:
// { "sources": { "main": "audio/voice/take-03" },
//   "phrases": [[id, source, "first words of the phrase", filmTime | null, minGapBefore], ...],
//   "tail": 4.6,                         seconds of picture after the last word
//   "cues": { "name": "words" | ["words", "earlierCue"] }  extra word cues; each also gets "<name>End" }
// filmTime null = keep the take's own breath before this phrase (at least minGapBefore).
const spec = JSON.parse(readFileSync(path("docs/phrases.json"), "utf8"));
const norm = v => (v ?? "").toLowerCase().replace(/[^a-z0-9']/g, "");
function words(a) { // alignment characters -> words, skipping [audio tags]
  const ch = a.characters, st = a.character_start_times_seconds, en = a.character_end_times_seconds, text = ch.join(""), out = [];
  for (let i = 0, tag = false, s = -1; i <= ch.length; i++) { const c = ch[i] ?? " ";
    if (c === "[") { tag = true; continue; } if (c === "]") { tag = false; continue; } if (tag) continue;
    if (/\s/.test(c)) { if (s >= 0) { const w = text.slice(s, i); if (norm(w)) out.push({ w, t: st[s], e: en[i - 1] }); s = -1; } } else if (s < 0) s = i; }
  return out;
}
function envelope(rel) { // dB per 10 ms
  const pcm = execFileSync("ffmpeg", ["-v", "error", "-i", path(rel, "narration-raw.mp3"), "-f", "f32le", "-ac", "1", "-ar", "16000", "-"], { maxBuffer: 1 << 28 });
  const x = new Float32Array(pcm.buffer, pcm.byteOffset, pcm.length / 4), hop = 160, out = [];
  for (let i = 0; i + hop <= x.length; i += hop) { let e = 0; for (let j = i; j < i + hop; j++) e += x[j] * x[j]; out.push(10 * Math.log10(e / hop + 1e-12)); }
  return out;
}
const W = {}, ENV = {};
// Word times: ElevenLabs character alignment (alignment.json) or, for any other provider or a recording,
// Whisper word timestamps mapped onto the script (words.json, written by scripts/align.py).
for (const [k, rel] of Object.entries(spec.sources)) {
  if (existsSync(path(rel, "alignment.json"))) W[k] = words(JSON.parse(readFileSync(path(rel, "alignment.json"), "utf8")).alignment);
  else if (existsSync(path(rel, "words.json"))) W[k] = JSON.parse(readFileSync(path(rel, "words.json"), "utf8")).words.filter(w => norm(w.w));
  else throw Error(`${rel} has neither alignment.json nor words.json: run python3 scripts/align.py ${rel}`);
  ENV[k] = envelope(rel);
}
// Alignment drifts from the audio by up to ~0.4 s: cut at the centre of the longest quiet run (< -45 dB) in [a, b].
function silenceCut(src, a, b) {
  const env = ENV[src], i0 = Math.max(0, Math.floor(a * 100)), i1 = Math.min(env.length - 1, Math.ceil(b * 100));
  let best = null, run = null;
  for (let i = i0; i <= i1; i++) { if (env[i] < -45) { run = run ?? { s: i }; run.e = i; if (!best || run.e - run.s > best.e - best.s) best = { ...run }; } else run = null; }
  return best ? (best.s + best.e) / 200 : (a + b) / 2;
}
function find(src, phrase, from = 0) { const p = phrase.split(" ").map(norm).filter(Boolean), l = W[src];
  for (let k = from; k < l.length; k++) if (p.every((x, j) => norm(l[k + j]?.w) === x)) return k; throw Error(`Missing "${phrase}" in ${src} after word ${from}`); }
const idx = []; const last = {};
for (const [id, src, phrase] of spec.phrases) { const k = find(src, phrase, last[src] ?? 0); idx.push({ id, src, k }); last[src] = k + 1; }
// One cut per boundary: the end of a phrase and the start of the next phrase from the same take share it.
const boundary = {};
const cutAt = (src, k) => { const key = `${src}:${k}`; if (!(key in boundary)) { const l = W[src]; boundary[key] = k > 0 ? silenceCut(src, l[k - 1].e - .15, l[k].t + .15) : 0; } return boundary[key]; };
const segments = []; let prevEnd = 0, prevSeg = null;
spec.phrases.forEach(([id, src, , want, gap = .4], n) => {
  const l = W[src], k = idx[n].k, first = l[k];
  const next = idx.slice(n + 1).find(x => x.src === src);
  const lastK = next ? next.k - 1 : l.length - 1, lastW = l[lastK], nextW = l[lastK + 1];
  const rawStart = cutAt(src, k);
  const rawEnd = nextW ? cutAt(src, lastK + 1) : lastW.e + .6;
  const natural = prevSeg && prevSeg.src === src ? prevEnd + (first.t - W[src][prevSeg.lastK].e) : prevEnd + gap;
  const film = Math.max(want ?? natural, prevEnd + gap);
  const offset = film - first.t;
  const seg = { id, src, rawStart: +rawStart.toFixed(3), rawEnd: +rawEnd.toFixed(3), offset: +offset.toFixed(3), filmStart: +(rawStart + offset).toFixed(3),
    filmEnd: +(rawEnd + offset).toFixed(3), lead: +film.toFixed(3), speechEnd: +(lastW.e + offset).toFixed(3), k, lastK };
  segments.push(seg); prevEnd = seg.speechEnd; prevSeg = seg;
});
for (let n = 1; n < segments.length; n++) if (segments[n].filmStart < segments[n - 1].filmEnd - .005) console.warn(`overlap: ${segments[n - 1].id} -> ${segments[n].id}`);
const fw = [];
for (const s of segments) for (let k = s.k; k <= s.lastK; k++) { const w = W[s.src][k]; fw.push({ w: w.w, t: +(w.t + s.offset).toFixed(3), e: +(w.e + s.offset).toFixed(3), seg: s.id }); }
fw.sort((a, b) => a.t - b.t);
const cues = Object.fromEntries(segments.map(s => [s.id, s.lead]));
// A cue is "words" (first match in the film) or ["words", "earlierCue"] (first match after that cue).
for (const [name, value] of Object.entries(spec.cues ?? {})) {
  const [phrase, from] = Array.isArray(value) ? value : [value, null];
  const after = from ? cues[from] : 0;
  const p = phrase.split(" ").map(norm).filter(Boolean);
  const k = fw.findIndex((w, i) => w.t >= after && p.every((x, j) => norm(fw[i + j]?.w) === x));
  if (k < 0) throw Error(`cue "${name}": "${phrase}" not found after ${after}s`);
  cues[name] = fw[k].t; cues[`${name}End`] = fw[k + p.length - 1].e;
}
const duration = +(segments[segments.length - 1].speechEnd + (spec.tail ?? 4.5)).toFixed(2);
const sources = Object.fromEntries(Object.entries(spec.sources).map(([k, v]) => [k, `${v}/narration-raw.mp3`]));
writeFileSync(path("source/timeline.json"), JSON.stringify({ duration, sources, segments, cues, words: fw }, null, 1) + "\n");
console.log(segments.map(s => `${s.id.padEnd(12)} ${s.filmStart.toFixed(2)}–${s.speechEnd.toFixed(2)}${s.lead !== null ? `  lead ${s.lead.toFixed(2)}` : ""}`).join("\n"));
console.log("duration", duration);
