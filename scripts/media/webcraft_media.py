#!/usr/bin/env python3
"""WEBCraft media tool: find, fetch, clean, and prepare real photographs and video for a website.

Sources (official APIs only; no page scraping):
  nasa       NASA Image and Video Library, https://images.nasa.gov   (space, Earth observation, aircraft). No key.
  commons    Wikimedia Commons, https://commons.wikimedia.org        (nature, ocean, cities, people, history). No key.
  openverse  Openverse, https://openverse.org                         (openly licensed images from Flickr, museums and
             more; images only). No key.
  unsplash   Unsplash, https://unsplash.com     (high-quality stock photos; images only). Key: UNSPLASH_ACCESS_KEY.
  pexels     Pexels, https://www.pexels.com     (stock photos and videos). Key: PEXELS_API_KEY.
  pixabay    Pixabay, https://pixabay.com       (stock photos and videos). Key: PIXABAY_API_KEY.
  Keys are free from each site's developer page. Commons and Openverse files carry their own licences, which the
  tool records: CC BY needs attribution, CC BY-SA also needs share-alike, CC0 and public domain are the easiest.
  Unsplash, Pexels and Pixabay licences allow free commercial use without attribution (crediting is still polite).

Requires: Python 3.9+, ffmpeg and ffprobe on PATH (for video), Pillow (pip install pillow) for images.

Commands
  search  "query" [--source nasa|commons|openverse|unsplash|pexels|pixabay] [--type image|video] [--n 10]
                                                        List matches with IDs, licence and creator.
  scan    video [--window 12] [--sheet out.jpg]         Brightness per second, best clean window, optional frame sheet.
  cut     in out.mp4 --start S --dur D [...]            Trim, remove audio, compress, optional --boomerang loop and
                                                        --crop-bottom PERCENT (to remove a burned-in caption) or --crop W:H:X:Y.
  build   plan.json --out DIR                           Download and prepare everything listed in a media plan.

A plan item may be {"source": "commons", "title": "File:Example.webm", ...}, or {"source": "openverse" | "unsplash" |
"pexels" | "pixabay", "id": "<id from search>", ...}; the default source is nasa.

Why "scan" matters: source clips often open on black, have captions burned in, or fade to a credits slide.
Always look at a frame sheet before choosing a window.
"""
import argparse, html, io, json, os, re, shutil, subprocess, sys, tempfile, urllib.parse, urllib.request

API = "https://images-api.nasa.gov"
# Identify honestly (Wikimedia and NASA ask automated clients to). Deliberately generic: no personal details.
UA = {"User-Agent": "WEBCraft-media-tool/1.0 (open-source website design agent; fetches openly licensed media via official APIs)"}

try:
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass


def http(url, method="GET", timeout=180, tries=5, headers=None):
    """GET/HEAD with polite retries: servers answer 429/503 when asked too fast, so wait and try again."""
    import time
    last = None
    for n in range(tries):
        try:
            return urllib.request.urlopen(urllib.request.Request(url.replace(" ", "%20"), headers=dict(UA, **(headers or {})), method=method), timeout=timeout)
        except urllib.error.HTTPError as e:
            last = e
            if e.code not in (429, 503) or n == tries - 1:
                raise
            wait = int(e.headers.get("Retry-After") or 0) or 3 * (2 ** n)
            print("  (server asked us to slow down; waiting %ds)" % wait, file=sys.stderr)
            time.sleep(min(wait, 60))
    raise last


def need(binary):
    if not shutil.which(binary):
        sys.exit("'%s' was not found on PATH. Install ffmpeg (https://ffmpeg.org) and try again." % binary)


def pil():
    try:
        from PIL import Image  # noqa: F401
        return __import__("PIL.Image", fromlist=["Image"])
    except ImportError:
        sys.exit("Pillow is required for images: pip install pillow")


# ---------------------------------------------------------------- NASA library
def nasa_search(q, media_type, n):
    qs = urllib.parse.urlencode({"q": q, "media_type": media_type, "page_size": n})
    data = json.load(http(API + "/search?" + qs))
    return [i["data"][0] for i in data["collection"]["items"]]


