import { useState } from 'react'
import { ChevronDown, ChevronUp, Clock, Globe } from 'lucide-react'
import { StatusBadge } from './StatusBadge'
import { MethodBadge } from './MethodBadge'

export function ResultCard({ result }) {
  const [expanded, setExpanded] = useState(!result.passed)

  const timeColor =
    result.response_time_ms > 2000
      ? 'text-red-600'
      : result.response_time_ms > 1000
      ? 'text-yellow-600'
      : 'text-green-600'

  return (
    <div className={`rounded-xl border ${result.passed ? 'border-gray-200' : 'border-red-200 bg-red-50/30'}`}>
      {/* Header */}
      <div
        className="flex items-center gap-3 px-4 py-3 cursor-pointer select-none"
        onClick={() => setExpanded(v => !v)}
      >
        <StatusBadge passed={result.passed} />
        <MethodBadge method={result.method} />

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-800">{result.name}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <Globe size={11} className="text-gray-400" />
            <p className="text-xs text-gray-400 font-mono truncate">{result.url}</p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs">
          {result.actual_status_code && (
            <span className="font-mono text-gray-500">
              HTTP {result.actual_status_code}
            </span>
          )}
          {result.response_time_ms != null && (
            <span className={`flex items-center gap-1 font-medium ${timeColor}`}>
              <Clock size={12} />
              {result.response_time_ms}ms
            </span>
          )}
        </div>

        <button className="text-gray-400 ml-1">
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>

      {/* Body expandido */}
      {expanded && (
        <div className="border-t border-gray-100 px-4 py-3">
          {result.errors?.length > 0 ? (
            <ul className="space-y-1">
              {result.errors.map((err, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-red-700">
                  <span className="mt-0.5 text-red-400">•</span>
                  <span>{err}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-green-700 font-medium">
              Todos os critérios passaram com sucesso.
            </p>
          )}

          {result.diff && Object.keys(result.diff).length > 0 && (
            <div className="mt-3">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                DeepDiff
              </p>
              <pre className="bg-gray-900 text-green-400 text-xs rounded-lg p-3 overflow-auto max-h-48">
                {JSON.stringify(result.diff, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
