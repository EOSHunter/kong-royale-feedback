# Kong design system — studio direction v2

Status: proposed design system and visual concepts, ready for review and implementation planning. This is not an implemented game UI. The written rules below take precedence when a generated image varies from them.

## Direction

Kong is energetic, confident and playful. The interface is calm, readable and predictable. Let the gorilla characters, banana weapons, island art and audio deliver personality. Use brand yellow with purpose rather than outlining everything in it.

Studio quality comes from consistent components and complete interaction behavior as much as appearance. Every screen should share navigation, control placement, text hierarchy, input feedback and error handling.

## Brand architecture

The parent brand is KONG. KONG ROYALE and KONG OF DUTY are two game identities in the same family.

Keep a single master KONG wordmark asset. Its letterforms, brow motif in the O, proportions and spacing must never be regenerated per game. Use ROYALE or OF DUTY as a separate descriptor beneath it. Both descriptors use the same type treatment, height and baseline; do not stretch them to the same width.

The proposed brand concept uses a geometric wordmark with a gorilla-brow motif. The supplied logo image is a raster concept sheet. It still needs a deliberate vector redraw, optical kerning and small-size variants before becoming a production master. Do not crop the brand presentation and treat it as final logo artwork.

### Lockup rules

- Primary stacked lockup: KONG above the descriptor. Descriptor cap height approximately 16% of the KONG cap height; gap approximately 14% of the KONG cap height.
- Clear space: at least 25% of KONG cap height on every side.
- Use yellow KONG plus ivory descriptor on navy; use a single navy mark on light surfaces.
- Start testing full lockups at 160 logical pixels wide. Below that, use the KONG master or dedicated brow emblem; verify actual readability before fixing a minimum.
- Use the full brand on lobby and loading screens. Keep a compact brand in settings if needed. Omit it from routine in-match dialogs.
- No extrusion, bevels, crowns, planks, gradients or foliage attached to the mark.
- Background art can differ between Royale and Of Duty. The brand and core UI components stay consistent.
- Do not invent a new Of Duty palette until its art direction is known. Both games initially inherit the same core tokens.

## Color tokens

| Token | Value | Purpose |
|---|---|---|
| background | #08131D | Full-screen menu foundation |
| surface | #102331 | Panels and dialogs |
| surface-raised | #193343 | Hover and selected surfaces |
| border | #304653 | Subtle dividers and outlines |
| text-primary | #F4F1E6 | Labels, headings, important values |
| text-secondary | #A7B7C4 | Descriptions and supporting information |
| accent | #FFD326 | Primary action, active indication, health |
| text-on-accent | #08131D | Text inside yellow controls |
| shield | #58BCEB | Shield and associated icon |
| success | #7AD7A5 | Saved/connected state |
| warning | #FFC16E | Match continues and caution |
| danger | #FF8C88 | Errors, destructive confirmation |
| focus | #F4F1E6 | Visible input focus ring |

Use a label or icon with status colors. Rarity also needs a visible text label. Never communicate state solely through hue.

These are candidate tokens, not a claim of complete accessibility validation. Measure contrast on actual rendered backgrounds, including transparency and focus states. Prefer opaque panels behind controls; don't rely on blur for readability.

## Typography

Use one readable sans-serif UI family with regular, medium, semibold and bold weights. A mildly condensed display family can be used for major headings; keep descriptions and control labels in the readable UI family. Choose and license the actual font files once, then bundle them consistently.

Sizes below are logical pixels at a 1920×1080 reference UI canvas:

| Role | Size / line height | Weight |
|---|---|---|
| Display | 40 / 48 | Bold |
| Screen title | 32 / 40 | Bold |
| Section title | 22 / 28 | Semibold |
| Control label | 18 / 24 | Semibold |
| Body/help | 18 / 26 | Regular |
| Supporting text | 16 / 22 | Regular |
| Compact HUD | 16 / 20 | Semibold |
| Keycap | 16 / 20 | Semibold |
| Important HUD number | 32 / 36 | Bold |

