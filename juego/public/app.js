// =====================================================================
//  Front del juego. El estado real vive en el backend; acá solo se
//  guarda el id de partida en memoria (si recargás, se pierde).
// =====================================================================

const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];

let META = null;
let MOTOR = null;      // motor.js, ya con el contenido cargado
let partida = null;    // el estado de la partida vive acá, en la pestaña
let pantallaActual = null;
let statsPrevios = {};

// Levanta el contenido y arma el motor. Es lo único que se pide por red,
// una sola vez: de ahí en más el juego corre entero en el navegador.
async function cargarMotor() {
  const r = await fetch('contenido.json');
  if (!r.ok) throw new Error('No se pudo cargar contenido.json');
  MOTOR = crearMotor(await r.json());

  META = {
    totalRondas: MOTOR.TOTAL_RONDAS,
    stats: MOTOR.C.stats.filter((s) => s.visible).map((s) => ({
      codigo: s.codigo, nombre: s.nombre, icono: s.icono, color: s.color,
      descripcion: s.descripcion, inicial: s.valor_inicial,
      min: s.valor_min, max: s.valor_max,
    })),
    generos: [
      { codigo: 'm', nombre: 'Masculino' },
      { codigo: 'f', nombre: 'Femenino' },
      { codigo: 'nb', nombre: 'No binario' },
    ],
  };
}

const mostrarPantalla = (id) => {
  $$('.pantalla').forEach((p) => p.classList.toggle('activa', p.id === id));
};

// =====================================================================
// INICIO
// =====================================================================
let genero = 'nb';
let motivo = 'nose';
let nombreJugador = '';

async function initInicio() {
  await cargarMotor();

  $('#in-genero').innerHTML = META.generos
    .map((g) => `<button type="button" data-valor="${g.codigo}">${g.nombre}</button>`).join('');

  const grupo = (sel, set) => {
    $(sel).addEventListener('click', (e) => {
      const b = e.target.closest('button');
      if (!b) return;
      $(sel).querySelectorAll('button').forEach((x) => x.classList.toggle('sel', x === b));
      set(b.dataset.valor);
    });
  };
  grupo('#in-genero', (v) => { genero = v; });
  grupo('#in-motivo', (v) => { motivo = v; });

  $('#in-genero').querySelector('[data-valor="nb"]')?.classList.add('sel');
  $('#in-motivo').querySelector('[data-valor="nose"]')?.classList.add('sel');

  $('#btn-empezar').addEventListener('click', empezar);
  $('#in-nombre').addEventListener('keydown', (e) => { if (e.key === 'Enter') empezar(); });
  $('#btn-reiniciar').addEventListener('click', () => {
    faseActual = null;
    document.body.dataset.fase = 'ingresante';
    mostrarPantalla('pantalla-inicio');
  });
  $('#btn-continuar').addEventListener('click', continuar);
  $('#btn-compartir').addEventListener('click', exportarImagen);
}

function empezar() {
  nombreJugador = $('#in-nombre').value.trim();
  partida = MOTOR.crearPartida({ nombre: nombreJugador, genero, extra: { motivo } });
  statsPrevios = {};
  mostrarPantalla('pantalla-juego');
  render(MOTOR.siguiente(partida));
}

// =====================================================================
// HUD
// =====================================================================
// Sin números: la barra es la única lectura. El valor exacto queda en el
// tooltip, para no convertir el HUD en una planilla.
function pintarStats(stats) {
  const cont = $('#stats');
  if (!cont.children.length) {
    cont.innerHTML = stats.map((s) => `
      <div class="stat" data-cod="${s.codigo}">
        <div class="ico" style="color:${s.color}">${icono(s.icono, s.codigo)}</div>
        <div class="barra"><i style="background:${s.color}"></i></div>
      </div>`).join('');
  }
  stats.forEach((s) => {
    const el = cont.querySelector(`.stat[data-cod="${s.codigo}"]`);
    const pct = ((s.valor - s.min) / (s.max - s.min)) * 100;
    el.querySelector('i').style.width = Math.max(0, Math.min(100, pct)) + '%';
    el.title = `${s.nombre}: ${s.valor}`;
    if (statsPrevios[s.codigo] !== undefined && statsPrevios[s.codigo] !== s.valor) {
      const subio = s.valor > statsPrevios[s.codigo];
      el.classList.remove('pulso', 'baja');
      void el.offsetWidth;
      el.classList.add('pulso');
      if (!subio) el.classList.add('baja');
    }
    statsPrevios[s.codigo] = s.valor;
  });
}

function pintarProgreso(p) {
  $('#fase-nombre').textContent = p.fase ? p.fase.nombre : '';
  $('#ronda-label').textContent = `${p.ronda}/${p.totalRondas}`;
  $('#barra-rondas-fill').style.width = ((p.ronda - 1) / p.totalRondas) * 100 + '%';
  if (p.fase) cambiarFase(p.fase);
}

// =====================================================================
// TRANSICIÓN DE FASE
// El fondo cambia de color en cada instancia de la carrera. El cambio no
// es un fundido: es un barrido diagonal de bloques, como una cortina de
// píxeles de consola vieja.
// =====================================================================
let faseActual = null;
const COLS = 14;
const PASO = 15;      // ms de retraso por diagonal
const DUR = 160;      // ms que tarda cada bloque

const colorDeFase = (codigo) =>
  getComputedStyle(document.documentElement).getPropertyValue(`--fase-${codigo}`).trim();

function cambiarFase(fase) {
  if (fase.codigo === faseActual) return;

  // La primera vez no se anima: se entra al juego ya con el color.
  if (faseActual === null) {
    faseActual = fase.codigo;
    document.body.dataset.fase = fase.codigo;
    return;
  }
  faseActual = fase.codigo;

  const ov = $('#transicion');
  const grid = ov.querySelector('.tr-grid');
  const label = ov.querySelector('.tr-label');

  const lado = window.innerWidth / COLS;
  const filas = Math.max(4, Math.ceil(window.innerHeight / lado));

  grid.style.gridTemplateColumns = `repeat(${COLS}, 1fr)`;
  grid.style.gridTemplateRows = `repeat(${filas}, 1fr)`;
  grid.innerHTML = '';

  const celdas = [];
  for (let f = 0; f < filas; f++) {
    for (let c = 0; c < COLS; c++) {
      const i = document.createElement('i');
      i.style.setProperty('--d', (f + c) * PASO + 'ms');
      grid.appendChild(i);
      celdas.push(i);
    }
  }

  ov.style.setProperty('--tr-color', colorDeFase(fase.codigo));
  ov.classList.add('activa');
  celdas.forEach((c) => c.classList.add('entra'));

  const cubrir = (filas + COLS) * PASO + DUR;

  // Con la pantalla tapada se cambia el fondo y se anuncia la instancia.
  setTimeout(() => {
    document.body.dataset.fase = fase.codigo;
    label.textContent = fase.nombre;
    label.classList.add('visible');
  }, cubrir);

  setTimeout(() => {
    celdas.forEach((c) => { c.classList.remove('entra'); c.classList.add('sale'); });
  }, cubrir + 620);

  setTimeout(() => {
    ov.classList.remove('activa');
    label.classList.remove('visible');
    grid.innerHTML = '';
  }, cubrir + 620 + cubrir);
}

