-- =====================================================================
--  Juego tipo REIGNS — esquema SQLite
--  Traducción del DDL Postgres: ENUM -> TEXT + CHECK, SERIAL -> INTEGER
-- =====================================================================

PRAGMA foreign_keys = ON;

DROP VIEW  IF EXISTS v_respuestas_invalidas;
DROP VIEW  IF EXISTS v_eventos_invalidos;
DROP TABLE IF EXISTS partida_minijuego;
DROP TABLE IF EXISTS partida_log;
DROP TABLE IF EXISTS partida_stat;
DROP TABLE IF EXISTS partida;
DROP TABLE IF EXISTS condicion;
DROP TABLE IF EXISTS condicion_grupo;
DROP TABLE IF EXISTS minijuego_resultado_stat;
DROP TABLE IF EXISTS minijuego_resultado;
DROP TABLE IF EXISTS minijuego_fase;
DROP TABLE IF EXISTS minijuego;
DROP TABLE IF EXISTS efecto_disparador;
DROP TABLE IF EXISTS efecto_flag;
DROP TABLE IF EXISTS efecto_stat;
DROP TABLE IF EXISTS efecto;
DROP TABLE IF EXISTS respuesta;
DROP TABLE IF EXISTS historia_evento;
DROP TABLE IF EXISTS evento;
DROP TABLE IF EXISTS historia;
DROP TABLE IF EXISTS final;
DROP TABLE IF EXISTS fase;
DROP TABLE IF EXISTS stat;
DROP TABLE IF EXISTS configuracion;


-- ---------------------------------------------------------------------
-- 1. Configuración y catálogos
-- ---------------------------------------------------------------------

CREATE TABLE configuracion (
    clave       TEXT PRIMARY KEY,
    valor       TEXT NOT NULL,
    descripcion TEXT
);

CREATE TABLE stat (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    codigo        TEXT NOT NULL UNIQUE,
    nombre        TEXT NOT NULL,
    descripcion   TEXT,
    color         TEXT,
    icono         TEXT,
    valor_inicial INTEGER NOT NULL DEFAULT 50,
    valor_min     INTEGER NOT NULL DEFAULT 0,
    valor_max     INTEGER NOT NULL DEFAULT 100,
    clampea       INTEGER NOT NULL DEFAULT 1,
    visible       INTEGER NOT NULL DEFAULT 1,
    orden         INTEGER NOT NULL DEFAULT 0,
    CHECK (valor_min < valor_max),
    CHECK (valor_inicial BETWEEN valor_min AND valor_max)
);

CREATE TABLE fase (
    id                   INTEGER PRIMARY KEY AUTOINCREMENT,
    codigo               TEXT NOT NULL UNIQUE,
    nombre               TEXT NOT NULL,
    ronda_desde          INTEGER NOT NULL,
    ronda_hasta          INTEGER NOT NULL,
    -- El minijuego NO consume ronda: va DESPUÉS de esta ronda.
    minijuego_despues_de INTEGER,
    orden                INTEGER NOT NULL DEFAULT 0,
    CHECK (ronda_desde <= ronda_hasta)
);


-- ---------------------------------------------------------------------
-- 2. Historias (con subhistorias)
-- ---------------------------------------------------------------------

CREATE TABLE historia (
    id                INTEGER PRIMARY KEY AUTOINCREMENT,
    codigo            TEXT NOT NULL UNIQUE,
    nombre            TEXT NOT NULL,
    descripcion       TEXT,
    historia_padre_id INTEGER REFERENCES historia(id) ON DELETE CASCADE,
    modo_secuencia    TEXT NOT NULL DEFAULT 'diferida'
                      CHECK (modo_secuencia IN ('estricta','diferida','libre')),
    gap_min           INTEGER NOT NULL DEFAULT 1,
    gap_max           INTEGER NOT NULL DEFAULT 3,
    peso              INTEGER NOT NULL DEFAULT 100,
    exclusiva         INTEGER NOT NULL DEFAULT 0,
    grupo_exclusion   TEXT,
    activa            INTEGER NOT NULL DEFAULT 1,
    CHECK (gap_min >= 0 AND gap_max >= gap_min)
);


