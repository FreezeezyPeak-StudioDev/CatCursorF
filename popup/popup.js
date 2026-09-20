// Marca Freezeezy Peak.
// GitHub: github.com/FreezeezyPeak-StudioDev | GitLab: gitlab.com/freezeezypeak.studiodev
// Correo: freezeezypeak.studiodev@gmail.com
// CatCursorF: menú, estados, juego Shell e idioma desde _locales.
const EMAIL = "freezeezypeak.studiodev@gmail.com";
const STATUE_COST = 1000000;
const THEMES = ["calc", "win", "mc", "gd", "nav", "ny"];
const BRAND_ICONS = {
  calc: "../assets/icons/iconNormal.svg",
  win: "../assets/icons/iconWin.svg",
  mc: "../assets/icons/iconMc.svg",
  gd: "../assets/icons/iconGd.svg",
  nav: "../assets/icons/iconNav.svg",
  ny: "../assets/icons/iconNy.svg",
};
const FX_ORDER = ["auto", "siempre", "off"];

let lang = "es";
let master = true, enabled = true, sounds = true;
let theme = "calc", festive = "auto";
let stars = true, autoTheme = true;
let money = 25, bet = 2, debt = 0, statues = 0;
let won = 0, lost = 0, streak = 0;
let ball = -1, playing = false;
let lastPopupFx = "none";
let T = {};

const $ = (id) => document.getElementById(id);
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const round2 = (n) => Math.round(n * 100) / 100;
const txt = (k) => (T[k] && T[k].message ? T[k].message.replace(/\$\$/g, "$") : k);

async function loadLocale(l) {
  try {
    const res = await fetch(browser.runtime.getURL(`_locales/${l}/messages.json`));
    T = await res.json();
  } catch (e) { T = {}; }
  render();
}

function go(name) {
  document.querySelectorAll(".screen").forEach((s) => s.classList.add("hidden"));
  $("screen-" + name).classList.remove("hidden");
}

function seasonNow() {
  const n = new Date(), m = n.getMonth(), d = n.getDate();
  if ((m === 10 && d >= 25) || m === 11 || (m === 0 && d <= 25)) return "xmas";
  if ((m === 11 && d === 31) || (m === 0 && d === 1)) return "newyear";
  return null;
}

function statusText() {
  if (!master) return txt("statusOff");
  if (enabled && sounds) return txt("statusOn");
  if (!enabled && !sounds) return txt("stAllOff");
  if (!enabled) return txt("stCursorOff");
  return txt("stFxOff");
}

function popupFxMode() {
  if (!stars) return null;
  // El tema elegido tiene prioridad sobre la fecha: Año Nuevo nunca conserva nieve.
  if (theme === "ny") return "newyear";
  if (theme === "nav") return "xmas";
  if (festive === "off") return theme === "nav" ? "xmas" : theme === "ny" ? "newyear" : null;
  const s = seasonNow();
  if (s === "newyear") return "newyear";
  if (festive === "siempre" || s === "xmas") return "xmas";
  return null;
}

function applyPopupSnow() {
  const mode = popupFxMode();
  let box = $("popup-snow");
  if (mode === lastPopupFx && box) return;
  lastPopupFx = mode;
  if (box) box.remove();
  if (!mode) return;
  box = document.createElement("div");
  box.id = "popup-snow";
  const color = mode === "xmas" ? "#ffffff" : "#ffd94d";
  for (let i = 0; i < 14; i++) {
    const f = document.createElement("span");
    f.className = mode === "newyear" ? "psnow pstar" : "psnow";
    if (mode === "newyear") f.textContent = "✦";
    const s = (2 + Math.random() * 3).toFixed(1);
    f.style.left = (Math.random() * 100).toFixed(1) + "%";
    f.style.width = s + "px";
    f.style.height = s + "px";
    if (mode !== "newyear") f.style.background = color;
    f.style.animationDuration = (3 + Math.random() * 4).toFixed(2) + "s";
    f.style.animationDelay = (-Math.random() * 6).toFixed(2) + "s";
    box.appendChild(f);
  }
  document.body.appendChild(box);
}

