/* Kong Royale interactive prototype.
   One 1920×1080 stage, one overlay stack, one input owner. */
window.Game = (function () {
  const K = window.KONG;
  const $ = (s, r) => (r || document).querySelector(s);
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const now = () => performance.now();
  const store = {
    get(k, d) { try { const v = localStorage.getItem("kong-proto-" + k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem("kong-proto-" + k, JSON.stringify(v)); } catch (e) { /* storage unavailable */ } },
    clear() { try { Object.keys(localStorage).filter((k) => k.startsWith("kong-proto-")).forEach((k) => localStorage.removeItem(k)); } catch (e) { } }
  };

  /* ------------------------------------------------------------------
     Icons
  ------------------------------------------------------------------ */
  const I = {
    check: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12.5l5 5L20 6.5"/></svg>',
    alert: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 7v6M12 16.5v.5" stroke-linecap="round"/></svg>',
    back: '<svg width="34" height="20" viewBox="0 0 34 20" fill="none" stroke="currentColor" stroke-width="2"><path d="M33 10H3M11 2L3 10l8 8"/></svg>',
    heart: '<svg viewBox="0 0 24 24"><path fill="#EABC39" d="M12 21s-7.5-4.6-9.6-9.3C.9 8.3 3 4.5 6.6 4.5c2.2 0 3.8 1.2 5.4 3 1.6-1.8 3.2-3 5.4-3 3.6 0 5.7 3.8 4.2 7.2C19.5 16.4 12 21 12 21z"/></svg>',
    shield: '<svg viewBox="0 0 24 24"><path fill="#58BCEB" d="M12 2l8 3v6c0 5.2-3.4 9.4-8 11-4.6-1.6-8-5.8-8-11V5l8-3z"/></svg>',
    pencil: '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M3 17.3V21h3.7L17.8 9.9l-3.7-3.7L3 17.3zM20.7 7a1 1 0 000-1.4l-2.3-2.3a1 1 0 00-1.4 0l-1.8 1.8 3.7 3.7L20.7 7z"/></svg>',
    target: '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="2.5"/><path d="M12 1v5M12 18v5M1 12h5M18 12h5"/></svg>',
    book: '<svg width="28" height="24" viewBox="0 0 28 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M14 5c-3-2-7-2.5-12-2v17c5-.5 9 0 12 2 3-2 7-2.5 12-2V3c-5-.5-9 0-12 2zM14 5v17"/></svg>',
    clock: '<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2" stroke-linecap="round"/></svg>',
    rifle: '<svg viewBox="0 0 64 28" fill="currentColor"><path d="M2 12h8l2-3h22l2-3h6v3h14v4H44l-3 3h-6l-2 7h-6l1-7h-8l-6 7H6l6-8H2z"/></svg>',
    pistol: '<svg viewBox="0 0 64 28" fill="currentColor"><path d="M14 6h34l2 3h4v5H40l-3 3h-6l-3 9h-9l3-10h-6l-2-2z"/></svg>',
    pin: '<svg viewBox="0 0 34 46"><path fill="#EABC39" stroke="#101719" stroke-width="2" d="M17 44S3 27 3 17a14 14 0 0128 0c0 10-14 27-14 27z"/><circle cx="17" cy="17" r="5" fill="#101719"/></svg>',
    bullet: (c) => `<svg viewBox="0 0 18 34"><path fill="${c}" d="M9 1c4 4 6 9 6 14v18H3V15C3 10 5 5 9 1z"/></svg>`,
    mouse: (hl) => `<svg class="mglyph" viewBox="0 0 18 28" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="1" y="1" width="16" height="26" rx="8"/><path d="M9 1v9M1 10h16"/>${hl === "left" ? '<path d="M1.8 9.2V9a7.2 7.2 0 016.4-7.2v7.4z" fill="#EABC39" stroke="none"/>' : ""}${hl === "right" ? '<path d="M16.2 9.2V9a7.2 7.2 0 00-6.4-7.2v7.4z" fill="#EABC39" stroke="none"/>' : ""}${hl === "wheel" ? '<rect x="7.5" y="4" width="3" height="5" rx="1.5" fill="#EABC39" stroke="none"/>' : ""}</svg>`
  };

  function mouseBig(kind) {
    const hl = kind === "left" ? '<path d="M41 62V58a33 33 0 0130-33v37z" fill="#EABC39"/>' : kind === "right" ? '<path d="M109 62V58a33 33 0 00-30-33v37z" fill="#EABC39"/>' : "";
    const arrows = kind === "look" ? '<g stroke="#A5B1A4" stroke-width="3" fill="none" stroke-linecap="round"><path d="M18 92h-14M10 84l-8 8 8 8M132 92h14M140 84l8 8-8 8M75 12V-2M67 6l8-8 8 8M75 172v14M67 178l8 8 8-8"/></g>' : "";
    return `<svg width="150" height="190" viewBox="0 -4 150 194" fill="none">${arrows}<rect x="41" y="25" width="68" height="134" rx="34" stroke="#EEEADF" stroke-width="3" fill="rgba(16,23,25,.6)"/>${hl}<path d="M75 25v37M41 62h68" stroke="#EEEADF" stroke-width="3"/><rect x="70" y="36" width="10" height="18" rx="5" stroke="#EEEADF" stroke-width="2.5"/></svg>`;
  }

  /* ------------------------------------------------------------------
     Keys
  ------------------------------------------------------------------ */
  function keyLabel(code) {
    if (!code) return "—";
    const map = { Space: "Space", ShiftLeft: "Shift", ShiftRight: "R-Shift", ControlLeft: "Ctrl", ControlRight: "R-Ctrl", AltLeft: "Alt", AltRight: "R-Alt", Tab: "Tab", Escape: "Esc", Enter: "Enter", Backspace: "Bksp", CapsLock: "Caps", ArrowUp: "↑", ArrowDown: "↓", ArrowLeft: "←", ArrowRight: "→", Backquote: "`", Minus: "-", Equal: "=", BracketLeft: "[", BracketRight: "]", Semicolon: ";", Quote: "'", Comma: ",", Period: ".", Slash: "/", Backslash: "\\", Mouse3: "Mouse 3", Mouse4: "Mouse 4", Mouse5: "Mouse 5" };
    if (map[code]) return map[code];
    if (code.startsWith("Key")) return code.slice(3);
    if (code.startsWith("Digit")) return code.slice(5);
    if (code.startsWith("Numpad")) return "Num " + code.slice(6);
    return code;
  }
  const keycap = (code, cls) => `<span class="k-key ${cls || ""} ${code ? "" : "unbound"}">${esc(keyLabel(code))}</span>`;
  const lit = (t, cls) => `<span class="k-key ${cls || ""}">${esc(t)}</span>`;

  /* ------------------------------------------------------------------
     Settings model
  ------------------------------------------------------------------ */
  const pct = (v) => Math.round(v) + "%";
  const mult = (v) => v.toFixed(2) + "x";
  const GFX = { Low: { shadows: "Low", textures: "Low", foliage: "Low", effects: "Low", aa: "FXAA" }, Medium: { shadows: "Medium", textures: "Medium", foliage: "Medium", effects: "Medium", aa: "FXAA" }, High: { shadows: "High", textures: "High", foliage: "High", effects: "High", aa: "TAA" }, Ultra: { shadows: "Ultra", textures: "Ultra", foliage: "Ultra", effects: "Ultra", aa: "TAA" } };
  const Q4 = ["Low", "Medium", "High", "Ultra"];

  const CATS = [
    { id: "mk", name: "Mouse & keyboard", secs: [
      { name: "Mouse", rows: [
        { id: "mouseSens", label: "Mouse sensitivity", type: "slider", min: 0.05, max: 3, step: 0.05, def: 0.7, fmt: mult, help: { eb: "Input", t: "Mouse sensitivity", p: ["Rotation speed when looking around (raw input: no OS acceleration).", "Higher values feel faster, lower values offer more precise control. Try it: the firing range uses this value."], viz: "mouse" } },
        { id: "aimSens", label: "Aim sensitivity", type: "slider", min: 0.05, max: 3, step: 0.05, def: 1, fmt: mult, help: { eb: "Input", t: "Aim sensitivity", p: ["Multiplier applied while aiming down sights.", "1.00x matches your hip-fire sensitivity."], viz: "mouse" } },
        { id: "scopeSens", label: "Scope sensitivity", type: "slider", min: 0.05, max: 3, step: 0.05, def: 1, fmt: mult, help: { eb: "Input", t: "Scope sensitivity", p: ["Multiplier applied when using a magnified scope.", "Lower values steady long-range shots."], viz: "mouse" } },
        { id: "invertY", label: "Invert vertical look", type: "cycle", options: ["Off", "On"], def: "Off", help: { eb: "Input", t: "Invert vertical look", p: ["Moving the mouse forward looks down instead of up."], viz: "mouse" } }
      ] },
      { name: "Behavior", rows: [
        { id: "aimMode", label: "Aim", type: "seg", options: ["Hold", "Toggle"], def: "Hold", help: { eb: "Behavior", t: "Aim", p: ["Hold: aim while the button is held.", "Toggle: press once to aim, again to stop. The firing range follows this setting."] } },
        { id: "crouchMode", label: "Crouch", type: "seg", options: ["Hold", "Toggle"], def: "Toggle", help: { eb: "Behavior", t: "Crouch", p: ["Toggle keeps you crouched until you press crouch again or sprint."] } },
        { id: "sprintMode", label: "Sprint", type: "seg", options: ["Hold", "Toggle", "Auto"], def: "Hold", help: { eb: "Behavior", t: "Sprint", p: ["Auto sprints whenever you move forward and are not aiming."] } },
        { id: "rawInput", label: "Raw mouse input", type: "switch", def: true, help: { eb: "Behavior", t: "Raw mouse input", p: ["Reads the mouse directly and ignores operating system acceleration.", "Keep this on for consistent aim."] } }
      ] },
      { name: "Bindings", rows: Object.keys(K.defaultBindings).filter((a) => a !== "pushToTalk").map((a) => ({ id: "bind." + a, label: K.bindingLabels[a], type: "bind", action: a, help: { eb: "Bindings", t: K.bindingLabels[a], p: ["Select a slot, then press a key or mouse button.", "Esc cancels. Backspace clears. If the key is already used, it moves here and the other action is marked Unbound."], viz: "bind" } })) }
    ] },
    { id: "ctrl", name: "Controller", secs: [
      { name: "Layout", rows: [
        { id: "prompts", label: "Button prompts", type: "seg", options: ["Auto", "Xbox", "PlayStation", "Nintendo"], def: "Auto", help: { eb: "Controller", t: "Button prompts", p: ["Auto matches the glyphs to the controller you are using."], viz: "pad" } },
        { id: "padLayout", label: "Controller layout", type: "cycle", options: ["Standard", "Tactical", "Bumper jumper"], def: "Standard", help: { eb: "Controller", t: "Controller layout", p: ["Changes which buttons perform core actions. The diagram shows the current mapping."], viz: "pad" } },
        { id: "swapSticks", label: "Swap sticks", type: "switch", def: false, help: { eb: "Controller", t: "Swap sticks", p: ["Move with the right stick and look with the left."], viz: "pad" } },
        { id: "vibration", label: "Vibration", type: "switch", def: true, help: { eb: "Controller", t: "Vibration", p: ["Rumble when firing, taking damage and landing."], viz: "pad" } }
      ] },
      { name: "Look", rows: [
        { id: "lookSens", label: "Look sensitivity", type: "slider", min: 0.1, max: 3, step: 0.05, def: 1, fmt: mult, help: { eb: "Look", t: "Look sensitivity", p: ["How fast the camera turns at full stick deflection."], viz: "stick" } },
        { id: "adsSens", label: "Aim sensitivity", type: "slider", min: 0.1, max: 3, step: 0.05, def: 0.8, fmt: mult, help: { eb: "Look", t: "Aim sensitivity", p: ["Turn speed while aiming down sights."], viz: "stick" } },
        { id: "curve", label: "Response curve", type: "seg", options: ["Standard", "Linear", "Dynamic"], def: "Standard", help: { eb: "Look", t: "Response curve", p: ["Standard gives fine control near the centre of the stick.", "Linear maps stick movement directly to turn speed."], viz: "curve" } },
        { id: "invertYc", label: "Invert vertical look", type: "switch", def: false, help: { eb: "Look", t: "Invert vertical look", p: ["Pushing the stick up looks down."], viz: "stick" } }
      ] },
      { name: "Deadzones", rows: [
        { id: "deadL", label: "Left stick deadzone", type: "slider", min: 0, max: 30, step: 1, def: 10, fmt: pct, help: { eb: "Deadzones", t: "Left stick deadzone", p: ["Ignores small stick movement to stop drift.", "Lower it until your character moves on its own, then raise it slightly."], viz: "dead" } },
        { id: "deadR", label: "Right stick deadzone", type: "slider", min: 0, max: 30, step: 1, def: 8, fmt: pct, help: { eb: "Deadzones", t: "Right stick deadzone", p: ["Ignores small stick movement to stop the camera drifting."], viz: "dead" } }
      ] }
    ] },
    { id: "audio", name: "Audio", secs: [
      { name: "Volume", rows: [
        { id: "master", label: "Master volume", type: "slider", min: 0, max: 100, step: 1, def: 13, fmt: pct, help: { eb: "Mix", t: "Master volume", p: ["Overall loudness of the game. Every other channel is mixed beneath it.", "Use Preview on Hit marker to hear the current mix."], viz: "speaker" } },
        { id: "combat", label: "Combat & world", type: "slider", min: 0, max: 100, step: 1, def: 100, fmt: pct, help: { eb: "Mix", t: "Combat & world", p: ["Gunfire, footsteps, impacts and the island itself."], viz: "speaker" } },
        { id: "ui", label: "Interface", type: "slider", min: 0, max: 100, step: 1, def: 100, fmt: pct, help: { eb: "Mix", t: "Interface", p: ["Menu ticks and confirmations. Move through this list to hear it."], viz: "speaker" } },
        { id: "ambience", label: "Island ambience", type: "slider", min: 0, max: 100, step: 1, def: 27, fmt: pct, help: { eb: "Mix", t: "Island ambience", p: ["Wind, surf, birds and distant wildlife."], viz: "speaker" } },
        { id: "radio", label: "Tuk-tuk radio", type: "slider", min: 0, max: 100, step: 1, def: 17, fmt: pct, help: { eb: "Mix", t: "Tuk-tuk radio", p: ["Music from vehicle radios."], viz: "speaker" } },
        { id: "dynRange", label: "Dynamic range", type: "seg", options: ["Full", "Reduced", "Night"], def: "Full", help: { eb: "Mix", t: "Dynamic range", p: ["Full keeps the difference between quiet and loud sounds. Night compresses it for low-volume play."], viz: "speaker" } },
        { id: "hitMarker", label: "Hit marker", type: "cycle", options: ["Default", "Classic", "Off"], def: "Default", preview: true, help: { eb: "Mix", t: "Hit marker", p: ["The sound when your shot lands. Select Preview to hear it at the current mix."], viz: "speaker" } }
      ] },
      { name: "Voice", rows: [
        { id: "voice", label: "Voice chat", type: "switch", def: true, help: { eb: "Voice", t: "Voice chat", p: ["Talk to your squad. Turning this off also mutes incoming voice."], viz: "mic" } },
        { id: "chatMode", label: "Chat mode", type: "seg", options: ["Push to talk", "Open mic"], def: "Push to talk", help: { eb: "Voice", t: "Chat mode", p: ["Push to talk sends voice only while the key is held."], viz: "mic" } },
        { id: "bind.pushToTalk", label: "Push to talk key", type: "bind", action: "pushToTalk", help: { eb: "Voice", t: "Push to talk key", p: ["Hold to speak to your squad."], viz: "bind" } },
        { id: "inputDevice", label: "Input device", type: "cycle", options: ["System default"], def: "System default", help: { eb: "Voice", t: "Input device", p: ["Your microphones are listed here in the game. This preview can't read your devices."], viz: "mic" } },
        { id: "voiceVol", label: "Incoming voice", type: "slider", min: 0, max: 100, step: 1, def: 80, fmt: pct, help: { eb: "Voice", t: "Incoming voice", p: ["Loudness of your squad's voices."], viz: "mic" } },
        { id: "micTest", label: "Mic test", type: "mic", help: { eb: "Voice", t: "Mic test", p: ["Speak normally and watch the meter. In the game this reads your real microphone.", "The meter here is simulated because this preview has no microphone access."], viz: "mic" } }
      ] }
    ] },
    { id: "video", name: "Video", secs: [
      { name: "Display", rows: [
        { id: "frameLimit", label: "Frame rate limit", type: "cycle", options: ["Display", "60", "120", "144", "240", "Unlimited"], def: "Display", help: { eb: "Display", t: "Frame rate limit", p: ["Display matches your monitor's refresh rate."], viz: "hw" } },
        { id: "res3d", label: "3D resolution", type: "slider", min: 50, max: 100, step: 5, def: 100, fmt: pct, help: { eb: "Display", t: "3D resolution", p: ["Renders the world below native resolution for more frames. The interface stays sharp."], viz: "hw" } },
        { id: "dynRes", label: "Dynamic resolution", type: "switch", def: false, help: { eb: "Display", t: "Dynamic resolution", p: ["Lowers 3D resolution automatically during heavy scenes to hold the frame rate limit."], viz: "hw" } },
        { id: "fov", label: "Field of view", type: "slider", min: 80, max: 120, step: 1, def: 120, fmt: (v) => Math.round(v) + "°", help: { eb: "Display", t: "Field of view", p: ["How much of the world you see horizontally. Wider shows more at the edges; narrower makes targets larger.", "The firing range uses this value."], viz: "fov" } },
        { id: "showFps", label: "Show FPS", type: "switch", def: false, help: { eb: "Display", t: "Show FPS", p: ["Shows frames per second in the top-right corner of the HUD."], viz: "hw" } },
        { id: "netStats", label: "Network stats", type: "cycle", options: ["Hidden", "Ping", "Full"], def: "Hidden", help: { eb: "Display", t: "Network stats", p: ["Ping shows latency. Full adds packet loss. Values in this preview are simulated."], viz: "hw" } },
        { id: "matchStats", label: "Match stats", type: "cycle", options: ["Auto", "Personal", "Squad", "Hidden"], def: "Auto", help: { eb: "HUD", t: "Match stats", p: ["Your kills and damage in the top-right corner. Squad adds the kills your whole squad has combined, plus your assists.", "Auto shows Squad in Trios matches and Personal in Solo and the firing range."], viz: "mstats" } }
      ] },
      { name: "Graphics", rows: [
        { id: "gfxPreset", label: "Quality preset", type: "cycle", options: ["Low", "Medium", "High", "Ultra", "Custom"], def: "High", help: { eb: "Graphics", t: "Quality preset", p: ["Sets every option below. Changing one option switches the preset to Custom."], viz: "gfx" } },
        { id: "shadows", label: "Shadows", type: "cycle", options: Q4, def: "High", help: { eb: "Graphics", t: "Shadows", p: ["Shadow sharpness and draw distance. Large impact on performance."], viz: "gfx" } },
        { id: "textures", label: "Textures", type: "cycle", options: Q4, def: "High", help: { eb: "Graphics", t: "Textures", p: ["Texture detail. Mostly limited by video memory."], viz: "gfx" } },
        { id: "foliage", label: "Foliage density", type: "cycle", options: Q4, def: "High", help: { eb: "Graphics", t: "Foliage density", p: ["Amount of grass and jungle undergrowth drawn at distance."], viz: "gfx" } },
        { id: "effects", label: "Effects", type: "cycle", options: Q4, def: "High", help: { eb: "Graphics", t: "Effects", p: ["Smoke, explosions and particle detail."], viz: "gfx" } },
        { id: "aa", label: "Anti-aliasing", type: "cycle", options: ["Off", "FXAA", "TAA"], def: "TAA", help: { eb: "Graphics", t: "Anti-aliasing", p: ["Smooths jagged edges. TAA is smoothest; FXAA is cheaper."], viz: "gfx" } }
      ] }
    ] },
    { id: "a11y", name: "Accessibility", secs: [
      { name: "Comfort & readability", rows: [
        { id: "reducedMotion", label: "Reduced camera motion", type: "switch", def: false, help: { eb: "Comfort", t: "Reduced camera motion", p: ["Removes weapon kick, camera smoothing and non-essential menu animation."], viz: "a11y" } },
        { id: "hudScale", label: "HUD scale", type: "slider", min: 70, max: 150, step: 5, def: 100, fmt: pct, help: { eb: "Readability", t: "HUD scale", p: ["Size of health, ammo, minimap and compass. The preview uses the real HUD parts."], viz: "a11y" } },
        { id: "textScale", label: "Text scale", type: "slider", min: 80, max: 150, step: 5, def: 100, fmt: pct, help: { eb: "Readability", t: "Text scale", p: ["Size of menu text. Larger text reflows the menu rather than magnifying it."], viz: "a11y" } }
      ] }
    ] }
  ];
  const ROWS = {};
  CATS.forEach((c) => c.secs.forEach((s) => s.rows.forEach((r) => { ROWS[r.id] = r; r.cat = c.id; })));
  function defaults() { const d = {}; Object.values(ROWS).forEach((r) => { if ("def" in r) d[r.id] = r.def; }); return d; }

  /* ------------------------------------------------------------------
     State
  ------------------------------------------------------------------ */
  let S;
  function fresh() {
    return {
      base: "lobby", over: [], mode: "range",
      callsign: store.get("callsign", "RET"), squad: "trios", lobbyTab: "play", editCs: false, search: null,
      set: Object.assign(defaults(), store.get("settings", {})),
      bind: Object.assign({}, K.defaultBindings, store.get("bindings", {})),
      inv: ["bunchgun", "nub", null, null, null], equipped: "bunchgun", invSel: 1, moving: null, dropped: null,
      mag: { bunchgun: 30, nub: 12 }, reserve: { light: 300, heavy: 40, shells: 48, rockets: 8 },
      health: 100, shield: 0, reloadUntil: 0, healUntil: 0, aiming: false,
      look: { x: 0, y: 0, tx: 0, ty: 0 },
      stats: { shots: 0, hits: 0, reloads: 0, dmg: 0, t0: Date.now() },
      hints: { fire: false, reload: false, inv: false, map: false },
      marker: null, lesson: 0, lessonsDone: [],
      report: { cat: null, text: "", state: "idle", err: "" },
      loading: null, matchT0: Date.now()
    };
  }

  let stage, hostWrap, onChange = () => {}, compare = { mode: "off", op: 0.55 }, failNextSend = false;
  let L = {};           // layer elements
  let hudEls = null;    // cached HUD element refs
  let capture = null;   // binding capture {action}
  let locked = false, selfUnlock = false, lockTried = false, autoMenuAt = 0;
  let raf = 0, fps = { t: now(), n: 0, v: 60 };
  let timers = [];
  const later = (fn, ms) => { const t = setTimeout(fn, ms); timers.push(t); return t; };

  /* ------------------------------------------------------------------
     Audio (WebAudio, started on first gesture)
  ------------------------------------------------------------------ */
  let AC = null;
  function audio() { if (!AC) { try { AC = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { AC = null; } } if (AC && AC.state === "suspended") AC.resume(); return AC; }
  function vol(ch) { return (S.set.master / 100) * ((S.set[ch] == null ? 100 : S.set[ch]) / 100); }
  function tone(freq, dur, type, gain, ch, slide) {
    const ac = audio(); if (!ac) return; const g = gain * vol(ch); if (g <= 0.0005) return;
    const o = ac.createOscillator(), a = ac.createGain(); o.type = type; o.frequency.value = freq;
    if (slide) o.frequency.exponentialRampToValueAtTime(slide, ac.currentTime + dur);
    a.gain.setValueAtTime(g, ac.currentTime); a.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + dur);
    o.connect(a).connect(ac.destination); o.start(); o.stop(ac.currentTime + dur + 0.02);
  }
  function noise(dur, gain, ch, hp) {
    const ac = audio(); if (!ac) return; const g = gain * vol(ch); if (g <= 0.0005) return;
    const len = Math.floor(ac.sampleRate * dur), buf = ac.createBuffer(1, len, ac.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3);
    const src = ac.createBufferSource(); src.buffer = buf; const f = ac.createBiquadFilter(); f.type = "lowpass"; f.frequency.value = hp || 1800;
    const a = ac.createGain(); a.gain.value = g; src.connect(f).connect(a).connect(ac.destination); src.start();
  }
  const sfx = {
    tick() { tone(1900, 0.03, "sine", 0.25, "ui"); },
    select() { tone(1200, 0.06, "triangle", 0.3, "ui", 1600); },
    back() { tone(900, 0.06, "triangle", 0.25, "ui", 600); },
    fire() { noise(0.12, 1.4, "combat", 2400); tone(120, 0.08, "square", 0.25, "combat", 60); },
    empty() { tone(2400, 0.02, "square", 0.2, "combat"); },
    hit() { const m = S.set.hitMarker; if (m === "Off") return; if (m === "Classic") tone(900, 0.07, "square", 0.35, "combat"); else { tone(1500, 0.05, "sine", 0.6, "combat"); later(() => tone(2100, 0.04, "sine", 0.35, "combat"), 30); } },
    reload() { noise(0.05, 0.6, "combat", 4000); later(() => noise(0.06, 0.7, "combat", 3000), 700); },
    hurt() { tone(220, 0.2, "sawtooth", 0.25, "combat", 110); }
  };

  /* ------------------------------------------------------------------
     Mount & layout
  ------------------------------------------------------------------ */
  function mount(stageEl, wrapEl) {
    stage = stageEl; hostWrap = wrapEl; S = fresh();
    stage.innerHTML = `<div class="layer" id="k-base"></div><div class="layer" id="k-hud"></div><div class="layer" id="k-over"></div><div class="layer" id="k-dialog" style="pointer-events:none"></div><div class="layer" id="k-toast" style="pointer-events:none"></div><img class="compare-overlay" id="k-compare" alt="" hidden>`;
    L = { base: $("#k-base", stage), hud: $("#k-hud", stage), over: $("#k-over", stage), dialog: $("#k-dialog", stage), toast: $("#k-toast", stage), compare: $("#k-compare", stage) };
    bindEvents();
    new ResizeObserver(fit).observe(hostWrap); fit();
    applyGlobals();
    renderAll();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { placeInk($(".st-cats", L.over), 0, true); placeInk($(".st-sub", L.over), 40, true); placeInk($(".lb-nav", L.base), 0, true); const o = top(); if (o && o.id === "menu") placeVInk($(".mn", L.over), `.mn-item[data-i="${o.sel}"]`, 14, true); placeVInk($(".lc-list", L.over), "button.on", 8, true); });
  }
  let scale = 1;
  function fit() {
    if (!hostWrap) return; const w = hostWrap.clientWidth, h = hostWrap.clientHeight; if (!w || !h) return;
    scale = Math.min(w / 1920, h / 1080);
    stage.style.transform = `translate(-50%,-50%) scale(${scale})`;
  }
  function toStage(e) { const r = stage.getBoundingClientRect(); return { x: (e.clientX - r.left) / scale, y: (e.clientY - r.top) / scale }; }
  function applyGlobals() {
    stage.style.setProperty("--ts", S.set.textScale / 100);
    stage.style.setProperty("--hs", S.set.hudScale / 100);
    stage.classList.toggle("reduced-motion", !!S.set.reducedMotion);
  }

  /* ------------------------------------------------------------------
     Navigation
  ------------------------------------------------------------------ */
  const top = () => S.over[S.over.length - 1] || null;
  function push(o) { releaseLock(); S.over.push(o); navDir = 1; sfx.select(); renderOver(); }
  function pop() {
    if (dialogOpen) return closeDialog();
    S.over.pop(); navDir = -1; sfx.back(); renderOver();
    if (!S.over.length && S.base === "loading" && S.loading && S.loading.done) finishLoading();
  }
  function closeAll() { S.over = []; navDir = -1; renderOver(); }
  function setBase(b) { S.base = b; clearTimers(); renderAll(); }
  function clearTimers() { timers.forEach(clearTimeout); timers = []; }

  function go(key) {
    clearTimers(); closeDialogSilently(); capture = null;
    const [k, arg] = key.split(":");
    S.over = [];
    if (k === "lobby") { S.base = "lobby"; S.lobbyTab = "play"; S.search = null; }
    else if (k === "loading") { startLoading("match", true); return; }
    else if (k === "hud") { enterHud(arg === "match" ? "match" : "range"); return; }
    else if (k === "menu") { enterHud("range", true); S.over = [{ id: "menu", sel: 0 }]; }
    else if (k === "report") { enterHud("range", true); S.over = [{ id: "menu", sel: 3 }, { id: "report" }]; S.report = { cat: null, text: "", state: "idle", err: "" }; }
    else if (k === "inventory") { enterHud("range", true); S.over = [{ id: "inventory" }]; }
    else if (k === "map") { enterHud("range", true); S.over = [{ id: "map" }]; }
    else if (k === "learn") { S.base = "lobby"; S.over = [{ id: "learn" }]; }
    else if (k === "results") { S.base = "results"; S.ratings = {}; }
    else if (k === "settings") { enterHud("range", true); S.over = [{ id: "menu", sel: 1 }, { id: "settings", cat: arg || "mk", sec: 0, row: 0 }]; }
    renderAll();
  }
  function enterHud(mode, silent) {
    S.base = "hud"; S.mode = mode; S.matchT0 = Date.now(); S.over = [];
    S.match = { kills: 0, assists: 0, dmg: 0, squadKills: 0, alive: 50, squads: 17, lastHit: 0, tHp: {} };
    S.hints = { fire: false, reload: false, inv: false, map: false };
    if (!silent) renderAll();
  }

  /* ------------------------------------------------------------------
     Render orchestration
  ------------------------------------------------------------------ */
  /* Transitions: the outgoing screen is moved into a "ghost" layer that animates out
     while the incoming screen animates in. Same-screen updates morph in place. */
  let shownBase = null, shownOver = null, navDir = 0;
  const STILL = /[?&]still\b/.test(location.search);
  const motionOff = () => STILL || !!(S && S.set.reducedMotion);
  function ghost(layer, cls, ms) {
    if (!layer.firstChild) return;
    if (motionOff()) { layer.innerHTML = ""; return; }
    const g = document.createElement("div");
    g.className = "layer k-ghost " + cls; g.setAttribute("aria-hidden", "true");
    while (layer.firstChild) g.appendChild(layer.firstChild);
    layer.after(g); setTimeout(() => g.remove(), ms || 320);
  }
  function swap(el) { if (!el || motionOff()) return; el.classList.remove("swap"); void el.offsetWidth; el.classList.add("swap"); }
  function placeInk(c, w, instant) {
    if (!c) return;
    const a = c.querySelector(":scope > .on");
    let ink = c.querySelector(":scope > .k-ink");
    if (!ink) { ink = document.createElement("i"); ink.className = "k-ink"; c.appendChild(ink); instant = true; }
    c.classList.add("inked");
    if (!a) { ink.style.opacity = 0; return; }
    if (instant) ink.style.transition = "none";
    ink.style.opacity = 1; ink.style.left = a.offsetLeft + "px"; ink.style.width = (w || a.offsetWidth) + "px";
    if (instant) { void ink.offsetWidth; ink.style.transition = ""; }
  }
  function placeVInk(c, sel, inset, instant) {
    if (!c) return;
    const a = c.querySelector(sel); let ink = c.querySelector(":scope > .k-vink");
    if (!ink) { ink = document.createElement("i"); ink.className = "k-vink"; c.appendChild(ink); instant = true; }
    if (!a) { ink.style.opacity = 0; return; }
    if (instant) ink.style.transition = "none";
    ink.style.opacity = 1; ink.style.top = a.offsetTop + inset + "px"; ink.style.height = a.offsetHeight - inset * 2 + "px";
    if (instant) { void ink.offsetWidth; ink.style.transition = ""; }
  }
  function renderAll() {
    const baseChanged = shownBase !== null && S.base !== shownBase;
    if (baseChanged) { ghost(L.base, "leave-fade", 460); if (!L.hud.classList.contains("k-hidden")) ghost(L.hud, "leave-fade", 460); else L.hud.innerHTML = ""; }
    else { L.base.innerHTML = ""; L.hud.innerHTML = ""; }
    hudEls = null;
    if (S.base === "lobby") renderLobby();
    else if (S.base === "loading") renderLoading();
    else if (S.base === "hud") { renderWorld(); renderHud(); }
    else if (S.base === "results") renderResults();
    if (baseChanged && !motionOff()) { [L.base, L.hud].forEach((l) => l.firstElementChild && l.firstElementChild.classList.add("scr-in", "slow")); }
    shownBase = S.base;
    renderOver();
  }
  function renderOver() {
    const o = top();
    const changed = o !== shownOver, hadPrev = !!shownOver, dir = navDir; navDir = 0;
    L.hud.classList.toggle("k-hidden", !(S.base === "hud" && !o));
    const fn = o && { menu: renderMenu, settings: renderSettings, report: renderReport, learn: renderLearn, inventory: renderInventory, map: renderMap, analytics: renderAnalytics }[o.id];
    if (changed) {
      if (hadPrev) ghost(L.over, !o ? "leave-close" : dir < 0 ? "leave-back" : dir > 0 ? "leave-fwd" : "leave-fade"); else L.over.innerHTML = "";
      shownOver = o;
      if (fn) {
        fn(o, false);
        const first = L.over.firstElementChild;
        if (first && !motionOff()) first.classList.add("scr-in", !hadPrev ? "fade" : dir < 0 ? "back" : dir > 0 ? "fwd" : "fade");
      }
    } else if (fn) fn(o, true);
    if (S.base === "hud") updateHud(true);
    updateCompare();
    onChange(currentKey());
  }
  function currentKey() {
    const o = top();
    if (o) { if (o.id === "settings") return "settings:" + o.cat; if (o.id === "analytics") return "menu"; return o.id; }
    return S.base;
  }

  /* ------------------------------------------------------------------
     Compare overlay
  ------------------------------------------------------------------ */
  const keyToFile = { "settings:mk": "01-settings-mouse", "settings:ctrl": "02-settings-controller", "settings:audio": "03-settings-audio", "settings:video": "04-settings-video", "settings:a11y": "05-settings-accessibility", learn: "06-learn-controls", menu: "07-pause-menu", report: "08-report-problem", inventory: "09-inventory", hud: "10-gameplay-hud", map: "11-world-map", lobby: "12-lobby", loading: "13-loading", results: "14-match-results" };
  function setCompare(mode, op) { compare = { mode, op }; updateCompare(); }
  function updateCompare() {
    if (!L.compare) return;
    const f = keyToFile[currentKey()];
    if (compare.mode === "off" || !f) { L.compare.hidden = true; return; }
    L.compare.hidden = false; L.compare.className = "compare-overlay " + compare.mode;
    L.compare.src = `img/${compare.mode}/${f}.jpg`; L.compare.style.opacity = compare.op;
  }

  /* ------------------------------------------------------------------
     Toast & dialog
  ------------------------------------------------------------------ */
  let toastT = 0;
  function toast(html, opts) {
    opts = opts || {};
    L.toast.innerHTML = `<div class="k-toast ${opts.err ? "err" : ""}" style="pointer-events:auto">${html}</div>`;
    clearTimeout(toastT); toastT = setTimeout(() => { L.toast.innerHTML = ""; }, opts.ms || 2600);
    if (opts.onAction) { const b = L.toast.querySelector("[data-toast-act]"); b && b.addEventListener("click", () => { opts.onAction(); L.toast.innerHTML = ""; }); }
  }
  let dialogOpen = null;
  function confirmDialog({ title, body, ok, danger, onOk }) {
    dialogOpen = { onOk, sel: 0 };
    L.dialog.style.pointerEvents = "auto";
    L.dialog.innerHTML = `<div class="k-scrim"><div class="k-dialog" role="dialog" aria-modal="true" aria-label="${esc(title)}"><h2>${esc(title)}</h2><p>${esc(body)}</p><div class="acts"><button class="k-btn secondary is-focus" data-dlg="cancel">Cancel</button><button class="k-btn ${danger ? "danger" : "primary"}" data-dlg="ok">${esc(ok)}</button></div></div></div>`;
    sfx.select();
  }
  function dialogFocus(i) { dialogOpen.sel = i; L.dialog.querySelectorAll("[data-dlg]").forEach((b, j) => b.classList.toggle("is-focus", j === i)); sfx.tick(); }
  function closeDialog(ok) {
    const d = dialogOpen; dialogOpen = null; ghost(L.dialog, "leave-fade", 220); closeDialogSilently(); sfx.back();
    if (ok && d && d.onOk) d.onOk();
  }
  function closeDialogSilently() { dialogOpen = null; if (L.dialog) { L.dialog.innerHTML = ""; L.dialog.style.pointerEvents = "none"; } }

  /* ------------------------------------------------------------------
     LOADING
  ------------------------------------------------------------------ */
  const PHASES = { match: [["Connecting to the playtest server", 900], ["Loading island", 1600], ["Unpacking the crates", 1500], ["Spawning in", 900]], range: [["Loading firing range", 1100], ["Setting up targets", 900]] };
  function startLoading(mode, fromJump) {
    S.over = []; S.base = "loading";
    S.loading = { mode, phase: 0, t0: now(), pct: 0, done: false, tip: 0 };
    renderAll(); tickLoading();
  }
  function tickLoading() {
    const ld = S.loading; if (!ld || S.base !== "loading") return;
    const ph = PHASES[ld.mode]; const total = ph.reduce((a, p) => a + p[1], 0);
    let el = now() - ld.t0, acc = 0, idx = 0;
    if (top()) { ld.t0 += 120; } // loading continues in the background, but holds while guide is open
    for (idx = 0; idx < ph.length; idx++) { if (el < acc + ph[idx][1]) break; acc += ph[idx][1]; }
    ld.pct = clamp(Math.round((el / total) * 100), 0, 100);
    ld.phase = Math.min(idx, ph.length - 1);
    const f = $(".ld-bar .f", L.base), p = $(".ld-pct", L.base), s = $(".ld-phase", L.base);
    if (f) f.style.width = ld.pct + "%"; if (p) p.textContent = ld.pct + "%";
    if (s) s.textContent = ld.pct >= 100 ? "Ready" : ph[ld.phase][0];
    if (ld.pct >= 100) { ld.done = true; if (!top()) later(finishLoading, 500); return; }
    later(tickLoading, 120);
  }
  function finishLoading() { if (S.base !== "loading") return; const m = S.loading.mode; S.loading = null; enterHud(m); }
  function tipHtml(i) {
    const t = K.tips[i % K.tips.length];
    const keys = t.keys.map(([b, label], j) => (j ? '<span class="k-muted">/</span>' : "") + (b.startsWith("#") ? lit(b.slice(1), "solid") : keycap(S.bind[b], "solid")) + ` <span>${esc(label)}</span>`).join(" ");
    return `<div class="k-eyebrow">${esc(t.eyebrow)}</div><div class="keys">${keys}</div><p>${esc(t.text)}</p><div class="dots">${K.tips.map((_, j) => `<i class="${j === i % K.tips.length ? "on" : ""}"></i>`).join("")}</div>`;
  }
  function renderLoading() {
    const ld = S.loading;
    const headline = ld.mode === "range" ? "Firing range." : "The island awaits.";
    L.base.innerHTML = `<div class="scr">
      <div class="bgimg" style="background-image:url(img/art/loading.jpg)"></div><div class="ld-grad"></div>
      <img class="ld-brand" src="img/brand/kong-royale-lockup.png" alt="Kong Royale">
      <div class="ld-copy"><div class="k-eyebrow" style="display:flex;gap:18px;align-items:center"><span style="width:44px;height:1px;background:currentColor"></span>${ld.mode === "range" ? "Training" : "Battle royale · " + (S.squad === "trios" ? "Trios" : "Solo")}</div><h1 class="k-display">${headline}</h1><div class="ld-phase">${esc(PHASES[ld.mode][0][0])}</div></div>
      <div class="ld-pct">0%</div><div class="ld-bar"><div class="f" style="width:0%"></div></div>
      <button class="ld-learn k-hint" data-a="learn">${I.book}<span style="border-bottom:1px solid rgba(238,234,223,.4);padding-bottom:4px">Learn controls</span></button>
      <div class="ld-tip" data-a="tipnext" style="cursor:pointer">${tipHtml(ld.tip)}</div>
    </div>`;
    const rot = () => { if (S.base !== "loading" || !S.loading) return; S.loading.tip++; const t = $(".ld-tip", L.base); if (t) t.innerHTML = tipHtml(S.loading.tip); later(rot, 3200); };
    later(rot, 3200);
  }

  /* ------------------------------------------------------------------
     LOBBY
  ------------------------------------------------------------------ */
  function playBtnHtml() {
    return S.search
      ? `<button class="k-btn primary big" data-a="cancelsearch"><span style="display:flex;gap:18px;align-items:center"><span class="spin"></span>Searching <span class="tnum" id="lb-st">0:00</span></span><span style="font:700 16px var(--k-label);letter-spacing:.16em">ESC CANCEL</span></button>`
      : `<button class="k-btn primary big" data-a="play"><span>Play</span><span class="arr">→</span></button>`;
  }
  function lobbyFootHtml() { return `<span class="k-hint">${lit("Enter", "solid")} ${S.lobbyTab === "training" ? "Firing range" : "Play"}</span><span class="k-hint">${lit("Esc", "solid")} ${S.search ? "Cancel" : "Settings"}</span>`; }
  function lobbyMainHtml() {
    return S.lobbyTab === "training"
      ? `<div class="k-eyebrow">Training</div><h1 class="k-display">Sharpen<br>up.</h1>
         <div class="lb-training">
           <button data-a="range"><b>Firing range</b><span>Infinite ammo, targets at 10–50 m. Try your settings.</span><span class="arr">→</span></button>
           <button data-a="learn"><b>Learn controls</b><span>Ten short lessons. Keys follow your bindings.</span><span class="arr">→</span></button>
         </div>`
      : `<div class="k-eyebrow">Battle royale</div><h1 class="k-display">Rule the<br>island.</h1>
         <div class="lb-modeline">50 players · Resurgence</div>
         <div class="lb-modes" role="radiogroup" aria-label="Squad size">
           <button class="${S.squad === "trios" ? "on" : ""}" data-a="squad" data-v="trios" role="radio" aria-checked="${S.squad === "trios"}">Trios</button>
           <button class="${S.squad === "solo" ? "on" : ""}" data-a="squad" data-v="solo" role="radio" aria-checked="${S.squad === "solo"}">Solo</button>
         </div>
         <div class="lb-play">${playBtnHtml()}</div>
         <div class="lb-live"><i></i>Live playtest <span>·</span> <b>4</b> players in hub</div>
         <div class="lb-links"><button data-a="range">${I.target}Firing range</button><span class="sep"></span><button data-a="learn">${I.book}Learn controls</button></div>`;
  }
  function lobbyTab(v) {
    if (S.lobbyTab === v) return; S.lobbyTab = v; sfx.tick();
    const nav = $(".lb-nav", L.base); nav.querySelectorAll("[data-a=ltab]").forEach((b) => b.classList.toggle("on", b.dataset.v === v)); placeInk(nav);
    const m = $(".lb-main", L.base); m.innerHTML = lobbyMainHtml(); swap(m);
    $(".lb-foot", L.base).innerHTML = lobbyFootHtml();
  }
  function setSquad(v) { S.squad = v; sfx.tick(); L.base.querySelectorAll("[data-a=squad]").forEach((b) => { b.classList.toggle("on", b.dataset.v === v); b.setAttribute("aria-checked", b.dataset.v === v); }); }
  function updatePlay() { const p = $(".lb-play", L.base); if (p) { p.innerHTML = playBtnHtml(); swap(p); } const f = $(".lb-foot", L.base); if (f) f.innerHTML = lobbyFootHtml(); }
  function renderLobby() {
    const tab = S.lobbyTab;
    L.base.innerHTML = `<div class="scr">
      <div class="lb-art" id="lb-art" style="background-image:url(img/art/lobby.jpg)"></div><div class="lb-grad"></div>
      <img class="lb-brand" src="img/brand/kong-royale-lockup.png" alt="Kong Royale">
      <nav class="lb-nav" aria-label="Lobby">
        <button class="k-tab ${tab === "play" ? "on" : ""}" data-a="ltab" data-v="play">Play</button>
        <button class="k-tab ${tab === "training" ? "on" : ""}" data-a="ltab" data-v="training">Training</button>
        <button class="k-tab" data-a="settings">Settings</button>
      </nav>
      <div class="lb-id"><div class="cs"><small>Callsign</small><b>${esc(S.callsign)}</b></div><span class="div"></span><button class="edit" data-a="editcs">${I.pencil}Edit callsign</button></div>
      ${S.editCs ? `<form class="lb-edit" id="cs-form"><label for="cs-in">Callsign</label><input id="cs-in" maxlength="16" value="${esc(S.callsign)}" autocomplete="off" spellcheck="false"><div class="help" id="cs-help">3–16 letters or numbers. Other players see this.</div><div class="row"><button type="button" class="k-btn tertiary" data-a="cscancel">Cancel</button><button class="k-btn primary" type="submit" style="min-width:120px">Save</button></div></form>` : ""}
      <div class="lb-main">${lobbyMainHtml()}</div>
      <div class="lb-foot k-hints">${lobbyFootHtml()}</div>
    </div>`;
    placeInk($(".lb-nav", L.base), 0, true);
    if (S.editCs) { const f = $("#cs-form", L.base), inp = $("#cs-in", L.base); inp.focus(); inp.select(); f.addEventListener("submit", (e) => { e.preventDefault(); saveCallsign(inp.value); }); }
  }
  function saveCallsign(v) {
    v = v.trim().toUpperCase();
    if (!/^[A-Z0-9]{3,16}$/.test(v)) { const h = $("#cs-help", L.base), i = $("#cs-in", L.base); h.innerHTML = `<span class="k-field-error">${I.alert}Use 3–16 letters or numbers, no spaces.</span>`; i.classList.add("bad"); i.focus(); return; }
    S.callsign = v; store.set("callsign", v); S.editCs = false; renderAll(); toast(`${I.check} Callsign saved`);
  }
  function startSearch() {
    S.search = { t0: Date.now() }; updatePlay(); sfx.select();
    const tick = () => { if (!S.search) return; const s = Math.floor((Date.now() - S.search.t0) / 1000); const e = $("#lb-st", L.base); if (e) e.textContent = `0:${String(s).padStart(2, "0")}`; if (s >= 3) { S.search = null; startLoading("match"); return; } later(tick, 250); };
    later(tick, 250);
  }

  /* ------------------------------------------------------------------
     HUD + WORLD
  ------------------------------------------------------------------ */
  const TARGETS = [{ x: 565, y: 505, r: 46 }, { x: 720, y: 482, r: 22 }, { x: 945, y: 482, r: 22 }, { x: 1125, y: 505, r: 44 }, { x: 770, y: 468, r: 9 }, { x: 875, y: 466, r: 9 }];
  const ME = { x: 545, y: 438 }; // player position on the 1672×941 map art (Peel Strip)
  function fovZoom() { return 1.18 + (120 - S.set.fov) / 40 * 0.32 + (S.aiming ? 0.22 : 0); }
  function renderWorld() {
    L.base.innerHTML = `<div class="hud-world" id="world" style="background-image:url(img/art/range.jpg)"></div><div class="hurt" id="hurt"></div>`;
  }
  function slotIcon(id) { return id === "bunchgun" ? I.rifle : id === "nub" ? I.pistol : "<i></i>"; }
  function renderHud() {
    const minimapX = (ME.x - 300) / 880 * 232, minimapY = (ME.y - 120) / 720 * 190;
    L.hud.innerHTML = `<div class="hud">
      <div class="grp tl"><div class="mini"><img src="img/art/minimap.jpg" alt=""><span class="pin" id="h-mpin" hidden></span><span class="me" id="h-me" style="left:${minimapX}px;top:${minimapY}px"></span></div>
        <div class="mini-lbl"><b id="h-modeb">${S.mode === "range" ? "Practice" : "Warm-up"}</b><span id="h-modes">${S.mode === "range" ? "Infinite ammo" : S.squad === "trios" ? "Trios" : "Solo"}</span></div></div>
      <div class="grp tc"><div class="compass-wrap"><div class="compass"><div class="strip" id="h-strip"></div></div><div class="compass-mark"></div></div><div class="hud-status" id="h-status">${S.mode === "range" ? "Firing range · Infinite ammo" : "Warm-up · " + (S.squad === "trios" ? "Trios" : "Solo")}</div></div>
      <div class="grp tr"><div class="mstats" id="h-ms"></div><div class="diag" id="h-diag"></div></div>
      <div class="elim" id="h-elim">Eliminated</div>
      <div class="hud-hints" id="h-hints"></div>
      <div class="xhair" id="h-x"><i class="h1"></i><i class="h2"></i><i class="v1"></i><i class="v2"></i><i class="dot"></i></div>
      <div class="hitm" id="h-hit"></div>
      <div class="hud-capture" id="h-cap" hidden>Click to capture the cursor · Esc for menu</div>
      <div class="grp bl"><div class="vitals">
        <div class="vital h" id="h-hp">${I.heart}<div class="bar"><i></i></div><b>100</b></div>
        <div class="vital s" id="h-sh">${I.shield}<div class="bar"><i></i></div><b>0</b></div>
        <div class="heal" id="h-heal" hidden>Healing…</div></div></div>
      <div class="grp br"><div class="loadout">
        <div><div class="ammo" id="h-ammo"><b>30</b> <span>/ 300</span></div><div class="wname" id="h-wn">Bunchgun</div><div class="reloading" id="h-rl" hidden>Reloading…</div></div>
        <div class="slots" id="h-slots"></div></div></div>
    </div>`;
    hudEls = { strip: $("#h-strip", L.hud), diag: $("#h-diag", L.hud), hints: $("#h-hints", L.hud), hp: $("#h-hp", L.hud), sh: $("#h-sh", L.hud), heal: $("#h-heal", L.hud), ammo: $("#h-ammo", L.hud), wn: $("#h-wn", L.hud), rl: $("#h-rl", L.hud), slots: $("#h-slots", L.hud), hit: $("#h-hit", L.hud), me: $("#h-me", L.hud), mpin: $("#h-mpin", L.hud), cap: $("#h-cap", L.hud), status: $("#h-status", L.hud), world: $("#world", L.base), hurt: $("#hurt", L.base), ms: $("#h-ms", L.hud), elim: $("#h-elim", L.hud) };
    buildCompass();
    renderMatchStats();
    if (S.mode === "match") squadSim();
    later(() => { if (hudEls && hudEls.status) hudEls.status.style.opacity = 0; }, 5000);
    updateHud(true);
    startLoop();
  }
  const PPD = 5.4;
  function buildCompass() {
    const names = { 0: "N", 45: "NE", 90: "E", 135: "SE", 180: "S", 225: "SW", 270: "W", 315: "NW" };
    let h = "";
    for (let d = -360; d <= 720; d += 15) { const n = ((d % 360) + 360) % 360; const lbl = names[n]; h += `<span class="t ${lbl && lbl.length === 1 ? "card" : lbl ? "card" : ""}" style="left:${(d + 360) * PPD}px">${lbl || n}</span>`; }
    hudEls.strip.innerHTML = h;
  }
  function heading() { return ((135 + S.look.x * 70) % 360 + 360) % 360; }
  function updateHud(full) {
    if (!hudEls) return;
    const w = S.equipped ? K.items[S.equipped] : null;
    const hp = S.health, sh = S.shield;
    hudEls.hp.querySelector("i").style.width = hp + "%"; hudEls.hp.querySelector("b").textContent = Math.round(hp); hudEls.hp.classList.toggle("low", hp <= 30);
    hudEls.sh.querySelector("i").style.width = sh + "%"; hudEls.sh.querySelector("b").textContent = Math.round(sh);
    hudEls.heal.hidden = !(S.healUntil > now());
    if (w) {
      const m = S.mag[w.id], res = S.reserve[w.ammo];
      hudEls.ammo.innerHTML = `<b>${m}</b> <span>/ ${res}</span>`; hudEls.ammo.classList.toggle("empty", m === 0);
      hudEls.wn.textContent = w.name;
    } else { hudEls.ammo.innerHTML = `<b>–</b>`; hudEls.wn.textContent = "Unarmed"; }
    hudEls.rl.hidden = !(S.reloadUntil > now());
    if (full) {
      hudEls.slots.innerHTML = S.inv.map((id, i) => `<div class="slot ${id && id === S.equipped ? "on" : ""}"><div class="ic">${slotIcon(id)}</div>${i + 1}</div>`).join("");
      if (S.marker) { hudEls.mpin.hidden = false; hudEls.mpin.style.left = (S.marker.x - 300) / 880 * 232 + "px"; hudEls.mpin.style.top = (S.marker.y - 120) / 720 * 190 + "px"; } else hudEls.mpin.hidden = true;
      renderHints();
    }
  }
  function renderHints() {
    if (!hudEls) return;
    const H = S.hints, all = H.fire && H.reload && H.inv && H.map;
    const row = (done, keys, t) => `<div class="k-hint ${done ? "done" : ""}">${keys} ${t}</div>`;
    hudEls.hints.innerHTML = S.mode !== "range" ? "" :
      row(H.fire, `<span class="k-key">${I.mouse("left")}</span>`, "Fire at a target") +
      row(H.reload, keycap(S.bind.reload), "Reload") +
      row(H.inv, keycap(S.bind.inventory), "Open inventory") +
      row(H.map, keycap(S.bind.map), "Open map");
    hudEls.hints.style.opacity = all ? 0 : 1;
  }
  function startLoop() {
    cancelAnimationFrame(raf);
    const loop = () => {
      raf = requestAnimationFrame(loop);
      fps.n++; const t = now(); if (t - fps.t > 500) { fps.v = Math.round(fps.n * 1000 / (t - fps.t)); fps.n = 0; fps.t = t; }
      if (S.base !== "hud" || !hudEls) return;
      const k = S.set.reducedMotion ? 1 : 0.18;
      S.look.x += (S.look.tx - S.look.x) * k; S.look.y += (S.look.ty - S.look.y) * k;
      const z = fovZoom(), W = 1920 * z, Hh = 1080 * z;
      const ox = -(W - 1920) / 2 - S.look.x * (W - 1920) / 2, oy = -(Hh - 1080) / 2 - S.look.y * (Hh - 1080) / 2;
      hudEls.world.style.width = W + "px"; hudEls.world.style.height = Hh + "px";
      hudEls.world.style.transform = `translate(${ox}px,${oy}px)`;
      const hd = heading();
      hudEls.strip.style.transform = `translateX(${380 - (hd + 360) * PPD}px)`;
      hudEls.me.style.transform = `rotate(${hd}deg)`;
      // diagnostics
      const parts = [];
      if (S.set.showFps) parts.push(`FPS ${fps.v}`);
      if (S.set.netStats === "Ping" || S.set.netStats === "Full") parts.push(`Ping ${27 + Math.round(Math.sin(t / 1300) * 3)}`);
      if (S.set.netStats === "Full") parts.push("Loss 0%");
      const dtext = parts.join("<br>"); if (hudEls.diag._t !== dtext) { hudEls.diag.innerHTML = dtext; hudEls.diag._t = dtext; }
      if (S.reloadUntil && t > S.reloadUntil) finishReload();
      if (S.healUntil && t > S.healUntil) finishHeal();
      hudEls.cap.hidden = locked || top() || !lockTried || lockFailed;
      if (fire.down && S.equipped === "bunchgun" && t - fire.last > 110) shoot();
    };
    raf = requestAnimationFrame(loop);
  }
  const fire = { down: false, last: 0 };
  function shoot() {
    fire.last = now();
    const w = S.equipped ? K.items[S.equipped] : null; if (!w) return;
    if (S.reloadUntil > now()) return;
    if (S.mag[w.id] <= 0) { sfx.empty(); flashHint(); return; }
    S.mag[w.id]--; S.stats.shots++; S.healUntil = 0;
    if (S.mode !== "range") { /* reserve only drains on reload */ }
    sfx.fire();
    if (!S.set.reducedMotion && hudEls.world) { hudEls.world.parentElement.classList.remove("flash-kick"); void hudEls.world.offsetWidth; hudEls.world.parentElement.classList.add("flash-kick"); }
    // hit test against targets in world space
    const z = fovZoom(), W = 1920 * z, Hh = 1080 * z;
    const ox = -(W - 1920) / 2 - S.look.x * (W - 1920) / 2, oy = -(Hh - 1080) / 2 - S.look.y * (Hh - 1080) / 2;
    const sx = W / 1672, sy = Hh / 941;
    const hit = TARGETS.find((tg) => Math.hypot(tg.x * sx + ox - 960, tg.y * sy + oy - 540) < tg.r * sx);
    if (hit) {
      S.stats.hits++; S.stats.dmg += w.damage; sfx.hit();
      const ti = TARGETS.indexOf(hit), M = S.match; M.dmg += w.damage; M.lastHit = now();
      M.tHp[ti] = (M.tHp[ti] || 0) + w.damage; bumpStat("dmg");
      if (M.tHp[ti] >= 100) { M.tHp[ti] = 0; M.kills++; M.squadKills++; bumpStat("kills"); bumpStat("squadKills"); if (S.mode === "match" && M.alive > 2) { M.alive--; bumpStat("alive"); } later(() => tone(520, 0.12, "triangle", 0.4, "combat", 880), 60); flashLabel("Eliminated"); }
      hudEls.hit.classList.remove("show"); void hudEls.hit.offsetWidth; hudEls.hit.classList.add("show");
      const d = document.createElement("div"); d.className = "dmgnum"; d.textContent = w.damage; d.style.left = 990 + (Math.random() * 30) + "px"; d.style.top = 470 + "px"; L.hud.firstElementChild.appendChild(d); setTimeout(() => d.remove(), 720);
      if (!S.hints.fire) { S.hints.fire = true; renderHints(); }
    }
    updateHud();
  }
  function flashHint() { toast(`${keycap(S.bind.reload, "solid")} Reload`, { ms: 1000 }); }
  function reload() {
    const w = S.equipped ? K.items[S.equipped] : null; if (!w || S.reloadUntil > now()) return;
    if (S.mag[w.id] >= w.mag) return;
    if (S.mode !== "range" && S.reserve[w.ammo] <= 0) { toast(`${I.alert} No ${w.ammo} ammo left`, { err: true }); return; }
    S.reloadUntil = now() + 1400; S.healUntil = 0; sfx.reload(); updateHud(); later(() => { if (S.reloadUntil && now() >= S.reloadUntil - 5) finishReload(); }, 1400);
  }
  function finishReload() {
    S.reloadUntil = 0; const w = S.equipped ? K.items[S.equipped] : null; if (!w) return;
    const need = w.mag - S.mag[w.id];
    if (S.mode === "range") S.mag[w.id] = w.mag; else { const take = Math.min(need, S.reserve[w.ammo]); S.mag[w.id] += take; S.reserve[w.ammo] -= take; }
    S.stats.reloads++; if (!S.hints.reload) { S.hints.reload = true; renderHints(); }
    updateHud();
  }
  function heal() {
    if (S.health >= 100) { toast("Health is already full", { ms: 1200 }); return; }
    if (S.healUntil > now()) return;
    S.healUntil = now() + 1500; updateHud(); later(() => { if (S.healUntil && now() >= S.healUntil - 5) finishHeal(); }, 1500);
  }
  function finishHeal() { S.healUntil = 0; S.health = Math.min(100, S.health + 50); updateHud(); }
  function takeDamage(n) {
    let left = n; const s = Math.min(S.shield, left); S.shield -= s; left -= s; S.health -= left; S.healUntil = 0;
    sfx.hurt();
    if (hudEls && hudEls.hurt) { hudEls.hurt.classList.add("show"); setTimeout(() => hudEls && hudEls.hurt && hudEls.hurt.classList.remove("show"), 120); }
    if (S.health <= 0) { S.health = 100; S.shield = 0; toast("Eliminated in practice · respawned", { ms: 2200 }); }
    updateHud();
  }
  function equipSlot(i) { const id = S.inv[i]; if (!id) return; if (S.equipped !== id) { S.equipped = id; S.reloadUntil = 0; sfx.select(); } updateHud(true); }

  /* pointer lock */
  let lockFailed = false;
  function requestLock() {
    lockTried = true;
    try {
      const p = stage.requestPointerLock && stage.requestPointerLock();
      if (p && p.catch) p.catch(() => { lockFailed = true; });
    } catch (e) { lockFailed = true; }
    setTimeout(() => { if (!locked) lockFailed = true; }, 600);
  }
  function releaseLock() { if (locked) { selfUnlock = true; try { document.exitPointerLock(); } catch (e) { } } }

  /* ------------------------------------------------------------------
     MATCH MENU + ANALYTICS
  ------------------------------------------------------------------ */
  /* ------------------------------------------------------------------
     MATCH RESULTS
  ------------------------------------------------------------------ */
  // Example values from the Oct 10 playtest recording; the game supplies real match data.
  const RESULT = { place: 1, squads: 17, kills: 12, damage: 1061, secs: 749, headshots: 3, lobby: "Online friends", next: "13 kills", best: ["kills", "damage", "time"] };
  const RATE_Q = [["smooth", "Smoothness"], ["hit", "Hit registration"], ["fun", "Fun"]];
  const fmtTime = (v) => Math.floor(v / 60) + ":" + String(Math.round(v) % 60).padStart(2, "0");
  function statsMode() {
    const v = S.set.matchStats;
    if (v !== "Auto") return v;
    return S.mode === "match" && S.squad === "trios" ? "Squad" : "Personal";
  }
  const HI = {
    skull: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2C7 2 3.5 5.6 3.5 10.1c0 2.6 1.2 4.7 3 5.9V19a1 1 0 001 1H9v-2.2h2V20h2v-2.2h2V20h1.5a1 1 0 001-1v-3c1.8-1.2 3-3.3 3-5.9C20.5 5.6 17 2 12 2zM8.6 13.2a2.1 2.1 0 110-4.2 2.1 2.1 0 010 4.2zm6.8 0a2.1 2.1 0 110-4.2 2.1 2.1 0 010 4.2z"/></svg>',
    assist: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M1 9.5l4.2-3.2 3.3 1.4 2.6-1.5c.8-.5 1.8-.5 2.6 0l2.3 1.3 3-1.2 4 3.2-3.4 3.8-1.2-.9-4.6 4.2c-.7.6-1.7.6-2.4 0l-.5-.4-.6.5c-.7.6-1.7.5-2.3-.1L5.5 13.4zm8.7-.9l-1.6 1.6c-.4.4-.4 1 0 1.4.4.4 1 .4 1.4 0l2.2-2 4.3 3.9.9-.8-4.6-4.3c-.6-.5-1.4-.5-2 0z"/></svg>',
    squad: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 4.2a3.3 3.3 0 110 6.6 3.3 3.3 0 010-6.6zM5.3 7a2.6 2.6 0 110 5.2 2.6 2.6 0 010-5.2zm13.4 0a2.6 2.6 0 110 5.2 2.6 2.6 0 010-5.2zM12 12.3c3.3 0 6 1.7 6 3.9V19H6v-2.8c0-2.2 2.7-3.9 6-3.9zm-6.7.9c.3 0 .6 0 .9.1-1 .8-1.6 1.8-1.6 2.9V18H0v-2c0-1.6 2.4-2.8 5.3-2.8zm13.4 0c2.9 0 5.3 1.2 5.3 2.8v2h-4.6v-1.8c0-1.1-.6-2.1-1.6-2.9.3-.1.6-.1.9-.1z"/></svg>',
    person: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 3a4 4 0 110 8 4 4 0 010-8zm0 10c4.4 0 8 2.2 8 5v3H4v-3c0-2.8 3.6-5 8-5z"/></svg>',
    damage: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M13.5 1l-2 7.2L5 5.2l3.2 6.1L1 13.5l7.2 1.9L5.6 22l6.3-4.1L15.6 23l.8-7.3 6.6.5-5-5.1 5-5.8-7 1.4z"/></svg>'
  };
  // Top-right HUD: slanted chips. Row 1 is match state (squads left, players left);
  // row 2 is your contribution (kills, assists, squad kills, damage).
  function matchStatsHtml(M, mode, inMatch, squads) {
    const fmt = (v) => Number(v).toLocaleString("en-US");
    const chip = (inner, cls) => `<div class="hs-chip ${cls || ""}"><span class="hs-in">${inner}</span></div>`;
    const stat = (key, v, icon, label) => `<span class="hs-stat" title="${label}"><i class="hs-ic">${HI[icon]}</i><b data-ms="${key}" aria-label="${label}">${fmt(v)}</b></span>`;
    let html = "";
    if (inMatch) {
      html += `<div class="hs-row">${squads ? chip(`<b data-ms="squads">${fmt(M.squads)}</b><span class="hs-lbl">Squads left</span>`) : ""}${chip(stat("alive", M.alive, "person", "Players left"))}</div>`;
    }
    if (mode !== "Hidden") {
      const mine = mode === "Squad"
        ? stat("kills", M.kills, "skull", "Your kills") + stat("assists", M.assists, "assist", "Assists") + stat("squadKills", M.squadKills, "squad", "Squad kills")
        : stat("kills", M.kills, "skull", "Kills");
      html += `<div class="hs-row">${chip(mine, mode === "Squad" ? "squad" : "")}${chip(stat("dmg", M.dmg, "damage", "Damage"))}</div>`;
    }
    return html;
  }
  function renderMatchStats() {
    if (!hudEls || !hudEls.ms) return;
    hudEls.ms.innerHTML = matchStatsHtml(S.match || { kills: 0, assists: 0, dmg: 0, squadKills: 0, alive: 50, squads: 17 }, statsMode(), S.mode === "match", S.squad === "trios");
  }
  function bumpStat(key) {
    if (!hudEls || !hudEls.ms) return;
    const b = hudEls.ms.querySelector(`[data-ms="${key}"]`); if (!b) return;
    b.textContent = Number(S.match[key]).toLocaleString("en-US");
    if (!motionOff()) { b.classList.remove("pop"); void b.offsetWidth; b.classList.add("pop"); }
  }
  function flashLabel(text) {
    if (!hudEls || !hudEls.elim) return;
    hudEls.elim.textContent = text; hudEls.elim.classList.remove("show"); void hudEls.elim.offsetWidth; hudEls.elim.classList.add("show");
  }
  // Squadmates are simulated in the prototype: they score now and then, and an assist is
  // credited when a squadmate's kill lands within 6 seconds of your last hit.
  function squadSim() {
    later(() => {
      if (S.base !== "hud" || S.mode !== "match" || !S.match) return;
      if (!top()) {
        const M = S.match;
        if (Math.random() < 0.45) {
          M.squadKills++; bumpStat("squadKills");
          if (now() - M.lastHit < 6000) { M.assists++; bumpStat("assists"); flashLabel("Assist"); }
        }
        if (M.alive > 3) { M.alive -= 1 + ((Math.random() * 2) | 0); bumpStat("alive"); }
        if (M.squads > 2 && Math.random() < 0.4) { M.squads--; bumpStat("squads"); }
      }
      squadSim();
    }, 5000 + Math.random() * 6000);
  }
  function endMatch() { releaseLock(); fire.down = false; S.over = []; S.base = "results"; S.ratings = {}; renderAll(); }
  function toLobby() { S.over = []; S.base = "lobby"; S.lobbyTab = "play"; S.search = null; S.stats = { shots: 0, hits: 0, reloads: 0, dmg: 0, t0: Date.now() }; renderAll(); }
  function rateHtml() {
    const done = RATE_Q.every(([q]) => S.ratings[q]);
    return RATE_Q.map(([q, label]) => `<div class="rs-rate"><span class="lbl">${label}</span><div class="k-seg" role="radiogroup" aria-label="${label}">${[1, 2, 3, 4, 5].map((n) => `<button class="${S.ratings[q] === n ? "on" : ""}" data-a="rate" data-q="${q}" data-v="${n}" role="radio" aria-checked="${S.ratings[q] === n}">${n}</button>`).join("")}</div></div>`).join("")
      + (done ? `<div class="rs-thanks k-status swap">${I.check} Thanks. Ratings saved with this match.</div>` : "");
  }
  function renderResults() {
    S.ratings = S.ratings || {};
    const R = RESULT, sq = S.squad === "trios" ? "Trios" : "Solo";
    const stat = (key, v, label, fmt) => `<div><b data-count="${v}" data-fmt="${fmt}">${fmt === "time" ? fmtTime(v) : v.toLocaleString("en-US")}</b><small>${label}${R.best.includes(key) ? '<em>New best</em>' : ""}</small></div>`;
    L.base.innerHTML = `<div class="scr rs">
      <div class="lb-art" style="background-image:url(img/art/lobby.jpg)"></div><div class="rs-grad"></div>
      <canvas class="rs-confetti" id="rs-confetti" width="1920" height="1080" aria-hidden="true"></canvas>
      <div class="rs-top k-eyebrow">Battle royale · ${sq} · ${esc(R.lobby)}</div>
      <div class="rs-main">
        <div class="rs-eb">Victory</div>
        <h1 class="k-display">Kong<br>Royale.</h1>
        <div class="rs-place"><b>#${R.place}</b> of ${R.squads} squads</div>
        <div class="rs-stats">${stat("kills", R.kills, "Kills", "n")}${stat("damage", R.damage, "Damage", "n")}${stat("time", R.secs, "Time in match", "time")}${stat("hs", R.headshots, "Headshots", "n")}</div>
        <div class="rs-best">
          <div class="rs-best-h"><span class="rs-badge">New personal best</span><span>Kills, damage, time in match and placement</span></div>
          <p>Next target: ${R.next}. You already hold #1 for this lobby size.</p>
          <span class="k-status">${I.check} Personal bests saved on this device</span>
        </div>
        <div class="rs-feel"><div class="rs-feel-h"><span class="k-eyebrow" style="color:var(--kong-text)">How did that match feel?</span><span class="k-eyebrow">Optional · 3 taps</span></div>
          <div class="rs-rates" id="rs-rates">${rateHtml()}</div></div>
        <div class="rs-acts"><button class="k-btn primary big" data-a="tolobby"><span>Back to lobby</span><span class="arr">→</span></button><span class="k-hint">${lit("Enter", "solid")} Back to lobby</span></div>
      </div>
    </div>`;
    countUp(); confetti();
  }
  function countUp() {
    if (motionOff()) return;
    const els = [...L.base.querySelectorAll("[data-count]")], t0 = now(), dur = 1100;
    const step = () => {
      if (!els[0] || !els[0].isConnected) return;
      const k = Math.min(1, (now() - t0) / dur), e = 1 - Math.pow(1 - k, 3);
      els.forEach((el) => { const v = +el.dataset.count * e; el.textContent = el.dataset.fmt === "time" ? fmtTime(v) : Math.round(v).toLocaleString("en-US"); });
      if (k < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }
  function confetti() {
    const c = $("#rs-confetti", L.base); if (!c || motionOff()) return;
    const ctx = c.getContext("2d"), cols = ["#EABC39", "#EEEADF", "#F3C94E", "#A5B1A4"], t0 = now(), life = 3400;
    const P = Array.from({ length: 170 }, () => ({ x: Math.random() * 1920, y: -Math.random() * 700 - 20, vx: (Math.random() - 0.5) * 1.6, vy: 2.2 + Math.random() * 3, r: Math.random() * 6.28, vr: (Math.random() - 0.5) * 0.2, w: 6 + Math.random() * 8, h: 3 + Math.random() * 4, c: cols[(Math.random() * cols.length) | 0] }));
    const frame = () => {
      if (!c.isConnected) return;
      const t = now() - t0; ctx.clearRect(0, 0, 1920, 1080);
      if (t > life) return;
      ctx.globalAlpha = t > life - 700 ? (life - t) / 700 : 1;
      P.forEach((p) => { p.x += p.vx + Math.sin((t + p.r * 400) / 500) * 0.6; p.y += p.vy; p.r += p.vr; ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r); ctx.fillStyle = p.c; ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h * Math.abs(Math.cos(p.r * 2))); ctx.restore(); });
      requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  }

  function menuItems() {
    const it = [["resume", "Resume"], ["settings", "Settings"]];
    if (S.mode === "range") it.push(["analytics", "Practice analytics"]);
    it.push(["report", "Report a problem"]);
    it.push(["leave", "Leave match"]);
    return it;
  }
  function setMenuSel(o, i) {
    o.sel = i;
    L.over.querySelectorAll(".mn-item[data-i]").forEach((b) => b.classList.toggle("on", +b.dataset.i === i));
    placeVInk($(".mn", L.over), `.mn-item[data-i="${i}"]`, 14);
  }
  function renderMenu(o, same) {
    const it = menuItems(); o.sel = clamp(o.sel || 0, 0, it.length - 1);
    if (same && L.over.querySelectorAll(".mn-item[data-i]").length === it.length) { setMenuSel(o, o.sel); return; }
    const ctx = S.mode === "range" ? "Firing range" : "Battle royale · " + (S.squad === "trios" ? "Trios" : "Solo");
    const btn = (x, i) => `<button class="mn-item ${o.sel === i ? "on" : ""}" data-a="menu" data-v="${x[0]}" data-i="${i}">${x[1]}</button>`;
    L.over.innerHTML = `<div class="scr"><div class="mn-scrim"></div><div class="mn">
      <div class="mn-ctx k-eyebrow">${ctx}</div>
      <h1 class="k-display">Menu</h1>
      <div class="mn-sub"><i></i>Match continues</div>
      <div class="mn-list">${it.slice(0, -1).map(btn).join("")}</div>
      <div class="mn-leave">${btn(it[it.length - 1], it.length - 1)}</div>
      <div class="mn-foot k-hints"><span class="k-hint">${lit("Esc", "solid")} Resume</span><span class="k-hint">${lit("↑↓")} Select</span><span class="k-hint">${lit("Enter")} Open</span></div>
    </div></div>`;
    placeVInk($(".mn", L.over), `.mn-item[data-i="${o.sel}"]`, 14, true);
  }
  function menuAct(v) {
    if (v === "resume") return closeAll();
    if (v === "settings") return push({ id: "settings", cat: "mk", sec: 0, row: 0 });
    if (v === "analytics") return push({ id: "analytics" });
    if (v === "report") { S.report = { cat: null, text: S.report.state === "sent" ? "" : S.report.text, state: "idle", err: "" }; return push({ id: "report" }); }
    if (v === "leave") return confirmDialog({ title: "Leave match?", body: S.mode === "range" ? "You'll return to the lobby. Your practice stats for this session are cleared." : "You'll return to the lobby and can't rejoin this match. Your squad continues without you.", ok: "Leave match", danger: true, onOk: () => { releaseLock(); S.over = []; S.stats = { shots: 0, hits: 0, reloads: 0, dmg: 0, t0: Date.now() }; S.base = "lobby"; renderAll(); } });
  }
  function renderAnalytics() {
    const st = S.stats, acc = st.shots ? Math.round(st.hits / st.shots * 100) : 0;
    const mins = Math.floor((Date.now() - st.t0) / 60000), secs = Math.floor((Date.now() - st.t0) / 1000) % 60;
    L.over.innerHTML = `<div class="scr"><div class="mn-scrim"></div><div class="an-scrim"></div>
      <div class="mn"><div class="mn-ctx k-eyebrow">Firing range</div><h1 class="k-display">Menu</h1><div class="mn-sub"><i></i>Match continues</div>
      <div class="mn-list"><button class="mn-item" data-a="back">Back</button></div><div></div>
      <div class="mn-foot k-hints"><span class="k-hint">${lit("Esc", "solid")} Back</span></div></div>
      <div class="an"><div class="k-eyebrow">This session</div><h2 class="k-display">Practice analytics</h2>
        <div class="an-grid">
          <div><small>Shots</small><b>${st.shots}</b></div><div><small>Hits</small><b>${st.hits}</b></div><div><small>Accuracy</small><b>${acc}%</b></div>
          <div><small>Damage</small><b>${st.dmg}</b></div><div><small>Reloads</small><b>${st.reloads}</b></div><div><small>Time</small><b>${mins}:${String(secs).padStart(2, "0")}</b></div>
        </div>
        <p class="k-muted" style="font-size:18px;margin:0">Counts from this prototype session. Hits register when the crosshair is on a gorilla target.</p></div></div>`;
  }

  /* ------------------------------------------------------------------
     REPORT
  ------------------------------------------------------------------ */
  const CATS_R = ["Lag / rubber-banding", "Hit registration", "Bug / glitch", "Visual", "Audio", "Stuck", "Cheater", "Other"];
  function renderReport() {
    const R = S.report;
    if (R.state === "sent") {
      L.over.innerHTML = `<div class="rp"><div class="rp-done" style="padding-left:96px">
        <div class="chk">${I.check.replace('width="22" height="22"', 'width="40" height="40"')}</div>
        <div class="k-eyebrow">Report sent</div><h1 class="k-display">Thanks, ${esc(S.callsign)}.</h1>
        <p>Your ${esc(CATS_R[R.cat].toLowerCase())} report reached the team with your screenshot, position and connection log.</p>
        <div style="display:flex;gap:28px;align-items:center;margin-top:12px"><button class="k-btn primary" data-a="rp-menu" style="min-width:260px">Back to menu <span class="arr">→</span></button><button class="k-btn tertiary" data-a="rp-close">Resume</button></div>
      </div></div>`;
      return;
    }
    const sending = R.state === "sending";
    L.over.innerHTML = `<div class="rp">
      <div class="rp-top"><button data-a="back">${I.back}Back</button><button data-a="rp-close">Close ${lit("Esc")}</button></div>
      <div class="rp-left">
        <div class="k-eyebrow">Report</div>
        <h1 class="k-display">Report a problem</h1>
        <div class="intro">Help us keep KONG ROYALE fair, stable and fun for everyone.<br>Send a report with details about what happened.</div>
        <div class="rp-q"><div class="k-eyebrow">What type of issue?</div>
          <div class="rp-cats" role="radiogroup" aria-label="Issue type">${CATS_R.map((c, i) => `<button role="radio" aria-checked="${R.cat === i}" class="${R.cat === i ? "on" : ""}" data-a="rpcat" data-i="${i}" ${sending ? "disabled" : ""}>${esc(c)}</button>`).join("")}</div>
          ${R.err === "cat" ? `<div class="k-field-error" style="margin-top:14px">${I.alert}Choose the type of issue so the report reaches the right team.</div>` : ""}
        </div>
        <div class="rp-desc"><div class="lab"><span class="k-eyebrow" style="color:var(--kong-text)">What happened?</span><span class="k-eyebrow">Optional</span></div>
          <textarea id="rp-text" maxlength="1000" placeholder="Describe what happened..." ${sending ? "disabled" : ""}>${esc(R.text)}</textarea>
          <div class="cnt"><span id="rp-cnt">${R.text.length}</span> / 1000</div></div>
      </div>
      <div class="rp-right">
        <div class="head k-eyebrow">Automatically attached</div>
        <div class="rp-att"><img src="img/art/report-shot.jpg" alt="Screenshot of the moment you opened the menu">
          <div class="it"><div class="k-eyebrow">Screenshot</div><p>Captured when you opened the menu.</p></div>
          <div class="it"><div class="k-eyebrow">Position</div><p>Your map position, automatically included.</p></div>
          <div class="it"><div class="k-eyebrow">Connection log</div><p>The last 60 seconds of your connection.</p></div></div>
        <div></div>
        <div class="rp-send">
          ${R.err === "net" ? `<div class="k-field-error">${I.alert}Couldn't send. Check your connection and try again. Your description is kept.</div>` : ""}
          <button class="k-btn primary" data-a="rpsend" ${sending ? "disabled" : ""}>${sending ? `<span style="display:flex;gap:18px;align-items:center"><span class="spin"></span>Sending…</span>` : R.err === "net" ? "Retry" : "Send report"}<span class="side">Ctrl + Enter <span class="arr">→</span></span></button>
          <button class="k-btn tertiary" data-a="back" style="justify-self:start">Cancel</button>
        </div>
      </div></div>`;
    const ta = $("#rp-text", L.over);
    ta.addEventListener("input", () => { S.report.text = ta.value; $("#rp-cnt", L.over).textContent = ta.value.length; });
  }
  function rpSetCat(i) {
    S.report.cat = i; sfx.tick();
    if (S.report.err === "cat") { S.report.err = ""; const e = $(".rp-q .k-field-error", L.over); if (e) e.remove(); }
    L.over.querySelectorAll("[data-a=rpcat]").forEach((b) => { const on = +b.dataset.i === i; b.classList.toggle("on", on); b.setAttribute("aria-checked", on); });
  }
  function sendReport() {
    const R = S.report; if (R.state === "sending") return;
    if (R.cat == null) { R.err = "cat"; renderOver(); sfx.empty(); return; }
    R.state = "sending"; R.err = ""; renderOver();
    later(() => {
      if (failNextSend) { failNextSend = false; const cb = document.getElementById("pb-failsend"); if (cb) cb.checked = false; R.state = "idle"; R.err = "net"; }
      else { R.state = "sent"; }
      renderOver();
    }, 1400);
  }

  /* ------------------------------------------------------------------
     SETTINGS
  ------------------------------------------------------------------ */
  function catOf(o) { return CATS.find((c) => c.id === o.cat) || CATS[0]; }
  function rowsOf(o) { const c = catOf(o); return c.secs[clamp(o.sec, 0, c.secs.length - 1)].rows; }
  function fmtVal(r) { const v = S.set[r.id]; return r.fmt ? r.fmt(v) : v; }
  function ctlHtml(r, o) {
    if (r.type === "slider") { const v = S.set[r.id], p = (v - r.min) / (r.max - r.min) * 100; return `<div class="k-slider"><div class="k-track" data-slider="${r.id}"><div class="fill" style="width:${p}%"></div><div class="thumb" style="left:${p}%"></div></div><div class="k-val" data-val="${r.id}">${fmtVal(r)}</div></div>`; }
    if (r.type === "cycle") return `${r.preview ? `<button class="k-action" data-a="preview" style="margin-right:24px">Preview</button>` : ""}<div class="k-cycle"><button class="arrow" data-a="cyc" data-id="${r.id}" data-d="-1" aria-label="Previous">‹</button><div class="v">${esc(S.set[r.id])}</div><button class="arrow" data-a="cyc" data-id="${r.id}" data-d="1" aria-label="Next">›</button></div>`;
    if (r.type === "switch") { const on = !!S.set[r.id]; return `<button class="k-switch ${on ? "on" : ""}" data-a="sw" data-id="${r.id}" role="switch" aria-checked="${on}"><span class="t">${on ? "On" : "Off"}</span><span class="sw"></span></button>`; }
    if (r.type === "seg") return `<div class="k-seg" role="radiogroup">${r.options.map((op) => `<button class="${S.set[r.id] === op ? "on" : ""}" data-a="seg" data-id="${r.id}" data-v="${esc(op)}" role="radio" aria-checked="${S.set[r.id] === op}">${esc(op)}</button>`).join("")}</div>`;
    if (r.type === "bind") { const code = S.bind[r.action]; const cap = capture && capture.action === r.action; return `<div class="k-bind"><button class="${cap ? "capture" : code ? "" : "empty"}" data-a="bind" data-act="${r.action}">${cap ? "Press a key" : code ? esc(keyLabel(code)) : "Unbound"}</button></div>`; }
    if (r.type === "mic") return `<div class="st-meter"><i id="mic-m" style="width:0%"></i></div><button class="k-action" data-a="mictest">${micOn ? "Stop" : "Start test"}</button>`;
    return "";
  }
  function rowHtml(r, i, o) {
    const warn = r.type === "bind" && !S.bind[r.action];
    return `<div class="k-row ${o.row === i ? "sel" : ""} ${warn ? "warn" : ""}" data-row="${i}"><div class="lbl">${esc(r.label)}</div><div class="ctl">${ctlHtml(r, o)}</div></div>`;
  }
  function subtabsHtml(c, o) { return `${c.secs.map((s, i) => `<button class="k-subtab ${i === o.sec ? "on" : ""}" data-a="sec" data-i="${i}">${esc(s.name)}</button>`).join("")}${c.secs.length > 1 ? `<span class="k-hints" style="margin-left:28px">${lit("Tab")}</span>` : ""}`; }
  function updateSettings(o) {
    const c = catOf(o), rows = rowsOf(o); o.row = clamp(o.row, 0, rows.length - 1);
    const cats = $(".st-cats", L.over), sub = $(".st-sub", L.over), t = $("#st-table", L.over), help = $("#st-help", L.over);
    cats.querySelectorAll(".k-tab").forEach((b) => b.classList.toggle("on", b.dataset.v === c.id)); placeInk(cats);
    const catChanged = o._cat !== c.id, secChanged = catChanged || o._sec !== o.sec;
    if (catChanged) { sub.innerHTML = subtabsHtml(c, o); placeInk(sub, 40, true); swap(sub); }
    else { sub.querySelectorAll(".k-subtab").forEach((b) => b.classList.toggle("on", +b.dataset.i === o.sec)); placeInk(sub, 40); }
    const msg = secChanged ? "" : ($("#st-msg", L.over) || {}).textContent || "";
    t.innerHTML = rows.map((r, i) => rowHtml(r, i, o)).join("") + `<div class="st-msg" id="st-msg">${esc(msg)}</div>`;
    renderHelp(o);
    if (secChanged) { t.scrollTop = 0; swap(t); swap(help); }
    o._cat = c.id; o._sec = o.sec;
  }
  function renderSettings(o, same) {
    if (same && $(".st", L.over)) return updateSettings(o);
    const c = catOf(o), rows = rowsOf(o); o.row = clamp(o.row, 0, rows.length - 1);
    L.over.innerHTML = `<div class="st">
      <div class="st-art" style="background-image:url(img/art/loading.jpg)"></div>
      <div class="st-in">
        <div class="st-top"><img src="img/brand/kong-royale-lockup.png" alt="Kong Royale"><button class="st-back" data-a="back">Back · <b>Esc</b></button></div>
        <div class="st-title">Settings</div>
        <nav class="k-tabs st-cats" aria-label="Settings categories">${CATS.map((x) => `<button class="k-tab ${x.id === c.id ? "on" : ""}" data-a="cat" data-v="${x.id}">${esc(x.name)}</button>`).join("")}<span style="flex:1"></span><span class="k-hints" style="gap:10px;align-self:center">${lit("Q")}${lit("E")}</span></nav>
        <div class="k-subtabs st-sub">${subtabsHtml(c, o)}</div>
        <div class="st-body">
          <div class="st-table k-table" id="st-table">${rows.map((r, i) => rowHtml(r, i, o)).join("")}<div class="st-msg" id="st-msg"></div></div>
          <div class="st-divider"></div>
          <div class="st-help" id="st-help"></div>
        </div>
        <div class="st-foot">
          <button class="k-hint" data-a="restore" style="color:var(--kong-text)">${lit("R")} Restore defaults</button>
          <span class="k-hints"><span class="k-hint">${lit("↑↓")} Select</span><span class="k-hint">${lit("←→")} Adjust</span></span>
          <span class="k-status" id="st-status">${I.check} Saved on this device</span>
        </div>
      </div></div>`;
    renderHelp(o);
    const sel = L.over.querySelector(".k-row.sel"); sel && sel.scrollIntoView({ block: "nearest" });
    placeInk($(".st-cats", L.over), 0, true); placeInk($(".st-sub", L.over), 40, true);
    o._cat = c.id; o._sec = o.sec;
  }
  function renderHelp(o) {
    const r = rowsOf(o)[o.row]; const h = $("#st-help", L.over); if (!h || !r) return;
    h.innerHTML = `<div class="k-eyebrow">${esc(r.help.eb)}</div><h3>${esc(r.help.t)}</h3>${r.help.p.map((p) => `<p>${esc(p)}</p>`).join("")}<div class="viz">${vizHtml(r.help.viz, r)}</div>${r.help.viz === "hw" ? `<details class="disc"><summary>Hardware details</summary><p>Your detected display, GPU and driver appear here in the game. This preview doesn't read your hardware.</p></details>` : ""}`;
  }
  function refreshRow(id) {
    const o = top(); if (!o || o.id !== "settings") return;
    const rows = rowsOf(o), i = rows.findIndex((r) => r.id === id); if (i < 0) return;
    const el = L.over.querySelector(`.k-row[data-row="${i}"] .ctl`); if (el) el.innerHTML = ctlHtml(rows[i], o);
    renderHelp(o);
  }
  function selRow(o, i, scroll) {
    const rows = rowsOf(o); i = clamp(i, 0, rows.length - 1); if (i === o.row) return;
    o.row = i; L.over.querySelectorAll(".k-row").forEach((el) => el.classList.toggle("sel", +el.dataset.row === i));
    renderHelp(o); sfx.tick();
    if (scroll) { const el = L.over.querySelector(".k-row.sel"); el && el.scrollIntoView({ block: "nearest" }); }
  }
  let savedT = 0;
  function saved() {
    store.set("settings", S.set); store.set("bindings", S.bind);
    const st = $("#st-status", L.over); if (st) { st.classList.add("flash"); clearTimeout(savedT); savedT = setTimeout(() => st.classList.remove("flash"), 700); }
  }
  function setVal(id, v, opts) {
    const r = ROWS[id];
    if (r.type === "slider") { v = clamp(Math.round(v / r.step) * r.step, r.min, r.max); v = +v.toFixed(3); }
    if (S.set[id] === v) return;
    S.set[id] = v;
    // graphics preset coupling
    if (id === "gfxPreset" && GFX[v]) { Object.assign(S.set, GFX[v]); ["shadows", "textures", "foliage", "effects", "aa"].forEach(refreshRow); }
    if (["shadows", "textures", "foliage", "effects", "aa"].includes(id)) {
      const match = Object.keys(GFX).find((p) => Object.keys(GFX[p]).every((k) => S.set[k] === GFX[p][k]));
      S.set.gfxPreset = match || "Custom"; refreshRow("gfxPreset");
    }
    if (["textScale", "hudScale", "reducedMotion"].includes(id)) applyGlobals();
    if (id === "matchStats") renderMatchStats();
    if (!(opts && opts.noRefresh)) refreshRow(id);
    saved();
  }
  function adjust(r, dir, coarse) {
    if (r.type === "slider") setVal(r.id, S.set[r.id] + dir * r.step * (coarse ? 5 : 1));
    else if (r.type === "cycle" || r.type === "seg") { const ops = r.options, i = ops.indexOf(S.set[r.id]); const opsUse = r.id === "gfxPreset" ? ops.filter((x) => x !== "Custom") : ops; let j = opsUse.indexOf(S.set[r.id]); if (j < 0) j = dir > 0 ? -1 : opsUse.length; j = r.type === "seg" ? clamp(j + dir, 0, opsUse.length - 1) : (j + dir + opsUse.length) % opsUse.length; setVal(r.id, opsUse[j]); }
    else if (r.type === "switch") setVal(r.id, dir > 0);
    sfx.tick();
  }
  function activate(r) {
    if (r.type === "switch") { setVal(r.id, !S.set[r.id]); sfx.select(); }
    else if (r.type === "bind") startCapture(r.action);
    else if (r.type === "cycle" || r.type === "seg") adjust(r, 1);
    else if (r.type === "mic") toggleMic();
  }
  function startCapture(action) { capture = { action }; refreshRow(ROWSbyAction(action)); setMsg(""); sfx.select(); }
  function ROWSbyAction(a) { return a === "pushToTalk" ? "bind.pushToTalk" : "bind." + a; }
  function finishCapture(code) {
    const a = capture.action; capture = null;
    if (code === null) { refreshRow(ROWSbyAction(a)); setMsg(""); return; }
    if (code === "") { S.bind[a] = ""; refreshRow(ROWSbyAction(a)); setMsg(`${K.bindingLabels[a]} is unbound.`); saved(); rerenderSettingsRows(); return; }
    const other = Object.keys(S.bind).find((k) => k !== a && S.bind[k] === code);
    S.bind[a] = code;
    if (other) { S.bind[other] = ""; setMsg(`${keyLabel(code)} moved from ${K.bindingLabels[other]}. ${K.bindingLabels[other]} is now unbound.`); }
    else setMsg("");
    saved(); rerenderSettingsRows(); sfx.select();
  }
  function rerenderSettingsRows() { const o = top(); if (!o || o.id !== "settings") return; const t = $("#st-table", L.over); const msg = $("#st-msg", L.over).textContent; const st = t.scrollTop; t.innerHTML = rowsOf(o).map((r, i) => rowHtml(r, i, o)).join("") + `<div class="st-msg" id="st-msg">${esc(msg)}</div>`; t.scrollTop = st; renderHelp(o); }
  function setMsg(m) { const e = $("#st-msg", L.over); if (e) e.textContent = m; }
  function restoreDefaults(o) {
    const c = catOf(o);
    confirmDialog({ title: `Restore ${c.name} defaults?`, body: `Every ${c.name.toLowerCase()} setting${c.id === "mk" ? ", including key bindings," : ""} goes back to its default. Other categories are not changed.`, ok: "Restore defaults", danger: false, onOk: () => {
      c.secs.forEach((s) => s.rows.forEach((r) => { if ("def" in r) S.set[r.id] = r.def; if (r.type === "bind") S.bind[r.action] = K.defaultBindings[r.action]; }));
      applyGlobals(); saved(); renderOver(); toast(`${I.check} ${esc(c.name)} defaults restored`);
    } });
  }
  // mic meter simulation
  let micOn = false, micT = 0;
  function toggleMic() {
    micOn = !micOn; refreshRow("micTest");
    clearInterval(micT);
    if (micOn) micT = setInterval(() => { const m = document.getElementById("mic-m"); if (!m) { micOn = false; clearInterval(micT); return; } const v = Math.max(0, Math.sin(now() / 180) * 40 + Math.random() * 45); m.style.width = v + "%"; }, 80);
  }

  /* viz */
  function vizHtml(kind, r) {
    if (kind === "mouse") return `<svg width="300" height="220" viewBox="0 0 300 220" fill="none" stroke="#EEEADF" stroke-width="2"><path d="M60 120a90 70 0 01180 0" stroke="#EABC39" stroke-dasharray="4 6" stroke-width="2"/><path d="M48 150a102 80 0 0122-70M252 150a102 80 0 00-22-70" stroke="#A5B1A4"/><path d="M62 86l8-8 4 11M238 86l-8-8-4 11" stroke="#A5B1A4"/><rect x="120" y="70" width="60" height="120" rx="30"/><path d="M150 70v40M120 110h60"/><rect x="145" y="82" width="10" height="18" rx="5"/><path d="M150 40v18" stroke="#EABC39"/><text x="150" y="214" fill="#A5B1A4" stroke="none" font-family="Barlow Semi Condensed" font-size="16" text-anchor="middle" letter-spacing="2">${esc(fmtVal(ROWS.mouseSens))} · ${S.set.invertY === "On" ? "INVERTED" : "STANDARD"}</text></svg>`;
    if (kind === "speaker") { const m = S.set.master; const n = m === 0 ? 0 : m < 34 ? 1 : m < 67 ? 2 : 3; return `<svg width="280" height="160" viewBox="0 0 280 160" fill="none" stroke-width="3"><path d="M40 60h30l40-32v104L70 100H40z" stroke="#EEEADF"/>${[0, 1, 2].map((i) => `<path d="M${130 + i * 26} ${50 - i * 14}a${40 + i * 26} ${40 + i * 26} 0 010 ${60 + i * 28}" stroke="${i < n ? "#EABC39" : "#3A4547"}"/>`).join("")}${m === 0 ? '<path d="M140 55l50 50M190 55l-50 50" stroke="#FF8C88"/>' : ""}<text x="40" y="156" fill="#A5B1A4" stroke="none" font-family="Barlow Semi Condensed" font-size="16" letter-spacing="2">MASTER ${m}%</text></svg>`; }
    if (kind === "fov") { const f = S.set.fov; const a = (deg) => { const rad = deg / 2 * Math.PI / 180; return [140 + Math.sin(rad) * 160, 190 - Math.cos(rad) * 160, 140 - Math.sin(rad) * 160]; }; const [x1, y1, x2] = a(f), [g1, h1, g2] = a(90); return `<svg width="300" height="220" viewBox="0 0 280 220" fill="none"><path d="M140 190L${g1} ${h1}M140 190L${g2} ${h1}" stroke="#A5B1A4" stroke-dasharray="4 6" stroke-width="2"/><path d="M140 190L${x1} ${y1}A160 160 0 00${x2} ${y1}Z" fill="rgba(234,188,57,.12)" stroke="#EABC39" stroke-width="2"/><circle cx="140" cy="190" r="7" fill="#EEEADF"/><text x="140" y="216" fill="#EEEADF" font-family="Barlow Semi Condensed" font-size="17" text-anchor="middle" letter-spacing="2">${Math.round(f)}° HORIZONTAL · DASHED 90°</text></svg>`; }
    if (kind === "a11y") { const hs = S.set.hudScale / 100; return `<div class="viz-prev"><div class="k-eyebrow">Preview</div><div style="height:${176 * hs}px"><div style="transform:scale(${hs});transform-origin:0 0;width:360px"><div class="vital h" style="grid-template-columns:30px 200px auto;display:grid;gap:14px;align-items:center">${I.heart}<div class="bar"><i style="width:${S.health}%;background:#EABC39"></i></div><b>${Math.round(S.health)}</b></div><div class="vital s" style="grid-template-columns:30px 200px auto;display:grid;gap:14px;align-items:center;margin-top:8px">${I.shield}<div class="bar"><i style="width:${S.shield}%"></i></div><b>${Math.round(S.shield)}</b></div><div class="slots" style="margin-top:14px">${S.inv.map((id, i) => `<div class="slot ${id && id === S.equipped ? "on" : ""}" style="width:64px"><div class="ic">${slotIcon(id)}</div>${i + 1}</div>`).join("")}</div></div></div><div class="specimen">The storm closes in 30 seconds. Move to the safe zone.</div></div>`; }
    if (kind === "pad") return padSvg();
    if (kind === "stick" || kind === "dead" || kind === "curve") return stickSvg(kind);
    if (kind === "mstats") {
      const ex = { kills: 2, assists: 0, dmg: 249, squadKills: 1, alive: 27, squads: 10 }, mode = statsMode();
      const box = (m, cap) => `<div style="display:grid;gap:10px;justify-items:start"><div class="mstats" style="align-items:flex-start">${matchStatsHtml(ex, m, true, m === "Squad")}</div><span class="k-eyebrow">${cap}</span></div>`;
      return mode === "Hidden" ? `<div class="k-muted" style="font-size:16px">Match stats are hidden.</div>` : `<div style="display:grid;gap:22px;justify-items:start">${box("Personal", mode === "Personal" ? "Personal · current" : "Personal")}${box("Squad", mode === "Squad" ? "Squad · current" : "Squad")}</div>`;
    }
    if (kind === "mic") return `<div class="k-muted" style="font-size:16px">Chat mode: ${esc(S.set.chatMode)}${S.set.chatMode === "Push to talk" ? ` · hold ${keycap(S.bind.pushToTalk)}` : ""}</div>`;
    if (kind === "bind") { const code = r && S.bind[r.action]; return `<div style="display:flex;gap:18px;align-items:center">${code ? keycap(code, "big") : lit("—", "big unbound")}<span class="k-muted" style="font-size:18px">${capture ? "Press a key or mouse button · Esc cancel · Backspace clear" : "Enter or click to rebind"}</span></div>`; }
    if (kind === "gfx") { const lv = { Off: 0, Low: 1, FXAA: 2, Medium: 2, High: 3, TAA: 3, Ultra: 4 }; return `<div style="display:grid;gap:12px;max-width:420px">${["shadows", "textures", "foliage", "effects", "aa"].map((k) => `<div style="display:grid;grid-template-columns:140px 1fr;gap:16px;align-items:center;font:600 15px var(--k-label);letter-spacing:.14em;text-transform:uppercase;color:#A5B1A4">${ROWS[k].label}<div style="display:flex;gap:4px">${[1, 2, 3, 4].map((i) => `<i style="flex:1;height:8px;background:${i <= lv[S.set[k]] ? "#EABC39" : "#2A3436"}"></i>`).join("")}</div></div>`).join("")}<div class="k-muted" style="font-size:16px;margin-top:6px">Preset: ${esc(S.set.gfxPreset)}</div></div>`; }
    return "";
  }
  function padFamily() {
    if (S.set.prompts !== "Auto") return S.set.prompts;
    try { const g = [...(navigator.getGamepads ? navigator.getGamepads() : [])].find(Boolean); if (g) { const id = g.id.toLowerCase(); if (/054c|playstation|dualsense|dualshock/.test(id)) return "PlayStation"; if (/057e|nintendo|pro controller/.test(id)) return "Nintendo"; return "Xbox"; } } catch (e) { }
    return "Xbox";
  }
  function padConnected() { try { return [...(navigator.getGamepads ? navigator.getGamepads() : [])].find(Boolean); } catch (e) { return null; } }
  function padSvg() {
    const fam = padFamily();
    const G = { Xbox: ["A", "B", "X", "Y"], PlayStation: ["✕", "○", "□", "△"], Nintendo: ["B", "A", "Y", "X"] }[fam]; // bottom,right,left,top
    const LAY = { Standard: [["bottom", "Jump / mantle"], ["right", "Crouch / slide"], ["left", "Reload / interact"], ["top", "Swap weapon"], ["LB", "Heal"], ["RS", "Melee"]], Tactical: [["bottom", "Jump / mantle"], ["right", "Reload / interact"], ["left", "Swap weapon"], ["top", "Heal"], ["LB", "Ping"], ["RS", "Crouch / slide"]], "Bumper jumper": [["LB", "Jump / mantle"], ["bottom", "Crouch / slide"], ["right", "Reload / interact"], ["left", "Swap weapon"], ["top", "Heal"], ["RS", "Melee"]] }[S.set.padLayout];
    const glyph = (k) => ({ bottom: G[0], right: G[1], left: G[2], top: G[3], LB: fam === "PlayStation" ? "L1" : fam === "Nintendo" ? "L" : "LB", RS: fam === "PlayStation" ? "R3" : "RS" }[k]);
    const pos = { bottom: [330, 128], right: [356, 102], left: [304, 102], top: [330, 76] };
    const jumpKey = LAY.find((x) => x[1] === "Jump / mantle")[0];
    const btn = (k) => { const [x, y] = pos[k]; const on = k === jumpKey; return `<circle cx="${x}" cy="${y}" r="13" fill="${on ? "#EABC39" : "none"}" stroke="${on ? "#EABC39" : "#EEEADF"}" stroke-width="2"/><text x="${x}" y="${y + 5}" text-anchor="middle" font-family="Barlow Semi Condensed" font-weight="700" font-size="14" fill="${on ? "#101719" : "#EEEADF"}">${G[["bottom", "right", "left", "top"].indexOf(k)]}</text>`; };
    const ls = S.set.swapSticks ? [262, 138] : [128, 92], rs = S.set.swapSticks ? [128, 92] : [262, 138];
    const conn = padConnected();
    return `<svg width="460" height="230" viewBox="0 0 460 230" fill="none" stroke="#EEEADF" stroke-width="2"><path d="M110 42Q230 20 350 42Q420 56 432 160Q440 214 392 212Q356 210 330 168L130 168Q104 210 68 212Q20 214 28 160Q40 56 110 42Z"/><path d="M98 34h52M312 34h52" stroke-width="5" stroke="${jumpKey === "LB" ? "#EABC39" : "#EEEADF"}" stroke-linecap="round"/><circle cx="${ls[0]}" cy="${ls[1]}" r="22"/><circle cx="${rs[0]}" cy="${rs[1]}" r="22" ${jumpKey === "RS" ? 'stroke="#EABC39"' : ""}/><path d="M168 128v28M154 142h28" stroke-width="10" stroke-linecap="square" stroke="#3A4547"/>${["bottom", "right", "left", "top"].map(btn).join("")}<text x="${ls[0]}" y="${ls[1] + 46}" text-anchor="middle" font-family="Barlow Semi Condensed" font-size="13" fill="#A5B1A4" stroke="none" letter-spacing="1.5">MOVE</text><text x="${rs[0]}" y="${rs[1] + 46}" text-anchor="middle" font-family="Barlow Semi Condensed" font-size="13" fill="#A5B1A4" stroke="none" letter-spacing="1.5">LOOK</text></svg>
      <div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px 24px;margin-top:14px;max-width:470px">${LAY.map(([k, a]) => `<div style="display:flex;gap:12px;align-items:center;font-size:17px">${lit(glyph(k))}<span style="${k === jumpKey ? "color:#EABC39" : ""}">${a}</span></div>`).join("")}</div>
      <div class="k-status" style="margin-top:20px">${conn ? `<span style="width:8px;height:8px;border-radius:50%;background:#7AD7A5"></span>${esc(fam)} controller connected` : `<span style="width:8px;height:8px;border-radius:50%;background:#465052"></span>No controller connected · showing ${esc(fam)}`}</div>`;
  }
  function stickSvg(kind) {
    if (kind === "curve") { const c = S.set.curve; const path = c === "Linear" ? "M20 180L200 20" : c === "Dynamic" ? "M20 180C90 175 120 120 200 20" : "M20 180C110 178 150 110 200 20"; return `<svg width="240" height="210" viewBox="0 0 220 200" fill="none"><path d="M20 20v160h180" stroke="#465052" stroke-width="2"/><path d="${path}" stroke="#EABC39" stroke-width="3"/><text x="110" y="198" text-anchor="middle" font-family="Barlow Semi Condensed" font-size="13" fill="#A5B1A4" letter-spacing="1.5">STICK INPUT → TURN SPEED</text></svg>`; }
    const dz = kind === "dead" ? (top().row === 0 ? S.set.deadL : S.set.deadR) : S.set.deadR;
    return `<svg width="240" height="240" viewBox="0 0 240 240" fill="none" id="stickviz"><circle cx="120" cy="120" r="100" stroke="#EEEADF" stroke-width="2"/><circle cx="120" cy="120" r="${dz}" fill="rgba(234,188,57,.18)" stroke="#EABC39" stroke-width="2" stroke-dasharray="4 4"/><path d="M20 120h200M120 20v200" stroke="#2A3436"/><circle id="stickdot" cx="120" cy="120" r="8" fill="#EEEADF"/></svg><div class="k-muted" style="font-size:16px">${padConnected() ? "Move the stick to test." : "Connect a controller to test drift. Shaded area is ignored."}</div>`;
  }

  /* ------------------------------------------------------------------
     LEARN CONTROLS
  ------------------------------------------------------------------ */
  function lessonKeys(ls) {
    return ls.keys.map((k) => {
      let caps = "";
      if (k.cap === "wasd") caps = `<div class="caps"><div class="row">${keycap(S.bind.forward, "big")}</div><div class="row">${keycap(S.bind.left, "big")}${keycap(S.bind.back, "big")}${keycap(S.bind.right, "big")}</div></div>`;
      else if (k.mouse) caps = mouseBig(k.mouse);
      else if (k.b) caps = `<div class="caps"><div class="row" style="align-items:center">${k.b.map((b) => keycap(S.bind[b], "big")).join(k.plus ? '<span style="font-size:30px;color:#A5B1A4">+</span>' : "")}</div></div>`;
      else if (k.lit) caps = `<div class="caps"><div class="row">${k.lit.map((t) => lit(t, "big")).join("")}</div></div>`;
      return `<div class="grp">${caps}<div class="cap-lbl">${esc(k.lbl)}</div></div>`;
    }).join("");
  }
  function lessonMainHtml(i, ruleFrom) {
    const ls = K.lessons[i], n = K.lessons.length;
    return `<div class="prog">${i + 1} / ${n}</div><h1 class="k-display" style="${ls.t.length > 12 ? "font-size:92px" : ""}">${esc(ls.t)}</h1><div class="rule"><i style="width:${(ruleFrom == null ? i + 1 : ruleFrom) / n * 100}%"></i></div><p>${esc(ls.body)}</p>`;
  }
  function lessonActsHtml(i) { const n = K.lessons.length; return `${i > 0 ? `<button class="k-btn secondary" data-a="lprev" style="height:92px;min-width:0;width:92px;justify-content:center"><span class="arr">←</span></button>` : ""}<button class="k-btn primary" data-a="lnext">${i === n - 1 ? "Finish" : "Next"}<span class="arr">→</span></button>`; }
  function renderLearn(o, same) {
    const i = S.lesson, ls = K.lessons[i], n = K.lessons.length;
    if (same && $(".lc-main", L.over)) {
      const list = $(".lc-list", L.over), prev = +(list.dataset.cur || 0);
      list.dataset.cur = i;
      list.querySelectorAll("[data-a=lesson]").forEach((b, j) => { b.classList.toggle("on", j === i); b.classList.toggle("done", S.lessonsDone.includes(j)); b.setAttribute("aria-selected", j === i); });
      placeVInk(list, "button.on", 8);
      const main = $(".lc-main", L.over), keys = $(".lc-keys", L.over);
      main.innerHTML = lessonMainHtml(i, prev + 1); keys.innerHTML = lessonKeys(ls);
      $(".lc-acts > div", L.over).innerHTML = lessonActsHtml(i);
      swap(main); swap(keys);
      const bar = $(".rule i", main); requestAnimationFrame(() => requestAnimationFrame(() => { bar.style.width = (i + 1) / n * 100 + "%"; }));
      return;
    }
    L.over.innerHTML = `<div class="scr" style="background:#101719">
      <div class="lc-art" style="background-image:url(img/art/learn.jpg)"></div><div class="lc-grad"></div>
      <img class="lc-brand" src="img/brand/kong-royale-lockup.png" alt="Kong Royale">
      <div class="lc-top"><div class="ttl">Learn controls</div><button class="k-hint" data-a="back" style="color:var(--kong-text)">${lit("Esc")} Close</button></div>
      <div class="lc-list" role="tablist" aria-label="Lessons" data-cur="${i}">${K.lessons.map((l, j) => `<button role="tab" aria-selected="${j === i}" class="${j === i ? "on" : ""} ${S.lessonsDone.includes(j) ? "done" : ""}" data-a="lesson" data-i="${j}"><span>${String(j + 1).padStart(2, "0")}</span>${esc(l.t)}</button>`).join("")}</div>
      <div class="lc-main">${lessonMainHtml(i)}</div>
      <div class="lc-keys">${lessonKeys(ls)}</div>
      <div class="lc-acts">
        <div style="display:flex;gap:16px;align-items:center">${lessonActsHtml(i)}</div>
        <div class="links"><button data-a="lskip">Skip guide</button><span class="sep"></span><button data-a="range">Practice in firing range</button></div>
      </div></div>`;
    placeVInk($(".lc-list", L.over), "button.on", 8, true);
  }
  function lessonGo(j) { j = clamp(j, 0, K.lessons.length - 1); if (j === S.lesson) return; S.lesson = j; sfx.tick(); renderOver(); }
  function lessonNext() {
    if (!S.lessonsDone.includes(S.lesson)) S.lessonsDone.push(S.lesson);
    if (S.lesson >= K.lessons.length - 1) { pop(); toast(`${I.check} Guide complete · ${S.lessonsDone.length}/10 lessons`); return; }
    lessonGo(S.lesson + 1);
  }

  /* ------------------------------------------------------------------
     INVENTORY
  ------------------------------------------------------------------ */
  function renderInventory() {
    const count = S.inv.filter(Boolean).length, sel = S.invSel, selId = S.inv[sel];
    const card = (id, i) => {
      const cls = [i === sel ? "sel" : "", S.moving != null && i !== S.moving ? "target" : "", S.moving === i ? "moving" : ""].join(" ");
      if (!id) return `<div class="k-card empty ${cls}" data-a="islot" data-i="${i}" data-drop="${i}"><div class="idx">${i + 1}</div><div class="plus">+</div><div class="name">Empty</div></div>`;
      const it = K.items[id];
      return `<div class="k-card ${cls}" data-a="islot" data-i="${i}" data-drop="${i}" draggable="true" data-drag="${i}"><div class="idx">${i + 1}</div><div class="rar ${it.rarity.toLowerCase()}">${it.rarity}</div><div class="art"><img src="${it.img}" alt=""></div><div class="name">${it.name}</div><div class="stat"><div><small>Damage</small><b>${it.damage}</b></div>${id === S.equipped ? '<span class="eq">Equipped</span>' : ""}</div></div>`;
    };
    const acts = invActsHtml();
    const ammoC = { light: "#EEEADF", heavy: "#F28F45", shells: "#E5534B", rockets: "#58BCEB" }, max = { light: 300, heavy: 40, shells: 48, rockets: 8 };
    L.over.innerHTML = `<div class="scr">
      <div class="iv-top" style="background-image:url(img/art/inventory-top.jpg)"></div>
      <button class="iv-close k-hint" data-a="back" style="color:var(--kong-text)">${lit("Esc", "solid")} Close</button>
      <div class="iv">
        <div class="iv-head"><h1 class="k-display">Inventory</h1><span class="cnt"><b>${count}</b> / 5</span><span class="line"></span></div>
        <div class="iv-slots">${S.inv.map(card).join("")}</div>
        <div class="iv-acts" style="padding-left:${Math.min(sel * 360, 1180)}px">${acts}</div>
        <div class="iv-ammo">${Object.keys(max).map((k) => `<div>${I.bullet(ammoC[k])}<span>${k}</span><b>${S.reserve[k]} <em>/ ${max[k]}</em></b><i class="bar" style="background:linear-gradient(90deg, ${ammoC[k]} ${S.reserve[k] / max[k] * 100}%, #2A3436 0)"></i></div>`).join("")}</div>
      </div></div>`;
    wireInventoryDrag();
  }
  function invActsHtml() {
    const selId = S.inv[S.invSel];
    return S.moving != null
      ? `<span class="moving">Moving ${K.items[S.inv[S.moving]].name} · choose a slot</span><span class="sep"></span><button data-a="imove-cancel">${lit("Esc")} Cancel</button>`
      : selId
        ? `<button data-a="iequip" ${selId === S.equipped ? "disabled" : ""}>${lit("E", selId === S.equipped ? "" : "solid")} ${selId === S.equipped ? "Equipped" : "Equip"}</button><span class="sep"></span><button data-a="imove">${lit("R", "solid")} Move</button><span class="sep"></span><button data-a="idrop">${lit("X", "solid")} Drop</button>`
        : `<span class="k-hint">Empty slot${S.dropped ? "" : " · pick up items in the world"}</span>${S.dropped ? `<span class="sep"></span><button data-a="iundo">${lit("Z", "solid")} Pick up ${K.items[S.dropped.id].name}</button>` : ""}`;
  }
  function invSelect(i) {
    i = clamp(i, 0, 4); if (i === S.invSel) return; S.invSel = i;
    L.over.querySelectorAll(".k-card[data-i]").forEach((c) => c.classList.toggle("sel", +c.dataset.i === i));
    const a = $(".iv-acts", L.over); if (a) { a.style.paddingLeft = Math.min(i * 360, 1180) + "px"; a.innerHTML = invActsHtml(); swap(a); }
    sfx.tick();
  }
  function wireInventoryDrag() {
    L.over.querySelectorAll("[data-drag]").forEach((el) => el.addEventListener("dragstart", (e) => { e.dataTransfer.setData("text/plain", el.dataset.drag); e.dataTransfer.effectAllowed = "move"; }));
    L.over.querySelectorAll("[data-drop]").forEach((el) => {
      el.addEventListener("dragover", (e) => { e.preventDefault(); el.classList.add("dragover"); });
      el.addEventListener("dragleave", () => el.classList.remove("dragover"));
      el.addEventListener("drop", (e) => { e.preventDefault(); const from = +e.dataTransfer.getData("text/plain"); swapSlots(from, +el.dataset.drop); });
    });
  }
  function swapSlots(a, b) { if (a === b || isNaN(a)) { renderOver(); return; } const t = S.inv[a]; S.inv[a] = S.inv[b]; S.inv[b] = t; S.invSel = b; S.moving = null; sfx.select(); renderOver(); }
  function invAct(a) {
    const id = S.inv[S.invSel];
    if (a === "equip" && id && id !== S.equipped) { S.equipped = id; sfx.select(); toast(`${I.check} ${K.items[id].name} equipped`, { ms: 1400 }); renderOver(); }
    else if (a === "move" && id) { S.moving = S.invSel; sfx.select(); renderOver(); }
    else if (a === "drop" && id) {
      S.dropped = { id, slot: S.invSel }; S.inv[S.invSel] = null;
      if (S.equipped === id) S.equipped = S.inv.find(Boolean) || null;
      sfx.back(); renderOver();
      toast(`Dropped ${K.items[id].name} <button class="k-action" data-toast-act>Undo</button>`, { ms: 4000, onAction: () => invAct("undo") });
    } else if (a === "undo" && S.dropped) {
      const free = S.inv[S.dropped.slot] ? S.inv.indexOf(null) : S.dropped.slot; if (free < 0) return;
      S.inv[free] = S.dropped.id; if (!S.equipped) S.equipped = S.dropped.id; S.invSel = free; S.dropped = null; sfx.select(); renderOver();
    }
  }

  /* ------------------------------------------------------------------
     MAP
  ------------------------------------------------------------------ */
  const PLACES = [["Ripe Peak", 550, 280], ["Coco Caves", 375, 345], ["Mist Falls", 710, 345], ["Wreck Bay", 800, 170], ["Banana Temple", 865, 432], ["Peel Strip", 490, 475], ["The Wreck", 370, 548], ["Coconut Cove", 720, 684], ["Peel Harbor", 1060, 665]];
  const mapV = { z: 1, x: 0, y: 0 };
  function nearest(p) { let b = null, d = 1e9; PLACES.forEach((q) => { const dd = Math.hypot(q[1] - p.x, q[2] - p.y); if (dd < d) { d = dd; b = q; } }); return b[0]; }
  function renderMap() {
    const sx = 1920 / 1672;
    const el = Math.floor((Date.now() - S.matchT0) / 1000);
    L.over.innerHTML = `<div class="scr" style="background:#0c2730">
      <div class="mp-view" id="mp-view"><div class="mp-layer" id="mp-layer"><img src="img/art/map.jpg" alt="Island map">
        <div class="mp-me" style="left:${ME.x * sx}px;top:${ME.y * sx}px;transform:rotate(${heading()}deg)"></div>
        ${S.marker ? `<div class="mp-pin" style="left:${S.marker.x * sx}px;top:${S.marker.y * sx}px">${I.pin}</div>` : ""}
      </div></div>
      <div class="mp-zoom" id="mp-zoom">Zoom ${mapV.z.toFixed(1)}x</div>
      <div class="mp-side">
        <div class="mp-head"><div class="alive"><small>${S.mode === "range" ? "Mode" : "Alive"}</small><b>${S.mode === "range" ? "Range" : "50"}</b></div>
          <div class="closes"><span class="k-hint">${keycap(S.bind.map, "solid")} Close map</span><button class="k-hint" data-a="back">${lit("Esc", "solid")} Back to game</button></div></div>
        <div class="mp-phase"><div class="k-eyebrow">${S.mode === "range" ? "In range" : "Warm-up"}</div><b>${I.clock}<span id="mp-clock">${Math.floor(el / 60)}:${String(el % 60).padStart(2, "0")}</span></b></div>
        <div class="mp-legend">
          <div><svg width="34" height="34" viewBox="0 0 34 34"><circle cx="17" cy="17" r="13" fill="none" stroke="#EEEADF" stroke-width="2"/></svg>Next safe zone</div>
          <div><svg width="34" height="34" viewBox="0 0 34 34"><rect x="5" y="5" width="24" height="24" fill="rgba(128,80,190,.6)" stroke="#9C7BE0" stroke-width="2"/></svg>Storm</div>
          <div><svg width="34" height="34" viewBox="0 0 34 34"><path d="M2 17h30" stroke="#EABC39" stroke-width="3" stroke-dasharray="6 4"/></svg>Flight path</div>
          <div><svg width="34" height="34" viewBox="0 0 34 34"><path d="M17 4l9 24-9-6-9 6z" fill="#EEEADF"/></svg>You</div>
          <div><svg width="34" height="40" viewBox="0 0 34 46">${I.pin.replace(/<\/?svg[^>]*>/g, "")}</svg>Your marker<em id="mp-mk">${S.marker ? "near " + esc(nearest(S.marker)) : "not placed"}</em></div>
        </div>
        <div></div>
      </div>
      <div class="mp-foot"><span class="k-hint">${I.mouse("left")} Place marker</span><span class="k-hint">${I.mouse("right")} Remove marker</span><span class="k-hint">${I.mouse("wheel")} Zoom</span><span class="k-hint">Drag to pan</span></div>
    </div>`;
    applyMapView();
    const view = $("#mp-view", L.over);
    let drag = null;
    view.addEventListener("pointerdown", (e) => { if (e.button !== 0) return; drag = { x: e.clientX, y: e.clientY, vx: mapV.x, vy: mapV.y, moved: false }; view.setPointerCapture(e.pointerId); });
    view.addEventListener("pointermove", (e) => { if (!drag) return; const dx = (e.clientX - drag.x) / scale, dy = (e.clientY - drag.y) / scale; if (Math.hypot(dx, dy) > 6) { drag.moved = true; view.classList.add("grab"); } if (drag.moved) { mapV.x = drag.vx + dx; mapV.y = drag.vy + dy; applyMapView(); } });
    view.addEventListener("pointerup", (e) => { if (!drag) return; const moved = drag.moved; drag = null; view.classList.remove("grab"); if (!moved) { const p = toStage(e); const mx = (p.x - mapV.x) / mapV.z / sx, my = (p.y - mapV.y) / mapV.z / sx; S.marker = { x: mx, y: my }; sfx.select(); S.hints.map = true; renderMapKeepView(); } });
    view.addEventListener("contextmenu", (e) => { e.preventDefault(); if (S.marker) { S.marker = null; sfx.back(); renderMapKeepView(); } });
    view.addEventListener("wheel", (e) => { e.preventDefault(); const p = toStage(e); const nz = clamp(mapV.z * (e.deltaY < 0 ? 1.15 : 1 / 1.15), 1, 3.2); mapV.x = p.x - (p.x - mapV.x) * nz / mapV.z; mapV.y = p.y - (p.y - mapV.y) * nz / mapV.z; mapV.z = nz; applyMapView(); }, { passive: false });
    const clk = () => { const c = document.getElementById("mp-clock"); if (!c || !top() || top().id !== "map") return; const s = Math.floor((Date.now() - S.matchT0) / 1000); c.textContent = `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`; later(clk, 1000); }; later(clk, 1000);
  }
  function renderMapKeepView() { renderOver(); }
  function applyMapView() {
    const minX = 1920 - 1920 * mapV.z, minY = 1080 - 1080 * mapV.z;
    mapV.x = clamp(mapV.x, minX, 0); mapV.y = clamp(mapV.y, minY, 0);
    const l = $("#mp-layer", L.over); if (l) l.style.transform = `translate(${mapV.x}px,${mapV.y}px) scale(${mapV.z})`;
    const z = $("#mp-zoom", L.over); if (z) z.textContent = `Zoom ${mapV.z.toFixed(1)}x`;
  }

  /* ------------------------------------------------------------------
     Events
  ------------------------------------------------------------------ */
  function bindEvents() {
    stage.addEventListener("click", onClick);
    stage.addEventListener("mousemove", onMove);
    stage.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", () => { fire.down = false; if (S && S.set.aimMode === "Hold") S.aiming = false; });
    stage.addEventListener("contextmenu", (e) => { if (S.base === "hud" && !top()) e.preventDefault(); });
    stage.addEventListener("pointerover", (e) => {
      const row = e.target.closest && e.target.closest(".k-row"); const o = top();
      if (row && o && o.id === "settings" && !capture) selRow(o, +row.dataset.row);
      const mi = e.target.closest && e.target.closest(".mn-item[data-i]");
      if (mi && o && o.id === "menu" && +mi.dataset.i !== o.sel) { setMenuSel(o, +mi.dataset.i); sfx.tick(); }
    });
    stage.addEventListener("pointerdown", onSliderDown);
    document.addEventListener("keydown", onKey, true);
    document.addEventListener("pointerlockchange", () => {
      const was = locked; locked = document.pointerLockElement === stage;
      if (was && !locked) { if (selfUnlock) selfUnlock = false; else if (S.base === "hud" && !top()) { autoMenuAt = now(); push({ id: "menu", sel: 0 }); } }
    });
    document.addEventListener("pointerlockerror", () => { lockFailed = true; });
    // gamepad polling for stick viz
    setInterval(() => { const d = document.getElementById("stickdot"); if (!d) return; const g = padConnected(); if (!g) return; const o = top(); const ax = o && o.row === 0 ? [g.axes[0], g.axes[1]] : [g.axes[2], g.axes[3]]; d.setAttribute("cx", 120 + (ax[0] || 0) * 100); d.setAttribute("cy", 120 + (ax[1] || 0) * 100); }, 50);
  }
  function visible() { return stage && stage.offsetParent !== null && !document.getElementById("player").hidden; }

  let sliderDrag = null;
  function onSliderDown(e) {
    const tr = e.target.closest && e.target.closest(".k-track"); if (!tr) return;
    const id = tr.dataset.slider, r = ROWS[id]; e.preventDefault();
    sliderDrag = { id, tr }; tr.classList.add("drag"); tr.setPointerCapture(e.pointerId);
    const upd = (ev) => { const rect = tr.getBoundingClientRect(); const p = clamp((ev.clientX - rect.left) / rect.width, 0, 1); setSliderVal(id, r.min + p * (r.max - r.min)); };
    upd(e);
    const mv = (ev) => upd(ev), up = () => { tr.classList.remove("drag"); tr.removeEventListener("pointermove", mv); tr.removeEventListener("pointerup", up); sliderDrag = null; sfx.tick(); };
    tr.addEventListener("pointermove", mv); tr.addEventListener("pointerup", up);
  }
  function setSliderVal(id, v) {
    const r = ROWS[id]; v = clamp(Math.round(v / r.step) * r.step, r.min, r.max); v = +v.toFixed(3);
    if (S.set[id] === v) return;
    S.set[id] = v;
    const row = L.over.querySelector(`[data-slider="${id}"]`); const p = (v - r.min) / (r.max - r.min) * 100;
    if (row) { row.querySelector(".fill").style.width = p + "%"; row.querySelector(".thumb").style.left = p + "%"; }
    const val = L.over.querySelector(`[data-val="${id}"]`); if (val) val.textContent = fmtVal(r);
    if (["textScale", "hudScale"].includes(id)) applyGlobals();
    const o = top(); if (o) renderHelp(o);
    saved();
  }

  function onClick(e) {
    audio();
    if (dialogOpen) { const d = e.target.closest("[data-dlg]"); if (d) closeDialog(d.dataset.dlg === "ok"); else if (e.target.classList.contains("k-scrim")) closeDialog(false); return; }
    const t = e.target.closest("[data-a]");
    const o = top();
    if (!t) {
      if (S.base === "hud" && !o) { if (!locked && !lockFailed) { requestLock(); } }
      return;
    }
    const a = t.dataset.a, v = t.dataset.v, i = +t.dataset.i;
    switch (a) {
      // lobby
      case "ltab": lobbyTab(v); break;
      case "squad": setSquad(v); break;
      case "play": startSearch(); break;
      case "cancelsearch": S.search = null; sfx.back(); updatePlay(); break;
      case "range": S.over = []; S.search = null; startLoading("range"); break;
      case "learn": push({ id: "learn" }); break;
      case "settings": push({ id: "settings", cat: "mk", sec: 0, row: 0 }); break;
      case "editcs": S.editCs = true; sfx.select(); renderAll(); break;
      case "cscancel": S.editCs = false; sfx.back(); renderAll(); break;
      case "tolobby": toLobby(); break;
      case "rate": S.ratings[t.dataset.q] = +v; sfx.tick(); { const r = $("#rs-rates", L.base); if (r) r.innerHTML = rateHtml(); } break;
      case "tipnext": if (S.loading) { S.loading.tip++; const tt = $(".ld-tip", L.base); if (tt) tt.innerHTML = tipHtml(S.loading.tip); sfx.tick(); } break;
      // generic
      case "back": pop(); break;
      // menu
      case "menu": o.sel = i; menuAct(v); break;
      // report
      case "rpcat": rpSetCat(i); break;
      case "rpsend": sendReport(); break;
      case "rp-close": closeAll(); break;
      case "rp-menu": S.report = { cat: null, text: "", state: "idle", err: "" }; pop(); break;
      // settings
      case "cat": o.cat = v; o.sec = 0; o.row = 0; capture = null; sfx.tick(); renderOver(); break;
      case "sec": o.sec = i; o.row = 0; capture = null; sfx.tick(); renderOver(); break;
      case "cyc": { const r = ROWS[t.dataset.id]; selRow(o, rowsOf(o).indexOf(r)); adjust(r, +t.dataset.d); break; }
      case "sw": { const r = ROWS[t.dataset.id]; setVal(r.id, !S.set[r.id]); sfx.select(); break; }
      case "seg": setVal(t.dataset.id, v); sfx.tick(); break;
      case "bind": if (capture && capture.action === t.dataset.act) return; selRow(o, rowsOf(o).findIndex((r) => r.action === t.dataset.act)); startCapture(t.dataset.act); break;
      case "preview": sfx.hit(); break;
      case "mictest": toggleMic(); break;
      case "restore": restoreDefaults(o); break;
      // learn
      case "lesson": lessonGo(i); break;
      case "lnext": lessonNext(); break;
      case "lprev": lessonGo(S.lesson - 1); break;
      case "lskip": pop(); break;
      // inventory
      case "islot":
        if (S.moving != null) { swapSlots(S.moving, i); }
        else invSelect(i);
        break;
      case "iequip": invAct("equip"); break;
      case "imove": invAct("move"); break;
      case "idrop": invAct("drop"); break;
      case "iundo": invAct("undo"); break;
      case "imove-cancel": S.moving = null; sfx.back(); renderOver(); break;
    }
  }
  function onMove(e) {
    if (S.base === "lobby" && !top() && !motionOff()) { const art = document.getElementById("lb-art"); if (art) { const p = toStage(e); art.style.transform = `translate(${(p.x / 1920 - 0.5) * -18}px, ${(p.y / 1080 - 0.5) * -10}px)`; } }
    if (S.base !== "hud" || top()) return;
    const sens = S.set.mouseSens * (S.aiming ? S.set.aimSens : 1), inv = S.set.invertY === "On" ? -1 : 1;
    if (locked) { S.look.tx = clamp(S.look.tx + e.movementX * sens * 0.0016, -1, 1); S.look.ty = clamp(S.look.ty + e.movementY * sens * 0.0022 * inv, -0.6, 0.6); }
    else { const p = toStage(e); S.look.tx = clamp(((p.x / 1920) * 2 - 1) * Math.min(1, sens * 1.4), -1, 1); S.look.ty = clamp(((p.y / 1080) * 2 - 1) * 0.6 * inv * Math.min(1, sens * 1.4), -0.6, 0.6); }
  }
  function onDown(e) {
    audio();
    if (capture && [1, 3, 4].includes(e.button)) { e.preventDefault(); finishCapture("Mouse" + { 1: 3, 3: 4, 4: 5 }[e.button]); return; }
    if (S.base !== "hud" || top() || dialogOpen) return;
    if (capture) return;
    if (e.button === 2) { S.aiming = S.set.aimMode === "Toggle" ? !S.aiming : true; return; }
    if (e.button !== 0) return;
    if (!locked && !lockFailed && !lockTried) return; // first click captures
    if (!locked && !lockFailed) return;
    fire.down = true; shoot();
  }

  function codeOf(e) { return e.code; }
  function onKey(e) {
    if (!visible()) return;
    const code = codeOf(e);
    const inField = e.target && /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName) && stage.contains(e.target);
    const outside = e.target && e.target.closest && e.target.closest(".player-bar, .player-keys");
    if (outside) return;
    audio();
    // binding capture swallows everything
    if (capture) {
      e.preventDefault(); e.stopPropagation();
      if (code === "Escape") finishCapture(null); else if (code === "Backspace" || code === "Delete") finishCapture(""); else finishCapture(code);
      return;
    }
    if (dialogOpen) {
      e.preventDefault();
      if (code === "Escape") closeDialog(false);
      else if (code === "ArrowLeft" || code === "ArrowRight" || code === "Tab") dialogFocus(dialogOpen.sel ? 0 : 1);
      else if (code === "Enter" || code === "Space") closeDialog(dialogOpen.sel === 1);
      return;
    }
    if (inField) {
      if (code === "Escape") { e.preventDefault(); if (S.editCs) { S.editCs = false; renderAll(); } else { e.target.blur(); pop(); } }
      else if (code === "Enter" && (e.ctrlKey || e.metaKey) && top() && top().id === "report") { e.preventDefault(); sendReport(); }
      return;
    }
    const o = top();
    const handled = () => { e.preventDefault(); e.stopPropagation(); };
    if (code === "Tab") e.preventDefault();

    if (!o) {
      if (S.base === "lobby") {
        if (code === "Escape") { handled(); if (S.search) { S.search = null; sfx.back(); updatePlay(); } else if (S.editCs) { S.editCs = false; renderAll(); } else push({ id: "settings", cat: "mk", sec: 0, row: 0 }); }
        else if (code === "Enter") { handled(); if (S.lobbyTab === "training") startLoading("range"); else if (!S.search) startSearch(); }
        return;
      }
      if (S.base === "results") {
        if (code === "Enter" || code === "Escape") { handled(); toLobby(); }
        return;
      }
      if (S.base === "loading") { if (code === "Space" || code === "Enter") { handled(); if (S.loading) { S.loading.tip++; const tt = $(".ld-tip", L.base); if (tt) tt.innerHTML = tipHtml(S.loading.tip); } } return; }
      if (S.base === "hud") {
        const B = S.bind;
        if (code === "Escape") { handled(); push({ id: "menu", sel: 0 }); }
        else if (code === B.inventory) { handled(); S.hints.inv = true; S.invSel = Math.max(0, S.inv.indexOf(S.equipped)); push({ id: "inventory" }); }
        else if (code === B.map) { handled(); S.hints.map = true; push({ id: "map" }); }
        else if (code === B.reload) { handled(); reload(); }
        else if (code === B.heal) { handled(); heal(); }
        else if (code === "KeyK") { handled(); takeDamage(30); }
        else if (code === "KeyV") { handled(); endMatch(); }
        else if (/^Digit[1-5]$/.test(code)) { handled(); equipSlot(+code.slice(5) - 1); }
        return;
      }
      return;
    }
    // overlays
    if (o.id === "menu") {
      const it = menuItems();
      if (code === "Escape") { handled(); if (now() - autoMenuAt > 250) closeAll(); }
      else if (code === "ArrowDown" || code === "KeyS") { handled(); setMenuSel(o, (o.sel + 1) % it.length); sfx.tick(); }
      else if (code === "ArrowUp" || code === "KeyW") { handled(); setMenuSel(o, (o.sel - 1 + it.length) % it.length); sfx.tick(); }
      else if (code === "Enter" || code === "Space") { handled(); menuAct(it[o.sel][0]); }
      return;
    }
    if (o.id === "analytics") { if (code === "Escape" || code === "Backspace") { handled(); pop(); } return; }
    if (o.id === "report") {
      if (code === "Escape") { handled(); if (S.report.state === "sent") { S.report = { cat: null, text: "", state: "idle", err: "" }; } pop(); }
      else if (code === "Enter" && (e.ctrlKey || e.metaKey)) { handled(); if (S.report.state !== "sent") sendReport(); }
      else if (/^Arrow/.test(code) && S.report.state !== "sent") { handled(); const c = S.report.cat == null ? 0 : S.report.cat; const d = { ArrowRight: 1, ArrowLeft: -1, ArrowDown: 4, ArrowUp: -4 }[code]; rpSetCat((c + d + 8) % 8); }
      return;
    }
    if (o.id === "settings") {
      const rows = rowsOf(o), r = rows[o.row], c = catOf(o);
      if (code === "Escape") { handled(); if (micOn) toggleMic(); pop(); }
      else if (code === "ArrowDown") { handled(); selRow(o, o.row + 1, true); }
      else if (code === "ArrowUp") { handled(); selRow(o, o.row - 1, true); }
      else if (code === "ArrowRight") { handled(); adjust(r, 1, e.shiftKey); }
      else if (code === "ArrowLeft") { handled(); adjust(r, -1, e.shiftKey); }
      else if (code === "Enter" || code === "Space") { handled(); activate(r); }
      else if (code === "Tab") { handled(); o.sec = (o.sec + (e.shiftKey ? -1 : 1) + c.secs.length) % c.secs.length; o.row = 0; sfx.tick(); renderOver(); }
      else if (code === "KeyQ" || code === "KeyE") { handled(); const ci = CATS.indexOf(c); o.cat = CATS[(ci + (code === "KeyE" ? 1 : -1) + CATS.length) % CATS.length].id; o.sec = 0; o.row = 0; sfx.tick(); renderOver(); }
      else if (code === "KeyR") { handled(); restoreDefaults(o); }
      return;
    }
    if (o.id === "learn") {
      if (code === "Escape") { handled(); pop(); }
      else if (code === "ArrowRight" || code === "Enter") { handled(); lessonNext(); }
      else if (code === "ArrowLeft") { handled(); lessonGo(S.lesson - 1); }
      else if (code === "ArrowDown") { handled(); lessonGo(S.lesson + 1); }
      else if (code === "ArrowUp") { handled(); lessonGo(S.lesson - 1); }
      return;
    }
    if (o.id === "inventory") {
      if (code === "Escape") { handled(); if (S.moving != null) { S.moving = null; sfx.back(); renderOver(); } else pop(); }
      else if (code === S.bind.inventory) { handled(); S.moving = null; pop(); }
      else if (code === "ArrowRight" || code === "ArrowLeft") { handled(); invSelect(S.invSel + (code === "ArrowRight" ? 1 : -1)); }
      else if (/^Digit[1-5]$/.test(code)) { handled(); invSelect(+code.slice(5) - 1); }
      else if (code === "Enter" && S.moving != null) { handled(); swapSlots(S.moving, S.invSel); }
      else if (code === "KeyE") { handled(); invAct("equip"); }
      else if (code === "KeyR") { handled(); if (S.moving != null) swapSlots(S.moving, S.invSel); else invAct("move"); }
      else if (code === "KeyX") { handled(); invAct("drop"); }
      else if (code === "KeyZ") { handled(); invAct("undo"); }
      return;
    }
    if (o.id === "map") {
      if (code === "Escape" || code === S.bind.map) { handled(); pop(); }
      else if (code === "Equal" || code === "NumpadAdd" || code === "Minus" || code === "NumpadSubtract") { handled(); const nz = clamp(mapV.z * (code === "Equal" || code === "NumpadAdd" ? 1.2 : 1 / 1.2), 1, 3.2); mapV.x = 960 - (960 - mapV.x) * nz / mapV.z; mapV.y = 540 - (540 - mapV.y) * nz / mapV.z; mapV.z = nz; applyMapView(); }
      return;
    }
  }

  /* ------------------------------------------------------------------
     Public
  ------------------------------------------------------------------ */
  function reset() { store.clear(); clearTimers(); closeDialogSilently(); capture = null; S = fresh(); shownBase = null; shownOver = null; applyGlobals(); renderAll(); }
  function onScreen(cb) { onChange = cb; }
  function pause() { releaseLock(); fire.down = false; if (micOn) toggleMic(); }
  function setFailNext(v) { failNextSend = v; }
  return { mount, go, reset, onScreen, setCompare, currentKey, pause, setFailNext, fit, CATS, ROWS, keyLabel };
})();
