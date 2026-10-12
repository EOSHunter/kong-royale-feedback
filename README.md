# RET's Kong Royale Feedback

A static site that collects feedback sessions, ideas and design work for **Kong Royale**.

- **Home**: the design system plus a list of feedback sessions with everything attached to each.
- **Three design systems**, switched from the dropdown in the top bar: **Premium** (charcoal, saffron, editorial), **Toon** (the original Kong Royale colours with a chunky cartoon finish) and **Hybrid** (Toon with fewer containers). The whole site, the prototype and the after screenshots follow the choice; `?ds=toon` or `?ds=hybrid` in a link opens that system directly.
- **Design system**: brand family, colour and type tokens, live components, layout templates, interaction rules and step-by-step implementation prompts. The full system downloads as Markdown and the logos download as SVG, PNG or a zip of both.
- **Playtest feedback · October 10, 2026**: all 14 redesigned screens as a playable prototype, with before/after comparisons, review notes for each screen, a link to RET's gameplay recording, and a gameplay feedback section from Ret and Opus 5.5 (combat, time to kill, visibility, collision, match flow) with frames from the recording.

Live site: https://eoshunter.github.io/kong-royale-feedback/

Also published as a Claude artifact: https://claude.ai/artifact/CnWrdJz7F4m1TmUMVdPv5e

## Run it locally

It's plain HTML, CSS and JavaScript with no build step. Serve the folder over HTTP (the pages fetch their Markdown files, so opening `index.html` straight from disk won't load everything):

```bash
python -m http.server 8765
```

Then open http://localhost:8765.

GitHub Pages serves the `main` branch root; every push to `main` redeploys the site.

## Layout

| Path | What it is |
|---|---|
| `index.html` | Page shell |
| `css/site.css` | Feedback site styles |
| `css/toon.css` | The Toon design system: overrides for the site and the prototype, scoped to `html[data-ds="toon"]` |
| `css/game.css` | Prototype components on the 1920×1080 canvas, built from the design tokens |
| `js/data.js` | Content: screens, logos, colours, type roles, bindings, lessons, items |
| `js/game.js` | The interactive prototype (screens, settings model, HUD, inventory, map, transitions) |
| `js/site.js` | Router, pages, downloads, before/after sliders |
| `downloads/` | `kong-design-system.md`, `kong-implementation-prompts.md`, logo PNGs and the session's source documents |
| `img/toon` | The 14 screens captured from the Toon prototype (`video/capture_toon.py`) |
| `img/after`, `img/before` | Premium v3 concepts and original playtest screenshots |
| `img/v1`, `img/v2` | Earlier concept explorations |
| `img/art`, `img/items`, `img/brand` | Art backgrounds, item art and logo previews used by the prototype |

## Prototype controls

Mouse to look, click to fire (the first click captures the cursor). Esc opens the menu or goes back one layer, Tab opens the inventory, M the map, R reloads, 1–5 switch weapons, Q heals. K simulates taking damage (with the suggested directional damage arc, edge glow and flinch) and V ends the match with a win (prototype only). Keys follow the bindings set in Settings → Mouse & keyboard → Bindings.

## Adding a feedback session

1. Put the session's images in `img/` and documents in `downloads/`.
2. Add a session entry on the home page (`renderHome` in `js/site.js`) and a page renderer plus route for it.

## Notes

- Concept art and prototype backgrounds are AI-generated art direction, not shipped game assets.
- Logos are in `downloads/logos/` as transparent PNGs and in `downloads/logos/svg/` as SVGs, recoloured to production saffron `#EABC39`. The SVGs are auto-traced from the concept sheet and still deserve a designer pass for optical kerning before final use.
- Fonts: Changa One (headings) and Barlow / Barlow Semi Condensed (UI), all from Google Fonts under the SIL Open Font License.
