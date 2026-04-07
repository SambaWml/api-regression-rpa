import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Play, RefreshCw, AlertCircle } from 'lucide-react'
import { api } from '../services/api'
import { EndpointList } from '../components/EndpointList'

const ENVIRONMENTS = ['default', 'dev', 'qa', 'stage', 'prod']

export function Dashboard() {
  const navigate = useNavigate()
  const [endpoints, setEndpoints] = useState([])
  const [selected, setSelected] = useState([])
  const [environment, setEnvironment] = useState('default')
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    setFetching(true)
    api.getEndpoints()
      .then(data => {
        const list = Array.isArray(data) ? data : []
        setEndpoints(list)
        setSelected(list.map(e => e.id))
        if (!Array.isArray(data)) {
          setError(`Backend retornou resposta inesperada: ${JSON.stringify(data)}`)
        }
      })
      .catch(err => {
        const detail = err?.response?.data?.detail ?? err?.message ?? 'Erro desconhecido'
        setError(`Não foi possível conectar ao backend: ${detail}`)
      })
      .finally(() => setFetching(false))
  }, [])

  function toggleEndpoint(id) {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  function toggleAll() {
    setSelected(prev =>
      prev.length === endpoints.length ? [] : endpoints.map(e => e.id)
    )
  }

  async function handleRun() {
    if (selected.length === 0) return
    setLoading(true)
    setError(null)
    try {
      const report = await api.runTests(selected, environment)
      navigate('/results', { state: { report } })
    } catch (e) {
      setError(e.response?.data?.detail ?? 'Erro ao executar testes. Verifique o backend.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto py-10 px-6">
      {/* Título */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1 text-sm">
          Selecione os endpoints, escolha o ambiente e execute a regressão.
        </p>
      </div>

      {/* Erro de conexão */}
      {error && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-6">
          <AlertCircle size={16} className="text-red-500 mt-0.5 shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Seleção de ambiente */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Ambiente de execução
        </label>
        <div className="flex gap-2 flex-wrap">
          {ENVIRONMENTS.map(env => (
            <button
              key={env}
              onClick={() => setEnvironment(env)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                environment === env
                  ? 'bg-brand-600 text-white border-brand-600'
                  : 'bg-white text-gray-600 border-gray-300 hover:border-brand-400'
              }`}
            >
              {env}
            </button>
          ))}
        </div>
      </div>

      {/* Lista de endpoints */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Endpoints
        </label>
        {fetching ? (
          <div className="flex items-center gap-2 text-gray-400 text-sm py-8 justify-center">
            <RefreshCw size={16} className="animate-spin" />
            Carregando endpoints…
          </div>
        ) : (
          <EndpointList
            endpoints={endpoints}
            selected={selected}
            onToggle={toggleEndpoint}
            onToggleAll={toggleAll}
          />
        )}
      </div>

      {/* Botão executar */}
      <button
        onClick={handleRun}
        disabled={loading || selected.length === 0 || fetching}
        className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold px-6 py-3 rounded-xl transition-colors"
      >
        {loading ? (
          <>
            <RefreshCw size={16} className="animate-spin" />
            Executando…
          </>
        ) : (
          <>
            <Play size={16} />
            Executar {selected.length > 0 ? `${selected.length} endpoint${selected.length > 1 ? 's' : ''}` : 'testes'}
          </>
        )}
      </button>
    </div>
  )
}
