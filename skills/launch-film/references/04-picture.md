# 04 · Picture

## HyperFrames architecture (what makes it render correctly)
- **One HTML composition**, 1920×1080 CSS pixels, rendered at 4K (`--resolution landscape-4k`, device scale 2) and 60 fps. Required: `<main id="film" data-composition-id data-width data-height data-start="0" data-duration data-fps="60">`.
- **One clock.** `window.__timelines[id]` is a paused GSAP timeline that tweens one number. Its setter calls `draw(t)`, which calls every part's `draw(t)` in layer order. HyperFrames seeks this timeline per frame, across parallel workers.
- **Everything is a pure function of t.** No CSS animations or transitions, no `requestAnimationFrame`, no `Date.now()`, no state carried between frames. Imported components (a landing page's React phone) must have their animation and transition CSS stripped; `build-cinematic-v5.mjs` does it with postcss.
  - Moving a DOM node between containers by time is fine if it is derived from t (the gallery does it).
- **Media.** `<video class="clip" data-start data-duration data-media-start data-track-index muted>` is framework-owned: HyperFrames seeks it, so don't drive `currentTime` yourself. One `<audio>` carries the soundtrack (a placeholder; final mixes are muxed afterwards).
- **3D / canvas.** WebGL is fine (the Kaiyros ghost is three.js). Use `preserveDrawingBuffer: true` and re-derive the whole pose from absolute time every frame (emote start time + elapsed), never by stepping.
- **Wait for assets** before the first draw: `document.fonts.ready`, every `img.decode()`, atlases and canvases. Set `document.documentElement.dataset.launchReady = "true"` at the end.
- **Commands:**
  - `npx hyperframes lint <dir>`.
  - Snapshots: `npx hyperframes snapshot <dir> --at 12.5,30 --no-end --describe false -o <out>` (writes PNGs plus contact sheets; `--zoom ".selector"` crops in high density).
  - Render: `npx hyperframes render <dir> -o renders/x-4k.mp4 --fps 60 --resolution landscape-4k --quality high --crf 14 --workers 3 --strict`.

## The visual language
- **Black stage**, `#000`. One focal point per moment. Everything else is out of focus, dimmed or absent.
- **Type:** Geist (or the brand's sans), weight 400–500, tight tracking (−0.045 to −0.065 em), white `#f7f7f8`; muted grey `#7d7d84` for the less important words. Huge sizes: 104–236 px for single ideas, 66–76 px for supporting lines.
- **Word-by-word reveal on spoken times**: each word fades in 0.34 s from blur 7 px and 14 px lower, starting 40 ms before she says it (`util.revealWords`).
- **The spectrum** (orange `#ffb26b`, pink `#ff70ac`, violet `#b48aff`, blue `#6aa6ff`, teal `#5fe3d3`) appears only where the product acts:
  - **Sheen:** one band of light passing once through the word that carries the idea ("millions", "hook", "next", "text me", "watch", the "y" of the name).
  - **Spectrum:** the whole line flows, for the single biggest claim ("I do the work.").
  - **Glow:** around the phone glass when the product is reaching out or working. A thin bright edge (7 px, blur 5) plus a soft inward bloom (16 px, blur 14), seven colours whose stops wander at different rates so it flows rather than spins, and a brief `--flare` on key beats.
    - The Kaiyros founder rejected the first glow as "cheap": too thick and outside the screen. It must be thin and fade into the screen.
  - **Rainbow bars** in charts: no outline. The outlines read as cheap.
  - **Rings** of light around a detail in a video (the hook region, the product).
- **Cards:** the product's dark material (`linear-gradient(#19191b, #121213)`, radius 34, a 1 px inner line, a deep shadow), one idea each, big numbers (150–188 px, tabular). They arrive with `util.enter`: a slide from the right, a slight 3D tilt, an expo ease over 0.7 s. They leave by lifting 18 px and fading in 0.35 s.
- **The real product, everywhere:**
  - Real app screens, out of focus (blur 16 px, brightness 0.34), slowly drifting behind the card that explains them.
  - One wide, sharp shot of the real app.
  - The landing page's own phone component rendered into the film.
  - Ask for screens at 1920×1080 in dark mode; capture them from the real app with real-looking data.
- **Camera:** a slow push on the whole stage (scale 1 → 1.03–1.06 over a scene), snapping back to 1 on each hard cut. Nothing is ever fully still.
- **Grey for the competition:** flat, desaturated cards (charts, a dashboard, a chatbot box). They appear on each word, then fall and blur away on the claim.

## Components (starter kit `templates/project/source/`)
| Component | What it does | Notes |
|---|---|---|
| `headlines.js` | Spoken lines word by word; `sheen` words, `muted` words, `spectrum` lines; `scale` settles a held claim | Display text can differ from the spoken text (numerals, clean punctuation) |
| `phone.js` + `styles/phone.css` | Standalone iPhone in Messages: lock screen and notification with a tap, a thread with bubbles and link previews, a keyboard with key-down, key pop, predictions, caret, send tap, typing dots, smooth scroll, the glow | Type replies with `typing` in `events.js`; key sounds come from the same numbers |
| `gallery.js` | The product's screens gather behind the phone, then each lands in the thread as a message | Measure `slot` on a snapshot (image centre minus 960,540; width/1920) |
| `signoff.js` | The name, with an optional letter that grows in with a sheen (the y) | Then the tag, then the URL 2.4 s later |
| `util.js` | `win`, `track`, `smooth`, `expo`, `inOut`, `enter`, `count`, `sheen`, `revealWords`, `spoken` | Everything is a pure function of t |

Reusable extras from the investor film live in `templates/project/source/extras/`, with styles in `extras.css`:
| Component | What it does |
|---|---|
| `stat.js` | A market number, huge, counting on the clock (or in steps: 67M → 107M), with a pill, a label and the source line printed small |
| `field.js` | Two waves on one canvas. The feed is thousands of real video posters (a 20×13 atlas) in a warp, then a drift, then moved to the left half. The agents are spectral light streaks. Both fuse into one point on cue. Everything is driven by keyframe tracks (speed, frame, fuse) |
| `network.js` | The path: a hub (the mascot) with platform nodes that appear on their spoken word and connect with a line of light. One node can be "Live" (green) |
| `market.js` | The bridge: creators on the left, brands on the right, curves through the hub; one pair lights up and a "Deal closed" chip lands |
| `sky.js` | Reach: thousands of points appear as a number grows, then each gets a spectral dot spreading out from the centre |
| `pings.js` | The cold-open pile-up: alerts arriving faster and closer, out of focus, cut dead |
| `mascot.js` / `orb.js` | A three.js character driven by film time (bring your own scene factory), or a light orb of the brand's colours for products without a mascot |
| `examples/kaiyros-proof.js`, `examples/kaiyros-cards.css` | Kaiyros's proof cards (forecast, script, heat-map week, counter-offer, grey competitor cards), as patterns to copy; they reference images you supply |

Other scenes from the Kaiyros launch film (not included; ideas to rebuild for your product):
- a 3D mascot with a film-only emote (an anxious performance during the cold open), swapped in at build with `config.build.swap`;
- the landing page's own React phone rendered to static HTML (server-side render) instead of the standalone phone;
- a starfield of 2,600 real video posters accelerating into a warp (`extras/field.js` is its successor);
- a video analysis with a frozen frame, a ring on the hook and three insight cards;
- a commission card rolling 20 → 28%, a viral tracker sparkline, a brand match bar;
- grey competitor cards, sample request, script typing, an edit timeline whose pauses collapse, a week calendar with the post landing on Friday 7:30 PM;
- Showcase commissions rolling up, an inbox scan finding the offer, the counter card $600 → $900, tools connecting to the mascot.

## Choreography rules (each one cost a round of notes)
- **Make the moment physical.** The commission card blooms out of the notification and folds back toward the phone. The video blooms from its message attachment. The post chip flies into the Friday slot and gets its check.
- **"Everything collapses into the phone" looks cheap.** Things should *become* something: a screen lands as a message, a light becomes the phone's glow, a word condenses into the light that finds the phone.
- **No overlap on the phone.** Gallery screens wait behind the phone (z below) and only cross in front during their final flight. Keep every screen fully inside the frame.
- **One flight at a time,** spaced about 0.5 s, so each is readable; each arrival gets a receive sound and a small flare of the glow. Two simultaneous flights read as clutter.
- **Typing:** 0.85–1.2 s for a short reply. The keyboard rises 0.4 s before the first key and falls 0.55 s after send. Show the fingertip on send.
- **Struck-out values** (old price, old usage) need a `max-content` grid column, `white-space: nowrap` and `letter-spacing: 0`. A squeezed column made "$600" overlap itself.
- **Label/value cards:** labels on the left, every value right-aligned on one shared edge (`display:flex; justify-content:space-between` per row, the value group `justify-content:flex-end`). A grid that left-aligned values at different offsets "throws off the geometry of the card".
- **Never put text inside a small slot that moves.** A calendar slot about 110 px wide made "7:30 PM / Best time to post" spill out of the card. Show the moment as a shape (a lit cell), and put the text where there's room (a full-width row).
- **No outlines on grid cells.** Spacing separates days. "Post at the right moment" is now a heat map: a week × posting times, cells shaded by engagement (alpha ∝ heat^1.6 for contrast), the best cell filled with the spectrum and glowing, a soft filled highlight on its day column, and the post landing in a wide row beneath (`proof-kaiyros.js`, `.c-week`).
- **Highlight overlays inside CSS grids** must be `position:absolute` with an explicit `grid-column: a / b`. An in-flow highlight takes a cell and shifts every cell after it; an absolute one without an end line stretches to the edge.
- **Card footers stay short:** a button word plus a two-word state ("Review" / "Ready to send"), not a sentence.
- **Connections go behind the mascot.** Anything that links to her (beams, curves, flows) lives in a layer below the mascot's layer, so it grows out of her and passes through her. A line drawn over her face was the biggest complaint on the Kaiyros investor film. Don't put such layers inside `#cards`, which sits above the mascot.
- **Beams, not flat lines.** A gradient stroke (bright near her, fading outward), a blurred copy underneath for glow, and small pulses travelling along the path (`getPointAtLength`, driven by t). For a match, one spectral line runs the whole way through her, with a bright pulse travelling it.
- **Small UI must not squish:** give fixed-size icons `flex: 0 0 Npx`. The post card's check mark was squished.
- **Text padding** inside notifications matches iOS: 17–19 px padding, 14 px gap, radius 28.
- **Don't end on black.** Hold the final frame or fade with the music. A black second reads as "the video ended".
- **The mascot performs.** Kaiyros's ghost says hello, grows anxious as the alerts pile up, shows care at the promise and pride at the name. Emotes are triggered by absolute time.

## Gotchas the first kit build hit
- **Read the composition id inside `main()`** after the DOM exists. Reading it at module load crashed with "Cannot read properties of null (reading 'dataset')", and every frame rendered black.
- **Put fonts in a root-level `fonts.css`** with root-relative `assets/fonts/…` URLs. HyperFrames lint rejects `../` asset paths.
- **Extract borrowed CSS by whole rules**, using brace matching, not line by line. A half-copied rule breaks the rest of the stylesheet.
- **Class names collide across components.** The phone's `.day` label picked up the calendar card's `.day` box. Prefix component classes (`msg-day`).
- **A letter grown in with `overflow:hidden`** clips its descender ("y"). Add bottom padding and an equal negative margin.
- **The soundtrack `<audio>` must exist before lint and render.** Use a silent placeholder until the first mix.
- **Run `npx hyperframes check <dir>`** (lint + runtime + layout + contrast) before snapshots. It reports runtime errors that snapshots only show as black frames.

## Snapshot QA (do this before every render)
- Snapshot every transition, the mid-point of every card and every typing beat: `--at` with 10–20 times.
- Read the contact sheet, then the full frames at the risky moments.
- Check:
  - one focal point;
  - nothing cropped at the frame edge;
  - nothing overlapping that shouldn't;
  - the text fits;
  - glow thin;
  - struck values readable;
  - no black gaps;
  - each number correct.
- After the render, pull 3–4 frames from the MP4 itself (`ffmpeg -ss T -frames:v 1`) to confirm the render matches the snapshots.
- Do not run a dev server or browser screenshots for this; HyperFrames snapshots are the source of truth.
