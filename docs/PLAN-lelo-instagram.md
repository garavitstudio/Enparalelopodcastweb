# PLAN — «Habla con lelo» · página para Instagram

> Documento de trabajo. Aquí está **qué** se va a construir y **por qué**, no el código.
> Sirve para dárselo a Claude Code y ejecutarlo por fases.
>
> Estado: pendiente de aprobar. Fase elegida: **Fase 1 (página + backend)**.

---

## 1. Qué es

Una página **independiente** del resto de la web, pensada para ser el enlace de la bio de
Instagram y de las stories. No es una sección más: es una experiencia cerrada, vertical, de
móvil, que se abre, se juega y termina en algo útil.

La idea en una frase: **lelo se baja las gafas, te pregunta cómo andas, y termina
mandándote al minuto exacto de los episodios donde alguien habló justo de eso.**

- Ruta pública: `/lelo` (alternativas: `/hola`, `/panda`). Con `cleanUrls` ya funciona sin `.html`.
- `noindex` en la propia página, igual que `form_COMHIS.html`, para que no compita en Google
  con las páginas de verdad. Lo que la posiciona es Instagram, no el buscador.
- Sin cabecera ni pie de la web. Pantalla completa, `100dvh`, cero scroll entre pasos.
  Al final, un enlace discreto a la web principal.
- Diseño: el mismo idioma visual que ya tienes (glass, `--neon-yellow #ffed4a`, CRT,
  Outfit/Inter/Space Grotesk), pero en clave **de juego**: el cuadro de opciones es una
  consola, no un formulario.

### El navegador de Instagram manda

La mitad de la gente abrirá esto dentro del navegador integrado de Instagram, que es un
entorno con reglas propias. Esto no es un detalle: condiciona decisiones.

- Nada de audio con sonido en automático. Si suena algo, que sea tras un toque.
- `100vh` miente ahí dentro → `100dvh` con fallback.
- Los vídeos de fondo pesados van fatal en ese navegador. En esta página: fondo CRT ligero
  (CSS/canvas), **sin** los `.mp4` de glitch.
- El teclado al escribir tapa media pantalla → el paso de escribir tiene que colocar el
  textarea arriba y el botón visible.
- Añadir `?utm_source=instagram&utm_medium=bio` en los enlaces que publiques, para saber
  qué funciona.

---

## 2. El recorrido, pantalla a pantalla

Cinco pasos. Uno cada vez, sin scroll, con transición.

### Paso 0 — Entrada

lelo entra saltando (reutilizando la física que ya tiene), se planta en el centro, **se baja
las gafas** (la pose `caught` que ya está hecha en `panda.css`) y suelta el bocadillo:

> «Ey. ¿Qué tal andas?»

Un solo botón: **Depende del día…** → paso 1.
Si el sistema pide `prefers-reduced-motion`, lelo aparece ya colocado, sin saltos.

### Paso 1 — El cuadro de opciones (la parte «juego»)

Una rejilla de fichas grandes, tocables con el pulgar, dentro de un marco tipo consola.
Cada ficha es una **intención**. Propuesta de fichas (los textos hay que afinarlos contigo):

**Quiero algo concreto**
- 🎙️ Quiero sentarme en En Paralelo *(ser invitado/a)*
- 🤝 Quiero patrocinar el podcast

**Ando así**
- 🌫️ Me siento perdido/a
- 🫩 Estoy embajonado/a
- 🌀 Tengo la cabeza a mil
- 🎭 Cansado/a de fingir que estoy bien
- 🪫 Sin ganas de nada
- 😰 Con miedo a dar el paso
- 🔥 En racha, todo fluye
- 🧭 No sé qué quiero hacer con mi vida
- 💔 Con el corazón hecho polvo
- ✨ Solo quiero escuchar algo que me remueva

**Comodín**
- ✍️ Otra cosa *(escribo yo)*

Detalles que importan:
- Se elige **una**. Al tocarla, lelo reacciona (gesto + una línea corta, distinta por ficha).
- Las dos primeras (invitado / patrocinador) llevan a un camino distinto — ver §3.
- Navegable con teclado y con `aria-pressed`. Accesible de verdad, no de mentira.
- El emoji acompaña, pero el texto se entiende sin él.

### Paso 2 — La pregunta abierta

