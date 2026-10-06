# Film starter project

Copy this folder for a new film, then `npm install && npm run doctor`. Follow `SKILL.md` (one level up from
`templates/`). The example inside is a 25-second film for a fictional note app ("Acme"), so a fresh copy renders
something real: `npm run draft && npx hyperframes snapshot . --at 2,8,15 --describe false`.

| Path | What it is |
|---|---|
| `film.config.json` | Film id, providers (voice / music / sfx), voice settings per provider, music plans file, sound list, build aliases and swaps |
| `package.json` | Pinned dependencies and `npm run doctor / draft / timeline / build / check / snapshot / render` |
| `requirements.txt` | Python side (numpy, openai-whisper); ffmpeg and sox are system packages |
| `index.html` | The HyperFrames composition: layers in `#cam`, a placeholder soundtrack |
| `fonts.css`, `assets/fonts/` | Geist (SIL OFL, licence included), loaded from the project root |
| `assets/` | Example images (avatar, preview); put the product's screens and images here |
| `styles/film.css` | The visual language: brand colours (`--spec-1…5`), sheen, spectrum, cards, headlines, rings, gallery, sign-off |
| `styles/phone.css` | The standalone iPhone with Messages |
| `source/movie.js` | The clock: one GSAP timeline, draw(t) for every part, the camera push, optional warp |
| `source/scenes.js` | **The film's own scenes**: rewrite this per film |
| `source/events.js` | Shared moments: typing passes, `keyTimes`, `soundEvents(cues)` |
| `source/util.js` | Motion helpers: win, track, expo, enter, count, sheen, revealWords, spoken |
| `source/headlines.js`, `phone.js`, `gallery.js`, `signoff.js` | Core components |
| `source/extras/` | Optional: stat (sourced numbers), field (a feed of thumbnails + light), network, market, sky, pings, mascot (three.js), orb; `extras.css`; `examples/` Kaiyros card patterns |
| `scripts/doctor.mjs` | Checks every dependency and key (never prints values), with install commands |
| `scripts/voice.mjs` | Narration take: `--provider=elevenlabs\|openai\|local\|file` |
| `scripts/align.py` | Whisper word timings for any narration (non-ElevenLabs voices, recordings) → `words.json` |
| `scripts/voice-qa.py` | Transcript vs script, stutters, dead air, per-sentence loudness and pace |
| `scripts/draft-timeline.mjs` | A film clock from the script alone, before any audio (free animatic) |
| `scripts/timeline.mjs`, `events.mjs` | The real film clock from `docs/phrases.json` (cuts only in silence); sound events and durations |
| `scripts/music-upload.mjs`, `music.mjs` | ElevenLabs Music: reference upload and composition-plan takes |
| `scripts/music-import.mjs` | Any other score (library, composer, other AI, your own) as a take |
| `scripts/music-scan.py` | A take's level map, silences and real swells |
| `scripts/sfx.mjs` | ElevenLabs sound effects from `docs/sfx.json` (or put files in `audio/sfx/`) |
| `scripts/make-atlas.py` | The poster atlas for `extras/field.js` from a folder of images |
| `scripts/mix.py`, `mix-qa.py` | Mix and master each score variant from `docs/mix.json`; drop scan and loudness QA |
| `scripts/build.mjs`, `export.mjs` | Bundle the picture; mux variants onto the 4K master and make 1080p copies |
| `docs/` | `brief.md`, `feedback-log.md`, example `narration.txt`, `phrases.json`, `score-plans.json`, `mix.json`, `sfx.json` |
| `.gitignore` | Keeps keys, takes, stems and renders out of git |
