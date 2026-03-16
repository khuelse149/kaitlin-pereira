// Scroll-based nav styling
(function() {
  var header = document.querySelector('.site-header');
  if (!header) return;

  function onScroll() {
    if (window.scrollY > 80) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }

  // If not on homepage (no hero-landing), always show scrolled style
  if (!document.querySelector('.hero-landing')) {
    header.classList.add('scrolled');
    return;
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();
