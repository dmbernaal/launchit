"""Read a score take before editing it: a level map, its silences, and its biggest musical arrivals.
Usage: python3 scripts/music-scan.py audio/music/<take>/score.mp3 [start_s]
start_s (default from docs/score-plans.json) prints times on the film clock the plan was composed for.
Use it to pick EDL cut points (quiet moments), the re-entry onset, and the real swell to pin on a peak line.
Warning learned the hard way: the largest level RISE is often a soft re-entry after a silence, not the climax.
Pin the loudest sustained arrival (the "swell" list), and check it by ear or with a fine map around it."""
import json, os, subprocess, sys
import numpy as np
FILM = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
path = os.path.join(FILM, sys.argv[1])
s0 = float(sys.argv[2]) if len(sys.argv) > 2 else json.load(open(os.path.join(FILM, "docs/score-plans.json")))["start_s"]
x = np.frombuffer(subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-f", "f32le", "-ac", "1", "-ar", "24000", "-"], capture_output=True, check=True).stdout, dtype=np.float32)
n = 1200   # 50 ms
lv = np.array([20 * np.log10(np.sqrt((x[i:i + n] ** 2).mean()) + 1e-9) for i in range(0, len(x) - n, n)])
t = lambda i: s0 + i * .05
print(f"duration {len(x) / 24000:.2f}s, film {s0:.2f}–{s0 + len(x) / 24000:.2f}")
print("\nlevel map (0.5 s steps, dB):")
for row in range(0, len(lv), 120):
    print(f"{t(row):7.2f} " + " ".join(f"{lv[i:i + 10].mean():4.0f}" for i in range(row, min(len(lv), row + 120), 10)))
print("\nsilences (< -45 dB for > 0.4 s):")
i = 0
while i < len(lv):
    if lv[i] < -45:
        j = i
        while j < len(lv) and lv[j] < -45: j += 1
        if j - i >= 8: print(f"  {t(i):7.2f}–{t(j):7.2f}")
        i = j
    else: i += 1
sm = np.convolve(lv, np.ones(5) / 5, "same")
swells = sorted(((sm[i:i + 20].mean(), i) for i in range(10, len(sm) - 20, 2) if sm[i] - sm[i - 10:i].min() > 5), reverse=True)
print("\nswells (loudest sustained arrivals after a rise; film time, 1 s mean dB):")
seen = []
for v, i in swells:
    if all(abs(i - k) > 40 for k in seen): seen.append(i); print(f"  {t(i):7.2f}  {v:5.1f} dB")
    if len(seen) >= 8: break
