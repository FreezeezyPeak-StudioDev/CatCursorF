
<!-- LOGO CENTRADO -->
<div align="center">

<img src="https://raw.githubusercontent.com/FreezeezyPeak/Info-Freezeezy-PeaK/main/logo_freezeezy.png" width="220">

# FreezeezyPeak

</div>

---

<div align="center">

![CatCursorF](https://img.shields.io/badge/CatCursorF-v1.1.1-blue?style=for-the-badge&logo=firefox)

## CatCursorF

**Extensión Firefox con Cursores de Gato Personalizables**

![Status](https://img.shields.io/badge/Status-Active-brightgreen)
![License](https://img.shields.io/badge/License-GPL%20v3-blue)
![Firefox](https://img.shields.io/badge/Firefox-Compatible-orange)

</div>

---

**[🇪🇸 Español](#español)** | **[🇬🇧 English](#english)**

---

## Español

### CatCursorF — Extensión Firefox con Cursores de Gato

Reemplaza todos tus cursores con adorables diseños de gatos. 8 cursores contextuales, 6 temas visuales, sonidos interactivos, juego Shell con economía integrada y más. Bilingüe (ES/EN) y código abierto.

100% local • Sin cuentas • Código abierto (GPL-3.0)

### Novedades v1.1.1

- **Gato orbital** — La celebración de inicio/cierre de sesión y suscripción ya no oculta el cursor: el gato gira suavemente alrededor del puntero, siempre por delante del contenido y sin bloquear la interfaz.
- **Nueva celebración de cierre de sesión** (además de inicio de sesión).
- La victoria del minijuego del panel tampoco oculta ya el cursor.

### Características

- **8 Cursores Contextuales** — Normal, enlace, texto, ayuda, lápiz, precisión, no disponible, redimensionamiento vertical
- **6 Temas Visuales** — Calculadora, Clásico, Minecraft, GeoDash, Navidad, Año Nuevo
- **Sonidos Interactivos** — Clics y maullidos aleatorios durante la navegación
- **Juego Shell** — Apuesta dinero, mezcla tazas, gana premios
- **Bilingüe** — Interfaz en español e inglés
- **Efectos Festivos** — Nieve animada y efectos especiales en fechas
- **Estela de Patitas** — Rastro 🐾, destellos al teclear, confeti en Like/suscripción/inicio-cierre de sesión y gato orbital que celebra sin ocultar el cursor
- **Auto-ocultado en Video** — El cursor se esconde solo en YouTube/Twitch tras 2,5 s quieto
- **100% Local** — Sin nube, sin rastreo, todo en tu navegador

### Estructura del Proyecto

```text
CatCursorF/
├── manifest.json                  ← Configuración
├── content.js                     ← Cursores, sonidos y efectos en webs
├── background.js                  ← Fondo y valores iniciales
├── build.py                       ← Empaqueta el .xpi
├── popup/                         ← Menú interactivo
├── tutorial/                      ← Página de bienvenida
│
├── _locales/
│   ├── es/                        ← Traducciones español
│   └── en/                        ← Traducciones inglés
│
├── assets/
│   ├── cursors/                   ← 9 archivos .cur (8 en uso)
│   ├── fx/                        ← Archivos de audio
│   ├── icons/                     ← Iconos por tema
│   └── texturas/                  ← Elementos gráficos
│
├── chrome/                        ← Estilos de Firefox
├── creditos/                      ← Página de créditos
├── licencia/                      ← Información de licencia (GPL v3)
└── versiones/                     ← Historial de versiones
```



### Cómo Usar

**Menú Principal:**
1. Click en el icono de gato en la barra de herramientas
2. Pantalla LCD muestra el estado actual
3. Botones: AJUSTES, IDIOMA, REDES, MÁS, JUEGO, LICENCIA

**Cambiar Cursor:**
- Click en AJUSTES
- Activar/desactivar cursores
- Selecciona entre 6 temas visuales

**Jugar Shell:**
- Click en JUEGO
- Apuesta dinero
- Mezcla las tazas
- ¡Gana premios!

### Temas Disponibles

| Tema | Descripción |
|------|------------|
| **Calculadora** | Retro con colores corporativos |
| **Clásico** | Minimalista y neutral |
| **Minecraft** | Bloques y estética pixelada |
| **GeoDash** | Neón brillante con animaciones |
| **Navidad** | Rojo, verde y dorado festivo |
| **Año Nuevo** | Plateado y dorado celebrativo |

### Efectos de Audio

- **Clic** — Se escucha en cada click (Pixabay)
- **Maullido** — Aleatorio durante la navegación (~8% probabilidad)
- **Festividades** — Nieve animada y efectos especiales

### Licencia

**GNU General Public License v3.0** — Código abierto y libre

**Créditos:**
- Cursores: C.T. Matthews
- Sonido clic: Pixabay
- Maullido: FreezeezyPeak
- Desarrollo: FreezeezyPeak

### Contribuir

- **Issues:** https://github.com/FreezeezyPeak-StudioDev/CatCursorF/issues
- **Discusiones:** https://github.com/FreezeezyPeak-StudioDev/CatCursorF/discussions

---

## English

### CatCursorF — Firefox Extension with Cat Cursors

Replace all your cursors with adorable cat designs. 8 contextual cursors, 6 visual themes, interactive sounds, integrated Shell game with economy and more. Bilingual (ES/EN) and open source.

100% local • No accounts • Open source (GPL-3.0)

### What's new in v1.1.1

- **Orbiting cat** — Sign-in/sign-out and subscribe celebrations no longer hide the cursor: the cat smoothly orbits the pointer, always on top of page content and never blocking the UI.
- **New sign-out celebration** (in addition to sign-in).
- The panel mini-game victory no longer hides the cursor either.

### Features

- **8 Contextual Cursors** — Normal, link, text, help, pen, precision, unavailable, vertical resize
- **6 Visual Themes** — Calculator, Classic, Minecraft, GeoDash, Christmas, New Year
- **Interactive Sounds** — Clicks and random meows during browsing
- **Shell Game** — Bet money, shuffle cups, win prizes
- **Bilingual** — Interface in Spanish and English
- **Holiday Effects** — Animated snow and special effects on dates
- **Paw Trail** — 🐾 trail, typing sparkles, confetti on Like/subscribe/sign-in-sign-out and an orbiting cat that celebrates without hiding the cursor
- **Video Auto-hide** — Cursor hides itself on YouTube/Twitch after 2.5 s idle
- **100% Local** — No cloud, no tracking, everything in your browser

### Project Structure

```text
CatCursorF/
├── manifest.json                  ← Configuration
├── content.js                     ← Cursors, sounds and effects on websites
├── background.js                  ← Background and initial values
├── build.py                       ← Packages the .xpi
├── popup/                         ← Interactive menu
├── tutorial/                      ← Welcome page
│
├── _locales/
│   ├── es/                        ← Spanish translations
│   └── en/                        ← English translations
│
├── assets/
│   ├── cursors/                   ← 9 .cur files (8 in use)
│   ├── fx/                        ← Audio files
│   ├── icons/                     ← Icons by theme
│   └── texturas/                  ← Graphic elements
│
├── chrome/                        ← Firefox styles
├── creditos/                      ← Credits page
├── licencia/                      ← License information (GPL v3)
└── versiones/                     ← Version history
```

### How to Use

**Main Menu:**
1. Click the cat icon in Firefox toolbar
2. LCD screen shows current status
3. Buttons: SETTINGS, LANGUAGE, NETWORKS, MORE, GAME, LICENSE

**Change Cursor:**
- Click SETTINGS
- Enable/disable cursors
- Select from 6 visual themes

**Play Shell:**
- Click GAME
- Bet money
- Shuffle the cups
- Win prizes!

### Available Themes

| Theme | Description |
|------|------------|
| **Calculator** | Retro with corporate colors |
| **Classic** | Minimalist and neutral |
| **Minecraft** | Blocks and pixelated aesthetic |
| **GeoDash** | Bright neon with animations |
| **Christmas** | Red, green and gold festive |
| **New Year** | Silver and gold celebratory |

### Audio Effects

- **Click** — Heard on every mouse click (Pixabay)
- **Meow** — Random during browsing (~8% probability)
- **Holidays** — Animated snow and special effects

### License

**GNU General Public License v3.0** — Open source and free to modify

**Credits:**
- Cursors: C.T. Matthews
- Click sound: Pixabay
- Meow sound: FreezeezyPeak
- Development: FreezeezyPeak

### Contribute

- **Issues:** https://github.com/FreezeezyPeak-StudioDev/CatCursorF/issues
- **Discussions:** https://github.com/FreezeezyPeak-StudioDev/CatCursorF/discussions

---

<p align="center">
<strong>Made by Freezeezy Peak</strong><br>
<a href="https://www.youtube.com/@FreezeezyPeak">YouTube</a> |
<a href="https://addons.mozilla.org/es-ES/firefox/user/20170408/">Firefox Profile</a> |
<a href="https://github.com/FreezeezyPeak-StudioDev">GitHub</a>
</p>
