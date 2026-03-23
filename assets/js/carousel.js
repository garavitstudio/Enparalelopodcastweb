// ===== EPISODE CAROUSEL =====

(function () {
  const track = document.querySelector('.carousel-track');
  const prevBtn = document.getElementById('carousel-prev');
  const nextBtn = document.getElementById('carousel-next');
  const dotsContainer = document.getElementById('carousel-dots');

  if (!track) return;

  const cards = Array.from(track.children);
  const total = cards.length;
  let current = 0;
  let startX = 0;
  let isDragging = false;
  let dragDelta = 0;

  // Build dots
  if (dotsContainer) {
    cards.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.className = 'carousel-dot';
      dot.setAttribute('aria-label', `Episodio ${i + 1}`);
      dot.addEventListener('click', () => goTo(i));
      dotsContainer.appendChild(dot);
    });
  }

  function getVisibleCount() {
    const w = window.innerWidth;
    if (w >= 1024) return 3;
    if (w >= 640) return 2;
    return 1;
  }

  function getMaxIndex() {
    return Math.max(0, total - getVisibleCount());
  }

  function updateDots() {
    const dots = dotsContainer ? dotsContainer.querySelectorAll('.carousel-dot') : [];
    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === current);
    });
  }

  function updateButtons() {
    if (prevBtn) prevBtn.style.opacity = current === 0 ? '0.3' : '1';
    if (nextBtn) nextBtn.style.opacity = current >= getMaxIndex() ? '0.3' : '1';
  }

  function goTo(index) {
    const maxIndex = getMaxIndex();
    current = Math.max(0, Math.min(index, maxIndex));

    const visibleCount = getVisibleCount();
    const cardWidth = 100 / visibleCount;
    const offset = current * cardWidth;

    track.style.transform = `translateX(-${offset}%)`;
    updateDots();
    updateButtons();
  }

  function next() { goTo(current + 1); }
  function prev() { goTo(current - 1); }

  if (nextBtn) nextBtn.addEventListener('click', next);
  if (prevBtn) prevBtn.addEventListener('click', prev);

  // Touch / drag support
  track.addEventListener('mousedown', e => {
    startX = e.clientX;
    isDragging = true;
    track.style.cursor = 'grabbing';
  });
  document.addEventListener('mousemove', e => {
    if (!isDragging) return;
    dragDelta = e.clientX - startX;
  });
  document.addEventListener('mouseup', () => {
    if (!isDragging) return;
    isDragging = false;
    track.style.cursor = 'grab';
    if (dragDelta < -50) next();
    else if (dragDelta > 50) prev();
    dragDelta = 0;
  });

  track.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', e => {
    const delta = e.changedTouches[0].clientX - startX;
    if (delta < -50) next();
    else if (delta > 50) prev();
  });

  // YouTube modal
  const modal = document.getElementById('yt-modal');
  const modalIframe = document.getElementById('yt-modal-iframe');
  const modalClose = document.getElementById('yt-modal-close');

  document.querySelectorAll('.episode-card').forEach(card => {
    card.addEventListener('click', function (e) {
      if (e.target.closest('.episode-play-btn') || e.currentTarget === this) {
        const ytId = this.dataset.ytid;
        if (modal && modalIframe && ytId) {
          modalIframe.src = `https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0`;
          modal.classList.add('open');
          document.body.style.overflow = 'hidden';
        }
      }
    });
  });

  function closeModal() {
    if (modal) {
      modal.classList.remove('open');
      if (modalIframe) modalIframe.src = '';
      document.body.style.overflow = '';
    }
  }

  if (modalClose) modalClose.addEventListener('click', closeModal);
  if (modal) modal.addEventListener('click', e => {
    if (e.target === modal) closeModal();
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeModal();
  });

  // Keyboard nav
  document.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft') prev();
    if (e.key === 'ArrowRight') next();
  });

  window.addEventListener('resize', () => goTo(current));

  // Init
  goTo(0);
})();
