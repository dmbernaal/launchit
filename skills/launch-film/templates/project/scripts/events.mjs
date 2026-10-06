import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { path } from "./lib.mjs";
// Picture and sound share one list of moments (source/events.js). This writes audio/events.json for the mix,
// and keeps index.html's composition and soundtrack durations equal to the timeline.
// If timeline.json carries warp "anchors" ([film, authored] pairs), authored times are mapped back to film time.
const T = JSON.parse(readFileSync(path("source/timeline.json"), "utf8"));
const { soundEvents } = await import(pathToFileURL(path("source/events.js")).href);
const A = T.anchors;
const toFilm = c => { if (!A) return c; for (let n = 1; n < A.length; n++) if (c <= A[n][1]) { const [a0, c0] = A[n - 1], [a1, c1] = A[n]; return a0 + (a1 - a0) * (c - c0) / (c1 - c0); } return T.duration; };
const sounds = soundEvents(T.cues, T).map(e => ({ ...e, at: +toFilm(e.at).toFixed(3), ...(e.until ? { until: +toFilm(e.until).toFixed(3) } : {}) }));
mkdirSync(path("audio"), { recursive: true });
writeFileSync(path("audio/events.json"), JSON.stringify({ sounds }, null, 1) + "\n");
let html = readFileSync(path("index.html"), "utf8");
html = html.replace(/(<main[^>]*data-duration=")[\d.]+/, `$1${T.duration}`).replace(/(<audio[^>]*data-duration=")[\d.]+/, `$1${T.duration}`);
writeFileSync(path("index.html"), html);
console.log(JSON.stringify({ sounds: sounds.length, duration: T.duration }));
