#!/usr/bin/env python3
from __future__ import annotations

import atexit
import base64
import binascii
import json
import os
import secrets
import shutil
import subprocess
import tempfile
import threading
import time
import zipfile
from http import HTTPStatus
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import quote, unquote

from pypdf import PdfReader, PdfWriter


ROOT = Path(__file__).resolve().parents[1]
SERVER_VERSION = "AUTOGOODConverter/1.3"
DEFAULT_MAX_UPLOAD_BYTES = 15 * 1024 * 1024
DEFAULT_CONVERSION_TIMEOUT_SECONDS = 120
DEFAULT_LIBREOFFICE_STARTUP_TIMEOUT_SECONDS = 30

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


def libreoffice_startup_timeout_seconds() -> int:
    try:
        return int(
            os.environ.get(
                "LIBREOFFICE_STARTUP_TIMEOUT_SECONDS",
                str(DEFAULT_LIBREOFFICE_STARTUP_TIMEOUT_SECONDS),
            )
        )
    except ValueError:
        return DEFAULT_LIBREOFFICE_STARTUP_TIMEOUT_SECONDS


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


class LibreOfficeService:
    def __init__(self) -> None:
        self.soffice = find_soffice()
        self.profile = Path(tempfile.mkdtemp(prefix="autogood-lo-profile-"))
        self.process: subprocess.Popen[str] | None = None
        self.lock = threading.RLock()
        atexit.register(self.stop)

    @property
    def ready(self) -> bool:
        return self.process is not None and self.process.poll() is None

    def start(self) -> None:
        with self.lock:
            if self.ready:
                return
            if not self.soffice:
                raise RuntimeError("LibreOffice/soffice is not available.")

            shutil.rmtree(self.profile, ignore_errors=True)
            self.profile.mkdir(parents=True, exist_ok=True)
            pipe_name = f"autogood-pdf-{os.getpid()}"
            self.process = subprocess.Popen(
                [
                    self.soffice,
                    f"-env:UserInstallation={self.profile.as_uri()}",
                    "--headless",
                    "--invisible",
                    "--norestore",
                    "--nodefault",
                    "--nofirststartwizard",
                    f"--accept=pipe,name={pipe_name};urp;StarOffice.ComponentContext",
                ],
                text=True,
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL,
            )

            deadline = time.monotonic() + libreoffice_startup_timeout_seconds()
            while time.monotonic() < deadline:
                if self.process.poll() is not None:
                    raise RuntimeError("LibreOffice stopped during startup.")
                if (self.profile / ".lock").exists():
                    return
                time.sleep(0.1)
            self.stop()
            raise RuntimeError(
                f"LibreOffice startup timed out after {libreoffice_startup_timeout_seconds()} seconds."
            )

    def stop(self) -> None:
        with self.lock:
            if self.process is not None and self.process.poll() is None:
                self.process.terminate()
                try:
                    self.process.wait(timeout=5)
                except subprocess.TimeoutExpired:
                    self.process.kill()
                    self.process.wait(timeout=5)
            self.process = None
            shutil.rmtree(self.profile, ignore_errors=True)

    def convert(self, docx_path: Path, pdf_path: Path) -> float:
        with self.lock:
            self.start()
            generated = pdf_path.with_name(f"{docx_path.stem}.pdf")
            generated.unlink(missing_ok=True)
            started = time.monotonic()
            try:
                result = subprocess.run(
                    [
                        self.soffice,
                        f"-env:UserInstallation={self.profile.as_uri()}",
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
                raise RuntimeError(
                    f"LibreOffice conversion timed out after {conversion_timeout_seconds()} seconds."
                ) from exc

            duration_ms = (time.monotonic() - started) * 1000
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
            return duration_ms


LIBREOFFICE = LibreOfficeService()


def convert_docx_to_pdf(docx_path: Path, pdf_path: Path) -> float:
    return LIBREOFFICE.convert(docx_path, pdf_path)


def decode_pdf_password(value: str | None) -> str | None:
    if not value:
        return None
    try:
        password_bytes = base64.b64decode(value, validate=True)
        password = password_bytes.decode("utf-8")
    except (binascii.Error, UnicodeDecodeError) as exc:
        raise ValueError("Invalid PDF password encoding.") from exc
    if not password:
        raise ValueError("PDF password must not be empty.")
    if len(password_bytes) > 127:
        raise ValueError("PDF password is too long.")
    return password


def encrypt_pdf(source_path: Path, encrypted_path: Path, password: str) -> None:
    reader = PdfReader(source_path)
    writer = PdfWriter()
    writer.clone_document_from_reader(reader)
    writer.encrypt(
        user_password=password,
        owner_password=secrets.token_urlsafe(32),
        algorithm="AES-256",
    )
    with encrypted_path.open("wb") as output:
        writer.write(output)
    if not encrypted_path.read_bytes().startswith(b"%PDF-"):
        raise RuntimeError("Encrypted output is not a valid PDF file.")


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
        self.send_header("Access-Control-Allow-Headers", "Content-Type, X-Filename, X-PDF-Password")

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
            "ok": LIBREOFFICE.ready,
            "service": "AUTOGOOD DOCX to PDF converter",
            "soffice": bool(LIBREOFFICE.soffice),
            "libreoffice_ready": LIBREOFFICE.ready,
            "conversion_queue": "serial",
            "pdf_encryption": "AES-256",
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
        request_started = time.monotonic()
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
                password = decode_pdf_password(self.headers.get("X-PDF-Password"))
                conversion_duration_ms = convert_docx_to_pdf(docx_path, pdf_path)
                if password:
                    encrypted_path = temp / "contract-encrypted.pdf"
                    encrypt_pdf(pdf_path, encrypted_path, password)
                    pdf_path = encrypted_path
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
        total_duration_ms = (time.monotonic() - request_started) * 1000
        self.send_header(
            "Server-Timing",
            f"libreoffice;dur={conversion_duration_ms:.1f}, total;dur={total_duration_ms:.1f}",
        )
        self.end_headers()
        self.wfile.write(pdf)


def main() -> None:
    port = int(os.environ.get("PORT", "8787"))
    host = os.environ.get("HOST", "127.0.0.1")
    LIBREOFFICE.start()
    server = ThreadingHTTPServer((host, port), Handler)
    print(f"http://{host}:{port}/")
    server.serve_forever()


if __name__ == "__main__":
    main()
