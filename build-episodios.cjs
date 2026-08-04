// Genera una página propia para cada episodio, el índice y el sitemap.
//
// Publicar un episodio nuevo son tres pasos:
//   1. Añadir su ficha a contenido/episodios.json (basta con el id de YouTube
//      y los textos: la fecha y la duración se buscan solas).
//   2. npm run episodios
//   3. npm run cache-bust
//
// Sin página propia, todo el tráfico de búsqueda por el nombre del invitado
// o por el tema del episodio se lo queda YouTube en vez del dominio.
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const DIR = __dirname;
const DOM = 'https://enparalelopodcast.com';
const V = '__V__'; // lo sustituye cache-bust-assets.cjs

const DATOS = path.join(DIR, 'contenido', 'episodios.json');
const episodios = JSON.parse(fs.readFileSync(DATOS, 'utf8'));
const pie = fs.readFileSync(path.join(DIR, 'contenido', '_pie.html'), 'utf8');

const PLATAFORMAS = [
  ['YouTube', null], // se completa con el id del episodio
  ['Spotify', 'https://open.spotify.com/show/2THwTIRw39gN3p7ME2pCTD'],
  ['Apple Podcasts', 'https://podcasts.apple.com/es/podcast/en-paralelo/id1843074269'],
  ['Amazon Music', 'https://music.amazon.es/podcasts/e204a4dd-5340-4ffb-8874-b998074ac091/en-paralelo'],
];

const esc = t => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// ---------- METADATOS QUE FALTEN ----------
// Si una ficha nueva no trae fecha o duración, se buscan en YouTube una vez
// y se guardan, para no depender de la red en cada compilación.
let hayQueGuardar = false;
for (const ep of episodios) {
  if (ep.fecha && ep.duracionSeg) continue;
  process.stdout.write(`  buscando metadatos de ${ep.id}… `);
  try {
    const html = execSync(
      `curl -sL -A "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0 Safari/537.36" "https://www.youtube.com/watch?v=${ep.id}"`,
      { maxBuffer: 40 * 1024 * 1024, encoding: 'utf8' }
    );
    const dur = html.match(/"lengthSeconds":"(\d+)"/);
    const fec = html.match(/"uploadDate":"([^"]+)"/) || html.match(/"publishDate":"([^"]+)"/);
    if (dur) ep.duracionSeg = parseInt(dur[1], 10);
    if (fec) ep.fecha = fec[1].slice(0, 10);
    hayQueGuardar = true;
    console.log(`${ep.fecha} · ${Math.round(ep.duracionSeg / 60)} min`);
  } catch (e) {
    console.log('no se pudo, rellénalos a mano en el JSON');
  }
}
if (hayQueGuardar) fs.writeFileSync(DATOS, JSON.stringify(episodios, null, 2) + '\n');

// ---------- AYUDAS ----------
function duracionISO(s) { return 'PT' + Math.floor(s / 3600) + 'H' + Math.floor((s % 3600) / 60) + 'M'; }
function duracionTexto(s) { return Math.floor(s / 3600) + 'h ' + Math.floor((s % 3600) / 60) + 'min'; }

function fechaLarga(iso) {
  const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio',
    'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  const d = new Date(iso);
  return `${d.getUTCDate()} de ${meses[d.getUTCMonth()]} de ${d.getUTCFullYear()}`;
}

