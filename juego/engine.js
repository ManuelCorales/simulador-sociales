// =====================================================================
//  Motor del juego
//  - Carga todo el contenido de SQLite a memoria una sola vez.
//  - El estado de la partida vive en memoria (no se persiste el progreso).
// =====================================================================

const { abrir, rutaDB } = require('./db/conn');

const DB_PATH = rutaDB();

// ---------------------------------------------------------------------
// Utilidades
// ---------------------------------------------------------------------
const agrupar = (rows, key) => rows.reduce((acc, r) => {
  (acc[r[key]] ||= []).push(r);
  return acc;
}, {});

function elegirPonderado(items, pesoDe = (x) => x.peso) {
  const total = items.reduce((s, i) => s + Math.max(0, pesoDe(i)), 0);
  if (total <= 0) return items.length ? items[Math.floor(Math.random() * items.length)] : null;
  let r = Math.random() * total;
  for (const it of items) {
    r -= Math.max(0, pesoDe(it));
    if (r <= 0) return it;
  }
  return items[items.length - 1];
}

const entero = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

function comparar(valor, operador, a, b) {
  switch (operador) {
    case '=':  return valor === a;
    case '!=': return valor !== a;
    case '>':  return valor > a;
    case '<':  return valor < a;
    case '>=': return valor >= a;
    case '<=': return valor <= a;
    case 'between': return valor >= a && valor <= b;
    default: return false;
  }
}

// ---------------------------------------------------------------------
// Carga de contenido
// ---------------------------------------------------------------------
function cargarContenido() {
  const db = abrir(DB_PATH);
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

const C = cargarContenido();
const TOTAL_RONDAS = Number(C.config.total_rondas ?? 16);

// ---------------------------------------------------------------------
// Texto según género
// ---------------------------------------------------------------------
const tx = (row, campo, genero) => (row ? row[`${campo}_${genero}`] ?? row[`${campo}_m`] : null);

// ---------------------------------------------------------------------
// Estado de partida
// ---------------------------------------------------------------------
function faseDeRonda(ronda) {
  return C.fases.find((f) => ronda >= f.ronda_desde && ronda <= f.ronda_hasta) ?? C.fases[C.fases.length - 1];
}

function sortearMinijuegos() {
  const elegidos = {};
  const usados = new Set();
  for (const fase of C.fases) {
    const cand = (C.minijuegoFasesPorFase[fase.id] ?? [])
      .filter((mf) => !usados.has(mf.minijuego_id))
      .map((mf) => ({ ...mf, mj: C.minijuegosPorId[mf.minijuego_id] }))
      .filter((x) => x.mj);
    const pick = elegirPonderado(cand, (x) => x.peso * (x.mj.peso / 100));
    if (pick) { elegidos[fase.id] = pick.minijuego_id; usados.add(pick.minijuego_id); }
  }
  return elegidos;
}

function crearPartida({ nombre, genero, extra = {} }) {
  const stats = {};
  C.stats.forEach((s) => { stats[s.codigo] = s.valor_inicial; });

  const estado = {
    id: 'p_' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36),
    nombre: (nombre || '').trim() || 'Anónime',
    genero: ['m', 'f', 'nb'].includes(genero) ? genero : 'nb',
    extra,
    ronda: 1,
    stats,
    flags: {},
    eventosVistos: new Set(),
    respuestasElegidas: new Set(),
    efectosAplicados: new Set(),
    ultimaRondaDeEvento: {},
    historias: {},              // historiaId -> { idx, estado, ultimaRonda }
    avisosPendientes: [],       // { eventoId, rondaObjetivo, forzado, prioridad }
    minijuegos: sortearMinijuegos(),
    minijuegosJugados: {},
    pendienteMinijuego: null,   // faseId
    eventoActual: null,
    historia: [],               // log legible
    terminada: false,
    abandono: false,
    finalId: null,
    creada: Date.now(),
  };

  C.historias.forEach((h) => {
    estado.historias[h.id] = { idx: 0, estado: 'no_iniciada', ultimaRonda: -99 };
  });

  return estado;
}

