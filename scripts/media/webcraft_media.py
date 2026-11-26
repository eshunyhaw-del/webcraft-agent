#!/usr/bin/env python3
"""WEBCraft media tool: find, fetch, clean, and prepare real photographs and video for a website.

Works with NASA's public Image and Video Library (https://images.nasa.gov), which needs no API key.
Uses only the official API. It does not scrape web pages.

Requires: Python 3.9+, ffmpeg and ffprobe on PATH (for video), Pillow (pip install pillow) for images.

Commands
  search  "query" [--type image|video] [--n 10]        List matching items with their full IDs.
  scan    video.mp4 [--window 12] [--sheet out.jpg]    Brightness per second, best clean window, optional frame sheet.
  cut     in.mp4 out.mp4 --start S --dur D [...]       Trim, remove audio, compress, optional boomerang loop.
  build   plan.json --out DIR                          Download and prepare everything listed in a media plan.

Why "scan" matters: source clips often open on black, have captions burned in, or fade to a credits slide.
Always look at a frame sheet before choosing a window.
"""
import argparse, io, json, os, re, shutil, subprocess, sys, tempfile, urllib.parse, urllib.request

API = "https://images-api.nasa.gov"
UA = {"User-Agent": "Mozilla/5.0 (WEBCraft media tool)"}

try:
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass


def http(url, method="GET", timeout=180):
    return urllib.request.urlopen(urllib.request.Request(url.replace(" ", "%20"), headers=UA, method=method), timeout=timeout)


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


def cmd_search(a):
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
    y = brightness_per_second(a.video)
    dur = probe_duration(a.video)
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


def encode(src, dst, start, dur, width=1280, crf=24, boomerang=False):
    need("ffmpeg")
    vf = "scale='min(%d,iw)':-2,fps=24" % width
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
    encode(a.input, a.output, a.start, a.dur, a.width, a.crf, a.boomerang)
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
            m = nasa_meta(it["id"]); url = pick_image_url(it["id"])
            if not url:
                print("SKIP  image %-14s no usable file for %s" % (it["key"], it["id"])); continue
            dst = os.path.join(out, "assets", "img", it["key"] + ".jpg")
            size = prep_image(http(url).read(), dst, it.get("maxWidth", 2000), it.get("quality", 82), it.get("cropToDisc", False))
            print("image %-14s %-34s -> %4d KB %dx%d" % (it["key"], it["id"][:34], os.path.getsize(dst) // 1024, size[0], size[1]))
            manifest.append(entry(it, m, "image", "assets/img/%s.jpg" % it["key"], ""))
        except Exception as e:
            print("FAIL  image %-14s %s" % (it["key"], repr(e)[:140]))
    for it in plan.get("videos", []):
        try:
            need("ffmpeg")
            m = nasa_meta(it["id"]); src = os.path.join(cache, it["key"] + "_src.mp4")
            if not os.path.exists(src):
                url = pick_video_url(it["id"])
                if not url:
                    print("SKIP  video %-14s no mp4 for %s" % (it["key"], it["id"])); continue
                download(url, src)
            dst = os.path.join(out, "assets", "video", it["key"] + ".mp4")
            encode(src, dst, it["start"], it["dur"], it.get("width", 1280), it.get("crf", 24), it.get("boomerang", False))
            poster(dst, os.path.join(out, "assets", "img", "poster-%s.jpg" % it["key"]), it.get("posterAt", 0.2))
            note = "Trimmed and recompressed, audio removed (source %.1fs-%.1fs%s)." % (it["start"], it["start"] + it["dur"], ", played forward then reversed for a seamless loop" if it.get("boomerang") else "")
            print("video %-14s %-34s -> %.1f MB" % (it["key"], it["id"][:34], os.path.getsize(dst) / 1e6))
            manifest.append(entry(it, m, "video", "assets/video/%s.mp4" % it["key"], note))
        except Exception as e:
            print("FAIL  video %-14s %s" % (it["key"], repr(e)[:140]))
    json.dump(manifest, open(os.path.join(out, "assets", "manifest.json"), "w", encoding="utf-8"), indent=1, ensure_ascii=False)
    if not a.keep_cache:
        shutil.rmtree(cache, ignore_errors=True)
    print("\nmanifest: %d entries -> %s" % (len(manifest), os.path.join(out, "assets", "manifest.json")))
    print("Reminder: credit NASA (and partners named in the manifest) on the site, and do not imply NASA endorsement.")


def entry(it, m, kind, file, note):
    return {"key": it["key"], "type": kind, "nasa_id": it["id"], "title": m["title"], "center": m.get("center"),
            "date": m["date_created"][:10], "credit": it.get("credit") or m.get("secondary_creator") or "NASA",
            "desc": (m.get("description") or "")[:200], "page": "https://images.nasa.gov/details/" + urllib.parse.quote(it["id"]),
            "file": file, **({"note": note} if note else {})}


def main():
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    s = p.add_subparsers(dest="cmd", required=True)
    a = s.add_parser("search"); a.add_argument("query"); a.add_argument("--type", default="image", choices=["image", "video"]); a.add_argument("--n", type=int, default=10); a.set_defaults(f=cmd_search)
    a = s.add_parser("scan"); a.add_argument("video"); a.add_argument("--window", type=int, default=12); a.add_argument("--sheet"); a.add_argument("--frames", type=int, default=12); a.set_defaults(f=cmd_scan)
    a = s.add_parser("cut"); a.add_argument("input"); a.add_argument("output"); a.add_argument("--start", type=float, default=0); a.add_argument("--dur", type=float, default=12)
    a.add_argument("--width", type=int, default=1280); a.add_argument("--crf", type=int, default=24); a.add_argument("--boomerang", action="store_true"); a.set_defaults(f=cmd_cut)
    a = s.add_parser("build"); a.add_argument("plan"); a.add_argument("--out", required=True); a.add_argument("--keep-cache", action="store_true"); a.set_defaults(f=cmd_build)
    args = p.parse_args(); args.f(args)


if __name__ == "__main__":
    main()
