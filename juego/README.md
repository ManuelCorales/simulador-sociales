# La Carrera — juego tipo REIGNS

Prototipo jugable: SQLite + Express + front vanilla, todo local.

## Correrlo

```bash
cd juego-reigns
npm install
npm run seed      # crea db/game.db y valida el contenido
npm start         # http://localhost:3000
```

Requiere **Node 22.5 o superior**. `better-sqlite3` está en `optionalDependencies`:
si no compila en tu máquina no pasa nada, el juego cae automáticamente al módulo
`node:sqlite` que viene con Node. Si tenés Node más viejo, instalá better-sqlite3
con herramientas de compilación.

```bash
npm run test:run 500   # simula 500 partidas y chequea invariantes
```

### Si falla con "unable to open database file"

SQLite no escribe solo en `game.db`: según el modo de journal crea un archivo auxiliar
al lado (`game.db-wal` + `game.db-shm`, o `game.db-journal`). Cuando ese archivo no se
puede crear, el error aparece recién al escribir, con ese mensaje poco claro.

Las tres causas habituales:

| Causa | Qué falla |
|---|---|
| Ruta larga en Windows | El límite son 260 caracteres y lo que lo pasa es el auxiliar: `game.db` puede entrar y `game.db-journal` (+8) no |
| Carpeta de red o sincronizada | WAL no puede mapear memoria compartida |
| Rutas virtualizadas de la Microsoft Store | Bloquean los auxiliares |

`db/conn.js` prueba los modos en orden — **WAL → DELETE → MEMORY → OFF** — y valida cada
uno con una escritura real, así que en la mayoría de los casos se arregla solo cayendo a
journal en memoria (sin archivo auxiliar). Al arrancar, el servidor imprime cuál quedó:

```
SQLite: node:sqlite (journal memory)  ->  C:\...\db\game.db
```

Para forzar un modo: `JOURNAL=MEMORY npm start`.

Si aun así falla, mové la base a una ruta corta con `DB_PATH`:

```powershell
# PowerShell — usar la misma variable para seed y start
$env:DB_PATH = "C:\juego\game.db"
npm run seed
npm start
```

```bash
# macOS / Linux
DB_PATH=~/game.db npm run seed && DB_PATH=~/game.db npm start
```

> Con journal en memoria se pierde la protección ante un corte abrupto. Para este juego
> no importa: el contenido se regenera con `npm run seed` y el progreso de la partida
> nunca vive en la base.

## Estructura

```
db/
  schema.sql     esquema SQLite completo (24 tablas + 2 vistas de validación)
  contenido.js   TODO el contenido del juego en un solo archivo editable
  seed.js        vuelca contenido.js a game.db y valida
  conn.js        capa fina: better-sqlite3 o node:sqlite, lo que haya
engine.js        motor: bolsa de eventos, condiciones, historias, avisos, finales
server.js        API REST + archivado de partidas terminadas
public/
  index.html     estructura
  styles.css     estilos
  app.js         lógica del front y las tres mecánicas de minijuego
  ilustraciones.js  biblioteca de dibujos vectoriales de las cartas
test/simular.js  simulador de partidas con chequeo de invariantes
```

## Ilustraciones

Son 16 dibujos SVG de línea, monocromos, al estilo REIGNS. **Se repiten a propósito**:
cada evento apunta a uno por su código y varios eventos comparten dibujo. En una partida
de 16 rondas aparecen unos 11 distintos, que alcanza para que no se sienta repetitivo.

```
profesor  estudiante  multitud  plaza     bondi   libro   plata   camara
facultad  afiche      comida    noche     sobre   alerta  puerta  birrete
```

Viven en `public/ilustraciones.js`, sin dependencias ni archivos de imagen. Heredan el
color del texto (`currentColor`), así que funcionan sobre fondo claro u oscuro; en los
avisos se pintan del azul del aviso. Los estilos van como atributos y no como clases CSS,
para que el SVG se vea igual si lo abrís suelto o lo exportás.

