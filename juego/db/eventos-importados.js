// =====================================================================
//  GENERADO POR db/importar-excel.js — no editar a mano.
//  Fuente: eventos-pdf.xlsx. Para cambiar algo, cambialo en el Excel
//  y volvé a correr el importador.
//  Generado: 2026-08-28
// =====================================================================

const T = (s) => ({ m: s, f: s, nb: s });

const eventosImportados = [
  {
    codigo: 'ev01_david_lynch_en_la_plaza_seca', ilustracion: 'plaza', categoria: 'generales', peso: 100,
    titulo: T('David Lynch en la plaza seca'),
    texto: T('Te quedás ranchando en la plaza seca y ves a una mina linda que nunca antes habías visto en tu vida. Un facuamigo te la presenta y resulta que los dos son fanáticos de David Lynch. Te enamorás profundamente. Al otro día tenés un coloquio en grupo importantísimo. Si no ponés de tu parte todo tu grupo se verá afectado.'),
    notas_autor: 'PDF: Generales 1',
    respuestas: [
      { texto: T('Te quedás hasta las mil y una hablando con esta piba. Dios, Patria y Familia. En una de esas te terminás casando y se te resuelven la mitad de los problemas. Los compas sabrán entender.'), efectos: [
        { peso: 100, texto: T('Los compas no supieron entender.'), stats: { conocimiento: -12, fama: -12 } },
      ]},
      { texto: T('Si es la indicada va a saber entender. Existe la posibilidad de que se corte el hechizo y no la veas más en tu vida. Intercambian instagrams.'), efectos: [
        { peso: 30, texto: T('Resulta que era una militante de alternativa académica. Los abuelos tienen terrenos en la Pampa Húmeda.'), stats: { guita: 12 } },
        { peso: 70, texto: T('Se cortó el hechizo y no la viste nunca más.'), stats: { politica: -12 } },
      ]},
    ],
  },
  {
    codigo: 'ev02_el_ultimo_bondi', ilustracion: 'bondi', categoria: 'generales', peso: 100,
    titulo: T('El último bondi'),
    texto: T('Te quedaste ranchando hasta cualquier hora con los pibes y vivís en Temperley. Llegás a la avenida y ves el último bondi que se te va.'),
    notas_autor: 'PDF: Generales 2',
    respuestas: [
      { texto: T('Corrés el bondi.'), efectos: [
        { peso: 50, texto: T('Llegás pero se te abrió la mochila y se te cayó todo. En el camino quedaron tus apuntes sobre Weber, Hobbes y Ofelia Fernández. Habrá que comenzar de nuevo.'), stats: { guita: -12, conocimiento: -12 } },
        { peso: 50, texto: T('Corrés el bondi pero te tropezás y caés. Te ayuda una chica que iba a subir pero se quedó preocupada por tu caída. Resulta que vive en la misma zona que vos y cursa T. S. Es el alma más noble que conociste en tu vida. Se van a tomar algo hasta cualquier hora. Quiere tus defectos más que tus virtudes (que no sobran). Contás la anécdota y tus amigos te cambian el apodo por Lilita Corrió. Tenés novia.'), stats: { guita: -12, conocimiento: 12, fama: 12 } },
      ]},
      { texto: T('No te apurás. Ya llegará otro.'), efectos: [
        { peso: 100, texto: T('Estuviste tres horas esperando el bondi chupando frío. Te quisieron robar y las chicas que laburan en Consti saltaron por vos. Les contaste lo que estudiabas. Arrancás una movida contra la represión de la policía en el barrio contra las trabajadoras sexuales.'), stats: { guita: -12, fama: 12, politica: 12 } },
      ]},
    ],
  },
  {
    codigo: 'ev03_el_que_pide_plata', ilustracion: 'plata', categoria: 'generales', peso: 100,
    titulo: T('El que pide plata'),
    texto: T('Entra una persona a pedir plata a la facultad. Dice que lo persigue Máximo Kirchner, que necesita plata para irse del país porque tiene información que puede llevar al arresto de la Dra. Cristina Fernández de Kirchner.'),
    notas_autor: 'PDF: Generales 3',
    respuestas: [
      { texto: T('Le das plata.'), efectos: [
        { peso: 100, texto: T('El tipo te agradece y dice que quiere mostrarte algo. Te lleva al baño. Tenés miedo pero lo seguís. "Acercate", susurra. Mete la mano por debajo del cuello y se saca una máscara: ¡es Nisman!'), stats: { guita: -12, politica: 12 } },
      ]},
      { texto: T('No le creés.'), efectos: [
        { peso: 100, texto: T('El tipo se aleja sin problema. Antes de doblar la esquina un francotirador lo fulmina con un tiro en la frente. No llegás a ver de dónde dispararon pero hay humo en una ventana de la esquina de San José.'), stats: { guita: 12, fama: -12 } },
      ]},
    ],
  },
  {
    codigo: 'ev04_donde_vas_a_estudiar', ilustracion: 'libro', categoria: 'generales', peso: 100,
    titulo: T('¿Dónde vas a estudiar?'),
    texto: T('Llegás temprano a la facultad por primera vez en tu vida. ¿A dónde vas a estudiar?'),
    notas_autor: 'PDF: Generales 4',
    respuestas: [
      { texto: T('A la biblioteca. Obviamente.'), efectos: [
        { peso: 100, texto: T('De tanto silencio te quedaste dormido. Llegaste tarde a la clase pero la siesta te hizo bien. Lo poco que estuviste participaste un montón.'), stats: { conocimiento: 12 } },
      ]},
      { texto: T('Te encerrás en un aula vacía.'), efectos: [
        { peso: 100, texto: T('A los quince minutos entró un grupo para una clase. Como te dio vergüenza te quedaste. Terminás aprendiendo mucho sobre Martín Lutero.'), stats: { conocimiento: 12 } },
      ]},
      { texto: T('Agarrás una mesa en el foyer.'), efectos: [
        { peso: 100, texto: T('Mala luz y letra minúscula. Entraste a cursar sin ver un pito. Encima no aprendiste un carajo.'), stats: { conocimiento: -12 } },
      ]},
    ],
  },
  {
    codigo: 'ev05_trabajo_de_investigacion', ilustracion: 'facultad', categoria: 'generales', peso: 100,
    titulo: T('Trabajo de investigación'),
    texto: T('Tenés que hacer un trabajo de investigación en grupo.'),
    notas_autor: 'PDF: Generales 5',
    respuestas: [
      { texto: T('Elegís el tema difícil. No solo se trata de aprobar la materia. Vas a aprender un montón.'), efectos: [
        { peso: 100, texto: T('Le dedicás una banda de tiempo, queda bien y le gustó a la cátedra.'), stats: { conocimiento: 22 } },
      ]},
      { texto: T('Elegís un tema papita que mucho no te interesa. Ese trabajo se va a redactar solo.'), efectos: [
        { peso: 100, texto: T('Lo hiciste el día anterior. Te sacaste de encima la materia y fuiste a final. En el medio te hiciste nuevos facuamigos igual de vagos que vos.'), stats: { conocimiento: -12, fama: 12 } },
      ]},
    ],
  },
  {
    codigo: 'ev06_clase_muy_embolante', ilustracion: 'facultad', categoria: 'generales', peso: 100,
    titulo: T('Clase muy embolante'),
    texto: T('Clase muy embolante.'),
    notas_autor: 'PDF: Generales 6',
    respuestas: [
      { texto: T('Dejás grabando el audio con el celular y te dormís. Si el profesor se da cuenta te podés ganar el odio para toda la cursada.'), efectos: [
        { peso: 50, texto: T('El profesor se da cuenta. Te hace la vida imposible hasta el final. Recursás el cuatri siguiente pero en la otra cátedra.'), stats: { conocimiento: -22, fama: -12 } },
        { peso: 50, texto: T('El profesor se da cuenta pero le chupa un huevo. Es más, te ofrece un drive con los audios de todas las clases. Tu Samsung Pocket lo agradece. Con ese material aprendés un montón.'), stats: { conocimiento: 22 } },
      ]},
      { texto: T('Te vas a comprar un café para remontarla. Es solo un mal momento.'), efectos: [
        { peso: 100, texto: T('El exquisito café de las máquinas del CeXSo te hace efecto. La rompés. Y tan solo por 2000 pesos argensimios.'), stats: { guita: -12, conocimiento: 12 } },
      ]},
      { texto: T('Salís y hablás un rato con tu facuamigo que está haciendo tiempo.'), efectos: [
        { peso: 100, texto: T('Te cuenta que va a ser papá y que los pañales están muy caros. Volvés y le metés con todo a la clase. En un futuro esos pañales no se van a pagar solos.'), stats: { conocimiento: 22 } },
      ]},
    ],
  },
  {
    codigo: 'ev07_el_que_no_para_de_decir_bolu', ilustracion: 'profesor', categoria: 'generales', peso: 100,
    titulo: T('El que no para de decir boludeces'),
    texto: T('Un pibe no para de decir boludeces en clase. El profesor ya no sabe cómo hacerle entender que está diciendo gansadas.'),
    notas_autor: 'PDF: Generales 7',
    respuestas: [
      { texto: T('Te hacés cargo y tirás un "mejor escuchar la explicación del profesor".'), efectos: [
        { peso: 100, texto: T('Los demás te lo agradecen y el profesor también, aunque quedás medio chupamedias. El pibe no volvió a acotar nunca más en su vida.'), stats: { conocimiento: 12, fama: -12 } },
      ]},
      { texto: T('No decís nada. La mejor forma de aprender es equivocándose.'), efectos: [
        { peso: 100, texto: T('A la otra clase el pibe dejó la materia.'), stats: { conocimiento: 12 } },
      ]},
      { texto: T('Agarrás el fierro caliente y le explicás lo que está diciendo mal.'), efectos: [
        { peso: 100, texto: T('Vos también lo decís mal. El profesor abandona la cátedra por estar rodeado de pelotudos. Ahora es influencer de tarot marxista.'), stats: { conocimiento: -12, fama: -12 } },
      ]},
    ],
  },
  {
    codigo: 'ev08_por_que_siguen_acumulando', ilustracion: 'profesor', categoria: 'generales', peso: 100,
    titulo: T('¿Por qué siguen acumulando?'),
    texto: T('La profesora pregunta por qué los multimillonarios siguen acumulando pese a tener mucho dinero.'),
    notas_autor: 'PDF: Generales 8',
    respuestas: [
      { texto: T('Para comer buena carne.'), efectos: [
        { peso: 100, texto: T('Boca, Perón y El Diego. La solución a la globalización es el nacionalismo.'), stats: { conocimiento: -12, fama: 12 } },
      ]},
      { texto: T('Hay que expropiarlos a todos. Buscar un por qué te chupa un huevo.'), efectos: [
        { peso: 100, texto: T('Se notaron tus inclinaciones marxistas.'), stats: { conocimiento: -12, politica: 12 } },
      ]},
      { texto: T('Para hacer fiestas gay con enanos.'), efectos: [
        { peso: 100, texto: T('Quisiste hacer un chiste y no salió. Los demás te miraron medio raro.'), stats: { fama: -12 } },
      ]},
      { texto: T('Porque no saben hacer otra cosa más que seguir el fetiche del dinero.'), efectos: [
        { peso: 100, texto: T('A la profe le cerró bastante tu respuesta y te lo hace saber. Te motivás y mejorás tu desempeño.'), stats: { conocimiento: 22 } },
      ]},
    ],
  },
  {
    codigo: 'ev09_el_fan_de_charles_manson', ilustracion: 'alerta', categoria: 'generales', peso: 100,
    titulo: T('El fan de Charles Manson'),
    texto: T('Un compañero te cuenta que está fanatizado con Charles Manson, que era un incomprendido social y que lo que hizo estaba bien.'),
    notas_autor: 'PDF: Generales 9',
    respuestas: [
      { texto: T('Ya se va a curar. Solo es medio raro.'), efectos: [
        { peso: 100, texto: T('Mató a un cheto medio hippie de Comunicación Social.'), stats: { fama: -12, politica: -12, violencia: 20 } },
      ]},
      { texto: T('Lo denunciás con las autoridades de la facultad. Se puede solucionar.'), efectos: [
        { peso: 100, texto: T('Lo echan pero ni se entera de que fuiste vos. Ya lo sabía todo el mundo.'), stats: { fama: 12, politica: 12 } },
      ]},
      { texto: T('Armás un linchamiento sorpresa para tu amigo. La historia se repite...'), efectos: [
        { peso: 100, texto: T('Se zarpan y lo matan. Mejor que ser oprimido.'), stats: { fama: -12, politica: -22, violencia: 20 } },
      ]},
    ],
  },
  {
    codigo: 'ev10_final_a_las_cinco_de_la_tard', ilustracion: 'libro', categoria: 'generales', peso: 100,
    titulo: T('Final a las cinco de la tarde'),
    texto: T('Tenés un final a las cinco de la tarde, tenés el día libre y no sabés nada.'),
    notas_autor: 'PDF: Generales 10',
    respuestas: [
      { texto: T('Das la cara y sos sincero. Zafás y te ponen ausente o te comés un uno.'), efectos: [
        { peso: 50, texto: T('Zafaste: te ponen ausente.'), stats: { conocimiento: -12 } },
        { peso: 50, texto: T('Te comiste un uno.'), stats: { conocimiento: -22 } },
      ]},
      { texto: T('Te mirás un video motivacional de Locomotora Olivera, te tomás un mango loco, leés un resumen de sesenta páginas que conseguiste y salís a la cancha.'), efectos: [
        { peso: 80, texto: T('Te fue como el orto, pero las ganas de comerte el mundo no te las saca nadie.'), stats: { conocimiento: -12, fama: 12 } },
        { peso: 20, texto: T('La cafeína llegó al cerebro y saliste de la caverna así como decía Platón. Accediste a las Ideas y a partir de ahora creés en la Matrix. Te sacaste un 10.'), stats: { conocimiento: 22 } },
      ]},
    ],
  },
  {
    codigo: 'ev11_el_after_y_el_pity', ilustracion: 'noche', categoria: 'generales', peso: 100,
    titulo: T('El after y el Pity'),
    texto: T('Cursás los sábados y no te quedan más faltas (sí, toman falta). El viernes salís pensando ir pasado de rosca a cursar, pero tu amigo consigue un after. Y está el Pity.'),
    notas_autor: 'PDF: Generales 11',
    respuestas: [
      { texto: T('Me quedo libre pero conozco al Pity. Homero tiene más valor social que toda la obra de Talcott Parsons. La foto con él se la mostrás hasta a los perros.'), efectos: [
        { peso: 100, texto: T('Quedaste libre. La foto con el Pity la tenés de fondo de pantalla.'), stats: { conocimiento: -12, fama: 22 } },
      ]},
      { texto: T('Voy a cursar. No me queda otra. La próxima será.'), efectos: [
        { peso: 100, texto: T('Fuiste a cursar. El Pity siguió existiendo sin vos.'), stats: { conocimiento: 12, fama: -12 } },
      ]},
    ],
  },
  {
    codigo: 'ev12_la_sala_de_radio', ilustracion: 'facultad', categoria: 'generales', peso: 100,
    titulo: T('La sala de radio'),
    texto: T('Pasás por la sala de radio y te das cuenta de que adentro hay dos del centro de estudiantes dándose masa. Tienen un candado aparte para asegurarse el telo.'),
    notas_autor: 'PDF: Generales 12',
    respuestas: [
      { texto: T('Los mandás al frente. Corrés el riesgo de que sea para un trabajo práctico.'), efectos: [
        { peso: 100, texto: T('Expusiste al CeXSo y a las autoridades. Para el estudiantado quedaste como el espía del amor.'), stats: { fama: 12 } },
      ]},
      { texto: T('No soy vigilante. Además hay que subir la tasa de fecundidad.'), efectos: [
        { peso: 100, texto: T('Sale a la luz por una foto. Era un curso intensivo con aproximación realista a la educación sexual.') },
      ]},
    ],
  },
  {
    codigo: 'ev13_era_linda', ilustracion: 'estudiante', categoria: 'generales', peso: 100,
    titulo: T('¿Era linda?'),
    texto: T('Le decís a tu novia que viste a una chica en la facultad que se parece a ella. Te pregunta si era linda.'),
    notas_autor: 'PDF: Generales 13',
    respuestas: [
      { texto: T('Le decís que la chica era linda.'), efectos: [
        { peso: 100, texto: T('Te puteó de arriba a abajo en el Burger, se podía escuchar a nenes llorando. Digamos que te quedaste sin novia y ni siquiera pudiste disfrutar de la hamburguesa.'), stats: { fama: -12 } },
      ]},
      { texto: T('Le decís que la chica no era linda.'), efectos: [
        { peso: 100, texto: T('Te puteó de arriba a abajo en el Burger, se podía escuchar a nenes llorando. Digamos que te quedaste sin novia y ni siquiera pudiste disfrutar de la hamburguesa.'), stats: { fama: -12 } },
      ]},
    ],
  },
  {
    codigo: 'ev14_michael_jackson_en_la_puerta', ilustracion: 'facultad', categoria: 'generales', peso: 100,
    titulo: T('Michael Jackson en la puerta'),
    texto: T('Al salir de la facultad ves que hay un tipo vestido de Michael Jackson bailando y cantando. Al acercarte te dice "hee-hee".'),
    notas_autor: 'PDF: Generales 14',
    respuestas: [
      { texto: T('Lo cagás a piñas.'), efectos: [
        { peso: 50, texto: T('Tus compañeros no te pueden sacar de encima de Michael, se tuvo que meter la policía incluso. Otra denuncia más a la lista.'), stats: { guita: -12, violencia: 20 } },
        { peso: 50, texto: T('No era un tipo vestido de Michael: era el verdadero Michael Jackson, que había venido a la Argentina en secreto. En los ojos del mundo quedás como un hijo de puta, peor que Chapman.'), stats: { fama: -22, politica: -22, violencia: 20 } },
      ]},
      { texto: T('Lo retás a una competencia de baile.'), minijuego: 'mj_simon', efectos: [
        { peso: 100, rama: 'gana', texto: T('La facultad entera salió a ver este evento histórico. Le rompiste el ojete con la caminata lunar, el falso Michael se escapa furioso y ahora personas que no conocés te llaman "El Michael".'), stats: { fama: 22 } },
        { peso: 100, rama: 'pierde', texto: T('Quedaste como un boludo. Hasta el profesor pelado que siempre tiene cara de culo se rió de lo mal que bailaste. Has cometido suicidio social.'), stats: { fama: -35 } },
      ]},
    ],
  },
  {
    codigo: 'ev15_chorro_o_gil', ilustracion: 'estudiante', categoria: 'generales', peso: 100,
    titulo: T('¿Chorro o gil?'),
    texto: T('En un recreo se acerca un tipo a tu ronda de amigos y te pregunta directamente: "¿vos sos chorro o gil?".'),
    notas_autor: 'PDF: Generales 15',
    respuestas: [
      { texto: T('Sos chorro.'), efectos: [
        { peso: 100, texto: T('"¿Vos chorro? Chorro de leche sos vos, gato." No te hace nada más que lastimar tus sentimientos y arruinarte el día, por lo que no pudiste escuchar el resto de la clase.'), stats: { conocimiento: -12 } },
      ]},
      { texto: T('Sos gil.'), efectos: [
        { peso: 50, texto: T('Se te ríe en la cara, te empuja al piso y en un movimiento te roba a la wacha. (Si tenés novia, por este momento te corta.)'), stats: { guita: -12, fama: -12 } },
        { peso: 50, texto: T('Te agradece por la información y ves cómo va para el siguiente grupo: el chabón estaba recolectando datos para su tesis.'), stats: { conocimiento: 12 } },
      ]},
    ],
  },
  {
    codigo: 'ev16_sumate_a_ser_un_therian', ilustracion: 'afiche', categoria: 'generales', peso: 100,
    titulo: T('Sumate a ser un Therian'),
    texto: T('Estás caminando por los pasillos de la facultad y ves un afiche pegado que dice "Sumate a ser un Therian".'),
    notas_autor: 'PDF: Generales 16',
    respuestas: [
      { texto: T('Le sacás una foto y se la mandás a un amigo así se ríen juntos.'), efectos: [
        { peso: 100, texto: T('Le mandás la foto a tu amigo y se ríe en demasía. Le causa tanta gracia el afiche que se lo manda a otra gente para que se rían también. De esta manera el afiche circula y le terminan haciendo alta publicidad a los therians. Sin darte cuenta la facultad se llena de ellos.'), stats: { conocimiento: -12 } },
      ]},
      { texto: T('Te metés en el grupo de therians para hacer un trabajo de investigación sobre cómo es la movida, aprender sus costumbres y, si es posible, destruirlos desde adentro.'), efectos: [
        { peso: 50, texto: T('Entrás en el grupo creyéndote mejor que ellos pero de a poco vas entrando en la movida. Ahora vas al Barrio Chino los fines de semana disfrazado de lobo de las praderas.'), stats: { conocimiento: 12, fama: -22 } },
        { peso: 50, texto: T('Una vez dentro del grupo se dan cuenta de que estás haciendo demasiadas preguntas y te descubren. Corrés para escapar y lo lográs, pero te amenazan diciéndote que si te vuelven a cruzar te muerden un pie. Al parecer la mafia de los therians es más poderosa de lo que creías: ahora caminás por la facultad con miedo.'), stats: { fama: -12, politica: -12 } },
      ]},
      { texto: T('Arrancás el afiche de la pared porque no te caben nada los therians.'), efectos: [
        { peso: 100, texto: T('La mafia de los therians se da cuenta de que fuiste vos y en un descuido uno de ellos te mea los apuntes al mismo tiempo que ladra, como venganza.'), stats: { conocimiento: -12, fama: -12 } },
      ]},
    ],
  },
  {
    codigo: 'ev17_las_maquinas_del_kiosco', ilustracion: 'plata', categoria: 'generales', peso: 100,
    titulo: T('Las máquinas del kiosco'),
    texto: T('Vas al kiosco en el recreo a comprarte un alfajor, un café, o lo que te alcance comprar con 2000 pesos. Llegás y te das cuenta de que reemplazaron a los que atienden por máquinas expendedoras. Las máquinas te parecen una garcha: no entendés cómo funcionan, solo aceptan Mercado Pago y vos tenés efectivo.'),
    notas_autor: 'PDF: Generales 17',
    respuestas: [
      { texto: T('Le pedís a una mina que está comprando si te puede comprar un alfajor y vos le pasás efectivo.'), efectos: [
        { peso: 100, texto: T('Te dice que con gusto te compraría un alfajor pero que no tiene plata en Mercado Pago: tenía 3 lucas y las gastó comprando unas Club Social. Al principio no sabés si creerle, pero te insiste con el mismo discurso hasta que ya se vuelve pesado el asunto. Te pide perdón como cinco veces. De todas maneras te convida unas Club Social y dice que está en deuda con vos. Te parece una reacción exagerada.'), stats: { guita: 22 } },
      ]},
      { texto: T('Te rebelás en contra del sistema, agarrás una silla de por ahí y la tirás contra el vidrio de las máquinas.'), efectos: [
        { peso: 50, texto: T('Agarraste una silla, la tiraste al vidrio y no se rompió. Mierda que son resistentes esas máquinas. Encima se te quedaron viendo todos los que estaban ahí como si fueses un enfermo y nadie te bancó. Les decís que la silla se te cayó sin querer pero claramente no fue así.'), stats: { fama: -22, violencia: 20 } },
        { peso: 50, texto: T('Agarrás la silla, la tirás contra una de las máquinas, el vidrio explota y das un discurso a los presentes sobre cómo el hombre tiene que enfrentarse ante la amenaza de las máquinas, el individualismo y la deshumanización. Conmovés a todo el mundo y te volvés un nuevo referente político. Ahora sos leyenda.'), stats: { politica: 22, violencia: 20 } },
      ]},
      { texto: T('No comprás una mierda.'), efectos: [
        { peso: 100, texto: T('Volvés a la clase después del recreo y te pinta el sueño de golpe. No comiste nada y sentís que tu vida es una mierda. Entrás en una crisis existencial y no prestaste nada de atención en la clase. Encima ahora estás re angustiado.'), stats: { guita: 22, conocimiento: -12 } },
      ]},
    ],
  },
  {
    codigo: 'ev18_el_que_no_para_de_hablar', ilustracion: 'estudiante', categoria: 'generales', peso: 100,
    titulo: T('El que no para de hablar'),
    texto: T('Llegás temprano a la cursada, antes de que arranque la clase, y no conocés a nadie. Estás esperando tranqui y se te acerca un loco a sacarte charla. Al principio te cae bien, pero después te rescatás de que es medio boludo y ahora no te para de hablar en la mitad de la clase.'),
    notas_autor: 'PDF: Generales 18',
    respuestas: [
      { texto: T('Le decís que se calle, que querés prestar atención a la clase.'), efectos: [
        { peso: 100, texto: T('El chabón piensa que lo estás jodiendo y sigue hablando. Se lo volvés a repetir y se le parte el corazón: se pone a llorar en mitad de la clase y los otros estudiantes te miran como si fuera tu culpa.'), stats: { conocimiento: 12, fama: -12 } },
      ]},
      { texto: T('Te sumás a la charla, total estás hasta los huevos de la clase.'), efectos: [
        { peso: 100, texto: T('Le seguís el juego y el chabón te cuenta que está organizando una redada contra los therians. Ellos son tus enemigos, así que el enemigo de tu enemigo es tu amigo.'), stats: { conocimiento: -12 } },
      ]},
      { texto: T('No le respondés a ninguna de sus intervenciones esperando que se calle de una vez.'), efectos: [
        { peso: 100, texto: T('El chabón no se calla. No tiene drama con que vos no hables: quiere hacer un monólogo. Te estuvo hablando toda la clase y no pudiste prestar atención.'), stats: { conocimiento: -12 } },
      ]},
    ],
  },
  {
    codigo: 'ev19_el_profesor_en_la_calle', ilustracion: 'profesor', categoria: 'generales', peso: 100,
    titulo: T('El profesor en la calle'),
    texto: T('Un día como cualquier otro estás caminando por la calle y te das cuenta de que enfrente tuyo está un profesor de la facu. No sabés si saludarlo o no, porque dudás de si el chabón te conoce: vos no participás mucho en clase y él tiene una banda de alumnos.'),
    notas_autor: 'PDF: Generales 19',
    respuestas: [
      { texto: T('Lo saludás.'), efectos: [
        { peso: 100, texto: T('Lo saludás de prepo y te mira raro. Después le explicás que sos alumno suyo y parece no importarle mucho: te dice que prefiere no mezclar su vida profesional con su vida privada y te pide por favor que te vayas.'), stats: { fama: -12 } },
      ]},
      { texto: T('Lo mirás, te mira, agachás la cabeza, lo volvés a mirar, te mira, lo saludás pero baja la cabeza, cortás el saludo sin llegar a terminarlo.'), efectos: [
        { peso: 100, texto: T('Ninguno de los dos sabe si lo saludaste o no. Menos 1000 de aura.'), stats: { fama: -22 } },
      ]},
      { texto: T('No lo saludás.'), efectos: [
        { peso: 100, texto: T('Notás que te mira y vos no lo saludás. Sucede todo muy rápido. En la próxima clase, antes de entrar al aula, te cruza y te dice: "¿qué pasa, dormimos juntos?". Parece que te reconoció y no se tomó bien que no lo saludes.'), stats: { fama: -12 } },
      ]},
    ],
  },
  {
    codigo: 'ev20_la_madriguera_de_los_therian', ilustracion: 'alerta', categoria: 'generales', peso: 100,
    titulo: T('La madriguera de los therians'),
    texto: T('El loco que te habló durante toda la clase te dice que está listo para atacar a los therians. Te pide ayuda.'),
    notas_autor: 'PDF: Generales 20',
    respuestas: [
      { texto: T('Lo seguís.'), efectos: [
        { peso: 100, texto: T('Los therians se encuentran en un aula del subsuelo que bautizaron "la madriguera". Vas ahí con el loco y se desata una batalla. Los therians son muy poderosos y parece que van a triunfar, pero el loco saca un silbato para perros. Lo hace sonar y logra adiestrarlos: ahora son tus secuaces.'), stats: { fama: 12, politica: 12, violencia: 20 } },
      ]},
      { texto: T('No lo seguís.'), efectos: [
        { peso: 100, texto: T('El loco se manda solo contra los therians. Lo destrozan y suman fuerza en la facultad. Cada vez son más poderosos y ahora corrés un peligro mayor.'), stats: { fama: -12, politica: -12 } },
      ]},
    ],
  },
  {
    codigo: 'ev21_parcial_manana_once_de_la_no', ilustracion: 'libro', categoria: 'generales', peso: 100,
    titulo: T('Parcial mañana, once de la noche'),
    texto: T('Mañana tenés un parcial y sentís que no estudiaste lo suficiente. Son las once de la noche y tenés algo de sueño.'),
    notas_autor: 'PDF: Generales 21',
    respuestas: [
      { texto: T('Le pegás derecho toda la noche, hay que aprobar.'), efectos: [
        { peso: 100, texto: T('Estudiaste toda la noche y llegás al parcial con veinte minutos de sueño. Te dan las consignas pero tu cerebro no funciona. Empezás a tener delirios con que uno de tus compañeros te quiere atacar y le pegás una cachetada. Nadie entiende lo que pasó y te retirás sobrepasado por la situación.'), stats: { conocimiento: -22, fama: -12, violencia: 20 } },
      ]},
      { texto: T('Te vas a dormir. Mejor estar descansado durante el parcial.'), efectos: [
        { peso: 100, texto: T('Llegás con la cabeza despejada pero sin tener tan en claro los conceptos. Igual algo de idea tenés. Son cinco preguntas: una la sabés bien y tres a medias. Te quedás dos horas chamuyando a lo loco y aprobás de pedo.'), stats: { conocimiento: 12 } },
      ]},
      { texto: T('Le hablás a la IA y le decís que te haga un repaso de los temas del parcial y estudiás de ahí.'), efectos: [
        { peso: 100, texto: T('Te quedás un rato a la noche estudiando con la IA. Al otro día caés al parcial, te dan la hoja y te las sabés todas: esto lo resolvés de taquito. A la semana te llega la nota y te sacaste un 2. La IA te dijo cualquier data.'), stats: { conocimiento: -22 } },
      ]},
    ],
  },
  {
    codigo: 'ev22_la_jauria_en_el_patio_gay', ilustracion: 'comida', categoria: 'generales', peso: 100,
    titulo: T('La jauría en el patio gay'),
    texto: T('Un día estás tomándote un café de tranquis en el patio gay y la jauría de therians se presenta, hace contacto visual y se dirige hacia vos.'),
    notas_autor: 'PDF: Generales 22',
    respuestas: [
      { texto: T('Corrés por tu vida.'), efectos: [
        { peso: 100, texto: T('Los therians son más rápidos: te alcanzan y te mean todo, a vos y a tu mochila. Te rompen los apuntes y quedás como la perrita de los therians frente a toda la facu.'), stats: { conocimiento: -12, fama: -22 } },
      ]},
      { texto: T('Te enfrentás.'), efectos: [
        { peso: 100, texto: T('Te parás de mano pero son muy fuertes. Te rasguñan toda la cara pero te la bancás. Lográs ganarles y quedás como el capo que se cogió a los therians.'), stats: { fama: 22, violencia: 20 } },
      ]},
      { texto: T('Te hacés pasar por uno de ellos.'), efectos: [
        { peso: 100, texto: T('Los therians, confundidos, no saben qué hacer. Se miran entre ellos y deciden dejarte en paz. Parece que te libraste de ellos.'), stats: { conocimiento: 12 } },
      ]},
    ],
  },
  {
    codigo: 'ev23_inscripciones_por_el_siu', ilustracion: 'libro', categoria: 'generales', peso: 100,
    titulo: T('Inscripciones por el SIU'),
    texto: T('Mañana son las inscripciones del cuatrimestre por el SIU Guaraní y no sabés bien a qué materia inscribirte ni con qué personas.'),
    notas_autor: 'PDF: Generales 23',
    respuestas: [
      { texto: T('Te inscribís a una materia con la chica que te gusta.'), efectos: [
        { peso: 100, texto: T('En la materia hay que hacer un trabajo de a dos durante toda la cursada. Armás grupo con la piba y tenés la oportunidad de conocerla mejor. Ella dice estar muy ocupada y vos te matás haciendo el 90% del trabajo porque sos un boludo. Logran aprobar y la invitás a salir: te rechaza diciendo que prefiere preservar la amistad. Por lo menos te re curtiste y te quedaron re claros los conceptos de la materia.'), stats: { conocimiento: 22, fama: -12 } },
      ]},
      { texto: T('Coordinás con un amigo para inscribirse a la misma materia.'), efectos: [
        { peso: 100, texto: T('Dan la materia juntos y ninguno de los dos caza una. Desaprueban los parciales pero aprueban los recuperatorios raspando. Llegan a final y los dos aprueban con 5. Un éxito la cursada.'), stats: { conocimiento: 12 } },
      ]},
      { texto: T('Te inscribís a la que querés dar, que la chupen los demás.'), efectos: [
        { peso: 100, texto: T('Te inscribís por tu cuenta, si no se te traban las correlativas. Un pijazo cursar solo, pero te hacés nuevos amigos uno más boludo que el otro. Le metés con todo a la materia y promocionás.'), stats: { conocimiento: 22, fama: 12 } },
      ]},
    ],
  },
  {
    codigo: 'ev24_llueve_y_hay_mate_en_el_buff', ilustracion: 'comida', categoria: 'generales', peso: 100,
    titulo: T('Llueve y hay mate en el buffet'),
    texto: T('Salís al recreo con unos nuevos facuamigos que hiciste en una clase sumamente aburrida. Están en el buffet tomando mate, afuera llueve, y tenés que volver a la clase.'),
    notas_autor: 'PDF: Generales 24',
    respuestas: [
      { texto: T('Volvés a la clase.'), efectos: [
        { peso: 100, texto: T('Justo explicaron un tema súper importante que entra en el parcial, así que agradecés haber vuelto. Lo único malo es que no podés más con tu vida del aburrimiento y estás esperando morir.'), stats: { conocimiento: 12 } },
      ]},
      { texto: T('Quedarte hablando con tus compañeros.'), efectos: [
        { peso: 100, texto: T('Te quedaste hablando con los compas sobre anécdotas marihuaneras. Pegaste buena onda con tus nuevos amigos, conseguiste nota de brownies locos a 5 lucas y los pibes se rieron de aquella vez en que, estando re loco, después de bañarte pusiste la toalla en el perchero y la campera donde va la toalla.'), stats: { guita: -12, conocimiento: -12, fama: 12 } },
      ]},
      { texto: T('Quedarte un rato hablando y volver tarde a la clase.'), efectos: [
        { peso: 100, texto: T('Te quedás un rato más y decidís que es momento de volver. Los pibes deciden seguirte y ahora parece que sos el líder. Te perdiste la introducción a un tema importante que va para el parcial, pero más o menos cazaste la idea.'), stats: { conocimiento: -12, fama: 12 } },
      ]},
    ],
  },
  {
    codigo: 'ev25_a_que_hora_pones_la_alarma', ilustracion: 'bondi', categoria: 'generales', peso: 100,
    titulo: T('¿A qué hora ponés la alarma?'),
    texto: T('Volvés a tu casa después de un recital a las 3 de la mañana y tenés que estar a las 8 en la facu. Teniendo en cuenta que tenés como una hora de viaje, no vas a dormir mucho. ¿A qué hora ponés la alarma?'),
    notas_autor: 'PDF: Generales 25',
    respuestas: [
      { texto: T('No pongo ninguna alarma, me quedo durmiendo.'), efectos: [
        { peso: 100, texto: T('Te quedás durmiendo. Hablás con un compañero para preguntarle qué hicieron y te dice que la clase duró media hora nada más, porque al profe le agarró una hemorragia nasal y hubo que suspenderla. Rarísimo, pero bueno: agradecés no haber ido.'), stats: { guita: 22 } },
      ]},
      { texto: T('Pongo la alarma a las 7 y llego re tarde. Me chupa un huevo ser puntual.'), efectos: [
        { peso: 100, texto: T('Llegás una hora tarde, vas para el aula y no hay nadie. Te cruzás a un compañero y te dice que suspendieron la clase porque al profe le agarró una hemorragia nasal incontrolable. Rarísimo pero real. Fuiste a la facultad al pedo, tenés sueño, depresión, y toca enfrentar la vuelta a casa.'), stats: { guita: -12, conocimiento: -12 } },
      ]},
      { texto: T('Pongo varias alarmas para que suenen cada dos minutos a partir de las 6:15.'), efectos: [
        { peso: 100, texto: T('Increíblemente llegás temprano. Por alguna razón que no entendés te sentás en la primera fila, enfrente del profesor. Estás haciendo fuerza para mantenerte despierto y a la media hora le empieza a sangrar la nariz al profe, pero heavy, y te empieza a salpicar en la cara así bien gore. Le ofrecés unos pañuelitos y él te lo agradece.'), stats: { conocimiento: 22 } },
      ]},
    ],
  },
  {
    codigo: 'ev26_el_campamento_anticapitalist', ilustracion: 'multitud', categoria: 'generales', peso: 100,
    titulo: T('El campamento anticapitalista'),
    texto: T('Te invitan a participar del campamento anticapitalista.'),
    notas_autor: 'PDF: Generales 26',
    respuestas: [
      { texto: T('No curtís con esa.'), efectos: [
        { peso: 100, texto: T('Les cortaste el rostro y no los dejaste hablar.'), stats: { fama: -12, politica: -12 } },
      ]},
      { texto: T('¡Oh sí! Me encantan los campamentos.'), efectos: [
        { peso: 100, texto: T('Fuiste, hiciste Tiktoks, mojaste las patas en una pelopincho, y escuchaste ochenta y tres razones por las que el capitalismo no va más.'), stats: { conocimiento: -12, fama: 12 } },
      ]},
      { texto: T('Vas escéptico para hacer un poco de observación participante'), efectos: [
        { peso: 100, texto: T('Viste la dinámica y te pareció dudoso el ímpetu del movimiento. Todos los militantes parecían cyborgs. Investigaste más y encontraste una relación entre la agrupación y el Mossad pero te enamoraste de unx cyborg anticapitalista. Van a tener hijes anticapitalistas.'), stats: { conocimiento: 22, politica: -12 } },
      ]},
    ],
  },
  {
    codigo: 'ev27_la_marcha_universitaria', ilustracion: 'multitud', categoria: 'generales', peso: 100,
    titulo: T('La marcha universitaria'),
    texto: T('Convocan a la vigésima marcha universitaria. Los docentes y no docentes cobran una miseria y no cumplen la ley universitaria que votó el Congreso.'),
    notas_autor: 'PDF: Generales 27',
    respuestas: [
      { texto: T('Vamos a la marcha, Jesse.'), efectos: [
        { peso: 100, texto: T('Te cruzaste a El Momo dando una nota. Fotito, arroba y story para Instagram. Te hiciste viral. El mejor día de tu vida.'), stats: { fama: 22, politica: 12 } },
      ]},
      { texto: T('Me quedo estudiando para la materia.'), efectos: [
        { peso: 100, texto: T('Te perdiste de la efervescencia social. Aprobaste pero te miran raro.'), stats: { conocimiento: 12, fama: -12, politica: -12 } },
      ]},
      { texto: T('Vagos de mierda, vayan a laburar.'), efectos: [
        { peso: 100, texto: T('Sos un pelotudo. Sí, sos un pelotudo.'), stats: { fama: -12, politica: -22 } },
      ]},
    ],
  },
  {
    codigo: 'ev28_el_medico_te_receta_anteojos', ilustracion: 'facultad', categoria: 'generales', peso: 100,
    titulo: T('El médico te receta anteojos'),
    texto: T('El médico te receta anteojos.'),
    notas_autor: 'PDF: Generales 28',
    respuestas: [
      { texto: T('No le das bola. No gastás guita en eso.'), efectos: [
        { peso: 100, texto: T('Ves borroso y confundís a la profe con tu amiga: "esta vieja de mierda no para de romper las bolas". Perdiste aura.'), stats: { guita: 22, conocimiento: -12, fama: -12 } },
      ]},
      { texto: T('Vas y te comprás unos en la feria.'), efectos: [
        { peso: 100, texto: T('Te brindan poderes astrológicos que te permiten ver más allá de la suma de individualidades. Ahora comprendés Helechos Sociales.'), stats: { guita: -12, conocimiento: 12 } },
      ]},
      { texto: T('Ponés toda la teca y te preservás.'), efectos: [
        { peso: 100, texto: T('Rendimiento óptimo. Tom Cruise en Misión Imposible. Leés el I Ching.'), stats: { guita: -12, conocimiento: 22 } },
      ]},
    ],
  },
  {
    codigo: 'ev29_el_argentino_mas_importante', ilustracion: 'facultad', categoria: 'generales', peso: 100,
    titulo: T('El argentino más importante'),
    texto: T('Se te acercan las de Comu y te preguntan cuál es el argentino más importante de la historia.'),
    notas_autor: 'PDF: Generales 29',
    respuestas: [
      { texto: T('Favaloro.'), efectos: [
        { peso: 100, texto: T('Leíste Qué es el radicalismo, de Alfonsín.'), stats: { conocimiento: 12 } },
      ]},
      { texto: T('El Che.'), efectos: [
        { peso: 100, texto: T('Te gusta el bardo. Te la bancás.'), stats: { politica: 12 } },
      ]},
      { texto: T('San Martín.'), efectos: [
        { peso: 100, texto: T('Fuiste a la segura. No sumás ni restás.') },
      ]},
      { texto: T('El Diego.'), efectos: [
        { peso: 100, texto: T('EL IIIEEEEGOOOOOOOOOOO.'), stats: { fama: 22 } },
      ]},
    ],
  },
  {
    codigo: 'ev30_estas_fusilado', ilustracion: 'noche', categoria: 'generales', peso: 100,
    titulo: T('Estás fusilado'),
    texto: T('Estás fusilado y cursás hasta la noche. Querés dormir un rato.'),
    notas_autor: 'PDF: Generales 30',
    respuestas: [
      { texto: T('Siestario en HU400.'), efectos: [
        { peso: 100, texto: T('Te quedó el cuello como un acordeón. En medio de la clase soñaste que te cortaba la cabeza Robespierre.'), stats: { conocimiento: -12 } },
      ]},
      { texto: T('Plaza seca al sol.'), efectos: [
        { peso: 100, texto: T('Diez minutos y nada más. Mucho ruido para seguir. Una nutritiva siesta intelectual.'), stats: { conocimiento: 12 } },
      ]},
      { texto: T('Te encerrás en un aula.'), efectos: [
        { peso: 100, texto: T('Entran tres personas y se disculpan pensando que sos profesor. No descansaste una mierda pero sumaste confianza.'), stats: { fama: 12 } },
      ]},
    ],
  },
  {
    codigo: 'ev31_entra_un_grupo_armado', ilustracion: 'multitud', categoria: 'generales', peso: 100, ronda_min: 4,
    titulo: T('Entra un grupo armado'),
    texto: T('Entra un grupo armado a la facultad. Tienen brazaletes y bigotes que conocés.'),
    notas_autor: 'PDF: Generales 31',
    respuestas: [
      { texto: T('Confrontás y ponés el pecho.'), efectos: [
        { peso: 50, termina_partida: true, texto: T('Terminaron a las piñas. Uno de ellos tiró y te dio en la panza. Moriste siendo defensor de la universidad pública. Murales, remeras, canciones: nunca más van a olvidar tu nombre.'), stats: { fama: 35, politica: 22, violencia: 20 } },
        { peso: 50, texto: T('Piñas. Se armó una muchedumbre en su contra. Uno tiró y mató a uno. Podrías haber sido vos. Te convertís en referente de un movimiento que lo recuerda. Te encargás de que nunca se olvide su nombre.'), stats: { fama: 12, politica: 22, violencia: 20 } },
      ]},
      { texto: T('Salís y llamás a la policía. No volvés a la facultad hasta que se resuelva la situación.'), efectos: [
        { peso: 100, texto: T('Soldado que huye sirve para otra guerra. Pero qué cagón que sos.'), stats: { fama: -12, politica: -12 } },
      ]},
      { texto: T('Empezás a gritar como loquita.'), efectos: [
        { peso: 100, texto: T('Solamente aportaste banda sonora a la situación.'), stats: { fama: -12 } },
      ]},
    ],
  },
  {
    codigo: 'ev32_jueves_de_feria', ilustracion: 'facultad', categoria: 'generales', peso: 100,
    titulo: T('Jueves de feria'),
    texto: T('Es jueves de feria y te cruzás con una tanga de CRISTINA LIBRE.'),
    notas_autor: 'PDF: Generales 32',
    respuestas: [
      { texto: T('Comprás.'), efectos: [
        { peso: 100, texto: T('Hay que prender fuego Clarín.'), stats: { guita: -12, politica: 12 } },
      ]},
      { texto: T('No comprás.'), efectos: [
        { peso: 100, texto: T('Muere una flequilluda con campera de Adidas.'), stats: { guita: 22, politica: -12 } },
      ]},
    ],
  },
  {
    codigo: 'ev33_turno_noche_en_la_hamburgues', ilustracion: 'comida', categoria: 'generales', peso: 100,
    titulo: T('Turno noche en la hamburguesería'),
    texto: T('Te ofrecen un trabajo nocturno en una cadena muy conocida de hamburguesas. Por el horario capaz que hasta podés comerte alguna.'),
    notas_autor: 'PDF: Guita 1',
    respuestas: [
      { texto: T('Aceptás el laburo.'), efectos: [
        { peso: 75, texto: T('Ganás plata pero estás más cansado y perdés horas de cursada. Con lo recaudado comprás sanguchitos y café en el buffet.'), stats: { guita: 12, conocimiento: -12 } },
        { peso: 25, texto: T('Hacés una monografía para una materia contando el sistema de cooperación entre compañeros en el espacio de trabajo. Te ganaste el aplauso de los profesores y sumás puntos académicos.'), stats: { conocimiento: 8 } },
      ]},
      { texto: T('No lo aceptás.'), efectos: [
        { peso: 100, texto: T('Seguís como estabas.'), stats: { guita: -12 } },
      ]},
    ],
  },
  {
    codigo: 'ev34_el_mega_libro_del_titular', ilustracion: 'plata', categoria: 'generales', peso: 100,
    titulo: T('El mega libro del titular'),
    texto: T('Un facuamigo te invita a la feria del libro. No podés creer los precios irrisorios que tienen los libros. Entrás a un stand y ves ese mega libro sobre textos desconocidos del profesor de teóricos de tu materia favorita. Te fijás la billetera y no llegás ni financiado en doce cuotas.'),
    notas_autor: 'PDF: Guita 2',
    respuestas: [
      { texto: T('Te lo robás. Riesgo de que te vean.'), efectos: [
        { peso: 35, texto: T('Lo llevás a la clase, se lo mostrás, te lo firma y te suma al grupo de investigación.'), stats: { guita: 22 } },
        { peso: 65, texto: T('Te vieron.'), stats: { guita: -12 } },
      ]},
      { texto: T('Lo llevás a la clase, lo ve, le chupa un huevo y lo terminás vendiendo en Parque Centenario por la mitad de lo que sale nuevo.'), efectos: [
        { peso: 100, texto: T('Lo vendiste en Parque Centenario.'), stats: { guita: 22 } },
      ]},
      { texto: T('No arriesgás y te comprás un libro de Ediciones Libertador y un pancho.'), efectos: [
        { peso: 100, texto: T('Ediciones Libertador y un pancho.'), stats: { guita: 12 } },
      ]},
    ],
  },
  {
    codigo: 'ev35_la_campana_del_candidato', ilustracion: 'afiche', categoria: 'generales', peso: 100, ronda_min: 3,
    titulo: T('La campaña del candidato'),
    texto: T('Vas por la mitad de la carrera. Estás cansado de no poder subirte a ninguna porque no tenés un mango. Hace tres años que solamente te dedicás a estudiar. Es en ese momento que te acercan una oferta misteriosa: armarle la campaña electoral a un candidato ultra sanguinario de los derechos sociales. Pagan bien y podría ser el comienzo de una carrera política prolífica. Si se llegan a enterar tus facuamigos sería el entierro sepulcral.'),
    notas_autor: 'PDF: Guita 3 | nivel: mitad de carrera',
    respuestas: [
      { texto: T('Agarrás el trabajo. Si no se enteran no pasa nada. Además soy un pichi.'), efectos: [
        { peso: 100, texto: T('Agarraste el trabajo.'), stats: { guita: 12 } },
      ]},
      { texto: T('Eso es inmoral y no condice con mis ideales. Mi oportunidad ya va a llegar.'), efectos: [
        { peso: 100, texto: T('Te mantuviste firme.'), stats: { guita: -12 } },
      ]},
      { texto: T('Entrás y lo saboteás desde adentro. En caso de descubrirte puede desencadenar en una campaña sucia en contra de toda la facultad. Héroe o villano, no hay lugar para los tibios.'), efectos: [
        { peso: 100, texto: T('Lo saboteaste desde adentro.'), stats: { guita: 12, politica: 12 } },
      ]},
    ],
  },
  {
    codigo: 'ev36_la_beca_y_el_despido', ilustracion: 'plata', categoria: 'generales', peso: 100, fase: 'avanzado',
    titulo: T('La beca y el despido'),
    texto: T('Momento culmine: estás a punto de conseguir una beca y tu viejo se queda sin laburo.'),
    notas_autor: 'PDF: Guita 4 | nivel: avanzado',
    respuestas: [
      { texto: T('Entrás a trabajar en McDonalds. La beca puede esperar un año, aunque quizá no se repita nunca. Ayudás a la familia.'), efectos: [
        { peso: 100, texto: T('Ayudaste a la familia.'), stats: { guita: 12, conocimiento: -12 } },
      ]},
      { texto: T('Entrás a trabajar en McDonalds y te matás estudiando para llegar a la beca. Las posibilidades bajan porque te recomendaron hacer dedicación total. Si presentás un trabajo de mierda vas a defraudar a la cátedra.'), efectos: [
        { peso: 100, texto: T('Presentaste un trabajo flojo.'), stats: { conocimiento: -12, fama: -12 } },
      ]},
      { texto: T('Te peleás con tu familia a muerte. Hay riesgo de que te echen de tu casa y tengas que mudarte a lo de tu abuela, que vive a tres horas de la facultad. Quemás sus ahorros para subsistir.'), efectos: [
        { peso: 100, texto: T('Quemaste los ahorros.'), stats: { guita: -12, conocimiento: 12 } },
      ]},
    ],
  },
  {
    codigo: 'ev37_practicas_educativas', ilustracion: 'facultad', categoria: 'generales', peso: 100,
    titulo: T('Prácticas educativas'),
    texto: T('Tenés que completar las "Prácticas educativas" del nuevo plan de estudios.'),
    notas_autor: 'PDF: Guita 5',
    respuestas: [
      { texto: T('Las completás en una empresa.'), efectos: [
        { peso: 100, texto: T('En realidad te metieron a trabajar precarizado en un call center. No aprendiste nada de la carrera, pero la experiencia te sirve para el CV. Te juran que cuando tengas el título te ponen en blanco.'), stats: { guita: 12, conocimiento: -12 } },
      ]},
      { texto: T('Hacés un taller de investigación con práctica territorial.'), efectos: [
        { peso: 100, texto: T('Hiciste un lindo informe pero te embarraste las zapatillas y, aunque las limpiaste con Vanish, se echaron a perder. Así es la calle, pibe.'), stats: { guita: -12, conocimiento: 12 } },
      ]},
    ],
  },
  {
    codigo: 'ev38_8_horas_por_200_000', ilustracion: 'facultad', categoria: 'generales', peso: 100,
    titulo: T('8 horas por $200.000'),
    texto: T('Llegó una oferta laboral a través del mail de la carrera: 8 horas por día, $200.000 al mes, pero tenés el perfil perfecto para el puesto.'),
    notas_autor: 'PDF: Guita 6',
    respuestas: [
      { texto: T('Tirás el CV.'), efectos: [
        { peso: 30, texto: T('Quedaste.'), stats: { guita: 12, conocimiento: 12 } },
        { peso: 70, texto: T('No quedaste.'), stats: { guita: -12, conocimiento: 12 } },
      ]},
      { texto: T('No tirás. Lo bueno ya va a llegar. Seguís usando tus horas libres para leer a Durkheim.'), efectos: [
        { peso: 100, texto: T('Seguís con Durkheim.'), stats: { conocimiento: 12 } },
      ]},
    ],
  },
  {
    codigo: 'ev39_no_alcanza_para_nada', ilustracion: 'plata', categoria: 'generales', peso: 100, ronda_min: 4,
    titulo: T('No alcanza para nada'),
    texto: T('No aumentan la beca Sarmiento hace meses y no te alcanza para nada.'),
    notas_autor: 'PDF: Guita 7',
    respuestas: [
      { texto: T('Timbear en el sinoca de Puerto Madero. El rojo es tu mejor amigo.'), efectos: [
        { peso: 100, texto: T('Timbeaste.'), stats: { guita: -12, fama: 12 } },
      ]},
      { texto: T('A partir de ahora solo vas a comer empanadas de perro. Dicen que provocan amnesia.'), efectos: [
        { peso: 100, texto: T('Empanadas de perro.'), stats: { guita: 12, conocimiento: -22 } },
      ]},
      { texto: T('Dejás la carrera. Estudiar es para los giles.'), efectos: [
        { peso: 100, termina_partida: true, es_abandono: true, texto: T('Dejaste la carrera.'), stats: { guita: 22 } },
      ]},
    ],
  },
  {
    codigo: 'ev40_becas_de_trabajo_en_el_comed', ilustracion: 'plata', categoria: 'generales', peso: 100,
    titulo: T('Becas de trabajo en el comedor'),
    texto: T('Abren las postulaciones para las becas de trabajo para laburar en el comedor. Pero en realidad estás en contra de la conducción: tenés tweets bardeando al presidente del CeXSo.'),
    notas_autor: 'PDF: Guita 8',
    respuestas: [
      { texto: T('Borrás todo y te hacés pasar por el militante más fiel de todos.'), efectos: [
        { peso: 100, texto: T('Borraste todo.'), stats: { guita: 22, fama: -12, politica: 12 } },
      ]},
      { texto: T('Entrás pero se la boqueás a todos. En una de esas te comés algún bife.'), efectos: [
        { peso: 100, texto: T('Se la boqueaste a todos.'), stats: { guita: 22, politica: -12 } },
      ]},
      { texto: T('No comprás con el CeXSo. Completás el formulario con los datos de tu mayor enemigo.'), efectos: [
        { peso: 100, texto: T('Completaste el formulario con los datos de tu enemigo.'), stats: { fama: 12, politica: -22 } },
      ]},
    ],
  },
  {
    codigo: 'ev41_la_plata_de_la_nona', ilustracion: 'plata', categoria: 'generales', peso: 100,
    titulo: T('La plata de la nona'),
    texto: T('Tu abuela te dio plata para que te compraras los libros para la cursada. Ella lucha contra la muerte para verte con el título. Pero el mismo día un amigo te hace una oferta irresistible: las últimas entradas de reventa para el Gran Rex de Fama y Guita.'),
    notas_autor: 'PDF: Guita 9',
    respuestas: [
      { texto: T('El sentido de vivir es transitar la experiencia por sí misma. El título ya va a llegar.'), efectos: [
        { peso: 100, texto: T('Fuiste al Gran Rex.'), stats: { conocimiento: -12, fama: 22 } },
      ]},
      { texto: T('Me parte al medio la nona. Lo hago más por ella que por mí.'), efectos: [
        { peso: 100, texto: T('Compraste los libros.'), stats: { conocimiento: 22 } },
      ]},
    ],
  },
  {
    codigo: 'ev42_el_que_vende_los_parciales', ilustracion: 'plata', categoria: 'generales', peso: 100,
    titulo: T('El que vende los parciales'),
    texto: T('Venís medio flojo con el estudio y escuchás que un tipo te pasa el modelo de parcial que vos le pidas a cambio de unos billetes.'),
    notas_autor: 'PDF: Guita 10',
    respuestas: [
      { texto: T('Le pedís los resultados de todos los parciales que tenés que dar este cuatri.'), efectos: [
        { peso: 50, texto: T('Te sacaste de encima una materia pesadísima de la carrera gracias al tipo. Cuando lo buscás para agradecerle, no lo encontrás.'), stats: { guita: -22, conocimiento: 22 } },
        { peso: 50, texto: T('Al pagarle se saca una máscara corte Scooby-Doo y te revela que era el director de la carrera. Te ponen una marca en el título que dice que sos tremendo gil y que te intentaste machetear. Ah, y se hizo el boludo con la guita y nunca te la devolvió.'), stats: { guita: -35, conocimiento: -22, fama: -12, politica: -12 } },
      ]},
      { texto: T('Le pedís los resultados de un solo parcial, tanta guita no tenés, wacho.'), efectos: [
        { peso: 50, texto: T('Te sacaste el único 10 en tu carrera hasta ahora. Tus viejos te felicitan.'), stats: { guita: -12, conocimiento: 12 } },
        { peso: 50, texto: T('Al pagarle se saca una máscara corte Scooby-Doo y te revela que era el director de la carrera. Te ponen una marca en el título que dice que sos tremendo gil y que te intentaste machetear. Ah, y se hizo el boludo con la guita y nunca te la devolvió.'), stats: { guita: -35, conocimiento: -22, fama: -12, politica: -12 } },
      ]},
      { texto: T('Te desconocés de la situación, no te querés meter en cosas raras.'), efectos: [
        { peso: 100, texto: T('Desaprobaste uno de los 3 parciales que tenías. Nada mal para haber estudiado dos días antes.'), stats: { conocimiento: -12 } },
      ]},
    ],
  },
  {
    codigo: 'ev43_la_bicicleta_al_costado_de_l', ilustracion: 'libro', categoria: 'generales', peso: 100, ronda_min: 3,
    titulo: T('La bicicleta al costado de las vías'),
    texto: T('Reventó el Roca y tenés que llegar al recuperatorio. Ves una bicicleta tirada al costado de las vías. Está baqueteada pero hasta Consti capaz que tira. Si no llegás tenés que recursar la materia. Es la que te falta para desbloquear optativas.'),
    notas_autor: 'PDF: Conocimiento 1 | nivel: mitad de carrera',
    respuestas: [
      { texto: T('Te arriesgás para llegar al parcial y robás la bici.'), efectos: [
        { peso: 100, texto: T('Riesgo de linchamiento masivo. Los sentimientos reprimidos por el pueblo en contra del gobierno son esparcidos sobre tu cabeza. La cana no se mete para salvarte. De tantas piñas quedás tonto y borrás de tu cabeza todo lo que viste el último cuatri. Te roban hasta las zapatillas.'), stats: { guita: -12, conocimiento: -12, violencia: 20 } },
      ]},
      { texto: T('Emprendés un discurso a viva voz demostrando todo lo que leíste.'), efectos: [
        { peso: 50, texto: T('La gente te sigue y te convertís en un líder genuino de la clase obrera.'), stats: { conocimiento: 22, fama: 22, politica: 22 } },
        { peso: 50, texto: T('La gente te ignora y una señora al pasar te suelta un "zurdo de mierda" con garso incluido. Te tragás la frustración y mejorás la oratoria.'), stats: { conocimiento: 12, fama: -12 } },
      ]},
    ],
  },
  {
    codigo: 'ev44_el_porro_antes_del_final', ilustracion: 'libro', categoria: 'generales', peso: 100,
    titulo: T('El porro antes del final'),
    texto: T('Te quedás estudiando hasta tarde con tu compa. Te nota muy tenso y saca algo que te podría ayudar: un porro. No fumaste nunca en tu vida.'),
    notas_autor: 'PDF: Conocimiento 2',
    respuestas: [
      { texto: T('Fumar.'), efectos: [
        { peso: 50, texto: T('Te relaja y potencia tus conocimientos. Al otro día entrás a rendir relajado e imparable.'), stats: { conocimiento: 22 } },
        { peso: 50, texto: T('Pegó mal y terminás vomitando. Quedaste de cama toda la noche recordando a tu ex. Al otro día en el examen no pensás en otra cosa más que en cuando salían a tomar helado.'), stats: { conocimiento: 22 } },
      ]},
      { texto: T('Vas a la segura y lidiás con los nervios a la antigua.'), efectos: [
        { peso: 50, texto: T('Al otro día no te va tan bien por el cagazo. Aprobás pero vas a final.'), stats: { conocimiento: -12 } },
        { peso: 50, texto: T('De tanto nervio estás hecho agua y no podés parar de cagarte. No llegás a concentrarte y encima quedás como el pedorro de FSoC. El titular larga un "abran las ventanas, no puede haber tanto olor a mierda".'), stats: { fama: -12 } },
      ]},
    ],
  },
  {
    codigo: 'ev45_el_autor_del_que_nadie_habla', ilustracion: 'libro', categoria: 'generales', peso: 100,
    titulo: T('El autor del que nadie habla'),
    texto: T('Te anotaste a cuatro materias este cuatrimestre y no podés con tu vida. En medio de la bibliografía obligatoria encontraste un autor raro del que nadie habla. Te fascina y querés meterte a leer todos sus libros.'),
    notas_autor: 'PDF: Conocimiento 3',
    respuestas: [
      { texto: T('La curiosidad es más grande que vos. No podés negar tu instinto. Podés empezar un largo camino como especialista del autor, aunque corrés el riesgo de que no le importe a nadie más que a vos y a tus amiguitos nerds.'), efectos: [
        { peso: 50, texto: T('Dejaste todo por lo que te emocionaba. El titular te apadrinó. Aprobaste una materia de cuatro. Tenés asegurado el carguito de profe de práctico para cuando te recibas. En una de esas escribís un libro.'), stats: { conocimiento: 12, politica: 12 } },
        { peso: 50, texto: T('Le metiste a full pero te pinchaste. Te diste cuenta de por qué no le daban tanta pelota en la academia. De igual manera estás orgulloso de vos: nunca habías sido tan valiente por algo en lo que creías.'), stats: { conocimiento: 12, politica: 12 } },
      ]},
      { texto: T('La prioridad es aprobar las materias. Cuanto antes te egreses, antes vas a tener tiempo para investigar lo que quieras.'), efectos: [
        { peso: 80, texto: T('No lo retomás y muere en el olvido.'), stats: { conocimiento: -12 } },
        { peso: 20, texto: T('Lo retomás en el verano y hacés una monografía. Lo bueno sabe esperar.'), stats: { conocimiento: 12 } },
      ]},
      { texto: T('Escribís un artículo reducido para un fanzine boludo que circula por la facultad con lo que ya viste en la materia. Te interesa pero dedicarle tanto esfuerzo te parece al pedo.'), efectos: [
        { peso: 100, texto: T('Salió el fanzine.'), stats: { fama: 12 } },
      ]},
    ],
  },
  {
    codigo: 'ev46_la_monografia_que_no_pediste', ilustracion: 'libro', categoria: 'generales', peso: 100,
    titulo: T('La monografía que no pediste'),
    texto: T('La profesora titular está encantada con vos. Quiere que escribas una monografía sobre uno de los libros que vieron en la materia. Te fue bien, pero a vos en realidad te chupa medio un huevo.'),
    notas_autor: 'PDF: Conocimiento 4',
    respuestas: [
      { texto: T('Lo hacés para no dejarla en banda.'), efectos: [
        { peso: 100, texto: T('Capaz que ahora no, pero a la larga te puede acercar a los temas que te interesan.'), stats: { conocimiento: -12, fama: 12 } },
      ]},
      { texto: T('Le decís que sí pero lo pateás.'), efectos: [
        { peso: 100, texto: T('Lo olvidaste completamente. Era una prueba encubierta para recomendarte a una beca. La próxima será.'), stats: { conocimiento: -12, politica: -12 } },
      ]},
      { texto: T('Le decís que no, que en realidad no estás interesado.'), efectos: [
        { peso: 50, texto: T('La charla termina desencadenando en un tema que realmente te interesa y te pasa un contacto de alguien que te podría ayudar. Te agradece por haber sido sincero.'), stats: { fama: 12, politica: 12 } },
        { peso: 50, texto: T('"En esta facultad todos hablan pero nadie quiere laburar", suelta, y se va. No te vuelve a hablar ni para saludarte.'), stats: { fama: -12, politica: -12 } },
      ]},
    ],
  },
  {
    codigo: 'ev47_cuatro_horas_de_teorico_y_un', ilustracion: 'libro', categoria: 'generales', peso: 100,
    titulo: T('Cuatro horas de teórico y una lija tremenda'),
    texto: T('Venís de un teórico de cuatro horas y todavía te falta cursar el práctico. Estás limado y tenés una lija tremenda.'),
    notas_autor: 'PDF: Conocimiento 5',
    respuestas: [
      { texto: T('Dos empanadas de carne y una de cheeseburger con cocucha en el Rip Pizza de la esquina. Son muy baratas y la procedencia de la materia prima es dudosa.'), efectos: [
        { peso: 50, texto: T('Te intoxicás y te internan. A la semana sale la noticia de que estas cadenas usaban un combinado de carne perruna y humana para las empanadas.'), stats: { conocimiento: -12, fama: 12 } },
        { peso: 50, texto: T('Zafaste de la intoxicación.'), stats: { guita: 22 } },
      ]},
      { texto: T('Le hacés caso al señor misterioso de la puerta con gorrito que vende pancito relleno caliente.'), efectos: [
        { peso: 100, texto: T('A los cinco minutos el señor se ganó el Quini y te regala dos panes más. Te sentís Jesús. La suerte se reparte. Vas al práctico y la rompés todita. Te convertís en el favorito de la profe.'), stats: { guita: 12, conocimiento: 12, politica: 12 } },
      ]},
      { texto: T('Comés en el comedor del centro.'), efectos: [
        { peso: 100, texto: T('La que atiende te empieza a preguntar por la situación académica. Te habla sobre la crisis nacional que ya conocés. No sabés cómo fugarte y te perdés todo el práctico. Ahora no sabés qué entra en el parcial.'), stats: { guita: -12, conocimiento: -12, politica: 12 } },
      ]},
    ],
  },
  {
    codigo: 'ev48_el_pelado_de_teoria_politica', ilustracion: 'facultad', categoria: 'generales', peso: 100,
    titulo: T('El pelado de teoría política'),
    texto: T('Te encontrás en una clase de teoría política cuando un pelado se sienta delante tuyo y su brillo capilar no te permite ver el pizarrón.'),
    notas_autor: 'PDF: Conocimiento 6',
    respuestas: [
      { texto: T('Le tapás la pelada con una toalla.'), efectos: [
        { peso: 100, texto: T('Te levanta de la silla y te caga a piñas. El tipo perdió la beca, vos un diente.'), stats: { guita: -12, fama: 12, violencia: 20 } },
      ]},
      { texto: T('Le pedís si no le jode que se corra un poquitín nomás.'), efectos: [
        { peso: 100, texto: T('¡Se da vuelta y te das cuenta de que es Larreta! Te pide perdón y te pide apuntes de teoría política, que se encuentra re perdido. Se hacen amigos y te invita a su banda de jazz.'), stats: { conocimiento: 12, politica: 22 } },
      ]},
      { texto: T('Te levantás para cambiarte de lugar.'), efectos: [
        { peso: 100, texto: T('Encontrás un lugar al lado de un gordo que está comiendo fideos con tuco de un tupper calentado en un microondas. El olor ni te deja pensar.'), stats: { conocimiento: -12 } },
      ]},
      { texto: T('Te la bancás.'), efectos: [
        { peso: 100, texto: T('Intentaste anotar lo que pudiste, y lo que no se lo pediste a tus compañeros, pero estás seguro de que un par de graduaciones en los anteojos aumentaron.'), stats: { conocimiento: 12 } },
      ]},
    ],
  },
  {
    codigo: 'ev49_el_tramite_imposible', ilustracion: 'libro', categoria: 'generales', peso: 100,
    titulo: T('El trámite imposible'),
    texto: T('Un docente con el que tenés buena onda te recomienda que curses una materia en otra carrera en la que él es titular. Es la oportunidad de conocer otros autores, gente diferente, y querés dejar de leer a Marx por un cuatri. Pero no tenés ni puta idea de cómo se hace el trámite. ¿Qué hacés?'),
    notas_autor: 'PDF: Conocimiento 7',
    respuestas: [
      { texto: T('Preguntás en el departamento de alumnos, que es el lugar más seguro para ir.'), efectos: [
        { peso: 100, texto: T('Nadie sabe nada, es al pedo. Fuiste derrotado por Yacobitti y la burocracia universitaria.'), stats: { conocimiento: -50, politica: -50 } },
      ]},
      { texto: T('Les preguntás a los del centro de estudiantes.'), efectos: [
        { peso: 100, texto: T('Los del Ya Casta te convencen de que participes en una charla para combatir el fascismo burocrático de la UBA.'), stats: { conocimiento: -25, fama: 12 } },
      ]},
      { texto: T('Tu amigo te pasa el WhatsApp de la secretaria de tu carrera para pedirle ayuda.'), efectos: [
        { peso: 100, texto: T('Te indica qué hacer y cómo llenar todo.'), stats: { conocimiento: 25, politica: 25 } },
      ]},
    ],
  },
  {
    codigo: 'ev50_vinieron_a_tapar_los_murales', ilustracion: 'facultad', categoria: 'generales', peso: 100,
    titulo: T('Vinieron a tapar los murales'),
    texto: T('Entraron unos libertarios a tapar murales.'),
    notas_autor: 'PDF: Fama 1',
    respuestas: [
      { texto: T('Pegar trompadas. Riesgo de sanción. Perdés un cuatrimestre.'), efectos: [
        { peso: 100, texto: T('Te suspendieron por boludo pero sos el héroe del progresismo en las redes sociales.'), stats: { conocimiento: -12, fama: 12, politica: 12, violencia: 20 } },
      ]},
      { texto: T('Vas al patio gay a rezar.'), efectos: [
        { peso: 100, texto: T('No sirvió de nada pero te convertiste en mártir gay porque un estudiante de Comu te grabó.'), stats: { conocimiento: 12, fama: 12, politica: 12 } },
      ]},
      { texto: T('Vas a estudiar para el parcial de Nocera. Todavía te faltan 22 autores.'), efectos: [
        { peso: 100, texto: T('No llegaste a estudiar todo y encima sos cagón.'), stats: { conocimiento: -12, fama: -12 } },
      ]},
    ],
  },
  {
    codigo: 'ev51_los_noteros', ilustracion: 'camara', categoria: 'generales', peso: 100,
    titulo: T('Los noteros'),
    texto: T('Vienen unos noteros a la facultad a preguntar por la situación universitaria.'),
    notas_autor: 'PDF: Fama 2',
    respuestas: [
      { texto: T('Ponés la cara.'), efectos: [
        { peso: 50, texto: T('Tartamudeás y no respondés a la pregunta del conductor más facho del país. Dejaste a los universitarios como unos boludos. El video recorrió todos los medios por tres días.'), stats: { fama: 12, politica: -12 } },
        { peso: 50, texto: T('Ponés la cara y la rompés. Te convertís en el chad de Sociales. Ahora sos famoso: algunos te dicen que sos un capo cuando te ven pasar y te llaman de otros medios.'), stats: { fama: 12, politica: 12 } },
      ]},
      { texto: T('Seguís de largo. Mejor que hable otro.'), efectos: [
        { peso: 100, texto: T('No sumás ni restás puntos.') },
      ]},
    ],
  },
  {
    codigo: 'ev52_el_dia_de_la_expulsion', ilustracion: 'alerta', categoria: 'generales', peso: 100,
    titulo: T('El día de la expulsión'),
    texto: T('Hace un tiempo que se viene hablando sobre un acosador dentro de la facultad. En los grupos ya se organizaron y se dictaminó el día en el que será expulsado.'),
    notas_autor: 'PDF: Fama 3',
    respuestas: [
      { texto: T('Te parás adelante de la movilización y lo llevás de los pelos hasta la comisaría. Corrés el riesgo de comerte algún bife y una contramovilización de parte de una agrupación en contra de las "denuncias falsas".'), efectos: [
        { peso: 100, texto: T('La fama es fama venga de quien venga. Te hacés famoso. Amado y odiado por ambos lados.'), stats: { fama: 22, violencia: 20 } },
      ]},
      { texto: T('Te parás en el vértice y formás parte del grupo que lo atrapa para poder echarlo.'), efectos: [
        { peso: 100, texto: T('Le gritás alguna cosa pero no mucho más. Generás confraternidad entre compañeros y terminás haciendo amigos que respiran como vos el aire de la venganza social.'), stats: { fama: 12, politica: 12 } },
      ]},
      { texto: T('Te desentendés del caso. Seguro son las feministas con sus cuentos. En esta facultad no estudia nadie.'), efectos: [
        { peso: 100, texto: T('Te desentendiste.'), stats: { fama: -12, politica: -12 } },
      ]},
    ],
  },
  {
    codigo: 'ev53_el_pucho_de_la_salida', ilustracion: 'plaza', categoria: 'generales', peso: 100,
    titulo: T('El pucho de la salida'),
    texto: T('Salís a las 23 de cursar y te querés fumar un pucho. Vas a...'),
    notas_autor: 'PDF: Fama 4',
    respuestas: [
      { texto: T('La plaza seca.'), efectos: [
        { peso: 100, texto: T('Te quedaste charlando con unos militantes que te invitaron al otro día a una actividad que te copó.'), stats: { politica: 12 } },
      ]},
      { texto: T('El patio gay.'), efectos: [
        { peso: 100, texto: T('Mientras fumabas viste que algo se movía. Prendés la linterna del celular y lo ves a Adorno en una mesa jugando póker con el director de Comu. "¿Qué te pasa, pibe? ¿Te debo algo?", dice el enano. Al otro día lo contás. Nadie te cree pero a todos les gusta la historia. Pasás a ser "el loco del enano".'), stats: { fama: 22 } },
      ]},
    ],
  },
  {
    codigo: 'ev54_dejar_una_huella', ilustracion: 'facultad', categoria: 'generales', peso: 100,
    titulo: T('Dejar una huella'),
    texto: T('Tenés miedo de pasar por la facultad sin pena ni gloria. Te gustaría dejar una huella, ser recordado por algo. Tenés que inventar algo para remontarla.'),
    notas_autor: 'PDF: Fama 5',
    respuestas: [
      { texto: T('"Revivamos el pos-porno".'), efectos: [
        { peso: 100, texto: T('Te ponés a hacer perfos y flashearla artística. Hay gente que piensa que es ridículo, otros tienen miedo de que haya problema con el gobierno, y otros se convierten en tus fans. Giro y sigo.'), stats: { fama: 12, politica: -12 } },
      ]},
      { texto: T('"Hagamos una revista provocadora".'), efectos: [
        { peso: 100, texto: T('Hacés tu propio fanzine en el que tus artículos generan controversia por el nivel de delirio: proponés arancelar los baños, poner molinetes en la biblioteca y suspender el buffet. Ahora las agrupaciones te dicen lumpen.'), stats: { fama: -12, politica: 12 } },
      ]},
      { texto: T('"Ser apadrinado por un profesor reconocido".'), efectos: [
        { peso: 100, texto: T('Te quedás charlando al final de las clases, te sumás al grupo de estudios, escribís un par de artículos.'), stats: { conocimiento: 12, fama: -12 } },
      ]},
    ],
  },
  {
    codigo: 'ev55_te_anotas_para_hablar', ilustracion: 'multitud', categoria: 'generales', peso: 100,
    titulo: T('¿Te anotás para hablar?'),
    texto: T('Vas a una asamblea. Escuchás lo que dicen pero nada te convence del todo. ¿Te anotás para hablar?'),
    notas_autor: 'PDF: Fama 6',
    respuestas: [
      { texto: T('Sí, me anoto.'), efectos: [
        { peso: 50, texto: T('La rompés toda.'), stats: { guita: -12, fama: 12, politica: 12 } },
        { peso: 50, texto: T('Uh... dijiste cualquier cosa y encima te rascaste la verga delante de todos sin darte cuenta. Los memes van a quedar para la posteridad. Te defendés diciendo que es IA.'), stats: { conocimiento: -12, fama: 22, politica: -12 } },
      ]},
      { texto: T('No, dejar pasar.'), efectos: [
        { peso: 100, texto: T('Dejaste pasar.'), stats: { guita: 12, conocimiento: -12, fama: -12, politica: -12 } },
      ]},
    ],
  },
  {
    codigo: 'ev56_la_reunion_con_el_director', ilustracion: 'profesor', categoria: 'generales', peso: 100, ronda_min: 4,
    titulo: T('La reunión con el director'),
    texto: T('Vas a una reunión de la facultad. El director de tu carrera menciona cambios estructurales que a muchos no les copan.'),
    notas_autor: 'PDF: Fama 7',
    respuestas: [
      { texto: T('Me paro enfrente de todos y lo puteo de arriba a abajo.'), efectos: [
        { peso: 10, texto: T('Todos tus compañeros se paran a aplaudirte, a la chica que le tenés ganas le sacás una sonrisa, el director de la carrera queda avergonzado. Sos el campeón del pueblo.'), stats: { conocimiento: -12, fama: 22, politica: 12 } },
        { peso: 90, termina_partida: true, texto: T('Te echaron de la facultad con una patada en el culo.'), stats: { fama: -12, politica: -22 } },
      ]},
      { texto: T('Me quedo callado.'), efectos: [
        { peso: 100, texto: T('Bajás la cabeza y escuchás dos horas más de las peores propuestas políticas que escuchaste en tu vida.'), stats: { conocimiento: 12 } },
      ]},
    ],
  },
  {
    codigo: 'ev57_en_cual_militas', ilustracion: 'multitud', categoria: 'generales', peso: 100,
    titulo: T('¿En cuál militás?'),
    texto: T('Te invitan a militar en diferentes agrupaciones.'),
    notas_autor: 'PDF: Política 1',
    respuestas: [
      { texto: T('Alternativa Ariemica.'), efectos: [
        { peso: 100, texto: T('Te sumaste a Alternativa Ariemica'), stats: { guita: 12, politica: 12 } },
      ]},
      { texto: T('La UElla.'), efectos: [
        { peso: 100, texto: T('Te sumaste a La UElla.'), stats: { fama: 12, politica: 12 } },
      ]},
      { texto: T('F.O.S: Fulbito de los Obreros Sindicalistas.'), efectos: [
        { peso: 100, texto: T('Te sumaste al F.O.S.'), stats: { guita: -12, conocimiento: 12, politica: 12 } },
      ]},
      { texto: T('No curtís ese mambo, te movés tranqui piola sin berretín. Sos un intelectual de libre pensamiento.'), efectos: [
        { peso: 100, texto: T('Te quedaste afuera.'), stats: { guita: 12, fama: -12, politica: -12 } },
      ]},
    ],
  },
  {
    codigo: 'ev58_faltan_fideos', ilustracion: 'comida', categoria: 'generales', peso: 100,
    titulo: T('Faltan fideos'),
    texto: T('Un facuamigo te invita a participar de la olla popular que él lidera los jueves. Hizo mal el cálculo y faltan fideos.'),
    notas_autor: 'PDF: Política 2',
    respuestas: [
      { texto: T('Lo salís a bancar y cubrís el costo a medias con él. Es por una buena causa.'), efectos: [
        { peso: 70, texto: T('Te quedás sin plata para cargar la SUBE. Vas a tener que saltar el molinete y correr. Quedás como el héroe de la gente y de tu amigo.'), stats: { guita: 12, fama: 12, politica: 12 } },
        { peso: 30, texto: T('Caés detenido y salís en un spot publicitario de las fuerzas de seguridad de José Blackri.'), stats: { guita: -12, fama: -12 } },
      ]},
      { texto: T('Donde comen dos comen tres. Proponés repartir porciones más chicas pero comen todos.'), efectos: [
        { peso: 100, texto: T('Comieron todos.'), stats: { politica: 12 } },
      ]},
      { texto: T('Mandás al frente a tu amigo. Creés que te lo hizo a propósito para que pongas plata. No volvés a sumarte a una movida así. Es para quilombo.'), efectos: [
        { peso: 100, texto: T('Lo mandaste al frente.'), stats: { fama: -22, politica: -12 } },
      ]},
    ],
  },
  {
    codigo: 'ev59_los_rumores_eran_ciertos', ilustracion: 'multitud', categoria: 'generales', peso: 100,
    titulo: T('Los rumores eran ciertos'),
    texto: T('Escuchaste un ruido extraño en un aula oscura del subsuelo. Mirás adentro y no podés creer lo que ves: ¡los rumores eran ciertos! Ves a una militante del Ya Casta cerrando un trato con la trieja de Lilita Carrió, Guillermo Moreno y Lilia Lemoine.'),
    notas_autor: 'PDF: Política 3',
    respuestas: [
      { texto: T('Sacás una foto y la hacés pública.'), efectos: [
        { peso: 100, texto: T('La agrupación política se desintegra en una marea roja de sangre y decepción. Quedás como el estudiante que hizo lo que nadie pudo y todos te quieren de su lado.'), stats: { politica: 12 } },
      ]},
      { texto: T('Entrás y te miran.'), efectos: [
        { peso: 100, texto: T('Te sumás a ellos: "vamos mitad y mitad y acá no pasó nada, muchachos". Te llenás los bolsillos de plata, Carrió te convida un pucho, el Guillote te palmea la espalda y Lilia te invita un clona. Todos felices.'), stats: { guita: 12 } },
      ]},
    ],
  },
  {
    codigo: 'ev60_el_ejercito_de_militantes', ilustracion: 'multitud', categoria: 'generales', peso: 100,
    titulo: T('El ejército de militantes'),
    texto: T('Época de elecciones. Llegás a la facultad y ves un ejército de militantes listos para implorarte por tu voto.'),
    notas_autor: 'PDF: Política 4',
    respuestas: [
      { texto: T('Les decís a todos que ya votaste.'), efectos: [
        { peso: 100, texto: T('Llegás temprano a clase.'), stats: { conocimiento: 12, politica: -12 } },
      ]},
      { texto: T('Te quedás escuchando a cada uno.'), efectos: [
        { peso: 100, texto: T('Llegás tarde a la cursada y te duele la cabeza.'), stats: { conocimiento: -12, politica: 12 } },
      ]},
      { texto: T('Te quedás callado.'), efectos: [
        { peso: 100, texto: T('Se ponen a discutir entre ellos, dos pibas se agarran de las mechas y las tenés que separar. Llegás tarde a clase pero ahora sos el domador de militantes.'), stats: { conocimiento: -12, fama: 12 } },
      ]},
    ],
  },
  {
    codigo: 'ev61_cuatro_agrupaciones_al_hilo', ilustracion: 'multitud', categoria: 'generales', peso: 100,
    titulo: T('Cuatro agrupaciones al hilo'),
    texto: T('Pasan cuatro agrupaciones al hilo en el práctico. Para colmo en el aula son solo vos y el docente.'),
    notas_autor: 'PDF: Política 5',
    respuestas: [
      { texto: T('Sos un estudiante comprometido con la ultra-seria militancia universitaria. Acá es donde empieza el cambio del mundo. Esos dispenser de agua no se van a poner solos.'), efectos: [
        { peso: 100, texto: T('Te comprometiste.'), stats: { politica: 12 } },
      ]},
      { texto: T('Decidís hacerte el NPC y hacés como que sí con la cabeza, pero en realidad estás soñando con acariciarle la pelada a Foucault.'), efectos: [
        { peso: 100, texto: T('Hiciste el NPC.'), stats: { politica: -12 } },
      ]},
      { texto: T('Hacés notar tu molestia. Alto apático.'), efectos: [
        { peso: 100, texto: T('Una agrupación se enoja y saca un reel: "Denunciamos un nuevo ataque fascista...".'), stats: { fama: -12, politica: -12 } },
      ]},
    ],
  },
  {
    codigo: 'ev62_hacer_pasadas', ilustracion: 'afiche', categoria: 'generales', peso: 100,
    titulo: T('Hacer pasadas'),
    texto: T('Una compañera te invita a hacer pasadas con ella. Te da un poco de vergüenza pero te parece copada y quizás sea una experiencia divertida.'),
    notas_autor: 'PDF: Política 6',
    respuestas: [
      { texto: T('Te sumás a todas.'), efectos: [
        { peso: 100, texto: T('Hacés 40 pasadas al hilo. Sucumbís ante la alienación política y te convertís en un autómata. Ahora solo podés repetir el mismo discurso una y otra vez.'), stats: { conocimiento: -12, fama: 12, politica: 12 } },
      ]},
      { texto: T('No comprás ni ahí.'), efectos: [
        { peso: 100, texto: T('No compraste.'), stats: { conocimiento: 12, fama: -12, politica: -12 } },
      ]},
      { texto: T('Accedés a hacer las pasadas.'), efectos: [
        { peso: 100, texto: T('A la tercera pasada te confiesa que le chupa un huevo. Pela un porro y van a la plaza seca a escuchar a Los Redondos. Te revela que en realidad era Duki Green Son.'), stats: { fama: 12, politica: -12 } },
      ]},
    ],
  },
  {
    codigo: 'ev63_la_revolucion_social_tiene_q', ilustracion: 'afiche', categoria: 'generales', peso: 100, fase: 'ingresante',
    titulo: T('La revolución social tiene que llegar'),
    texto: T('Unos chicos en las afueras de la facultad te dieron un panfleto que dice: LA REVOLUCIÓN SOCIAL TIENE que llegar.'),
    notas_autor: 'PDF: Historia 1 | nivel: ingresante',
    respuestas: [
      { texto: T('Te sumás a la propuesta.'), efectos: [
        { peso: 100, texto: T('Te abrazan, te dan una remera y te suman a su grupo con una sonrisa. Vas a cambiar el mundo.'), stats: { fama: 12, politica: 12 } },
      ]},
      { texto: T('Usás el panfleto como filtro para unos puchos.'), efectos: [
        { peso: 100, texto: T('Fuera de joda, muy buena idea: te ahorrás unos mangos estas semanas.'), stats: { guita: 12 } },
      ]},
    ],
  },
  {
    codigo: 'ev64_protesta_en_la_puerta_de_olg', ilustracion: 'multitud', categoria: 'generales', peso: 100, fase: 'ingresante',
    titulo: T('Protesta en la puerta de OLGA'),
    texto: T('Tus amigos de LA REVOLUCIÓN SOCIAL te informan que el sábado que viene a las 7 de la mañana se van a juntar en las afueras de OLGA para protestar, pero vos tenés un final para el que no estudiaste nada.'),
    notas_autor: 'PDF: Historia 2 | nivel: ingresante',
    respuestas: [
      { texto: T('Más vale que vas, con carteles en mano y un sueño en el corazón.'), efectos: [
        { peso: 50, texto: T('Estuvieron esperando tres horas en el frío hasta que uno se dio cuenta de que las grabaciones las hacen los domingos. A las 3 de la tarde. Ah, y desaprobaste el final.'), stats: { conocimiento: -22 } },
        { peso: 50, texto: T('Estuvieron toda la grabación del podcast en las afueras, en el frío. Las personas pasaban, algunos miraban de reojo, algunas abuelas se acercaban a preguntar qué estaban haciendo. El cambio social es inminente.'), stats: { conocimiento: -12, fama: 12, politica: 12 } },
      ]},
      { texto: T('Te hacés el boludo y ni leés el mensaje de WhatsApp.'), efectos: [
        { peso: 100, texto: T('Te dicen que no hay problema, que ya en la siguiente te vas a unir. Zafaste.'), stats: { conocimiento: 12 } },
      ]},
    ],
  },
  {
    codigo: 'ev65_la_juntada_intelectual', ilustracion: 'afiche', categoria: 'generales', peso: 100, fase: 'ingresante',
    titulo: T('La juntada intelectual'),
    texto: T('Tus amigos de LA REVOLUCIÓN SOCIAL te invitan a una juntada intelectual patrocinada por su grupo. Te dicen que cuantas más personas vayan, mejor, así conocen el cambio social.'),
    notas_autor: 'PDF: Historia 3 | nivel: ingresante',
    respuestas: [
      { texto: T('Invitás a todos tus conocidos, incluso a la nona: no se va a morir sin antes escuchar sobre LA REVOLUCIÓN SOCIAL.'), efectos: [
        { peso: 50, texto: T('La juntada intelectual se terminó convirtiendo en una joda cuando los números ya llegaron a las centenas. Le desvalijaron la casa a tu amigo y salieron en TN hablando sobre su propuesta.'), stats: { guita: -22, fama: 22, politica: 22 } },
        { peso: 50, texto: T('Reenviaste la invitación por todos los grupos de amigos, a tu familia, a tu ex, la subiste a tus historias. Perdiste 23 seguidores, tu tía te bloqueó y ninguno de tus conocidos fue a la juntada. Bueno, la nona, que siempre te hace el aguante.'), stats: { fama: -22 } },
      ]},
      { texto: T('Decís como que los invitaste pero en realidad no lo pensás hacer.'), efectos: [
        { peso: 50, texto: T('Te creen y, mirá vos qué mala suerte, nadie apareció. Ellos están felices igual de tenerte en la causa.'), stats: { politica: 12 } },
        { peso: 50, texto: T('Dijiste que lo subiste a Instagram y a tus grupos de WhatsApp pero no te creen una mierda. Te echan de la causa.'), stats: { fama: -12, politica: -22 } },
      ]},
    ],
  },
  {
    codigo: 'ev66_la_interna_por_el_movimiento', ilustracion: 'multitud', categoria: 'generales', peso: 100, fase: 'intermedio',
    titulo: T('La interna por el movimiento'),
    texto: T('El líder del movimiento de LA REVOLUCIÓN SOCIAL terminó la carrera y dejó el movimiento. Te presentás para ocupar el lugar y tu amigo, el que te introdujo al movimiento, es la oposición.'),
    notas_autor: 'PDF: Historia 4 | nivel: intermedio',
    respuestas: [
      { texto: T('Aplicás tus conocimientos de política y en tu discurso inventás cada guasada sobre el pasado de tu oposición.'), efectos: [
        { peso: 50, texto: T('El resto del grupo no lo puede creer: ese chico que tenían en tan altos estándares, con el que se juntaron a protestar y a tomar mate tantas veces, era un necrofílico que robaba las carteras a las señoras que esperaban los colectivos. Luego de una semana de campaña el chico dejó la carrera y vos ganaste el puesto.'), stats: { conocimiento: 12, fama: 22, politica: 22 } },
        { peso: 50, texto: T('No convencés a nadie. El chico gana la carrera política en la que pusiste tanta guita y esfuerzo. ¿Su primer decreto? Echarte de la causa.'), stats: { fama: -22, politica: -35 } },
      ]},
      { texto: T('Te presentás con un guion bien armado donde prometés lo mismo que prometías en tu secundario para ser delegado: más recreos, que las materias sean más fáciles y que LA REVOLUCIÓN SOCIAL venga antes.'), efectos: [
        { peso: 100, texto: T('Los votos fueron unánimes, incluso la oposición te votó. Salieron del lugar todos cantando tu nombre. La revolución está más cerca.'), stats: { conocimiento: 12, fama: 22, politica: 22 } },
      ]},
    ],
  },
  {
    codigo: 'ev67_a_quien_promocionas', ilustracion: 'multitud', categoria: 'generales', peso: 100, fase: 'avanzado',
    titulo: T('¿A quién promocionás?'),
    texto: T('Al acercarte al final de tu carrera todos en tu causa de LA REVOLUCIÓN SOCIAL te ven como el futuro San Martín, alguien que va a liberar la condena de la actualidad. Te vas a las grandes ligas, pero dejás el movimiento universitario en manos de tus compañeros. Se acercan las elecciones y quieren saber a quién promocionás.'),
    notas_autor: 'PDF: Historia 5 | nivel: avanzado',
    respuestas: [
      { texto: T('Bancás a la chica nueva de primer año que está llena de ideales y una voluntad de hierro.'), efectos: [
        { peso: 100, texto: T('La chica te agradece, llora en tus hombros y te promete que LA REVOLUCIÓN SOCIAL llegará. No termina el cuatrimestre y te enterás de que la echaron de la facultad y prohibieron el movimiento, porque se puso en bolas en medio de una clase y se agarró a piñas con un ayudante.'), stats: { fama: -12, politica: -22 } },
      ]},
      { texto: T('Bancás al chico de cuarto año que tiene más calle y puede avanzar más el movimiento, pero que intuís que puede hacerlo solo para empujar su propia agenda política.'), efectos: [
        { peso: 100, texto: T('El chico gana las elecciones y no notás un gramo de felicidad en su mirada. Te da mala espina. Pasan los meses y escuchás que todos tus excompañeros dejaron el movimiento porque el chico "los vendió al sistema".'), stats: { guita: 22, politica: -12 } },
      ]},
    ],
  },
];

module.exports = { eventosImportados };
