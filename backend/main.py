import os
from pathlib import Path
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from pydantic import BaseModel

from src.utils import load_json, results_to_csv
from src.runner import execute_request
from src.comparator import compare_response
from src.report import generate_report, list_reports, get_report

BASE_DIR = Path(__file__).parent
CONFIG_PATH = BASE_DIR / "config" / "endpoints.json"

app = FastAPI(
    title="API Regression RPA",
    description="Sistema de regressão de API com comparação de baseline",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─── Models ────────────────────────────────────────────────────────────────────

class RunTestsRequest(BaseModel):
    endpoint_ids: list[str] = []   # vazio = executar todos
    environment: str = "default"


# ─── Helpers ───────────────────────────────────────────────────────────────────

def _load_endpoints() -> list:
    if not CONFIG_PATH.exists():
        return []
    return load_json(str(CONFIG_PATH))


def _resolve_baseline(endpoint: dict) -> dict | None:
    baseline_file = endpoint.get("baseline_file")
    if not baseline_file:
        return None
    path = BASE_DIR / baseline_file
    if not path.exists():
        return None
    return load_json(str(path))


# ─── Routes ────────────────────────────────────────────────────────────────────

@app.get("/")
def root():
    return {"message": "API Regression RPA — backend online", "docs": "/docs"}


@app.get("/endpoints")
def list_endpoints():
    endpoints = _load_endpoints()
    # Remove dados sensíveis antes de retornar
    return [
        {
            "id": ep.get("id"),
            "name": ep.get("name"),
            "method": ep.get("method"),
            "url": ep.get("url"),
            "tags": ep.get("tags", []),
            "environments": list(ep.get("environments", {}).keys()),
            "max_response_time_ms": ep.get("max_response_time_ms"),
        }
        for ep in endpoints
    ]


@app.get("/environments")
def list_environments():
    endpoints = _load_endpoints()
    envs = {"default"}
    for ep in endpoints:
        envs.update(ep.get("environments", {}).keys())
    return sorted(envs)


@app.post("/run-tests")
def run_tests(request: RunTestsRequest):
    endpoints = _load_endpoints()

    if not endpoints:
        raise HTTPException(status_code=404, detail="Nenhum endpoint configurado em config/endpoints.json")

    # Filtrar por IDs selecionados
    if request.endpoint_ids:
        endpoints = [ep for ep in endpoints if ep.get("id") in request.endpoint_ids]
        if not endpoints:
            raise HTTPException(status_code=404, detail="Nenhum endpoint encontrado com os IDs fornecidos")

    results = []

    for endpoint in endpoints:
        baseline = _resolve_baseline(endpoint)

        if baseline is None:
            results.append({
                "id": endpoint.get("id"),
                "name": endpoint.get("name"),
                "method": endpoint.get("method"),
                "url": endpoint.get("url"),
                "environment": request.environment,
                "passed": False,
                "actual_status_code": None,
                "response_time_ms": 0,
                "errors": [f"Arquivo de baseline não encontrado: {endpoint.get('baseline_file')}"],
                "diff": {}
            })
            continue

        # Mescla ignore_fields do endpoint com os da baseline
        endpoint_ignore = endpoint.get("ignore_fields", [])
        baseline_ignore = baseline.get("ignore_fields", [])
        merged_ignore = list(set(endpoint_ignore + baseline_ignore))
        baseline["ignore_fields"] = merged_ignore

        # Mescla max_response_time_ms do endpoint na baseline (se não definido na baseline)
        if "max_response_time_ms" not in baseline and endpoint.get("max_response_time_ms"):
            baseline["max_response_time_ms"] = endpoint["max_response_time_ms"]

        actual = execute_request(endpoint, environment=request.environment)
        comparison = compare_response(actual, baseline)

        results.append({
            "id": endpoint.get("id"),
            "name": endpoint.get("name"),
            "method": endpoint.get("method"),
            "url": actual.get("url", endpoint.get("url")),
            "environment": request.environment,
            "passed": comparison["passed"],
            "actual_status_code": actual.get("status_code"),
            "response_time_ms": actual.get("response_time_ms", 0),
            "errors": comparison["errors"],
            "diff": comparison.get("diff", {})
        })

    report = generate_report(results, environment=request.environment)
    return report


@app.get("/results")
def list_results():
    return list_reports()


@app.get("/results/{run_id}")
def get_result(run_id: str):
    report = get_report(run_id)
    if not report:
        raise HTTPException(status_code=404, detail=f"Relatório '{run_id}' não encontrado")
    return report


@app.get("/export/{run_id}")
def export_result(run_id: str, format: str = Query(default="json", enum=["json", "csv"])):
    report = get_report(run_id)
    if not report:
        raise HTTPException(status_code=404, detail=f"Relatório '{run_id}' não encontrado")

    if format == "csv":
        csv_content = results_to_csv(report["results"])
        return Response(
            content=csv_content,
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename=report_{run_id}.csv"}
        )

    import json
    return Response(
        content=json.dumps(report, indent=2, ensure_ascii=False),
        media_type="application/json",
        headers={"Content-Disposition": f"attachment; filename=report_{run_id}.json"}
    )
