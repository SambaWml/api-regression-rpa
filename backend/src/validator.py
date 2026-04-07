from src.utils import get_nested_value

PYTHON_TYPE_MAP = {
    "str": str,
    "int": int,
    "float": float,
    "bool": bool,
    "list": list,
    "dict": dict,
    "null": type(None)
}


def validate_status_code(actual_status: int, expected_status: int) -> list[str]:
    errors = []
    if actual_status != expected_status:
        errors.append(
            f"Status code incorreto: esperado {expected_status}, recebido {actual_status}"
        )
    return errors


def validate_response_time(actual_ms: float, max_ms: float | None) -> list[str]:
    errors = []
    if max_ms and actual_ms > max_ms:
        errors.append(
            f"Tempo de resposta excedido: {actual_ms}ms (máximo permitido: {max_ms}ms)"
        )
    return errors


def validate_required_fields(body: dict | list, required_fields: list[str], ignore_fields: list[str]) -> list[str]:
    errors = []
    if not isinstance(body, dict):
        return errors

    for field in required_fields:
        if field in ignore_fields:
            continue
        value = get_nested_value(body, field)
        if value is None:
            errors.append(f"Campo obrigatório ausente: '{field}'")
    return errors


def validate_field_types(body: dict | list, expected_types: dict, ignore_fields: list[str]) -> list[str]:
    errors = []
    if not isinstance(body, dict):
        return errors

    for field, type_name in expected_types.items():
        if field in ignore_fields:
            continue

        value = get_nested_value(body, field)
        if value is None:
            continue

        expected_type = PYTHON_TYPE_MAP.get(type_name)
        if expected_type and not isinstance(value, expected_type):
            errors.append(
                f"Tipo inválido no campo '{field}': esperado {type_name}, recebido {type(value).__name__}"
            )
    return errors
