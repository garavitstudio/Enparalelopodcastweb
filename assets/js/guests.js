// ===== ESCENARIO DE INVITADOS =====
// Todas las fichas viven en el HTML (importa para el SEO y para que se lean
// sin JS); aqui solo se decide cual esta visible y se cambia la miniatura por
// el reproductor cuando alguien le da al play.

(function () {
  const stage = document.querySelector('.guest-stage');
  if (!stage) return;

  const items = Array.from(stage.querySelectorAll('.gs-item'));
  const tabs = Array.from(stage.querySelectorAll('.gs-tab'));
  const prevBtn = stage.querySelector('.gs-arrow[data-dir="-1"]');
  const nextBtn = stage.querySelector('.gs-arrow[data-dir="1"]');
  const counter = stage.querySelector('.gs-count b');
  if (!items.length) return;

  let current = 0;

  // Volver a la miniatura: si se deja el iframe cargado, el episodio sigue
  // sonando de fondo al cambiar de invitado.
  function resetPlayer(item) {
    const media = item.querySelector('.gs-media');
    const iframe = media && media.querySelector('iframe');
    if (!iframe) return;
    iframe.remove();
    media.querySelectorAll('.gs-hidden').forEach(el => el.classList.remove('gs-hidden'));
  }

  function show(index) {
    current = (index + items.length) % items.length;

    items.forEach((item, i) => {
      const active = i === current;
      if (!active) resetPlayer(item);
      item.classList.toggle('is-active', active);
      item.hidden = !active;
    });

    tabs.forEach((tab, i) => {
      const active = i === current;
      tab.classList.toggle('is-active', active);
      tab.setAttribute('aria-selected', active ? 'true' : 'false');
      tab.tabIndex = active ? 0 : -1;
    });

    if (counter) counter.textContent = String(current + 1).padStart(2, '0');
  }

  function play(item) {
    const media = item.querySelector('.gs-media');
    const ytid = item.dataset.yt;
    if (!media || !ytid || media.querySelector('iframe')) return;

    const iframe = document.createElement('iframe');
    iframe.src = `https://www.youtube-nocookie.com/embed/${ytid}?autoplay=1&rel=0`;
    iframe.title = item.querySelector('.gs-name').textContent.trim();
    iframe.allow = 'accelerometer; autoplay; encrypted-media; picture-in-picture';
    iframe.allowFullscreen = true;

    // La miniatura y el boton se ocultan en vez de borrarse para poder
    // restaurarlos al cambiar de invitado.
    media.querySelectorAll('img, .gs-play').forEach(el => el.classList.add('gs-hidden'));
    media.appendChild(iframe);
  }

  items.forEach(item => {
    const media = item.querySelector('.gs-media');
    if (!media) return;
    media.addEventListener('click', () => play(item));
    media.addEventListener('keydown', e => {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      e.preventDefault();
      play(item);
    });
  });

  tabs.forEach((tab, i) => tab.addEventListener('click', () => show(i)));
  if (prevBtn) prevBtn.addEventListener('click', () => show(current - 1));
  if (nextBtn) nextBtn.addEventListener('click', () => show(current + 1));

  // Flechas del teclado solo cuando el foco esta dentro del componente, para
  // no secuestrar la navegacion del resto de la pagina.
  stage.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft') { show(current - 1); tabs[current] && tabs[current].focus(); }
    if (e.key === 'ArrowRight') { show(current + 1); tabs[current] && tabs[current].focus(); }
  });

  // Deslizar en movil, ignorando el gesto cuando ya hay un video reproduciendose.
  let startX = 0;
  let startY = 0;
  stage.addEventListener('touchstart', e => {
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
  }, { passive: true });

  stage.addEventListener('touchend', e => {
    if (stage.querySelector('.gs-item.is-active iframe')) return;
    const dx = e.changedTouches[0].clientX - startX;
    const dy = e.changedTouches[0].clientY - startY;
    if (Math.abs(dx) < 55 || Math.abs(dy) > Math.abs(dx)) return;
    show(current + (dx < 0 ? 1 : -1));
  });

  show(0);
})();
