import axios from 'axios'

const client = axios.create({
  baseURL: '/api',
  timeout: 60000,
})

export const api = {
  // Endpoints configurados
  getEndpoints: () => client.get('/endpoints').then(r => r.data),

  // Ambientes disponíveis
  getEnvironments: () => client.get('/environments').then(r => r.data),

  // Executar testes
  runTests: (endpointIds, environment) =>
    client.post('/run-tests', { endpoint_ids: endpointIds, environment }).then(r => r.data),

  // Histórico de execuções
  listResults: () => client.get('/results').then(r => r.data),

  // Relatório específico
  getResult: (runId) => client.get(`/results/${runId}`).then(r => r.data),

  // URL de exportação (abre direto no browser)
  exportUrl: (runId, format = 'json') => `/api/export/${runId}?format=${format}`,
}
