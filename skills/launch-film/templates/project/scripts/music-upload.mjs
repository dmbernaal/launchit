import { readFile, writeFile, mkdir } from "node:fs/promises";
import { basename } from "node:path";
import { path, eleven } from "./lib.mjs";
// Upload a reference track you own (an approved earlier score, a stem, a temp mix) so plan chunks can be
// conditioned on it. Returns song_id plus the composition plan the model hears in it.
// Usage: node scripts/music-upload.mjs <audio-file> <name>
// Then, in a chunk: "conditioning_ref": { "song_id": "<id>", "range": { "start_ms": 48300, "end_ms": 56000 } }, "condition_strength": "high"
const [file, name] = process.argv.slice(2);
if (!file || !name) throw Error("Usage: node scripts/music-upload.mjs <audio-file> <name>");
const fd = new FormData();
fd.append("file", new Blob([await readFile(file)], { type: "audio/mpeg" }), basename(file));
fd.append("extract_composition_plan", "music_v2_5");
await mkdir(path("audio/music"), { recursive: true });
const res = await eleven("/v1/music/upload", { method: "POST", body: fd }, path("audio/music", `upload-${name}.error.json`));
const json = await res.json();
await writeFile(path("audio/music", `upload-${name}.json`), JSON.stringify(json, null, 2) + "\n");
console.log(JSON.stringify({ name, song_id: json.song_id, sections: json.composition_plan?.chunks?.length ?? json.composition_plan?.sections?.length }));
