# 05 · The score (method)

The score decides how the film feels more than any other element, and it is where most revision rounds go. This
chapter is the **method**. It is independent of musical style and of provider. The **style** is chosen per film, with
the user, from `05a-score-styles.md`. Never default to the palette of a previous film: the Kaiyros films used
cinematic strings, piano and a modern pulse because that suited *that* brand. A meditation app, a sneaker brand
and a database company each need something else.

## 1. Choose the style first (with the user)
- **Read the brief:** the brand's adjectives, audience, platform, the edit's pace, and the emotion at the climax.
- **Offer 2–3 palettes** from `05a-score-styles.md`, each in one line ("Minimal piano and space: calm, premium, lets the product breathe"), and recommend one.
- **Use any reference the user gives.** If they have a track they love, it's the best brief there is: it can be uploaded and conditioned on (ElevenLabs), or handed to a composer.
- **Translating famous names:** when they name a composer, film or artist, translate it into descriptors. Use the name in conversation, never in a generation prompt (prompts with names get blocked and sound like pastiche). See the translation table in `05a`.
- **Record the choice** in `docs/brief.md` (palette, tempo range, key or mood, instruments, what to avoid).

## 2. Universal rules (any style)
- **No vocals, lyrics, choir, spoken words or humming under narration.** Nothing may compete with the voice. Put this in every prompt's negatives.
- **Silence is a feature; unplanned drops are bugs.** Plan silences: before the claim, under the most intimate line, under the name if wanted. Anything else that drops is heard as a glitch: a cut, a freeze on a narrated word, a stair-stepped duck.
- **Taper into a planned silence, never cut.** About 0 → −12 dB in 0.3 s, then down to −60 over 2–3 s.
- **Put entrances in the holes,** before a line or on a picture event, not on a first syllable. An entrance on a syllable hides it.
- **Seed motion early.** A bed that starts with the first feature line feels late; start it about 1.5 s before.
- **Keep the claim below the peak.** The claim sits at about 75% of the peak, so the climax has somewhere to go.
- **Breathe before the peak** (0.2–0.25 s of music out), then arrive. Put the peak where the film's biggest moment lands, not where the most words are.
- **Don't chase words in a fast list.** Generators drift about 1 s. Ride one continuous build instead.
- **Level, not arrangement, is usually why a section feels boring.** A bed 20 dB under the voice and then ducked again disappears. About 9 dB under her, with a fast release, lets it surge in every gap (`07-mix-and-deliver.md`).

## 3. The cue sheet
Build it from `source/timeline.json` cues before generating anything. One row per beat, in film seconds:
| Moment | Film time | Music | Level vs voice |
|---|---|---|---|
| Cold open | 0–7 | none (sound design owns it) | — |
| The idea | 7–17 | fade in from nothing: one pedal, then the motif's first statement | −18 |
| … | … | … | … |
| Climax | 84.6 | the peak, loud only between her words | 0 between words, −6 under them |
| The promise | 97.6–105.7 | silence | mute |
| The name | 105.75 | the motif returns, small; final chord after the line | −10, then unducked |

**Landmarks** to place takes on later: the hit after the planned silence (the claim), the peak (the climax), and the
ending's first note (the name). Write them down.

## 4. Critique before spending
A composer-critic subagent (prompt in `10-agent-prompts.md`) reviews the cue sheet and the generation plans. It
measures any reference and fixes boundaries, ranges and levels before money is spent. It works only on the score,
never on script or picture. On both Kaiyros films it caught real problems: entrances on syllables, a peak in the
wrong place, conditioning ranges pointing at the wrong part of the reference, tempo tags that fought the reference,
and plans too similar to be worth comparing.

