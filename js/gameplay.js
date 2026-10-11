/* Gameplay feedback from the Oct 10, 2026 match (Trios · Online friends · 12 kills · #1 of 17).
   Ret played and flagged the first issues; Opus 5.5 reviewed the 12:36 recording frame by frame as a playtester. */
window.GAMEPLAY = {
  meta: {
    title: "Gameplay feedback",
    by: "Ret and Opus 5.5",
    byNote: "Ret played the match and called out damage, flinch and damage direction. Opus 5.5 acted as a playtester and reviewed the 12:36 gameplay recording frame by frame. Timestamps refer to that recording. Menu and HUD layout are covered by the redesign above, so this section is only about how the game plays.",
    match: "Trios · Online friends · 12 kills · 1,061 damage · #1 of 17 squads · 12:29 in match"
  },
  groups: [
    {
      id: "combat", title: "Combat and time to kill", items: [
        {
          pri: "High", who: "Ret + Opus 5.5", title: "Guns kill too fast",
          what: "Fights end before either player can react. At 1:40.5–1:41.5 Sable goes down in about one second from 8 Peeler rounds (26 per hit on the marker). At 11:01.5–11:08 Ret drops from 100 health and 56 shield to 7 health in roughly six seconds, most of it while still trying to find the shooter. Stacked hit numbers of 107–165 on single targets (10:52, 11:08, 11:48) show how much lands in one burst.",
          fix: "Aim for 1.2–1.8 seconds to take a full 100 health + 100 shield player down with an assault rifle at close range, longer at distance. Cut body damage 20–30%, add range falloff after about 25 m, and keep headshots at around 1.5x so aim is still rewarded. Re-test with the same squads and compare kill counts and match length.",
          time: "1:41 · 10:52 · 11:01–11:08", img: "ttk-1s"
        },
        {
          pri: "High", who: "Ret", title: "Getting shot should cause flinch",
          what: "When Ret takes fire, the sights stay perfectly still (11:04–11:05, shield draining from 39 to 21 while aim does not move). The player who shoots first has no advantage in accuracy, so trades are decided by raw damage output, which makes the fast time to kill feel worse.",
          fix: "Add aim punch on hit: a small upward and random sideways kick scaled by damage, halved while aiming down sights and capped so it never throws aim fully off target. Recover within about 150 ms. Keep it as gameplay, but let Reduced camera motion soften the visual shake.",
          time: "11:04–11:05", img: "low-health-no-direction", demo: true
        },
        {
          pri: "High", who: "Ret", title: "Show where damage is coming from",
          what: "Nothing on screen says which way the shots come from. At 7:20–7:21 shield drops from 93 to 69 with no cue, and at 11:01–11:05 Ret turns several times before finding the shooter. The only feedback is the bars shrinking in the corner.",
          fix: "Add a red arc around the crosshair pointing at the shooter, plus a red glow on that screen edge, both scaled by damage. Keep all damage feedback red, whether the hit lands on shield or health. Reserve blue for a glow around the screen edges while the player is healing. Add a slow red vignette under 30 health. Pair it with a directional hit sound.",
          time: "7:20 · 11:01–11:05", img: "133-damage", demo: true
        },
        {
          pri: "Medium", who: "Opus 5.5", title: "Iron sights cover the target",
          what: "Aiming down sights, the large front post and rear ring hide a gorilla at medium range (1:40–1:41, 9:16, 11:48). At 1:41 the target is almost entirely behind the post.",
          fix: "Thin the rear ring, shorten the front post, or give rifles a simple dot or hollow sight. Test at 30–50 m against the darker character skins.",
          time: "1:40 · 9:16 · 11:48", img: "ttk-1s"
        },
        {
          pri: "Medium", who: "Opus 5.5", title: "Healing leaves you blind and exposed",
          what: "Using the golden banana fills a large part of the screen with the item (7:24–7:28), and Ret goes from 98 health to 26 during it. The Leaf Bundle heal at 11:10–11:20 is also long while in the open.",
          fix: "Shorten heal animations, lower the held item so the centre stays clear, allow slow walking, and let fire or jump cancel the heal and refund the item.",
          time: "7:24–7:28 · 11:10–11:20", img: "shot-while-healing"
        },
        {
          pri: "Medium", who: "Ret + Opus 5.5", title: "Make shield hits and shield breaks obvious",
          what: "Damage numbers, the kill banner and the medals (Wrecked, Double kill at 9:20) read well and feel rewarding. The game already separates shield and health hits on enemies, but the difference is too subtle to notice mid-fight, so players can't tell when an enemy's shield is gone and it's time to push.",
          fix: "Show a small shield icon next to the damage number while hits land on shield, and a cracked shield icon with a distinct crack sound at the moment the shield breaks. After the break, damage numbers return to plain white for health.",
          time: "9:20", img: "medals"
        }
      ]
    },
    {
      id: "visibility", title: "Crosshair and visibility", items: [
        {
          pri: "Medium", who: "Opus 5.5", title: "The hip-fire crosshair disappears",
          what: "The thin white plus is hard to see against bright sky, sand and foliage (1:52, 8:44, 12:04). In the jungle it blends into leaves.",
          fix: "Give the crosshair a 1 px dark outline, offer colour options, and let the arms spread with movement and firing so players can read accuracy.",
          time: "1:52 · 8:44 · 12:04", img: "crosshair-foliage"
        },
        {
          pri: "Medium", who: "Opus 5.5", title: "Temple interiors are too dark to fight in",
          what: "Inside Banana Temple (0:44–1:32) walls, floors and characters are all similar dark browns. Teammates are only visible through their name tags.",
          fix: "Raise ambient light indoors and add a subtle rim light to characters so silhouettes read against stone.",
          time: "0:44–1:32", img: "dark-temple"
        },
        {
          pri: "Low", who: "Opus 5.5", title: "Helicopter renders solid black",
          what: "The parked helicopter near Banana Temple shows as a flat black shape with no shading (1:36–1:56). It looks like a missing material or lighting bake.",
          fix: "Check its material and lightmap, and add it to a visual pass of all vehicles.",
          time: "1:36–1:56", img: "black-helicopter"
        }
      ]
    },
    {
      id: "collision", title: "Collision and camera clipping", items: [
        {
          pri: "High", who: "Opus 5.5", title: "Plantation plants and fruit bags block the whole view",
          what: "At The Plantation, banana leaves and the blue fruit bags have no collision, so the camera passes through them and the screen fills with leaf or blue plastic (5:04–8:04). A player standing inside a plant is fully hidden but can still see and shoot out.",
          fix: "Either give the bags and trunks collision, or fade leaves near the camera and make them semi-transparent from inside. Make sure concealment works the same both ways.",
          time: "5:04–8:04", img: "foliage-occlusion"
        },
        {
          pri: "Medium", who: "Opus 5.5", title: "Camera clips into rocks and cliffs",
          what: "Moving along the rocky slope (4:36–4:44) the camera ends up inside the rock mesh and the screen shows only rock texture.",
          fix: "Increase the camera collision radius or near clip distance, and check the collision mesh on that cliff matches the visual mesh.",
          time: "4:36–4:44", img: "camera-in-rock"
        },
        {
          pri: "Medium", who: "Opus 5.5", title: "Players clip into boulders",
          what: "Teammates stand partly inside boulders (10:04, 10:20). Players hiding in rocks can also be hard to hit if hit boxes stay outside the mesh.",
          fix: "Check boulder collision against the character capsule and make sure players cannot end up inside rock.",
          time: "10:04 · 10:20", img: "teammate-in-rock"
        },
        {
          pri: "Medium", who: "Opus 5.5", title: "Riding the tuk-tuk, you can barely see",
          what: "From the tuk-tuk seats the dashboard, canopy and other players' models fill most of the view (2:12–4:16). At 3:20 a teammate's model clips through the seat and canopy.",
          fix: "Raise the passenger camera, hide or fade the canopy and dashboard in first person, and snap seated characters to their seats.",
          time: "2:12–4:16 · 3:20", img: "tuktuk-view"
        }
      ]
    },
    {
      id: "flow", title: "Match flow", items: [
        {
          pri: "Low", who: "Opus 5.5", title: "The players-left count goes up",
          what: "Early on the alive count rises (42 at 1:00, 44 at 1:04, 45 at 1:20) because of Resurgence respawns. Without context it looks like a bug. Later the HUD correctly says Resurgence is off and kills are final.",
          fix: "Show a short +1 respawned note next to the count while Resurgence is on, and announce clearly when Resurgence ends.",
          time: "1:00–1:20", img: "alive-count"
        },
        {
          pri: "Low", who: "Opus 5.5", title: "What worked well",
          what: "Landing at Banana Temple was quick, the tuk-tuk is a fun way to rotate, storm phases are announced clearly, kill banners and medals feel great, and the final circle at Lookout Point built real tension.",
          fix: "Keep these. When retuning damage, check that the endgame still lasts long enough to feel tense.",
          time: "Throughout", img: "medals"
        }
      ]
    }
  ]
};

