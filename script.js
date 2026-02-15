/**
 * Omnæs Dæmones — script.js
 * Handles: header scroll behavior, mobile menu, form validation,
 * scroll reveal animations, language selector sync
 */

console.log("Omnæs Dæmones website loaded successfully!");

// ============================================================
// UTILITY
// ============================================================
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

// ============================================================
// HEADER — scroll behavior (adds .scrolled class)
// ============================================================
(function initScrollHeader() {
  const header = $('#site-header');
  if (!header) return;

  const onScroll = () => {
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // run on load in case page is pre-scrolled
})();


// ============================================================
// MOBILE MENU — toggle open/close
// ============================================================
(function initMobileMenu() {
  const btn = $('#mobile-menu-btn');
  const nav = $('#mobile-nav');
  if (!btn || !nav) return;

  const open = () => {
    btn.classList.add('open');
    btn.setAttribute('aria-expanded', 'true');
    btn.setAttribute('aria-label', 'Close navigation menu');
    nav.classList.add('open');
    nav.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden'; // prevent background scroll
  };

  const close = () => {
    btn.classList.remove('open');
    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('aria-label', 'Open navigation menu');
    nav.classList.remove('open');
    nav.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };

  btn.addEventListener('click', () => {
    const isOpen = btn.classList.contains('open');
    isOpen ? close() : open();
  });

  // Close on nav link click
  $$('a', nav).forEach(link => {
    link.addEventListener('click', close);
  });

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && btn.classList.contains('open')) {
      close();
      btn.focus();
    }
  });

  // Close when clicking outside
  document.addEventListener('click', (e) => {
    if (btn.classList.contains('open') &&
        !nav.contains(e.target) &&
        !btn.contains(e.target)) {
      close();
    }
  });
})();


// ============================================================
// LANGUAGE SELECTOR SYNC (desktop <-> mobile)
// ============================================================
(function initLangSync() {
  const desktop = $('#lang-desktop');
  const mobile  = $('#lang-mobile');
  if (!desktop || !mobile) return;

  desktop.addEventListener('change', () => { mobile.value = desktop.value; });
  mobile.addEventListener('change',  () => { desktop.value = mobile.value; });
})();


// ============================================================
// SCROLL REVEAL — animate elements into view
// ============================================================
(function initReveal() {
  const targets = $$('[data-reveal]');
  if (!targets.length) return;

  // Initial state is set in CSS via opacity:0 / translateX
  // Hero elements get revealed on DOMContentLoaded
  const heroLeft  = $('.hero-logo-art');
  const heroRight = $('.hero-content');
  if (heroLeft)  setTimeout(() => heroLeft.classList.add('revealed'),  200);
  if (heroRight) setTimeout(() => heroRight.classList.add('revealed'), 400);

  // Remaining elements revealed on scroll
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  // Feature cards — staggered reveal
  $$('.feature-card').forEach((card, i) => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(24px)';
    card.style.transition = `opacity 0.6s ease ${i * 0.1}s, transform 0.6s ease ${i * 0.1}s`;
    observer.observe(card);
  });

  // Resource items
  $$('.resource-link').forEach((item, i) => {
    item.style.opacity = '0';
    item.style.transform = 'translateX(-16px)';
    item.style.transition = `opacity 0.5s ease ${i * 0.1}s, transform 0.5s ease ${i * 0.1}s`;
    observer.observe(item.parentElement);
  });
})();

// Helper to add .revealed to any element on scroll
function revealOnScroll(selector, dir = 'up') {
  const els = $$(selector);
  if (!els.length) return;
  const map = { up: 'translateY(24px)', left: 'translateX(-24px)', right: 'translateX(24px)' };
  els.forEach((el, i) => {
    el.style.opacity = '0';
    el.style.transform = map[dir] || map.up;
    el.style.transition = `opacity 0.65s ease ${i * 0.08}s, transform 0.65s ease ${i * 0.08}s`;
  });
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.style.opacity = '1';
        e.target.style.transform = 'none';
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.1 });
  els.forEach(el => obs.observe(el));
}

document.addEventListener('DOMContentLoaded', () => {
  revealOnScroll('.stat-list li', 'up');
  revealOnScroll('.news-card', 'up');
  revealOnScroll('.media-item', 'up');
  revealOnScroll('.faq-item', 'up');
  revealOnScroll('.class-card', 'up');
  revealOnScroll('.social-card', 'up');
});


