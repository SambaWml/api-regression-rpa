import uuid
from datetime import datetime
from pathlib import Path
from src.utils import load_json, save_json

OUTPUTS_DIR = Path("outputs")


def _ensure_outputs():
    OUTPUTS_DIR.mkdir(parents=True, exist_ok=True)


def generate_report(results: list, environment: str = "default") -> dict:
    _ensure_outputs()
    run_id = str(uuid.uuid4())
    timestamp = datetime.now().isoformat()

    passed = sum(1 for r in results if r.get("passed"))
    failed = len(results) - passed

    report = {
        "run_id": run_id,
        "generated_at": timestamp,
        "environment": environment,
        "total": len(results),
        "passed": passed,
        "failed": failed,
        "results": results
    }

    save_json(str(OUTPUTS_DIR / f"report_{run_id}.json"), report)
    return report


def list_reports() -> list:
    _ensure_outputs()
    reports = []
    for file in sorted(OUTPUTS_DIR.glob("report_*.json"), reverse=True):
        try:
            data = load_json(str(file))
            reports.append({
                "run_id": data.get("run_id"),
                "generated_at": data.get("generated_at"),
                "environment": data.get("environment", "default"),
                "total": data.get("total", 0),
                "passed": data.get("passed", 0),
                "failed": data.get("failed", 0),
            })
        except Exception:
            continue
    return reports


def get_report(run_id: str) -> dict | None:
    _ensure_outputs()
    report_file = OUTPUTS_DIR / f"report_{run_id}.json"
    if not report_file.exists():
        return None
    return load_json(str(report_file))
