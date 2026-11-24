"""
Draws every logo, the favicon included, from two sources: logos/mark.svg and Host Grotesk.

We decided to lay the name out with HarfBuzz, the shaping engine browsers use,
so its kerning and spacing match how the logo has always been rendered in code
(Host Grotesk at weight 600, letter-spacing -0.04em), and to draw it as shapes,
so no logo depends on the font being installed where it is used.

Run with `docker compose run --rm python python scripts/draw-logos.py`.
"""

import io
import re
from pathlib import Path

import uharfbuzz as hb
from fontTools.pens.boundsPen import BoundsPen
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont

LOGOS = Path("logos")
FONT = Path("node_modules/@fontsource-variable/host-grotesk/files/host-grotesk-latin-wght-normal.woff2")
TEXT = "monetyo"
WEIGHT = 600
TRACKING = -0.04

INK = "#1B1916"
WHITE = "#FFFFFF"

# The lockup is laid out as in monetyo-launch's Logo component: a 24px mark, a
# 10px gap, 22px type with a line height of 1, centred on the mark.
MARK_SIZE = 24
GAP = 10
FONT_SIZE = 22


def write(name, view_box, content):
    """
    Writes a logo, with its ids prefixed by its name, so two different logos
    inlined in the same page never share an id.
    """
    content = re.sub(r'(id="|url\(#)([a-z]+)', rf"\1{name}-\2", content)
    svg = f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{view_box}">{content}</svg>\n'
    (LOGOS / f"{name}.svg").write_text(svg)


def number(value):
    return f"{value:.2f}".rstrip("0").rstrip(".")


def mark_parts():
    """Returns the full-colour mark's content, and the coin and house it is drawn from."""
    source = (LOGOS / "mark.svg").read_text()
    content = re.search(r"<svg[^>]*>(.*)</svg>", source, re.S).group(1)
    content = re.sub(r'(id="|url\(#)mark-', r"\1", content)
    coin = re.search(r'<circle cx="([\d.]+)" cy="([\d.]+)" r="([\d.]+)"', content).groups()
    house = re.search(r'<path d="([^"]+)"', content).group(1)
    return content, coin, house


def one_colour_mark(colour, coin, house):
    """
    Draws the mark in a single colour.

    We decided the space the coin and the house share is cut out of both, so it
    still reads as a shape of its own without needing a second colour.
    """
    cx, cy, r = coin
    shape = f'd="{house}" stroke-width="2" stroke-linejoin="round"'
    return (
        f'<defs><clipPath id="coin"><circle cx="{cx}" cy="{cy}" r="{r}"/></clipPath>'
        f'<mask id="lens" maskUnits="userSpaceOnUse" x="-2" y="-2" width="28" height="28">'
        f'<rect x="-2" y="-2" width="28" height="28" fill="white"/>'
        f'<path {shape} fill="black" stroke="black" clip-path="url(#coin)"/></mask></defs>'
        f'<g mask="url(#lens)"><circle cx="{cx}" cy="{cy}" r="{r}" fill="{colour}"/>'
        f'<path {shape} fill="{colour}" stroke="{colour}"/></g>'
    )


def static_font():
    font = TTFont(FONT)
    instantiateVariableFont(font, {"wght": WEIGHT}, inplace=True)
    font.flavor = None
    buffer = io.BytesIO()
    font.save(buffer)
    return TTFont(io.BytesIO(buffer.getvalue())), buffer.getvalue()


def name_outline(top):
    """Returns the name as an SVG path, and its ink bounds, in pixels, with its line box at `top`."""
    font, font_bytes = static_font()
    face = hb.Face(font_bytes)
    buffer = hb.Buffer()
    buffer.add_str(TEXT)
    buffer.guess_segment_properties()
    hb.shape(hb.Font(face), buffer, {"kern": True, "liga": True})

    scale = FONT_SIZE / face.upem
    glyph_set = font.getGlyphSet()
    order = font.getGlyphOrder()

    # A line height of 1 splits the font's own line height evenly above and below.
    hhea = font["hhea"]
    content = (hhea.ascent - hhea.descent) * scale
    baseline = top + (FONT_SIZE - content) / 2 + hhea.ascent * scale

    pen = SVGPathPen(glyph_set, ntos=number)
    bounds = BoundsPen(glyph_set)
    x = 0.0
    for info, position in zip(buffer.glyph_infos, buffer.glyph_positions):
        glyph = glyph_set[order[info.codepoint]]
        transform = (scale, 0, 0, -scale, x + position.x_offset * scale, baseline - position.y_offset * scale)
        glyph.draw(TransformPen(pen, transform))
        glyph.draw(TransformPen(bounds, transform))
        x += position.x_advance * scale + TRACKING * FONT_SIZE
    return pen.getCommands(), bounds.bounds


def main():
    colour_mark, coin, house = mark_parts()

    # The favicon is the mark on a 32px canvas with a 1px margin, so it fills the tab without touching its edges.
    defs, body = re.match(r"(<defs>.*?</defs>)(.*)", colour_mark, re.S).groups()
    write("favicon", "0 0 32 32", f'{defs}<g transform="translate(1 1) scale(1.25)">{body}</g>')

    for name, colour in (("mark-ink", INK), ("mark-white", WHITE)):
        write(name, "0 0 24 24", one_colour_mark(colour, coin, house))

    # Every file is cropped to its ink, as logo files are.
    path, (left, top, right, bottom) = name_outline(0)
    view_box = f"{number(left)} {number(top)} {number(right - left)} {number(bottom - top)}"
    for name, colour in (("wordmark", INK), ("wordmark-white", WHITE)):
        write(name, view_box, f'<path d="{path}" fill="{colour}"/>')

    path, (_, top, right, bottom) = name_outline((MARK_SIZE - FONT_SIZE) / 2)
    y = min(0, top)
    view_box = f"0 {number(y)} {number(MARK_SIZE + GAP + right)} {number(max(MARK_SIZE, bottom) - y)}"
    lockups = (
        ("lockup", colour_mark, INK),
        ("lockup-reversed", colour_mark, WHITE),
        ("lockup-ink", one_colour_mark(INK, coin, house), INK),
        ("lockup-white", one_colour_mark(WHITE, coin, house), WHITE),
    )
    for name, mark, colour in lockups:
        text = f'<path transform="translate({MARK_SIZE + GAP} 0)" d="{path}" fill="{colour}"/>'
        write(name, view_box, mark + text)


if __name__ == "__main__":
    main()
