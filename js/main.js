/* ================================================================
   YO JOBS - Main JavaScript
   Structure: js/main.js
   ================================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ==============================================================
     1. DARK MODE TOGGLE
     Persists preference in localStorage
  ============================================================== */
  const html              = document.documentElement;
  const themeToggle       = document.getElementById('theme-toggle');
  const themeToggleMobile = document.getElementById('theme-toggle-mobile');
  const themeIcon         = document.getElementById('theme-icon');
  const themeIconMobile   = document.getElementById('theme-icon-mobile');

  function setIconMoon() {
    if (themeIcon)       themeIcon.className       = 'fa-solid fa-moon text-sm';
    if (themeIconMobile) themeIconMobile.className = 'fa-solid fa-moon text-sm';
  }

  function setIconSun() {
    if (themeIcon)       themeIcon.className       = 'fa-solid fa-sun text-sm';
    if (themeIconMobile) themeIconMobile.className = 'fa-solid fa-sun text-sm';
  }

  function applyTheme(theme) {
    if (theme === 'dark') {
      html.classList.add('dark');
      setIconMoon();
    } else {
      html.classList.remove('dark');
      setIconSun();
    }
    localStorage.setItem('yo-jobs-theme', theme);
  }

  function toggleTheme() {
    const isDark = html.classList.contains('dark');
    applyTheme(isDark ? 'light' : 'dark');
  }

  // Load saved theme on page load
  const savedTheme = localStorage.getItem('yo-jobs-theme') || 'light';
  applyTheme(savedTheme);

  if (themeToggle)       themeToggle.addEventListener('click', toggleTheme);
  if (themeToggleMobile) themeToggleMobile.addEventListener('click', toggleTheme);


  /* ==============================================================
     2. MOBILE HAMBURGER MENU
  ============================================================== */
  const hamburger  = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobile-menu');

  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      mobileMenu.classList.toggle('open');
    });
  }

  // Exposed globally so inline onclick on mobile links can call it
  window.closeMobileMenu = function () {
    if (mobileMenu) mobileMenu.classList.remove('open');
  };


  /* ==============================================================
     3. NAVBAR SCROLL SHADOW
  ============================================================== */
  const navbar = document.getElementById('navbar');
  if (navbar) {
    window.addEventListener('scroll', () => {
      navbar.classList.toggle('shadow-md', window.scrollY > 10);
    }, { passive: true });
  }


  /* ==============================================================
     4. SCROLL-TRIGGERED ANIMATIONS (IntersectionObserver)
     - threshold: 0 fires as soon as even 1px enters viewport
     - rootMargin: '0px 0px -40px 0px' gives a subtle reveal offset
       for elements below the fold, but does NOT block hero elements.
     - We also immediately mark any element already in the viewport
       (e.g. hero content) as visible before the observer even runs.
  ============================================================== */
  const animatedEls = document.querySelectorAll('.animate-on-scroll');
  if (animatedEls.length) {

    // Pass 1 — instantly reveal anything already in viewport on load
    animatedEls.forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom >= 0) {
        el.classList.add('visible');
      }
    });

    // Pass 2 — watch remaining elements as user scrolls
    const scrollObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          scrollObserver.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0,
      rootMargin: '0px 0px -40px 0px'
    });

    animatedEls.forEach(el => {
      if (!el.classList.contains('visible')) {
        scrollObserver.observe(el);
      }
    });
  }


  /* ==============================================================
     5. ANIMATED STAT COUNTERS
     Counts up from 0 to data-target when the stat bar scrolls in.
  ============================================================== */
  const statEls = document.querySelectorAll('.stat-number[data-target]');
  if (statEls.length) {
    const statObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el     = entry.target;
          const target = parseInt(el.dataset.target, 10);
          const suffix = target === 98 ? '%' : '+';
          let current  = 0;
          const step   = Math.ceil(target / 60);
          const timer  = setInterval(() => {
            current += step;
            if (current >= target) {
              current = target;
              clearInterval(timer);
            }
            el.textContent = current + suffix;
          }, 25);
          statObserver.unobserve(el);
        }
      });
    }, { threshold: 0, rootMargin: '0px 0px -20px 0px' });

    statEls.forEach(el => statObserver.observe(el));
  }


  /* ==============================================================
     6. BACK TO TOP BUTTON
  ============================================================== */
  const backToTop = document.getElementById('back-to-top');
  if (backToTop) {
    window.addEventListener('scroll', () => {
      const show = window.scrollY > 400;
      backToTop.classList.toggle('opacity-0',        !show);
      backToTop.classList.toggle('pointer-events-none', !show);
      backToTop.classList.toggle('opacity-100',       show);
    }, { passive: true });

    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }


  /* ==============================================================
     7. FOOTER — AUTO YEAR
  ============================================================== */
  const yearEl = document.getElementById('footer-year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();


  /* ==============================================================
     8. CONTACT FORM — FORMSPREE ASYNC SUBMIT
     Replace YOUR_FORMSPREE_ENDPOINT in index.html with your form ID.
     e.g.  https://formspree.io/f/xpzvwkqr
  ============================================================== */
  const contactForm = document.getElementById('contact-form');
  const submitBtn   = document.getElementById('submit-btn');
  const btnText     = document.getElementById('btn-text');
  const btnIcon     = document.getElementById('btn-icon');
  const formSuccess = document.getElementById('form-success');
  const formError   = document.getElementById('form-error');

  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      // Loading state
      submitBtn.disabled    = true;
      btnText.textContent   = 'Sending...';
      btnIcon.className     = 'fa-solid fa-spinner fa-spin';
      formSuccess.classList.add('hidden');
      formError.classList.add('hidden');

      try {
        const response = await fetch(contactForm.action, {
          method:  'POST',
          body:    new FormData(contactForm),
          headers: { 'Accept': 'application/json' },
        });

        if (response.ok) {
          formSuccess.classList.remove('hidden');
          contactForm.reset();
        } else {
          formError.classList.remove('hidden');
        }
      } catch (_err) {
        formError.classList.remove('hidden');
      } finally {
        submitBtn.disabled  = false;
        btnText.textContent = 'Send Message';
        btnIcon.className   = 'fa-solid fa-paper-plane';
      }
    });
  }


  /* ==============================================================
     9. SCROLLSPY — ACTIVE NAV LINK HIGHLIGHT
     Adds text-primary-600 to whichever nav link matches the
     current section in viewport.
  ============================================================== */
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  if (sections.length && navLinks.length) {
    window.addEventListener('scroll', () => {
      let current = '';
      sections.forEach(section => {
        if (window.scrollY >= section.offsetTop - 100) current = section.id;
      });

      navLinks.forEach(link => {
        link.classList.remove('text-primary-600', 'dark:text-primary-400');
        if (link.getAttribute('href') === '#' + current) {
          link.classList.add('text-primary-600', 'dark:text-primary-400');
        }
      });
    }, { passive: true });
  }


  /* ==============================================================
     10. CLIENT TICKER — DUPLICATE SLIDES FOR SEAMLESS LOOP
     The HTML has one set of .client-logo-card items.
     We clone them so the CSS animation loops without a jump.
  ============================================================== */
  const track = document.querySelector('.clients-track');
  if (track) {
    const original = Array.from(track.children);
    // Clone the full set once — CSS animation runs translateX(-50%)
    original.forEach(card => {
      const clone = card.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      track.appendChild(clone);
    });
  }

}); // end DOMContentLoaded