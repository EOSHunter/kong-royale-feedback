# Kong Royale — screen-by-screen redesign

This compares your original screenshots to the premium v3 direction. Earlier blue-panel concept passes are superseded. All images are visual concepts, not implemented interfaces. Suggested behavior below describes implementation work.

The core change is composition: cinematic lobby, typographic settings, contextual gameplay UI. Brand consistency comes from typography, proportions, color, input language and behavior rather than repeating the same bordered box everywhere.

## 01. Mouse & keyboard settings

**Before:** Full-width rows and very long sliders; every row includes explanatory copy. Mouse, behavior and bindings share a long scroll. Small labels sit far from their controls.

**After:** A bounded continuous settings table with horizontal category navigation. Short aligned slider tracks and explicit values. One selected row has a restrained marker. Contextual explanation sits beside the table.

**Suggestions:** Mouse, Behavior and Bindings should be real section tabs showing their own contents. Support arrow-key/controller adjustments and direct numeric entry. Binding capture needs cancel, clear and conflict feedback.

**Why it is better:** Less visual searching, shorter pointer travel, readable hierarchy and a stable focus model. The setting and its explanation are easier to understand.

**Production detail:** All settings categories must retain the master screen title, category positions and footer. Some generated variants omit the title; use the master layout as authoritative.

## 02. Controller settings

**Before:** A dense long scroll beside a large controller diagram. Layout descriptions, speed settings and diagnostic meters compete at once.

**After:** Layout, Look and Deadzones become separate sections. Layout choices use aligned text and restrained controls. A monochrome controller diagram explains the current mapping; connection status stays quiet.

**Suggestions:** On focus, show the mapping associated with the selected preset or button. Keep response curve and speed in Look; calibration and drift tools belong in Deadzones. Detect the actual controller family for glyphs.

**Why it is better:** Players make one class of decision at a time. The diagram becomes functional feedback rather than permanent decoration.

**Production detail:** Normalize selection styling to thin accent markers; the concept still fills some small segmented choices yellow. Verify every mapping against actual game configuration.

## 03. Audio settings

**Before:** Very long sliders, extensive descriptions, volume and voice options all in one page. Mic testing is buried among other controls.

**After:** Volume and Voice separate. Mixing controls form a compact aligned table. Selected help and a small sound diagram occupy the secondary area. A preview action sits next to hit-marker choice.

**Suggestions:** Voice should have input device, chat mode, push-to-talk binding, voice level and a clear mic test with live meter. Use the same slider structure as Mouse.

**Why it is better:** Faster mixing, clearer mic setup and reduced scrolling. Grouping mirrors the task players are performing.

**Production detail:** Remove the extra global navigation introduced by the image generator. Settings has one category bar and one local section bar, not three competing navigation rows.

## 04. Video settings

**Before:** Display, quality settings and hardware diagnostics share a dense page. The explanatory area can become a wall of technical text.

**After:** Display and Graphics are separate. FOV receives a simple visual explanation. Hardware details become a disclosure. Options use the same table, alignment and focused-row language as other settings.

**Suggestions:** Show a graphics preset before individual quality overrides. Preview FOV honestly. Use actual detected display/GPU values, and label the game's actual FOV convention.

**Why it is better:** Common adjustments are easier to find and technical detail is available when needed. Players can understand the visual effect of a setting.

**Production detail:** Generated hardware values and FOV illustrations are placeholders. Remove them until real detection and correct projection are connected. Preserve the settings master header and avoid added top-level menus.

## 05. Accessibility settings

**Before:** Three extremely wide rows followed by a large unused area. HUD/text scaling changes are difficult to judge from the menu alone.

**After:** A compact Comfort & readability section uses the same typographic framework. A small HUD and text preview makes scaling visible.

**Suggestions:** Keep reduced camera motion, HUD scale and text scale. Preview the actual game components at the selected size. Allow text enlargement to reflow the menu instead of merely magnifying it.

**Why it is better:** Feedback is concrete, options remain easy to scan, and this screen receives the same design care as more complex categories.

**Production detail:** The preview must use actual health/shield values, real weapon slots and the same component code as gameplay. No invented items or stock combat art.

## 06. Learn controls

**Before:** A compact modal with ten wrapping topic buttons, mostly text instruction, and three similarly prominent yellow actions.

**After:** A dedicated guide layout with a numbered lesson index, one lesson at a time, clear key diagrams and an illustrative practice scene. Next is the principal action; Practice and Skip are quieter.

