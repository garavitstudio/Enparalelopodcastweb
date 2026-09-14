# Plan · Sistema de métricas propio para En Paralelo

Replicar en enparalelopodcast.com lo que ya funciona en Divéniz: medición propia,
mapa de calor y panel privado. Sin Google Analytics, sin terceros, sin vender nada
a nadie.

**Estado:** propuesta, pendiente del OK de Selu. Fecha: 2026-09-14.

---

## 1. De dónde partimos

### Lo que hay en Divéniz (y funciona)

| Pieza | Archivo | Qué hace |
|---|---|---|
| Medidor | `src/components/Analitica.astro` | Cola de eventos, `sendBeacon`, espera al `load` |
| Recolector | `public/api/registrar.php` | Valida, responde 204 y **luego** escribe NDJSON |
| Consentimiento | `src/data/consentimiento.ts` | Cookie de decisión + cookie de visitante |
| Origen | `src/data/origen.ts` | De qué red viene, incluido el user-agent de Meta |
| Banner | `src/components/AvisoCookies.astro` | Dos botones del mismo peso (lo pide la AEPD) |
| Panel | `public/panel/index.php` | Basic Auth, resumen, mapa de calor por iframe |

Cuatro eventos: `vista`, `scroll` (25/50/75/100 %), `clic` (con x/y en % del
documento) y `salida` (segundos). Dos niveles: uno sin cookies que corre siempre,
y uno ampliado —quién vuelve— solo con consentimiento.

### Lo que hay en En Paralelo

- **HTML estático puro.** Sin framework, sin build. `outputDirectory: "."`.
- **17 páginas:** 11 en la raíz + 6 de episodio en `episodios/`.
- **Vercel**, `cleanUrls`, dominio propio, CSP y HSTS ya puestos en `vercel.json`.
- **Cero analítica.** No hay ni gtag ni nada. Partimos de página en blanco.
- `cache-bust-assets.cjs` versiona solo cualquier `.css` y `.js` nuevo. No hay que
  tocarlo.
- Estética: negro `#080808`, amarillo neón `#ffed4a`, Outfit + Inter autoalojadas,
  paneles de cristal, fondo con glitch animado, la mascota *lelo*.

---

## 2. La diferencia que lo cambia todo

**Divéniz vive en Hostinger, que ejecuta PHP y tiene disco.** El recolector escribe
un fichero por día y el panel lo lee. Sencillo y barato.

**En Paralelo vive en Vercel, que no tiene ni PHP ni disco.** El sistema de
Divéniz no se copia: se traduce. Tres cosas hay que rehacer de raíz:

1. **Dónde se guardan los datos.** El disco de una función serverless es efímero:
   lo que escribes desaparece con la invocación.
2. **Cómo se responde rápido sin perder el evento.** El truco de PHP
   (`fastcgi_finish_request`: contestar 204 y seguir trabajando) no existe tal cual.
3. **Cómo se protege el panel.** No hay `.htaccess` ni Basic Auth de servidor.
   La protección por contraseña de Vercel es de plan Pro; el nuestro es Hobby.

---

## 3. Decisiones de arquitectura

### D1 · Almacenamiento: el Neon que el proyecto ya tiene

> **Corregida el 2026-09-14.** El plan original proponía aprovisionar Upstash Redis.
> Al ir a crearlo apareció que **el proyecto ya tiene un Neon Postgres conectado y
> sin usar**: `neon-aureolin-school`, con variables `Enparalelo_*` creadas hace 43
> días. Como la web es estática y no tiene ni una función, nunca se ha tocado.

**Por qué este y no Upstash.**

1. **Ya está.** Cero aprovisionamiento. `vercel integration add` además es
   interactivo (pide plan y región), así que habría costado tiempo de Selu.
2. **Las credenciales ya están inyectadas en el proyecto**, así que la migración la
   aplica una función desplegada. No hace falta ni contraseña de BD ni pegar SQL a
   mano en ningún panel.