// =====================================================================
// RENDER
// =====================================================================
function render(p) {
  pantallaActual = p;

  if (p.tipo === 'final') return renderFinal(p);

  pintarStats(p.stats);
  pintarProgreso(p);
  $('#resultado').classList.add('oculto');

  if (p.tipo === 'minijuego') return renderMinijuego(p);
  return renderEvento(p);
}

function renderEvento(p) {
  $('#minijuego').classList.add('oculto');
  const carta = $('#carta');
  carta.classList.remove('oculto', 'animada');
  carta.classList.toggle('aviso', p.evento.esAviso);
  carta.style.transform = '';
  carta.style.opacity = '';

  // El color de la franja sale de la categoría del evento.
  const cat = p.evento.esAviso ? 'aviso' : (p.evento.categoria || 'generales');
  carta.dataset.cat = cat;
  $('#carta-ilu').dataset.cat = cat;
  $('#carta-ilu').innerHTML = ilustracion(p.evento.ilustracion);
  $('#carta-personaje').textContent = p.evento.personaje || (p.evento.esAviso ? 'Aviso' : '');

  // En un aviso, lo primero que se lee es de qué decisión tuya viene. Sin esta
  // línea la carta parece un evento suelto más y se pierde la continuidad.
  const org = $('#carta-origen');
  if (p.evento.origen) {
    org.textContent = 'Por lo que hiciste en: ' + p.evento.origen;
    org.hidden = false;
  } else {
    org.hidden = true;
  }

  $('#carta-titulo').textContent = p.evento.titulo || '';
  $('#carta-texto').textContent = p.evento.texto;

  const cont = $('#respuestas');
  cont.innerHTML = '';
  p.respuestas.forEach((r, i) => {
    const b = document.createElement('button');
    b.className = 'respuesta';
    b.innerHTML = `<span class="num">${i + 1}</span>${r.texto}`;
    b.addEventListener('click', () => responder(r.id));
    cont.appendChild(b);
  });

  // Swipe solo cuando hay exactamente 2 opciones (izquierda / derecha).
  configurarSwipe(p.respuestas.length === 2 ? p.respuestas : null);
}

// ---------------------------------------------------------------------
// Swipe estilo REIGNS
// ---------------------------------------------------------------------
let swipeOpciones = null;
function configurarSwipe(opciones) {
  swipeOpciones = opciones;
  $('#hint-izq').textContent = opciones ? opciones[0].texto : '';
  $('#hint-der').textContent = opciones ? opciones[1].texto : '';
  $('#hint-izq').style.opacity = 0;
  $('#hint-der').style.opacity = 0;
}

(function initSwipe() {
  const carta = $('#carta');
  let x0 = null, dx = 0;

  const empezarDrag = (x) => { if (!swipeOpciones) return; x0 = x; dx = 0; carta.classList.add('arrastrando'); };
  const moverDrag = (x) => {
    if (x0 === null) return;
    dx = x - x0;
    carta.style.transform = `translateX(${dx}px) rotate(${dx * 0.04}deg)`;
    $('#hint-izq').style.opacity = dx < -30 ? Math.min(1, -dx / 100) : 0;
    $('#hint-der').style.opacity = dx > 30 ? Math.min(1, dx / 100) : 0;
  };
  const soltarDrag = () => {
    if (x0 === null) return;
    carta.classList.remove('arrastrando');
    carta.classList.add('animada');
    const umbral = 95;
    if (swipeOpciones && Math.abs(dx) > umbral) {
      const op = dx < 0 ? swipeOpciones[0] : swipeOpciones[1];
      carta.style.transform = `translateX(${dx < 0 ? -600 : 600}px) rotate(${dx * 0.05}deg)`;
      carta.style.opacity = 0;
      responder(op.id);
    } else {
      carta.style.transform = '';
      $('#hint-izq').style.opacity = 0;
      $('#hint-der').style.opacity = 0;
    }
    x0 = null; dx = 0;
  };

  carta.addEventListener('mousedown', (e) => empezarDrag(e.clientX));
  window.addEventListener('mousemove', (e) => moverDrag(e.clientX));
  window.addEventListener('mouseup', soltarDrag);
  carta.addEventListener('touchstart', (e) => empezarDrag(e.touches[0].clientX), { passive: true });
  carta.addEventListener('touchmove', (e) => moverDrag(e.touches[0].clientX), { passive: true });
  carta.addEventListener('touchend', soltarDrag);
})();

// Atajos 1-4
window.addEventListener('keydown', (e) => {
  const overlayVisible = !$('#resultado').classList.contains('oculto');
  if (overlayVisible) {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); continuar(); }
    return;
  }
  if (!pantallaActual || pantallaActual.tipo !== 'evento') return;
  const i = Number(e.key) - 1;
  const r = pantallaActual.respuestas?.[i];
  if (r) responder(r.id);
});

// =====================================================================
// RESPONDER / RESULTADO
// =====================================================================
let ultimoResultado = null;

function responder(respuestaId) {
  const carta = $('#carta');
  if (carta.dataset.bloqueado === '1') return;
  carta.dataset.bloqueado = '1';
  try {
    const r = MOTOR.responder(partida, respuestaId);
    // Una respuesta con duelo no resuelve nada: lanza el minijuego y el
    // resultado decide el efecto.
    if (r.tipo === 'minijuego') render(r);
    else mostrarResultado(r);
  } catch (e) {
    console.error(e);
  } finally {
    carta.dataset.bloqueado = '0';
  }
}

function mostrarResultado(r) {
  ultimoResultado = r;
  pintarStats(r.stats);

  $('#resultado-texto').textContent = r.texto || '…';
  $('#resultado-deltas').innerHTML = Object.entries(r.deltas || {})
    .filter(([, v]) => v !== 0)
    .map(([cod, v]) => {
      const s = META.stats.find((x) => x.codigo === cod);
      return `<span class="delta ${v > 0 ? 'pos' : 'neg'}" title="${s?.nombre || cod}">
        <span class="delta-ico" style="color:${s?.color || 'currentColor'}">${icono(s?.icono, cod)}</span>
        ${v > 0 ? '+' : ''}${v}</span>`;
    }).join('') || '<span class="delta">sin cambios</span>';

  $('#resultado').classList.remove('oculto');
  $('#respuestas').innerHTML = '';
  $('#btn-continuar').focus();
}

function continuar() {
  $('#resultado').classList.add('oculto');
  if (ultimoResultado?.siguiente === 'final') return render(MOTOR.pantallaFinal(partida));
  render(MOTOR.siguiente(partida));
}

