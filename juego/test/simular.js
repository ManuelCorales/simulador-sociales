// =====================================================================
//  Simulador: juega N partidas completas contra el motor y chequea
//  invariantes. Uso: npm run test:run [cantidad]
// =====================================================================

const motor = require('../engine');

const N = Number(process.argv[2] || 300);
const generos = ['m', 'f', 'nb'];

const errores = [];
const conteoFinales = {};
const conteoEventos = {};
const conteoMinijuegos = {};
let abandonos = 0, cortadas = 0, duelos = 0, avisosMostrados = 0, rondasTotales = 0;
let maxRondas = 0, minRondas = 99;

function check(cond, msg) { if (!cond) errores.push(msg); }

for (let i = 0; i < N; i++) {
  const estado = motor.crearPartida({
    nombre: 'Test' + i,
    genero: generos[i % 3],
    extra: { motivo: 'simulacion' },
  });

  let pasos = 0;
  let rondasJugadas = 0;
  let avisosDeEstaPartida = 0;
  const titulosRespondidos = new Set();
  let minijuegosJugados = 0;
  let duelosDeEstaPartida = 0;
  let ultimaRonda = 0;

  while (!estado.terminada && pasos < 200) {
    pasos++;
    const pantalla = motor.siguiente(estado);

    if (pantalla.tipo === 'final') break;

    if (pantalla.tipo === 'minijuego') {
      minijuegosJugados++;
      conteoMinijuegos[pantalla.minijuego.codigo] = (conteoMinijuegos[pantalla.minijuego.codigo] ?? 0) + 1;
      const r = motor.resolverMinijuego(estado, Math.random() * 100);
      check(r.tipo === 'resultado', 'resolverMinijuego no devolvió resultado');
      continue;
    }

    // Es un evento
    check(pantalla.respuestas.length >= 1 && pantalla.respuestas.length <= 4,
      `Evento ${pantalla.evento.codigo} con ${pantalla.respuestas.length} respuestas`);
    if (pantalla.evento.esAviso) {
      check(pantalla.respuestas.length === 1,
        `Aviso ${pantalla.evento.codigo} con ${pantalla.respuestas.length} respuestas`);
    }
    check(pantalla.evento.texto && pantalla.evento.texto.length > 0,
      `Evento ${pantalla.evento.codigo} sin texto para género ${estado.genero}`);
    pantalla.respuestas.forEach((r) => check(!!r.texto,
      `Respuesta sin texto en ${pantalla.evento.codigo} (${estado.genero})`));

    check(pantalla.ronda >= ultimaRonda, 'La ronda retrocedió');
    ultimaRonda = pantalla.ronda;
    check(pantalla.ronda <= motor.TOTAL_RONDAS, `Ronda ${pantalla.ronda} > total`);

    conteoEventos[pantalla.evento.codigo] = (conteoEventos[pantalla.evento.codigo] ?? 0) + 1;
    // Los avisos son cartas extra: no consumen ronda, así que no cuentan acá.
    if (pantalla.evento.esAviso) {
      avisosDeEstaPartida++;
      check(!!pantalla.evento.origen,
        `Aviso ${pantalla.evento.codigo} sin la decisión de origen`);
      check(titulosRespondidos.has(pantalla.evento.origen),
        `Aviso ${pantalla.evento.codigo} apunta a "${pantalla.evento.origen}", que el jugador no respondió`);
    } else {
      titulosRespondidos.add(pantalla.evento.titulo);
      rondasJugadas++;
    }

    const elegida = pantalla.respuestas[Math.floor(Math.random() * pantalla.respuestas.length)];
    let res = motor.responder(estado, elegida.id);

    // Duelo: la respuesta lanzó un minijuego y todavía no resolvió nada.
    if (res.tipo === 'minijuego') {
      duelos++; duelosDeEstaPartida++;
      check(!!estado.duelo, 'responder devolvió un minijuego sin abrir el duelo');
      check(!!res.minijuego.mecanica, 'el duelo no dice qué mecánica usar');
      minijuegosJugados++;
      conteoMinijuegos[res.minijuego.codigo] = (conteoMinijuegos[res.minijuego.codigo] ?? 0) + 1;
      res = motor.resolverMinijuego(estado, Math.random() * 100);
      check(!estado.duelo, 'el duelo quedó abierto después de resolverlo');
      check(typeof res.gano === 'boolean', 'el duelo no dice si se ganó');
    }
    check(res.tipo === 'resultado', 'responder no devolvió resultado');
  }

  const final = motor.pantallaFinal(estado);
  check(!!final.final.titulo, 'Final sin título');
  check(!!final.final.texto, 'Final sin texto');
  conteoFinales[final.final.codigo] = (conteoFinales[final.final.codigo] ?? 0) + 1;

  if (estado.abandono) abandonos++;
  if (estado.cortada) cortadas++;

  // Una partida "completa" es la que llego a la ultima ronda. Las que se
  // cortaron antes -abandono, muerte en el ataque armado, expulsion- no tienen
  // por que haber jugado las 6 rondas ni los 3 minijuegos.
  if (!estado.cortada) {
    check(rondasJugadas === motor.TOTAL_RONDAS,
      `Partida sin abandono jugó ${rondasJugadas} rondas (esperado ${motor.TOTAL_RONDAS})`);
    // La partida tiene dos slots de aviso, y cada aviso tiene que referenciar
    // una decisión que el jugador tomó de verdad. Son "a lo sumo dos": si en un
    // slot no quedaba ninguno sin usar, se saltea en vez de forzarlo.
    check(avisosDeEstaPartida <= 2,
      `Partida sin abandono mostró ${avisosDeEstaPartida} avisos (máximo 2)`);
  }
  avisosMostrados += avisosDeEstaPartida;

  // Los 3 de fase, mas los duelos que hayan salido.
  check(minijuegosJugados <= 3 + duelosDeEstaPartida,
    `Se jugaron ${minijuegosJugados} minijuegos`);
  if (!estado.cortada) {
    check(minijuegosJugados === 3 + duelosDeEstaPartida, `Partida completa con ${minijuegosJugados} minijuegos (esperado 3)`);
  }

  // Los stats nunca salen de sus límites cuando clampea = 1
  motor.C.stats.forEach((s) => {
    if (!s.clampea) return;
    const v = estado.stats[s.codigo];
    check(v >= s.valor_min && v <= s.valor_max, `Stat ${s.codigo} fuera de rango: ${v}`);
  });

  // Orden interno de las historias estrictas
  motor.C.historias.filter((h) => h.modo_secuencia === 'estricta').forEach((h) => {
    const eslabones = motor.C.historiaEventosPorHistoria[h.id] ?? [];
    const posiciones = eslabones
      .map((e) => estado.historia.findIndex((x) => x.eventoCodigo === motor.C.eventosPorId[e.evento_id].codigo))
      .filter((v) => v >= 0);
    const ordenado = [...posiciones].sort((a, b) => a - b);
    check(JSON.stringify(posiciones) === JSON.stringify(ordenado),
      `Historia estricta "${h.codigo}" salió desordenada`);
  });

  rondasTotales += rondasJugadas;
  maxRondas = Math.max(maxRondas, rondasJugadas);
  minRondas = Math.min(minRondas, rondasJugadas);
}

