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
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        // Stagger children if parent has reveal class
        const delay = entry.target.dataset.delay || 0;
        setTimeout(() => {
          entry.target.classList.add('visible');
        }, parseInt(delay));
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
  });
})();


// ===== MOBILE NAV HAMBURGER =====

(function () {
  const hamburger = document.querySelector('.hamburger');
  const nav = document.querySelector('.site-nav');
  if (!hamburger || !nav) return;

  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    nav.classList.toggle('open');
  });

  // Close on link click
  nav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('open');
      nav.classList.remove('open');
    });
  });
})();


// ===== FORM SUBMISSION (demo) =====

(function () {
  document.querySelectorAll('.contact-form').forEach(form => {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      const btn = this.querySelector('[type="submit"]');
      const originalText = btn.textContent;

      btn.textContent = '✓ ¡Listo! Te escribimos pronto';
      btn.style.borderColor = 'rgba(212,255,97,0.5)';
      btn.style.color = '#d4ff61';
      btn.disabled = true;

      setTimeout(() => {
        btn.textContent = originalText;
        btn.style.borderColor = '';
        btn.style.color = '';
        btn.disabled = false;
        this.reset();
      }, 3000);
    });
  });
})();


// ===== ACTIVE NAV LINK =====

(function () {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.site-nav a').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });
})();
