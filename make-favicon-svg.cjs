// Iconos del sitio: el símbolo en neón amarillo dentro de una circunferencia
// negra. El fondo cuadrado cantaba en las pestañas y en los listados; el
// círculo recorta mejor y es lo que esperan los sistemas que lo enmascaran.
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const IMG = path.join(__dirname, 'assets/images');
const TAMANOS = [48, 96, 144, 192, 512];

// Los mismos tonos medidos sobre el logo: núcleo casi crema, halo saturado
const NUCLEO = '#ffee92';
const HALO = '#ffe133';
const NEGRO = '#0a0a0a';

// Símbolo fino: aguanta mejor la reducción que el grueso
const TRAZOS = `
      <path d="M42 12 A39 39 0 0 0 42 88" stroke-width="11"/>
      <path d="M60 20 A32 32 0 0 1 60 80" stroke-width="7"/>
      <path d="M43 68 C38 55 48 47 43 34" stroke-width="3.2"/>
      <path d="M43 30 L43 30.01" stroke-width="4.4"/>
      <path d="M56 70 C51 56 61 48 56 35" stroke-width="4.6"/>
      <path d="M56 30 L56 30.01" stroke-width="6"/>`;

// A 16 px las dos voces se juntan en una mancha: ahí va una sola, centrada
const TRAZOS_MINI = `
      <path d="M42 11 A40 40 0 0 0 42 89" stroke-width="12.5"/>
      <path d="M61 19 A33 33 0 0 1 61 81" stroke-width="8.5"/>
      <path d="M49 70 C44 56 54 48 49 34" stroke-width="9"/>
      <path d="M49 28 L49 28.01" stroke-width="10"/>`;

// El símbolo se encoge para respirar dentro del círculo
const DENTRO = 0.74;
const MARGEN = (100 - 100 * DENTRO) / 2;

function icono(trazos, { brillo = 3.4 } = {}) {
  // El espacio de nombres xlink hace falta para el href antiguo de <use>,
  // que es el que entienden los rasterizadores y los navegadores viejos.
  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="LADO" height="LADO" viewBox="0 0 100 100" role="img" aria-label="En Paralelo">
  <title>En Paralelo</title>
  <defs>
    <filter id="halo" x="-40%" y="-40%" width="180%" height="180%">
      <feGaussianBlur stdDeviation="${brillo}"/>
    </filter>
    <g id="s">${trazos}
    </g>
  </defs>
  <circle cx="50" cy="50" r="50" fill="${NEGRO}"/>
  <g transform="translate(${MARGEN} ${MARGEN}) scale(${DENTRO})" fill="none" stroke-linecap="round" stroke-linejoin="round">
    <use href="#s" xlink:href="#s" stroke="${HALO}" filter="url(#halo)" opacity="0.9"/>
    <use href="#s" xlink:href="#s" stroke="${HALO}" opacity="0.55"/>
    <use href="#s" xlink:href="#s" stroke="${NUCLEO}"/>
  </g>
</svg>`;
}

// El que se adapta: la circunferencia negra funciona sobre cualquier fondo,
// así que aquí no hace falta cambiar de color según el tema.
const adaptativo = icono(TRAZOS).replace(/ width="LADO" height="LADO"/, ' width="512" height="512"');

(async () => {
  for (const lado of TAMANOS) {
    // En pequeño el resplandor emborrona: se reduce y se simplifica el dibujo
    const svg = lado <= 48
      ? icono(TRAZOS_MINI, { brillo: 1.8 })
      : icono(TRAZOS, { brillo: lado <= 96 ? 2.6 : 3.4 });
    await sharp(Buffer.from(svg.replace(/LADO/g, lado)))
      .png({ compressionLevel: 9 }).toFile(path.join(IMG, `favicon-${lado}.png`));
  }

  // El de Apple lo enmascara el sistema: el círculo se apoya en un cuadrado
  // negro para que al recortarlo no queden esquinas transparentes.
  await sharp(Buffer.from(icono(TRAZOS).replace(/LADO/g, 180)
    .replace('<circle cx="50" cy="50" r="50"', `<rect width="100" height="100" fill="${NEGRO}"/><circle cx="50" cy="50" r="50"`)))
    .png({ compressionLevel: 9 }).toFile(path.join(IMG, 'apple-touch-icon.png'));

  fs.writeFileSync(path.join(IMG, 'favicon.svg'), adaptativo + '\n');

  const kb = f => (fs.statSync(path.join(IMG, f)).size / 1024).toFixed(1) + ' KB';
  console.log('Iconos: simbolo en neon amarillo dentro de circunferencia negra');
  for (const l of TAMANOS) console.log(`  favicon-${l}.png`.padEnd(24) + kb(`favicon-${l}.png`));
  console.log('  favicon.svg'.padEnd(24) + kb('favicon.svg'));
  console.log('  apple-touch-icon.png'.padEnd(24) + kb('apple-touch-icon.png') + '  cuadrado, lo recorta el sistema');
})();
