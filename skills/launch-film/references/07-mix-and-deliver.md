# 07 · Mix, master and deliver

## The mix (`docs/mix.json` → `scripts/mix.py`)
- **Voice:** the spliced take, at unity. It is the reference everything else is set against.
- **Sound design:** each file peak-normalized to −1 dBFS, then placed at its event gain.
- **Music, per row:**
  - `music_gain_db` is the music's loudness relative to her voice. The script measures what the take actually does
    in that row and sets the gain to hit the target, so swapping takes keeps the balance.
  - Clipped to −30…+12 dB.
  - Typical targets:
    - −18 to −20 under the idea;
    - −12 under the first features;
    - −8 to −9 through the drive;
    - about 0 between words at the peak;
    - −24 under "text me";
    - −100 (muted) where silence is wanted.
- **Ducking:** an envelope follower on her voice (about 30 ms attack, about 280 ms release, interpolated, never
  stair-stepped), times the row's `duck_db` (3–5). The music breathes with her phrases rather than pumping. The
  composer's note: the bed should surge in every gap.
- **Rides:** breakpoint curves for the composer's moves (fade in over 7.0–8.6, +6 dB into the breath before the
  peak, −12 dB over 89–94 toward the "text me" hush, final fade).
- **Mutes:** soft-edged (5 ms) silences: the breath before the peak, the promise, the cold open.
- **Tapers:** fade the music into a planned silence; never cut it.
- **Bus:** voice + music + sfx summed at unity. An earlier voice ×1.25 / music ×0.72 bus skewed the composer's
  levels.
- **Master:** two-pass loudnorm to −16 LUFS integrated, −2 dBTP, LRA up to 16, linear mode, 48 kHz, 24-bit WAV.

## QA before anyone listens (`scripts/mix-qa.py A B C --at=…`)
- **Unplanned drops:** anywhere the music falls more than 8 dB within 0.3 s outside the planned list (mutes, muted rows, tapers, `qa_ignore`). Ducks on voice onsets show up as 8–9 dB drops; check each one, and keep it only if it was already there in a cut the client liked.
- **Loudness and true peak:** −16.0 LUFS, ≤ −2.0 dBTP.
- **Levels at landmarks** (`--at`): the claim, the climax, the line where the take used to freeze. Compare across variants.
- Look at the fine level map (0.1 s steps) around any seam you edited. A dip of 4–5 dB on a narrated word will be heard.

## Render and deliver
- **Render the picture once:** `npx hyperframes render . -o renders/<id>-4k.mp4 --fps 60 --resolution landscape-4k --quality high --crf 14 --workers 3 --strict`. That takes about 7 min for 115 s and gives about 150 MB.
- **Mux every variant** with `node scripts/export.mjs A B C`:
  - the 4K master with its video stream copied and AAC 320k audio;
  - a 1080p copy (lanczos, x264 slow, CRF 16, bt709, faststart);
  - verified for size, fps, duration (it must equal the timeline) and loudness.
- **Audio-only notes** are re-mixed and re-muxed in about a minute, with no re-render.
- **Delivery message:** where the files are, what changed, what you verified, how the variants differ (one line each), and your pick with a reason.

## Disk
4K renders run 100–200 MB each, and the Kaiyros project accumulated 46 renders (3 GB). Check `df -h` before a
batch and keep only the cuts that matter.
