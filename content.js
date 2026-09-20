// Marca Freezeezy Peak.
// GitHub: github.com/FreezeezyPeak-StudioDev | GitLab: gitlab.com/freezeezypeak.studiodev
// Correo: freezeezypeak.studiodev@gmail.com
(() => {
  // CatCursorF: 8 cursores, sonidos y festivo que se oculta en video/pantalla completa.
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
  let clickSoundOk = true;
  let lastFxKey = "none";
  let fxTimer = 0;
  let pageActive = true;
  let idleTimer = 0;

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
    :disabled, [disabled], [aria-disabled="true"] {
      cursor: url("${URLS.unavailable}"), not-allowed !important;
    }
    canvas {
      cursor: url("${URLS.precision}"), crosshair !important;
    }
    input[type="number"] {
      cursor: url("${URLS.vResize}"), ns-resize !important;
    }
  `;

  const FX_CSS = `@keyframes catfall{to{transform:translateY(105vh)}}@keyframes catstar{to{transform:translateY(105vh) rotate(180deg)}}#cat-fx{transition:opacity 1.2s ease;}#cat-fx.hide{opacity:0;}.cat-flake{position:fixed;top:-12px;border-radius:50%;pointer-events:none;z-index:999999;box-shadow:0 0 0 1px rgba(0,0,0,.5);animation-name:catfall;animation-timing-function:linear;animation-iteration-count:infinite;}.cat-flake.ny{background:transparent!important;border-radius:0;box-shadow:none;font-size:20px;line-height:1;color:#ffd94d;text-shadow:0 0 5px #ffd94d;animation-name:catstar;}`;

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
    let el = document.getElementById("cat-cursor-style");
    if (master && enabled) {
      if (!el) {
        el = document.createElement("style");
        el.id = "cat-cursor-style";
        (document.head || document.documentElement).appendChild(el);
      }
      el.textContent = css;
      browser.runtime.sendMessage({ type: "cursor-aplicar", css }).catch(() => {});
    } else if (el) {
      el.remove();
      browser.runtime.sendMessage({ type: "cursor-retirar" }).catch(() => {});
    } else {
      browser.runtime.sendMessage({ type: "cursor-retirar" }).catch(() => {});
    }
    applyFx();
  };

  const playSound = (url, volume, onError) => {
    try {
      const audio = new Audio(url);
      audio.volume = volume;
      if (onError) audio.addEventListener("error", onError, { once: true });
      const p = audio.play();
      if (p && p.catch) p.catch(() => {});
    } catch (e) {}
  };

  document.addEventListener("click", () => {
    if (!master || !enabled || !soundsOn) return;
    if (clickSoundOk) {
      playSound(CLICK_URL, 0.35, () => { clickSoundOk = false; });
    }
    if (Math.random() < MEOW_CHANCE) {
      setTimeout(() => playSound(MEOW_URL, 0.5), 120);
    }
  }, true);

  browser.storage.local.get(["master", "enabled", "sounds", "theme", "festive", "stars"]).then((res) => {
    master = res.master !== false;
    enabled = res.enabled !== false;
    soundsOn = res.sounds !== false;
    if (typeof res.theme === "string") theme = res.theme;
    if (typeof res.festive === "string") festive = res.festive;
    if (res.stars === false) stars = false;
    apply();
  }).catch(() => apply());

  browser.storage.onChanged.addListener((changes) => {
    if (changes.master) { master = changes.master.newValue !== false; lastFxKey = "none"; }
    if (changes.enabled) { enabled = changes.enabled.newValue !== false; lastFxKey = "none"; }
    if (changes.sounds) soundsOn = changes.sounds.newValue !== false;
    if (changes.theme) { theme = changes.theme.newValue; lastFxKey = "none"; }
    if (changes.festive) { festive = changes.festive.newValue; lastFxKey = "none"; }
    if (changes.stars) { stars = changes.stars.newValue !== false; lastFxKey = "none"; }
    apply();
  });

  document.addEventListener("fullscreenchange", applyFx);
  document.addEventListener("visibilitychange", applyFx);
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
  ["mousemove", "mousedown", "keydown", "touchstart", "focusin"].forEach((event) => document.addEventListener(event, resumeFx, { passive: true }));
  window.addEventListener("focus", resumeFx);
  window.addEventListener("blur", pauseFx);
  ["play", "pause", "ended", "emptied"].forEach((ev) => {
    document.addEventListener(ev, applyFx, true);
  });

  resumeFx();
  apply();
  document.addEventListener("DOMContentLoaded", apply);
})();
