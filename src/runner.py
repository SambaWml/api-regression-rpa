import time
import requests


def execute_request(endpoint_config: dict) -> dict:
    method = endpoint_config["method"].upper()
    url = endpoint_config["url"]
    headers = endpoint_config.get("headers", {})
    body = endpoint_config.get("body")

    start = time.time()

    response = requests.request(
        method=method,
        url=url,
        headers=headers,
        json=body,
        timeout=30
    )

    elapsed_ms = round((time.time() - start) * 1000, 2)

    try:
        response_body = response.json()
    except Exception:
        response_body = response.text

    return {
        "status_code": response.status_code,
        "response_body": response_body,
        "response_time_ms": elapsed_ms
    }
