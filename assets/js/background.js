// ===== ANIMATED BACKGROUND CANVAS =====
// Film grain + glitch lines rendered on a canvas

(function () {
  // Inject the background pulsing logo before the canvas
  const bgLogo = document.createElement('img');
  bgLogo.src = 'assets/images/logo.svg';
  bgLogo.className = 'bg-pulse-logo';
  bgLogo.setAttribute('aria-hidden', 'true');
  document.body.prepend(bgLogo);

  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let w, h;
  let frame = 0;

  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  }

  window.addEventListener('resize', resize);
  resize();

  // Pseudo-random noise
  function noise(x, y, t) {
    return (Math.sin(x * 127.1 + y * 311.7 + t * 74.7) * 0.5 + 0.5);
  }

  // Generate film grain
  function drawGrain() {
    const imageData = ctx.createImageData(w, h);
    const data = imageData.data;
    const t = frame * 0.08;

    for (let i = 0; i < data.length; i += 4) {
      const px = (i / 4) % w;
      const py = Math.floor((i / 4) / w);

      // Grain intensity
      const g = Math.random();
      const intensity = g * 18; // very subtle

      // Base dark color
      data[i]     = 8 + intensity;   // R
      data[i + 1] = 8 + intensity;   // G
      data[i + 2] = 8 + intensity;   // B
      data[i + 3] = 255;             // A
    }

    ctx.putImageData(imageData, 0, 0);
  }

  // Glitch horizontal bars
  const glitchBars = [];
  function spawnGlitchBar() {
    glitchBars.push({
      y: Math.random() * h,
      height: Math.random() * 6 + 2, // Thicker to survive blur
      width: Math.random() * w * 0.6 + w * 0.1,
      x: Math.random() > 0.5 ? 0 : w - (Math.random() * w * 0.5),
      alpha: Math.random() * 0.6 + 0.4, // Much brighter
      speed: Math.random() * 0.8 + 0.2,
      color: Math.random() > 0.7
        ? `rgba(255,237,74,${Math.random() * 0.4 + 0.6})`
        : `rgba(255,237,74,${Math.random() * 0.3 + 0.5})`,
      life: 0,
      maxLife: Math.random() * 40 + 10
    });
  }

  // Vertical scan streak
  const scanStreaks = [];
  function spawnScanStreak() {
    scanStreaks.push({
      x: Math.random() * w,
      y: -40,
      height: Math.random() * 120 + 40,
      width: Math.random() * 4 + 2, // Thicker vertically
      speed: Math.random() * 3 + 1.5,
      alpha: Math.random() * 0.3 + 0.2, // Brighter
      color: Math.random() > 0.6
        ? `rgba(255,237,74,1)`
        : `rgba(0,229,255,1)`,
      life: 0
    });
  }

  let lastGlitch = 0;
  let lastStreak = 0;

  function animate() {
    frame++;

    // Draw grain every frame
    drawGrain();

    // Spawn glitch bars occasionally
    if (frame - lastGlitch > (Math.random() * 30 + 15)) {
      spawnGlitchBar();
      lastGlitch = frame;
      if (Math.random() > 0.7) spawnGlitchBar(); // double burst
    }

    // Spawn scan streaks occasionally
    if (frame - lastStreak > (Math.random() * 120 + 60)) {
      spawnScanStreak();
      lastStreak = frame;
    }

    // Draw and update glitch bars
    ctx.save();
    for (let i = glitchBars.length - 1; i >= 0; i--) {
      const bar = glitchBars[i];
      bar.life++;
      bar.y += bar.speed * 0.5;

      const progress = bar.life / bar.maxLife;
      const fadeAlpha = bar.alpha * (1 - Math.abs(progress - 0.5) * 2);

      ctx.globalAlpha = fadeAlpha;

      // Occasional glitch offset
      const xOffset = Math.random() > 0.95 ? (Math.random() - 0.5) * 20 : 0;

      // Draw as gradient
      const grad = ctx.createLinearGradient(bar.x + xOffset, 0, bar.x + bar.width + xOffset, 0);
      grad.addColorStop(0, 'transparent');
      grad.addColorStop(0.2, bar.color);
      grad.addColorStop(0.8, bar.color);
      grad.addColorStop(1, 'transparent');

      ctx.fillStyle = grad;
      ctx.fillRect(bar.x + xOffset, bar.y, bar.width, bar.height);

      if (bar.life >= bar.maxLife) {
        glitchBars.splice(i, 1);
      }
    }
    ctx.globalAlpha = 1;

    // Draw and update scan streaks
    for (let i = scanStreaks.length - 1; i >= 0; i--) {
      const s = scanStreaks[i];
      s.y += s.speed;

      const grad = ctx.createLinearGradient(0, s.y, 0, s.y + s.height);
      grad.addColorStop(0, 'transparent');
      grad.addColorStop(0.3, s.color.replace('1)', s.alpha + ')'));
      grad.addColorStop(0.7, s.color.replace('1)', s.alpha + ')'));
      grad.addColorStop(1, 'transparent');

      ctx.fillStyle = grad;
      ctx.fillRect(s.x, s.y, s.width, s.height);

      if (s.y > h + s.height) {
        scanStreaks.splice(i, 1);
      }
    }
    ctx.restore();

    requestAnimationFrame(animate);
  }

  animate();
})();
