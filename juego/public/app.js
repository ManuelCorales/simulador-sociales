// =====================================================================
//  Front del juego. El estado real vive en el backend; acá solo se
//  guarda el id de partida en memoria (si recargás, se pierde).
// =====================================================================

const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];

let META = null;
let partidaId = null;
let pantallaActual = null;
let statsPrevios = {};

const api = async (url, opts = {}) => {
  const r = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...opts,
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });
  const data = await r.json();
  if (!r.ok) throw new Error(data.error || 'Error de red');
  return data;
};

const mostrarPantalla = (id) => {
  $$('.pantalla').forEach((p) => p.classList.toggle('activa', p.id === id));
};

// =====================================================================
// INICIO
// =====================================================================
let genero = 'nb';
let motivo = 'nose';

async function initInicio() {
  META = await api('/api/meta');

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
  $('#btn-reiniciar').addEventListener('click', () => { mostrarPantalla('pantalla-inicio'); });
  $('#btn-continuar').addEventListener('click', continuar);
}

async function empezar() {
  $('#btn-empezar').disabled = true;
  try {
    const r = await api('/api/partida', {
      method: 'POST',
      body: { nombre: $('#in-nombre').value, genero, extra: { motivo } },
    });
    partidaId = r.partidaId;
    statsPrevios = {};
    mostrarPantalla('pantalla-juego');
    render(r.pantalla);
  } catch (e) {
    alert(e.message);
  } finally {
    $('#btn-empezar').disabled = false;
  }
}

// =====================================================================
// HUD
// =====================================================================
function pintarStats(stats) {
  const cont = $('#stats');
  if (!cont.children.length) {
    cont.innerHTML = stats.map((s) => `
      <div class="stat" data-cod="${s.codigo}" title="${s.nombre}">
        <div class="ico" style="color:${s.color}">${s.icono || '•'}</div>
        <div class="barra"><i style="background:${s.color}"></i></div>
        <div class="val"></div>
      </div>`).join('');
  }
  stats.forEach((s) => {
    const el = cont.querySelector(`.stat[data-cod="${s.codigo}"]`);
    const pct = ((s.valor - s.min) / (s.max - s.min)) * 100;
    el.querySelector('i').style.width = Math.max(0, Math.min(100, pct)) + '%';
    el.querySelector('.val').textContent = s.valor;
    if (statsPrevios[s.codigo] !== undefined && statsPrevios[s.codigo] !== s.valor) {
      el.classList.remove('pulso');
      void el.offsetWidth;
      el.classList.add('pulso');
    }
    statsPrevios[s.codigo] = s.valor;
  });
}

function pintarProgreso(p) {
  $('#fase-nombre').textContent = p.fase ? p.fase.nombre : '';
  $('#ronda-label').textContent = `${p.ronda}/${p.totalRondas}`;
  $('#barra-rondas-fill').style.width = ((p.ronda - 1) / p.totalRondas) * 100 + '%';
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

  $('#carta-ilu').innerHTML = ilustracion(p.evento.ilustracion);
  $('#carta-personaje').textContent = p.evento.personaje || (p.evento.esAviso ? 'Aviso' : '');
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

async function responder(respuestaId) {
  const carta = $('#carta');
  if (carta.dataset.bloqueado === '1') return;
  carta.dataset.bloqueado = '1';
  try {
    const r = await api(`/api/partida/${partidaId}/responder`, {
      method: 'POST', body: { respuestaId },
    });
    mostrarResultado(r);
  } catch (e) {
    alert(e.message);
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
      return `<span class="delta ${v > 0 ? 'pos' : 'neg'}">${s?.icono || ''} ${v > 0 ? '+' : ''}${v}</span>`;
    }).join('') || '<span class="delta">sin cambios</span>';

  $('#resultado').classList.remove('oculto');
  $('#respuestas').innerHTML = '';
  $('#btn-continuar').focus();
}

async function continuar() {
  $('#resultado').classList.add('oculto');
  if (ultimoResultado?.siguiente === 'final') {
    const f = await api(`/api/partida/${partidaId}/final`);
    return render(f);
  }
  const p = await api(`/api/partida/${partidaId}`);
  render(p);
}