Use sentence case in functional UI. Uppercase belongs in the wordmark, short display labels and occasional compact HUD tags. Use tabular numerals for ammunition, percentages, timers and numeric settings. Avoid exaggerated tracking in descriptions.

## Spacing and shape

Spacing scale: 4, 8, 12, 16, 24, 32, 48, 64 logical pixels.

- Screen safe area: start at 48px on the reference canvas; respect platform safe areas and user scaling.
- Panel padding: 24px. Dialog padding: 32px.
- Columns: 24px gutters.
- Standard control height: 48px; major action height: 56px.
- Settings row: minimum 64px, expanding for content and text scaling.
- Button horizontal padding: 20–24px.
- Control radius: 6px; panel radius: 8px; keycap radius: 4px.
- Border: 1px. Focus ring: 2px with 2px offset.
- Avoid decorative corner cuts and per-screen radius variations.
- Align labels to a consistent left edge and numeric values to a consistent right edge.

## Reusable layout templates

### Settings shell

One header, one category rail, central options, contextual help, one footer. Category order is fixed: Mouse & keyboard, Controller, Audio, Video, Accessibility.

Reference layout at 1920×1080: 48px outer margins; header 80px; footer 56px; left rail 240px; help panel 384px; two 24px gutters; central region takes the remainder. Maximum combined content width is 1824px. Center the shell on wider displays instead of stretching controls.

Local tabs are inside the central region. They show only their own content. Volume does not show Voice settings; Display does not show Quality settings. Mouse does not show Behavior settings once real section tabs are implemented. The generated mouse/controller concepts include summaries to illustrate available options; these summaries should become their own tab contents.

At narrower widths, retain navigation and central controls and move help below the selected row or into an expandable section. At increased text sizes, allow the same adaptation. Scroll the option area; keep header/footer visible without clipping content.

### Dialog shell

Use one active dialog at a time. Report replaces Menu; Back returns to Menu. Compact dialog width starts around 480px; report width around 880px; guide width around 1120px. Fit within safe areas, expand vertically as needed, and use internal scrolling for overflow.

### Gameplay shell

Minimap top left, compass top center, health/shield bottom left, ammo and equipment bottom right. Use the same safe-area settings. Keep the center clear. Optional diagnostics occupy one dedicated region, hidden by default.

### Map shell

Map dominates the screen. Header shows match state and Close. Legend is a bounded side panel. Marker actions belong in a bottom keycap strip. Hide unrelated gameplay panels while the map is open.

### Lobby/loading shell

Artwork leads. Moderate-scale brand lockup, one clear action or progress state, restrained functional panels. Contextual hints change with the current screen.

## Component contracts

### Button

Primary: accent fill with dark text. Secondary: navy surface, subtle border, ivory text. Tertiary: text with full focusable hit area. Destructive: neutral entry action; danger treatment in the confirmation dialog. Keep icons optional and consistently aligned.

No more than one dominant primary action per task region. Selected segmented controls are choices, not primary actions; use a subtle surface and slim accent indicator.

### Navigation and tabs

Inactive: secondary text. Active: primary text, raised surface and slim yellow marker. Focus: ivory ring in addition to the active marker. Category order, icon style and alignment never change between screens.

### Slider

Label, fixed-width track, numeric value. Support pointer drag, keyboard arrows and controller adjustment, plus direct numeric entry where appropriate. Display units. Track width typically 240–320px on the reference canvas. Use a comfortable hit area beyond the visible track.

### Switch

Label and explicit On/Off text. Thumb position and appearance convey state. Focus ring surrounds the full control. Do not depend on a white square whose meaning is unclear.

### Select/segmented choice

Use segmented choice for short sets; dropdown for longer lists. Selected styling follows the tab rules. Support input focus, expanded state, scrolling and selection confirmation.

### Binding control

Two consistent binding slots where supported. Capture state says Press a key or button. Show Cancel and Clear hints. Give useful feedback for a conflict. Keep existing conflict policy consistent rather than silently changing it.

