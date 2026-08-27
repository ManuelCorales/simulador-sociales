// =====================================================================
//  Importa eventos-pdf.xlsx al formato de contenido del juego.
//
//    node db/importar-excel.js [ruta] [--salida archivo.js]
//
//  Por defecto lee ../eventos-pdf.xlsx y escribe db/eventos-importados.js.
//  NO toca el Excel: solo lo lee.
//
//  Sin dependencias: un .xlsx es un ZIP con XML adentro, y Node trae zlib.
//  También acepta un .csv (exportá la hoja "Eventos" desde Excel) por si el
//  archivo se guardó de una forma que el lector no entiende.
// =====================================================================

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// ---------------------------------------------------------------------
// Lo que el script decide y el Excel no dice
//
// El Excel tiene el contenido; estas cuatro cosas son de motor y se derivan
// acá. Están arriba de todo a propósito: es lo único que hay que tocar si
// alguna decisión no gusta.
// ---------------------------------------------------------------------
const PESO_EVENTO = 100;          // todos compiten igual en la bolsa
const VIOLENCIA_POR_MARCA = 20;   // cuánto suma un efecto marcado "violencia"
const ILUSTRACION_DEFECTO = 'facultad';

// Ningún evento que pueda terminar la partida sale en las primeras rondas.
// Sin esto, la muerte en el ataque armado, la expulsión y el abandono pueden
// caer en la carta 1 y liquidar la partida antes de empezar: medido, le pasaba
// al 1% de los jugadores.
const RONDA_MIN_FINAL_ANTICIPADO = 4;

// La columna `especial` marca los duelos como "minijuego <algo> (si ganás)".
// Esta tabla traduce ese <algo> al código del minijuego que se lanza.
//
// El Excel dice "memotest" porque así estaba en el PDF, pero el duelo de baile
// contra el falso Michael Jackson se juega con Simon Dice: una secuencia de
// pasos que hay que repetir, que es lo que hace un duelo de baile. El Excel no
// se toca; la equivalencia vive acá.
const MINIJUEGO_POR_MARCA = {
  memotest: 'mj_simon',
};

// Fase o ronda mínima según la columna nivel del Excel.
const NIVEL = {
  'ingresante': { fase: 'ingresante' },
  'intermedio': { fase: 'intermedio' },
  'avanzado':   { fase: 'avanzado' },
  'mitad de carrera': { ronda_min: 3 },
};

// La ilustración se elige por palabra clave sobre el título y el enunciado.
// Los códigos son los de public/ilustraciones.js. El orden importa: gana la
// primera que matchea.
const ILUSTRACIONES = [
  ['plata',      /plata|guita|beca|sueldo|pesos|lucas|billete|kiosco|comprar|precio|vender|cobrar|efectivo/i],
  ['multitud',   /marcha|asamblea|movilizac|agrupac|militante|multitud|grupo armado|linchamiento|campamento|protest|movimiento/i],
  ['afiche',     /afiche|campaña|elecci|voto|panfleto|revoluci|pasadas/i],
  ['libro',      /libro|leer|leíste|autor|bibliograf|monograf|apunte|parcial|final|estudiar|teórico|materia|paper/i],
  ['camara',     /notero|foto|instagram|viral|medios|cámara|video|story/i],
  ['comida',     /empanada|hamburgues|comedor|buffet|alfajor|fideos|olla|comer|café/i],
  ['bondi',      /bondi|colectivo|tren|roca|bici|subte|molinete|viaje|sube/i],
  ['noche',      /noche|after|fiesta|recital|dormir|siesta|madrugada|alarma/i],
  ['profesor',   /profesor|profesora|titular|docente|cátedra|director|decano|ayudante/i],
  ['plaza',      /plaza seca|patio gay|pucho|fumar|porro/i],
  ['sobre',      /trámite|formulario|inscrip|siu|departamento de alumnos|secretaria/i],
  ['alerta',     /therian|acosador|manson|amenaza|denuncia|policía|expulsi|violencia/i],
  ['estudiante', /compañer|facuamigo|amigo|novia|chica|pibe|loco|charla/i],
];

