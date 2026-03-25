const fs = require('fs');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegInstaller = require('@ffmpeg-installer/ffmpeg');

// Set the ffmpeg path from the installed binary so it works on any machine
ffmpeg.setFfmpegPath(ffmpegInstaller.path);

const rawDir = path.join(__dirname, 'assets', 'videos', 'glitch', '_raw');
const outDir = path.join(__dirname, 'assets', 'videos', 'glitch');

if (!fs.existsSync(rawDir)) {
  fs.mkdirSync(rawDir, { recursive: true });
}

// Support most common video formats
const files = fs.readdirSync(rawDir).filter(f => f.match(/\.(mp4|mov|webm|avi|mkv)$/i));

if (files.length === 0) {
  console.log('\n❌ No se han encontrado vídeos en la carpeta "assets/videos/glitch/_raw/".');
  console.log('👉 Por favor, coloca ahí tus vídeos originales y vuelve a ejecutar este comando.\n');
  process.exit(0);
}

console.log(`\n🎬 Se han encontrado ${files.length} vídeo(s) para optimizar...`);

let i = 0;

function processNext() {
  if (i >= files.length) {
    console.log('\n✅ ¡Todos los vídeos han sido optimizados y están listos para usarse!');
    console.log('📁 Carpeta de destino final: assets/videos/glitch/');
    console.log('\n👻 Recuerda actualizar el array "ghostVideos" en assets/js/background.js con los nombres de estos nuevos archivos para que la web los reproduzca.\n');
    return;
  }
  
  const file = files[i];
  const inputPath = path.join(rawDir, file);
  
  // Force output to mp4 format for best browser compatibility
  const basename = path.parse(file).name;
  const forcedOutputName = basename + '.mp4';
  const outputPath = path.join(outDir, forcedOutputName);

  console.log(`\n⏳ Procesando [${i + 1}/${files.length}]: ${file}`);
  
  ffmpeg(inputPath)
    // Remove audio track completely
    .noAudio()
    // Scale to width 854 (480p height adjusted proportionally) protecting aspect ratio
    .size('854x?')
    // Set format to mp4
    .format('mp4')
    // Fast encode, high compression (CRF 30 is low quality, perfect for CRT VHS look)
    .outputOptions([
      '-vcodec libx264', 
      '-crf 30',          // Agresive compression
      '-preset fast',     // Fast processing
      '-pix_fmt yuv420p', // Web standard pixel format
      '-r 24'             // 24 FPS for cinematic/old look and less weight
    ])
    .on('end', () => {
      console.log(`✔️ Terminado: ${forcedOutputName} -> Guardado en: assets/videos/glitch/`);
      i++;
      processNext();
    })
    .on('error', (err) => {
      console.error(`❌ Error procesando ${file}:`, err.message);
      i++;
      processNext();
    })
    .save(outputPath);
}

// Start processing sequence
processNext();
