// CatCursorF v1.0 - Freezeezy Peak.
// Licencia con idioma desde _locales. / License with locale from _locales.
// GitHub: github.com/FreezeezyPeak-StudioDev | GitLab: gitlab.com/freezeezypeak.studiodev | Contacto/Contact: freezeezypeak.studiodev@gmail.com
let lang = "es";

// Render seguro sin innerHTML: etiquetas p/b/a/img/h2/br con lista permitida. / Safe render without innerHTML: p/b/a/img/h2/br tags with allowlist.
// Fuente local: _locales/*.json empaquetado. / Local source: bundled _locales/*.json.
function setSafeHtml(el, html) {
  el.textContent = "";
  try {
    const doc = new DOMParser().parseFromString("<div>" + html + "</div>", "text/html");
    const src = doc.body.firstChild;
    if (!src) return;
    const allowed = { P: ["class"], B: [], A: ["href"], IMG: ["src", "alt", "class"], H2: [], BR: [] };
    const clean = (node, parent) => {
      for (const child of Array.from(node.childNodes)) {
        if (child.nodeType === 3) {
          parent.appendChild(document.createTextNode(child.textContent));
        } else if (child.nodeType === 1) {
          const tag = child.tagName.toUpperCase();
          if (!allowed[tag]) { clean(child, parent); continue; }
          const out = document.createElement(tag.toLowerCase());
          for (const attr of allowed[tag]) {
            const v = child.getAttribute(attr);
            if (!v) continue;
            if (/javascript:/i.test(v)) continue;
            if (attr === "href" && !/^(https:\/\/|mailto:)/.test(v)) continue;
            if (attr === "src" && !/^(\.\.\/assets\/|assets\/)/.test(v)) continue;
            out.setAttribute(attr, v);
          }
          if (tag === "A") { out.setAttribute("target", "_blank"); out.setAttribute("rel", "noopener"); }
          clean(child, out);
          parent.appendChild(out);
        }
      }
    };
    clean(src, el);
  } catch (e) {
    el.textContent = String(html).replace(/<[^>]+>/g, "");
  }
}

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
      if (T[k] && T[k].message) setSafeHtml(el, get(k));
    });
  } catch (e) {}
}

browser.storage.local.get("lang").then((r) => {
  if (r.lang === "en" || r.lang === "es") lang = r.lang;
  loadLocale(lang);
}).catch(() => loadLocale(lang));
