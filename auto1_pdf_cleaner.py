#!/usr/bin/env python3
"""Prepare AUTO1 auction PDFs for client sharing.

The converter removes auction/internal blocks that should not go to a client:
voucher/export advantage, stock number, demand labels, delivery/pickup data,
AUTO1 legal footer pages, video overlay, and thin technical right-side rails.
"""

from __future__ import annotations

import argparse
from pathlib import Path
from typing import Iterable, Optional

import fitz


BASE_WIDTH = 594.96
BASE_HEIGHT = 841.92


def scaled_rect(page: fitz.Page, x0: float, y0: float, x1: float, y1: float) -> fitz.Rect:
    """Scale a rectangle from the observed AUTO1 A4 layout to the current page."""
    sx = page.rect.width / BASE_WIDTH
    sy = page.rect.height / BASE_HEIGHT
    return fitz.Rect(x0 * sx, y0 * sy, x1 * sx, y1 * sy)


def page_text(page: fitz.Page) -> str:
    return page.get_text("text").replace("\xa0", " ")


def add_redactions(page: fitz.Page, rects: Iterable[fitz.Rect]) -> None:
    for rect in rects:
        page.add_redact_annot(rect, fill=(1, 1, 1))
    page.apply_redactions(images=fitz.PDF_REDACT_IMAGE_PIXELS)


def is_delivery_process_page(text: str) -> bool:
    markers = (
        "Delivery or pick up process will",
        "Payment of invoices for the car and",
        "Enjoy free parking for up to",
    )
    return any(marker in text for marker in markers)


def is_legal_footer_page(text: str) -> bool:
    markers = ("Copyright © 2026 Auto1.com", "Privacy", "Terms and Conditions", "Imprint")
    return sum(marker in text for marker in markers) >= 3


def should_drop_page(page: fitz.Page) -> bool:
    text = page_text(page)
    return is_delivery_process_page(text) or is_legal_footer_page(text)


def has_cover_cleanup(text: str) -> bool:
    markers = ("Export advantage", "Stock number:", "In high demand!", "watchlist")
    return any(marker in text for marker in markers)


def has_video_overlay(text: str) -> bool:
    return "0:00 / 0:16" in text or "0:00/" in text


def has_delivery_options(text: str) -> bool:
    markers = (
        "Delivery to my address",
        "Delivery to closest pickup location",
        "Pickup at car location",
        "Self - pickup",
    )
    return any(marker in text for marker in markers)


def has_damage_picture_counter(text: str) -> bool:
    return "Total Pictures:" in text


def right_rail_rect(page: fitz.Page) -> fitz.Rect:
    return scaled_rect(page, 568, 12, 584, 832)


def show_clip(
    output_page: fitz.Page,
    source_doc: fitz.Document,
    source_page_index: int,
    clip: fitz.Rect,
    dest: Optional[fitz.Rect] = None,
) -> None:
    output_page.show_pdf_page(dest or clip, source_doc, source_page_index, clip=clip)


def insert_rendered_clip(
    output_page: fitz.Page,
    source_page: fitz.Page,
    clip: fitz.Rect,
    dest: Optional[fitz.Rect] = None,
    zoom: float = 2.5,
) -> None:
    matrix = fitz.Matrix(zoom, zoom)
    pix = source_page.get_pixmap(matrix=matrix, clip=clip, alpha=False)
    output_page.insert_image(dest or clip, stream=pix.tobytes("png"))


def draw_scaled_text(
    page: fitz.Page,
    x: float,
    y: float,
    text: str,
    fontsize: float = 8.0,
    bold: bool = False,
) -> None:
    sx = page.rect.width / BASE_WIDTH
    sy = page.rect.height / BASE_HEIGHT
    page.insert_text(
        fitz.Point(x * sx, y * sy),
        text,
        fontname="helv",
        fontsize=fontsize * sy,
        color=(0, 0, 0),
        render_mode=0,
    )


def clean_lines(text: str) -> list[str]:
    removed_prefixes = (
        "Save cash!",
        "Export advantage",
        "Stock number:",
        "CB82742",
        "In high demand!",
        "2 merchants",
    )
    lines = [line.strip() for line in text.splitlines() if line.strip()]
    return [line for line in lines if not any(line.startswith(prefix) for prefix in removed_prefixes)]


def parse_cover_data(source_page: fitz.Page) -> tuple[str, list[tuple[str, str]], tuple[str, str]]:
    lines = clean_lines(page_text(source_page))
    title = source_page.parent.metadata.get("title") or "AUTO1 vehicle report"
    if lines and "Peugeot" in lines[-1]:
        title = lines[-1]

    fields: list[tuple[str, str]] = []
    index = 0
    while index < len(lines):
        line = lines[index]
        if line == "Build year:" and index + 1 < len(lines):
            fields.append((line, lines[index + 1]))
            index += 2
        elif line in {
            "First registration:",
            "License plate:",
            "Odometer reading:",
            "Fuel type:",
            "Horsepower:",
            "Cylinder capacity:",
            "Gear box:",
            "Inspection expires:",
            "Body type:",
            "Total number of owners:",
            "Keys:",
            "Country of origin:",
            "Environmental class:",
            "COC papers:",
            "Seats:",
            "Color:",
            "Door count:",
        } and index + 1 < len(lines):
            fields.append((line, lines[index + 1]))
            index += 2
        elif line == "Prior damage / Accident" and index + 3 < len(lines):
            fields.append(("Prior damage / Accident\naccording to previous\nowner", lines[index + 3]))
            index += 4
        elif line == "Country of last" and index + 2 < len(lines):
            fields.append(("Country of last\nregistration:", lines[index + 2]))
            index += 3
        elif line == "Upholstery:" and index + 1 < len(lines):
            value = lines[index + 1]
            if index + 2 < len(lines) and lines[index + 2].startswith("("):
                value = f"{value}\n{lines[index + 2]}"
                index += 3
            else:
                index += 2
            fields.append((line, value))
        else:
            index += 1

    location = ("Car location", "")
    if "Car location" in lines:
        loc_index = lines.index("Car location")
        if loc_index + 1 < len(lines):
            location = ("Car location", lines[loc_index + 1])

    return title, fields, location


