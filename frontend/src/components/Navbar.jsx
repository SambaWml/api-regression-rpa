import { NavLink } from 'react-router-dom'
import { Activity, History, LayoutDashboard } from 'lucide-react'

const links = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/results', label: 'Resultados', icon: Activity },
  { to: '/history', label: 'Histórico', icon: History },
]

export function Navbar() {
  return (
    <aside className="w-56 min-h-screen bg-gray-900 flex flex-col">
      <div className="px-6 py-5 border-b border-gray-700">
        <span className="text-white font-bold text-base leading-tight">
          API Regression
          <span className="block text-brand-500 text-sm font-normal">RPA</span>
        </span>
      </div>

      <nav className="flex-1 py-4 space-y-1 px-3">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-brand-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`
            }
          >
            <Icon size={16} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="px-5 py-4 border-t border-gray-700">
        <p className="text-gray-500 text-xs">v1.0.0</p>
      </div>
    </aside>
  )
}