-- ---------------------------------------------------------------------
-- 3. Eventos
-- ---------------------------------------------------------------------

CREATE TABLE evento (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    codigo          TEXT NOT NULL UNIQUE,
    tipo            TEXT NOT NULL DEFAULT 'normal'
                    CHECK (tipo IN ('normal','aviso','abandono')),
    titulo_m        TEXT,
    titulo_f        TEXT,
    titulo_nb       TEXT,
    texto_m         TEXT NOT NULL,
    texto_f         TEXT NOT NULL,
    texto_nb        TEXT NOT NULL,
    imagen_url      TEXT,
    -- Código de la ilustración vectorial (public/ilustraciones.js).
    -- Se repiten entre eventos a propósito.
    ilustracion     TEXT,
    personaje       TEXT,
    -- Agrupación temática del documento de diseño: generales, guita,
    -- conocimiento, fama, politica. No condiciona nada, sirve para editar
    -- y para balancear.
    categoria       TEXT,
    peso            INTEGER NOT NULL DEFAULT 100 CHECK (peso >= 0),
    fase_id         INTEGER REFERENCES fase(id) ON DELETE SET NULL,
    ronda_min       INTEGER,
    ronda_max       INTEGER,
    es_unico        INTEGER NOT NULL DEFAULT 1,
    cooldown_rondas INTEGER NOT NULL DEFAULT 0,
    termina_partida INTEGER NOT NULL DEFAULT 0,
    activo          INTEGER NOT NULL DEFAULT 1,
    notas_autor     TEXT,
    CHECK (ronda_min IS NULL OR ronda_max IS NULL OR ronda_min <= ronda_max),
    CHECK (tipo <> 'abandono' OR termina_partida = 1)
);

CREATE INDEX idx_evento_tipo ON evento(tipo);
CREATE INDEX idx_evento_fase ON evento(fase_id);

CREATE TABLE historia_evento (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    historia_id INTEGER NOT NULL REFERENCES historia(id) ON DELETE CASCADE,
    evento_id   INTEGER NOT NULL REFERENCES evento(id)   ON DELETE CASCADE,
    orden       INTEGER NOT NULL,
    obligatorio INTEGER NOT NULL DEFAULT 1,
    UNIQUE (historia_id, orden),
    UNIQUE (historia_id, evento_id)
);


-- ---------------------------------------------------------------------
-- 4. Respuestas y efectos
-- ---------------------------------------------------------------------

CREATE TABLE respuesta (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    evento_id    INTEGER NOT NULL REFERENCES evento(id) ON DELETE CASCADE,
    orden        INTEGER NOT NULL CHECK (orden BETWEEN 1 AND 4),
    texto_m      TEXT NOT NULL,
    texto_f      TEXT NOT NULL,
    texto_nb     TEXT NOT NULL,
    gesto        TEXT CHECK (gesto IS NULL OR gesto IN ('izq','der','arriba','abajo')),
    muestra_hint INTEGER NOT NULL DEFAULT 0,
    -- Si está seteado, elegir esta respuesta no resuelve nada todavía: lanza
    -- ese minijuego y el resultado decide cuál de sus efectos se aplica
    -- (los marcados 'gana' o los marcados 'pierde').
    minijuego_id INTEGER REFERENCES minijuego(id),
    UNIQUE (evento_id, orden)
);

CREATE INDEX idx_respuesta_evento ON respuesta(evento_id);

