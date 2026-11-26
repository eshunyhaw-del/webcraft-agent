# Showcase: sites built with WEBCraft

Real websites built with this repository, kept here so you can see what it produces. Each one started from a one-line brief from a non-technical user.

| Site | Brief | How it was built | Folder |
|---|---|---|---|
| **Fathom**, a guided descent into the ocean | "Build me a website that talks about the ocean… educate people… immersive, with real photos and videos." | An AI agent given **only a fresh clone of this repository** (no other help). It followed the master prompt, used the scroll-journey recipe, the media tool, and the QA snippet, and sourced media from Wikimedia Commons. | [`fathom-ocean/`](fathom-ocean/) |
| **Farfield**, a journey outward through the universe | "A website about astronomy and space… educate people… multi-purpose", then "more immersive, with real space pictures and videos." | Built in a WEBCraft session with real NASA photographs and footage, cleaned and trimmed with the media tool. It is also the repository's reference implementation. | [`../examples/cosmos-journey/`](../examples/cosmos-journey/) |
| **Farfield, first build** | The same space brief. | Built with only the MotionSites Web Builder skill, before the immersive version. A single `index.html`. | [`farfield-first-build/`](farfield-first-build/) |

All three follow the project owner's standing design rules (master prompt Section 3.4): no eyebrow labels above headings, no decorative numbering, no small captions or microcopy. Credits for every photo and video are in each site's footer.

## View them

From the repository root, start any static server and open the links:

```
python -m http.server 8000
```

- Fathom: http://localhost:8000/showcase/fathom-ocean/
- Farfield: http://localhost:8000/examples/cosmos-journey/
- Farfield, first build: http://localhost:8000/showcase/farfield-first-build/

Opening `index.html` straight from the file system mostly works too, but a local server is more reliable for video. Fonts load from Google Fonts.

## Licences of the media

The **code** in these folders is MIT, like the rest of the repository. The **photographs and videos are not**: each keeps its own licence.

- **Farfield** uses NASA media from the NASA Image and Video Library. NASA material is generally not subject to copyright in the United States, but NASA does not endorse these sites. One clip includes ESA imagery (credited ESA/NASA/JPL-Caltech). Every item, with its source page, is listed in `examples/cosmos-journey/assets/manifest.json`.
- **Fathom** uses media from Wikimedia Commons under each file's own licence: public domain, CC0, CC BY 3.0, CC BY 4.0, and CC BY-SA 4.0. Every item, its creator, its licence, and its source page are listed in `fathom-ocean/assets/manifest.json` and in the site footer. Videos were trimmed, re-encoded, and in some cases cropped; photos were resized. The resized manta ray photo (by Daniel Sasse) is CC BY-SA 4.0 and remains under that licence. If you reuse any of these files, keep their credits and follow their licences.
- **Farfield, first build** streams one background video from the MotionSites media shelf (copyright MotionSites, usable in sites built with their skill). The video is not stored in this repository.

## Honest notes

- Facts on these pages were written from general knowledge and rounded. They were not checked line by line against NASA, ESA, or NOAA. Verify before reusing them.
- Tested in a desktop browser at 1366 by 700 and, for the immersive sites, at phone sizes during development. Not tested on Safari, Firefox, real phones, tablets, or screen readers.
- Two of Fathom's video clips come from 640 by 360 sources and look soft at full screen.