3. **SQL es mucho mejor para el informe de la sección 5.** Comparar con el periodo
   anterior, agrupar por episodio, por día de la semana: eso es un `GROUP BY`. Con
   Redis habría que traerse 90 días de eventos a memoria y agregarlos en
   JavaScript, o sea megabytes por cada carga del panel.

**El recurso está vinculado también a `horarios-zuaina`** (app de La Vida es
Zuaina). Cada proyecto tiene su propio juego de variables con prefijo distinto, lo
que apunta a bases separadas dentro del mismo proyecto Neon, pero no se ha podido
confirmar: los valores descifrados no son legibles desde fuera.

**No hace falta confirmarlo.** Todo vive en un esquema propio `metricas`, así que
sea la misma base o no, las tablas quedan aisladas y no pueden colisionar con nada
de la clienta.

**Las dos trampas del cerebro que aplican aquí:** contra un pooler en modo
transacción las consultas van **en secuencia**, nunca en `Promise.all`, con `max: 1`
y `connect_timeout`; y hay que comprobar que la región de la función y la de la base
coinciden (ver D3).

**Lo que descarta.** *Vercel Blob* no sabe hacer append: dos visitas a la vez se
comerían eventos. *El Supabase de ContentFlow* se consideró —es del mismo podcast—
pero obligaría a pedirle a Selu la contraseña de BD para el DDL, y a meter en este
proyecto credenciales con acceso a la base de ContentFlow.

### D2 · El truco del 204: `waitUntil`

En PHP se responde y se sigue trabajando. En Vercel el equivalente es `waitUntil()`
de `@vercel/functions`: la respuesta sale al instante y la escritura se termina
después, con el navegador ya libre.

Esto no es un detalle de rendimiento. Sin `waitUntil` solo hay dos salidas malas:
o el navegador espera a que escribamos (y la medición entra en la ruta crítica de
carga, que es justo lo que en Divéniz costó 2,4 s), o terminamos la función antes
de escribir y **se pierde el evento en silencio**.

### D3 · Región europea

Las funciones de Vercel salen por defecto en `iad1` (Washington). Si la base está en
Europa, cada consulta cruza el Atlántico. Es la misma trampa que ya está apuntada en
el cerebro: función y datos en el mismo continente.

**La región del Neon no se sabe todavía** —sus variables no son legibles desde
fuera— así que la primera función desplegada la reporta, y con ese dato se fija
`regions` en `vercel.json`. No se fija a ciegas: apuntar a `fra1` con una base en
Virginia sería peor que dejarlo por defecto.

### D4 · El panel es una función, no un archivo

`/api/panel.js` renderiza el HTML y exige `Authorization: Basic`, comparando en
tiempo constante contra un hash guardado en variable de entorno. Un `rewrite` deja
la URL bonita: `/panel` → `/api/panel`.

> **Cuidado:** no crear nunca un `panel.html`. Los rewrites de Vercel solo se
> evalúan cuando ningún archivo estático coincide con la ruta; si existe el
> archivo, gana el archivo y el rewrite no llega a correr. Ya pasó en Garavit
> Studio Web.

### D5 · La cookie la pone el servidor, no el JavaScript

**Aquí mejoramos lo de Divéniz.** Safari e iOS limitan a **7 días** cualquier cookie
escrita desde JavaScript con `document.cookie`. Divéniz la escribe así, o sea que
en iPhone su sección de "quién vuelve" se reinicia cada semana sin que nada avise.
En un podcast, donde el tráfico de iOS es enorme, eso dejaría la mejor parte del
panel en una mentira.

La solución: el recolector devuelve la cookie del visitante con `Set-Cookie`,
`HttpOnly` y `SameSite=Lax`. Las cookies de servidor no sufren ese recorte. Además,
al no ser legible desde JavaScript, el identificador no se puede manipular desde el
navegador, y el número de visita lo lleva el servidor, que es donde debe estar.

La cookie de **decisión** (aceptar/rechazar) sí sigue en el cliente: el banner
tiene que poder leerla antes de pintarse.

