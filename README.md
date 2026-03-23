# En Paralelo Podcast 🎙️

Sitio web oficial de **En Paralelo Podcast** — conversaciones que van más allá.

## Descripción

En Paralelo es un podcast sobre espiritualidad, autoconocimiento y las preguntas que nadie se atreve a hacer. Nuevo episodio cada martes a las 6AM.

## Tecnologías

- HTML5, CSS3, JavaScript Vanilla
- Glassmorphism / CRT aesthetic
- Canvas API (fondo animado + visualizador de audio Siri-style)
- Optimización de imágenes con [sharp](https://sharp.pixelplumbing.com/)

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
├── vercel.json             ← Configuración Vercel
└── assets/
    ├── css/                ← Estilos
    ├── js/                 ← Scripts
    ├── images/             ← Imágenes optimizadas (WebP + fallback)
    └── audio/              ← Clip de audio
```

## Desarrollo local

```bash
# Servidor de desarrollo local
npx serve .
# o
python -m http.server 3000
```

## Optimizar imágenes

```bash
npm install
npm run optimize-images
```

## Despliegue

El proyecto está configurado para **Vercel** con `vercel.json`.

```bash
# Deploy directo
npx vercel --prod
```

O conecta el repositorio de GitHub en [vercel.com](https://vercel.com) para despliegue automático en cada push.

## Redes

- 🎧 YouTube: [@enparalelo](https://www.youtube.com/@enparalelo)
- 🎵 Spotify: En Paralelo Podcast
- 🍎 Apple Podcasts: En Paralelo

---

Creado con ❤️ y Flow por [Garavit.Studio](https://garavitstudio.com)
