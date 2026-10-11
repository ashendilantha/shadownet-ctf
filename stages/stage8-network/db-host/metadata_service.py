#!/usr/bin/env python3
"""
NexaCorp Internal Cloud Metadata Service (Stage 8)
Simulates AWS/GCP/Azure link-local metadata endpoints exposing internal credentials.
Supports both Flask and Python Standard Library fallback.
"""

import sys
import json
import urllib.parse

METADATA = {
    "database": {
        "host": "192.168.100.10",
        "port": 3306,
        "username": "db_user",
        "password": "SecurePass123",
        "database": "nexacorp"
    },
    "credentials": {
        "api_key": "sk-1234567890abcdef",
        "secret": "secret-key-for-internal-api"
    }
}

try:
    from flask import Flask, jsonify
    USE_FLASK = True
except ImportError:
    USE_FLASK = False
    from http.server import HTTPServer, BaseHTTPRequestHandler

if USE_FLASK:
    app = Flask(__name__)

    @app.route('/metadata/db-credentials')
    def db_credentials():
        return jsonify(METADATA['database'])

    @app.route('/metadata/all')
    def all_metadata():
        return jsonify(METADATA)

    def run_server(host='0.0.0.0', port=8080):
        app.run(host=host, port=port, debug=False)

else:
    class MetadataHandler(BaseHTTPRequestHandler):
        def do_GET(self):
            parsed = urllib.parse.urlparse(self.path)
            if parsed.path == '/metadata/db-credentials':
                self._send_json(METADATA['database'])
            elif parsed.path == '/metadata/all':
                self._send_json(METADATA)
            else:
                self.send_response(404)
                self.end_headers()

        def _send_json(self, data):
            payload = json.dumps(data).encode('utf-8')
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(payload)

        def log_message(self, format, *args):
            pass

    def run_server(host='0.0.0.0', port=8080):
        server = HTTPServer((host, port), MetadataHandler)
        server.serve_forever()

if __name__ == '__main__':
    run_server(host='0.0.0.0', port=8080)
