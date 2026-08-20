// =====================================================================
//  Contenido del juego — "SimuladorSociales. De aspirante a exitoso."
//  Transcripción del documento de diseño.
//
//  T('x')        -> mismo texto para los 3 géneros
//  G(m, f, nb)   -> tres textos completos
//  stats: { fama: 4 }         -> sumar 5
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

  // Derivados: los calcula el motor antes de elegir el final. No los toca
  // ningún efecto. Existen como stats para que los finales de "forma" puedan
  // escribir sus condiciones con la maquinaria normal.
  { codigo: 'pct_guita',        nombre: '% Guita',        icono: 'moneda',   color: '#7AC143', valor_inicial: 25, orden: 6,  visible: false, descripcion: 'Porcentaje del reparto que se lleva Guita.' },
  { codigo: 'pct_conocimiento', nombre: '% Conocimiento', icono: 'libro',    color: '#2FA8D5', valor_inicial: 25, orden: 7,  visible: false, descripcion: 'Porcentaje del reparto que se lleva Conocimiento.' },
  { codigo: 'pct_fama',         nombre: '% Fama',         icono: 'estrella', color: '#FFD520', valor_inicial: 25, orden: 8,  visible: false, descripcion: 'Porcentaje del reparto que se lleva Fama.' },
  { codigo: 'pct_politica',     nombre: '% Política',     icono: 'puno',     color: '#F05A28', valor_inicial: 25, orden: 9,  visible: false, descripcion: 'Porcentaje del reparto que se lleva Política.' },
  { codigo: 'promedio',         nombre: 'Promedio',       icono: 'chispa',   color: '#9B8579', valor_inicial: 0,  orden: 10, visible: false, descripcion: 'Promedio de los cuatro stats visibles. Mide magnitud, no forma.' },
];

