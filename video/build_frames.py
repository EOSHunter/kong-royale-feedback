"""Render the video's design-system cards and prototype stills with headless Chrome."""
import json, os, subprocess, urllib.parse, shutil
from PIL import Image

CH = r"C:/Program Files/Google/Chrome/Application/chrome.exe"
HERE = os.path.dirname(os.path.abspath(__file__)).replace("\\", "/")
DS = os.environ.get("DS", "premium")
TOON = DS != "premium"   # any non-Premium version uses prototype captures for the HUD stills
FR = "frames" if DS == "premium" else "frames_" + DS
OUT = HERE + "/" + FR
AFTER = {"premium": "after"}.get(DS, DS)
QS = "" if DS == "premium" else f"ds={DS}&"
NAME = {"premium": "redesign", "toon": "Toon", "hybrid": "Hybrid", "wire": "wireframes"}[DS]
PROF = HERE + "/_chprof"
BASE = "http://127.0.0.1:8765"
os.makedirs(OUT, exist_ok=True)

def shoot(url, name, clear=False, h=1080, wait=5000, vtb=None):
    shutil.rmtree(PROF, ignore_errors=True)
    args = [CH, "--headless=new", "--disable-gpu", "--hide-scrollbars", f"--user-data-dir={PROF}",
            f"--window-size=1920,{h}", (f"--virtual-time-budget={vtb}" if vtb else f"--timeout={wait}"), f"--screenshot={OUT}/{name}.png", url]
    if clear: args.insert(4, "--default-background-color=00000000")
    subprocess.run(args, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    return f"{OUT}/{name}.png"

def card(t, name, clear=False, **d):
    if clear: d["clear"] = 1
    q = urllib.parse.urlencode({"t": t, "ds": DS, "d": urllib.parse.quote(json.dumps(d))})
    return shoot(f"{BASE}/video/card.html?{q}", name, clear=clear)

def proto(key, name, extra=""):
    p = shoot(f"{BASE}/?{QS}still{extra}#play-{key}", name, h=1129, wait=6000, vtb=4000 if extra else None)
    Image.open(p).convert("RGB").crop((0, 50, 1920, 1129)).resize((1920, 1080), Image.LANCZOS).save(p)

screens = [("12-lobby", "Main lobby", "Artwork leads. One clear Play action, callsign as identity."),
           ("01-settings-mouse", "Settings", "One shell for every category. Continuous rows, contextual help."),
           ("07-pause-menu", "Match menu", "Says Menu and Match continues. Resume first, Leave match set apart."),
           ("09-inventory", "Inventory", "Five calm slots. Selected, equipped and rarity read separately."),
           ("10-gameplay-hud", "Gameplay HUD", "Edge-anchored HUD, match stats chips and red damage feedback."),
           ("11-world-map", "World map", "Quiet cartography, a bounded legend and keycap marker actions."),
           ("13-loading", "Loading", "Art carries the screen. Honest phases, one rotating tip."),
           ("14-match-results", "Match results", "Outcome first, then the stats row and one way back to the lobby.")]

if __name__ == "__main__":
    card("title", "00_title", bg=("" if DS == "wire" else "../img/art/lobby.jpg"), eb="Playtest feedback · October 10, 2026",
         h="Kong Royale<br>" + NAME, p="Fourteen screens, a playable prototype and a gameplay review from Ret and Opus 5.5.")
    card("section", "01_sec_redesign", eb="01 · The redesign", h=("14 screens,<br>wireframed" if DS == "wire" else "14 screens,<br>one system"),
         p={"premium": "Every screen from the playtest rebuilt on the Kong Royale design system: charcoal, bone and a little saffron.", "toon": "Every screen rebuilt in the Toon system: the original Kong Royale navy and banana yellow, with chunky outlines and bouncy buttons.", "hybrid": "Toon colours and chunky controls, with Premium's open rows and typography: fewer containers, same personality.", "wire": "Every screen as a grayscale wireframe: layouts, controls and flows only, with placeholders for art, ready for a designer to style."}[DS],
         chips={"premium": ["Changa One", "Barlow", "Saffron #EABC39", "Charcoal #101719"], "toon": ["Lilita One", "Nunito", "Banana #FFD21A", "Navy #071422"], "hybrid": ["Lilita One", "Nunito", "Open rows", "Chunky controls"], "wire": ["Layouts", "Placeholders", "Grayscale", "1920×1080"]}[DS])
    for i, (f, title, note) in enumerate(screens):
        card("shot", f"02_{i:02d}a", img=f"../img/before/{f}.jpg", contain=True, eb=f"Before · Screen {f[:2]}", h=title)
        card("shot", f"02_{i:02d}b", img=f"../img/{AFTER}/{f}.jpg", eb=f"After · Screen {f[:2]}", h=title, note=note, y=True)
    card("section", "03_sec_proto", eb="02 · Playable prototype", h="Play the<br>screens",
         p="All 14 screens as a working UI. Settings change the firing range, and keycaps follow your bindings.",
         chips=["Lobby", "Loading", "Range", "Menu", "Settings", "Inventory", "Map", "Results"])
    for i, (k, lab) in enumerate([("lobby", "Lobby"), ("settings.video", "Settings · Video"), ("inventory", "Inventory" if DS == "wire" else "Inventory · rarity tints"),
                                  ("map", "World map"), ("learn", "Learn controls"), ("hud.match", "Match HUD · squad stats"), ("results", "Match results")]):
        proto(k, f"04_{i:02d}_raw")
        card("shot", f"04_{i:02d}", img=f"{FR}/04_{i:02d}_raw.png", eb="Playable prototype", h=lab, y=True)
    card("section", "05_sec_review", eb="03 · Gameplay review", h="How it<br>plays",
         p="Ret played the match. Opus 5.5 reviewed the 12:36 recording frame by frame as a playtester. 15 findings.",
         chips=["Time to kill", "Flinch", "Damage direction", "Collision", "Shield feedback"])
    findings = [("High", "1:40", "Guns kill too fast", "Sable drops in about one second. Aim for 1.2–1.8 s to kill a full player, with range falloff."),
                ("High", "11:01", "Show where damage comes from", "Shield 56 to 0 and health to 42 while still finding the shooter. Add a red arc, edge glow and flinch."),
                ("High", "5:50", "Plantation plants block the view", "Leaves and fruit bags have no collision, so the camera fills with them. One-sided concealment."),
                ("Medium", "9:20", "Make shield breaks obvious", "Shield icon on shield hits, a cracked shield and crack sound when it breaks.")]
    for i, (pri, t, h, n) in enumerate(findings):
        card("finding", f"06_{i:02d}", clear=True, pri=pri, by="Ret + Opus 5.5", time=t, h=h, note=n,
             pc="" if pri == "High" else "background:rgba(255,193,110,.16);color:#FFC16E")
    card("section", "07_sec_feedback", eb="04 · New feedback", h=("Feedback<br>placement" if DS == "wire" else "Red means<br>damage"),
         p=("Where damage and healing feedback sit: an arc around the crosshair, edge glows and hit numbers. Shipped versions use red for damage and blue for healing." if DS == "wire" else "Damage is always red: an arc to the shooter, an edge glow and flinch. Blue only ever means healing."))
    (proto("hud", "08_00_raw", "&fx=dmg") if TOON else None)
    card("shot", "08_00", img=f"{FR}/08_00_raw.png" if TOON else "../img/after/10-gameplay-hud.jpg", eb="HUD concept · taking damage", h="Arc, edge glow, shield icons", y=True)
    (proto("hud", "08_01_raw", "&fx=heal") if TOON else None)
    card("shot", "08_01", img=f"{FR}/08_01_raw.png" if TOON else "../img/after/10-gameplay-hud-healing.jpg", eb="HUD concept · healing", h="Blue edges while health refills", y=True)
    card("section", "09_sec_ds", eb="05 · Design system", h="Built to<br>hand off",
         p="Tokens, components, rules and staged prompts. Downloadable as Markdown, with logos in SVG and PNG.",
         chips=["Design system .md", "Logos SVG + PNG", "Implementation prompts"])
    shoot(f"{BASE}/?{QS}still#design-system", "10_ds_raw", wait=6000)
    card("shot", "10_00", img=f"{FR}/10_ds_raw.png")
    card("end", "11_end")
    print(len(os.listdir(OUT)), "files")
