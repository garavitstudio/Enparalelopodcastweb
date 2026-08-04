// Genera los iconos del sitio con fondo oscuro.
//
// El logo de la web es neón sobre transparente: en Google, que pinta los
// favicons sobre blanco, el amarillo desaparece. Y además es muy apaisado,
// así que dentro de un cuadrado de 48px el texto no se lee. Por eso el icono
// no es el logo entero, sino una marca pensada para tamaño pequeño.
//
//   node make-favicons.cjs           → dos barras paralelas (por defecto)
//   node make-favicons.cjs logo      → el logo entero, a sangre
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const IMG = path.join(__dirname, 'assets/images');
const NEGRO = '#0a0a0a';
const AMARILLO = '#ffed4a';

// Google pide favicons cuadrados y múltiplos de 48
const TAMANOS = [48, 96, 144, 192, 512];

// Dos barras paralelas: el nombre de la marca dibujado en vez de escrito.
// Se reconoce igual a 16 que a 512 píxeles, que es lo que debe hacer un icono.
function svgBarras(lado) {
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${lado}" height="${lado}" viewBox="0 0 100 100">
  <defs>
    <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="2.4" result="b"/>
      <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>
  <rect width="100" height="100" fill="${NEGRO}"/>
  <g filter="url(#glow)">
    <rect x="26" y="18" width="13" height="64" rx="6.5" fill="${AMARILLO}" transform="rotate(14 32.5 50)"/>
    <rect x="57" y="18" width="13" height="64" rx="6.5" fill="${AMARILLO}" transform="rotate(14 63.5 50)"/>
  </g>
</svg>`);
}

(async () => {
  const modo = process.argv[2] || 'barras';

  if (modo === 'logo') {
    const logo = await sharp(path.join(IMG, 'logo.svg'), { density: 300 })
      .resize({ width: 1400, fit: 'inside' }).png().toBuffer();

    for (const lado of TAMANOS) {
      const util = Math.round(lado * 0.94);
      const dentro = await sharp(logo).resize({ width: util, height: util, fit: 'inside' }).toBuffer();
      const m = await sharp(dentro).metadata();
      await sharp({ create: { width: lado, height: lado, channels: 4, background: NEGRO } })
        .composite([{ input: dentro, top: Math.round((lado - m.height) / 2), left: Math.round((lado - m.width) / 2) }])
        .png({ compressionLevel: 9 }).toFile(path.join(IMG, `favicon-${lado}.png`));
    }
  } else {
    for (const lado of TAMANOS) {
      await sharp(svgBarras(lado)).png({ compressionLevel: 9 }).toFile(path.join(IMG, `favicon-${lado}.png`));
    }
  }

  // El de Apple se ve grande y el sistema le redondea las esquinas
  await sharp(modo === 'logo' ? path.join(IMG, 'favicon-192.png') : svgBarras(180))
    .resize(180, 180).png({ compressionLevel: 9 }).toFile(path.join(IMG, 'apple-touch-icon.png'));

  for (const lado of [...TAMANOS, 'apple-touch-icon']) {
    const f = typeof lado === 'number' ? `favicon-${lado}.png` : lado + '.png';
    console.log(`  ${f.padEnd(24)} ${(fs.statSync(path.join(IMG, f)).size / 1024).toFixed(1)} KB`);
  }
})();
