// Marca Freezeezy Peak.
// GitHub: github.com/FreezeezyPeak-StudioDev | GitLab: gitlab.com/freezeezypeak.studiodev
// Correo: freezeezypeak.studiodev@gmail.com
// CatCursorF: tutorial con idioma desde _locales.
let lang = "es";
let T = {};

async function loadLocale(l) {
  try {
    const res = await fetch(browser.runtime.getURL(`_locales/${l}/messages.json`));
    T = await res.json();
  } catch (e) { T = {}; }
  render();
}

function render() {
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const k = el.getAttribute("data-i18n");
    if (T[k] && T[k].message) el.textContent = T[k].message.replace(/\$\$/g, "$");
  });
}

function showContent() {
  document.getElementById("langask").classList.add("hidden");
  document.getElementById("tutcontent").classList.remove("hidden");
}

async function choose(l) {
  lang = l;
  await browser.storage.local.set({ lang });
  showContent();
  loadLocale(lang);
}
document.getElementById("a-es").addEventListener("click", () => choose("es"));
document.getElementById("a-en").addEventListener("click", () => choose("en"));
async function markDefault() {
  let l = "es";
  try {
    const r = await browser.storage.local.get("lang");
    l = (r.lang === "en" || r.lang === "es") ? r.lang : (browser.i18n.getUILanguage().toLowerCase().startsWith("en") ? "en" : "es");
  } catch (e) {}
  document.getElementById(l === "en" ? "a-en" : "a-es").classList.add("is-on");
}
markDefault();

async function done() {
  await browser.storage.local.set({ tutorialDone: true });
  const tab = await browser.tabs.getCurrent();
  if (tab) browser.tabs.remove(tab.id);
  else window.close();
}
document.getElementById("t-ok").addEventListener("click", done);
document.getElementById("t-skip").addEventListener("click", done);
render();
