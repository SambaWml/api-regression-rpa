import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { RefreshCw, CheckCircle2, XCircle, ChevronRight, Clock } from 'lucide-react'
import { api } from '../services/api'

export function History() {
  const navigate = useNavigate()
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)

  function load() {
    setLoading(true)
    api.listResults()
      .then(data => setReports(Array.isArray(data) ? data : []))
      .catch(() => setReports([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  return (
    <div className="max-w-3xl mx-auto py-10 px-6">
      {/* Topo */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Histórico</h1>
          <p className="text-gray-500 text-sm mt-1">Todas as execuções anteriores</p>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 disabled:opacity-50 transition-colors"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Atualizar
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16 gap-2 text-gray-400">
          <RefreshCw size={16} className="animate-spin" />
          Carregando histórico…
        </div>
      ) : reports.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-sm">Nenhuma execução encontrada.</p>
          <button onClick={() => navigate('/')} className="mt-3 text-brand-600 text-sm hover:underline">
            Executar o primeiro teste
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {reports.map(r => {
            const pct = r.total > 0 ? Math.round((r.passed / r.total) * 100) : 0
            const allPassed = r.failed === 0

            return (
              <button
                key={r.run_id}
                onClick={() => navigate(`/results/${r.run_id}`)}
                className="w-full flex items-center gap-4 bg-white border border-gray-200 rounded-xl px-4 py-3 hover:border-brand-300 hover:shadow-sm transition-all text-left"
              >
                {/* Ícone status geral */}
                {allPassed
                  ? <CheckCircle2 size={18} className="text-green-500 shrink-0" />
                  : <XCircle size={18} className="text-red-500 shrink-0" />
                }

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800">
                    {new Date(r.generated_at).toLocaleString('pt-BR')}
                  </p>
                  <div className="flex items-center gap-3 mt-0.5 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <Clock size={11} />
                      {r.environment}
                    </span>
                    <span className="text-green-600 font-medium">{r.passed} PASS</span>
                    {r.failed > 0 && (
                      <span className="text-red-600 font-medium">{r.failed} FAIL</span>
                    )}
                    <span>{r.total} total</span>
                  </div>
                </div>

                {/* Mini barra */}
                <div className="w-20 shrink-0">
                  <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-green-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-400 text-right mt-0.5">{pct}%</p>
                </div>

                <ChevronRight size={15} className="text-gray-300 shrink-0" />
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
