-- =====================================================================
--  Juego de rol tipo REIGNS — Carrera universitaria
--  Esquema v0.2 — PostgreSQL 14+
--  Notas de dialecto para SQLite al final del archivo.
-- =====================================================================

BEGIN;

-- ---------------------------------------------------------------------
-- 0. TIPOS
-- ---------------------------------------------------------------------

CREATE TYPE modo_secuencia   AS ENUM ('estricta', 'diferida', 'libre');
CREATE TYPE tipo_evento      AS ENUM ('normal', 'aviso', 'abandono');
CREATE TYPE operacion_stat   AS ENUM ('sumar', 'fijar', 'multiplicar');
CREATE TYPE operador_logico  AS ENUM ('AND', 'OR');
CREATE TYPE operador_comp    AS ENUM ('=', '!=', '>', '<', '>=', '<=', 'between');
CREATE TYPE gesto_respuesta  AS ENUM ('izq', 'der', 'arriba', 'abajo');
CREATE TYPE estado_historia  AS ENUM ('no_iniciada', 'activa', 'completa', 'abortada');
CREATE TYPE genero_jugador   AS ENUM ('masculino', 'femenino', 'no_binario');

CREATE TYPE tipo_condicion AS ENUM (
    'stat',              -- valor actual de un stat
    'fase',              -- instancia de la carrera
    'ronda',             -- número de ronda
    'efecto_aplicado',   -- al jugador le tocó tal efecto  <-- caso principal
    'respuesta_elegida', -- el jugador eligió tal respuesta
    'evento_visto',      -- ya pasó por tal evento
    'historia_estado',   -- estado de una historia
    'flag'               -- variable narrativa libre
);


-- =====================================================================
-- 1. CONFIGURACIÓN Y CATÁLOGOS
-- =====================================================================

CREATE TABLE configuracion (
    clave        TEXT PRIMARY KEY,
    valor        TEXT NOT NULL,
    descripcion  TEXT
);
-- total_rondas = 16 | minijuegos_por_partida = 3 | version_contenido = ...


-- Los stats son filas, no columnas: se agregan/sacan sin migrar nada.
CREATE TABLE stat (
    id             SERIAL PRIMARY KEY,
    codigo         TEXT NOT NULL UNIQUE,
    nombre         TEXT NOT NULL,
    descripcion    TEXT,
    valor_inicial  INT  NOT NULL DEFAULT 50,
    valor_min      INT  NOT NULL DEFAULT 0,
    valor_max      INT  NOT NULL DEFAULT 100,
    -- false = se permite guardar el excedente real (pasarse no rompe nada,
    --         pero el final puede querer saber CUÁNTO te pasaste)
    clampea        BOOLEAN NOT NULL DEFAULT TRUE,
    visible        BOOLEAN NOT NULL DEFAULT TRUE,  -- permite stats ocultos (suerte v2)
    orden          INT  NOT NULL DEFAULT 0,
    CHECK (valor_min < valor_max),
    CHECK (valor_inicial BETWEEN valor_min AND valor_max)
);


-- Tramos de la carrera. Las 16 rondas se reparten acá.
CREATE TABLE fase (
    id                       SERIAL PRIMARY KEY,
    codigo                   TEXT NOT NULL UNIQUE,   -- ingresante / intermedio / avanzado
    nombre                   TEXT NOT NULL,
    ronda_desde              INT  NOT NULL,
    ronda_hasta              INT  NOT NULL,
    -- El minijuego NO consume ronda: se muestra DESPUÉS de esta ronda,
    -- como pantalla intercalada.
    minijuego_despues_de     INT,
    orden                    INT  NOT NULL DEFAULT 0,
    CHECK (ronda_desde <= ronda_hasta),
    CHECK (minijuego_despues_de IS NULL
           OR minijuego_despues_de BETWEEN ronda_desde AND ronda_hasta)
);


-- =====================================================================
-- 2. HISTORIAS (con subhistorias)
-- =====================================================================

