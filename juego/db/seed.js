// =====================================================================
//  Crea game.db desde cero: aplica schema.sql y carga contenido.js
//  Uso: npm run seed
// =====================================================================

const fs = require('fs');
const path = require('path');
const { abrir, rutaDB } = require('./conn');
const C = require('./contenido');

const DB_PATH = rutaDB();
const SCHEMA = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');

for (const f of [DB_PATH, DB_PATH + '-wal', DB_PATH + '-shm']) {
  if (fs.existsSync(f)) fs.unlinkSync(f);
}

let db;
try {
  db = abrir(DB_PATH);
  db.exec(SCHEMA);
} catch (err) {
  console.error(`\nNo se pudo crear la base en:\n  ${DB_PATH}`);
  console.error(`  (${path.resolve(DB_PATH).length} caracteres de ruta)\n`);
  console.error(`Motivo: ${err.message}\n`);
  if (process.platform === 'win32' && path.resolve(DB_PATH).length > 230) {
    console.error('La ruta es muy larga: Windows corta en 260 caracteres y SQLite');
    console.error('necesita crear archivos auxiliares al lado de la base.\n');
  }
  console.error('Movete a una carpeta más corta, o apuntá la base a otro lado:');
  console.error('  Windows PowerShell:  $env:DB_PATH="C:\\juego\\game.db"; npm run seed');
  console.error('  macOS / Linux:       DB_PATH=~/game.db npm run seed\n');
  console.error('Después arrancá el servidor con la misma variable seteada.\n');
  process.exit(1);
}

// --- índices en memoria para resolver códigos -> ids -------------------
const idStat = {}, idFase = {}, idHistoria = {}, idEvento = {}, idEfecto = {}, idFinal = {};

const bool = (v) => (v ? 1 : 0);

// ---------------------------------------------------------------------
// Configuración
// ---------------------------------------------------------------------
const insConf = db.prepare('INSERT INTO configuracion (clave, valor, descripcion) VALUES (?,?,?)');
insConf.run('total_rondas', '9', 'Eventos de una partida completa. Con los 3 minijuegos dan 12 cartas.');
insConf.run('minijuegos_por_partida', '3', 'Uno por fase, no consumen ronda');
insConf.run('avisos_en_rondas', '4,7', 'Slots de aviso obligatorio. Cartas extra, no consumen ronda.');
insConf.run('stats_iniciales_min', '24', 'Piso del sorteo de stats al empezar');
insConf.run('stats_iniciales_max', '36', 'Techo del sorteo de stats al empezar');
insConf.run('version_contenido', '0.1.0', 'Version del set de contenido cargado');

// ---------------------------------------------------------------------
// Stats
// ---------------------------------------------------------------------
const insStat = db.prepare(`
  INSERT INTO stat (codigo, nombre, descripcion, color, icono, valor_inicial, valor_min, valor_max, clampea, visible, orden)
  VALUES (@codigo, @nombre, @descripcion, @color, @icono, @valor_inicial, @valor_min, @valor_max, @clampea, @visible, @orden)`);

C.stats.forEach((s, i) => {
  const r = insStat.run({
    codigo: s.codigo, nombre: s.nombre, descripcion: s.descripcion ?? null,
    color: s.color ?? null, icono: s.icono ?? null,
    valor_inicial: s.valor_inicial ?? 50, valor_min: s.valor_min ?? 0, valor_max: s.valor_max ?? 100,
    clampea: bool(s.clampea ?? true), visible: bool(s.visible ?? true), orden: s.orden ?? i,
  });
  idStat[s.codigo] = r.lastInsertRowid;
});

// ---------------------------------------------------------------------
// Fases
// ---------------------------------------------------------------------
const insFase = db.prepare(`
  INSERT INTO fase (codigo, nombre, ronda_desde, ronda_hasta, minijuego_despues_de, orden)
  VALUES (@codigo, @nombre, @ronda_desde, @ronda_hasta, @minijuego_despues_de, @orden)`);

