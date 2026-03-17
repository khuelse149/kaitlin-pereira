// ============================================
// Kaitlin Pereira — Academic Website JS
// Realistic water, particles, animations
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

  // ---- 3. TYPING EFFECT (expanded phrases) ----
  var typedEl = document.querySelector('.typed-text');
  if (typedEl) {
    var phrases = [
      'PhD Candidate',
      'NOAA WINGS Fellow',
      'Wave Modeler',
      'Great Lakes Researcher',
      'Air-Sea Interaction',
      'Operational Forecasting'
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
      var delay = isDeleting ? 35 : 70;
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

  // ---- 4. REALISTIC WATER CANVAS ----
  var canvas = document.getElementById('water-canvas');
  if (canvas) {
    var ctx = canvas.getContext('2d');
    var W, H, mouseX = -1000, mouseY = -1000, time = 0;
    var particles = [], sparkles = [];

    function resize() {
      W = canvas.width = canvas.parentElement.offsetWidth;
      H = canvas.height = canvas.parentElement.offsetHeight;
    }
    resize();
    window.addEventListener('resize', resize);
    document.addEventListener('mousemove', function(e) {
      var rect = canvas.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
    });

    // --- Particles (light motes rising through water) ---
    function Particle() { this.reset(true); }
    Particle.prototype.reset = function(init) {
      this.x = Math.random() * W;
      this.y = init ? Math.random() * H : H + 10;
      this.size = Math.random() * 2 + 0.5;
      this.vy = -(Math.random() * 0.3 + 0.08);
      this.vx = (Math.random() - 0.5) * 0.2;
      this.opacity = Math.random() * 0.35 + 0.05;
      this.wobble = Math.random() * Math.PI * 2;
      this.wobbleSpeed = Math.random() * 0.02 + 0.005;
    };
    Particle.prototype.update = function() {
      this.wobble += this.wobbleSpeed;
      this.y += this.vy;
      this.x += this.vx + Math.sin(this.wobble) * 0.25;
      // Mouse repulsion
      var dx = this.x - mouseX, dy = this.y - mouseY;
      var d = Math.sqrt(dx * dx + dy * dy);
      if (d < 100 && d > 0) {
        this.x += dx / d * 0.8;
        this.y += dy / d * 0.8;
      }
      if (this.y < -10 || this.x < -10 || this.x > W + 10) this.reset(false);
    };
    Particle.prototype.draw = function() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,' + this.opacity + ')';
      ctx.fill();
    };

    // --- Sparkles (bright flashes like sunlight on water) ---
    function Sparkle() { this.reset(); }
    Sparkle.prototype.reset = function() {
      this.x = Math.random() * W;
      this.y = Math.random() * H * 0.7;
      this.maxSize = Math.random() * 3 + 1.5;
      this.life = 0;
      this.maxLife = Math.random() * 80 + 40;
      this.delay = Math.random() * 200;
    };
    Sparkle.prototype.update = function() {
      if (this.delay > 0) { this.delay--; return; }
      this.life++;
      if (this.life > this.maxLife) this.reset();
    };
    Sparkle.prototype.draw = function() {
      if (this.delay > 0) return;
      var progress = this.life / this.maxLife;
      var alpha = progress < 0.5 ? progress * 2 : (1 - progress) * 2;
      alpha *= 0.5;
      var size = this.maxSize * (progress < 0.3 ? progress / 0.3 : 1);
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = '#fff';
      // Draw 4-point star
      ctx.beginPath();
      ctx.moveTo(this.x, this.y - size);
      ctx.quadraticCurveTo(this.x + size * 0.15, this.y - size * 0.15, this.x + size, this.y);
      ctx.quadraticCurveTo(this.x + size * 0.15, this.y + size * 0.15, this.x, this.y + size);
      ctx.quadraticCurveTo(this.x - size * 0.15, this.y + size * 0.15, this.x - size, this.y);
      ctx.quadraticCurveTo(this.x - size * 0.15, this.y - size * 0.15, this.x, this.y - size);
      ctx.fill();
      ctx.restore();
    };

    // --- Water caustics (light patterns on water surface) ---
    function drawCaustics() {
      ctx.save();
      ctx.globalAlpha = 0.045;
      ctx.strokeStyle = 'rgba(150,220,255,1)';
      ctx.lineWidth = 1;
      for (var i = 0; i < 16; i++) {
        ctx.beginPath();
        var yBase = H * 0.5 + i * 40 + Math.sin(time * 0.005 + i) * 20;
        for (var x = 0; x < W; x += 8) {
          var y = yBase + Math.sin(x * 0.008 + time * 0.01 + i * 0.7) * 15
                        + Math.sin(x * 0.015 + time * 0.007) * 8;
          if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      ctx.restore();
    }

    // Initialize
    var pCount = Math.min(50, Math.floor(W / 25));
    for (var i = 0; i < pCount; i++) particles.push(new Particle());
    var sCount = Math.min(15, Math.floor(W / 80));
    for (var j = 0; j < sCount; j++) sparkles.push(new Sparkle());

    function animate() {
      time++;
      ctx.clearRect(0, 0, W, H);
      drawCaustics();
      particles.forEach(function(p) { p.update(); p.draw(); });
      sparkles.forEach(function(s) { s.update(); s.draw(); });
      requestAnimationFrame(animate);
    }
    animate();
  }

  // ---- 5. SCROLL REVEAL ----
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
    var cObs = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          var el = entry.target;
          var target = parseInt(el.getAttribute('data-target'));
          var suffix = el.getAttribute('data-suffix') || '';
          var startTime = null;
          function step(ts) {
            if (!startTime) startTime = ts;
            var p = Math.min((ts - startTime) / 2000, 1);
            var eased = 1 - Math.pow(1 - p, 3);
            el.textContent = Math.floor(eased * target).toLocaleString() + suffix;
            if (p < 1) requestAnimationFrame(step);
          }
          requestAnimationFrame(step);
          cObs.unobserve(el);
        }
      });
    }, { threshold: 0.5 });
    counters.forEach(function(el) { cObs.observe(el); });
  }

  // ---- 7. PARALLAX HERO ----
  var heroContent = document.querySelector('.hero-content');
  if (heroContent && window.innerWidth > 768) {
    window.addEventListener('scroll', function() {
      var s = window.scrollY;
      if (s < window.innerHeight) {
        heroContent.style.transform = 'translateY(' + (s * 0.3) + 'px)';
        heroContent.style.opacity = 1 - (s / (window.innerHeight * 0.8));
      }
    }, { passive: true });
  }

  // ---- 8. WAVE RIPPLE ON RESEARCH CARD HOVER ----
  document.querySelectorAll('.objective-card').forEach(function(card) {
    card.addEventListener('mouseenter', function(e) {
      var ripple = document.createElement('div');
      ripple.className = 'card-ripple';
      var rect = card.getBoundingClientRect();
      ripple.style.left = (e.clientX - rect.left) + 'px';
      ripple.style.top = (e.clientY - rect.top) + 'px';
      card.appendChild(ripple);
      setTimeout(function() { ripple.remove(); }, 600);
    });
  });

  // ---- 9. INTERACTIVE LAKE MAP — click to scroll ----
  document.querySelectorAll('.lake-hotspot').forEach(function(hs) {
    hs.addEventListener('click', function() {
      var targetId = hs.getAttribute('data-scroll');
      var target = document.getElementById(targetId);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // Flash highlight
        target.classList.add('highlight-flash');
        setTimeout(function() { target.classList.remove('highlight-flash'); }, 1500);
      }
    });
  });

  // ---- 10. ANIMATED WAVE ENERGY SPECTRUM ----
  var specCanvas = document.getElementById('spectrum-canvas');
  if (specCanvas) {
    var sCtx = specCanvas.getContext('2d');
    var sTime = 0;

    function resizeSpec() {
      specCanvas.width = specCanvas.parentElement.offsetWidth;
      specCanvas.height = specCanvas.parentElement.offsetHeight;
    }
    resizeSpec();
    window.addEventListener('resize', resizeSpec);

    // JONSWAP-like spectral shape: S(f) = α * g² / (2π)⁴ * f⁻⁵ * exp(-5/4 * (fp/f)⁴) * γʳ
    function jonswap(f, fp, gamma) {
      if (f <= 0) return 0;
      var sigma = f <= fp ? 0.07 : 0.09;
      var r = Math.exp(-Math.pow(f - fp, 2) / (2 * sigma * sigma * fp * fp));
      var S = Math.pow(f, -5) * Math.exp(-1.25 * Math.pow(fp / f, 4)) * Math.pow(gamma, r);
      return S;
    }

    var specObs = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          animateSpectrum();
          specObs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });
    specObs.observe(specCanvas);

    function animateSpectrum() {
      sTime += 0.008;
      var w = specCanvas.width, h = specCanvas.height;
      sCtx.clearRect(0, 0, w, h);

      // Draw multiple spectral curves with slight variation
      for (var s = 0; s < 3; s++) {
        var fp = 0.08 + s * 0.015 + Math.sin(sTime + s) * 0.005;
        var gamma = 3.3 + Math.sin(sTime * 0.7 + s * 2) * 0.5;
        var alpha = [0.08, 0.05, 0.035][s];

        sCtx.beginPath();
        var maxS = 0;
        var points = [];
        for (var x = 0; x < w; x++) {
          var f = 0.02 + (x / w) * 0.25;
          var val = jonswap(f, fp, gamma);
          if (val > maxS) maxS = val;
          points.push({ x: x, val: val });
        }

        // Normalize and draw
        for (var p = 0; p < points.length; p++) {
          var px = points[p].x;
          var py = h - 20 - (points[p].val / maxS) * (h * 0.6);
          // Add subtle noise
          py += Math.sin(px * 0.05 + sTime * 3 + s) * 2;
          if (p === 0) sCtx.moveTo(px, py);
          else sCtx.lineTo(px, py);
        }

        sCtx.strokeStyle = 'rgba(200, 181, 96, ' + alpha + ')';
        sCtx.lineWidth = s === 0 ? 2 : 1.2;
        sCtx.stroke();
      }

      // Axis labels
      sCtx.fillStyle = 'rgba(255,255,255,0.12)';
      sCtx.font = '10px Inter, sans-serif';
      sCtx.fillText('f (Hz)', w - 45, h - 6);
      sCtx.save();
      sCtx.translate(12, h / 2);
      sCtx.rotate(-Math.PI / 2);
      sCtx.fillText('S(f)', 0, 0);
      sCtx.restore();

      requestAnimationFrame(animateSpectrum);
    }
  }

})();