CREATE TABLE historia (
    id                 SERIAL PRIMARY KEY,
    codigo             TEXT NOT NULL UNIQUE,
    nombre             TEXT NOT NULL,
    descripcion        TEXT,
    historia_padre_id  INT REFERENCES historia(id) ON DELETE CASCADE,

    -- estricta : el siguiente eslabón sale en la ronda inmediata
    -- diferida : pueden meterse otros eventos en el medio (gap_min..gap_max)
    -- libre    : los eventos salen en cualquier orden
    modo_secuencia     modo_secuencia NOT NULL DEFAULT 'diferida',
    gap_min            INT NOT NULL DEFAULT 1,
    gap_max            INT NOT NULL DEFAULT 3,

    peso               INT NOT NULL DEFAULT 100,   -- prioridad frente a otras historias
    exclusiva          BOOLEAN NOT NULL DEFAULT FALSE,
    grupo_exclusion    TEXT,                       -- mientras esté activa bloquea a su grupo
    activa             BOOLEAN NOT NULL DEFAULT TRUE,

    CHECK (gap_min >= 0 AND gap_max >= gap_min),
    CHECK (historia_padre_id IS NULL OR historia_padre_id <> id)
);

CREATE INDEX idx_historia_padre ON historia(historia_padre_id);


-- =====================================================================
-- 3. EVENTOS
-- =====================================================================

CREATE TABLE evento (
    id            SERIAL PRIMARY KEY,
    codigo        TEXT NOT NULL UNIQUE,
    tipo          tipo_evento NOT NULL DEFAULT 'normal',

    -- Tres textos completos, uno por género. Mismos eventos para los 3.
    titulo_m      TEXT,
    titulo_f      TEXT,
    titulo_nb     TEXT,
    texto_m       TEXT NOT NULL,
    texto_f       TEXT NOT NULL,
    texto_nb      TEXT NOT NULL,

    imagen_url    TEXT,
    personaje     TEXT,                            -- quién habla

    -- Probabilidad intrínseca: peso relativo dentro de la bolsa, no un %.
    peso              INT NOT NULL DEFAULT 100 CHECK (peso >= 0),

    fase_id           INT REFERENCES fase(id) ON DELETE SET NULL,
    ronda_min         INT,
    ronda_max         INT,

    es_unico          BOOLEAN NOT NULL DEFAULT TRUE,
    cooldown_rondas   INT NOT NULL DEFAULT 0,      -- solo si es_unico = FALSE
    termina_partida   BOOLEAN NOT NULL DEFAULT FALSE,  -- el evento de abandono
    activo            BOOLEAN NOT NULL DEFAULT TRUE,

    notas_autor       TEXT,

    CHECK (ronda_min IS NULL OR ronda_max IS NULL OR ronda_min <= ronda_max),
    CHECK (tipo <> 'abandono' OR termina_partida = TRUE)
);

CREATE INDEX idx_evento_tipo  ON evento(tipo);
CREATE INDEX idx_evento_fase  ON evento(fase_id);


-- Un evento puede pertenecer a varias historias (raro, pero no lo prohíbo).
CREATE TABLE historia_evento (
    id           SERIAL PRIMARY KEY,
    historia_id  INT NOT NULL REFERENCES historia(id) ON DELETE CASCADE,
    evento_id    INT NOT NULL REFERENCES evento(id)   ON DELETE CASCADE,
    orden        INT NOT NULL,
    obligatorio  BOOLEAN NOT NULL DEFAULT TRUE,   -- si FALSE, se puede saltear
    UNIQUE (historia_id, orden),
    UNIQUE (historia_id, evento_id)
);


-- =====================================================================
-- 4. CONDICIONES DE APARICIÓN
--    Grupos para poder expresar (A AND B) OR (C).
--    El mismo motor sirve para eventos y para finales.
-- =====================================================================