**Suggestions:** Drive prompts from current bindings. Prefer a real training scene or short captured gameplay animation for each lesson. Completing the lesson updates progress without blocking players who skip.

**Why it is better:** It feels like authored onboarding and helps players see the action, rather than reading a compressed reference manual.

**Production detail:** The new illustrated scene is concept art; ship actual game footage or assets so onboarding matches gameplay.

## 07. Match menu

**Before:** Centered PAUSED panel even though the match continues. Unequal button widths; Settings appears before Resume. Utility and exit actions receive similar visual weight.

**After:** A left-aligned menu over a controlled scrim. Large typographic choices replace a stack of button boxes. Resume leads. Match continues is explicit. Leave match is separated at the bottom.

**Suggestions:** Esc resumes. Hide gameplay input while the menu is open. Show Practice analytics only in the firing range. Put fullscreen under display settings. Confirm leaving.

**Why it is better:** Clear action priority, less clutter and accurate match-state communication. The menu looks intentionally composed rather than like a generic dialog.

**Production detail:** The text entries still need generous focusable hit areas and clear controller focus, even without visible rectangles.

## 08. Report a problem

**Before:** A report modal overlaps the pause modal. Categories, shortcuts and a single-line description make the flow feel cramped. Sending is conveyed mainly by keyboard instructions.

**After:** Reporting gets a dedicated composition. Categories are separated from the description. Attachments have a secondary area. Send report is explicit and Back returns to Menu.

**Suggestions:** Use a multiline field, category selection, automatic attachment summary, submitting state, success confirmation and recoverable error. Ctrl+Enter can send; Enter should work normally inside multiline text.

**Why it is better:** The player understands what will be sent and how to submit. Removing stacked dialogs improves focus and readability.

**Production detail:** Attachment coordinates, screenshot and connection log must be real data; no fabricated values. Avoid extra decorative logos.

## 09. Inventory

**Before:** Five large cards with damage numbers and drag instructions. Selection, rarity and equipped status overlap visually. Rearranging/dropping depends on knowing drag behavior.

**After:** A calmer horizontal inventory plane with five consistent slots. Item art leads, stat typography is smaller, rarity and Equipped have separate labels. Explicit Equip, Move and Drop actions supplement drag.

**Suggestions:** Provide a clear moving-item state, cancel path and destination feedback. Keep keyboard/controller access equivalent to pointer access. Selection and equipped status must be independent.

**Why it is better:** Faster comparison and fewer hidden interactions. The player can identify item, state and available action at a glance.

**Production detail:** The generated concept may make an already-equipped item look equip-able; the actual button should disable or become an Equipped status. Only show shortcuts that exist in the game.

## 10. Gameplay HUD / firing range

**Before:** Minimap, practice panel, permanent banner, FPS telemetry and network telemetry all compete. Health and inventory are large separate boxed groups.

**After:** A quieter edge-anchored HUD. Health/shield and ammo have clear typographic priority. Equipment slots are compact; optional diagnostics have one location. Practice instructions are contextual and temporary.

**Suggestions:** Fade completed onboarding hints. Make critical ammo/health information persistent. Give genuine connection problems actionable alerts rather than constant raw telemetry. Keep gameplay art faithful to the real renderer.

**Why it is better:** More of the center remains available for aiming and awareness; essential information reads quickly.

**Production detail:** Test readability while moving, firing, taking damage and playing on bright terrain. A beautiful static screenshot does not establish combat usability.

**Follow-up:** Match stats now sit top right as two rows of slanted chips. The top row is match state: squads left and players left. The second row is your contribution: kills and damage, plus assists and combined squad kills in squad modes. A Match stats setting (Video › Display) picks Auto, Personal, Squad or Hidden; Auto shows Squad in Trios. Numbers pop briefly in saffron when they change, and Eliminated / Assist confirmations appear under the crosshair. The concept also shows damage feedback (a red arc around the crosshair, a red glow on the edge facing the shooter, and the hit on the health bar) and a separate healing state with a blue glow around all screen edges. Damage feedback is always red; blue only means healing. Enemy hit numbers show a shield icon on shield hits and a larger cracked shield icon, with a Shield broken confirmation, on the hit that breaks the shield.

## 11. World map

**Before:** Thick decorative frame, bright storm texture, large labels, and unrelated practice/inventory/network panels remain visible.

**After:** A quieter cartographic presentation with muted terrain/water, restrained storm shading, consistent symbols and a compact dedicated legend. Map state and marker controls form a distinct UI.

