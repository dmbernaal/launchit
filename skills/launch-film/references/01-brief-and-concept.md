# 01 · Brief, critique, concept

## Intake: get these before writing anything
Write the answers to `docs/brief.md`. Where an answer is missing, ask, or make a sensible default and say so.

1. **Product in one sentence**, in the client's words. The user's job, not the tech. (Kaiyros: "an AI personal manager for TikTok Shop creators".)
2. **Audience and the moment they watch.** A creator scrolling a landing page and social; an investor between meetings; a client's customers.
3. **Where it plays.** Landing hero, social (vertical cut needed?), a pitch deck, a launch event. Sets length, the hook and the aspect ratio.
4. **The one truth.** Why their life is different with it. It is usually emotional, not a feature. (Creators started TikTok Shop to create, not to manage.)
5. **Features worth showing.** Get the full list, then rank. Each needs a concrete, filmable moment: a number that changes, a message that arrives, a card that fills in.
6. **Proof.** Real UI (screens and flows to capture), real data you may show, stats with sources, a named example video or customer if allowed. Ask which data is private.
7. **Competitors and the line against them.** Kaiyros: "Other tools end there. Charts. Dashboards. A chatbot on top. I do the work."
8. **Brand assets.** Logo/wordmark, mascot or character (Kaiyros has a 3D ghost), colours, fonts, the landing page (its components can be rendered into the film), the voice ID.
9. **Claims guardrails.** What's live at launch, what must not be said, legal phrasing ("custom models" vs "predictive algorithms"; Kaiyros said "I see what's next", never "machine learning").
10. **Length and format.** Default 60–90 s for launch, 45–75 s for investors, plus a 15–30 s cut-down if social needs it. 16:9 4K60 master.
11. **Look.** The brand's colours (they replace the default spectrum in `styles/film.css`), fonts, and light or dark stage. The default black stage with one spectral light is a starting point, not a requirement.
12. **Music direction.** A reference track they love (the best brief there is), words for the feeling, and anything to avoid. Turn these into 2–3 palette options from `05a-score-styles.md`.
13. **Providers and budget.** ElevenLabs, OpenAI, a local voice or a human read; generated or licensed music; generated or library sound effects (`11-providers.md`). Note any per-take budget.

## Critique first (Steve Jobs mode)
If earlier videos, a deck or landing copy exist, critique them before proposing anything. Be specific and brutal
about what dilutes the idea:
- feature lists without a story;
- several focal points on screen;
- busy backgrounds;
- music that announces war;
- a voice performing excitement instead of feeling it;
- a black gap that looks like the end;
- "coming soon" anywhere.

This earns the right to propose a single idea, and clients respond to it. On the Kaiyros film the critique of
the old cuts came before the concept, and the concept was accepted on first read: "I actually think that's a
masterpiece. Make it happen."

## Finding the one idea
Look for a word, image or contrast that holds the product's whole promise. It should be something the viewer already
knows and that the product makes newly true.
- Kaiyros: *Chronos* (the hours that pass) vs *Kairos* (the moment that matters). The product's name already
  carries it: Kairos gains a "y" and becomes Kaiyros. "So let me take care of the hours… and I'll find you the
  moments." Every feature then became a *moment*: the moment a product takes off, the second that makes someone
  stop, the moment to ask for more.
- Test: can every feature be phrased in the idea's language? If not, pick a different idea or cut the feature.
- Avoid "save time" pitches; the Kaiyros founder rejected that framing outright. Sell
  the life it gives back, the moments it catches and the money it protects.

Present 2–3 concepts. Each gets a one-sentence idea, a 5-beat arc (hook, turn, proof, climax, promise) and its
opening and closing lines. Then give your pick and one reason.

## Arcs that work
Pick the shape that fits the idea; don't force one.
- **Moments arc** (the Kaiyros launch film, detailed below): felt problem → the idea → proof as moments → the turn against competitors → the claim → the work montage → the climax → the release → the promise → the name. Best for "it changes your day" products.
- **Demo-first:** open on the product doing the impossible thing in one shot, *then* say what it is. Best when the product is visually magical.
- **Problem → turn → product → proof → name:** classic and fast (30–60 s). Best for social cut-downs.
- **Founder or customer story:** one real person, one real moment, the product as the turning point. Best when trust is the sale.
- **Numbers-first (investors):** what it is in 10 s → why now → how big (sourced) → why it wins → where it goes → the name. See `02-script.md`.

### Example: the Kaiyros launch film's arc
1. **Cold open (0–7 s): the problem, felt.** The pain is shown, not explained. In Kaiyros, other apps' alerts pile
   up faster and closer around the mascot, under an accelerating tick and a Shepard-tone riser. A hard cut to
   silence follows, then the mascot alone.
2. **The idea (7–21 s).** Typography only, on black. "Chronos" in grey, letters ticking away; "Kairos" in white
   with one spectral sheen. The word condenses into a light that travels down to where the phone rises.
3. **Proof as moments (21–55 s).** Each feature is a moment with one card in focus: the notification on the lock
   screen, a commission rolling from 20% to 28%, a video going viral, a brand match. Then what the product knows
   ("I've studied millions of videos that sold. Every hook. Every product. Every brand.") over a warp field of
   real video posters.
4. **The turn against competitors (55–62 s).** Grey, flat, cold UI: "Other tools… end there. Charts. Dashboards.
   A chatbot on top." The music tapers to silence. Hold a beat (0.5–1.25 s).
5. **The claim (62.7 s).** "I do the work." Full spectrum on the line and a single orchestral impact. The music
   re-enters.
6. **The work montage (63–84 s).** Verbs, one card each: request samples, write the script, sharpen the hook, make
   the cut, post at the right moment, keep your Showcase on the best commissions, find the offer in your inbox.
7. **Climax (84.6 s): "we ask for more."** The creator types "That's too low." and the counter card blooms from
   $600 to $900. This is the musical peak.
8. **Everything in one conversation (86–93 s).** Tools connect to the mascot. Then the app's real screens gather
   behind the phone and land in the thread as messages, one at a time.
9. **The release (94–97 s): "All you have to do… is text me."** The music almost gone, the phone on the right,
   "Did we hit our goal?" typed. Reply: "We did. October goal: done. 🎯"
10. **The promise (98–105 s).** Silence. The mascot returns. "You create. [pause] I'll keep watch." spoken near
    whisper. Solo piano enters in the hole right after.
11. **The name (106–114 s).** "I'm Kairos." "Kai·y·ros", where the y grows in with a sheen, then the tagline and
    the URL. A warm final chord. Picture ends on the frame. No black gap: a black second "seems like
    the video ended".
