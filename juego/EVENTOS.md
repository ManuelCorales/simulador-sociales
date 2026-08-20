# Porcentaje de aparición de cada evento

Medido simulando **40 000 partidas con elecciones al azar**. El porcentaje es *en qué
proporción de partidas aparece esa carta*, no cuántas veces sale en total.

Regenerable: la cuenta está al pie de este archivo.

## Cómo se eligen

Cada ronda el motor arma una **bolsa** con todos los eventos que todavía no salieron y
que pasan sus restricciones, y sortea uno **ponderado por su `peso`**. Se sortean 6 por
partida sobre un catálogo de 38, así que si todos pesaran igual y ninguno tuviera
restricciones, cada uno saldría en el **15,8%** de las partidas.

Los pesos van de 100 a 140. Eso solo mueve la aguja unos pocos puntos: **lo que
realmente decide es si el evento está atado a una fase.**

---

## Los 32 eventos sin restricción

Compiten en las seis rondas. Salen entre 15,7% y 18,9%, y el orden lo da el peso.

| Sale en | Peso | Categoría | Evento |
|---|---|---|---|
| 18,9% | 120 | fama | El día de la expulsión |
| 18,5% | 120 | generales | El último bondi |
| 18,3% | 120 | generales | David Lynch en la plaza seca |
| 18,2% | 115 | fama | Los noteros |
| 18,1% | 115 | generales | Clase muy embolante |
| 18,1% | 115 | fama | Vinieron a tapar los murales |
| 18,1% | 115 | politica | El ejército de militantes |
| 18% | 115 | guita | Turno noche en la hamburguesería |
| 18% | 115 | fama | ¿Te anotás para hablar? |
| 17,9% | 115 | generales | Final a las cinco de la tarde |
| 17,9% | 115 | conocimiento | El autor del que nadie habla |
| 17,6% | 115 | politica | Faltan fideos |
| 17,4% | 110 | generales | ¿Por qué siguen acumulando? |
| 17,4% | 110 | fama | Dejar una huella |
| 17,3% | 110 | conocimiento | La monografía que no pediste |
| 17,2% | 110 | generales | El que pide plata |
| 17,1% | 110 | generales | Trabajo de investigación |
| 17,1% | 110 | guita | La plata de la nona |
| 17,1% | 110 | conocimiento | Cuatro horas de teórico y una lija tremenda |
| 16,9% | 110 | conocimiento | El porro antes del final |
| 16,8% | 105 | generales | El que no para de decir boludeces |
| 16,8% | 105 | politica | Hacer pasadas |
| 16,5% | 105 | generales | El after y el Pity |
| 16,5% | 105 | guita | Prácticas educativas |
| 16,5% | 105 | guita | 8 horas por $200.000 |
| 16,5% | 105 | guita | Becas de trabajo en el comedor |
| 16,4% | 105 | politica | Los rumores eran ciertos |
| 16,4% | 105 | politica | Cuatro agrupaciones al hilo |
| 16,2% | 105 | guita | El mega libro del titular |
| 15,8% | 100 | generales | El fan de Charles Manson |
| 15,7% | 100 | generales | La sala de radio |
| 15,7% | 100 | fama | El pucho de la salida |

---

## Los 6 eventos atados a una fase o a una ronda

Acá está la distorsión grande. Un evento limitado a una fase solo puede salir en **2 de
las 6 rondas**, así que compite en un tercio de los sorteos. El peso no lo compensa:
*La beca y el despido* tiene el peso más alto del juego (140) y aun así sale menos que
cualquier evento sin restricción.

| Sale en | Peso | Categoría | Evento | Limitación | Rondas |
|---|---|---|---|---|---|
| 10,4% | 120 | guita | No alcanza para nada | ronda >= 4 | 4-6 |
| 8,4% | 140 | guita | La beca y el despido | fase avanzado | 5-6 |
| 7% | 130 | guita | La campaña del candidato | fase intermedio | 3-4 |
| 7% | 125 | conocimiento | La bicicleta al costado de las vías | fase intermedio | 3-4 |
| 6,8% | 130 | politica | ¿En cuál militás? | fase ingresante | 1-2 |
| 5,8% | 110 | generales | ¿Dónde vas a estudiar? | fase ingresante | 1-2 |

---

## Avisos

Los avisos no salen de la bolsa: aparecen en los dos slots fijos de la partida y se
eligen según **qué decisiones tomaste**. Los de familia cubren cualquier respuesta según
cuál fue su cambio de stat más grande; los cuatro *propios* están escritos para una
respuesta puntual.

| Sale en | Aviso | Tipo |
|---|---|---|
| 45,3% | Mail de dos líneas | familia |
| 34,9% | Te escribieron | familia |
| 25,8% | Se corrió la bola | familia |
| 24,2% | Te devolvieron el parcial | familia |
| 19,5% | Llamada de tu vieja | familia |
| 15,7% | Te citaron | familia |
| 12,1% | Salió una historia | familia |
| 9,8% | Figurás con deuda | familia |
| 4,2% | av_pity | **propio** |
| 2,6% | av_linchamiento | **propio** |
| 2,4% | Dejaron de hablar | familia |
| 1,4% | av_grupo_investigacion | **propio** |
| 0,4% | av_campania | **propio** |

---

## Tres cosas que saltan de estos números

**La carta de apertura casi no se ve.** *¿Dónde vas a estudiar?* es temáticamente el
evento con el que arranca una carrera y sale en el 5,8% de las partidas: está atado a
la fase ingresante, que ahora son dos rondas, y compite contra 33 eventos más. Si
querés que sea la bienvenida, hay que forzarlo en la ronda 1 en vez de dejarlo al
sorteo.

**Los cuatro avisos escritos a mano casi no aparecen.** *av_campania* sale en el 0,4% de
las partidas y *av_grupo_investigacion* en el 1,4%, porque dependen de pegarle a una
respuesta concreta de un evento que ya de por sí sale una de cada seis veces. Los de
familia se llevan todo el trabajo. Si el aviso propio te importa, conviene subirle el
peso al evento que lo dispara o escribir avisos propios para más respuestas.

**Los pesos están haciendo muy poco.** Entre el evento más pesado sin restricción (120)
y el más liviano (100) hay 3 puntos de diferencia en la práctica: 18,9% contra 15,7%.
Si querés que algunas cartas se sientan claramente más frecuentes que otras, el rango
de pesos tiene que ser mucho más ancho.

---

## Cómo regenerar esta lista

```bash
node --no-warnings -e "
const m=require('./engine'); const N=40000, c={};
for(let i=0;i<N;i++){
  const e=m.crearPartida({nombre:'x',genero:'m'}); let g=0; const v=new Set();
  while(!e.terminada&&g++<40){const p=m.siguiente(e); if(p.tipo==='final')break;
    if(p.tipo==='minijuego'){m.resolverMinijuego(e,Math.random()*100);continue;}
    v.add(p.evento.codigo);
    m.responder(e,p.respuestas[Math.floor(Math.random()*p.respuestas.length)].id);}
  v.forEach(x=>c[x]=(c[x]??0)+1);}
Object.entries(c).sort((a,b)=>b[1]-a[1])
  .forEach(([k,v])=>console.log(k.padEnd(26)+(v/N*100).toFixed(1)+'%'));
"
```
