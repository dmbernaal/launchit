---
name: launch-film
description: Make a cinematic launch film for any product, the way Apple-style keynote films are made. Covers concept, script, narration (ElevenLabs, OpenAI, a local TTS or a human recording), a HyperFrames 4K60 picture with the product's real UI, an original or licensed score in a style chosen per brand, sound design, mix and mastering, and delivery as several score variants on one locked picture. Use when asked for a launch video, product film, investor or pitch film, trailer, sizzle reel, "cinematic video", or to make one of these for a client.
---

# Launch Film

You make a 30–120 second film for a product launch, an investor pitch or a feature reveal. It works like a keynote
moment: one idea, one thing to look at at a time, words that appear as they're spoken, a human voice, and music that
builds to one peak and steps back for the promise and the name. The pipeline is code: a HyperFrames composition for
the picture, scripts for the clock, the mix and the delivery. Every frame and every sound is reproducible and
measurable.

**This skill's own folder** (`${CLAUDE_SKILL_DIR}`, i.e. the folder containing this SKILL.md) holds:
- `references/`: read each chapter when you reach its phase (table below);
- `templates/project/`: the starter project every film is copied from.

## The style is chosen per film
The default look (black stage, white type, one spectral light where the product acts) and the reference films' music
(cinematic strings and a modern pulse) come from the Kaiyros case study. They are a starting point, not a house
style.
- **Music:** choose the palette with the user from `references/05a-score-styles.md`. Ten palettes, from minimal piano to bright electronic to sound-design-only.
- **Look:** set the brand's colours in `styles/film.css` (`--spec-1…5`, `--ink`, the card material). Phone glow colours via `glowColors`. Swap fonts in `fonts.css`.
- **Voice:** match the brand's register (warm, playful, crisp, authoritative), within the narrow-register rule in `02-script.md`.

