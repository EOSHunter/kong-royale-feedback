# Kong Royale gameplay feedback: playtest, October 10, 2026

**From:** Ret and Opus 5.5

Ret played the match and called out damage, flinch and damage direction. Opus 5.5 acted as a playtester and reviewed the 12:36 gameplay recording frame by frame. Timestamps refer to that recording. Menu and HUD layout are covered by the redesign above, so this section is only about how the game plays.

**Match:** Trios · Online friends · 12 kills · 1,061 damage · #1 of 17 squads · 12:29 in match

Recording: https://drive.google.com/drive/folders/1LZDH-K8rVLhZFXK-hI5XCqMCnL3icMqc?usp=sharing

## Combat and time to kill

### Guns kill too fast

**Priority:** High · **From:** Ret + Opus 5.5 · **When:** 1:41 · 10:52 · 11:01–11:08

**What we saw:** Fights end before either player can react. At 1:40.5–1:41.5 Sable goes down in about one second from 8 Peeler rounds (26 per hit on the marker). At 11:01.5–11:08 Ret drops from 100 health and 56 shield to 7 health in roughly six seconds, most of it while still trying to find the shooter. Stacked hit numbers of 107–165 on single targets (10:52, 11:08, 11:48) show how much lands in one burst.

**Suggestion:** Aim for 1.2–1.8 seconds to take a full 100 health + 100 shield player down with an assault rifle at close range, longer at distance. Cut body damage 20–30%, add range falloff after about 25 m, and keep headshots at around 1.5x so aim is still rewarded. Re-test with the same squads and compare kill counts and match length.

### Getting shot should cause flinch

**Priority:** High · **From:** Ret · **When:** 11:04–11:05

**What we saw:** When Ret takes fire, the sights stay perfectly still (11:04–11:05, shield draining from 39 to 21 while aim does not move). The player who shoots first has no advantage in accuracy, so trades are decided by raw damage output, which makes the fast time to kill feel worse.

**Suggestion:** Add aim punch on hit: a small upward and random sideways kick scaled by damage, halved while aiming down sights and capped so it never throws aim fully off target. Recover within about 150 ms. Keep it as gameplay, but let Reduced camera motion soften the visual shake.

### Show where damage is coming from

**Priority:** High · **From:** Ret · **When:** 7:20 · 11:01–11:05

**What we saw:** Nothing on screen says which way the shots come from. At 7:20–7:21 shield drops from 93 to 69 with no cue, and at 11:01–11:05 Ret turns several times before finding the shooter. The only feedback is the bars shrinking in the corner.

**Suggestion:** Add a red arc around the crosshair pointing at the shooter, plus a red glow on that screen edge, both scaled by damage. Keep all damage feedback red, whether the hit lands on shield or health. Reserve blue for a glow around the screen edges while the player is healing. Add a slow red vignette under 30 health. Pair it with a directional hit sound.

### Iron sights cover the target

**Priority:** Medium · **From:** Opus 5.5 · **When:** 1:40 · 9:16 · 11:48

**What we saw:** Aiming down sights, the large front post and rear ring hide a gorilla at medium range (1:40–1:41, 9:16, 11:48). At 1:41 the target is almost entirely behind the post.

**Suggestion:** Thin the rear ring, shorten the front post, or give rifles a simple dot or hollow sight. Test at 30–50 m against the darker character skins.

### Healing leaves you blind and exposed

**Priority:** Medium · **From:** Opus 5.5 · **When:** 7:24–7:28 · 11:10–11:20

**What we saw:** Using the golden banana fills a large part of the screen with the item (7:24–7:28), and Ret goes from 98 health to 26 during it. The Leaf Bundle heal at 11:10–11:20 is also long while in the open.

**Suggestion:** Shorten heal animations, lower the held item so the centre stays clear, allow slow walking, and let fire or jump cancel the heal and refund the item.

### Hit feedback is good; split shield and health hits

**Priority:** Low · **From:** Opus 5.5 · **When:** 9:20

**What we saw:** Damage numbers, the kill banner and the medals (Wrecked, Double kill at 9:20) read well and feel rewarding. Shield and health hits on enemies look the same, though.

**Suggestion:** Show a short shield-break icon and sound when an enemy's shield is gone, and colour damage numbers cyan for shield and white for health.