C.fases.forEach((f) => {
  const r = insFase.run({ ...f, minijuego_despues_de: f.minijuego_despues_de ?? null });
  idFase[f.codigo] = r.lastInsertRowid;
});

// ---------------------------------------------------------------------
// Historias (dos pasadas por historia_padre_id)
// ---------------------------------------------------------------------
const insHist = db.prepare(`
  INSERT INTO historia (codigo, nombre, descripcion, modo_secuencia, gap_min, gap_max, peso, exclusiva, grupo_exclusion, activa)
  VALUES (@codigo, @nombre, @descripcion, @modo_secuencia, @gap_min, @gap_max, @peso, @exclusiva, @grupo_exclusion, 1)`);

C.historias.forEach((h) => {
  const r = insHist.run({
    codigo: h.codigo, nombre: h.nombre, descripcion: h.descripcion ?? null,
    modo_secuencia: h.modo_secuencia ?? 'diferida',
    gap_min: h.gap_min ?? 1, gap_max: h.gap_max ?? 3,
    peso: h.peso ?? 100, exclusiva: bool(h.exclusiva), grupo_exclusion: h.grupo_exclusion ?? null,
  });
  idHistoria[h.codigo] = r.lastInsertRowid;
});

const updPadre = db.prepare('UPDATE historia SET historia_padre_id = ? WHERE id = ?');
C.historias.filter((h) => h.padre).forEach((h) => {
  updPadre.run(idHistoria[h.padre], idHistoria[h.codigo]);
});

// ---------------------------------------------------------------------
// Eventos
// ---------------------------------------------------------------------
const insEvento = db.prepare(`
  INSERT INTO evento (codigo, tipo, titulo_m, titulo_f, titulo_nb, texto_m, texto_f, texto_nb,
                      imagen_url, ilustracion, personaje, categoria, peso, fase_id, ronda_min, ronda_max,
                      es_unico, cooldown_rondas, termina_partida, activo, notas_autor)
  VALUES (@codigo, @tipo, @titulo_m, @titulo_f, @titulo_nb, @texto_m, @texto_f, @texto_nb,
          @imagen_url, @ilustracion, @personaje, @categoria, @peso, @fase_id, @ronda_min, @ronda_max,
          @es_unico, @cooldown_rondas, @termina_partida, 1, @notas_autor)`);

C.eventos.forEach((e) => {
  const tit = e.titulo ?? { m: null, f: null, nb: null };
  const r = insEvento.run({
    codigo: e.codigo, tipo: e.tipo ?? 'normal',
    titulo_m: tit.m, titulo_f: tit.f, titulo_nb: tit.nb,
    texto_m: e.texto.m, texto_f: e.texto.f, texto_nb: e.texto.nb,
    imagen_url: e.imagen_url ?? null, ilustracion: e.ilustracion ?? null,
    personaje: e.personaje ?? null,
    categoria: e.categoria ?? null,
    peso: e.peso ?? 100,
    fase_id: e.fase ? idFase[e.fase] : null,
    ronda_min: e.ronda_min ?? null, ronda_max: e.ronda_max ?? null,
    es_unico: bool(e.es_unico ?? true), cooldown_rondas: e.cooldown_rondas ?? 0,
    termina_partida: bool(e.termina_partida), notas_autor: e.notas_autor ?? null,
  });
  idEvento[e.codigo] = r.lastInsertRowid;
});

// Vínculo evento <-> historia
const insHistEv = db.prepare(
  'INSERT INTO historia_evento (historia_id, evento_id, orden, obligatorio) VALUES (?,?,?,?)');
C.eventos.filter((e) => e.historia).forEach((e) => {
  insHistEv.run(idHistoria[e.historia], idEvento[e.codigo], e.historia_orden, bool(e.obligatorio ?? true));
});

// ---------------------------------------------------------------------
// Respuestas, efectos, deltas de stats, flags
// ---------------------------------------------------------------------
const insResp = db.prepare(`
  INSERT INTO respuesta (evento_id, orden, texto_m, texto_f, texto_nb, gesto, muestra_hint)
  VALUES (?,?,?,?,?,?,?)`);
