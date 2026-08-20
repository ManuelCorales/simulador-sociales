// =====================================================================
//  Vuelca el contenido de game.db a public/contenido.json.
//  Ese JSON es lo único que el navegador necesita: con él, `public/` es
//  el sitio entero y se puede subir a cualquier hosting estático.
//
//  Uso: npm run build   (corre el seed y después esto)
// =====================================================================

const fs = require('fs');
const path = require('path');
const { cargarContenido } = require('./db/cargar.js');

const SALIDA = path.join(__dirname, 'public', 'contenido.json');

const C = cargarContenido();
const json = JSON.stringify(C);
fs.writeFileSync(SALIDA, json);

const kb = (n) => (n / 1024).toFixed(1) + ' KB';
console.log(`\ncontenido.json escrito en public/  (${kb(Buffer.byteLength(json))})`);
console.log(`  eventos: ${C.eventos.length} | minijuegos: ${C.minijuegos.length} | finales: ${C.finales.length}`);
console.log('\n  public/ ya es el sitio completo. Subilo a Vercel, Netlify o GitHub Pages.\n');
