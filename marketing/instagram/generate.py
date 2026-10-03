"""Builds the goodhelp Instagram posts from SVG templates.
Run: python3 marketing/instagram/generate.py   (needs rsvg-convert)"""
import os, re, subprocess

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
src = open(os.path.join(ROOT, "assets/icon-source.svg")).read()
MARK = re.search(r'(<g id="mark">.*?</g>)', src, re.S).group(1)

FONT = "Avenir Next"
LEAVES = ["#FFD65C", "#8C7BFF", "#FF7A7A", "#6FD3F7", "#C58BD6", "#7FD48A", "#FFAE5C"]

ICONS = {
    "food": '''<path d="M100 62 C 82 48, 48 50, 40 84 C 32 120, 56 160, 80 164 C 90 166, 94 160, 100 160
               C 106 160, 110 166, 120 164 C 144 160, 168 120, 160 84 C 152 50, 118 48, 100 62 Z" fill="#fff"/>
               <path d="M100 62 C 100 48, 104 38, 112 30" stroke="#fff" stroke-width="9" fill="none" stroke-linecap="round"/>
               <path d="M108 44 C 120 26, 142 26, 150 32 C 140 46, 122 50, 108 44 Z" fill="#fff"/>''',
    "clothes": '''<path d="M76 36 L 42 52 L 22 92 L 50 106 L 58 92 L 58 166 L 142 166 L 142 92 L 150 106
               L 178 92 L 158 52 L 124 36 C 120 50, 112 58, 100 58 C 88 58, 80 50, 76 36 Z" fill="#fff" stroke="#fff"
               stroke-width="6" stroke-linejoin="round"/>''',
    "paw": '''<ellipse cx="100" cy="128" rx="40" ry="34" fill="#fff"/>
              <ellipse cx="54" cy="92" rx="15" ry="20" transform="rotate(-20 54 92)" fill="#fff"/>
              <ellipse cx="82" cy="60" rx="16" ry="22" transform="rotate(-6 82 60)" fill="#fff"/>
              <ellipse cx="118" cy="60" rx="16" ry="22" transform="rotate(6 118 60)" fill="#fff"/>
              <ellipse cx="146" cy="92" rx="15" ry="20" transform="rotate(20 146 92)" fill="#fff"/>''',
    "pin": '''<path d="M100 172 C 100 172, 46 112, 46 80 C 46 50, 70 28, 100 28 C 130 28, 154 50, 154 80
              C 154 112, 100 172, 100 172 Z" fill="#fff"/><circle cx="100" cy="80" r="20" fill="COLOR"/>''',
}

def esc(s):
    return s.replace("&", "&amp;").replace("<", "&lt;")

def text(lines, x, y, size, weight=700, fill="#fff", lh=1.18, anchor="start", opacity=1):
    out = []
    for i, line in enumerate(lines):
        out.append(f'<text x="{x}" y="{y + i * size * lh:.0f}" font-family="{FONT}" font-size="{size}" '
                   f'font-weight="{weight}" fill="{fill}" text-anchor="{anchor}" opacity="{opacity}">{esc(line)}</text>')
    return "\n".join(out)

def frame(w, h, body, seed=0):
    # Soft leaf-coloured dots drifting off the edges tie the carousel slides together.
    dots = [(0.92, 0.08, 120), (0.05, 0.30, 70), (0.97, 0.62, 60), (0.10, 0.93, 110), (0.80, 0.97, 50)]
    deco = "".join(f'<circle cx="{fx*w:.0f}" cy="{fy*h:.0f}" r="{r}" fill="{LEAVES[(i+seed) % 7]}" opacity="0.9"/>'
                   for i, (fx, fy, r) in enumerate(dots))
    return f'''<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}">
<defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
<stop offset="0" stop-color="#6A86FF"/><stop offset="1" stop-color="#3A56E8"/></linearGradient></defs>
<rect width="{w}" height="{h}" fill="url(#bg)"/>{deco}{body}</svg>'''

def brand(x, y, scale=0.085):
    # Small tree mark + wordmark.
    return (f'<g transform="translate({x},{y}) scale({scale}) translate(-200,-150)">{MARK}</g>'
            + text(["goodhelp"], x + 70, y + 54, 44, 700))

