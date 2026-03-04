'use strict';

document.addEventListener('DOMContentLoaded', () => {
  initServiceModals();
});

function initServiceModals() {
  const modal    = document.getElementById('serviceModal');
  const backdrop = document.getElementById('modalBackdrop');
  const closeBtn = document.getElementById('modalClose');
  const titleEl  = document.getElementById('modalTitle');
  const descEl   = document.getElementById('modalDesc');
  const priceEl  = document.getElementById('modalPrice');
  const ctaEl    = document.getElementById('modalCta');

  if (!modal) return;

  let lastTrigger = null;

  const openModal = ({ title, desc, price }) => {
    if (titleEl) titleEl.textContent = title || '';
    if (descEl)  descEl.textContent  = desc  || '';
    if (priceEl) priceEl.textContent = price || '';

    modal.classList.add('is-open');
    document.body.classList.add('modal-open');

    const focusTarget = modal.querySelector('.modal__box');
    if (focusTarget) {
      focusTarget.setAttribute('tabindex', '-1');
      focusTarget.focus({ preventScroll: true });
    }

    enableFocusTrap(modal);
  };

  const closeModal = () => {
    modal.classList.remove('is-open');
    document.body.classList.remove('modal-open');
    disableFocusTrap();

    if (lastTrigger) {
      lastTrigger.focus({ preventScroll: true });
      lastTrigger = null;
    }
  };

  document.querySelectorAll('[data-modal="service"]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      lastTrigger = e.currentTarget;
      openModal({
        title: btn.dataset.title || '',
        desc:  btn.dataset.desc  || '',
        price: btn.dataset.price || '',
      });
    });
  });

  if (ctaEl) {
    ctaEl.addEventListener('click', closeModal);
  }

  if (backdrop) {
    backdrop.addEventListener('click', closeModal);
  }

  if (closeBtn) {
    closeBtn.addEventListener('click', closeModal);
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('is-open')) {
      closeModal();
    }
  });

  const FOCUSABLE_SELECTORS = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
  ].join(', ');

  let trapHandler = null;

  const enableFocusTrap = (container) => {
    const getFocusable = () =>
      Array.from(container.querySelectorAll(FOCUSABLE_SELECTORS))
           .filter(el => !el.closest('[hidden]') && el.offsetParent !== null);

    trapHandler = (e) => {
      if (e.key !== 'Tab') return;

      const focusable = getFocusable();
      if (!focusable.length) return;

      const first = focusable[0];
      const last  = focusable[focusable.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', trapHandler);
  };

  const disableFocusTrap = () => {
    if (trapHandler) {
      document.removeEventListener('keydown', trapHandler);
      trapHandler = null;
    }
  };
}

window.LumiereModal = {
  open(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    modal.classList.add('is-open');
    document.body.classList.add('modal-open');
  },

  close(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    modal.classList.remove('is-open');
    document.body.classList.remove('modal-open');
  },

  closeAll() {
    document.querySelectorAll('.modal.is-open').forEach(modal => {
      modal.classList.remove('is-open');
    });
    document.body.classList.remove('modal-open');
  },
};