const insEf = db.prepare(`
  INSERT INTO efecto (respuesta_id, peso, es_default, texto_resultado_m, texto_resultado_f,
                      texto_resultado_nb, codigo, termina_partida, es_abandono)
  VALUES (?,?,?,?,?,?,?,?,?)`);
const insEfStat = db.prepare(`
  INSERT INTO efecto_stat (efecto_id, stat_id, operacion, valor, valor_min, valor_max)
  VALUES (?,?,?,?,?,?)`);
const insEfFlag = db.prepare('INSERT INTO efecto_flag (efecto_id, clave, valor) VALUES (?,?,?)');

const disparadoresPendientes = [];

// A qué aviso de familia manda un efecto, según su cambio más grande.
// La violencia gana siempre: si escalaste, eso es lo que vuelve, no que de
// paso hayas ganado un poco de fama.
const FAMILIA_POR_CODIGO = Object.fromEntries(
  C.avisosDeFamilia.map((a) => [a.familia, a.codigo]));

function familiaDeEfecto(stats = {}) {
  const num = (v) => (Array.isArray(v) ? (v[0] + v[1]) / 2 : v);
  if (num(stats.violencia) > 0) return FAMILIA_POR_CODIGO['violencia+'];

  let mejor = null, mayor = 0;
  for (const cod of ['guita', 'conocimiento', 'fama', 'politica']) {
    const v = num(stats[cod]);
    if (v == null || v === 0) continue;
    if (Math.abs(v) > mayor) { mayor = Math.abs(v); mejor = cod + (v > 0 ? '+' : '-'); }
  }
  return mejor ? FAMILIA_POR_CODIGO[mejor] : null;
}
const condicionesEfectoPendientes = [];

C.eventos.forEach((e) => {
  const evId = idEvento[e.codigo];
  (e.respuestas ?? []).forEach((resp, i) => {
    const rid = insResp.run(evId, i + 1, resp.texto.m, resp.texto.f, resp.texto.nb,
      resp.gesto ?? null, bool(resp.muestra_hint)).lastInsertRowid;

    (resp.efectos ?? []).forEach((ef) => {
      const txt = ef.texto ?? { m: null, f: null, nb: null };
      const efId = insEf.run(rid, ef.peso ?? 100, bool(ef.es_default),
        txt.m, txt.f, txt.nb, ef.codigo ?? null,
        bool(ef.termina_partida || ef.es_abandono), bool(ef.es_abandono)).lastInsertRowid;

      if (ef.codigo) {
        if (idEfecto[ef.codigo]) throw new Error(`Código de efecto duplicado: ${ef.codigo}`);
        idEfecto[ef.codigo] = efId;
      }

      // Efectos condicionales: "si el jugador tiene guita pega onda".
      const gruposEf = ef.cond_grupos ?? (ef.cond ? [{ op: 'AND', cs: ef.cond }] : []);
      if (gruposEf.length) condicionesEfectoPendientes.push({ efId, grupos: gruposEf });

      Object.entries(ef.stats ?? {}).forEach(([cod, v]) => {
        if (!idStat[cod]) throw new Error(`Stat inexistente "${cod}" en evento ${e.codigo}`);
        if (Array.isArray(v)) insEfStat.run(efId, idStat[cod], 'sumar', null, v[0], v[1]);
        else insEfStat.run(efId, idStat[cod], 'sumar', v, null, null);
      });

      Object.entries(ef.flags ?? {}).forEach(([k, v]) => insEfFlag.run(efId, k, String(v)));

      // Cada efecto tiene que poder volver como aviso, porque la partida
      // garantiza dos y los elige entre las decisiones que el jugador tomó de
      // verdad. Si el efecto declara un aviso propio, gana ese (prioridad
      // alta); si no, se le asigna el aviso de familia que corresponda a su
      // cambio más grande. Los avisos no se disparan a sí mismos.
      if (ef.aviso) {
        disparadoresPendientes.push({ efId, prioridad: 500, ...ef.aviso });
      } else if (e.tipo !== 'aviso') {
        const fam = familiaDeEfecto(ef.stats);
        if (fam) disparadoresPendientes.push({ efId, evento: fam, prioridad: 100 });
      }
    });
  });
});

