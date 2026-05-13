    (function() {
      // Nav shrink on scroll
      var nav = document.getElementById('nav');
      function onScroll() {
        if (window.scrollY > 50) nav.classList.add('scrolled');
        else nav.classList.remove('scrolled');
      }
      window.addEventListener('scroll', onScroll, { passive: true });
      onScroll();

      // Mobile nav toggle
      var toggle = document.getElementById('navToggle');
      var links = document.getElementById('navLinks');
      toggle.addEventListener('click', function() {
        links.classList.toggle('open');
      });
      links.querySelectorAll('a').forEach(function(a) {
        a.addEventListener('click', function() { links.classList.remove('open'); });
      });

      // Scroll reveal
      var reveals = document.querySelectorAll('.reveal');
      var observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
      reveals.forEach(function(el) { observer.observe(el); });
    })();