CREATE TABLE condicion_grupo (
    id         SERIAL PRIMARY KEY,
    evento_id  INT REFERENCES evento(id) ON DELETE CASCADE,
    final_id   INT,                                   -- FK agregada más abajo
    operador   operador_logico NOT NULL DEFAULT 'AND',
    orden      INT NOT NULL DEFAULT 0,
    -- Un grupo cuelga de un evento O de un final, nunca de ambos.
    CHECK (num_nonnulls(evento_id, final_id) = 1)
);


CREATE TABLE condicion (
    id            SERIAL PRIMARY KEY,
    grupo_id      INT NOT NULL REFERENCES condicion_grupo(id) ON DELETE CASCADE,
    tipo          tipo_condicion NOT NULL,
    negada        BOOLEAN NOT NULL DEFAULT FALSE,     -- NOT

    -- Referencias tipadas: solo una se usa según `tipo`.
    stat_id           INT REFERENCES stat(id)      ON DELETE CASCADE,
    evento_ref_id     INT REFERENCES evento(id)    ON DELETE CASCADE,
    respuesta_ref_id  INT,                            -- FK más abajo
    efecto_ref_id     INT,                            -- FK más abajo
    historia_ref_id   INT REFERENCES historia(id)  ON DELETE CASCADE,
    fase_ref_id       INT REFERENCES fase(id)      ON DELETE CASCADE,
    flag_clave        TEXT,

    operador      operador_comp NOT NULL DEFAULT '=',
    valor_num     NUMERIC,
    valor_num2    NUMERIC,      -- solo para 'between'
    valor_texto   TEXT,         -- estado_historia, valor de flag, etc.

    orden         INT NOT NULL DEFAULT 0,

    CHECK (operador <> 'between' OR valor_num2 IS NOT NULL),

    -- Cada tipo exige su referencia.
    CHECK (
        (tipo = 'stat'              AND stat_id          IS NOT NULL AND valor_num IS NOT NULL) OR
        (tipo = 'fase'              AND fase_ref_id      IS NOT NULL) OR
        (tipo = 'ronda'             AND valor_num        IS NOT NULL) OR
        (tipo = 'efecto_aplicado'   AND efecto_ref_id    IS NOT NULL) OR
        (tipo = 'respuesta_elegida' AND respuesta_ref_id IS NOT NULL) OR
        (tipo = 'evento_visto'      AND evento_ref_id    IS NOT NULL) OR
        (tipo = 'historia_estado'   AND historia_ref_id  IS NOT NULL AND valor_texto IS NOT NULL) OR
        (tipo = 'flag'              AND flag_clave       IS NOT NULL)
    )
);

CREATE INDEX idx_condicion_grupo ON condicion(grupo_id);


-- =====================================================================
-- 5. RESPUESTAS  (1 a 4 por evento; los avisos tienen exactamente 1)
-- =====================================================================

CREATE TABLE respuesta (
    id         SERIAL PRIMARY KEY,
    evento_id  INT NOT NULL REFERENCES evento(id) ON DELETE CASCADE,
    orden      INT NOT NULL CHECK (orden BETWEEN 1 AND 4),

    texto_m    TEXT NOT NULL,
    texto_f    TEXT NOT NULL,
    texto_nb   TEXT NOT NULL,

    gesto      gesto_respuesta,        -- para UI tipo swipe
    muestra_hint BOOLEAN NOT NULL DEFAULT FALSE,  -- adelantar qué stats toca

    UNIQUE (evento_id, orden)
);

CREATE INDEX idx_respuesta_evento ON respuesta(evento_id);


-- =====================================================================
-- 6. EFECTOS  (resultados probabilísticos de una respuesta)
-- =====================================================================

CREATE TABLE efecto (
    id                 SERIAL PRIMARY KEY,
    respuesta_id       INT NOT NULL REFERENCES respuesta(id) ON DELETE CASCADE,

    -- Peso relativo DENTRO de la respuesta. Ej: 70 / 20 / 10.
    peso               INT NOT NULL DEFAULT 100 CHECK (peso >= 0),
    es_default         BOOLEAN NOT NULL DEFAULT FALSE,

    texto_resultado_m  TEXT,
    texto_resultado_f  TEXT,
    texto_resultado_nb TEXT,

    codigo             TEXT,   -- opcional, para referenciarlo desde condiciones
    UNIQUE (respuesta_id, codigo)
);

