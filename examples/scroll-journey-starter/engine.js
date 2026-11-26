/* Scroll-journey engine, minimal. About 80 lines, no libraries.
   Markup contract (see index.html):
     .ch[style="--h:300"][data-value][data-label]   a chapter; --h is its scroll length in vh
       .ch__pin                                      the pinned 100dvh stage
         .ch__media                                  image/video layer, zoomed by progress
         .beat[data-a][data-b]                       visible while data-a <= progress <= data-b (b=2: until the end)
   Add class "calm" to <html> (done automatically for prefers-reduced-motion) for a static, stacked layout. */
(function () {
  'use strict';
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
  const seg = (p, a, b) => clamp((p - a) / (b - a));
  const ease = (t) => (t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const root = document.documentElement;
  root.classList.add('js');
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) root.classList.add('calm');
  const calm = () => root.classList.contains('calm');

  const chapters = $$('.ch').map((el) => ({
    el, media: el.querySelector('.ch__media'), beats: $$('.beat', el),
    value: parseFloat(el.dataset.value), label: el.dataset.label || '', vid: el.querySelector('video'),
  }));

  // Play a chapter's video only while it is near the viewport.
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((es) => es.forEach((e) => {
      const c = chapters.find((c) => c.el === e.target);
      if (!c || !c.vid) return;
      if (e.isIntersecting && !calm()) c.vid.play().catch(() => {}); else c.vid.pause();
    }), { rootMargin: '25% 0px' });
    chapters.forEach((c) => io.observe(c.el));
  }

  // Readout: hold each chapter's own value for 80% of its scroll, then travel to the next value on a log scale.
  const readout = document.getElementById('readout');
  let shown = Math.log(chapters[0].value || 1), target = shown;
  const fmt = (v) => (v >= 100 ? Math.round(v).toLocaleString('en-US') : v.toFixed(1));

  let ticking = false;
  function update() {
    ticking = false;
    const vh = innerHeight;
    let cur = 0, curP = 0;
    chapters.forEach((c, i) => {
      const r = c.el.getBoundingClientRect();
      const p = clamp(-r.top / Math.max(1, r.height - vh));
      if (r.top <= vh * .5) { cur = i; curP = p; }
      if (calm() || r.bottom < -vh * .25 || r.top > vh * 1.25) return;
      if (c.media) { c.media.style.setProperty('--s', (1.05 + p * .13).toFixed(4)); c.media.style.setProperty('--y', (-p * 3).toFixed(3)); }
      c.beats.forEach((b) => {
        const a = parseFloat(b.dataset.a), z = parseFloat(b.dataset.b);
        const inn = a < 0 ? 1 : seg(p, a, a + .07), out = z > 1.5 ? 1 : seg(z - p, 0, .07), op = Math.min(inn, out);
        b.style.opacity = op.toFixed(3);
        b.style.transform = 'translate3d(0,' + ((1 - op) * (inn < out ? 24 : -24)).toFixed(1) + 'px,0)';
        b.style.visibility = op > .015 ? 'visible' : 'hidden';
        b.classList.toggle('live', op > .35);          // 'live' triggers headline word reveals in CSS
      });
    });
    const next = chapters[Math.min(cur + 1, chapters.length - 1)];
    const travel = cur < chapters.length - 1 ? seg(curP, .8, 1) : 0;
    target = Math.log(chapters[cur].value) + (Math.log(next.value) - Math.log(chapters[cur].value)) * ease(travel);
    if (readout) readout.dataset.label = travel > .04 ? 'Heading to ' + next.label : chapters[cur].label;
  }
  const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll);

  (function loop() {
    shown += (target - shown) * .14;
    if (readout) { readout.querySelector('b').textContent = fmt(Math.exp(shown)); readout.querySelector('span').textContent = readout.dataset.label || ''; }
    requestAnimationFrame(loop);
  })();
  update();
})();