/* Opus 5.5's own write-up: how the review was done, the verdict, and what to do next. */
window.GAMEPLAY.opus = {
  method: [
    ["189", "frames sampled, one every 4 seconds across the 12:36 recording"],
    ["3", "fights stepped through at 2 frames a second (1:36, 7:16, 10:48)"],
    ["15", "findings, each tied to a timestamp and a frame"],
    ["11", "raised by Opus 5.5 alone; 2 by Ret and 2 together"]
  ],
  verdict: "Kong Royale already has the hard parts of a battle royale working: a readable island, fast rotations, clear storm pacing and kills that feel rewarding. What holds it back is how fights resolve. Players die before they can tell where they are being shot from, and nothing slows the player who is losing a fight. Fixing time to kill, flinch and damage direction together will change the game more than any other single pass.",
  strengths: [
    "The island reads well from the plane, and Banana Temple, The Plantation and Lookout Point each feel distinct.",
    "Kill banners, damage numbers and medals (Wrecked, Double kill) are clear and satisfying.",
    "Storm phase banners and the Resurgence off notice are easy to follow.",
    "The tuk-tuk makes rotating with a squad fun and fast.",
    "The final circle at Lookout Point was tense and well paced."
  ],
  risks: [
    "Time to kill around one second makes fights feel random to newer players.",
    "No damage direction or flinch means the player being shot has no way to react.",
    "Foliage and fruit bags at The Plantation give one-sided concealment."
  ],
  order: [
    ["Damage feedback", "Add the directional arc, edge glow and flinch. They are cheap and make every other combat change easier to judge. A working demo is in the firing range (press K)."],
    ["Time to kill", "Cut body damage 20–30% and add range falloff, then replay the same squads and compare."],
    ["Collision pass", "Plantation plants and bags, the rock cliffs near Banana Split, boulders and the tuk-tuk camera."],
    ["Readability", "Crosshair outline, sight pictures, temple lighting and the helicopter material."]
  ],
  next: [
    "Record two matches before and two after the damage change, with the same squads.",
    "Track average time to kill, kills per match and how often the player who shot first wins the fight.",
    "Ask each player the same three questions: did you know where shots came from, did fights feel fair, and did you ever lose sight of the action.",
    "Add the in-game ratings from the new results screen so smoothness, hit registration and fun are logged per match."
  ]
};