CREATE INDEX idx_efecto_respuesta ON efecto(respuesta_id);


-- Cambios de stats que produce un efecto.
CREATE TABLE efecto_stat (
    id          SERIAL PRIMARY KEY,
    efecto_id   INT NOT NULL REFERENCES efecto(id) ON DELETE CASCADE,
    stat_id     INT NOT NULL REFERENCES stat(id)   ON DELETE CASCADE,
    operacion   operacion_stat NOT NULL DEFAULT 'sumar',
    valor       NUMERIC,        -- puede ser negativo
    -- Alternativa: rango aleatorio en vez de valor fijo
    valor_min   NUMERIC,
    valor_max   NUMERIC,
    UNIQUE (efecto_id, stat_id),
    CHECK (valor IS NOT NULL OR (valor_min IS NOT NULL AND valor_max IS NOT NULL))
);


-- Variables narrativas libres que setea un efecto.
CREATE TABLE efecto_flag (
    id         SERIAL PRIMARY KEY,
    efecto_id  INT NOT NULL REFERENCES efecto(id) ON DELETE CASCADE,
    clave      TEXT NOT NULL,
    valor      TEXT NOT NULL DEFAULT 'true',
    UNIQUE (efecto_id, clave)
);


-- AVISOS: un efecto programa un evento futuro (tipo = 'aviso').
-- El aviso consume ronda y tiene exactamente 1 respuesta ("Entendido").
CREATE TABLE efecto_disparador (
    id                 SERIAL PRIMARY KEY,
    efecto_id          INT NOT NULL REFERENCES efecto(id) ON DELETE CASCADE,
    evento_destino_id  INT NOT NULL REFERENCES evento(id) ON DELETE CASCADE,
    demora_min         INT NOT NULL DEFAULT 1,
    demora_max         INT NOT NULL DEFAULT 3,
    forzado            BOOLEAN NOT NULL DEFAULT TRUE,  -- al vencer, se muestra sí o sí
    prioridad          INT NOT NULL DEFAULT 100,
    CHECK (demora_min >= 0 AND demora_max >= demora_min)
);

CREATE INDEX idx_disparador_efecto ON efecto_disparador(efecto_id);


-- FKs diferidas de `condicion` (necesitaban que respuesta y efecto existieran)
ALTER TABLE condicion
    ADD CONSTRAINT fk_condicion_respuesta
        FOREIGN KEY (respuesta_ref_id) REFERENCES respuesta(id) ON DELETE CASCADE,
    ADD CONSTRAINT fk_condicion_efecto
        FOREIGN KEY (efecto_ref_id)    REFERENCES efecto(id)    ON DELETE CASCADE;


-- =====================================================================
-- 7. MINIJUEGOS  (7 definidos, 3 por partida, NO consumen ronda)
-- =====================================================================

CREATE TABLE minijuego (
    id           SERIAL PRIMARY KEY,
    codigo       TEXT NOT NULL UNIQUE,
    nombre       TEXT NOT NULL,
    descripcion  TEXT,
    instrucciones_m  TEXT,
    instrucciones_f  TEXT,
    instrucciones_nb TEXT,
    config       JSONB NOT NULL DEFAULT '{}',   -- dificultad, duración, assets…
    peso         INT NOT NULL DEFAULT 100,      -- para el sorteo de los 3
    activo       BOOLEAN NOT NULL DEFAULT TRUE
);


-- En qué fases puede caer cada minijuego.
CREATE TABLE minijuego_fase (
    minijuego_id  INT NOT NULL REFERENCES minijuego(id) ON DELETE CASCADE,
    fase_id       INT NOT NULL REFERENCES fase(id)      ON DELETE CASCADE,
    peso          INT NOT NULL DEFAULT 100,
    PRIMARY KEY (minijuego_id, fase_id)
);


