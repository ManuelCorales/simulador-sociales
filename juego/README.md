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
http://localhost:3000/?ronda=14                arranca en esa ronda
http://localhost:3000/?genero=f                m | f | nb
http://localhost:3000/?stats=guita:88,fama:9   fija los stats
```

Se combinan: `?ronda=14&stats=guita:88&evento=fam_acosador&genero=f`.

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
de 16 rondas aparecen unos 11 distintos, que alcanza para que no se sienta repetitivo.

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
| `memotest` | Memo test de autores | 4 pares de retratos pixelados, se dan vuelta de a dos | 100 menos 12 por cada intento de más |
| `traducir` | Traducir el paper | 5 términos en inglés, 3 opciones cada uno | aciertos / 5 |
| `sopa` | Sopa de letras de la cátedra | Grilla 8x8, clic en la primera y la última letra | halladas / 3, **45s** |
| `crucigrama` | Parcial contrarreloj | 3 palabras que se cruzan, una letra por casillero | letras correctas, **60s** |
| `apellidos` | Escribir bien los apellidos | Se muestra «Bordié», hay que escribir Bourdieu | aciertos / 4 |
| `conectar` | El mapa conceptual | Unir 9 puntos en orden | 100 menos 14 por error |
| `molinete` | Saltar el molinete | Corredor tipo dino: clic o barra para saltar | molinetes pasados / 10 |

**Sopa y crucigrama llevan reloj** porque son los únicos que se pueden no resolver: sin
límite de tiempo, alguien que no encuentra las palabras queda trabado en la pantalla para
siempre. Al vencer se entrega lo que haya, que es justo lo que dice el mensaje de fallo
del parcial.

### Pixel art

`ilustraciones.js` tiene además una sección de **pixel art**: cada sprite es una grilla de
caracteres, una letra por píxel, según `PALETA_PIXEL`. El punto es transparente.

- `RETRATOS` — Belgrano, Sarmiento, Che y Eva Perón en 16x16, para las fichas del memo
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

### Los finales de forma

Salvo tres excepciones, los finales no miran valores absolutos sino **el reparto**: cada
stat vale su porcentaje del total de los cuatro, así que "guita 40%" significa lo mismo en
una partida floja que en una exitosa. Un stat está **alto** si pasa el 31% y **bajo** si no
llega al 19%.

Con cuatro stats eso da exactamente **15 formas** —4 dominantes, 6 duplas, 4 tríos y
1 repartido— que cubren todos los casos sin superponerse. Lo garantiza la aritmética:

- No puede haber 4 altos: 31 × 4 = 124 > 100.
- Con 3 altos al cuarto le queda 7% como mucho, o sea que cae bajo y la partida se lee
  como trío ("todo menos X").
- Con 0 altos no puede haber 2 bajos: 19 + 19 deja 62 para repartir entre dos stats que no
  llegan a 31 (30,9 + 30,9 = 61,8 < 62). Así que hay 1 bajo (trío) o ninguno (repartido).

Por eso alcanza con ordenar **duplas > dominantes > tríos > repartido**: cada partida cae
en uno y solo uno, y las condiciones de cada final quedan en cuatro comparaciones.

El motor calcula `pct_guita`, `pct_conocimiento`, `pct_fama`, `pct_politica` y `promedio`
justo antes de elegir, y los guarda como **stats ocultos**. Así las condiciones se escriben
con la misma maquinaria que cualquier otra y no hizo falta tocar el esquema. Como son
ocultos, quedan fuera del HUD, de los deltas y del resumen final.

Las tres excepciones ganan por prioridad alta sin importar la forma: `fin_secreto`
(violencia ≥ 30), `fin_abandono` y `fin_fantasma`, que es un **piso de magnitud** —
promedio ≤ 24— para la partida donde no pasó nada.

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
| Minijuegos | 8, uno por mecánica — se sortean 3 por partida |
| Finales | 18: las 15 formas del reparto (4 dominantes, 6 duplas, 4 tríos, 1 repartido) más el secreto, el de abandono y el piso de magnitud |
| Historias | 0 — el documento todavía no encadena eventos; la maquinaria queda lista |

Distribución medida sobre 8000 partidas con elecciones al azar:

```
fin_secreto      14.4%   fin_consultora     4.2%
fin_abandono     12.9%   fin_influencer     3.7%
fin_conocimiento 12.6%   fin_panelista      2.9%
fin_guita        11.3%   fin_default        2.8%
fin_fama          9.3%   fin_lobista        2.8%
fin_politica      8.6%   fin_fantasma       1.9%
fin_menem         5.5%   fin_sin_guita      0.9%
fin_tecnocrata    4.3%   fin_sin_politica   0.7%
                         fin_sin_fama       0.6%
                         fin_sin_conocimiento 0.6%
```

Los cuatro tríos salen menos del 1% cada uno **a propósito**: piden que ningún stat se
despegue y que uno solo se quede atrás, que es una partida rara. Son los finales de
colección. Si querés que aparezcan más seguido, subí `BAJO` en `db/contenido.js` (de 19
a 21-22); el que baja a cambio es `fin_default`.

Ojo con dos números: jugando al azar el abandono sale 12,9% (es una de tres respuestas en
su evento) y el secret ending 14,4%. Con decisiones deliberadas ambos bajan bastante, pero
son los primeros umbrales a tocar si querés que sean más raros.

### Balance de los cuatro stats

Los finales de forma solo funcionan si los cuatro stats pesan parecido al terminar. Medido
sobre 3000 partidas al azar, política llegaba a 34 contra 54 de fama: aparecía en menos
respuestas (59 contra 74) y con neto más chico (+116 contra +200). Eso hacía que los cuatro
finales con política sumaran apenas el 9,7%.

El ajuste fue sobre los efectos, no sobre los umbrales: los positivos de política ×1,2, los
negativos ×0,9 y los positivos de fama ×0,88. Los valores iniciales quedaron intactos.
Resultado: guita 46,7 · conocimiento 45,6 · fama 47,7 · política 44,8, y los finales con
política pasaron de 9,7% a 20,4%.

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