Para asignar o cambiar el dibujo de un evento, alcanza con `ilustracion: 'libro'` en
`db/contenido.js` y volver a correr `npm run seed`. Si el código no existe, se usa
`facultad` como fallback. Para agregar un dibujo nuevo, sumalo al objeto `ILUSTRACIONES`
con un `viewBox="0 0 200 200"` y trazo de 3.4.

## Cómo funciona una partida

16 rondas. En cada una el motor arma la **bolsa** y elige con este orden de precedencia:

1. **Aviso vencido** — si un efecto pasado programó un aviso y ya se cumplió la demora, se muestra sí o sí.
2. **Evento de abandono** — el único evento que corta la carrera. Aparece solo si `guita ≤ 8` o `conocimiento ≤ 12`, de la ronda 6 en adelante.
3. **Historia estricta en curso** — el siguiente eslabón se fuerza, sin sorteo.
4. **Sorteo ponderado** — todos los eventos que pasan sus condiciones compiten por su peso intrínseco. Las historias diferidas que ya superaron su `gap_max` entran con peso x4.

Los **minijuegos no consumen ronda**: se intercalan después de la ronda indicada en
`fase.minijuego_despues_de` (3, 9 y 14). Se sortean 3 de los 7 al empezar, uno por fase.

Los **avisos sí consumen ronda** y tienen exactamente una respuesta.

Al terminar se evalúan los finales por prioridad descendente; gana el primero cuyas
condiciones de stats se cumplen, y si no hay ninguno, el final por defecto.

## Contenido cargado

Transcripción del documento **"SimuladorSociales. Juego de Rol. De aspirante a exitoso."**

| | |
|---|---|
| Stats | guita, conocimiento, fama, política — más `violencia`, **oculto**, que alimenta el secret ending |
| Fases | ingresante (1-5), intermedio (6-11), avanzado (12-16) |
| Eventos | 42 → 38 del documento + 4 avisos |
| Categorías | generales 12, guita 9, fama 6, política 6, conocimiento 5 |
| Respuestas | 102 (entre 1 y 4 por evento) |
| Efectos | 125, con pesos probabilísticos y algunos condicionales |
| Salida de carrera | 1 sola: la tercera respuesta de "No alcanza para nada" (beca Sarmiento) |
| Minijuegos | 7, sobre 3 mecánicas genéricas |
| Finales | 10: 4 de un stat dominante, 3 combinados, el secreto, el de abandono y el default |
| Historias | 0 — el documento todavía no encadena eventos; la maquinaria queda lista |

Distribución medida sobre 600 partidas con elecciones al azar:

```
fin_default      22.5%   fin_guita         9.0%
fin_secreto      14.5%   fin_conocimiento  8.5%
fin_fama         12.2%   fin_tecnocrata    4.7%
fin_abandono     12.2%   fin_menem         4.5%
fin_influencer    9.5%   fin_politica      2.5%
```

Ojo con dos números: jugando al azar el abandono sale 12% (es una de tres respuestas
en su evento) y el secret ending 14,5%. Con decisiones deliberadas ambos bajan bastante,
pero son los primeros umbrales a tocar si querés que sean más raros.

## Editar contenido

Todo está en `db/contenido.js`. Después de tocarlo: `npm run seed`.

```js
{
  codigo: 'ev_ejemplo',
  categoria: 'guita',            // generales | guita | conocimiento | fama | politica
  fase: 'intermedio',            // opcional
  peso: 120,                     // probabilidad intrínseca en la bolsa
  personaje: 'Titular de cátedra',
  titulo: T('Un título'),                    // T = mismo texto para los 3 géneros
  texto: G('Estás cansado.',                 // G = tres textos completos
           'Estás cansada.',
           'Estás cansade.'),
  cond: [{ tipo: 'stat', stat: 'guita', operador: '<', valor: 30 }],
  respuestas: [
    { texto: T('Aceptar'), efectos: [
      { peso: 70, texto: T('Salió bien.'), stats: { guita: 20, conocimiento: -6 },
        flags: { trabaja: 'true' },
        aviso: { evento: 'av_laburo', demora_min: 3, demora_max: 6 } },
      { peso: 30, texto: T('Salió mal.'), stats: { guita: [-20, -5] } },   // rango random
    ]},
  ],
}
```

