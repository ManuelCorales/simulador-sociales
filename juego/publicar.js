// =====================================================================
//  Copia el juego al sitio de Helecho Social.
//
//      npm run publicar            -> ../../../HelechoSocial/simulador
//      npm run publicar -- ruta    -> a donde le digas
//
//  Corré `npm run build` antes (o usá `npm run publicar` del package.json,
//  que ya lo encadena): lo que se copia es public/, y contenido.json solo se
//  regenera con el build.
// =====================================================================

const fs = require('fs');
const path = require('path');

// Los siete archivos que son el sitio. La lista es explícita a propósito: si
// mañana aparece un archivo suelto en public/ (pasó: un `k` de dos bytes que
// se coló en una copia), no se publica sin querer.
const ARCHIVOS = [
  'index.html', 'styles.css',
  'motor.js', 'app.js', 'ilustraciones.js', 'dev.js',
  'contenido.json',
];

const origen = path.join(__dirname, 'public');
const destino = process.argv[2]
  || path.join(__dirname, '..', '..', '..', 'HelechoSocial', 'simulador');

if (!fs.existsSync(destino)) {
  console.error(`\nNo existe la carpeta de destino:\n  ${path.resolve(destino)}\n`);
  console.error('Pasá la ruta como argumento:');
  console.error('  npm run publicar -- "C:\\ruta\\a\\HelechoSocial\\simulador"\n');
  process.exit(1);
}

let copiados = 0, iguales = 0;
for (const f of ARCHIVOS) {
  const a = path.join(origen, f);
  const b = path.join(destino, f);
  if (!fs.existsSync(a)) {
    console.error(`\nFalta ${f} en public/. ¿Corriste "npm run build"?\n`);
    process.exit(1);
  }
  const nuevo = fs.readFileSync(a);
  if (fs.existsSync(b) && Buffer.compare(nuevo, fs.readFileSync(b)) === 0) {
    iguales++;
    continue;
  }
  fs.writeFileSync(b, nuevo);
  console.log(`  actualizado  ${f}`);
  copiados++;
}

// Lo que sobra en el destino no se borra solo, pero se avisa: casi siempre es
// basura de una copia vieja, y en un sitio estático todo lo que está ahí queda
// público.
const sobran = fs.readdirSync(destino).filter((f) => !ARCHIVOS.includes(f));

console.log(`\n${copiados} archivos actualizados, ${iguales} ya estaban al día.`);
console.log(`Destino: ${path.resolve(destino)}`);
if (sobran.length) {
  console.log(`\n  OJO: sobran ${sobran.length} archivos en el destino, y en un sitio`);
  console.log('  estático quedan públicos. Revisá si tienen que estar:');
  sobran.forEach((f) => console.log('    ' + f));
}
console.log('\nFalta commitear y pushear el repo de HelechoSocial.\n');
