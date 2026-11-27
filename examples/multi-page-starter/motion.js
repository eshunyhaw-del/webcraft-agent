// WEBCraft motion kit. Plain JavaScript, no libraries. Pair with motion.css.
// Content is fully visible without JavaScript and for visitors who prefer reduced motion.
//
//   data-animate="fade-up | fade | zoom | mask | slide-left | slide-right"   reveal once when scrolled into view
//   data-stagger="fade-up"            children reveal one after another (cards, lists, galleries)
//   data-split                        a headline rises in word by word
//   data-count                        a number counts up from 0 to the value written in it ("82%", "2,400")
//   data-parallax="0.12"              an image drifts gently while scrolling (wide screens only)
//   data-delay="200"                  extra delay in milliseconds for one element
// Page-to-page fades come from CSS (@view-transition in motion.css).
(() => {
  const root = document.documentElement;
  if (matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) {
    root.classList.add("motion-off");
    return;
  }
  root.classList.add("motion-on");

  // Staggered children inherit the parent's animation and a growing delay.
  document.querySelectorAll("[data-stagger]").forEach((parent) => {
    [...parent.children].forEach((child, i) => {
      if (!child.dataset.animate) child.dataset.animate = parent.dataset.stagger || "fade-up";
      child.style.setProperty("--motion-delay", i * 90 + "ms");
    });
  });
  document.querySelectorAll("[data-delay]").forEach((el) => el.style.setProperty("--motion-delay", el.dataset.delay + "ms"));

  // Split headlines into words that rise in turn.
  document.querySelectorAll("[data-split]").forEach((el) => {
    const words = el.textContent.trim().split(/\s+/);
    el.setAttribute("aria-label", el.textContent.trim());
    el.innerHTML = words.map((w, i) => `<span class="motion-word" aria-hidden="true" style="--i:${i}">${w}</span>`).join(" ");
  });

  // Count numbers up once visible, keeping prefixes and suffixes ("82%", "128,000", "2 in 5" is left alone).
  const counters = [...document.querySelectorAll("[data-count]")];
  const countUp = (el) => {
    const m = el.textContent.trim().match(/^([^\d]*)([\d,]*\.?\d+)(.*)$/);
    if (!m || /\d\s+\D+\s+\d/.test(el.textContent)) return;
    const [, pre, num, post] = m;
    const target = parseFloat(num.replace(/,/g, ""));
    const decimals = (num.split(".")[1] || "").length;
    const fmt = (v) => pre + v.toLocaleString("en", { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) + post;
    const start = performance.now(), dur = 1400;
    const tick = (t) => {
      const p = Math.min(1, (t - start) / dur), eased = 1 - Math.pow(1 - p, 3);
      el.textContent = fmt(target * eased);
      if (p < 1) requestAnimationFrame(tick); else el.textContent = fmt(target);
    };
    requestAnimationFrame(tick);
  };

  const targets = [...document.querySelectorAll("[data-animate], [data-split], [data-count]")];
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      // Reveal when visible, or at once if the visitor has already scrolled or jumped past it.
      if (!e.isIntersecting && e.boundingClientRect.top >= 0) continue;
      e.target.classList.add("is-in");
      if (e.target.hasAttribute("data-count") && e.isIntersecting) countUp(e.target);
      io.unobserve(e.target);
    }
  }, { threshold: 0.15, rootMargin: "0px 0px -6% 0px" });
  targets.forEach((el) => io.observe(el));

  // Gentle parallax on wide screens. Transform only, one animation frame per scroll.
  const layers = [...document.querySelectorAll("[data-parallax]")];
  if (layers.length) {
    const wide = matchMedia("(min-width: 64rem)");
    let ticking = false;
    const update = () => {
      ticking = false;
      const vh = innerHeight;
      for (const el of layers) {
        if (!wide.matches) { el.style.transform = ""; continue; }
        const r = el.parentElement.getBoundingClientRect();
        if (r.bottom < 0 || r.top > vh) continue;
        const shift = (r.top + r.height / 2 - vh / 2) * -(parseFloat(el.dataset.parallax) || 0.1);
        el.style.transform = `translate3d(0, ${shift.toFixed(1)}px, 0) scale(1.08)`;
      }
    };
    addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    addEventListener("resize", update);
    update();
  }
})();
