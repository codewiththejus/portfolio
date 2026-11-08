/* =========================================================
   script.js — UI behaviour (no animation library required)
   Navigation · active section · filters · project viewer · form
   ========================================================= */
(() => {
  'use strict';

  /* ----- CONFIG -------------------------------------------------------
     CONTACT FORM
     The form works out of the box by opening the visitor's email app with
     the message pre-filled (mailto). To receive messages directly with no
     email app involved, create a free form endpoint (e.g. Formspree or
     Web3Forms) and paste its URL below. Example:
       const FORM_ENDPOINT = 'https://formspree.io/f/your-form-id';
  ----------------------------------------------------------------------- */
  const FORM_ENDPOINT = '';
  const TO_EMAIL = 'pazhayadathanusree@gmail.com';

  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const root = document.documentElement;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const P = (window.Portfolio = window.Portfolio || {});

  /* ---------- Year ---------- */
  const yearEl = $('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Navigation: solid / hide on scroll, progress ---------- */
  const nav = $('#nav');
  const bar = $('.progress__bar');
  let lastY = window.scrollY;
  let ticking = false;

  function onScroll() {
    const y = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    if (bar) bar.style.transform = 'scaleX(' + (max > 0 ? Math.min(1, y / max) : 0) + ')';

    nav.classList.toggle('is-solid', y > 60);
    if (!root.classList.contains('nav-open')) {
      if (y > lastY + 6 && y > window.innerHeight * 0.6) nav.classList.add('is-hidden');
      else if (y < lastY - 6 || y < 80) nav.classList.remove('is-hidden');
    }
    lastY = y;
    ticking = false;
  }
  window.addEventListener('scroll', () => {
    if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
  }, { passive: true });
  onScroll();

  /* ---------- Active section ---------- */
  const links = $$('[data-nav]');
  const sections = $$('[data-section]');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const key = entry.target.dataset.navGroup || entry.target.dataset.section;
        links.forEach((a) => {
          const on = a.dataset.nav === key;
          a.classList.toggle('is-active', on);
          if (on) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach((s) => io.observe(s));
  }

  /* ---------- Mobile menu ---------- */
  const toggle = $('.nav__toggle');
  function setMenu(open) {
    root.classList.toggle('nav-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    nav.classList.remove('is-hidden');
    if (P.lenis) open ? P.lenis.stop() : P.lenis.start();
  }
  toggle.addEventListener('click', () => setMenu(!root.classList.contains('nav-open')));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && root.classList.contains('nav-open')) { setMenu(false); toggle.focus(); }
  });
  window.matchMedia('(min-width: 961px)').addEventListener('change', (e) => { if (e.matches) setMenu(false); });

  /* ---------- Anchor navigation ---------- */
  function goTo(hash) {
    const target = $(hash);
    if (!target) return;
    if (P.goTo) { P.goTo(hash); return; }
    target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
    history.replaceState(null, '', hash);
  }
  $$('[data-scroll]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const hash = a.getAttribute('href');
      if (!hash || hash.charAt(0) !== '#') return;
      e.preventDefault();
      if (root.classList.contains('nav-open')) setMenu(false);
      goTo(hash);
    });
  });
  $('.totop').addEventListener('click', () => goTo('#home'));

  /* ---------- Project filters ---------- */
  const grid = $('#project-grid');
  const cards = $$('.project', grid);
  const empty = $('.grid__empty');
  const spanPattern = [7, 5, 5, 7, 6, 6, 7, 5];
  let visible = cards.slice();

  function layoutProjects() {
    visible.forEach((card, i) => {
      card.dataset.span = String(spanPattern[i % spanPattern.length]);
      card.style.setProperty('--shift', i % 2 === 1 ? 'clamp(0rem,4vw,4rem)' : '0rem');
    });
  }
  function applyFilter(cat) {
    visible = cards.filter((c) => cat === 'all' || c.dataset.category === cat);
    cards.forEach((c) => c.classList.toggle('is-hidden', !visible.includes(c)));
    empty.hidden = visible.length > 0;
    layoutProjects();
    document.dispatchEvent(new CustomEvent('projects:filtered', { detail: { items: visible } }));
  }
  $$('.filter').forEach((btn) => {
    btn.addEventListener('click', () => {
      $$('.filter').forEach((b) => {
        const on = b === btn;
        b.classList.toggle('is-active', on);
        b.setAttribute('aria-pressed', String(on));
      });
      applyFilter(btn.dataset.filter);
    });
  });
  layoutProjects();

  /* ---------- Project viewer ---------- */
  const viewer = $('#viewer');
  const vImg = $('.viewer__img', viewer);
  let current = -1;
  let opener = null;

  function fill(card) {
    vImg.src = card.dataset.full;
    vImg.alt = card.dataset.alt || '';
    vImg.width = +card.dataset.w || 1200;
    vImg.height = +card.dataset.h || 800;
    $('#viewer-no').textContent = card.dataset.no;
    $('#viewer-total').textContent = String(cards.length).padStart(2, '0');
    $('#viewer-title').textContent = card.dataset.label || card.dataset.title;
    $('#viewer-tools').textContent = card.dataset.tools;
    $('#viewer-desc').textContent = card.dataset.desc;
    const ul = $('#viewer-details');
    ul.innerHTML = '';
    (card.dataset.details || '').split('|').filter(Boolean).forEach((t) => {
      const li = document.createElement('li');
      li.textContent = t;
      ul.appendChild(li);
    });
  }
  function preloadNeighbours() {
    [-1, 1].forEach((d) => {
      const n = visible[(current + d + visible.length) % visible.length];
      if (n) { const i = new Image(); i.src = n.dataset.full; }
    });
  }
  function openViewer(card, trigger) {
    current = visible.indexOf(card);
    if (current < 0) return;
    opener = trigger;
    fill(card);
    if (!viewer.open) viewer.showModal();
    root.classList.add('viewer-open');
    if (P.lenis) P.lenis.stop();
    viewer.dispatchEvent(new CustomEvent('viewer:open'));
    preloadNeighbours();
  }
  function step(dir) {
    if (visible.length < 2) return;
    current = (current + dir + visible.length) % visible.length;
    fill(visible[current]);
    viewer.dispatchEvent(new CustomEvent('viewer:change'));
    preloadNeighbours();
  }
  function closeViewer() {
    const done = () => {
      if (viewer.open) viewer.close();
      root.classList.remove('viewer-open');
      if (P.lenis && !root.classList.contains('nav-open')) P.lenis.start();
      if (opener) opener.focus({ preventScroll: true });
    };
    if (P.animateViewerOut) P.animateViewerOut(done); else done();
  }

  cards.forEach((card) => {
    $('.project__btn', card).addEventListener('click', (e) => openViewer(card, e.currentTarget));
  });
  $('.viewer__close', viewer).addEventListener('click', closeViewer);
  $$('.viewer__btn', viewer).forEach((b) => b.addEventListener('click', () => step(+b.dataset.dir)));
  viewer.addEventListener('cancel', (e) => { e.preventDefault(); closeViewer(); });
  viewer.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') step(1);
    if (e.key === 'ArrowLeft') step(-1);
  });

  /* ---------- Contact form ---------- */
  const form = $('#contact-form');
  const status = $('.form__status', form);

  function setStatus(msg, isError) {
    status.textContent = msg;
    status.classList.toggle('is-error', !!isError);
  }
  function validate() {
    let ok = true;
    let first = null;
    $$('input[required], textarea[required]', form).forEach((el) => {
      const val = el.value.trim();
      let valid = val.length > 0;
      if (valid && el.type === 'email') valid = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(val);
      el.closest('.field').classList.toggle('has-error', !valid);
      el.setAttribute('aria-invalid', String(!valid));
      if (!valid) { ok = false; if (!first) first = el; }
    });
    if (first) first.focus();
    return ok;
  }
  form.addEventListener('input', (e) => {
    const f = e.target.closest('.field');
    if (f && f.classList.contains('has-error')) { f.classList.remove('has-error'); e.target.removeAttribute('aria-invalid'); }
  });
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    setStatus('');
    if (!validate()) { setStatus('Please complete every field with a valid email address.', true); return; }

    const data = Object.fromEntries(new FormData(form).entries());
    if (data.website) { setStatus('Thank you. Your message has been sent.'); form.reset(); return; } // honeypot

    if (FORM_ENDPOINT) {
      const btn = $('button[type="submit"]', form);
      btn.disabled = true;
      setStatus('Sending…');
      try {
        const res = await fetch(FORM_ENDPOINT, {
          method: 'POST',
          headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: data.name, email: data.email, subject: data.subject, message: data.message })
        });
        if (!res.ok) throw new Error('Request failed');
        setStatus('Thank you. Your message has been sent.');
        form.reset();
      } catch (err) {
        setStatus('Sorry, that did not go through. Please email ' + TO_EMAIL + ' directly.', true);
      } finally {
        btn.disabled = false;
      }
      return;
    }

    // No backend configured: hand the message to the visitor's email app.
    const body = data.message + '\n\n— ' + data.name + ' (' + data.email + ')';
    const href = 'mailto:' + TO_EMAIL + '?subject=' + encodeURIComponent(data.subject) + '&body=' + encodeURIComponent(body);
    setStatus('Opening your email app. If nothing opens, write to ' + TO_EMAIL + '.');
    window.location.href = href;
  });
})();
