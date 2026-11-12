#!/usr/bin/env python3
"""App icons from the Vajrapu glyph (the white vajra-V mark) on the copper brand tile.
Regenerates every PNG under public/. The same glyph lives in public/favicon.svg.

Run:  python3 kit/make_icons.py
"""
from PIL import Image, ImageDraw

COPPER = (194, 65, 12)      # #c2410c — the site accent (see src/styles/global.css)
WHITE = (255, 255, 255)

# The glyph, as polygons in its original 96x96 viewBox (from the supplied icon-white.svg).
# The diamond body is drawn as the outer triangle with the inner triangle cut back to copper.
P_TOP =   [(20, 8), (76, 8), (66, 20), (30, 20)]
P_LEFT =  [(15.5, 11), (20, 16.4), (15, 24), (8, 24)]
P_RIGHT = [(80.5, 11), (76, 16.4), (81, 24), (88, 24)]
P_BODY =  [(8, 28), (88, 28), (48, 92)]
P_HOLE =  [(33, 28), (48, 58), (63, 28)]
CONTENT_CX, CONTENT_CY = 48.0, 50.0   # centre of the glyph's content box (x 8..88, y 8..92)

SS = 4  # supersample factor for clean edges


def glyph_on(img, glyph_frac, bg):
    """Draw the glyph centred on img, scaled so the 96-box spans glyph_frac of the canvas."""
    S = img.size[0]
    s = (S * glyph_frac) / 96.0
    ox, oy = S / 2 - CONTENT_CX * s, S / 2 - CONTENT_CY * s
    d = ImageDraw.Draw(img)
    t = lambda pts: [(x * s + ox, y * s + oy) for x, y in pts]
    for poly in (P_TOP, P_LEFT, P_RIGHT, P_BODY):
        d.polygon(t(poly), fill=WHITE)
    d.polygon(t(P_HOLE), fill=bg)  # the cut-out shows the tile colour
    return img


def rounded_tile(size, radius_frac):
    big = size * SS
    img = Image.new('RGBA', (big, big), (0, 0, 0, 0))
    ImageDraw.Draw(img).rounded_rectangle([0, 0, big - 1, big - 1], radius=int(big * radius_frac), fill=COPPER)
    return img


def save(img, size, name):
    img.resize((size, size), Image.LANCZOS).save(name)
    print('wrote', name)


for size, name in [(192, 'public/icon-192.png'), (512, 'public/icon-512.png'),
                   (180, 'public/apple-touch-icon.png'), (96, 'public/favicon-96.png')]:
    save(glyph_on(rounded_tile(size, 0.22), 0.66, COPPER), size, name)

# maskable: full-bleed tile, glyph inside the safe zone
big = 512 * SS
full = Image.new('RGBA', (big, big), COPPER + (255,))
save(glyph_on(full, 0.52, COPPER), 512, 'public/icon-512-maskable.png')