// AVISOS
const insDisp = db.prepare(`
  INSERT INTO efecto_disparador (efecto_id, evento_destino_id, demora_min, demora_max, forzado, prioridad)
  VALUES (?,?,?,?,?,?)`);
disparadoresPendientes.forEach((d) => {
  if (!idEvento[d.evento]) throw new Error(`Aviso inexistente: ${d.evento}`);
  insDisp.run(d.efId, idEvento[d.evento], d.demora_min ?? 1, d.demora_max ?? 3,
    bool(d.forzado ?? true), d.prioridad ?? 100);
});

// ---------------------------------------------------------------------
// Minijuegos
// ---------------------------------------------------------------------
const insMj = db.prepare(`
  INSERT INTO minijuego (codigo, nombre, descripcion, ilustracion, mecanica,
                         instrucciones_m, instrucciones_f, instrucciones_nb, config, peso, activo)
  VALUES (?,?,?,?,?,?,?,?,?,?,1)`);
const insMjFase = db.prepare('INSERT INTO minijuego_fase (minijuego_id, fase_id, peso) VALUES (?,?,?)');
const insMjRes = db.prepare(`
  INSERT INTO minijuego_resultado (minijuego_id, codigo, puntaje_min, puntaje_max, texto_m, texto_f, texto_nb)
  VALUES (?,?,?,?,?,?,?)`);
const insMjResStat = db.prepare(
  'INSERT INTO minijuego_resultado_stat (resultado_id, stat_id, operacion, valor) VALUES (?,?,?,?)');

C.minijuegos.forEach((m) => {
  const ins = m.instrucciones ?? { m: null, f: null, nb: null };
  const mid = insMj.run(m.codigo, m.nombre, m.descripcion ?? null, m.ilustracion ?? null, m.mecanica,
    ins.m, ins.f, ins.nb, JSON.stringify(m.config ?? {}), m.peso ?? 100).lastInsertRowid;

  (m.fases ?? []).forEach((f) => insMjFase.run(mid, idFase[f], 100));

  (m.resultados ?? []).forEach((res) => {
    const t = res.texto ?? { m: null, f: null, nb: null };
    const rid = insMjRes.run(mid, res.codigo, res.min, res.max, t.m, t.f, t.nb).lastInsertRowid;
    Object.entries(res.stats ?? {}).forEach(([cod, v]) => insMjResStat.run(rid, idStat[cod], 'sumar', v));
  });
});

// ---------------------------------------------------------------------
// Finales
// ---------------------------------------------------------------------
const insFinal = db.prepare(`
  INSERT INTO final (codigo, titulo_m, titulo_f, titulo_nb, texto_m, texto_f, texto_nb,
                     imagen_url, ilustracion, prioridad, es_default, requiere_abandono)
  VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`);

C.finales.forEach((f) => {
  const id = insFinal.run(f.codigo, f.titulo.m, f.titulo.f, f.titulo.nb,
    f.texto.m, f.texto.f, f.texto.nb, f.imagen_url ?? null, f.ilustracion ?? null,
    f.prioridad ?? 0, bool(f.es_default), bool(f.requiere_abandono)).lastInsertRowid;
  idFinal[f.codigo] = id;
});

// ---------------------------------------------------------------------
// Condiciones (al final: pueden referenciar cualquier cosa)
// ---------------------------------------------------------------------
const insGrupo = db.prepare(
  'INSERT INTO condicion_grupo (evento_id, efecto_id, final_id, operador, orden) VALUES (?,?,?,?,?)');