CREATE TABLE minijuego_resultado (
    id            SERIAL PRIMARY KEY,
    minijuego_id  INT NOT NULL REFERENCES minijuego(id) ON DELETE CASCADE,
    codigo        TEXT NOT NULL,          -- exito / parcial / fallo
    puntaje_min   NUMERIC,
    puntaje_max   NUMERIC,
    texto_m       TEXT,
    texto_f       TEXT,
    texto_nb      TEXT,
    UNIQUE (minijuego_id, codigo)
);


CREATE TABLE minijuego_resultado_stat (
    id            SERIAL PRIMARY KEY,
    resultado_id  INT NOT NULL REFERENCES minijuego_resultado(id) ON DELETE CASCADE,
    stat_id       INT NOT NULL REFERENCES stat(id) ON DELETE CASCADE,
    operacion     operacion_stat NOT NULL DEFAULT 'sumar',
    valor         NUMERIC NOT NULL,
    UNIQUE (resultado_id, stat_id)
);


-- =====================================================================
-- 8. FINALES
-- =====================================================================

CREATE TABLE final (
    id                 SERIAL PRIMARY KEY,
    codigo             TEXT NOT NULL UNIQUE,
    titulo_m           TEXT NOT NULL,
    titulo_f           TEXT NOT NULL,
    titulo_nb          TEXT NOT NULL,
    texto_m            TEXT NOT NULL,
    texto_f            TEXT NOT NULL,
    texto_nb           TEXT NOT NULL,
    imagen_url         TEXT,
    -- Se evalúan de mayor a menor prioridad; gana el primero que cumple.
    prioridad          INT NOT NULL DEFAULT 0,
    es_default         BOOLEAN NOT NULL DEFAULT FALSE,
    requiere_abandono  BOOLEAN NOT NULL DEFAULT FALSE
);

ALTER TABLE condicion_grupo
    ADD CONSTRAINT fk_grupo_final
        FOREIGN KEY (final_id) REFERENCES final(id) ON DELETE CASCADE;

-- Solo puede haber un final por defecto.
CREATE UNIQUE INDEX uq_final_default ON final(es_default) WHERE es_default;


-- =====================================================================
-- 9. RUNTIME / ANALYTICS  (opcional — el progreso NO se persiste)
--    Dejar estas tablas solo si querés métricas de partidas terminadas.
-- =====================================================================

CREATE TABLE partida (
    id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    jugador_nombre     TEXT,
    jugador_genero     genero_jugador NOT NULL,
    datos_extra        JSONB NOT NULL DEFAULT '{}',
    ronda_actual       INT NOT NULL DEFAULT 1,
    terminada          BOOLEAN NOT NULL DEFAULT FALSE,
    abandono           BOOLEAN NOT NULL DEFAULT FALSE,
    final_id           INT REFERENCES final(id),
    version_contenido  TEXT,
    creada_en          TIMESTAMPTZ NOT NULL DEFAULT now(),
    terminada_en       TIMESTAMPTZ
);

CREATE TABLE partida_stat (
    partida_id  UUID NOT NULL REFERENCES partida(id) ON DELETE CASCADE,
    stat_id     INT  NOT NULL REFERENCES stat(id),
    valor       NUMERIC NOT NULL,
    PRIMARY KEY (partida_id, stat_id)
);

