# Kong Royale design system: Toon

> Source: RET's Kong Royale feedback, Toon design system (12 Oct 2026).
> A second design system next to Premium v3. Same components, layouts and interaction rules; a different look.
> Files that go with it: `kong-toon-tokens.css`, `kong-implementation-prompts-toon.md` and the logo folder (`kong-logos.zip`).

## Direction

Kong Royale is a playful gorilla battle royale. Toon keeps the original game's colours (deep navy menus, banana-yellow logo and buttons, the bright lobby sky) and gives them a clean, chunky cartoon finish, in the spirit of big-studio party shooters: bold rounded type, thick dark outlines, hard drop shadows, rounded pills and springy motion.

Containers are used sparingly. Only things you press or pick up get the chunky treatment (buttons, pills, keycaps, item and weapon tiles, HUD bars and slots). Content (settings rows, help, menu lists, stats, legends, tips) stays open and typographic like Premium, separated by thin rules.

Clean still comes first. Every screen keeps the Premium structure: one category bar in Settings, one primary action per region, honest states, the same layouts and input rules. Toon changes how things look and feel, not where they are or how they behave.

## Brand

- Same KONG master wordmark and ROYALE / OF DUTY descriptors as Premium. Never redraw the letterforms.
- On dark surfaces the mark gets a 3px #04101A outline and a single hard 6px drop. No 3D extrusion, bevel, crown, planks or foliage.
- Banana KONG with ivory descriptor on navy; single navy mark on light surfaces.
- Full brand on lobby and loading, compact in settings, omitted from in-match dialogs.

## Colour tokens

| Token | Value | Purpose |
|---|---|---|
| background | #071422 | Deep navy foundation (original menus) |
| surface | #0E2A3D | Panels, tiles, dialogs |
| surface-raised | #17405A | Hover, selected tiles, secondary buttons |
| outline | #04101A | Every outline and hard drop shadow |
| text-primary | #FFF8E7 | Labels, headings, values |
| text-secondary | #A9C6DA | Descriptions, inactive tabs |
| banana | #FFD21A | Primary action, selection, health |
| banana-shade | #F2B800 | Bottom stop of yellow gradients |
| sky | #4FB6EA | Lobby sky, friendly highlights |
| shield | #3EC4FF | Shield bar, shield hit icons |
| success | #5BE37D | Saved, connected, switch on |
| warning | #FF9F1C | Match continues, caution |
| danger | #FF4D5E | Errors, Leave match |
| rarity-common | #4CC35A | Common item cards |
| rarity-rare | #2F8BFF | Rare item cards |

Yellow is reserved for the primary action, the current selection and health. Status colours always travel with a label or icon; rarity always has a text label.

