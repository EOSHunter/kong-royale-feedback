"""Build segment clips, then join them with crossfades and lay the music under it."""
import os, subprocess
HERE = os.path.dirname(os.path.abspath(__file__))
F = os.path.join(HERE, "frames"); S = os.path.join(HERE, "seg"); os.makedirs(S, exist_ok=True)
REC = r"C:/Users/hunte/Downloads/Screen Recording_20261010212646_zippy_ret_Untitled_Medal.mp4"
MUSIC = r"C:/Users/hunte/Downloads/Gorilla_Jungle_Rumble_2026-10-11T041023.mp4"
OUT = os.path.join(HERE, "kong-royale-feedback-showcase.mp4")
FPS = 30

def run(args):
    r = subprocess.run(["ffmpeg", "-v", "error", "-y"] + args)
    if r.returncode: raise SystemExit("ffmpeg failed: " + " ".join(args[-1:]))

def still(name, dur, zoom=0.04):
    """Slow push-in rendered with sub-pixel affine resampling (ffmpeg zoompan steps in whole pixels and jitters)."""
    from PIL import Image
    out = os.path.join(S, name + ".mp4"); n = int(round(dur * FPS))
    src = Image.open(os.path.join(F, name + ".png")).convert("RGB")
    if src.size != (1920, 1080): src = src.resize((1920, 1080), Image.LANCZOS)
    p = subprocess.Popen(["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", "1920x1080", "-r", str(FPS),
                          "-i", "-", "-c:v", "libx264", "-preset", "medium", "-crf", "18", "-pix_fmt", "yuv420p", out], stdin=subprocess.PIPE)
    for f in range(n):
        t = f / max(1, n - 1); e = t * t * (3 - 2 * t) * 0.35 + t * 0.65  # gentle ease
        z = 1 + zoom * e
        sc = 1 / z
        frame = src.transform((1920, 1080), Image.AFFINE, (sc, 0, 960 - 960 * sc, 0, sc, 540 - 540 * sc), resample=Image.BICUBIC)
        p.stdin.write(frame.tobytes())
    p.stdin.close(); p.wait()
    return out

def clip(name, start, dur, overlay):
    out = os.path.join(S, name + ".mp4")
    run(["-ss", str(start), "-t", str(dur), "-i", REC, "-i", os.path.join(F, overlay + ".png"),
         "-filter_complex", f"[0:v]scale=1920:1080,fps={FPS},eq=saturation=0.95[v];[v][1:v]overlay=0:0,format=yuv420p",
         "-an", "-c:v", "libx264", "-preset", "medium", "-crf", "18", out])
    return out

segs = []  # (path, duration, transition_into_next)
def add(path, dur, tr="fade"): segs.append([path, dur, tr])

add(still("00_title", 4.6, 0.05), 4.6)
add(still("01_sec_redesign", 3.0, 0.02), 3.0)
for i in range(8):
    add(still(f"02_{i:02d}a", 2.2, 0.02), 2.2, "wipeleft")
    add(still(f"02_{i:02d}b", 3.2, 0.04), 3.2)
add(still("03_sec_proto", 3.0, 0.02), 3.0)
for i in range(7): add(still(f"04_{i:02d}", 2.4, 0.03), 2.4)
add(still("05_sec_review", 3.2, 0.02), 3.2)
for i, (st, d) in enumerate([(98.0, 4.6), (660.5, 5.0), (348.0, 4.6), (557.5, 4.6)]):
    add(clip(f"06_{i:02d}", st, d, f"06_{i:02d}"), d)
add(still("07_sec_feedback", 3.0, 0.02), 3.0)
add(still("08_00", 3.2, 0.04), 3.2)
add(still("08_01", 3.2, 0.04), 3.2)
add(still("09_sec_ds", 3.0, 0.02), 3.0)
add(still("10_00", 3.4, 0.05), 3.4)
add(still("11_end", 5.5, 0.03), 5.5)

T = 0.5
inputs, fc, prev, offset = [], [], "[0:v]", 0.0
for p, _, _ in segs: inputs += ["-i", p]
for k in range(1, len(segs)):
    offset += segs[k - 1][1] - T
    tr = segs[k - 1][2]
    d = 0.8 if tr == "wipeleft" else T
    if tr == "wipeleft": offset += T - d  # keep timing aligned for the longer wipe
    lab = f"[v{k}]"
    fc.append(f"{prev}[{k}:v]xfade=transition={tr}:duration={d}:offset={offset:.3f}{lab}")
    prev = lab
total = offset + segs[-1][1]
fc.append(f"[{len(segs)}:a]atrim=0:{total:.3f},afade=t=in:st=0:d=0.8,afade=t=out:st={total - 3.5:.3f}:d=3.5,volume=0.9[a]")
run(inputs + ["-i", MUSIC, "-filter_complex", ";".join(fc), "-map", prev, "-map", "[a]",
              "-c:v", "libx264", "-preset", "slow", "-crf", "19", "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "192k",
              "-movflags", "+faststart", OUT])
print(f"done {total:.1f}s -> {OUT}")