CREATE TABLE efecto (
    id                 INTEGER PRIMARY KEY AUTOINCREMENT,
    respuesta_id       INTEGER NOT NULL REFERENCES respuesta(id) ON DELETE CASCADE,
    peso               INTEGER NOT NULL DEFAULT 100 CHECK (peso >= 0),
    es_default         INTEGER NOT NULL DEFAULT 0,
    texto_resultado_m  TEXT,
    texto_resultado_f  TEXT,
    texto_resultado_nb TEXT,
    codigo             TEXT,
    -- Un efecto puntual puede cortar la partida, sin que todo el evento
    -- termine el juego. Así "dejás la carrera" puede ser una respuesta más
    -- dentro de un evento normal.
    termina_partida    INTEGER NOT NULL DEFAULT 0,
    es_abandono        INTEGER NOT NULL DEFAULT 0,
    -- Rama de un duelo: solo se aplica si la respuesta lanzó un minijuego y
    -- el jugador lo ganó ('gana') o lo perdió ('pierde'). NULL = efecto normal.
    rama_minijuego     TEXT CHECK (rama_minijuego IS NULL OR rama_minijuego IN ('gana','pierde')),
    CHECK (es_abandono = 0 OR termina_partida = 1)
);

CREATE INDEX idx_efecto_respuesta ON efecto(respuesta_id);

CREATE TABLE efecto_stat (
    id        INTEGER PRIMARY KEY AUTOINCREMENT,
    efecto_id INTEGER NOT NULL REFERENCES efecto(id) ON DELETE CASCADE,
    stat_id   INTEGER NOT NULL REFERENCES stat(id)   ON DELETE CASCADE,
    operacion TEXT NOT NULL DEFAULT 'sumar'
              CHECK (operacion IN ('sumar','fijar','multiplicar')),
    valor     REAL,
    valor_min REAL,
    valor_max REAL,
    UNIQUE (efecto_id, stat_id),
    CHECK (valor IS NOT NULL OR (valor_min IS NOT NULL AND valor_max IS NOT NULL))
);

CREATE TABLE efecto_flag (
    id        INTEGER PRIMARY KEY AUTOINCREMENT,
    efecto_id INTEGER NOT NULL REFERENCES efecto(id) ON DELETE CASCADE,
    clave     TEXT NOT NULL,
    valor     TEXT NOT NULL DEFAULT 'true',
    UNIQUE (efecto_id, clave)
);

-- AVISOS: un efecto programa un evento futuro de tipo 'aviso'.
CREATE TABLE efecto_disparador (
    id                INTEGER PRIMARY KEY AUTOINCREMENT,
    efecto_id         INTEGER NOT NULL REFERENCES efecto(id) ON DELETE CASCADE,
    evento_destino_id INTEGER NOT NULL REFERENCES evento(id) ON DELETE CASCADE,
    demora_min        INTEGER NOT NULL DEFAULT 1,
    demora_max        INTEGER NOT NULL DEFAULT 3,
    forzado           INTEGER NOT NULL DEFAULT 1,
    prioridad         INTEGER NOT NULL DEFAULT 100,
    CHECK (demora_min >= 0 AND demora_max >= demora_min)
);


-- ---------------------------------------------------------------------
-- 5. Minijuegos (no consumen ronda)
-- ---------------------------------------------------------------------

