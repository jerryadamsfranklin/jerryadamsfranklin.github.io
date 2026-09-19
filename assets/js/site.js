(function() {
  var path = (window.location.pathname || '').replace(/\\/g, '/');
  var file = path.split('/').pop() || 'index.html';
  if (!file) file = 'index.html';
  var isHome = file === 'index.html' || file === '' || /\/$/.test(path);

  document.documentElement.classList.add('js');
  requestAnimationFrame(function() {
    document.body.classList.add('page-enter');
  });
  document.body.addEventListener('animationend', function onPageEnter(e) {
    if (e.animationName !== 'pageEnter') return;
    document.body.classList.remove('page-enter');
    document.body.removeEventListener('animationend', onPageEnter);
  });

  var nav = document.getElementById('nav');
  var toggle = document.getElementById('navToggle');
  var links = document.getElementById('navLinks');
  var navFab = document.getElementById('navFab');

  function setNavExpanded(open) {
    if (!nav) return;
    nav.classList.toggle('nav-expanded', open);
    if (navFab) {
      navFab.setAttribute('aria-expanded', open ? 'true' : 'false');
      navFab.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    }
  }

  function onScrollNav() {
    if (!nav) return;
    var y = window.scrollY || document.documentElement.scrollTop || 0;
    if (y > 40) nav.classList.add('scrolled');
    else nav.classList.remove('scrolled');

    // Home: collapse the floating bar into a fixed menu button while scrolling
    if (nav.classList.contains('nav-float')) {
      if (y > 80) {
        nav.classList.add('nav-compact');
      } else {
        nav.classList.remove('nav-compact');
        setNavExpanded(false);
      }
    }
  }
  window.addEventListener('scroll', onScrollNav, { passive: true });
  onScrollNav();

  if (navFab) {
    navFab.addEventListener('click', function(e) {
      e.stopPropagation();
      if (!nav.classList.contains('nav-compact')) return;
      setNavExpanded(!nav.classList.contains('nav-expanded'));
    });
  }
  if (toggle && links) {
    toggle.addEventListener('click', function() {
      links.classList.toggle('open');
    });
  }
  if (links) {
    links.querySelectorAll('a').forEach(function(a) {
      a.addEventListener('click', function() {
        links.classList.remove('open');
        setNavExpanded(false);
      });
    });
  }
  document.addEventListener('click', function(e) {
    if (!nav || !nav.classList.contains('nav-expanded')) return;
    if (!nav.contains(e.target)) setNavExpanded(false);
  });
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') setNavExpanded(false);
  });

  var reveals = document.querySelectorAll('.reveal');
  var revealObserver = null;

  function revealNow(el) {
    if (!el) return;
    el.classList.add('visible');
    if (revealObserver && el.classList.contains('home-sec')) {
      try { revealObserver.unobserve(el); } catch (err) {}
    }
  }

  function revealByHash(hash) {
    if (!hash || hash.charAt(0) !== '#') return;
    var target = document.querySelector(hash);
    if (!target) return;
    // Walk up so nested anchors (talk-*, project-*) still light their section
    var node = target;
    while (node && node !== document.body) {
      if (node.classList && node.classList.contains('reveal')) {
        revealNow(node);
        break;
      }
      node = node.parentElement;
    }
    revealNow(target);
  }

  if ('IntersectionObserver' in window) {
    revealObserver = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (!entry.isIntersecting) return;
        revealNow(entry.target);
      });
    }, { threshold: 0.05, rootMargin: '0px 0px -4% 0px' });
    reveals.forEach(function(el) { revealObserver.observe(el); });
  } else {
    reveals.forEach(function(el) { el.classList.add('visible'); });
  }

  // Eager-reveal on dock/nav jumps so tall sections are never a blank void
  document.querySelectorAll('a[href^="#"]').forEach(function(a) {
    a.addEventListener('click', function() {
      revealByHash(a.getAttribute('href'));
    });
  });
  if (window.location.hash) revealByHash(window.location.hash);
  window.addEventListener('hashchange', function() {
    revealByHash(window.location.hash);
  });

  // Home section scroll spy for dock + nav
  if (isHome) {
    var sectionIds = [
      'home', 'about', 'skills', 'experience', 'education',
      'achievements', 'speaking', 'publications', 'press',
      'featured', 'projects', 'contact'
    ];
    var spyCurrent = '';

    function setSpyActive(id) {
      if (!id || id === spyCurrent) return;
      spyCurrent = id;
      var dock = document.getElementById('appDock');
      var track = dock ? dock.querySelector('.app-dock-track') : null;
      document.querySelectorAll('.app-dock-item[data-dock]').forEach(function(a) {
        var on = a.getAttribute('data-dock') === id;
        a.classList.toggle('is-active', on);
        if (on) {
          a.setAttribute('aria-current', 'page');
          // Center active chip inside the dock track only (never scroll the page)
          if (track) {
            var left = a.offsetLeft - (track.clientWidth / 2) + (a.offsetWidth / 2);
            if (typeof track.scrollTo === 'function') {
              track.scrollTo({ left: Math.max(0, left), behavior: 'smooth' });
            } else {
              track.scrollLeft = Math.max(0, left);
            }
          }
        } else {
          a.removeAttribute('aria-current');
        }
      });
      document.querySelectorAll('.nav-links a[data-nav]').forEach(function(a) {
        a.classList.toggle('active', a.getAttribute('data-nav') === id);
      });
    }

    function onSpyScroll() {
      var marker = Math.round(window.innerHeight * 0.55);
      var current = sectionIds[0];
      for (var i = 0; i < sectionIds.length; i++) {
        var el = document.getElementById(sectionIds[i]);
        if (!el) continue;
        if (el.getBoundingClientRect().top <= marker) current = sectionIds[i];
      }

      // Contact is short and last; activate as soon as its heading enters view.
      var contactEl = document.getElementById('contact');
      if (contactEl) {
        var contactTop = contactEl.getBoundingClientRect().top;
        if (contactTop <= window.innerHeight * 0.72) current = 'contact';
      }

      var scrollBottom = window.scrollY + window.innerHeight;
      var docHeight = Math.max(
        document.documentElement.scrollHeight,
        document.body.scrollHeight
      );
      if (scrollBottom >= docHeight - Math.max(180, window.innerHeight * 0.22)) {
        current = 'contact';
      }

      setSpyActive(current);
    }

    window.addEventListener('scroll', onSpyScroll, { passive: true });
    window.addEventListener('resize', onSpyScroll);
    onSpyScroll();
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

  // Mobile: collapse long Experience bullets behind Show more
  (function initTimelineMore() {
    var mq = window.matchMedia ? window.matchMedia('(max-width: 768px)') : null;
    function syncButtons() {
      var mobile = !mq || mq.matches;
      document.querySelectorAll('.timeline-item').forEach(function(item) {
        var list = item.querySelector('.timeline-bullets.is-collapsible');
        var btn = item.querySelector('.timeline-more');
        if (!list || !btn) return;
        var extras = list.querySelectorAll('.timeline-bullet-extra');
        if (!extras.length) {
          btn.hidden = true;
          return;
        }
        if (!mobile) {
          list.classList.remove('is-expanded');
          btn.hidden = true;
          btn.setAttribute('aria-expanded', 'false');
          btn.textContent = 'Show more';
          return;
        }
        btn.hidden = false;
        var open = list.classList.contains('is-expanded');
        btn.setAttribute('aria-expanded', open ? 'true' : 'false');
        btn.textContent = open ? 'Show less' : 'Show more';
      });
    }
    document.querySelectorAll('.timeline-more').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var item = btn.closest('.timeline-item');
        var list = item && item.querySelector('.timeline-bullets.is-collapsible');
        if (!list) return;
        list.classList.toggle('is-expanded');
        var open = list.classList.contains('is-expanded');
        btn.setAttribute('aria-expanded', open ? 'true' : 'false');
        btn.textContent = open ? 'Show less' : 'Show more';
      });
    });
    syncButtons();
    if (mq) {
      if (mq.addEventListener) mq.addEventListener('change', syncButtons);
      else if (mq.addListener) mq.addListener(syncButtons);
    }
  })();

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
