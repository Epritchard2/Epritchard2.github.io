/**
 * Omnæs Dæmones — script.js
 */

console.log("Omnæs Dæmones website loaded successfully!");


// ============================================================
// UTILITY
// ============================================================
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

// ============================================================
// HEADER — scroll behavior
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
  onScroll();
})();


// ============================================================
// MOBILE MENU
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
    document.body.style.overflow = 'hidden';
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
    btn.classList.contains('open') ? close() : open();
  });

  $$('a', nav).forEach(link => link.addEventListener('click', close));

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && btn.classList.contains('open')) {
      close();
      btn.focus();
    }
  });

  document.addEventListener('click', (e) => {
    if (btn.classList.contains('open') &&
        !nav.contains(e.target) &&
        !btn.contains(e.target)) {
      close();
    }
  });
})();


// ============================================================
// LANGUAGE SELECTOR SYNC
// ============================================================
(function initLangSync() {
  const desktop = $('#lang-desktop');
  const mobile  = $('#lang-mobile');
  if (!desktop || !mobile) return;
  desktop.addEventListener('change', () => { mobile.value = desktop.value; });
  mobile.addEventListener('change',  () => { desktop.value = mobile.value; });
})();


// ============================================================
// HERO REVEAL
// ============================================================
(function initHeroReveal() {
  const heroRight = $('.hero-content');
  if (heroRight) setTimeout(() => heroRight.classList.add('revealed'), 200);
})();


// ============================================================
// FEATURE CARDS — staggered scroll reveal
// ============================================================
(function initFeatureReveal() {
  const cards = $$('.feature-card');
  if (!cards.length) return;

  cards.forEach((card, i) => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(24px)';
    card.style.transition = 'opacity 0.6s ease ' + (i * 0.1) + 's, transform 0.6s ease ' + (i * 0.1) + 's';
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'none';
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  cards.forEach(card => observer.observe(card));
})();


// ============================================================
// GENERAL SCROLL REVEAL
// ============================================================
(function initScrollReveal() {
  var selectors = ['.stat-list li', '.news-card', '.media-item', '.class-card', '.social-card'];

  selectors.forEach(function(selector) {
    var els = $$(selector);
    if (!els.length) return;

    els.forEach(function(el, i) {
      el.style.opacity = '0';
      el.style.transform = 'translateY(24px)';
      el.style.transition = 'opacity 0.65s ease ' + (i * 0.08) + 's, transform 0.65s ease ' + (i * 0.08) + 's';
    });

    var obs = new IntersectionObserver(function(entries) {
      entries.forEach(function(e) {
        if (e.isIntersecting) {
          e.target.style.opacity = '1';
          e.target.style.transform = 'none';
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.1 });

    els.forEach(function(el) { obs.observe(el); });
  });
})();


// ============================================================
// FORM VALIDATION
// ============================================================
(function initFormValidation() {
  var form = document.getElementById('newsletter-form');
  if (!form) return;

  var emailInput = document.getElementById('nl-email');
  var consentBox = document.getElementById('nl-consent');
  var successMsg = document.getElementById('form-success');

  function setError(inputEl, errorId, message) {
    var errorEl = document.getElementById(errorId);
    if (!errorEl) return;
    if (inputEl) inputEl.classList.toggle('error', !!message);
    errorEl.textContent = message || '';
  }

  function isValidEmail(val) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());
  }

  if (emailInput) {
    emailInput.addEventListener('blur', function() {
      var val = emailInput.value.trim();
      if (!val) {
        setError(emailInput, 'nl-email-error', 'Email address is required.');
      } else if (!isValidEmail(val)) {
        setError(emailInput, 'nl-email-error', 'Please enter a valid email address.');
      } else {
        setError(emailInput, 'nl-email-error', '');
      }
    });
  }

  form.addEventListener('submit', function(e) {
    e.preventDefault();
    var hasErrors = false;

    if (emailInput) {
      var val = emailInput.value.trim();
      if (!val) {
        setError(emailInput, 'nl-email-error', 'Email address is required.');
        hasErrors = true;
      } else if (!isValidEmail(val)) {
        setError(emailInput, 'nl-email-error', 'Please enter a valid email address.');
        hasErrors = true;
      } else {
        setError(emailInput, 'nl-email-error', '');
      }
    }

    if (consentBox && !consentBox.checked) {
      setError(consentBox, 'nl-consent-error', 'You must agree to receive emails to continue.');
      hasErrors = true;
    } else if (consentBox) {
      setError(consentBox, 'nl-consent-error', '');
    }

    if (hasErrors) return;

    form.style.display = 'none';
    if (successMsg) {
      successMsg.removeAttribute('hidden');
      successMsg.focus();
    }
  });
})();


// ============================================================
// ACTIVE NAV LINK
// ============================================================
(function setActiveNav() {
  var path = window.location.pathname.split('/').pop() || 'index.html';
  $$('.nav-link, .mobile-nav a').forEach(function(link) {
    var href = link.getAttribute('href') || '';
    if (href === path || (path === '' && href === 'index.html')) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
})();


// ============================================================
// FAQ ACCORDION
// ============================================================
document.addEventListener('DOMContentLoaded', function() {
  document.querySelectorAll('.faq-item').forEach(function(item) {
    var btn = item.querySelector('.faq-question');
    var ans = item.querySelector('.faq-answer');
    if (!btn || !ans) return;

    btn.addEventListener('click', function() {
      var isOpen = item.classList.contains('open');

      document.querySelectorAll('.faq-item').forEach(function(openItem) {
        openItem.classList.remove('open');
        var q = openItem.querySelector('.faq-question');
        if (q) q.setAttribute('aria-expanded', 'false');
      });

      if (!isOpen) {
        item.classList.add('open');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });
});


// ============================================================
// SMOOTH SCROLL
// ============================================================
(function initSmoothScroll() {
  $$('a[href^="#"]').forEach(function(link) {
    link.addEventListener('click', function(e) {
      var id = link.getAttribute('href').slice(1);
      var target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      var top = target.getBoundingClientRect().top + window.scrollY - 92;
      window.scrollTo({ top: top, behavior: 'smooth' });
    });
  });
})();

// Fix parallax on mobile
if (/Mobi|Android/i.test(navigator.userAgent)) {
  document.body.style.backgroundAttachment = 'scroll';
}
