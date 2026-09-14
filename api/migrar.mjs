/**
 * Aplica el esquema de métricas.
 *
 * Existe porque las credenciales del Neon las inyecta Vercel en tiempo de
 * ejecución y NO son legibles desde fuera: un `vercel env pull` devuelve las
 * claves con el valor vacío. O sea que no hay forma de aplicar el DDL desde el
 * portátil, y la alternativa sería pedirle a Selu que pegue SQL a mano en un
 * panel. Esto lo evita: la migración corre donde sí hay credenciales.
 *
 * Es idempotente —todo el SQL va con IF NOT EXISTS y queda registrado en
 * metricas.migraciones—, así que llamarla dos veces no rompe nada.
 *
 * PROTECCIÓN: hace falta la cabecera `x-migracion` con el valor de la variable
 * de entorno MIGRACION_SECRETO. Si la variable no existe, la función se niega
 * a hacer nada: más vale que falle a que quede un endpoint abierto capaz de
 * tocar el esquema.
 *
 * GET  → diagnóstico: dice si el esquema está puesto y en qué región vive la
 *        base, sin tocar nada.
 * POST → aplica lo que falte.
 */

import { timingSafeEqual } from 'node:crypto';
import { sql, hostDeLaBase, regionDeLaBase } from './_db.mjs';

/** Los statements van sueltos: el driver HTTP ejecuta uno por petición. */
const ESQUEMA = [
	`create schema if not exists metricas`,

	`create table if not exists metricas.eventos (
		id          bigserial   primary key,
		ts          timestamptz not null default now(),
		tipo        text        not null,
		pagina      text        not null,
		dispositivo text,
		origen      text,
		sesion      text,
		huella      text,
		visitante   text,
		visita_num  integer,
		dias_desde  integer,
		valor       integer,
		etiqueta    text,
		pos_x       real,
		pos_y       real,
		fijo        boolean     not null default false,
		borrado_en  timestamptz
	)`,

	`create index if not exists eventos_ts_idx
		on metricas.eventos (ts desc) where borrado_en is null`,

	`create index if not exists eventos_pagina_ts_idx
		on metricas.eventos (pagina, ts desc) where borrado_en is null`,

	`create index if not exists eventos_tipo_ts_idx
		on metricas.eventos (tipo, ts desc) where borrado_en is null`,

	`create table if not exists metricas.migraciones (
		nombre      text        primary key,
		aplicada_en timestamptz not null default now()
	)`,
];

const NOMBRE = '001-metricas';

/** Compara sin delatar la clave por lo que tarda en fallar. */
function iguales(a, b) {
	const x = Buffer.from(String(a));
	const y = Buffer.from(String(b));
	if (x.length !== y.length) return false;
	return timingSafeEqual(x, y);
}

export default async function handler(peticion, respuesta) {
	respuesta.setHeader('X-Robots-Tag', 'noindex, nofollow');

	const secreto = process.env.MIGRACION_SECRETO;
	if (!secreto) {
		respuesta.status(503).json({
			error: 'Falta MIGRACION_SECRETO en el entorno. La migración está desactivada.',
		});
		return;
	}

	if (!iguales(peticion.headers['x-migracion'] ?? '', secreto)) {
		respuesta.status(401).json({ error: 'No autorizado' });
		return;
	}

	if (!sql) {
		respuesta.status(503).json({ error: 'No hay URL de base de datos en el entorno' });
		return;
	}

	// Lo que sirve para decidir dónde poner las funciones (ver D3 del plan):
	// si la base está en Europa y las funciones salen en Washington, cada
	// consulta cruza el Atlántico.
	const donde = {
		region_de_la_base: regionDeLaBase(),
		host_de_la_base: hostDeLaBase(),
		region_de_la_funcion: process.env.VERCEL_REGION ?? '(local)',
	};

	try {
		if (peticion.method === 'GET') {
			const [{ existe }] = await sql`
				select exists (
					select 1 from information_schema.tables
					where table_schema = 'metricas' and table_name = 'eventos'
				) as existe`;

			let eventos = null;
			if (existe) {
				const [fila] = await sql`select count(*)::int as n from metricas.eventos`;
				eventos = fila.n;
			}

			respuesta.status(200).json({ esquema_aplicado: existe, eventos, ...donde });
			return;
		}

		if (peticion.method !== 'POST') {
			respuesta.status(405).json({ error: 'Usa GET para diagnosticar o POST para aplicar' });
			return;
		}

		// EN SECUENCIA, nunca con Promise.all. Aquí además es obligatorio: el
		// esquema tiene que existir antes que la tabla, y la tabla antes que
		// sus índices.
		for (const statement of ESQUEMA) {
			await sql.query(statement);
		}

		await sql`
			insert into metricas.migraciones (nombre) values (${NOMBRE})
			on conflict (nombre) do nothing`;

		const [fila] = await sql`select count(*)::int as n from metricas.migraciones`;

		respuesta.status(200).json({
			ok: true,
			aplicada: NOMBRE,
			migraciones_registradas: fila.n,
			...donde,
		});
	} catch (error) {
		// El mensaje se devuelve entero a propósito: este endpoint es privado y
		// sin logs de runtime en el plan Hobby, la respuesta HTTP es el único
		// canal para saber por qué ha fallado algo.
		respuesta.status(500).json({ error: String(error?.message ?? error), ...donde });
	}
}
