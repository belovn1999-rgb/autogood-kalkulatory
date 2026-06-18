#!/usr/bin/env python3
"""Validate the converter against the Peugeot sample PDFs.

The test intentionally checks business-visible output: page count, removed
phrases, and phrases that must remain. It can run against any generated output.
"""

from __future__ import annotations

import argparse
from pathlib import Path

import fitz


REMOVED_PHRASES = (
    "Save cash! You have a voucher",
    "Export advantage",
    "Stock number:",
    "CB82742",
    "In high demand!",
    "watchlist",
    "0:00 / 0:16",
    "Delivery to my address",
    "Kolejowa 102",
    "Delivery to closest pickup location",
    "Logistikzentrum Piotrków",
    "Pickup at car location",
    "Delivery or pick up process will",
    "Enjoy free parking",
    "Total Pictures:",
    "Copyright © 2026 Auto1.com",
    "Terms and Conditions",
    "Imprint",
)

REQUIRED_PHRASES = (
    "Build year:",
    "2018",
    "First registration:",
    "01/2019",
    "VEHICLE CONDITION",
    "DAMAGE SUMMARY",
    "CAR EQUIPMENT",
    "CAR SERVICE DETAILS",
    "CAR DATA ACCORDING TO IDENTIFICATION NUMBER (VIN)",
)


def extract_text(path: Path) -> tuple[int, str]:
    doc = fitz.open(path)
    text = "\n".join(page.get_text("text") for page in doc)
    count = doc.page_count
    doc.close()
    return count, text


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("pdf", type=Path)
    parser.add_argument("--expected-pages", type=int, default=12)
    args = parser.parse_args()

    page_count, text = extract_text(args.pdf)
    failures = []

    if page_count != args.expected_pages:
        failures.append(f"Expected {args.expected_pages} pages, got {page_count}.")

    for phrase in REMOVED_PHRASES:
        if phrase in text:
            failures.append(f"Removed phrase still present: {phrase}")

    for phrase in REQUIRED_PHRASES:
        if phrase not in text:
            failures.append(f"Required phrase missing: {phrase}")

    if failures:
        raise SystemExit("\n".join(failures))

    print(f"OK: {args.pdf} passed client-report checks.")


if __name__ == "__main__":
    main()