const insCond = db.prepare(`
  INSERT INTO condicion (grupo_id, tipo, negada, stat_id, evento_ref_id, respuesta_ref_id,
                         efecto_ref_id, historia_ref_id, fase_ref_id, flag_clave,
                         operador, valor_num, valor_num2, valor_texto, orden)
  VALUES (@grupo_id, @tipo, @negada, @stat_id, @evento_ref_id, @respuesta_ref_id,
          @efecto_ref_id, @historia_ref_id, @fase_ref_id, @flag_clave,
          @operador, @valor_num, @valor_num2, @valor_texto, @orden)`);

function cargarCondiciones(owner, grupos) {
  grupos.forEach((g, gi) => {
    const gid = insGrupo.run(owner.evento_id ?? null, owner.efecto_id ?? null,
      owner.final_id ?? null, g.op ?? 'AND', gi).lastInsertRowid;
    g.cs.forEach((c, ci) => {
      insCond.run({
        grupo_id: gid, tipo: c.tipo, negada: bool(c.negada),
        stat_id: c.stat ? idStat[c.stat] : null,
        evento_ref_id: c.evento ? idEvento[c.evento] : null,
        respuesta_ref_id: null,
        efecto_ref_id: c.efecto ? idEfecto[c.efecto] : null,
        historia_ref_id: c.historia ? idHistoria[c.historia] : null,
        fase_ref_id: c.fase ? idFase[c.fase] : null,
        flag_clave: c.flag ?? null,
        operador: c.operador ?? '=',
        valor_num: c.valor ?? null, valor_num2: c.valor2 ?? null,
        valor_texto: c.valor_texto ?? null,
        orden: ci,
      });
    });
  });
}

C.eventos.forEach((e) => {
  const grupos = e.cond_grupos ?? (e.cond ? [{ op: 'AND', cs: e.cond }] : []);
  if (grupos.length) cargarCondiciones({ evento_id: idEvento[e.codigo] }, grupos);
});

C.finales.forEach((f) => {
  const grupos = f.cond_grupos ?? (f.cond ? [{ op: 'AND', cs: f.cond }] : []);
  if (grupos.length) cargarCondiciones({ final_id: idFinal[f.codigo] }, grupos);
});

condicionesEfectoPendientes.forEach(({ efId, grupos }) => {
  cargarCondiciones({ efecto_id: efId }, grupos);
});

// ---------------------------------------------------------------------
// Validación
// ---------------------------------------------------------------------
const evInvalidos = db.prepare('SELECT * FROM v_eventos_invalidos').all();
const respInvalidas = db.prepare('SELECT * FROM v_respuestas_invalidas').all();
const abandono = db.prepare('SELECT COUNT(*) c FROM efecto WHERE es_abandono=1').get().c;
const finalDefault = db.prepare('SELECT COUNT(*) c FROM final WHERE es_default=1').get().c;
const statsInexistentes = db.prepare(
  'SELECT COUNT(*) c FROM efecto_stat es LEFT JOIN stat s ON s.id=es.stat_id WHERE s.id IS NULL').get().c;

const errores = [];
if (evInvalidos.length) errores.push(`Eventos inválidos: ${JSON.stringify(evInvalidos)}`);
if (respInvalidas.length) errores.push(`Respuestas inválidas: ${JSON.stringify(respInvalidas)}`);
if (abandono !== 1) errores.push(`Debe haber exactamente 1 efecto que deje la carrera (hay ${abandono})`);
if (finalDefault !== 1) errores.push(`Debe haber exactamente 1 final por defecto (hay ${finalDefault})`);
if (statsInexistentes) errores.push(`${statsInexistentes} efecto_stat apuntan a stats inexistentes`);

// --- Contenido de los minijuegos ---
// Se valida acá y no en el front: un banco mal armado tiene que frenar el
// seed, no romper en medio de una partida.
const sinTildes = (s) => String(s).trim().toLowerCase()
  .normalize('NFD').replace(/[\u0300-\u036f]/g, '');

