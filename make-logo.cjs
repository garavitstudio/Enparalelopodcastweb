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
const ANCHO = 1600;   // resolución de trabajo
const UMBRAL = 225;   // por encima de esto es trazo, por debajo es resplandor

// Colores medidos sobre el propio logo, no elegidos a ojo: el núcleo del
// neón es casi crema y el resplandor, el amarillo saturado de la marca.
// Con un solo tono el símbolo se veía de otro color que las letras.
const NUCLEO = '#ffee92';
const HALO = '#ffe133';

// El símbolo, engordado para casar con el peso de la tipografía y con su
// mismo resplandor. En el icono el trazo es fino porque va solo; metido
// dentro de la palabra tiene que pesar lo que pesan las demás letras, o se
// lee como si fuera de otra fuente.
const trazos = (color) => `
    <path d="M42 14 A38 38 0 0 0 42 86" stroke-width="15"/>
    <path d="M60 21 A31 31 0 0 1 60 79" stroke-width="10"/>
    <path d="M44 66 C39 55 48 47 44 36" stroke-width="4.4"/>
    <path d="M44 32 L44 32.01" stroke-width="6"/>
    <path d="M57 69 C52 57 61 49 57 38" stroke-width="6.2"/>
    <path d="M57 33 L57 33.01" stroke-width="8"/>`;

// El símbolo montado como el neón de las letras: un halo saturado detrás y
// el núcleo claro encima. Con un solo tono plano no casaba con el logo.
const simbolo = (lado) => Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${lado}" height="${lado}" viewBox="0 0 100 100">
  <defs>
    <filter id="halo" x="-60%" y="-60%" width="220%" height="220%">
      <feGaussianBlur stdDeviation="4.5"/>
    </filter>
    <filter id="suave" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="0.7"/>
    </filter>
  </defs>
  <g fill="none" stroke="${HALO}" stroke-linecap="round" stroke-linejoin="round" filter="url(#halo)" opacity="0.85">${trazos()}</g>
  <g fill="none" stroke="${HALO}" stroke-linecap="round" stroke-linejoin="round" filter="url(#suave)">${trazos()}</g>
  <g fill="none" stroke="${NUCLEO}" stroke-linecap="round" stroke-linejoin="round" filter="url(#suave)" stroke-opacity="0.95">${trazos()}</g>
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

  // Se borra la O, con margen para llevarse también su resplandor.
  //
  // El hueco tiene que ser TRANSPARENTE, no negro: al recortar con dest-in
  // lo que decide es el canal alfa y no el color, así que un rectángulo
  // negro opaco no borraba nada. Se usa un path con regla par-impar, que
  // deja el interior sin pintar de verdad.
  // El recorte es una elipse, no un rectángulo, y con el borde difuminado:
  // el logo lleva un resplandor de fondo alrededor de las letras y, si se
  // corta en seco, queda un agujero rectangular a la vista.
  const m = Math.round(altoO * 0.2);
  const cxO = (ox + oxFin) / 2, cyO = (oy + oyFin) / 2;
  const rxE = anchoO / 2 + m, ryE = altoO / 2 + m;

  const mascara = await sharp(Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
    <rect width="${W}" height="${H}" fill="#fff"/>
    <ellipse cx="${cxO}" cy="${cyO}" rx="${rxE}" ry="${ryE}" fill="#000"/>
  </svg>`))
    .blur(14)                 // difumina la frontera del recorte
    .toColourspace('b-w')
    .raw().toBuffer({ resolveWithObject: true });

  // El gris de la máscara se traslada al canal alfa: negro borra, blanco deja
  const alfa = Buffer.alloc(W * H * 4);
  for (let i = 0; i < W * H; i++) {
    alfa[i * 4] = alfa[i * 4 + 1] = alfa[i * 4 + 2] = 255;
    alfa[i * 4 + 3] = mascara.data[i];
  }
  const sinO = await base.clone()
    .composite([{ input: alfa, raw: { width: W, height: H, channels: 4 }, blend: 'dest-in' }])
    .png().toBuffer();

  const rx = Math.round(cxO - rxE), ry = Math.round(cyO - ryE);
  const rw = Math.round(rxE * 2), rh = Math.round(ryE * 2);

  // Comprobación: en el hueco no puede quedar tinta de la letra anterior
  const { data: dSin } = await sharp(sinO).raw().toBuffer({ resolveWithObject: true });
  let restos = 0;
  for (let y = ry; y < ry + rh; y++) {
    for (let x = rx; x < rx + rw; x++) {
      if (dSin[(y * W + x) * C + (C - 1)] > 60) restos++;
    }
  }
  console.log(restos === 0
    ? 'la O queda borrada (borde difuminado)'
    : `AVISO: quedan ${restos} pixeles de la O sin borrar`);

  // El símbolo va un pelín mayor que la letra: su trazo es más fino que el
  // de la tipografía y, a igual altura, se vería más pequeño de lo que es.
  const lado = Math.round(altoO * 1.46); // el halo ocupa por fuera del circulo
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