// ---------------------------------------------------------------------
// Lector mínimo de .xlsx  (ZIP + XML, sin dependencias)
// ---------------------------------------------------------------------
function leerZip(buf) {
  // El directorio central está al final del archivo, después de una firma
  // 0x06054b50 que puede tener hasta 64 KB de comentario detrás.
  let fin = -1;
  for (let i = buf.length - 22; i >= Math.max(0, buf.length - 66000); i--) {
    if (buf.readUInt32LE(i) === 0x06054b50) { fin = i; break; }
  }
  if (fin < 0) throw new Error('No parece un ZIP válido (no encontré el directorio central).');

  const cantidad = buf.readUInt16LE(fin + 10);
  let p = buf.readUInt32LE(fin + 16);
  const archivos = {};

  for (let n = 0; n < cantidad; n++) {
    if (buf.readUInt32LE(p) !== 0x02014b50) break;
    const metodo   = buf.readUInt16LE(p + 10);
    const compLen  = buf.readUInt32LE(p + 20);
    const nombreLen= buf.readUInt16LE(p + 28);
    const extraLen = buf.readUInt16LE(p + 30);
    const comLen   = buf.readUInt16LE(p + 32);
    const offset   = buf.readUInt32LE(p + 42);
    const nombre   = buf.toString('utf8', p + 46, p + 46 + nombreLen);

    // El header local repite el nombre y trae su propio campo extra, que
    // puede tener otro largo que el del directorio central.
    const nLocal = buf.readUInt16LE(offset + 26);
    const eLocal = buf.readUInt16LE(offset + 28);
    const datos  = buf.subarray(offset + 30 + nLocal + eLocal,
                                offset + 30 + nLocal + eLocal + compLen);
    archivos[nombre] = metodo === 0 ? datos : zlib.inflateRawSync(datos);
    p += 46 + nombreLen + extraLen + comLen;
  }
  return archivos;
}

const desescapar = (s) => s
  .replace(/&lt;/g, '<').replace(/&gt;/g, '>')
  .replace(/&quot;/g, '"').replace(/&apos;/g, "'")
  .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(+n))
  .replace(/&amp;/g, '&');

// Texto de un <si> de sharedStrings: puede venir partido en varios <t>.
const textoDeNodo = (xml) => {
  const partes = xml.match(/<t[^>]*>([\s\S]*?)<\/t>/g) || [];
  return desescapar(partes.map((t) => t.replace(/<[^>]+>/g, '')).join(''));
};

const col = (ref) => {
  const letras = ref.match(/^[A-Z]+/)[0];
  let n = 0;
  for (const ch of letras) n = n * 26 + (ch.charCodeAt(0) - 64);
  return n - 1;
};