def nasa_meta(nasa_id):
    data = json.load(http(API + "/search?" + urllib.parse.urlencode({"nasa_id": nasa_id})))
    return data["collection"]["items"][0]["data"][0]


def nasa_assets(nasa_id):
    data = json.load(http(API + "/asset/" + urllib.parse.quote(nasa_id)))
    return [x["href"] for x in data["collection"]["items"]]


def content_length(url):
    try:
        return int(http(url, "HEAD").headers.get("Content-Length") or 0)
    except Exception:
        return 0


# ---------------------------------------------------------------- Wikimedia Commons
COMMONS = "https://commons.wikimedia.org/w/api.php"


def commons_api(params):
    params = dict(params, format="json")
    return json.load(http(COMMONS + "?" + urllib.parse.urlencode(params)))


def commons_search(q, kind, n):
    ft = {"image": "bitmap", "video": "video"}[kind]
    d = commons_api({"action": "query", "list": "search", "srsearch": "filetype:%s %s" % (ft, q), "srnamespace": 6, "srlimit": n})
    if "query" not in d:
        err = (d.get("error") or {}).get("info") or "unexpected reply"
        sys.exit("Wikimedia Commons search failed: %s. Wait a moment and try again, or rephrase the query." % err)
    return [x["title"] for x in d["query"]["search"]]


def commons_info(title, width=None):
    p = {"action": "query", "titles": title, "prop": "imageinfo", "iiprop": "url|extmetadata|size|mime"}
    if width:
        p["iiurlwidth"] = width
    pages = commons_api(p)["query"]["pages"]
    page = next(iter(pages.values()))
    if "imageinfo" not in page:
        raise ValueError("Commons has no file called %r" % title)
    ii = page["imageinfo"][0]
    em = ii.get("extmetadata", {})
    def strip(k):
        v = html.unescape(re.sub(r"\s+", " ", re.sub(r"<[^>]+>", "", str((em.get(k) or {}).get("value", ""))))).strip()
        return "" if v.lower() in ("null", "none", "unknown") else v
    return {"url": ii.get("thumburl") or ii["url"], "orig": ii["url"], "title": title, "license": strip("LicenseShortName"),
            "creator": strip("Artist"), "desc": strip("ImageDescription")[:200], "page": ii.get("descriptionurl"),
            "width": ii.get("width"), "height": ii.get("height"), "mime": ii.get("mime")}


# ---------------------------------------------------------------- Openverse, Unsplash, Pexels, Pixabay
# Every function returns items shaped like:
#   {"id", "title", "creator", "license", "page", "url" (file to download), "width", "height", "source"}
STOCK = ("openverse", "unsplash", "pexels", "pixabay")
KEYS = {"unsplash": "UNSPLASH_ACCESS_KEY", "pexels": "PEXELS_API_KEY", "pixabay": "PIXABAY_API_KEY"}
LICENCE = {"unsplash": "Unsplash License", "pexels": "Pexels License", "pixabay": "Pixabay Content License"}


def api_key(source):
    key = os.environ.get(KEYS[source], "").strip()
    if not key:
        sys.exit("%s needs a free API key. Create one on the %s developer site and set the %s environment variable, "
                 "or use --source openverse / commons (no key needed)." % (source.title(), source.title(), KEYS[source]))
    return key


def getjson(url, headers=None):
    return json.load(http(url, headers=headers))


def openverse_item(x):
    lic = (x.get("license") or "").upper()
    lic = "CC0" if lic == "CC0" else ("Public domain" if lic == "PDM" else "CC %s %s" % (lic, x.get("license_version") or "")).strip()
    return {"id": x["id"], "title": x.get("title") or "", "creator": x.get("creator") or "unknown", "license": lic,
            "page": x.get("foreign_landing_url") or "", "url": x.get("url"), "width": x.get("width"), "height": x.get("height"),
            "source": "openverse (%s)" % (x.get("source") or x.get("provider") or "")}


def unsplash_item(x):
    return {"id": x["id"], "title": x.get("alt_description") or x.get("description") or "", "creator": (x.get("user") or {}).get("name", "unknown"),
            "license": LICENCE["unsplash"], "page": (x.get("links") or {}).get("html", ""), "url": (x.get("urls") or {}).get("full"),
            "width": x.get("width"), "height": x.get("height"), "source": "unsplash",
            "download_location": (x.get("links") or {}).get("download_location")}


