/**
 * Recolector de métricas de enparalelopodcast.com
 *
 * Recoge lo que manda /assets/js/medir.js y lo guarda. Cuatro cosas básicas
 * —vista, scroll, clic, salida— más las propias del podcast: clic a
 * plataforma, escucha del clip de audio y conversiones.
 *
 *
 * VELOCIDAD: se contesta ANTES de tocar la base
 *
 * Esta petición sale de un móvil que está cargando la web. En Divéniz, la
 * versión que escribía antes de responder la medía Google en 2,4 s dentro de
 * la cadena crítica de pintado. Allí se arregló con fastcgi_finish_request:
 * contestar 204 y seguir trabajando con el navegador ya libre.
 *
 * Aquí el equivalente es waitUntil() de @vercel/functions. Sin él solo hay dos
 * salidas y las dos son malas: o el navegador espera a que escribamos, o la
 * función termina antes de la escritura y el evento se pierde en silencio.
 *
 *
 * LA COOKIE LA PONE EL SERVIDOR, NO EL NAVEGADOR
 *
 * Safari e iOS recortan a 7 días cualquier cookie escrita desde JavaScript con
 * document.cookie. Divéniz la escribe así, o sea que en iPhone su sección de
 * "quién vuelve" se reinicia cada semana sin que nada avise. En un podcast,
 * donde el tráfico de iOS es enorme, eso dejaría la mejor parte del panel
 * siendo mentira.
 *
 * Por eso la cookie del visitante viaja en la respuesta, con HttpOnly: las
 * cookies de servidor no sufren ese recorte, y de paso el identificador deja
 * de poder manipularse desde el navegador. Va firmada con HMAC, así que
 * tampoco se puede fabricar una a mano para envenenar los datos.
 *
 * La cookie de DECISIÓN sí la escribe el navegador: el banner tiene que poder
 * leerla antes de pintarse.
 */

