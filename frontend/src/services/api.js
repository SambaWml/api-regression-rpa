import axios from 'axios'

// Em desenvolvimento, o Vite proxy redireciona /api → localhost:8000
// Em produção no Vercel, o rewrite mapeia /api/* → /_/backend/*
const BASE_URL = import.meta.env.VITE_API_URL ?? '/api'

const client = axios.create({
  baseURL: BASE_URL,
  timeout: 60000,
})

export const api = {
  getEndpoints:  () => client.get('/endpoints').then(r => r.data),
  getEnvironments: () => client.get('/environments').then(r => r.data),
  runTests: (endpointIds, environment) =>
    client.post('/run-tests', { endpoint_ids: endpointIds, environment }).then(r => r.data),
  listResults: () => client.get('/results').then(r => r.data),
  getResult:   (runId) => client.get(`/results/${runId}`).then(r => r.data),
  exportUrl:   (runId, format = 'json') => `${BASE_URL}/export/${runId}?format=${format}`,
}
