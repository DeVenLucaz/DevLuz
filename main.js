'use strict';

/**
 * ═══════════════════════════════════════════════════════════════════
 *  DeVenLucaz — Dark Cosmic Portfolio · Main Interactivity Layer
 * ═══════════════════════════════════════════════════════════════════
 *  Handles: Loader, Custom Cursor, Hero Particles, Navigation,
 *  Scroll Reveal, Terminal Typing, Stat Counters, Card Tilt,
 *  Active Section Detection
 * ═══════════════════════════════════════════════════════════════════
 */

document.addEventListener('DOMContentLoaded', () => {

  // ─── Utility Helpers ────────────────────────────────────────────
  const lerp = (a, b, t) => a + (b - a) * t;
  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
  const isMobile = () => window.innerWidth <= 768;
  const isTouchDevice = () => 'ontouchstart' in window || navigator.maxTouchPoints > 0;

  /** Debounce helper */
  function debounce(fn, ms) {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), ms);
    };
  }

  // Global mouse state
  const mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
  document.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });


  // ═══════════════════════════════════════════════════════════════
  //  1. LOADER
  // ═══════════════════════════════════════════════════════════════
  const loader = document.getElementById('loader');

  function initLoader() {
    const minDelay = new Promise(resolve => setTimeout(resolve, 1500));
    const fontsReady = document.fonts ? document.fonts.ready : Promise.resolve();

    Promise.all([minDelay, fontsReady]).then(() => {
      if (loader) {
        loader.classList.add('loaded');
        setTimeout(() => {
          loader.style.display = 'none';
          // Trigger initial reveal animations after loader is gone
          triggerInitialReveals();
          initTerminalTyping();
        }, 800);
      } else {
        triggerInitialReveals();
        initTerminalTyping();
      }
    });
  }

  function triggerInitialReveals() {
    // Force the first set of visible .reveal elements to animate
    document.querySelectorAll('.reveal, .reveal-left, .reveal-right').forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        el.classList.add('visible');
      }
    });
  }


  // ═══════════════════════════════════════════════════════════════
  //  2. CUSTOM CURSOR (#cursor-glow)
  // ═══════════════════════════════════════════════════════════════
  const cursor = document.getElementById('cursor-glow');

  function initCursor() {
    if (!cursor) return;

    // Hide on touch devices
    if (isTouchDevice()) {
      cursor.style.display = 'none';
      return;
    }

    let cursorX = mouse.x;
    let cursorY = mouse.y;
    const LERP_FACTOR = 0.15;

    function updateCursor() {
      cursorX = lerp(cursorX, mouse.x, LERP_FACTOR);
      cursorY = lerp(cursorY, mouse.y, LERP_FACTOR);
      cursor.style.transform = `translate(${cursorX}px, ${cursorY}px) translate(-50%, -50%)`;
      requestAnimationFrame(updateCursor);
    }
    requestAnimationFrame(updateCursor);

    // Hover detection for interactive elements
    const hoverTargets = 'a, button, .project-card, [role="button"]';

    document.addEventListener('mouseover', (e) => {
      if (e.target.closest(hoverTargets)) {
        cursor.classList.add('cursor-hover');
      }
    });

    document.addEventListener('mouseout', (e) => {
      if (e.target.closest(hoverTargets)) {
        cursor.classList.remove('cursor-hover');
      }
    });
  }


  // ═══════════════════════════════════════════════════════════════
  //  3. HERO PARTICLE BACKGROUND (#hero-particles)
  // ═══════════════════════════════════════════════════════════════
  const heroCanvas = document.getElementById('hero-particles');
  let heroCtx, particles = [], heroAnimId;
  let heroVisible = true;

  // Accent colors for particles
  const PARTICLE_COLORS = [
    'rgba(255,255,255,',       // white
    'rgba(255,255,255,',       // white
    'rgba(255,255,255,',       // white (weighted towards white)
    'rgba(0,229,255,',         // cyan #00e5ff
    'rgba(124,58,237,',        // violet #7c3aed
  ];

  class Particle {
    constructor(w, h) {
      this.reset(w, h, true);
    }

    reset(w, h, initial = false) {
      this.x = Math.random() * w;
      this.y = initial ? Math.random() * h : h + Math.random() * 20;
      this.size = 0.5 + Math.random() * 2.5;
      this.speedX = (Math.random() - 0.5) * 0.3;
      this.speedY = -(0.1 + Math.random() * 0.4); // drift upward
      this.baseOpacity = 0.1 + Math.random() * 0.6;
      this.opacity = this.baseOpacity;
      this.colorIndex = Math.floor(Math.random() * PARTICLE_COLORS.length);
      // Twinkle parameters
      this.twinkleSpeed = 0.5 + Math.random() * 2;
      this.twinklePhase = Math.random() * Math.PI * 2;
      this.twinkles = Math.random() > 0.6; // 40% of particles twinkle
      this.w = w;
      this.h = h;
    }

    update(time, mouseNormX, mouseNormY) {
      // Drift movement
      this.x += this.speedX;
      this.y += this.speedY;

      // Parallax response to mouse (subtle, opposite direction)
      const parallaxStrength = this.size * 0.3;
      this.x += -mouseNormX * parallaxStrength * 0.02;
      this.y += -mouseNormY * parallaxStrength * 0.02;

      // Twinkle
      if (this.twinkles) {
        this.opacity = this.baseOpacity + Math.sin(time * this.twinkleSpeed + this.twinklePhase) * 0.25;
        this.opacity = clamp(this.opacity, 0.05, 0.8);
      }

      // Reset when out of bounds
      if (this.y < -10 || this.x < -10 || this.x > this.w + 10) {
        this.reset(this.w, this.h);
      }
    }

    draw(ctx) {
      const color = PARTICLE_COLORS[this.colorIndex] + this.opacity + ')';
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
    }
  }

  function initHeroParticles() {
    if (!heroCanvas) return;
    heroCtx = heroCanvas.getContext('2d');

    const resizeCanvas = () => {
      const rect = heroCanvas.parentElement
        ? heroCanvas.parentElement.getBoundingClientRect()
        : { width: window.innerWidth, height: window.innerHeight };
      const dpr = window.devicePixelRatio || 1;
      heroCanvas.width = rect.width * dpr;
      heroCanvas.height = rect.height * dpr;
      heroCanvas.style.width = rect.width + 'px';
      heroCanvas.style.height = rect.height + 'px';
      heroCtx.scale(dpr, dpr);
      return { width: rect.width, height: rect.height };
    };

    const { width, height } = resizeCanvas();

    // Create particles
    const count = isMobile() ? 80 : 150;
    particles = [];
    for (let i = 0; i < count; i++) {
      particles.push(new Particle(width, height));
    }

    // IntersectionObserver for hero visibility
    const heroSection = heroCanvas.closest('#hero') || heroCanvas.parentElement;
    if (heroSection) {
      const heroObs = new IntersectionObserver(
        (entries) => { heroVisible = entries[0].isIntersecting; },
        { threshold: 0.01 }
      );
      heroObs.observe(heroSection);
    }

    // Resize handler
    window.addEventListener('resize', debounce(() => {
      const { width: w, height: h } = resizeCanvas();
      particles.forEach(p => { p.w = w; p.h = h; });
    }, 200));

    // Connection line settings
    const CONNECTION_DIST = 100;
    const CONNECTION_DIST_SQ = CONNECTION_DIST * CONNECTION_DIST;

    function animateParticles(time) {
      heroAnimId = requestAnimationFrame(animateParticles);
      if (!heroVisible) return;

      const t = time * 0.001;
      const w = heroCanvas.width / (window.devicePixelRatio || 1);
      const h = heroCanvas.height / (window.devicePixelRatio || 1);

      // Normalized mouse position relative to canvas center (-1 to 1)
      const rect = heroCanvas.getBoundingClientRect();
      const mouseNormX = ((mouse.x - rect.left) / rect.width - 0.5) * 2;
      const mouseNormY = ((mouse.y - rect.top) / rect.height - 0.5) * 2;

      heroCtx.clearRect(0, 0, w, h);

      // Update and draw particles
      for (let i = 0; i < particles.length; i++) {
        particles[i].update(t, mouseNormX, mouseNormY);
        particles[i].draw(heroCtx);
      }

      // Draw connections
      heroCtx.lineWidth = 0.5;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distSq = dx * dx + dy * dy;
          if (distSq < CONNECTION_DIST_SQ) {
            const dist = Math.sqrt(distSq);
            const opacity = (1 - dist / CONNECTION_DIST) * 0.08;
            heroCtx.beginPath();
            heroCtx.moveTo(particles[i].x, particles[i].y);
            heroCtx.lineTo(particles[j].x, particles[j].y);
            heroCtx.strokeStyle = `rgba(0, 229, 255, ${opacity})`;
            heroCtx.stroke();
          }
        }
      }
    }

    requestAnimationFrame(animateParticles);
  }


  // ═══════════════════════════════════════════════════════════════
  //  4. NAVIGATION SCROLL BEHAVIOR
  // ═══════════════════════════════════════════════════════════════
  const mainNav = document.getElementById('main-nav');

  function initNavScroll() {
    if (!mainNav) return;

    const updateNav = () => {
      if (window.scrollY > 50) {
        mainNav.classList.add('nav-scrolled');
      } else {
        mainNav.classList.remove('nav-scrolled');
      }
    };

    window.addEventListener('scroll', updateNav, { passive: true });
    updateNav(); // initial check
  }


  // ═══════════════════════════════════════════════════════════════
  //  5. SCROLL REVEAL (IntersectionObserver)
  // ═══════════════════════════════════════════════════════════════
  function initScrollReveal() {
    const revealEls = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
    if (!revealEls.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target); // one-time reveal
          }
        });
      },
      { threshold: 0.15, rootMargin: '-50px' }
    );

    revealEls.forEach(el => observer.observe(el));
  }


  // ═══════════════════════════════════════════════════════════════
  //  6. TERMINAL TYPING ANIMATION
  // ═══════════════════════════════════════════════════════════════
  function initTerminalTyping() {
    const terminalText = document.querySelector('.hero-terminal .terminal-text');
    if (!terminalText) return;

    const fullText = terminalText.textContent || terminalText.innerText;
    terminalText.textContent = '';
    terminalText.style.visibility = 'visible';

    let charIndex = 0;
    const TYPING_SPEED = 60; // ms per character

    function typeChar() {
      if (charIndex < fullText.length) {
        terminalText.textContent += fullText.charAt(charIndex);
        charIndex++;
        setTimeout(typeChar, TYPING_SPEED);
      } else {
        // Add blinking cursor
        const cursorSpan = document.createElement('span');
        cursorSpan.className = 'terminal-cursor';
        cursorSpan.textContent = '▌';
        cursorSpan.style.cssText = `
          animation: blink-cursor 1s step-end infinite;
          color: #00e5ff;
          margin-left: 2px;
        `;
        terminalText.appendChild(cursorSpan);

        // Inject blink keyframes if not already present
        if (!document.getElementById('terminal-cursor-style')) {
          const style = document.createElement('style');
          style.id = 'terminal-cursor-style';
          style.textContent = `
            @keyframes blink-cursor {
              0%, 100% { opacity: 1; }
              50% { opacity: 0; }
            }
          `;
          document.head.appendChild(style);
        }
      }
    }

    // Small delay before starting to type
    setTimeout(typeChar, 300);
  }


  // ═══════════════════════════════════════════════════════════════
  //  7. STAT COUNTER ANIMATION
  // ═══════════════════════════════════════════════════════════════
  function initStatCounters() {
    const statNumbers = document.querySelectorAll('.stat-number');
    if (!statNumbers.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );

    statNumbers.forEach(el => observer.observe(el));
  }

  function animateCounter(el) {
    const target = parseInt(el.getAttribute('data-target'), 10) || 0;
    const duration = 2000; // 2 seconds
    const startTime = performance.now();

    function easeOut(t) {
      return 1 - Math.pow(1 - t, 3); // cubic ease-out
    }

    function update(now) {
      const elapsed = now - startTime;
      const progress = clamp(elapsed / duration, 0, 1);
      const easedProgress = easeOut(progress);
      const current = Math.round(easedProgress * target);

      el.textContent = current;

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        el.textContent = target; // ensure final value is exact
      }
    }

    requestAnimationFrame(update);
  }


  // ═══════════════════════════════════════════════════════════════
  //  8. SMOOTH SCROLL FOR NAVIGATION LINKS
  // ═══════════════════════════════════════════════════════════════
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(link => {
      link.addEventListener('click', (e) => {
        const targetId = link.getAttribute('href');
        if (targetId === '#' || targetId.length < 2) return;

        const targetEl = document.querySelector(targetId);
        if (!targetEl) return;

        e.preventDefault();

        const navHeight = mainNav ? mainNav.offsetHeight : 0;
        const targetPos = targetEl.getBoundingClientRect().top + window.scrollY - navHeight;

        window.scrollTo({
          top: targetPos,
          behavior: 'smooth'
        });
      });
    });
  }


  // ═══════════════════════════════════════════════════════════════
  //  9. PROJECT CARD TILT EFFECT
  // ═══════════════════════════════════════════════════════════════
  function initCardTilt() {
    const cards = document.querySelectorAll('.project-card');
    if (!cards.length) return;

    cards.forEach(card => {
      // Ensure perspective is set
      card.style.perspective = '800px';
      card.style.transformStyle = 'preserve-3d';

      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        // Normalized position from center (-1 to 1)
        const normX = (e.clientX - centerX) / (rect.width / 2);
        const normY = (e.clientY - centerY) / (rect.height / 2);

        // Tilt (max 5 degrees)
        const rotateY = normX * 5;
        const rotateX = -normY * 5;

        card.style.transition = 'transform 0.1s ease-out';
        card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;

        // Radial gradient highlight following cursor
        const gradX = ((e.clientX - rect.left) / rect.width) * 100;
        const gradY = ((e.clientY - rect.top) / rect.height) * 100;
        card.style.backgroundImage =
          `radial-gradient(circle at ${gradX}% ${gradY}%, rgba(0,229,255,0.08) 0%, transparent 60%)`;
      });

      card.addEventListener('mouseleave', () => {
        card.style.transition = 'transform 0.5s cubic-bezier(0.23, 1, 0.32, 1)';
        card.style.transform = 'rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
        card.style.backgroundImage = 'none';
      });
    });
  }


  // ═══════════════════════════════════════════════════════════════
  //  10. ACTIVE SECTION DETECTION
  // ═══════════════════════════════════════════════════════════════
  function initActiveSectionDetection() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('#main-nav a[href^="#"]');
    if (!sections.length || !navLinks.length) return;

    // Build threshold array for fine-grained detection
    const thresholds = [];
    for (let i = 0; i <= 1.0; i += 0.1) {
      thresholds.push(i);
    }

    // Track visibility ratios
    const visibilityMap = new Map();

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          visibilityMap.set(entry.target.id, entry.intersectionRatio);
        });

        // Find the section with highest visibility
        let maxRatio = 0;
        let activeId = '';
        visibilityMap.forEach((ratio, id) => {
          if (ratio > maxRatio) {
            maxRatio = ratio;
            activeId = id;
          }
        });

        // Update nav link highlights
        navLinks.forEach(link => {
          const href = link.getAttribute('href');
          if (href === `#${activeId}`) {
            link.classList.add('active');
          } else {
            link.classList.remove('active');
          }
        });
      },
      { threshold: thresholds }
    );

    sections.forEach(section => observer.observe(section));
  }


  // ═══════════════════════════════════════════════════════════════
  //  INITIALIZATION
  // ═══════════════════════════════════════════════════════════════
  initLoader();
  initCursor();
  initHeroParticles();
  initNavScroll();
  initScrollReveal();
  initStatCounters();
  initSmoothScroll();
  initCardTilt();
  initActiveSectionDetection();
  initExpandableCards();


  // ═══════════════════════════════════════════════════════════════
  //  EXPANDABLE CARDS LOGIC
  // ═══════════════════════════════════════════════════════════════
  function initExpandableCards() {
    const headers = document.querySelectorAll('.stat-header');
    headers.forEach(header => {
      header.addEventListener('click', () => {
        const card = header.closest('.expandable-card');
        card.classList.toggle('expanded');
      });
    });
  }

  // ═══════════════════════════════════════════════════════════════
  //  CLEANUP ON PAGE UNLOAD
  // ═══════════════════════════════════════════════════════════════
  window.addEventListener('beforeunload', () => {
    if (heroAnimId) cancelAnimationFrame(heroAnimId);
  });

});
