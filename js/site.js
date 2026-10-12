/* Feedback site: router, pages, downloads, player shell. */
(function () {
  const K = window.KONG;
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => [...(r || document).querySelectorAll(s)];
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const view = $("#view");
  /* Design system switch: Premium (v3) or Toon (original colours, cartoon feel). */
  const TOON = () => document.documentElement.dataset.ds === "toon";
  const T = (premium, toon) => (TOON() ? toon : premium);
  const HYB = () => document.documentElement.dataset.variant === "hybrid";
  const AFTER = (f) => `img/${HYB() ? "hybrid" : TOON() ? "toon" : "after"}/${f}.jpg`;
  const DSD = () => (HYB() ? Object.assign({}, K.downloads, K.toon.downloads, K.toon.hybridDownloads) : TOON() ? Object.assign({}, K.downloads, K.toon.downloads) : K.downloads);
  const dsSel = document.getElementById("ds-switch");
  if (dsSel) {
    dsSel.value = HYB() ? "hybrid" : TOON() ? "toon" : "premium";
    dsSel.addEventListener("change", () => {
      const v = ["toon", "hybrid"].includes(dsSel.value) ? dsSel.value : "premium";
      document.documentElement.dataset.ds = v === "hybrid" ? "toon" : v;
      if (v === "hybrid") document.documentElement.dataset.variant = "hybrid"; else delete document.documentElement.dataset.variant;
      try { localStorage.setItem("kong-ds", v); } catch (e) { }
      const y = window.scrollY; view.dataset.page = ""; route(); window.scrollTo(0, y);
      if (!document.getElementById("player").hidden && window.Game) Game.go(Game.currentKey());
      siteToast({ toon: "Toon design system", hybrid: "Hybrid design system (Toon with fewer containers)" }[v] || "Premium design system");
    });
  }
  const DL_ICON = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12M7 10l5 5 5-5M4 20h16"/></svg>';

  /* ---------------- toast ---------------- */
  let tT = 0;
  function siteToast(msg) { const t = $("#site-toast"); t.textContent = msg; t.hidden = false; clearTimeout(tT); tT = setTimeout(() => (t.hidden = true), 2600); }

  /* ---------------- downloads ---------------- */
  let dlCap; // undefined = not resolved yet, null = unavailable
  const dlReady = (async () => { try { dlCap = window.claude && window.claude.use ? await window.claude.use("downloads") : null; } catch (e) { dlCap = null; } })();
  async function download(path, filename) {
    let blob;
    try {
      if (path === "zip:logos") blob = await buildLogoZip();
      else { const r = await fetch(path); if (!r.ok) throw new Error(r.status); blob = await r.blob(); }
    }
    catch (e) { siteToast("Couldn't load that file. Try again."); return; }
    await Promise.race([dlReady, new Promise((r) => setTimeout(r, 1500))]);
    if (dlCap) {
      try { await dlCap.save({ filename, data: blob }); siteToast("Saved " + filename); }
      catch (e) { if (e && e.code === "declined") return; if (e && e.code === "rate_limited") siteToast("A save prompt is already open."); else siteToast("Download isn't available here."); }
      return;
    }
    // local fallback (outside the artifact viewer)
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = filename; document.body.appendChild(a); a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
  }
  async function buildLogoZip() {
    siteToast("Packing logos…");
    const zip = new JSZip(), dir = zip.folder("kong-logos");
    const names = K.logos.map((l) => l.file + ".png").concat(K.logos.map((l) => "svg/" + l.file + ".svg"), ["kong-brand-family-concept-sheet.png"]);
    await Promise.all(names.map(async (n) => { const r = await fetch("downloads/logos/" + n); if (!r.ok) throw new Error(n); dir.file(n, await r.blob()); }));
    const md = await fetch(K.downloads.designMd.path).then((r) => r.text()).catch(() => "");
    if (md) zip.file("kong-design-system.md", md);
    return zip.generateAsync({ type: "blob" });
  }
  document.addEventListener("click", (e) => {
    const b = e.target.closest("[data-dl]"); if (!b) return;
    e.preventDefault(); download(b.dataset.dl, b.dataset.name);
  });
  function dlBtn(d, sub) { return `<button class="dl" data-dl="${d.path}" data-name="${d.name}">${DL_ICON}<span><b>${esc(d.label)}</b><small>${esc(sub || d.name)}${d.size ? " · " + d.size : ""}</small></span></button>`; }

  /* ---------------- copy ---------------- */
  document.addEventListener("click", async (e) => {
    const b = e.target.closest("[data-copy]"); if (!b) return;
    const src = b.dataset.copy.startsWith("#") ? $(b.dataset.copy).textContent : b.dataset.copy;
    try { await navigator.clipboard.writeText(src); siteToast("Copied"); }
    catch (err) {
      const el = b.dataset.copy.startsWith("#") ? $(b.dataset.copy) : null;
      if (el) { const r = document.createRange(); r.selectNodeContents(el); const s = getSelection(); s.removeAllRanges(); s.addRange(r); siteToast("Selected. Press Ctrl+C to copy."); }
      else siteToast(src);
    }
  });

  /* ---------------- markdown sources ---------------- */
  const mdCache = {};
  async function md(path) { if (!mdCache[path]) mdCache[path] = fetch(path).then((r) => (r.ok ? r.text() : "")).then((t) => t.split(String.fromCharCode(13)).join("")).catch(() => ""); return mdCache[path]; }

  function parseReview(text) {
    const out = {};
    const parts = text.split(/^## /m).slice(1);
    parts.forEach((p) => {
      const title = p.split("\n")[0].trim();
      const m = title.match(/^(\d\d)\.\s*(.+)$/);
      const field = (name) => { const r = p.match(new RegExp("\\*\\*" + name + ":\\*\\*\\s*([^\\n]+)")); return r ? r[1].trim() : ""; };
      const rec = { title, before: field("Before"), after: field("After"), suggestions: field("Suggestions"), why: field("Why it is better"), prod: field("Production detail"), follow: field("Follow-up"), body: p.split("\n").slice(1).join("\n").trim() };
      if (m) out[m[1]] = rec; else out[title] = rec;
    });
    return out;
  }
  function parsePrompts(text) {
    const parts = text.split(/^## /m).slice(1);
    return parts.map((p) => {
      const lines = p.split("\n"); const head = lines[0].trim();
      const code = (p.match(/```\n([\s\S]*?)```/) || [])[1] || "";
      const intro = p.slice(head.length).split("```")[0].trim();
      const m = head.match(/^(\d+)\.\s*(.+)$/);
      return { n: m ? m[1] : "", title: m ? m[2] : head, intro, code: code.trim() };
    }).filter((x) => x.code);
  }

  /* ---------------- player ---------------- */
  const player = $("#player"), stageEl = $("#stage"), wrap = $("#stagewrap");
  let mounted = false;
  function openPlayer(key) {
    document.body.classList.add("playing"); player.hidden = false;
    if (!mounted) { Game.mount(stageEl, wrap); mounted = true; buildScreenSelect(); }
    Game.fit();
    if (key) Game.go(key);
    stageEl.focus({ preventScroll: true });
  }
  function closePlayer() { if (!mounted) return; Game.pause(); player.hidden = true; document.body.classList.remove("playing"); }
  function buildScreenSelect() {
    const sel = $("#pb-screen");
    sel.innerHTML = [...K.screens].sort((a, b) => order(a) - order(b)).map((s) => `<option value="${s.go}">${s.n} · ${esc(s.short)}</option>`).join("");
    function order(s) { const o = ["lobby", "loading", "hud", "menu", "settings", "report", "learn", "inventory", "map", "results"]; const k = s.go.split(":")[0]; return o.indexOf(k) * 10 + +s.n / 100; }
    sel.addEventListener("change", () => { location.hash = "play-" + sel.value.replace(":", "."); stageEl.focus(); });
    Game.onScreen((key) => {
      const opt = [...sel.options].find((o) => o.value === key);
      if (opt) sel.value = key;
      const h = "#play-" + key.replace(":", ".");
      if (location.hash !== h && !location.hash.startsWith(h + ".") && (location.hash === "#play" || location.hash.startsWith("#play-"))) history.replaceState(null, "", h);
    });
  }
  $("#pb-overlay").addEventListener("change", (e) => { const v = e.target.value; $("#pb-opacity").hidden = v === "off"; Game.setCompare(v, $("#pb-opacity").value / 100); stageEl.focus(); });
  $("#pb-opacity").addEventListener("input", (e) => Game.setCompare($("#pb-overlay").value, e.target.value / 100));
  $("#pb-keys").addEventListener("click", (e) => { const p = $("#pb-keys-panel"); p.hidden = !p.hidden; e.currentTarget.setAttribute("aria-expanded", String(!p.hidden)); requestAnimationFrame(() => Game.fit()); });
  $("#pb-failsend").addEventListener("change", (e) => Game.setFailNext(e.target.checked));
  $("#pb-reset").addEventListener("click", () => { Game.reset(); siteToast("Prototype reset to defaults"); stageEl.focus(); });
  $("#pb-full").addEventListener("click", async () => {
    try { if (document.fullscreenElement) await document.exitFullscreen(); else await player.requestFullscreen(); }
    catch (e) { siteToast("Fullscreen isn't available in this view."); }
  });

  /* ---------------- router ---------------- */
  function route() {
    const h = (location.hash || "#home").slice(1);
    if (h === "play" || h.startsWith("play-")) { const key = h.length > 4 ? h.slice(5).replace(".", ":") : "lobby"; openPlayer(key); setNav("playtest"); return; }
    closePlayer();
    let page = "home", anchor = null;
    if (h === "design-system" || h.startsWith("ds-")) { page = "ds"; anchor = h.startsWith("ds-") ? h : null; }
    else if (h === "opus-feedback" || h.startsWith("op-")) { page = "op"; anchor = h.startsWith("op-") ? h : null; }
    else if (h.startsWith("playtest") || h.startsWith("screen-") || h.startsWith("pt-") || h.startsWith("gp-")) { page = "pt"; anchor = h.startsWith("playtest") ? null : h; }
    if (view.dataset.page !== page) {
      view.dataset.page = page;
      ({ home: renderHome, ds: renderDS, pt: renderPlaytest, op: renderOpus })[page]();
      if (!anchor) window.scrollTo(0, 0);
    }
    setNav(page === "ds" ? "design-system" : page === "pt" ? "playtest" : page === "op" ? "opus" : "home");
    if (anchor) requestAnimationFrame(() => { const el = document.getElementById(anchor); if (el) el.scrollIntoView({ block: "start" }); });
  }
  function setNav(k) { $$(".topbar-nav a").forEach((a) => { if (a.dataset.nav === k) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current"); }); }
  window.addEventListener("hashchange", route);

  /* =====================================================================
     HOME
  ===================================================================== */
  function renderHome() {
    const thumbs = ["12-lobby", "01-settings-mouse", "10-gameplay-hud", "09-inventory", "11-world-map"];
    view.innerHTML = `
    <div class="wrap">
      <section class="home-hero">
        <div class="eyebrow">Feedback, ideas and inputs</div>
        <h1 class="display">RET's <span class="y">Kong Royale</span> feedback</h1>
        <p>Every playtest session and design pass in one place, with the screens, documents and assets attached to it. The design system sits on its own so it can be downloaded and handed to whoever builds it.</p>
      </section>

      <section class="section" style="padding-top:8px">
        <div class="section-head"><div class="eyebrow">Reference</div></div>
        <article class="ds-feature">
          <a class="ds-feature-art" href="#design-system" aria-label="Open the Kong Royale design system">
            <img class="lockup" src="img/brand/kong-royale-lockup.png" alt="Kong Royale">
            <div class="ds-swatches">${(TOON() ? ["#071422", "#0E2A3D", "#17405A", "#04101A", "#FFF8E7", "#A9C6DA", "#FFD21A", "#4FB6EA", "#3EC4FF", "#4CC35A", "#2F8BFF", "#FF4D5E"] : ["#101719", "#172022", "#253033", "#465052", "#EEEADF", "#A5B1A4", "#EABC39", "#58BCEB", "#7AD7A5", "#FF8C88"]).map((c) => `<span style="background:${c}"></span>`).join("")}</div>
          </a>
          <div class="ds-feature-body">
            <div class="eyebrow plain">${HYB() ? "Hybrid · Toon with fewer containers" : T("Premium v3 · proposed", "Toon · original colours")}</div>
            <h3 class="display">${HYB() ? "Kong Royale Hybrid design system" : T("Kong Royale design system", "Kong Royale Toon design system")}</h3>
            <p>${T("Brand family, colour and type tokens, live components, layout templates, interaction rules and step-by-step prompts for implementing it in the game.", "The original Kong Royale colours made clean and chunky: banana yellow, deep navy, thick outlines and bouncy buttons. Same components and layouts as Premium, with its own tokens, prompts and prototype skin.")}</p>
            <p class="muted" style="font-size:13px">Switch between Premium and Toon with the Design system menu at the top. The whole site and the prototype follow it.</p>
            <div class="btnrow"><a class="btn primary" href="#design-system">Open design system <span class="arrow">→</span></a></div>
            <div class="dlbar">${dlBtn(DSD().designMd)}${dlBtn(K.downloads.logosZip)}</div>
          </div>
        </article>
      </section>

      <section class="section" id="home-video" style="padding-top:8px">
        <div class="section-head"><div class="eyebrow">Showcase · 1:34</div><h2 class="display">The feedback in 90 seconds</h2>
          <p>The redesign, the playable prototype, the gameplay review and the new damage feedback, cut to an original ElevenLabs track. No voiceover.</p></div>
        <video class="showcase" controls preload="metadata" poster="${AFTER("10-gameplay-hud")}" src="downloads/kong-royale-feedback-showcase${T("", "-toon")}.mp4?v=3"></video>
        <div class="dlbar" style="margin-top:14px">${dlBtn({ path: `downloads/kong-royale-feedback-showcase${T("", "-toon")}.mp4`, name: `kong-royale-feedback-showcase${T("", "-toon")}.mp4`, label: T("Showcase video", "Toon showcase video"), size: "13 MB" }, "MP4 · 1080p")}</div>
      </section>

      ${opusHomeCard()}

      <section class="section">
        <div class="section-head"><div class="eyebrow">Feedback sessions</div><h2 class="display">Sessions</h2></div>
        <div class="sessions">
          <article class="session">
            <div class="session-date"><span class="m">Oct 2026</span><span class="d">10</span><span class="m">Saturday</span></div>
            <div class="session-body">
              <div style="display:flex;gap:10px;flex-wrap:wrap"><span class="tag live">Interactive</span><span class="tag">14 screens</span><span class="tag">Recording</span><span class="tag">Gameplay feedback</span><span class="tag">Brand family</span></div>
              <h3 class="display"><a href="#playtest-2026-10-10">Playtest feedback · October 10, 2026</a></h3>
              <p>A full redesign pass over the 14 screens captured in the playtest: settings, match menu, report, learn controls, inventory, HUD, map, lobby, loading and match results. Each screen has the original screenshot, the premium concept, the review notes and a playable version.</p>
              <div class="thumbstrip">${thumbs.map((f) => `<a href="#screen-${f.slice(0, 2)}" aria-label="${f}"><img src="${AFTER(f)}" alt="" loading="lazy"></a>`).join("")}<a class="more" href="#playtest-2026-10-10">+9 more</a></div>
              <div class="btnrow"><a class="btn primary" href="#playtest-2026-10-10">View suggestions <span class="arrow">→</span></a><a class="btn" href="#pt-screens">See the screens</a><a class="btn" href="#play-lobby">Play the prototype</a><a class="btn" href="${K.recording.url}" target="_blank" rel="noopener">Watch RET's recording ↗</a></div>
              <div>
                <div class="eyebrow plain" style="margin:8px 0 4px">Attached</div>
                <ul class="attach">
                  <li><span class="k">★</span><a href="#pt-gameplay">Gameplay feedback (Ret + Opus 5.5)</a></li>
                  <li><span class="k">▶</span><a href="${K.recording.url}" target="_blank" rel="noopener">Gameplay recording (RET) · Google Drive</a></li>
                  <li><span class="k">14</span>Original playtest screenshots</li>
                  <li><span class="k">14</span>Redesigned screen concepts</li>
                  <li><span class="k">24</span>Earlier concept explorations (v1, v2)</li>
                  <li><span class="k">1</span>Interactive prototype of all 14 screens</li>
                  <li><span class="k">1</span>KONG / ROYALE / OF DUTY brand sheet</li>
                  <li><span class="k">.md</span>Screen-by-screen review</li>
                  <li><span class="k">.md</span>Implementation brief</li>
                  <li><span class="k">.md</span>Image generation prompts</li>
                </ul>
              </div>
            </div>
          </article>
        </div>
        <p class="future">New sessions will be added here as they happen.</p>
      </section>
    </div>`;
  }

  /* =====================================================================
     DESIGN SYSTEM
  ===================================================================== */
  function renderDS() {
    const D = DSD(), DS = TOON() ? K.toon : K;
    const typeSample = (r) => {
      const [name, size, weight, kind, px, text] = r;
      const outline = TOON() ? "font-weight:400;font-stretch:normal;-webkit-text-stroke:5px #04101A;paint-order:stroke fill;text-shadow:0 4px 0 #04101A;" : "";
      const st = TOON() ? { display: `font-family:var(--f-display);${outline}text-transform:uppercase;font-size:${px * 0.7}px;line-height:1`, title: `font-family:var(--f-display);${outline}font-size:${px * 0.7}px;line-height:1.1`, ctx: `font-family:var(--f-display);font-size:${px}px`, label: `font-size:${px}px;font-weight:800`, body: `font-size:${px}px;font-weight:600;line-height:1.5;color:var(--muted)`, nav: `font-weight:900;letter-spacing:.08em;text-transform:uppercase;font-size:${px}px;white-space:pre`, support: `font-size:${px}px;font-weight:700;color:var(--muted)`, key: "", hud: `font-family:var(--f-display);${outline.replace("5px", "4px")}font-size:${px}px` }[kind] : { display: `font-family:var(--f-display);font-stretch:72%;font-weight:850;text-transform:uppercase;font-size:${px * 0.75}px;line-height:1`, title: `font-family:var(--f-display);font-stretch:78%;font-weight:850;font-size:${px * 0.75}px;line-height:1.1`, ctx: `font-family:var(--f-display);font-stretch:80%;font-weight:800;font-size:${px}px`, label: `font-size:${px}px;font-weight:500`, body: `font-size:${px}px;line-height:1.5;color:var(--muted)`, nav: `font-family:var(--f-label);font-weight:600;letter-spacing:.18em;text-transform:uppercase;font-size:${px}px;white-space:pre`, support: `font-size:${px}px;color:var(--muted)`, key: "", hud: `font-family:var(--f-display);font-stretch:85%;font-weight:800;font-size:${px}px` }[kind];
      const sample = kind === "key" ? `<span class="k-scope"><span class="k-key">Esc</span> <span class="k-key">Shift</span> <span class="k-key">R</span></span>` : `<span style="${st}">${esc(text)}</span>`;
      return `<div class="typerow"><div class="spec"><b>${name}</b>${size} · ${weight}${kind === "display" || kind === "title" ? T(" · shown at 75%", " · shown at 70%") : ""}</div><div class="sample">${sample}</div></div>`;
    };
    view.innerHTML = `
    <div class="wrap">
      <section class="page-hero">
        <div class="crumbs"><a href="#home">Sessions</a> / Design system</div>
        <h1 class="display">${HYB() ? "Kong Royale<br>Hybrid system" : T("Kong Royale<br>design system", "Kong Royale<br>Toon system")}</h1>
        ${HYB() ? `<p class="eyebrow plain" style="color:var(--accent)">Hybrid: everything below is Toon, but content uses open rows and typography like Premium. Only things you press or pick up stay chunky.</p>` : ""}
        <p>${T("Premium v3. Calm, readable, predictable interface; the gorillas, banana weapons and island art carry the personality. These rules and tokens are the source of truth wherever a concept image disagrees.", "Toon. The original Kong Royale colours, made clean and chunky: banana yellow on deep navy, thick dark outlines, hard drop shadows, rounded pills and springy motion. Playful like the game, still easy to read. Same components, layouts and rules as Premium, with its own look.")}</p>
        <div class="dlbar">${dlBtn(D.designMd, "Full system as Markdown")}${dlBtn(D.logosZip, "SVG + PNG")}${dlBtn(D.prompts, "8 staged prompts")}${dlBtn(D.tokens, "CSS custom properties")}</div>
      </section>
    </div>
    <nav class="subnav" aria-label="Design system sections"><div class="wrap">
      ${[["ds-brand", "Brand"], ["ds-color", "Colour"], ["ds-type", "Type"], ["ds-space", "Spacing & shape"], ["ds-components", "Components"], ["ds-layouts", "Layouts"], ["ds-interaction", "Interaction"], ["ds-prompts", "Implementation prompts"], ["ds-spec", "Full spec"]].map(([id, t]) => `<a href="#${id}" data-sec="${id}">${t}</a>`).join("")}
    </div></nav>
    <div class="wrap">

      <section class="section" id="ds-brand">
        <div class="section-head"><div class="eyebrow">Brand architecture</div><h2 class="display">One master, two games</h2><p>KONG is the parent brand. ROYALE and OF DUTY are descriptors set beneath the same master wordmark. The KONG letterforms, the brow motif in the O and the spacing are never redrawn per game.</p></div>
        <div class="brand-grid">${K.logos.map((l) => `
          <div class="brand-cell ${l.bg === "light" ? "light" : ""}">
            <div class="art"><img class="${l.icon ? "icon" : ""}" src="img/brand/${l.file}.png" alt="${esc(l.title)}" loading="lazy"></div>
            <div class="meta"><div><b>${esc(l.title)}</b><div class="muted" style="font-size:14px">${esc(l.use)}</div></div>
            <span class="btnrow" style="gap:8px"><button class="dl" data-dl="downloads/logos/svg/${l.file}.svg" data-name="${l.file}.svg" aria-label="Download ${esc(l.title)} as SVG">${DL_ICON}<span><b>SVG</b><small>vector</small></span></button><button class="dl" data-dl="downloads/logos/${l.file}.png" data-name="${l.file}.png" aria-label="Download ${esc(l.title)} as PNG">${DL_ICON}<span><b>PNG</b><small>transparent</small></span></button></span></div>
          </div>`).join("")}
        </div>
        <div class="btnrow" style="margin-top:16px">${dlBtn(D.logosZip, "8 logos as SVG and PNG + concept sheet")}<button class="dl" data-dl="downloads/logos/kong-brand-family-concept-sheet.png" data-name="kong-brand-family-concept-sheet.png">${DL_ICON}<span><b>Concept sheet</b><small>original raster · 1.3 MB</small></span></button></div>
        <p class="muted" style="font-size:14px;max-width:72ch;margin-top:14px">Every logo comes as an SVG (scales to any size) and a transparent PNG, recoloured to production saffron #EABC39 (the concept sheet uses a brighter exploration yellow). The SVGs were auto-traced from the concept sheet, so give them a designer pass for optical kerning and small-size variants before treating them as final masters.</p>
        <ul class="rules">
          <li><b>Stacked lockup.</b> Descriptor cap height ≈ 16% of KONG cap height; gap ≈ 14%.</li>
          <li><b>Clear space.</b> At least 25% of the KONG cap height on every side.</li>
          <li><b>Colour.</b> ${T("Saffron KONG with ivory descriptor on navy; single navy mark on light surfaces.", "Banana KONG with ivory descriptor on navy. In Toon the mark carries a 3px dark outline and a hard 6px drop so it pops off art.")}</li>
          <li><b>Small sizes.</b> Test full lockups from 160 px wide. Below that, use the KONG master or the brow icon.</li>
          <li><b>Where it appears.</b> Full brand on lobby and loading; compact in settings; omitted from in-match dialogs.</li>
          <li><b>Never.</b> ${T("Extrusion, bevels, crowns, planks, gradients or foliage attached to the mark.", "Deep 3D extrusion, bevels, crowns, planks or foliage. The outline and one hard drop are the only effects.")}</li>
        </ul>
      </section>

      <section class="section" id="ds-color">
        <div class="section-head"><div class="eyebrow">Colour tokens</div><h2 class="display">${T("Charcoal, bone, saffron", "Navy, banana, sky")}</h2><p>${T("Saffron marks the one primary action or the active selection. Status colours always travel with a label or icon; rarity always has a text label. Select a swatch to copy its token.", "Taken from the original game: the deep navy menus, the banana-yellow logo and buttons, the lobby sky. Yellow is still the primary action and the selection. Everything interactive sits on a #04101A outline. Rarity colours fill the whole item card, like the original. Select a swatch to copy its token.")}</p></div>
        <div class="swatches">${DS.colors.map(([n, v, hex, use]) => `<button class="swatch" data-copy="var(${v})"><span class="chip" style="background:${hex}"></span><span class="info"><span class="name">${v}</span><span class="hex">${hex} · ${n}</span><span class="use">${esc(use)}</span></span></button>`).join("")}</div>
        <p class="muted" style="font-size:14px;margin-top:16px">Candidate values. Measure contrast on the real rendered backgrounds, including transparency and focus states.</p>
      </section>

      <section class="section" id="ds-type">
        <div class="section-head"><div class="eyebrow">Typography</div><h2 class="display">Two families, nine roles</h2><p>${T("Changa One, a chunky rounded display face, for titles and big numbers; Barlow, a readable UI sans, for labels, descriptions and navigation.", "Lilita One, a bold rounded cartoon face, for titles and big numbers, always with a dark outline and a hard drop; Nunito, a rounded sans in ExtraBold and Black, for labels, tabs and help text.")} Sizes are logical pixels on the 1920×1080 reference canvas. Uppercase with tracking only for short navigation and eyebrows; sentence case everywhere else. Tabular numerals throughout.</p></div>
        <div class="typescale">${DS.typeRoles.map(typeSample).join("")}</div>
        <p class="muted" style="font-size:14px;margin-top:16px">${T("Headings use <b>Changa One</b>; interface text uses <b>Barlow</b> and <b>Barlow Semi Condensed</b>.", "Headings use <b>Lilita One</b> with a 4–6px #04101A outline painted behind the fill; interface text uses <b>Nunito</b> at 700–900.")} All are free Google Fonts (SIL Open Font License), so they can be bundled with the game.</p>
      </section>

      <section class="section" id="ds-space">
        <div class="section-head"><div class="eyebrow">Spacing & shape</div><h2 class="display">${T("An 8-point rhythm, nearly square corners", "An 8-point rhythm, big friendly corners")}</h2><p>${T("Screen safe area 48 px. Panel padding 24, dialog padding 32, column gutters 24. Controls 48 tall, major actions 56. Settings rows start at 80.", "Same spacing scale and safe areas as Premium. Shapes are rounded and outlined: pills for tabs and choices, 16px buttons, 18px tiles, 22–26px panels, each with a 3–4px dark outline and a hard drop shadow that collapses when pressed.")}</p></div>
        <div class="spacing">${[4, 8, 12, 16, 24, 32, 48, 64].map((n) => `<div class="row"><span>${n}px</span><span class="bar" style="width:${n * 4}px;max-width:100%"></span></div>`).join("")}</div>
        <div class="shape-demos">
${TOON() ? `
          <div><div class="demo" style="border-radius:16px;border:4px solid #04101A;box-shadow:0 6px 0 #04101A;background:linear-gradient(180deg,#FFE45C,#F2B800)"></div><b>Button · 16px + 4px outline</b><span class="muted">Hard 6px drop, collapses to 1px when pressed</span></div>
          <div><div class="demo" style="border-radius:999px;border:3px solid #04101A;box-shadow:0 4px 0 #04101A;background:#12344B"></div><b>Pill · fully round</b><span class="muted">Tabs, mode choices, chips, keycap rows</span></div>
          <div><div class="demo" style="border-radius:18px;border:3px solid #04101A;box-shadow:0 5px 0 #04101A;background:#0E2A3D"></div><b>Tile · 18px</b><span class="muted">Settings rows, stats, legend blocks</span></div>
          <div><div class="demo" style="border-radius:24px;border:4px solid #04101A;box-shadow:0 8px 0 #04101A;background:#0E2A3D;outline:4px solid #fff;outline-offset:3px"></div><b>Panel 24px · white focus</b><span class="muted">4px white ring, 3px offset</span></div>` : `
          <div><div class="demo" style="border-radius:2px"></div><b>Control radius · 2px</b><span class="muted">Buttons, inputs, keycaps</span></div>
          <div><div class="demo" style="border-radius:4px"></div><b>Panel radius · 4px</b><span class="muted">Dialogs, only where a panel is needed</span></div>
          <div><div class="demo" style="border-radius:2px;outline:2px solid var(--text);outline-offset:2px"></div><b>Focus · 2px + 2px offset</b><span class="muted">Ivory, always visible on keyboard and controller</span></div>
          <div><div class="demo" style="border:0;border-bottom:1px solid var(--rule-strong);background:none"></div><b>Rules · 1px</b><span class="muted">Rows are continuous, never individual cards</span></div>`}
        </div>
      </section>

      <section class="section" id="ds-components">
        <div class="section-head"><div class="eyebrow">Component contracts</div><h2 class="display">Live components</h2><p>These are the same components the prototype uses. Each needs default, hover, focus, pressed, selected, disabled and error states. Try them.</p></div>
        ${componentDemos()}
      </section>

      <section class="section" id="ds-layouts">
        <div class="section-head"><div class="eyebrow">Reusable templates</div><h2 class="display">Five layout families</h2><p>Screens can look different from each other while sharing tokens, focus and input language.</p></div>
        <div class="templates">
          ${[["Settings shell", "Typographic full-screen page. Compact brand top-left, Back top-right, large title, one category bar in fixed order, one local section bar, continuous table (~64%) and contextual help (~27%). No sidebar, no card per row.", "settings.mk", "01-settings-mouse"],
            ["Overlay & guide", "Match menu is left-aligned typographic navigation over a full-height scrim. Report replaces the menu. Guide is a full-screen lesson layout. One overlay owns focus; Back restores it.", "menu", "07-pause-menu"],
            ["Gameplay", "Minimap top-left, compass top-centre, match stats top-right (squads and players left, then kills, assists, squad kills and damage), health and shield bottom-left, ammo and slots bottom-right. Centre stays clear.", "hud.match", "10-gameplay-hud"],
            ["Map", "Map dominates. Header shows match state and Close. Legend is a bounded side panel; marker actions live in a bottom keycap strip. Unrelated HUD hides.", "map", "11-world-map"],
            ["Lobby, loading & results", "Artwork leads. Moderate brand lockup, editorial display type, one clear action or progress state, unboxed groups, contextual hints. Match results uses the same shell.", "results", "14-match-results"]]
            .map(([t, d, go, img]) => `<article><img src="${AFTER(img)}" alt="" loading="lazy" style="aspect-ratio:16/9;object-fit:cover;width:100%;margin-bottom:8px"><h3>${t}</h3><p>${d}</p><a href="#play-${go}">Open in prototype →</a></article>`).join("")}
        </div>
      </section>

      <section class="section" id="ds-interaction">
        <div class="section-head"><div class="eyebrow">Interaction, input & motion</div><h2 class="display">Behaviour is part of the look</h2></div>
        <div class="twocol">
          <ul class="rules" style="margin:0;grid-template-columns:1fr">
            <li><b>Hover</b> ${T("raises the surface slightly.", "lifts the element 2–3px and deepens its drop shadow.")}</li>
            <li><b>Focus</b> is the ivory ring and stays visible with keyboard and controller.</li>
            <li><b>Pressed</b> ${T("darkens the surface without moving the layout around it.", "squashes it down onto its shadow (translateY 5px, shadow 1px), then springs back.")}</li>
            <li><b>Disabled</b> keeps readable text with a clear cue; no blanket low opacity.</li>
            <li><b>Errors</b> show an icon, a concise message and a way to recover.</li>
            <li><b>Report</b> shows Sending, blocks duplicate sends, then confirms or offers Retry.</li>
            <li><b>Settings</b> apply instantly and save on this device. Reset confirms the category first.</li>
            <li><b>Leave match</b> confirms and states the consequence.</li>
          </ul>
          <ul class="rules" style="margin:0;grid-template-columns:1fr">
            <li><b>Esc</b> goes back one layer. On the root match menu it resumes.</li>
            <li><b>Dialogs</b> take focus on open and return it to the trigger on close.</li>
            <li><b>Gameplay input</b> never fires through an open menu.</li>
            <li><b>Keycaps</b> come from one prompt system driven by the real bindings and device.</li>
            <li><b>Inventory</b> offers Equip, Move and Drop as keyboard and controller alternatives to drag.</li>
            <li><b>Motion</b> fast 120 ms, standard 180 ms, slow 240 ms, ${T("ease-out", "with a springy overshoot curve (cubic-bezier .34, 1.56, .64, 1)")}. Reduced motion removes the non-essential.</li>
            <li><b>Scaling</b> uses a logical canvas with constraints; text scale reflows instead of magnifying.</li>
          </ul>
        </div>
        <div class="motion-demo" style="display:flex;gap:16px;flex-wrap:wrap;margin-top:28px">${[["Fast", 120], ["Standard", 180], ["Slow", 240]].map(([n, ms]) => `<button class="btn motion-b" style="transition-duration:${ms}ms" data-ms="${ms}">${n} · ${ms} ms</button>`).join("")}<span class="muted" style="align-self:center;font-size:14px">Hover to feel each duration.</span></div>
      </section>

      <section class="section" id="ds-prompts">
        <div class="section-head"><div class="eyebrow">Hand-off</div><h2 class="display">Implementation prompts</h2><p>Paste these into your coding assistant one at a time, in order, with <span class="mono">${T("kong-design-system.md", "kong-design-system-toon.md")}</span> and the logo folder in the repo. Check the game after each step so drift is caught early.</p></div>
        <div class="dlbar" style="margin-bottom:18px">${dlBtn(D.prompts, "All prompts in one file")}${dlBtn(D.brief, "Original brief")}</div>
        <div class="prompts" id="prompt-list"><p class="muted">Loading prompts…</p></div>
      </section>

      <section class="section" id="ds-spec">
        <div class="section-head"><div class="eyebrow">Source of truth</div><h2 class="display">Full written spec</h2><p>The complete design system document, exactly as it downloads.</p></div>
        <details class="spec"><summary>Read the full design system</summary><div class="spec-md" id="spec-md">Loading…</div></details>
      </section>
    </div>`;
    wireComponents();
    subnavSpy();
    md(D.prompts.path).then((t) => {
      const list = parsePrompts(t);
      $("#prompt-list").innerHTML = list.map((p, i) => `
        <details class="prompt" ${i === 0 ? "open" : ""}>
          <summary><span class="n">${p.n || "★"}</span><span><span class="t">${esc(p.title)}</span></span><span class="chev">›</span></summary>
          <div class="prompt-body">${p.intro ? `<div class="intro">${esc(p.intro)}</div>` : ""}
            <div class="codebox"><pre id="prompt-${i}">${esc(p.code)}</pre><button class="btn small copy" data-copy="#prompt-${i}">Copy</button></div></div>
        </details>`).join("") || `<p class="muted">Prompts are in the downloadable file above.</p>`;
    });
    md(D.designMd.path).then((t) => { $("#spec-md").innerHTML = window.marked ? marked.parse(t) : `<pre>${esc(t)}</pre>`; });
  }

  function componentDemos() {
    const comp = (title, desc, demo, notes) => `<div class="comp"><div class="comp-head"><h3>${title}</h3><p>${desc}</p></div><div class="comp-demo"><div class="k-scope">${demo}</div></div>${notes ? `<div class="comp-notes">${notes}</div>` : ""}</div>`;
    const st = (inner, label) => `<div style="display:inline-grid;justify-items:center;gap:6px;margin:0 24px 16px 0;vertical-align:top">${inner}<div class="statelabel" style="zoom:1.28">${label}</div></div>`;
    return [
      comp("Button", "Primary is flat saffron with dark text. One dominant primary per task region. Secondary is quiet charcoal. Tertiary is text with a full hit area.",
        st(`<button class="k-btn primary">Play <span class="arr">→</span></button>`, "primary") +
        st(`<button class="k-btn primary is-hover">Play <span class="arr">→</span></button>`, "hover") +
        st(`<button class="k-btn primary is-focus">Play <span class="arr">→</span></button>`, "focus") +
        st(`<button class="k-btn primary is-pressed">Play <span class="arr">→</span></button>`, "pressed") +
        st(`<button class="k-btn primary" disabled>Sending…</button>`, "disabled") + "<br>" +
        st(`<button class="k-btn secondary">Cancel</button>`, "secondary") +
        st(`<button class="k-btn tertiary">Skip guide</button>`, "tertiary") +
        st(`<button class="k-btn danger">Leave match</button>`, "destructive (dialog only)"),
        "<div><b>Destructive</b> actions start as neutral entries (\"Leave match\" in the menu); danger styling appears only in the confirmation dialog.</div>"),
      comp("Tabs & category navigation", "Inactive is muted text. Active is primary text plus a slim saffron marker. Category order never changes: Mouse & keyboard, Controller, Audio, Video, Accessibility.",
        `<div class="k-tabs ds-tabs" style="width:1100px">${["Mouse & keyboard", "Controller", "Audio", "Video", "Accessibility"].map((t, i) => `<button class="k-tab ${i ? "" : "on"}">${t}</button>`).join("")}</div>
         <div class="k-subtabs ds-sub" style="margin-top:28px">${["Mouse", "Behavior", "Bindings"].map((t, i) => `<button class="k-subtab ${i ? "" : "on"}">${t}</button>`).join("")}</div>`),
      comp("Settings rows", "Label, then a fixed control column. Continuous rows with 1px rules. The selected row gets a flat tint and a 4px saffron marker. Drag the slider, use the arrows, flip the switch.",
        `<div class="k-table" style="width:1040px" id="ds-rows">
          <div class="k-row sel"><div class="lbl">Mouse sensitivity</div><div class="ctl"><div class="k-slider"><div class="k-track" data-ds-slider="0.05,3,0.05,0.7,x"><div class="fill"></div><div class="thumb"></div></div><div class="k-val">0.70x</div></div></div></div>
          <div class="k-row"><div class="lbl">Invert vertical look</div><div class="ctl"><div class="k-cycle" data-ds-cycle="Off,On"><button class="arrow" data-d="-1">‹</button><div class="v">Off</div><button class="arrow" data-d="1">›</button></div></div></div>
          <div class="k-row"><div class="lbl">Show FPS</div><div class="ctl"><button class="k-switch" data-ds-switch><span class="t">Off</span><span class="sw"></span></button></div></div>
          <div class="k-row"><div class="lbl">Button prompts</div><div class="ctl"><div class="k-seg" data-ds-seg>${["Auto", "Xbox", "PlayStation", "Nintendo"].map((t, i) => `<button class="${i ? "" : "on"}">${t}</button>`).join("")}</div></div></div>
          <div class="k-row"><div class="lbl">Reload</div><div class="ctl"><div class="k-bind"><button data-ds-bind>R</button></div></div></div>
          <div class="k-row"><div class="lbl">Disabled example</div><div class="ctl"><span class="k-switch disabled"><span class="t">Off</span><span class="sw"></span></span></div></div>
        </div>`,
        "<div><b>Slider:</b> fixed 280–360 px track, numeric value with unit, pointer drag plus arrow keys. <b>Switch:</b> explicit On/Off text. <b>Binding:</b> select it and press a key; Esc cancels.</div>"),
      comp("Keycaps & prompts", "One prompt system renders keyboard, mouse and controller glyphs from the real binding and device. Never hard-code shortcuts into art.",
        `<div class="k-hints" style="flex-wrap:wrap;gap:40px"><span class="k-hint"><span class="k-key solid">Enter</span> Play</span><span class="k-hint"><span class="k-key solid">Esc</span> Menu</span><span class="k-hint"><span class="k-key">R</span> Restore defaults</span><span class="k-hint"><span class="k-key">Shift</span> Dive / <span class="k-key">X</span> Deploy glider</span><span class="k-hint"><span class="k-key">LB</span><span class="k-key">RB</span> Category</span></div>
         <div style="display:flex;gap:10px;margin-top:28px"><span class="k-key big">W</span><span class="k-key big">A</span><span class="k-key big">S</span><span class="k-key big">D</span></div>`),
      comp("Inventory card", "Slot index, art, name, rarity label and one stat. Rarity tints the plane behind the art: green for common, blue for rare, with a matching rule under it and a coloured label. Selected (ivory outline), equipped (separate badge) and rarity are independent states.",
        `<div style="display:grid;grid-template-columns:repeat(4,300px);gap:24px;height:330px">
          <div class="k-card r-common"><div class="idx">1</div><div class="rar common">Common</div><div class="art"><img src="img/items/bunchgun.png" alt=""></div><div class="name">Bunchgun</div><div class="stat"><div><small>Damage</small><b>24</b></div></div></div>
          <div class="k-card r-rare sel"><div class="idx">2</div><div class="rar rare">Rare</div><div class="art"><img src="img/items/nub.png" alt=""></div><div class="name">Nub</div><div class="stat"><div><small>Damage</small><b>29</b></div><span class="eq">Equipped</span></div></div>
          <div class="k-card empty"><div class="idx">3</div><div class="plus">+</div><div class="name">Empty</div></div>
          <div class="k-card empty target"><div class="idx">4</div><div class="plus">+</div><div class="name">Move here</div></div>
        </div>
        <div style="display:flex;gap:40px;margin-top:20px;zoom:1.28"><span class="statelabel">default</span><span class="statelabel" style="margin-left:150px">selected + equipped</span><span class="statelabel" style="margin-left:110px">empty</span><span class="statelabel" style="margin-left:170px">move target</span></div>`),
      comp("Status, toast & errors", "Short and specific, one location per context. Saved is a quiet check, not a yellow button. Errors say what happened and how to recover.",
        `<div style="display:grid;gap:28px;justify-items:start">
          <span class="k-status flash"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6"><path d="M4 12.5l5 5L20 6.5"/></svg> Saved on this device</span>
          <div class="k-field-error"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 7v6M12 16.5v.5"/></svg>Couldn't send. Check your connection and try again. Your description is kept.</div>
          <div class="k-toast" style="position:static;transform:none">Dropped Nub <button class="k-action">Undo</button></div>
        </div>`),
      comp("Damage and healing feedback", "Damage is always red: an arc around the crosshair pointing at the shooter, a glow on that screen edge, and flinch. Blue is only for healing: a glow around every screen edge while health refills. Select a state to replay it.",
        `<div class="fx-demos">
          <div class="fx-demo"><div class="fx-screen dmg" id="fx-dmg"><div class="fx-x"></div><div class="fx-arc"></div><div class="fx-bars"><i class="h" style="width:72%"></i><i class="loss"></i></div><span class="fx-num">72</span></div><button class="k-btn secondary" data-fx="dmg">Take a hit</button><div class="statelabel" style="zoom:1.28">damage · always red</div></div>
          <div class="fx-demo"><div class="fx-screen heal" id="fx-heal"><div class="fx-x"></div><div class="fx-bars"><i class="h" style="width:72%"></i></div><span class="fx-num">72</span></div><button class="k-btn secondary" data-fx="heal">Heal</button><div class="statelabel" style="zoom:1.28">healing · blue edges</div></div>
        </div>`,
        "<div><b>Rules.</b> Never tint damage blue, even on shield hits. Blue edges appear only while a heal is running and stop when it finishes or is interrupted by damage. Below 30 health a slow red vignette stays on. Reduced camera motion softens the shake, not the colour cues.</div>"),
      comp("Enemy hit numbers", "Show what each hit did to the enemy. Shield hits get a small shield icon in shield blue, the hit that empties the shield gets a larger cracked shield with a crack sound and a Shield broken confirmation, and health hits are plain white numbers.",
        `<div class="hn-row" id="hn-row">
          <div class="hn-cell"><div class="dmgnum shield hn"><i class="dn-ic"><svg viewBox="0 0 24 24"><path fill="currentColor" d="M12 2l8 3v6c0 5.2-3.4 9.4-8 11-4.6-1.6-8-5.8-8-11V5l8-3z"/></svg></i><b>24</b></div><div class="statelabel" style="zoom:1.28">shield hit</div></div>
          <div class="hn-cell"><div class="dmgnum break hn"><i class="dn-ic"><svg viewBox="0 0 24 24"><path fill="currentColor" d="M12 2l8 3v6c0 5.2-3.4 9.4-8 11-4.6-1.6-8-5.8-8-11V5l8-3z"/><path d="M12.5 3.5l-2 5 3 2.5-3.5 4 2 2.5-1.5 3.5" fill="none" stroke="#101719" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/></svg></i><b>24</b></div><div class="hn-conf">Shield broken</div><div class="statelabel" style="zoom:1.28">shield break · crack sound</div></div>
          <div class="hn-cell"><div class="dmgnum health hn"><b>24</b></div><div class="statelabel" style="zoom:1.28">health hit</div></div>
        </div>
        <div style="display:flex;gap:16px;margin-top:24px;flex-wrap:wrap"><button class="k-btn secondary" data-hn-replay>Replay</button></div>`,
        `<div><b>Rules.</b> Icon size 28 px on shield hits and 46 px on the break, shield blue #58BCEB with a dark crack line. Health numbers stay white. These are for damage you deal; damage you take is always red.</div><div class="dlbar" style="margin-top:10px">${dlBtn({ path: "downloads/icons/kong-shield-hit.svg", name: "kong-shield-hit.svg", label: "Shield hit icon", size: "1 KB" }, "SVG")}${dlBtn({ path: "downloads/icons/kong-shield-break.svg", name: "kong-shield-break.svg", label: "Cracked shield icon", size: "1 KB" }, "SVG")}</div>`),
      comp("Compact dialog", "Routine confirmations only. Focus moves inside, the safe option is focused first, and closing returns focus to the trigger.",
        `<div class="k-dialog" style="box-shadow:none"><h2>Leave match?</h2><p>You'll return to the lobby and can't rejoin this match. Your squad continues without you.</p><div class="acts"><button class="k-btn secondary is-focus">Cancel</button><button class="k-btn danger">Leave match</button></div></div>`)
    ].join("");
  }

  function wireComponents() {
    $$("[data-hn-replay]").forEach((b) => b.addEventListener("click", () => { $$("#hn-row .hn, #hn-row .hn-conf").forEach((el, i) => { el.classList.remove("play"); void el.offsetWidth; setTimeout(() => el.classList.add("play"), [0, 260, 260, 640][i] || 0); }); }));
    $$("[data-fx]").forEach((b) => b.addEventListener("click", () => {
      const k = b.dataset.fx, scr = document.getElementById("fx-" + k), bar = scr.querySelector(".h"), num = scr.querySelector(".fx-num");
      scr.classList.remove("play"); void scr.offsetWidth; scr.classList.add("play");
      if (k === "dmg") { bar.style.transition = "none"; bar.style.width = "100%"; num.textContent = "100"; requestAnimationFrame(() => { bar.style.transition = ""; bar.style.width = "72%"; num.textContent = "72"; }); }
      else { bar.style.transition = "none"; bar.style.width = "72%"; num.textContent = "72"; const t0 = performance.now(); requestAnimationFrame(function f(t) { const p = Math.min(1, (t - t0) / 1500); const v = Math.round(72 + 28 * p); bar.style.width = v + "%"; num.textContent = v; if (p < 1) requestAnimationFrame(f); }); }
    }));
    $$(".ds-tabs, .ds-sub").forEach((g) => g.addEventListener("click", (e) => { const b = e.target.closest("button"); if (!b) return; $$("button", g).forEach((x) => x.classList.toggle("on", x === b)); }));
    $$("#ds-rows .k-row").forEach((row) => row.addEventListener("pointerenter", () => $$("#ds-rows .k-row").forEach((r) => r.classList.toggle("sel", r === row))));
    $$("[data-ds-slider]").forEach((tr) => {
      const [min, max, step, def, unit] = tr.dataset.dsSlider.split(","); let v = +def;
      const val = tr.parentElement.querySelector(".k-val");
      const draw = () => { const p = (v - min) / (max - min) * 100; tr.querySelector(".fill").style.width = p + "%"; tr.querySelector(".thumb").style.left = p + "%"; val.textContent = v.toFixed(2) + unit; };
      const set = (x) => { const r = tr.getBoundingClientRect(); const p = Math.max(0, Math.min(1, (x - r.left) / r.width)); v = Math.round((+min + p * (max - min)) / step) * step; draw(); };
      tr.addEventListener("pointerdown", (e) => { tr.setPointerCapture(e.pointerId); tr.classList.add("drag"); set(e.clientX); const mv = (ev) => set(ev.clientX); const up = () => { tr.classList.remove("drag"); tr.removeEventListener("pointermove", mv); tr.removeEventListener("pointerup", up); }; tr.addEventListener("pointermove", mv); tr.addEventListener("pointerup", up); });
      tr.tabIndex = 0; tr.setAttribute("role", "slider"); tr.setAttribute("aria-label", "Mouse sensitivity");
      tr.addEventListener("keydown", (e) => { if (e.key === "ArrowRight" || e.key === "ArrowLeft") { e.preventDefault(); v = Math.max(+min, Math.min(+max, v + (e.key === "ArrowRight" ? 1 : -1) * step)); draw(); } });
      draw();
    });
    $$("[data-ds-cycle]").forEach((c) => { const ops = c.dataset.dsCycle.split(","); let i = 0; c.addEventListener("click", (e) => { const b = e.target.closest("[data-d]"); if (!b) return; i = (i + +b.dataset.d + ops.length) % ops.length; c.querySelector(".v").textContent = ops[i]; }); });
    $$("[data-ds-switch]").forEach((s) => s.addEventListener("click", () => { s.classList.toggle("on"); s.querySelector(".t").textContent = s.classList.contains("on") ? "On" : "Off"; s.setAttribute("aria-checked", s.classList.contains("on")); }));
    $$("[data-ds-seg]").forEach((g) => g.addEventListener("click", (e) => { const b = e.target.closest("button"); if (!b) return; $$("button", g).forEach((x) => x.classList.toggle("on", x === b)); }));
    $$("[data-ds-bind]").forEach((b) => {
      b.addEventListener("click", () => {
        b.classList.add("capture"); b.textContent = "Press a key";
        const onk = (e) => { e.preventDefault(); b.classList.remove("capture"); b.textContent = e.code === "Escape" ? b.dataset.prev || "R" : Game.keyLabel(e.code); if (e.code !== "Escape") b.dataset.prev = b.textContent; document.removeEventListener("keydown", onk, true); };
        document.addEventListener("keydown", onk, true);
      });
    });
    $$(".motion-b").forEach((b) => { b.addEventListener("mouseenter", () => { b.style.background = "var(--accent)"; b.style.color = "var(--on-accent)"; }); b.addEventListener("mouseleave", () => { b.style.background = ""; b.style.color = ""; }); b.style.transitionTimingFunction = "cubic-bezier(.2,.8,.2,1)"; b.style.transitionProperty = "background,color"; });
  }

  function subnavSpy() {
    const links = $$(".subnav a"); const secs = links.map((a) => document.getElementById(a.dataset.sec)).filter(Boolean);
    const io = new IntersectionObserver((ents) => { ents.forEach((en) => { if (en.isIntersecting) links.forEach((a) => a.classList.toggle("on", a.dataset.sec === en.target.id)); }); }, { rootMargin: "-40% 0px -55% 0px" });
    secs.forEach((s) => io.observe(s));
    links.forEach((a) => a.addEventListener("click", (e) => { e.preventDefault(); history.replaceState(null, "", a.getAttribute("href")); document.getElementById(a.dataset.sec).scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" }); }));
  }

  /* =====================================================================
     PLAYTEST SESSION
  ===================================================================== */
  function renderPlaytest() {
    const D = K.downloads;
    view.innerHTML = `
    <div class="wrap">
      <section class="page-hero">
        <div class="crumbs"><a href="#home">Sessions</a> / Playtest · October 10, 2026</div>
        <div class="eyebrow">Session 01 · Saturday, October 10, 2026</div>
        <h1 class="display">Playtest feedback</h1>
        <p>Fourteen screens from the playtest build, redesigned in the ${T("premium v3 direction", "Toon design system (the after images are the Toon prototype)")}. Play them as one connected flow, then compare each against the original screenshot and its review notes.</p>
        <div class="btnrow"><a class="btn" href="${K.recording.url}" target="_blank" rel="noopener">▶ Watch RET's gameplay recording ↗</a></div>
      </section>

      <section class="launch" aria-label="Interactive prototype">
        <div class="launch-copy">
          <div class="eyebrow plain">Interactive prototype</div>
          <h2 class="display">Play the screens</h2>
          <p>All 14 screens built as a working UI on the 1920×1080 canvas. Settings change the firing range: sensitivity, FOV, HUD and text scale, hit-marker sound and key bindings all take effect.</p>
          <ol class="flowlist"><li>Lobby</li><li>Loading</li><li>Firing range</li><li>Menu</li><li>Settings</li><li>Report</li><li>Inventory</li><li>Map</li><li>Learn controls</li><li>Results</li></ol>
          <div class="btnrow"><a class="btn primary" href="#play-lobby">Start at the lobby <span class="arrow">→</span></a><a class="btn" href="#play-hud">Jump into the range</a></div>
          <p class="muted" style="font-size:13px">Best on desktop with a mouse and keyboard. Use Compare in the player to overlay the concept image or the original screenshot.</p>
        </div>
        <button class="launch-art" data-go="hud" aria-label="Open the prototype in the firing range"><img src="${AFTER("10-gameplay-hud")}" alt=""><span class="btn primary play">Play <span class="arrow">→</span></span></button>
      </section>

      <section class="section" id="pt-themes" style="margin-top:48px">
        <div class="section-head"><div class="eyebrow">What changed overall</div><h2 class="display">Key themes</h2></div>
        <ul class="themes">${K.themes.map(([t, d]) => `<li><b>${esc(t)}</b><span>${esc(d)}</span></li>`).join("")}</ul>
      </section>

      ${gameplaySection()}

      <section class="section" id="pt-files">
        <div class="section-head"><div class="eyebrow">Attached to this session</div><h2 class="display">Files</h2></div>
        <div class="dlbar"><a class="dl" href="${K.recording.url}" target="_blank" rel="noopener" style="text-decoration:none"><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg><span><b>${esc(K.recording.label)}</b><small>${K.recording.host} · opens in a new tab</small></span></a>${[D.review, D.brief, D.genPrompts, D.genPromptsV1, D.dsV2, D.designMd, D.logosZip].map((d) => dlBtn(d)).join("")}</div>
      </section>

      <section class="section" id="pt-screens">
        <div class="section-head"><div class="eyebrow">Screen by screen</div><h2 class="display">Before and after</h2><p>Drag across each image to compare the playtest screenshot with the premium concept. The notes come from the review that accompanied the concepts.</p></div>
        <nav class="screen-index" aria-label="Screens">${K.screens.map((s) => `<a href="#screen-${s.n}">${s.n} ${esc(s.short)}</a>`).join("")}</nav>
        <div id="reviews">${K.screens.map((s) => reviewBlock(s, null)).join("")}</div>
      </section>

      <section class="section" id="pt-brand">
        <div class="section-head"><div class="eyebrow">Brand</div><h2 class="display">KONG / ROYALE / OF DUTY</h2><p id="brand-review">One master KONG wordmark with ROYALE and OF DUTY set as descriptors beneath it, plus one-colour and small-icon versions.</p></div>
        <img src="img/brand/brand-sheet.jpg" alt="KONG brand family concept sheet" loading="lazy" style="border:1px solid var(--rule);width:100%">
        <div class="btnrow" style="margin-top:14px"><a class="btn" href="#ds-brand">Logo files in the design system →</a></div>
      </section>

      <section class="section" id="pt-history">
        <div class="section-head"><div class="eyebrow">How we got here</div><h2 class="display">Exploration history</h2><p>Earlier passes, kept for reference. The premium v3 direction above supersedes both.</p></div>
        <h3 class="eyebrow plain" style="margin:0 0 12px;color:var(--text)">v1 · First concepts (blue panels)</h3>
        <div class="gallery">${K.screens.filter((s) => !s.added).map((s) => `<button data-lb="img/v1/${s.file}.jpg" data-cap="v1 · ${esc(s.name)}"><img src="img/v1/${s.file}.jpg" alt="" loading="lazy"><span>${s.n} · ${esc(s.short)}</span></button>`).join("")}</div>
        <h3 class="eyebrow plain" style="margin:36px 0 12px;color:var(--text)">v2 · Intermediate exploration (stopped before lobby and loading)</h3>
        <div class="gallery">${K.v2screens.map((f) => { const s = K.screens.find((x) => x.file === f); return `<button data-lb="img/v2/${f}.jpg" data-cap="v2 · ${esc(s.name)}"><img src="img/v2/${f}.jpg" alt="" loading="lazy"><span>${s.n} · ${esc(s.short)}</span></button>`; }).join("")}</div>
      </section>
    </div>
    <div class="lightbox" id="lightbox" hidden role="dialog" aria-modal="true" aria-label="Image viewer"><div class="lb-bar"><span id="lb-cap"></span><button class="btn small" id="lb-close">Close · Esc</button></div><img id="lb-img" alt=""></div>`;
    wireCompare(view);
    md(D.review.path).then((t) => {
      const R = parseReview(t);
      K.screens.forEach((s) => { const el = document.getElementById("notes-" + s.n); if (el && R[s.n]) el.innerHTML = notesHtml(R[s.n]); });
      const b = Object.keys(R).find((k) => k.startsWith("KONG /")); if (b) $("#brand-review").textContent = R[b].after + " " + R[b].suggestions;
    });
  }
  function opusHomeCard() {
    const G = window.GAMEPLAY; if (!G || !G.opus) return "";
    const O = G.opus, top = G.groups.flatMap((g) => g.items).filter((i) => i.pri === "High");
    return `<section class="section" id="home-opus">
        <div class="section-head"><div class="eyebrow">Playtester review</div><h2 class="display">Opus 5.5 feedback</h2>
          <p>Opus 5.5 watched RET's October 10 match as a playtester and reviewed it frame by frame. Here is the short version; the full write-up has every finding with a frame from the video.</p></div>
        <article class="op-card">
          <blockquote class="op-quote">${esc(O.verdict)}<cite>Opus 5.5, playtester review of the Oct 10 recording</cite></blockquote>
          <div class="op-side">
            <div class="eyebrow plain">Fix first</div>
            <ol class="op-top">${top.map((i) => `<li><b>${esc(i.title)}</b><span>${esc(i.time)}</span></li>`).join("")}</ol>
            <div class="btnrow"><a class="btn primary" href="#opus-feedback">Read Opus 5.5's feedback <span class="arrow">→</span></a><a class="btn" href="#play-hud">Try the damage feedback</a></div>
          </div>
        </article>
      </section>`;
  }
  function findingCard(it) {
    return `<article class="gp-item">
          ${it.img ? `<button class="gp-shot" data-lb="img/gameplay/${it.img}.jpg" data-cap="${esc(it.title)} · ${esc(it.time)}"><img src="img/gameplay/${it.img}.jpg" alt="Frame from the gameplay recording at ${esc(it.time)}" loading="lazy"><span>${esc(it.time)}</span></button>` : `<div class="gp-shot gp-noshot"><span>${esc(it.time)}</span></div>`}
          <div class="gp-body">
            <div class="gp-meta"><span class="pri pri-${it.pri.toLowerCase()}">${it.pri}</span><span class="who">${esc(it.who)}</span></div>
            <h4>${esc(it.title)}</h4>
            <p><b>What we saw.</b> ${esc(it.what)}</p>
            <p><b>Suggestion.</b> ${esc(it.fix)}</p>
            ${it.demo ? `<a class="btn small" href="#play-hud">Try it in the firing range: press K <span class="arrow">→</span></a>` : ""}
          </div>
        </article>`;
  }
  function renderOpus() {
    const G = window.GAMEPLAY, O = G.opus;
    const all = G.groups.flatMap((g) => g.items.map((i) => ({ ...i, group: g.title })));
    const mine = all.filter((i) => i.who.includes("Opus"));
    const grouped = G.groups.map((g) => ({ ...g, items: g.items.filter((i) => i.who.includes("Opus")) })).filter((g) => g.items.length);
    view.innerHTML = `
    <div class="wrap">
      <section class="page-hero">
        <div class="crumbs"><a href="#home">Sessions</a> / Opus 5.5 feedback</div>
        <div class="eyebrow">Playtester review · Oct 10, 2026 match</div>
        <h1 class="display">Opus 5.5<br>feedback</h1>
        <p>Opus 5.5 acted as a playtester and reviewed RET's gameplay recording from the October 10 playtest. The menu and HUD redesign is covered on the session page, so this review is only about how the game plays: combat, time to kill, crosshairs, damage, collision and match flow.</p>
        <div class="btnrow"><a class="btn" href="${K.recording.url}" target="_blank" rel="noopener">▶ Watch the recording ↗</a>${dlBtn(K.downloads.gameplay, "All findings as Markdown")}</div>
      </section>
    </div>
    <nav class="subnav" aria-label="Opus 5.5 feedback sections"><div class="wrap">
      ${[["op-method", "How I reviewed"], ["op-verdict", "My verdict"], ["op-found", "What I found"], ["op-next", "What to do next"]].map(([id, t]) => `<a href="#${id}" data-sec="${id}">${t}</a>`).join("")}
    </div></nav>
    <div class="wrap">
      <section class="section" id="op-method">
        <div class="section-head"><div class="eyebrow">Method</div><h2 class="display">How I reviewed it</h2></div>
        <div class="gp-summary">${O.method.map(([n, t]) => `<div><b>${n}</b><span>${esc(t)}</span></div>`).join("")}</div>
        <p class="muted" style="font-size:14px;max-width:72ch;margin-top:14px">The recording was capped at 30 FPS by Ret, so frame rate is not a finding. I could only judge what shows on screen. Hit boxes, weapon stats and server-side numbers were read off damage markers and the health and shield bars, so treat the exact figures as estimates to confirm in the game's data.</p>
      </section>

      <section class="section" id="op-verdict">
        <div class="section-head"><div class="eyebrow">Overall</div><h2 class="display">My verdict</h2></div>
        <blockquote class="op-quote big">${esc(O.verdict)}</blockquote>
        <div class="twocol" style="margin-top:32px">
          <div><h3 class="gp-gh">What works</h3><ul class="op-list good">${O.strengths.map((t) => `<li>${esc(t)}</li>`).join("")}</ul></div>
          <div><h3 class="gp-gh">Biggest risks</h3><ul class="op-list risk">${O.risks.map((t) => `<li>${esc(t)}</li>`).join("")}</ul></div>
        </div>
      </section>

      <section class="section" id="op-found">
        <div class="section-head"><div class="eyebrow">${mine.length} findings with frames from the video</div><h2 class="display">What I found</h2>
          <p>Findings I raised myself, plus the ones Ret and I raised together. Ret's own calls (flinch and damage direction) are on the <a href="#pt-gameplay">session page</a> with everything else.</p></div>
        ${grouped.map((g) => `<div class="gp-group"><h3 class="gp-gh">${esc(g.title)}</h3>${g.items.map(findingCard).join("")}</div>`).join("")}
      </section>

      <section class="section" id="op-next">
        <div class="section-head"><div class="eyebrow">Recommendations</div><h2 class="display">What to do next</h2></div>
        <ol class="op-order">${O.order.map(([t, d], i) => `<li><span class="n">${i + 1}</span><div><b>${esc(t)}</b><p>${esc(d)}</p></div></li>`).join("")}</ol>
        <h3 class="gp-gh" style="margin-top:40px">For the next playtest</h3>
        <ul class="op-list">${O.next.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>
      </section>
    </div>
    <div class="lightbox" id="lightbox" hidden role="dialog" aria-modal="true" aria-label="Image viewer"><div class="lb-bar"><span id="lb-cap"></span><button class="btn small" id="lb-close">Close · Esc</button></div><img id="lb-img" alt=""></div>`;
    subnavSpy();
  }
  function gameplaySection() {
    const G = window.GAMEPLAY; if (!G) return "";
    const items = G.groups.map((g) => `
      <div class="gp-group" id="gp-${g.id}"><h3 class="gp-gh">${esc(g.title)}</h3>
        ${g.items.map((it) => `
        <article class="gp-item">
          ${it.img ? `<button class="gp-shot" data-lb="img/gameplay/${it.img}.jpg" data-cap="${esc(it.title)} · ${esc(it.time)}"><img src="img/gameplay/${it.img}.jpg" alt="Frame from the gameplay recording at ${esc(it.time)}" loading="lazy"><span>${esc(it.time)}</span></button>` : `<div class="gp-shot gp-noshot"><span>${esc(it.time)}</span></div>`}
          <div class="gp-body">
            <div class="gp-meta"><span class="pri pri-${it.pri.toLowerCase()}">${it.pri}</span><span class="who">${esc(it.who)}</span></div>
            <h4>${esc(it.title)}</h4>
            <p><b>What we saw.</b> ${esc(it.what)}</p>
            <p><b>Suggestion.</b> ${esc(it.fix)}</p>
            ${it.demo ? `<a class="btn small" href="#play-hud">Try it in the firing range: press K <span class="arrow">→</span></a>` : ""}
          </div>
        </article>`).join("")}
      </div>`).join("");
    const count = G.groups.reduce((n, g) => n + g.items.length, 0), high = G.groups.reduce((n, g) => n + g.items.filter((i) => i.pri === "High").length, 0);
    return `<section class="section" id="pt-gameplay">
        <div class="section-head"><div class="eyebrow">Gameplay feedback · from ${esc(G.meta.by)}</div><h2 class="display">How it plays</h2>
          <p>${esc(G.meta.byNote)}</p></div>
        <div class="gp-summary">
          <div><b>${count}</b><span>Findings</span></div><div><b>${high}</b><span>High priority</span></div><div><b>12:36</b><span>Recording reviewed</span></div>
          <p class="gp-match">${esc(G.meta.match)}</p>
        </div>
        <div class="btnrow" style="margin:18px 0 8px">${dlBtn(K.downloads.gameplay, "All findings as Markdown")}<a class="btn" href="${K.recording.url}" target="_blank" rel="noopener">▶ Watch the recording ↗</a></div>
        <nav class="screen-index" aria-label="Gameplay feedback groups" style="margin-top:20px">${G.groups.map((g) => `<a href="#gp-${g.id}">${esc(g.title)}</a>`).join("")}</nav>
        ${items}
      </section>`;
  }
  function reviewBlock(s) {
    return `<article class="review" id="screen-${s.n}">
      <div class="review-head"><h3 class="display"><span class="num">${s.n}</span>${esc(s.name)}</h3><div class="btnrow"><a class="btn primary small" href="#play-${s.go.replace(":", ".")}">Try it interactively <span class="arrow">→</span></a></div></div>
      <div>
        <div class="compare" style="--pos:50%"><img class="cmp-after" src="${AFTER(s.file)}" alt="${T("Premium concept", "Toon prototype")}: ${esc(s.name)}" loading="lazy"><div class="before-wrap"><img src="img/before/${s.file}.jpg" alt="Original screenshot: ${esc(s.name)}" loading="lazy"></div><div class="handle"></div><span class="lbl b">Before</span><span class="lbl a">After</span><input type="range" min="0" max="100" value="50" aria-label="Compare before and after for ${esc(s.name)}"></div>
        <div class="compare-tools">${s.states && !TOON() ? `<span class="state-seg" role="radiogroup" aria-label="HUD state">${s.states.map(([l, f], i) => `<button class="btn small ${i ? "" : "on"}" role="radio" aria-checked="${!i}" data-state="${f}">${l}</button>`).join("")}</span>` : ""}<button class="btn small" data-lb="img/before/${s.file}.jpg" data-cap="Original · ${esc(s.name)}">View original</button><button class="btn small" data-lb="${AFTER(s.file)}" data-cap="Concept · ${esc(s.name)}">${T("View concept", "View Toon screen")}</button></div>
      </div>
      <div class="review-notes" id="notes-${s.n}"><p class="muted">Loading notes…</p></div>
    </article>`;
  }
  function notesHtml(r) {
    const blk = (cls, h, t) => t ? `<div class="${cls}"><h4>${h}</h4><p>${esc(t)}</p></div>` : "";
    return blk("", "Before", r.before) + blk("after", "After", r.after) + blk("", "Suggestions", r.suggestions) + blk("", "Why it's better", r.why) + blk("prod", "Production detail", r.prod) + blk("follow", "Follow-up · added after review", r.follow);
  }
  function wireCompare(root) {
    root.addEventListener("input", (e) => { if (e.target.matches(".compare input[type=range]")) e.target.closest(".compare").style.setProperty("--pos", e.target.value + "%"); });
  }

  /* HUD state toggle on a screen review (e.g. Taking damage / Healing) */
  document.addEventListener("click", (e) => {
    const b = e.target.closest("[data-state]"); if (!b) return;
    const art = b.closest(".review"); art.querySelector(".cmp-after").src = `img/after/${b.dataset.state}.jpg`;
    const v = art.querySelector('[data-cap^="Concept"]'); if (v) v.dataset.lb = `img/after/${b.dataset.state}.jpg`;
    b.parentElement.querySelectorAll("[data-state]").forEach((x) => { x.classList.toggle("on", x === b); x.setAttribute("aria-checked", x === b); });
  });
  /* lightbox + launch buttons */
  document.addEventListener("click", (e) => {
    const g = e.target.closest("[data-go]"); if (g) { location.hash = "play-" + g.dataset.go; return; }
    const b = e.target.closest("[data-lb]"); if (!b) return;
    const lb = $("#lightbox"); if (!lb) return;
    $("#lb-img").src = b.dataset.lb; $("#lb-cap").textContent = b.dataset.cap || ""; lb.hidden = false; lb._trigger = b; $("#lb-close").focus();
  });
  document.addEventListener("click", (e) => { if (e.target.id === "lb-close" || e.target.id === "lightbox") closeLb(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && $("#lightbox") && !$("#lightbox").hidden) closeLb(); });
  function closeLb() { const lb = $("#lightbox"); lb.hidden = true; lb._trigger && lb._trigger.focus(); }

  route();
})();
