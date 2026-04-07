import json
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
