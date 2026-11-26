# Fathom: a guided descent into the ocean

A static website (plain HTML, CSS and JavaScript, no build step, no libraries).

## See it
Open a terminal in this folder and run `python -m http.server 8000`, then visit http://localhost:8000.
(Opening index.html by double-click also works for most things, but videos and fonts load more reliably from a server.)

## Change things
- Text: edit `index.html`. Each stop on the descent is a `<section class="ch">`; each screen of text inside it is a `<div class="beat">`.
- Colours and fonts: the top of `styles.css` (`:root`).
- Photos and videos: files in `assets/`. Credits for every file are in `assets/manifest.json` and in the footer of `index.html`. Keep them in step if you swap a file.
- Quiz questions: the `Q` list in `app.js`.

## Put it online
Upload this whole folder to any static host (Netlify Drop, Cloudflare Pages, GitHub Pages).

## Notes
There are no forms, accounts or tracking. Fonts load from Google Fonts; offline it falls back to system fonts.
