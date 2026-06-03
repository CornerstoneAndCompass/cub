/* ============================================================
   CUB — interactions (shared across all pages)
   ============================================================ */
(function () {
  'use strict';

  var hdr = document.getElementById('hdr');
  var scta = document.getElementById('scta');
  var isOver = hdr && hdr.classList.contains('hdr--over');

  var footerInView = false;
  function onScroll() {
    var y = window.scrollY;
    if (hdr) hdr.classList.toggle('scrolled', y > 40);
    if (scta) scta.classList.toggle('show', y > 700 && !footerInView);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // hide the sticky CTA once the footer is reached so it never overlaps footer links
  var footerEl = document.querySelector('.ftr');
  if (scta && footerEl && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (es) {
      footerInView = es[0].isIntersecting;
      onScroll();
    }, { rootMargin: '0px 0px -40px 0px' }).observe(footerEl);
  }

  /* ---- mobile drawer ---- */
  var burger = document.getElementById('burger');
  var drawer = document.getElementById('drawer');
  if (burger && drawer) {
    burger.addEventListener('click', function () {
      var open = drawer.classList.toggle('open');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      document.body.style.overflow = open ? 'hidden' : '';
    });
    drawer.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        drawer.classList.remove('open');
        burger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });
  }

  /* ---- active nav state by current page ---- */
  var page = (location.pathname.split('/').pop() || 'index.html');
  document.querySelectorAll('.hdr-nav a, .drawer a, .dropdown a').forEach(function (a) {
    var href = (a.getAttribute('href') || '').split('#')[0];
    if (href === page) a.classList.add('active');
  });

  /* ---- dropdown tap toggle (touch / keyboard) ---- */
  var drop = document.querySelector('.nav-drop');
  var dropBtn = document.querySelector('.nav-drop-trigger');
  if (drop && dropBtn) {
    dropBtn.addEventListener('click', function (e) {
      e.preventDefault();
      var open = drop.classList.toggle('open');
      dropBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    document.addEventListener('click', function (e) {
      if (!drop.contains(e.target)) { drop.classList.remove('open'); dropBtn.setAttribute('aria-expanded', 'false'); }
    });
  }

  /* ---- scroll reveal ---- */
  var items = document.querySelectorAll('.rv');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0, rootMargin: '0px 0px -60px 0px' });
    items.forEach(function (el) { io.observe(el); });
  } else {
    items.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---- form ---- */
  var form = document.getElementById('applyForm');
  if (!form) return;
  var done = document.getElementById('formDone');
  var submitBtn = document.getElementById('submitBtn');

  function valid(el) {
    var v = (el.value || '').trim(), bad;
    if (el.id === 'email') bad = !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
    else if (el.id === 'phone') bad = v.replace(/\D/g, '').length < 8;
    else bad = v === '';
    el.closest('.field').classList.toggle('invalid', bad);
    return !bad;
  }

  form.querySelectorAll('input, select').forEach(function (el) {
    el.addEventListener('blur', function () { valid(el); });
    el.addEventListener('input', function () {
      if (el.closest('.field').classList.contains('invalid')) valid(el);
    });
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var fields = form.querySelectorAll('input[required], select[required]');
    var ok = true, first = null;
    fields.forEach(function (el) { if (!valid(el)) { ok = false; if (!first) first = el; } });
    if (!ok) { if (first) first.focus(); return; }

    submitBtn.classList.add('loading');
    submitBtn.querySelector('span').textContent = 'Sending…';
    // TODO: POST to real endpoint (Cognito Forms / CRM) here
    setTimeout(function () {
      form.querySelectorAll('.field, #submitBtn, .form-fine, .fc-head')
        .forEach(function (n) { n.style.display = 'none'; });
      done.hidden = false;
      done.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 900);
  });
})();
