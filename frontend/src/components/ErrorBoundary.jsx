import { Component } from 'react'

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-6">
          <div className="max-w-lg w-full bg-white border border-red-200 rounded-2xl p-8 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-red-500 mb-2">
              Erro de aplicação
            </p>
            <h1 className="text-lg font-bold text-gray-900 mb-4">
              Algo deu errado ao renderizar a página
            </h1>
            <pre className="bg-gray-900 text-red-400 text-xs rounded-lg p-4 overflow-auto whitespace-pre-wrap break-all">
              {this.state.error.message}
              {'\n\n'}
              {this.state.error.stack}
            </pre>
            <button
              onClick={() => window.location.reload()}
              className="mt-6 px-4 py-2 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-700 transition-colors"
            >
              Recarregar
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
