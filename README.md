# API Regression RPA

Ferramenta profissional de regressão de API com comparação de baseline, histórico de execuções e interface web.

---

## Estrutura do projeto

```
api-regression-rpa/
├── backend/
│   ├── main.py                    # FastAPI — todos os endpoints REST
│   ├── requirements.txt
│   ├── config/
│   │   └── endpoints.json         # Configuração dos endpoints a testar
│   ├── baselines/
│   │   ├── users_get_by_id.json
│   │   ├── posts_get_all.json
│   │   ├── posts_create.json
│   │   ├── todos_get_by_id.json
│   │   └── user_put.json
│   ├── outputs/                   # Relatórios gerados (criado automaticamente)
│   └── src/
│       ├── runner.py              # Execução HTTP com suporte a ambientes
│       ├── comparator.py          # Comparação com DeepDiff (flexível/estrito)
│       ├── validator.py           # Validação de status, tipos, campos, tempo
│       ├── report.py              # Geração e histórico de relatórios
│       └── utils.py               # Utilitários (JSON, CSV, nested keys)
└── frontend/
    ├── index.html
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    └── src/
        ├── App.jsx
        ├── main.jsx
        ├── index.css
        ├── services/
        │   └── api.js             # Camada de comunicação com o backend
        ├── components/
        │   ├── Navbar.jsx
        │   ├── EndpointList.jsx   # Lista de endpoints com checkboxes
        │   ├── ResultCard.jsx     # Card expansível com erros e DeepDiff
        │   ├── StatusBadge.jsx    # Badge PASS / FAIL
        │   └── MethodBadge.jsx    # Badge colorido por método HTTP
        └── pages/
            ├── Dashboard.jsx      # Seleção de endpoints, ambiente, execução
            ├── Results.jsx        # Resultados com barra de progresso e exportação
            └── History.jsx        # Histórico de todas as execuções
```

---

## Pré-requisitos

- Python 3.11+
- Node.js 18+

---

## Instalação e execução

### Backend

```bash
cd backend
py -m pip install -r requirements.txt
py -m uvicorn main:app --reload --port 8000
```

Acesse a documentação interativa em: http://localhost:8000/docs

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Acesse a interface em: http://localhost:5173

---

## Endpoints do backend

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/endpoints` | Lista os endpoints configurados |
| GET | `/environments` | Lista os ambientes disponíveis |
| POST | `/run-tests` | Executa os testes selecionados |
| GET | `/results` | Lista o histórico de execuções |
| GET | `/results/{run_id}` | Retorna um relatório específico |
| GET | `/export/{run_id}?format=json\|csv` | Exporta relatório em JSON ou CSV |

### Exemplo — POST /run-tests

```json
{
  "endpoint_ids": ["users_get_by_id", "posts_create"],
  "environment": "qa"
}
```

---

## Configurando endpoints

Edite `backend/config/endpoints.json`:

```json
[
  {
    "id": "users_get_by_id",
    "name": "Get User By Id",
    "method": "GET",
    "url": "https://api.exemplo.com/users/1",
    "headers": { "Authorization": "Bearer TOKEN" },
    "body": null,
    "baseline_file": "baselines/users_get_by_id.json",
    "ignore_fields": ["createdAt", "updatedAt", "token"],
    "max_response_time_ms": 2000,
    "tags": ["users", "read"],
    "environments": {
      "dev":   "https://dev.api.exemplo.com/users/1",
      "qa":    "https://qa.api.exemplo.com/users/1",
      "stage": "https://stage.api.exemplo.com/users/1",
      "prod":  "https://api.exemplo.com/users/1"
    }
  }
]
```

---

## Configurando baselines

Cada endpoint aponta para um arquivo de baseline em `backend/baselines/`:

```json
{
  "expected_status": 200,
  "max_response_time_ms": 2000,
  "flexible_comparison": true,
  "ignore_fields": ["createdAt", "updatedAt", "token", "timestamp"],
  "required_fields": ["id", "name", "email"],
  "expected_types": {
    "id": "int",
    "name": "str",
    "email": "str"
  },
  "baseline_body": {
    "id": 1,
    "name": "Leanne Graham",
    "email": "user@example.com"
  }
}
```

### Campos da baseline

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `expected_status` | int | Status HTTP esperado |
| `max_response_time_ms` | int | Tempo máximo de resposta (ms) |
| `flexible_comparison` | bool | `true` = compara só estrutura, `false` = compara valores também |
| `ignore_fields` | list | Campos ignorados na comparação (ex: token, id, timestamp) |
| `required_fields` | list | Campos que devem estar presentes na resposta |
| `expected_types` | dict | Mapeamento de campo → tipo esperado (str, int, float, bool, list, dict) |
| `baseline_body` | dict | Corpo esperado para comparação via DeepDiff (opcional) |

---

## Fluxo de comparação

Para cada endpoint executado, o sistema valida na seguinte ordem:

1. **Conexão** — a requisição chegou ao servidor?
2. **Status code** — bate com `expected_status`?
3. **Tempo de resposta** — abaixo de `max_response_time_ms`?
4. **Campos obrigatórios** — todos os `required_fields` estão presentes?
5. **Tipos de dados** — os campos têm os tipos corretos?
6. **DeepDiff** — comparação estrutural/estrita contra `baseline_body` (se fornecido)

Qualquer falha em qualquer etapa resulta em **FAIL** com a descrição do erro.

---

## Interface web

### Dashboard
- Selecione um ou mais endpoints via checkbox
- Escolha o ambiente (default, dev, qa, stage, prod)
- Clique em **Executar testes**

### Resultados
- Taxa de sucesso com barra de progresso
- Card por endpoint com status PASS/FAIL
- Tempo de resposta com alerta de cor (verde/amarelo/vermelho)
- Erros expandíveis com descrição detalhada
- DeepDiff exibido em JSON quando disponível
- Exportação em **JSON** ou **CSV**

### Histórico
- Lista de todas as execuções ordenadas por data
- Mini barra de progresso por execução
- Clique em qualquer item para ver o relatório completo

---

## Adicionando novos endpoints

1. Adicione a entrada em `backend/config/endpoints.json`
2. Crie o arquivo de baseline em `backend/baselines/nome_do_endpoint.json`
3. Reinicie o backend (ou use `--reload`)
4. O novo endpoint aparece automaticamente na interface

---

## Exportação de relatórios

Os relatórios são armazenados automaticamente em `backend/outputs/` como JSON com UUID único.

Para exportar via interface: botão **JSON** ou **CSV** na tela de resultados.

Para exportar via API:
```
GET /export/{run_id}?format=json
GET /export/{run_id}?format=csv
```
