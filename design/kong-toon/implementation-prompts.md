# Kong Royale — Toon design system implementation prompts

Copy these into your coding assistant (Claude Code, Cursor, Codex, etc.) one at a time, in order. Each prompt assumes the assistant has `design-system.md`, `tokens.css` and the `kong-logos/` folder in the repo (suggested location: `design/kong-toon/`).

Run them in order. Check the game after each step before moving on, so drift is caught early.

---

## 0. Master prompt (paste first, keep in the assistant's context)

```
You are implementing the Kong Royale Toon design system in the actual Kong Royale game repository.
The source of truth is design/kong-toon/design-system.md and tokens.css.
Toon look: the original Kong Royale colours (deep navy #071422, banana yellow #FFD21A, ivory
#FFF8E7, sky #4FB6EA) with a clean cartoon finish: Lilita One display type with a dark outline,
Nunito 700-900 for UI, 3-4px #04101A outlines, hard straight-down drop shadows, rounded pills,
16-26px radii and springy motion. Layouts and behaviour are the same as the Premium system.
Concept images are composition references only: never copy generated values, hardware specs,
weapon stats, shortcuts, controller mappings or extra navigation from them.

Before changing anything, inspect and summarise for me:
- the UI stack (DOM/CSS, canvas, engine UI, React, etc.) and where screens live
- state management, settings storage and how settings are applied
- the input binding system and how keycap/glyph text is produced today
- how overlays/menus open and close and who owns input focus
- the asset pipeline for fonts and images

Constraints:
- Preserve all working gameplay behaviour and existing settings values.
- Settings keep the existing model: apply instantly, save on this device.
- Use semantic tokens, never raw hex values or one-off sizes in screen code.
- One overlay manager and one input-focus manager. Esc goes back one layer.
- Every interactive component needs default, hover, focus, pressed, selected, disabled and error states.
- Report actual behaviour and remaining limitations. Do not claim AAA/studio quality from screenshots.

Do not write code yet. Reply with the inventory above and a step plan that follows the
"Implementation order" section of the design system.
```

---

## 1. Tokens, fonts and brand assets

```
Step 1 — foundations only, no screen changes.

1. Add the tokens from tokens.css in the form this UI stack uses: CSS custom
   properties, a theme object, or engine style constants. Keep the names, including outline,
   the drop-shadow set (pill, tile, button, card, dialog), radii (pill, key, button, tile, card,
   panel), the primary/secondary/danger gradients, rarity colours, the 4–64 spacing scale and
   motion tokens (120/180/240ms, spring curve cubic-bezier(.34,1.56,.64,1)).
2. Respect prefers-reduced-motion (or the game's Reduced motion setting) by zeroing motion tokens.
3. Bundle the chosen fonts (free Google Fonts, SIL OFL): Lilita One (display: titles, headings,
   big HUD numbers) and Nunito 700/800/900 (UI text, tabular numerals). Display text is always
   drawn with a 4-6px #04101A outline behind the fill (paint-order: stroke fill or the engine's
   text outline) and a hard drop on the largest sizes.
   Bundle the files; do not rely on system fallbacks.
   Add the type roles from the Typography table as named styles (lobby-display 110/100,
   page-title 88/92, context-heading 32/36, control-label 21/28, body 19/28, tabs 17/22,
   supporting 16/22, keycap 17/20, hud-number 40/44).
4. Copy kong-logos/ into the asset pipeline. Use kong-royale-lockup.png on lobby/loading,
   kong-wordmark-saffron.png for compact headers (add a 3px #04101A outline
   and a hard 6px drop on dark art), kong-brow-icon.png under 160px wide.
   These are raster concept exports; leave a TODO for the vector master.
5. Add a small dev-only "tokens" screen or story that renders every colour, type role and
   spacing step so I can eyeball them in-game.

Show me the diff summary and how to open the tokens screen.
```

---

## 2. Primitive components

