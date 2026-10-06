import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { config, secret, FILM } from "./lib.mjs";
// Checks every dependency a film needs and says how to install what's missing. Never prints key values.
//   node scripts/doctor.mjs        (or: npm run doctor)
const mac = process.platform === "darwin", rows = [];
const run = (cmd, args) => { try { return execFileSync(cmd, args, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim(); } catch { return null; } };
const add = (ok, name, detail, fix, required = true) => rows.push({ ok, name, detail, fix, required });
const install = (brew, apt) => (mac ? `brew install ${brew}` : `sudo apt-get install -y ${apt}`);
// Runtime
const major = Number(process.versions.node.split(".")[0]);
add(major >= 22, "Node.js ≥ 22", process.versions.node, "Install Node 22+ (https://nodejs.org or `nvm install 22`)");
// Find node_modules/<pkg>/package.json walking up from the film (some packages don't export their package.json).
const pkgVersion = pkg => { for (let dir = FILM; ; dir = dirname(dir)) { const f = resolve(dir, "node_modules", pkg, "package.json");
  if (existsSync(f)) return JSON.parse(readFileSync(f, "utf8")).version; if (dirname(dir) === dir) return null; } };
for (const [pkg, required] of [["gsap", true], ["esbuild", true], ["hyperframes", true], ["three", false]]) {
  const v = pkgVersion(pkg);
  add(!!v, `npm: ${pkg}`, v ?? "missing", required ? "npm install" : "npm install (only needed for a 3D mascot)", required);
}
const hf = run("npx", ["--no-install", "hyperframes", "--version"]);
add(!!hf, "HyperFrames CLI", hf ?? "not runnable", "npm install (then `npx hyperframes doctor` checks its browser)");
// Media tools
for (const [bin, args, brew, apt] of [["ffmpeg", ["-version"], "ffmpeg", "ffmpeg"], ["ffprobe", ["-version"], "ffmpeg", "ffmpeg"], ["sox", ["--version"], "sox", "sox"]]) {
  const out = run(bin, args); add(!!out, bin, out ? out.split("\n")[0].slice(0, 60) : "missing", install(brew, apt));
}
const py = run("python3", ["--version"]); add(!!py, "Python 3", py ?? "missing", install("python@3.12", "python3"));
const np = run("python3", ["-c", "import numpy; print(numpy.__version__)"]); add(!!np, "numpy", np ?? "missing", "python3 -m pip install numpy");
const wh = run("whisper", ["--help"]); add(!!wh, "Whisper CLI (openai-whisper)", wh ? "ok" : "missing", mac ? "brew install openai-whisper  (or: python3 -m pip install -U openai-whisper)" : "python3 -m pip install -U openai-whisper",
  true);
// Providers (keys are optional: each provider has a no-key alternative)
const P = config.providers ?? { voice: "elevenlabs", music: "elevenlabs", sfx: "elevenlabs" };
const eleven = !!secret("ELEVENLABS_API_KEY", false), openai = !!secret("OPENAI_API_KEY", false);
add(eleven || !Object.values(P).includes("elevenlabs"), "ELEVENLABS_API_KEY", eleven ? "found" : "not set",
  "Only needed for elevenlabs providers: put it in .env.local, or switch providers in film.config.json (see references/11-providers.md)", Object.values(P).includes("elevenlabs"));
add(openai || P.voice !== "openai", "OPENAI_API_KEY", openai ? "found" : "not set", "Only needed for providers.voice = openai", P.voice === "openai");
if (P.voice === "local") { const cmd = config.voice?.local?.command?.split(" ")[0]; const ok = cmd && run("sh", ["-c", `command -v ${cmd}`]); add(!!ok, `local voice command (${cmd})`, ok ? "found" : "missing", "Install your local TTS or change config.voice.local.command"); }
// Report
let bad = 0;
for (const r of rows) { const mark = r.ok ? "✓" : r.required ? "✗" : "–"; if (!r.ok && r.required) bad++;
  console.log(`${mark} ${r.name.padEnd(30)} ${String(r.detail).padEnd(26)}${r.ok ? "" : `  → ${r.fix}`}`); }
console.log(`\nproviders: voice=${P.voice}  music=${P.music}  sfx=${P.sfx}`);
console.log(bad ? `\n${bad} required item(s) missing.` : "\nReady. Next: `npx hyperframes doctor` checks the render browser.");
process.exit(bad ? 1 : 0);