// ---------------------------------------------------------------------
// Evaluación de condiciones
// ---------------------------------------------------------------------
function evaluarCondicion(c, estado) {
  let ok = false;
  switch (c.tipo) {
    case 'stat': {
      const st = C.statsPorId[c.stat_id];
      ok = st ? comparar(estado.stats[st.codigo] ?? 0, c.operador, c.valor_num, c.valor_num2) : false;
      break;
    }
    case 'fase': {
      const fase = faseDeRonda(estado.ronda);
      ok = c.operador === '!=' ? fase.id !== c.fase_ref_id : fase.id === c.fase_ref_id;
      break;
    }
    case 'ronda':
      ok = comparar(estado.ronda, c.operador, c.valor_num, c.valor_num2);
      break;
    case 'efecto_aplicado':
      ok = estado.efectosAplicados.has(c.efecto_ref_id);
      if (c.operador === '!=') ok = !ok;
      break;
    case 'respuesta_elegida':
      ok = estado.respuestasElegidas.has(c.respuesta_ref_id);
      if (c.operador === '!=') ok = !ok;
      break;
    case 'evento_visto':
      ok = estado.eventosVistos.has(c.evento_ref_id);
      if (c.operador === '!=') ok = !ok;
      break;
    case 'historia_estado': {
      const h = estado.historias[c.historia_ref_id];
      ok = h ? comparar(h.estado, c.operador === '!=' ? '!=' : '=', c.valor_texto) : false;
      break;
    }
    case 'flag': {
      const v = estado.flags[c.flag_clave];
      if (c.valor_texto == null) ok = v !== undefined;
      else ok = c.operador === '!=' ? v !== c.valor_texto : v === c.valor_texto;
      break;
    }
    default:
      ok = false;
  }
  return c.negada ? !ok : ok;
}

function evaluarGrupos(grupos, estado) {
  if (!grupos || !grupos.length) return true;
  // Entre grupos siempre AND; dentro de cada grupo manda su operador.
  return grupos.every((g) => (g.operador === 'OR'
    ? g.cs.some((c) => evaluarCondicion(c, estado))
    : g.cs.every((c) => evaluarCondicion(c, estado))));
}

// ---------------------------------------------------------------------
// Elegibilidad de eventos
// ---------------------------------------------------------------------
function disponiblePorRepeticion(ev, estado) {
  if (!estado.eventosVistos.has(ev.id)) return true;
  if (ev.es_unico) return false;
  const ultima = estado.ultimaRondaDeEvento[ev.id] ?? -99;
  return estado.ronda - ultima > ev.cooldown_rondas;
}

function encajaEnRonda(ev, estado) {
  const fase = faseDeRonda(estado.ronda);
  if (ev.fase_id && ev.fase_id !== fase.id) return false;
  if (ev.ronda_min != null && estado.ronda < ev.ronda_min) return false;
  if (ev.ronda_max != null && estado.ronda > ev.ronda_max) return false;
  return true;
}