lelo repregunta **en función de lo que hayan tocado**. Estas preguntas las escribes tú
(una por ficha), no las genera la IA: son doce frases, y así te aseguras el tono, no
cuestan nada y no fallan nunca.

Ejemplos del tipo de frase:
- Embajonado/a → «¿Y desde cuándo estás así? Cuéntamelo como si no me conocieras.»
- Perdido/a → «¿Perdido en qué? ¿En el curro, en la gente, en ti?»
- Cabeza a mil → «¿Qué es lo que no para de dar vueltas ahí dentro?»
- En racha → «Cuéntame qué está saliendo bien, que eso también se comparte.»

Debajo: un `textarea` (máx. ~600 caracteres, contador visible), botón **Enviar**, y un
«prefiero no contarlo» que salta directo a la respuesta con lo poco que sabemos.

### Paso 3 — lelo rebusca (y aquí aparece el correo)

Al enviar, lelo dice algo tipo:

> «Dame un segundo, que me meto en los episodios a ver qué encuentro para ti.»

Y arranca una animación de búsqueda (lelo rebobinando cintas, títulos de episodios pasando).
Esa espera es **real**: por detrás está corriendo la búsqueda + la redacción, entre 3 y 8
segundos.

**A los ~3 segundos de espera**, y sin cortar la animación, entra desde abajo una tarjeta:

> «Mientras busco… ¿te dejo esto por correo también? Los martes mando una carta con lo
> que no cabe en el episodio.»
>
> `[tu@correo.com]` **Vale, mándamela** · *Ahora no me apetece*

Reglas del correo, que es lo que pediste:
- **Nunca bloquea.** El «Ahora no me apetece» pesa visualmente lo mismo que el botón.
- Si no lo deja, **recibe exactamente la misma respuesta completa**, con todos los minutos.
- Si cierra la tarjeta, no vuelve a salir en esa sesión.
- Casilla de consentimiento explícita y enlace a privacidad (RGPD, ver §7).

### Paso 4 — «Queda pendiente confirmarlo»

Si deja el correo, un cuadro corto y sin urgencia:

> «Anotado. Te he mandado un correo para confirmar que eres tú — cuando puedas y quieras,
> sin prisa. Mientras, sigue conmigo, que ya casi tengo lo tuyo.»

*(Ver §6: en Fase 1 el correo queda guardado como `pendiente`; el envío real del correo de
confirmación necesita proveedor de envío y es lo primero de la Fase 3.)*

### Paso 5 — La respuesta

Lo importante. La respuesta tiene tres partes:

1. **lelo te habla** (3–5 líneas). Recoge lo que la persona ha escrito con sus palabras,
   sin diagnosticar ni dar lecciones, y presenta lo que ha encontrado.

2. **Entre 2 y 4 tarjetas de episodio.** Cada una:
   - Episodio y quién lo dice — *«Ep. 14 · Carlos Adams»*
   - La cita, corta y literal — *«…lo único que hice fue dejar de exigirme tener ganas»*
   - Por qué te la pone — una línea que conecta con lo que ha escrito la persona
   - **`▶ Escúchalo desde el 12:34`** → enlace directo al minuto exacto
     (YouTube `&t=754s`; Spotify si tienes el enlace con marca de tiempo, si no, al episodio)

3. **El cierre.** Un párrafo que ata las referencias entre sí — no un resumen de cada una,
   sino qué tienen en común y qué haría lelo con eso.

Debajo: **Volver a empezar**, compartir, y un enlace suave a la web y a la newsletter si no
la dejó antes.

**Si no hay material bueno, lelo lo dice.** Si la búsqueda no encuentra nada que encaje de
verdad, la respuesta es honesta («de esto todavía no hemos hablado bien; apúntalo, que te
juro que sale tema para un episodio») y ofrece un episodio general. **Nunca se inventa una
cita ni un minuto.** Esto es la regla número uno de todo el sistema: una cita falsa con un
minuto falso destruye la confianza en el podcast entero.

---

## 3. Los dos caminos aparte: invitado y patrocinador

Quien toca «quiero ser invitado/a» o «quiero patrocinar» no busca consuelo, busca hablar
contigo. Su recorrido cambia a partir del paso 2:

- **Pregunta abierta distinta:** «Cuéntame quién eres y de qué te gustaría hablar» /
  «Cuéntame qué marca eres y qué te gustaría hacer con nosotros».