CREATE TABLE minijuego (
    id               INTEGER PRIMARY KEY AUTOINCREMENT,
    codigo           TEXT NOT NULL UNIQUE,
    nombre           TEXT NOT NULL,
    descripcion      TEXT,
    ilustracion      TEXT,
    mecanica         TEXT NOT NULL CHECK (mecanica IN (
                       'tres_en_linea','memotest','traducir','sopa',
                       'crucigrama','apellidos','conectar','molinete',
                     'simon')),
    instrucciones_m  TEXT,
    instrucciones_f  TEXT,
    instrucciones_nb TEXT,
    config           TEXT NOT NULL DEFAULT '{}',
    peso             INTEGER NOT NULL DEFAULT 100,
    activo           INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE minijuego_fase (
    minijuego_id INTEGER NOT NULL REFERENCES minijuego(id) ON DELETE CASCADE,
    fase_id      INTEGER NOT NULL REFERENCES fase(id)      ON DELETE CASCADE,
    peso         INTEGER NOT NULL DEFAULT 100,
    PRIMARY KEY (minijuego_id, fase_id)
);

CREATE TABLE minijuego_resultado (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    minijuego_id INTEGER NOT NULL REFERENCES minijuego(id) ON DELETE CASCADE,
    codigo       TEXT NOT NULL,
    puntaje_min  REAL,
    puntaje_max  REAL,
    texto_m      TEXT,
    texto_f      TEXT,
    texto_nb     TEXT,
    UNIQUE (minijuego_id, codigo)
);

CREATE TABLE minijuego_resultado_stat (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    resultado_id INTEGER NOT NULL REFERENCES minijuego_resultado(id) ON DELETE CASCADE,
    stat_id      INTEGER NOT NULL REFERENCES stat(id) ON DELETE CASCADE,
    operacion    TEXT NOT NULL DEFAULT 'sumar'
                 CHECK (operacion IN ('sumar','fijar','multiplicar')),
    valor        REAL NOT NULL,
    UNIQUE (resultado_id, stat_id)
);


-- ---------------------------------------------------------------------
-- 6. Finales
-- ---------------------------------------------------------------------

CREATE TABLE final (
    id                INTEGER PRIMARY KEY AUTOINCREMENT,
    codigo            TEXT NOT NULL UNIQUE,
    titulo_m          TEXT NOT NULL,
    titulo_f          TEXT NOT NULL,
    titulo_nb         TEXT NOT NULL,
    texto_m           TEXT NOT NULL,
    texto_f           TEXT NOT NULL,
    texto_nb          TEXT NOT NULL,
    imagen_url        TEXT,
    ilustracion       TEXT,
    prioridad         INTEGER NOT NULL DEFAULT 0,
    es_default        INTEGER NOT NULL DEFAULT 0,
    requiere_abandono INTEGER NOT NULL DEFAULT 0
);

CREATE UNIQUE INDEX uq_final_default ON final(es_default) WHERE es_default = 1;


-- ---------------------------------------------------------------------
-- 7. Condiciones (sirven para eventos, para efectos y para finales)
-- ---------------------------------------------------------------------

CREATE TABLE condicion_grupo (
    id        INTEGER PRIMARY KEY AUTOINCREMENT,
    evento_id INTEGER REFERENCES evento(id)  ON DELETE CASCADE,
    efecto_id INTEGER REFERENCES efecto(id)  ON DELETE CASCADE,
    final_id  INTEGER REFERENCES final(id)   ON DELETE CASCADE,
    operador  TEXT NOT NULL DEFAULT 'AND' CHECK (operador IN ('AND','OR')),
    orden     INTEGER NOT NULL DEFAULT 0,
    -- El grupo cuelga de exactamente un dueño.
    -- Sobre un efecto sirve para resultados condicionales: "si el jugador
    -- tiene guita pega onda, si no se le va la chance".
    CHECK (((evento_id IS NOT NULL) + (efecto_id IS NOT NULL) + (final_id IS NOT NULL)) = 1)
);

CREATE TABLE condicion (
    id               INTEGER PRIMARY KEY AUTOINCREMENT,
    grupo_id         INTEGER NOT NULL REFERENCES condicion_grupo(id) ON DELETE CASCADE,
    tipo             TEXT NOT NULL CHECK (tipo IN (
                        'stat','fase','ronda','efecto_aplicado',
                        'respuesta_elegida','evento_visto','historia_estado','flag')),
    negada           INTEGER NOT NULL DEFAULT 0,
    stat_id          INTEGER REFERENCES stat(id)      ON DELETE CASCADE,
    evento_ref_id    INTEGER REFERENCES evento(id)    ON DELETE CASCADE,
    respuesta_ref_id INTEGER REFERENCES respuesta(id) ON DELETE CASCADE,
    efecto_ref_id    INTEGER REFERENCES efecto(id)    ON DELETE CASCADE,
    historia_ref_id  INTEGER REFERENCES historia(id)  ON DELETE CASCADE,
    fase_ref_id      INTEGER REFERENCES fase(id)      ON DELETE CASCADE,
    flag_clave       TEXT,
    operador         TEXT NOT NULL DEFAULT '='
                     CHECK (operador IN ('=','!=','>','<','>=','<=','between')),
    valor_num        REAL,
    valor_num2       REAL,
    valor_texto      TEXT,
    orden            INTEGER NOT NULL DEFAULT 0,
    CHECK (operador <> 'between' OR valor_num2 IS NOT NULL)
);

CREATE INDEX idx_condicion_grupo ON condicion(grupo_id);


-- ---------------------------------------------------------------------
-- 8. Runtime / analytics (opcional: el progreso NO se persiste)
-- ---------------------------------------------------------------------

CREATE TABLE partida (
    id                TEXT PRIMARY KEY,
    jugador_nombre    TEXT,
    jugador_genero    TEXT NOT NULL CHECK (jugador_genero IN ('m','f','nb')),
    datos_extra       TEXT NOT NULL DEFAULT '{}',
    ronda_actual      INTEGER NOT NULL DEFAULT 1,
    terminada         INTEGER NOT NULL DEFAULT 0,
    abandono          INTEGER NOT NULL DEFAULT 0,
    final_id          INTEGER REFERENCES final(id),
    version_contenido TEXT,
    creada_en         TEXT NOT NULL DEFAULT (datetime('now')),
    terminada_en      TEXT
);

CREATE TABLE partida_stat (
    partida_id TEXT    NOT NULL REFERENCES partida(id) ON DELETE CASCADE,
    stat_id    INTEGER NOT NULL REFERENCES stat(id),
    valor      REAL    NOT NULL,
    PRIMARY KEY (partida_id, stat_id)
);

CREATE TABLE partida_log (
    id             INTEGER PRIMARY KEY AUTOINCREMENT,
    partida_id     TEXT NOT NULL REFERENCES partida(id) ON DELETE CASCADE,
    ronda          INTEGER NOT NULL,
    evento_id      INTEGER REFERENCES evento(id),
    respuesta_id   INTEGER REFERENCES respuesta(id),
    efecto_id      INTEGER REFERENCES efecto(id),
    minijuego_id   INTEGER REFERENCES minijuego(id),
    puntaje        REAL,
    snapshot_stats TEXT,
    ocurrido_en    TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_log_partida ON partida_log(partida_id, ronda);

CREATE TABLE partida_minijuego (
    partida_id   TEXT    NOT NULL REFERENCES partida(id) ON DELETE CASCADE,
    fase_id      INTEGER NOT NULL REFERENCES fase(id),
    minijuego_id INTEGER NOT NULL REFERENCES minijuego(id),
    PRIMARY KEY (partida_id, fase_id)
);


-- ---------------------------------------------------------------------
-- 9. Vistas de validación para el editor
-- ---------------------------------------------------------------------

CREATE VIEW v_eventos_invalidos AS
SELECT e.id, e.codigo, e.tipo, COUNT(r.id) AS cant_respuestas,
       CASE
         WHEN COUNT(r.id) = 0 THEN 'sin respuestas'
         WHEN COUNT(r.id) > 4 THEN 'mas de 4 respuestas'
         WHEN e.tipo = 'aviso' AND COUNT(r.id) <> 1 THEN 'aviso debe tener 1 sola respuesta'
       END AS problema
FROM evento e
LEFT JOIN respuesta r ON r.evento_id = e.id
GROUP BY e.id
HAVING COUNT(r.id) = 0
    OR COUNT(r.id) > 4
    OR (e.tipo = 'aviso' AND COUNT(r.id) <> 1);

CREATE VIEW v_respuestas_invalidas AS
SELECT r.id, r.evento_id, COUNT(ef.id) AS cant_efectos,
       COALESCE(SUM(ef.peso), 0) AS peso_total
FROM respuesta r
LEFT JOIN efecto ef ON ef.respuesta_id = r.id
GROUP BY r.id
HAVING COUNT(ef.id) = 0 OR COALESCE(SUM(ef.peso), 0) = 0;
