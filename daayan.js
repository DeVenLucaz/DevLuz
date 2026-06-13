'use strict';

/**
 * DAAYAN बंधन — Interactive Book Experience
 * Handles: version toggle, reading progress, chapter nav,
 *          atmospheric particles, keyboard shortcuts, page animations.
 */

document.addEventListener('DOMContentLoaded', () => {

  // ═══════════════════════════════════════════════
  //  REFERENCES
  // ═══════════════════════════════════════════════

  const body = document.body;
  const toggle = document.getElementById('version-toggle');
  const labelMyth = document.getElementById('label-myth');
  const labelRealistic = document.getElementById('label-realistic');
  const mythContent = document.getElementById('myth-content');
  const realisticContent = document.getElementById('realistic-content');
  const progressBar = document.getElementById('reading-progress');
  const readingPercent = document.getElementById('reading-percent');
  const chapterNav = document.getElementById('chapter-nav');
  const particlesContainer = document.getElementById('particles-container');
  const versionHint = document.getElementById('cover-version-hint');
  const bookCover = document.getElementById('book-cover');

  let currentVersion = 'myth';
  let isToggling = false;
  let particles = [];
  let ticking = false;

  // ═══════════════════════════════════════════════
  //  1. VERSION TOGGLE
  // ═══════════════════════════════════════════════

  function setVersion(version) {
    if (isToggling || version === currentVersion) return;
    isToggling = true;
    currentVersion = version;

    // Update body attribute (triggers CSS theme transition)
    body.setAttribute('data-version', version);

    // Update toggle labels
    labelMyth.classList.toggle('active', version === 'myth');
    labelRealistic.classList.toggle('active', version === 'realistic');

    // Update ARIA
    toggle.setAttribute('aria-checked', version === 'realistic' ? 'true' : 'false');

    // Update version hint text
    if (versionHint) {
      versionHint.textContent = version === 'myth'
        ? 'Currently Reading: Myth Version'
        : 'Currently Reading: Realistic Version';
    }

    // Fade out current content
    const outgoing = version === 'myth' ? realisticContent : mythContent;
    const incoming = version === 'myth' ? mythContent : realisticContent;

    outgoing.classList.add('fade-out');

    setTimeout(() => {
      outgoing.style.display = 'none';
      outgoing.classList.remove('fade-out');

      incoming.style.display = 'block';
      incoming.classList.add('fade-out');

      // Force reflow
      void incoming.offsetHeight;

      incoming.classList.remove('fade-out');
      incoming.classList.add('fade-in');

      // Rebuild chapter nav for new content
      buildChapterNav();

      // Handle particles
      if (version === 'myth') {
        createParticles();
        particlesContainer.style.opacity = '1';
      } else {
        destroyParticles();
        particlesContainer.style.opacity = '0';
      }

      // Scroll to top of content area smoothly
      window.scrollTo({ top: bookCover.offsetHeight - 60, behavior: 'smooth' });

      setTimeout(() => {
        incoming.classList.remove('fade-in');
        isToggling = false;
      }, 450);
    }, 400);
  }

  // Click handler for toggle switch
  toggle.addEventListener('click', () => {
    setVersion(currentVersion === 'myth' ? 'realistic' : 'myth');
  });

  // Keyboard handler for toggle (Enter/Space)
  toggle.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setVersion(currentVersion === 'myth' ? 'realistic' : 'myth');
    }
  });

  // Click on labels
  labelMyth.addEventListener('click', () => setVersion('myth'));
  labelRealistic.addEventListener('click', () => setVersion('realistic'));

  // ═══════════════════════════════════════════════
  //  2. READING PROGRESS BAR
  // ═══════════════════════════════════════════════

  function updateProgress() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const percent = docHeight > 0 ? Math.min(Math.round((scrollTop / docHeight) * 100), 100) : 0;

    progressBar.style.width = percent + '%';
    if (readingPercent) {
      readingPercent.textContent = percent + '%';
    }
  }

  // ═══════════════════════════════════════════════
  //  3. CHAPTER NAVIGATION
  // ═══════════════════════════════════════════════

  let chapterElements = [];

  function buildChapterNav() {
    // Clear existing
    chapterNav.innerHTML = '';
    chapterElements = [];

    // Get visible content
    const activeContent = currentVersion === 'myth' ? mythContent : realisticContent;
    const headings = activeContent.querySelectorAll('.chapter-heading, .section-label');

    headings.forEach((heading, index) => {
      const dot = document.createElement('div');
      dot.className = 'chapter-nav-dot';
      dot.setAttribute('data-index', index);

      const label = document.createElement('span');
      label.className = 'dot-label';
      label.textContent = heading.textContent;
      dot.appendChild(label);

      dot.addEventListener('click', () => {
        const section = heading.closest('.book-section');
        if (section) {
          const offsetTop = section.offsetTop - 70; // account for fixed nav
          window.scrollTo({ top: offsetTop, behavior: 'smooth' });
        }
      });

      chapterNav.appendChild(dot);
      chapterElements.push({ dot, heading });
    });
  }

  function updateActiveChapter() {
    const scrollPos = window.scrollY + 200; // offset for early activation

    let activeIndex = -1;
    chapterElements.forEach((item, index) => {
      const section = item.heading.closest('.book-section');
      if (section && section.offsetTop <= scrollPos) {
        activeIndex = index;
      }
    });

    chapterElements.forEach((item, index) => {
      item.dot.classList.toggle('active', index === activeIndex);
    });
  }

  // Show/hide chapter nav based on scroll position
  function updateChapterNavVisibility() {
    const scrollPos = window.scrollY;
    const coverHeight = bookCover ? bookCover.offsetHeight : window.innerHeight;

    if (scrollPos > coverHeight * 0.6) {
      chapterNav.classList.add('visible');
    } else {
      chapterNav.classList.remove('visible');
    }
  }

  // ═══════════════════════════════════════════════
  //  UNIFIED SCROLL HANDLER (throttled via rAF)
  // ═══════════════════════════════════════════════

  function onScroll() {
    if (!ticking) {
      requestAnimationFrame(() => {
        updateProgress();
        updateActiveChapter();
        updateChapterNavVisibility();
        ticking = false;
      });
      ticking = true;
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });

  // ═══════════════════════════════════════════════
  //  5. ATMOSPHERIC PARTICLES (Myth Version)
  // ═══════════════════════════════════════════════

  function createParticles() {
    destroyParticles(); // clean slate

    const count = 25;
    for (let i = 0; i < count; i++) {
      const p = document.createElement('div');
      p.className = 'particle';

      const size = Math.random() * 2 + 1;
      const left = Math.random() * 100;
      const delay = Math.random() * 15;
      const duration = Math.random() * 15 + 12;
      const drift = (Math.random() - 0.5) * 60;

      p.style.cssText = `
        width: ${size}px;
        height: ${size}px;
        left: ${left}%;
        bottom: -10px;
        animation-duration: ${duration}s;
        animation-delay: ${delay}s;
        --drift: ${drift}px;
      `;

      // Override animation to include horizontal drift
      p.style.animationName = 'particleFloat';

      particlesContainer.appendChild(p);
      particles.push(p);
    }
  }

  function destroyParticles() {
    particles.forEach(p => p.remove());
    particles = [];
  }

  // ═══════════════════════════════════════════════
  //  6. SMOOTH SCROLL FOR INTERNAL LINKS
  // ═══════════════════════════════════════════════

  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        const offsetTop = target.offsetTop - 70;
        window.scrollTo({ top: offsetTop, behavior: 'smooth' });
      }
    });
  });

  // ═══════════════════════════════════════════════
  //  7. PAGE ENTER ANIMATION
  // ═══════════════════════════════════════════════

  function playEnterAnimation() {
    const elements = [
      { el: document.getElementById('cover-title'), delay: 200 },
      { el: document.getElementById('cover-subtitle'), delay: 500 },
      { el: document.getElementById('cover-english'), delay: 750 },
      { el: document.getElementById('cover-ornament'), delay: 1000 },
      { el: document.getElementById('cover-author'), delay: 1200 },
      { el: document.getElementById('cover-version-hint'), delay: 1500 },
    ];

    elements.forEach(({ el, delay }) => {
      if (!el) return;
      setTimeout(() => {
        el.classList.add('animate-in');
      }, delay);
    });

    // Scroll hint appears after everything else
    const scrollHint = document.getElementById('scroll-hint');
    if (scrollHint) {
      setTimeout(() => {
        scrollHint.style.opacity = '1';
      }, 2000);
    }
  }

  // ═══════════════════════════════════════════════
  //  8. KEYBOARD NAVIGATION
  // ═══════════════════════════════════════════════

  document.addEventListener('keydown', (e) => {
    // Escape → back to portfolio
    if (e.key === 'Escape') {
      window.location.href = 'index.html';
      return;
    }

    // Left/Right arrows → navigate chapters
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      e.preventDefault();
      navigateChapter(e.key === 'ArrowRight' ? 1 : -1);
    }
  });

  function navigateChapter(direction) {
    if (chapterElements.length === 0) return;

    const scrollPos = window.scrollY + 200;
    let currentIndex = -1;

    chapterElements.forEach((item, index) => {
      const section = item.heading.closest('.book-section');
      if (section && section.offsetTop <= scrollPos) {
        currentIndex = index;
      }
    });

    let targetIndex = currentIndex + direction;
    targetIndex = Math.max(0, Math.min(targetIndex, chapterElements.length - 1));

    const targetSection = chapterElements[targetIndex].heading.closest('.book-section');
    if (targetSection) {
      window.scrollTo({
        top: targetSection.offsetTop - 70,
        behavior: 'smooth'
      });
    }
  }

  // ═══════════════════════════════════════════════
  //  INITIALIZATION
  // ═══════════════════════════════════════════════

  // Build chapter nav for initial version
  buildChapterNav();

  // Initial progress update
  updateProgress();

  // Create particles for myth version
  createParticles();
  particlesContainer.style.opacity = '1';

  // Play entrance animation
  playEnterAnimation();

  // Initial chapter nav visibility check
  updateChapterNavVisibility();

});
