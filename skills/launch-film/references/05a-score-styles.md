# 05a · Score styles (choose per film, with the user)

There is no house sound. Pick from these palettes, or mix two, based on the brand and the moment the film builds
toward. Offer the user 2–3 with a one-line description each and recommend one. Every palette keeps the universal
rules in `05-score.md`: no vocals under narration, planned silences, taper into silence, entrances in the holes,
claim below peak.

**Universal negatives** (every prompt): `vocals, lyrics, choir, spoken words, humming, singing`.
Add each palette's own negatives below.

| Palette | Feels | Fits |
|---|---|---|
| 1. Cinematic strings and piano | emotional, intimate → soaring | mission-driven products, "this changes your life", personal tools |
| 2. Modern pulse (hybrid) | propulsive, focused, smart | AI, developer tools, fintech, productivity |
| 3. Minimal piano and space | calm, premium, confident | wellness, journaling, luxury, design tools |
| 4. Warm acoustic | human, handmade, optimistic | food, family, craft, local business, lifestyle |
| 5. Bright electronic pop (instrumental) | energetic, fun, modern | consumer apps, social, fashion, events |
| 6. Lo-fi beat | relaxed, creative, everyday | creator tools, study, casual apps |
| 7. Ambient textural | vast, precise, mysterious | infrastructure, security, science, deep tech |
| 8. Percussive / rhythmic | physical, punchy, playful | hardware, sports, fitness, games |
| 9. Jazz / neo-soul (instrumental) | warm, sophisticated, social | hospitality, finance with warmth, beverages |
| 10. Sound design only (no score) | stark, product-first | when the product's own sounds are the story; ultra-minimal brands; tiny budgets |

## Palette notes (instruments · tempo · arc · prompt words · avoid)

**1. Cinematic strings and piano.**
- **Instruments:** solo cello and felt piano for a four-note motif; warm string orchestra; low pedal.
- **Tempo:** 60–90 BPM, minor key resolving to major at the end.
- **Arc:** silence → pedal → motif → string build → peak with full strings and warm horns → hush → piano motif at the name.
- **Prompt words:** "emotional cinematic strings and piano", "lyrical cello melody from a four note motif", "felt piano", "space for a quiet narrator", "warm open major chord".
- **Avoid:** "war drums, taiko, snare rolls, military march, trailer braams, heroic trumpet fanfare".
- Used for the Kaiyros launch film's first half.

**2. Modern pulse (hybrid).**
- **Instruments:** pulsing analog synth arpeggio, spiccato string ostinato, deep sub bass, ticking hi-hat as a clock, piano motif on top.
- **Tempo:** 88–110 BPM.
- **Arc:** a clock-like tick → arpeggio enters → a hit on the claim → drive → a big swell.
- **Prompt words:** "modern cinematic pulse score", "pulsing analog synth arpeggio", "spiccato string ostinato", "deep sub bass", "ticking hi-hat as a clock".
- **Avoid:** "EDM drop, dubstep, four on the floor, trance, dance beat".
- Used for the Kaiyros investor film's chosen cut.

