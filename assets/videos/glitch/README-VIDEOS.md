# Vídeos para Efecto CRT Glitch Fantasma

Esta carpeta (`assets/videos/glitch/`) es el directorio donde debes guardar los vídeos que aparecerán brevemente como interferencias o "señales perdidas" en el fondo de la web.

## Nuevo Sistema Automático de Optimización

Para que la web no se hunda con el peso de los vídeos (1-2 minutos en alta calidad pesarán más de 100MB), he programado un script que hace todo el trabajo "sucio" por ti. Sigue este flujo paso a paso:

### PASO 1: Deja tus vídeos originales aquí
1. Arrastra todos tus vídeos pesados originales (con audio, en 4K, en 1080p, MP4 o MOV...) y suéltalos en la carpeta llamada `_raw/` que está justo aquí:
   📂 `assets/videos/glitch/_raw/`

### PASO 2: Nombres secuenciales (Opcional pero Recomendado)
1. Para tenerlo todo ordenado, renombra tus vídeos allí mismo a: `video1.mp4`, `video2.mp4`...

### PASO 3: Ejecutar el Optimizador Mágico
1. Abre tu terminal (consola) en VS Code, asegúrate de estar en la carpeta de tu proyecto.
2. Escribe este comando y pulsa Enter:
   👉 `npm run optimize-videos`

⏳ **¿Qué está pasando?**
El script cogerá tus vídeos originales de `_raw/`, les eliminará la pista de audio (Mute absoluto), bajará su resolución a 480p (ideal para el efecto CRT VHS), reducirá los fotogramas a 24fps para darle toque de cine, y los comprimirá a lo bestia. ¡Tus archivos pasarán de pesar 100MB a quizás 2MB!

### PASO 4: Resultados
1. El script exportará los vídeos terminados y optimizados y los dejará en esta misma carpeta general (`assets/videos/glitch/`), quedando de esta forma directamente accesibles por la web de producción.

### PASO 5: Actualizar la base de datos de la web
1. Ve al archivo 👉 `assets/js/background.js`.
2. Busca la línea (hacia el final) que pone `const ghostVideos = [ ... ]`.
3. Simplemente escribe los nombres de tus nuevos archivos optimizados que se han generado en esa lista (ej: `'video1.mp4', 'video2.mp4'`, etc.).

¡Y listo! Ya podrás subirlo todo a Vercel con toda tu librería de apariciones fantasma de televisor lista.