// =====================================================================
// MINIJUEGOS
// =====================================================================
function renderMinijuego(p) {
  $('#carta').classList.add('oculto');
  $('#respuestas').innerHTML = '';
  const box = $('#minijuego');
  box.classList.remove('oculto');

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

async function terminarMinijuego(puntaje) {
  $('#mj-estado').textContent = `Puntaje: ${Math.round(puntaje)}`;
  const r = await api(`/api/partida/${partidaId}/minijuego`, {
    method: 'POST', body: { puntaje },
  });
  $('#minijuego').classList.add('oculto');
  $('#carta').classList.remove('oculto');
  mostrarResultado(r);
}

const MECANICAS = {
  // --- Frenar la aguja dentro de la zona verde ---
  barra_timing(cfg, listo) {
    const intentos = cfg.intentos ?? 3;
    const ancho = cfg.ancho_zona ?? 22;
    const vel = cfg.velocidad ?? 1.6;

    const area = $('#mj-area');
    area.innerHTML = `<div class="pista"><div class="zona"></div><div class="aguja"></div></div>`;
    const zona = area.querySelector('.zona');
    const aguja = area.querySelector('.aguja');

    let restantes = intentos, aciertos = [];
    let pos = 0, dir = 1, raf = null, zonaIni = 0;

    const nuevaZona = () => {
      zonaIni = Math.random() * (100 - ancho);
      zona.style.left = zonaIni + '%';
      zona.style.width = ancho + '%';
    };
    const tick = () => {
      pos += dir * vel;
      if (pos >= 100) { pos = 100; dir = -1; }
      if (pos <= 0) { pos = 0; dir = 1; }
      aguja.style.left = pos + '%';
      raf = requestAnimationFrame(tick);
    };
    const estado = () => { $('#mj-estado').textContent = `Intentos restantes: ${restantes}`; };

    const frenar = () => {
      if (restantes <= 0) return;
      const centro = zonaIni + ancho / 2;
      const dist = Math.abs(pos - centro);
      const precision = dist <= ancho / 2 ? 1 - (dist / (ancho / 2)) * 0.4 : Math.max(0, 0.5 - dist / 60);
      aciertos.push(precision);
      restantes--;
      estado();
      if (restantes === 0) {
        cancelAnimationFrame(raf);
        area.onclick = null;
        const prom = aciertos.reduce((a, b) => a + b, 0) / aciertos.length;
        listo(Math.round(prom * 100));
      } else {
        nuevaZona();
      }
    };

    nuevaZona(); estado(); tick();
    area.onclick = frenar;
    $('#mj-instrucciones').textContent = 'Hacé clic sobre la pista para frenar la aguja en la franja verde.';
  },

  // --- Clickear lo más rápido posible ---
  click_rapido(cfg, listo) {
    const segundos = cfg.segundos ?? 8;
    const objetivo = cfg.objetivo ?? 40;

    const area = $('#mj-area');
    area.innerHTML = `<button class="boton-mj" type="button">¡DALE!</button>`;
    const btn = area.querySelector('button');

    let clicks = 0;
    let queda = segundos;
    $('#mj-estado').textContent = `${queda}s — 0 clics`;

    btn.onclick = () => { clicks++; $('#mj-estado').textContent = `${queda}s — ${clicks} clics`; };

    const t = setInterval(() => {
      queda--;
      $('#mj-estado').textContent = `${queda}s — ${clicks} clics`;
      if (queda <= 0) {
        clearInterval(t);
        btn.onclick = null;
        btn.disabled = true;
        listo(Math.min(100, (clicks / objetivo) * 100));
      }
    }, 1000);
  },

  // --- Repetir la secuencia ---
  memoria(cfg, listo) {
    const largo = cfg.largo ?? 5;
    const celdas = cfg.celdas ?? 4;

    const area = $('#mj-area');
    area.innerHTML = `<div class="grilla">${
      Array.from({ length: celdas }, (_, i) => `<div class="celda" data-i="${i}"></div>`).join('')}</div>`;
    const els = [...area.querySelectorAll('.celda')];

    const seq = Array.from({ length: largo }, () => Math.floor(Math.random() * celdas));
    let idx = 0, aciertos = 0, aceptando = false;

    const flash = (i, ms = 420) => new Promise((res) => {
      els[i].classList.add('on');
      setTimeout(() => { els[i].classList.remove('on'); setTimeout(res, 140); }, ms);
    });

    (async () => {
      $('#mj-estado').textContent = 'Mirá la secuencia…';
      await new Promise((r) => setTimeout(r, 500));
      for (const i of seq) await flash(i);
      aceptando = true;
      $('#mj-estado').textContent = `Tu turno: 0/${largo}`;
    })();

    els.forEach((el) => {
      el.onclick = async () => {
        if (!aceptando) return;
        const i = Number(el.dataset.i);
        const ok = seq[idx] === i;
        if (ok) aciertos++;
        el.classList.add(ok ? 'on' : 'mal');
        setTimeout(() => el.classList.remove('on', 'mal'), 220);
        idx++;
        $('#mj-estado').textContent = `Tu turno: ${idx}/${largo}`;
        if (idx >= largo) {
          aceptando = false;
          els.forEach((e) => { e.onclick = null; });
          setTimeout(() => listo((aciertos / largo) * 100), 350);
        }
      };
    });
  },
};

// =====================================================================
// FINAL
// =====================================================================
function renderFinal(p) {
  mostrarPantalla('pantalla-final');
  $('#final-ilu').innerHTML = ilustracion(p.final.ilustracion);
  $('#final-sello').textContent = p.abandono ? 'Carrera interrumpida' : 'Fin de la carrera';
  $('#final-titulo').textContent = p.final.titulo;
  $('#final-texto').textContent = p.final.texto;

  $('#final-stats').innerHTML = p.stats.map((s) => `
    <div class="fs">
      <b style="color:${s.color}">${s.valor}</b>
      <span>${s.nombre}</span>
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
initInicio().catch((e) => alert('No se pudo cargar el juego: ' + e.message));