Tipos de condición disponibles: `stat`, `fase`, `ronda`, `efecto_aplicado`,
`respuesta_elegida`, `evento_visto`, `historia_estado`, `flag`. Se agrupan con
`cond` (todas AND) o con `cond_grupos: [{ op:'OR', cs:[...] }]`.

**Efectos condicionales.** Un efecto también acepta `cond`, y solo compite en el sorteo
si el estado la cumple. Es lo que resuelve el "si el jugador tiene guita pega onda,
si no se le va la chance" del documento:

```js
{ peso: 30, cond: [{ tipo: 'stat', stat: 'guita', operador: '>=', valor: 45 }],
  texto: T('Pegás onda.'),           stats: { guita: 12, fama: 6 } },
{ peso: 30, cond: [{ tipo: 'stat', stat: 'guita', operador: '<',  valor: 45 }],
  texto: T('Se te va la chance.'),   stats: { fama: -5 } },
{ peso: 70, texto: T('Se cortó el hechizo.'), stats: { politica: -8 } },
```

**Dejar la carrera.** Un efecto puntual puede cortar la partida sin que todo el evento
termine el juego, así "Dejás la carrera" es una respuesta más:

```js
{ peso: 100, termina_partida: true, es_abandono: true,
  texto: T('Firmaste la baja en cinco minutos.'), stats: { guita: 15 } }
```

El seed valida que exista **exactamente uno** en todo el juego.

## API

| Método | Ruta | Qué hace |
|---|---|---|
| GET | `/api/meta` | stats, fases y géneros para la pantalla de inicio |
| POST | `/api/partida` | `{nombre, genero, extra}` → crea partida y devuelve la primera pantalla |
| GET | `/api/partida/:id` | pantalla actual (evento, minijuego o final) |
| POST | `/api/partida/:id/responder` | `{respuestaId}` → resultado con deltas |
| POST | `/api/partida/:id/minijuego` | `{puntaje}` 0-100 → resultado con deltas |
| GET | `/api/partida/:id/final` | pantalla final |
| GET | `/api/partida/:id/debug` | estado interno: historias, avisos pendientes, flags, log |

## Persistencia

El **progreso no se guarda**: vive en memoria del servidor, indexado por id de partida,
y el front no lo escribe en ningún lado. Si se cierra la pestaña, se pierde.
Las partidas **terminadas** sí se archivan en las tablas `partida`, `partida_stat` y
`partida_log` para poder mirar estadísticas. Se apaga con `ARCHIVAR=0 npm start`.

## Pendiente

Del documento de diseño, lo que todavía no está:

- **Preguntas iniciales**: el documento pide elegir carrera y pareja sí/no, además del
  nombre y el género. Hoy la pantalla de inicio pide nombre, género y un motivo.
- **Minijuegos reales**: el documento lista tres en línea, memo test, traducir palabras,
  sopa de letras, crucigrama, apellidos de autores y conector de puntos. Están los 7
  cargados, pero corriendo sobre tres mecánicas genéricas.
- **Finales combinados**: en el documento están los títulos pero no el texto
  ("Guita y Conocimiento:", "Fama y Conocimiento:", etc.). Redacté tres de los que sí
  tenían nombre — tecnócrata, Menem, influencer — y faltan los demás.
- **"Perdés un cuatrimestre"**: aparece en dos efectos y hoy se traduce a una baja
  grande de conocimiento. Saltear una ronda de verdad requiere tocar el motor.
- **Nivel por evento**: solo tres eventos vienen catalogados por instancia de la carrera
  en el documento; el resto quedó sin fase asignada y puede salir en cualquier momento.
- **Historias**: no hay cadenas todavía. La maquinaria (estricta / diferida / libre,
  con subhistorias) está lista y sin usar.
- Coeficiente de suerte para la v2 (stat oculto que sesgue el sorteo de efectos).
- Imágenes por evento (`evento.imagen_url` ya está en el esquema, sin usar).