C.minijuegos.forEach((m) => {
  const cfg = m.config ?? {};

  if (m.mecanica === 'crucigrama') {
    const grillas = cfg.grillas ?? [cfg];
    grillas.forEach((g, gi) => {
      const donde = `${m.codigo} grilla ${gi + 1}`;
      const letras = {};
      (g.palabras ?? []).forEach((p) => {
        const w = p.palabra.toUpperCase();
        for (let k = 0; k < w.length; k++) {
          const f = p.f + (p.horizontal ? 0 : k);
          const c = p.c + (p.horizontal ? k : 0);
          if (f < 0 || c < 0 || f >= g.filas || c >= g.columnas) {
            errores.push(`${donde}: "${w}" se sale de la grilla (${g.filas}x${g.columnas})`);
            return;
          }
          const clave = `${f},${c}`;
          if (letras[clave] && letras[clave] !== w[k]) {
            errores.push(`${donde}: cruce inconsistente en ${clave} — "${letras[clave]}" vs "${w[k]}"`);
          }
          letras[clave] = w[k];
        }
      });
      if (!(g.palabras ?? []).every((p) => p.pista)) errores.push(`${donde}: alguna palabra sin pista`);
    });
  }

  if (m.mecanica === 'sopa') {
    const largas = (cfg.palabras ?? []).filter((w) => w.length > (cfg.lado ?? 8));
    if (largas.length) errores.push(`${m.codigo}: no entran en la grilla: ${largas.join(', ')}`);
    if ((cfg.palabras ?? []).length < (cfg.cantidad ?? 3)) errores.push(`${m.codigo}: el banco tiene menos palabras que las que pide`);
  }

  if (m.mecanica === 'traducir') {
    if ((cfg.palabras ?? []).length < (cfg.rondas ?? 5)) errores.push(`${m.codigo}: el banco tiene menos términos que rondas`);
    (cfg.palabras ?? []).forEach((p) => {
      if (!p.en || !p.es || (p.mal ?? []).length < 2) errores.push(`${m.codigo}: "${p.en}" mal armado`);
      if ((p.mal ?? []).includes(p.es)) errores.push(`${m.codigo}: "${p.en}" tiene la correcta entre los distractores`);
    });
  }

  if (m.mecanica === 'apellidos') {
    if ((cfg.autores ?? []).length < (cfg.rondas ?? 4)) errores.push(`${m.codigo}: el banco tiene menos autores que rondas`);
    (cfg.autores ?? []).forEach((a) => {
      // Si solo cambian las tildes, copiar el enunciado da por válido.
      if (sinTildes(a.mal) === sinTildes(a.bien)) {
        errores.push(`${m.codigo}: "${a.mal}" y "${a.bien}" son iguales sin tildes — se resuelve copiando`);
      }
    });
  }
});

const n = (t) => db.prepare(`SELECT COUNT(*) c FROM ${t}`).get().c;
const q1 = (sql) => db.prepare(sql).get().c;

console.log(`game.db creada en ${DB_PATH}  (motor: ${db.motor})`);
console.log(`  stats: ${n('stat')} (ocultos: ${q1('SELECT COUNT(*) c FROM stat WHERE visible=0')}) | fases: ${n('fase')} | historias: ${n('historia')}`);
console.log(`  eventos: ${n('evento')} (avisos: ${q1("SELECT COUNT(*) c FROM evento WHERE tipo='aviso'")}, salidas de carrera: ${abandono})`);
db.prepare('SELECT categoria, COUNT(*) c FROM evento GROUP BY categoria ORDER BY c DESC').all()
  .forEach((r) => console.log(`    ${String(r.categoria ?? '(aviso)').padEnd(14)} ${r.c}`));
console.log(`  respuestas: ${n('respuesta')} | efectos: ${n('efecto')} | disparadores: ${n('efecto_disparador')}`);
console.log(`  minijuegos: ${n('minijuego')} | finales: ${n('final')} | condiciones: ${n('condicion')}`);

if (errores.length) {
  console.error('\nERRORES DE VALIDACIÓN:');
  errores.forEach((e) => console.error(' -', e));
  process.exit(1);
}
console.log('\nValidación OK.');
db.close();
