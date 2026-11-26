# cosmos-journey: reference implementation of the scroll journey

"Farfield": an immersive guide that takes a visitor from Earth orbit to the edge of the visible universe, using real NASA photographs and footage. It demonstrates the pattern in [docs/recipes/scroll-journey.md](../../docs/recipes/scroll-journey.md).

The prepared NASA photos and videos are included in `assets/` (about 14 MB), so it runs as it is. It also appears in the [showcase](../../showcase/).

## Run it

```
cd examples/cosmos-journey
python -m http.server 8000      # visit http://localhost:8000
```

## Rebuild the media yourself (optional)

`media-plan.json` records the exact NASA IDs and clip windows. To regenerate every asset from NASA's library (needs Python 3.9+, Pillow, and ffmpeg; downloads about 135 MB of source video):

```
python scripts/media/webcraft_media.py build examples/cosmos-journey/media-plan.json --out examples/cosmos-journey
```

Fonts load from Google Fonts. Offline, the page falls back to system fonts.

## What to study in it

| File | Look at |
|---|---|
| `index.html` | Chapters (`.ch`), the pinned stage (`.ch__pin`), and beats (`data-a`, `data-b`) |
| `styles.css` | Pin and fallback rules (`html.js`, `html.calm`), scrims, the mobile block at 900px and 560px |
| `app.js` | Scroll engine (`update`), distance readout (`fmtDist`, `fmtLight`), starfield, horizontal track, galaxy particles, quiz, credits |
| `media-plan.json` | Exact NASA IDs and the clip windows chosen after scanning, including a boomerang loop |

## Adapting it

Keep the engine and change the subject: new chapters and distances, a new media plan, new copy. Do not reuse this site's text, name, or palette in an unrelated project.

## Credits and licence

Media comes from NASA's public image and video library and is credited in the page footer. NASA does not endorse this site. Astronomy figures are rounded and written from general knowledge; verify them against NASA and ESA before publishing. Not tested on tablets, Safari, Firefox, or screen readers.
