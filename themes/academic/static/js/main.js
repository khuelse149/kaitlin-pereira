// ============================================
// Kaitlin Pereira — Academic Website JS
// ============================================

(function() {
  'use strict';

  // ---- 1. SCROLL-AWARE NAV ----
  var header = document.querySelector('.site-header');
  if (header) {
    if (!document.querySelector('.hero-landing')) {
      header.classList.add('scrolled');
    } else {
      window.addEventListener('scroll', function() {
        header.classList.toggle('scrolled', window.scrollY > 80);
      }, { passive: true });
    }
  }

  // ---- 2. HERO LOAD ANIMATIONS ----
  setTimeout(function() {
    document.querySelectorAll('.reveal-on-load').forEach(function(el, i) {
      setTimeout(function() { el.classList.add('visible'); }, i * 200);
    });
  }, 300);

  // ---- 3. TYPING EFFECT ----
  var typedEl = document.querySelector('.typed-text');
  if (typedEl) {
    var phrases = [
      'PhD Candidate',
      'NOAA WINGS Fellow',
      'Wave Modeler',
      'Great Lakes Researcher'
    ];
    var phraseIdx = 0, charIdx = 0, isDeleting = false;

    function typeStep() {
      var current = phrases[phraseIdx];
      if (isDeleting) {
        typedEl.textContent = current.substring(0, charIdx - 1);
        charIdx--;
      } else {
        typedEl.textContent = current.substring(0, charIdx + 1);
        charIdx++;
      }

      var delay = isDeleting ? 40 : 80;

      if (!isDeleting && charIdx === current.length) {
        delay = 2200;
        isDeleting = true;
      } else if (isDeleting && charIdx === 0) {
        isDeleting = false;
        phraseIdx = (phraseIdx + 1) % phrases.length;
        delay = 400;
      }

      setTimeout(typeStep, delay);
    }
    setTimeout(typeStep, 1200);
  }

  // ---- 4. FLOATING PARTICLES ON CANVAS ----
  var canvas = document.getElementById('particles-canvas');
  if (canvas) {
    var ctx = canvas.getContext('2d');
    var particles = [];
    var mouseX = 0, mouseY = 0;

    function resizeCanvas() {
      canvas.width = canvas.parentElement.offsetWidth;
      canvas.height = canvas.parentElement.offsetHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Track mouse for parallax effect
    document.addEventListener('mousemove', function(e) {
      mouseX = e.clientX;
      mouseY = e.clientY;
    });

    function Particle() {
      this.reset();
      this.y = Math.random() * canvas.height;
    }

    Particle.prototype.reset = function() {
      this.x = Math.random() * canvas.width;
      this.y = canvas.height + 10;
      this.size = Math.random() * 2.5 + 0.5;
      this.speedY = -(Math.random() * 0.4 + 0.1);
      this.speedX = (Math.random() - 0.5) * 0.3;
      this.opacity = Math.random() * 0.5 + 0.1;
      this.drift = Math.random() * 0.005;
    };

    Particle.prototype.update = function() {
      this.y += this.speedY;
      this.x += this.speedX + Math.sin(this.y * this.drift) * 0.3;
      // Subtle mouse repulsion
      var dx = this.x - mouseX;
      var dy = this.y - mouseY;
      var dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 120) {
        this.x += dx / dist * 0.5;
        this.y += dy / dist * 0.5;
      }
      if (this.y < -10 || this.x < -10 || this.x > canvas.width + 10) {
        this.reset();
      }
    };

    Particle.prototype.draw = function() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,' + this.opacity + ')';
      ctx.fill();
    };

    // Create particles
    var count = Math.min(60, Math.floor(canvas.width / 20));
    for (var i = 0; i < count; i++) {
      particles.push(new Particle());
    }

    function animateParticles() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(function(p) { p.update(); p.draw(); });
      requestAnimationFrame(animateParticles);
    }
    animateParticles();
  }

  // ---- 5. SCROLL REVEAL ANIMATIONS ----
  var reveals = document.querySelectorAll('.scroll-reveal');
  if (reveals.length) {
    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

    reveals.forEach(function(el) { observer.observe(el); });
  }

  // ---- 6. ANIMATED COUNTERS ----
  var counters = document.querySelectorAll('.stat-number[data-target]');
  if (counters.length) {
    var counterObserver = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          var el = entry.target;
          var target = parseInt(el.getAttribute('data-target'));
          var suffix = el.getAttribute('data-suffix') || '';
          var duration = 2000;
          var start = 0;
          var startTime = null;

          function step(timestamp) {
            if (!startTime) startTime = timestamp;
            var progress = Math.min((timestamp - startTime) / duration, 1);
            // Ease out cubic
            var eased = 1 - Math.pow(1 - progress, 3);
            var current = Math.floor(eased * target);
            el.textContent = current.toLocaleString() + suffix;
            if (progress < 1) requestAnimationFrame(step);
          }
          requestAnimationFrame(step);
          counterObserver.unobserve(el);
        }
      });
    }, { threshold: 0.5 });

    counters.forEach(function(el) { counterObserver.observe(el); });
  }

  // ---- 7. GREAT LAKES SVG DRAW ANIMATION ----
  var lakePaths = document.querySelectorAll('.lake-path');
  if (lakePaths.length) {
    lakePaths.forEach(function(path) {
      var len = path.getTotalLength();
      path.style.strokeDasharray = len;
      path.style.strokeDashoffset = len;
    });

    var lakeObserver = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          entry.target.querySelectorAll('.lake-path').forEach(function(path, i) {
            setTimeout(function() {
              path.classList.add('drawn');
            }, i * 300);
          });
          // Show labels and dots after paths draw
          setTimeout(function() {
            entry.target.querySelectorAll('.lake-label, .buoy-dot').forEach(function(el) {
              el.classList.add('visible');
            });
          }, 1800);
          lakeObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });

    var svg = document.querySelector('.lakes-svg');
    if (svg) lakeObserver.observe(svg);
  }

  // ---- 8. PARALLAX ON HERO (subtle) ----
  var heroContent = document.querySelector('.hero-content');
  if (heroContent && window.innerWidth > 768) {
    window.addEventListener('scroll', function() {
      var scroll = window.scrollY;
      if (scroll < window.innerHeight) {
        heroContent.style.transform = 'translateY(' + (scroll * 0.3) + 'px)';
        heroContent.style.opacity = 1 - (scroll / (window.innerHeight * 0.8));
      }
    }, { passive: true });
  }

})();
