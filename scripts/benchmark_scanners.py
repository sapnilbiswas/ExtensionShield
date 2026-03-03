#!/usr/bin/env python3
"""
Benchmark script: export ExtensionShield scan results for extensions in the database,
and optionally fetch CRXplorer (and other) scanner data for comparison.

Usage:
  # Export only ExtensionShield data (no external APIs)
  python scripts/benchmark_scanners.py --output data/scanner_benchmark.json

  # With CRXplorer (requires CRXPLORER_API_KEY if they require auth)
  python scripts/benchmark_scanners.py --output data/scanner_benchmark.json --crxplorer

  # Limit number of extensions and set API base URL
  python scripts/benchmark_scanners.py --limit 50 --base-url https://extensionshield.com

Output JSON shape:
  {
    "generated_at": "ISO8601",
    "extensionshield_base_url": "https://...",
    "extensions": [
      {
        "extension_id": "...",
        "extension_name": "...",
        "extensionshield": {
          "overall_score": 55,
          "decision": "NEEDS_REVIEW",
          "security_score": 80,
          "privacy_score": 45,
          "governance_score": 70,
          "hard_gates_triggered": ["SENSITIVE_EXFIL"],
          "top_findings": ["..."]
        },
        "crxplorer": { "score": null, "label": null, "reason": null }  // if --crxplorer
      }
    ]
  }
"""

from __future__ import annotations

import argparse
import json
import os
import sys
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
from urllib.parse import urljoin

try:
    import requests
except ImportError:
    requests = None


def get_recent_extension_ids(base_url: str, limit: int) -> List[Dict[str, Any]]:
    """Fetch recent scans from ExtensionShield API. Returns list of { extension_id, extension_name, ... }."""
    url = urljoin(base_url.rstrip("/") + "/", f"api/recent?limit={limit}")
    if not requests:
        print("Install requests: pip install requests", file=sys.stderr)
        sys.exit(1)
    r = requests.get(url, timeout=30)
    r.raise_for_status()
    data = r.json()
    recent = data.get("recent") or []
    return recent


def get_scan_result(base_url: str, identifier: str) -> Optional[Dict[str, Any]]:
    """Fetch full scan result for one extension (ID or slug)."""
    url = urljoin(base_url.rstrip("/") + "/", f"api/scan/results/{identifier}")
    r = requests.get(url, timeout=45)
    if r.status_code == 404:
        return None
    r.raise_for_status()
    return r.json()


def extract_extensionshield_summary(payload: Dict[str, Any]) -> Dict[str, Any]:
    """Extract scoring and key findings for benchmark from full scan result."""
    out: Dict[str, Any] = {
        "overall_score": None,
        "decision": None,
        "security_score": None,
        "privacy_score": None,
        "governance_score": None,
        "hard_gates_triggered": [],
        "top_findings": [],
    }
    scoring = payload.get("scoring_v2") or (payload.get("summary") or {}).get("scoring_v2")
    if not scoring:
        # Legacy fallback
        out["overall_score"] = payload.get("overall_security_score") or payload.get("security_score")
        out["decision"] = "NEEDS_REVIEW" if (out["overall_score"] or 0) < 75 else "ALLOW"
        return out

    out["overall_score"] = scoring.get("overall_score")
    out["decision"] = scoring.get("decision")
    out["security_score"] = scoring.get("security_score")
    out["privacy_score"] = scoring.get("privacy_score")
    out["governance_score"] = scoring.get("governance_score")
    out["hard_gates_triggered"] = list(scoring.get("hard_gates_triggered") or [])

    # Top findings from report_view_model or consumer_summary
    rvm = payload.get("report_view_model") or (payload.get("summary") or {}).get("report_view_model") or {}
    consumer = (rvm.get("consumer_summary") or {}) if isinstance(rvm, dict) else {}
    reasons = consumer.get("reasons") or (rvm.get("highlights") or {}).get("why_this_score") or []
    if isinstance(reasons, list):
        out["top_findings"] = [str(r) for r in reasons[:5] if r]
    return out