function renderGame() {
  const over = money <= 0 && !playing && ball < 0;
  if (over) $("g-msg").textContent = txt("gameover");
  $("g-money").textContent = money.toFixed(2);
  const inp = $("g-betinput");
  if (document.activeElement !== inp) inp.value = bet;
  $("g-stats").textContent = `${txt("sWon")}: ${won} · ${txt("sLost")}: ${lost} · ${txt("sStreak")}: ${streak}`;
  $("g-debt").textContent = `${txt("debtL")}: $${debt.toFixed(2)}`;
  $("g-goal").textContent = `${txt("goal")}: $1,000,000 · ${txt("owned")}: ${statues}`;
  $("g-play").disabled = playing || over || bet > money;
  $("g-buy").disabled = playing || over || money < STATUE_COST;
  $("g-work").disabled = over;
  $("g-loan10").disabled = over;
  $("g-loan50").disabled = over;
  $("g-loan100").disabled = over;
  $("g-repay").disabled = over;
  $("g-gameover").classList.toggle("hidden", !over);
}

function render() {
  const minimized = document.body.classList.contains("minimized");
  document.body.className = "theme-" + theme + (minimized ? " minimized" : "");
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const k = el.getAttribute("data-i18n");
    if (T[k] && T[k].message) el.textContent = T[k].message.replace(/\$\$/g, "$");
  });
  const st = $("status");
  st.textContent = statusText();
  const lcd = st.closest(".lcd");
  if (lcd) { lcd.classList.remove("flash"); void lcd.offsetWidth; lcd.classList.add("flash"); }
  $("brand-icon").src = BRAND_ICONS[theme] || BRAND_ICONS.calc;
  const pw = $("btn-power");
  pw.title = master ? txt("powerOn") : txt("powerOff");
  pw.setAttribute("aria-label", pw.title);
  pw.className = `key power ${master ? "is-on" : "is-off"}`;
  $("btn-cursor").textContent = `${txt("cursor")}: ${enabled ? "ON" : "OFF"}`;
  $("btn-cursor").className = `key ${enabled ? "is-on" : "is-off"}`;
  $("btn-sound").textContent = `${txt("sound")}: ${sounds ? "ON" : "OFF"}`;
  $("btn-sound").className = `key ${sounds ? "is-on" : "is-off"}`;
  $("festive-label").textContent = festive === "auto" ? txt("fxAuto") : festive === "siempre" ? txt("fxAlways") : txt("fxOff");
  const sb = $("btn-stars");
  sb.textContent = `${txt("stars")}: ${stars ? "ON" : "OFF"}`;
  sb.classList.toggle("is-on", stars);
  sb.classList.toggle("is-off", !stars);
  const ab = $("btn-autotheme");
  ab.textContent = `${txt("autotheme")}: ${autoTheme ? "ON" : "OFF"}`;
  ab.classList.toggle("is-on", autoTheme);
  ab.classList.toggle("is-off", !autoTheme);
  document.querySelectorAll(".lang-es").forEach((b) => b.classList.toggle("is-on", lang === "es"));
  document.querySelectorAll(".lang-en").forEach((b) => b.classList.toggle("is-on", lang === "en"));
  THEMES.forEach((th) => {
    document.querySelectorAll(".pick-" + th).forEach((b) => b.classList.toggle("is-on", theme === th));
  });
  // Fuente confiable local: _locales/*.json empaquetado, sin datos remotos ni de usuario.
  $("credits-body").innerHTML = txt("creditsHtml");
  renderGame();
  applyPopupSnow();
}

async function saveAll() {
  await browser.storage.local.set({ master, enabled, sounds, theme, festive, stars, autoTheme });
}

async function saveGame() {
  await browser.storage.local.set({ money, bet, debt, statues, won, lost, streak });
}