import { createHash, createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import { waitUntil } from '@vercel/functions';
import { sql } from './_db.mjs';

/** Lo que aceptamos. Cualquier otra cosa se descarta sin más. */
const TIPOS = new Set([
	'vista',
	'scroll',
	'clic',
	'salida',
	'plataforma', // clic a Spotify / YouTube / Apple
	'audio', // el clip de la portada
	'conversion', // formulario de comunidad, newsletter
]);

const COOKIE_DECISION = 'ep_c';
const COOKIE_VISITANTE = 'ep_v';

/** Media hora sin actividad y la siguiente página cuenta como otra visita. */
const MINUTOS_DE_VISITA = 30;
/** Un año, que es el máximo razonable que marca la AEPD. */
const DIAS_COOKIE = 365;

const MAX_EVENTOS = 20;
const MAX_CUERPO = 8192;

/**
 * Secreto para firmar la cookie del visitante.
 *
 * Si no está puesto se usa uno derivado del propio despliegue: cambia en cada
 * deploy, así que las cookies se invalidan y la gente cuenta como nueva. No es
 * grave —solo afecta a la sección de quién vuelve— pero conviene ponerlo.
 */
const SECRETO =
	process.env.METRICAS_SECRETO ?? process.env.VERCEL_DEPLOYMENT_ID ?? 'en-paralelo-sin-secreto';

// ---------------------------------------------------------------------------
// Utilidades
// ---------------------------------------------------------------------------

/** Quita lo que no esperamos y recorta. Nunca devuelve null. */
function limpiar(valor, largo = 48) {
	if (typeof valor !== 'string') return '';
	return valor
		.replace(/[^\p{L}\p{N} \/_.:-]/gu, '')
		.trim()
		.slice(0, largo);
}

/**
 * Ruta interna válida.
 *
 * Este endpoint acepta peticiones sin cabecera Origin —las hay legítimas— así
 * que cualquiera puede mandar lo que quiera. Y limpiar() deja pasar los dos
 * puntos, con lo que un "javascript:..." llegaría entero hasta el panel, que
 * usa el nombre de la página como src de un iframe para el mapa de calor.
 *
 * Lo que no parezca una ruta se aparta en su propio cajón en vez de tirarlo:
 * así el evento sigue contando y el valor raro se ve.
 */
function ruta(valor) {
	const limpio = limpiar(valor, 60);
	return /^\/[A-Za-z0-9/_-]*$/.test(limpio) ? limpio : '/desconocida';
}

function entero(valor, minimo, maximo) {
	const n = Number.parseInt(valor, 10);
	if (!Number.isFinite(n)) return null;
	return Math.max(minimo, Math.min(maximo, n));
}

function decimal(valor, minimo, maximo) {
	const n = Number.parseFloat(valor);
	if (!Number.isFinite(n)) return null;
	return Math.max(minimo, Math.min(maximo, n));
}

/**
 * Huella anónima del día.
 *
 * No se guarda la IP. Esto es irreversible, y como la sal lleva la fecha,
 * deja de poder cruzarse en cuanto cambia el día. Sirve para contar personas
 * dentro de una jornada, no para saber quién es nadie.
 */
function huellaDelDia(peticion) {
	const ip = (peticion.headers['x-forwarded-for'] ?? '').split(',')[0].trim();
	const semilla = [
		ip,
		peticion.headers['user-agent'] ?? '',
		new Date().toISOString().slice(0, 10),
		SECRETO,
	].join('|');
	return createHash('sha256').update(semilla).digest('hex').slice(0, 12);
}

function leerCookies(peticion) {
	const crudo = peticion.headers.cookie ?? '';
	const salida = {};
	for (const trozo of crudo.split(';')) {
		const i = trozo.indexOf('=');
		if (i < 1) continue;
		salida[trozo.slice(0, i).trim()] = decodeURIComponent(trozo.slice(i + 1).trim());
	}
	return salida;
}

function firmar(datos) {
	return createHmac('sha256', SECRETO).update(datos).digest('base64url').slice(0, 16);
}

function firmaValida(datos, firma) {
	const esperada = Buffer.from(firmar(datos));
	const recibida = Buffer.from(String(firma));
	if (esperada.length !== recibida.length) return false;
	return timingSafeEqual(esperada, recibida);
}

/**
 * Decide quién es el visitante y si esta es una visita nueva.
 *
 * Devuelve también la cookie que hay que mandar de vuelta, o la orden de
 * borrarla si ha retirado el consentimiento.
 */
function resolverVisitante(cookies) {
	const acepta = cookies[COOKIE_DECISION] === 'si';

	if (!acepta) {
		// Al rechazar no basta con dejar de escribir: hay que retirar lo que
		// hubiera de antes.
		const habia = Boolean(cookies[COOKIE_VISITANTE]);
		return { visitante: null, cookie: habia ? `${COOKIE_VISITANTE}=; Max-Age=0; Path=/; SameSite=Lax; Secure` : null };
	}

	const ahora = Math.floor(Date.now() / 1000);
	const partes = (cookies[COOKIE_VISITANTE] ?? '').split('.');

	let id = partes[0] ?? '';
	let primera = Number(partes[1]);
	let ultima = Number(partes[2]);
	let visitas = Number(partes[3]);
	const firma = partes[4] ?? '';

	let diasDesde = null;

	const intacta =
		/^[a-z0-9]{10,16}$/.test(id) &&
		Number.isFinite(primera) &&
		Number.isFinite(ultima) &&
		Number.isFinite(visitas) &&
		firmaValida([id, primera, ultima, visitas].join('.'), firma);

	if (!intacta) {
		// Una cookie a medias, caducada o manipulada se trata como si no hubiera
		id = randomBytes(6).toString('hex');
		primera = ahora;
		visitas = 1;
	} else if (ahora - ultima > MINUTOS_DE_VISITA * 60) {
		visitas += 1;
		diasDesde = Math.floor((ahora - ultima) / 86400);
	}

	// Se refresca en cada petición, así que alguien que lea diez minutos y siga
	// a otra página no cuenta como visita nueva.
	const cuerpo = [id, primera, ahora, visitas].join('.');
	const valor = `${cuerpo}.${firmar(cuerpo)}`;

	return {
		visitante: { id, visitas, diasDesde },
		cookie:
			`${COOKIE_VISITANTE}=${valor}; Max-Age=${DIAS_COOKIE * 86400}` +
			`; Path=/; SameSite=Lax; Secure; HttpOnly`,
	};
}

// ---------------------------------------------------------------------------

export default async function handler(peticion, respuesta) {
	respuesta.setHeader('X-Robots-Tag', 'noindex');

	// Solo desde la propia web. Se aceptan las peticiones sin Origin porque
	// las hay legítimas (sendBeacon al cerrar la página, en algunos
	// navegadores, no la manda).
	const origen = peticion.headers.origin;
	if (origen) {
		try {
			if (new URL(origen).host !== peticion.headers.host) {
				respuesta.status(403).end();
				return;
			}
		} catch {
			respuesta.status(403).end();
			return;
		}
	}

	if (peticion.method !== 'POST') {
		respuesta.status(405).end();
		return;
	}

	let datos = peticion.body;
	if (typeof datos === 'string') {
		if (datos.length > MAX_CUERPO) {
			respuesta.status(413).end();
			return;
		}
		try {
			datos = JSON.parse(datos);
		} catch {
			respuesta.status(400).end();
			return;
		}
	}
	if (!datos || typeof datos !== 'object') {
		respuesta.status(400).end();
		return;
	}

	const cookies = leerCookies(peticion);
	const { visitante, cookie } = resolverVisitante(cookies);
	const huella = huellaDelDia(peticion);

	// Se acepta un evento suelto o un paquete de varios
	const entrada = Array.isArray(datos.eventos) ? datos.eventos : [datos];

	const filas = [];
	for (const evento of entrada.slice(0, MAX_EVENTOS)) {
		if (!evento || typeof evento !== 'object') continue;

		const tipo = limpiar(evento.e, 12);
		if (!TIPOS.has(tipo)) continue;

		const fila = {
			tipo,
			pagina: ruta(evento.p ?? '/'),
			dispositivo: limpiar(evento.d, 10) || null,
			origen: limpiar(evento.o, 24) || null,
			sesion: limpiar(evento.s, 24) || null,
			huella,
			visitante: null,
			visita_num: null,
			dias_desde: null,
			valor: null,
			etiqueta: null,
			pos_x: null,
			pos_y: null,
			fijo: false,
		};

		// Solo se firma si esa persona ha aceptado. Es lo único que permite
		// distinguir diez visitas de una persona de diez personas distintas.
		if (visitante) {
			fila.visitante = visitante.id;
			fila.visita_num = visitante.visitas;
			if (tipo === 'vista' && visitante.diasDesde != null) {
				fila.dias_desde = visitante.diasDesde;
			}
		}

		if (tipo === 'scroll') fila.valor = entero(evento.v, 0, 100);
		if (tipo === 'salida') fila.valor = entero(evento.g, 0, 3600);
		if (tipo === 'audio') fila.valor = entero(evento.v, 0, 100);

		if (tipo === 'clic' || tipo === 'plataforma' || tipo === 'conversion' || tipo === 'audio') {
			fila.etiqueta = limpiar(evento.k, 40) || null;
		}

		if (tipo === 'clic') {
			fila.pos_x = decimal(evento.x, 0, 100);
			fila.pos_y = decimal(evento.y, 0, 100);
			fila.fijo = Boolean(evento.f);
		}

		filas.push(fila);
	}

	if (cookie) respuesta.setHeader('Set-Cookie', cookie);

	// A partir de aquí el navegador ya no espera nada. Todo lo que toca la
	// base va detrás de esta línea, a propósito.
	respuesta.status(204).end();

	if (filas.length === 0 || !sql) return;

	waitUntil(
		guardar(filas).catch((error) => {
			// Que falle la medición nunca debe romper nada. Se deja constancia
			// y se sigue.
			console.error('[metricas] no se pudo guardar:', error?.message ?? error);
		}),
	);
}

/** Un solo INSERT con todas las filas: una ida y vuelta, no una por evento. */
async function guardar(filas) {
	const columnas = [
		'tipo',
		'pagina',
		'dispositivo',
		'origen',
		'sesion',
		'huella',
		'visitante',
		'visita_num',
		'dias_desde',
		'valor',
		'etiqueta',
		'pos_x',
		'pos_y',
		'fijo',
	];

	const valores = [];
	const grupos = filas.map((fila) => {
		const huecos = columnas.map((columna) => {
			valores.push(fila[columna]);
			return `$${valores.length}`;
		});
		return `(${huecos.join(',')})`;
	});

	await sql.query(
		`insert into metricas.eventos (${columnas.join(',')}) values ${grupos.join(',')}`,
		valores,
	);
}
