# Plan de posicionamiento — En Paralelo Podcast

Investigación y auditoría de agosto de 2026. Recoge lo que ya está hecho, lo
que he implementado y lo que tienes que hacer tú a mano.

---

## Lo primero: dos creencias que había que corregir

Antes de nada, dos cosas que dábamos por buenas y la investigación desmiente.
Las digo primero porque cambian dónde merece la pena invertir el esfuerzo.

**1. El `llms.txt` no lo lee prácticamente nadie.** A fecha de 2026, ninguna
de las grandes (OpenAI, Google, Anthropic, Meta) se ha comprometido a leerlo
en producción, y los rastreadores (GPTBot, ClaudeBot, PerplexityBot) lo
ignoran y van directos al HTML. Google confirmó en julio de 2025 que no lo
soporta ni piensa hacerlo. Lo mantenemos porque cuesta cero y no molesta,
pero **no es una ventaja**: lo que te cita una IA es tu HTML.

**2. Los resultados enriquecidos de FAQ desaparecieron en mayo de 2026** y
Google ha dicho de forma explícita que **no hace falta ningún schema especial
para salir en AI Overviews ni en AI Mode**. No hay atajo de marcado. Lo que
decide es el contenido.

Conclusión: nada de perseguir trucos de marcado. Lo que mueve la aguja es
tener páginas propias con contenido real, y que Google y Bing las indexen.

---

## El hallazgo principal de la auditoría

**La web no tenía ni una sola página de episodio.** Todo el contenido apuntaba
a YouTube.

Eso significa que cuando alguien buscaba «Antonio Hidalgo entrevista» o
«podcast educador canino», el que podía posicionar era YouTube, no
`enparalelopodcast.com`. Tu dominio no tenía nada que ofrecer a esa búsqueda.

Según la investigación, para posicionar un podcast en 2026 hace falta
**una página por episodio con transcripción, schema y enlazado interno**. Los
buscadores no pueden rankear un audio: rankean texto.

Eso es lo que he construido.

---

## Lo que he implementado

### Páginas de episodio (lo más importante)

Seis páginas nuevas, una por episodio, en `/episodios/<nombre>`:

| Episodio | URL |
|---|---|
| Carlos Adams | `/episodios/carlos-adams-legado-libertad` |
| Cristina, enfermera | `/episodios/cristina-enfermera-sanidad-espana` |
| Antonio Hidalgo | `/episodios/antonio-hidalgo-globalia-air-europa` |
| Ángel Llanos | `/episodios/angel-llanos-autoconocimiento` |
| Mateo Serrano | `/episodios/mateo-serrano-educador-canino` |
| Álvaro Ortín | `/episodios/alvaro-ortin-empresa-1948` |

Cada una lleva:

- **Un resumen destacado al principio**, escrito para que se pueda citar tal
  cual. Es exactamente lo que un ChatGPT o un Perplexity extraen cuando
  responden a alguien.
- **Cuatro bloques de «de qué hablamos»** con encabezados propios: dan a
  Google materia para posicionar por temas concretos, no solo por el nombre.
- **Ficha del invitado**, fecha real de publicación y duración real.
- **Schema `PodcastEpisode` completo**: serie, invitado, presentadores,
  duración, fecha, miniatura y palabras clave.
- **Enlaces entre episodios** (anterior / siguiente / todos): reparten
  autoridad dentro del dominio en vez de mandarla fuera.
- El vídeo **solo carga al pulsar**, así la página es rápida.

### Lo demás

- **Índice en `/episodios`** con todos, y enlace nuevo en el menú de las
  8 páginas.
- **Sitemap de 8 a 15 URLs**, con fechas reales de cada episodio.
- El sistema de versionado de archivos ahora cubre la carpeta nueva.

---

## LO QUE TIENES QUE HACER TÚ

Ordenado por impacto. Los tres primeros valen más que todo lo demás junto.

### 1. Dar de alta la web en Google Search Console — 15 min

Sin esto, Google tarda semanas o meses en enterarse de que existes.

1. Entra en <https://search.google.com/search-console>
2. «Añadir propiedad» → **Prefijo de URL** → `https://enparalelopodcast.com`
3. Verifica con el método **Etiqueta HTML**: te dará una línea tipo
   `<meta name="google-site-verification" content="...">`. **Pásamela y la
   pongo**, o pégala tú en el `<head>` de `index.html`.
4. Ya dentro: **Sitemaps** → escribe `sitemap.xml` → Enviar.
5. **Inspección de URLs** → pega cada una de las 6 páginas de episodio →
   «Solicitar indexación». Una a una. Es lo que acelera que aparezcan.

### 2. Dar de alta la web en Bing Webmaster Tools — 10 min

**Esto es lo que te mete en ChatGPT.** ChatGPT Search usa el índice de Bing:
si Bing no te tiene, no puedes salir en una respuesta suya, por muy bien que
estés en Google. Un estudio de Seer Interactive encontró que **el 87% de las
citas de ChatGPT coinciden con los mejores resultados orgánicos de Bing**.

1. Entra en <https://www.bing.com/webmasters>
2. Elige **«Importar desde Google Search Console»** (hazlo después del paso 1
   y te ahorras la verificación entera)
