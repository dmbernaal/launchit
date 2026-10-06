"""Build the poster atlas used by source/extras/field.js (a "feed" of thousands of thumbnails).
Usage: python3 scripts/make-atlas.py <folder of images> [assets/library-atlas.jpg]
Takes up to 260 images (jpg/png/webp), centre-crops each to 9:16 at 120×213, and tiles them 20 across × 13 down
(2400×2769). Fewer than 260 images are repeated. Use images you have the right to show (your own product's
content, licensed stock, or generated art); avoid identifiable people without permission."""
import glob, os, subprocess, sys, tempfile
src, out = sys.argv[1], (sys.argv[2] if len(sys.argv) > 2 else "assets/library-atlas.jpg")
files = sorted(f for ext in ("jpg", "jpeg", "png", "webp") for f in glob.glob(os.path.join(src, f"*.{ext}")))
if not files: sys.exit(f"no images in {src}")
with tempfile.TemporaryDirectory() as d:
    for i in range(260):
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", files[i % len(files)], "-vf",
                        "scale=120:213:force_original_aspect_ratio=increase,crop=120:213", "-frames:v", "1", os.path.join(d, f"t{i:03d}.png")], check=True)
    os.makedirs(os.path.dirname(os.path.abspath(out)), exist_ok=True)
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-framerate", "1", "-i", os.path.join(d, "t%03d.png"), "-vf", "tile=20x13", "-frames:v", "1", "-q:v", "3", out], check=True)
print({"atlas": out, "images": len(files)})