- **Paso 3:** aquí el correo **sí** se pide de forma normal (sin él no puedes contestarle),
  pero con el mismo tono: es su vía de contacto, no una suscripción. Consentimiento de
  newsletter aparte y opcional.
- **Paso 5:** lelo responde con lo que sí hay — cómo elegís invitados, algún episodio donde
  lo contáis — y le dice lo que pasa ahora («esto le llega a Selu y a Enara, de verdad, no
  a un buzón muerto»).
- **En base de datos** entra marcado como `lead_type = 'invitado' | 'patrocinador'`, para
  que lo veas separado de la gente que solo venía a desahogarse.

---

## 4. Cómo funciona por detrás

### 4.1 Piezas

Decidido: **Supabase** como base de datos. Con un matiz importante de seguridad:

> El navegador **nunca** habla con Supabase directamente. Habla con funciones serverless
> tuyas en `/api/*` de Vercel, y son esas funciones las que hablan con Supabase y con
> Claude.

Por qué: la clave de servicio de Supabase y la clave de Anthropic **jamás** pueden estar en
el navegador — cualquiera abre el inspector, te coge la clave de Anthropic y te gasta la
cuenta. Y así el `CSP` de `vercel.json` sigue con `connect-src 'self'`, sin abrir dominios
externos. Supabase te da el Postgres, el `pgvector`, el panel para mirar los datos y las
copias de seguridad; Vercel pone la puerta.

```
Navegador (/lelo)
   │  fetch a mismo origen
   ▼
/api/*  (Vercel Functions)          ← aquí viven las claves
   ├── Supabase (Postgres + pgvector)   datos y búsqueda
   └── Claude API                        redacción de la respuesta
```

### 4.2 Endpoints de la Fase 1

| Endpoint | Qué hace |
|---|---|
| `POST /api/lelo/session` | Abre sesión anónima, devuelve un id. Sin cookies de rastreo. |
| `POST /api/lelo/ask` | Recibe ficha + texto. Busca, compone y devuelve la respuesta con citas y minutos. |
| `POST /api/lelo/email` | Guarda el correo como `pendiente` + consentimiento + origen. |
| `POST /api/lelo/lead` | Guarda invitado/patrocinador. |

### 4.3 Tablas (Fase 1)

- **`episodes`** — nº, título, invitado, fecha, duración, `youtube_url`, `spotify_url`, resumen.
- **`transcript_chunks`** — `episode_id`, texto, `speaker`, `start_ms`, `end_ms`, `embedding vector`.
  El `start_ms` es lo que se convierte en el «minuto exacto». Índice `ivfflat`/`hnsw`.
- **`sessions`** — id anónimo, ficha elegida, timestamps, país aproximado, user-agent. Sin IP en claro.
- **`messages`** — lo que escribió la persona + la respuesta que se le dio + qué chunks se usaron.
  Esto es oro: al mes ves de qué habla la gente y sabes qué episodio grabar.
- **`subscribers`** — correo, `status` (`pendiente` / `confirmado` / `baja`), consentimiento, origen, token de confirmación.
- **`leads`** — invitado/patrocinador: correo, nombre, texto, `lead_type`, estado.
- **`usage_log`** — coste y tokens por consulta, para el tope de gasto.

RLS activado en todas y **acceso solo con la service key desde `/api`**. Ninguna tabla
expuesta con la clave pública.

### 4.4 Cómo se consigue el minuto exacto (la parte crítica)

Tienes SRT/VTT con tiempos, y también el SRT pasado a `.txt` manteniendo los tiempos.
Perfecto: es el escenario bueno, el minuto sale del propio archivo, no hay que estimarlo.

1. **Ingesta.** Un script (`npm run ingest`) lee los archivos de una carpeta local
   (`_transcripts/`, fuera de git), detecta el formato (SRT, VTT o tu `.txt` con tiempos) y
   los normaliza.
2. **Troceado.** Las líneas de subtítulo son demasiado cortas para tener sentido. Se agrupan
   en fragmentos de **~45–70 segundos con solapamiento**, respetando los cambios de tema y
   guardando el `start_ms` del **primer** subtítulo del fragmento. Ese es el minuto al que
   se manda a la gente — con 5–8 segundos de margen antes, para que la frase entre en contexto.
3. **Embeddings.** Cada fragmento se vectoriza. Ojo: el contenido es en español, así que hay
   que usar un modelo multilingüe decente (ver decisión pendiente en §8).