### D6 · El endpoint se llama `/api/registrar`

Los bloqueadores de anuncios no tienen nada contra nosotros: bloquean listas de
dominios y de rutas conocidas. Un endpoint propio llamado `/api/analytics` o
`/api/track` sí está en esas listas genéricas. `registrar` no. Es medición propia,
en nuestro dominio, sin terceros: no hay razón para que la bloqueen, pero tampoco
para ponérselo fácil.

### D7 · Descartado: Vercel Web Analytics

Se ha mirado. No da mapa de calor, ni embudo de lectura, ni eventos propios de
episodio, y el free tier se agota rápido. Se descarta a propósito, no por olvido.

---

## 4. El matiz de "cookies en toda la web"

Selu pide cookies en todo el sitio para tener datos fiables al 100 %. La forma de
conseguirlo **no es medir solo a quien acepta** —eso daría menos datos, no más:
perderíamos a todo el que rechaza o ignora el banner, que suele ser mucha gente.

Se mantienen los dos niveles de Divéniz, pero ahora en las 17 páginas:

- **Nivel base, sin cookies, en todas las páginas y para todo el mundo.** Visitas,
  origen, dispositivo, scroll, clics, mapa de calor, tiempo. No usa almacenamiento
  en el navegador, así que no entra en el artículo 22.2 de la LSSI y no necesita
  permiso. **Este es el 100 % del tráfico.**
- **Nivel ampliado, con cookie, solo para quien acepta.** Quién vuelve, cuántas
  visitas lleva, cuánto tarda en volver, cuántas páginas ve.

La diferencia con Divéniz es que allí las landings de campaña (`/laser`, `/uva`) no
llevan banner, porque taparía la primera pantalla y costaría conversiones. Aquí no
hay landings de anuncio: el banner va en todas las páginas y la capa de "quién
vuelve" cubre la web entera. Que es justo lo que pide.

> **Hay que corregir `cookies.html`.** Ahora mismo dice, literalmente, que el sitio
> «no utiliza cookies de análisis ni de seguimiento». En cuanto se instale esto,
> eso es falso. Actualizarlo es parte de la Fase 3, no un extra.

---

## 5. Lo que el panel va a contar (el informe)

Esta es la parte a la que Selu pide dedicarle más cariño. El panel de Divéniz es
correcto pero está organizado **por métrica**. El de En Paralelo se organiza **por
pregunta**, y cada bloque empieza por la respuesta en una frase.

### Estructura

**0 · Cabecera.** Periodo, comparación con el periodo anterior y una línea de
lectura: *«Semana floja: 214 visitas, un 18 % menos que la anterior. El martes
concentró el 44 %.»*

**1 · Resumen.** Cinco cifras y su variación: visitas, personas, tiempo típico,
episodios abiertos, clics a plataforma.

**2 · Quién entra.** De dónde vienen (con Instagram y Spotify separados del
directo), dispositivo, y visitas por día con el gráfico marcando los martes.

**3 · Qué escuchan.** Lo que Divéniz no tiene y aquí es lo importante: tabla por
episodio con visitas, tiempo típico, hasta dónde bajan y **clics a Spotify /
YouTube / Apple**. Esto es la conversión real de esta web: la web no retiene, la
web empuja a la plataforma.

**4 · Qué hacen.** Embudo de lectura, qué pulsan, el reproductor de la home (cuánta
gente le da al play y cuánto aguanta) y el formulario de comunidad.

**5 · Quién vuelve.** Solo de quien acepta cookies, con el porcentaje de visitas que
representa bien visible para que no se lea como si fuera el total.

**6 · Mapa de calor.** Por página y por dispositivo.

**7 · Detalle y mantenimiento.** Tablas crudas, exportación a CSV, borrado por
página.

### El eje propio: el martes

El podcast publica **los martes a las 6:00**. Eso convierte el día de la semana en
un eje analítico de verdad, no en un adorno: cuánto dura el empujón de un episodio
nuevo, si el tráfico del martes cae con las semanas, si un episodio concreto se
sale de la media. Ninguna herramienta genérica sabe esto; la nuestra sí.

