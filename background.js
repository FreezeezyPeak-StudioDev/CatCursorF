// CatCursorF v1.1.0 - FreezeezyPeak.
// Fondo: aplica/retira CSS de cursores, conserva valores por defecto y comparte cursores. / Background: applies/removes cursor CSS, backfills defaults and shares cursors.
// GitHub: github.com/FreezeezyPeak-StudioDev | GitLab: gitlab.com/freezeezypeak.studiodev | Contacto/Contact: freezeezypeak.studiodev@gmail.com
const cursoresAplicados = new Map();

browser.runtime.onMessage.addListener(async (mensaje, origen) => {
  if (!origen.tab || !mensaje || !mensaje.type) return;
  // Solo estos tipos tocan el CSS; otros mensajes (diagnostico, etc.) no deben borrarlo.
  if (mensaje.type !== "cursor-aplicar" && mensaje.type !== "cursor-retirar") return;
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

// Valores por defecto sin borrar datos: solo rellena claves que falten.
// Funciona en instalacion y en actualizaciones. / Backfill defaults without wiping user data.
const DEFAULTS = {
  master: true, enabled: true, sounds: true,
  theme: "calc", festive: "auto", stars: true, autoTheme: true, trail: true,
  volGeneral: 50, volClick: 25, volMeow: 25,
  money: 25, bet: 0, debt: 0, statues: 0, won: 0, lost: 0, streak: 0,
  tutorialDone: false,
};
async function ensureDefaults() {
  try {
    const cur = await browser.storage.local.get(Object.keys(DEFAULTS).concat(["lang"]));
    const fill = {};
    for (const [k, v] of Object.entries(DEFAULTS)) {
      if (cur[k] === undefined) fill[k] = v;
    }
    if (cur.lang !== "en" && cur.lang !== "es") {
      try {
        fill.lang = browser.i18n.getUILanguage().toLowerCase().startsWith("en") ? "en" : "es";
      } catch (e) { fill.lang = "es"; }
    }
    if (Object.keys(fill).length) await browser.storage.local.set(fill);
  } catch (e) {}
}
browser.runtime.onInstalled.addListener(async (details) => {
  await ensureDefaults();
  if (details.reason !== "install") return;
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
