# Kong implementation brief

Use this alongside design-system.md, screen-review.md and tokens.css. The premium v3 images are composition references. They are not replacement game assets, live screenshots or exact specifications.

## Prompt to give the coding assistant

Implement the Kong premium v3 design system in the actual game repository. First inspect the existing UI stack, state management, settings storage, input bindings, overlay handling and asset pipeline.

Preserve working gameplay behavior and existing settings. Build shared semantic tokens, typography, input prompts, navigation states and layouts. Use the existing renderer and game assets; do not try to recreate the AI concept's more cinematic graphics by substituting unrelated art.

Start with Mouse & keyboard settings as the reusable settings master. All categories share the exact title/header, horizontal category bar, section bar, control columns and footer. Use continuous rows and thin rules rather than per-row cards. Keep contextual help secondary. Local tabs show only their own content.

Use the documented colors and logical size scales. Finalize and bundle the chosen fonts. Keep the KONG master wordmark unchanged across Royale and Of Duty; compose descriptors from the same system.

Build Menu as left-aligned typographic navigation, Report as a dedicated overlay, and Guide as authored onboarding. One overlay owns focus. Handle keyboard/controller/pointer input and restore focus on return. Bind keycap text to the actual controls.

Implement complete loading, error, submitting, success, disabled and selected states. Settings keep the existing apply-instantly/local-save behavior. Reset and Leave match confirm their consequences.

Do not copy generated hardware values, weapon stats, extra navigation, fabricated items, shortcuts or controller mappings. Use actual configuration/data. The supplied map image is an art direction reference; retain true geography and coordinates.

Implement one layout family at a time. Validate in the running game before applying it to all screens. Report actual behavior and remaining limitations instead of declaring studio/AAA quality from screenshots.

## Visual consistency acceptance

- One KONG master and descriptor system.
- One settings category order and shared layout.
- No extra top navigation inside settings.
- Same text sizes, rule weights, safe margins, control column and footer treatment.
- Saffron is used sparingly.
- No recurring rounded blue card stacks or decorative panel foliage.
- Gameplay information is anchored and readable during motion.
- Menu says Menu and Match continues when gameplay is not paused.
- Inventory selected, equipped and rarity states are distinct.
- Map and report do not keep unrelated HUD visible.
- Text scaling reflows content without clipping.
- Keyboard/controller focus is always visible.

