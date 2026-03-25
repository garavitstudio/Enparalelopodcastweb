const fs = require('fs');
const https = require('https');
const path = require('path');
const TextToSVG = require('text-to-svg');

const outfitUrl = 'https://raw.githubusercontent.com/google/fonts/main/ofl/outfit/Outfit-Black.ttf';
const spaceUrl = 'https://raw.githubusercontent.com/google/fonts/main/ofl/spacegrotesk/SpaceGrotesk-SemiBold.ttf';

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    if (fs.existsSync(dest)) return resolve();
    const file = fs.createWriteStream(dest);
    https.get(url, (response) => {
      if (response.statusCode >= 300) {
        // Handle redirects if needed, but raw.githubusercontent usually doesn't redirect
        reject(new Error('Failed ' + response.statusCode));
        return;
      }
      response.pipe(file);
      file.on('finish', () => { file.close(); resolve(); });
    }).on('error', (err) => { fs.unlink(dest, () => reject(err)); });
  });
}

async function createLogo() {
  await downloadFile(outfitUrl, 'outfit.ttf');
  await downloadFile(spaceUrl, 'space.ttf');

  const tOut = TextToSVG.loadSync('outfit.ttf');
  const tSpace = TextToSVG.loadSync('space.ttf');

  // Generate paths
  // "EN"
  const enPath = tOut.getPath('EN', { x: 0, y: 0, fontSize: 80, attributes: { fill: '#d4ff61' }});
  // "PARALELO"
  const paraPath = tOut.getPath('PARALELO', { x: 130, y: 0, fontSize: 80, attributes: { fill: '#ffffff' }});
  // "PODCAST"
  const podPath = tSpace.getPath('PODCAST', { x: 135, y: 35, fontSize: 22, attributes: { fill: '#00e5ff', 'letter-spacing': '0.35em' }});

  // Calculate widths to perfectly center or align
  // Output a clean SVG
  const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-10 -80 620 160" width="100%" height="100%">
  <defs>
    <!-- Multi-layered neon glow for 'EN' -->
    <filter id="neonYellow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="2" result="blur1" />
      <feGaussianBlur stdDeviation="6" result="blur2" />
      <feGaussianBlur stdDeviation="15" result="blur3" />
      <feMerge>
        <feMergeNode in="blur3" />
        <feMergeNode in="blur2" />
        <feMergeNode in="blur1" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
    
    <filter id="neonBlue" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="1.5" result="blur1" />
      <feGaussianBlur stdDeviation="4" result="blur2" />
      <feMerge>
        <feMergeNode in="blur2" />
        <feMergeNode in="blur1" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
    
    <filter id="glowWhite" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="2" result="blur1" />
      <feMerge>
        <feMergeNode in="blur1" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
  </defs>

  <g filter="url(#neonYellow)">
    ${enPath.replace('<path ', '<path class="en" ')}
  </g>
  
  <g filter="url(#glowWhite)">
    ${paraPath.replace('<path ', '<path class="para" ')}
  </g>
  
  <g filter="url(#neonBlue)">
    ${podPath.replace('<path ', '<path class="pod" ')}
  </g>
</svg>`;

  fs.writeFileSync('assets/images/logo.svg', svgContent);
  console.log('Logo SVG created successfully.');
}

createLogo().catch(console.error);
