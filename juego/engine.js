// =====================================================================
//  Motor para Node.
//  Es el mismo `public/motor.js` que corre en el navegador; lo único que
//  agrega es leer el contenido desde SQLite en vez de recibirlo por JSON.
//  Lo usan los tests y cualquier script que quiera simular partidas.
// =====================================================================

const { crearMotor } = require('./public/motor.js');
const { cargarContenido } = require('./db/cargar.js');

module.exports = crearMotor(cargarContenido());
