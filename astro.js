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
    width: '200px',
    height: '240px',
    pointerEvents: 'none',
    zIndex: '50',
    overflow: 'visible'
  });


  // ═══════════════════════════════════════════════════════════════
  //  THREE.JS SCENE SETUP
  // ═══════════════════════════════════════════════════════════════
  const WIDTH = 200;
  const HEIGHT = 240;

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
  camera.position.set(0, 0.2, 4.0);
  camera.lookAt(0, 0, 0);

  // ─── Lighting ──────────────────────────────────────────────────
  const ambientLight = new THREE.AmbientLight(0xfff5e6, 0.6);
  scene.add(ambientLight);

  const mainLight = new THREE.PointLight(0x80f0ff, 1.5, 10); 
  mainLight.position.set(2, 3, 4);
  scene.add(mainLight);

  const fillLight = new THREE.PointLight(0x7c3aed, 0.8, 8); 
  fillLight.position.set(-3, -1, 3);
  scene.add(fillLight);

  // Added a strong rim light to enhance the glossy edge reflection
  const rimLight = new THREE.PointLight(0xffffff, 1.2, 8); 
  rimLight.position.set(0, 3, -3);
  scene.add(rimLight);


  // ═══════════════════════════════════════════════════════════════
  //  GALAXY TEXTURE (Canvas-drawn)
  // ═══════════════════════════════════════════════════════════════
  function createGalaxyTexture() {
    const size = 512;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    // Deep dark background
    const bgGrad = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    bgGrad.addColorStop(0, '#0a0a2e');
    bgGrad.addColorStop(0.5, '#030312');
    bgGrad.addColorStop(1, '#000005');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, size, size);

    // Draw spiral arms
    const cx = size / 2;
    const cy = size / 2;
    const arms = 2; // Reduced to 2 prominent arms to match image
    const spiralTurns = 2.0;

    for (let arm = 0; arm < arms; arm++) {
      const armOffset = (arm / arms) * Math.PI * 2;

      for (let i = 0; i < 1500; i++) {
        const t = i / 1500;
        const angle = armOffset + t * spiralTurns * Math.PI * 2;
        const radius = t * (size * 0.35);

        const spread = (1 - t) * 20 + 2;
        const px = cx + Math.cos(angle) * radius + (Math.random() - 0.5) * spread;
        const py = cy + Math.sin(angle) * radius + (Math.random() - 0.5) * spread;

        const starSize = Math.random() * 2.0 + 0.5;
        const hue = t < 0.4 ? 210 : 250; 
        const lightness = 60 + Math.random() * 40;
        const alpha = (1 - t) * 0.9 + 0.1;

        ctx.beginPath();
        ctx.arc(px, py, starSize, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${hue}, 90%, ${lightness}%, ${alpha})`;
        ctx.fill();
      }
    }

    // Core bright glow
    const coreGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, size * 0.2);
    coreGrad.addColorStop(0, 'rgba(220, 240, 255, 0.8)');
    coreGrad.addColorStop(0.4, 'rgba(100, 150, 255, 0.4)');
    coreGrad.addColorStop(1, 'rgba(0, 0, 40, 0)');
    ctx.fillStyle = coreGrad;
    ctx.fillRect(0, 0, size, size);

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    // Tweak wrapping to center it nicely on the body sphere
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(1.5, 1.5);
    texture.offset.set(-0.25, -0.25);

    return { texture, canvas, ctx };
  }

  const galaxyData = createGalaxyTexture();


  // ═══════════════════════════════════════════════════════════════
  //  MATERIALS
  // ═══════════════════════════════════════════════════════════════

  // Highly glossy, midnight blue material
  const darkMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x050510,
    metalness: 0.2,
    roughness: 0.08, // Very low roughness for high gloss
    clearcoat: 1.0,
    clearcoatRoughness: 0.05,
    reflectivity: 1.0
  });

  // Body material with galaxy texture mapped on the belly
  const bodyMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x050510,
    metalness: 0.2,
    roughness: 0.08,
    clearcoat: 1.0,
    clearcoatRoughness: 0.05,
    map: galaxyData.texture,
    emissiveMap: galaxyData.texture,
    emissive: new THREE.Color(0x3a4a8a),
    emissiveIntensity: 0.7
  });

  // Bright, glowing cyan material for eyes and mouth
  const eyeMaterial = new THREE.MeshBasicMaterial({
    color: 0x00ffff,
    transparent: true,
    opacity: 1.0
  });


  // ═══════════════════════════════════════════════════════════════
  //  CHARACTER BUILD
  // ═══════════════════════════════════════════════════════════════
  const astro = new THREE.Group();

  // ─── HEAD (teardrop) ──────────────
  const headProfile = [];
  const headSegments = 32;
  for (let i = 0; i <= headSegments; i++) {
    const t = i / headSegments; 
    let radius;

    if (t < 0.05) {
      radius = lerp(0.2, 0.4, t / 0.05); // Smoother base transition
    } else if (t < 0.45) {
      const tt = (t - 0.05) / 0.4;
      radius = 0.42 + Math.sin(tt * Math.PI * 0.5) * 0.12;
    } else if (t < 0.85) {
      const tt = (t - 0.45) / 0.4;
      radius = lerp(0.54, 0.15, tt * tt);
    } else {
      const tt = (t - 0.85) / 0.15;
      radius = lerp(0.15, 0.0, Math.sqrt(tt));
    }

    const y = t * 1.3 - 0.1; 
    headProfile.push(new THREE.Vector2(Math.max(radius, 0.001), y));
  }

  const headGeom = new THREE.LatheGeometry(headProfile, 32);
  const headMesh = new THREE.Mesh(headGeom, darkMaterial);
  headMesh.position.y = 0.45;
  // Tilt head very slightly backward to match the profile view in the image
  headMesh.rotation.x = -0.05; 
  astro.add(headMesh);

  // ─── BODY (squished sphere) ────────────────────────────────────
  const bodyGeom = new THREE.SphereGeometry(0.5, 32, 32);
  const bodyMesh = new THREE.Mesh(bodyGeom, bodyMaterial);
  bodyMesh.scale.set(1.0, 0.95, 0.9);
  bodyMesh.position.y = -0.15;
  astro.add(bodyMesh);

  // ─── EYES (two glowing spheres, flattened, wide and large) ─────
  const eyeGeom = new THREE.SphereGeometry(0.12, 32, 32);

  const leftEye = new THREE.Mesh(eyeGeom, eyeMaterial);
  leftEye.scale.set(1.1, 1.1, 0.3);
  leftEye.position.set(-0.24, 0.75, 0.45);
  astro.add(leftEye);

  const rightEye = new THREE.Mesh(eyeGeom, eyeMaterial);
  rightEye.scale.set(1.1, 1.1, 0.3);
  rightEye.position.set(0.24, 0.75, 0.45);
  astro.add(rightEye);

  // Eye glow lights
  const leftEyeLight = new THREE.PointLight(0x00ffff, 0.4, 1.5);
  leftEyeLight.position.copy(leftEye.position);
  leftEyeLight.position.z += 0.1;
  astro.add(leftEyeLight);

  const rightEyeLight = new THREE.PointLight(0x00ffff, 0.4, 1.5);
  rightEyeLight.position.copy(rightEye.position);
  rightEyeLight.position.z += 0.1;
  astro.add(rightEyeLight);

  // ─── MOUTH (tiny horizontal bar) ──────────────────────────────
  const mouthGeom = new THREE.BoxGeometry(0.14, 0.015, 0.02);
  const mouthMesh = new THREE.Mesh(mouthGeom, eyeMaterial);
  mouthMesh.position.set(0, 0.55, 0.51);
  astro.add(mouthMesh);

  // ─── ARMS (elongated, smooth drops hanging at sides) ───────────
  const armGeom = new THREE.SphereGeometry(0.1, 16, 16);

  const leftArm = new THREE.Mesh(armGeom, darkMaterial);
  leftArm.scale.set(0.65, 3.2, 0.65);
  leftArm.position.set(-0.55, -0.25, 0.05);
  leftArm.rotation.z = 0.2; // Hang downwards slightly inward
  astro.add(leftArm);

  const rightArm = new THREE.Mesh(armGeom, darkMaterial);
  rightArm.scale.set(0.65, 3.2, 0.65);
  rightArm.position.set(0.55, -0.25, 0.05);
  rightArm.rotation.z = -0.2;
  astro.add(rightArm);

  // ─── LEGS (smoothly tapering down from body) ───────────────────
  const legGeom = new THREE.SphereGeometry(0.12, 16, 16);

  const leftLeg = new THREE.Mesh(legGeom, darkMaterial);
  leftLeg.scale.set(0.8, 2.5, 0.8);
  leftLeg.position.set(-0.2, -0.65, 0.05);
  astro.add(leftLeg);

  const rightLeg = new THREE.Mesh(legGeom, darkMaterial);
  rightLeg.scale.set(0.8, 2.5, 0.8);
  rightLeg.position.set(0.2, -0.65, 0.05);
  astro.add(rightLeg);

  // ─── Position the whole group ──────────────────────────────────
  astro.position.set(0, 0.0, 0);
  scene.add(astro);


  // ═══════════════════════════════════════════════════════════════
  //  ANIMATION STATE
  // ═══════════════════════════════════════════════════════════════
  const state = {
    mouseX: 0,
    mouseY: 0,
    targetRotY: 0,
    targetRotX: 0,
    currentRotY: 0,
    currentRotX: 0,

    eyeOffsetX: 0,
    eyeOffsetY: 0,

    blinkTimer: 0,
    nextBlink: 3 + Math.random() * 3,
    isBlinking: false,
    blinkProgress: 0,

    isJumping: false,
    jumpStartTime: 0,
    jumpDuration: 600,

    scrollBounce: 0,
    scrollBounceVel: 0,

    galaxyRotation: 0,

    leftEyeBaseX: leftEye.position.x,
    leftEyeBaseY: leftEye.position.y,
    rightEyeBaseX: rightEye.position.x,
    rightEyeBaseY: rightEye.position.y,
  };


  // ═══════════════════════════════════════════════════════════════
  //  EVENT LISTENERS
  // ═══════════════════════════════════════════════════════════════
  document.addEventListener('mousemove', (e) => {
    state.mouseX = (e.clientX / window.innerWidth) * 2 - 1;
    state.mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
  });

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

    if (document.hidden) return;

    const elapsed = clock.getElapsedTime();
    const now = performance.now();

    // 1. Idle Breathing
    const breathe = Math.sin(elapsed * 2) * 0.015 + 1;
    astro.scale.set(breathe, breathe, breathe);

    // 2. Body Bob
    const bob = Math.sin(elapsed * 1.5) * 0.03;
    astro.position.y = bob;

    // 3. Cursor Following (rotation)
    state.targetRotY = state.mouseX * 0.26; 
    state.targetRotX = -state.mouseY * 0.17; 

    state.currentRotY = lerp(state.currentRotY, state.targetRotY, 0.05);
    state.currentRotX = lerp(state.currentRotX, state.targetRotX, 0.05);

    astro.rotation.y = state.currentRotY;
    astro.rotation.x = state.currentRotX;

    // 4. Eye Tracking
    const eyeTargetX = state.mouseX * 0.02;
    const eyeTargetY = state.mouseY * 0.02;
    state.eyeOffsetX = lerp(state.eyeOffsetX, eyeTargetX, 0.08);
    state.eyeOffsetY = lerp(state.eyeOffsetY, eyeTargetY, 0.08);

    leftEye.position.x = state.leftEyeBaseX + state.eyeOffsetX;
    leftEye.position.y = state.leftEyeBaseY + state.eyeOffsetY;
    rightEye.position.x = state.rightEyeBaseX + state.eyeOffsetX;
    rightEye.position.y = state.rightEyeBaseY + state.eyeOffsetY;

    // 5. Eye Blink
    state.blinkTimer += 1 / 60;
    if (!state.isBlinking && state.blinkTimer >= state.nextBlink) {
      state.isBlinking = true;
      state.blinkProgress = 0;
      state.blinkTimer = 0;
      state.nextBlink = 3 + Math.random() * 3;
    }

    if (state.isBlinking) {
      state.blinkProgress += 1 / 60;
      const blinkDuration = 0.15;
      const t = state.blinkProgress / blinkDuration;

      if (t <= 0.5) {
        const scaleY = lerp(1.1, 0.1, t * 2);
        leftEye.scale.y = scaleY;
        rightEye.scale.y = scaleY;
      } else if (t <= 1) {
        const scaleY = lerp(0.1, 1.1, (t - 0.5) * 2);
        leftEye.scale.y = scaleY;
        rightEye.scale.y = scaleY;
      } else {
        leftEye.scale.y = 1.1;
        rightEye.scale.y = 1.1;
        state.isBlinking = false;
      }
    }

    // 6. Click Reaction (Jump)
    if (state.isJumping) {
      const jumpElapsed = (now - state.jumpStartTime) / state.jumpDuration;

      if (jumpElapsed < 1) {
        if (jumpElapsed < 0.3) {
          const t = jumpElapsed / 0.3;
          const easeOut = 1 - Math.pow(1 - t, 2);
          astro.position.y += easeOut * 0.2;
          const s = 1 + easeOut * 0.1;
          astro.scale.set(s, s, s);
          astro.rotation.x = -easeOut * 0.15;
        } else if (jumpElapsed < 0.5) {
          astro.position.y += 0.2;
          astro.scale.set(1.1, 1.1, 1.1);
          astro.rotation.x = -0.15;
        } else {
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

    // 7. Scroll Bounce
    if (Math.abs(state.scrollBounceVel) > 0.001) {
      state.scrollBounce += state.scrollBounceVel;
      state.scrollBounceVel *= 0.9;
      state.scrollBounceVel -= state.scrollBounce * 0.3;
      astro.position.y += state.scrollBounce;
    } else {
      state.scrollBounce = 0;
    }

    // 8. Galaxy Texture Animation
    state.galaxyRotation -= 0.0005; // Reversed direction for dynamic feel
    if (galaxyData.texture.offset) {
      galaxyData.texture.offset.x = -0.25 + Math.sin(state.galaxyRotation) * 0.1;
      galaxyData.texture.offset.y = -0.25 + Math.cos(state.galaxyRotation) * 0.1;
    }

    // 9. Subtle arm sway
    leftArm.rotation.z = 0.2 + Math.sin(elapsed * 1.2) * 0.04;
    rightArm.rotation.z = -0.2 - Math.sin(elapsed * 1.2 + 0.5) * 0.04;

    // 10. Eye glow pulse
    const glowPulse = 0.3 + Math.sin(elapsed * 3) * 0.1;
    leftEyeLight.intensity = glowPulse;
    rightEyeLight.intensity = glowPulse;

    renderer.render(scene, camera);
  }

  animate();


  // ═══════════════════════════════════════════════════════════════
  //  CLEANUP
  // ═══════════════════════════════════════════════════════════════
  window.addEventListener('beforeunload', () => {
    if (animFrameId) cancelAnimationFrame(animFrameId);

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