// =====================================================================
// MINIJUEGOS
// =====================================================================
function renderMinijuego(p) {
  $('#carta').classList.add('oculto');
  $('#respuestas').innerHTML = '';
  const box = $('#minijuego');
  box.classList.remove('oculto');

  box.dataset.cat = 'minijuego';
  $('#mj-ilu').dataset.cat = 'minijuego';
  $('#mj-ilu').innerHTML = ilustracion(p.minijuego.ilustracion);
  $('#mj-nombre').textContent = p.minijuego.nombre;
  $('#mj-instrucciones').textContent = p.minijuego.instrucciones || p.minijuego.descripcion || '';
  $('#mj-area').innerHTML = '';
  $('#mj-estado').textContent = '';

  const btn = $('#mj-empezar');
  btn.classList.remove('oculto');
  btn.textContent = 'Jugar';
  btn.onclick = () => {
    btn.classList.add('oculto');
    const mec = MECANICAS[p.minijuego.mecanica];
    if (!mec) return terminarMinijuego(50);
    mec(p.minijuego.config || {}, terminarMinijuego);
  };
}

function terminarMinijuego(puntaje) {
  // Si una mecánica llama dos veces a `listo`, la segunda se ignora en vez
  // de tirar una excepción que dejaría la pantalla trabada.
  if (!partida || (!partida.pendienteMinijuego && !partida.duelo)) return;
  $('#mj-estado').textContent = `Puntaje: ${Math.round(puntaje)}`;
  const r = MOTOR.resolverMinijuego(partida, puntaje);
  $('#minijuego').classList.add('oculto');
  $('#carta').classList.remove('oculto');
  mostrarResultado(r);
}

// ---------------------------------------------------------------------
//  Las ocho mecánicas. Cada una recibe la config del minijuego (que sale
//  de db/contenido.js) y una función `listo(puntaje)` con un 0-100.
//  Todas escriben dentro de #mj-area y usan #mj-estado para el marcador.
// ---------------------------------------------------------------------
const area = () => $('#mj-area');
const estado = (t) => { $('#mj-estado').textContent = t; };
const el = (tag, cls, txt) => {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (txt != null) e.textContent = txt;
  return e;
};
const mezclar = (a) => a.map((v) => [Math.random(), v]).sort((x, y) => x[0] - y[0]).map((p) => p[1]);
const limitar = (n) => Math.max(0, Math.min(100, Math.round(n)));

// Reloj para los juegos que se pueden resolver o no. Sin esto, alguien que
// no encuentra las palabras queda trabado en la pantalla para siempre.
function reloj(segundos, marcador, alVencer) {
  let quedan = segundos;
  const pintar = () => estado(`${marcador()} · ${quedan}s`);
  pintar();
  const id = setInterval(() => {
    quedan--;
    pintar();
    if (quedan <= 0) { clearInterval(id); alVencer(); }
  }, 1000);
  return { parar: () => clearInterval(id), refrescar: pintar };
}
// Para comparar lo que escribe el jugador: sin tildes, sin mayúsculas.
const normalizar = (s) => String(s).trim().toLowerCase()
  .normalize('NFD').replace(/[\u0300-\u036f]/g, '');