### Inventory card

Slot index, item art, name, rarity label, relevant stat. Selection uses ivory outline; equipped uses a separate badge. Empty slots remain quiet. Equip, Move and Drop are explicit alternatives to drag. Treat selected, equipped and rare as separate states.

### Keycaps and icons

One shared input-prompt system renders keyboard, mouse and controller glyphs based on the actual binding/device. Do not hard-code shortcuts into screen art. Icons use the same stroke weight and optical size, typically a 24px box and 2px stroke. Pair unfamiliar icons with labels.

### Toast/status

Short, specific feedback, one location per context. Saved is a quiet checkmark and text, not a yellow button. Error feedback explains what happened and how to recover. Connection/FPS alerts should be actionable and avoid repeated telemetry.

## Required interaction states

Every interactive component needs default, hover, focus, pressed, selected/checked where relevant, disabled and error states. Forms also need submitting and success states.

- Hover raises the surface slightly.
- Focus uses the ivory ring and remains visible with keyboard/controller input.
- Pressed darkens the surface or slightly shifts its appearance without moving surrounding layout.
- Disabled retains readable text and a clear disabled cue; avoid blanket low opacity.
- Invalid input has an error icon, concise message and recovery path.
- Report submission shows Sending, prevents duplicate submission, then confirmation or retry.
- Unsaved behavior must be explicit. Current settings apply instantly and save on this device; keep that model.
- Reset confirms the affected category before restoring it.
- Leave match requires confirmation and clearly communicates the consequence.

## Input, motion and responsive behavior

Esc goes back one layer. On the root match menu it resumes gameplay. Opening a dialog moves focus inside it; closing restores focus to the trigger. Gameplay controls must not fire through an open menu. Keep controller focus order predictable and restore the last selected setting.

Settings sliders support fine adjustments. Focused rows stay in view. Inventory actions support keyboard/controller alternatives to drag. Map controls respect the current bindings and avoid conflicting with gameplay input.

Motion tokens: fast 120ms, standard 180ms, slow 240ms, ease-out. Use brief opacity/surface transitions; avoid constant pulsing, large zooms and layout shifts. Reduced motion removes nonessential animations.

Use a logical reference canvas with responsive constraints rather than uniformly scaling everything to the viewport. Test 16:9, 16:10, ultrawide, smaller window sizes, and increased text/HUD scales. Constrain reading width on ultrawide screens; HUD anchors remain at safe edges.

## Implementation discipline for a vibe-coded game

Build shared components first: ScreenShell, SettingsShell, DialogShell, Button, Tabs, SettingRow, Slider, Switch, Select, Keycap, Status, InventoryCard and HUDGroup. Screens compose them instead of defining their own styles.

Reference semantic tokens instead of raw colors or one-off sizes. Use one overlay manager and one input-focus manager. Keep settings configuration separate from presentation so labels, defaults, values, units and explanations stay consistent.

A screen is ready when its states work, navigation is coherent, focus is visible, text scales without clipping, controller/pointer behavior is tested, and it matches the shared tokens. A screenshot alone cannot establish usability.

## Implementation order

1. Finalize the logo vector master and shared token names.
2. Build button, typography, focus, keycap and settings row primitives.
3. Implement the common settings shell and one category.
4. Implement Menu, Report and Guide through one dialog system.
5. Apply the gameplay HUD, map and inventory templates.
6. Finish lobby/loading art presentation and input hints.
7. Review every screen together for drift and test real input paths.

## Concept limitations and final consistency pass

Image generation is useful for art direction but can drift in logo proportions, surface opacity, category geometry, selection styling and tab contents. Treat the images as screen compositions; use this document and tokens.css as the implementation source of truth.

Normalize all settings headers, rail widths, footer placement and descriptor lockups during implementation. Remove palm/background imagery from control surfaces when it hurts clarity. Retain art outside panels. Do not adopt generated values, shortcuts or controller mappings without verifying the actual game.

