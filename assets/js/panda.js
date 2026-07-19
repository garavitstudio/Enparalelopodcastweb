// ===== LELO, LA MASCOTA DE EN PARALELO 🐼 =====
// Panda que salta por la pantalla impulsándose con los bordes y los paneles
// de cristal. Se le puede atrapar (baja las gafas y suelta el bocadillo de la
// newsletter) y, al llegar a la sección de audio, se posa y pide subir el volumen.

(function () {
  if (document.getElementById('lelo-panda')) return;

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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
    // brazos
    '<path class="p-arm-l" d="M78 154 Q54 174 57 206 Q58 219 71 217 Q83 213 83 194 L86 162 Z" fill="#2b2b2e"/>' +
    '<path class="p-arm-r" d="M170 154 Q194 174 191 206 Q190 219 177 217 Q165 213 165 194 L162 162 Z" fill="#2b2b2e"/>' +
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
    // ojos y cejas (visibles solo al atraparlo)
    '<g class="p-eyes" stroke="none">' +
    '<ellipse cx="88" cy="90" rx="12" ry="13" fill="#f5f1e8"/>' +
    '<ellipse cx="160" cy="90" rx="12" ry="13" fill="#f5f1e8"/>' +
    '<circle cx="90" cy="92" r="5.5" fill="#1c1c20"/>' +
    '<circle cx="158" cy="92" r="5.5" fill="#1c1c20"/>' +
    '<circle cx="92" cy="90" r="1.8" fill="#f5f1e8"/>' +
    '<circle cx="160" cy="90" r="1.8" fill="#f5f1e8"/>' +
    '</g>' +
    '<g class="p-brows">' +
    '<path d="M70 70 L104 82" stroke="#14120f" stroke-width="8"/>' +
    '<path d="M178 70 L144 82" stroke="#14120f" stroke-width="8"/>' +
    '</g>' +
    // nariz y bocas
    '<path d="M114 117 Q124 111 134 117 Q130 128 124 128 Q118 128 114 117 Z" fill="#14120f" stroke="none"/>' +
    '<path class="p-mouth-smile" d="M112 140 Q124 148 136 140" fill="none"/>' +
    '<path class="p-mouth-flat" d="M114 144 Q124 139 134 144" fill="none"/>' +
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
    '<text x="124" y="186" text-anchor="middle" font-family="Outfit, Arial, sans-serif" font-weight="700" font-size="28" fill="#f2ecc9" stroke="none">lelo</text>' +
    '</g>' +
    '</svg>';

  var MSG_NEWSLETTER =
    '¿Qué haces, que no nos has dejado tu correo para la newsletter? ' +
    'Tú sabrás lo que te pierdes…';
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

  var panelEls = [];
  var panelRects = [];
  var lastRectRefresh = 0;

  function refreshPanels() {
    panelEls = Array.prototype.slice.call(document.querySelectorAll('.glass-panel'));
  }

  function refreshRects() {
    panelRects = [];
    for (var i = 0; i < panelEls.length; i++) {
      var r = panelEls[i].getBoundingClientRect();
      if (r.width < 150 || r.height < 90) continue;       // ignora tarjetitas
      if (r.bottom < 40 || r.top > H - 40) continue;       // fuera de pantalla
      panelRects.push(r);
    }
  }

  refreshPanels();

  // ---------- BOCADILLO ----------
  function showBubble(html, autoHideMs) {
    clearTimeout(bubbleTimer);
    bubble.innerHTML = html;
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

  // ---------- INTERACCIÓN: atraparlo ----------
  function catchPanda() {
    clearTimeout(resumeTimer);
    if (mode === 'flyTo') fly = null;
    mode = 'caught';
    vx = 0; vy = 0;
    setCaughtPose(true);
    showBubble(
      MSG_NEWSLETTER + '<br /><a href="' + joinHref + '">Déjanoslo aquí →</a>'
    );
  }

  function releasePanda() {
    if (mode !== 'caught') return;
    setCaughtPose(false);
    hideBubble();
    if (reduceMotion) { park(); return; }
    mode = 'bounce';
    vy = -8;
    vx = (Math.random() < 0.5 ? -1 : 1) * (2 + Math.random() * 1.5);
  }

  el.addEventListener('pointerdown', function (e) {
    e.preventDefault();
    if (mode === 'caught') return;
    catchPanda();
  });

  window.addEventListener('pointerup', function () {
    if (mode !== 'caught') return;
    clearTimeout(resumeTimer);
    resumeTimer = setTimeout(releasePanda, 3500); // tiempo para leer el bocadillo
  });

  el.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (mode === 'caught') releasePanda();
      else { catchPanda(); resumeTimer = setTimeout(releasePanda, 5000); }
    }
  });

  // Si pulsa el enlace del bocadillo, soltamos al panda
  bubble.addEventListener('click', function (e) {
    if (e.target.tagName === 'A') releasePanda();
  });

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

    // Bordes laterales
    if (x <= 0) { x = 0; vx = Math.abs(vx); pulse('stretch'); }
    else if (x + pw >= W) { x = W - pw; vx = -Math.abs(vx); pulse('stretch'); }

    // Techo
    if (y <= 0) { y = 0; vy = Math.abs(vy) * 0.6; }

    // Suelo (borde inferior de la ventana): aterriza y vuelve a saltar
    if (y + ph >= H) {
      y = H - ph;
      landAndJump();
    }

    // Paneles de cristal: se impulsa con ellos
    if (performance.now() - lastRectRefresh > 400) {
      refreshRects();
      lastRectRefresh = performance.now();
    }
    for (var i = 0; i < panelRects.length; i++) {
      var r = panelRects[i];
      if (x + pw < r.left || x > r.right || y + ph < r.top || y > r.bottom) continue;

      var overlapTop = y + ph - r.top;
      var overlapBottom = r.bottom - y;
      var overlapLeft = x + pw - r.left;
      var overlapRight = r.right - x;
      var m = Math.min(overlapTop, overlapBottom, overlapLeft, overlapRight);

      if (m === overlapTop && vy > 0) {          // cae sobre el panel → rebota
        y = r.top - ph;
        landAndJump();
      } else if (m === overlapBottom && vy < 0) { // golpea por debajo
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
  }

  function flyPhysics(now) {
    var t = Math.min((now - fly.t0) / fly.dur, 1);
    var ease = t * (2 - t); // easeOutQuad
    var tgt = perchTarget();
    x = fly.x0 + (tgt.x - fly.x0) * ease;
    y = fly.y0 + (tgt.y - fly.y0) * ease - Math.sin(t * Math.PI) * fly.arc;
    if (t >= 1) {
      fly = null;
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
    if (modal && modal.classList.contains('open')) {
      el.style.visibility = 'hidden';
      bubble.style.visibility = 'hidden';
      requestAnimationFrame(frame);
      return;
    }
    el.style.visibility = '';
    bubble.style.visibility = '';

    if (mode === 'bounce') bouncePhysics();
    else if (mode === 'flyTo' && fly) flyPhysics(now);
    else if (mode === 'perched') perchedPhysics(now);

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
    x = Math.min(x, W - pw);
    y = Math.min(y, H - ph);
    lastRectRefresh = 0;
    if (mode === 'parked') park();
  }
  window.addEventListener('resize', onResize);
  window.addEventListener('scroll', function () { lastRectRefresh = 0; }, { passive: true });

  // ---------- MODO SIN ANIMACIÓN (prefers-reduced-motion) ----------
  function park() {
    mode = 'parked';
    x = W - pw - 14;
    y = H - ph - 14;
    el.style.transform = 'translate3d(' + x + 'px,' + y + 'px,0)';
  }

  if (reduceMotion) {
    // Sin animación: el panda se queda quieto en la esquina y solo
    // reacciona al atraparlo (el bucle de físicas no corre).
    park();
  } else {
    requestAnimationFrame(frame);
  }
})();
