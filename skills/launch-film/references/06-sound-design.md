# 06 · Sound design

Every action on screen has a sound, and every sound is original: ElevenLabs sound generation, never ripped Apple or
brand files. The Kaiyros founder asked for "iOS-like" typing and send sounds; generated ones read as iOS without being iOS.

## The library (`docs/sfx.json` → `scripts/sfx.mjs`, or your own files)
With `providers.sfx = "file"`, put a file per name at `audio/sfx/<name>.mp3`: CC0 or licensed library sounds, or
your own recordings (see `11-providers.md`).
| Name | Prompt gist | Typical gain (dB after peak-normalizing to −1 dBFS) | Used for |
|---|---|---|---|
| key | a recorded run of ~10 glass-keyboard taps; the mixer cuts one 85 ms tap per keypress, rotating through the attacks | −21 | each character typed |
| send | short soft airy upward swoosh | −17 | send tap |
| receive | soft rounded pop with a tiny bright chime | −13 to −20 | each incoming message (−20 for rapid series) |
| notify | two soft glassy rising bell notes | −14 to −18 | lock-screen notification |
| tap | single fingertip on glass | −12 to −14 | opening a notification, pressing a button |
| tick | single soft dry clock tick | −14 to −20 | Chronos letters, list beats ("Every hook…"), freeze frames, the edit's cut points |
| bloom | soft airy glassy swoosh as a panel expands | −16 to −22 | a card blooming out of the phone |
| roll | fast soft counter rolling up and settling | −18 to −25 | a number counting up (commission, price) |
| shimmer | soft airy shimmer of light appearing | −15 to −19 | the mascot's first appearance, the idea's sheen, the return before the promise |
| ping / ping2 / buzz | other apps' notifications, a phone vibrating | −24 rising to −14 | the cold-open pile-up (24 alerts accelerating, panned, cut dead) |
| impact | one huge orchestral hit (timpani, bass drum, low strings and brass), hall tail | −5, low-passed at 3 kHz | the claim ("I do the work") |

## Placement (`source/events.js`)
- Picture and sound share the same numbers: typing passes, ping times, cues. `soundEvents(cues)` returns `{ sound, at, gain, until?, pan? }`.
- `until` cuts a sound dead. Use it for the hard cut, where every alert, the riser and the ticks stop on the same frame.
- **The cold-open pile-up:** 24 alerts with intervals shrinking from 0.47 s to 0.08 s, gains rising from −24 by 0.6 dB each, panned across the field, a Shepard-tone riser underneath and ticks accelerating, then all of it cut dead at the hard cut, followed by dead silence. The silence after the cut is the effect.
- **Series:** rapid arrivals (screens landing in the thread) at −20, one per arrival, 0.5 s apart.
- **Keep sound design out of the music's job.** If the score already ticks, drop the ticks, or vice versa. Note it in the cue sheet ("the letter ticks at 12–13.4 are sound design").
