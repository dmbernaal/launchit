"""Listen to a narration take the way a viewer would: transcribe it (whisper small.en, word timestamps) and compare
with the script. Flags missing/extra words, stutters (a repeated word), rushed phrases and long dead air.
Usage: python3 scripts/voice-qa.py audio/voice/take-01 [docs/narration.txt]
Also prints the loudness of each sentence so a giddy or shouted line shows up as a jump (more than ~4 dB)."""
import json, os, re, subprocess, sys, tempfile, difflib
import numpy as np
FILM = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
take = os.path.join(FILM, sys.argv[1]); script = os.path.join(FILM, sys.argv[2] if len(sys.argv) > 2 else json.load(open(os.path.join(FILM, "film.config.json")))["voice"]["script"])
mp3 = os.path.join(take, "narration-raw.mp3")
norm = lambda w: re.sub(r"[^a-z0-9']", "", w.lower())
want = [norm(w) for w in re.sub(r"\[[^\]]*\]", " ", open(script).read()).split() if norm(w)]
with tempfile.TemporaryDirectory() as d:
    subprocess.run(["whisper", mp3, "--model", "small.en", "--language", "en", "--word_timestamps", "True", "--output_format", "json", "--output_dir", d, "--verbose", "False"], check=True, capture_output=True)
    js = json.load(open(os.path.join(d, os.path.splitext(os.path.basename(mp3))[0] + ".json")))
heard = [(norm(w["word"]), w["start"], w["end"]) for s in js["segments"] for w in s.get("words", []) if norm(w["word"])]
sm = difflib.SequenceMatcher(a=want, b=[h[0] for h in heard], autojunk=False)
issues = []
for op, a0, a1, b0, b1 in sm.get_opcodes():
    if op != "equal": issues.append(f"{op:8} script: {' '.join(want[a0:a1]) or '-':40} heard: {' '.join(h[0] for h in heard[b0:b1]) or '-'} @ {heard[b0][1] if b0 < len(heard) else heard[-1][2]:.2f}s")
for i in range(1, len(heard)):
    if heard[i][0] == heard[i - 1][0] and heard[i][0] not in ("every", "the", "that"): issues.append(f"stutter? '{heard[i][0]}' twice at {heard[i][1]:.2f}s")
    gap = heard[i][1] - heard[i - 1][2]
    if gap > 2.2: issues.append(f"dead air {gap:.1f}s before '{heard[i][0]}' at {heard[i][1]:.2f}s")
raw = subprocess.run(["ffmpeg", "-v", "error", "-i", mp3, "-f", "f32le", "-ac", "1", "-ar", "16000", "-"], capture_output=True, check=True).stdout
x = np.frombuffer(raw, dtype=np.float32)
print(f"{len(heard)} words heard, {len(want)} in script, match {sm.ratio():.3f}")
print("\n".join(issues) or "no word issues")
print("\nsentence loudness (dBFS) and pace (words/s):")
for s in js["segments"]:
    a, b = int(s["start"] * 16000), int(s["end"] * 16000); seg = x[a:b]
    if len(seg) < 1600: continue
    lv = 20 * np.log10(np.sqrt((seg ** 2).mean()) + 1e-9); n = len(s.get("words", []))
    print(f"{s['start']:6.2f}–{s['end']:6.2f}  {lv:6.1f} dB  {n / max(.1, s['end'] - s['start']):4.1f} w/s  {s['text'].strip()[:70]}")
