"""Capture the Toon prototype screens used as the 'after' images when Toon is selected."""
import os, subprocess, shutil
from PIL import Image
CH = r"C:/Program Files/Google/Chrome/Application/chrome.exe"
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
VAR = os.environ.get("DS", "toon")
OUT = os.path.join(ROOT, "img", VAR); os.makedirs(OUT, exist_ok=True)
PROF = os.path.join(ROOT, "video", "_t", "p")
SHOTS = {"01-settings-mouse": "settings.mk", "02-settings-controller": "settings.ctrl", "03-settings-audio": "settings.audio",
         "04-settings-video": "settings.video", "05-settings-accessibility": "settings.a11y", "06-learn-controls": "learn",
         "07-pause-menu": "menu", "08-report-problem": "report", "09-inventory": "inventory", "10-gameplay-hud": "hud",
         "11-world-map": "map", "12-lobby": "lobby", "13-loading": "loading", "14-match-results": "results"}
import sys
ONLY = sys.argv[1:]
for f, key in SHOTS.items():
    if ONLY and f not in ONLY: continue
    shutil.rmtree(PROF, ignore_errors=True); tmp = os.path.join(OUT, f + ".png")
    wait = "2200" if key == "loading" else "6000"
    subprocess.run([CH, "--headless=new", "--disable-gpu", "--hide-scrollbars", f"--user-data-dir={PROF}", "--window-size=1920,1129",
                    f"--timeout={wait}", f"--screenshot={tmp}", f"http://127.0.0.1:8765/?ds={VAR}&still#play-{key}"],
                   stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    im = Image.open(tmp).convert("RGB").crop((0, 50, 1920, 1129)).resize((1600, 900), Image.LANCZOS)
    im.save(os.path.join(OUT, f + ".jpg"), quality=82, optimize=True, progressive=True); os.remove(tmp)
    print(f)