```
Step 2 — shared primitives in the Toon style (outlined, hard drop, rounded, springy press). No screen should define its own styles after this step.

Build these components on top of the tokens, each with default, hover, focus (4px white ring,
3px offset), pressed, selected/checked, disabled (readable text, not blanket low opacity) and
error states:

- Button: primary (yellow gradient, dark text, 16px radius, 4px #04101A outline, 6px hard drop,
  64px tall; hover lifts 3px, press squashes 5px onto a 1px drop with a spring back), secondary
  (navy gradient, white text), tertiary (text with full hit area), destructive entry (neutral;
  red gradient only inside the confirm dialog). Max one primary per task region.
- Tabs / category nav: outlined pills with a 4px drop; inactive navy with pale text, active
  yellow with dark text. No underline indicator.
- SettingRow: an outlined navy tile (18px radius, 3px outline, 5px drop), min 84px tall, label
  left, control column right, 10px gap between tiles; the selected/focused tile gets a yellow
  outline.
- Slider: label, fixed 280–360px rounded 14px track with a yellow gradient fill and a 30px
  outlined ivory thumb, numeric value with unit, pointer drag, arrow-key and
  controller stepping (fine + coarse), optional direct numeric entry.
- Switch / cycle: outlined pill switch, green when on, explicit On/Off text plus thumb state.
- Segmented choice and Select (dropdown for long lists).
- BindingControl: two slots, capture state "Press a key or button", Esc cancels, Backspace
  clears, conflicts reported with the action that already uses the key.
- Keycap: ivory cap, dark text, 3px outline, 4px drop (yellow for accent keys); renders the actual current binding for the active device (keyboard, mouse, Xbox,
  PlayStation, Nintendo). Never hard-code key text in screens.
- Status/Toast: quiet check + "Saved on this device"; errors explain cause and recovery.
- InventoryCard and HUDGroup can wait until step 5.

Add the dev tokens/story screen entries for each primitive and every state.
```

---

## 3. Settings shell (master) + Mouse & keyboard

```
Step 3 — implement the Settings shell using Mouse & keyboard as the master. Do not touch the
other categories yet.

Layout on the 1920×1080 reference canvas:
- 80px horizontal margins, content max width 1760px, centred on ultrawide.
- Compact KONG brand top-left, "Back · Esc" top-right.
- Large "Settings" title (page-title role).
- One horizontal category bar in this fixed order: Mouse & keyboard, Controller, Audio, Video,
  Accessibility. No other global navigation inside Settings.
- One local section bar under it (Mouse / Behavior / Bindings). Each local tab shows only its
  own rows.
- Settings table ~64% width, contextual help ~27% on the right with a 1px divider. Help updates
  for the focused row.
- Footer: "Restore defaults" (keycap R) left, "Saved on this device" status right.

Behaviour:
- Wire to the existing settings storage; values apply instantly and persist as they do today.
- Restore defaults opens a compact confirm dialog naming the category being reset.
- Keyboard/controller: up/down moves rows, left/right adjusts, Tab/bumpers switch local
  sections, Q/E or triggers switch categories. Focused row stays scrolled into view.
- At narrow widths or enlarged text, contextual help moves below the active row; category nav
  may scroll horizontally with visible focus.

When done, list exactly which rows exist and confirm none were invented.
```

---

## 4. Remaining settings categories

```
Step 4 — apply the shell to Controller, Audio, Video and Accessibility.

All five categories must share title, category/tab baselines, row start, control column and
footer. Only data and contextual content change.

- Controller: Layout / Look / Deadzones. Layout shows a monochrome controller diagram that
  highlights the focused binding. Detect the real controller family for glyphs.
- Audio: Volume / Voice. Voice gets input device, chat mode, push-to-talk binding, voice level
  and a mic test with a live meter.
- Video: Display / Graphics. Graphics starts with a preset; editing an individual option switches
  the preset to Custom. Hardware details are a collapsed disclosure showing real detected values
  only. The FOV diagram reflects the game's actual FOV convention (horizontal or vertical).
- Accessibility: Comfort & readability (Reduced camera motion, HUD scale, Text scale). The
  preview uses the real HUD components at the chosen scale. Text scale reflows the menu.

Take a screenshot of each category at the same scroll position and compare baselines.
```

---

## 5. Overlays: Menu, Report a problem, Learn controls, confirmations

