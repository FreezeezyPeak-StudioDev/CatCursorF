// Marca Freezeezy Peak.
// GitHub: github.com/FreezeezyPeak-StudioDev | GitLab: gitlab.com/freezeezypeak.studiodev
// Correo: freezeezypeak.studiodev@gmail.com
const cursoresAplicados = new Map();

browser.runtime.onMessage.addListener(async (mensaje, origen) => {
  if (!origen.tab || !mensaje || !mensaje.type) return;
  const marco = typeof origen.frameId === "number" ? origen.frameId : 0;
  const clave = `${origen.tab.id}:${marco}`;
  const anterior = cursoresAplicados.get(clave);
  if (anterior) {
    try { await browser.tabs.removeCSS(origen.tab.id, { code: anterior, frameId: marco }); } catch (e) {}
    cursoresAplicados.delete(clave);
  }
  if (mensaje.type === "cursor-aplicar" && typeof mensaje.css === "string") {
    // Mejor esfuerzo: si falta permiso de host en la pestaña, el content script ya inyectó por DOM.
    try {
      await browser.tabs.insertCSS(origen.tab.id, { code: mensaje.css, frameId: marco });
      cursoresAplicados.set(clave, mensaje.css);
    } catch (e) {}
  }
});

browser.tabs.onRemoved.addListener((tabId) => {
  for (const clave of cursoresAplicados.keys()) {
    if (clave.startsWith(`${tabId}:`)) cursoresAplicados.delete(clave);
  }
});

// CatCursorF: valores iniciales + tutorial de bienvenida al instalar.
browser.runtime.onInstalled.addListener(async (details) => {
  if (details.reason !== "install") return;
  const cur = await browser.storage.local.get([
    "master", "enabled", "sounds", "lang", "theme", "festive", "stars", "autoTheme",
    "money", "bet", "debt", "statues", "won", "lost", "streak", "tutorialDone",
  ]);
  let lang = cur.lang;
  if (lang !== "en" && lang !== "es") {
    try {
      lang = browser.i18n.getUILanguage().toLowerCase().startsWith("en") ? "en" : "es";
    } catch (e) { lang = "es"; }
  }
  await browser.storage.local.set({
    master: cur.master !== false,
    enabled: cur.enabled !== false,
    sounds: cur.sounds !== false,
    lang,
    theme: cur.theme || "calc",
    festive: cur.festive || "auto",
    stars: cur.stars !== false,
    autoTheme: cur.autoTheme !== false,
    money: typeof cur.money === "number" ? cur.money : 25,
    bet: cur.bet || 0,
    debt: cur.debt || 0,
    statues: cur.statues || 0,
    won: cur.won || 0,
    lost: cur.lost || 0,
    streak: cur.streak || 0,
    tutorialDone: cur.tutorialDone || false,
  });
  browser.tabs.create({ url: browser.runtime.getURL("tutorial/tutorial.html") });
});

// Icono de la barra segun el tema elegido.
const THEME_ICONS = {
  calc: "assets/icons/iconNormal.svg",
  win: "assets/icons/iconWin.svg",
  mc: "assets/icons/iconMc.svg",
  gd: "assets/icons/iconGd.svg",
  nav: "assets/icons/iconNav.svg",
  ny: "assets/icons/iconNy.svg",
};
async function applyToolbarIcon() {
  try {
    const { theme } = await browser.storage.local.get("theme");
    await browser.browserAction.setIcon({ path: THEME_ICONS[theme] || THEME_ICONS.calc });
  } catch (e) {}
}
browser.storage.onChanged.addListener((changes) => {
  if (changes.theme) applyToolbarIcon();
});
applyToolbarIcon();
