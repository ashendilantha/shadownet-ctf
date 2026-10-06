#!/usr/bin/env python3
"""
ShadowNet CTF - Stage 2: Covert Transmissions HTTP Asset Server
Zero-dependency HTTP server utilizing Python's built-in standard library.
Listens on port 5000.
Serves intercepted evidence assets for player reconnaissance and analysis.
STRICT SECURITY POLICY: passphrase.txt is strictly forbidden and blocked.
"""

import os
import io
import mimetypes
import zipfile
from http import HTTPStatus
from http.server import ThreadingHTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, unquote

PORT = int(os.environ.get("PORT", 5000))
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ASSETS_DIR = os.path.join(BASE_DIR, "assets")

PUBLIC_FILES = {
    "whistleblower.jpg",
    "intercept_alpha_09.wav",
    "intercept_beta_02.wav",
    "intercept_gamma_07.wav",
    "spectrogram_reference.png",
}

FORBIDDEN_FILES = {
    "passphrase.txt",
    "passphrase",
    ".env",
    "generate_spectrogram.py",
}

CLI_TEXT = """======================================================================
  SHADOWNET // STAGE 02: COVERT TRANSMISSIONS ARCHIVE
  STATUS: BROADCAST ACTIVE | PORT: 5000 | RANGE NODE: ONLINE
======================================================================

[+] RECOVERED INTERCEPT PAYLOADS AVAILABLE FOR EXTRACTION:

  [1] whistleblower.jpg          - Recovered Drone Evidence Exhibit
  [2] intercept_alpha_09.wav      - Encrypted Channel Alpha (Authentic)
  [3] intercept_beta_02.wav       - Encrypted Channel Beta (Telemetry)
  [4] intercept_gamma_07.wav      - Encrypted Channel Gamma (Decoy)
  [5] spectrogram_reference.png   - Spectrogram Frequency Reference
  [6] stage2-assets.zip          - Complete Analysis Bundle (All 5 Assets)

----------------------------------------------------------------------
DOWNLOAD COMMANDS:
  wget http://localhost:5001/whistleblower.jpg
  wget http://localhost:5001/intercept_alpha_09.wav
  wget http://localhost:5001/intercept_beta_02.wav
  wget http://localhost:5001/intercept_gamma_07.wav
  wget http://localhost:5001/stage2-assets.zip

RECONNAISSANCE PROTOCOL:
  1. Inspect whistleblower evidence image for embedded metadata / steg payload.
  2. Perform audio frequency spectrogram analysis on authentic transmissions.
======================================================================
"""

