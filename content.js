// CatCursorF v1.1.1 - FreezeezyPeak.
// Contenido: cursores contextuales, sonidos, estela, celebraciones y efecto festivo; auto-ocultado en video. / Content: contextual cursors, sounds, trail, celebrations and festive effect; auto-hide on video.
// GitHub: github.com/FreezeezyPeak-StudioDev | GitLab: gitlab.com/freezeezypeak.studiodev | Contacto/Contact: freezeezypeak.studiodev@gmail.com
(() => {
  // 8 cursores contextuales, sonidos y festivo. / 8 contextual cursors, sounds and holiday effect.
  const C = (name) => browser.runtime.getURL(`assets/cursors/${name}`);
  const URLS = {
    normal: C("Cat - Normal Select.cur"),
    link: C("Cat - Link Select B.cur"),
    text: C("Cat - Text Select.cur"),
    help: C("Cat - Help Select.cur"),
    pen: C("Cat - Pen.cur"),
    precision: C("Cat - Precision Select.cur"),
    unavailable: C("Cat - Unavailable.cur"),
    vResize: C("Cat - Vertical Resize.cur"),
  };
  const MEOW_URL = browser.runtime.getURL("assets/fx/Cat_meow.mp3");
  const CLICK_URL = browser.runtime.getURL("assets/fx/matthewvakaliuk73627-mouse-click.mp3");
  const MEOW_CHANCE = 0.08;

  let master = true;
  let enabled = true;
  let soundsOn = true;
  let theme = "calc";
  let festive = "auto";
  let stars = true;
  let trail = true;
  let clickSoundOk = true;
  // Volumen por categoria 0-100 + general 0-100 (multiplica). / Per-category volume 0-100 + master 0-100 (multiplier).
  let volGeneral = 50;
  let volClick = 25;
  let volMeow = 25;
  let lastFxKey = "none";
  let fxTimer = 0;
  let pageActive = true;
  let idleTimer = 0;
  // Auto-ocultar cursor como YouTube/Twitch: tras ~2.5s sin mover el raton sobre video/reproductor.
  let lastMouseMove = Date.now();
  let lastMouseX = -1;
  let lastMouseY = -1;
  let cursorAutoHidden = false;
  // Estela de patitas tras el cursor. / Paw-trail behind the cursor.
  let lastTrailAt = 0;
  let lastTrailX = -9999;
  let lastTrailY = -9999;
  // Sonda: ¿puede esta pagina cargar los .cur? (diagnostico) / Probe: can this page load the .cur files?
  let curLoadOk = null;
  let iconLoadOk = null;
  const ICON_PROBE_URL = browser.runtime.getURL("assets/icons/iconNormal.svg");
  try {
    const p1 = new Image();
    p1.onload = () => { curLoadOk = true; };
    p1.onerror = () => { curLoadOk = false; };
    p1.src = URLS.normal;
    const p2 = new Image();
    p2.onload = () => { iconLoadOk = true; };
    p2.onerror = () => { iconLoadOk = false; };
    p2.src = ICON_PROBE_URL;
  } catch (e) {}

  const css = `
    html, body, html *, body * {
      cursor: url("${URLS.normal}"), auto !important;
    }
    a, a *, button, button *,
    input[type="button"], input[type="submit"], input[type="reset"], input[type="image"],
    [role="button"], [role="link"], summary, label[for] {
      cursor: url("${URLS.link}"), pointer !important;
    }
    input[type="text"], input[type="search"], input[type="url"],
    input[type="email"], input[type="password"], input[type="tel"], input:not([type]) {
      cursor: url("${URLS.pen}"), text !important;
    }
    textarea, [contenteditable="true"], [contenteditable=""], pre, code,
    p, h1, h2, h3, h4, h5, h6, li, blockquote, article, main {
      cursor: url("${URLS.text}"), text !important;
    }
    abbr[title], dfn[title] {
      cursor: url("${URLS.help}"), help !important;
    }
    button:disabled, input:disabled, select:disabled, textarea:disabled, option:disabled,
    button[disabled], input[disabled], select[disabled], textarea[disabled],
    :disabled, [disabled], [aria-disabled="true"], [inert], .disabled, .is-disabled,
    :disabled *, [disabled] *, [aria-disabled="true"] *, [inert] *, .disabled *, .is-disabled * {
      cursor: url("${URLS.unavailable}"), not-allowed !important;
    }
    canvas {
      cursor: url("${URLS.precision}"), crosshair !important;
    }
    input[type="number"] {
      cursor: url("${URLS.vResize}"), ns-resize !important;
    }
    /* NOTA: el cursor sobre la barra de scroll nativa lo dibuja el navegador/SO
       y los navegadores ignoran "cursor" en ::-webkit-scrollbar (limitacion web,
       no del codigo). Por eso aqui se tematiza la barra en vez de prometer un
       cursor que el navegador nunca aplicaria. */
  `;

  // Barra de scroll gatuna por tema (Firefox + Chromium). / Themed scrollbar per theme.
  const THEME_SCROLL = {
    calc: ["#6b7280", "#e8e8e8", "#4b5563"],
    win: ["#008080", "#c0c0c0", "#006666"],
    mc: ["#5b8c3e", "#3a2a1a", "#79b34f"],
    gd: ["#00bfff", "#111111", "#33d4ff"],
    nav: ["#c0272d", "#0b3d2e", "#e03a40"],
    ny: ["#ffd94d", "#1a1a2e", "#ffe27a"],
  };

  function applyScrollbar() {
    if (!document.head && !document.documentElement) return;
    let st = document.getElementById("cat-scrollbar-style");
    if (!master || !enabled) {
      if (st) st.remove();
      return;
    }
    const [thumb, track, hover] = THEME_SCROLL[theme] || THEME_SCROLL.calc;
    if (!st) {
      st = document.createElement("style");
      st.id = "cat-scrollbar-style";
      (document.head || document.documentElement).appendChild(st);
    }
    st.textContent = `*{scrollbar-width:thin;scrollbar-color:${thumb} ${track};}` +
      `::-webkit-scrollbar{width:12px;height:12px;}` +
      `::-webkit-scrollbar-track{background:${track};}` +
      `::-webkit-scrollbar-thumb{background:${thumb};border-radius:6px;border:2px solid ${track};}` +
      `::-webkit-scrollbar-thumb:hover{background:${hover};}`;
  }

  // Regla de mayor especificidad que el CSS de cursores para forzar cursor:none. / Higher-specificity override to force cursor:none.
  const HIDE_CSS = `html.cat-cursor-hide, html.cat-cursor-hide body, html.cat-cursor-hide body *, html.cat-cursor-hide body *::before, html.cat-cursor-hide body *::after { cursor: none !important; }`;

  const FX_CSS = `@keyframes catfall{to{transform:translateY(105vh)}}@keyframes catstar{to{transform:translateY(105vh) rotate(180deg)}}#cat-fx{transition:opacity 1.2s ease;}#cat-fx.hide{opacity:0;}.cat-flake{position:fixed;top:-12px;border-radius:50%;pointer-events:none;z-index:999999;box-shadow:0 0 0 1px rgba(0,0,0,.5);animation-name:catfall;animation-timing-function:linear;animation-iteration-count:infinite;}.cat-flake.ny{background:transparent!important;border-radius:0;box-shadow:none;font-size:20px;line-height:1;color:#ffd94d;text-shadow:0 0 5px #ffd94d;animation-name:catstar;}`;

  // Selectores genericos de reproductores: YouTube, Twitch, Vimeo, Netflix, VideoJS, JWPlayer, etc.
  const PLAYER_SELECTORS = [
    "video",
    ".html5-video-player", ".ytp-video-content", ".ytp-autohide",
    "[data-a-target='video-player']", ".video-player", ".player-video", ".live-video",
    ".vjs-video-player", ".video-js",
    ".jwplayer", ".jw-video",
    ".plyr", ".plyr__video-wrapper",
    ".netflix-player", "[data-uia='video-player']",
    ".dplayer", ".artplayer", ".xgplayer",
  ].join(",");

  function hasPlayingVideo() {
    try {
      const vids = document.querySelectorAll("video");
      for (const v of vids) {
        if (!v.paused && !v.ended && v.readyState > 2 && v.currentTime > 0) return true;
      }
    } catch (e) {}
    return false;
  }

  function mouseOverPlayer() {
    try {
      // Si YouTube ya pidio ocultar el cursor, respetarlo sin importar la posicion.
      if (document.querySelector(".ytp-autohide")) return true;
      // Sin dato de raton aun (reproduccion automatica al abrir): si hay un video grande visible, asumir que se esta mirando.
      if (lastMouseX < 0 || lastMouseY < 0) {
        const vids0 = document.querySelectorAll("video");
        for (const v of vids0) {
          try {
            if (v.paused || v.ended) continue;
            const r0 = v.getBoundingClientRect();
            if (r0.width > innerWidth * 0.4 && r0.height > innerHeight * 0.3) return true;
          } catch (e) {}
        }
      }
      // Elemento bajo el cursor dentro de un reproductor.
      if (lastMouseX >= 0 && lastMouseY >= 0) {
        const el = document.elementFromPoint(lastMouseX, lastMouseY);
        if (el) {
          if (el.closest) {
            if (el.closest(PLAYER_SELECTORS)) return true;
          } else if (el.tagName === "VIDEO") {
            return true;
          }
        }
      }
      // Alternativa: si el cursor quedo sobre el rectangulo de un video visible (por superposiciones).
      if (lastMouseX >= 0 && lastMouseY >= 0) {
        const vids = document.querySelectorAll("video");
        for (const v of vids) {
          try {
            const r = v.getBoundingClientRect();
            if (r.width < 50 || r.height < 50) continue;
            if (lastMouseX >= r.left && lastMouseX <= r.right && lastMouseY >= r.top && lastMouseY <= r.bottom) return true;
          } catch (e) {}
        }
      }
    } catch (e) {}
    return false;
  }

  function shouldHideCursor() {
    if (!master || !enabled) return false;
    if (document.visibilityState === "hidden") return false;
    if ((Date.now() - lastMouseMove) <= 2500) return false;
    // Pantalla completa: ocultar aunque se desconozca la posicion (comportamiento nativo).
    if (document.fullscreenElement) return true;
    // Video en reproduccion con el raton quieto sobre el reproductor.
    if (hasPlayingVideo() && mouseOverPlayer()) return true;
    return false;
  }

  function ensureHideStyle() {
    if (!document.head && !document.documentElement) return null;
    let st = document.getElementById("cat-cursor-autohide");
    if (!st) {
      st = document.createElement("style");
      st.id = "cat-cursor-autohide";
      st.textContent = HIDE_CSS;
      (document.head || document.documentElement).appendChild(st);
    }
    return st;
  }

  function updateCursorHide() {
    const should = shouldHideCursor();
    if (should === cursorAutoHidden) return;
    cursorAutoHidden = should;
    try {
      if (should) {
        ensureHideStyle();
        document.documentElement.classList.add("cat-cursor-hide");
      } else if (document.documentElement) {
        document.documentElement.classList.remove("cat-cursor-hide");
      }
    } catch (e) {}
    apply();
  }

  function spawnTrail(x, y) {
    try {
      if (!master || !enabled || !trail) return;
      if (cursorAutoHidden) return;
      if (document.visibilityState === "hidden") return;
      try {
        if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      } catch (e) {}
      const now = Date.now();
      if (now - lastTrailAt < 55) return;
      const dx = x - lastTrailX, dy = y - lastTrailY;
      if (dx * dx + dy * dy < 64) return;
      if (document.querySelectorAll(".cat-trail").length > 24) return;
      lastTrailAt = now;
      lastTrailX = x;
      lastTrailY = y;
      const p = document.createElement("span");
      p.className = "cat-trail";
      const star = Math.random() < 0.3;
      p.textContent = star ? "✦" : "🐾";
      const size = star ? 8 + Math.random() * 5 : 11 + Math.random() * 6;
      p.style.cssText = `position:fixed;left:${x}px;top:${y}px;width:${size}px;height:${size}px;margin:-${size / 2}px 0 0 -${size / 2}px;pointer-events:none;z-index:9999998;font-size:${size}px;line-height:1;opacity:.9;` +
        (star ? "color:#ffd94d;text-shadow:0 0 4px #ffd94d;" : "");
      (document.documentElement || document.body).appendChild(p);
      const drift = (Math.random() * 14) - 7;
      const anim = p.animate([
        { transform: "translate(0,0) scale(1)", opacity: 0.9 },
        { transform: `translate(${drift}px,${-10 - Math.random() * 14}px) scale(.3)`, opacity: 0 },
      ], { duration: 550 + Math.random() * 250, easing: "ease-out" });
      anim.onfinish = () => p.remove();
      setTimeout(() => { if (p.isConnected) p.remove(); }, 900);
    } catch (e) {}
  }

  function fxMode() {
    if (!master || !enabled || !stars) return null;
    if (theme === "ny") return "newyear";
    if (theme === "nav") return "xmas";
    if (festive === "off") {
      if (theme !== "nav" && theme !== "ny") return null;
    }
    const now = new Date(), m = now.getMonth(), d = now.getDate();
    const xmas = (m === 10 && d >= 25) || m === 11 || (m === 0 && d <= 25);
    const newyear = (m === 11 && d === 31) || (m === 0 && d === 1);
    if (festive === "auto" && newyear) return "newyear";
    if (festive === "siempre" && xmas || (festive === "auto" && xmas)) return "xmas";
    if (festive === "siempre") return "xmas";
    return null;
  }

  function unwantedFx() {
    if (!pageActive) return true;
    if (document.visibilityState === "hidden") return true;
    if (document.fullscreenElement) return true;
    const vids = document.querySelectorAll("video");
    for (const v of vids) {
      if (!v.paused && !v.ended && v.readyState > 2) return true;
    }
    return false;
  }

  function clearFxBox(instant) {
    const box = document.getElementById("cat-fx");
    const st = document.getElementById("cat-fx-style");
    if (instant || !box) {
      if (box) box.remove();
      if (st) st.remove();
      return;
    }
    box.classList.add("hide");
    clearTimeout(fxTimer);
    fxTimer = setTimeout(() => {
      const b = document.getElementById("cat-fx");
      if (b && b.classList.contains("hide")) b.remove();
      const s = document.getElementById("cat-fx-style");
      if (s && !document.getElementById("cat-fx")) s.remove();
    }, 1300);
  }

  function lightPage() {
    try {
      const bg = getComputedStyle(document.body || document.documentElement).backgroundColor;
      const m = bg.match(/[\d.]+/g);
      if (!m) return false;
      const [r, g, b] = m.map(Number);
      return (0.299 * r + 0.587 * g + 0.114 * b) > 150;
    } catch (e) { return false; }
  }

  function applyFx() {
    const mode = fxMode();
    const bad = unwantedFx();
    const key = (mode || "off") + "|" + (bad ? "1" : "0");
    const currentBox = document.getElementById("cat-fx");
    if (key === lastFxKey && currentBox && !currentBox.classList.contains("hide")) return;
    lastFxKey = key;
    if (!mode || bad) {
      clearFxBox(!bad);
      return;
    }
    if (!document.head && !document.documentElement) return;
    clearTimeout(fxTimer);
    let box = document.getElementById("cat-fx");
    if (box) {
      box.classList.remove("hide");
      return;
    }
    let style = document.getElementById("cat-fx-style");
    if (!style) {
      style = document.createElement("style");
      style.id = "cat-fx-style";
      style.textContent = FX_CSS;
      (document.head || document.documentElement).appendChild(style);
    }
    const strong = lightPage();
    box = document.createElement("div");
    box.id = "cat-fx";
    const color = mode === "xmas" ? "#ffffff" : "#ffd94d";
    for (let i = 0; i < 40; i++) {
      const f = document.createElement("span");
      f.className = "cat-flake" + (mode === "newyear" ? " ny" : "");
      if (mode === "newyear") f.textContent = "✦";
      const s = (3 + Math.random() * 5).toFixed(1);
      f.style.left = (Math.random() * 100).toFixed(2) + "vw";
      f.style.width = s + "px";
      f.style.height = s + "px";
      if (mode !== "newyear") f.style.background = color;
      f.style.opacity = (0.5 + Math.random() * 0.5).toFixed(2);
      if (strong) f.style.boxShadow = "0 0 0 1.5px rgba(0,0,0,.65)";
      f.style.animationDuration = (4 + Math.random() * 6).toFixed(2) + "s";
      f.style.animationDelay = (-Math.random() * 8).toFixed(2) + "s";
      box.appendChild(f);
    }
    (document.documentElement || document.body).appendChild(box);
  }

  const apply = () => {
    if (!document.head && !document.documentElement) return;
    try { cleanLegacyOiia(); } catch (e) {}
    let el = document.getElementById("cat-cursor-style");
    // Si toca ocultar (video idle/fullscreen): quitar cursor custom y forzar none.
    if (master && enabled && cursorAutoHidden) {
      if (el) el.remove();
      ensureHideStyle();
      try { document.documentElement.classList.add("cat-cursor-hide"); } catch (e) {}
      browser.runtime.sendMessage({ type: "cursor-retirar" }).catch(() => {});
      applyFx();
      return;
    }
    try { document.documentElement.classList.remove("cat-cursor-hide"); } catch (e) {}
    if (master && enabled) {
      if (!el) {
        el = document.createElement("style");
        el.id = "cat-cursor-style";
        (document.head || document.documentElement).appendChild(el);
      }
      el.textContent = css;
      browser.runtime.sendMessage({ type: "cursor-aplicar", css }).catch(() => {});
      applyScrollbar();
    } else if (el) {
      el.remove();
      browser.runtime.sendMessage({ type: "cursor-retirar" }).catch(() => {});
      applyScrollbar();
    } else {
      browser.runtime.sendMessage({ type: "cursor-retirar" }).catch(() => {});
      applyScrollbar();
    }
    applyFx();
  };

  const playSound = (url, volume, onError) => {
    try {
      const audio = new Audio(url);
      audio.volume = Math.min(1, Math.max(0, volume));
      if (onError) audio.addEventListener("error", onError, { once: true });
      const p = audio.play();
      if (p && p.catch) p.catch(() => {});
    } catch (e) {}
  };

  const clampVol = (v, fb) => (typeof v === "number" && isFinite(v) ? Math.min(100, Math.max(0, Math.round(v))) : fb);
  // Volumen final: categoria * general. / Final volume: category * master.
  const effClick = () => (volClick / 100) * (volGeneral / 100);
  const effMeow = () => (volMeow / 100) * (volGeneral / 100);

  // Celebracion al dar Like: maullido + confeti gatuno desde el cursor. / Like celebration: meow + cat confetti from cursor.
  const LIKE_SELECTORS = [
    "#segmented-like-button button",
    "ytd-segmented-like-dislike-button-renderer #segmented-like-button button",
    "[data-testid='like']",
    "[data-e2e='like-icon']",
    "[data-a-target='follow-button']",
    "button[class*='like' i]",
    "a[class*='like' i]",
  ].join(",");
  let lastLikeAt = 0;

  function isLikeButton(target) {
    try {
      if (!target || !target.closest) return null;
      const direct = target.closest(LIKE_SELECTORS);
      if (direct) {
        // Evitar confundir Dislike con Like. / Avoid mistaking Dislike for Like.
        const dl = ((direct.getAttribute && (direct.getAttribute("aria-label") || "")) || "").toLowerCase();
        if (dl.includes("dislike") || dl.includes("no me gusta")) return null;
        return direct;
      }
      const btn = target.closest("button, a, [role='button']");
      if (!btn) return null;
      const label = ((btn.getAttribute("aria-label") || "") + " " + (btn.getAttribute("title") || "")).toLowerCase();
      if (label.includes("dislike") || label.includes("no me gusta") || label.includes("no me")) return null;
      if (label.includes("like") || label.includes("me gusta") || label.includes("j'aime") || label.includes("mi piace")) return btn;
    } catch (e) {}
    return null;
  }

  // Acciones que celebran: suscribirse, aceptar/OK, login (Google) y mas.
  const SUB_SELECTORS = [
    "ytd-subscribe-button-renderer button",
    "#subscribe-button button",
  ].join(",");
  let lastTypeAt = 0;

  function buttonOf(target) {
    try { return target && target.closest ? target.closest("button, a, [role='button']") : null; } catch (e) { return null; }
  }

  function btnText(btn) {
    try {
      const t = ((btn.getAttribute("aria-label") || "") + " " + (btn.getAttribute("title") || "") + " " + (btn.innerText || btn.textContent || "")).toLowerCase().replace(/\s+/g, " ").trim();
      return t;
    } catch (e) { return ""; }
  }

  function detectAction(target) {
    try {
      if (isLikeButton(target)) return "like";
      if (!target || !target.closest) return null;
      if (target.closest(SUB_SELECTORS)) return "subscribe";
      const btn = buttonOf(target);
      if (!btn) return null;
      const t = btnText(btn);
      if (!t) return null;
      if (t.includes("dislike") || t.includes("no me gusta")) return null;
      if (t.includes("suscrib") || t.includes("subscrib")) return "subscribe";
      if (t.includes("google") && /(sign|iniciar|continuar|continue|acceder|log)/.test(t)) return "login";
      if (/(iniciar sesi|sign in|log in|log-in)/.test(t)) return "login";
      if (/(cerrar sesi|close session|sign out|log out|log-out|desconectar|deconnexion|abmelden)/.test(t)) return "logout";
      if (/\b(borrar|eliminar|delete|remove|quitar|papelera|trash|vaciar|descartar|discard)\b/.test(t)) return "delete";
      if (/\b(aceptar|accept|ok|de acuerdo|entendido|got it|continuar|continue|confirmar|confirm|guardar|save|enviar|send|vale|dale|listo|done)\b/.test(t)) return "accept";
    } catch (e) {}
    return null;
  }

  function celebrateKind(kind, x, y) {
    const now = Date.now();
    if (now - lastLikeAt < 350) return;
    lastLikeAt = now;
    if (!master) return;
    const big = kind === "subscribe";
    if (soundsOn && volGeneral > 0 && (kind === "like" || big)) playSound(MEOW_URL, effMeow());
    try {
      const cx = typeof x === "number" ? x : innerWidth / 2;
      const cy = typeof y === "number" ? y : innerHeight / 2;
      const colors = ["#ffd94d", "#ff6b9d", "#4dd2ff", "#7dff6b", "#c58bff", "#ffffff", "#ff8c42"];
      const n = big ? 40 : kind === "login" ? 26 : 18;
      for (let i = 0; i < n; i++) {
        const p = document.createElement("span");
        const isStar = i % 7 === 0;
        p.textContent = isStar ? "✦" : "";
        const size = isStar ? 12 + Math.random() * 6 : 5 + Math.random() * 6;
        p.style.cssText = `position:fixed;left:${cx}px;top:${cy}px;width:${size}px;height:${size}px;margin:-${size / 2}px 0 0 -${size / 2}px;pointer-events:none;z-index:9999999;font-size:${size}px;line-height:1;` +
          (isStar ? "background:transparent;color:#ffd94d;text-shadow:0 0 4px #ffd94d;" : `background:${colors[i % colors.length]};border-radius:${i % 3 === 0 ? "50%" : "2px"};`);
        (document.documentElement || document.body).appendChild(p);
        const angle = Math.random() * Math.PI * 2;
        const dist = 60 + Math.random() * 130;
        const dx = Math.cos(angle) * dist;
        const dy = Math.sin(angle) * dist - 70;
        const anim = p.animate([
          { transform: "translate(0,0) scale(1) rotate(0deg)", opacity: 1 },
          { transform: `translate(${dx}px,${dy}px) scale(0.6) rotate(${(Math.random() * 360) | 0}deg)`, opacity: 0 },
        ], { duration: 900 + Math.random() * 700, easing: "cubic-bezier(.2,.7,.3,1)" });
        anim.onfinish = () => p.remove();
        setTimeout(() => { if (p.isConnected) p.remove(); }, 1800);
      }
      if (kind === "subscribe" || kind === "login" || kind === "delete") spinCat(cx, cy);
    } catch (e) {}
  }

  // Gato giratorio estilo meme OIIA con el dibujo del tema (sin musica por derechos de autor). / OIIA-style spinning theme cat (no music for copyright reasons).
  // Paleta por tema: cara, borde, interior oreja, ojo, pupila, boca, bigotes. / Per-theme palette.
  const SPIN_COLORS = {
    calc: ["#3b3b3b", "#ffffff", "#ff9db0", "#ffd94d", "#1a1a1a", "#ff9db0", "#ffffff"],
    win: ["#2b4d80", "#ffffff", "#7fb3d5", "#ffffff", "#1a1a1a", "#7fb3d5", "#ffffff"],
    mc: ["#5aa02c", "#2e1c0e", "#6b4a2b", "#ffffff", "#1a1a1a", "#3a2412", "#ffffff"],
    gd: ["#00b8cc", "#0b0b1a", "#ff2fb3", "#ffffff", "#0b0b1a", "#ff2fb3", "#ffffff"],
    nav: ["#c01010", "#ffffff", "#0a7d3a", "#ffffff", "#1a1a1a", "#ffd94d", "#ffffff"],
    ny: ["#222222", "#ffd94d", "#ffd94d", "#ffd94d", "#111111", "#ffd94d", "#ffd94d"],
  };

  // Nodo SVG del gato via DOMParser, sin innerHTML (fuente local: paleta propia). / Cat SVG node via DOMParser, no innerHTML (local source: own palette).
  function spinSVGNode() {
    const c = SPIN_COLORS[theme] || SPIN_COLORS.calc;
    try {
      const src = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96" width="64" height="64"><circle cx="48" cy="52" r="30" fill="${c[0]}" stroke="${c[1]}" stroke-width="3"/><polygon points="26,38 20,14 40,28" fill="${c[0]}" stroke="${c[1]}" stroke-width="3" stroke-linejoin="round"/><polygon points="70,38 76,14 56,28" fill="${c[0]}" stroke="${c[1]}" stroke-width="3" stroke-linejoin="round"/><polygon points="27,33 23,19 37,28" fill="${c[2]}"/><polygon points="69,33 73,19 59,28" fill="${c[2]}"/><ellipse cx="38" cy="50" rx="4.5" ry="6" fill="${c[3]}"/><ellipse cx="58" cy="50" rx="4.5" ry="6" fill="${c[3]}"/><ellipse cx="38" cy="51" rx="1.8" ry="3.4" fill="${c[4]}"/><ellipse cx="58" cy="51" rx="1.8" ry="3.4" fill="${c[4]}"/><path d="M44 62 Q48 66 52 62" stroke="${c[5]}" stroke-width="2.5" fill="none" stroke-linecap="round"/><g stroke="${c[6]}" stroke-width="1.6" stroke-linecap="round" opacity="0.85"><line x1="14" y1="54" x2="30" y2="56"/><line x1="14" y1="62" x2="30" y2="60"/><line x1="82" y1="54" x2="66" y2="56"/><line x1="82" y1="62" x2="66" y2="60"/></g></svg>`;
      const doc = new DOMParser().parseFromString(src, "image/svg+xml");
      const node = doc ? doc.documentElement : null;
      if (!node || (node.tagName || "").toLowerCase() !== "svg") return null;
      try { return document.importNode(node, true); } catch (e) { return node; }
    } catch (e) {}
    return null;
  }

  // Guardia anti-apilado: evita varias celebraciones solapadas que alarguen el efecto.
  let oiiaActive = false;
  // Limpieza de restos de versiones anteriores que ocultaban el cursor (cursor:none).
  function cleanLegacyOiia() {
    try { if (document.documentElement) document.documentElement.classList.remove("cat-oiia-cursor"); } catch (e) {}
    try { const st = document.getElementById("cat-oiia-style"); if (st) st.remove(); } catch (e) {}
  }

  function spinCat(x, y) {
    try {
      try {
        if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      } catch (e) {}
      // NUNCA ocultar el cursor del sistema: el gato ORBITA alrededor del cursor
      // sin tapar el punto de clic ni bloquear la UI (login/logout, etc.).
      // NEVER hide the system cursor: the cat ORBITS around the cursor.
      if (oiiaActive) return;
      cleanLegacyOiia();
      const art = spinSVGNode();
      if (!art) return;
      oiiaActive = true;
      const SIZE = 44;
      const RADIUS = 30; // radio de la orbita alrededor del cursor
      const DURATION = 1500;
      const ORBIT_TURNS = 1.5; // vueltas alrededor del cursor durante la celebracion
      // El handler solo guarda coords (barato); el movimiento lo pinta el rAF con transform (GPU).
      let mx = typeof x === "number" ? x : window.innerWidth / 2;
      let my = typeof y === "number" ? y : window.innerHeight / 2;
      const onMove = (e) => {
        try {
          if (e && typeof e.clientX === "number" && typeof e.clientY === "number") {
            mx = e.clientX;
            my = e.clientY;
          }
        } catch (err) {}
      };
      document.addEventListener("mousemove", onMove, { passive: true, capture: true });
      const wrap = document.createElement("div");
      wrap.setAttribute("aria-hidden", "true");
      wrap.id = "cat-oiia-wrap";
      wrap.style.cssText = `position:fixed;left:0;top:0;width:${SIZE}px;height:${SIZE}px;pointer-events:none;z-index:2147483647;opacity:.95;will-change:transform;margin:0;padding:0;border:0;background:transparent;overflow:visible;`;
      // Blindaje: ni el CSS de la pagina puede mandarlo detras ni hacerlo clicable.
      try {
        wrap.style.setProperty("position", "fixed", "important");
        wrap.style.setProperty("z-index", "2147483647", "important");
        wrap.style.setProperty("pointer-events", "none", "important");
      } catch (e) {}
      const spin = document.createElement("div");
      try {
        art.setAttribute("width", String(SIZE));
        art.setAttribute("height", String(SIZE));
        art.style.width = SIZE + "px";
        art.style.height = SIZE + "px";
      } catch (e) {}
      spin.appendChild(art);
      spin.style.cssText = `width:${SIZE}px;height:${SIZE}px;will-change:transform;`;
      wrap.appendChild(spin);
      (document.documentElement || document.body).appendChild(wrap);
      let raf = 0;
      let ended = false;
      const end = () => {
        if (ended) return;
        ended = true;
        oiiaActive = false;
        try { cancelAnimationFrame(raf); } catch (e) {}
        try { document.removeEventListener("mousemove", onMove, { capture: true }); } catch (e) {}
        try { window.removeEventListener("pagehide", end); } catch (e) {}
        cleanLegacyOiia();
        try { if (wrap.isConnected) wrap.remove(); } catch (e) {}
      };
      try { window.addEventListener("pagehide", end, { once: true }); } catch (e) {}
      let t0 = 0;
      try { t0 = performance.now(); } catch (e) { t0 = Date.now(); }
      const frame = (now) => {
        if (ended) return;
        try {
          let t = (now - t0) / DURATION;
          if (!(t >= 0)) t = 0; // relojes distintos si performance.now fallo
          if (t >= 1) { end(); return; }
          const ang = t * ORBIT_TURNS * Math.PI * 2;
          const px = mx + Math.cos(ang) * RADIUS - SIZE / 2;
          const py = my + Math.sin(ang) * RADIUS - SIZE / 2;
          const cx = Math.min(Math.max(px, -SIZE / 2), window.innerWidth - SIZE / 2);
          const cy = Math.min(Math.max(py, -SIZE / 2), window.innerHeight - SIZE / 2);
          try { wrap.style.setProperty("transform", `translate3d(${cx}px,${cy}px,0)`, "important"); }
          catch (err2) { wrap.style.transform = `translate3d(${cx}px,${cy}px,0)`; }
        } catch (err) {}
        try { raf = requestAnimationFrame(frame); } catch (e) {}
      };
      // Giro propio del gato mientras orbita (el gato gira, no el cursor).
      let rot = null;
      try {
        rot = spin.animate([{ transform: "rotate(0deg)" }, { transform: "rotate(1080deg)" }], { duration: DURATION - 100, easing: "linear" });
      } catch (e) { rot = null; }
      if (rot) rot.onfinish = end;
      try { raf = requestAnimationFrame(frame); } catch (e) {}
      setTimeout(end, DURATION + 150);
    } catch (e) {
      try { oiiaActive = false; } catch (err) {}
    }
  }

  // Destellos al teclear en campos editables (ligero y con limite). / Typing sparkles.
  function spawnPuff(x, y) {
    try {
      if (document.querySelectorAll(".cat-trail").length > 30) return;
      for (let i = 0; i < 2; i++) {
        const p = document.createElement("span");
        p.className = "cat-trail";
        p.textContent = "✦";
        const size = 7 + Math.random() * 4;
        const px = x + (Math.random() * 20 - 10);
        p.style.cssText = `position:fixed;left:${px}px;top:${y}px;width:${size}px;height:${size}px;margin:-${size / 2}px 0 0 -${size / 2}px;pointer-events:none;z-index:9999998;font-size:${size}px;line-height:1;color:#ffd94d;text-shadow:0 0 4px #ffd94d;`;
        (document.documentElement || document.body).appendChild(p);
        const anim = p.animate([
          { transform: "translate(0,0) scale(1)", opacity: 0.9 },
          { transform: `translate(${(Math.random() * 12 - 6).toFixed(1)}px,${(-12 - Math.random() * 10).toFixed(1)}px) scale(.3)`, opacity: 0 },
        ], { duration: 500 + Math.random() * 200, easing: "ease-out" });
        anim.onfinish = () => p.remove();
        setTimeout(() => { if (p.isConnected) p.remove(); }, 800);
      }
    } catch (e) {}
  }

  document.addEventListener("keydown", (e) => {
    try {
      if (!master || !enabled || !trail) return;
      if (cursorAutoHidden || document.visibilityState === "hidden") return;
      if (!e || typeof e.key !== "string" || e.key.length !== 1) return;
      const t = e.target;
      const isText = t && (t.tagName === "TEXTAREA" ||
        (t.tagName === "INPUT" && /^(text|search|url|email|password|tel|number|)$/.test(String(t.type || "").toLowerCase())) ||
        t.isContentEditable);
      if (!isText) return;
      const now = Date.now();
      if (now - lastTypeAt < 350) return;
      lastTypeAt = now;
      const r = t.getBoundingClientRect();
      spawnPuff(r.left + r.width * (0.3 + Math.random() * 0.6), r.top + 10);
    } catch (err) {}
  }, { passive: true, capture: true });

  document.addEventListener("click", (e) => {
    const act = detectAction(e.target);
    if (act) {
      const bx = (e && typeof e.clientX === "number") ? e.clientX : -1;
      const by = (e && typeof e.clientY === "number") ? e.clientY : -1;
      setTimeout(() => celebrateKind(act, bx, by), 30);
    }
    if (!master || !enabled || !soundsOn) return;
    if (volGeneral <= 0) return;
    if (clickSoundOk) {
      playSound(CLICK_URL, effClick(), () => { clickSoundOk = false; });
    }
    if (Math.random() < MEOW_CHANCE) {
      setTimeout(() => playSound(MEOW_URL, effMeow()), 120);
    }
  }, true);

  browser.storage.local.get(["master", "enabled", "sounds", "theme", "festive", "stars", "trail", "volGeneral", "volClick", "volMeow"]).then((res) => {
    master = res.master !== false;
    enabled = res.enabled !== false;
    soundsOn = res.sounds !== false;
    if (typeof res.theme === "string") theme = res.theme;
    if (typeof res.festive === "string") festive = res.festive;
    if (res.stars === false) stars = false;
    if (res.trail === false) trail = false;
    volGeneral = clampVol(res.volGeneral, 50);
    volClick = clampVol(res.volClick, 25);
    volMeow = clampVol(res.volMeow, 25);
    apply();
  }).catch(() => apply());

  browser.storage.onChanged.addListener((changes) => {
    if (changes.master) { master = changes.master.newValue !== false; lastFxKey = "none"; cursorAutoHidden = false; }
    if (changes.enabled) { enabled = changes.enabled.newValue !== false; lastFxKey = "none"; cursorAutoHidden = false; }
    if (changes.sounds) soundsOn = changes.sounds.newValue !== false;
    if (changes.theme) { theme = changes.theme.newValue; lastFxKey = "none"; }
    if (changes.festive) { festive = changes.festive.newValue; lastFxKey = "none"; }
    if (changes.stars) { stars = changes.stars.newValue !== false; lastFxKey = "none"; }
    if (changes.trail) {
      trail = changes.trail.newValue !== false;
      if (!trail) {
        try { document.querySelectorAll(".cat-trail").forEach((n) => n.remove()); } catch (e) {}
      }
    }
    if (changes.volGeneral) volGeneral = clampVol(changes.volGeneral.newValue, 50);
    if (changes.volClick) volClick = clampVol(changes.volClick.newValue, 25);
    if (changes.volMeow) volMeow = clampVol(changes.volMeow.newValue, 25);
    updateCursorHide();
    apply();
  });

  // Diagnostico desde el popup: responde si el script vive en esta pestaña. / Popup diagnosis: answers if the script is alive on this tab.
  try {
    browser.runtime.onMessage.addListener((msg) => {
      if (msg && msg.type === "cat-ping-ask") {
        return Promise.resolve({ alive: true, master, enabled, trail, curOk: curLoadOk, iconOk: iconLoadOk, url: String(location.href) });
      }
      return undefined;
    });
  } catch (e) {}

  document.addEventListener("fullscreenchange", () => { applyFx(); updateCursorHide(); });
  document.addEventListener("visibilitychange", () => { applyFx(); updateCursorHide(); });
  function resumeFx() {
    pageActive = true;
    clearTimeout(idleTimer);
    idleTimer = setTimeout(() => { pageActive = false; applyFx(); }, 15000);
    applyFx();
  }
  function pauseFx() {
    pageActive = false;
    clearTimeout(idleTimer);
    applyFx();
  }
  // Cualquier actividad reinicia el temporizador de auto-ocultado y muestra el cursor al instante.
  function pokeCursor(e) {
    lastMouseMove = Date.now();
    try {
      if (e && typeof e.clientX === "number" && typeof e.clientY === "number") {
        lastMouseX = e.clientX;
        lastMouseY = e.clientY;
      }
    } catch (err) {}
    if (cursorAutoHidden) updateCursorHide();
  }
  ["mousemove", "mousedown", "keydown", "touchstart", "focusin"].forEach((event) => document.addEventListener(event, resumeFx, { passive: true }));
  ["mousemove", "mousedown", "keydown", "touchstart", "wheel"].forEach((event) => document.addEventListener(event, pokeCursor, { passive: true, capture: true }));
  document.addEventListener("mousemove", (e) => {
    try {
      if (e && typeof e.clientX === "number") spawnTrail(e.clientX, e.clientY);
    } catch (err) {}
  }, { passive: true, capture: true });
  window.addEventListener("focus", resumeFx);
  window.addEventListener("blur", pauseFx);
  ["play", "pause", "ended", "emptied"].forEach((ev) => {
    document.addEventListener(ev, () => { applyFx(); updateCursorHide(); }, true);
  });
  // YouTube cambia clases (ytp-autohide) sin eventos de video: observar cambios y revisar cada 600 ms.
  try {
    const obs = new MutationObserver(() => updateCursorHide());
    obs.observe(document.documentElement || document, { attributes: true, subtree: true, attributeFilter: ["class"] });
  } catch (e) {}
  setInterval(updateCursorHide, 600);

  try { cleanLegacyOiia(); } catch (e) {}
  // Si la pagina vuelve desde bfcache con restos viejos, limpiar antes de pintar.
  try { window.addEventListener("pageshow", cleanLegacyOiia); } catch (e) {}
  resumeFx();
  apply();
  document.addEventListener("DOMContentLoaded", apply);
})();