def build_clean_cover(output_doc: fitz.Document, source_doc: fitz.Document) -> None:
    source_page = source_doc[0]
    page = output_doc.new_page(width=source_page.rect.width, height=source_page.rect.height)
    page.draw_rect(page.rect, color=None, fill=(1, 1, 1))

    # Render image-heavy regions as pixels so removed auction text is not
    # preserved as hidden/selectable PDF text.
    insert_rendered_clip(page, source_page, scaled_rect(source_page, 0, 0, 245, 58))
    insert_rendered_clip(page, source_page, scaled_rect(source_page, 20, 110, 240, 775))

    title, fields, location = parse_cover_data(source_page)
    page.insert_textbox(
        scaled_rect(page, 240, 88, 575, 112),
        title,
        fontname="helv",
        fontsize=11,
        align=fitz.TEXT_ALIGN_CENTER,
        color=(0, 0, 0),
    )

    y_positions = [
        166,
        188,
        210,
        232,
        254,
        276,
        298,
        320,
        342,
        364,
        386,
        408,
        430,
        484,
        544,
        566,
        588,
        610,
        640,
        670,
    ]
    for y, (label, value) in zip(y_positions, fields):
        label_lines = label.splitlines()
        value_lines = value.splitlines()
        for offset, label_line in enumerate(label_lines):
            draw_scaled_text(page, 262.8, y + offset * 15, label_line, fontsize=8.0)
        for offset, value_line in enumerate(value_lines):
            draw_scaled_text(page, 426.0, y + offset * 15, value_line, fontsize=8.0)

    draw_scaled_text(page, 259.0, 746, location[0], fontsize=7.5)
    if location[1]:
        draw_scaled_text(page, 259.0, 766, location[1], fontsize=7.5)

    page.insert_link(
        {
            "kind": fitz.LINK_URI,
            "from": scaled_rect(page, 39.75, 23.25, 174.75, 53.25),
            "uri": "https://www.auto1.com/",
        }
    )


def find_spare_gallery_photo(source_doc: fitz.Document) -> Optional[tuple[int, fitz.Rect]]:
    """Find the gallery photo that replaces the video thumbnail on AUTO1 PDFs."""
    if source_doc.page_count < 3:
        return None
    page = source_doc[2]
    text = page_text(page)
    if not has_delivery_options(text):
        return None
    return 2, scaled_rect(page, 134.25, 429.0, 233.25, 503.25)


def clean_standard_page(
    output_doc: fitz.Document,
    source_doc: fitz.Document,
    source_page_index: int,
    spare_photo: Optional[tuple[int, fitz.Rect]],
) -> None:
    output_doc.insert_pdf(source_doc, from_page=source_page_index, to_page=source_page_index)
    page = output_doc[-1]
    text = page_text(page)

    rects = [right_rail_rect(page)]
    needs_video_replacement = False

    if has_video_overlay(text):
        rects.extend(
            [
                scaled_rect(page, 132, 12, 236, 91),
                scaled_rect(page, 133, 25, 234, 72),
            ]
        )
        needs_video_replacement = spare_photo is not None

    if has_delivery_options(text):
        rects.append(scaled_rect(page, 36, 520, 560, 832))
        if spare_photo is not None:
            rects.append(scaled_rect(page, 132, 426, 236, 507))

    if has_damage_picture_counter(text):
        for found in page.search_for("Total Pictures:"):
            rects.append(fitz.Rect(found.x0 - 2, found.y0 - 2, found.x1 + 60, found.y1 + 4))
        rects.append(scaled_rect(page, 36, 443, 560, 461))

    add_redactions(page, rects)

    if needs_video_replacement and spare_photo is not None:
        photo_page_index, clip = spare_photo
        show_clip(page, source_doc, photo_page_index, clip, scaled_rect(page, 134.25, 14.25, 233.25, 88.5))


def convert_auto1_pdf(input_pdf: Path, output_pdf: Path) -> None:
    source_doc = fitz.open(input_pdf)
    output_doc = fitz.open()
    spare_photo = find_spare_gallery_photo(source_doc)

    for page_index, source_page in enumerate(source_doc):
        if should_drop_page(source_page):
            continue

        text = page_text(source_page)
        if page_index == 0 and has_cover_cleanup(text):
            build_clean_cover(output_doc, source_doc)
        else:
            clean_standard_page(output_doc, source_doc, page_index, spare_photo)

    output_pdf.parent.mkdir(parents=True, exist_ok=True)
    output_doc.save(output_pdf, garbage=4, deflate=True)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Prepare an AUTO1 PDF report for client sharing.")
    parser.add_argument("input_pdf", type=Path, help="Source AUTO1 auction PDF.")
    parser.add_argument(
        "-o",
        "--output",
        type=Path,
        default=None,
        help="Output PDF path. Defaults to output/pdf/<input-name>-client.pdf.",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    input_pdf = args.input_pdf.expanduser().resolve()
    if args.output is None:
        output_pdf = Path("output/pdf") / f"{input_pdf.stem}-client.pdf"
    else:
        output_pdf = args.output.expanduser()

    convert_auto1_pdf(input_pdf, output_pdf)
    print(output_pdf)


if __name__ == "__main__":
    main()
