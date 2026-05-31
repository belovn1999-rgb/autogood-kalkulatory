#!/usr/bin/env python3
from __future__ import annotations

import json
import os
import re
import shutil
import subprocess
import sys
from datetime import datetime
from http import HTTPStatus
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import unquote

from generate_contract import fill_docx


ROOT = Path(__file__).resolve().parent
WEB_ROOT = ROOT / "web"
OUTPUT_DIR = ROOT / "output"


def normalize_space(value: str) -> str:
    return re.sub(r"\s+", " ", value).strip()


LABELS = {
    "client": ["Клиент", "Client", "Klient"],
    "client_type": ["Тип клиента", "Rodzaj klienta"],
    "address": ["Адрес", "Adres"],
    "pesel": ["PESEL"],
    "nip": ["NIP"],
    "document": ["Документ", "Dokument"],
    "phone": ["Телефон", "Telefon", "Nr. tel", "Nr tel"],
    "email": ["Email", "E-mail", "Mail"],
    "vehicle_marker": ["Авто", "Auto", "Samochód", "Pojazd"],
    "make": ["Марка", "Marka"],
    "model": ["Модель", "Model"],
    "year": ["Год", "Rok", "Wiek"],
    "body": ["Тип кузова", "Nadwozie"],
    "fuel": ["Топливо", "Paliwo"],
    "gearbox": ["Коробка", "Skrzynia"],
    "budget": ["Бюджет", "Budżet", "Budzet"],
    "deposit": ["Депозит", "Заливка", "Заличка", "Zaliczka"],
    "extra": ["Дополнительно", "Dodatkowo", "Wyposażenie"],
}


ALL_LABELS = [label for labels in LABELS.values() for label in labels]


def extract_labeled(text: str, labels: list[str]) -> str:
    label_pattern = "|".join(re.escape(label) for label in labels)
    next_label_pattern = "|".join(re.escape(label) for label in ALL_LABELS)
    pattern = rf"(?:^|[\s,;])(?:{label_pattern})\s*:\s*(.*?)(?=(?:\s+(?:{next_label_pattern})\s*:)|$)"
    match = re.search(pattern, text, re.I | re.S)
    return normalize_space(match.group(1)) if match else ""


def cleanup_choice(value: str) -> str:
    value = normalize_space(value)
    if "/" in value:
        value = value.split("/", 1)[0]
    return normalize_space(value)


def parse_body(value: str) -> dict:
    raw = cleanup_choice(value)
    lower = raw.lower()
    for body in ["sedan", "kombi", "coupe"]:
        if re.search(rf"\b{body}\b", lower):
            return {"type": body, "other": ""}
    other_match = re.search(r"inne\s*:\s*(.+)", raw, re.I)
    if other_match:
        return {"type": "inne", "other": normalize_space(other_match.group(1))}
    if raw:
        return {"type": "inne", "other": raw}
    return {"type": None, "other": ""}


def parse_fuel(value: str) -> list[str]:
    lower = cleanup_choice(value).lower()
    result = []
    for fuel in ["benzyna", "diesel", "hybryda", "elektryk"]:
        if fuel in lower:
            result.append(fuel)
    return result


def parse_gearbox(value: str) -> str | None:
    lower = cleanup_choice(value).lower()
    if "automat" in lower:
        return "automatyczna"
    if "manual" in lower:
        return "manualna"
    return None