const MECANICAS = {

  // --- 1. Tres en línea contra la otra lista ---
  tres_en_linea(cfg, listo) {
    const LINEAS = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
    const tab = Array(9).fill('');
    const celdas = [];
    let fin = false;

    const a = area();
    a.innerHTML = '';
    const grilla = el('div', 'ttt');
    for (let i = 0; i < 9; i++) {
      const b = el('button', 'ttt-c');
      b.type = 'button';
      b.onclick = () => jugar(i);
      grilla.appendChild(b);
      celdas.push(b);
    }
    a.appendChild(grilla);

    const ganador = (t) => LINEAS.find((l) => t[l[0]] && t[l[0]] === t[l[1]] && t[l[1]] === t[l[2]]);
    const libres = (t) => t.map((v, i) => (v ? -1 : i)).filter((i) => i >= 0);
    const pintar = () => celdas.forEach((b, i) => {
      b.textContent = tab[i];
      b.classList.toggle('ocupada', !!tab[i]);
      b.classList.toggle('rival', tab[i] === 'O');
    });

    function jugar(i) {
      if (fin || tab[i]) return;
      tab[i] = 'X'; pintar();
      if (cerrar()) return;
      estado('Piensa la otra lista…');
      setTimeout(() => {
        const m = rival();
        if (m !== undefined) { tab[m] = 'O'; pintar(); }
        if (!cerrar()) estado('Te toca.');
      }, 300);
    }

    // No juega perfecto a propósito: se le puede ganar.
    function rival() {
      const l = libres(tab);
      if (Math.random() < (cfg.astucia ?? 0.65)) {
        for (const s of ['O', 'X']) {
          for (const i of l) { const t = [...tab]; t[i] = s; if (ganador(t)) return i; }
        }
        if (!tab[4]) return 4;
      }
      return l[Math.floor(Math.random() * l.length)];
    }

    function cerrar() {
      const g = ganador(tab);
      if (g) {
        fin = true;
        g.forEach((i) => celdas[i].classList.add('gana'));
        const gane = tab[g[0]] === 'X';
        estado(gane ? '¡Ganaste!' : 'Te ganaron.');
        setTimeout(() => listo(gane ? 100 : 15), 800);
        return true;
      }
      if (!libres(tab).length) {
        fin = true;
        estado('Empate.');
        setTimeout(() => listo(55), 800);
        return true;
      }
      return false;
    }

    estado('Sos las X. Te toca.');
  },

  // --- 2. Memo test: encontrar los pares ---
  memotest(cfg, listo) {
    const pares = cfg.pares ?? 4;
    const fichas = mezclar((cfg.simbolos ?? ['W', 'M', 'D', 'G', 'B', 'F'])
      .slice(0, pares).flatMap((s) => [s, s]));

    const a = area();
    a.innerHTML = '';
    const grilla = el('div', 'memo');
    grilla.style.gridTemplateColumns = `repeat(${cfg.columnas ?? 4}, 1fr)`;
    const cartas = fichas.map((s, i) => {
      const b = el('button', 'memo-c');
      b.type = 'button';
      b.dataset.simbolo = s;
      b.title = nombreRetrato(s);
      b.onclick = () => dar(i);
      grilla.appendChild(b);
      return b;
    });
    a.appendChild(grilla);

    // El límite se cuenta en ERRORES, no en jugadas: con 6 pares hacen falta 6
    // jugadas para ganar aunque tengas memoria perfecta, así que un tope de 5
    // jugadas dejaría el minijuego imposible.
    const maxErrores = cfg.maxErrores ?? 5;

    let abiertas = [], resueltas = 0, errores = 0, bloqueado = false, cerrado = false;
    const marcador = () => estado(
      `Pares: ${resueltas}/${pares} · Intentos restantes: ${maxErrores - errores}`);

    function cerrar(puntos) {
      if (cerrado) return;
      cerrado = true;
      bloqueado = true;
      setTimeout(() => listo(limitar(puntos)), 500);
    }

    // Las fichas son retratos pixelados, no letras.
    const mostrar = (c, s) => { c.innerHTML = retrato(s) || s; };
    const tapar = (c) => { c.innerHTML = ''; };

    function dar(i) {
      const c = cartas[i];
      if (cerrado || bloqueado
          || c.classList.contains('vista') || c.classList.contains('lista')) return;
      c.classList.add('vista');
      mostrar(c, fichas[i]);
      abiertas.push(i);
      if (abiertas.length < 2) return;

      const [p, q] = abiertas;
      abiertas = [];
      if (fichas[p] === fichas[q]) {
        [p, q].forEach((k) => {
          cartas[k].classList.add('lista');
          cartas[k].appendChild(el('b', 'memo-nom', nombreRetrato(fichas[k])));
        });
        resueltas++;
        marcador();
        // Completarlo siempre alcanza para un resultado parcial: cada error
        // descuenta 10, así que ni gastando los cinco intentos se pierde del todo.
        if (resueltas === pares) cerrar(100 - errores * 10);
      } else {
        errores++;
        bloqueado = true;
        marcador();
        setTimeout(() => {
          [p, q].forEach((k) => { cartas[k].classList.remove('vista'); tapar(cartas[k]); });
          bloqueado = false;
          // Se quedó sin intentos: puntúa por los pares que llegó a armar.
          if (errores >= maxErrores) {
            estado(`Sin intentos. Pares: ${resueltas}/${pares}`);
            cerrar((resueltas / pares) * 45);
          }
        }, 620);
      }
    }
    marcador();
  },

  // --- 3. Traducir el paper: opción múltiple ---
  traducir(cfg, listo) {
    const banco = mezclar(cfg.palabras ?? []).slice(0, cfg.rondas ?? 5);
    let i = 0, aciertos = 0;

    function ronda() {
      if (i >= banco.length) return listo(limitar((aciertos / banco.length) * 100));
      const p = banco[i];
      estado(`${i + 1} de ${banco.length} · ${aciertos} bien`);

      const a = area();
      a.innerHTML = '';
      a.appendChild(el('div', 'palabra', p.en));
      const ops = el('div', 'opciones-mj');
      mezclar([p.es, ...p.mal]).forEach((texto) => {
        const b = el('button', 'op-mj', texto);
        b.type = 'button';
        b.onclick = () => {
          if (a.dataset.bloq === '1') return;
          a.dataset.bloq = '1';
          const bien = texto === p.es;
          if (bien) aciertos++;
          b.classList.add(bien ? 'bien' : 'mal');
          if (!bien) [...ops.children].find((x) => x.textContent === p.es)?.classList.add('bien');
          setTimeout(() => { a.dataset.bloq = '0'; i++; ronda(); }, 700);
        };
        ops.appendChild(b);
      });
      a.appendChild(ops);
    }
    ronda();
  },

  // --- 4. Sopa de letras: clic en la primera y en la última letra ---
  sopa(cfg, listo) {
    const N = cfg.lado ?? 8;
    // Se sortean del banco, descartando las que no entren en la grilla.
    const banco = (cfg.palabras ?? ['WEBER', 'ANOMIA', 'PRAXIS'])
      .map((w) => w.toUpperCase())
      .filter((w) => w.length <= N);
    const cantidad = cfg.cantidad ?? 3;

    // Direcciones posibles. Todas van de izquierda a derecha o hacia abajo, o
    // sea que las palabras se leen siempre en su sentido normal: la dificultad
    // está en encontrarlas, no en leerlas al revés.
    const DIRS = [
      { df: 0, dc: 1 },   // →
      { df: 1, dc: 0 },   // ↓
      { df: 1, dc: 1 },   // ↘
      { df: -1, dc: 1 },  // ↗
    ];

    // Dónde puede empezar una palabra de este largo en esta dirección, para que
    // el último carácter siga cayendo dentro de la grilla.
    const rango = (d, largo) => ({
      fMin: d.df < 0 ? largo - 1 : 0,
      fMax: d.df > 0 ? N - largo : N - 1,
      cMin: d.dc < 0 ? largo - 1 : 0,
      cMax: d.dc > 0 ? N - largo : N - 1,
    });

    // Un intento completo de armar la grilla con las palabras dadas.
    function armar(palabras) {
      const grid = Array.from({ length: N }, () => Array(N).fill(''));
      const puestas = [];
      for (const palabra of palabras) {
        const largo = palabra.length;
        for (let intento = 0; intento < 400; intento++) {
          const d = DIRS[Math.floor(Math.random() * DIRS.length)];
          const r = rango(d, largo);
          if (r.fMax < r.fMin || r.cMax < r.cMin) continue;
          const f = r.fMin + Math.floor(Math.random() * (r.fMax - r.fMin + 1));
          const c = r.cMin + Math.floor(Math.random() * (r.cMax - r.cMin + 1));

          let entra = true;
          for (let k = 0; k < largo; k++) {
            const ch = grid[f + d.df * k][c + d.dc * k];
            if (ch && ch !== palabra[k]) { entra = false; break; }
          }
          if (!entra) continue;

          for (let k = 0; k < largo; k++) grid[f + d.df * k][c + d.dc * k] = palabra[k];
          puestas.push({ palabra, f, c, df: d.df, dc: d.dc });
          break;
        }
      }
      return { grid, puestas };
    }

    // Si alguna no entra, se rearma con otro sorteo: listar una palabra que
    // no está en la grilla es peor que repetir el banco.
    let objetivo = [], grid, ubicadas;
    for (let vuelta = 0; vuelta < 20; vuelta++) {
      objetivo = mezclar(banco).slice(0, cantidad);
      const r = armar(objetivo);
      grid = r.grid; ubicadas = r.puestas;
      if (ubicadas.length === objetivo.length) break;
    }
    // En el peor caso se juega con las que sí entraron.
    objetivo = ubicadas.map((u) => u.palabra);

    const abc = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    for (let f = 0; f < N; f++) for (let c = 0; c < N; c++) {
      if (!grid[f][c]) grid[f][c] = abc[Math.floor(Math.random() * abc.length)];
    }

    const a = area();
    a.innerHTML = '';
    const lista = el('div', 'sopa-lista');
    objetivo.forEach((w) => { const s = el('span', 'sopa-w', w); s.dataset.w = w; lista.appendChild(s); });
    const tabla = el('div', 'sopa');
    tabla.style.gridTemplateColumns = `repeat(${N}, 1fr)`;
    const celdas = [];
    for (let f = 0; f < N; f++) for (let c = 0; c < N; c++) {
      const b = el('button', 'sopa-c', grid[f][c]);
      b.type = 'button';
      b.dataset.f = f; b.dataset.c = c;
      b.onclick = () => tocar(f, c, b);
      tabla.appendChild(b);
      celdas.push(b);
    }
    a.appendChild(tabla);
    a.appendChild(lista);

    let inicio = null, halladas = 0, terminado = false;
    const marcar = () => `Encontradas: ${halladas}/${ubicadas.length}`;
    const cerrar = () => {
      if (terminado) return;
      terminado = true;
      t.parar();
      setTimeout(() => listo(limitar((halladas / ubicadas.length) * 100)), 450);
    };
    const t = reloj(cfg.segundos ?? 45, marcar, cerrar);

    function tocar(f, c, b) {
      if (terminado) return;
      if (!inicio) { inicio = { f, c, b }; b.classList.add('sel'); t.refrescar(); return; }
      // Vale marcar de la primera a la última letra o al revés: se comparan las
      // dos puntas contra los dos extremos de cada palabra ubicada.
      const u = ubicadas.find((x) => {
        if (x.hecha) return false;
        const k = x.palabra.length - 1;
        const fin = { f: x.f + x.df * k, c: x.c + x.dc * k };
        return (x.f === inicio.f && x.c === inicio.c && fin.f === f && fin.c === c)
            || (x.f === f && x.c === c && fin.f === inicio.f && fin.c === inicio.c);
      });

      inicio.b.classList.remove('sel');
      if (u) {
        u.hecha = true;
        halladas++;
        for (let k = 0; k < u.palabra.length; k++) {
          celdas[(u.f + u.df * k) * N + (u.c + u.dc * k)].classList.add('hallada');
        }
        lista.querySelector(`[data-w="${u.palabra}"]`)?.classList.add('hallada');
        if (halladas === ubicadas.length) cerrar();
      }
      inicio = null;
      t.refrescar();
    }
  },

  // --- 5. Crucigrama: grilla chica con palabras que se cruzan ---
  crucigrama(cfg, listo) {
    // Una grilla al azar del set. Si viene una sola suelta, se usa esa.
    const g = (cfg.grillas && cfg.grillas.length)
      ? cfg.grillas[Math.floor(Math.random() * cfg.grillas.length)]
      : cfg;
    const filas = g.filas ?? 5, cols = g.columnas ?? 8;
    const palabras = g.palabras ?? [];
    const letras = {};     // "f,c" -> letra correcta
    palabras.forEach((p) => {
      const w = p.palabra.toUpperCase();
      for (let k = 0; k < w.length; k++) {
        const f = p.f + (p.horizontal ? 0 : k), c = p.c + (p.horizontal ? k : 0);
        letras[`${f},${c}`] = w[k];
      }
    });

    const a = area();
    a.innerHTML = '';
    const tabla = el('div', 'cruci');
    tabla.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
    const inputs = [];
    for (let f = 0; f < filas; f++) for (let c = 0; c < cols; c++) {
      const clave = `${f},${c}`;
      if (!letras[clave]) { tabla.appendChild(el('div', 'cruci-x')); continue; }
      const i = document.createElement('input');
      i.className = 'cruci-c';
      i.maxLength = 1;
      i.dataset.clave = clave;
      i.autocomplete = 'off';
      i.oninput = () => {
        i.value = i.value.toUpperCase().replace(/[^A-ZÑ]/g, '');
        if (i.value) { const n = inputs[inputs.indexOf(i) + 1]; if (n) n.focus(); }
        revisar();
      };
      i.onkeydown = (e) => {
        if (e.key === 'Backspace' && !i.value) { const p = inputs[inputs.indexOf(i) - 1]; if (p) p.focus(); }
      };
      tabla.appendChild(i);
      inputs.push(i);
    }
    a.appendChild(tabla);

    const pistas = el('div', 'pistas');
    palabras.forEach((p) => pistas.appendChild(
      el('div', 'pista', `${p.horizontal ? '→' : '↓'} ${p.pista}`)));
    a.appendChild(pistas);

    const total = inputs.length;
    let bien = 0, terminado = false;
    const marcar = () => `${bien}/${total} letras`;
    const cerrar = () => {
      if (terminado) return;
      terminado = true;
      t.parar();
      inputs.forEach((i) => { i.disabled = true; });
      setTimeout(() => listo(limitar((bien / total) * 100)), 450);
    };
    // "Parcial contrarreloj": si no llegás, entregás lo que tengas.
    const t = reloj(cfg.segundos ?? 60, marcar, cerrar);

    function revisar() {
      if (terminado) return;
      bien = inputs.filter((i) => i.value === letras[i.dataset.clave]).length;
      inputs.forEach((i) => i.classList.toggle('bien', !!i.value && i.value === letras[i.dataset.clave]));
      t.refrescar();
      if (bien === total) cerrar();
    }
    inputs[0]?.focus();
  },

  // --- 6. Escribir bien los apellidos ---
  apellidos(cfg, listo) {
    const banco = mezclar(cfg.autores ?? []).slice(0, cfg.rondas ?? 4);
    let i = 0, aciertos = 0;

    function ronda() {
      if (i >= banco.length) return listo(limitar((aciertos / banco.length) * 100));
      const p = banco[i];
      estado(`${i + 1} de ${banco.length} · ${aciertos} bien`);

      const a = area();
      a.innerHTML = '';
      a.appendChild(el('div', 'como-suena', `«${p.mal}»`));
      const fila = el('div', 'fila-input');
      const inp = document.createElement('input');
      inp.type = 'text';
      inp.className = 'input-mj';
      inp.placeholder = 'Escribilo bien';
      inp.autocomplete = 'off';
      inp.autocapitalize = 'off';
      inp.spellcheck = false;
      const btn = el('button', 'op-mj enviar', 'OK');
      btn.type = 'button';
      fila.appendChild(inp); fila.appendChild(btn);
      a.appendChild(fila);
      inp.focus();

      const responder = () => {
        if (a.dataset.bloq === '1') return;
        a.dataset.bloq = '1';
        const bien = normalizar(inp.value) === normalizar(p.bien);
        if (bien) aciertos++;
        inp.classList.add(bien ? 'bien' : 'mal');
        if (!bien) inp.value = p.bien;
        setTimeout(() => { a.dataset.bloq = '0'; i++; ronda(); }, 800);
      };
      btn.onclick = responder;
      inp.onkeydown = (e) => { if (e.key === 'Enter') { e.preventDefault(); responder(); } };
    }
    ronda();
  },

  // --- 7. Conector de puntos: unir en orden ---
  conectar(cfg, listo) {
    const n = cfg.puntos ?? 9;
    const a = area();
    a.innerHTML = '';
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 100 76');
    svg.setAttribute('class', 'puntos');
    a.appendChild(svg);

    // Posiciones sin encimarse
    const pos = [];
    for (let i = 0; i < n; i++) {
      let p, choques = 0;
      do {
        p = { x: 10 + Math.random() * 80, y: 10 + Math.random() * 56 };
        choques++;
      } while (choques < 80 && pos.some((q) => Math.hypot(q.x - p.x, q.y - p.y) < 17));
      pos.push(p);
    }

    const ns = 'http://www.w3.org/2000/svg';
    const linea = document.createElementNS(ns, 'polyline');
    linea.setAttribute('class', 'puntos-linea');
    linea.setAttribute('points', '');
    svg.appendChild(linea);

    let siguiente = 0, errores = 0;
    const marcar = () => estado(`Punto ${siguiente} de ${n}${errores ? ` · ${errores} errores` : ''}`);

    pos.forEach((p, i) => {
      const g = document.createElementNS(ns, 'g');
      g.setAttribute('class', 'punto');
      const c = document.createElementNS(ns, 'circle');
      c.setAttribute('cx', p.x); c.setAttribute('cy', p.y); c.setAttribute('r', 6);
      const t = document.createElementNS(ns, 'text');
      t.setAttribute('x', p.x); t.setAttribute('y', p.y + 2.6);
      t.setAttribute('text-anchor', 'middle');
      t.textContent = i + 1;
      g.appendChild(c); g.appendChild(t);
      g.addEventListener('click', () => {
        if (i !== siguiente) {
          errores++;
          g.classList.add('error');
          setTimeout(() => g.classList.remove('error'), 260);
          marcar();
          return;
        }
        g.classList.add('hecho');
        siguiente++;
        linea.setAttribute('points',
          pos.slice(0, siguiente).map((q) => `${q.x},${q.y}`).join(' '));
        marcar();
        if (siguiente === n) setTimeout(() => listo(limitar(100 - errores * 14)), 450);
      });
      svg.appendChild(g);
    });
    marcar();
  },

  // --- 8. Saltar el molinete: corredor tipo dino ---
  molinete(cfg, listo) {
    const TOTAL = cfg.obstaculos ?? 10;
    const a = area();
    a.innerHTML = '';
    const cv = document.createElement('canvas');
    cv.className = 'runner';
    cv.width = 640; cv.height = 220;
    a.appendChild(cv);
    const ctx = cv.getContext('2d');

    const css = getComputedStyle(document.documentElement);
    const col = (n, alt) => css.getPropertyValue(n).trim() || alt;
    const NEGRO = col('--negro', '#12100E');
    const AMARILLO = col('--amarillo', '#FFD520');
    const NARANJA = col('--naranja', '#F05A28');
    const METAL = '#9AA3A8';

    const ESC = 3;                       // el sprite es de 14x18 píxeles
    const ANCHO_J = 14 * ESC, ALTO_J = 18 * ESC;
    const ANCHO_O = 40, ALTO_O = 52;     // molinete
    const SUELO = 176, JX = 66;
    let y = SUELO - ALTO_J, vy = 0, saltando = false;
    let vel = cfg.velocidad ?? 4.6;
    let pasados = 0, chocado = false, corriendo = true, t = 0;
    let obstaculos = [{ x: 700 }];

    const saltar = () => {
      if (!corriendo || saltando) return;
      saltando = true;
      vy = -13.2;
    };
    cv.addEventListener('pointerdown', saltar);
    const tecla = (e) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') { e.preventDefault(); saltar(); }
    };
    window.addEventListener('keydown', tecla);

    const terminar = () => {
      corriendo = false;
      window.removeEventListener('keydown', tecla);
      setTimeout(() => listo(limitar((pasados / TOTAL) * 100)), 650);
    };

    function paso() {
      if (!corriendo) return;
      t++;

      vy += 0.72;
      y += vy;
      if (y >= SUELO - ALTO_J) { y = SUELO - ALTO_J; vy = 0; saltando = false; }

      obstaculos.forEach((o) => { o.x -= vel; });
      // Uno nuevo cuando el último ya avanzó lo suficiente
      const ultimo = obstaculos[obstaculos.length - 1];
      if (ultimo && ultimo.x < 380 && pasados + obstaculos.length < TOTAL) {
        obstaculos.push({ x: 640 + Math.random() * 120 });
      }
      obstaculos = obstaculos.filter((o) => {
        if (o.x < -40) { pasados++; vel += 0.16; return false; }
        return true;
      });

      // Colisión: solo contra el poste y el brazo, con un poco de perdón
      for (const o of obstaculos) {
        if (o.x < JX + ANCHO_J - 6 && o.x + ANCHO_O - 10 > JX + 4
            && y + ALTO_J > SUELO - ALTO_O + 6) {
          chocado = true;
          break;
        }
      }

      dibujar();
      estado(`Molinetes: ${pasados}/${TOTAL}`);

      if (chocado) { dibujar(true); return terminar(); }
      if (pasados >= TOTAL) return terminar();
      requestAnimationFrame(paso);
    }

    // Molinete de subte visto de costado: base, poste, cabezal, lector de
    // SUBE y el trípode de brazos que es lo que lo hace reconocible.
    function molinete(x) {
      const base = SUELO, alto = ALTO_O;
      const px = x + 13, pw = 14;              // poste
      const cy = base - alto + 21;             // eje de los brazos

      ctx.fillStyle = NEGRO;
      ctx.fillRect(x + 2, base - 7, ANCHO_O - 4, 7);          // zócalo
      ctx.fillStyle = METAL;
      ctx.fillRect(x + 4, base - 6, ANCHO_O - 8, 5);

      ctx.fillStyle = NEGRO;
      ctx.fillRect(px - 2, base - alto, pw + 4, alto - 5);    // contorno del poste
      ctx.fillStyle = METAL;
      ctx.fillRect(px, base - alto + 2, pw, alto - 9);

      ctx.fillStyle = AMARILLO;                    // lector de SUBE, arriba de todo
      ctx.fillRect(px + 2, base - alto + 4, pw - 4, 10);
      ctx.fillStyle = NEGRO;
      ctx.fillRect(px + 2, base - alto + 4, pw - 4, 2);
      ctx.fillRect(px + 4, base - alto + 9, pw - 8, 2);

      // Trípode: un brazo hacia el jugador y dos en diagonal
      const brazo = (dx, dy, largo, grosor) => {
        const ang = Math.atan2(dy, dx);
        ctx.save();
        ctx.translate(px + pw / 2, cy);
        ctx.rotate(ang);
        ctx.fillStyle = NEGRO;
        ctx.fillRect(0, -grosor / 2 - 2, largo, grosor + 4);
        ctx.fillStyle = METAL;
        ctx.fillRect(0, -grosor / 2, largo - 3, grosor);
        ctx.restore();
      };
      brazo(-1, 0, 25, 7);        // hacia el estudiante: es el que hay que saltar
      brazo(1, -0.9, 22, 7);      // arriba a la derecha
      brazo(1, 0.9, 22, 7);       // abajo a la derecha

      ctx.fillStyle = NEGRO;                                   // eje del trípode
      ctx.fillRect(px + pw / 2 - 5, cy - 5, 10, 10);
      ctx.fillStyle = METAL;
      ctx.fillRect(px + pw / 2 - 3, cy - 3, 6, 6);
    }

    function dibujar(golpe) {
      ctx.clearRect(0, 0, cv.width, cv.height);

      // Andén: piso y línea de baldosas que corre
      ctx.fillStyle = NEGRO;
      ctx.fillRect(0, SUELO, cv.width, 5);
      ctx.fillStyle = 'rgba(18,16,14,.22)';
      for (let x = -((t * vel) % 44); x < cv.width; x += 44) ctx.fillRect(x, SUELO + 13, 24, 4);

      obstaculos.forEach((o) => molinete(o.x));

      // Estudiante: sprite de píxeles, dos fotogramas de carrera
      const spr = saltando ? SPRITES.salta
        : (Math.floor(t / 7) % 2 === 0 ? SPRITES.corre1 : SPRITES.corre2);
      if (golpe) {
        // Al chocar se tiñe de naranja sin perder la silueta
        dibujarSprite(ctx, spr, JX, y, ESC, { ...PALETA_PIXEL, y: NARANJA, n: NARANJA, s: NARANJA, b: NEGRO });
      } else {
        dibujarSprite(ctx, spr, JX, y, ESC);
      }
    }

    estado(`Molinetes: 0/${TOTAL}`);
    requestAnimationFrame(paso);
  },
  // --- 9. Simon Dice: repetir la secuencia, un paso más por ronda ---
  simon(cfg, listo) {
    const PASOS = cfg.pasos ?? 6;
    // Cuatro pads con los colores de la paleta. El nombre es para el title.
    const PADS = [
      { color: 'var(--amarillo)', nombre: 'arriba izquierda' },
      { color: 'var(--naranja)',  nombre: 'arriba derecha' },
      { color: 'var(--azul-medio)', nombre: 'abajo izquierda' },
      { color: 'var(--verde)',    nombre: 'abajo derecha' },
    ];

    // La secuencia completa se sortea una sola vez: cada ronda muestra un paso
    // más de la MISMA secuencia, como el Simon de verdad.
    const secuencia = Array.from({ length: PASOS }, () => Math.floor(Math.random() * 4));

    const a = area();
    a.innerHTML = '';
    const grilla = el('div', 'simon');
    const pads = PADS.map((p, i) => {
      const b = el('button', 'simon-pad');
      b.type = 'button';
      b.style.background = p.color;
      b.title = p.nombre;
      b.onclick = () => tocar(i);
      grilla.appendChild(b);
      return b;
    });
    a.appendChild(grilla);

    let ronda = 1, paso = 0, bloqueado = true, cerrado = false;
    const marcador = () => estado(`Paso ${ronda} de ${PASOS}`);

    const encender = (i, ms) => new Promise((r) => {
      pads[i].classList.add('on');
      setTimeout(() => { pads[i].classList.remove('on'); setTimeout(r, 130); }, ms);
    });

    async function mostrar() {
      bloqueado = true;
      estado(`Mirá... (${ronda} de ${PASOS})`);
      await new Promise((r) => setTimeout(r, 500));
      // Se acelera de a poco: al final hay que estar atento de verdad.
      const ms = Math.max(240, 460 - ronda * 30);
      for (let k = 0; k < ronda; k++) await encender(secuencia[k], ms);
      paso = 0;
      bloqueado = false;
      estado(`Repetí (${ronda} de ${PASOS})`);
    }

    function cerrar(puntos, texto) {
      if (cerrado) return;
      cerrado = true;
      bloqueado = true;
      estado(texto);
      setTimeout(() => listo(limitar(puntos)), 700);
    }

    async function tocar(i) {
      if (bloqueado || cerrado) return;
      pads[i].classList.add('on');
      setTimeout(() => pads[i].classList.remove('on'), 140);

      if (i !== secuencia[paso]) {
        // Puntúa por las rondas completas: perder en el paso 5 no es lo mismo
        // que perder en el primero.
        return cerrar(((ronda - 1) / PASOS) * 100, `Perdiste el ritmo en el paso ${ronda}.`);
      }
      paso++;
      if (paso < ronda) return;

      if (ronda === PASOS) return cerrar(100, 'Los seis pasos, clavados.');
      ronda++;
      marcador();
      setTimeout(mostrar, 400);
    }

    mostrar();
  },
};

