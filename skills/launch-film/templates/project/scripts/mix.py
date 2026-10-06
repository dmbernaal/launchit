"""Film mix: narration + sound design + an edited score, mastered to -16 LUFS / -2 dBTP.
Usage: python3 scripts/mix.py [variant ...]      (variants are keys of docs/mix.json "variants"; default: all)
Writes audio/mix-<variant>.wav (24-bit, 48 kHz) and stems audio/stems/{voice,sfx,music-<variant>}.wav.

docs/mix.json
{
  "voice_ref": [22.7, 36.5],              window whose voice loudness every music row is set against
  "rows": [{"from_s": 7, "to_s": 14, "music_gain_db": -20, "duck_db": 3}, ...],
        music_gain_db = music loudness relative to her voice (measured, so it holds whatever the take does);
        <= -60 mutes the row. duck_db = extra dip while she speaks (~30 ms attack, ~280 ms release).
  "hard": [55.2, 62.72],                  row edges that switch in 20 ms instead of easing over 150 ms
  "rides": [[[83.6, 0], [84.3, 6], [84.33, 6]], ...],   breakpoint rides in dB, 0 outside each ride
  "mutes": [[84.33, 84.52], [97.6, 105.7]],             silences (5 ms soft edges)
  "tapers": [{"points": [[54.95, 0], [55.22, -12], [58.5, -60]], "silent_until": 62.5}],
        a taper fades the music into a silence instead of cutting it (listeners hear cuts as glitches)
  "riser": {"end": 6.36, "from": 2.3, "gain_db": -15},  optional Shepard-tone rise that cuts dead at "end"
  "impact": {"file": "audio/sfx/impact.mp3", "at": 62.72, "gain_db": -5, "lowpass": 3000},   optional layered hit
  "variants": {
    "A": {"pieces": [
       {"src": "audio/music/plan-C-1/score.mp3", "a": 0, "b": 43.0, "at": 7.0, "fi": 0.08, "fo": 0.06},
       {"src": "...", "a": 32.3, "b": 51.7, "at": 49.6, "xfade": 0.6},       equal-power crossfade into this piece
       {"src": "...", "a": 0.3, "b": 34.8, "at": 62.44, "tempo": 0.916, "fo": 0.3}   pitch-kept re-time (sox)
    ], "rows": {...optional overrides by from_s...}}
  }
}
Pieces are laid in list order; an xfade piece replaces everything already on the bus from its "at" onward.
Piece times: a/b are seconds inside the source file; at is film time. A plan generated for start_s=S has
file time = film time - S, so a piece that keeps the composer's timing uses at = a + S.
"""
import json, os, subprocess, sys, tempfile
import numpy as np
FILM = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
P = lambda *p: os.path.join(FILM, *p)
SR = 48000
T = json.load(open(P("source/timeline.json"))); EV = json.load(open(P("audio/events.json")))
M = json.load(open(P("docs/mix.json")))
N = int(T["duration"] * SR); tt = np.arange(N) / SR
db = lambda g: 10 ** (g / 20)
def decode(path, ch=2):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-f", "f32le", "-ac", str(ch), "-ar", str(SR), "-"], capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype=np.float32).reshape(-1, ch).copy()
def place(bus, clip, at, gain=1.0, fi=.008, fo=.008, until=None):
    clip = clip.copy() * gain; n = len(clip); a, b = int(fi * SR), int(fo * SR)
    if a and n > a: clip[:a] *= np.linspace(0, 1, a)[:, None]
    if until is not None:
        n = max(0, min(n, int((until - at) * SR))); clip = clip[:n]; k = min(int(.012 * SR), n)
        if k: clip[n - k:] *= np.linspace(1, 0, k)[:, None]
    elif b and n > b: clip[n - b:] *= np.linspace(1, 0, b)[:, None]
    s = int(round(at * SR)); e = min(N, s + len(clip))
    if s < 0: clip = clip[-s:]; s = 0
    if e > s: bus[s:e] += clip[: e - s]
def write(path, bus, fmt="pcm_f32le"):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", "2", "-i", "-", "-c:a", fmt, path], input=bus.astype(np.float32).tobytes(), check=True)
    return path
def sox_tempo(x, tau):
    with tempfile.TemporaryDirectory() as d:
        a, b = os.path.join(d, "a.wav"), os.path.join(d, "b.wav")
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", "2", "-i", "-", a], input=x.astype(np.float32).tobytes(), check=True)
        subprocess.run(["sox", a, b, "tempo", "-m", f"{tau:.4f}"], check=True); return decode(b)
# Voice: each segment cut in its own silence (scripts/timeline.mjs), short fades.
src = {k: decode(P(v)) for k, v in T["sources"].items()}
voice = np.zeros((N, 2), np.float32)
for s in T["segments"]:
    place(voice, src[s["src"]][int(s["rawStart"] * SR): int(s["rawEnd"] * SR)], s["filmStart"], db(M.get("voice_gain_db", 0)), .01, .03)
