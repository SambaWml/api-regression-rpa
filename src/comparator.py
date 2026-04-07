from src.utils import get_nested_value


PYTHON_TYPE_MAP = {
    "str": str,
    "int": int,
    "float": float,
    "bool": bool,
    "list": list,
    "dict": dict
}


def compare_response(actual: dict, baseline: dict) -> dict:
    result = {
        "passed": True,
        "errors": []
    }

    expected_status = baseline.get("expected_status")
    required_fields = baseline.get("required_fields", [])
    expected_types = baseline.get("expected_types", {})

    if actual["status_code"] != expected_status:
        result["passed"] = False
        result["errors"].append(
            f"Status code diferente: esperado {expected_status}, recebido {actual['status_code']}"
        )

    body = actual["response_body"]

    if not isinstance(body, dict):
        result["passed"] = False
        result["errors"].append("Response body não é um JSON de objeto válido para comparação.")
        return result

    for field in required_fields:
        value = get_nested_value(body, field)
        if value is None:
            result["passed"] = False
            result["errors"].append(f"Campo obrigatório ausente: {field}")

    for field, expected_type_name in expected_types.items():
        value = get_nested_value(body, field)
        expected_type = PYTHON_TYPE_MAP.get(expected_type_name)

        if value is None:
            continue

        if expected_type and not isinstance(value, expected_type):
            result["passed"] = False
            result["errors"].append(
                f"Tipo inválido no campo '{field}': esperado {expected_type_name}, recebido {type(value).__name__}"
            )

    return result
