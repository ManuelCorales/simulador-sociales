# Los 24 finales y cómo se llega a cada uno

Fuente de la verdad: el array `finales` de `db/contenido.js`. Si lo tocás, actualizá
esto. Los porcentajes salen de simular **20 000 partidas con elecciones al azar** sobre los 67 eventos del PDF; jugando
con intención, cada uno se puede buscar a propósito.

## Las tres bandas

Al terminar, cada uno de los cuatro stats cae en una banda de puntaje fija, igual para
todos y definida de antemano:

| Banda | Puntaje |
|---|---|
| **BAJA** | 0 a 36 |
| **MEDIA** | 37 a 59 |
| **ALTA** | 60 a 100 |

El final sale de la **combinación** de bandas. No importa el valor exacto ni cómo se
comparan los stats entre sí: importa en qué banda cayó cada uno.

## Cómo leer las condiciones

Los finales se evalúan **en orden de prioridad, de mayor a menor, y gana el primero que
da**. Por eso cada uno declara solo lo mínimo: *Consultor garca* pide únicamente
`Guita ≥ 60` porque, si además hubieras llegado a 60 en otro stat, alguno de los finales
de dupla o de trío ya habría ganado antes de llegar ahí.

La columna **Qué significa en la práctica** dice la condición completa.

---

## Fuera de las bandas: ganan siempre

| Prioridad | Final | Condición | Qué significa en la práctica | Sale |
|---|---|---|---|---|
| 2000 | **Secret ending** | `violencia ≥ 30` | El contador oculto de violencia llegó a 30. Pisa cualquier otro final, sin importar los cuatro stats | 5,0% |
| 1500 | **El que se fue** | partida abandonada | Tomaste la salida de carrera (la beca Sarmiento en *No alcanza para nada*). Corta la partida ahí mismo | 1,6% |

---

## Las cuatro en ALTA

| Prioridad | Final | Condición | Qué significa en la práctica | Sale |
|---|---|---|---|---|
| 1000 | **Decano en diez años** | los cuatro `≥ 60` | Guita, conocimiento, fama y política, todo arriba al mismo tiempo | 2,2% |

---

## Tres en ALTA — el trío se nombra por el que falta

El cuarto stat puede quedar en media o en baja, da igual: si también llegara a 60, saldría
*Decano*.

| Prioridad | Final | Condición | El que falta | Sale |
|---|---|---|---|---|
| 903 | **Prócer sin sueldo** | Conocimiento, Fama y Política `≥ 60` | Guita | 5,3% |
| 902 | **El que nunca leyó a Weber** | Guita, Fama y Política `≥ 60` | Conocimiento | 2,8% |
| 901 | **Operador en las sombras** | Guita, Conocimiento y Política `≥ 60` | Fama | 2,8% |
| 900 | **Apolítico de manual** | Guita, Conocimiento y Fama `≥ 60` | Política | 2,1% |

---

## Dos en ALTA

En los seis casos, la condición completa es *esos dos `≥ 60` y ninguno de los otros dos
llega a 60*.

| Prioridad | Final | Condición | Sale |
|---|---|---|---|
| 805 | **Terrible tecnócrata** | Conocimiento y Política `≥ 60` | 6,0% |
| 804 | **Sos Menem** | Fama y Política `≥ 60` | 5,5% |
| 803 | **Influencer con marca propia** | Fama y Guita `≥ 60` | 4,3% |
| 802 | **Sociólogo de consultora** | Guita y Conocimiento `≥ 60` | 7,2% |
| 801 | **Lobista con carnet** | Guita y Política `≥ 60` | 3,3% |
| 800 | **Panelista con doctorado** | Conocimiento y Fama `≥ 60` | 4,6% |

---

## Una en ALTA y las otras tres en BAJA — el monomaníaco

Estos cuatro son los más difíciles de sacar: además de llegar a 60 en uno, hay que dejar
los otros tres **por debajo de 37**. Son los finales de colección.

| Prioridad | Final | Condición | Sale |
|---|---|---|---|
| 753 | **Plata y nada más** | Guita `≥ 60`, los otros tres `≤ 36` | 1,3% |
| 752 | **Erudito de pensión** | Conocimiento `≥ 60`, los otros tres `≤ 36` | 0,7% |
| 751 | **Conocido por nada** | Fama `≥ 60`, los otros tres `≤ 36` | 0,3% |
| 750 | **Militante a tiempo completo** | Política `≥ 60`, los otros tres `≤ 36` | 0,3% |

---

## Una en ALTA, con algo de resto

Igual que los de arriba, pero con **al menos uno de los otros tres en la banda media**
(37-59). Si estuvieran los tres en baja, saldría el monomaníaco correspondiente.

| Prioridad | Final | Condición | Sale |
|---|---|---|---|
| 703 | **Consultor garca** | Guita `≥ 60` | 8,8% |
| 702 | **Investigador del CONICET** | Conocimiento `≥ 60` | 11,1% |
| 701 | **Influencer de ciencias sociales** | Fama `≥ 60` | 6,2% |
| 700 | **Puntero con unidad básica** | Política `≥ 60` | 4,7% |

---

## Ninguna en ALTA

| Prioridad | Final | Condición | Qué significa en la práctica | Sale |
|---|---|---|---|---|
| 650 | **El promedio perfecto** | los cuatro entre `37` y `59` | Los cuatro en la banda media, sin excepción | 1,6% |
| 600 | **El fantasma del pasillo** | los cuatro `≤ 36` | Los cuatro en baja | 0,5% |
| 0 | **Graduado** *(default)* | ninguna otra dio | Ningún stat llega a 60 y quedaron mezclados entre baja y media | 11,9% |

---

## Cuál cuesta más

Lo que separa a los fáciles de los difíciles no es llegar alto, es **controlar dónde no
llegás**. Los cuatro monomaníacos piden 60 en un stat y menos de 37 en los otros tres al
mismo tiempo, y por eso salen entre 0,3% y 1,3%.

Los dos más esquivos son los que exigen las cuatro bandas iguales: *El fantasma del
pasillo* (0,4%) necesita los cuatro stats en 36 o menos, y *El promedio perfecto* (1,6%)
que los cuatro caigan dentro de la misma franja de veintitrés puntos.

Los más frecuentes son los de una sola alta y los de dupla, que piden empujar una o dos
cosas para arriba y no exigen nada del resto.

## Para probarlos sin jugar

```
http://localhost:3000/?final=fin_puro_fama
```

Los códigos son los de `db/contenido.js`: `fin_secreto`, `fin_abandono`, `fin_decano`,
`fin_sin_guita`, `fin_sin_conocimiento`, `fin_sin_fama`, `fin_sin_politica`,
`fin_tecnocrata`, `fin_menem`, `fin_influencer`, `fin_consultora`, `fin_lobista`,
`fin_panelista`, `fin_puro_guita`, `fin_puro_conocimiento`, `fin_puro_fama`,
`fin_puro_politica`, `fin_guita`, `fin_conocimiento`, `fin_fama`, `fin_politica`,
`fin_promedio`, `fin_fantasma`, `fin_default`.

Con `?dev` se abre el panel, que los lista todos en un desplegable.
