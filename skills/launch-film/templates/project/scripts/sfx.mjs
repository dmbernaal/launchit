import { readFile, writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { config, path, eleven } from "./lib.mjs";
// Original UI and foley sounds (never ripped Apple or brand sound files). Skips sounds that already exist.
// docs/sfx.json: { "<name>": [seconds, "prompt"] }. Usage: node scripts/sfx.mjs
const sounds = JSON.parse(await readFile(path(config.sfx ?? "docs/sfx.json"), "utf8"));
const out = path("audio/sfx");
await mkdir(out, { recursive: true });
for (const [name, [duration, text]] of Object.entries(sounds)) {
  const file = `${out}/${name}.mp3`;
  if (existsSync(file)) continue;
  try {
    const res = await eleven("/v1/sound-generation?output_format=mp3_44100_128", { method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, duration_seconds: duration, prompt_influence: 0.6 }) });
    await writeFile(file, Buffer.from(await res.arrayBuffer()));
    console.log(name, "ok");
  } catch (e) { console.log(name, "failed", String(e.message).slice(0, 200)); }
}
