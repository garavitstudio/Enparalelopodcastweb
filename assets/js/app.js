// ===== APP LAYER: badge "EN VIVO" + barra de pestañas móvil =====
// El badge vive en el header (PC y móvil). Cada cierto tiempo aleatorio
// sufre un cortocircuito (glitch) y pasa a decir "ESTÁS VIVO" un rato,
// con el LED en amarillo neón, antes de volver a la normalidad.

(function () {
  var header = document.getElementById('site-header');
  if (!header) return;

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------- BADGE "EN VIVO" ----------
  if (!document.querySelector('.live-badge')) {
    var badge = document.createElement('a');
    badge.className = 'live-badge';
    badge.href = 'https://www.youtube.com/@enparalelopodcast';
    badge.target = '_blank';
    badge.rel = 'noopener';
    badge.setAttribute('aria-label', 'En Paralelo en YouTube');
    badge.innerHTML =
      '<span class="live-dot" aria-hidden="true"></span>' +
      '<span class="live-text">EN VIVO</span>';

    var logo = header.querySelector('.neon-logo');
    if (logo && logo.nextSibling) header.insertBefore(badge, logo.nextSibling);
    else header.appendChild(badge);

    if (!reduceMotion) {
      var textEl = badge.querySelector('.live-text');
      var GLITCH_MS = 650;

      var scheduleShort = function () {
        // Próximo cortocircuito en 14–40 s
        setTimeout(shortCircuit, 14000 + Math.random() * 26000);
      };

      var shortCircuit = function () {
        badge.classList.add('glitching');
        setTimeout(function () {
          textEl.textContent = 'ESTÁS VIVO';
          badge.classList.add('alive');
          setTimeout(function () { badge.classList.remove('glitching'); }, 280);

          // Se queda "ESTÁS VIVO" 4.5–8 s y vuelve con otro chispazo
          setTimeout(function () {
            badge.classList.add('glitching');
            setTimeout(function () {
              textEl.textContent = 'EN VIVO';
              badge.classList.remove('alive');
              setTimeout(function () {
                badge.classList.remove('glitching');
                scheduleShort();
              }, 280);
            }, GLITCH_MS);
          }, 4500 + Math.random() * 3500);
        }, GLITCH_MS);
      };

      scheduleShort();
    }
  }

  // ---------- BARRA DE PESTAÑAS (móvil) ----------
  if (!document.querySelector('.ep-tabbar')) {
    var S = 'fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"';
    var ICONS = {
      inicio: '<svg viewBox="0 0 24 24" ' + S + '><path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/><path d="M10 21v-6h4v6"/></svg>',
      episodios: '<svg viewBox="0 0 24 24" ' + S + '><circle cx="12" cy="12" r="9"/><path d="M10 8.5v7l6-3.5z"/></svg>',
      nosotros: '<svg viewBox="0 0 24 24" ' + S + '><circle cx="8.5" cy="8" r="3.2"/><circle cx="16" cy="9.5" r="2.6"/><path d="M3.5 19c.6-3.2 2.6-5 5-5s4.4 1.8 5 5"/><path d="M14.5 14.6c2.2.3 3.9 1.9 4.4 4.4"/></svg>',
      comunidad: '<svg viewBox="0 0 24 24" ' + S + '><path d="M21 11.5a7.5 7.5 0 0 1-7.5 7.5c-1.2 0-2.4-.3-3.4-.8L5 19.5l1.4-4A7.5 7.5 0 1 1 21 11.5z"/></svg>',
      invitados: '<svg viewBox="0 0 24 24" ' + S + '><rect x="9" y="2.5" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0"/><path d="M12 18v3.5"/><path d="M8.5 21.5h7"/></svg>'
    };

    var tabs = [
      { href: '/', label: 'Inicio', icon: ICONS.inicio },
      { href: '/#episodios', label: 'Episodios', icon: ICONS.episodios },
      { href: '/nosotros', label: 'Nosotros', icon: ICONS.nosotros },
      { href: '/comunidad', label: 'Comunidad', icon: ICONS.comunidad },
      { href: '/invitados', label: 'Invitados', icon: ICONS.invitados }
    ];

    var path = (window.location.pathname.replace(/\.html$/, '').replace(/\/$/, '') || '/');
    var nav = document.createElement('nav');
    nav.className = 'ep-tabbar';
    nav.setAttribute('aria-label', 'Navegación principal');

    tabs.forEach(function (t) {
      var a = document.createElement('a');
      a.className = 'ep-tab';
      a.href = t.href;
      a.innerHTML = t.icon + '<span>' + t.label + '</span>';
      var base = t.href.split('#')[0];
      var isHome = base === '/' || base === '';
      if ((t.href === '/' && path === '/') || (!isHome && path.endsWith(base))) {
        a.classList.add('active');
        a.setAttribute('aria-current', 'page');
      }
      nav.appendChild(a);
    });

    document.body.appendChild(nav);
  }
})();
