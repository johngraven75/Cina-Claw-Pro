#!/usr/bin/env python3

from __future__ import annotations

import importlib.util
import json
import pathlib
import tempfile
import unittest


SCRIPT = pathlib.Path(__file__).with_name("search_catalog.py")
SPEC = importlib.util.spec_from_file_location("search_catalog", SCRIPT)
assert SPEC and SPEC.loader
module = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(module)


class CatalogSearchTests(unittest.TestCase):
    def setUp(self) -> None:
        self.entries = [
            {"id": "JWT_Authentication", "name": "JWT Authentication", "category": "security", "tags": ["jwt", "auth"]},
            {"id": "E2E_Testing_Playwright", "name": "E2E Testing Playwright", "category": "testing", "tags": ["browser", "playwright"]},
        ]

    def test_search_ranks_exact_name_terms(self) -> None:
        results = module.search(self.entries, "playwright testing", None, 5)
        self.assertEqual(results[0]["id"], "E2E_Testing_Playwright")
        self.assertEqual(results[0]["path"], "testing/E2E_Testing_Playwright.md")
        self.assertEqual(
            results[0]["source_url"],
            "https://github.com/HighMark-31/TRAE-Skills/blob/main/testing/E2E_Testing_Playwright.md",
        )

    def test_category_filter(self) -> None:
        results = module.search(self.entries, "authentication", "security", 5)
        self.assertEqual([item["id"] for item in results], ["JWT_Authentication"])

    def test_load_entries_validates_list(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            path = pathlib.Path(directory) / "metadata.json"
            path.write_text(json.dumps({"not": "a list"}), encoding="utf-8")
            with self.assertRaises(ValueError):
                module.load_entries(path)


if __name__ == "__main__":
    unittest.main()
