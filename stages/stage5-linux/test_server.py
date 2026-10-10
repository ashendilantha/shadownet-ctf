import io
import socket
import tempfile
import threading
import unittest
from contextlib import redirect_stdout
from pathlib import Path
from unittest.mock import patch

from server import A, C, M, TOKEN_MODULUS, TokenServer, load_flag

TEST_FLAG = 'SHADOWNET{test_fixture_only}'


def recover_prediction(tokens):
    # Independent solve of the truncated sequence; no server internal state access.
    candidates = list(range(tokens[0], M, TOKEN_MODULUS))
    for token in tokens[1:]:
        candidates = [(A * s + C) % M for s in candidates
                      if ((A * s + C) % M) % TOKEN_MODULUS == token]
    predictions = {((A * s + C) % M) % TOKEN_MODULUS for s in candidates}
    if len(predictions) != 1:
        raise AssertionError('Samples do not determine the next token')
    return predictions.pop()


class ProtocolTests(unittest.TestCase):
    def setUp(self):
        self.logs = io.StringIO()
        self.capture = redirect_stdout(self.logs)
        self.capture.__enter__()
        self.server = TokenServer(('127.0.0.1', 0), TEST_FLAG, seed_factory=lambda: 123456789)
        self.thread = threading.Thread(target=self.server.serve_forever, kwargs={'poll_interval': 0.01}, daemon=True)
        self.thread.start()
        self.clients = []

    def tearDown(self):
        for sock, stream in self.clients:
            stream.close()
            sock.close()
        self.server.shutdown()
        self.server.server_close()
        self.thread.join(timeout=2)
        self.capture.__exit__(None, None, None)

    def client(self):
        sock = socket.create_connection(self.server.server_address, timeout=2)
        stream = sock.makefile('rwb', buffering=0)
        self.clients.append((sock, stream))
        banner = b''.join(stream.readline() for _ in range(4))
        self.assertNotIn(TEST_FLAG.encode(), banner)
        self.assertIn(b'READY', banner)
        return stream

    def send(self, client, command):
        client.write(command.encode() + b'\n')
        return client.readline().decode().strip()

    def test_intended_solve_releases_flag_only_after_prediction(self):
        c = self.client()
        replies = [self.send(c, 'NEXT') for _ in range(15)]
        self.assertTrue(all(TEST_FLAG not in reply for reply in replies))
        prediction = recover_prediction([int(reply.split()[1]) for reply in replies])
        self.assertEqual(self.send(c, f'PREDICT {prediction:08d}'), 'SUCCESS prediction accepted')
        self.assertEqual(c.readline().decode().strip(), 'FLAG ' + TEST_FLAG)
        self.assertNotIn(TEST_FLAG, self.logs.getvalue())

    def test_connections_have_independent_state(self):
        a, b = self.client(), self.client()
        first = self.send(a, 'NEXT')
        second = self.send(a, 'NEXT')
        self.assertEqual(first, self.send(b, 'NEXT'))
        self.assertEqual(second, self.send(b, 'NEXT'))

    def test_pipelined_commands_are_framed_by_line(self):
        c = self.client()
        c.write(b'NEXT\nNEXT\nQUIT\n')
        self.assertTrue(c.readline().startswith(b'TOKEN '))
        self.assertTrue(c.readline().startswith(b'TOKEN '))
        self.assertEqual(c.readline(), b'BYE\n')

    def test_invalid_prediction_does_not_advance_state(self):
        c = self.client()
        self.assertIn('exactly 8 digits', self.send(c, 'PREDICT abc'))
        self.assertIn('NEXT first', self.send(c, 'PREDICT 00000000'))
        reply = self.send(c, 'NEXT')
        expected = ((A * 123456789 + C) % M) % TOKEN_MODULUS
        self.assertEqual(reply, f'TOKEN {expected:08d}')

    def test_wrong_prediction_consumes_token_and_limits_attempts(self):
        c = self.client()
        self.send(c, 'NEXT')
        state = (A * 123456789 + C) % M
        for _ in range(3):
            state = (A * state + C) % M
            wrong = (state % TOKEN_MODULUS + 1) % TOKEN_MODULUS
            self.assertTrue(self.send(c, f'PREDICT {wrong:08d}').startswith('WRONG'))
        self.assertIn(b'attempt limit', c.readline())
        self.assertEqual(c.readline(), b'')

    def test_unknown_non_ascii_and_oversized_commands(self):
        c = self.client()
        self.assertTrue(self.send(c, 'UNSUPPORTED').startswith('ERROR'))
        c.write(b'\xff\n')
        self.assertIn(b'ASCII', c.readline())
        c.write(b'x' * 129 + b'\n')
        self.assertIn(b'line too long', c.readline())
        self.assertEqual(c.readline(), b'')

    def test_connection_limit_returns_busy(self):
        self.server.slots = threading.BoundedSemaphore(1)
        self.client()
        with socket.create_connection(self.server.server_address, timeout=2) as sock:
            self.assertEqual(sock.recv(100), b'BUSY retry later\n')

    def test_idle_connection_is_closed(self):
        with patch('server.IDLE_TIMEOUT', 0.05):
            c = self.client()
            self.assertEqual(c.readline(), b'')

    def test_tokens_are_padded_to_eight_digits(self):
        self.server.seed_factory = lambda: 0
        c = self.client()
        self.assertEqual(self.send(c, 'NEXT'), 'TOKEN 00012345')

    def test_sample_limit_and_quit(self):
        c = self.client()
        for _ in range(32):
            self.assertTrue(self.send(c, 'NEXT').startswith('TOKEN '))
        self.assertIn('token limit', self.send(c, 'NEXT'))
        self.assertEqual(self.send(c, 'QUIT'), 'BYE')


class FlagAndMathTests(unittest.TestCase):
    def test_generated_flag_survives_restart_and_config_override(self):
        with tempfile.TemporaryDirectory() as d:
            path = Path(d) / 'challenge.flag'
            first = load_flag(path=path)
            self.assertTrue(first.startswith('SHADOWNET{token_'))
            self.assertEqual(first, load_flag(path=path))
            self.assertEqual(TEST_FLAG, load_flag(TEST_FLAG, path=path))
            self.assertEqual(first, path.read_text())

    def test_truncated_token_recovery_at_boundary_seeds(self):
        for seed in [0, 1, 99999999, 100000000, M - 1]:
            state = seed
            tokens = []
            for _ in range(15):
                state = (A * state + C) % M
                tokens.append(state % TOKEN_MODULUS)
            expected = ((A * state + C) % M) % TOKEN_MODULUS
            self.assertEqual(recover_prediction(tokens), expected)


if __name__ == '__main__':
    unittest.main()
