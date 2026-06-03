#!/usr/bin/env python3
from __future__ import annotations

import os
import shutil
import subprocess
import tempfile
from http import HTTPStatus
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import unquote


ROOT = Path(__file__).resolve().parents[1]

ALLOWED_ORIGINS = {
    "http://127.0.0.1:8899",
    "http://127.0.0.1:8765",
    "http://localhost:8899",
    "http://localhost:8765",
    "https://belovn1999-rgb.github.io",
}


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


def convert_docx_to_pdf(docx_path: Path, pdf_path: Path) -> None:
    soffice = find_soffice()
    if not soffice:
        raise RuntimeError("LibreOffice/soffice is not available.")

    profile = pdf_path.parent / "lo-profile"
    profile.mkdir(parents=True, exist_ok=True)
    generated = pdf_path.with_name(f"{docx_path.stem}.pdf")
    generated.unlink(missing_ok=True)

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
        timeout=120,
        check=False,
    )

    if result.returncode != 0:
        details = " ".join((result.stderr or result.stdout or "unknown error").split())
        raise RuntimeError(f"LibreOffice conversion failed: {details}")
    if not generated.exists() or generated.stat().st_size == 0:
        details = " ".join((result.stderr or result.stdout or "PDF was not created").split())
        raise RuntimeError(f"LibreOffice did not create PDF: {details}")
    if generated != pdf_path:
        generated.replace(pdf_path)


class Handler(SimpleHTTPRequestHandler):
    server_version = "AUTOGOODConverter/1.0"

    def translate_path(self, path: str) -> str:
        clean = unquote(path.split("?", 1)[0]).lstrip("/")
        if not clean:
            clean = "index.html"
        return str(ROOT / clean)

    def add_cors_headers(self) -> None:
        origin = self.headers.get("origin")
        if origin in ALLOWED_ORIGINS:
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

    def do_POST(self) -> None:
        if self.path.split("?", 1)[0] != "/api/convert-docx-to-pdf":
            self.send_error(HTTPStatus.NOT_FOUND, "Unknown endpoint")
            return

        length = int(self.headers.get("content-length", "0"))
        if length <= 0:
            self.send_error(HTTPStatus.BAD_REQUEST, "Missing DOCX body")
            return
        if length > 15 * 1024 * 1024:
            self.send_error(HTTPStatus.REQUEST_ENTITY_TOO_LARGE, "DOCX is too large")
            return

        body = self.rfile.read(length)
        with tempfile.TemporaryDirectory(prefix="autogood-docx-pdf-") as temp_name:
            temp = Path(temp_name)
            docx_path = temp / "contract.docx"
            pdf_path = temp / "contract.pdf"
            docx_path.write_bytes(body)

            try:
                convert_docx_to_pdf(docx_path, pdf_path)
                pdf = pdf_path.read_bytes()
            except Exception as exc:
                message = f"PDF conversion failed: {exc}"
                encoded = message.encode("utf-8")
                self.send_response(HTTPStatus.INTERNAL_SERVER_ERROR)
                self.send_header("Content-Type", "text/plain; charset=utf-8")
                self.send_header("Content-Length", str(len(encoded)))
                self.end_headers()
                self.wfile.write(encoded)
                return

        filename = self.headers.get("X-Filename") or "Umowa_Zamowienia_Pojazdu.pdf"
        filename = Path(filename).name.replace(".docx", ".pdf")
        if not filename.lower().endswith(".pdf"):
            filename = f"{filename}.pdf"

        self.send_response(HTTPStatus.OK)
        self.send_header("Content-Type", "application/pdf")
        self.send_header("Content-Disposition", f'attachment; filename="{filename}"')
        self.send_header("Content-Length", str(len(pdf)))
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
