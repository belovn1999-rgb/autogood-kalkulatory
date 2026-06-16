#!/usr/bin/env python3
from __future__ import annotations

import os
import shutil
import subprocess
import tempfile
import json
import zipfile
from http import HTTPStatus
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import quote, unquote


ROOT = Path(__file__).resolve().parents[1]
SERVER_VERSION = "AUTOGOODConverter/1.1"
DEFAULT_MAX_UPLOAD_BYTES = 15 * 1024 * 1024
DEFAULT_CONVERSION_TIMEOUT_SECONDS = 120

DEFAULT_ALLOWED_ORIGINS = {
    "http://127.0.0.1:8899",
    "http://127.0.0.1:8787",
    "http://127.0.0.1:8765",
    "http://localhost:8899",
    "http://localhost:8787",
    "http://localhost:8765",
    "https://belovn1999-rgb.github.io",
}


def allowed_origins() -> set[str]:
    configured = {
        origin.strip()
        for origin in os.environ.get("ALLOWED_ORIGINS", "").split(",")
        if origin.strip()
    }
    return DEFAULT_ALLOWED_ORIGINS | configured


def find_soffice() -> str | None:
    candidates = [
        os.environ.get("SOFFICE_PATH"),
        shutil.which("soffice"),
        shutil.which("libreoffice"),
        "/Applications/LibreOffice.app/Contents/MacOS/soffice",
    ]
    for candidate in candidates:
        if candidate and Path(candidate).exists():
            return str(candidate)
    return None


def max_upload_bytes() -> int:
    try:
        return int(os.environ.get("MAX_UPLOAD_BYTES", str(DEFAULT_MAX_UPLOAD_BYTES)))
    except ValueError:
        return DEFAULT_MAX_UPLOAD_BYTES


def conversion_timeout_seconds() -> int:
    try:
        return int(os.environ.get("CONVERSION_TIMEOUT_SECONDS", str(DEFAULT_CONVERSION_TIMEOUT_SECONDS)))
    except ValueError:
        return DEFAULT_CONVERSION_TIMEOUT_SECONDS


def is_probable_docx(path: Path) -> bool:
    if not zipfile.is_zipfile(path):
        return False
    with zipfile.ZipFile(path) as archive:
        names = set(archive.namelist())
    return "[Content_Types].xml" in names and "word/document.xml" in names


def sanitize_download_filename(value: str | None) -> str:
    filename = unquote(value or "Umowa_Zamowienia_Pojazdu.pdf")
    filename = Path(filename).name.replace("\x00", "").replace('"', "").replace("\\", "").replace(".docx", ".pdf")
    if not filename.lower().endswith(".pdf"):
        filename = f"{filename}.pdf"
    return filename or "Umowa_Zamowienia_Pojazdu.pdf"


def convert_docx_to_pdf(docx_path: Path, pdf_path: Path) -> None:
    soffice = find_soffice()
    if not soffice:
        raise RuntimeError("LibreOffice/soffice is not available.")

    profile = pdf_path.parent / "lo-profile"
    profile.mkdir(parents=True, exist_ok=True)
    generated = pdf_path.with_name(f"{docx_path.stem}.pdf")
    generated.unlink(missing_ok=True)

    try:
        result = subprocess.run(
            [
                soffice,
                f"-env:UserInstallation=file://{profile}",
                "--headless",
                "--norestore",
                "--convert-to",
                "pdf",
                "--outdir",
                str(pdf_path.parent),
                str(docx_path),
            ],
            text=True,
            capture_output=True,
            timeout=conversion_timeout_seconds(),
            check=False,
        )
    except subprocess.TimeoutExpired as exc:
        raise RuntimeError(f"LibreOffice conversion timed out after {conversion_timeout_seconds()} seconds.") from exc

    if result.returncode != 0:
        details = " ".join((result.stderr or result.stdout or "unknown error").split())
        raise RuntimeError(f"LibreOffice conversion failed: {details}")
    if not generated.exists() or generated.stat().st_size == 0:
        details = " ".join((result.stderr or result.stdout or "PDF was not created").split())
        raise RuntimeError(f"LibreOffice did not create PDF: {details}")
    if generated != pdf_path:
        generated.replace(pdf_path)
    if not pdf_path.read_bytes().startswith(b"%PDF-"):
        raise RuntimeError("LibreOffice output is not a valid PDF file.")