// =====================================================================
// FINAL
// =====================================================================
let ultimoFinal = null;

function renderFinal(p) {
  ultimoFinal = p;
  mostrarPantalla('pantalla-final');
  $('#final-ilu').dataset.cat = p.abandono ? 'aviso' : 'generales';
  $('#final-ilu').innerHTML = ilustracion(p.final.ilustracion);
  $('#final-sello').textContent = p.abandono ? 'Carrera interrumpida' : 'Fin de la carrera';
  $('#final-titulo').textContent = p.final.titulo;
  $('#final-texto').textContent = p.final.texto;

  $('#final-stats').innerHTML = p.stats.map((s) => `
    <div class="fs">
      <span class="fs-ico" style="color:${s.color}">${icono(s.icono, s.codigo)}</span>
      <b style="color:${s.color}">${s.valor}</b>
      <span class="fs-nom">${s.nombre}</span>
    </div>`).join('');

  $('#final-resumen').innerHTML = (p.resumen || []).map((h) => {
    const deltas = Object.entries(h.deltas || {}).filter(([, v]) => v !== 0)
      .map(([c, v]) => `${META.stats.find((x) => x.codigo === c)?.icono || c}${v > 0 ? '+' : ''}${v}`)
      .join('  ');
    return `<li><b>${h.evento}</b><br><em>${h.respuesta || ''}</em><br>${h.resultado || ''}${
      deltas ? `<br><small>${deltas}</small>` : ''}</li>`;
  }).join('');
}