// ---------------------------------------------------------------------
// FASES — 16 elecciones / puntos de control, una por cuatrimestre.
// ---------------------------------------------------------------------
// 9 eventos en 3 fases de 3, con un minijuego antes del cierre de cada una.
// Total: 12 cartas. El minijuego cae en 2, 5 y 8 para que la última carta de la
// partida sea siempre un evento: la decisión final la toma el jugador, no la
// resuelve su puntería.
const fases = [
  { codigo: 'ingresante', nombre: 'Ingresante', ronda_desde: 1, ronda_hasta: 3, minijuego_despues_de: 2, orden: 1 },
  { codigo: 'intermedio', nombre: 'Intermedio', ronda_desde: 4, ronda_hasta: 6, minijuego_despues_de: 5, orden: 2 },
  { codigo: 'avanzado',   nombre: 'Avanzado',   ronda_desde: 7, ronda_hasta: 9, minijuego_despues_de: 8, orden: 3 },
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
const eventos = [

  // ===================================================================
  //  GENERALES
  // ===================================================================
  {
    codigo: 'gen_plaza_seca', ilustracion: 'plaza', categoria: 'generales', peso: 120, personaje: 'Plaza seca',
    titulo: T('David Lynch en la plaza seca'),
    texto: G(
      'Estás ranchando en la plaza seca y ves a una mina linda que nunca habías visto en tu vida. Un facuamigo te la presenta y resulta que los dos son fanáticos de David Lynch. Te enamorás profundamente. Al otro día tenés un coloquio grupal importantísimo: si no ponés de tu parte, todo tu grupo se ve afectado.',
      'Estás ranchando en la plaza seca y ves a un pibe lindo que nunca habías visto en tu vida. Un facuamigo te lo presenta y resulta que los dos son fanáticos de David Lynch. Te enamorás profundamente. Al otro día tenés un coloquio grupal importantísimo: si no ponés de tu parte, todo tu grupo se ve afectado.',
      'Estás ranchando en la plaza seca y ves a alguien que nunca habías visto en tu vida. Un facuamigo te presenta y resulta que les dos son fanátiques de David Lynch. Te enamorás profundamente. Al otro día tenés un coloquio grupal importantísimo: si no ponés de tu parte, todo tu grupo se ve afectado.'),
    respuestas: [
      { texto: T('Te quedás hasta las mil y una hablando. Dios, Patria y Familia.'), gesto: 'izq', efectos: [
        { peso: 100, texto: T('En una de esas terminás casándote y se te resuelve la mitad de los problemas. Los compas sabrán entender. El coloquio salió como salió.'), stats: { fama: -8, conocimiento: -8 } },
      ]},
      { texto: T('Si es la indicada va a saber entender. Intercambian instagrams.'), gesto: 'der', efectos: [
        // Resultado condicional: "si el jugador tiene guita pega onda".
        { peso: 30, cond: [{ tipo: 'stat', stat: 'guita', operador: '>=', valor: 45 }],
          texto: T('Resulta que militaba en Alternativa Académica y los abuelos tienen terrenos en la Pampa Húmeda. Como tenés con qué bancarte, pegás onda.'),
          stats: { guita: 16, fama: 5 } },
        { peso: 30, cond: [{ tipo: 'stat', stat: 'guita', operador: '<', valor: 45 }],
          texto: T('Resulta que militaba en Alternativa Académica y los abuelos tienen terrenos en la Pampa Húmeda. No tenés un mango y se te va la chance.'),
          stats: { fama: -5 } },
        { peso: 70, texto: T('Se cortó el hechizo y no la viste nunca más. El coloquio salió bien, eso sí.'), stats: { politica: -7, conocimiento: 4 } },
      ]},
    ],
  },

  {
    codigo: 'gen_bondi', ilustracion: 'bondi', categoria: 'generales', peso: 120, personaje: 'Temperley',
    titulo: T('El último bondi'),
    texto: T('Te quedaste ranchando hasta cualquier hora con los pibes y vivís en Temperley. Llegás a la avenida y ves que se te va el último bondi.'),
    respuestas: [
      { texto: T('Corrés el bondi.'), gesto: 'der', efectos: [
        { peso: 50, texto: T('Llegás, pero se te abrió la mochila y se te cayó todo. En el camino quedaron tus apuntes sobre Weber, Hobbes y Ofelia Fernández. Habrá que empezar de nuevo.'), stats: { conocimiento: -10, guita: -7 } },
        { peso: 50, texto: G(
          'Te tropezás y caés. Te ayuda una chica que iba a subir y se quedó preocupada por tu caída. Vive en tu zona y cursa T. S. Es el alma más noble que conociste. Se van a tomar algo hasta cualquier hora. Contás la anécdota y tus amigos te cambian el apodo por Lilita Corrió.',
          'Te tropezás y caés. Te ayuda un chico que iba a subir y se quedó preocupado por tu caída. Vive en tu zona y cursa T. S. Es el alma más noble que conociste. Se van a tomar algo hasta cualquier hora. Contás la anécdota y tus amigos te cambian el apodo por Lilita Corrió.',
          'Te tropezás y caés. Te ayuda alguien que iba a subir y se quedó preocupade por tu caída. Vive en tu zona y cursa T. S. Es el alma más noble que conociste. Se van a tomar algo hasta cualquier hora. Contás la anécdota y tus amigos te cambian el apodo por Lilita Corrió.'),
          stats: { guita: -7, fama: 7, conocimiento: 9 } },
      ]},
      { texto: T('No te apurás. Ya llegará otro.'), gesto: 'izq', efectos: [
        { peso: 100, texto: T('Estuviste tres horas chupando frío. Te quisieron robar y las chicas que laburan en Consti saltaron por vos. Les contaste lo que estudiabas y arrancaste una movida contra la represión policial en el barrio.'), stats: { guita: -7, fama: 7, politica: 10 } },
      ]},
    ],
  },

  {
    codigo: 'gen_nisman', ilustracion: 'plata', categoria: 'generales', peso: 110, personaje: 'Hall de entrada',
    titulo: T('El que pide plata'),
    texto: T('Entra una persona a pedir plata a la facultad. Dice que lo persigue Máximo Kirchner, que necesita irse del país porque tiene información que puede llevar al arresto de Cristina Fernández de Kirchner.'),
    respuestas: [
      { texto: T('Le das plata.'), gesto: 'der', efectos: [
        { peso: 100, texto: T('El tipo te agradece y dice que quiere mostrarte algo. Te lleva al baño. Tenés miedo pero lo seguís. "Acercate", susurra. Mete la mano por debajo del cuello y se saca una máscara: ¡es Nisman!'), stats: { guita: -7, politica: 10 } },
      ]},
      { texto: T('No le creés.'), gesto: 'izq', efectos: [
        { peso: 100, texto: T('El tipo se aleja sin problema. Antes de doblar la esquina un francotirador lo fulmina con un tiro en la frente. No llegás a ver de dónde dispararon, pero hay humo en una ventana de San José.'), stats: { guita: 11, fama: -8, violencia: 5 } },
      ]},
    ],
  },

  {
    codigo: 'gen_donde_estudiar', ilustracion: 'facultad', categoria: 'generales', peso: 110, fase: 'ingresante', personaje: 'Facultad',
    titulo: T('¿Dónde vas a estudiar?'),
    texto: G('Llegás temprano a la facultad por primera vez en tu vida.',
             'Llegás temprano a la facultad por primera vez en tu vida.',
             'Llegás temprano a la facultad por primera vez en tu vida.'),
    respuestas: [
      { texto: T('A la biblioteca. Obviamente.'), efectos: [
        { peso: 100, texto: G('De tanto silencio te quedaste dormido. Llegaste tarde a la clase, pero la siesta te hizo bien: lo poco que estuviste participaste un montón.',
                              'De tanto silencio te quedaste dormida. Llegaste tarde a la clase, pero la siesta te hizo bien: lo poco que estuviste participaste un montón.',
                              'De tanto silencio te quedaste dormide. Llegaste tarde a la clase, pero la siesta te hizo bien: lo poco que estuviste participaste un montón.'),
          stats: { conocimiento: 7, fama: 4 } },
      ]},
      { texto: T('Te encerrás en un aula vacía.'), efectos: [
        { peso: 100, texto: T('A los quince minutos entró un grupo para una clase y, como te dio vergüenza, te quedaste. Terminaste aprendiendo mucho sobre Martín Lutero.'), stats: { conocimiento: 11 } },
      ]},
      { texto: T('Agarrás una mesa en el foyer.'), efectos: [
        { peso: 100, texto: T('Mala luz y letra minúscula. Entraste a cursar sin ver un pito y encima no aprendiste un carajo.'), stats: { conocimiento: -8 } },
      ]},
    ],
  },

  {
    codigo: 'gen_investigacion', ilustracion: 'libro', categoria: 'generales', peso: 110, personaje: 'Cátedra',
    titulo: T('Trabajo de investigación'),
    texto: T('Tenés que hacer un trabajo de investigación en grupo y hay que elegir tema.'),
    respuestas: [
      { texto: T('Elegís el tema difícil. No se trata solo de aprobar la materia.'), gesto: 'der', efectos: [
        { peso: 100, texto: T('Le dedicaste una banda de tiempo, quedó bien y le gustó a la cátedra.'), stats: { conocimiento: 17, fama: 5, guita: -4 } },
      ]},
      { texto: T('Elegís un tema papita que mucho no te interesa.'), gesto: 'izq', efectos: [
        { peso: 100, texto: T('Lo hiciste el día anterior. Te sacaste la materia de encima y fuiste a final. En el medio te hiciste nuevos facuamigos igual de vagos que vos.'), stats: { conocimiento: -6, fama: 7 } },
      ]},
    ],
  },

  {
    codigo: 'gen_clase_embolante', ilustracion: 'profesor', categoria: 'generales', peso: 115, personaje: 'Teórico',
    titulo: T('Clase muy embolante'),
    texto: T('Cuarta hora de teórico y no entra nada.'),
    respuestas: [
      { texto: T('Dejás grabando el audio y te dormís. Si el profesor se da cuenta te podés ganar el odio de toda la cursada.'), efectos: [
        { peso: 50, texto: T('El profesor se da cuenta y te hace la vida imposible hasta el final. Recursás el cuatrimestre siguiente, pero en la otra cátedra.'), stats: { conocimiento: -10, fama: -8 } },
        { peso: 50, texto: T('El profesor se da cuenta pero le chupa un huevo. Es más: te ofrece un drive con los audios de todas las clases. Tu Samsung Pocket lo agradece y aprendés un montón.'), stats: { conocimiento: 13 } },
      ]},
      { texto: T('Te vas a comprar un café para remontarla.'), efectos: [
        { peso: 100, texto: T('El exquisito café de las máquinas del CeXso te hace efecto. La rompés. Y todo por 2000 pesos argensimios.'), stats: { conocimiento: 9, guita: -5 } },
      ]},
      { texto: T('Salís y hablás un rato con tu facuamigo que está haciendo tiempo.'), efectos: [
        { peso: 100, texto: T('Te cuenta que va a ser papá y que los pañales están muy caros. Volvés y le metés con todo a la clase: en un futuro esos pañales no se van a pagar solos.'), stats: { conocimiento: 9, fama: 5 } },
      ]},
    ],
  },

  {
    codigo: 'gen_pibe_boludeces', ilustracion: 'estudiante', categoria: 'generales', peso: 105, personaje: 'Práctico',
    titulo: T('El que no para de decir boludeces'),
    texto: T('Un pibe no para de decir boludeces en clase. El profesor ya no sabe cómo hacerle entender que está diciendo gansadas.'),
    respuestas: [
      { texto: T('Te hacés cargo y tirás un "mejor escuchemos la explicación del profesor".'), efectos: [
        { peso: 100, texto: G('Los demás te lo agradecen y el profesor también, aunque quedás medio chupamedias. El pibe no volvió a acotar nunca más en su vida.',
                              'Los demás te lo agradecen y el profesor también, aunque quedás medio chupamedias. El pibe no volvió a acotar nunca más en su vida.',
                              'Los demás te lo agradecen y el profesor también, aunque quedás medio chupamedias. El pibe no volvió a acotar nunca más en su vida.'),
          stats: { conocimiento: 9, fama: -5 } },
      ]},
      { texto: T('No decís nada. La mejor forma de aprender es equivocándose.'), efectos: [
        { peso: 100, texto: T('A la clase siguiente el pibe dejó la materia.'), stats: { conocimiento: 6 } },
      ]},
      { texto: T('Agarrás el fierro caliente y le explicás lo que está diciendo mal.'), efectos: [
        { peso: 100, texto: T('Vos también lo decís mal. El profesor abandona la cátedra por estar rodeado de pelotudos. Ahora es influencer de tarot marxista.'), stats: { conocimiento: -8, fama: -8 } },
      ]},
    ],
  },

  {
    codigo: 'gen_multimillonarios', ilustracion: 'profesor', categoria: 'generales', peso: 110, personaje: 'La profesora',
    titulo: T('¿Por qué siguen acumulando?'),
    texto: T('La profesora pregunta por qué los multimillonarios siguen acumulando pese a tener mucho dinero.'),
    respuestas: [
      { texto: T('"Para comer buena carne."'), efectos: [
        { peso: 100, texto: T('Boca, Perón y el Diego. La solución a la globalización es el nacionalismo.'), stats: { fama: 7, conocimiento: -6 } },
      ]},
      { texto: T('"Hay que expropiarlos a todos. Buscar un porqué me chupa un huevo."'), efectos: [
        { peso: 100, texto: T('Se notaron tus inclinaciones marxistas.'), stats: { politica: 12, conocimiento: -5 } },
      ]},
      { texto: T('"Para hacer fiestas gay con enanos."'), efectos: [
        { peso: 100, texto: T('Quisiste hacer un chiste y no salió. Los demás te miraron medio raro.'), stats: { fama: -8 } },
      ]},
      { texto: T('"Porque no saben hacer otra cosa que seguir el fetiche del dinero."'), efectos: [
        { peso: 100, texto: T('A la profe le cerró bastante tu respuesta y te lo hizo saber. Te motivaste y mejoraste tu desempeño.'), stats: { conocimiento: 13, politica: 6 } },
      ]},
    ],
  },

  {
    codigo: 'gen_manson', ilustracion: 'alerta', categoria: 'generales', peso: 100, personaje: 'Un compañero',
    titulo: T('El fan de Charles Manson'),
    texto: T('Un compañero te cuenta que está fanatizado con Charles Manson, que era un incomprendido social y que lo que hizo estaba bien.'),
    respuestas: [
      { texto: T('Ya se va a curar. Solo es medio raro.'), efectos: [
        { peso: 100, texto: T('Mató a un cheto medio hippie de Comunicación Social.'), stats: { fama: -8, politica: -7, violencia: 12 } },
      ]},
      { texto: T('Lo denunciás con las autoridades de la facultad.'), efectos: [
        { peso: 100, texto: T('Lo echan pero ni se entera de que fuiste vos. Ya lo sabía todo el mundo.'), stats: { politica: 10, fama: 5 } },
      ]},
      { texto: T('Armás un linchamiento sorpresa para tu amigo. La historia se repite.'), efectos: [
        { peso: 100, texto: T('Se zarpan y lo matan. Mejor que ser oprimido.'), stats: { fama: 9, politica: -9, conocimiento: -8, violencia: 25 },
          aviso: { evento: 'av_linchamiento', demora_min: 1, demora_max: 3 } },
      ]},
    ],
  },

  {
    codigo: 'gen_final_cinco', ilustracion: 'libro', categoria: 'generales', peso: 115, personaje: 'Mesa de final',
    titulo: T('Final a las cinco de la tarde'),
    texto: T('Tenés un final a las cinco, tenés el día libre y no sabés nada.'),
    respuestas: [
      { texto: T('Das la cara y sos sincero.'), efectos: [
        { peso: 50, texto: T('Zafaste: te pusieron ausente y no quedó registro de nada.'), stats: { conocimiento: 3 } },
        { peso: 50, texto: T('Te comiste un uno redondo.'), stats: { conocimiento: -8, fama: -6 } },
      ]},
      { texto: T('Video motivacional de Locomotora Oliveras, un mango loco y un resumen de sesenta páginas.'), efectos: [
        { peso: 80, texto: T('Te fue como el orto, pero las ganas de comerte el mundo no te las saca nadie.'), stats: { conocimiento: -5, fama: 7 } },
        { peso: 20, texto: T('La cafeína llegó al cerebro y saliste de la caverna, así como decía Platón. Accediste a las Ideas y a partir de ahora creés en la Matrix. Te sacaste un 10.'), stats: { conocimiento: 22, fama: 5 } },
      ]},
    ],
  },

  {
    codigo: 'gen_pity', ilustracion: 'noche', categoria: 'generales', peso: 105, personaje: 'Viernes',
    titulo: T('El after y el Pity'),
    texto: T('Cursás los sábados y no te quedan más faltas (sí, toman falta). El viernes salís pensando en ir pasado de rosca a cursar, pero tu amigo consigue un after. Y está el Pity.'),
    respuestas: [
      { texto: T('Me quedo libre pero conozco al Pity.'), gesto: 'der', efectos: [
        { peso: 100, texto: T('Homero tiene más valor social que toda la obra de Talcott Parsons. La foto con él se la mostrás hasta a los perros.'), stats: { fama: 13, conocimiento: -10 },
          aviso: { evento: 'av_pity', demora_min: 1, demora_max: 2 } },
      ]},
      { texto: T('Voy a cursar. No me queda otra.'), gesto: 'izq', efectos: [
        { peso: 100, texto: T('La próxima será. Cursaste con la cara hecha percha pero cursaste.'), stats: { conocimiento: 11, fama: -5 } },
      ]},
    ],
  },

  {
    codigo: 'gen_sala_radio', ilustracion: 'camara', categoria: 'generales', peso: 100, personaje: 'Subsuelo',
    titulo: T('La sala de radio'),
    texto: T('Pasás por la sala de radio y te das cuenta de que adentro hay dos del centro de estudiantes dándose masa. Tienen un candado aparte para asegurarse el telo.'),
    respuestas: [
      { texto: T('Los mandás al frente. Corrés el riesgo de que sea para un trabajo práctico.'), gesto: 'der', efectos: [
        { peso: 100, texto: G('Expusiste al CeXso y a las autoridades. Para el estudiantado quedaste como el espía del amor.',
                              'Expusiste al CeXso y a las autoridades. Para el estudiantado quedaste como la espía del amor.',
                              'Expusiste al CeXso y a las autoridades. Para el estudiantado quedaste como le espía del amor.'),
          stats: { fama: 11, politica: -7 } },
      ]},
      { texto: T('No soy vigilante. Además hay que subir la tasa de fecundidad.'), gesto: 'izq', efectos: [
        { peso: 100, texto: T('Sale a la luz por una foto: era un curso intensivo con aproximación realista a la educación sexual.'), stats: { politica: 10, fama: 4 } },
      ]},
    ],
  },

  // ===================================================================
  //  GUITA
  // ===================================================================
  {
    codigo: 'gui_hamburguesas', ilustracion: 'comida', categoria: 'guita', peso: 115, personaje: 'Oferta laboral',
    titulo: T('Turno noche en la hamburguesería'),
    texto: T('Te ofrecen un trabajo nocturno en una cadena muy conocida de hamburguesas. Por el horario capaz que hasta podés comerte alguna.'),
    respuestas: [
      { texto: T('Aceptás el laburo.'), gesto: 'der', efectos: [
        { peso: 75, texto: T('Ganás plata pero estás más cansado y perdés horas de cursada. Con lo recaudado comprás sanguchitos y café en el buffet.'), stats: { guita: 24, conocimiento: -10 } },
        { peso: 25, texto: T('Hacés una monografía para una materia contando el sistema de cooperación entre compañeros en el espacio de trabajo. Te ganaste el aplauso de los profesores.'), stats: { guita: 16, conocimiento: 3, fama: 5 } },
      ]},
      { texto: T('No lo aceptás.'), gesto: 'izq', efectos: [
        { peso: 100, texto: T('Seguís con la tuya, pero el mes viene finito.'), stats: { guita: -9, conocimiento: 6 } },
      ]},
    ],
  },

  {
    codigo: 'gui_feria_libro', ilustracion: 'libro', categoria: 'guita', peso: 105, personaje: 'Feria del Libro',
    titulo: T('El mega libro del titular'),
    texto: T('Un facuamigo te invita a la feria del libro. Entrás a un stand y ves ese mega libro sobre textos desconocidos del profesor de teóricos de tu materia favorita. Te fijás la billetera y no llegás ni financiado en doce cuotas.'),
    respuestas: [
      { texto: T('Te lo robás. Riesgo de que te vean.'), gesto: 'der', efectos: [
        { peso: 35, texto: T('Lo llevás a la clase, se lo mostrás, te lo firma y te suma al grupo de investigación.'), stats: { conocimiento: 17, fama: 9, politica: 6 },
          aviso: { evento: 'av_grupo_investigacion', demora_min: 1, demora_max: 3 } },
        { peso: 40, texto: T('Lo llevás a la clase, lo ve, le chupa un huevo y lo terminás vendiendo en Parque Centenario por la mitad de lo que sale nuevo.'), stats: { guita: 20, conocimiento: 4 } },
        { peso: 25, texto: T('Te vieron. El de seguridad te hizo vaciar la mochila delante de toda la fila.'), stats: { guita: -9, fama: -10 } },
      ]},
      { texto: T('No arriesgás: un libro de Ediciones Libertador y un pancho.'), gesto: 'izq', efectos: [
        { peso: 100, texto: T('El libro tiene la traducción hecha con los pies, pero algo entendiste. El pancho estaba bien.'), stats: { guita: -4, conocimiento: 7 } },
      ]},
    ],
  },

  {
    codigo: 'gui_campania', ilustracion: 'afiche', categoria: 'guita', fase: 'intermedio', peso: 130, personaje: 'Oferta misteriosa',
    titulo: T('La campaña del candidato'),
    texto: T('Vas por la mitad de la carrera y estás cansado de no poder subirte a ninguna porque no tenés un mango. En eso te acercan una oferta misteriosa: armarle la campaña electoral a un candidato ultra sanguinario de los derechos sociales. Pagan bien y podría ser el comienzo de una carrera política prolífica. Si se enteran tus facuamigos, es el entierro sepulcral.'),
    respuestas: [
      { texto: T('Agarrás el trabajo. Si no se enteran no pasa nada.'), efectos: [
        { peso: 65, texto: T('Nadie se enteró. Cobraste como nunca en tu vida.'), stats: { guita: 27, politica: 6 } },
        { peso: 35, texto: T('Alguien te vio saliendo del búnker. Por ahora no dijeron nada.'), stats: { guita: 27, politica: 6 },
          aviso: { evento: 'av_campania', demora_min: 1, demora_max: 3 } },
      ]},
      { texto: T('Eso es inmoral y no condice con mis ideales. Mi oportunidad ya llegará.'), efectos: [
        { peso: 100, texto: T('Te quedaste sin la plata y con la conciencia limpia. Se paga con fideos.'), stats: { guita: -10, politica: 10 } },
      ]},
      { texto: T('Entrás y lo saboteás desde adentro. Héroe o villano, no hay lugar para los tibios.'), efectos: [
        { peso: 50, texto: T('Saliste con la plata y con el spot arruinado. Te convertiste en leyenda de pasillo.'), stats: { guita: 16, politica: 18, fama: 11 } },
        { peso: 50, texto: T('Te descubrieron y desencadenaste una campaña sucia contra toda la facultad.'), stats: { guita: 11, politica: -11, fama: -10, violencia: 8 } },
      ]},
    ],
  },

  {
    codigo: 'gui_beca_viejo', ilustracion: 'plata', categoria: 'guita', fase: 'avanzado', peso: 140, personaje: 'Tu viejo',
    titulo: T('La beca y el despido'),
    texto: T('Momento cúlmine: estás a punto de conseguir una beca y tu viejo se queda sin laburo.'),
    respuestas: [
      { texto: T('Entrás a trabajar en McDonalds. La beca puede esperar un año.'), efectos: [
        { peso: 100, texto: T('Ayudás a la familia. La beca quizá no se repita nunca.'), stats: { conocimiento: -12, guita: 27 } },
      ]},
      { texto: T('Entrás a trabajar y encima te matás estudiando para llegar a la beca.'), efectos: [
        { peso: 100, texto: T('Te recomendaron dedicación total y presentaste un trabajo flojo. Defraudaste a la cátedra.'), stats: { conocimiento: -8, fama: -10, guita: 16 } },
      ]},
      { texto: T('Te peleás con tu familia a muerte.'), efectos: [
        { peso: 100, texto: T('Te mudaste a lo de tu abuela, a tres horas de la facultad, y quemaste sus ahorros para subsistir.'), stats: { guita: -13, conocimiento: 17 } },
      ]},
    ],
  },

  {
    codigo: 'gui_practicas', ilustracion: 'sobre', categoria: 'guita', peso: 105, personaje: 'Plan de estudios',
    titulo: T('Prácticas educativas'),
    texto: T('Tenés que completar las "Prácticas educativas" del nuevo plan de estudios.'),
    respuestas: [
      { texto: T('Las completás en una empresa.'), efectos: [
        { peso: 100, texto: T('En realidad te metieron precarizado en un call center. No aprendiste nada de la carrera, pero la experiencia te sirve para el CV. Te juran que cuando tengas el título te ponen en blanco.'), stats: { guita: 20, conocimiento: -10 } },
      ]},
      { texto: T('Hacés un taller de investigación con práctica territorial.'), efectos: [
        { peso: 100, texto: T('Hiciste un lindo informe pero te embarraste las zapatillas y, aunque las limpiaste con Vanish, se echaron a perder. Así es la calle, pibe.'), stats: { conocimiento: 17, guita: -7 } },
      ]},
    ],
  },

  {
    codigo: 'gui_oferta_mail', ilustracion: 'sobre', categoria: 'guita', peso: 105, personaje: 'Mail de la carrera',
    titulo: T('8 horas por $200.000'),
    texto: T('Llegó una oferta laboral al mail de la carrera: 8 horas por día, $200.000 al mes. Tenés el perfil perfecto para el puesto.'),
    respuestas: [
      { texto: T('Tirás el CV.'), gesto: 'der', efectos: [
        { peso: 30, texto: T('Quedaste. Ocho horas por día, pero algo se aprende.'), stats: { guita: 24, conocimiento: 6 } },
        { peso: 70, texto: T('No quedaste. Te dijeron que buscaban "más experiencia".'), stats: { guita: -7, conocimiento: 9 } },
      ]},
      { texto: T('No tirás. Lo bueno ya va a llegar.'), gesto: 'izq', efectos: [
        { peso: 100, texto: T('Seguís usando tus horas libres para leer a Durkheim.'), stats: { conocimiento: 13 } },
      ]},
    ],
  },

  // --- El único punto del juego donde se puede dejar la carrera ---
  {
    codigo: 'gui_beca_sarmiento', ilustracion: 'plata', categoria: 'guita', peso: 120, ronda_min: 6, personaje: 'Beca Sarmiento',
    titulo: T('No alcanza para nada'),
    texto: T('No aumentan la beca Sarmiento hace meses y no te alcanza para nada.'),
    notas_autor: 'Único evento con salida de la carrera (tercera respuesta).',
    respuestas: [
      { texto: T('Timbear en el sinoca de Puerto Madero. El rojo es tu mejor amigo.'), efectos: [
        { peso: 45, texto: T('Salió el rojo tres veces seguidas. Te fuiste con los bolsillos llenos y una sensación peligrosa.'), stats: { guita: 34, conocimiento: -5 } },
        { peso: 55, texto: T('Perdiste hasta la SUBE. Volviste caminando desde Puerto Madero.'), stats: { guita: -15, fama: -5 } },
      ]},
      { texto: T('A partir de ahora solo vas a comer empanadas de perro. Dicen que provocan amnesia.'), efectos: [
        { peso: 100, texto: T('Ahorrás una fortuna. El problema es que ya no te acordás de la unidad 3.'), stats: { guita: 16, conocimiento: -12 } },
      ]},
      { texto: T('Dejás la carrera. Estudiar es para los giles.'), efectos: [
        { peso: 100, termina_partida: true, es_abandono: true,
          texto: T('Firmaste la baja en cinco minutos. Afuera hacía sol y no te acordabas de la última vez que habías dormido bien.'),
          stats: { guita: 20 } },
      ]},
    ],
  },

  {
    codigo: 'gui_comedor', ilustracion: 'comida', categoria: 'guita', peso: 105, personaje: 'CeXso',
    titulo: T('Becas de trabajo en el comedor'),
    texto: T('Abren las postulaciones para las becas de trabajo en el comedor. Pero estás en contra de la conducción y tenés tuits bardeando al presidente del CeXso.'),
    respuestas: [
      { texto: T('Borrás todo y te hacés pasar por el militante más fiel de todos.'), efectos: [
        { peso: 100, texto: T('Entraste. Comés todos los días y te odiás un poco cada mediodía.'), stats: { guita: 20, politica: -9 } },
      ]},
      { texto: T('Entrás pero se la boqueás a todos. En una de esas te comés algún bife.'), efectos: [
        { peso: 100, texto: T('Duraste tres semanas, pero la anécdota te la contás solo.'), stats: { guita: 11, fama: 9, politica: -7, violencia: 5 } },
      ]},
      { texto: T('No comprás con el CeXso. Completás el formulario con los datos de tu mayor enemigo.'), efectos: [
        { peso: 100, texto: T('Se lo dieron a él. Ahora te ve todos los días desde atrás del mostrador.'), stats: { guita: -9, fama: 7, politica: -5 } },
      ]},
    ],
  },

  {
    codigo: 'gui_abuela', ilustracion: 'plata', categoria: 'guita', peso: 110, personaje: 'Tu nona',
    titulo: T('La plata de la nona'),
    texto: T('Tu abuela te dio plata para que te compraras los libros de la cursada. Ella lucha contra la muerte para verte con el título. Pero el mismo día un amigo te hace una oferta irresistible: las últimas entradas de reventa para el Gran Rex.'),
    respuestas: [
      { texto: T('El sentido de vivir es transitar la experiencia por sí misma. El título ya llegará.'), gesto: 'der', efectos: [
        { peso: 100, texto: T('Fue una noche irrepetible. Los libros los bajaste en PDF y nunca los abriste.'), stats: { guita: -13, conocimiento: -10, fama: 11 } },
      ]},
      { texto: T('Me parte al medio la nona. Lo hago más por ella que por mí.'), gesto: 'izq', efectos: [
        { peso: 100, texto: T('Compraste hasta el último apunte. Le mandaste una foto y la puso en la heladera.'), stats: { conocimiento: 17, guita: 7 } },
      ]},
    ],
  },

  // ===================================================================
  //  CONOCIMIENTO
  // ===================================================================
  {
    codigo: 'con_bici', ilustracion: 'bondi', categoria: 'conocimiento', fase: 'intermedio', peso: 125, personaje: 'Reventó el Roca',
    titulo: T('La bicicleta al costado de las vías'),
    texto: T('Reventó el Roca y tenés que llegar al recuperatorio. Ves una bicicleta tirada al costado de las vías. Está baqueteada pero hasta Constitución capaz que tira. Si no llegás tenés que recursar la materia, y es la que te falta para desbloquear optativas.'),
    respuestas: [
      { texto: T('Te arriesgás para llegar al parcial y robás la bici.'), efectos: [
        { peso: 100, texto: G('Linchamiento masivo. Los sentimientos reprimidos por el pueblo contra el gobierno se esparcen sobre tu cabeza. La cana no se mete para salvarte. De tantas piñas quedás tonto y borrás de tu cabeza todo lo que viste el último cuatrimestre. Te roban hasta las zapatillas.',
                              'Linchamiento masivo. Los sentimientos reprimidos por el pueblo contra el gobierno se esparcen sobre tu cabeza. La cana no se mete para salvarte. De tantas piñas quedás tonta y borrás de tu cabeza todo lo que viste el último cuatrimestre. Te roban hasta las zapatillas.',
                              'Linchamiento masivo. Los sentimientos reprimidos por el pueblo contra el gobierno se esparcen sobre tu cabeza. La cana no se mete para salvarte. De tantas piñas quedás tonte y borrás de tu cabeza todo lo que viste el último cuatrimestre. Te roban hasta las zapatillas.'),
          stats: { guita: -10, conocimiento: -18, violencia: 10 } },
      ]},
      { texto: T('Emprendés un discurso a viva voz demostrando todo lo que leíste.'), efectos: [
        { peso: 40, texto: G('La gente te sigue y te convertís en un líder genuino de la clase obrera.',
                             'La gente te sigue y te convertís en una líder genuina de la clase obrera.',
                             'La gente te sigue y te convertís en un liderazgo genuino de la clase obrera.'),
          stats: { fama: 13, conocimiento: 17, politica: 18 } },
        { peso: 60, texto: T('La gente te ignora y una señora al pasar te suelta un "zurdo de mierda" con garso incluido. Te tragás la frustración y mejorás la oratoria.'), stats: { fama: -8, conocimiento: 9 } },
      ]},
    ],
  },

  {
    codigo: 'con_porro', ilustracion: 'noche', categoria: 'conocimiento', peso: 110, personaje: 'Tu compa',
    titulo: T('El porro antes del final'),
    texto: G('Te quedás estudiando hasta tarde con tu compa. Te nota muy tenso y saca algo que te podría ayudar: un porro. No fumaste nunca en tu vida.',
             'Te quedás estudiando hasta tarde con tu compa. Te nota muy tensa y saca algo que te podría ayudar: un porro. No fumaste nunca en tu vida.',
             'Te quedás estudiando hasta tarde con tu compa. Te nota muy tense y saca algo que te podría ayudar: un porro. No fumaste nunca en tu vida.'),
    respuestas: [
      { texto: T('Fumar.'), gesto: 'der', efectos: [
        { peso: 50, texto: T('Te relaja y potencia tus conocimientos. Al otro día entrás a rendir relajado e imparable.'), stats: { conocimiento: 17 } },
        { peso: 50, texto: T('Pegó mal y terminaste vomitando. Quedaste de cama toda la noche recordando a tu ex. Al otro día, en el examen, no pensabas en otra cosa que en cuando salían a tomar helado.'), stats: { conocimiento: -10, fama: -5 } },
      ]},
      { texto: T('Vas a la segura y lidiás con los nervios a la antigua.'), gesto: 'izq', efectos: [
        { peso: 50, texto: T('Al otro día no te fue tan bien por el cagazo. Aprobaste, pero vas a final.'), stats: { conocimiento: -6 } },
        { peso: 50, texto: G('De tanto nervio quedaste hecho agua y no podías parar de cagarte. No llegaste a concentrarte y encima quedaste como el pedorro de Sociales: el titular largó un "abran las ventanas, no puede haber tanto olor a mierda".',
                             'De tanto nervio quedaste hecha agua y no podías parar de cagarte. No llegaste a concentrarte y encima quedaste como la pedorra de Sociales: el titular largó un "abran las ventanas, no puede haber tanto olor a mierda".',
                             'De tanto nervio quedaste hecho agua y no podías parar de cagarte. No llegaste a concentrarte y encima quedaste como le pedorre de Sociales: el titular largó un "abran las ventanas, no puede haber tanto olor a mierda".'),
          stats: { fama: -12 } },
      ]},
    ],
  },

  {
    codigo: 'con_autor_raro', ilustracion: 'libro', categoria: 'conocimiento', peso: 115, personaje: 'Bibliografía',
    titulo: T('El autor del que nadie habla'),
    texto: T('Te anotaste a cuatro materias este cuatrimestre y no podés con tu vida. En medio de la bibliografía obligatoria encontraste un autor raro del que nadie habla. Te fascina y querés meterte a leer todos sus libros.'),
    respuestas: [
      { texto: T('La curiosidad es más grande que vos. No podés negar tu instinto.'), efectos: [
        { peso: 50, texto: T('Dejaste todo por lo que te emocionaba. El titular te apadrinó. Aprobaste una materia de cuatro, pero tenés asegurado el carguito de profe de práctico para cuando te recibas. En una de esas escribís un libro.'), stats: { conocimiento: 17, politica: 12 } },
        { peso: 50, texto: G('Le metiste a full pero te pinchaste. Te diste cuenta de por qué no le daban tanta pelota en la academia. De igual manera estás orgulloso de vos: nunca habías sido tan valiente por algo en lo que creías.',
                             'Le metiste a full pero te pinchaste. Te diste cuenta de por qué no le daban tanta pelota en la academia. De igual manera estás orgullosa de vos: nunca habías sido tan valiente por algo en lo que creías.',
                             'Le metiste a full pero te pinchaste. Te diste cuenta de por qué no le daban tanta pelota en la academia. De igual manera estás orgullose de vos: nunca habías sido tan valiente por algo en lo que creías.'),
          stats: { politica: 10, conocimiento: 7 } },
      ]},
      { texto: T('La prioridad es aprobar. Cuanto antes te egreses, antes vas a poder investigar lo que quieras.'), efectos: [
        { peso: 80, texto: T('No lo retomaste y murió en el olvido.'), stats: { conocimiento: -8 } },
        { peso: 20, texto: T('Lo retomaste en el verano e hiciste una monografía. Lo bueno sabe esperar.'), stats: { conocimiento: 13 } },
      ]},
      { texto: T('Escribís un artículo reducido para un fanzine boludo que circula por la facultad.'), efectos: [
        { peso: 100, texto: T('Te interesa, pero dedicarle tanto esfuerzo te pareció al pedo. Igual lo leyó bastante gente.'), stats: { fama: 9 } },
      ]},
    ],
  },

  {
    codigo: 'con_monografia', ilustracion: 'profesor', categoria: 'conocimiento', peso: 110, personaje: 'La titular',
    titulo: T('La monografía que no pediste'),
    texto: G('La profesora titular está encantada con vos. Quiere que escribas una monografía sobre uno de los libros que vieron en la materia. Te fue bien, pero a vos en realidad te chupa medio un huevo.',
             'La profesora titular está encantada con vos. Quiere que escribas una monografía sobre uno de los libros que vieron en la materia. Te fue bien, pero a vos en realidad te chupa medio un huevo.',
             'La profesora titular está encantada con vos. Quiere que escribas una monografía sobre uno de los libros que vieron en la materia. Te fue bien, pero a vos en realidad te chupa medio un huevo.'),
    respuestas: [
      { texto: T('Lo hacés para no dejarla en banda.'), efectos: [
        { peso: 100, texto: T('Capaz que ahora no, pero a la larga te puede acercar a los temas que te interesan.'), stats: { conocimiento: -6, fama: 9 } },
      ]},
      { texto: T('Le decís que sí pero lo pateás.'), efectos: [
        { peso: 100, texto: T('Lo olvidaste completamente. Era una prueba encubierta para recomendarte a una beca. La próxima será.'), stats: { conocimiento: -8, politica: -9 } },
      ]},
      { texto: T('Le decís que no, que en realidad no estás interesado.'), efectos: [
        { peso: 50, texto: T('La charla termina desencadenando en un tema que sí te interesa y te pasa el contacto de alguien que te podría ayudar. Te agradece por haber sido sincero.'), stats: { fama: 7, politica: 10 } },
        { peso: 50, texto: T('"En esta facultad todos hablan pero nadie quiere laburar", suelta, y se va. No te volvió a hablar ni para saludarte.'), stats: { fama: -8, politica: -7 } },
      ]},
    ],
  },

  {
    codigo: 'con_hambre', ilustracion: 'comida', categoria: 'conocimiento', peso: 110, personaje: 'Después del teórico',
    titulo: T('Cuatro horas de teórico y una lija tremenda'),
    texto: G('Venís de un teórico de cuatro horas y todavía te falta cursar el práctico. Estás limado y tenés una lija tremenda.',
             'Venís de un teórico de cuatro horas y todavía te falta cursar el práctico. Estás limada y tenés una lija tremenda.',
             'Venís de un teórico de cuatro horas y todavía te falta cursar el práctico. Estás limade y tenés una lija tremenda.'),
    respuestas: [
      { texto: T('Dos empanadas de carne y una de cheeseburger en el Rip Pizza de la esquina.'), efectos: [
        { peso: 50, texto: T('Te intoxicaste y te internaron. A la semana salió la noticia: estas cadenas usaban un combinado de carne perruna y humana para las empanadas. Perdiste un cuatrimestre entero.'), stats: { conocimiento: -18, fama: 11, guita: -7 } },
        { peso: 50, texto: T('Zafaste. Estaban baratas y llegaste al práctico con la panza llena y la cabeza en otro lado.'), stats: { guita: 7, conocimiento: -3 } },
      ]},
      { texto: T('Le hacés caso al señor misterioso de la puerta. Pancito relleno caliente.'), efectos: [
        { peso: 100, texto: G('A los cinco minutos el señor se ganó el Quini y te regala dos panes más. Te sentís Jesús: la suerte se reparte. Vas al práctico y la rompés todita. Te convertís en el favorito de la profe.',
                              'A los cinco minutos el señor se ganó el Quini y te regala dos panes más. Te sentís Jesús: la suerte se reparte. Vas al práctico y la rompés todita. Te convertís en la favorita de la profe.',
                              'A los cinco minutos el señor se ganó el Quini y te regala dos panes más. Te sentís Jesús: la suerte se reparte. Vas al práctico y la rompés todita. Te convertís en le favorite de la profe.'),
          stats: { conocimiento: 13, guita: 11, politica: 10 } },
      ]},
      { texto: T('Comés en el comedor del centro.'), efectos: [
        { peso: 100, texto: T('La que atiende te empieza a preguntar por tu situación académica y te habla de la crisis nacional que ya conocés. No sabés cómo fugarte y te perdés todo el práctico. Ahora no sabés qué entra en el parcial.'), stats: { guita: -4, conocimiento: -10, politica: 12 } },
      ]},
    ],
  },

  // ===================================================================
  //  FAMA
  // ===================================================================
  {
    codigo: 'fam_murales', ilustracion: 'afiche', categoria: 'fama', peso: 115, personaje: 'Hall',
    titulo: T('Vinieron a tapar los murales'),
    texto: T('Entraron unos libertarios a tapar murales.'),
    respuestas: [
      { texto: T('Pegar trompadas. Riesgo de sanción.'), efectos: [
        { peso: 100, texto: G('Te suspendieron por boludo, pero sos el héroe del progresismo en las redes sociales. Perdiste un cuatrimestre.',
                              'Te suspendieron por boluda, pero sos la heroína del progresismo en las redes sociales. Perdiste un cuatrimestre.',
                              'Te suspendieron por boludo, pero sos le héroe del progresismo en las redes sociales. Perdiste un cuatrimestre.'),
          stats: { fama: 13, politica: 12, conocimiento: -15, violencia: 15 } },
      ]},
      { texto: T('Vas al patio gay a rezar.'), efectos: [
        { peso: 100, texto: G('No sirvió de nada, pero te convertiste en mártir gay porque un estudiante de Comu te grabó.',
                              'No sirvió de nada, pero te convertiste en mártir gay porque un estudiante de Comu te grabó.',
                              'No sirvió de nada, pero te convertiste en mártir gay porque un estudiante de Comu te grabó.'),
          stats: { fama: 11, conocimiento: 9, politica: 10 } },
      ]},
      { texto: T('Vas a estudiar para el parcial de Nocera. Todavía te faltan 22 autores.'), efectos: [
        { peso: 100, texto: G('No llegaste a estudiar todo y encima sos cagón.',
                              'No llegaste a estudiar todo y encima sos cagona.',
                              'No llegaste a estudiar todo y encima sos cagone.'),
          stats: { conocimiento: -8, fama: -8 } },
      ]},
    ],
  },

  {
    codigo: 'fam_noteros', ilustracion: 'camara', categoria: 'fama', peso: 115, personaje: 'Móvil de TV',
    titulo: T('Los noteros'),
    texto: T('Vienen unos noteros a la facultad a preguntar por la situación universitaria.'),
    respuestas: [
      { texto: T('Ponés la cara.'), gesto: 'der', efectos: [
        { peso: 50, texto: T('Tartamudeaste y no respondiste la pregunta del conductor más facho del país. Dejaste a los universitarios como unos boludos y el video recorrió todos los medios por tres días.'), stats: { fama: 11, politica: -9 } },
        { peso: 50, texto: G('Ponés la cara y la rompés. Te convertís en el chad de Sociales. Algunos te dicen que sos un capo cuando te ven pasar y te llaman de otros medios.',
                             'Ponés la cara y la rompés. Te convertís en la chad de Sociales. Algunos te dicen que sos una capa cuando te ven pasar y te llaman de otros medios.',
                             'Ponés la cara y la rompés. Te convertís en le chad de Sociales. Algunos te dicen que sos une cape cuando te ven pasar y te llaman de otros medios.'),
          stats: { fama: 13, politica: 12 } },
      ]},
      { texto: T('Seguís de largo. Mejor que hable otro.'), gesto: 'izq', efectos: [
        { peso: 100, texto: T('No sumaste ni restaste puntos. Nadie se acordó de nada.'), stats: {} },
      ]},
    ],
  },

  {
    codigo: 'fam_acosador', ilustracion: 'multitud', categoria: 'fama', peso: 120, personaje: 'Los grupos',
    titulo: T('El día de la expulsión'),
    texto: T('Hace un tiempo que se viene hablando de un acosador dentro de la facultad. En los grupos ya se organizaron y se dictaminó el día en que será expulsado.'),
    respuestas: [
      { texto: T('Te parás adelante de la movilización y lo llevás de los pelos hasta la comisaría.'), efectos: [
        { peso: 100, texto: G('La fama es fama venga de quien venga. Te hiciste famoso: amado y odiado por ambos lados.',
                              'La fama es fama venga de quien venga. Te hiciste famosa: amada y odiada por ambos lados.',
                              'La fama es fama venga de quien venga. Te hiciste famose: amade y odiade por ambos lados.'),
          stats: { fama: 13, violencia: 10 } },
      ]},
      { texto: T('Te parás en el vértice y formás parte del grupo que lo atrapa.'), efectos: [
        { peso: 100, texto: T('Le gritaste alguna cosa pero no mucho más. Generaste confraternidad entre compañeros y terminaste haciendo amigos que respiran como vos el aire de la venganza social.'), stats: { politica: 12, fama: 7, violencia: 5 } },
      ]},
      { texto: T('Te desentendés del caso. Seguro son las feministas con sus cuentos.'), efectos: [
        { peso: 100, texto: T('En esta facultad no estudia nadie, pensás. Nadie te lo dijo en la cara, pero se notó.'), stats: { politica: -9, fama: -10 } },
      ]},
    ],
  },

  {
    codigo: 'fam_pucho', ilustracion: 'noche', categoria: 'fama', peso: 100, personaje: '23:00',
    titulo: T('El pucho de la salida'),
    texto: T('Salís a las 23 de cursar y te querés fumar un pucho. ¿Vas a...?'),
    respuestas: [
      { texto: T('La plaza seca.'), gesto: 'izq', efectos: [
        { peso: 100, texto: T('Te quedaste charlando con unos militantes que te invitaron al día siguiente a una actividad que te copó.'), stats: { politica: 12 } },
      ]},
      { texto: T('El patio gay.'), gesto: 'der', efectos: [
        { peso: 100, texto: G('Mientras fumabas viste que algo se movía. Prendés la linterna del celular y lo ves a Adorno en una mesa jugando al póker con el director de Comu. "¿Qué te pasa, pibe? ¿Te debo algo?", dice el enano. Al otro día lo contás: nadie te cree, pero a todos les gusta la historia. Pasás a ser "el loco del enano".',
                              'Mientras fumabas viste que algo se movía. Prendés la linterna del celular y lo ves a Adorno en una mesa jugando al póker con el director de Comu. "¿Qué te pasa, pibe? ¿Te debo algo?", dice el enano. Al otro día lo contás: nadie te cree, pero a todos les gusta la historia. Pasás a ser "la loca del enano".',
                              'Mientras fumabas viste que algo se movía. Prendés la linterna del celular y lo ves a Adorno en una mesa jugando al póker con el director de Comu. "¿Qué te pasa, pibe? ¿Te debo algo?", dice el enano. Al otro día lo contás: nadie te cree, pero a todos les gusta la historia. Pasás a ser "le loque del enano".'),
          stats: { fama: 13 } },
      ]},
    ],
  },

  {
    codigo: 'fam_huella', ilustracion: 'afiche', categoria: 'fama', peso: 110, personaje: 'Vos',
    titulo: T('Dejar una huella'),
    texto: G('Tenés miedo de pasar por la facultad sin pena ni gloria. Te gustaría dejar una huella, ser recordado por algo. Tenés que inventar algo para remontarla.',
             'Tenés miedo de pasar por la facultad sin pena ni gloria. Te gustaría dejar una huella, ser recordada por algo. Tenés que inventar algo para remontarla.',
             'Tenés miedo de pasar por la facultad sin pena ni gloria. Te gustaría dejar una huella, ser recordade por algo. Tenés que inventar algo para remontarla.'),
    respuestas: [
      { texto: T('"Revivamos el pos-porno."'), efectos: [
        { peso: 100, texto: T('Te ponés a hacer perfos y a flashearla artística. Hay gente que piensa que es ridículo, otros tienen miedo de que haya problemas con el gobierno, y otros se convierten en tus fans. Giro y sigo.'), stats: { fama: 13, politica: -7 } },
      ]},
      { texto: T('"Hagamos una revista provocadora."'), efectos: [
        { peso: 100, texto: T('Hacés tu propio fanzine y tus artículos generan controversia por el nivel de delirio: proponés arancelar los baños, poner molinetes en la biblioteca y suspender el buffet. Ahora las agrupaciones te dicen lumpen.'), stats: { politica: 12, fama: -8 } },
      ]},
      { texto: T('"Ser apadrinado por un profesor reconocido."'), efectos: [
        { peso: 100, texto: T('Te quedás charlando al final de las clases, te sumás al grupo de estudios y escribís un par de artículos.'), stats: { conocimiento: 17, fama: -8 } },
      ]},
    ],
  },

  {
    codigo: 'fam_asamblea', ilustracion: 'multitud', categoria: 'fama', peso: 115, personaje: 'Asamblea',
    titulo: T('¿Te anotás para hablar?'),
    texto: T('Vas a una asamblea. Escuchás lo que dicen pero nada te convence del todo.'),
    respuestas: [
      { texto: T('Sí, me anoto.'), gesto: 'der', efectos: [
        { peso: 50, texto: T('La rompiste toda. Te aplaudieron de pie y saliste con tres propuestas aprobadas.'), stats: { fama: 11, politica: 14, guita: -4 } },
        { peso: 50, texto: T('Dijiste cualquier cosa y encima te rascaste la verga delante de todos sin darte cuenta. Los memes van a quedar para la posteridad. Te defendés diciendo que es IA.'), stats: { fama: 13, politica: -9, conocimiento: -8 } },
      ]},
      { texto: T('No, dejar pasar.'), gesto: 'izq', efectos: [
        { peso: 100, texto: T('Te fuiste temprano y llegaste a hacer las compras.'), stats: { guita: 11, politica: -7, conocimiento: -5, fama: -5 } },
      ]},
    ],
  },

  // ===================================================================
  //  POLÍTICA
  // ===================================================================
  {
    codigo: 'pol_agrupaciones', ilustracion: 'afiche', categoria: 'politica', fase: 'ingresante', peso: 130, personaje: 'Mesas del hall',
    titulo: T('¿En cuál militás?'),
    texto: T('Te invitan a militar en diferentes agrupaciones.'),
    respuestas: [
      { texto: T('Variante Universitaria.'), efectos: [
        { peso: 100, texto: T('Reuniones los martes y una caja de resistencia que funciona sorprendentemente bien.'), stats: { politica: 14, guita: 14 } },
      ]},
      { texto: T('La UElla.'), efectos: [
        { peso: 100, texto: T('Mucha calle, mucho megáfono y una cuenta de Instagram que crece rápido.'), stats: { politica: 14, fama: 9 } },
      ]},
      { texto: T('F.O.S.: Fulbito de los Obreros Sindicalistas.'), efectos: [
        { peso: 100, texto: T('Se juega los domingos y se lee a Gramsci los miércoles. No sobra un peso.'), stats: { politica: 14, conocimiento: 11, guita: -7 } },
      ]},
      { texto: T('No curtís ese mambo. Sos un intelectual de libre pensamiento.'), efectos: [
        { peso: 100, texto: T('Te movés tranqui piola sin berre. Nadie te va a buscar para nada.'), stats: { politica: -9, fama: -8, guita: 11 } },
      ]},
    ],
  },

  {
    codigo: 'pol_olla', ilustracion: 'comida', categoria: 'politica', peso: 115, personaje: 'Olla popular',
    titulo: T('Faltan fideos'),
    texto: T('Un facuamigo te invita a participar de la olla popular que él lidera los jueves. Hizo mal el cálculo y faltan fideos.'),
    respuestas: [
      { texto: T('Lo salís a bancar y cubrís el costo a medias. Es por una buena causa.'), efectos: [
        { peso: 70, texto: T('Te quedaste sin plata para cargar la SUBE y tuviste que saltar el molinete y correr. Quedaste como el héroe de la gente y de tu amigo.'), stats: { guita: -10, fama: 11 } },
        { peso: 30, texto: T('Caíste detenido y saliste en un spot publicitario de las fuerzas de seguridad.'), stats: { guita: -13, fama: -12, politica: 6 } },
      ]},
      { texto: T('Donde comen dos comen tres. Proponés repartir porciones más chicas.'), efectos: [
        { peso: 100, texto: T('Comieron todos. Nadie se fue con hambre y nadie puso un peso de más.'), stats: { politica: 14 } },
      ]},
      { texto: T('Mandás al frente a tu amigo. Creés que lo hizo a propósito para que pongas plata.'), efectos: [
        { peso: 100, texto: T('No volviste a sumarte a una movida así. Es para quilombo.'), stats: { fama: -15, politica: -7 } },
      ]},
    ],
  },

  {
    codigo: 'pol_aula_oscura', ilustracion: 'facultad', categoria: 'politica', peso: 105, personaje: 'Subsuelo',
    titulo: T('Los rumores eran ciertos'),
    texto: T('Escuchaste un ruido extraño en un aula oscura del subsuelo. Mirás adentro y no podés creer lo que ves: una militante del Ya Casta cerrando un trato con la trieja de Lilita Carrió, Guillermo Moreno y Lilia Lemoine.'),
    respuestas: [
      { texto: T('Sacás una foto y la hacés pública.'), gesto: 'der', efectos: [
        { peso: 100, texto: G('La agrupación se desintegra en una marea roja de sangre y decepción. Quedás como el estudiante que hizo lo que nadie pudo, y todos te quieren de su lado.',
                              'La agrupación se desintegra en una marea roja de sangre y decepción. Quedás como la estudiante que hizo lo que nadie pudo, y todos te quieren de su lado.',
                              'La agrupación se desintegra en una marea roja de sangre y decepción. Quedás como le estudiante que hizo lo que nadie pudo, y todos te quieren de su lado.'),
          stats: { politica: 18, fama: 9 } },
      ]},
      { texto: T('Entrás y te miran.'), gesto: 'izq', efectos: [
        { peso: 100, texto: T('"Vamos mitad y mitad y acá no pasó nada, muchachos." Te llenás los bolsillos, Carrió te convida un pucho, el Guillote te palmea la espalda y Lilia te invita un clona. Todos felices.'), stats: { guita: 27, politica: -11 } },
      ]},
    ],
  },

  {
    codigo: 'pol_elecciones', ilustracion: 'multitud', categoria: 'politica', peso: 115, personaje: 'Elecciones',
    titulo: T('El ejército de militantes'),
    texto: T('Época de elecciones. Llegás a la facultad y ves un ejército de militantes listos para implorarte por tu voto.'),
    respuestas: [
      { texto: T('Les decís a todos que ya votaste.'), efectos: [
        { peso: 100, texto: T('Llegaste temprano a clase por primera vez en el cuatrimestre.'), stats: { conocimiento: 11, politica: -7 } },
      ]},
      { texto: T('Te quedás escuchando a cada uno.'), efectos: [
        { peso: 100, texto: T('Llegaste tarde a la cursada y te dolía la cabeza, pero ahora te conocen todos los apellidos.'), stats: { conocimiento: -8, politica: 14 } },
      ]},
      { texto: T('Te quedás callado.'), efectos: [
        { peso: 100, texto: G('Se pusieron a discutir entre ellos, dos pibas se agarraron de las mechas y las tuviste que separar. Llegaste tarde a clase, pero ahora sos el domador de militantes.',
                              'Se pusieron a discutir entre ellos, dos pibas se agarraron de las mechas y las tuviste que separar. Llegaste tarde a clase, pero ahora sos la domadora de militantes.',
                              'Se pusieron a discutir entre ellos, dos pibas se agarraron de las mechas y las tuviste que separar. Llegaste tarde a clase, pero ahora sos le domadore de militantes.'),
          stats: { conocimiento: -8, fama: 11 } },
      ]},
    ],
  },

  {
    codigo: 'pol_pasadas_practico', ilustracion: 'multitud', categoria: 'politica', peso: 105, personaje: 'Práctico',
    titulo: T('Cuatro agrupaciones al hilo'),
    texto: T('Pasan cuatro agrupaciones al hilo en el práctico. Para colmo, en el aula son solo vos y el docente.'),
    respuestas: [
      { texto: T('Sos un estudiante comprometido con la ultra-seria militancia universitaria.'), efectos: [
        { peso: 100, texto: T('Acá es donde empieza el cambio del mundo. Esos dispensers de agua no se van a poner solos.'), stats: { politica: 14 } },
      ]},
      { texto: T('Te hacés el NPC y asentís con la cabeza.'), efectos: [
        { peso: 100, texto: T('En realidad estabas soñando con acariciarle la pelada a Foucault.'), stats: { politica: -7, conocimiento: 6 } },
      ]},
      { texto: T('Hacés notar tu molestia. Alto apático.'), efectos: [
        { peso: 100, texto: T('Una agrupación se enojó y sacó un reel: "Denunciamos un nuevo ataque fascista...".'), stats: { politica: -9, fama: -8 } },
      ]},
    ],
  },

  {
    codigo: 'pol_pasadas', ilustracion: 'estudiante', categoria: 'politica', peso: 105, personaje: 'Una compañera',
    titulo: T('Hacer pasadas'),
    texto: G('Una compañera te invita a hacer pasadas con ella. Te da un poco de vergüenza pero te parece copada y quizás sea una experiencia divertida.',
             'Una compañera te invita a hacer pasadas con ella. Te da un poco de vergüenza pero te parece copada y quizás sea una experiencia divertida.',
             'Une compañere te invita a hacer pasadas. Te da un poco de vergüenza pero te parece copade y quizás sea una experiencia divertida.'),
    respuestas: [
      { texto: T('Te sumás a todas.'), efectos: [
        { peso: 100, texto: G('Hiciste 40 pasadas al hilo. Sucumbiste ante la alienación política y te convertiste en un autómata: ahora solo podés repetir el mismo discurso una y otra vez.',
                              'Hiciste 40 pasadas al hilo. Sucumbiste ante la alienación política y te convertiste en una autómata: ahora solo podés repetir el mismo discurso una y otra vez.',
                              'Hiciste 40 pasadas al hilo. Sucumbiste ante la alienación política y te convertiste en une autómate: ahora solo podés repetir el mismo discurso una y otra vez.'),
          stats: { politica: 18, conocimiento: -10, fama: 9 } },
      ]},
      { texto: T('No comprás ni ahí.'), efectos: [
        { peso: 100, texto: T('Te fuiste a la biblioteca y aprovechaste las dos horas.'), stats: { fama: -8, politica: -7, conocimiento: 11 } },
      ]},
      { texto: T('Accedés a hacer las pasadas.'), efectos: [
        { peso: 100, texto: T('A la tercera pasada te confiesa que le chupa un huevo. Pela un porro y van a la plaza seca a escuchar a Los Redondos. Te revela que en realidad era Duki Green Son.'), stats: { fama: 11, politica: 6, conocimiento: -5 } },
      ]},
    ],
  },

  // ===================================================================
  //  AVISOS — 1 sola respuesta, consumen ronda.
  //  "Avisos sobre el avance de decisiones pasadas".
  // ===================================================================
  {
    codigo: 'av_campania', ilustracion: 'alerta', tipo: 'aviso', peso: 0, personaje: 'Grupo de la carrera',
    titulo: T('Aviso'),
    texto: T('Alguien subió al grupo de la comisión una foto tuya saliendo del búnker del candidato. Tiene 140 reacciones y ningún comentario amable.'),
    respuestas: [
      { texto: T('Silenciar el grupo'), efectos: [
        { peso: 100, texto: T('No contestaste nada. Igual todos saben.'), stats: { fama: -12, politica: -9 } },
      ]},
    ],
  },

  {
    codigo: 'av_pity', ilustracion: 'camara', tipo: 'aviso', peso: 0, personaje: 'Instagram',
    titulo: T('Aviso'),
    texto: G('La foto con el Pity la levantó una cuenta de memes de la facultad. Doce mil likes. Ahora sos "el pibe del after".',
             'La foto con el Pity la levantó una cuenta de memes de la facultad. Doce mil likes. Ahora sos "la piba del after".',
             'La foto con el Pity la levantó una cuenta de memes de la facultad. Doce mil likes. Ahora sos "le pibe del after".'),
    respuestas: [
      { texto: T('Ponerla de foto de perfil'), efectos: [
        { peso: 100, texto: T('Te reconocen en el buffet. Ningún docente te toma en serio nunca más.'), stats: { fama: 11, conocimiento: -6 } },
      ]},
    ],
  },

  {
    codigo: 'av_grupo_investigacion', ilustracion: 'libro', tipo: 'aviso', peso: 0, personaje: 'El titular',
    titulo: T('Aviso'),
    texto: T('El grupo de investigación al que te sumaron presentó un proyecto y te pusieron como colaborador. Salió publicado con tu apellido.'),
    respuestas: [
      { texto: T('Mandárselo a tu vieja'), efectos: [
        { peso: 100, texto: T('Lo imprimió y lo puso en la heladera, al lado de las facturas.'), stats: { conocimiento: 13, fama: 7, politica: 6 } },
      ]},
    ],
  },

  {
    codigo: 'av_linchamiento', ilustracion: 'alerta', tipo: 'aviso', peso: 0, personaje: 'Dirección de carrera',
    titulo: T('Aviso'),
    texto: T('Abrieron una investigación interna por lo que pasó. Citaron a doce personas. Vos estás en la lista.'),
    respuestas: [
      { texto: T('Ir a la citación'), efectos: [
        { peso: 100, texto: T('Nadie declaró nada y el expediente quedó dando vueltas. En el pasillo ya no te saluda casi nadie.'), stats: { fama: -10, politica: -7, violencia: 5 } },
      ]},
    ],
  },
];

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
      { codigo: 'exito',   min: 70, max: 100, texto: T('Aplauso cerrado.'),                  stats: { politica: 14, fama: 9 } },
      { codigo: 'parcial', min: 35, max: 69,  texto: T('Aplauso tibio.'),                    stats: { politica: 5, fama: 3 } },
      { codigo: 'fallo',   min: 0,  max: 34,  texto: T('Te seguiste de largo y se fueron.'), stats: { politica: -5, fama: -6 } },
    ],
  },

  {
    codigo: 'mj_memotest', ilustracion: 'libro', mecanica: 'memotest',
    nombre: 'Memo test de autores',
    descripcion: 'Encontrá los pares antes de gastar todos los intentos.',
    instrucciones: T('Dale vuelta las fichas de a dos y encontrá los pares.'),
    fases: ['ingresante', 'intermedio', 'avanzado'],
    // Los símbolos son códigos de RETRATOS en public/ilustraciones.js
    config: { pares: 4, columnas: 4, simbolos: ['belgrano', 'sarmiento', 'che', 'evita'] },
    resultados: [
      { codigo: 'exito',   min: 80, max: 100, texto: T('Te acordás hasta de los apellidos con tilde.'), stats: { conocimiento: 15 } },
      { codigo: 'parcial', min: 40, max: 79,  texto: T('La mitad te quedó.'),                           stats: { conocimiento: 7 } },
      { codigo: 'fallo',   min: 0,  max: 39,  texto: T('En blanco total.'),                             stats: { conocimiento: -5 } },
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
      { codigo: 'exito',   min: 80, max: 100, texto: T('Lo leíste en el original y encima entendiste.'), stats: { conocimiento: 15, fama: 4 } },
      { codigo: 'parcial', min: 40, max: 79,  texto: T('Media traducción y mucho contexto inventado.'),  stats: { conocimiento: 7 } },
      { codigo: 'fallo',   min: 0,  max: 39,  texto: T('Lo pasaste por el traductor y quedó peor.'),     stats: { conocimiento: -5, fama: -3 } },
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
      { codigo: 'exito',   min: 80, max: 100, texto: T('Las tres al hilo. Ojo clínico.'),          stats: { conocimiento: 13, fama: 4 } },
      { codigo: 'parcial', min: 40, max: 79,  texto: T('Encontraste alguna y te cansaste.'),       stats: { conocimiento: 6 } },
      { codigo: 'fallo',   min: 0,  max: 39,  texto: T('Miraste la hoja veinte minutos sin ver.'), stats: { conocimiento: -4 } },
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
      { codigo: 'exito',   min: 70, max: 100, texto: T('Entregaste con tiempo de sobra.'),       stats: { conocimiento: 13, fama: 4 } },
      { codigo: 'parcial', min: 35, max: 69,  texto: T('Aprobaste raspando.'),                   stats: { conocimiento: 6 } },
      { codigo: 'fallo',   min: 0,  max: 34,  texto: T('Se te acabó el tiempo con media hoja.'), stats: { conocimiento: -4, fama: -3 } },
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
      { codigo: 'exito',   min: 80, max: 100, texto: T('Ni una falta de ortografía. El titular te miró distinto.'), stats: { conocimiento: 18, fama: 5 } },
      { codigo: 'parcial', min: 40, max: 79,  texto: T('Escribiste "Durkeim" y nadie te dijo nada.'),               stats: { conocimiento: 7 } },
      { codigo: 'fallo',   min: 0,  max: 39,  texto: T('"Bordié". Se rió toda la comisión.'),                       stats: { conocimiento: -6, fama: -5 } },
    ],
  },

  {
    codigo: 'mj_conectar', ilustracion: 'afiche', mecanica: 'conectar',
    nombre: 'El mapa conceptual',
    descripcion: 'Unir los puntos antes de que te toque exponer.',
    instrucciones: T('Clickeá los puntos en orden, del 1 al último.'),
    fases: ['ingresante', 'intermedio', 'avanzado'],
    config: { puntos: 9 },
    resultados: [
      { codigo: 'exito',   min: 80, max: 100, texto: T('Quedó un mapa que hasta la cátedra te copió.'), stats: { conocimiento: 13, fama: 5 } },
      { codigo: 'parcial', min: 40, max: 79,  texto: T('Se entiende si lo explicás vos al lado.'),      stats: { conocimiento: 6 } },
      { codigo: 'fallo',   min: 0,  max: 39,  texto: T('Parece una telaraña dibujada con el codo.'),    stats: { conocimiento: -4, fama: -3 } },
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
      { codigo: 'exito',   min: 70, max: 100, texto: T('Pasaste los diez sin que te vieran. Llegaste con la SUBE intacta.'), stats: { guita: 22, fama: 5 } },
      { codigo: 'parcial', min: 35, max: 69,  texto: T('Te llevaste uno por delante pero seguiste igual.'),                  stats: { guita: 9, fama: -2 } },
      { codigo: 'fallo',   min: 0,  max: 34,  texto: T('Te agarró seguridad en el primer molinete.'),                        stats: { guita: -7, fama: -5 } },
    ],
  },
];

