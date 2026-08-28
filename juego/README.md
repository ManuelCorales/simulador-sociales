# FSOQUER — juego tipo REIGNS

Sitio estático: **el motor corre en el navegador** y no hay backend. SQLite se usa
solo para editar el contenido; el juego consume un JSON generado desde ahí.

## Correrlo

```bash
npm run build     # siembra la base y genera public/contenido.json
npm start         # http://localhost:3000
```

Requiere **Node 22.5 o superior**. No tiene dependencias de runtime: `npm install`
ni hace falta para jugar. `better-sqlite3` figura como opcional y lo usan solo el
seed y el build; si no compila, cae al módulo `node:sqlite` que viene con Node.

`npm start` es un servidor de archivos estáticos de 60 líneas, solo para desarrollo:
abrir `index.html` con doble clic no sirve porque `file://` bloquea el fetch del JSON.

```bash
npm run test:run 500   # simula 500 partidas y chequea invariantes
```

## Publicarlo

`public/` es el sitio completo. Sirve cualquier hosting estático, gratis y sin
cold start.

**Vercel** — conectás el repo. Dos cosas que hay que acertar:

- **Root Directory: `juego`**. El repo tiene el juego en un subdirectorio; con la raíz
  del repo, Vercel no encuentra ni `vercel.json` ni `public/`.
- Framework "Other". El `vercel.json` ya deja apuntado `outputDirectory: public` y anula
  install y build.

Si el deploy termina en **500 `FUNCTION_INVOCATION_FAILED`**, es que Vercel armó una
serverless function en vez de servir archivos. Pasa porque `package.json` declara
`"main": "server.js"` y `"start": "node server.js"`: con eso deduce que es un servidor
Node y empaqueta `server.js`, que crashea al llamar a `listen()` — una function no expone
puertos, tiene que exportar un handler. Lo resuelve el `.vercelignore`, que deja afuera
`package.json`, `server.js` y todo lo de desarrollo. Sin nada que autodetectar, Vercel
sirve `public/` y ya.

Al deploy suben nueve archivos: los siete de `public/`, `vercel.json` y `.gitignore`.

**Netlify** — publish directory `public`, sin build command.

**GitHub Pages** — Settings → Pages → carpeta `/public` de la rama principal.

`public/contenido.json` **se commitea a propósito**: es el contenido publicado.
Cada vez que edites `db/contenido.js`, corré `npm run build` y commiteá el JSON
junto con el cambio. La base (`db/game.db`) sí está en `.gitignore`, porque se
regenera.

### Por qué no un backend

El juego guardaba las partidas en memoria del servidor. En hosting serverless
(Vercel, Netlify Functions) cada request puede caer en otra instancia y las
instancias se apagan: el jugador respondería la ronda 3 y le saltaría "partida no
encontrada". En un host con proceso persistente funciona, pero en los planes
gratis el servicio se duerme y el primer visitante espera cerca de un minuto.

Como el motor es JavaScript puro y el contenido son 42 eventos que entran en un
JSON de 50 KB comprimido, el servidor era peso muerto.

**Lo que se perdió:** el archivado de partidas terminadas en SQLite (ya era
opcional). Las tablas `partida`, `partida_stat` y `partida_log` siguen en el
esquema sin uso. Y el contenido queda a la vista: cualquiera puede abrir
`contenido.json` y leerse los finales sin jugar.

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

## Modo desarrollo

Para no tener que jugar la partida entera cada vez que querés ver una carta o un
minijuego. Se activa con parámetros en la URL:

```
http://localhost:3000/?dev                     abre el panel
http://localhost:3000/?evento=gen_plaza_seca   salta a esa carta
http://localhost:3000/?minijuego=molinete      salta a ese minijuego (código o mecánica)
http://localhost:3000/?final=fin_secreto       salta a ese final
http://localhost:3000/?ronda=5                 arranca en esa ronda (1 a 6)
http://localhost:3000/?genero=f                m | f | nb
http://localhost:3000/?stats=guita:88,fama:9   fija los stats
```

