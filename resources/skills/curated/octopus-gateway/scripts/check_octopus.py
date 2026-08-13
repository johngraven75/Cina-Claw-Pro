#!/usr/bin/env python3
"""Non-destructive reachability and opt-in live request check for Octopus."""

from __future__ import annotations

import argparse
import json
import sys
import time
import urllib.error
import urllib.parse
import urllib.request


def normalize_urls(base_url: str) -> tuple[str, str]:
    value = base_url.strip().rstrip("/")
    parsed = urllib.parse.urlparse(value)
    if parsed.scheme not in {"http", "https"} or not parsed.netloc:
        raise ValueError("base URL must be an absolute http:// or https:// URL")
    if parsed.path.rstrip("/") == "/v1":
        root_path, api_base = "", value
    else:
        root_path, api_base = parsed.path.rstrip("/"), value + "/v1"
    root_url = urllib.parse.urlunparse((parsed.scheme, parsed.netloc, root_path or "/", "", "", ""))
    return root_url, api_base


def request_result(request: urllib.request.Request, timeout: float, secret: str = "") -> dict:
    started = time.monotonic()
    try:
        with urllib.request.urlopen(request, timeout=timeout) as response:
            body = response.read(4096).decode("utf-8", errors="replace")
            return {"reachable": True, "status": response.status, "latency_ms": round((time.monotonic() - started) * 1000), "body_preview": body[:500].replace(secret, "<redacted>") if secret else body[:500]}
    except urllib.error.HTTPError as exc:
        body = exc.read(4096).decode("utf-8", errors="replace")
        return {"reachable": True, "status": exc.code, "latency_ms": round((time.monotonic() - started) * 1000), "body_preview": body[:500].replace(secret, "<redacted>") if secret else body[:500]}
    except (urllib.error.URLError, TimeoutError, OSError) as exc:
        return {"reachable": False, "error": str(exc).replace(secret, "<redacted>") if secret else str(exc), "latency_ms": round((time.monotonic() - started) * 1000)}


def root_probe(root_url: str, timeout: float) -> dict:
    return request_result(urllib.request.Request(root_url, headers={"User-Agent": "octopus-skill-check/1"}, method="GET"), timeout)


def live_probe(api_base: str, api_key: str, model: str, timeout: float) -> dict:
    payload = json.dumps({"model": model, "messages": [{"role": "user", "content": "Reply with OK."}], "max_tokens": 1, "stream": False}).encode()
    request = urllib.request.Request(api_base + "/chat/completions", data=payload, headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json", "User-Agent": "octopus-skill-check/1"}, method="POST")
    return request_result(request, timeout, api_key)


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Check Octopus; --live-model-check sends a real request that may incur cost")
    parser.add_argument("--base-url", default="http://127.0.0.1:8080")
    parser.add_argument("--timeout", type=float, default=10.0)
    parser.add_argument("--api-key")
    parser.add_argument("--model")
    parser.add_argument("--live-model-check", action="store_true")
    args = parser.parse_args(argv)
    if args.timeout <= 0:
        parser.error("--timeout must be greater than zero")
    if args.live_model_check and (not args.api_key or not args.model):
        parser.error("--live-model-check requires --api-key and --model")
    try:
        root_url, api_base = normalize_urls(args.base_url)
    except ValueError as exc:
        parser.error(str(exc))
    result = {"base_url": args.base_url.rstrip("/"), "root_probe": root_probe(root_url, args.timeout)}
    if args.live_model_check:
        result["live_model_check"] = live_probe(api_base, args.api_key, args.model, args.timeout)
    print(json.dumps(result, indent=2, sort_keys=True))
    root = result["root_probe"]
    if not root.get("reachable") or root.get("status", 500) >= 500:
        return 1
    live = result.get("live_model_check")
    if live and (not live.get("reachable") or not 200 <= live.get("status", 0) < 300):
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