// ---------------------------------------------------------------------------
// Finales
//
// Los finales de "forma" no miran valores absolutos sino el reparto: cada stat
// vale su porcentaje del total de los cuatro. Un stat está ALTO si se lleva más
// del 31% y BAJO si no llega al 19%.
//
// Con cuatro stats eso da exactamente 15 formas —4 dominantes + 6 duplas +
// 4 tríos + 1 repartido— que cubren todos los casos posibles sin superponerse.
// La aritmética lo garantiza:
//   * No puede haber 4 altos: 31 x 4 = 124 > 100.
//   * Con 3 altos, al cuarto le queda 7% como mucho, o sea que cae bajo y la
//     partida se lee como trío ("todo menos X").
//   * Con 0 altos no puede haber 2 bajos: 19 + 19 deja 62 para repartir entre
//     dos stats que no llegan a 31 (30,9 + 30,9 = 61,8 < 62). Así que hay
//     exactamente 1 bajo (trío) o ninguno (repartido).
// Por eso alcanza con ordenar duplas > dominantes > tríos > repartido: cada
// partida cae en uno y solo uno.
// ---------------------------------------------------------------------------
const ALTO = 31;
const BAJO = 19;
const STATS4 = ['guita', 'conocimiento', 'fama', 'politica'];
const pct = (s, operador, valor) => ({ tipo: 'stat', stat: 'pct_' + s, operador, valor });

