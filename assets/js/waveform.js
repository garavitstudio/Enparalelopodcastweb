// ===== PODCAST WAVEFORM / SIRI WAVE =====

(function () {
  const section = document.getElementById('waveform-section');
  const canvas = document.getElementById('waveform-canvas');
  const btn = document.getElementById('waveform-btn');
  const audioSrc = 'assets/audio/clip.m4a';

  if (!canvas || !section) return;

  const ctx = canvas.getContext('2d');
  let audio = null;
  let analyser = null;
  let audioCtx = null;
  let dataArray = null;
  let isPlaying = false;
  let animFrame = null;
  let triggered = false;

  function resize() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  // Siri-style wave (without audio)
  let idleT = 0;
  function drawIdleWave() {
    const w = canvas.width;
    const h = canvas.height;
    idleT += 0.015;

    ctx.clearRect(0, 0, w, h);

    const waves = [
      { amp: 15, freq: 0.012, speed: 0.8, color: 'rgba(255,237,74,0.35)', offset: 0 },
      { amp: 22, freq: 0.008, speed: 0.5, color: 'rgba(255,237,74,0.2)', offset: 1.5 },
      { amp: 10, freq: 0.018, speed: 1.2, color: 'rgba(255,237,74,0.2)', offset: 3 },
      { amp: 18, freq: 0.006, speed: 0.3, color: 'rgba(0,229,255,0.12)', offset: 4.5 },
    ];

    waves.forEach(wave => {
      ctx.beginPath();
      ctx.strokeStyle = wave.color;
      ctx.lineWidth = 2;

      for (let x = 0; x <= w; x++) {
        const y = h / 2 +
          Math.sin(x * wave.freq + idleT * wave.speed + wave.offset) * wave.amp +
          Math.sin(x * wave.freq * 2.3 + idleT * wave.speed * 0.7 + wave.offset) * (wave.amp * 0.4);

        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }

      ctx.shadowColor = wave.color;
      ctx.shadowBlur = 8;
      ctx.stroke();
    });

    animFrame = requestAnimationFrame(drawIdleWave);
  }

  // Active wave (with audio analyser)
  function drawActiveWave() {
    if (!analyser) return;

    const w = canvas.width;
    const h = canvas.height;

    analyser.getByteFrequencyData(dataArray);

    ctx.clearRect(0, 0, w, h);

    // Mirror wave from frequency data
    const barCount = 80;
    const step = Math.floor(dataArray.length / barCount);

    ctx.beginPath();
    ctx.strokeStyle = 'rgba(255,237,74,0.8)';
    ctx.lineWidth = 2.5;
    ctx.shadowColor = 'rgba(255,237,74,0.6)';
    ctx.shadowBlur = 12;

    for (let i = 0; i < barCount; i++) {
      const x = (i / barCount) * w;
      const val = dataArray[i * step] / 255;
      const y = h / 2 + (Math.sin(i * 0.2 + Date.now() * 0.002) * 10 + val * h * 0.3);

      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Mirror below
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(255,237,74,0.3)';
    ctx.lineWidth = 1.5;
    ctx.shadowBlur = 6;

    for (let i = 0; i < barCount; i++) {
      const x = (i / barCount) * w;
      const val = dataArray[i * step] / 255;
      const y = h / 2 - (Math.sin(i * 0.2 + Date.now() * 0.002) * 10 + val * h * 0.3);

      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();

    animFrame = requestAnimationFrame(drawActiveWave);
  }

  function initAudio() {
    if (audioCtx) return;

    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    audio = new Audio(audioSrc);
    audio.crossOrigin = 'anonymous';

    analyser = audioCtx.createAnalyser();
    analyser.fftSize = 256;
    dataArray = new Uint8Array(analyser.frequencyBinCount);

    const source = audioCtx.createMediaElementSource(audio);
    source.connect(analyser);
    analyser.connect(audioCtx.destination);

    audio.addEventListener('ended', () => {
      isPlaying = false;
      if (btn) btn.textContent = '▶ Reproducir';
      cancelAnimationFrame(animFrame);
      drawIdleWave();
    });
  }

  function togglePlay() {
    initAudio();

    if (isPlaying) {
      audio.pause();
      isPlaying = false;
      if (btn) btn.textContent = '▶ Reproducir';
      cancelAnimationFrame(animFrame);
      drawIdleWave();
    } else {
      audio.play().catch(() => {});
      isPlaying = true;
      if (btn) btn.textContent = '⏸ Pausar';
      cancelAnimationFrame(animFrame);
      drawActiveWave();
    }
  }

  if (btn) btn.addEventListener('click', togglePlay);

  // Auto-trigger on scroll
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !triggered) {
        triggered = true;
        drawIdleWave();
        // Try auto-play after user interaction (may be blocked by browser)
        setTimeout(() => {
          togglePlay();
        }, 800);
      }
    });
  }, { threshold: 0.4 });

  observer.observe(section);

  // Start idle animation immediately
  drawIdleWave();
})();
