import { readFile, writeFile, mkdir } from "node:fs/promises";
import { createHash } from "node:crypto";
import { config, path, eleven } from "./lib.mjs";
// One continuous score per plan, composed to the cue sheet. Paid. Generate takes one at a time (the API
// refuses concurrent requests on small plans). Usage: node scripts/music.mjs <plan-id> [seed] [take-name]
// Plans file (config.music.plans): { start_s, end_s, plans: { <id>: { concept, chunks: [...] } }, mix: [...] }
const [id, seedArg, takeArg] = process.argv.slice(2);
const spec = JSON.parse(await readFile(path(config.music.plans), "utf8"));
const plan = spec.plans[id];
if (!plan) throw Error(`No plan ${id}`);
const total = plan.chunks.reduce((s, c) => s + c.duration_ms, 0), want = Math.round((spec.end_s - spec.start_s) * 1000);
if (Math.abs(total - want) > 5) throw Error(`Plan ${id} sums to ${total} ms, expected ${want}`);
for (const c of plan.chunks) {
  if (c.text.length > 200) throw Error(`Chunk text over 200 chars (${c.text.length}): ${c.text}`);
  if (c.duration_ms < 3000 || c.duration_ms > 120000) throw Error(`Chunk duration must be 3000–120000 ms: ${c.duration_ms}`);
}
const seed = Number(seedArg ?? 7408000 + [...id].reduce((s, ch) => s + ch.charCodeAt(0), 0));
const take = takeArg ?? `plan-${id}-${seed}`;
const dir = path("audio/music", take);
await mkdir(dir, { recursive: true });
const request = { model_id: config.music.model_id ?? "music_v2_5", composition_plan: { chunks: plan.chunks }, seed };
await writeFile(`${dir}/request.json`, JSON.stringify(request, null, 2) + "\n");
const res = await eleven(`/v1/music?output_format=${config.music.format ?? "mp3_44100_128"}`,
  { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(request) }, `${dir}/error.json`);
const audio = Buffer.from(await res.arrayBuffer());
await writeFile(`${dir}/score.mp3`, audio);
await writeFile(`${dir}/provenance.json`, JSON.stringify({ generated_at: new Date().toISOString(), plan: id, concept: plan.concept, start_s: spec.start_s, end_s: spec.end_s,
  seed, bytes: audio.length, sha256: createHash("sha256").update(audio).digest("hex") }, null, 2) + "\n");
console.log(JSON.stringify({ plan: id, take, seed, bytes: audio.length }));
