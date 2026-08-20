# Los 24 finales y cómo se llega a cada uno

Fuente de la verdad: el array `finales` de `db/contenido.js`. Si lo tocás, actualizá
esto. Los porcentajes salen de simular **20 000 partidas con elecciones al azar**; jugando
con intención, cada uno se puede buscar a propósito.

## Las tres bandas

Al terminar, cada uno de los cuatro stats cae en una banda de puntaje fija, igual para
todos y definida de antemano:

| Banda | Puntaje |
|---|---|
| **BAJA** | 0 a 30 |
| **MEDIA** | 31 a 41 |
| **ALTA** | 42 a 100 |

El final sale de la **combinación** de bandas. No importa el valor exacto ni cómo se
comparan los stats entre sí: importa en qué banda cayó cada uno.

## Cómo leer las condiciones

Los finales se evalúan **en orden de prioridad, de mayor a menor, y gana el primero que
da**. Por eso cada uno declara solo lo mínimo: *Consultor garca* pide únicamente `Guita
≥ 42` porque, si además hubieras llegado a 42 en otro stat, alguno de los finales de dupla
o de trío ya habría ganado antes de llegar ahí.

La columna **Qué significa en la práctica** dice la condición completa.

---

## Fuera de las bandas: ganan siempre

| Prioridad | Final | Condición | Qué significa en la práctica | Sale |
|---|---|---|---|---|
| 2000 | **Secret ending** | `violencia ≥ 30` | El contador oculto de violencia llegó a 30. Pisa cualquier otro final, sin importar los cuatro stats | 6,8% |
| 1500 | **El que se fue** | partida abandonada | Tomaste la salida de carrera (la beca Sarmiento en *No alcanza para nada*). Corta la partida ahí mismo | 5,1% |

---

## Las cuatro en ALTA

| Prioridad | Final | Condición | Qué significa en la práctica | Sale |
|---|---|---|---|---|
| 1000 | **Decano en diez años** | los cuatro `≥ 42` | Guita, conocimiento, fama y política, todo arriba al mismo tiempo | 2,8% |

---

## Tres en ALTA — el trío se nombra por el que falta

El cuarto stat puede quedar en media o en baja, da igual: si también llegara a 42, saldría
*Decano*.

| Prioridad | Final | Condición | El que falta | Sale |
|---|---|---|---|---|
| 903 | **Prócer sin sueldo** | Conocimiento, Fama y Política `≥ 42` | Guita | 7,4% |
| 902 | **El que nunca leyó a Weber** | Guita, Fama y Política `≥ 42` | Conocimiento | 4,0% |
| 901 | **Operador en las sombras** | Guita, Conocimiento y Política `≥ 42` | Fama | 2,3% |
| 900 | **Apolítico de manual** | Guita, Conocimiento y Fama `≥ 42` | Política | 2,7% |

---

## Dos en ALTA

En los seis casos, la condición completa es *esos dos `≥ 42` y ninguno de los otros dos
llega a 42*.

| Prioridad | Final | Condición | Sale |
|---|---|---|---|
| 805 | **Terrible tecnócrata** | Conocimiento y Política `≥ 42` | 5,9% |
| 804 | **Sos Menem** | Fama y Política `≥ 42` | 8,3% |
| 803 | **Influencer con marca propia** | Fama y Guita `≥ 42` | 3,9% |
| 802 | **Sociólogo de consultora** | Guita y Conocimiento `≥ 42` | 5,4% |
| 801 | **Lobista con carnet** | Guita y Política `≥ 42` | 3,6% |
| 800 | **Panelista con doctorado** | Conocimiento y Fama `≥ 42` | 5,2% |

---

## Una en ALTA y las otras tres en BAJA — el monomaníaco

Estos cuatro son los más difíciles de sacar: además de llegar a 42 en uno, hay que dejar
los otros tres **por debajo de 31**. Son los finales de colección.

| Prioridad | Final | Condición | Sale |
|---|---|---|---|
| 753 | **Plata y nada más** | Guita `≥ 42`, los otros tres `≤ 30` | 1,3% |
| 752 | **Erudito de pensión** | Conocimiento `≥ 42`, los otros tres `≤ 30` | 1,1% |
| 751 | **Conocido por nada** | Fama `≥ 42`, los otros tres `≤ 30` | 0,7% |
| 750 | **Militante a tiempo completo** | Política `≥ 42`, los otros tres `≤ 30` | 0,8% |

---

## Una en ALTA, con algo de resto

Igual que los de arriba, pero con **al menos uno de los otros tres en la banda media**
(31-41). Si estuvieran los tres en baja, saldría el monomaníaco correspondiente.

| Prioridad | Final | Condición | Sale |
|---|---|---|---|
| 703 | **Consultor garca** | Guita `≥ 42` | 6,0% |
| 702 | **Investigador del CONICET** | Conocimiento `≥ 42` | 7,5% |
| 701 | **Influencer de ciencias sociales** | Fama `≥ 42` | 5,4% |
| 700 | **Puntero con unidad básica** | Política `≥ 42` | 5,8% |

---

## Ninguna en ALTA

| Prioridad | Final | Condición | Qué significa en la práctica | Sale |
|---|---|---|---|---|
| 650 | **El promedio perfecto** | los cuatro entre `31` y `41` | Los cuatro en la banda media, sin excepción | 0,4% |
| 600 | **El fantasma del pasillo** | los cuatro `≤ 30` | Los cuatro en baja | 0,5% |
| 0 | **Graduado** *(default)* | ninguna otra dio | Ningún stat llega a 42 y quedaron mezclados entre baja y media | 6,9% |

---

## Cuál cuesta más

Lo que separa a los fáciles de los difíciles no es llegar alto, es **dejar algo abajo**.
Los cuatro monomaníacos piden 42 en un stat y menos de 31 en los otros tres al mismo
tiempo, y por eso salen entre 0,7% y 1,3%. *El promedio perfecto* es el más esquivo de
todos (0,4%): necesita que los cuatro caigan en una franja de once puntos.

Los más frecuentes son los de dupla y trío, que solo piden empujar dos o tres cosas para
arriba y no exigen nada del resto.

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