Se combinan: `?ronda=5&stats=guita:88&evento=fam_acosador&genero=f`.

Con `?dev` aparece un **panel abajo a la derecha** con la lista completa de eventos
(agrupados por categoría), minijuegos y finales, más los cuatro stats editables y un salto
de ronda. Cada salto actualiza la URL, así que la barra de direcciones queda copiable para
volver a esa pantalla exacta. Una franja arriba avisa que estás en modo dev, para no
confundirlo con una partida real.

Un evento forzado **se puede responder normalmente** y la partida sigue desde ahí, así se
prueban también los efectos. Y se puede repetir el mismo evento cuantas veces quieras: el
salto lo saca de "ya vistos".

Sin parámetros en la URL, `public/dev.js` no hace absolutamente nada: es un `return`
temprano. Como todo corre en el navegador, los saltos son llamadas directas al motor
(`MOTOR.devEvento(partida, codigo)` y compañía).

Ojo con esto al publicar: **el modo dev viaja al sitio en vivo**. Cualquiera que sepa
poner `?dev` en la URL puede saltar a cualquier carta o final. Para este juego no es
grave, pero si te molesta, no incluyas `dev.js` en el `<script>` de `index.html`
antes de publicar.

## Estructura

```
db/
  contenido.js   TODO el contenido del juego en un solo archivo editable
  schema.sql     esquema SQLite (24 tablas + 2 vistas de validación)
  seed.js        vuelca contenido.js a game.db y valida
  cargar.js      lee game.db a un objeto plano
  conn.js        capa fina: better-sqlite3 o node:sqlite, lo que haya
build.js         vuelca la base a public/contenido.json
server.js        servidor estático de desarrollo, sin dependencias
engine.js        el motor para Node (3 líneas: motor + contenido de SQLite)

public/          <-- ESTO es el sitio que se publica
  index.html
  styles.css
  motor.js       motor del juego: bolsa de eventos, condiciones, avisos, finales
  app.js         interfaz y las ocho mecánicas de minijuego
  ilustraciones.js  dibujos de las cartas, íconos de stats y pixel art
  dev.js         panel y deep links de testeo (inerte sin ?dev en la URL)
  contenido.json generado por npm run build

test/simular.js  simulador de partidas con chequeo de invariantes

FINALES.md       los 24 finales y la condición exacta de cada uno
EVENTOS.md       porcentaje de aparición de cada evento y de cada aviso
BANCOS.md        las palabras de cada minijuego
```

**`public/motor.js` es el mismo archivo en los dos mundos.** Expone
`crearMotor(contenido)` y no tiene dependencias: el navegador lo carga con un
`<script>` y le pasa el JSON; Node lo hace `require()` y le pasa lo que sale de
SQLite. Así los tests corren contra exactamente el mismo código que juega la gente.

## Estética

Arcade noventoso con la paleta de The Simpsons: bloques planos, contornos negros de 4px,
sombras duras sin blur y esquinas rectas. El fondo lleva una cuadrícula de 18px que da la
textura pixelada.

### El fondo cambia con la instancia de la carrera

Cada fase tiene su color, y la progresión va de claro a oscuro: entrás con luz y terminás
de noche.

| Fase | Color | |
|---|---|---|
| Ingresante | `#2C6157` | verde profundo de aula |
| Intermedio | `#24486E` | azul noche |
| Avanzado | `#4A2A46` | berenjena |

El cambio no es un fundido: es una **cortina de bloques en diagonal**. Los cuadrados entran
de a uno con retraso creciente hasta tapar la pantalla, ahí abajo se cambia el fondo y
aparece el nombre de la instancia, y después la cortina se retira con el mismo barrido.
Todas las animaciones usan `steps()` para que se muevan a saltos, no suave.

Se ajusta desde `cambiarFase()` en `public/app.js` (`COLS`, `PASO`, `DUR`) y respeta
`prefers-reduced-motion`.

### Paleta