HTML_PAGE = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>ShadowNet // Stage 02: Covert Transmissions</title>
  <style>
    body {
      background-color: #090B0D;
      color: #F5F5F5;
      font-family: 'JetBrains Mono', 'Courier New', monospace;
      margin: 0;
      padding: 40px 20px;
      display: flex;
      justify-content: center;
    }
    .container {
      max-width: 800px;
      width: 100%;
      background: #111417;
      border: 1px solid #252A30;
      border-radius: 16px;
      padding: 32px;
      box-shadow: 0 0 40px rgba(0,0,0,0.8);
    }
    .header {
      border-bottom: 1px solid #252A30;
      padding-bottom: 20px;
      margin-bottom: 24px;
    }
    h1 {
      color: #FF6B00;
      font-size: 24px;
      margin: 0 0 8px 0;
    }
    .badge {
      display: inline-block;
      padding: 2px 10px;
      border-radius: 9999px;
      background: rgba(34, 211, 238, 0.1);
      border: 1px solid rgba(34, 211, 238, 0.3);
      color: #22D3EE;
      font-size: 11px;
    }
    .file-list {
      list-style: none;
      padding: 0;
      margin: 20px 0;
    }
    .file-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 16px;
      background: #171B20;
      border: 1px solid #252A30;
      border-radius: 8px;
      margin-bottom: 10px;
    }
    .file-name {
      color: #F5F5F5;
      font-weight: bold;
    }
    .btn {
      background: #FF6B00;
      color: #090B0D;
      text-decoration: none;
      font-weight: bold;
      font-size: 12px;
      padding: 6px 14px;
      border-radius: 6px;
      transition: background 0.2s;
    }
    .btn:hover {
      background: #FF9F43;
    }
    .cmd-box {
      background: #090B0D;
      border: 1px solid #252A30;
      padding: 14px;
      border-radius: 8px;
      color: #22D3EE;
      font-size: 12px;
      margin-top: 20px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="badge">RANGE NODE: ONLINE // PORT 5000</div>
      <h1>SHADOWNET // STAGE 2: COVERT TRANSMISSIONS</h1>
      <p style="color: #8B949E; font-size: 13px; margin: 0;">Recovered audio spectrums and surveillance evidence ready for intelligence extraction.</p>
    </div>

    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
      <h3 style="margin: 0; font-size: 15px; color: #F5F5F5;">INTERCEPTED EVIDENCE FILES</h3>
      <a href="/stage2-assets.zip" class="btn">DOWNLOAD FULL BUNDLE (.ZIP)</a>
    </div>

    <ul class="file-list">
      <li class="file-item">
        <div>
          <div class="file-name">whistleblower.jpg</div>
          <small style="color: #8B949E;">Drone Reconnaissance Evidence Photograph</small>
        </div>
        <a href="/whistleblower.jpg" class="btn" download>DOWNLOAD</a>
      </li>
      <li class="file-item">
        <div>
          <div class="file-name">intercept_alpha_09.wav</div>
          <small style="color: #22C55E;">Authentic Encrypted Transmission (Spectrogram Target)</small>
        </div>
        <a href="/intercept_alpha_09.wav" class="btn" download>DOWNLOAD</a>
      </li>
      <li class="file-item">
        <div>
          <div class="file-name">intercept_beta_02.wav</div>
          <small style="color: #8B949E;">Decoy Audio Feed (Telemetry Sweep)</small>
        </div>
        <a href="/intercept_beta_02.wav" class="btn" download>DOWNLOAD</a>
      </li>
      <li class="file-item">
        <div>
          <div class="file-name">intercept_gamma_07.wav</div>
          <small style="color: #8B949E;">Decoy Audio Feed (Jamming Broadcast)</small>
        </div>
        <a href="/intercept_gamma_07.wav" class="btn" download>DOWNLOAD</a>
      </li>
      <li class="file-item">
        <div>
          <div class="file-name">spectrogram_reference.png</div>
          <small style="color: #8B949E;">Spectral Analysis Calibration Reference</small>
        </div>
        <a href="/spectrogram_reference.png" class="btn" download>DOWNLOAD</a>
      </li>
    </ul>

    <div class="cmd-box">
      <strong>QUICK CLI DOWNLOAD COMMANDS:</strong><br>
      <code>wget http://localhost:5000/whistleblower.jpg</code><br>
      <code>wget http://localhost:5000/intercept_alpha_09.wav</code><br>
      <code>wget http://localhost:5000/stage2-assets.zip</code>
    </div>
  </div>
</body>
</html>"""


class Stage2HTTPHandler(BaseHTTPRequestHandler):
    def send_cors_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "*")

    def do_OPTIONS(self):
        self.send_response(HTTPStatus.NO_CONTENT)
        self.send_cors_headers()
        self.end_headers()

    def do_HEAD(self):
        parsed = urlparse(self.path)
        path = unquote(parsed.path).lstrip("/")
        basename = os.path.basename(path)

        if path == "" or path == "index.html":
            self.send_response(HTTPStatus.OK)
            self.send_header("Content-Type", "text/plain; charset=utf-8")
            self.send_cors_headers()
            self.end_headers()
            return

        if basename in FORBIDDEN_FILES or "passphrase" in basename.lower():
            self.send_response(HTTPStatus.FORBIDDEN)
            self.send_header("Content-Type", "application/json")
            self.send_cors_headers()
            self.end_headers()
            return

        if basename in ("stage2-assets.zip", "assets.zip", "download-all"):
            self.send_response(HTTPStatus.OK)
            self.send_header("Content-Type", "application/zip")
            self.send_cors_headers()
            self.end_headers()
            return

        if basename in PUBLIC_FILES:
            target_path = os.path.join(ASSETS_DIR, basename)
            if os.path.isfile(target_path):
                file_size = os.path.getsize(target_path)
                mime_type, _ = mimetypes.guess_type(target_path)
                self.send_response(HTTPStatus.OK)
                self.send_header("Content-Type", mime_type or "application/octet-stream")
                self.send_header("Content-Length", str(file_size))
                self.send_cors_headers()
                self.end_headers()
                return

        self.send_response(HTTPStatus.NOT_FOUND)
        self.send_cors_headers()
        self.end_headers()

    def do_GET(self):
        parsed = urlparse(self.path)
        path = unquote(parsed.path).lstrip("/")
        basename = os.path.basename(path)

        # 1. Root index route
        if path == "" or path == "index.html":
            ua = self.headers.get("User-Agent", "").lower()
            if "curl" in ua or "wget" in ua or "httpie" in ua:
                content = CLI_TEXT.encode("utf-8")
                self.send_response(HTTPStatus.OK)
                self.send_header("Content-Type", "text/plain; charset=utf-8")
                self.send_header("Content-Length", str(len(content)))
                self.send_cors_headers()
                self.end_headers()
                self.wfile.write(content)
            else:
                content = HTML_PAGE.encode("utf-8")
                self.send_response(HTTPStatus.OK)
                self.send_header("Content-Type", "text/html; charset=utf-8")
                self.send_header("Content-Length", str(len(content)))
                self.send_cors_headers()
                self.end_headers()
                self.wfile.write(content)
            return

        # 2. Strict Security: Block passphrase.txt
        if basename in FORBIDDEN_FILES or "passphrase" in basename.lower():
            err_msg = b'{"error":"CLASSIFIED_METADATA_LOCKED","message":"Direct download of passphrase.txt is strictly forbidden. Extract via whistleblower.jpg using steghide."}\n'
            self.send_response(HTTPStatus.FORBIDDEN)
            self.send_header("Content-Type", "application/json")
            self.send_header("Content-Length", str(len(err_msg)))
            self.send_cors_headers()
            self.end_headers()
            self.wfile.write(err_msg)
            return

        # 3. Zip bundle route
        if basename in ("stage2-assets.zip", "assets.zip", "download-all"):
            mem_file = io.BytesIO()
            with zipfile.ZipFile(mem_file, "w", zipfile.ZIP_DEFLATED) as zf:
                for fname in sorted(PUBLIC_FILES):
                    fpath = os.path.join(ASSETS_DIR, fname)
                    if os.path.isfile(fpath):
                        zf.write(fpath, arcname=fname)
            zip_bytes = mem_file.getvalue()
            self.send_response(HTTPStatus.OK)
            self.send_header("Content-Type", "application/zip")
            self.send_header("Content-Disposition", 'attachment; filename="stage2-covert-transmissions.zip"')
            self.send_header("Content-Length", str(len(zip_bytes)))
            self.send_cors_headers()
            self.end_headers()
            self.wfile.write(zip_bytes)
            return

        # 4. Public evidence file download
        if basename in PUBLIC_FILES:
            target_path = os.path.join(ASSETS_DIR, basename)
            if os.path.isfile(target_path):
                file_size = os.path.getsize(target_path)
                mime_type, _ = mimetypes.guess_type(target_path)
                if not mime_type:
                    mime_type = "application/octet-stream"

                self.send_response(HTTPStatus.OK)
                self.send_header("Content-Type", mime_type)
                self.send_header("Content-Disposition", f'attachment; filename="{basename}"')
                self.send_header("Content-Length", str(file_size))
                self.send_cors_headers()
                self.end_headers()

                with open(target_path, "rb") as f:
                    while chunk := f.read(65536):
                        self.wfile.write(chunk)
                return

        # 5. Not found
        not_found = b'{"error":"NOT_FOUND","message":"Requested file not found in transmission archive."}\n'
        self.send_response(HTTPStatus.NOT_FOUND)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(not_found)))
        self.send_cors_headers()
        self.end_headers()
        self.wfile.write(not_found)

    def log_message(self, format, *args):
        # Clean logging
        print(f"[Stage 2 Server] {self.address_string()} - {format % args}")


class ReusableThreadingServer(ThreadingHTTPServer):
    allow_reuse_address = True


def run_server():
    server = ReusableThreadingServer(("0.0.0.0", PORT), Stage2HTTPHandler)
    print(f"[*] ShadowNet Stage 2 HTTP Asset Server listening on http://0.0.0.0:{PORT}")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n[*] Shutting down server.")
        server.server_close()


if __name__ == "__main__":
    run_server()
