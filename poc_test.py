#!/usr/bin/env python3
"""AutoPoC Test Script for MCPify - Job-based CLI validation"""
import json, os, subprocess, sys

results = []
NAMESPACE = "poc-mcpify"


def check_job(name, description, expected_content=None):
    """Check a completed Kubernetes job."""
    try:
        # Check job status
        status = subprocess.run(
            ["kubectl", "get", f"job/{name}", "-n", NAMESPACE,
             "-o", "jsonpath={.status.succeeded}"],
            capture_output=True, text=True, timeout=10
        )
        succeeded = status.stdout.strip()

        # Get logs
        logs = subprocess.run(
            ["kubectl", "logs", f"job/{name}", "-n", NAMESPACE],
            capture_output=True, text=True, timeout=30
        )
        output = logs.stdout[:2000]

        if succeeded == "1":
            if expected_content and expected_content not in output:
                r = {"scenario_name": name, "status": "fail",
                     "output": output, "error_message": f"Expected '{expected_content}' not in output",
                     "duration_seconds": 0}
            else:
                r = {"scenario_name": name, "status": "pass",
                     "output": output[:500], "error_message": None,
                     "duration_seconds": 0}
        else:
            r = {"scenario_name": name, "status": "fail",
                 "output": output, "error_message": f"Job did not succeed (status: {succeeded})",
                 "duration_seconds": 0}
        results.append(r)
    except Exception as e:
        r = {"scenario_name": name, "status": "error",
             "output": "", "error_message": str(e), "duration_seconds": 0}
        results.append(r)


# === SCENARIOS ===
check_job("mcpify-help", "CLI help output shows usage", "Compile software into AI-operable systems")
check_job("mcpify-analyze", "Analyze ecommerce-saas example", "MCP server generated")
# === END SCENARIOS ===

print(json.dumps({"results": results}, indent=2))
sys.exit(1 if any(r["status"] in ("fail", "error") for r in results) else 0)