class Handler(SimpleHTTPRequestHandler):
    server_version = SERVER_VERSION

    def translate_path(self, path: str) -> str:
        clean = unquote(path.split("?", 1)[0]).lstrip("/")
        if not clean:
            clean = "index.html"
        return str(ROOT / clean)

    def add_cors_headers(self) -> None:
        origin = self.headers.get("origin")
        allowed = allowed_origins()
        if "*" in allowed:
            self.send_header("Access-Control-Allow-Origin", "*")
        elif origin in allowed:
            self.send_header("Access-Control-Allow-Origin", origin)
            self.send_header("Vary", "Origin")
        self.send_header("Access-Control-Allow-Methods", "POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, X-Filename")

    def end_headers(self) -> None:
        self.add_cors_headers()
        super().end_headers()

    def do_OPTIONS(self) -> None:
        self.send_response(HTTPStatus.NO_CONTENT)
        self.end_headers()

    def do_GET(self) -> None:
        if self.path.split("?", 1)[0] != "/api/health":
            super().do_GET()
            return

        payload = {
            "ok": bool(find_soffice()),
            "service": "AUTOGOOD DOCX to PDF converter",
            "soffice": bool(find_soffice()),
            "version": SERVER_VERSION,
            "max_upload_bytes": max_upload_bytes(),
            "conversion_timeout_seconds": conversion_timeout_seconds(),
        }
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(HTTPStatus.OK if payload["ok"] else HTTPStatus.SERVICE_UNAVAILABLE)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(body)

    def do_POST(self) -> None:
        if self.path.split("?", 1)[0] != "/api/convert-docx-to-pdf":
            self.send_error(HTTPStatus.NOT_FOUND, "Unknown endpoint")
            return

        length = int(self.headers.get("content-length", "0"))
        if length <= 0:
            self.send_error(HTTPStatus.BAD_REQUEST, "Missing DOCX body")
            return
        if length > max_upload_bytes():
            self.send_error(HTTPStatus.REQUEST_ENTITY_TOO_LARGE, "DOCX is too large")
            return

        body = self.rfile.read(length)
        with tempfile.TemporaryDirectory(prefix="autogood-docx-pdf-") as temp_name:
            temp = Path(temp_name)
            docx_path = temp / "contract.docx"
            pdf_path = temp / "contract.pdf"
            docx_path.write_bytes(body)

            try:
                if not is_probable_docx(docx_path):
                    raise ValueError("Request body is not a valid DOCX file.")
                convert_docx_to_pdf(docx_path, pdf_path)
                pdf = pdf_path.read_bytes()
            except Exception as exc:
                message = f"PDF conversion failed: {exc}"
                encoded = message.encode("utf-8")
                status = HTTPStatus.BAD_REQUEST if isinstance(exc, ValueError) else HTTPStatus.INTERNAL_SERVER_ERROR
                self.send_response(status)
                self.send_header("Content-Type", "text/plain; charset=utf-8")
                self.send_header("Content-Length", str(len(encoded)))
                self.end_headers()
                self.wfile.write(encoded)
                return

        filename = sanitize_download_filename(self.headers.get("X-Filename"))
        ascii_filename = filename.encode("ascii", "ignore").decode("ascii") or "Umowa_Zamowienia_Pojazdu.pdf"

        self.send_response(HTTPStatus.OK)
        self.send_header("Content-Type", "application/pdf")
        self.send_header("Content-Disposition", f"attachment; filename=\"{ascii_filename}\"; filename*=UTF-8''{quote(filename, safe='')}")
        self.send_header("Content-Length", str(len(pdf)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(pdf)


def main() -> None:
    port = int(os.environ.get("PORT", "8787"))
    host = os.environ.get("HOST", "127.0.0.1")
    server = ThreadingHTTPServer((host, port), Handler)
    print(f"http://{host}:{port}/")
    server.serve_forever()


if __name__ == "__main__":
    main()