## 5. Make takes (any provider; see `11-providers.md`)
- **ElevenLabs Music:** a composition plan per palette variant, with chunks on the cue sheet's boundaries (§7 below). `scripts/music.mjs <plan> <seed>`.
- **Anything else:** a library track, a composer, Suno, Udio, Stable Audio, MusicGen, or the user's own recording. Write the cue sheet as a brief (length, tempo, where it's quiet, where it peaks), get the track, then `scripts/music-import.mjs --from=track.wav --take=name --start=<film s of its 0>`. From here every take is treated the same.
- **How many:** 2–3 takes, or 1 per plan when budget is tight. Distinct plans beat many seeds of one plan.

## 6. Read, edit and place (provider-independent)
1. **Scan** each take (`scripts/music-scan.py`): level map, silences, swells. Reject takes that:
   - have vocal textures;
   - peak before the climax;
   - fade out before it;
   - move under a planned silence.
2. **Pin the real swell.** The largest level *rise* is often a soft re-entry after a silence, not the climax. Read the fine level map and use the loudest sustained arrival.
3. **Edit list** (`docs/mix.json` pieces): cut only in the take's quiet moments, with 40–80 ms fades, overlapping fades by 40 ms (butt-joined fades click).
4. **Land the landmarks:**
   - **Re-time** (pitch kept) when the peak is within ±9% of its mark: a `tempo` piece, `sox tempo -m`.
   - **Breath edit** when it isn't: run the drive to the breath before the climax, cut to the take's swell onset, then re-place the ending on its own time.
5. **Splice two takes** only at a silence the film already has (e.g. the taper before the claim).
6. **Fill holes in a take:**
   - **The music freezes on a narrated word:** use an equal-power crossfade (about 0.6 s, under the voice) into the same take's own steady stretch from earlier, with matching level and texture.
   - **Hit → decay → silence → hit:** keep the hits, and fill the silences with the take's sustained material. Crossfade back into the original on the hit itself, never in the silence before it.
   - Don't loop bars by computed bar lengths: on soft textures they land off-grid.
7. **Mix variants** (`scripts/mix.py`), QA (`scripts/mix-qa.py`), then mux onto the locked picture.

## 7. ElevenLabs Music v2.5 (if used)
- `POST /v1/music?output_format=mp3_44100_128` with `{ model_id: "music_v2_5", composition_plan: { chunks }, seed }`.
- **Chunk fields:** `{ text, duration_ms, positive_styles[], negative_styles[], context_adherence, conditioning_ref, condition_strength }`.
  - `text` is at most 200 characters.
  - `duration_ms` is 3000–120000. The durations must sum to `(end_s − start_s) × 1000`.
  - `context_adherence` is "low", "medium" or "high".
  - `conditioning_ref` is `{ song_id, range: { start_ms, end_ms } } | null`.
  - `condition_strength` is "low", "medium", "high", "xhigh" or null.
- **Text format that works:** `[Section name] {Instrumental. One or two sentences narrating the arrangement in order: start with just…, then…, bring in….}`
- **`context_adherence`:** low at abrupt changes (a freeze, a cold section, silence), high through builds.
- **Conditioning:**
  - Upload a reference you own (`scripts/music-upload.mjs` → `song_id`); it passes a copyright check.
  - Condition chunks on measured ranges of it: `xhigh`/`high` for its DNA, `low` to depart.
  - **Measure the reference first:** a range that "sounds right" by label can be a busy stretch.
  - State its real tempo, or describe the pulse.
- **Limits:** generate sequentially (429 `too_many_concurrent_requests`); 422 errors mean text > 200 characters or a chunk < 3 s.
- **Cost (starter tier, 2026):** about 2,500 credits per 88 s take, about 10–12 takes a month. Check the balance first (`GET /v1/user/subscription`).

## 8. Variants
Deliver 2–3 on one locked picture. Good axes:
- two palettes (when the user is unsure);
- closest-to-reference vs. a bolder take;
- breath-before-the-peak vs. drive-into-the-peak;
- two takes of one plan.

Describe each in one line by what you'd hear, recommend one with a reason, and say if you chose by measurement
rather than by listening.

## Case study
The full score history of the Kaiyros films (what was rejected, what shipped, how the edits were made) is in
`08-case-study-kaiyros.md`. Read it for the method in action, not for the style.
