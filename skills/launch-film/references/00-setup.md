# 00 · Setup: every dependency, and how to check it

Run this before the first film and whenever a machine changes. Copy the starter project, then:
```sh
cd <film-folder>
npm install                  # gsap, esbuild, hyperframes, three (versions pinned in package.json)
npm run doctor               # checks everything below and prints the install command for anything missing
npx hyperframes doctor       # checks the render browser (Chrome) and GPU mode
```

## What the pipeline needs
| Dependency | Why | Install (macOS) | Install (Debian/Ubuntu) |
|---|---|---|---|
| Node.js ≥ 22 | every script (ES modules, `import.meta.dirname`, `parseEnv`) | `brew install node` or `nvm install 22` | nodesource or `nvm install 22` |
| npm packages | the picture: `gsap` (clock), `esbuild` (bundle), `hyperframes` (preview, snapshot, render), `three` (only for a 3D mascot) | `npm install` | `npm install` |
| Chrome for HyperFrames | headless rendering | `npx hyperframes browser` (or let it auto-install) | same; on servers also install Chrome's system libraries |
| ffmpeg + ffprobe | decoding, mixing, loudness, muxing, exports | `brew install ffmpeg` | `sudo apt-get install -y ffmpeg` |
| sox | pitch-preserving re-time of music (`tempo -m`) | `brew install sox` | `sudo apt-get install -y sox` |
| Python 3 + numpy | mixer, QA, analysis | `brew install python` then `python3 -m pip install numpy` | `sudo apt-get install -y python3 python3-pip` then `pip install numpy` |
| Whisper CLI (`openai-whisper`) | voice QA and word timings for non-ElevenLabs voices | `brew install openai-whisper` (or `pip install -U openai-whisper`) | `pip install -U openai-whisper` |
| Keys (optional) | `ELEVENLABS_API_KEY`, `OPENAI_API_KEY` | `.env.local` in the film folder or any parent, or the environment | same |

- **Whisper:** downloads its model (`small.en`, about 460 MB) on first use.
- **Windows:** use WSL2 (Ubuntu) and follow the Linux column.
- **Disk:** a 4K60 render of 90–120 s is 150–200 MB; keep 5 GB free for a project's takes, stems and renders.
- **Time:** a 115 s 4K60 render takes about 5–7 minutes on an Apple-silicon laptop with 3 workers.

## Keys and secrets
- Put keys in `.env.local` (git-ignored by the starter's `.gitignore`), e.g. `ELEVENLABS_API_KEY=…`.
- Scripts read the environment first, then the nearest `.env.local` walking up from the film folder.
- Never print, log or commit a key, and never pass one to a subagent. Errors are written to `error.json` without the request body or the key.

## No keys at all?
The whole film can be made without any paid API:
- **Voice:** `providers.voice = "local"` (macOS `say`, Piper…) or `"file"` (a recorded read).
- **Music:** `providers.music = "file"`, with a licensed or self-made track via `music-import.mjs`.
- **Sound effects:** `providers.sfx = "file"`, with CC0 sounds placed in `audio/sfx/`.
- **Before any audio exists:** draft the picture with `npm run draft`.

See `11-providers.md`.

## Smoke test (two minutes, free)
```sh
npm run doctor
npm run draft                      # timeline from the example script, no audio
npx hyperframes check .            # lint + runtime + layout
npx hyperframes snapshot . --at 2,5 --describe false
```
If the snapshot shows the example card and headline, the toolchain works.