Gradients are allowed on buttons, bars and item cards only, as a single top-to-bottom shift (for example #FFE45C → #FFD21A → #F2B800). Panels stay flat.

## Typography

- Display: **Lilita One** for titles, headings and big numbers. Always painted with a dark #04101A outline behind the fill (4–6px, `paint-order: stroke fill`) and a hard drop on the largest sizes.
- UI: **Nunito** at 700–900 for labels, tabs, keycaps and help text. Uppercase with light tracking only for short tabs and eyebrows.

| Role | Size / line height | Style |
|---|---|---|
| Lobby display | 110 / 100 | Lilita One, 6px outline, 7px drop |
| Page title | 88 / 92 | Lilita One, 5px outline, 7px drop |
| Context heading | 32 / 36 | Lilita One |
| Control label | 21 / 28 | Nunito ExtraBold |
| Body / help | 19 / 28 | Nunito SemiBold |
| Tabs & pills | 17 / 22 | Nunito Black, uppercase |
| Supporting text | 16 / 22 | Nunito Bold |
| Keycap | 17 / 20 | Nunito Black |
| HUD number | 40 / 44 | Lilita One, 4px outline |

Sizes are logical pixels on the 1920×1080 canvas. Use tabular numerals for values.

## Shape, outline and depth

- Spacing scale and safe areas are the same as Premium (4–64px, 48px safe area).
- Outline: 3px on small parts, 4px on buttons, cards and panels, always #04101A.
- Drop shadow: hard, no blur, straight down. 4px on pills and keycaps, 5px on tiles, 6px on buttons, 7–10px on cards and dialogs.
- Radius: pills fully round; buttons 16px; tiles and keycaps 9–18px; cards 22px; panels and dialogs 24–26px.
- Focus: 4px white ring with a 3px offset, visible on keyboard and controller.

## Components

### Button
Primary: yellow gradient, dark text, 4px outline, 6px drop. Hover lifts 3px and deepens the drop; pressed squashes down 5px onto a 1px drop, then springs back. Secondary: navy gradient with white text. Destructive: red gradient, only inside the confirm dialog. Disabled: flat slate fill, muted text, no lift.

### Tabs and choices
Category tabs, sub-sections and mode choices (Trios / Solo) are outlined pills. Active pill is yellow with dark text; inactive is navy with pale text. No underline indicator in Toon.

### Settings rows
Continuous rows separated by 2px rules, no tile per row. The selected row gets a soft navy tint with rounded corners and a short yellow pill marker on the left. Label left, control column right. Contextual help sits open beside the table, divided by a thin rule, not in a panel.

### Slider, switch, segment
Slider: 14px rounded track, yellow gradient fill, a 30px ivory thumb with outline and drop. Switch: outlined pill, green when on, with explicit On / Off text. Segment: a dark pill track with a yellow active pill.

### Keycaps
Ivory caps with dark text, 3px outline and a 4px drop. Accent keycaps (Enter, Esc in hints) are yellow. Unbound keys are red.

### Inventory card
The art area is a rarity tile, the same one the HUD weapon slots use: a radial green (common) or blue (rare) gradient behind the weapon, like the original game. The rest of the card is navy, with a pill rarity label and a numbered index chip. Selected = ivory outline plus a soft yellow glow; Equipped = yellow pill badge. Empty slots are dashed and quiet.

### HUD
Health and shield are thick outlined capsule bars (yellow and blue gradients) with outlined Lilita numbers. Weapon slots are outlined tiles showing the weapon's art on its rarity colour (green common, blue rare, radial gradient), like the original HUD. The equipped slot lifts 8px, scales up slightly and gets an ivory outline with a soft yellow glow; its slot number chip turns yellow. Empty slots are quiet navy tiles with a centred number. Match stats are rounded outlined chips: squads and players left on top, then kills, assists, squad kills and damage. Minimap gets rounded outlined corners.

### Feedback (same rules as Premium)
- Damage is always red: arc around the crosshair toward the shooter, red edge glow, flinch, slow red vignette under 30 health.
- Blue only means healing: a blue glow around all screen edges while health refills.
- Enemy hit numbers: shield icon on shield hits, cracked shield plus crack sound and "Shield broken" on the break, plain numbers on health. In Toon the icons carry a 2px dark outline.

### Dialogs and toasts
Dialogs: navy gradient panel, 26px radius, 4px outline, 10px drop, a pop-in with overshoot. Toasts: outlined navy pill with a yellow left edge.

## Layouts

Same five templates as Premium (settings shell, overlay and guide, gameplay, map, lobby / loading / results). Lists stay typographic: in the match menu and lesson list only the current item becomes a chunky yellow pill. Help, legends, stats and tips stay open with thin rules. Report categories are pills.

## Motion

Fast 120ms, standard 180ms, slow 240ms. Toon uses a springy overshoot curve, `cubic-bezier(.34, 1.56, .64, 1)`, for presses, pops and pill changes. Screen transitions stay short fades and slides. Reduced motion removes overshoot, pops and parallax.

## Interaction rules

Unchanged from Premium: Esc goes back one layer, one overlay owns focus, gameplay input never fires through menus, keycaps follow real bindings, settings apply instantly and save on this device, Reset and Leave match confirm their consequences, Report shows Sending, Sent or Retry.

## Tokens (CSS)

See `kong-toon-tokens.css`.