CREATE TABLE partida_log (
    id            BIGSERIAL PRIMARY KEY,
    partida_id    UUID NOT NULL REFERENCES partida(id) ON DELETE CASCADE,
    ronda         INT NOT NULL,
    evento_id     INT REFERENCES evento(id),
    respuesta_id  INT REFERENCES respuesta(id),
    efecto_id     INT REFERENCES efecto(id),
    minijuego_id  INT REFERENCES minijuego(id),
    puntaje       NUMERIC,
    snapshot_stats JSONB,
    ocurrido_en   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_log_partida ON partida_log(partida_id, ronda);

CREATE TABLE partida_minijuego (
    partida_id    UUID NOT NULL REFERENCES partida(id) ON DELETE CASCADE,
    fase_id       INT  NOT NULL REFERENCES fase(id),
    minijuego_id  INT  NOT NULL REFERENCES minijuego(id),
    PRIMARY KEY (partida_id, fase_id)
);


-- =====================================================================
-- 10. VISTAS DE VALIDACIÓN PARA EL EDITOR
-- =====================================================================

-- Eventos mal armados: sin respuestas, con más de 4, o avisos que no tienen
-- exactamente una respuesta.
CREATE VIEW v_eventos_invalidos AS
SELECT e.id, e.codigo, e.tipo, COUNT(r.id) AS cant_respuestas,
       CASE
         WHEN COUNT(r.id) = 0 THEN 'sin respuestas'
         WHEN COUNT(r.id) > 4 THEN 'más de 4 respuestas'
         WHEN e.tipo = 'aviso' AND COUNT(r.id) <> 1 THEN 'aviso debe tener 1 sola respuesta'
       END AS problema
FROM evento e
LEFT JOIN respuesta r ON r.evento_id = e.id
GROUP BY e.id
HAVING COUNT(r.id) = 0
    OR COUNT(r.id) > 4
    OR (e.tipo = 'aviso' AND COUNT(r.id) <> 1);


-- Respuestas sin efectos o con pesos que suman 0.
CREATE VIEW v_respuestas_invalidas AS
SELECT r.id, r.evento_id, COUNT(ef.id) AS cant_efectos,
       COALESCE(SUM(ef.peso), 0) AS peso_total
FROM respuesta r
LEFT JOIN efecto ef ON ef.respuesta_id = r.id
GROUP BY r.id
HAVING COUNT(ef.id) = 0 OR COALESCE(SUM(ef.peso), 0) = 0;


-- Debe existir exactamente un evento de abandono.
CREATE VIEW v_chequeo_abandono AS
SELECT COUNT(*) AS cant_eventos_abandono
FROM evento WHERE tipo = 'abandono' AND activo;


COMMIT;


-- =====================================================================
--  CONSULTA CLAVE: armado de la "bolsa" de eventos de la ronda actual
--  (pseudo-query; los :params los inyecta el motor con el estado en memoria)
-- =====================================================================
/*
WITH candidatos AS (
    SELECT e.*
    FROM evento e
    WHERE e.activo
      AND e.tipo <> 'abandono'
      AND (e.fase_id   IS NULL OR e.fase_id  = :fase_actual)
      AND (e.ronda_min IS NULL OR :ronda >= e.ronda_min)
      AND (e.ronda_max IS NULL OR :ronda <= e.ronda_max)
      AND e.id <> ALL(:eventos_ya_vistos_unicos)
      AND e.id <> ALL(:eventos_en_cooldown)
)
SELECT c.id, c.peso
FROM candidatos c
WHERE evaluar_condiciones(c.id, :estado_json)   -- resuelto en el motor
ORDER BY random() * -ln(random()) / c.peso      -- sorteo ponderado
LIMIT 1;

-- Orden de precedencia real, antes de este sorteo:
--   1. Aviso forzado vencido           -> se muestra sí o sí
--   2. Historia 'estricta' en curso    -> siguiente eslabón, sin sorteo
--   3. Historia 'diferida' con gap ok  -> entra a la bolsa con peso x N
--   4. Resto de la bolsa               -> sorteo ponderado
*/


-- =====================================================================
--  NOTAS PARA SQLite (si el juego corre 100% en el navegador)
-- =====================================================================
/*
 - Reemplazar los ENUM por TEXT + CHECK (col IN ('a','b',...)).
 - SERIAL -> INTEGER PRIMARY KEY AUTOINCREMENT.
 - JSONB  -> TEXT (con json_extract).
 - num_nonnulls(a,b)=1 -> ((a IS NOT NULL) + (b IS NOT NULL)) = 1
 - gen_random_uuid()   -> generarlo en la app.
 - TIMESTAMPTZ -> TEXT ISO-8601.
 - Índices parciales (WHERE) sí están soportados.
*/