def parse_raw_text(text: str) -> dict:
    text = text.replace("\r", "\n")
    compact = normalize_space(text)
    lines = [normalize_space(line) for line in text.splitlines() if normalize_space(line)]
    joined = "\n".join(lines) if lines else compact
    lower = joined.lower()

    email = extract_labeled(compact, LABELS["email"])
    if not email:
        email = next(iter(re.findall(r"[\w.+-]+@[\w.-]+\.[a-zA-Z]{2,}", joined)), "")

    phone = ""
    labeled_phone = extract_labeled(compact, LABELS["phone"])
    phone_matches = [labeled_phone] if labeled_phone else re.findall(r"(?:\+48[\s-]?)?\d{3}[\s-]?\d{3}[\s-]?\d{3}", joined)
    for candidate in phone_matches:
        digits = re.sub(r"\D", "", candidate)
        if digits.startswith("48") or len(digits) == 9:
            start = joined.find(candidate)
            before = joined[start - 1 : start] if start > 0 else ""
            after = joined[start + len(candidate) : start + len(candidate) + 1]
            if not (before.isdigit() or after.isdigit()):
                phone = candidate
                break

    pesel = re.sub(r"\D", "", extract_labeled(compact, LABELS["pesel"]))
    if not pesel:
        pesel = next(iter(re.findall(r"\b\d{11}\b", joined)), "")

    nip_match = extract_labeled(compact, LABELS["nip"])
    if not nip_match:
        nip_match = next(iter(re.findall(r"\b(?:NIP[:\s]*)?(\d{3}[-\s]?\d{3}[-\s]?\d{2}[-\s]?\d{2})\b", joined, re.I)), "")
    nip = re.sub(r"\D", "", nip_match)

    client_type_value = extract_labeled(compact, LABELS["client_type"]).lower()
    company_markers = ["sp. z o.o", "sp z oo", "spółka", "s.a.", "nip", "krs"]
    is_company = (
        "firma" in client_type_value
        or "фирм" in client_type_value
        or bool(nip and any(marker in lower for marker in company_markers))
    )

    document = extract_labeled(compact, LABELS["document"])
    document_patterns = [
        r"(dow[oó]d osobisty[:\s]+[A-Z0-9 ]+)",
        r"(karta pobytu[:\s]+[A-Z0-9 ]+)",
        r"(paszport[:\s]+[A-Z0-9 ]+)",
    ]
    if not document:
        for pattern in document_patterns:
            match = re.search(pattern, joined, re.I)
            if match:
                document = normalize_space(match.group(1))
                document = document[:1].upper() + document[1:]
                break

    name = extract_labeled(compact, LABELS["client"])
    if not name:
        for line in lines:
            if any(value and value in line for value in [email, phone, pesel, nip_match]):
                continue
            if re.search(r"budżet|budzet|зал|депозит|adres|адрес|pesel|nip|dow[oó]d|paszport|karta", line, re.I):
                continue
            name = line
            break

    address = extract_labeled(compact, LABELS["address"])
    if not address:
        for line in lines:
            if line == name:
                continue
            if re.search(r"\d{2}-\d{3}", line) or re.search(r"\bul\.|\baleja\b|\bplac\b", line, re.I):
                address = line
                break

    budget_total = extract_labeled(compact, LABELS["budget"])
    budget_advance = extract_labeled(compact, LABELS["deposit"])

    make = extract_labeled(compact, LABELS["make"])
    model = extract_labeled(compact, LABELS["model"])
    make_model = normalize_space(f"{make} {model}") if make or model else ""

    body = parse_body(extract_labeled(compact, LABELS["body"]))
    fuel = parse_fuel(extract_labeled(compact, LABELS["fuel"]))
    gearbox = parse_gearbox(extract_labeled(compact, LABELS["gearbox"]))
    first_registration = extract_labeled(compact, LABELS["year"])
    extra = extract_labeled(compact, LABELS["extra"])

    return {
        "client": {
            "type": "company" if is_company else "person",
            "name": name,
            "address": address,
            "identifier": nip if is_company else pesel,
            "document": "" if is_company else document,
            "phone": normalize_space(phone),
            "email": email,
        },
        "budget": {
            "total": budget_total,
            "advance": budget_advance,
        },
        "vehicle": {
            "make_model": make_model,
            "fuel": fuel,
            "gearbox": gearbox,
            "first_registration": first_registration,
            "body": body,
            "required_equipment": extra,
        },
    }


def output_filename(data: dict, suffix: str = ".docx") -> str:
    date_text = data.get("contract", {}).get("date") or datetime.now().strftime("%Y-%m-%d")
    client_name = data.get("client", {}).get("name") or "klient"
    slug = re.sub(r"[^A-Za-z0-9ąćęłńóśźżĄĆĘŁŃÓŚŹŻ]+", "-", client_name, flags=re.U).strip("-")
    return f"umowa-{date_text}-{slug or 'klient'}{suffix}"


def find_soffice() -> str | None:
    candidates = [
        os.environ.get("SOFFICE_PATH"),
        "/Applications/LibreOffice.app/Contents/MacOS/soffice",
        "/tmp/autogood-libreoffice/LibreOffice.app/Contents/MacOS/soffice",
        shutil.which("soffice"),
        shutil.which("libreoffice"),
    ]
    for candidate in candidates:
        if candidate and Path(candidate).exists():
            return str(candidate)
    return None


