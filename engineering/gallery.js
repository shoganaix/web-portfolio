(() => {
  'use strict';

  const track = document.querySelector('.event-gallery-track');
  if (!track) return;

  const slides = [...track.querySelectorAll('.event-entry')];
  const controls = document.querySelector('.event-gallery-controls');
  const previous = controls.querySelector('.gallery-previous');
  const next = controls.querySelector('.gallery-next');
  const counter = controls.querySelector('.gallery-counter');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let current = 0;

  const update = () => {
    current = slides.reduce((closest, slide, index) =>
      Math.abs(slide.offsetLeft - track.scrollLeft) <
      Math.abs(slides[closest].offsetLeft - track.scrollLeft) ? index : closest, 0);
    previous.disabled = current === 0;
    next.disabled = current === slides.length - 1;
    counter.textContent = `${String(current + 1).padStart(2, '0')} / ${String(slides.length).padStart(2, '0')}`;
  };

  const goTo = index => {
    const target = Math.max(0, Math.min(slides.length - 1, index));
    track.scrollTo({
      left: slides[target].offsetLeft,
      behavior: reducedMotion.matches ? 'instant' : 'smooth'
    });
  };

  previous.addEventListener('click', () => goTo(current - 1));
  next.addEventListener('click', () => goTo(current + 1));
  track.addEventListener('scroll', update, { passive: true });
  track.addEventListener('keydown', event => {
    const destinations = { ArrowLeft: current - 1, ArrowRight: current + 1, Home: 0, End: slides.length - 1 };
    if (!(event.key in destinations)) return;
    event.preventDefault();
    goTo(destinations[event.key]);
  });
  new ResizeObserver(() => {
    track.scrollTo({ left: slides[current].offsetLeft, behavior: 'instant' });
    update();
  }).observe(track);

  controls.hidden = slides.length < 2;
  update();
})();
