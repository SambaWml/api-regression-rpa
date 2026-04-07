from deepdiff import DeepDiff
from src.validator import (
    validate_status_code,
    validate_response_time,
    validate_required_fields,
    validate_field_types,
)


def _build_exclude_paths(ignore_fields: list[str]) -> set:
    paths = set()
    for field in ignore_fields:
        paths.add(f"root['{field}']")
        paths.add(f"root[\"{field}\"]")
    return paths


def _format_deepdiff(diff: DeepDiff) -> list[str]:
    messages = []

    for change_type, changes in diff.items():
        if change_type == "dictionary_item_added":
            for path in changes:
                messages.append(f"Campo extra na resposta: {path}")

        elif change_type == "dictionary_item_removed":
            for path in changes:
                messages.append(f"Campo ausente na resposta: {path}")

        elif change_type == "type_changes":
            for path, change in changes.items():
                messages.append(
                    f"Tipo alterado em '{path}': era {change['old_type'].__name__}, agora é {change['new_type'].__name__}"
                )

        elif change_type == "values_changed":
            for path, change in changes.items():
                messages.append(
                    f"Valor alterado em '{path}': era '{change['old_value']}', agora é '{change['new_value']}'"
                )

        elif change_type == "iterable_item_added":
            messages.append(f"Itens adicionados na lista: {len(changes)} item(s)")

        elif change_type == "iterable_item_removed":
            messages.append(f"Itens removidos da lista: {len(changes)} item(s)")

    return messages


def compare_response(actual: dict, baseline: dict) -> dict:
    result = {
        "passed": True,
        "errors": [],
        "diff": {}
    }

    ignore_fields = baseline.get("ignore_fields", [])
    flexible = baseline.get("flexible_comparison", True)

    # 1. Falha de conexão/timeout
    if not actual.get("success"):
        result["passed"] = False
        result["errors"].append(f"Falha na requisição: {actual.get('error', 'Erro desconhecido')}")
        return result

    # 2. Status code
    errors = validate_status_code(actual["status_code"], baseline.get("expected_status", 200))
    if errors:
        result["passed"] = False
        result["errors"].extend(errors)

    # 3. Tempo de resposta
    errors = validate_response_time(actual["response_time_ms"], baseline.get("max_response_time_ms"))
    if errors:
        result["passed"] = False
        result["errors"].extend(errors)

    body = actual["response_body"]

    # 4. Campos obrigatórios
    errors = validate_required_fields(body, baseline.get("required_fields", []), ignore_fields)
    if errors:
        result["passed"] = False
        result["errors"].extend(errors)

    # 5. Tipos de dados
    errors = validate_field_types(body, baseline.get("expected_types", {}), ignore_fields)
    if errors:
        result["passed"] = False
        result["errors"].extend(errors)

    # 6. DeepDiff contra baseline_body (se fornecido)
    baseline_body = baseline.get("baseline_body")
    if baseline_body and isinstance(body, (dict, list)):
        exclude_paths = _build_exclude_paths(ignore_fields)

        if flexible:
            # Modo flexível: apenas compara estrutura (chaves existentes), não valores
            actual_keys = set(body.keys()) if isinstance(body, dict) else set()
            baseline_keys = set(baseline_body.keys()) if isinstance(baseline_body, dict) else set()
            baseline_keys -= set(ignore_fields)

            missing = baseline_keys - actual_keys
            extra = actual_keys - baseline_keys - set(ignore_fields)

            for field in missing:
                result["passed"] = False
                result["errors"].append(f"Chave ausente na resposta (modo flexível): '{field}'")

            for field in extra:
                result["errors"].append(f"Chave extra na resposta (modo flexível): '{field}'")
        else:
            # Modo estrito: compara valores também
            diff = DeepDiff(
                baseline_body,
                body,
                ignore_order=True,
                exclude_paths=exclude_paths
            )

            if diff:
                diff_messages = _format_deepdiff(diff)
                result["passed"] = False
                result["errors"].extend(diff_messages)
                result["diff"] = diff.to_dict()

    return result