4. **Búsqueda híbrida.** Con lo que escribe la persona se hace: (a) búsqueda vectorial y
   (b) búsqueda de texto completo en español de Postgres. Se fusionan, se cogen ~30–40
   fragmentos y se quitan los repetidos del mismo episodio.
5. **Selección.** Claude recibe esos fragmentos **con sus tiempos y su episodio**, y tiene
   una única salida válida: un JSON con las 2–4 referencias elegidas, cita literal incluida,
   y el `chunk_id` de cada una.
6. **Verificación.** El servidor comprueba que cada `chunk_id` existe, que la cita está de
   verdad dentro de ese fragmento y que el timestamp es el del fragmento. **El timestamp lo
   pone el servidor, no el modelo.** Si algo no cuadra, esa referencia se cae. Así es
   imposible que se invente un minuto.
7. **Redacción.** Con las referencias ya verificadas, Claude escribe el texto de lelo y el
   cierre.

Modelo: `claude-sonnet-5` para la redacción (rápido y suficiente para esto).
Coste estimado por consulta: unos **0,01–0,03 €**. Con tope diario configurable y aviso.

### 4.5 Que no te la líen

- **Límite por IP**: p. ej. 5 consultas / 15 min, 20 / día. Almacenado en Supabase.
- **Tope de gasto diario**: al llegar, lelo dice que está durmiendo y ofrece la newsletter.
- **Longitud máxima** de entrada y filtro de inyección de prompt (el texto del usuario va
  siempre delimitado y con instrucción explícita de tratarlo como contenido, no como orden).
- **Honeypot** en el campo de correo + validación real del formato.
- Si esto se llena de spam, se añade Cloudflare Turnstile (invisible). No de entrada.

### 4.6 Salud mental: esto no es opcional

Vas a tener a gente escribiendo «estoy embajonado» a las tres de la mañana. Antes de
cualquier búsqueda, un filtro detecta señales de crisis (ideación suicida, autolesión,
violencia, menores en riesgo). Si salta:

- lelo **no** responde con podcasts. Responde como una persona, corto y sin dramatizar.
- Se muestran los recursos reales: **024** (línea de atención a la conducta suicida, España,
  gratuita y 24 h) y **112**.
- Se guarda que ocurrió, pero **no** se usa para nada más.

Y en el pie de la respuesta, siempre, una línea pequeña: *«lelo es un panda con acceso a
nuestros episodios, no un profesional. Si lo estás pasando mal de verdad, habla con alguien.»*

---

## 5. Qué se reutiliza de lo que ya hay

- **El sprite de lelo**: el SVG está incrustado dentro de `assets/js/panda.js`. Se extrae a
  un módulo compartido (`assets/js/lelo-sprite.js`) que usan las dos páginas, para que no
  haya dos pandas que se desincronicen. Cambio pequeño y sin riesgo en la web actual.
- **Las poses**: `caught` (gafas bajadas + cejas + mirada) ya está en `panda.css` y es
  exactamente lo que pediste para el arranque. Hay que añadir 2–3 poses nuevas:
  «pensando/rebuscando», «contento» y «escuchando».
- **El bocadillo** `.lelo-bubble` ya tiene el estilo cómic. Se reutiliza tal cual.
- **Tokens de diseño** de `global.css` y las fuentes autoalojadas.
- Archivos nuevos: `lelo.html`, `assets/css/lelo.css`, `assets/js/lelo.js`, `api/lelo/*`.
- `vercel.json`: añadir la ruta y revisar cabeceras. `sitemap.xml`/`robots.txt`: excluida.

---

## 6. Fases

### Fase 1 — lo que has elegido
1. Página `/lelo` completa, los 5 pasos, con datos simulados. *(Ya se puede enseñar.)*
2. Proyecto Supabase + tablas + `pgvector`.
3. Script de ingesta de transcripciones por línea de comandos (`npm run ingest`).
4. Funciones `/api/lelo/*` con búsqueda híbrida, verificación de citas y respuesta de Claude.
5. Guardado de correos y leads en **tu** base de datos.
6. Límites, tope de gasto, filtro de crisis y textos legales.

