#!/usr/bin/env python3

from flask import Flask, request, render_template
import requests
import socket

app = Flask(__name__)

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/fetch', methods=['GET'])
def fetch():
    #allow SSRF
    url = request.args.get('url', '')

    if not url:
        return {'error': 'No URL provided'}, 400
    if not url.startswith('http'):
        return {'error': 'Invalid URL'}, 400

    try:
        #server blindly fetch
        response = requests.get(url, timeout=5)
        return {
            'url': url,
            'status': response.status_code,
            'content': response.text[:500]  # Limit output
        }
    except Exception as e:
        return {
            'url': url,
            'error': str(e)
        }, 500

@app.route('/admin', methods=['GET', 'POST'])
def admin():
    #Fake admin endpoint
    return {'message': 'This endpoint doesn\'t do anything yet'}

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=3000, debug=False)