// Paste into the browser console (or run through a browser tool) on a scroll-journey page.
// Forces every scene beat visible in turn and reports whether its content fits between the
// fixed top bar and the bottom distance readout. Run at 360x640, 390x844 and 1366x700.
// IMPORTANT: bring the tab to the front first. Background tabs throttle animation frames.
(async () => {
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const vh = innerHeight;
  const TOP = 56;           // space reserved for the fixed top bar
  const BOTTOM = innerWidth < 900 ? 74 : 60;   // space reserved for the readout
  await wait(800);
  document.documentElement.style.scrollBehavior = 'auto';
  const rows = [];
  for (const beat of document.querySelectorAll('.beat')) {
    const chapter = beat.closest('.ch');
    const pin = chapter.querySelector('.ch__pin');
    const top = chapter.getBoundingClientRect().top + scrollY;
    scrollTo({ top: top + (chapter.offsetHeight - vh) * 0.5, behavior: 'instant' });
    await wait(250);
    const old = { o: beat.style.opacity, v: beat.style.visibility, t: beat.style.transform, l: beat.classList.contains('live') };
    beat.style.opacity = 1; beat.style.visibility = 'visible'; beat.style.transform = 'none'; beat.classList.add('live');
    await wait(120);
    const pr = pin.getBoundingClientRect();
    let lo = 1e9, hi = -1e9;
    for (const el of beat.children) {
      const r = el.getBoundingClientRect();
      if (r.height > 0) { lo = Math.min(lo, r.top - pr.top); hi = Math.max(hi, r.bottom - pr.top); }
    }
    const name = (beat.querySelector('h1,h2,h3') || beat).textContent.trim().slice(0, 28);
    const okTop = lo >= TOP, okBottom = hi <= vh - BOTTOM;
    rows.push((okTop && okBottom ? 'OK  ' : 'FIX ') + chapter.id + ' "' + name + '" ' + Math.round(lo) + '..' + Math.round(hi) +
      (okBottom ? '' : '  overflows bottom by ' + Math.round(hi - (vh - BOTTOM)) + 'px') + (okTop ? '' : '  hidden under the top bar'));
    beat.style.opacity = old.o; beat.style.visibility = old.v; beat.style.transform = old.t; if (!old.l) beat.classList.remove('live');
  }
  const out = 'viewport ' + innerWidth + 'x' + vh + '  horizontal overflow: ' + (document.documentElement.scrollWidth > document.documentElement.clientWidth) + '\n' + rows.join('\n');
  console.log(out);
  return out;
})();
