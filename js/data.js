/* Content for the feedback site and the prototype. */
window.KONG = (function () {
  const screens = [
    { n: "01", file: "01-settings-mouse", name: "Mouse & keyboard settings", short: "Mouse & keyboard", go: "settings:mk" },
    { n: "02", file: "02-settings-controller", name: "Controller settings", short: "Controller", go: "settings:ctrl" },
    { n: "03", file: "03-settings-audio", name: "Audio settings", short: "Audio", go: "settings:audio" },
    { n: "04", file: "04-settings-video", name: "Video settings", short: "Video", go: "settings:video" },
    { n: "05", file: "05-settings-accessibility", name: "Accessibility settings", short: "Accessibility", go: "settings:a11y" },
    { n: "06", file: "06-learn-controls", name: "Learn controls", short: "Learn controls", go: "learn" },
    { n: "07", file: "07-pause-menu", name: "Match menu", short: "Match menu", go: "menu" },
    { n: "08", file: "08-report-problem", name: "Report a problem", short: "Report", go: "report" },
    { n: "09", file: "09-inventory", name: "Inventory", short: "Inventory", go: "inventory" },
    { n: "10", file: "10-gameplay-hud", name: "Gameplay HUD", short: "HUD", go: "hud", states: [["Taking damage", "10-gameplay-hud"], ["Healing", "10-gameplay-hud-healing"]] },
    { n: "11", file: "11-world-map", name: "World map", short: "Map", go: "map" },
    { n: "12", file: "12-lobby", name: "Main lobby", short: "Lobby", go: "lobby" },
    { n: "13", file: "13-loading", name: "Loading", short: "Loading", go: "loading" },
    { n: "14", file: "14-match-results", name: "Match results", short: "Results", go: "results", added: true }
  ];

  const recording = { url: "https://drive.google.com/drive/folders/1LZDH-K8rVLhZFXK-hI5XCqMCnL3icMqc?usp=sharing", label: "Gameplay recording · RET", host: "Google Drive" };

  const v2screens = ["01-settings-mouse", "02-settings-controller", "03-settings-audio", "04-settings-video", "05-settings-accessibility", "06-learn-controls", "07-pause-menu", "08-report-problem", "09-inventory", "10-gameplay-hud", "11-world-map"];

  const downloads = {
    designMd: { path: "downloads/kong-design-system.md", name: "kong-design-system.md", label: "Design system", size: "19 KB" },
    prompts: { path: "downloads/kong-implementation-prompts.md", name: "kong-implementation-prompts.md", label: "Implementation prompts", size: "13 KB" },
    tokens: { path: "downloads/source/tokens.css", name: "kong-tokens.css", label: "Tokens", size: "1 KB", ext: "css" },
    logosZip: { path: "zip:logos", name: "kong-logos.zip", label: "All logos", size: "2.3 MB" },
    review: { path: "downloads/source/screen-review.md", name: "kong-screen-review.md", label: "Screen-by-screen review", size: "15 KB" },
    brief: { path: "downloads/source/implementation-brief.md", name: "kong-implementation-brief.md", label: "Implementation brief", size: "3 KB" },
    genPrompts: { path: "downloads/source/prompts.md", name: "kong-generation-prompts-v3.md", label: "Image generation prompts (v3)", size: "27 KB" },
    genPromptsV1: { path: "downloads/source/earlier-concept-prompts.md", name: "kong-generation-prompts-v1.md", label: "Image generation prompts (v1)", size: "" },
    gameplay: { path: "downloads/kong-gameplay-feedback-2026-10-10.md", name: "kong-gameplay-feedback-2026-10-10.md", label: "Gameplay feedback", size: "9 KB" },
    dsV2: { path: "downloads/source/v2-design-system-superseded.md", name: "kong-design-system-v2-superseded.md", label: "Design system v2 (superseded)", size: "" }
  };

  const logos = [
    { file: "kong-royale-lockup", title: "Kong Royale lockup", use: "Primary · dark surfaces", bg: "dark" },
    { file: "kong-of-duty-lockup", title: "Kong of Duty lockup", use: "Sister title · dark surfaces", bg: "dark" },
    { file: "kong-wordmark-saffron", title: "KONG master", use: "Parent brand · compact headers", bg: "dark" },
    { file: "kong-brow-icon", title: "Brow icon", use: "App / avatar · under 160px", bg: "dark", icon: true },
    { file: "kong-royale-lockup-navy", title: "Royale one-colour", use: "Light surfaces", bg: "light" },
    { file: "kong-wordmark-navy", title: "KONG one-colour", use: "Light surfaces", bg: "light" },
    { file: "kong-wordmark-ivory", title: "KONG ivory", use: "One colour on dark", bg: "dark" },
    { file: "kong-of-duty-lockup-navy", title: "Of Duty one-colour", use: "Light surfaces", bg: "light" }
  ];

  const colors = [
    ["background", "--kong-bg", "#101719", "Full-screen menu foundation"],
    ["surface", "--kong-surface", "#172022", "Panels and dialogs"],
    ["surface-raised", "--kong-surface-raised", "#253033", "Hover and selected surfaces"],
    ["border", "--kong-border", "#465052", "Subtle dividers and outlines"],
    ["text-primary", "--kong-text", "#EEEADF", "Labels, headings, important values"],
    ["text-secondary", "--kong-text-muted", "#A5B1A4", "Descriptions, supporting info"],
    ["accent", "--kong-accent", "#EABC39", "Primary action, active marker, health"],
    ["text-on-accent", "--kong-on-accent", "#101719", "Text inside yellow controls"],
    ["shield", "--kong-shield", "#58BCEB", "Shield and its icon"],
    ["success", "--kong-success", "#7AD7A5", "Saved / connected"],
    ["warning", "--kong-warning", "#FFC16E", "Match continues, caution"],
    ["danger", "--kong-danger", "#FF8C88", "Errors, destructive confirm"],
    ["focus", "--kong-focus", "#EEEADF", "Visible input focus ring"]
  ];

  const typeRoles = [
    ["Lobby display", "96 / 96", "Changa One", "display", 96, "Rule the island."],
    ["Settings / page title", "72 / 80", "Changa One", "title", 72, "Settings"],
    ["Context heading", "28 / 34", "Changa One", "ctx", 28, "Mouse sensitivity"],
    ["Control label", "20 / 28", "Medium", "label", 20, "Aim sensitivity"],
    ["Body / help", "18 / 27", "Regular", "body", 18, "Higher values feel faster, lower values offer more precise control."],
    ["Category navigation", "16 / 22", "Semibold", "nav", 16, "Mouse & keyboard   Controller   Audio"],
    ["Supporting text", "16 / 22", "Regular", "support", 16, "Saved on this device"],
    ["Keycap", "16 / 20", "Semibold", "key", 16, "ESC"],
    ["Important HUD number", "36 / 40", "Changa One", "hud", 36, "100   30 / 300"]
  ];

  // Prototype key bindings (action -> key code string)
  const defaultBindings = {
    forward: "KeyW", back: "KeyS", left: "KeyA", right: "KeyD",
    jump: "Space", sprint: "ShiftLeft", crouch: "KeyC", interact: "KeyE",
    reload: "KeyR", heal: "KeyQ", inventory: "Tab", map: "KeyM", ping: "KeyZ", pushToTalk: "KeyV"
  };
  const bindingLabels = {
    forward: "Move forward", back: "Move back", left: "Move left", right: "Move right",
    jump: "Jump / mantle", sprint: "Sprint", crouch: "Crouch / slide", interact: "Interact / pick up",
    reload: "Reload", heal: "Heal", inventory: "Inventory", map: "Map", ping: "Place ping", pushToTalk: "Push to talk"
  };

  const lessons = [
    { t: "Move", body: "Move around and look with the mouse. Click the game to capture the cursor.", keys: [{ cap: "wasd", lbl: "Move" }, { mouse: "look", lbl: "Look around" }] },
    { t: "Sprint, slide and crouch", body: "Hold sprint to run. Press crouch while sprinting to slide into cover.", keys: [{ b: ["sprint"], lbl: "Sprint" }, { b: ["crouch"], lbl: "Crouch / slide" }] },
    { t: "Mantle", body: "Jump at a ledge to climb onto it. Keep holding forward to pull yourself up.", keys: [{ b: ["forward", "jump"], plus: true, lbl: "Mantle" }] },
    { t: "Take a weapon", body: "Walk over a weapon and interact to pick it up. It goes into the next free slot.", keys: [{ b: ["interact"], lbl: "Pick up" }, { lit: ["1", "2", "3", "4", "5"], lbl: "Weapon slots" }] },
    { t: "Aim and fire", body: "Hold the right mouse button to aim down sights for accuracy. Click to fire.", keys: [{ mouse: "right", lbl: "Aim" }, { mouse: "left", lbl: "Fire" }] },
    { t: "Reload", body: "Reload before you push. Ammo for each weapon type is shown in your inventory.", keys: [{ b: ["reload"], lbl: "Reload" }] },
    { t: "Heal", body: "Heal out of sight. Healing stops if you sprint or fire.", keys: [{ b: ["heal"], lbl: "Heal" }] },
    { t: "Map pins", body: "Open the map and click to place a marker your squad can see. Right-click removes it.", keys: [{ b: ["map"], lbl: "Open map" }, { mouse: "left", lbl: "Place marker" }] },
    { t: "Inventory", body: "Open your inventory to equip, move or drop items. Drag works too.", keys: [{ b: ["inventory"], lbl: "Inventory" }, { lit: ["E", "R", "X"], lbl: "Equip · Move · Drop" }] },
    { t: "Jump from the plane", body: "Jump when the flight path crosses your target. Dive to fall faster, then deploy your glider.", keys: [{ b: ["jump"], lbl: "Jump" }, { b: ["sprint"], lbl: "Dive" }, { lit: ["X"], lbl: "Deploy glider" }] }
  ];

  const tips = [
    { keys: [["sprint", "Dive"], ["#X", "Deploy glider"]], eyebrow: "Drop tip", text: "Jump from the plane to reach the island faster." },
    { keys: [["reload", "Reload"]], eyebrow: "Combat tip", text: "Reload behind cover; the Bunchgun holds 30 rounds." },
    { keys: [["map", "Map"]], eyebrow: "Squad tip", text: "Place a marker so your squad knows where you're heading." },
    { keys: [["heal", "Heal"]], eyebrow: "Survival tip", text: "Healing stops if you sprint or fire." }
  ];

  const items = {
    bunchgun: { id: "bunchgun", name: "Bunchgun", rarity: "Common", damage: 24, mag: 30, ammo: "light", img: "img/items/bunchgun.png" },
    nub: { id: "nub", name: "Nub", rarity: "Rare", damage: 29, mag: 12, ammo: "heavy", img: "img/items/nub.png" }
  };

  const themes = [
    ["Composition over decoration", "Fewer containers, clearer typographic levels, quieter metadata and task-specific layouts."],
    ["One settings shell", "All five categories share title, tabs, control column and footer. Local tabs show only their own rows."],
    ["Honest state", "Menu says Match continues. Loading reports real phases. Report shows Sending, Sent or Retry."],
    ["Saffron with purpose", "Yellow marks the one primary action or the active selection. Nothing else."],
    ["Input parity", "Keyboard, controller and pointer reach everything. Keycaps follow the player's real bindings."],
    ["One brand master", "One KONG wordmark; ROYALE and OF DUTY are descriptors under it, never redrawn."]
  ];

  // Toon design system: clean but cartoonish, built on the original Kong Royale colours.
  const toon = {
    colors: [
      ["background", "--kong-bg", "#071422", "Deep navy foundation, from the original menus"],
      ["surface", "--kong-surface", "#0E2A3D", "Panels, tiles and dialogs"],
      ["surface-raised", "--kong-surface-raised", "#17405A", "Hover, selected tiles, secondary buttons"],
      ["outline", "--kong-outline", "#04101A", "Thick outlines and hard drop shadows"],
      ["text-primary", "--kong-text", "#FFF8E7", "Labels, headings, values"],
      ["text-secondary", "--kong-text-muted", "#A9C6DA", "Descriptions, inactive tabs"],
      ["banana", "--kong-accent", "#FFD21A", "Primary action, selection, health"],
      ["banana-shade", "--kong-accent-shade", "#F2B800", "Bottom of the yellow gradient"],
      ["sky", "--kong-sky", "#4FB6EA", "Lobby sky and friendly highlights"],
      ["shield", "--kong-shield", "#3EC4FF", "Shield bar and shield hit icons"],
      ["success", "--kong-success", "#5BE37D", "Saved, connected, switch on"],
      ["warning", "--kong-warning", "#FF9F1C", "Match continues, caution"],
      ["danger", "--kong-danger", "#FF4D5E", "Errors, Leave match, damage"],
      ["common", "--kong-rarity-common", "#4CC35A", "Common item cards"],
      ["rare", "--kong-rarity-rare", "#2F8BFF", "Rare item cards"]
    ],
    typeRoles: [
      ["Lobby display", "110 / 100", "Lilita One + 6px outline", "display", 110, "Rule the island!"],
      ["Page title", "88 / 92", "Lilita One + 5px outline", "title", 88, "Settings"],
      ["Context heading", "32 / 36", "Lilita One", "ctx", 32, "Mouse sensitivity"],
      ["Control label", "21 / 28", "Nunito ExtraBold", "label", 21, "Aim sensitivity"],
      ["Body / help", "19 / 28", "Nunito SemiBold", "body", 19, "Higher values feel faster, lower values give more precise control."],
      ["Tabs & pills", "17 / 22", "Nunito Black", "nav", 17, "Mouse & keyboard   Controller   Audio"],
      ["Supporting text", "16 / 22", "Nunito Bold", "support", 16, "Saved on this device"],
      ["Keycap", "17 / 20", "Nunito Black", "key", 17, "ESC"],
      ["HUD number", "40 / 44", "Lilita One + 4px outline", "hud", 40, "100   30 / 300"]
    ],
    downloads: {
      designMd: { path: "downloads/kong-design-system-toon.md", name: "kong-design-system-toon.md", label: "Toon design system", size: "12 KB" },
      prompts: { path: "downloads/kong-implementation-prompts-toon.md", name: "kong-implementation-prompts-toon.md", label: "Toon implementation prompts", size: "12 KB" },
      tokens: { path: "downloads/kong-toon-tokens.css", name: "kong-toon-tokens.css", label: "Toon tokens", size: "2 KB" }
    }
  };

  return { toon, screens, recording, v2screens, downloads, logos, colors, typeRoles, defaultBindings, bindingLabels, lessons, tips, items, themes };
})();
