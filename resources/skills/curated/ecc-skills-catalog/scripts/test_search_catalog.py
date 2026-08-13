#!/usr/bin/env python3

from __future__ import annotations

import importlib.util
import json
import pathlib
import tempfile
import unittest


SCRIPT = pathlib.Path(__file__).with_name("search_catalog.py")
SPEC = importlib.util.spec_from_file_location("ecc_search_catalog", SCRIPT)
assert SPEC and SPEC.loader
module = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(module)


class ECCSearchTests(unittest.TestCase):
    def test_search_finds_specific_workflow(self) -> None:
        results = module.search(["api-design", "python-testing", "security-review"], "python tests", 5)
        self.assertEqual(results[0]["name"], "python-testing")
        self.assertEqual(results[0]["path"], "skills/python-testing/SKILL.md")

    def test_empty_query_lists_alphabetically(self) -> None:
        results = module.search(["zeta", "alpha"], "", 2)
        self.assertEqual([item["name"] for item in results], ["alpha", "zeta"])

    def test_load_names_rejects_non_string_entries(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            path = pathlib.Path(directory) / "catalog.json"
            path.write_text(json.dumps(["valid", 3]), encoding="utf-8")
            with self.assertRaises(ValueError):
                module.load_names(path)


if __name__ == "__main__":
    unittest.main()
