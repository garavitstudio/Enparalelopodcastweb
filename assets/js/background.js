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
  const ctx = canvas.getContext('2d', { alpha: false }); // alpha false is an optimization for black backgrounds

  // 3. Inject hidden video element for CRT ghost effect
  const videoContainer = document.createElement('div');
  videoContainer.className = 'crt-video-container';
  const ghostVideo = document.createElement('video');
  ghostVideo.id = 'crt-ghost-video';
  ghostVideo.muted = true;
  ghostVideo.playsInline = true;
  ghostVideo.loop = true; // Loop to prevent pausing if it reaches string end during a flash
  ghostVideo.setAttribute('aria-hidden', 'true');
  videoContainer.appendChild(ghostVideo);
  document.body.prepend(videoContainer); // Behind the main app framework

  // 4. Inject Analog TV Static Noise overlay
  const noiseOverlay = document.createElement('div');
  noiseOverlay.className = 'crt-noise-overlay';
  noiseOverlay.setAttribute('aria-hidden', 'true');
  document.body.prepend(noiseOverlay);

  let w, h;
  let frame = 0;

  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  function animate() {
    frame++;

    // Base background predominantly black
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#030303'; 
    ctx.fillRect(0, 0, w, h);

    // V-Sync banding effect (slow moving transparent horizontal lines indicating signal scan)
    const bandY1 = (frame * 3) % h;
    const bandY2 = ((frame * 3) + h / 2) % h;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.015)';
    ctx.fillRect(0, bandY1, w, h * 0.08);
    ctx.fillRect(0, bandY2, w, h * 0.08);

    // Occasional micro signal drops (random dark/light horizontal stripes)
    if (Math.random() > 0.95) {
      const numStripes = Math.floor(Math.random() * 4) + 1;
      for (let i = 0; i < numStripes; i++) {
        // Stripe can be a light artifact or a loss of signal (black)
        ctx.fillStyle = Math.random() > 0.5 ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.6)';
        const stripHeight = Math.random() * 120 + 10;
        const stripY = Math.random() * h;
        ctx.fillRect(0, stripY, w, stripHeight);
      }
    }
    
    // Occasional subtle full screen electrical flash (like a tube turning on/off)
    if (Math.random() > 0.99) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.035)';
      ctx.fillRect(0, 0, w, h);
    }

    // Occasional RGB split distortion across the whole body wrapper
    if (frame % Math.floor(Math.random() * 400 + 150) === 0) {
       document.body.classList.add('crt-glitch-moment');
       setTimeout(() => document.body.classList.remove('crt-glitch-moment'), 150);
    }

    requestAnimationFrame(animate);
  }

  animate();

  // ===== GHOST VIDEO SUBSYSTEM =====
  // List of available videos in the assets/videos/glitch directory
  const ghostVideos = [
    'video1.mp4', 
    // Add more here when you upload them to the folder:
    // 'video2.mp4',
    // 'video3.mp4'
  ];

  function triggerGhostSignal() {
    if (ghostVideos.length === 0) return;

    // Pick a random video from the array
    const randomVideo = ghostVideos[Math.floor(Math.random() * ghostVideos.length)];
    ghostVideo.src = `assets/videos/glitch/${randomVideo}`;
    
    // Set up what happens when the video finishes buffering its metadata
    ghostVideo.onloadedmetadata = () => {
      // Compute a random start time safely, reserving at least 3 seconds at the tail
      const safeDuration = Math.max(0, ghostVideo.duration - 3);
      ghostVideo.currentTime = Math.random() * safeDuration;
      
      // Attempt play (browsers sometimes block autoplay if not muted, but we are muted)
      ghostVideo.play().then(() => {
        // Activate full CRT styles and transitions to make it visible
        ghostVideo.classList.add('glitch-video-active');
        
        // Hide after 1 to 3 seconds of reproduction
        const showDuration = Math.random() * 2000 + 1000;
        setTimeout(() => {
          ghostVideo.classList.remove('glitch-video-active');
          // Wait for CSS transition (0.1s opacity) to fade before actually pausing JS engine
          setTimeout(() => {
            ghostVideo.pause(); 
          }, 300);
          
          // Schedule next ghost appearance between 8 and 18 seconds from now
          const nextInterval = Math.random() * 10000 + 8000;
          setTimeout(triggerGhostSignal, nextInterval);
        }, showDuration);
        
      }).catch(err => {
        console.log("Autoplay prevented or video missing:", err);
        // Reschedule gracefully if video failed to load or play
        setTimeout(triggerGhostSignal, 10000);
      });
    };

    // Reschedule if video completely fails to load entirely (e.g file doesn't exist yet)
    ghostVideo.onerror = () => {
      setTimeout(triggerGhostSignal, 10000);
    };
  }

  // Start the very first signal trigger catch after initial page load delay
  setTimeout(triggerGhostSignal, Math.random() * 5000 + 4000);

})();
