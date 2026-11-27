// WEBCraft page audit. Paste into the browser console, or run through any browser tool, at each QA viewport
// (scripts/qa/viewports.json). It MEASURES; it does not judge design. Bring the tab to the front first.
// Returns { viewport, blocking: [...], warnings: [...], info: {...} } and logs a readable report.
// Blocking items must be fixed before delivery. It does not replace a full accessibility audit.
(async () => {
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  await wait(300);
  const doc = document.documentElement;
  const blocking = [], warnings = [], info = {};
  const label = (el) => (el.id ? "#" + el.id : el.tagName.toLowerCase() + (el.className && typeof el.className === "string" ? "." + el.className.trim().split(/\s+/)[0] : ""));
  const visible = (el) => { const r = el.getBoundingClientRect(), cs = getComputedStyle(el); return r.width > 0 && r.height > 0 && cs.visibility !== "hidden" && cs.display !== "none"; };
  const accName = (el) => (el.getAttribute("aria-label") || (el.getAttribute("aria-labelledby") || "").split(" ").map((id) => document.getElementById(id)?.textContent || "").join(" ") || el.textContent || el.getAttribute("title") || [...el.querySelectorAll("img[alt]")].map((i) => i.alt).join(" ") || el.value || "").trim();

  // Layout
  if (doc.scrollWidth > doc.clientWidth + 1) {
    const wide = [...document.body.querySelectorAll("*")].filter((el) => { const r = el.getBoundingClientRect(); return r.right > doc.clientWidth + 1 && r.width > 0 && getComputedStyle(el).position !== "fixed"; }).slice(0, 5).map(label);
    blocking.push("Horizontal overflow: page is " + doc.scrollWidth + "px wide in a " + doc.clientWidth + "px viewport. Widest offenders: " + wide.join(", "));
  }

  // Media
  const broken = [...document.images].filter((i) => i.complete && i.naturalWidth === 0 && i.currentSrc).map((i) => i.currentSrc.split("/").pop());
  if (broken.length) blocking.push("Broken images: " + broken.join(", "));
  const badVideo = [...document.querySelectorAll("video")].filter((v) => v.error).map((v) => (v.currentSrc || "video").split("/").pop());
  if (badVideo.length) blocking.push("Videos failed to load: " + badVideo.join(", "));
  const noAlt = [...document.images].filter((i) => !i.hasAttribute("alt")).map((i) => (i.currentSrc || i.src).split("/").pop());
  if (noAlt.length) blocking.push("Images without an alt attribute (use alt=\"\" for decorative ones): " + noAlt.slice(0, 8).join(", "));

  // Document and SEO basics
  if (!document.title.trim()) blocking.push("Missing <title>.");
  if (!doc.lang) warnings.push("Missing lang attribute on <html>.");
  if (!document.querySelector('meta[name="viewport"]')) blocking.push("Missing <meta name=\"viewport\">.");
  if (!document.querySelector('meta[name="description"]')?.content?.trim()) warnings.push("Missing meta description.");
  if (!document.querySelector('meta[property="og:title"]')) warnings.push("No Open Graph title (og:title) for link previews.");

  // Headings and landmarks
  const h1s = document.querySelectorAll("h1").length;
  if (h1s !== 1) warnings.push("Expected exactly one <h1>, found " + h1s + ".");
  let prev = 0; const skips = [];
  for (const h of document.querySelectorAll("h1,h2,h3,h4,h5,h6")) { const lvl = +h.tagName[1]; if (prev && lvl > prev + 1) skips.push(h.tagName + " after H" + prev + ' ("' + h.textContent.trim().slice(0, 30) + '")'); prev = lvl; }
  if (skips.length) warnings.push("Heading levels skip: " + skips.slice(0, 5).join("; "));
  if (!document.querySelector("main,[role=main]")) warnings.push("No <main> landmark.");

  // Controls, links and calls to action
  const deadLinks = [...document.querySelectorAll("a")].filter((a) => { const h = a.getAttribute("href"); return h === null || h === "" || h === "#" || /^javascript:/i.test(h); }).filter((a) => !a.getAttribute("role")).map((a) => '"' + a.textContent.trim().slice(0, 30) + '"');
  if (deadLinks.length) blocking.push("Links with no real destination (href missing, empty, \"#\" or javascript:): " + deadLinks.slice(0, 8).join(", "));
  const unnamed = [...document.querySelectorAll("a[href],button,[role=button],input[type=submit],input[type=button]")].filter(visible).filter((el) => !accName(el)).map(label);
  if (unnamed.length) blocking.push("Links or buttons with no accessible name: " + unnamed.slice(0, 8).join(", "));
  const unlabeled = [...document.querySelectorAll("input:not([type=hidden]):not([type=submit]):not([type=button]),select,textarea")].filter((el) => !(el.labels && el.labels.length) && !el.getAttribute("aria-label") && !el.getAttribute("aria-labelledby")).map(label);
  if (unlabeled.length) blocking.push("Form fields without a label: " + unlabeled.join(", "));
  const small = [...document.querySelectorAll("a[href],button,input,select,textarea,[role=button]")].filter(visible).filter((el) => { const r = el.getBoundingClientRect(); return (r.width < 24 || r.height < 24) && getComputedStyle(el).display !== "inline"; }).map(label);
  if (small.length) warnings.push("Targets smaller than 24×24px (WCAG 2.2 minimum; aim for 44px on touch): " + small.slice(0, 8).join(", "));
  // Focus styles: scripted focus does not trigger :focus-visible, so inspect the style rules instead.
  let focusRules = 0, outlineRemoved = 0;
  const scan = (rules) => { for (const r of rules) { if (r.cssRules) scan(r.cssRules); const sel = r.selectorText || ""; if (/:focus/.test(sel)) focusRules++; else if (r.style && /^(none|0(px)?)$/.test(r.style.outlineStyle || r.style.outline || "") && /\b(a|button|input)\b|\*/.test(sel)) outlineRemoved++; } };
  for (const s of document.styleSheets) { try { scan(s.cssRules); } catch (e) { /* cross-origin sheet */ } }
  info.focusRules = focusRules;
  if (!focusRules && outlineRemoved) blocking.push("Focus outline is removed on links or buttons and no :focus/:focus-visible style replaces it.");
  else if (!focusRules) warnings.push("No custom :focus or :focus-visible styles; the browser default outline is relied on. Check it is visible on every background by tabbing.");

  // Content integrity
  const placeholders = [...document.querySelectorAll("[data-placeholder]")].map((el) => el.getAttribute("data-placeholder") || el.textContent.trim().slice(0, 40));
  info.placeholders = placeholders;
  if (placeholders.length) warnings.push(placeholders.length + " marked placeholder(s) still on the page; list them in the delivery report: " + placeholders.slice(0, 8).join(", "));
  const filler = document.body.innerText.match(/lorem ipsum|your tagline here|feature \d\b|\bTODO\b/i);
  if (filler) blocking.push('Filler text found: "' + filler[0] + '".');

  // Motion and fonts
  let rm = false;
  for (const s of document.styleSheets) { try { if ([...s.cssRules].some((r) => r.media && /prefers-reduced-motion/.test(r.media.mediaText))) rm = true; } catch (e) { /* cross-origin sheet */ } }
  info.reducedMotionCSS = rm;
  if (!rm && !doc.className.match(/calm|reduce/)) warnings.push("No prefers-reduced-motion CSS rule found (fine only if the page has no motion or handles it in JavaScript).");
  try { await document.fonts.ready; info.fontsLoaded = [...new Set([...document.fonts].filter((f) => f.status === "loaded").map((f) => f.family.replace(/"/g, "")))]; } catch (e) { /* ignore */ }

  const out = { viewport: innerWidth + "x" + innerHeight, url: location.pathname, blocking, warnings, info };
  console.log("WEBCraft page audit " + out.viewport + " " + out.url + "\nBLOCKING (" + blocking.length + ")\n  " + (blocking.join("\n  ") || "none") + "\nWARNINGS (" + warnings.length + ")\n  " + (warnings.join("\n  ") || "none"));
  return out;
})();
