import time
import requests


def execute_request(endpoint_config: dict, environment: str = "default") -> dict:
    method = endpoint_config["method"].upper()
    headers = dict(endpoint_config.get("headers", {}))
    body = endpoint_config.get("body")

    # Resolve URL for the given environment
    environments = endpoint_config.get("environments", {})
    if environment in environments:
        url = environments[environment]
    else:
        url = endpoint_config["url"]

    start = time.time()

    try:
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
            "success": True,
            "status_code": response.status_code,
            "response_body": response_body,
            "response_time_ms": elapsed_ms,
            "url": url,
            "error": None
        }

    except requests.exceptions.ConnectionError as e:
        elapsed_ms = round((time.time() - start) * 1000, 2)
        return {
            "success": False,
            "status_code": None,
            "response_body": None,
            "response_time_ms": elapsed_ms,
            "url": url,
            "error": f"Erro de conexão: {str(e)}"
        }
    except requests.exceptions.Timeout:
        elapsed_ms = round((time.time() - start) * 1000, 2)
        return {
            "success": False,
            "status_code": None,
            "response_body": None,
            "response_time_ms": elapsed_ms,
            "url": url,
            "error": "Timeout: requisição excedeu 30 segundos"
        }
    except Exception as e:
        elapsed_ms = round((time.time() - start) * 1000, 2)
        return {
            "success": False,
            "status_code": None,
            "response_body": None,
            "response_time_ms": elapsed_ms,
            "url": url,
            "error": f"Erro inesperado: {str(e)}"
        }
