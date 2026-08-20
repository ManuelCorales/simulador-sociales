// =====================================================================
//  Servidor de archivos estáticos para desarrollo.
//
//  El juego ya no necesita backend: el motor corre en el navegador y todo
//  el contenido está en public/contenido.json. Esto existe solo porque
//  abrir index.html con doble clic (file://) rompe el fetch del JSON.
//
//  Sin dependencias: solo módulos que vienen con Node.
//  En producción no se usa: se sube `public/` a cualquier hosting estático.
// =====================================================================

const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const PORT = process.env.PORT || 3000;
const RAIZ = path.join(__dirname, 'public');

const TIPOS = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
};

const servidor = http.createServer((req, res) => {
  const url = decodeURIComponent(req.url.split('?')[0]);
  const relativo = url === '/' ? 'index.html' : url.replace(/^\/+/, '');

  // Nada de subir por encima de public/
  const archivo = path.join(RAIZ, relativo);
  if (!archivo.startsWith(RAIZ)) {
    res.writeHead(403).end('Prohibido');
    return;
  }

  fs.readFile(archivo, (err, datos) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end(`No existe ${relativo}\n\n` +
        (relativo === 'contenido.json'
          ? 'Corré "npm run build" para generarlo.\n' : ''));
      return;
    }
    res.writeHead(200, {
      'Content-Type': TIPOS[path.extname(archivo)] || 'application/octet-stream',
      'Cache-Control': 'no-cache',
    });
    res.end(datos);
  });
});

servidor.listen(PORT, () => {
  const hay = fs.existsSync(path.join(RAIZ, 'contenido.json'));
  console.log(`\n  Juego corriendo en  http://localhost:${PORT}`);
  console.log(`  Sirviendo  ${RAIZ}`);
  if (hay) console.log('  Modo dev  ->  ' + `http://localhost:${PORT}/?dev`);
  else console.log('\n  FALTA public/contenido.json — corré "npm run build".');
  console.log('');
});