// Devuelve null si el evento no pertenece a ninguna historia,
// o { ok, factorPeso } si pertenece.
function chequeoHistoria(ev, estado) {
  const he = C.historiaDeEvento[ev.id];
  if (!he) return null;

  const h = C.historiasPorId[he.historia_id];
  const st = estado.historias[h.id];
  if (!h.activa) return { ok: false };

  // Una subhistoria requiere que la historia madre esté en curso o terminada.
  if (h.historia_padre_id) {
    const padre = estado.historias[h.historia_padre_id];
    if (!padre || padre.estado === 'no_iniciada') return { ok: false };
  }

  const eslabones = C.historiaEventosPorHistoria[h.id] ?? [];
  const desdeUltimo = estado.ronda - st.ultimaRonda;

  if (h.modo_secuencia === 'libre') {
    // Cualquier eslabón pendiente, sin orden.
    return { ok: !estado.eventosVistos.has(ev.id), factorPeso: h.peso / 100 };
  }

  // estricta y diferida respetan el orden
  const siguiente = eslabones[st.idx];
  if (!siguiente || siguiente.evento_id !== ev.id) return { ok: false };

  if (st.idx === 0) return { ok: true, factorPeso: h.peso / 100 };

  if (h.modo_secuencia === 'estricta') {
    // Debe salir apenas se pueda. Uso >= 1 (y no === 1) para que un aviso
    // forzado que se cuele en el medio no deje la historia trabada para siempre.
    return { ok: desdeUltimo >= 1, factorPeso: 12 };
  }

  // diferida: hay que esperar gap_min; pasado gap_max se vuelve urgente.
  if (desdeUltimo < h.gap_min) return { ok: false };
  const urgente = desdeUltimo > h.gap_max;
  return { ok: true, factorPeso: (h.peso / 100) * (urgente ? 4 : 1) };
}

function candidatos(estado, { relajado = false } = {}) {
  const out = [];
  for (const ev of C.eventos) {
    if (ev.tipo !== 'normal') continue;
    if (!disponiblePorRepeticion(ev, estado)) continue;
    if (!relajado && !encajaEnRonda(ev, estado)) continue;
    if (!relajado && !evaluarGrupos(C.condicionesEvento[ev.id], estado)) continue;

    const ch = chequeoHistoria(ev, estado);
    if (ch && !ch.ok) continue;

    out.push({ ev, peso: ev.peso * (ch?.factorPeso ?? 1) });
  }
  return out;
}

// ---------------------------------------------------------------------
// Selección del evento de la ronda
// ---------------------------------------------------------------------
function seleccionarEvento(estado) {
  // 1) Aviso vencido: se muestra sí o sí.
  const vencidos = estado.avisosPendientes
    .filter((a) => a.rondaObjetivo <= estado.ronda)
    .sort((a, b) => b.prioridad - a.prioridad);
  if (vencidos.length) {
    const a = vencidos[0];
    estado.avisosPendientes = estado.avisosPendientes.filter((x) => x !== a);
    return { evento: C.eventosPorId[a.eventoId], motivo: 'aviso' };
  }

  // 2) El único evento de abandono, si se dan las condiciones.
  const abandono = C.eventos.find((e) => e.tipo === 'abandono');
  if (abandono && !estado.eventosVistos.has(abandono.id)
      && encajaEnRonda(abandono, estado)
      && evaluarGrupos(C.condicionesEvento[abandono.id], estado)) {
    return { evento: abandono, motivo: 'abandono' };
  }

  // 3) Historia estricta en curso: se fuerza el siguiente eslabón.
  for (const h of C.historias) {
    if (h.modo_secuencia !== 'estricta') continue;
    const st = estado.historias[h.id];
    if (st.estado !== 'activa') continue;
    const eslabones = C.historiaEventosPorHistoria[h.id] ?? [];
    const sig = eslabones[st.idx];
    if (!sig) continue;
    const ev = C.eventosPorId[sig.evento_id];
    if (!ev || !disponiblePorRepeticion(ev, estado)) continue;
    if (!evaluarGrupos(C.condicionesEvento[ev.id], estado)) continue;
    if (estado.ronda - st.ultimaRonda >= 1) return { evento: ev, motivo: 'historia_estricta' };
  }

  // 4) Bolsa ponderada.
  let bolsa = candidatos(estado);
  let motivo = 'bolsa';
  if (!bolsa.length) { bolsa = candidatos(estado, { relajado: true }); motivo = 'bolsa_relajada'; }
  if (!bolsa.length) return null;

  const pick = elegirPonderado(bolsa);
  return { evento: pick.ev, motivo };
}

