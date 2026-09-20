"""CatCursorF v1.0 - Freezeezy Peak.
GitHub: github.com/FreezeezyPeak-StudioDev | GitLab: gitlab.com/freezeezypeak.studiodev | Contacto/Contact: freezeezypeak.studiodev@gmail.com

Empaqueta CatCursorF en .xpi (rutas con / para Firefox). / Packages CatCursorF as .xpi (paths with / for Firefox).
"""
import zipfile
from pathlib import Path

root = Path(__file__).parent
files = ["manifest.json", "content.js", "background.js", "README Freezeezy Peak.txt", "Marca Freezeezy Peak.txt"]
for folder in ["popup", "tutorial", "creditos", "licencia"]:
    files += sorted(str(p.relative_to(root)) for p in (root / folder).glob("*") if p.is_file())
files += sorted(str(p.relative_to(root)) for p in (root / "_locales").rglob("*.json"))
files += sorted(
    str(p.relative_to(root)).replace("\\", "/")
    for p in (root / "assets").rglob("*") if p.is_file() and "cursors old" not in p.parts
)

out = root / "versiones" / "catcursorf-1.0.xpi"
out.parent.mkdir(exist_ok=True)
if out.exists():
    out.unlink()
with zipfile.ZipFile(out, "w", zipfile.ZIP_DEFLATED) as z:
    for f in files:
        z.write(root / f, f.replace("\\", "/"))
print("OK:", out, out.stat().st_size, "bytes")
with zipfile.ZipFile(out) as z:
    for n in z.namelist():
        print(" -", n)
