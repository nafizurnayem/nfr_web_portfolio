"""Verify that every external link the portfolio advertises actually resolves.

Run it against a live backend:

    python scripts/check_links.py                       # defaults to localhost:8000
    python scripts/check_links.py --api https://api.example.com/api

Exits non-zero if any link is broken, so it can gate a deploy.

Some sites (LinkedIn, ResearchGate, Facebook) block automated clients and answer
403/999 to any non-browser request. Those are reported as ``BLOCKED`` rather than
failures, because the link itself is fine for a real visitor.
"""

from __future__ import annotations

import argparse
import json
import sys
import urllib.error
import urllib.parse
import urllib.request
from concurrent.futures import ThreadPoolExecutor
from typing import Iterable, NamedTuple

DEFAULT_API = "http://127.0.0.1:8000/api"
TIMEOUT_SECONDS = 25
BROWSER_UA = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/124.0 Safari/537.36"
)

# Hosts that answer with an anti-bot status even though the page is public.
ANTI_BOT_HOSTS = {
    "www.linkedin.com",
    "linkedin.com",
    "www.researchgate.net",
    "researchgate.net",
    "www.facebook.com",
    "facebook.com",
    "x.com",
    "twitter.com",
}
ANTI_BOT_STATUSES = {401, 403, 405, 429, 999}


class Result(NamedTuple):
    url: str
    source: str
    status: int
    state: str  # OK | BLOCKED | BROKEN

    @property
    def ok(self) -> bool:
        return self.state != "BROKEN"


def _host_of(url: str) -> str:
    return urllib.parse.urlsplit(url).hostname or ""


def check(url: str, source: str) -> Result:
    request = urllib.request.Request(url, headers={"User-Agent": BROWSER_UA})
    try:
        with urllib.request.urlopen(request, timeout=TIMEOUT_SECONDS) as response:
            status = response.status
    except urllib.error.HTTPError as exc:
        status = exc.code
    except Exception:  # noqa: BLE001 - DNS failures, TLS errors, timeouts
        return Result(url, source, 0, "BROKEN")

    if 200 <= status < 400:
        return Result(url, source, status, "OK")
    if status in ANTI_BOT_STATUSES and _host_of(url) in ANTI_BOT_HOSTS:
        return Result(url, source, status, "BLOCKED")
    return Result(url, source, status, "BROKEN")


def fetch_json(url: str):
    request = urllib.request.Request(url, headers={"User-Agent": BROWSER_UA})
    with urllib.request.urlopen(request, timeout=TIMEOUT_SECONDS) as response:
        return json.loads(response.read().decode("utf-8"))


def collect_targets(api_base: str) -> list[tuple[str, str]]:
    targets: list[tuple[str, str]] = []
    projects = fetch_json(f"{api_base}/projects")
    for project in projects:
        for field in ("github_url", "live_url"):
            if project.get(field):
                targets.append((project[field], f"{project['slug']}.{field}"))
    return targets


def report(results: Iterable[Result]) -> int:
    results = sorted(results, key=lambda r: (r.state != "BROKEN", r.source))
    broken = [r for r in results if r.state == "BROKEN"]
    blocked = [r for r in results if r.state == "BLOCKED"]

    for result in results:
        marker = {"OK": "ok     ", "BLOCKED": "blocked", "BROKEN": "BROKEN "}[result.state]
        print(f"{marker} {result.status:>3}  {result.source:<45} {result.url}")

    total = len(results)
    print(
        f"\n{total} links checked - {total - len(broken)} reachable, "
        f"{len(blocked)} anti-bot blocked, {len(broken)} broken"
    )
    if broken:
        print("\nBroken links:")
        for result in broken:
            print(f"  - {result.source}: {result.url} (status {result.status})")
        return 1
    return 0


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--api", default=DEFAULT_API, help="Base API URL")
    args = parser.parse_args()

    api_base = args.api.rstrip("/")
    try:
        targets = collect_targets(api_base)
    except Exception as exc:  # noqa: BLE001
        print(f"Could not reach the API at {api_base}: {exc}", file=sys.stderr)
        return 2

    with ThreadPoolExecutor(max_workers=8) as pool:
        results = list(pool.map(lambda t: check(*t), targets))

    return report(results)


if __name__ == "__main__":
    raise SystemExit(main())