def fetch_crxplorer(extension_id: str, api_key: Optional[str]) -> Dict[str, Any]:
    """
    Fetch CRXplorer data for one extension.
    CRXplorer has API access at https://crxplorer.com/api-access (may require signup/key).
    If no API key or endpoint is known, we try public report URL and parse (fragile).
    """
    out: Dict[str, Any] = {"score": None, "label": None, "reason": None, "source": None}
    if not requests:
        return out

    # Option 1: Official API (if you have key and docs)
    api_key = api_key or os.environ.get("CRXPLORER_API_KEY")
    if api_key:
        api_url = os.environ.get("CRXPLORER_API_URL", "https://crxplorer.com/api/v1/report")
        try:
            r = requests.get(
                f"{api_url.rstrip('/')}/{extension_id}",
                headers={"Authorization": f"Bearer {api_key}"},
                timeout=15,
            )
            if r.status_code == 200:
                data = r.json()
                out["score"] = data.get("score") or data.get("risk_score")
                out["label"] = data.get("label") or data.get("severity")
                out["reason"] = data.get("reason") or data.get("summary")
                out["source"] = "api"
        except Exception:
            pass

    # Option 2: Public page scrape (brittle; use only if no API)
    if out["source"] is None:
        try:
            page_url = f"https://crxplorer.com/{extension_id}"
            r = requests.get(page_url, timeout=15)
            if r.status_code == 200 and ("CRITICAL" in r.text or "Security" in r.text):
                out["label"] = "CRITICAL" if "CRITICAL" in r.text else ("HIGH" if "HIGH" in r.text else None)
                out["reason"] = "Broad permissions (parsed from page)"
                out["source"] = "scrape"
        except Exception:
            pass

    return out


def fetch_extension_auditor(extension_id: str) -> Dict[str, Any]:
    """
    Fetch Extension Auditor data for one extension.
    No public API documented; optionally scrape report page if URL pattern is known.
    Extension Auditor: https://extensionauditor.com/scan (search by ID or URL).
    """
    out: Dict[str, Any] = {"trusted": None, "rating": None, "score": None, "source": None}
    if not requests:
        return out
    # Common patterns for extension report pages (may need adjustment after checking site)
    for path in [f"/extension/{extension_id}", f"/report/{extension_id}", f"/scan?id={extension_id}"]:
        try:
            url = f"https://extensionauditor.com{path}"
            r = requests.get(url, timeout=15)
            if r.status_code != 200:
                continue
            text = r.text
            if "Trusted" in text:
                out["trusted"] = "Yes" in text or "trusted" in text.lower()
            if "rating" in text.lower() or "/5" in text:
                out["rating"] = "present"
            out["source"] = "scrape"
            break
        except Exception:
            continue
    return out


def main() -> int:
    parser = argparse.ArgumentParser(description="Export ExtensionShield scan data for scanner benchmarking")
    parser.add_argument("--output", "-o", default="data/scanner_benchmark.json", help="Output JSON path")
    parser.add_argument("--base-url", default=os.environ.get("EXTENSIONSHIELD_BASE_URL", "http://localhost:8000"), help="ExtensionShield API base URL")
    parser.add_argument("--limit", "-n", type=int, default=100, help="Max number of extensions to export")
    parser.add_argument("--crxplorer", action="store_true", help="Try to fetch CRXplorer data per extension")
    parser.add_argument("--extension-auditor", action="store_true", help="Try to fetch Extension Auditor data per extension (scrape)")
    args = parser.parse_args()

    base_url = args.base_url.rstrip("/")
    print(f"Fetching up to {args.limit} recent scans from {base_url} ...")
    recent = get_recent_extension_ids(base_url, args.limit)
    if not recent:
        print("No recent scans found. Run some scans first or increase --limit.")
        return 1

    extensions: List[Dict[str, Any]] = []
    for i, item in enumerate(recent):
        eid = item.get("extension_id")
        name = item.get("extension_name") or eid or "Unknown"
        if not eid:
            continue
        identifier = item.get("slug") or eid
        print(f"  [{i+1}/{len(recent)}] {eid} ({name[:40]}...)")
        payload = get_scan_result(base_url, identifier)
        if not payload:
            row = {
                "extension_id": eid,
                "extension_name": name,
                "extensionshield": {"overall_score": None, "decision": None, "error": "not_found"},
            }
            if args.crxplorer:
                row["crxplorer"] = fetch_crxplorer(eid, None)
            if args.extension_auditor:
                row["extension_auditor"] = fetch_extension_auditor(eid)
            extensions.append(row)
            continue

        es = extract_extensionshield_summary(payload)
        row = {
            "extension_id": eid,
            "extension_name": name,
            "extensionshield": es,
        }
        if args.crxplorer:
            row["crxplorer"] = fetch_crxplorer(eid, None)
        if args.extension_auditor:
            row["extension_auditor"] = fetch_extension_auditor(eid)
        extensions.append(row)

    out_dir = os.path.dirname(args.output)
    if out_dir:
        os.makedirs(out_dir, exist_ok=True)

    result = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "extensionshield_base_url": base_url,
        "extensions": extensions,
        "metadata": {
            "total_extensions": len(extensions),
            "crxplorer_included": args.crxplorer,
            "extension_auditor_included": args.extension_auditor,
            "note": "Use this file with docs/SCANNER_BENCHMARK_AND_REPUTATION.md for comparison.",
        },
    }

    with open(args.output, "w") as f:
        json.dump(result, f, indent=2)

    print(f"Wrote {len(extensions)} extensions to {args.output}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