function applyAutoTheme() {
  if (!autoTheme) return false;
  const s = seasonNow();
  const want = s === "xmas" ? "nav" : s === "newyear" ? "ny" : null;
  if (want && theme !== want) { theme = want; return true; }
  if (!want && (theme === "nav" || theme === "ny")) { theme = "calc"; return true; }
  return false;
}

browser.storage.local.get(["master", "enabled", "sounds", "lang", "theme", "festive", "stars", "autoTheme", "money", "bet", "debt", "statues", "won", "lost", "streak"])
  .then((res) => {
    master = res.master !== false;
    enabled = res.enabled !== false;
    sounds = res.sounds !== false;
    if (res.lang === "en" || res.lang === "es") lang = res.lang;
    if (THEMES.includes(res.theme)) theme = res.theme;
    if (FX_ORDER.includes(res.festive)) festive = res.festive;
    if (res.stars !== false) stars = res.stars !== false;
    if (typeof res.autoTheme === "boolean") autoTheme = res.autoTheme;
    if (typeof res.money === "number") money = res.money;
    if (typeof res.bet === "number" && res.bet >= 0) bet = Math.floor(res.bet);
    if (typeof res.debt === "number") debt = res.debt;
    if (typeof res.statues === "number") statues = res.statues;
    if (typeof res.won === "number") won = res.won;
    if (typeof res.lost === "number") lost = res.lost;
    if (typeof res.streak === "number") streak = res.streak;
    bet = Math.min(Math.max(0, bet), Math.floor(money));
    if (applyAutoTheme()) browser.storage.local.set({ theme });
    loadLocale(lang);
  })
  .catch(() => loadLocale(lang));

document.querySelectorAll("[data-go]").forEach((b) => {
  b.addEventListener("click", () => go(b.getAttribute("data-go")));
});

$("btn-power").addEventListener("click", async () => {
  master = !master;
  await browser.storage.local.set({ master });
  render();
});

$("btn-minimize").addEventListener("click", () => {
  document.body.classList.toggle("minimized");
  const minimized = document.body.classList.contains("minimized");
  $("btn-minimize").textContent = minimized ? "+" : "−";
  $("btn-minimize").title = minimized ? "Restaurar" : "Minimizar";
  $("btn-minimize").setAttribute("aria-label", $("btn-minimize").title);
});

$("btn-cursor").addEventListener("click", async () => {
  enabled = !enabled;
  await browser.storage.local.set({ enabled });
  render();
});

$("btn-sound").addEventListener("click", async () => {
  sounds = !sounds;
  await browser.storage.local.set({ sounds });
  render();
});

$("btn-festive").addEventListener("click", async () => {
  festive = FX_ORDER[(FX_ORDER.indexOf(festive) + 1) % FX_ORDER.length];
  await browser.storage.local.set({ festive });
  lastPopupFx = "none";
  render();
});

$("btn-stars").addEventListener("click", async () => {
  stars = !stars;
  await browser.storage.local.set({ stars });
  lastPopupFx = "none";
  render();
});

$("btn-autotheme").addEventListener("click", async () => {
  autoTheme = !autoTheme;
  await browser.storage.local.set({ autoTheme });
  if (applyAutoTheme()) await browser.storage.local.set({ theme });
  lastPopupFx = "none";
  render();
});

document.querySelectorAll(".lang-es").forEach((b) => b.addEventListener("click", async () => {
  lang = "es"; await browser.storage.local.set({ lang }); loadLocale(lang);
}));
document.querySelectorAll(".lang-en").forEach((b) => b.addEventListener("click", async () => {
  lang = "en"; await browser.storage.local.set({ lang }); loadLocale(lang);
}));
THEMES.forEach((th) => {
  document.querySelectorAll(".pick-" + th).forEach((b) => b.addEventListener("click", async () => {
    theme = th; autoTheme = false;
    await browser.storage.local.set({ theme, autoTheme });
    lastPopupFx = "none";
    document.body.classList.remove("theme-switch");
    void document.body.offsetWidth;
    document.body.classList.add("theme-switch");
    setTimeout(() => document.body.classList.remove("theme-switch"), 420);
    render();
  }));
});

