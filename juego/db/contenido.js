// =====================================================================
//  Contenido del juego — "SimuladorSociales. De aspirante a exitoso."
//  Transcripción del documento de diseño.
//
//  T('x')        -> mismo texto para los 3 géneros
//  G(m, f, nb)   -> tres textos completos
//  stats: { fama: 2 }         -> sumar 5
//         { guita: [-20,-5] } -> sumar un random en ese rango
//
//  Convención de intensidad tomada del documento:
//    +  = 8   |  ++ = 15   |  - = -8   |  -- = -15
// =====================================================================

const T = (s) => ({ m: s, f: s, nb: s });
const G = (m, f, nb) => ({ m, f, nb });

// ---------------------------------------------------------------------
// STATS — los cuatro del documento, en su orden, más uno oculto.
// ---------------------------------------------------------------------
// Colores de la paleta del póster. `icono` es el código de un dibujo propio
// de public/ilustraciones.js — no un emoji.
const stats = [
  { codigo: 'guita',        nombre: 'Guita',        icono: 'moneda',   color: '#7AC143', valor_inicial: 40, orden: 1, descripcion: 'Lo que te queda en el bolsillo.' },
  { codigo: 'conocimiento', nombre: 'Conocimiento', icono: 'libro',    color: '#2FA8D5', valor_inicial: 35, orden: 2, descripcion: 'Lo que realmente aprendiste.' },
  { codigo: 'fama',         nombre: 'Fama',         icono: 'estrella', color: '#FFD520', valor_inicial: 20, orden: 3, descripcion: 'Cuánta gente sabe quién sos en Sociales.' },
  { codigo: 'politica',     nombre: 'Política',     icono: 'puno',     color: '#F05A28', valor_inicial: 20, orden: 4, descripcion: 'Tu peso dentro de la rosca estudiantil.' },
  // Oculto: alimenta el secret ending. No se muestra en el HUD.
  { codigo: 'violencia',    nombre: 'Violencia',    icono: 'chispa',   color: '#D9401C', valor_inicial: 0,  orden: 5, visible: false, descripcion: 'Escalada de violencia política. Invisible para el jugador.' },

];

// ---------------------------------------------------------------------
// FASES — 16 elecciones / puntos de control, una por cuatrimestre.
// ---------------------------------------------------------------------
// 6 eventos en 3 fases de 2, con un minijuego por fase y hasta 2 avisos.
// Total: 11 cartas, que se alternan solas:
//
//     EV  MJ  EV  AV  EV  MJ  EV  AV  EV  MJ  EV
//
// Los minijuegos caen en 1, 3 y 5 y los avisos en 2 y 4: nunca hay dos cartas
// sin decisión seguidas, y la última siempre es un evento, así que la decisión
// final la toma el jugador y no la resuelve su puntería en un minijuego.
// Los slots no pueden coincidir: si en la misma ronda cayeran un minijuego y un
// aviso, el minijuego gana y el aviso se pierde sin mostrarse.
const fases = [
  { codigo: 'ingresante', nombre: 'Ingresante', ronda_desde: 1, ronda_hasta: 2, minijuego_despues_de: 1, orden: 1 },
  { codigo: 'intermedio', nombre: 'Intermedio', ronda_desde: 3, ronda_hasta: 4, minijuego_despues_de: 3, orden: 2 },
  { codigo: 'avanzado',   nombre: 'Avanzado',   ronda_desde: 5, ronda_hasta: 6, minijuego_despues_de: 5, orden: 3 },
];

// ---------------------------------------------------------------------
// HISTORIAS — el documento no encadena eventos todavía.
// La maquinaria queda disponible: basta agregar `historia` y
// `historia_orden` a los eventos que formen una cadena.
// ---------------------------------------------------------------------
const historias = [];

// =====================================================================
//  EVENTOS
// =====================================================================
// ---------------------------------------------------------------------------
// EVENTOS
//
// Vaciado a proposito: los 38 eventos y los 4 avisos que estaban aca eran la
// transcripcion vieja del documento de diseno. Se reemplazan por los 67 eventos
// de eventos-pdf.xlsx, que se cargan con:
//
//     node db/importar-excel.js
//
// El archivo lo genera db/importar-excel.js a partir del Excel. Para cambiar
// un texto o un puntaje, se cambia en el Excel y se vuelve a correr el
// importador: editar eventos-importados.js a mano se pierde en la proxima
// corrida.
// ---------------------------------------------------------------------------
const { eventosImportados } = require('./eventos-importados.js');
const eventos = eventosImportados;