def convert_docx_to_pdf_with_libreoffice(input_docx: Path, output_pdf: Path) -> None:
    soffice = find_soffice()
    if not soffice:
        raise RuntimeError("LibreOffice nie jest zainstalowany.")

    profile = OUTPUT_DIR / "libreoffice-profile"
    profile.mkdir(parents=True, exist_ok=True)
    temp_dir = output_pdf.parent
    generated_pdf = temp_dir / f"{input_docx.stem}.pdf"
    generated_pdf.unlink(missing_ok=True)

    result = subprocess.run(
        [
            soffice,
            f"-env:UserInstallation=file://{profile}",
            "--headless",
            "--convert-to",
            "pdf",
            "--outdir",
            str(temp_dir),
            str(input_docx),
        ],
        text=True,
        capture_output=True,
        timeout=120,
        check=False,
    )

    if result.returncode != 0:
        details = normalize_space(result.stderr or result.stdout or "nieznany błąd")
        raise RuntimeError(f"LibreOffice nie przygotował PDF: {details}")

    if not generated_pdf.exists() or generated_pdf.stat().st_size == 0:
        details = normalize_space(result.stderr or result.stdout or "brak pliku PDF")
        raise RuntimeError(f"LibreOffice nie utworzył pliku PDF: {details}")

    if generated_pdf != output_pdf:
        generated_pdf.replace(output_pdf)


def convert_docx_to_pdf(input_docx: Path, output_pdf: Path) -> None:
    soffice = find_soffice()
    if not soffice:
        raise RuntimeError("LibreOffice nie jest zainstalowany. PDF wymaga LibreOffice.app.")
    convert_docx_to_pdf_with_libreoffice(input_docx, output_pdf)


class Handler(SimpleHTTPRequestHandler):
    def end_headers(self) -> None:
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
        self.send_header("Pragma", "no-cache")
        super().end_headers()

    def translate_path(self, path: str) -> str:
        clean = unquote(path.split("?", 1)[0])
        if clean.startswith("/assets/"):
            return str(ROOT / clean.lstrip("/"))
        if clean == "/":
            return str(WEB_ROOT / "index.html")
        return str(WEB_ROOT / clean.lstrip("/"))

    def do_POST(self) -> None:
        length = int(self.headers.get("content-length", "0"))
        payload = self.rfile.read(length).decode("utf-8")
        try:
            data = json.loads(payload or "{}")
        except json.JSONDecodeError:
            self.send_error(HTTPStatus.BAD_REQUEST, "Invalid JSON")
            return

        if self.path == "/api/parse":
            self.send_json(parse_raw_text(data.get("text", "")))
            return

        if self.path == "/api/generate":
            self.generate_docx(data)
            return

        if self.path == "/api/generate-pdf":
            self.generate_pdf(data)
            return

        self.send_error(HTTPStatus.NOT_FOUND, "Unknown endpoint")

    def send_json(self, data: dict) -> None:
        body = json.dumps(data, ensure_ascii=False).encode("utf-8")
        self.send_response(HTTPStatus.OK)
        self.send_header("content-type", "application/json; charset=utf-8")
        self.send_header("content-length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def generate_docx(self, data: dict) -> None:
        try:
            OUTPUT_DIR.mkdir(exist_ok=True)
            filename = output_filename(data)
            output = OUTPUT_DIR / filename
            fill_docx(data, output)
            body = output.read_bytes()
        except Exception as exc:
            message = f"Generation failed: {exc}"
            self.send_response(HTTPStatus.INTERNAL_SERVER_ERROR)
            self.send_header("content-type", "text/plain; charset=utf-8")
            self.end_headers()
            self.wfile.write(message.encode("utf-8"))
            return

        self.send_response(HTTPStatus.OK)
        self.send_header("content-type", "application/vnd.openxmlformats-officedocument.wordprocessingml.document")
        self.send_header("content-disposition", f'attachment; filename="{filename}"')
        self.send_header("content-length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def generate_pdf(self, data: dict) -> None:
        try:
            OUTPUT_DIR.mkdir(exist_ok=True)
            docx_filename = output_filename(data, ".docx")
            pdf_filename = output_filename(data, ".pdf")
            docx_output = OUTPUT_DIR / docx_filename
            pdf_output = OUTPUT_DIR / pdf_filename
            fill_docx(data, docx_output)
            convert_docx_to_pdf(docx_output, pdf_output)
            body = pdf_output.read_bytes()
        except Exception as exc:
            message = f"PDF generation failed: {exc}"
            self.send_response(HTTPStatus.INTERNAL_SERVER_ERROR)
            self.send_header("content-type", "text/plain; charset=utf-8")
            self.end_headers()
            self.wfile.write(message.encode("utf-8"))
            return

        self.send_response(HTTPStatus.OK)
        self.send_header("content-type", "application/pdf")
        self.send_header("content-disposition", f'attachment; filename="{pdf_filename}"')
        self.send_header("content-length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)


def main() -> None:
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8765
    server = ThreadingHTTPServer(("127.0.0.1", port), Handler)
    print(f"http://127.0.0.1:{port}/")
    server.serve_forever()


if __name__ == "__main__":
    main()
