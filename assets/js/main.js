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
   10. Űrlapok (beküldés a /api/lead végpontra)
   10/b. Süti-hozzájárulás és Meta Pixel
   11. Jogi dokumentumok panel (impresszum, adatkezelés, süti)
   12. Kalkulátor (helyben számol, árlista: assets/js/arak.js)
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

  /* ---------- 06b. REFERENCIAFOTÓK ---------- */
  /* Ha egy fotó nem tölthető be (még nincs feltöltve), elrejtjük, hogy a
     sraffozott helykitöltő maradjon látható törött kép ikon helyett. */
  $$('.ref__photo, .service__photo, .hero__photo, .logo__img').forEach(function (img) {
    var hide = function () { img.hidden = true; };
    img.addEventListener('error', hide);
    if (img.complete && img.naturalWidth === 0) hide();
  });

  /* Copyright éve — ne avuljon el a lábléc */
  $$('[data-year]').forEach(function (el) {
    el.textContent = String(new Date().getFullYear());
  });

  /* ---------- 07. LIGHTBOX ---------- */
  var lightbox = $('#lightbox');
  var lbTriggers = $$('[data-lightbox]');
  var lbIndex = 0;
  var lastFocused = null;

  var lbRefs = {
    img:    $('[data-lightbox-img]'),
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

    /* Nagy kép: ugyanaz a fájl, mint a kártyán. Nem a betöltöttségre
       szűrünk (lazy-load miatt kattintáskor még lehet félkész), hanem arra,
       hogy a kártyaképet nem jelölte-e hibásnak a betöltési hibakezelő. */
    var photo = $('.ref__photo', card);
    if (lbRefs.img) {
      if (photo && !photo.hidden) {
        lbRefs.img.hidden = false;
        lbRefs.img.alt = photo.alt || '';
        lbRefs.img.src = photo.getAttribute('src');
      } else {
        lbRefs.img.hidden = true;
        lbRefs.img.removeAttribute('src');
      }
    }

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

  if (lbRefs.img) {
    lbRefs.img.addEventListener('error', function () { lbRefs.img.hidden = true; });
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

  /* ---------- 10. ŰRLAPOK — beküldés a /api/lead végpontra ---------- */
  /* Az űrlapok method="post" action="/api/lead" beállítással működnek,
     tehát JS nélkül is szabályosan, POST törzsben küldenek — személyes
     adat semmilyen hibaesetben nem kerül az URL query paramétereibe.
     Itt csak ráépítjük az AJAX-os utat, hogy ne kelljen oldalt váltani. */

  var COOLDOWN_MS = 30000;          /* ismételt beküldés elleni várakozás */
  var lastSent = 0;

  function setStatus(status, text, state) {
    if (!status) return;
    status.hidden = false;
    status.textContent = text;
    status.classList.toggle('is-error', state === 'error');
    status.classList.toggle('is-success', state === 'success');
  }

  /* Kliensoldali ellenőrzés. A szerver ugyanezt újra elvégzi — ez itt
     csak gyorsabb visszajelzés, nem védelem. */
  function clientErrors(form) {
    var get = function (name) {
      var el = form.querySelector('[name="' + name + '"]');
      return el ? String(el.value || '').trim() : '';
    };
    var out = [];
    if (get('nev').length < 2) out.push('név');
    var tel = get('telefon');
    if (!/^[+0-9][0-9 ()./-]{5,}$/.test(tel) || (tel.match(/[0-9]/g) || []).length < 7) {
      out.push('telefonszám');
    }
    if (get('helyszin').length < 2) out.push('helyszín');
    var mail = get('email');
    if (mail && !/^[^\s@,;:<>"']+@[^\s@,;:<>"']+\.[A-Za-z]{2,}$/.test(mail)) out.push('e-mail-cím');
    var consent = form.querySelector('[name="hozzajarulas"]');
    if (!consent || !consent.checked) out.push('adatkezelési hozzájárulás');
    return out;
  }

  $$('[data-form]').forEach(function (form) {
    /* Kitöltés kezdetének időbélyege — a szerver ebből látja, ha egy
       automata emberi sebességnél gyorsabban küldött be. */
    var ts = form.querySelector('[name="ts"]');
    if (ts) ts.value = String(Date.now());

    form.addEventListener('submit', function (e) {
      var status = $('[data-form-status]', form);
      var button = $('button[type="submit"]', form);

      var hibak = clientErrors(form);
      if (hibak.length) {
        e.preventDefault();
        setStatus(status, 'Ellenőrizd a következőt: ' + hibak.join(', ') + '.', 'error');
        var first = form.querySelector('[name="' + (
          hibak[0] === 'név' ? 'nev' :
          hibak[0] === 'telefonszám' ? 'telefon' :
          hibak[0] === 'helyszín' ? 'helyszin' :
          hibak[0] === 'e-mail-cím' ? 'email' : 'hozzajarulas') + '"]');
        if (first && first.focus) first.focus();
        return;
      }

      /* Ismételt beküldés elleni védelem */
      var now = Date.now();
      if (now - lastSent < COOLDOWN_MS) {
        e.preventDefault();
        var maradt = Math.ceil((COOLDOWN_MS - (now - lastSent)) / 1000);
        setStatus(status, 'Az előző beküldés még feldolgozás alatt van. Várj ' +
          maradt + ' másodpercet.', 'error');
        return;
      }

      /* Innentől AJAX-szal küldünk. Ha a fetch nem érhető el, nem
         hívunk preventDefault-ot: a böngésző natívan, POST-tal küld. */
      if (typeof window.fetch !== 'function' || typeof FormData !== 'function') return;

      e.preventDefault();

      if (button) button.disabled = true;
      setStatus(status, 'Küldés folyamatban…');

      var payload = {};
      new FormData(form).forEach(function (value, key) {
        payload[key] = typeof value === 'string' ? value : '';
      });

      window.fetch(form.getAttribute('action'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(payload)
      })
        .then(function (res) {
          return res.json().catch(function () { return { ok: res.ok, message: '' }; })
            .then(function (body) { return { status: res.status, body: body }; });
        })
        .then(function (r) {
          if (r.status >= 200 && r.status < 300 && r.body && r.body.ok) {
            lastSent = Date.now();
            form.reset();
            if (ts) ts.value = String(Date.now());
            if (window.turnstile && form.querySelector('.cf-turnstile')) {
              try { window.turnstile.reset(); } catch (err) { /* nincs teendő */ }
            }
            setStatus(status, r.body.message ||
              'Köszönjük! Megkaptuk az ajánlatkérésed, hamarosan keresünk telefonon.', 'success');
            /* Konverziós esemény — csak ha van marketing-hozzájárulás. */
            if (window.fbq && consentState() === 'accepted') window.fbq('track', 'Lead');
          } else {
            setStatus(status, (r.body && r.body.message) ||
              'A küldés nem sikerült. Kérlek hívj minket: +36 30 113 1261', 'error');
          }
        })
        .catch(function () {
          setStatus(status,
            'A küldés nem sikerült. Kérlek próbáld újra, vagy hívj minket: +36 30 113 1261', 'error');
        })
        .then(function () {
          if (button) button.disabled = false;
        });
    });
  });

  /* ---------- 10/b. SÜTI-HOZZÁJÁRULÁS ÉS META PIXEL ---------- */
  /* A Meta Pixel NEM töltődik be az oldal megnyitásakor. Csak akkor
     inicializálódik, ha a látogató kifejezetten elfogadta a marketing-
     sütiket. Elutasításnál semmilyen kérés nem indul a Meta felé.
     A döntés bármikor visszavonható a lábléc "Süti-beállítások" linkjével. */

  var PIXEL_ID = '962398476156311';
  var CONSENT_KEY = 'lupatherm-consent-v1';
  var banner = $('#consent');
  var pixelLoaded = false;

  function consentState() {
    try { return localStorage.getItem(CONSENT_KEY) || 'unknown'; }
    catch (err) { return 'unknown'; }
  }

  function storeConsent(value) {
    try { localStorage.setItem(CONSENT_KEY, value); } catch (err) { /* nincs teendő */ }
  }

  function loadPixel() {
    if (pixelLoaded || window.fbq) return;
    pixelLoaded = true;

    /* A Meta hivatalos betöltője, sorba állító csonkkal. */
    var n = window.fbq = function () {
      n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
    };
    if (!window._fbq) window._fbq = n;
    n.push = n;
    n.loaded = true;
    n.version = '2.0';
    n.queue = [];

    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://connect.facebook.net/en_US/fbevents.js';
    document.head.appendChild(s);

    window.fbq('init', PIXEL_ID);
    window.fbq('track', 'PageView');
  }

  function showBanner(show) {
    if (!banner) return;
    banner.hidden = !show;
  }

  function applyConsent(value, persist) {
    if (persist) storeConsent(value);
    if (value === 'accepted') loadPixel();
    showBanner(false);
  }

  if (banner) {
    var accept = $('[data-consent-accept]', banner);
    var reject = $('[data-consent-reject]', banner);
    if (accept) accept.addEventListener('click', function () { applyConsent('accepted', true); });
    if (reject) reject.addEventListener('click', function () { applyConsent('rejected', true); });

    /* Újranyitás a láblécből — a döntés visszavonható. */
    $$('[data-consent-open]').forEach(function (el) {
      el.addEventListener('click', function (e) {
        e.preventDefault();
        showBanner(true);
        if (accept && accept.focus) accept.focus();
      });
    });

    var state = consentState();
    if (state === 'accepted') { loadPixel(); showBanner(false); }
    else if (state === 'rejected') { showBanner(false); }
    else { showBanner(true); }
  }

  /* ---------- 11. JOGI DOKUMENTUMOK PANEL ---------- */
  /* A három jogi dokumentum az oldal része: külön oldal helyett
     itt, helyben nyílik meg, fülekkel váltható, és mély linkelhető
     (#impresszum, #adatkezelesi-tajekoztato, #suti-szabalyzat). */
  var legalModal = $('#legal-modal');

  if (legalModal) {
    var LEGAL_HASH = {
      impresszum: 'impresszum',
      adatkezeles: 'adatkezelesi-tajekoztato',
      suti: 'suti-szabalyzat'
    };
    var legalBody = $('[data-legal-body]', legalModal);
    var legalTabs = $$('[data-legal-tab]', legalModal);
    var legalDocs = $$('[data-legal-doc]', legalModal);
    var legalLast = null;

    /* Beágyazott (sandboxolt) nézetben a History API dobhat — a panel
       ilyenkor is működjön, csak az URL ne kövesse a dokumentumot. */
    function setHash(hash) {
      if (!history.replaceState) return;
      try {
        history.replaceState(null, '', hash || (location.pathname + location.search));
      } catch (err) { /* nincs teendő */ }
    }

    function keyFromHash(hash) {
      var h = String(hash || '').replace(/^#/, '');
      for (var k in LEGAL_HASH) { if (LEGAL_HASH[k] === h) return k; }
      return null;
    }

    function showLegalDoc(key, moveFocus) {
      var found = false;
      legalDocs.forEach(function (doc) {
        var on = doc.getAttribute('data-legal-doc') === key;
        doc.hidden = !on;
        if (on) found = true;
      });
      if (!found) return false;
      legalTabs.forEach(function (tab) {
        var on = tab.getAttribute('data-legal-tab') === key;
        tab.classList.toggle('is-active', on);
        tab.setAttribute('aria-selected', on ? 'true' : 'false');
        tab.tabIndex = on ? 0 : -1;
        if (on && moveFocus) tab.focus();
      });
      if (legalBody) legalBody.scrollTop = 0;
      setHash('#' + LEGAL_HASH[key]);
      return true;
    }

    function openLegal(key) {
      if (!showLegalDoc(key, false)) return;
      legalLast = document.activeElement;
      legalModal.hidden = false;
      document.body.classList.add('is-locked');
      /* A dokumentumra fókuszálunk, nem a fülre: így nem ugrik elő
         fókuszkeret nyitáskor, de a Tab és a felolvasó a panelben marad. */
      var doc = legalDocs.filter(function (d) { return !d.hidden; })[0];
      if (doc) doc.focus();
    }

    function closeLegal() {
      if (legalModal.hidden) return;
      legalModal.hidden = true;
      document.body.classList.remove('is-locked');
      setHash('');
      if (legalLast && legalLast.focus) legalLast.focus();
    }

    $$('[data-legal]').forEach(function (link) {
      link.addEventListener('click', function (e) {
        e.preventDefault();
        openLegal(link.getAttribute('data-legal'));
      });
    });

    legalTabs.forEach(function (tab, i) {
      tab.addEventListener('click', function () {
        showLegalDoc(tab.getAttribute('data-legal-tab'), false);
      });
      tab.addEventListener('keydown', function (e) {
        var delta = e.key === 'ArrowRight' ? 1 : (e.key === 'ArrowLeft' ? -1 : 0);
        if (!delta) return;
        e.preventDefault();
        var next = legalTabs[(i + delta + legalTabs.length) % legalTabs.length];
        showLegalDoc(next.getAttribute('data-legal-tab'), true);
      });
    });

    $$('[data-legal-close]', legalModal).forEach(function (el) {
      el.addEventListener('click', closeLegal);
    });

    document.addEventListener('keydown', function (e) {
      if (legalModal.hidden) return;
      if (e.key === 'Escape') closeLegal();
    });

    /* Fókuszcsapda */
    legalModal.addEventListener('keydown', function (e) {
      if (e.key !== 'Tab') return;
      var focusables = $$('button, [href], input, select, textarea', legalModal)
        .filter(function (el) { return el.offsetParent !== null && el.tabIndex !== -1; });
      if (!focusables.length) return;
      var first = focusables[0];
      var last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });

    /* Mély link: az oldal betöltésekor és hash-váltáskor */
    var initialKey = keyFromHash(location.hash);
    if (initialKey) openLegal(initialKey);
    window.addEventListener('hashchange', function () {
      var k = keyFromHash(location.hash);
      if (k) openLegal(k);
    });
  }

  /* ---------- 12. KALKULÁTOR — helyben számol ---------- */
  /* Nem küld adatot sehova, nincs hálózati kérés. Az árakat kizárólag
     az assets/js/arak.js fájlból veszi. Ha az árlista nincs kitöltve
     (aktiv !== true), a teljes szekció rejtve marad — így nem jelenhet
     meg kitalált szám a látogatónak. */

  var calcSection = $('#kalkulator');
  var ARAK = window.LUPATHERM_ARAK;

  function arlistaKesz(a) {
    if (!a || a.aktiv !== true) return false;
    /* Legalább egy valódi egységárnak lennie kell, különben a
       kalkulátor nullát mutatna. */
    var talalt = false;
    ['nyilaszaro', 'ajto', 'arnyekolas', 'kiegeszito', 'beepites'].forEach(function (k) {
      var cs = a[k];
      if (!cs) return;
      Object.keys(cs).forEach(function (m) {
        if (typeof cs[m] === 'number' && cs[m] > 0) talalt = true;
      });
    });
    return talalt;
  }

  if (calcSection && arlistaKesz(ARAK)) {
    calcSection.hidden = false;
    $$('[data-nav-calc]').forEach(function (el) { el.hidden = false; });

    var calcForm = $('#calc-form');
    var elTotal = $('[data-calc-total]');
    var elVat = $('[data-calc-vat]');
    var elList = $('[data-calc-breakdown]');
    var elEmpty = $('[data-calc-empty]');
    var elCta = $('[data-calc-cta]');

    var szamFmt = new Intl.NumberFormat('hu-HU', { maximumFractionDigits: 0 });
    var penz = function (n) { return szamFmt.format(Math.round(n)) + ' ' + ARAK.penznem; };

    function ertek(selector, alap) {
      var el = calcForm.querySelector('[data-calc="' + selector + '"]');
      if (!el) return alap;
      if (el.type === 'checkbox') return el.checked;
      if (el.tagName === 'SELECT') return el.value;
      var n = parseFloat(el.value);
      if (!isFinite(n)) return alap;
      /* A min/max attribútumot itt is betartatjuk: a number mező
         értéke kézzel átírható a megadott korlátokon túlra. */
      var min = parseFloat(el.min);
      var max = parseFloat(el.max);
      if (isFinite(min) && n < min) n = min;
      if (isFinite(max) && n > max) n = max;
      return n;
    }

    function aktivCsoportok() {
      return $$('[data-calc-group]', calcForm)
        .filter(function (el) { return el.checked; })
        .map(function (el) { return el.value; });
    }

    function szamol() {
      var csoportok = aktivCsoportok();
      var tetelek = [];
      var nyilasDb = 0;
      var ajtoDb = 0;

      if (csoportok.indexOf('nyilaszaro') > -1) {
        var db = ertek('nyilaszaro.db', 0);
        var sz = ertek('nyilaszaro.szelesseg', 0) / 100;
        var ma = ertek('nyilaszaro.magassag', 0) / 100;
        var anyag = ertek('nyilaszaro.anyag', 'muanyag');
        var egysegAr = ARAK.nyilaszaro[anyag];
        var m2 = sz * ma;
        if (ARAK.nyilaszaro.minM2 && m2 < ARAK.nyilaszaro.minM2) m2 = ARAK.nyilaszaro.minM2;
        if (db > 0 && egysegAr) {
          nyilasDb += db;
          tetelek.push({
            nev: 'Nyílászáró (' + db + ' db, ' + m2.toFixed(2).replace('.', ',') + ' m²/db)',
            osszeg: db * m2 * egysegAr
          });
        }
      }

      if (csoportok.indexOf('ajto') > -1) {
        var adb = ertek('ajto.db', 0);
        var kivitel = ertek('ajto.kivitel', 'alap');
        var aAr = ARAK.ajto[kivitel];
        if (adb > 0 && aAr) {
          ajtoDb += adb;
          tetelek.push({ nev: 'Bejárati ajtó (' + adb + ' db)', osszeg: adb * aAr });
        }
      }

      if (csoportok.indexOf('arnyekolas') > -1) {
        var rdb = ertek('arnyekolas.db', 0);
        var tipus = ertek('arnyekolas.tipus', 'redony_kezi');
        var rAr = ARAK.arnyekolas[tipus];
        if (rdb > 0 && rAr) {
          tetelek.push({ nev: 'Árnyékolás (' + rdb + ' nyílás)', osszeg: rdb * rAr });
        }
      }

      if (csoportok.indexOf('kiegeszito') > -1) {
        var sdb = ertek('kiegeszito.szunyoghalo', 0);
        var pdb = ertek('kiegeszito.parkany', 0);
        if (sdb > 0 && ARAK.kiegeszito.szunyoghalo) {
          tetelek.push({ nev: 'Szúnyogháló (' + sdb + ' db)', osszeg: sdb * ARAK.kiegeszito.szunyoghalo });
        }
        if (pdb > 0 && ARAK.kiegeszito.parkany) {
          tetelek.push({ nev: 'Belső párkány (' + pdb + ' db)', osszeg: pdb * ARAK.kiegeszito.parkany });
        }
      }

      if (ertek('beepites.kell', false) && (nyilasDb > 0 || ajtoDb > 0)) {
        var bOsszeg = 0;
        if (ARAK.beepites.nyilaszaro) bOsszeg += nyilasDb * ARAK.beepites.nyilaszaro;
        if (ARAK.beepites.ajto) bOsszeg += ajtoDb * ARAK.beepites.ajto;
        if (bOsszeg > 0) tetelek.push({ nev: 'Bontás és beépítés', osszeg: bOsszeg });
      }

      var netto = tetelek.reduce(function (s, t) { return s + t.osszeg; }, 0);
      return { tetelek: tetelek, netto: netto };
    }

    function megjelenit() {
      var r = szamol();
      var van = r.netto > 0;

      elEmpty.hidden = van;
      elList.hidden = !van;
      elVat.hidden = !van;

      if (!van) {
        elTotal.textContent = '—';
        elList.innerHTML = '';
        return;
      }

      var sav = ARAK.savSzazalek || 0;
      var brutto = r.netto * (1 + (ARAK.afaSzazalek || 0) / 100);
      var also = brutto * (1 - sav);
      var felso = brutto * (1 + sav);

      elTotal.textContent = sav > 0
        ? penz(also) + ' – ' + penz(felso)
        : penz(brutto);
      elVat.textContent = 'bruttó, ' + ARAK.afaSzazalek + '% áfával · nettó ' + penz(r.netto);

      elList.innerHTML = '';
      r.tetelek.forEach(function (t) {
        var li = document.createElement('li');
        var nev = document.createElement('span');
        var ar = document.createElement('span');
        nev.textContent = t.nev;
        ar.textContent = penz(t.osszeg);
        li.appendChild(nev);
        li.appendChild(ar);
        elList.appendChild(li);
      });
    }

    /* A csoportválasztó jelölőnégyzetek nyitják a hozzájuk tartozó panelt. */
    function panelokFrissit() {
      var csoportok = aktivCsoportok();
      $$('[data-calc-panel]', calcForm).forEach(function (panel) {
        var kulcs = panel.getAttribute('data-calc-panel');
        panel.hidden = kulcs === 'beepites'
          ? (csoportok.indexOf('nyilaszaro') < 0 && csoportok.indexOf('ajto') < 0)
          : csoportok.indexOf(kulcs) < 0;
      });
    }

    calcForm.addEventListener('input', function () { panelokFrissit(); megjelenit(); });
    calcForm.addEventListener('change', function () { panelokFrissit(); megjelenit(); });
    calcForm.addEventListener('submit', function (e) { e.preventDefault(); });

    /* Az ajánlatkérő gomb átviszi a becslés összefoglalóját az űrlapba,
       hogy a látogatónak ne kelljen újra begépelnie. */
    if (elCta) {
      elCta.addEventListener('click', function () {
        var r = szamol();
        if (!r.netto) return;
        var uzenet = $('#f1-uzenet') || $('[name="uzenet"]');
        if (!uzenet || uzenet.value.trim()) return;
        uzenet.value = 'Kalkulátor becslés:\n' +
          r.tetelek.map(function (t) { return '- ' + t.nev; }).join('\n');
      });
    }

    panelokFrissit();
    megjelenit();
  }


  /* Kezdeti állapotok beállítása */
  onScroll();
})();
