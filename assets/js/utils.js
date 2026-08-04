// ===== TICKER BANNER =====

(function () {
  const SPEED = 55; // píxeles por segundo (misma velocidad en toda pantalla)
  const tracks = document.querySelectorAll('.ticker-track');
  if (!tracks.length) return;

  function build(track, original) {
    // 1. Medir cuánto ocupa una copia del contenido
    const probe = document.createElement('div');
    probe.className = 'ticker-group';
    probe.style.cssText = 'position:absolute;visibility:hidden;top:0;left:0;';
    probe.innerHTML = original;
    track.appendChild(probe);
    const unitWidth = probe.getBoundingClientRect().width;
    track.removeChild(probe);
    if (!unitWidth) return 0;

    // 2. Repetirla hasta cubrir la pantalla: si el grupo fuese más estrecho
    //    que el viewport se vería un hueco al final de cada vuelta.
    const repeats = Math.max(1, Math.ceil(window.innerWidth / unitWidth));
    const groupHTML = original.repeat(repeats);

    // 3. Dos grupos idénticos; el CSS desplaza justo el 50% (= un grupo).
    track.innerHTML =
      '<div class="ticker-group">' + groupHTML + '</div>' +
      '<div class="ticker-group" aria-hidden="true">' + groupHTML + '</div>';

    // 4. Duración proporcional al recorrido: la velocidad no depende de
    //    cuántas repeticiones hayan hecho falta.
    const groupWidth = track.firstElementChild.getBoundingClientRect().width;
    if (groupWidth) {
      track.style.animationDuration = (groupWidth / SPEED).toFixed(2) + 's';
    }

    // El banner es decorativo (aria-hidden) y su contenido está repetido:
    // sus enlaces no deben recibir el foco del teclado (están en el pie).
    track.querySelectorAll('a').forEach(a => a.setAttribute('tabindex', '-1'));

    return unitWidth;
  }

  tracks.forEach(track => {
    const original = track.innerHTML;
    let measuredAt = build(track, original);

    // Las medidas cambian cuando entran las fuentes autoalojadas: si el
    // ancho real difiere, se reconstruye con los valores definitivos.
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => {
        const probe = document.createElement('div');
        probe.className = 'ticker-group';
        probe.style.cssText = 'position:absolute;visibility:hidden;top:0;left:0;';
        probe.innerHTML = original;
        track.appendChild(probe);
        const now = probe.getBoundingClientRect().width;
        track.removeChild(probe);
        if (Math.abs(now - measuredAt) > 1) measuredAt = build(track, original);
      });
    }

    // Al girar el móvil o redimensionar puede hacer falta otra repetición
    let t = null;
    window.addEventListener('resize', () => {
      clearTimeout(t);
      t = setTimeout(() => { measuredAt = build(track, original); }, 200);
    });
  });
})();


// ===== SCROLL REVEAL =====

(function () {
  const elements = document.querySelectorAll('.reveal');
  if (!elements.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const delay = entry.target.dataset.delay || 0;
        setTimeout(() => {
          entry.target.classList.add('visible');
        }, parseInt(delay, 10));
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px'
  });

  elements.forEach(el => observer.observe(el));
})();


// ===== HEADER SCROLL EFFECT =====

(function () {
  const header = document.getElementById('site-header');
  if (!header) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 30) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }, { passive: true });
})();


// ===== MOBILE NAV HAMBURGER =====

(function () {
  const hamburger = document.querySelector('.hamburger');
  const nav = document.querySelector('.site-nav');
  if (!hamburger || !nav) return;

  function setOpen(open) {
    hamburger.classList.toggle('open', open);
    nav.classList.toggle('open', open);
    hamburger.setAttribute('aria-expanded', String(open));
  }

  hamburger.addEventListener('click', () => {
    setOpen(!nav.classList.contains('open'));
  });

  // Close on link click
  nav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => setOpen(false));
  });
})();


// ===== FORM SUBMISSION (Formspree) =====

(function () {
  const ENDPOINT = 'https://formspree.io/f/xpqkqnrg';

  document.querySelectorAll('.contact-form').forEach(form => {
    form.addEventListener('submit', async function (e) {
      e.preventDefault();

      const btn = this.querySelector('[type="submit"]');
      const originalText = btn.textContent;
      btn.textContent = 'Enviando…';
      btn.disabled = true;

      try {
        const res = await fetch(ENDPOINT, {
          method: 'POST',
          body: new FormData(this),
          headers: { 'Accept': 'application/json' }
        });

        if (!res.ok) throw new Error('HTTP ' + res.status);

        btn.textContent = '✓ ¡Listo! Te escribimos pronto';
        btn.style.borderColor = 'rgba(255,237,74,0.5)';
        btn.style.color = '#ffed4a';
        this.reset();

        // Ya nos has dejado el correo: a lelo se le pasa el enfado
        if (typeof window.leloPerdona === 'function') window.leloPerdona();
      } catch (err) {
        btn.textContent = 'No se pudo enviar. Inténtalo de nuevo';
      }

      setTimeout(() => {
        btn.textContent = originalText;
        btn.style.borderColor = '';
        btn.style.color = '';
        btn.disabled = false;
      }, 4000);
    });
  });
})();


// ===== ACTIVE NAV LINK =====

(function () {
  // Funciona tanto con /nosotros (cleanUrls en producción) como con /nosotros.html (local)
  const path = (window.location.pathname.replace(/\.html$/, '').replace(/\/$/, '') || '/');

  document.querySelectorAll('.site-nav a').forEach(link => {
    const href = (link.getAttribute('href') || '').split('#')[0].replace(/\.html$/, '');
    if (!href) return;
    const isHome = href === '/' || href === 'index' || href === '.';
    if ((isHome && (path === '/' || path.endsWith('/index'))) || (!isHome && path.endsWith(href.replace(/^\//, '')) && href !== '/')) {
      link.classList.add('active');
    }
  });
})();