### Lectura en lenguaje natural

Un bloque de frases generadas **por reglas**, no por IA: deterministas, auditables y
gratis. Por ejemplo: «el 68 % entra desde el móvil, y ahí solo el 31 % llega a la
mitad de la página: la home es demasiado larga para un teléfono». Cada frase tiene
detrás un umbral explícito y visible en el código.

Y cuando no hay datos suficientes, **lo dice**. El panel de Divéniz ya avisa cuando
el mapa tiene menos de 30 clics. Aquí igual, en todas las secciones: un número
calculado sobre cuatro visitas no es un dato, y un panel que no lo advierte es peor
que no tener panel.

---

## 6. Estética del panel

Lo que pide Selu: que se reconozca como En Paralelo, pero sin la fiesta de la web.

**Se queda:** el negro `#080808`, el amarillo `#ffed4a` como acento, Outfit para
titulares e Inter para el cuerpo (ya están autoalojadas, se reutilizan), las
esquinas redondeadas y un cristal muy sutil.

**Se va:** el canvas de fondo, las scan-lines, el glitch, el badge EN VIVO, la
mascota y las animaciones de entrada. En un panel de datos el movimiento estorba, y
el glitch sobre una tabla de cifras es ilegible.

**Regla de color:** el amarillo neón marca **el dato**, nunca el fondo. Sobre negro,
un amarillo saturado en superficies grandes cansa la vista en dos minutos. Los
gráficos usan una escala derivada del amarillo con contraste verificado, no el
neón puro repetido.

Antes de escribir la primera línea de gráfico se carga la skill `dataviz`, que es
donde está el método de paleta y contraste.

---

## 7. Fases

Pequeñas y numeradas, para retomar sesión a sesión. El estado se mantiene en el
`CLAUDE.md` del repo.

### Fase 0 · Preparación *(requiere a Selu)*

