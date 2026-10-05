#!/usr/bin/env python3

from flask import Flask, jsonify
import json

app = Flask(__name__)

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

@app.route('/metadata/db-credentials')
def db_credentials():
    return jsonify(METADATA['database'])

@app.route('/metadata/all')
def all_metadata():
    return jsonify(METADATA)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080, debug=False)