## Providers: ElevenLabs is optional
ElevenLabs is the reference provider: voice with timestamps, composition-plan music and sound effects. It is never
required. Set `providers` in `film.config.json`:
- **voice:** `elevenlabs` · `openai` · `local` (macOS `say`, Piper, Kokoro, XTTS…) · `file` (a human read, or any other service's export).
- **music:** `elevenlabs` · `file` (a licensed library track, a composer, Suno or Udio exports, Stable Audio, MusicGen…).
- **sfx:** `elevenlabs` · `file` (CC0 libraries or your own recordings).

Without ElevenLabs, `scripts/align.py` gets word timings from any narration with Whisper, so everything downstream
works the same. Details: `references/11-providers.md`.

## Read these when you reach the phase
| Phase | Reference |
|---|---|
| Dependencies, install, keys, smoke test | `references/00-setup.md` |
| Intake, critique, concept | `references/01-brief-and-concept.md` |
| Script, beat sheet, narration craft, investor films | `references/02-script.md` |
| Voice takes, QA, the film clock | `references/03-voice-and-timeline.md` |
| Picture: HyperFrames, layers, components, choreography, snapshots, render | `references/04-picture.md` |
| Score method: cue sheet, critique, takes, editing onto picture | `references/05-score.md` |
| Score styles: ten palettes, choosing with the user, translating references | `references/05a-score-styles.md` |
| Sound design | `references/06-sound-design.md` |
| Mix, master, variants, delivery | `references/07-mix-and-deliver.md` |
| Case study: two Kaiyros films, every round of notes and what fixed it | `references/08-case-study-kaiyros.md` |
| Running this as a service (intake form, deliverables, costs) | `references/09-service.md` |
| Subagent prompts: market researcher, VC script critic, composer critic | `references/10-agent-prompts.md` |
| Providers: ElevenLabs, OpenAI, local, recordings, licensed music | `references/11-providers.md` |

## Non-negotiables
1. **Check dependencies first.** Copy the starter, `npm install`, then `npm run doctor`. Install what it lists before any other work (`00-setup.md`).
2. **Plan first; build only on an explicit go.** Present the full plan: concept, full script, beat sheet, music palette and arc, visual list, provider choice and the decisions. Notes on a plan are revisions, not approval. Spend money only after a clear "go" ("build it", "approved"), unless the user has explicitly given you full rein.
3. **Paid calls** go one at a time (the APIs reject concurrent requests on smaller plans). Never overwrite a charged take. Record the seed, settings and a sha256 next to every file. Check the balance before music.
4. **Secrets:** keys come from the environment or a `.env.local`. Never print, log or commit them, or pass them to a subagent.
5. **Truth on screen.**
   - Show the real product UI, or an honest rebuild of it.
   - Example values are fine; list them as authored examples in the project README.
   - Every market or traction number carries a source in small type.
   - Show a feature as live only if it ships by launch, and then don't caveat it in the film.
   - Use images, music and sounds you have rights to.
6. **No artist, composer, film, game or franchise names in generation prompts.** Translate them into descriptors (`05a`). **No vocals, lyrics or choir under narration.**
7. **One idea.** If the film's idea can't be said in one sentence that isn't a feature list, you aren't ready to write.
8. **Measure before anyone sees or hears it.**
   - Transcribe every take.
   - Run `hyperframes check` and snapshot every transition.
   - Scan every mix for unplanned drops.
   - Verify loudness and duration.
   Then the user judges by eye and ear. Say what you verified, and say plainly if you chose by measurement rather than by listening.
9. **The client's taste wins, and it compounds.** Keep `docs/feedback-log.md` in every project: each note with the fix that worked. Re-read it before every round and never regress a line. `08-case-study-kaiyros.md` shows how much a log like that is worth.

## The pipeline
| # | Step | You produce | Gate |
|---|---|---|---|
| 0 | Setup | `npm install`, `npm run doctor` all green; providers chosen | Dependencies installed |
| 1 | Intake | `docs/brief.md` (product, audience, one truth, features, proof, assets, length, where it plays, providers) | User confirms the facts |
| 2 | Critique + concept | A blunt critique of existing material; 2–3 concepts (one sentence each, plus a 5-beat arc); your pick | User picks |
| 3 | Script + beat sheet + palette | `docs/narration.txt`; a beat sheet (time · line · picture · music · sound); 2–3 music palettes with your pick | **Explicit go** |
| 4 | Draft picture (free) | `npm run draft` (clock from the script alone) → scenes → snapshots | Every beat has one focal point |
| 5 | Voice | 2–4 continuous takes (`scripts/voice.mjs`); `voice-qa.py` on each; pick one | Clean transcript, even register |
| 6 | Film clock | `docs/phrases.json` → `timeline.mjs` (cuts only inside silence) → `events.mjs` → build | No stutter at any seam |
| 7 | Score | Cue sheet → composer critique → takes (`music.mjs` or `music-import.mjs`) → `music-scan.py` → edit list | Takes land their landmarks |
| 8 | Sound design | `docs/sfx.json` → `sfx.mjs` or files; `source/events.js` | Every on-screen action has a sound |
| 9 | Mix + master | `docs/mix.json` → `mix.py` → `mix-qa.py` | No unplanned drops; −16 LUFS; −2 dBTP |
| 10 | Render + deliver | `hyperframes render` 4K60 once; `export.mjs` muxes each score variant (4K + 1080p) | Verified durations and loudness |
| 11 | Rounds | Picture notes → re-render; audio notes → re-mux only; log every note | The user picks the cut that ships |

Deliver **variants on one locked picture**: 2–3 scores on the same cut, so the user chooses by ear without re-judging
the picture. Audio changes are muxed onto the master (`-c:v copy`) in seconds. Picture changes need a re-render
(about 5–7 minutes for 90–115 s at 4K60).

## Start a new film
```sh
cp -R "${CLAUDE_SKILL_DIR}/templates/project" <workspace>/<film-id>
cd <workspace>/<film-id> && npm install && npm run doctor
# film.config.json: id, providers, voice; index.html: composition id and title; package.json "config.id"
npm run draft && npx hyperframes check . && npx hyperframes snapshot . --at 2,8,15 --describe false   # free, before any audio
node scripts/voice.mjs --take=take-01                       # after the go; --provider=openai|local|file to override
python3 scripts/voice-qa.py audio/voice/take-01
npm run timeline && npm run build && npx hyperframes check .
node scripts/sfx.mjs                                        # or place files in audio/sfx/
node scripts/music.mjs A 7408001                            # or: node scripts/music-import.mjs --from=track.wav --take=lib-01 --start=0.6
python3 scripts/music-scan.py audio/music/<take>/score.mp3
python3 scripts/mix.py A B && python3 scripts/mix-qa.py A B
npx hyperframes render . -o renders/<film-id>-4k.mp4 --fps 60 --resolution landscape-4k --quality high --crf 14 --workers 3 --strict
node scripts/export.mjs A B
```
`templates/project/README.md` lists every file. Optional components (market numbers with sources, a feed of
thumbnails, a platform network, a marketplace, a reach "sky", alert pile-ups, a 3D mascot, a light orb) are in
`source/extras/`.

## Time and cost (measured on the reference films, ElevenLabs starter tier, 2026)
- **Voice:** about 185 credits for an 80 s take. Make 2–3 and compare.
- **Music:** about 2,500 credits for an 88 s take, so roughly 10–12 takes a month on a starter plan. Run the composer critique before generating.
- **Sound effects:** about 14 sounds, generated once and reused across films.
- **Without ElevenLabs:** local voice and library music cost nothing per take.
- **Render:** about 5–7 minutes per 4K60 pass for 90–115 s (about 150 MB).
- **Calendar:** a first cut in a long day. The first reference film took about 15 rounds to ship; the second, built with this kit, took two.

## How to report
Lead with what changed and whether it worked, then what you verified, then the decision you need, with your pick and
a one-line reason. List variants with one line each on how they differ. No hedging, no padding.
