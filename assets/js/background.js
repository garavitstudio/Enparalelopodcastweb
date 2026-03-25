// ===== ANALOG CRT BACKGROUND & GHOST VIDEOS (CANVAS-BASED) =====

(function () {
  // 1. Inject the background pulsing logo
  const bgLogo = document.createElement('img');
  bgLogo.src = 'assets/images/logo.svg';
  bgLogo.className = 'bg-pulse-logo';
  bgLogo.setAttribute('aria-hidden', 'true');
  document.body.prepend(bgLogo);

  // 2. Main canvas — ALL rendering happens here
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  // 3. Create a hidden video element used as a texture source for drawImage
  //    NOTE: We do NOT inject this into the DOM at a visible z-level.
  //    The canvas reads its frames and paints them directly, bypassing all z-index / blend issues.
  const ghostVideo = document.createElement('video');
  ghostVideo.muted = true;
  ghostVideo.playsInline = true;
  ghostVideo.loop = false;
  ghostVideo.crossOrigin = 'anonymous';
  ghostVideo.style.display = 'none';
  document.body.appendChild(ghostVideo); // Must be in DOM for play() to work

  let w, h;
  let frame = 0;

  // ===== STATIC NOISE TILE =====
  // Pre-generate a tileable noise bitmap at startup (CPU-efficient)
  const noiseSize = 256;
  const noiseOffscreen = document.createElement('canvas');
  noiseOffscreen.width = noiseSize;
  noiseOffscreen.height = noiseSize;
  const noiseCtx = noiseOffscreen.getContext('2d');
  const noiseImg = noiseCtx.createImageData(noiseSize, noiseSize);
  for (let i = 0; i < noiseImg.data.length; i += 4) {
    const v = Math.random() * 255 | 0;
    noiseImg.data[i]     = v;
    noiseImg.data[i + 1] = v;
    noiseImg.data[i + 2] = v;
    noiseImg.data[i + 3] = 255;
  }
  noiseCtx.putImageData(noiseImg, 0, 0);
  let noisePattern = null;

  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
    noisePattern = ctx.createPattern(noiseOffscreen, 'repeat');
  }
  window.addEventListener('resize', resize);
  resize();

  // ===== VIDEO STATE =====
  // ghostVideos array — add your filenames here
  const ghostVideos = [
    'video1.mp4',
    'video2.mp4',
    // 'video3.mp4',
  ];

  let videoIsPlaying = false;
  let videoOpacity = 0; // Current opacity of the video overlay on the canvas (0 = invisible)
  let videoFading = 'none'; // 'in' | 'out' | 'none'

  // ===== ANIMATION LOOP =====
  function animate() {
    frame++;

    // --- Black base ---
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = '#080808';
    ctx.fillRect(0, 0, w, h);

    // --- Static grain (permanent, always visible) ---
    if (noisePattern) {
      ctx.save();
      ctx.globalAlpha = 0.10;
      // Shift tile each frame for chaotic dancing effect
      const ox = (Math.random() * noiseSize) | 0;
      const oy = (Math.random() * noiseSize) | 0;
      ctx.translate(ox, oy);
      ctx.fillStyle = noisePattern;
      ctx.fillRect(-noiseSize, -noiseSize, w + noiseSize * 2, h + noiseSize * 2);
      ctx.restore();
    }

    ctx.globalAlpha = 1;

    // --- Video ghost frame painted directly onto the canvas ---
    if (videoIsPlaying && !ghostVideo.paused && !ghostVideo.ended && videoOpacity > 0) {
      ctx.save();
      ctx.globalAlpha = videoOpacity;
      // === object-fit: cover logic ===
      const vw = ghostVideo.videoWidth  || w;
      const vh = ghostVideo.videoHeight || h;
      const scale = Math.max(w / vw, h / vh); // scale UP to fill
      const sw = w / scale;  // source region width
      const sh = h / scale;  // source region height
      const sx = (vw - sw) / 2; // center-crop X
      const sy = (vh - sh) / 2; // center-crop Y
      ctx.drawImage(ghostVideo, sx, sy, sw, sh, 0, 0, w, h);
      // Desaturate by overlaying a color-mode black fill
      ctx.globalCompositeOperation = 'color';
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, w, h);
      ctx.restore();
    }

    // Hard cut: video either fully visible or fully gone, no interpolation
    if (videoFading === 'in') {
      videoOpacity = 0.6; // instant snap ON
    } else if (videoFading === 'out') {
      videoOpacity = 0;   // instant snap OFF
    }

    // --- V-Sync banding (scan sweep) ---
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
    const bandY = (frame * 2) % h;
    ctx.fillStyle = 'rgba(255,255,255,0.012)';
    ctx.fillRect(0, bandY, w, h * 0.12);

    // --- Occasional signal dropout stripes (horizontal) ---
    if (Math.random() > 0.96) {
      const n = Math.floor(Math.random() * 3) + 1;
      for (let i = 0; i < n; i++) {
        ctx.fillStyle = Math.random() > 0.4 ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.015)';
        ctx.fillRect(0, Math.random() * h, w, Math.random() * 80 + 5);
      }
    }

    // --- Rare full-screen electrical pulse ---
    if (Math.random() > 0.995) {
      ctx.fillStyle = 'rgba(255,255,255,0.04)';
      ctx.fillRect(0, 0, w, h);
    }

    requestAnimationFrame(animate);
  }

  animate();

  // ===== GHOST VIDEO CONTROLLER =====
  function scheduleNext() {
    const delay = Math.random() * 9000 + 1000; // 1–10s gap between appearances
    setTimeout(triggerSignal, delay);
  }

  function triggerSignal() {
    if (ghostVideos.length === 0) return;

    const file = ghostVideos[Math.floor(Math.random() * ghostVideos.length)];
    ghostVideo.src = 'assets/videos/glitch/' + file;

    ghostVideo.addEventListener('canplay', function onCanPlay() {
      ghostVideo.removeEventListener('canplay', onCanPlay);

      // Jump to a random timestamp (safely avoiding the last 3 seconds)
      if (ghostVideo.duration > 4) {
        ghostVideo.currentTime = Math.random() * (ghostVideo.duration - 4);
      }

      ghostVideo.play().then(() => {
        videoIsPlaying = true;
        videoFading = 'in';

        // Show for 1.5–3.5 seconds then fade out
        const showFor = Math.random() * 2000 + 4500; // 4.5–6.5 seconds visible
        setTimeout(() => {
          videoFading = 'out';
          // With a hard cut out, pause immediately
          setTimeout(() => {
            ghostVideo.pause();
            videoIsPlaying = false;
            videoOpacity = 0;
            videoFading = 'none';
            scheduleNext();
          }, 50); // just one frame of buffer
        }, showFor);

      }).catch(() => {
        scheduleNext(); // Retry gracefully if play fails
      });

    }, { once: false });

    ghostVideo.load();
  }

  // First trigger after 3–6 seconds
  setTimeout(triggerSignal, Math.random() * 3000 + 3000);

})();
