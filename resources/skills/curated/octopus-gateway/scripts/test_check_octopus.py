#!/usr/bin/env python3

import importlib.util
import json
import pathlib
import threading
import unittest
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer


PATH = pathlib.Path(__file__).with_name("check_octopus.py")
SPEC = importlib.util.spec_from_file_location("check_octopus", PATH)
assert SPEC and SPEC.loader
module = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(module)


class Handler(BaseHTTPRequestHandler):
    key = "sk-octopus-test-secret"

    def log_message(self, *_args):
        pass

    def do_GET(self):
        self.send_response(200)
        self.end_headers()
        self.wfile.write(b"octopus")

    def do_POST(self):
        payload = json.loads(self.rfile.read(int(self.headers.get("Content-Length", "0"))))
        valid = self.path == "/v1/chat/completions" and self.headers.get("Authorization") == f"Bearer {self.key}" and payload.get("model") == "group"
        self.send_response(200 if valid else 400)
        self.end_headers()
        self.wfile.write(b'{"choices":[]}')


class Tests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.server = ThreadingHTTPServer(("127.0.0.1", 0), Handler)
        cls.thread = threading.Thread(target=cls.server.serve_forever, daemon=True)
        cls.thread.start()
        cls.base = f"http://127.0.0.1:{cls.server.server_port}"

    @classmethod
    def tearDownClass(cls):
        cls.server.shutdown()
        cls.server.server_close()
        cls.thread.join(timeout=2)

    def test_normalize(self):
        self.assertEqual(module.normalize_urls(self.base + "/v1"), (self.base + "/", self.base + "/v1"))

    def test_root(self):
        self.assertEqual(module.root_probe(self.base, 2)["status"], 200)

    def test_live_redacts_key(self):
        result = module.live_probe(self.base + "/v1", Handler.key, "group", 2)
        self.assertEqual(result["status"], 200)
        self.assertNotIn(Handler.key, json.dumps(result))


if __name__ == "__main__":
    unittest.main()
