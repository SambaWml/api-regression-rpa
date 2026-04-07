import { MethodBadge } from './MethodBadge'

export function EndpointList({ endpoints, selected, onToggle, onToggleAll }) {
  const allSelected = endpoints.length > 0 && selected.length === endpoints.length

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 border-b border-gray-200">
        <input
          type="checkbox"
          checked={allSelected}
          onChange={onToggleAll}
          className="w-4 h-4 rounded accent-brand-600 cursor-pointer"
        />
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
          Endpoint ({selected.length}/{endpoints.length} selecionados)
        </span>
      </div>

      {/* Lista */}
      {endpoints.length === 0 ? (
        <div className="px-4 py-8 text-center text-gray-400 text-sm">
          Nenhum endpoint encontrado. Verifique o backend.
        </div>
      ) : (
        <ul className="divide-y divide-gray-100">
          {endpoints.map((ep) => {
            const isSelected = selected.includes(ep.id)
            return (
              <li
                key={ep.id}
                onClick={() => onToggle(ep.id)}
                className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${
                  isSelected ? 'bg-brand-50' : 'hover:bg-gray-50'
                }`}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => onToggle(ep.id)}
                  onClick={e => e.stopPropagation()}
                  className="w-4 h-4 rounded accent-brand-600 cursor-pointer"
                />
                <MethodBadge method={ep.method} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{ep.name}</p>
                  <p className="text-xs text-gray-400 font-mono truncate">{ep.url}</p>
                </div>
                {ep.tags?.length > 0 && (
                  <div className="hidden sm:flex gap-1">
                    {ep.tags.map(tag => (
                      <span key={tag} className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
