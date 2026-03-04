'use strict';

document.addEventListener('DOMContentLoaded', () => {
  initReviewSlider();
});

function initReviewSlider() {
  const slider   = document.getElementById('reviewSlider');
  const track    = document.getElementById('sliderTrack');
  const prevBtn  = document.getElementById('sliderPrev');
  const nextBtn  = document.getElementById('sliderNext');
  const dotsWrap = document.getElementById('sliderDots');

  if (!slider || !track) return;

  const slides = Array.from(track.querySelectorAll('.slider__slide'));
  const count  = slides.length;
  let current  = 0;
  let isAnimating   = false;
  let autoplayTimer = null;

  const buildDots = () => {
    if (!dotsWrap) return;
    dotsWrap.innerHTML = '';

    slides.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.className = 'slider__dot';
      dot.setAttribute('aria-label', `Перейти к отзыву ${i + 1}`);
      dot.addEventListener('click', () => goTo(i));
      dotsWrap.appendChild(dot);
    });

    updateDots();
  };

  const updateDots = () => {
    if (!dotsWrap) return;
    dotsWrap.querySelectorAll('.slider__dot').forEach((dot, i) => {
      dot.classList.toggle('is-active', i === current);
    });
  };

  const goTo = (index, animated = true) => {
    if (isAnimating) return;
    if (index === current && animated) return;

    current = (index + count) % count;
    isAnimating = true;

    track.style.transition = animated
      ? 'transform 0.52s cubic-bezier(.25,.46,.45,.94)'
      : 'none';

    track.style.transform = `translateX(-${current * 100}%)`;

    updateDots();
    updateAriaLabels();

    setTimeout(() => { isAnimating = false; }, animated ? 540 : 50);
  };

  const prev = () => goTo(current - 1);
  const next = () => goTo(current + 1);

  const startAutoplay = () => {
    stopAutoplay();
    autoplayTimer = setInterval(next, 5500);
  };

  const stopAutoplay = () => {
    if (autoplayTimer) {
      clearInterval(autoplayTimer);
      autoplayTimer = null;
    }
  };

  const updateAriaLabels = () => {
    slides.forEach((slide, i) => {
      slide.setAttribute('aria-hidden', i !== current ? 'true' : 'false');
    });
  };

  let touchStartX = 0;
  let touchEndX   = 0;
  const SWIPE_THRESHOLD = 50;

  slider.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
    stopAutoplay();
  }, { passive: true });

  slider.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    const delta = touchStartX - touchEndX;

    if (Math.abs(delta) > SWIPE_THRESHOLD) {
      delta > 0 ? next() : prev();
    }

    startAutoplay();
  }, { passive: true });

  slider.setAttribute('tabindex', '0');

  slider.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft')  { prev(); stopAutoplay(); }
    if (e.key === 'ArrowRight') { next(); stopAutoplay(); }
  });

  slider.addEventListener('mouseenter', stopAutoplay);
  slider.addEventListener('mouseleave', startAutoplay);

  if (prevBtn) prevBtn.addEventListener('click', () => { prev(); stopAutoplay(); startAutoplay(); });
  if (nextBtn) nextBtn.addEventListener('click', () => { next(); stopAutoplay(); startAutoplay(); });

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      goTo(current, false);
    }, 200);
  });

  buildDots();
  updateAriaLabels();
  goTo(0, false);
  startAutoplay();
}
