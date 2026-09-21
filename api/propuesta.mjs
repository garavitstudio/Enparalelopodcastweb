/**
 * Notas de la propuesta.
 *
 * Guarda lo que el lector va anotando sobre una propuesta privada. No hay
 * login, ni registro, ni correo: entra por un enlace, escribe, y se guarda.
 *
 * Vive en este proyecto porque es el único que tiene una base de datos
 * conectada y despliega por push a `main`. La página que lo consume está en
 * otro dominio, así que hay CORS.
 *
 * Esquema propio `propuesta`, nunca `public`: el recurso Neon está vinculado
 * también a `horarios-zuaina` (app de una clienta) y a las métricas de esta
 * web. Cada cosa en su esquema.
 *
 * GET  ?lector=xxx  → devuelve lo anotado (lo usa el lector al volver, y Selu
 *                     para leerlo)
 * POST {lector, notas} → guarda el estado completo
 */

import { sql } from './_db.mjs';

/**
 * Quién puede escribir. Sin esto el endpoint queda abierto a que cualquiera
 * llene la tabla. No es autenticación —estas claves van en el enlace y el
 * código es público— sino un tope: solo existen estos cajones y nada más.
 * Para añadir un lector, se añade aquí y se le manda `?r=<clave>`.
 */
const LECTORES = new Set(['propietario', 'propietario2', 'selu', 'prueba']);

/** Desde dónde se puede llamar. La propuesta no vive en este dominio. */
const ORIGENES = new Set([
	'https://garavitstudio.com',
	'https://www.garavitstudio.com',
	'https://enparalelopodcast.com',
	'https://www.enparalelopodcast.com',
]);

/** Topes de cordura. Son notas de una persona, no un almacén. */
const MAX_BYTES = 64 * 1024;
const MAX_NOTAS = 200;

/**
 * Crea el esquema si falta. Idempotente y barato: se hace una vez por
 * instancia caliente, no en cada petición.
 *
 * Va aquí y no en `migrar.mjs` a propósito: aquella función exige la cabecera
 * `x-migracion` con un secreto que solo vive en el entorno de Vercel y que no
 * se puede leer desde fuera. Para una única tabla, depender de ese secreto
 * costaría más de lo que protege.
 */
let esquemaListo = false;
async function asegurarEsquema() {
	if (esquemaListo) return;
	await sql.query(`create schema if not exists propuesta`);
	await sql.query(`create table if not exists propuesta.notas (
		lector      text        primary key,
		datos       jsonb       not null,
		actualizado timestamptz not null default now()
	)`);
	esquemaListo = true;
}

function cors(peticion, respuesta) {
	const origen = peticion.headers.origin;
	if (origen && ORIGENES.has(origen)) {
		respuesta.setHeader('Access-Control-Allow-Origin', origen);
	}
	respuesta.setHeader('Vary', 'Origin');
	respuesta.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
	respuesta.setHeader('Access-Control-Allow-Headers', 'Content-Type');
	respuesta.setHeader('Access-Control-Max-Age', '86400');
}

export default async function handler(peticion, respuesta) {
	respuesta.setHeader('X-Robots-Tag', 'noindex, nofollow');
	respuesta.setHeader('Cache-Control', 'no-store');
	cors(peticion, respuesta);

	if (peticion.method === 'OPTIONS') {
		respuesta.status(204).end();
		return;
	}

	if (!sql) {
		respuesta.status(503).json({ error: 'No hay base de datos en el entorno' });
		return;
	}

	try {
		await asegurarEsquema();

		if (peticion.method === 'GET') {
			const lector = String(peticion.query?.lector ?? '').trim();
			if (!LECTORES.has(lector)) {
				respuesta.status(400).json({ error: 'lector no reconocido' });
				return;
			}
			const filas = await sql`
				select datos, actualizado from propuesta.notas where lector = ${lector}`;
			respuesta.status(200).json({
				ok: true,
				lector,
				notas: filas[0]?.datos ?? {},
				actualizado: filas[0]?.actualizado ?? null,
			});
			return;
		}

		if (peticion.method !== 'POST') {
			respuesta.status(405).json({ error: 'Usa GET para leer o POST para guardar' });
			return;
		}

		// Vercel ya entrega el cuerpo parseado cuando llega como JSON.
		const cuerpo =
			typeof peticion.body === 'string' ? JSON.parse(peticion.body || '{}') : peticion.body ?? {};

		const lector = String(cuerpo.lector ?? '').trim();
		if (!LECTORES.has(lector)) {
			respuesta.status(400).json({ error: 'lector no reconocido' });
			return;
		}

		const notas = cuerpo.notas;
		if (!notas || typeof notas !== 'object' || Array.isArray(notas)) {
			respuesta.status(400).json({ error: 'notas debe ser un objeto' });
			return;
		}
		if (Object.keys(notas).length > MAX_NOTAS) {
			respuesta.status(413).json({ error: 'demasiadas notas' });
			return;
		}
		const serializado = JSON.stringify(notas);
		if (Buffer.byteLength(serializado, 'utf8') > MAX_BYTES) {
			respuesta.status(413).json({ error: 'las notas ocupan demasiado' });
			return;
		}

		await sql`
			insert into propuesta.notas (lector, datos, actualizado)
			values (${lector}, ${serializado}::jsonb, now())
			on conflict (lector) do update
				set datos = excluded.datos, actualizado = now()`;

		respuesta.status(200).json({ ok: true, guardadas: Object.keys(notas).length });
	} catch (error) {
		// El mensaje entero a propósito: en Hobby no hay logs de runtime por API,
		// así que la respuesta HTTP es el único canal de diagnóstico.
		respuesta.status(500).json({ error: String(error?.message ?? error) });
	}
}
