// ===== LELO, LA MASCOTA DE EN PARALELO 🐼 =====
// Panda que salta por la pantalla impulsándose con los bordes y los paneles
// de cristal. Se le puede atrapar (baja las gafas y suelta el bocadillo de la
// newsletter) y, al llegar a la sección de audio, se posa y pide subir el volumen.

(function () {
  if (document.getElementById('lelo-panda')) return;

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var mobileMq = window.matchMedia('(max-width: 768px)');

  // ---------- SPRITE ----------
  var SVG =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 248 300" aria-hidden="true">' +
    '<g class="p-sprite">' +
    '<g stroke="#14120f" stroke-width="6" stroke-linejoin="round" stroke-linecap="round">' +
    // patas
    '<rect class="p-leg-l" x="90" y="240" width="30" height="46" rx="14" fill="#2b2b2e"/>' +
    '<rect class="p-leg-r" x="128" y="240" width="30" height="46" rx="14" fill="#2b2b2e"/>' +
    // cuerpo blanco
    '<path d="M78 188 Q72 258 124 260 Q176 258 170 188 Z" fill="#f5f1e8"/>' +
    // camiseta
    '<path d="M72 158 Q70 146 84 142 L164 142 Q178 146 176 158 L172 212 Q124 222 76 212 Z" fill="#191919"/>' +
    // El nombre va aquí, antes que los brazos: así al cruzarlos quedan por
    // delante y lo tapan, como pasaría de verdad.
    '<text class="p-tee" x="124" y="186" text-anchor="middle" font-family="Outfit, Arial, sans-serif" font-weight="700" font-size="28" fill="#f2ecc9" stroke="none">lelo</text>' +
    // brazos
    '<path class="p-arm-l" d="M78 154 Q54 174 57 206 Q58 219 71 217 Q83 213 83 194 L86 162 Z" fill="#2b2b2e"/>' +
    '<path class="p-arm-r" d="M170 154 Q194 174 191 206 Q190 219 177 217 Q165 213 165 194 L162 162 Z" fill="#2b2b2e"/>' +
    // brazos cruzados (pose de castigo), en tonos algo más claros para
    // que se distingan de la camiseta negra
    '<g class="p-arms-crossed">' +
    '<path d="M74 174 Q104 166 150 182 Q157 189 150 197 Q104 185 74 193 Q67 185 74 174 Z" fill="#3d3d43"/>' +
    '<path d="M174 166 Q144 158 98 174 Q91 181 98 189 Q144 177 174 185 Q181 177 174 166 Z" fill="#4a4a51"/>' +
    '</g>' +
    // cabeza
    '<g>' +
    '<circle cx="56" cy="40" r="25" fill="#2b2b2e"/>' +
    '<circle cx="192" cy="40" r="25" fill="#2b2b2e"/>' +
    '<circle cx="54" cy="38" r="12" fill="#17171a" stroke="none"/>' +
    '<circle cx="194" cy="38" r="12" fill="#17171a" stroke="none"/>' +
    '<path d="M34 94 Q32 16 124 16 Q216 16 214 94 Q214 154 124 156 Q34 154 34 94 Z" fill="#f5f1e8"/>' +
    '<path d="M103 21 Q109 4 120 13 Q126 1 134 13 Q144 6 145 21 Q134 14 124 18 Q113 12 103 21 Z" fill="#f5f1e8"/>' +
    '<ellipse cx="86" cy="90" rx="27" ry="33" transform="rotate(-12 86 90)" fill="#26262a" stroke="none"/>' +
    '<ellipse cx="162" cy="90" rx="27" ry="33" transform="rotate(12 162 90)" fill="#26262a" stroke="none"/>' +
    // ojos y cejas (visibles solo al atraparlo): mirada de chulo,
    // ojo izquierdo medio cerrado y ceja derecha levantada
    '<g class="p-eyes" stroke="none">' +
    '<ellipse cx="88" cy="91" rx="12" ry="11" fill="#f5f1e8"/>' +
    '<ellipse cx="160" cy="89" rx="12" ry="13" fill="#f5f1e8"/>' +
    '<circle cx="90" cy="92" r="5.5" fill="#1c1c20"/>' +
    '<circle cx="158" cy="90" r="5.5" fill="#1c1c20"/>' +
    '<circle cx="92" cy="90" r="1.8" fill="#f5f1e8"/>' +
    '<circle cx="160" cy="88" r="1.8" fill="#f5f1e8"/>' +
    '<path d="M76 84 Q88 80 100 84 L100 78 L76 78 Z" fill="#26262a"/>' +
    '</g>' +
    '<g class="p-brows" fill="none">' +
    '<path d="M74 76 Q88 72 102 76" stroke="#14120f" stroke-width="7"/>' +
    '<path d="M142 64 Q162 50 182 62" stroke="#14120f" stroke-width="8"/>' +
    '</g>' +
    // cara de enfado (pose de castigo): ojos entrecerrados y cejas en V
    '<g class="p-eyes-angry" stroke="none">' +
    '<ellipse cx="88" cy="93" rx="12" ry="9" fill="#f5f1e8"/>' +
    '<ellipse cx="160" cy="93" rx="12" ry="9" fill="#f5f1e8"/>' +
    '<circle cx="88" cy="94" r="5.5" fill="#1c1c20"/>' +
    '<circle cx="160" cy="94" r="5.5" fill="#1c1c20"/>' +
    '</g>' +
    '<g class="p-brows-angry" fill="none">' +
    '<path d="M66 70 L106 84" stroke="#14120f" stroke-width="9"/>' +
    '<path d="M182 70 L142 84" stroke="#14120f" stroke-width="9"/>' +
    '</g>' +
    // nariz y bocas
    '<path d="M114 117 Q124 111 134 117 Q130 128 124 128 Q118 128 114 117 Z" fill="#14120f" stroke="none"/>' +
    '<path class="p-mouth-smile" d="M112 140 Q124 148 136 140" fill="none"/>' +
    '<path class="p-mouth-flat" d="M112 143 Q124 147 138 137" fill="none"/>' +
    '<path class="p-mouth-angry" d="M110 148 Q124 138 138 148" fill="none"/>' +
    // gafas (grupo desplazable) + patillas de cada pose
    '<g class="p-temples-flat">' +
    '<path d="M62 86 L36 78" stroke="#c79a62" stroke-width="6"/>' +
    '<path d="M186 86 L212 78" stroke="#c79a62" stroke-width="6"/>' +
    '</g>' +
    '<g class="p-temples-up">' +
    '<path d="M66 122 L40 96" stroke="#c79a62" stroke-width="6"/>' +
    '<path d="M182 122 L208 96" stroke="#c79a62" stroke-width="6"/>' +
    '</g>' +
    '<g class="p-glasses">' +
    '<circle cx="86" cy="90" r="21" fill="#17694a" stroke="none"/>' +
    '<circle cx="162" cy="90" r="21" fill="#17694a" stroke="none"/>' +
    '<ellipse cx="78" cy="82" rx="7" ry="4" transform="rotate(-28 78 82)" fill="#2fa26b" stroke="none"/>' +
    '<ellipse cx="154" cy="82" rx="7" ry="4" transform="rotate(-28 154 82)" fill="#2fa26b" stroke="none"/>' +
    '<circle cx="86" cy="90" r="24" fill="none" stroke="#c79a62" stroke-width="8"/>' +
    '<circle cx="162" cy="90" r="24" fill="none" stroke="#c79a62" stroke-width="8"/>' +
    '<path d="M108 86 Q124 78 140 86" fill="none" stroke="#c79a62" stroke-width="6"/>' +
    '</g>' +
    '</g>' +
    '</g>' +
    '</g>' +
    '</svg>';

  // Refunfuños desde la caja
  var MSG_ANGRY = [
    'Muy bien. Luego no me vengas pidiendo nada.',
    'Aquí me quedo, ¿eh? Tú te lo pierdes.',
    'Yo solo quería tu correo…',
    '¿Contento? Pues ya está.',
    'Sácame cuando se te pase.',
    'Con lo bien que botaba yo…'
  ];

  // En el móvil el mismo bocadillo se come media pantalla y estorba para
  // leer, así que ahí refunfuña igual pero más corto.
  var MSG_ANGRY_CORTO = [
    'Ahí te quedas.',
    'Tú te lo pierdes.',
    '¿Contento?',
    'Sácame de aquí.',
    'Con lo bien que botaba…'
  ];

  function pantallaPequena() {
    return window.matchMedia('(max-width: 640px)').matches;
  }

  var MSG_NEWSLETTER =
    '¿Qué haces, que no nos has dejado tu correo para la newsletter? ' +
    'Tú sabrás lo que te pierdes…';

  // Al sacarlo de la caja sigue enfadado: repetirle el mensaje de bienvenida
  // rompía el personaje, así que aquí negocia el perdón.
  var MSG_PERDON =
    'Si quieres que te perdone después de esto, deja tu correo en cualquier ' +
    'formulario. Si no, olvídate de mí.';

  // Si ya nos dejó el correo, pedírselo otra vez sería no enterarse de nada
  var MSG_AMIGO = [
    '¡Ey! Que tú ya me dejaste tu correo. Estamos en paz 🐼',
    'Contigo no me enfado, que ya cumpliste.',
    'Anda, si eres de los míos. Sigue a lo tuyo.'
  ];

  var MSG_MORROS = 'De aquí no me muevo hasta que dejes tu correo.';
  var MSG_VUELVES = 'No te intentes escapar, que sigo enfadado contigo.';
  var MSG_PAZ = '¡Bueno! Pues ya estamos en paz. Vamos a botar 🐼';

  // Refunfuños de cuando está plantado fuera de la caja
  var MSG_MORROS_MAS = [
    'Sigo aquí, ¿eh?',
    'Tú mismo. Yo tengo todo el día.',
    'Un correo. No te pido más.',
    'No pienso moverme.',
    'Te estoy mirando.'
  ];

  // ---------- ENFADO QUE SOBREVIVE A LA RECARGA ----------
  // Se guarda solo una marca de tiempo en localStorage (no es una cookie ni
  // identifica a nadie) y caduca sola, para que el enfado no sea eterno.
  var CLAVE_ENFADO = 'lelo:enfadado';
  var ENFADO_MS = 25 * 60 * 1000; // 25 minutos

  function leerEnfado() {
    try {
      var ts = parseInt(localStorage.getItem(CLAVE_ENFADO), 10);
      if (!ts) return 0;
      if (Date.now() - ts > ENFADO_MS) { borrarEnfado(); return 0; }
      return ts;
    } catch (e) {
      return 0; // navegación privada o almacenamiento bloqueado
    }
  }

  function guardarEnfado() {
    if (yaNosDioCorreo()) return; // ya cumpliste: no hay nada que reprochar
    try { localStorage.setItem(CLAVE_ENFADO, String(Date.now())); } catch (e) {}
  }

  function borrarEnfado() {
    try { localStorage.removeItem(CLAVE_ENFADO); } catch (e) {}
  }

  // Una vez que nos has dejado el correo, lelo ya no puede volver a
  // enfadarse: puedes seguir metiéndolo en la caja, pero al sacarlo se le
  // pasa. Cobrar dos veces el mismo peaje sería absurdo.
  var CLAVE_CORREO = 'lelo:correo';

  function yaNosDioCorreo() {
    try { return !!localStorage.getItem(CLAVE_CORREO); } catch (e) { return false; }
  }

  function apuntarCorreo() {
    try { localStorage.setItem(CLAVE_CORREO, String(Date.now())); } catch (e) {}
  }

  function sigueEnfadado() {
    if (yaNosDioCorreo()) return false;
    return leerEnfado() !== 0;
  }
  var MSG_VOLUMEN = 'Sube el volumen, anda… 🎧';

  // ---------- DOM ----------
  var el = document.createElement('div');
  el.id = 'lelo-panda';
  el.setAttribute('role', 'button');
  el.setAttribute('aria-label', 'lelo, la mascota de En Paralelo. Púlsame');
  el.tabIndex = 0;
  el.innerHTML = SVG;

  var bubble = document.createElement('div');
  bubble.className = 'lelo-bubble';

  // ---------- CAJA DE CASTIGO ----------
  // Dos piezas para que el panda quede DENTRO: el fondo se pinta detrás
  // de él y el frente por delante.
  var BOX_BACK =
    '<svg viewBox="0 0 132 150" aria-hidden="true">' +
    '<path d="M14 44 L40 16 L92 16 L118 44 Z" fill="#a97c4f" stroke="#7a5733" stroke-width="4" stroke-linejoin="round"/>' +
    '</svg>';

  var BOX_FRONT =
    '<svg viewBox="0 0 132 150" aria-hidden="true">' +
    '<path d="M10 44 L122 44 L114 142 L18 142 Z" fill="#c69a68" stroke="#7a5733" stroke-width="4" stroke-linejoin="round"/>' +
    '<path d="M10 44 L36 68 L96 68 L122 44 Z" fill="#b3854f" stroke="#7a5733" stroke-width="4" stroke-linejoin="round"/>' +
    '<rect x="58" y="44" width="16" height="98" fill="#d8b98c" opacity="0.5"/>' +
    '<rect x="24" y="84" width="84" height="42" rx="4" fill="#f0e5d0" stroke="#7a5733" stroke-width="3"/>' +
    '<text x="66" y="101" text-anchor="middle" font-family="Space Grotesk, Arial, sans-serif" font-weight="700" font-size="16" fill="#3a2a17">LELO</text>' +
    '<text x="66" y="118" text-anchor="middle" font-family="Space Grotesk, Arial, sans-serif" font-weight="700" font-size="12" fill="#6b4f2c" letter-spacing="1">CASTIGO</text>' +
    '</svg>';

  // Dos elementos sueltos (no anidados) para que el panda pueda quedar
  // entre ambos por capas y se vea dentro de la caja.
  var boxBack = document.createElement('div');
  boxBack.className = 'lelo-box lelo-box--back';
  boxBack.setAttribute('aria-hidden', 'true');
  boxBack.innerHTML = BOX_BACK;

  var boxFront = document.createElement('div');
  boxFront.className = 'lelo-box lelo-box--front';
  boxFront.setAttribute('aria-hidden', 'true');
  boxFront.innerHTML = BOX_FRONT;

  function boxShow(on) {
    boxBack.classList.toggle('show', on);
    boxFront.classList.toggle('show', on);
    if (!on) boxHot(false);
  }
  function boxHot(on) {
    boxBack.classList.toggle('hot', on);
    boxFront.classList.toggle('hot', on);
  }

  document.body.appendChild(boxBack);
  document.body.appendChild(boxFront);
  document.body.appendChild(el);
  document.body.appendChild(bubble);

  var modal = document.getElementById('yt-modal');
  var joinHref = document.getElementById('comunidad') ? '#comunidad' : '/comunidad';

  // ---------- ESTADO ----------
  var W = window.innerWidth;
  var H = window.innerHeight;
  var pw = el.offsetWidth || 92;
  var ph = el.offsetHeight || 118;

  var GRAVITY = 0.14;
  var MAX_FALL = 11;

  var x = Math.max(8, W * 0.72);
  var y = H - ph - 8;
  var vx = 2.4;
  var vy = -7;
  var mode = 'bounce'; // bounce | caught | flyTo | perched | parked
  var facingLeft = false;

  var resumeTimer = null;
  var bubbleTimer = null;
  var perchDone = false;
  var perchedSince = 0;
  var fly = null; // datos del vuelo hacia el posadero
  var tunnelArmed = false; // el próximo aterrizaje atraviesa el suelo
  var tunneling = false;   // está cayendo fuera de la pantalla
  var landings = [];       // aterrizajes recientes, para detectar atascos
  var panelsMutedUntil = 0;
  var grumbleTimer = null; // refunfuños mientras está castigado
  var caducidadTimer = null; // vigila cuándo se le pasa el enfado
  var morrosDichos = 0;      // refunfuños soltados, para repetir el enlace
  var panelAbierto = false;  // formulario a pantalla completa a la vista

  var panelEls = [];
  var panelRects = []; // [{r, el}]
  var lastRectRefresh = 0;
  var groundTop = H; // en móvil, el borde superior de la barra de pestañas

  function refreshGround() {
    groundTop = H;
    if (mobileMq.matches) {
      var tb = document.querySelector('.ep-tabbar');
      if (tb && getComputedStyle(tb).display !== 'none') {
        var r = tb.getBoundingClientRect();
        if (r.top > 100) groundTop = r.top; // el panda bota sobre la barra
      }
    }
  }

  // Solidez aleatoria: cada panel decide por su cuenta, durante unos segundos,
  // si el panda puede apoyarse en él o lo atraviesa. Sin patrón fijo: cada
  // decisión caduca en un momento aleatorio distinto.
  var solidity = new Map(); // elemento -> { solid, until }
  function isSolid(panelEl, now) {
    var s = solidity.get(panelEl);
    if (!s || now > s.until) {
      s = { solid: Math.random() < 0.4, until: now + 2500 + Math.random() * 6000 };
      solidity.set(panelEl, s);
    }
    return s.solid;
  }

  // Solo los paneles de primer nivel. Muchos cristales viven dentro de otro
  // (tarjetas dentro de un panel grande) y, al decidir cada uno su solidez
  // por separado, el panda podía quedar encajado rebotando entre el de fuera
  // y el de dentro.
  function refreshPanels() {
    var all = Array.prototype.slice.call(document.querySelectorAll('.glass-panel'));
    panelEls = all.filter(function (candidate) {
      for (var i = 0; i < all.length; i++) {
        if (all[i] !== candidate && all[i].contains(candidate)) return false;
      }
      return true;
    });
  }

  function refreshRects() {
    panelRects = [];
    for (var i = 0; i < panelEls.length; i++) {
      var r = panelEls[i].getBoundingClientRect();
      if (r.width < 150 || r.height < 90) continue;       // ignora tarjetitas
      if (r.bottom < 40 || r.top > H - 40) continue;       // fuera de pantalla
      panelRects.push({ r: r, el: panelEls[i] });
    }
  }

  refreshPanels();
  refreshGround();

  // ---------- BOCADILLO ----------
  function showBubble(html, autoHideMs) {
    clearTimeout(bubbleTimer);
    bubble.innerHTML = html;
    // Solo intercepta el dedo si trae enlace; si no, se puede tocar la web
    // a través de él en vez de tener que esperar a que se vaya.
    bubble.classList.toggle('has-link', html.indexOf('<a ') !== -1);
    bubble.classList.add('show');
    placeBubble();
    if (autoHideMs) bubbleTimer = setTimeout(hideBubble, autoHideMs);
  }

  function hideBubble() {
    clearTimeout(bubbleTimer);
    bubble.classList.remove('show');
  }

  function placeBubble() {
    if (!bubble.classList.contains('show')) return;

    // Si el panda asoma fuera de la pantalla (cruzando de un lado a otro),
    // el bocadillo no puede seguirlo y se quedaría clavado en el borde:
    // mejor retirarlo. Se respeta cuando está atrapado o posado, que ahí
    // el panda no se mueve.
    if (mode === 'bounce' && (x < 4 || x + pw > W - 4)) { hideBubble(); return; }

    var bw = bubble.offsetWidth;
    var bh = bubble.offsetHeight;
    var bx = Math.min(Math.max(x + pw * 0.55, 8), W - bw - 8);
    var by = y - bh - 18;
    if (by < 8) {
      by = y + ph + 18;
      bubble.classList.add('below');
    } else {
      bubble.classList.remove('below');
    }
    bubble.style.left = bx + 'px';
    bubble.style.top = by + 'px';
  }

  // ---------- CASTIGO ----------
  function boxRect() {
    return boxFront.getBoundingClientRect();
  }

  // ¿El panda está sobre la caja ahora mismo?
  function overBox() {
    var r = boxRect();
    var cx = x + pw / 2;
    var cy = y + ph / 2;
    return cx > r.left - 30 && cx < r.right + 30 && cy > r.top - 70 && cy < r.bottom + 30;
  }

  // Lo coloca metido en la caja: asoma de la cintura para arriba
  function seatInBox() {
    var r = boxRect();
    x = r.left + (r.width - pw) / 2;
    y = r.top - ph * 0.52;
    el.style.transform = 'translate3d(' + x + 'px,' + y + 'px,0)';
  }

  // ---------- MORROS: plantado junto a la caja ----------
  // Se pone al lado que tenga sitio, con los pies a la altura de la base de
  // la caja para que se lea como "he salido, pero no me he ido".
  function morrosTarget() {
    var r = boxRect();
    // La separación no es estética: pegado a la caja, overBox() lo daría por
    // dentro y un simple toque volvería a castigarlo sin querer.
    var izq = r.left - pw - 14;
    var der = r.right + 14;
    var sx;
    if (izq >= 6) sx = izq;
    else if (der + pw <= W - 6) sx = der;
    else sx = Math.max(6, izq);
    return { x: sx, y: r.bottom - ph };
  }

  function punish() {
    clearTimeout(resumeTimer);
    mode = 'punished';
    vx = 0; vy = 0;
    tunneling = false;
    tunnelArmed = false;
    fly = null;
    setCaughtPose(false);
    el.classList.add('punished');
    el.classList.remove('airborne', 'face-left');
    boxShow(true);
    seatInBox();

    // Pataleta breve al caer dentro
    el.classList.add('tantrum');
    setTimeout(function () { el.classList.remove('tantrum'); }, 900);

    showBubble('¡Oye! ¿En serio?', 2600);
    scheduleGrumble(true);
  }

  function scheduleGrumble(first) {
    clearTimeout(grumbleTimer);
    // En pantalla pequeña habla menos y menos rato: la gracia se mantiene,
    // pero deja de taparle la web a quien está leyendo.
    var movil = pantallaPequena();
    var delay = first
      ? (movil ? 7000 : 5000) + Math.random() * (movil ? 5000 : 3000)
      : (movil ? 17000 : 9000) + Math.random() * (movil ? 16000 : 9000);
    grumbleTimer = setTimeout(function () {
      if (mode !== 'punished' && mode !== 'sulk') return;
      // Dentro de la caja se queja del castigo; fuera, de que sigue esperando
      var enMorros = mode === 'sulk';
      var lista = enMorros
        ? MSG_MORROS_MAS
        : (pantallaPequena() ? MSG_ANGRY_CORTO : MSG_ANGRY);
      var texto = lista[Math.floor(Math.random() * lista.length)];

      // De vez en cuando vuelve a ofrecer el enlace: el primer bocadillo ya
      // se ha ido y si no, habría que ir a buscar el formulario a mano.
      morrosDichos++;
      if (enMorros && morrosDichos % 3 === 0) {
        texto += '<br /><a class="lelo-cta" href="' + joinHref + '">Va, te lo dejo →</a>';
      }

      showBubble(texto, pantallaPequena() ? 3200 : 5000);
      scheduleGrumble();
    }, delay);
  }

  function freeFromBox() {
    clearTimeout(grumbleTimer);
    el.classList.remove('punished', 'tantrum');
    boxShow(false);
  }

  // Salta fuera de la caja y se queda plantado al lado, de brazos cruzados,
  // hasta que llegue el correo o se le pase el enfado.
  function saltarAMorros(conMensaje) {
    clearTimeout(resumeTimer);
    clearTimeout(grumbleTimer);
    tunneling = false;
    tunnelArmed = false;
    vx = 0; vy = 0;
    setCaughtPose(false);
    boxShow(true);
    el.classList.add('punished');
    el.classList.remove('airborne', 'face-left', 'tantrum');

    if (reduceMotion) {
      var t = morrosTarget();
      x = t.x; y = t.y;
      entrarEnMorros(conMensaje);
      return;
    }

    fly = {
      x0: x, y0: y,
      t0: performance.now(),
      dur: 520,
      arc: 70,
      destino: morrosTarget,
      alTerminar: function () { entrarEnMorros(conMensaje); }
    };
    mode = 'flyTo';
    el.classList.add('airborne');
  }

  function entrarEnMorros(conMensaje) {
    mode = 'sulk';
    el.classList.remove('airborne');
    el.classList.add('punished');
    pulse('squash');
    // Con caducidad: un bocadillo clavado en pantalla acaba estorbando, y
    // para volver a verlo basta con tocarlo.
    if (conMensaje) {
      showBubble(conMensaje + '<br /><a class="lelo-cta" href="' + joinHref + '">Va, te lo dejo →</a>', 9000);
    }
    scheduleGrumble(true);
    vigilarCaducidad();
  }

  // El enfado caduca solo: si nadie deja el correo, a los 25 minutos vuelve
  // a botar como si nada para no dejar la web bloqueada de por vida.
  function vigilarCaducidad() {
    clearTimeout(caducidadTimer);
    caducidadTimer = setTimeout(function () {
      if (mode !== 'sulk') return;
      if (sigueEnfadado()) { vigilarCaducidad(); return; }
      volverANormal(false);
    }, 20000);
  }

  // Se le pasa el enfado: sale de la caja, se despide y retoma los saltos
  function volverANormal(perdonado) {
    clearTimeout(grumbleTimer);
    clearTimeout(caducidadTimer);
    borrarEnfado();
    el.classList.remove('punished', 'tantrum');
    boxShow(false);
    fly = null;
    if (perdonado) showBubble(MSG_PAZ, 4000);
    else hideBubble();
    if (reduceMotion) { park(); return; }
    mode = 'bounce';
    vy = -9;
    vx = (x > W / 2 ? -1 : 1) * 2.6;
  }

  // Puente para el resto de la web: al enviar un formulario con correo se
  // le perdona. Vive en window porque quien lo llama es utils.js.
  window.leloPerdona = function () {
    apuntarCorreo();
    borrarEnfado();
    if (mode !== 'sulk' && mode !== 'punished') return;
    volverANormal(true);
  };

  // ---------- FORMULARIO A PANTALLA COMPLETA ----------
  // Antes, responderle a lelo te mandaba a una sección de otra página y te
  // dejaba tirado a medio camino. Ahora el formulario viene él.
  var panel = null;

  function construirPanel() {
    if (panel) return panel;

    panel = document.createElement('div');
    panel.className = 'lelo-panel';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-modal', 'true');
    panel.setAttribute('aria-label', 'Deja tu correo a lelo');

    panel.innerHTML =
      '<div class="lelo-panel-card">' +
        '<button type="button" class="lelo-panel-close" aria-label="Cerrar">✕</button>' +
        '<div class="lelo-panel-mascota" aria-hidden="true">' + SVG + '</div>' +
        '<div class="lelo-panel-body">' +
          '<span class="lelo-panel-label">lelo tiene algo que decirte</span>' +
          '<h2 class="lelo-panel-title">Venga, va. Rellénalo y<br />nos perdonamos de una vez,<br />que me aburro.</h2>' +
          '<form class="lelo-panel-form" novalidate>' +
            '<input type="text" name="_gotcha" class="hp-field" tabindex="-1" autocomplete="off" aria-hidden="true" />' +
            '<input type="hidden" name="origen" value="lelo" />' +
            '<label class="lelo-panel-field">' +
              '<span>¿Cómo te llamamos?</span>' +
              '<input type="text" name="name" class="form-input" placeholder="Tu nombre" required autocomplete="name" />' +
            '</label>' +
            '<label class="lelo-panel-field">' +
              '<span>Tu correo</span>' +
              '<input type="email" name="email" class="form-input" placeholder="tu@email.com" required autocomplete="email" />' +
            '</label>' +
            '<label class="form-consent">' +
              '<input type="checkbox" name="consentimiento" value="sí" required />' +
              '<span>He leído y acepto la <a href="/privacidad" target="_blank" rel="noopener">política de privacidad</a>.</span>' +
            '</label>' +
            '<button type="submit" class="btn-primary lelo-panel-submit">Hacer las paces →</button>' +
            '<p class="lelo-panel-nota">Sin spam. En serio. Solo lo que merezca la pena leer.</p>' +
          '</form>' +
        '</div>' +
      '</div>';

    document.body.appendChild(panel);

    panel.querySelector('.lelo-panel-close').addEventListener('click', cerrarPanel);
    panel.addEventListener('click', function (e) {
      if (e.target === panel) cerrarPanel();
    });
    panel.querySelector('.lelo-panel-form').addEventListener('submit', enviarPanel);

    return panel;
  }

  function abrirPanel() {
    construirPanel();
    hideBubble();
    // El panda de carne y hueso se aparta: dentro del panel ya hay otro
    el.style.visibility = 'hidden';
    boxBack.style.visibility = 'hidden';
    boxFront.style.visibility = 'hidden';
    panelAbierto = true;

    panel.classList.add('open');
    document.body.style.overflow = 'hidden';
    setTimeout(function () {
      var primero = panel.querySelector('input[name="name"]');
      if (primero) primero.focus();
    }, 260);
  }

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && panelAbierto) cerrarPanel();
  });

  function cerrarPanel() {
    if (!panel) return;
    panel.classList.remove('open');
    document.body.style.overflow = '';
    panelAbierto = false;
    el.style.visibility = '';
    boxBack.style.visibility = '';
    boxFront.style.visibility = '';
  }

  function enviarPanel(e) {
    e.preventDefault();
    var form = e.currentTarget;
    var btn = form.querySelector('[type="submit"]');
    var original = btn.textContent;

    if (!form.checkValidity()) { form.reportValidity(); return; }

    btn.textContent = 'Enviando…';
    btn.disabled = true;

    fetch('https://formspree.io/f/xpqkqnrg', {
      method: 'POST',
      body: new FormData(form),
      headers: { 'Accept': 'application/json' }
    }).then(function (res) {
      if (!res.ok) throw new Error('HTTP ' + res.status);
      btn.textContent = '✓ ¡Hecho! Ya somos amigos';
      form.reset();
      setTimeout(function () {
        cerrarPanel();
        btn.textContent = original;
        btn.disabled = false;
        window.leloPerdona();
      }, 1400);
    }).catch(function () {
      btn.textContent = 'No se pudo enviar. Inténtalo de nuevo';
      setTimeout(function () {
        btn.textContent = original;
        btn.disabled = false;
      }, 3500);
    });
  }

  // ---------- POSES ----------
  function setCaughtPose(on) {
    el.classList.toggle('caught', on);
    el.classList.remove('airborne');
  }

  function pulse(cls) {
    el.classList.remove('squash', 'stretch');
    // reflow para reiniciar la transición
    void el.offsetWidth;
    el.classList.add(cls);
    setTimeout(function () { el.classList.remove(cls); }, 170);
  }

  // ---------- INTERACCIÓN: atraparlo y arrastrarlo ----------
  var drag = null; // { id, offX, offY, startX, startY, lastX, lastY, lastT, vx, vy, moved }

  function clamp(v, min, max) { return Math.min(Math.max(v, min), max); }

  function catchPanda(desdeCaja) {
    clearTimeout(resumeTimer);
    clearTimeout(grumbleTimer);
    if (mode === 'flyTo') fly = null;
    // Si lo atrapan mientras se cuela por abajo, se cancela el efecto
    // (si no, al soltarlo seguiría cayendo fuera de la pantalla).
    if (tunneling) { tunneling = false; y = Math.min(y, groundTop - ph); }
    tunnelArmed = false;
    mode = 'caught';
    vx = 0; vy = 0;
    setCaughtPose(true);
    if (yaNosDioCorreo()) {
      showBubble(MSG_AMIGO[Math.floor(Math.random() * MSG_AMIGO.length)], 4000);
      return;
    }

    showBubble(
      (desdeCaja ? MSG_PERDON : MSG_NEWSLETTER) +
      '<br /><a class="lelo-cta" href="' + joinHref + '">' +
      (desdeCaja ? 'Está bien, toma →' : 'Déjanoslo aquí →') + '</a>'
    );
  }

  // Suelta al panda; si viene de un lanzamiento, hereda la velocidad de la mano
  function releasePanda(throwVx, throwVy) {
    if (mode !== 'caught') return;
    setCaughtPose(false);

    // Si sigue enfadado no vuelve a botar: se planta al lado de la caja.
    // Antes se soltaba y se iba dando saltos, y no daba tiempo ni a leer
    // lo que pedía.
    if (sigueEnfadado()) { saltarAMorros(MSG_MORROS); return; }

    el.classList.remove('punished', 'tantrum');
    boxShow(false);
    if (reduceMotion) { hideBubble(); mode = 'parked'; return; }
    mode = 'bounce';
    if (typeof throwVx === 'number' && (Math.abs(throwVx) > 1 || Math.abs(throwVy) > 1)) {
      vx = clamp(throwVx, -7, 7);
      vy = clamp(throwVy, -10, 6);
      hideBubble();
    } else {
      vy = -8;
      vx = (Math.random() < 0.5 ? -1 : 1) * (2 + Math.random() * 1.5);
      hideBubble();
    }
  }

  el.addEventListener('pointerdown', function (e) {
    e.preventDefault();
    try { el.setPointerCapture(e.pointerId); } catch (err) {}
    var desdeCaja = mode === 'punished';
    if (desdeCaja) { guardarEnfado(); freeFromBox(); } // sacarlo de la caja
    catchPanda(desdeCaja || sigueEnfadado());
    boxShow(true); // al arrastrar se descubre dónde soltarlo
    drag = {
      id: e.pointerId,
      offX: e.clientX - x,
      offY: e.clientY - y,
      startX: e.clientX,
      startY: e.clientY,
      lastX: e.clientX,
      lastY: e.clientY,
      lastT: performance.now(),
      vx: 0,
      vy: 0,
      moved: false
    };
  });

  el.addEventListener('pointermove', function (e) {
    if (!drag || e.pointerId !== drag.id) return;
    x = clamp(e.clientX - drag.offX, 0, W - pw);
    y = clamp(e.clientY - drag.offY, 0, H - ph);
    if (!drag.moved && Math.hypot(e.clientX - drag.startX, e.clientY - drag.startY) > 8) {
      drag.moved = true;
    }
    boxHot(overBox()); // resalta si va a caer dentro
    // Velocidad de la mano (suavizada) para poder lanzarlo
    var t = performance.now();
    var dt = Math.max(t - drag.lastT, 1);
    drag.vx = drag.vx * 0.75 + ((e.clientX - drag.lastX) / dt * 16) * 0.25;
    drag.vy = drag.vy * 0.75 + ((e.clientY - drag.lastY) / dt * 16) * 0.25;
    drag.lastX = e.clientX;
    drag.lastY = e.clientY;
    drag.lastT = t;
  });

  function onPointerRelease(e) {
    if (!drag || e.pointerId !== drag.id) return;
    var wasDrag = drag.moved;
    var tvx = drag.vx;
    var tvy = drag.vy;
    var onBox = overBox();
    drag = null;
    clearTimeout(resumeTimer);

    if (onBox) {
      // Soltado sobre la caja: a pensar en lo que ha hecho
      punish();
      return;
    }

    boxShow(false);
    if (wasDrag) {
      // Lo has movido: retoma los saltos justo donde lo dejas
      releasePanda(tvx, tvy);
    } else {
      // Toque simple: se queda un momento para que leas el bocadillo
      resumeTimer = setTimeout(function () { releasePanda(); }, 3500);
    }
  }
  el.addEventListener('pointerup', onPointerRelease);
  el.addEventListener('pointercancel', onPointerRelease);

  el.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (mode === 'punished') {
        guardarEnfado();
        freeFromBox();
        catchPanda(true);
        resumeTimer = setTimeout(releasePanda, 5000);
      }
      else if (mode === 'caught') releasePanda();
      else { catchPanda(); resumeTimer = setTimeout(releasePanda, 5000); }
    }
  });

  // Vuelve a botar tras salir de la caja
  function releaseFromPunish() {
    hideBubble();
    if (reduceMotion) { park(); return; }
    mode = 'bounce';
    vy = -8;
    vx = (Math.random() < 0.5 ? -1 : 1) * 2.6;
  }

  // Responder a lelo abre el formulario aquí mismo. El href apunta de todas
  // formas al formulario de la comunidad: si el JS fallara, el enlace sigue
  // llevando a algún sitio útil en vez de no hacer nada.
  bubble.addEventListener('click', function (e) {
    var enlace = e.target.closest ? e.target.closest('a') : null;
    if (!enlace) return;
    if (enlace.classList.contains('lelo-cta')) {
      e.preventDefault();
      releasePanda();
      abrirPanel();
      return;
    }
    releasePanda();
  });

  // ---------- GUIÑOS: se cuela por abajo y provoca al visitante ----------

  // Rompe el borde inferior y reaparece arriba. El primero llega pronto para
  // que cualquiera que pase por la web lo vea al menos una vez; después se
  // espacia para que siga siendo una sorpresa.
  function scheduleTunnel(first) {
    var delay = first ? 11000 + Math.random() * 7000   // 11–18 s
                      : 32000 + Math.random() * 25000; // 32–57 s
    setTimeout(function () {
      if (mode === 'bounce') tunnelArmed = true;
      else scheduleTunnel(); // ocupado (atrapado o posado): se reintenta
    }, delay);
  }

  var TAUNTS = [
    '¿No me puedes pillar o qué?',
    '¿No me puedes pillar o qué?',
    'A que no me coges…',
    'Pssst… que me puedes agarrar.'
  ];

  // Provocación ocasional para que se entienda que se le puede atrapar
  function scheduleTaunt(first) {
    var delay = first ? 7000 + Math.random() * 6000    // 7–13 s
                      : 20000 + Math.random() * 18000; // 20–38 s
    setTimeout(function () {
      if (mode === 'bounce' && !bubble.classList.contains('show') && !tunneling) {
        showBubble(TAUNTS[Math.floor(Math.random() * TAUNTS.length)], 3200);
      }
      scheduleTaunt();
    }, delay);
  }

  if (!reduceMotion) {
    scheduleTunnel(true);
    scheduleTaunt(true);
  }

  // ---------- SECCIÓN DE AUDIO: posarse ----------
  var wfSection = document.getElementById('waveform-section');
  var wfPanel = wfSection ? (wfSection.querySelector('.waveform-glass') || wfSection) : null;

  if (wfPanel && !reduceMotion && 'IntersectionObserver' in window) {
    var wfObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting && !perchDone && mode === 'bounce') {
          startFlyToPerch();
        } else if (!entry.isIntersecting && mode === 'perched') {
          hopOff();
        }
      });
    }, { threshold: 0.35 });
    wfObserver.observe(wfSection);
  }

  function perchTarget() {
    var r = wfPanel.getBoundingClientRect();
    return {
      x: Math.min(Math.max(r.right - pw - 28, 8), W - pw - 8),
      y: r.top - ph + 10 // los pies pisan el borde superior del panel
    };
  }

  function startFlyToPerch() {
    perchDone = true;
    fly = { x0: x, y0: y, t0: performance.now(), dur: 850, arc: 130 };
    mode = 'flyTo';
    el.classList.add('airborne');
  }

  function hopOff() {
    if (mode !== 'perched') return;
    hideBubble();
    mode = 'bounce';
    vy = -8;
    vx = (x > W / 2 ? -1 : 1) * 2.6;
  }

  // ---------- FÍSICA ----------
  function bouncePhysics() {
    vy = Math.min(vy + GRAVITY, MAX_FALL);
    x += vx;
    y += vy;

    el.classList.toggle('airborne', true);

    // Bordes laterales:
    // - PC: rebota contra ellos
    // - móvil: efecto túnel, sale por un lado y entra por el otro
    if (mobileMq.matches) {
      if (x >= W) { x = -pw + 2; hideBubble(); }
      else if (x + pw <= 0) { x = W - 2; hideBubble(); }
    } else {
      if (x <= 0) { x = 0; vx = Math.abs(vx); pulse('stretch'); }
      else if (x + pw >= W) { x = W - pw; vx = -Math.abs(vx); pulse('stretch'); }
    }

    if (tunneling) {
      // Se ha colado por abajo: sigue cayendo hasta desaparecer y entra
      // de nuevo por arriba, como si la pantalla diera la vuelta.
      if (y > H + 10) {
        y = -ph;
        vy = Math.max(vy, 3);
        tunneling = false;
        scheduleTunnel();
      }
    } else {
      // Techo
      if (y <= 0) { y = 0; vy = Math.abs(vy) * 0.6; }

      // Suelo (en móvil, la barra de pestañas): aterriza y vuelve a saltar
      if (y + ph >= groundTop) {
        if (tunnelArmed) {
          // En vez de rebotar, rompe el límite de abajo
          tunnelArmed = false;
          tunneling = true;
          vy = Math.max(vy, 6);
          hideBubble();
        } else {
          y = groundTop - ph;
          landAndJump();
        }
      }
    }

    // Paneles de cristal: se impulsa solo con los que ahora mismo "elige"
    // sólidos. En móvil no hay colisiones con paneles: solo bordes del
    // dispositivo (con túnel lateral) y la barra de pestañas como suelo.
    var now = performance.now();
    if (now - lastRectRefresh > 400) {
      refreshRects();
      refreshGround();
      lastRectRefresh = now;
    }
    if (!mobileMq.matches && !tunneling && now >= panelsMutedUntil) {
      for (var i = 0; i < panelRects.length; i++) {
        var r = panelRects[i].r;
        if (x + pw < r.left || x > r.right || y + ph < r.top || y > r.bottom) continue;
        if (!isSolid(panelRects[i].el, now)) continue;

        var overlapTop = y + ph - r.top;
        var overlapBottom = r.bottom - y;
        var overlapLeft = x + pw - r.left;
        var overlapRight = r.right - x;
        var m = Math.min(overlapTop, overlapBottom, overlapLeft, overlapRight);

        // Si está muy hundido (el panel se volvió sólido con el panda dentro),
        // lo dejamos pasar en lugar de teletransportarlo
        if (m > 34) continue;

        if (m === overlapTop && vy > 0) {          // cae sobre el panel → rebota
          y = r.top - ph;
          landAndJump();
        } else if (m === overlapBottom && vy < 0) { // golpea por debajo
          // Si empujarlo hacia abajo lo dejaría sin hueco hasta el suelo,
          // se le deja pasar: era la causa de los botes rápidos encadenados
          // (bajaba, tocaba suelo, saltaba, volvía a golpear, sin fin).
          if (r.bottom + ph > groundTop - 4) continue;
          y = r.bottom;
          vy = Math.abs(vy) * 0.5;
        } else if (m === overlapLeft && vx > 0) {   // lateral izquierdo del panel
          x = r.left - pw;
          vx = -Math.abs(vx);
          pulse('stretch');
        } else if (m === overlapRight && vx < 0) {  // lateral derecho del panel
          x = r.right;
          vx = Math.abs(vx);
          pulse('stretch');
        } else {
          continue; // no procede corregir con este panel
        }

        // Una colisión por fotograma: resolver dos a la vez producía
        // correcciones contradictorias y el rebote se veía atascado.
        break;
      }
    }

    // Orientación según la dirección
    if (vx < -0.2 && !facingLeft) { facingLeft = true; el.classList.add('face-left'); }
    else if (vx > 0.2 && facingLeft) { facingLeft = false; el.classList.remove('face-left'); }
  }

  function landAndJump() {
    pulse('squash');
    el.classList.remove('airborne');
    vy = -(6.5 + Math.random() * 3);            // impulso del salto
    if (Math.random() < 0.35) {                  // a veces cambia de rumbo
      vx = (Math.random() < 0.5 ? -1 : 1) * (1.8 + Math.random() * 1.8);
    }
    noteLanding(performance.now());
  }

  // Red de seguridad: si encadena aterrizajes en muy poco tiempo es que se
  // ha quedado encajado en algún hueco. Se ignoran los paneles un momento y
  // se le da un impulso franco para que salga sin que parezca un fallo.
  function noteLanding(now) {
    landings.push(now);
    while (landings.length && now - landings[0] > 1200) landings.shift();
    if (landings.length >= 4) {
      landings.length = 0;
      panelsMutedUntil = now + 1800;
      vy = -9.5;
      vx = (vx >= 0 ? 1 : -1) * 3.4;
    }
  }

  function flyPhysics(now) {
    var t = Math.min((now - fly.t0) / fly.dur, 1);
    var ease = t * (2 - t); // easeOutQuad
    // El vuelo sirve tanto para posarse en el audio como para el salto a
    // los morros: cada uno trae su destino y qué hacer al llegar.
    var tgt = (fly.destino || perchTarget)();
    x = fly.x0 + (tgt.x - fly.x0) * ease;
    y = fly.y0 + (tgt.y - fly.y0) * ease - Math.sin(t * Math.PI) * fly.arc;
    if (t >= 1) {
      var alTerminar = fly.alTerminar;
      fly = null;
      if (alTerminar) { alTerminar(); return; }
      mode = 'perched';
      perchedSince = now;
      el.classList.remove('airborne');
      pulse('squash');
      showBubble(MSG_VOLUMEN, 5000);
    }
  }

  function perchedPhysics(now) {
    var tgt = perchTarget();
    x = tgt.x;
    y = tgt.y; // sigue pegado al panel aunque el usuario haga scroll
    if (now - perchedSince > 14000) hopOff(); // no se queda eternamente
  }

  // ---------- BUCLE ----------
  function frame(now) {
    // Con el modal de vídeo o el panel del correo abiertos, lelo se aparta
    if (panelAbierto || (modal && modal.classList.contains('open'))) {
      el.style.visibility = 'hidden';
      bubble.style.visibility = 'hidden';
      boxBack.style.visibility = 'hidden';
      boxFront.style.visibility = 'hidden';
      requestAnimationFrame(frame);
      return;
    }
    el.style.visibility = '';
    bubble.style.visibility = '';
    boxBack.style.visibility = '';
    boxFront.style.visibility = '';

    if (mode === 'bounce') bouncePhysics();
    else if (mode === 'flyTo' && fly) flyPhysics(now);
    else if (mode === 'perched') perchedPhysics(now);
    else if (mode === 'punished') {
      // Se mantiene metido en la caja pase lo que pase (scroll, giro…)
      var br = boxRect();
      x = br.left + (br.width - pw) / 2;
      y = br.top - ph * 0.52;
    }
    else if (mode === 'sulk') {
      // Plantado junto a la caja, siguiéndola si la pantalla cambia
      var mt = morrosTarget();
      x = mt.x;
      y = mt.y;
    }

    var tilt = mode === 'bounce' ? Math.max(-8, Math.min(8, vx * 2)) : 0;
    el.style.transform = 'translate3d(' + x + 'px,' + y + 'px,0) rotate(' + tilt + 'deg)';
    placeBubble();

    requestAnimationFrame(frame);
  }

  function onResize() {
    W = window.innerWidth;
    H = window.innerHeight;
    pw = el.offsetWidth || pw;
    ph = el.offsetHeight || ph;
    refreshGround();
    x = Math.min(x, W - pw);
    y = Math.min(y, groundTop - ph);
    lastRectRefresh = 0;
    if (mode === 'parked') park();
  }
  window.addEventListener('resize', onResize);
  window.addEventListener('scroll', function () { lastRectRefresh = 0; }, { passive: true });

  // ---------- MODO SIN ANIMACIÓN (prefers-reduced-motion) ----------
  function park() {
    mode = 'parked';
    refreshGround();
    x = W - pw - 14;
    y = groundTop - ph - 10;
    el.style.transform = 'translate3d(' + x + 'px,' + y + 'px,0)';
  }

  // ---------- ARRANQUE ----------
  // Si quedó enfadado en la visita anterior sigue plantado donde lo dejaste:
  // recargar la página no le hace olvidar.
  function arrancarEnfadado() {
    boxShow(true);
    el.classList.add('punished');
    el.classList.remove('airborne', 'face-left');
    mode = 'sulk';
    var t = morrosTarget();
    x = t.x; y = t.y;
    el.style.transform = 'translate3d(' + x + 'px,' + y + 'px,0)';
    // Un respiro antes de soltar la pulla, para que dé tiempo a verlo ahí
    setTimeout(function () {
      if (mode !== 'sulk') return;
      showBubble(MSG_VUELVES + '<br /><a class="lelo-cta" href="' + joinHref + '">Va, te lo dejo →</a>', 7000);
    }, 1400);
    scheduleGrumble(true);
    vigilarCaducidad();
  }

  if (reduceMotion) {
    // Sin animación: el panda se queda quieto en la esquina y solo
    // reacciona al atraparlo (el bucle de físicas no corre).
    if (sigueEnfadado()) arrancarEnfadado();
    else park();
  } else {
    if (sigueEnfadado()) arrancarEnfadado();
    requestAnimationFrame(frame);
  }
})();