def pexels_photo(x):
    return {"id": x["id"], "title": x.get("alt") or "", "creator": x.get("photographer") or "unknown", "license": LICENCE["pexels"],
            "page": x.get("url", ""), "url": (x.get("src") or {}).get("original"), "width": x.get("width"), "height": x.get("height"), "source": "pexels"}


def pexels_video(x):
    files = sorted([f for f in x.get("video_files", []) if f.get("file_type") == "video/mp4" and (f.get("width") or 0) <= 1920],
                   key=lambda f: f.get("width") or 0, reverse=True)
    return {"id": x["id"], "title": "", "creator": (x.get("user") or {}).get("name", "unknown"), "license": LICENCE["pexels"],
            "page": x.get("url", ""), "url": files[0]["link"] if files else None, "width": x.get("width"), "height": x.get("height"), "source": "pexels"}


def pixabay_photo(x):
    return {"id": x["id"], "title": x.get("tags", ""), "creator": x.get("user", "unknown"), "license": LICENCE["pixabay"],
            "page": x.get("pageURL", ""), "url": x.get("largeImageURL"), "width": x.get("imageWidth"), "height": x.get("imageHeight"), "source": "pixabay"}


def pixabay_video(x):
    v = x.get("videos") or {}
    best = next((v[k] for k in ("large", "medium", "small") if (v.get(k) or {}).get("url")), {})
    return {"id": x["id"], "title": x.get("tags", ""), "creator": x.get("user", "unknown"), "license": LICENCE["pixabay"],
            "page": x.get("pageURL", ""), "url": best.get("url"), "width": best.get("width"), "height": best.get("height"), "source": "pixabay"}


def stock_search(source, q, kind, n):
    enc = urllib.parse.quote
    if source == "openverse":
        if kind == "video":
            sys.exit("Openverse has images and audio only. For video use --source pexels, pixabay or commons.")
        d = getjson("https://api.openverse.org/v1/images/?q=%s&page_size=%d&license_type=commercial,modification" % (enc(q), max(1, min(n, 20))))
        return [openverse_item(x) for x in d.get("results", [])]
    if source == "unsplash":
        if kind == "video":
            sys.exit("Unsplash has photos only. For video use --source pexels, pixabay or commons.")
        d = getjson("https://api.unsplash.com/search/photos?query=%s&per_page=%d" % (enc(q), n), {"Authorization": "Client-ID " + api_key("unsplash")})
        return [unsplash_item(x) for x in d.get("results", [])]
    if source == "pexels":
        h = {"Authorization": api_key("pexels")}
        if kind == "video":
            return [pexels_video(x) for x in getjson("https://api.pexels.com/videos/search?query=%s&per_page=%d" % (enc(q), n), h).get("videos", [])]
        return [pexels_photo(x) for x in getjson("https://api.pexels.com/v1/search?query=%s&per_page=%d" % (enc(q), n), h).get("photos", [])]
    if source == "pixabay":
        key = api_key("pixabay")
        base = "https://pixabay.com/api/videos/" if kind == "video" else "https://pixabay.com/api/"
        d = getjson("%s?key=%s&q=%s&per_page=%d&safesearch=true" % (base, enc(key), enc(q), max(3, n)))
        return [(pixabay_video if kind == "video" else pixabay_photo)(x) for x in d.get("hits", [])][:n]
    raise ValueError(source)


def stock_item(source, item_id, kind):
    """Look one item up by the ID that search printed."""
    enc = urllib.parse.quote
    if source == "openverse":
        return openverse_item(getjson("https://api.openverse.org/v1/images/%s/" % enc(str(item_id))))
    if source == "unsplash":
        return unsplash_item(getjson("https://api.unsplash.com/photos/%s" % enc(str(item_id)), {"Authorization": "Client-ID " + api_key("unsplash")}))
    if source == "pexels":
        h = {"Authorization": api_key("pexels")}
        if kind == "video":
            return pexels_video(getjson("https://api.pexels.com/videos/videos/%s" % enc(str(item_id)), h))
        return pexels_photo(getjson("https://api.pexels.com/v1/photos/%s" % enc(str(item_id)), h))
    if source == "pixabay":
        base = "https://pixabay.com/api/videos/" if kind == "video" else "https://pixabay.com/api/"
        hits = getjson("%s?key=%s&id=%s" % (base, enc(api_key("pixabay")), enc(str(item_id)))).get("hits", [])
        if not hits:
            raise ValueError("Pixabay has no item %s" % item_id)
        return (pixabay_video if kind == "video" else pixabay_photo)(hits[0])
    raise ValueError(source)


