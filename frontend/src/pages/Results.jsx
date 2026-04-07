import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { ArrowLeft, Download, CheckCircle2, XCircle, Clock, RefreshCw } from 'lucide-react'
import { api } from '../services/api'
import { ResultCard } from '../components/ResultCard'

function SummaryBar({ report }) {
  const pct = report.total > 0 ? Math.round((report.passed / report.total) * 100) : 0

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Resumo da execução</p>
          <p className="text-xs text-gray-400 mt-0.5">
            Ambiente: <span className="font-medium text-gray-600">{report.environment || 'default'}</span>
            {' · '}
            {new Date(report.generated_at).toLocaleString('pt-BR')}
          </p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-gray-800">{pct}%</p>
          <p className="text-xs text-gray-400">taxa de sucesso</p>
        </div>
      </div>

      {/* Barra de progresso */}
      <div className="h-2 rounded-full bg-gray-100 overflow-hidden mb-4">
        <div
          className="h-full rounded-full bg-green-500 transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="flex gap-6">
        <div className="flex items-center gap-2">
          <CheckCircle2 size={15} className="text-green-500" />
          <span className="text-sm font-semibold text-gray-700">{report.passed} PASS</span>
        </div>
        <div className="flex items-center gap-2">
          <XCircle size={15} className="text-red-500" />
          <span className="text-sm font-semibold text-gray-700">{report.failed} FAIL</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock size={15} className="text-gray-400" />
          <span className="text-sm text-gray-500">{report.total} total</span>
        </div>
      </div>
    </div>
  )
}

export function Results() {
  const location = useLocation()
  const navigate = useNavigate()
  const { runId } = useParams()

  const [report, setReport] = useState(location.state?.report ?? null)
  const [loading, setLoading] = useState(!report && !!runId)

  useEffect(() => {
    if (!report && runId) {
      setLoading(true)
      api.getResult(runId)
        .then(setReport)
        .catch(() => navigate('/history'))
        .finally(() => setLoading(false))
    }
  }, [runId])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 gap-2 text-gray-400">
        <RefreshCw size={16} className="animate-spin" />
        Carregando resultados…
      </div>
    )
  }

  if (!report) {
    return (
      <div className="max-w-3xl mx-auto py-10 px-6 text-center text-gray-400">
        <p>Nenhum resultado disponível. Execute testes no Dashboard.</p>
        <button onClick={() => navigate('/')} className="mt-4 text-brand-600 text-sm hover:underline">
          Ir para o Dashboard
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto py-10 px-6">
      {/* Topo */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(-1)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Resultados</h1>
        </div>

        <div className="flex gap-2">
          <a
            href={api.exportUrl(report.run_id, 'json')}
            download
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <Download size={13} /> JSON
          </a>
          <a
            href={api.exportUrl(report.run_id, 'csv')}
            download
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <Download size={13} /> CSV
          </a>
        </div>
      </div>

      {/* Resumo */}
      <SummaryBar report={report} />

      {/* Cards de resultado */}
      <div className="space-y-3">
        {report.results?.map((r, i) => (
          <ResultCard key={r.id ?? i} result={r} />
        ))}
      </div>
    </div>
  )
}