| Rol | Color |
|---|---|
| Amarillo | `#FFD520` — respuestas, franja de eventos generales |
| Naranja | `#F05A28` — botones primarios, títulos de final |
| Azul / celeste | `#0D7DC1` · `#6DCFF6` · `#2FA8D5` |
| Verde | `#7AC143` · `#CDE6A5` |
| Beige | `#D3B183` — avisos |
| Negro | `#12100E` — contornos y HUD |

Cada carta lleva arriba una **franja de color según la categoría del evento**, y la
ilustración se recorta en blanco sobre esa franja:

```
generales  amarillo    fama       naranja       aviso      beige
guita      verde claro politica   azul suave    minijuego  azul medio
conocimiento celeste
```

### HUD

Las barras de stats son segmentadas, como una vida de arcade, y **no llevan número**: la
barra es la única lectura y el valor exacto queda en el tooltip. Cuando un stat cambia, su
ícono salta hacia arriba si subió y se hunde si bajó.

Los íconos son **dibujo propio**, no emojis: moneda, libro abierto, estrella y puño.
Viven en `ICONOS` dentro de `public/ilustraciones.js` y se referencian desde
`db/contenido.js` con `icono: 'moneda'`. A 22px un emoji se renderiza a color y rompe el
registro del resto de la interfaz.

Tipografías: **Press Start 2P** para HUD, etiquetas y botones, y **Archivo Black** para
los títulos. Se cargan de Google Fonts; sin internet caen a `Courier New` y `Arial Black`,
que mantienen el aire pero pierden el pixelado.

## Ilustraciones

Son 16 dibujos SVG de línea, monocromos, al estilo REIGNS. **Se repiten a propósito**:
cada evento apunta a uno por su código y varios eventos comparten dibujo. En una partida
de 6 rondas aparecen unos 5 distintos, que alcanza para que no se sienta repetitivo.

```
profesor  estudiante  multitud  plaza     bondi   libro   plata   camara
facultad  afiche      comida    noche     sobre   alerta  puerta  birrete
```

Viven en `public/ilustraciones.js`, sin dependencias ni archivos de imagen. El contorno
hereda el color del texto (`currentColor`, negro en las cartas) y las masas se rellenan
con `--ilu-masa` (blanco por defecto), así que la figura se recorta sobre la franja de
color. Los estilos van como atributos y no como clases CSS, para que el SVG se vea igual
si lo abrís suelto o lo exportás.

Para asignar o cambiar el dibujo de un evento, alcanza con `ilustracion: 'libro'` en
`db/contenido.js` y volver a correr `npm run seed`. Si el código no existe, se usa
`facultad` como fallback. Para agregar un dibujo nuevo, sumalo al objeto `ILUSTRACIONES`
con un `viewBox="0 0 200 200"` y trazo de 3.4.

## Minijuegos

Los ocho del documento, uno por mecánica. Se sortean **3 por partida**, uno por fase,
entre los ocho — ninguno se repite dentro de la misma partida.

| Mecánica | Minijuego | Cómo se juega | Puntaje |
|---|---|---|---|
| `tres_en_linea` | Tres en línea contra la otra lista | Sos las X contra una IA que juega bien el 65% de las veces | ganar 100 · empate 55 · perder 15 |
| `memotest` | Memo test de autores | 6 pares de retratos pixelados, se dan vuelta de a dos, **5 fallos permitidos** | completándolo, 100 menos 10 por fallo; si se acaban los intentos, pares hechos / 6 x 45 |
| `traducir` | Traducir el paper | 5 términos en inglés, 3 opciones cada uno | aciertos / 5 |
| `sopa` | Sopa de letras de la cátedra | Grilla 10x10, clic en la primera y la última letra. Horizontal, vertical y **las dos diagonales** | halladas / 3, **60s** |
| `crucigrama` | Parcial contrarreloj | 3 palabras que se cruzan, una letra por casillero | letras correctas, **60s** |
| `apellidos` | Escribir bien los apellidos | Se muestra «Bordié», hay que escribir Bourdieu | aciertos / 4 |
| `conectar` | El mapa conceptual | Unir los 9 puntos en orden, **15s** | 100 menos 14 por error; si se acaba el tiempo, 0 |
| `molinete` | Saltar el molinete | Corredor tipo dino: clic o barra para saltar | molinetes pasados / 10 |
| `simon` | Duelo de baile | Simon Dice: se muestran los seis pasos de una y hay que repetirlos todos seguidos | los seis = 100; si te trabás, pasos acertados / 6 |

