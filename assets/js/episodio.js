// ===== REPRODUCTOR DE LA PÁGINA DE EPISODIO =====
// La miniatura no carga YouTube hasta que se pulsa: así la página pesa lo
// mínimo y no se contacta con Google sin que nadie lo haya pedido.

(function () {
  var media = document.querySelector('.ep-media');
  if (!media) return;

  function reproducir() {
    var ytid = media.dataset.yt;
    if (!ytid || media.querySelector('iframe')) return;

    var iframe = document.createElement('iframe');
    iframe.src = 'https://www.youtube-nocookie.com/embed/' + ytid + '?autoplay=1&rel=0';
    iframe.title = document.title;
    iframe.allow = 'accelerometer; autoplay; encrypted-media; picture-in-picture';
    iframe.allowFullscreen = true;

    media.innerHTML = '';
    media.appendChild(iframe);
    media.style.cursor = 'default';
    media.removeAttribute('role');
    media.removeAttribute('tabindex');
  }

  media.addEventListener('click', reproducir);
  media.addEventListener('keydown', function (e) {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    e.preventDefault();
    reproducir();
  });
})();