function cabecera({ titulo, desc, url, imagen, jsonld, activo }) {
  const nav = [
    ['/', 'Inicio'], ['/nosotros', 'Nosotros'], ['/episodios', 'Episodios'],
    ['/comunidad', 'Comunidad'], ['/invitados', 'Invitados'], ['/patrocinadores', 'Marcas'],
  ].map(([h, t]) => `      <a href="${h}"${h === activo ? ' class="active"' : ''}>${t}</a>`).join('\n');

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${esc(titulo)}</title>
  <meta name="description" content="${esc(desc)}" />
  <meta name="author" content="En Paralelo Podcast" />
  <meta name="theme-color" content="#080808" />
  <meta name="google-site-verification" content="Y-yf8BwAHSARxnP3PtK5AOyoX5-Uar_PU6i9t7VG3Pw" />
  <link rel="canonical" href="${url}" />

  <link rel="icon" href="/assets/images/logo.svg?v=${V}" type="image/svg+xml" />

  <meta property="og:type" content="article" />
  <meta property="og:url" content="${url}" />
  <meta property="og:title" content="${esc(titulo)}" />
  <meta property="og:description" content="${esc(desc)}" />
  <meta property="og:image" content="${imagen}" />
  <meta property="og:locale" content="es_ES" />
  <meta property="og:site_name" content="En Paralelo Podcast" />

  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${esc(titulo)}" />
  <meta name="twitter:description" content="${esc(desc)}" />
  <meta name="twitter:image" content="${imagen}" />

  <link rel="preload" href="/assets/css/global.css?v=${V}" as="style" />
  <link rel="stylesheet" href="/assets/css/fonts.css?v=${V}" />
  <link rel="stylesheet" href="/assets/css/global.css?v=${V}" />
  <link rel="stylesheet" href="/assets/css/background.css?v=${V}" />
  <link rel="stylesheet" href="/assets/css/header.css?v=${V}" />
  <link rel="stylesheet" href="/assets/css/footer.css?v=${V}" />
  <link rel="stylesheet" href="/assets/css/subpage.css?v=${V}" />
  <link rel="stylesheet" href="/assets/css/panda.css?v=${V}" />
  <link rel="stylesheet" href="/assets/css/app.css?v=${V}" />

  <script type="application/ld+json">
${jsonld}
  </script>
</head>
<body>
  <canvas id="bg-canvas" aria-hidden="true"></canvas>
  <div class="scan-lines" aria-hidden="true"></div>
  <div class="glitch-overlay" aria-hidden="true">
    <div class="glitch-line"></div><div class="glitch-line"></div>
    <div class="glitch-line"></div><div class="glitch-line"></div><div class="glitch-line"></div>
    <div class="glitch-burst"></div><div class="glitch-burst"></div>
  </div>

  <header id="site-header">
    <a href="/" class="neon-logo">
      <img src="/assets/images/logo.svg?v=${V}" alt="En Paralelo Podcast" class="logo-img" />
    </a>
    <button class="hamburger" aria-label="Menú" aria-expanded="false"><span></span><span></span><span></span></button>
    <nav class="site-nav">
${nav}
    </nav>
  </header>
`;
}

const scripts = `  <script src="/assets/js/background.js?v=${V}"></script>
  <script src="/assets/js/utils.js?v=${V}"></script>
  <script src="/assets/js/app.js?v=${V}"></script>
  <script src="/assets/js/episodio.js?v=${V}"></script>
  <script src="/assets/js/panda.js?v=${V}"></script>
</body>
</html>
`;

// ---------- TRANSCRIPCIÓN ----------
// Es el mayor multiplicador del SEO de un podcast: convierte un episodio en
// miles de palabras indexables. Se admite texto plano con párrafos separados
// por línea en blanco, o una lista de {t, texto} con marcas de tiempo.
function bloqueTranscripcion(ep) {
  if (!ep.transcripcion) return '';

  let parrafos;
  if (Array.isArray(ep.transcripcion)) {
    parrafos = ep.transcripcion.map(p =>
      `            <p><span class="tr-t">${esc(p.t || '')}</span>${esc(p.texto)}</p>`
    ).join('\n');
  } else {
    parrafos = String(ep.transcripcion).split(/\n\s*\n/)
      .filter(p => p.trim())
      .map(p => `            <p>${esc(p.trim())}</p>`)
      .join('\n');
  }

  return `
        <div class="glass-panel content-panel reveal" data-delay="180" style="margin-top:24px;">
          <span class="neon-label">Transcripción</span>
          <h2 style="margin:12px 0 20px;">La conversación,<br />palabra por palabra.</h2>
          <p class="tr-nota">Transcripción del episodio completo. Puedes buscar dentro con Ctrl+F.</p>
          <div class="ep-transcripcion">
${parrafos}
          </div>
        </div>
`;
}

// ---------- PÁGINA DE EPISODIO ----------
function paginaEpisodio(ep, i) {
  const url = `${DOM}/episodios/${ep.slug}`;
  const imagen = `https://img.youtube.com/vi/${ep.id}/maxresdefault.jpg`;
  const anterior = episodios[i - 1];
  const siguiente = episodios[i + 1];

  const episodioLd = {
    '@type': 'PodcastEpisode',
    '@id': url + '#episodio',
    url,
    name: ep.titulo,
    description: ep.resumen,
    datePublished: ep.fecha,
    timeRequired: duracionISO(ep.duracionSeg),
    inLanguage: 'es',
    partOfSeries: { '@type': 'PodcastSeries', '@id': DOM + '/#podcast', name: 'EN PARALELO', url: DOM + '/' },
    associatedMedia: {
      '@type': 'MediaObject',
      contentUrl: `https://www.youtube.com/watch?v=${ep.id}`,
      embedUrl: `https://www.youtube-nocookie.com/embed/${ep.id}`,
    },
    thumbnailUrl: imagen,
    actor: { '@type': 'Person', name: ep.invitado, description: ep.rolInvitado },
    author: [
      { '@type': 'Person', name: 'Enara Jiménez' },
      { '@type': 'Person', name: 'José Luis Garavito', alternateName: 'Selu' },
    ],
    publisher: { '@type': 'Organization', name: 'En Paralelo Podcast', url: DOM + '/' },
    keywords: ep.keywords.join(', '),
  };
  // Solo se declara si existe de verdad: anunciar algo que no está es peor
  // que no anunciarlo.
  if (ep.transcripcion) episodioLd.transcript = url + '#transcripcion';

  const jsonld = JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': [
      episodioLd,
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Inicio', item: DOM + '/' },
          { '@type': 'ListItem', position: 2, name: 'Episodios', item: DOM + '/episodios' },
          { '@type': 'ListItem', position: 3, name: ep.invitado, item: url },
        ],
      },
    ],
  }, null, 2).split('\n').map(l => '  ' + l).join('\n');

  const temas = ep.temas.map(t => `
            <div class="col-card glass-panel">
              <h3>${esc(t.t)}</h3>
              <p>${esc(t.d)}</p>
            </div>`).join('');

  const plataformas = PLATAFORMAS.map(([n, u]) =>
    `<a href="${u || 'https://www.youtube.com/watch?v=' + ep.id}" target="_blank" rel="noopener" class="ep-plat">${n}</a>`
  ).join('\n              ');

  return cabecera({
    titulo: ep.tituloSeo + ' — En Paralelo Podcast',
    desc: ep.resumen.slice(0, 158),
    url, imagen, jsonld, activo: '/episodios',
  }) + `
  <div id="app">
    <section class="subpage-hero">
      <div class="section-wrapper">
        <nav class="ep-breadcrumb" aria-label="Ruta">
          <a href="/">Inicio</a> <span aria-hidden="true">›</span>
          <a href="/episodios">Episodios</a> <span aria-hidden="true">›</span>
          <span>${esc(ep.invitado)}</span>
        </nav>
        <div class="subpage-hero-inner reveal">
          <span class="neon-label">Episodio con ${esc(ep.invitado)}</span>
          <h1>${esc(ep.titulo)}</h1>
          <p class="ep-datos">
            <time datetime="${ep.fecha}">${fechaLarga(ep.fecha)}</time>
            <span aria-hidden="true">·</span> ${duracionTexto(ep.duracionSeg)}
            <span aria-hidden="true">·</span> ${esc(ep.rolInvitado)}
          </p>
        </div>
      </div>
    </section>

    <section class="subpage-content">
      <div class="section-wrapper">

        <div class="glass-panel content-panel reveal">
          <div class="ep-media" role="button" tabindex="0" data-yt="${ep.id}" aria-label="Reproducir el episodio con ${esc(ep.invitado)}">
            <img src="${imagen}" alt="Episodio de En Paralelo con ${esc(ep.invitado)}" width="1280" height="720" />
            <span class="ep-play" aria-hidden="true"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5.2v13.6L19 12z"/></svg></span>
          </div>

          <p class="ep-resumen">${esc(ep.resumen)}</p>

          <div class="ep-plataformas">
            <span class="ep-plat-label">Escúchalo en</span>
            <div class="ep-plat-row">
              ${plataformas}
            </div>
          </div>
        </div>

        <div class="glass-panel content-panel reveal" data-delay="100" style="margin-top:24px;">
          <span class="neon-label">De qué hablamos</span>
          <h2 style="margin:12px 0 24px;">Lo que te vas a<br />encontrar dentro.</h2>
          <div class="three-cols three-cols--four">${temas}
          </div>
        </div>

        <div class="glass-panel content-panel reveal" data-delay="150" style="margin-top:24px;">
          <span class="neon-label">Quién es ${esc(ep.invitado)}</span>
          <h2 style="margin:12px 0 20px;">${esc(ep.invitado)}</h2>
          <div class="lead-copy">
            <p>${esc(ep.rolInvitado)}.</p>
            <p>Este episodio forma parte de En Paralelo, el podcast de Enara Jiménez y Selu donde las conversaciones van sin guion. Nuevo episodio cada martes a las 6:00.</p>
          </div>
        </div>
${bloqueTranscripcion(ep)}
        <div class="glass-panel content-panel reveal" data-delay="200" style="margin-top:24px;">
          <span class="neon-label">Sigue escuchando</span>
          <h2 style="margin:12px 0 20px;">Otros episodios</h2>
          <div class="ep-nav">
            ${anterior ? `<a href="/episodios/${anterior.slug}" class="ep-nav-item"><span>Anterior</span><strong>${esc(anterior.invitado)}</strong></a>` : ''}
            ${siguiente ? `<a href="/episodios/${siguiente.slug}" class="ep-nav-item"><span>Siguiente</span><strong>${esc(siguiente.invitado)}</strong></a>` : ''}
            <a href="/episodios" class="ep-nav-item ep-nav-item--todos"><span>Ver</span><strong>Todos los episodios</strong></a>
          </div>
        </div>

      </div>
    </section>

    <div class="scroll-indicator" aria-hidden="true">
      <span></span>
      <span></span>
      <span></span>
    </div>

  </div>

${pie.replace(/<\/body>\s*<\/html>\s*$/, '')}${scripts}`;
}