def stock_fetch(info):
    """Download bytes for an item. Unsplash asks clients to ping download_location when a photo is used."""
    if info.get("download_location"):
        try:
            http(info["download_location"], headers={"Authorization": "Client-ID " + api_key("unsplash")}).read()
        except Exception:
            pass
    return http(info["url"]).read()


def entry_stock(it, info, kind, file, note):
    return {"key": it["key"], "type": kind, "source": info["source"], "id": str(info["id"]), "title": info["title"][:160],
            "license": info["license"], "creator": info["creator"], "credit": info["creator"], "page": info["page"], "file": file,
            **({"note": note} if note else {})}


def cmd_search(a):
    if a.source in ("openverse", "unsplash", "pexels", "pixabay"):
        items = stock_search(a.source, a.query, a.type, a.n)
        if not items:
            print("No results. Try broader words, or another --source.")
        for i in items:
            print("%s | %s | %s | %sx%s | %s" % (i["id"], i["license"], i["creator"][:30], i["width"], i["height"], (i["title"] or "")[:60]))
        return
    if a.source == "commons":
        for t in commons_search(a.query, a.type, a.n):
            try:
                i = commons_info(t)
                print("%s | %s | %s | %sx%s" % (t, i["license"] or "licence unknown", i["creator"][:34] or "unknown", i["width"], i["height"]))
            except Exception as e:
                print("%s | (could not read metadata: %s)" % (t, e))
        return
    for x in nasa_search(a.query, a.type, a.n):
        print("%s | %s | %s | %s" % (x["nasa_id"], x["title"][:70].replace("�", "'"), (x.get("center") or "-"), x["date_created"][:4]))


# ---------------------------------------------------------------- video
def probe_duration(path):
    out = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", path], capture_output=True, text=True).stdout
    return float(out.strip() or 0)


def brightness_per_second(path):
    out = subprocess.run(["ffmpeg", "-hide_banner", "-i", path, "-vf", "fps=1,signalstats,metadata=print:key=lavfi.signalstats.YAVG", "-an", "-f", "null", "-"], capture_output=True, text=True).stderr
    return [float(v) for v in re.findall(r"YAVG=([\d.]+)", out)]


