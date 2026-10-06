# 08 · Case study: two Kaiyros films

Kaiyros is an AI "personal manager" for TikTok Shop creators. The pipeline was built while making two films for it:
- **The creator launch film:** 114 s. About 15 rounds of notes, most of them on the score.
- **The investor film:** 89 s. Built with this skill's kit in two rounds.

Every note below came from the founder, together with the fix that worked. Read it for the method; the style
(black stage, cinematic strings and pulse, a calm female narrator, a 3D ghost mascot) was right for *that* brand and is
not a default.

**What generalizes:**
- Process: plan, then wait for a go; one idea; measured QA; variants on a locked picture.
- Craft: one continuous voice take in one register; cut only in silence; taper into silences; no unplanned drops; entrances in the holes; the peak on the biggest moment.
- Picture: no text spilling from small slots; links drawn *behind* the character; aligned card geometry.

## Process
- **Plan, then wait.** The founder asked to "go back and forth" before building. When generation started on a plan note, they stopped it: they had only asked for planning. From then on: present the full plan, and build on an explicit go.
- **Critique, then one idea.** A blunt critique of the old cuts, then a single unifying idea, was accepted on first read and called a masterpiece. The idea: *Chronos* (the hours that pass) vs *Kairos* (the moment that matters); the product's name already carries it.
- **Measured QA earns trust.** Whisper transcripts, loudness numbers and frame sheets at every transition before showing anything.
- **Develop audio separately.** The founder asked whether the audio could be developed without re-rendering the video. Locking the picture and muxing scores made score rounds take minutes instead of hours.
- **Choices by ear:** two or three numbered variants on the same picture, each described in one line.
- **A critic subagent for the score was welcome,** on the condition that it changed nothing but the score.
- **When stakeholders disagree,** follow the person who owns the decision. (A co-founder wanted a shorter film; the founder decided.)

## Story and script
- **"Save time" was rejected as the pitch.** Sell the life it gives back and the moments it catches.
- **The founder wanted more use cases shown:** scheduling and posting, negotiating, deep analysis, viral tracking, sample requests, inbox offers, tool integrations.
- **Claims:**
  - "Millions of videos" (the models were trained on more than the app's own database).
  - Custom models stated plainly ("I see what's next").
  - Never "predictive algorithms" or "ML".
- **The line against competitors** who wrap a chatbot around data: "Other tools end there. Charts. Dashboards. A chatbot on top. I do the work."
- **The simplest promise became the climax:** "All you have to do… is text me."
- **Never call a launch feature off or "coming soon"** in launch creative.
- **Locked lines,** never rewritten once loved: "You create. I'll keep watch." / "I'm Kairos. Your personal manager for TikTok Shop."

## Voice
- **The register:** calm, warm, caring, one continuous take.
- **What broke it:** a line generated "brighter" went giddy, and another came out almost shouted. The fix was one family of tags for every line.
- **The fall in "Other tools… end there"** came from pacing tags (slower, voice lowering), not from emotion words.
- **The beat before "I do the work":** the founder asked for at least a quarter to half second; it shipped at 1.25 s.
- **A stutter at 1:18** came from cutting on alignment times that drift. Cutting in measured silence fixed it.

## Picture
- **Black stage,** white type, and the spectrum only on the words that carry the idea. The claim line carried the full spectrum.
- **The phone's glow:**
  - first version: "cheap", too thick and outside the glass;
  - then: thinner, fading into the screen;
  - shipped: a 7 px edge plus a soft inward bloom.
- **iOS details matter:** notification padding, bubble spacing, keyboard behaviour.
- **Show more of the real app:** screens behind cards, one wide shot, the gallery.
- **Chart bars:** no outlines.
- **Fixed-size icons:** `flex: 0 0`. A squished check mark was noticed.
- **Struck-out values** need a `max-content` column. One overlapped itself.
- **No black second at the end.** It reads as "the video ended".
- **Screens shrinking into the phone looked cheap.** Shipped: they gather behind the phone and land in the thread as messages, one at a time ("small things are golden").
- **Rights:** a real creator's video couldn't be used without permission. A hands-only library video replaced it.
- **Investor film, round 1:**
  - **Card values:** right-align values in label/value cards on one edge, so the geometry holds.
  - **Footers:** short ("Review" / "Ready to send").
  - **Links behind the mascot:** network lines and marketplace curves drawn over the mascot were the biggest complaint. They must sit behind her, so they appear to grow out of and pass through her. Gradient beams with travelling pulses replaced the flat lines.
  - **The calendar card:** a calendar "slot" let its text spill out, and outlined day boxes looked dated. It was redesigned as a heat map of the week, with the best moment lit and the post landing in a full-width row beneath it.

## Music (method lessons; the style itself was brand-specific)
- **Starting point:** the founder wanted the emotional pull of a big film score, "not war". A generic epic orchestral take read as "going to war"; a heroic-sci-fi take with choir was the wrong direction.
- **What they loved:** an early score (cello, felt piano, a clock-like pulse) and a modern pulse (synth arpeggio, spiccato strings, sub bass).
- **Shipped:** the first half of one take, a taper into silence, then a pulse-driven take from the claim onward.
- **Music forced in too early** under the closing promise was noticed. The fix: silence under the promise, with the piano entering in the hole after it.
- **Too much sound under "text me".** The fix: near silence, then music back for the ending.
- **No lyrics or vocal textures** ("it's more the OST").
- **Drops were heard as glitches:**
  - a dip ride at 50 s;
  - a hard cut at 1:02;
  - a take whose pulse stopped exactly on the word "stop".
  The fixes: taper instead of cutting; crossfade into the same take's own steady stretch from earlier to carry the pulse through the word.
- **The emotional centre** was the climax ("we ask for more") and the "one conversation" moment: a blow to competitors and a wow for users.
- **Investor film:** a composer critique moved the peak to the film's biggest fact (the creator counts). The founder chose the most modern of three palettes. Its hit-decay-silence pattern was patched with the take's own drive.

## Investor film brief (as given)
- **Shorter than the launch film.** If investors watch two full minutes, that's a win, but don't count on it. It shipped at 89 s.
- **Answer investor questions:** market size, with two markets converging (AI agents × social commerce).
- **The path:** the wedge platform first, then all social commerce and UGC, then a marketplace bridging creators and brands, then the vision of the personal agent every creator has. Say the vision without naming a retired product ("I'll be the one they text").
- **Full rein, three variants,** critic subagents allowed, new music and voice.