> **Ojo con una cosa:** el cuadro de «queda pendiente confirmar el correo» sale en Fase 1,
> pero **el correo de confirmación no se envía** hasta la Fase 3, porque hace falta un
> proveedor de envío (Resend) y tocar los DNS del dominio. Dos opciones: (a) dejar el texto
> como «te escribiremos para confirmarlo» y cumplirlo en Fase 3, o (b) adelantar solo el
> envío de confirmación a la Fase 1 — es alrededor de media jornada más y necesita que
> tengas el dominio definitivo. **Recomiendo (b) si ya tienes dominio propio**, porque
> guardar correos que nunca confirman envejece mal.

### Fase 2 — Tu panel
Zona privada (`/admin`, con login) para subir episodios y transcripciones desde el navegador
en vez de por consola, ver las conversaciones, exportar correos y ajustar el tope de gasto.

### Fase 3 — Correo y migración
Proveedor de envío, doble opt-in de verdad, bajas, y sacar de Formspree los formularios de
comunidad, invitados, patrocinadores y COMHIS hacia tu base de datos.

---

## 7. Legal (rápido pero necesario)

Estás guardando cómo se siente la gente, con su correo al lado. Eso es serio:

- Actualizar `privacidad.html`: nuevo tratamiento, Supabase y Anthropic como encargados,
  base legal (consentimiento), plazo de conservación, y que los textos se usan de forma
  agregada para decidir temas de episodios.
- Consentimiento **separado**: uno para la newsletter, otro para el tratamiento del texto.
- No guardar IP en claro (hash con sal) y borrado automático de los textos pasado un plazo
  (propongo 12 meses).
- Derecho de supresión: que baste con escribir a tu correo.

---

## 8. Lo que necesito de ti para arrancar

**Cuentas y claves** (a variables de entorno en Vercel, nunca al repo):
- [ ] Proyecto Supabase creado → URL, `anon key`, `service_role key`
- [ ] Clave de API de Anthropic
- [ ] Clave del proveedor de embeddings *(ver decisión abajo)*
- [ ] Dominio definitivo, si ya lo tienes

**Contenido:**
- [ ] Carpeta con los SRT/VTT/`.txt` de todos los episodios
- [ ] Una hoja con: nº, título, invitado, fecha, URL de YouTube, URL de Spotify
- [ ] ¿Los subtítulos distinguen quién habla? Si no, hay que decidir si te importa que la
      cita diga «en el episodio 14» en vez de «Carlos Adams dijo»

**Decisiones pendientes:**
1. **Embeddings.** Anthropic no los ofrece, hay que elegir proveedor. Recomiendo
   **Voyage** (`voyage-3`, es el que recomienda la propia Anthropic y va bien en español) o
   **OpenAI** (`text-embedding-3-small`, más barato y más conocido). Coste de vectorizar
   todo el catálogo: céntimos, se hace una vez.
2. **Correo de confirmación en Fase 1 o Fase 3** (ver el aviso de §6).
3. **Ruta**: `/lelo`, `/hola` u otra.
4. **Las 12 fichas y las 12 preguntas**: te paso una propuesta escrita y las repasas tú.
   El tono de lelo lo pones tú, no yo.
5. **Idioma**: ¿solo español, o hay público que agradecería inglés?
6. **Tarjeta para compartir en stories** al final del recorrido: ¿la quieres? Es un buen
   motor de crecimiento, pero es trabajo extra — yo lo dejaría para Fase 2.

---

## 9. Riesgos, dichos claramente

| Riesgo | Qué hacemos |
|---|---|
| Que lelo se invente una cita o un minuto | El servidor verifica cita y timestamp contra la transcripción; si no cuadra, se cae |
| Que la espera se haga larga | Animación con contenido, y el correo aparece justo en ese hueco |
| Que alguien te vacíe la cuenta de Anthropic | Claves solo en servidor, límite por IP, tope de gasto diario |
| Que alguien escriba algo grave | Filtro de crisis previo, recursos reales, sin respuesta automática de podcast |
| Que el navegador de Instagram lo rompa | Sin vídeo pesado, `100dvh`, probado dentro de Instagram antes de publicar |
| Que el catálogo sea aún pequeño y las respuestas se repitan | lelo admite cuando no tiene material; y las conversaciones te dicen qué grabar |

---

*Cuando digas que sí, se ejecuta en el orden de la Fase 1, empezando por la página con datos
simulados para que la puedas ver funcionando antes de tocar nada de infraestructura.*
