# Recipe: the scroll journey

An immersive, pinned, scroll-driven story where the visitor travels through a subject. Reference implementation: [`examples/cosmos-journey/`](../../examples/cosmos-journey/) (a trip from Earth orbit to the edge of the visible universe, with real NASA media).

Use it when the subject has a natural **sequence of places, scales, or stages** and strong real imagery: space, the ocean from surface to trench, the human body from skin to cell, a product's journey, a city's history. Do **not** use it for a simple brochure site, a shop, or anything where visitors need to scan quickly. See Section 12 of the master prompt for stack choice; this pattern is plain HTML, CSS, and JavaScript with no libraries.

## The idea in one paragraph

The page is a stack of tall sections. Inside each, a full-screen "stage" is pinned while you scroll. The stage holds a media layer (photo or looping video), a dark scrim, and several **beats**: text or tool blocks that fade in and out at chosen points of the section's scroll progress. One scroll position drives everything: media zoom, beat visibility, a distance readout, and the starfield. Between stops the readout "travels" and the starfield streaks.

## Structure

```html
<section class="ch" style="--h:340" data-dist="384400" data-name="The Moon">   <!-- --h = scroll length in vh -->
  <div class="ch__pin">                                                        <!-- sticky, 100dvh, overflow hidden -->
    <div class="ch__media" data-media><img|video ...></div>                    <!-- scaled and drifted by progress -->
    <div class="ch__shade"></div>                                              <!-- scrim for text legibility -->
    <div class="beat" data-a="-1"  data-b="0.36"> headline ... </div>         <!-- visible while a <= p <= b -->
    <div class="beat" data-a="0.30" data-b="0.70"> facts ... </div>
    <div class="beat" data-a="0.64" data-b="2">    interactive tool ... </div> <!-- b=2 means: stay until the end -->
  </div>
</section>
```

CSS: `html.js .ch{height:calc(var(--h)*1vh)}`, `html.js .ch__pin{position:sticky;top:0;height:100dvh;overflow:hidden}`. Without JS everything is ordinary stacked content. Always keep that fallback.

## The scroll engine

One `scroll` listener schedules one `requestAnimationFrame`. For each visible chapter:

```js
const r = chapter.getBoundingClientRect();
const p = clamp(-r.top / (r.height - innerHeight));            // 0..1 progress through this chapter
media.style.setProperty('--s', 1.05 + p * .13);                 // slow zoom; also --y for a slight drift
for (const beat of beats) {
  const inn = a < 0 ? 1 : seg(p, a, a + .07);                    // fade in over 7% of the chapter
  const out = b > 1.5 ? 1 : seg(b - p, 0, .07);                  // fade out likewise
  const op = Math.min(inn, out);                                 // opacity, visibility, small translateY
  beat.classList.toggle('live', op > .35);                       // 'live' triggers word-by-word headline reveals
}
```

Rules that matter:
- A full-screen beat sits above the stage, so make it `pointer-events:none` and re-enable only its interactive children, or it will block cursor effects underneath.
- Never let a beat's content exceed the stage. Test it (see QA below).
- Give every beat a clear job: headline, facts, or a tool. Keep each to one idea.

## The distance readout (the "you are travelling" feel)

Give each chapter a distance. Hold the readout at the chapter's own distance for the first 80% of its scroll, then interpolate to the next chapter's distance on a **log scale** over the last 20%:

```js
const travel = seg(p, .8, 1);
lnTarget = lerp(Math.log(dist[k]), Math.log(dist[k + 1]), ease(travel));
lnShown += (lnTarget - lnShown) * .14;                           // smooth every frame
```

Format the value by size (km, million km, light-years, billion light-years) and derive a second line from it (light travel time, depth pressure, scale in cells). While `travel > 0.04`, change the label to "Heading to <next stop>".

## The starfield and warp

A fixed full-screen `<canvas>` behind everything: 200 to 430 dots with random depth `z`. Each frame smooth the scroll velocity (`vel += (dy - vel) * .22; vel *= .9`). Dots drift by `vel * z`; when `|vel|` is large, draw each dot as a vertical streak of length `min(|vel| * .9, 160) * z`. Add a small horizontal parallax from the pointer. Stop animating when the user pauses motion or prefers reduced motion.

## Horizontal fly-by (e.g. the planets)

Inside one pinned stage, put a flex row wider than the screen and translate it: `x = -seg(p, .03, .97) * (track.scrollWidth - innerWidth)`. **Use a linear mapping.** An ease-in-out curve lingers on the first panel and sprints past the middle ones, so visitors miss half the content. On screens under 900px, drop the pin and stack the panels vertically.

## Particle galaxy you can stir

About 15,000 points on desktop (4,800 on mobile) on a 2D canvas. Spiral: `theta = armOffset + 3.2 * ln(r / .1) + noise`. Differential rotation: `omega = .035 / (.25 + r)`. Cursor push within 120px: `force = (1 - d / radius)^2 * 2.4`; each point then springs home (`v -= offset * .018; v *= .92`). Draw with `globalCompositeOperation = 'lighter'` so dense areas glow. Run the loop only while the canvas is on screen.

## Video handling

- Only the hero video autoplays. Others use `preload="none"`, and an IntersectionObserver plays them when the chapter is near the viewport and pauses them otherwise.
- Give every video a poster image.
- Prepare clips with `scripts/media/webcraft_media.py`: scan for black openings, burned-in captions, and fades; cut a clean stretch; boomerang short clips for a seamless loop.
- Text over bright footage needs a strong scrim. The hero used a top-to-bottom gradient from 92% black to 10% black plus a moved-down media box so the bright limb sits below the headline.

## Accessibility and fallbacks

- No JS: ordinary stacked sections, all content visible.
- `prefers-reduced-motion`: add `html.calm`: no pinning, beats stacked and fully visible, planets stacked, videos paused, starfield static.
- A visible "Pause motion" button that pauses videos and the starfield.
- A skip link, real buttons, alt text on every photo, and visible focus rings.
- Credits for every real asset in the footer, generated from the media manifest.

## Mobile rules

- Keep the pin. Shrink tools instead: the life-cycle stage list becomes a horizontal swipe row, art panels get shorter, the readout gets a dark gradient backdrop, tap targets stay at least 40px.
- Verify with the QA snippet at 360 by 640, 390 by 844, and 1366 by 700.

## QA

`scripts/qa/beat-fit.js` is a paste-in browser-console snippet. It forces each beat visible and reports whether its content fits between the top bar and the readout. Run it at each size above. Also:
- Bring the browser tab to the front and wait before judging a frame; throttled tabs stall the animation loop.
- Screenshots can lag one step behind. Take a second capture, or measure rectangles and computed styles instead.
- Scan every video with `webcraft_media.py scan --sheet` and look at the frames.

## Adapting it to another subject

| Subject | Chapters | The readout shows |
|---|---|---|
| The ocean | Surface, sunlit zone, twilight zone, midnight zone, trench | Depth in metres, pressure, light remaining |
| The human body | Skin, tissue, cell, nucleus, DNA | Scale in metres, number of cells |
| A city's history | Founding, trade, industry, today | Year, population |
| A product's origin | Field, factory, port, shop, home | Kilometres travelled, days in transit |

Change the chapters, the `data-dist` values and formatters, the media plan, and the copy. Keep the engine.
