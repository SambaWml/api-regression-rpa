from src.utils import load_json
from src.runner import execute_request
from src.comparator import compare_response
from src.report import generate_report


def main():
    endpoints = load_json("config/endpoints.json")
    results = []

    for endpoint in endpoints:
        print(f"Executando: {endpoint['name']}")

        baseline = load_json(endpoint["baseline_file"])
        actual = execute_request(endpoint)
        comparison = compare_response(actual, baseline)

        result = {
            "name": endpoint["name"],
            "method": endpoint["method"],
            "url": endpoint["url"],
            "actual_status": actual["status_code"],
            "response_time_ms": actual["response_time_ms"],
            "comparison": comparison
        }

        results.append(result)

        if comparison["passed"]:
            print(f"[PASS] {endpoint['name']}")
        else:
            print(f"[FAIL] {endpoint['name']}")
            for error in comparison["errors"]:
                print(f" - {error}")

    report_path = generate_report(results)
    print(f"\nRelatório gerado em: {report_path}")


if __name__ == "__main__":
    main()