// ---------------------------------------------------------------------
const pct = (n) => ((n / N) * 100).toFixed(1) + '%';
const orden = (o) => Object.entries(o).sort((a, b) => b[1] - a[1]);

console.log(`\n=== ${N} partidas simuladas ===`);
console.log(`Rondas por partida: min ${minRondas} / max ${maxRondas} / prom ${(rondasTotales / N).toFixed(2)}`);
console.log(`Abandonos: ${abandonos} (${pct(abandonos)})`);
console.log(`Partidas cortadas antes de la ultima ronda: ${cortadas} (${pct(cortadas)})`);
console.log(`Duelos jugados: ${duelos} (${pct(duelos)})`);
console.log(`Avisos mostrados: ${avisosMostrados} (${(avisosMostrados / N).toFixed(2)} por partida)`);

console.log('\nFinales:');
orden(conteoFinales).forEach(([k, v]) => console.log(`  ${k.padEnd(16)} ${String(v).padStart(4)}  ${pct(v)}`));

console.log('\nMinijuegos:');
orden(conteoMinijuegos).forEach(([k, v]) => console.log(`  ${k.padEnd(16)} ${String(v).padStart(4)}`));

const nunca = motor.C.eventos.filter((e) => !conteoEventos[e.codigo]).map((e) => e.codigo);
console.log(`\nEventos distintos usados: ${Object.keys(conteoEventos).length} / ${motor.C.eventos.length}`);
if (nunca.length) console.log('  Nunca aparecieron:', nunca.join(', '));

if (errores.length) {
  const unicos = [...new Set(errores)];
  console.error(`\n${errores.length} ERRORES (${unicos.length} distintos):`);
  unicos.slice(0, 20).forEach((e) => console.error('  -', e));
  process.exit(1);
}
console.log('\nSin errores. Invariantes OK.\n');
