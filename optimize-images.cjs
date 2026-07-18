// optimize-images.cjs — comprime y convierte imágenes a WebP
// Uso: node optimize-images.cjs
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const INPUT_DIR = path.join(__dirname, 'assets', 'images');
const ORIGINALS_DIR = path.join(__dirname, '_originals');

// Configuración de cada imagen (ancho máximo, calidad WebP)
const config = [
  { file: 'enara.png',            maxW: 900,  webpQ: 82 },
  { file: 'jose.png',             maxW: 900,  webpQ: 82 },
  { file: 'Enara y jose 1.JPG',   maxW: 1200, webpQ: 82 },
  { file: 'Enara y jose 2.JPG',   maxW: 1200, webpQ: 82 },
  { file: 'set-01.jpg',           maxW: 1400, webpQ: 84 },
  { file: 'Set-02.jpg',           maxW: 1400, webpQ: 84 },
];

async function run() {
  // Crear carpeta de originales
  if (!fs.existsSync(ORIGINALS_DIR)) fs.mkdirSync(ORIGINALS_DIR, { recursive: true });

  for (const item of config) {
    const srcPath = path.join(INPUT_DIR, item.file);
    if (!fs.existsSync(srcPath)) {
      console.warn(`⚠️  No encontrado: ${item.file}`);
      continue;
    }

    // 1. Guardar original
    const origDest = path.join(ORIGINALS_DIR, item.file);
    if (!fs.existsSync(origDest)) {
      fs.copyFileSync(srcPath, origDest);
      console.log(`📦 Original guardado: ${item.file}`);
    }

    const ext = path.extname(item.file).toLowerCase();
    const baseName = path.basename(item.file, ext);

    // 2. Generar WebP
    const webpOut = path.join(INPUT_DIR, baseName + '.webp');
    await sharp(srcPath)
      .resize({ width: item.maxW, withoutEnlargement: true })
      .webp({ quality: item.webpQ })
      .toFile(webpOut);

    // 3. Generar fallback JPEG/PNG optimizado (mismo nombre, misma extensión)
    const fallbackOut = srcPath;
    const img = sharp(srcPath).resize({ width: item.maxW, withoutEnlargement: true });

    if (ext === '.png') {
      await img.png({ compressionLevel: 9, quality: 85 }).toFile(fallbackOut + '.tmp');
    } else {
      await img.jpeg({ quality: 82, progressive: true, mozjpeg: true }).toFile(fallbackOut + '.tmp');
    }

    // Renombrar tmp → original
    fs.renameSync(fallbackOut + '.tmp', fallbackOut);

    const sizeBefore = fs.statSync(origDest).size;
    const sizeWebP = fs.statSync(webpOut).size;
    const sizeFallback = fs.statSync(fallbackOut).size;

    console.log(
      `✅ ${item.file}: ` +
      `${(sizeBefore/1024).toFixed(0)}KB → WebP: ${(sizeWebP/1024).toFixed(0)}KB | ` +
      `Fallback: ${(sizeFallback/1024).toFixed(0)}KB`
    );
  }

  console.log('\n🎉 Optimización completada.');
}

run().catch(err => { console.error('Error:', err); process.exit(1); });
