// ===== FORMULARIO COMHIS =====
// Validación y envío a Formspree. Externo (no inline) para cumplir la
// Content-Security-Policy del sitio (script-src 'self').

(function () {
  const form = document.getElementById('comhis-form');
  if (!form) return;

  form.addEventListener('submit', async function (e) {
    e.preventDefault();

    const nombreEl = document.getElementById('nombre');
    const prefixEl = document.getElementById('telefono-prefijo');
    const numberEl = document.getElementById('telefono-numero');
    const telefonoHidden = document.getElementById('telefono');
    const phoneWrapper = document.getElementById('phone-field-wrapper');
    const emailEl = document.getElementById('email');
    const btn = document.getElementById('comhis-btn');

    // --- Validation regexes ---
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    const phoneRegex = /^[+]?[\d\s\-().]{7,20}$/;

    let valid = true;

    // Reset previous errors
    [nombreEl, emailEl].forEach(el => el.classList.remove('invalid'));
    phoneWrapper.classList.remove('invalid');
    ['error-telefono', 'error-email'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.classList.remove('visible');
    });

    // Nombre — just needs to be non-empty
    if (!nombreEl.value.trim()) {
      nombreEl.classList.add('invalid');
      valid = false;
    }

    // Combine prefix + number into the hidden field
    const combined = (prefixEl.value.trim() + ' ' + numberEl.value.trim()).trim();
    telefonoHidden.value = combined;

    // Teléfono — required + format
    if (!numberEl.value.trim() || !phoneRegex.test(combined)) {
      phoneWrapper.classList.add('invalid');
      document.getElementById('error-telefono').classList.add('visible');
      valid = false;
    }

    // Email — required + format
    const emailVal = emailEl.value.trim();
    if (!emailVal || !emailRegex.test(emailVal)) {
      emailEl.classList.add('invalid');
      document.getElementById('error-email').classList.add('visible');
      valid = false;
    }

    if (!valid) return; // Stop here if anything is wrong

    // --- All good, send ---
    btn.textContent = 'Enviando...';
    btn.disabled = true;

    const data = new FormData(form);

    try {
      const res = await fetch('https://formspree.io/f/xpqkqnrg', {
        method: 'POST',
        body: data,
        headers: { 'Accept': 'application/json' }
      });

      if (res.ok) {
        window.location.href = '/gracias_COMHIS';
      } else {
        btn.textContent = 'Error del servidor, inténtalo de nuevo';
        btn.disabled = false;
      }
    } catch (err) {
      btn.textContent = 'Error de red, inténtalo de nuevo';
      btn.disabled = false;
    }
  });

  // Live clear error on input
  ['telefono-numero', 'telefono-prefijo'].forEach(function (id) {
    document.getElementById(id).addEventListener('input', function () {
      document.getElementById('phone-field-wrapper').classList.remove('invalid');
      const err = document.getElementById('error-telefono');
      if (err) err.classList.remove('visible');
    });
  });
  document.getElementById('email').addEventListener('input', function () {
    this.classList.remove('invalid');
    const err = document.getElementById('error-email');
    if (err) err.classList.remove('visible');
  });
  document.getElementById('nombre').addEventListener('input', function () {
    this.classList.remove('invalid');
  });
})();
