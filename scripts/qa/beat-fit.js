// Scroll-journey fit check. Paste into the browser console (or run through a browser tool).
// Forces every scene beat visible in turn and reports whether its content fits between the
// fixed top bar and the bottom readout. Run it at 360x640, 390x844 and 1366x700.
//
// IMPORTANT: bring the tab to the front first. Background tabs throttle animation frames.
//
// It expects this markup (the recipe's default): .ch > .ch__pin > .beat. If your site uses other
// class names, or you need different reserved space, set options BEFORE pasting the script:
//   window.BEATFIT = { chapter: '.stop', pin: '.stage', beat: '.scene', top: 72, bottom: 96 };
(async () => {
  const o = Object.assign({ chapter: '.ch', pin: '.ch__pin', beat: '.beat', top: 56, bottom: null, live: 'live' }, window.BEATFIT || {});
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const vh = innerHeight;
  const TOP = o.top;                                   // space reserved for the fixed top bar
  const BOTTOM = o.bottom ?? (innerWidth < 900 ? 74 : 60);   // space reserved for the readout
  const beats = document.querySelectorAll(o.beat);
  if (!beats.length) { const m = 'No elements match "' + o.beat + '". Set window.BEATFIT = { beat, chapter, pin } first.'; console.warn(m); return m; }
  await wait(800);
  document.documentElement.style.scrollBehavior = 'auto';
  const rows = [];
  for (const beat of beats) {
    const chapter = beat.closest(o.chapter);
    const pin = (chapter && chapter.querySelector(o.pin)) || chapter;
    if (!chapter) { rows.push('SKIP a beat that is not inside "' + o.chapter + '"'); continue; }
    const top = chapter.getBoundingClientRect().top + scrollY;
    scrollTo({ top: top + (chapter.offsetHeight - vh) * 0.5, behavior: 'instant' });
    await wait(250);
    const old = { o: beat.style.opacity, v: beat.style.visibility, t: beat.style.transform, l: beat.classList.contains(o.live) };
    beat.style.opacity = 1; beat.style.visibility = 'visible'; beat.style.transform = 'none'; beat.classList.add(o.live);
    await wait(120);
    const pr = pin.getBoundingClientRect();
    let lo = 1e9, hi = -1e9;
    for (const el of beat.children) {
      const r = el.getBoundingClientRect();
      if (r.height > 0) { lo = Math.min(lo, r.top - pr.top); hi = Math.max(hi, r.bottom - pr.top); }
    }
    const name = (beat.querySelector('h1,h2,h3') || beat).textContent.trim().slice(0, 28);
    const okTop = lo >= TOP, okBottom = hi <= vh - BOTTOM;
    rows.push((okTop && okBottom ? 'OK  ' : 'FIX ') + (chapter.id || '?') + ' "' + name + '" ' + Math.round(lo) + '..' + Math.round(hi) +
      (okBottom ? '' : '  overflows bottom by ' + Math.round(hi - (vh - BOTTOM)) + 'px') + (okTop ? '' : '  hidden under the top bar'));
    beat.style.opacity = old.o; beat.style.visibility = old.v; beat.style.transform = old.t; if (!old.l) beat.classList.remove(o.live);
  }
  const out = 'viewport ' + innerWidth + 'x' + vh + '  horizontal overflow: ' + (document.documentElement.scrollWidth > document.documentElement.clientWidth) + '\n' + rows.join('\n');
  console.log(out);
  return out;
})();
