# 02 · Script and beat sheet

## Line craft
- **Spoken, not written.** Short sentences. One thought per line. Fragments are welcome ("Every hook. Every product. Every brand.").
- **Concrete over abstract.** "The moment a brand offers you less than you're worth… we ask for more." beats "negotiation support".
- **The product speaks in first person**, as a calm, caring manager: warm, never salesy. "I'll request the samples. Write the script. Sharpen the hook. Make the cut. And post it… at exactly the right moment."
- **Short line against long list.** After a run of verbs, land on four words: "I do the work."
- **Name the competitor class, never a company.** "Other tools… end there. Charts. Dashboards. A chatbot on top."
- **Lock the lines that work.** Once the client loves a line, it is never rewritten. Kaiyros locked "You create. I'll keep watch." and "I'm Kairos. Your personal manager for TikTok Shop." Spoken "Kairos", shown "Kaiyros".
- **Claims:** present custom models as fact in plain words ("I've studied millions of videos that sold", "I see what's next"). Never say "predictive algorithms", "machine learning" or "AI-powered". Never quote internal database counts when the honest frame is bigger (the models were trained on more than the app's DB holds: "millions of videos").
- **Feature truth:** show only what ships by launch, presented as shipped. No caveats inside the film.

## Pace (eleven_v4, speed 0.72)
- About 2.0–2.4 words per second including pauses. 115 s ≈ 230 words; 75 s ≈ 150; 60 s ≈ 120.
- Leave holes for the music: a `[long pause]` between acts gives roughly 1–2 s. The editor re-times the gaps anyway (03).
- The emotional peak line needs room on both sides. "we ask for more" got a 1.4 s lead-in and a breath of silence before the musical peak.

## ElevenLabs v4 delivery tags (what worked, what broke)
Tags go inline as `[Direction]` before the words they shape. Ellipses add pauses and weight, CAPS add emphasis, and
`[short pause]` / `[long pause]` structure the breath. v4 ignores SSML `<break>`.
- **One continuous take for the whole script.** Generating lines separately gives a different voice and emotion per line. The Kaiyros founder heard it at once: "it caused a different voice and a whole different emotion… an inverse of the previous one".
- **Keep the emotional register narrow.** Every tag should sit within one family: warm, calm, quietly confident, intimate. Avoid sharp swings like "brighter, gaining momentum" after "soft, thoughtful". That made the voice "overly exaggerated… giddy" and she "yelled" "pays you more". The fix was "[Warm, calm, quietly confident]" for every feature line.
- **Shape a fall with tags and punctuation, not emotion words.** For "Other tools… end there" the Kaiyros founder wanted the tone to drop on "end there" without sounding "disappointed". `[Measured, slow] Other tools... [slower, voice lowering] end there.` worked.
- **Whisper only at the promise.** `[Soft, intimate voice] You create. [short pause] [Gentle near-whisper] I'll keep watch.`
- **Name, proud and clear:** `[Warm, proud, clear and unhurried voice] I'm Kairos. [short pause] Your personal manager for TikTok Shop.`
- **Emphasis by CAPS on one word per film, at most.** "And WHY it works." Too many CAPS read as shouting.
- **Settings that held a calm, warm read on the reference films:** stability 0.5–0.55, similarity 0.89, style 0.25, speaker boost on, speed 0.72. Raising style or lowering stability adds drama you don't want.

## The reference script (Kaiyros v6, shipped)
```
[Warm, unhurried, intimate] You started TikTok Shop to create... [short pause] not to spend your life managing it.
[long pause]
[Soft, thoughtful, storytelling] The Greeks had two words for time. [short pause] Chronos... the hours that pass. [short pause] [Warmer, slower] And Kairos... the moment that matters.
[Reassuring, quietly confident] So let me take care of the hours... [warm] and I'll find you the moments.
[long pause]
[Warm, calm, quietly confident] The moment a product starts to take off... or pays you more to sell it.
[Warm, calm, a gentle smile] The moment a video starts going viral... yours, or anyone's.
[Warm, knowing] The moment a brand is looking for someone like you.
[long pause]
[Quiet awe, slower, intimate] I've studied millions of videos that sold. [short pause] Every hook. Every product. Every brand.
[Calm, confident, measured] So I don't just see what's working... [short pause] I see what's next.
[Curious, thoughtful, unhurried] The second that makes someone stop... and the reason they buy. [Warm, encouraging mentor] And WHY it works.
[long pause]
[Measured, slow] Other tools... [slower, voice lowering] end there. [short pause] Charts. Dashboards. A chatbot on top.
[long pause]
[Calm, certain, warm] I do the work.
[Confident, steady, unhurried] I'll request the samples. Write the script. Sharpen the hook. Make the cut. And post it... at exactly the right moment.
[Reassuring, warm] I'll keep your Showcase on the best commissions... even on the days you don't post.
[Calm, focused] I'll find the offers buried in your inbox... [Protective, firm, quietly proud] and when a brand offers you less than you're worth... [short pause] we ask for more.
[long pause]
[Warm, intimate] I connect to the tools you already use. [short pause] And all of it... happens in one conversation. [short pause] No new app to learn.
[long pause]
[Soft, confident, a little playful] All you have to do... is text me.
[long pause]
[Soft, intimate voice] You create. [short pause] [Gentle near-whisper] I'll keep watch.
[Warm, proud, clear and unhurried voice] I'm Kairos. [short pause] Your personal manager for TikTok Shop.
```
The intro and the ending came from an earlier approved take; the middle from a later take. They were spliced
inside measured silences (03). Splicing takes is fine when the register is the same.

## Beat sheet format (what the client approves)
One row per beat. Fill in every column before asking for a go.

| Film time | Line (exact) | Picture | Music | Sound |
|---|---|---|---|---|
| 0–6.4 | "You started TikTok Shop to create… not to spend your life managing it." | Ghost appears; other apps' alerts pile up faster, out of focus | none (riser + ticks are sound design) | 24 pings accelerating; hard cut 6.36 |
| 6.4–7.4 | (silence) | Hard cut. Ghost alone. | silence | — |

Also list: the locked lines, every on-screen number with its source or "authored example", every real UI screen
needed (with capture instructions), and the decisions you need from the client.

## Investor films (different job, same language)
An investor gives you 10–20 seconds before deciding to keep watching. The film must answer, in order of
importance:
1. **What is it, and for whom?** One sentence, in the first 10 s.
2. **Why now?** What changed: a platform shift, a new buyer behaviour, a capability that didn't exist before.
3. **How big?** Market size, sourced, round, shown big. If two markets converge (Kaiyros: agentic AI × social commerce), show the convergence visually, as two fields meeting.
4. **Why this team / product wins.** The unfair insight, the data advantage, the custom models, what it does that others only display. Use proof, not adjectives.
5. **Where it goes.** The wedge (one platform), then the expansion path (every platform), then the endgame (the marketplace, the default agent). Name platforms only as the market they compete in, never as partners unless they are.
6. **Traction:** only real numbers the client approves. If there are none to show, leave traction out; never invent it.
7. **The close:** the name, the one-line category ("The agent for social commerce"), the URL. The ask belongs in the room, not the film, unless the client says otherwise.

Pacing: 60–90 s. The hook has to work with the sound off too (on-screen words carry it). Keep the same visual
language as the launch film, so the brand reads as one thing. The calm voice reads as confidence to investors;
don't switch to a hype read.

### Example: the Kaiyros investor film (89 s, built with this kit)
The structure that came out of the VC critique (`10-agent-prompts.md`):

```
[Warm, unhurried, intimate] The store became a feed. [short pause] Creators do the selling. [short pause] [Warm, calm, quietly confident] I'm the agent they text... to run their shop.
[Calm, measured] TikTok Shop nearly doubled in twenty twenty-five... [short pause] to an estimated sixty-four billion dollars. [short pause] Every big platform is racing to catch up.
[Calm, measured] And AI learned to act. [short pause] By twenty thirty, three to five trillion dollars of shopping... could flow through AI agents.
[Soft, thoughtful] Shoppers are getting agents. [short pause] [Warmer, slower] The creators selling to them... need one too.
[Warm, calm, quietly confident] I was trained on millions of videos that sold. [short pause] So I see what's next... write the script... and post it at the right moment. [long pause] [Protective, firm, quietly proud] When a brand offers too little... [short pause] I ask for more.
[Measured, slow] Other tools... [slower, voice lowering] show you charts. [long pause] [Calm, certain, warm] I do the work.
[Warm, calm, quietly confident] Today, TikTok Shop. [short pause] Next... everywhere creators get paid. [short pause] Instagram. Amazon. Shopify. Walmart.
[Warm, calm, quietly confident] Then one marketplace... where brands and creators meet, [short pause] and their agents close the deal.
[Calm, measured] Sixty-seven million creators today. [short pause] A hundred and seven million by twenty thirty. [long pause] [Soft, intimate voice] I'll be the one they text.
[Warm, proud, clear and unhurried voice] I'm Kairos. [short pause] Every creator's agent.
```
- **What / for whom by 0:09.** Then each wave gets one number, then the insight that joins them, then proof, the claim, the path, the bridge, reach and the name.
- **Write numbers as words** so v4 reads them right ("twenty twenty-five", "sixty-four billion"). Whisper writes them back as digits in QA; that's expected.
- **On screen:** every number carries geography, year and whether it's an estimate, forecast or projection, plus a small source line.
- **Sound-off support:** a title beside the phone in the hook ("Kaiyros · The AI agent TikTok Shop creators text.").
- **Platforms in plain type,** never logos, and named as markets ("everywhere creators get paid"), never as partners.
- **Keep the persona's voice;** don't switch to a company "we". The product pitching itself is the demo.
