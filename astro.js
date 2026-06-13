'use strict';

/**
 * ═══════════════════════════════════════════════════════════════════
 *  DeVenLucaz — Dark Cosmic Portfolio · Astro Mascot (Canvas 2D)
 * ═══════════════════════════════════════════════════════════════════
 *  A Canvas 2D mascot that loads a PNG reference, strips the white
 *  background, and animates it wandering the viewport while preserving
 *  all existing behaviors (breathing, cursor lean, scroll bounce,
 *  click stumble, idle detection, section reaction).
 * ═══════════════════════════════════════════════════════════════════
 */

(function () {
  // Config
  const isDaayan = window.location.pathname.includes('daayan.html') || document.body.hasAttribute('data-version');
  const speedMult = isDaayan ? 0.3 : 1.0;

  // Utilities
  const lerp = (a, b, t) => a + (b - a) * t;
  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

  // Container Setup
  let container = document.getElementById('astro-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'astro-container';
    document.body.appendChild(container);
  }

  // Update container styling for flexible wandering
  Object.assign(container.style, {
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    width: '180px',
    height: '220px',
    pointerEvents: 'none',
    zIndex: '50',
    overflow: 'visible',
    transformOrigin: 'bottom center',
    transition: 'opacity 0.5s ease-out'
  });

  // Canvas Setup
  const canvas = document.createElement('canvas');
  canvas.width = 180;
  canvas.height = 220;
  Object.assign(canvas.style, {
    width: '100%',
    height: '100%',
    pointerEvents: 'auto',
    cursor: 'pointer'
  });
  container.appendChild(canvas);
  const ctx = canvas.getContext('2d', { willReadFrequently: true });

  // Image Loading & Keying
  let img = new Image();
  let imgCanvas = document.createElement('canvas');
  let imgCtx = imgCanvas.getContext('2d', { willReadFrequently: true });
  let keyedReady = false;

  img.crossOrigin = 'Anonymous';
  img.src = 'astro-inkdrop-reference.png?v=' + Date.now();
  img.onload = () => {
    const frameWidth = img.naturalWidth / 4;
    const frameHeight = img.naturalHeight;
    imgCanvas.width = frameWidth;
    imgCanvas.height = frameHeight;
    // Draw only the leftmost character (sourceX=0, sourceY=0)
    imgCtx.drawImage(img, 0, 0, frameWidth, frameHeight, 0, 0, frameWidth, frameHeight);
    
    // Strip white background via color keying
    const imgData = imgCtx.getImageData(0, 0, frameWidth, frameHeight);
    const data = imgData.data;
    for (let i = 0; i < data.length; i += 4) {
      let r = data[i], g = data[i+1], b = data[i+2];
      // If close to white, make transparent
      if (r > 230 && g > 230 && b > 230) {
        data[i+3] = 0;
      }
    }
    imgCtx.putImageData(imgData, 0, 0);
    keyedReady = true;
  };

  // State
  let mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
  let lastMouseMoveTime = Date.now();
  let time = 0;

  // Animation values
  let targetRotation = 0;
  let currentRotation = 0;
  
  let stumbleY = 0;
  let stumbleTargetY = 0;
  let stumbleScale = 1;
  let stumbleTargetScale = 1;
  let stumbleRot = 0;
  let stumbleTargetRot = 0;
  
  let scrollBounceY = 0;
  let scrollTargetY = 0;

  // Wander values
  let wanderX = 0;
  let wanderY = 0;
  let targetWanderX = 0;
  let targetWanderY = 0;

  // Tracking last scroll section for reaction
  let lastScrollY = window.scrollY;

  // Events
  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    lastMouseMoveTime = Date.now();
  });

  canvas.addEventListener('click', () => {
    // Click stumble
    stumbleTargetY = -40;
    stumbleTargetScale = 1.1;
    stumbleTargetRot = (Math.random() > 0.5 ? 1 : -1) * 0.3;
    
    setTimeout(() => {
      stumbleTargetY = 0;
      stumbleTargetScale = 1;
      stumbleTargetRot = 0;
    }, 150);
  });

  let scrollTimeout;
  window.addEventListener('scroll', () => {
    // Scroll bounce
    let delta = window.scrollY - lastScrollY;
    lastScrollY = window.scrollY;
    
    scrollTargetY = clamp(-delta * 0.5, -30, 30);
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
      scrollTargetY = 0;
    }, 150);

    // Section reaction (every ~800px triggers a little hop)
    if (Math.abs(window.scrollY % 800) < 50) {
      stumbleTargetY = -20;
      setTimeout(() => stumbleTargetY = 0, 150);
    }
  });

  // Render Loop
  function animate() {
    requestAnimationFrame(animate);
    if (!keyedReady) return;

    time += 0.016;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 1. Idle Detection & Wandering
    let isIdle = (Date.now() - lastMouseMoveTime) > 3000;
    if (isIdle) {
      // Pick a new wander target occasionally
      if (Math.random() < 0.01 * speedMult) {
        // Wander freely within the left and top limits of the viewport
        targetWanderX = -(Math.random() * (window.innerWidth - 200));
        targetWanderY = -(Math.random() * (window.innerHeight - 250));
      }
    } else {
      // Return to bottom-right base if not idle
      targetWanderX = 0;
      targetWanderY = 0;
    }
    
    // Smooth wandering
    wanderX = lerp(wanderX, targetWanderX, 0.005 * speedMult);
    wanderY = lerp(wanderY, targetWanderY, 0.005 * speedMult);
    container.style.transform = `translate(${wanderX}px, ${wanderY}px)`;

    // 2. Cursor Lean
    let containerRect = container.getBoundingClientRect();
    let cx = containerRect.left + containerRect.width / 2;
    let cy = containerRect.top + containerRect.height / 2;
    
    let dx = mouse.x - cx;
    let dy = mouse.y - cy;
    let targetLean = clamp(dx * 0.0005, -0.2, 0.2);
    
    if (isIdle) targetLean = Math.sin(time) * 0.05; // Gentle sway when idle
    currentRotation = lerp(currentRotation, targetLean, 0.1);

    // 3. Smooth Interactivity
    stumbleY = lerp(stumbleY, stumbleTargetY, 0.2);
    stumbleScale = lerp(stumbleScale, stumbleTargetScale, 0.2);
    stumbleRot = lerp(stumbleRot, stumbleTargetRot, 0.2);
    scrollBounceY = lerp(scrollBounceY, scrollTargetY, 0.15);

    // 4. Breathing
    let breathScale = 1 + Math.sin(time * 3 * speedMult) * 0.02;

    // Draw
    ctx.save();
    
    // Origin at bottom center
    ctx.translate(canvas.width / 2, canvas.height);
    
    // Apply transforms
    ctx.rotate(currentRotation + stumbleRot);
    ctx.scale(breathScale * stumbleScale, breathScale * stumbleScale);
    ctx.translate(0, stumbleY + scrollBounceY);
    
    // Draw character sized to canvas width
    let drawW = 160;
    let drawH = (imgCanvas.height / imgCanvas.width) * drawW;
    
    ctx.drawImage(imgCanvas, -drawW / 2, -drawH, drawW, drawH);

    ctx.restore();
  }

  animate();
})();
