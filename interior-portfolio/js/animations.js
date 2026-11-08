/* =========================================================
   animations.js — GSAP · ScrollTrigger · Lenis
   Every motion here has an architectural job:
   floor plan drawing itself · rooms opening · light revealing images
   ========================================================= */
(() => {
  'use strict';

  const root = document.documentElement;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const P = (window.Portfolio = window.Portfolio || {});
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // If the animation libraries are missing, fall back to a fully visible static page.
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
    root.classList.remove('js', 'is-loading');
    return;
  }
  gsap.registerPlugin(ScrollTrigger);

  /* ---------- Reduced motion: no smooth scroll, no choreography ---------- */
  if (reduce) {
    root.classList.remove('is-loading');
    $$('.preloader, .curtain').forEach((el) => el.remove());
    P.goTo = (hash) => {
      const t = $(hash);
      if (!t) return;
      t.scrollIntoView({ behavior: 'auto', block: 'start' });
      t.setAttribute('tabindex', '-1');
      t.focus({ preventScroll: true });
      history.replaceState(null, '', hash);
    };
    return;
  }

  /* ---------- Smooth scroll (Lenis) ---------- */
  const lenis = new Lenis({
    duration: 1.15,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true
  });
  P.lenis = lenis;
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
  lenis.stop();

  /* ---------- Helpers ---------- */
  function splitWords(el) {
    const text = el.textContent.trim().replace(/\s+/g, ' ');
    el.setAttribute('aria-label', text);
    el.innerHTML = text.split(' ')
      .map((w) => '<span class="w" aria-hidden="true"><span class="w__i">' + w + '</span></span>')
      .join(' ');
    el.classList.add('is-split');
    return $$('.w__i', el);
  }

  /* ---------- Initial hidden states (covered by the preloader) ---------- */
  const heroMedia = $('.hero__media');
  const heroImg = $('.hero__img');
  gsap.set(heroMedia, { clipPath: 'inset(12% 9% 12% 9%)' });
  gsap.set(heroImg, { scale: 1.3 });
  gsap.set('.hero__line > span', { yPercent: 112 });
  gsap.set(['.hero__eyebrow', '.hero__intro', '.hero__actions .btn'], { opacity: 0, y: 28 });
  gsap.set('.nav', { opacity: 0 });
  gsap.set('.hero__scroll', { opacity: 0 });
  gsap.set('.curtain', { yPercent: 100 });

  /* ---------- Intro: preloader → room opens → hero ---------- */
  function intro() {
    const pre = $('.preloader');
    const count = $('.preloader__count');
    const state = { v: 0 };

    const tl = gsap.timeline({
      onComplete: () => {
        if (pre) pre.remove();
        root.classList.remove('is-loading');
        lenis.start();
        gsap.set(heroMedia, { clearProps: 'clipPath' });
        ScrollTrigger.refresh();
        if (location.hash && $(location.hash)) lenis.scrollTo($(location.hash), { immediate: true, force: true });
      }
    });

    // 1. a floor plan draws itself while the counter runs
    tl.to('.pl', { strokeDashoffset: 0, duration: 1.4, ease: 'power2.inOut', stagger: 0.12 }, 0)
      .to(state, { v: 100, duration: 1.7, ease: 'power1.inOut', onUpdate: () => { count.textContent = Math.round(state.v); } }, 0)
      // 2. plan fades, the two halves of the wall slide apart
      .to('.preloader__inner', { opacity: 0, y: -16, duration: 0.5, ease: 'power2.in' }, '>+0.1')
      .to('.preloader__panel--top', { yPercent: -100, duration: 1.2, ease: 'power4.inOut' }, '<+0.15')
      .to('.preloader__panel--bottom', { yPercent: 100, duration: 1.2, ease: 'power4.inOut' }, '<')
      // 3. the photograph opens like a window, settling from a slow zoom
      .to(heroMedia, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.7, ease: 'power4.inOut' }, '<+0.1')
      .to(heroImg, { scale: 1.08, duration: 2.2, ease: 'power3.out' }, '<')
      // 4. type arrives
      .to('.hero__line > span', { yPercent: 0, duration: 1.3, ease: 'power4.out', stagger: 0.14 }, '<+0.8')
      .to('.hero__eyebrow', { opacity: 1, y: 0, duration: 1, ease: 'power3.out' }, '<+0.1')
      .to('.hero__intro', { opacity: 1, y: 0, duration: 1, ease: 'power3.out' }, '<+0.15')
      .to('.hero__actions .btn', { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out', stagger: 0.1 }, '<+0.12')
      .to('.nav', { opacity: 1, duration: 0.9, ease: 'power2.out' }, '<')
      .to('.hero__scroll', { opacity: 1, duration: 0.8 }, '<')
      .to('.hero__plan .dl', { strokeDashoffset: 0, duration: 1.8, ease: 'power2.inOut', stagger: 0.14 }, '<-0.4');
  }

  /* ---------- Hero: scroll + cursor parallax ---------- */
  gsap.to('.hero__media-inner', {
    yPercent: 9, ease: 'none',
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true }
  });
  gsap.to('.hero__content', {
    y: -70, opacity: 0.1, ease: 'none',
    scrollTrigger: { trigger: '.hero', start: '30% top', end: 'bottom top', scrub: true }
  });

  if (window.matchMedia('(hover:hover) and (pointer:fine)').matches) {
    const hero = $('.hero');
    const ix = gsap.quickTo(heroImg, 'x', { duration: 1.2, ease: 'power3' });
    const iy = gsap.quickTo(heroImg, 'y', { duration: 1.2, ease: 'power3' });
    const plan = $('.hero__plan');
    const px = gsap.quickTo(plan, 'x', { duration: 1.4, ease: 'power3' });
    const py = gsap.quickTo(plan, 'y', { duration: 1.4, ease: 'power3' });
    hero.addEventListener('mousemove', (e) => {
      const nx = e.clientX / window.innerWidth - 0.5;
      const ny = e.clientY / window.innerHeight - 0.5;
      ix(nx * -28); iy(ny * -18);
      px(nx * 16); py(ny * 10);
    });
    hero.addEventListener('mouseleave', () => { ix(0); iy(0); px(0); py(0); });

    /* custom cursor: only grows to say "View" over project images */
    const cursor = $('.cursor');
    const cx = gsap.quickTo(cursor, 'x', { duration: 0.45, ease: 'power3' });
    const cy = gsap.quickTo(cursor, 'y', { duration: 0.45, ease: 'power3' });
    window.addEventListener('mousemove', (e) => {
      cursor.classList.add('is-visible');
      cx(e.clientX); cy(e.clientY);
    }, { passive: true });
    document.addEventListener('mouseover', (e) => {
      cursor.classList.toggle('is-view', !!e.target.closest('[data-cursor="view"]'));
    });
    document.addEventListener('mouseleave', () => cursor.classList.remove('is-visible'));
  }

  /* ---------- Headings: words rise out of a mask ---------- */
  $$('[data-split]').forEach((el) => {
    const words = splitWords(el);
    gsap.set(words, { yPercent: 118 });
    ScrollTrigger.create({
      trigger: el, start: 'top 88%', once: true,
      onEnter: () => gsap.to(words, { yPercent: 0, duration: 1.15, ease: 'power4.out', stagger: 0.05 })
    });
  });

  /* ---------- Images: reveal through a clipping mask, then settle ---------- */
  function revealImage(el) {
    const inner = $('.reveal__inner', el);
    const tl = gsap.timeline({
      scrollTrigger: { trigger: el, start: 'top 88%', once: true },
      onComplete: () => gsap.set(el, { clipPath: 'none' })
    });
    tl.fromTo(el, { clipPath: 'inset(0% 0% 100% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.4, ease: 'power4.inOut' })
      .fromTo(inner, { scale: 1.22 }, { scale: 1, duration: 1.8, ease: 'power3.out' }, 0);
  }
  $$('.reveal').forEach(revealImage);

  /* ---------- Fade-up and staggered groups ---------- */
  $$('[data-reveal]').forEach((el) => {
    gsap.fromTo(el, { opacity: 0, y: 28 }, {
      opacity: 1, y: 0, duration: 1, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 90%', once: true }
    });
  });
  $$('[data-stagger]').forEach((group) => {
    gsap.fromTo(group.children, { opacity: 0, y: 34 }, {
      opacity: 1, y: 0, duration: 1, ease: 'power3.out', stagger: 0.12,
      scrollTrigger: { trigger: group, start: 'top 85%', once: true }
    });
  });

  /* ---------- Architectural lines draw themselves ---------- */
  $$('.draw-line').forEach((line) => {
    gsap.fromTo(line, { scaleX: 0 }, {
      scaleX: 1, duration: 1.6, ease: 'power3.inOut',
      scrollTrigger: { trigger: line, start: 'top 92%', once: true }
    });
  });
  $$('.spec__card').forEach((card, i) => {
    gsap.fromTo($$('.dl', card), { strokeDashoffset: 1 }, {
      strokeDashoffset: 0, duration: 1.6, ease: 'power2.inOut', stagger: 0.14, delay: 0.25 + i * 0.05,
      scrollTrigger: { trigger: card, start: 'top 85%', once: true }
    });
  });

  /* ---------- Parallax on selected images ---------- */
  $$('[data-parallax]').forEach((img) => {
    const inBg = !!img.closest('.philosophy__bg');
    gsap.fromTo(img,
      inBg ? { yPercent: -8 } : { yPercent: -6, scale: 1.14 },
      {
        yPercent: inBg ? 8 : 6, ease: 'none',
        scrollTrigger: { trigger: img.parentElement, start: 'top bottom', end: 'bottom top', scrub: true }
      });
  });

  /* ---------- Filter: cards re-enter like a new room ---------- */
  document.addEventListener('projects:filtered', (e) => {
    const items = e.detail.items;
    items.forEach((card) => {
      const r = $('.reveal', card);
      const inner = $('.reveal__inner', card);
      gsap.set(r, { clipPath: 'none' });
      gsap.set(inner, { scale: 1 });
    });
    gsap.fromTo(items, { opacity: 0, y: 36 }, {
      opacity: 1, y: 0, duration: 0.9, ease: 'power3.out', stagger: 0.09, clearProps: 'opacity,transform'
    });
    requestAnimationFrame(() => ScrollTrigger.refresh());
  });

  /* ---------- Project viewer motion ---------- */
  const viewer = $('#viewer');
  const shell = $('.viewer__shell', viewer);
  const vImg = $('.viewer__img', viewer);
  const infoKids = () => $$('.viewer__info > *', viewer);

  viewer.addEventListener('viewer:open', () => {
    gsap.fromTo(shell, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.95, ease: 'power4.inOut' });
    gsap.fromTo(vImg, { scale: 1.12, opacity: 0 }, { scale: 1, opacity: 1, duration: 1.4, ease: 'power3.out', delay: 0.35 });
    gsap.fromTo(infoKids(), { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', stagger: 0.07, delay: 0.55 });
  });
  viewer.addEventListener('viewer:change', () => {
    gsap.fromTo(vImg, { opacity: 0, scale: 1.05 }, { opacity: 1, scale: 1, duration: 0.9, ease: 'power3.out' });
    gsap.fromTo(infoKids(), { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', stagger: 0.05 });
  });
  P.animateViewerOut = (done) => {
    gsap.to(shell, {
      clipPath: 'inset(0% 0% 100% 0%)', duration: 0.75, ease: 'power4.inOut',
      onComplete: () => { done(); gsap.set(shell, { clearProps: 'clipPath' }); }
    });
  };

  /* ---------- Section transitions: a wall slides across, we arrive in the next room ---------- */
  const curtain = $('.curtain');
  let busy = false;
  P.goTo = (hash) => {
    const target = $(hash);
    if (!target || busy) return;
    busy = true;
    lenis.stop();
    const arrive = () => {
      lenis.start();
      lenis.scrollTo(target, { immediate: true, force: true });
      ScrollTrigger.update();
      target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
      history.replaceState(null, '', hash);
    };
    gsap.timeline({ onComplete: () => { busy = false; } })
      .set(curtain, { visibility: 'visible', yPercent: 100 })
      .to(curtain, { yPercent: 0, duration: 0.65, ease: 'power3.inOut' })
      .add(arrive)
      .to(curtain, { yPercent: -100, duration: 0.8, ease: 'power3.inOut' }, '+=0.12')
      .set(curtain, { visibility: 'hidden', yPercent: 100 });
  };

  /* ---------- Keep triggers accurate as media and fonts settle ---------- */
  window.addEventListener('load', () => ScrollTrigger.refresh());
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => ScrollTrigger.refresh());

  intro();
})();
