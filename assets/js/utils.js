// ===== TICKER BANNER =====

(function () {
  // Duplicate content for seamless loop
  const tracks = document.querySelectorAll('.ticker-track');
  tracks.forEach(track => {
    const content = track.innerHTML;
    track.innerHTML = content + content + content;
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