En el memo test el tope de 5 se cuenta en **fallos**, no en jugadas: con 6 pares hacen
falta 6 jugadas para ganar aunque tengas memoria perfecta, así que un tope de 5 jugadas
dejaría el minijuego imposible. Completar el tablero siempre alcanza para un parcial, ni
gastando los cinco intentos.

En la sopa las palabras van en cuatro direcciones (→ ↓ ↘ ↗), todas de izquierda a derecha
o hacia abajo: se leen siempre en su sentido normal y la dificultad está en encontrarlas,
no en leerlas al revés. Medido sobre 3000 grillas, el 42% de las palabras cae en diagonal
y ninguna grilla queda con palabras listadas que no estén puestas.

**Tres minijuegos llevan reloj**, y no todos lo usan igual:

- **Sopa (60s) y crucigrama (45s)**: son los que se pueden no resolver, y sin límite alguien
  que no encuentra las palabras queda trabado en la pantalla para siempre. Al vencer se
  entrega lo que haya, que es justo lo que dice el mensaje de fallo del parcial.
- **Mapa conceptual (15s)**: acá el reloj no es una red de contención sino la dificultad
  misma. Unir los nueve puntos es fácil; hacerlo en quince segundos, no. Si se acaba el
  tiempo **el puntaje es 0**, sin importar cuántos puntos hayas llegado a unir: no
  completarlo es perder.

### Pixel art

`ilustraciones.js` tiene además una sección de **pixel art**: cada sprite es una grilla de
caracteres, una letra por píxel, según `PALETA_PIXEL`. El punto es transparente.

- `RETRATOS` — Belgrano, Sarmiento, Che, Eva Perón, Juana Azurduy y Rubinich en 16x16,
  para las fichas del memo
  test. Se renderizan como SVG con `pixelASvg()`, que une los tramos horizontales del
  mismo color en vez de escupir un rect por píxel.
- `SPRITES` — el estudiante del molinete en 14x18, con dos fotogramas de carrera y uno de
  salto. Se dibujan en canvas con `dibujarSprite()`.

Editar un retrato es editar texto: se cambian las letras de la grilla y listo. Para sumar
uno nuevo, agregalo a `RETRATOS` y ponelo en `simbolos` del memo test en `contenido.js`.

El molinete se dibuja con primitivas: base, poste, lector de SUBE amarillo arriba y el
trípode de tres brazos, que es lo que lo hace reconocible. El brazo que apunta al jugador
es el que define la colisión.

### Bancos de contenido

Los cuatro juegos de palabras sortean de un banco grande para no repetir siempre lo mismo:

| Juego | Banco | Saca | Combinaciones |
|---|---|---|---|
| Traducir el paper | 30 términos | 5 | ~142.000 |
| Escribir bien los apellidos | 28 autores | 4 | ~20.000 |
| Sopa de letras | 30 palabras | 3 | ~4.000 |
| Crucigrama | 5 grillas armadas a mano | 1 | 5 |

El **seed valida los bancos** antes de que lleguen al juego, y frena si algo está mal:

- que las palabras del crucigrama entren en la grilla y **coincidan en los cruces**;
- que las de la sopa no sean más largas que el lado de la grilla;
- que ningún distractor de traducir sea la respuesta correcta;
- que ningún apellido deformado sea igual al correcto **una vez que se le sacan las
  tildes** — si no, se resuelve copiando el enunciado, porque la comparación las ignora.

Todo el contenido de cada juego —las palabras a traducir, los autores, las pistas del
crucigrama, la astucia del rival— vive en el `config` de `db/contenido.js`, así se edita
sin tocar el front. Las mecánicas están en el objeto `MECANICAS` de `public/app.js`: cada
una recibe `(config, listo)` y devuelve un puntaje de 0 a 100.

