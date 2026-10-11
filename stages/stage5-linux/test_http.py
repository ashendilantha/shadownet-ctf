"""Local organiser verification; synthetic keys and answers only."""
import json
import tempfile
import threading
import unittest
import urllib.error
import urllib.request
from pathlib import Path
from http_server import ChallengeHTTPServer, load_service_key
from server import next_state, TOKEN_MODULUS

KEY = 'synthetic-service-key-at-least-32-characters'
FLAG = 'SHADOWNET{test_fixture_only}'

class HTTPTests(unittest.TestCase):
    def setUp(self):
        self.now = 1800000000
        self.server = ChallengeHTTPServer(('127.0.0.1', 0), FLAG, KEY, clock=lambda: self.now, seed_factory=lambda: 1234567)
        self.thread = threading.Thread(target=self.server.serve_forever, kwargs={'poll_interval': .01}, daemon=True)
        self.thread.start()
        self.base = 'http://127.0.0.1:' + str(self.server.server_address[1])

    def tearDown(self):
        self.server.shutdown(); self.server.server_close(); self.thread.join()

    def post(self, path, value, key=KEY):
        raw = value if isinstance(value, bytes) else json.dumps(value).encode()
        req = urllib.request.Request(self.base + path, data=raw, headers={'Content-Type': 'application/json', 'Authorization': 'Bearer ' + key})
        try:
            with urllib.request.urlopen(req) as response: return response.status, json.load(response)
        except urllib.error.HTTPError as error: return error.code, json.load(error)

    def start(self):
        status, data = self.post('/start', {'user': 'test-player'})
        self.assertEqual(status, 200)
        return data

    def expected(self):
        state = 1234567
        for _ in range(16): state = next_state(state)
        return f'{state % TOKEN_MODULUS:08d}'

    def test_complete_flow_and_response_privacy(self):
        data = self.start()
        self.assertEqual(len(data['tokens']), 15)
        self.assertNotIn('flag', data); self.assertNotIn('expected', data)
        status, result = self.post('/predict', {'session': data['session'], 'prediction': self.expected()})
        self.assertEqual(status, 200); self.assertEqual(result['flag'], FLAG)

    def test_authentication_and_health(self):
        self.assertEqual(self.post('/start', {'user': 'player'}, 'wrong')[0], 401)
        with urllib.request.urlopen(self.base + '/health') as response: self.assertEqual(response.status, 200)

    def test_bad_request_and_body_limits(self):
        self.assertEqual(self.post('/start', b'{')[0], 400)
        self.assertEqual(self.post('/start', {'padding': 'x' * 4096})[0], 413)
        self.assertEqual(self.post('/start', {})[0], 400)

    def test_expiry_unknown_session_and_restart(self):
        data = self.start(); self.now += 900
        self.assertEqual(self.post('/predict', {'session': data['session'], 'prediction': self.expected()})[0], 410)
        self.assertEqual(self.post('/predict', {'session': 'unknown', 'prediction': self.expected()})[0], 410)

    def test_three_attempt_limit(self):
        data = self.start()
        for _ in range(3): self.assertEqual(self.post('/predict', {'session': data['session'], 'prediction': '00000000'})[0], 422)
        self.assertEqual(self.post('/predict', {'session': data['session'], 'prediction': self.expected()})[0], 429)

    def test_malformed_prediction_does_not_consume_attempt(self):
        data = self.start()
        for _ in range(4): self.assertEqual(self.post('/predict', {'session': data['session'], 'prediction': 12345678})[0], 400)
        self.assertEqual(self.post('/predict', {'session': data['session'], 'prediction': self.expected()})[0], 200)

    def test_independent_sessions_and_capacity(self):
        first, second = self.start(), self.start()
        self.assertNotEqual(first['session'], second['session'])
        for _ in range(3): self.post('/predict', {'session': first['session'], 'prediction': '00000000'})
        self.assertEqual(self.post('/predict', {'session': second['session'], 'prediction': self.expected()})[0], 200)
        self.server.sessions = {str(i): {'expires': self.now + 900} for i in range(2048)}
        self.assertEqual(self.post('/start', {'user': 'test-player'})[0], 503)
        self.now += 901
        self.assertEqual(self.post('/start', {'user': 'test-player'})[0], 200)

    def test_service_key_persistence(self):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / 'service.key'
            first = load_service_key(path=path)
            self.assertEqual(first, load_service_key(path=path))
            self.assertGreaterEqual(len(first), 32)
            with self.assertRaises(ValueError): load_service_key('short', path)

if __name__ == '__main__': unittest.main()
