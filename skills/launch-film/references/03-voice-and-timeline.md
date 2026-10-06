# 03 · Voice and the film clock

## Generating takes (`scripts/voice.mjs`)
- **ElevenLabs** (reference provider; others in `11-providers.md`). Endpoint: `POST /v1/text-to-speech/{voice_id}/with-timestamps?output_format=mp3_44100_128`. The starter tier refuses `mp3_44100_192` with a 403 `output_format_not_allowed`.
- Body: `{ text, model_id: "eleven_v4", seed, voice_settings: { stability, similarity_boost, style, use_speaker_boost, speed } }`.
- Response: `audio_base64` plus `alignment` (characters with start and end seconds). Save `narration-raw.mp3`, `alignment.json`, `request.json` and `provenance.json` (seed and sha256) in `audio/voice/take-NN/`. The script refuses to overwrite a take folder.
- Generate 2–4 takes with different seeds, one at a time. Takes are cheap (about 185 credits for 80 s).
- Pick between takes by measuring the key lines: duration of the claim, the climax, the name, and the gap before each, from `alignment.json`. On the investor film, take-01 gave "I do the work" 1.32 s against 0.88 s in take-02. Weight wins. Record each take's seed: re-generating with the same seed and text reproduces the take.
- **Choosing a voice:** use the brand's own (a custom or cloned voice in your provider's library) or audition 3–4 stock voices on the hook and the name line. Match the brand's register; a calm voice reads as confidence.

## QA each take (`scripts/voice-qa.py audio/voice/take-NN`)
- Whisper (`small.en`, word timestamps) against the script. It flags missing or extra words, repeated words (stutters) and dead air.
- Sentence loudness and pace: a jump of more than 4 dB, or a pace spike, marks a line that went giddy or shouted. Listen to that line.
- Then listen yourself to the lines the client cares about: the hook, the claim, the climax, the whisper, the name.
- Pick the take with the most even register. A take can be split and spliced with another of the same register (03 › Splicing).

## The film clock (`docs/phrases.json` → `scripts/timeline.mjs` → `source/timeline.json`)
The picture, the sound design and the mix all read one file. A phrase is `[id, source, "first words", filmTime|null, minGap]`.
- The script finds each phrase's first word in the take's alignment and cuts the take **only inside measured silence**: at the centre of the longest run below −45 dB between the previous word's end and this word's start (±0.15 s). One cut per boundary: the end of a phrase and the start of the next share it, so nothing overlaps or doubles.
- **Why:** ElevenLabs alignment drifts from the audio by up to 0.4 s. Cutting on alignment times once clipped a word and made her stutter ("I— I'll find", at 1:18 in v6). Silence cuts fixed it.
- `filmTime` places a phrase on a picture moment. `null` keeps the take's own breath. `minGap` guarantees a pause (for example 1.25 s before "I do the work", the beat the Kaiyros founder asked for: at least a quarter to half second).
- `cues` adds named word moments (`"more": ["we ask", "product"]`) for picture and sound to hit. Each also gets `<name>End`.
- After any change to phrases, re-run `timeline.mjs` → `events.mjs` → `build.mjs` → `mix.py`, in that order.

## Splicing takes
Intro and ending from one take, middle from another, as Kaiyros did. List both in `sources` and alternate phrase
sources. Splice only where both sides sit in silence and the register matches. Check every seam by ear and with
`voice-qa.py` on the final voice stem (`audio/stems/voice.wav`).

## Re-voicing after the picture is built (warp)
If the narration changes after the picture is authored, don't re-time hundreds of picture keyframes. Keep the
picture on its authored clock and add `anchors`, a list of `[filmTime, authoredTime]` pairs (one per spoken
landmark), to `timeline.json`.
- `movie.js` maps film → authored time, so the picture follows the new voice exactly.
- `events.mjs` maps authored sound times back to film time.
- Video elements (framework-owned media) need their `data-start` / `data-duration` patched to film time.
- Every anchor must be monotonic, and you can stretch a beat. Kaiyros held the authored time almost still while
  "on top" landed, so "I do the work" got its pause.