### Compartir el resultado

La pantalla final tiene un botón que exporta la partida como imagen. No captura el DOM
ni usa librerías: **la placa se dibuja en un canvas**, con la banda de color, la
ilustración del final, el texto y los cuatro stats. Sale a 1080px de ancho, en 2x.

- Las ilustraciones y los íconos se inyectan como SVG con los colores ya resueltos
  (`currentColor` y `--ilu-masa` no existen dentro de un `<img>`).
- Espera a `document.fonts.ready` antes de dibujar: si no, el canvas usa la tipografía
  del sistema y la placa sale con otra letra.
- En celular abre el menú nativo de compartir (`navigator.share` con archivos); en
  escritorio descarga el PNG. Cancelar el menú no se trata como error.

Está en `exportarImagen()` / `construirPlaca()` en `public/app.js`.

## Cómo funciona una partida

**9 cartas: 6 eventos y 3 minijuegos.** Los dos slots de aviso siguen configurados, pero
hoy no hay avisos cargados y el motor los saltea, así que la partida son 9 cartas hasta
que se escriban. Los stats arrancan al azar entre 40 y
60 (rango en `configuracion`, claves `stats_iniciales_min` / `stats_iniciales_max`), así
que cada partida empieza con un perfil distinto. `violencia` arranca siempre en 0, porque
el secret ending mide escalada, no punto de partida.

El rango de arranque es angosto a propósito, y es un ajuste que costó descubrir:
**comprimir los efectos sube el peso del arranque**, porque las decisiones mueven menos.
Con efectos al 60% y arranque 15-45, el stat más alto al empezar seguía siendo el más alto
al terminar en el 47% de las partidas. Achicando el arranque a 24-36 baja al 34%, que es
menos que antes de comprimir. Si tocás una de las dos cosas, hay que revisar la otra.

En cada ronda el motor arma la **bolsa** y elige con este orden de precedencia:

1. **Aviso vencido** — si un efecto pasado programó un aviso y ya se cumplió la demora, se muestra sí o sí.
2. **Evento de abandono** — el único evento que corta la carrera. No pide nada de los stats: entra en la bolsa de la ronda 4 en adelante (`ronda_min`), o sea la segunda mitad de la partida. Abandonar es la tercera respuesta, no el evento en sí.
3. **Historia estricta en curso** — el siguiente eslabón se fuerza, sin sorteo.
4. **Sorteo ponderado** — todos los eventos que pasan sus condiciones compiten por su peso intrínseco. Las historias diferidas que ya superaron su `gap_max` entran con peso x4.

Los **minijuegos no consumen ronda**: se intercalan después de la ronda indicada en
`fase.minijuego_despues_de` (1, 3 y 5). Se sortean 3 de los 8 al empezar, uno por fase.

### Duelos: una respuesta que lanza un minijuego

Una respuesta puede tener `minijuego: 'mj_simon'`. Elegirla no resuelve nada: lanza ese
minijuego y **el resultado decide cuál de los efectos se aplica**, entre los marcados
`rama: 'gana'` y los marcados `rama: 'pierde'`. El corte lo pone `umbralDuelo` en la
config del minijuego.

Hoy lo usa un solo evento: el duelo de baile contra el falso Michael Jackson, que se juega
con Simon Dice: la secuencia de seis se muestra una sola vez, entera, y hay que repetirla
completa. Un error corta el duelo. Sale en el 5% de las partidas.

`mj_simon` tiene `fases: []`, así que **no entra en el sorteo de los minijuegos por fase**:
solo lo lanza la respuesta que lo declara.

En el esquema son dos columnas: `respuesta.minijuego_id` y `efecto.rama_minijuego`. En el
motor, `responder()` devuelve una pantalla de minijuego en vez de un resultado, y
`resolverMinijuego()` elige la rama y sigue con el flujo normal de una respuesta.

Con los avisos en 2 y 4, las once cartas se alternan solas:

```
EV  MJ  EV  AV  EV  MJ  EV  AV  EV  MJ  EV
```

