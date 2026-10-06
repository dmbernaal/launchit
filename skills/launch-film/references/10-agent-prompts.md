# 10 · Agent prompts that worked

Use subagents for research and criticism when your user is happy with that (some people don't want agents spawned
unprompted; ask once). Run them in the background while you build something else. Each one writes a file and returns its report. A critic works only on its
own area (the score critic never touches script or picture).

## Market researcher (investor films)
> You are a research analyst preparing facts for a 60–80 second investor video for <company>, which <one sentence>.
> It starts with <wedge> and plans to expand to <path>. Today is <date>. The founder's framing: <markets that converge>.
> Every number will be fact-checked by investors, so accuracy matters more than size.
> Use WebSearch and WebFetch. Prefer primary or reputable sources (research firms, banks, consultancies, eMarketer,
> Statista, filings, official announcements, Bloomberg, Reuters, WSJ, FT). Note where reports disagree and give a range.
> Find, with year, source, URL and publication date: 1. <market A> current and projected; 2. <market B> current and
> projected, plus any credible figure where the markets meet; 3. the wedge platform's scale (note conflicting reports);
> 4. the user population (creators, sellers…); 5. one sourced line per competitor or platform showing they are investing
> in this; 6. one or two "why now" facts. Output a concise report with a table per section (figure | year | source |
> URL | published | confidence), then "Recommended on-screen numbers": the 3–5 most defensible, round numbers, with
> the exact on-screen wording and the source line in small type. Flag anything unverified. Never invent numbers.
> Write it to <path> and return it.

What came back for Kaiyros (2026-10):
- **Lead with the US social-commerce figure**, not a global one. The global estimates disagree by 3×.
- **Agentic commerce:** McKinsey's $3–5T by 2030 is global retail revenue that agents could orchestrate. Say "could flow through AI agents" and label it a projection.
- **TikTok Shop's $64B for 2025** is a third-party estimate (Momentum Works). Say "an estimated" and print "est.".
- **Creators: 67M → 107M** (Goldman Sachs, 2025). That is reach, never TAM.

## VC critic (script)
> You are a seed-stage venture partner at a top fund who has seen 5,000 pitch videos, paired with a world-class film
> editor who cut Apple keynote films. Critique a draft script for a ~75-second investor film, then give an improved
> script. Be blunt and specific. Read: the brief, the draft with beat sheet, the sourced research, and this skill's
> 02-script.md, 08-case-study-kaiyros.md and the project's docs/feedback-log.md. Deliver: (1) critique, max ~350 words: does the hook make an investor keep
> watching in 8 s with sound off; are what / why now / how big / why you win / where it goes answered in a sensible
> order; anything confusing, risky (claims, numbers), cheesy or too long; is the concept strong; which numbers need
> different phrasing. (2) A revised script in the same table format with v4 delivery tags, 150–170 words. (3) Two
> alternative hooks with reasons. Write it to <path> and return it.

What it caught on the Kaiyros investor draft (all adopted):
- **The product came too late.** It arrived at 0:30; say what it is and who it's for by 0:09.
- **Four numbers before the company reads as a TAM slide.** Lead with the product, then one number per wave.
- **"X meets Y" sounds like trend-surfing.** The investable insight was sharper: shoppers are getting agents, and the creators who sell to them need one too.
- **Etymology spends seconds on no information.** It cut the Greek line and left the name's meaning as a wink ("at the right moment").
- **One claim was unsupported** ("behind most of those sales is a creator"). It was cut.
- **Logos imply partnership.** Use plain type for platforms.
- **Never name a retired product** ("Cortana"). Carry the idea in the line instead: "I'll be the one they text."

## Composer critic (score)
> You are an elite film composer and score mixer, working only on the score of a <length> film. Do not touch the
> script or picture. Do not call paid APIs or generate audio. Read this skill's 05-score.md, 05a-score-styles.md and the project's docs/feedback-log.md
> (Music), plus the palette chosen in docs/brief.md, the film clock (source/timeline.json cues), the narration, the plan generator and its JSON. The reference
> score <path> (uploaded as song_id <id>) has landmarks <list>; analyse it with scripts/music-scan.py. Picture beats:
> <beat list with film seconds>. Tasks: (1) critique the cue sheet implied by chunk boundaries, texts, styles, context
> adherence and conditioning ranges: entrances on syllables, where the peak belongs, whether each conditioning range
> matches what that chunk should sound like (measure it), whether the plans are distinct enough, risks. (2) Edit the
> generator and regenerate the plans (text ≤ 200 chars, 3000–120000 ms chunks, durations sum exactly, no names, keep
> the negative list). (3) Write mix rows {from_s, to_s, music_gain_db, duck_db, note} plus hard / tapers / mutes /
> rides keys. (4) A ≤ 400-word report with a one-line description and reject criteria per plan.

What it caught on the investor film (all adopted):
- **Entrances on syllables:** "TikTok", "Instagram" and "I'm". It moved every boundary into a hole in her speech.
- **The peak belonged elsewhere.** It moved off the platform list to the hole after "close the deal", so it carries "Sixty-seven million… a hundred and seven million".
- **Conditioning ranges were off:** they pointed at the wrong parts of the reference (a busy stretch under dense numbers; the launch peak under "ask for more").
- **Tempo tags fought the reference.** The reference measured 60 (clock) and 88 (drive), so the tags became "slow clock-like pulse" and "88 BPM".
- **The plans were too similar.** It made them distinct palettes: A, the sister film; B, the modern pulse; C, all-acoustic orchestra.
