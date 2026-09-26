// CatCursorF v1.0 - Freezeezy Peak.
// Fondo: aplica/retira CSS de cursores y define valores iniciales. / Background: applies/removes cursor CSS and sets initial values.
// GitHub: github.com/FreezeezyPeak-StudioDev | GitLab: gitlab.com/freezeezypeak.studiodev | Contacto/Contact: freezeezypeak.studiodev@gmail.com
const cursoresAplicados = new Map();

browser.runtime.onMessage.addListener(async (mensaje, origen) => {
  if (!origen.tab || !mensaje || !mensaje.type) return;
  const marco = typeof origen.frameId === "number" ? origen.frameId : 0;
  const clave = `${origen.tab.id}:${marco}`;
  const anterior = cursoresAplicados.get(clave);
  if (anterior) {
    try { await browser.scripting.removeCSS({ target: { tabId: origen.tab.id, frameIds: [marco] }, css: anterior }); } catch (e) {}
    cursoresAplicados.delete(clave);
  }
  if (mensaje.type === "cursor-aplicar" && typeof mensaje.css === "string") {
    // Mejor esfuerzo: el content script ya inyecto por DOM si falta permiso de host. / Best effort: content script already injected via DOM if host permission is missing.
    try {
      await browser.scripting.insertCSS({ target: { tabId: origen.tab.id, frameIds: [marco] }, css: mensaje.css });
      cursoresAplicados.set(clave, mensaje.css);
    } catch (e) {}
  }
});

browser.tabs.onRemoved.addListener((tabId) => {
  for (const clave of cursoresAplicados.keys()) {
    if (clave.startsWith(`${tabId}:`)) cursoresAplicados.delete(clave);
  }
});

// Servir cursores a otras extensiones (p. ej. DarkSnowF). / Serve cursors to other extensions.
const CURSOR_ARCHIVOS = {
  normal: "assets/cursors/Cat - Normal Select.cur",
  link: "assets/cursors/Cat - Link Select B.cur",
  texto: "assets/cursors/Cat - Text Select.cur",
  ayuda: "assets/cursors/Cat - Help Select.cur",
  pluma: "assets/cursors/Cat - Pen.cur",
  precision: "assets/cursors/Cat - Precision Select.cur",
  no: "assets/cursors/Cat - Unavailable.cur",
  vertical: "assets/cursors/Cat - Vertical Resize.cur",
};

if (browser.runtime.onMessageExternal) {
  browser.runtime.onMessageExternal.addListener(async (mensaje, origen) => {
    if (!mensaje || (mensaje.type !== "get-cat-cursors" && mensaje.type !== "darksnowf-get-cursors")) return;
    const cursores = {};
    for (const [clave, ruta] of Object.entries(CURSOR_ARCHIVOS)) {
      try {
        cursores[clave] = browser.runtime.getURL(ruta);
      } catch (e) {}
    }
    return { cursores };
  });
}

// Valores iniciales y tutorial de bienvenida al instalar. / Initial values and welcome tutorial on install.
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

// Icono de la barra segun el tema. / Toolbar icon by theme.
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
    await browser.action.setIcon({ path: THEME_ICONS[theme] || THEME_ICONS.calc });
  } catch (e) {}
}
browser.storage.onChanged.addListener((changes) => {
  if (changes.theme) applyToolbarIcon();
});
applyToolbarIcon();
