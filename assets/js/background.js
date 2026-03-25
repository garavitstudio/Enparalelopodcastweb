// ===== ANALOG CRT BACKGROUND & GHOST VIDEOS =====

(function () {
  // 1. Inject the background pulsing logo before the canvas
  const bgLogo = document.createElement('img');
  bgLogo.src = 'assets/images/logo.svg';
  bgLogo.className = 'bg-pulse-logo';
  bgLogo.setAttribute('aria-hidden', 'true');
  document.body.prepend(bgLogo);

  // 2. Setup Background Canvas for V-Sync scans and micro-drops
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d', { alpha: false }); 

  // 3. Inject hidden video element for CRT ghost effect
  const videoContainer = document.createElement('div');
  videoContainer.className = 'crt-video-container';
  const ghostVideo = document.createElement('video');
  ghostVideo.id = 'crt-ghost-video';
  ghostVideo.muted = true;
  ghostVideo.playsInline = true;
  ghostVideo.loop = true; 
  ghostVideo.setAttribute('aria-hidden', 'true');
  videoContainer.appendChild(ghostVideo);
  document.body.prepend(videoContainer);

  let w, h;
  let frame = 0;

  // --- NATIVE HIGH-PERFORMANCE CANVAS NOISE ---
  // Create an offscreen canvas containing static noise that we can tile seamlessly
  const noiseCanvas = document.createElement('canvas');
  const noiseSize = 250; 
  noiseCanvas.width = noiseSize;
  noiseCanvas.height = noiseSize;
  const noiseCtx = noiseCanvas.getContext('2d');
  const noiseData = noiseCtx.createImageData(noiseSize, noiseSize);
  for (let i = 0; i < noiseData.data.length; i += 4) {
    // Generate black & white noise pixels
    const val = Math.random() * 255;
    noiseData.data[i] = val;
    noiseData.data[i+1] = val;
    noiseData.data[i+2] = val;
    noiseData.data[i+3] = 255; // Fully opaque pixel
  }
  noiseCtx.putImageData(noiseData, 0, 0);
  let noisePattern = null;

  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
    noisePattern = ctx.createPattern(noiseCanvas, 'repeat');
  }
  window.addEventListener('resize', resize);
  resize();

  function animate() {
    frame++;

    // Base background predominantly black
    ctx.clearRect(0, 0, w, h);
    ctx.globalAlpha = 1.0;
    ctx.fillStyle = '#0a0a0a'; 
    ctx.fillRect(0, 0, w, h);

    // Apply the heavy TV static film grain (opacity dictates strength)
    if (noisePattern) {
      ctx.globalAlpha = 0.12; // 12% opacity over black = nice dark gritty gray static
      // Offset the tile every frame to create chaotic dancing animation
      ctx.translate(Math.random() * noiseSize, Math.random() * noiseSize);
      ctx.fillStyle = noisePattern;
      ctx.fillRect(-noiseSize, -noiseSize, w + noiseSize, h + noiseSize);
      ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset transform matrix
    }

    // V-Sync banding effect (slow moving transparent horizontal lines indicating signal scan)
    ctx.globalAlpha = 1.0;
    const bandY1 = (frame * 3) % h;
    const bandY2 = ((frame * 3) + h / 2) % h;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.015)';
    ctx.fillRect(0, bandY1, w, h * 0.08);
    ctx.fillRect(0, bandY2, w, h * 0.08);

    // Occasional micro signal drops (random dark/light horizontal stripes)
    if (Math.random() > 0.95) {
      const numStripes = Math.floor(Math.random() * 4) + 1;
      for (let i = 0; i < numStripes; i++) {
        ctx.fillStyle = Math.random() > 0.5 ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.6)';
        const stripHeight = Math.random() * 120 + 10;
        const stripY = Math.random() * h;
        ctx.fillRect(0, stripY, w, stripHeight);
      }
    }
    
    // Occasional subtle full screen electrical flash
    if (Math.random() > 0.99) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
      ctx.fillRect(0, 0, w, h);
    }

    // Occasional RGB split distortion across the background ONLY
    if (frame % Math.floor(Math.random() * 400 + 150) === 0) {
       canvas.classList.add('crt-glitch-moment');
       if(videoContainer) videoContainer.classList.add('crt-glitch-moment');
       setTimeout(() => {
         canvas.classList.remove('crt-glitch-moment');
         if(videoContainer) videoContainer.classList.remove('crt-glitch-moment');
       }, 150);
    }

    requestAnimationFrame(animate);
  }

  animate();

  // ===== GHOST VIDEO SUBSYSTEM =====
  // List of available videos in the assets/videos/glitch directory
  const ghostVideos = [
    'video1.mp4', 
    'video2.mp4',
    // Add more here when you upload them to the folder:
    // 'video3.mp4'
  ];

  function triggerGhostSignal() {
    if (ghostVideos.length === 0) return;

    // Pick a random video from the array
    const randomVideo = ghostVideos[Math.floor(Math.random() * ghostVideos.length)];
    ghostVideo.src = `assets/videos/glitch/${randomVideo}`;
    
    // Play immediately. Browser returns a Promise.
    ghostVideo.play().then(() => {
      // It is playing! Now we can safely jump to a random time.
      if (ghostVideo.duration && ghostVideo.duration > 3) {
        ghostVideo.currentTime = Math.random() * (ghostVideo.duration - 3);
      }
      
      // Activate full CRT styles and transitions to make it visible
      ghostVideo.classList.add('glitch-video-active');
      
      // Hide after 1 to 3 seconds of reproduction
      const showDuration = Math.random() * 2000 + 1000;
      setTimeout(() => {
        ghostVideo.classList.remove('glitch-video-active');
        // Wait for CSS transition (0.15s opacity) to fade out before pausing
        setTimeout(() => {
          ghostVideo.pause(); 
        }, 200);
        
        // Schedule next ghost appearance between 6 and 15 seconds from now
        const nextInterval = Math.random() * 9000 + 6000;
        setTimeout(triggerGhostSignal, nextInterval);
      }, showDuration);
      
    }).catch(err => {
      console.log("Ghost Video Playback Failed or Missing:", err);
      // Reschedule gracefully if video failed to load or play
      setTimeout(triggerGhostSignal, 5000);
    });
  }

  // Start the very first signal trigger catch after initial page load delay
  setTimeout(triggerGhostSignal, Math.random() * 4000 + 2000);

})();