3. Envía el sitemap igual que en Google
4. Activa **IndexNow** en los ajustes: indexa páginas nuevas en minutos

### 3. Publicar las transcripciones — es tu mayor palanca

Es el trabajo más aburrido y el que más rinde. Una transcripción convierte un
episodio de tres horas en **miles de palabras indexables**, con todas las
formas en que la gente busca de verdad esos temas. Es el multiplicador número
uno del SEO de un podcast.

**Cómo sacarlas gratis:** YouTube ya las genera. Entra en YouTube Studio →
Subtítulos → el episodio → descarga el archivo. O en el vídeo público:
«Más» → «Mostrar transcripción» → copiar.

**Qué hacer con ellas:** pásamelas y las incorporo a cada página de episodio
con el formato correcto (limpias, con marcas de tiempo y su marcado). No las
pegues en bruto: hay que quitarles la muletilla y separarlas por bloques, o
quedan ilegibles y penalizan.

Si solo puedes hacer una, empieza por **Cristina (la enfermera)**: es el tema
con más búsquedas reales detrás (ratios de enfermería, irse a trabajar fuera).

### 4. Optimizar dentro de Spotify y Apple — 30 min

Los buscadores internos de las plataformas son un canal de descubrimiento
enorme y funcionan por palabras clave, no por calidad.

- **Nombre del programa en Apple/Spotify**: ahora es «EN PARALELO», que no
  dice a nadie de qué va. Considera **«En Paralelo | Podcast de
  autoconocimiento y conversaciones sin guion»** o similar. En Apple, la
  palabra clave en el nombre del show es el factor que más pesa.
- **Descripción del programa**: que las palabras que quieres posicionar
  («autoconocimiento», «espiritualidad», «crecimiento personal»,
  «conversaciones profundas») aparezcan de forma natural varias veces a lo
  largo del texto, sobre todo en las dos primeras frases.
- **Títulos de episodio**: incluye siempre el nombre del invitado y el tema.
  «Enfermera: en España te sueltan sola con 15 pacientes» está muy bien.

### 5. Construir la entidad de marca — a fuego lento

Google necesita entender que «En Paralelo» es una cosa concreta. Cuantas más
señales coherentes encuentre, antes te reconoce y antes te menciona una IA.

- **Crea una entrada en Wikidata** (<https://www.wikidata.org>): es gratis,
  público y es una de las fuentes que más peso tiene para el Knowledge Graph
  de Google. Ficha del podcast con presentadores, fecha de inicio, género y
  enlaces oficiales.
- **Que tu nombre aparezca escrito igual en todas partes.** Si en un sitio
  eres «Selu», en otro «José Luis Garavito» y en otro «Jose Luis», Google ve
  tres personas. Elige una forma principal y sé constante.
- **Consigue menciones.** Que otros podcasts, medios o webs os nombren y
  enlacen. Un intercambio de invitados con otro podcast del nicho vale más
  que cien horas de retoques técnicos.

### 6. Verificar que todo va bien — 5 min, dentro de una semana

- Busca en Google: `site:enparalelopodcast.com` — te dirá cuántas páginas
  tiene indexadas. Deberían ir apareciendo las 15.
- Pregúntale a ChatGPT y a Perplexity: «¿qué es el podcast En Paralelo?»,
  «podcast español de autoconocimiento». Anota si te citan. Repite en un mes
  y compara: ese es tu marcador real.

---

## Lo que NO conviene hacer

- **Comprar enlaces.** Es el camino corto a una penalización.
- **Meter palabras clave a la fuerza** en los textos. Google lo detecta y el
  copy con voz propia que tenéis es un activo, no lo estropees.
- **Duplicar el contenido del episodio** en varias URLs parecidas. Mejor una
  página buena que cinco mediocres.
- **Obsesionarse con el marcado.** Ya está bien resuelto. El margen ahora
  está en el contenido y en las menciones externas.

---

## Resumen en una frase

Lo técnico ya está: la web está bien construida, es rápida, segura y ahora
tiene páginas propias por episodio con su marcado. **Lo que falta es de
gestión, no de código**: darte de alta en Google y en Bing, publicar las
transcripciones y conseguir que te nombren desde fuera.

---

## Fuentes consultadas

- [GEO 2026: cómo conseguir citas en ChatGPT y Perplexity](https://www.enrichlabs.ai/blog/generative-engine-optimization-geo-complete-guide-2026)
- [SEO para podcasts 2026: páginas de episodio y transcripciones](https://neuronwriter.com/podcast-seo-2026-episodes-ranked-google/)
- [Bing Webmaster Tools y visibilidad en ChatGPT](https://www.blogseo.io/blog/bing-webmaster-tools-ai-search-visibility-2025)
- [llms.txt: la guía honesta de 2026](https://seeklab.io/blog/what-is-llmstxt-the-honest-2026-guide/)
- [Google retira los resultados enriquecidos de FAQ (mayo 2026)](https://www.seostrategy.co.uk/learn/faq-schema-deprecation-2026-rich-result-vs-schema/)
- [Entidades SEO y Knowledge Graph](https://yakyak.tv/entidades-seo/)
- [Optimización de búsqueda en Spotify y Apple Podcasts (PSO)](https://joseantoniogelado.com/2026/01/12/como-funciona-la-busqueda-en-apple-podcasts-y-spotify/)
