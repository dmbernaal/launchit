import { mkdir, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { path, arg } from "./lib.mjs";
// Bring in a score from anywhere: a licensed library track, a composer's stems bounced to one file, a Suno or Udio
// export, a local MusicGen / Stable Audio Open render, or your own recording. It becomes a "take" exactly like a
// generated one, so music-scan.py, docs/mix.json pieces and mix.py treat it the same way.
//   node scripts/music-import.mjs --from=path/to/track.wav --take=library-01 [--start=0.4] [--license="…"]
// --start: the film time the track's 0 s is meant to sit at (used by music-scan.py to print film times).
const from = arg("from"), take = arg("take");
if (!from || !take) throw Error("Usage: node scripts/music-import.mjs --from=track.wav --take=name [--start=0.4] [--license=…]");
if (!existsSync(from)) throw Error(`No such file: ${from}`);
const dir = path("audio/music", take);
if (existsSync(dir)) throw Error(`audio/music/${take} exists; pick another --take name`);
await mkdir(dir, { recursive: true });
execFileSync("ffmpeg", ["-v", "error", "-y", "-i", from, "-ar", "44100", "-ac", "2", "-b:a", "192k", `${dir}/score.mp3`]);
const sha = createHash("sha256").update(readFileSync(`${dir}/score.mp3`)).digest("hex");
await writeFile(`${dir}/provenance.json`, JSON.stringify({ imported_at: new Date().toISOString(), from, start_s: Number(arg("start", 0)), license: arg("license", "UNSPECIFIED — record the license before publishing"), sha256: sha }, null, 2) + "\n");
console.log(JSON.stringify({ take, file: `audio/music/${take}/score.mp3` }));
