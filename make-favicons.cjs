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

  // --- Segunda tanda: sin simetría, como pide el propio brief ---

  // El espacio entre los dos. Dos arcos que abrazan un hueco con algo
  // dentro: lo que importa no es cada uno, es lo que pasa en medio.
  // Distintos a propósito: uno más abierto y grueso que el otro.
  entre: envoltorio(`    <path d="M36 14 A36 36 0 0 0 36 86" stroke-width="11"/>
    <path d="M64 22 A28 28 0 0 1 64 78" stroke-width="8" opacity="0.92"/>
    <circle cx="50" cy="50" r="5.5" fill="${AMARILLO}" stroke="none"/>`, 2.4),

  // Dos que se acercan sin llegar a tocarse. La tensión del hueco es el
  // punto: siguen siendo dos. Uno arranca antes y sube más.
  roce: envoltorio(`    <path d="M22 88 C22 58 40 56 46 40 C49 32 48 24 46 16" stroke-width="10"/>
    <path d="M78 88 C78 62 62 58 56 44 C53 37 54 30 56 24" stroke-width="8" opacity="0.9"/>`, 2.4),

  // Eco: una voz y la que responde. La segunda repite la forma de la
  // primera, desplazada y más tenue. Conversación, no monólogo.
  eco: envoltorio(`    <path d="M30 76 C30 46 44 34 44 20" stroke-width="11"/>
    <path d="M52 80 C52 50 66 38 66 24" stroke-width="7" opacity="0.55"/>
    <circle cx="44" cy="16" r="5" fill="${AMARILLO}" stroke="none"/>
    <circle cx="66" cy="20" r="3.5" fill="${AMARILLO}" stroke="none" opacity="0.55"/>`, 2.2),

  // Órbita: dos cuerpos girando uno alrededor del otro. Ni uno manda ni
  // el otro sigue; se sostienen. Tamaños distintos, como dos personas.
  orbita: envoltorio(`    <path d="M50 16 A34 34 0 1 1 22 68" stroke-width="9"/>
    <circle cx="50" cy="16" r="9" fill="${AMARILLO}" stroke="none"/>
    <circle cx="22" cy="68" r="5.5" fill="${AMARILLO}" stroke="none" opacity="0.85"/>`, 2.4),

  // --- Variantes de "el espacio entre los dos" ---

  // Abrazo cerrado: los arcos rodean casi por completo. El hueco se
  // estrecha y el punto gana peso: la conversación, protegida.
  entre1: envoltorio(`    <path d="M46 10 A40 40 0 0 0 46 90" stroke-width="11"/>
    <path d="M56 20 A30 30 0 0 1 56 80" stroke-width="8" opacity="0.9"/>
    <circle cx="50" cy="50" r="7" fill="${AMARILLO}" stroke="none"/>`, 2.6),

  // Hueco descentrado: el punto no está en el medio geométrico. Menos
  // logotipo de banco, más dos personas de verdad.
  entre2: envoltorio(`    <path d="M40 12 A38 38 0 0 0 34 86" stroke-width="11"/>
    <path d="M62 26 A26 26 0 0 1 66 74" stroke-width="7.5" opacity="0.9"/>
    <circle cx="52" cy="56" r="6" fill="${AMARILLO}" stroke="none"/>`, 2.5),

  // Sin punto: solo los dos y el vacío. Lo que pasa en medio no se
  // dibuja, se sugiere. Es la versión más adulta y silenciosa.
  entre3: envoltorio(`    <path d="M42 12 A38 38 0 0 0 42 88" stroke-width="12"/>
    <path d="M60 24 A28 28 0 0 1 60 76" stroke-width="8.5" opacity="0.88"/>`, 2.6),

  // --- Variantes de "el roce" ---

  // El casi: se acercan hasta rozarse y en ese punto salta la chispa.
  // El destello marca el instante exacto del encuentro.
  roce1: envoltorio(`    <path d="M20 90 C20 60 42 58 47 42 C50 33 49 24 47 14" stroke-width="10"/>
    <path d="M80 90 C80 64 58 60 53 44 C50 36 51 28 53 20" stroke-width="8" opacity="0.9"/>
    <circle cx="50" cy="47" r="4.5" fill="${AMARILLO}" stroke="none"/>`, 2.5),

  // Se cruzan y siguen: vienen de lados distintos, se atraviesan una vez
  // y continúan. Dos vidas que se encuentran y no se detienen.
  roce2: envoltorio(`    <path d="M24 90 C24 62 70 54 74 14" stroke-width="10"/>
    <path d="M76 90 C76 66 32 56 28 20" stroke-width="7.5" opacity="0.85"/>`, 2.5),

  // Uno sostiene: el trazo corto se apoya en el largo sin fundirse con
  // él. Dos que se acompañan sin ser lo mismo.
  roce3: envoltorio(`    <path d="M34 92 C30 60 40 40 52 12" stroke-width="11"/>
    <path d="M64 88 C62 66 60 52 58 40" stroke-width="7.5" opacity="0.88"/>
    <circle cx="52" cy="12" r="5" fill="${AMARILLO}" stroke="none"/>`, 2.4),

  // --- El abrazo: los arcos son el espacio de la conversación y dentro
  // van las dos voces. Continente y contenido en la misma marca. ---

  // Tal como llegó la idea: arcos gruesos y voces finas dentro.
  abrazo: envoltorio(`    <path d="M36 14 A44 44 0 0 0 36 86" stroke-width="10"/>
    <path d="M64 14 A44 44 0 0 1 64 86" stroke-width="10"/>
    <path d="M46 66 C42 58 50 54 47 44" stroke-width="4"/>
    <path d="M56 62 C52 54 60 50 57 40" stroke-width="4"/>
    <circle cx="44" cy="70" r="2.6" fill="${AMARILLO}" stroke="none"/>
    <circle cx="59" cy="36" r="2.6" fill="${AMARILLO}" stroke="none"/>`, 2),

  // Reequilibrado: las voces crecen y engordan hasta sostener el peso de
  // los arcos, y los arcos adelgazan un poco. Es la misma idea, pero que
  // aguanta a 32 píxeles.
  abrazo2: envoltorio(`    <path d="M30 12 A46 46 0 0 0 30 88" stroke-width="9"/>
    <path d="M70 12 A46 46 0 0 1 70 88" stroke-width="9"/>
    <path d="M44 76 C38 60 52 54 45 36" stroke-width="7.5"/>
    <path d="M58 64 C64 50 52 44 57 26" stroke-width="7.5" opacity="0.92"/>`, 2.3),

  // Mínimo: dos arcos y dos gestos dentro, sin más detalle. Pensado para
  // que a 16 píxeles siga leyéndose que hay algo vivo en medio.
  abrazo3: envoltorio(`    <path d="M32 16 A42 42 0 0 0 32 84" stroke-width="10"/>
    <path d="M68 16 A42 42 0 0 1 68 84" stroke-width="10"/>
    <path d="M45 70 C40 56 50 52 45 38" stroke-width="9"/>
    <path d="M57 62 C62 48 52 44 57 30" stroke-width="9" opacity="0.9"/>`, 2.4),

  // Versión reducida del abrazo, para 16 y 48 píxeles. A ese tamaño las dos
  // voces son una mota, así que se quedan en un solo trazo que las resume.
  // Misma marca, menos detalle: es lo que hace cualquier identidad seria.
  abrazoMini: envoltorio(`    <path d="M28 12 A48 48 0 0 0 28 88" stroke-width="12"/>
    <path d="M72 12 A48 48 0 0 1 72 88" stroke-width="12"/>
    <path d="M50 72 C42 54 58 46 50 28" stroke-width="11"/>`, 2.6),
};

