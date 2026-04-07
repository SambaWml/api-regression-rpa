from datetime import datetime
from src.utils import save_json


def generate_report(results: list):
    timestamp = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
    report_path = f"outputs/report_{timestamp}.json"

    summary = {
        "generated_at": timestamp,
        "total": len(results),
        "passed": sum(1 for item in results if item["comparison"]["passed"]),
        "failed": sum(1 for item in results if not item["comparison"]["passed"]),
        "results": results
    }

    save_json(report_path, summary)
    return report_path
