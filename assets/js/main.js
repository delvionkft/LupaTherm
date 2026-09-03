/* ============================================================
   [PROJEKT NEVE] — landingoldal-váz interakciók
   ------------------------------------------------------------
   01. Segédfüggvények
   02. Fejléc görgetési állapot
   03. Mobil navigáció
   04. Reveal animációk
   05. Hero parallax
   06. Referencia carousel
   07. Lightbox
   08. Folyamat idővonal töltése
   09. Mobil ragadós CTA sáv
   10. Űrlapok (demó viselkedés — nincs valódi beküldés)
   ============================================================ */
(function () {
  'use strict';

  /* ---------- 01. SEGÉDFÜGGVÉNYEK ---------- */
  var $  = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var isMobile     = window.matchMedia('(max-width: 900px)');

  /* Görgetéshez kötött munkák egyetlen rAF ciklusban */
  var scrollJobs = [];
  var ticking = false;

  function onScroll() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(function () {
      for (var i = 0; i < scrollJobs.length; i++) scrollJobs[i]();
      ticking = false;
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });

  /* ---------- 02. FEJLÉC GÖRGETÉSI ÁLLAPOT ---------- */
  var header = $('#header');
  if (header) {
    scrollJobs.push(function () {
      header.classList.toggle('is-stuck', window.scrollY > 24);
    });
  }

  /* ---------- 03. MOBIL NAVIGÁCIÓ ---------- */
  var navToggle = $('#nav-toggle');
  var nav = $('#nav');

  function closeNav() {
    if (!nav || !navToggle) return;
    nav.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('is-locked');
  }

  if (navToggle && nav) {
    navToggle.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      document.body.classList.toggle('is-locked', open && isMobile.matches);
    });

    $$('a', nav).forEach(function (link) {
      link.addEventListener('click', closeNav);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeNav();
    });

    isMobile.addEventListener('change', closeNav);
  }

  /* ---------- 04. REVEAL ANIMÁCIÓK ---------- */
  var revealItems = $$('.reveal');

  if (reduceMotion.matches || !('IntersectionObserver' in window)) {
    revealItems.forEach(function (el) { el.classList.add('is-visible'); });
  } else {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });

    revealItems.forEach(function (el) { revealObserver.observe(el); });
  }

  /* ---------- 05. HERO PARALLAX (csak asztali, mozgásigény szerint) ---------- */
  var parallaxItems = $$('[data-parallax]');
  if (parallaxItems.length && !reduceMotion.matches) {
    scrollJobs.push(function () {
      if (isMobile.matches) return;              /* mobilon kikapcsolva a teljesítmény miatt */
      var y = window.scrollY;
      if (y > window.innerHeight * 1.2) return;  /* csak amíg a hero látható */
      parallaxItems.forEach(function (el) {
        var factor = parseFloat(el.getAttribute('data-parallax')) || 0;
        el.style.transform = 'translate3d(0,' + (y * factor).toFixed(2) + 'px,0)';
      });
    });
  }

  /* ---------- 06. REFERENCIA CAROUSEL ---------- */
  var track = $('[data-carousel-track]');
  var prevBtn = $('[data-carousel-prev]');
  var nextBtn = $('[data-carousel-next]');
  var dotsWrap = $('[data-carousel-dots]');
  var slides = track ? $$('.ref', track) : [];

  function slideStep() {
    if (slides.length < 2) return slides.length ? slides[0].offsetWidth : 0;
    return slides[1].offsetLeft - slides[0].offsetLeft;
  }

  function activeIndex() {
    var step = slideStep();
    return step ? Math.round(track.scrollLeft / step) : 0;
  }

  function syncCarousel() {
    if (!track) return;
    var i = activeIndex();
    if (dotsWrap) {
      $$('.dot', dotsWrap).forEach(function (dot, idx) {
        var on = idx === i;
        dot.classList.toggle('is-active', on);
        dot.setAttribute('aria-selected', on ? 'true' : 'false');
      });
    }
    var maxScroll = track.scrollWidth - track.clientWidth - 2;
    if (prevBtn) prevBtn.disabled = track.scrollLeft <= 2;
    if (nextBtn) nextBtn.disabled = track.scrollLeft >= maxScroll;
  }

  function goTo(index) {
    if (!track) return;
    var i = Math.max(0, Math.min(slides.length - 1, index));
    track.scrollTo({ left: i * slideStep(), behavior: reduceMotion.matches ? 'auto' : 'smooth' });
  }

  if (track && slides.length) {
    if (dotsWrap) {
      slides.forEach(function (_, i) {
        var dot = document.createElement('button');
        dot.className = 'dot';
        dot.type = 'button';
        dot.setAttribute('role', 'tab');
        dot.setAttribute('aria-label', '[REFERENCIA ' + (i + 1) + ']');
        dot.addEventListener('click', function () { goTo(i); });
        dotsWrap.appendChild(dot);
      });
    }

    if (prevBtn) prevBtn.addEventListener('click', function () { goTo(activeIndex() - 1); });
    if (nextBtn) nextBtn.addEventListener('click', function () { goTo(activeIndex() + 1); });

    track.addEventListener('scroll', function () {
      window.requestAnimationFrame(syncCarousel);
    }, { passive: true });

    window.addEventListener('resize', syncCarousel, { passive: true });
    syncCarousel();
  }

  /* ---------- 07. LIGHTBOX ---------- */
  var lightbox = $('#lightbox');
  var lbTriggers = $$('[data-lightbox]');
  var lbIndex = 0;
  var lastFocused = null;

  var lbRefs = {
    label:  $('[data-lightbox-label]'),
    cat:    $('[data-lightbox-cat]'),
    title:  $('[data-lightbox-title]'),
    text:   $('[data-lightbox-text]'),
    result: $('[data-lightbox-result]')
  };

  function fillLightbox(i) {
    var card = lbTriggers[i];
    if (!card) return;
    var item = card.closest('.ref');
    lbIndex = i;

    if (lbRefs.label)  lbRefs.label.textContent  = ($('.ref__media-label', card) || {}).textContent || '';
    if (!item) return;
    if (lbRefs.cat)    lbRefs.cat.textContent    = ($('.ref__cat', item) || {}).textContent || '';
    if (lbRefs.title)  lbRefs.title.textContent  = ($('.ref__title', item) || {}).textContent || '';
    if (lbRefs.text)   lbRefs.text.textContent   = ($('.ref__text', item) || {}).textContent || '';

    var result = $('.ref__result', item);
    if (lbRefs.result && result) {
      var label = $('.ref__result-label', result);
      lbRefs.result.textContent = result.textContent.replace(label ? label.textContent : '', '').trim();
    }
  }

  function openLightbox(i) {
    if (!lightbox) return;
    lastFocused = document.activeElement;
    fillLightbox(i);
    lightbox.hidden = false;
    document.body.classList.add('is-locked');
    var closeBtn = $('.lightbox__close', lightbox);
    if (closeBtn) closeBtn.focus();
  }

  function closeLightbox() {
    if (!lightbox || lightbox.hidden) return;
    lightbox.hidden = true;
    document.body.classList.remove('is-locked');
    if (lastFocused && lastFocused.focus) lastFocused.focus();
  }

  function stepLightbox(delta) {
    if (!lbTriggers.length) return;
    var next = (lbIndex + delta + lbTriggers.length) % lbTriggers.length;
    fillLightbox(next);
  }

  if (lightbox && lbTriggers.length) {
    lbTriggers.forEach(function (btn, i) {
      btn.addEventListener('click', function () { openLightbox(i); });
    });

    $$('[data-lightbox-close]', lightbox).forEach(function (el) {
      el.addEventListener('click', closeLightbox);
    });

    var lbPrev = $('[data-lightbox-prev]', lightbox);
    var lbNext = $('[data-lightbox-next]', lightbox);
    if (lbPrev) lbPrev.addEventListener('click', function () { stepLightbox(-1); });
    if (lbNext) lbNext.addEventListener('click', function () { stepLightbox(1); });

    document.addEventListener('keydown', function (e) {
      if (lightbox.hidden) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') stepLightbox(-1);
      if (e.key === 'ArrowRight') stepLightbox(1);
    });

    /* Egyszerű fókuszcsapda a modálban */
    lightbox.addEventListener('keydown', function (e) {
      if (e.key !== 'Tab') return;
      var focusables = $$('button, [href], input, select, textarea', lightbox)
        .filter(function (el) { return el.offsetParent !== null; });
      if (!focusables.length) return;
      var first = focusables[0];
      var last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
  }

  /* ---------- 08. FOLYAMAT IDŐVONAL TÖLTÉSE ---------- */
  var timeline = $('[data-timeline]');
  var timelineFill = $('[data-timeline-fill]');

  if (timeline && timelineFill) {
    scrollJobs.push(function () {
      var rect = timeline.getBoundingClientRect();
      var vh = window.innerHeight || document.documentElement.clientHeight;
      var anchor = vh * 0.62;                        /* a "töltési vonal" képernyőpozíciója */
      var progress = (anchor - rect.top) / rect.height;
      progress = Math.max(0, Math.min(1, progress));
      timelineFill.style.height = (progress * 100).toFixed(2) + '%';
    });
    onScroll();
  }

  /* ---------- 09. MOBIL RAGADÓS CTA SÁV ---------- */
  var mobileCta = $('#mobile-cta');
  if (mobileCta) {
    scrollJobs.push(function () {
      var past = window.scrollY > window.innerHeight * 0.7;
      var footer = $('.footer');
      var atEnd = footer
        ? footer.getBoundingClientRect().top < window.innerHeight - 120
        : false;
      mobileCta.classList.toggle('is-visible', past && !atEnd);
    });
  }

  /* ---------- 10. ŰRLAPOK ---------- */
  /* Demó viselkedés: a váz nem küld adatot sehova.
     Valós bekötéskor ez a blokk cserélendő (fetch / form action). */
  $$('[data-form]').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var status = $('[data-form-status]', form);
      if (!status) return;
      status.hidden = false;
      status.textContent = 'Az űrlap beküldése még nincs bekötve. Éles működésnél itt jelenik meg a visszaigazolás.';
    });
  });

  /* Kezdeti állapotok beállítása */
  onScroll();
})();