```
Step 5 — one overlay system.

- Match menu: full-height left scrim, left-aligned typographic list. Heading "Menu", subline
  "Match continues" (never "Paused" in live matches). Order: Resume, Settings, Practice analytics
  (firing range only), Report a problem; a rule; Leave match. Esc resumes. Gameplay input is
  blocked while the menu is open. Leave match opens a confirm dialog stating the consequence.
- Report a problem: replaces the menu (no stacked modals). Category grid (Lag/rubber-banding,
  Hit registration, Bug/glitch, Visual, Audio, Stuck, Cheater, Other), multiline description
  with 1000-character counter, "Automatically attached" column listing the real screenshot,
  position and connection log. Send report: validation → Sending (button disabled) → Sent
  confirmation or recoverable error with Retry. Ctrl+Enter sends; Enter inserts a newline.
  Back returns to Menu with focus restored on "Report a problem".
- Learn controls: full-screen guide with numbered lesson index, one lesson at a time, keycaps
  driven by current bindings, progress "n / 10", Next (primary), Practice in firing range and
  Skip guide (quiet).
- Compact confirm dialog for Reset and Leave match. Focus moves inside on open and returns to
  the trigger on close.
```

---

## 6. Gameplay HUD, Inventory and Map

```
Step 6 — in-match surfaces. Keep the gameplay renderer exactly as it is; only the UI changes.

- HUD: minimap top-left, compass top-centre, health/shield bottom-left (36px HUD numbers, slim
  saffron health bar, cyan shield bar), ammo + weapon name + five slot indicators bottom-right.
  Short gradient backplates, no framed cards. Centre stays clear.
  Match stats top-right as two rows of slanted translucent chips: squads left + players left,
  then kills, assists, squad kills (squad modes) and damage. Add a Match stats setting
  (Auto / Personal / Squad / Hidden). Pop changed numbers briefly; confirm Eliminated / Assist
  under the crosshair.
  Damage feedback: a directional arc around the crosshair and a glow on the screen edge facing
  the shooter, always red (shield or health), aim flinch scaled by damage and halved while
  aiming, and a slow red vignette under 30 health. Blue is used only for a glow around the
  screen edges while the player is healing. Optional FPS/network
  diagnostics live in one region, hidden by default and driven by Video settings.
  Practice hints are contextual and fade once completed. HUD scale setting applies here.
- Inventory: a compact centred panel over the dimmed game (like the original), not full screen. Five equal slots; each shows index, art, name,
  rarity label, one stat. Selected = ivory outline; Equipped = separate badge. Equip / Move /
  Drop as explicit actions with keycaps, in addition to drag. Equip is disabled for the equipped
  item. Move shows a moving state, destination feedback and Esc to cancel. Ammo strip at bottom.
- Map: full-screen; header with match state and Close (M/Esc); bounded legend panel; marker
  actions in a bottom keycap strip. Hide unrelated HUD while open. Use the real map texture and
  coordinates. Player and marker use distinct shapes, not just colours.

Test while moving, firing and taking damage, on bright terrain, at HUD scale 80% and 130%.
```

---

## 7. Lobby and Loading

```
Step 7 — front-end screens.

- Lobby: artwork leads. Compact stacked KONG ROYALE lockup top-left, top nav Play / Training /
  Settings with slim saffron marker, callsign shown as identity with an "Edit callsign" action
  (inline edit with validation), eyebrow "Battle royale", one display headline, mode line, mode
  chooser (Trios / Solo), one full-width saffron Play button whose label reflects the real
  action, quiet live playtest status, Firing range + Learn controls links, input prompts footer.
- Match results: same shell as the lobby. Outcome eyebrow, display headline, placement,
  one typographic stats row with new bests marked, optional 1–5 ratings, one Back to lobby action.
  Short one-shot celebration that respects reduced motion. Enter returns to the lobby.
- Loading: art carries the screen, compact brand, one heading, honest loading phase text, a
  thin progress line with a real percentage (no fake progress), one rotating tip with keycaps
  from current bindings, optional Learn controls link.
- Use approved key art or a real menu camera scene. Do not ship the AI concept art as final.
```

---

## 8. Consistency review

```
Step 8 — review every screen together against design/kong-toon/design-system.md
"Acceptance review" and the implementation brief checklist:

- one KONG master + descriptor system; logo geometry unchanged
- one settings category order and shared layout; no extra nav inside Settings
- same text sizes, rule weights, safe margins, control column, footer
- saffron used sparingly (one primary per region)
- Menu says "Menu" / "Match continues"
- inventory selected / equipped / rarity are distinct
- map and report hide unrelated HUD
- text scaling reflows without clipping
- keyboard and controller focus always visible; Esc always goes back one layer

Produce a table: screen | pass/fail per item | screenshot path | fix needed.
Then fix the failures, one screen at a time.
```
