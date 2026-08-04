// Genera los iconos del sitio con fondo oscuro.
//
// El logo de la web es neón sobre transparente: en Google, que pinta los
// favicons sobre blanco, el amarillo desaparece. Y además es muy apaisado,
// así que dentro de un cuadrado de 48px el texto no se lee. Por eso el icono
// no es el logo entero, sino una marca pensada para tamaño pequeño.
//
//   node make-favicons.cjs <marca>   → genera el juego de iconos
//   node make-favicons.cjs --hoja    → hoja de comparación de todas
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const IMG = path.join(__dirname, 'assets/images');
const NEGRO = '#0a0a0a';
const AMARILLO = '#ffed4a';

// Google pide favicons cuadrados y múltiplos de 48
const TAMANOS = [48, 96, 144, 192, 512];

const envoltorio = (contenido, blur = 2.2) => `<svg xmlns="http://www.w3.org/2000/svg" width="LADO" height="LADO" viewBox="0 0 100 100">
  <defs>
    <filter id="g" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="${blur}" result="b"/>
      <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>
  <rect width="100" height="100" fill="${NEGRO}"/>
  <g filter="url(#g)" fill="none" stroke="${AMARILLO}" stroke-linecap="round" stroke-linejoin="round">
${contenido}
  </g>
</svg>`;

const MARCAS = {
  // Dos voces: dos ondas que viajan juntas sin llegar a tocarse. Es el
  // podcast (audio) y el nombre (paralelo) en la misma forma.
  ondas: envoltorio(`    <path d="M14 38 Q30 16 50 38 T86 38" stroke-width="9"/>
    <path d="M14 66 Q30 44 50 66 T86 66" stroke-width="9" opacity="0.85"/>`),

  // Dos caminos que se encuentran: vienen separados, coinciden en un punto
  // y siguen juntos. Es literalmente "dos caminos, un mismo porqué".
  caminos: envoltorio(`    <path d="M20 88 Q20 58 50 50" stroke-width="9"/>
    <path d="M80 88 Q80 58 50 50" stroke-width="9"/>
    <path d="M50 50 L50 14" stroke-width="9"/>
    <circle cx="50" cy="50" r="4" fill="${AMARILLO}" stroke="none"/>`, 2.6),

  // Portal: dos arcos concéntricos abiertos. Mirar hacia dentro, la
  // conversación que va más allá de la superficie.
  portal: envoltorio(`    <path d="M50 16 A34 34 0 1 1 16 50" stroke-width="10"/>
    <path d="M50 34 A16 16 0 1 1 34 50" stroke-width="10"/>`, 2.4),

  // Pulso: las dos barras del nombre, atravesadas por la onda de una voz.
  // Mantiene la idea de "paralelo" pero con movimiento.
  pulso: envoltorio(`    <path d="M30 16 L26 84" stroke-width="10"/>
    <path d="M74 16 L70 84" stroke-width="10"/>
    <path d="M8 50 L20 50 L28 34 L40 66 L50 44 L60 58 L68 50 L92 50" stroke-width="5" opacity="0.9"/>`, 2),

  // Infinito partido: dos lazos que se cruzan. Dos vidas que se enredan.
  lazo: envoltorio(`    <path d="M50 50 C38 32 16 34 16 50 C16 66 38 68 50 50 C62 32 84 34 84 50 C84 66 62 68 50 50 Z" stroke-width="9"/>`, 2.4),

  // Ascenso: dos caminos que suben cada uno a su manera pero sin separarse.
  // Es el "paralelo" contado como recorrido, no como geometría.
  ascenso: envoltorio(`    <path d="M32 86 C18 66 46 58 32 38 C24 26 30 20 34 14" stroke-width="9"/>
    <path d="M68 86 C82 66 54 58 68 38 C76 26 70 20 66 14" stroke-width="9" opacity="0.9"/>`, 2.4),

  // Variante intermedia: la suavidad de las ondas, pero ascendiendo. Punto
  // medio entre las dos favoritas.
  ondasVert: envoltorio(`    <path d="M34 86 Q12 64 34 50 T34 14" stroke-width="9"/>
    <path d="M66 86 Q88 64 66 50 T66 14" stroke-width="9" opacity="0.9"/>`, 2.4),

  // Señal: dos arcos que se propagan, como la voz saliendo del micro. El
  // símbolo universal de audio, pero duplicado: dos voces a la vez.
  senal: envoltorio(`    <path d="M34 22 A38 38 0 0 1 34 78" stroke-width="10"/>
    <path d="M60 34 A22 22 0 0 1 60 66" stroke-width="10" opacity="0.9"/>
    <circle cx="22" cy="50" r="6" fill="${AMARILLO}" stroke="none"/>`, 2.4),
};

async function generar(marca) {
  const svg = MARCAS[marca];
  if (!svg) { console.error(`No existe la marca "${marca}". Opciones: ${Object.keys(MARCAS).join(', ')}`); process.exit(1); }

  for (const lado of TAMANOS) {
    await sharp(Buffer.from(svg.replace(/LADO/g, lado)))
      .png({ compressionLevel: 9 }).toFile(path.join(IMG, `favicon-${lado}.png`));
  }
  await sharp(Buffer.from(svg.replace(/LADO/g, 180)))
    .png({ compressionLevel: 9 }).toFile(path.join(IMG, 'apple-touch-icon.png'));

  console.log(`Iconos generados con la marca "${marca}":`);
  for (const lado of [...TAMANOS, 'apple-touch-icon']) {
    const f = typeof lado === 'number' ? `favicon-${lado}.png` : lado + '.png';
    console.log(`  ${f.padEnd(24)} ${(fs.statSync(path.join(IMG, f)).size / 1024).toFixed(1)} KB`);
  }
}

// Hoja de comparación: cada propuesta a los tamaños en los que se va a ver
async function hoja(salida) {
  const nombres = Object.keys(MARCAS);
  const vistas = [48, 96, 160];
  const filaAlto = 190;
  const piezas = [];

  for (let i = 0; i < nombres.length; i++) {
    let x = 40;
    for (const t of vistas) {
      piezas.push({
        input: await sharp(Buffer.from(MARCAS[nombres[i]].replace(/LADO/g, t))).png().toBuffer(),
        top: i * filaAlto + Math.round((filaAlto - t) / 2),
        left: x,
      });
      x += t + 34;
    }
  }

  await sharp({ create: { width: 470, height: nombres.length * filaAlto, channels: 4, background: '#ffffff' } })
    .composite(piezas).png().toFile(salida);
  console.log(`Hoja con ${nombres.length} propuestas: ${nombres.join(', ')}`);
}

(async () => {
  const arg = process.argv[2] || 'ondas';
  if (arg === '--hoja') await hoja(process.argv[3] || 'propuestas-logo.png');
  else await generar(arg);
})();
