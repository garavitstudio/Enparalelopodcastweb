// Sustituye la O de PARALELO por el símbolo de la marca.
//
// El logo original es un SVG que envuelve un PNG, así que las letras no son
// vectores editables: hay que localizar la O midiendo los píxeles.
//
// El resplandor de neón une unas letras con otras, así que no vale con
// buscar columnas vacías: hay que mirar solo el núcleo del trazo, con un
// umbral de opacidad alto, y ahí sí aparecen las letras separadas.
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const IMG = path.join(__dirname, 'assets/images');
const AMARILLO = '#ffed4a';
const ANCHO = 1600;   // resolución de trabajo
const UMBRAL = 225;   // por encima de esto es trazo, por debajo es resplandor

// El símbolo, engordado para casar con el peso de la tipografía y con su
// mismo resplandor. En el icono el trazo es fino porque va solo; metido
// dentro de la palabra tiene que pesar lo que pesan las demás letras, o se
// lee como si fuera de otra fuente.
const simbolo = (lado) => Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${lado}" height="${lado}" viewBox="0 0 100 100">
  <defs>
    <filter id="neon" x="-45%" y="-45%" width="190%" height="190%">
      <feGaussianBlur stdDeviation="3" result="b"/>
      <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>
  <g filter="url(#neon)" fill="none" stroke="${AMARILLO}" stroke-linecap="round" stroke-linejoin="round">
    <path d="M42 14 A38 38 0 0 0 42 86" stroke-width="16"/>
    <path d="M60 21 A31 31 0 0 1 60 79" stroke-width="10.5" opacity="0.9"/>
    <path d="M44 66 C39 55 48 47 44 36" stroke-width="4.6" opacity="0.55"/>
    <circle cx="44" cy="32" r="3.2" fill="${AMARILLO}" stroke="none" opacity="0.55"/>
    <path d="M57 69 C52 57 61 49 57 38" stroke-width="6.5"/>
    <circle cx="57" cy="33" r="4.4" fill="${AMARILLO}" stroke="none"/>
  </g>
</svg>`);

(async () => {
  const base = sharp(path.join(IMG, 'logo.svg'), { density: 400 }).resize({ width: ANCHO });
  const { data, info } = await base.clone().raw().toBuffer({ resolveWithObject: true });
  const { width: W, height: H, channels: C } = info;
  const tinta = (x, y) => data[(y * W + x) * C + (C - 1)] > UMBRAL;

  // Bandas horizontales: arriba "EN PARALELO", debajo "Podcast" en cursiva
  const porFila = new Array(H).fill(0);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (tinta(x, y)) porFila[y]++;
  const bandas = [];
  let ini = -1;
  for (let y = 0; y < H; y++) {
    if (porFila[y] > 0 && ini < 0) ini = y;
    else if (porFila[y] === 0 && ini >= 0) { bandas.push([ini, y - 1]); ini = -1; }
  }
  if (ini >= 0) bandas.push([ini, H - 1]);
  const [y0, y1] = bandas[0]; // la palabra principal es la de arriba
  console.log(`"EN PARALELO" ocupa y ${y0}-${y1}`);

  // Letras de esa banda, por columnas
  const porCol = new Array(W).fill(0);
  for (let y = y0; y <= y1; y++) for (let x = 0; x < W; x++) if (tinta(x, y)) porCol[x]++;
  const letras = [];
  ini = -1;
  for (let x = 0; x < W; x++) {
    if (porCol[x] > 0 && ini < 0) ini = x;
    else if (porCol[x] === 0 && ini >= 0) { letras.push([ini, x - 1]); ini = -1; }
  }
  if (ini >= 0) letras.push([ini, W - 1]);

  // La O cierra la palabra: es el último bloque
  const [ox, oxFin] = letras[letras.length - 1];
  let oy = y1, oyFin = y0;
  for (let y = y0; y <= y1; y++) {
    for (let x = ox; x <= oxFin; x++) {
      if (tinta(x, y)) { if (y < oy) oy = y; if (y > oyFin) oyFin = y; }
    }
  }
  const anchoO = oxFin - ox + 1;
  const altoO = oyFin - oy + 1;
  console.log(`la O: x ${ox}-${oxFin} (${anchoO}px)  ·  y ${oy}-${oyFin} (${altoO}px)`);

  // Se borra la O con margen suficiente para llevarse también su resplandor
  const m = Math.round(altoO * 0.34);
  const mascara = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
    <rect width="${W}" height="${H}" fill="#fff"/>
    <rect x="${ox - m}" y="${oy - m}" width="${anchoO + m * 2}" height="${altoO + m * 2}" rx="${m}" fill="#000"/>
  </svg>`);
  const sinO = await base.clone().composite([{ input: mascara, blend: 'dest-in' }]).png().toBuffer();

  // El símbolo va un pelín mayor que la letra: su trazo es más fino que el
  // de la tipografía y, a igual altura, se vería más pequeño de lo que es.
  const lado = Math.round(altoO * 1.34); // el resplandor ocupa fuera del circulo
  const cx = Math.round((ox + oxFin) / 2);
  const cy = Math.round((oy + oyFin) / 2);

  const final = await sharp(sinO)
    .composite([{
      input: await sharp(simbolo(lado)).png().toBuffer(),
      top: Math.round(cy - lado / 2),
      left: Math.round(cx - lado / 2),
    }])
    .png({ compressionLevel: 9 })
    .toBuffer();

  // Maestro para redes, carátula y merchandising
  await sharp(final).png({ compressionLevel: 9 }).toFile(path.join(IMG, 'logo-marca.png'));

  // El de la web: en cabecera se ve a 38 px de alto, así que con 240 px
  // sobra incluso en pantallas de alta densidad. El maestro pesaba diez
  // veces más para mostrarse del tamaño de un sello.
  await sharp(final)
    .resize({ height: 240 })
    .png({ compressionLevel: 9, palette: true, quality: 92 })
    .toFile(path.join(IMG, 'logo-web.png'));

  const kb = f => (fs.statSync(path.join(IMG, f)).size / 1024).toFixed(1) + ' KB';
  console.log(`\nlogo-marca.png · ${kb('logo-marca.png')} · maestro (${W}px de ancho)`);
  console.log(`logo-web.png   · ${kb('logo-web.png')} · el que usa la web`);
  console.log(`símbolo de ${lado}px centrado en (${cx}, ${cy})`);
})();
