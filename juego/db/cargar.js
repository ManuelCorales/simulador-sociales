// =====================================================================
//  Carga el contenido del juego desde SQLite a un objeto plano.
//  Solo Node: lo usan el build (para volcarlo a JSON) y los tests.
//  El navegador nunca pasa por acá: recibe el JSON ya hecho.
// =====================================================================

const { abrir, rutaDB } = require('./conn');

const agrupar = (rows, key) => rows.reduce((acc, r) => {
  (acc[r[key]] ||= []).push(r);
  return acc;
}, {});

function cargarContenido(ruta = rutaDB()) {
  const db = abrir(ruta);
  const q = (sql) => db.prepare(sql).all();

  const stats = q('SELECT * FROM stat ORDER BY orden, id');
  const fases = q('SELECT * FROM fase ORDER BY orden, id');
  const historias = q('SELECT * FROM historia');
  const eventos = q('SELECT * FROM evento WHERE activo = 1');
  const respuestas = q('SELECT * FROM respuesta ORDER BY evento_id, orden');
  const efectos = q('SELECT * FROM efecto');
  const efectoStats = q('SELECT * FROM efecto_stat');
  const efectoFlags = q('SELECT * FROM efecto_flag');
  const disparadores = q('SELECT * FROM efecto_disparador');
  const historiaEventos = q('SELECT * FROM historia_evento ORDER BY historia_id, orden');
  const grupos = q('SELECT * FROM condicion_grupo ORDER BY orden, id');
  const condiciones = q('SELECT * FROM condicion ORDER BY orden, id');
  const minijuegos = q('SELECT * FROM minijuego WHERE activo = 1');
  const minijuegoFases = q('SELECT * FROM minijuego_fase');
  const mjResultados = q('SELECT * FROM minijuego_resultado');
  const mjResultadoStats = q('SELECT * FROM minijuego_resultado_stat');
  const finales = q('SELECT * FROM final ORDER BY prioridad DESC, id');
  const config = q('SELECT * FROM configuracion');

  db.close();

  const porId = (rows) => Object.fromEntries(rows.map((r) => [r.id, r]));
  const condPorGrupo = agrupar(condiciones, 'grupo_id');

  // Grupos con sus condiciones resueltas, indexados por dueño
  const armarGrupos = (filtro) => grupos.filter(filtro).map((g) => ({
    operador: g.operador,
    cs: condPorGrupo[g.id] ?? [],
  }));

  const condicionesEvento = {};
  eventos.forEach((e) => {
    const gs = armarGrupos((g) => g.evento_id === e.id);
    if (gs.length) condicionesEvento[e.id] = gs;
  });

  const condicionesFinal = {};
  finales.forEach((f) => {
    const gs = armarGrupos((g) => g.final_id === f.id);
    if (gs.length) condicionesFinal[f.id] = gs;
  });

  // Efectos condicionales: el resultado depende del estado del jugador.
  const condicionesEfecto = {};
  efectos.forEach((ef) => {
    const gs = armarGrupos((g) => g.efecto_id === ef.id);
    if (gs.length) condicionesEfecto[ef.id] = gs;
  });

  const historiaDeEvento = {};
  historiaEventos.forEach((he) => { historiaDeEvento[he.evento_id] = he; });

  return {
    config: Object.fromEntries(config.map((c) => [c.clave, c.valor])),
    stats,
    statsPorId: porId(stats),
    fases,
    historias,
    historiasPorId: porId(historias),
    eventos,
    eventosPorId: porId(eventos),
    eventosPorCodigo: Object.fromEntries(eventos.map((e) => [e.codigo, e])),
    respuestasPorEvento: agrupar(respuestas, 'evento_id'),
    respuestasPorId: porId(respuestas),
    efectosPorRespuesta: agrupar(efectos, 'respuesta_id'),
    efectosPorId: porId(efectos),
    efectoStatsPorEfecto: agrupar(efectoStats, 'efecto_id'),
    efectoFlagsPorEfecto: agrupar(efectoFlags, 'efecto_id'),
    disparadoresPorEfecto: agrupar(disparadores, 'efecto_id'),
    historiaEventosPorHistoria: agrupar(historiaEventos, 'historia_id'),
    historiaDeEvento,
    condicionesEvento,
    condicionesFinal,
    condicionesEfecto,
    minijuegos,
    minijuegosPorId: porId(minijuegos),
    minijuegoFasesPorFase: agrupar(minijuegoFases, 'fase_id'),
    mjResultadosPorMinijuego: agrupar(mjResultados, 'minijuego_id'),
    mjResultadoStatsPorResultado: agrupar(mjResultadoStats, 'resultado_id'),
    finales,
    finalesPorId: porId(finales),
  };
}

module.exports = { cargarContenido };
