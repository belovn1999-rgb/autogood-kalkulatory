#!/usr/bin/env python3
"""Add Mobile.de numeric search IDs to src/mobile-model-catalog.generated.js.

Mobile.de's search page only keeps the other filters when make/model are sent
as numeric IDs in `ms=<make>;<model>;<group>;<description>`. The SEO routes
(/auto/<make>-<model>.html) redirect and drop every filter, so every make,
model and model group in the catalog needs its numeric ID.

Source: the endpoints behind Mobile.de's own search form
  https://m.mobile.de/svc/r/makes/Car
  https://m.mobile.de/svc/r/models/<makeId>
Run: python3 tools/generate-mobile-de-ids.py [--from dump.json]
(--from reuses a saved [{"i", "n", "models": [...]}] dump when Mobile.de rate-limits.)
"""

import concurrent.futures
import json
import sys
import time
import unicodedata
import urllib.request
from pathlib import Path

CATALOG = Path(__file__).resolve().parent.parent / "src/mobile-model-catalog.generated.js"
PREFIX = "window.AUTOGOOD_MOBILE_MODEL_CATALOG = "
HEADERS = {"User-Agent": "Mozilla/5.0 (Macintosh) Chrome/128 Safari/537.36", "Accept-Language": "en"}


def fetch(url):
    # Mobile.de answers bursts with 403, so back off generously and retry.
    for attempt in range(6):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers=HEADERS), timeout=30) as response:
                return json.load(response)
        except Exception:
            if attempt == 5:
                raise
            time.sleep(5 * 2 ** attempt)


def norm(value):
    return unicodedata.normalize("NFKD", str(value)).encode("ascii", "ignore").decode().strip().lower()


source = CATALOG.read_text(encoding="utf-8")
header, body = source.split(PREFIX, 1)
catalog = json.loads(body.strip().rstrip(";"))

if "--from" in sys.argv:
    makes = json.loads(Path(sys.argv[sys.argv.index("--from") + 1]).read_text(encoding="utf-8"))
    models_by_make = {make["i"]: make["models"] for make in makes}
else:
    makes = fetch("https://m.mobile.de/svc/r/makes/Car?lang=en")["makes"]
    with concurrent.futures.ThreadPoolExecutor(2) as pool:
        models_by_make = dict(zip(
            [make["i"] for make in makes],
            pool.map(lambda make: fetch(f"https://m.mobile.de/svc/r/models/{make['i']}?lang=en")["models"], makes),
        ))
makes_by_name = {norm(make["n"]): make for make in makes}

make_ids, model_ids, group_ids, missing = {}, {}, {}, []
for brand in catalog["makeKeys"]:
    make = makes_by_name.get(norm(brand)) or makes_by_name.get(norm(catalog["makeLabels"].get(brand, "")))
    if not make:
        missing.append(brand)
        continue
    make_ids[brand] = str(make["i"])
    entries = models_by_make[make["i"]]
    model_ids[brand] = {entry["n"]: str(entry["i"]) for entry in entries if not entry.get("g")}
    groups = {entry["n"]: str(entry["i"]) for entry in entries if entry.get("g")}
    if groups:
        group_ids[brand] = groups

catalog["mobileDeMakeIds"] = make_ids
catalog["modelIds"] = model_ids
catalog["groupIds"] = group_ids
CATALOG.write_text(f"{header}{PREFIX}{json.dumps(catalog, ensure_ascii=False, indent=2)};\n", encoding="utf-8")
print(f"Saved IDs for {len(make_ids)} makes, {sum(map(len, model_ids.values()))} models, "
      f"{sum(map(len, group_ids.values()))} model groups.")
if missing:
    print("No Mobile.de ID for:", ", ".join(missing))
