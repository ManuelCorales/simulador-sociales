// =====================================================================
//  Backend Express
//  El estado de cada partida vive en memoria: si el usuario cierra la
//  pestaña pierde el progreso, tal como pide el diseño.
//  Al terminar, la partida se archiva en SQLite solo para analytics.
// =====================================================================

const path = require('path');
const express = require('express');
const motor = require('./engine');
const { abrir, rutaDB } = require('./db/conn');

const PORT = process.env.PORT || 3000;
const ARCHIVAR = process.env.ARCHIVAR !== '0';

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ---------------------------------------------------------------------
// Partidas en memoria (+ limpieza de las abandonadas)
// ---------------------------------------------------------------------
const partidas = new Map();
const TTL = 1000 * 60 * 60 * 3; // 3 horas

setInterval(() => {
  const ahora = Date.now();
  for (const [id, p] of partidas) {
    if (ahora - (p.ultimoUso ?? p.creada) > TTL) partidas.delete(id);
  }
}, 1000 * 60 * 10).unref();

function traer(req) {
  const p = partidas.get(req.params.id);
  if (!p) { const e = new Error('Partida no encontrada o expirada'); e.status = 404; throw e; }
  p.ultimoUso = Date.now();
  return p;
}

// ---------------------------------------------------------------------
// Archivado (opcional) de partidas terminadas
// ---------------------------------------------------------------------
let dbEscritura = null;
function archivar(estado) {
  if (!ARCHIVAR || estado.archivada) return;
  try {
    dbEscritura ??= abrir(rutaDB());
    const db = dbEscritura;

    db.prepare(`INSERT OR REPLACE INTO partida
      (id, jugador_nombre, jugador_genero, datos_extra, ronda_actual, terminada, abandono, final_id, version_contenido, terminada_en)
      VALUES (?,?,?,?,?,?,?,?,?, datetime('now'))`)
      .run(estado.id, estado.nombre, estado.genero, JSON.stringify(estado.extra),
        estado.ronda, 1, estado.abandono ? 1 : 0, estado.finalId,
        motor.C.config.version_contenido ?? null);

    const insStat = db.prepare('INSERT OR REPLACE INTO partida_stat (partida_id, stat_id, valor) VALUES (?,?,?)');
    motor.C.stats.forEach((s) => insStat.run(estado.id, s.id, estado.stats[s.codigo]));

    const insLog = db.prepare(`INSERT INTO partida_log
      (partida_id, ronda, evento_id, minijuego_id, puntaje, snapshot_stats) VALUES (?,?,?,?,?,?)`);
    estado.historia.forEach((h) => {
      const ev = motor.C.eventosPorCodigo[h.eventoCodigo];
      const mj = motor.C.minijuegos.find((m) => m.codigo === h.eventoCodigo);
      insLog.run(estado.id, h.ronda, ev?.id ?? null, mj?.id ?? null, null, JSON.stringify(h.deltas ?? {}));
    });

    estado.archivada = true;
  } catch (err) {
    console.warn('[archivar] no se pudo archivar la partida:', err.message);
  }
}

// ---------------------------------------------------------------------
// API
// ---------------------------------------------------------------------
app.get('/api/meta', (_req, res) => {
  res.json({
    totalRondas: motor.TOTAL_RONDAS,
    stats: motor.C.stats.filter((s) => s.visible).map((s) => ({
      codigo: s.codigo, nombre: s.nombre, icono: s.icono, color: s.color,
      descripcion: s.descripcion, inicial: s.valor_inicial, min: s.valor_min, max: s.valor_max,
    })),
    fases: motor.C.fases.map((f) => ({
      codigo: f.codigo, nombre: f.nombre, desde: f.ronda_desde, hasta: f.ronda_hasta,
      minijuegoDespuesDe: f.minijuego_despues_de,
    })),
    generos: [
      { codigo: 'm', nombre: 'Masculino' },
      { codigo: 'f', nombre: 'Femenino' },
      { codigo: 'nb', nombre: 'No binario' },
    ],
  });
});

app.post('/api/partida', (req, res, next) => {
  try {
    const { nombre, genero, extra } = req.body ?? {};
    const estado = motor.crearPartida({ nombre, genero, extra });
    estado.ultimoUso = Date.now();
    partidas.set(estado.id, estado);
    res.json({ partidaId: estado.id, pantalla: motor.siguiente(estado) });
  } catch (e) { next(e); }
});

app.get('/api/partida/:id', (req, res, next) => {
  try {
    const estado = traer(req);
    res.json(motor.siguiente(estado));
  } catch (e) { next(e); }
});

app.post('/api/partida/:id/responder', (req, res, next) => {
  try {
    const estado = traer(req);
    const resultado = motor.responder(estado, req.body?.respuestaId);
    if (estado.terminada) archivar(estado);
    res.json(resultado);
  } catch (e) { next(e); }
});

app.post('/api/partida/:id/minijuego', (req, res, next) => {
  try {
    const estado = traer(req);
    res.json(motor.resolverMinijuego(estado, req.body?.puntaje));
  } catch (e) { next(e); }
});

app.get('/api/partida/:id/final', (req, res, next) => {
  try {
    const estado = traer(req);
    if (!estado.terminada) { const e = new Error('La partida no terminó'); e.status = 409; throw e; }
    res.json(motor.pantallaFinal(estado));
  } catch (e) { next(e); }
});

// Debug: estado interno de una partida (útil para ver historias y avisos)
app.get('/api/partida/:id/debug', (req, res, next) => {
  try {
    const e = traer(req);
    res.json({
      ronda: e.ronda, stats: e.stats, flags: e.flags,
      historias: e.historias,
      avisosPendientes: e.avisosPendientes,
      minijuegos: e.minijuegos, jugados: e.minijuegosJugados,
      vistos: [...e.eventosVistos],
      log: e.historia,
    });
  } catch (err) { next(err); }
});

app.use((err, _req, res, _next) => {
  const status = err.status ?? 400;
  if (status >= 500) console.error(err);
  res.status(status).json({ error: err.message });
});

app.listen(PORT, () => {
  const info = abrir(rutaDB());
  console.log(`\n  Juego corriendo en  http://localhost:${PORT}`);
  console.log(`  SQLite: ${info.motor} (journal ${info.journal})  ->  ${rutaDB()}`);
  console.log(`  Rondas: ${motor.TOTAL_RONDAS} | Eventos: ${motor.C.eventos.length} | Minijuegos: ${motor.C.minijuegos.length}\n`);
  info.close();
});
