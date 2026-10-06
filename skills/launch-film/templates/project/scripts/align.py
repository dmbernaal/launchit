"""Word timings for any narration audio, from any provider or a human recording.
Usage: python3 scripts/align.py audio/voice/take-01 [docs/narration.txt]
Runs Whisper (small.en, word timestamps) on <take>/narration-raw.mp3 and writes <take>/words.json:
{"words": [{"w": word as written in the script, "t": start s, "e": end s}], "source": "whisper"}.
Words are mapped back onto the SCRIPT's spelling (so cues like "twenty twenty-five" still match when Whisper hears
"2025"); script words Whisper didn't hear get times interpolated between their neighbours.
scripts/timeline.mjs uses words.json whenever a take has no ElevenLabs alignment.json.
Whisper times are good to about 0.1 s; timeline.mjs still cuts only inside measured silence."""
import json, os, re, subprocess, sys, tempfile, difflib
FILM = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
take = os.path.join(FILM, sys.argv[1])
cfg = json.load(open(os.path.join(FILM, "film.config.json")))
script = os.path.join(FILM, sys.argv[2] if len(sys.argv) > 2 else cfg["voice"]["script"])
norm = lambda w: re.sub(r"[^a-z0-9']", "", w.lower())
tokens = [w for w in re.sub(r"\[[^\]]*\]", " ", open(script).read()).split() if norm(w)]
mp3 = os.path.join(take, "narration-raw.mp3")
model = os.environ.get("WHISPER_MODEL", "small.en")
with tempfile.TemporaryDirectory() as d:
    subprocess.run(["whisper", mp3, "--model", model, "--language", "en", "--word_timestamps", "True", "--output_format", "json", "--output_dir", d, "--verbose", "False"],
                   check=True, capture_output=True)
    js = json.load(open(os.path.join(d, os.path.splitext(os.path.basename(mp3))[0] + ".json")))
heard = [(norm(w["word"]), float(w["start"]), float(w["end"])) for s in js["segments"] for w in s.get("words", []) if norm(w["word"])]
times = [None] * len(tokens)
sm = difflib.SequenceMatcher(a=[norm(t) for t in tokens], b=[h[0] for h in heard], autojunk=False)
for op, a0, a1, b0, b1 in sm.get_opcodes():
    if op == "equal":
        for k in range(a1 - a0): times[a0 + k] = (heard[b0 + k][1], heard[b0 + k][2])
    elif op == "replace":   # e.g. script "twenty twenty-five" vs heard "2025": share the heard span by length
        t0, t1 = heard[b0][1], heard[b1 - 1][2]; L = [max(1, len(norm(tokens[k]))) for k in range(a0, a1)]; acc = 0
        for i, k in enumerate(range(a0, a1)):
            s = t0 + (t1 - t0) * acc / sum(L); acc += L[i]; times[k] = (s, t0 + (t1 - t0) * acc / sum(L))
# Fill words Whisper never heard between their neighbours.
for k in range(len(tokens)):
    if times[k] is None:
        prev = next((times[j][1] for j in range(k - 1, -1, -1) if times[j]), 0.0)
        nxt_i = next((j for j in range(k + 1, len(tokens)) if times[j]), None)
        nxt = times[nxt_i][0] if nxt_i is not None else prev + .4 * (len(tokens) - k)
        n = (nxt_i if nxt_i is not None else len(tokens)) - k
        span = (nxt - prev) / (n + 1)
        for i in range(n): times[k + i] = (prev + span * (i + .5), prev + span * (i + 1))
words = [{"w": tok, "t": round(t, 3), "e": round(e, 3)} for tok, (t, e) in zip(tokens, times)]
json.dump({"words": words, "source": f"whisper {model}", "match": round(sm.ratio(), 3)}, open(os.path.join(take, "words.json"), "w"), indent=1)
print(json.dumps({"take": sys.argv[1], "words": len(words), "match": round(sm.ratio(), 3), "end": words[-1]["e"] if words else 0}))
