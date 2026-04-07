import json
import csv
import io
from pathlib import Path


def load_json(path: str):
    with open(path, "r", encoding="utf-8") as file:
        return json.load(file)


def save_json(path: str, data):
    Path(path).parent.mkdir(parents=True, exist_ok=True)
    with open(path, "w", encoding="utf-8") as file:
        json.dump(data, file, indent=2, ensure_ascii=False)


def get_nested_value(data, key_path: str):
    keys = key_path.split(".")
    current = data
    for key in keys:
        if isinstance(current, dict) and key in current:
            current = current[key]
        else:
            return None
    return current


def results_to_csv(results: list) -> str:
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "name", "method", "url", "environment",
        "status", "actual_status_code", "response_time_ms", "errors"
    ])
    for r in results:
        writer.writerow([
            r.get("name", ""),
            r.get("method", ""),
            r.get("url", ""),
            r.get("environment", "default"),
            "PASS" if r.get("passed") else "FAIL",
            r.get("actual_status_code", ""),
            r.get("response_time_ms", ""),
            " | ".join(r.get("errors", []))
        ])
    return output.getvalue()
