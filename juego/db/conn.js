// =====================================================================
//  Capa fina sobre SQLite.
//  Usa better-sqlite3 si está instalado y compilado; si no, cae al
//  módulo nativo `node:sqlite` (Node 22.5+), que no necesita compilar nada.
//  Ambos exponen la misma interfaz mínima: exec / prepare(run|get|all).
// =====================================================================

const path = require('path');

// Ruta de la base. Si la carpeta del proyecto da problemas,
// se puede mover con: DB_PATH=C:\ruta\game.db npm start
const rutaDB = () => process.env.DB_PATH || path.join(__dirname, 'game.db');

// ---------------------------------------------------------------------
//  Modo de journal
//
//  SQLite escribe un archivo auxiliar al lado de la base según el modo:
//    WAL     -> game.db-wal y game.db-shm  (necesita memoria compartida)
//    DELETE  -> game.db-journal            (el clásico, +8 caracteres de ruta)
//    MEMORY  -> ninguno, el rollback va en RAM
//
//  Esto rompe en tres escenarios comunes:
//    - Rutas largas en Windows: el límite es 260 caracteres y lo que cuenta
//      es el archivo auxiliar, no la base. Una ruta de 255 abre bien pero
//      falla al escribir, con el confuso "unable to open database file".
//    - Carpetas de red o sincronizadas, donde WAL no puede mapear memoria.
//    - Rutas virtualizadas de apps de la Microsoft Store.
//
//  Por eso probamos los modos en orden y validamos cada uno con una
//  escritura real, en vez de confiar en que el PRAGMA no tire error.
// ---------------------------------------------------------------------
const MODOS = ['WAL', 'DELETE', 'MEMORY', 'OFF'];

function configurarJournal(exec) {
  const candidatos = process.env.JOURNAL ? [process.env.JOURNAL.toUpperCase()] : MODOS;

  for (const modo of candidatos) {
    try {
      exec(`PRAGMA journal_mode = ${modo}`);
      // Escritura de prueba: obliga a crear el archivo auxiliar si hace falta.
      exec('CREATE TABLE IF NOT EXISTS _probe_journal (x INTEGER)');
      exec('INSERT INTO _probe_journal (x) VALUES (1)');
      exec('DROP TABLE _probe_journal');
      return modo.toLowerCase();
    } catch { /* probamos el siguiente modo */ }
  }
  // Puede ser una base de solo lectura: no es motivo para abortar acá.
  return 'desconocido';
}

function avisoRutaLarga(file) {
  if (process.platform !== 'win32') return;
  const largo = path.resolve(file).length;
  if (largo > 230) {
    console.warn(
      `\n  Aviso: la ruta de la base mide ${largo} caracteres y Windows corta en 260.\n` +
      '  Va a funcionar con journal en memoria, pero conviene mover el proyecto\n' +
      '  a una carpeta corta (por ejemplo C:\\juego) o setear DB_PATH.\n');
  }
}

// better-sqlite3 no falla al importarse: falla recién al abrir la base, cuando
// carga el binario nativo. Un node_modules copiado entre sistemas operativos
// (Windows -> Linux, por ejemplo) tira "invalid ELF header" ahí. Por eso el
// intento envuelve las dos cosas y devuelve null si cualquiera falla.
function intentarBetterSqlite(file) {
  let Database;
  try {
    Database = require('better-sqlite3');
  } catch (err) {
    return { error: `no está instalado (${err.code || err.message})` };
  }
  try {
    const db = new Database(file);
    const exec = (sql) => db.exec(sql);
    const journal = configurarJournal(exec);
    try { exec('PRAGMA foreign_keys = ON'); } catch { /* ignorado */ }
    return {
      conexion: {
        motor: 'better-sqlite3',
        journal,
        ruta: file,
        exec,
        prepare: (sql) => db.prepare(sql),
        close: () => db.close(),
      },
    };
  } catch (err) {
    return { error: `no se pudo cargar el binario nativo (${err.message})` };
  }
}

function cargarNodeSqlite(motivo) {
  try {
    return require('node:sqlite').DatabaseSync;
  } catch {
    throw new Error(
      'No hay motor SQLite disponible.\n' +
      `  - better-sqlite3: ${motivo}\n` +
      `  - node:sqlite necesita Node 22.5 o superior (tenés ${process.version}).\n` +
      'Actualizá Node, o instalá better-sqlite3 con herramientas de compilación.');
  }
}

function abrir(file = rutaDB()) {
  avisoRutaLarga(file);

  const intento = intentarBetterSqlite(file);
  if (intento.conexion) return intento.conexion;

  const DatabaseSync = cargarNodeSqlite(intento.error);
  const db = new DatabaseSync(file);
  const exec = (sql) => db.exec(sql);
  const journal = configurarJournal(exec);
  try { exec('PRAGMA foreign_keys = ON'); } catch { /* ignorado */ }

  return {
    motor: 'node:sqlite',
    journal,
    ruta: file,
    exec,
    prepare(sql) {
      const st = db.prepare(sql);
      return {
        run: (...a) => {
          const r = st.run(...a);
          return { changes: Number(r.changes), lastInsertRowid: Number(r.lastInsertRowid) };
        },
        // node:sqlite devuelve objetos sin prototipo; los normalizo.
        get: (...a) => { const r = st.get(...a); return r ? { ...r } : r; },
        all: (...a) => st.all(...a).map((r) => ({ ...r })),
      };
    },
    close: () => db.close(),
  };
}

module.exports = { abrir, rutaDB };
