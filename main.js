/* ============================================================
   MERIDIAN CAPITAL PARTNERS — main.js
   ============================================================ */

'use strict';

/* ---- Nav: scroll class + mobile toggle ---- */
(function initNav() {
  const header = document.getElementById('nav-header');
  const toggle = document.querySelector('.nav-mobile-toggle');
  const mobileMenu = document.getElementById('mobile-menu');

  // Add scrolled class
  const onScroll = () => {
    header.classList.toggle('scrolled', window.scrollY > 40);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Mobile toggle
  toggle.addEventListener('click', () => {
    const expanded = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!expanded));
    mobileMenu.classList.toggle('open', !expanded);
  });

  // Close mobile menu on nav link click
  mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      toggle.setAttribute('aria-expanded', 'false');
      mobileMenu.classList.remove('open');
    });
  });
})();


/* ---- Smooth scroll for all anchor links ---- */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 72;
    const top = target.getBoundingClientRect().top + window.scrollY - navH;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});


/* ---- Intersection Observer: fade-up + perf bar ---- */
(function initAnimations() {
  const fadeEls = document.querySelectorAll('.fade-up');
  const perfCards = document.querySelectorAll('.perf-card');

  // Stagger children within containers
  const staggerParents = document.querySelectorAll(
    '.strategy-grid, .perf-grid, .team-grid, .hero-stats, .about-pillars'
  );
  staggerParents.forEach(parent => {
    Array.from(parent.querySelectorAll('.fade-up')).forEach((el, i) => {
      el.style.transitionDelay = `${i * 0.1}s`;
    });
  });

  const fadeObserver = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          fadeObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  fadeEls.forEach(el => fadeObserver.observe(el));

  // Perf bar animation when card is visible
  const perfObserver = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          perfObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.3 }
  );

  perfCards.forEach(card => perfObserver.observe(card));
})();


/* ---- Counter animation for hero stats ---- */
(function initCounters() {
  const statsSection = document.querySelector('.hero-stats');
  if (!statsSection) return;

  const statEls = statsSection.querySelectorAll('.stat-value');
  let animated = false;

  const parseValue = text => {
    const num = parseFloat(text.replace(/[^0-9.]/g, ''));
    const prefix = text.match(/^\D*/)?.[0]?.trim() || '';
    const suffix = text.replace(/^[\D]*[\d.]+/, '');
    return { num, prefix, suffix };
  };

  const animateCounter = (el, duration = 1800) => {
    const { num, prefix, suffix } = parseValue(el.textContent);
    const isDecimal = suffix.includes('%');
    const decimals = isDecimal ? 1 : (num % 1 !== 0 ? 1 : 0);
    const start = performance.now();

    const step = now => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      const current = num * eased;
      el.textContent = prefix + current.toFixed(decimals) + suffix;
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  const observer = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting && !animated) {
      animated = true;
      statEls.forEach((el, i) => {
        setTimeout(() => animateCounter(el), i * 120);
      });
      observer.disconnect();
    }
  }, { threshold: 0.5 });

  observer.observe(statsSection);
})();


/* ---- Contact form ---- */
(function initContactForm() {
  const form = document.getElementById('contact-form');
  const successEl = document.getElementById('form-success');
  if (!form) return;

  form.addEventListener('submit', e => {
    e.preventDefault();

    // Basic validation
    let valid = true;
    form.querySelectorAll('[required]').forEach(field => {
      field.style.borderColor = '';
      if (!field.value.trim() || (field.type === 'checkbox' && !field.checked)) {
        field.style.borderColor = 'rgba(220, 80, 80, 0.6)';
        valid = false;
      }
    });

    if (!valid) {
      successEl.textContent = 'Please complete all required fields.';
      successEl.style.color = 'rgba(220,80,80,0.9)';
      return;
    }

    const submitBtn = form.querySelector('[type="submit"]');
    submitBtn.textContent = 'Submitting…';
    submitBtn.disabled = true;

    fetch('https://formspree.io/f/xdalrqjb', {
      method: 'POST',
      body: new FormData(form),
      headers: { Accept: 'application/json' }
    })
    .then(res => {
      if (res.ok) {
        form.reset();
        successEl.style.color = 'var(--gold)';
        successEl.textContent = 'Thank you. A member of our investor relations team will be in touch within two business days.';
        setTimeout(() => { successEl.textContent = ''; }, 8000);
      } else {
        successEl.style.color = 'rgba(220,80,80,0.9)';
        successEl.textContent = 'Something went wrong. Please try again or email us directly.';
      }
    })
    .catch(() => {
      successEl.style.color = 'rgba(220,80,80,0.9)';
      successEl.textContent = 'Something went wrong. Please try again or email us directly.';
    })
    .finally(() => {
      submitBtn.textContent = 'Submit Inquiry';
      submitBtn.disabled = false;
    });
  });

  // Clear error highlight on input
  form.querySelectorAll('input, select, textarea').forEach(field => {
    field.addEventListener('input', () => { field.style.borderColor = ''; });
  });
})();
