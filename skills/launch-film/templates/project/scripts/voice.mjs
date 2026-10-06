import { readFile, writeFile, mkdir, copyFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { config, path, arg, eleven, secret, plainScript } from "./lib.mjs";
// One continuous narration take. Never overwrites a take folder (paid takes are kept).
//   node scripts/voice.mjs --take=take-01 [--provider=elevenlabs|openai|local|file] [--seed=N] [--stability=0.5] [--from=recording.wav]
// elevenlabs: eleven_v4 with character timestamps (alignment.json); honours [delivery tags] in the script.
// openai:     /v1/audio/speech (gpt-4o-mini-tts); tone comes from config.voice.openai.instructions; tags are stripped.
// local:      any command that writes audio, e.g. macOS `say`, Piper, Kokoro, XTTS (config.voice.local.command).
// file:       a recording you already have (a human narrator, another service): --from=path.
// Every provider except elevenlabs is followed by scripts/align.py (Whisper word timestamps -> words.json).
const V = config.voice, provider = arg("provider", config.providers?.voice ?? "elevenlabs");
const take = arg("take", "take-01");
if (!/^take-\d{2}$/.test(take)) throw Error("Use a numbered take directory: take-01, take-02 …");
const text = (await readFile(path(arg("script", V.script)), "utf8")).trim();
const out = path("audio/voice", take);
await mkdir(path("audio/voice"), { recursive: true });
await mkdir(out, { recursive: false });   // a retry must never overwrite a charged take
const sha = buf => createHash("sha256").update(buf).digest("hex");
const align = () => execFileSync("python3", [path("scripts/align.py"), `audio/voice/${take}`], { stdio: "inherit", cwd: path() });
const toMp3 = from => execFileSync("ffmpeg", ["-v", "error", "-y", "-i", from, "-ar", "44100", "-b:a", "128k", `${out}/narration-raw.mp3`]);
const note = extra => writeFile(`${out}/provenance.json`, JSON.stringify({ generated_at: new Date().toISOString(), provider, ...extra }, null, 2) + "\n");
if (provider === "elevenlabs") {
  const E = V.elevenlabs, settings = { ...E.settings, ...(arg("stability") ? { stability: Number(arg("stability")) } : {}) };
  if (!E.voice_id || E.voice_id.startsWith("YOUR_")) throw Error("Set config.voice.elevenlabs.voice_id (a voice from your ElevenLabs library)");
  const payload = { text, model_id: E.model_id ?? "eleven_v4", seed: Number(arg("seed", E.seed ?? 7206001)), voice_settings: settings };
  await writeFile(`${out}/request.json`, JSON.stringify(payload, null, 2) + "\n");
  const res = await eleven(`/v1/text-to-speech/${E.voice_id}/with-timestamps?output_format=${E.format ?? "mp3_44100_128"}`,
    { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }, `${out}/error.json`);
  const data = await res.json(), audio = Buffer.from(data.audio_base64, "base64");
  if (!audio.length || !data.alignment?.characters?.length) throw Error("Empty audio or alignment");
  await writeFile(`${out}/narration-raw.mp3`, audio);
  await writeFile(`${out}/alignment.json`, JSON.stringify({ alignment: data.alignment, normalized_alignment: data.normalized_alignment }) + "\n");
  await note({ voice_id: E.voice_id, seed: payload.seed, settings, sha256: sha(audio) });
  console.log(JSON.stringify({ take, provider, seed: payload.seed, bytes: audio.length }));
} else if (provider === "openai") {
  const O = V.openai ?? {}, payload = { model: O.model ?? "gpt-4o-mini-tts", voice: O.voice ?? "coral", input: plainScript(text), instructions: O.instructions, response_format: "mp3" };
  if (payload.input.length > 4000) throw Error("OpenAI speech input is limited to 4096 characters: split the script, record parts, join them, then use --provider=file");
  await writeFile(`${out}/request.json`, JSON.stringify({ ...payload, input: undefined }, null, 2) + "\n");
  const res = await fetch("https://api.openai.com/v1/audio/speech", { method: "POST",
    headers: { Authorization: `Bearer ${secret("OPENAI_API_KEY")}`, "Content-Type": "application/json" }, body: JSON.stringify(payload) });
  if (!res.ok) { await writeFile(`${out}/error.json`, JSON.stringify({ http_status: res.status, detail: (await res.text()).slice(0, 400) }, null, 2)); throw Error(`OpenAI speech failed ${res.status}`); }
  const audio = Buffer.from(await res.arrayBuffer());
  await writeFile(`${out}/narration-raw.mp3`, audio);
  await note({ model: payload.model, voice: payload.voice, sha256: sha(audio) });
  align();
} else if (provider === "local") {
  const cmd = V.local?.command;
  if (!cmd) throw Error('Set config.voice.local.command, e.g. "say -v Samantha -r 165 -o {out}.aiff -f {script}"');
  await writeFile(`${out}/script.txt`, plainScript(text) + "\n");
  const raw = `${out}/local`;
  execFileSync("sh", ["-c", cmd.replaceAll("{out}", raw).replaceAll("{script}", `${out}/script.txt`)], { stdio: "inherit" });
  const made = ["aiff", "wav", "mp3", "flac", "m4a", "ogg"].map(x => `${raw}.${x}`).find(f => existsSync(f));
  if (!made) throw Error("The local command must write {out}.aiff, .wav, .mp3, .flac, .m4a or .ogg");
  toMp3(made); await note({ command: cmd });
  align();
} else if (provider === "file") {
  const from = arg("from");
  if (!from) throw Error("--from=path/to/recording is required for --provider=file");
  await copyFile(from, `${out}/source${from.slice(from.lastIndexOf("."))}`);
  toMp3(from); await note({ from });
  align();
} else throw Error(`Unknown voice provider "${provider}" (elevenlabs, openai, local, file)`);