// Exactamente estos stats se despegan; los demás quedan abajo.
const forma = (...altos) =>
  STATS4.map((s) => (altos.includes(s) ? pct(s, '>=', ALTO) : pct(s, '<', ALTO)));

// Ninguno se despega pero uno se quedó claramente atrás.
const sin = (falta) =>
  STATS4.map((s) => (s === falta ? pct(s, '<=', BAJO) : pct(s, '>', BAJO)));

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
  // --- Piso de magnitud: gana sin importar la forma ---
  {
    codigo: 'fin_fantasma', ilustracion: 'facultad', prioridad: 1200,
    titulo: G('El fantasma del pasillo', 'El fantasma del pasillo', 'El fantasma del pasillo'),
    texto: T('Terminaste la carrera sin que pasara nada. No hiciste plata, no aprendiste demasiado, nadie te ubica y nunca te metiste en nada. Cursaste seis años en el mismo edificio que dos mil personas y ninguna podría decir tu nombre. El título está, eso sí.'),
    cond: [{ tipo: 'stat', stat: 'promedio', operador: '<=', valor: 24 }],
  },

  // --- Duplas: dos stats se despegan ---
  {
    codigo: 'fin_tecnocrata', ilustracion: 'sobre', prioridad: 905,
    titulo: G('Terrible tecnócrata', 'Terrible tecnócrata', 'Terrible tecnócrata'),
    texto: T('Conocimiento y política en la misma persona: terminaste redactando los documentos que otros firman. Nadie sabe tu nombre y todos aplican tus párrafos.'),
    cond: forma('conocimiento', 'politica'),
  },
  {
    codigo: 'fin_menem', ilustracion: 'multitud', prioridad: 904,
    titulo: G('Sos Menem', 'Sos Menem', 'Sos Menem'),
    texto: T('Fama y política, todo junto y sin frenos. Te sale bien el discurso, te sale bien la foto, y nadie se acuerda de una sola cosa concreta que hayas hecho.'),
    cond: forma('fama', 'politica'),
  },
  {
    codigo: 'fin_influencer', ilustracion: 'camara', prioridad: 903,
    titulo: G('Influencer con marca propia', 'Influencer con marca propia', 'Influencer con marca propia'),
    texto: T('Fama y guita: monetizaste la carrera antes de terminarla. Vendés cursos de "sociología aplicada a negocios" a 40 dólares y funciona.'),
    cond: forma('fama', 'guita'),
  },
  {
    codigo: 'fin_consultora', ilustracion: 'plata', prioridad: 902,
    titulo: G('Sociólogo de consultora', 'Socióloga de consultora', 'Sociólogue de consultora'),
    texto: T('Aprendiste todo y aprendiste a cobrarlo. Hacés diapositivas con conceptos de Bourdieu para explicarle a un directorio por qué conviene achicar la planta. Nadie en esa mesa leyó a Bourdieu, y ese es exactamente tu valor agregado.'),
    cond: forma('guita', 'conocimiento'),
  },
  {
    codigo: 'fin_lobista', ilustracion: 'sobre', prioridad: 901,
    titulo: G('Lobista con carnet', 'Lobista con carnet', 'Lobista con carnet'),
    texto: T('La militancia te enseñó a mover un expediente y un día descubriste que eso se cobra. Ahora gestionás habilitaciones para gente que nunca pisó una asamblea. Seguís yendo a los actos, eso sí: ahora llegás en camioneta.'),
    cond: forma('guita', 'politica'),
  },
  {
    codigo: 'fin_panelista', ilustracion: 'profesor', prioridad: 900,
    titulo: G('Panelista con doctorado', 'Panelista con doctorado', 'Panelista con doctorado'),
    texto: T('Sabés de lo que hablás y encima hablás bien, que es una combinación rarísima. Te llaman de los canales cada vez que pasa algo y explicás en cuatro minutos lo que a vos te llevó seis años entender. Tus colegas dicen que te vendiste, y te llaman igual cuando hay que salir a bancar la facultad.'),
    cond: forma('conocimiento', 'fama'),
  },

  // --- Dominantes: uno solo se despega ---
  {
    codigo: 'fin_guita', ilustracion: 'plata', prioridad: 803,
    titulo: G('Consultor garca', 'Consultora garca', 'Consultore garca'),
    texto: T('Trabajás para Marlboro intentando vender nicotina a menores de edad. La propaganda de los nuevos chupetines de tabaco es un éxito en Arabia Saudita.'),
    cond: forma('guita'),
  },
  {
    codigo: 'fin_conocimiento', ilustracion: 'libro', prioridad: 802,
    titulo: G('Investigador del CONICET', 'Investigadora del CONICET', 'Investigadore del CONICET'),
    texto: T('Tu paper sobre las subjetividades latinoamericanizadas fue muy bien recibido por el MI6. Tenés una cátedra en Cambridge.'),
    cond: forma('conocimiento'),
  },
  {
    codigo: 'fin_fama', ilustracion: 'camara', prioridad: 801,
    titulo: G('Influencer de ciencias sociales', 'Influencer de ciencias sociales', 'Influencer de ciencias sociales'),
    texto: T('Aumentó la matrícula de la facultad gracias a vos. Promocionás casinos online y tenés un podcast con los Moldavsky.'),
    cond: forma('fama'),
  },
  {
    codigo: 'fin_politica', ilustracion: 'afiche', prioridad: 800,
    titulo: G('Puntero con unidad básica', 'Puntera con unidad básica', 'Punterr con unidad básica'),
    texto: T('Tenés una unidad básica con tu nombre y llegaste a ser asesor de un legislador más boludo que vos. Lo importante es que nunca perdiste la fe ni las ganas de cambiar el mundo.'),
    cond: forma('politica'),
  },

  // --- Tríos: nadie se despega, pero uno se quedó atrás ---
  {
    codigo: 'fin_sin_guita', ilustracion: 'comida', prioridad: 703,
    titulo: G('Prócer sin sueldo', 'Prócera sin sueldo', 'Prócere sin sueldo'),
    texto: T('Sabés, te ubican y movés. Lo único que no aparece nunca es la plata. Diste catorce charlas este año, todas gratis, y llegás a fin de mes con lo que te presta tu vieja. Te dicen que sos un ejemplo y vos calculás cuánto sale el bondi.'),
    cond: sin('guita'),
  },
  {
    codigo: 'fin_sin_conocimiento', ilustracion: 'multitud', prioridad: 702,
    titulo: G('El que nunca leyó a Weber', 'La que nunca leyó a Weber', 'Le que nunca leyó a Weber'),
    texto: T('Guita, contactos y prensa. Lo único que nunca terminaste fue la bibliografía. Tampoco importó demasiado: aprendiste temprano que en las reuniones donde se define algo no se cita a nadie.'),
    cond: sin('conocimiento'),
  },
  {
    codigo: 'fin_sin_fama', ilustracion: 'noche', prioridad: 701,
    titulo: G('Operador en las sombras', 'Operadora en las sombras', 'Operadore en las sombras'),
    texto: T('Tenés plata, tenés título y tenés rosca. Lo único que no tenés es una sola foto. Preferís que sea así: mirás a los que salen en la tapa y sabés perfectamente cuánto duran.'),
    cond: sin('fama'),
  },
  {
    codigo: 'fin_sin_politica', ilustracion: 'bondi', prioridad: 700,
    titulo: G('Apolítico de manual', 'Apolítica de manual', 'Apolítique de manual'),
    texto: T('Te fue bien en todo menos en lo único que la facultad daba por descontado. Decís "a mí la política no me interesa" con una seguridad que solo se consigue después de seis años cursando en un edificio que tomaron tres veces.'),
    cond: sin('politica'),
  },

  // --- Repartido: ninguno se despega ni se queda atrás ---
  {
    codigo: 'fin_default', ilustracion: 'birrete', prioridad: 0, es_default: true,
    titulo: G('Graduado', 'Graduada', 'Graduade'),
    texto: T('Terminaste sin que ningún costado se despegara del resto: un poco de guita, un poco de lectura, algo de gente que te ubica y una relación tibia con la política. Ni epopeya ni desastre. La mayoría de las carreras terminan exactamente así, y no está tan mal.'),
  },
];

module.exports = { T, G, stats, fases, historias, eventos, minijuegos, finales };