def pager(i, n, w, y):
    gap = 28; x0 = w / 2 - gap * (n - 1) / 2
    return "".join(f'<circle cx="{x0 + k*gap:.0f}" cy="{y}" r="{9 if k == i else 6}" fill="#fff" '
                   f'opacity="{1 if k == i else 0.45}"/>' for k in range(n))

W, H = 1080, 1350
FEATURES = [
    ("food", "#FFAE5C", "SHARE FOOD", ["Extra food?", "Share it."],
     ["Post what you have, how much, and", "when it's ready. A neighbor picks it", "up instead of it going to waste."]),
    ("clothes", "#8C7BFF", "SHARE CLOTHES", ["Closet full?", "Pass it on."],
     ["List clothes and their condition so", "someone nearby can put them to", "good use."]),
    ("paw", "#FF7A7A", "RESCUE ANIMALS", ["Help an animal", "find a home."],
     ["Post animals that need rescue, or", "browse the newest listings from", "people near you."]),
    ("pin", "#4FC3EA", "FIND HELP NEARBY", ["Good is closer", "than you think."],
     ["See donations on a map and find", "the nearest food banks with", "a single tap."]),
]

def hero():
    body = (f'<g transform="translate(540,470) scale(0.62) translate(-512,-508)">{MARK}</g>'
            + text(["Good help grows", "in your neighborhood."], 540, 900, 74, 700, anchor="middle")
            + text(["Share food, clothes, and a second", "chance for animals, all from one app."],
                   540, 1080, 38, 500, anchor="middle", opacity=0.9)
            + text(["Swipe →"], 540, 1250, 34, 600, anchor="middle", opacity=0.85))
    return frame(W, H, body, 0)

def feature(i, n, key, color, kicker, head, sub):
    icon = ICONS[key].replace("COLOR", color)
    body = (f'<rect x="80" y="170" width="920" height="1000" rx="56" fill="#fff"/>'
            f'<circle cx="540" cy="430" r="170" fill="{color}"/>'
            f'<g transform="translate(540,430) scale(1.15) translate(-100,-100)">{icon}</g>'
            + text([kicker], 540, 700, 30, 700, fill=color, anchor="middle")
            + text(head, 540, 790, 72, 700, fill="#1E2A5A", anchor="middle")
            + text(sub, 540, 990, 36, 500, fill="#4A5578", anchor="middle", lh=1.35)
            + brand(80, 60) + pager(i, n, W, 1260))
    return frame(W, H, body, i)

def cta(i, n):
    body = (f'<g transform="translate(540,440) scale(0.5) translate(-512,-508)">{MARK}</g>'
            + text(["Be the good help."], 540, 820, 84, 700, anchor="middle")
            + text(["Download goodhelp and start", "sharing with your community."], 540, 920, 40, 500,
                   anchor="middle", opacity=0.9)
            + f'<rect x="300" y="1030" width="480" height="110" rx="55" fill="#fff"/>'
            + text(["Link in bio"], 540, 1100, 42, 700, fill="#3A56E8", anchor="middle")
            + pager(i, n, W, 1260))
    return frame(W, H, body, 5)

def story():
    w, h = 1080, 1920
    body = (f'<g transform="translate(540,640) scale(0.72) translate(-512,-508)">{MARK}</g>'
            + text(["Good help grows", "in your", "neighborhood."], 540, 1150, 88, 700, anchor="middle")
            + text(["Share food · Share clothes · Rescue animals"], 540, 1420, 38, 600,
                   anchor="middle", opacity=0.9)
            + f'<rect x="290" y="1510" width="500" height="116" rx="58" fill="#fff"/>'
            + text(["Get goodhelp"], 540, 1583, 44, 700, fill="#3A56E8", anchor="middle"))
    return frame(w, h, body, 2)

slides = [hero()] + [feature(k + 1, 6, *f) for k, f in enumerate(FEATURES)]
slides.append(cta(5, 6))
out = os.path.join(HERE, "out")
os.makedirs(out, exist_ok=True)
jobs = [(f"carousel-{k+1}.png", s) for k, s in enumerate(slides)] + [("story.png", story())]
for name, svg in jobs:
    p = os.path.join(out, name)
    subprocess.run(["rsvg-convert", "-o", p, "-"], input=svg.encode(), check=True)
    print(p)
