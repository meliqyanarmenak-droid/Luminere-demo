'use strict';

document.addEventListener('DOMContentLoaded', () => {
  initPreloader();
  initStickyHeader();
  initMobileMenu();
  initScrollReveal();
  initParallax();
  initFormValidation();
  initButtonRipple();
  initPhoneMask();
  initSmoothScroll();
  initActiveNav();
});

function initPreloader() {
  const preloader = document.getElementById('preloader');
  if (!preloader) return;

  window.addEventListener('load', () => {
    setTimeout(() => {
      preloader.classList.add('is-hidden');
      preloader.addEventListener('transitionend', () => {
        preloader.remove();
      }, { once: true });
    }, 2000);
  });

  setTimeout(() => {
    preloader.classList.add('is-hidden');
  }, 4000);
}

function initStickyHeader() {
  const header = document.getElementById('header');
  if (!header) return;

  const SCROLL_THRESHOLD = 60;

  const handleScroll = () => {
    header.classList.toggle('is-sticky', window.scrollY > SCROLL_THRESHOLD);
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();
}

function initMobileMenu() {
  const burger = document.getElementById('burger');
  const nav    = document.getElementById('nav');
  if (!burger || !nav) return;

  const overlay = document.createElement('div');
  overlay.className = 'nav-overlay';
  document.body.appendChild(overlay);

  const openMenu = () => {
    burger.classList.add('is-active');
    nav.classList.add('is-open');
    overlay.classList.add('is-visible');
    document.body.classList.add('modal-open');
    burger.setAttribute('aria-expanded', 'true');
  };

  const closeMenu = () => {
    burger.classList.remove('is-active');
    nav.classList.remove('is-open');
    overlay.classList.remove('is-visible');
    document.body.classList.remove('modal-open');
    burger.setAttribute('aria-expanded', 'false');
  };

  burger.addEventListener('click', () => {
    nav.classList.contains('is-open') ? closeMenu() : openMenu();
  });

  overlay.addEventListener('click', closeMenu);

  nav.querySelectorAll('.header__nav-link').forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && nav.classList.contains('is-open')) {
      closeMenu();
    }
  });
}

function initScrollReveal() {
  const revealEls = document.querySelectorAll('.scroll-reveal');
  if (!revealEls.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.12,
      rootMargin: '0px 0px -60px 0px',
    }
  );

  revealEls.forEach(el => observer.observe(el));
}

function initParallax() {
  const heroBg = document.getElementById('heroBg');
  if (!heroBg) return;

  const mediaQuery = window.matchMedia('(min-width: 768px)');
  let ticking = false;

  const applyParallax = () => {
    if (!mediaQuery.matches) return;

    const scrollY = window.scrollY;
    const heroHeight = heroBg.closest('.hero')?.offsetHeight || 0;

    if (scrollY <= heroHeight) {
      heroBg.style.transform = `translateY(${scrollY * 0.35}px)`;
    }

    ticking = false;
  };

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(applyParallax);
      ticking = true;
    }
  }, { passive: true });
}

function initFormValidation() {
  const form = document.getElementById('bookingForm');
  if (!form) return;

  const fields = {
    name:    { el: document.getElementById('name'),    errEl: document.getElementById('nameError')    },
    phone:   { el: document.getElementById('phone'),   errEl: document.getElementById('phoneError')   },
    service: { el: document.getElementById('service'), errEl: document.getElementById('serviceError') },
  };

  const validators = {
    name:    (v) => v.trim().length >= 2  ? '' : 'Введите ваше имя (минимум 2 символа)',
    phone:   (v) => /^[\+\d\s\(\)\-]{7,18}$/.test(v.trim()) ? '' : 'Введите корректный номер телефона',
    service: (v) => v !== ''              ? '' : 'Пожалуйста, выберите услугу',
  };

  const setError = (field, message) => {
    field.el.classList.add('is-error');
    field.el.classList.remove('is-success');
    field.errEl.textContent = message;
  };

  const clearError = (field) => {
    field.el.classList.remove('is-error');
    field.errEl.textContent = '';
  };

  const setSuccess = (field) => {
    field.el.classList.remove('is-error');
    field.el.classList.add('is-success');
    field.errEl.textContent = '';
  };

  Object.entries(fields).forEach(([key, field]) => {
    field.el.addEventListener('blur', () => {
      const error = validators[key](field.el.value);
      error ? setError(field, error) : setSuccess(field);
    });

    field.el.addEventListener('input', () => {
      if (field.el.classList.contains('is-error')) {
        const error = validators[key](field.el.value);
        if (!error) clearError(field);
      }
    });
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    let isValid = true;

    Object.entries(fields).forEach(([key, field]) => {
      const error = validators[key](field.el.value);
      if (error) {
        setError(field, error);
        isValid = false;
      } else {
        setSuccess(field);
      }
    });

    if (!isValid) {
      const firstError = form.querySelector('.is-error');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        firstError.focus();
      }
      return;
    }

    simulateSubmit();
  });
}

function simulateSubmit() {
  const btn  = document.getElementById('submitBtn');
  const form = document.getElementById('bookingForm');

  btn.classList.add('is-loading');
  btn.disabled = true;

  setTimeout(() => {
    btn.classList.remove('is-loading');
    btn.disabled = false;

    form.reset();
    form.querySelectorAll('.form__input').forEach(el => {
      el.classList.remove('is-success', 'is-error');
    });

    showToast();
  }, 1500);
}

function initPhoneMask() {
  const phoneInput = document.getElementById('phone');
  if (!phoneInput) return;

  phoneInput.addEventListener('input', (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 11) value = value.slice(0, 11);

    let formatted = '';
    if (value.length > 0) {
      formatted = '+7';
      if (value.length > 1) formatted += ' (' + value.slice(1, 4);
      if (value.length >= 4) formatted += ') ' + value.slice(4, 7);
      if (value.length >= 7) formatted += '-' + value.slice(7, 9);
      if (value.length >= 9) formatted += '-' + value.slice(9, 11);
    }

    e.target.value = formatted;
  });

  phoneInput.addEventListener('paste', () => {
    setTimeout(() => {
      phoneInput.dispatchEvent(new Event('input'));
    }, 10);
  });
}

function showToast() {
  const toast = document.getElementById('toast');
  if (!toast) return;

  toast.classList.add('is-visible');

  setTimeout(() => {
    toast.classList.remove('is-visible');
  }, 4500);
}

function initButtonRipple() {
  document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const rect   = btn.getBoundingClientRect();
      const size   = Math.max(rect.width, rect.height);
      const x      = e.clientX - rect.left - size / 2;
      const y      = e.clientY - rect.top  - size / 2;

      const ripple = document.createElement('span');
      ripple.className = 'ripple';
      ripple.style.cssText = `width:${size}px;height:${size}px;left:${x}px;top:${y}px;`;
      btn.appendChild(ripple);

      ripple.addEventListener('animationend', () => ripple.remove());
    });
  });
}

function initSmoothScroll() {
  const HEADER_OFFSET = 72;

  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (targetId === '#') return;

      const target = document.querySelector(targetId);
      if (!target) return;

      e.preventDefault();

      const top = target.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
}

function initActiveNav() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.header__nav-link');
  if (!sections.length || !navLinks.length) return;

  const updateActiveLink = () => {
    let current = '';
    const scrollMid = window.scrollY + window.innerHeight / 2;

    sections.forEach(section => {
      if (scrollMid >= section.offsetTop) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.toggle('is-active', link.getAttribute('href') === `#${current}`);
    });
  };

  window.addEventListener('scroll', updateActiveLink, { passive: true });
  updateActiveLink();
}
