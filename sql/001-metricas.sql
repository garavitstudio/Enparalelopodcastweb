-- Esquema de medición de enparalelopodcast.com
--
-- Vive en un esquema propio, "metricas", y no en "public", a propósito: el
-- recurso Neon está vinculado también al proyecto de horarios-zuaina. Con un
-- esquema aparte, comparta base o no, estas tablas no pueden colisionar con
-- nada de la clienta ni aparecer en sus consultas.
--
-- Una sola tabla, ancha y con columnas nulas según el tipo de evento. Se ha
-- preferido a normalizar porque el panel siempre pregunta lo mismo —dame los
-- eventos de este periodo y agrúpalos— y un JOIN por cada cifra no aporta nada
-- cuando el volumen es el de un podcast.

create schema if not exists metricas;

create table if not exists metricas.eventos (
  id          bigserial   primary key,
  ts          timestamptz not null default now(),

  -- vista · scroll · clic · salida · plataforma · audio · conversion
  tipo        text        not null,
  pagina      text        not null,
  dispositivo text,
  origen      text,
  sesion      text,

  -- Huella anónima del día: IP + navegador + sal que rota cada 24 h. Es
  -- irreversible y no se puede cruzar entre días, que es justo la intención.
  huella      text,

  -- Solo de quien acepta las cookies. Es lo único que permite distinguir
  -- diez visitas de una persona de diez personas distintas.
  visitante   text,
  visita_num  integer,
  dias_desde  integer,

  -- Según el tipo: % de scroll, segundos de permanencia, % de audio escuchado
  valor       integer,

  -- Qué se pulsó, o qué episodio / plataforma
  etiqueta    text,

  -- Punto del clic, en % del ancho de la ventana y del alto del documento,
  -- para que el mapa de calor valga aunque la pantalla de quien lo mira
  -- después no sea la misma.
  pos_x       real,
  pos_y       real,

  -- Un elemento fijo viaja con la pantalla: su posición no es un sitio real
  -- de la página. Cuenta como clic, pero el mapa no lo pinta.
  fijo        boolean     not null default false,

  -- Borrado blando: limpiar las visitas propias antes de mirar una campaña no
  -- debe tirar los datos, solo dejar de contarlos. En Divéniz esto se hacía
  -- moviendo líneas a un fichero aparte; aquí basta una marca.
  borrado_en  timestamptz
);

-- El filtro de siempre: un periodo. El índice parcial deja fuera lo borrado,
-- que es lo que el panel nunca mira.
create index if not exists eventos_ts_idx
  on metricas.eventos (ts desc)
  where borrado_en is null;

-- La vista de una página concreta, que es donde viven el embudo y el mapa.
create index if not exists eventos_pagina_ts_idx
  on metricas.eventos (pagina, ts desc)
  where borrado_en is null;

-- Para sacar solo los clics del mapa de calor sin recorrer el resto.
create index if not exists eventos_tipo_ts_idx
  on metricas.eventos (tipo, ts desc)
  where borrado_en is null;

-- Registro de qué migraciones se han aplicado, para que la función de
-- migración sea idempotente y se pueda llamar dos veces sin miedo.
create table if not exists metricas.migraciones (
  nombre      text        primary key,
  aplicada_en timestamptz not null default now()
);
