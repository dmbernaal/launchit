# 11 · Providers: ElevenLabs, other services, local, or your own recordings

ElevenLabs is the reference provider: it's what the Kaiyros films used, and it covers voice, music and sound effects
with one key. **Nothing in the pipeline requires it.** Everything downstream (the timeline, picture, mix and QA) works
on plain audio files plus word timings. Set the providers in `film.config.json`:

```json
"providers": { "voice": "elevenlabs" | "openai" | "local" | "file", "music": "elevenlabs" | "file", "sfx": "elevenlabs" | "file" }
```
`node scripts/doctor.mjs` reports which providers are configured and which keys are present (it never prints values).

## Voice
| Provider | How | Word timings | Delivery control | Notes |
|---|---|---|---|---|
| **elevenlabs** (reference) | `voice.mjs` → `eleven_v4` `/with-timestamps` | built in (`alignment.json`) | inline `[tags]`, ellipses, CAPS; `voice_settings` | Best expressive control. Needs a voice ID from your library (`config.voice.elevenlabs.voice_id`). About 185 credits per 80 s take. |
| **openai** | `voice.mjs --provider=openai` → `/v1/audio/speech` (`gpt-4o-mini-tts`) | `align.py` (Whisper) | one `instructions` string for the whole take; tags are stripped, ellipses kept | `OPENAI_API_KEY`. Input up to 4096 characters per request. |
| **local** | `voice.mjs --provider=local` runs `config.voice.local.command` | `align.py` | depends on the engine | Free and offline. Examples below. |
| **file** | `voice.mjs --provider=file --from=recording.wav` | `align.py` | a human performance | The most authentic option: the founder or a voice actor reads the script. Also use it for any other service (Azure, Google, Cartesia, PlayHT, Hume…) by exporting the audio. |

Local commands (`{out}` = output path without extension, `{script}` = plain-text script):
- **macOS:** `say -v Samantha -r 160 -o {out}.aiff -f {script}`. Good for drafts and timing, not for a final.
- **Piper:** `piper --model en_US-lessac-high.onnx --output_file {out}.wav < {script}`.
- **Kokoro, XTTS / Coqui, F5-TTS:** any CLI that writes `{out}.wav`; wrap it in a small shell script if needed.

**Word timings without ElevenLabs:** `scripts/align.py audio/voice/take-NN` runs Whisper (`small.en`; set
`WHISPER_MODEL=medium.en` for more accuracy). It writes `words.json`, mapped back onto the script's own spelling,
so cues like "twenty twenty-five" still match when Whisper hears "2025". `timeline.mjs` uses `words.json` whenever
`alignment.json` is absent, and still cuts only in measured silence.

**Pause and tone without tags:** write pauses into the text with ellipses and short sentences. For OpenAI, put the
register in `instructions` (e.g. "Warm, calm, quietly confident; unhurried; never salesy"). For a human, give them the
beat sheet and ask for one continuous take.

## Music
| Provider | How | Notes |
|---|---|---|
| **elevenlabs** (reference) | `music.mjs <plan> <seed>` with composition plans; `music-upload.mjs` for conditioning on a reference you own | Section-level control timed to your cue sheet. About 2,500 credits per 88 s take. |
| **file** | `music-import.mjs --from=track.wav --take=name --start=<film s>` | Use for anything else: a licensed library (Artlist, Musicbed, Epidemic, Soundstripe…), a composer, Suno or Udio exports, Stable Audio, a local MusicGen / Stable Audio Open render, your own recording. |

With a non-ElevenLabs track the method in `05-score.md` still holds:
1. Write the cue sheet as a brief (length, tempo, quiet points, peak time).
2. Choose or generate the closest track.
3. Scan it.
4. Edit it onto the landmarks (cut in its quiet moments, re-time within ±9%, breath edits, crossfade fills).
5. Level-match per section.

Library tracks are usually 2–3 minutes long with their own structure. Pick one whose quiet and peak sections can be
cut to your marks.

**Licensing:** record the license in `--license` (it lands in `provenance.json`). AI-music terms differ by service and
plan. Check commercial-use rights before a public launch.

## Sound effects
| Provider | How | Notes |
|---|---|---|
| **elevenlabs** | `sfx.mjs` generates every sound in `docs/sfx.json` once | Original sounds, no licensing questions on paid plans. |
| **file** | Put files at `audio/sfx/<name>.mp3` (names as in `docs/sfx.json`) | Use CC0 / licensed libraries (freesound.org CC0 filter, Pixabay, Zapsplat, Soundly) or record your own (a phone keyboard, a tap on glass). Don't rip system or brand sounds (e.g. Apple's). |

The `key` sound is a recording of about ten taps; the mixer cuts one tap per keypress. Any typing recording works.

## What changes per provider (and what doesn't)
- **Changes:** how takes are made, where word timings come from, and how finely tone can be directed.
- **Doesn't change:** everything else: the script craft, the timeline's silence cuts, the picture, the cue sheet, the score editing, level matching, ducking, QA, variants on a locked picture, delivery.