function leerHoja(ruta, nombreHoja) {
  const zip = leerZip(fs.readFileSync(ruta));

  const wb = zip['xl/workbook.xml'].toString('utf8');
  const rels = zip['xl/_rels/workbook.xml.rels'].toString('utf8');
  const hoja = (wb.match(/<sheet[^>]*\/>/g) || [])
    .map((s) => ({
      nombre: desescapar((s.match(/name="([^"]*)"/) || [])[1] || ''),
      rid: (s.match(/r:id="([^"]*)"/) || [])[1],
    }))
    .find((h) => h.nombre === nombreHoja);
  if (!hoja) throw new Error(`El archivo no tiene una hoja llamada "${nombreHoja}".`);

  const rel = (rels.match(new RegExp(`<Relationship[^>]*Id="${hoja.rid}"[^>]*>`)) || [])[0];
  let destino = (rel.match(/Target="([^"]*)"/) || [])[1];
  destino = destino.replace(/^\/?xl\//, '').replace(/^\//, '');
  const xml = (zip['xl/' + destino] || zip[destino]).toString('utf8');

  const compartidas = zip['xl/sharedStrings.xml']
    ? (zip['xl/sharedStrings.xml'].toString('utf8').match(/<si>[\s\S]*?<\/si>/g) || []).map(textoDeNodo)
    : [];

  const filas = [];
  for (const filaXml of xml.match(/<row[^>]*>[\s\S]*?<\/row>/g) || []) {
    const fila = [];
    for (const celda of filaXml.match(/<c[^>]*\/>|<c[^>]*>[\s\S]*?<\/c>/g) || []) {
      const ref = (celda.match(/r="([A-Z]+\d+)"/) || [])[1];
      if (!ref) continue;
      const tipo = (celda.match(/t="([^"]*)"/) || [])[1];
      let valor = null;
      if (tipo === 's') {
        const i = (celda.match(/<v>(\d+)<\/v>/) || [])[1];
        valor = i != null ? compartidas[+i] : null;
      } else if (tipo === 'inlineStr') {
        valor = textoDeNodo(celda);
      } else if (tipo === 'str') {
        valor = desescapar(((celda.match(/<v>([\s\S]*?)<\/v>/) || [])[1] || ''));
      } else {
        const v = (celda.match(/<v>([\s\S]*?)<\/v>/) || [])[1];
        valor = v != null && v !== '' ? Number(v) : null;
      }
      fila[col(ref)] = valor;
    }
    filas.push(fila);
  }
  return filas;
}

// Alternativa: CSV con comas y comillas dobles.
function leerCsv(ruta) {
  const txt = fs.readFileSync(ruta, 'utf8').replace(/^﻿/, '');
  const filas = [];
  let fila = [], campo = '', comillas = false;
  for (let i = 0; i < txt.length; i++) {
    const ch = txt[i];
    if (comillas) {
      if (ch === '"' && txt[i + 1] === '"') { campo += '"'; i++; }
      else if (ch === '"') comillas = false;
      else campo += ch;
    } else if (ch === '"') comillas = true;
    else if (ch === ',') { fila.push(campo); campo = ''; }
    else if (ch === '\n') { fila.push(campo); filas.push(fila); fila = []; campo = ''; }
    else if (ch !== '\r') campo += ch;
  }
  if (campo || fila.length) { fila.push(campo); filas.push(fila); }
  return filas;
}

// ---------------------------------------------------------------------
// Excel -> estructura del juego
// ---------------------------------------------------------------------
const slug = (s) => String(s).toLowerCase()
  .normalize('NFD').replace(/[̀-ͯ]/g, '')
  .replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '').slice(0, 28);

const esc = (s) => String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'");

function ilustracionDe(texto) {
  for (const [codigo, re] of ILUSTRACIONES) if (re.test(texto)) return codigo;
  return ILUSTRACION_DEFECTO;
}

function convertir(filas) {
  const cab = filas[0].map((c) => String(c || '').trim());
  const idx = {};
  cab.forEach((c, i) => { idx[c] = i; });
  for (const req of ['id', 'titulo', 'enunciado', 'n_resp', 'respuesta',
                     'n_efecto', 'probabilidad', 'resultado']) {
    if (idx[req] === undefined) throw new Error(`Falta la columna "${req}" en la hoja.`);
  }
  const dato = (f, c) => (idx[c] === undefined ? null : f[idx[c]]);

  const eventos = new Map();
  const avisos = [];   // se reportan pero no se cargan: hoy no hay avisos

  for (const f of filas.slice(1)) {
    const id = dato(f, 'id');
    if (!id) continue;

    if (!eventos.has(id)) {
      const titulo = String(dato(f, 'titulo') || '').trim();
      const enunciado = String(dato(f, 'enunciado') || '').trim();
      const nivel = String(dato(f, 'nivel') || '').trim().toLowerCase();
      eventos.set(id, {
        id,
        codigo: `${id.toLowerCase()}_${slug(titulo)}`,
        titulo, enunciado,
        origen: String(dato(f, 'origen_pdf') || '').trim(),
        nivel,
        extra: NIVEL[nivel] || {},
        ilustracion: ilustracionDe(titulo + ' ' + enunciado),
        respuestas: new Map(),
      });
    }
    const ev = eventos.get(id);

    const nr = Number(dato(f, 'n_resp'));
    if (!ev.respuestas.has(nr)) {
      ev.respuestas.set(nr, { texto: String(dato(f, 'respuesta') || '').trim(), efectos: [] });
    }

    const especial = String(dato(f, 'especial') || '').trim().toLowerCase();

    // Duelo: la respuesta lanza un minijuego y cada efecto es una rama.
    const marca = especial.match(/minijuego\s+([a-záéíóúñ]+)/);
    if (marca) {
      const codigo = MINIJUEGO_POR_MARCA[marca[1]];
      if (!codigo) throw new Error(`No sé qué minijuego es "${marca[1]}" (fila de ${id}).`);
      ev.respuestas.get(nr).minijuego = codigo;
    }
    const rama = especial.includes('si gan') ? 'gana'
               : especial.includes('si perd') ? 'pierde' : null;
    const stats = {};
    for (const k of ['guita', 'conocimiento', 'fama', 'politica']) {
      const v = dato(f, k);
      if (typeof v === 'number' && v !== 0) stats[k] = v;
    }
    if (especial.includes('violencia')) stats.violencia = VIOLENCIA_POR_MARCA;

    // La probabilidad viene como fracción (0,5) y el motor la usa como peso.
    const prob = Number(dato(f, 'probabilidad'));
    ev.respuestas.get(nr).efectos.push({
      peso: Math.round((prob <= 1 ? prob * 100 : prob)),
      texto: String(dato(f, 'resultado') || '').trim(),
      stats,
      termina_partida: especial.includes('termina partida') || especial.includes('salida de carrera'),
      es_abandono: especial.includes('salida de carrera'),
      rama,
      especial,
      notas: String(dato(f, 'notas') || '').trim(),
    });
  }

  // Los eventos que pueden cortar la partida se corren a la segunda mitad.
  for (const ev of eventos.values()) {
    const corta = [...ev.respuestas.values()]
      .some((r) => r.efectos.some((ef) => ef.termina_partida));
    if (corta && !ev.extra.fase && !ev.extra.ronda_min) {
      ev.extra = { ...ev.extra, ronda_min: RONDA_MIN_FINAL_ANTICIPADO };
    }
  }

  return { eventos: [...eventos.values()], avisos };
}

// ---------------------------------------------------------------------
// Estructura -> texto JavaScript
// ---------------------------------------------------------------------
function generar(eventos) {
  const L = [];
  L.push('// =====================================================================');
  L.push('//  GENERADO POR db/importar-excel.js — no editar a mano.');
  L.push('//  Fuente: eventos-pdf.xlsx. Para cambiar algo, cambialo en el Excel');
  L.push('//  y volvé a correr el importador.');
  L.push(`//  Generado: ${new Date().toISOString().slice(0, 10)}`);
  L.push('// =====================================================================');
  L.push('');
  L.push("const T = (s) => ({ m: s, f: s, nb: s });");
  L.push('');
  L.push('const eventosImportados = [');

  for (const ev of eventos) {
    const attrs = [`codigo: '${esc(ev.codigo)}'`, `ilustracion: '${ev.ilustracion}'`,
                   `categoria: 'generales'`, `peso: ${PESO_EVENTO}`];
    if (ev.extra.fase) attrs.push(`fase: '${ev.extra.fase}'`);
    if (ev.extra.ronda_min) attrs.push(`ronda_min: ${ev.extra.ronda_min}`);

    L.push('  {');
    L.push(`    ${attrs.join(', ')},`);
    L.push(`    titulo: T('${esc(ev.titulo)}'),`);
    L.push(`    texto: T('${esc(ev.enunciado)}'),`);
    const notas = [`PDF: ${ev.origen}`];
    if (ev.nivel) notas.push(`nivel: ${ev.nivel}`);
    L.push(`    notas_autor: '${esc(notas.join(' | '))}',`);
    L.push('    respuestas: [');
    for (const r of [...ev.respuestas.values()]) {
      const mjResp = r.minijuego ? `, minijuego: '${r.minijuego}'` : '';
      L.push(`      { texto: T('${esc(r.texto)}')${mjResp}, efectos: [`);
      for (const ef of r.efectos) {
        const partes = [`peso: ${ef.peso}`];
        if (ef.rama) partes.push(`rama: '${ef.rama}'`);
        if (ef.termina_partida) partes.push('termina_partida: true');
        if (ef.es_abandono) partes.push('es_abandono: true');
        partes.push(`texto: T('${esc(ef.texto)}')`);
        const st = Object.entries(ef.stats).map(([k, v]) => `${k}: ${v}`).join(', ');
        if (st) partes.push(`stats: { ${st} }`);
        L.push(`        { ${partes.join(', ')} },`);
      }
      L.push('      ]},');
    }
    L.push('    ],');
    L.push('  },');
  }

  L.push('];');
  L.push('');
  L.push('module.exports = { eventosImportados };');
  L.push('');
  return L.join('\n');
}

// ---------------------------------------------------------------------
function main() {
  const args = process.argv.slice(2);
  const iSalida = args.indexOf('--salida');
  const salida = iSalida >= 0 ? args[iSalida + 1]
                              : path.join(__dirname, 'eventos-importados.js');
  const entrada = args.find((a, i) => !a.startsWith('--') && args[i - 1] !== '--salida')
    || path.join(__dirname, '..', '..', 'eventos-pdf.xlsx');

  if (!fs.existsSync(entrada)) {
    console.error(`\nNo encontré el archivo:\n  ${path.resolve(entrada)}\n`);
    console.error('Pasá la ruta como primer argumento:');
    console.error('  node db/importar-excel.js ../eventos-pdf.xlsx\n');
    process.exit(1);
  }

  const filas = entrada.toLowerCase().endsWith('.csv')
    ? leerCsv(entrada)
    : leerHoja(entrada, 'Eventos');

  const { eventos } = convertir(filas);

  // ---- reporte ----
  const nResp = eventos.reduce((s, e) => s + e.respuestas.size, 0);
  const nEf = eventos.reduce((s, e) => s + [...e.respuestas.values()]
    .reduce((t, r) => t + r.efectos.length, 0), 0);

  console.log(`\nLeído: ${path.resolve(entrada)}`);
  console.log(`  ${eventos.length} eventos · ${nResp} respuestas · ${nEf} efectos\n`);

  const netos = { guita: 0, conocimiento: 0, fama: 0, politica: 0 };
  let violentos = 0, terminan = 0, abandonos = 0;
  const porIlu = {}, porNivel = {}, resp = {};
  for (const e of eventos) {
    porIlu[e.ilustracion] = (porIlu[e.ilustracion] ?? 0) + 1;
    porNivel[e.nivel || '(sin nivel)'] = (porNivel[e.nivel || '(sin nivel)'] ?? 0) + 1;
    resp[e.respuestas.size] = (resp[e.respuestas.size] ?? 0) + 1;
    for (const r of e.respuestas.values()) {
      for (const ef of r.efectos) {
        for (const [k, v] of Object.entries(ef.stats)) {
          if (k in netos) netos[k] += v;
        }
        if (ef.stats.violencia) violentos++;
        if (ef.termina_partida) terminan++;
        if (ef.es_abandono) abandonos++;
      }
    }
  }

  console.log('  Neto por stat (suma de todo lo que suma y resta):');
  for (const [k, v] of Object.entries(netos)) {
    console.log(`    ${k.padEnd(14)} ${v > 0 ? '+' : ''}${v}`);
  }
  console.log('\n  Respuestas por evento:',
    Object.entries(resp).sort().map(([k, v]) => `${k} resp: ${v} eventos`).join(' · '));
  console.log('  Nivel:', Object.entries(porNivel).map(([k, v]) => `${k}: ${v}`).join(' · '));
  console.log('  Ilustración asignada:',
    Object.entries(porIlu).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k}: ${v}`).join(' · '));
  console.log(`\n  Efectos con violencia: ${violentos} (se les pone violencia: ${VIOLENCIA_POR_MARCA})`);
  console.log(`  Efectos que terminan la partida: ${terminan}  |  salidas de carrera: ${abandonos}`);

  // ---- chequeos ----
  const avisos = [];
  for (const e of eventos) {
    if (e.respuestas.size < 1 || e.respuestas.size > 4) {
      avisos.push(`${e.codigo}: ${e.respuestas.size} respuestas (el motor admite de 1 a 4)`);
    }
    for (const [n, r] of e.respuestas) {
      const suma = r.efectos.reduce((s, ef) => s + ef.peso, 0);
      if (r.minijuego) continue;   // las ramas de un duelo no son probabilidades
      if (r.efectos.length > 1 && suma !== 100) {
        avisos.push(`${e.codigo} resp ${n}: los pesos suman ${suma}, no 100 ` +
                    `(${r.efectos.map((ef) => ef.especial || '-').join(' / ')})`);
      }
    }
  }
  if (abandonos !== 1) avisos.push(`Hay ${abandonos} salidas de carrera; el seed exige exactamente 1.`);

  if (avisos.length) {
    console.log(`\n  ${avisos.length} cosas para mirar:`);
    avisos.forEach((a) => console.log('    - ' + a));
  } else {
    console.log('\n  Sin observaciones.');
  }

  fs.writeFileSync(salida, generar(eventos), 'utf8');
  console.log(`\nEscrito: ${path.resolve(salida)}`);
  console.log('  Todavía NO está enchufado al juego: contenido.js sigue con eventos: [].\n');
}

main();
