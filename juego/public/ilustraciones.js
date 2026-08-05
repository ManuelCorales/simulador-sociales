// =====================================================================
//  Biblioteca de ilustraciones para las cartas.
//  Trazo grueso monocromo al estilo REIGNS. Heredan el color del texto
//  (currentColor), así que funcionan igual sobre fondo claro u oscuro.
//  Se repiten a propósito: 16 dibujos para 42 eventos.
//
//  Los estilos van como atributos y no como clases CSS, para que el SVG
//  se vea igual si lo abrís suelto, lo exportás o lo pegás en otro lado.
// =====================================================================

// Relleno de masa: mancha suave del mismo color, sin contorno.
const M = 'fill="currentColor" stroke="none" opacity=".16"';

const marco = (arte) => `
<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <g fill="none" stroke="currentColor" stroke-width="3.4"
     stroke-linecap="round" stroke-linejoin="round">${arte}</g>
</svg>`;

const ILUSTRACIONES = {

  // --- Docente, cátedra, autoridad. Calvo, barba y anteojos. ---
  profesor: marco(`
    <path ${M} d="M46 178c2-33 20-56 42-62h24c22 6 40 29 42 62z"/>
    <path d="M46 178c2-33 20-56 42-62"/>
    <path d="M154 178c-2-33-20-56-42-62"/>
    <path d="M88 116l12 25 12-25"/>
    <path ${M} d="M74 54h52v30a26 26 0 0 1-52 0z"/>
    <path d="M74 84V60a26 26 0 0 1 52 0v24a26 26 0 0 1-52 0z"/>
    <path d="M76 96c4 16 13 24 24 24s20-8 24-24"/>
    <path d="M70 58c6-6 14-10 30-10s24 4 30 10"/>
    <circle cx="88" cy="70" r="9"/><circle cx="112" cy="70" r="9"/><path d="M97 70h6"/>
    <path d="M92 88h16"/>`),

  // --- Estudiante. Gorro y auriculares. ---
  estudiante: marco(`
    <path ${M} d="M48 178c2-31 18-52 40-58h24c22 6 38 27 40 58z"/>
    <path d="M48 178c2-31 18-52 40-58"/>
    <path d="M152 178c-2-31-18-52-40-58"/>
    <path d="M86 124l28 54"/>
    <path ${M} d="M76 58h48v24a24 24 0 0 1-48 0z"/>
    <path d="M76 82V62a24 24 0 0 1 48 0v20a24 24 0 0 1-48 0z"/>
    <path ${M} d="M70 60c0-19 13-32 30-32s30 13 30 32z"/>
    <path d="M70 60c0-19 13-32 30-32s30 13 30 32"/>
    <path d="M66 60h68"/>
    <path d="M64 82a36 34 0 0 1 72 0"/>
    <path ${M} d="M56 80h14v26H56z"/><rect x="56" y="80" width="14" height="26" rx="6"/>
    <path ${M} d="M130 80h14v26h-14z"/><rect x="130" y="80" width="14" height="26" rx="6"/>
    <path d="M88 76h2M110 76h2"/>`),

  // --- Asamblea, movilización, elecciones ---
  multitud: marco(`
    <path ${M} d="M6 178c0-20 12-32 28-32s28 12 28 32zM50 178c0-22 13-35 30-35s30 13 30 35zM104 178c0-20 12-32 28-32s28 12 28 32zM148 178c0-19 11-30 26-30s26 11 26 30z"/>
    <circle ${M} cx="34" cy="122" r="15"/><circle ${M} cx="80" cy="112" r="17"/>
    <circle ${M} cx="132" cy="122" r="15"/><circle ${M} cx="174" cy="126" r="14"/>
    <circle cx="34" cy="122" r="15"/><path d="M6 178c0-20 12-32 28-32s28 12 28 32"/>
    <circle cx="80" cy="112" r="17"/><path d="M50 178c0-22 13-35 30-35s30 13 30 35"/>
    <circle cx="132" cy="122" r="15"/><path d="M104 178c0-20 12-32 28-32s28 12 28 32"/>
    <circle cx="174" cy="126" r="14"/><path d="M148 178c0-19 11-30 26-30s26 11 26 30"/>
    <path d="M58 142L46 96M110 140l10-46"/>
    <path ${M} d="M120 30h46l-11 15 11 15h-46z"/>
    <path d="M120 94V26M120 30h46l-11 15 11 15h-46"/>`),

  // --- Plaza seca, patio, afuera ---
  plaza: marco(`
    <path d="M14 172h172"/>
    <path ${M} d="M30 92a34 32 0 0 1 30-38 30 28 0 0 1 40 16 26 26 0 0 1-16 44 40 36 0 0 1-54-22z"/>
    <path d="M30 92a34 32 0 0 1 30-38 30 28 0 0 1 40 16 26 26 0 0 1-16 44 40 36 0 0 1-54-22z"/>
    <path d="M60 172v-62M60 134l-16-14M60 148l16-16"/>
    <path ${M} d="M112 136h64v10h-64z"/>
    <path d="M108 136h70M108 146h70M116 146v26M170 146v26M118 124h50v12h-50zM122 124v-10M164 124v-10"/>
    <path d="M150 104c8-7 0-13 8-20M164 108c6-5 0-10 6-15"/>`),

  // --- Bondi, tren, transporte ---
  bondi: marco(`
    <path ${M} d="M30 74h146v74H30z"/>
    <rect x="30" y="74" width="146" height="74" rx="12"/>
    <rect x="42" y="86" width="34" height="28" rx="4"/>
    <rect x="86" y="86" width="34" height="28" rx="4"/>
    <rect x="130" y="86" width="34" height="28" rx="4"/>
    <path d="M30 128h146"/>
    <circle cx="62" cy="156" r="15"/><circle cx="146" cy="156" r="15"/>
    <circle ${M} cx="62" cy="156" r="15"/><circle ${M} cx="146" cy="156" r="15"/>
    <circle cx="62" cy="156" r="5"/><circle cx="146" cy="156" r="5"/>
    <circle cx="167" cy="138" r="5"/>
    <path d="M6 90h16M2 108h20M8 126h14"/>`),

  // --- Libros, apuntes, estudio ---
  libro: marco(`
    <path ${M} d="M26 62c22-11 48-11 72 0v80c-24-11-50-11-72 0zM174 62c-22-11-48-11-72 0v80c24-11 50-11 72 0z"/>
    <path d="M26 62c22-11 48-11 72 0v80c-24-11-50-11-72 0z"/>
    <path d="M174 62c-22-11-48-11-72 0v80c24-11 50-11 72 0z"/>
    <path d="M100 60v84"/>
    <path d="M40 86h44M40 100h44M40 114h32M116 86h44M116 100h44M128 114h32"/>
    <path d="M34 158h132M42 172h116"/>`),

  // --- Guita ---
  plata: marco(`
    <g transform="rotate(-7 100 96)">
      <path ${M} d="M32 58h136v74H32z"/>
      <rect x="32" y="58" width="136" height="74" rx="6"/>
      <circle cx="100" cy="95" r="21"/>
      <path d="M100 80v30M92 87h16M92 103h16"/>
      <path d="M46 72h12M142 72h12M46 118h12M142 118h12"/>
    </g>
    <circle ${M} cx="146" cy="152" r="19"/><circle cx="146" cy="152" r="19"/>
    <path d="M146 141v22M139 147h14M139 157h14"/>
    <circle cx="110" cy="160" r="13"/>`),

  // --- Micrófono, radio, cámara, medios ---
  camara: marco(`
    <path ${M} d="M82 24h36v76H82z"/>
    <rect x="82" y="24" width="36" height="76" rx="18"/>
    <path d="M88 44h24M88 58h24M88 72h24"/>
    <path d="M66 74a34 34 0 0 0 68 0"/>
    <path d="M100 108v28"/>
    <path ${M} d="M72 174l10-38h36l10 38z"/>
    <path d="M72 174l10-38h36l10 38z"/>
    <path d="M42 52a40 48 0 0 0 0 72M22 36a60 70 0 0 0 0 104"/>
    <path d="M158 52a40 48 0 0 1 0 72M178 36a60 70 0 0 1 0 104"/>`),

  // --- La facultad ---
  facultad: marco(`
    <path ${M} d="M100 32l74 46H26z"/>
    <path d="M100 32l74 46H26z"/>
    <path ${M} d="M34 78h132v14H34z"/>
    <path d="M34 78h132v14H34z"/>
    <rect x="48" y="92" width="18" height="56"/>
    <rect x="91" y="92" width="18" height="56"/>
    <rect x="134" y="92" width="18" height="56"/>
    <path d="M22 178h156M32 166h136M40 154h120M34 148h132"/>
    <path d="M100 32V10"/>
    <path ${M} d="M100 12h32l-9 11 9 11h-32z"/>
    <path d="M100 12h32l-9 11 9 11h-32"/>`),

  // --- Afiches, campaña, militancia ---
  afiche: marco(`
    <g transform="rotate(-7 62 72)">
      <path ${M} d="M28 32h68v80H28z"/>
      <path d="M28 32h68v80H28z"/>
      <path d="M40 52h44M40 68h44M40 84h28"/>
    </g>
    <g transform="rotate(6 140 64)">
      <path ${M} d="M110 28h60v72h-60z"/>
      <path d="M110 28h60v72h-60z"/>
      <path d="M120 46h40M120 60h40M120 74h26"/>
    </g>
    <path ${M} d="M102 150l40-20v54l-40-20z"/>
    <path d="M102 150l40-20v54l-40-20z"/>
    <path d="M102 140H82v20h20M90 160v14"/>
    <path d="M154 136a28 28 0 0 1 0 28M168 128a42 42 0 0 1 0 44"/>`),

  // --- Comida, olla popular, buffet ---
  comida: marco(`
    <path ${M} d="M44 102h112l-11 64H55z"/>
    <path d="M44 102h112l-11 64H55z"/>
    <path d="M32 94h136"/>
    <path d="M40 106a13 13 0 0 1 0 26M160 106a13 13 0 0 0 0 26"/>
    <path d="M74 80c9-9 0-17 9-26M100 76c9-9 0-17 9-26M126 80c9-9 0-17 9-26"/>
    <path d="M62 166l6 12h64l6-12"/>`),

  // --- Noche, after, fiesta ---
  noche: marco(`
    <path ${M} d="M148 20a42 42 0 1 0 26 66 36 36 0 0 1-26-66z"/>
    <path d="M148 20a42 42 0 1 0 26 66 36 36 0 0 1-26-66z"/>
    <path d="M42 30l4 11 11 4-11 4-4 11-4-11-11-4 11-4z"/>
    <path d="M80 62l3 8 8 3-8 3-3 8-3-8-8-3 8-3z"/>
    <path ${M} d="M42 178v-56c0-9 7-12 7-21V84h18v17c0 9 7 12 7 21v56z"/>
    <path d="M42 178v-56c0-9 7-12 7-21V84h18v17c0 9 7 12 7 21v56z"/>
    <path d="M49 76h18M42 130h32"/>
    <path ${M} d="M100 178l-7-52h36l-7 52z"/>
    <path d="M100 178l-7-52h36l-7 52zM94 144h30"/>`),

  // --- Trámite, mail, formulario ---
  sobre: marco(`
    <path ${M} d="M24 50h152v100H24z"/>
    <rect x="24" y="50" width="152" height="100" rx="8"/>
    <path d="M24 58l76 54 76-54"/>
    <path d="M24 144l56-42M176 144l-56-42"/>
    <path ${M} d="M122 100h44v40h-44z"/>
    <rect x="122" y="100" width="44" height="40" rx="4"/>
    <path d="M144 108l5 10 10 5-10 5-5 10-5-10-10-5 10-5z"/>`),

  // --- Aviso: algo que vuelve de una decisión pasada ---
  alerta: marco(`
    <path ${M} d="M60 138c0-44 7-63 22-70v-6a18 18 0 0 1 36 0v6c15 7 22 26 22 70z"/>
    <path d="M60 138c0-44 7-63 22-70v-6a18 18 0 0 1 36 0v6c15 7 22 26 22 70z"/>
    <path d="M46 138h108"/>
    <path d="M86 152a14 14 0 0 0 28 0"/>
    <path d="M28 84a48 48 0 0 1 16-34M172 84a48 48 0 0 0-16-34"/>
    <path d="M10 96a66 66 0 0 1 22-48M190 96a66 66 0 0 0-22-48"/>`),

  // --- Dejar la carrera: la puerta abierta ---
  puerta: marco(`
    <path d="M30 178h140"/>
    <path d="M56 36h108v142H56z"/>
    <path ${M} d="M72 50h76v128H72z"/>
    <path d="M72 50h76v128H72z"/>
    <path d="M138 114h10"/>
    <path ${M} d="M148 50l34-14v156l-34-14z"/>
    <path d="M148 50l34-14v156l-34-14"/>
    <circle ${M} cx="106" cy="92" r="14"/><circle cx="106" cy="92" r="14"/>
    <path ${M} d="M84 178c0-42 10-64 22-64s22 22 22 64z"/>
    <path d="M84 178c0-42 10-64 22-64s22 22 22 64"/>`),

  // --- Recibirse ---
  birrete: marco(`
    <path ${M} d="M100 38l76 32-76 32-76-32z"/>
    <path d="M100 38l76 32-76 32-76-32z"/>
    <path ${M} d="M58 88v38c0 14 19 24 42 24s42-10 42-24V88z"/>
    <path d="M58 88v38c0 14 19 24 42 24s42-10 42-24V88"/>
    <path d="M176 70v46"/>
    <circle ${M} cx="176" cy="126" r="10"/>
    <circle cx="176" cy="126" r="10"/>`),
};

// Si un evento no tiene ilustración asignada, se usa esta.
const ILUSTRACION_DEFECTO = 'facultad';

function ilustracion(codigo) {
  return ILUSTRACIONES[codigo] || ILUSTRACIONES[ILUSTRACION_DEFECTO];
}