**Suggestions:** Preserve actual geography. Scale labels with zoom and suppress overlapping labels. Give player position and selected marker distinctive shapes, not just colors. Bind actions through the shared input prompt system.

**Why it is better:** Routes, zones and markers become easier to distinguish. The map supports planning rather than competing with unrelated HUD.

**Production detail:** The generated map is an art-direction reference, not accurate world data. Implement styling over the actual map texture and coordinates.

## 12. Main lobby

**Before:** A huge extruded logo and small playtest form dominate the left side. Callsign is always an input. Mode selection and training share a dense panel. Combat shortcuts sit at the bottom.

**After:** A cinematic character composition with editorial typography. Play, Training and Settings form clear navigation. Callsign becomes identity with an Edit action. Mode sits immediately above the main Play action. Playtest state is quiet metadata.

**Suggestions:** Retain honest live-session status and available modes. The Play label should reflect the actual action when joining a specific playtest. Use existing character assets, authored lighting and a deliberate menu camera rather than promising a different renderer.

**Why it is better:** The lobby communicates the game's world and gives players a clear next step. Metadata supports the experience instead of defining its appearance.

**Production detail:** The new slogan and cinematic art are proposed marketing/art direction. Production needs real scene setup or approved key art; they are not evidence of current graphics quality.

## 13. Loading screen

**Before:** Strong island art with a dense control-reference block, a very large logo and long loading strip.

**After:** The artwork carries the screen. Brand is restrained; loading status/progress is grouped at the bottom. One concise tip replaces the instruction wall.

**Suggestions:** Rotate relevant tips, report actual loading phases honestly, and keep the guide link optional. Avoid fake percentages or progress that stalls without explanation.

**Why it is better:** Clear system feedback with less clutter and a more deliberate transition into the game.

**Production detail:** Use approved key art or real scene captures; preserve truthful loading data.

## KONG / ROYALE / OF DUTY brand family

**Before:** Different-looking title treatments in the supplied lobby/loading art, dominated by dimensional yellow lettering. No shared parent/subtitle rules were defined.

**After:** A single KONG master wordmark and one descriptor system for ROYALE and OF DUTY, plus one-color and small-icon concepts.

**Suggestions:** Create one production vector master; compose every lockup from it. Match descriptor height, weight and spacing. Do not independently generate each sub-brand's KONG. Keep brand visibility proportional to the screen's role.

**Why it is better:** Players recognize one franchise. New game modes or titles can inherit the system without becoming unrelated logos.

**Production detail:** The brand sheet is raster concept artwork. Exact repeatable geometry, optical corrections, transparent exports and small-size variants require a vector finishing pass.

## What makes the full direction stronger

Composition replaces decoration. There are fewer containers, clearer typographic levels, quieter metadata and more task-specific layouts. Shared interaction rules keep the experience coherent even though the lobby, settings, map and inventory look different.

A premium retail experience also requires responsive input, complete focus/hover/error states, stable performance, authored sound/motion and actual playtesting. This package establishes an art direction and implementation plan; it does not claim those qualities have already been achieved.


## 14. Match results

**Before:** A centred bordered card stacked over the scene: an oversized extruded KONG ROYALE title, four boxed stat tiles, a boxed personal-best panel and a boxed rating panel. Confetti covers the whole screen and raw FPS / ping / jitter telemetry stays visible at the top right.

**After:** The results screen uses the lobby shell. The artwork and the winning gorilla lead on the right; an unboxed type column sits on the left. A saffron Victory eyebrow, one display headline, placement with the #1 in saffron, the stats as a single typographic row with new bests marked, a quiet personal-best line, three optional 1–5 ratings and one saffron Back to lobby action.

**Suggestions:** Count the stats up once and keep confetti to a short burst that stops on its own and respects Reduced camera motion. Mark which stats are new bests next to the numbers instead of listing them in a sentence. Keep the ratings optional and confirm quietly once all three are set. Hide diagnostics unless Show FPS or Network stats are switched on. Enter returns to the lobby.

**Why it is better:** The eye lands on the outcome first, then the numbers, then the one next step. Dropping four nested boxes and the telemetry makes the moment feel like a celebration instead of a dashboard, and it now reads as the same game as the lobby and loading screens.

**Production detail:** "Kong Royale." here is display type, not the logo; keep the KONG master for brand placements. Stats, placement and personal bests must come from real match data (the values shown are the playtest recording's). Use the real end-of-match camera or approved key art behind the column.