// ---------------------------------------------------------------------
// Aplicación de efectos
// ---------------------------------------------------------------------
function aplicarDeltas(estado, filas) {
  const deltas = {};
  for (const f of filas) {
    const st = C.statsPorId[f.stat_id];
    if (!st) continue;
    const antes = estado.stats[st.codigo];
    let valor = f.valor;
    if (valor == null) valor = entero(f.valor_min, f.valor_max);

    let nuevo = antes;
    if (f.operacion === 'sumar') nuevo = antes + valor;
    else if (f.operacion === 'fijar') nuevo = valor;
    else if (f.operacion === 'multiplicar') nuevo = antes * valor;

    if (st.clampea) nuevo = Math.max(st.valor_min, Math.min(st.valor_max, nuevo));
    nuevo = Math.round(nuevo);

    estado.stats[st.codigo] = nuevo;
    deltas[st.codigo] = (deltas[st.codigo] ?? 0) + (nuevo - antes);
  }
  return deltas;
}

function programarAvisos(estado, efectoId) {
  (C.disparadoresPorEfecto[efectoId] ?? []).forEach((d) => {
    estado.avisosPendientes.push({
      eventoId: d.evento_destino_id,
      rondaObjetivo: estado.ronda + entero(d.demora_min, d.demora_max),
      forzado: !!d.forzado,
      prioridad: d.prioridad,
    });
  });
}

function avanzarHistoria(estado, evento) {
  const he = C.historiaDeEvento[evento.id];
  if (!he) return;
  const h = C.historiasPorId[he.historia_id];
  const st = estado.historias[h.id];
  const eslabones = C.historiaEventosPorHistoria[h.id] ?? [];

  if (h.modo_secuencia === 'libre') st.idx += 1;
  else st.idx = Math.max(st.idx, eslabones.findIndex((x) => x.evento_id === evento.id) + 1);

  st.ultimaRonda = estado.ronda;
  st.estado = st.idx >= eslabones.length ? 'completa' : 'activa';
}

// ---------------------------------------------------------------------
// Finales
// ---------------------------------------------------------------------
function elegirFinal(estado) {
  const candidatos = C.finales.filter((f) => {
    if (f.requiere_abandono && !estado.abandono) return false;
    if (!f.requiere_abandono && estado.abandono) return false;
    if (f.es_default) return false;
    return evaluarGrupos(C.condicionesFinal[f.id], estado);
  });
  if (candidatos.length) return candidatos[0];              // ya vienen por prioridad DESC
  return C.finales.find((f) => f.es_default) ?? C.finales[C.finales.length - 1];
}

// ---------------------------------------------------------------------
// Serialización para el front
// ---------------------------------------------------------------------
function statsPublicos(estado) {
  return C.stats.filter((s) => s.visible).map((s) => ({
    codigo: s.codigo, nombre: s.nombre, icono: s.icono, color: s.color,
    valor: estado.stats[s.codigo], min: s.valor_min, max: s.valor_max,
  }));
}

// Los stats ocultos (el contador de violencia que alimenta el secret ending)
// no se filtran al front ni en el HUD ni en los deltas ni en el resumen final.
const OCULTOS = new Set(C.stats.filter((s) => !s.visible).map((s) => s.codigo));

function deltasPublicos(deltas) {
  return Object.fromEntries(Object.entries(deltas).filter(([cod]) => !OCULTOS.has(cod)));
}

function pantallaMinijuego(estado, faseId) {
  const mj = C.minijuegosPorId[estado.minijuegos[faseId]];
  const fase = C.fases.find((f) => f.id === faseId);
  return {
    tipo: 'minijuego',
    ronda: estado.ronda, totalRondas: TOTAL_RONDAS,
    fase: { codigo: fase.codigo, nombre: fase.nombre },
    stats: statsPublicos(estado),
    minijuego: {
      id: mj.id, codigo: mj.codigo, nombre: mj.nombre, mecanica: mj.mecanica,
      descripcion: mj.descripcion, ilustracion: mj.ilustracion,
      instrucciones: tx(mj, 'instrucciones', estado.genero),
      config: JSON.parse(mj.config || '{}'),
    },
  };
}

