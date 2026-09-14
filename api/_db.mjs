/**
 * Conexión a la base de métricas.
 *
 * Se usa el driver HTTP de Neon (@neondatabase/serverless), no un pool de
 * conexiones, y eso no es un detalle: cada consulta es una petición HTTP
 * independiente, sin conexión persistente ni pgbouncer por delante.
 *
 * Con eso desaparece de raíz la trampa más cara que nos hemos encontrado:
 * varias consultas en paralelo sobre la misma conexión contra un pooler en
 * modo transacción se quedan esperando para siempre, sin error, sin timeout y
 * sin dejar rastro en ningún log. Costó el servicio caído en Finanzas de Casa
 * el 13/09/2026.
 *
 * Aun así, la regla se mantiene por costumbre: las consultas van EN SECUENCIA.
 * El paralelismo no aporta nada con este volumen y sí puede costar caro.
 */

import { neon } from '@neondatabase/serverless';

/**
 * El recurso Neon está conectado al proyecto con el prefijo "Enparalelo_".
 * Se aceptan los nombres sin prefijo como respaldo para poder desarrollar en
 * local contra un Postgres cualquiera.
 */
const URL_BASE =
	process.env.Enparalelo_DATABASE_URL ??
	process.env.DATABASE_URL ??
	process.env.POSTGRES_URL;

if (!URL_BASE) {
	// Que falte se tiene que ver al arrancar, no dentro de un catch que se
	// traga el fallo y deja la medición muda sin que nadie se entere.
	console.error('[metricas] No hay URL de base de datos en el entorno');
}

export const sql = URL_BASE ? neon(URL_BASE) : null;

/**
 * Host de la base, sin credenciales, para saber en qué región vive.
 *
 * Neon mete la región en el propio nombre del host
 * (ep-loquesea-123.eu-central-1.aws.neon.tech), así que esto es lo único que
 * hace falta para decidir dónde poner las funciones. No devuelve usuario ni
 * contraseña: se puede enseñar sin problema.
 */
export function hostDeLaBase() {
	if (!URL_BASE) return null;
	try {
		return new URL(URL_BASE).hostname;
	} catch {
		return null;
	}
}

/**
 * Región que Neon anuncia en el host, o null si no se reconoce.
 *
 * No vale con coger el segundo trozo del host: Neon mete un identificador de
 * cómputo por delante y el host real es
 *   ep-withered-truth-ag58ubo8-pooler.c-2.eu-central-1.aws.neon.tech
 * donde el segundo trozo es "c-2", no la región. Se busca por forma
 * (continente-zona-número), que es como se llaman todas las de AWS.
 */
export function regionDeLaBase() {
	const host = hostDeLaBase();
	if (!host) return null;
	const encontrada = host.split('.').find((t) => /^[a-z]{2,4}-[a-z]+-\d+$/.test(t));
	return encontrada ?? null;
}
