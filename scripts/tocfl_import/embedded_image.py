"""Render a PDF image as it appears on the paper's white background."""
from __future__ import annotations

import fitz


def embedded_png(doc: fitz.Document, xref: int) -> bytes:
    pix = fitz.Pixmap(doc, xref)
    if pix.colorspace not in (fitz.csRGB, fitz.csGRAY) or pix.alpha:
        pix = fitz.Pixmap(fitz.csRGB, pix)

    kind, value = doc.xref_get_key(xref, "SMask")
    if kind != "xref":
        return pix.tobytes("png")

    # The PDF stores the drawing and its transparency as separate images.
    # Exporting only the drawing turns its transparent background black.
    base = fitz.Pixmap(doc, xref)
    if base.colorspace != fitz.csRGB:
        base = fitz.Pixmap(fitz.csRGB, base)
    if base.alpha:
        base = fitz.Pixmap(base, 0)
    mask = fitz.Pixmap(doc, int(value.split()[0]))
    if (base.width, base.height) != (mask.width, mask.height):
        # Some documents use a smaller shading mask; their embedded image
        # already exports correctly, and PyMuPDF cannot combine these sizes.
        return pix.tobytes("png")
    combined = fitz.Pixmap(base, mask)
    samples = combined.samples
    rgb = bytearray()
    for offset in range(0, len(samples), 4):
        alpha = samples[offset + 3]
        rgb.extend(255 - ((255 - samples[offset + channel]) * alpha + 127) // 255 for channel in range(3))
    return fitz.Pixmap(fitz.csRGB, combined.width, combined.height, bytes(rgb), 0).tobytes("png")
