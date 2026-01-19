(function() {
  'use strict';

  if (window.__appInit) return;
  window.__appInit = true;

  const state = {
    burgerOpen: false,
    formSubmitting: false
  };

  const utils = {
    debounce(fn, delay) {
      let timer;
      return function(...args) {
        clearTimeout(timer);
        timer = setTimeout(() => fn.apply(this, args), delay);
      };
    },

    getHeaderHeight() {
      const header = document.querySelector('.l-header');
      return header ? header.offsetHeight : 72;
    },

    escapeHTML(str) {
      const div = document.createElement('div');
      div.textContent = str;
      return div.innerHTML;
    }
  };

  function initBurgerMenu() {
    const toggle = document.querySelector('.c-nav__toggle');
    const nav = document.querySelector('.navbar-collapse');
    const navLinks = document.querySelectorAll('.nav-link');

    if (!toggle || !nav) return;

    function closeMenu() {
      nav.classList.remove('show');
      toggle.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('u-no-scroll');
      state.burgerOpen = false;
    }

    function openMenu() {
      nav.classList.add('show');
      toggle.setAttribute('aria-expanded', 'true');
      document.body.classList.add('u-no-scroll');
      state.burgerOpen = true;
    }

    toggle.addEventListener('click', function(e) {
      e.preventDefault();
      state.burgerOpen ? closeMenu() : openMenu();
    });

    navLinks.forEach(link => {
      link.addEventListener('click', closeMenu);
    });

    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && state.burgerOpen) {
        closeMenu();
      }
    });

    window.addEventListener('resize', utils.debounce(function() {
      if (window.innerWidth >= 768 && state.burgerOpen) {
        closeMenu();
      }
    }, 200));
  }

  function initSmoothScroll() {
    document.addEventListener('click', function(e) {
      let target = e.target;
      while (target && target.tagName !== 'A') {
        target = target.parentElement;
      }
      if (!target || target.tagName !== 'A') return;

      const href = target.getAttribute('href');
      if (!href || href === '#' || href === '#!') return;

      if (href.startsWith('#')) {
        e.preventDefault();
        const id = href.substring(1);
        const el = document.getElementById(id);
        if (el) {
          const offset = utils.getHeaderHeight();
          const top = el.getBoundingClientRect().top + window.pageYOffset - offset;
          window.scrollTo({ top, behavior: 'smooth' });
        }
      }
    });
  }

  function initScrollSpy() {
    const sections = document.querySelectorAll('[id]');
    const navLinks = document.querySelectorAll('.nav-link[href^="#"]');
    if (!sections.length || !navLinks.length) return;

    function updateActive() {
      const offset = utils.getHeaderHeight() + 20;
      const scroll = window.pageYOffset;

      sections.forEach(section => {
        const top = section.offsetTop - offset;
        const bottom = top + section.offsetHeight;
        const id = section.getAttribute('id');

        if (scroll >= top && scroll < bottom) {
          navLinks.forEach(link => {
            link.classList.remove('is-active');
            link.removeAttribute('aria-current');
            if (link.getAttribute('href') === `#${id}`) {
              link.classList.add('is-active');
              link.setAttribute('aria-current', 'page');
            }
          });
        }
      });
    }

    window.addEventListener('scroll', utils.debounce(updateActive, 100));
    updateActive();
  }

  function initFormValidation() {
    const form = document.getElementById('contactForm');
    if (!form) return;

    const patterns = {
      name: /^[a-zA-ZÀ-ÿ\s-']{2,50}$/,
      email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      phone: /^[\d\s+\-()]{10,20}$/,
      subject: /^.{2,100}$/,
      message: /^.{10,1000}$/
    };

    const messages = {
      firstName: 'Voer een geldige voornaam in (2-50 tekens)',
      lastName: 'Voer een geldige achternaam in (2-50 tekens)',
      email: 'Voer een geldig e-mailadres in',
      phone: 'Voer een geldig telefoonnummer in (optioneel)',
      subject: 'Voer een onderwerp in (2-100 tekens)',
      message: 'Voer een bericht in (minimaal 10 tekens)',
      privacyConsent: 'U moet akkoord gaan met het privacybeleid'
    };

    function validateField(field) {
      const id = field.id;
      const value = field.value.trim();
      const feedback = field.parentElement.querySelector('.invalid-feedback');

      if (field.type === 'checkbox') {
        if (!field.checked) {
          field.classList.add('is-invalid');
          if (feedback) feedback.textContent = messages[id];
          return false;
        } else {
          field.classList.remove('is-invalid');
          return true;
        }
      }

      if (field.hasAttribute('required') && !value) {
        field.classList.add('is-invalid');
        if (feedback) feedback.textContent = messages[id];
        return false;
      }

      if (value && patterns[id.replace('first', '').replace('last', '').replace('Name', 'name')]) {
        const pattern = id === 'firstName' || id === 'lastName' ? patterns.name : patterns[id];
        if (!pattern.test(value)) {
          field.classList.add('is-invalid');
          if (feedback) feedback.textContent = messages[id];
          return false;
        }
      }

      field.classList.remove('is-invalid');
      return true;
    }

    function showNotification(message, type) {
      const container = document.querySelector('.position-fixed.top-0.end-0') || createNotificationContainer();
      const alert = document.createElement('div');
      alert.className = `alert alert-${type} alert-dismissible fade show`;
      alert.setAttribute('role', 'alert');
      alert.innerHTML = `${utils.escapeHTML(message)}<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>`;
      container.appendChild(alert);

      setTimeout(() => {
        alert.classList.remove('show');
        setTimeout(() => alert.remove(), 150);
      }, 5000);
    }

    function createNotificationContainer() {
      const container = document.createElement('div');
      container.className = 'position-fixed top-0 end-0 p-3';
      container.style.zIndex = '9999';
      document.body.appendChild(container);
      return container;
    }

    form.addEventListener('submit', function(e) {
      e.preventDefault();
      e.stopPropagation();

      if (state.formSubmitting) return;

      const fields = [
        form.querySelector('#firstName'),
        form.querySelector('#lastName'),
        form.querySelector('#email'),
        form.querySelector('#phone'),
        form.querySelector('#subject'),
        form.querySelector('#message'),
        form.querySelector('#privacyConsent')
      ].filter(Boolean);

      let valid = true;
      fields.forEach(field => {
        if (!validateField(field)) {
          valid = false;
        }
      });

      if (!valid) {
        showNotification('Controleer de formuliervelden en probeer het opnieuw', 'danger');
        return;
      }

      const submitBtn = form.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Verzenden...';
      state.formSubmitting = true;

      setTimeout(() => {
        state.formSubmitting = false;
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
        showNotification('Bedankt! Uw bericht is verzonden.', 'success');
        form.reset();
        fields.forEach(field => field.classList.remove('is-invalid'));
        setTimeout(() => {
          window.location.href = 'thank_you.html';
        }, 1000);
      }, 1500);
    });

    form.querySelectorAll('input, textarea, select').forEach(field => {
      field.addEventListener('blur', () => validateField(field));
    });
  }

  function initScrollToTop() {
    const btn = document.querySelector('[data-scroll-top]');
    if (!btn) return;

    function toggleBtn() {
      if (window.pageYOffset > 300) {
        btn.classList.add('is-visible');
      } else {
        btn.classList.remove('is-visible');
      }
    }

    btn.addEventListener('click', function(e) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    window.addEventListener('scroll', utils.debounce(toggleBtn, 100));
    toggleBtn();
  }

  function initLazyLoading() {
    const images = document.querySelectorAll('img:not([loading])');
    images.forEach(img => {
      if (!img.classList.contains('c-logo__img')) {
        img.setAttribute('loading', 'lazy');
      }
    });
  }

  function init() {
    initBurgerMenu();
    initSmoothScroll();
    initScrollSpy();
    initFormValidation();
    initScrollToTop();
    initLazyLoading();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();