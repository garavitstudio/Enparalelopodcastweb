# Vídeos para Efecto CRT Glitch Fantasma

Esta carpeta (`assets/videos/glitch/`) es el directorio donde debes guardar los vídeos que aparecerán brevemente como interferencias o "señales perdidas" en el fondo de la web.

## Instrucciones y Recomendaciones OBLIGATORIAS

1. **Formato:** Utiliza exclusivamente el formato `.mp4` (H.264) o `.webm` para máxima compatibilidad móvil y escritorio.
2. **Nombres de archivo:** Para que la web los detecte automáticamente, nómbralos de manera estricta y secuencial. Por defecto, he dejado programada la web para detectar el primero como:
   - `video1.mp4`
   *Nota: Si añades más vídeos (ej. `video2.mp4`, `video3.mp4`), deberás abrir el archivo `assets/js/background.js`, buscar la palabra `ghostVideos` y añadir el nombre de tu nuevo archivo a la lista que hay allí puesta.*
3. **Peso y Optimización:**
   - La resolución ideal es media/baja (ej: 1280x720 o incluso 854x480). Nadie verá el vídeo a 4K porque, debido a los filtros destructivos estilo televisor CRT y las estáticas, parecerá de muy baja calidad visual a propósito.
   - **Exporta los vídeos SIN AUDIO (Muteados en la línea de tiempo/render).** Esto reducirá el peso de forma increíble de cara al usuario final y evitará bloqueos de reproducción que ponen los navegadores web por defecto.
   - Idealmente, trata de que cada archivo no supere 1MB a 3MB de peso total.
4. **Color:** Céntrate solo en el contenido (personas, siluetas, ciudad, etc.). El filtro CSS que la web le aplica de base lo pasará a Blanco y Negro, aumentará el contraste de forma drástica, y lo mezclará con el fondo negro de la página para darle un aspecto a "aparición fantasmal sobre estática". 
   - (Aun así, si los exportas tú mismo de origen en blanco y negro, reducirás aún más su tamaño).
5. **Duración:** Sube clips cortos de entre 5 y 15 segundos. El cerebro dinámico de la web elegirá un punto aleatorio en cualquier segundo del clip, y solo mostrará en pantalla una ráfaga que dura entre 1 y 3 segundos cada vez que decida que la señal de la tele ha vuelto a fallar.
