// Iconos del sitio sin fondo, con el símbolo fino en negro.
//
// Un icono negro y transparente desaparece en las pestañas con tema oscuro,
// así que además de los PNG se sirve un SVG que cambia de color según el
// tema del sistema: negro sobre claro, amarillo sobre oscuro. Los
// navegadores modernos prefieren el SVG; los PNG quedan para Google, que
// los pinta siempre sobre blanco.
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const IMG = path.join(__dirname, 'assets/images');
const TAMANOS = [48, 96, 144, 192, 512];

// El símbolo fino: aguanta mejor la reducción que el grueso
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

// El encuadre deja aire alrededor: pegado al borde, los navegadores recortan
const VB = '-7 -7 114 114';

const plano = (trazos, color) => `<svg xmlns="http://www.w3.org/2000/svg" width="LADO" height="LADO" viewBox="${VB}">
  <g fill="none" stroke="${color}" stroke-linecap="round" stroke-linejoin="round">${trazos}
  </g>
</svg>`;

const adaptativo = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${VB}" width="512" height="512" role="img" aria-label="En Paralelo">
  <title>En Paralelo</title>
  <style>
    /* Sin fondo, el icono tiene que verse tanto sobre claro como sobre
       oscuro: en negro desaparecería en las pestañas de tema oscuro. */
    .marca { stroke: #0a0a0a; }
    @media (prefers-color-scheme: dark) { .marca { stroke: #ffed4a; } }
  </style>
  <g class="marca" fill="none" stroke-linecap="round" stroke-linejoin="round">${TRAZOS}
  </g>
</svg>
`;

(async () => {
  for (const lado of TAMANOS) {
    const svg = plano(lado <= 48 ? TRAZOS_MINI : TRAZOS, '#0a0a0a');
    await sharp(Buffer.from(svg.replace(/LADO/g, lado)))
      .png({ compressionLevel: 9 }).toFile(path.join(IMG, `favicon-${lado}.png`));
  }

  // El de Apple sí lleva fondo: el sistema lo coloca en la pantalla de
  // inicio y, sin fondo, quedaría flotando sobre el fondo de pantalla.
  await sharp(Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="180" height="180" viewBox="${VB}">
    <rect x="-7" y="-7" width="114" height="114" fill="#0a0a0a"/>
    <g fill="none" stroke="#ffed4a" stroke-linecap="round" stroke-linejoin="round">${TRAZOS}</g>
  </svg>`)).png({ compressionLevel: 9 }).toFile(path.join(IMG, 'apple-touch-icon.png'));

  fs.writeFileSync(path.join(IMG, 'favicon.svg'), adaptativo);

  const kb = f => (fs.statSync(path.join(IMG, f)).size / 1024).toFixed(1) + ' KB';
  console.log('Iconos sin fondo, simbolo fino en negro:');
  for (const l of TAMANOS) console.log(`  favicon-${l}.png`.padEnd(24) + kb(`favicon-${l}.png`));
  console.log('  favicon.svg'.padEnd(24) + kb('favicon.svg') + '  se adapta al tema del navegador');
  console.log('  apple-touch-icon.png'.padEnd(24) + kb('apple-touch-icon.png') + '  con fondo, lo exige el sistema');
})();
