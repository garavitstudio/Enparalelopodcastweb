# En Paralelo · web del podcast

Sitio oficial de **EN PARALELO** (Enara Jiménez y José Luis "Selu").
HTML estático puro, sin framework y sin build. Vercel + dominio propio.

| | |
|---|---|
| **Producción** | https://enparalelopodcast.com |
| **Repo** | `github.com/garavitstudio/Enparalelopodcastweb`, rama `main` |
| **Proyecto Vercel** | `enparalelopodcastweb` (equipo `garavitstudio-7391`) |
| **Base de datos** | Neon `neon-aureolin-school`, región `eu-central-1` |

> [!warning] El repo se movió el 2026-09-14
> Vivía en `.gemini\antigravity\scratch\en-paralelo`, la carpeta temporal de
> Antigravity, donde una limpieza se lo habría llevado entero. Ahora está en
> `Documents\Trasteando con claude\En paralelo web`.

## Cómo se despliega

Dos vías, y conviene no mezclarlas sin saberlo:

- **`git push` a `main`** → despliega solo por la integración de Git.
- **`vercel deploy --prod`** desde la carpeta → sube lo que hay en local.

El token de Selu está en `Documents\Trasteando con claude\Vercel\Tokens.txt`.
Se lee de ahí en cada uso; no se escribe en ningún fichero del repo.

## Scripts

`npm run publicar` = genera las páginas de episodio y versiona los assets.
El cache-bust es obligatorio: en `vercel.json` todo lo de `/assets` se sirve
como `immutable` durante un año, así que sin cambiar la URL el navegador no
vuelve a pedir el archivo aunque su contenido sea otro.

---

# Sistema de métricas

Medición propia, sin Google Analytics y sin terceros. **El plan completo, con
las decisiones y su porqué, está en [`docs/plan-metricas.md`](docs/plan-metricas.md).**
Esto es solo el estado.

## Fases

| Fase | Qué | Estado |
|---|---|---|
| 0 | Preparación: mover el repo, acceso a Vercel, decidir almacenamiento | ✅ **Hecha** |
| 1 | Cimientos: esquema, recolector, región, CSP | ✅ **Hecha y verificada en producción** |
| 2 | Medición en el cliente (`assets/js/medir.js`) en las 17 páginas | ⬜ Siguiente |
| 3 | Consentimiento en toda la web + reescribir `cookies.html` | ⬜ |
| 4 | Eventos propios del podcast (plataformas, audio, formularios) | ⬜ |
| 5 | Panel: esqueleto y autenticación | ⬜ |
| 6 | Panel: el informe | ⬜ |
| 7 | Mapa de calor | ⬜ |
| 8 | Verificación y cierre | ⬜ |

## Lo que ya existe (Fase 1)

```
api/_db.mjs         conexión a Neon por HTTP (sin pool, sin pgbouncer)
api/migrar.mjs      aplica el esquema · GET diagnostica, POST aplica
api/registrar.mjs   el recolector
sql/001-metricas.sql  el esquema, para leerlo de un vistazo
```

Todo vive en el esquema **`metricas`** de la base, nunca en `public`: el
recurso Neon está vinculado también a `horarios-zuaina` (app de una clienta) y
así no puede haber colisión.

## Variables de entorno

| Nombre | Para qué |
|---|---|
| `Enparalelo_DATABASE_URL` | La pone la integración de Neon. **No es legible desde fuera**: un `vercel env pull` la devuelve vacía |
| `MIGRACION_SECRETO` | Cabecera `x-migracion` para poder llamar a `/api/migrar` |
| `METRICAS_SECRETO` | Firma la cookie del visitante y la huella del día |

> [!important] Por eso existe `api/migrar.mjs`
> Como las credenciales del Neon no se pueden leer desde el portátil, el DDL no
> se puede aplicar en local. La migración corre donde sí hay credenciales: en
> una función desplegada. Es idempotente, así que llamarla dos veces no rompe
> nada.

## Trampas de este proyecto

> [!danger] La CSP tenía `frame-src` sin `'self'`
> Solo permitía YouTube. El mapa de calor mete la propia web en un iframe, así
> que habría salido **en blanco, sin ningún error visible**. Corregido el
> 2026-09-14. Si alguien vuelve a tocar la CSP, que no lo quite.

> [!danger] Las funciones salían en Washington con la base en Frankfurt
> Medido en producción: `region_de_la_funcion: iad1` contra una base en
> `eu-central-1`. Cada consulta cruzaba el Atlántico. Se arregló con
> `"regions": ["fra1"]` en `vercel.json`. **`vercel.json` no admite claves
> inventadas**, así que el porqué se documenta aquí y no ahí dentro.

> [!warning] El preview lleva protección de despliegue
> Las URL largas de preview devuelven 302 al SSO de Vercel, y `curl -L` da un
> 200 engañoso porque sigue la redirección. Verifica siempre contra
> `enparalelopodcast.com`. Hay un bypass de automatización generado para el
> proyecto, pero el clasificador de seguridad de Claude Code bloquea su uso.

> [!warning] La carpeta `public/` no existe, y no debe existir
> Sin framework detectado, Vercel tomaría `public/` como directorio de salida y
> publicaría solo su contenido, dejando el `index.html` fuera → 404 en toda la
> web. Por eso los recursos están en `assets/`.

## Datos de prueba pendientes de limpiar

Quedaron **8 eventos** de la verificación de la Fase 1, en las páginas
`/prueba-claude` y `/desconocida`. Se borran desde el panel cuando exista
(Fase 5), que llevará borrado por página.
