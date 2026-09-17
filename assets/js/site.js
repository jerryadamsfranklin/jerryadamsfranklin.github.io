(function() {
  // Legacy single-page hash redirects (home only)
  var hashRedirects = {
    '#home': 'index.html',
    '#about': 'about.html',
    '#skills': 'about.html#skills',
    '#education': 'about.html#education',
    '#experience': 'experience.html',
    '#achievements': 'work.html',
    '#featured': 'work.html#featured',
    '#projects': 'work.html#projects',
    '#project-vcscout': 'work.html#project-vcscout',
    '#award-intel': 'work.html#award-intel',
    '#speaking': 'speaking.html',
    '#talk-ai-risk-summit': 'speaking.html#talk-ai-risk-summit',
    '#talk-nearcon': 'speaking.html#talk-nearcon',
    '#talk-ethcc': 'speaking.html#talk-ethcc',
    '#publications': 'writing.html',
    '#press': 'writing.html#press',
    '#contact': 'contact.html'
  };

  var path = (window.location.pathname || '').replace(/\\/g, '/');
  var isHome = /(?:^|\/)(index\.html)?$/.test(path) || path.endsWith('/');
  if (isHome && window.location.hash) {
    var target = hashRedirects[window.location.hash];
    if (target) {
      window.location.replace(target);
      return;
    }
  }

  // Page enter animation
  document.documentElement.classList.add('js');
  requestAnimationFrame(function() {
    document.body.classList.add('page-enter');
  });

  // Active nav from pathname
  var file = path.split('/').pop() || 'index.html';
  if (!file || file === '') file = 'index.html';
  var pageKey = 'home';
  if (file.indexOf('about') === 0) pageKey = 'about';
  else if (file.indexOf('experience') === 0) pageKey = 'experience';
  else if (file.indexOf('work') === 0) pageKey = 'work';
  else if (file.indexOf('writing') === 0) pageKey = 'writing';
  else if (file.indexOf('speaking') === 0) pageKey = 'speaking';
  else if (file.indexOf('contact') === 0) pageKey = 'contact';
  else if (file === 'index.html' || file === '') pageKey = 'home';

  document.querySelectorAll('.nav-links a[data-nav]').forEach(function(a) {
    if (a.getAttribute('data-nav') === pageKey) a.classList.add('active');
    else a.classList.remove('active');
  });

  var dockMap = {
    home: 'index.html',
    about: 'about.html',
    experience: 'about.html',
    work: 'work.html',
    writing: 'writing.html',
    speaking: 'writing.html',
    contact: 'contact.html'
  };
  var dockTarget = dockMap[pageKey] || 'index.html';
  if (pageKey === 'speaking') dockTarget = null;
  if (pageKey === 'experience') dockTarget = 'about.html';
  document.querySelectorAll('.app-dock-item').forEach(function(a) {
    var href = a.getAttribute('href') || '';
    var on = dockTarget && href.indexOf(dockTarget) !== -1;
    if (pageKey === 'home' && href.indexOf('index.html') !== -1) on = true;
    if (pageKey === 'contact' && href.indexOf('contact.html') !== -1) on = true;
    if (pageKey === 'work' && href.indexOf('work.html') !== -1) on = true;
    if (pageKey === 'writing' && href.indexOf('writing.html') !== -1) on = true;
    if (pageKey === 'about' && href.indexOf('about.html') !== -1) on = true;
    if (pageKey === 'experience' && href.indexOf('about.html') !== -1) on = true;
    a.classList.toggle('is-active', !!on);
    if (on) a.setAttribute('aria-current', 'page');
    else a.removeAttribute('aria-current');
  });

  // Nav shrink on scroll
  var nav = document.getElementById('nav');
  function onScroll() {
    if (!nav) return;
    if (window.scrollY > 50) nav.classList.add('scrolled');
    else nav.classList.remove('scrolled');
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Mobile nav toggle
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

  // Scroll reveal
  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach(function(el) { observer.observe(el); });
  } else {
    reveals.forEach(function(el) { el.classList.add('visible'); });
  }

  // If landing with a hash on an interior page, scroll after layout
  if (window.location.hash) {
    var el = document.querySelector(window.location.hash);
    if (el) {
      setTimeout(function() {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 50);
    }
  }
})();
