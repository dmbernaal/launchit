import { parseEnv } from "node:util";
import { readFileSync, existsSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
// Shared helpers for every film script. A film is one directory holding film.config.json.
export const FILM = resolve(import.meta.dirname, "..");
export const config = JSON.parse(readFileSync(resolve(FILM, "film.config.json"), "utf8"));
export const path = (...p) => resolve(FILM, ...p);
export const arg = (name, fallback) => process.argv.find(v => v.startsWith(`--${name}=`))?.slice(name.length + 3) ?? fallback;
// An API key from the environment, else the nearest .env.local walking up from the film. Never print it.
export function secret(name, required = true) {
  if (process.env[name]) return process.env[name];
  for (let dir = FILM; ; dir = dirname(dir)) {
    const file = resolve(dir, ".env.local");
    if (existsSync(file)) { const value = parseEnv(readFileSync(file, "utf8"))[name]; if (value) return value; }
    if (dirname(dir) === dir) { if (required) throw Error(`${name} not found (set it in the environment or a .env.local)`); return null; }
  }
}
export const elevenKey = () => secret("ELEVENLABS_API_KEY");
// One ElevenLabs call. Errors are recorded without the key or the request body.
export async function eleven(url, init, errorFile) {
  const res = await fetch(`https://api.elevenlabs.io${url}`, { ...init, headers: { "xi-api-key": elevenKey(), ...(init.headers ?? {}) } });
  if (!res.ok) {
    const detail = await res.json().catch(() => ({}));
    if (errorFile) writeFileSync(errorFile, JSON.stringify({ http_status: res.status, detail: detail.detail ?? null }, null, 2));
    throw Error(`ElevenLabs ${url} failed ${res.status}: ${JSON.stringify(detail.detail ?? "").slice(0, 400)}`);
  }
  return res;
}
// Narration text for providers without ElevenLabs-style [delivery tags]: tags become pauses or disappear.
export function plainScript(text) {
  return text.replace(/\[(long pause)\]/gi, " ... ").replace(/\[(short pause|pause)\]/gi, ", ").replace(/\[[^\]]*\]/g, " ")
    .replace(/[ \t]+/g, " ").replace(/ ,/g, ",").replace(/\n{3,}/g, "\n\n").trim();
}