// =====================================================================
// EXPORTAR LA PARTIDA COMO IMAGEN
// Se dibuja en canvas en vez de capturar el DOM: sin dependencias, y el
// resultado es una placa pensada para compartir, no un screenshot.
// =====================================================================
const ESCALA = 2;          // se dibuja en unidades de diseño y se exporta al doble
const ANCHO = 540;
const MARGEN = 26;

// Convierte un SVG de la biblioteca en una imagen lista para el canvas.
function svgAImagen(svgTexto, trazo, masa, tam) {
  const svg = svgTexto
    .replace(/currentColor/g, trazo)
    .replace(/var\(--ilu-masa,\s*#FFFFFF\)/g, masa)
    .replace('<svg ', `<svg width="${tam}" height="${tam}" `);
  const img = new Image();
  img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  return img.decode().then(() => img);
}

function envolver(ctx, texto, ancho) {
  const lineas = [];
  let linea = '';
  for (const palabra of String(texto).split(' ')) {
    const prueba = linea ? `${linea} ${palabra}` : palabra;
    if (ctx.measureText(prueba).width > ancho && linea) { lineas.push(linea); linea = palabra; }
    else linea = prueba;
  }
  if (linea) lineas.push(linea);
  return lineas;
}

async function construirPlaca() {
  const p = ultimoFinal;
  const css = getComputedStyle(document.documentElement);
  const col = (n) => css.getPropertyValue(n).trim();
  const NEGRO = col('--negro') || '#12100E';
  const AMARILLO = col('--amarillo') || '#FFD520';
  const NARANJA = col('--naranja') || '#F05A28';
  const fondo = getComputedStyle(document.body).backgroundColor;

  // Las tipografías tienen que estar cargadas o el canvas usa la de sistema.
  if (document.fonts?.ready) await document.fonts.ready;

  const medidor = document.createElement('canvas').getContext('2d');
  const interior = ANCHO - MARGEN * 2 - 8;   // menos el borde del panel
  const textoX = 24;

  medidor.font = '800 30px "Archivo Black", "Arial Black", sans-serif';
  const lineasTitulo = envolver(medidor, p.final.titulo.toUpperCase(), interior - textoX * 2);
  medidor.font = '500 15px "Trebuchet MS", sans-serif';
  const lineasTexto = envolver(medidor, p.final.texto, interior - textoX * 2);

  const bandaH = 200;
  const alturaPanel = bandaH + 30 + 26 + lineasTitulo.length * 34 + 16
    + lineasTexto.length * 23 + 26 + 96 + 26 + 46 + 24;
  const ALTO = alturaPanel + MARGEN * 2;

  const cv = document.createElement('canvas');
  cv.width = ANCHO * ESCALA;
  cv.height = ALTO * ESCALA;
  const ctx = cv.getContext('2d');
  ctx.scale(ESCALA, ESCALA);
  ctx.textBaseline = 'alphabetic';

  // --- Fondo con la cuadrícula de píxeles ---
  ctx.fillStyle = fondo;
  ctx.fillRect(0, 0, ANCHO, ALTO);
  ctx.fillStyle = 'rgba(0,0,0,.16)';
  for (let x = 0; x < ANCHO; x += 18) ctx.fillRect(x, 0, 2, ALTO);
  for (let y = 0; y < ALTO; y += 18) ctx.fillRect(0, y, ANCHO, 2);

  // --- Panel ---
  const px = MARGEN, py = MARGEN, pw = ANCHO - MARGEN * 2;
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(px, py, pw, alturaPanel);
  ctx.lineWidth = 4;
  ctx.strokeStyle = NEGRO;
  ctx.strokeRect(px + 2, py + 2, pw - 4, alturaPanel - 4);

  // --- Banda de color con la ilustración ---
  const tinte = p.abandono ? col('--beige') : AMARILLO;
  ctx.fillStyle = tinte;
  ctx.fillRect(px + 4, py + 4, pw - 8, bandaH - 4);
  ctx.fillStyle = NEGRO;
  ctx.fillRect(px + 4, py + bandaH, pw - 8, 4);

  const ilu = await svgAImagen(ilustracion(p.final.ilustracion), NEGRO, '#FFFFFF', 200);
  ctx.drawImage(ilu, px + pw / 2 - 74, py + 26, 148, 148);

  let y = py + bandaH + 4;

  // --- Sello ---
  const sello = p.abandono ? 'CARRERA INTERRUMPIDA' : 'FIN DE LA CARRERA';
  ctx.font = '9px "Press Start 2P", monospace';
  const selloW = ctx.measureText(sello).width + 28;
  ctx.fillStyle = NEGRO;
  ctx.fillRect(px + pw / 2 - selloW / 2, y, selloW, 28);
  ctx.fillStyle = '#FFFFFF';
  ctx.textAlign = 'center';
  ctx.fillText(sello, px + pw / 2, y + 19);
  y += 28 + 26;

  // --- Título ---
  ctx.font = '800 30px "Archivo Black", "Arial Black", sans-serif';
  ctx.lineWidth = 4;
  ctx.lineJoin = 'round';
  ctx.strokeStyle = NEGRO;
  ctx.fillStyle = NARANJA;
  for (const l of lineasTitulo) {
    ctx.strokeText(l, px + pw / 2, y + 24);
    ctx.fillText(l, px + pw / 2, y + 24);
    y += 34;
  }
  y += 16;

  // --- Texto del final ---
  ctx.font = '500 15px "Trebuchet MS", sans-serif';
  ctx.fillStyle = '#24211C';
  ctx.textAlign = 'left';
  for (const l of lineasTexto) { ctx.fillText(l, px + textoX, y); y += 23; }
  y += 26;

  // --- Los cuatro stats ---
  const visibles = p.stats.slice(0, 4);
  const hueco = 8;
  const cajaW = (pw - textoX * 2 - hueco * 3) / visibles.length;
  const iconos = await Promise.all(visibles.map((s) =>
    svgAImagen(icono(s.icono, s.codigo), s.color, '#FFFFFF', 48)));

  visibles.forEach((s, i) => {
    const bx = px + textoX + i * (cajaW + hueco);
    ctx.fillStyle = NEGRO;
    ctx.fillRect(bx, y, cajaW, 92);
    ctx.drawImage(iconos[i], bx + cajaW / 2 - 11, y + 12, 22, 22);
    ctx.textAlign = 'center';
    ctx.font = '15px "Press Start 2P", monospace';
    ctx.fillStyle = s.color;
    ctx.fillText(String(s.valor), bx + cajaW / 2, y + 58);
    ctx.font = '6.5px "Press Start 2P", monospace';
    ctx.fillStyle = '#B9B7AE';
    ctx.fillText(s.nombre.toUpperCase(), bx + cajaW / 2, y + 78);
  });
  y += 92 + 26;

  // --- Pie ---
  ctx.fillStyle = NEGRO;
  ctx.fillRect(px + textoX, y, pw - textoX * 2, 3);
  y += 26;
  ctx.textAlign = 'left';
  ctx.font = '13px "Press Start 2P", monospace';
  ctx.fillStyle = NEGRO;
  ctx.fillText('FSOQUER', px + textoX, y + 10);
  ctx.textAlign = 'right';
  ctx.font = '8px "Press Start 2P", monospace';
  ctx.fillStyle = '#6B6B63';
  const pie = nombreJugador ? nombreJugador.toUpperCase() : `${p.totalRondas} RONDAS`;
  ctx.fillText(pie, px + pw - textoX, y + 9);

  return cv;
}

function descargar(blob, nombre) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = nombre;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

async function exportarImagen() {
  const btn = $('#btn-compartir');
  if (!ultimoFinal || btn.disabled) return;
  const original = btn.textContent;
  btn.disabled = true;
  btn.textContent = 'Generando…';
  try {
    const cv = await construirPlaca();
    const blob = await new Promise((res) => cv.toBlob(res, 'image/png'));
    const nombre = `fsoquer-${ultimoFinal.final.codigo}.png`;
    const archivo = new File([blob], nombre, { type: 'image/png' });

    // En celular abre el menú de compartir; en escritorio descarga.
    if (navigator.canShare?.({ files: [archivo] })) {
      await navigator.share({ files: [archivo], title: 'FSOQUER', text: ultimoFinal.final.titulo });
      btn.textContent = original;
    } else {
      descargar(blob, nombre);
      btn.textContent = '¡Descargada!';
      setTimeout(() => { btn.textContent = original; }, 2200);
    }
  } catch (e) {
    // Si el usuario cancela el menú de compartir no es un error real.
    if (e.name !== 'AbortError') {
      console.error(e);
      btn.textContent = 'No se pudo generar';
      setTimeout(() => { btn.textContent = original; }, 2600);
    } else {
      btn.textContent = original;
    }
  } finally {
    btn.disabled = false;
  }
}

// =====================================================================
// `dev.js` espera esta promesa antes de saltar a ningún lado.
const listoInicio = initInicio()
  .catch((e) => alert('No se pudo cargar el juego: ' + e.message));
