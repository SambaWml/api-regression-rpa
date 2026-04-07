import axios from 'axios'

// Dev:  Vite proxy (/api → localhost:8000)
// Prod: Vercel api/ directory serverless function (/api/* → api/index.py)
const BASE_URL = import.meta.env.VITE_API_URL ?? '/api'

const client = axios.create({
  baseURL: BASE_URL,
  timeout: 60000,
})

// Detecta HTML no lugar de JSON e lança erro descritivo
client.interceptors.response.use(
  (response) => {
    const ct = response.headers['content-type'] ?? ''
    if (ct.includes('text/html')) {
      throw new Error(
        `Expected JSON from API but received HTML — ` +
        `URL: ${response.config.baseURL}${response.config.url} — ` +
        `Check API route/proxy/deployment config.`
      )
    }
    return response
  },
  (error) => Promise.reject(error)
)

export const api = {
  getEndpoints:    () => client.get('/endpoints').then(r => r.data),
  getEnvironments: () => client.get('/environments').then(r => r.data),
  runTests: (endpointIds, environment) =>
    client.post('/run-tests', { endpoint_ids: endpointIds, environment }).then(r => r.data),
  listResults: ()      => client.get('/results').then(r => r.data),
  getResult:   (runId) => client.get(`/results/${runId}`).then(r => r.data),
  exportUrl:   (runId, format = 'json') => `${BASE_URL}/export/${runId}?format=${format}`,
}