| # | Qué | Quién | Estado |
|---|---|---|---|
| 0.1 | Mover el repo fuera de `.gemini\antigravity\scratch\` (carpeta temporal de Antigravity) | Claude | ✅ En `Documents\Trasteando con claude\En paralelo web`. Copiado, verificado con `git fsck` (commit `bcd3dfa`, remoto intacto, `_originals` completo) y el original borrado. VSCode bloqueaba el `mv` directo, por eso se copió primero |
| 0.2 | Acceso al CLI de Vercel | — | ✅ Token de Selu en `Documents\Trasteando con claude\Vercel\Tokens.txt`. Cuenta `garavitstudio-7391` |
| 0.3 | Almacenamiento | — | ✅ No hace falta crear nada: ver D1 |
| 0.4 | Contraseña del panel | Selu | Pendiente |

### Fase 1 · Cimientos — ✅ hecha y verificada en producción (2026-09-14)

- ✅ Esquema `metricas` aplicado (`sql/001-metricas.sql`) desde `api/migrar.mjs`.
- ✅ `api/registrar.mjs`: 204 inmediato, escritura con `waitUntil`, cookie de
  visitante por `Set-Cookie` con `HttpOnly`+`Secure` y firma HMAC.
- ✅ CSP: `frame-src` ahora lleva `'self'`.
- ✅ **Región corregida.** El diagnóstico destapó lo que se temía: base en
  `eu-central-1` y funciones en `iad1`. Con `"regions": ["fra1"]` las dos están
  ya en Frankfurt.

**Lo que se comprobó contra producción,** no en local:

| Prueba | Resultado |
|---|---|
| Guarda los eventos | ✅ 204 y 8 filas escritas |
| Sin consentimiento no firma al visitante | ✅ no manda ninguna cookie |
| Con consentimiento manda la cookie | ✅ `HttpOnly` + `Secure` |
| La cookie devuelta vale para la siguiente visita | ✅ conserva el identificador |
| Cookie falsificada | ✅ se rechaza y se emite una nueva |
| Evento inventado y ruta `javascript:` | ✅ filtrados en el servidor |

> Quedaron 8 eventos de prueba en `/prueba-claude` y `/desconocida`. Se borran
> desde el panel en la Fase 5.

### Fase 2 · Medición en el cliente

- `assets/js/medir.js`: puerto del medidor de Divéniz a JS plano (sin TypeScript,
  sin imports — la web no tiene build). Cola, `sendBeacon`, espera al `load`.
- Alta en las 17 páginas.
- Modo `?panel=1`: no medir cuando la página se abre dentro del panel.

### Fase 3 · Consentimiento

- `assets/js/consentimiento.js` + banner con dos botones del mismo peso.
- Alta en las 17 páginas.
- **Reescribir `cookies.html`** (hoy afirma que no hay analítica) y revisar
  `privacidad.html`.
- Enlace en el pie para cambiar de opinión después.

### Fase 4 · Eventos propios del podcast

- Clic a Spotify / YouTube / Apple, etiquetado con el episodio.
- Reproductor de la home: play y porcentaje escuchado.
- Formulario de comunidad (COMHIS) y newsletter de *lelo* como conversiones.

### Fase 5 · Panel: esqueleto

- `api/panel.js` con Basic Auth y comparación en tiempo constante.
- Estética de la sección 6.
- Filtros de periodo y de página, sin gráficos todavía.

### Fase 6 · Panel: el informe

- Las secciones de la sección 5, en orden.
- Gráficos en SVG generado en servidor (la CSP no deja cargar librerías de CDN, y
  tampoco las queremos).
- Comparación con el periodo anterior y avisos de muestra insuficiente.
- Exportación CSV.

### Fase 7 · Mapa de calor

- **Modo panel en la web:** con `?panel=1`, apagar canvas, glitch, scan-lines y
  mascota, y forzar todos los `.reveal` a visibles. Sin esto el iframe mide una
  altura inestable y los puntos caen donde no se pulsó.
- Iframe a escala, por página y por dispositivo.

### Fase 8 · Verificación y cierre

- Script de auditoría al estilo de `auditar-panel.mjs`: recorre el panel entero y
  comprueba que ninguna cifra se pasa del 100 % ni sale de la nada.
- Prueba en móvil real con `playwright-core` apuntando al Chrome ya instalado.
- Retención, purga y borrado por página.
- Actualizar el `CLAUDE.md` del repo y la nota del cerebro.

---

## 8. Riesgos conocidos

| Riesgo | Cómo se evita |
|---|---|
| `frame-src` de la CSP sin `'self'` | Fase 1. Se detecta con la consola del navegador, pero **el mapa no avisa**: se ve vacío |
| Crear un `panel.html` y que el rewrite no corra | No crearlo. Solo `api/panel.js` |
| Cookie de JS recortada a 7 días en Safari | D5: la pone el servidor |
| La función sale en Washington y la base en Europa | `regions: ["fra1"]` |
| Terminar la función antes de escribir | `waitUntil` |
| El fondo animado descuadra el mapa de calor | Modo `?panel=1`, Fase 7 |
| Medirnos a nosotros mismos | `?panel=1` y borrado por página, como en Divéniz |
| El repo vive en una carpeta temporal | Fase 0.1 |

---

## 9. Qué necesito de Selu

Casi nada, tras la Fase 0. Solo queda:

1. **La contraseña del panel.** Mientras tanto se usa una generada, que él puede
   cambiar cuando quiera: se guarda como hash en una variable de entorno, no en el
   código.

Lo demás está resuelto: el repo ya está movido, el token da acceso al CLI y el
almacenamiento no hay que crearlo.

> **Sobre el token:** vive en `Documents\Trasteando con claude\Vercel\Tokens.txt` y
> da acceso completo a los 7 proyectos de la cuenta. No se escribe en ningún
> fichero del repo ni se pasa por la línea de comandos: se lee de ahí en cada uso.