// ============================================================
// FORM VALIDATION — newsletter form
// Shows errors BEFORE submit; displays success state
// ============================================================
(function initFormValidation() {
  const form = $('#newsletter-form');
  if (!form) return;

  const nameInput    = $('#nl-name',    form) || $('#newsletter-name', form);
  const emailInput   = $('#nl-email',   form) || $('#newsletter-email', form);
  const consentBox   = $('#nl-consent', form) || $('#newsletter-consent', form);
  const successMsg   = $('#form-success');

  // Helper: set error message
  function setError(inputEl, errorId, message) {
    const errorEl = document.getElementById(errorId);
    if (!errorEl) return;
    if (inputEl) inputEl.classList.toggle('error', !!message);
    errorEl.textContent = message || '';
  }

  // Helper: validate email format
  function isValidEmail(val) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());
  }

  // Real-time validation on blur
  if (emailInput) {
    emailInput.addEventListener('blur', () => {
      const val = emailInput.value.trim();
      const errorId = emailInput.getAttribute('aria-describedby') || 'nl-email-error';
      if (!val) {
        setError(emailInput, errorId, 'Email address is required.');
      } else if (!isValidEmail(val)) {
        setError(emailInput, errorId, 'Please enter a valid email address.');
      } else {
        setError(emailInput, errorId, '');
      }
    });

    emailInput.addEventListener('input', () => {
      if (emailInput.classList.contains('error') && isValidEmail(emailInput.value.trim())) {
        const errorId = emailInput.getAttribute('aria-describedby') || 'nl-email-error';
        setError(emailInput, errorId, '');
      }
    });
  }

  // Submit handler
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let hasErrors = false;

    // Validate email (required)
    if (emailInput) {
      const val = emailInput.value.trim();
      const errorId = emailInput.getAttribute('aria-describedby') || 'nl-email-error';
      if (!val) {
        setError(emailInput, errorId, 'Email address is required.');
        hasErrors = true;
      } else if (!isValidEmail(val)) {
        setError(emailInput, errorId, 'Please enter a valid email address.');
        hasErrors = true;
      } else {
        setError(emailInput, errorId, '');
      }
    }

    // Validate consent (required)
    if (consentBox && !consentBox.checked) {
      const errorId = consentBox.getAttribute('aria-describedby') || 'nl-consent-error';
      setError(consentBox, errorId, 'You must agree to receive emails to continue.');
      hasErrors = true;
    } else if (consentBox) {
      const errorId = consentBox.getAttribute('aria-describedby') || 'nl-consent-error';
      setError(consentBox, errorId, '');
    }

    if (hasErrors) {
      // Focus first error field
      const firstErr = form.querySelector('.error');
      if (firstErr) firstErr.focus();
      return;
    }

    // Success state
    form.style.display = 'none';
    if (successMsg) {
      successMsg.removeAttribute('hidden');
      successMsg.focus();
    }

    console.log('Form submitted:', {
      name:     nameInput ? nameInput.value.trim() : '',
      email:    emailInput ? emailInput.value.trim() : '',
      consent:  consentBox ? consentBox.checked : false,
    });
  });
})();


// ============================================================
// ACTIVE NAV LINK — highlight current page
// ============================================================
(function setActiveNav() {
  const path = window.location.pathname.split('/').pop() || 'index.html';
  $$('.nav-link, .mobile-nav a').forEach(link => {
    const href = link.getAttribute('href') || '';
    if (href === path || (path === '' && href === 'index.html')) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
})();


// ============================================================
// FAQ ACCORDION (for faq.html)
// ============================================================
(function initFAQ() {
  $$('.faq-item').forEach(item => {
    const btn = item.querySelector('.faq-question');
    const ans = item.querySelector('.faq-answer');
    if (!btn || !ans) return;

    btn.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');

      // Close all
      $$('.faq-item.open').forEach(openItem => {
        openItem.classList.remove('open');
        openItem.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
        const a = openItem.querySelector('.faq-answer');
        if (a) { a.style.maxHeight = '0'; a.style.padding = '0 1.5rem'; }
      });

      if (!isOpen) {
        item.classList.add('open');
        btn.setAttribute('aria-expanded', 'true');
        ans.style.maxHeight = ans.scrollHeight + 'px';
        ans.style.padding = '1.2rem 1.5rem';
      }
    });
  });
})();


// ============================================================
// SMOOTH SCROLL for anchor links
// ============================================================
(function initSmoothScroll() {
  $$('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const id = link.getAttribute('href').slice(1);
      const target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      const offset = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-h') || '76');
      const top = target.getBoundingClientRect().top + window.scrollY - offset - 16;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
})();