function pantallaEvento(estado) {
  const ev = estado.eventoActual;
  const fase = faseDeRonda(estado.ronda);
  const respuestas = (C.respuestasPorEvento[ev.id] ?? []).map((r) => ({
    id: r.id, orden: r.orden, gesto: r.gesto,
    texto: tx(r, 'texto', estado.genero),
  }));
  return {
    tipo: 'evento',
    ronda: estado.ronda, totalRondas: TOTAL_RONDAS,
    fase: { codigo: fase.codigo, nombre: fase.nombre },
    stats: statsPublicos(estado),
    evento: {
      id: ev.id, codigo: ev.codigo, tipoEvento: ev.tipo, personaje: ev.personaje,
      ilustracion: ev.ilustracion, categoria: ev.categoria,
      titulo: tx(ev, 'titulo', estado.genero),
      texto: tx(ev, 'texto', estado.genero),
      esAviso: ev.tipo === 'aviso',
      terminaPartida: !!ev.termina_partida,
    },
    respuestas,
  };
}

function pantallaFinal(estado) {
  const f = C.finalesPorId ? C.finalesPorId[estado.finalId] : C.finales.find((x) => x.id === estado.finalId);
  return {
    tipo: 'final',
    ronda: estado.ronda, totalRondas: TOTAL_RONDAS,
    stats: statsPublicos(estado),
    abandono: estado.abandono,
    final: {
      codigo: f.codigo,
      ilustracion: f.ilustracion,
      titulo: tx(f, 'titulo', estado.genero),
      texto: tx(f, 'texto', estado.genero),
    },
    resumen: estado.historia,
  };
}

// ---------------------------------------------------------------------
// API del motor
// ---------------------------------------------------------------------
function terminar(estado, { abandono = false } = {}) {
  estado.abandono = abandono;
  estado.terminada = true;
  estado.finalId = elegirFinal(estado).id;
}

function siguiente(estado) {
  if (estado.terminada) return pantallaFinal(estado);

  if (estado.pendienteMinijuego) return pantallaMinijuego(estado, estado.pendienteMinijuego);

  if (!estado.eventoActual) {
    const sel = seleccionarEvento(estado);
    if (!sel) { terminar(estado); return pantallaFinal(estado); }
    estado.eventoActual = sel.evento;
    estado.motivoActual = sel.motivo;
  }
  return pantallaEvento(estado);
}