Nunca hay dos cartas sin decisión seguidas, y la última siempre es un evento: la decisión
final la toma el jugador, no la resuelve su puntería. **Los slots no pueden coincidir**:
si en la misma ronda cayeran un minijuego y un aviso, el minijuego gana y el aviso se
pierde sin mostrarse.

### Los dos avisos obligatorios

Toda partida muestra **hasta dos avisos**, y los que salen referencian una decisión que
tomaste de verdad. Son cartas extra —no consumen ronda, como los minijuegos— y caen en los
slots de `configuracion.avisos_en_rondas` (2 y 4), elegidos para no chocar con los
minijuegos (1, 3 y 5) y para que ya haya decisiones de las que hablar. Si en un slot no
quedara ninguno sin usar se saltea en vez de forzarlo; medido, sale 1,98 por partida.

Cómo se garantizan los dos:

1. **Cada decisión deja un aviso en la bolsa.** Los cuatro avisos *propios* están escritos
   para una respuesta puntual. Para todo el resto, `db/seed.js` asigna solo un **aviso de
   familia** según cuál fue el cambio de stat más grande del efecto: nueve familias que
   cubren subir y bajar cada stat, más una para la violencia, que gana siempre.
2. **Al llegar al slot se elige de esa bolsa.** Prefiere los propios sobre los de familia,
   y entre iguales, decisiones de **al menos dos rondas atrás**: un aviso sobre la carta que
   acabás de responder se lee como reacción, no como consecuencia.
3. **Nunca repite** ni el mismo aviso ni el mismo evento de origen dentro de una partida.

La carta lo encabeza con *"Por lo que hiciste en: La plaza seca"*. Sin esa línea el aviso
parece un evento suelto más, y ahí se pierde toda la continuidad.

Medido: 1,98 avisos por partida (las que bajan de 2 son las que se cortaron por
abandono), 0 avisos apuntando a un evento que el jugador no respondió, y los 13 avisos
aparecen alguna vez. Los avisos tienen exactamente una respuesta.

Al terminar se evalúan los finales por prioridad descendente; gana el primero cuyas
condiciones de stats se cumplen, y si no hay ninguno, el final por defecto.

### Los finales por bandas

Al terminar, cada stat cae en una banda de puntaje fija, igual para todos y definida de
antemano: **BAJA 0-36, MEDIA 37-59, ALTA 60-100**. El final sale de la combinación de
bandas — no importa el valor exacto ni cómo se comparan los stats entre sí.

| Combinación | Final | Cuántos |
|---|---|---|
| Las 4 en alta | Decano en diez años | 1 |
| 3 en alta | trío, nombrado por el que falta | 4 |
| 2 en alta | dupla | 6 |
| 1 en alta y las otras 3 en baja | dominante puro, el monomaníaco | 4 |
| 1 en alta, con alguna en media | dominante | 4 |
| Las 4 en media | El promedio perfecto | 1 |
| Las 4 en baja | El fantasma del pasillo | 1 |
| Ninguna en alta, mezcla de baja y media | Graduado (default) | 1 |

Como se evalúan por prioridad descendente y los tramos van de más altas a menos, **cada
final declara solo sus altas**: *Consultor garca* pide únicamente `guita ≥ 60`, porque si
además hubieras llegado a 60 en otro stat, la dupla o el trío ya habrían ganado antes.

Los cortes salieron de medir 8000 partidas. Con la partida de 9 eventos eran 42 y 30; al
bajar a 6 los stats se mueven menos y con esos cortes *Graduado* se disparaba al 14%, así
que pasaron a **40 y 28**. **Si tocás la duración de la partida o la escala de los efectos
hay que volver a medirlos.**

Dos finales ganan por prioridad alta sin mirar bandas: `fin_secreto` (`violencia ≥ 30`) y
`fin_abandono`.

El listado completo, con la condición de cada final y su frecuencia medida, está en
[FINALES.md](FINALES.md).

## Contenido cargado

Transcripción del documento **"SimuladorSociales. Juego de Rol. De aspirante a exitoso."**

