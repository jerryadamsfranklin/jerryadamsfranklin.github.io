(function() {
  var path = (window.location.pathname || '').replace(/\\/g, '/');
  var file = path.split('/').pop() || 'index.html';
  if (!file) file = 'index.html';
  var isHome = file === 'index.html' || file === '' || /\/$/.test(path);

  // Only redirect legacy deep hashes that are NOT on-home section ids
  var hashRedirects = {
    '#skills': 'about.html#skills',
    '#education': 'about.html#education',
    '#achievements': 'work.html',
    '#featured': 'work.html#featured',
    '#projects': 'work.html#projects',
    '#project-vcscout': 'work.html#project-vcscout',
    '#award-intel': 'work.html#award-intel',
    '#talk-ai-risk-summit': 'speaking.html#talk-ai-risk-summit',
    '#talk-nearcon': 'speaking.html#talk-nearcon',
    '#talk-ethcc': 'speaking.html#talk-ethcc',
    '#publications': 'writing.html',
    '#press': 'writing.html#press'
  };

  if (isHome && window.location.hash && hashRedirects[window.location.hash]) {
    window.location.replace(hashRedirects[window.location.hash]);
    return;
  }

  document.documentElement.classList.add('js');
  requestAnimationFrame(function() {
    document.body.classList.add('page-enter');
  });

  var pageKey = 'home';
  if (file.indexOf('about') === 0) pageKey = 'about';
  else if (file.indexOf('experience') === 0) pageKey = 'experience';
  else if (file.indexOf('work') === 0) pageKey = 'work';
  else if (file.indexOf('writing') === 0) pageKey = 'writing';
  else if (file.indexOf('speaking') === 0) pageKey = 'speaking';
  else if (file.indexOf('contact') === 0) pageKey = 'contact';

  if (!isHome) {
    document.querySelectorAll('.nav-links a[data-nav]').forEach(function(a) {
      a.classList.toggle('active', a.getAttribute('data-nav') === pageKey);
    });
    document.querySelectorAll('.app-dock-item').forEach(function(a) {
      var href = a.getAttribute('href') || '';
      var on = false;
      if (pageKey === 'about' || pageKey === 'experience') on = href.indexOf('about.html') !== -1;
      if (pageKey === 'work') on = href.indexOf('work.html') !== -1;
      if (pageKey === 'writing') on = href.indexOf('writing.html') !== -1;
      if (pageKey === 'contact') on = href.indexOf('contact.html') !== -1;
      a.classList.toggle('is-active', on);
      if (on) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    });
  }

  var nav = document.getElementById('nav');
  function onScrollNav() {
    if (!nav) return;
    if (window.scrollY > 40) nav.classList.add('scrolled');
    else nav.classList.remove('scrolled');
  }
  window.addEventListener('scroll', onScrollNav, { passive: true });
  onScrollNav();

  var toggle = document.getElementById('navToggle');
  var links = document.getElementById('navLinks');
  if (toggle && links) {
    toggle.addEventListener('click', function() {
      links.classList.toggle('open');
    });
    links.querySelectorAll('a').forEach(function(a) {
      a.addEventListener('click', function() { links.classList.remove('open'); });
    });
  }

  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) entry.target.classList.add('visible');
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    reveals.forEach(function(el) { observer.observe(el); });
  } else {
    reveals.forEach(function(el) { el.classList.add('visible'); });
  }

  // Home section scroll spy for dock + nav
  if (isHome && 'IntersectionObserver' in window) {
    var sectionIds = ['home', 'about', 'experience', 'work', 'writing', 'speaking', 'contact'];
    var sectionMap = {
      home: 'home',
      about: 'about',
      experience: 'about',
      work: 'work',
      writing: 'writing',
      speaking: 'writing',
      contact: 'contact'
    };
    var spy = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (!entry.isIntersecting) return;
        var id = entry.target.id;
        var dockKey = sectionMap[id] || id;
        document.querySelectorAll('.app-dock-item[data-dock]').forEach(function(a) {
          var on = a.getAttribute('data-dock') === dockKey;
          a.classList.toggle('is-active', on);
          if (on) a.setAttribute('aria-current', 'page');
          else a.removeAttribute('aria-current');
        });
        document.querySelectorAll('.nav-links a[data-nav]').forEach(function(a) {
          a.classList.toggle('active', a.getAttribute('data-nav') === id);
        });
      });
    }, { threshold: 0.35, rootMargin: '-20% 0px -45% 0px' });
    sectionIds.forEach(function(id) {
      var el = document.getElementById(id);
      if (el) spy.observe(el);
    });
  }

  // Modal system
  var root = document.getElementById('modalRoot');
  var body = document.getElementById('modalBody');
  var lastFocus = null;

  function openModal(id) {
    var source = document.getElementById(id);
    if (!root || !body || !source) return;
    lastFocus = document.activeElement;
    body.innerHTML = source.innerHTML;
    var title = body.querySelector('.modal-title');
    if (title && !title.id) title.id = 'modalTitle';
    root.hidden = false;
    document.body.classList.add('modal-open');
    requestAnimationFrame(function() {
      root.classList.add('is-open');
    });
    var closeBtn = root.querySelector('.modal-close');
    if (closeBtn) closeBtn.focus();
  }

  function closeModal() {
    if (!root) return;
    root.classList.remove('is-open');
    document.body.classList.remove('modal-open');
    setTimeout(function() {
      root.hidden = true;
      if (body) body.innerHTML = '';
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    }, 280);
  }

  document.querySelectorAll('[data-modal]').forEach(function(btn) {
    btn.addEventListener('click', function() {
      openModal(btn.getAttribute('data-modal'));
    });
  });

  if (root) {
    root.addEventListener('click', function(e) {
      if (e.target && e.target.hasAttribute('data-close-modal')) closeModal();
    });
  }

  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && root && root.classList.contains('is-open')) closeModal();
  });

  if (window.location.hash) {
    var el = document.querySelector(window.location.hash);
    if (el) {
      setTimeout(function() {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 60);
    }
  }

  // Digital theme: typing/counters on home; particles on all digital pages
  if (document.body.classList.contains('digital-theme')) {
    var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (isHome) {
      var typedEl = document.getElementById('typedLede');
      var typedFull = 'Production AI. Federated learning. LLMs that ship.';
      if (typedEl) {
        if (reduceMotion) {
          typedEl.textContent = typedFull;
        } else {
          var ti = 0;
          function typeNext() {
            ti += 1;
            typedEl.textContent = typedFull.slice(0, ti);
            if (ti < typedFull.length) setTimeout(typeNext, 28 + Math.random() * 30);
          }
          setTimeout(typeNext, 450);
        }
      }

      function animateCount(el) {
        var target = parseFloat(el.getAttribute('data-count') || '0');
        var prefix = el.getAttribute('data-prefix') || '';
        var suffix = el.getAttribute('data-suffix') || '';
        if (reduceMotion) {
          el.textContent = prefix + target + suffix;
          return;
        }
        var start = null;
        var dur = 1200;
        function frame(ts) {
          if (!start) start = ts;
          var p = Math.min(1, (ts - start) / dur);
          var eased = 1 - Math.pow(1 - p, 3);
          var val = Math.round(target * eased);
          el.textContent = prefix + val + suffix;
          if (p < 1) requestAnimationFrame(frame);
        }
        requestAnimationFrame(frame);
      }

      var counted = false;
      function runCounters() {
        if (counted) return;
        counted = true;
        document.querySelectorAll('.stat-chip strong[data-count]').forEach(animateCount);
      }
      var hero = document.getElementById('home');
      if (hero && 'IntersectionObserver' in window) {
        var cObs = new IntersectionObserver(function(entries) {
          entries.forEach(function(entry) {
            if (entry.isIntersecting) runCounters();
          });
        }, { threshold: 0.4 });
        cObs.observe(hero);
      } else {
        runCounters();
      }
    }

    var canvas = document.querySelector('canvas.digital-particles, canvas[data-particles], #digitalParticles');
    if (canvas && canvas.getContext && !reduceMotion) {
      var ctx = canvas.getContext('2d');
      var particles = [];
      var w = 0;
      var h = 0;
      function resize() {
        w = canvas.width = window.innerWidth;
        h = canvas.height = window.innerHeight;
      }
      function spawn() {
        particles = [];
        var n = Math.min(48, Math.floor(w / 28));
        for (var i = 0; i < n; i++) {
          particles.push({
            x: Math.random() * w,
            y: Math.random() * h,
            r: Math.random() * 1.6 + 0.4,
            vx: (Math.random() - 0.5) * 0.35,
            vy: -0.15 - Math.random() * 0.45,
            a: 0.15 + Math.random() * 0.45
          });
        }
      }
      function draw() {
        ctx.clearRect(0, 0, w, h);
        for (var i = 0; i < particles.length; i++) {
          var p = particles[i];
          p.x += p.vx;
          p.y += p.vy;
          if (p.y < -10) { p.y = h + 10; p.x = Math.random() * w; }
          if (p.x < -10) p.x = w + 10;
          if (p.x > w + 10) p.x = -10;
          ctx.beginPath();
          ctx.fillStyle = 'rgba(249, 115, 22,' + p.a + ')';
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fill();
        }
        for (var a = 0; a < particles.length; a++) {
          for (var b = a + 1; b < particles.length; b++) {
            var dx = particles[a].x - particles[b].x;
            var dy = particles[a].y - particles[b].y;
            var dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 110) {
              ctx.strokeStyle = 'rgba(249, 115, 22,' + (0.08 * (1 - dist / 110)) + ')';
              ctx.beginPath();
              ctx.moveTo(particles[a].x, particles[a].y);
              ctx.lineTo(particles[b].x, particles[b].y);
              ctx.stroke();
            }
          }
        }
        requestAnimationFrame(draw);
      }
      resize();
      spawn();
      draw();
      window.addEventListener('resize', function() {
        resize();
        spawn();
      }, { passive: true });
    }
  }
})();
