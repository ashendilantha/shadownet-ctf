#!/usr/bin/env python3
"""
NexaCorp Entry Host Web Application (Stage 8)
Vulnerable to Server-Side Request Forgery (SSRF) via /fetch
Supports both Flask and Python Standard Library fallback.
"""

import os
import sys
import json
import urllib.parse
from pathlib import Path

TEMPLATES_DIR = Path(__file__).parent / "templates"
INDEX_FILE = TEMPLATES_DIR / "index.html"

PORT = int(os.environ.get("STAGE8_PORT", os.environ.get("PORT", 3008)))

try:
    from flask import Flask, request, render_template, jsonify
    import requests
    USE_FLASK = True
except ImportError:
    USE_FLASK = False
    import urllib.request
    from http.server import HTTPServer, BaseHTTPRequestHandler

def fetch_url(url, timeout=5):
    """
    Performs SSRF fetch.
    If 192.168.100.10:8080 is requested and the host interface is unrouted,
    gracefully connects to internal metadata service.
    """
    try:
        if USE_FLASK:
            r = requests.get(url, timeout=timeout)
            return r.status_code, r.text[:500]
        else:
            req = urllib.request.Request(url, headers={'User-Agent': 'NexaCorp-Fetcher/1.0'})
            with urllib.request.urlopen(req, timeout=timeout) as resp:
                return resp.status, resp.read(500).decode('utf-8', errors='replace')
    except Exception as e:
        if "192.168.100.10:8080" in url:
            alt_url = url.replace("192.168.100.10:8080", "127.0.0.1:8080")
            try:
                if USE_FLASK:
                    r = requests.get(alt_url, timeout=timeout)
                    return r.status_code, r.text[:500]
                else:
                    req = urllib.request.Request(alt_url, headers={'User-Agent': 'NexaCorp-Fetcher/1.0'})
                    with urllib.request.urlopen(req, timeout=timeout) as resp:
                        return resp.status, resp.read(500).decode('utf-8', errors='replace')
            except Exception:
                raise e
        raise e

if USE_FLASK:
    app = Flask(__name__)

    @app.route('/')
    def home():
        return render_template('index.html')

    @app.route('/fetch', methods=['GET'])
    def fetch():
        url = request.args.get('url', '')
        if not url:
            return {'error': 'URL parameter missing'}, 400
        if not url.startswith('http'):
            return {'error': 'Invalid URL'}, 400

        try:
            status_code, content = fetch_url(url)
            return {
                'url': url,
                'status': status_code,
                'content': content
            }
        except Exception as e:
            return {'url': url, 'error': str(e)}, 500

    @app.route('/admin', methods=['GET', 'POST'])
    def admin():
        return {'message': 'This endpoint doesn\'t do anything yet'}

    def run_server(host='0.0.0.0', port=PORT):
        app.run(host=host, port=port, debug=False)

else:
    class EntryHandler(BaseHTTPRequestHandler):
        def do_GET(self):
            parsed = urllib.parse.urlparse(self.path)
            path = parsed.path
            params = urllib.parse.parse_qs(parsed.query)

            if path == '/':
                content = INDEX_FILE.read_bytes() if INDEX_FILE.exists() else b"NexaCorp URL Fetcher"
                self.send_response(200)
                self.send_header('Content-Type', 'text/html; charset=utf-8')
                self.end_headers()
                self.wfile.write(content)

            elif path == '/fetch':
                url = params.get('url', [''])[0]
                if not url:
                    self._send_json({'error': 'URL parameter missing'}, 400)
                    return
                if not url.startswith('http'):
                    self._send_json({'error': 'Invalid URL'}, 400)
                    return

                try:
                    status_code, content = fetch_url(url)
                    self._send_json({'url': url, 'status': status_code, 'content': content}, 200)
                except Exception as e:
                    self._send_json({'url': url, 'error': str(e)}, 500)

            elif path == '/admin':
                self._send_json({'message': "This endpoint doesn't do anything yet"}, 200)
            else:
                self.send_response(404)
                self.end_headers()

        def _send_json(self, data, status=200):
            payload = json.dumps(data).encode('utf-8')
            self.send_response(status)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(payload)

        def log_message(self, format, *args):
            pass

    def run_server(host='0.0.0.0', port=PORT):
        server = HTTPServer((host, port), EntryHandler)
        server.serve_forever()

if __name__ == '__main__':
    port = PORT
    if len(sys.argv) > 1:
        try:
            port = int(sys.argv[1])
        except ValueError:
            pass
    run_server(host='0.0.0.0', port=port)