| | |
|---|---|
| Stats | guita, conocimiento, fama, política — más `violencia`, **oculto**, que alimenta el secret ending |
| Fases | ingresante (1-2), intermedio (3-4), avanzado (5-6) — 2 eventos cada una |
| Eventos | 51 → 38 del documento, 4 avisos propios y 9 avisos de familia |
| Categorías | generales 12, guita 9, fama 6, política 6, conocimiento 5 |
| Respuestas | 111 (entre 1 y 4 por evento; los avisos tienen 1) |
| Efectos | 134, con pesos probabilísticos y algunos condicionales. 120 dejan un aviso disponible |
| Salida de carrera | 1 sola: la tercera respuesta de "No alcanza para nada" (beca Sarmiento) |
| Minijuegos | 8, uno por mecánica — se sortean 3 por partida |
| Finales | 24, por combinación de bandas: 4 altas, 4 tríos, 6 duplas, 4 dominantes puros, 4 dominantes, las 4 medias, las 4 bajas, el default, el secreto y el de abandono |
| Historias | 0 — el documento todavía no encadena eventos; la maquinaria queda lista |

Distribución medida sobre 20000 partidas con elecciones al azar. Ningún final pasa del
9,8% y todos son alcanzables. El detalle con la condición de cada uno está en
[FINALES.md](FINALES.md).

```
fin_conocimiento   9.8%   fin_influencer       4,1%
fin_default        8,5%   fin_secreto          3,4%
fin_menem          7,7%   fin_abandono         3,4%
fin_sin_guita      7,6%   fin_lobista          3,3%
fin_guita          6,6%   fin_sin_conocimiento 2,9%
fin_politica       6,6%   fin_sin_politica     2,8%
fin_panelista      6,3%   fin_sin_fama         2,4%
fin_tecnocrata     6,2%   fin_decano           2,3%
fin_fama           6,0%   fin_puro_guita       1,2%
fin_consultora     5,5%   fin_puro_conocimiento 1,1%
                          fin_promedio         0,8%
                          fin_puro_politica    0,7%
                          fin_puro_fama        0,5%
                          fin_fantasma         0,4%
```

### Balance de los cuatro stats

Los finales por bandas solo funcionan si los cuatro stats llegan parejos al corte, y el
balance hubo que rehacerlo cada vez que cambió el juego debajo.

| Cuándo | Qué se desbalanceó | Ajuste |
|---|---|---|
| 16 rondas, arranque fijo | política 34 contra 54 de fama: aparecía en menos respuestas (59 contra 74) y con neto más chico | política +x1,2 / −x0,9 · fama +x0,88 |
| 9 rondas, arranque al azar | guita perdió la ventaja de empezar en 40 y quedó en 34 contra 45 | guita +x1,35 / −x0,85 · conocimiento +x1,1 |
| Compresión de la partida | todos los efectos, para que los puntajes no salten tanto | todo x0,6, salvo `violencia` |

`violencia` queda fuera de la compresión a propósito: su umbral de 30 define el secret
ending y escalarla lo movería sin querer.

**Si volvés a tocar la duración, el rango del sorteo o la escala de los efectos, hay que
rehacer esto y volver a medir los cortes de banda.** El procedimiento: escalar los efectos
de un stat por un factor, sembrar, simular unas miles de partidas y mirar la brecha entre
el mayor y el menor promedio.

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
- **"Perdés un cuatrimestre"**: aparece en dos efectos y hoy se traduce a una baja
  grande de conocimiento. Saltear una ronda de verdad requiere tocar el motor.
- **Nivel por evento**: solo tres eventos vienen catalogados por instancia de la carrera
  en el documento; el resto quedó sin fase asignada y puede salir en cualquier momento.
- **Historias**: no hay cadenas todavía. La maquinaria (estricta / diferida / libre,
  con subhistorias) está lista y sin usar.
- Coeficiente de suerte para la v2 (stat oculto que sesgue el sorteo de efectos).
- Imágenes por evento (`evento.imagen_url` ya está en el esquema, sin usar).