// ---------------------------------------------------------------------
// MINIJUEGOS — 7 definidos, 3 por partida (uno por fase).
// El documento propone: tres en línea, memo test, traducir palabras,
// sopa de letras, crucigrama, apellidos de autores, conector de puntos.
// Acá están implementados sobre tres mecánicas genéricas; reemplazar
// cada uno por su mecánica real es trabajo aparte.
// ---------------------------------------------------------------------
// ---------------------------------------------------------------------
// MINIJUEGOS — los ocho del documento, uno por mecánica.
// Se sortean 3 por partida, uno por fase, entre todos. No consumen ronda.
// El contenido de cada juego (palabras, autores, pistas) vive en `config`,
// así se edita desde acá sin tocar el front.
// ---------------------------------------------------------------------
const minijuegos = [

  {
    codigo: 'mj_tresenlinea', ilustracion: 'multitud', mecanica: 'tres_en_linea',
    nombre: 'Tres en línea contra la otra lista',
    descripcion: 'Duelo de pizarrón en el medio de la asamblea.',
    instrucciones: T('Sos las X. Hacé tres en línea antes que la otra lista.'),
    fases: ['ingresante', 'intermedio', 'avanzado'],
    config: { astucia: 0.65 },
    resultados: [
      { codigo: 'exito',   min: 70, max: 100, texto: T('Aplauso cerrado.'),                  stats: { politica: 8, fama: 5 } },
      { codigo: 'parcial', min: 35, max: 69,  texto: T('Aplauso tibio.'),                    stats: { politica: 3, fama: 2 } },
      { codigo: 'fallo',   min: 0,  max: 34,  texto: T('Te seguiste de largo y se fueron.'), stats: { politica: -3, fama: -4 } },
    ],
  },

  {
    codigo: 'mj_memotest', ilustracion: 'libro', mecanica: 'memotest',
    nombre: 'Memo test de autores',
    descripcion: 'Encontrá los pares antes de gastar todos los intentos.',
    instrucciones: T('Dale vuelta las fichas de a dos y encontrá los pares.'),
    fases: ['ingresante', 'intermedio', 'avanzado'],
    // Los símbolos son códigos de RETRATOS en public/ilustraciones.js
    // 6 pares = 12 fichas en una grilla de 4x3. maxErrores se cuenta en fallos,
    // no en jugadas: con 6 pares hacen falta 6 jugadas para ganar aunque no
    // falles nunca, así que un tope de 5 jugadas sería imposible.
    config: {
      pares: 6, columnas: 4, maxErrores: 5,
      simbolos: ['belgrano', 'sarmiento', 'che', 'evita', 'azurduy', 'rubinich'],
    },
    resultados: [
      { codigo: 'exito',   min: 80, max: 100, texto: T('Te acordás hasta de los apellidos con tilde.'), stats: { conocimiento: 9 } },
      { codigo: 'parcial', min: 40, max: 79,  texto: T('La mitad te quedó.'),                           stats: { conocimiento: 4 } },
      { codigo: 'fallo',   min: 0,  max: 39,  texto: T('En blanco total.'),                             stats: { conocimiento: -3 } },
    ],
  },

  {
    codigo: 'mj_traducir', ilustracion: 'libro', mecanica: 'traducir',
    nombre: 'Traducir el paper',
    descripcion: 'La cátedra lo subió en inglés y el parcial es el jueves.',
    instrucciones: T('Elegí la traducción correcta de cada término.'),
    fases: ['ingresante', 'intermedio', 'avanzado'],
    config: {
      rondas: 5,
      // Banco grande para que no se repita siempre lo mismo. La mayoría son
      // palabras simples de paper: la gracia está en los distractores.
      palabras: [
        { en: 'agency',         es: 'agencia',              mal: ['agenda', 'urgencia'] },
        { en: 'embeddedness',   es: 'incrustación',         mal: ['encuadre', 'endeudamiento'] },
        { en: 'framing',        es: 'encuadre',             mal: ['armazón', 'enmarcado legal'] },
        { en: 'gatekeeping',    es: 'filtrado de agenda',   mal: ['portería', 'guardia nocturna'] },
        { en: 'accountability', es: 'rendición de cuentas', mal: ['contabilidad', 'responsabilidad penal'] },
        { en: 'grassroots',     es: 'de base',              mal: ['raíces verdes', 'césped común'] },
        { en: 'backlash',       es: 'reacción adversa',     mal: ['latigazo', 'retroceso técnico'] },
        { en: 'livelihood',     es: 'medios de vida',       mal: ['vitalidad', 'esperanza de vida'] },
        { en: 'survey',         es: 'encuesta',             mal: ['supervisión', 'sobrevida'] },
        { en: 'policy',         es: 'política pública',     mal: ['policía', 'póliza'] },
        { en: 'welfare',        es: 'bienestar',            mal: ['despedida', 'guerra fría'] },
        { en: 'labor',          es: 'trabajo',              mal: ['laboratorio', 'laberinto'] },
        { en: 'gender',         es: 'género',               mal: ['generación', 'generador'] },
        { en: 'household',      es: 'hogar',                mal: ['casa rodante', 'retención'] },
        { en: 'bias',           es: 'sesgo',                mal: ['dos veces', 'base'] },
        { en: 'statement',      es: 'declaración',          mal: ['estado de cuenta', 'estatuto'] },
        { en: 'income',         es: 'ingreso',              mal: ['entrante', 'incómodo'] },
        { en: 'inequality',     es: 'desigualdad',          mal: ['inigualable', 'ecuación'] },
        { en: 'fieldwork',      es: 'trabajo de campo',     mal: ['obra en el campo', 'campo minado'] },
        { en: 'mainstream',     es: 'corriente dominante',  mal: ['arroyo principal', 'transmisión'] },
        { en: 'awareness',      es: 'concientización',      mal: ['advertencia', 'cautela'] },
        { en: 'empowerment',    es: 'empoderamiento',       mal: ['empresariado', 'empeño'] },
        { en: 'stakeholder',    es: 'parte interesada',     mal: ['accionista de bolsa', 'apostador'] },
        { en: 'deadline',       es: 'fecha límite',         mal: ['línea muerta', 'plazo fijo'] },
        { en: 'overview',       es: 'panorama general',     mal: ['supervisión', 'vista aérea'] },
        { en: 'claim',          es: 'reclamo',              mal: ['calma', 'clamor'] },
        { en: 'outcome',        es: 'resultado',            mal: ['salida', 'desenlace fatal'] },
        { en: 'trade-off',      es: 'contrapartida',        mal: ['intercambio comercial', 'oferta'] },
        { en: 'guidelines',     es: 'lineamientos',         mal: ['guías turísticas', 'líneas de tren'] },
        { en: 'findings',       es: 'hallazgos',            mal: ['fundaciones', 'finanzas'] },
      ],
    },
    resultados: [
      { codigo: 'exito',   min: 80, max: 100, texto: T('Lo leíste en el original y encima entendiste.'), stats: { conocimiento: 9, fama: 2 } },
      { codigo: 'parcial', min: 40, max: 79,  texto: T('Media traducción y mucho contexto inventado.'),  stats: { conocimiento: 4 } },
      { codigo: 'fallo',   min: 0,  max: 39,  texto: T('Lo pasaste por el traductor y quedó peor.'),     stats: { conocimiento: -3, fama: -2 } },
    ],
  },

  {
    codigo: 'mj_sopa', ilustracion: 'libro', mecanica: 'sopa',
    nombre: 'Sopa de letras de la cátedra',
    descripcion: 'Los conceptos que entran en el parcial, escondidos.',
    instrucciones: T('Clic en la primera y en la última letra de cada palabra.'),
    fases: ['ingresante', 'intermedio', 'avanzado'],
    // Conceptos que son firma de cada autor: si aparece la palabra, se sabe
    // de quién es. Grilla de 10 para que entren las largas (BUROCRACIA,
    // PLUSVALIA, PANOPTICO). Se sortean `cantidad` por partida.
    config: {
      lado: 10, segundos: 60, cantidad: 3,
      palabras: [
        // Weber
        'BUROCRACIA', 'CARISMA', 'VOCACION', 'DESENCANTO', 'ESTAMENTO', 'ASCETISMO',
        // Marx
        'PLUSVALIA', 'BURGUESIA', 'PROLETARIO', 'ALIENACION', 'MERCANCIA', 'FETICHISMO',
        // Durkheim
        'ANOMIA', 'SUICIDIO', 'COERCION', 'TOTEM', 'SAGRADO', 'ORGANICA',
        // Bourdieu
        'HABITUS', 'DISTINCION', 'SIMBOLICO', 'ILLUSIO', 'DOXA', 'CAMPO',
        // Foucault
        'PANOPTICO', 'BIOPODER', 'DISCIPLINA', 'VIGILANCIA', 'GENEALOGIA', 'ENCIERRO',
        // Parsons
        'SISTEMA', 'FUNCION', 'EQUILIBRIO', 'LATENCIA', 'ESTRUCTURA', 'ADAPTACION',
      ],
    },
    resultados: [
      { codigo: 'exito',   min: 80, max: 100, texto: T('Las tres al hilo. Ojo clínico.'),          stats: { conocimiento: 8, fama: 2 } },
      { codigo: 'parcial', min: 40, max: 79,  texto: T('Encontraste alguna y te cansaste.'),       stats: { conocimiento: 4 } },
      { codigo: 'fallo',   min: 0,  max: 39,  texto: T('Miraste la hoja veinte minutos sin ver.'), stats: { conocimiento: -2 } },
    ],
  },

  {
    codigo: 'mj_crucigrama', ilustracion: 'libro', mecanica: 'crucigrama',
    nombre: 'Parcial contrarreloj',
    descripcion: 'Tres conceptos que se cruzan. Completá la grilla.',
    instrucciones: T('Escribí una letra por casillero. Se cruzan entre sí.'),
    fases: ['ingresante', 'intermedio', 'avanzado'],
    // Una grilla por autor: los tres conceptos que lo delatan. Se sortea una
    // por partida. El seed valida que entren y que los cruces coincidan.
    config: {
      segundos: 60,
      grillas: [
        { // --- WEBER ---
          filas: 7, columnas: 8,
          palabras: [
            { palabra: 'VOCACION', f: 0, c: 0, horizontal: true,  pista: 'Weber: así se ejercen la política y la ciencia' },
            { palabra: 'CARISMA',  f: 0, c: 2, horizontal: false, pista: 'El tipo de dominación que no se hereda ni se vota' },
            { palabra: 'ETICA',    f: 3, c: 0, horizontal: true,  pista: '…protestante: la que empujó al capitalismo' },
          ],
        },
        { // --- MARX ---
          filas: 5, columnas: 7,
          palabras: [
            { palabra: 'CAPITAL', f: 0, c: 0, horizontal: true,  pista: 'El libro que nadie terminó y todos citan' },
            { palabra: 'CLASE',   f: 0, c: 0, horizontal: false, pista: 'En sí y para sí' },
            { palabra: 'LUCHA',   f: 1, c: 0, horizontal: true,  pista: 'El motor de la historia, según el Manifiesto' },
          ],
        },
        { // --- DURKHEIM ---
          filas: 6, columnas: 7,
          palabras: [
            { palabra: 'SAGRADO', f: 0, c: 0, horizontal: true,  pista: 'Lo que Durkheim opone a lo profano' },
            { palabra: 'ANOMIA',  f: 0, c: 1, horizontal: false, pista: 'Cuando las normas no alcanzan y el suicidio sube' },
            { palabra: 'TOTEM',   f: 2, c: 0, horizontal: true,  pista: 'El animal que el clan venera y no puede comer' },
          ],
        },
        { // --- BOURDIEU ---
          filas: 5, columnas: 7,
          palabras: [
            { palabra: 'CAMPO',   f: 0, c: 1, horizontal: false, pista: 'El espacio de juego donde se pelea por el capital' },
            { palabra: 'HABITUS', f: 1, c: 0, horizontal: true,  pista: 'Estructura estructurada que estructura' },
            { palabra: 'DOXA',    f: 4, c: 0, horizontal: true,  pista: 'Lo que se da por obvio y nadie discute' },
          ],
        },
        { // --- FOUCAULT ---
          filas: 5, columnas: 8,
          palabras: [
            { palabra: 'DISCURSO', f: 0, c: 0, horizontal: true,  pista: 'No describe la realidad: la produce' },
            { palabra: 'SABER',    f: 0, c: 6, horizontal: false, pista: 'Va siempre de la mano del poder' },
            { palabra: 'PODER',    f: 3, c: 3, horizontal: true,  pista: 'No se tiene: se ejerce' },
          ],
        },
        { // --- PARSONS ---
          filas: 8, columnas: 8,
          palabras: [
            { palabra: 'FUNCION', f: 0, c: 2, horizontal: false, pista: 'Lo que cada parte cumple para el todo' },
            { palabra: 'SISTEMA', f: 4, c: 1, horizontal: true,  pista: 'Para Parsons la sociedad es uno, y tiende al equilibrio' },
            { palabra: 'AGIL',    f: 4, c: 7, horizontal: false, pista: 'Adaptación, metas, integración, latencia: las cuatro de Parsons' },
          ],
        },
      ],
    },
    resultados: [
      { codigo: 'exito',   min: 70, max: 100, texto: T('Entregaste con tiempo de sobra.'),       stats: { conocimiento: 8, fama: 2 } },
      { codigo: 'parcial', min: 35, max: 69,  texto: T('Aprobaste raspando.'),                   stats: { conocimiento: 4 } },
      { codigo: 'fallo',   min: 0,  max: 34,  texto: T('Se te acabó el tiempo con media hoja.'), stats: { conocimiento: -2, fama: -2 } },
    ],
  },

  {
    codigo: 'mj_apellidos', ilustracion: 'libro', mecanica: 'apellidos',
    nombre: 'Escribir bien los apellidos',
    descripcion: 'Como suenan en el pasillo contra como se escriben.',
    instrucciones: T('Te mostramos cómo lo dicen todos. Escribilo bien.'),
    fases: ['ingresante', 'intermedio', 'avanzado'],
    config: {
      rondas: 4,
      // Cómo se dice en el pasillo contra cómo se escribe. Ojo: la
      // comparación ignora tildes y mayúsculas, así que la deformación
      // tiene que cambiar letras, no solo acentos.
      autores: [
        { mal: 'Bordié',    bien: 'Bourdieu' },
        { mal: 'Durkeim',   bien: 'Durkheim' },
        { mal: 'Fuco',      bien: 'Foucault' },
        { mal: 'Vebber',    bien: 'Weber' },
        { mal: 'Gramchi',   bien: 'Gramsci' },
        { mal: 'Bodrillar', bien: 'Baudrillard' },
        { mal: 'Marcs',     bien: 'Marx' },
        { mal: 'Nietche',   bien: 'Nietzsche' },
        { mal: 'Abermas',   bien: 'Habermas' },
        { mal: 'Benyamin',  bien: 'Benjamin' },
        { mal: 'Altuser',   bien: 'Althusser' },
        { mal: 'Chomski',   bien: 'Chomsky' },
        { mal: 'Gofman',    bien: 'Goffman' },
        { mal: 'Luman',     bien: 'Luhmann' },
        { mal: 'Parsonz',   bien: 'Parsons' },
        { mal: 'Simel',     bien: 'Simmel' },
        { mal: 'Tocvil',    bien: 'Tocqueville' },
        { mal: 'Rusó',      bien: 'Rousseau' },
        { mal: 'Sartr',     bien: 'Sartre' },
        { mal: 'Baumann',   bien: 'Bauman' },
        { mal: 'Latur',     bien: 'Latour' },
        { mal: 'Deleuse',   bien: 'Deleuze' },
        { mal: 'Guidens',   bien: 'Giddens' },
        { mal: 'Yermani',   bien: 'Germani' },
        { mal: 'Makiavelo', bien: 'Maquiavelo' },
        { mal: 'Espinosa',  bien: 'Spinoza' },
      ],
    },
    resultados: [
      { codigo: 'exito',   min: 80, max: 100, texto: T('Ni una falta de ortografía. El titular te miró distinto.'), stats: { conocimiento: 11, fama: 3 } },
      { codigo: 'parcial', min: 40, max: 79,  texto: T('Escribiste "Durkeim" y nadie te dijo nada.'),               stats: { conocimiento: 4 } },
      { codigo: 'fallo',   min: 0,  max: 39,  texto: T('"Bordié". Se rió toda la comisión.'),                       stats: { conocimiento: -4, fama: -3 } },
    ],
  },

  {
    codigo: 'mj_conectar', ilustracion: 'afiche', mecanica: 'conectar',
    nombre: 'El mapa conceptual',
    descripcion: 'Unir los puntos antes de que te toque exponer.',
    instrucciones: T('Clickeá los puntos en orden, del 1 al último.'),
    fases: ['ingresante', 'intermedio', 'avanzado'],
    // 15 segundos para unir los nueve puntos. Si se acaba el tiempo es
    // derrota lisa y llana, sin importar cuántos llegaste a unir.
    config: { puntos: 9, segundos: 15 },
    resultados: [
      { codigo: 'exito',   min: 80, max: 100, texto: T('Quedó un mapa que hasta la cátedra te copió.'), stats: { conocimiento: 8, fama: 3 } },
      { codigo: 'parcial', min: 40, max: 79,  texto: T('Se entiende si lo explicás vos al lado.'),      stats: { conocimiento: 4 } },
      { codigo: 'fallo',   min: 0,  max: 39,  texto: T('Parece una telaraña dibujada con el codo.'),    stats: { conocimiento: -2, fama: -2 } },
    ],
  },

  {
    codigo: 'mj_molinete', ilustracion: 'bondi', mecanica: 'molinete',
    nombre: 'Saltar el molinete',
    descripcion: 'Sin SUBE y con clase en cuarenta minutos.',
    instrucciones: T('Clic o barra espaciadora para saltar. No toques el molinete.'),
    fases: ['ingresante', 'intermedio', 'avanzado'],
    config: { obstaculos: 10, velocidad: 4.6 },
    resultados: [
      { codigo: 'exito',   min: 70, max: 100, texto: T('Pasaste los diez sin que te vieran. Llegaste con la SUBE intacta.'), stats: { guita: 13, fama: 3 } },
      { codigo: 'parcial', min: 35, max: 69,  texto: T('Te llevaste uno por delante pero seguiste igual.'),                  stats: { guita: 5, fama: -1 } },
      { codigo: 'fallo',   min: 0,  max: 34,  texto: T('Te agarró seguridad en el primer molinete.'),                        stats: { guita: -4, fama: -3 } },
    ],
  },
  // Duelo de baile contra el falso Michael Jackson. NO entra en el sorteo de
  // los minijuegos por fase: `fases: []` lo deja fuera de la bolsa. Solo lo
  // lanza la respuesta del evento que lo declara.
  {
    codigo: 'mj_simon', ilustracion: 'multitud', mecanica: 'simon',
    nombre: 'Duelo de baile',
    descripcion: 'Seis pasos de una. Repetilos todos seguidos.',
    instrucciones: T('Te muestro los seis pasos una sola vez. Después repetilos en orden, sin equivocarte.'),
    fases: [],
    // La secuencia se muestra entera una sola vez y hay que repetirla completa.
    // umbralDuelo en 100: un solo error y perdiste el duelo.
    config: { pasos: 6, umbralDuelo: 100 },
    // Los resultados no se usan cuando lo lanza una respuesta —el efecto lo
    // pone el evento— pero quedan por si algún día entra a la bolsa.
    resultados: [
      { codigo: 'exito',   min: 100, max: 100, texto: T('Caminata lunar impecable.'), stats: { fama: 9 } },
      { codigo: 'parcial', min: 50,  max: 99,  texto: T('Te trabaste a mitad de camino.'), stats: { fama: 2 } },
      { codigo: 'fallo',   min: 0,   max: 49,  texto: T('Perdiste el ritmo en el primer paso.'), stats: { fama: -4 } },
    ],
  },

];