# Sound design: every effect peak-normalized to -1 dBFS, then placed at its event gain.
sfx = np.zeros((N, 2), np.float32); cache = {}
def tap_onsets(x):   # attacks in a recorded typing run (audio/sfx/key.mp3), so every keypress is a different tap
    e = 20 * np.log10(np.sqrt(np.convolve(x.mean(1) ** 2, np.ones(240) / 240, "same")[::240]) + 1e-9)   # 5 ms frames
    return [i * .005 for i in range(6, len(e) - 20) if e[i] - e[i - 6:i].min() > 12 and e[i] == e[i - 2:i + 3].max() and e[i] > -40]
n_key = 0
for ev in EV["sounds"]:
    name = ev["sound"]
    if name not in cache:
        c = decode(P("audio/sfx", f"{name}.mp3")); cache[name] = c / max(1e-6, np.abs(c).max()) * db(-1)
    clip = cache[name]
    if name == "key":   # one tap cut from the typing run
        if "key-onsets" not in cache: cache["key-onsets"] = tap_onsets(clip) or [0.0]
        on = cache["key-onsets"]; o = on[(n_key * 7) % len(on)]; n_key += 1
        clip = clip[int(o * SR): int((o + .085) * SR)]; clip = clip / max(1e-6, np.abs(clip).max()) * db(-1)
    pan = ev.get("pan", 0); clip = clip * np.array([min(1, 1 - pan), min(1, 1 + pan)], np.float32)
    place(sfx, clip, ev["at"], db(ev["gain"]), .002, .03, ev.get("until"))
if M.get("riser"):   # Shepard-Risset rise: tension that never resolves, cut dead
    r = M["riser"]; t = np.arange(int(r["end"] * SR)) / SR; tone = np.zeros_like(t)
    for k in range(7):
        pos = (k + t / 2.4) % 7; w = np.exp(-.5 * ((pos - 3.5) / 1.3) ** 2)
        tone += w * np.sin(2 * np.pi * np.cumsum(55 * 2 ** pos) / SR + k)
    env = np.clip((t - r.get("from", 0)) / max(.1, r["end"] - r.get("from", 0)), 0, 1) ** 2.2
    rise = (tone / 3.5 * env * db(r.get("gain_db", -15))).astype(np.float32); f = int(.006 * SR); rise[-f:] *= np.linspace(1, 0, f)
    sfx[: len(rise)] += np.stack([rise, rise * .96], 1)
if M.get("impact"):
    i = M["impact"]; lp = ["-af", f"lowpass=f={i['lowpass']}"] if i.get("lowpass") else []   # a low-passed hit sits under the voice
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", P(i["file"]), *lp, "-f", "f32le", "-ac", "2", "-ar", str(SR), "-"], capture_output=True, check=True).stdout
    hit = np.frombuffer(raw, dtype=np.float32).reshape(-1, 2).copy(); hit = hit / np.abs(hit).max(); place(sfx, hit, i["at"], db(i.get("gain_db", -5)), .002, .4)
write(P("audio/stems/voice.wav"), voice); write(P("audio/stems/sfx.wav"), sfx)
# Her envelope (0..1), so the music breathes with her phrases instead of pumping.
vm = np.abs(voice.mean(1)); hop = SR // 100
frames = np.array([vm[i:i + hop].max() for i in range(0, N, hop)]); env = np.zeros_like(frames)
for i, v in enumerate(frames):
    target = min(1.0, v / .08); prev = env[i - 1] if i else 0
    env[i] = prev + (target - prev) * (.35 if target > prev else .035)
env_s = np.interp(tt, np.arange(len(env)) * .01 + .005, env)
HARD = set(M.get("hard", []))
def curve(rows, key):
    pts = []
    for r in rows:
        ra = .02 if r["from_s"] in HARD else .15; rb = .02 if r["to_s"] in HARD else .15
        pts += [(r["from_s"] + ra, r[key]), (r["to_s"] - rb, r[key])]
    pts.sort(); return np.interp(tt, [p[0] for p in pts], [p[1] for p in pts])