// --- El abrazo con eco: los arcos de "el espacio entre los dos" y, dentro,
// una voz y la que le responde.
//
// Los pesos van cruzados a propósito: el arco grande está a la izquierda y
// la voz con más presencia a la derecha. Si el peso se acumulara en el mismo
// lado, el conjunto escoraría; cruzado se equilibra sin caer en la simetría,
// que es justo lo que no queremos.
Object.assign(MARCAS, {
  abrazoEco: envoltorio(`    <path d="M30 10 A46 46 0 0 0 30 90" stroke-width="11.5"/>
    <path d="M70 24 A31 31 0 0 1 70 76" stroke-width="7" opacity="0.9"/>
    <path d="M45 70 C41 56 49 50 45 36" stroke-width="5.5" opacity="0.5"/>
    <circle cx="45" cy="32" r="3" fill="${AMARILLO}" stroke="none" opacity="0.5"/>
    <path d="M58 76 C54 60 62 54 58 40" stroke-width="8.5"/>
    <circle cx="58" cy="35" r="4.5" fill="${AMARILLO}" stroke="none"/>`, 2.4),

  // Su versión reducida: a 16 px la voz tenue no se ve, así que se queda
  // la principal, ya centrada para que el conjunto no cojee.
  abrazoEcoMini: envoltorio(`    <path d="M28 10 A48 48 0 0 0 28 90" stroke-width="13"/>
    <path d="M72 22 A33 33 0 0 1 72 78" stroke-width="8.5" opacity="0.9"/>
    <path d="M50 74 C45 58 55 50 50 34" stroke-width="10"/>
    <circle cx="50" cy="28" r="5" fill="${AMARILLO}" stroke="none"/>`, 2.6),
});