$("credits-btn").addEventListener("click", () => $("credits").classList.toggle("hidden"));

$("btn-resetall").addEventListener("click", async () => {
  master = true; enabled = true; sounds = true;
  theme = "calc"; festive = "auto"; stars = true; autoTheme = true;
  lang = "es";
  await browser.storage.local.set({ master, enabled, sounds, theme, festive, stars, autoTheme, lang });
  lastPopupFx = "none";
  loadLocale(lang);
});

$("g-resetgame").addEventListener("click", async () => {
  money = 25; bet = 2; debt = 0; statues = 0;
  won = 0; lost = 0; streak = 0;
  cupsReset();
  await saveGame(); render();
});

$("g-retry").addEventListener("click", async () => {
  money = 25; debt = 0; streak = 0; bet = 2;
  cupsReset();
  await saveGame(); render();
});

$("btn-tutorial").addEventListener("click", () => {
  browser.tabs.create({ url: browser.runtime.getURL("tutorial/tutorial.html") });
});

$("btn-fullcredits").addEventListener("click", () => {
  browser.tabs.create({ url: browser.runtime.getURL("creditos/creditos.html") });
});

$("btn-license").addEventListener("click", () => {
  browser.tabs.create({ url: browser.runtime.getURL("licencia/licencia.html") });
});

$("btn-email").addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(EMAIL);
  } catch (e) {
    // Fallback solo si falla Clipboard API (permiso clipboardWrite ya declarado).
    const ta = document.createElement("textarea");
    ta.value = EMAIL;
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand("copy"); } catch (e2) {}
    ta.remove();
  }
  const msg = $("email-msg");
  msg.textContent = txt("copied");
  msg.classList.remove("hidden");
  setTimeout(() => msg.classList.add("hidden"), 2500);
});

// Juego Shell: muestra el gato en las 3, tapa, mezcla con FLIP y elige.
const cups = Array.from(document.querySelectorAll(".cup"));
const cupsBox = $("cups-box");

function cupsReset() {
  cups.forEach((c) => c.classList.remove("lift", "has-cat", "winner", "mix", "moving"));
  cupsBox.classList.remove("loss-cursor");
  ball = -1;
}

function clampBet(v) {
  return Math.min(Math.max(0, v || 0), Math.floor(money));
}

$("g-minus").addEventListener("click", async () => {
  bet = clampBet(bet - 1);
  await saveGame(); render();
});
$("g-plus").addEventListener("click", async () => {
  bet = clampBet(bet + 1);
  await saveGame(); render();
});
$("g-allin").addEventListener("click", async () => {
  bet = Math.floor(money);
  await saveGame(); render();
});
$("g-betinput").addEventListener("change", async (e) => {
  bet = clampBet(parseInt(e.target.value, 10));
  await saveGame(); render();
});

async function flipSwap(i, j) {
  const kids = Array.from(cupsBox.children);
  const elA = kids[i], elB = kids[j];
  if (!elA || !elB || elA === elB) return;
  const rA = elA.getBoundingClientRect(), rB = elB.getBoundingClientRect();
  elA.classList.add("moving");
  await wait(110);
  elB.classList.add("moving");
  await wait(110);
  const order = kids.slice();
  [order[i], order[j]] = [order[j], order[i]];
  order.forEach((el) => cupsBox.appendChild(el));
  const dxA = rA.left - elA.getBoundingClientRect().left;
  const dxB = rB.left - elB.getBoundingClientRect().left;
  for (const [el, dx] of [[elA, dxA], [elB, dxB]]) {
    el.style.transition = "none";
    el.style.transform = `translateX(${dx}px)`;
  }
  void cupsBox.offsetWidth;
  // Las tazas recorren el intercambio una a la vez, no las tres al mismo tiempo.
  elA.style.zIndex = "2";
  elA.style.transition = "transform 0.22s cubic-bezier(.22,.8,.24,1)";
  elA.style.transform = "";
  await wait(240);
  elB.style.zIndex = "3";
  elB.style.transition = "transform 0.22s cubic-bezier(.22,.8,.24,1)";
  elB.style.transform = "";
  await wait(240);
  [elA, elB].forEach((el) => { el.style.zIndex = ""; });
  [elA, elB].forEach((el) => { el.style.transition = ""; el.style.transform = ""; el.classList.remove("moving"); });
}

