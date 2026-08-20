// =====================================================================
//  MODO DESARROLLO
//  Deep links y panel para saltar a cualquier pantalla sin jugar la
//  partida entera. Se activa solo si hay parámetros en la URL:
//
//    ?dev                       abre el panel
//    ?evento=gen_plaza_seca     salta a ese evento
//    ?minijuego=molinete        salta a ese minijuego (código o mecánica)
//    ?final=fin_guita           salta a ese final
//    ?ronda=12                  arranca en esa ronda
//    ?genero=f                  m | f | nb
//    ?stats=guita:80,fama:20    fija los stats
//
//  Sin parámetros este archivo no hace absolutamente nada.
//  El backend se apaga con DEV=0 npm start.
// =====================================================================

(function modoDev() {
  const q = new URLSearchParams(location.search);
  const CLAVES = ['dev', 'evento', 'minijuego', 'final', 'ronda', 'genero', 'stats'];
  if (!CLAVES.some((k) => q.has(k))) return;

  let catalogo = null;
  let panelAbierto = true;

  const nota = (t) => {
    const n = document.querySelector('#dev-nota');
    if (n) n.textContent = t;
  };

  // --- Saltos ---------------------------------------------------------
  // El motor corre en esta misma pestaña: los saltos son llamadas directas.
  function saltar(nombre, aplicar, esFinal) {
    if (!partida) return;
    try {
      aplicar();
      const p = esFinal ? MOTOR.pantallaFinal(partida) : MOTOR.siguiente(partida);
      if (!esFinal) mostrarPantalla('pantalla-juego');
      render(p);
      nota('ok: ' + nombre);
    } catch (e) {
      nota('error: ' + e.message);
    }
  }

  const irAEvento = (codigo) => {
    fijarUrl({ evento: codigo });
    saltar('evento', () => MOTOR.devEvento(partida, codigo));
  };
  const irAMinijuego = (codigo) => {
    fijarUrl({ minijuego: codigo });
    saltar('minijuego', () => MOTOR.devMinijuego(partida, codigo));
  };
  const irAFinal = (codigo) => {
    fijarUrl({ final: codigo });
    saltar('final', () => MOTOR.devFinal(partida, codigo), true);
  };
  const irARonda = (ronda) => {
    fijarUrl({ ronda });
    saltar('ronda', () => MOTOR.devIrARonda(partida, ronda));
  };
  const fijarStats = (stats) => saltar('stats', () => MOTOR.devStats(partida, stats));

  // Deja la URL copiable con el último salto
  function fijarUrl(cambios) {
    const u = new URLSearchParams(location.search);
    u.set('dev', '1');
    ['evento', 'minijuego', 'final'].forEach((k) => { if (!(k in cambios)) u.delete(k); });
    Object.entries(cambios).forEach(([k, v]) => u.set(k, v));
    history.replaceState(null, '', location.pathname + '?' + u.toString());
  }

  // --- Panel ----------------------------------------------------------
  function grupoEventos() {
    const porCat = {};
    catalogo.eventos.forEach((e) => { (porCat[e.categoria] ||= []).push(e); });
    return Object.entries(porCat).map(([cat, evs]) => `
      <optgroup label="${cat} (${evs.length})">
        ${evs.map((e) => `<option value="${e.codigo}">${e.titulo} — ${e.codigo}</option>`).join('')}
      </optgroup>`).join('');
  }

  function construirPanel() {
    const p = document.createElement('div');
    p.id = 'dev-panel';
    p.innerHTML = `
      <div class="dev-barra">
        <b>DEV</b>
        <button type="button" id="dev-toggle" title="Plegar">–</button>
      </div>
      <div class="dev-cuerpo">
        <label>Evento
          <select id="dev-evento"><option value="">— elegir —</option>${grupoEventos()}</select>
        </label>
        <label>Minijuego
          <select id="dev-minijuego"><option value="">— elegir —</option>
            ${catalogo.minijuegos.map((m) => `<option value="${m.codigo}">${m.nombre} — ${m.mecanica}</option>`).join('')}
          </select>
        </label>
        <label>Final
          <select id="dev-final"><option value="">— elegir —</option>
            ${catalogo.finales.map((f) => `<option value="${f.codigo}">${f.titulo} — ${f.codigo}</option>`).join('')}
          </select>
        </label>
        <label>Ronda
          <input type="number" id="dev-ronda" min="1" max="${catalogo.totalRondas}" value="1">
        </label>
        <div class="dev-stats">
          ${catalogo.stats.map((s) => `
            <label title="${s.nombre}">
              <span style="color:${s.color}">${s.nombre.slice(0, 4)}</span>
              <input type="number" data-stat="${s.codigo}" min="0" max="100" value="50">
            </label>`).join('')}
        </div>
        <div class="dev-fila">
          <button type="button" id="dev-aplicar-stats">Aplicar stats</button>
          <button type="button" id="dev-reiniciar">Partida nueva</button>
        </div>
        <div id="dev-nota">listo</div>
      </div>`;
    document.body.appendChild(p);

    const $$$ = (s) => p.querySelector(s);
    $$$('#dev-evento').onchange = (e) => e.target.value && irAEvento(e.target.value);
    $$$('#dev-minijuego').onchange = (e) => e.target.value && irAMinijuego(e.target.value);
    $$$('#dev-final').onchange = (e) => e.target.value && irAFinal(e.target.value);
    $$$('#dev-ronda').onchange = (e) => irARonda(Number(e.target.value));
    $$$('#dev-aplicar-stats').onclick = () => {
      const stats = {};
      p.querySelectorAll('[data-stat]').forEach((i) => { stats[i.dataset.stat] = Number(i.value); });
      fijarStats(stats);
    };
    $$$('#dev-reiniciar').onclick = () => location.reload();
    $$$('#dev-toggle').onclick = () => {
      panelAbierto = !panelAbierto;
      p.classList.toggle('plegado', !panelAbierto);
      $$$('#dev-toggle').textContent = panelAbierto ? '–' : '+';
    };
  }

  // --- Arranque -------------------------------------------------------
  (async () => {
    await listoInicio;                       // espera a que app.js arme el motor
    if (!MOTOR) { console.warn('[dev] el motor no cargó'); return; }
    catalogo = MOTOR.devCatalogo();

    document.body.classList.add('dev-activo');

    // Partida silenciosa, sin pasar por la pantalla de inicio
    const genero = q.get('genero') || 'nb';
    partida = MOTOR.crearPartida({ nombre: 'DEV', genero, extra: { dev: true } });
    nombreJugador = 'DEV';
    mostrarPantalla('pantalla-juego');
    render(MOTOR.siguiente(partida));

    construirPanel();

    if (q.has('stats')) {
      const stats = {};
      q.get('stats').split(',').forEach((par) => {
        const [k, v] = par.split(':');
        if (k && v !== undefined) stats[k.trim()] = Number(v);
      });
      document.querySelectorAll('#dev-panel [data-stat]').forEach((i) => {
        if (stats[i.dataset.stat] !== undefined) i.value = stats[i.dataset.stat];
      });
      fijarStats(stats);
    }
    if (q.has('ronda')) irARonda(Number(q.get('ronda')));
    if (q.has('evento')) irAEvento(q.get('evento'));
    else if (q.has('minijuego')) irAMinijuego(q.get('minijuego'));
    else if (q.has('final')) irAFinal(q.get('final'));

    // Deja los selects marcando dónde estás parado
    const sel = (id, val) => { const e = document.querySelector(id); if (e && val) e.value = val; };
    sel('#dev-evento', q.get('evento'));
    sel('#dev-minijuego', q.get('minijuego'));
    sel('#dev-final', q.get('final'));
  })().catch((e) => console.error('[dev]', e));
})();