// ---------------------------------------------------------------------------
// Avisos de familia
//
// Todo evento que respondés programa un aviso. Los cuatro avisos "propios" de
// arriba están escritos para una decisión puntual; estos nueve cubren el resto,
// agrupados por lo que la respuesta le hizo a tus stats. seed.js se los asigna
// solo a cada efecto que no declare un aviso propio, mirando cuál fue su cambio
// más grande. Así cualquier decisión puede volver, y la carta nombra el evento
// que la disparó.
//
// Se escriben sin nombrar hechos concretos, porque el hecho concreto lo pone
// arriba la interfaz: "Por lo que hiciste en: La plaza seca".
// ---------------------------------------------------------------------------
// Los avisos se borraron junto con los eventos. La maquinaria sigue en pie:
// seed.js le asigna un aviso de familia a cada efecto que no declare uno propio,
// y el motor los muestra en los slots de configuracion.avisos_en_rondas.
// Al volver a cargar avisos, alcanza con llenar este array.
const avisosDeFamilia = [];

// ---------------------------------------------------------------------------
// Finales
//
// Cada stat cae en una de tres bandas de puntaje fijas, iguales para todos y
// definidas de antemano:
//
//     BAJA   0 a 36        MEDIA  37 a 59        ALTA  60 a 100
//
// El final lo define la combinacion de bandas con la que terminaste. Como los
// finales se evaluan por prioridad descendente y los tramos van de mas altas a
// menos, cada final solo necesita declarar sus altas: si tenias tres, el trio
// ya gano antes de que la dupla llegue a evaluarse.
//
//     4 altas                      -> Decano en diez anios
//     3 altas                      -> trio, nombrado por el que falta (4)
//     2 altas                      -> dupla (6)
//     1 alta + las otras 3 bajas   -> dominante puro, el monomaniaco (4)
//     1 alta + alguna media        -> dominante (4)
//     0 altas, las 4 medias        -> El promedio perfecto
//     0 altas, las 4 bajas         -> El fantasma del pasillo
//     0 altas, mezcla              -> Graduado (default)
//
// Los cortes salieron de medir 8000 partidas. Con la partida de 9 eventos eran
// 42 y 30; al bajar a 6 los stats se mueven menos y con esos cortes 'Graduado'
// se disparaba al 14%, asi que pasaron a 40 y 28. Si tocas la duracion de la
// partida o la escala de los efectos, hay que volver a medirlos.
// ---------------------------------------------------------------------------
const ALTA = 60;
const BAJA = 36;
const STATS4 = ['guita', 'conocimiento', 'fama', 'politica'];
const alta = (s) => ({ tipo: 'stat', stat: s, operador: '>=', valor: ALTA });
const baja = (s) => ({ tipo: 'stat', stat: s, operador: '<=', valor: BAJA });
const media = (s) => ({ tipo: 'stat', stat: s, operador: 'between', valor: BAJA + 1, valor2: ALTA - 1 });