// ---------- ÍNDICE ----------
function paginaIndice() {
  const url = DOM + '/episodios';
  const jsonld = JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        '@id': url, url,
        name: 'Episodios de En Paralelo Podcast',
        inLanguage: 'es',
        description: 'Todos los episodios de En Paralelo: conversaciones sin guion sobre propósito, autoconocimiento, espiritualidad y el camino de cada invitado.',
      },
      {
        '@type': 'ItemList',
        name: 'Episodios de En Paralelo',
        itemListElement: episodios.map((ep, i) => ({
          '@type': 'ListItem', position: i + 1,
          url: `${DOM}/episodios/${ep.slug}`, name: ep.titulo,
        })),
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Inicio', item: DOM + '/' },
          { '@type': 'ListItem', position: 2, name: 'Episodios', item: url },
        ],
      },
    ],
  }, null, 2).split('\n').map(l => '  ' + l).join('\n');

  const tarjetas = episodios.map(ep => `
          <article class="glass-panel ep-card">
            <a href="/episodios/${ep.slug}" class="ep-card-link">
              <div class="ep-card-thumb">
                <img src="https://img.youtube.com/vi/${ep.id}/maxresdefault.jpg" alt="Episodio con ${esc(ep.invitado)}" loading="lazy" width="480" height="270" />
              </div>
              <div class="ep-card-body">
                <span class="ep-card-meta"><time datetime="${ep.fecha}">${fechaLarga(ep.fecha)}</time> · ${duracionTexto(ep.duracionSeg)}</span>
                <h2 class="ep-card-title">${esc(ep.titulo)}</h2>
                <p class="ep-card-desc">${esc(ep.resumen.slice(0, 175))}…</p>
                <span class="ep-card-cta">Ver el episodio →</span>
              </div>
            </a>
          </article>`).join('');

  return cabecera({
    titulo: 'Episodios — En Paralelo Podcast',
    desc: 'Todos los episodios de En Paralelo: conversaciones sin guion sobre propósito, autoconocimiento y espiritualidad con empresarios, sanitarias, mentores y gente con algo vivido.',
    url, imagen: DOM + '/assets/images/og-cover.jpg', jsonld, activo: '/episodios',
  }) + `
  <div id="app">
    <section class="subpage-hero">
      <div class="section-wrapper">
        <div class="subpage-hero-inner reveal">
          <span class="neon-label">Episodios</span>
          <h1>Las conversaciones<br />que te dejan algo.</h1>
          <p class="subpage-subtitle">Sin guion, sin prisa y sin quedarse en la superficie. Nuevo episodio cada martes a las 6:00.</p>
        </div>
      </div>
    </section>

    <section class="subpage-content">
      <div class="section-wrapper">
        <div class="ep-grid">${tarjetas}
        </div>
      </div>
    </section>

    <div class="scroll-indicator" aria-hidden="true">
      <span></span>
      <span></span>
      <span></span>
    </div>

  </div>

${pie.replace(/<\/body>\s*<\/html>\s*$/, '')}${scripts}`;
}