$("g-play").addEventListener("click", async () => {
  if (playing || bet > money) return;
  money = round2(money - bet);
  playing = true;
  cupsReset();
  $("screen-juego").classList.add("game-loading");
  $("g-loader").classList.remove("hidden");
  cups.forEach((c) => cupsBox.appendChild(c));
  ball = Math.floor(Math.random() * 3);
  cups.forEach((c) => c.classList.add("lift"));
  cups[ball].classList.add("has-cat");
  $("g-msg").textContent = txt("watch");
  await saveGame(); render();
  await wait(650);
  $("g-loader").classList.add("hidden");
  $("screen-juego").classList.remove("game-loading");
  await wait(1500);
  cups.forEach((c) => c.classList.remove("lift"));
  $("g-msg").textContent = txt("mixing");
  await wait(350);
  const swaps = Math.min(5 + streak, 12);
  const speed = Math.max(300 - streak * 10, 200);
  for (let i = 0; i < swaps; i++) {
    const a = Math.floor(Math.random() * 3);
    const b = (a + 1 + Math.floor(Math.random() * 2)) % 3;
    await flipSwap(a, b);
    await wait(Math.max(speed - 280, 60));
  }
  playing = false;
  $("g-msg").textContent = txt("pick");
  render();
});

cups.forEach((c) => c.addEventListener("click", async () => {
  if (playing || ball < 0) return;
  const pick = parseInt(c.getAttribute("data-cup"), 10);
  const scoreless = bet <= 0;
  cups.forEach((x) => x.classList.add("lift"));
  if (pick === ball) {
    c.classList.add("winner");
    money = round2(money + bet * 2);
    if (!scoreless) { won++; streak++; }
    $("g-msg").textContent = `${txt("win")}$${(bet * 2).toFixed(2)}`;
  } else {
    cups[ball].classList.add("winner");
    if (!scoreless) { lost++; streak = 0; }
    $("g-msg").textContent = txt("lose");
    cupsBox.classList.add("loss-cursor");
    setTimeout(() => cupsBox.classList.remove("loss-cursor"), 900);
  }
  ball = -1;
  await saveGame(); render();
}));

$("g-work").addEventListener("click", async () => {
  money = round2(money + 0.25);
  await saveGame(); render();
});

async function takeLoan(amount) {
  money = round2(money + amount);
  debt = round2(debt + amount);
  await saveGame(); render();
}
$("g-loan10").addEventListener("click", () => takeLoan(10));
$("g-loan50").addEventListener("click", () => takeLoan(50));
$("g-loan100").addEventListener("click", () => takeLoan(100));

$("g-repay").addEventListener("click", async () => {
  const pay = Math.min(debt, money);
  money = round2(money - pay);
  debt = round2(debt - pay);
  await saveGame(); render();
});

$("g-buy").addEventListener("click", async () => {
  if (playing || money < STATUE_COST) return;
  money = round2(money - STATUE_COST);
  statues++;
  $("g-msg").textContent = txt("victory");
  await saveGame(); render();
});

$("readme-btn").addEventListener("click", async () => {
  const pre = $("readme");
  if (pre.textContent === "...") {
    try {
      const res = await fetch(browser.runtime.getURL("assets/cursors/README.txt"));
      pre.textContent = await res.text();
    } catch (e) { pre.textContent = "README no disponible."; }
  }
  pre.classList.toggle("hidden");
});

render();