def bp(pts): return np.interp(tt, [p[0] for p in pts], [p[1] for p in pts], left=0, right=0)
def rms_db(x):
    fr = x[: len(x) // 2400 * 2400].reshape(-1, 2400); r = 20 * np.log10(np.sqrt((fr ** 2).mean(1)) + 1e-9)
    act = r[r > -55]; return float(10 * np.log10(np.mean(10 ** (act / 10)))) if len(act) else None
voice_ref = rms_db(voice.mean(1)[int(M["voice_ref"][0] * SR): int(M["voice_ref"][1] * SR)])
def loud(path, extra=""):
    o = subprocess.run(["ffmpeg", "-v", "info", "-i", path, "-af", f"loudnorm=I=-16:TP=-2:LRA=16{extra}:print_format=json", "-f", "null", "-"], capture_output=True, text=True).stderr
    return json.loads(o[o.rindex("{"): o.rindex("}") + 1])
L = M.get("loudness", {"I": -16, "TP": -2, "LRA": 16})
for X in (sys.argv[1:] or list(M["variants"])):
    V = M["variants"][X]; music = np.zeros((N, 2), np.float32); cache_src = {}
    for pc in V["pieces"]:
        if pc["src"] not in cache_src: cache_src[pc["src"]] = decode(P(pc["src"]))
        x = cache_src[pc["src"]][int(pc["a"] * SR): int(pc["b"] * SR)]
        if pc.get("tempo"): x = sox_tempo(x, pc["tempo"])
        xf = pc.get("xfade")
        if xf:   # equal-power: fade what is already on the bus out over [at, at+xf], this piece in
            s, n = int(pc["at"] * SR), int(xf * SR); ph = np.linspace(0, np.pi / 2, n)[:, None]
            music[s:s + n] *= np.cos(ph).astype(np.float32); music[s + n:] = 0; x = x.copy(); x[:n] *= np.sin(ph).astype(np.float32)
            place(music, x, pc["at"], db(pc.get("gain_db", 0)), 0, pc.get("fo", .08))
        else:
            place(music, x, pc["at"], db(pc.get("gain_db", 0)), pc.get("fi", .08), pc.get("fo", .08))
    rows = [{**r, **V.get("rows", {}).get(str(r["from_s"]), {})} for r in M["rows"]]
    mutes = np.zeros(N, bool)
    for a, b in M.get("mutes", []) + [[r["from_s"], r["to_s"]] for r in rows if r["music_gain_db"] <= -60]: mutes |= (tt >= a) & (tt < b)
    taper = np.zeros(N)
    for tp in M.get("tapers", []):
        pts = tp["points"]; seg = (tt >= pts[0][0]) & (tt < pts[-1][0])
        taper[seg] += np.interp(tt[seg], [p[0] for p in pts], [p[1] for p in pts]); mutes |= (tt >= pts[-1][0]) & (tt < tp.get("silent_until", pts[-1][0]))
    rides = sum((bp(r) for r in M.get("rides", [])), np.zeros(N)) + sum((bp(r) for r in V.get("rides", [])), np.zeros(N))
    # Per-row level matching: measure what this take actually does in each row, set the gain to hit the target.
    mm = music.mean(1); pts = []
    for r in rows:
        if r["music_gain_db"] <= -60: continue
        lvl = rms_db(mm[int(r["from_s"] * SR): int(r["to_s"] * SR)])
        if lvl is None: continue
        g = float(np.clip(voice_ref + r["music_gain_db"] - lvl, -30, 12))
        ra = .02 if r["from_s"] in HARD else .15; rb = .02 if r["to_s"] in HARD else .15
        pts += [(r["from_s"] + ra, g), (r["to_s"] - rb, g)]
    pts.sort(); match = np.interp(tt, [p[0] for p in pts], [p[1] for p in pts])
    total = match + rides + taper - np.abs(curve(rows, "duck_db")) * env_s
    k = int(.005 * SR); m = (~mutes).astype(np.float64); c = np.cumsum(np.concatenate([[0], m]))
    soft = (c[k:] - c[:-k]) / k; soft = np.concatenate([soft, np.full(N - len(soft), soft[-1])])
    music *= (10 ** (total / 20) * soft).astype(np.float32)[:, None]
    mp = write(P(f"audio/stems/music-{X}.wav"), music)
    pre = P(f"audio/stems/premaster-{X}.wav")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", P("audio/stems/voice.wav"), "-i", mp, "-i", P("audio/stems/sfx.wav"), "-filter_complex",
                    "[0:a][1:a][2:a]amix=inputs=3:normalize=0:duration=first[mix]", "-map", "[mix]", "-c:a", "pcm_f32le", pre], check=True)
    j = loud(pre)
    ln = (f"loudnorm=I={L['I']}:TP={L['TP']}:LRA={L['LRA']}:measured_I={j['input_i']}:measured_TP={j['input_tp']}:measured_LRA={j['input_lra']}"
          f":measured_thresh={j['input_thresh']}:offset={j['target_offset']}:linear=true")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", pre, "-af", ln + ",aresample=48000", "-c:a", "pcm_s24le", P(f"audio/mix-{X}.wav")], check=True)
    print(json.dumps({"variant": X, "voice_ref_db": round(voice_ref, 1), "premaster_I": j["input_i"], "LRA": j["input_lra"]}))
