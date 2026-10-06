import { execFileSync, spawnSync } from "node:child_process";
import { config, path } from "./lib.mjs";
// One locked picture, several soundtracks. Muxes audio/mix-<variant>.wav onto the 4K master (video stream copied,
// no re-render) and onto a 1080p copy, then verifies size, fps, duration and loudness of every file.
// Usage: node scripts/export.mjs A B C
const id = config.id, master = path(`renders/${id}-4k.mp4`), small = path(`renders/${id}-1080-video.mp4`);
const ff = args => execFileSync("ffmpeg", ["-v", "error", "-y", ...args], { stdio: "inherit" });
ff(["-i", master, "-an", "-vf", "scale=1920:1080:flags=lanczos", "-c:v", "libx264", "-preset", "slow", "-crf", "16", "-pix_fmt", "yuv420p",
  "-color_primaries", "bt709", "-color_trc", "bt709", "-colorspace", "bt709", small]);
for (const v of process.argv.slice(2)) {
  const mix = path(`audio/mix-${v}.wav`);
  for (const [video, out] of [[master, `renders/${id}-${v}-4k.mp4`], [small, `renders/${id}-${v}.mp4`]]) {
    ff(["-i", video, "-i", mix, "-map", "0:v", "-map", "1:a", "-c:v", "copy", "-c:a", "aac", "-b:a", "320k", "-ar", "48000", "-shortest", "-movflags", "+faststart", path(out)]);
    const probe = JSON.parse(execFileSync("ffprobe", ["-v", "error", "-show_format", "-show_streams", "-of", "json", path(out)], { encoding: "utf8" }));
    const vs = probe.streams.find(s => s.codec_type === "video"), as = probe.streams.find(s => s.codec_type === "audio");
    const sum = spawnSync("ffmpeg", ["-v", "info", "-i", path(out), "-af", "ebur128=peak=true", "-f", "null", "-"], { encoding: "utf8" }).stderr;
    const s = sum.slice(sum.lastIndexOf("Summary:"));
    console.log(JSON.stringify({ out, size: `${vs.width}x${vs.height}`, fps: vs.avg_frame_rate, duration: Number(probe.format.duration).toFixed(2),
      audio: `${as.codec_name} ${as.sample_rate} ${as.channels}ch`, lufs: s.match(/I:\s+(-?[\d.]+) LUFS/)?.[1], truePeak: s.match(/Peak:\s+(-?[\d.]+) dBFS/)?.[1] }));
  }
}
