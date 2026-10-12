# Kong Royale · Toon design system

Everything needed to build Kong Royale UI in the Toon style, in one folder. Copy this folder into the game repo (for example as `design/kong-toon/`) or point an agent at it here.

| File | Use |
|---|---|
| `design-system.md` | Source of truth: direction, brand, colour, type, shape, components, layouts, motion, interaction and feedback rules |
| `tokens.css` | Tokens as CSS custom properties (colours, outlines, drop shadows, radii, gradients, spacing, motion) |
| `implementation-prompts.md` | Eight staged prompts for implementing the system in the game, in order |
| `reference/toon-prototype.css` | How the web prototype draws each component in Toon (overrides scoped to `html[data-ds="toon"]`) |
| `reference/base-components.css` | The shared component structure the Toon overrides sit on |
| `screens/*.jpg` | The 14 screens captured from the Toon prototype |
| `logos/` | KONG / ROYALE / OF DUTY logos as SVG and PNG, plus the shield hit icons |

Fonts (free Google Fonts, SIL OFL): **Lilita One** for display, **Nunito** 700–900 for UI.

The live, playable version is at https://eoshunter.github.io/kong-royale-feedback/?ds=toon