// ---------- ESCRITURA ----------
const dir = path.join(DIR, 'episodios');
if (!fs.existsSync(dir)) fs.mkdirSync(dir);

let conTranscripcion = 0;
episodios.forEach((ep, i) => {
  fs.writeFileSync(path.join(dir, ep.slug + '.html'), paginaEpisodio(ep, i));
  if (ep.transcripcion) conTranscripcion++;
});

fs.writeFileSync(path.join(DIR, 'episodios.html'), paginaIndice());

const hoy = new Date().toISOString().slice(0, 10);
const urls = [
  ['/', '1.0', 'weekly', hoy],
  ['/episodios', '0.9', 'weekly', hoy],
  ...episodios.map(ep => [`/episodios/${ep.slug}`, '0.8', 'monthly', ep.fecha]),
  ['/nosotros', '0.8', 'monthly', hoy],
  ['/comunidad', '0.7', 'monthly', hoy],
  ['/invitados', '0.8', 'monthly', hoy],
  ['/patrocinadores', '0.7', 'monthly', hoy],
  ['/privacidad', '0.2', 'yearly', hoy],
  ['/aviso-legal', '0.2', 'yearly', hoy],
  ['/cookies', '0.2', 'yearly', hoy],
];

fs.writeFileSync(path.join(DIR, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(([u, p, c, m]) => `  <url>
    <loc>${DOM}${u}</loc>
    <lastmod>${m}</lastmod>
    <changefreq>${c}</changefreq>
    <priority>${p}</priority>
  </url>`).join('\n')}
</urlset>
`);

console.log(`${episodios.length} episodios · ${conTranscripcion} con transcripción · sitemap con ${urls.length} URLs`);
if (conTranscripcion < episodios.length) {
  console.log(`Pendientes de transcribir: ${episodios.filter(e => !e.transcripcion).map(e => e.invitado).join(', ')}`);
}
console.log('Recuerda ejecutar después: npm run cache-bust');
