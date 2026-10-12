# Kong Royale wireframes: layout spec

Layouts only. No colours, fonts or art direction: those are for the designer. Every screen is on a 1920×1080 logical canvas with a 48px safe area. Hatched boxes in the wireframe screens are placeholders for artwork, logos, item art and maps.

See the live wireframes at https://eoshunter.github.io/kong-royale-feedback/?ds=wire (prototype and screen-by-screen review). The 14 wireframe images are in `img/wire/`.

## Shared rules

- One primary action per region. Every control has default, hover, focus, pressed, selected, disabled and error states.
- Esc goes back one layer; one overlay owns focus; keycap hints follow the player's real bindings.
- Damage feedback must be distinguishable from healing feedback (the shipped systems use red for damage, blue for healing).

## Screens

### 01–05 · Settings (shared shell)
- Top: compact logo (left), Back · Esc (right).
- Large page title.
- Category bar, fixed order: Mouse & keyboard, Controller, Audio, Video, Accessibility.
- Section bar under it (for example Mouse / Behavior / Bindings). Each section shows only its own rows.
- Body: settings table (~64% width, label left, control column right) and contextual help (~27%) with an optional visual.
- Footer: Restore defaults (left), input hints (centre), Saved on this device (right).
- Controls: slider with value, cycle, switch with On/Off text, segmented choice, key binding.

### 06 · Learn controls
- Logo top left, title bar and Close · Esc top right.
- Left: numbered list of 10 lessons, current one highlighted.
- Centre: progress (n / 10), lesson title, progress bar, one or two lines of instruction, key / mouse diagrams below.
- Right: artwork. Bottom right: Back, Next (primary), Skip guide, Practice in firing range.

### 07 · Match menu
- Left third: context line, large "Menu" title, "Match continues" status.
- Vertical list: Resume (first, selected), Settings, Practice analytics (range only), Report a problem; a divider; Leave match.
- Footer hints: Esc Resume, ↑↓ Select, Enter Open. Game stays visible on the right.

### 08 · Report a problem
- Back (top left), Close · Esc (top right).
- Left: title, intro, 8 issue types in a 4×2 choice grid, a large optional description field with a character count.
- Right column: Automatically attached (screenshot thumbnail, position, connection log), then Send report (primary) and Cancel.
- States: validation error, sending, sent, network error with retry.

### 09 · Inventory
- A compact centred panel over the dimmed game (like the original game), not full screen.
- Header: title, count (2 / 5), Tab / Esc Close.
- Five equal slots in a row. Each filled slot: index, rarity label, item art area, name, one stat, Equipped badge. Empty slots are quiet.
- Under the selected slot: Equip, Move, Drop actions with keys.
- Bottom: four ammo types with count and bar.

### 10 · Gameplay HUD
- Top left: minimap with mode label; contextual hints under it.
- Top centre: compass and a short status line.
- Top right: match stats (squads left, players left; then kills, assists, squad kills, damage).
- Bottom left: health and shield bars with numbers.
- Bottom right: ammo, weapon name, five weapon slots with the equipped one marked.
- Centre: crosshair only; damage direction, hit numbers and confirmations appear around it.

### 11 · World map
- Map fills the screen with pan and zoom.
- Right side panel: match state (players alive or mode), close hints, phase timer, legend.
- Bottom left: marker actions with mouse / key hints.

### 12 · Lobby
- Artwork leads on the right two-thirds.
- Top: logo (left), Play / Training / Settings tabs, callsign with Edit (right).
- Left column: eyebrow, headline, mode line, Trios / Solo choice, Play (primary), live status, Firing range and Learn controls links.
- Footer hints: Enter Play, Esc Settings.

### 13 · Loading
- Full-bleed artwork, compact logo top left.
- Bottom left: mode line, headline, current loading phase. Full-width progress bar with percentage.
- Bottom right: one rotating tip with keys. Learn controls link.

### 14 · Match results
- Artwork right; left column: outcome eyebrow, headline, placement.
- One row of stats (kills, damage, time, headshots) with "new best" markers.
- Personal best note, three optional 1–5 ratings, one primary Back to lobby action.