## Crosshair and visibility

### The hip-fire crosshair disappears

**Priority:** Medium · **From:** Opus 5.5 · **When:** 1:52 · 8:44 · 12:04

**What we saw:** The thin white plus is hard to see against bright sky, sand and foliage (1:52, 8:44, 12:04). In the jungle it blends into leaves.

**Suggestion:** Give the crosshair a 1 px dark outline, offer colour options, and let the arms spread with movement and firing so players can read accuracy.

### Temple interiors are too dark to fight in

**Priority:** Medium · **From:** Opus 5.5 · **When:** 0:44–1:32

**What we saw:** Inside Banana Temple (0:44–1:32) walls, floors and characters are all similar dark browns. Teammates are only visible through their name tags.

**Suggestion:** Raise ambient light indoors and add a subtle rim light to characters so silhouettes read against stone.

### Helicopter renders solid black

**Priority:** Low · **From:** Opus 5.5 · **When:** 1:36–1:56

**What we saw:** The parked helicopter near Banana Temple shows as a flat black shape with no shading (1:36–1:56). It looks like a missing material or lighting bake.

**Suggestion:** Check its material and lightmap, and add it to a visual pass of all vehicles.

## Collision and camera clipping

### Plantation plants and fruit bags block the whole view

**Priority:** High · **From:** Opus 5.5 · **When:** 5:04–8:04

**What we saw:** At The Plantation, banana leaves and the blue fruit bags have no collision, so the camera passes through them and the screen fills with leaf or blue plastic (5:04–8:04). A player standing inside a plant is fully hidden but can still see and shoot out.

**Suggestion:** Either give the bags and trunks collision, or fade leaves near the camera and make them semi-transparent from inside. Make sure concealment works the same both ways.

### Camera clips into rocks and cliffs

**Priority:** Medium · **From:** Opus 5.5 · **When:** 4:36–4:44

**What we saw:** Moving along the rocky slope (4:36–4:44) the camera ends up inside the rock mesh and the screen shows only rock texture.

**Suggestion:** Increase the camera collision radius or near clip distance, and check the collision mesh on that cliff matches the visual mesh.

### Players clip into boulders

**Priority:** Medium · **From:** Opus 5.5 · **When:** 10:04 · 10:20

**What we saw:** Teammates stand partly inside boulders (10:04, 10:20). Players hiding in rocks can also be hard to hit if hit boxes stay outside the mesh.

**Suggestion:** Check boulder collision against the character capsule and make sure players cannot end up inside rock.

### Riding the tuk-tuk, you can barely see

**Priority:** Medium · **From:** Opus 5.5 · **When:** 2:12–4:16 · 3:20

**What we saw:** From the tuk-tuk seats the dashboard, canopy and other players' models fill most of the view (2:12–4:16). At 3:20 a teammate's model clips through the seat and canopy.

**Suggestion:** Raise the passenger camera, hide or fade the canopy and dashboard in first person, and snap seated characters to their seats.

## Match flow and performance

### The game runs at 30 FPS

**Priority:** Medium · **From:** Opus 5.5 · **When:** Whole match

**What we saw:** The performance overlay reads 30 FPS for the whole match. For a shooter, 30 FPS makes aim and tracking feel heavy and adds input delay.

**Suggestion:** Check whether this is a frame cap or a real limit. Target 60 FPS on the recording machine and offer a frame rate limit setting.

### The players-left count goes up

**Priority:** Low · **From:** Opus 5.5 · **When:** 1:00–1:20

**What we saw:** Early on the alive count rises (42 at 1:00, 44 at 1:04, 45 at 1:20) because of Resurgence respawns. Without context it looks like a bug. Later the HUD correctly says Resurgence is off and kills are final.

**Suggestion:** Show a short +1 respawned note next to the count while Resurgence is on, and announce clearly when Resurgence ends.

### What worked well

**Priority:** Low · **From:** Opus 5.5 · **When:** Throughout

**What we saw:** Landing at Banana Temple was quick, the tuk-tuk is a fun way to rotate, storm phases are announced clearly, kill banners and medals feel great, and the final circle at Lookout Point built real tension.

**Suggestion:** Keep these. When retuning damage, check that the endgame still lasts long enough to feel tense.