// Estos stats en alta. Los tramos de mas altas ya corrieron antes, asi que no
// hace falta declarar que los demas no lo estan.
const altas = (...cuales) => cuales.map(alta);
// Uno solo arriba y todo el resto en el piso.
const soloAlta = (s) => [alta(s), ...STATS4.filter((x) => x !== s).map(baja)];
const todas = (f) => STATS4.map(f);

const finales = [
  {
    codigo: 'fin_secreto', ilustracion: 'alerta', prioridad: 2000,
    titulo: G('Secret ending', 'Secret ending', 'Secret ending'),
    texto: T('Tus decisiones escalaron la violencia política. Lo que empezó como un escrache terminó en otra cosa. Nadie firmó nada, nadie se hizo cargo, y la facultad tardó años en volver a ser un lugar donde se pudiera discutir sin mirar la puerta.'),
    cond: [{ tipo: 'stat', stat: 'violencia', operador: '>=', valor: 30 }],
  },
  {
    codigo: 'fin_abandono', ilustracion: 'puerta', prioridad: 1500, requiere_abandono: true,
    titulo: G('El que se fue', 'La que se fue', 'Le que se fue'),
    texto: T('No terminaste la carrera. Pasan los años y a veces soñás con un final que nunca rendiste. La facultad siguió sin vos, como sigue sin todos.'),
  },

  // --- Las cuatro en alta ---
  {
    codigo: 'fin_decano', ilustracion: 'facultad', prioridad: 1000,
    titulo: G('Decano en diez años', 'Decana en diez años', 'Decane en diez años'),
    texto: T('Guita, lectura, prensa y rosca, las cuatro cosas al mismo tiempo y sin que se te notara el esfuerzo. Nadie termina de entender cómo hiciste y circulan tres versiones, ninguna favorable. Un martes a las siete de la mañana te va a llegar un mail y vas a ser decano.'),
    cond: todas(alta),
  },

  // --- Tres en alta: el trío se nombra por el que falta ---
  {
    codigo: 'fin_sin_guita', ilustracion: 'comida', prioridad: 903,
    titulo: T('Prócer sin sueldo'),   // 'prócer' no lleva marca de género en ningún caso
    texto: T('Sabés, te ubican y movés. Lo único que no aparece nunca es la plata. Diste catorce charlas este año, todas gratis, y llegás a fin de mes con lo que te presta tu vieja. Te dicen que sos un ejemplo y vos calculás cuánto sale el bondi.'),
    cond: altas('conocimiento', 'fama', 'politica'),
  },
  {
    codigo: 'fin_sin_conocimiento', ilustracion: 'multitud', prioridad: 902,
    titulo: G('El que nunca leyó a Weber', 'La que nunca leyó a Weber', 'Le que nunca leyó a Weber'),
    texto: T('Guita, contactos y prensa. Lo único que nunca terminaste fue la bibliografía. Tampoco importó demasiado: aprendiste temprano que en las reuniones donde se define algo no se cita a nadie.'),
    cond: altas('guita', 'fama', 'politica'),
  },
  {
    codigo: 'fin_sin_fama', ilustracion: 'noche', prioridad: 901,
    titulo: G('Operador en las sombras', 'Operadora en las sombras', 'Operadore en las sombras'),
    texto: T('Tenés plata, tenés título y tenés rosca. Lo único que no tenés es una sola foto. Preferís que sea así: mirás a los que salen en la tapa y sabés perfectamente cuánto duran.'),
    cond: altas('guita', 'conocimiento', 'politica'),
  },
  {
    codigo: 'fin_sin_politica', ilustracion: 'bondi', prioridad: 900,
    titulo: G('Apolítico de manual', 'Apolítica de manual', 'Apolítique de manual'),
    texto: T('Te fue bien en todo menos en lo único que la facultad daba por descontado. Decís "a mí la política no me interesa" con una seguridad que solo se consigue después de seis años cursando en un edificio que tomaron tres veces.'),
    cond: altas('guita', 'conocimiento', 'fama'),
  },

  // --- Dos en alta ---
  {
    codigo: 'fin_tecnocrata', ilustracion: 'sobre', prioridad: 805,
    titulo: G('Terrible tecnócrata', 'Terrible tecnócrata', 'Terrible tecnócrata'),
    texto: T('Conocimiento y política en la misma persona: terminaste redactando los documentos que otros firman. Nadie sabe tu nombre y todos aplican tus párrafos.'),
    cond: altas('conocimiento', 'politica'),
  },
  {
    codigo: 'fin_menem', ilustracion: 'multitud', prioridad: 804,
    titulo: G('Sos Menem', 'Sos Menem', 'Sos Menem'),
    texto: T('Fama y política, todo junto y sin frenos. Te sale bien el discurso, te sale bien la foto, y nadie se acuerda de una sola cosa concreta que hayas hecho.'),
    cond: altas('fama', 'politica'),
  },
  {
    codigo: 'fin_influencer', ilustracion: 'camara', prioridad: 803,
    titulo: G('Influencer con marca propia', 'Influencer con marca propia', 'Influencer con marca propia'),
    texto: T('Fama y guita: monetizaste la carrera antes de terminarla. Vendés cursos de "sociología aplicada a negocios" a 40 dólares y funciona.'),
    cond: altas('fama', 'guita'),
  },
  {
    codigo: 'fin_consultora', ilustracion: 'plata', prioridad: 802,
    titulo: G('Sociólogo de consultora', 'Socióloga de consultora', 'Sociólogue de consultora'),
    texto: T('Aprendiste todo y aprendiste a cobrarlo. Hacés diapositivas con conceptos de Bourdieu para explicarle a un directorio por qué conviene achicar la planta. Nadie en esa mesa leyó a Bourdieu, y ese es exactamente tu valor agregado.'),
    cond: altas('guita', 'conocimiento'),
  },
  {
    codigo: 'fin_lobista', ilustracion: 'sobre', prioridad: 801,
    titulo: G('Lobista con carnet', 'Lobista con carnet', 'Lobista con carnet'),
    texto: T('La militancia te enseñó a mover un expediente y un día descubriste que eso se cobra. Ahora gestionás habilitaciones para gente que nunca pisó una asamblea. Seguís yendo a los actos, eso sí: ahora llegás en camioneta.'),
    cond: altas('guita', 'politica'),
  },
  {
    codigo: 'fin_panelista', ilustracion: 'profesor', prioridad: 800,
    titulo: G('Panelista con doctorado', 'Panelista con doctorado', 'Panelista con doctorado'),
    texto: T('Sabés de lo que hablás y encima hablás bien, que es una combinación rarísima. Te llaman de los canales cada vez que pasa algo y explicás en cuatro minutos lo que a vos te llevó seis años entender. Tus colegas dicen que te vendiste, y te llaman igual cuando hay que salir a bancar la facultad.'),
    cond: altas('conocimiento', 'fama'),
  },

  // --- Una sola en alta y las otras tres en el piso: el monomaníaco ---
  {
    codigo: 'fin_puro_guita', ilustracion: 'plata', prioridad: 753,
    titulo: G('Plata y nada más', 'Plata y nada más', 'Plata y nada más'),
    texto: T('Hiciste guita y no hiciste ninguna otra cosa. No leíste, no te ubica nadie, nunca fuiste a una asamblea. Cuando te preguntan qué estudiaste contestás rápido y cambiás de tema, y funciona: nadie repregunta cuando pagás vos.'),
    cond: soloAlta('guita'),
  },
  {
    codigo: 'fin_puro_conocimiento', ilustracion: 'libro', prioridad: 752,
    titulo: G('Erudito de pensión', 'Erudita de pensión', 'Erudite de pensión'),
    texto: T('Leíste todo. Absolutamente todo. No tenés un peso, no te conoce nadie y nunca firmaste un petitorio. Sabés más que cualquiera de los que dan clase, y eso lo saben vos y dos personas más.'),
    cond: soloAlta('conocimiento'),
  },
  {
    codigo: 'fin_puro_fama', ilustracion: 'camara', prioridad: 751,
    titulo: G('Conocido por nada', 'Conocida por nada', 'Conocide por nada'),
    texto: T('Te ubica todo el mundo y ninguno sabría explicar por qué. No tenés plata, no terminaste de leer nada y en política no te metiste jamás. Pero entrás a la facultad y tres personas te saludan.'),
    cond: soloAlta('fama'),
  },
  {
    codigo: 'fin_puro_politica', ilustracion: 'afiche', prioridad: 750,
    titulo: G('Militante a tiempo completo', 'Militante a tiempo completo', 'Militante a tiempo completo'),
    texto: T('Le diste todo al aparato: las noches, la plata, los finales que nunca rendiste. La agrupación te debe absolutamente todo y te lo va a agradecer en un acto, de pie, durante once segundos.'),
    cond: soloAlta('politica'),
  },

  // --- Una sola en alta, con algo de resto ---
  {
    codigo: 'fin_guita', ilustracion: 'plata', prioridad: 703,
    titulo: G('Consultor garca', 'Consultora garca', 'Consultore garca'),
    texto: T('Trabajás para Marlboro intentando vender nicotina a menores de edad. La propaganda de los nuevos chupetines de tabaco es un éxito en Arabia Saudita.'),
    cond: altas('guita'),
  },
  {
    codigo: 'fin_conocimiento', ilustracion: 'libro', prioridad: 702,
    titulo: G('Investigador del CONICET', 'Investigadora del CONICET', 'Investigadore del CONICET'),
    texto: T('Tu paper sobre las subjetividades latinoamericanizadas fue muy bien recibido por el MI6. Tenés una cátedra en Cambridge.'),
    cond: altas('conocimiento'),
  },
  {
    codigo: 'fin_fama', ilustracion: 'camara', prioridad: 701,
    titulo: G('Influencer de ciencias sociales', 'Influencer de ciencias sociales', 'Influencer de ciencias sociales'),
    texto: T('Aumentó la matrícula de la facultad gracias a vos. Promocionás casinos online y tenés un podcast con los Moldavsky.'),
    cond: altas('fama'),
  },
  {
    codigo: 'fin_politica', ilustracion: 'afiche', prioridad: 700,
    titulo: G('Puntero con unidad básica', 'Puntera con unidad básica', 'Puntere con unidad básica'),
    texto: T('Tenés una unidad básica con tu nombre y llegaste a ser asesor de un legislador más boludo que vos. Lo importante es que nunca perdiste la fe ni las ganas de cambiar el mundo.'),
    cond: altas('politica'),
  },

  // --- Ninguna en alta ---
  {
    codigo: 'fin_promedio', ilustracion: 'estudiante', prioridad: 650,
    titulo: G('El promedio perfecto', 'El promedio perfecto', 'El promedio perfecto'),
    texto: T('Los cuatro números te dieron casi iguales. Ni te destacaste ni te faltó nada: sos exactamente el punto medio de tu camada, con una precisión que da un poco de miedo. Si la facultad tuviera que dibujar al estudiante tipo, te dibujaría a vos.'),
    cond: todas(media),
  },
  {
    codigo: 'fin_fantasma', ilustracion: 'facultad', prioridad: 600,
    titulo: G('El fantasma del pasillo', 'El fantasma del pasillo', 'El fantasma del pasillo'),
    texto: T('Terminaste la carrera sin que pasara nada. No hiciste plata, no aprendiste demasiado, nadie te ubica y nunca te metiste en nada. Cursaste seis años en el mismo edificio que dos mil personas y ninguna podría decir tu nombre. El título está, eso sí.'),
    cond: todas(baja),
  },
  {
    codigo: 'fin_default', ilustracion: 'birrete', prioridad: 0, es_default: true,
    titulo: G('Graduado', 'Graduada', 'Graduade'),
    texto: T('Terminaste sin que ningún costado se despegara del resto: un poco de guita, un poco de lectura, algo de gente que te ubica y una relación tibia con la política. Ni epopeya ni desastre. La mayoría de las carreras terminan exactamente así, y no está tan mal.'),
  },
];

module.exports = {
  T, G, stats, fases, historias,
  eventos: eventos.concat(avisosDeFamilia),
  avisosDeFamilia,
  minijuegos, finales,
};
