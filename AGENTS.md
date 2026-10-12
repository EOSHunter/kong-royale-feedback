# Instructions for coding agents

## Generating Kong Royale UI

Use the **Toon design system** in `design/kong-toon/` for any new Kong Royale UI unless asked for Premium.

1. Read `design/kong-toon/design-system.md` first. It is the source of truth; when an image disagrees with it, follow the document.
2. Use the tokens in `design/kong-toon/tokens.css`. Never hard-code colours, radii, outlines or shadows in screen code.
3. Match the look in `design/kong-toon/screens/` and the component styling in `design/kong-toon/reference/toon-prototype.css`.
4. When implementing in the game, follow `design/kong-toon/implementation-prompts.md` step by step.
5. Fonts: Lilita One (display, always with a dark #04101A outline) and Nunito 700–900 (UI).

Rules that must not change:
- One primary (yellow) action per region; yellow also marks the current selection and health.
- Every interactive element has default, hover, focus (4px white ring), pressed, selected, disabled and error states.
- Damage feedback is always red; blue only means healing; enemy shield hits show a shield icon and the break shows a cracked shield.
- Rarity fills the whole item card: green common, blue rare, always with a text label.
- Esc goes back one layer, one overlay owns focus, keycaps follow the player's real bindings.

Other systems if requested: **Hybrid** (Toon with fewer containers) in `design/kong-hybrid/`, and **Premium** (charcoal and saffron) in `downloads/kong-design-system.md`.

## This repository

It is a static feedback site (no build step). Serve it with `python -m http.server 8765` from the repo root. See `README.md`.