**3. Minimal piano and space.**
- **Instruments:** solo piano (close-mic'd, felt or upright), room tone, at most a soft pad.
- **Tempo:** 60–76 BPM, major or modal.
- **Arc:** single notes → a simple figure → slightly fuller at the climax, never loud → one held chord at the name.
- **Prompt words:** "solo felt piano, close and intimate", "lots of space between notes", "soft room reverb", "minimal".
- **Avoid:** "drums, strings swell, cinematic build, orchestra".

**4. Warm acoustic.**
- **Instruments:** fingerpicked acoustic guitar, upright bass, light brushed percussion, glockenspiel or mallets, hand claps late.
- **Tempo:** 90–112 BPM, major.
- **Arc:** solo guitar → bass joins → percussion → full and bright at the climax.
- **Prompt words:** "warm fingerpicked acoustic guitar", "upright bass", "brushed drums", "optimistic", "handmade".
- **Avoid:** "whistling, ukulele, corporate, stock-music cheerfulness".

**5. Bright electronic pop (instrumental).**
- **Instruments:** plucky synths, sidechained pads, punchy kick, claps, bright arps.
- **Tempo:** 115–124 BPM.
- **Arc:** filtered intro → build → a drop on the claim (the one place a "drop" is right) → full energy → cut to a clean tail.
- **Prompt words:** "instrumental electronic pop", "plucky synth lead", "sidechained pads", "punchy kick", "bright and modern".
- **Avoid:** "vocal chops, vocals, aggressive dubstep".

**6. Lo-fi beat.**
- **Instruments:** dusty swung drums, Rhodes or electric piano, warm bass, vinyl crackle, tape wobble.
- **Tempo:** 70–90 BPM.
- **Arc:** keys alone → drums enter → steady groove (little build) → keys alone at the end.
- **Prompt words:** "lo-fi hip hop instrumental", "dusty swung drums", "warm Rhodes", "tape saturation".
- **Avoid:** "rap, vocals, trap hi-hats".

**7. Ambient textural.**
- **Instruments:** evolving pads, granular textures, sub swells, distant bell tones, a slow pulse.
- **Tempo:** free or 60–80 BPM.
- **Arc:** near silence → texture blooms → the pulse emerges → a vast swell → one tone at the name.
- **Prompt words:** "ambient electronic", "evolving warm pads", "granular textures", "slow sub swells", "spacious".
- **Avoid:** "beat drop, melody-heavy, cheesy synth lead".

**8. Percussive / rhythmic.**
- **Instruments:** body percussion, stomps and claps, toms, shakers, minimal bass, almost no melody.
- **Tempo:** 100–130 BPM.
- **Arc:** a single hit pattern → layers add → full groove → a hard stop with a planned silence, then one final hit.
- **Prompt words:** "rhythmic percussion only", "stomps and claps", "tight toms", "minimal bass", "no melody".
- **Avoid:** "war drums, taiko, military".

**9. Jazz / neo-soul (instrumental).**
- **Instruments:** brushed drums, upright bass, Rhodes, muted trumpet or flugelhorn (instrumental only), soft guitar.
- **Tempo:** 80–100 BPM.
- **Arc:** a keys intro → the groove → a warmer chorus at the climax → keys alone at the end.
- **Prompt words:** "instrumental neo-soul", "brushed drums", "warm Rhodes", "upright bass", "relaxed groove".
- **Avoid:** "vocals, scat, big band".

**10. Sound design only.**
- No score.
- UI sounds, foley, room tone and silence carry it.
- Use the riser and impact in `06-sound-design.md` sparingly.
- It works best with a very confident voice and tight picture.

## Translating references into prompts
When the user names a composer, film, game or artist, use the name to talk with them, and these descriptors in
prompts:

| The user says | Prompt with |
|---|---|
| "big film-score epic" | slow-building hybrid orchestral, low string ostinato, deep sub hits, sustained brass pads, wide reverb |
| "the clock/ticking film-score feel" | ticking clock pulse, sustained organ-like pads, rising tension, sparse piano |
| "dark superhero tension" | dark low string ostinato under a held low note, sub pulses, tension without resolution |
| "Apple keynote" | minimal, bright piano or synth plucks, lots of air, clean modern production |
| "heroic sci-fi" | (Kaiyros tested it and rejected it) choir and brass fanfare; if wanted, exclude choir anyway under narration |
| "Nike ad" | percussive, punchy, rhythmic, a big hit on the claim, confident |
| "indie startup video" | warm acoustic or soft electronic, optimistic, handmade |

## Trying a style cheaply
If the user can't choose, make short sketches before committing:
- a 20–30 s plan per palette (ElevenLabs);
- or two library tracks imported with `music-import.mjs`.

Play them under the first 30 s of the draft film (`scripts/draft-timeline.mjs` gives a timeline before any voice
exists).