// --- El círculo con las dos voces dentro ---
//
// Los arcos casi se cierran, como en la primera versión, pero en el centro
// ya no hay un punto: están las dos voces. El círculo es el espacio de la
// conversación; dentro pasa lo que pasa.
//
// Los pesos siguen cruzados: arco izquierdo más grueso, voz izquierda más
// tenue. Las dos voces se reparten a los lados del eje para que el conjunto
// quede centrado de verdad.
Object.assign(MARCAS, {
  circuloEco: envoltorio(`    <path d="M44 13 A38 38 0 0 0 44 87" stroke-width="11"/>
    <path d="M56 13 A38 38 0 0 1 56 87" stroke-width="7.5" opacity="0.9"/>
    <path d="M43 65 C39 55 47 49 43 39" stroke-width="5.5" opacity="0.5"/>
    <circle cx="43" cy="35" r="2.8" fill="${AMARILLO}" stroke="none" opacity="0.5"/>
    <path d="M57 68 C53 57 61 51 57 41" stroke-width="8"/>
    <circle cx="57" cy="36" r="4.2" fill="${AMARILLO}" stroke="none"/>`, 2.4),

  // Voces finas: basta con que se entiendan como líneas. Al adelgazarlas
  // el círculo respira y el contraste con el grosor de los arcos hace que
  // se lean como algo distinto, no como más marca.
  circuloFino: envoltorio(`    <path d="M44 13 A38 38 0 0 0 44 87" stroke-width="11"/>
    <path d="M56 13 A38 38 0 0 1 56 87" stroke-width="7.5" opacity="0.9"/>
    <path d="M43 68 C38 55 48 47 43 34" stroke-width="3.2" opacity="0.5"/>
    <circle cx="43" cy="30" r="2.2" fill="${AMARILLO}" stroke="none" opacity="0.5"/>
    <path d="M57 70 C52 56 62 48 57 35" stroke-width="4.6"/>
    <circle cx="57" cy="30" r="3" fill="${AMARILLO}" stroke="none"/>`, 2.3),

  // A tamaño pequeño la voz tenue no llega: se queda una sola, centrada.
  circuloEcoMini: envoltorio(`    <path d="M44 12 A39 39 0 0 0 44 88" stroke-width="12.5"/>
    <path d="M56 12 A39 39 0 0 1 56 88" stroke-width="9" opacity="0.9"/>
    <path d="M50 68 C45 55 55 47 50 34" stroke-width="10"/>
    <circle cx="50" cy="28" r="5" fill="${AMARILLO}" stroke="none"/>`, 2.6),
});

// Una marca puede tener versión reducida para los tamaños pequeños: a 16 px
// el detalle interior se convierte en una mancha y conviene simplificar.
const REDUCIDAS = {
  abrazo: 'abrazoMini',
  abrazo2: 'abrazoMini',
  abrazo3: 'abrazoMini',
  abrazoEco: 'abrazoEcoMini',
  circuloEco: 'circuloEcoMini',
  circuloFino: 'circuloEcoMini',
};

async function generar(marca) {
  const svg = MARCAS[marca];
  if (!svg) { console.error(`No existe la marca "${marca}". Opciones: ${Object.keys(MARCAS).join(', ')}`); process.exit(1); }

  // Hasta 48 px se usa la versión reducida si la marca tiene una; a partir
  // de 96 px, la completa. El navegador elige según el atributo sizes.
  const mini = REDUCIDAS[marca] ? MARCAS[REDUCIDAS[marca]] : svg;

  for (const lado of TAMANOS) {
    await sharp(Buffer.from((lado <= 48 ? mini : svg).replace(/LADO/g, lado)))
      .png({ compressionLevel: 9 }).toFile(path.join(IMG, `favicon-${lado}.png`));
  }
  await sharp(Buffer.from(svg.replace(/LADO/g, 180)))
    .png({ compressionLevel: 9 }).toFile(path.join(IMG, 'apple-touch-icon.png'));

  console.log(`Iconos generados con la marca "${marca}"` +
    (REDUCIDAS[marca] ? ` (reducida "${REDUCIDAS[marca]}" hasta 48 px)` : '') + ':');
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
