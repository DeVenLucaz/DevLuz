'use strict';

/**
 * ═══════════════════════════════════════════════════════════════════
 *  DeVenLucaz — Dark Cosmic Portfolio · Astro Ink-Drop Mascot
 * ═══════════════════════════════════════════════════════════════════
 *  A procedurally built Three.js 3D character that lives in the
 *  bottom-right corner of the viewport. It breathes, blinks, follows
 *  the cursor, reacts to clicks and scroll, and has a swirling
 *  galaxy embedded in its chest.
 * ═══════════════════════════════════════════════════════════════════
 */

(function () {

  // ─── Utilities ──────────────────────────────────────────────────
  const lerp = (a, b, t) => a + (b - a) * t;
  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

  // ─── Container Setup ───────────────────────────────────────────
  let container = document.getElementById('astro-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'astro-container';
    document.body.appendChild(container);
  }

  // Style the container
  Object.assign(container.style, {
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    width: '180px',
    height: '220px',
    pointerEvents: 'none',
    zIndex: '50',
    overflow: 'visible'
  });


  // ═══════════════════════════════════════════════════════════════
  //  THREE.JS SCENE SETUP
  // ═══════════════════════════════════════════════════════════════
  const WIDTH = 180;
  const HEIGHT = 220;

  const renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: true
  });
  renderer.setSize(WIDTH, HEIGHT);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputEncoding = THREE.sRGBEncoding || THREE.LinearEncoding;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(40, WIDTH / HEIGHT, 0.1, 100);
  camera.position.set(0, 0.2, 3.8);
  camera.lookAt(0, 0, 0);

  // ─── Lighting ──────────────────────────────────────────────────
  const ambientLight = new THREE.AmbientLight(0xfff5e6, 0.5); // soft warm white
  scene.add(ambientLight);

  const mainLight = new THREE.PointLight(0x80f0ff, 1.2, 10); // cyan tint
  mainLight.position.set(1, 2.5, 3);
  scene.add(mainLight);

  const fillLight = new THREE.PointLight(0x7c3aed, 0.4, 8); // violet accent
  fillLight.position.set(-2, -0.5, 2);
  scene.add(fillLight);

  const rimLight = new THREE.PointLight(0x00e5ff, 0.6, 6); // cyan rim
  rimLight.position.set(0, 1, -2);
  scene.add(rimLight);


  // ═══════════════════════════════════════════════════════════════
  //  GALAXY TEXTURE (Canvas-drawn)
  // ═══════════════════════════════════════════════════════════════
  function createGalaxyTexture() {
    const size = 256;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    // Dark background
    const bgGrad = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    bgGrad.addColorStop(0, '#0a0a2e');
    bgGrad.addColorStop(0.6, '#050518');
    bgGrad.addColorStop(1, '#000005');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, size, size);

    // Draw spiral arms
    const cx = size / 2;
    const cy = size / 2;
    const arms = 3;
    const spiralTurns = 2.5;

    for (let arm = 0; arm < arms; arm++) {
      const armOffset = (arm / arms) * Math.PI * 2;

      for (let i = 0; i < 600; i++) {
        const t = i / 600;
        const angle = armOffset + t * spiralTurns * Math.PI * 2;
        const radius = t * (size * 0.42);

        // Add spread to make arms wider
        const spread = (1 - t) * 15 + 3;
        const px = cx + Math.cos(angle) * radius + (Math.random() - 0.5) * spread;
        const py = cy + Math.sin(angle) * radius + (Math.random() - 0.5) * spread;

        // Star size and color
        const starSize = Math.random() * 1.8 + 0.3;

        // Color varies along the arm
        const hue = t < 0.3 ? 220 : t < 0.6 ? 260 : 200;
        const lightness = 50 + Math.random() * 40;
        const alpha = (1 - t) * 0.8 + 0.1;

        ctx.beginPath();
        ctx.arc(px, py, starSize, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${hue}, 80%, ${lightness}%, ${alpha})`;
        ctx.fill();
      }
    }

    // Core glow
    const coreGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, size * 0.15);
    coreGrad.addColorStop(0, 'rgba(200, 180, 255, 0.6)');
    coreGrad.addColorStop(0.3, 'rgba(100, 80, 200, 0.3)');
    coreGrad.addColorStop(1, 'rgba(0, 0, 40, 0)');
    ctx.fillStyle = coreGrad;
    ctx.fillRect(0, 0, size, size);

    // Scattered stars in the background
    for (let i = 0; i < 200; i++) {
      const sx = Math.random() * size;
      const sy = Math.random() * size;
      const ss = Math.random() * 0.8 + 0.2;
      ctx.beginPath();
      ctx.arc(sx, sy, ss, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.5 + 0.1})`;
      ctx.fill();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return { texture, canvas, ctx };
  }

  const galaxyData = createGalaxyTexture();


  // ═══════════════════════════════════════════════════════════════
  //  MATERIALS
  // ═══════════════════════════════════════════════════════════════

  // Glossy ceramic dark material
  const darkMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x0a0a2a,
    metalness: 0.3,
    roughness: 0.2,
    clearcoat: 1.0,
    clearcoatRoughness: 0.1,
    reflectivity: 0.8
  });

  // Body material with galaxy texture
  const bodyMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x0a0a2a,
    metalness: 0.3,
    roughness: 0.2,
    clearcoat: 1.0,
    clearcoatRoughness: 0.1,
    map: galaxyData.texture,
    emissiveMap: galaxyData.texture,
    emissive: new THREE.Color(0x1a1a4a),
    emissiveIntensity: 0.5
  });

  // Glowing cyan material for eyes
  const eyeMaterial = new THREE.MeshBasicMaterial({
    color: 0x00e5ff,
    transparent: true,
    opacity: 0.95
  });

  // Dimmer cyan for mouth
  const mouthMaterial = new THREE.MeshBasicMaterial({
    color: 0x00e5ff,
    transparent: true,
    opacity: 0.6
  });


  // ═══════════════════════════════════════════════════════════════
  //  CHARACTER BUILD
  // ═══════════════════════════════════════════════════════════════
  const astro = new THREE.Group();

  // ─── HEAD (teardrop / ink-drop via LatheGeometry) ──────────────
  const headProfile = [];
  const headSegments = 32;
  for (let i = 0; i <= headSegments; i++) {
    const t = i / headSegments; // 0 (bottom) → 1 (top)
    let radius;

    if (t < 0.05) {
      // Flat base
      radius = lerp(0.02, 0.4, t / 0.05);
    } else if (t < 0.5) {
      // Widest part — belly of the teardrop
      const tt = (t - 0.05) / 0.45;
      radius = 0.4 + Math.sin(tt * Math.PI * 0.5) * 0.12;
    } else if (t < 0.85) {
      // Taper inward
      const tt = (t - 0.5) / 0.35;
      radius = lerp(0.52, 0.15, tt * tt);
    } else {
      // Point at top
      const tt = (t - 0.85) / 0.15;
      radius = lerp(0.15, 0.0, Math.sqrt(tt));
    }

    const y = t * 1.2 - 0.1; // height range
    headProfile.push(new THREE.Vector2(Math.max(radius, 0.001), y));
  }

  const headGeom = new THREE.LatheGeometry(headProfile, 32);
  const headMesh = new THREE.Mesh(headGeom, darkMaterial);
  headMesh.position.y = 0.45;
  astro.add(headMesh);

  // ─── BODY (squished sphere) ────────────────────────────────────
  const bodyGeom = new THREE.SphereGeometry(0.5, 32, 24);
  const bodyMesh = new THREE.Mesh(bodyGeom, bodyMaterial);
  bodyMesh.scale.set(1, 0.8, 0.85);
  bodyMesh.position.y = -0.2;
  astro.add(bodyMesh);

  // ─── EYES (two glowing spheres, flattened) ─────────────────────
  const eyeGeom = new THREE.SphereGeometry(0.1, 16, 16);

  const leftEye = new THREE.Mesh(eyeGeom, eyeMaterial);
  leftEye.scale.set(1, 1, 0.3);
  leftEye.position.set(-0.18, 0.75, 0.42);
  astro.add(leftEye);

  const rightEye = new THREE.Mesh(eyeGeom, eyeMaterial);
  rightEye.scale.set(1, 1, 0.3);
  rightEye.position.set(0.18, 0.75, 0.42);
  astro.add(rightEye);

  // Eye glow lights
  const leftEyeLight = new THREE.PointLight(0x00e5ff, 0.3, 1.5);
  leftEyeLight.position.copy(leftEye.position);
  leftEyeLight.position.z += 0.1;
  astro.add(leftEyeLight);

  const rightEyeLight = new THREE.PointLight(0x00e5ff, 0.3, 1.5);
  rightEyeLight.position.copy(rightEye.position);
  rightEyeLight.position.z += 0.1;
  astro.add(rightEyeLight);

  // ─── MOUTH (tiny horizontal bar) ──────────────────────────────
  const mouthGeom = new THREE.BoxGeometry(0.12, 0.02, 0.02);
  const mouthMesh = new THREE.Mesh(mouthGeom, mouthMaterial);
  mouthMesh.position.set(0, 0.58, 0.47);
  astro.add(mouthMesh);

  // ─── ARMS (small capsule-like shapes) ──────────────────────────
  const armGeom = new THREE.SphereGeometry(0.1, 12, 12);

  const leftArm = new THREE.Mesh(armGeom, darkMaterial);
  leftArm.scale.set(0.7, 1.2, 0.8);
  leftArm.position.set(-0.55, -0.12, 0.1);
  leftArm.rotation.z = 0.4; // slightly outward
  astro.add(leftArm);

  const rightArm = new THREE.Mesh(armGeom, darkMaterial);
  rightArm.scale.set(0.7, 1.2, 0.8);
  rightArm.position.set(0.55, -0.12, 0.1);
  rightArm.rotation.z = -0.4;
  astro.add(rightArm);

  // ─── FEET (two small spheres) ──────────────────────────────────
  const footGeom = new THREE.SphereGeometry(0.1, 12, 12);

  const leftFoot = new THREE.Mesh(footGeom, darkMaterial);
  leftFoot.scale.set(1.2, 0.6, 1.3);
  leftFoot.position.set(-0.18, -0.62, 0.08);
  astro.add(leftFoot);

  const rightFoot = new THREE.Mesh(footGeom, darkMaterial);
  rightFoot.scale.set(1.2, 0.6, 1.3);
  rightFoot.position.set(0.18, -0.62, 0.08);
  astro.add(rightFoot);

  // ─── Position the whole group ──────────────────────────────────
  astro.position.set(0, -0.1, 0);
  scene.add(astro);


  // ═══════════════════════════════════════════════════════════════
  //  ANIMATION STATE
  // ═══════════════════════════════════════════════════════════════
  const state = {
    // Mouse tracking (normalized -1 to 1)
    mouseX: 0,
    mouseY: 0,
    targetRotY: 0,
    targetRotX: 0,
    currentRotY: 0,
    currentRotX: 0,

    // Eye tracking offsets
    eyeOffsetX: 0,
    eyeOffsetY: 0,

    // Blink
    blinkTimer: 0,
    nextBlink: 3 + Math.random() * 3,
    isBlinking: false,
    blinkProgress: 0,

    // Click reaction
    isJumping: false,
    jumpStartTime: 0,
    jumpDuration: 600,

    // Scroll bounce
    scrollBounce: 0,
    scrollBounceVel: 0,

    // Galaxy rotation
    galaxyRotation: 0,

    // Base eye positions (for tracking)
    leftEyeBaseX: leftEye.position.x,
    leftEyeBaseY: leftEye.position.y,
    rightEyeBaseX: rightEye.position.x,
    rightEyeBaseY: rightEye.position.y,
  };


  // ═══════════════════════════════════════════════════════════════
  //  EVENT LISTENERS
  // ═══════════════════════════════════════════════════════════════

  // Mouse tracking
  document.addEventListener('mousemove', (e) => {
    state.mouseX = (e.clientX / window.innerWidth) * 2 - 1;
    state.mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
  });

  // Click reaction — make the character area clickable
  const clickZone = document.createElement('div');
  Object.assign(clickZone.style, {
    position: 'absolute',
    top: '0',
    left: '0',
    width: '100%',
    height: '100%',
    pointerEvents: 'auto',
    cursor: 'pointer'
  });
  container.appendChild(clickZone);

  clickZone.addEventListener('click', () => {
    if (!state.isJumping) {
      state.isJumping = true;
      state.jumpStartTime = performance.now();
    }
  });

  // Scroll bounce reaction (debounced)
  let scrollTimeout;
  window.addEventListener('scroll', () => {
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
      state.scrollBounceVel = 0.08;
    }, 50);
  }, { passive: true });


  // ═══════════════════════════════════════════════════════════════
  //  ANIMATION LOOP
  // ═══════════════════════════════════════════════════════════════
  let animFrameId;
  const clock = new THREE.Clock();

  function animate() {
    animFrameId = requestAnimationFrame(animate);

    // Skip rendering when page is hidden
    if (document.hidden) return;

    const elapsed = clock.getElapsedTime();
    const delta = clock.getDelta();
    const now = performance.now();

    // ─── 1. Idle Breathing ─────────────────────────────────────
    const breathe = Math.sin(elapsed * 2) * 0.02 + 1;
    astro.scale.set(breathe, breathe, breathe);

    // ─── 2. Body Bob ───────────────────────────────────────────
    const bob = Math.sin(elapsed * 1.5) * 0.03;
    astro.position.y = -0.1 + bob;

    // ─── 3. Cursor Following (rotation) ────────────────────────
    state.targetRotY = state.mouseX * 0.26; // ±15 degrees ≈ 0.26 rad
    state.targetRotX = -state.mouseY * 0.17; // ±10 degrees ≈ 0.17 rad

    state.currentRotY = lerp(state.currentRotY, state.targetRotY, 0.05);
    state.currentRotX = lerp(state.currentRotX, state.targetRotX, 0.05);

    astro.rotation.y = state.currentRotY;
    astro.rotation.x = state.currentRotX;

    // ─── 4. Eye Tracking ───────────────────────────────────────
    const eyeTargetX = state.mouseX * 0.02;
    const eyeTargetY = state.mouseY * 0.02;
    state.eyeOffsetX = lerp(state.eyeOffsetX, eyeTargetX, 0.08);
    state.eyeOffsetY = lerp(state.eyeOffsetY, eyeTargetY, 0.08);

    leftEye.position.x = state.leftEyeBaseX + state.eyeOffsetX;
    leftEye.position.y = state.leftEyeBaseY + state.eyeOffsetY;
    rightEye.position.x = state.rightEyeBaseX + state.eyeOffsetX;
    rightEye.position.y = state.rightEyeBaseY + state.eyeOffsetY;

    // ─── 5. Eye Blink ──────────────────────────────────────────
    state.blinkTimer += 1 / 60; // approximate frame time
    if (!state.isBlinking && state.blinkTimer >= state.nextBlink) {
      state.isBlinking = true;
      state.blinkProgress = 0;
      state.blinkTimer = 0;
      state.nextBlink = 3 + Math.random() * 3;
    }

    if (state.isBlinking) {
      state.blinkProgress += 1 / 60;
      const blinkDuration = 0.15; // 150ms
      const t = state.blinkProgress / blinkDuration;

      if (t <= 0.5) {
        // Closing
        const scaleY = lerp(1, 0.1, t * 2);
        leftEye.scale.y = scaleY;
        rightEye.scale.y = scaleY;
      } else if (t <= 1) {
        // Opening
        const scaleY = lerp(0.1, 1, (t - 0.5) * 2);
        leftEye.scale.y = scaleY;
        rightEye.scale.y = scaleY;
      } else {
        leftEye.scale.y = 1;
        rightEye.scale.y = 1;
        state.isBlinking = false;
      }
    }

    // ─── 6. Click Reaction (Jump) ──────────────────────────────
    if (state.isJumping) {
      const jumpElapsed = (now - state.jumpStartTime) / state.jumpDuration;

      if (jumpElapsed < 1) {
        // Phase 1: Jump up (0-0.3)
        if (jumpElapsed < 0.3) {
          const t = jumpElapsed / 0.3;
          const easeOut = 1 - Math.pow(1 - t, 2);
          astro.position.y += easeOut * 0.2;
          const s = 1 + easeOut * 0.1;
          astro.scale.set(s, s, s);
          astro.rotation.x = -easeOut * 0.15;
        }
        // Phase 2: Hang (0.3-0.5)
        else if (jumpElapsed < 0.5) {
          astro.position.y += 0.2;
          astro.scale.set(1.1, 1.1, 1.1);
          astro.rotation.x = -0.15;
        }
        // Phase 3: Drop back down with bounce (0.5-1)
        else {
          const t = (jumpElapsed - 0.5) / 0.5;
          const bounce = Math.sin(t * Math.PI) * Math.pow(1 - t, 2);
          const easeIn = t * t;
          astro.position.y += (1 - easeIn) * 0.2 + bounce * 0.05;
          const s = lerp(1.1, 1, easeIn);
          astro.scale.set(s, s, s);
          astro.rotation.x = lerp(-0.15, 0, easeIn);
        }
      } else {
        state.isJumping = false;
      }
    }

    // ─── 7. Scroll Bounce ──────────────────────────────────────
    if (Math.abs(state.scrollBounceVel) > 0.001) {
      state.scrollBounce += state.scrollBounceVel;
      state.scrollBounceVel *= 0.9; // dampen

      // Spring back
      state.scrollBounceVel -= state.scrollBounce * 0.3;
      astro.position.y += state.scrollBounce;
    } else {
      state.scrollBounce = 0;
    }

    // ─── 8. Galaxy Texture Animation ───────────────────────────
    state.galaxyRotation += 0.0003;
    if (galaxyData.texture.offset) {
      galaxyData.texture.offset.x = Math.sin(state.galaxyRotation) * 0.05;
      galaxyData.texture.offset.y = Math.cos(state.galaxyRotation) * 0.05;
      galaxyData.texture.needsUpdate = false; // offset changes auto-update
    }

    // ─── 9. Subtle arm sway ────────────────────────────────────
    leftArm.rotation.z = 0.4 + Math.sin(elapsed * 1.2) * 0.08;
    rightArm.rotation.z = -0.4 - Math.sin(elapsed * 1.2 + 0.5) * 0.08;

    // ─── 10. Eye glow pulse ────────────────────────────────────
    const glowPulse = 0.25 + Math.sin(elapsed * 3) * 0.08;
    leftEyeLight.intensity = glowPulse;
    rightEyeLight.intensity = glowPulse;

    // ─── Render ────────────────────────────────────────────────
    renderer.render(scene, camera);
  }

  animate();


  // ═══════════════════════════════════════════════════════════════
  //  CLEANUP
  // ═══════════════════════════════════════════════════════════════
  window.addEventListener('beforeunload', () => {
    if (animFrameId) cancelAnimationFrame(animFrameId);

    // Dispose geometries
    astro.traverse((child) => {
      if (child.geometry) child.geometry.dispose();
      if (child.material) {
        if (child.material.map) child.material.map.dispose();
        if (child.material.emissiveMap) child.material.emissiveMap.dispose();
        child.material.dispose();
      }
    });

    renderer.dispose();
  });

})();
