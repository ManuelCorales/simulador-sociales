# Porcentaje de aparición de cada evento

Medido simulando **40 000 partidas con elecciones al azar**. El porcentaje es *en qué
proporción de partidas aparece esa carta*, no cuántas veces sale en total.

Se regenera con el comando que está al pie.

## Cómo se eligen

Cada ronda el motor arma una **bolsa** con todos los eventos que todavía no salieron y
que pasan sus restricciones, y sortea uno ponderado por su `peso`. Se sortean 6 por
partida sobre un catálogo de 67, así que sin restricciones cada uno saldría en el
**9,0%** de las partidas.

Hoy **todos los eventos pesan 100**: el importador no lee peso del Excel porque el Excel
no lo trae. Lo único que diferencia a un evento de otro es si está atado a una fase o a
una ronda mínima.

---

## Los 56 eventos sin restricción

Compiten en las seis rondas y salen todos entre 9,4% y 10,1%: la diferencia es solo ruido del sorteo.

| Sale en | Evento |
|---|---|
| 10,1% | Inscripciones por el SIU |
| 10,1% | Prácticas educativas |
| 10,1% | Dejar una huella |
| 10% | El que no para de hablar |
| 10% | La marcha universitaria |
| 10% | El porro antes del final |
| 10% | La monografía que no pediste |
| 9,9% | El fan de Charles Manson |
| 9,9% | ¿Chorro o gil? |
| 9,9% | El profesor en la calle |
| 9,9% | Estás fusilado |
| 9,9% | 8 horas por $200.000 |
| 9,9% | El que vende los parciales |
| 9,9% | El día de la expulsión |
| 9,8% | El que pide plata |
| 9,8% | ¿Dónde vas a estudiar? |
| 9,8% | Trabajo de investigación |
| 9,8% | El que no para de decir boludeces |
| 9,8% | ¿Por qué siguen acumulando? |
| 9,8% | ¿Era linda? |
| 9,8% | Sumate a ser un Therian |
| 9,8% | Las máquinas del kiosco |
| 9,8% | La madriguera de los therians |
| 9,8% | Parcial mañana, once de la noche |
| 9,8% | Becas de trabajo en el comedor |
| 9,8% | El autor del que nadie habla |
| 9,8% | El pelado de teoría política |
| 9,8% | El trámite imposible |
| 9,8% | Los noteros |
| 9,8% | El pucho de la salida |
| 9,8% | Cuatro agrupaciones al hilo |
| 9,7% | El último bondi |
| 9,7% | Final a las cinco de la tarde |
| 9,7% | El after y el Pity |
| 9,7% | Michael Jackson en la puerta |
| 9,7% | El médico te receta anteojos |
| 9,7% | El argentino más importante |
| 9,7% | Jueves de feria |
| 9,7% | Turno noche en la hamburguesería |
| 9,7% | El mega libro del titular |
| 9,7% | Cuatro horas de teórico y una lija tremenda |
| 9,7% | Vinieron a tapar los murales |
| 9,7% | ¿Te anotás para hablar? |
| 9,7% | ¿En cuál militás? |
| 9,7% | El ejército de militantes |
| 9,6% | La sala de radio |
| 9,6% | ¿A qué hora ponés la alarma? |
| 9,6% | El campamento anticapitalista |
| 9,6% | Los rumores eran ciertos |
| 9,6% | Hacer pasadas |
| 9,5% | La jauría en el patio gay |
| 9,5% | Llueve y hay mate en el buffet |
| 9,5% | La plata de la nona |
| 9,5% | Faltan fideos |
| 9,4% | David Lynch en la plaza seca |
| 9,4% | Clase muy embolante |

---

## Los 11 eventos atados a una fase o a una ronda

Un evento limitado a una fase solo puede salir en **2 de las 6 rondas**, así que compite
en un tercio de los sorteos y sale más o menos a un tercio de frecuencia.

Los cinco con `ronda >= 4` son los que pueden **cortar la partida** (la muerte en el
ataque armado, la expulsión, el abandono) más los que el PDF marcaba para la segunda
mitad de la carrera. Se los corre a propósito: si salieran en la ronda 1, la partida
podría terminar en la primera carta. Sin esa regla le pasaba al 1% de los jugadores.

| Sale en | Evento | Limitación | Rondas |
|---|---|---|---|
| 6,7% | La campaña del candidato | ronda >= 3 | 3-6 |
| 6,6% | La bicicleta al costado de las vías | ronda >= 3 | 3-6 |
| 5,1% | La reunión con el director | ronda >= 4 | 4-6 |
| 5% | Entra un grupo armado | ronda >= 4 | 4-6 |
| 5% | No alcanza para nada | ronda >= 4 | 4-6 |
| 3,3% | La beca y el despido | fase avanzado | 5-6 |
| 3,3% | La revolución social tiene que llegar | fase ingresante | 1-2 |
| 3,3% | La juntada intelectual | fase ingresante | 1-2 |
| 3,3% | La interna por el movimiento | fase intermedio | 3-4 |
| 3,3% | ¿A quién promocionás? | fase avanzado | 5-6 |
| 3,2% | Protesta en la puerta de OLGA | fase ingresante | 1-2 |

---

## Avisos

**No hay avisos cargados.** Los 13 que había se borraron junto con los eventos viejos.
Los dos slots de la partida siguen configurados en `configuracion.avisos_en_rondas`, y
el motor los saltea cuando no encuentra ninguno, así que hoy la partida son 9 cartas:
6 eventos y 3 minijuegos.

Para volver a tenerlos alcanza con llenar `avisosDeFamilia` en `db/contenido.js`: el
seed les asigna solo un aviso a cada efecto según cuál fue su cambio de stat más grande.

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
  .forEach(([k,v])=>console.log(k.padEnd(36)+(v/N*100).toFixed(1)+'%'));
"
```
