// Marca Freezeezy Peak.
// GitHub: github.com/FreezeezyPeak-StudioDev | GitLab: gitlab.com/freezeezypeak.studiodev
// Correo: freezeezypeak.studiodev@gmail.com
// CatCursorF: licencia con idioma desde _locales.
let lang = "es";

async function loadLocale(l) {
  try {
    const res = await fetch(browser.runtime.getURL(`_locales/${l}/messages.json`));
    const T = await res.json();
    const get = (k) => (T[k] && T[k].message ? T[k].message.replace(/\$\$/g, "$") : k);
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const k = el.getAttribute("data-i18n");
      if (T[k] && T[k].message) el.textContent = get(k);
    });
    document.querySelectorAll("[data-i18n-html]").forEach((el) => {
      const k = el.getAttribute("data-i18n-html");
      // Fuente confiable local: _locales/*.json empaquetado, sin datos remotos ni de usuario.
      if (T[k] && T[k].message) el.innerHTML = get(k);
    });
  } catch (e) {}
}

browser.storage.local.get("lang").then((r) => {
  if (r.lang === "en" || r.lang === "es") lang = r.lang;
  loadLocale(lang);
}).catch(() => loadLocale(lang));