def frame_sheet(path, times, out_path, cols=4, width=300):
    Image = pil()
    from PIL import ImageDraw
    tiles = []
    for t in times:
        buf = subprocess.run(["ffmpeg", "-loglevel", "error", "-ss", str(t), "-i", path, "-frames:v", "1", "-vf", "scale=%d:-2" % width, "-f", "image2pipe", "-vcodec", "png", "-"], capture_output=True).stdout
        if buf:
            tiles.append((t, Image.open(io.BytesIO(buf)).convert("RGB")))
    if not tiles:
        return
    h = max(i.height for _, i in tiles)
    rows = (len(tiles) + cols - 1) // cols
    sheet = Image.new("RGB", (cols * (width + 6), rows * (h + 4)), (18, 18, 18))
    d = ImageDraw.Draw(sheet)
    for n, (t, im) in enumerate(tiles):
        x, y = (n % cols) * (width + 6) + 3, (n // cols) * (h + 4) + 2
        sheet.paste(im, (x, y))
        d.rectangle([x, y, x + 54, y + 11], fill=(0, 0, 0))
        d.text((x + 2, y), "%ss" % t, fill=(255, 210, 120))
    sheet.save(out_path, quality=82)


def cmd_scan(a):
    need("ffmpeg"); need("ffprobe")
    if not os.path.isfile(a.video):
        sys.exit("File not found: %s" % a.video)
    y = brightness_per_second(a.video)
    if not y:
        sys.exit("ffmpeg could not read any video frames from %s. Is it a real video file? (Try re-encoding it first with the cut command.)" % a.video)
    dur = probe_duration(a.video) or float(len(y))  # some containers (webm) report no duration; fall back to frames seen
    print("duration: %.1fs" % dur)
    print("mean brightness (0-255) per 10s block: %s" % [round(sum(y[i:i + 10]) / len(y[i:i + 10])) for i in range(0, len(y), 10)])
    w = int(a.window)
    if len(y) > w:
        best = max(range(0, len(y) - w), key=lambda s: sum(y[s:s + w]))
        print("brightest %ds window starts at %ds (mean %.0f)" % (w, best, sum(y[best:best + w]) / w))
    dark = [i for i, v in enumerate(y) if v < 20]
    if dark:
        print("very dark seconds (<20): %s%s" % (dark[:20], " ..." if len(dark) > 20 else ""))
    jumps = [i for i in range(1, len(y)) if abs(y[i] - y[i - 1]) > 25]
    if jumps:
        print("sudden brightness jumps (likely scene cuts, captions, or fades) at: %s" % jumps[:30])
    if a.sheet:
        n = int(a.frames)
        times = [round(dur * (k + 1) / (n + 1), 1) for k in range(n)]
        frame_sheet(a.video, times, a.sheet)
        print("frame sheet written to %s (open it and look for burned-in captions, title cards, credits and logos)" % a.sheet)


def crop_filter(crop=None, crop_bottom=None):
    """Return an ffmpeg crop filter string (or ''), e.g. to remove a burned-in caption along the bottom edge."""
    if crop:
        return "crop=%s," % crop
    if crop_bottom:
        return "crop=iw:trunc(ih*(1-%s/100)/2)*2:0:0," % float(crop_bottom)
    return ""


def encode(src, dst, start, dur, width=1280, crf=24, boomerang=False, crop=None, crop_bottom=None):
    need("ffmpeg")
    vf = crop_filter(crop, crop_bottom) + "scale='min(%d,iw)':-2,fps=24" % width
    if boomerang:
        fc = "[0:v]%s,split[a][b];[b]reverse[r];[a][r]concat=n=2:v=1:a=0[v]" % vf
        cmd = ["ffmpeg", "-y", "-loglevel", "error", "-ss", str(start), "-t", str(dur), "-i", src, "-an", "-filter_complex", fc, "-map", "[v]"]
    else:
        cmd = ["ffmpeg", "-y", "-loglevel", "error", "-ss", str(start), "-t", str(dur), "-i", src, "-an", "-vf", vf]
    cmd += ["-c:v", "libx264", "-preset", "slow", "-crf", str(crf), "-pix_fmt", "yuv420p", "-movflags", "+faststart", dst]
    subprocess.run(cmd, check=True)


def poster(video, out, at=0.2, width=1280):
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-ss", str(at), "-i", video, "-frames:v", "1", "-vf", "scale=%d:-2" % width, "-q:v", "4", out], check=True)


def cmd_cut(a):
    if not os.path.isfile(a.input):
        sys.exit("File not found: %s" % a.input)
    encode(a.input, a.output, a.start, a.dur, a.width, a.crf, a.boomerang, a.crop, a.crop_bottom)
    print("wrote %s (%.1f MB)" % (a.output, os.path.getsize(a.output) / 1e6))


# ---------------------------------------------------------------- images
def prep_image(raw, dst, max_width, quality=82, crop_to_disc=False):
    Image = pil()
    im = Image.open(io.BytesIO(raw)).convert("RGB")
    if crop_to_disc:  # tight square crop around a bright disc on black (e.g. the Moon)
        from PIL import ImageChops
        bb = ImageChops.difference(im, Image.new("RGB", im.size, (0, 0, 0))).convert("L").point(lambda v: 255 if v > 24 else 0).getbbox()
        if bb:
            l, t, r, b = bb
            s = max(r - l, b - t); cx, cy = (l + r) // 2, (t + b) // 2
            im = im.crop((cx - s // 2, cy - s // 2, cx + s // 2, cy + s // 2))
    if im.width > max_width:
        im = im.resize((max_width, round(im.height * max_width / im.width)), Image.LANCZOS)
    im.save(dst, quality=quality, optimize=True, progressive=True)
    return im.size


def pick_image_url(nasa_id):
    assets = nasa_assets(nasa_id)
    for h in assets:
        if "~orig" in h and h.lower().endswith((".jpg", ".jpeg", ".png")) and content_length(h) <= 30e6:
            return h
    return next((h for h in assets if "~large" in h and h.lower().endswith(".jpg")), None)


def pick_video_url(nasa_id):
    mp4 = [h for h in nasa_assets(nasa_id) if h.lower().endswith(".mp4")]
    for tag in ("~medium", "~small", "~large"):
        for h in mp4:
            if tag in h:
                return h
    return mp4[0] if mp4 else None


def download(url, dst):
    with http(url) as r, open(dst, "wb") as f:
        shutil.copyfileobj(r, f, 1 << 20)


# ---------------------------------------------------------------- build from a plan
def cmd_build(a):
    plan = json.load(open(a.plan, encoding="utf-8"))
    out = a.out
    os.makedirs(os.path.join(out, "assets", "img"), exist_ok=True)
    os.makedirs(os.path.join(out, "assets", "video"), exist_ok=True)
    cache = os.path.join(out, ".media-cache")
    os.makedirs(cache, exist_ok=True)
    manifest = []
    for it in plan.get("images", []):
        try:
            dst = os.path.join(out, "assets", "img", it["key"] + ".jpg")
            if it.get("source") in STOCK:
                info = stock_item(it["source"], it["id"], "image")
                size = prep_image(stock_fetch(info), dst, it.get("maxWidth", 2000), it.get("quality", 82), it.get("cropToDisc", False))
                label = "%s:%s" % (it["source"], str(it["id"])[:24])
                manifest.append(entry_stock(it, info, "image", "assets/img/%s.jpg" % it["key"], ""))
            elif it.get("source") == "commons":
                ci = commons_info(it["title"], it.get("maxWidth", 2000))
                size = prep_image(http(ci["url"]).read(), dst, it.get("maxWidth", 2000), it.get("quality", 82), it.get("cropToDisc", False))
                label = it["title"][:34]
                manifest.append(entry_commons(it, ci, "image", "assets/img/%s.jpg" % it["key"], ""))
            else:
                m = nasa_meta(it["id"]); url = pick_image_url(it["id"])
                if not url:
                    print("SKIP  image %-14s no usable file for %s" % (it["key"], it["id"])); continue
                size = prep_image(http(url).read(), dst, it.get("maxWidth", 2000), it.get("quality", 82), it.get("cropToDisc", False))
                label = it["id"][:34]
                manifest.append(entry(it, m, "image", "assets/img/%s.jpg" % it["key"], ""))
            print("image %-14s %-34s -> %4d KB %dx%d" % (it["key"], label, os.path.getsize(dst) // 1024, size[0], size[1]))
        except Exception as e:
            print("FAIL  image %-14s %s" % (it["key"], repr(e)[:140]))
    for it in plan.get("videos", []):
        try:
            need("ffmpeg")
            info = None
            if it.get("source") in STOCK:
                info = stock_item(it["source"], it["id"], "video"); label = "%s:%s" % (it["source"], str(it["id"])[:24])
                if not info.get("url"):
                    print("SKIP  video %-14s no mp4 for %s" % (it["key"], it["id"])); continue
                src = os.path.join(cache, it["key"] + "_src.mp4")
                if not os.path.exists(src):
                    download(info["url"], src)
            elif it.get("source") == "commons":
                ci = commons_info(it["title"]); label = it["title"][:34]
                src = os.path.join(cache, it["key"] + "_src" + os.path.splitext(ci["orig"])[1])
                if not os.path.exists(src):
                    download(ci["orig"], src)
            else:
                m = nasa_meta(it["id"]); label = it["id"][:34]; src = os.path.join(cache, it["key"] + "_src.mp4")
                if not os.path.exists(src):
                    url = pick_video_url(it["id"])
                    if not url:
                        print("SKIP  video %-14s no mp4 for %s" % (it["key"], it["id"])); continue
                    download(url, src)
            dst = os.path.join(out, "assets", "video", it["key"] + ".mp4")
            encode(src, dst, it["start"], it["dur"], it.get("width", 1280), it.get("crf", 24), it.get("boomerang", False), it.get("crop"), it.get("cropBottom"))
            poster(dst, os.path.join(out, "assets", "img", "poster-%s.jpg" % it["key"]), it.get("posterAt", 0.2))
            note = "Trimmed and recompressed, audio removed (source %.1fs-%.1fs%s%s)." % (it["start"], it["start"] + it["dur"], ", played forward then reversed for a seamless loop" if it.get("boomerang") else "", ", bottom %s%% cropped to remove a caption" % it["cropBottom"] if it.get("cropBottom") else "")
            print("video %-14s %-34s -> %.1f MB" % (it["key"], label, os.path.getsize(dst) / 1e6))
            if info:
                manifest.append(entry_stock(it, info, "video", "assets/video/%s.mp4" % it["key"], note))
            elif it.get("source") == "commons":
                manifest.append(entry_commons(it, ci, "video", "assets/video/%s.mp4" % it["key"], note))
            else:
                manifest.append(entry(it, m, "video", "assets/video/%s.mp4" % it["key"], note))
        except Exception as e:
            print("FAIL  video %-14s %s" % (it["key"], repr(e)[:140]))
    json.dump(manifest, open(os.path.join(out, "assets", "manifest.json"), "w", encoding="utf-8"), indent=1, ensure_ascii=False)
    if not a.keep_cache:
        shutil.rmtree(cache, ignore_errors=True)
    print("\nmanifest: %d entries -> %s" % (len(manifest), os.path.join(out, "assets", "manifest.json")))
    print("Reminder: credit every source on the site as its licence requires (manifest has the creator and licence).")
    print("          NASA: do not imply NASA endorsement. Commons CC BY / CC BY-SA: attribution required (CC BY-SA also share-alike for derivatives).")


def entry(it, m, kind, file, note):
    return {"key": it["key"], "type": kind, "nasa_id": it["id"], "title": m["title"], "center": m.get("center"),
            "date": m["date_created"][:10], "credit": it.get("credit") or m.get("secondary_creator") or "NASA",
            "desc": (m.get("description") or "")[:200], "page": "https://images.nasa.gov/details/" + urllib.parse.quote(it["id"]),
            "file": file, **({"note": note} if note else {})}


def entry_commons(it, ci, kind, file, note):
    return {"key": it["key"], "type": kind, "source": "commons", "title": ci["title"].replace("File:", ""), "license": ci["license"] or "unknown",
            "creator": ci["creator"] or "unknown", "credit": ci["creator"] or "unknown", "desc": ci["desc"], "page": ci["page"], "file": file,
            **({"note": note} if note else {})}


def main():
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    s = p.add_subparsers(dest="cmd", required=True)
    a = s.add_parser("search"); a.add_argument("query"); a.add_argument("--source", default="nasa", choices=["nasa", "commons", *STOCK]); a.add_argument("--type", default="image", choices=["image", "video"]); a.add_argument("--n", type=int, default=10); a.set_defaults(f=cmd_search)
    a = s.add_parser("scan"); a.add_argument("video"); a.add_argument("--window", type=int, default=12); a.add_argument("--sheet"); a.add_argument("--frames", type=int, default=12); a.set_defaults(f=cmd_scan)
    a = s.add_parser("cut"); a.add_argument("input"); a.add_argument("output"); a.add_argument("--start", type=float, default=0); a.add_argument("--dur", type=float, default=12)
    a.add_argument("--width", type=int, default=1280); a.add_argument("--crf", type=int, default=24); a.add_argument("--boomerang", action="store_true")
    a.add_argument("--crop", help="ffmpeg crop W:H:X:Y"); a.add_argument("--crop-bottom", type=float, help="remove this percent from the bottom edge (burned-in captions)"); a.set_defaults(f=cmd_cut)
    a = s.add_parser("build"); a.add_argument("plan"); a.add_argument("--out", required=True); a.add_argument("--keep-cache", action="store_true"); a.set_defaults(f=cmd_build)
    args = p.parse_args(); args.f(args)


if __name__ == "__main__":
    main()