function responder(estado, respuestaId) {
  if (estado.terminada) return pantallaFinal(estado);
  if (estado.pendienteMinijuego) throw new Error('Hay un minijuego pendiente');

  const ev = estado.eventoActual;
  if (!ev) throw new Error('No hay evento en curso');

  const resp = (C.respuestasPorEvento[ev.id] ?? []).find((r) => r.id === Number(respuestaId));
  if (!resp) throw new Error('Respuesta inválida para este evento');

  const todos = C.efectosPorRespuesta[resp.id] ?? [];
  // Los efectos con condiciones solo compiten si el estado las cumple.
  let efectos = todos.filter((e) => evaluarGrupos(C.condicionesEfecto[e.id], estado));
  if (!efectos.length) efectos = todos.filter((e) => !C.condicionesEfecto[e.id]);
  if (!efectos.length) efectos = todos;

  const efecto = elegirPonderado(efectos) ?? efectos.find((e) => e.es_default);
  if (!efecto) throw new Error('La respuesta no tiene efectos cargados');

  const deltas = aplicarDeltas(estado, C.efectoStatsPorEfecto[efecto.id] ?? []);
  (C.efectoFlagsPorEfecto[efecto.id] ?? []).forEach((f) => { estado.flags[f.clave] = f.valor; });
  programarAvisos(estado, efecto.id);

  estado.eventosVistos.add(ev.id);
  estado.respuestasElegidas.add(resp.id);
  estado.efectosAplicados.add(efecto.id);
  estado.ultimaRondaDeEvento[ev.id] = estado.ronda;
  avanzarHistoria(estado, ev);

  const visibles = deltasPublicos(deltas);

  estado.historia.push({
    ronda: estado.ronda,
    evento: tx(ev, 'titulo', estado.genero) || ev.codigo,
    eventoCodigo: ev.codigo,
    motivo: estado.motivoActual,
    respuesta: tx(resp, 'texto', estado.genero),
    resultado: tx(efecto, 'texto_resultado', estado.genero),
    deltas: visibles,
  });

  const resultado = {
    tipo: 'resultado',
    texto: tx(efecto, 'texto_resultado', estado.genero),
    deltas: visibles,
    stats: statsPublicos(estado),
    ronda: estado.ronda, totalRondas: TOTAL_RONDAS,
  };

  estado.eventoActual = null;

  // ¿Termina la partida? Puede cortar el evento entero o solo este efecto
  // (así "dejás la carrera" es una respuesta más dentro de un evento normal).
  if (ev.termina_partida || efecto.termina_partida) {
    terminar(estado, { abandono: ev.tipo === 'abandono' || !!efecto.es_abandono });
    resultado.siguiente = 'final';
    return resultado;
  }

  const rondaTerminada = estado.ronda;

  if (rondaTerminada >= TOTAL_RONDAS) {
    terminar(estado);
    resultado.siguiente = 'final';
    return resultado;
  }

  // El minijuego va DESPUÉS de cierta ronda y no consume ronda.
  const fase = faseDeRonda(rondaTerminada);
  if (fase.minijuego_despues_de === rondaTerminada
      && !estado.minijuegosJugados[fase.id]
      && estado.minijuegos[fase.id]) {
    estado.pendienteMinijuego = fase.id;
    resultado.siguiente = 'minijuego';
  } else {
    resultado.siguiente = 'evento';
  }

  estado.ronda = rondaTerminada + 1;
  return resultado;
}

function resolverMinijuego(estado, puntaje) {
  const faseId = estado.pendienteMinijuego;
  if (!faseId) throw new Error('No hay minijuego pendiente');

  const mjId = estado.minijuegos[faseId];
  const p = Math.max(0, Math.min(100, Number(puntaje) || 0));
  const resultados = C.mjResultadosPorMinijuego[mjId] ?? [];
  const res = resultados.find((r) => p >= (r.puntaje_min ?? 0) && p <= (r.puntaje_max ?? 100))
           ?? resultados[resultados.length - 1];

  const deltas = deltasPublicos(res
    ? aplicarDeltas(estado, (C.mjResultadoStatsPorResultado[res.id] ?? [])
        .map((r) => ({ ...r, valor_min: null, valor_max: null })))
    : {});

  estado.minijuegosJugados[faseId] = true;
  estado.pendienteMinijuego = null;

  const mj = C.minijuegosPorId[mjId];
  estado.historia.push({
    ronda: estado.ronda - 1,
    evento: `Minijuego: ${mj.nombre}`,
    eventoCodigo: mj.codigo,
    motivo: 'minijuego',
    respuesta: `Puntaje ${Math.round(p)}`,
    resultado: res ? tx(res, 'texto', estado.genero) : null,
    deltas,
  });

  return {
    tipo: 'resultado',
    minijuego: true,
    puntaje: Math.round(p),
    resultadoCodigo: res?.codigo ?? null,
    texto: res ? tx(res, 'texto', estado.genero) : null,
    deltas,
    stats: statsPublicos(estado),
    ronda: estado.ronda, totalRondas: TOTAL_RONDAS,
    siguiente: 'evento',
  };
}

module.exports = {
  C, TOTAL_RONDAS,
  crearPartida, siguiente, responder, resolverMinijuego,
  statsPublicos, pantallaFinal, faseDeRonda,
};
