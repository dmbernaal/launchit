# launchit

An agent skill for making **cinematic launch films** for any product, in the spirit of an Apple keynote moment:
- one idea;
- one thing on screen at a time;
- words that appear as they're spoken;
- a human voice;
- music that builds to one peak and steps back for the name.

It covers concept, script, narration, a 4K60 picture built from the product's real UI, an original or licensed score,
sound design, mixing, and delivery as several score variants on one locked picture.

It was built while making two real films for an AI startup (Kaiyros): a 114-second creator launch film and an
89-second investor film. Every lesson from about twenty rounds of notes is written into the skill, so the next film
starts where those ended.

## What you get
- **A step-by-step method** with checkpoints: intake → concept → script and beat sheet → explicit go → draft picture (free) → voice → film clock → score → sound → mix → render → variants → rounds.
- **A starter project** that renders out of the box:
  - **Picture:** HyperFrames composition; standalone iPhone with Messages, typing and glow; word-by-word headlines; cards; screen gallery; sign-off.
  - **Optional components:** sourced market numbers, a feed of thumbnails, platform network, marketplace, reach sky, 3D mascot or light orb.
  - **Scripts:** a dependency checker, voice takes, Whisper alignment, a draft clock, the real clock (cuts only in silence), music generation, import and analysis, sound effects, a config-driven mixer with level matching and ducking, a drop-scanning QA, export.
- **Ten music palettes**, from minimal piano to bright electronic to sound design only. There's no house sound: the style is chosen per brand, with the user.
- **Any provider.** ElevenLabs (voice with timestamps, composition-plan music, sound effects) is the reference and is fully optional:
  - **Voice:** OpenAI TTS, a local TTS (macOS `say`, Piper, Kokoro, XTTS…), or a human recording.
  - **Music:** licensed library tracks, a composer, other AI music (exported), or your own.
- **Agent prompts that worked:** a market researcher (sourced numbers for investor films), a VC script critic and a composer critic.
- **A case study:** every note from the Kaiyros films and the fix that worked.

## Install

### Claude Code (plugin)
```
/plugin marketplace add dmbernaal/launchit
/plugin install launchit@launchit
```
Then ask for "a launch film for <product>", or invoke it directly with `/launchit:launch-film`.

### Claude Code (manual)
```sh
git clone https://github.com/dmbernaal/launchit
cp -R launchit/skills/launch-film ~/.claude/skills/            # personal (all projects)
# or: cp -R launchit/skills/launch-film <your-project>/.claude/skills/
```

### Other agents
The skill is plain Markdown plus scripts. Point your agent at `skills/launch-film/SKILL.md`; it links to every chapter
under `references/` and the starter project under `templates/project/`.

## Requirements
| | Install (macOS) | Install (Debian/Ubuntu) |
|---|---|---|
| Node.js ≥ 22 | `brew install node` or `nvm install 22` | `nvm install 22` |
| ffmpeg, sox | `brew install ffmpeg sox` | `sudo apt-get install -y ffmpeg sox` |
| Python 3 + numpy | `python3 -m pip install numpy` | `sudo apt-get install -y python3-pip && pip install numpy` |
| Whisper CLI | `brew install openai-whisper` | `pip install -U openai-whisper` |
| npm packages (gsap, esbuild, hyperframes, three) | `npm install` in a film folder | same |
| Render browser | `npx hyperframes doctor` | same |
| Keys (optional) | `ELEVENLABS_API_KEY`, `OPENAI_API_KEY` in `.env.local` | same |

- Windows: use WSL2.
- Every film folder has `npm run doctor`, which checks all of the above and prints the install command for anything missing. It never prints key values.
- Details: `skills/launch-film/references/00-setup.md`.

## Quick start (no API keys needed)
```sh
cp -R launchit/skills/launch-film/templates/project my-film && cd my-film
npm install && npm run doctor
npm run draft                                                 # film clock from the example script, no audio
npx hyperframes check . && npx hyperframes snapshot . --at 2,8,15 --describe false
```
That renders frames of the included 25-second example ("Acme", a fictional note app).

From there, the agent follows `SKILL.md`: it writes your brief and script, waits for your go, then makes voice, music
and sound with your chosen providers. It renders 4K60, mixes 2–3 score variants and exports 4K and 1080p.

For a fully free test with a local voice:
1. Set `"providers": { "voice": "local", "music": "file", "sfx": "file" }` in `film.config.json`.
2. Run `node scripts/voice.mjs --take=take-01` (macOS `say` by default), then `npm run timeline`.

## Costs and time (measured, 2026)
- **ElevenLabs** (starter tier): about 185 credits per 80 s voice take; about 2,500 credits per 88 s music take (so about 10–12 music takes a month on a starter plan).
- **Local voice and library music:** nothing per take.
- **Render:** about 45 s for a 17 s film; about 5–7 minutes for 90–115 s at 4K60 on an Apple-silicon laptop.
- **First cut:** a long day. The second reference film shipped in two rounds.

## Repository layout
```
.claude-plugin/            plugin.json, marketplace.json (Claude Code plugin + marketplace)
skills/launch-film/
  SKILL.md                 the method, the checkpoints, the non-negotiables
  references/              00 setup · 01 brief & concept · 02 script · 03 voice & timeline · 04 picture · 05 score
                           method · 05a score styles · 06 sound · 07 mix & deliver · 08 Kaiyros case study ·
                           09 service playbook · 10 agent prompts · 11 providers
  templates/project/       the starter film (scripts, source, styles, docs, fonts)
```

## Rights and licences
- **Code and docs:** MIT (`LICENSE`).
- **Geist fonts:** SIL OFL 1.1, licence included.
- **Dependencies:** HyperFrames, GSAP, esbuild and three.js are installed from npm under their own licences.
- **Generated media:** commercial rights depend on your provider and plan (ElevenLabs, OpenAI, music services). Check before a public launch.
- **Stock media:** use only music, sounds, images and footage you have rights to. The scripts record a `license` field for imported music.
