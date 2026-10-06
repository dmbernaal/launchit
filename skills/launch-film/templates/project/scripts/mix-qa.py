"""Check a mix before anyone hears it. Finds every place the music falls away (more than 8 dB in ~0.3 s) that is
not on the planned list, prints loudness and true peak, and the music level at named moments.
Usage: python3 scripts/mix-qa.py A [B C] [--at=50.0,62.74,84.6]
Planned silences come from docs/mix.json (mutes, muted rows, tapers) plus "qa_ignore": [[a, b], ...]."""
import json, os, re, subprocess, sys
import numpy as np
FILM = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
M = json.load(open(os.path.join(FILM, "docs/mix.json")))
ats = next((a.split("=")[1] for a in sys.argv[1:] if a.startswith("--at=")), "")
ats = [float(v) for v in ats.split(",") if v]
planned = [tuple(m) for m in M.get("mutes", [])] + [tuple(m) for m in M.get("qa_ignore", [])]
planned += [(r["from_s"] - .3, r["to_s"]) for r in M["rows"] if r["music_gain_db"] <= -60]
planned += [(tp["points"][0][0] - .3, tp.get("silent_until", tp["points"][-1][0])) for tp in M.get("tapers", [])]
for X in [a for a in sys.argv[1:] if not a.startswith("--")] or list(M["variants"]):
    x = np.frombuffer(subprocess.run(["ffmpeg", "-v", "error", "-i", os.path.join(FILM, f"audio/stems/music-{X}.wav"), "-f", "f32le", "-ac", "1", "-ar", "24000", "-"],
                                     capture_output=True, check=True).stdout, dtype=np.float32)
    n = 1200; lv = np.array([20 * np.log10(np.sqrt((x[i:i + n] ** 2).mean()) + 1e-9) for i in range(0, len(x) - n, n)])
    sm = np.convolve(lv, np.ones(3) / 3, "same"); drops = []
    for i in range(6, len(sm) - 8):
        t = i * .05
        if any(a <= t <= b for a, b in planned): continue
        before, after = sm[i - 6:i - 1].mean(), sm[i + 1:i + 7].mean()
        if before - after > 8 and before > -45 and (not drops or t - drops[-1][0] > .5): drops.append((round(t, 2), round(before, 1), round(after, 1)))
    o = subprocess.run(["ffmpeg", "-v", "info", "-i", os.path.join(FILM, f"audio/mix-{X}.wav"), "-af", "ebur128=peak=true", "-f", "null", "-"], capture_output=True, text=True).stderr
    s = o[o.rindex("Summary:"):]
    I, TP = re.search(r"I:\s+(-?[\d.]+)", s).group(1), re.search(r"Peak:\s+(-?[\d.]+)", s).group(1)
    print(f"{X}: I {I} LUFS, true peak {TP} dBFS")
    print("   unplanned drops (t, before dB, after dB):", drops or "none")
    if ats: print("   music at:", " ".join(f"{a}:{lv[int(a / .05)]:.0f}" for a in ats))
