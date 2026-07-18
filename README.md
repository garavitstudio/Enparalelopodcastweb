# En Paralelo Podcast 🎙️

Sitio web oficial de **EN PARALELO** — el podcast donde las conversaciones van más allá.

**Producción:** https://enparalelopodcastweb.vercel.app/

## Descripción

En Paralelo es un podcast en español sobre propósito, espiritualidad, autoconocimiento y las preguntas que nadie se atreve a hacer, presentado por Enara Jiménez y José Luis (Selu). Nuevo episodio cada martes a las 6:00.

## Tecnologías

- HTML5, CSS3, JavaScript vanilla (sin frameworks)
- Estética glassmorphism / CRT con Canvas API (fondo animado + visualizador de audio)
- Fuentes autoalojadas (Outfit, Inter, Space Grotesk — sin peticiones a Google Fonts)
- Formularios vía [Formspree](https://formspree.io)
- Despliegue en [Vercel](https://vercel.com) con `cleanUrls` (las URLs públicas no llevan `.html`)

## Estructura del proyecto

```
en-paralelo/
├── index.html              ← Página principal
├── nosotros.html           ← Nosotros
├── invitados.html          ← Ser un invitado
├── comunidad.html          ← Comunidad
├── patrocinadores.html     ← Patrocinadores
├── privacidad.html         ← Política de privacidad
├── aviso-legal.html        ← Aviso legal
├── cookies.html            ← Política de cookies
├── form_COMHIS.html        ← Landing captación COMHIS (noindex)
├── gracias_COMHIS.html     ← Página de gracias COMHIS (noindex)
├── robots.txt              ← Directivas para rastreadores
├── sitemap.xml             ← Mapa del sitio
├── llms.txt                ← Resumen del sitio para buscadores de IA
├── vercel.json             ← Cabeceras de seguridad, caché y cleanUrls
└── assets/
    ├── css/                ← Estilos (fonts.css = fuentes autoalojadas)
    ├── js/                 ← Scripts
    ├── fonts/              ← Fuentes variables .woff2
    ├── images/             ← Imágenes optimizadas (WebP + fallback)
    ├── audio/              ← Clip de audio
    └── videos/glitch/      ← Vídeos del fondo (los originales van en _raw/, fuera de git)
```

## Desarrollo local

```bash
npx serve .
```

`serve` resuelve las URLs limpias (`/nosotros` → `nosotros.html`) igual que Vercel. No uses `python -m http.server` porque no las soporta.

## Scripts de mantenimiento

```bash
npm install                  # una sola vez
npm run optimize-images      # comprime imágenes (usa sharp)
npm run optimize-videos      # comprime los vídeos de _raw/ (usa ffmpeg)
node cache-bust-assets.cjs   # regenera el ?v= de CSS/JS tras cambiarlos
```

## Despliegue

Conectado a Vercel: cada push a `main` en GitHub despliega automáticamente.

```bash
npx vercel --prod   # deploy manual alternativo
```

## SEO / AEO

- Metaetiquetas canónicas, Open Graph y Twitter Card en todas las páginas.
- Datos estructurados JSON-LD (`PodcastSeries`, `PodcastEpisode`, `AboutPage`, `BreadcrumbList`).
- `sitemap.xml`, `robots.txt` (abierto a rastreadores de IA) y `llms.txt`.
- Al conectar el dominio definitivo, buscar y reemplazar `enparalelopodcastweb.vercel.app` por el nuevo dominio en todos los archivos.

## Escucha el podcast

- 🎧 YouTube: [@enparalelopodcast](https://www.youtube.com/@enparalelopodcast)
- 🎵 Spotify: [EN PARALELO](https://open.spotify.com/show/2THwTIRw39gN3p7ME2pCTD)
- 🍎 Apple Podcasts: [EN PARALELO](https://podcasts.apple.com/es/podcast/en-paralelo/id1843074269)
- 📸 Instagram: [@enparalelopodcast](https://www.instagram.com/enparalelopodcast/)

---

Creado con ❤️ y Flow por [Garavit.Studio](https://garavitstudio.com)
