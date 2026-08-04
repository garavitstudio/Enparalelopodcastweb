// Añade una marca de versión a los recursos locales para que los
// navegadores descarguen los cambios.
//
// Hace falta porque en vercel.json todo lo que cuelga de /assets se sirve
// como "immutable" durante un año: sin cambiar la URL, el navegador no
// vuelve a pedir el archivo aunque su contenido sea distinto. Esto incluye
// las imágenes, no solo el CSS y el JavaScript.
const fs = require('fs');
const path = require('path');

const dir = __dirname;

// Las páginas de episodio viven en su propia carpeta y también hay que
// versionarlas: si no, se quedan pidiendo el CSS de la versión anterior.
const files = [
  ...fs.readdirSync(dir).filter(f => f.endsWith('.html')),
  ...(fs.existsSync(path.join(dir, 'episodios'))
    ? fs.readdirSync(path.join(dir, 'episodios'))
        .filter(f => f.endsWith('.html'))
        .map(f => path.join('episodios', f))
    : []),
];
const stamp = Date.now();

// Solo rutas relativas (las que abren justo tras la comilla del atributo).
// Así no se tocan las URLs absolutas de las etiquetas para redes sociales,
// que deben quedar limpias al compartir el enlace.
// Las páginas de episodio enlazan con /assets, con barra inicial.
const IMAGENES = /(?<=["'])(\/?assets\/images\/[\w .-]+?\.(?:webp|jpe?g|png|svg|gif))(\?v=[\w.]+)?/g;

let total = 0;
for (const file of files) {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Marcador de las páginas recién generadas
  content = content.replace(/__V__/g, String(stamp));
  content = content.replace(/__VER__/g, String(stamp));

  content = content.replace(/\.css(\?v=\d+)?"/g, `.css?v=${stamp}"`);
  content = content.replace(/\.js(\?v=\d+)?"/g, `.js?v=${stamp}"`);
  content = content.replace(IMAGENES, (m, ruta) => {
    total++;
    return `${ruta}?v=${stamp}`;
  });

  fs.writeFileSync(filePath, content, 'utf8');
}

console.log(`version ${stamp} · ${total} referencias a imagenes actualizadas`);
