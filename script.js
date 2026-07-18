/* ═══════════════════════════════════════════════
   EZRIYAH : SHARED SITE SCRIPT
   Defensive guards throughout: every block checks
   for its target element(s) before running, since
   different pages contain different sections.
═══════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', function () {

  /* ── MOBILE NAV TOGGLE ─────────────────────── */
  var navToggle = document.querySelector('.nav-toggle');
  var navPanel  = document.querySelector('.nav-mobile-panel');
  if (navToggle && navPanel) {
    navToggle.addEventListener('click', function () {
      var open = navToggle.classList.toggle('open');
      navPanel.classList.toggle('open', open);
      document.body.style.overflow = open ? 'hidden' : '';
    });
    navPanel.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        navToggle.classList.remove('open');
        navPanel.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }

  /* ── SCROLL REVEAL ──────────────────────────── */
  var revEls = document.querySelectorAll('.rev');
  if (revEls.length) {
    if ('IntersectionObserver' in window) {
      var revObs = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('in');
            revObs.unobserve(entry.target);
          }
        });
      }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });
      revEls.forEach(function (el) { revObs.observe(el); });
    } else {
      revEls.forEach(function (el) { el.classList.add('in'); });
    }
  }

  /* ── SACRED WORD ANIMATION ─────────────────────
     Grey "SCARED" fades in letter by letter, holds,
     fades out letter by letter, then swaps to gold
     "SACRED" fading in letter by letter while the
     underline expands with it. Runs once, triggered
     when its wrapper enters the viewport. */
  var sasWord = document.getElementById('sas-word');
  var sasLine = document.getElementById('sas-line');
  if (sasWord) {
    var triggered = false;
    var spans;

    function setWord(letters) {
      sasWord.innerHTML = '';
      letters.forEach(function (l) {
        var s = document.createElement('span');
        s.className = 'sas-letter';
        s.textContent = l;
        sasWord.appendChild(s);
      });
      return sasWord.querySelectorAll('.sas-letter');
    }

    function staggerClass(list, cls, gap) {
      list.forEach(function (s, i) {
        setTimeout(function () { s.classList.add(cls); }, i * gap);
      });
    }

    spans = setWord(['S', 'C', 'A', 'R', 'E', 'D']);

    function runAnim() {
      staggerClass(spans, 'appear', 130);
      var holdUntil = 1000 + spans.length * 130;

      setTimeout(function () {
        staggerClass(spans, 'fade-out', 70);
        var fadeOutDuration = 500 + spans.length * 70;

        setTimeout(function () {
          spans = setWord(['S', 'A', 'C', 'R', 'E', 'D']);
          sasWord.classList.add('lit');
          if (sasLine) sasLine.classList.add('expand');
          staggerClass(spans, 'appear', 130);
        }, fadeOutDuration);
      }, holdUntil);
    }

    var stageAnchor = sasWord.parentElement;
    if ('IntersectionObserver' in window && stageAnchor) {
      var sasObs = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting && !triggered) {
            triggered = true;
            runAnim();
            sasObs.unobserve(entry.target);
          }
        });
      }, { threshold: 0.4, rootMargin: '0px 0px -10% 0px' });
      sasObs.observe(stageAnchor);
    } else {
      runAnim();
    }
  }

  /* ── 7-DAY CHALLENGE GRID REVEAL ────────────── */
  var daysGrid = document.getElementById('days-grid');
  if (daysGrid) {
    var dayCells = daysGrid.querySelectorAll('.day-cell');
    var daysStarted = false;
    if ('IntersectionObserver' in window) {
      var dayObs = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting && !daysStarted) {
            daysStarted = true;
            dayCells.forEach(function (cell, i) {
              setTimeout(function () {
                cell.classList.add('revealed');
                setTimeout(function () { cell.classList.add('active'); }, 80);
              }, i * 120);
            });
            dayObs.unobserve(entry.target);
          }
        });
      }, { threshold: 0.3 });
      dayObs.observe(daysGrid);
    } else {
      dayCells.forEach(function (c) { c.classList.add('revealed'); c.classList.add('active'); });
    }
  }

  /* ── TESTIMONIALS SLIDER (single-card view, autoplay) ─── */
  var track = document.getElementById('slider-track');
  if (track) {
    var cards = track.querySelectorAll('.test-card');
    var dots  = document.querySelectorAll('.dot');
    var prevBtn = document.getElementById('prev-btn');
    var nextBtn = document.getElementById('next-btn');
    var current = 0;
    var timer;

    function go(n) {
      if (cards[current]) cards[current].classList.remove('current');
      if (dots[current]) dots[current].classList.remove('active');
      current = (n + cards.length) % cards.length;
      if (cards[current]) cards[current].classList.add('current');
      if (dots[current]) dots[current].classList.add('active');
      track.style.transform = 'translateX(-' + (current * 100) + '%)';
    }
    function startTimer() { timer = setInterval(function () { go(current + 1); }, 5000); }
    function resetTimer() { clearInterval(timer); startTimer(); }

    if (prevBtn) prevBtn.addEventListener('click', function () { go(current - 1); resetTimer(); });
    if (nextBtn) nextBtn.addEventListener('click', function () { go(current + 1); resetTimer(); });
    dots.forEach(function (d) {
      d.addEventListener('click', function () { go(+d.dataset.dot); resetTimer(); });
    });

    var touchX = 0;
    track.addEventListener('touchstart', function (e) { touchX = e.touches[0].clientX; }, { passive: true });
    track.addEventListener('touchend', function (e) {
      var dx = e.changedTouches[0].clientX - touchX;
      if (Math.abs(dx) > 50) { go(dx < 0 ? current + 1 : current - 1); resetTimer(); }
    }, { passive: true });

    track.addEventListener('mouseenter', function () { clearInterval(timer); });
    track.addEventListener('mouseleave', startTimer);
    if (cards.length > 1) startTimer();
  }

  /* ── FAQ / DETAILS ACCORDIONS: only one open at a time within a group ── */
  var faqItems = document.querySelectorAll('.faq-item');
  if (faqItems.length) {
    faqItems.forEach(function (item) {
      item.addEventListener('toggle', function () {
        if (item.open) {
          faqItems.forEach(function (other) {
            if (other !== item) other.open = false;
          });
        }
      });
    });
  }

  /* ── NAV BACKGROUND ON SCROLL (subtle solidify) ─ */
  var siteNav = document.querySelector('nav');
  if (siteNav) {
    var onScroll = function () {
      if (window.scrollY > 40) siteNav.classList.add('scrolled');
      else siteNav.classList.remove('scrolled');
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ── FORM SUBMIT GUARDS (no real backend wired yet) ─ */
  document.querySelectorAll('form[data-noop]').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var btn = form.querySelector('button, input[type=submit]');
      if (btn) {
        var original = btn.textContent;
        btn.textContent = 'Thank you';
        setTimeout(function () { btn.textContent = original; }, 2200);
      }
    });
  });

});
