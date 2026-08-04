// Monta el logotipo de neón a partir del vector en negro.
//
// Antes esto se hacía parcheando píxeles sobre el logo antiguo: se borraba
// la O y se pegaba el símbolo encima. Aunque se igualaran color y tamaño,
// seguían siendo dos cosas superpuestas y se notaba. Con el vector completo
// el resplandor se aplica al conjunto de una vez, así que casa por
// construcción y además queda escalable.
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const IMG = path.join(__dirname, 'assets/images');
const ORIGEN = path.join(IMG, 'EN PARALELO con logo detro (Negro).svg');

// Colores muestreados del logo de neón original: el núcleo es casi crema y
// el halo, el amarillo saturado de la marca.
const NUCLEO = '#ffee92';
const HALO = '#ffe133';
const BLANCO = '#f4f4f4'; // "Podcast" va en blanco en el logo original

(async () => {
  let svg = fs.readFileSync(ORIGEN, 'utf8');

  // 1. Fuera el fondo blanco: son dos rectángulos que cubren todo el lienzo
  const fondos = (svg.match(/<rect[^>]*fill="#ffffff"[^>]*\/>/g) || []).length;
  svg = svg.replace(/<rect[^>]*fill="#ffffff"[^>]*\/>/g, '');
  console.log(`fondo blanco: ${fondos} rectángulos eliminados`);

  // 2. El negro pasa a currentColor para poder recolorear desde fuera sin
  //    duplicar los trazados
  const antes = (svg.match(/#000000/g) || []).length;
  svg = svg.replace(/(fill|stroke)="#000000"/g, '$1="currentColor"');
  console.log(`${antes} referencias al negro convertidas en currentColor`);

  // 3. Se recorta el lienzo al contenido: el original es cuadrado y el logo
  //    ocupa una franja, así que sobra margen por todas partes
  const vb = svg.match(/viewBox="([\d.\s]+)"/)[1].trim().split(/\s+/).map(Number);
  const cuerpo = svg.slice(svg.indexOf('>', svg.indexOf('<svg')) + 1, svg.lastIndexOf('</svg>'));

  const medir = await sharp(Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="1600" height="${Math.round(1600 * vb[3] / vb[2])}" viewBox="${vb.join(' ')}"><g color="#000">${cuerpo}</g></svg>`
  )).raw().toBuffer({ resolveWithObject: true });

  const { width: MW, height: MH, channels: MC } = medir.info;
  let x0 = MW, y0 = MH, x1 = 0, y1 = 0;
  for (let y = 0; y < MH; y++) {
    for (let x = 0; x < MW; x++) {
      if (medir.data[(y * MW + x) * MC + (MC - 1)] > 12) {
        if (x < x0) x0 = x; if (x > x1) x1 = x;
        if (y < y0) y0 = y; if (y > y1) y1 = y;
      }
    }
  }
  const k = vb[2] / MW; // de píxeles medidos a unidades del viewBox
  const aire = 26 * k;  // sitio para que el resplandor no se corte
  const nvb = [
    vb[0] + x0 * k - aire,
    vb[1] + y0 * k - aire,
    (x1 - x0) * k + aire * 2,
    (y1 - y0) * k + aire * 2,
  ].map(v => Math.round(v * 100) / 100);
  console.log(`lienzo recortado: ${vb[2]}x${vb[3]} → ${nvb[2]}x${nvb[3]}`);

  // 4. "Podcast" va en blanco en el logo original, no en amarillo. Está en su
  //    propio grupo, identificable por el recorte que lleva asociado, así que
  //    se separa del resto para darle su color.
  // Se busca el uso del recorte, no su definición: el identificador aparece
  // antes dentro de <defs> y ahí no hay ningún grupo que extraer.
  const CLIP_PODCAST = 'clip-path="url(#1f26526405)"';
  function extraerGrupo(html, marca) {
    const pos = html.indexOf(marca);
    if (pos < 0) return null;
    // Hacia atrás hasta el <g que abre ese bloque
    const ini = html.lastIndexOf('<g ', html.lastIndexOf('<g ', pos) - 1);
    if (ini < 0) return null;
    // Hacia delante contando aperturas y cierres
    let nivel = 0, i = ini;
    while (i < html.length) {
      if (html.startsWith('<g', i)) nivel++;
      else if (html.startsWith('</g>', i)) { nivel--; if (nivel === 0) return [ini, i + 4]; }
      i++;
    }
    return null;
  }

  const rango = extraerGrupo(cuerpo, CLIP_PODCAST);
  let cuerpoAmarillo = cuerpo, cuerpoBlanco = '';
  if (rango) {
    cuerpoBlanco = cuerpo.slice(rango[0], rango[1]);
    cuerpoAmarillo = cuerpo.slice(0, rango[0]) + cuerpo.slice(rango[1]);
    console.log('"Podcast" separado para dejarlo en blanco');
  } else {
    console.log('AVISO: no se pudo separar "Podcast"; irá del mismo color');
  }

  // 5. El neón: un halo saturado detrás y el núcleo claro encima, aplicado al
  //    logotipo entero de una vez. Cada trazado se declara una sola vez y se
  //    reutiliza, para que el archivo no pese el triple.
  const desenfoque = Math.round(nvb[3] * 0.028 * 100) / 100;
  const capas = (id, halo, nucleo) => `
  <use href="#${id}" xlink:href="#${id}" color="${halo}" filter="url(#halo)" opacity="0.9"/>
  <use href="#${id}" xlink:href="#${id}" color="${halo}" opacity="0.5"/>
  <use href="#${id}" xlink:href="#${id}" color="${nucleo}"/>`;

  const neon = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="${nvb.join(' ')}" width="${Math.round(nvb[2] * 2)}" height="${Math.round(nvb[3] * 2)}" role="img" aria-label="En Paralelo Podcast">
  <title>En Paralelo Podcast</title>
  <defs>
    <g id="marca">${cuerpoAmarillo}</g>${cuerpoBlanco ? `
    <g id="sub">${cuerpoBlanco}</g>` : ''}
    <filter id="halo" x="-25%" y="-25%" width="150%" height="150%">
      <feGaussianBlur stdDeviation="${desenfoque}"/>
    </filter>
  </defs>${capas('marca', HALO, NUCLEO)}${cuerpoBlanco ? capas('sub', '#ffffff', BLANCO) : ''}
</svg>
`;

  fs.writeFileSync(path.join(IMG, 'logo-neon.svg'), neon);

  // 5. Versiones en mapa de bits, para redes y para donde no valga el SVG
  const png = await sharp(Buffer.from(neon), { density: 300 }).resize({ width: 1600 }).png({ compressionLevel: 9 }).toBuffer();
  await sharp(png).toFile(path.join(IMG, 'logo-marca.png'));
  await sharp(png).resize({ height: 240 }).png({ compressionLevel: 9, palette: true }).toFile(path.join(IMG, 'logo-web.png'));

  const kb = f => (fs.statSync(path.join(IMG, f)).size / 1024).toFixed(1) + ' KB';
  console.log(`\nlogo-neon.svg  · ${kb('logo-neon.svg')} · vectorial, el que usa la web`);
  console.log(`logo-marca.png · ${kb('logo-marca.png')} · maestro para redes y merch`);
  console.log(`logo-web.png   · ${kb('logo-web.png')} · respaldo en mapa de bits`);
})();
